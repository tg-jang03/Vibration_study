import { describe, expect, it } from 'vitest';
import { correlationTerms, dftAt, harmonicPreset } from './fourier';
import { fft } from './fft';
import { acquire } from './sampling';
import { evaluate } from './signal';
import { singleSidedSpectrum } from './spectrum';
import { crestFactor, rms } from './stats';

describe('harmonicPreset', () => {
  it('사각파(진폭 1): 홀수 차 진폭 4/(nπ), 짝수 차 0 (Contents §6)', () => {
    const { amps } = harmonicPreset('square', 7);
    for (let n = 1; n <= 7; n++) {
      expect(amps[n - 1]).toBeCloseTo(n % 2 === 1 ? 4 / (n * Math.PI) : 0, 12);
    }
  });

  it('사각파 급수를 많이 더하면 평평한 구간에서 +1, −1에 가까워진다', () => {
    const { amps, phases } = harmonicPreset('square', 199);
    const spec = { components: [{ type: 'harmonics' as const, f0: 1, amps, phases }] };
    expect(evaluate(spec, 0.1)).toBeCloseTo(1, 1); // +1 구간 (|t| < 1/4)
    expect(evaluate(spec, 0.4)).toBeCloseTo(-1, 1); // −1 구간
  });

  it('톱니파: 진폭 2/(nπ), 한 주기의 3/8 지점에서 0.75에 가까워진다', () => {
    const { amps, phases } = harmonicPreset('sawtooth', 199);
    for (let n = 1; n <= 5; n++) expect(amps[n - 1]).toBeCloseTo(2 / (n * Math.PI), 12);
    const spec = { components: [{ type: 'harmonics' as const, f0: 1, amps, phases }] };
    expect(evaluate(spec, 0.375)).toBeCloseTo(0.75, 1);
  });

  it('펄스열: 진폭 |2 sin(nπd)/(nπ)|, 듀티 0.5이면 사각파의 절반', () => {
    const pulse = harmonicPreset('pulse', 5, 0.5).amps;
    const square = harmonicPreset('square', 5).amps;
    for (let i = 0; i < 5; i++) expect(pulse[i]).toBeCloseTo(square[i] / 2, 12);
  });

  it('위상만 바꾸면 진폭 스펙트럼은 같지만 Crest factor는 달라진다 (P1-1 과제 1)', () => {
    const { amps, phases } = harmonicPreset('square', 9);
    const shuffled = phases.map((p, i) => p + i * 1.3);
    const make = (ph: number[]) =>
      acquire({ components: [{ type: 'harmonics', f0: 10, amps, phases: ph }] }, { fs: 1000, n: 1000 }).x;
    const a = make(phases);
    const b = make(shuffled);
    expect(rms(a)).toBeCloseTo(rms(b), 10); // Parseval: RMS는 진폭만으로 정해진다
    expect(Math.abs(crestFactor(a) - crestFactor(b))).toBeGreaterThan(0.05);
  });
});

describe('dftAt', () => {
  const n = 64;
  const tone = acquire({ components: [{ type: 'sine', freq: 5, amp: 1.5, phase: 0.4 }] }, { fs: n, n }).x;

  it('정수 k에서 FFT의 k번째 bin과 같다', () => {
    const X = fft(tone);
    for (const k of [0, 3, 5, 17]) {
      const v = dftAt(tone, k);
      expect(v.re).toBeCloseTo(X.real[k], 9);
      expect(v.im).toBeCloseTo(X.imag[k], 9);
    }
  });

  it('bin 중심 톤: 2|X(k₀)|/N = A, 위상 = φ / 다른 정수 bin은 0 (직교성)', () => {
    const v = dftAt(tone, 5);
    expect((2 * Math.hypot(v.re, v.im)) / n).toBeCloseTo(1.5, 12);
    expect(Math.atan2(v.im, v.re)).toBeCloseTo(0.4, 12);
    const other = dftAt(tone, 7);
    expect(Math.hypot(other.re, other.im)).toBeCloseTo(0, 9);
  });

  it('비정수 k에서는 0이 아니다 (누설의 예고)', () => {
    const v = dftAt(tone, 6.5);
    expect(Math.hypot(v.re, v.im)).toBeGreaterThan(0.1);
  });

  it('상관 곱의 합 = Re X(k), sin 곱의 합 = −Im X(k)', () => {
    const k = 5.3;
    const v = dftAt(tone, k);
    const t = correlationTerms(tone, k);
    expect(t.cosCumulative[n - 1]).toBeCloseTo(v.re, 9);
    expect(t.sinCumulative[n - 1]).toBeCloseTo(-v.im, 9);
  });
});

describe('제로패딩 (P1-1 과제 3)', () => {
  it('정수배 P로 패딩하면 원래 bin k의 값 = 패딩 후 bin P·k의 값 (Contents §6)', () => {
    const s = acquire(
      { components: [{ type: 'sine', freq: 10.3, amp: 1 }, { type: 'sine', freq: 11.3, amp: 1 }] },
      { fs: 64, n: 64 },
    );
    const base = singleSidedSpectrum(s);
    const padded = singleSidedSpectrum(s, { fftSize: 512 });
    for (const k of [5, 10, 11, 20]) expect(padded.amplitude[8 * k]).toBeCloseTo(base.amplitude[k], 9);
  });
});
