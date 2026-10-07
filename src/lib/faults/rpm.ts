/**
 * 회전수를 모를 때 1X 찾기 (P7-1, LAB-RPM-01). 순수 함수, 주파수 [Hz].
 *  - 하모닉 무리: 후보 f₀마다 k·f₀(k = 1 … K) 자리의 줄 높이(로그)를 평균하고, 반 칸 어긋난 (k − ½)·f₀ 자리의 평균을 뺀다.
 *    진짜 f₀는 정수배 자리에 줄이 서고 반 칸 자리는 비어 점수가 크다. 2·f₀는 반 칸 자리(= f₀의 홀수배)에 줄이 있어 깎이고,
 *    f₀/2는 정수배 자리의 절반이 비어 낮아진다. 그래도 0.5X 분수 하모닉이 있으면 f₀/2를 고를 수 있다 — 다른 증거로 확인한다.
 *  - 켑스트럼: 속도 스펙트럼의 로그를 역변환해 quefrency 봉우리 τ → f = 1/τ (P5-7).
 *  - 자기상관: 속도 파형의 반복 주기 (P5-7).
 */
import { autocorrelation } from '../dsp/cepstrum';
import { ifft } from '../dsp/envelope';

export interface ScoreCurve {
  f0: Float64Array;
  score: Float64Array;
  best: number;
}

const near = (freq: ArrayLike<number>, amp: ArrayLike<number>, f: number, tol: number) => {
  let m = 0;
  // freq는 고르게 늘어선다고 본다
  const df = freq[1] - freq[0];
  const k0 = Math.max(0, Math.floor((f - tol) / df));
  const k1 = Math.min(freq.length - 1, Math.ceil((f + tol) / df));
  for (let k = k0; k <= k1; k++) if (Math.abs(freq[k] - f) <= tol) m = Math.max(m, amp[k]);
  return m;
};

/** 하모닉 무리 점수 (스펙트럼은 0 Hz부터 고르게 늘어선 진폭) */
export function harmonicScore(freq: ArrayLike<number>, amp: ArrayLike<number>, fMin: number, fMax: number, step = 0.05, K = 6): ScoreCurve {
  const sorted = Array.from(amp).filter((_, k) => freq[k] > 2).sort((a, b) => a - b);
  const floor = Math.max(1e-12, sorted[Math.floor(sorted.length / 2)]);
  const L = (f: number) => Math.log10(Math.max(near(freq, amp, f, Math.max(0.6, 0.004 * f)), floor) / floor);
  const top = freq[freq.length - 1];
  const nGrid = Math.floor((fMax - fMin) / step) + 1;
  const f0 = new Float64Array(nGrid);
  const score = new Float64Array(nGrid);
  let best = fMin;
  let bestS = -Infinity;
  for (let i = 0; i < nGrid; i++) {
    const f = fMin + i * step;
    let on = 0;
    let off = 0;
    let cnt = 0;
    for (let k = 1; k <= K && k * f < top; k++) {
      on += L(k * f);
      off += L((k - 0.5) * f);
      cnt++;
    }
    const s = cnt > 0 ? (on - off) / cnt : 0;
    f0[i] = f;
    score[i] = s;
    if (s > bestS) {
      bestS = s;
      best = f;
    }
  }
  return { f0, score, best: refineFundamental(freq, amp, best, K) };
}

/**
 * 고른 f₀ 둘레에서 실제 줄의 자리로 다듬는다: k번째 하모닉 창(± 0.4 %, 최소 0.6 Hz)의 가장 높은 bin 주파수 f_k를
 * 진폭 가중 최소제곱으로 f₀ = Σ w_k k f_k / Σ w_k k² (w = 진폭²).
 */
export function refineFundamental(freq: ArrayLike<number>, amp: ArrayLike<number>, f0: number, K = 6): number {
  const df = freq[1] - freq[0];
  let num = 0;
  let den = 0;
  for (let k = 1; k <= K; k++) {
    const fc = k * f0;
    const tol = Math.max(0.6, 0.004 * fc);
    const k0 = Math.max(1, Math.floor((fc - tol) / df));
    const k1 = Math.min(freq.length - 2, Math.ceil((fc + tol) / df));
    if (k0 >= k1) continue;
    let kb = k0;
    for (let j = k0; j <= k1; j++) if (amp[j] > amp[kb]) kb = j;
    // 포물선 보간으로 봉우리 자리
    const a = amp[kb - 1];
    const b = amp[kb];
    const c = amp[kb + 1];
    const d = a - 2 * b + c;
    const fk = freq[kb] + (d !== 0 ? (0.5 * (a - c)) / d : 0) * df;
    const w = b * b;
    num += w * k * fk;
    den += w * k * k;
  }
  return den > 0 ? num / den : f0;
}

export interface QuefrencyCurve {
  tau: Float64Array;
  c: Float64Array;
  best: number;
}

/**
 * 진폭 스펙트럼(0 Hz부터 간격 df, 길이 = 2의 거듭제곱 + 1)의 켑스트럼에서 [1/fMax, 1/fMin] 안의 가장 큰 봉우리 → 1/τ.
 * 스펙트럼을 0 ~ F로 잘라 넣으면 그 대역만 본다(F = (길이 − 1)·df, 가상의 f_s = 2F).
 */
export function cepstrumEstimate(amp: ArrayLike<number>, df: number, fMin: number, fMax: number): QuefrencyCurve {
  const half = amp.length - 1;
  const n = 2 * half;
  const fs = n * df;
  let max = 0;
  for (let k = 0; k <= half; k++) max = Math.max(max, amp[k]);
  const L = new Float64Array(n);
  for (let k = 0; k <= half; k++) L[k] = Math.log(amp[k] + max * 1e-7);
  for (let k = 1; k < half; k++) L[n - k] = L[k];
  const c = ifft(L, new Float64Array(n)).re;
  const q0 = Math.ceil(fs / fMax);
  const q1 = Math.floor(fs / fMin);
  const tau: number[] = [];
  const cv: number[] = [];
  let bestQ = q0;
  for (let q = q0; q <= Math.min(q1, n / 2); q++) {
    tau.push(q / fs);
    cv.push(c[q]);
    if (c[q] > c[bestQ]) bestQ = q;
  }
  return { tau: Float64Array.from(tau), c: Float64Array.from(cv), best: fs / (bestQ + parabolic(c, bestQ)) };
}

/** 이웃 세 점의 포물선으로 봉우리 자리 보정 (−0.5 ~ 0.5 칸) */
function parabolic(y: ArrayLike<number>, i: number): number {
  if (i <= 0 || i >= y.length - 1) return 0;
  const d = y[i - 1] - 2 * y[i] + y[i + 1];
  return d < 0 ? Math.max(-0.5, Math.min(0.5, (0.5 * (y[i - 1] - y[i + 1])) / d)) : 0;
}

export interface LagCurve {
  lag: Float64Array;
  r: Float64Array;
  best: number;
}

/** 파형의 자기상관에서 지연 [1/fMax, 1/fMin] 안의 첫 큰 봉우리(최댓값의 90 % 이상인 첫 봉우리) → 1/지연 */
export function autocorrEstimate(x: ArrayLike<number>, fs: number, fMin: number, fMax: number): LagCurve {
  const r = autocorrelation(x);
  const i0 = Math.ceil(fs / fMax);
  const i1 = Math.min(r.length - 2, Math.floor(fs / fMin));
  let max = -Infinity;
  for (let i = i0; i <= i1; i++) max = Math.max(max, r[i]);
  let best = i0;
  for (let i = Math.max(i0, 1); i <= i1; i++) {
    if (r[i] >= 0.9 * max && r[i] >= r[i - 1] && r[i] >= r[i + 1]) {
      best = i;
      break;
    }
  }
  return { lag: Float64Array.from({ length: i1 - i0 + 1 }, (_, k) => (i0 + k) / fs), r: r.slice(i0, i1 + 1), best: fs / (best + parabolic(r, best)) };
}

/** 유도전동기: 동기속도 [rpm] = 120 × 전원 주파수 / 극수, 슬립 = (동기 − 실제)/동기 */
export function syncRpm(lineHz: number, poles: number): number {
  return (120 * lineHz) / poles;
}

export type RpmMethod = 'harmonic' | 'cepstrum' | 'autocorr';

export interface RpmEstimate {
  method: RpmMethod;
  /** 추정한 회전 주파수 [Hz] */
  fr: number;
  /** 속도 스펙트럼 0 ~ 2048 Hz [mm/s rms] */
  freq: Float64Array;
  amp: Float64Array;
  curve: ScoreCurve | QuefrencyCurve | LagCurve;
}

const cacheEst = new Map<string, RpmEstimate>();

/**
 * 가속도 한 채널에서 회전 주파수 추정 (후보 5 ~ 100 Hz). 하모닉 무리·켑스트럼은 0 ~ 2048 Hz 속도 스펙트럼,
 * 자기상관은 속도 파형(2 Hz 고역 통과 적분)을 쓴다. key가 같으면 다시 계산하지 않는다.
 */
export function estimateRpm(velocity: { freq: Float64Array; amp: Float64Array; vel: Float64Array }, fs: number, method: RpmMethod, key?: string): RpmEstimate {
  const k = key ? `${key}|${method}` : undefined;
  if (k && cacheEst.has(k)) return cacheEst.get(k)!;
  const { freq, amp, vel } = velocity;
  const df = freq[1] - freq[0];
  const nHalf = Math.round(2048 / df);
  const curve =
    method === 'harmonic'
      ? harmonicScore(freq, amp, 5, 100)
      : method === 'cepstrum'
        ? cepstrumEstimate(amp.slice(0, nHalf + 1), df, 5, 100)
        : autocorrEstimate(vel, fs, 5, 100);
  const out: RpmEstimate = { method, fr: curve.best, freq, amp, curve };
  if (k) {
    if (cacheEst.size > 40) cacheEst.clear();
    cacheEst.set(k, out);
  }
  return out;
}
