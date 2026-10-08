import {it,expect} from 'vitest';
import * as F from './p7-9';
import type {FigureSpec} from '../lib/figure';
it('P7-9 수치가 독립 해석값과 일치',()=>{
  const v=F.P79_VALUES;
  expect(v.pulseInterval60*1e6).toBeCloseTo(333.333333333,7);
  expect(v.pulseInterval1).toBe(.02);expect(v.speedPeak).toBeCloseTo(.4*Math.PI,12);
  expect(v.cross1).toBeCloseTo(24000/Math.sqrt(104),10);
  expect(v.cross2).toBeCloseTo(42000/Math.sqrt(124),10);
  expect(v.cross8).toBeCloseTo(42000/Math.sqrt(44),10);
  expect(v.tipMm).toBeCloseTo(-Math.PI/2,12);
  expect(v.responseLow).toBeCloseTo(25,10);expect(v.responseHigh).toBeCloseTo(6.25,10);
});
it('여덟 그림 데이터가 유한하고 축 범위 안',()=>{
  const figs=Object.values(F).filter((v):v is FigureSpec=>typeof v==='object'&&'panels' in v);
  expect(figs).toHaveLength(8);expect(new Set(figs.map(f=>f.id)).size).toBe(8);
  for(const f of figs)for(const p of f.panels)for(const s of p.series){
    expect(s.x.length).toBe(s.y.length);
    for(const [axis,values] of [[p.x,s.x],[p.y,s.y]] as const)for(const n of Array.from(values)){
      expect(Number.isFinite(n)).toBe(true);expect(n).toBeGreaterThanOrEqual(axis.range[0]-1e-6);expect(n).toBeLessThanOrEqual(axis.range[1]+1e-6);
    }
  }
});

