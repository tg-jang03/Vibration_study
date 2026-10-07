/**
 * 엔벨로프 분석 · Spectral Kurtosis · Kurtogram (P5-6, LAB-ENV-01 · LAB-SK-01). 순수 함수, 주파수 [Hz], 시간 [s].
 *
 * 해석 신호 x_a = x + jH{x}: 스펙트럼의 음의 주파수를 0으로, 양의 주파수를 2배로 → 역FFT. 포락선 = |x_a|.
 * 대역 통과는 FFT 영역에서 대역 밖 bin을 0으로 만드는 방법(저장된 기록, 영위상)으로 한다.
 * Spectral Kurtosis(Antoni): 대역 복소 포락선 c의 SK = E|c|⁴ / (E|c|²)² − 2 — 정규 잡음만 있으면 0, 충격성이 크면 양수,
 * 크기가 일정한 정현파는 −1. Kurtogram은 대역폭 (f_s/2)/2^k (k = 1, 2, …)로 0 ~ f_s/2를 나눈 칸마다의 SK 지도 (1/3 단계는 생략).
 */
import { fft } from './fft';
import { hannWindow } from './window';

export interface Cplx {
  re: Float64Array;
  im: Float64Array;
}

const isPow2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

/** 역FFT (정규화 1/N): conj(FFT(conj X)) / N */
export function ifft(re: ArrayLike<number>, im: ArrayLike<number>): Cplx {
  const n = re.length;
  const s = fft(re, Float64Array.from(im, (v) => -v));
  return { re: s.real.map((v) => v / n), im: s.imag.map((v) => -v / n) };
}

/** 실신호의 FFT (길이는 2의 거듭제곱) */
export function spectrumOf(x: ArrayLike<number>): Cplx {
  if (!isPow2(x.length)) throw new RangeError('length must be a power of 2');
  const s = fft(x);
  return { re: s.real, im: s.imag };
}

/**
 * 대역 [f1, f2]만 남긴 해석 신호 (양의 주파수만, 2배). 실수부 = 대역 통과한 실신호, 크기 = 그 포락선.
 * f1 ≤ 0, f2 ≥ f_s/2이면 전체 해석 신호. X는 spectrumOf(x)로 미리 구해 재사용할 수 있다.
 */
export function bandAnalytic(X: Cplx, fs: number, f1: number, f2: number): Cplx {
  const n = X.re.length;
  const df = fs / n;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const k1 = Math.max(0, Math.ceil(f1 / df - 1e-9));
  const k2 = Math.min(n / 2, Math.floor(f2 / df + 1e-9));
  for (let k = k1; k <= k2; k++) {
    const g = k === 0 || k === n / 2 ? 1 : 2;
    re[k] = g * X.re[k];
    im[k] = g * X.im[k];
  }
  return ifft(re, im);
}

/** 전체 해석 신호 x + jH{x} */
export function analyticSignal(x: ArrayLike<number>, fs = 1): Cplx {
  return bandAnalytic(spectrumOf(x), fs, 0, fs / 2);
}

/** 포락선 |x_a| */
export function magnitude(c: Cplx): Float64Array {
  return c.re.map((v, i) => Math.hypot(v, c.im[i]));
}

export interface EnvelopeSpectrum {
  /** 대역 통과한 실신호와 그 포락선 */
  band: Float64Array;
  envelope: Float64Array;
  /** 포락선 스펙트럼 (평균을 빼고 Hann, Peak 진폭) */
  freq: Float64Array;
  amp: Float64Array;
}

/** 엔벨로프 분석: 대역 통과 → 포락선 → 평균 빼기 → Hann FFT */
export function envelopeSpectrum(X: Cplx, fs: number, f1: number, f2: number, fMax = fs / 2): EnvelopeSpectrum {
  const c = bandAnalytic(X, fs, f1, f2);
  const env = magnitude(c);
  const n = env.length;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += env[i];
  mean /= n;
  const w = hannWindow(n);
  let s1 = 0;
  for (let i = 0; i < n; i++) s1 += w[i];
  const s = fft(env.map((v, i) => (v - mean) * w[i]));
  const df = fs / n;
  const kMax = Math.min(n / 2, Math.floor(fMax / df));
  const freq = new Float64Array(kMax + 1);
  const amp = new Float64Array(kMax + 1);
  for (let k = 0; k <= kMax; k++) {
    freq[k] = k * df;
    amp[k] = ((k === 0 ? 1 : 2) * Math.hypot(s.real[k], s.imag[k])) / s1;
  }
  return { band: c.re, envelope: env, freq, amp };
}

/** 스펙트럼에서 f 근처(±tol Hz)의 가장 큰 진폭 */
export function peakNear(freq: ArrayLike<number>, amp: ArrayLike<number>, f: number, tol: number): number {
  let m = 0;
  for (let k = 0; k < freq.length; k++) if (Math.abs(freq[k] - f) <= tol) m = Math.max(m, amp[k]);
  return m;
}

/** 복소 포락선의 SK = E|c|⁴/(E|c|²)² − 2 */
export function complexKurtosis(re: ArrayLike<number>, im: ArrayLike<number>): number {
  let m2 = 0;
  let m4 = 0;
  for (let i = 0; i < re.length; i++) {
    const p = re[i] * re[i] + im[i] * im[i];
    m2 += p;
    m4 += p * p;
  }
  const n = re.length;
  m2 /= n;
  m4 /= n;
  return m2 === 0 ? 0 : m4 / (m2 * m2) - 2;
}

/**
 * STFT로 본 Spectral Kurtosis: 프레임 n점(Hann), hop n/4. bin마다 SK(f) = ⟨|X|⁴⟩/⟨|X|²⟩² − 2.
 * 함께 평균 파워 ⟨|X|²⟩도 돌려준다 (같은 주파수 눈금의 PSD 모양).
 */
export function spectralKurtosis(x: ArrayLike<number>, fs: number, n: number): { freq: Float64Array; sk: Float64Array; power: Float64Array } {
  if (!isPow2(n)) throw new RangeError('n must be a power of 2');
  const w = hannWindow(n);
  const hop = n / 4;
  const half = n / 2;
  const m2 = new Float64Array(half + 1);
  const m4 = new Float64Array(half + 1);
  let frames = 0;
  const buf = new Float64Array(n);
  for (let s = 0; s + n <= x.length; s += hop) {
    for (let i = 0; i < n; i++) buf[i] = x[s + i] * w[i];
    const X = fft(buf);
    for (let k = 0; k <= half; k++) {
      const p = X.real[k] * X.real[k] + X.imag[k] * X.imag[k];
      m2[k] += p;
      m4[k] += p * p;
    }
    frames++;
  }
  const freq = new Float64Array(half + 1);
  const sk = new Float64Array(half + 1);
  const power = new Float64Array(half + 1);
  for (let k = 0; k <= half; k++) {
    freq[k] = (k * fs) / n;
    const a = m2[k] / frames;
    power[k] = a;
    sk[k] = a === 0 ? 0 : m4[k] / frames / (a * a) - 2;
  }
  return { freq, sk, power };
}

export interface KurtogramCell {
  level: number;
  f1: number;
  f2: number;
  fc: number;
  bw: number;
  sk: number;
}

export interface Kurtogram {
  levels: number[];
  /** levels[i]의 칸들 (낮은 주파수부터) */
  rows: KurtogramCell[][];
  best: KurtogramCell;
}

/**
 * Kurtogram: 레벨 k = 1 … maxLevel에서 폭 (f_s/2)/2^k인 칸을 반 칸씩 옮겨 가며(2^(k+1) − 1칸) 칸마다 복소 포락선의 SK.
 * 반씩 겹치는 것은 공진이 칸 경계에 걸려 둘로 잘리는 것을 피하려는 것이다 (Fast Kurtogram의 1/3 단계 대신).
 * 칸의 bin만 꺼내 0 Hz로 옮긴 뒤 작은 역FFT로 포락선을 만든다 (Fast Kurtogram처럼 칸 폭만큼의 표본률).
 */
export function kurtogram(X: Cplx, fs: number, maxLevel = 7): Kurtogram {
  const n = X.re.length;
  const df = fs / n;
  const levels: number[] = [];
  const rows: KurtogramCell[][] = [];
  let best: KurtogramCell | undefined;
  for (let level = 1; level <= maxLevel; level++) {
    const bw = fs / 2 / 2 ** level;
    const count = 2 ** (level + 1) - 1;
    const row: KurtogramCell[] = [];
    for (let i = 0; i < count; i++) {
      const f1 = (i * bw) / 2;
      const f2 = f1 + bw;
      const k1 = Math.round(f1 / df);
      const k2 = Math.round(f2 / df);
      const len = k2 - k1;
      let m = 1;
      while (m < len) m *= 2;
      const re = new Float64Array(m);
      const im = new Float64Array(m);
      for (let k = k1; k < k2; k++) {
        re[k - k1] = X.re[k];
        im[k - k1] = X.im[k];
      }
      const c = ifft(re, im);
      const cell: KurtogramCell = { level, f1, f2, fc: (f1 + f2) / 2, bw, sk: complexKurtosis(c.re, c.im) };
      row.push(cell);
      if (!best || cell.sk > best.sk) best = cell;
    }
    levels.push(level);
    rows.push(row);
  }
  return { levels, rows, best: best! };
}

/**
 * 그리기용 격자: 0 ~ f_s/2를 cols칸으로 나눈 열마다, 각 레벨에서 가운데가 가장 가까운 칸의 SK.
 * 돌려주는 x는 열 경계(cols + 1개), z[레벨][열].
 */
export function kurtogramGrid(kg: Kurtogram, fs: number, cols = 256): { x: Float64Array; z: Float64Array[] } {
  const w = fs / 2 / cols;
  const x = Float64Array.from({ length: cols + 1 }, (_, i) => i * w);
  const z = kg.rows.map((row) =>
    Float64Array.from({ length: cols }, (_, i) => {
      const c = (i + 0.5) * w;
      let b = row[0];
      for (const cell of row) if (Math.abs(cell.fc - c) < Math.abs(b.fc - c)) b = cell;
      return b.sk;
    }),
  );
  return { x, z };
}
