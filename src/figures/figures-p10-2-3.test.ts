import { describe, expect, it } from 'vitest';
import * as F2 from './p10-2';
import * as F3 from './p10-3';

describe('P10-2 numbers quoted in the text', () => {
  const V = F2.P102_VALUES;
  it('figure 3 = P4-1 rotor: AF 9.84, half-power 2866.5 · 3171.5 rpm, SM 16.7 %', () => {
    expect(V.peakRpm).toBe(3000);
    expect(V.af).toBeCloseTo(9.84, 2);
    expect(V.n1).toBeCloseTo(2866.5, 0);
    expect(V.n2).toBeCloseTo(3171.5, 0);
    expect(V.sm).toBeCloseTo(100 / 6, 10);
  });
  it('figure 4 / LAB-SM-01: +10 % error → AF 10 ×1.72 (3.16 → 5.43), AF 2.5 ×1.13 (2.21 → 2.50)', () => {
    expect(V.high.predictedAmp).toBeCloseTo(3.16, 2);
    expect(V.high.actualAmp).toBeCloseTo(5.43, 2);
    expect(V.high.growth).toBeCloseTo(1.72, 2);
    expect(V.low.predictedAmp).toBeCloseTo(2.21, 2);
    expect(V.low.actualAmp).toBeCloseTo(2.50, 2);
    expect(V.low.growth).toBeCloseTo(1.13, 2);
  });
  it('figure 5: δ(0) = 0.315, q₀ = 10 % of k (= 2ζ), δ(q_A = 4 %) = 0.189, margin 2.5', () => {
    expect(V.delta0).toBeCloseTo(0.315, 3);
    expect(V.q0).toBeCloseTo(0.1, 12);
    expect(V.deltaQa).toBeCloseTo(0.189, 3);
    expect(V.q0 / V.qa).toBeCloseTo(2.5, 12);
  });
});
describe('P10-3 numbers quoted in the text', () => {
  const V = F3.P103_VALUES;
  it('case: 50 Hz, 20 → 40 µm p-p at 3000 rpm, phase 27.3° → 56.4°, Nc 3500 → 3165 rpm (−18 % stiffness)', () => {
    expect(V.hz).toBe(50);
    expect(V.baseAmp).toBeCloseTo(20, 0);
    expect(V.nowAmp).toBeCloseTo(40, 0);
    expect(V.baseLag).toBeCloseTo(27.3, 1);
    expect(V.nowLag).toBeCloseTo(56.4, 1);
    expect(V.ncNow).toBeCloseTo(3165, 0);
    expect(1 - (V.ncNow / V.ncBase) ** 2).toBeCloseTo(0.18, 2);
    expect(V.at2500.base).toBeCloseTo(8.19, 2);
    expect(V.at2500.now).toBeCloseTo(12.5, 1);
  });
  it('figure 4 / LAB-DIAG-01: H1 3.0 µm · 11.7°, H2 0.37 µm · 1.6°', () => {
    expect(V.h1.amp).toBeCloseTo(3.0, 1);
    expect(V.h1.lag).toBeCloseTo(11.7, 1);
    expect(V.h2.amp).toBeCloseTo(0.37, 2);
    expect(V.h2.lag).toBeCloseTo(1.6, 1);
  });
  it('figure 6: linear 30.2 weeks vs exponential 19.8 weeks to 80 µm p-p', () => {
    expect(V.linWeek).toBeCloseTo(30.2, 1);
    expect(V.expWeek).toBeCloseTo(19.8, 1);
  });
});
it('P10-2 · P10-3 figure data are finite and inside axes', () => {
  for (const figure of [...Object.values(F2), ...Object.values(F3)].filter((v) => typeof v === 'object' && 'panels' in v)) for (const panel of (figure as any).panels) for (const series of panel.series) {
    expect(series.x.length).toBe(series.y.length);
    for (const [axis, values] of [[panel.x, series.x], [panel.y, series.y]] as const) for (const value of Array.from(values as ArrayLike<number>)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(axis.range[0]);
      expect(value).toBeLessThanOrEqual(axis.range[1]);
    }
  }
});
