/**
 * 계산형 차수추적 (Computed order tracking, P5-4, LAB-ORD-01). 순수 함수, 단위 s·Hz·바퀴.
 * 1. 키페이저 시각 t_k (각도 = k 바퀴) → 각도-시간 관계 보간 (3개 펄스를 지나는 2차식 = 등가속이면 정확)
 * 2. 등간격 각도의 시각을 구하고, 고정 f_s 신호를 그 시각에서 보간 (선형 / 3차 라그랑주)
 * 3. 정수 바퀴 프레임을 Uniform 윈도우로 FFT → 차수 스펙트럼 (차수 분해능 1/N_rev, 최대 차수 N_spr/2.56)
 * 재샘플링도 샘플링이라 차수 N_spr/2를 넘는 성분은 접힌다 → 넉넉히 찍은 뒤 차수 영역에서 걸러 솎는다 (P5-1 decimate).
 * 키페이저가 없으면 STFT 능선으로 1X 순시 주파수를 찾아 적분해 각도를 만든다 (tacholess).
 */
import { fft } from './fft';
import { designIir, filtfilt } from './filter';
import type { Stft } from './stft';

export type AngleMethod = 'linear' | 'quadratic';
export type InterpMethod = 'linear' | 'cubic';

/** 차수 분해능 Δo = 1/N_rev */
export const orderResolution = (revs: number) => 1 / revs;
/** 최대 차수 = 회전당 샘플 수 / 2.56 (P2-3의 f_s = 2.56 F_max와 같은 약속) */
export const maxOrder = (samplesPerRev: number) => samplesPerRev / 2.56;

/**
 * 키페이저 시각 pulseTimes[k] (각도 k 바퀴)로 목표 각도 revs[j] [바퀴, pulseTimes[0] = 0 바퀴]의 시각.
 * linear: 펄스 사이는 일정 속도. quadratic: 이웃한 세 펄스를 지나는 θ(t) = b₀ + b₁τ + b₂τ²의 근.
 */
export function timesAtRevs(pulseTimes: ArrayLike<number>, revs: ArrayLike<number>, method: AngleMethod = 'quadratic'): Float64Array {
  const K = pulseTimes.length;
  if (K < 3) throw new RangeError('키페이저 펄스가 3개 이상 필요하다');
  const out = new Float64Array(revs.length);
  for (let j = 0; j < revs.length; j++) {
    const r = revs[j];
    const k = Math.min(K - 2, Math.max(0, Math.floor(r)));
    const t0 = pulseTimes[k];
    const t1 = pulseTimes[k + 1];
    const u = r - k; // 이 구간 안의 바퀴 몫
    if (method === 'linear') {
      out[j] = t0 + u * (t1 - t0);
      continue;
    }
    // 세 펄스 (a, b, c)를 지나는 2차식. 구간 [k, k+1]을 포함하도록 고른다
    const ia = k >= 1 ? k - 1 : 0;
    const ta = pulseTimes[ia] - t0;
    const tb = pulseTimes[ia + 1] - t0;
    const tc = pulseTimes[ia + 2] - t0;
    const ra = ia - k;
    // 뉴턴 분할 차분: θ(τ) = ra + d1 (τ − ta) + d2 (τ − ta)(τ − tb)
    const d1 = 1 / (tb - ta);
    const d2 = (1 / (tc - tb) - d1) / (tc - ta);
    // d2 τ² + (d1 − d2 (ta + tb)) τ + (ra − d1 ta + d2 ta tb − u) = 0
    const A = d2;
    const B = d1 - d2 * (ta + tb);
    const C = ra - d1 * ta + d2 * ta * tb - u;
    // 수치적으로 안정한 근: q = −(B + sgn(B)√D)/2, 원하는 근(구간 안, 거의 −C/B) = C/q. A가 0이어도 성립
    const disc = Math.max(0, B * B - 4 * A * C);
    const q = -0.5 * (B + Math.sign(B || 1) * Math.sqrt(disc));
    out[j] = t0 + (q !== 0 ? C / q : 0);
  }
  return out;
}

/** 고정 f_s 신호 x를 시각 times [s]에서 보간 (x[0]은 t = 0). 끝에서는 가까운 값으로 붙인다 */
export function interpolateAt(x: ArrayLike<number>, fs: number, times: ArrayLike<number>, method: InterpMethod = 'cubic'): Float64Array {
  const n = x.length;
  const at = (i: number) => x[Math.min(n - 1, Math.max(0, i))];
  const out = new Float64Array(times.length);
  for (let j = 0; j < times.length; j++) {
    const p = times[j] * fs;
    const i = Math.floor(p);
    const f = p - i;
    if (method === 'linear') {
      out[j] = at(i) + f * (at(i + 1) - at(i));
      continue;
    }
    // 4점 3차 라그랑주 (i−1, i, i+1, i+2)
    const xm = at(i - 1);
    const x0 = at(i);
    const x1 = at(i + 1);
    const x2 = at(i + 2);
    out[j] =
      (-f * (f - 1) * (f - 2) * xm) / 6 +
      ((f + 1) * (f - 1) * (f - 2) * x0) / 2 -
      ((f + 1) * f * (f - 2) * x1) / 2 +
      ((f + 1) * f * (f - 1) * x2) / 6;
  }
  return out;
}

export interface AngleResampleOptions {
  /** 회전당 샘플 수 N_spr */
  samplesPerRev: number;
  /** 프레임 바퀴 수 N_rev */
  revs: number;
  /** 시작 각도 [바퀴, pulseTimes[0] 기준] */
  startRev?: number;
  angleMethod?: AngleMethod;
  interp?: InterpMethod;
  /**
   * 차수 영역 에일리어싱 방지: 회전당 oversample × N_spr 점으로 먼저 찍고,
   * 차수 영역에서 저역 통과(차수 ≈ 0.4 N_spr에서 차단) 후 솎는다. 0 또는 1이면 하지 않는다
   */
  oversample?: number;
}

export interface AngleResample {
  /** 등각도 표본 (N_rev × N_spr) */
  y: Float64Array;
  /** 각 표본의 각도 [바퀴] */
  rev: Float64Array;
  /** 각 표본의 시각 [s] */
  time: Float64Array;
}

/** 등각도 재샘플링 */
export function resampleByAngle(x: ArrayLike<number>, fs: number, pulseTimes: ArrayLike<number>, opts: AngleResampleOptions): AngleResample {
  const { samplesPerRev: spr, revs } = opts;
  const start = opts.startRev ?? 0;
  const os = opts.oversample && opts.oversample > 1 ? Math.round(opts.oversample) : 1;
  const angleMethod = opts.angleMethod ?? 'quadratic';
  const interp = opts.interp ?? 'cubic';
  const make = (rate: number, from: number, count: number) => {
    const rv = Float64Array.from({ length: count }, (_, j) => from + j / rate);
    const tm = timesAtRevs(pulseTimes, rv, angleMethod);
    return { rv, tm, y: interpolateAt(x, fs, tm, interp) };
  };
  if (os === 1) {
    const r = make(spr, start, revs * spr);
    return { y: r.y, rev: r.rv, time: r.tm };
  }
  // 앞뒤로 2바퀴 여유를 두고 넉넉히 찍은 뒤 거르고 솎아서 잘라 낸다 (필터 가장자리 영향 제거)
  const margin = 2;
  const rate = spr * os;
  const big = make(rate, start - margin, (revs + 2 * margin) * rate);
  // 차수 영역 저역 통과: Chebyshev 8차(리플 0.005 dB), 차단 0.4 N_spr 차수, 앞뒤로 두 번(영위상) → os점마다 하나
  const sos = designIir({ family: 'chebyshev1', order: 8, rippleDb: 0.005, fc: 0.4 * spr, fs: rate }).sos;
  const filtered = filtfilt(sos, big.y);
  const skip = margin * spr;
  const y = Float64Array.from({ length: revs * spr }, (_, j) => filtered[(skip + j) * os]);
  const rev = Float64Array.from({ length: revs * spr }, (_, j) => start + j / spr);
  const time = timesAtRevs(pulseTimes, rev, angleMethod);
  return { y, rev, time };
}

export interface OrderSpectrum {
  order: Float64Array;
  /** 피크 진폭 */
  amplitude: Float64Array;
  /** 위상 [rad] (cos 기준, 늦음이 −) */
  phase: Float64Array;
}

/** 정수 바퀴 프레임의 차수 스펙트럼 (Uniform 윈도우 — 정수 바퀴라 회전 성분은 누설이 없다). 길이는 2의 거듭제곱 */
export function orderSpectrum(y: ArrayLike<number>, samplesPerRev: number): OrderSpectrum {
  const m = y.length;
  const revs = m / samplesPerRev;
  const Y = fft(y);
  const half = Math.floor(m / 2);
  const order = new Float64Array(half + 1);
  const amplitude = new Float64Array(half + 1);
  const phase = new Float64Array(half + 1);
  for (let k = 0; k <= half; k++) {
    order[k] = k / revs;
    amplitude[k] = ((k === 0 || k === half ? 1 : 2) * Math.hypot(Y.real[k], Y.imag[k])) / m;
    phase[k] = Math.atan2(Y.imag[k], Y.real[k]);
  }
  return { order, amplitude, phase };
}

/** 차수 스펙트럼에서 order에 가장 가까운 칸의 진폭 */
export function amplitudeAtOrder(sp: OrderSpectrum, order: number): number {
  const d = sp.order[1] - sp.order[0];
  const k = Math.round(order / d);
  return k >= 0 && k < sp.amplitude.length ? sp.amplitude[k] : 0;
}

/**
 * STFT 프레임마다 [fLo, fHi] 안의 가장 큰 봉우리 주파수 (포물선 보간) = 능선.
 * 기준 성분(보통 1X)이 그 대역에서 가장 크다고 가정한다.
 */
export function ridgeFrequency(s: Stft, fLo: number, fHi: number): Float64Array {
  const out = new Float64Array(s.times.length);
  const kLo = Math.max(1, Math.ceil(fLo / s.df));
  const kHi = Math.min(s.freqs.length - 2, Math.floor(fHi / s.df));
  for (let m = 0; m < s.times.length; m++) {
    const a = s.amp[m];
    let kb = kLo;
    for (let k = kLo + 1; k <= kHi; k++) if (a[k] > a[kb]) kb = k;
    const l = Math.log(Math.max(a[kb - 1], 1e-300));
    const c = Math.log(Math.max(a[kb], 1e-300));
    const r = Math.log(Math.max(a[kb + 1], 1e-300));
    const den = l - 2 * c + r;
    const delta = den !== 0 ? (0.5 * (l - r)) / den : 0;
    out[m] = (kb + Math.max(-0.5, Math.min(0.5, delta))) * s.df;
  }
  return out;
}

/**
 * 순시 주파수 f(t) [Hz] (frameTimes에서의 값, 사이는 선형, 바깥은 끝값)를 시각 0부터 적분해
 * 누적 바퀴가 정수가 되는 시각 = 가상의 키페이저 시각. 시작 각도는 알 수 없어 0으로 둔다 (위상 기준 없음).
 */
export function pulsesFromFrequency(frameTimes: ArrayLike<number>, freqs: ArrayLike<number>, tEnd: number, dt: number): Float64Array {
  const n = frameTimes.length;
  const fAt = (t: number) => {
    if (t <= frameTimes[0]) return freqs[0];
    if (t >= frameTimes[n - 1]) return freqs[n - 1];
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (frameTimes[mid] <= t) lo = mid;
      else hi = mid;
    }
    const u = (t - frameTimes[lo]) / (frameTimes[hi] - frameTimes[lo]);
    return freqs[lo] + u * (freqs[hi] - freqs[lo]);
  };
  const pulses: number[] = [0];
  let revs = 0;
  let t = 0;
  let fPrev = fAt(0);
  while (t < tEnd) {
    const fNext = fAt(t + dt);
    const step = 0.5 * (fPrev + fNext) * dt;
    const before = revs;
    revs += step;
    if (Math.floor(revs) > Math.floor(before)) {
      const target = Math.floor(revs);
      pulses.push(t + ((target - before) / step) * dt);
    }
    t += dt;
    fPrev = fNext;
  }
  return Float64Array.from(pulses);
}
