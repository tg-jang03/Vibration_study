/** P8-5 학습용 지정 계자/열 응답. SI; 실기 시험·온도·손상·보호 모델 아님. */
import {phasor,toAmpLag,subtractVectors,type AmpLag} from '../phase';
import {steadyStateResponse} from '../mck/forced';
export type FieldKind='thermal'|'instant'|'unchanged';
export const FIELD_LABELS:Record<FieldKind,string>={thermal:'열 지연 예제',instant:'즉시 변화 비교',unchanged:'변화 없음 비교'};
export interface FieldOptions {kind?:FieldKind;before?:number;after?:number;tau?:number;gain?:number;lag?:number;baseline?:AmpLag}
export const FIELD_DEFAULT={kind:'thermal' as FieldKind,before:.5,after:1,tau:120,gain:15e-6,lag:Math.PI/2,baseline:{amp:20e-6,lag:0}};
export const FIELD_RETURN=600;
export const FIELD_PHASE_FLOOR=1e-9; // 0.001 µm Peak: 표시상의 위상 보류 기준, 실기 판정치 아님.
function parameters(options:FieldOptions) {
  const p={...FIELD_DEFAULT,...options};
  if(!(p.kind in FIELD_LABELS)||![p.before,p.after,p.gain,p.lag,p.tau,p.baseline.amp,p.baseline.lag].every(Number.isFinite)||p.before<0||p.after<0||p.gain<0||p.tau<=0||p.baseline.amp<0)throw new RangeError('field parameters');
  return p;
}
function vector(p:ReturnType<typeof parameters>,h:number) {
  const thermal={amp:p.gain*h,lag:p.lag},u=phasor(p.baseline),q=phasor(thermal);
  const v={re:u.re+q.re,im:u.im+q.im},scale=Math.max(p.baseline.amp,thermal.amp);
  const oneX=Math.hypot(v.re,v.im)<=scale*1e-14?{amp:0,lag:0}:toAmpLag(v);
  return {oneX,contribution:thermal};
}
export function fieldResponse(time:number,options:FieldOptions={}) {
  const p=parameters(options);if(!Number.isFinite(time))throw new RangeError('time');
  const h0=p.before**2,h1=p.after**2;
  const current=time<0||time>=FIELD_RETURN?p.before:p.after;
  const atReturn=h1+(h0-h1)*Math.exp(-FIELD_RETURN/p.tau);
  const heat=p.kind==='unchanged'?h0:p.kind==='instant'?current**2:time<0?h0:
    time<=FIELD_RETURN?h1+(h0-h1)*Math.exp(-time/p.tau):h0+(atReturn-h0)*Math.exp(-(time-FIELD_RETURN)/p.tau);
  const {oneX,contribution}=vector(p,heat),reference=vector(p,h0).oneX;
  const difference=subtractVectors(oneX,reference).amp;
  const change=difference<=Math.max(oneX.amp,reference.amp)*1e-14?0:difference;
  return {time,current,heat,oneX,contribution,reference,change,phaseDeg:oneX.amp<FIELD_PHASE_FLOOR?null:oneX.lag*180/Math.PI,baseline:p.baseline};
}
export function fieldSeries(options:FieldOptions={}) {
  // 명시적 단계 시각을 포함. 0과600 직전 표본으로 입력의 점프를 선으로 분리.
  const times=[...Array.from({length:10},(_,i)=>-120+i*12),-1e-6,...Array.from({length:201},(_,i)=>i*6),FIELD_RETURN-1e-6].sort((a,b)=>a-b);
  return times.map(t=>fieldResponse(t,options));
}
export function generatorFrequencies(lineHz:number,poles:number) {
  if(!(lineHz>0)||!Number.isFinite(lineHz)||!Number.isInteger(poles)||poles<2||poles%2)throw new RangeError('generator frequency parameters');
  const rpm=120*lineHz/poles;return {rpm,rotatingHz:rpm/60,twiceLineHz:2*lineHz,twiceLineOrder:poles};
}
export function endwindingResponse(forcingHz:number,naturalHz:number,zeta:number) {
  if(![forcingHz,naturalHz,zeta].every(Number.isFinite)||forcingHz<0||naturalHz<=0||zeta<=0)throw new RangeError('endwinding parameters');
  return steadyStateResponse(forcingHz/naturalHz,zeta);
}
/** 자유2관성·비틀림 스프링. 평균 회전에 겹친 각도 변동만; 전기계/SSR 해석 아님. */
export function torsionalPair(j1:number,j2:number,stiffness:number) {
  if(![j1,j2,stiffness].every(Number.isFinite)||j1<=0||j2<=0||stiffness<=0)throw new RangeError('torsion parameters');
  const omega=Math.sqrt(stiffness*(1/j1+1/j2));
  return {rigidHz:0,frequency:omega/(2*Math.PI),omega,shape:[j2/(j1+j2),-j1/(j1+j2)] as const};
}
