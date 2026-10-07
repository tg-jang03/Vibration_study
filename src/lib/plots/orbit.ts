/** P6-3 / LAB-ORB-01. SI(m,s,rad). Shapes are signal examples, not fault/contact solvers. */
import { trackOrder, reconstructOrder } from '../dsp/tracking';
export const ORBIT = { fr: 50, fs: 6400, samplesPerRev: 128, warmRevs: 200, maxStart: 30, maxRevs: 8, bandwidth: 4 } as const;
export type OrbitShape = 'circle'|'ellipse'|'banana'|'eight'|'loop'|'flower'|'flat'|'sub';
export const ORBIT_LABELS: Record<OrbitShape,string> = { circle:'원 · 1X', ellipse:'타원 · 1X', banana:'바나나 · 1X+2X', eight:'8자 · X 1X / Y 2X', loop:'내부 루프 · 1X+비교 성분', flower:'꽃잎 · 1X+3X', flat:'평평한 면 · X 상단 절단', sub:'단독 비교 성분 · 점 실험' };
export const EXTRA_DEFAULT: Record<OrbitShape,number> = { circle:0, ellipse:0, banana:12e-6, eight:20e-6, loop:12e-6, flower:8e-6, flat:0, sub:0 };
export interface OrbitOptions { shape?: OrbitShape; extra?: number; phase?: number; order?: number; sign?: 1|-1 }
export interface OrbitParams { shape: OrbitShape; extra:number; phase:number; order:number; sign:1|-1 }
const clean = (v:number) => Math.abs(v)<1e-15 ? 0 : v;
export function orbitParams(o:OrbitOptions={}):OrbitParams {
  const shape=o.shape??'circle', extra=o.extra??EXTRA_DEFAULT[shape], phase=o.phase??0, order=o.order??.5, sign=o.sign??1;
  if (!Object.hasOwn(ORBIT_LABELS,shape) || !Number.isFinite(extra) || extra<0 || extra>40e-6 || !Number.isFinite(phase) || !Number.isFinite(order) || order<=0 || order>3 || ![1,-1].includes(sign)) throw new RangeError('invalid orbit options');
  return {shape,extra,phase,order,sign};
}
/** Analytic AC point. Flat example removes its analytic mean, not the window mean. */
export function orbitPoint(rev:number, options:OrbitOptions={}) {
  if (!Number.isFinite(rev)) throw new RangeError('invalid revolution');
  const p=orbitParams(options), a=20e-6, th=2*Math.PI*rev;
  let x=a*Math.cos(th), y=a*Math.sin(th);
  if(p.shape==='ellipse') y*=.5;
  if(p.shape==='banana') y=.6*y+p.extra*Math.cos(2*th+p.phase);
  if(p.shape==='eight') y=p.extra*Math.sin(2*th+p.phase);
  if(p.shape==='loop') { x+=p.extra*Math.cos(p.order*th+p.phase); y+=p.extra*Math.sin(p.order*th+p.phase); }
  if(p.shape==='flower') { x+=p.extra*Math.cos(3*th+p.phase); y+=p.extra*Math.sin(3*th+p.phase); }
  if(p.shape==='flat') { const c=12e-6, alpha=Math.acos(c/a), mean=(c*alpha-a*Math.sin(alpha))/Math.PI; x=Math.min(x,c)-mean; }
  if(p.shape==='sub') { x=a*Math.cos(p.order*th+p.phase); y=a*Math.sin(p.order*th+p.phase); }
  return {x:clean(x),y:clean(p.sign*y)};
}
/** Analytic 1X coefficient, for comparison only; rendering uses the actual tracking filter. */
export function idealOneX(options:OrbitOptions={}) {
  const p=orbitParams(options), a=20e-6;
  let ax=a, ay=a;
  if(p.shape==='ellipse') ay=a/2;
  if(p.shape==='banana') ay=.6*a;
  if(p.shape==='eight') ay=0;
  if(p.shape==='flat') { const alpha=Math.acos(.6); ax=a*(1-(alpha-Math.sin(alpha)*Math.cos(alpha))/Math.PI); }
  if(p.shape==='sub' && Math.abs(p.order-1)>1e-12) ax=ay=0;
  // Same-frequency components add as vectors, not scalar amplitudes.
  if(p.shape==='loop' && Math.abs(p.order-1)<1e-12) ax=ay=Math.hypot(a+p.extra*Math.cos(p.phase),p.extra*Math.sin(p.phase));
  return {ax,ay};
}
export function orbitRecord(options:OrbitOptions={}) {
  const p=orbitParams(options), n=(ORBIT.warmRevs+ORBIT.maxStart+ORBIT.maxRevs)*ORBIT.samplesPerRev+1;
  const theta=new Float64Array(n), x=new Float64Array(n), y=new Float64Array(n);
  for(let i=0;i<n;i++) { const rev=i/ORBIT.samplesPerRev-ORBIT.warmRevs, pt=orbitPoint(rev,p); theta[i]=2*Math.PI*rev; x[i]=pt.x; y[i]=pt.y; }
  const filter={fs:ORBIT.fs, bandwidth:ORBIT.bandwidth,lpfOrder:4};
  const vx=trackOrder(x,theta,filter), vy=trackOrder(y,theta,filter);
  return {params:p,x,y,theta,vx,vy,fx:reconstructOrder(vx,theta),fy:reconstructOrder(vy,theta)};
}
export interface OrbitMark { rev:number; time:number; x:number; y:number; fx:number; fy:number }
export function distinctMarkCount(marks: Pick<OrbitMark,'x'|'y'>[], tolerance=1e-9) {
  if(!Number.isFinite(tolerance)||tolerance<0) throw new RangeError('invalid tolerance');
  const unique:typeof marks=[];
  for(const m of marks) if(!unique.some(u=>Math.hypot(m.x-u.x,m.y-u.y)<=tolerance)) unique.push(m);
  return unique.length;
}
export function orbitWindow(record:ReturnType<typeof orbitRecord>,start=0,revolutions=2) {
  if(!Number.isInteger(start)||start<0||start>ORBIT.maxStart||![2,4,8].includes(revolutions)) throw new RangeError('invalid orbit window');
  const i0=(ORBIT.warmRevs+start)*ORBIT.samplesPerRev, size=revolutions*ORBIT.samplesPerRev+1;
  const x=Array.from(record.x.slice(i0,i0+size)),y=Array.from(record.y.slice(i0,i0+size));
  const fx=Array.from(record.fx.slice(i0,i0+size)),fy=Array.from(record.fy.slice(i0,i0+size));
  const rev=Array.from({length:size},(_,i)=>start+i/ORBIT.samplesPerRev), time=rev.map(v=>v/ORBIT.fr);
  const marks:OrbitMark[]=Array.from({length:revolutions},(_,k)=>{const i=i0+k*ORBIT.samplesPerRev; return {rev:start+k,time:(start+k)/ORBIT.fr,x:record.x[i],y:record.y[i],fx:record.fx[i],fy:record.fy[i]};});
  const middle=i0+Math.floor(size/2), peak=(v:typeof record.vx)=>clean(Math.hypot(v.re[middle],v.im[middle]));
  return {x,y,fx,fy,rev,time,marks,distinct:distinctMarkCount(marks),xpp:Math.max(...x)-Math.min(...x),ypp:Math.max(...y)-Math.min(...y),ax:peak(record.vx),ay:peak(record.vy)};
}
/** Last 5 samples before each pulse are blank; dot at pulse follows the gap in time. */
export function blankBeforeMarks(x:number[],y:number[],enabled:boolean) {
  return {x:x.map((v,i)=>enabled&&i%ORBIT.samplesPerRev>=ORBIT.samplesPerRev-5?NaN:v),y:y.map((v,i)=>enabled&&i%ORBIT.samplesPerRev>=ORBIT.samplesPerRev-5?NaN:v)};
}
export function dotPhaseStep(order:number,sign:1|-1=1) { if(!Number.isFinite(order)||order<=0||![1,-1].includes(sign)) throw new RangeError('invalid dot phase'); return sign*360*order; }