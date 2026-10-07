/**
 * 결함 신호 합성기 (LAB-FAULT-01 엔진, P7-1 · Part 11 케이스가 같이 쓴다, D-042). 순수 함수, 내부 단위 SI(가속도 m/s²).
 *
 * 한 베어링 하우징의 세 방향(수평 H · 수직 V · 축방향 A) 가속도를 만든다. 결함마다 성분 목록을 더한다:
 *  - 정현 성분: 주파수, 방향별 속도 크기 [mm/s rms]와 위상 — 가속도로 바꿔 더한다 (a = v · 2πf).
 *  - 충격열: 결함 박자마다 하우징 공진이 울린다(구름베어링, P5-6). 박자 흔들림 1 %, 크기 흔들림 10 %.
 *  - 대역 잡음: 캐비테이션처럼 줄이 아닌 넓은 대역.
 * 크기는 모두 설명용 예시 값이다 (판정 기준이 아니다, I-009). 같은 기계·같은 시드면 같은 신호.
 */
import { bandAnalytic, spectrumOf } from '../dsp/envelope';
import { integrateSpectral } from '../dsp/filter';
import { createRng } from '../dsp/random';
import { singleSidedSpectrum } from '../dsp/spectrum';
import { bearingFrequencies } from '../machine/frequencies';
import { bearingOf, type FaultId } from './catalog';

export const G = 9.80665;

export interface MachineSpec {
  name: string;
  rpm: number;
  lineHz: number;
  /** 유도전동기 극수 (0이면 전동기 없음 · 모름) */
  poles: number;
  /** 날개(베인) 수, 0이면 없음 */
  blades: number;
  /** 이 축 기어 잇수와 상대 기어 잇수, 0이면 없음 */
  teeth: number;
  mateTeeth: number;
  /** 구름베어링 볼 수 (6205와 같은 치수비), 0이면 미끄럼베어링 */
  balls: number;
  /** 충격이 울리는 하우징 공진 [Hz]과 감쇠비 */
  resonanceHz: number;
  zeta: number;
  fs: number;
  seconds: number;
  seed: number;
}

/** 합성기가 만들 수 있는 결함 */
export type SynthFault = Extract<FaultId, 'unbalance' | 'misalignment' | 'looseness' | 'rub' | 'oilWhirl' | 'bearingOuter' | 'bearingInner' | 'bearingBall' | 'bearingCage' | 'gear' | 'electrical2LF' | 'bladePass' | 'cavitation'>;
export const SYNTH_FAULTS: SynthFault[] = ['unbalance', 'misalignment', 'looseness', 'rub', 'oilWhirl', 'bearingOuter', 'bearingInner', 'bearingBall', 'bearingCage', 'gear', 'electrical2LF', 'bladePass', 'cavitation'];

/** 결함마다 정도 0 ~ 1 */
export type Severity = Partial<Record<SynthFault, number>>;

export const MACHINES = {
  /** 2극 유도전동기 직결 원심 펌프: 명판 3560 rpm(전부하), 지금 3575 rpm */
  pump: { name: '전동기-펌프 (2극, 베인 7개)', rpm: 3575, lineHz: 60, poles: 2, blades: 7, teeth: 0, mateTeeth: 0, balls: 9, resonanceHz: 3300, zeta: 0.05, fs: 16384, seconds: 2, seed: 101 },
  /** 4극 전동기 + 감속기 입력축: 피니언 23이빨 ↔ 기어 61이빨, 1490 rpm, 50 Hz 계통 */
  gearbox: { name: '감속기 입력축 (23 → 61이빨)', rpm: 1490, lineHz: 50, poles: 4, blades: 0, teeth: 23, mateTeeth: 61, balls: 9, resonanceHz: 3300, zeta: 0.05, fs: 16384, seconds: 2, seed: 102 },
  /** 벨트 구동 팬 축: 1180 rpm, 날개 8개 */
  fan: { name: '벨트 구동 팬 (날개 8개)', rpm: 1180, lineHz: 60, poles: 0, blades: 8, teeth: 0, mateTeeth: 0, balls: 9, resonanceHz: 3300, zeta: 0.05, fs: 16384, seconds: 2, seed: 103 },
  /** 미끄럼베어링 압축기 축 (오일 휠 예시) */
  compressor: { name: '미끄럼베어링 압축기 (날개 19개)', rpm: 6000, lineHz: 60, poles: 0, blades: 19, teeth: 0, mateTeeth: 0, balls: 0, resonanceHz: 3300, zeta: 0.05, fs: 16384, seconds: 2, seed: 104 },
} satisfies Record<string, MachineSpec>;
export type MachineId = keyof typeof MACHINES;

/** 방향: H 수평, V 수직, A 축방향 */
export type Dir = 'H' | 'V' | 'A';
export const DIRS: Dir[] = ['H', 'V', 'A'];

interface Tone {
  f: number;
  /** 방향별 [mm/s rms, 위상 rad] */
  v: Record<Dir, [number, number]>;
}

const tone = (f: number, h: number, v: number, a: number, phH = 0, phV = phH - Math.PI / 2, phA = phH): Tone => ({ f, v: { H: [h, phH], V: [v, phV], A: [a, phA] } });
/** 회전하는 힘(불평형처럼): 수직이 수평보다 90° 늦다 */
const rotating = (f: number, h: number, v: number, a: number, ph = 0) => tone(f, h, v, a, ph, ph - Math.PI / 2, ph);
/** 한 방향으로 미는 힘(정렬 불량·풀림처럼): 수평·수직이 같은 위상 */
const directional = (f: number, h: number, v: number, a: number, ph = 0) => tone(f, h, v, a, ph, ph, ph);

export interface Synth {
  machine: MachineSpec;
  fr: number;
  fs: number;
  t: Float64Array;
  /** 방향별 가속도 [m/s²] */
  acc: Record<Dir, Float64Array>;
  /** 성분 목록 (참값, 설명·테스트용) */
  tones: Tone[];
}

/** 결함 성분 목록 (정현 성분) */
export function faultTones(m: MachineSpec, sev: Severity): Tone[] {
  const fr = m.rpm / 60;
  const s = (id: SynthFault) => Math.max(0, Math.min(1, sev[id] ?? 0));
  const out: Tone[] = [];
  // 건전한 기계에도 있는 작은 성분
  out.push(rotating(fr, 0.8, 0.6, 0.2, 0.3), directional(2 * fr, 0.2, 0.15, 0.1, 1.1));
  if (m.blades > 0) out.push(directional(m.blades * fr, 0.4, 0.3, 0.1, 0.7));
  if (m.poles > 0) out.push(directional(2 * m.lineHz, 0.15, 0.1, 0.02, 0.2));
  if (m.teeth > 0) out.push(directional(m.teeth * fr, 0.5, 0.4, 0.3, 0.4));
  // 결함
  if (s('unbalance') > 0) out.push(rotating(fr, 7 * s('unbalance'), 5 * s('unbalance'), 0.5 * s('unbalance'), 0.3));
  if (s('misalignment') > 0) {
    const k = s('misalignment');
    out.push(directional(fr, 2 * k, 1.5 * k, 5 * k, 1.0), directional(2 * fr, 3 * k, 2.5 * k, 4.5 * k, 2.0), directional(3 * fr, 1 * k, 0.8 * k, 1.5 * k, 0.4));
  }
  if (s('looseness') > 0) {
    const k = s('looseness');
    for (let h = 1; h <= 10; h++) out.push(directional(h * fr, 1.2 * k * h ** -0.6, 3 * k * h ** -0.6, 0.5 * k * h ** -0.6, 0));
    for (const h of [0.5, 1.5, 2.5, 3.5]) out.push(directional(h * fr, 0.5 * k * h ** -0.6, 1.2 * k * h ** -0.6, 0.2 * k * h ** -0.6, 0));
  }
  if (s('rub') > 0) {
    const k = s('rub');
    for (const [h, a] of [[0.5, 2], [1, 1.5], [1.5, 1], [2, 1.2], [2.5, 0.6], [3, 0.8]] as const) out.push(rotating(h * fr, a * k, a * k, 0.2 * a * k, 0.6 * h));
  }
  if (s('oilWhirl') > 0) out.push(rotating(0.43 * fr, 4 * s('oilWhirl'), 4 * s('oilWhirl'), 0.3 * s('oilWhirl'), 0.9));
  if (m.balls > 0) {
    const b = bearingFrequencies(bearingOf(m.balls), fr);
    const ko = s('bearingOuter');
    if (ko > 0) [1, 2, 3].forEach((h, i) => out.push(directional(h * b.bpfo, 0.25 * ko * [1, 0.7, 0.4][i], 0.6 * ko * [1, 0.7, 0.4][i], 0.1 * ko, 0.2 * h)));
    const ki = s('bearingInner');
    if (ki > 0) out.push(directional(b.bpfi, 0.2 * ki, 0.45 * ki, 0.1 * ki, 0.5), directional(b.bpfi - fr, 0.1 * ki, 0.25 * ki, 0.05 * ki, 1.5), directional(b.bpfi + fr, 0.1 * ki, 0.2 * ki, 0.05 * ki, 2.5));
    // 볼: 2×BSF ± FTF (볼이 케이지와 함께 하중 영역을 드나듦, P7-5) / 케이지: FTF (1X 아래)
    const kb = s('bearingBall');
    if (kb > 0) out.push(directional(b.bsf2, 0.15 * kb, 0.35 * kb, 0.05 * kb, 0.8), directional(b.bsf2 - b.ftf, 0.08 * kb, 0.18 * kb, 0.03 * kb, 1.8), directional(b.bsf2 + b.ftf, 0.07 * kb, 0.15 * kb, 0.03 * kb, 2.8));
    const kc = s('bearingCage');
    if (kc > 0) out.push(directional(b.ftf, 0.3 * kc, 0.5 * kc, 0.1 * kc, 0.6), directional(2 * b.ftf, 0.1 * kc, 0.2 * kc, 0.05 * kc, 1.6));
  }
  if (m.teeth > 0 && s('gear') > 0) {
    const k = s('gear');
    const gmf = m.teeth * fr;
    out.push(directional(gmf, 2 * k, 1.5 * k, 1 * k, 0.4), directional(2 * gmf, 1 * k, 0.8 * k, 0.5 * k, 1.2));
    for (let j = 1; j <= 4; j++) {
      const a = 0.9 * k * Math.exp(-(j - 1) / 3);
      out.push(directional(gmf - j * fr, a, 0.8 * a, 0.5 * a, 0.3 * j), directional(gmf + j * fr, a, 0.8 * a, 0.5 * a, 1.7 * j));
      // 2×GMF 둘레에도 같은 간격의 측대역 (깨진 이·편심은 맞물림 하모닉마다 측대역을 세운다)
      out.push(directional(2 * gmf - j * fr, 0.5 * a, 0.4 * a, 0.3 * a, 0.9 * j), directional(2 * gmf + j * fr, 0.5 * a, 0.4 * a, 0.3 * a, 2.3 * j));
    }
  }
  if (s('electrical2LF') > 0) out.push(directional(2 * m.lineHz, 3 * s('electrical2LF'), 2 * s('electrical2LF'), 0.2 * s('electrical2LF'), 0.2));
  if (m.blades > 0 && s('bladePass') > 0) {
    const k = s('bladePass');
    out.push(directional(m.blades * fr, 3 * k, 2 * k, 1 * k, 0.7), directional(2 * m.blades * fr, 1 * k, 0.7 * k, 0.3 * k, 1.9));
  }
  return out;
}

const cache = new Map<string, Synth>();

/** 기계 m에 결함 sev를 더한 세 방향 가속도 */
export function synthesize(m: MachineSpec, sev: Severity = {}): Synth {
  const key = JSON.stringify([m, sev]);
  const hit = cache.get(key);
  if (hit) return hit;
  const { fs } = m;
  const n = Math.round(m.fs * m.seconds);
  const fr = m.rpm / 60;
  const t = Float64Array.from({ length: n }, (_, i) => i / fs);
  const acc: Record<Dir, Float64Array> = { H: new Float64Array(n), V: new Float64Array(n), A: new Float64Array(n) };
  const tones = faultTones(m, sev);
  for (const tn of tones) {
    const w = 2 * Math.PI * tn.f;
    for (const d of DIRS) {
      const [vr, ph] = tn.v[d];
      if (vr === 0) continue;
      const a = (vr / 1000) * Math.SQRT2 * w; // mm/s rms → m/s² peak
      const arr = acc[d];
      for (let i = 0; i < n; i++) arr[i] += a * Math.cos(w * t[i] + ph);
    }
  }
  const rng = createRng(m.seed);
  // 충격열 (구름베어링)
  const wn = 2 * Math.PI * m.resonanceHz;
  const wd = wn * Math.sqrt(1 - m.zeta * m.zeta);
  const ringLen = Math.round((6 / (m.zeta * wn)) * fs);
  const impacts = (rate: number, amp: number, weight: (ti: number) => number) => {
    const dirW: Record<Dir, number> = { H: 0.6, V: 1, A: 0.3 };
    for (let k = 0; k / rate < m.seconds; k++) {
      const ti = (k + 0.01 * rng.normal()) / rate;
      const a = amp * Math.max(0, 1 + 0.1 * rng.normal()) * weight(ti);
      const i0 = Math.ceil(ti * fs);
      for (let i = Math.max(0, i0); i < Math.min(n, i0 + ringLen); i++) {
        const tau = i / fs - ti;
        const r = Math.exp(-m.zeta * wn * tau) * Math.sin(wd * tau);
        for (const d of DIRS) acc[d][i] += dirW[d] * a * r;
      }
    }
  };
  if (m.balls > 0) {
    const b = bearingFrequencies(bearingOf(m.balls), fr);
    const ko = Math.max(0, Math.min(1, sev.bearingOuter ?? 0));
    const ki = Math.max(0, Math.min(1, sev.bearingInner ?? 0));
    if (ko > 0) impacts(b.bpfo, 3 * G * ko, () => 1);
    if (ki > 0) impacts(b.bpfi, 2.5 * G * ki, (ti) => 0.55 + 0.45 * Math.cos(2 * Math.PI * fr * ti));
    const kb = Math.max(0, Math.min(1, sev.bearingBall ?? 0));
    const kc = Math.max(0, Math.min(1, sev.bearingCage ?? 0));
    if (kb > 0) impacts(b.bsf2, 2 * G * kb, (ti) => 0.55 + 0.45 * Math.cos(2 * Math.PI * b.ftf * ti));
    if (kc > 0) impacts(b.ftf, 1.2 * G * kc, () => 1);
  }
  // 캐비테이션: 2 ~ 6 kHz 대역 잡음
  const kc = Math.max(0, Math.min(1, sev.cavitation ?? 0));
  const white = Float64Array.from({ length: n }, () => rng.normal());
  if (kc > 0 && Number.isInteger(Math.log2(n))) {
    const bandNoise = bandAnalytic(spectrumOf(white), fs, 2000, 6000).re;
    let s2 = 0;
    for (const v of bandNoise) s2 += v * v;
    const sc = (1.5 * G * kc) / Math.sqrt(s2 / n);
    for (const d of DIRS) for (let i = 0; i < n; i++) acc[d][i] += (d === 'A' ? 0.5 : 1) * sc * bandNoise[i];
  }
  // 바탕 잡음 0.02 g
  for (const d of DIRS) for (let i = 0; i < n; i++) acc[d][i] += 0.02 * G * rng.normal();
  const out: Synth = { machine: m, fr, fs, t, acc, tones };
  if (cache.size > 40) cache.clear();
  cache.set(key, out);
  return out;
}

/** 가속도 → 속도 스펙트럼 [mm/s rms] (Hann, 2 Hz 아래는 고역 통과로 누른 주파수 영역 적분) */
export function velocitySpectrum(acc: ArrayLike<number>, fs: number, fMax = 1000) {
  const vel = integrateSpectral(acc, fs, 1, 2);
  const s = singleSidedSpectrum({ fs, x: vel }, { window: 'hann' });
  const k = s.frequency.findIndex((f) => f > fMax);
  const end = k < 0 ? s.frequency.length : k;
  return { freq: s.frequency.slice(0, end), amp: s.amplitude.slice(0, end).map((v) => (v * 1000) / Math.SQRT2), vel };
}

/** 주파수 f 근처(± tol)에서 가장 큰 값 */
export function peakAt(freq: ArrayLike<number>, amp: ArrayLike<number>, f: number, tol = 1): number {
  let m = 0;
  for (let k = 0; k < freq.length; k++) if (Math.abs(freq[k] - f) <= tol) m = Math.max(m, amp[k]);
  return m;
}

/** fMin 위에서 가장 큰 줄과 그 줄이 바닥(진폭 중앙값)의 몇 배인가. 결함 충격이 없으면 배수가 작아 그 줄은 잡음이다 */
export function topLine(freq: ArrayLike<number>, amp: ArrayLike<number>, fMin = 5): { f: number; ratio: number } {
  const vals: number[] = [];
  let top = -1;
  for (let k = 0; k < freq.length; k++) {
    if (freq[k] <= fMin) continue;
    vals.push(amp[k]);
    if (top < 0 || amp[k] > amp[top]) top = k;
  }
  if (top < 0) return { f: 0, ratio: 0 };
  vals.sort((a, b) => a - b);
  const floor = vals[Math.floor(vals.length / 2)];
  return { f: freq[top], ratio: floor > 0 ? amp[top] / floor : 0 };
}

/** 정수 주기가 아니어도 되도록 Hann 창을 씌운 상관으로 성분 f의 위상 [rad] (cos 기준 앞섬각) */
export function phaseAt(x: ArrayLike<number>, fs: number, f: number): number {
  let c = 0;
  let s = 0;
  const n = x.length;
  for (let i = 0; i < n; i++) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    const a = (2 * Math.PI * f * i) / fs;
    c += w * x[i] * Math.cos(a);
    s += w * x[i] * Math.sin(a);
  }
  return Math.atan2(-s, c);
}

/** 수직이 수평보다 몇 도 늦나 (0 ~ 360°): 1X 가속도 기준 */
export function hvLagDeg(syn: Synth, f: number): number {
  const d = ((phaseAt(syn.acc.H, syn.fs, f) - phaseAt(syn.acc.V, syn.fs, f)) * 180) / Math.PI;
  return ((d % 360) + 360) % 360;
}
