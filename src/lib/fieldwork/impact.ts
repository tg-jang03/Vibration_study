/**
 * 임팩트 시험 (P9-1, LAB-HPB-01). 순수 함수, 내부 단위 SI (힘 N, 가속도 m/s², 주파수 Hz).
 *
 * - 구조: 모드 합 가속도 FRF(inertance) H(f) = Σ_r −ω² / (m_r (ω_r² − ω² + j 2ζ_r ω_r ω)), ω = 2πf
 *   예시 받침대 = P7-2 그림 7의 그 받침대(수평 47.5 Hz = 2850 rpm, ζ 0.035) + 가벼운 감쇠의 2차·3차 모드
 * - 해머: 반사인 펄스 F(t) = F₀ sin(πt/t_c) (0 ≤ t ≤ t_c). 같은 휘두름 = 같은 충격량 I = 2F₀t_c/π
 *   F(f) = F₀ a (1 + e^{−jωt_c}) / (a² − ω²), a = π/t_c → F(0) = I, 첫 0은 f = 1.5/t_c
 * - 기록: 긴 기록(8 s 이상)을 주파수 영역에서 만들고(나이퀴스트 위를 버림 = 이상적인 AAF, P2-3)
 *   역 DFT → 앞에서 프레임 길이 T만 자른다. 잘린 뒤에도 울리면 누설(P2-5)이 그대로 생긴다
 * - FRF 추정은 P5-3의 H1·코히어런스(`lib/dsp/twoChannel`)를 그대로 쓴다
 */
import { fft } from '../dsp/fft';
import { createRng } from '../dsp/random';
import { averageCross, coherence, cxAbs, frfH1, type CxArray } from '../dsp/twoChannel';
import { forceWindow } from '../dsp/window';

export interface Mode {
  /** 고유진동수 [Hz] */
  f: number;
  /** 감쇠비 [—] */
  zeta: number;
  /** 모드 질량 [kg] (타격점 = 측정점 기준) */
  m: number;
}

/** 예시 받침대의 수평 모드 3개 (1차 = P7-2 그림 7의 받침대) */
export const PEDESTAL: readonly Mode[] = [
  { f: 47.5, zeta: 0.035, m: 300 },
  { f: 141.6, zeta: 0.003, m: 600 },
  { f: 290, zeta: 0.008, m: 400 },
];

/** 봉우리를 찾는 주파수 구간 [Hz] — 모드마다 (확대 그림·랩 읽음값) */
export const MODE_BANDS: readonly [number, number][] = [
  [30, 80],
  [110, 190],
  [240, 360],
];

export type TipId = 'rubber' | 'plastic' | 'steel';

/** 해머 팁: 접촉 시간 t_c [s] (단단할수록 짧다). 값은 이 페이지의 예시 */
export const TIPS: Record<TipId, { tc: number; label: string }> = {
  rubber: { tc: 0.008, label: '고무 (무름)' },
  plastic: { tc: 0.002, label: '플라스틱 (중간)' },
  steel: { tc: 0.0004, label: '강철 (단단함)' },
};

/** 한 번 칠 때의 충격량 [N·s] (약 1.2 kg 해머를 2.5 m/s로 휘두른 정도) */
export const IMPULSE = 5;
/** 샘플링 주파수 [Hz] */
export const FS = 2048;
/** 프리트리거: 프레임 시작에서 타격까지 [s] */
export const PRETRIGGER = 0.01;
/** 응답(가속도계) 쪽 잡음 σ [m/s²] */
export const RESPONSE_NOISE = 0.3;
/** 힘 센서 쪽 잡음 σ [N] */
export const FORCE_NOISE = 40;

type Cx = [number, number];
const cmul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};

/** 가속도 FRF H(f) [(m/s²)/N] */
export function accelerance(modes: readonly Mode[], f: number): Cx {
  const w = 2 * Math.PI * f;
  let re = 0;
  let im = 0;
  for (const md of modes) {
    const wr = 2 * Math.PI * md.f;
    const [a, b] = cdiv([-w * w, 0], [md.m * (wr * wr - w * w), md.m * 2 * md.zeta * wr * w]);
    re += a;
    im += b;
  }
  return [re, im];
}

/** 반사인 펄스의 푸리에 변환 F(f) [N·s] (시작 = t 0). 충격량 I, 접촉 시간 t_c */
export function halfSineFT(f: number, tc: number, impulse = IMPULSE): Cx {
  const f0 = (Math.PI * impulse) / (2 * tc);
  const a = Math.PI / tc;
  const w = 2 * Math.PI * f;
  if (Math.abs(a - w) < 1e-9 * a) return [0, -f0 * tc / 2]; // ω = a에서의 극한 −j t_c/2
  const k = (f0 * a) / (a * a - w * w);
  return [k * (1 + Math.cos(w * tc)), -k * Math.sin(w * tc)];
}

/** 힘 스펙트럼이 저주파 값보다 10 dB 내려가는 주파수 [Hz] (첫 엽, ≈ 1.02/t_c) */
export function forceBandwidth10dB(tc: number): number {
  const target = 10 ** (-10 / 20);
  const g = (x: number) => Math.abs(Math.cos(Math.PI * x) / (1 - 4 * x * x));
  let lo = 0.6;
  let hi = 1.4; // g(0.6) > target > g(1.4)
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid) > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2 / tc;
}

/** 지수 윈도우 e^{−t/τ}가 보태는 감쇠비 1/(τω_n) */
export const expAddedZeta = (tau: number, fn: number) => 1 / (tau * 2 * Math.PI * fn);

export interface Hit {
  /** 타격 시각 [s] */
  t: number;
  /** 첫 타격 대비 충격량 배율 */
  scale: number;
}

/**
 * 긴 기록의 힘·가속도 [N, m/s²] (주파수 영역 합성, 이상적인 AAF).
 * 길이 = 2의 거듭제곱 ≥ fs × tLong. 잡음 없음.
 */
export function synthRecord(
  modes: readonly Mode[],
  tc: number,
  hits: readonly Hit[],
  { fs = FS, tLong = 8, impulse = IMPULSE }: { fs?: number; tLong?: number; impulse?: number } = {},
): { force: Float64Array; accel: Float64Array } {
  const n = 2 ** Math.ceil(Math.log2(fs * tLong));
  const tl = n / fs;
  const fRe = new Float64Array(n);
  const fIm = new Float64Array(n);
  const aRe = new Float64Array(n);
  const aIm = new Float64Array(n);
  for (let k = 0; k <= n / 2; k++) {
    const f = k / tl;
    const base = halfSineFT(f, tc, impulse);
    let fx: Cx = [0, 0];
    for (const h of hits) {
      const ph = -2 * Math.PI * f * h.t;
      const d = cmul(base, [h.scale * Math.cos(ph), h.scale * Math.sin(ph)]);
      fx = [fx[0] + d[0], fx[1] + d[1]];
    }
    const ax = cmul(accelerance(modes, f), fx);
    if (k === 0 || k === n / 2) {
      fRe[k] = fx[0];
      aRe[k] = ax[0];
    } else {
      fRe[k] = fx[0];
      fIm[k] = fx[1];
      aRe[k] = ax[0];
      aIm[k] = ax[1];
      fRe[n - k] = fx[0];
      fIm[n - k] = -fx[1];
      aRe[n - k] = ax[0];
      aIm[n - k] = -ax[1];
    }
  }
  // x[n] = fs · (1/N) Σ X_k e^{+j2πkn/N} = fs/N · Re{FFT(conj X)}
  const toTime = (re: Float64Array, im: Float64Array) => {
    const s = fft(re, im.map((v) => -v));
    return s.real.map((v) => (v * fs) / n);
  };
  return { force: toTime(fRe, fIm), accel: toTime(aRe, aIm) };
}

export interface ImpactSetup {
  tip: TipId;
  /** 프레임 길이 T [s] (fs·T는 2의 거듭제곱) */
  T: number;
  /** 지수 윈도우 시정수 τ [s], null이면 끔 */
  expTau: number | null;
  /** Force 윈도우 (힘 채널에서 타격 둘레만 남기기) */
  forceWindow: boolean;
  /** 평균 횟수 */
  averages: number;
  /** 더블 히트 (해머가 튀어 한 번 더 맞음 — 칠 때마다 간격이 다르다) */
  doubleHit: boolean;
  modes?: readonly Mode[];
  fs?: number;
  responseNoise?: number;
  forceNoise?: number;
  seed?: number;
}

export interface ImpactResult {
  fs: number;
  T: number;
  df: number;
  /** 프레임 시각 [s] */
  t: Float64Array;
  /** 첫 번째 타격의 원기록 (잡음 포함, 윈도우 전) */
  force: Float64Array;
  accel: Float64Array;
  /** 힘 채널에 곱한 윈도우(Force × 지수), 응답 채널에 곱한 윈도우(지수) */
  wForce: Float64Array;
  wResp: Float64Array;
  /** 0 ~ fs/2 */
  freqs: Float64Array;
  h1: CxArray;
  mag: Float64Array;
  coh: Float64Array;
  /** 평균 힘 자기 스펙트럼 [dB, 저주파(0 bin) = 0 dB] — 윈도우를 곱한 뒤 */
  forceDb: Float64Array;
  /** 타격마다 실제로 들어간 펄스(더블 히트면 둘) */
  hits: Hit[][];
}

/** Force 윈도우 폭: 타격 뒤 max(1.5 t_c, 2 ms)까지 1, 그 뒤 2 ms 코사인 테이퍼 */
export function forceWindowFor(n: number, fs: number, tc: number): Float64Array {
  const width = Math.round((PRETRIGGER + Math.max(1.5 * tc, 0.002)) * fs);
  return forceWindow(n, { width, taper: Math.round(0.002 * fs) });
}

/** 임팩트 시험 한 세트: 타격 M번 → 윈도우 → H1·코히어런스 (P5-3) */
export function impactTest(s: ImpactSetup): ImpactResult {
  const fs = s.fs ?? FS;
  const modes = s.modes ?? PEDESTAL;
  const tc = TIPS[s.tip].tc;
  const n = Math.round(fs * s.T);
  const rng = createRng(s.seed ?? 9101);
  const sigY = s.responseNoise ?? RESPONSE_NOISE;
  const sigF = s.forceNoise ?? FORCE_NOISE;

  const wExp = new Float64Array(n).map((_, i) => (s.expTau === null ? 1 : Math.exp(-i / fs / s.expTau)));
  const wF = s.forceWindow ? forceWindowFor(n, fs, tc) : new Float64Array(n).fill(1);
  const wForce = wF.map((v, i) => v * wExp[i]);

  const clean = s.doubleHit ? null : synthRecord(modes, tc, [{ t: PRETRIGGER, scale: 1 }], { fs });
  const xs: CxArray[] = [];
  const ys: CxArray[] = [];
  let force0 = new Float64Array(n);
  let accel0 = new Float64Array(n);
  const hits: Hit[][] = [];
  for (let m = 0; m < s.averages; m++) {
    let rec = clean;
    let hm: Hit[] = [{ t: PRETRIGGER, scale: 1 }];
    if (!rec) {
      const delay = tc * (1.6 + 0.8 * rng.uniform());
      const scale = 0.4 + 0.3 * rng.uniform();
      hm = [{ t: PRETRIGGER, scale: 1 }, { t: PRETRIGGER + delay, scale }];
      rec = synthRecord(modes, tc, hm, { fs });
    }
    hits.push(hm);
    const f = new Float64Array(n);
    const a = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      f[i] = rec.force[i] + sigF * rng.normal();
      a[i] = rec.accel[i] + sigY * rng.normal();
    }
    if (m === 0) {
      force0 = f;
      accel0 = a;
    }
    const X = fft(f.map((v, i) => v * wForce[i]));
    const Y = fft(a.map((v, i) => v * wExp[i]));
    xs.push({ re: X.real.slice(0, n / 2 + 1), im: X.imag.slice(0, n / 2 + 1) });
    ys.push({ re: Y.real.slice(0, n / 2 + 1), im: Y.imag.slice(0, n / 2 + 1) });
  }
  const g = averageCross(xs, ys);
  const h1 = frfH1(g);
  const g0 = g.gxx[0] > 0 ? g.gxx[0] : 1;
  return {
    fs,
    T: s.T,
    df: fs / n,
    t: new Float64Array(n).map((_, i) => i / fs),
    force: force0,
    accel: accel0,
    wForce,
    wResp: wExp,
    freqs: new Float64Array(n / 2 + 1).map((_, k) => (k * fs) / n),
    h1,
    mag: cxAbs(h1),
    coh: coherence(g),
    forceDb: g.gxx.map((v) => 10 * Math.log10(Math.max(v / g0, 1e-12))),
    hits,
  };
}

export interface HalfPower {
  /** 봉우리 bin의 주파수 [Hz] */
  fPeak: number;
  peak: number;
  /** 1/√2 높이를 지나는 두 주파수 (bin 사이 직선 보간) */
  fa: number;
  fb: number;
  zeta: number;
  q: number;
  /** 피크 폭(f_b − f_a) 안에 든 bin 수 */
  bins: number;
}

/** 구간 [fLo, fHi]에서 봉우리를 찾아 Half-power ζ = (f_b − f_a)/(2 f_peak). 못 읽으면 null */
export function halfPower(freqs: ArrayLike<number>, mag: ArrayLike<number>, fLo: number, fHi: number): HalfPower | null {
  let k0 = -1;
  let k1 = -1;
  for (let k = 0; k < freqs.length; k++) {
    if (freqs[k] >= fLo && k0 < 0) k0 = k;
    if (freqs[k] <= fHi) k1 = k;
  }
  if (k0 < 0 || k1 <= k0) return null;
  let kp = k0;
  for (let k = k0; k <= k1; k++) if (mag[k] > mag[kp]) kp = k;
  if (kp === k0 || kp === k1) return null;
  const level = mag[kp] / Math.SQRT2;
  let i = kp;
  while (i > k0 && mag[i] >= level) i--;
  if (mag[i] >= level) return null;
  let j = kp;
  while (j < k1 && mag[j] >= level) j++;
  if (mag[j] >= level) return null;
  const cross = (lo: number, hi: number) => freqs[lo] + ((level - mag[lo]) / (mag[hi] - mag[lo])) * (freqs[hi] - freqs[lo]);
  const fa = cross(i, i + 1);
  const fb = cross(j, j - 1);
  const df = freqs[1] - freqs[0];
  return { fPeak: freqs[kp], peak: mag[kp], fa, fb, zeta: (fb - fa) / (2 * freqs[kp]), q: freqs[kp] / (fb - fa), bins: (fb - fa) / df };
}

// ── 운전 중 판별 (그림 1): 같은 받침대에 불평형 1X + 넓은 대역의 흐름 가진 ──

/** 받침대 1차 모드의 속도 응답 크기 |v/F| [(m/s)/N] */
export function mobility1(f: number, md: Mode = PEDESTAL[0]): number {
  const [re, im] = accelerance([md], f);
  return Math.hypot(re, im) / (2 * Math.PI * Math.max(f, 1e-9));
}

/**
 * 운전 중 속도 스펙트럼 [mm/s RMS] (0 ~ fMax, Δf 0.25 Hz): 불평형 1X = U(2πf_r)² 의 힘 + 넓은 대역 흐름 가진(시드 고정).
 * 1X는 회전수를 따라 움직이고, 바닥의 둔덕은 받침대 고유진동수 자리에 머문다.
 */
export function runningSpectrum(rpm: number, { fMax = 120, unbalance = 2.2e-4, flow = 0.25, seed = 9102 } = {}) {
  const df = 0.25;
  const n = Math.round(fMax / df) + 1;
  const rng = createRng(seed);
  const freqs = new Float64Array(n).map((_, k) => k * df);
  const amp = new Float64Array(n);
  for (let k = 1; k < n; k++) {
    // 흐름 가진: 힘 스펙트럼 크기 일정(flow N) × 레일리 분포의 흔들림
    const ray = Math.sqrt(-2 * Math.log(1 - rng.uniform() * 0.999)) / Math.sqrt(2);
    amp[k] = flow * ray * mobility1(freqs[k]) * 1000;
  }
  const fr = rpm / 60;
  const k1 = Math.round(fr / df);
  const oneX = (unbalance * (2 * Math.PI * fr) ** 2 * mobility1(fr) * 1000) / Math.SQRT2;
  amp[k1] = Math.hypot(amp[k1], oneX);
  return { freqs, amp, fr, oneX, k1 };
}

// ── 운전 중 범프 테스트 (그림 7): 타격에 맞춘 시간 평균 ──

/**
 * 운전 중 기록 M개를 타격 순간에 맞춰 시간 평균한다. 1X(f_r)는 기록마다 위상이 제멋대로라 줄고(≈ 1/√M),
 * 타격 응답은 매번 같은 자리라 남는다. 반환: 한 기록과 평균의 가속도 스펙트럼 크기 [m/s², bin 진폭].
 */
export function bumpAverage({ M = 16, T = 4, rpm = 3000, oneXAmp = 3, noise = 2, tip = 'rubber' as TipId, seed = 9103, fs = 512 } = {}) {
  const n = Math.round(fs * T);
  const rec = synthRecord([PEDESTAL[0]], TIPS[tip].tc, [{ t: PRETRIGGER, scale: 1 }], { fs, tLong: 16 });
  const rng = createRng(seed);
  const fr = rpm / 60;
  const sum = new Float64Array(n);
  let first = new Float64Array(n);
  for (let m = 0; m < M; m++) {
    const ph = 2 * Math.PI * rng.uniform();
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = rec.accel[i] + oneXAmp * Math.cos(2 * Math.PI * fr * (i / fs) + ph) + noise * rng.normal();
    if (m === 0) first = x;
    for (let i = 0; i < n; i++) sum[i] += x[i] / M;
  }
  const spec = (x: Float64Array) => {
    const X = fft(x);
    return new Float64Array(n / 2 + 1).map((_, k) => (Math.hypot(X.real[k], X.imag[k]) * (k === 0 ? 1 : 2)) / n);
  };
  const freqs = new Float64Array(n / 2 + 1).map((_, k) => (k * fs) / n);
  const kr = Math.round(fr * T);
  const single = spec(first);
  const avg = spec(sum);
  return { freqs, single, avg, kr, oneXSingle: single[kr], oneXAvg: avg[kr] };
}
