import { describe, expect, it } from 'vitest';
import { formatNumber } from '../lib/format';
import { gapVoltage, PROBE, simulateProbe } from '../lib/proximity';
import * as F from './p2-2';

const V = F.P22_VALUES;

describe('P2-2 본문·그림 숫자 (PageGuide §5-5)', () => {
  it('gap −9.5 V → 1.21 mm, AC 0.472 V pp = 60 µm pp', () => {
    expect(formatNumber(V.exampleD * 1000, 3)).toBe('1.21');
    expect(formatNumber(V.acVpp, 3)).toBe('0.472');
    expect(formatNumber(V.dcac.truePp * 1e6, 3)).toBe('60');
  });

  it('선형 범위 밖: 2.4 mm에서 300 µm pp → 193 µm pp (36 % 작게), 1.2 mm에서는 그대로', () => {
    expect(formatNumber(V.inside.readPp * 1e6, 3)).toBe('300');
    expect(formatNumber(V.outside.readPp * 1e6, 3)).toBe('193');
    expect(formatNumber((1 - V.outside.readPp / V.outside.truePp) * 100, 2)).toBe('36');
  });

  it('런아웃: 300 rpm 신호 13.9 µm pp 중 진동 0.97 µm pp, 3600 rpm은 약 63 µm pp', () => {
    expect(formatNumber(V.slow.truePp * 1e6, 3)).toBe('13.9');
    expect(formatNumber(V.slow.vibPp * 1e6, 2)).toBe('0.97');
    expect(formatNumber(V.slow.runoutPp * 1e6, 2)).toBe('13');
    expect(Math.round(V.fast.truePp * 1e6)).toBe(63);
  });

  it('랩 해석: 1.20 mm → −9.45 V, 1.21 mm → −9.52 V, 120 µm pp → 0.945 V pp', () => {
    expect(formatNumber(gapVoltage(1.2e-3), 3)).toBe('−9.45');
    expect(formatNumber(gapVoltage(1.21e-3), 3)).toBe('−9.53');
    expect(formatNumber(120e-6 * PROBE.sensitivity, 3)).toBe('0.945');
    const s = simulateProbe({ gap: 1.2e-3, rpm: 3600, vibPp: 120e-6, runout: 'none' });
    expect(formatNumber(s.truePp * PROBE.sensitivity, 3)).toBe('0.945');
  });

  it('그림 id 6개가 겹치지 않는다', () => {
    const ids = Object.values(F).flatMap((v) => ('panels' in v ? [v.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(6);
  });
});
