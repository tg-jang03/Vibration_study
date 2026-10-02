import { describe, expect, it } from 'vitest';
import {
  applyWindow,
  besselI0,
  blackmanHarrisWindow,
  createWindow,
  exponentialWindow,
  flatTopWindow,
  forceWindow,
  hammingWindow,
  hannWindow,
  kaiserWindow,
  uniformWindow,
  windowProperties,
} from './window';

describe('window functions & properties', () => {
  describe('besselI0', () => {
    it('I₀(0) = 1이고 기지의 베셀 값과 일치한다', () => {
      expect(besselI0(0)).toBe(1);
      // I₀(1) ≈ 1.2660658777520084
      expect(besselI0(1)).toBeCloseTo(1.26606587775, 10);
      // I₀(2) ≈ 2.2795853023360673
      expect(besselI0(2)).toBeCloseTo(2.27958530234, 10);
      // I₀(6) ≈ 67.234406976478
      expect(besselI0(6)).toBeCloseTo(67.234406976, 8);
      expect(besselI0(-2)).toBe(besselI0(2));
    });

    it('비유한값 입력 시 RangeError 발생', () => {
      expect(() => besselI0(NaN)).toThrow(RangeError);
      expect(() => besselI0(Infinity)).toThrow(RangeError);
    });
  });

  describe('주기형(DFT-even) 윈도우 생성 및 대칭성', () => {
    const N = 1024;

    it('Uniform 윈도우는 모든 샘플이 1.0이다', () => {
      const w = uniformWindow(N);
      expect(w.length).toBe(N);
      for (let i = 0; i < N; i++) expect(w[i]).toBe(1.0);
    });

    it('Hann 윈도우는 w[0] = 0, w[N/2] = 1이며 DFT-even 대칭 w[N-n] = w[n]을 만족한다', () => {
      const w = hannWindow(N);
      expect(w[0]).toBe(0);
      expect(w[N / 2]).toBeCloseTo(1.0, 12);
      for (let n = 1; n < N; n++) {
        expect(w[N - n]).toBeCloseTo(w[n], 12);
      }
    });

    it('Hamming 윈도우는 w[0] = 0.08, w[N/2] = 1이며 DFT-even 대칭을 만족한다', () => {
      const w = hammingWindow(N);
      expect(w[0]).toBeCloseTo(0.08, 12);
      expect(w[N / 2]).toBeCloseTo(1.0, 12);
      for (let n = 1; n < N; n++) {
        expect(w[N - n]).toBeCloseTo(w[n], 12);
      }
    });

    it('Blackman-Harris (4항) 윈도우는 DFT-even 대칭을 만족한다', () => {
      const w = blackmanHarrisWindow(N);
      for (let n = 1; n < N; n++) {
        expect(w[N - n]).toBeCloseTo(w[n], 12);
      }
    });

    it('Flat top 윈도우는 DFT-even 대칭을 만족하고 중심 피크 부근이 1에 가깝다', () => {
      const w = flatTopWindow(N);
      for (let n = 1; n < N; n++) {
        expect(w[N - n]).toBeCloseTo(w[n], 12);
      }
      expect(w[N / 2]).toBeCloseTo(1.0, 3);
    });

    it('Kaiser 윈도우는 β=0일 때 Uniform과 같고, DFT-even 대칭을 만족한다', () => {
      const w0 = kaiserWindow(N, 0);
      for (let i = 0; i < N; i++) expect(w0[i]).toBeCloseTo(1.0, 12);

      const w6 = kaiserWindow(N, 6);
      expect(w6[N / 2]).toBeCloseTo(1.0, 12);
      for (let n = 1; n < N; n++) {
        expect(w6[N - n]).toBeCloseTo(w6[n], 12);
      }
    });

    it('Exponential 윈도우는 w[0] = 1이고 끝에서 exp(-decay)에 도달한다', () => {
      const decay = 4.0;
      const w = exponentialWindow(N, { decay });
      expect(w[0]).toBe(1.0);
      expect(w[N - 1]).toBeCloseTo(Math.exp(-decay * (N - 1) / N), 10);
      for (let i = 1; i < N; i++) {
        expect(w[i]).toBeLessThan(w[i - 1]);
      }
    });

    it('Force 윈도우는 width 구간에서 1.0, taper 구간에서 코사인 하강, 이후 0.0이다', () => {
      const w = forceWindow(100, { width: 10, taper: 5 });
      for (let i = 0; i < 10; i++) expect(w[i]).toBe(1.0);
      expect(w[10]).toBeLessThan(1.0);
      expect(w[10]).toBeGreaterThan(0.0);
      expect(w[14]).toBeCloseTo(0.0, 3);
      for (let i = 15; i < 100; i++) expect(w[i]).toBe(0.0);
    });

    it('createWindow 팩토리로 모든 윈도우를 생성할 수 있다', () => {
      const types = [
        'uniform',
        'hann',
        'hamming',
        'blackmanHarris',
        'flatTop',
        'kaiser',
        'exponential',
        'force',
      ] as const;
      for (const type of types) {
        const w = createWindow(type, 128);
        expect(w.length).toBe(128);
      }
    });

    it('N=1일 때 모든 윈도우는 [1.0] 배열을 반환한다', () => {
      expect(uniformWindow(1)[0]).toBe(1.0);
      expect(hannWindow(1)[0]).toBe(1.0);
      expect(hammingWindow(1)[0]).toBe(1.0);
      expect(blackmanHarrisWindow(1)[0]).toBe(1.0);
      expect(flatTopWindow(1)[0]).toBe(1.0);
      expect(kaiserWindow(1)[0]).toBe(1.0);
      expect(exponentialWindow(1)[0]).toBe(1.0);
      expect(forceWindow(1)[0]).toBe(1.0);
    });

    it('부적절한 길이 N이나 파라미터는 예외를 던진다', () => {
      expect(() => uniformWindow(0)).toThrow(RangeError);
      expect(() => hannWindow(-1)).toThrow(RangeError);
      expect(() => hammingWindow(2.5)).toThrow(RangeError);
      expect(() => kaiserWindow(128, -1)).toThrow(RangeError);
      expect(() => exponentialWindow(128, { decay: -0.1 })).toThrow(RangeError);
      expect(() => forceWindow(128, { width: -5 })).toThrow(RangeError);
    });
  });

  describe('윈도우 계수 검증 (Contents §6 문헌값과 일치)', () => {
    // 문헌값은 N이 충분히 클 때(N >= 4096) 점근적 값 기준
    const N = 8192;

    it('Uniform 윈도우 계수: CG=1, ACF=1, ECF=1, ENBW=1 bin, Scallop=3.92 dB (-36.3 %)', () => {
      const props = windowProperties(uniformWindow(N));
      expect(props.cg).toBeCloseTo(1.0, 4);
      expect(props.acf).toBeCloseTo(1.0, 4);
      expect(props.ecf).toBeCloseTo(1.0, 4);
      expect(props.enbw).toBeCloseTo(1.0, 4);
      expect(props.scallopLossDb).toBeCloseTo(3.92, 1);
      const scallopPercent = (props.scallopLossRatio - 1) * 100;
      expect(scallopPercent).toBeCloseTo(-36.3, 0);
    });

    it('Hann 윈도우 계수: CG=0.500, ACF=2.000, ECF=1.633, ENBW=1.500 bin, Scallop=1.42 dB (-15.1 %)', () => {
      const props = windowProperties(hannWindow(N));
      expect(props.cg).toBeCloseTo(0.5, 3);
      expect(props.acf).toBeCloseTo(2.0, 3);
      expect(props.ecf).toBeCloseTo(Math.sqrt(8 / 3), 3); // 1.633
      expect(props.enbw).toBeCloseTo(1.5, 3);
      expect(props.scallopLossDb).toBeCloseTo(1.42, 1);
      const scallopPercent = (props.scallopLossRatio - 1) * 100;
      expect(scallopPercent).toBeCloseTo(-15.1, 0);
    });

    it('Hamming 윈도우 계수: CG=0.540, ACF=1.852, ECF=1.586, ENBW=1.363 bin, Scallop=1.78 dB', () => {
      const props = windowProperties(hammingWindow(N));
      expect(props.cg).toBeCloseTo(0.54, 3);
      expect(props.acf).toBeCloseTo(1 / 0.54, 3); // 1.852
      expect(props.ecf).toBeCloseTo(1.586, 2);
      expect(props.enbw).toBeCloseTo(1.363, 2);
      expect(props.scallopLossDb).toBeCloseTo(1.78, 1);
    });

    it('Blackman-Harris (4항) 윈도우 계수: CG=0.359, ACF=2.787, ECF=1.969, ENBW=2.004 bin, Scallop=0.83 dB', () => {
      const props = windowProperties(blackmanHarrisWindow(N));
      expect(props.cg).toBeCloseTo(0.35875, 3); // 0.359
      expect(props.acf).toBeCloseTo(1 / 0.35875, 3); // 2.787
      expect(props.ecf).toBeCloseTo(1.969, 2);
      expect(props.enbw).toBeCloseTo(2.004, 2);
      expect(props.scallopLossDb).toBeCloseTo(0.83, 1);
    });

    it('Flat top 윈도우 계수 (I-010 결정): CG≈0.216, ACF≈4.639, ECF≈2.389, ENBW≈3.770 bin (≈3.8), Scallop < 0.01 dB', () => {
      const props = windowProperties(flatTopWindow(N));
      expect(props.cg).toBeCloseTo(0.2156, 3);
      expect(props.acf).toBeCloseTo(4.639, 2);
      expect(props.ecf).toBeCloseTo(2.389, 2);
      expect(props.enbw).toBeCloseTo(3.77, 1); // Contents §6: ≈ 3.8
      expect(props.scallopLossDb).toBeLessThan(0.01);
      expect(props.scallopLossRatio).toBeGreaterThan(0.998); // 진폭 손실 0.12% 미만
      expect(props.scallopLossRatio).toBeCloseTo(1.0, 2);
    });
  });

  describe('applyWindow', () => {
    it('신호에 윈도우를 곱한 새 배열을 반환하며 원본은 보존한다', () => {
      const x = new Float64Array([1, 2, 3, 4]);
      const w = new Float64Array([0.5, 0.5, 0.5, 0.5]);
      const xw = applyWindow(x, w);
      expect(Array.from(xw)).toEqual([0.5, 1, 1.5, 2]);
      expect(Array.from(x)).toEqual([1, 2, 3, 4]);
    });

    it('길이가 다르면 RangeError를 던진다', () => {
      const x = new Float64Array([1, 2]);
      const w = new Float64Array([1, 2, 3]);
      expect(() => applyWindow(x, w)).toThrow(RangeError);
    });
  });
});
