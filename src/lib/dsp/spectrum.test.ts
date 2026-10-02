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
});
