import { describe, expect, it } from 'vitest';
import {
  compensateSlowRoll,
  halfPowerAF,
  P41_EXAMPLE,
  phaseShiftRpm,
  rpmGrid,
  separationMargin,
  simulateRunUp,
  theoreticalPeakRpm,
  unbalanceVector,
  wrapLag,
  type UnbalanceRotor,
} from './runup';

const R = P41_EXAMPLE.rotor;
const deg = (rad: number) => (rad * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

describe('unbalanceVector — 1자유도 불평형 해석해', () => {
  it('r = 1 → 진폭 = e_cg/(2ζ), 지연 90°', () => {
    const v = unbalanceVector(R, 3000);
    expect(v.amp).toBeCloseTo(5e-6 / (2 * 0.05), 15);
    expect(deg(v.lag)).toBeCloseTo(90, 10);
  });
  it('r ≫ 1 → e_cg, 180°에 다가감 / rpm 0 → 0', () => {
    const v = unbalanceVector(R, 300000);
    expect(v.amp / 5e-6).toBeCloseTo(1, 3);
    expect(deg(v.lag)).toBeGreaterThan(179.9);
    expect(unbalanceVector(R, 0).amp).toBe(0);
  });
  it('무거운 점 각도만큼 지연각이 더해진다 (high spot = heavy spot + 기계적 지연)', () => {
    const v = unbalanceVector({ ...R, heavySpot: rad(30) }, 3000);
    expect(deg(v.lag)).toBeCloseTo(120, 10);
    const w = unbalanceVector({ ...R, heavySpot: rad(300) }, 300000);
    expect(deg(w.lag)).toBeCloseTo(120, 0);
  });
  it('예시 로터의 본문 숫자: 3600 rpm 31.57 µm pp ∠164.7°', () => {
    const v = unbalanceVector(R, 3600);
    expect(v.amp * 2e6).toBeCloseTo(31.574, 2);
    expect(deg(v.lag)).toBeCloseTo(164.74, 1);
  });
  it('잘못된 입력은 RangeError', () => {
    expect(() => unbalanceVector({ ...R, naturalRpm: 0 }, 100)).toThrow(RangeError);
    expect(() => unbalanceVector({ ...R, zeta: 0 }, 100)).toThrow(RangeError);
    expect(() => unbalanceVector(R, -1)).toThrow(RangeError);
  });
});

describe('피크 회전수 vs 위상 90° 회전수 (Roadmap M5.1 검증)', () => {
  it('ζ = 0.05: 진폭 피크 r = 1.0025, 위상 90°는 r = 1', () => {
    expect(theoreticalPeakRpm(R)! / 3000).toBeCloseTo(1 / Math.sqrt(1 - 2 * 0.05 ** 2), 12);
    expect(theoreticalPeakRpm(R)! / 3000).toBeCloseTo(1.0025, 4);
    const pts = simulateRunUp(R, { rpmEnd: 6000, rpmStep: 1 });
    expect(halfPowerAF(pts)!.peakRpm).toBe(3008);
    expect(phaseShiftRpm(pts)).toBeCloseTo(3000, 6);
  });
  it('ζ = 0.2: 피크는 3128 rpm으로 위상 90°(3000 rpm)보다 4 % 높다', () => {
    const rotor: UnbalanceRotor = { ...R, zeta: 0.2 };
    expect(theoreticalPeakRpm(rotor)).toBeCloseTo(3127.7, 1);
    const pts = simulateRunUp(rotor, { rpmEnd: 6000, rpmStep: 1 });
    expect(halfPowerAF(pts)!.peakRpm).toBe(3128);
    expect(phaseShiftRpm(pts)).toBeCloseTo(3000, 6);
  });
  it('ζ ≥ 1/√2 → 피크 없음', () => {
    expect(theoreticalPeakRpm({ ...R, zeta: 0.75 })).toBeNull();
  });
});

describe('halfPowerAF — AF = N_c/(N₂ − N₁) ≈ 1/(2ζ)', () => {
  it('ζ = 0.05, 1 rpm 간격: AF ≈ 10 (허용오차 ±2 %, 불평형의 r² 때문에 약 1 % 낮다)', () => {
    const hp = halfPowerAF(simulateRunUp(R, { rpmEnd: 6000, rpmStep: 1 }))!;
    expect(Math.abs(hp.af - 10) / 10).toBeLessThan(0.02);
    expect(hp.af).toBeCloseTo(9.90, 2);
  });
  it('ζ = 0.05, 예시 25 rpm 간격: AF 9.84, N₁ 2867 · N₂ 3172 rpm', () => {
    const hp = halfPowerAF(simulateRunUp(R, { rpmEnd: 6000, rpmStep: 25 }))!;
    expect(hp.peakRpm).toBe(3000);
    expect(hp.af).toBeCloseTo(9.839, 2);
    expect(hp.n1).toBeCloseTo(2866.5, 0);
    expect(hp.n2).toBeCloseTo(3171.5, 0);
  });
  it('작은 ζ일수록 1/(2ζ)에 가깝고, 큰 ζ에서는 낮게 나온다 (ζ = 0.2 → 2.07, 1/(2ζ) = 2.5)', () => {
    const af = (z: number) => halfPowerAF(simulateRunUp({ ...R, zeta: z }, { rpmEnd: 6000, rpmStep: 1 }))!.af;
    expect(af(0.02)).toBeCloseTo(24.96, 1);
    expect(af(0.2)).toBeCloseTo(2.073, 2);
  });
  it('rpm 간격이 Half-power 폭보다 넓으면 AF가 크게 틀린다 (ζ = 0.01: 25 → 48.3, 200 → 21.8)', () => {
    const af = (step: number) => halfPowerAF(simulateRunUp({ ...R, zeta: 0.01 }, { rpmEnd: 6000, rpmStep: step }))!.af;
    expect(af(25)).toBeCloseTo(48.33, 1);
    expect(af(200)).toBeCloseTo(21.80, 1);
  });
  it('위쪽 0.707 지점이 범위 밖이면 null', () => {
    expect(halfPowerAF(simulateRunUp({ ...R, zeta: 0.3 }, { rpmEnd: 6000, rpmStep: 25 }))).toBeNull();
    expect(halfPowerAF([])).toBeNull();
  });
});

describe('simulateRunUp — 잡음·런아웃·시드', () => {
  it('같은 시드 → 같은 데이터, 다른 시드 → 다른 데이터', () => {
    const a = simulateRunUp(R, { rpmEnd: 6000, rpmStep: 25, noise: 2e-6, seed: 7 });
    const b = simulateRunUp(R, { rpmEnd: 6000, rpmStep: 25, noise: 2e-6, seed: 7 });
    const c = simulateRunUp(R, { rpmEnd: 6000, rpmStep: 25, noise: 2e-6, seed: 8 });
    expect(a).toEqual(b);
    expect(a[100].amp).not.toBe(c[100].amp);
  });
  it('런아웃은 rpm 0에서 그대로 보이고, Slow roll 보상으로 빠진다', () => {
    const runout = { amp: 4e-6, lag: rad(60) };
    const pts = simulateRunUp(R, { rpmEnd: 6000, rpmStep: 25, runout });
    expect(pts[0].amp).toBeCloseTo(4e-6, 15);
    expect(deg(pts[0].lag)).toBeCloseTo(60, 8);
    const comp = compensateSlowRoll(pts, 300);
    expect(comp.reference.rpm).toBe(300);
    const truth = unbalanceVector(R, 3000);
    const at = comp.points.find((p) => p.rpm === 3000)!;
    // 300 rpm의 참 응답(0.1 µm pp)까지 함께 빠지므로 아주 작은 차이만 남는다
    expect(Math.abs(at.amp - truth.amp)).toBeLessThan(0.1e-6);
  });
  it('rpmGrid는 끝을 포함하고 누적 오차가 없다', () => {
    const g = rpmGrid(0, 6000, 25);
    expect(g.length).toBe(241);
    expect(g[g.length - 1]).toBe(6000);
    expect(g[120]).toBe(3000);
    expect(rpmGrid(0, 100, 30)).toEqual([0, 30, 60, 90, 100]);
    expect(() => rpmGrid(0, 100, 0)).toThrow(RangeError);
  });
});

describe('separationMargin · wrapLag', () => {
  it('SM = |N_op − N_c| / N_op × 100: 3600 vs 3000 → 16.67 %', () => {
    expect(separationMargin(3600, 3000)).toBeCloseTo(16.667, 3);
    expect(separationMargin(2400, 3000)).toBeCloseTo(25, 10);
    expect(() => separationMargin(0, 3000)).toThrow(RangeError);
  });
  it('wrapLag → [0, 2π)', () => {
    expect(wrapLag(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 12);
    expect(wrapLag(2 * Math.PI)).toBe(0);
    expect(wrapLag(5 * Math.PI)).toBeCloseTo(Math.PI, 12);
  });
});
