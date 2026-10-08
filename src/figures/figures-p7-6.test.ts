import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { analyzeGear, gearPair, gearTsa, sidebands, type GearOptions } from '../lib/faults/gear';
import { G } from '../lib/faults/synth';
import type { FigureSpec } from '../lib/figure';
import * as F from './p7-6';

const V = F.P76_VALUES;
const o = (fault: GearOptions['fault'], side: GearOptions['side'] = 'gear', severity = 0.6, load = 0.8): GearOptions => ({ fault, side, severity, load });

describe('P7-6 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('그림 8개, id가 겹치지 않는다', () => {
    const figs = Object.values(F).filter((v): v is FigureSpec => typeof v === 'object' && v !== null && 'panels' in v);
    expect(figs).toHaveLength(8);
    expect(new Set(figs.map((x) => x.id)).size).toBe(8);
  });

  it('감속기: f₁ 24.83, GMF 571.2, f₂ 9.363 Hz (561.8 rpm), 회전수비 2.652, LCM 1403 → 0.4071 Hz · 2.456 s · 61바퀴 · 23바퀴', () => {
    const p = V.pair;
    expect([f(p.f1, 4), f(p.gmf, 4), f(p.f2, 4), f(V.outRpm, 4), f(V.ratio, 4)]).toEqual(['24.83', '571.2', '9.363', '561.8', '2.652']);
    expect([p.lcm, f(p.fHT, 4), f(p.htPeriod, 4), p.pinionRevs, p.gearRevs]).toEqual([1403, '0.4071', '2.456', 61, 23]);
    expect([f(1000 / p.f1, 4), f(1000 / p.f2, 4)]).toEqual(['40.27', '106.8']);
  });

  it('헌팅 투스 충격 1.42 · 3.88 · 6.33 s / 24·36 → GCD 12, LCM 72, 피니언 3바퀴 / 23·36 → LCM 828', () => {
    expect(V.htTimes.map((t) => f(t, 3))).toEqual(['1.42', '3.88', '6.33']);
    expect(V.combos.map((c) => c.lcm)).toEqual([1403, 888, 72, 60]);
    const c = V.combos[2].pair;
    expect([c.gcd, c.pinionRevs, 36 / c.gcd]).toEqual([12, 3, 3]);
    expect(gearPair(23, 36, 1).lcm).toBe(828);
    expect([f(36 / 24, 3), f(36 / 23, 4)]).toEqual(['1.5', '1.565']);
  });

  it('확인 문제 Q1: 20 → 47이빨, 1800 rpm → GMF 600, 12.77 Hz (766 rpm), 0.6383 Hz (1.567 s)', () => {
    const p = gearPair(20, 47, 30);
    expect([f(p.gmf, 3), f(p.f2, 4), f(p.f2 * 60, 3), p.lcm, f(p.fHT, 4), f(p.htPeriod, 4)]).toEqual(['600', '12.77', '766', 940, '0.6383', '1.567']);
  });

  it('건전 GMF 0.86 g, 2×÷GMF 0.35, 3×÷GMF 0.15 / 마모(60 %) 0.96 g, 0.79·0.46, 공진 0.018 → 0.067 g (3.6배)', () => {
    const h = V.healthy;
    const w = V.wear;
    expect([f(h.gmf, 2), f(h.gmf2 / h.gmf, 2), f(h.gmf3 / h.gmf, 2), h.nPinion, h.nGear]).toEqual(['0.86', '0.35', '0.15', 0, 0]);
    expect([f(w.gmf, 2), f(w.gmf2 / w.gmf, 2), f(w.gmf3 / w.gmf, 2)]).toEqual(['0.96', '0.79', '0.46']);
    expect([f(h.resRms, 2), f(w.resRms, 2), f(w.resRms / h.resRms, 2)]).toEqual(['0.018', '0.067', '3.6']);
  });

  it('편심: 첫 쌍 약 19 %, 둘째 쌍 약 1.8 %, 1 %를 넘는 측대역 4개 (그 축 간격만)', () => {
    for (const sb of [V.sbEccP, V.sbEccG]) {
      for (const v of [sb.lo[0], sb.hi[0]]) expect(f(v, 2)).toMatch(/^(18|19)$/);
      for (const v of [sb.lo[1], sb.hi[1]]) expect(f(v, 2)).toMatch(/^1\.[78]$/);
    }
    expect([V.eccP.nPinion, V.eccP.nGear, V.eccG.nPinion, V.eccG.nGear]).toEqual([4, 0, 0, 4]);
  });

  it('깨진 이: 그 축 간격 30개(모두) — 기어 가장 큰 것 약 3 %, 피니언 1 ~ 6 % / 파형 충격 2.5 g vs 맞물림 물결 1.3 g', () => {
    expect([V.brokenG.nGear, V.brokenP.nPinion]).toEqual([30, 30]);
    expect([f(V.brokenWave.impact, 2), f(V.brokenWave.mesh, 2)]).toEqual(["2.5", "1.3"]);
    const pct = (fault: GearOptions['side'], spacing: number) => {
      const a = analyzeGear(o('broken', fault));
      const { lo, hi } = sidebands(a.spec.frequency, a.spec.amplitude, V.pair.gmf, spacing, 15);
      return [...lo, ...hi].map((v) => (100 * v) / (a.readouts.gmf * G));
    };
    const g = pct('gear', V.pair.f2);
    expect(f(Math.max(...g), 1)).toBe('3');
    const p = pct('pinion', V.pair.f1).filter((v) => v > 1);
    expect([f(Math.min(...p), 1), f(Math.max(...p), 1)]).toEqual(['1', '6']);
  });

  it('백래시: 부하 30 % 공진 0.14 g (건전의 9.2배), 20 % 0.16, 80 % 0.044, 100 % 0.020 = 건전 / 건전 공진 0.015 ~ 0.020 g, GMF 0.44 → 1.0 g', () => {
    const at = (l: number) => V.load.find((x) => x.load === l)!;
    expect([f(V.backlashLight.resRms, 2), f(V.backlashLight.resRms / at(0.3).healthy.resRms, 2)]).toEqual(['0.14', '9.2']);
    expect([f(at(0.2).backlash.resRms, 2), f(at(0.8).backlash.resRms, 2), f(at(1).backlash.resRms, 2)]).toEqual(['0.16', '0.044', '0.02']);
    expect(at(1).backlash.resRms).toBeCloseTo(at(1).healthy.resRms, 6);
    const hs = V.load.map((x) => x.healthy.resRms);
    expect(Math.min(...hs)).toBeGreaterThan(0.0145);
    expect(Math.max(...hs)).toBeLessThan(0.0205);
    expect([f(at(0.2).healthy.gmf, 2), f(at(1).healthy.gmf, 2)]).toEqual(['0.44', '1']);
  });

  it('TSA: 기어 축 15바퀴 102°·18번·FM4 100 (정답 102°), 피니언 축 40바퀴 FM4 3.5 (건전 3.6), 바퀴 수 1 · 5 · 15 · 40 → 33 · 17 · 5.3 · 3.5', () => {
    const g = V.tsa.brokenG.gear;
    expect([f(g.peakAngle, 3), g.peakTooth, f(g.fm4, 2), f(g.defectAngle, 3)]).toEqual(['102', 18, '100', '102']);
    expect([f(V.tsa.brokenG.pinion.fm4, 2), f(V.tsa.healthy.pinion.fm4, 2)]).toEqual(['3.5', '3.6']);
    expect([1, 5, 15, 40].map((m) => f(gearTsa(o('broken', 'gear'), 'pinion', m).fm4, 2))).toEqual(['33', '17', '5.3', '3.5']);
  });

  it('TSA: 깨진 피니언 이빨 → 피니언 축 40바퀴 6번 이빨 84°, FM4 35 / 편심(기어) Difference FM4 3.7 (건전 3.2)', () => {
    const p = gearTsa(o('broken', 'pinion'), 'pinion', 40);
    expect([p.peakTooth, f(p.peakAngle, 2), f(p.fm4, 2)]).toEqual([6, '84', '35']);
    expect([f(gearTsa(o('eccentric', 'gear'), 'gear', 15).fm4, 2), f(gearTsa(o('healthy', 'gear'), 'gear', 15).fm4, 2)]).toEqual(['3.7', '3.2']);
  });

  it('켑스트럼: 깨진 피니언 1/f₁ 0.11 (건전 0.0092), 깨진 기어 1/f₂ 0.17 (건전 0.0064)', () => {
    const c = V.cep;
    expect([f(c.brokenP.p, 2), f(c.healthy.p, 2), f(c.brokenG.g, 2), f(c.healthy.g, 2)]).toEqual(['0.11', '0.0092', '0.17', '0.0064']);
  });
});
