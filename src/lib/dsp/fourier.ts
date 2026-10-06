/**
 * 푸리에 기초 (P2-2, LAB-FOU-01).
 * - 대표 파형의 푸리에 급수 계수 → `harmonics` 성분(A·cos(2π n f₀ t + φ))으로 바로 쓸 수 있는 형태
 * - 임의(비정수) k에서의 DFT 값: "템플릿 정현파와의 상관"을 보여주기 위해
 */

export type WavePreset = 'square' | 'sawtooth' | 'pulse';

export interface HarmonicSeries {
  /** amps[i] = (i+1)차 진폭 (≥ 0) */
  amps: number[];
  /** phases[i] = (i+1)차 위상 [rad] (cos 기준) */
  phases: number[];
}

/**
 * 진폭 1인 대표 파형의 1~orders차 푸리에 계수 (평균(DC) 성분은 제외).
 * - square: t = 0을 중심으로 +1인 구간이 있는 대칭 사각파. A_n = 4/(nπ) (홀수 n), 짝수 0
 * - sawtooth: −1 → +1로 오르는 톱니파, 한 주기 중앙(t = 0)에서 0. A_n = 2/(nπ)
 * - pulse: t = 0 중심, 듀티비 duty, 높이 1인 펄스열. A_n = |2 sin(nπ·duty)/(nπ)|
 */
export function harmonicPreset(preset: WavePreset, orders: number, duty = 0.2): HarmonicSeries {
  if (!Number.isInteger(orders) || orders < 1) throw new RangeError('orders는 1 이상의 정수여야 한다');
  const amps: number[] = [];
  const phases: number[] = [];
  for (let n = 1; n <= orders; n++) {
    let a: number; // 부호 있는 cos 계수 또는 sin 계수
    switch (preset) {
      case 'square': {
        // x(t) = (4/π) Σ_{n 홀수} (−1)^((n−1)/2) cos(nωt) / n
        a = n % 2 === 1 ? ((((n - 1) / 2) % 2 === 0 ? 1 : -1) * 4) / (n * Math.PI) : 0;
        amps.push(Math.abs(a));
        phases.push(a < 0 ? Math.PI : 0);
        break;
      }
      case 'sawtooth': {
        // x(t) = (2/π) Σ (−1)^(n+1) sin(nωt) / n,  sin θ = cos(θ − π/2)
        a = ((n % 2 === 1 ? 1 : -1) * 2) / (n * Math.PI);
        amps.push(Math.abs(a));
        phases.push(a > 0 ? -Math.PI / 2 : Math.PI / 2);
        break;
      }
      case 'pulse': {
        // x(t) = duty + Σ (2/(nπ)) sin(nπ·duty) cos(nωt)
        a = (2 * Math.sin(n * Math.PI * duty)) / (n * Math.PI);
        amps.push(Math.abs(a));
        phases.push(a < 0 ? Math.PI : 0);
        break;
      }
      default: {
        const unknown: never = preset;
        throw new Error(`알 수 없는 파형: ${String(unknown)}`);
      }
    }
  }
  return { amps, phases };
}

export interface ComplexValue {
  re: number;
  im: number;
}

/**
 * k에서의 DFT 값 X(k) = Σ x[n] e^(−j2πkn/N). k는 비정수도 된다.
 * 정수 k이면 FFT의 k번째 bin과 같다 (Contents §3 DFT, 윈도우 없음).
 */
export function dftAt(x: ArrayLike<number>, k: number): ComplexValue {
  const n = x.length;
  let re = 0;
  let im = 0;
  for (let i = 0; i < n; i++) {
    const angle = (-2 * Math.PI * k * i) / n;
    re += x[i] * Math.cos(angle);
    im += x[i] * Math.sin(angle);
  }
  return { re, im };
}

export interface CorrelationTerms {
  /** x[n]·cos(2πkn/N) — 합이 Re X(k) */
  cosProduct: Float64Array;
  /** x[n]·sin(2πkn/N) — 합이 −Im X(k) */
  sinProduct: Float64Array;
  /** 각 곱의 누적합 */
  cosCumulative: Float64Array;
  sinCumulative: Float64Array;
}

/** DFT를 "템플릿과의 상관"으로 펼친 곱과 누적합 (LAB-FOU-01 (b)) */
export function correlationTerms(x: ArrayLike<number>, k: number): CorrelationTerms {
  const n = x.length;
  const cosProduct = new Float64Array(n);
  const sinProduct = new Float64Array(n);
  const cosCumulative = new Float64Array(n);
  const sinCumulative = new Float64Array(n);
  let c = 0;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * k * i) / n;
    cosProduct[i] = x[i] * Math.cos(angle);
    sinProduct[i] = x[i] * Math.sin(angle);
    c += cosProduct[i];
    s += sinProduct[i];
    cosCumulative[i] = c;
    sinCumulative[i] = s;
  }
  return { cosProduct, sinProduct, cosCumulative, sinCumulative };
}
