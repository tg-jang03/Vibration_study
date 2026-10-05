/**
 * 시간영역 윈도우 함수 및 특성 계수 (Contents §3, §6, R-05, R-06).
 *
 * 모든 윈도우는 DFT 분석에 맞춘 주기형(DFT-even / periodic)으로 생성된다.
 * 대칭형(symmetric)과 달리 n = 0..N-1에서 분모를 N으로 나눈다.
 *
 * 지원 윈도우:
 * - uniform: 사각 윈도우 (미적용과 동일)
 * - hann: 범용 윈도우 (스펙트럼 분해능 + 사이드로브 감쇠 균형)
 * - hamming: 첫 사이드로브 감쇠 극대화 (-42.7 dB)
 * - blackmanHarris: 4항 Blackman-Harris (-92 dB 고동적범위)
 * - flatTop: 5항 Flat top (교정·밸런싱 피크 진폭 정확도, 스캘럽 손실 < 0.01 dB)
 *   - 출처: ISO 18431-2 / SciPy (scipy.signal.windows.flattop) / MATLAB (flattopwin) / D'Antona & Ferrero (2006)
 * - kaiser: 형상 파라미터 β로 메인로브 폭과 사이드로브 억제 조절
 * - exponential: 임팩트 시험 응답 채널용 인위적 지수 감쇠 (P8-1, LAB-HPB-01)
 * - force: 임팩트 시험 해머 채널용 펄스 게이트 + 코사인 테이퍼
 */

export type WindowType =
  | 'uniform'
  | 'hann'
  | 'hamming'
  | 'blackmanHarris'
  | 'flatTop'
  | 'kaiser'
  | 'exponential'
  | 'force';

export interface WindowOptions {
  /** Kaiser 윈도우 형상 파라미터 β (기본값: 6.0) */
  beta?: number;
  /** Exponential 윈도우 무차원 감쇠 파라미터 α (기본값: 5.0, w[n] = exp(-α * n / N)) */
  decay?: number;
  /**
   * Force 윈도우 펄스 지속 폭.
   * 1 이하의 양수이면 전체 프레임 비율(예: 0.05), 1 초과 정수이면 샘플 수 (기본값: 0.05).
   */
  width?: number;
  /**
   * Force 윈도우 하강 코사인 테이퍼 폭.
   * 1 이하의 양수이면 전체 프레임 비율(예: 0.02), 1 초과 정수이면 샘플 수 (기본값: 0.02).
   */
  taper?: number;
}

export interface WindowProperties {
  /** 윈도우 가중치 합 S₁ = Σ w[n] */
  s1: number;
  /** 윈도우 가중치 제곱합 S₂ = Σ w[n]² */
  s2: number;
  /** 코히어런트 이득 (Coherent Gain) CG = S₁ / N */
  cg: number;
  /** 진폭 보정계수 (Amplitude Correction Factor) ACF = N / S₁ = 1 / CG */
  acf: number;
  /** 에너지(잡음) 보정계수 (Energy Correction Factor) ECF = √(N / S₂) */
  ecf: number;
  /** 등가잡음대역폭 (Equivalent Noise Bandwidth) ENBW = N · S₂ / S₁² [bin] */
  enbw: number;
  /** 최대 스캘럽 손실 [dB] (양수, bin 정중앙 δ = 0.5에서의 피크 감쇠량) */
  scallopLossDb: number;
  /** 스캘럽 손실 진폭 비율 (0~1, |W(0.5)| / W(0)) */
  scallopLossRatio: number;
}

function validateLength(n: number): void {
  if (!Number.isInteger(n) || n <= 0) {
    throw new RangeError('윈도우 길이 n은 1 이상의 정수여야 한다');
  }
}

/**
 * 제0종 변형 베셀 함수 I₀(x).
 * Kaiser 윈도우 계산에 사용된다. 급수 전개로 배전밀도 부동소수점 오차 한계까지 계산한다.
 */
export function besselI0(x: number): number {
  if (!Number.isFinite(x)) throw new RangeError('x는 유한한 실수여야 한다');
  const ax = Math.abs(x);
  if (ax === 0) return 1;
  let sum = 1;
  let term = 1;
  let k = 1;
  while (term > sum * 1e-16 && k < 120) {
    const factor = ax / (2 * k);
    term *= factor * factor;
    sum += term;
    k++;
  }
  return sum;
}

/** Uniform (사각) 윈도우. w[n] = 1.0 */
export function uniformWindow(n: number): Float64Array {
  validateLength(n);
  const w = new Float64Array(n);
  w.fill(1.0);
  return w;
}

/**
 * 주기형(DFT-even) Hann 윈도우.
 * w[n] = 0.5 - 0.5 * cos(2πn / N)
 */
export function hannWindow(n: number): Float64Array {
  validateLength(n);
  const w = new Float64Array(n);
  if (n === 1) {
    w[0] = 1;
    return w;
  }
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    w[i] = 0.5 - 0.5 * Math.cos(step * i);
  }
  return w;
}

/**
 * 주기형(DFT-even) Hamming 윈도우.
 * w[n] = 0.54 - 0.46 * cos(2πn / N)
 */
export function hammingWindow(n: number): Float64Array {
  validateLength(n);
  const w = new Float64Array(n);
  if (n === 1) {
    w[0] = 1;
    return w;
  }
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    w[i] = 0.54 - 0.46 * Math.cos(step * i);
  }
  return w;
}

/**
 * 주기형(DFT-even) 4항 Blackman-Harris 윈도우 (Harris 1978, R-06).
 * 최대 사이드로브 -92 dB.
 */
export function blackmanHarrisWindow(n: number): Float64Array {
  validateLength(n);
  const w = new Float64Array(n);
  if (n === 1) {
    w[0] = 1;
    return w;
  }
  const a0 = 0.35875;
  const a1 = 0.48829;
  const a2 = 0.14128;
  const a3 = 0.01168;
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const theta = step * i;
    w[i] = a0 - a1 * Math.cos(theta) + a2 * Math.cos(2 * theta) - a3 * Math.cos(3 * theta);
  }
  return w;
}

/**
 * 주기형(DFT-even) 5항 Flat top 윈도우 (I-010 결정).
 *
 * 표준 5항 코사인 계수:
 * a₀ = 0.21557895, a₁ = 0.41663158, a₂ = 0.277263158, a₃ = 0.083578947, a₄ = 0.006947368
 * 출처:
 * - ISO 18431-2 (기계 진동 신호처리 시간 윈도우 표준)
 * - SciPy `scipy.signal.windows.flattop`
 * - MATLAB `flattopwin` (periodic)
 * - G. D'Antona and A. Ferrero, "Digital Signal Processing for Measurement Systems", Springer, 2006.
 *
 * 특징:
 * - ENBW ≈ 3.77 bin
 * - 최대 스캘럽 손실 < 0.01 dB (통상 0.005 dB 이내)
 * - 메인로브 폭 ±5 bin
 * - 교정 및 밸런싱 등 1X 피크 진폭 정확도 측정에 최적
 */
export function flatTopWindow(n: number): Float64Array {
  validateLength(n);
  const w = new Float64Array(n);
  if (n === 1) {
    w[0] = 1;
    return w;
  }
  const a0 = 0.21557895;
  const a1 = 0.41663158;
  const a2 = 0.277263158;
  const a3 = 0.083578947;
  const a4 = 0.006947368;
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const theta = step * i;
    w[i] =
      a0 -
      a1 * Math.cos(theta) +
      a2 * Math.cos(2 * theta) -
      a3 * Math.cos(3 * theta) +
      a4 * Math.cos(4 * theta);
  }
  return w;
}

/**
 * 주기형(DFT-even) Kaiser 윈도우.
 *
 * β = 0이면 Uniform 윈도우와 같고, β가 커질수록 사이드로브가 감쇠하고 메인로브가 넓어진다.
 * 주기형 정의: 길이 N+1 대칭형 윈도우의 첫 N 샘플 (MATLAB/SciPy sym=False 기준).
 * u = (2n - N) / N
 * w[n] = I₀(β √(1 - u²)) / I₀(β)
 */
export function kaiserWindow(n: number, beta = 6.0): Float64Array {
  validateLength(n);
  if (!Number.isFinite(beta) || beta < 0) {
    throw new RangeError('Kaiser 파라미터 beta는 0 이상의 유한한 실수여야 한다');
  }
  const w = new Float64Array(n);
  if (n === 1) {
    w[0] = 1;
    return w;
  }
  const denom = besselI0(beta);
  for (let i = 0; i < n; i++) {
    const u = (2 * i - n) / n;
    const arg = Math.max(0, 1 - u * u);
    w[i] = besselI0(beta * Math.sqrt(arg)) / denom;
  }
  return w;
}

/**
 * 지수(Exponential) 윈도우.
 *
 * 임팩트 시험 응답 채널에서 잔향이 1 프레임 내에 감쇠하지 않을 때 누설을 방지하기 위해 곱한다.
 * w[n] = exp(-α * n / N)
 *
 * 인위 감쇠를 추가하므로 FRF에서 추정된 모달 감쇠비 ζ를 보정해야 한다.
 * @param n 프레임 샘플 수
 * @param options.decay 감쇠 지수 α (기본값: 5.0, 프레임 끝에서 약 0.67%로 감쇠)
 */
export function exponentialWindow(n: number, { decay = 5.0 }: { decay?: number } = {}): Float64Array {
  validateLength(n);
  if (!Number.isFinite(decay) || decay < 0) {
    throw new RangeError('decay 파라미터는 0 이상의 유한한 실수여야 한다');
  }
  const w = new Float64Array(n);
  const factor = decay / n;
  for (let i = 0; i < n; i++) {
    w[i] = Math.exp(-factor * i);
  }
  return w;
}

/**
 * 힘(Force) 윈도우.
 *
 * 임팩트 시험 해머(입력) 채널에서 충격 펄스 이후의 배경 잡음과 센서 링잉을 제거한다.
 * 펄스 구간(width) 동안 1.0을 유지하고, 이후 코사인 테이퍼(taper)를 거쳐 0.0으로 떨어진다.
 *
 * @param n 프레임 샘플 수
 * @param options.width 펄스 유지 폭 (1 이하 비율 또는 샘플 수, 기본값: 0.05)
 * @param options.taper 하강 테이퍼 폭 (1 이하 비율 또는 샘플 수, 기본값: 0.02)
 */
export function forceWindow(
  n: number,
  { width = 0.05, taper = 0.02 }: { width?: number; taper?: number } = {},
): Float64Array {
  validateLength(n);
  if (!Number.isFinite(width) || width < 0) throw new RangeError('width는 0 이상이어야 한다');
  if (!Number.isFinite(taper) || taper < 0) throw new RangeError('taper는 0 이상이어야 한다');

  const widthSamples = Math.min(n, Math.max(1, Math.round(width <= 1 ? width * n : width)));
  const taperSamples = Math.min(n - widthSamples, Math.max(0, Math.round(taper <= 1 ? taper * n : taper)));

  const w = new Float64Array(n);
  for (let i = 0; i < widthSamples; i++) {
    w[i] = 1.0;
  }
  if (taperSamples > 0) {
    const taperStep = Math.PI / taperSamples;
    for (let i = 0; i < taperSamples; i++) {
      w[widthSamples + i] = 0.5 * (1.0 + Math.cos(taperStep * (i + 1)));
    }
  }
  // 나머지는 Float64Array 기본값 0.0
  return w;
}

/**
 * 윈도우 타입과 옵션으로 윈도우 배열을 생성하는 통합 팩토리 함수.
 */
export function createWindow(type: WindowType, n: number, options: WindowOptions = {}): Float64Array {
  switch (type) {
    case 'uniform':
      return uniformWindow(n);
    case 'hann':
      return hannWindow(n);
    case 'hamming':
      return hammingWindow(n);
    case 'blackmanHarris':
      return blackmanHarrisWindow(n);
    case 'flatTop':
      return flatTopWindow(n);
    case 'kaiser':
      return kaiserWindow(n, options.beta);
    case 'exponential':
      return exponentialWindow(n, { decay: options.decay });
    case 'force':
      return forceWindow(n, { width: options.width, taper: options.taper });
    default: {
      const exhaustiveCheck: never = type;
      throw new TypeError(`지원하지 않는 윈도우 타입: ${exhaustiveCheck}`);
    }
  }
}

/**
 * 신호 x에 윈도우 w를 곱한 새 배열을 반환한다 (입력 불변).
 */
export function applyWindow(x: Float64Array, w: Float64Array): Float64Array {
  if (x.length !== w.length) {
    throw new RangeError(`신호 길이(${x.length})와 윈도우 길이(${w.length})가 일치하지 않는다`);
  }
  const n = x.length;
  const xw = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    xw[i] = x[i] * w[i];
  }
  return xw;
}

/**
 * 주어진 윈도우의 특성 계수(S₁, S₂, CG, ACF, ECF, ENBW, 스캘럽 손실)를 계산한다 (Contents §3, §6).
 */
export function windowProperties(w: Float64Array): WindowProperties {
  const n = w.length;
  validateLength(n);

  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < n; i++) {
    const val = w[i];
    s1 += val;
    s2 += val * val;
  }

  if (s1 === 0) {
    throw new RangeError('윈도우 가중치 합 S₁이 0이므로 정규화할 수 없다');
  }

  const cg = s1 / n;
  const acf = n / s1;
  const ecf = Math.sqrt(n / s2);
  const enbw = (n * s2) / (s1 * s1);

  // 스캘럽 손실: bin과 bin의 정중앙 (δ = 0.5 bin 오프셋)에서의 이산 푸리에 변환 응답
  // W(0.5) = Σ w[n] * exp(-j * π * n / N)
  let re = 0;
  let im = 0;
  const step = Math.PI / n;
  for (let i = 0; i < n; i++) {
    const angle = step * i;
    re += w[i] * Math.cos(angle);
    im -= w[i] * Math.sin(angle);
  }
  const mag = Math.hypot(re, im);
  const scallopLossRatio = mag / s1;
  const scallopLossDb =
    scallopLossRatio > 0 && scallopLossRatio < 1 ? -20 * Math.log10(scallopLossRatio) : 0;

  return {
    s1,
    s2,
    cg,
    acf,
    ecf,
    enbw,
    scallopLossDb,
    scallopLossRatio,
  };
}
