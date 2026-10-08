import {it,expect} from 'vitest';
import {fieldResponse,fieldSeries,generatorFrequencies,endwindingResponse,torsionalPair} from './generator';
it('동기속도와2LF:2극/4극·50/60Hz',()=>{
  expect(generatorFrequencies(50,2)).toEqual({rpm:3000,rotatingHz:50,twiceLineHz:100,twiceLineOrder:2});
  expect(generatorFrequencies(60,4)).toEqual({rpm:1800,rotatingHz:30,twiceLineHz:120,twiceLineOrder:4});
});
it('강제응답 r1 해·0주파수·감쇠',()=>{expect(endwindingResponse(120,120,.05).amplitudeRatio).toBeCloseTo(10,12);expect(endwindingResponse(120,120,.05).phaseLag).toBeCloseTo(Math.PI/2,12);expect(endwindingResponse(0,120,.05).amplitudeRatio).toBe(1);expect(endwindingResponse(120,120,.1).amplitudeRatio).toBe(5)});
it('열상태 초기값·τ시점63.2%·직교벡터',()=>{
  expect(fieldResponse(0).heat).toBe(.25);const s=fieldResponse(120);
  expect((s.heat-.25)/.75).toBeCloseTo(1-1/Math.E,12);
  expect(s.oneX.amp).toBeCloseTo(Math.hypot(20e-6,15e-6*(1-.75/Math.E)),12);
  expect(s.phaseDeg).toBeCloseTo(Math.atan2(15*(1-.75/Math.E),20)*180/Math.PI,10);
  expect(s.change).toBeCloseTo(15e-6*.75*(1-1/Math.E),12);
});
it('복귀 시 열상태·벡터 연속과 긴 시간 뒤 초기값',()=>{
  const left=fieldResponse(600-1e-6),right=fieldResponse(600+1e-6);expect(Math.abs(right.heat-left.heat)).toBeLessThan(1e-8);
  expect(fieldResponse(600).current).toBe(.5);expect(fieldResponse(600).heat).toBeGreaterThan(.99);expect(fieldResponse(6000).heat).toBeCloseTo(.25,12);
});
it('열ODE 차분·전류2배의 정상 열4배',()=>{
  const t=120,d=.001;const derivative=(fieldResponse(t+d).heat-fieldResponse(t-d).heat)/(2*d);
  expect(120*derivative+fieldResponse(t).heat).toBeCloseTo(1,8);
  expect(fieldResponse(-1,{before:1}).heat).toBe(4*fieldResponse(-1,{before:.5}).heat);
});
it('즉시/변화없음/감도0/같은 전류 구별',()=>{
  expect(fieldResponse(0,{kind:'instant'}).oneX.amp).toBeCloseTo(25e-6,12);
  expect(fieldResponse(120,{kind:'unchanged'}).heat).toBe(.25);
  for(const t of [0,120,600,1200]){expect(fieldResponse(t,{gain:0}).oneX.amp).toBe(20e-6);expect(fieldResponse(t,{before:1,after:1}).heat).toBe(1)}
});
it('반대 벡터는 열 증가에도 진폭 감소; 상쇄0·위상 보류',()=>{
  expect(fieldResponse(120,{lag:Math.PI}).oneX.amp).toBeLessThan(fieldResponse(0,{lag:Math.PI}).oneX.amp);
  const s=fieldResponse(-1,{before:1,gain:20e-6,lag:Math.PI});expect(s.oneX.amp).toBe(0);expect(s.phaseDeg).toBeNull();
  expect(fieldResponse(0,{gain:0,baseline:{amp:0,lag:0}}).phaseDeg).toBeNull();
});
it('2관성 고유방정식·각운동량·에너지',()=>{
  const j1=100,j2=200,k=1e6,s=torsionalPair(j1,j2,k),[a,b]=s.shape;
  expect(s.frequency).toBeCloseTo(Math.sqrt(15000)/(2*Math.PI),12);expect(s.rigidHz).toBe(0);expect(a-b).toBe(1);
  expect(j1*a+j2*b).toBeCloseTo(0,10);expect(k*(a-b)).toBeCloseTo(j1*s.omega**2*a,8);
  expect(.5*s.omega**2*(j1*a*a+j2*b*b)).toBeCloseTo(.5*k,8);
});
it('유한 시계열·잘못된 입력 거부',()=>{
  expect(fieldSeries().every(s=>Number.isFinite(s.oneX.amp)&&s.oneX.amp>=0)).toBe(true);
  for(const p of [{tau:0},{before:-1},{gain:NaN}])expect(()=>fieldResponse(0,p)).toThrow();
  expect(()=>generatorFrequencies(60,3)).toThrow();expect(()=>torsionalPair(0,1,1)).toThrow();expect(()=>endwindingResponse(1,0,.1)).toThrow();
});
