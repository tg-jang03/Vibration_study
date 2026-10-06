/**
 * P2-8 본문 그림의 숫자가 이론값·본문 서술과 맞는지 확인한다 (D-026: 그림 데이터 = 본문 숫자).
 */
import { describe, expect, it } from 'vitest';
import * as F7 from './p2-8';
import { P17_VALUES as V } from './p2-8';

const specs = Object.values(F7 as Record<string, unknown>).filter((v): v is { id: string; panels: { series: { y: ArrayLike<number> }[] }[] } =>
  typeof v === 'object' && v !== null && 'panels' in v);

describe('P2-8 그림 데이터', () => {
  it('그림 8개, id가 겹치지 않고 모든 값이 유한하다', () => {
    expect(specs).toHaveLength(8);
    expect(new Set(specs.map((s) => s.id)).size).toBe(8);
    for (const s of specs) for (const p of s.panels) for (const series of p.series) {
      expect(Array.from(series.y).every(Number.isFinite)).toBe(true);
    }
  });

  it('AM m = 0.5: 반송파 1, 측대역 0.25 = −12.0 dB, 기어 예 측대역 m/2 = 0.15', () => {
    expect(V.amCarrier).toBeCloseTo(1, 6);
    expect(V.amSide).toBeCloseTo(0.25, 6);
    expect(V.amSideDb).toBeCloseTo(-12.04, 2);
    expect(V.gearALow).toBeCloseTo(0.15, 6);
    expect(V.gearBLow).toBeCloseTo(0.15, 6);
    expect(V.pulsePairs).toBeGreaterThanOrEqual(3);
  });

  it('FM β = 1: 0.765 / 0.440 / 0.115, β = 2.4에서 반송파 거의 0', () => {
    expect(V.fmBeta1[0]).toBeCloseTo(0.765, 3);
    expect(V.fmBeta1[1]).toBeCloseTo(0.440, 3);
    expect(V.fmBeta1[2]).toBeCloseTo(0.115, 3);
    expect(V.fmCarrier24).toBeLessThan(0.005);
  });

  it('AM + FM (m 0.4, β 0.6, 위상차 0): 위 0.48, 아래 0.10', () => {
    expect(V.upperBoth).toBeCloseTo(0.48, 2);
    expect(V.lowerBoth).toBeCloseTo(0.10, 2);
  });

  it('맥놀이: 막대 1과 0.6, 주기 2 s', () => {
    expect(V.beatA1).toBeCloseTo(1, 6);
    expect(V.beatA2).toBeCloseTo(0.6, 6);
    expect(V.beatPeriod).toBe(2);
  });
});
