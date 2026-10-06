// 페이지 점검 (D-038): 헤드리스 Edge(CDP)로 페이지를 열어 랩 hydration·콘솔 오류·HTTP 오류·모바일 가로 넘침을 보고,
// 전체 페이지를 1500px씩 잘라 PNG로 저장한다. 매번 캡처·검사 스크립트를 새로 쓰지 않기 위한 공용 도구.
//
// 사용: 먼저 `npm run build` → `npx astro preview` (기본 http://localhost:4321)
//   npm run verify:page -- /p3-5/ /lab/            (여러 경로)
//   옵션: --base <URL>  --out <폴더(기본 dist/qa)>  --width <px(기본 1100)>  --no-shots  --edge <msedge 경로>
// 결과: 경로마다 한 줄 요약 + JSON(<out>/report.json). 오류가 있으면 종료 코드 1.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : def;
};
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args.splice(i, 1), true) : false;
};
const base = opt('base', 'http://localhost:4321/Vibration_study').replace(/\/+$/, '');
const outDir = opt('out', 'dist/qa');
const width = Number(opt('width', '1100'));
const edgePath = opt('edge', process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');
const noShots = flag('no-shots');
// Git Bash는 '/p3-5/'를 'C:/Program Files/Git/p3-5/'로 바꿔 넘긴다 → 되돌린다
const paths = (args.length ? args : ['/']).map((p) => p.replace(/^[A-Za-z]:[\/].*?[\/]Git(?=[\/]|$)/, '') || '/');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  await fetch(`${base}/`);
} catch {
  console.error(`미리보기 서버가 없다: ${base}/ — 먼저 npm run build 후 npx astro preview`);
  process.exit(2);
}

const port = 9300 + Math.floor(Math.random() * 90);
const edge = spawn(edgePath, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(tmpdir(), `vs-check-${port}`)}`, 'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 60 && !target; i++) {
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
  } catch {}
  if (!target) await sleep(150);
}
if (!target) {
  console.error('Edge 원격 디버깅에 연결하지 못했다 (--edge로 경로 지정)');
  edge.kill();
  process.exit(2);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
let errors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error)));
    else p.resolve(m.result);
  }
  if (m.method === 'Runtime.exceptionThrown') errors.push(`예외: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`.slice(0, 300));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(`console.error: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`.slice(0, 300));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) errors.push(`HTTP ${m.params.response.status}: ${m.params.response.url}`);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return r.result?.value;
};
await send('Runtime.enable');
await send('Network.enable');
await send('Page.enable');
await mkdir(outDir, { recursive: true });

const report = [];
let failed = false;
for (const p of paths) {
  errors = [];
  const url = `${base}${p.startsWith('/') ? p : `/${p}`}`;
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await sleep(2000);
  const height = await ev('document.documentElement.scrollHeight');
  for (let y = 0; y < height; y += 700) {
    await ev(`window.scrollTo(0, ${y})`);
    await sleep(200);
  }
  await sleep(2000);
  const labs = await ev(`[...document.querySelectorAll('.lab-frame')].map(f => ({ id: f.querySelector('.lab-id')?.textContent ?? '?', plots: f.querySelectorAll('.js-plotly-plot').length, svgs: f.querySelectorAll('svg').length }))`);
  const unhydrated = (labs ?? []).filter((l) => l.plots === 0 && l.svgs === 0).map((l) => l.id);
  const shots = [];
  if (!noShots) {
    await ev('window.scrollTo(0, 0)');
    const full = await ev('document.documentElement.scrollHeight');
    const slug = p.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home';
    for (let y = 0, k = 0; y < full; y += 1500, k++) {
      const h = Math.min(1500, full - y);
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width, height: h, scale: 1 } });
      const file = path.join(outDir, `${slug}-${String(k).padStart(2, '0')}.png`);
      await writeFile(file, Buffer.from(shot.data, 'base64'));
      shots.push(file);
    }
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(800);
  const overflow = await ev('document.documentElement.scrollWidth - window.innerWidth');
  const ok = errors.length === 0 && unhydrated.length === 0 && overflow <= 0;
  if (!ok) failed = true;
  report.push({ path: p, ok, labs: labs?.length ?? 0, unhydrated, mobileOverflow: overflow, errors, shots });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${p}  랩 ${labs?.length ?? 0}${unhydrated.length ? ` (안 깨어남: ${unhydrated.join(', ')})` : ''} · 모바일 넘침 ${overflow}px · 오류 ${errors.length}${shots.length ? ` · 캡처 ${shots.length}장` : ''}`);
  for (const e of errors) console.log(`     ${e}`);
}
await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
await send('Browser.close').catch(() => {});
edge.kill();
process.exit(failed ? 1 : 0);
