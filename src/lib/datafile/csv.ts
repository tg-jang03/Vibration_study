/**
 * CSV·TXT 숫자 열 읽기 (P11-2 · LAB-DATA-01). 순수 함수.
 * - 구분자: 탭 · 쉼표 · 세미콜론 · 공백을 앞 줄들에서 알아낸다. 세미콜론 구분이면 소수점 쉼표도 받는다.
 * - 첫 줄이 숫자가 아니면 머리 줄(열 이름)로 본다. # 또는 % 로 시작하는 줄은 주석.
 * - 시간 열(이름이 time·t·sec·시간이거나, 첫 열이 일정 간격으로 늘면)이 있으면 그 간격으로 f_s를 구한다.
 */

export interface CsvData {
  names: string[];
  columns: Float64Array[];
  /** 시간 열의 번호 (없으면 -1) */
  timeColumn: number;
  /** 시간 열에서 구한 f_s (없으면 null) */
  fs: number | null;
}

const isNum = (s: string) => s.trim() !== '' && Number.isFinite(Number(s));

function splitter(lines: string[]): (line: string) => string[] {
  const cand: [string, RegExp][] = [
    ['\t', /\t/],
    [';', /;/],
    [',', /,/],
    [' ', /\s+/],
  ];
  for (const [, re] of cand) {
    const counts = lines.map((l) => l.trim().split(re).length);
    if (counts.every((c) => c > 1 && c === counts[0])) return (l) => l.trim().split(re);
  }
  return (l) => [l.trim()];
}

export function parseCsv(text: string, maxRows = 2_000_000): CsvData {
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '' && !/^\s*[#%]/.test(l));
  if (lines.length === 0) throw new Error('읽을 줄이 없습니다');
  const split = splitter(lines.slice(0, Math.min(lines.length, 20)));
  const semicolon = lines[0].includes(';');
  const cell = (s: string) => (semicolon ? s.replace(',', '.') : s).trim().replace(/^"|"$/g, '');
  const first = split(lines[0]).map(cell);
  let names: string[];
  let start = 0;
  if (first.some((s) => !isNum(s))) {
    names = first.map((s, i) => s || `열 ${i + 1}`);
    start = 1;
  } else names = first.map((_, i) => `열 ${i + 1}`);
  const rows = lines.slice(start, start + maxRows);
  const nCol = names.length;
  const columns = Array.from({ length: nCol }, () => new Float64Array(rows.length));
  let r = 0;
  for (const line of rows) {
    const cells = split(line).map(cell);
    if (cells.length < nCol || !cells.slice(0, nCol).every(isNum)) continue;
    for (let c = 0; c < nCol; c++) columns[c][r] = Number(cells[c]);
    r++;
  }
  const cols = columns.map((c) => c.slice(0, r));
  if (r < 2) throw new Error('숫자 줄이 두 줄 이상 있어야 합니다');
  // 시간 열 찾기
  let timeColumn = names.findIndex((n) => /^(time|t|sec|seconds?|시간|시각)(\s*\[.*\])?$/i.test(n.trim()));
  if (timeColumn < 0 && nCol > 1) {
    const c0 = cols[0];
    const d = c0[1] - c0[0];
    let ok = d > 0;
    for (let i = 2; ok && i < Math.min(r, 1000); i++) ok = Math.abs(c0[i] - c0[i - 1] - d) <= 1e-6 * Math.max(1, Math.abs(d)) + 1e-9 * Math.abs(c0[i]);
    if (ok) timeColumn = 0;
  }
  let fs: number | null = null;
  if (timeColumn >= 0) {
    const t = cols[timeColumn];
    const span = t[t.length - 1] - t[0];
    if (span > 0) fs = (t.length - 1) / span;
  }
  return { names, columns: cols, timeColumn, fs };
}
