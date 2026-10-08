import { describe, expect, it } from 'vitest';
import { causesFor, countPeaks, ELEC_CASES, ELEC_MACHINES as EM, ELEC_SIG, elecLines, elecSpectrogram, elecSpectrum, electricRatio, mechRatio, motorFreqs, peakIn, speedRatio } from './electric';

describe('전기 원인 모델 (P7-7, LAB-ELEC-01)', () => {
  it('유도전동기: 동기속도 120·LF/P, 슬립 ∝ 부하, PPF = P·f_slip = 2LF − P·f_r', () => {
    for (const m of [EM.ind2, EM.ind4]) {
      for (const load of [20, 60, 100]) {
        const q = motorFreqs(m, load);
        expect(q.fsync).toBeCloseTo((2 * m.lineHz) / m.poles, 12);
        expect(q.ppf).toBeCloseTo(m.poles * q.fslip, 12);
        expect(q.ppf).toBeCloseTo(q.twoLF - m.poles * q.fr, 9);
      }
      expect(motorFreqs(m, 100).rpm).toBeCloseTo(m.fullLoadRpm, 9);
    }
    const q = motorFreqs(EM.ind2, 60);
    expect([q.rpm, q.fr, q.slip * 100]).toEqual([expect.closeTo(3576, 9), expect.closeTo(59.6, 9), expect.closeTo(2 / 3, 9)]);
    expect([q.fslip, q.ppf, q.pX]).toEqual([expect.closeTo(0.4, 9), expect.closeTo(0.8, 9), expect.closeTo(119.2, 9)]);
  });

  it('동기 발전기: 슬립 0 → 1X = LF, 2X = 2×LF, PPF 0, 로터바 원인 없음', () => {
    const q = motorFreqs(EM.syn2, 100);
    expect([q.fr, q.pX, q.ppf]).toEqual([60, 120, 0]);
    expect(causesFor(EM.syn2)).not.toContain('rotorBar');
    expect(causesFor(EM.ind2)).toContain('dynEcc');
  });

  it('스펙트럼: 정수 주기 줄은 제 크기(Hann), 2×LF 3.2 mm/s', () => {
    const s = elecSpectrum(EM.ind2, elecLines(EM.ind2, 'stator', 60), 8);
    expect(peakIn(s.freq, s.amp, 119.9, 120.1).a).toBeCloseTo(3.2, 1);
    expect(s.df).toBeCloseTo(0.125, 12);
  });

  it('로터바 측대역: 2 s 기록이면 한 덩어리, 8 s면 세 줄 / 부하가 줄면 측대역이 작다', () => {
    const lines = elecLines(EM.ind2, 'rotorBar', 60);
    const s2 = elecSpectrum(EM.ind2, lines, 2);
    const s8 = elecSpectrum(EM.ind2, lines, 8);
    expect(countPeaks(s2.freq, s2.amp, 57, 62)).toBe(1);
    expect(countPeaks(s8.freq, s8.amp, 57, 62)).toBe(3);
    const sb = (load: number) => elecLines(EM.ind2, 'rotorBar', load).find((l) => l.name === '1X + PPF')!.amp;
    expect(sb(30) / sb(90)).toBeCloseTo(1 / 3, 12);
  });

  it('시험: 전원 차단 0.5 s 뒤 전기 e^−5, 회전수 1/(1 + 0.5/3), 기계 그 제곱 / 발전기는 회전수 유지·계자 τ 0.8 s', () => {
    expect(electricRatio(EM.ind2, 0.5)).toBeCloseTo(Math.exp(-5), 12);
    expect(speedRatio(EM.ind2, 0.5)).toBeCloseTo(6 / 7, 12);
    expect(mechRatio(EM.ind2, 0.5)).toBeCloseTo(36 / 49, 12);
    expect([speedRatio(EM.syn2, 3), mechRatio(EM.syn2, 3)]).toEqual([1, 1]);
    expect(electricRatio(EM.syn2, 0.8)).toBeCloseTo(Math.exp(-1), 12);
    expect(electricRatio(EM.ind2, -1)).toBe(1);
  });

  it('스펙트로그램: 0.5 s 프레임(Δf 2 Hz), 차단 전 2X+2×LF 칸이 맥놀이로 출렁이고 차단 뒤 120 Hz 칸이 비어 간다', () => {
    const sg = elecSpectrogram(EM.ind2, elecLines(EM.ind2, ['stator', 'misalign'], 60), 140);
    expect(sg.df).toBe(2);
    expect(sg.times[0]).toBeCloseTo(ELEC_SIG.t0 + 0.25, 12);
    const k120 = sg.freqs.indexOf(120);
    const before = sg.amp.filter((_, m) => sg.times[m] < -0.3).map((r) => r[k120]);
    const after = sg.amp.filter((_, m) => sg.times[m] > 1.5).map((r) => r[k120]);
    expect(Math.max(...before) / Math.min(...before)).toBeGreaterThan(5);
    expect(Math.max(...after)).toBeLessThan(0.2);
  });

  it('숨은 케이스 7개: 기계마다 고를 수 있는 원인', () => {
    expect(ELEC_CASES).toHaveLength(7);
    for (const c of ELEC_CASES) expect(causesFor(EM[c.machine])).toContain(c.cause);
  });
});
