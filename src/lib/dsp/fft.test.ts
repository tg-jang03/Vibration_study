import { describe, expect, it } from 'vitest';
import { fft, zeroPad } from './fft';
import { acquire } from './sampling';

/** 검증용 직접 DFT (O(N²)). FFT와 별도로 정의식의 각 항을 합산한다. */
function directDft(real: readonly number[], imag: readonly number[]) {
  return real.map((_, k) => {
    let re = 0;
    let im = 0;
    for (let i = 0; i < real.length; i++) {
      const angle = -2 * Math.PI * k * i / real.length;
      re += real[i] * Math.cos(angle) - imag[i] * Math.sin(angle);
      im += real[i] * Math.sin(angle) + imag[i] * Math.cos(angle);
    }
    return { re, im };
  });
}

describe('fft', () => {
  it.each([1, 2, 4, 8, 16, 32])('N=%i의 복소 출력은 직접 DFT와 일치하며 입력을 보존한다', (n) => {
    const real = Array.from({ length: n }, (_, i) => Math.sin(i * 0.7) + i / 10);
    const imag = Array.from({ length: n }, (_, i) => Math.cos(i * 0.3) - i / 20);
    const originalReal = [...real];
    const originalImag = [...imag];
    const expected = directDft(real, imag);
    const actual = fft(real, imag);
    for (let k = 0; k < n; k++) {
      expect(actual.real[k]).toBeCloseTo(expected[k].re, 10);
      expect(actual.imag[k]).toBeCloseTo(expected[k].im, 10);
    }
    expect(real).toEqual(originalReal);
    expect(imag).toEqual(originalImag);
  });

  it('이동된 단위 임펄스의 DFT는 exp(−j2πk·3/N)', () => {
    const n = 16;
    const x = new Float64Array(n);
    x[3] = 1;
    const { real, imag } = fft(x);
    for (let k = 0; k < n; k++) {
      expect(real[k]).toBeCloseTo(Math.cos(-2 * Math.PI * k * 3 / n), 12);
      expect(imag[k]).toBeCloseTo(Math.sin(-2 * Math.PI * k * 3 / n), 12);
    }
    expect(x[3]).toBe(1);
  });

  it('음의 주파수 복소 지수는 N−k bin에 비정규화 크기 N으로 나타난다', () => {
    const n = 64;
    const real = Array.from({ length: n }, (_, i) => Math.cos(-2 * Math.PI * 7 * i / n));
    const imag = Array.from({ length: n }, (_, i) => Math.sin(-2 * Math.PI * 7 * i / n));
    const spectrum = fft(real, imag);
    for (let k = 0; k < n; k++) {
      expect(spectrum.real[k]).toBeCloseTo(k === n - 7 ? n : 0, 10);
      expect(spectrum.imag[k]).toBeCloseTo(0, 10);
    }
  });

  it('실신호는 켤레 대칭이며 DC·나이퀴스트의 허수부가 0이다', () => {
    const { x } = acquire({ components: [{ type: 'noise', rms: 1, seed: 37 }] }, { fs: 1024, n: 1024 });
    const { real, imag } = fft(x);
    expect(imag[0]).toBe(0);
    expect(imag[x.length / 2]).toBe(0);
    for (let k = 1; k < x.length / 2; k++) {
      expect(real[k]).toBeCloseTo(real[x.length - k], 10);
      expect(imag[k]).toBeCloseTo(-imag[x.length - k], 10);
    }
  });

  it('실수·복소 신호와 패딩 후에도 Parseval 에너지가 보존된다 (Contents §6)', () => {
    const real = acquire({ components: [
      { type: 'sine', freq: 37, amp: 1.7, phase: 0.4 },
      { type: 'noise', rms: 0.3, seed: 42 },
    ] }, { fs: 1024, n: 1024 }).x;
    const noise = acquire({ components: [{ type: 'noise', rms: 0.8, seed: 17 }] }, { fs: 1024, n: 1024 }).x;
    for (const imag of [new Float64Array(real.length), noise]) {
      const timeEnergy = real.reduce((sum, re, i) => sum + re ** 2 + imag[i] ** 2, 0);
      for (const fftSize of [1024, 4096]) {
        const result = fft(zeroPad(real, fftSize), zeroPad(imag, fftSize));
        const spectralEnergy = result.real.reduce((sum, re, k) => sum + re ** 2 + result.imag[k] ** 2, 0) / fftSize;
        expect(spectralEnergy).toBeCloseTo(timeEnergy, 9);
      }
    }
  });

  it('길이·허수부 불일치·비유한 입력은 오류', () => {
    for (const values of [[], [1, 2, 3], [NaN, 0], [1, Infinity]]) {
      expect(() => fft(values)).toThrow(RangeError);
    }
    expect(() => fft([1, 2], [1])).toThrow(RangeError);
    expect(() => fft([1, 2], [0, -Infinity])).toThrow(RangeError);
  });
});

describe('zeroPad', () => {
  it('비거듭제곱 길이의 프레임 뒤에 0을 붙이며 입력과 독립적인 복사본을 만든다', () => {
    const x = new Float64Array([1, -2, 3]);
    const padded = zeroPad(x, 8);
    expect(Array.from(padded)).toEqual([1, -2, 3, 0, 0, 0, 0, 0]);
    padded[0] = 99;
    expect(x[0]).toBe(1);
    const copy = zeroPad(x.subarray(0, 2), 2);
    copy[0] = 88;
    expect(x[0]).toBe(1);
  });

  it('원래 bin k의 복소값 = P배 패딩 후 bin P·k (Contents §6)', () => {
    const x = acquire({ components: [
      { type: 'sine', freq: 7.3, amp: 2, phase: -0.7 },
      { type: 'noise', rms: 0.2, seed: 31 },
    ] }, { fs: 64, n: 64 }).x;
    const original = fft(x);
    for (const p of [2, 4, 8]) {
      const padded = fft(zeroPad(x, p * x.length));
      for (let k = 0; k < x.length; k++) {
        expect(padded.real[p * k]).toBeCloseTo(original.real[k], 11);
        expect(padded.imag[p * k]).toBeCloseTo(original.imag[k], 11);
      }
    }
  });

  it('축소·빈 입력·잘못된 목표 크기·비유한 입력은 오류', () => {
    for (const size of [0, 1, 3, 2.5, Infinity, NaN]) {
      expect(() => zeroPad([1, 2], size)).toThrow(RangeError);
    }
    expect(() => zeroPad([], 4)).toThrow(RangeError);
    expect(() => zeroPad([NaN], 4)).toThrow(RangeError);
  });
});
