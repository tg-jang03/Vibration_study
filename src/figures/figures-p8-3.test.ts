import {expect,it} from 'vitest';
import * as F from './p8-3';
it('P8-3 본문·캡션 숫자 고정',()=>{
  const v=F.P83_VALUES;
  expect(v.threshold).toBeCloseTo(60,12);expect(v.lowDelta).toBeCloseTo(.04700480202,10);
  expect(v.highDelta).toBeCloseTo(-.09367975528,10);expect(v.highSigma).toBeCloseTo(2.813220873,8);
  expect(v.highFrequency).toBeCloseTo(30.03019025,7);expect(v.lowEnd).toBeCloseTo(3.43342304,7);expect(v.highEnd).toBeCloseTo(10.58703506,7);
  expect(v.baseEpsilon).toBeCloseTo(.6757879254,9);expect(v.upEpsilon).toBeCloseTo(.5165520952,9);expect(v.downEpsilon).toBeCloseTo(.7389636618,9);
  expect(v.baseFilm).toBeCloseTo(32.42120746,7);expect(v.upFilm).toBeCloseTo(48.34479048,7);
  expect(v.thermalDifference).toBeCloseTo(9.6,12);expect(v.measuredDE).toBeCloseTo(9.8,12);
});
it('그림8개·곡선과 정적 위치가 표시 범위 안',()=>{
  const figures=Object.values(F).filter((v):v is import('../lib/figure').FigureSpec=>'panels' in v);
  expect(figures).toHaveLength(8);
  for(const f of figures)for(const p of f.panels){
    for(const s of p.series)for(const y of Array.from(s.y)){
      expect(Number.isFinite(y)).toBe(true);expect(y).toBeGreaterThanOrEqual(p.y.range[0]-1e-9);expect(y).toBeLessThanOrEqual(p.y.range[1]+1e-9);
    }
    for(const a of p.annotations??[])if(a.type==='point'){
      expect(a.x).toBeGreaterThanOrEqual(p.x.range[0]);expect(a.x).toBeLessThanOrEqual(p.x.range[1]);
      expect(a.y).toBeGreaterThanOrEqual(p.y.range[0]);expect(a.y).toBeLessThanOrEqual(p.y.range[1]);
    }
  }
});
