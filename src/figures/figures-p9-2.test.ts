import { describe, expect, it } from 'vitest';
import { P92_VALUES as V } from './p9-2';

/** 본문·캡션·랩 해석이 인용하는 P9-2 숫자 고정 (PageGuide §5-5) */
describe('P9-2 그림 숫자', () => {
  it('영향계수: 평면 1 → 베어링 1 0.617 µm/g∠4.8°, 베어링 2 0.060∠169.4°', () => {
    expect(V.a11.um).toBeCloseTo(0.6166, 4);
    expect(V.a11.deg).toBeCloseTo(4.79, 2);
    expect(V.a12.um).toBeCloseTo(0.0600, 4);
    expect(V.a12.deg).toBeCloseTo(169.4, 1);
  });

  it('그림 1: V0 33.7∠45.3, V1 49.3∠31.2, ΔV 18.5∠4.8 → W_c 54.7 g∠220.5', () => {
    expect(V.s1.V0[0].um).toBeCloseTo(33.71, 2);
    expect(V.s1.V0[0].deg).toBeCloseTo(45.31, 2);
    expect(V.s1.V1[0].um).toBeCloseTo(49.26, 2);
    expect(V.s1.V1[0].deg).toBeCloseTo(31.19, 2);
    expect(V.s1.dV.um).toBeCloseTo(18.50, 2);
    expect(V.s1.corr.g).toBeCloseTo(54.67, 2);
    expect(V.s1.corr.deg).toBeCloseTo(220.52, 2);
  });

  it('그림 2: 정적 1면 → B2 30.7 → 33.6, 커플 1면 → B2 40.5 → 36.7, 2면은 정확', () => {
    expect(V.s1.V0[1].um).toBeCloseTo(30.70, 2);
    expect(V.s1.afterB2).toBeCloseTo(33.64, 2);
    expect(V.c1.before[1]).toBeCloseTo(40.48, 2);
    expect(V.c1.after[1]).toBeCloseTo(36.70, 2);
    expect(V.c1.corr.g).toBeCloseTo(65.65, 2);
    expect(V.c1.corr.deg).toBeCloseTo(288.6, 1);
    expect(V.s2corr.map((w) => Math.round(w.g))).toEqual([60, 55]);
    expect(V.c2.corr.map((w) => Math.round(w.deg))).toEqual([290, 110]);
  });

  it('그림 3: 흔들림 2 µm — 10 g 16.5, 30 g 7.4, 80 g 4.3 µm (중앙값), 출발점 약 20 g', () => {
    const at = (g: number) => V.study.find((q) => q.g === g)!;
    expect(at(10).median).toBeCloseTo(16.53, 1);
    expect(at(30).median).toBeCloseTo(7.38, 1);
    expect(at(80).median).toBeCloseTo(4.35, 1);
    expect(V.trialStartG).toBeCloseTo(19.88, 1);
  });

  it('그림 4: 4-run A0 33.7, A 49.3 · 41.3 · 17.4, T 18.5, α 40.5 → 54.7 g∠220.5', () => {
    expect(V.four.A.map((a) => Number(a.toFixed(1)))).toEqual([49.3, 41.3, 17.4]);
    expect(V.four.T).toBeCloseTo(18.50, 2);
    expect(V.four.alpha).toBeCloseTo(40.52, 2);
    expect(V.four.corr.g).toBeCloseTo(54.67, 2);
  });

  it('그림 5: 70 g∠20° → 0° 24.3 g + 30° 47.9 g (합 72.2 g)', () => {
    const [a, b] = V.split[0];
    expect(a.g).toBeCloseTo(24.31, 2);
    expect(b.g).toBeCloseTo(47.88, 2);
    expect(V.split[1].map((w) => Number(w.g.toFixed(1)))).toEqual([10.4, 20.5]);
  });

  it('랩 해석: 흔들림 2 µm 1면 → 45.3 g∠221.6, 남는 B1 5.8 µm · slow roll 보상 없이 → 센서 0, 실제 4 · 3 µm', () => {
    expect(V.noisy.corr.g).toBeCloseTo(45.27, 2);
    expect(V.noisy.after[0]).toBeCloseTo(5.83, 2);
    expect(V.runout.meas[0]).toBeLessThan(1e-9);
    expect(V.runout.true[0]).toBeCloseTo(4, 9);
    expect(V.runout.true[1]).toBeCloseTo(3, 9);
  });

  it('그림 7: G 2.5 · 3000 rpm → 7.96 µm, 6366 g·mm', () => {
    expect(V.gEx.ePerUm).toBeCloseTo(7.958, 3);
    expect(V.gEx.uPerGmm).toBeCloseTo(6366, 0);
  });
});
