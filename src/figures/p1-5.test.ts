import { describe, expect, it } from 'vitest';
import * as F from './p1-5';
import { P0_5_REFERENCE as R } from './p1-5';

describe('P1-5 figures', () => {
  it('matches theoretical natural frequencies and ratios', () => {
    // m = 1, k = 1000, kc = 1000
    // w1 = sqrt(1000) rad/s -> f1 = 5.0329... Hz
    expect(R.f1).toBeCloseTo(5.0329, 3);
    // w2 = sqrt(3000) rad/s -> f2 = 8.7173... Hz
    expect(R.f2).toBeCloseTo(8.7173, 3);
    expect(R.ratio).toBeCloseTo(Math.sqrt(3), 6);

    // kc = 100
    // w1 = sqrt(1000) rad/s -> weakF1 = 5.0329... Hz
    expect(R.weakF1).toBeCloseTo(5.0329, 3);
    // w2 = sqrt(1200) rad/s -> weakF2 = 5.5133... Hz
    expect(R.weakF2).toBeCloseTo(5.5133, 3);
    expect(R.weakBeatPeriod).toBeCloseTo(1 / (R.weakF2 - R.weakF1), 6);
    expect(R.weakBeatPeriod).toBeCloseTo(2.0818, 3);
  });

  it('preserves exact in-phase and anti-phase mode motion in pure mode responses', () => {
    const [panel1, panel2] = F.pureModeResponses.panels;
    const x1_mode1 = Array.from(panel1.series[0].y);
    const x2_mode1 = Array.from(panel1.series[1].y);
    expect(x1_mode1[0]).toBeCloseTo(10, 4);
    expect(x2_mode1[0]).toBeCloseTo(10, 4);
    for (let i = 0; i < x1_mode1.length; i += 50) {
      expect(x1_mode1[i]).toBeCloseTo(x2_mode1[i], 6);
    }

    const x1_mode2 = Array.from(panel2.series[0].y);
    const x2_mode2 = Array.from(panel2.series[1].y);
    expect(x1_mode2[0]).toBeCloseTo(10, 4);
    expect(x2_mode2[0]).toBeCloseTo(-10, 4);
    for (let i = 0; i < x1_mode2.length; i += 50) {
      expect(x1_mode2[i]).toBeCloseTo(-x2_mode2[i], 6);
    }
  });

  it('reconstructs actual displacement from mode superposition exactly', () => {
    const [, panelModeDecomp] = F.modalSuperposition.panels;
    const actualX1 = Array.from(panelModeDecomp.series[0].y);
    const mode1Comp = Array.from(panelModeDecomp.series[1].y);
    const mode2Comp = Array.from(panelModeDecomp.series[2].y);

    for (let i = 0; i < actualX1.length; i += 40) {
      expect(actualX1[i]).toBeCloseTo(mode1Comp[i] + mode2Comp[i], 6);
    }
  });

  it('exhibits energy exchange beating in the weakly coupled system', () => {
    const panel = F.beatEnergyExchange.panels[0];
    const x1 = Array.from(panel.series[0].y);
    const x2 = Array.from(panel.series[1].y);
    const t = Array.from(panel.series[0].x);

    expect(x1[0]).toBeCloseTo(10, 4);
    expect(x2[0]).toBeCloseTo(0, 4);

    // Near half beat period (~1.04 s), x2 amplitude should peak near 10 mm and x1 near 0
    const halfBeatTime = R.weakBeatPeriod / 2;
    let maxIdxNearHalf = 0;
    let minTDiff = Infinity;
    for (let i = 0; i < t.length; i++) {
      const diff = Math.abs(t[i] - halfBeatTime);
      if (diff < minTDiff) {
        minTDiff = diff;
        maxIdxNearHalf = i;
      }
    }

    // Look around window +/- 15 points
    const windowX1 = x1.slice(maxIdxNearHalf - 15, maxIdxNearHalf + 16).map(Math.abs);
    const windowX2 = x2.slice(maxIdxNearHalf - 15, maxIdxNearHalf + 16).map(Math.abs);
    expect(Math.max(...windowX2)).toBeGreaterThan(9.0);
    expect(Math.min(...windowX1)).toBeLessThan(1.5);
  });

  it('has 7 distinct figures with unique IDs in order', () => {
    const figures = [
      F.twoDofModel,
      F.modeShapesDiagram,
      F.pureModeResponses,
      F.modalSuperposition,
      F.beatEnergyExchange,
      F.twoDofFrf,
      F.continuumModes,
    ];
    const ids = figures.map((f) => f.id);
    expect(ids.length).toBe(7);
    expect(new Set(ids).size).toBe(7);
    expect(F.twoDofModel.id).toBe('fig-p1-5-1');
    expect(F.continuumModes.id).toBe('fig-p1-5-7');
  });
});
