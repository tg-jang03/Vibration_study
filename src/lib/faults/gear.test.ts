import { describe, expect, it } from 'vitest';
import {
  analyzeGear,
  cepAt,
  gcd,
  GEAR_DEMO,
  GEAR_PAIR,
  gearCepstrum,
  gearPair,
  gearSignal,
  gearTsa,
  lcm,
  removedOrders,
  type GearOptions,
} from './gear';

const o = (fault: GearOptions['fault'], side: GearOptions['side'] = 'gear', load = 0.8): GearOptions => ({ fault, side, severity: 0.6, load });

describe('기어 쌍의 주파수 (해석해)', () => {
  it('최대공약수·최소공배수', () => {
    expect([gcd(23, 61), lcm(23, 61)]).toEqual([1, 1403]);
    expect([gcd(24, 36), lcm(24, 36)]).toEqual([12, 72]);
    expect([gcd(19, 76), lcm(19, 76)]).toEqual([19, 76]);
    expect(() => gcd(0, 5)).toThrow(RangeError);
    expect(() => gcd(2.5, 5)).toThrow(RangeError);
  });

  it('GMF = z₁f₁ = z₂f₂, f_HT = GMF/LCM = f₁·GCD/z₂', () => {
    for (const [z1, z2, f1] of [[23, 61, 1490 / 60], [24, 36, 25], [20, 47, 30], [19, 76, 50]] as const) {
      const p = gearPair(z1, z2, f1);
      expect(p.gmf).toBeCloseTo(z1 * f1, 10);
      expect(p.f2 * z2).toBeCloseTo(p.gmf, 10);
      expect(p.fHT).toBeCloseTo((f1 * gcd(z1, z2)) / z2, 10);
      expect(p.htPeriod * p.fHT).toBeCloseTo(1, 12);
      // 한 헌팅 주기 동안 두 축이 도는 바퀴 수는 정수
      expect(Number.isInteger(p.pinionRevs) && Number.isInteger(p.gearRevs)).toBe(true);
      expect(p.pinionRevs / p.f1).toBeCloseTo(p.htPeriod, 10);
      expect(p.gearRevs / p.f2).toBeCloseTo(p.htPeriod, 10);
    }
    expect(() => gearPair(23, 61, 0)).toThrow(RangeError);
  });

  it('P7-1 감속기: 24.83 Hz × 23 = 571.2 Hz, 출력 9.363 Hz(561.8 rpm), 헌팅 0.4071 Hz', () => {
    expect(GEAR_PAIR.gmf).toBeCloseTo(571.1667, 3);
    expect(GEAR_PAIR.f2).toBeCloseTo(9.3634, 3);
    expect(GEAR_PAIR.fHT).toBeCloseTo(0.40710, 4);
  });
});

describe('TSA에서 빼는 차수', () => {
  it('Residual = 0·1·2차 + 맞물림의 모든 하모닉, Difference = 그 ±1차도', () => {
    const r = removedOrders(61, 1024, 'residual');
    expect(r).toEqual([0, 1, 2, 61, 122, 183, 244, 305, 366, 427, 488]);
    const d = removedOrders(23, 128, 'difference');
    expect(d).toEqual([0, 1, 2, 22, 23, 24, 45, 46, 47]);
    expect(removedOrders(23, 64, 'tsa')).toEqual([]);
  });
});

describe('설명용 기어 신호 (시드 고정)', () => {
  it('같은 설정이면 같은 신호, 길이 n·f_s', () => {
    const a = gearSignal(o('broken'));
    expect(a.acc.length).toBe(GEAR_DEMO.n);
    expect(a.fs).toBe(GEAR_DEMO.fs);
    const b = gearSignal({ ...o('broken'), severity: 0.6000001 });
    expect(b.acc[1234]).toBeCloseTo(a.acc[1234], 6);
  });

  it('건전: GMF·2×·3× 줄이 모델값(0.86 · 0.30 · 0.13 g = 부하 배율 0.86 × 1 · 0.35 · 0.15), 측대역 1 % 넘는 것 없음', () => {
    const r = analyzeGear(o('healthy')).readouts;
    const lf = 0.3 + 0.7 * 0.8;
    expect(r.gmf).toBeCloseTo(lf * GEAR_DEMO.mesh[0], 1);
    expect(r.gmf2 / r.gmf).toBeCloseTo(GEAR_DEMO.mesh[1], 1);
    expect(r.gmf3 / r.gmf).toBeCloseTo(GEAR_DEMO.mesh[2], 1);
    expect([r.nPinion, r.nGear]).toEqual([0, 0]);
  });

  it('편심: 그 기어의 회전 주파수 간격에만 측대역 (첫 쌍 ≈ √((m/2)² + (β/2)²) = 18 %)', () => {
    const s = 0.6;
    const expected = Math.hypot(0.5 * s, 0.35 * s) / 2;
    const g = analyzeGear(o('eccentric', 'gear')).readouts;
    const p = analyzeGear(o('eccentric', 'pinion')).readouts;
    expect(g.nGear).toBeGreaterThanOrEqual(2);
    expect(g.nPinion).toBe(0);
    expect(p.nPinion).toBeGreaterThanOrEqual(2);
    expect(p.nGear).toBe(0);
    // ±1 ~ ±6 RSS ÷ GMF ≈ √2 × 첫 쌍 하나
    expect(g.sbGear / Math.SQRT2).toBeGreaterThan(expected * 0.9);
    expect(g.sbGear / Math.SQRT2).toBeLessThan(expected * 1.15);
  });

  it('깨진 이: 그 축 간격의 측대역이 많다 (편심보다 많이), 다른 축 간격은 적다', () => {
    const g = analyzeGear(o('broken', 'gear')).readouts;
    const p = analyzeGear(o('broken', 'pinion')).readouts;
    const e = analyzeGear(o('eccentric', 'gear')).readouts;
    expect(g.nGear).toBeGreaterThan(5 * e.nGear);
    expect(p.nPinion).toBeGreaterThan(10);
    expect(g.nPinion).toBeLessThanOrEqual(2);
    expect(p.nGear).toBeLessThanOrEqual(2);
  });

  it('백래시: 공진 대역이 부하가 가벼울수록 크고, 부하 100 %면 건전과 같다', () => {
    const res = (l: number) => analyzeGear(o('backlash', 'gear', l)).readouts.resRms;
    expect(res(0.2)).toBeGreaterThan(res(0.5));
    expect(res(0.5)).toBeGreaterThan(res(0.8));
    expect(res(1)).toBeCloseTo(analyzeGear(o('healthy', 'gear', 1)).readouts.resRms, 6);
  });
});

describe('축마다의 TSA', () => {
  it('깨진 기어 이빨: 기어 축 TSA는 18번 이빨에서 봉우리·FM4 큼, 피니언 축 TSA는 평균하면 사라진다', () => {
    const g = gearTsa(o('broken', 'gear'), 'gear', 15);
    expect(g.peakTooth).toBe(GEAR_DEMO.gearTooth + 1);
    expect(g.peakAngle).toBeGreaterThan(g.defectAngle);
    expect(g.peakAngle - g.defectAngle).toBeLessThan(360 / GEAR_DEMO.z2);
    expect(g.fm4).toBeGreaterThan(20);
    expect(gearTsa(o('broken', 'gear'), 'pinion', 40).fm4).toBeLessThan(4);
    expect(gearTsa(o('broken', 'gear'), 'pinion', 1).fm4).toBeGreaterThan(10);
  });

  it('깨진 피니언 이빨: 피니언 축 6번 이빨, 건전 FM4는 3 둘레', () => {
    const p = gearTsa(o('broken', 'pinion'), 'pinion', 40);
    expect(p.peakTooth).toBe(GEAR_DEMO.pinionTooth + 1);
    expect(p.fm4).toBeGreaterThan(10);
    for (const side of ['pinion', 'gear'] as const) {
      const h = gearTsa(o('healthy'), side, 15).fm4;
      expect(h).toBeGreaterThan(2.5);
      expect(h).toBeLessThan(4);
    }
  });

  it('TSA는 같은 각도의 평균: 동기 성분(맞물림 하모닉)은 바퀴 수와 상관없이 남는다', () => {
    const a = gearTsa(o('healthy'), 'gear', 5).tsa;
    const b = gearTsa(o('healthy'), 'gear', 30).tsa;
    const rms = (x: ArrayLike<number>) => Math.sqrt(Array.from(x).reduce((s, v) => s + v * v, 0) / x.length);
    expect(rms(b) / rms(a)).toBeGreaterThan(0.97);
    expect(rms(b) / rms(a)).toBeLessThan(1.03);
  });
});

describe('켑스트럼', () => {
  it('깨진 이의 축 한 바퀴 자리에 봉우리 (건전의 5배 넘게)', () => {
    const h = gearCepstrum(o('healthy'));
    const cp = gearCepstrum(o('broken', 'pinion'));
    const cg = gearCepstrum(o('broken', 'gear'));
    expect(cepAt(cp, 1 / GEAR_PAIR.f1)).toBeGreaterThan(5 * cepAt(h, 1 / GEAR_PAIR.f1));
    expect(cepAt(cg, 1 / GEAR_PAIR.f2)).toBeGreaterThan(5 * cepAt(h, 1 / GEAR_PAIR.f2));
    expect(cepAt(cp, 1 / GEAR_PAIR.f2)).toBeLessThan(2 * cepAt(h, 1 / GEAR_PAIR.f2) + 0.005);
  });
});
