import { createRng } from './random';
import { evaluate, type SignalSpec } from './signal';

/**
 * 에일리어스(겉보기) 주파수: f_a = |f − k·f_s|, k = round(f / f_s)  (Contents §3)
 * 샘플링 주파수 fs로 측정한 f [Hz] 정현파가 0 ~ fs/2 사이 어디에 보이는지 돌려준다.
 */
export function aliasFrequency(f: number, fs: number): number {
  const k = Math.round(f / fs);
  return Math.abs(f - k * fs);
}

export interface AliasComponent {
  /** 에일리어스(겉보기) 주파수 f_a [Hz], 0 <= f_a <= fs/2 */
  freq: number;
  /** 겉보기 위상 φ_a [rad], -π ~ π (상향 접힘 시 부호 반전) */
  phase: number;
  /** fs 단위 존 인덱스 k = round(f / fs) */
  zone: number;
  /** 나이퀴스트 너머 위쪽에서 접혀 내려와 위상이 반전되었는지 여부 */
  inverted: boolean;
}

/**
 * 정현파 A·cos(2πft + φ)를 fs로 샘플링했을 때 생기는 겉보기(에일리어스) 정현파 성분을 계산한다 (Contents §3, §6).
 * f = k·fs ± fa 일 때:
 * - f = k·fs + fa: 위상 유지 (+φ)
 * - f = k·fs - fa: 위상 반전 (-φ, 위쪽에서 접혀 내려옴)
 * 이 겉보기 정현파의 샘플 x_a[n] = A·cos(2π fa (n/fs) + φ_a)는 참 신호의 샘플 x[n]과 정확히 일치한다.
 */
export function aliasComponent(f: number, phase: number, fs: number): AliasComponent {
  if (fs <= 0) throw new RangeError('fs는 0보다 커야 한다');
  const k = Math.round(f / fs);
  const diff = f - k * fs;
  const fa = Math.abs(diff);
  const inverted = diff < 0;
  let wrappedPhase = inverted ? -phase : phase;
  wrappedPhase = Math.atan2(Math.sin(wrappedPhase), Math.cos(wrappedPhase));
  return { freq: fa, phase: wrappedPhase, zone: k, inverted };
}

export interface AcquireOptions {
  /** 샘플링 주파수 [Hz] */
  fs: number;
  /** 샘플 수 */
  n: number;
  /** 첫 샘플 시각 [s] */
  t0?: number;
}

export interface Samples {
  fs: number;
  /** t[i] = t0 + i / fs */
  t: Float64Array;
  x: Float64Array;
}

/**
 * 샘플링: x[i] = x(t0 + i/fs) + 잡음.
 * 잡음은 샘플 번호 i 기준으로 시드에서 생성한다 (같은 시드·같은 n → 같은 잡음).
 * AAF·ADC는 아직 없다 (M1.6에서 추가).
 */
export function acquire(spec: SignalSpec, { fs, n, t0 = 0 }: AcquireOptions): Samples {
  if (!(fs > 0)) throw new RangeError('fs는 0보다 커야 한다');
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n은 0 이상의 정수여야 한다');

  const t = new Float64Array(n);
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    t[i] = t0 + i / fs;
    x[i] = evaluate(spec, t[i]);
  }
  for (const c of spec.components) {
    if (c.type !== 'noise' || c.rms === 0) continue;
    const rng = createRng(c.seed);
    for (let i = 0; i < n; i++) x[i] += c.rms * rng.normal();
  }
  return { fs, t, x };
}

export interface QuantizeOptions {
  /** ADC 분해능 비트 수 (예: 8, 12, 16, 24) */
  bits: number;
  /** 입력 풀스케일 피크 레인지 V_fs (신호 허용 범위: [-V_fs, +V_fs]) */
  range: number;
}

export interface QuantizeResult {
  /** 양자화 및 클리핑이 적용된 신호 배열 */
  y: Float64Array;
  /** 양자화 오차 (잡음) e[n] = y[n] - x[n] */
  error: Float64Array;
  /** 1 LSB 전압 스텝 크기: Δ = 2 * range / 2^bits */
  lsb: number;
  /** 클리핑 발생 여부 */
  clipped: boolean;
  /** 클리핑된 샘플 수 */
  clippedCount: number;
  /** 클리핑 비율 (0 ~ 1) */
  clipRatio: number;
}

/**
 * Butterworth 저역통과 필터의 크기 응답 |H(f)| (Contents §3, §5-1).
 * |H(f)| = 1 / √(1 + (f / fc)^(2 * order))
 */
export function butterworthGain(f: number, fc: number, order: number): number {
  if (fc <= 0 || order <= 0) throw new RangeError('fc와 order는 0보다 커야 한다');
  if (f <= 0) return 1.0;
  const ratio = f / fc;
  // 부동소수점 오버플로 방지 (비율이 크면 감쇠 극대화)
  if (ratio > 10 && order >= 4) return 0.0;
  return 1 / Math.sqrt(1 + Math.pow(ratio, 2 * order));
}

/**
 * Butterworth 저역통과 필터의 감쇠량 [dB] (양수 값).
 * Attenuation(dB) = -20 * log10(|H(f)|) = 10 * log10(1 + (f / fc)^(2 * order))
 */
export function butterworthAttenuationDb(f: number, fc: number, order: number): number {
  if (fc <= 0 || order <= 0) throw new RangeError('fc와 order는 0보다 커야 한다');
  if (f <= 0) return 0.0;
  const ratio = f / fc;
  return 10 * Math.log10(1 + Math.pow(ratio, 2 * order));
}

/**
 * 풀스케일 정현파의 이론적 신호 대 양자화 잡음비(SQNR) [dB] (Contents §3, §6).
 * SNR ≈ 6.02 * bits + 1.76 dB
 */
export function theoreticalSqnr(bits: number): number {
  if (bits <= 0) throw new RangeError('bits는 0보다 커야 한다');
  return 6.02 * bits + 1.76;
}

/**
 * 입력 레인지 여유(Headroom)를 고려한 실제 유효 SNR [dB].
 * SNR_eff = 6.02 * bits + 1.76 - 20 * log10(range / peakAmp)
 */
export function effectiveSnr(bits: number, range: number, peakAmp: number): number {
  if (range <= 0 || peakAmp <= 0) throw new RangeError('range와 peakAmp는 0보다 커야 한다');
  const baseSnr = theoreticalSqnr(bits);
  const backoffDb = 20 * Math.log10(range / peakAmp);
  return baseSnr - backoffDb;
}

/**
 * 이산 신호에 ADC 양자화 및 클리핑을 적용한다 (Contents §5-1).
 * 입력 x는 SI 실수 단위이며, 지정된 range(풀스케일 피크)와 bits에 맞춰 양자화된다.
 */
export function quantize(x: Float64Array, { bits, range }: QuantizeOptions): QuantizeResult {
  if (!Number.isInteger(bits) || bits < 1 || bits > 32) {
    throw new RangeError('bits는 1 이상 32 이하의 정수여야 한다');
  }
  if (!Number.isFinite(range) || range <= 0) {
    throw new RangeError('range는 0보다 큰 유한한 실수여야 한다');
  }

  const n = x.length;
  const levels = Math.pow(2, bits);
  const lsb = (2 * range) / levels;
  const maxCode = Math.pow(2, bits - 1) - 1;
  const minCode = -Math.pow(2, bits - 1);

  const y = new Float64Array(n);
  const error = new Float64Array(n);
  let clippedCount = 0;

  for (let i = 0; i < n; i++) {
    const val = x[i];
    let code = Math.round(val / lsb);
    if (code > maxCode) {
      code = maxCode;
      clippedCount++;
    } else if (code < minCode) {
      code = minCode;
      clippedCount++;
    }
    const qVal = code * lsb;
    y[i] = qVal;
    error[i] = qVal - val;
  }

  return {
    y,
    error,
    lsb,
    clipped: clippedCount > 0,
    clippedCount,
    clipRatio: n > 0 ? clippedCount / n : 0,
  };
}
