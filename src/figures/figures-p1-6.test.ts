/**
 * P1-6 본문 그림의 숫자가 이론값·본문 서술과 맞는지 확인한다 (D-026: 그림 데이터 = 본문 숫자).
 */
import { describe, expect, it } from 'vitest';
import * as F6 from './p1-6';
import { P16_VALUES as V } from './p1-6';

const specs = Object.values(F6 as Record<string, unknown>).filter((v): v is { id: string; panels: { series: { y: ArrayLike<number> }[] }[] } =>
  typeof v === 'object' && v !== null && 'panels' in v);

describe('P1-6 그림 데이터', () => {
  it('그림 7개, id가 겹치지 않고 모든 값이 유한하다', () => {
    expect(specs).toHaveLength(7);
    expect(new Set(specs.map((s) => s.id)).size).toBe(7);
    for (const s of specs) for (const p of s.panels) for (const series of p.series) {
      expect(Array.from(series.y).every(Number.isFinite)).toBe(true);
    }
  });

  it('라인 수 400 → 3200: 톤은 약 0 dB 그대로, 잡음 바닥은 −25.3 → −34.3 dB (9 dB)', () => {
    expect(Math.abs(V.toneDbLow)).toBeLessThan(0.3);
    expect(Math.abs(V.toneDbHigh)).toBeLessThan(0.3);
    expect(V.lowFloorDb).toBeCloseTo(-25.3, 0);
    expect(V.highFloorDb).toBeCloseTo(-34.3, 0);
    expect(V.lowFloorDb - V.highFloorDb).toBeGreaterThan(8.5);
    expect(V.lowFloorDb - V.highFloorDb).toBeLessThan(9.5);
    // 같은 10 Hz 폭의 합은 거의 같다 (그림 2)
    expect(V.highBandSum / V.lowBandSum).toBeGreaterThan(0.85);
    expect(V.highBandSum / V.lowBandSum).toBeLessThan(1.15);
  });

  it('PSD: 바닥은 약 −28 dB로 같고 톤은 −2.6 → +6.4 dB', () => {
    expect(V.psdFloorLowDb).toBeCloseTo(V.psdFloorTheoryDb, 0);
    expect(V.psdFloorHighDb).toBeCloseTo(V.psdFloorTheoryDb, 0);
    expect(V.tonePsdLowDb).toBeCloseTo(-2.6, 0);
    expect(V.tonePsdHighDb - V.tonePsdLowDb).toBeCloseTo(9.03, 1);
  });

  it('대역 RMS: ENBW로 나누면 파형 RMS와 맞고, 안 나누면 √1.5배', () => {
    expect(V.totalWith / V.timeRmsMm).toBeGreaterThan(0.98);
    expect(V.totalWith / V.timeRmsMm).toBeLessThan(1.02);
    expect(V.totalWithout / V.totalWith).toBeCloseTo(Math.sqrt(1.5), 6);
  });

  it('충격 가속도: 진짜 Peak 6.41, √2 × RMS 1.70 (27 %), CF 5.32', () => {
    expect(V.impPeak).toBeCloseTo(6.41, 1);
    expect(V.impDerived).toBeCloseTo(1.70, 1);
    expect(V.impDerived / V.impPeak).toBeCloseTo(0.27, 1);
    expect(V.impCf).toBeCloseTo(5.32, 1);
  });

  it('기계 신호 dB: 1X +6.5 dB, 147 Hz −38.4 dB, 294 Hz 약 −46 dB (RMS, 기준 1 mm/s)', () => {
    expect(V.machX1Db).toBeCloseTo(6.5, 0);
    expect(V.machSmallDb).toBeCloseTo(-38.4, 0);
    expect(V.machSmall2Db).toBeCloseTo(-46, 0);
    expect(V.machX1Db - V.machSmallDb).toBeCloseTo(45, 0);
  });
});
