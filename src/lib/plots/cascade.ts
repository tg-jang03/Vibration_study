/** P6-2 / LAB-WF-01. 개별 정속 X/Y 기록: SI(m,s,Hz), 설명용 주파수 법칙. */
import { singleSidedSpectrum } from '../dsp/spectrum';
import { fullSpectrum } from '../dsp/twoChannel';
import { createRng } from '../dsp/random';
import { whirlWhipFrequency } from '../rotor/stability';
export const CASCADE = { fs: 1024, n: 2048, df: 0.5, count: 13, interval: 10 } as const;
export type CascadeScenario = 'lock' | 'follow' | 'fixed';
export const CASCADE_LABELS: Record<CascadeScenario, string> = {
  lock: '비율 추종 → 모드 주파수 잠김', follow: '비율 추종만 (휠형)', fixed: '처음부터 고정 주파수',
};
export interface CascadeOptions { scenario?: CascadeScenario; modeHz?: number; ratio?: number; reverseFraction?: number; noise?: boolean }
export interface SpectrumLine { freq: number[]; amp: number[] }
export interface CascadeRecord { time: number; rotatingHz: number; subHz: number; oneX: number; half: SpectrumLine; full: SpectrumLine }
export function cascadeOptions(o: CascadeOptions = {}) {
  const p = { scenario: o.scenario ?? 'lock', modeHz: o.modeHz ?? 40, ratio: o.ratio ?? .45, reverseFraction: o.reverseFraction ?? .25, noise: o.noise ?? false };
  if (!['lock','follow','fixed'].includes(p.scenario) || !Number.isFinite(p.modeHz) || p.modeHz <= 0 || p.modeHz > 100 || !Number.isFinite(p.ratio) || p.ratio <= 0 || p.ratio >= 1 || !Number.isFinite(p.reverseFraction) || p.reverseFraction < 0 || p.reverseFraction > 1 || typeof p.noise !== 'boolean') throw new RangeError('invalid cascade options');
  return p;
}
export function recordSignals(index: number, options: CascadeOptions = {}) {
  if (!Number.isInteger(index) || index < 0 || index >= CASCADE.count) throw new RangeError('invalid record index');
  const p = cascadeOptions(options), rotatingHz = 20 + 10 * Math.min(index, 10);
  const subHz = p.scenario === 'follow' ? p.ratio * rotatingHz : p.scenario === 'fixed' ? p.modeHz : whirlWhipFrequency(rotatingHz, p.modeHz, p.ratio);
  const oneX = (20 + 5 * Math.max(0,index - 10)) * 1e-6;
  const af = oneX * (1-p.reverseFraction), ab = oneX * p.reverseFraction;
  const x = new Float64Array(CASCADE.n), y = new Float64Array(CASCADE.n), rng = createRng(6202 + index);
  for (let i=0; i<CASCADE.n; i++) {
    const t=i/CASCADE.fs, a=2*Math.PI*rotatingHz*t, b=2*Math.PI*subHz*t, c=2*Math.PI*73*t;
    x[i]=oneX*Math.cos(a)+12e-6*Math.cos(b)+5e-6*Math.cos(2*a)+3e-6*Math.cos(c)+2e-6*Math.cos(2*Math.PI*320*t);
    y[i]=(af-ab)*Math.sin(a)+12e-6*Math.sin(b)+5e-6*Math.sin(2*a)+3e-6*Math.sin(c);
    if(p.noise) { x[i] += .5e-6*rng.normal(); y[i] += .5e-6*rng.normal(); }
  }
  return { time:index*CASCADE.interval, rotatingHz, subHz, oneX, x, y };
}
const cleanAmp = (v: number) => v < 1e-15 ? 0 : v;
export function cascadeRecords(options: CascadeOptions = {}): CascadeRecord[] {
  cascadeOptions(options);
  return Array.from({length:CASCADE.count},(_,i)=>{
    const s=recordSignals(i,options), h=singleSidedSpectrum({fs:CASCADE.fs,x:s.x},{window:'hann'}), f=fullSpectrum(s.x,s.y,CASCADE.fs,'hann');
    const halfKeep=Array.from(h.frequency.keys()).filter(k=>h.frequency[k]<=360);
    const fullKeep=Array.from(f.freq.keys()).filter(k=>Math.abs(f.freq[k])<=260);
    return { time:s.time, rotatingHz:s.rotatingHz, subHz:s.subHz, oneX:s.oneX,
      half:{freq:halfKeep.map(k=>h.frequency[k]),amp:halfKeep.map(k=>cleanAmp(h.amplitude[k]))},
      full:{freq:fullKeep.map(k=>f.freq[k]),amp:fullKeep.map(k=>cleanAmp(f.amp[k]))} };
  });
}
/** 가장 가까운 bin의 진폭. 알려진 자리 읽기이며 미지의 피크 검출이 아니다. */
export function amplitudeAt(s: SpectrumLine, hz: number): number {
  if (!Number.isFinite(hz) || hz<s.freq[0] || hz>s.freq[s.freq.length-1]) throw new RangeError('frequency out of range');
  let k=0; for(let i=1;i<s.freq.length;i++) if(Math.abs(s.freq[i]-hz)<Math.abs(s.freq[k]-hz)) k=i;
  return s.amp[k];
}
export const spectrumAxis = (s: SpectrumLine, rotatingHz: number, order: boolean) => {
  if (!Number.isFinite(rotatingHz) || rotatingHz<=0) throw new RangeError('invalid rotating frequency');
  return s.freq.map(f=>order?f/rotatingHz:f);
};