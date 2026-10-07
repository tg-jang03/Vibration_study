// 빌드 결과(dist)의 링크 점검: 사이트 안 링크의 대상 페이지·앵커가 있는지, 깨진 href(JS 식이 그대로 남은 것 등)가 없는지.
// 사용: npm run build → npm run verify:links
import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const base = '/Vibration_study/';
const pages = [];
const walk = (d) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
};
walk(dist);
const html = new Map(pages.map((p) => [p, fs.readFileSync(p, 'utf8')]));
const ids = new Map([...html].map(([p, h]) => [p, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
let n = 0;
const bad = [];
for (const [p, h] of html) {
  for (const m of h.matchAll(/href="([^"]*)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|data:)/.test(u)) continue;
    n++;
    if (!u.startsWith(base) && !u.startsWith('#')) {
      bad.push(`${p} → ${u} (사이트 기준 경로가 아님)`);
      continue;
    }
    const [pth, hash] = u.split('#');
    let target = p;
    if (pth) {
      const rel = decodeURIComponent(pth.slice(base.length));
      target = [path.join(dist, rel), path.join(dist, rel, 'index.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
      if (!target) {
        bad.push(`${p} → ${u} (페이지 없음)`);
        continue;
      }
    }
    if (hash && ids.has(target) && !ids.get(target).has(decodeURIComponent(hash))) bad.push(`${p} → ${u} (앵커 없음)`);
  }
}
console.log(`링크 ${n}개, 문제 ${bad.length}개`);
for (const b of bad.slice(0, 30)) console.log('  ' + b);
process.exitCode = bad.length ? 1 : 0;
