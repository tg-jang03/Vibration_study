/**
 * 시드 고정 난수 (D-011): 같은 시드 → 같은 수열 → 같은 실험 결과.
 * - 균등분포: mulberry32 (32비트 상태, 랩 용도로 충분히 빠르고 고르다)
 * - 정규분포: Box–Muller 변환 (한 번에 두 개를 만들어 하나는 보관)
 */
export interface Rng {
  /** [0, 1) 균등분포 */
  uniform(): number;
  /** 평균 0, 표준편차 1인 정규분포 */
  normal(): number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  let spare: number | undefined;

  const uniform = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };

  const normal = (): number => {
    if (spare !== undefined) {
      const s = spare;
      spare = undefined;
      return s;
    }
    let u = 0;
    while (u === 0) u = uniform(); // log(0) 방지
    const v = uniform();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };

  return { uniform, normal };
}
