// M2.9 P2-1 화면·링크·LAB-BAS-02 검사. 빌드와 preview 실행 후:
// node scripts/verify/p2-1-browser.mjs <debug-port> <preview-url> [screenshot-directory]
// 검사 전용 Edge만 연결한다. 완료 후 해당 브라우저를 닫는다.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const [port, url, outDir = 'dist/qa'] = process.argv.slice(2);
assert(port && url, 'debug port and preview URL required');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let page;
for (let i = 0; i < 40 && !page; i++) {
  try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
  if (!page) await sleep(100);
}
assert(page, 'inspection browser not found');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 0;
const pending = new Map(), errors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result);
  }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(JSON.stringify(m.params.args));
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
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
  for (let i = 0; i < 100; i++) { if (await evaluate('Boolean(' + expression + ')')) return; await sleep(100); }
  throw new Error(`Timed out: ${expression}`);
};

const lab = "document.querySelector('.lab-frame')";
const table = async () => evaluate("Array.from(document.querySelectorAll('.readout-table tr')).map(r=>r.textContent.trim())");
const waveform = async () => evaluate(lab + ".querySelector('.js-plotly-plot').data[0].y");
const stats = (x) => {
  const pk = Math.max(...x.map(Math.abs)), r = Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length);
  return { pk, rms: r, cf: pk / r };
};
const choose = async (value) => {
  const index = ['sine', 'twoSines', 'square', 'impulsive'].indexOf(value);
  await evaluate("(()=>{const e=" + lab + ".querySelector('select');e.value='" + index + "';e.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await sleep(500);
};
const capture = async (name, full = false) => {
  const dimensions = await send('Page.getLayoutMetrics');
  const r = await send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: full,
    ...(full ? {clip: {x: 0, y: 0, width: 1100, height: Math.ceil(dimensions.cssContentSize.height), scale: 1}} : {}),
  });
  await mkdir(outDir, {recursive: true});
  await writeFile(path.join(outDir, name + '.png'), Buffer.from(r.data, 'base64'));
};
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {width: 1100, height: 1500, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url});
  await until(lab + "?.querySelector('.js-plotly-plot')");
  await until("document.querySelector('astro-island') && !document.querySelector('astro-island').hasAttribute('ssr')");
  await until("document.fonts.status === 'loaded'");
  assert.equal(await evaluate("document.querySelectorAll('article figure').length"), 7);
  const captions = await evaluate("Array.from(document.querySelectorAll('article figcaption')).map(e=>e.textContent.trim())");
  captions.forEach((s, i) => assert(s.startsWith('그림 ' + (i + 1) + '.'), s));
  assert.equal(await evaluate("document.querySelectorAll('article .katex-error').length"), 0);
  assert.equal(await evaluate("document.querySelector('article').textContent.includes('**')"), false);
  // withBase 경로와 같은 페이지의 fragment가 실제로 존재하는지 함께 확인한다.
  const links = await evaluate("Array.from(document.querySelectorAll('article a')).map(a=>a.href).filter(h=>new URL(h).origin===location.origin)");
  for (const href of new Set(links)) {
    const parsed = new URL(href), response = await fetch(parsed);
    assert.equal(response.status, 200, href);
    assert(parsed.pathname.startsWith('/Vibration_study/'), href);
    if (parsed.hash) {
      const html = await response.text(), id = decodeURIComponent(parsed.hash.slice(1));
      assert(html.includes('id="' + id + '"'), 'anchor missing: ' + href);
    }
  }
  await evaluate(lab + ".scrollIntoView({block:'start'})");
  const base = stats(await waveform());
  assert(Math.abs(base.rms - 0.707) < 0.001);
  assert(Math.abs(base.cf - 1.41) < 0.01);
  await capture('p2-1-full', true);
  await capture('p2-1-lab');
  for (const [shape, r, cf] of [['twoSines', 0.516, 1.94], ['square', 1, 1], ['impulsive', 0.136, 7.36]]) {
    await choose(shape);
    const s = stats(await waveform());
    assert(Math.abs(s.pk - 1) < 1e-10);
    assert(Math.abs(s.rms - r) < 0.001, shape + ': rms ' + s.rms);
    assert(Math.abs(s.cf - cf) < 0.02, shape + ': cf ' + s.cf);
    const rows = await table();
    assert(rows.some(row => row.includes('RMS (직접 계산)')));
    if (shape === 'impulsive') {
      assert(rows.some(row => row.includes('환산값의 오차') && row.includes('420')));
      await capture('p2-1-impulsive');
    }
  }
  const beforeScale = stats(await waveform());
  await evaluate("(()=>{const e=" + lab + ".querySelector('input[type=range]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'2');e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await until(lab + ".querySelector('.js-plotly-plot').data[0].y.some(v=>Math.abs(v)>1.5)");
  const scaled = stats(await waveform());
  assert(Math.abs(scaled.rms / beforeScale.rms - 2) < 1e-10);
  assert(Math.abs(scaled.cf - beforeScale.cf) < 1e-10);
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: false});
  await sleep(300);
  await evaluate(lab + ".scrollIntoView({block:'start'})");
  await capture('p2-1-mobile');
  const overflow = await evaluate("Array.from(document.querySelectorAll('article *')).filter(e=>!(e instanceof SVGElement) && !e.closest('.fig-scroll,.katex,.plot,.formula') && e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,90),right:e.getBoundingClientRect().right}))");
  assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'mobile horizontal overflow: ' + JSON.stringify(overflow));
  assert.deepEqual(errors, [], 'console/hydration errors');
  console.log('PASS: 7 figures, sequential captions, all links/anchors, four shapes, RMS/CF, scale, mobile width, hydration');
} finally {
  await send('Browser.close').catch(() => {});
  ws.close();
}
