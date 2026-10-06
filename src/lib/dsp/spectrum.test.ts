import { describe, expect, it } from 'vitest';
import { acquire } from './sampling';
import { singleSidedSpectrum } from './spectrum';

describe('singleSidedSpectrum', () => {
  it('bin 중심 정현파의 진폭·위상·주파수와 메타데이터가 입력 해석값과 일치한다', () => {
    const samples = acquire({ components: [
      { type: 'sine', freq: 37, amp: 1.7, phase: -1.2 },
      { type: 'sine', freq: 129, amp: 0.4, phase: 2.8 },
    ] }, { fs: 1024, n: 1024 });
    const original = samples.x.slice();
    const result = singleSidedSpectrum(samples);
    expect(result.frequency.length).toBe(513);
    expect(result.frequency[0]).toBe(0);
    expect(result.frequency[512]).toBe(512);
    expect(result.amplitude[37]).toBeCloseTo(1.7, 12);
    expect(result.phase[37]).toBeCloseTo(-1.2, 12);
    expect(result.frequency[37]).toBe(37);
    expect(result.amplitude[129]).toBeCloseTo(0.4, 12);
    expect(result.phase[129]).toBeCloseTo(2.8, 12);
    for (let k = 0; k < result.amplitude.length; k++) {
      if (k !== 37 && k !== 129) expect(result.amplitude[k]).toBeLessThan(1e-12);
    }
    expect(result.n).toBe(1024);
    expect(result.fftSize).toBe(1024);
    expect(result.fs).toBe(1024);
    expect(result.binSpacing).toBe(1);
    expect(result.resolution).toBe(1);
    expect(result.duration).toBe(1);
    expect(samples.x).toEqual(original);
  });

  it('위상은 첫 샘플 기준: t₀ ≠ 0이면 φ + 2πft₀', () => {
    const freq = 32;
    const phase = 0.3;
    const t0 = 0.01;
    const result = singleSidedSpectrum(acquire({ components: [
      { type: 'sine', freq, amp: 1, phase },
    ] }, { fs: 1024, n: 1024, t0 }));
    const expected = phase + 2 * Math.PI * freq * t0;
    expect(result.phase[freq]).toBeCloseTo(Math.atan2(Math.sin(expected), Math.cos(expected)), 12);
  });

  it('DC·나이퀴스트는 두 배 하지 않고 음수 DC의 부호는 위상에 남는다', () => {
    const samples = { fs: 64, x: Float64Array.from({ length: 64 }, (_, i) => -2 + 0.75 * (-1) ** i) };
    for (const fftSize of [64, 256]) {
      const result = singleSidedSpectrum(samples, { fftSize });
      expect(result.amplitude[0]).toBeCloseTo(2, 12);
      expect(Math.abs(result.phase[0])).toBeCloseTo(Math.PI, 12);
      expect(result.amplitude[fftSize / 2]).toBeCloseTo(0.75, 12);
      expect(result.phase[fftSize / 2]).toBeCloseTo(0, 12);
    }
  });

  it('제로패딩은 원래 bin 진폭·위상을 보존하고 bin 간격만 줄인다', () => {
    const samples = acquire({ components: [
      { type: 'sine', freq: 8, amp: 2.3, phase: 0.7 },
      { type: 'noise', rms: 0.2, seed: 10 },
    ] }, { fs: 128, n: 128 });
    const original = singleSidedSpectrum(samples);
    const padded = singleSidedSpectrum(samples, { fftSize: 512 });
    for (let k = 0; k < original.frequency.length; k++) {
      expect(padded.frequency[4 * k]).toBe(original.frequency[k]);
      expect(padded.amplitude[4 * k]).toBeCloseTo(original.amplitude[k], 12);
      expect(padded.phase[4 * k]).toBeCloseTo(original.phase[k], 11);
    }
    expect(padded.binSpacing).toBe(0.25);
    expect(padded.resolution).toBe(original.resolution);
    expect(padded.duration).toBe(original.duration);
    expect(padded.n).toBe(original.n);
  });

  it('2의 거듭제곱이 아닌 길이도 명시적 패딩 시 원래 N으로 정규화한다', () => {
    const result = singleSidedSpectrum({ fs: 100, x: new Float64Array([2, 2, 2]) }, { fftSize: 4 });
    expect(result.amplitude[0]).toBe(2);
    expect(result.n).toBe(3);
    expect(result.fftSize).toBe(4);
    expect(result.duration).toBe(0.03);
    expect(result.resolution).toBeCloseTo(100 / 3, 12);
    expect(result.binSpacing).toBe(25);
  });

  it('사각파 홀수 하모닉 진폭 ≈ 4/(hπ), 짝수·DC는 0 (Contents §6)', () => {
    const period = 4096;
    const n = 16384;
    // sin형 사각파. 불연속점의 푸리에 급수 값은 양쪽의 평균인 0이다.
    const x = Float64Array.from({ length: n }, (_, i) => {
      const j = i % period;
      return j === 0 || j === period / 2 ? 0 : j < period / 2 ? 1 : -1;
    });
    const result = singleSidedSpectrum({ fs: period, x });
    for (let h = 1; h <= 10; h++) {
      const k = h * n / period;
      if (h % 2 === 0) {
        expect(result.amplitude[k]).toBeLessThan(1e-12);
      } else {
        expect(Math.abs(result.amplitude[k] - 4 / (h * Math.PI))).toBeLessThan(5e-6);
        expect(result.phase[k]).toBeCloseTo(-Math.PI / 2, 12);
      }
    }
    expect(result.amplitude[0]).toBe(0);
  });

  it('단일측 진폭으로 계산한 평균제곱은 시간영역 평균제곱과 일치한다', () => {
    const samples = acquire({ components: [
      { type: 'sine', freq: 0, amp: 2 },
      { type: 'sine', freq: 512, amp: 0.7 },
      { type: 'sine', freq: 61, amp: 1.3, phase: 0.6 },
      { type: 'noise', rms: 0.4, seed: 28 },
    ] }, { fs: 1024, n: 1024 });
    const result = singleSidedSpectrum(samples);
    const last = result.amplitude.length - 1;
    const spectralMeanSquare = result.amplitude.reduce((sum, a, k) => sum + a ** 2 / (k === 0 || k === last ? 1 : 2), 0);
    const timeMeanSquare = samples.x.reduce((sum, x) => sum + x ** 2, 0) / samples.x.length;
    expect(spectralMeanSquare).toBeCloseTo(timeMeanSquare, 12);
  });

  it('신호가 없으면 진폭 0·위상 NaN, N=1은 DC bin 하나다', () => {
    const zero = singleSidedSpectrum({ fs: 8, x: new Float64Array(8) });
    expect(Array.from(zero.amplitude)).toEqual([0, 0, 0, 0, 0]);
    expect(Array.from(zero.phase).every(Number.isNaN)).toBe(true);
    const one = singleSidedSpectrum({ fs: 8, x: new Float64Array([-3]) });
    expect(Array.from(one.frequency)).toEqual([0]);
    expect(Array.from(one.amplitude)).toEqual([3]);
    expect(Math.abs(one.phase[0])).toBe(Math.PI);
  });

  it('부적절한 fs·빈 프레임·비거듭제곱 기본 크기·축소·비유한 샘플은 오류', () => {
    for (const fs of [0, -1, Infinity, NaN]) {
      expect(() => singleSidedSpectrum({ fs, x: new Float64Array(8) })).toThrow(RangeError);
    }
    expect(() => singleSidedSpectrum({ fs: 8, x: new Float64Array() })).toThrow(RangeError);
    expect(() => singleSidedSpectrum({ fs: 8, x: new Float64Array(3) })).toThrow(RangeError);
    for (const fftSize of [4, 10, 8.5, NaN]) {
      expect(() => singleSidedSpectrum({ fs: 8, x: new Float64Array(8) }, { fftSize })).toThrow(RangeError);
    }
    expect(() => singleSidedSpectrum({ fs: 8, x: new Float64Array([Infinity, 0]) })).toThrow(RangeError);
  });

  describe('윈도우 옵션 및 S₁ 정규화 (Contents §3, §6)', () => {
    it('bin 중심 톤(A=1): 모든 윈도우 적용 시 피크 진폭이 1.000으로 보정된다', () => {
      const fs = 1024;
      const n = 1024;
      const freq = 64; // bin 중심
      const samples = acquire({ components: [{ type: 'sine', freq, amp: 1.0, phase: 0 }] }, { fs, n });

      const windows = ['uniform', 'hann', 'hamming', 'blackmanHarris', 'flatTop', 'kaiser'] as const;
      for (const win of windows) {
        const spec = singleSidedSpectrum(samples, { window: win });
        // 실수 cos 신호는 음의 주파수 성분의 작은 간섭이 있으므로 1e-5 허용오차 적용
        expect(spec.amplitude[freq]).toBeCloseTo(1.0, 5);
        expect(spec.s1).toBeGreaterThan(0);
      }
    });

    it('bin 사이 톤(δ=0.5): 스캘럽 손실이 Contents §6 기대값과 일치한다', () => {
      const fs = 1024;
      const n = 1024;
      const freq = 64.5; // δ = 0.5 bin 오프셋
      const samples = acquire({ components: [{ type: 'sine', freq, amp: 1.0, phase: 0 }] }, { fs, n });

      // Uniform: 2/π ≈ 0.637 (-36.3%)
      const uniformSpec = singleSidedSpectrum(samples, { window: 'uniform' });
      const uniformPeak = Math.max(uniformSpec.amplitude[64], uniformSpec.amplitude[65]);
      expect(uniformPeak).toBeCloseTo(2 / Math.PI, 2); // 0.639 ≈ 0.64 (음의 주파수 간섭 포함)

      // Hann: 8/(3π) ≈ 0.8488 (-15.1%)
      const hannSpec = singleSidedSpectrum(samples, { window: 'hann' });
      const hannPeak = Math.max(hannSpec.amplitude[64], hannSpec.amplitude[65]);
      expect(hannPeak).toBeCloseTo(8 / (3 * Math.PI), 3); // ≈ 0.849

      // Flat top: 스캘럽 손실 < 0.01 dB (진폭 > 0.998)
      const flatTopSpec = singleSidedSpectrum(samples, { window: 'flatTop' });
      const flatTopPeak = Math.max(flatTopSpec.amplitude[64], flatTopSpec.amplitude[65]);
      expect(flatTopPeak).toBeGreaterThan(0.998);
      expect(flatTopPeak).toBeCloseTo(1.0, 2);
    });

    it('Float64Array 직접 전달과 윈도우 이름 전달의 결과가 완전히 일치한다', () => {
      const samples = acquire({ components: [{ type: 'sine', freq: 40, amp: 2.5 }] }, { fs: 512, n: 512 });
      const byName = singleSidedSpectrum(samples, { window: 'hann' });
      const wArray = new Float64Array(512);
      for (let i = 0; i < 512; i++) wArray[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / 512);
      const byArray = singleSidedSpectrum(samples, { window: wArray });

      expect(byName.amplitude).toEqual(byArray.amplitude);
      expect(byName.s1).toBeCloseTo(byArray.s1, 12);
    });

    it('윈도우 길이가 샘플 길이와 다르면 RangeError를 던진다', () => {
      const samples = { fs: 64, x: new Float64Array(64) };
      const badWindow = new Float64Array(32);
      expect(() => singleSidedSpectrum(samples, { window: badWindow })).toThrow(RangeError);
    });
  });
});


// P2-2 그림 8·9, LAB-FOU-01 (c)의 본문 주장 (D-026): 제로패딩은 분해능을 올리지 않는다
describe('제로패딩과 측정 시간 (P2-2 §4)', () => {
  const FS = 32;
  /** 구간 안 극댓값 중 최댓값의 50 % 이상인 봉우리 위치 */
  const peaksIn = (freq: Float64Array, amp: Float64Array, lo: number, hi: number) => {
    let max = 0;
    for (let i = 0; i < freq.length; i++) if (freq[i] >= lo && freq[i] <= hi) max = Math.max(max, amp[i]);
    const at: number[] = [];
    for (let i = 1; i < freq.length - 1; i++) {
      if (freq[i] < lo || freq[i] > hi) continue;
      if (amp[i] >= 0.5 * max && amp[i] > amp[i - 1] && amp[i] >= amp[i + 1]) at.push(freq[i]);
    }
    return at;
  };
  const twoTones = (n: number, pad: number) =>
    singleSidedSpectrum(acquire({ components: [{ type: 'sine', freq: 8.3, amp: 1 }, { type: 'sine', freq: 8.8, amp: 1 }] }, { fs: FS, n }), { fftSize: n * pad });

  it('0.5 Hz 간격 두 톤은 1초 측정이면 패딩 ×16을 해도 봉우리 하나(두 톤 사이)다', () => {
    const s = twoTones(32, 16);
    const at = peaksIn(s.frequency, s.amplitude, 6, 11);
    expect(at).toHaveLength(1);
    expect(at[0]).toBeGreaterThan(8.3);
    expect(at[0]).toBeLessThan(8.8);
  });

  it('같은 두 톤을 4초 측정하면 두 봉우리로 갈라진다', () => {
    const s = twoTones(128, 4);
    const at = peaksIn(s.frequency, s.amplitude, 6, 11);
    expect(at).toHaveLength(2);
    expect(Math.abs(at[0] - 8.3)).toBeLessThan(0.1);
    expect(Math.abs(at[1] - 8.8)).toBeLessThan(0.1);
  });

  it('정현파 하나의 둔덕 폭(0점 사이)은 패딩과 무관하게 2/T다', () => {
    for (const pad of [8, 32]) {
      const s = singleSidedSpectrum(acquire({ components: [{ type: 'sine', freq: 8, amp: 1 }] }, { fs: FS, n: 32 }), { fftSize: 32 * pad });
      // bin 중심 톤: 이웃 원래 bin(7, 9 Hz)이 0점 → 0점 사이 폭 2 Hz = 2/T
      const near = (f: number) => s.amplitude[Math.round(f / s.binSpacing)];
      expect(near(7)).toBeLessThan(1e-9);
      expect(near(9)).toBeLessThan(1e-9);
      expect(near(7.5)).toBeGreaterThan(0.5);
    }
  });
});
