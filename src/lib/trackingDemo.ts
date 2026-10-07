/**
 * P5-5 "트래킹 · 노치 필터"의 예시 런업 신호와 분석. 본문 그림과 랩(LAB-FLT-02)이 같이 쓴다. 순수 함수, 내부 단위 SI.
 * 로터: P4-1의 예시 로터(`P41_EXAMPLE`: 고유 회전수 3000 rpm, ζ 0.05, 편심 5 µm → 봉우리 약 100 µm pp).
 * 1X = 그 순간 회전수의 정상상태 불평형 응답. 공진이 자리 잡는 시간 1/(ζω_n) ≈ 64 ms가 반파워 폭(약 305 rpm)을
 * 지나는 시간(800 rpm/s에서도 0.38 s)보다 짧아 회전체 자체의 과도 응답은 넣지 않았다 — 여기서 보는 어긋남은 모두 필터 때문이다.
 * 회전수: 시작 회전수에 hold초 머문 뒤 일정한 비율로 바꾸고, 끝 회전수에 hold초 머문다 (런업 600 → 3600, 코스트다운 3600 → 600).
 * 다른 성분 (설명용): 2X 6 µm pp(일정), 0.45X(3300 → 3600 rpm에서 0 → 12 µm pp로 자람, 기름막 휠 예시), 넓은 대역 잡음 σ.
 * 각도 θ(t)는 회전수를 적분한 해석해 — 키페이저 시각에서 얻는 법은 P5-4.
 */
import { createRng } from './dsp/random';
import { reconstructOrder, trackingDelay, trackingNoise, trackOrder, type TrackedVector } from './dsp/tracking';
import { halfPowerAF, P41_EXAMPLE, theoreticalPeakRpm, unbalanceVector, type HalfPowerResult, type RunUpPoint } from './rotor/runup';

export const TRK = {
  fs: 512,
  rpmLo: 600,
  rpmHi: 3600,
  /** 양 끝에서 머무는 시간 [s] (필터가 자리 잡고, 두 번 거르기의 끝 효과가 런업 구간에 닿지 않게) */
  hold: 20,
  /** 2X Peak [m]·지연각 */
  a2: 3e-6,
  lag2: 0.7,
  /** 0.45X 성분 (기름막 휠 예시): 비, 자라기 시작·다 자란 회전수, Peak [m], 위상 */
  whirlRatio: 0.45,
  whirlFrom: 3300,
  whirlTo: 3600,
  aWhirl: 6e-6,
  whirlPhase: 1.0,
  seed: 55,
  /** Overall을 구하는 블록 길이 [s] */
  block: 0.25,
} as const;

export const ROTOR = P41_EXAMPLE.rotor;
export type Direction = 'up' | 'down';

export interface TrackRun {
  rate: number;
  direction: Direction;
  theta: Float64Array;
  rpm: Float64Array;
  /** 잡음 없는 신호 */
  clean: Float64Array;
  /** 표준정규 잡음 (σ를 곱해 더한다) */
  unitNoise: Float64Array;
  /** 참 1X 벡터 (Peak) */
  v1: TrackedVector;
  /** 참 1X 파형 */
  oneX: Float64Array;
  /** 런업(코스트다운) 구간 [i0, i1) */
  i0: number;
  i1: number;
}

/** 0.45X 성분의 Peak [m]: whirlFrom에서 0 → whirlTo에서 aWhirl (선형) */
export const whirlAmp = (rpm: number) => TRK.aWhirl * Math.min(1, Math.max(0, (rpm - TRK.whirlFrom) / (TRK.whirlTo - TRK.whirlFrom)));

const runCache = new Map<string, TrackRun>();

/** 가속률 rate [rpm/s], 방향 direction의 예시 신호 (시드 고정) */
export function trackingRun(rate: number, direction: Direction): TrackRun {
  const key = `${rate}|${direction}`;
  const hit = runCache.get(key);
  if (hit) return hit;
  if (!(rate > 0)) throw new RangeError('rate must be > 0');
  const { fs, hold, rpmLo, rpmHi } = TRK;
  const ramp = (rpmHi - rpmLo) / rate;
  const n = Math.round((2 * hold + ramp) * fs);
  const r0 = direction === 'up' ? rpmLo : rpmHi;
  const r1 = direction === 'up' ? rpmHi : rpmLo;
  const s = (r1 - r0) / ramp; // rpm/s (부호 포함)
  const theta = new Float64Array(n);
  const rpm = new Float64Array(n);
  const clean = new Float64Array(n);
  const oneX = new Float64Array(n);
  const unitNoise = new Float64Array(n);
  const v1 = { re: new Float64Array(n), im: new Float64Array(n) };
  const rng = createRng(TRK.seed);
  // 회전수를 적분한 바퀴 수 (해석해)
  const revAt = (t: number) => {
    if (t <= hold) return (r0 / 60) * t;
    const a = (r0 / 60) * hold;
    if (t <= hold + ramp) {
      const u = t - hold;
      return a + (r0 / 60) * u + ((s / 60) * u * u) / 2;
    }
    const b = a + (r0 / 60) * ramp + ((s / 60) * ramp * ramp) / 2;
    return b + (r1 / 60) * (t - hold - ramp);
  };
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    const r = t <= hold ? r0 : t <= hold + ramp ? r0 + s * (t - hold) : r1;
    const th = 2 * Math.PI * revAt(t);
    const v = unbalanceVector(ROTOR, r);
    const re = v.amp * Math.cos(v.lag);
    const im = -v.amp * Math.sin(v.lag);
    const x1 = v.amp * Math.cos(th - v.lag);
    theta[i] = th;
    rpm[i] = r;
    v1.re[i] = re;
    v1.im[i] = im;
    oneX[i] = x1;
    clean[i] = x1 + TRK.a2 * Math.cos(2 * th - TRK.lag2) + whirlAmp(r) * Math.cos(TRK.whirlRatio * th + TRK.whirlPhase);
    unitNoise[i] = rng.normal();
  }
  const run: TrackRun = { rate, direction, theta, rpm, clean, unitNoise, v1, oneX, i0: Math.round(hold * fs), i1: Math.round((hold + ramp) * fs) };
  runCache.set(key, run);
  return run;
}

export interface TrackParams {
  /** 가속률 [rpm/s] */
  rate: number;
  direction: Direction;
  /** 트래킹 필터 폭 B [Hz] */
  bandwidth: number;
  /** 두 번 거르기 (저장된 데이터) */
  zeroPhase: boolean;
  /** 넓은 대역 잡음 표준편차 [m] */
  noise: number;
  /** 노치(Not-1X) 보기 */
  notch: boolean;
}

export const DEFAULT_TRACK_PARAMS: TrackParams = { rate: 200, direction: 'up', bandwidth: 0.5, zeroPhase: false, noise: 5e-6, notch: false };

export interface OverallBlock {
  rpm: number;
  direct: number;
  notOneX: number;
  /** 참 Not-1X (2X + 0.45X + 잡음) */
  truth: number;
  /** 노치가 남긴 1X (참 1X − 뽑은 1X) */
  leak: number;
}

export interface TrackAnalysis {
  params: TrackParams;
  /** Bode 점 (런업 구간, 시간 순서) — 진폭 Peak [m], 지연각 [rad] */
  rpm: number[];
  amp: number[];
  lag: number[];
  trueAmp: number[];
  trueLag: number[];
  /** 추정 봉우리 */
  peakRpm: number;
  peakAmp: number;
  /** 해석해 봉우리 (N_n/√(1 − 2ζ²)) */
  truePeakRpm: number;
  truePeakAmp: number;
  /** 위상이 90°를 지나는 회전수 (추정, 참값은 고유 회전수 3000) */
  phase90Rpm: number;
  af: HalfPowerResult | null;
  trueAf: HalfPowerResult | null;
  /** 한 방향 거르기의 지연 [s] (두 번 거르기면 0)과 그만큼의 회전수 [rpm] */
  delay: number;
  shiftRpm: number;
  /** 3600 rpm에 머무는 동안 크기 흔들림의 표준편차 [m, Peak]와 이론값 */
  noiseStd: number;
  noiseTheory: number;
  /** Overall 블록 (노치를 켤 때만) */
  blocks: OverallBlock[];
  /** 3600 rpm에 머무는 동안의 RMS [m] */
  holdDirect: number;
  holdNotOneX: number;
  holdTruth: number;
  /** 런업 구간에서 노치가 남긴 1X의 가장 큰 블록 RMS [m] */
  maxLeak: number;
}

const TWO_PI = 2 * Math.PI;
const toPoint = (rpm: number, re: number, im: number): RunUpPoint => {
  const a = -Math.atan2(im, re);
  return { rpm, amp: Math.hypot(re, im), lag: a < 0 ? a + TWO_PI : a };
};
const rms = (x: ArrayLike<number>, from: number, to: number) => {
  let s = 0;
  for (let i = from; i < to; i++) s += x[i] * x[i];
  return Math.sqrt(s / Math.max(1, to - from));
};

/** 지연각을 (−90°, 270°]로 (그래프에서 0° 근처가 끊기지 않게) */
export const lagForPlot = (lag: number) => (lag > 1.5 * Math.PI ? lag - TWO_PI : lag);

/** 지연각이 90°를 위로 지나는 회전수 (진폭이 봉우리의 30 % 넘는 점만, 선형 보간). 없으면 NaN */
export function phase90(points: readonly RunUpPoint[]): number {
  const sorted = [...points].sort((a, b) => a.rpm - b.rpm);
  const peak = Math.max(...sorted.map((p) => p.amp));
  const pts = sorted.filter((p) => p.amp > 0.3 * peak);
  for (let i = 1; i < pts.length; i++) {
    const a = lagForPlot(pts[i - 1].lag);
    const b = lagForPlot(pts[i].lag);
    if (a < Math.PI / 2 && b >= Math.PI / 2) return pts[i - 1].rpm + ((Math.PI / 2 - a) / (b - a)) * (pts[i].rpm - pts[i - 1].rpm);
  }
  return Number.NaN;
}

const analysisCache = new Map<string, TrackAnalysis>();

/** 트래킹 필터 한 번 (그림·랩 공통) */
export function analyzeTracking(params: TrackParams): TrackAnalysis {
  const key = JSON.stringify(params);
  const hit = analysisCache.get(key);
  if (hit) return hit;
  const { rate, direction, bandwidth, zeroPhase, noise, notch } = params;
  const run = trackingRun(rate, direction);
  const { fs } = TRK;
  const x = Float64Array.from(run.clean, (v, i) => v + noise * run.unitNoise[i]);
  const v = trackOrder(x, run.theta, { fs, bandwidth, zeroPhase, initial: zeroPhase ? undefined : { re: run.v1.re[0], im: run.v1.im[0] } });

  const stride = Math.max(1, Math.floor((run.i1 - run.i0) / 600));
  const est: RunUpPoint[] = [];
  const tru: RunUpPoint[] = [];
  for (let i = run.i0; i <= run.i1; i += stride) {
    est.push(toPoint(run.rpm[i], v.re[i], v.im[i]));
    tru.push(toPoint(run.rpm[i], run.v1.re[i], run.v1.im[i]));
  }
  let k = 0;
  for (let i = 1; i < est.length; i++) if (est[i].amp > est[k].amp) k = i;
  const truePeakRpm = theoreticalPeakRpm(ROTOR)!;
  const asc = (p: RunUpPoint[]) => [...p].sort((a, b) => a.rpm - b.rpm);

  // 3600 rpm에 머무는 구간 (양 끝 3 s 제외)
  const hiHold = direction === 'up' ? [run.i1 + 3 * fs, run.theta.length - 3 * fs] : [3 * fs, run.i0 - 3 * fs];
  // 잡음만의 흔들림: 같은 필터를 잡음 없는 신호에 건 결과와의 크기 차 (지연 효과와 섞이지 않게)
  const vc = noise > 0 ? trackOrder(run.clean, run.theta, { fs, bandwidth, zeroPhase, initial: zeroPhase ? undefined : { re: run.v1.re[0], im: run.v1.im[0] } }) : v;
  let s = 0;
  let m = 0;
  for (let i = hiHold[0]; i < hiHold[1]; i++) {
    s += (Math.hypot(v.re[i], v.im[i]) - Math.hypot(vc.re[i], vc.im[i])) ** 2;
    m++;
  }
  const delay = zeroPhase ? 0 : trackingDelay(bandwidth, fs);

  const blocks: OverallBlock[] = [];
  let holdDirect = 0;
  let holdNotOneX = 0;
  let holdTruth = 0;
  let maxLeak = 0;
  if (notch) {
    const rec = reconstructOrder(v, run.theta);
    const not1 = Float64Array.from(x, (xv, i) => xv - rec[i]);
    const truthNot = Float64Array.from(x, (xv, i) => xv - run.oneX[i]);
    const leak = Float64Array.from(rec, (r, i) => run.oneX[i] - r);
    const bl = Math.round(TRK.block * fs);
    for (let i = run.i0; i + bl <= run.i1; i += bl) {
      const b: OverallBlock = { rpm: run.rpm[i + (bl >> 1)], direct: rms(x, i, i + bl), notOneX: rms(not1, i, i + bl), truth: rms(truthNot, i, i + bl), leak: rms(leak, i, i + bl) };
      blocks.push(b);
      maxLeak = Math.max(maxLeak, b.leak);
    }
    holdDirect = rms(x, hiHold[0], hiHold[1]);
    holdNotOneX = rms(not1, hiHold[0], hiHold[1]);
    holdTruth = rms(truthNot, hiHold[0], hiHold[1]);
  }

  const out: TrackAnalysis = {
    params,
    rpm: est.map((p) => p.rpm),
    amp: est.map((p) => p.amp),
    lag: est.map((p) => p.lag),
    trueAmp: tru.map((p) => p.amp),
    trueLag: tru.map((p) => p.lag),
    peakRpm: est[k].rpm,
    peakAmp: est[k].amp,
    truePeakRpm,
    truePeakAmp: unbalanceVector(ROTOR, truePeakRpm).amp,
    phase90Rpm: phase90(est),
    af: halfPowerAF(asc(est)),
    trueAf: halfPowerAF(asc(tru)),
    delay,
    shiftRpm: rate * delay,
    noiseStd: Math.sqrt(s / Math.max(1, m)),
    noiseTheory: trackingNoise(noise, bandwidth, fs),
    blocks,
    holdDirect,
    holdNotOneX,
    holdTruth,
    maxLeak,
  };
  analysisCache.set(key, out);
  return out;
}

// ── 일정 회전수의 짧은 신호 (그림 2·3·7) ──

export interface SteadyOptions {
  rpm: number;
  seconds: number;
  /** 1X 벡터: Peak [m]·지연각 — 시각 tStep에서 amp → ampAfter로 바뀐다 (생략하면 그대로) */
  amp: number;
  lag: number;
  ampAfter?: number;
  tStep?: number;
  a2?: number;
  whirl?: number;
  noise?: number;
  seed?: number;
  /** 샘플링 주파수 (기본 TRK.fs) */
  fs?: number;
  /** 2X 지연각·0.45X 위상 (기본 TRK 값). Y 채널은 정방향 선회라 90° 늦게 준다 */
  lag2?: number;
  whirlPhase?: number;
}

/** 일정 회전수에서 x = 1X + 2X + 0.45X + 잡음 */
export function steadySignal(o: SteadyOptions) {
  const fs = o.fs ?? TRK.fs;
  const n = Math.round(o.seconds * fs);
  const fr = o.rpm / 60;
  const rng = createRng(o.seed ?? 21);
  const theta = Float64Array.from({ length: n }, (_, i) => TWO_PI * fr * (i / fs));
  const ampAt = (t: number) => (o.ampAfter !== undefined && t >= (o.tStep ?? Infinity) ? o.ampAfter : o.amp);
  const oneX = theta.map((th, i) => ampAt(i / fs) * Math.cos(th - o.lag));
  const x = theta.map(
    (th, i) =>
      oneX[i] +
      (o.a2 ?? 0) * Math.cos(2 * th - (o.lag2 ?? TRK.lag2)) +
      (o.whirl ?? 0) * Math.cos(TRK.whirlRatio * th + (o.whirlPhase ?? TRK.whirlPhase)) +
      (o.noise ?? 0) * rng.normal(),
  );
  return { fs, theta, x, oneX, ampAt, t: Float64Array.from({ length: n }, (_, i) => i / fs) };
}
