import { describe, expect, it } from 'vitest';
import * as F from './p0-4';
import { P0_4_REFERENCE as R } from './p0-4';

describe('P0-4 figures', () => {
  it('matches the forced-response verification values quoted in the page', () => {
    expect(R.low.amplitudeRatio).toBeCloseTo(1.3303802105, 9);
    expect(R.low.phaseDeg).toBeCloseTo(3.8140748343, 8);
    expect(R.resonance.amplitudeRatio).toBeCloseTo(10, 10);
    expect(R.resonance.phaseDeg).toBeCloseTo(90, 10);
    expect(R.high.amplitudeRatio).toBeCloseTo(0.3325950526, 9);
    expect(R.high.phaseDeg).toBeCloseTo(176.1859251657, 8);
    expect(R.peak.amplitudeRatio).toBeCloseTo(10.0125, 4);
    expect(R.peak.frequencyRatio).toBeCloseTo(0.9975, 4);
    expect(R.halfPower.width).toBeCloseTo(0.1003, 4);
    expect(R.halfPowerHalfZeta.width / R.halfPower.width).toBeCloseTo(0.5, 2);
    expect(R.transientTau).toBeCloseTo(0.6366, 4);
    expect(R.example.amplitudeRatio).toBeCloseTo(0.6377, 4);
    expect(R.beat.periodS).toBeCloseTo(2, 10);
    expect(R.beat.amplitudeRatio).toBeCloseTo(5.240, 3);
  });

  it('starts the time responses from rest and lets the transient die out', () => {
    const [top, bottom] = F.transientAndSteady.panels;
    const x = top.series[0].y;
    expect(x[0]).toBeCloseTo(0, 10);
    const transient = bottom.series[0].y;
    const lateMax = Math.max(...Array.from(transient).slice(-300).map(Math.abs));
    expect(lateMax).toBeLessThan(0.05 * 6.4);
  });

  it('shows the beat envelope above the steady amplitude early and close to it late', () => {
    const y = Array.from(F.beatStart.panels[0].series[0].y);
    const early = Math.max(...y.slice(0, 1000).map(Math.abs));
    const late = Math.max(...y.slice(-500).map(Math.abs));
    expect(early).toBeGreaterThan(1.5 * R.beat.amplitudeRatio);
    expect(late).toBeLessThan(1.25 * R.beat.amplitudeRatio);
  });

  it('uses unique ids', () => {
    const figures = [
      F.forcedModel,
      F.transientAndSteady,
      F.threeRegimes,
      F.amplitudeCurve,
      F.phaseCurve,
      F.peakWidth,
      F.beatStart,
    ];
    const ids = figures.map((f) => f.id);
    expect(ids.length).toBe(7);
    expect(new Set(ids).size).toBe(ids.length);
    expect(F.forcedModel.id).toBe('fig-p0-4-1');
    expect(F.beatStart.id).toBe('fig-p0-4-7');
  });
});
