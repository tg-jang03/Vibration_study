// M5.1 P5-2 browser regression.
// node scripts/verify/p5-2-browser.mjs <debug-port> <preview-url> [screenshot-directory]
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [port, url, outDir = 'dist/qa'] = process.argv.slice(2);
assert(port && url, 'debug port and preview URL required');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let page;
for (let i = 0; i < 40 && !page; i++) {
  try {
    page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
  } catch {}
  if (!page) await sleep(100);
}
assert(page, 'inspection browser not found');

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let nextId = 0;
const pending = new Map();
const errors = [];

ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(JSON.stringify(m.error)));
    else resolve(m.result);
  }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(JSON.stringify(m.params.args));
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result?.value;
};

const until = async (expression) => {
  for (let i = 0; i < 100; i++) {
    if (await evaluate('Boolean(' + expression + ')')) return;
    await sleep(100);
  }
  throw new Error(`Timed out: ${expression}`);
};

const lab = "document.querySelector('.lab-frame')";

const capture = async (name, full = false) => {
  const m = await send('Page.getLayoutMetrics');
  const r = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: full,
    ...(full ? { clip: { x: 0, y: 0, width: 1100, height: Math.ceil(m.cssContentSize.height), scale: 1 } } : {}),
  });
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, name + '.png'), Buffer.from(r.data, 'base64'));
};

try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1500, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await until("document.querySelector('article')");

  // 1. 본문 검사
  const captions = await evaluate("Array.from(document.querySelectorAll('article figcaption')).map(e=>e.textContent.trim())");
  assert.equal(captions.length, 7, 'Must have 7 figures');
  captions.forEach((s, i) => assert(s.startsWith('그림 ' + (i + 1) + '.'), `Caption ${i + 1} must start with 그림 ${i + 1}.`));

  assert.equal(await evaluate("document.querySelectorAll('article .katex-error').length"), 0, 'No KaTeX errors');
  assert.equal(await evaluate("document.querySelector('article').textContent.includes('**')"), false, 'No unparsed markdown **');

  // 2. 내부 링크 검사
  const links = await evaluate("Array.from(document.querySelectorAll('article a')).map(a=>a.href).filter(h=>new URL(h).origin===location.origin)");
  for (const href of new Set(links)) {
    const parsed = new URL(href);
    const response = await fetch(parsed);
    assert.equal(response.status, 200, href);
    assert(parsed.pathname.startsWith('/Vibration_study/'), href);
  }

  // 3. 랩 컴포넌트 스크롤 및 hydration 검사
  await evaluate(lab + ".scrollIntoView({block:'start'})");
  await until(lab + "?.querySelector('.js-plotly-plot')");
  await until("!document.querySelector('astro-island').hasAttribute('ssr')");
  await until("document.fonts.status === 'loaded'");

  // 4. 초기 읽음값 검증
  const readouts = await evaluate("Array.from(document.querySelectorAll('.readout-table tbody tr')).map(r=>r.textContent)");
  assert(readouts.some((r) => r.includes('3000') && r.includes('rpm')), 'Peak rpm readout');
  assert(readouts.some((r) => r.includes('100') && r.includes('µm pp')), 'Peak amp readout');
  assert(readouts.some((r) => r.includes('9.84') || r.includes('9.8')), 'AF readout');
  assert(readouts.some((r) => r.includes('16.7%') || r.includes('16.7 %') || r.includes('16.67')), 'SM readout');

  await capture('p5-2-full', true);
  await capture('p5-2-lab');

  // 5. 표시 모드 전환 (Polar & Both)
  const selectView = async (idx) => {
    await evaluate(`(()=>{
      const s = Array.from(${lab}.querySelectorAll('select')).find(el => el.innerHTML.includes('Bode 플롯'));
      if (s) {
        Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, '${idx}');
        s.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(400);
  };

  await selectView('1');
  await until(lab + "?.querySelector('.polar-plot')");
  await capture('p5-2-polar');

  await selectView('2');
  await until(lab + "?.querySelector('.polar-plot')");
  await until(lab + "?.querySelector('.js-plotly-plot')");

  // 6. 리셋 버튼 동작
  const resetBtn = `${lab}.querySelector('button')`;
  await evaluate(resetBtn + '.click()');
  await sleep(200);

  // 7. 모바일 390px 뷰포트 넘침 검사
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  await evaluate(lab + ".scrollIntoView({block:'start'})");
  await capture('p5-2-mobile');
  assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Mobile horizontal overflow detected');

  // 8. 개발용 갤러리(/dev/figures/)에서 P5-2 그림 7개 확인
  await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1500, deviceScaleFactor: 1, mobile: false });
  const galleryUrl = new URL('../dev/figures/', url).href;
  await send('Page.navigate', { url: galleryUrl });
  await until("document.getElementById('p5-2')");
  await evaluate("document.getElementById('p5-2').scrollIntoView()");
  await sleep(300);
  assert.equal(await evaluate("document.querySelectorAll('figure[id^=fig-p5-2]').length"), 7, '7 figures in gallery');
  await capture('p5-2-gallery');

  // 9. 콘솔 오류 없음 확인
  assert.deepEqual(errors, [], 'No console or hydration errors');

  console.log('PASS: P5-2 7 figures, captions, internal links, initial lab readouts, view modes, mobile 390px, gallery, 0 errors');
} finally {
  await send('Browser.close').catch(() => {});
  ws.close();
}
