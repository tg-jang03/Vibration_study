/**
 * P7-6 "기어"의 설명용 기어 쌍 신호와 진단 계산 (LAB-GEAR-01 · LAB-GEAR-02, 본문 그림). 순수 함수, SI (가속도 m/s²).
 *
 * 기계: P7-1의 감속기 — 입력 피니언 23이빨 1490 rpm(f₁ = 24.83 Hz) ↔ 출력 기어 61이빨(f₂ = 9.363 Hz), 맞물림 GMF = 571.2 Hz.
 * 하우징 가속도 = 맞물림 성분(GMF 1·2·3배, 두 축의 회전으로 진폭·위상 변조)
 *              + 맞물림마다의 짧은 충격(이빨마다 다른 오차, 맞물림 공진 2.6 kHz를 울림) + 두 축의 1X + 흰 잡음.
 * 맞물림은 n번째마다 피니언 이빨 n mod z₁과 기어 이빨 n mod z₂가 만난다고 세어(맞물림 번호 n), 결함을 이빨에 붙인다.
 * 결함:
 *  - 마모: 맞물림 2·3배가 커지고, 상한 기어의 이빨마다 다른 오차가 커진다 (그 기어의 1X 간격 측대역, 공진 대역 상승)
 *  - 편심: 그 기어가 한 바퀴에 한 번 맞물림을 세게·약하게(진폭 변조) + 앞서고 늦게(위상 변조) → GMF ± 1X 한두 쌍
 *  - 깨진 이: 그 이빨이 맞물리는 짧은 동안 맞물림이 끊기고(진폭·위상) 큰 충격 → 그 기어의 1X 간격 측대역이 넓게 많이
 *  - 백래시(이 사이 틈 과다): 부하가 가벼우면 이가 떨어졌다 다시 부딪힌다 → 맞물림마다 크기가 제각각인 충격, 부하를 올리면 줄어든다
 *  - 헌팅 투스: 피니언 6번·기어 18번 이빨이 함께 상했다 → 두 이빨이 만나는 LCM(z₁, z₂)번 맞물림마다 큰 충격
 * 맞물림 성분과 이빨 충격은 부하에 비례한다 (0.3 + 0.7 × 부하). 크기는 판정 기준이 아니다.
 */
import { realCepstrum, type Cepstrum } from '../dsp/cepstrum';
import { analyticSignal, magnitude } from '../dsp/envelope';
import { createRng } from '../dsp/random';
import { singleSidedSpectrum, type SingleSidedSpectrum } from '../dsp/spectrum';
import { crestFactor, kurtosis, rms } from '../dsp/stats';
import { removeOrders, synchronousAverage } from '../dsp/tsa';
import { pooledDb, toneAmp } from './bearing';
import { G } from './synth';

export function gcd(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1) throw new RangeError('잇수는 1 이상의 정수여야 한다');
  while (b) [a, b] = [b, a % b];
  return a;
}
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

export interface GearPair {
  z1: number;
  z2: number;
  /** 피니언(입력)·기어(출력) 회전 주파수 [Hz] */
  f1: number;
  f2: number;
  /** 맞물림 주파수 = z₁f₁ = z₂f₂ */
  gmf: number;
  gcd: number;
  lcm: number;
  /** 헌팅 투스 주파수 = GMF / LCM(z₁, z₂) = f₁·GCD/z₂, 그 주기 [s] */
  fHT: number;
  htPeriod: number;
  /** 한 헌팅 주기 동안 피니언·기어가 도는 바퀴 수 = LCM/z₁, LCM/z₂ */
  pinionRevs: number;
  gearRevs: number;
}

/** 피니언 z₁이빨(회전 f₁)과 기어 z₂이빨의 맞물림·헌팅 투스 주파수 */
export function gearPair(z1: number, z2: number, f1: number): GearPair {
  if (!(f1 > 0)) throw new RangeError('회전 주파수는 양수여야 한다');
  const g = gcd(z1, z2);
  const l = lcm(z1, z2);
  const gmf = z1 * f1;
  return { z1, z2, f1, f2: gmf / z2, gmf, gcd: g, lcm: l, fHT: gmf / l, htPeriod: l / gmf, pinionRevs: l / z1, gearRevs: l / z2 };
}

export const GEAR_DEMO = {
  z1: 23,
  z2: 61,
  rpm: 1490,
  fs: 8192,
  n: 65536,
  /** 맞물림 1·2·3배 [g] (부하 100 %)와 위상 */
  mesh: [1.0, 0.35, 0.15],
  meshPhase: [0.3, 1.1, 2.0],
  /** 건전한 기어도 두 축 회전으로 조금 변조된다 (진폭 변조 깊이) */
  baseMod: 0.015,
  /** 맞물림 공진 */
  res: { f: 2600, zeta: 0.05 },
  /** 맞물림마다의 기본 충격과 이빨마다 다른 오차(표준편차) [g] */
  hit0: 0.05,
  toothErr: 0.008,
  /** 두 축의 1X [g] */
  oneX: [0.02, 0.012],
  /** 흰 잡음 [g] */
  noise: 0.03,
  /** 맞물림 n의 시각 = (n + offset)/GMF */
  offset: 0.3,
  /** 깨진 이·헌팅 투스의 결함 이빨 (0부터 센 번호: 피니언 6번째, 기어 18번째) */
  pinionTooth: 5,
  gearTooth: 17,
  /** 깨진 이가 맞물림을 끊는 폭 (맞물림 단위 표준편차) */
  brokenWidth: 0.7,
  /** 깨진 이의 충격 [g] (× 정도). 파형에서 맞물림 물결 봉우리의 약 1.8배로 보이게 둔다 */
  brokenHit: 6,
  /** TSA 한 바퀴 샘플 수 (각도 재샘플링을 마친 신호로 둔다, P5-4) */
  spr: 1024,
  seed: 61,
} as const;

export const GEAR_PAIR = gearPair(GEAR_DEMO.z1, GEAR_DEMO.z2, GEAR_DEMO.rpm / 60);

export type GearFault = 'healthy' | 'wear' | 'eccentric' | 'broken' | 'backlash' | 'hunting';
export type GearSide = 'pinion' | 'gear';

export const GEAR_FAULTS: GearFault[] = ['healthy', 'wear', 'eccentric', 'broken', 'backlash', 'hunting'];
export const GEAR_FAULT_LABEL: Record<GearFault, string> = {
  healthy: '건전',
  wear: '마모',
  eccentric: '편심',
  broken: '깨진 이',
  backlash: '백래시 과다',
  hunting: '헌팅 투스 (두 이빨이 함께 상함)',
};
export const SIDE_LABEL: Record<GearSide, string> = { pinion: '피니언 (입력 23이빨)', gear: '기어 (출력 61이빨)' };
/** 결함 기어(피니언·기어)를 고르는 결함 */
export const SIDED: Record<GearFault, boolean> = { healthy: false, wear: true, eccentric: true, broken: true, backlash: false, hunting: false };

export interface GearOptions {
  fault: GearFault;
  side: GearSide;
  /** 결함 정도 0 ~ 1 */
  severity: number;
  /** 부하 0.2 ~ 1 */
  load: number;
}

export const DEFAULT_GEAR: GearOptions = { fault: 'healthy', side: 'gear', severity: 0.6, load: 0.8 };

// 시각과 상관없이 맞물림 번호마다 같은 값을 주는 난수 (TSA처럼 다른 시각에 다시 찍어도 같은 신호)
function hash01(n: number, salt: number): number {
  let h = (Math.imul(n | 0, 0x9e3779b1) ^ Math.imul(salt | 0, 0x85ebca77)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return (h + 0.5) / 4294967296;
}
function hashNormal(n: number, salt: number): number {
  return Math.sqrt(-2 * Math.log(hash01(n, salt))) * Math.cos(2 * Math.PI * hash01(n, salt + 7919));
}

const mod = (n: number, z: number) => ((n % z) + z) % z;
/** 고리 위의 거리 (z칸 고리에서 a와 b 사이) */
const ringDist = (a: number, b: number, z: number) => {
  const d = mod(a - b, z);
  return Math.min(d, z - d);
};

interface Model {
  o: GearOptions;
  loadF: number;
  /** 맞물림 1·2·3배 배율 */
  harm: [number, number, number];
  errP: Float64Array;
  errG: Float64Array;
  c0: number;
  rattle: number;
}

function buildModel(o: GearOptions): Model {
  const d = GEAR_DEMO;
  const s = Math.min(1, Math.max(0, o.severity));
  const load = Math.min(1, Math.max(0.2, o.load));
  const rng = createRng(d.seed);
  const errP = Float64Array.from({ length: d.z1 }, () => d.toothErr * rng.normal());
  const errG = Float64Array.from({ length: d.z2 }, () => d.toothErr * rng.normal());
  // 마모: 상한 기어의 이빨마다 오차가 커진다 (같은 난수열을 늘 같은 순서로 꺼낸다)
  const wearP = Float64Array.from({ length: d.z1 }, () => rng.normal());
  const wearG = Float64Array.from({ length: d.z2 }, () => rng.normal());
  let harm: [number, number, number] = [1, 1, 1];
  let c0: number = d.hit0;
  let rattle = 0;
  if (o.fault === 'wear') {
    harm = [1 + 0.2 * s, 1 + 2.5 * s, 1 + 4 * s];
    c0 += 0.1 * s;
    const w = o.side === 'pinion' ? wearP : wearG;
    const e = o.side === 'pinion' ? errP : errG;
    for (let i = 0; i < e.length; i++) e[i] += 0.3 * s * w[i];
  }
  if (o.fault === 'backlash') {
    const light = (1 - load) / 0.8;
    harm = [1, 1 + 1.5 * s * light, 1 + 2.5 * s * light];
    rattle = 0.6 * s * light;
  }
  return { o: { ...o, severity: s, load }, loadF: 0.3 + 0.7 * load, harm, errP, errG, c0, rattle };
}

/** 맞물림 n의 충격 크기 [g] (부하 배율 전) */
function hitAmp(m: Model, n: number): number {
  const d = GEAR_DEMO;
  const p = mod(n, d.z1);
  const g = mod(n, d.z2);
  let a = m.c0 + m.errP[p] + m.errG[g];
  const s = m.o.severity;
  if (m.o.fault === 'broken') {
    if (m.o.side === 'pinion' && p === d.pinionTooth) a += d.brokenHit * s;
    if (m.o.side === 'gear' && g === d.gearTooth) a += d.brokenHit * s;
  }
  if (m.o.fault === 'hunting') {
    if (p === d.pinionTooth) a += 0.3 * s;
    if (g === d.gearTooth) a += 0.3 * s;
    if (p === d.pinionTooth && g === d.gearTooth) a += 4 * s;
  }
  return a;
}

/** 모델 신호를 임의의 시각들에서 찍는다 (잡음 제외) [m/s²] */
function evalModel(m: Model, times: ArrayLike<number>): Float64Array {
  const d = GEAR_DEMO;
  const { f1, f2, gmf } = GEAR_PAIR;
  const s = m.o.severity;
  const wn = 2 * Math.PI * d.res.f;
  const decay = d.res.zeta * wn;
  const wd = wn * Math.sqrt(1 - d.res.zeta ** 2);
  const ringLen = 6 / decay;
  const back = Math.ceil(ringLen * gmf) + 1;
  const ring = (tau: number) => (tau >= 0 && tau < ringLen ? Math.exp(-decay * tau) * Math.sin(wd * tau) : 0);
  const side = m.o.side;
  const ecc = m.o.fault === 'eccentric';
  const broken = m.o.fault === 'broken';
  const zS = side === 'pinion' ? d.z1 : d.z2;
  const fS = side === 'pinion' ? f1 : f2;
  const toothS = side === 'pinion' ? d.pinionTooth : d.gearTooth;
  const out = new Float64Array(times.length);
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const th1 = 2 * Math.PI * f1 * t;
    const th2 = 2 * Math.PI * f2 * t;
    const thS = 2 * Math.PI * fS * t;
    const u = gmf * t - d.offset;
    // 맞물림 성분: 진폭 a, 위상 β (맞물림 1배의 rad, h배에는 h배)
    let a = 1 + d.baseMod * Math.cos(th1 + 0.5) + d.baseMod * Math.cos(th2 + 1.2);
    let beta = 0;
    if (ecc) {
      a += 0.5 * s * Math.cos(thS + 0.4);
      beta += 0.35 * s * Math.cos(thS + 0.4);
    }
    if (broken) {
      const dist = ringDist(u, toothS, zS);
      const w = Math.exp(-(dist * dist) / (2 * d.brokenWidth ** 2));
      a *= 1 - 0.8 * s * w;
      beta += 1.0 * s * w;
    }
    const phi = 2 * Math.PI * gmf * t;
    let v = 0;
    for (let h = 0; h < 3; h++) v += d.mesh[h] * m.harm[h] * a * Math.cos((h + 1) * (phi + beta) + d.meshPhase[h]);
    v *= m.loadF;
    // 맞물림마다의 충격 (공진을 울림)
    const nHi = Math.floor(u);
    for (let n = nHi; n > nHi - back; n--) {
      const tau = t - (n + d.offset) / gmf;
      if (tau >= ringLen) break;
      v += m.loadF * hitAmp(m, n) * ring(tau);
      // 백래시: 이가 떨어졌다가 맞물림 사이에 다시 부딪힌다 (크기·시각이 맞물림마다 제각각)
      if (m.rattle > 0) {
        const tr = t - (n + d.offset + 0.5 + 0.08 * hashNormal(n, 3)) / gmf;
        v += m.rattle * Math.abs(1 + 0.6 * hashNormal(n, 1)) * ring(tr);
      }
    }
    // 1X (편심이면 그 기어의 1X가 커진다)
    v += d.oneX[0] * Math.cos(th1 + 0.2) + d.oneX[1] * Math.cos(th2 + 0.9);
    if (ecc) v += 0.04 * s * Math.cos(thS + 0.4);
    out[i] = v * G;
  }
  return out;
}

export interface GearSignal {
  o: GearOptions;
  fs: number;
  /** 하우징 가속도 [m/s²] */
  acc: Float64Array;
}

const optKey = (o: GearOptions) => `${o.fault}|${SIDED[o.fault] ? o.side : '-'}|${o.severity.toFixed(3)}|${o.load.toFixed(3)}`;
const sigCache = new Map<string, GearSignal>();

/** 시간 기록 (f_s 8192 Hz, 8 s) */
export function gearSignal(o: GearOptions): GearSignal {
  const key = optKey(o);
  const hit = sigCache.get(key);
  if (hit) return hit;
  const { fs, n } = GEAR_DEMO;
  const m = buildModel(o);
  const acc = evalModel(m, Float64Array.from({ length: n }, (_, i) => i / fs));
  const rng = createRng(GEAR_DEMO.seed + 500);
  for (let i = 0; i < n; i++) acc[i] += GEAR_DEMO.noise * G * rng.normal();
  const out = { o: m.o, fs, acc };
  if (sigCache.size > 24) sigCache.clear();
  sigCache.set(key, out);
  return out;
}

/** 맞물림 GMF ± k·f 측대역 (k = 1 ~ kMax)의 크기 [m/s²], 낮은 쪽 먼저 */
export function sidebands(freq: ArrayLike<number>, amp: ArrayLike<number>, center: number, spacing: number, kMax: number) {
  const lo: number[] = [];
  const hi: number[] = [];
  for (let k = 1; k <= kMax; k++) {
    lo.push(toneAmp(freq, amp, center - k * spacing));
    hi.push(toneAmp(freq, amp, center + k * spacing));
  }
  return { lo, hi };
}

export interface GearAnalysis {
  spec: SingleSidedSpectrum;
  /** 0 ~ 3.5 kHz dB re 1 g (8칸 묶음 최댓값) */
  accDb: { x: number[]; y: number[] };
  /** GMF ± 125 Hz dB re 1 g (2칸 묶음 최댓값) */
  zoomDb: { x: number[]; y: number[] };
  readouts: {
    /** GMF·2×·3× 줄 [g] */
    gmf: number;
    gmf2: number;
    gmf3: number;
    /** 측대역 ±1 ~ ±6의 RSS ÷ GMF — 피니언 간격(f₁), 기어 간격(f₂) */
    sbPinion: number;
    sbGear: number;
    /** GMF의 1 %(−40 dB)를 넘는 측대역 수 (±1 ~ ±15) */
    nPinion: number;
    nGear: number;
    /** 맞물림 공진 대역(2.2 ~ 3.0 kHz) RMS [g] */
    resRms: number;
    rmsG: number;
    crest: number;
    kurtosis: number;
  };
}

const aCache = new Map<string, GearAnalysis>();
export const RES_BAND: [number, number] = [2200, 3000];
/** 측대역을 셀 때: GMF의 ratio배를 넘는 줄, ±1 ~ ±kMax */
export const SB_COUNT = { ratio: 0.01, kMax: 15 } as const;
export const ZOOM_HALF = 125;

export function analyzeGear(o: GearOptions): GearAnalysis {
  const key = optKey(o);
  const hit = aCache.get(key);
  if (hit) return hit;
  const sig = gearSignal(o);
  const { gmf, f1, f2 } = GEAR_PAIR;
  const spec = singleSidedSpectrum({ fs: sig.fs, x: sig.acc }, { window: 'hann' });
  const fr = spec.frequency;
  const am = spec.amplitude;
  const g1 = toneAmp(fr, am, gmf);
  const sb = (sp: number, kMax: number) => sidebands(fr, am, gmf, sp, kMax);
  const rss = (sp: number) => {
    const { lo, hi } = sb(sp, 6);
    return Math.sqrt([...lo, ...hi].reduce((acc, v) => acc + v * v, 0)) / g1;
  };
  const count = (sp: number) => {
    const { lo, hi } = sb(sp, SB_COUNT.kMax);
    return [...lo, ...hi].filter((v) => v > SB_COUNT.ratio * g1).length;
  };
  let pRes = 0;
  fr.forEach((f, k) => {
    if (f >= RES_BAND[0] && f <= RES_BAND[1]) pRes += am[k] ** 2;
  });
  const zoomFrom = fr.findIndex((f) => f >= gmf - ZOOM_HALF);
  const zoomTo = fr.findIndex((f) => f > gmf + ZOOM_HALF);
  const zoom = pooledDb(fr.slice(zoomFrom, zoomTo), am.slice(zoomFrom, zoomTo), 2);
  const out: GearAnalysis = {
    spec,
    accDb: pooledDb(fr, am, 8, 3500),
    zoomDb: zoom,
    readouts: {
      gmf: g1 / G,
      gmf2: toneAmp(fr, am, 2 * gmf) / G,
      gmf3: toneAmp(fr, am, 3 * gmf) / G,
      sbPinion: rss(f1),
      sbGear: rss(f2),
      nPinion: count(f1),
      nGear: count(f2),
      // 대역 RMS = √(Σ 칸² ÷ 2 ÷ ENBW 1.5칸)
      resRms: Math.sqrt(pRes / 2 / 1.5) / G,
      rmsG: rms(sig.acc) / G,
      crest: crestFactor(sig.acc),
      kurtosis: kurtosis(sig.acc),
    },
  };
  if (aCache.size > 24) aCache.clear();
  aCache.set(key, out);
  return out;
}

/**
 * 긴 기록 보기용: 포락선(해석 신호의 크기, P5-6)을 block점마다 최댓값으로 줄인 것 [g].
 * 샘플이 공진 울림의 봉우리를 비껴 찍혀도 충격 크기가 고르게 보인다. 길이는 2의 거듭제곱.
 */
export function envelopeHold(acc: ArrayLike<number>, fs: number, block: number) {
  const env = magnitude(analyticSignal(acc, fs));
  const t: number[] = [];
  const y: number[] = [];
  for (let k = 0; k + block <= env.length; k += block) {
    let m = 0;
    for (let j = 0; j < block; j++) m = Math.max(m, env[k + j]);
    t.push((k + block / 2) / fs);
    y.push(m / G);
  }
  return { t, y };
}

// ── TSA (LAB-GEAR-02) ──
export type TsaSignal = 'tsa' | 'residual' | 'difference';
export const TSA_LABEL: Record<TsaSignal, string> = {
  tsa: 'TSA (한 바퀴 평균)',
  residual: 'Residual (맞물림 하모닉·1X·2X를 뺀 것)',
  difference: 'Difference (Residual에서 맞물림 ±1 측대역도 뺀 것)',
};

/** TSA에서 빼는 차수: Residual = 0·1·2차 + 맞물림의 모든 하모닉, Difference = 그 위에 맞물림 하모닉 ± 1차 */
export function removedOrders(z: number, spr: number, kind: TsaSignal): number[] {
  if (kind === 'tsa') return [];
  const out = new Set<number>([0, 1, 2]);
  for (let h = 1; h * z <= spr / 2; h++) {
    out.add(h * z);
    if (kind === 'difference') {
      out.add(h * z - 1);
      if (h * z + 1 <= spr / 2) out.add(h * z + 1);
    }
  }
  return [...out].sort((a, b) => a - b);
}

export interface GearTsa {
  side: GearSide;
  revs: number;
  /** 한 바퀴 각도 [°] */
  angle: Float64Array;
  /** 평균한 한 바퀴 (TSA·Residual·Difference) [g] */
  tsa: Float64Array;
  residual: Float64Array;
  difference: Float64Array;
  /** Difference 신호의 첨도 (FM4, 건전 ≈ 3) */
  fm4: number;
  /** Residual의 |최댓값| 자리 [°]와 그 자리의 이빨 번호 (1부터) */
  peakAngle: number;
  peakTooth: number;
  /** 결함 이빨이 맞물리는 각도 [°] (정답 표시용) */
  defectAngle: number;
}

const tCache = new Map<string, GearTsa>();

/** side 축의 키페이저 기준 각도 재샘플링 + revs바퀴 TSA (그 축이 0°에서 출발) */
export function gearTsa(o: GearOptions, side: GearSide, revs: number): GearTsa {
  const key = `${optKey(o)}|${side}|${revs}`;
  const hit = tCache.get(key);
  if (hit) return hit;
  const d = GEAR_DEMO;
  const spr = d.spr;
  const z = side === 'pinion' ? d.z1 : d.z2;
  const f = side === 'pinion' ? GEAR_PAIR.f1 : GEAR_PAIR.f2;
  const m = buildModel(o);
  const times = Float64Array.from({ length: revs * spr }, (_, i) => i / (spr * f));
  const x = evalModel(m, times);
  const rng = createRng(d.seed + 900 + (side === 'pinion' ? 0 : 1));
  for (let i = 0; i < x.length; i++) x[i] += d.noise * G * rng.normal();
  const avg = synchronousAverage(x, spr, revs).map((v) => v / G);
  const residual = removeOrders(avg, removedOrders(z, spr, 'residual'));
  const difference = removeOrders(avg, removedOrders(z, spr, 'difference'));
  let kMax = 0;
  for (let k = 1; k < spr; k++) if (Math.abs(residual[k]) > Math.abs(residual[kMax])) kMax = k;
  const peakAngle = (360 * kMax) / spr;
  const tooth = side === 'pinion' ? d.pinionTooth : d.gearTooth;
  const out: GearTsa = {
    side,
    revs,
    angle: Float64Array.from({ length: spr }, (_, k) => (360 * k) / spr),
    tsa: avg,
    residual,
    difference,
    fm4: kurtosis(difference),
    peakAngle,
    peakTooth: Math.floor((peakAngle / 360) * z - d.offset + 1e-9) + 1,
    defectAngle: (360 * (tooth + d.offset)) / z,
  };
  if (tCache.size > 40) tCache.clear();
  tCache.set(key, out);
  return out;
}

// ── 켑스트럼 ──
const cCache = new Map<string, Cepstrum>();
export function gearCepstrum(o: GearOptions): Cepstrum {
  const key = optKey(o);
  const hit = cCache.get(key);
  if (hit) return hit;
  const sig = gearSignal(o);
  const c = realCepstrum(sig.acc, sig.fs);
  if (cCache.size > 24) cCache.clear();
  cCache.set(key, c);
  return c;
}

/** τ 둘레 ±2칸의 켑스트럼 최댓값 */
export function cepAt(c: Cepstrum, tau: number): number {
  const dq = c.quefrency[1] - c.quefrency[0];
  const k0 = Math.round(tau / dq);
  let m = -Infinity;
  for (let k = Math.max(0, k0 - 2); k <= Math.min(c.quefrency.length - 1, k0 + 2); k++) m = Math.max(m, c.c[k]);
  return m;
}
