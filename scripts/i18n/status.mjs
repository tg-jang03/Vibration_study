// 번역 상태 (D-054): 한국어 절 페이지마다 영어판이 있는지, 영어판이 한국어 원본의 지금 내용을 옮긴 것인지.
// 영어 MDX 머리의 sourceHash = 번역할 때의 한국어 파일 해시(sha256 앞 10자리, 줄바꿈 LF).
//   npm run i18n:status              → 표 (낡은 번역은 ⚠). 늘 종료 코드 0 — 한국어 작성을 막지 않는다
//   npm run i18n:status -- --stamp p2-3   → 다시 번역을 마친 뒤 그 영어 파일의 sourceHash를 지금 값으로
//   npm run i18n:status -- --stamp-glossary → 용어집 영어(src/i18n/en/glossary/*)를 고친 뒤 행마다 한국어 해시를 지금 값으로 (D-058)
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const pages = 'src/pages';
const hashOf = (file) => createHash('sha256').update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 10);
const order = (f) => f.match(/p(\d+)-(\d+)/).slice(1).map(Number);
const ko = readdirSync(pages)
  .filter((f) => /^p\d+-\d+\.mdx$/.test(f))
  .sort((a, b) => order(a)[0] - order(b)[0] || order(a)[1] - order(b)[1]);

// ── 용어집 (D-058): 행 키(src/i18n/en/glossary.ts의 glossaryKeys와 같은 규칙)마다 한국어 행의 해시 ──
const GLOSSARY_HASHES = 'src/i18n/en/glossary-source.json';
const { parseGlossary } = await import(pathToFileURL(resolve('src/lib/glossary.ts')).href);
const glossaryRows = () => {
  const rows = parseGlossary(readFileSync('docs/Glossary.md', 'utf8'));
  const count = new Map();
  for (const r of rows) count.set(r.term, (count.get(r.term) ?? 0) + 1);
  return rows.map((r) => ({
    key: count.get(r.term) > 1 ? `${r.term} · ${r.first}` : r.term,
    hash: createHash('sha256').update([r.term, r.symbol, r.meaning, r.first].join('|')).digest('hex').slice(0, 8),
  }));
};
if (process.argv.includes('--stamp-glossary')) {
  const now = Object.fromEntries(glossaryRows().map((r) => [r.key, r.hash]));
  writeFileSync(GLOSSARY_HASHES, `${JSON.stringify(now, null, 1)}\n`);
  console.log(`${GLOSSARY_HASHES}: 용어 ${Object.keys(now).length}행`);
  process.exit(0);
}

const stamp = process.argv.indexOf('--stamp');
if (stamp > 0) {
  const name = process.argv[stamp + 1]?.replace(/\.mdx$/, '');
  const en = join(pages, 'en', `${name}.mdx`);
  if (!name || !existsSync(en)) {
    console.error(`영어 파일이 없습니다: ${en}`);
    process.exit(1);
  }
  const h = hashOf(join(pages, `${name}.mdx`));
  writeFileSync(en, readFileSync(en, 'utf8').replace(/^sourceHash: .*$/m, `sourceHash: ${h}`));
  console.log(`${en}: sourceHash ${h}`);
  process.exit(0);
}

let done = 0;
const stale = [];
for (const f of ko) {
  const en = join(pages, 'en', f);
  if (!existsSync(en)) continue;
  done++;
  const recorded = readFileSync(en, 'utf8').match(/^sourceHash: (\w+)$/m)?.[1];
  const now = hashOf(join(pages, f));
  if (recorded !== now) stale.push(`${f} (영어 ${recorded ?? '없음'} → 한국어 지금 ${now})`);
}
console.log(`영어판 ${done} / ${ko.length}절`);
const missing = ko.filter((f) => !existsSync(join(pages, 'en', f))).map((f) => f.replace('.mdx', ''));
console.log(`번역 전: ${missing.join(' ')}`);
if (stale.length) {
  console.log('⚠ 한국어가 바뀐 뒤 고치지 않은 영어판:');
  for (const s of stale) console.log(`  ${s}`);
  console.log('  → 바뀐 부분을 옮긴 뒤 npm run i18n:status -- --stamp <p2-3>');
} else if (done) {
  console.log('영어판은 모두 지금 한국어 원본을 옮긴 것');
}

// 용어집: 영어를 옮긴 뒤 한국어 행이 바뀐 것 (빠진 행은 glossary.test.ts가 잡는다)
const recorded = existsSync(GLOSSARY_HASHES) ? JSON.parse(readFileSync(GLOSSARY_HASHES, 'utf8')) : {};
const glossaryStale = glossaryRows().filter((r) => recorded[r.key] !== r.hash).map((r) => r.key);
if (glossaryStale.length) {
  console.log(`⚠ 용어집: 한국어 행이 바뀌었거나 새로 생긴 뒤 영어를 확인하지 않은 행 ${glossaryStale.length}개`);
  for (const k of glossaryStale.slice(0, 30)) console.log(`  ${k}`);
  console.log('  → src/i18n/en/glossary/*의 그 행을 고친 뒤 npm run i18n:status -- --stamp-glossary');
} else {
  console.log('용어집 영어는 모두 지금 한국어 행을 옮긴 것');
}
