import { it, expect } from 'vitest';
import { acceptance, acceptanceOutline, PHASE_FLOOR, phaseTrace, snapshot, trendSeries } from './trend';
import { orderVector, toAmpLag, toRad, wrapPi } from '../phase';
import { rms } from '../dsp/stats';
const region = { amplitudeFraction: 0.2, phaseHalfWidth: toRad(30) };
const v = (amp: number, deg: number) => ({ amp: amp * 1e-6, lag: toRad(deg) });
it('위상만 이동: 크기·overall 일정, 120°의 현 길이 ΔV', () => {
  const s = trendSeries(), a = s[0], b = s[60];
  expect(s).toHaveLength(61); expect(b.time).toBe(3600);
  expect(s.every(p => p.oneX.amp === a.oneX.amp && p.overall === a.overall)).toBe(true);
  const r = acceptance(b.oneX, a.oneX, region);
  expect(r.deltaAmplitude).toBe(0); expect(r.delta.amp).toBeCloseTo(2 * 20e-6 * Math.sin(Math.PI / 3), 12);
  expect(r.phaseDelta).toBeCloseTo(toRad(120), 12); expect(r.inside).toBe(false);
});
it('기준 시각 변경: 마지막 시각과 중간 기준의 위상차60°·벡터차20µm', () => {
  const s = trendSeries(); expect(acceptance(s[60].oneX, s[30].oneX, region).delta.amp).toBeCloseTo(20e-6, 12);
  expect(acceptance(s[30].oneX, s[30].oneX, region).delta.amp).toBe(0);
});
it('0°/360° 경계는 최단 위상차로 판정', () => {
  expect(acceptance(v(20, 10), v(20, 350), region).phaseDelta).toBeCloseTo(toRad(20), 12);
  expect(acceptance(v(20, 350), v(20, 10), region).phaseDelta).toBeCloseTo(toRad(-20), 12);
  expect(acceptance(v(20, 10), v(20, 350), region).inside).toBe(true);
});
it('진폭·각도 경계 포함 및 각각의 이탈', () => {
  expect(acceptance(v(24, 20), v(20, 350), region).inside).toBe(true);
  expect(acceptance(v(16, 320), v(20, 350), region).inside).toBe(true);
  expect(acceptance(v(24.01, 350), v(20, 350), region).inside).toBe(false);
  expect(acceptance(v(20, 20.01), v(20, 350), region).inside).toBe(false);
});
it('0폭은 같은 벡터만, 180°폭은 원 전체의 위상', () => {
  expect(acceptance(v(20, 710), v(20, 350), { amplitudeFraction: 0, phaseHalfWidth: 0 }).inside).toBe(true);
  expect(acceptance(v(20, 170), v(20, 350), { amplitudeFraction: 0, phaseHalfWidth: Math.PI }).inside).toBe(true);
});
it('작은 진폭 및 기준0은 위상·영역 판정 보류', () => {
  for (const amp of [0, PHASE_FLOOR]) {
    const r = acceptance({ amp, lag: 1 }, v(20, 350), region); expect(r.inside).toBeNull(); expect(r.phaseDelta).toBeNull();
  }
  expect(acceptance(v(20, 20), v(0, 0), region).relativeAmplitude).toBeNull();
});
it('진폭만 +50%: 위상0차·진폭차10µm', () => {
  const s = trendSeries({ scenario: 'grow' }), r = acceptance(s[60].oneX, s[0].oneX, region);
  expect(r.phaseDelta).toBe(0); expect(r.relativeAmplitude).toBeCloseTo(0.5, 12); expect(r.delta.amp).toBeCloseTo(10e-6, 12);
});
it('2X 증가: Not-1X 4배, overall 7.17% 증가, 1X벡터 그대로', () => {
  const s = trendSeries({ scenario: 'residual' });
  expect(s[60].notOneXRms / s[0].notOneXRms).toBe(4);
  expect(s[60].overall / s[0].overall - 1).toBeCloseTo(Math.sqrt(464 / 404) - 1, 12);
  expect(acceptance(s[60].oneX, s[0].oneX, region).delta.amp).toBe(0);
});
it.each(['rotate', 'grow', 'residual'] as const)('%s RMS 해석해와 동기 1X 추출 교차 검증', scenario => {
  for (const p of [trendSeries({ scenario })[0], trendSeries({ scenario })[30], trendSeries({ scenario })[60]]) {
    const x = snapshot(p), oneX = toAmpLag(orderVector(x, 256));
    expect(rms(x)).toBeCloseTo(p.overall, 12); expect(oneX.amp).toBeCloseTo(p.oneX.amp, 12); expect(wrapPi(oneX.lag - p.oneX.lag)).toBeCloseTo(0, 12);
    const residual = x.map((a, i) => a - p.oneX.amp * Math.cos(2 * Math.PI * i / 256 - p.oneX.lag));
    expect(rms(residual)).toBeCloseTo(p.notOneXRms, 12);
  }
});
it('접힌 위상 경계는 NaN으로 끊고 연속 경로는350→470°', () => {
  const s = trendSeries(), wrapped = phaseTrace(s, false), continuous = phaseTrace(s, true);
  expect(wrapped.lag.filter(Number.isNaN)).toHaveLength(1);
  expect(continuous.lag.every(Number.isFinite)).toBe(true); expect(continuous.lag[60]).toBeCloseTo(toRad(470), 12);
});
it('허용 영역 윤곽은 닫히고 경계점은 모두 포함', () => {
  const ref = v(20, 350), outline = acceptanceOutline(ref, region);
  expect(outline[0]).toEqual(outline.at(-1)); expect(outline.every(p => acceptance(p, ref, region).inside)).toBe(true);
});
it('유효하지 않은 입력 거절', () => {
  expect(() => trendSeries({ scenario: 'bad' as never })).toThrow(); expect(() => trendSeries({ amplitudeGrowth: -1 })).toThrow();
  expect(() => trendSeries({ phaseChange: NaN })).toThrow(); expect(() => acceptance(v(-1, 0), v(20, 0), region)).toThrow();
  expect(() => acceptance(v(20, 0), v(20, 0), { ...region, phaseHalfWidth: 4 })).toThrow();
  expect(() => acceptance(v(20, 0), v(20, 0), { ...region, amplitudeFraction: NaN })).toThrow();
});

it('360° 끝점이 같아도 중간 기록은 허용 영역을 벗어난다', () => {
  const s = trendSeries({ phaseChange: 2 * Math.PI });
  expect(acceptance(s[60].oneX, s[0].oneX, region).delta.amp).toBe(0);
  expect(acceptance(s[60].oneX, s[0].oneX, region).inside).toBe(true);
  expect(s.some(p => acceptance(p.oneX, s[0].oneX, region).inside === false)).toBe(true);
});