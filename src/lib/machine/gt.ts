/** GT 교육용 동압의 해석 공간 모양. SI; 실기 발생/허용 조건을 계산하지 않는다. */
export type PressureKind = 'stall' | 'surge' | 'longitudinal' | 'spinning' | 'standing';
export const PRESSURE_LABELS: Record<PressureKind,string> = {
  stall:'압축기 · 회전 실속',surge:'압축기 · 서지',longitudinal:'연소 · 종방향 정재파',
  spinning:'연소 · 원주 진행파',standing:'연소 · 원주 정재파',
};
export interface PressureOptions {kind?:PressureKind;rpm?:number;order?:number;separation?:number;axial?:number;amplitude?:number}
export const GT_DEFAULT = {kind:'spinning' as PressureKind,rpm:3000,order:1,separation:90,axial:.5,amplitude:2000};
const clean=(x:number)=>Math.abs(x)<1e-12?0:x;
const wrap=(x:number)=>{const y=((x+180)%360+360)%360-180;return clean(y)};
export function pressureModel(options:PressureOptions={}) {
  const p={...GT_DEFAULT,...options};
  if(!Number.isFinite(p.rpm)||p.rpm<=0||!Number.isInteger(p.order)||p.order<1||p.order>3||
    !Number.isFinite(p.amplitude)||p.amplitude<0||!Number.isFinite(p.separation)||!Number.isFinite(p.axial)||p.axial<0||p.axial>1||!(p.kind in PRESSURE_LABELS)) throw new RangeError('GT pressure parameters');
  const rotatingHz=p.rpm/60;
  // 0.4는 셀 회전비 지정값. 셀 개수와 센서 통과 주파수를 구별한다.
  const frequency=p.kind==='stall'?p.order*.4*rotatingHz:p.kind==='surge'?5:300;
  const traveling=p.kind==='stall'||p.kind==='spinning';
  const coefficient=(theta:number,axial:number)=>p.kind==='standing'?clean(Math.cos(p.order*theta*Math.PI/180)):
    p.kind==='longitudinal'?clean(Math.cos(Math.PI*axial)):1;
  const phase=(theta:number)=>traveling?-p.order*theta:0;
  const at=(time:number,theta=0,axial=0)=>p.amplitude*coefficient(theta,axial)*Math.cos(2*Math.PI*frequency*time+phase(theta)*Math.PI/180);
  const c2=coefficient(p.separation,p.axial),peakA=p.amplitude,peakB=p.amplitude*Math.abs(c2);
  const phaseDeg=peakA===0||peakB===0?null:wrap(phase(p.separation)+(c2<0?180:0));
  const time=Array.from({length:401},(_,i)=>i/(200*frequency));
  const a=time.map(t=>at(t)),b=time.map(t=>at(t,p.separation,p.axial));
  const space=Array.from({length:181},(_,i)=>p.kind==='longitudinal'?i/180:2*i);
  // t=0의 공간 분포. SI 압력을 UI에서 kPa로 변환.
  const shape=space.map(v=>p.kind==='longitudinal'?at(0,0,v):at(0,v,0));
  return {parameters:p,rotatingHz,frequency,orderRatio:frequency/rotatingHz,peakA,peakB,rmsA:peakA/Math.SQRT2,rmsB:peakB/Math.SQRT2,phaseDeg,time,a,b,space,shape,at};
}
/** 닫힌 양끝의 균일 1차원 관. 실기 연소기 경계조건을 대신하지 않는다. */
export function closedPipeFundamental(soundSpeed:number,length:number) {
  if(!(soundSpeed>0)||!Number.isFinite(soundSpeed)||!(length>0)||!Number.isFinite(length)) throw new RangeError('pipe parameters');
  return soundSpeed/(2*length);
}
/** 동일 측정 기준의 응답 벡터 차. Peak [m], 위상 [deg]; 힘/질량 추정 아님. */
export function vectorChange(beforePeak:number,beforePhase:number,afterPeak:number,afterPhase:number) {
  const x=afterPeak*Math.cos(afterPhase*Math.PI/180)-beforePeak*Math.cos(beforePhase*Math.PI/180);
  const y=afterPeak*Math.sin(afterPhase*Math.PI/180)-beforePeak*Math.sin(beforePhase*Math.PI/180);
  const peak=Math.hypot(x,y);return {x,y,peak,phaseDeg:peak===0?null:Math.atan2(y,x)*180/Math.PI};
}
