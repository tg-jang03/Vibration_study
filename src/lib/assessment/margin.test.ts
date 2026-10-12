import { describe, expect, it } from 'vitest';
import { marginAtOperating, marginCurve } from './margin';

const H = (r: number, z: number) => (r * r) / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);

describe('AF·SM with critical speed prediction error (LAB-SM-01)', () => {
  it('matches the 1-DOF unbalance response r²/√((1−r²)²+(2ζr)²)', () => {
    const m = marginAtOperating({ af: 8.33, smPct: 15, errorPct: -10, side: 'above' });
    expect(m.zeta).toBeCloseTo(1 / 16.66, 12);
    expect(m.predictedAmp).toBeCloseTo(H(1 / 1.15, m.zeta), 12);
    expect(m.actualAmp).toBeCloseTo(H(1 / (1.15 * 0.9), m.zeta), 12);
    expect(m.actualSmPct).toBeCloseTo(3.5, 10);
  });
  it('a sharper peak (larger AF) is hurt more by the same prediction error', () => {
    const low = marginAtOperating({ af: 2.5, smPct: 15, errorPct: -10, side: 'above' });
    const high = marginAtOperating({ af: 8.33, smPct: 15, errorPct: -10, side: 'above' });
    expect(low.predictedAmp).toBeCloseTo(1.78, 2);
    expect(low.actualAmp).toBeCloseTo(2.38, 2);
    expect(high.predictedAmp).toBeCloseTo(2.85, 2);
    expect(high.actualAmp).toBeCloseTo(6.98, 2);
    expect(high.growth).toBeGreaterThan(low.growth);
  });
  it('zero error → no growth; curve peaks near AF', () => {
    expect(marginAtOperating({ af: 5, smPct: 10, errorPct: 0, side: 'above' }).growth).toBe(1);
    const peak = Math.max(...marginCurve(3000, 10, Array.from({ length: 2001 }, (_, i) => 2000 + i)));
    expect(peak).toBeCloseTo(10 / Math.sqrt(1 - 0.05 ** 2), 2);
  });
  it('P4-1 rotor (critical 3000 below 3600): +10 % error hurts AF 10 more than AF 2.5', () => {
    const sm = (100 * 600) / 3600;
    const high = marginAtOperating({ af: 10, smPct: sm, errorPct: 10, operatingRpm: 3600 });
    const low = marginAtOperating({ af: 2.5, smPct: sm, errorPct: 10, operatingRpm: 3600 });
    expect(high.predictedNc).toBeCloseTo(3000, 9);
    expect(high.actualNc).toBeCloseTo(3300, 9);
    expect(high.predictedAmp).toBeCloseTo(H(1.2, 0.05), 12);
    expect(high.actualAmp).toBeCloseTo(H(3600 / 3300, 0.05), 12);
    expect(high.growth).toBeCloseTo(1.72, 2);
    expect(low.growth).toBeCloseTo(1.13, 2);
  });
  it.each([[0, 10, 0], [5, -1, 0], [5, 10, -100]])('rejects invalid input %s', (af, sm, err) => {
    expect(() => marginAtOperating({ af, smPct: sm, errorPct: err })).toThrow(RangeError);
  });
});
