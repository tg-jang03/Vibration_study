import { describe, expect, it } from 'vitest';
import { P111_VALUES as V, flow, map, envelopeFig, resolutionFig, aliasFig, runoutFig, resonanceFig, mortonFig } from './p11-1';

/** P11-1 본문·캡션이 인용하는 숫자 (예시 기계, lib/cases/examples.ts) */
describe('P11-1 그림 숫자', () => {
  it('그림 id가 겹치지 않는다', () => {
    const ids = [flow, map, envelopeFig, resolutionFig, aliasFig, runoutFig, resonanceFig, mortonFig].map((f) => f.id);
    expect(new Set(ids).size).toBe(8);
  });
  it('§2 주파수 지도: 1775 rpm, 볼 8개, 베인 5개', () => {
    expect(V.brg.fr).toBeCloseTo(29.58, 2);
    expect(V.brg.bpfo).toBeCloseTo(94.27, 2);
    expect(V.brg.bpfi).toBeCloseTo(142.4, 1);
    expect(V.brg.bsf2).toBeCloseTo(139.4, 1);
    expect(V.brg.vane).toBeCloseTo(147.9, 1);
  });
  it('§3.1 속도 1 kHz는 1 mm/s 아래, BPFO 0.037 mm/s, 엔벨로프 0.17 g, 첨도 약 15', () => {
    expect(V.brg.velOverall).toBeLessThan(1);
    expect(V.brg.velBpfo).toBeCloseTo(0.037, 3);
    expect(V.brg.envBpfo).toBeCloseTo(0.17, 2);
    expect(Math.round(V.brg.kurt)).toBe(15);
  });
  it('§3.2 2X 119.0 Hz 0.8 · 2×LF 1.6 mm/s, 400 라인은 한 줄 1.07', () => {
    expect(V.res2.f2x).toBeCloseTo(119.0, 6);
    expect(V.res2.a2x).toBeCloseTo(0.8, 2);
    expect(V.res2.a2lf).toBeCloseTo(1.6, 2);
    expect(V.res2.coarse).toBeCloseTo(1.07, 2);
  });
  it('§3.3 2836.7 Hz → 276.7 Hz, 8.6 mm/s(11배), AAF 켜면 사라짐', () => {
    expect(V.alias.gmf).toBeCloseTo(2836.7, 1);
    expect(V.alias.fake).toBeCloseTo(276.7, 1);
    expect(V.alias.fake / V.alias.fr).toBeCloseTo(11.2, 1);
    expect(V.alias.fakeAmp).toBeCloseTo(8.6, 1);
    expect(V.alias.fakeAmp / V.alias.gmfAmp).toBeCloseTo(11, 0);
    expect(V.alias.onAmp).toBeLessThan(0.01);
  });
  it('§3.4 slow roll 440 rpm 21.9 µm, 운전점 32.1 → 12.2 µm, 하우징 0.7 mm/s', () => {
    expect(V.runout.slowRpm).toBe(440);
    expect(V.runout.slow).toBeCloseTo(21.9, 1);
    expect(V.runout.rawOp).toBeCloseTo(32.1, 1);
    expect(V.runout.compOp).toBeCloseTo(12.2, 1);
    expect(V.runout.housing).toBeCloseTo(0.7, 3);
  });
  it('§4 공진: H 9.2 · V 1.3, 306°, 1420 rpm 15 mm/s, 28° → 176°, FRF 23.7 · 64.2 Hz, 1X보다 4 % 아래', () => {
    expect(V.res.h).toBeCloseTo(9.2, 1);
    expect(V.res.v).toBeCloseTo(1.3, 1);
    expect(V.res.vMinusH).toBeCloseTo(306, 0);
    expect(V.res.peakRpm).toBeCloseTo(1420, -1);
    expect(V.res.peak).toBeCloseTo(15, 1);
    expect(Math.round(V.res.lagLow)).toBe(28);
    expect(Math.round(V.res.lagOp)).toBe(176);
    expect(V.res.fH).toBeCloseTo(23.7, 1);
    expect(V.res.fV).toBeCloseTo(64.2, 1);
    expect(Math.round((100 * (V.res.fr - V.res.fH)) / V.res.fr)).toBe(4);
  });
  it('§4 Morton형: 13 ~ 36 µm', () => {
    expect(Math.round(V.morton.min)).toBe(13);
    expect(Math.round(V.morton.max)).toBe(36);
  });
});
