import { describe, expect, it } from 'vitest';
import * as F from './p10-1';

const V = F.P101_VALUES;
describe('P10-1 numbers quoted in the text', () => {
  it('figure 2: velocity RMS 1.56 mm/s, displacement 43.3 µm p-p', () => {
    expect(V.velRms).toBeCloseTo(Math.sqrt((2 ** 2 + 0.8 ** 2 + 0.5 ** 2) / 2), 2);
    expect(V.velRms).toBeCloseTo(1.56, 2);
    expect(V.dispPP).toBeCloseTo(43.3, 1);
  });
  it('figure 4 / lab default: stays B, leaves the change band on day 30, 5-day mean 4.04 → 30.8 %', () => {
    expect(V.band).toEqual({ lower: 1.5, upper: 3.5, width: 1 });
    expect(V.verdict.lastZone).toBe('B');
    expect(V.verdict.zoneDay).toBeNull();
    expect(V.verdict.changeDay).toBe(30);
    expect(V.verdict.lastValue).toBeCloseTo(4.04, 2);
    expect(V.verdict.lastChange.percentOfBC).toBeCloseTo(30.8, 1);
    expect(V.zoneDemo.percentOfBC).toBe(30);
  });
  it('figure 5: alarm = baseline + 20 % × B/C, capped at B/C', () => {
    expect(V.margin).toBe(1);
    expect(V.pAlarm).toBe(2);
    expect(V.qRaw).toBeCloseTo(5.6, 12);
    expect(V.qAlarm).toBe(5);
  });
  it('figure 6: equal magnitude, 90° rotation → |ΔV| = 3√2', () => expect(V.dv).toBeCloseTo(3 * Math.SQRT2, 12));
  it('figure 7: both spectra have the same overall 2.78 mm/s RMS', () => {
    expect(V.nowTotal).toBeCloseTo(V.baseTotal, 12);
    expect(V.baseTotal).toBeCloseTo(2.78, 2);
    expect(V.now1x).toBeCloseTo(2.487, 3);
  });
});
it('all P10-1 figure series stay inside their axes', () => {
  for (const figure of Object.values(F).filter((v) => typeof v === 'object' && 'panels' in v)) for (const panel of (figure as any).panels) for (const series of panel.series) {
    expect(series.x.length).toBe(series.y.length);
    for (const [axis, values] of [[panel.x, series.x], [panel.y, series.y]] as const) for (const value of Array.from(values as ArrayLike<number>)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(axis.range[0]);
      expect(value).toBeLessThanOrEqual(axis.range[1]);
    }
  }
});
