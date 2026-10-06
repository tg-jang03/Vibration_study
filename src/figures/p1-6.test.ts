import { describe, expect, it } from 'vitest';
import * as F from './p1-6';
import { P0_6_REFERENCE as R } from './p1-6';

describe('P1-6 figures', () => {
  it('matches theoretical unbalance values quoted in the text', () => {
    // 1500 rpm (r = 0.5)
    expect(R.low.force).toBeCloseTo(246.74, 1);
    expect(R.low.factor).toBeCloseTo(0.3326, 3);
    expect(R.low.amplitudeMm).toBeCloseTo(0.0333, 4);
    expect(R.low.phaseDeg).toBeCloseTo(3.81, 2);

    // 3000 rpm (r = 1.0, resonance)
    expect(R.resonance.force).toBeCloseTo(986.96, 1);
    expect(R.resonance.factor).toBeCloseTo(10.0, 4);
    expect(R.resonance.amplitudeMm).toBeCloseTo(1.0, 4);
    expect(R.resonance.phaseDeg).toBeCloseTo(90.0, 4);

    // 6000 rpm (r = 2.0)
    expect(R.high.force).toBeCloseTo(3947.84, 1);
    expect(R.high.factor).toBeCloseTo(1.3304, 3);
    expect(R.high.amplitudeMm).toBeCloseTo(0.1330, 3);
    expect(R.high.phaseDeg).toBeCloseTo(176.19, 2);

    // Peak location: r_peak = 1 / sqrt(1 - 2*0.05^2) ≈ 1.00251
    expect(R.peak.r).toBeCloseTo(1.00251, 4);
    expect(R.peak.factor).toBeCloseTo(10.0125, 3);
    expect(R.peak.rpm).toBeCloseTo(3007.5, 1);
  });

  it('demonstrates force quadrupling when speed doubles', () => {
    expect(R.resonance.force / R.low.force).toBeCloseTo(4.0, 4);
    expect(R.high.force / R.resonance.force).toBeCloseTo(4.0, 4);
  });

  it('verifies high-speed displacement convergence to eccentricity', () => {
    // As r >> 1, X -> e_cg = 0.1 mm
    const factorHigh = R.high.factor; // at r=2 it is 1.33, approaching 1
    expect(factorHigh).toBeGreaterThan(1.0);
    expect(R.high.amplitudeMm).toBeCloseTo(0.133, 2);
  });

  it('run-up figure peaks near 1.0 mm at 3000 rpm and ends at 0.133 mm at 6000 rpm (r = 2)', () => {
    const [, envelope] = F.runUpTransient.panels[0].series;
    const env = Array.from(envelope.y);
    const t = Array.from(envelope.x);
    const iMax = env.indexOf(Math.max(...env));
    expect(env[iMax]).toBeCloseTo(1.0, 1);
    expect(t[iMax]).toBeCloseTo(2.5, 1);
    expect(env[env.length - 1]).toBeCloseTo(R.high.amplitudeMm, 6);
    expect(env[env.length - 1]).toBeCloseTo(0.133, 3);
  });

  it('has 7 unique figures with ordered ids', () => {
    const figures = [
      F.unbalanceModel,
      F.centrifugalForceCurve,
      F.timeWaveform1X,
      F.unbalanceBode,
      F.staticVsUnbalance,
      F.runUpTransient,
      F.selfCenteringDiagram,
    ];
    const ids = figures.map((f) => f.id);
    expect(ids.length).toBe(7);
    expect(new Set(ids).size).toBe(7);
    expect(F.unbalanceModel.id).toBe('fig-p1-6-1');
    expect(F.selfCenteringDiagram.id).toBe('fig-p1-6-7');
  });
});
