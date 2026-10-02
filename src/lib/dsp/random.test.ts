import { describe, expect, it } from 'vitest';
import { createRng } from './random';

const N = 100_000;

describe('createRng', () => {
  it('같은 시드는 같은 수열을 만든다', () => {
    const a = createRng(42);
    const b = createRng(42);
    for (let i = 0; i < 10; i++) {
      expect(a.uniform()).toBe(b.uniform());
      expect(a.normal()).toBe(b.normal());
    }
  });

  it('다른 시드는 다른 수열을 만든다', () => {
    expect(createRng(1).uniform()).not.toBe(createRng(2).uniform());
  });

  it('uniform: [0, 1) 범위, 평균 0.5, 분산 1/12', () => {
    const rng = createRng(7);
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < N; i++) {
      const u = rng.uniform();
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
      sum += u;
      sumSq += u * u;
    }
    const mean = sum / N;
    expect(mean).toBeCloseTo(0.5, 2);
    expect(sumSq / N - mean * mean).toBeCloseTo(1 / 12, 2);
  });

  it('normal: 평균 0, 표준편차 1', () => {
    const rng = createRng(123);
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < N; i++) {
      const z = rng.normal();
      sum += z;
      sumSq += z * z;
    }
    const mean = sum / N;
    const std = Math.sqrt(sumSq / N - mean * mean);
    expect(Math.abs(mean)).toBeLessThan(0.02);
    expect(Math.abs(std - 1)).toBeLessThan(0.02);
  });
});
