import { describe, expect, it } from 'vitest';
import {
  ALN_GEOM,
  coldTarget,
  footMoves,
  fromReverse,
  fromRimFace,
  heightAt,
  hotOffset,
  reverseReadings,
  rimFaceReadings,
  thermalGrowth,
} from './alignment';

const states = [
  { offset: 0.2, slope: 0 },
  { offset: 0, slope: 0.0005 },
  { offset: -0.13, slope: -0.0008 },
  { offset: 0.31, slope: 0.0012 },
];

describe('rim-face 읽음값 (12시 0 → 6시, + = 측정침 들어감)', () => {
  it('평행 어긋남만: rim = −2δ, face = 0. M이 0.2 mm 높으면 rim −0.40', () => {
    const r = rimFaceReadings({ offset: 0.2, slope: 0 });
    expect(r.rim).toBeCloseTo(-0.4, 12);
    expect(r.face).toBeCloseTo(0, 12);
  });

  it('기울기만: face = −α D (0.05 mm/100 mm → −0.05), rim은 그 자리의 높이 × (−2)', () => {
    const r = rimFaceReadings({ offset: 0, slope: 0.0005 });
    expect(r.face).toBeCloseTo(-0.05, 12);
    expect(r.rim).toBeCloseTo(-2 * 0.0005 * ALN_GEOM.zRim, 12);
  });

  it('읽음값 → 정렬 상태 역산이 일치한다 (처짐을 보정하면 처짐과 무관)', () => {
    for (const s of states) {
      const r = rimFaceReadings(s, -0.1);
      const back = fromRimFace(r.rim, r.face, -0.1);
      expect(back.offset).toBeCloseTo(s.offset, 12);
      expect(back.slope).toBeCloseTo(s.slope, 12);
    }
  });

  it('처짐(−0.10)을 보정하지 않으면 높이를 0.05 mm 높게 본다', () => {
    const s = { offset: 0.2, slope: 0 };
    const r = rimFaceReadings(s, -0.1);
    const back = fromRimFace(r.rim, r.face, 0);
    expect(back.offset - s.offset).toBeCloseTo(0.05, 12);
  });
});

describe('reverse 읽음값', () => {
  it('R₁ = −2 y(z₁), R₂ = +2 y(z₂), 역산 일치', () => {
    for (const s of states) {
      const r = reverseReadings(s, -0.08);
      expect(r.r1).toBeCloseTo(-2 * heightAt(s, ALN_GEOM.z1) - 0.08, 12);
      const back = fromReverse(r.r1, r.r2, -0.08);
      expect(back.offset).toBeCloseTo(s.offset, 12);
      expect(back.slope).toBeCloseTo(s.slope, 12);
    }
  });
});

describe('발 이동량과 열성장', () => {
  it('닮은 삼각형: move = 목표 − (δ + α z). 0.05 mm/100 mm 기울기 → 앞발 −0.15, 뒷발 −0.40', () => {
    const m = footMoves({ offset: 0, slope: 0.0005 });
    expect(m.front).toBeCloseTo(-0.15, 12);
    expect(m.rear).toBeCloseTo(-0.4, 12);
    const p = footMoves({ offset: 0.2, slope: 0 });
    expect(p.front).toBeCloseTo(-0.2, 12);
    expect(p.rear).toBeCloseTo(-0.2, 12);
  });

  it('옮긴 뒤에는 목표선 위에 있다', () => {
    for (const s of states) {
      const t = -0.2;
      const m = footMoves(s, t);
      // 두 발을 옮긴 새 직선이 두 발 자리에서 목표와 같다
      expect(heightAt(s, ALN_GEOM.footA) + m.front).toBeCloseTo(t, 12);
      expect(heightAt(s, ALN_GEOM.footB) + m.rear).toBeCloseTo(t, 12);
    }
  });

  it('열성장 11.5e-6 × 500 mm × 40 K = 0.23 mm, 냉간 목표 = ΔH_S − ΔH_M, 열간 어긋남 = 0', () => {
    expect(thermalGrowth(500, 40)).toBeCloseTo(0.23, 12);
    const gS = 0.05;
    const gM = 0.23;
    const t = coldTarget(gS, gM);
    expect(t).toBeCloseTo(-0.18, 12);
    expect(hotOffset(t, gS, gM)).toBeCloseTo(0, 12);
  });
});
