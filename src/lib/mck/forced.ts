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
