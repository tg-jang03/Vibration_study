/** 지정한 시간 곡선의 벡터 예제. 열전달·유막 피드백의 해가 아니다. */
import { addVectors, toRad, wrap2pi, type AmpLag } from '../phase';

export type ThermalScenario = 'thermal' | 'morton';
export interface ThermalOptions {
  scenario?: ThermalScenario;
  amplitude?: number;
  lag?: number;
  decayTime?: number;
  period?: number;
  growth?: number;
}
export const THERMAL_BASELINE: Readonly<AmpLag> = Object.freeze({ amp: 20e-6, lag: toRad(350) });
export const THERMAL_DEFAULTS = Object.freeze({ amplitude: 12e-6, lag: toRad(80), decayTime: 1200 });
export const MORTON_DEFAULTS = Object.freeze({ amplitude: 5e-6, lag: toRad(80), period: 1800, growth: 1 });

/** SI: t/decayTime/period 초, amplitude m Peak, lag rad, growth 60분간 증가율. */
export function thermalContribution(time: number, options: ThermalOptions = {}): AmpLag {
  const scenario = options.scenario ?? 'thermal';
  const d = scenario === 'thermal' ? THERMAL_DEFAULTS : MORTON_DEFAULTS;
  const amplitude = options.amplitude ?? d.amplitude, lag = options.lag ?? d.lag;
  const decayTime = options.decayTime ?? THERMAL_DEFAULTS.decayTime;
  const period = options.period ?? MORTON_DEFAULTS.period, growth = options.growth ?? MORTON_DEFAULTS.growth;
  if (!['thermal', 'morton'].includes(scenario) || !Number.isFinite(time) || time < 0 || !Number.isFinite(amplitude) || amplitude < 0 || !Number.isFinite(lag) || !Number.isFinite(decayTime) || decayTime <= 0 || !Number.isFinite(period) || period <= 0 || !Number.isFinite(growth) || growth < 0) throw new RangeError('invalid thermal options');
  const amp = amplitude * (scenario === 'thermal' ? Math.exp(-time / decayTime) : 1 + growth * time / 3600);
  return { amp, lag: wrap2pi(lag + (scenario === 'morton' ? 2 * Math.PI * time / period : 0)) };
}

/** 일정한 고속 운전 조건에서 열에 의한 응답 기여. 기하학적 축 휨 자체가 아니다. */
export function thermalResponse(time: number, options: ThermalOptions = {}, baseline: AmpLag = THERMAL_BASELINE) {
  if (!Number.isFinite(baseline.amp) || baseline.amp < 0 || !Number.isFinite(baseline.lag)) throw new RangeError('invalid baseline');
  const contribution = thermalContribution(time, options);
  const sum = addVectors(baseline, contribution);
  // 완전 상쇄의 부동소수점 잔여는 0으로 표시한다.
  const oneX = sum.amp <= Math.max(baseline.amp, contribution.amp) * 1e-14 ? { amp: 0, lag: 0 } : sum;
  return { oneX, contribution, baseline };
}

/** 별도의 저속 기하 예제: bow + 일정 runout. 고속 응답의 교정·환산 모델이 아니다. */
export function slowRollExample(time: number, runout: AmpLag = { amp: 4e-6, lag: toRad(80) }): AmpLag {
  if (!Number.isFinite(runout.amp) || runout.amp < 0 || !Number.isFinite(runout.lag)) throw new RangeError('invalid runout');
  return addVectors(thermalContribution(time), runout);
}
