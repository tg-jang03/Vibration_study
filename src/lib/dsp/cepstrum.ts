/**
 * 켑스트럼 · 리프터링 · 자기상관 (P5-7, LAB-CEP-01). 순수 함수, 시간·quefrency [s], 주파수 [Hz].
 *
 * 실 켑스트럼 c(τ) = IFFT{ ln A(f) } — A는 Hann 단일측 진폭(양쪽으로 대칭)을 쓴다.
 * 스펙트럼에 간격 Δf로 늘어선 줄 무리(하모닉·측대역)는 ln A(f)에 주기 Δf의 물결을 만들고, 그 물결은 quefrency 1/Δf에 봉우리(라모닉)로 모인다.
 * 리프터링: 켑스트럼의 일부를 0으로 만든 뒤 FFT → exp로 되돌린 스펙트럼.
 *  - 빗 리프터(comb): τ₀의 정수배 근처를 지워 그 간격의 줄 무리를 지운다.
 *  - 낮은 리프터(low-pass): τ < τ_c만 남겨 매끈한 스펙트럼 모양(전달 경로의 공진 모양)만 남긴다.
 * 자기상관 R(τ) = IFFT{|X|²} (2배 길이로 0을 덧붙여 순환을 피함), R(0) = 1로 나눈다.
 */
import { fft } from './fft';
import { ifft } from './envelope';
import { hannWindow } from './window';

export interface Cepstrum {
  fs: number;
  n: number;
  /** quefrency [s], 0 ~ (n/2)/fs */
  quefrency: Float64Array;
  /** 실 켑스트럼 (길이 n, 대칭) */
  c: Float64Array;
  /** 단일측 진폭 스펙트럼 (0 ~ f_s/2)과 그 자연로그 (길이 n, 대칭) */
  freq: Float64Array;
  amp: Float64Array;
  logAmp: Float64Array;
}

/** 실 켑스트럼. x 길이는 2의 거듭제곱 */
export function realCepstrum(x: ArrayLike<number>, fs: number): Cepstrum {
  const n = x.length;
  const w = hannWindow(n);
  let s1 = 0;
  for (let i = 0; i < n; i++) s1 += w[i];
  let mean = 0;
  for (let i = 0; i < n; i++) mean += x[i];
  mean /= n;
  const X = fft(Float64Array.from({ length: n }, (_, i) => (x[i] - mean) * w[i]));
  const full = new Float64Array(n);
  let max = 0;
  for (let k = 0; k < n; k++) {
    full[k] = (2 * Math.hypot(X.real[k], X.imag[k])) / s1;
    max = Math.max(max, full[k]);
  }
  const floor = max * 1e-7;
  const logAmp = full.map((v) => Math.log(v + floor));
  const c = ifft(logAmp, new Float64Array(n)).re;
  const half = n / 2;
  return {
    fs,
    n,
    quefrency: Float64Array.from({ length: half + 1 }, (_, q) => q / fs),
    c,
    freq: Float64Array.from({ length: half + 1 }, (_, k) => (k * fs) / n),
    amp: full.slice(0, half + 1),
    logAmp,
  };
}

/** 켑스트럼을 고쳐(edited, 길이 n) 진폭 스펙트럼 0 ~ f_s/2로 되돌린다: exp(FFT(c')) */
export function spectrumFromCepstrum(c: Float64Array): Float64Array {
  const n = c.length;
  const L = fft(c).real;
  return Float64Array.from({ length: n / 2 + 1 }, (_, k) => Math.exp(L[k]));
}

/** 빗 리프터: τ₀·k (k = 1 … kMax) ± halfWidth [s]를 0으로 (양쪽 대칭) → 그 간격의 줄 무리가 지워진 스펙트럼 */
export function combLifter(cep: Cepstrum, tau0: number, halfWidth: number, kMax = 50): Float64Array {
  const { n, fs } = cep;
  const c = Float64Array.from(cep.c);
  const hw = Math.max(1, Math.round(halfWidth * fs));
  for (let k = 1; k <= kMax; k++) {
    const q0 = Math.round(k * tau0 * fs);
    if (q0 - hw >= n / 2) break;
    for (let q = q0 - hw; q <= q0 + hw; q++) {
      if (q <= 0 || q >= n / 2) continue;
      c[q] = 0;
      c[n - q] = 0;
    }
  }
  return spectrumFromCepstrum(c);
}

/** 낮은 리프터: |τ| < tauCut만 남긴다 → 매끈한 스펙트럼 모양 */
export function lowLifter(cep: Cepstrum, tauCut: number): Float64Array {
  const { n, fs } = cep;
  const qc = Math.round(tauCut * fs);
  const c = cep.c.map((v, q) => (q <= qc || q >= n - qc ? v : 0));
  return spectrumFromCepstrum(c);
}

/** τ 근처(±tol [s])에서 켑스트럼의 가장 큰 값 */
export function cepstrumPeak(cep: Cepstrum, tau: number, tol: number): number {
  let m = -Infinity;
  for (let q = 1; q < cep.quefrency.length; q++) if (Math.abs(cep.quefrency[q] - tau) <= tol) m = Math.max(m, cep.c[q]);
  return m;
}

/** 자기상관 (평균을 빼고, R(0) = 1). 지연 0 ~ n − 1 표본 */
export function autocorrelation(x: ArrayLike<number>): Float64Array {
  const n = x.length;
  let m = 1;
  while (m < 2 * n) m *= 2;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += x[i];
  mean /= n;
  const buf = new Float64Array(m);
  for (let i = 0; i < n; i++) buf[i] = x[i] - mean;
  const X = fft(buf);
  const p = X.real.map((v, k) => v * v + X.imag[k] * X.imag[k]);
  const r = ifft(p, new Float64Array(m)).re;
  const r0 = r[0] || 1;
  return Float64Array.from({ length: n }, (_, i) => r[i] / r0);
}
