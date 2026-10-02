import type { ComplexSpectrum } from './fft';

export type PowerAverageMode = 'linear' | 'exponential' | 'peakHold';

function checkMatrix(frames: readonly ArrayLike<number>[], nonnegative: boolean): number {
  if (frames.length === 0 || frames[0].length === 0) throw new RangeError('빈 평균 입력은 허용하지 않는다');
  const bins = frames[0].length;
  for (const frame of frames) {
    if (frame.length !== bins) throw new RangeError('모든 프레임의 bin 수가 같아야 한다');
    for (let k = 0; k < bins; k++) {
      if (!Number.isFinite(frame[k]) || (nonnegative && frame[k] < 0)) {
        throw new RangeError(nonnegative ? '파워는 유한한 음이 아닌 수여야 한다' : '복소 성분은 유한한 수여야 한다');
      }
    }
  }
  return bins;
}

/**
 * 선형 RMS(파워)·지수·피크홀드 평균. 입력·반환은 파워 [SI²]다.
 * RMS 진폭 표시는 반환값의 제곱근을 취한다. 진폭·dB를 직접 평균하지 않는다.
 * 지수 평균은 첫 프레임으로 초기화한다 (0 초기화에 의한 시작 편향 없음).
 * alpha 기본값은 1/M. 입력을 변경하지 않는다 (Contents LAB-AVG-01, I-005).
 */
export function averagePower(
  frames: readonly ArrayLike<number>[],
  mode: PowerAverageMode = 'linear',
  alpha = 1 / frames.length,
): Float64Array {
  const bins = checkMatrix(frames, true);
  if (!['linear', 'exponential', 'peakHold'].includes(mode)) throw new RangeError('알 수 없는 평균 방식');
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha > 1) throw new RangeError('alpha는 0 초과 1 이하여야 한다');
  const result = Float64Array.from(frames[0]);
  for (let m = 1; m < frames.length; m++) {
    const weight = mode === 'linear' ? 1 / (m + 1) : alpha;
    for (let k = 0; k < bins; k++) {
      result[k] = mode === 'peakHold'
        ? Math.max(result[k], frames[m][k])
        : result[k] + weight * (frames[m][k] - result[k]);
    }
  }
  return result;
}

/** 트리거 기준으로 이미 위상 정렬된 복소 스펙트럼의 선형 평균. 위상 정보까지 평균한다. */
export function vectorAverage(frames: readonly ComplexSpectrum[]): ComplexSpectrum {
  const bins = checkMatrix(frames.map((frame) => frame.real), false);
  checkMatrix(frames.map((frame) => frame.imag), false);
  for (const frame of frames) {
    if (frame.imag.length !== bins) throw new RangeError('실수부·허수부의 bin 수가 같아야 한다');
  }
  const real = new Float64Array(bins);
  const imag = new Float64Array(bins);
  for (let m = 0; m < frames.length; m++) {
    for (let k = 0; k < bins; k++) {
      real[k] += (frames[m].real[k] - real[k]) / (m + 1);
      imag[k] += (frames[m].imag[k] - imag[k]) / (m + 1);
    }
  }
  return { real, imag };
}

export interface FrameLayout {
  hop: number;
  totalSamples: number;
}

/** M개의 길이 N 프레임: hop=N(1-r), 총 샘플 수=N+(M-1)hop. 반올림하지 않는다. */
export function frameLayout(n: number, count: number, overlap: number): FrameLayout {
  if (!Number.isSafeInteger(n) || n < 1 || !Number.isSafeInteger(count) || count < 1) {
    throw new RangeError('프레임 길이·개수는 양의 정수여야 한다');
  }
  if (!Number.isFinite(overlap) || overlap < 0 || overlap >= 1) throw new RangeError('오버랩은 0 이상 1 미만이어야 한다');
  const hop = n * (1 - overlap);
  const totalSamples = n + (count - 1) * hop;
  if (!Number.isSafeInteger(hop) || hop < 1 || !Number.isSafeInteger(totalSamples)) {
    throw new RangeError('hop과 총 샘플 수는 안전한 양의 정수여야 한다');
  }
  return { hop, totalSamples };
}

/** 하나의 연속 수집을 겹치는 프레임으로 분할한다. 꼬리의 불완전 프레임은 버리고 각 프레임은 복사한다. */
export function splitOverlappingFrames(x: Float64Array, n: number, overlap: number) {
  const { hop } = frameLayout(n, 1, overlap);
  for (const value of x) if (!Number.isFinite(value)) throw new RangeError('샘플은 유한한 수여야 한다');
  const frames: Float64Array[] = [];
  const starts: number[] = [];
  for (let start = 0; start + n <= x.length; start += hop) {
    starts.push(start);
    frames.push(x.slice(start, start + n));
  }
  const usedSamples = frames.length ? starts[starts.length - 1] + n : 0;
  return { frames, starts, hop, usedSamples };
}

/**
 * 백색 가우시안 잡음의 내부 bin에 대한 파워 선형 평균 std/mean 근사.
 * rho_l = sum w[i]w[i+l·hop] / sum w[i]²,
 * CV² = (1/M)[1 + 2 sum_l (1-l/M)rho_l²].
 * DC·나이퀴스트 제외, 정상 잡음·동일 윈도우 가정. 독립 프레임이면 정확히 1/sqrt(M).
 */
export function overlapPowerCv(window: ArrayLike<number>, count: number, hop: number): number {
  frameLayout(window.length, count, 0);
  if (!Number.isSafeInteger(hop) || hop < 1) throw new RangeError('hop은 양의 정수여야 한다');
  let s2 = 0;
  for (let i = 0; i < window.length; i++) {
    if (!Number.isFinite(window[i])) throw new RangeError('윈도우는 유한한 수여야 한다');
    s2 += window[i] ** 2;
  }
  if (s2 === 0) throw new RangeError('윈도우 에너지는 0보다 커야 한다');
  let correction = 1;
  for (let lag = 1; lag < count && lag * hop < window.length; lag++) {
    let correlation = 0;
    const shift = lag * hop;
    for (let i = 0; i + shift < window.length; i++) correlation += window[i] * window[i + shift];
    correction += 2 * (1 - lag / count) * (correlation / s2) ** 2;
  }
  return Math.sqrt(correction / count);
}