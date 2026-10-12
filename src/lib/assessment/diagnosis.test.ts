import { describe, expect, it } from 'vitest';
import { baseCoastdown, BASE_ECC, CASE, coastdown, fitErrors, hypotheses, ncForAmplitude, truthSystem } from './diagnosis';
import { unbalanceVector } from '../rotor/runup';

const amp3000 = (s: { ncRpm: number; ecc: number }) => unbalanceVector({ naturalRpm: s.ncRpm, zeta: CASE.zeta, eccentricity: s.ecc }, 3000).amp;

describe('P10-3 case: what changed?', () => {
  it('baseline gives 20 µm p-p at 3000 rpm; every hidden truth gives 40', () => {
    expect(amp3000({ ncRpm: CASE.baseNcRpm, ecc: BASE_ECC }) * 2e6).toBeCloseTo(20, 10);
    for (const id of ['excitation', 'stiffness', 'both'] as const) expect(amp3000(truthSystem(id)) * 2e6).toBeCloseTo(40, 6);
  });
  it('stiffness hypothesis lowers the critical speed from 3500 to about 3165 rpm', () => {
    expect(ncForAmplitude(CASE.nowAmp)).toBeCloseTo(3165, -1);
  });
  it('excitation keeps phase; a moved natural frequency increases the lag at 3000 rpm', () => {
    const h = hypotheses(CASE.nowAmp);
    const i = CASE.rpm.indexOf(3000);
    const base = unbalanceVector({ naturalRpm: CASE.baseNcRpm, zeta: CASE.zeta, eccentricity: BASE_ECC }, 3000);
    expect(h.h1Curve[i].lag).toBeCloseTo(base.lag, 12);
    expect((h.h2Curve[i].lag * 180) / Math.PI).toBeGreaterThan((base.lag * 180) / Math.PI + 20);
  });
  it('3000 rpm amplitude alone cannot separate the hypotheses; phase can', () => {
    const data = coastdown(truthSystem('stiffness'), 1031, 0);
    const op = fitErrors(data, 'op');
    expect(op.h1.amp).toBeCloseTo(0, 12);
    expect(op.h2.amp).toBeCloseTo(0, 12);
    const full = fitErrors(data, 'ampPhase');
    expect(full.h2.amp).toBeCloseTo(0, 9);
    expect(full.h2.lag!).toBeCloseTo(0, 9);
    expect(full.h1.lag!).toBeGreaterThan(0.1);
  });
  it('records are deterministic', () => {
    expect(baseCoastdown()).toEqual(baseCoastdown());
  });
});
