/**
 * 키페이저 · 위상 · 1X 벡터 (P2-3, LAB-PHS-01 · LAB-SRO-01). 순수 함수, 각도는 rad, 길이는 m (D-012).
 * 위상 관례 (Contents §3, D-034): 지연각 φ (0 ≤ φ < 2π) — 키페이저 펄스에서 1X 신호의 다음 양의 피크까지의 회전각.
 * 1X 신호 x(θ) = A cos(θ − φ) (축이 센서 쪽으로 오면 +), 1X 벡터 V = A e^{−jφ}.
 * 키페이저 펄스는 P2-2의 교정 곡선(`proximity.ts`)으로, 회전수에 따른 응답은 `lib/mck`의 불평형 응답으로 만든다.
 */
import { unbalanceResponseFactor } from './mck';
import { gapVoltage, ROTOR } from './proximity';

export interface Complex {
  re: number;
  im: number;
}

/** 진폭과 지연각으로 적은 1X 벡터 A∠φ (A는 호출한 쪽 단위 그대로, 보통 m pp) */
export interface AmpLag {
  amp: number;
  /** 지연각 [rad], 0 ≤ lag < 2π */
  lag: number;
}

const TWO_PI = 2 * Math.PI;

/** 0 ≤ a < 2π 로 */
export function wrap2pi(a: number): number {
  const w = ((a % TWO_PI) + TWO_PI) % TWO_PI;
  return w >= TWO_PI - 1e-12 ? 0 : w;
}

/** −π ≤ a < π 로 */
export function wrapPi(a: number): number {
  return wrap2pi(a + Math.PI) - Math.PI;
}

export const toDeg = (rad: number) => (rad * 180) / Math.PI;
export const toRad = (deg: number) => (deg * Math.PI) / 180;

/** A∠φ → A e^{−jφ} */
export function phasor(v: AmpLag): Complex {
  return { re: v.amp * Math.cos(v.lag), im: -v.amp * Math.sin(v.lag) };
}

/** 복소수 → A∠φ. 크기 0이면 지연각 0 */
export function toAmpLag(c: Complex): AmpLag {
  const amp = Math.hypot(c.re, c.im);
  return { amp, lag: amp === 0 ? 0 : wrap2pi(-Math.atan2(c.im, c.re)) };
}

export const addVectors = (a: AmpLag, b: AmpLag): AmpLag => {
  const p = phasor(a);
  const q = phasor(b);
  return toAmpLag({ re: p.re + q.re, im: p.im + q.im });
};

/** a − b (벡터로 빼기). Slow roll 보상 V_c = V − V_sr */
export const subtractVectors = (a: AmpLag, b: AmpLag): AmpLag => addVectors(a, { amp: -b.amp, lag: b.lag });

/** 시간 차이 → 지연각: φ = 2π f_r Δt (한 바퀴를 넘으면 접는다) */
export function lagFromDelay(delay: number, fr: number): number {
  if (!(fr > 0)) throw new RangeError('fr must be > 0');
  return wrap2pi(TWO_PI * fr * delay);
}

/** 지연각 → 시간 차이 Δt = φ / (2π f_r) */
export function delayFromLag(lag: number, fr: number): number {
  if (!(fr > 0)) throw new RangeError('fr must be > 0');
  return wrap2pi(lag) / (TWO_PI * fr);
}

/**
 * 위상 관례 (P2-3 §3). 같은 1X 신호 A cos(θ − φ)를 장비마다 다른 숫자로 적는다.
 * - lag: 키페이저 → 다음 양의 피크까지 지연 (0 ~ 2π) — 이 사이트의 기준
 * - lead: cos 기준 앞섬각 ψ, x = A cos(θ + ψ) (−π ~ π) — FFT 분석기의 위상 (P1-1)
 * - zeroCross: 키페이저 → 다음 위로 지나는 영점까지 지연 (0 ~ 2π) — 영점 기준 (피크보다 1/4 바퀴 앞)
 */
export type PhaseConvention = 'lag' | 'lead' | 'zeroCross';

export function phaseInConvention(lag: number, convention: PhaseConvention): number {
  if (convention === 'lead') return wrapPi(-lag);
  if (convention === 'zeroCross') return wrap2pi(lag - Math.PI / 2);
  return wrap2pi(lag);
}

/**
 * 동기 DFT: 키페이저 펄스에서 시작해 한 바퀴에 samplesPerRev점씩 정수 바퀴를 담은 샘플열의 n차 성분.
 * X = (2/N) Σ x[i] e^{−j 2π n i / samplesPerRev} — x = A cos(nθ − φ)이면 X = A e^{−jφ} (단일측 진폭, P1-1).
 */
export function orderVector(x: ArrayLike<number>, samplesPerRev: number, order = 1): Complex {
  const revs = Math.floor(x.length / samplesPerRev);
  if (revs < 1) throw new RangeError('need at least one whole revolution');
  const n = revs * samplesPerRev;
  let re = 0;
  let im = 0;
  for (let i = 0; i < n; i++) {
    const a = (TWO_PI * order * i) / samplesPerRev;
    re += x[i] * Math.cos(a);
    im -= x[i] * Math.sin(a);
  }
  return { re: (2 * re) / n, im: (2 * im) / n };
}

// ── 키페이저 펄스 ──

export interface KeyNotch {
  /** 홈이 없는 곳의 gap [m] */
  gap: number;
  /** 홈 깊이 [m] */
  depth: number;
  /** 홈 폭 (회전각) [rad] */
  width: number;
  /** 가장자리가 흐려지는 폭 [rad] (프로브가 보는 면적 때문에 계단이 아니라 비탈이 된다) */
  edge: number;
}

/** 예시 홈: gap 1.2 mm, 깊이 1.0 mm, 폭 12° (선형 범위 안 — 홈 바닥 2.2 mm) */
export const KEY_NOTCH: KeyNotch = { gap: 1.2e-3, depth: 1.0e-3, width: toRad(12), edge: toRad(0.8) };

const sigmoid = (u: number) => 1 / (1 + Math.exp(-u));

/** 홈의 깊이 비율 (0 ~ 1). 앞쪽 가장자리가 θ = 0에서 정확히 절반 */
function notchShape(theta: number, notch: KeyNotch): number {
  const t = wrapPi(theta - notch.width / 2) + notch.width / 2; // 홈 가운데를 기준으로 접는다: θ = 0이 앞 가장자리, θ = width가 뒤 가장자리
  return sigmoid(t / notch.edge) * sigmoid((notch.width - t) / notch.edge);
}

/** 키페이저 프로브 출력 [V]: 홈이 지나가면 gap이 커져 더 음으로 떨어지는 펄스 */
export function keyphasorVoltage(theta: number, notch: KeyNotch = KEY_NOTCH): number {
  return gapVoltage(notch.gap + notch.depth * notchShape(theta, notch));
}

/** 펄스를 알아보는 문턱: 홈 없는 전압과 홈 바닥 전압의 가운데. 내려가며 이 값을 지나는 순간이 θ = 0 */
export function keyphasorThreshold(notch: KeyNotch = KEY_NOTCH): number {
  return (gapVoltage(notch.gap) + gapVoltage(notch.gap + notch.depth)) / 2;
}

// ── 축 신호 (1X + 2X) ──

export interface ShaftSignal {
  /** 1X [m pp] · 지연각 */
  oneX: AmpLag;
  /** 2X [m pp] · 2X의 지연각 (x = A₂/2 cos(2θ − φ₂)) */
  twoX?: AmpLag;
}

/** 회전각 θ에서 축 변위 (센서 쪽이 +) [m] */
export function shaftDisplacement(theta: number, s: ShaftSignal): number {
  let x = (s.oneX.amp / 2) * Math.cos(theta - s.oneX.lag);
  if (s.twoX) x += (s.twoX.amp / 2) * Math.cos(2 * theta - s.twoX.lag);
  return x;
}

/** 한 바퀴(키페이저 펄스 → 다음 펄스) 안에서 가장 높은 봉우리의 회전각 [rad] — 원신호를 눈으로 읽을 때 */
export function highestPeakAngle(f: (theta: number) => number, samples = 7200): number {
  let best = 0;
  let bestV = -Infinity;
  for (let i = 0; i < samples; i++) {
    const th = (TWO_PI * i) / samples;
    const v = f(th);
    if (v > bestV) {
      bestV = v;
      best = th;
    }
  }
  return best;
}

// ── 런업과 Slow roll 보상 ──

/** 예시 로터 (P2-2와 같다): 임계 2000 rpm, ζ 0.1, 운전 3600 rpm */
export const SR_ROTOR = ROTOR;

/**
 * 회전수 rpm에서 불평형 응답의 1X 벡터. respAtOp: 운전 회전수에서의 크기 [m pp].
 * 지연각 = 불평형 응답의 위상 지연 φ(r) + offset (키페이저 홈·센서·무거운 점의 각도가 정하는 일정한 값, 예시는 0)
 */
export function responseVector(rpm: number, respAtOp: number, offset = 0): AmpLag {
  const at = (n: number) => unbalanceResponseFactor(n / SR_ROTOR.criticalRpm, SR_ROTOR.zeta);
  const cur = at(rpm);
  return { amp: (respAtOp * cur.factor) / at(SR_ROTOR.operatingRpm).factor, lag: wrap2pi(cur.phaseLag + offset) };
}

export type CompensationMode = 'none' | 'scalar' | 'vector';

export interface RunUpInput {
  /** 운전 회전수에서 불평형 응답 크기 [m pp] */
  respAtOp: number;
  /** 런아웃의 1X 벡터 (회전수와 무관) [m pp] */
  runout: AmpLag;
  /** Slow roll 벡터를 잡는 회전수 [rpm] */
  slowRollRpm: number;
  mode: CompensationMode;
  offset?: number;
  /** 회전수 격자 (기본 50 ~ 4000 rpm, 10 rpm 간격) */
  rpm?: number[];
}

export interface RunUp {
  rpm: number[];
  /** 참 응답 (런아웃 없음) */
  truth: AmpLag[];
  /** 센서가 읽은 1X = 응답 + 런아웃 */
  measured: AmpLag[];
  /** 보상 결과 (mode = none이면 measured와 같다) */
  compensated: AmpLag[];
  /** Slow roll 회전수에서 읽은 1X 벡터 (런아웃 + 그 회전수의 작은 응답) */
  slowRoll: AmpLag;
}

/** 한 점 보상. scalar는 크기만 빼고(0 아래는 0) 위상은 그대로, vector는 복소수로 뺀다 */
export function compensate(v: AmpLag, sr: AmpLag, mode: CompensationMode): AmpLag {
  if (mode === 'none') return v;
  if (mode === 'scalar') return { amp: Math.max(0, v.amp - sr.amp), lag: v.lag };
  return subtractVectors(v, sr);
}

export function simulateRunUp(input: RunUpInput): RunUp {
  const rpm = input.rpm ?? Array.from({ length: 396 }, (_, i) => 50 + i * 10);
  const measuredAt = (n: number) => addVectors(responseVector(n, input.respAtOp, input.offset), input.runout);
  const slowRoll = measuredAt(input.slowRollRpm);
  const truth = rpm.map((n) => responseVector(n, input.respAtOp, input.offset));
  const measured = rpm.map(measuredAt);
  const compensated = measured.map((v) => compensate(v, slowRoll, input.mode));
  return { rpm, truth, measured, compensated, slowRoll };
}
