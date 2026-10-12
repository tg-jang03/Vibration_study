/**
 * 합성 정지(코스트다운) 기록 두 개 (LAB-REV-01 · P11-3 그림): 가상의 압축기 — 현장 자료가 아니다. 순수 함수, 시드 고정.
 *
 * 이야기: 운전 6000 rpm, 1차 임계속도를 지나 멈춘다.
 *  - 기록 A (1년 전 정지): 임계속도 3300 rpm, ζ 0.08, 프로브 궤도 런아웃 4 µm p-p.
 *  - 기록 B (이번 정지): 받침(베어링) 강성이 줄어 임계속도 3000 rpm, ζ 0.10. 정비 중 프로브 궤도에 흠이 생겨 런아웃 24 µm p-p.
 *    불평형(편심)은 A와 같다. 키페이저 펄스가 세 바퀴 빠지고 한 번 잡음으로 더 찍혔다.
 *  - 당시 판단(가상): "B의 임계속도 통과 진폭이 A보다 커졌다 → 불평형 증가 → 밸런싱". 복기로 다시 그려 보면 다르다.
 * 채널: 키페이저 [V](홈 펄스, 내려감) · 축 변위 X [µm] (AC, 1X 불평형 응답 + 런아웃 1X·2X + 잡음).
 * 회전수: dω/dt = −a − bω (마찰 + 바람), 6000 rpm에서 약 73초 뒤 150 rpm.
 */
import { createRng } from '../dsp/random';

const TWO_PI = 2 * Math.PI;
const RAD = Math.PI / 180;

export const REVIEW = {
  fs: 5120,
  rpm0: 6000,
  /** 끝낼 회전수 */
  rpmEnd: 150,
  /** 감속: a [rad/s²] (마찰), b [1/s] (바람) */
  a: 3,
  b: 1 / 45,
  /** 키페이저: 홈 없는 곳 −8 V, 홈 바닥 −15.9 V, 홈 폭 20°, 가장자리 1° */
  keyHigh: -8,
  keyLow: -15.9,
  notchDeg: 20,
  edgeDeg: 1,
  keyNoise: 0.05,
  /** 편심 응답 크기 U [µm Peak] (r → ∞에서의 1X)와 heavy spot 각 [°] */
  unbalance: 6,
  heavyDeg: 40,
  noiseUm: 0.4,
} as const;

export type RecordId = 'A' | 'B';
export interface RecordTruth {
  label: string;
  criticalRpm: number;
  zeta: number;
  /** 런아웃 1X·2X [µm p-p, 지연각 °] */
  runout1: [number, number];
  runout2: [number, number];
  /** 키페이저: 펄스를 빼먹은 바퀴 시작 시각 근처 [s], 더 찍힌 시각 [s] */
  missing: number[];
  extra: number[];
}

export const RECORDS: Record<RecordId, RecordTruth> = {
  A: { label: '기록 A — 1년 전 정지', criticalRpm: 3300, zeta: 0.08, runout1: [4, 200], runout2: [1.5, 60], missing: [], extra: [] },
  B: { label: '기록 B — 이번 정지', criticalRpm: 3000, zeta: 0.1, runout1: [24, 150], runout2: [5, 60], missing: [20.3, 41.7, 58.2], extra: [33.33] },
};

/** 시각 t의 각속도 [rad/s]와 축 각도 θ [rad] (θ(0) = 0) */
export function speedAt(t: number) {
  const { a, b } = REVIEW;
  const w0 = (REVIEW.rpm0 * TWO_PI) / 60;
  const c = w0 + a / b;
  const e = Math.exp(-b * t);
  return { w: c * e - a / b, theta: (c * (1 - e)) / b - (a / b) * t };
}

/** 기록이 끝나는 시각 (rpmEnd에 닿는 때) */
export function recordSeconds(): number {
  const { a, b } = REVIEW;
  const w0 = (REVIEW.rpm0 * TWO_PI) / 60;
  const we = (REVIEW.rpmEnd * TWO_PI) / 60;
  return Math.log((w0 + a / b) / (we + a / b)) / b;
}

/** 1자유도 불평형 응답의 1X 벡터 [µm Peak]: U r²/(1 − r² + j2ζr) e^(−jφ_u) (P4-1) */
export function unbalanceVector(rpm: number, criticalRpm: number, zeta: number): { re: number; im: number } {
  const r = rpm / criticalRpm;
  const dRe = 1 - r * r;
  const dIm = 2 * zeta * r;
  const d2 = dRe * dRe + dIm * dIm;
  // r²/(dRe + j dIm) = r²(dRe − j dIm)/d2
  const gRe = (REVIEW.unbalance * r * r * dRe) / d2;
  const gIm = (-REVIEW.unbalance * r * r * dIm) / d2;
  const h = REVIEW.heavyDeg * RAD;
  // × e^(−jφ_u)
  return { re: gRe * Math.cos(h) + gIm * Math.sin(h), im: gIm * Math.cos(h) - gRe * Math.sin(h) };
}

export interface ReviewRecord {
  id: RecordId;
  fs: number;
  key: Float64Array;
  x: Float64Array;
}

const cache = new Map<RecordId, ReviewRecord>();

export function reviewRecord(id: RecordId): ReviewRecord {
  const hit = cache.get(id);
  if (hit) return hit;
  const tr = RECORDS[id];
  const { fs } = REVIEW;
  const n = Math.floor(recordSeconds() * fs);
  const key = new Float64Array(n);
  const x = new Float64Array(n);
  const rng = createRng(id === 'A' ? 4101 : 4102);
  const notch = REVIEW.notchDeg * RAD;
  const edge = REVIEW.edgeDeg * RAD;
  const sig = (u: number) => 1 / (1 + Math.exp(-u));
  const r1 = { a: tr.runout1[0] / 2, ph: tr.runout1[1] * RAD };
  const r2 = { a: tr.runout2[0] / 2, ph: tr.runout2[1] * RAD };
  // 빠진 펄스: 그 시각이 든 바퀴 번호
  const skipRev = new Set(tr.missing.map((t) => Math.floor(speedAt(t).theta / TWO_PI)));
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    const { w, theta } = speedAt(t);
    const rev = Math.floor(theta / TWO_PI);
    // 홈 앞 가장자리가 θ = 2πk에 오도록, 그 바퀴 안의 각
    const local = theta - rev * TWO_PI;
    const u = local > Math.PI ? local - TWO_PI : local;
    const depth = skipRev.has(rev) ? 0 : sig(u / edge) * sig((notch - u) / edge);
    key[i] = REVIEW.keyHigh + (REVIEW.keyLow - REVIEW.keyHigh) * depth + REVIEW.keyNoise * rng.normal();
    const rpm = (w * 60) / TWO_PI;
    const v = unbalanceVector(rpm, tr.criticalRpm, tr.zeta);
    // x = Re{V e^(jθ)} + 런아웃 A cos(nθ − φ)
    x[i] = v.re * Math.cos(theta) - v.im * Math.sin(theta) + r1.a * Math.cos(theta - r1.ph) + r2.a * Math.cos(2 * theta - r2.ph) + REVIEW.noiseUm * rng.normal();
  }
  // 잡음으로 더 찍힌 펄스: 0.3 ms 동안 홈 바닥만큼 떨어짐
  for (const te of tr.extra) {
    const i0 = Math.round(te * fs);
    for (let i = i0; i < Math.min(n, i0 + Math.round(0.0003 * fs) + 1); i++) key[i] = REVIEW.keyLow;
  }
  const out: ReviewRecord = { id, fs, key, x };
  cache.set(id, out);
  return out;
}
