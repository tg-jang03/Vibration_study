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
const jeffcottSmoke = flag('jeffcott-smoke');
const centerlineSmoke = flag('centerline-smoke');
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
  if (jeffcottSmoke) {
    const smoke = await ev(`(async () => {
      const lab = [...document.querySelectorAll('.lab-frame')].find(f => f.querySelector('.lab-id')?.textContent === 'LAB-JEF-01');
      if (!lab) return { skipped: true };
      const wait = () => new Promise(r => setTimeout(r, 220));
      const sliders = lab.querySelectorAll('input[type="range"]'), toggle = lab.querySelector('input[type="checkbox"]');
      const set = async (i,v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i], String(v)); sliders[i].dispatchEvent(new Event('input',{bubbles:true})); sliders[i].dispatchEvent(new Event('change',{bubbles:true})); await wait(); };
      const read = label => { const row = [...lab.querySelectorAll('.readout-table tbody tr')].find(r => r.cells[0].textContent.startsWith(label)); return parseFloat(row.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')); };
      const require = (v,message) => { if (!v) throw Error(message); };
      const point = () => [...lab.querySelector('svg[role="img"]').querySelectorAll('circle')].at(-1).getAttribute('cx');
      try {
        require(Math.abs(read('X 진폭')-100)<.01 && read('|Ab|')===0, '등방 기본값');
        toggle.click(); await wait(); const a = point(); await wait(); require(point()!==a, '재생 시 위치 변화');
        toggle.click(); await wait(); const b=point(); await wait(); require(point()===b, '정지 시 위치 유지');
        await set(1,1.3); await set(0,3200);
        require(Math.abs(read('|Af|')-36.11)<.02 && Math.abs(read('|Ab|')-50.45)<.02, '비등방 읽음값');
        require(lab.querySelector('svg[role="img"]').getAttribute('aria-label').includes('역방향'), '역방향 판정');
        await set(2,.2); require(Math.abs(read('|Af|')-23.73)<.02 && read('|Af|')>read('|Ab|'), '감쇠 증가 시 정방향');
        await set(0,0); require(read('X 진폭')===0 && read('|Ab|')===0 && lab.textContent.includes('위상이 정의되지'), '정지 상태');
        toggle.click(); await wait(); require(!toggle.checked, '회전수 0 재생 방지');
        [...lab.querySelectorAll('button')].find(b=>b.textContent==='초기화').click(); await wait();
        require(Number(sliders[0].value)===3000 && Number(sliders[1].value)===1 && Number(sliders[2].value)===.05 && !toggle.checked, '초기화');
        return { ok:true, checks:9 };
      } catch(e) { return { ok:false, error:e.message }; }
    })()`);
    if (smoke?.ok === false || !smoke) errors.push('Jeffcott 조작 검사: ' + (smoke?.error ?? '평가 실패'));
    if (smoke?.ok) console.log('     Jeffcott 조작 9항목 OK (재생·정지·읽음값·감쇠·정지상태·초기화)');
  }
  if (centerlineSmoke) {
    const smoke = await ev(`(async () => {
      const lab = [...document.querySelectorAll('.lab-frame')].find(f => f.querySelector('.lab-id')?.textContent === 'LAB-SCL-01');
      if (!lab) return { skipped:true };
      const wait = () => new Promise(r => setTimeout(r,220));
      const sliders = lab.querySelectorAll('input[type="range"]'), selects = lab.querySelectorAll('select'), toggles = lab.querySelectorAll('input[type="checkbox"]');
      const set = async(i,v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i],String(v)); sliders[i].dispatchEvent(new Event('input',{bubbles:true})); sliders[i].dispatchEvent(new Event('change',{bubbles:true})); await wait(); };
      const choose = async(i,v) => { selects[i].value=String(v); selects[i].dispatchEvent(new Event('change',{bubbles:true})); await wait(); };
      const read = label => { const row=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label);return row ? parseFloat(row.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')) : null; };
      const require = (v,message) => { if(!v) throw Error(message); };
      const reset = async() => { [...lab.querySelectorAll('button')].find(b=>b.textContent==='초기화').click();await wait(); };
      try {
        require(Math.abs(read('편심률 ε')-.6758)<.0001 && Math.abs(read('최소 유막 hmin')-32.42)<.02 && read('복원 위치 오차')===0, '기본 유막·DC 값');
        await set(1,500);require(Math.abs(read('편심률 ε')-.5597)<.0001 && Math.abs(read('최소 유막 hmin')-44.03)<.02,'경하중');
        await reset();await set(0,6000);require(Math.abs(read('편심률 ε')-.5597)<.0001,'회전수 2배');
        await reset();await set(2,40);require(Math.abs(read('편심률 ε')-.5597)<.0001,'점성계수 2배');
        await reset();await choose(0,1);require(read('모델 X')<0 && read('복원 위치 오차')===0,'역자전 좌표');
        await reset();toggles[0].click();await wait();require(Math.abs(read('복원 위치 오차')-100)<.01,'냉간 위치 누락');
        await reset();await set(3,.5);require(Math.abs(read('복원 위치 오차')-63.5)<.01,'전압 drift');
        await reset();await choose(1,1);require(lab.textContent.includes('Not OK') && read('복원 위치 오차')===null && !lab.querySelector('[data-center="measured"]'),'범위 이탈 시 좌표 중단');
        await reset();const va=read('평균 전압 VA');toggles[1].click();await wait();require(read('평균 전압 VA')===va && read('복원 위치 오차')===0,'평균0 runout');
        await set(0,0);require(read('편심률 ε')===1 && read('최소 유막 hmin')===0 && lab.textContent.includes('접촉 기준') && read('자세각 φ')===null,'0rpm 기준');
        await reset();require(Number(sliders[0].value)===3000 && Number(sliders[1].value)===1000 && Number(sliders[2].value)===20 && Number(sliders[3].value)===0 && selects[0].value==='0' && selects[1].value==='0' && toggles[0].checked && !toggles[1].checked,'초기화');
        return { ok:true,checks:11 };
      } catch(e) { return { ok:false,error:e.message }; }
    })()`);
    if (smoke?.ok === false || !smoke) errors.push('Shaft centerline 조작 검사: ' + (smoke?.error ?? '평가 실패'));
    if (smoke?.ok) console.log('     Shaft centerline 조작 11항목 OK (유막·전압 복원·범위 이탈·초기화)');
  }
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
