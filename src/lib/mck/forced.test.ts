import { describe, expect, it } from 'vitest';
import { forcedResponseAt, steadyStateResponse } from './forced';

describe('steadyStateResponse', () => {
  it.each([
    [0.5, 1.3303802105, 3.8140748343],
    [1, 10, 90],
    [2, 0.3325950526, 176.1859251657],
  ])('matches ζ=0.05 reference at r=%s', (r, amplitude, phaseDeg) => {
    const result = steadyStateResponse(r, 0.05);
    expect(result.amplitudeRatio).toBeCloseTo(amplitude, 8);
    expect((result.phaseLag * 180) / Math.PI).toBeCloseTo(phaseDeg, 8);
  });

  it('combines transient and steady terms to satisfy zero initial conditions', () => {
    const system = { mass: 1, stiffness: 1000, damping: 2 * 0.05 * Math.sqrt(1000) };
    const state = forcedResponseAt(system, { forceAmplitude: 10, forcingOmega: Math.sqrt(1000) }, { x0: 0, v0: 0 }, 0);
    expect(state.x).toBeCloseTo(0, 12);
    expect(state.v).toBeCloseTo(0, 12);
  });
});
