import { describe, expect, it } from 'vitest';
import {
  P0_2_REFERENCE,
  amplitudeIndependence,
  displacementVelocityAcceleration,
  massAndStiffness,
  staticDeflectionEstimate,
} from './p1-2';

describe('P1-2 figures', () => {
  it('keeps the natural-frequency reference values exact', () => {
    expect(P0_2_REFERENCE.omegaN).toBeCloseTo(Math.sqrt(1000), 12);
    expect(P0_2_REFERENCE.frequencyHz).toBeCloseTo(5.0329212104, 9);
    expect(P0_2_REFERENCE.period).toBeCloseTo(0.1986917653, 9);
    expect(P0_2_REFERENCE.equilibriumSpeed).toBeCloseTo(0.316227766, 9);
    expect(P0_2_REFERENCE.endAcceleration).toBeCloseTo(10, 12);
  });

  it('uses calculated response series and unique ids', () => {
    expect(massAndStiffness.id).toBe('fig-p1-2-3');
    expect(amplitudeIndependence.panels[0].series[0].x.length).toBe(501);
    expect(displacementVelocityAcceleration.panels[0].series[2].y[0]).toBeCloseTo(-1, 12);
    expect(staticDeflectionEstimate.panels[0].series[0].y.length).toBe(301);
  });
});
