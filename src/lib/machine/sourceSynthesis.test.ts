import { describe, expect, it } from 'vitest';
import { DEFAULT_SOURCES, RING_DECAY, RING_RATE, SOURCE_PHASES, sourceFrequencies, synthesizeSources } from './sourceSynthesis';

describe('P1-8 source synthesis', () => {
  it('reuses the P1-7 frequency map: 3000 rpm, 12 blades → 50 / 100 / 600 Hz', () => {
    expect(sourceFrequencies(50, 12)).toEqual({ oneX: 50, twoX: 100, blade: 600, ring: 85 });
    expect(sourceFrequencies(60, 12)).toEqual({ oneX: 60, twoX: 120, blade: 720, ring: 85 });
  });
  it('the total equals the sum of every source at every sample, including ringing and noise', () => {
    const p = structuredClone(DEFAULT_SOURCES);
    p.sources.ring.enabled = p.sources.noise.enabled = true;
    const result = synthesizeSources(p);
    for (let i = 0; i < result.x.length; i++) {
      expect(result.x[i]).toBe(result.parts.reduce((sum, part) => sum + part.x[i], 0));
    }
  });
  it('matches the analytic cosine sum and calibrated component amplitudes', () => {
    const { t, x, spectrum } = synthesizeSources(DEFAULT_SOURCES);
    for (let i = 0; i < x.length; i += 137) {
      const analytic = 40e-6 * Math.cos(2 * Math.PI * 50 * t[i])
        + 20e-6 * Math.cos(2 * Math.PI * 100 * t[i] + SOURCE_PHASES.twoX)
        + 10e-6 * Math.cos(2 * Math.PI * 600 * t[i] + SOURCE_PHASES.blade);
      expect(x[i]).toBeCloseTo(analytic, 14);
    }
    for (const [f, a] of [[50, 40e-6], [100, 20e-6], [600, 10e-6]]) {
      expect(spectrum.amplitude[f]).toBeCloseTo(a, 12);
    }
  });
  it('the ringing response before the second impact equals a single damped sinusoid', () => {
    const p = structuredClone(DEFAULT_SOURCES);
    p.sources.ring.enabled = true;
    const part = synthesizeSources(p).parts.find((s) => s.id === 'ring')!;
    const i = 80, t = part.t[i];
    expect(t).toBeLessThan(1 / RING_RATE);
    expect(part.x[i]).toBeCloseTo(30e-6 * Math.exp(-t / RING_DECAY) * Math.sin(2 * Math.PI * 85 * t), 14);
    const j = 900;
    const expected = [0, 1 / RING_RATE].reduce((sum, start) => {
      const tau = part.t[j] - start;
      return sum + 30e-6 * Math.exp(-tau / RING_DECAY) * Math.sin(2 * Math.PI * 85 * tau);
    }, 0);
    expect(part.x[j]).toBe(expected);
  });
  it('the same seed gives the same noise and disabled sources contribute zero', () => {
    const p = structuredClone(DEFAULT_SOURCES);
    p.sources.noise.enabled = true;
    const a = synthesizeSources(p), b = synthesizeSources(p);
    expect(a.x).toEqual(b.x);
    p.seed++;
    expect(synthesizeSources(p).x).not.toEqual(a.x);
    for (const s of Object.values(p.sources)) s.enabled = false;
    expect(synthesizeSources(p).x.every((v) => v === 0)).toBe(true);
  });
  it('rejects invalid inputs and unsupported frequencies', () => {
    expect(() => sourceFrequencies(0, 12)).toThrow(RangeError);
    expect(() => sourceFrequencies(50, 1.5)).toThrow(RangeError);
    expect(() => synthesizeSources({ ...DEFAULT_SOURCES, blades: 100 })).toThrow(RangeError);
  });
});
