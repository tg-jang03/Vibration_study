/**
 * P5-2 "STFT · 스펙트로그램 · 워터폴"의 예시 기동 신호. 본문 그림과 랩(LAB-STFT-01)이 같이 쓴다. 순수 함수, 내부 단위 SI.
 * 예시: 600 rpm에서 40초 동안 3600 rpm까지 일정하게 올린 뒤(75 rpm/s = 1X가 1.25 Hz/s) 20초 유지. 축 변위(비접촉 센서) [m].
 * 성분: 1X(임계 1500 rpm, ζ 0.1의 불평형 응답), 2X(95 Hz 구조 공진을 지날 때 커짐), 95 Hz 구조 공진의 작은 울림,
 *       기름막 불안정(2400 rpm부터 0.45X로 따라가다 1차 임계 25 Hz에 잠김), 잡음. 모든 값은 설명용 예시다.
 */
import { createRng } from './dsp/random';
import { unbalanceResponseFactor } from './mck';

export const RUN = {
  fs: 512,
  seconds: 60,
  rampEnd: 40,
  rpm0: 600,
  rpm1: 3600,
  critRpm: 1500,
  zeta: 0.1,
  /** 운전 회전수에서 1X 진폭 [m pk] */
  x1AtOp: 10e-6,
  /** 2X 진폭 (운전 회전수, 공진 밖) [m pk] */
  x2AtOp: 2e-6,
  structHz: 95,
  structZeta: 0.04,
  structAmp: 1.2e-6,
  whirlStartRpm: 2400,
  whirlRatio: 0.45,
  /** 휠 진폭: 잠기기 직전 [m pk], 잠긴 뒤 20초 동안 커지는 끝값 */
  whirlAmp: 4e-6,
  whipAmp: 14e-6,
  noise: 0.25e-6,
} as const;

export const N_SAMPLES = RUN.fs * RUN.seconds;
/** 1X 주파수의 변화율 [Hz/s] (오르는 동안) */
export const RAMP_RATE = (RUN.rpm1 - RUN.rpm0) / 60 / RUN.rampEnd;
export const CRIT_HZ = RUN.critRpm / 60;

/** 시각 t [s]의 회전수 [rpm] */
export const rpmAt = (t: number): number => (t >= RUN.rampEnd ? RUN.rpm1 : RUN.rpm0 + ((RUN.rpm1 - RUN.rpm0) * Math.max(0, t)) / RUN.rampEnd);

/** 불안정 성분의 주파수 [Hz] (없으면 0): 0.45X를 따라가다 1차 임계 주파수에 잠긴다 */
export function whirlHz(rpm: number, whip = true): number {
  if (rpm < RUN.whirlStartRpm) return 0;
  const f = (RUN.whirlRatio * rpm) / 60;
  return whip ? Math.min(f, CRIT_HZ) : f;
}
/** 잠기기 시작하는 회전수 [rpm]과 시각 [s] */
export const LOCK_RPM = (CRIT_HZ * 60) / RUN.whirlRatio;
export const LOCK_TIME = ((LOCK_RPM - RUN.rpm0) / (RUN.rpm1 - RUN.rpm0)) * RUN.rampEnd;

export interface RunOptions {
  /** 기름막 불안정 성분을 넣나 */
  instability?: boolean;
  seed?: number;
}

export interface RunSignal {
  t: Float64Array;
  x: Float64Array;
  rpm: Float64Array;
}

/** 예시 기동 신호 [m]. 시드 고정 */
export function runSignal({ instability = true, seed = 11 }: RunOptions = {}): RunSignal {
  const { fs, critRpm, zeta, x1AtOp, x2AtOp, structHz, structZeta, structAmp, noise } = RUN;
  const n = N_SAMPLES;
  const t = Float64Array.from({ length: n }, (_, i) => i / fs);
  const rpm = t.map(rpmAt);
  const x = new Float64Array(n);
  const ref = unbalanceResponseFactor(RUN.rpm1 / critRpm, zeta).factor;
  const struct = (f: number) => {
    const r = f / structHz;
    return 1 / Math.hypot(1 - r * r, 2 * structZeta * r);
  };
  const s2ref = struct((2 * RUN.rpm1) / 60);
  const rng = createRng(seed);
  let th1 = 0;
  let thw = 0;
  for (let i = 0; i < n; i++) {
    const f1 = rpm[i] / 60;
    const u = unbalanceResponseFactor(rpm[i] / critRpm, zeta);
    const a1 = (x1AtOp * u.factor) / ref;
    const a2 = x2AtOp * ((rpm[i] / RUN.rpm1) ** 2) * (struct(2 * f1) / s2ref);
    let v = a1 * Math.cos(th1 - u.phaseLag) + a2 * Math.cos(2 * th1 + 0.6) + structAmp * Math.cos(2 * Math.PI * structHz * t[i] + 0.3);
    if (instability) {
      const fw = whirlHz(rpm[i]);
      if (fw > 0) {
        const grow = Math.min(1, (rpm[i] - RUN.whirlStartRpm) / 300);
        const locked = t[i] >= LOCK_TIME;
        const aw = locked ? RUN.whirlAmp + (RUN.whipAmp - RUN.whirlAmp) * Math.min(1, (t[i] - LOCK_TIME) / 15) : RUN.whirlAmp * grow;
        v += aw * Math.cos(thw);
        thw += (2 * Math.PI * fw) / fs;
      }
    }
    x[i] = v + noise * rng.normal();
    th1 += (2 * Math.PI * f1) / fs;
  }
  return { t, x, rpm };
}

/** 회전수 rpm에서 1X의 실제 진폭 [m pk] (그림·랩의 "실제 값") */
export function trueX1(rpm: number): number {
  const ref = unbalanceResponseFactor(RUN.rpm1 / RUN.critRpm, RUN.zeta).factor;
  return (RUN.x1AtOp * unbalanceResponseFactor(rpm / RUN.critRpm, RUN.zeta).factor) / ref;
}
