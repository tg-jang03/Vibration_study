import { describe, expect, it } from 'vitest';
import { P112_VALUES as V, rig, fsCheck, steps, kurtogramFig, envelopeFig, innerBallFig, spikyFig } from './p11-2';

/** P11-2 본문·캡션이 인용하는 숫자 (합성 예시, lib/datafile/example.ts) */
describe('P11-2 그림 숫자', () => {
  it('그림 id가 겹치지 않는다', () => {
    const ids = [rig, fsCheck, steps, kurtogramFig, envelopeFig, innerBallFig, spikyFig].map((f) => f.id);
    expect(new Set(ids).size).toBe(7);
  });
  it('§2 f_s 확인: 1X 29.95 Hz, 48 kHz로 잘못 넣으면 약 120 Hz', () => {
    expect(V.fr).toBeCloseTo(29.95, 2);
    expect(Math.abs(V.wrong1x - 4 * V.fr)).toBeLessThan(6);
  });
  it('§3 예시 B: 충격 간격 9.41 ms, 첨도 약 8.1, 스펙트럼의 BPFO 줄은 바닥의 약 3배로 1X보다 작고, 둔덕 3.2 kHz 근처', () => {
    expect(V.periodMs).toBeCloseTo(9.41, 2);
    expect(V.kurtB).toBeCloseTo(8.1, 1);
    expect(V.spBpfoRatio).toBeGreaterThan(2.8);
    expect(V.spBpfoRatio).toBeLessThan(3.8);
    expect(V.spBpfoBelow1x).toBe(true);
    expect(V.humpHz).toBeGreaterThan(3000);
    expect(V.humpHz).toBeLessThan(3400);
  });
  it('§3 Kurtogram 1.5 ~ 4.5 kHz · SK 3.83, 엔벨로프 106.3 Hz 약 200배 vs 300 ~ 900 Hz 약 25배', () => {
    expect(V.bandB).toEqual([1500, 4500]);
    expect(V.skB).toBeCloseTo(3.83, 2);
    expect(V.bpfoB).toBeCloseTo(106.3, 1);
    expect(V.ratioB).toBeGreaterThan(190);
    expect(V.ratioB).toBeLessThan(215);
    expect(V.ratioLow).toBeGreaterThan(22);
    expect(V.ratioLow).toBeLessThan(28);
  });
  it('§4 예시 C: BPFI 163.2 Hz와 ±1X 측대역, BPFO 3배 칸은 우연히 크고 1배는 작다 · 예시 D: 볼 140.4 Hz, FTF 11.8 Hz', () => {
    expect(V.innerHz).toBeCloseTo(163.2, 0);
    expect(V.innerRatio).toBeGreaterThan(100);
    expect(V.innerSb).toBeGreaterThan(30);
    expect(V.cBpfo3).toBeGreaterThan(50);
    expect(V.cBpfo1).toBeLessThan(4);
    expect(V.ballHz).toBeCloseTo(140.4, 0);
    expect(V.ballRatio).toBeGreaterThan(80);
    expect(V.ftfHz).toBeCloseTo(11.8, 0);
    expect(V.ftfRatio).toBeGreaterThan(40);
  });
  it('§6 예시 E: Kurtogram은 5.25 ~ 6 kHz(SK 약 33), 결함 대역의 SK는 4 아래, 그 대역에선 6배 아래 · 직접 고르면 약 200배', () => {
    expect(V.eBand).toEqual([5250, 6000]);
    expect(V.eSk).toBeGreaterThan(30);
    expect(V.eResonanceSk).toBeLessThan(4);
    expect(V.eTop).toBeLessThan(6);
    expect(V.eManual).toBeGreaterThan(190);
  });
});
