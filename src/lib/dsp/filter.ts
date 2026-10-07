/**
 * 디지털 필터와 적분 (P5-1, LAB-FLT-01·LAB-INT-01). 순수 함수, 주파수 [Hz], 시간 [s].
 *
 * IIR: 아날로그 원형(Butterworth · Chebyshev I · Bessel, 차단 각주파수 1) → 차단 주파수 f_c에 맞춰 늘림(prewarp)
 *      → 쌍선형 변환(bilinear) → 2차 구간(SOS)으로 거른다. 응답(크기·위상·군지연)은 극·영점에서 바로 계산한다.
 * 차단 주파수의 약속: Butterworth·Bessel·FIR은 크기가 1/√2(−3 dB)가 되는 곳, Chebyshev I는 통과 대역 리플의 끝(−R_p dB).
 * 기준값: Butterworth는 쌍선형 변환 뒤에도 |H| = 1/√(1 + (tan(πf/f_s) / tan(πf_c/f_s))^{2n})가 정확히 성립한다.
 * FIR: Hamming 창 저역 통과(대칭 계수 → 선형 위상, 군지연 (N − 1)/2 샘플).
 */
import { fft } from './fft';

export type FilterFamily = 'butterworth' | 'chebyshev1' | 'bessel';
export type FilterKind = 'lowpass' | 'highpass';

interface Cx {
  re: number;
  im: number;
}
const cx = (re: number, im = 0): Cx => ({ re, im });
const cAdd = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
const cSub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
const cMul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cDiv = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const cAbs = (a: Cx): number => Math.hypot(a.re, a.im);
const cScale = (a: Cx, k: number): Cx => cx(a.re * k, a.im * k);

/** 2차 구간 하나: y = (b0 + b1 z⁻¹ + b2 z⁻²) / (1 + a1 z⁻¹ + a2 z⁻²) · x */
export interface Biquad {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export interface IirDesign {
  family: FilterFamily;
  kind: FilterKind;
  order: number;
  fc: number;
  fs: number;
  rippleDb: number;
  zeros: Cx[];
  poles: Cx[];
  gain: number;
  sos: Biquad[];
}

// ── 아날로그 원형 (저역 통과, 차단 각주파수 1) ──

/** 역 Bessel 다항식 θ_n(s)의 계수 a_0 … a_n (a_n = 1). H(s) = a_0 / θ_n(s)는 s = 0에서 군지연이 1인 Bessel 필터 */
export function besselPolynomial(n: number): number[] {
  const fact = (k: number) => {
    let f = 1;
    for (let i = 2; i <= k; i++) f *= i;
    return f;
  };
  return Array.from({ length: n + 1 }, (_, k) => fact(2 * n - k) / (2 ** (n - k) * fact(k) * fact(n - k)));
}

/** 실계수 다항식 Σ a_k s^k의 근 (Durand–Kerner). a는 낮은 차수부터, a_n ≠ 0 */
export function polyRoots(a: number[]): Cx[] {
  const n = a.length - 1;
  const lead = a[n];
  const coef = a.map((v) => v / lead);
  const evalP = (z: Cx) => {
    let acc = cx(1);
    for (let k = n - 1; k >= 0; k--) acc = cAdd(cMul(acc, z), cx(coef[k]));
    return acc;
  };
  const radius = Math.max(1, Math.abs(coef[0]) ** (1 / n));
  let z = Array.from({ length: n }, (_, i) => {
    const th = (2 * Math.PI * i) / n + 0.4;
    return cx(radius * Math.cos(th), radius * Math.sin(th));
  });
  for (let it = 0; it < 500; it++) {
    let moved = 0;
    z = z.map((zi, i) => {
      let den = cx(1);
      z.forEach((zj, j) => {
        if (j !== i) den = cMul(den, cSub(zi, zj));
      });
      const step = cDiv(evalP(zi), den);
      moved = Math.max(moved, cAbs(step));
      return cSub(zi, step);
    });
    if (moved < 1e-14 * radius) break;
  }
  return z;
}

/** 원형의 극과 DC 이득. Chebyshev I는 짝수 차수에서 DC 이득이 리플만큼 낮다 */
export function analogPrototype(family: FilterFamily, order: number, rippleDb = 1): { poles: Cx[]; dcGain: number } {
  if (!Number.isInteger(order) || order < 1 || order > 12) throw new RangeError('차수는 1 ~ 12');
  const n = order;
  if (family === 'butterworth') {
    const poles = Array.from({ length: n }, (_, k) => {
      const th = ((2 * k + 1) * Math.PI) / (2 * n);
      return cx(-Math.sin(th), Math.cos(th));
    });
    return { poles, dcGain: 1 };
  }
  if (family === 'chebyshev1') {
    const eps = Math.sqrt(10 ** (rippleDb / 10) - 1);
    const mu = Math.asinh(1 / eps) / n;
    const poles = Array.from({ length: n }, (_, k) => {
      const th = ((2 * k + 1) * Math.PI) / (2 * n);
      return cx(-Math.sinh(mu) * Math.sin(th), Math.cosh(mu) * Math.cos(th));
    });
    return { poles, dcGain: n % 2 === 0 ? 1 / Math.sqrt(1 + eps * eps) : 1 };
  }
  // Bessel: θ_n의 근을 크기 −3 dB가 ω = 1에 오도록 줄인다
  const a = besselPolynomial(n);
  const raw = polyRoots(a);
  const mag2 = (w: number) => {
    let den = cx(1);
    for (const p of raw) den = cMul(den, cSub(cx(0, w), p));
    return (a[0] * a[0]) / (den.re * den.re + den.im * den.im);
  };
  let lo = 1e-3;
  let hi = 100;
  for (let it = 0; it < 200; it++) {
    const mid = Math.sqrt(lo * hi);
    if (mag2(mid) > 0.5) lo = mid;
    else hi = mid;
  }
  const w3 = Math.sqrt(lo * hi);
  return { poles: raw.map((p) => cScale(p, 1 / w3)), dcGain: 1 };
}

// ── 디지털 설계 ──

export interface IirOptions {
  family: FilterFamily;
  kind?: FilterKind;
  order: number;
  /** 차단 주파수 [Hz] (0 < f_c < f_s/2) */
  fc: number;
  fs: number;
  /** Chebyshev I 통과 대역 리플 [dB] */
  rippleDb?: number;
}

export function designIir({ family, kind = 'lowpass', order, fc, fs, rippleDb = 1 }: IirOptions): IirDesign {
  if (!(fc > 0 && fc < fs / 2)) throw new RangeError('0 < f_c < f_s/2');
  const { poles: proto, dcGain } = analogPrototype(family, order, rippleDb);
  const k2 = 2 * fs;
  const omega = k2 * Math.tan((Math.PI * fc) / fs); // prewarp
  const analog = proto.map((p) => (kind === 'lowpass' ? cScale(p, omega) : cDiv(cx(omega), p)));
  const poles = analog.map((p) => cDiv(cAdd(cx(k2), p), cSub(cx(k2), p)));
  const z0 = kind === 'lowpass' ? -1 : 1;
  const zeros = poles.map(() => cx(z0));
  // 이득: 저역 통과는 z = 1(DC), 고역 통과는 z = −1(나이퀴스트)에서 원형의 DC 이득과 같게
  const zRef = cx(kind === 'lowpass' ? 1 : -1);
  let ratio = cx(1);
  for (let i = 0; i < poles.length; i++) ratio = cMul(ratio, cDiv(cSub(zRef, zeros[i]), cSub(zRef, poles[i])));
  const gain = dcGain / ratio.re;
  return { family, kind, order, fc, fs, rippleDb, zeros, poles, gain, sos: toSos(poles, z0, gain) };
}

/** 켤레 극을 2차 구간으로 묶는다 (영점은 모두 z0). 이득은 첫 구간에 */
function toSos(poles: Cx[], z0: number, gain: number): Biquad[] {
  const pairs = poles.filter((p) => p.im > 1e-12);
  const reals = poles.filter((p) => Math.abs(p.im) <= 1e-12).map((p) => p.re);
  const sos: Biquad[] = pairs.map((p) => ({ b0: 1, b1: -2 * z0, b2: z0 * z0, a1: -2 * p.re, a2: p.re * p.re + p.im * p.im }));
  for (let i = 0; i + 1 < reals.length; i += 2) {
    sos.push({ b0: 1, b1: -2 * z0, b2: z0 * z0, a1: -(reals[i] + reals[i + 1]), a2: reals[i] * reals[i + 1] });
  }
  if (reals.length % 2 === 1) sos.push({ b0: 1, b1: -z0, b2: 0, a1: -reals[reals.length - 1], a2: 0 });
  sos[0] = { ...sos[0], b0: sos[0].b0 * gain, b1: sos[0].b1 * gain, b2: sos[0].b2 * gain };
  return sos;
}

// ── 응답 ──

export interface FreqResponse {
  freq: number[];
  /** 크기 (배) */
  mag: number[];
  /** 위상 [rad], 이어 붙인 값 (저역 통과는 0에서 시작해 음수로) */
  phase: number[];
  /** 군지연 [s] = −dφ/dω */
  groupDelay: number[];
}

/** 극·영점에서 바로: H = k Π(e^{jω} − z_i) / Π(e^{jω} − p_i). 위상은 인수마다의 각을 더해 이어진다 */
export function iirResponse(d: IirDesign, freqs: ArrayLike<number>): FreqResponse {
  const out: FreqResponse = { freq: [], mag: [], phase: [], groupDelay: [] };
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    const w = (2 * Math.PI * f) / d.fs;
    const e = cx(Math.cos(w), Math.sin(w));
    let mag = Math.abs(d.gain);
    let ph = d.gain < 0 ? Math.PI : 0;
    let tau = 0;
    const term = (c: Cx, sign: 1 | -1) => {
      const diff = cSub(e, c);
      const m = cAbs(diff);
      mag = sign === 1 ? mag * m : mag / m;
      ph += sign * Math.atan2(diff.im, diff.re);
      // d/dω arg(e^{jω} − c) = Re{e^{jω} / (e^{jω} − c)}
      tau -= sign * (m > 1e-15 ? cDiv(e, diff).re : 0);
    };
    d.zeros.forEach((z) => term(z, 1));
    d.poles.forEach((p) => term(p, -1));
    out.freq.push(f);
    out.mag.push(mag);
    out.phase.push(ph);
    out.groupDelay.push(tau / d.fs);
  }
  return out;
}

// ── 거르기 ──

/** SOS 거르기 (전치 직접형 II). zi: 구간마다 [s1, s2] */
export function sosFilter(sos: readonly Biquad[], x: ArrayLike<number>, zi?: readonly [number, number][]): Float64Array {
  let y: Float64Array = Float64Array.from(x);
  sos.forEach((s, k) => {
    let s1 = zi ? zi[k][0] : 0;
    let s2 = zi ? zi[k][1] : 0;
    const out = new Float64Array(y.length);
    for (let i = 0; i < y.length; i++) {
      const xi = y[i];
      const yi = s.b0 * xi + s1;
      s1 = s.b1 * xi - s.a1 * yi + s2;
      s2 = s.b2 * xi - s.a2 * yi;
      out[i] = yi;
    }
    y = out;
  });
  return y;
}

/** 입력이 1로 일정할 때의 정상 상태 내부값 (scipy sosfilt_zi와 같은 뜻) */
export function sosSteadyState(sos: readonly Biquad[]): [number, number][] {
  let u = 1;
  return sos.map((s) => {
    const g = (s.b0 + s.b1 + s.b2) / (1 + s.a1 + s.a2);
    const yv = g * u;
    const s2 = s.b2 * u - s.a2 * yv;
    const s1 = s.b1 * u - s.a1 * yv + s2;
    u = yv;
    return [s1, s2];
  });
}

/**
 * 두 번 거르기(영위상, filtfilt): 앞으로 거른 뒤 거꾸로 한 번 더. 위상 0, 크기는 |H|².
 * 양 끝은 홀수 대칭으로 늘리고 정상 상태 내부값에서 시작한다 (scipy sosfiltfilt와 같은 방식).
 */
export function filtfilt(sos: readonly Biquad[], x: ArrayLike<number>, padlen?: number): Float64Array {
  const n = x.length;
  const edge = Math.min(n - 1, padlen ?? 3 * (2 * sos.length + 1));
  const ext = new Float64Array(n + 2 * edge);
  for (let i = 0; i < edge; i++) ext[i] = 2 * x[0] - x[edge - i];
  for (let i = 0; i < n; i++) ext[edge + i] = x[i];
  for (let i = 0; i < edge; i++) ext[edge + n + i] = 2 * x[n - 1] - x[n - 2 - i];
  const zi = sosSteadyState(sos);
  const scaled = (v: number) => zi.map(([a, b]) => [a * v, b * v] as [number, number]);
  const fwd = sosFilter(sos, ext, scaled(ext[0])).reverse();
  const back = sosFilter(sos, fwd, scaled(fwd[0])).reverse();
  return back.slice(edge, edge + n);
}

// ── FIR ──

/**
 * Hamming 창 저역 통과 FIR. 계수가 대칭이라 선형 위상이고 군지연은 (N − 1)/2 샘플.
 * 창 sinc의 설계 주파수를 조정해 크기 −3 dB가 f_c에 오게 한다 (IIR과 같은 약속).
 */
export function firLowpass(numTaps: number, fc: number, fs: number): Float64Array {
  if (!Number.isInteger(numTaps) || numTaps < 3 || numTaps % 2 === 0) throw new RangeError('탭 수는 3 이상의 홀수');
  const make = (fd: number) => {
    const m = numTaps - 1;
    const h = Float64Array.from({ length: numTaps }, (_, k) => {
      const t = k - m / 2;
      const x = (2 * fd) / fs;
      const sinc = t === 0 ? x : Math.sin(Math.PI * x * t) / (Math.PI * t);
      return sinc * (0.54 - 0.46 * Math.cos((2 * Math.PI * k) / m));
    });
    const sum = h.reduce((a, b) => a + b, 0);
    return h.map((v) => v / sum);
  };
  const magAt = (h: Float64Array, f: number) => {
    const w = (2 * Math.PI * f) / fs;
    let re = 0;
    let im = 0;
    h.forEach((v, k) => {
      re += v * Math.cos(w * k);
      im -= v * Math.sin(w * k);
    });
    return Math.hypot(re, im);
  };
  let lo = fc * 0.5;
  let hi = Math.min(fc * 2, fs / 2 - 1e-6);
  for (let it = 0; it < 80; it++) {
    const mid = (lo + hi) / 2;
    if (magAt(make(mid), fc) < Math.SQRT1_2) lo = mid;
    else hi = mid;
  }
  return make((lo + hi) / 2);
}

export function firResponse(h: ArrayLike<number>, fs: number, freqs: ArrayLike<number>): FreqResponse {
  const out: FreqResponse = { freq: [], mag: [], phase: [], groupDelay: [] };
  let prev = 0;
  for (let i = 0; i < freqs.length; i++) {
    const w = (2 * Math.PI * freqs[i]) / fs;
    let re = 0;
    let im = 0;
    let kre = 0;
    let kim = 0;
    for (let k = 0; k < h.length; k++) {
      const c = Math.cos(w * k);
      const s = Math.sin(w * k);
      re += h[k] * c;
      im -= h[k] * s;
      kre += k * h[k] * c;
      kim -= k * h[k] * s;
    }
    let ph = Math.atan2(im, re);
    if (i > 0) while (ph - prev > Math.PI) ph -= 2 * Math.PI;
    if (i > 0) while (ph - prev < -Math.PI) ph += 2 * Math.PI;
    prev = ph;
    const H = cx(re, im);
    out.freq.push(freqs[i]);
    out.mag.push(cAbs(H));
    out.phase.push(ph);
    // FIR 군지연 = Re{Σ k h_k e^{−jωk} / H(ω)} [샘플]
    out.groupDelay.push(cAbs(H) > 1e-12 ? cDiv(cx(kre, kim), H).re / fs : NaN);
  }
  return out;
}

/** 직접 합성곱 (출력 길이 = 입력 길이, 인과적: y[n] = Σ h[k] x[n − k]) */
export function firFilter(h: ArrayLike<number>, x: ArrayLike<number>): Float64Array {
  const y = new Float64Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let acc = 0;
    for (let k = 0; k < h.length && k <= n; k++) acc += h[k] * x[n - k];
    y[n] = acc;
  }
  return y;
}

// ── 적분 ──

/** 아날로그 Butterworth 고역 통과의 크기 (주파수 영역 적분의 하한 컷오프에 쓴다) */
export const highpassGain = (f: number, fc: number, order = 2): number => (fc > 0 ? 1 / Math.sqrt(1 + (fc / Math.max(f, 1e-30)) ** (2 * order)) : 1);

/**
 * 주파수 영역 적분: X(f) / (j2πf)^times × (고역 통과 크기). DC와 나이퀴스트 bin은 0으로.
 * 길이는 2의 거듭제곱. 고역 통과는 크기만 곱한다 (위상 0).
 */
export function integrateSpectral(x: ArrayLike<number>, fs: number, times: 1 | 2 = 1, hpHz = 0, hpOrder = 2): Float64Array {
  const n = x.length;
  const X = fft(x);
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let k = 1; k < n / 2; k++) {
    const f = (k * fs) / n;
    const w = 2 * Math.PI * f;
    const g = highpassGain(f, hpHz, hpOrder);
    // 1/(jω) = −j/ω, 1/(jω)² = −1/ω²
    let a = cx(X.real[k], X.imag[k]);
    a = times === 1 ? cMul(a, cx(0, -g / w)) : cScale(a, -g / (w * w));
    re[k] = a.re;
    im[k] = a.im;
    re[n - k] = a.re;
    im[n - k] = -a.im;
  }
  // 역변환: x = conj(FFT(conj(X))) / N
  const back = fft(re, Float64Array.from(im, (v) => -v));
  return Float64Array.from(back.real, (v) => v / n);
}

/**
 * 시간 영역 적분: (고역 통과를 한 번 거른 뒤) 사다리꼴 누적합. 처음 값은 0.
 * hpHz > 0이면 2차 Butterworth 고역 통과(인과적, 한 번)를 먼저 건다.
 */
export function integrateCumulative(x: ArrayLike<number>, fs: number, hpHz = 0): Float64Array {
  const src = hpHz > 0 ? sosFilter(designIir({ family: 'butterworth', kind: 'highpass', order: 2, fc: hpHz, fs }).sos, x) : Float64Array.from(x);
  const y = new Float64Array(src.length);
  for (let i = 1; i < src.length; i++) y[i] = y[i - 1] + (src[i] + src[i - 1]) / (2 * fs);
  return y;
}

// ── 데시메이션 ──

/**
 * q배 데시메이션. withFilter면 먼저 8차 Chebyshev I(0.05 dB, 차단 0.8 × 새 나이퀴스트)로 두 번 거른다 (scipy decimate 기본과 같음).
 * 그다음 q개마다 하나씩 남긴다.
 */
export function decimate(x: ArrayLike<number>, fs: number, q: number, withFilter = true): { x: Float64Array; fs: number } {
  if (!Number.isInteger(q) || q < 2) throw new RangeError('q는 2 이상의 정수');
  const src = withFilter ? filtfilt(designIir({ family: 'chebyshev1', order: 8, rippleDb: 0.05, fc: (0.8 * fs) / (2 * q), fs }).sos, x) : Float64Array.from(x);
  const m = Math.floor(src.length / q);
  return { x: Float64Array.from({ length: m }, (_, i) => src[i * q]), fs: fs / q };
}
