// 페이지 점검 (D-038): 헤드리스 Edge(CDP)로 페이지를 열어 랩 hydration·콘솔 오류·HTTP 오류·모바일 가로 넘침을 보고,
// 전체 페이지를 1500px씩 잘라 PNG로 저장한다. 매번 캡처·검사 스크립트를 새로 쓰지 않기 위한 공용 도구.
//
// 사용: 먼저 `npm run build` → `npx astro preview` (기본 http://localhost:4321)
//   npm run verify:page -- /p3-5/ /lab/            (여러 경로)
//   옵션: --base <URL>  --out <폴더(기본 dist/qa)>  --width <px(기본 1100)>  --no-shots  --edge <msedge 경로>
//         --anim-smoke (움직이는 그림을 재생해 바뀌는지 보고 움직이는 중을 캡처)
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
const thermalSmoke = flag('thermal-smoke');
const steamSmoke = flag('steam-smoke');
const forcedSmoke = flag('forced-smoke');
const cascadeSmoke = flag('cascade-smoke');
const orbitSmoke = flag('orbit-smoke');
const bodeSmoke = flag('bode-smoke');
const animSmoke = flag('anim-smoke'); // 움직이는 그림 패널(.anim-panel)마다 재생 확인·캡처 (D-044)
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
  if (bodeSmoke) {
    const smoke=await ev(`(async()=>{
      const labs=[...document.querySelectorAll('.lab-frame')].filter(f=>f.querySelector('.lab-id')?.textContent==='LAB-BODE-01');
      if(!labs.length)return {skipped:true};
      const wait=(ms=350)=>new Promise(r=>setTimeout(r,ms));let checks=0;
      const require=(ok,m)=>{if(!ok)throw Error(m);checks++;};
      try { for(const lab of labs){
        const sliders=lab.querySelectorAll('input[type="range"]'), selects=lab.querySelectorAll('select'),toggles=lab.querySelectorAll('input[type="checkbox"]');
        const set=async(i,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i],String(v));sliders[i].dispatchEvent(new Event('input',{bubbles:true}));sliders[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
        const choose=async(i,v)=>{selects[i].value=String(v);selects[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
        const read=label=>{const row=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label);return row?parseFloat(row.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')):NaN;};
        const reset=async()=>{[...lab.querySelectorAll('button')].find(b=>b.textContent==='초기화').click();await wait();};
        await reset();await choose(1,0);
        require(lab.querySelectorAll('.js-plotly-plot').length===2&&lab.querySelectorAll('svg[role="img"]').length===1,'Bode + Polar render');
        require(Math.abs(read('1차 창 피크 진폭 · 베어링 1')-83.46)<.02&&read('2차 창 국소 피크 · 베어링 1')===3020,'cold sampled peaks');
        await choose(0,3);require(Number.isNaN(read('2차 창 국소 피크 · 중앙'))&&Math.abs(read('운전 1X · 중앙')-18.118)<.01,'node has no second peak');
        toggles[2].click();await wait();require(lab.querySelectorAll('.js-plotly-plot')[0].data[2].y.every(v=>v===0),'node modal component exactly zero');
        await choose(0,0);await set(3,.2);require(read('2차 불평형 성분 AF · 베어링 1')<3,'damping AF drops');
        await set(1,1900);require(lab.querySelector('.lab-note').textContent.includes('모드가 가까워'),'close modes notice');
        await reset();await choose(1,1);require(Math.abs(read('200 rpm · 베어링 1')-4.179)<.01,'hot low-speed bow');
        toggles[1].click();await wait();require(read('200 rpm · 베어링 1')===0&&read('1차 창 피크 진폭 · 베어링 1')>99,'compensation retains bow resonance');
        toggles[0].click();await wait();require(read('200 rpm · 베어링 1')===0,'runout compensated');
        await set(8,4);await set(9,120);require(Number(sliders[8].value)===4&&Number(sliders[9].value)===120,'bow controls');
        await reset();await choose(1,0);await set(4,0);await set(5,0);require(read('운전 1X · 베어링 1')===0&&Number.isNaN(read('1차 불평형 성분 AF · 베어링 1')),'zero excitation');
        await set(6,90);await set(7,180);await set(0,1000);await set(2,.1);await set(10,4000);require(Number(sliders[0].value)===1000&&Number(sliders[10].value)===4000,'rpm and angular controls');
        await choose(2,2);require(read('운전 1X · 베어링 1')>0,'seeded noise renders');
        await choose(0,4);require(lab.querySelectorAll('.js-plotly-plot')[0].data.length===6,'all three sensors + modal/speed markers');
        await reset();require(![...toggles].some(t=>t.checked)&&Number(sliders[0].value)===1500,'reset controls and toggles');
      } return {ok:true,checks};}catch(e){return {ok:false,error:e.message,checks};}
    })()`);
    if(smoke?.ok===false||!smoke)errors.push('Bode 조작 검사: '+(smoke?.error??'평가 실패'));
    if(smoke?.ok)console.log('     Bode 조작 '+smoke.checks+'항목 OK (센서·마디·감쇠·중첩·bow·보상·잡음·초기화)');
  }
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
  if (forcedSmoke) {
    const smoke=await ev(`(async()=>{
      const labs=[...document.querySelectorAll('.lab-frame')].filter(f=>f.querySelector('.lab-id')?.textContent==='LAB-FRC-01');
      if(!labs.length)return {skipped:true};
      let checks=0;const require=(v,m)=>{if(!v)throw Error(m);checks++;};const wait=(ms=280)=>new Promise(r=>setTimeout(r,ms));
      try{for(const lab of labs){
        const sliders=lab.querySelectorAll('input[type="range"]'),selects=lab.querySelectorAll('select'),toggle=lab.querySelector('input[type="checkbox"]');
        const set=async(i,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i],String(v));sliders[i].dispatchEvent(new Event('input',{bubbles:true}));sliders[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
        const choose=async(i,v)=>{selects[i].value=String(v);selects[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
        const press=async label=>{const b=[...lab.querySelectorAll('button')].find(b=>b.textContent===label);if(!b||b.disabled)throw Error('조작 불가 '+label);b.click();await wait();};
        const preset=async f=>{lab.querySelector('[data-frc-preset="'+f+'"]').click();await wait();};
        const read=label=>{const r=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label);return r?parseFloat(r.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')):NaN;};
        const near=(label,v,t=.01)=>Math.abs(read(label)-v)<t;
        const mass=()=>Number(lab.querySelector('[data-frc-mass]').getAttribute('x'));
        const graph=()=>lab.querySelector('.js-plotly-plot');
        const sync=()=>{const d=graph().data;require(Math.abs(d[3].x[0]-Number(sliders[2].value))<1e-8&&Math.abs(d[4].x[0]-d[3].x[0])<1e-8&&Math.abs(d[4].y[0]-read('현재 변위 x(t)'))<.01&&Math.abs(d[3].y[0]-read('현재 가진력 F(t)')*10/(Math.PI*Math.PI))<.01,'같은 시각 힘·변위');};
        require(lab.querySelectorAll('.js-plotly-plot').length===3&&read('현재 시각')===0&&read('현재 변위 x(t)')===0,'초기 정지·3플롯');
        await preset(2.5);require(mass()>308&&near('위상 지연 φ',3.814,.005)&&near('현재 변위 x(t)',13.27),'저주파 같은 방향');sync();
        await preset(10);require(mass()<308&&near('위상 지연 φ',176.2,.05)&&near('현재 변위 x(t)',-3.319,.005),'고주파 반대 방향');sync();
        await preset(5);require(mass()===308&&read('현재 변위 x(t)')===0&&read('위상 지연 φ')===90,'공진 초기·90도');
        await press('T/4 앞으로');require(near('현재 시각',.05,.0001)&&read('현재 가진력 F(t)')===0&&read('현재 변위 x(t)')===100&&!lab.querySelector('[data-frc-force]'),'T/4 뒤 변위 피크');sync();
        require(Math.abs(Number(lab.querySelector('[data-frc-piston]').getAttribute('x1'))-(mass()+42-187))<1e-8,'질량·피스톤 동기');
        await press('T/4 앞으로');const arrow=lab.querySelector('[data-frc-force]');require(read('현재 변위 x(t)')===0&&read('현재 가진력 F(t)')<0&&Number(arrow.getAttribute('x2'))<Number(arrow.getAttribute('x1')),'음의 힘 화살표');
        await set(2,.15);require(read('현재 변위 x(t)')===-100,'시각 탐색');sync();
        toggle.click();await wait();require(graph().data[0].x.length===4001&&graph().layout.xaxis.range[1]===4,'전체 파형');toggle.click();await wait();
        await set(0,0);require(read('현재 시각')===0&&[...lab.querySelectorAll('button')].find(b=>b.textContent==='T/4 앞으로').disabled,'0Hz·조건 변경 초기화');
        await set(2,1);require(Number.isFinite(read('현재 변위 x(t)')),'0Hz 유한');
        await preset(5);await set(1,.1);require(read('현재 시각')===0&&near('정상상태 진폭비 X/X_st (식)',5),'감쇠 변경');await set(1,.05);
        await choose(0,0);require(read('현재 변위 x(t)')===0,'과도 초기조건');await choose(0,1);
        await press('재생');require(read('현재 시각')>0&&mass()!==308,'재생 진행');await press('정지');const t=read('현재 시각'),x=mass();await wait(400);require(read('현재 시각')===t&&mass()===x,'정지 유지');
        await press('재생');await choose(1,3);await wait(350);require(read('현재 시각')>t+.3,'재개·속도 변경');await press('정지');
        await set(2,3.98);await press('재생');require(read('현재 시각')===4&&[...lab.querySelectorAll('button')].find(b=>b.textContent==='정지').disabled,'끝 자동 정지');
        await press('처음부터 재생');require(read('현재 시각')<1&&read('현재 시각')>0,'재시작');await press('정지');
        await press('처음 상태');require(read('현재 시각')===0,'시각 초기화');
        require([...lab.querySelectorAll('svg[role="img"] path')].every(p=>!/(NaN|Infinity)/.test(p.getAttribute('d'))),'SVG 유한');
        await choose(1,1);await choose(0,0);await set(0,2.5);
      }return {ok:true,checks};}catch(e){return {ok:false,checks,error:e.message};}
    })()`);
    if(smoke?.ok===false||!smoke)errors.push('강제진동 재생 검사: '+(smoke?.error??'평가 실패'));
    if(smoke?.ok)console.log('     강제진동 재생 '+smoke.checks+'항목 OK (위상·동기화·재생·정지·탐색·0Hz)');
  }

  if (steamSmoke) {
    const smoke=await ev(`(async()=>{
      const labs=[...document.querySelectorAll('.lab-frame')].filter(f=>f.querySelector('.lab-id')?.textContent==='LAB-ST-01');
      if(!labs.length)return {skipped:true};
      let checks=0;const require=(v,m)=>{if(!v)throw Error(m);checks++;};
      const wait=()=>new Promise(r=>setTimeout(r,260));
      try{for(const lab of labs){
        const sliders=lab.querySelectorAll('input[type="range"]'),select=lab.querySelector('select'),toggle=lab.querySelector('input[type="checkbox"]'),initial=select.value;
        const set=async(i,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(sliders[i],String(v));sliders[i].dispatchEvent(new Event('input',{bubbles:true}));sliders[i].dispatchEvent(new Event('change',{bubbles:true}));await wait();};
        const choose=async v=>{select.value=String(v);select.dispatchEvent(new Event('change',{bubbles:true}));await wait();};
        const reset=async()=>{[...lab.querySelectorAll('button')].find(b=>b.textContent==='초기화').click();await wait();};
        const read=label=>{const r=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label);return r?parseFloat(r.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')):NaN;};
        const near=(label,v,t=.01)=>Math.abs(read(label)-v)<t,status=()=>lab.querySelector('[role="status"]').textContent;
        require(lab.querySelectorAll('.js-plotly-plot').length===3&&lab.querySelector('svg[role="img"]'),'3 plots·중심 위치');
        await choose(0);require(near('베어링 하중 크기',1000)&&near('정적 편심률 ε',.6758,.0001)&&near('가상 부하 경계 ℓ*',60)&&status().includes('안정:'),'기본50%');
        await set(0,60);require(read('성장률 σ')===0&&read('Log decrement δ')===0&&read('자유응답 끝 진폭')===5&&status().includes('경계:'),'60% 경계');
        await set(0,80);require(status().includes('불안정:')&&near('자유응답 끝 진폭',10.587,.005)&&near('가상 모드 주파수',30.03,.005),'80% 성장');
        await set(0,50);await choose(1);require(near('베어링 하중 크기',400)&&near('정적 편심률 ε',.5166,.0001)&&near('최소 유막 hmin',48.34)&&near('가상 부하 경계 ℓ*',60),'상향 힘');
        await choose(2);require(near('베어링 하중 크기',1600)&&near('정적 편심률 ε',.739,.0001),'하향 힘');
        await choose(3);require(near('베어링 하중 크기',1166,1)&&read('합력 X')===600&&read('합력 Y')===-1000,'우향 힘');
        await choose(1);await set(2,40);require(read('정적 편심률 ε')<.5166&&near('가상 부하 경계 ℓ*',60),'점성과 별도 경계');
        await set(0,0);require(read('합력 Y')===-1000,'부하0 지정 증기력0');await set(0,100);require(read('합력 Y')===-1000,'부하100 지정 증기력0');
        await set(0,50);await set(1,4);require(near('가상 부하 경계 ℓ*',33.33)&&status().includes('불안정:'),'감쇠 변경');
        await reset();await choose(0);await set(3,0);await set(4,0);require(!Number.isFinite(read('가상 부하 경계 ℓ*'))&&status().includes('안정:'),'교차력0 경계 없음');
        await reset();const a=read('자유응답 끝 진폭');await set(5,10);require(Math.abs(read('자유응답 끝 진폭')-2*a)<.01&&near('가상 부하 경계 ℓ*',60),'초기 진폭 비례');
        toggle.click();await wait();require(lab.querySelectorAll('.js-plotly-plot')[2].data.length===2,'X 자유응답 토글');
        require([...lab.querySelectorAll('svg[role="img"] path')].every(p=>!/(NaN|Infinity)/.test(p.getAttribute('d'))),'중심 경로 유한');
        await reset();require(select.value===initial&&Number(sliders[0].value)===50&&Number(sliders[1].value)===6&&Number(sliders[2].value)===20&&Number(sliders[3].value)===3&&Number(sliders[4].value)===15&&Number(sliders[5].value)===5&&!toggle.checked,'초기화와 시작 분사');
      }return {ok:true,checks};}catch(e){return {ok:false,checks,error:e.message};}
    })()`);
    if(smoke?.ok===false||!smoke)errors.push('ST 부하 조작 검사: '+(smoke?.error??'평가 실패'));
    if(smoke?.ok)console.log('     ST 부하 조작 '+smoke.checks+'항목 OK (경계·성장·분사·점성·초기화)');
  }

  if (thermalSmoke) {
    const smoke = await ev(`(async () => {
      const labs=[...document.querySelectorAll('.lab-frame')].filter(f=>f.querySelector('.lab-id')?.textContent==='LAB-TRND-01');
      if(!labs.length)return {skipped:true};
      let checks=0;const require=(v,m)=>{if(!v)throw Error(m);checks++;};
      const wait=()=>new Promise(r=>setTimeout(r,260));
      try {
        for(const lab of labs){
          const select=lab.querySelector('select'),initial=select.value;
          const choose=async v=>{select.value=String(v);select.dispatchEvent(new Event('change',{bubbles:true}));await wait();};
          const set=async(label,v)=>{const param=[...lab.querySelectorAll('.param')].find(p=>p.querySelector('label span')?.textContent===label);const input=param?.querySelector('input[type="range"]');if(!input)throw Error('조절 없음: '+label);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,String(v));input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));await wait();};
          const read=label=>{const r=[...lab.querySelectorAll('.readout-table tbody tr')].find(r=>r.cells[0].textContent===label);return r?parseFloat(r.cells[1].textContent.replace(/,/g,'').replaceAll('−','-')):NaN;};
          require(lab.querySelectorAll('.js-plotly-plot').length===3&&lab.querySelector('svg[role="img"]'),'3추세·Polar');
          await choose(3);await set('선택 시각',60);await set('기준 시각',0);
          require(Math.abs(read('열 기여 진폭 |Q|')-.5974)<.001&&Math.abs(read('1X 진폭')-20.01)<.01&&Math.abs(read('벡터 변화량 |ΔV|')-11.4)<.01,'열 휨 초기값');
          await set('감소 시간상수 τ',60);require(Math.abs(read('열 기여 진폭 |Q|')-4.415)<.001&&Math.abs(read('1X 진폭')-20.48)<.01,'시간상수 변경');await set('감소 시간상수 τ',20);
          await set('초기 열 기여 진폭',20);await set('초기 열 기여 지연각',170);await set('선택 시각',0);
          require(read('1X 진폭')===0&&!Number.isFinite(read('1X 지연각 (0~360°)'))&&lab.querySelector('[role="status"]').textContent.includes('보류'),'상쇄·위상 보류');
          require(lab.querySelectorAll('.js-plotly-plot')[2].data[0].y.some(v=>v===null||Number.isNaN(v)),'작은 진폭 위상 공백');
          await set('초기 열 기여 진폭',0);require(read('1X 진폭')===20&&read('열 기여 진폭 |Q|')===0,'열 기여0');
          await set('초기 열 기여 진폭',30);await set('초기 열 기여 지연각',350);require(read('1X 진폭')===50&&lab.querySelectorAll('.js-plotly-plot')[1].layout.yaxis.range[1]>50,'큰 값 축 확장');
          await set('초기 열 기여 진폭',12);await set('초기 열 기여 지연각',80);await set('선택 시각',60);
          await choose(4);require(Math.abs(read('열 기여 진폭 |Q|')-10)<.001&&Math.abs(read('1X 진폭')-22.36)<.01&&Math.abs(read('1X 지연각 (0~360°)')-16.57)<.01&&read('벡터 변화량 |ΔV|')===5,'Morton 기본값');
          const phase=lab.querySelectorAll('.js-plotly-plot')[2].data[0].y.filter(Number.isFinite);require(Math.max(...phase)-Math.min(...phase)<180,'합 위상은 두 바퀴 돌지 않음');
          await set('60분간 열 기여 증가율',0);require(read('벡터 변화량 |ΔV|')===0,'닫힌 원 끝점');
          await set('선택 시각',15);require(read('벡터 변화량 |ΔV|')===10,'닫힌 원 중간 변화');
          await set('선택 시각',30);require(read('벡터 변화량 |ΔV|')===0,'30분 복귀');
          await set('열 기여 선회 주기 P',60);require(read('벡터 변화량 |ΔV|')===10,'주기60분 반대편');await set('열 기여 선회 주기 P',30);
          await set('초기 열 기여 진폭',30);await set('60분간 열 기여 증가율',200);await set('선택 시각',60);
          require(lab.querySelectorAll('.js-plotly-plot')[1].layout.yaxis.range[1]>read('1X 진폭')&&lab.querySelectorAll('.js-plotly-plot')[0].layout.yaxis.range[1]>read('Overall RMS'),'Morton 큰 값 축 확장');
          await set('초기 열 기여 진폭',5);await set('60분간 열 기여 증가율',100);await choose(initial);
        }
        return {ok:true,checks};
      }catch(e){return {ok:false,checks,error:e.message};}
    })()`);
    if(smoke?.ok===false||!smoke)errors.push('열 벡터 조작 검사: '+(smoke?.error??'평가 실패'));
    if(smoke?.ok)console.log('     열 벡터 조작 '+smoke.checks+'항목 OK (감소·상쇄·위상·루프·주기·범위)');
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
  if (animSmoke) {
    // 움직이는 그림 (D-044): 패널마다 재생 → 1.5 s 뒤 SVG가 바뀌었는지 보고, 움직이는 중의 패널을 캡처한 뒤 멈춘다
    const slug = p.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home';
    const count = (await ev(`document.querySelectorAll('.anim-panel').length`)) ?? 0;
    if (!count) errors.push('움직이는 그림: .anim-panel이 없다');
    for (let i = 0; i < count; i++) {
      const r = await ev(`(async()=>{const p=document.querySelectorAll('.anim-panel')[${i}];p.scrollIntoView({block:'center'});const wait=ms=>new Promise(r=>setTimeout(r,ms));await wait(300);
        const svg=()=>[...p.querySelectorAll('svg')].map(s=>s.innerHTML).join('');const a=svg();const btn=p.querySelector('.anim-button');btn.click();await wait(1500);
        const b=svg();const rc=p.getBoundingClientRect();
        return {lab:p.closest('.lab-frame')?.querySelector('.lab-id')?.textContent??'?',changed:a!==b,status:p.querySelector('.anim-status')?.textContent??'',x:rc.left+scrollX,y:rc.top+scrollY,w:rc.width,h:rc.height};})()`);
      if (!r) { errors.push(`움직이는 그림 ${i}: 평가 실패`); continue; }
      if (!noShots) {
        const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
        const file = path.join(outDir, `${slug}-anim${i}.png`);
        await writeFile(file, Buffer.from(shot.data, 'base64'));
        shots.push(file);
      }
      await ev(`document.querySelectorAll('.anim-panel')[${i}].querySelector('.anim-button').click()`);
      if (!r.changed) errors.push(`움직이는 그림 ${i} (${r.lab}): 재생해도 그림이 바뀌지 않는다`);
      console.log(`     움직이는 그림 ${i} ${r.lab}: ${r.changed ? '움직임 OK' : '안 움직임'} · ${r.status}`);
    }
  }
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
