import { describe, expect, it } from 'vitest';
import * as F from './p5-3';
import { averageCross, cxAbs, frfH1, frfH2 } from '../lib/dsp/twoChannel';
import { ANTI_F, FREQS, frfFrames } from '../lib/xchDemo';

const V = F.P53_VALUES;

describe('P5-3 그림 숫자 (본문·캡션이 인용)', () => {
  it('받침대 예시: 반공진 106 Hz, 참 FRF 16.7 / 0.177 / 25.0', () => {
    expect(V.anti).toBe(106);
    expect(V.true80).toBeCloseTo(16.7, 1);
    expect(V.trueAnti).toBeCloseTo(0.177, 3);
    expect(V.true210).toBeCloseTo(25.0, 1);
    expect(V.ratio1Anti).toBeCloseTo(1.35, 2);
  });

  it('그림 3: 잡음 쪽에 따른 H1·H2 쏠림 (64장)', () => {
    expect(V.out.h2Anti).toBeCloseTo(3.33, 2);
    expect(V.inp.h1_80).toBeCloseTo(15.38, 2);
    expect(V.inp.h1_80 / V.true80).toBeCloseTo(1 / 1.09, 1);
  });

  it('그림 4: 코히어런스', () => {
    expect(V.coh.m1).toBeCloseTo(1, 12);
    expect(V.coh.m16).toBeCloseTo(0.223, 3);
    expect(V.coh.m256).toBeCloseTo(0.081, 3);
    expect(V.coh.m256_80).toBeCloseTo(0.999, 3);
  });

  it('그림 5 · 6: Full spectrum 막대', () => {
    const [c, e, l, cw] = F.FULL_VALUES;
    expect(c.af).toBeCloseTo(50, 6);
    expect(c.ab).toBeCloseTo(0, 6);
    expect(e.af).toBeCloseTo(46.19, 2);
    expect(e.ab).toBeCloseTo(19.13, 2);
    expect(l.af).toBeCloseTo(35.36, 2);
    expect(l.ab).toBeCloseTo(35.36, 2);
    expect(cw.ab).toBeCloseTo(50, 6);
    expect(F.PREMISE_VALUES.gainAb).toBeCloseTo(2.5, 6);
    expect(F.PREMISE_VALUES.angleAb).toBeCloseTo(50 * Math.sin((5 * Math.PI) / 180), 6);
  });
});

describe('LAB-XCH-01 과제의 숫자 (응답 쪽 잡음 10 %)', () => {
  it('반공진 H1·H2: 16장 0.275·1.23, 256장 0.153·1.90', () => {
    const k = FREQS.indexOf(ANTI_F);
    const at = (frames: number) => {
      const { x, y } = frfFrames({ frames, outputNoise: 0.1 });
      const g = averageCross(x, y);
      return [cxAbs(frfH1(g))[k], cxAbs(frfH2(g))[k]];
    };
    const [a1, a2] = at(16);
    const [b1, b2] = at(256);
    expect(a1).toBeCloseTo(0.275, 3);
    expect(a2).toBeCloseTo(1.23, 2);
    expect(b1).toBeCloseTo(0.153, 3);
    expect(b2).toBeCloseTo(1.90, 2);
  });
});
