// 랩 소스에서 번역 키 찾기 (D-054). src/i18n/i18n.test.ts와 아래 CLI가 함께 쓴다.
//   tr`…`  — 태그 템플릿. ${…} 자리는 {0}, {1}… 로 키에 들어간다
//   tr('…') · k('…') — 문자열 하나가 그대로 키
// 결과의 rest = 감싼 부분과 주석을 지운 소스. 여기 남은 한글은 번역 누락이다.
//
// CLI: node scripts/i18n/scan-lab.mjs SamplingLab   → 사전 뼈대(이미 있는 번역은 채워서)를 출력
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;

/** @param {string} src @returns {{ keys: string[], rest: string }} */
export function scanLabSource(src) {
  const keys = [];
  // 주석 지우기 (문자열 안의 // 는 드물다: URL은 랩 화면에 없다)
  const s = src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
  let out = '';
  let i = 0;
  while (i < s.length) {
    // 태그 이름: tr(번역), k(모듈 맨 위 표시). 앞 글자가 식별자의 일부면 다른 이름이다
    const before = /[\w$.]/.test(s[i - 1] ?? '');
    const tag = before ? '' : s.startsWith('tr', i) ? 'tr' : s[i] === 'k' ? 'k' : '';
    const o = i + tag.length;
    if (tag === 'tr' && s[o] === '`') {
      let j = o + 1;
      let raw = '';
      let n = 0;
      while (j < s.length && s[j] !== '`') {
        if (s[j] === '\\') {
          raw += s[j] + s[j + 1];
          j += 2;
        } else if (s[j] === '$' && s[j + 1] === '{') {
          let depth = 1;
          j += 2;
          const start = j;
          while (j < s.length && depth > 0) {
            if (s[j] === '{') depth++;
            else if (s[j] === '}') depth--;
            j++;
          }
          const nested = scanLabSource(s.slice(start, j - 1));
          keys.push(...nested.keys);
          out += nested.rest;
          raw += `{${n++}}`;
        } else {
          raw += s[j++];
        }
      }
      keys.push(new Function(`return \`${raw}\`;`)());
      i = j + 1;
      out += ' ';
      continue;
    }
    if (tag && s[o] === '(' && (s[o + 1] === "'" || s[o + 1] === '"')) {
      const q = s[o + 1];
      let j = o + 2;
      while (j < s.length && s[j] !== q) j += s[j] === '\\' ? 2 : 1;
      keys.push(new Function(`return ${s.slice(o + 1, j + 1)};`)());
      i = j + 1;
      out += ' (';
      continue;
    }
    out += s[i++];
  }
  return { keys, rest: out };
}

/** 랩 파일과 그 파일이 부르는 같은 폴더의 하위 컴포넌트 (./Name) */
export function labFiles(labsDir, component) {
  const seen = new Set();
  const walk = (name) => {
    if (seen.has(name)) return;
    const file = join(labsDir, `${name}.tsx`);
    if (!existsSync(file)) return;
    seen.add(name);
    for (const m of readFileSync(file, 'utf8').matchAll(/from '\.\/(\w+)'/g)) walk(m[1]);
  };
  walk(component);
  return [...seen];
}

export const hasHangul = (s) => HANGUL.test(s);

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '../../src');
  const name = process.argv[2];
  if (!name) {
    console.error('사용: node scripts/i18n/scan-lab.mjs <랩 컴포넌트 이름> [--check]');
    process.exit(1);
  }
  if (process.argv.includes('--check')) {
    // 사전까지 맞춰 보기 (등록 전에도): 감싸지 않은 한글 0, 사전에 없는 키 0, 쓰지 않는 키 0, 영어 값에 한글 0
    const { pathToFileURL } = await import('node:url');
    let bad = 0;
    for (const file of labFiles(join(root, 'components/labs'), name)) {
      const { keys, rest } = scanLabSource(readFileSync(join(root, 'components/labs', `${file}.tsx`), 'utf8'));
      const left = rest.split('\n').filter(hasHangul);
      const need = [...new Set(keys)].filter(hasHangul);
      const dictFile = join(root, 'i18n/en/labs', `${file}.ts`);
      const dict = need.length && existsSync(dictFile) ? (await import(pathToFileURL(dictFile).href)).default : {};
      const missing = need.filter((k) => !(k in dict));
      const unused = Object.keys(dict).filter((k) => !keys.includes(k));
      const hangulValues = Object.entries(dict).filter(([, v]) => hasHangul(v)).map(([k]) => k);
      const n = left.length + missing.length + unused.length + hangulValues.length;
      bad += n;
      console.log(`${n ? '✗' : '✓'} ${file}: 키 ${need.length}, 감싸지 않은 한글 ${left.length}, 사전에 없음 ${missing.length}, 안 쓰는 키 ${unused.length}, 한글 값 ${hangulValues.length}`);
      for (const l of left) console.log(`    감싸지 않음: ${l.trim().slice(0, 110)}`);
      for (const k of missing) console.log(`    사전에 없음: ${JSON.stringify(k)}`);
      for (const k of unused) console.log(`    안 쓰는 키: ${JSON.stringify(k)}`);
      for (const k of hangulValues) console.log(`    한글 값: ${JSON.stringify(k)}`);
    }
    process.exit(bad ? 1 : 0);
  }
  for (const file of labFiles(join(root, 'components/labs'), name)) {
    const { keys, rest } = scanLabSource(readFileSync(join(root, 'components/labs', `${file}.tsx`), 'utf8'));
    const left = rest.split('\n').filter(hasHangul);
    console.log(`// ── ${file}.tsx: 키 ${new Set(keys).size}개, 감싸지 않은 한글 줄 ${left.length}개`);
    for (const l of left) console.log(`//   ! ${l.trim().slice(0, 120)}`);
    const uniq = [...new Set(keys)].filter(hasHangul);
    console.log(`// src/i18n/en/labs/${file}.ts`);
    console.log("import type { Dict } from '../../translate';\n\nconst EN: Dict = {");
    for (const k of uniq) console.log(`  ${JSON.stringify(k)}: '',`);
    console.log('};\n\nexport default EN;\n');
  }
}
