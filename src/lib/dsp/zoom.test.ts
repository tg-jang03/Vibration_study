import { describe, expect, it } from 'vitest';
import { calculateZoomMetrics, computeZoomSpectrum } from './zoom';
import type { SignalSpec } from './signal';

describe('calculateZoomMetrics (Contents §6)', () => {
  it('F_max 2000 Hz, LOR 400, Z = 8, fc = 1200 Hz -> Δf 0.625 Hz, T 1.6 s, B 250 Hz', () => {
    const res = calculateZoomMetrics({
      fmax: 2000,
      lor: 400,
      zoomFactor: 8,
      centerFreq: 1200,
    });

    expect(res.deltaFBase).toBeCloseTo(5.0, 6);
    expect(res.durationBase).toBeCloseTo(0.2, 6);
    expect(res.bandwidth).toBeCloseTo(250, 6);
    expect(res.deltaFZoom).toBeCloseTo(0.625, 6);
    expect(res.durationZoom).toBeCloseTo(1.6, 6);
    expect(res.fMin).toBeCloseTo(1075, 6);
    expect(res.fMax).toBeCloseTo(1325, 6);
    // T_zoom = Z * T_base
    expect(res.durationZoom).toBeCloseTo(8 * res.durationBase, 6);
  });

  it('잘못된 파라미터는 RangeError', () => {
    expect(() =>
      calculateZoomMetrics({ fmax: 0, lor: 400, zoomFactor: 2, centerFreq: 100 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateZoomMetrics({ fmax: 1000, lor: 0, zoomFactor: 2, centerFreq: 100 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateZoomMetrics({ fmax: 1000, lor: 400, zoomFactor: 0.5, centerFreq: 100 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateZoomMetrics({ fmax: 1000, lor: 400, zoomFactor: 2, centerFreq: 1000 }),
    ).toThrow(RangeError);
  });
});

describe('computeZoomSpectrum', () => {
  it('기어 GMF 1200 Hz(A=1.0) ± 5 Hz 측대역(A=0.4): Z=16에서 톤 진폭 보존', () => {
    const spec: SignalSpec = {
      components: [
        { type: 'sine', freq: 1200, amp: 1.0 },
        { type: 'sine', freq: 1195, amp: 0.4 },
        { type: 'sine', freq: 1205, amp: 0.4 },
      ],
    };

    const result = computeZoomSpectrum(
      spec,
      {
        fmax: 2000,
        lor: 400,
        zoomFactor: 16,
        centerFreq: 1200,
      },
      'hann',
    );

    // Zoom 분해능 = 2000 / (400 * 16) = 0.3125 Hz
    expect(result.metrics.deltaFZoom).toBeCloseTo(0.3125, 6);
    // 5 Hz 측대역 간격은 5 / 0.3125 = 16 bin에 해당하여 완벽히 분리됨

    // 캐리어 1200 Hz 근처 피크 진폭 확인 (ACF 보정된 Hann 윈도우)
    let maxCarrier = 0;
    let maxSideLeft = 0;
    let maxSideRight = 0;

    for (let i = 0; i < result.frequency.length; i++) {
      const f = result.frequency[i];
      const a = result.amplitude[i];
      if (Math.abs(f - 1200) < 1.0 && a > maxCarrier) maxCarrier = a;
      if (Math.abs(f - 1195) < 1.0 && a > maxSideLeft) maxSideLeft = a;
      if (Math.abs(f - 1205) < 1.0 && a > maxSideRight) maxSideRight = a;
    }

    // 진폭 보존 (허용 오차 ± 0.05 Pk)
    expect(maxCarrier).toBeGreaterThan(0.95);
    expect(maxSideLeft).toBeGreaterThan(0.35);
    expect(maxSideRight).toBeGreaterThan(0.35);
  });
});
