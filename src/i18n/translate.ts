/**
 * 한국어 문장 → 영어 문장 사전 (D-054). 그림 라벨·참고자료처럼 코드에 박힌 한국어를 코드를 고치지 않고 영어로 바꾼다.
 * 사전 키는 한국어 원문 그대로. 키에 {0}·{1}… 자리가 있으면 "그 자리에 무엇이든 오는 틀"로 보고,
 * 잡힌 값을 영어 쪽 같은 번호 자리에 넣는다: '{0} Hz로 보임' → 'appears as {0} Hz'.
 * 순수 함수.
 */

export type Dict = Readonly<Record<string, string>>;

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;
export const hasHangul = (s: string): boolean => HANGUL.test(s);

export interface CompiledDict {
  exact: ReadonlyMap<string, string>;
  patterns: readonly { re: RegExp; en: string }[];
}

const escapeRe = (s: string) => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');

/** 여러 사전을 하나로 (뒤의 것이 앞의 것을 덮음) */
export function compileDict(...dicts: Dict[]): CompiledDict {
  const exact = new Map<string, string>();
  const patterns: { re: RegExp; en: string }[] = [];
  for (const dict of dicts) {
    for (const [ko, en] of Object.entries(dict)) {
      if (/\{\d+\}/.test(ko)) {
        const src = ko
          .split(/(\{\d+\})/)
          .map((part) => (/^\{\d+\}$/.test(part) ? `(?<p${part.slice(1, -1)}>.+?)` : escapeRe(part)))
          .join('');
        patterns.push({ re: new RegExp(`^${src}$`, 's'), en });
      } else {
        exact.set(ko, en);
      }
    }
  }
  return { exact, patterns };
}

/** 한 문장을 옮긴다. 사전에 없으면 undefined */
export function translateText(s: string, dict: CompiledDict): string | undefined {
  const hit = dict.exact.get(s) ?? dict.exact.get(s.trim());
  if (hit !== undefined) return hit;
  for (const { re, en } of dict.patterns) {
    const m = s.match(re);
    if (m) return en.replace(/\{(\d+)\}/g, (all, i: string) => m.groups?.[`p${i}`] ?? all);
  }
  return undefined;
}

/**
 * 값 안의 모든 문자열 중 한글이 든 것을 사전으로 바꾼 사본. 숫자·배열 구조는 그대로.
 * 사전에 없는 문장은 원문을 두고 missing에 모은다 (영어 페이지 한글 검사가 잡는다).
 */
export function translateDeep<T>(value: T, dict: CompiledDict, missing?: Set<string>): T {
  if (typeof value === 'string') {
    if (!hasHangul(value)) return value;
    const en = translateText(value, dict);
    if (en === undefined) missing?.add(value);
    return (en ?? value) as T;
  }
  if (Array.isArray(value)) return value.map((v) => translateDeep(v, dict, missing)) as T;
  // 숫자 배열(Float64Array 등)·Map 같은 특별한 객체는 그대로 둔다 — 평범한 객체만 들어간다 (그림 heatmap의 z가 typed array)
  const proto = value && typeof value === 'object' ? Object.getPrototypeOf(value) : undefined;
  if (value && typeof value === 'object' && (proto === Object.prototype || proto === null)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = translateDeep(v, dict, missing);
    return out as T;
  }
  return value;
}
