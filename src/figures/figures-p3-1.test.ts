/**
 * P3-1 본문 그림의 숫자가 본문 서술과 맞는지 확인한다 (D-026: 그림 데이터 = 본문 숫자).
 */
import { describe, expect, it } from 'vitest';
import * as F from './p3-1';
import { P21_VALUES as V } from './p3-1';

const specs = Object.values(F as Record<string, unknown>).filter((v): v is { id: string; panels: { series: { y: ArrayLike<number> }[] }[] } =>
  typeof v === 'object' && v !== null && 'panels' in v);

describe('P3-1 그림 데이터', () => {
  it('그림 7개, id가 겹치지 않고 모든 값이 유한하다', () => {
    expect(specs).toHaveLength(7);
    expect(new Set(specs.map((s) => s.id)).size).toBe(7);
    for (const s of specs) for (const p of s.panels) for (const series of p.series) {
      expect(Array.from(series.y).every(Number.isFinite)).toBe(true);
    }
  });

  it('가속도계 25 kHz: ±10 % 위 끝 약 7.5 kHz (감쇠 무시 7.54 kHz)', () => {
    expect(V.accHi0).toBeCloseTo(7537.8, 0);
    expect(V.accHi).toBeGreaterThan(7400);
    expect(V.accHi).toBeLessThan(7600);
  });

  it('속도계 10 Hz: 아래 끝 ζ 0.1 약 33 Hz, ζ 0.6 약 11 Hz, 5 Hz는 26 %·약 141°', () => {
    expect(V.velLo01).toBeCloseTo(33, -0.5);
    expect(V.velLo06).toBeCloseTo(11, -0.5);
    expect(V.vel5ratio).toBeCloseTo(0.26, 2);
    expect(Math.abs(V.vel5phaseDeg)).toBeCloseTo(141, 0);
  });

  it('마운팅 위 끝 7.5 → 5.4 → 2.1 → 0.6 kHz, 자석 5 kHz 2.0배·6 kHz 3.6배', () => {
    expect(V.mountBands.map((b) => Math.round(b / 100) / 10)).toEqual([7.5, 5.4, 2.1, 0.6]);
    expect(V.mag5k).toBeCloseTo(2.0, 1);
    expect(V.mag6k).toBeCloseTo(3.6, 1);
    expect(V.stud8k).toBeLessThan(1.12);
    expect(V.mag8k).toBeGreaterThan(3); // 8 kHz도 설치 공진(7 kHz) 근처라 부푼다
  });
});
