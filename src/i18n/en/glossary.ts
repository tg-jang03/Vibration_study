/**
 * 용어집(docs/Glossary.md)의 영어 (D-054·D-058). 한국어 표가 원본이고 영어는 행마다 여기(Part 묶음 파일)에 둔다.
 * - 키 = 한국어 "용어" 칸. 같은 용어가 두 줄이면 '용어 · 처음 나오는 곳' (glossaryKeys)
 * - 영어 symbol·first는 한국어 기호·처음 나오는 곳 칸에 한글이 있을 때만 둔다 (first의 절 ID는 한국어와 같은 순서)
 * - 빠진 행·남는 키·한글은 glossary.test.ts가, 한국어 행이 바뀐 뒤의 낡은 영어는 npm run i18n:status가 알린다
 */
import type { GlossaryEntry } from '../../lib/glossary';
import type { Lang } from '../index';
import PART1 from './glossary/part1';
import PART2 from './glossary/part2';
import PART3_5 from './glossary/part3-5';
import PART6_11 from './glossary/part6-11';

export interface GlossEn {
  /** 영어 용어 (한국어 칸의 괄호 속 영어가 있으면 보통 그것) */
  term: string;
  /** 한 줄 뜻 */
  meaning: string;
  /** 한국어 기호 칸에 한글이 있을 때만 */
  symbol?: string;
  /** 한국어 처음 나오는 곳 칸에 한글이 있을 때만 (절 ID·§ 번호는 그대로) */
  first?: string;
}

export const GLOSSARY_EN: Record<string, GlossEn> = { ...PART1, ...PART2, ...PART3_5, ...PART6_11 };

/** 행마다 사전 키: 용어, 같은 용어가 여러 줄이면 '용어 · 처음 나오는 곳' (표 전체를 넘겨야 한다) */
export function glossaryKeys(entries: readonly Pick<GlossaryEntry, 'term' | 'first'>[]): string[] {
  const count = new Map<string, number>();
  for (const e of entries) count.set(e.term, (count.get(e.term) ?? 0) + 1);
  return entries.map((e) => ((count.get(e.term) ?? 0) > 1 ? `${e.term} · ${e.first}` : e.term));
}

/** 화면에 보일 행: 한국어는 그대로, 영어는 사전으로 (없으면 한국어가 남고 테스트·verify:i18n이 잡는다) */
export function glossaryText(entries: readonly GlossaryEntry[], lang: Lang): GlossaryEntry[] {
  if (lang === 'ko') return [...entries];
  const keys = glossaryKeys(entries);
  return entries.map((e, i) => {
    const en = GLOSSARY_EN[keys[i]];
    return en ? { ...e, term: en.term, meaning: en.meaning, symbol: en.symbol ?? e.symbol, first: en.first ?? e.first } : e;
  });
}
