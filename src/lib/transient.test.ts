import { describe, expect, it } from 'vitest';
import { cascadeLines, countIn, runupResponse, runupRpm, runupTimeAt, RUNUP_ROTOR, sampleByRpm, sampleByTime, smearDemo } from './transient';

const um = (m: number) => m * 1e6;

describe('예시 기동 프로파일과 응답 (P3-5)', () => {
  it('300 → 1500 rpm (10 rpm/s), 임계 구간 1500 → 2500 (20 rpm/s), 3600 rpm에 320 s', () => {
    expect(runupRpm(0)).toBe(300);
    expect(runupRpm(120)).toBeCloseTo(1500, 9);
    expect(runupRpm(145)).toBeCloseTo(2000, 9);
    expect(runupRpm(320)).toBeCloseTo(3600, 9);
    expect(runupRpm(400)).toBe(3600);
    for (const r of [300, 900, 2000, 2400, 3000, 3600]) expect(runupRpm(runupTimeAt(r))).toBeCloseTo(r, 6);
  });

  it('운전 회전수에서 20 µm pp, 임계에서 위상 90°, 최대 138.9 µm pp (= 20 × AF 10.01 ÷ 1.442)', () => {
    expect(um(runupResponse(3600).amp)).toBeCloseTo(20, 9);
    expect((runupResponse(2000).lag * 180) / Math.PI).toBeCloseTo(90, 9);
    const z = RUNUP_ROTOR.zeta;
    const rPeak = 1 / Math.sqrt(1 - 2 * z * z);
    expect(um(runupResponse(2000 * rPeak).amp)).toBeCloseTo(138.89, 1);
  });
});

describe('Δt 트리거 vs Δrpm 트리거', () => {
  it('10초마다: 33점, 1900 ~ 2100 rpm 안에 2점, 읽은 최대 104.2 µm pp (참 최대의 75 %)', () => {
    const s = sampleByTime(10);
    expect(s.length).toBe(33);
    expect(countIn(s, 1900, 2100)).toBe(2);
    expect(um(Math.max(...s.map((p) => p.amp)))).toBeCloseTo(104.2, 1);
  });

  it('10 rpm마다: 331점, 같은 구간에 21점, 최대 138.7 µm pp', () => {
    const s = sampleByRpm(10);
    expect(s.length).toBe(331);
    expect(countIn(s, 1900, 2100)).toBe(21);
    expect(um(Math.max(...s.map((p) => p.amp)))).toBeCloseTo(138.7, 1);
    expect(() => sampleByRpm(0)).toThrow(RangeError);
  });
});

describe('동기 샘플링 (회전수가 20 rpm/s로 오르는 프레임)', () => {
  const d = smearDemo();
  const peakIn = (a: Float64Array, x: Float64Array, lo: number, hi: number) => Math.max(...Array.from(a).filter((_, k) => x[k] >= lo && x[k] <= hi));

  it('한 바퀴에 같은 수로 찍으면 1X·2X가 차수 1·2에 정확히 (25·7.5 µm), 고정 f_s면 퍼져 절반 남짓', () => {
    expect(um(peakIn(d.orderAmp, d.order, 0.99, 1.01))).toBeCloseTo(25, 6);
    expect(um(peakIn(d.orderAmp, d.order, 1.99, 2.01))).toBeCloseTo(7.5, 6);
    expect(um(peakIn(d.fixedAmp, d.fixedFreq, 25, 40))).toBeCloseTo(13.3, 1);
    expect(um(peakIn(d.fixedAmp, d.fixedFreq, 55, 75))).toBeCloseTo(2.86, 1);
    expect(d.rpmEndFixed).toBeCloseTo(2028, 6);
  });
});

describe('Cascade 성분', () => {
  it('1X·2X는 회전수를 따라가고, 95 Hz 성분은 제자리', () => {
    const a = cascadeLines(1200);
    const b = cascadeLines(3000);
    expect(a[0].f).toBeCloseTo(20, 9);
    expect(b[1].f).toBeCloseTo(100, 9);
    expect(a[2].f).toBe(95);
    expect(b[2].f).toBe(95);
  });
});
