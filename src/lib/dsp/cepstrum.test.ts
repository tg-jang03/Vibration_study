import { describe, expect, it } from 'vitest';
import { autocorrelation, cepstrumPeak, combLifter, lowLifter, realCepstrum, spectrumFromCepstrum } from './cepstrum';
import { createRng } from './random';

const fs = 4096;
const n = 8192;
const t = Float64Array.from({ length: n }, (_, i) => i / fs);
const near = (freq: ArrayLike<number>, a: ArrayLike<number>, f: number) => {
  let m = 0;
  for (let k = 0; k < freq.length; k++) if (Math.abs(freq[k] - f) <= 1) m = Math.max(m, a[k]);
  return m;
};
/** 반송파 fc를 펄스열(간격 1/f)로 변조: 측대역이 f 간격으로 여러 쌍 */
const pulse = (f: number, tt: number) => {
  let s = 0;
  for (let k = 1; k <= 20; k++) s += Math.exp(-((k / 6) ** 2)) * Math.cos(2 * Math.PI * k * f * tt);
  return s / 3;
};
const rng = createRng(3);
const x = t.map((tt) => (1 + 0.3 * pulse(25, tt) + 0.2 * pulse(16, tt + 0.01)) * Math.cos(2 * Math.PI * 600 * tt) + 0.01 * rng.normal());

describe('실 켑스트럼', () => {
  const cep = realCepstrum(x, fs);

  it('줄 무리 간격 25 Hz → 40 ms, 16 Hz → 62.5 ms에 봉우리 (20 ~ 200 ms 바닥 중앙값의 3배 이상)', () => {
    const p40 = cepstrumPeak(cep, 0.04, 0.0005);
    const p62 = cepstrumPeak(cep, 0.0625, 0.0005);
    const vals: number[] = [];
    cep.quefrency.forEach((q, i) => {
      if (q >= 0.02 && q <= 0.2) vals.push(Math.abs(cep.c[i]));
    });
    vals.sort((a, b) => a - b);
    const floor = vals[Math.floor(vals.length / 2)];
    expect(p40).toBeGreaterThan(5 * floor);
    expect(p62).toBeGreaterThan(3 * floor);
  });

  it('켑스트럼을 그대로 되돌리면 원래 진폭 스펙트럼', () => {
    const back = spectrumFromCepstrum(cep.c);
    for (const f of [575, 600, 625, 616]) {
      const k = Math.round((f * n) / fs);
      expect(back[k] / cep.amp[k]).toBeCloseTo(1, 4);
    }
  });

  it('빗 리프터 40 ms → 25 Hz 측대역만 10 dB 넘게 줄고, 16 Hz 측대역은 3 dB 안에서 남는다', () => {
    const ed = combLifter(cep, 0.04, 0.0005);
    expect(20 * Math.log10(near(cep.freq, ed, 625) / near(cep.freq, cep.amp, 625))).toBeLessThan(-10);
    expect(Math.abs(20 * Math.log10(near(cep.freq, ed, 616) / near(cep.freq, cep.amp, 616)))).toBeLessThan(3);
  });

  it('낮은 리프터 → 측대역이 사라진 매끈한 모양 (반송파 자리보다 측대역 자리가 크게 낮지 않다)', () => {
    const sm = lowLifter(cep, 0.005);
    const c = near(cep.freq, sm, 600);
    const s = near(cep.freq, sm, 625);
    expect(s / c).toBeGreaterThan(0.5);
    expect(near(cep.freq, cep.amp, 625) / near(cep.freq, cep.amp, 600)).toBeLessThan(0.2);
  });
});

describe('자기상관', () => {
  it('정현파: R(T) ≈ 1 − T/N·fs (편향 추정), R(T/2) ≈ −1', () => {
    const r = autocorrelation(t.map((tt) => Math.sin(2 * Math.PI * 64 * tt)));
    const T = fs / 64;
    expect(r[0]).toBe(1);
    expect(r[T]).toBeCloseTo(1 - T / n, 3);
    expect(r[T / 2]).toBeCloseTo(-(1 - T / 2 / n), 3);
  });

  it('잡음 속 충격열(간격 10 ms)의 자기상관은 10 ms에 봉우리', () => {
    const r2 = createRng(8);
    const y = new Float64Array(n);
    for (let i = 0; i < n; i += 41) y[i] += 5;
    for (let i = 0; i < n; i++) y[i] += r2.normal();
    const r = autocorrelation(y);
    let best = 5;
    for (let i = 5; i < 200; i++) if (r[i] > r[best]) best = i;
    expect(best).toBe(41);
  });
});
