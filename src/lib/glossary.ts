/**
 * docs/Glossary.md의 표를 레퍼런스 > 용어집(/reference/glossary/)이 읽을 수 있게 푼다 (D-046). 순수 함수.
 * 표는 4열(용어 | 기호·단위 | 한 줄 뜻 | 처음 나오는 곳)이고, 처음 나오는 곳의 'P2-4 §2.2 → P7-1 §4.3' 같은 절 ID를 링크로 바꾼다.
 */

export interface GlossaryRef {
  /** 'P2-4' */
  id: string;
  part: number;
  section: number;
}

export interface GlossaryEntry {
  term: string;
  /** 기호·단위 ('—'이면 빈 문자열) */
  symbol: string;
  meaning: string;
  /** 처음 나오는 곳 원문 (내부 이슈 번호는 지운 것) */
  first: string;
  refs: GlossaryRef[];
  /** 처음 나오는 Part (절 ID가 없으면 0) */
  part: number;
  section: number;
  /** 표 안 순서 */
  order: number;
}

const INTERNAL = /\s*\((?:I|D)-\d{3}[^)]*\)/g;
const SECTION = /P(\d{1,2})-(\d{1,2})/g;

const clean = (s: string) => s.replace(INTERNAL, '').replace(/\s+/g, ' ').trim();

export function parseGlossary(md: string): GlossaryEntry[] {
  const out: GlossaryEntry[] = [];
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line.startsWith('|') || line.startsWith('|---') || line.startsWith('| 용어 |')) continue;
    const cells = line.slice(1, line.endsWith('|') ? -1 : undefined).split('|').map((c) => c.trim());
    if (cells.length < 4 || !cells[0]) continue;
    const [term, symbol, meaning, first] = cells;
    const refs = [...first.matchAll(SECTION)].map((m) => ({ id: `P${m[1]}-${m[2]}`, part: Number(m[1]), section: Number(m[2]) }));
    out.push({
      term: clean(term),
      symbol: symbol === '—' || symbol === '-' ? '' : clean(symbol),
      meaning: clean(meaning),
      first: clean(first),
      refs,
      part: refs[0]?.part ?? 0,
      section: refs[0]?.section ?? 0,
      order: out.length,
    });
  }
  return out;
}

/** Part → 절 → 표 순서로 정렬 */
export function sortGlossary(entries: GlossaryEntry[]): GlossaryEntry[] {
  return [...entries].sort((a, b) => (a.part || 99) - (b.part || 99) || a.section - b.section || a.order - b.order);
}

/** '처음 나오는 곳' 문자열을 글자 조각과 절 ID 조각으로 나눈다 (화면에서 절 ID만 링크로) */
export function splitSectionIds(text: string): { text: string; id?: string }[] {
  const parts: { text: string; id?: string }[] = [];
  let last = 0;
  for (const m of text.matchAll(SECTION)) {
    if (m.index! > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[0], id: m[0] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
