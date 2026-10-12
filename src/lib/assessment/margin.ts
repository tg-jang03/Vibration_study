/**
 * P10-2 §4 · LAB-SM-01: 증폭계수(AF)와 분리여유(SM)가 왜 같이 다뤄지는가.
 * 1자유도 불평형 응답(P4-1, `lib/rotor/runup.ts`)으로, 예측한 임계속도가 틀렸을 때 운전점 응답이 얼마나 바뀌는지 본다.
 * 규격의 AF·SM 경계값은 넣지 않는다 (I-009). 진폭은 편심 e로 나눈 무차원값.
 */
import { unbalanceVector } from '../rotor/runup';

export interface MarginCase {
  /** 증폭계수 AF ≈ 1/(2ζ) */
  af: number;
  /** 예측 분리여유 [%] = 100·|N_op − N_c|/N_op (P4-1) */
  smPct: number;
  /** 임계속도가 운전점 아래(below, P4-1 예시 로터)인가 위(above)인가. 기본 below */
  side?: 'below' | 'above';
  /** 임계속도 예측 오차 [%]: 실제 임계속도 = 예측 × (1 + error/100) */
  errorPct: number;
  /** 운전 회전수 [rpm] (기본 3000) */
  operatingRpm?: number;
}

const response = (rpm: number, naturalRpm: number, zeta: number) => unbalanceVector({ naturalRpm, zeta, eccentricity: 1 }, rpm);

/** 운전점의 예측·실제 응답 (e로 나눈 진폭)과 위상 지연 [rad] */
export function marginAtOperating(c: MarginCase) {
  if (!(Number.isFinite(c.af) && c.af > 0.5) || !Number.isFinite(c.smPct) || c.smPct < 0 || !Number.isFinite(c.errorPct) || c.errorPct <= -100) throw new RangeError('Invalid margin case');
  const op = c.operatingRpm ?? 3000;
  const zeta = 1 / (2 * c.af);
  const predictedNc = op * (1 + ((c.side ?? 'below') === 'above' ? 1 : -1) * (c.smPct / 100));
  if (!(predictedNc > 0)) throw new RangeError('Separation margin too large for a critical below the operating speed');
  const actualNc = predictedNc * (1 + c.errorPct / 100);
  const predicted = response(op, predictedNc, zeta);
  const actual = response(op, actualNc, zeta);
  return {
    zeta,
    predictedNc,
    actualNc,
    /** 실제 임계속도 기준 분리여유 [%] = 100·|N_op − N_c|/N_op */
    actualSmPct: (100 * Math.abs(actualNc - op)) / op,
    predictedAmp: predicted.amp,
    actualAmp: actual.amp,
    /** 실제 응답 / 예측 응답 */
    growth: actual.amp / predicted.amp,
  };
}

/** 회전수 격자의 응답 곡선 (e로 나눈 진폭) */
export function marginCurve(naturalRpm: number, af: number, rpm: readonly number[]) {
  const zeta = 1 / (2 * af);
  return rpm.map((n) => response(n, naturalRpm, zeta).amp);
}
