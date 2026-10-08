/**
 * 도는 화살표(위상자, Phasor) — 애니메이션 랩 공용 계산 (D-044: BAS-01·SMP-01·FOU-01·MOD-01·FULL-01).
 * 순수 함수. 그리기는 `components/ui/PhasorView.tsx`.
 *
 * 관례: 화살표 하나 = 길이 A, 각도 θ(t) = 2πft + φ. 복소수로 A·e^{jθ}.
 * - 실수부 A cos θ가 신호 x(t)다 (Contents §3: 정현파는 A·cos(2πft + φ)).
 * - f < 0이면 반대로(시계 방향) 돈다 — Full spectrum의 역방향 성분.
 * - 화살표를 꼬리-머리로 이으면 끝점의 실수부 = 성분들의 합 (푸리에 급수·측대역·맥놀이).
 */

export interface Phasor {
  /** 길이 (진폭, ≥ 0) */
  amp: number;
  /** 회전 주파수 [Hz]. 음수면 반대 방향 */
  freq: number;
  /** t = 0의 각도 [rad] */
  phase: number;
}

export interface ComplexPoint {
  re: number;
  im: number;
}

const TWO_PI = 2 * Math.PI;

/**
 * 시각 t에서 화살표 사슬의 이음점: 원점 + 각 화살표 끝 (arrows.length + 1개).
 * frameFreq [Hz]로 같이 도는 틀에서 본다 — frameFreq = 반송파 주파수면 반송파 화살표가 멈춰 보인다.
 */
export function phasorChain(arrows: readonly Phasor[], t: number, frameFreq = 0): ComplexPoint[] {
  const points: ComplexPoint[] = [{ re: 0, im: 0 }];
  let re = 0;
  let im = 0;
  for (const a of arrows) {
    const theta = TWO_PI * (a.freq - frameFreq) * t + a.phase;
    re += a.amp * Math.cos(theta);
    im += a.amp * Math.sin(theta);
    points.push({ re, im });
  }
  return points;
}

/** 사슬 끝의 실수부 = 신호 x(t) = Σ A cos(2πft + φ) */
export function phasorSignal(arrows: readonly Phasor[], t: number): number {
  let x = 0;
  for (const a of arrows) x += a.amp * Math.cos(TWO_PI * a.freq * t + a.phase);
  return x;
}

/** 사슬 끝까지의 길이 ∣Σ A e^{jθ}∣ — 보는 틀과 무관하다. 맥놀이·AM에서는 포락선 */
export function phasorLength(arrows: readonly Phasor[], t: number): number {
  const tip = phasorChain(arrows, t).at(-1) as ComplexPoint;
  return Math.hypot(tip.re, tip.im);
}

/**
 * 스트로브(플래시 f_s 번/s)로 본 원판(f 바퀴/s)의 겉보기 회전 주파수 [Hz], 부호 있음.
 * 플래시 한 번 사이에 도는 양 f/f_s 바퀴를 가장 가까운 정수 바퀴에서 뺀다 → −f_s/2 ~ +f_s/2.
 * + = 실제와 같은 방향, − = 거꾸로 도는 것처럼 보임. 크기는 에일리어스 주파수(P2-3)와 같고,
 * 부호가 −인 경우가 aliasComponent의 "위상 반전"이다. ∣결과∣ = f_s/2이면 방향을 구분할 수 없다.
 */
export function strobeApparentFreq(f: number, fs: number): number {
  if (!(fs > 0)) throw new RangeError('fs는 0보다 커야 한다');
  return f - Math.round(f / fs) * fs;
}
