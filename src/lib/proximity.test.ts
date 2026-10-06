import { describe, expect, it } from 'vitest';
import { distanceFromVoltage, gapVoltage, inLinearRange, PROBE, runoutAt, shaftVibration, simulateProbe } from './proximity';

describe('비접촉 변위 센서 교정 (Contents §6)', () => {
  it('200 mV/mil = 7.874 V/mm', () => {
    expect(PROBE.sensitivity / 1000).toBeCloseTo(7.874, 3);
  });

  it('gap −9.5 V, 7.87 V/mm → 1.207 mm (선형 범위 안에서 왕복 일치)', () => {
    const d = distanceFromVoltage(-9.5, 7870);
    expect(d * 1000).toBeCloseTo(1.207, 3);
    expect(gapVoltage(1.2e-3)).toBeCloseTo(-PROBE.sensitivity * 1.2e-3, 12);
    expect(distanceFromVoltage(gapVoltage(1.2e-3))).toBeCloseTo(1.2e-3, 12);
  });

  it('교정 곡선은 거리가 멀수록 더 음이고, 선형 범위 끝에서 끊기지 않는다', () => {
    let prev = gapVoltage(0);
    for (let d = 0.01e-3; d <= 3e-3; d += 0.01e-3) {
      const v = gapVoltage(d);
      expect(v).toBeLessThan(prev);
      prev = v;
    }
    for (const edge of [PROBE.linearMin, PROBE.linearMax]) {
      const h = 1e-9;
      expect(gapVoltage(edge - h)).toBeCloseTo(gapVoltage(edge + h), 4);
      const slopeIn = (gapVoltage(edge + h) - gapVoltage(edge - h)) / (2 * h);
      expect(slopeIn / -PROBE.sensitivity).toBeCloseTo(1, 3);
    }
    expect(inLinearRange(1e-3)).toBe(true);
    expect(inLinearRange(2.5e-3)).toBe(false);
  });
});

describe('신호 합성 (LAB-PROX-01)', () => {
  it('선형 범위 안: 환산 pp = 실제 pp, 평균 거리 = d₀ (런아웃·진동 대칭일 때)', () => {
    const s = simulateProbe({ gap: 1.2e-3, rpm: 3600, vibPp: 60e-6, runout: 'none' });
    expect(s.linear).toBe(true);
    expect(s.readPp / s.truePp).toBeCloseTo(1, 9);
    expect(s.truePp).toBeCloseTo(60e-6, 9); // 점 간격 때문에 꼭짓점을 조금 비껴간다
    expect(s.readMeanGap).toBeCloseTo(1.2e-3, 9);
    // AC 0.472 V pp
    expect((s.truePp * PROBE.sensitivity)).toBeCloseTo(0.4724, 3);
  });

  it('선형 범위 밖으로 나가면 환산 pp가 실제보다 작아진다', () => {
    const s = simulateProbe({ gap: 2.4e-3, rpm: 3600, vibPp: 300e-6, runout: 'none' });
    expect(s.linear).toBe(false);
    expect(s.readPp).toBeLessThan(0.9 * s.truePp);
  });

  it('런아웃은 회전수와 상관없이 같은 모양·크기, 저속에서 진동은 거의 없다', () => {
    const slow = simulateProbe({ gap: 1.2e-3, rpm: 300, vibPp: 60e-6, runout: 'both' });
    const fast = simulateProbe({ gap: 1.2e-3, rpm: 3600, vibPp: 60e-6, runout: 'both' });
    expect(slow.runoutPp).toBeCloseTo(fast.runoutPp, 15);
    for (let i = 0; i < slow.runout.length; i += 37) expect(slow.runout[i]).toBe(fast.runout[i]);
    expect(slow.vibPp / fast.vibPp).toBeLessThan(0.02);
    expect(runoutAt(0.3, 'none')).toBe(0);
  });

  it('불평형 응답: 임계속도 2000 rpm에서 진동이 가장 크고, 운전 3600 rpm 값이 기준', () => {
    expect(shaftVibration(3600, 60e-6).pp).toBeCloseTo(60e-6, 15);
    expect(shaftVibration(2000, 60e-6).pp).toBeGreaterThan(shaftVibration(3600, 60e-6).pp);
    expect(shaftVibration(2000, 60e-6).phaseLag).toBeCloseTo(Math.PI / 2, 12);
  });

  it('감도를 잘못 쓰면 진동 pp가 같은 비율로 틀린다', () => {
    const real = { ...PROBE, sensitivity: PROBE.sensitivity * 0.88 };
    const s = simulateProbe({ gap: 1.2e-3, rpm: 3600, vibPp: 60e-6, runout: 'none', probe: real });
    expect(s.readPp / s.truePp).toBeCloseTo(0.88, 9);
  });
});
