import { describe, expect, it } from 'vitest';
import { FIG_LAYOUT, FIG_PLOT_WIDTH, damperSegments, grid, groundSegments, linearScale, niceTicks, springPoints, squareYRange } from './figure';

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

describe('도식 도우미 (Part 0 질량-스프링 그림)', () => {
  it('squareYRange: x와 같은 px/단위', () => {
    const [y0, y1] = squareYRange([0, 10], 200);
    expect(y0).toBe(0);
    expect(y1).toBeCloseTo((200 * FIG_LAYOUT.HSCALE * 10) / FIG_PLOT_WIDTH, 12);
  });

  it('springPoints: 양 끝이 정확하고 지그재그 폭이 width/2', () => {
    const pts = springPoints([100, 50], [300, 50], 5, 20);
    expect(pts).toHaveLength(2 * 5 + 4);
    expect(pts[0]).toEqual([100, 50]);
    expect(pts[pts.length - 1]).toEqual([300, 50]);
    const offsets = pts.map((p) => Math.abs(p[1] - 50));
    expect(Math.max(...offsets)).toBeCloseTo(10, 12);
    // 가로 위치는 왼쪽에서 오른쪽으로 단조 증가
    for (let i = 1; i < pts.length; i++) expect(pts[i][0]).toBeGreaterThan(pts[i - 1][0]);
  });

  it('damperSegments: 막대로 시작해 막대로 끝나는 선분 6개', () => {
    const segs = damperSegments([0, 0], [0, -100], 16);
    expect(segs).toHaveLength(6);
    expect(segs[0].slice(0, 2)).toEqual([0, 0]);
    expect(segs[5][2]).toBeCloseTo(0, 12);
    expect(segs[5][3]).toBeCloseTo(-100, 12);
  });

  it('groundSegments: 본선 + 간격마다 빗금, side 쪽으로', () => {
    const segs = groundSegments([0, 100], [90, 100], 'right', 9, 8);
    expect(segs[0]).toEqual([0, 100, 90, 100]);
    expect(segs).toHaveLength(1 + 11);
    // 오른쪽으로 진행하는 선의 'right'는 화면 아래(y 증가)
    for (const s of segs.slice(1)) expect(s[3]).toBeGreaterThan(s[1]);
    const left = groundSegments([0, 100], [90, 100], 'left', 9, 8);
    for (const s of left.slice(1)) expect(s[3]).toBeLessThan(s[1]);
  });
});
