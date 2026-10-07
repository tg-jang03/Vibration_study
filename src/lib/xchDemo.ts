/**
 * P5-3 "2채널 분석"의 예시. 본문 그림과 랩(LAB-XCH-01·LAB-FULL-01)이 같이 쓴다. 순수 함수, 시드 고정.
 *
 * FRF 예시: 받침대(구조)에 랜덤 힘을 주고 응답을 잰다. 두 모드(80 Hz ζ 0.03, 210 Hz ζ 0.02)의 구동점 응답이라
 * 두 공진 사이에 반공진(응답이 거의 0이 되는 곳, 약 106 Hz)이 있다. 크기는 정적 처짐을 1로 둔 비(무차원).
 * 프레임마다 입력 스펙트럼 X_m(f)를 랜덤으로 만들고 Y_m = H·X_m에 잡음을 더한다 (FFT를 거친 것과 같은 bin 값을 바로 만든다).
 */
import { createRng } from './dsp/random';
import type { CxArray } from './dsp/twoChannel';

export const FRF_DEMO = {
  df: 2,
  fMax: 400,
  modes: [
    { f: 80, zeta: 0.03 },
    { f: 210, zeta: 0.02 },
  ],
} as const;

export const FREQS = Float64Array.from({ length: FRF_DEMO.fMax / FRF_DEMO.df + 1 }, (_, i) => i * FRF_DEMO.df);

/** 참 FRF: Σ 1 / (1 − r² + 2jζr), r = f/f_i */
export function trueH(f: number): { re: number; im: number } {
  let re = 0;
  let im = 0;
  for (const m of FRF_DEMO.modes) {
    const r = f / m.f;
    const a = 1 - r * r;
    const b = 2 * m.zeta * r;
    const d = a * a + b * b;
    re += a / d;
    im -= b / d;
  }
  return { re, im };
}

export const TRUE_H: CxArray = { re: FREQS.map((f) => trueH(f).re), im: FREQS.map((f) => trueH(f).im) };
/** 반공진 주파수 (참 FRF 크기가 가장 작은 bin, 두 공진 사이) */
export const ANTI_F = (() => {
  let best = 0;
  let bestMag = Infinity;
  FREQS.forEach((f, i) => {
    const m = Math.hypot(TRUE_H.re[i], TRUE_H.im[i]);
    if (f > 85 && f < 200 && m < bestMag) {
      bestMag = m;
      best = f;
    }
  });
  return best;
})();
/** 0 ~ f_max 평균 ∣H∣² (출력 잡음 크기의 기준) */
const MEAN_H2 = TRUE_H.re.reduce((s, v, i) => s + v * v + TRUE_H.im[i] ** 2, 0) / FREQS.length;

export interface FrfOptions {
  /** 평균할 프레임 수 */
  frames: number;
  /** 입력(힘) 측정 잡음 RMS ÷ 입력 RMS */
  inputNoise?: number;
  /** 출력(응답) 측정 잡음 RMS ÷ 응답의 평균 RMS */
  outputNoise?: number;
  seed?: number;
}

/** 측정된 입력·출력 프레임들 (bin 값). 입력 파워는 bin마다 평균 1 */
export function frfFrames({ frames, inputNoise = 0, outputNoise = 0, seed = 21 }: FrfOptions): { x: CxArray[]; y: CxArray[] } {
  const rng = createRng(seed);
  const k = FREQS.length;
  const s = Math.SQRT1_2; // 복소 가우스: 실·허 각각 분산 1/2 → E∣·∣² = 1
  const ny = outputNoise * Math.sqrt(MEAN_H2);
  const x: CxArray[] = [];
  const y: CxArray[] = [];
  for (let m = 0; m < frames; m++) {
    const xr = new Float64Array(k);
    const xi = new Float64Array(k);
    const yr = new Float64Array(k);
    const yi = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      const ur = s * rng.normal();
      const ui = s * rng.normal();
      const hr = TRUE_H.re[i];
      const hi = TRUE_H.im[i];
      xr[i] = ur + inputNoise * s * rng.normal();
      xi[i] = ui + inputNoise * s * rng.normal();
      yr[i] = hr * ur - hi * ui + ny * s * rng.normal();
      yi[i] = hr * ui + hi * ur + ny * s * rng.normal();
    }
    x.push({ re: xr, im: xi });
    y.push({ re: yr, im: yi });
  }
  return { x, y };
}

// ── Full spectrum 예시: X·Y 두 센서의 1X ──

export interface OrbitOptions {
  /** X·Y 진폭 [m Peak] */
  ax: number;
  ay: number;
  /** Y가 X보다 늦은 위상 [°] (90°면 반시계 = 정방향 원) */
  lagDeg: number;
  /** Y 센서 감도 오차 (0.1 = +10 %) */
  gainErr?: number;
  /** Y 센서 설치 각도 오차 [°] (90°에서 벗어난 양) */
  angleErrDeg?: number;
  /** 0.45X 정방향 원 성분 [m] */
  whirl?: number;
}

export const ORBIT_DEMO = { f1: 50, fs: 1280, n: 1024 } as const; // T = 0.8 s: 1X 40바퀴, 0.45X 18바퀴 (정수 → 누설 없음)

/** 측정된 x·y [m] (정수 바퀴 → 윈도우 없이 FFT) */
export function orbitSignals(o: OrbitOptions): { t: Float64Array; x: Float64Array; y: Float64Array } {
  const { f1, fs, n } = ORBIT_DEMO;
  const lag = (o.lagDeg * Math.PI) / 180;
  const d = ((o.angleErrDeg ?? 0) * Math.PI) / 180;
  const g = 1 + (o.gainErr ?? 0);
  const t = Float64Array.from({ length: n }, (_, i) => i / fs);
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const w = 2 * Math.PI * f1 * t[i];
    let xt = o.ax * Math.cos(w);
    let yt = o.ay * Math.cos(w - lag);
    if (o.whirl) {
      const ww = 2 * Math.PI * 0.45 * f1 * t[i];
      xt += o.whirl * Math.cos(ww);
      yt += o.whirl * Math.sin(ww);
    }
    // Y 센서가 90° + d 방향을 보고 감도가 g배이면: y_m = g(−x sin d + y cos d)
    x[i] = xt;
    y[i] = g * (-xt * Math.sin(d) + yt * Math.cos(d));
  }
  return { t, x, y };
}
