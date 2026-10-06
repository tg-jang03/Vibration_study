/**
 * 비접촉 변위 센서(와전류 프로브) 모델 (P2-2, LAB-PROX-01). 순수 함수, 단위는 m·V·s·rad (D-012).
 * - 교정 곡선: 선형 범위 안에서 V = −S·d. 범위 밖은 기울기가 이어지다 점점 눕는 예시 곡선이다
 *   (실제 곡선은 프로브·표적 재질·케이블 길이에 따라 다르다 — 설명용 예시값).
 * - 축까지의 거리 d(θ, t) = 평균 gap d₀ − (축 진동) + 런아웃(θ). 축이 센서 쪽으로 오면 gap이 줄어 전압이 덜 음이 된다.
 * - 런아웃은 회전 각도 θ에만 묶인 "가짜 진동"이라 회전수와 상관없이 같은 모양·크기다.
 * 진동은 불평형 응답(lib/mck)으로 회전수에 따라 크기·위상이 바뀐다.
 */
import { unbalanceResponseFactor } from './mck';
import { MIL } from './units';

export interface ProbeCalibration {
  /** 감도 S [V/m] (양수. 출력은 −S·d) */
  sensitivity: number;
  /** 선형 범위 [m] */
  linearMin: number;
  linearMax: number;
  /** 범위 밖에서 곡선이 눕는 정도 [m] — 작을수록 빨리 눕는다 (예시) */
  kneeLow: number;
  kneeHigh: number;
}

/** 예시 프로브: 7.87 V/mm(200 mV/mil), 선형 범위 0.25 ~ 2.3 mm */
export const PROBE: ProbeCalibration = {
  sensitivity: 0.2 / MIL,
  linearMin: 0.25e-3,
  linearMax: 2.3e-3,
  kneeLow: 0.12e-3,
  kneeHigh: 0.2e-3,
};

/** 교정 곡선: 축까지의 거리 d [m] → 출력 전압 [V] (음수). 선형 범위 끝에서 기울기가 끊기지 않는다 */
export function gapVoltage(d: number, probe: ProbeCalibration = PROBE): number {
  const { sensitivity: S, linearMin: lo, linearMax: hi, kneeLow: wl, kneeHigh: wh } = probe;
  if (d < lo) return -(S * lo - S * wl * (1 - Math.exp(-(lo - d) / wl)));
  if (d > hi) return -(S * hi + S * wh * (1 - Math.exp(-(d - hi) / wh)));
  return -S * d;
}

/** 전압 → 거리 (선형 환산 d = −V/S). 교정 감도를 그대로 쓴다고 가정 */
export function distanceFromVoltage(voltage: number, sensitivity: number = PROBE.sensitivity): number {
  return -voltage / sensitivity;
}

export const inLinearRange = (d: number, probe: ProbeCalibration = PROBE) => d >= probe.linearMin && d <= probe.linearMax;

export type RunoutKind = 'none' | 'mechanical' | 'electrical' | 'both';

/** 기계적 런아웃 예시: 편심·휨(1X) 3 µm, 타원(2X) 4 µm, 흠집 하나(폭 6°, 깊이 8 µm) — 진폭은 피크 */
const MECH = { a1: 1.5e-6, p1: 0.6, a2: 2e-6, p2: 1.9, scratchAt: (200 * Math.PI) / 180, scratchWidth: (6 * Math.PI) / 180, scratchDepth: 8e-6 };
/** 전기적 런아웃 예시: 재질 불균질·잔류 자기 — 여러 차수가 섞인 들쭉날쭉한 무늬 [차수, 진폭(피크), 위상] */
const ELEC: [number, number, number][] = [
  [1, 1.0e-6, 2.4],
  [3, 1.4e-6, 0.3],
  [5, 0.9e-6, 4.1],
  [7, 1.1e-6, 1.2],
  [11, 0.7e-6, 5.3],
  [13, 0.5e-6, 2.8],
];

/** 회전 각도 θ [rad]에서의 런아웃 [m] — gap이 커지는 쪽이 + */
export function runoutAt(theta: number, kind: RunoutKind): number {
  let r = 0;
  if (kind === 'mechanical' || kind === 'both') {
    r += MECH.a1 * Math.cos(theta - MECH.p1) + MECH.a2 * Math.cos(2 * theta - MECH.p2);
    const dth = Math.atan2(Math.sin(theta - MECH.scratchAt), Math.cos(theta - MECH.scratchAt));
    r += MECH.scratchDepth * Math.exp(-0.5 * (dth / (MECH.scratchWidth / 2)) ** 2);
  }
  if (kind === 'electrical' || kind === 'both') {
    for (const [k, a, p] of ELEC) r += a * Math.cos(k * theta - p);
  }
  return r;
}

/** 예시 로터: 1차 임계 2000 rpm, ζ 0.1, 운전 3600 rpm */
export const ROTOR = { criticalRpm: 2000, zeta: 0.1, operatingRpm: 3600 } as const;

/**
 * 회전수 rpm에서 1X 축 진동 [m pp]과 위상 지연 [rad].
 * vibPpAtOperating: 운전 회전수에서의 진동 [m pp]. 불평형 응답 비로 다른 회전수의 크기를 정한다.
 */
export function shaftVibration(rpm: number, vibPpAtOperating: number): { pp: number; phaseLag: number } {
  const at = (n: number) => unbalanceResponseFactor(n / ROTOR.criticalRpm, ROTOR.zeta);
  const op = at(ROTOR.operatingRpm).factor;
  const cur = at(rpm);
  return { pp: (vibPpAtOperating * cur.factor) / op, phaseLag: cur.phaseLag };
}

export interface ProbeSimInput {
  /** 평균 gap d₀ [m] */
  gap: number;
  rpm: number;
  /** 운전 회전수(3600 rpm)에서의 진동 [m pp] */
  vibPp: number;
  runout: RunoutKind;
  /** 환산에 쓰는 감도 [V/m] (기본 = 교정 감도). 실제 감도는 probe.sensitivity */
  readSensitivity?: number;
  /** 실제 프로브 (표적 재질이 다르면 감도가 다르다) */
  probe?: ProbeCalibration;
  /** 바퀴 수 (기본 2) */
  revolutions?: number;
  /** 한 바퀴의 점 수 (기본 720) */
  pointsPerRev?: number;
}

export interface ProbeSim {
  /** 회전 각도 [바퀴] */
  rev: Float64Array;
  /** 시각 [s] */
  time: Float64Array;
  /** 실제 gap [m] */
  gap: Float64Array;
  /** 진동만 (gap 변화, m) / 런아웃만 (m) */
  vibration: Float64Array;
  runout: Float64Array;
  /** 출력 전압 [V] */
  voltage: Float64Array;
  /** 전압에서 환산한 거리 [m] (선형 환산) */
  readGap: Float64Array;
  /** 평균 전압 [V], 환산 평균 거리 [m] */
  dcVoltage: number;
  readMeanGap: number;
  /** 실제 gap pp, 환산 gap pp, 진동만 pp, 런아웃만 pp [m] */
  truePp: number;
  readPp: number;
  vibPp: number;
  runoutPp: number;
  /** 실제 gap이 선형 범위 안에 머무나 */
  linear: boolean;
}

const pp = (a: ArrayLike<number>) => {
  let mn = Infinity;
  let mx = -Infinity;
  for (let i = 0; i < a.length; i++) {
    mn = Math.min(mn, a[i]);
    mx = Math.max(mx, a[i]);
  }
  return mx - mn;
};

/** 프로브 신호 합성. 축 진동은 gap을 줄이는 쪽(센서 쪽)을 +로 본다: gap = d₀ − x + 런아웃 */
export function simulateProbe(input: ProbeSimInput): ProbeSim {
  const probe = input.probe ?? PROBE;
  const S = input.readSensitivity ?? PROBE.sensitivity;
  const revs = input.revolutions ?? 2;
  const nRev = input.pointsPerRev ?? 720;
  const n = revs * nRev + 1;
  const fr = input.rpm / 60;
  const vib = shaftVibration(input.rpm, input.vibPp);
  const rev = new Float64Array(n);
  const time = new Float64Array(n);
  const gap = new Float64Array(n);
  const vibration = new Float64Array(n);
  const runout = new Float64Array(n);
  const voltage = new Float64Array(n);
  const readGap = new Float64Array(n);
  let sumV = 0;
  let linear = true;
  for (let i = 0; i < n; i++) {
    const rv = i / nRev;
    const th = 2 * Math.PI * rv;
    rev[i] = rv;
    time[i] = fr > 0 ? rv / fr : 0;
    vibration[i] = (vib.pp / 2) * Math.cos(th - vib.phaseLag);
    runout[i] = runoutAt(th, input.runout);
    gap[i] = input.gap - vibration[i] + runout[i];
    voltage[i] = gapVoltage(gap[i], probe);
    readGap[i] = distanceFromVoltage(voltage[i], S);
    if (!inLinearRange(gap[i], probe)) linear = false;
    if (i < n - 1) sumV += voltage[i];
  }
  const dcVoltage = sumV / (n - 1);
  return {
    rev,
    time,
    gap,
    vibration,
    runout,
    voltage,
    readGap,
    dcVoltage,
    readMeanGap: distanceFromVoltage(dcVoltage, S),
    truePp: pp(gap),
    readPp: pp(readGap),
    vibPp: pp(vibration),
    runoutPp: pp(runout),
    linear,
  };
}
