/**
 * 랩 화면 문자열 (D-054). 한국어 원문을 코드에 그대로 두고 `tr`로 감싼다 (`t`는 랩마다 시간 변수라 피한다):
 *   const tr = makeT(lang, EN);         // EN = src/i18n/en/labs/<파일>.ts 의 사전
 *   tr`샘플링 주파수`                    → 'Sampling frequency'
 *   tr`${f} Hz로 보임`                   → 사전 키 '{0} Hz로 보임' → 'appears as {0} Hz'
 *   tr(PRESET.label)                     → 모듈 맨 위 배열의 글은 k('…')로 표시해 두고 렌더할 때 tr로 옮긴다
 * 하위 컴포넌트는 LabFrame 안에서 그려지므로 useLang()으로 언어를 받는다. 검사: src/i18n/i18n.test.ts
 * 한국어(lang 'ko')는 원문을 그대로 돌려준다. 영어 사전에 없으면 원문(한글)이 남고 검사가 잡는다.
 */
import type { Lang } from './index';
import type { Dict } from './translate';

export type T = {
  (strings: TemplateStringsArray, ...values: unknown[]): string;
  (key: string, ...values: unknown[]): string;
};

/** 템플릿 조각을 사전 키로: ['', ' Hz로 보임'] → '{0} Hz로 보임' */
export function templateKey(strings: readonly string[]): string {
  return strings.reduce((acc, s, i) => acc + (i > 0 ? `{${i - 1}}` : '') + s, '');
}

export function fillTemplate(template: string, values: readonly unknown[]): string {
  return template.replace(/\{(\d+)\}/g, (all, i: string) => (Number(i) < values.length ? String(values[Number(i)]) : all));
}

export function makeT(lang: Lang, en: Dict = {}): T {
  return ((first: TemplateStringsArray | string, ...values: unknown[]) => {
    const key = typeof first === 'string' ? first : templateKey(first);
    const template = lang === 'en' ? (en[key] ?? key) : key;
    return values.length > 0 ? fillTemplate(template, values) : template;
  }) as T;
}

/** 모듈 맨 위(컴포넌트 밖)의 번역할 글 표시 — 값은 그대로, 검사기가 사전 키로 센다 */
export const k = (s: string): string => s;
