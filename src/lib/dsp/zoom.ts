/**
 * Zoom FFT (대역 확대 분석) 관련 순수 DSP 함수 (Contents §3, §5-1, §6).
 *
 * 1. Zoom 대역폭: B = F_max / Z
 * 2. Zoom 분해능: Δf_zoom = B / LOR = F_max / (Z * LOR) = Δf_base / Z
 * 3. 필요 측정 시간: T_zoom = 1 / Δf_zoom = Z * T_base
 * 4. 주파수 범위: [fc - B/2, fc + B/2]
 */

import { acquire } from './sampling';
import type { SignalSpec } from './signal';
import { singleSidedSpectrum, type SingleSidedSpectrum } from './spectrum';
import type { WindowType } from './window';

export interface ZoomParameters {
  /** 기본 분석 최대 주파수 F_max [Hz] */
  fmax: number;
  /** 기본 라인 수 LOR */
  lor: number;
  /** Zoom 확대 배율 Z (2 ~ 64) */
  zoomFactor: number;
  /** Zoom 중심 주파수 fc [Hz] */
  centerFreq: number;
}

export interface ZoomMetrics {
  /** 기본 분해능 Δf_base = F_max / LOR [Hz] */
  deltaFBase: number;
  /** Zoom 분해능 Δf_zoom = F_max / (Z * LOR) [Hz] */
  deltaFZoom: number;
  /** 기본 측정 시간 T_base = LOR / F_max [s] */
  durationBase: number;
  /** Zoom 측정 시간 T_zoom = 1 / Δf_zoom = Z * T_base [s] */
  durationZoom: number;
  /** Zoom 유효 대역폭 B = F_max / Z [Hz] */
  bandwidth: number;
  /** Zoom 대역 하한 [Hz] */
  fMin: number;
  /** Zoom 대역 상한 [Hz] */
  fMax: number;
  /** Zoom 샘플 수 N_zoom */
  nZoom: number;
  /** 샘플링 주파수 fs = 2.56 * F_max [Hz] */
  fs: number;
}

/**
 * Zoom FFT 파라미터로부터 대역폭, 분해능, 측정 시간을 계산한다.
 */
export function calculateZoomMetrics({
  fmax,
  lor,
  zoomFactor,
  centerFreq,
}: ZoomParameters): ZoomMetrics {
  if (fmax <= 0) throw new RangeError('fmax는 0보다 커야 한다');
  if (lor <= 0 || !Number.isInteger(lor)) throw new RangeError('lor는 0보다 큰 정수여야 한다');
  if (zoomFactor < 1) throw new RangeError('zoomFactor는 1 이상이어야 한다');
  if (centerFreq <= 0 || centerFreq >= fmax) {
    throw new RangeError('centerFreq는 0보다 크고 fmax 미만이어야 한다');
  }

  const deltaFBase = fmax / lor;
  const durationBase = lor / fmax;
  const deltaFZoom = deltaFBase / zoomFactor;
  const durationZoom = durationBase * zoomFactor;
  const bandwidth = fmax / zoomFactor;
  const fMin = Math.max(0, centerFreq - bandwidth / 2);
  const fMax = Math.min(fmax, centerFreq + bandwidth / 2);
  const fs = 2.56 * fmax;
  const nZoom = Math.round(fs * durationZoom);

  return {
    deltaFBase,
    deltaFZoom,
    durationBase,
    durationZoom,
    bandwidth,
    fMin,
    fMax,
    nZoom,
    fs,
  };
}

export interface ZoomSpectrumResult {
  metrics: ZoomMetrics;
  /** 확대된 Zoom 대역의 주파수 배열 [Hz] */
  frequency: Float64Array;
  /** 피크 진폭 배열 [Pk] */
  amplitude: Float64Array;
  /** 전체 광대역 기본 스펙트럼 (비교용) */
  baseSpectrum: SingleSidedSpectrum;
}

/**
 * 신호 모델에 대해 기본 스펙트럼과 Zoom 대역 고분해능 스펙트럼을 계산한다.
 */
export function computeZoomSpectrum(
  spec: SignalSpec,
  params: ZoomParameters,
  window: WindowType = 'hann',
): ZoomSpectrumResult {
  const metrics = calculateZoomMetrics(params);

  // 1. 기본 스펙트럼 (Z = 1, T_base)
  const nBase = Math.round(metrics.fs * metrics.durationBase);
  let fftSizeBase = 256;
  while (fftSizeBase < nBase) fftSizeBase *= 2;

  const baseSamples = acquire(spec, { fs: metrics.fs, n: nBase });
  const baseSpectrum = singleSidedSpectrum(
    { fs: metrics.fs, x: baseSamples.x },
    { fftSize: fftSizeBase, window },
  );

  // 2. Zoom 스펙트럼: 길이 T_zoom의 신호 수집 후 고분해능 FFT
  let fftSizeZoom = 256;
  while (fftSizeZoom < metrics.nZoom) fftSizeZoom *= 2;

  const zoomSamples = acquire(spec, { fs: metrics.fs, n: metrics.nZoom });
  const fullZoomSpectrum = singleSidedSpectrum(
    { fs: metrics.fs, x: zoomSamples.x },
    { fftSize: fftSizeZoom, window },
  );

  // Zoom 대역 [fMin, fMax]에 해당하는 인덱스 슬라이싱
  let startIdx = 0;
  let endIdx = fullZoomSpectrum.frequency.length - 1;

  for (let i = 0; i < fullZoomSpectrum.frequency.length; i++) {
    if (fullZoomSpectrum.frequency[i] >= metrics.fMin) {
      startIdx = i;
      break;
    }
  }

  for (let i = startIdx; i < fullZoomSpectrum.frequency.length; i++) {
    if (fullZoomSpectrum.frequency[i] > metrics.fMax) {
      endIdx = i;
      break;
    }
  }

  const zoomCount = endIdx - startIdx + 1;
  const zoomFreq = new Float64Array(zoomCount);
  const zoomAmp = new Float64Array(zoomCount);

  for (let i = 0; i < zoomCount; i++) {
    zoomFreq[i] = fullZoomSpectrum.frequency[startIdx + i];
    zoomAmp[i] = fullZoomSpectrum.amplitude[startIdx + i];
  }

  return {
    metrics,
    frequency: zoomFreq,
    amplitude: zoomAmp,
    baseSpectrum,
  };
}
