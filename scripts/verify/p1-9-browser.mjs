// LAB-SRC-01 브라우저 회귀 검사. scripts/bench/plot-bench.mjs와 같은 Edge CDP 방식.
// 빌드·preview 후 검사 전용 헤드리스 Edge를 --remote-debugging-port=<port>로 실행:
// node scripts/verify/p1-9-browser.mjs <port> <preview-url> [screenshot-directory]
// 연결한 브라우저를 닫으므로 실사용 브라우저에는 연결하지 않는다.
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
  for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await sleep(100); }
  throw new Error(`Timed out: ${expression}`);
};
const lab = "document.querySelector('.lab-frame')";
const click = (text) => evaluate(`Array.from(${lab}.querySelectorAll('button')).find(b=>b.textContent==='${text}').click()`);
const toggle = (text) => evaluate(`Array.from(${lab}.querySelectorAll('.param-toggle label')).find(l=>l.textContent==='${text}').querySelector('input').click()`);
const screenshot = async (name) => {
  await evaluate(`${lab}.scrollIntoView({block:'start'})`);
  await sleep(250);
  const r = await send('Page.captureScreenshot', { format: 'png' });
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, `${name}.png`), Buffer.from(r.data, 'base64'));
};
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1500, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await until(`${lab}?.querySelector('input')`);
  await evaluate(`${lab}.scrollIntoView()`);
  await until(`${lab}.querySelectorAll('.js-plotly-plot').length === 4`);
  assert.equal(await evaluate(`${lab}.querySelectorAll('input[type=range]').length`), 7);
  const original = await evaluate(`${lab}.querySelectorAll('.js-plotly-plot')[3].data[0].y`);
  assert(await evaluate(`${lab}.textContent.includes('600 Hz')`));
  await toggle('원인 가리기');
  await until(`${lab}.querySelectorAll('.js-plotly-plot').length === 1`);
  assert.equal(await evaluate(`${lab}.querySelectorAll('input[type=range]').length`), 0);
  assert.equal(await evaluate(`${lab}.querySelectorAll('.lab-results, .lab-tasks').length`), 0);
  assert.deepEqual(await evaluate(`${lab}.querySelector('.js-plotly-plot').data[0].y`), original);
  await click('나눠 보기');
  await until(`${lab}.querySelectorAll('.js-plotly-plot').length === 2`);
  const bars = await evaluate(`(()=>{const d=${lab}.querySelectorAll('.js-plotly-plot')[1].data[0];return [50,100,600].map(f=>d.y[d.x.indexOf(f)])})()`);
  [40, 20, 10].forEach((a, i) => assert(Math.abs(bars[i] - a) < 1e-6));
  await screenshot('p1-9-hidden-spectrum');
  await toggle('원인 가리기');
  await until(`${lab}.querySelectorAll('input[type=range]').length === 7`);
  await evaluate(`(()=>{const e=${lab}.querySelector('input[type=range]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'3600');e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await until(`${lab}.querySelector('.readout-table').textContent.includes('720 Hz')`);
  await toggle('날개 통과 응답');
  await until(`${lab}.querySelectorAll('.js-plotly-plot').length === 4`);
  assert(await evaluate(`(()=>{const d=${lab}.querySelectorAll('.js-plotly-plot')[3].data[0];return !d.x.includes(720)})()`));
  await toggle('충격 뒤 구조 울림');
  await toggle('잡음');
  await until(`${lab}.querySelectorAll('.js-plotly-plot').length === 6`);
  await click('처음 값으로');
  await until(`${lab}.querySelectorAll('.js-plotly-plot').length === 4 && ${lab}.querySelector('.readout-table').textContent.includes('600 Hz')`);
  assert.deepEqual(await evaluate(`${lab}.querySelectorAll('.js-plotly-plot')[3].data[0].y`), original);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await sleep(300);
  assert(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'mobile horizontal overflow');
  await toggle('원인 가리기');
  await click('나눠 보기');
  await until(`${lab}.querySelectorAll('.js-plotly-plot').length === 2`);
  await screenshot('p1-9-mobile');
  assert.deepEqual(errors, [], 'browser errors / hydration errors');
  console.log('PASS: hiding, spectrum amplitudes, rpm, source toggles, reset, mobile width, console/hydration');
} finally {
  await send('Browser.close').catch(() => {});
  ws.close();
}
