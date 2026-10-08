import { freeResponseAt, sdofProperties, type InitialState, type SdofSystem } from './sdof';

const clean = (v: number) => Math.abs(v) < 1e-12 ? 0 : v;

/** 장치와 파형 현재 점은 같은 자유응답 해석해를 사용한다. 내부 SI. */
export function dampedMotionAt(system: SdofSystem, initial: InitialState, time: number) {
  const state = freeResponseAt(system, initial, time);
  return { x: clean(state.x), v: clean(state.v), dampingForce: clean(-(system.damping ?? 0) * state.v) };
}

/** 정지 상태에서 양의 x₀를 놓은 계의 다음 양의 피크 (t = nT_d). */
export function nextDampedPeak(system: SdofSystem, time: number, duration: number): number | null {
  if (!Number.isFinite(time) || time < 0 || !Number.isFinite(duration) || duration <= 0) throw new RangeError('invalid damped step');
  const { omegaD, regime } = sdofProperties(system);
  if (omegaD === null || regime === 'critical' || regime === 'overdamped') return null;
  const period = 2 * Math.PI / omegaD;
  const next = (Math.floor(time / period + 1e-6) + 1) * period;
  return next <= duration + 1e-9 ? Math.min(next, duration) : null;
}
