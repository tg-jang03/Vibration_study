/**
 * 2채널 분석 (P5-3, LAB-XCH-01·LAB-FULL-01). 순수 함수, 주파수 [Hz].
 * - 교차 스펙트럼 G_xy = ⟨X* Y⟩, 자기 스펙트럼 G_xx = ⟨∣X∣²⟩ (⟨⟩: 프레임 평균)
 * - FRF 추정 H1 = G_xy / G_xx, H2 = G_yy / G_yx (G_yx = G_xy*), 코히어런스 γ² = ∣G_xy∣² / (G_xx G_yy)
 * - Full spectrum: z = x + jy의 복소 FFT. +f bin = 정방향, −f bin = 역방향 (Contents §3, P4-2의 A_f·A_b)
 * 스펙트럼의 크기 눈금(한쪽·양쪽, PSD)은 비(H, γ²)에서 약분되므로 여기서는 bin 값 그대로 쓴다.
 */
import { fft } from './fft';
import { createWindow, type WindowType } from './window';
import type { Phasor } from './phasor';

export interface CxArray {
  re: Float64Array;
  im: Float64Array;
}

export interface CrossSpectra {
  gxx: Float64Array;
  gyy: Float64Array;
  gxy: CxArray;
  /** 평균한 프레임 수 */
  frames: number;
}

/** 프레임별 복소 스펙트럼(같은 길이)에서 자기·교차 스펙트럼 평균 */
export function averageCross(xFrames: readonly CxArray[], yFrames: readonly CxArray[]): CrossSpectra {
  const m = xFrames.length;
  if (m === 0 || yFrames.length !== m) throw new RangeError('두 채널의 프레임 수가 같아야 한다');
  const k = xFrames[0].re.length;
  const gxx = new Float64Array(k);
  const gyy = new Float64Array(k);
  const re = new Float64Array(k);
  const im = new Float64Array(k);
  for (let f = 0; f < m; f++) {
    const X = xFrames[f];
    const Y = yFrames[f];
    for (let i = 0; i < k; i++) {
      gxx[i] += (X.re[i] * X.re[i] + X.im[i] * X.im[i]) / m;
      gyy[i] += (Y.re[i] * Y.re[i] + Y.im[i] * Y.im[i]) / m;
      // X* Y
      re[i] += (X.re[i] * Y.re[i] + X.im[i] * Y.im[i]) / m;
      im[i] += (X.re[i] * Y.im[i] - X.im[i] * Y.re[i]) / m;
    }
  }
  return { gxx, gyy, gxy: { re, im }, frames: m };
}

export function frfH1(g: CrossSpectra): CxArray {
  return { re: g.gxy.re.map((v, i) => v / g.gxx[i]), im: g.gxy.im.map((v, i) => v / g.gxx[i]) };
}

/** H2 = G_yy / G_yx = G_yy / conj(G_xy) = G_yy · G_xy / ∣G_xy∣² */
export function frfH2(g: CrossSpectra): CxArray {
  const re = new Float64Array(g.gyy.length);
  const im = new Float64Array(g.gyy.length);
  for (let i = 0; i < g.gyy.length; i++) {
    const m2 = g.gxy.re[i] ** 2 + g.gxy.im[i] ** 2;
    re[i] = m2 > 0 ? (g.gyy[i] * g.gxy.re[i]) / m2 : NaN;
    im[i] = m2 > 0 ? (g.gyy[i] * g.gxy.im[i]) / m2 : NaN;
  }
  return { re, im };
}

export function coherence(g: CrossSpectra): Float64Array {
  return g.gyy.map((yy, i) => {
    const d = g.gxx[i] * yy;
    return d > 0 ? Math.min(1, (g.gxy.re[i] ** 2 + g.gxy.im[i] ** 2) / d) : 0;
  });
}

export const cxAbs = (a: CxArray): Float64Array => a.re.map((v, i) => Math.hypot(v, a.im[i]));
export const cxArg = (a: CxArray): Float64Array => a.re.map((v, i) => Math.atan2(a.im[i], v));

/** 시간 신호 두 개를 길이 n 프레임(겹침, 윈도우)으로 잘라 FFT한 0 ~ f_s/2 복소 스펙트럼 프레임들 */
export function spectraFrames(x: ArrayLike<number>, n: number, overlap = 0.5, window: WindowType = 'hann'): CxArray[] {
  const hop = Math.max(1, Math.round(n * (1 - overlap)));
  const w = createWindow(window, n);
  const out: CxArray[] = [];
  for (let s = 0; s + n <= x.length; s += hop) {
    const fr = Float64Array.from({ length: n }, (_, i) => x[s + i] * w[i]);
    const X = fft(fr);
    out.push({ re: X.real.slice(0, n / 2 + 1), im: X.imag.slice(0, n / 2 + 1) });
  }
  return out;
}

// ── Full spectrum ──

export interface FullSpectrum {
  /** −f_s/2 … +f_s/2 (오름차순) [Hz] */
  freq: Float64Array;
  /** 진폭 (원의 반지름, 입력과 같은 단위). +f = 정방향, −f = 역방향 */
  amp: Float64Array;
}

/**
 * z = x + jy의 복소 FFT. 진폭은 ∣Z_k∣ / S₁ (실신호 스펙트럼처럼 두 배 하지 않는다 — 한 방향의 원 반지름).
 * x는 오른쪽, y는 위쪽 센서. 반시계(x → y)로 도는 원은 +f에만 선다.
 */
export function fullSpectrum(x: ArrayLike<number>, y: ArrayLike<number>, fs: number, window: WindowType = 'uniform'): FullSpectrum {
  const n = x.length;
  const w = createWindow(window, n);
  let s1 = 0;
  for (let i = 0; i < n; i++) s1 += w[i];
  const Z = fft(Float64Array.from({ length: n }, (_, i) => x[i] * w[i]), Float64Array.from({ length: n }, (_, i) => y[i] * w[i]));
  const freq = new Float64Array(n);
  const amp = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    // j = 0 → k = −n/2 … j = n − 1 → k = n/2 − 1
    const k = j - n / 2;
    const idx = (k + n) % n;
    freq[j] = (k * fs) / n;
    amp[j] = Math.hypot(Z.real[idx], Z.imag[idx]) / s1;
  }
  return { freq, amp };
}

/** 한 주파수의 X·Y 복소 진폭(x = Re(X̃ e^{jωt}), y = Re(Ỹ e^{jωt}))에서 정·역 성분 (P4-2와 같은 식) */
export function forwardBackward(xRe: number, xIm: number, yRe: number, yIm: number): { af: number; ab: number } {
  // A_f = (X̃ + jỸ)/2, A_b = (X̃* + jỸ*)/2
  const afRe = (xRe - yIm) / 2;
  const afIm = (xIm + yRe) / 2;
  const abRe = (xRe + yIm) / 2;
  const abIm = (-xIm + yRe) / 2;
  return { af: Math.hypot(afRe, afIm), ab: Math.hypot(abRe, abIm) };
}

/**
 * 같은 식의 복소값을 도는 화살표 두 개로: 정방향(+f, 반시계)과 역방향(−f, 시계).
 * x + jy = A_f e^{j2πft} + A_b e^{−j2πft} — 두 화살표를 이으면 끝이 오빗을 그린다 (D-044, LAB-FULL-01).
 */
export function forwardBackwardPhasors(xRe: number, xIm: number, yRe: number, yIm: number, f: number): [Phasor, Phasor] {
  const afRe = (xRe - yIm) / 2;
  const afIm = (xIm + yRe) / 2;
  const abRe = (xRe + yIm) / 2;
  const abIm = (-xIm + yRe) / 2;
  return [
    { amp: Math.hypot(afRe, afIm), freq: f, phase: Math.atan2(afIm, afRe) },
    { amp: Math.hypot(abRe, abIm), freq: -f, phase: Math.atan2(abIm, abRe) },
  ];
}
