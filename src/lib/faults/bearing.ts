/**
 * 구름베어링 결함 신호 (P7-5, LAB-BRG-01 · LAB-BRG-02). 순수 함수, 내부 단위 SI(가속도 m/s²), 주파수 [Hz].
 *
 * - 결함 주파수는 `lib/machine/frequencies.ts`의 bearingFrequencies(접촉각 포함)에 미끄럼을 더한다 (케이지가 늦게 돈다).
 * - 결함 위치마다 충격의 박자와 크기 변조가 다르다:
 *   외륜 BPFO, 크기 일정(흠이 하중 영역에 멈춰 있음) / 내륜 BPFI, 하중 영역을 1X로 드나듦 /
 *   볼 2×BSF(한 번 자전에 외륜·내륜을 한 번씩, 세기 다름), 볼이 케이지와 함께 하중 영역을 FTF로 드나듦 / 케이지 FTF.
 * - 충격마다 두 공진을 울린다: 부품·하우징 공진 3.3 kHz(ζ 0.05)와 초음파 대역의 공진 24 kHz(ζ 0.03).
 *   기계의 다른 소리(0.5 ~ 12 kHz)가 공진 대역은 덮고 초음파 대역은 조용하다 — 그래서 아주 작은 결함은 초음파 대역에서 먼저 보인다.
 * - 고장 4단계는 흔히 쓰는 설명을 따른 설명용 모델이다: 1 초음파만 → 2 공진 울림 → 3 속도 스펙트럼에 결함 줄·측대역 →
 *   4 박자 흔들림·임의 충격·바닥 상승·1X 증가로 결함 줄이 흐려짐. 크기는 모두 설명용이다 (판정 기준 아님, I-009).
 */
import { bandAnalytic, envelopeSpectrum, ifft, peakNear, spectrumOf, type EnvelopeSpectrum } from '../dsp/envelope';
import { createRng, type Rng } from '../dsp/random';
import { singleSidedSpectrum } from '../dsp/spectrum';
import { kurtosis, rms } from '../dsp/stats';
import { BEARING_6205, bearingFrequencies, type BearingFrequencies, type BearingGeometry } from '../machine/frequencies';
import { integrateSpectral } from '../dsp/filter';
import { G } from './synth';

/** 속도 측정 대역 [Hz] */
export const VEL_BAND: [number, number] = [10, 1000];

export type BearingFault = 'outer' | 'inner' | 'ball' | 'cage';
export type BearingStage = 0 | 1 | 2 | 3 | 4;
export type EnvBand = 'res' | 'ultra';

/**
 * 미끄럼 s를 넣은 결함 주파수: 케이지가 계산보다 s만큼 늦게 돈다고 본다 (설명용).
 * FTF·BSF × (1 − s), BPFO = N_r·FTF는 낮아지고 BPFI = N_r(f_r − FTF)는 높아진다.
 */
export function slippedFrequencies(g: BearingGeometry, fr: number, slip = 0): BearingFrequencies {
  const b = bearingFrequencies(g, fr);
  const ftf = b.ftf * (1 - slip);
  const bsf = b.bsf * (1 - slip);
  return { ftf, bpfo: g.balls * ftf, bpfi: g.balls * (fr - ftf), bsf, bsf2: 2 * bsf };
}

/** 어림값: FTF ≈ 0.4 f_r, BPFO ≈ 0.4 N_r f_r, BPFI ≈ 0.6 N_r f_r (d/D ≈ 0.2, α = 0일 때 맞는 값) */
export function ruleOfThumb(balls: number, fr: number) {
  return { ftf: 0.4 * fr, bpfo: 0.4 * balls * fr, bpfi: 0.6 * balls * fr };
}

/** 결함 위치마다 충격이 되풀이되는 주파수 */
export function defectRate(fault: BearingFault, b: BearingFrequencies): number {
  return fault === 'outer' ? b.bpfo : fault === 'inner' ? b.bpfi : fault === 'ball' ? b.bsf2 : b.ftf;
}

export const FAULT_LABEL: Record<BearingFault, string> = { outer: '외륜', inner: '내륜', ball: '볼', cage: '케이지' };
export const RATE_LABEL: Record<BearingFault, string> = { outer: 'BPFO', inner: 'BPFI', ball: '2×BSF', cage: 'FTF' };

/** 예시 기계: P7-1의 전동기-펌프 축 (2극, 3575 rpm, 6205) */
export const BRG_DEMO = {
  rpm: 3575,
  geometry: BEARING_6205,
  slip: 0.01,
  fs: 65536,
  n: 65536,
  res: { f: 3300, zeta: 0.05 },
  ultra: { f: 24000, zeta: 0.03 },
  /** 기계의 다른 소리 (0.5 ~ 12 kHz) [g rms] */
  machineNoiseG: 0.03,
  /** 바탕 잡음 (전 대역) [g rms] */
  whiteG: 0.004,
  bands: { res: [2800, 3800] as [number, number], ultra: [20000, 28000] as [number, number] },
  /** 일반 가속도 측정 대역의 위 끝 [Hz] */
  normalHz: 10000,
  seed: 75,
} as const;

export const DEMO_FR = BRG_DEMO.rpm / 60;
/** 예시 기계의 계산값 (미끄럼 없음)과 실제 신호의 값 (미끄럼 1 %) */
export const DEMO_CALC = bearingFrequencies(BRG_DEMO.geometry, DEMO_FR);
export const DEMO_ACTUAL = slippedFrequencies(BRG_DEMO.geometry, DEMO_FR, BRG_DEMO.slip);

export interface StageSpec {
  name: string;
  /** 충격 하나가 울리는 첫 봉우리 [g]: 초음파 대역 공진 · 부품 공진 */
  ultraG: number;
  resG: number;
  /** 박자 흔들림 (표준편차, 주기의 비율) */
  jitter: number;
  /** 임의 시각 충격: 결함 박자의 몇 배로 자주, 크기 [g] */
  randomRate: number;
  randomG: number;
  /** 속도 스펙트럼의 결함 줄 크기 배율 */
  tones: number;
  /** 1X·2X 속도 [mm/s rms] */
  oneX: number;
  twoX: number;
  /** 넓은 대역 바닥 상승 (0.5 ~ 15 kHz) [g rms] */
  floorG: number;
  /** 결함 주파수 둘레의 낮은 대역 잡음 (80 ~ 1000 Hz 속도) [mm/s rms] */
  haystack: number;
}

export const STAGES: Record<BearingStage, StageSpec> = {
  0: { name: '건전', ultraG: 0, resG: 0, jitter: 0.01, randomRate: 0, randomG: 0, tones: 0, oneX: 1.0, twoX: 0.2, floorG: 0, haystack: 0 },
  1: { name: '1단계', ultraG: 0.25, resG: 0.004, jitter: 0.01, randomRate: 0, randomG: 0, tones: 0, oneX: 1.0, twoX: 0.2, floorG: 0, haystack: 0 },
  2: { name: '2단계', ultraG: 0.6, resG: 0.25, jitter: 0.01, randomRate: 0, randomG: 0, tones: 0, oneX: 1.0, twoX: 0.2, floorG: 0, haystack: 0 },
  3: { name: '3단계', ultraG: 1.5, resG: 1.2, jitter: 0.01, randomRate: 0, randomG: 0, tones: 1, oneX: 1.3, twoX: 0.3, floorG: 0, haystack: 0 },
  4: { name: '4단계', ultraG: 0.8, resG: 0.35, jitter: 0.08, randomRate: 4, randomG: 0.8, tones: 0.5, oneX: 3.0, twoX: 1.0, floorG: 0.2, haystack: 1.2 },
};

/** 3단계부터 속도 스펙트럼에 서는 결함 줄 [Hz, mm/s rms] (tones = 1일 때) */
export function defectTones(fault: BearingFault, b: BearingFrequencies, fr: number): [number, number][] {
  switch (fault) {
    case 'outer':
      return [[b.bpfo, 0.6], [2 * b.bpfo, 0.35], [3 * b.bpfo, 0.18]];
    case 'inner':
      return [[b.bpfi, 0.45], [b.bpfi - fr, 0.22], [b.bpfi + fr, 0.2], [2 * b.bpfi, 0.15]];
    case 'ball':
      return [[b.bsf2, 0.35], [b.bsf2 - b.ftf, 0.18], [b.bsf2 + b.ftf, 0.15], [b.bsf, 0.1]];
    case 'cage':
      return [[b.ftf, 0.45], [2 * b.ftf, 0.18]];
  }
}

/**
 * Hann 스펙트럼에서 성분 하나의 크기: f 둘레 ±half 칸의 제곱합 ÷ ENBW(1.5칸)의 제곱근 (P2-5).
 * 성분이 칸 사이에 걸려도 가리비 손실 없이 제 크기로 읽는다.
 */
export function toneAmp(freq: ArrayLike<number>, amp: ArrayLike<number>, f: number, half = 3): number {
  const df = freq[1] - freq[0];
  const k0 = Math.round(f / df);
  let s = 0;
  for (let k = Math.max(0, k0 - half); k <= Math.min(freq.length - 1, k0 + half); k++) s += amp[k] * amp[k];
  return Math.sqrt(s / 1.5);
}

export interface BearingSignal {
  fault: BearingFault;
  stage: BearingStage;
  fs: number;
  fr: number;
  /** 실제 신호의 결함 주파수 (미끄럼 포함) */
  freqs: BearingFrequencies;
  /** 하우징 가속도 [m/s²] */
  acc: Float64Array;
}

/** 대역 [f1, f2]만 남긴 정규 잡음, RMS = level. diff이면 그 잡음을 속도로 보고 미분한 가속도를 돌려준다 */
function bandNoise(rng: Rng, n: number, fs: number, f1: number, f2: number, level: number, diff = false): Float64Array {
  const X = spectrumOf(Float64Array.from({ length: n }, () => rng.normal()));
  const df = fs / n;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const dre = new Float64Array(n);
  const dim = new Float64Array(n);
  for (let k = 1; k < n / 2; k++) {
    const f = k * df;
    if (f < f1 || f > f2) continue;
    re[k] = X.re[k];
    im[k] = X.im[k];
    re[n - k] = X.re[n - k];
    im[n - k] = X.im[n - k];
    // 미분 = jω 곱하기 (음의 주파수는 −jω)
    const w = 2 * Math.PI * f;
    dre[k] = -w * X.im[k];
    dim[k] = w * X.re[k];
    dre[n - k] = w * X.im[n - k];
    dim[n - k] = -w * X.re[n - k];
  }
  const x = ifft(re, im).re;
  const s = rms(x);
  const scale = s > 0 ? level / s : 0;
  if (!diff) return x.map((v) => v * scale);
  return ifft(dre, dim).re.map((v) => v * scale);
}

const cache = new Map<string, BearingSignal>();

/** 결함 위치·단계의 하우징 가속도 (단계 0 = 건전) */
export function bearingSignal(fault: BearingFault, stage: BearingStage): BearingSignal {
  const key = `${fault}|${stage}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { fs, n } = BRG_DEMO;
  const fr = DEMO_FR;
  const b = DEMO_ACTUAL;
  const st = STAGES[stage];
  const rng = createRng(BRG_DEMO.seed + 10 * stage + ['outer', 'inner', 'ball', 'cage'].indexOf(fault));
  const acc = new Float64Array(n);

  // 정현 성분 (속도 mm/s rms → 가속도)
  const addTone = (f: number, v: number, ph: number) => {
    const w = 2 * Math.PI * f;
    const a = (v / 1000) * Math.SQRT2 * w;
    for (let i = 0; i < n; i++) acc[i] += a * Math.cos((w * i) / fs + ph);
  };
  addTone(fr, st.oneX, 0.3);
  addTone(2 * fr, st.twoX, 1.1);
  if (stage > 0 && st.tones > 0) for (const [f, v] of defectTones(fault, b, fr)) addTone(f, v * st.tones, 2 * Math.PI * rng.uniform());

  // 충격: 두 공진을 함께 울린다
  const resonators = [
    { ...BRG_DEMO.res, g: st.resG },
    { ...BRG_DEMO.ultra, g: st.ultraG },
  ].map((r) => {
    const wn = 2 * Math.PI * r.f;
    return { g: r.g, a: r.zeta * wn, wd: wn * Math.sqrt(1 - r.zeta ** 2), len: Math.round((6 / (r.zeta * wn)) * fs) };
  });
  const hitAt = (ti: number, scale: number) => {
    const i0 = Math.ceil(ti * fs);
    for (const r of resonators) {
      if (r.g === 0) continue;
      const amp = r.g * G * scale;
      for (let i = Math.max(0, i0); i < Math.min(n, i0 + r.len); i++) {
        const tau = i / fs - ti;
        acc[i] += amp * Math.exp(-r.a * tau) * Math.sin(r.wd * tau);
      }
    }
  };
  if (stage > 0) {
    const rate = defectRate(fault, b);
    const T = n / fs;
    const t0 = rng.uniform() / rate;
    for (let k = 0; t0 + k / rate < T; k++) {
      const ti = t0 + (k + st.jitter * rng.normal()) / rate;
      let w = Math.max(0, 1 + 0.1 * rng.normal());
      if (fault === 'inner') w *= 0.55 + 0.45 * Math.cos(2 * Math.PI * fr * ti);
      if (fault === 'ball') w *= (k % 2 === 0 ? 1 : 0.6) * (0.55 + 0.45 * Math.cos(2 * Math.PI * b.ftf * ti));
      // 케이지: 부러진 칸막이가 한 바퀴에 한 번 부딪힌다 — 볼·궤도면 충격보다 약하고 크기가 고르지 않다
      if (fault === 'cage') w *= 0.4 * (0.5 + rng.uniform());
      hitAt(ti, w);
    }
    // 4단계: 손상이 넓어져 아무 때나 생기는 충격
    const nRandom = Math.round(st.randomRate * rate * T);
    for (let k = 0; k < nRandom; k++) {
      const ti = rng.uniform() * T;
      const s = (st.randomG / Math.max(st.resG, 1e-9)) * (0.3 + 1.2 * rng.uniform());
      hitAt(ti, s);
    }
  }

  // 잡음: 바탕(전 대역) + 기계의 다른 소리(0.5 ~ 12 kHz) + 4단계의 바닥 상승·낮은 대역 잡음
  const add = (x: Float64Array) => {
    for (let i = 0; i < n; i++) acc[i] += x[i];
  };
  for (let i = 0; i < n; i++) acc[i] += BRG_DEMO.whiteG * G * rng.normal();
  add(bandNoise(rng, n, fs, 500, 12000, BRG_DEMO.machineNoiseG * G));
  if (st.floorG > 0) add(bandNoise(rng, n, fs, 500, 15000, st.floorG * G));
  if (st.haystack > 0) add(bandNoise(rng, n, fs, 80, 1000, st.haystack / 1000, true));

  const out: BearingSignal = { fault, stage, fs, fr, freqs: b, acc };
  if (cache.size > 24) cache.clear();
  cache.set(key, out);
  return out;
}

export interface BearingAnalysis {
  /** 속도 스펙트럼 0 ~ 1000 Hz [mm/s rms]와 속도 파형 [m/s] (10 Hz 고역 통과) */
  vel: { freq: Float64Array; amp: Float64Array; vel: Float64Array };
  /** 엔벨로프 스펙트럼 0 ~ 1000 Hz [m/s²] — 공진 대역, 초음파 대역 */
  env: Record<EnvBand, EnvelopeSpectrum>;
  /** 일반 측정 대역(0 ~ 10 kHz) 가속도 [m/s²] */
  normal: Float64Array;
  /** 가속도 스펙트럼을 묶어 줄인 dB re 1 g (묶음마다 최댓값) */
  accDb: { x: number[]; y: number[] };
  /** 결함 박자 (실제 신호, 미끄럼 포함) */
  rate: number;
  readouts: {
    velOverall: number;
    vel1X: number;
    velDefect: number;
    accRmsG: number;
    kurtosis: number;
    envRatio: Record<EnvBand, number>;
    ultraRmsG: number;
  };
}

/** 엔벨로프 스펙트럼의 바닥 = 5 ~ 1000 Hz 진폭의 중앙값 */
export function envFloor(e: EnvelopeSpectrum): number {
  const v = Array.from(e.amp).filter((_, k) => e.freq[k] > 5).sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)] ?? 0;
}

/** 가속도 스펙트럼을 group개 칸씩 묶어 최댓값을 dB re 1 g로 (그림·랩 표시용) */
export function pooledDb(freq: ArrayLike<number>, amp: ArrayLike<number>, group: number, fMax = Infinity) {
  const x: number[] = [];
  const y: number[] = [];
  for (let k = 0; k + group <= freq.length && freq[k] <= fMax; k += group) {
    let m = 0;
    for (let j = 0; j < group; j++) m = Math.max(m, amp[k + j]);
    x.push(freq[k + Math.floor(group / 2)]);
    y.push(20 * Math.log10(Math.max(m / G, 1e-7)));
  }
  return { x, y };
}

const aCache = new Map<string, BearingAnalysis>();

export function analyzeBearing(sig: BearingSignal): BearingAnalysis {
  const key = `${sig.fault}|${sig.stage}`;
  const hit = aCache.get(key);
  if (hit && cache.get(key) === sig) return hit;
  const { fs } = sig;
  const X = spectrumOf(sig.acc);
  // 속도: 10 Hz 고역 통과로 적분 (일반 속도 측정 대역 10 ~ 1000 Hz). 충격마다 남는 작은 속도 변화가 쌓여 생기는 저주파 표류를 뺀다
  const v = integrateSpectral(sig.acc, fs, 1, VEL_BAND[0]);
  const vs = singleSidedSpectrum({ fs, x: v }, { window: 'hann' });
  const kEnd = vs.frequency.findIndex((f) => f > VEL_BAND[1]);
  const vel = { freq: vs.frequency.slice(0, kEnd), amp: vs.amplitude.slice(0, kEnd).map((a) => (a * 1000) / Math.SQRT2), vel: v };
  let p2 = 0;
  for (let k = 0; k < vel.freq.length; k++) if (vel.freq[k] >= VEL_BAND[0]) p2 += vel.amp[k] ** 2;
  const env: Record<EnvBand, EnvelopeSpectrum> = {
    res: envelopeSpectrum(X, fs, BRG_DEMO.bands.res[0], BRG_DEMO.bands.res[1], 1000),
    ultra: envelopeSpectrum(X, fs, BRG_DEMO.bands.ultra[0], BRG_DEMO.bands.ultra[1], 1000),
  };
  const normal = bandAnalytic(X, fs, 0, BRG_DEMO.normalHz).re;
  const ultra = bandAnalytic(X, fs, BRG_DEMO.bands.ultra[0], BRG_DEMO.bands.ultra[1]).re;
  const s = singleSidedSpectrum({ fs, x: sig.acc }, { window: 'hann' });
  const rate = defectRate(sig.fault, sig.freqs);
  const tol = Math.max(1.5, 0.004 * rate);
  const ratio = (e: EnvelopeSpectrum) => {
    const fl = envFloor(e);
    return fl > 0 ? peakNear(e.freq, e.amp, rate, tol) / fl : 0;
  };
  const out: BearingAnalysis = {
    vel,
    env,
    normal,
    accDb: pooledDb(s.frequency, s.amplitude, 32),
    rate,
    readouts: {
      // 10 ~ 1000 Hz 대역 RMS = √(Σ 칸² ÷ ENBW 1.5칸)
      velOverall: Math.sqrt(p2 / 1.5),
      vel1X: toneAmp(vel.freq, vel.amp, sig.fr),
      velDefect: toneAmp(vel.freq, vel.amp, rate),
      accRmsG: rms(normal) / G,
      kurtosis: kurtosis(normal),
      envRatio: { res: ratio(env.res), ultra: ratio(env.ultra) },
      ultraRmsG: rms(ultra) / G,
    },
  };
  if (aCache.size > 24) aCache.clear();
  aCache.set(key, out);
  return out;
}
