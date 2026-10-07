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
const stabilitySmoke = flag('stability-smoke');
const waveformSmoke = flag('waveform-smoke');
const trendSmoke = flag('trend-smoke');
const cascadeSmoke = flag('cascade-smoke');
const orbitSmoke = flag('orbit-smoke');
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
  if (stabilitySmoke) {
    const smoke = await ev(`(async () => {
      const lab=[...document.querySelectorAll('.lab-frame')].find(f=>f.querySelector('.lab-id')?.textContent==='LAB-STB-01');
      if(!lab) return {skipped:true};
      const wait=()=>new Promise(r=>setTimeout(r,240)), sliders=lab.querySelectorAll('input[type="range"]'), toggles=lab.querySelectorAll('input[type="checkbox"]'), select=lab.querySelector('select');
      const set=async(i,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i],String(v));sliders[i].dispatchEvent(new Event('input',{bubbles:true}));sliders[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
      const choose=async(v)=>{select.value=String(v);select.dispatchEvent(new Event('change',{bubbles:true}));await wait();};
      const read=label=>{const row=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label);return row?parseFloat(row.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')):null;};
      const require=(v,m)=>{if(!v)throw Error(m);}, reset=async()=>{[...lab.querySelectorAll('button')].find(b=>b.textContent==='초기화').click();await wait();};
      try {
        require(Math.abs(read('Log decrement δ')-.1571)<.0001 && read('정방향 성장률 σf')<0,'기본 수렴');
        await set(2,.1);require(read('정방향 성장률 σf')===0 && read('Log decrement δ')===0 && lab.textContent.includes('경계 (감쇠 없음)'),'직접 경계0');
        await set(2,.15);require(Math.abs(read('Log decrement δ')+.1561)<.0001 && read('정방향 성장률 σf')>0,'발산');
        await set(1,.1);require(read('정방향 성장률 σf')<0 && Math.abs(read('한계 q/k')-.2)<.0001,'c2배 직접 한계');
        await reset();await choose(1);require(sliders[2].disabled && !sliders[3].disabled,'속도 모드 조작 전환');
        await set(3,2);require(read('정방향 성장률 σf')===0 && read('Log decrement δ')===0 && read('모드 선회 차수 ωf/Ω')===.5,'속도 모드 경계');
        await set(1,.1);require(read('정방향 성장률 σf')===0 && read('속도 연동 모델 한계 r')===2,'c2배 속도 한계 유지');
        await set(0,4000);require(lab.textContent.includes('8000 rpm') && read('Log decrement δ')===0,'강성/고유 회전수 변경');
        await reset();await set(2,0);toggles[0].click();await wait();const d=lab.querySelectorAll('svg[role="img"] path')[1].getAttribute('d');const ys=[...d.matchAll(/[ML]([^,]+),([^ML ]+)/g)].map(m=>Number(m[2]));require(read('초기 Y 속도')===0 && ys.length>100 && ys.every(y=>y===210),'정지 초기조건 q0 직선');
        await reset();await set(2,.5);await set(1,.01);require(read('표시 시간')<160 && read('정방향 성장률 σf')>0,'큰 발산 시간 제한');
        await reset();toggles[1].click();await wait();require(lab.querySelectorAll('.js-plotly-plot').length===4 && lab.textContent.includes('위 고유치 계산과 분리'),'가상 워터폴');
        await reset();require(select.value==='0' && Number(sliders[0].value)===3000 && Number(sliders[1].value)===.05 && Number(sliders[2].value)===.05 && !toggles[0].checked && !toggles[1].checked,'초기화');
        return {ok:true,checks:12};
      }catch(e){return {ok:false,error:e.message};}
    })()`);
    if(smoke?.ok===false||!smoke) errors.push('안정성 조작 검사: '+(smoke?.error??'평가 실패'));
    if(smoke?.ok) console.log('     안정성 조작 12항목 OK (모드·경계·초기조건·캐스케이드·초기화)');
  }
  if (waveformSmoke) {
    const smoke = await ev(`(async () => {
      const lab = [...document.querySelectorAll('.lab-frame')].find(f => f.querySelector('.lab-id')?.textContent === 'LAB-TWF-01');
      if (!lab) return { skipped: true };
      const wait = () => new Promise(r => setTimeout(r, 250));
      const sliders = lab.querySelectorAll('input[type="range"]'), toggles = lab.querySelectorAll('input[type="checkbox"]');
      const set = async (i, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(sliders[i], String(v)); sliders[i].dispatchEvent(new Event('input', { bubbles: true })); sliders[i].dispatchEvent(new Event('change', { bubbles: true })); await wait(); };
      const choose = async (i, v) => { const s = lab.querySelectorAll('select')[i]; s.value = String(v); s.dispatchEvent(new Event('change', { bubbles: true })); await wait(); };
      const read = label => { const row = [...lab.querySelectorAll('.readout-table tbody tr')].find(r => r.cells[0].textContent === label); return row ? parseFloat(row.cells[1].textContent.replace(/,/g, '').replaceAll('−', '-')) : null; };
      const data = () => lab.querySelector('.js-plotly-plot').data;
      let checks = 0;
      const require = (v, m) => { if (!v) throw Error(m); checks++; };
      try {
        require(read('Pk-Pk') === 40 && Math.abs(read('RMS (DC 포함)') - 14.14) < .01 && read('평균') === 0, '정현 초기값');
        for (let i = 0; i < 7; i++) { await choose(0, i); require(data()[0].y.every(Number.isFinite) && data()[0].y.length === 2560, '갤러리 ' + i); }
        await choose(0, 3); await set(2, 3); require(data()[2].x.length === 9 && Math.abs(read('모델 사건 간격') - 6.667) < .001, '사건·3바퀴');
        await set(0, 6000); require(read('한 바퀴') === 10 && Math.abs(read('모델 사건 간격') - 3.333) < .001, '회전수와 사건 간격');
        toggles[1].click(); await wait(); require(data().length === 1, '마커 숨기기'); toggles[1].click(); await wait();
        await set(0, 3000); await set(2, 10); await choose(0, 0); await set(1, 50); require(read('Pk-Pk') === 100, '진폭'); await set(1, 20);
        await set(3, 2); const cf = read('Crest factor (DC 포함)'); require(cf > 1.414, '잡음'); await set(3, 0); await set(3, 2); require(read('Crest factor (DC 포함)') === cf, '시드 재현'); await set(3, 0);
        toggles[0].click(); await wait(); require(!lab.querySelector('[role="status"]') && data()[0].name === '문제 파형' && !data().some(s => s.name === '모델의 사건 시작') && read('모델 사건 간격') === null, '퀴즈 정답 숨김');
        const answers = [6, 3, 4, 2, 7, 1, 5];
        for (let i = 0; i < 7; i++) {
          await choose(0, i); require(!lab.querySelector('[role="status"]') && lab.querySelectorAll('select')[1].value === '0', '문제 전환 초기화 ' + i);
          await choose(1, answers[i]); require(lab.querySelector('[role="status"]')?.textContent.includes('맞았습니다'), '정답 해설 ' + i);
        }
        await choose(0, 0); await choose(1, 1); require(lab.querySelector('[role="status"]')?.textContent.includes('다시 살펴보세요'), '오답 피드백');
        await choose(0, 0); toggles[0].click(); await wait(); require(lab.querySelectorAll('select').length === 1 && data()[0].name === '정현파', '갤러리 복귀');
        return { ok: true, checks };
      } catch (e) { return { ok: false, checks, error: e.message }; }
    })()`);
    if (smoke?.ok === false || !smoke) errors.push('시간파형 조작 검사: ' + (smoke?.error ?? '평가 실패'));
    if (smoke?.ok) console.log('     시간파형 조작 ' + smoke.checks + '항목 OK (7패턴·사건·잡음·퀴즈)');
  }
  if (trendSmoke) {
    const smoke = await ev(`(async () => {
      const lab = [...document.querySelectorAll('.lab-frame')].find(f => f.querySelector('.lab-id')?.textContent === 'LAB-TRND-01');
      if (!lab) return { skipped: true };
      const wait = () => new Promise(r => setTimeout(r, 260)), sliders = lab.querySelectorAll('input[type="range"]'), toggle = lab.querySelector('input[type="checkbox"]');
      const set = async (i,v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i],String(v)); sliders[i].dispatchEvent(new Event('input',{bubbles:true})); sliders[i].dispatchEvent(new Event('change',{bubbles:true})); await wait(); };
      const choose = async v => { const s=lab.querySelector('select'); s.value=String(v); s.dispatchEvent(new Event('change',{bubbles:true})); await wait(); };
      const read = label => { const row=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label); return row?parseFloat(row.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')):NaN; };
      const status = () => lab.querySelector('[role="status"]').textContent;
      let checks=0; const require=(v,m)=>{if(!v)throw Error(m);checks++;};
      try {
        require(lab.querySelectorAll('.js-plotly-plot').length===3 && lab.querySelector('svg[role="img"]'),'3 추세·Polar');
        require(Math.abs(read('Overall RMS')-14.21)<.01 && read('기준 대비 진폭 차이')===0 && Math.abs(read('벡터 변화량 |ΔV|')-34.64)<.01,'초기 해석값');
        require(status().includes('영역 밖') && read('기준 이후 첫 이탈 표본')===16,'기본 영역 이탈');
        await set(2,15); require(status().includes('영역 안'),'15분 경계 포함'); await set(2,16); require(status().includes('영역 밖'),'16분 이탈');
        await set(2,60); await set(5,120); require(status().includes('영역 안'),'120도 경계'); await set(5,30);
        await set(3,30); require(Math.abs(read('벡터 변화량 |ΔV|')-20)<.001 && Math.abs(read('기준 대비 최단 위상 차이')-60)<.001,'기준 변경'); await set(3,0);
        toggle.click(); await wait(); const phase=lab.querySelectorAll('.js-plotly-plot')[2].data[0].y; require(phase.some(v=>v===null||Number.isNaN(v)) && Math.max(...phase.filter(Number.isFinite))<=360,'접힌 위상 경계'); toggle.click(); await wait();
        await choose(2); require(sliders[0].disabled && sliders[1].disabled && Math.abs(read('Overall RMS')-15.23)<.01 && Math.abs(read('Not-1X RMS (정확 제거 모델)')-5.657)<.001 && read('벡터 변화량 |ΔV|')===0,'잔여 증가');
        await choose(1); require(sliders[0].disabled && !sliders[1].disabled && read('1X 진폭')===30 && read('기준 대비 최단 위상 차이')===0,'진폭 증가');
        await set(1,100); require(read('1X 진폭')===40 && Math.abs(read('벡터 변화량 |ΔV|')-20)<.001,'진폭 증가 조작'); await set(1,50);
        await set(4,50); require(status().includes('영역 안'),'진폭50% 경계'); await set(4,20);
        await choose(0); await set(0,360); require(read('벡터 변화량 |ΔV|')===0 && read('기준 이후 첫 이탈 표본')===6 && status().includes('영역 안'),'끝점 복귀·중간 이탈');
        await set(0,120); require(!sliders[0].disabled && sliders[1].disabled && Math.abs(read('벡터 변화량 |ΔV|')-34.64)<.01,'초기 시나리오 복귀');
        return {ok:true,checks};
      } catch(e) {return {ok:false,checks,error:e.message};}
    })()`);
    if (smoke?.ok === false || !smoke) errors.push('트렌드 조작 검사: '+(smoke?.error ?? '평가 실패'));
    if (smoke?.ok) console.log('     트렌드 조작 '+smoke.checks+'항목 OK (기준·영역·접힘·3시나리오)');
  }
  if (cascadeSmoke) {
    const smoke = await ev(`(async () => {
      const lab=[...document.querySelectorAll('.lab-frame')].find(f=>f.querySelector('.lab-id')?.textContent==='LAB-WF-01');
      if(!lab) return {skipped:true};
      const wait=()=>new Promise(r=>setTimeout(r,300)), sliders=lab.querySelectorAll('input[type="range"]'), selects=lab.querySelectorAll('select');
      const set=async(i,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i],String(v));sliders[i].dispatchEvent(new Event('input',{bubbles:true}));sliders[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
      const choose=async(i,v)=>{selects[i].value=String(v);selects[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
      const read=label=>{const row=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label);return row?parseFloat(row.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')):NaN;};
      const near=(label,v,t=.001)=>Math.abs(read(label)-v)<t;
      let checks=0;const require=(v,m)=>{if(!v)throw Error(m);checks++;};
      try {
        require(lab.querySelectorAll('.js-plotly-plot').length===3,'3 plots');
        require(near('1X 주파수',120)&&near('비교 성분 지정 주파수',40)&&near('비교 성분 차수',.3333,.0001),'초기 Hz·차수');
        require(near('X의 1X 칸 진폭',20)&&near('+1X 반지름 (반시계·정)',15)&&near('−1X 반지름 (시계·역)',5)&&near('FFT 분해능',.5),'초기 진폭·분해능');
        await set(0,6);require(near('회전수',4800)&&near('비교 성분 지정 주파수',36)&&near('비교 성분 차수',.45),'4800rpm 추종');
        await set(0,10);await choose(0,1);require(near('비교 성분 지정 주파수',54)&&sliders[1].disabled,'추종만54Hz');
        await choose(0,0);await set(1,50);require(near('비교 성분 지정 주파수',50)&&near('잠김 모델 교차 회전수',6667,1),'모드50');await set(1,40);
        await choose(0,2);await set(0,2);require(near('1X 주파수',40)&&near('X의 1X 칸 진폭',32)&&near('+1X 반지름 (반시계·정)',27)&&sliders[2].disabled,'동일 주파수 합성');
        await set(0,0);require(near('비교 성분 지정 주파수',40)&&near('1X 주파수',20),'처음부터 고정');
        await choose(0,0);await choose(1,1);await set(0,12);const plots=lab.querySelectorAll('.js-plotly-plot');require(near('기록 시각',120)&&near('회전수',7200)&&near('X의 1X 칸 진폭',30)&&plots[0].layout.yaxis.range[1]===133,'Waterfall 유지');
        await choose(1,0);require(plots[0].layout.yaxis.range[1]===8000,'Cascade 유지 겹침');
        await set(0,10);await choose(1,2);require(plots[0].layout.xaxis.range[0]===-260,'Full cascade 양쪽');
        await set(3,0);require(near('+1X 반지름 (반시계·정)',20)&&read('−1X 반지름 (시계·역)')===0,'역성분0');
        await set(3,50);require(near('X의 1X 칸 진폭',20)&&near('+1X 반지름 (반시계·정)',10)&&near('−1X 반지름 (시계·역)',10),'같은 X·다른 방향 분해');
        await set(3,75);require(near('+1X 반지름 (반시계·정)',5)&&near('−1X 반지름 (시계·역)',15),'역 우세');await set(3,25);
        await choose(2,1);require(plots[0].layout.xaxis.range[0]===-3&&plots[0].layout.xaxis.range[1]===3,'차수축 변환');
        await set(2,.5);require(near('잠김 모델 교차 회전수',4800,1),'비율 조작');await set(2,.45);
        const toggle=lab.querySelector('input[type="checkbox"]');toggle.click();await wait();require(Number.isFinite(read('X의 1X 칸 진폭'))&&plots[1].data[0].y.some((v,i)=>plots[1].data[0].x[i]>1.2&&plots[1].data[0].x[i]<1.5&&v>0),'잡음 바닥');toggle.click();await wait();
        await choose(2,0);await choose(1,0);require(near('X의 1X 칸 진폭',20)&&near('비교 성분 지정 주파수',40),'초기 복귀');
        return {ok:true,checks};
      } catch(e) {return {ok:false,checks,error:e.message};}
    })()`);
    if(smoke?.ok===false||!smoke) errors.push('Cascade 조작 검사: '+(smoke?.error??'평가 실패'));
    if(smoke?.ok) console.log('     Cascade 조작 '+smoke.checks+'항목 OK (추종·잠김·유지·정/역·축)');
  }
  if (orbitSmoke) {
    const smoke=await ev(`(async()=>{
      const lab=[...document.querySelectorAll('.lab-frame')].find(f=>f.querySelector('.lab-id')?.textContent==='LAB-ORB-01');
      if(!lab) return {skipped:true};
      const wait=(ms=300)=>new Promise(r=>setTimeout(r,ms)), sliders=lab.querySelectorAll('input[type="range"]'), selects=lab.querySelectorAll('select'), toggles=lab.querySelectorAll('input[type="checkbox"]');
      const set=async(i,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i],String(v));sliders[i].dispatchEvent(new Event('input',{bubbles:true}));sliders[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
      const choose=async(i,v)=>{const values=[['circle','ellipse','banana','eight','loop','flower','flat','sub'],['0.5',String(1/3),'0.43','1','2'],['1','-1'],['2','4','8']];selects[i].value=String(values[i].indexOf(String(v)));selects[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
      const read=label=>{const row=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label);return row?parseFloat(row.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')):NaN;};
      const near=(label,v,t=.01)=>Math.abs(read(label)-v)<t;
      let checks=0;const require=(v,m)=>{if(!v)throw Error(m);checks++;};
      const reset=async()=>{[...lab.querySelectorAll('button')].find(b=>b.textContent==='초기화').click();await wait();};
      const point=()=>{const c=lab.querySelector('.orbit-mark');return c?.getAttribute('cx')+','+c?.getAttribute('cy');};
      const arrow=()=>lab.querySelector('.orbit-arrow');
      try {
        require(lab.querySelectorAll('svg[role="img"]').length===2&&lab.querySelectorAll('.js-plotly-plot').length===1,'2 orbits and time plot');
        require(near('직접 X p-p',40)&&near('직접 Y p-p',40)&&near('필터 X 중앙 벡터',20)&&read('서로 다른 직접 점 자리')===1,'initial circle');
        require(Number(arrow().getAttribute('y1'))>Number(arrow().getAttribute('y2')),'forward time arrow');
        const a=point();await choose(2,-1);require(point()===a&&Number(arrow().getAttribute('y1'))<Number(arrow().getAttribute('y2'))&&near('직접 X p-p',40),'reverse keeps amplitude and pulse point');await choose(2,1);
        toggles[0].click();await wait();require(!lab.querySelector('.orbit-mark')&&(lab.querySelector('.orbit-trace').getAttribute('d').match(/M/g)||[]).length===1,'marks off removes blank');toggles[0].click();await wait();
        await choose(0,'banana');require(Number(sliders[0].value)===12&&near('필터 X 중앙 벡터',20)&&near('필터 Y 중앙 벡터',12),'banana filtering');
        await set(0,24);require(near('필터 Y 중앙 벡터',12)&&lab.querySelector('.orbit-trace').getAttribute('d')!==null,'extra amplitude');await set(1,90);require(Number(sliders[1].value)===90,'phase control');
        await choose(0,'eight');require(near('직접 Y p-p',40)&&read('필터 Y 중앙 벡터')<.006,'eight reduces to line');
        await choose(0,'loop');await choose(3,8);require(Number(sliders[0].value)===35&&read('서로 다른 직접 점 자리')===2&&!selects[1].disabled,'loop half-order');
        await choose(0,'flower');require(read('서로 다른 직접 점 자리')===1,'flower repeats once per turn');
        await choose(0,'flat');require(near('직접 X p-p',32)&&near('필터 X 중앙 벡터',17.15243,.006),'flat analytic filtering');
        await choose(0,'sub');require(read('서로 다른 직접 점 자리')===2&&lab.querySelectorAll('svg[role="img"]')[0].querySelectorAll('.orbit-mark').length===8,'half-order eight pulses two positions');
        await choose(1,String(1/3));require(read('서로 다른 직접 점 자리')===3,'third-order three positions');
        await choose(1,.43);const b=point();require(read('서로 다른 직접 점 자리')===8,'0.43 eight distinct');await set(2,1);require(point()!==b&&read('시작 키페이저 k')===1,'0.43 sliding marks');
        toggles[1].click();await wait(950);require(read('시작 키페이저 k')>1,'play advances window');toggles[1].click();await wait();const k=read('시작 키페이저 k');await wait(950);require(read('시작 키페이저 k')===k,'pause holds window');
        await choose(1,2);require(read('서로 다른 직접 점 자리')===1&&read('필터 X 중앙 벡터')<.006,'2X one position, no meaningful 1X');
        await choose(1,1);require(read('서로 다른 직접 점 자리')===1&&near('필터 X 중앙 벡터',20),'1X one position');
        await set(2,30);require(read('시작 키페이저 k')===30&&Number.isFinite(read('필터 X 중앙 벡터')),'last valid window');
        await reset();require(selects[0].value==='0'&&Number(sliders[2].value)===0&&selects[3].value==='0'&&!toggles[1].checked&&toggles[0].checked,'reset');
        return {ok:true,checks};
      }catch(e){return {ok:false,checks,error:e.message};}
    })()`);
    if(smoke?.ok===false||!smoke) errors.push('Orbit 조작 검사: '+(smoke?.error??'평가 실패'));
    if(smoke?.ok) console.log('     Orbit 조작 '+smoke.checks+'항목 OK (형태·필터·점·방향·재생·초기화)');
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
