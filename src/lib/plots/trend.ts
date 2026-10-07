/** P6-4 / LAB-TRND-01 정속 운전의 설명용 추세. SI(m,s,rad), 성분 진폭은 Peak. */
import { phasor, subtractVectors, toRad, wrap2pi, wrapPi, type AmpLag } from '../phase';
export type TrendScenario = 'rotate' | 'grow' | 'residual';
export const TREND_LABELS: Record<TrendScenario, string> = {
  rotate: '1X 위상만 이동', grow: '1X 진폭 증가', residual: '1X 그대로·2X 증가',
};
export const PHASE_FLOOR = 1e-6; // 위상 사용 최소 진폭 예시. 규격·장비 공통값이 아님.
export interface TrendOptions { scenario?: TrendScenario; phaseChange?: number; amplitudeGrowth?: number }
export interface TrendSample { time: number; oneX: AmpLag; continuousLag: number; twoX: number; overall: number; oneXRms: number; notOneXRms: number }
export interface Acceptance { amplitudeFraction: number; phaseHalfWidth: number; phaseFloor?: number }
const clean = (v: number) => Math.abs(v) < 1e-12 ? 0 : v;
const validateVector = (v: AmpLag) => {
  if (!Number.isFinite(v.amp) || v.amp < 0 || !Number.isFinite(v.lag)) throw new RangeError('invalid vector');
};

export function trendSeries({ scenario = 'rotate', phaseChange = toRad(120), amplitudeGrowth = 0.5 }: TrendOptions = {}): TrendSample[] {
  if (!['rotate', 'grow', 'residual'].includes(scenario) || !Number.isFinite(phaseChange) || !Number.isFinite(amplitudeGrowth) || amplitudeGrowth < 0 || amplitudeGrowth > 1) throw new RangeError('invalid trend options');
  return Array.from({ length: 61 }, (_, i) => {
    const s = i / 60;
    const amp = 20e-6 * (scenario === 'grow' ? 1 + amplitudeGrowth * s : 1);
    const continuousLag = toRad(350) + (scenario === 'rotate' ? phaseChange * s : 0);
    const twoX = 2e-6 * (scenario === 'residual' ? 1 + 3 * s : 1);
    return { time: i * 60, oneX: { amp, lag: wrap2pi(continuousLag) }, continuousLag, twoX,
      overall: Math.hypot(amp, twoX) / Math.sqrt(2), oneXRms: amp / Math.sqrt(2), notOneXRms: twoX / Math.sqrt(2) };
  });
}

export function acceptance(sample: AmpLag, reference: AmpLag, region: Acceptance) {
  validateVector(sample); validateVector(reference);
  const floor = region.phaseFloor ?? PHASE_FLOOR;
  if (!Number.isFinite(floor) || floor < 0 || !Number.isFinite(region.amplitudeFraction) || region.amplitudeFraction < 0 || region.amplitudeFraction > 1 || !Number.isFinite(region.phaseHalfWidth) || region.phaseHalfWidth < 0 || region.phaseHalfWidth > Math.PI) throw new RangeError('invalid acceptance region');
  const delta = subtractVectors(sample, reference);
  const deltaAmplitude = sample.amp - reference.amp;
  const usable = sample.amp > floor && reference.amp > floor;
  const relativeAmplitude = reference.amp === 0 ? null : clean(deltaAmplitude / reference.amp);
  const phaseDelta = usable ? clean(wrapPi(sample.lag - reference.lag)) : null;
  // 작은 진폭의 위상은 판정에 쓰지 않는다. 원주 경계의 반올림 오차만 허용한다.
  const inside = usable ? Math.abs(relativeAmplitude!) <= region.amplitudeFraction + 1e-12 && Math.abs(phaseDelta!) <= region.phaseHalfWidth + 1e-12 : null;
  return { delta: { ...delta, amp: Math.abs(delta.amp) < 1e-18 ? 0 : delta.amp }, deltaAmplitude, relativeAmplitude, phaseDelta, inside };
}

/** 허용 영역은 기준 진폭의 ±비율과 기준 지연각의 ±각도로 만든 부채꼴 띠. */
export function acceptanceOutline(reference: AmpLag, region: Acceptance): AmpLag[] {
  acceptance(reference, reference, region); // 입력 검증
  const low = reference.amp * (1 - region.amplitudeFraction), high = reference.amp * (1 + region.amplitudeFraction);
  const angles = Array.from({ length: 61 }, (_, i) => reference.lag - region.phaseHalfWidth + 2 * region.phaseHalfWidth * i / 60);
  const points = [...angles.map(lag => ({ amp: high, lag })), ...[...angles].reverse().map(lag => ({ amp: low, lag }))];
  return [...points, points[0]];
}

/** 접힌 위상은 원주 경계에서 선을 끊는다. 연속 위상은 이 모델의 알려진 경로를 표시한다. */
export function phaseTrace(samples: TrendSample[], continuous: boolean) {
  const time: number[] = [], lag: number[] = [];
  samples.forEach((s, i) => {
    if (!continuous && i > 0 && Math.abs(s.oneX.lag - samples[i - 1].oneX.lag) > Math.PI) { time.push(s.time); lag.push(NaN); }
    time.push(s.time); lag.push(continuous ? s.continuousLag : s.oneX.lag);
  });
  return { time, lag };
}

/** 직교하는 1X/2X 한 바퀴. 해석 RMS·추출 벡터 대조용(필터 모사 아님). */
export function snapshot(sample: TrendSample): number[] {
  validateVector(sample.oneX);
  return Array.from({ length: 256 }, (_, i) => {
    const theta = 2 * Math.PI * i / 256;
    const p = phasor(sample.oneX);
    return p.re * Math.cos(theta) - p.im * Math.sin(theta) + sample.twoX * Math.cos(2 * theta);
  });
}
