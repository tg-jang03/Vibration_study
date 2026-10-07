/**
 * P5-4 "차수추적"의 예시 기동 신호와 분석. 본문 그림과 랩(LAB-ORD-01)이 같이 쓴다. 순수 함수, 내부 단위 SI.
 * 예시: 고정 f_s 4096 Hz로 기록. 프레임 시작(t = 0.5 s)에서 1500 rpm, 일정한 가속률로 오른다.
 * 성분(진폭은 일정하다고 둔다): 1X 25 µm, 2X 8 µm, 23X 3 µm(날개 통과 예시), 고정 95 Hz 4 µm(구조 공진 예시), 잡음 0.2 µm.
 * 키페이저 시각은 각도가 정수 바퀴가 되는 시각(해석해)이다. 모든 값은 설명용 예시다.
 */
import { amplitudeAtOrder, maxOrder, orderResolution, orderSpectrum, pulsesFromFrequency, resampleByAngle, ridgeFrequency, type InterpMethod, type OrderSpectrum } from './dsp/order';
import { createRng } from './dsp/random';
import { singleSidedSpectrum } from './dsp/spectrum';
import { stft } from './dsp/stft';

export const ORD = {
  fs: 4096,
  rpm0: 1500,
  /** 프레임 시작 시각 [s] (그 앞은 STFT·필터 여유) */
  lead: 0.5,
  a1: 25e-6,
  a2: 8e-6,
  aHigh: 3e-6,
  highOrder: 23,
  fixedHz: 95,
  aFixed: 4e-6,
  noise: 0.2e-6,
  seed: 7,
  /** 가장 긴 프레임 [바퀴] */
  maxRevs: 128,
  /** tacholess STFT 프레임 [샘플]·능선 탐색 대역 [Hz] */
  stftN: 1024,
  ridgeBand: [15, 60] as [number, number],
} as const;

export type Reference = 'keyphasor' | 'tacholess';

export interface OrderRun {
  rate: number;
  t: Float64Array;
  x: Float64Array;
  /** 실제 키페이저 시각 [s] (각도 = 정수 바퀴) */
  pulses: Float64Array;
  /** 프레임이 시작하는 펄스 번호 (t = lead) */
  iStart: number;
  /** 시각 t의 회전수 [rpm] */
  rpmAt: (t: number) => number;
  /** 시각 t의 누적 바퀴 (t = lead에서 0) */
  revAt: (t: number) => number;
}

const f0 = ORD.rpm0 / 60;
/** 가속률 rate [rpm/s]일 때 τ = t − lead 동안의 바퀴 수와 그 역함수 */
const revsOf = (a: number, tau: number) => f0 * tau + 0.5 * a * tau * tau;
const tauOfRev = (a: number, r: number) => (a === 0 ? r / f0 : (-f0 + Math.sqrt(f0 * f0 + 2 * a * r)) / a);

const runCache = new Map<number, OrderRun>();

/** 가속률 rate [rpm/s]의 예시 신호 (시드 고정, 같은 rate면 같은 결과) */
export function orderRun(rate: number): OrderRun {
  const hit = runCache.get(rate);
  if (hit) return hit;
  const a = rate / 60; // Hz/s
  const { fs, lead } = ORD;
  const tEnd = lead + tauOfRev(a, ORD.maxRevs + 6) + 0.05;
  const n = Math.ceil(tEnd * fs);
  const rng = createRng(ORD.seed);
  const t = new Float64Array(n);
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const ti = i / fs;
    const th = 2 * Math.PI * revsOf(a, ti - lead);
    t[i] = ti;
    x[i] =
      ORD.a1 * Math.cos(th) +
      ORD.a2 * Math.cos(2 * th + 0.8) +
      ORD.aHigh * Math.cos(ORD.highOrder * th + 1.3) +
      ORD.aFixed * Math.cos(2 * Math.PI * ORD.fixedHz * ti + 0.3) +
      ORD.noise * rng.normal();
  }
  const kFirst = Math.ceil(revsOf(a, -lead) - 1e-12);
  const kLast = Math.floor(revsOf(a, tEnd - lead));
  const pulses = Float64Array.from({ length: kLast - kFirst + 1 }, (_, i) => lead + tauOfRev(a, kFirst + i));
  const run: OrderRun = {
    rate,
    t,
    x,
    pulses,
    iStart: -kFirst,
    rpmAt: (tt: number) => ORD.rpm0 + rate * (tt - lead),
    revAt: (tt: number) => revsOf(a, tt - lead),
  };
  runCache.set(rate, run);
  return run;
}

export interface OrderParams {
  rate: number;
  revs: number;
  spr: number;
  interp: InterpMethod;
  antiAlias: boolean;
  reference: Reference;
}

export const DEFAULT_ORDER_PARAMS: OrderParams = { rate: 150, revs: 64, spr: 64, interp: 'cubic', antiAlias: true, reference: 'keyphasor' };

export interface OrderAnalysis {
  params: OrderParams;
  /** 차수 스펙트럼 */
  spectrum: OrderSpectrum;
  /** 같은 시간 구간의 시간 기반 스펙트럼 (Hann, 0 덧붙임) */
  timeFreq: Float64Array;
  timeAmp: Float64Array;
  /** 프레임 시각·회전수 */
  tStart: number;
  tEnd: number;
  rpmStart: number;
  rpmEnd: number;
  deltaOrder: number;
  orderMax: number;
  /** 차수 스펙트럼에서 읽은 1X·2X·23X 진폭 [m] */
  amp1: number;
  amp2: number;
  ampHigh: number;
  /** 시간 FFT에서 1X 근처 가장 높은 봉우리 [m] */
  timePeak1: number;
  /** 등각도 표본과 그 시각 */
  resampled: Float64Array;
  resampleTimes: Float64Array;
  /** 쓰인 키페이저 시각 (tacholess면 추정값) */
  pulsesUsed: Float64Array;
  /** tacholess일 때: STFT 프레임 시각, 능선 주파수 [Hz], 프레임 안 최대 회전수 추정 오차 [rpm] */
  ridgeTimes?: Float64Array;
  ridgeHz?: Float64Array;
  ridgeErrRpm?: number;
}

const nextPow2 = (v: number) => 2 ** Math.ceil(Math.log2(v));

/** 차수추적 한 번 (그림·랩 공통) */
export function analyzeOrder(params: OrderParams): OrderAnalysis {
  const { rate, revs, spr, interp, antiAlias, reference } = params;
  const run = orderRun(rate);
  const { fs } = ORD;
  let pulsesUsed = run.pulses;
  let startRev = run.iStart;
  let ridgeTimes: Float64Array | undefined;
  let ridgeHz: Float64Array | undefined;
  if (reference === 'tacholess') {
    const s = stft(run.x, fs, { n: ORD.stftN, overlap: 0.75, fMax: 200 });
    ridgeTimes = s.times;
    ridgeHz = ridgeFrequency(s, ORD.ridgeBand[0], ORD.ridgeBand[1]);
    pulsesUsed = pulsesFromFrequency(s.times, ridgeHz, run.t[run.t.length - 1], 1 / fs);
    startRev = pulsesUsed.findIndex((p) => p >= ORD.lead - 1e-9);
  }
  const res = resampleByAngle(run.x, fs, pulsesUsed, {
    samplesPerRev: spr,
    revs,
    startRev,
    interp,
    oversample: antiAlias ? Math.max(2, Math.round(256 / spr)) : 1,
  });
  const spectrum = orderSpectrum(res.y, spr);
  const tStart = pulsesUsed[startRev];
  const tEnd = pulsesUsed[startRev + revs];
  const i0 = Math.round(tStart * fs);
  const n = Math.max(16, Math.round((tEnd - tStart) * fs));
  const seg = run.x.slice(i0, i0 + n);
  const ts = singleSidedSpectrum({ fs, x: seg }, { window: 'hann', fftSize: nextPow2(n) * 2 });
  const fLo = (run.rpmAt(tStart) / 60) * 0.8;
  const fHi = (run.rpmAt(tEnd) / 60) * 1.2;
  let timePeak1 = 0;
  for (let k = 0; k < ts.frequency.length; k++) if (ts.frequency[k] >= fLo && ts.frequency[k] <= fHi) timePeak1 = Math.max(timePeak1, ts.amplitude[k]);
  let ridgeErrRpm: number | undefined;
  if (ridgeTimes && ridgeHz) {
    ridgeErrRpm = 0;
    for (let m = 0; m < ridgeTimes.length; m++) {
      if (ridgeTimes[m] < tStart || ridgeTimes[m] > tEnd) continue;
      ridgeErrRpm = Math.max(ridgeErrRpm, Math.abs(ridgeHz[m] * 60 - run.rpmAt(ridgeTimes[m])));
    }
  }
  return {
    params,
    spectrum,
    timeFreq: ts.frequency,
    timeAmp: ts.amplitude,
    tStart,
    tEnd,
    rpmStart: run.rpmAt(tStart),
    rpmEnd: run.rpmAt(tEnd),
    deltaOrder: orderResolution(revs),
    orderMax: maxOrder(spr),
    amp1: amplitudeAtOrder(spectrum, 1),
    amp2: amplitudeAtOrder(spectrum, 2),
    ampHigh: amplitudeAtOrder(spectrum, ORD.highOrder),
    timePeak1,
    resampled: res.y,
    resampleTimes: res.time,
    pulsesUsed,
    ridgeTimes,
    ridgeHz,
    ridgeErrRpm,
  };
}
