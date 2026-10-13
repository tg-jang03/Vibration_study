// 영어 화면을 갖춘 랩 등록 (D-054): src/i18n/labsReady.ts와 src/pages/en/lab/[slug].astro에 한 줄씩.
//   node scripts/i18n/register-lab.mjs AveragingLab TsaLab
// 렌더 줄은 한국어 src/pages/lab/[slug].astro의 그 랩 줄을 그대로 가져와 lang="en"만 더한다 (props 유지).
// 이미 등록된 랩은 건너뛴다. 먼저 `node scripts/i18n/scan-lab.mjs <랩> --check`가 ✓여야 한다.
import { readFileSync, writeFileSync } from 'node:fs';

const names = process.argv.slice(2);
if (!names.length) {
  console.error('사용: node scripts/i18n/register-lab.mjs <랩 컴포넌트> [...]');
  process.exit(1);
}
const readyFile = 'src/i18n/labsReady.ts';
const enFile = 'src/pages/en/lab/[slug].astro';
const ko = readFileSync('src/pages/lab/[slug].astro', 'utf8');
let ready = readFileSync(readyFile, 'utf8');
let en = readFileSync(enFile, 'utf8');

for (const name of names) {
  if (ready.includes(`'${name}'`)) {
    console.log(`= ${name}: 이미 등록됨`);
    continue;
  }
  const line = ko.split('\n').find((l) => l.includes(`c === '${name}'`));
  if (!line) throw new Error(`${name}: 한국어 랩 페이지에 렌더 줄이 없다`);
  ready = ready.replace(/\n\]\);\s*$/, `\n  '${name}',\n]);\n`);
  const imports = [...en.matchAll(/^import \w+ from '\.\.\/\.\.\/\.\.\/components\/labs\/\w+';$/gm)];
  const lastImport = imports[imports.length - 1];
  const at = lastImport.index + lastImport[0].length;
  en = `${en.slice(0, at)}\nimport ${name} from '../../../components/labs/${name}';${en.slice(at)}`;
  en = en.replace('</LabPageShell>', `  ${line.trim().replace(/ (client:\w+)/, ' $1 lang="en"')}\n</LabPageShell>`);
  console.log(`+ ${name}`);
}
writeFileSync(readyFile, ready);
writeFileSync(enFile, en);
