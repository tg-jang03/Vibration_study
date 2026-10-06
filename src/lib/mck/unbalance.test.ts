import { describe, expect, it } from 'vitest';
import { unbalanceForce, unbalancePeak, unbalanceResponseFactor, unbalanceSteadyState } from './unbalance';

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

  it('calculates unbalance peak location and factor for small damping', () => {
    const peak = unbalancePeak(0.05);
    expect(peak).not.toBeNull();
    // r_peak = 1 / sqrt(1 - 2*0.05^2) = 1 / sqrt(0.995) ≈ 1.00251
    expect(peak!.frequencyRatio).toBeCloseTo(1.00251, 4);
    // factor_peak = 1 / (2*0.05 * sqrt(1 - 0.05^2)) ≈ 10.0125
    expect(peak!.responseFactor).toBeCloseTo(10.0125, 3);

    // No peak for zeta >= 1/sqrt(2)
    expect(unbalancePeak(0.8)).toBeNull();
    expect(unbalancePeak(1.0)).toBeNull();
  });
});
