import { describe, expect, it } from 'vitest';
import { unbalanceForce, unbalanceResponseFactor, unbalanceSteadyState } from './unbalance';

describe('unbalance response', () => {
  it('makes centrifugal force proportional to speed squared', () => {
    const base = unbalanceForce(0.002, 100);
    expect(unbalanceForce(0.002, 200)).toBeCloseTo(4 * base, 12);
  });

  it('matches the resonance and high-speed limits', () => {
    const resonance = unbalanceResponseFactor(1, 0.05);
    expect(resonance.factor).toBeCloseTo(10, 12);
    expect(resonance.phaseLag).toBeCloseTo(Math.PI / 2, 12);
    const high = unbalanceResponseFactor(1000, 0.05);
    expect(high.factor).toBeCloseTo(1, 5);
    expect(high.phaseLag).toBeCloseTo(Math.PI, 3);
  });

  it('returns displacement scaled by m_u e / M', () => {
    const response = unbalanceSteadyState(100, 0.02, 50, 50, 0.05);
    expect(response.displacementAmplitude).toBeCloseTo((0.02 / 100) * 10, 12);
  });
});
