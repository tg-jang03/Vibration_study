import {it,expect} from 'vitest';
import {steamState,steamLoadCurve,steamThreshold,steamFreeResponse,directedJournal,axialReferences,uniformExpansion} from './steam';
import {journalEquilibrium,P43_BEARING,shortBearingLoad} from './journalBearing';
import {stabilityExample,stabilityModes} from './stability';
it('기본 지정법칙:50/60/80% 수렴·경계·성장',()=>{
  expect(steamState({load:.5}).modes.status).toBe('stable');
  expect(steamState({load:.6}).modes.status).toBe('marginal');
  expect(steamState({load:.8}).modes.status).toBe('unstable');
  expect(steamState({load:.6}).modes.forward.re).toBe(0);expect(steamState({load:.6}).modes.logDecrement).toBe(0);
});
it('가상 부하경계의 해석식과 구간 밖·상수계수',()=>{
  expect(steamThreshold()).toBeCloseTo(.6,14);expect(steamThreshold(.04)).toBeCloseTo(1/3,14);
  expect(steamThreshold(.12)).toBeNull();expect(steamThreshold(.02,.06)).toBeNull();
  expect(steamThreshold(.06,.12,0)).toBeNull();expect(steamThreshold(.06,0,0)).toBeNull();
  expect(steamThreshold(.06,.12,.15)).toBe(0);expect(steamThreshold(.06,.02,.1)).toBeCloseTo(1,14);
});
it('기존 안정성API와 동등',()=>{
  for(const load of [0,.5,.6,.8,1]) {
    const s=steamState({load}),m=stabilityModes(stabilityExample(1800,.06,.03+.15*load));
    expect(s.modes).toEqual(m);expect(s.modeHz).toBeCloseTo(m.forward.im/(2*Math.PI),12);
    expect(s.modeHz/s.rotatingHz).toBeLessThan(1);
  }
});
it('전주 분사 순 반경력0: P4-3 기준해 보존',()=>{
  const s=steamState(),ref=journalEquilibrium(P43_BEARING,1000,100*Math.PI,.02);
  expect(s.steamForce).toEqual({x:0,y:0});expect(s.journal).toEqual(ref);
});
it('상향·하향·우향 힘의 합력과 정적 평형',()=>{
  const up=steamState({admission:'up'}),down=steamState({admission:'down'}),right=steamState({admission:'right'});
  expect(up.totalForce).toEqual({x:0,y:-400});expect(down.totalForce).toEqual({x:0,y:-1600});
  expect(right.totalForce).toEqual({x:600,y:-1000});expect(right.bearingLoad).toBeCloseTo(Math.hypot(600,1000),12);
  expect(up.journal.eccentricityRatio).toBeLessThan(steamState().journal.eccentricityRatio);
  expect(down.journal.eccentricityRatio).toBeGreaterThan(steamState().journal.eccentricityRatio);
  for(const s of [up,down,right])expect(shortBearingLoad(P43_BEARING,s.journal.eccentricityRatio,100*Math.PI,.02)).toBeCloseTo(s.bearingLoad,10);
});
it('지정 sin 힘은 부하0/100%에서 이론상0',()=>{
  for(const admission of ['up','down','right'] as const)for(const load of [0,1])expect(steamState({admission,load}).steamForce).toEqual({x:0,y:0});
});
it('등방 베어링 합력회전은 크기·편심률·유막 보존',()=>{
  const base=directedJournal({x:0,y:-1000}),rotated=directedJournal({x:1000,y:0});
  expect(rotated.x).toBeCloseTo(-base.y,14);expect(rotated.y).toBeCloseTo(base.x,14);
  expect(rotated.eccentricityRatio).toBe(base.eccentricityRatio);expect(rotated.minimumFilm).toBe(base.minimumFilm);
});
it('분사방향·점성계수는 별도 안정성 계수를 변경하지 않음',()=>{
  const ref=steamState();
  for(const admission of ['full','up','down','right'] as const)for(const viscosity of [.01,.02,.04]){
    const s=steamState({admission,viscosity});expect(s.modes).toEqual(ref.modes);expect(s.threshold).toBe(ref.threshold);
  }
  expect(steamState({viscosity:.04}).journal.eccentricityRatio).toBeLessThan(ref.journal.eccentricityRatio);
});
it('부하 스캔은101개·0~100%·물리범위',()=>{
  const curve=steamLoadCurve({admission:'up'});expect(curve).toHaveLength(101);
  expect(curve[0].load).toBe(0);expect(curve[100].load).toBe(1);
  for(const s of curve){expect(s.bearingLoad).toBeGreaterThanOrEqual(400);expect(s.journal.eccentricityRatio).toBeGreaterThan(0);expect(s.journal.eccentricityRatio).toBeLessThan(1);expect(s.journal.minimumFilm).toBeGreaterThan(0);}
});
it('자유응답은 고유치의 지수해·초기 진폭에 비례',()=>{
  for(const load of [.5,.6,.8]){
    const response=steamFreeResponse({load}),double=steamFreeResponse({load},10e-6),s=steamState({load});
    expect(response).toHaveLength(501);
    for(const i of [0,250,500]){
      const p=response[i];expect(p.envelope).toBeCloseTo(5e-6*Math.exp(s.modes.forward.re*p.time),14);
      expect(double[i].envelope).toBeCloseTo(2*p.envelope,14);
    }
  }
});
it('표시 구간은8주기 또는20배 성장까지',()=>{
  const s=steamState({load:1,zeta:.02,loadRatio:.3}),r=steamFreeResponse({load:1,zeta:.02,loadRatio:.3});
  expect(r.at(-1)!.time).toBeLessThanOrEqual(8*2*Math.PI/s.modes.omegaN);
  expect(r.at(-1)!.envelope).toBeCloseTo(20*5e-6,12);
});
it('열팽창과 thrust 기준:24/14.4/9.6+0.2 mm',()=>{
  const rotor=uniformExpansion(8,250),casing=uniformExpansion(8,150),r=axialReferences(rotor,casing,.2e-3);
  expect(rotor).toBeCloseTo(.024,14);expect(casing).toBeCloseTo(.0144,14);
  expect(r.thermalDifference).toBeCloseTo(.0096,14);expect(r.differentialExpansion).toBeCloseTo(.0098,14);
  expect(axialReferences(rotor+.1,casing+.1,.2e-3).differentialExpansion).toBeCloseTo(r.differentialExpansion,14);
});
it('자유 팽창의 단위·냉각·같은 온도와 길이',()=>{
  expect(uniformExpansion(1,100)).toBeCloseTo(.0012,14);expect(uniformExpansion(1,-100)).toBeCloseTo(-.0012,14);
  expect(axialReferences(.01,.01).differentialExpansion).toBe(0);
});
it('잘못된 입력 거부',()=>{
  for(const options of [{load:-.1},{load:1.1},{admission:'bad' as 'full'},{viscosity:0},{zeta:0},{zeta:1},{sealRatio:-1},{loadRatio:NaN}])expect(()=>steamState(options)).toThrow(RangeError);
  expect(()=>directedJournal({x:0,y:0})).toThrow();expect(()=>directedJournal({x:NaN,y:1})).toThrow();
  expect(()=>steamFreeResponse({},-1)).toThrow();expect(()=>uniformExpansion(0,1)).toThrow();expect(()=>axialReferences(NaN,0)).toThrow();
});
