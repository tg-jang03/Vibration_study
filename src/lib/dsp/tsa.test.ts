import { describe, expect, it } from 'vitest';
import { createRng } from './random';
import { evaluate, type SignalSpec } from './signal';
import { removeOrders, synchronousAverage, tsaGain } from './tsa';

const SPR = 256; // 한 바퀴 샘플 수
const theta = (n: number) => (2 * Math.PI * n) / SPR;

/** 한 바퀴 SPR개 샘플로 revs바퀴 동안 cos(ρθ + φ)를 만든다 (θ는 바퀴가 지나도 계속 커지는 회전 각) */
function tone(ratio: number, revs: number, amp = 1, phase = 0): Float64Array {
  return Float64Array.from({ length: SPR * revs }, (_, i) => amp * Math.cos(ratio * theta(i) + phase));
}

describe('synchronousAverage', () => {
  it('동기 성분(정수 차수)은 그대로 남는다 — 이득 1', () => {
    const x = tone(15, 10, 1.3, 0.4);
    const avg = synchronousAverage(x, SPR);
    for (let n = 0; n < SPR; n++) expect(avg[n]).toBeCloseTo(1.3 * Math.cos(15 * theta(n) + 0.4), 12);
  });

  it('비동기 성분은 해석해 (1/M)Σ e^(j2πρm)배가 된다', () => {
    const ratio = 13.4;
    const m = 16;
    const avg = synchronousAverage(tone(ratio, m, 1, 0.7), SPR, m);
    // S = (1/M) Σ e^(j2πρm) → 평균 파형 = Re{ e^(j(ρθ + φ)) · S }
    let sRe = 0;
    let sIm = 0;
    for (let r = 0; r < m; r++) {
      sRe += Math.cos(2 * Math.PI * ratio * r) / m;
      sIm += Math.sin(2 * Math.PI * ratio * r) / m;
    }
    for (let n = 0; n < SPR; n += 7) {
      const a = ratio * theta(n) + 0.7;
      expect(avg[n]).toBeCloseTo(Math.cos(a) * sRe - Math.sin(a) * sIm, 12);
    }
    expect(Math.hypot(sRe, sIm)).toBeCloseTo(tsaGain(ratio, m), 12);
  });

  it('백색 잡음은 RMS가 σ/√M로 줄어든다 (σ = 1, M = 64 → 0.125 ±12 %)', () => {
    const rng = createRng(20261006);
    const m = 64;
    const x = Float64Array.from({ length: SPR * m }, () => rng.normal());
    const avg = synchronousAverage(x, SPR);
    const rms = Math.sqrt(avg.reduce((s, v) => s + v * v, 0) / SPR);
    expect(rms).toBeGreaterThan(0.125 * 0.88);
    expect(rms).toBeLessThan(0.125 * 1.12);
  });

  it('잘못된 입력은 오류', () => {
    expect(() => synchronousAverage(new Float64Array(100), 64, 2)).toThrow(RangeError);
    expect(() => synchronousAverage(new Float64Array(100), 2.5)).toThrow(RangeError);
    expect(() => synchronousAverage(new Float64Array(10), 64)).toThrow(RangeError);
  });
});

describe('tsaGain (빗살 모양 통과 특성)', () => {
  it('정수배는 1, 정수에서 1/M 벗어나면 0', () => {
    expect(tsaGain(15, 64)).toBe(1);
    expect(tsaGain(13.05, 20)).toBeLessThan(1e-9);
    expect(tsaGain(13.25, 4)).toBeLessThan(1e-9);
  });

  it('Contents §6 기준값: ρ = 13.4 → M = 16에서 1/16, ρ = 13.05 → M = 16에서 0.235, 64에서 0.059', () => {
    expect(tsaGain(13.4, 16)).toBeCloseTo(1 / 16, 12);
    expect(tsaGain(13.05, 16)).toBeCloseTo(0.2348, 4);
    expect(tsaGain(13.05, 64)).toBeCloseTo(0.0587, 4);
  });
});

describe('removeOrders (Residual)', () => {
  it('지정한 차수만 정확히 빠진다', () => {
    const rev = Float64Array.from({ length: SPR }, (_, n) => Math.cos(15 * theta(n)) + 0.5 * Math.cos(7 * theta(n) + 1) + 0.2);
    const res = removeOrders(rev, [15]);
    for (let n = 0; n < SPR; n++) expect(res[n]).toBeCloseTo(0.5 * Math.cos(7 * theta(n) + 1) + 0.2, 12);
    const noMean = removeOrders(rev, [0, 15]);
    for (let n = 0; n < SPR; n++) expect(noMean[n]).toBeCloseTo(0.5 * Math.cos(7 * theta(n) + 1), 12);
  });

  it('범위를 벗어난 차수는 오류', () => {
    expect(() => removeOrders(new Float64Array(SPR), [129])).toThrow(RangeError);
    expect(() => removeOrders(new Float64Array(SPR), [1.5])).toThrow(RangeError);
  });
});

describe('감쇠 임펄스열 성분 (signal.ts)', () => {
  const spec: SignalSpec = { components: [{ type: 'impulses', rate: 20, amp: 1.2, ringFreq: 700, decay: 0.0025, offset: 1 / 60 }] };

  it('첫 충격 전에는 0, 충격 순간에도 0 (sin으로 시작)', () => {
    expect(evaluate(spec, 0.01)).toBe(0);
    expect(evaluate(spec, 1 / 60)).toBeCloseTo(0, 12);
  });

  it('울림 1/4 주기 뒤 = amp·e^(−τ/decay), 다음 바퀴에 같은 모양이 되풀이된다', () => {
    const tau = 1 / (4 * 700);
    expect(evaluate(spec, 1 / 60 + tau)).toBeCloseTo(1.2 * Math.exp(-tau / 0.0025), 12);
    for (const t of [0.02, 0.031, 0.044]) expect(evaluate(spec, t + 0.05)).toBeCloseTo(evaluate(spec, t + 0.1), 10);
  });
});
