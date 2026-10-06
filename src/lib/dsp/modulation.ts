/**
 * 변조 · 측대역 · 맥놀이의 이론값 (P2-8, Contents §3 "AM", "FM", "맥놀이").
 * 순수 함수. 신호 자체는 signal.ts의 'modulated' 성분으로 만든다.
 */

/**
 * 제1종 베셀 함수 J_n(x) (정수 n, |x| ≤ 20 정도까지).
 * 급수 J_n(x) = Σ_k (−1)^k (x/2)^(2k+n) / (k! (k+n)!). 음의 n은 J_−n = (−1)^n J_n.
 */
export function besselJ(n: number, x: number): number {
  if (!Number.isInteger(n)) throw new RangeError('n은 정수여야 한다');
  if (!Number.isFinite(x)) throw new RangeError('x는 유한한 수여야 한다');
  if (n < 0) return (n % 2 === 0 ? 1 : -1) * besselJ(-n, x);
  const half = x / 2;
  // 첫 항 (x/2)^n / n!
  let term = 1;
  for (let i = 1; i <= n; i++) term *= half / i;
  let sum = term;
  const q = -half * half;
  for (let k = 1; k < 200; k++) {
    term *= q / (k * (k + n));
    sum += term;
    if (Math.abs(term) < 1e-17 * Math.max(1, Math.abs(sum))) break;
  }
  return sum;
}

export interface SidebandLine {
  /** 반송파에서 몇 번째 측대역인가 (0 = 반송파, ±1 = 첫째 측대역 …) */
  n: number;
  /** 반송파 진폭에 대한 비 ∣c_n∣ */
  ratio: number;
}

/**
 * AM(지수 m)과 FM(지수 β)이 같은 변조 주파수로 걸린 신호의 선 스펙트럼 (반송파 진폭 = 1 기준).
 * x = (1 + m cos(ω_m t + ψ)) cos(ω_c t + β sin ω_m t)
 *   → f_c + n f_m 성분의 진폭 ∣c_n∣, c_n = J_n(β) + (m/2)(e^{jψ} J_{n−1}(β) + e^{−jψ} J_{n+1}(β)).
 * β = 0이면 c_0 = 1, c_±1 = m/2 (AM), m = 0이면 c_n = J_n(β) (FM).
 */
export function modulationLines(m: number, beta: number, psi = 0, nMax = 8): SidebandLine[] {
  if (!(m >= 0) || !(beta >= 0) || !Number.isFinite(psi)) throw new RangeError('m, β는 0 이상, ψ는 유한한 수여야 한다');
  const lines: SidebandLine[] = [];
  const c = Math.cos(psi);
  const s = Math.sin(psi);
  for (let n = -nMax; n <= nMax; n++) {
    const jn = besselJ(n, beta);
    const jm = besselJ(n - 1, beta);
    const jp = besselJ(n + 1, beta);
    const re = jn + (m / 2) * (c * jm + c * jp);
    const im = (m / 2) * (s * jm - s * jp);
    lines.push({ n, ratio: Math.hypot(re, im) });
  }
  return lines;
}

/**
 * 두 정현파 A₁cos(2πf₁t) + A₂cos(2πf₂t + φ)의 포락선(크기가 오르내리는 선).
 * √(A₁² + A₂² + 2A₁A₂cos(2π(f₂ − f₁)t + φ)) — 주기 1/∣f₂ − f₁∣, 최대 A₁ + A₂, 최소 ∣A₁ − A₂∣.
 */
export function beatEnvelope(a1: number, a2: number, f1: number, f2: number, t: number, phase = 0): number {
  return Math.sqrt(Math.max(0, a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(2 * Math.PI * (f2 - f1) * t + phase)));
}

/** FM의 의미 있는 측대역 쌍 수 (카슨의 경험칙: 대략 β + 1쌍이 전체 파워의 98 % 이상) */
export function carsonPairs(beta: number): number {
  return Math.ceil(beta + 1);
}
