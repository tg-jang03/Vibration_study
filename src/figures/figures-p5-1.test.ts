import { describe, expect, it } from 'vitest';
import * as F from './p5-1';
import { designIir, iirResponse } from '../lib/dsp/filter';
import { FLT_DEMO } from '../lib/filterDemo';

const V = F.P51_VALUES;

describe('P5-1 본문 보충 숫자 (재검토 2026-10-08)', () => {
  const fs = FLT_DEMO.fs;
  const freqs = Array.from({ length: 2401 }, (_, i) => 1 + i * 0.1); // 1 ~ 241 Hz
  const resp = (family: 'butterworth' | 'chebyshev1') => iirResponse(designIir({ family, order: 4, fc: 150, fs }), freqs);
  it('Chebyshev의 f_c는 −1 dB(리플 끝), −3 dB 점은 약 158 Hz', () => {
    const r = resp('chebyshev1');
    const k = r.mag.findIndex((m, i) => freqs[i] > 150 && 20 * Math.log10(m) < -3);
    expect(Math.round(freqs[k])).toBe(158);
  });
  it('군지연: Butterworth f_c 3.94 ms·최대 4.16 ms, Chebyshev 최대 약 8.7 ms, f_c의 위상 지연 3.33 ms', () => {
    const b = resp('butterworth');
    const c = resp('chebyshev1');
    const kfc = freqs.findIndex((f) => Math.abs(f - 150) < 1e-9);
    expect(b.groupDelay[kfc] * 1000).toBeCloseTo(3.94, 2);
    expect(Math.max(...b.groupDelay) * 1000).toBeCloseTo(4.16, 1);
    expect(Math.max(...c.groupDelay) * 1000).toBeGreaterThan(8.5);
    expect(Math.max(...c.groupDelay) * 1000).toBeLessThan(8.8);
    expect((-b.phase[kfc] / (2 * Math.PI * 150)) * 1000).toBeCloseTo(3.33, 2);
  });
  it('두 번 거르기: 설계 f_c에서 −6 dB, −3 dB 점은 약 0.90 f_c(134 Hz)', () => {
    const b = resp('butterworth');
    const k = b.mag.findIndex((m) => 40 * Math.log10(m) < -3);
    expect(Math.round(freqs[k])).toBe(134);
  });
  it('FIR(101탭)도 사각파 모서리에서 약 5.9 % 넘친다', () => {
    expect(V.overshoot.fir).toBeCloseTo(5.9, 0);
  });
});

describe('P5-1 그림 숫자 (본문·캡션이 인용)', () => {
  it('그림 1: 4차 Butterworth f_c = 150 Hz, 2차 고역 통과 5 Hz', () => {
    expect(V.lp.db300).toBeCloseTo(-24.3, 1);
    expect(V.lp.db500).toBeCloseTo(-42.5, 1);
    expect(V.hp.db1).toBeCloseTo(-28.0, 1);
    expect(V.hp.x1).toBeCloseTo(0.9992, 4);
  });

  it('그림 2 ~ 3: 종류별 크기·위상·군지연', () => {
    expect(V.fam.chebyshev1.db25).toBeCloseTo(-0.64, 2);
    expect(V.fam.bessel.db75).toBeCloseTo(-0.70, 2);
    expect(V.fam.chebyshev1.db500).toBeCloseTo(-53.9, 1);
    expect(V.fam.bessel.db500).toBeCloseTo(-29.1, 1);
    expect(V.fam.butterworth.ph25).toBeCloseTo(-25.0, 1);
    expect(V.fam.butterworth.ph75).toBeCloseTo(-77.8, 1);
    expect(V.fam.butterworth.gd25).toBeCloseTo(2.80, 2);
    expect(V.fam.butterworth.gd75).toBeCloseTo(3.16, 2);
    expect(V.fam.butterworth.gdFc).toBeCloseTo(3.94, 2);
    expect(V.fam.bessel.gd25).toBeCloseTo(2.24, 2);
    expect(V.fam.bessel.gd75).toBeCloseTo(2.24, 2);
    expect(V.fam.chebyshev1.gdFc).toBeCloseTo(8.5, 1);
  });

  it('그림 4: 사각파 모서리의 넘침과 FIR 지연', () => {
    expect(V.overshoot.butterworth).toBeCloseTo(10.9, 1);
    expect(V.overshoot.bessel).toBeCloseTo(0.89, 2);
    expect(V.overshoot.chebyshev1).toBeCloseTo(21.9, 1);
    expect(V.firDelay).toBeCloseTo(7.81, 2);
  });

  it('그림 8: ski-slope와 하한 컷오프', () => {
    expect(V.v0.lowMax).toBeCloseTo(18.2, 1);
    expect(V.v0.x1).toBeCloseTo(3.99, 2);
    expect(V.v5.lowMax).toBeCloseTo(0.71, 2);
    expect(V.v5.x1).toBeCloseTo(3.98, 2);
    expect(V.v20.x1).toBeCloseTo(3.36, 2);
  });

  it('그림 9: 누적합 드리프트', () => {
    expect(V.drift0.v2).toBeCloseTo(9.81, 2);
    expect(V.vStart).toBeCloseTo(4.17, 2);
    expect(V.drift0.dMax).toBeCloseTo(1.85, 2);
    expect(V.drift5.dLate).toBeLessThan(30);
  });

  it('그림 10: 데시메이션의 접힘', () => {
    expect(F.DEC_VALUES.alias).toBeCloseTo(0.5, 6);
    expect(F.DEC_VALUES.filtered).toBeLessThan(1e-3);
  });
});

describe('P5-1 랩 해석이 인용하는 FIR 숫자', () => {
  it('FIR 101탭: 500 Hz −62.1 dB, 1X 위상 70.3° 늦음', () => {
    expect(V.fam.fir.db500).toBeCloseTo(-62.1, 1);
    expect(V.fam.fir.ph25).toBeCloseTo(-70.3, 1);
  });
});
