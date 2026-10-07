import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { bearingFrequencies, BEARING_6205 } from '../lib/machine/frequencies';
import { analyzeBearing, bearingSignal, DEMO_CALC, ruleOfThumb, type BearingFault } from '../lib/faults/bearing';
import type { FigureSpec } from '../lib/figure';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';
import * as F from './p7-5';

const V = F.P75_VALUES;
const deg = (a: number) => (a * Math.PI) / 180;

describe('P7-5 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('그림 7개, id가 겹치지 않는다', () => {
    const figs = Object.values(F).filter((v): v is FigureSpec => typeof v === 'object' && v !== null && 'panels' in v);
    expect(figs).toHaveLength(7);
    expect(new Set(figs.map((x) => x.id)).size).toBe(7);
  });

  it('숫자 예: 6205 · 3575 rpm → FTF 23.73 (0.3983X), BPFO 213.6 (3.585X), BPFI 322.7 (5.415X), BSF 140.4, 2×BSF 280.8, 어림값 214.5 (+0.4 %) · 321.8 (−0.3 %)', () => {
    const c = V.calc;
    expect([f(V.fr, 4), f(V.dd, 4)]).toEqual(['59.58', '0.2034']);
    expect([f(c.ftf, 4), f(c.ftf / V.fr, 4)]).toEqual(['23.73', '0.3983']);
    expect([f(c.bpfo, 4), f(c.bpfo / V.fr, 4), f(c.bpfi, 4), f(c.bpfi / V.fr, 4)]).toEqual(['213.6', '3.585', '322.7', '5.415']);
    expect([f(c.bsf, 4), f(c.bsf2, 4)]).toEqual(['140.4', '280.8']);
    expect([f(V.rule.bpfo, 4), f(V.rule.bpfi, 4)]).toEqual(['214.5', '321.8']);
    expect(f(((V.rule.bpfo - c.bpfo) / c.bpfo) * 100, 1)).toBe('0.4');
    expect(f(((V.rule.bpfi - c.bpfi) / c.bpfi) * 100, 1)).toBe('−0.3');
  });

  it('접촉각 40°: BPFO 226.4 (3.799X), BPFI 309.9 (5.201X), 어림값은 5 % 넘게 낮다 / 합 9X = 536.3 Hz', () => {
    const a = V.alpha40;
    expect([f(a.bpfo, 4), f(a.bpfo / V.fr, 4), f(a.bpfi, 4), f(a.bpfi / V.fr, 4)]).toEqual(['226.4', '3.799', '309.9', '5.201']);
    expect((a.bpfo - V.rule.bpfo) / a.bpfo).toBeGreaterThan(0.05);
    expect(f(9 * V.fr, 4)).toBe('536.3');
  });

  it('앵귤러 프리셋(볼 12, d 9.5, D 46, α 40°): BPFO 5.051X, 어림값 4.8X는 약 5 % 낮다', () => {
    const b = bearingFrequencies({ balls: 12, ballDiameter: 9.5e-3, pitchDiameter: 46e-3, contactAngle: deg(40) }, 1);
    expect(f(b.bpfo, 4)).toBe('5.051');
    expect(f(((ruleOfThumb(12, 1).bpfo - b.bpfo) / b.bpfo) * 100, 1)).toBe('−5');
  });

  it('미끄럼: 1 %면 BPFO 211.5 (211 Hz 칸, 1 % 낮음)·BPFI 324.8, 2 %면 209.3 (−2 %)·326.9 (+1.3 %)', () => {
    expect([f(V.actual.bpfo, 4), f(V.actual.bpfi, 4), f(V.actual.bsf2, 4), f(V.actual.ftf, 3)]).toEqual(['211.5', '324.8', '278', '23.5']);
    expect(f((1 - V.actual.bpfo / DEMO_CALC.bpfo) * 100, 1)).toBe('1');
    expect([f(V.slip2.bpfo, 4), f(V.slip2.bpfi, 4), f((V.slip2.bpfi / DEMO_CALC.bpfi - 1) * 100, 2)]).toEqual(['209.3', '326.9', '1.3']);
  });

  it('그림 4 (3단계, 공진 대역 엔벨로프 [g]): 외륜 0.24·0.13, 내륜 0.17·−1X 0.085·1X 0.14, 볼 0.13·−FTF 0.053·FTF 0.094, 케이지 0.017 (다른 위치보다 7 ~ 14배 작다)', () => {
    const l = V.loc;
    expect([f(l.outer.main, 2), f(l.outer.h2, 2)]).toEqual(['0.24', '0.13']);
    expect([f(l.inner.main, 2), f(l.inner.lo, 2), f(l.inner.x1, 2)]).toEqual(['0.17', '0.085', '0.14']);
    expect([f(l.ball.main, 2), f(l.ball.lo, 2), f(l.ball.ftf, 2)]).toEqual(['0.13', '0.053', '0.094']);
    expect(f(l.cage.main, 2)).toBe('0.017');
    const ratios = [l.outer.main, l.inner.main, l.ball.main].map((v) => v / l.cage.main);
    expect(Math.min(...ratios)).toBeGreaterThan(7);
    expect(Math.max(...ratios)).toBeLessThan(14.5);
  });

  it('4단계 표·그림 6 ~ 7 (외륜): 1단계 초음파 78·공진 2.3배 / 2단계 공진 117배·K 4.2·속도 0.036 / 3단계 속도 0.72·K 5.6 / 4단계 4.6·3.4배, 속도 0.23, 1X 2.9, K 3.2', () => {
    const s = V.stages;
    expect([f(s[1].envRatio.ultra, 2), f(s[1].envRatio.res, 2)]).toEqual(['78', '2.3']);
    expect([f(s[2].envRatio.res, 3), f(s[2].kurtosis, 2), f(s[2].velDefect, 2)]).toEqual(['117', '4.2', '0.036']);
    expect([f(s[3].velDefect, 2), f(s[3].kurtosis, 2), f(s[3].vel1X, 2)]).toEqual(['0.72', '5.6', '1.3']);
    expect([f(s[4].envRatio.res, 2), f(s[4].envRatio.ultra, 2), f(s[4].velDefect, 2), f(s[4].vel1X, 2), f(s[4].kurtosis, 2)]).toEqual(['4.6', '3.4', '0.23', '2.9', '3.2']);
    expect(f(s[0].vel1X, 2)).toBe('1');
    expect([f(s[0].velOverall, 2), f(s[4].velOverall, 2)]).toEqual(['1', '3.5']);
  });

  it('LAB-BRG-02 과제 4: 엔벨로프 결함 줄 주파수(2단계, 공진 대역) 외륜 211 Hz (−1 %), 내륜 325 Hz (+0.7 %)', () => {
    const top = (fault: BearingFault, calc: number) => {
      const e = analyzeBearing(bearingSignal(fault, 2)).env.res;
      let kTop = -1;
      for (let k = 0; k < e.freq.length; k++) if (Math.abs(e.freq[k] - calc) <= 0.03 * calc && (kTop < 0 || e.amp[k] > e.amp[kTop])) kTop = k;
      return e.freq[kTop];
    };
    expect(top('outer', DEMO_CALC.bpfo)).toBe(211);
    expect(top('inner', DEMO_CALC.bpfi)).toBe(325);
    expect(f((325 / DEMO_CALC.bpfi - 1) * 100, 1)).toBe('0.7');
  });

  it('확인 문제: Q1 1785 rpm → 3.5848·5.4152X, 106.6·161.1 Hz, Q2 1500 rpm BPFI 135.4 Hz', () => {
    const q1 = bearingFrequencies(BEARING_6205, 1785 / 60);
    expect([f(q1.bpfo / (1785 / 60), 5), f(q1.bpfi / (1785 / 60), 5)]).toEqual(['3.5848', '5.4152']);
    expect([f(q1.bpfo, 4), f(q1.bpfi, 4)]).toEqual(['106.6', '161.1']);
    expect(f(bearingFrequencies(BEARING_6205, 25).bpfi, 4)).toBe('135.4');
  });

  it('그림 5: 1단계는 23 ~ 25 kHz가 건전보다 약 25 dB 오르고 3.3 kHz 둘레는 1 dB 안 (울림 0.25 g vs 0.004 g)', () => {
    const bandDb = (s: 0 | 1, f1: number, f2: number) => {
      const sig = bearingSignal('outer', s);
      const sp = singleSidedSpectrum({ fs: sig.fs, x: sig.acc }, { window: 'hann' });
      let p = 0;
      let m = 0;
      sp.frequency.forEach((fr, k) => {
        if (fr >= f1 && fr <= f2) {
          p += sp.amplitude[k] ** 2;
          m++;
        }
      });
      return 10 * Math.log10(p / m);
    };
    const rise = bandDb(1, 23000, 25000) - bandDb(0, 23000, 25000);
    expect(rise).toBeGreaterThan(22);
    expect(rise).toBeLessThan(29);
    expect(Math.abs(bandDb(1, 3000, 3600) - bandDb(0, 3000, 3600))).toBeLessThan(1);
  });
});
