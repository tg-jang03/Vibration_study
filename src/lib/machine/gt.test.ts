import {describe,it,expect} from 'vitest';
import {pressureModel,closedPipeFundamental,vectorChange} from './gt';
describe('GT 동압 해석 기준',()=>{
  it('균일 닫힌 관 파장2L·SI 단위',()=>{expect(closedPipeFundamental(600,1)).toBe(300);expect(closedPipeFundamental(600,2)).toBe(150);expect(()=>closedPipeFundamental(0,1)).toThrow();});
  it('셀 수×셀 회전비×축Hz; 지정 서지/음향과 구별',()=>{
    expect(pressureModel({kind:'stall'}).frequency).toBe(20);
    expect(pressureModel({kind:'stall',rpm:6000,order:2}).frequency).toBe(80);
    for(const kind of ['surge','spinning','standing','longitudinal'] as const)expect(pressureModel({kind,rpm:6000}).frequency).toBe(pressureModel({kind}).frequency);
  });
  it('진행파 공간 위상·방향·m2',()=>{
    expect(pressureModel().phaseDeg).toBe(-90);expect(pressureModel({order:2,separation:45}).phaseDeg).toBe(-90);
    const s=pressureModel();expect(s.at(1/(4*s.frequency),90)).toBeCloseTo(2000,10);expect(s.at(0,360)).toBeCloseTo(s.at(0,0),10);
  });
  it('정재파 절점은0·위상 없음; 반대쪽180°',()=>{
    expect(pressureModel({kind:'standing'}).peakB).toBe(0);expect(pressureModel({kind:'standing'}).phaseDeg).toBeNull();
    expect(Math.abs(pressureModel({kind:'standing',separation:180}).phaseDeg!)).toBe(180);
    expect(pressureModel({kind:'longitudinal'}).peakB).toBe(0);expect(pressureModel({kind:'longitudinal',axial:1}).peakB).toBe(2000);
  });
  it('RMS·선형 진폭·시간 주기·0 진폭',()=>{
    const s=pressureModel();expect(s.rmsA).toBeCloseTo(2000/Math.SQRT2,10);
    const numerical=Math.sqrt(s.a.slice(0,200).reduce((sum,x)=>sum+x*x,0)/200);expect(numerical).toBeCloseTo(s.rmsA,9);
    expect(s.at(1/s.frequency)).toBeCloseTo(s.at(0),9);expect(pressureModel({amplitude:0}).phaseDeg).toBeNull();
    expect(pressureModel({amplitude:4000}).a[13]).toBeCloseTo(2*s.a[13],10);
  });
  it('같은 진폭90° 변화는sqrt2배 차; 변화 없으면0',()=>{
    expect(vectorChange(20e-6,0,20e-6,90).peak).toBeCloseTo(20e-6*Math.SQRT2,12);
    expect(vectorChange(20e-6,0,20e-6,0).phaseDeg).toBeNull();
  });
  it('잘못된 입력 거부',()=>{for(const options of [{rpm:0},{order:0},{amplitude:-1},{axial:2},{separation:NaN}])expect(()=>pressureModel(options)).toThrow();});
});
