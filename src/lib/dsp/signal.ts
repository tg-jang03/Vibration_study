/**
 * 가상 신호 모델 (D-011): 해석적 성분의 합 + 시드 고정 잡음.
 * 정현파 표기는 A·cos(2π f t + φ) — A는 피크(Pk) 진폭, φ는 위상 [rad] (Contents §3).
 * 단위는 SI (t [s], f [Hz]).
 */

export interface SineComponent {
  type: 'sine';
  freq: number;
  amp: number;
  phase?: number;
}

/** 기본파 f0의 하모닉 열: amps[i]는 (i+1)차 성분의 진폭, phases[i]는 위상 */
export interface HarmonicsComponent {
  type: 'harmonics';
  f0: number;
  amps: readonly number[];
  phases?: readonly number[];
}

/** 백색 가우시안 잡음. 연속 시간 값이 없으므로 샘플마다 생성한다 (표준편차 = rms). */
export interface NoiseComponent {
  type: 'noise';
  rms: number;
  seed: number;
}

/**
 * 선형 주파수 처프(Linear Chirp) 성분: 가속 또는 감속(코스트다운) 시 주파수 변화를 모사한다.
 * f(t) = f0 + rate * t [Hz]  (rate = a / 60 [Hz/s])
 * 위상 적분: φ(t) = 2π * (f0 * t + 0.5 * rate * t^2) + phase0
 * x(t) = amp * cos(φ(t))
 */
export interface ChirpComponent {
  type: 'chirp';
  /** 시작 주파수 f0 [Hz] */
  f0: number;
  /** 주파수 변화율 rate = df/dt [Hz/s] (양수: 가속, 음수: 감속) */
  rate: number;
  /** 피크 진폭 (Pk) */
  amp: number;
  /** t=0 기준 초기 위상 [rad] */
  phase?: number;
}

export type DeterministicComponent = SineComponent | HarmonicsComponent | ChirpComponent;
export type SignalComponent = DeterministicComponent | NoiseComponent;

export interface SignalSpec {
  components: readonly SignalComponent[];
}

const TWO_PI = 2 * Math.PI;

/**
 * 결정론적 성분의 순간값 x(t) — "참(연속) 신호".
 * 잡음 성분은 제외한다 (acquire에서 샘플마다 더한다).
 */
export function evaluate(spec: SignalSpec, t: number): number {
  let x = 0;
  for (const c of spec.components) {
    switch (c.type) {
      case 'sine':
        x += c.amp * Math.cos(TWO_PI * c.freq * t + (c.phase ?? 0));
        break;
      case 'harmonics':
        for (let i = 0; i < c.amps.length; i++) {
          x += c.amps[i] * Math.cos(TWO_PI * (i + 1) * c.f0 * t + (c.phases?.[i] ?? 0));
        }
        break;
      case 'chirp': {
        const phi = TWO_PI * (c.f0 * t + 0.5 * c.rate * t * t) + (c.phase ?? 0);
        x += c.amp * Math.cos(phi);
        break;
      }
      case 'noise':
        break;
      default: {
        const unknown: never = c;
        throw new Error(`알 수 없는 신호 성분: ${JSON.stringify(unknown)}`);
      }
    }
  }
  return x;
}

/** [t0, t1]을 points개 점으로 고르게 평가한 참 신호 — 화면에 연속선으로 그릴 때 쓴다. */
export function evaluateRange(
  spec: SignalSpec,
  t0: number,
  t1: number,
  points: number,
): { t: Float64Array; x: Float64Array } {
  if (!Number.isInteger(points) || points < 2) throw new RangeError('points는 2 이상의 정수여야 한다');
  const t = new Float64Array(points);
  const x = new Float64Array(points);
  const dt = (t1 - t0) / (points - 1);
  for (let i = 0; i < points; i++) {
    t[i] = t0 + i * dt;
    x[i] = evaluate(spec, t[i]);
  }
  return { t, x };
}
