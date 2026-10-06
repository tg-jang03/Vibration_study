import { describe, expect, it } from 'vitest';
import { formatNumber } from '../lib/format';
import { G } from '../lib/measurementChain';
import * as F from './p3-4';

const V = F.P24_VALUES;
const mm = (v: number) => v * 1e3;
const db = (p: number) => 20 * Math.log10(Math.sqrt(p) / G);
/** f 둘레 ±20 bin의 평균 파워 (잡음 바닥은 bin 하나로 보면 흔들린다) */
const at = (r: { df: number; accelPower: Float64Array }, f: number) => {
  const k = Math.round(f / r.df);
  let s = 0;
  for (let j = k - 20; j <= k + 20; j++) s += r.accelPower[j];
  return s / 41;
};

describe('P3-4 본문·그림 숫자 (PageGuide §5-5)', () => {
  it('정상 측정: 1X 1.8 mm/s, 전체(2 ~ 1000 Hz) 2.12 mm/s', () => {
    expect(formatNumber(mm(V.normal.oneX), 3)).toBe('1.8');
    expect(formatNumber(mm(V.normal.overall), 3)).toBe('2.12');
  });

  it('설치 공진: 손 2 kHz에서 +14 dB, 스터드는 그대로', () => {
    expect(db(at(V.mounts.hand, 2000)) - db(at(V.mounts.stud, 2000))).toBeCloseTo(14, 0);
    // 자석은 실제보다 +20 dB, 스터드도 7 kHz(r = 0.28)에서 이미 +0.7 dB라 둘의 차이는 19.3 dB
    expect(db(at(V.mounts.magnet, 7000)) - db(at(V.mounts.stud, 7000))).toBeCloseTo(19.3, 0);
  });

  it('정착: τ 2 s면 10 s 뒤 0.67 %', () => {
    expect(formatNumber(V.settle10 * 100, 2)).toBe('0.67');
  });

  it('ski-slope: 가속도 0.012 g → 속도 23.1 mm/s (0.78 Hz), 전체 2.12 → 6.22 mm/s', () => {
    expect(formatNumber(Math.sqrt(V.ski.accelPower[1]) / G, 2)).toBe('0.012');
    expect(formatNumber(mm(Math.sqrt(V.ski.velPower[1])), 3)).toBe('23.1');
    expect(formatNumber(mm(V.ski.oneX), 3)).toBe('1.81');
    expect(formatNumber(mm(V.ski.overall), 3)).toBe('6.22');
  });

  it('그라운드 루프: 60 Hz 0.552 mm/s', () => {
    expect(formatNumber(mm(V.gl60), 3)).toBe('0.552');
  });

  it('케이블: 전체 2.12 → 9.88 mm/s', () => {
    expect(formatNumber(mm(V.cableFix.overall), 3)).toBe('2.12');
    expect(formatNumber(mm(V.cable.overall), 3)).toBe('9.88');
  });

  it('클리핑: 5X −69.4 → −44.2 dB (25 dB), 1X 1.8 → 1.28 mm/s', () => {
    expect(formatNumber(V.h5.noClip, 3)).toBe('−69.4');
    expect(formatNumber(V.h5.clip, 3)).toBe('−44.2');
    expect(formatNumber(V.h5.clip - V.h5.noClip, 2)).toBe('25');
    expect(formatNumber(mm(V.clip.oneX), 3)).toBe('1.28');
    expect(V.clip.overload).toBe(true);
  });

  it('그림 id 7개가 겹치지 않는다', () => {
    const ids = Object.values(F).flatMap((v) => (typeof v === 'object' && v && 'panels' in v ? [v.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(7);
  });
});
