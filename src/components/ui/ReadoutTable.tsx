import { formatError, formatNumber } from '../../lib/format';

export interface Readout {
  label: string;
  /** 측정(계산)값 */
  value: number;
  /** 이론값. 있으면 오차 열을 채운다 */
  theory?: number;
  unit?: string;
  /** 유효숫자 (기본 4) */
  sig?: number;
}

interface ReadoutTableProps {
  rows: readonly Readout[];
  caption?: string;
  /** 비교 열 이름 (기본 '이론'). 이론값이 아닌 기준(예: 건전할 때)과 비교할 때 바꾼다 */
  theoryLabel?: string;
  /** 상대 차이 열 이름 (기본 '오차') */
  errorLabel?: string;
}

/** 읽음값 vs 이론값 표 (Roadmap §5-4): 측정값·이론값·상대 오차 */
export default function ReadoutTable({ rows, caption = '읽음값', theoryLabel = '이론', errorLabel = '오차' }: ReadoutTableProps) {
  const hasTheory = rows.some((r) => r.theory !== undefined);
  return (
    <table className="readout-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">항목</th>
          <th scope="col">측정</th>
          {hasTheory && <th scope="col">{theoryLabel}</th>}
          {hasTheory && <th scope="col">{errorLabel}</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const unit = r.unit ? ` ${r.unit}` : '';
          return (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>
                {formatNumber(r.value, r.sig)}
                {unit}
              </td>
              {hasTheory && (
                <td>
                  {r.theory === undefined ? '—' : `${formatNumber(r.theory, r.sig)}${unit}`}
                </td>
              )}
              {hasTheory && <td>{r.theory === undefined ? '—' : formatError(r.value, r.theory)}</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
