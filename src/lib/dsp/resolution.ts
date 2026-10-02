/**
 * FFT 분석기의 기본 분해능 3식과 관련된 순수 DSP 함수 (Contents §3, §5-1, §6).
 *
 * 1. Δf = F_max / LOR = 1 / T
 * 2. T = LOR / F_max = 1 / Δf
 * 3. N = 2.56 * LOR, fs = 2.56 * F_max
 */

export interface ResolutionParameters {
  /** 분석 최대 주파수 F_max [Hz] */
  fmax: number;
  /** 스펙트럼 표시 라인 수 LOR (Lines of Resolution) */
  lor: number;
}

export interface ResolutionMetrics {
  /** 주파수 분해능(bin 간격) Δf = F_max / LOR [Hz] */
  deltaF: number;
  /** 프레임 측정 시간 T = LOR / F_max = 1 / Δf [s] */
  duration: number;
  /** 전체 시간 샘플 수 N = 2.56 * LOR */
  n: number;
  /** 샘플링 주파수 fs = 2.56 * F_max [Hz] */
  fs: number;
}

/**
 * F_max와 LOR로부터 주파수 분해능 Δf, 측정 시간 T, 샘플 수 N, 샘플링 주파수 fs를 계산한다.
 */
export function calculateResolution({ fmax, lor }: ResolutionParameters): ResolutionMetrics {
  if (!Number.isFinite(fmax) || fmax <= 0) {
    throw new RangeError('fmax는 0보다 큰 유한한 실수여야 한다');
  }
  if (!Number.isInteger(lor) || lor <= 0) {
    throw new RangeError('lor는 0보다 큰 정수여야 한다');
  }
  const deltaF = fmax / lor;
  const duration = lor / fmax;
  const n = Math.round(2.56 * lor);
  const fs = 2.56 * fmax;
  return { deltaF, duration, n, fs };
}

/**
 * 두 성분(f1, f2) 사이의 주파수 간격에 해당하는 bin 수 (|f1 - f2| / Δf).
 */
export function separatedBins(f1: number, f2: number, deltaF: number): number {
  if (!Number.isFinite(deltaF) || deltaF <= 0) {
    throw new RangeError('deltaF는 0보다 커야 한다');
  }
  return Math.abs(f1 - f2) / deltaF;
}

export interface SmearingMetrics {
  /** 프레임 측정 시간 T 동안 변화한 1X 주파수 폭 Δf_1X = (a / 60) * T [Hz] */
  deltaF1X: number;
  /** 퍼진 bin 수 = Δf_1X / Δf = (a / 60) * T^2 [bins] */
  smearedBins: number;
}

/**
 * 코스트다운 또는 가속 중 회전수 변화(a [rpm/s])로 인해
 * 측정 시간 T 동안 1X 주파수가 변화하는 폭 Δf_1X [Hz] 및 퍼지는 bin 수 (Smearing).
 */
export function smearingMetrics(
  aRpmPerSec: number,
  duration: number,
  deltaF: number,
): SmearingMetrics {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new RangeError('duration은 0보다 커야 한다');
  }
  if (!Number.isFinite(deltaF) || deltaF <= 0) {
    throw new RangeError('deltaF는 0보다 커야 한다');
  }
  const deltaF1X = (Math.abs(aRpmPerSec) / 60) * duration;
  const smearedBins = deltaF1X / deltaF;
  return {
    deltaF1X,
    smearedBins,
  };
}

/**
 * 윈도우 종류에 따른 두 톤의 최소 분리 기준 bin 수 (Contents §5-1).
 * - Uniform: 메인로브 ±1 bin -> 2.0 bin 이상 떨어져야 골(Valley) 형성
 * - Hann: 메인로브 ±2 bin -> 3.5 bin 이상 떨어져야 골 형성
 * - Flat top: 메인로브 ±5 bin -> 8.0 bin 이상 떨어져야 골 형성
 */
export function minSeparationBins(windowType: 'uniform' | 'hann' | 'flatTop'): number {
  switch (windowType) {
    case 'uniform':
      return 2.0;
    case 'hann':
      return 3.5;
    case 'flatTop':
      return 8.0;
  }
}
