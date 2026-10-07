import { it, expect } from 'vitest';
import * as F from './p6-4';
import type { FigureSpec } from '../lib/figure';
it('P6-4 본문 숫자: 위상 이동·기준 변경·잔여 증가·경계 시각', () => {
  const v = F.P64_VALUES;
  expect(v.overall).toBeCloseTo(14.2126704, 5); expect(v.delta).toBeCloseTo(34.6410162, 5);
  expect(v.midDelta).toBeCloseTo(20, 6); expect(v.firstOutside).toBe(16);
  expect(v.residualEnd).toBeCloseTo(15.2315462, 5); expect(v.residualGrowth).toBeCloseTo(7.168785, 5);
});
it('그림6종·유한 자료·축 범위·겹치지 않는ID', () => {
  const figs = Object.values(F).filter((v): v is FigureSpec => 'panels' in v);
  expect(figs).toHaveLength(6); expect(new Set(figs.map(f => f.id)).size).toBe(6);
  for (const f of figs) {
    expect(f.caption).toMatch(/^그림 \d+\./);
    for (const p of f.panels) for (const s of p.series) {
      expect(s.x.length).toBe(s.y.length); expect(Array.from(s.y).every(Number.isFinite)).toBe(true);
      expect(Math.min(...Array.from(s.y))).toBeGreaterThanOrEqual(p.y.range[0]);
      expect(Math.max(...Array.from(s.y))).toBeLessThanOrEqual(p.y.range[1]);
    }
  }
});
