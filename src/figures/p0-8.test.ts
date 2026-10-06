import { describe, expect, it } from 'vitest';
import { ambiguityValues, mixedResponse, phaseChanges, repeatedRing, sameAmplitude, spectrumPreview, speedEvidence } from './p0-8';

describe('P0-8 quoted figure values', () => {
  it('the fourth waveform equals the first three pointwise', () => {
    for (let i = 0; i < mixedResponse.panels[3].series[0].y.length; i++) {
      const sum = mixedResponse.panels.slice(0, 3).reduce((s, p) => s + p.series[0].y[i], 0);
      expect(mixedResponse.panels[3].series[0].y[i]).toBeCloseTo(sum, 10);
    }
  });
  it('different force/system combinations give the same 40 µm amplitude', () => {
    expect(ambiguityValues[0].force).toBeCloseTo(30.06659, 4);
    expect(ambiguityValues[1].force).toBe(4);
    for (const v of ambiguityValues) expect(v.force * v.amplitudeRatio).toBeCloseTo(40, 12);
    expect(ambiguityValues[0].phaseLag * 180 / Math.PI).toBeCloseTo(3.814, 3);
    expect(ambiguityValues[1].phaseLag * 180 / Math.PI).toBe(90);
    expect(sameAmplitude.panels[0].series).toHaveLength(2);
  });
  it('a phase change alone changes t=0 from 60 to 20 µm', () => {
    expect(phaseChanges.panels[0].series[0].y[0]).toBe(60);
    expect(phaseChanges.panels[0].series[1].y[0]).toBe(20);
  });
  it('the spectrum center bars recover 40 / 20 / 10 µm', () => {
    const y = spectrumPreview.panels[0].series[0].y;
    for (const [i, a] of [40, 20, 10].entries()) expect(y[i]).toBeCloseTo(a, 6);
  });
  it('the speed example crosses at 3600 rpm / 120 Hz and the fixed line stays fixed', () => {
    const [rot, fixed] = speedEvidence.panels[0].series;
    const i = Array.from(rot.x).indexOf(3600);
    expect(rot.y[0]).toBe(80);
    expect(rot.y[rot.y.length - 1]).toBe(140);
    expect(rot.y[i]).toBe(120);
    expect(Array.from(fixed.y).every((v) => v === 120)).toBe(true);
  });
  it('the ringing plot fits its stated axes', () => {
    for (const panel of repeatedRing.panels) {
      for (const s of panel.series) expect(Math.max(...Array.from(s.y))).toBeLessThan(panel.y.range[1]);
    }
  });
});
