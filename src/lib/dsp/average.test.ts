import { describe, expect, it } from 'vitest';
import { averagePower, frameLayout, overlapPowerCv, splitOverlappingFrames, vectorAverage } from './average';
import { fft } from './fft';
import { createRng } from './random';
import { createWindow } from './window';

function statistics(values: readonly number[]) {
  const mean = values.reduce((sum, x) => sum + x, 0) / values.length;
  const variance = values.reduce((sum, x) => sum + (x - mean) ** 2, 0) / values.length;
  return { mean, cv: Math.sqrt(variance) / mean };
}

describe('averagePower', () => {
  it('RMS 평균은 진폭이 아닌 파워를 평균한다', () => {
    const result = averagePower([new Float64Array([1, 4]), new Float64Array([9, 16])]);
    expect(Array.from(result)).toEqual([5, 10]);
    expect(Math.sqrt(result[0])).toBeCloseTo(Math.sqrt(5), 12);
    expect(Math.sqrt(result[0])).not.toBe(2);
  });

  it('지수 평균의 첫 프레임 초기화·가중치를 해석식으로 확인한다', () => {
    expect(averagePower([[1], [5], [9]], 'exponential', 0.25)[0]).toBe(3.75);
    expect(averagePower([[0], [0], [4], [4]], 'exponential', 0.5)[0]).toBe(3);
    expect(averagePower([[2], [10]], 'exponential', 1)[0]).toBe(10);
    expect(averagePower([[4], [4], [4]], 'exponential', 0.1)[0]).toBe(4);
  });

  it('피크홀드는 프레임 순서와 관계없이 bin별 최대 파워를 보존한다', () => {
    const frames = [[1, 9], [4, 3], [2, 16]];
    expect(Array.from(averagePower(frames, 'peakHold'))).toEqual([4, 16]);
    expect(Array.from(averagePower([...frames].reverse(), 'peakHold'))).toEqual([4, 16]);
  });

  it('모든 평균은 M=1에서 동일하며 입력을 변경하지 않는다', () => {
    const input = new Float64Array([0, 2, 5]);
    for (const mode of ['linear', 'exponential', 'peakHold'] as const) {
      const result = averagePower([input], mode);
      expect(result).toEqual(input);
      result[1] = 99;
      expect(input[1]).toBe(2);
    }
  });

  it('빈 입력·길이 불일치·음의 파워·비유한값·잘못된 alpha는 오류', () => {
    for (const frames of [[], [[]], [[1], [1, 2]], [[-1]], [[NaN]], [[Infinity]]]) {
      expect(() => averagePower(frames)).toThrow(RangeError);
    }
    for (const alpha of [0, -0.1, 1.1, NaN, Infinity]) {
      expect(() => averagePower([[1]], 'exponential', alpha)).toThrow(RangeError);
    }
  });
});

describe('vectorAverage', () => {
  it('위상이 같은 동기 성분은 보존한다', () => {
    const frame = { real: new Float64Array([3, 0]), imag: new Float64Array([4, -2]) };
    const result = vectorAverage(Array(16).fill(frame));
    expect(Array.from(result.real)).toEqual([3, 0]);
    expect(Array.from(result.imag)).toEqual([4, -2]);
    result.real[0] = 99;
    expect(frame.real[0]).toBe(3);
  });

  it('네 위상(0·90·180·270°)은 상쇄되지만 RMS 파워 평균은 보존된다', () => {
    const frames = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2].map((phase) => ({
      real: new Float64Array([Math.cos(phase)]), imag: new Float64Array([Math.sin(phase)]),
    }));
    const result = vectorAverage(frames);
    expect(Math.hypot(result.real[0], result.imag[0])).toBeLessThan(1e-15);
    expect(averagePower(frames.map((x) => [x.real[0] ** 2 + x.imag[0] ** 2]))[0]).toBeCloseTo(1, 12);
  });

  it('빈 입력·실수부/허수부 길이 불일치·비유한 복소 성분은 오류', () => {
    expect(() => vectorAverage([])).toThrow(RangeError);
    expect(() => vectorAverage([{ real: new Float64Array([1]), imag: new Float64Array(2) }])).toThrow(RangeError);
    expect(() => vectorAverage([{ real: new Float64Array([1]), imag: new Float64Array([NaN]) }])).toThrow(RangeError);
  });
});

describe('오버랩 프레임', () => {
  it('Hann, M=16, 75% 오버랩의 총 측정 시간은 4.75T이다', () => {
    expect(frameLayout(512, 16, 0.75)).toEqual({ hop: 128, totalSamples: 2432 });
    expect(frameLayout(512, 1, 0.75).totalSamples).toBe(512);
    expect(frameLayout(512, 16, 0).totalSamples).toBe(512 * 16);
  });

  it('동일한 연속 수집을 분할하고 불완전 꼬리를 버린다', () => {
    const x = Float64Array.from({ length: 11 }, (_, i) => i);
    const result = splitOverlappingFrames(x, 4, 0.5);
    expect(result.starts).toEqual([0, 2, 4, 6]);
    expect(result.hop).toBe(2);
    expect(result.usedSamples).toBe(10);
    expect(Array.from(result.frames[0])).toEqual([0, 1, 2, 3]);
    expect(result.frames[0][2]).toBe(result.frames[1][0]);
    result.frames[0][2] = 99;
    expect(result.frames[1][0]).toBe(2);
    expect(x[2]).toBe(2);
    expect(splitOverlappingFrames(new Float64Array(3), 4, 0).frames).toEqual([]);
  });

  it('불가능한 프레임 길이·개수·오버랩·소수 hop은 오류', () => {
    for (const args of [[0, 2, 0], [4, 0, 0], [4, 2, 1], [4, 2, -0.5], [3, 2, 0.5], [4, 2, NaN]]) {
      expect(() => frameLayout(...args as [number, number, number])).toThrow(RangeError);
    }
    expect(() => splitOverlappingFrames(new Float64Array([Infinity]), 1, 0)).toThrow(RangeError);
  });

  it('독립 프레임 CV=1/√M, Uniform 50%·M=4는 √(0.34375)', () => {
    const uniform = new Float64Array(8).fill(1);
    expect(overlapPowerCv(uniform, 16, 8)).toBe(0.25);
    expect(overlapPowerCv(uniform, 4, 4)).toBeCloseTo(Math.sqrt(0.34375), 12);
    expect(overlapPowerCv(createWindow('hann', 512), 16, 128)).toBeGreaterThan(0.25);
    expect(() => overlapPowerCv(new Float64Array(8), 4, 4)).toThrow(RangeError);
    expect(() => overlapPowerCv(uniform, 4, 0)).toThrow(RangeError);
  });
});

describe('백색 잡음 FFT 통계 (시드 고정, DC·나이퀴스트 제외)', () => {
  it.each([1, 4, 16, 64])('M=%i: RMS 평균은 평균 파워를 유지, CV≈1/√M·벡터 잡음 파워≈1/M', (m) => {
    const n = 64;
    const trials = 768;
    const rng = createRng(2048 + m);
    const linear: number[] = [];
    const coherent: number[] = [];
    for (let trial = 0; trial < trials; trial++) {
      const frames = Array.from({ length: m }, () => {
        const result = fft(Float64Array.from({ length: n }, () => rng.normal()));
        return { real: new Float64Array([result.real[11]]), imag: new Float64Array([result.imag[11]]) };
      });
      const powers = frames.map((frame) => [2 * (frame.real[0] ** 2 + frame.imag[0] ** 2) / n ** 2]);
      linear.push(averagePower(powers)[0]);
      const vector = vectorAverage(frames);
      coherent.push(2 * (vector.real[0] ** 2 + vector.imag[0] ** 2) / n ** 2);
    }
    const stats = statistics(linear);
    const vectorStats = statistics(coherent);
    expect(Math.abs(stats.mean / (2 / n) - 1)).toBeLessThan(0.1);
    expect(Math.abs(stats.cv * Math.sqrt(m) - 1)).toBeLessThan(0.12);
    expect(Math.abs(vectorStats.mean / (2 / (n * m)) - 1)).toBeLessThan(0.12);
  });

  it('Hann 75%의 상관을 반영한 CV는 연속 잡음 프레임 통계와 일치한다', () => {
    const n = 64;
    const m = 16;
    const w = createWindow('hann', n);
    const { hop, totalSamples } = frameLayout(n, m, 0.75);
    const rng = createRng(7591);
    const averaged: number[] = [];
    for (let trial = 0; trial < 768; trial++) {
      const record = Float64Array.from({ length: totalSamples }, () => rng.normal());
      const frames = splitOverlappingFrames(record, n, 0.75).frames;
      const powers = frames.map((frame) => {
        const transform = fft(frame.map((value, i) => value * w[i]));
        return [transform.real[11] ** 2 + transform.imag[11] ** 2];
      });
      averaged.push(averagePower(powers)[0]);
    }
    const cv = statistics(averaged).cv;
    const expected = overlapPowerCv(w, m, hop);
    expect(Math.abs(cv / expected - 1)).toBeLessThan(0.12);
    expect(cv).toBeGreaterThan(1.2 / Math.sqrt(m));
  });
});