/** P8-1: fixed real modes with diagonal damping; quasi-steady 1X, not a transient/gyroscopic FE model.
 * Complex convention A exp(-i lag). All displacements are Peak [m]. */
import { createRng } from '../dsp/random';
import { rpmGrid, wrapLag, type RunUpPoint } from './runup';

export interface ModalComponent {
  naturalRpm: number;
  zeta: number;
  eccentricity: number;
  heavySpot: number;
  /** Real signed mode shape at co-oriented sensors. Normalization is fixed with e/b. */
  shape: readonly number[];
  /** Equivalent modal pre-bend displacement [m] and lag [rad]. */
  bow?: { amp: number; lag: number };
}
export interface MultiModeOptions {
  rpmEnd: number; rpmStep: number; rpmStart?: number;
  runout?: { amp: number; lag: number };
  noise?: number; seed?: number;
}
export const P81_DEFAULT = {
  modes: [
    { naturalRpm: 1500, zeta: 0.06, eccentricity: 5e-6, heavySpot: 0, shape: [1, 1, 1.5] },
    { naturalRpm: 3000, zeta: 0.04, eccentricity: 3e-6, heavySpot: 0, shape: [1, -1, 0] },
  ] satisfies ModalComponent[],
  rpmEnd: 5000, rpmStep: 20, operatingRpm: 3600, slowRollRpm: 200,
  bow: { amp: 2e-6, lag: Math.PI / 3 },
  runout: { amp: 3e-6, lag: Math.PI / 3 }, seed: 81,
};
function nonnegative(name: string, v: number, positive = false) {
  if (!Number.isFinite(v) || v < 0 || (positive && v === 0)) throw new RangeError(name);
}
function validate(m: ModalComponent, sensor: number) {
  nonnegative('naturalRpm', m.naturalRpm, true); nonnegative('zeta', m.zeta, true);
  nonnegative('eccentricity', m.eccentricity);
  if (!Number.isInteger(sensor) || sensor < 0 || !Number.isFinite(m.shape[sensor])) throw new RangeError('sensor/shape');
  if (!Number.isFinite(m.heavySpot)) throw new RangeError('heavySpot');
  if (m.bow) { nonnegative('bow amplitude', m.bow.amp); if (!Number.isFinite(m.bow.lag)) throw new RangeError('bow lag'); }
}
export function complexPoint(rpm: number, re: number, im: number): RunUpPoint {
  const amp = Math.hypot(re, im);
  return { rpm, amp: amp < 1e-18 ? 0 : amp, lag: amp < 1e-18 ? 0 : wrapLag(Math.atan2(-im, re)) };
}
export function modalVector(m: ModalComponent, sensor: number, rpm: number): RunUpPoint {
  validate(m, sensor); nonnegative('rpm', rpm);
  const r = rpm / m.naturalRpm, a = 1 - r*r, d = 2*m.zeta*r;
  const b = m.bow;
  const re = m.eccentricity*r*r*Math.cos(m.heavySpot) + (b ? b.amp*Math.cos(b.lag) : 0);
  const im = -m.eccentricity*r*r*Math.sin(m.heavySpot) - (b ? b.amp*Math.sin(b.lag) : 0);
  const scale = m.shape[sensor] / (a*a+d*d);
  return complexPoint(rpm, scale*(re*a+im*d), scale*(im*a-re*d));
}
export function multiModeVector(modes: readonly ModalComponent[], sensor: number, rpm: number): RunUpPoint {
  if (modes.length === 0) throw new RangeError('modes');
  let re = 0, im = 0;
  for (const m of modes) { const v=modalVector(m,sensor,rpm); re+=v.amp*Math.cos(v.lag); im-=v.amp*Math.sin(v.lag); }
  return complexPoint(rpm,re,im);
}
export function simulateMultiMode(modes: readonly ModalComponent[], sensor: number, options: MultiModeOptions): RunUpPoint[] {
  const noise=options.noise ?? 0; nonnegative('noise',noise);
  const ro=options.runout; if(ro) { nonnegative('runout amplitude',ro.amp); if(!Number.isFinite(ro.lag)) throw new RangeError('runout lag'); }
  const rng=createRng((options.seed ?? 81)+sensor);
  return rpmGrid(options.rpmStart ?? 0,options.rpmEnd,options.rpmStep).map(rpm=>{
    const p=multiModeVector(modes,sensor,rpm);
    return complexPoint(rpm,p.amp*Math.cos(p.lag)+(ro ? ro.amp*Math.cos(ro.lag):0)+(noise?rng.normal()*noise:0),
      -p.amp*Math.sin(p.lag)-(ro ? ro.amp*Math.sin(ro.lag):0)+(noise?rng.normal()*noise:0));
  });
}
/** Wrapped phase for Bode; insert a NaN at wrap crossings instead of a false vertical stroke. */
export function phasePlot(points: readonly RunUpPoint[]): number[] {
  return points.map((p,i)=>p.amp < 1e-12 || (i>0 && points[i-1].amp>=1e-12 && Math.abs(p.lag-points[i-1].lag)>Math.PI) ? NaN:p.lag*180/Math.PI);
}
/** Signed phase difference, valid only when both amplitudes are above the display floor. */
export function phaseDifference(a: RunUpPoint, b: RunUpPoint): number {
  if(a.amp<1e-12 || b.amp<1e-12) return NaN;
  return Math.atan2(Math.sin(b.lag-a.lag),Math.cos(b.lag-a.lag))*180/Math.PI;
}
/** Sampled maximum within a named inspection window. It need not identify an isolated modal peak. */
export function windowPeak(points: readonly RunUpPoint[], lo: number, hi: number): RunUpPoint | null {
  const part=points.filter((p,i)=>p.rpm>=lo && p.rpm<=hi && i>0 && i<points.length-1 && p.amp>points[i-1].amp && p.amp>=points[i+1].amp);
  return part.length ? part.reduce((a,b)=>b.amp>a.amp?b:a):null;
}
/** Continuous phase change inside a window. Small amplitudes invalidate the result. */
export function phaseChange(points: readonly RunUpPoint[], lo: number, hi: number): number {
  const part=points.filter(p=>p.rpm>=lo && p.rpm<=hi);
  if(part.length<2 || part.some(p=>p.amp<1e-12)) return NaN;
  let change=0;
  for(let i=1;i<part.length;i++) change+=Math.atan2(Math.sin(part[i].lag-part[i-1].lag),Math.cos(part[i].lag-part[i-1].lag));
  return change*180/Math.PI;
}
