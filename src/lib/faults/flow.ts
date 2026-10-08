/**
 * P7-8 "유체 · 공력 원인"의 설명용 모델 (LAB-FLOW-01 · 본문 그림). 순수 함수.
 *
 * 펌프: P7-1·LAB-FAULT-01과 같은 2극 전동기 직결 원심 펌프, 3575 rpm, 임펠러 날개 7장 → 날개 통과 VPF = 7X.
 *   운전점 q = Q/Q_BEP (최고 효율점 유량 = 1). 베어링 하우징 수평 속도 [mm/s rms]·가속도 [g rms].
 *  - 날개 통과: VPF = 0.6/g × (1 + 3(q − 1)²), 2×VPF = 0.4 × VPF (g = 볼류트 혀 간극, 기준 1).
 *  - 1X: 기계 불평형 0.8 (+ 불평형 상태면 3.5, 유량과 무관), 수력 불평형 상태면 2.0 × (0.4 + 1.2|q − 1|)를 더함 (유량에 반응).
 *  - 저유량 재순환: q < 0.6에서 5 ~ 40 Hz(약 0.1 ~ 0.7X) 넓은 대역 2.5 × ramp(0.6 − q, 0.3) mm/s rms.
 *  - 캐비테이션: 흡입 여유 m = NPSHa/NPSHr(BEP), 필요 NPSH가 유량과 함께 커진다 NPSHr(q) = 0.55 + 0.45q².
 *    여유 m/NPSHr(q)가 1.2 아래면 2 ~ 6 kHz 넓은 대역 가속도 2 g × ramp(1.2 − 여유, 0.4).
 * 압축기: 9000 rpm(150 Hz) 원심 압축기, 운전점 φ = 유량/설계 유량. 축 변위 [µm]·토출 압력 [%]·축방향 위치 [µm].
 *  - Rotating stall: φ < 0.72에서 λ f_r (λ = 0.22 − 0.3(0.72 − φ)), 12 µm × ramp(0.72 − φ, 0.12), 정방향.
 *  - 서지: φ < 0.55(서지선)이면 0.7 Hz 이완 진동 — 토출 압력이 천천히 오르다 급히 떨어지고(역류), 그때 축방향 위치가 튄다.
 *  - 서지 방지(재순환 밸브)를 켜면 압축기를 지나는 유량이 0.62 아래로 내려가지 않는다.
 * 문턱·크기는 문헌의 정성적 경향(Gülich, Day, Greitzer)을 숫자로 옮긴 설명용이다 (판정 기준이 아니다, I-009).
 */
import { bandAnalytic, spectrumOf } from '../dsp/envelope';
import { createRng } from '../dsp/random';
import { singleSidedSpectrum } from '../dsp/spectrum';

export const G = 9.80665;
const ramp = (x: number, w: number) => Math.min(1, Math.max(0, x / w));

// ── 펌프 ──
export const PUMP = { rpm: 3575, vanes: 7, fs: 16384, seconds: 1, seed: 808 } as const;
export const PUMP_FR = PUMP.rpm / 60;
export const PUMP_VPF = PUMP.vanes * PUMP_FR;

export type PumpState = 'normal' | 'gap' | 'hydraulic' | 'unbalance' | 'lowSuction';
export const PUMP_STATES: PumpState[] = ['normal', 'gap', 'hydraulic', 'unbalance', 'lowSuction'];
export const PUMP_LABEL: Record<PumpState, string> = {
  normal: '정상',
  gap: '혀 간극이 좁음 (임펠러 교체 후)',
  hydraulic: '수력 불평형 (임펠러 유로가 고르지 않음)',
  unbalance: '기계 불평형',
  lowSuction: '흡입 압력이 낮음',
};

export interface PumpCond {
  /** 운전점 Q/Q_BEP */
  q: number;
  /** 흡입 압력을 올린 몫 (흡입 여유에 더함) */
  suctionUp: number;
}

export interface PumpProps {
  gap: number;
  hydraulic: boolean;
  unbalance: boolean;
  /** 흡입 여유 NPSHa/NPSHr(BEP) */
  margin: number;
}
export function pumpProps(s: PumpState): PumpProps {
  return { gap: s === 'gap' ? 0.5 : 1, hydraulic: s === 'hydraulic', unbalance: s === 'unbalance', margin: s === 'lowSuction' ? 1.0 : 1.6 };
}

/** 양정 (BEP = 1, 체절 1.25) */
export const pumpHead = (q: number) => 1.25 - 0.25 * q * q;
/** 효율 (BEP = 1) */
export const pumpEff = (q: number) => Math.max(0, 2 * q - q * q);
/** 필요 NPSH (BEP = 1) — 유량이 늘면 커진다 */
export const npshr = (q: number) => 0.55 + 0.45 * q * q;

export interface PumpLevels {
  oneX: number;
  vpf: number;
  vpf2: number;
  /** 저유량 재순환 넓은 대역 [mm/s rms] */
  recirc: number;
  /** 이 유량에서의 흡입 여유 NPSHa/NPSHr(q) */
  marginAtQ: number;
  /** 캐비테이션 고주파 넓은 대역 [g rms] */
  cavit: number;
}

export function pumpLevels(s: PumpState, c: PumpCond): PumpLevels {
  const p = pumpProps(s);
  const { q } = c;
  const vpf = (0.6 / p.gap) * (1 + 3 * (q - 1) ** 2);
  const oneX = 0.8 + (p.unbalance ? 3.5 : 0) + (p.hydraulic ? 2 * (0.4 + 1.2 * Math.abs(q - 1)) : 0);
  const marginAtQ = (p.margin + c.suctionUp) / npshr(q);
  return { oneX, vpf, vpf2: 0.4 * vpf, recirc: 2.5 * ramp(0.6 - q, 0.3), marginAtQ, cavit: 2 * ramp(1.2 - marginAtQ, 0.4) };
}

const unitBand = (() => {
  const cache = new Map<string, Float64Array>();
  return (seed: number, n: number, fs: number, f1: number, f2: number) => {
    const key = `${seed}|${n}|${fs}|${f1}|${f2}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const rng = createRng(seed);
    const white = Float64Array.from({ length: n }, () => rng.normal());
    const b = bandAnalytic(spectrumOf(white), fs, f1, f2).re;
    let s2 = 0;
    for (const v of b) s2 += v * v;
    const k = 1 / Math.sqrt(s2 / n);
    const out = b.map((v) => v * k);
    cache.set(key, out);
    return out;
  };
})();

/** 펌프 신호: 속도 [mm/s]와 가속도 [g] (같은 시각 축) */
export function pumpSignals(s: PumpState, c: PumpCond) {
  const { fs, seconds, seed } = PUMP;
  const n = fs * seconds;
  const L = pumpLevels(s, c);
  const tones: [number, number, number][] = [
    [PUMP_FR, L.oneX, 0.3],
    [2 * PUMP_FR, 0.25, 1.1],
    [PUMP_VPF, L.vpf, 0.7],
    [2 * PUMP_VPF, L.vpf2, 1.9],
  ];
  const vel = new Float64Array(n);
  const acc = new Float64Array(n);
  for (const [f, a, ph] of tones) {
    const w = 2 * Math.PI * f;
    const av = a * Math.SQRT2;
    const aa = (av / 1000) * w / G;
    for (let i = 0; i < n; i++) {
      const cs = Math.cos((w * i) / fs + ph);
      vel[i] += av * cs;
      acc[i] -= aa * Math.sin((w * i) / fs + ph);
    }
  }
  const low = unitBand(seed, n, fs, 5, 40);
  const hf = unitBand(seed + 1, n, fs, 2000, 6000);
  const rng = createRng(seed + 2);
  for (let i = 0; i < n; i++) {
    vel[i] += L.recirc * low[i] + 0.02 * rng.normal();
    acc[i] += L.cavit * hf[i] + 0.004 * rng.normal();
  }
  return { fs, vel, acc, levels: L };
}

/** Hann 단일측 스펙트럼 [rms 단위], fMax까지 */
export function rmsSpectrum(x: Float64Array, fs: number, fMax: number) {
  const sp = singleSidedSpectrum({ fs, x }, { window: 'hann' });
  const k = sp.frequency.findIndex((f) => f > fMax);
  const end = k < 0 ? sp.frequency.length : k;
  return { freq: sp.frequency.slice(0, end), amp: sp.amplitude.slice(0, end).map((a) => a / Math.SQRT2) };
}

/** 구간 [f1, f2]의 RMS (스펙트럼 칸 파워 합, Hann 잡음 대역폭 1.5칸 보정) */
export function bandRms(freq: ArrayLike<number>, amp: ArrayLike<number>, f1: number, f2: number): number {
  let p = 0;
  for (let k = 0; k < freq.length; k++) if (freq[k] >= f1 && freq[k] <= f2) p += amp[k] * amp[k];
  return Math.sqrt(p / 1.5);
}

// ── 압축기 ──
export const COMP = { rpm: 9000, surgeLine: 0.55, stallOnset: 0.72, antiSurgeMin: 0.62, surgeHz: 0.7, seconds: 10, fsSlow: 200 } as const;
export const COMP_FR = COMP.rpm / 60;

export interface CompCond {
  /** 운전점 φ = 유량 / 설계 유량 (요청 유량) */
  phi: number;
  /** 서지 방지(재순환 밸브) */
  antiSurge: boolean;
}

/** 압력비 (설계점 φ = 1에서 2.29, 서지선 0.55에서 최대 3.0) */
export const pressureRatio = (phi: number) => 3.0 - 3.5 * (phi - 0.55) ** 2;

export interface CompState {
  /** 압축기를 실제로 지나는 유량 (서지 방지가 아래를 막는다) */
  phiEff: number;
  stall: { hz: number; order: number; amp: number } | null;
  surge: boolean;
  oneX: number;
}

export function compState(c: CompCond): CompState {
  const phiEff = c.antiSurge ? Math.max(c.phi, COMP.antiSurgeMin) : c.phi;
  const k = ramp(COMP.stallOnset - phiEff, 0.12);
  const lam = 0.22 - 0.3 * (COMP.stallOnset - phiEff);
  const surge = phiEff < COMP.surgeLine;
  return {
    phiEff,
    stall: k > 0 && !surge ? { hz: lam * COMP_FR, order: lam, amp: 12 * k } : null,
    surge,
    oneX: 12,
  };
}

/** 서지 한 주기 안의 위상 0 ~ 1에서: 압력은 0.8 동안 오르고 0.2 동안 떨어진다 */
function surgeShape(ph: number) {
  const p = ph < 0.8 ? -1 + (2 * ph) / 0.8 : 1 - (2 * (ph - 0.8)) / 0.2;
  const ax = ph >= 0.8 ? Math.sin((Math.PI * (ph - 0.8)) / 0.2) : 0;
  return { p, ax };
}

/** 10 s 동안의 토출 압력 [% of 설계]과 축방향 위치 [µm] (200 Hz 샘플) */
export function compSlowSignals(c: CompCond) {
  const st = compState(c);
  const { fsSlow, seconds, surgeHz } = COMP;
  const n = fsSlow * seconds;
  const t = Float64Array.from({ length: n }, (_, i) => i / fsSlow);
  const base = (100 * pressureRatio(st.phiEff)) / pressureRatio(1);
  const rng = createRng(909);
  const press = new Float64Array(n);
  const axial = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let p = base + 0.3 * rng.normal();
    let a = 0.5 * rng.normal();
    if (st.stall) p += (st.stall.amp / 12) * 2.5 * Math.sin(2 * Math.PI * st.stall.hz * t[i]);
    if (st.surge) {
      const s = surgeShape((t[i] * surgeHz) % 1);
      p = base - 12 + 20 * s.p + 0.3 * rng.normal();
      a = -120 * s.ax + 0.5 * rng.normal();
    }
    press[i] = p;
    axial[i] = a;
  }
  return { t, press, axial, state: st };
}

/** 반경 방향 축 변위 성분 [µm pk]: 1X, stall, 서지(낮은 주파수 무리) */
export function compLines(c: CompCond): { hz: number; amp: number; name: string }[] {
  const st = compState(c);
  const out = [{ hz: COMP_FR, amp: st.oneX, name: '1X' }];
  if (st.stall) out.push({ hz: st.stall.hz, amp: st.stall.amp, name: 'stall' });
  if (st.surge) for (let h = 1; h <= 4; h++) out.push({ hz: h * COMP.surgeHz, amp: 25 / h, name: h === 1 ? '서지' : `서지 × ${h}` });
  return out;
}

// ── LAB-FLOW-01 숨은 케이스 ──
export type FlowCase =
  | { machine: 'pump'; state: PumpState; q: number }
  | { machine: 'comp'; phi: number; antiSurge: boolean };
export const FLOW_CASES: FlowCase[] = [
  { machine: 'pump', state: 'lowSuction', q: 1.0 },
  { machine: 'pump', state: 'normal', q: 0.4 },
  { machine: 'pump', state: 'gap', q: 1.0 },
  { machine: 'pump', state: 'hydraulic', q: 0.6 },
  { machine: 'comp', phi: 0.64, antiSurge: true },
  { machine: 'comp', phi: 0.5, antiSurge: false },
  { machine: 'pump', state: 'unbalance', q: 0.6 },
];
