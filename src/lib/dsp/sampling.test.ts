import { describe, expect, it } from 'vitest';
import { acquire, aliasComponent, aliasFrequency } from './sampling';
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
