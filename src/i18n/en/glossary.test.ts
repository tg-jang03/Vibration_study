/**
 * 용어집 영어 (D-058): docs/Glossary.md의 모든 행에 영어가 있고, 남는 키·한글이 없으며, 절 ID가 한국어와 같은지.
 * Part 묶음 파일마다 따로 돌릴 수 있다: npx vitest run src/i18n/en/glossary.test.ts -t part2
 */
import { describe, expect, it } from 'vitest';
import glossaryMd from '../../../docs/Glossary.md?raw';
import { parseGlossary } from '../../lib/glossary';
import { hasHangul } from '../translate';
import { GLOSSARY_EN, glossaryKeys, glossaryText, type GlossEn } from './glossary';
import PART1 from './glossary/part1';
import PART2 from './glossary/part2';
import PART3_5 from './glossary/part3-5';
import PART6_11 from './glossary/part6-11';

const entries = parseGlossary(glossaryMd);
const keys = glossaryKeys(entries);
const ids = (s: string) => [...s.matchAll(/P\d{1,2}-\d{1,2}/g)].map((m) => m[0]).join(' ');
const FILES: [string, number[], Record<string, GlossEn>][] = [
  ['part1', [1], PART1],
  ['part2', [2], PART2],
  ['part3-5', [3, 4, 5], PART3_5],
  ['part6-11', [6, 7, 8, 9, 10, 11], PART6_11],
];

describe.each(FILES)('용어집 영어 %s', (_name, parts, file) => {
  const mine = entries.map((e, i) => ({ e, key: keys[i] })).filter(({ e }) => parts.includes(e.part));

  it('그 Part의 행이 모두 있고 남는 키가 없다', () => {
    const missing = mine.filter(({ key }) => !file[key]).map(({ key }) => key);
    const extra = Object.keys(file).filter((k) => !mine.some(({ key }) => key === k));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it('영어에 한글이 없고, 한글 기호·처음 나오는 곳은 영어로, 절 ID는 같은 순서', () => {
    const bad: string[] = [];
    for (const { e, key } of mine) {
      const en = file[key];
      if (!en) continue;
      if (!en.term.trim() || !en.meaning.trim()) bad.push(`${key}: 빈 칸`);
      for (const [field, v] of Object.entries(en)) if (hasHangul(String(v))) bad.push(`${key}.${field}: 한글`);
      if (hasHangul(e.symbol) && !en.symbol) bad.push(`${key}: symbol 필요 (${e.symbol})`);
      if (hasHangul(e.first) && !en.first) bad.push(`${key}: first 필요 (${e.first})`);
      if (en.first && ids(en.first) !== ids(e.first)) bad.push(`${key}: first 절 ID ${ids(en.first)} ≠ ${ids(e.first)}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('용어집 영어 전체', () => {
  it('키가 겹치지 않고 모든 행에 영어가 있다', () => {
    expect(new Set(keys).size).toBe(keys.length);
    expect(Object.keys(GLOSSARY_EN).length).toBe(keys.length);
  });
  it('한국어는 원본 그대로, 영어 화면에는 한글이 남지 않는다', () => {
    expect(glossaryText(entries, 'ko')).toEqual(entries);
    const en = glossaryText(entries, 'en');
    expect(en.filter((e) => hasHangul(`${e.term} ${e.symbol} ${e.meaning} ${e.first}`)).map((e) => e.term)).toEqual([]);
  });
});
