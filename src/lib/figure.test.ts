import { describe, expect, it } from 'vitest';
import { grid, linearScale, niceTicks } from './figure';

describe('niceTicks', () => {
  it('0~1 → 0, 0.2, …, 1', () => {
    expect(niceTicks(0, 1)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  it('대칭 범위와 큰 수', () => {
    // 간격 = (max − min)/target을 1·2·2.5·5·10 × 10^k로 올림
    expect(niceTicks(-1.5, 1.5)).toEqual([-1, 0, 1]);
    expect(niceTicks(-1.5, 1.5, 8)).toEqual([-1.5, -1, -0.5, 0, 0.5, 1, 1.5]);
    expect(niceTicks(0, 3000)).toEqual([0, 1000, 2000, 3000]);
  });

  it('부동소수점 찌꺼기가 없다', () => {
    for (const v of niceTicks(0, 0.3)) expect(String(v).length).toBeLessThan(6);
  });
});

describe('linearScale · grid', () => {
  it('끝점이 정확히 대응한다', () => {
    const s = linearScale(0, 10, 50, 650);
    expect(s(0)).toBe(50);
    expect(s(10)).toBe(650);
    expect(s(5)).toBe(350);
  });

  it('y축처럼 뒤집힌 범위', () => {
    const s = linearScale(-1, 1, 200, 0);
    expect(s(1)).toBe(0);
    expect(s(0)).toBe(100);
  });

  it('grid는 끝점 포함 n개', () => {
    expect(grid(0, 1, 5)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });
});
