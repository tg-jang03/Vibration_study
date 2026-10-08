import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import type { FigureSpec } from '../lib/figure';
import * as F from './p7-7';

const V = F.P77_VALUES;

describe('P7-7 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('그림 6개, id가 겹치지 않는다', () => {
    const figs = Object.values(F).filter((v): v is FigureSpec => typeof v === 'object' && v !== null && 'panels' in v);
    expect(figs).toHaveLength(6);
    expect(new Set(figs.map((x) => x.id)).size).toBe(6);
  });

  it('2극 60 Hz 부하 60 %: 3576 rpm, 59.6 Hz, 슬립 0.67 %, f_slip 0.4 Hz, PPF 0.8 Hz, 2X 119.2 Hz, 맥놀이 1.25 s', () => {
    const q = V.ind2;
    expect([f(q.rpm, 4), f(q.fr, 3), f(q.slip * 100, 2), f(q.fslip, 2), f(q.ppf, 2), f(q.pX, 4), f(V.beatSeconds, 3)]).toEqual(['3576', '59.6', '0.67', '0.4', '0.8', '119.2', '1.25']);
  });

  it('4극 50 Hz: 부하 60 % 1482 rpm·24.7 Hz·4X 98.8·PPF 1.2 / 부하 80 % 1476 rpm·24.6 Hz·PPF 1.6 / 2극 전부하 PPF 1.33', () => {
    expect([f(V.ind4.rpm, 4), f(V.ind4.fr, 3), f(V.ind4.pX, 3), f(V.ind4.ppf, 2)]).toEqual(['1482', '24.7', '98.8', '1.2']);
    expect([f(V.ind4at80.rpm, 4), f(V.ind4at80.fr, 3), f(V.ind4at80.ppf, 2), f(V.ind4at80.pX, 3)]).toEqual(['1476', '24.6', '1.6', '98.4']);
    expect([f(V.ind2full.ppf, 3), f(V.ind2full.fr, 4)]).toEqual(['1.33', '59.33']);
  });

  it('로터바: 2 s 봉우리 1개, 8 s 3개 (58.8·59.6·60.4 Hz)', () => {
    expect(V.rbPeaks).toEqual({ T2: 1, T8: 3 });
    expect([f(V.ind2.fr - V.ind2.ppf, 3), f(V.ind2.fr + V.ind2.ppf, 3)]).toEqual(['58.8', '60.4']);
  });

  it('전원 차단 0.5 s 뒤: 전기 0.67 %, 기계 2X 73 %, 회전수 86 %, 2X 102.2 Hz', () => {
    expect([f(V.trip.elec * 100, 2), f(V.trip.mech * 100, 2), f(V.trip.speed * 100, 2), f(V.ind2.pX * V.trip.speed, 4)]).toEqual(['0.67', '73', '86', '102.2']);
  });

  it('동기 발전기 120 Hz: 고정자 3.4 → 0.46, 기계 3.38 → 3.26 mm/s (계자 차단 2 s 뒤, 8.2 %)', () => {
    expect([f(V.gen.stator.before, 2), f(V.gen.stator.after2, 2), f(V.gen.misalign.before, 3), f(V.gen.misalign.after2, 3)]).toEqual(['3.4', '0.46', '3.38', '3.26']);
    expect(f(V.gen.fieldRatio2 * 100, 2)).toBe('8.2');
  });
});
