import { freeResponseAt, sdofProperties, type InitialState, type SdofState, type SdofSystem } from './sdof';

export interface FrequencyResponse {
  amplitudeRatio: number;
  phaseLag: number;
}

function nonnegative(name: string, value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and >= 0`);
  return value;
}

/** H(r) = 1 / sqrt((1-r²)² + (2ζr)²). */
export function steadyStateResponse(frequencyRatio: number, zeta: number): FrequencyResponse {
  const r = nonnegative('frequencyRatio', frequencyRatio);
  const z = nonnegative('zeta', zeta);
  const real = 1 - r ** 2;
  const imaginary = 2 * z * r;
  const denominator = Math.hypot(real, imaginary);
  return {
    amplitudeRatio: denominator === 0 ? Number.POSITIVE_INFINITY : 1 / denominator,
    phaseLag: denominator === 0 ? Math.PI / 2 : Math.atan2(imaginary, real),
  };
}

export interface ResonancePeak {
  /** 진폭비가 최대가 되는 진동수비 r = √(1 − 2ζ²) */
  frequencyRatio: number;
  /** 최대 진폭비 1 / (2ζ√(1 − ζ²)) */
  amplitudeRatio: number;
}

/** 힘 진폭이 일정한 1자유도 강제진동의 진폭비 최대점. ζ ≥ 1/√2이면 r = 0에서 최대(1)라 null. */
export function resonancePeak(zeta: number): ResonancePeak | null {
  const z = nonnegative('zeta', zeta);
  if (z === 0) return { frequencyRatio: 1, amplitudeRatio: Number.POSITIVE_INFINITY };
  if (2 * z ** 2 >= 1) return null;
  return {
    frequencyRatio: Math.sqrt(1 - 2 * z ** 2),
    amplitudeRatio: 1 / (2 * z * Math.sqrt(1 - z ** 2)),
  };
}

export interface HalfPowerPoints {
  lower: number;
  upper: number;
  /** upper − lower (진동수비 단위). 작은 ζ에서 ≈ 2ζ */
  width: number;
}

/**
 * 진폭비가 최대값의 1/√2가 되는 두 진동수비 (Half-power 점).
 * r² = 1 − 2ζ² ± 2ζ√(1 − ζ²). 아래 점이 없을 만큼 ζ가 크면 null.
 */
export function halfPowerPoints(zeta: number): HalfPowerPoints | null {
  const z = nonnegative('zeta', zeta);
  if (z === 0 || 2 * z ** 2 >= 1) return null;
  const centre = 1 - 2 * z ** 2;
  const spread = 2 * z * Math.sqrt(1 - z ** 2);
  if (centre - spread <= 0) return null;
  const lower = Math.sqrt(centre - spread);
  const upper = Math.sqrt(centre + spread);
  return { lower, upper, width: upper - lower };
}

export interface ForcedInput {
  forceAmplitude: number;
  forcingOmega: number;
}

export interface ForcedState extends SdofState {
  steady: number;
  transient: number;
}

/** m x¨ + c x˙ + kx = F₀ cos(Ωt)의 정상상태 + 초기조건을 맞춘 과도응답. */
export function forcedResponseAt(
  system: SdofSystem,
  input: ForcedInput,
  initial: InitialState,
  time: number,
): ForcedState {
  if (!Number.isFinite(input.forceAmplitude)) throw new RangeError('forceAmplitude must be finite');
  const forcingOmega = nonnegative('forcingOmega', input.forcingOmega);
  const props = sdofProperties(system);
  const response = steadyStateResponse(forcingOmega / props.omegaN, props.zeta);
  if (!Number.isFinite(response.amplitudeRatio)) throw new RangeError('undamped resonance has no bounded steady-state response');

  const amplitude = (input.forceAmplitude / system.stiffness) * response.amplitudeRatio;
  const phase = response.phaseLag;
  const steady = amplitude * Math.cos(forcingOmega * time - phase);
  const steady0 = amplitude * Math.cos(phase);
  const steadyV0 = amplitude * forcingOmega * Math.sin(phase);
  const transientState = freeResponseAt(
    system,
    { x0: initial.x0 - steady0, v0: (initial.v0 ?? 0) - steadyV0 },
    time,
  );
  const steadyV = -amplitude * forcingOmega * Math.sin(forcingOmega * time - phase);
  const steadyA = -amplitude * forcingOmega ** 2 * Math.cos(forcingOmega * time - phase);

  return {
    x: steady + transientState.x,
    v: steadyV + transientState.v,
    a: steadyA + transientState.a,
    steady,
    transient: transientState.x,
  };
}

export function forcedResponse(
  system: SdofSystem,
  input: ForcedInput,
  initial: InitialState,
  times: ArrayLike<number>,
): ForcedState[] {
  return Array.from(times, (time) => forcedResponseAt(system, input, initial, time));
}
