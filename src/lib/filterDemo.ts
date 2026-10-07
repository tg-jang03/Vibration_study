/**
 * P5-1 "디지털 필터와 적분"의 예시 신호. 본문 그림과 랩(LAB-FLT-01·LAB-INT-01)이 같이 쓴다. 순수 함수, 내부 단위 SI.
 * 예시 기계: 1500 rpm (1X = 25 Hz), 기어 이 20개 → 맞물림 주파수 500 Hz. 모든 값은 설명용 예시다.
 */
import { createRng } from './dsp/random';
import {
  designIir,
  filtfilt,
  firFilter,
  firLowpass,
  firResponse,
  iirResponse,
  integrateCumulative,
  integrateSpectral,
  sosFilter,
  type FilterFamily,
  type FreqResponse,
} from './dsp/filter';

// ── LAB-FLT-01: 1X ~ 3X를 보려고 맞물림 성분을 걷어 낸다 ──

export const FLT_DEMO = {
  fs: 6400,
  f1: 25,
  /** 속도 [m/s pk]와 위상 [rad] */
  lines: [
    { order: 1, amp: 4e-3, phase: 0 },
    { order: 2, amp: 1.6e-3, phase: 1.0 },
    { order: 3, amp: 1.0e-3, phase: 2.2 },
  ],
  gmf: { order: 20, amp: 1.2e-3, phase: 0.3 },
  fc: 150,
  order: 4,
  firTaps: 101,
} as const;

export type DemoFilter = FilterFamily | 'fir';

/** 시각 t의 예시 속도 [m/s]. withGmf = false면 1X ~ 3X만 (걸러서 얻고 싶은 "목표" 파형) */
export function demoVelocity(t: number, withGmf = true): number {
  const w = 2 * Math.PI * FLT_DEMO.f1;
  let v = 0;
  for (const l of FLT_DEMO.lines) v += l.amp * Math.cos(l.order * w * t + l.phase);
  if (withGmf) v += FLT_DEMO.gmf.amp * Math.cos(FLT_DEMO.gmf.order * w * t + FLT_DEMO.gmf.phase);
  return v;
}

/** 사각파 (기본 주파수 f, 진폭 ±1) */
export const squareWave = (f: number, t: number): number => (Math.sin(2 * Math.PI * f * t) >= 0 ? 1 : -1);

export interface FilterChoice {
  type: DemoFilter;
  order: number;
  fc: number;
  fs: number;
  rippleDb?: number;
  firTaps?: number;
}

/** 크기·위상·군지연 */
export function demoResponse(c: FilterChoice, freqs: ArrayLike<number>): FreqResponse {
  if (c.type === 'fir') return firResponse(firLowpass(c.firTaps ?? FLT_DEMO.firTaps, c.fc, c.fs), c.fs, freqs);
  return iirResponse(designIir({ family: c.type, order: c.order, fc: c.fc, fs: c.fs, rippleDb: c.rippleDb ?? 1 }), freqs);
}

/** 신호를 거른다. twice면 두 번 거르기(영위상). FIR은 한 번 걸러도 모양은 그대로이고 (N − 1)/2 샘플 늦다 */
export function demoFilter(c: FilterChoice, x: ArrayLike<number>, twice = false): Float64Array {
  if (c.type === 'fir') {
    const h = firLowpass(c.firTaps ?? FLT_DEMO.firTaps, c.fc, c.fs);
    const once = firFilter(h, x);
    return twice ? firFilter(h, once.reverse()).reverse() : once;
  }
  const sos = designIir({ family: c.type, order: c.order, fc: c.fc, fs: c.fs, rippleDb: c.rippleDb ?? 1 }).sos;
  return twice ? filtfilt(sos, x) : sosFilter(sos, x);
}

/**
 * 사각파(−1 → +1) 모서리의 넘침 [%]: 출력이 자리 잡는 값(필터의 DC 이득 g, 두 번 거르면 g²) 기준.
 * 짝수 차수 Chebyshev는 g가 리플만큼 낮아(1 dB → 0.891) 1이 아닌 g에 자리 잡는다.
 */
export function edgeOvershoot(c: FilterChoice, y: ArrayLike<number>, twice = false): number {
  const g0 = demoResponse(c, [1e-3]).mag[0];
  const g = twice ? g0 * g0 : g0;
  let max = -Infinity;
  for (let i = 0; i < y.length; i++) max = Math.max(max, y[i]);
  return ((max - g) / (2 * g)) * 100;
}

/** 예시 파형 시료: t, 원신호(맞물림 포함), 목표(1X ~ 3X) [m/s] */
export function demoSamples(seconds: number, fs = FLT_DEMO.fs): { t: Float64Array; x: Float64Array; target: Float64Array } {
  const n = Math.round(seconds * fs);
  const t = Float64Array.from({ length: n }, (_, i) => i / fs);
  return { t, x: t.map((ti) => demoVelocity(ti)), target: t.map((ti) => demoVelocity(ti, false)) };
}

// ── LAB-INT-01: 가속도 → 속도 → 변위, ski-slope와 드리프트 ──

export const INT_DEMO = {
  fs: 2560,
  n: 16384,
  /** 속도 [m/s pk] */
  lines: [
    { f: 25, v: 4e-3, phase: 0.3 },
    { f: 50, v: 1.5e-3, phase: 1.1 },
    { f: 500, v: 0.8e-3, phase: 2.0 },
  ],
  /** 켠 직후·열 변화로 생긴 낮은 주파수 흔들림: 꺾임 2 Hz, 가속도 RMS [g] */
  lfCornerHz: 2,
  lfNoiseG: 0.01,
  /** 센서·증폭기의 작은 직류 오프셋 [g] */
  offsetG: 5e-4,
  g: 9.80665,
} as const;

export interface AccelOptions {
  lfNoiseG?: number;
  offsetG?: number;
  seed?: number;
}

/** 예시 가속도 [m/s²] (길이 INT_DEMO.n). 기계 성분 + 낮은 주파수 흔들림 + 직류 오프셋, 시드 고정 */
export function demoAccel({ lfNoiseG = INT_DEMO.lfNoiseG, offsetG = 0, seed = 7 }: AccelOptions = {}): Float64Array {
  const { fs, n, lines, lfCornerHz, g } = INT_DEMO;
  const a = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    for (const l of lines) a[i] += -2 * Math.PI * l.f * l.v * Math.sin(2 * Math.PI * l.f * t + l.phase);
  }
  if (lfNoiseG > 0) {
    const rng = createRng(seed);
    const beta = 1 - Math.exp((-2 * Math.PI * lfCornerHz) / fs);
    const warm = 4 * fs;
    const lf = new Float64Array(n);
    let y = 0;
    for (let i = -warm; i < n; i++) {
      y += beta * (rng.normal() - y);
      if (i >= 0) lf[i] = y;
    }
    let mean = 0;
    for (let i = 0; i < n; i++) mean += lf[i] / n;
    let ss = 0;
    for (let i = 0; i < n; i++) ss += (lf[i] - mean) ** 2;
    const scale = (lfNoiseG * g) / Math.sqrt(ss / n);
    for (let i = 0; i < n; i++) a[i] += (lf[i] - mean) * scale;
  }
  if (offsetG) for (let i = 0; i < n; i++) a[i] += offsetG * g;
  return a;
}

/** 실제 속도 [m/s] (기계 성분만) */
export function trueVelocity(t: number): number {
  let v = 0;
  for (const l of INT_DEMO.lines) v += l.v * Math.cos(2 * Math.PI * l.f * t + l.phase);
  return v;
}

export type IntMethod = 'spectral' | 'cumulative';

/** 가속도를 times번 적분. spectral은 주파수 영역(2차 고역 통과 크기), cumulative는 고역 통과를 먼저 걸고 누적합 */
export function demoIntegrate(a: ArrayLike<number>, method: IntMethod, times: 1 | 2, hpHz: number): Float64Array {
  const fs = INT_DEMO.fs;
  if (method === 'spectral') return integrateSpectral(a, fs, times, hpHz);
  const v = integrateCumulative(a, fs, hpHz);
  return times === 1 ? v : integrateCumulative(v, fs, hpHz);
}
