import { describe, expect, it } from 'vitest';
import { P93_VALUES as V } from './p9-3';

/** 본문·캡션·랩 해석이 인용하는 P9-3 숫자 고정 (PageGuide §5-5) */
describe('P9-3 그림 숫자', () => {
  it('그림 2: rim 6시 −0.50(처짐 −0.10 포함) → −0.40 → 높이 0.20, face −0.04 → 0.04 mm/100 mm, 3시 −0.30 · 9시 −0.10', () => {
    expect(V.rf.rim).toBeCloseTo(-0.5, 12);
    expect(V.rfTrue.rim).toBeCloseTo(-0.4, 12);
    expect(V.rf.face).toBeCloseTo(-0.04, 12);
    expect(V.vRim).toBeCloseTo(0.2, 12);
    expect(V.r3).toBeCloseTo(-0.3, 12);
    expect(V.r9).toBeCloseTo(-0.1, 12);
    expect(V.r3 + V.r9).toBeCloseTo(V.rfTrue.rim, 12);
  });

  it('그림 3 · 4: 발 이동 −0.30 · −0.50, 처짐 보정 안 하면 −0.35 · −0.55 (δ 0.23)', () => {
    expect(V.fromRf.offset).toBeCloseTo(0.18, 12);
    expect(V.fromRf.slope * 100).toBeCloseTo(0.04, 12);
    expect(V.moves.front).toBeCloseTo(-0.3, 12);
    expect(V.moves.rear).toBeCloseTo(-0.5, 12);
    expect(V.fromRfNoSag.offset).toBeCloseTo(0.23, 12);
    expect(V.movesNoSag.front).toBeCloseTo(-0.35, 12);
    expect(V.movesNoSag.rear).toBeCloseTo(-0.55, 12);
  });

  it('그림 5: reverse R₁ −0.508 · R₂ +0.212 (처짐 포함), 역산 = rim-face', () => {
    expect(V.rv.r1).toBeCloseTo(-0.508, 12);
    expect(V.rv.r2).toBeCloseTo(0.212, 12);
    expect(V.fromRv.offset).toBeCloseTo(0.18, 12);
    expect(V.fromRv.slope).toBeCloseTo(0.0004, 12);
  });

  it('그림 6: 성장 모터 0.23 · 펌프 0.10 → 냉간 목표 −0.13, 발 이동 −0.43 · −0.63, 열간 확인 −0.06', () => {
    expect(V.growthM).toBeCloseTo(0.23, 12);
    expect(V.growthS).toBeCloseTo(0.10005, 12);
    expect(V.target).toBeCloseTo(-0.13, 3);
    expect(V.movesT.front).toBeCloseTo(-0.43, 3);
    expect(V.movesT.rear).toBeCloseTo(-0.63, 3);
    expect(V.hot).toBeCloseTo(-0.06, 3);
  });
});
