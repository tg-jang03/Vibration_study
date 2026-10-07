import { describe, expect, it } from 'vitest';
import { createRng } from './random';
import { notchOrder, reconstructOrder, trackingDelay, trackingNoise, trackOrder } from './tracking';

const fs = 512;
const TWO_PI = 2 * Math.PI;
/** 일정 회전 f_r [Hz]의 각도 */
const thetaConst = (fr: number, n: number) => Float64Array.from({ length: n }, (_, i) => TWO_PI * fr * (i / fs));
const amp = (re: number, im: number) => Math.hypot(re, im);
const lag = (re: number, im: number) => {
  const a = -Math.atan2(im, re);
  return a < 0 ? a + TWO_PI : a;
};

describe('트래킹 필터: 복소 복조 + 저역 통과', () => {
  it('x = A cos(θ − φ) + 2X + 0.45X → 1X 벡터 A e^{−jφ} (오차 < 0.1 %)', () => {
    const n = 20 * fs;
    const th = thetaConst(50, n);
    const x = th.map((t) => 20 * Math.cos(t - 1.2) + 5 * Math.cos(2 * t - 0.3) + 4 * Math.cos(0.45 * t + 0.7));
    const v = trackOrder(x, th, { fs, bandwidth: 1 });
    const k = n - 1;
    expect(amp(v.re[k], v.im[k])).toBeCloseTo(20, 1);
    expect(Math.abs(amp(v.re[k], v.im[k]) - 20) / 20).toBeLessThan(1e-3);
    expect(lag(v.re[k], v.im[k])).toBeCloseTo(1.2, 3);
  });

  it('order 2 → 2X 벡터', () => {
    const n = 20 * fs;
    const th = thetaConst(40, n);
    const x = th.map((t) => 20 * Math.cos(t - 1.2) + 5 * Math.cos(2 * t - 0.3));
    const v = trackOrder(x, th, { fs, bandwidth: 1, order: 2 });
    expect(amp(v.re[n - 1], v.im[n - 1])).toBeCloseTo(5, 2);
    expect(lag(v.re[n - 1], v.im[n - 1])).toBeCloseTo(0.3, 3);
  });

  it('initial을 주면 첫 표본부터 그 벡터에 있다 (0에서 시작하면 B가 좁을수록 늦게 닿는다)', () => {
    const n = 4 * fs;
    const th = thetaConst(60, n);
    const x = th.map((t) => 10 * Math.cos(t - 2));
    const init = { re: 10 * Math.cos(2), im: -10 * Math.sin(2) };
    const v = trackOrder(x, th, { fs, bandwidth: 0.5, initial: init });
    for (const k of [0, fs, n - 1]) expect(amp(v.re[k], v.im[k])).toBeCloseTo(10, 1);
    const cold = trackOrder(x, th, { fs, bandwidth: 0.5 });
    expect(amp(cold.re[fs / 2], cold.im[fs / 2])).toBeLessThan(5);
  });

  it('지연 = 0 Hz 군지연 √2/(πB) (2차 Butterworth), 크기가 일정하게 오르면 그만큼 늦게 읽는다', () => {
    for (const B of [0.2, 1, 5]) expect(trackingDelay(B, fs) / (Math.SQRT2 / (Math.PI * B))).toBeCloseTo(1, 3);
    const n = 30 * fs;
    const th = thetaConst(50, n);
    const slope = 2; // 진폭이 1초에 2씩
    const x = th.map((t, i) => (5 + slope * (i / fs)) * Math.cos(t - 0.5));
    const B = 0.5;
    const v = trackOrder(x, th, { fs, bandwidth: B });
    const k = 25 * fs;
    const lagSeconds = (5 + slope * (k / fs) - amp(v.re[k], v.im[k])) / slope;
    expect(lagSeconds / trackingDelay(B, fs)).toBeCloseTo(1, 2);
    // 두 번 거르기는 지연이 없다
    const z = trackOrder(x, th, { fs, bandwidth: B, zeroPhase: true });
    expect(Math.abs(5 + slope * (k / fs) - amp(z.re[k], z.im[k]))).toBeLessThan(0.01);
  });

  it('잡음 흔들림 ≈ σ√(4·ENBW/f_s): B를 1/4로 줄이면 절반', () => {
    const n = 200 * fs;
    const th = thetaConst(60, n);
    const rng = createRng(3);
    const sigma = 5;
    const x = th.map((t) => 30 * Math.cos(t - 1) + sigma * rng.normal());
    for (const B of [0.5, 2]) {
      const v = trackOrder(x, th, { fs, bandwidth: B, initial: { re: 30 * Math.cos(1), im: -30 * Math.sin(1) } });
      let s = 0;
      let m = 0;
      for (let i = 0; i < n; i += 8) {
        s += (amp(v.re[i], v.im[i]) - 30) ** 2;
        m++;
      }
      const std = Math.sqrt(s / m);
      expect(std / trackingNoise(sigma, B, fs)).toBeGreaterThan(0.85);
      expect(std / trackingNoise(sigma, B, fs)).toBeLessThan(1.15);
    }
    expect(trackingNoise(1, 0.5, fs) / trackingNoise(1, 2, fs)).toBeCloseTo(0.5, 10);
  });
});

describe('노치 (Not-1X)', () => {
  it('1X를 빼면 0.45X와 2X가 남는다 (남은 1X < 0.1 %)', () => {
    const n = 20 * fs;
    const th = thetaConst(60, n);
    const sub = th.map((t) => 3 * Math.cos(0.45 * t + 0.2) + 2 * Math.cos(2 * t));
    const x = th.map((t, i) => 40 * Math.cos(t - 2.5) + sub[i]);
    const y = notchOrder(x, th, { fs, bandwidth: 1, initial: { re: 40 * Math.cos(2.5), im: -40 * Math.sin(2.5) } });
    let err = 0;
    for (let i = 2 * fs; i < n; i++) err = Math.max(err, Math.abs(y[i] - sub[i]));
    expect(err).toBeLessThan(0.04);
  });

  it('reconstructOrder: 벡터 A e^{−jφ} → A cos(θ − φ)', () => {
    const th = Float64Array.from([0, 1, 2.5]);
    const v = { re: Float64Array.from([3, 3, 3].map((a) => a * Math.cos(0.7))), im: Float64Array.from([3, 3, 3].map((a) => -a * Math.sin(0.7))) };
    const r = reconstructOrder(v, th);
    th.forEach((t, i) => expect(r[i]).toBeCloseTo(3 * Math.cos(t - 0.7), 12));
  });
});
