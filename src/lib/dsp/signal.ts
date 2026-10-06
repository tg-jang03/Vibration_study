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

/**
 * 감쇠 임펄스열: 일정한 간격으로 '딱' 치고, 구조의 고유진동수로 울리다 잦아드는 충격의 반복 (기어 이빨 결함, 베어링 결함 등).
 * 충격 시각 t_k = offset + k / rate (k = 0, 1, 2, …). 충격 하나의 응답 amp·e^(−(t − t_k)/decay)·sin(2π ringFreq (t − t_k)), t ≥ t_k.
 * t < offset에는 0. 시정수의 12배보다 오래된 충격은 무시한다 (e^−12 ≈ 6e−6).
 */
export interface ImpulsesComponent {
  type: 'impulses';
  /** 충격 반복 주파수 [Hz] (한 바퀴에 한 번이면 회전 주파수) */
  rate: number;
  /** 피크 근처 크기 (울림의 진폭) */
  amp: number;
  /** 울림 주파수 [Hz] (구조의 고유진동수) */
  ringFreq: number;
  /** 울림이 e^−1로 줄어드는 시간 [s] */
  decay: number;
  /** 첫 충격 시각 [s] */
  offset?: number;
}

/**
 * 변조된 정현파 (P2-8): x(t) = amp · (1 + am·cos(2π modFreq t + amPhase)) · cos(2π carrier t + fm·sin(2π modFreq t) + phase).
 * am은 AM 변조 지수 m(크기가 오르내리는 비율), fm은 FM 변조 지수 β(위상이 흔들리는 크기, 최대 주파수 흔들림 = β·modFreq).
 * 둘 다 주면 AM과 FM이 같은 주파수로 함께 걸린 신호 (amPhase가 둘 사이의 위상차).
 */
export interface ModulatedComponent {
  type: 'modulated';
  /** 반송파 주파수 f_c [Hz] */
  carrier: number;
  /** 반송파 진폭 A (Peak) */
  amp: number;
  /** 변조 주파수 f_m [Hz] */
  modFreq: number;
  /** AM 변조 지수 m (0 이상, 보통 0 ~ 1) */
  am?: number;
  /** FM 변조 지수 β */
  fm?: number;
  /** AM 포락선의 위상 [rad] — FM과의 위상차 */
  amPhase?: number;
  /** 반송파 위상 [rad] */
  phase?: number;
}

export type DeterministicComponent = SineComponent | HarmonicsComponent | ChirpComponent | ImpulsesComponent | ModulatedComponent;
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
      case 'impulses': {
        const offset = c.offset ?? 0;
        if (t < offset || !(c.rate > 0) || !(c.decay > 0)) break;
        const period = 1 / c.rate;
        for (let k = Math.floor((t - offset) * c.rate); k >= 0; k--) {
          const tau = t - (offset + k * period);
          if (tau > 12 * c.decay) break;
          if (tau < 0) continue;
          x += c.amp * Math.exp(-tau / c.decay) * Math.sin(TWO_PI * c.ringFreq * tau);
        }
        break;
      }
      case 'modulated': {
        const wm = TWO_PI * c.modFreq * t;
        const env = 1 + (c.am ?? 0) * Math.cos(wm + (c.amPhase ?? 0));
        x += c.amp * env * Math.cos(TWO_PI * c.carrier * t + (c.fm ?? 0) * Math.sin(wm) + (c.phase ?? 0));
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
