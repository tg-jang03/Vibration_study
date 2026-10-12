import { describe, expect, it } from 'vitest';
import { P113_VALUES as V, flow, keyFig, oneRevFig, compFig, cascadeFig, compareFig } from './p11-3';

/** P11-3 본문·캡션·LAB-REV-01 과제가 인용하는 숫자 (합성 정지 기록 A·B) */
describe('P11-3 그림 숫자', () => {
  it('그림 id가 겹치지 않는다', () => {
    expect(new Set([flow, keyFig, oneRevFig, compFig, cascadeFig, compareFig].map((f) => f.id)).size).toBe(6);
  });
  it('§3 키페이저: 빠진 펄스 자리 3353 rpm → 1676 rpm, B 펄스 2816개(메움 3 · 지움 1), 홈 2.8샘플', () => {
    expect(Math.round(V.missRpm)).toBe(3353);
    expect(Math.round(V.dipRpm)).toBe(1676);
    expect(V.A.pulses).toBe(2818);
    expect(V.B.pulses).toBe(2816);
    expect(V.B.filled).toBe(3);
    expect(V.B.removed).toBe(1);
    expect(V.notchSamples).toBeCloseTo(2.84, 2);
  });
  it('§4 한 바퀴: 4001 rpm, 77샘플, 38.6 µm p-p ∠198°', () => {
    expect(Math.round(V.rev.rpm)).toBe(4001);
    expect(V.rev.samples).toBe(77);
    expect(V.rev.ampPP).toBeCloseTo(38.6, 1);
    expect(Math.round(V.rev.lag)).toBe(198);
  });
  it('§5 기록 A: slow roll 3.9 µm ∠198°, 잰 그대로 3350 rpm 76.7 → 보상 3299 rpm 74.7, AF 5.95', () => {
    expect(V.A.srPP).toBeCloseTo(3.9, 1);
    expect(Math.round(V.A.srLag)).toBe(198);
    expect(Math.round(V.A.rawPeakRpm)).toBe(3350);
    expect(V.A.rawPeakPP).toBeCloseTo(76.7, 1);
    expect(Math.round(V.A.peakRpm)).toBe(3299);
    expect(V.A.peakPP).toBeCloseTo(74.7, 1);
    expect(V.A.af!).toBeCloseTo(5.95, 2);
  });
  it('§6 A vs B: 잰 그대로 봉우리 76.7 → 83.7, 최고 회전수 20.9 → 34.3 / 보상 3299 → 3051 rpm, 74.7 → 60.0, 17.2 → 16.1, 3000 rpm 80° → 130°', () => {
    expect(V.B.rawPeakPP).toBeCloseTo(83.7, 1);
    expect(Math.round(V.B.rawPeakRpm)).toBe(3051);
    expect(V.A.rawTopPP).toBeCloseTo(20.9, 1);
    expect(V.B.rawTopPP).toBeCloseTo(34.3, 1);
    expect(V.B.srPP).toBeCloseTo(24.0, 1);
    expect(Math.round(V.B.srLag)).toBe(149);
    expect(Math.round(V.B.peakRpm)).toBe(3051);
    expect(V.B.peakPP).toBeCloseTo(60.0, 1);
    expect(V.A.topPP).toBeCloseTo(17.2, 1);
    expect(V.B.topPP).toBeCloseTo(16.1, 1);
    expect(Math.round(V.A.lag3000)).toBe(80);
    expect(Math.round(V.B.lag3000)).toBe(130);
    expect(V.B.af!).toBeCloseTo(4.77, 2);
    // 강성 비 = (고유진동수 비)² — 봉우리 회전수 비로 어림
    expect(Math.round(100 * (1 - (V.B.peakRpm / V.A.peakRpm) ** 2))).toBe(14);
  });
});
