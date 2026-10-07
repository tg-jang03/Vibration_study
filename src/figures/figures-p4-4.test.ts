import { describe,it,expect } from 'vitest';
import * as F from './p4-4';
import type {FigureSpec} from '../lib/figure';
describe('P4-4 그림·본문 회귀',()=>{
  it('그림7개의 ID·캡션·유한 데이터·범위',()=>{
    const figs=Object.values(F).filter((v):v is FigureSpec=>'id' in v);expect(figs).toHaveLength(7);expect(new Set(figs.map(f=>f.id)).size).toBe(7);
    figs.forEach((f,i)=>{expect(f.caption).toMatch(new RegExp(`^그림 ${i+1}\\.`));f.panels.forEach(p=>p.series.forEach(s=>{Array.from(s.x).forEach(v=>{expect(Number.isFinite(v)).toBe(true);expect(v).toBeGreaterThanOrEqual(p.x.range[0]-1e-9);expect(v).toBeLessThanOrEqual(p.x.range[1]+1e-9);});Array.from(s.y).forEach(v=>{expect(Number.isFinite(v)).toBe(true);expect(v).toBeGreaterThanOrEqual(p.y.range[0]-1e-9);expect(v).toBeLessThanOrEqual(p.y.range[1]+1e-9);});}));});
  });
  it('안정·경계·발산 및 c2배',()=>{const v=F.P44_VALUES;expect(v.stable.forward.re).toBeCloseTo(-7.8466128,6);expect(v.stable.logDecrement).toBeCloseTo(.1570794944,9);expect(v.boundary.forward.re).toBe(0);expect(v.boundary.logDecrement).toBe(0);expect(v.unstable.forward.re).toBeCloseTo(7.8174565,6);expect(v.unstable.logDecrement).toBeCloseTo(-.1561067614,9);expect(v.doubled.status).toBe('stable');});
  it('q=0·0.15k의 모드 기준값',()=>{expect(F.P44_VALUES.zero.logDecrement).toBeCloseTo(.3145527023,9);expect(F.P44_VALUES.unstable.forward.im).toBeCloseTo(314.6470233,6);expect(F.P44_VALUES.boundary.criticalCrossStiffness).toBeCloseTo(98696.044011,5);});
  it('Whirl/Whip 및 가상 Campbell 수치',()=>{expect(F.P44_VALUES.whirl).toBe(36);expect(F.P44_VALUES.whip).toBe(50);expect(F.P44_VALUES.lockRpm).toBeCloseTo(6666.6666667,6);expect(F.P44_VALUES.campbellFw).toBeCloseTo(3354.10196625,6);});
});
