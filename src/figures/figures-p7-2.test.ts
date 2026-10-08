import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { oneXReadouts, sweep, vectorAt } from '../lib/faults/oneX';
import type { FigureSpec } from '../lib/figure';
import * as F from './p7-2';

const V = F.P72_VALUES;
const pp = (m: number) => 2e6 * m;

describe('P7-2 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('그림 8개, id가 겹치지 않는다', () => {
    const figs = Object.values(F).filter((v): v is FigureSpec => typeof v === 'object' && v !== null && 'panels' in v);
    expect(figs).toHaveLength(8);
    expect(new Set(figs.map((x) => x.id)).size).toBe(8);
  });

  it('정적 불평형: 300 rpm 2.2 µm(건전 2.0), 1500 → 3000 rpm 8.2 → 37 µm p-p (4.5배), 수평·수직 89°, 수평 ÷ 수직 1.4, 두 베어링 −3°', () => {
    const s = V.static;
    expect([f(pp(s.slowRoll.B1H.amp), 2), f(pp(V.healthy.slowRoll.B1H.amp), 2)]).toEqual(['2.2', '2']);
    expect([f(V.static1500, 2), f(V.static3000, 2), f(s.ratioHalfSpeed, 2)]).toEqual(['8.2', '37', '4.5']);
    expect([f(s.hvPhase, 2), f(s.hvRatio, 2), f(s.b12Phase, 1)]).toEqual(['89', '1.4', '−3']);
  });

  it('커플 불평형: 회전수 비 4.4, 두 베어링 −164° / 동적 불평형 −52.5°', () => {
    expect([f(V.couple.ratioHalfSpeed, 2), f(V.couple.b12Phase, 3), f(V.dynamic.b12Phase, 3)]).toEqual(['4.4', '−164', '−52.5']);
  });

  it('런아웃: slow roll 32 → 운전 34 µm (회전수 비 1.0), 보상 뒤 1.7 µm = 건전 / 휨: 31 → 47 µm, 보상 뒤 17 µm, 두 베어링 동상', () => {
    const r = V.runout;
    expect([f(pp(r.slowRoll.B1H.amp), 2), f(pp(r.op.B1H.amp), 2), f(r.ratioHalfSpeed, 2), f(pp(r.compensated), 2)]).toEqual(['32', '34', '1', '1.7']);
    expect(r.compensated).toBeCloseTo(V.healthy.compensated, 15);
    const b = V.bow;
    expect([f(pp(b.slowRoll.B1H.amp), 2), f(pp(b.op.B1H.amp), 2), f(pp(b.compensated), 2), f(b.ratioHalfSpeed, 2)]).toEqual(['31', '47', '17', '1.4']);
    expect(Math.abs(b.b12Phase)).toBeLessThan(3);
  });

  it('크랙: 2X 봉우리 수평 2500 · 수직 2800 rpm, 20 µm p-p / slow roll 1X 11.5 µm, 회전수 비 1.4 / 1년: 2X 0 → 8.6, 1X 3.7 ∠46° → 31 ∠313°, slow roll 2.0 → 19', () => {
    const c = V.crack;
    expect([c.twoXmaxRpm, f(pp(c.twoXmax), 2)]).toEqual([2500, '20']);
    const v2 = sweep({ cause: 'crack', severity: 0.6 }, 'B1V', 2).reduce((a, b) => (b.amp > a.amp ? b : a));
    expect(v2.rpm).toBe(2800);
    expect([f(pp(c.slowRoll.B1H.amp), 3), f(c.ratioHalfSpeed, 2)]).toEqual(['11.5', '1.4']);
    const t = V.trend;
    expect([f(pp(t[0].twoX.amp), 1), f(pp(t[12].twoX.amp), 2)]).toEqual(['0', '8.6']);
    expect([f(pp(t[0].oneX.amp), 2), Math.round(t[0].oneX.lagDeg), f(pp(t[12].oneX.amp), 2), Math.round(t[12].oneX.lagDeg)]).toEqual(['3.7', 46, '31', 313]);
    expect([f(pp(t[0].slowRoll.amp), 2), f(pp(t[12].slowRoll.amp), 2)]).toEqual(['2', '19']);
  });

  it('방향이 정해진 힘: 수평 ÷ 수직 3.3, 위상차 11°, slow roll 32 µm, 회전수 비 1.4', () => {
    const d = V.force;
    expect([f(d.hvRatio, 2), f(d.hvPhase, 2), f(pp(d.slowRoll.B1H.amp), 2), f(d.ratioHalfSpeed, 2)]).toEqual(['3.3', '11', '32', '1.4']);
  });

  it('구조 공진: 베어링 1 수평만 2850 rpm에서 117 µm p-p, 3000 rpm 72 µm, 회전수 비 17, 2600 → 3000 rpm 위상 약 130°', () => {
    const r = V.reson;
    expect([r.oneXmaxRpm, f(pp(r.oneXmax), 3), f(pp(r.op.B1H.amp), 2), f(r.ratioHalfSpeed, 2)]).toEqual([2850, '117', '72', '17']);
    const o = { cause: 'resonance', severity: 0.6 } as const;
    const lag = (rpm: number) => vectorAt(o, 'B1H', rpm).lagDeg;
    const dphi = ((lag(3000) - lag(2600)) % 360 + 360) % 360;
    expect(f(dphi, 2)).toBe('130');
    for (const s of ['B1V', 'B2H'] as const) expect(pp(oneXReadouts(o).op[s].amp)).toBeLessThan(10);
  });

  it('확인 문제 Q2: 22 ∠45° − 20 ∠40° = 2.7 µm ∠85° / Q1 4배 / Q4 6.7배 / Q6 (2700 ÷ 2950)² = 0.84', () => {
    const v = (a: number, d: number) => [a * Math.cos((d * Math.PI) / 180), -a * Math.sin((d * Math.PI) / 180)];
    const [a1, b1] = v(22, 45);
    const [a2, b2] = v(20, 40);
    expect([f(a1, 4), f(b1, 4), f(a2, 4), f(b2, 4)]).toEqual(['15.56', '−15.56', '15.32', '−12.86']);
    expect([f(a1 - a2, 2), f(b1 - b2, 3)]).toEqual(['0.24', '−2.7']);
    expect([f(Math.hypot(a1 - a2, b1 - b2), 2), f((Math.atan2(-(b1 - b2), a1 - a2) * 180) / Math.PI, 2)]).toEqual(['2.7', '85']);
    expect([24 / 6, f(40 / 6, 2), f((2700 / 2950) ** 2, 2)]).toEqual([4, '6.7', '0.84']);
  });
});
