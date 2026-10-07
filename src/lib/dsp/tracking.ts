/**
 * 트래킹 필터 · 노치 필터 (P5-5, LAB-FLT-02). 순수 함수, 시간 [s], 각도 [rad], 주파수 [Hz].
 *
 * 디지털 트래킹 필터 = 복소 복조 + 저역 통과 (lock-in):
 *   V̂_nX(t) = 2 · LPF{ x(t) e^{−jnθ(t)} }
 * x = A cos(nθ − φ)이면 x e^{−jnθ} = (A/2) e^{−jφ} + (A/2) e^{−j(2nθ − φ)} → 저역 통과가 둘째 항을 지우고 V̂ = A e^{−jφ}.
 * 이것은 P3-3의 1X 벡터(지연각 관례, Contents §3)와 같다. θ(t)는 키페이저 펄스로 얻은 축 각도다 (P5-4).
 * 저역 통과는 Butterworth(P5-1, 기본 2차), 차단 f_c = B/2 → 원래 신호에서는 nX를 가운데 둔 −3 dB 폭 B의 띠 통과와 같다.
 * 노치: x − Re{V̂ e^{jnθ}} — 뽑은 nX 파형을 빼서 지운다 (Not-1X).
 */
import { designIir, filtfilt, iirResponse, sosFilter, sosSteadyState, type Biquad } from './filter';

export interface TrackingOptions {
  fs: number;
  /** 띠 통과로 본 −3 dB 폭 B [Hz]. 저역 통과 차단은 B/2 */
  bandwidth: number;
  /** 차수 n (기본 1). 2면 2X 벡터 */
  order?: number;
  /** true면 두 번 거르기(영위상): 지연이 없지만 저장된 데이터에만 쓸 수 있다 */
  zeroPhase?: boolean;
  /** 저역 통과 차수 (기본 2) */
  lpfOrder?: number;
  /** 한 방향 거르기를 이 벡터에 이미 자리 잡은 상태에서 시작 (기본: 0에서 시작) */
  initial?: { re: number; im: number };
}

/** 시각마다의 nX 벡터 V̂ = re + j·im (진폭은 Peak, x와 같은 단위) */
export interface TrackedVector {
  re: Float64Array;
  im: Float64Array;
}

/** 트래킹 필터의 저역 통과 (차단 B/2) */
export function trackingLowpass(fs: number, bandwidth: number, lpfOrder = 2): Biquad[] {
  return designIir({ family: 'butterworth', order: lpfOrder, fc: bandwidth / 2, fs }).sos;
}

/** V̂_nX(t) = 2·LPF{x e^{−jnθ}} */
export function trackOrder(x: ArrayLike<number>, theta: ArrayLike<number>, opts: TrackingOptions): TrackedVector {
  if (x.length !== theta.length) throw new RangeError('x and theta must have the same length');
  if (!(opts.bandwidth > 0)) throw new RangeError('bandwidth must be > 0');
  const n = opts.order ?? 1;
  const len = x.length;
  const re = new Float64Array(len);
  const im = new Float64Array(len);
  for (let i = 0; i < len; i++) {
    const a = n * theta[i];
    re[i] = 2 * x[i] * Math.cos(a);
    im[i] = -2 * x[i] * Math.sin(a);
  }
  const sos = trackingLowpass(opts.fs, opts.bandwidth, opts.lpfOrder ?? 2);
  if (opts.zeroPhase) return { re: filtfilt(sos, re), im: filtfilt(sos, im) };
  const zi = opts.initial ? sosSteadyState(sos) : undefined;
  const scaled = (v: number) => zi?.map(([a, b]) => [a * v, b * v] as [number, number]);
  return { re: sosFilter(sos, re, scaled(opts.initial?.re ?? 0)), im: sosFilter(sos, im, scaled(opts.initial?.im ?? 0)) };
}

/** 뽑은 nX 파형 Re{V̂ e^{jnθ}} = |V̂| cos(nθ − φ̂) */
export function reconstructOrder(v: TrackedVector, theta: ArrayLike<number>, order = 1): Float64Array {
  const out = new Float64Array(theta.length);
  for (let i = 0; i < theta.length; i++) {
    const a = order * theta[i];
    out[i] = v.re[i] * Math.cos(a) - v.im[i] * Math.sin(a);
  }
  return out;
}

/** 노치: nX를 뽑아 빼고 남은 신호 (n = 1이면 Not-1X) */
export function notchOrder(x: ArrayLike<number>, theta: ArrayLike<number>, opts: TrackingOptions): Float64Array {
  const rec = reconstructOrder(trackOrder(x, theta, opts), theta, opts.order ?? 1);
  return Float64Array.from(x, (v, i) => v - rec[i]);
}

/** 한 방향 거르기의 지연 = 저역 통과의 0 Hz 군지연 (P5-1). 2차 Butterworth면 √2/(2π f_c) = √2/(πB) ≈ 0.45/B */
export function trackingDelay(bandwidth: number, fs: number, lpfOrder = 2): number {
  const d = designIir({ family: 'butterworth', order: lpfOrder, fc: bandwidth / 2, fs });
  return iirResponse(d, [0]).groupDelay[0];
}

/**
 * 넓은 대역 잡음(표준편차 σ, 표본마다 독립)이 V̂의 크기에 만드는 흔들림의 표준편차 [x와 같은 단위, Peak].
 * x e^{−jθ}의 실수·허수부는 각각 분산 σ²/2인 흰 잡음 → 저역 통과의 잡음 이득 Σh² = 2·ENBW/f_s → ×2.
 * 크기 방향 성분: σ_A = σ √(2 Σh²) = σ √(4 ENBW / f_s). Butterworth n차 ENBW = π f_c / (2n sin(π/2n)).
 * 1X가 잡음보다 충분히 클 때의 근사. 위상 흔들림은 σ_A / |V| [rad].
 */
export function trackingNoise(sigma: number, bandwidth: number, fs: number, lpfOrder = 2): number {
  const fc = bandwidth / 2;
  const enbw = (Math.PI * fc) / (2 * lpfOrder * Math.sin(Math.PI / (2 * lpfOrder)));
  return sigma * Math.sqrt((4 * enbw) / fs);
}
