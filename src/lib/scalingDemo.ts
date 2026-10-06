/**
 * P2-7 그림과 랩(LAB-SPC-01·02)이 같이 쓰는 신호 (PageGuide §6-4: 그림 = 랩 숫자).
 * 내부 단위 SI (속도 m/s, 가속도 m/s²). 표시 단위 변환은 그림·랩에서 한다 (D-012).
 */
import { averagePower } from './dsp/average';
import { acquire } from './dsp/sampling';
import { scaledSpectrum, type ScaledSpectrum } from './dsp/scaling';
import type { SignalComponent } from './dsp/signal';
import type { WindowType } from './dsp/window';

/** 톤 + 백색 잡음 (§1 ~ §4, LAB-SPC-01). F_max 500 Hz → f_s = 1280 Hz, 50 Hz는 모든 라인 수에서 bin 중심 */
export const TONE_NOISE = {
  fmax: 500,
  fs: 1280,
  toneFreq: 50,
  /** 톤 크기 [m/s RMS] = 1 mm/s RMS */
  toneRms: 0.001,
  /** 잡음 크기 [m/s RMS] = 1 mm/s RMS (0 ~ 640 Hz 전체) */
  noiseRms: 0.001,
  seed: 20261006,
  /** 파워 평균 횟수 (P2-6) — 바닥의 흔들림을 줄여 높이를 읽기 쉽게 */
  averages: 8,
  lors: [400, 800, 1600, 3200] as const,
};

export interface ToneNoiseOptions {
  lor: number;
  window?: WindowType;
  toneRms?: number;
  noiseRms?: number;
  averages?: number;
}

/** 라인 수 lor로 잰 톤 + 잡음의 파워 평균 스펙트럼 (겹치지 않는 프레임 averages개) */
export function toneNoiseSpectrum({
  lor,
  window = 'hann',
  toneRms = TONE_NOISE.toneRms,
  noiseRms = TONE_NOISE.noiseRms,
  averages = TONE_NOISE.averages,
}: ToneNoiseOptions): ScaledSpectrum & { timeRms: number } {
  const n = Math.round(2.56 * lor);
  const { fs } = TONE_NOISE;
  const total = n * averages;
  const sig = acquire(
    {
      components: [
        { type: 'sine', freq: TONE_NOISE.toneFreq, amp: toneRms * Math.SQRT2, phase: 0.4 },
        { type: 'noise', rms: noiseRms, seed: TONE_NOISE.seed },
      ],
    },
    { fs, n: total },
  );
  let ms = 0;
  for (const v of sig.x) ms += v * v;
  const frames: ScaledSpectrum[] = [];
  for (let m = 0; m < averages; m++) frames.push(scaledSpectrum({ fs, x: sig.x.subarray(m * n, (m + 1) * n) }, { window }));
  const power = averagePower(frames.map((f) => f.power), 'linear');
  const { df, enbw, frequency } = frames[0];
  return { fs, n, df, enbw, frequency, power, psd: power.map((p) => p / (enbw * df)), timeRms: Math.sqrt(ms / total) };
}

/** 잡음만 있는 bin의 파워 기대값 = 2σ²·ENBW / N (단일측, P2-5·P2-6) */
export const noiseBinPower = (noiseRms: number, n: number, enbw: number) => (2 * noiseRms ** 2 * enbw) / n;
/** 백색 잡음의 단일측 PSD = 2σ² / f_s */
export const noisePsd = (noiseRms: number, fs = TONE_NOISE.fs) => (2 * noiseRms ** 2) / fs;

/**
 * 기계 신호 (§7, LAB-SPC-02): 1X 25 Hz와 하모닉 + 작은 성분 147 Hz(와 그 2배) + 잡음. 속도 [m/s].
 * 작은 성분은 1X의 1/150 ~ 1/400 — 선형 축에서는 보이지 않고 dB에서 보인다.
 */
export const MACHINE = {
  fs: 1280,
  lor: 1600,
  x1: 25,
  /** 차수별 Peak [m/s] */
  harmonics: [0.003, 0.0009, 0.00035, 0.00018, 0.0001],
  smallFreq: 147,
  smallPk: 0.00002,
  small2Pk: 0.0000075,
  noiseRms: 0.00002,
  seed: 31,
};
export function machineComponents(): SignalComponent[] {
  return [
    { type: 'harmonics', f0: MACHINE.x1, amps: MACHINE.harmonics, phases: [0, 0.7, 1.9, 2.4, 0.3] },
    { type: 'sine', freq: MACHINE.smallFreq, amp: MACHINE.smallPk, phase: 1.2 },
    { type: 'sine', freq: 2 * MACHINE.smallFreq, amp: MACHINE.small2Pk, phase: 0.2 },
    { type: 'noise', rms: MACHINE.noiseRms, seed: MACHINE.seed },
  ];
}

/**
 * 충격이 섞인 가속도 (§5, LAB-SPC-02): 1X 25 Hz(Δf 3.125 Hz의 8 bin, bin 중심) 1 m/s² Peak + 1초에 107번 되풀이되는 충격(울림 2.5 kHz, 시정수 1 ms).
 * 진짜 Peak는 √2·RMS(derived peak)보다 훨씬 크다.
 */
export const IMPACT = {
  fs: 25600,
  n: 8192,
  x1: 25,
  x1Pk: 1,
  rate: 107,
  amp: 6,
  ringFreq: 2500,
  decay: 0.001,
  noiseRms: 0.02,
  seed: 11,
};
export function impactComponents(): SignalComponent[] {
  return [
    { type: 'sine', freq: IMPACT.x1, amp: IMPACT.x1Pk, phase: -Math.PI / 2 },
    { type: 'impulses', rate: IMPACT.rate, amp: IMPACT.amp, ringFreq: IMPACT.ringFreq, decay: IMPACT.decay, offset: 0.004 },
    { type: 'noise', rms: IMPACT.noiseRms, seed: IMPACT.seed },
  ];
}
