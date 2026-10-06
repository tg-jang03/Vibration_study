import { describe, expect, it } from 'vitest';
import { P0_1_REFERENCE, energyExchange, oneCycle } from './p0-1';

describe('P0-1 figures', () => {
  it('keeps the body, figure and lab reference values aligned', () => {
    expect(P0_1_REFERENCE.frequencyHz).toBeCloseTo(5.0329212104, 9);
    expect(P0_1_REFERENCE.period).toBeCloseTo(0.1986917653, 9);
    expect(P0_1_REFERENCE.equilibriumSpeed).toBeCloseTo(0.316227766, 9);
  });

  it('uses unique P0-1 ids and calculated series', () => {
    expect(oneCycle.id).toBe('fig-p0-1-3');
    expect(oneCycle.panels[0].series[0].x.length).toBe(601);
    expect(energyExchange.panels[0].series[0].y[0]).toBeCloseTo(1, 12);
    expect(energyExchange.panels[0].series[1].y[0]).toBeCloseTo(0, 12);
  });
});
