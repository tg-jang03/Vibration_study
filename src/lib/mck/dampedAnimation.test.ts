import { expect, it } from 'vitest';
import { dampedMotionAt, nextDampedPeak } from './dampedAnimation';
import { freeResponseAt } from './sdof';

const w = 10 * Math.PI;
const system = (zeta: number) => ({ mass: 1, stiffness: w * w, damping: 2 * zeta * w });
const initial = { x0: .01 };

it('장치·현재 점은 네 감쇠 구간의 기존 해와 동일', () => {
  for (const z of [0, .05, .2, .99, 1, 1.5]) for (const t of [0, .037, .2, 1, 2]) {
    const sys = system(z), s = freeResponseAt(sys, initial, t), p = dampedMotionAt(sys, initial, t);
    expect(p.x).toBeCloseTo(s.x, 12); expect(p.v).toBeCloseTo(s.v, 12);
    expect(p.dampingForce).toBeCloseTo(-sys.damping * s.v, 12);
  }
});
it('무감쇠 T/4 영점·양의 피크와 감쇠력 0', () => {
  const sys = system(0);
  expect(dampedMotionAt(sys, initial, .05).x).toBe(0);
  expect(dampedMotionAt(sys, initial, .1).v).toBe(0);
  expect(dampedMotionAt(sys, initial, .2).x).toBeCloseTo(.01, 12);
  expect(dampedMotionAt(sys, initial, .05).dampingForce).toBe(0);
});
it('해석적 양의 피크 비·속도 영점·감쇠에 따른 감소', () => {
  for (const [z, td, mm] of [[.05, .20025046972870356, 7.301153801794058], [.2, .20412414523193154, 2.7732925563900745]]) {
    const sys = system(z), t = nextDampedPeak(sys, 0, 2)!;
    expect(t).toBeCloseTo(td, 12);
    const p = dampedMotionAt(sys, initial, t);
    expect(p.x * 1000).toBeCloseTo(mm, 10); expect(p.v).toBe(0); expect(p.dampingForce).toBe(0);
    expect(nextDampedPeak(sys, t, 2)).toBeCloseTo(2 * td, 12);
  }
});
it('감쇠력은 속도와 반대, 초기 속도는 0', () => {
  const sys = system(.05);
  expect(dampedMotionAt(sys, initial, 0).v).toBe(0);
  expect(dampedMotionAt(sys, initial, 0).dampingForce).toBe(0);
  for (const t of [.05, .15, .25]) { const p = dampedMotionAt(sys, initial, t); expect(p.v * p.dampingForce).toBeLessThan(0); }
});
it('임계·과감쇠는 양의 쪽에서 단조 복귀, 다음 피크 없음', () => {
  for (const z of [1, 1.5]) {
    let previous = initial.x0;
    for (const t of [.01, .05, .1, .2, .5]) {
      const p = dampedMotionAt(system(z), initial, t);
      expect(p.x).toBeGreaterThan(0); expect(p.x).toBeLessThan(previous); expect(p.v).toBeLessThan(0); previous = p.x;
    }
    expect(nextDampedPeak(system(z), 0, 2)).toBeNull();
  }
  expect(dampedMotionAt(system(1.5), initial, .1).x).toBeGreaterThan(dampedMotionAt(system(1), initial, .1).x);
});
it('피크 이동은 탐색 시각·구간 끝·큰 감쇠·잘못된 입력 처리', () => {
  expect(nextDampedPeak(system(0), .15, 2)).toBeCloseTo(.2, 12);
  expect(nextDampedPeak(system(0), 1.8, 2)).toBe(2);
  expect(nextDampedPeak(system(0), 2, 2)).toBeNull();
  expect(nextDampedPeak(system(.99), 0, .5)).toBeNull();
  expect(() => nextDampedPeak(system(0), -1, 2)).toThrow();
  expect(() => nextDampedPeak(system(0), 0, NaN)).toThrow();
  expect(() => dampedMotionAt(system(.05), initial, -1)).toThrow();
});
