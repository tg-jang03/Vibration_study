import { describe, expect, it } from 'vitest';
import { beatEnvelope, besselJ, carsonPairs, modulationLines } from './modulation';
import { acquire } from './sampling';
import { evaluate } from './signal';
import { singleSidedSpectrum } from './spectrum';

describe('besselJ — 문헌값', () => {
  it('β = 1: J₀ 0.7652, J₁ 0.4401, J₂ 0.1149 (Contents §6)', () => {
    expect(besselJ(0, 1)).toBeCloseTo(0.7651976866, 9);
    expect(besselJ(1, 1)).toBeCloseTo(0.4400505857, 9);
    expect(besselJ(2, 1)).toBeCloseTo(0.1149034849, 9);
  });
  it('J₀의 첫 영점 2.4048, J₅(5) = 0.2611, 음의 차수 J₋ₙ = (−1)ⁿJₙ', () => {
    expect(besselJ(0, 2.404825557695773)).toBeCloseTo(0, 12);
    expect(besselJ(5, 5)).toBeCloseTo(0.2611405461, 9);
    expect(besselJ(-1, 1.7)).toBeCloseTo(-besselJ(1, 1.7), 14);
    expect(besselJ(-2, 1.7)).toBeCloseTo(besselJ(2, 1.7), 14);
  });
  it('합의 성질 J₀² + 2ΣJₙ² = 1 (파워가 측대역으로 나뉠 뿐)', () => {
    for (const x of [0.5, 2, 5]) {
      let s = besselJ(0, x) ** 2;
      for (let n = 1; n < 30; n++) s += 2 * besselJ(n, x) ** 2;
      expect(s).toBeCloseTo(1, 12);
    }
  });
});

describe('modulationLines — 측대역 이론값', () => {
  const at = (lines: ReturnType<typeof modulationLines>, n: number) => lines.find((l) => l.n === n)!.ratio;

  it('AM만: 반송파 1, 첫째 측대역 m/2, 나머지 0 (m = 0.5 → 0.25 = −12.0 dB)', () => {
    const l = modulationLines(0.5, 0);
    expect(at(l, 0)).toBeCloseTo(1, 14);
    expect(at(l, 1)).toBeCloseTo(0.25, 14);
    expect(at(l, -1)).toBeCloseTo(0.25, 14);
    expect(at(l, 2)).toBeCloseTo(0, 14);
    expect(20 * Math.log10(at(l, 1))).toBeCloseTo(-12.04, 2);
  });

  it('FM만: n번째 측대역 = ∣Jₙ(β)∣, 양쪽 대칭', () => {
    const l = modulationLines(0, 1);
    for (const n of [0, 1, 2, 3]) {
      expect(at(l, n)).toBeCloseTo(Math.abs(besselJ(n, 1)), 14);
      expect(at(l, -n)).toBeCloseTo(at(l, n), 14);
    }
  });

  it('AM + FM: 위상차에 따라 측대역이 비대칭', () => {
    const l = modulationLines(0.4, 0.6, 0);
    expect(Math.abs(at(l, 1) - at(l, -1))).toBeGreaterThan(0.1);
    // 위상차 90°면 다시 대칭에 가까워진다
    const q = modulationLines(0.4, 0.6, Math.PI / 2);
    expect(Math.abs(at(q, 1) - at(q, -1))).toBeLessThan(1e-12);
  });

  it('합성한 신호의 FFT와 이론값이 맞는다 (bin 중심, Hann)', () => {
    const fs = 1024;
    const n = 8192; // Δf = 0.125 Hz
    const spec = { components: [{ type: 'modulated' as const, carrier: 100, amp: 2, modFreq: 5, am: 0.4, fm: 1.2, amPhase: 0.7 }] };
    const s = singleSidedSpectrum(acquire(spec, { fs, n }), { window: 'hann' });
    for (const line of modulationLines(0.4, 1.2, 0.7, 6)) {
      const k = Math.round((100 + 5 * line.n) / s.binSpacing);
      expect(s.amplitude[k]).toBeCloseTo(2 * line.ratio, 4);
    }
  });

  it('signal.ts의 modulated 성분 = 식 그대로', () => {
    const c = { type: 'modulated' as const, carrier: 50, amp: 1.5, modFreq: 3, am: 0.3, fm: 0.8, amPhase: 0.2, phase: 0.1 };
    for (const t of [0, 0.013, 0.37, 1.9]) {
      const want = 1.5 * (1 + 0.3 * Math.cos(2 * Math.PI * 3 * t + 0.2)) * Math.cos(2 * Math.PI * 50 * t + 0.8 * Math.sin(2 * Math.PI * 3 * t) + 0.1);
      expect(evaluate({ components: [c] }, t)).toBeCloseTo(want, 12);
    }
  });
});

describe('beatEnvelope — 맥놀이', () => {
  it('최대 A₁ + A₂, 반주기 뒤 최소 ∣A₁ − A₂∣, 주기 1/∣f₂ − f₁∣', () => {
    expect(beatEnvelope(1, 0.6, 30, 29.5, 0)).toBeCloseTo(1.6, 12);
    expect(beatEnvelope(1, 0.6, 30, 29.5, 1)).toBeCloseTo(0.4, 12); // 0.5 Hz 차이 → 반주기 1 s
    expect(beatEnvelope(1, 0.6, 30, 29.5, 2)).toBeCloseTo(1.6, 12);
  });
  it('카슨 경험칙: β = 1 → 2쌍, β = 5 → 6쌍', () => {
    expect(carsonPairs(1)).toBe(2);
    expect(carsonPairs(5)).toBe(6);
  });
});
