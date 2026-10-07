import { it, expect } from 'vitest';
import { waveform, waveValue, harmonicValue, waveFeatures, WAVE_PATTERNS } from './waveform';

it('정현파 해석해: RMS·Pk-Pk·CF·대칭', () => {
  const f = waveform({ pattern: 'sine' }).features;
  expect(f.peakToPeak).toBeCloseTo(40e-6, 12);
  expect(f.rms).toBeCloseTo(20e-6 / Math.sqrt(2), 12);
  expect(f.crestFactor).toBeCloseTo(Math.sqrt(2), 12);
  expect(f.asymmetry).toBe(0); expect(f.mean).toBe(0); expect(f.skewness).toBe(0);
});
it('AM 한 변조 주기의 해석해 RMS·CF', () => {
  const f = waveform({ pattern: 'am' }).features;
  expect(f.rms).toBeCloseTo(0.75 * 20e-6, 12); expect(f.crestFactor).toBeCloseTo(2, 12);
});
it('맥놀이 직교한 두 성분 RMS, 짧은 화면은 다른 값', () => {
  expect(waveform({ pattern: 'beat' }).features.rms).toBeCloseTo(10e-6, 12);
  expect(waveform({ pattern: 'beat', revolutions: 2 }).features.rms).not.toBeCloseTo(10e-6, 8);
});
it('한 회전 세 사건의 시각·키페이저·회전수 비례 간격', () => {
  for (const rpm of [1000, 3000, 6000]) {
    const r = waveform({ pattern: 'impacts', rpm });
    expect(r.events).toHaveLength(30); expect(r.keyphasor).toHaveLength(10);
    expect(r.eventInterval).toBeCloseTo(60 / (3 * rpm), 12);
    for (let i = 1; i < r.events.length; i++) expect(r.events[i] - r.events[i - 1]).toBeCloseTo(r.eventInterval!, 12);
    expect(r.keyphasor[1]).toBeCloseTo(60 / rpm, 12);
    expect(r.events.filter(t => t < r.keyphasor[1])).toHaveLength(3);
  }
});
it('절단·클리핑 한계와 비대칭', () => {
  const a = waveform({ pattern: 'truncated' }).features, b = waveform({ pattern: 'clipped' }).features;
  expect(a.min).toBe(-5e-6); expect(a.peakToPeak).toBeCloseTo(25e-6, 12); expect(a.asymmetry).toBeCloseTo(0.6, 12);
  expect(a.mean).toBeGreaterThan(0); expect(a.rms).toBeGreaterThan(a.acRms);
  expect(b.peakToPeak).toBeCloseTo(26e-6, 12); expect(b.asymmetry).toBe(0); expect(b.skewness).toBe(0);
});
it('2X 합성의 비대칭·RMS: 비선형 모델 없이 생긴다', () => {
  const f = waveform({ pattern: 'asymmetric' }).features;
  expect(f.max).toBeCloseTo(27e-6, 12);
  // cosθ=u이면 u+0.35(2u²−1), 최솟값은 u=−1/1.4에서 −0.707142857 A.
  expect(f.min).toBeCloseTo(-20e-6 * (0.35 + 1 / 2.8), 8);
  expect(f.rms).toBeCloseTo(20e-6 * Math.sqrt((1 + 0.35 ** 2) / 2), 12); expect(f.mean).toBe(0);
});
it('위상만 바꾼 같은 진폭 성분: RMS는 같고 파형은 다르다', () => {
  const a = waveform({ pattern: 'asymmetric' }).x;
  const b = a.map((_, i) => harmonicValue(2 * Math.PI * i / 256, 20e-6, Math.PI / 2));
  expect(waveFeatures(a).rms).toBeCloseTo(waveFeatures(b).rms, 12); expect(a).not.toEqual(b);
});
it('DC 이동은 상하 Peak 지표에 영향을 주지만 왜도는 유지', () => {
  const x = waveform({ pattern: 'sine' }).x;
  const f = waveFeatures(x.map(v => v + 5e-6));
  expect(f.mean).toBeCloseTo(5e-6, 12); expect(f.asymmetry).toBeCloseTo(0.25, 12);
  expect(f.skewness).toBe(0); expect(f.acRms).toBeCloseTo(20e-6 / Math.sqrt(2), 12);
});
it('잡음 시드 재현성', () => {
  const a = { pattern: 'sine' as const, noise: 1e-6 };
  expect(waveform(a).x).toEqual(waveform(a).x); expect(waveform({ ...a, seed: 2 }).x).not.toEqual(waveform(a).x);
});
it.each(WAVE_PATTERNS)('%s 유한 신호 및 0 진폭', pattern => {
  const r = waveform({ pattern }); expect(r.time).toHaveLength(2560); expect(r.x.every(Number.isFinite)).toBe(true);
  const zero = waveform({ pattern, amplitude: 0 }); expect(zero.features.rms).toBe(0); expect(zero.features.asymmetry).toBe(0);
});
it('유효하지 않은 입력 거절 및 DC 신호', () => {
  expect(waveFeatures([3, 3]).acRms).toBe(0);
  for (const o of [{ rpm: 0 }, { rpm: NaN }, { amplitude: -1 }, { revolutions: 0 }, { revolutions: 1.5 }, { revolutions: 41 }, { noise: -1 }, { seed: NaN }]) expect(() => waveform({ pattern: 'sine', ...o })).toThrow();
  expect(() => waveValue('bad' as never, 0, 1)).toThrow(); expect(() => waveFeatures([NaN])).toThrow();
  expect(() => waveFeatures([])).toThrow(); expect(() => harmonicValue(0, 1, NaN)).toThrow();
});