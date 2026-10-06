/**
 * 진동 센서 모델 (P3-1, LAB-SNS-01). 센서 = 통 안에 질량·스프링·감쇠가 든 기초가진 1자유도 계 (D-031).
 * 통(기계 표면)이 움직이면 질량과 통 사이의 상대 운동 z가 생기고, 센서는 그 z(또는 dz/dt)를 전압으로 바꾼다.
 *   m z̈ + c ż + k z = −m ÿ  →  z/Y = r²H(r),  z = −(ÿ/ω_n²)·H(r)
 * - 가속도계(압전): 출력 ∝ z ∝ 가속도 × H(r) → r ≪ 1에서 평탄 (P1-4의 진폭비 그대로)
 * - 동전형 속도계: 출력 ∝ ż, 실제 속도 대비 r²H(r) → r ≫ 1에서 평탄
 * - 비접촉 변위 센서: 질량-스프링 없이 거리를 직접 잰다 → 대역 안에서 1
 * 계산은 lib/mck(트랙 B)의 H(r)·r²H(r)를 가져다 쓴다.
 */
import { steadyStateResponse, unbalanceResponseFactor } from './mck';

export type SensorKind = 'accelerometer' | 'velocity' | 'proximity';

export interface SensorResponse {
  /** 센서가 읽은 값 ÷ 실제 값 (1이면 정확) */
  ratio: number;
  /** 위상 오차 [rad] — 양수면 실제보다 늦음. 가속도계는 φ(r), 속도계는 φ(r) − π (높은 주파수의 180°를 기준으로 본 차이) */
  phaseError: number;
}

/** 주파수 f [Hz]에서 센서의 응답. fn: 센서(또는 설치) 고유진동수 [Hz], zeta: 감쇠비 */
export function sensorResponse(kind: SensorKind, f: number, fn: number, zeta: number): SensorResponse {
  if (!(f >= 0) || !(fn > 0) || !(zeta >= 0)) throw new RangeError('f ≥ 0, fn > 0, ζ ≥ 0이어야 한다');
  if (kind === 'proximity') return { ratio: 1, phaseError: 0 };
  const r = f / fn;
  if (kind === 'accelerometer') {
    const h = steadyStateResponse(r, zeta);
    return { ratio: h.amplitudeRatio, phaseError: h.phaseLag };
  }
  const u = unbalanceResponseFactor(r, zeta);
  return { ratio: u.factor, phaseError: u.phaseLag - Math.PI };
}

export interface FlatBand {
  /** 평탄 대역의 아래 끝 [Hz] (가속도계는 0) */
  lo: number;
  /** 평탄 대역의 위 끝 [Hz] (속도계는 Infinity) */
  hi: number;
}

/**
 * 진폭비가 1 ± tol 안에 드는 대역. 가속도계는 0 Hz부터 위로, 속도계는 아주 높은 주파수부터 아래로 이어지는 구간.
 * 로그 격자로 경계를 찾은 뒤 이분법으로 다듬는다.
 */
export function flatBand(kind: SensorKind, fn: number, zeta: number, tol = 0.1): FlatBand {
  if (kind === 'proximity') return { lo: 0, hi: Infinity };
  const ok = (f: number) => Math.abs(sensorResponse(kind, f, fn, zeta).ratio - 1) <= tol;
  const steps = 4000;
  const f = (i: number) => fn * 10 ** (-4 + (8 * i) / steps); // fn × 10⁻⁴ ~ fn × 10⁴
  const refine = (good: number, bad: number) => {
    let g = good;
    let b = bad;
    for (let k = 0; k < 60; k++) {
      const m = Math.sqrt(g * b);
      if (ok(m)) g = m;
      else b = m;
    }
    return g;
  };
  if (kind === 'accelerometer') {
    for (let i = 1; i <= steps; i++) if (!ok(f(i))) return { lo: 0, hi: refine(f(i - 1), f(i)) };
    return { lo: 0, hi: Infinity };
  }
  for (let i = steps - 1; i >= 0; i--) if (!ok(f(i))) return { lo: refine(f(i + 1), f(i)), hi: Infinity };
  return { lo: 0, hi: Infinity };
}

export type MountKind = 'stud' | 'adhesive' | 'magnet' | 'hand';

/** 가속도계 마운팅별 설치 공진 — 예시값 (I-025: 센서·접촉면·자석 크기에 따라 크게 다르다) */
export const MOUNTS: Record<MountKind, { label: string; fn: number; zeta: number }> = {
  stud: { label: '스터드 (나사 고정)', fn: 25000, zeta: 0.02 },
  adhesive: { label: '접착', fn: 18000, zeta: 0.03 },
  magnet: { label: '자석', fn: 7000, zeta: 0.05 },
  hand: { label: '손으로 대기 (탐침)', fn: 2000, zeta: 0.1 },
};
