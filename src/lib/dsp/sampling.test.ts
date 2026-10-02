import { describe, expect, it } from 'vitest';
import {
  acquire,
  aliasComponent,
  aliasFrequency,
  butterworthAttenuationDb,
  butterworthGain,
  effectiveSnr,
  quantize,
  theoreticalSqnr,
} from './sampling';
import { evaluate, type SignalSpec } from './signal';

describe('aliasFrequency & aliasComponent', () => {
  it('나이퀴스트 아래 성분은 그대로 보인다', () => {
    expect(aliasFrequency(60, 1000)).toBeCloseTo(60);
    const comp = aliasComponent(60, 0.4, 1000);
    expect(comp.freq).toBe(60);
    expect(comp.phase).toBeCloseTo(0.4);
    expect(comp.inverted).toBe(false);
    expect(comp.zone).toBe(0);
  });

  it('fs 1000 Hz에서 940·1060·1940 Hz는 모두 60 Hz로 보인다 (Contents §6)', () => {
    for (const f of [940, 1060, 1940]) {
      expect(aliasFrequency(f, 1000)).toBeCloseTo(60);
    }
    // 940 Hz: 1000 - 60 (위쪽에서 접힘 -> 위상 반전)
    const c940 = aliasComponent(940, 0.5, 1000);
    expect(c940.freq).toBe(60);
    expect(c940.phase).toBeCloseTo(-0.5);
    expect(c940.inverted).toBe(true);
    expect(c940.zone).toBe(1);

    // 1060 Hz: 1000 + 60 (아래쪽에서 나감 -> 위상 유지)
    const c1060 = aliasComponent(1060, 0.5, 1000);
    expect(c1060.freq).toBe(60);
    expect(c1060.phase).toBeCloseTo(0.5);
    expect(c1060.inverted).toBe(false);
    expect(c1060.zone).toBe(1);

    // 1940 Hz: 2000 - 60 (위쪽에서 접힘 -> 위상 반전)
    const c1940 = aliasComponent(1940, 0.5, 1000);
    expect(c1940.freq).toBe(60);
    expect(c1940.phase).toBeCloseTo(-0.5);
    expect(c1940.inverted).toBe(true);
    expect(c1940.zone).toBe(2);
  });

  it('AAF 없는 1.8·F_max 성분: F_max 1000 Hz, fs 2560 Hz → 760 Hz', () => {
    expect(aliasFrequency(1800, 2560)).toBeCloseTo(760);
    const comp = aliasComponent(1800, 0.3, 2560);
    expect(comp.freq).toBe(760);
    expect(comp.inverted).toBe(true);
  });
});

describe('acquire', () => {
  const sine = (freq: number, phase = 0): SignalSpec => ({
    components: [{ type: 'sine', freq, amp: 1, phase }],
  });

  it('샘플 시각은 t[i] = t0 + i/fs, 길이는 n', () => {
    const { t, x, fs } = acquire(sine(10), { fs: 200, n: 8, t0: 0.5 });
    expect(fs).toBe(200);
    expect(t.length).toBe(8);
    expect(x.length).toBe(8);
    expect(t[0]).toBe(0.5);
    expect(t[3]).toBeCloseTo(0.5 + 3 / 200, 15);
  });

  it('잡음이 없으면 샘플값 = 그 시각의 참 신호', () => {
    const spec: SignalSpec = {
      components: [
        { type: 'sine', freq: 37, amp: 0.8, phase: 1.1 },
        { type: 'harmonics', f0: 5, amps: [0.3, 0.2] },
      ],
    };
    const { t, x } = acquire(spec, { fs: 1000, n: 64 });
    for (let i = 0; i < 64; i++) expect(x[i]).toBeCloseTo(evaluate(spec, t[i]), 12);
  });

  it('에일리어싱: fs 1000 Hz에서 940 Hz(φ)의 샘플 = 60 Hz(−φ)의 샘플 — 위로 접히면 위상 반전', () => {
    const phi = 0.7;
    const a = acquire(sine(940, phi), { fs: 1000, n: 50 }).x;
    const b = acquire(sine(60, -phi), { fs: 1000, n: 50 }).x;
    for (let i = 0; i < 50; i++) expect(a[i]).toBeCloseTo(b[i], 9);
  });

  it('에일리어싱: 1060 Hz(φ)의 샘플 = 60 Hz(+φ)의 샘플', () => {
    const phi = 0.7;
    const a = acquire(sine(1060, phi), { fs: 1000, n: 50 }).x;
    const b = acquire(sine(60, phi), { fs: 1000, n: 50 }).x;
    for (let i = 0; i < 50; i++) expect(a[i]).toBeCloseTo(b[i], 9);
  });

  it('잡음: 표준편차 ≈ rms, 같은 시드는 같은 잡음', () => {
    const spec = (seed: number): SignalSpec => ({ components: [{ type: 'noise', rms: 0.5, seed }] });
    const n = 50_000;
    const a = acquire(spec(9), { fs: 1000, n }).x;
    const b = acquire(spec(9), { fs: 1000, n }).x;
    const c = acquire(spec(10), { fs: 1000, n }).x;
    expect(a).toEqual(b);
    expect(a[0]).not.toBe(c[0]);
    let sumSq = 0;
    for (let i = 0; i < n; i++) sumSq += a[i] * a[i];
    expect(Math.abs(Math.sqrt(sumSq / n) - 0.5)).toBeLessThan(0.01);
  });

  it('잘못된 fs, n은 오류', () => {
    expect(() => acquire(sine(10), { fs: 0, n: 8 })).toThrow(RangeError);
    expect(() => acquire(sine(10), { fs: 100, n: 2.5 })).toThrow(RangeError);
  });
});

describe('butterworthGain & butterworthAttenuationDb (Contents §6)', () => {
  it('f = 0일 때 이득 1, 감쇠 0 dB', () => {
    expect(butterworthGain(0, 1000, 8)).toBe(1.0);
    expect(butterworthAttenuationDb(0, 1000, 8)).toBe(0.0);
  });

  it('차단주파수 fc에서 -3 dB (이득 1/√2 ≈ 0.7071)', () => {
    expect(butterworthGain(1000, 1000, 4)).toBeCloseTo(1 / Math.SQRT2, 5);
    expect(butterworthAttenuationDb(1000, 1000, 4)).toBeCloseTo(3.0103, 3);
  });

  it('Butterworth 8차, f/fc = 1.8 -> 감쇠 40.8 dB (|H| ≈ 0.00907)', () => {
    const fc = 1000;
    const f = 1800; // ratio = 1.8
    const gain = butterworthGain(f, fc, 8);
    const att = butterworthAttenuationDb(f, fc, 8);
    // 10 * log10(1 + 1.8^16) = 40.8407 dB
    expect(att).toBeCloseTo(40.84, 1);
    expect(gain).toBeCloseTo(0.009077, 4);
    // 감쇠 dB = -20 * log10(gain)
    expect(-20 * Math.log10(gain)).toBeCloseTo(att, 4);
  });

  it('잘못된 fc, order는 RangeError', () => {
    expect(() => butterworthGain(100, 0, 4)).toThrow(RangeError);
    expect(() => butterworthAttenuationDb(100, 1000, -1)).toThrow(RangeError);
  });
});

describe('theoreticalSqnr & effectiveSnr (Contents §6)', () => {
  it('풀스케일 정현파 SQNR: 6.02 * b + 1.76 dB', () => {
    expect(theoreticalSqnr(16)).toBeCloseTo(98.08, 2);
    expect(theoreticalSqnr(8)).toBeCloseTo(49.92, 2);
    expect(theoreticalSqnr(24)).toBeCloseTo(146.24, 2);
  });

  it('레인지 여유(Back-off) 반영: 10배 여유 시 20 dB 감소', () => {
    // 16 bit 풀스케일 98.08 dB, range/peak = 10 -> -20 dB -> 78.08 dB
    expect(effectiveSnr(16, 10, 1)).toBeCloseTo(78.08, 2);
  });

  it('잘못된 bits, range, peakAmp는 오류', () => {
    expect(() => theoreticalSqnr(0)).toThrow(RangeError);
    expect(() => effectiveSnr(16, 0, 1)).toThrow(RangeError);
    expect(() => effectiveSnr(16, 10, 0)).toThrow(RangeError);
  });
});

describe('quantize', () => {
  it('클리핑 없는 경우: 오차 범위 |e[n]| <= LSB / 2', () => {
    const n = 1000;
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = 0.8 * Math.sin((2 * Math.PI * 5 * i) / n);

    const bits = 8;
    const range = 1.0;
    const res = quantize(x, { bits, range });

    expect(res.clipped).toBe(false);
    expect(res.clippedCount).toBe(0);
    expect(res.clipRatio).toBe(0);

    const expectedLsb = (2 * range) / Math.pow(2, bits);
    expect(res.lsb).toBeCloseTo(expectedLsb, 6);

    for (let i = 0; i < n; i++) {
      expect(Math.abs(res.error[i])).toBeLessThanOrEqual(res.lsb / 2 + 1e-12);
      expect(res.y[i]).toBeCloseTo(x[i] + res.error[i], 12);
    }
  });

  it('클리핑 발생: 신호 피크 > range 시 클리핑 플래그 및 카운트 검출', () => {
    const x = new Float64Array([-1.5, -0.5, 0, 0.5, 1.5]);
    const res = quantize(x, { bits: 8, range: 1.0 });

    expect(res.clipped).toBe(true);
    expect(res.clippedCount).toBe(2);
    expect(res.clipRatio).toBe(2 / 5);

    // 8 bit: maxCode = 127, minCode = -128, LSB = 2/256 = 1/128
    const maxVal = 127 * (2 / 256);
    const minVal = -128 * (2 / 256);
    expect(res.y[0]).toBeCloseTo(minVal, 6);
    expect(res.y[4]).toBeCloseTo(maxVal, 6);
  });

  it('잘못된 파라미터는 RangeError', () => {
    const x = new Float64Array([0]);
    expect(() => quantize(x, { bits: 0, range: 1 })).toThrow(RangeError);
    expect(() => quantize(x, { bits: 33, range: 1 })).toThrow(RangeError);
    expect(() => quantize(x, { bits: 16, range: 0 })).toThrow(RangeError);
  });
});

