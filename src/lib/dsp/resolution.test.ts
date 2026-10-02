import { describe, expect, it } from 'vitest';
import {
  calculateResolution,
  minSeparationBins,
  separatedBins,
  smearingMetrics,
} from './resolution';

describe('calculateResolution (Contents §6)', () => {
  it('F_max 1000 Hz, LOR 3200 -> Δf = 0.3125 Hz, T = 3.2 s, N = 8192, fs = 2560 Hz', () => {
    const res = calculateResolution({ fmax: 1000, lor: 3200 });
    expect(res.deltaF).toBeCloseTo(0.3125, 6);
    expect(res.duration).toBeCloseTo(3.2, 6);
    expect(res.n).toBe(8192);
    expect(res.fs).toBeCloseTo(2560, 4);
    // Δf * T = 1 관계 검증
    expect(res.deltaF * res.duration).toBeCloseTo(1.0, 10);
  });

  it('F_max 200 Hz, LOR 400 -> Δf = 0.5 Hz, T = 2.0 s, N = 1024, fs = 512 Hz', () => {
    const res = calculateResolution({ fmax: 200, lor: 400 });
    expect(res.deltaF).toBeCloseTo(0.5, 6);
    expect(res.duration).toBeCloseTo(2.0, 6);
    expect(res.n).toBe(1024);
    expect(res.fs).toBeCloseTo(512, 4);
  });

  it('잘못된 fmax, lor은 RangeError', () => {
    expect(() => calculateResolution({ fmax: 0, lor: 400 })).toThrow(RangeError);
    expect(() => calculateResolution({ fmax: 1000, lor: -1 })).toThrow(RangeError);
    expect(() => calculateResolution({ fmax: 1000, lor: 2.5 })).toThrow(RangeError);
  });
});

describe('separatedBins', () => {
  it('두 주파수 사이의 bin 수 = |f1 - f2| / Δf', () => {
    expect(separatedBins(60, 120, 1.0)).toBeCloseTo(60);
    expect(separatedBins(25.2, 28.8, 1.0)).toBeCloseTo(3.6, 6);
    expect(separatedBins(60, 60, 0.5)).toBe(0);
  });

  it('잘못된 deltaF는 RangeError', () => {
    expect(() => separatedBins(10, 20, 0)).toThrow(RangeError);
    expect(() => separatedBins(10, 20, -0.5)).toThrow(RangeError);
  });
});

describe('smearingMetrics (Contents §6)', () => {
  it('F_max 1000 Hz, LOR 3200 (T = 3.2 s), a = 60 rpm/s -> Δf_1X = 3.2 Hz, smearedBins = 10.24', () => {
    const deltaF = 0.3125;
    const duration = 3.2;
    const a = 60; // 60 rpm/s = 1 Hz/s
    const metrics = smearingMetrics(a, duration, deltaF);

    // Δf_1X = (60 / 60) * 3.2 = 3.2 Hz
    expect(metrics.deltaF1X).toBeCloseTo(3.2, 6);
    // smearedBins = 3.2 / 0.3125 = 10.24 bins
    expect(metrics.smearedBins).toBeCloseTo(10.24, 2);
  });

  it('정속 운전 (a = 0 rpm/s)이면 스미어링 0', () => {
    const metrics = smearingMetrics(0, 2.0, 0.5);
    expect(metrics.deltaF1X).toBe(0);
    expect(metrics.smearedBins).toBe(0);
  });

  it('잘못된 duration, deltaF는 RangeError', () => {
    expect(() => smearingMetrics(60, 0, 0.5)).toThrow(RangeError);
    expect(() => smearingMetrics(60, 2.0, 0)).toThrow(RangeError);
  });
});

describe('minSeparationBins', () => {
  it('윈도우 메인로브 폭에 따른 최소 분리 bin 반환', () => {
    expect(minSeparationBins('uniform')).toBe(2.0);
    expect(minSeparationBins('hann')).toBe(3.5);
    expect(minSeparationBins('flatTop')).toBe(8.0);
  });
});
