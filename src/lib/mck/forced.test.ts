import { describe, expect, it } from 'vitest';
import { forcedResponseAt, halfPowerPoints, resonancePeak, steadyStateResponse } from './forced';

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

  it('settles to the steady-state term at the forcing frequency', () => {
    const omegaN = 2 * Math.PI * 5;
    const system = { mass: 1, stiffness: omegaN ** 2, damping: 2 * 0.05 * omegaN };
    const input = { forceAmplitude: omegaN ** 2 * 0.01, forcingOmega: 1.6 * omegaN };
    const late = forcedResponseAt(system, input, { x0: 0, v0: 0 }, 10);
    expect(Math.abs(late.transient)).toBeLessThan(1e-8);
    expect(late.x).toBeCloseTo(late.steady, 8);
    const amplitude = 0.01 * steadyStateResponse(1.6, 0.05).amplitudeRatio;
    expect(Math.abs(late.steady)).toBeLessThanOrEqual(amplitude + 1e-15);
  });

  it('is 90 degrees behind exactly at r = 1 for any damping', () => {
    for (const zeta of [0.01, 0.2, 0.7]) {
      expect(steadyStateResponse(1, zeta).phaseLag).toBeCloseTo(Math.PI / 2, 12);
      expect(steadyStateResponse(1, zeta).amplitudeRatio).toBeCloseTo(1 / (2 * zeta), 12);
    }
  });
});

describe('resonancePeak', () => {
  it('matches 1/(2ζ√(1−ζ²)) at r = √(1−2ζ²) for ζ = 0.05', () => {
    const peak = resonancePeak(0.05)!;
    expect(peak.frequencyRatio).toBeCloseTo(0.9974968672, 9);
    expect(peak.amplitudeRatio).toBeCloseTo(10.0125234864, 8);
    expect(steadyStateResponse(peak.frequencyRatio, 0.05).amplitudeRatio).toBeCloseTo(peak.amplitudeRatio, 9);
    expect(steadyStateResponse(peak.frequencyRatio + 1e-3, 0.05).amplitudeRatio).toBeLessThan(peak.amplitudeRatio);
    expect(steadyStateResponse(peak.frequencyRatio - 1e-3, 0.05).amplitudeRatio).toBeLessThan(peak.amplitudeRatio);
  });

  it('has no peak above ζ = 1/√2', () => {
    expect(resonancePeak(0.75)).toBeNull();
  });
});

describe('halfPowerPoints', () => {
  it('lands on peak/√2 and is about 2ζ wide', () => {
    const zeta = 0.05;
    const points = halfPowerPoints(zeta)!;
    const peak = resonancePeak(zeta)!.amplitudeRatio;
    expect(steadyStateResponse(points.lower, zeta).amplitudeRatio).toBeCloseTo(peak / Math.SQRT2, 9);
    expect(steadyStateResponse(points.upper, zeta).amplitudeRatio).toBeCloseTo(peak / Math.SQRT2, 9);
    expect(points.width).toBeCloseTo(0.1002520, 6);
    expect(points.width / (2 * zeta)).toBeCloseTo(1, 2);
  });

  it('halves the width when ζ is halved', () => {
    const ratio = halfPowerPoints(0.025)!.width / halfPowerPoints(0.05)!.width;
    expect(ratio).toBeCloseTo(0.5, 2);
  });
});
