// 번역 상태 (D-054): 한국어 절 페이지마다 영어판이 있는지, 영어판이 한국어 원본의 지금 내용을 옮긴 것인지.
// 영어 MDX 머리의 sourceHash = 번역할 때의 한국어 파일 해시(sha256 앞 10자리, 줄바꿈 LF).
//   npm run i18n:status              → 표 (낡은 번역은 ⚠). 늘 종료 코드 0 — 한국어 작성을 막지 않는다
//   npm run i18n:status -- --stamp p2-3   → 다시 번역을 마친 뒤 그 영어 파일의 sourceHash를 지금 값으로
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pages = 'src/pages';
const hashOf = (file) => createHash('sha256').update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 10);
const order = (f) => f.match(/p(\d+)-(\d+)/).slice(1).map(Number);
const ko = readdirSync(pages)
  .filter((f) => /^p\d+-\d+\.mdx$/.test(f))
  .sort((a, b) => order(a)[0] - order(b)[0] || order(a)[1] - order(b)[1]);

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
