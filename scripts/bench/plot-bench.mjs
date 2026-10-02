// 플롯 갱신 성능을 실제 시간으로 잰다 (Chrome DevTools Protocol, Edge 헤드리스).
// 헤드리스 캡처의 --virtual-time-budget 모드에서는 시계가 멈춰 시간이 0으로 나오므로 이 방법을 쓴다 (I-020).
//
// 사용법 (PowerShell):
//   npm run build; npx astro preview --port 4331        # 다른 터미널에서
//   $edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
//   $p = Start-Process $edge -ArgumentList "--headless=new","--disable-gpu","--remote-debugging-port=9333","--user-data-dir=$env:TEMP\edge-bench","about:blank" -PassThru
//   node scripts/bench/plot-bench.mjs 9333 "http://localhost:4331/Vibration_study/dev/lab-ui/?bench&n=4096"
//   Stop-Process -Id $p.Id
//
// 페이지는 ?bench 를 받으면 벤치마크를 돌리고 결과를 .lab-footer 에 "그리기 평균 … ms"로 쓴다 (LabUiDemo 참고).
const [port, ...urls] = process.argv.slice(2);
if (!port || urls.length === 0) {
  console.error('usage: node scripts/bench/plot-bench.mjs <debug-port> <url> [url ...]');
  process.exit(1);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageWebSocketUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // 브라우저가 아직 뜨는 중
    }
    await sleep(250);
  }
  throw new Error('디버깅 대상 페이지를 찾지 못했다');
}

const ws = new WebSocket(await pageWebSocketUrl());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

for (const url of urls) {
  await send('Page.navigate', { url });
  let text = '';
  for (let i = 0; i < 120; i++) {
    await sleep(500);
    const r = await send('Runtime.evaluate', {
      expression: "document.querySelector('.lab-footer')?.textContent ?? ''",
      returnByValue: true,
    });
    text = r.result?.result?.value ?? '';
    if (text.includes('그리기 평균')) break;
  }
  console.log(`${url} => ${text.replace(/^.*?\)\s*/, '')}`);
}
await send('Browser.close').catch(() => {});
ws.close();
