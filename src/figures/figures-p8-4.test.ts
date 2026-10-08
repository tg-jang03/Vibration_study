import {it,expect} from 'vitest';
import * as F from './p8-4';
it('P8-4 본문 수치를 독립 해석값으로 고정',()=>{
  const v=F.P84_VALUES;expect(v.stall).toBe(20);expect(v.surge).toBe(5);expect(v.spinningPhase).toBe(-90);
  expect(v.standingB).toBe(0);expect(v.longNode).toBe(0);expect(v.pipe).toBe(300);expect(v.rms).toBeCloseTo(Math.SQRT2,12);
  expect(v.vectorChange).toBeCloseTo(Math.sqrt(800),12);expect(v.gearHz).toBeCloseTo(1490/60*23,10);expect(v.gearOut).toBeCloseTo(1490/60*23/61,10);expect(v.bladeCrossing).toBe(3000);
});
it('그림7개 유한 계열·범위·ID',()=>{
  const figures=Object.values(F).filter((v):v is import('../lib/figure').FigureSpec=>'panels' in v);expect(figures).toHaveLength(7);
  expect(new Set(figures.map(f=>f.id)).size).toBe(7);
  for(const f of figures)for(const p of f.panels)for(const s of p.series){expect(s.x.length).toBe(s.y.length);for(const [values,range] of [[s.x,p.x.range],[s.y,p.y.range]] as const)for(const v of Array.from(values)){expect(Number.isFinite(v)).toBe(true);expect(v).toBeGreaterThanOrEqual(range[0]-1e-9);expect(v).toBeLessThanOrEqual(range[1]+1e-9)}}
});
