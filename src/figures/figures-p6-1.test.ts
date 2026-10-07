import { it, expect } from 'vitest';
import * as F from './p6-1';
import type { FigureSpec } from '../lib/figure';
it('P6-1 그림 7종 캡션·축·유한 값', () => {
  const figures = Object.values(F).filter((v): v is FigureSpec => 'panels' in v);
  expect(figures).toHaveLength(7); expect(new Set(figures.map(f => f.id)).size).toBe(7);
  for (const f of figures) {
    expect(f.caption).toMatch(/^그림 \d+\./);
    for (const p of f.panels) for (const s of p.series) {
      expect(s.x.length).toBe(s.y.length); expect(Array.from(s.y).every(Number.isFinite)).toBe(true);
      expect(Math.max(...Array.from(s.y))).toBeLessThanOrEqual(p.y.range[1]);
      expect(Math.min(...Array.from(s.y))).toBeGreaterThanOrEqual(p.y.range[0]);
    }
  }
});
it('본문의 해석해·절단 한계·사건 간격·위상 비교 숫자 고정', () => {
  const v = F.P61_VALUES;
  expect(v.sine.rms * 1e6).toBeCloseTo(14.1421356, 5); expect(v.sine.peakToPeak * 1e6).toBeCloseTo(40, 6);
  expect(v.beat.rms * 1e6).toBeCloseTo(10, 6); expect(v.am.rms * 1e6).toBeCloseTo(15, 6);
  expect(v.am.crestFactor).toBeCloseTo(2, 6); expect(v.eventIntervalMs).toBeCloseTo(6.6666667, 5); expect(v.events).toBe(9);
  expect(v.truncated.peakToPeak * 1e6).toBeCloseTo(25, 6); expect(v.clipped.peakToPeak * 1e6).toBeCloseTo(26, 6);
  expect(v.asymmetric.max * 1e6).toBeCloseTo(27, 6); expect(v.asymmetric.rms * 1e6).toBeCloseTo(14.983324, 5);
  expect(v.quadrature.rms).toBeCloseTo(v.asymmetric.rms, 12);
});