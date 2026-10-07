import { expect, it } from 'vitest';
import * as figures from './p6-3';
import { type FigureSpec } from '../lib/figure';
it('P6-3 quoted analytical values',()=>{
 const v=figures.P63_VALUES;
 expect(v.circleXpp).toBeCloseTo(40,9);expect(v.ellipseYpp).toBeCloseTo(20,9);expect(v.bananaX1).toBeCloseTo(20,9);expect(v.bananaY1).toBeCloseTo(12,9);expect(v.eightY1).toBe(0);expect(v.flatXpp).toBeCloseTo(32,9);expect(v.flatX1).toBeCloseTo(17.15243,5);
 expect([v.halfDots,v.thirdDots,v.movingDots,v.twoXDots]).toEqual([2,3,8,1]);
});
it('seven unique finite figures with equal orbit axis scales',()=>{
 const specs=Object.values(figures).filter(v=>'id' in v) as FigureSpec[];
 expect(specs).toHaveLength(7);expect(new Set(specs.map(s=>s.id)).size).toBe(7);
 for(const spec of specs) for(const panel of spec.panels) {
  for(const s of panel.series) {expect(s.x.length).toBe(s.y.length);expect(Array.from(s.x).every(Number.isFinite)).toBe(true);expect(Array.from(s.y).every(Number.isFinite)).toBe(true);}
  if(panel.x.label?.startsWith('X')) expect((panel.y.range[1]-panel.y.range[0])/(panel.x.range[1]-panel.x.range[0])).toBeCloseTo(panel.height!*1.2/820,12);
 }
});