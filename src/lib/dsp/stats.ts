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
