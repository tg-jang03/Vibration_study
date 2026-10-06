/**
 * P2-8 그림과 랩(LAB-MOD-01)이 같이 쓰는 신호와 계산 (PageGuide §6-4: 그림 = 랩 숫자).
 * 속도 진동 [m/s], 표시할 때 mm/s Peak로 바꾼다 (D-012). f_s = 1024 Hz, 측정 시간 T [s] → N = 1024·T, Δf = 1/T.
 */
import { acquire } from './dsp/sampling';
import type { SignalComponent } from './dsp/signal';
import { singleSidedSpectrum } from './dsp/spectrum';

export const MOD_FS = 1024;
/** 반송파 진폭 1 mm/s Peak [m/s] */
export const MOD_AMP = 0.001;

/** 기어 예: 이빨 15개 기어가 20 Hz로 돌면 맞물림 주파수 300 Hz. 축 B는 12.5 Hz */
export const GEAR_EXAMPLE = { mesh: 300, shaftA: 20, shaftB: 12.5, m: 0.3 };
/** 맥놀이 예: 1800 rpm(30 Hz)과 1770 rpm(29.5 Hz)으로 도는 이웃한 두 기계 */
export const BEAT_EXAMPLE = { f1: 30, f2: 29.5, a1: 1, a2: 0.6 };

export interface ModSpectrum {
  frequency: Float64Array;
  /** 단일측 Peak 진폭 [mm/s] (Hann + 진폭 보정) */
  amplitude: Float64Array;
  df: number;
}

/** 성분 목록을 T초 동안 재서 Hann 스펙트럼을 mm/s Peak로 */
export function modSpectrum(components: readonly SignalComponent[], seconds: number): ModSpectrum {
  const n = Math.round(MOD_FS * seconds);
  const s = singleSidedSpectrum(acquire({ components }, { fs: MOD_FS, n }), { window: 'hann' });
  return { frequency: s.frequency, amplitude: s.amplitude.map((a) => (Math.abs(a) < 1e-15 ? 0 : a * 1000)), df: s.binSpacing };
}

/** 스펙트럼의 f 근처(±2 bin)에서 가장 큰 막대 [mm/s] */
export function peakNear(s: ModSpectrum, f: number): number {
  const k = Math.round(f / s.df);
  let best = 0;
  for (let j = Math.max(0, k - 2); j <= Math.min(s.amplitude.length - 1, k + 2); j++) best = Math.max(best, s.amplitude[j]);
  return best;
}

/** 진폭 비의 dB (0 이하는 −200) */
export const relDb = (a: number, ref: number) => (a > 0 && ref > 0 ? 20 * Math.log10(a / ref) : -200);
