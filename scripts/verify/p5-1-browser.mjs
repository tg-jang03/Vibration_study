// M5.0 P5-1 browser regression. Use an isolated QA Edge session only.
// node scripts/verify/p5-1-browser.mjs <debug-port> <preview-url> [screenshot-directory]
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
const capture = async (name, full = false) => {
  const m = await send('Page.getLayoutMetrics');
  const r = await send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: full,
    ...(full ? {clip: {x: 0, y: 0, width: 1100, height: Math.ceil(m.cssContentSize.height), scale: 1}} : {}),
  });
  await mkdir(outDir, {recursive: true});
  await writeFile(path.join(outDir, name + '.png'), Buffer.from(r.data, 'base64'));
};
const slider = async (index, value) => {
  await evaluate("(()=>{const e=" + lab + ".querySelectorAll('input[type=range]')[" + index + "];Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'" + value + "');e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()");
};
const currentFrequency = () => evaluate(lab + ".querySelector('.js-plotly-plot').data[2].y[0]");
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {width: 1100, height: 1500, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url});
  await until("document.querySelector('article')");
  await evaluate(lab + ".scrollIntoView({block:'start'})");
  await until(lab + "?.querySelector('.js-plotly-plot')");
  await until("!document.querySelector('astro-island').hasAttribute('ssr')");
  await until("document.fonts.status === 'loaded'");
  const captions = await evaluate("Array.from(document.querySelectorAll('article figcaption')).map(e=>e.textContent.trim())");
  assert.equal(captions.length, 7);
  captions.forEach((s, i) => assert(s.startsWith('그림 ' + (i + 1) + '.'), s));
  assert.equal(await evaluate("document.querySelectorAll('article .katex-error').length"), 0);
  assert.equal(await evaluate("document.querySelector('article').textContent.includes('**')"), false);
  const links = await evaluate("Array.from(document.querySelectorAll('article a')).map(a=>a.href).filter(h=>new URL(h).origin===location.origin)");
  for (const href of new Set(links)) {
    const parsed = new URL(href), response = await fetch(parsed);
    assert.equal(response.status, 200, href);
    assert(parsed.pathname.startsWith('/Vibration_study/'), href);
    if (parsed.hash) {
      const html = await response.text(), id = decodeURIComponent(parsed.hash.slice(1));
      assert(html.includes('id="' + id + '"'), href);
    }
  }
  assert(Math.abs(await currentFrequency() - 10.0658424209) < 1e-8);
  const readouts = await evaluate("Array.from(document.querySelectorAll('.readout-table tbody tr')).map(r=>r.textContent)");
  assert(readouts.some(r => r.includes('0.4 MN/m')));
  await capture('p5-1-full', true);
  await capture('p5-1-lab');
  await slider(0, 0.25);
  await until(lab + ".querySelector('.js-plotly-plot').data[2].x[0]===0.25");
  assert(Math.abs(await currentFrequency() - Math.sqrt(20000/11)/(2*Math.PI)) < 1e-8);
  await slider(0, 4);
  await until(lab + ".querySelector('.js-plotly-plot').data[2].x[0]===4");
  assert(Math.abs(await currentFrequency() - Math.sqrt((4e6/7)/100)/(2*Math.PI)) < 1e-8);
  await evaluate(lab + ".querySelector('button').click()");
  await until(lab + ".querySelector('.js-plotly-plot').data[2].x[0]===1");
  await slider(1, 200);
  await until(lab + ".querySelector('.js-plotly-plot').data[2].y[0]<8");
  assert(Math.abs(await currentFrequency() - 10.0658424209/Math.SQRT2) < 1e-8);
  for (const [index, value] of [[0,0.1],[0,10],[1,50],[1,200]]) {
    await slider(index, value);
    await sleep(200);
    assert(Number.isFinite(await currentFrequency()));
  }
  await evaluate(lab + ".querySelector('button').click()");
  await until(lab + ".querySelector('.js-plotly-plot').data[2].y[0]>10");
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: false});
  await sleep(400);
  await evaluate(lab + ".scrollIntoView({block:'start'})");
  await capture('p5-1-mobile');
  assert(await evaluate("document.documentElement.scrollWidth <= innerWidth"), 'mobile horizontal overflow');
  await send('Emulation.setDeviceMetricsOverride', {width: 1100, height: 1500, deviceScaleFactor: 1, mobile: false});
  const galleryUrl = new URL('../dev/figures/', url).href;
  await send('Page.navigate', {url: galleryUrl});
  await until("document.getElementById('p5-1')");
  await evaluate("document.getElementById('p5-1').scrollIntoView()");
  await sleep(300);
  assert.equal(await evaluate("document.querySelectorAll('figure[id^=fig-p5-1]').length"), 7);
  await capture('p5-1-gallery');
  assert.deepEqual(errors, [], 'console/hydration errors');
  console.log('PASS: 7 figures, captions, all links/anchors, analytic lab values, sliders/reset/extremes, 390px width, gallery, hydration');
} finally {
  await send('Browser.close').catch(() => {});
  ws.close();
}

