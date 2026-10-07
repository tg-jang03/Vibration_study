import { describe, expect, it } from 'vitest';
import { candidatesAt, FAULTS, type MachineInfo } from './catalog';
import { cepstrumEstimate, estimateRpm, harmonicScore, refineFundamental, syncRpm } from './rpm';
import { hvLagDeg, MACHINES, peakAt, synthesize, velocitySpectrum } from './synth';
import { createRng } from '../dsp/random';

const pump = MACHINES.pump;
const fr = pump.rpm / 60;
const info: MachineInfo = { fr, lineHz: 60, blades: 7, teeth: 0, balls: 9, poles: 2 };

describe('결함 목록과 주파수 → 원인 후보', () => {
  it('모든 원인이 증거 5요소와 확인 방법·페이지를 가진다', () => {
    for (const f of FAULTS) for (const k of ['frequency', 'amplitude', 'phase', 'direction', 'condition', 'confirm', 'page'] as const) expect(f[k].length).toBeGreaterThan(0);
  });

  it('1X에는 불평형·정렬 불량 등 여러 후보, 120 Hz(2×LF)에는 전기가 가장 가깝고 0.83 Hz 옆에 2X 후보', () => {
    const at1 = candidatesAt(fr, info).map((c) => c.fault.id);
    expect(at1).toEqual(expect.arrayContaining(['unbalance', 'misalignment', 'bow', 'resonance']));
    const at120 = candidatesAt(120, info);
    expect(at120[0].fault.id).toBe('electrical2LF');
    expect(at120.find((c) => c.fault.id === 'misalignment')!.miss).toBeCloseTo(120 - 2 * fr, 6);
  });

  it('"고정"으로 거르면 회전 관련 후보가 빠진다, 날개 통과 7X = 417.1 Hz', () => {
    expect(candidatesAt(120, info, 'fixed').map((c) => c.fault.id)).not.toContain('misalignment');
    expect(candidatesAt(7 * fr, info)[0].fault.id).toBe('bladePass');
  });

  it('미끄럼베어링(볼 0)이면 0.43X에 오일 휠, 구름베어링이면 오일 휠 후보 없음', () => {
    expect(candidatesAt(0.43 * fr, { ...info, balls: 0 }).map((c) => c.fault.id)).toContain('oilWhirl');
    expect(candidatesAt(0.43 * fr, info).map((c) => c.fault.id)).not.toContain('oilWhirl');
  });
});

describe('결함 합성기', () => {
  it('같은 기계·같은 결함이면 같은 신호 (시드 고정), 길이 = f_s × 초', () => {
    const a = synthesize(pump, { unbalance: 0.5 });
    expect(a.acc.H.length).toBe(32768);
    expect(synthesize({ ...pump }, { unbalance: 0.5 }).acc.V[1234]).toBe(a.acc.V[1234]);
  });

  it('불평형 0.6: 수평 1X ≈ 0.8 + 7×0.6 = 5.0 mm/s rms (Hann 칸 차이 2 % 안), 수직이 수평보다 90° 늦다', () => {
    const s = synthesize(pump, { unbalance: 0.6 });
    const v = velocitySpectrum(s.acc.H, s.fs);
    expect(peakAt(v.freq, v.amp, fr) / 5.0).toBeGreaterThan(0.96);
    expect(peakAt(v.freq, v.amp, fr) / 5.0).toBeLessThan(1.01);
    expect(hvLagDeg(s, fr)).toBeCloseTo(90, 0);
  });

  it('정렬 불량: 축방향 1X·2X가 수평보다 크다', () => {
    const s = synthesize(pump, { misalignment: 0.6 });
    const h = velocitySpectrum(s.acc.H, s.fs);
    const a = velocitySpectrum(s.acc.A, s.fs);
    expect(peakAt(a.freq, a.amp, fr)).toBeGreaterThan(peakAt(h.freq, h.amp, fr));
    expect(peakAt(a.freq, a.amp, 2 * fr)).toBeGreaterThan(peakAt(h.freq, h.amp, 2 * fr));
  });

  it('전기 2×LF는 회전수를 바꿔도 120 Hz, 2X는 따라 움직인다', () => {
    const s1 = synthesize(pump, { electrical2LF: 0.6 });
    const s2 = synthesize({ ...pump, rpm: 3550 }, { electrical2LF: 0.6 });
    const v1 = velocitySpectrum(s1.acc.H, s1.fs);
    const v2 = velocitySpectrum(s2.acc.H, s2.fs);
    expect(peakAt(v1.freq, v1.amp, 120, 0.2)).toBeCloseTo(peakAt(v2.freq, v2.amp, 120, 0.2), 1);
    expect(s2.fr).toBeCloseTo(3550 / 60, 10);
  });
});

describe('회전수 추정', () => {
  it('정수배 줄만 있는 스펙트럼: 하모닉 무리가 f₀를 0.1 % 안으로 찾는다', () => {
    const df = 0.25;
    const freq = Float64Array.from({ length: 4097 }, (_, k) => k * df);
    const rng = createRng(4);
    const amp = freq.map(() => 0.01 * (1 + 0.2 * rng.uniform()));
    const f0 = 23.7;
    for (let k = 1; k <= 8; k++) {
      const i = Math.round((k * f0) / df);
      amp[i] = 1 / k;
    }
    const h = harmonicScore(freq, amp, 5, 100);
    expect(Math.abs(h.best / f0 - 1)).toBeLessThan(0.01);
    expect(Math.abs(refineFundamental(freq, amp, 23.6) / f0 - 1)).toBeLessThan(0.01);
  });

  it('켑스트럼: 감속기 맞물림 측대역 간격(입력축 24.83 Hz)을 1 % 안으로', () => {
    const s = synthesize(MACHINES.gearbox, { gear: 0.6, unbalance: 0.2 });
    const v = velocitySpectrum(s.acc.H, s.fs, 2048);
    const df = v.freq[1] - v.freq[0];
    const c = cepstrumEstimate(v.amp.slice(0, Math.round(2048 / df) + 1), df, 5, 100);
    expect(Math.abs(c.best / s.fr - 1)).toBeLessThan(0.01);
  });

  it('펌프·감속기는 하모닉 무리로 0.3 % 안, 풀림 팬(0.5X 분수 하모닉)은 절반을 고른다', () => {
    const cases = [
      ['pump', { unbalance: 0.4, misalignment: 0.3, electrical2LF: 0.3 }],
      ['gearbox', { gear: 0.6, unbalance: 0.2 }],
      ['fan', { looseness: 0.7 }],
    ] as const;
    const est = cases.map(([id, sev]) => {
      const s = synthesize(MACHINES[id], sev);
      return { id, truth: s.fr, e: estimateRpm(velocitySpectrum(s.acc.H, s.fs, 2048), s.fs, 'harmonic').fr };
    });
    expect(Math.abs(est[0].e / est[0].truth - 1)).toBeLessThan(0.003);
    expect(Math.abs(est[1].e / est[1].truth - 1)).toBeLessThan(0.003);
    expect(Math.abs(est[2].e / (est[2].truth / 2) - 1)).toBeLessThan(0.01);
  });

  it('유도전동기 동기속도: 60 Hz 2극 3600 rpm, 50 Hz 4극 1500 rpm', () => {
    expect(syncRpm(60, 2)).toBe(3600);
    expect(syncRpm(50, 4)).toBe(1500);
  });
});
