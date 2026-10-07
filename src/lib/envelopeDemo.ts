/**
 * P5-6 "엔벨로프 분석 · Spectral Kurtosis"의 예시 가속도 신호. 본문 그림과 랩(LAB-ENV-01 · LAB-SK-01)이 같이 쓴다. 순수 함수, SI(가속도 m/s²).
 * 기계: 3000 rpm(f_r = 50 Hz)으로 도는 축의 6205 볼베어링(P1-8: BPFO 179.2 Hz, BPFI 270.8 Hz) 하우징에 붙인 가속도계.
 * 성분 (모두 설명용 예시):
 *  - 축: 1X 0.1 g, 2X 0.05 g
 *  - 기어 맞물림 1200 Hz(이빨 24개) 1 g, 1X로 진폭 변조(m = 0.3), 2배 2400 Hz 0.3 g — 크지만 충격성은 없다
 *  - 넓은 대역 잡음: 0 ~ f_s/2 흰 잡음 σ 0.05 g + 5 ~ 7 kHz 대역 잡음(다른 원인, σ 기본 0.3 g)
 *  - 베어링 결함: 충격마다 하우징 공진 3.3 kHz(ζ 0.05, 울림이 1/e로 주는 시간 0.96 ms)가 울린다. 외륜이면 BPFO, 내륜이면 BPFI 박자.
 *    박자는 1 %(표준편차) 흔들리고(볼의 미끄럼), 크기는 10 % 흔들린다. 내륜은 결함이 하중 영역을 1X로 드나들어 크기가 1X로 변한다.
 */
import { bearingFrequencies, BEARING_6205 } from './machine/frequencies';
import { bandAnalytic, envelopeSpectrum, kurtogram, peakNear, spectralKurtosis, spectrumOf, type Cplx, type EnvelopeSpectrum, type Kurtogram } from './dsp/envelope';
import { createRng } from './dsp/random';
import { kurtosis, rms } from './dsp/stats';

export const G = 9.80665;
export const ENV = {
  fs: 16384,
  n: 32768,
  fr: 50,
  a1: 0.1 * G,
  a2: 0.05 * G,
  gearHz: 1200,
  gear: 1.0 * G,
  gearM: 0.3,
  gear2: 0.3 * G,
  white: 0.05 * G,
  hiBand: [5000, 7000] as [number, number],
  resonance: 3300,
  zeta: 0.05,
  jitter: 0.01,
  ampSpread: 0.1,
  seed: 61,
} as const;

export const BRG = bearingFrequencies(BEARING_6205, ENV.fr);
export type Fault = 'outer' | 'inner' | 'none';

export interface EnvSignalOptions {
  fault: Fault;
  /** 충격 하나가 울리는 첫 봉우리 크기 [m/s²] */
  impact: number;
  /** 5 ~ 7 kHz 대역 잡음 σ [m/s²] */
  hiNoise: number;
  /** 기어 맞물림 크기 배율 (1 = 1 g) */
  gearScale?: number;
}

export const DEFAULT_ENV_SIGNAL: EnvSignalOptions = { fault: 'outer', impact: 0.6 * G, hiNoise: 0.3 * G, gearScale: 1 };

interface Parts {
  t: Float64Array;
  shaft: Float64Array;
  gear: Float64Array;
  white: Float64Array;
  /** 단위 크기 대역 잡음 */
  hiUnit: Float64Array;
  /** 단위 크기 충격열 (외륜·내륜) */
  outerUnit: Float64Array;
  innerUnit: Float64Array;
  /** 충격 시각 */
  outerTimes: number[];
  innerTimes: number[];
}

let partsCache: Parts | undefined;

/** 충격열: 평균 박자 rate, 시각 흔들림 jitter(주기의 비율), 크기 weight(t) */
function impactTrain(rate: number, rng: ReturnType<typeof createRng>, weight: (t: number) => number): { x: Float64Array; times: number[] } {
  const { fs, n, resonance, zeta, jitter, ampSpread } = ENV;
  const x = new Float64Array(n);
  const wn = 2 * Math.PI * resonance;
  const wd = wn * Math.sqrt(1 - zeta * zeta);
  const len = Math.round(0.015 * fs);
  const times: number[] = [];
  const period = 1 / rate;
  for (let k = 0; k * period < n / fs; k++) {
    const ti = (k + jitter * rng.normal()) * period;
    const a = Math.max(0, 1 + ampSpread * rng.normal()) * weight(ti);
    times.push(ti);
    const i0 = Math.ceil(ti * fs);
    for (let i = Math.max(0, i0); i < Math.min(n, i0 + len); i++) {
      const tau = i / fs - ti;
      x[i] += a * Math.exp(-zeta * wn * tau) * Math.sin(wd * tau);
    }
  }
  return { x, times };
}

function parts(): Parts {
  if (partsCache) return partsCache;
  const { fs, n, fr } = ENV;
  const rng = createRng(ENV.seed);
  const t = Float64Array.from({ length: n }, (_, i) => i / fs);
  const shaft = t.map((v) => ENV.a1 * Math.cos(2 * Math.PI * fr * v) + ENV.a2 * Math.cos(4 * Math.PI * fr * v + 0.5));
  const gear = t.map((v) => ENV.gear * (1 + ENV.gearM * Math.cos(2 * Math.PI * fr * v + 0.3)) * Math.cos(2 * Math.PI * ENV.gearHz * v) + ENV.gear2 * Math.cos(4 * Math.PI * ENV.gearHz * v + 1.1));
  const white = t.map(() => ENV.white * rng.normal());
  // 5 ~ 7 kHz 대역 잡음: 흰 잡음을 FFT 영역에서 대역 통과 → σ가 1이 되게
  const raw = bandAnalytic(spectrumOf(t.map(() => rng.normal())), fs, ENV.hiBand[0], ENV.hiBand[1]).re;
  const s = rms(raw);
  const hiUnit = raw.map((v) => v / s);
  const outer = impactTrain(BRG.bpfo, rng, () => 1);
  const inner = impactTrain(BRG.bpfi, rng, (ti) => 0.55 + 0.45 * Math.cos(2 * Math.PI * fr * ti));
  partsCache = { t, shaft, gear, white, hiUnit, outerUnit: outer.x, innerUnit: inner.x, outerTimes: outer.times, innerTimes: inner.times };
  return partsCache;
}

export interface EnvSignal {
  t: Float64Array;
  x: Float64Array;
  /** 결함 충격만 */
  bearing: Float64Array;
  X: Cplx;
  /** 결함 주파수 (없으면 BPFO) */
  faultHz: number;
}

const signalCache = new Map<string, EnvSignal>();

export function envSignal(o: EnvSignalOptions): EnvSignal {
  const key = JSON.stringify(o);
  const hit = signalCache.get(key);
  if (hit) return hit;
  const p = parts();
  const g = o.gearScale ?? 1;
  const unit = o.fault === 'inner' ? p.innerUnit : p.outerUnit;
  const amp = o.fault === 'none' ? 0 : o.impact;
  const bearing = unit.map((v) => amp * v);
  const x = p.t.map((_, i) => p.shaft[i] + g * p.gear[i] + p.white[i] + o.hiNoise * p.hiUnit[i] + bearing[i]);
  const out: EnvSignal = { t: p.t, x, bearing, X: spectrumOf(x), faultHz: o.fault === 'inner' ? BRG.bpfi : BRG.bpfo };
  if (signalCache.size > 24) signalCache.clear();
  signalCache.set(key, out);
  return out;
}

export interface EnvAnalysis {
  env: EnvelopeSpectrum;
  /** 결함 주파수 1·2·3배 줄의 높이 [m/s²] */
  lines: number[];
  /** 엔벨로프 스펙트럼 바닥: 10 Hz ~ min(fMax, 대역폭)의 중앙값 [m/s²] (포락선은 대역폭보다 높은 주파수를 담지 못한다) */
  floor: number;
  /** 가장 큰 줄의 주파수 [Hz] (5 Hz 위) */
  topHz: number;
  /** 대역 신호의 첨도 */
  bandKurtosis: number;
}

/** 엔벨로프 분석 한 번 (대역 [f1, f2]) */
export function analyzeEnvelope(sig: EnvSignal, f1: number, f2: number, fMax = 1000): EnvAnalysis {
  const env = envelopeSpectrum(sig.X, ENV.fs, f1, f2, fMax);
  const tol = 3;
  const lines = [1, 2, 3].map((k) => peakNear(env.freq, env.amp, k * sig.faultHz, tol));
  const fTop = Math.min(fMax, f2 - f1);
  const inRange = Array.from(env.amp).filter((_, k) => env.freq[k] >= 10 && env.freq[k] <= fTop).sort((a, b) => a - b);
  let top = 0;
  for (let k = 0; k < env.amp.length; k++) if (env.freq[k] > 5 && env.amp[k] > env.amp[top]) top = k;
  return { env, lines, floor: inRange[Math.floor(inRange.length / 2)], topHz: env.freq[top], bandKurtosis: kurtosis(env.band) };
}

export interface SkAnalysis {
  kg: Kurtogram;
  sk: ReturnType<typeof spectralKurtosis>;
  best: EnvAnalysis;
  /** 원신호의 첨도 */
  rawKurtosis: number;
}

const skCache = new Map<string, SkAnalysis>();

/** Kurtogram + STFT의 SK(f) + 최댓값 칸의 엔벨로프 분석 */
export function analyzeKurtogram(o: EnvSignalOptions, maxLevel = 6): SkAnalysis {
  const key = JSON.stringify([o, maxLevel]);
  const hit = skCache.get(key);
  if (hit) return hit;
  const sig = envSignal(o);
  const kg = kurtogram(sig.X, ENV.fs, maxLevel);
  const out: SkAnalysis = { kg, sk: spectralKurtosis(sig.x, ENV.fs, 64), best: analyzeEnvelope(sig, kg.best.f1, kg.best.f2), rawKurtosis: kurtosis(sig.x) };
  if (skCache.size > 24) skCache.clear();
  skCache.set(key, out);
  return out;
}
