import { describe, expect, it } from 'vitest';
import { demoAccel, demoFilter, demoIntegrate, demoResponse, demoSamples, FLT_DEMO, INT_DEMO, squareWave, trueVelocity } from './filterDemo';

const { fs } = FLT_DEMO;
const square = () => {
  const t0 = -0.5;
  const n = Math.round((0.03 - t0) * fs);
  return Float64Array.from({ length: n }, (_, i) => squareWave(10, t0 + i / fs));
};
const overshoot = (y: ArrayLike<number>) => ((Math.max(...Array.from(y).slice(Math.round(0.45 * fs))) - 1) / 2) * 100;

describe('LAB-FLT-01 과제의 숫자', () => {
  it('1X 위상 늦음: Bessel 20.2°, Butterworth 25.0°, Chebyshev 26.8° (4차, f_c 150 Hz)', () => {
    const ph = (type: 'bessel' | 'butterworth' | 'chebyshev1') => (-demoResponse({ type, order: 4, fc: 150, fs }, [25]).phase[0] * 180) / Math.PI;
    expect(ph('bessel')).toBeCloseTo(20.2, 1);
    expect(ph('butterworth')).toBeCloseTo(25.0, 1);
    expect(ph('chebyshev1')).toBeCloseTo(26.8, 1);
  });

  it('Butterworth 사각파 넘침은 차수와 함께 커진다: 2차 약 4 %, 8차 약 16 %', () => {
    const x = square();
    expect(overshoot(demoFilter({ type: 'butterworth', order: 2, fc: 150, fs }, x))).toBeCloseTo(4.3, 0);
    expect(overshoot(demoFilter({ type: 'butterworth', order: 8, fc: 150, fs }, x))).toBeCloseTo(16.3, 0);
  });

  it('두 번 거르기: 목표 파형과 겹친다 (1X ~ 3X를 거의 그대로, 늦음 없음)', () => {
    const s = demoSamples(0.6);
    const y = demoFilter({ type: 'butterworth', order: 4, fc: 150, fs }, s.x, true);
    let err = 0;
    for (let i = Math.round(0.1 * fs); i < Math.round(0.5 * fs); i++) err = Math.max(err, Math.abs(y[i] - s.target[i]));
    expect(err).toBeLessThan(0.05e-3); // 0.05 mm/s 안
  });

  it('FIR을 두 번 거르면 늦음이 없다', () => {
    const s = demoSamples(0.6);
    const y = demoFilter({ type: 'fir', order: 4, fc: 150, fs }, s.x, true);
    let err = 0;
    for (let i = Math.round(0.1 * fs); i < Math.round(0.5 * fs); i++) err = Math.max(err, Math.abs(y[i] - s.target[i]));
    expect(err).toBeLessThan(0.1e-3);
  });
});

describe('LAB-INT-01 신호', () => {
  it('오프셋·흔들림이 없으면 주파수 영역 적분이 실제 속도와 같다', () => {
    const a = demoAccel({ lfNoiseG: 0, offsetG: 0 });
    const v = demoIntegrate(a, 'spectral', 1, 0);
    for (const i of [100, 5000, 12000]) expect(v[i]).toBeCloseTo(trueVelocity(i / INT_DEMO.fs), 9);
  });

  it('주파수 영역 적분은 직류 오프셋에 끌려가지 않는다 (DC bin = 0)', () => {
    const v = demoIntegrate(demoAccel({ lfNoiseG: 0, offsetG: INT_DEMO.offsetG }), 'spectral', 1, 0);
    for (const i of [100, 5000, 12000]) expect(v[i]).toBeCloseTo(trueVelocity(i / INT_DEMO.fs), 9);
  });
});
