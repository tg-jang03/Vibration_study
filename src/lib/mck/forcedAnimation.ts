import {forcedResponseAt,type ForcedInput} from './forced';
import type {SdofSystem} from './sdof';
export type ForcedDisplay='total'|'steady';
const clean=(v:number)=>Math.abs(v)<1e-12?0:v;
/** 장치와 파형에 같은 시각의 기존 해를 사용한다. 내부 SI·초기조건은 정지. */
export function forcedMotionAt(system:SdofSystem,input:ForcedInput,time:number,display:ForcedDisplay='total'){
  if(!Number.isFinite(time)||time<0||!['total','steady'].includes(display))throw new RangeError('invalid forced animation');
  const state=forcedResponseAt(system,input,{x0:0,v0:0},time);
  return {force:clean(input.forceAmplitude*Math.cos(input.forcingOmega*time)),displacement:clean(display==='total'?state.x:state.steady)};
}
/** 가진 주기 T/4의 다음 격자점. 0 Hz 또는 표시 구간 밖이면 조작 불가. */
export function nextForcedQuarter(time:number,frequency:number,duration:number):number|null{
  if(![time,frequency,duration].every(Number.isFinite)||time<0||frequency<0||duration<=0)throw new RangeError('invalid forced step');
  if(frequency===0)return null;
  const quarter=1/(4*frequency),next=(Math.floor(time/quarter+1e-6)+1)*quarter;
  return next<=duration+1e-9?Math.min(next,duration):null;
}
