import { it, expect } from 'vitest';
import { CASCADE, amplitudeAt, cascadeRecords, recordSignals, spectrumAxis } from './cascade';
import { rms } from '../dsp/stats';
const d=cascadeRecords(), um=1e6;
it('기록: 11회전수 + 정속 유지2, 별도 2초·0.5Hz FFT',()=>{
  expect(d).toHaveLength(13); expect(CASCADE.n/CASCADE.fs).toBe(2);
  expect(d.map(s=>s.rotatingHz)).toEqual([20,30,40,50,60,70,80,90,100,110,120,120,120]);
  expect(d[12].time).toBe(120); expect(d[0].half.freq[1]).toBe(.5);
});
it('잠김 전후와 교차: 4800/7200rpm 36/40Hz, 차수 .45→1/3',()=>{
  expect(d[6].subHz).toBe(36); expect(d[10].subHz).toBe(40);
  expect(d[6].subHz/d[6].rotatingHz).toBe(.45); expect(d[10].subHz/d[10].rotatingHz).toBeCloseTo(1/3,12);
  expect(60*40/.45).toBeCloseTo(5333.333333,5);
});
it('추종만54Hz, 처음부터40Hz: 같은 마지막줄·다른 이력',()=>{
  const a=cascadeRecords({scenario:'follow'}), b=cascadeRecords({scenario:'fixed'});
  expect(a[10].subHz).toBe(54); expect(b.every(s=>s.subHz===40)).toBe(true);
  expect(b[10].subHz).toBe(d[10].subHz); expect(b[0].subHz).not.toBe(d[0].subHz);
});
it('모드50Hz로 바꾸면 교차6667rpm·마지막50Hz',()=>{
  expect(cascadeRecords({modeHz:50})[10].subHz).toBe(50); expect(60*50/.45).toBeCloseTo(6666.666667,5);
});
it('단일측 스펙트럼의 합성 성분 자리와 Peak 진폭',()=>{
  const r=d[10]; for(const [f,a] of [[120,20],[240,5],[40,12],[73,3],[320,2]]) expect(amplitudeAt(r.half,f)*um).toBeCloseTo(a,9);
  expect(amplitudeAt(r.half,150)).toBe(0);
  expect(rms(recordSignals(10).x)).toBeCloseTo(Math.sqrt((20**2+5**2+12**2+3**2+2**2)/2)/um,12);
});
it.each([0,.25,.5,.75,1])('역몫 %s: X Peak 고정, ±원 반지름 합 일치',q=>{
  const r=cascadeRecords({reverseFraction:q})[10];
  expect(amplitudeAt(r.half,120)*um).toBeCloseTo(20,9);
  expect(amplitudeAt(r.full,120)*um).toBeCloseTo(20*(1-q),9);
  expect(amplitudeAt(r.full,-120)*um).toBeCloseTo(20*q,9);
  expect(amplitudeAt(r.full,40)*um).toBeCloseTo(12,9); expect(amplitudeAt(r.full,-40)).toBe(0);
});
it('유지 구간 시간·진폭 변화: 같은회전수에서20→25→30',()=>{
  expect(d.slice(10).map(r=>amplitudeAt(r.half,120)*um)).toEqual(expect.arrayContaining([expect.closeTo(20,9),expect.closeTo(25,9),expect.closeTo(30,9)]));
  expect(d.slice(10).map(r=>r.time)).toEqual([100,110,120]);
});
it('Hz→차수는 매 기록의 실제회전수, signed 방향 보존',()=>{
  expect(spectrumAxis(d[10].full,120,true)[d[10].full.freq.indexOf(-120)]).toBe(-1);
  expect(spectrumAxis(d[6].half,80,true)[d[6].half.freq.indexOf(36)]).toBe(.45);
});
it('시드 고정 잡음은 반복 재현되며 신호를 바꾼다',()=>{
  const a=recordSignals(10,{noise:true}), b=recordSignals(10,{noise:true});
  expect(a.x).toEqual(b.x); expect(a.y).toEqual(b.y); expect(a.x).not.toEqual(recordSignals(10).x);
  const clean=recordSignals(10).x, noise=Array.from(a.x,(v,i)=>v-clean[i]); expect(rms(noise)*um).toBeCloseTo(.5,1);
});
it('같은 주파수 성분은 FFT에서 합쳐지므로 이름표별 크기가 아니다',()=>{
  const r=cascadeRecords({scenario:'fixed'})[2]; expect(r.rotatingHz).toBe(40);
  expect(amplitudeAt(r.half,40)*um).toBeCloseTo(32,9);
  expect(amplitudeAt(r.full,40)*um).toBeCloseTo(27,9);
});
it('Hann 인접 bin은 반진폭이며 새로운 줄의 이름표가 아니다',()=>{
  expect(amplitudeAt(d[10].half,120.5)*um).toBeCloseTo(10,9);
});
it('유효하지 않은 입력 거절',()=>{
  for(const i of [-1,13,NaN,.5]) expect(()=>recordSignals(i)).toThrow();
  expect(()=>cascadeRecords({ratio:1})).toThrow(); expect(()=>cascadeRecords({modeHz:0})).toThrow();
  expect(()=>cascadeRecords({reverseFraction:-.1})).toThrow(); expect(()=>cascadeRecords({scenario:'bad' as never})).toThrow();
  expect(()=>spectrumAxis(d[10].full,0,true)).toThrow(); expect(()=>amplitudeAt(d[10].full,320)).toThrow();
});