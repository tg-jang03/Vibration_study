/**
 * 1자유도 불평형 런업 데이터와 Bode/Polar·Half-power AF·분리여유 (P4-1, LAB-AF-01).
 * 순수 함수만 둔다 (AGENTS §6). 진폭은 변위 Peak [m], 위상은 지연각 [rad] (Contents §3 위상 관례).
 * 1X 벡터 = A e^{-jφ}. 표시(µm pp, °, rpm)는 UI에서만 바꾼다 (D-012).
 */
import { createRng } from '../dsp/random';
import { unbalancePeak, unbalanceResponseFactor } from '../mck/unbalance';

export interface UnbalanceRotor {
  /** 고유 회전수 N_n [rpm] (ω_n = 2π N_n / 60) */
  naturalRpm: number;
  /** 감쇠비 ζ */
  zeta: number;
  /** 편심 거리 e_cg = m_u e / M [m] — 고속에서 수렴하는 변위 Peak */
  eccentricity: number;
  /** 무거운 점(heavy spot)의 각도 [rad], 키페이저 펄스 순간 센서에서 회전 반대 방향으로 잰 값. 기본 0 */
  heavySpot?: number;
}

/** 1X 벡터 한 점: 진폭 Peak [m], 지연각 [rad, 0 ≤ lag < 2π] */
export interface RunUpPoint {
  rpm: number;
  amp: number;
  lag: number;
}

export interface RunUpOptions {
  /** 시작·끝 회전수 [rpm] (끝은 포함) */
  rpmStart?: number;
  rpmEnd: number;
  /** 측정 회전수 간격 [rpm] */
  rpmStep: number;
  /** 측정 잡음: 1X 벡터의 실수·허수 성분마다 더하는 정규분포 표준편차 [m] */
  noise?: number;
  /** 런아웃 벡터 (회전수와 무관하게 더해짐, P2-2·P2-3) */
  runout?: { amp: number; lag: number };
  seed?: number;
}

export interface HalfPowerResult {
  /** 피크 회전수 N_c [rpm] (측정점 중 진폭 최대) */
  peakRpm: number;
  /** 피크 진폭 [m] */
  peakAmp: number;
  /** 0.707 × 피크 지점 [rpm] (선형 보간) */
  n1: number;
  n2: number;
  /** AF = N_c / (N₂ − N₁) */
  af: number;
}

const TWO_PI = 2 * Math.PI;

function check(name: string, value: number, min: number, strict = false): number {
  if (!Number.isFinite(value) || value < min || (strict && value === min)) {
    throw new RangeError(`${name} must be finite and ${strict ? '>' : '>='} ${min}`);
  }
  return value;
}

/** 각도를 [0, 2π)로 */
export function wrapLag(lag: number): number {
  const w = lag % TWO_PI;
  const v = w < 0 ? w + TWO_PI : w;
  return v >= TWO_PI - 1e-12 ? 0 : v;
}

const toVec = (amp: number, lag: number): [number, number] => [amp * Math.cos(lag), -amp * Math.sin(lag)];
const fromVec = (re: number, im: number): { amp: number; lag: number } => ({ amp: Math.hypot(re, im), lag: wrapLag(Math.atan2(-im, re)) });

/**
 * 정상상태 1X 벡터 (해석해, Contents §3):
 * X = e_cg · r² / √((1−r²)² + (2ζr)²), 지연각 = heavySpot + atan2(2ζr, 1−r²).
 */
export function unbalanceVector(rotor: UnbalanceRotor, rpm: number): RunUpPoint {
  check('naturalRpm', rotor.naturalRpm, 0, true);
  check('eccentricity', rotor.eccentricity, 0);
  check('rpm', rpm, 0);
  const { factor, phaseLag } = unbalanceResponseFactor(rpm / rotor.naturalRpm, check('zeta', rotor.zeta, 0, true));
  return { rpm, amp: rotor.eccentricity * factor, lag: wrapLag((rotor.heavySpot ?? 0) + phaseLag) };
}

/** 측정 회전수 목록: rpmStart부터 rpmStep 간격, rpmEnd 포함 (부동소수점 누적 없이) */
export function rpmGrid(rpmStart: number, rpmEnd: number, rpmStep: number): number[] {
  check('rpmStart', rpmStart, 0);
  check('rpmStep', rpmStep, 0, true);
  if (!(rpmEnd > rpmStart)) throw new RangeError('rpmEnd must be > rpmStart');
  const n = Math.floor((rpmEnd - rpmStart) / rpmStep + 1e-9);
  const out = Array.from({ length: n + 1 }, (_, i) => rpmStart + i * rpmStep);
  if (out[out.length - 1] < rpmEnd - 1e-9) out.push(rpmEnd);
  return out;
}

/**
 * 런업 데이터: 회전수마다 1X 벡터 = 참 응답 + 런아웃 + 잡음(시드 고정).
 * rpm 0은 응답이 0이라 잡음·런아웃만 남는다.
 */
export function simulateRunUp(rotor: UnbalanceRotor, options: RunUpOptions): RunUpPoint[] {
  const noise = check('noise', options.noise ?? 0, 0);
  const rng = createRng(options.seed ?? 41);
  const ro = options.runout ? toVec(check('runout.amp', options.runout.amp, 0), options.runout.lag) : [0, 0];
  return rpmGrid(options.rpmStart ?? 0, options.rpmEnd, options.rpmStep).map((rpm) => {
    const truth = unbalanceVector(rotor, rpm);
    const [tr, ti] = toVec(truth.amp, truth.lag);
    const nr = noise > 0 ? noise * rng.normal() : 0;
    const ni = noise > 0 ? noise * rng.normal() : 0;
    const v = fromVec(tr + ro[0] + nr, ti + ro[1] + ni);
    return { rpm, amp: v.amp, lag: v.lag };
  });
}

/** Slow roll 보상: 모든 점에서 기준 회전수(가장 가까운 측정점)의 벡터를 복소수로 뺀다 (P2-3 §5) */
export function compensateSlowRoll(points: readonly RunUpPoint[], slowRollRpm: number): { reference: RunUpPoint; points: RunUpPoint[] } {
  if (points.length === 0) throw new RangeError('points must not be empty');
  let ref = points[0];
  for (const p of points) if (Math.abs(p.rpm - slowRollRpm) < Math.abs(ref.rpm - slowRollRpm)) ref = p;
  const [rr, ri] = toVec(ref.amp, ref.lag);
  return {
    reference: ref,
    points: points.map((p) => {
      const [pr, pi] = toVec(p.amp, p.lag);
      const v = fromVec(pr - rr, pi - ri);
      return { rpm: p.rpm, amp: v.amp, lag: v.lag };
    }),
  };
}

/**
 * Half-power 증폭계수 (Contents §3, I-004): AF = N_c / (N₂ − N₁).
 * 피크 = 측정점 중 최대 진폭. 피크에서 양쪽으로 걸어 나가며 처음 0.707 × 피크 아래로 내려가는 구간을 선형 보간한다.
 * 한쪽이라도 측정 범위 안에서 내려가지 않으면 null.
 */
export function halfPowerAF(points: readonly RunUpPoint[]): HalfPowerResult | null {
  if (points.length < 3) return null;
  let k = 0;
  for (let i = 1; i < points.length; i++) if (points[i].amp > points[k].amp) k = i;
  const peak = points[k];
  if (!(peak.amp > 0)) return null;
  const level = peak.amp / Math.SQRT2;
  const cross = (a: RunUpPoint, b: RunUpPoint) => a.rpm + ((level - a.amp) / (b.amp - a.amp)) * (b.rpm - a.rpm);
  let n1 = Number.NaN;
  for (let i = k; i > 0; i--) {
    if (points[i - 1].amp < level) {
      n1 = cross(points[i - 1], points[i]);
      break;
    }
  }
  let n2 = Number.NaN;
  for (let i = k; i < points.length - 1; i++) {
    if (points[i + 1].amp < level) {
      n2 = cross(points[i], points[i + 1]);
      break;
    }
  }
  if (!Number.isFinite(n1) || !Number.isFinite(n2) || !(n2 > n1)) return null;
  return { peakRpm: peak.rpm, peakAmp: peak.amp, n1, n2, af: peak.rpm / (n2 - n1) };
}

/**
 * 위상이 기준(첫 점)보다 90° 더 늦어지는 회전수 [rpm] (선형 보간). 없으면 NaN.
 * 각도는 연속이 되도록 펼쳐서(unwrap) 비교한다.
 */
export function phaseShiftRpm(points: readonly RunUpPoint[], shift = Math.PI / 2, referenceLag?: number): number {
  if (points.length < 2) return Number.NaN;
  const lags: number[] = [points[0].lag];
  for (let i = 1; i < points.length; i++) {
    let d = points[i].lag - points[i - 1].lag;
    if (d > Math.PI) d -= TWO_PI;
    if (d < -Math.PI) d += TWO_PI;
    lags.push(lags[i - 1] + d);
  }
  const target = (referenceLag ?? lags[0]) + shift;
  for (let i = 1; i < lags.length; i++) {
    if (lags[i - 1] < target && lags[i] >= target) {
      const t = (target - lags[i - 1]) / (lags[i] - lags[i - 1]);
      return points[i - 1].rpm + t * (points[i].rpm - points[i - 1].rpm);
    }
  }
  return Number.NaN;
}

/** 분리여유 SM = |N_op − N_c| / N_op × 100 [%] (개념 식, 규격 요구값은 옮기지 않는다 — I-009) */
export function separationMargin(operatingRpm: number, criticalRpm: number): number {
  check('operatingRpm', operatingRpm, 0, true);
  check('criticalRpm', criticalRpm, 0);
  return (Math.abs(operatingRpm - criticalRpm) / operatingRpm) * 100;
}

/** P4-1 본문 그림과 LAB-AF-01이 함께 쓰는 예시 로터 (교육용 값, 실제 기계 자료 아님) */
export const P41_EXAMPLE = {
  rotor: { naturalRpm: 3000, zeta: 0.05, eccentricity: 5e-6 } as UnbalanceRotor,
  operatingRpm: 3600,
  rpmEnd: 6000,
  rpmStep: 25,
  slowRollRpm: 300,
  seed: 41,
} as const;

/** 해석적 피크 회전수 N_n / √(1 − 2ζ²) [rpm]. ζ ≥ 1/√2이면 null */
export function theoreticalPeakRpm(rotor: UnbalanceRotor): number | null {
  const p = unbalancePeak(rotor.zeta);
  return p ? rotor.naturalRpm * p.frequencyRatio : null;
}
