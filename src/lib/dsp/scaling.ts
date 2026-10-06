import { singleSidedSpectrum } from './spectrum';
import type { Samples } from './sampling';
import { createWindow, windowProperties, type WindowType } from './window';

/**
 * 스펙트럼의 세로축 스케일링 (P1-6, Contents §3 "파워 스펙트럼", "PSD").
 * - 파워 PS_k [SI²]: 정현파 성분이 bin 중심에 있으면 그 bin 값이 성분의 RMS² (ACF 기준, P1-4).
 * - PSD_k [SI²/Hz] = PS_k / (ENBW · Δf): bin 하나가 실제로 모으는 폭(ENBW·Δf)으로 나눠 Δf와 무관하게 만든 값.
 * - 대역 RMS = √(Σ PS_k / ENBW) = √(Σ PSD_k · Δf): 윈도우가 이웃 bin에 나눠 담은 몫을 ENBW로 되돌린다.
 * 제로패딩은 다루지 않는다 (Δf = f_s / N).
 */

export type SpectrumScale = 'peak' | 'rms' | 'power' | 'psd' | 'asd';

export interface ScaledSpectrum {
  fs: number;
  n: number;
  /** bin 간격 = 분해능 Δf = f_s / N [Hz] */
  df: number;
  /** 윈도우의 등가 잡음 대역폭 [bin] (Uniform 1, Hann 1.5) */
  enbw: number;
  frequency: Float64Array;
  /** 파워 PS_k [SI²] (rms²) */
  power: Float64Array;
  /** PSD_k [SI²/Hz] */
  psd: Float64Array;
}

export interface ScalingOptions {
  /** 시간영역 윈도우 (기본 Uniform) */
  window?: WindowType | Float64Array;
}

/** 단일측 파워·PSD 스펙트럼. DC·나이퀴스트 bin은 두 배 하지 않은 진폭을 그대로 제곱한다. */
export function scaledSpectrum({ fs, x }: Pick<Samples, 'fs' | 'x'>, { window = 'uniform' }: ScalingOptions = {}): ScaledSpectrum {
  const n = x.length;
  const w = typeof window === 'string' ? createWindow(window, n) : window;
  const { enbw } = windowProperties(w);
  const spec = singleSidedSpectrum({ fs, x }, { window: w });
  const df = fs / n;
  const last = spec.amplitude.length - 1;
  const power = Float64Array.from(spec.amplitude, (a, k) => (k === 0 || (k === last && n % 2 === 0) ? a * a : (a * a) / 2));
  const psd = Float64Array.from(power, (p) => p / (enbw * df));
  return { fs, n, df, enbw, frequency: spec.frequency, power, psd };
}

/**
 * 같은 스펙트럼을 원하는 세로축으로: peak = √(2·PS)(정현파 성분의 Peak), rms = √PS, power = PS, psd, asd = √PSD.
 * 정현파 성분의 Peak는 성분마다 √2·RMS로 정확하다 (bin 안의 성분 하나가 정현파이므로).
 */
export function spectrumIn(s: Pick<ScaledSpectrum, 'power' | 'psd'>, scale: SpectrumScale): Float64Array {
  switch (scale) {
    case 'power':
      return Float64Array.from(s.power);
    case 'rms':
      return Float64Array.from(s.power, Math.sqrt);
    case 'peak':
      return Float64Array.from(s.power, (p) => Math.sqrt(2 * p));
    case 'psd':
      return Float64Array.from(s.psd);
    case 'asd':
      return Float64Array.from(s.psd, Math.sqrt);
    default: {
      const unknown: never = scale;
      throw new RangeError(`알 수 없는 스케일: ${String(unknown)}`);
    }
  }
}

/**
 * 대역 RMS: bin kLo ~ kHi(양 끝 포함)의 파워를 더해 ENBW로 나눈 뒤 제곱근.
 * divideByEnbw = false면 나누지 않은 값(윈도우가 있을 때 √ENBW배 커지는 흔한 실수)을 돌려준다.
 */
export function bandRms(power: ArrayLike<number>, enbw: number, kLo = 0, kHi = power.length - 1, divideByEnbw = true): number {
  if (!(enbw > 0)) throw new RangeError('ENBW는 양수여야 한다');
  if (!Number.isInteger(kLo) || !Number.isInteger(kHi) || kLo < 0 || kHi >= power.length || kLo > kHi) {
    throw new RangeError('bin 범위가 잘못되었다');
  }
  let sum = 0;
  for (let k = kLo; k <= kHi; k++) sum += power[k];
  return Math.sqrt(divideByEnbw ? sum / enbw : sum);
}

/** 0 bin부터 k bin까지 누적한 대역 RMS (전체 크기가 주파수를 따라 쌓이는 모습) */
export function cumulativeBandRms(power: ArrayLike<number>, enbw: number, divideByEnbw = true): Float64Array {
  if (!(enbw > 0)) throw new RangeError('ENBW는 양수여야 한다');
  const out = new Float64Array(power.length);
  let sum = 0;
  for (let k = 0; k < power.length; k++) {
    sum += power[k];
    out[k] = Math.sqrt(divideByEnbw ? sum / enbw : sum);
  }
  return out;
}

/** 진폭 비의 dB: 20 log₁₀(a / ref). 0 이하는 floorDb로 자른다 */
export function amplitudeDb(a: number, ref = 1, floorDb = -200): number {
  if (!(ref > 0)) throw new RangeError('기준값은 양수여야 한다');
  return a > 0 ? Math.max(floorDb, 20 * Math.log10(a / ref)) : floorDb;
}

/** 파워 비의 dB: 10 log₁₀(p / ref). 진폭 a의 파워 a²를 넣으면 amplitudeDb(a, √ref)와 같다 */
export function powerDb(p: number, ref = 1, floorDb = -200): number {
  if (!(ref > 0)) throw new RangeError('기준값은 양수여야 한다');
  return p > 0 ? Math.max(floorDb, 10 * Math.log10(p / ref)) : floorDb;
}
