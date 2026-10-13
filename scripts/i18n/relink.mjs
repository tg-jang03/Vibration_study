// 영어 절 페이지의 옛 한국어 링크를 영어 주소로 바꾼다 (D-054).
//   node scripts/i18n/relink.mjs
// 링크한 절·랩에 나중에 영어판이 생기면 withBase('/p1-8/#한국어-앵커') → withBase('/en/p1-8/') (한국어 앵커는 영어 페이지에 없어 뺀다).
// 영어판 = src/pages/en/p*.mdx가 있는 절, src/i18n/labsReady.ts에 든 랩. 남은 것은 i18n.test.ts가 잡는다.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const enDir = 'src/pages/en';
const files = readdirSync(enDir).filter((f) => /^p\d+-\d+\.mdx$/.test(f));
const sections = new Set(files.map((f) => f.replace('.mdx', '')));
const ready = new Set([...readFileSync('src/i18n/labsReady.ts', 'utf8').matchAll(/^\s*'(\w+)',$/gm)].map((m) => m[1]));
const labs = new Set(
  [...readFileSync('src/data/labs.ts', 'utf8').matchAll(/slug: '([^']+)'.*?component: '(\w+)'/g)]
    .filter((m) => ready.has(m[2]))
    .map((m) => `lab/${m[1]}`),
);

let total = 0;
for (const f of files) {
  const path = `${enDir}/${f}`;
  const text = readFileSync(path, 'utf8');
  let n = 0;
  const out = text.replace(/withBase\('\/(p\d+-\d+|lab\/[^/']+)\/[^']*'\)/g, (link, target) => {
    if (!sections.has(target) && !labs.has(target)) return link;
    n++;
    return `withBase('/en/${target}/')`;
  });
  if (n) {
    writeFileSync(path, out);
    console.log(`${f}: ${n}곳`);
    total += n;
  }
}
console.log(`바꾼 링크 ${total}곳`);
