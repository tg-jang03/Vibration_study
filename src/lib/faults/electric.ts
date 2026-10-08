/**
 * P7-7 "전기적 원인 (모터 · 발전기)"의 설명용 모델 (LAB-ELEC-01 · 본문 그림). 순수 함수, 속도 [mm/s rms], 주파수 [Hz].
 *
 * 전동기·발전기 한 베어링 하우징의 수평 속도에 원인마다 정현 성분을 더한다.
 *  - 자기력은 자속 밀도의 제곱(∝ 전류²)에 비례 → 전원 주파수의 2배(2×LF). 공극이 고르면 회전자에 걸리는 힘은 상쇄되고
 *    고정자 철심만 2×LF로 출렁인다. 고정자 결함·정적 공극 편심(좁은 쪽이 고정) → 2×LF가 커진다.
 *  - 유도전동기: 동기속도 f_sync = 2LF/P, 슬립 주파수 f_slip = f_sync − f_r, 극통과 주파수 PPF = P·f_slip = 2LF − P·f_r.
 *    로터바 결함 → 1X ± PPF (부하에 비례), 동적 공극 편심(좁은 쪽이 회전자와 함께 돈다) → 2×LF ± PPF와 1X ± PPF.
 *  - 기계적 원인(불평형 1X, 미스얼라인 2X)은 회전수를 따라간다.
 * 시험: 유도전동기는 t = 0에 전원을 끊는다 — 전기 성분은 τ_e = 0.1 s로 사라지고, 회전수는 f_r/(1 + t/τ_m)로 줄며
 *       기계 성분은 (f_r(t)/f_r0)²로 준다. 동기 발전기는 회전수를 유지한 채 t = 0에 계자를 끊는다 — 전기 성분은 τ_f = 0.8 s로
 *       사라지고 기계 성분은 그대로다.
 * 크기·시간 상수는 설명용이다 (판정 기준이 아니다, I-009).
 */
import { createRng } from '../dsp/random';
import { singleSidedSpectrum } from '../dsp/spectrum';
import { stft } from '../dsp/stft';

export type MachineKind = 'induction' | 'synchronous';
export interface ElecMachine {
  name: string;
  lineHz: number;
  poles: number;
  kind: MachineKind;
  /** 명판(전부하) 회전수 [rpm] — 동기기는 동기속도 */
  fullLoadRpm: number;
}

export const ELEC_MACHINES = {
  ind2: { name: '2극 유도전동기 (60 Hz)', lineHz: 60, poles: 2, kind: 'induction', fullLoadRpm: 3560 },
  ind4: { name: '4극 유도전동기 (50 Hz)', lineHz: 50, poles: 4, kind: 'induction', fullLoadRpm: 1470 },
  syn2: { name: '2극 동기 발전기 (60 Hz)', lineHz: 60, poles: 2, kind: 'synchronous', fullLoadRpm: 3600 },
} as const satisfies Record<string, ElecMachine>;
export type ElecMachineId = keyof typeof ELEC_MACHINES;
export const ELEC_MACHINE_IDS = Object.keys(ELEC_MACHINES) as ElecMachineId[];

export interface MotorFreqs {
  rpm: number;
  /** 회전 주파수 1X [Hz] */
  fr: number;
  /** 동기속도 [Hz] */
  fsync: number;
  /** 슬립 (비율) */
  slip: number;
  /** 슬립 주파수 f_sync − f_r [Hz] */
  fslip: number;
  /** 극통과 주파수 P·f_slip [Hz] */
  ppf: number;
  /** 2×LF [Hz] */
  twoLF: number;
  /** 극수 번째 하모닉 P·f_r [Hz] (2×LF − PPF) */
  pX: number;
}

/** 부하 [%]에서의 회전수와 전기 주파수. 슬립은 부하에 비례한다고 본다 (전부하 = 명판 회전수) */
export function motorFreqs(m: ElecMachine, loadPct: number): MotorFreqs {
  const nsync = (120 * m.lineHz) / m.poles;
  const sFull = (nsync - m.fullLoadRpm) / nsync;
  const slip = m.kind === 'synchronous' ? 0 : (sFull * loadPct) / 100;
  const rpm = nsync * (1 - slip);
  const fsync = nsync / 60;
  const fr = rpm / 60;
  const fslip = fsync - fr;
  return { rpm, fr, fsync, slip, fslip, ppf: m.poles * fslip, twoLF: 2 * m.lineHz, pX: m.poles * fr };
}

export type ElecCause = 'none' | 'stator' | 'rotorBar' | 'dynEcc' | 'unbalance' | 'misalign';
export const ELEC_LABEL: Record<ElecCause, string> = {
  none: '건전 (작은 기본 성분만)',
  stator: '고정자 · 정적 공극 편심 (전기)',
  rotorBar: '로터바 결함 (전기)',
  dynEcc: '동적 공극 편심 (전기)',
  unbalance: '불평형 (기계)',
  misalign: '미스얼라인 (기계)',
};
export const isElectric = (c: ElecCause) => c === 'stator' || c === 'rotorBar' || c === 'dynEcc';
/** 기계마다 고를 수 있는 원인 (동기기에는 슬립이 없어 로터바·PPF 측대역이 없다) */
export function causesFor(m: ElecMachine): ElecCause[] {
  return m.kind === 'induction' ? ['none', 'stator', 'rotorBar', 'dynEcc', 'unbalance', 'misalign'] : ['none', 'stator', 'unbalance', 'misalign'];
}

export interface ElecLine {
  /** 운전 중 주파수 [Hz] */
  f: number;
  /** 기계 성분이면 회전 차수(주파수 = h·f_r(t)), 전기 성분이면 0 */
  h: number;
  /** [mm/s rms] */
  amp: number;
  ph: number;
  electric: boolean;
  name: string;
}

/** 원인(여럿이면 합친다)과 부하 [%]에서의 성분 목록 */
export function elecLines(m: ElecMachine, causes: ElecCause | ElecCause[], loadPct: number): ElecLine[] {
  const cs = Array.isArray(causes) ? causes : [causes];
  const has = (c: ElecCause) => cs.includes(c);
  const q = motorFreqs(m, loadPct);
  const L = loadPct / 100;
  const mech = (h: number, amp: number, ph: number, name: string): ElecLine => ({ f: h * q.fr, h, amp, ph, electric: false, name });
  const elec = (f: number, amp: number, ph: number, name: string): ElecLine => ({ f, h: 0, amp, ph, electric: true, name });
  const out: ElecLine[] = [
    mech(1, 0.8 + (has('unbalance') ? 4 : 0) + (has('misalign') ? 1 : 0), 0.3, '1X'),
    mech(2, 0.25 + (has('misalign') ? 3 : 0), 1.1, '2X'),
    elec(q.twoLF, 0.2 + (has('stator') ? 3 : 0) + (has('dynEcc') ? 1.2 : 0), 0.2, '2×LF'),
  ];
  if (m.kind === 'induction') {
    if (has('rotorBar')) {
      out.push(elec(q.fr, 1.2 * L, 1.0, '1X (전기)'), elec(q.fr - q.ppf, 0.5 * L, 2.1, '1X − PPF'), elec(q.fr + q.ppf, 0.5 * L, 0.4, '1X + PPF'));
    }
    if (has('dynEcc')) {
      out.push(
        elec(q.twoLF - q.ppf, 0.5, 1.7, '2×LF − PPF'),
        elec(q.twoLF + q.ppf, 0.5, 2.6, '2×LF + PPF'),
        elec(q.fr - q.ppf, 0.25, 0.9, '1X − PPF'),
        elec(q.fr + q.ppf, 0.25, 2.9, '1X + PPF'),
      );
    }
  }
  return out;
}

// ── 시간 신호 ──
export const ELEC_SIG = {
  fs: 512,
  /** 시험 기록: t0 ~ t1 [s], 시험은 t = 0 */
  t0: -4,
  t1: 6,
  /** 전원 차단 뒤 전기 성분 시간 상수 [s] (유도전동기) */
  tauE: 0.1,
  /** 계자 차단 뒤 전기 성분 시간 상수 [s] (동기 발전기) */
  tauF: 0.8,
  /** 전원 차단 뒤 회전수 f_r/(1 + t/τ_m) [s] */
  tauM: 3,
  /** 바탕 잡음 [mm/s rms] */
  noise: 0.03,
  seed: 707,
} as const;

/** 시험 뒤 t [s]의 회전 주파수 비 f_r(t)/f_r0 (동기 발전기는 회전수를 유지한다) */
export function speedRatio(m: ElecMachine, t: number): number {
  return t <= 0 || m.kind === 'synchronous' ? 1 : 1 / (1 + t / ELEC_SIG.tauM);
}
/** 시험 뒤 t [s]의 전기 성분 크기 비 */
export function electricRatio(m: ElecMachine, t: number): number {
  return t <= 0 ? 1 : Math.exp(-t / (m.kind === 'synchronous' ? ELEC_SIG.tauF : ELEC_SIG.tauE));
}
/** 시험 뒤 t [s]의 기계 성분 크기 비 (회전수²) */
export const mechRatio = (m: ElecMachine, t: number) => speedRatio(m, t) ** 2;

/** 회전각의 적분 ∫f_r dt / f_r0 [s] (위상을 이어 붙이기 위해) */
function turnsTime(m: ElecMachine, t: number): number {
  if (t <= 0 || m.kind === 'synchronous') return t;
  const tau = ELEC_SIG.tauM;
  return tau * Math.log(1 + t / tau);
}

/**
 * 속도 신호 [mm/s] (순간값). trip이면 t = 0에 시험(전원 차단 / 계자 차단)을 한다.
 * t0 ~ t1 구간을 f_s로 샘플링한다.
 */
export function elecSignal(m: ElecMachine, lines: ElecLine[], { t0, t1, trip }: { t0: number; t1: number; trip: boolean }) {
  const { fs } = ELEC_SIG;
  const n = Math.round((t1 - t0) * fs);
  const t = Float64Array.from({ length: n }, (_, i) => t0 + i / fs);
  const v = new Float64Array(n);
  const rng = createRng(ELEC_SIG.seed);
  const fr0 = lines.find((l) => l.h === 1)?.f ?? 0;
  for (let i = 0; i < n; i++) {
    const ti = t[i];
    let s = 0;
    for (const l of lines) {
      const a = l.amp * Math.SQRT2;
      if (l.electric) {
        const g = trip ? electricRatio(m, ti) : 1;
        s += a * g * Math.cos(2 * Math.PI * l.f * ti + l.ph);
      } else {
        const g = trip ? mechRatio(m, ti) : 1;
        const tau = trip ? turnsTime(m, ti) : ti;
        s += a * g * Math.cos(2 * Math.PI * l.h * fr0 * tau + l.ph);
      }
    }
    v[i] = s + ELEC_SIG.noise * rng.normal();
  }
  return { t, v, fs };
}

/** 운전 중 기록 T초의 Hann 스펙트럼 [mm/s rms] */
export function elecSpectrum(m: ElecMachine, lines: ElecLine[], T: number) {
  const { v, fs } = elecSignal(m, lines, { t0: 0, t1: T, trip: false });
  const s = singleSidedSpectrum({ fs, x: v }, { window: 'hann' });
  return { freq: s.frequency, amp: s.amplitude.map((a) => a / Math.SQRT2), df: s.resolution };
}

/** 시험 전후 스펙트로그램: 프레임 0.5 s(Δf 2 Hz), 0.0625 s마다, 0 ~ fMax Hz [mm/s rms] */
export function elecSpectrogram(m: ElecMachine, lines: ElecLine[], fMax = 160) {
  const { t0, t1 } = ELEC_SIG;
  const { v, fs } = elecSignal(m, lines, { t0, t1, trip: true });
  const s = stft(v, fs, { n: 256, overlap: 0.875, window: 'hann', fMax });
  return { times: Array.from(s.times, (x) => x + t0), freqs: Array.from(s.freqs), amp: s.amp.map((row) => Array.from(row, (a) => a / Math.SQRT2)), df: s.df };
}

/** 시험 뒤 t [s]에 남은 크기 [mm/s rms]: 전기 성분 합 / 기계 성분 합 (줄마다 크기만 더한 어림) */
export function remainingAfter(m: ElecMachine, lines: ElecLine[], t: number) {
  let e = 0;
  let k = 0;
  for (const l of lines) {
    if (l.electric) e += l.amp * electricRatio(m, t);
    else k += l.amp * mechRatio(m, t);
  }
  return { electric: e, mechanical: k };
}

/** f 근처(± tol)의 가장 큰 값 */
export function peakIn(freq: ArrayLike<number>, amp: ArrayLike<number>, f1: number, f2: number): { f: number; a: number } {
  let best = { f: 0, a: 0 };
  for (let k = 0; k < freq.length; k++) if (freq[k] >= f1 && freq[k] <= f2 && amp[k] > best.a) best = { f: freq[k], a: amp[k] };
  return best;
}

/** 구간 [f1, f2]의 봉우리(이웃 두 칸보다 크고 가장 큰 값의 frac 이상) 수 — 두 줄이 갈라져 보이나 */
export function countPeaks(freq: ArrayLike<number>, amp: ArrayLike<number>, f1: number, f2: number, frac = 0.1): number {
  const top = peakIn(freq, amp, f1, f2).a;
  let c = 0;
  for (let k = 1; k < freq.length - 1; k++) {
    if (freq[k] < f1 || freq[k] > f2) continue;
    if (amp[k] > amp[k - 1] && amp[k] >= amp[k + 1] && amp[k] >= frac * top) c++;
  }
  return c;
}

// ── LAB-ELEC-01 숨은 원인 케이스 ──
export const ELEC_CASES: { machine: ElecMachineId; cause: ElecCause; load: number }[] = [
  { machine: 'ind2', cause: 'stator', load: 60 },
  { machine: 'ind2', cause: 'misalign', load: 60 },
  { machine: 'ind4', cause: 'rotorBar', load: 80 },
  { machine: 'ind4', cause: 'unbalance', load: 80 },
  { machine: 'syn2', cause: 'stator', load: 100 },
  { machine: 'syn2', cause: 'misalign', load: 100 },
  { machine: 'ind2', cause: 'dynEcc', load: 60 },
];
