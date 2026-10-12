import { describe, expect, it } from 'vitest';
import { halfPower, impactTest, MODE_BANDS } from '../lib/fieldwork/impact';
import { LAB_DEFAULT, P91_VALUES as V, SOFT_FOOT_LIFT } from './p9-1';

/** 본문·캡션·랩 해석이 인용하는 P9-1 숫자 고정 (PageGuide §5-5) */
describe('P9-1 그림 숫자', () => {
  it('그림 1: 1X 0.31 · 2.21 · 1.38 mm/s, 둔덕 약 24 dB', () => {
    expect(V.runOneX.map((v) => Number(v.toFixed(2)))).toEqual([0.31, 2.21, 1.38]);
    expect(V.humpDb).toBeCloseTo(24.5, 1);
  });

  it('그림 3: 최대 힘 0.98 · 3.9 · 19.6 kN, −10 dB 대역 127 · 510 · 2550 Hz, 고무의 290 Hz −32 dB', () => {
    expect(V.peakForce.rubber).toBeCloseTo(981.7, 1);
    expect(V.peakForce.plastic).toBeCloseTo(3927, 0);
    expect(V.peakForce.steel).toBeCloseTo(19635, 0);
    expect(Math.round(V.bw10.rubber)).toBe(127);
    expect(Math.round(V.bw10.plastic)).toBe(510);
    expect(Math.round(V.bw10.steel / 10) * 10).toBe(2550);
    expect(V.rubberAt[2]).toBeCloseTo(-31.7, 1);
    expect(V.rubberAt[1]).toBeCloseTo(-13.1, 1);
  });

  it('그림 4: 2차 — 윈도우 없이 ζ 0.0058 (bin 1.6), τ 0.1 s로 0.0147 − 0.0112 = 0.0034, 끝에 6.9 % 남음', () => {
    expect(V.def[1].zeta).toBeCloseTo(0.00579, 5);
    expect(V.def[1].bins).toBeCloseTo(1.645, 2);
    expect(V.exp2.zeta).toBeCloseTo(0.01466, 5);
    expect(V.exp2.bins).toBeCloseTo(4.16, 2);
    expect(V.exp2Added).toBeCloseTo(0.01121, 5);
    expect(V.exp2.zeta - V.exp2Added).toBeCloseTo(0.00345, 5);
    expect(V.ring2At1s).toBeCloseTo(0.0693, 4);
  });

  it('그림 5: 더블 히트 — 봉우리 58.5 · 131 (참 47.6 · 278), 코히어런스 0.995 · 0.950 · 0.959', () => {
    expect(V.dbl[0].peak * 1000).toBeCloseTo(58.5, 1);
    expect(V.dbl[1].peak * 1000).toBeCloseTo(130.6, 1);
    expect(V.trueAt[0] * 1000).toBeCloseTo(47.6, 1);
    expect(V.trueAt[1] * 1000).toBeCloseTo(277.9, 1);
    expect(V.dblCoh.map((c) => Number(c.toFixed(3)))).toEqual([0.995, 0.95, 0.959]);
    expect(Math.min(...V.defCoh)).toBeGreaterThan(0.998);
  });

  it('그림 6: 1차 — T 4 s ζ 0.0339 (bin 13), T 0.25 s ζ 0.0404 (bin 1, 높이 8.6 % 낮음)', () => {
    expect(V.long1.zeta).toBeCloseTo(0.0339, 4);
    expect(V.long1.bins).toBeCloseTo(12.95, 2);
    expect(V.short1.zeta).toBeCloseTo(0.0404, 4);
    expect(V.short1.bins).toBeCloseTo(0.969, 3);
    expect((1 - V.short1.peak / V.trueAt[0]) * 100).toBeCloseTo(8.6, 1);
  });

  it('그림 6의 T 4 s 오차는 잡음 몫 — 잡음 없으면 참값 ±1 %', () => {
    const r = impactTest({ ...LAB_DEFAULT, T: 4, responseNoise: 0, forceNoise: 0 });
    const h = halfPower(r.freqs, r.mag, MODE_BANDS[0][0], MODE_BANDS[0][1])!;
    expect(Math.abs(h.zeta / 0.035 - 1)).toBeLessThan(0.01);
  });

  it('그림 7: 범프 1X 3.05 → 0.72 m/s²', () => {
    expect(V.bump.single).toBeCloseTo(3.05, 2);
    expect(V.bump.avg).toBeCloseTo(0.723, 3);
  });

  it('랩 해석: 기본 1차 ζ 0.0381 (bin 3.7), 3차 0.0081 · 고무 3차 γ² 0.80 · ζ 0.0064 · Force 윈도우 끔 + 4 s 1차 ζ 0.0199', () => {
    expect(V.def[0].zeta).toBeCloseTo(0.0381, 4);
    expect(V.def[0].bins).toBeCloseTo(3.66, 2);
    expect(V.def[2].zeta).toBeCloseTo(0.00807, 5);
    expect(V.rubCoh3).toBeCloseTo(0.799, 3);
    expect(V.rub3.zeta).toBeCloseTo(0.006365, 5);
    expect(V.rub3.peak * 1000).toBeCloseTo(84.0, 1);
    expect(V.noFw4.zeta).toBeCloseTo(0.0199, 4);
    expect(V.long2.zeta).toBeCloseTo(0.00327, 5);
  });

  it('그림 9: C만 140 µm', () => {
    expect(SOFT_FOOT_LIFT).toEqual([18, 25, 140, 22]);
  });
});

describe('P9-1 그림 5 더블 히트의 첫 기록', () => {
  it('간격 4.39 ms · 세기 0.55 · 골 114 Hz (−6.9 dB)', async () => {
    const { DOUBLE_HIT } = await import('./p9-1');
    expect(DOUBLE_HIT.delayMs).toBeCloseTo(4.39, 2);
    expect(DOUBLE_HIT.scale).toBeCloseTo(0.55, 2);
    expect(DOUBLE_HIT.dipHz).toBeCloseTo(114.0, 1);
    expect(DOUBLE_HIT.dipDb).toBeCloseTo(-6.93, 2);
  });
});
