/** 시간영역 기본 통계 (P2-2, P2-7에서 사용). 입력 단위 그대로. */

export function rms(x: ArrayLike<number>): number {
  if (x.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < x.length; i++) sumSq += x[i] * x[i];
  return Math.sqrt(sumSq / x.length);
}

/** 절댓값 최대 (true peak) */
export function peak(x: ArrayLike<number>): number {
  let max = 0;
  for (let i = 0; i < x.length; i++) max = Math.max(max, Math.abs(x[i]));
  return max;
}

/** Crest factor CF = Peak / RMS (정현파 √2, Contents §3) */
export function crestFactor(x: ArrayLike<number>): number {
  const r = rms(x);
  return r === 0 ? 0 : peak(x) / r;
}

/** 평균과 k차 중심 모멘트 */
function centralMoment(x: ArrayLike<number>, k: number): { mean: number; m2: number; mk: number } {
  const n = x.length;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += x[i];
  mean /= Math.max(1, n);
  let m2 = 0;
  let mk = 0;
  for (let i = 0; i < n; i++) {
    const d = x[i] - mean;
    m2 += d * d;
    mk += d ** k;
  }
  return { mean, m2: m2 / Math.max(1, n), mk: mk / Math.max(1, n) };
}

/** 첨도 K = E[(x − μ)⁴] / σ⁴ (P5-6, P5-7). 정규분포 3, 정현파 1.5, 드문 충격은 3보다 훨씬 크다. 일정한 신호는 0 */
export function kurtosis(x: ArrayLike<number>): number {
  const { m2, mk } = centralMoment(x, 4);
  return m2 === 0 ? 0 : mk / (m2 * m2);
}

/** 왜도 S = E[(x − μ)³] / σ³ (P5-7). 위아래 대칭이면 0, 한쪽으로 길게 튀면 그쪽 부호 */
export function skewness(x: ArrayLike<number>): number {
  const { m2, mk } = centralMoment(x, 3);
  return m2 === 0 ? 0 : mk / m2 ** 1.5;
}
