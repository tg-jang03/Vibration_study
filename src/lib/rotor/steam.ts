import { journalEquilibrium, P43_BEARING, type JournalBearing, type JournalState, type Point } from './journalBearing';
import { stabilityExample, stabilityModes, forwardInitial, sampleStabilityResponse } from './stability';

export type Admission = 'full' | 'up' | 'down' | 'right';
export const ADMISSION_LABELS: Record<Admission,string> = { full:'전주 분사: 순 반경 증기력0', up:'부분 분사: 상향 합력 예제', down:'부분 분사: 하향 합력 예제', right:'부분 분사: 우향 합력 예제' };
export const ST_DEFAULT = Object.freeze({ load:.5, admission:'full' as Admission, viscosity:.02, zeta:.06, sealRatio:.03, loadRatio:.15, amplitude:5e-6 });
export interface SteamOptions {
  load?: number; admission?: Admission; viscosity?: number; zeta?: number; sealRatio?: number; loadRatio?: number;
}
const finite=(v:number,min:number,max=Infinity)=>Number.isFinite(v)&&v>=min&&v<=max;
const clean=(v:number)=>Math.abs(v)<1e-12?0:v;

/** 수직 하중의 등방 원통 정적해를 합력 방향으로 회전. +X 오른쪽,+Y 위, CCW 자전. */
export function directedJournal(force: Point, viscosity=.02, bearing: JournalBearing=P43_BEARING): JournalState {
  if(!Number.isFinite(force.x)||!Number.isFinite(force.y)||!finite(viscosity,Number.MIN_VALUE))throw new RangeError('invalid directed journal');
  const magnitude=Math.hypot(force.x,force.y);
  if(magnitude===0)throw new RangeError('nonzero force required');
  const base=journalEquilibrium(bearing,magnitude,100*Math.PI,viscosity);
  const angle=Math.atan2(force.y,force.x)+Math.PI/2;
  return {...base,x:clean(base.x*Math.cos(angle)-base.y*Math.sin(angle)),y:clean(base.x*Math.sin(angle)+base.y*Math.cos(angle))};
}

/** q/k 기본값+부하 기울기의 지정 법칙에서 유일한 0~100% 경계만 반환한다. */
export function steamThreshold(zeta=.06,sealRatio=.03,loadRatio=.15): number|null {
  if(!finite(zeta,Number.MIN_VALUE,1-Number.EPSILON)||!finite(sealRatio,0)||!finite(loadRatio,0))throw new RangeError('invalid steam stability');
  if(loadRatio===0)return null;
  const load=(2*zeta-sealRatio)/loadRatio;
  return load>=-1e-12&&load<=1+1e-12?Math.max(0,Math.min(1,load)):null;
}

/** ST 현상 읽기용 지정 법칙. 유막 동계수·증기 유동·실제 threshold 예측 모델이 아니다. */
export function steamState(options:SteamOptions={}) {
  const o={...ST_DEFAULT,...options};
  if(!finite(o.load,0,1)||!['full','up','down','right'].includes(o.admission)||!finite(o.viscosity,Number.MIN_VALUE))throw new RangeError('invalid steam scenario');
  const threshold=steamThreshold(o.zeta,o.sealRatio,o.loadRatio);
  const force=clean(600*Math.sin(Math.PI*o.load));
  const steamForce={x:o.admission==='right'?force:0,y:clean(o.admission==='up'?force:o.admission==='down'?-force:0)};
  const totalForce={x:steamForce.x,y:steamForce.y-1000};
  const journal=directedJournal(totalForce,o.viscosity);
  const crossRatio=o.sealRatio+o.loadRatio*o.load;
  const system=stabilityExample(1800,o.zeta,crossRatio), modes=stabilityModes(system);
  return {load:o.load,steamForce,totalForce,bearingLoad:Math.hypot(totalForce.x,totalForce.y),journal,crossRatio,system,modes,threshold,modeHz:modes.forward.im/(2*Math.PI),rotatingHz:50};
}
export function steamLoadCurve(options:Omit<SteamOptions,'load'>={}) {
  return Array.from({length:101},(_,i)=>steamState({...options,load:i/100}));
}
export function steamFreeResponse(options:SteamOptions={},amplitude:number=ST_DEFAULT.amplitude) {
  if(!finite(amplitude,0))throw new RangeError('invalid initial amplitude');
  const {system}=steamState(options);
  return sampleStabilityResponse(system,forwardInitial(system,amplitude));
}

/** 공통 축방향 기준의 기하 예제. 열팽창 차이와 전체 축 이동을 구별한다. */
export function axialReferences(rotorGrowth:number,caseGrowth:number,thrustShift=0) {
  if(![rotorGrowth,caseGrowth,thrustShift].every(Number.isFinite))throw new RangeError('invalid axial references');
  return {rotorGrowth,caseGrowth,thrustShift,thermalDifference:rotorGrowth-caseGrowth,differentialExpansion:rotorGrowth+thrustShift-caseGrowth};
}
/** 균일 온도 변화를 지정한 자유 팽창 α L ΔT. 구속·온도 분포·과도 열전달은 포함하지 않는다. */
export function uniformExpansion(length:number,deltaTemperature:number,alpha=12e-6) {
  if(!finite(length,Number.MIN_VALUE)||!finite(alpha,Number.MIN_VALUE)||!Number.isFinite(deltaTemperature))throw new RangeError('invalid expansion');
  return alpha*length*deltaTemperature;
}
