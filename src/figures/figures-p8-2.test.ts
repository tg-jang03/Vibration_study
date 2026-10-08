import { expect, it } from 'vitest';
import * as F from './p8-2';
it('본문/그림 숫자 회귀',()=>{
  const v=F.P82_VALUES;
  expect(v.bowInitial).toBeCloseTo(23.32380758,7);expect(v.bowEndContribution).toBeCloseTo(.5974448204,9);
  expect(v.bowEnd).toBeCloseTo(20.00892152,7);expect(v.bowChange).toBeCloseTo(11.40255518,7);
  expect(v.slowEnd).toBeCloseTo(9.194889641,8);expect(v.slowerContribution).toBeCloseTo(4.414553294,8);
  expect(v.mortonEnd).toBeCloseTo(22.36067977,7);expect(v.mortonChange).toBeCloseTo(5,10);
});
it('그림 패널의 곡선은 유한하고 표시 범위 안',()=>{
  const figures=Object.values(F).filter((v):v is import('../lib/figure').FigureSpec=>'panels' in v);
  expect(figures).toHaveLength(8);
  for(const f of figures) for(const p of f.panels) for(const s of p.series) for(const y of Array.from(s.y)){
    expect(Number.isFinite(y)).toBe(true);expect(y).toBeGreaterThanOrEqual(p.y.range[0]-1e-9);expect(y).toBeLessThanOrEqual(p.y.range[1]+1e-9);
  }
});
