import { fft, zeroPad } from './fft';
import type { Samples } from './sampling';

export interface SpectrumOptions {
  /** 제로패딩 후 크기. 기본값은 원래 샘플 수. 2의 거듭제곱이어야 한다. */
  fftSize?: number;
}

export interface SingleSidedSpectrum {
  fs: number;
  /** 원래 프레임 샘플 수 (제로패딩 제외) */
  n: number;
  fftSize: number;
  /** 표시 bin 간격 [Hz], 제로패딩에 따라 달라진다. */
  binSpacing: number;
  /** 원래 프레임의 분해능 fs/n [Hz]. 분리 능력은 윈도우 메인로브 폭에도 의존한다. */
  resolution: number;
  /** 실제 측정 시간 n/fs [s] */
  duration: number;
  frequency: Float64Array;
  /** 피크 진폭 (Pk), 입력과 같은 SI 단위. DC·나이퀴스트는 두 배 하지 않는다. */
  amplitude: Float64Array;
  /** 첫 샘플 기준 위상 [rad], −π~π. 진폭 0인 bin은 NaN. */
  phase: Float64Array;
}

/**
 * 실신호의 0~fs/2 단일측 스펙트럼 (Contents §3-1).
 * 윈도우 없음: A[k] = 2|X[k]|/N, DC·나이퀴스트는 |X[k]|/N.
 * 패딩 후에도 분모는 원래 N이다. 시간 배열을 사용하지 않아 위상은 첫 샘플 기준이다.
 * 작은 진폭의 위상 마스킹, 표시 단위 변환은 UI가 담당한다.
 */
export function singleSidedSpectrum(
  { fs, x }: Pick<Samples, 'fs' | 'x'>,
  { fftSize = x.length }: SpectrumOptions = {},
): SingleSidedSpectrum {
  if (!Number.isFinite(fs) || fs <= 0) throw new RangeError('fs는 유한한 양수여야 한다');
  const n = x.length;
  const { real, imag } = fft(zeroPad(x, fftSize));
  const bins = Math.floor(fftSize / 2) + 1;
  const frequency = new Float64Array(bins);
  const amplitude = new Float64Array(bins);
  const phase = new Float64Array(bins);
  const binSpacing = fs / fftSize;
  for (let k = 0; k < bins; k++) {
    const magnitude = Math.hypot(real[k], imag[k]);
    const factor = k === 0 || k === fftSize / 2 ? 1 : 2;
    frequency[k] = k * binSpacing;
    amplitude[k] = factor * magnitude / n;
    phase[k] = magnitude === 0 ? NaN : Math.atan2(imag[k], real[k]);
  }
  return { fs, n, fftSize, binSpacing, resolution: fs / n, duration: n / fs, frequency, amplitude, phase };
}
