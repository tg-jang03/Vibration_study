// 영어 페이지에 남은 한글 찾기 (D-054). 빌드 뒤에 실행: npm run build → npm run verify:i18n
// dist/en/**/*.html의 글·속성·랩 초기 화면(SSR)·수식에서 한글을 찾는다. lang="ko"로 표시한 요소(언어 전환 "한국어")는 뺀다.
// 하나라도 있으면 종료 코드 1 — 사전(src/i18n/en/*)이나 영어 MDX에서 빠진 번역이다.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const root = join(dist, 'en');
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : name.endsWith('.html') ? [p] : [];
  });
}

let files;
try {
  files = walk(root);
} catch {
  console.error(`${root}가 없습니다 — 먼저 npm run build`);
  process.exit(1);
}

let bad = 0;
for (const file of files) {
  let html = readFileSync(file, 'utf8');
  // lang="ko" 요소는 일부러 한국어다 (같은 태그가 안에 겹치지 않는 짧은 요소만 쓴다)
  html = html.replace(/<(\w+)\b[^>]*\blang="ko"[^>]*>[\s\S]*?<\/\1>/g, '');
  // 구조화 데이터의 다른 이름(alternateName: 한국어 사이트 이름)은 일부러 둔다
  html = html.replace(/"alternateName":"[^"]*"/g, '');
  const hits = [];
  const re = new RegExp(`.{0,40}${HANGUL.source}+.{0,40}`, 'g');
  for (const m of html.matchAll(re)) hits.push(m[0].replace(/\s+/g, ' '));
  if (hits.length) {
    bad += hits.length;
    console.log(`✗ ${relative(dist, file)} — 한글 ${hits.length}곳`);
    for (const h of hits.slice(0, 8)) console.log(`    … ${h}`);
    if (hits.length > 8) console.log(`    (외 ${hits.length - 8}곳)`);
  }
}
console.log(`영어 페이지 ${files.length}개, 한글 ${bad}곳`);
process.exit(bad ? 1 : 0);
