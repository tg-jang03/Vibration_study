import { describe, expect, it } from 'vitest';
import { bandRms, COMP, compLines, compSlowSignals, compState, FLOW_CASES, npshr, pressureRatio, PUMP_FR, PUMP_VPF, pumpEff, pumpHead, pumpLevels, pumpSignals, rmsSpectrum } from './flow';

const lv = (s: Parameters<typeof pumpLevels>[0], q: number, up = 0) => pumpLevels(s, { q, suctionUp: up });

describe('유체·공력 원인 모델 (P7-8, LAB-FLOW-01)', () => {
  it('펌프: 3575 rpm·날개 7장 → VPF 417.08 Hz, BEP에서 양정·효율 1, 필요 NPSH 1', () => {
    expect(PUMP_VPF).toBeCloseTo(7 * 3575 / 60, 12);
    expect([pumpHead(1), pumpEff(1), npshr(1)]).toEqual([1, 1, 1]);
    expect(pumpEff(0.6)).toBeLessThan(1);
  });

  it('날개 통과는 BEP에서 가장 작고 간극이 절반이면 2배, 재순환은 60 % 아래에서만', () => {
    expect(lv('normal', 1).vpf).toBeCloseTo(0.6, 12);
    expect(lv('normal', 0.4).vpf).toBeGreaterThan(lv('normal', 0.8).vpf);
    expect(lv('gap', 1).vpf / lv('normal', 1).vpf).toBeCloseTo(2, 12);
    expect([lv('normal', 0.6).recirc, lv('normal', 0.9).recirc]).toEqual([0, 0]);
    expect(lv('normal', 0.3).recirc).toBeCloseTo(2.5, 12);
  });

  it('1X: 수력 불평형은 유량에 반응하고 기계 불평형은 일정', () => {
    expect(lv('hydraulic', 1).oneX).toBeLessThan(lv('hydraulic', 0.6).oneX);
    expect(lv('unbalance', 0.4).oneX).toBe(lv('unbalance', 1.2).oneX);
  });

  it('캐비테이션: 흡입 여유 1.2 아래에서 시작, 흡입 압력을 올리거나 유량을 줄이면 사라짐', () => {
    expect(lv('lowSuction', 1).cavit).toBeCloseTo(1, 12);
    expect(lv('lowSuction', 1, 0.2).cavit).toBe(0);
    expect(lv('lowSuction', 0.7).cavit).toBe(0);
    expect(lv('normal', 1.3).cavit).toBe(0);
    expect(lv('normal', 1.4).cavit).toBeGreaterThan(0);
  });

  it('신호: 가속도 대역 RMS ≈ 캐비테이션 크기, 속도 스펙트럼의 VPF 줄 ≈ 모델값', () => {
    const s = pumpSignals('lowSuction', { q: 1, suctionUp: 0 });
    const a = rmsSpectrum(s.acc, s.fs, 8000);
    expect(bandRms(a.freq, a.amp, 2000, 6000)).toBeCloseTo(1, 1);
    const v = rmsSpectrum(s.vel, s.fs, 1000);
    const k = v.freq.findIndex((f) => Math.abs(f - PUMP_VPF) < 0.6);
    expect(Math.max(v.amp[k - 1], v.amp[k], v.amp[k + 1])).toBeGreaterThan(0.5);
    expect(PUMP_FR).toBeCloseTo(59.583, 3);
  });

  it('압축기: 설계점 압력비 2.29, 서지선에서 꼭대기 3.0, stall은 0.72 아래, 서지는 0.55 아래', () => {
    expect(pressureRatio(COMP.surgeLine)).toBe(3);
    expect(pressureRatio(1)).toBeCloseTo(2.29125, 12);
    expect(compState({ phi: 0.72, antiSurge: false }).stall).toBeNull();
    const st = compState({ phi: 0.64, antiSurge: true }).stall!;
    expect([st.hz, st.order, st.amp]).toEqual([expect.closeTo(29.4, 9), expect.closeTo(0.196, 9), expect.closeTo(8, 9)]);
    expect(compState({ phi: 0.5, antiSurge: false }).surge).toBe(true);
    const anti = compState({ phi: 0.5, antiSurge: true });
    expect([anti.surge, anti.phiEff, anti.stall !== null]).toEqual([false, 0.62, true]);
  });

  it('서지: 0.7 Hz로 압력이 오르내리고 축방향 위치가 약 120 µm 튐, 서지 성분은 낮은 주파수 무리', () => {
    const s = compSlowSignals({ phi: 0.5, antiSurge: false });
    expect(Math.max(...s.press) - Math.min(...s.press)).toBeGreaterThan(35);
    expect(Math.min(...s.axial)).toBeLessThan(-115);
    const n = compSlowSignals({ phi: 1, antiSurge: false });
    expect(Math.max(...n.axial) - Math.min(...n.axial)).toBeLessThan(5);
    expect(compLines({ phi: 0.5, antiSurge: false }).find((l) => l.name === '서지')!.hz).toBe(0.7);
  });

  it('숨은 케이스 7개', () => {
    expect(FLOW_CASES).toHaveLength(7);
  });
});
