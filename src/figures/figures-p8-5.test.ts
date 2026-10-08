import {describe,it,expect} from 'vitest';
import * as F from './p8-5';
import type {FigureSpec} from '../lib/figure';
describe('P8-5 그림의 기준값',()=>{
  it('본문 수치는 독립 해석값과 일치한다',()=>{
    expect(F.P85_VALUES.twoPole.twiceLineHz).toBe(100);
    expect(F.P85_VALUES.fourPole.twiceLineOrder).toBe(4);
    expect(F.P85_VALUES.initialAmp).toBeCloseTo(Math.hypot(20,3.75),10);
    expect(F.P85_VALUES.tauAmp).toBeCloseTo(Math.hypot(20,15*(1-.75/Math.E)),10);
    expect(F.P85_VALUES.tauLag).toBeCloseTo(Math.atan2(15*(1-.75/Math.E),20)*180/Math.PI,10);
    expect(F.P85_VALUES.torsionHz).toBeCloseTo(Math.sqrt(15000)/(2*Math.PI),10);
  });
  it('여덟 그림의 데이터가 유한하고 축 범위 안에 있다',()=>{
    const figs=Object.values(F).filter((v):v is FigureSpec=>typeof v==='object'&&'panels' in v);
    expect(figs).toHaveLength(8);expect(new Set(figs.map(v=>v.id)).size).toBe(8);
    for(const f of figs)for(const p of f.panels)for(const s of p.series){
      expect(s.x.length).toBe(s.y.length);
      for(const [axis,values] of [[p.x,s.x],[p.y,s.y]] as const)for(const n of Array.from(values)){
        expect(Number.isFinite(n)).toBe(true);expect(n).toBeGreaterThanOrEqual(axis.range[0]-1e-6);expect(n).toBeLessThanOrEqual(axis.range[1]+1e-6);
      }
    }
  });
});
