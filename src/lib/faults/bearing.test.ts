import { describe, expect, it } from 'vitest';
import { peakNear } from '../dsp/envelope';
import { singleSidedSpectrum } from '../dsp/spectrum';
import { BEARING_6205, bearingFrequencies } from '../machine/frequencies';
import { analyzeBearing, bearingSignal, BRG_DEMO, DEMO_ACTUAL, DEMO_FR, envFloor, ruleOfThumb, slippedFrequencies, toneAmp, type BearingFault } from './bearing';
import { synthesize, MACHINES } from './synth';

const deg = (a: number) => (a * Math.PI) / 180;

describe('결함 주파수: 접촉각·미끄럼·어림값 (P7-5)', () => {
  it('미끄럼 0이면 bearingFrequencies와 같고, BPFO + BPFI = N_r·f_r는 접촉각·미끄럼과 상관없다', () => {
    const fr = 50;
    const a = bearingFrequencies(BEARING_6205, fr);
    const b = slippedFrequencies(BEARING_6205, fr, 0);
    expect(b.bpfo).toBeCloseTo(a.bpfo, 10);
    expect(b.bsf2).toBeCloseTo(a.bsf2, 10);
    for (const alpha of [0, 15, 40]) {
      for (const slip of [0, 0.02]) {
        const f = slippedFrequencies({ ...BEARING_6205, contactAngle: deg(alpha) }, fr, slip);
        expect(f.bpfo + f.bpfi).toBeCloseTo(9 * fr, 9);
      }
    }
  });

  it('접촉각이 커지면 BPFO는 오르고 BPFI는 내린다 (cos α ↓ → FTF → f_r/2)', () => {
    const f0 = bearingFrequencies(BEARING_6205, 1);
    const f40 = bearingFrequencies({ ...BEARING_6205, contactAngle: deg(40) }, 1);
    expect(f40.bpfo).toBeGreaterThan(f0.bpfo);
    expect(f40.bpfi).toBeLessThan(f0.bpfi);
    // 해석해: FTF = (1/2)(1 − (d/D)cos α)
    expect(f40.ftf).toBeCloseTo(0.5 * (1 - (7.94 / 39.04) * Math.cos(deg(40))), 12);
  });

  it('미끄럼 s: BPFO는 정확히 (1 − s)배, BPFI는 높아진다', () => {
    const a = bearingFrequencies(BEARING_6205, 60);
    const b = slippedFrequencies(BEARING_6205, 60, 0.02);
    expect(b.bpfo / a.bpfo).toBeCloseTo(0.98, 12);
    expect(b.bpfi).toBeGreaterThan(a.bpfi);
  });

  it('어림값 0.4·N_r·f_r, 0.6·N_r·f_r은 6205(α 0, d/D 0.203)에서 0.5 % 안', () => {
    const a = bearingFrequencies(BEARING_6205, 1);
    const r = ruleOfThumb(9, 1);
    expect(Math.abs(r.bpfo / a.bpfo - 1)).toBeLessThan(0.005);
    expect(Math.abs(r.bpfi / a.bpfi - 1)).toBeLessThan(0.005);
  });
});

describe('toneAmp: 칸 사이에 걸린 성분도 제 크기로 (Hann, ENBW 1.5칸)', () => {
  it('59.58 Hz(0.58칸 어긋남) 진폭 2의 정현파 → 2 (1 % 안), 바로 읽은 칸은 가리비 손실', () => {
    const fs = 4096;
    const n = 4096;
    const x = Float64Array.from({ length: n }, (_, i) => 2 * Math.cos((2 * Math.PI * 59.583 * i) / fs));
    const s = singleSidedSpectrum({ fs, x }, { window: 'hann' });
    expect(toneAmp(s.frequency, s.amplitude, 59.583)).toBeCloseTo(2, 1);
    expect(Math.abs(toneAmp(s.frequency, s.amplitude, 59.583) - 2)).toBeLessThan(0.02);
    expect(Math.max(...Array.from(s.amplitude))).toBeLessThan(1.9);
  });
});

describe('베어링 결함 신호 모델 (LAB-BRG-02)', () => {
  it('같은 위치·단계면 같은 신호 (시드 고정), 길이 = f_s × 1 s', () => {
    const a = bearingSignal('outer', 2);
    expect(a.acc.length).toBe(BRG_DEMO.n);
    expect(bearingSignal('outer', 2).acc[1234]).toBe(a.acc[1234]);
  });

  it('위치마다 엔벨로프(3단계, 공진 대역)의 결함 줄이 바닥의 20배를 넘고, 내륜 ±1X·볼 ±FTF 측대역이 선다', () => {
    const b = DEMO_ACTUAL;
    const rate: Record<BearingFault, number> = { outer: b.bpfo, inner: b.bpfi, ball: b.bsf2, cage: b.ftf };
    for (const f of ['outer', 'inner', 'ball', 'cage'] as BearingFault[]) {
      const e = analyzeBearing(bearingSignal(f, 3)).env.res;
      expect(peakNear(e.freq, e.amp, rate[f], 1.5) / envFloor(e)).toBeGreaterThan(20);
    }
    const ei = analyzeBearing(bearingSignal('inner', 3)).env.res;
    const fl = envFloor(ei);
    expect(peakNear(ei.freq, ei.amp, b.bpfi - DEMO_FR, 1.5) / fl).toBeGreaterThan(20);
    expect(peakNear(ei.freq, ei.amp, b.bpfi + DEMO_FR, 1.5) / fl).toBeGreaterThan(20);
    const eb = analyzeBearing(bearingSignal('ball', 3)).env.res;
    expect(peakNear(eb.freq, eb.amp, b.bsf2 - b.ftf, 1.5) / envFloor(eb)).toBeGreaterThan(20);
    // 외륜은 1X 측대역이 없다
    const eo = analyzeBearing(bearingSignal('outer', 3)).env.res;
    expect(peakNear(eo.freq, eo.amp, b.bpfo + DEMO_FR, 1.5) / envFloor(eo)).toBeLessThan(5);
  });

  it('단계마다 결함이 처음 보이는 곳: 1 초음파 → 2 공진 대역 → 3 속도 → 4 흐려지고 1X 증가', () => {
    const r = [0, 1, 2, 3, 4].map((s) => analyzeBearing(bearingSignal('outer', s as 0 | 1 | 2 | 3 | 4)).readouts);
    expect(r[0].envRatio.ultra).toBeLessThan(5);
    expect(r[1].envRatio.ultra).toBeGreaterThan(20);
    expect(r[1].envRatio.res).toBeLessThan(5);
    expect(r[2].envRatio.res).toBeGreaterThan(20);
    expect(r[2].velDefect).toBeLessThan(0.1);
    expect(r[3].velDefect).toBeGreaterThan(0.5);
    expect(r[4].envRatio.res).toBeLessThan(r[3].envRatio.res / 10);
    expect(r[4].vel1X).toBeGreaterThan(2 * r[0].vel1X);
    expect(r[3].kurtosis).toBeGreaterThan(r[4].kurtosis);
    expect(r[2].kurtosis).toBeGreaterThan(r[1].kurtosis);
    // 1단계: 일반 측정(0 ~ 10 kHz)의 RMS·속도 overall은 건전할 때와 1 % 안
    expect(Math.abs(r[1].accRmsG / r[0].accRmsG - 1)).toBeLessThan(0.01);
    expect(Math.abs(r[1].velOverall / r[0].velOverall - 1)).toBeLessThan(0.01);
  });
});

describe('합성기에 더한 볼·케이지 결함 (LAB-FAULT-01)', () => {
  it('볼 결함은 엔벨로프에 2×BSF, 케이지 결함은 속도 스펙트럼에 FTF가 선다', async () => {
    const { envelopeSpectrum, spectrumOf } = await import('../dsp/envelope');
    const { velocitySpectrum, peakAt } = await import('./synth');
    const p = MACHINES.pump;
    const b = bearingFrequencies({ ...BEARING_6205 }, p.rpm / 60);
    const ball = synthesize(p, { bearingBall: 0.6 });
    const e = envelopeSpectrum(spectrumOf(ball.acc.V), ball.fs, 2800, 3800, 1000);
    expect(peakNear(e.freq, e.amp, b.bsf2, 1.5) / envFloor(e)).toBeGreaterThan(10);
    const cage = synthesize(p, { bearingCage: 0.6 });
    const v = velocitySpectrum(cage.acc.V, cage.fs, 1000);
    const vh = velocitySpectrum(synthesize(p, {}).acc.V, cage.fs, 1000);
    expect(peakAt(v.freq, v.amp, b.ftf, 1)).toBeGreaterThan(5 * peakAt(vh.freq, vh.amp, b.ftf, 1));
  });
});
