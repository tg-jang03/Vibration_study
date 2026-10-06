import { describe, expect, it } from 'vitest';
import { formatNumber } from '../lib/format';
import * as F from './p2-5';

const V = F.P25_VALUES;
const um = (m: number) => m * 1e6;

describe('P2-5 본문·그림 숫자 (PageGuide §5-5)', () => {
  it('저장 방식: 10초마다 33점·구간 안 2점·최대 104 µm pp(75 %), 10 rpm마다 331점·21점, 참 최대 139 µm pp', () => {
    expect(V.byTime.length).toBe(33);
    expect(V.inBandTime).toBe(2);
    expect(V.byRpm.length).toBe(331);
    expect(V.inBandRpm).toBe(21);
    expect(formatNumber(um(V.peakTime), 3)).toBe('104');
    expect(formatNumber(um(V.peakTrue), 3)).toBe('139');
    expect(formatNumber((V.peakTime / V.peakTrue) * 100, 2)).toBe('75');
  });

  it('동기 샘플링: 고정 f_s의 봉우리 26.5·5.73 µm pp (참 50·15), 프레임 동안 1900 → 2028 rpm', () => {
    expect(formatNumber(um(2 * V.fixed1), 3)).toBe('26.5');
    expect(formatNumber(um(2 * V.fixed2), 3)).toBe('5.73');
    expect(V.smear.rpmEndFixed).toBeCloseTo(2028, 6);
  });

  it('기동 알람: 임계 145 s, 최대 140 µm pp, 배율 없이 144.8 s에 트립, 배율이면 트립 없음', () => {
    expect(V.tCrit).toBeCloseTo(145, 9);
    expect(formatNumber(Math.max(...V.runup.x), 3)).toBe('140');
    expect(formatNumber(V.runNo.tripTime!, 4)).toBe('144.8');
    expect(V.runMul.tripTime).toBeNull();
  });

  it('그림 5 캡션의 시각: Alert 29.6 s, Danger 32.8 s, 트립 33.8 s', () => {
    expect(F.levelsDelay.caption).toContain('Alert를 넘은 29.6 s');
    expect(F.levelsDelay.caption).toContain('Danger를 넘은 32.8 s에서 1초 뒤(33.8 s)');
  });

  it('그림 id 6개가 겹치지 않는다', () => {
    const ids = Object.values(F).flatMap((v) => (typeof v === 'object' && v && 'panels' in v ? [v.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(6);
  });
});
