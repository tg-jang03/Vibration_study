/**
 * TSA(P1-5 §4)용 가상 기어 상자 신호 — 본문 그림(src/figures/p1-5.ts)과 랩(LAB-AVG-02)이 같은 신호를 쓴다.
 * 축 A: 20 Hz(1200 rpm), 기어 이빨 15개 → 맞물림 300 Hz(15차)와 30차, 1X. 120° 자리 이빨의 결함이 한 바퀴에 한 번 충격(울림 700 Hz).
 * 축 B: 다른 속도로 도는 이웃 축의 성분 (주파수 = 축 A 회전 주파수의 ρ배, ρ는 정수가 아님).
 * 잡음: 백색, 시드 고정. 단위는 가속도 m/s² (SI, D-012). 한 바퀴 256점 → f_s = 5120 Hz.
 */
import type { SignalComponent, SignalSpec } from './dsp/signal';

export const GEARBOX = {
  shaftHz: 20,
  rpm: 1200,
  samplesPerRev: 256,
  fs: 20 * 256,
  teeth: 15,
  shaft1xAmp: 0.25,
  meshAmp: 1.0,
  mesh2Amp: 0.35,
  defectDeg: 120,
  defectAmp: 1.2,
  ringHz: 700,
  decay: 0.0025,
  bRatio: 13.4,
  bAmp: 1.0,
  noiseRms: 0.8,
  seed: 20261006,
  /** Residual을 만들 때 빼는 규칙적인 성분: 1X와 맞물림 성분(15차, 30차) */
  regularOrders: [1, 15, 30] as readonly number[],
} as const;

export interface GearboxOptions {
  /** 축 A 성분(1X·맞물림) */
  shaftA?: boolean;
  /** 축 A의 결함 충격 */
  defect?: boolean;
  /** 축 B 성분, 주파수비 ρ */
  shaftB?: boolean;
  bRatio?: number;
  /** 잡음 RMS [m/s²], 0이면 없음 */
  noiseRms?: number;
}

export function gearboxSpec({
  shaftA = true,
  defect = true,
  shaftB = true,
  bRatio = GEARBOX.bRatio,
  noiseRms = GEARBOX.noiseRms,
}: GearboxOptions = {}): SignalSpec {
  const g = GEARBOX;
  const components: SignalComponent[] = [];
  if (shaftA) {
    components.push(
      { type: 'sine', freq: g.shaftHz, amp: g.shaft1xAmp, phase: 0.2 },
      { type: 'sine', freq: g.teeth * g.shaftHz, amp: g.meshAmp, phase: 0.4 },
      { type: 'sine', freq: 2 * g.teeth * g.shaftHz, amp: g.mesh2Amp, phase: 1.3 },
    );
  }
  if (defect) {
    components.push({
      type: 'impulses',
      rate: g.shaftHz,
      amp: g.defectAmp,
      ringFreq: g.ringHz,
      decay: g.decay,
      offset: g.defectDeg / 360 / g.shaftHz,
    });
  }
  if (shaftB) components.push({ type: 'sine', freq: bRatio * g.shaftHz, amp: g.bAmp, phase: 0.7 });
  if (noiseRms > 0) components.push({ type: 'noise', rms: noiseRms, seed: g.seed });
  return { components };
}
