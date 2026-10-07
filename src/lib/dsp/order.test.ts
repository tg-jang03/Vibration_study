import { describe, expect, it } from 'vitest';
import { amplitudeAtOrder, interpolateAt, maxOrder, orderResolution, orderSpectrum, pulsesFromFrequency, resampleByAngle, timesAtRevs } from './order';

// 등가속 회전: 바퀴 수 R(t) = f0 t + a t²/2 → 키페이저 시각 = R이 정수가 되는 시각
const f0 = 25;
const a = 2.5;
const revAt = (t: number) => f0 * t + (a * t * t) / 2;
const timeAtRev = (r: number) => (-f0 + Math.sqrt(f0 * f0 + 2 * a * r)) / a;
const pulses = Float64Array.from({ length: 80 }, (_, k) => timeAtRev(k));

describe('각도-시간 보간', () => {
  it('2차 보간은 등가속에서 정확하다 (시각 오차 < 1 ns), 선형 보간은 조금 어긋난다', () => {
    const targets = Float64Array.from({ length: 200 }, (_, j) => 0.137 + j * 0.33);
    const q = timesAtRevs(pulses, targets, 'quadratic');
    const l = timesAtRevs(pulses, targets, 'linear');
    let errQ = 0;
    let errL = 0;
    targets.forEach((r, j) => {
      errQ = Math.max(errQ, Math.abs(q[j] - timeAtRev(r)));
      errL = Math.max(errL, Math.abs(l[j] - timeAtRev(r)));
    });
    expect(errQ).toBeLessThan(1e-9);
    expect(errL).toBeGreaterThan(1e-7);
  });

  it('일정 속도면 선형과 2차가 같다', () => {
    const p = Float64Array.from({ length: 10 }, (_, k) => k / 30);
    const r = [0.5, 3.25, 7.9];
    const q = timesAtRevs(p, r, 'quadratic');
    r.forEach((v, j) => expect(q[j]).toBeCloseTo(v / 30, 12));
  });
});

describe('신호 보간', () => {
  it('3차 보간은 선형보다 높은 주파수를 덜 깎는다', () => {
    const fs = 1000;
    const f = 200;
    const x = Float64Array.from({ length: 2000 }, (_, i) => Math.cos((2 * Math.PI * f * i) / fs));
    const times = Float64Array.from({ length: 997 }, (_, j) => 0.1 + j * 0.0013 + 0.00037);
    const err = (m: 'linear' | 'cubic') => {
      const y = interpolateAt(x, fs, times, m);
      return Math.max(...Array.from(y, (v, j) => Math.abs(v - Math.cos(2 * Math.PI * f * times[j]))));
    };
    expect(err('cubic')).toBeLessThan(err('linear'));
    expect(err('cubic')).toBeLessThan(0.06);
  });
});

describe('차수 스펙트럼', () => {
  const fs = 4096;
  const sig = (t: number) => 25e-6 * Math.cos(2 * Math.PI * revAt(t)) + 8e-6 * Math.cos(4 * Math.PI * revAt(t) + 0.8);
  const x = Float64Array.from({ length: Math.ceil(pulses[pulses.length - 1] * fs) + 10 }, (_, i) => sig(i / fs));

  it('Δo = 1/N_rev, 최대 차수 = N_spr/2.56', () => {
    expect(orderResolution(64)).toBeCloseTo(0.015625, 12);
    expect(maxOrder(64)).toBeCloseTo(25, 12);
  });

  it('가속 중이어도 등각도 재샘플링 → 1X·2X 진폭이 참값 (오차 < 0.5 %)', () => {
    const r = resampleByAngle(x, fs, pulses, { samplesPerRev: 64, revs: 64, startRev: 2 });
    const sp = orderSpectrum(r.y, 64);
    expect(amplitudeAtOrder(sp, 1) / 25e-6).toBeCloseTo(1, 2);
    expect(Math.abs(amplitudeAtOrder(sp, 1) / 25e-6 - 1)).toBeLessThan(0.005);
    expect(Math.abs(amplitudeAtOrder(sp, 2) / 8e-6 - 1)).toBeLessThan(0.005);
    expect(amplitudeAtOrder(sp, 1.5)).toBeLessThan(1e-8);
  });

  it('재샘플링도 샘플링: N_spr 32에서 23X는 9X로 접히고, 넉넉히 찍어 거르면 사라진다', () => {
    const s23 = (t: number) => 3e-6 * Math.cos(23 * 2 * Math.PI * revAt(t));
    const x23 = Float64Array.from({ length: x.length }, (_, i) => s23(i / fs));
    const raw = orderSpectrum(resampleByAngle(x23, fs, pulses, { samplesPerRev: 32, revs: 64, startRev: 4 }).y, 32);
    expect(amplitudeAtOrder(raw, 9) / 3e-6).toBeGreaterThan(0.9);
    const aa = orderSpectrum(resampleByAngle(x23, fs, pulses, { samplesPerRev: 32, revs: 64, startRev: 4, oversample: 8 }).y, 32);
    expect(amplitudeAtOrder(aa, 9) / 3e-6).toBeLessThan(0.01);
    const ok = orderSpectrum(resampleByAngle(x23, fs, pulses, { samplesPerRev: 64, revs: 64, startRev: 4, oversample: 4 }).y, 64);
    expect(Math.abs(amplitudeAtOrder(ok, 23) / 3e-6 - 1)).toBeLessThan(0.03); // 3차 보간이 높은 차수를 조금 깎는다
  });
});

describe('tacholess: 순시 주파수 → 가상 키페이저', () => {
  it('정확한 f(t)를 적분하면 실제 키페이저 시각과 맞는다', () => {
    const ft = Float64Array.from({ length: 400 }, (_, i) => i * 0.01);
    const ff = ft.map((t) => f0 + a * t);
    const p = pulsesFromFrequency(ft, ff, 3.5, 1 / 8192);
    for (let k = 1; k < 60; k += 7) expect(Math.abs(p[k] - pulses[k])).toBeLessThan(2e-5);
  });
});
