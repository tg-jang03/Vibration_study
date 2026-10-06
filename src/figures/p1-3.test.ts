import { describe, expect, it } from 'vitest';
import {
  P0_3_REFERENCE,
  dampedFrequencyShift,
  dampingRegimes,
  decayPerCycle,
  logarithmicDecrement,
} from './p1-3';

describe('P1-3 figures', () => {
  it('matches the damping verification values', () => {
    expect(P0_3_REFERENCE.logDecrement).toBeCloseTo(0.3145527023, 9);
    expect(P0_3_REFERENCE.frequencyRatio).toBeCloseTo(0.9987492178, 9);
    expect(P0_3_REFERENCE.nextPeakRatio).toBeCloseTo(0.7301153802, 9);
    expect(P0_3_REFERENCE.halfCycles).toBeCloseTo(2.2035963307, 9);
  });

  it('uses calculated series and unique ids', () => {
    expect(decayPerCycle.id).toBe('fig-p1-3-4');
    const critical = dampingRegimes.panels[0].series[1].y;
    expect(critical[critical.length - 1]).toBeGreaterThan(0);
    expect(dampedFrequencyShift.panels[0].series[0].y[0]).toBeCloseTo(1, 12);
    expect(logarithmicDecrement.panels[0].series[1].y[1] / logarithmicDecrement.panels[0].series[1].y[0])
      .toBeCloseTo(P0_3_REFERENCE.nextPeakRatio, 10);
  });
});
