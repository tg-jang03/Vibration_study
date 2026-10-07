import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { peakNear } from '../lib/dsp/envelope';
import { analyzeEnvelope, analyzeKurtogram, BRG, DEFAULT_ENV_SIGNAL as D, envSignal, G } from '../lib/envelopeDemo';
import * as F from './p5-6';

const V = F.P56_VALUES;
const g = (v: number) => v / G;

describe('P5-6 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('6205 · 3000 rpm: BPFO 179.2 Hz(간격 5.58 ms), BPFI 270.8 Hz, 3.3 kHz는 BPFO의 18배 남짓', () => {
    expect(f(V.bpfo, 4)).toBe('179.2');
    expect(f(1000 / V.bpfo, 3)).toBe('5.58');
    expect(f(V.bpfi, 4)).toBe('270.8');
    expect(Math.floor(3300 / V.bpfo)).toBe(18);
  });

  it('그림 1: 기어 1.00 g, 3.3 kHz 언덕 0.045 g, BPFO 자리 0.009 g, 1X 0.099 g', () => {
    expect(f(g(V.rawGear), 3)).toBe('1');
    expect(f(g(V.rawHump), 2)).toBe('0.045');
    expect(f(g(V.rawAtBpfo), 1)).toBe('0.009');
    expect(f(g(V.rawAt1X), 2)).toBe('0.099');
  });

  it('그림 2: 좋은 대역의 BPFO 0.11 g, 2배·3배 0.072·0.026 g, 바닥의 약 180배', () => {
    expect([f(g(V.good.lines[0]), 2), f(g(V.good.lines[1]), 2), f(g(V.good.lines[2]), 2)]).toEqual(['0.11', '0.072', '0.026']);
    const r = V.good.lines[0] / V.good.floor;
    expect(r).toBeGreaterThan(170);
    expect(r).toBeLessThan(190);
    expect(V.good.topHz).toBeCloseTo(179, 0);
  });

  it('그림 4·랩: 기어 대역 → 가장 큰 줄 50 Hz, 잡음 대역 → 바닥의 2배쯤, 잡음 없으면 9.5배, 250 Hz 폭 → 2배 줄 0.005 g', () => {
    expect(V.gearBand.topHz).toBe(50);
    expect(f(V.noiseBand.lines[0] / V.noiseBand.floor, 2)).toBe('2.2');
    const quiet = analyzeEnvelope(envSignal({ ...D, hiNoise: 0 }), 5500, 6500);
    expect(f(quiet.lines[0] / quiet.floor, 2)).toBe('9.5');
    const narrow = analyzeEnvelope(envSignal(D), 3175, 3425);
    expect(f(g(narrow.lines[1]), 1)).toBe('0.005');
  });

  it('그림 5: 첨도 잡음 2.93 · 정현파 1.5 · 충격 17.9, 결함 충격만 8.91, 원신호 2.31', () => {
    expect(V.kdemo.map((v, i) => f(v, i === 1 ? 2 : 3))).toEqual(['2.93', '1.5', '17.9']);
    expect(f(V.bearingKurtosis, 3)).toBe('8.91');
    expect(f(V.rawKurtosis, 3)).toBe('2.31');
  });

  it('그림 6: SK는 기어 대역에서 음수, 2.8 ~ 4.5 kHz에서 양수', () => {
    const sk = V.kg.sk;
    sk.freq.forEach((fr, k) => {
      if (fr >= 2816 && fr <= 4352) expect(sk.sk[k]).toBeGreaterThan(0.2);
      if (fr >= 1024 && fr <= 1280) expect(sk.sk[k]).toBeLessThan(-0.5);
    });
  });

  it('그림 7·랩: Kurtogram 레벨 3 · 2560 ~ 3584 Hz · SK 1.01, 그 대역 BPFO 줄은 바닥의 약 150배', () => {
    expect(V.kg.kg.best).toMatchObject({ level: 3, f1: 2560, f2: 3584, bw: 1024 });
    expect(f(V.kg.kg.best.sk, 3)).toBe('1.01');
    expect(Math.round(V.kg.best.lines[0] / V.kg.best.floor / 10) * 10).toBe(150);
  });

  it('랩 SK 과제: 0.1 g → 같은 대역·SK 0.3쯤, 결함 없음 → 좁은 칸 SK 0.3쯤, 기어 0 → 2048 ~ 4096 Hz SK 2.5, 기어 3 g → 그대로', () => {
    const small = analyzeKurtogram({ ...D, impact: 0.1 * G });
    expect(small.kg.best).toMatchObject({ f1: 2560, f2: 3584 });
    expect(f(small.kg.best.sk, 1)).toBe('0.3');
    const none = analyzeKurtogram({ ...D, fault: 'none' });
    expect(none.kg.best.level).toBe(6);
    expect(f(none.kg.best.sk, 1)).toBe('0.3');
    const noGear = analyzeKurtogram({ ...D, gearScale: 0 });
    expect(noGear.kg.best).toMatchObject({ f1: 2048, f2: 4096 });
    expect(f(noGear.kg.best.sk, 2)).toBe('2.5');
    expect(analyzeKurtogram({ ...D, gearScale: 3 }).kg.best).toMatchObject({ f1: 2560, f2: 3584 });
  });

  it('그림 8: 내륜 — BPFI 양옆 1X 측대역과 1X 줄', () => {
    const ib = V.innerKg.best;
    const bpfi = ib.lines[0];
    const sbLo = peakNear(ib.env.freq, ib.env.amp, BRG.bpfi - 50, 3);
    const sbHi = peakNear(ib.env.freq, ib.env.amp, BRG.bpfi + 50, 3);
    const one = peakNear(ib.env.freq, ib.env.amp, 50, 2);
    expect(sbLo / ib.floor).toBeGreaterThan(10);
    expect(sbHi / ib.floor).toBeGreaterThan(10);
    expect(one).toBeGreaterThan(0.5 * bpfi);
  });
});
