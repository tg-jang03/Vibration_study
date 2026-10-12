import { expect, it } from 'vitest';
import * as F2 from './p10-2';
import * as F3 from './p10-3';
it('P10-2 tutorial peak width is independently 360 rpm and AF 25/3', () => {
  expect(F2.P102_VALUES.width.peakRpm).toBe(3000);
  expect(F2.P102_VALUES.width.n1).toBeCloseTo(2820, 8);
  expect(F2.P102_VALUES.width.n2).toBeCloseTo(3180, 8);
  expect(F2.P102_VALUES.width.af).toBeCloseTo(25 / 3, 10);
  expect(F2.P102_VALUES.conceptSM).toBeCloseTo(100 / 6, 10);
});
it('P10-3 fictional evidence uses SI and exact frequency/ratio', () => {
  expect(F3.P103_VALUES.hz).toBe(50);
  expect(F3.P103_VALUES.ratio).toBe(2);
  expect(F3.P103_VALUES.currentPeak * 1e6).toBe(40);
  expect(F3.P103_VALUES.peak.map(v => v * 1e6)).toEqual([20, 40, 20]);
});
it('new figure data are finite and inside axes', () => {
  for (const figure of [...Object.values(F2), ...Object.values(F3)].filter(v => 'panels' in v)) for (const panel of figure.panels) for (const series of panel.series) {
    expect(series.x.length).toBe(series.y.length);
    for (const [axis, values] of [[panel.x, series.x], [panel.y, series.y]] as const) for (const value of Array.from(values)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(axis.range[0]);
      expect(value).toBeLessThanOrEqual(axis.range[1]);
    }
  }
});
