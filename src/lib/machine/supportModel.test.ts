import { describe, expect, it } from 'vitest';
import { seriesStiffness, supportProperties, SUPPORT_EXAMPLE } from './supportModel';

describe('massless series support teaching model', () => {
  it('matches force/total-deflection and the SDOF analytic solution', () => {
    const p = supportProperties(SUPPORT_EXAMPLE);
    const force = 1000;
    const totalDeflection = force / 1e6 + force / 2e6 + force / 1e6;
    expect(p.stiffness).toBeCloseTo(force / totalDeflection, 8);
    expect(p.stiffness).toBeCloseTo(400000, 8);
    expect(p.frequencyHz).toBeCloseTo(10.0658424209, 8);
    expect(p.rigidSupportFrequencyHz).toBeCloseTo(Math.sqrt((2e6 / 3) / 100) / (2 * Math.PI), 10);
  });
  it('three equal springs give k/3, not 3k', () => {
    expect(seriesStiffness([900, 900, 900])).toBe(300);
    expect(seriesStiffness([900])).toBe(900);
  });
  it('matches the soft-support example independently', () => {
    const p = supportProperties({ ...SUPPORT_EXAMPLE, supportStiffness: 250000 });
    expect(p.stiffness).toBeCloseTo(2e6 / 11, 8);
    expect(p.frequencyHz).toBeCloseTo(Math.sqrt(20000 / 11) / (2 * Math.PI), 10);
  });
  it('increases monotonically but stays below the rigid support limit', () => {
    const values = [1e5, 2.5e5, 1e6, 4e6, 1e7].map((supportStiffness) =>
      supportProperties({ ...SUPPORT_EXAMPLE, supportStiffness }));
    values.forEach((p, i) => {
      expect(p.frequencyHz).toBeLessThan(p.rigidSupportFrequencyHz);
      if (i) expect(p.frequencyHz).toBeGreaterThan(values[i - 1].frequencyHz);
    });
  });
  it('mass doubled means 1/sqrt(2) frequency, stiffness unchanged', () => {
    const a = supportProperties(SUPPORT_EXAMPLE);
    const b = supportProperties({ ...SUPPORT_EXAMPLE, mass: 200 });
    expect(b.stiffness).toBe(a.stiffness);
    expect(b.frequencyHz / a.frequencyHz).toBeCloseTo(1 / Math.SQRT2, 12);
  });
  it('approaches weak spring and rigid support limits without mutating input', () => {
    expect(seriesStiffness([1, 1e15, 1e15])).toBeCloseTo(1, 12);
    const model = Object.freeze({ ...SUPPORT_EXAMPLE, supportStiffness: 1e20 });
    const p = supportProperties(model);
    expect(p.stiffness).toBeCloseTo(p.rigidSupportStiffness, 7);
    expect(model.supportStiffness).toBe(1e20);
  });
  it.each([0, -1, NaN, Infinity])('rejects invalid stiffness and mass %s', (value) => {
    expect(() => seriesStiffness([1000, value])).toThrow(RangeError);
    expect(() => supportProperties({ ...SUPPORT_EXAMPLE, mass: value })).toThrow(RangeError);
  });
  it('rejects empty springs', () => expect(() => seriesStiffness([])).toThrow(RangeError));
});
