/**
 * P5-7 "켑스트럼 · 자기상관 · 특징량"의 예시 신호. 본문 그림과 랩(LAB-CEP-01 · LAB-FEAT-01)이 같이 쓴다. 순수 함수, SI(가속도 m/s²).
 *
 * 기어 상자 (LAB-CEP-01, 설명용): 피니언 24이빨 1500 rpm(f₁ = 25 Hz) ↔ 기어 37이빨(f₂ = 16.22 Hz), 맞물림 600 Hz.
 *  맞물림 1·2·3배(1, 0.5, 0.3 g)가 피니언의 국부 결함(한 바퀴에 한 번 짧은 펄스 → f₁ 간격 측대역 여러 쌍)과
 *  기어의 국부 결함(f₂ 간격)으로 진폭 변조된다. + 흰 잡음.
 * 결함 진행 (LAB-FEAT-01, 설명용): 베어링 하우징 가속도 = 1X 0.1 g + 바탕 잡음 + 외륜 결함 충격(BPFO, 공진 3.3 kHz, ζ 0.1).
 *  진행도 s(0 ~ 1)에 따라 처음엔 드문 충격이 커지고(첨도·CF 상승), 나중엔 손상이 넓어져 충격이 여기저기서 자주 생기고
 *  넓은 대역 잡음이 커진다(RMS 상승, 첨도·CF 하락).
 */
import { autocorrelation, combLifter, lowLifter, realCepstrum, type Cepstrum } from './dsp/cepstrum';
import { createRng } from './dsp/random';
import { crestFactor, kurtosis, peak, rms, skewness } from './dsp/stats';

export const G = 9.80665;

// ── 기어 상자 ──
export const GEAR = {
  fs: 4096,
  n: 8192,
  f1: 25,
  z1: 24,
  /** 37: 24와 공약수가 없는 이빨 수(같은 이빨끼리 자주 만나지 않게 하는 설계) → 같은 이빨 쌍은 피니언 37바퀴(1.48 s)마다 만난다 */
  z2: 37,
  meshAmps: [1, 0.5, 0.3].map((v) => v * G),
  /** 펄스 모양: 결함 펄스의 하모닉 크기 exp(−(k/K)²) */
  pulseK: 8,
  seed: 71,
} as const;
export const MESH = GEAR.f1 * GEAR.z1;
export const F2 = MESH / GEAR.z2;

export interface GearOptions {
  /** 피니언 결함 변조 깊이 (0 ~ 0.5) */
  m1: number;
  /** 기어 결함 변조 깊이 */
  m2: number;
  /** 흰 잡음 σ [m/s²] */
  noise: number;
}

export const DEFAULT_GEAR: GearOptions = { m1: 0.3, m2: 0.2, noise: 0.05 * G };

/** 한 바퀴에 한 번 오는 짧은 펄스 (평균 0): Σ_k exp(−(k/K)²) cos(2πk f t) 를 최댓값 1로 */
function pulseTrain(f: number, t: number): number {
  let s = 0;
  let norm = 0;
  for (let k = 1; k <= 3 * GEAR.pulseK; k++) {
    const g = Math.exp(-((k / GEAR.pulseK) ** 2));
    s += g * Math.cos(2 * Math.PI * k * f * t);
    norm += g;
  }
  return s / norm;
}

const gearCache = new Map<string, { t: Float64Array; x: Float64Array }>();

export function gearSignal(o: GearOptions) {
  const key = JSON.stringify(o);
  const hit = gearCache.get(key);
  if (hit) return hit;
  const { fs, n } = GEAR;
  const rng = createRng(GEAR.seed);
  const t = Float64Array.from({ length: n }, (_, i) => i / fs);
  const x = t.map((tt) => {
    const mod = 1 + o.m1 * pulseTrain(GEAR.f1, tt) + o.m2 * pulseTrain(F2, tt + 0.013);
    let v = 0;
    GEAR.meshAmps.forEach((a, h) => {
      v += a * mod * Math.cos(2 * Math.PI * (h + 1) * MESH * tt + 0.7 * h);
    });
    return v + o.noise * rng.normal();
  });
  const out = { t, x };
  if (gearCache.size > 20) gearCache.clear();
  gearCache.set(key, out);
  return out;
}

export type LifterMode = 'none' | 'pinion' | 'gear' | 'low';

export interface GearAnalysis {
  cep: Cepstrum;
  /** 리프터링한 스펙트럼 (none이면 원래 진폭) */
  edited: Float64Array;
  /** 켑스트럼 봉우리: 1/f₁ = 40 ms, 1/f₂ = 61.7 ms */
  peak1: number;
  peak2: number;
  /** 2 ~ 200 ms에서 가장 큰 켑스트럼 값의 quefrency [s] */
  topQuefrency: number;
  /** 맞물림 ± f₁, ± f₂ 측대역 높이 (원래 / 리프터 후) [m/s²] */
  sb1: [number, number];
  sb2: [number, number];
  /** 자기상관 */
  acf: Float64Array;
}

const near = (freq: ArrayLike<number>, a: ArrayLike<number>, f: number, tol = 1) => {
  let m = 0;
  for (let k = 0; k < freq.length; k++) if (Math.abs(freq[k] - f) <= tol) m = Math.max(m, a[k]);
  return m;
};

export function analyzeGear(o: GearOptions, lifter: LifterMode = 'none'): GearAnalysis {
  const { fs } = GEAR;
  const { x } = gearSignal(o);
  const cep = realCepstrum(x, fs);
  const tol = 1.5 / fs;
  const edited =
    lifter === 'pinion' ? combLifter(cep, 1 / GEAR.f1, tol) : lifter === 'gear' ? combLifter(cep, 1 / F2, tol) : lifter === 'low' ? lowLifter(cep, 0.005) : cep.amp;
  let top = 0;
  let topV = -Infinity;
  for (let q = 0; q < cep.quefrency.length; q++) {
    const tq = cep.quefrency[q];
    if (tq >= 0.002 && tq <= 0.2 && cep.c[q] > topV) {
      topV = cep.c[q];
      top = tq;
    }
  }
  const pk = (tau: number) => {
    let m = -Infinity;
    for (let q = 0; q < cep.quefrency.length; q++) if (Math.abs(cep.quefrency[q] - tau) <= 2 / fs) m = Math.max(m, cep.c[q]);
    return m;
  };
  return {
    cep,
    edited,
    peak1: pk(1 / GEAR.f1),
    peak2: pk(1 / F2),
    topQuefrency: top,
    sb1: [near(cep.freq, cep.amp, MESH + GEAR.f1), near(cep.freq, edited, MESH + GEAR.f1)],
    sb2: [near(cep.freq, cep.amp, MESH + F2), near(cep.freq, edited, MESH + F2)],
    acf: autocorrelation(x),
  };
}

// ── 결함 진행과 특징량 ──
export const FEAT = {
  fs: 16384,
  n: 16384,
  fr: 50,
  bpfo: 179.24,
  resonance: 3300,
  zeta: 0.1,
  a1: 0.1 * G,
  baseNoise: 0.05 * G,
  seed: 83,
  stages: 41,
} as const;

/** 진행도 s의 모델 값: 결함 충격 크기, 여기저기 생기는 충격의 빈도 [1/s]와 크기, 넓은 대역 잡음 */
export function stageModel(s: number) {
  const smooth = (a: number, b: number) => {
    const u = Math.min(1, Math.max(0, (s - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  return {
    impact: 2.0 * G * smooth(0.05, 0.55),
    spreadRate: 6 * FEAT.bpfo * smooth(0.5, 1),
    spreadAmp: 1.0 * G * smooth(0.5, 1),
    noise: FEAT.baseNoise + 0.6 * G * smooth(0.6, 1),
  };
}

const featCache = new Map<number, { x: Float64Array; features: Features }>();

export interface Features {
  rms: number;
  peak: number;
  crest: number;
  kurtosis: number;
  skewness: number;
}

export function features(x: ArrayLike<number>): Features {
  return { rms: rms(x), peak: peak(x), crest: crestFactor(x), kurtosis: kurtosis(x), skewness: skewness(x) };
}

/** 진행도 s의 신호와 특징량 (시드 고정: 같은 s면 같은 결과) */
export function featureSignal(s: number) {
  const key = Math.round(s * 1000);
  const hit = featCache.get(key);
  if (hit) return hit;
  const { fs, n } = FEAT;
  const m = stageModel(s);
  const rng = createRng(FEAT.seed);
  const x = new Float64Array(n);
  const wn = 2 * Math.PI * FEAT.resonance;
  const wd = wn * Math.sqrt(1 - FEAT.zeta ** 2);
  const ring = (ti: number, a: number) => {
    const i0 = Math.ceil(ti * fs);
    for (let i = Math.max(0, i0); i < Math.min(n, i0 + Math.round(0.006 * fs)); i++) {
      const tau = i / fs - ti;
      x[i] += a * Math.exp(-FEAT.zeta * wn * tau) * Math.sin(wd * tau);
    }
  };
  // 결함 충격 (BPFO, 박자 1 % 흔들림)
  for (let k = 0; k / FEAT.bpfo < n / fs; k++) ring((k + 0.01 * rng.normal()) / FEAT.bpfo, m.impact * Math.max(0, 1 + 0.1 * rng.normal()));
  // 넓어진 손상: 임의 시각의 충격 (포아송)
  let tt = 0;
  for (;;) {
    tt += -Math.log(Math.max(1e-12, rng.uniform())) / Math.max(1e-9, m.spreadRate);
    if (tt >= n / fs || m.spreadRate === 0) break;
    ring(tt, m.spreadAmp * (0.5 + rng.uniform()));
  }
  for (let i = 0; i < n; i++) x[i] += FEAT.a1 * Math.cos((2 * Math.PI * FEAT.fr * i) / fs) + m.noise * rng.normal();
  const out = { x, features: features(x) };
  if (featCache.size > 100) featCache.clear();
  featCache.set(key, out);
  return out;
}

/** 진행도 0 ~ 1을 stages칸으로 나눈 추세 */
export function featureTrend(stages: number = FEAT.stages) {
  const s = Array.from({ length: stages }, (_, i) => i / (stages - 1));
  return { s, f: s.map((v) => featureSignal(v).features) };
}
