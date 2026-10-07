import { it,expect } from 'vitest';
import * as F from './p6-2';
import type { FigureSpec } from '../lib/figure';
it('P6-2 인용 수치: 추종·잠김·차수·정/역·유지구간',()=>{
  const v=F.P62_VALUES; expect(v.sub4800).toBe(36); expect(v.sub7200).toBe(40); expect(v.follow7200).toBe(54);
  expect(v.order7200).toBeCloseTo(1/3,12); expect(v.lockRpm).toBeCloseTo(5333.333333,5); expect(v.lock50Rpm).toBeCloseTo(6666.666667,5);
  expect(v.oneX).toBeCloseTo(20,9); expect(v.forward).toBeCloseTo(15,9); expect(v.backward).toBeCloseTo(5,9);
  expect(v.hold[2]).toBeCloseTo(30,9);
});
it('7 그림·고유 ID·유한 자료·계열 길이',()=>{
  const figs=Object.values(F).filter((v):v is FigureSpec=>'panels' in v);
  expect(figs).toHaveLength(7); expect(new Set(figs.map(f=>f.id)).size).toBe(7);
  for(const f of figs) {expect(f.caption).toMatch(/^그림 \d+\./); for(const p of f.panels) for(const s of p.series) {expect(s.x.length).toBe(s.y.length); expect(Array.from(s.x).every(Number.isFinite)).toBe(true);expect(Array.from(s.y).every(Number.isFinite)).toBe(true);}}
});