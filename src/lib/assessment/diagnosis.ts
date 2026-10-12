/**
 * P10-3 가상 사례 · LAB-DIAG-01: "3000 rpm의 1X가 20 → 40 µm p-p — 무엇이 변했나".
 * 회전체 + 받침을 1자유도 불평형 응답(P4-1, `lib/rotor/runup.ts`)으로 단순화한 가상 계산이다. 현장 자료가 아니다.
 * - 기준(1년 전): 임계속도 3500 rpm, ζ 0.08, 3000 rpm에서 20 µm p-p.
 * - 가설 H1 가진 증가: 임계속도 그대로, 편심(불평형)만 커짐 → 곡선 전체가 같은 배수, 위상은 그대로.
 * - 가설 H2 고유진동수 이동: 편심 그대로, 받침 강성이 떨어져 임계속도가 내려옴 → 같은 회전수의 위상 지연이 커짐.
 * 내부 단위 SI (진폭 m Peak, 지연 rad). 표시는 UI에서 µm p-p·도로 바꾼다 (D-012).
 */
import { createRng } from '../dsp/random';
import { unbalanceVector, type RunUpPoint } from '../rotor/runup';

export const CASE = {
  operatingRpm: 3000,
  zeta: 0.08,
  baseNcRpm: 3500,
  /** 3000 rpm 기준 진폭·현재 진폭 [m Peak] (20 → 40 µm p-p) */
  baseAmp: 10e-6,
  nowAmp: 20e-6,
  /** 코스트다운 기록점 [rpm] */
  rpm: Array.from({ length: 21 }, (_, i) => 2000 + i * 50),
  /** 기록 잡음 (1X 벡터 실수·허수 성분마다 정규분포 표준편차) [m] */
  noise: 0.15e-6,
} as const;

export type TruthId = 'excitation' | 'stiffness' | 'both';
export const TRUTH_LABEL: Record<TruthId, string> = { excitation: '가진 증가 (불평형이 커짐)', stiffness: '고유진동수 이동 (받침 강성 저하)', both: '둘 다 조금씩' };

const vec = (ncRpm: number, ecc: number, rpm: number) => unbalanceVector({ naturalRpm: ncRpm, zeta: CASE.zeta, eccentricity: ecc }, rpm);

/** 기준선 편심: 3000 rpm에서 baseAmp가 되게 */
export const BASE_ECC = CASE.baseAmp / vec(CASE.baseNcRpm, 1, CASE.operatingRpm).amp;

/** 편심이 baseEcc일 때 운전점 진폭을 target으로 만드는 임계속도 (운전점 위쪽 가지에서 이분법) */
export function ncForAmplitude(target: number, ecc = BASE_ECC): number {
  let lo = CASE.operatingRpm * 1.0001, hi = CASE.baseNcRpm * 1.5;
  if (!(vec(lo, ecc, CASE.operatingRpm).amp > target && vec(hi, ecc, CASE.operatingRpm).amp < target)) throw new RangeError('target amplitude is out of the searchable range');
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (vec(mid, ecc, CASE.operatingRpm).amp > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 숨은 원인마다의 실제 계 (임계속도, 편심) — 모두 3000 rpm에서 nowAmp가 되게 맞춘다 */
export function truthSystem(id: TruthId): { ncRpm: number; ecc: number } {
  if (id === 'excitation') return { ncRpm: CASE.baseNcRpm, ecc: BASE_ECC * (CASE.nowAmp / CASE.baseAmp) };
  if (id === 'stiffness') return { ncRpm: ncForAmplitude(CASE.nowAmp), ecc: BASE_ECC };
  // 둘 다: 편심 1.4배 + 나머지는 임계속도 이동으로
  const ecc = BASE_ECC * 1.4;
  return { ncRpm: ncForAmplitude(CASE.nowAmp, ecc), ecc };
}

/** 코스트다운 기록 (잡음 포함, 시드 고정). 지연은 (−π, π] — 저속의 작은 지연이 잡음으로 360° 근처로 넘어가지 않게 */
export function coastdown(system: { ncRpm: number; ecc: number }, seed = 1031, noise: number = CASE.noise): RunUpPoint[] {
  const rng = createRng(seed);
  return CASE.rpm.map((rpm) => {
    const t = vec(system.ncRpm, system.ecc, rpm);
    const re = t.amp * Math.cos(t.lag) + noise * rng.normal();
    const im = -t.amp * Math.sin(t.lag) + noise * rng.normal();
    return { rpm, amp: Math.hypot(re, im), lag: Math.atan2(-im, re) };
  });
}

/** 기준선 기록 (1년 전 코스트다운) */
export const baseCoastdown = () => coastdown({ ncRpm: CASE.baseNcRpm, ecc: BASE_ECC }, 1030);

/** 두 가설의 예측 곡선 — 둘 다 3000 rpm의 현재 진폭(관측값)에 맞춘다 */
export function hypotheses(nowAt3000: number) {
  const h1 = { ncRpm: CASE.baseNcRpm, ecc: BASE_ECC * (nowAt3000 / CASE.baseAmp) };
  const h2 = { ncRpm: ncForAmplitude(nowAt3000), ecc: BASE_ECC };
  const curve = (s: { ncRpm: number; ecc: number }) => CASE.rpm.map((rpm) => vec(s.ncRpm, s.ecc, rpm));
  return { h1, h2, h1Curve: curve(h1), h2Curve: curve(h2) };
}

export type Evidence = 'op' | 'amp' | 'ampPhase';
/** 보여 준 자료로 계산한 가설별 오차: 진폭 RMS [m], 위상 RMS [rad] (위상은 ampPhase에서만) */
export function fitErrors(data: readonly RunUpPoint[], evidence: Evidence) {
  const op = data.find((p) => p.rpm === CASE.operatingRpm)!;
  const h = hypotheses(op.amp);
  const use = evidence === 'op' ? [CASE.rpm.indexOf(CASE.operatingRpm)] : CASE.rpm.map((_, i) => i);
  const rms = (xs: number[]) => Math.sqrt(xs.reduce((s, x) => s + x * x, 0) / xs.length);
  const wrap = (d: number) => Math.atan2(Math.sin(d), Math.cos(d));
  // 맞춘 점 하나(op)는 이론상 오차 0 — 이분법 잔차가 6e-14처럼 보이지 않게 (I-019)
  const zero = (v: number, tol: number) => (v < tol ? 0 : v);
  const err = (curve: RunUpPoint[]) => ({
    amp: zero(rms(use.map((i) => data[i].amp - curve[i].amp)), 1e-12),
    lag: evidence === 'ampPhase' ? rms(use.map((i) => wrap(data[i].lag - curve[i].lag))) : null,
  });
  return { h1: err(h.h1Curve), h2: err(h.h2Curve), hypotheses: h };
}

/** 기록 흩어짐의 기준: 같은 자료를 참 계의 곡선과 비교한 RMS (반복 기록으로 아는 잡음 수준에 해당) */
export function scatterLevel(data: readonly RunUpPoint[], system: { ncRpm: number; ecc: number }) {
  const truth = CASE.rpm.map((rpm) => vec(system.ncRpm, system.ecc, rpm));
  const rms = (xs: number[]) => Math.sqrt(xs.reduce((s, x) => s + x * x, 0) / xs.length);
  return {
    amp: rms(data.map((p, i) => p.amp - truth[i].amp)),
    lag: rms(data.map((p, i) => Math.atan2(Math.sin(p.lag - truth[i].lag), Math.cos(p.lag - truth[i].lag)))),
  };
}
