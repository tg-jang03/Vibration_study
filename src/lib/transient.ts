/**
 * 과도 데이터 수집 (P2-5). 순수 함수, 내부 단위 SI (s, rpm은 표시 단위로 그대로, 변위 m).
 * 예시 기동: 300 rpm에서 출발해 1500 rpm까지 10 rpm/s, 임계속도 구간(1500 ~ 2500 rpm)은 20 rpm/s로 빨리,
 * 그 위 3600 rpm까지 약 7.3 rpm/s, 이후 유지. 예시 로터: 임계 2000 rpm, ζ 0.05, 운전 3600 rpm에서 20 µm pp.
 * 진폭·위상은 lib/mck의 불평형 응답 (P0-6, P2-3과 같은 식). 모든 값은 설명용 예시다.
 */
import { unbalanceResponseFactor } from './mck';
import { fft } from './dsp/fft';
import { singleSidedSpectrum } from './dsp/spectrum';
import { hannWindow } from './dsp/window';

export const RUNUP_ROTOR = { criticalRpm: 2000, zeta: 0.05, operatingRpm: 3600, ampAtOp: 20e-6 } as const;

/** 기동 회전수 프로파일 구간: [시작 시각 s, 시작 rpm, 끝 시각 s, 끝 rpm] */
export const RUNUP_SEGMENTS: [number, number, number, number][] = [
  [0, 300, 120, 1500],
  [120, 1500, 170, 2500],
  [170, 2500, 320, 3600],
  [320, 3600, 360, 3600],
];
export const RUNUP_END = 360;

/** 시각 t [s]의 회전수 [rpm] */
export function runupRpm(t: number): number {
  if (t <= 0) return RUNUP_SEGMENTS[0][1];
  for (const [t0, r0, t1, r1] of RUNUP_SEGMENTS) if (t <= t1) return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
  return RUNUP_SEGMENTS[RUNUP_SEGMENTS.length - 1][3];
}

/** 회전수 rpm에 처음 닿는 시각 [s] (프로파일은 줄지 않는다) */
export function runupTimeAt(rpm: number): number {
  for (const [t0, r0, t1, r1] of RUNUP_SEGMENTS) if (rpm <= r1 && r1 > r0) return t0 + ((rpm - r0) * (t1 - t0)) / (r1 - r0);
  return RUNUP_END;
}

/** 회전수 rpm에서 1X 진폭 [m pp]과 위상 지연 [rad] */
export function runupResponse(rpm: number): { amp: number; lag: number } {
  const R = (n: number) => unbalanceResponseFactor(n / RUNUP_ROTOR.criticalRpm, RUNUP_ROTOR.zeta);
  const cur = R(rpm);
  return { amp: (RUNUP_ROTOR.ampAtOp * cur.factor) / R(RUNUP_ROTOR.operatingRpm).factor, lag: cur.phaseLag };
}

export interface RunupSample {
  t: number;
  rpm: number;
  amp: number;
  lag: number;
}

/** 시간 간격 Δt마다 저장 (t = 0, Δt, 2Δt, …, 회전수가 끝값에 닿을 때까지) */
export function sampleByTime(dt: number, tEnd = runupTimeAt(RUNUP_ROTOR.operatingRpm)): RunupSample[] {
  if (!(dt > 0)) throw new RangeError('dt > 0');
  const out: RunupSample[] = [];
  for (let k = 0; k * dt <= tEnd + 1e-9; k++) {
    const t = k * dt;
    const rpm = runupRpm(t);
    out.push({ t, rpm, ...runupResponse(rpm) });
  }
  return out;
}

/** 회전수 간격 Δrpm마다 저장 (시작 rpm부터 운전 회전수까지) */
export function sampleByRpm(drpm: number): RunupSample[] {
  if (!(drpm > 0)) throw new RangeError('drpm > 0');
  const out: RunupSample[] = [];
  for (let rpm = RUNUP_SEGMENTS[0][1]; rpm <= RUNUP_ROTOR.operatingRpm + 1e-9; rpm += drpm) {
    out.push({ t: runupTimeAt(rpm), rpm, ...runupResponse(rpm) });
  }
  return out;
}

/** 회전수 lo ~ hi 안에 든 샘플 수 */
export const countIn = (s: RunupSample[], lo: number, hi: number) => s.filter((p) => p.rpm >= lo && p.rpm <= hi).length;

// ── 동기 샘플링 vs 고정 샘플링 (회전수가 빨리 오르는 동안의 한 프레임) ──

export interface SmearDemo {
  /** 고정 f_s 스펙트럼: 주파수 [Hz], 피크 진폭 [m] */
  fixedFreq: Float64Array;
  fixedAmp: Float64Array;
  /** 동기 샘플링 스펙트럼: 차수, 피크 진폭 [m] */
  order: Float64Array;
  orderAmp: Float64Array;
  /** 프레임 동안 회전수 처음·끝 [rpm] */
  rpmStart: number;
  rpmEndFixed: number;
  rpmEndSync: number;
}

/**
 * 회전수가 rpm0에서 rate [rpm/s]로 오르는 동안, 1X·2X(진폭 a1·a2 [m pk], 크기는 일정하다고 둔다)를
 * (1) 고정 f_s로 N점 → Hann FFT, (2) 한 바퀴 spr점씩 revs바퀴 → 사각 윈도우 FFT (정수 바퀴라 누설 없음)로 본다.
 */
export function smearDemo(rpm0 = 1900, rate = 20, a1 = 25e-6, a2 = 7.5e-6, fs = 1280, n = 8192, spr = 64, revs = 256): SmearDemo {
  const f0 = rpm0 / 60;
  const a = rate / 60; // Hz/s
  const theta = (t: number) => 2 * Math.PI * (f0 * t + (a * t * t) / 2);
  const x = (th: number) => a1 * Math.cos(th) + a2 * Math.cos(2 * th + 0.8);
  const xs = Float64Array.from({ length: n }, (_, i) => x(theta(i / fs)));
  const sp = singleSidedSpectrum({ fs, x: xs }, { window: hannWindow(n) });
  // 동기: θ_k = 2πk/spr인 시각 t_k에서 찍는다 → x는 θ만의 함수이므로 x(θ_k)
  const m = spr * revs;
  const ys = Float64Array.from({ length: m }, (_, k) => x((2 * Math.PI * k) / spr));
  const Y = fft(ys);
  const half = m / 2;
  const order = Float64Array.from({ length: half + 1 }, (_, k) => k / revs);
  const orderAmp = Float64Array.from({ length: half + 1 }, (_, k) => ((k === 0 ? 1 : 2) * Math.hypot(Y.real[k], Y.imag[k])) / m);
  // 마지막 바퀴를 마치는 시각: f0 t + a t²/2 = revs
  const tSync = (-f0 + Math.sqrt(f0 * f0 + 2 * a * revs)) / a;
  return {
    fixedFreq: sp.frequency,
    fixedAmp: sp.amplitude,
    order,
    orderAmp,
    rpmStart: rpm0,
    rpmEndFixed: rpm0 + rate * (n / fs),
    rpmEndSync: rpm0 + rate * tSync,
  };
}

/** Cascade용: 회전수 rpm의 1X·2X 진폭 [m pp]과 고정 주파수 성분(구조 공진 예시 95 Hz) */
export function cascadeLines(rpm: number): { f: number; amp: number; fixed: boolean }[] {
  const r1 = runupResponse(rpm);
  return [
    { f: rpm / 60, amp: r1.amp, fixed: false },
    { f: (2 * rpm) / 60, amp: 0.15 * RUNUP_ROTOR.ampAtOp * (rpm / RUNUP_ROTOR.operatingRpm) ** 2, fixed: false },
    { f: 95, amp: 6e-6, fixed: true },
  ];
}
