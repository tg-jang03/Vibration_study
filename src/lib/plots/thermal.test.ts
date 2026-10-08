import { expect, it } from 'vitest';
import { thermalContribution, thermalResponse, slowRollExample, THERMAL_BASELINE } from './thermal';
import { acceptance, phaseTrace, snapshot, trendSeries } from './trend';
import { phasor, subtractVectors, toDeg, toRad, orderVector, toAmpLag } from '../phase';
import { rms } from '../dsp/stats';
const region={amplitudeFraction:.2,phaseHalfWidth:toRad(30)};
it('열 기여 지수 감소: 1시간 뒤 e^-3',()=>{
  expect(thermalContribution(3600).amp).toBeCloseTo(12e-6*Math.exp(-3),14);
  expect(thermalContribution(1200).amp/12e-6).toBeCloseTo(Math.exp(-1),14);
  expect(thermalContribution(3600,{decayTime:3600}).amp).toBeCloseTo(12e-6/Math.E,14);
});
it('직교 기본 응답의 해석해: 합은 hypot, 위상은 atan',()=>{
  const {oneX}=thermalResponse(0);
  expect(oneX.amp).toBeCloseTo(Math.hypot(20,12)*1e-6,14);
  expect(toDeg(oneX.lag)).toBeCloseTo((350+Math.atan2(12,20)*180/Math.PI)%360,10);
  expect(subtractVectors(thermalResponse(3600).oneX,oneX).amp).toBeCloseTo(12e-6*(1-Math.exp(-3)),14);
});
it('복소 합과 기여 사이의 좌표 항등식',()=>{
  for(const scenario of ['thermal','morton'] as const) for(const time of [0,450,900,1350,1800,3600]) {
    const r=thermalResponse(time,{scenario}),a=phasor(r.oneX),b=phasor(r.contribution),u=phasor(THERMAL_BASELINE);
    expect(a.re).toBeCloseTo(u.re+b.re,14);expect(a.im).toBeCloseTo(u.im+b.im,14);
  }
});
it('열 기여 0이면 고정 응답, 완전 상쇄는0',()=>{
  expect(thermalResponse(0,{amplitude:0}).oneX.amp).toBeCloseTo(20e-6,14);
  expect(thermalResponse(0,{amplitude:20e-6,lag:toRad(170)}).oneX).toEqual({amp:0,lag:0});
});
it('열 방향에 따라 합 진폭은 감소할 수도 있음',()=>{
  const a=thermalResponse(0,{lag:toRad(170)}).oneX.amp,b=thermalResponse(3600,{lag:toRad(170)}).oneX.amp;
  expect(a).toBeCloseTo(8e-6,14);expect(b).toBeGreaterThan(a);
});
it('Morton 지정 곡선은60분에 기여2배·합hypot·변화5µm',()=>{
  const a=thermalResponse(0,{scenario:'morton'}),b=thermalResponse(3600,{scenario:'morton'});
  expect(b.contribution.amp).toBeCloseTo(10e-6,14);
  expect(b.oneX.amp).toBeCloseTo(Math.hypot(20,10)*1e-6,14);
  expect(toDeg(b.oneX.lag)).toBeCloseTo(16.565051177,8);
  expect(subtractVectors(b.oneX,a.oneX).amp).toBeCloseTo(5e-6,14);
});
it('Morton g0이면 닫힌 원, 중간 변화는10µm',()=>{
  const start=thermalResponse(0,{scenario:'morton',growth:0}).oneX;
  for(const time of [1800,3600])expect(subtractVectors(thermalResponse(time,{scenario:'morton',growth:0}).oneX,start).amp).toBeLessThan(1e-18);
  expect(subtractVectors(thermalResponse(900,{scenario:'morton',growth:0}).oneX,start).amp).toBeCloseTo(10e-6,14);
});
it('합 위상은 기여 주기와 달라 두 번 회전하지 않는다',()=>{
  const s=trendSeries({scenario:'morton'}),p=phaseTrace(s,true).lag;
  expect(Math.max(...p)-Math.min(...p)).toBeLessThan(Math.PI);
  expect(s[60].time).toBe(3600);expect(s).toHaveLength(61);
});
it('표시 최소 진폭에서는 연속/접힌 위상과 영역 보류',()=>{
  const s=trendSeries({scenario:'thermal',thermal:{amplitude:20e-6,lag:toRad(170)}});
  expect(s[0].oneX.amp).toBe(0);
  expect(phaseTrace(s,true).lag[0]).toBeNaN();expect(phaseTrace(s,false).lag[0]).toBeNaN();
  expect(acceptance(s[0].oneX,s[60].oneX,region).inside).toBeNull();
});
it('새 시나리오 RMS와1X DFT가 해석 모델에 일치',()=>{
  for(const scenario of ['thermal','morton'] as const) for(const i of [0,15,30,60]){
    const s=trendSeries({scenario})[i],wave=snapshot(s),v=toAmpLag(orderVector(wave,256));
    expect(rms(wave)).toBeCloseTo(s.overall,14);
    expect(v.amp).toBeCloseTo(s.oneX.amp,14);
    expect(phasor(v).re).toBeCloseTo(phasor(s.oneX).re,14);
    expect(phasor(v).im).toBeCloseTo(phasor(s.oneX).im,14);
  }
});
it('slow roll은 별도 기하 예제: runout 바닥 남음',()=>{
  expect(slowRollExample(0).amp*2e6).toBeCloseTo(32,12);
  expect(slowRollExample(3600).amp*2e6).toBeCloseTo(8+24*Math.exp(-3),12);
  expect(slowRollExample(1e6).amp*2e6).toBeCloseTo(8,12);
});
it('입력 범위 검사',()=>{
  for(const options of [{amplitude:-1},{lag:NaN},{decayTime:0},{period:0},{growth:-1},{scenario:'wrong' as 'thermal'}])expect(()=>thermalResponse(0,options)).toThrow(RangeError);
  for(const t of [-1,NaN,Infinity])expect(()=>thermalContribution(t)).toThrow(RangeError);
  expect(()=>thermalResponse(0,{}, {amp:-1,lag:0})).toThrow(RangeError);
  expect(()=>slowRollExample(0,{amp:0,lag:NaN})).toThrow(RangeError);
});
