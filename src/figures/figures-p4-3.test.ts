import { describe, it, expect } from 'vitest';
import * as F from './p4-3';
import type { FigureSpec } from '../lib/figure';
import { P43_BEARING as B, P43_EXAMPLE as E, shortBearingPressure } from '../lib/rotor/journalBearing';
describe('P4-3 본문 보충 숫자', () => {
  it('좀머펠트 수 S = 0.625, 하중 식의 왼쪽 = 1/(4πS(L/D)²), 압력 최대 θ ≈ 155°, 지름 간극으로 나눈 ε = 0.3379', () => {
    const N = E.omega / (2 * Math.PI), D = 2 * B.radius, P = E.load / (B.length * D);
    const S = (E.viscosity * N / P) * (B.radius / B.radialClearance) ** 2;
    expect(S).toBeCloseTo(0.625, 6);
    const left = E.load * B.radialClearance ** 2 / (E.viscosity * E.omega * B.radius * B.length ** 3);
    expect(left).toBeCloseTo(1 / (4 * Math.PI * S * (B.length / D) ** 2), 9);
    const eps = F.P43_VALUES.normal.eccentricityRatio;
    let best = 0, tBest = 0;
    for (let d = 0; d <= 360; d += 0.1) { const p = shortBearingPressure(B, eps, E.omega, E.viscosity, d * Math.PI / 180, 0); if (p > best) { best = p; tBest = d; } }
    expect(Math.round(tBest)).toBe(155);
    expect((eps * B.radialClearance / 200e-6).toFixed(4)).toBe('0.3379');
  });
});
describe('P4-3 본문·그림 수치', () => {
  it('그림 7개와 유한 좌표, 데이터가 축 범위에 들어간다', () => {
    const figures = Object.values(F).filter((v): v is FigureSpec => 'id' in v);
    expect(figures).toHaveLength(7); expect(new Set(figures.map(f => f.id)).size).toBe(7);
    figures.forEach((f, i) => {
      expect(f.caption).toMatch(new RegExp(`^그림 ${i + 1}\\.`));
      f.panels.forEach(p => p.series.forEach(s => {
        Array.from(s.x).forEach(v => { expect(Number.isFinite(v)).toBe(true); expect(v).toBeGreaterThanOrEqual(p.x.range[0] - 1e-9); expect(v).toBeLessThanOrEqual(p.x.range[1] + 1e-9); });
        Array.from(s.y).forEach(v => { expect(Number.isFinite(v)).toBe(true); expect(v).toBeGreaterThanOrEqual(p.y.range[0] - 1e-9); expect(v).toBeLessThanOrEqual(p.y.range[1] + 1e-9); });
      }));
    });
  });
  it('기본과 경하중의 위치·최소 유막', () => {
    expect(F.P43_VALUES.normal.eccentricityRatio).toBeCloseTo(.675787925424, 11);
    expect(F.P43_VALUES.normal.minimumFilm * 1e6).toBeCloseTo(32.42120746, 7);
    expect(F.P43_VALUES.light.x * 1e6).toBeCloseTo(42.4358714, 6);
    expect(F.P43_VALUES.light.y * 1e6).toBeCloseTo(-36.4895033, 6);
    expect(F.P43_VALUES.light).toEqual(F.P43_VALUES.fast);
  });
  it('기본 DC 전압과 냉간 좌표 누락·드리프트 예제', () => {
    expect(F.P43_VALUES.measured.voltageA).toBeCloseTo(-8.933004055, 8);
    expect(F.P43_VALUES.measured.voltageB).toBeCloseTo(-9.422579412, 8);
    expect(F.P43_VALUES.measured.error).toBe(0);
    expect(F.P43_VALUES.noCold.error! * 1e6).toBeCloseTo(100, 9);
    expect(F.P43_VALUES.drift.error! * 1e6).toBeCloseTo(63.5, 9);
  });
  it('0.30mm의 비선형 전압은 좌표를 출력하지 않는다', () => {
    expect(F.P43_VALUES.invalid.valid).toBe(false);
    expect(F.P43_VALUES.invalid.reconstructed).toBeNull();
  });
});
