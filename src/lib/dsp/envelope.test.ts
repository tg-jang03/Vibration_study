import { describe, expect, it } from 'vitest';
import { analyticSignal, bandAnalytic, complexKurtosis, envelopeSpectrum, ifft, kurtogram, magnitude, peakNear, spectralKurtosis, spectrumOf } from './envelope';
import { createRng } from './random';
import { kurtosis, skewness } from './stats';

const fs = 8192;
const n = 8192;
const t = Float64Array.from({ length: n }, (_, i) => i / fs);

describe('첨도 · 왜도 (기준값 Contents §6)', () => {
  it('정규 잡음 K ≈ 3, 정현파 K = 1.5, 드문 충격은 K ≫ 3', () => {
    const rng = createRng(1);
    const g = Float64Array.from({ length: 200000 }, () => rng.normal());
    expect(kurtosis(g)).toBeCloseTo(3, 1);
    expect(kurtosis(t.map((v) => Math.sin(2 * Math.PI * 50 * v)))).toBeCloseTo(1.5, 6);
    const spikes = new Float64Array(n);
    for (let i = 0; i < n; i += 512) spikes[i] = 1;
    expect(kurtosis(spikes)).toBeGreaterThan(100);
  });

  it('왜도: 대칭 0, 위로만 튀면 양수', () => {
    expect(skewness(t.map((v) => Math.sin(2 * Math.PI * 50 * v)))).toBeCloseTo(0, 6);
    expect(skewness(t.map((v) => Math.max(0, Math.sin(2 * Math.PI * 50 * v))))).toBeGreaterThan(0.5);
  });
});

describe('해석 신호 · 포락선', () => {
  it('ifft(fft(x)) = x', () => {
    const x = t.map((v) => Math.cos(2 * Math.PI * 37 * v) + 0.3 * Math.sin(2 * Math.PI * 900 * v));
    const X = spectrumOf(x);
    const back = ifft(X.re, X.im);
    for (let i = 0; i < n; i += 97) expect(back.re[i]).toBeCloseTo(x[i], 10);
  });

  it('AM 신호 (1 + m cos 2πf_m t) cos 2πf_c t의 포락선 = 1 + m cos 2πf_m t, 허수부 = sin', () => {
    const m = 0.5;
    const x = t.map((v) => (1 + m * Math.cos(2 * Math.PI * 20 * v)) * Math.cos(2 * Math.PI * 1000 * v));
    const env = magnitude(analyticSignal(x, fs));
    for (let i = 0; i < n; i += 61) expect(env[i]).toBeCloseTo(1 + m * Math.cos(2 * Math.PI * 20 * t[i]), 8);
    const c = analyticSignal(t.map((v) => Math.cos(2 * Math.PI * 300 * v)), fs);
    expect(c.im[100]).toBeCloseTo(Math.sin(2 * Math.PI * 300 * t[100]), 10);
  });

  it('대역 통과: 대역 밖 성분은 사라지고 안의 성분은 그대로', () => {
    const x = t.map((v) => Math.cos(2 * Math.PI * 100 * v) + 0.5 * Math.cos(2 * Math.PI * 2000 * v));
    const b = bandAnalytic(spectrumOf(x), fs, 1500, 2500);
    for (let i = 0; i < n; i += 53) expect(b.re[i]).toBeCloseTo(0.5 * Math.cos(2 * Math.PI * 2000 * t[i]), 10);
  });

  it('엔벨로프 스펙트럼: AM 변조 주파수에 m·A 높이의 줄, 반송파 자리에는 없다', () => {
    const x = t.map((v) => 2 * (1 + 0.4 * Math.cos(2 * Math.PI * 64 * v)) * Math.cos(2 * Math.PI * 1500 * v));
    const e = envelopeSpectrum(spectrumOf(x), fs, 1200, 1800, 500);
    expect(peakNear(e.freq, e.amp, 64, 1)).toBeCloseTo(0.8, 3);
    expect(e.freq[e.freq.length - 1]).toBe(500);
  });
});

describe('Spectral Kurtosis · Kurtogram', () => {
  // 1280 Hz 공진을 평균 100 Hz마다(박자 흔들림 1 %) 치는 충격 + 3 kHz 큰 정현파 + 넓은 대역 잡음
  const rng = createRng(5);
  const x = new Float64Array(n);
  for (let k = 0; k * 0.01 < 1; k++) {
    const i0 = Math.round((k + 0.01 * rng.normal()) * 0.01 * fs);
    for (let i = Math.max(0, i0); i < Math.min(n, i0 + 400); i++) {
      const tt = (i - i0) / fs;
      x[i] += Math.exp(-2 * Math.PI * 1280 * 0.05 * tt) * Math.sin(2 * Math.PI * 1280 * tt);
    }
  }
  for (let i = 0; i < n; i++) x[i] += 2 * Math.cos(2 * Math.PI * 3000 * t[i]) + 0.2 * rng.normal();

  it('복소 포락선 SK: 정규 잡음 ≈ 0, 크기 일정한 정현파 = −1', () => {
    const r2 = createRng(9);
    const re = Float64Array.from({ length: 100000 }, () => r2.normal());
    const im = Float64Array.from({ length: 100000 }, () => r2.normal());
    expect(Math.abs(complexKurtosis(re, im))).toBeLessThan(0.05);
    const ph = Float64Array.from({ length: 1000 }, (_, i) => i * 0.1);
    expect(complexKurtosis(ph.map(Math.cos), ph.map(Math.sin))).toBeCloseTo(-1, 10);
  });

  it('SK(f)는 크기가 큰 3 kHz가 아니라 충격이 울리는 1280 Hz 근처에서 크다 (프레임 < 충격 간격)', () => {
    const s = spectralKurtosis(x, fs, 32);
    let kBest = 1;
    for (let k = 1; k < s.sk.length - 1; k++) if (s.sk[k] > s.sk[kBest]) kBest = k;
    // 프레임이 짧아 주파수 눈금이 거칠다 (bin 256 Hz, Hann 주엽 ±512 Hz)
    expect(Math.abs(s.freq[kBest] - 1280)).toBeLessThanOrEqual(512);
    const k3 = Math.round(3000 / (fs / 32));
    expect(s.sk[k3]).toBeLessThan(0);
    let kPow = 1;
    for (let k = 1; k < s.power.length; k++) if (s.power[k] > s.power[kPow]) kPow = k;
    expect(Math.abs(s.freq[kPow] - 3000)).toBeLessThanOrEqual(256);
  });

  it('Kurtogram 최댓값 칸은 1280 Hz를 담고, 그 대역의 엔벨로프 스펙트럼에 100 Hz 줄이 선다', () => {
    const X = spectrumOf(x);
    const kg = kurtogram(X, fs, 6);
    expect(kg.best.f1).toBeLessThanOrEqual(1280);
    expect(kg.best.f2).toBeGreaterThanOrEqual(1280);
    expect(kg.best.sk).toBeGreaterThan(0.5);
    expect(kg.rows[0]).toHaveLength(3);
    expect(kg.rows[5]).toHaveLength(127);
    expect(kg.rows[1][1]).toMatchObject({ f1: 512, f2: 1536, bw: 1024 });
    const e = envelopeSpectrum(X, fs, kg.best.f1, kg.best.f2, 500);
    let kMax = 1;
    for (let k = 2; k < e.amp.length; k++) if (e.amp[k] > e.amp[kMax]) kMax = k;
    expect(e.freq[kMax]).toBeCloseTo(100, 0);
  });
});
