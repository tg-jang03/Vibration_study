/**
 * 에일리어스(겉보기) 주파수: f_a = |f − k·f_s|, k = round(f / f_s)  (Contents §3)
 * 샘플링 주파수 fs로 측정한 f [Hz] 정현파가 0 ~ fs/2 사이 어디에 보이는지 돌려준다.
 */
export function aliasFrequency(f: number, fs: number): number {
  const k = Math.round(f / fs);
  return Math.abs(f - k * fs);
}
