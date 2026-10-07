/**
 * 짧은 시간 푸리에 변환 STFT (P5-2, LAB-STFT-01). 순수 함수, 시간 [s], 주파수 [Hz].
 * 길이 N의 프레임을 hop = N(1 − overlap)씩 밀면서, 프레임마다 윈도우를 곱한 단일측 진폭 스펙트럼(Pk, 윈도우 진폭 보정)을 구한다.
 * 프레임 시각은 프레임 가운데. 프레임 수 = ⌊(L − N)/hop⌋ + 1.
 */
import { singleSidedSpectrum } from './spectrum';
import type { WindowType } from './window';

export interface StftOptions {
  /** 프레임 샘플 수 (2의 거듭제곱) */
  n: number;
  /** 겹침 비율 0 ≤ overlap < 1 */
  overlap?: number;
  window?: WindowType;
  /** 이 주파수까지만 남긴다 [Hz] */
  fMax?: number;
}

export interface Stft {
  /** 프레임 가운데 시각 [s] */
  times: Float64Array;
  freqs: Float64Array;
  /** amp[m][k]: m번째 프레임, k번째 bin의 진폭 (Pk) */
  amp: Float64Array[];
  hop: number;
  /** 프레임 길이 T = N/f_s [s] */
  frameSeconds: number;
  /** bin 간격 Δf = f_s/N [Hz] */
  df: number;
}

export function stft(x: ArrayLike<number>, fs: number, { n, overlap = 0.5, window = 'hann', fMax = fs / 2 }: StftOptions): Stft {
  if (!(overlap >= 0 && overlap < 1)) throw new RangeError('0 ≤ overlap < 1');
  if (n > x.length) throw new RangeError('프레임이 신호보다 길다');
  const hop = Math.max(1, Math.round(n * (1 - overlap)));
  const frames = Math.floor((x.length - n) / hop) + 1;
  const df = fs / n;
  const kMax = Math.min(n / 2, Math.floor(fMax / df + 1e-9));
  const freqs = Float64Array.from({ length: kMax + 1 }, (_, k) => k * df);
  const times = new Float64Array(frames);
  const amp: Float64Array[] = [];
  const frame = new Float64Array(n);
  for (let m = 0; m < frames; m++) {
    const start = m * hop;
    for (let i = 0; i < n; i++) frame[i] = x[start + i];
    const sp = singleSidedSpectrum({ fs, x: frame }, { window });
    amp.push(sp.amplitude.slice(0, kMax + 1));
    times[m] = (start + n / 2) / fs;
  }
  return { times, freqs, amp, hop, frameSeconds: n / fs, df };
}

/**
 * 회전수가 a [Hz/s]로 변하는 성분을 프레임 길이 T로 볼 때의 번짐 어림 [Hz]:
 * 분해능 1/T와 프레임 동안의 이동 a·T 중 큰 쪽. 둘이 같아지는 T = 1/√a에서 가장 작다.
 */
export const smearWidth = (a: number, T: number): number => Math.max(1 / T, Math.abs(a) * T);
export const bestFrameSeconds = (a: number): number => 1 / Math.sqrt(Math.abs(a));
