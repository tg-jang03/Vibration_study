import { describe, expect, it } from 'vitest';
import {
  dampingCompare,
  dataErrors,
  halfPower,
  heavyHighSpot,
  P41_VALUES,
  polarLoop,
  runUpRecord,
  separation,
} from './p5-2';

describe('P5-2 본문 그림 회귀 테스트', () => {
  it('P41_VALUES 수치 정합성', () => {
    // 3000 rpm 고유 회전수, ζ = 0.05, 편심거리 5 µm (10 µm pp)
    expect(P41_VALUES.crit.amp * 2e6).toBeCloseTo(100, 1);
    expect((P41_VALUES.crit.lag * 180) / Math.PI).toBeCloseTo(90, 5);

    // 운전 회전수 3600 rpm: 약 31.57 µm pp, 164.7°
    expect(P41_VALUES.op.amp * 2e6).toBeCloseTo(31.57, 1);
    expect((P41_VALUES.op.lag * 180) / Math.PI).toBeCloseTo(164.74, 1);

    // Half-power AF (25 rpm 간격): 피크 3000 rpm, AF 약 9.84
    expect(P41_VALUES.hp.peakRpm).toBe(3000);
    expect(P41_VALUES.hp.af).toBeCloseTo(9.839, 2);
    expect(P41_VALUES.hp.n1).toBeCloseTo(2866.5, 0);
    expect(P41_VALUES.hp.n2).toBeCloseTo(3171.5, 0);

    // 분리여유 SM: |3600 - 3000| / 3600 = 16.67 %
    expect(P41_VALUES.sm).toBeCloseTo(16.67, 1);

    // 감쇠비 0.2 비교: 피크 회전수 3128 rpm (이론값과 일치)
    expect(P41_VALUES.z2Peak).toBeCloseTo(3127.7, 0);
    expect(P41_VALUES.z2Af).toBeCloseTo(2.07, 1);
  });

  it('7개 그림 Spec id 및 패널 구성', () => {
    expect(runUpRecord.id).toBe('fig-p5-2-1');
    expect(runUpRecord.panels.length).toBe(2);

    expect(dampingCompare.id).toBe('fig-p5-2-2');
    expect(dampingCompare.panels.length).toBe(2);

    expect(heavyHighSpot.id).toBe('fig-p5-2-3');
    expect(heavyHighSpot.panels.length).toBe(1);

    expect(polarLoop.id).toBe('fig-p5-2-4');
    expect(polarLoop.panels.length).toBe(1);

    expect(halfPower.id).toBe('fig-p5-2-5');
    expect(halfPower.panels.length).toBe(1);

    expect(separation.id).toBe('fig-p5-2-6');
    expect(separation.panels.length).toBe(1);

    expect(dataErrors.id).toBe('fig-p5-2-7');
    expect(dataErrors.panels.length).toBe(3);
  });
});
