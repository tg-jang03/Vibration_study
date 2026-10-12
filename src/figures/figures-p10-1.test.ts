import { expect, it } from 'vitest';
import * as F from './p10-1';
it('P10-1 fictional arithmetic agrees with independent values', () => {
  expect(F.P101_VALUES.zone).toBe('B');
  expect(F.P101_VALUES.change.percentOfBC).toBe(30);
  expect(F.P101_VALUES.smallChange.percentOfBC).toBeCloseTo(6, 12);
});
it('all P10-1 figure series stay inside their axes', () => {
  for (const figure of Object.values(F).filter(v => 'panels' in v)) for (const panel of figure.panels) for (const series of panel.series) {
    expect(series.x.length).toBe(series.y.length);
    for (const [axis, values] of [[panel.x, series.x], [panel.y, series.y]] as const) for (const value of Array.from(values)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(axis.range[0]);
      expect(value).toBeLessThanOrEqual(axis.range[1]);
    }
  }
});
