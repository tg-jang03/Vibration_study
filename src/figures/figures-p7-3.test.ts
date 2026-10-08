import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { forwardFraction, meanPosition, nlRotor, orderPart, simulate } from '../lib/faults/contact';
import type { FigureSpec } from '../lib/figure';
import * as F from './p7-3';

const V = F.P73_VALUES;
const lab = (kind: Parameters<typeof nlRotor>[0], s: number, rpm: number) => simulate(nlRotor(kind, s, rpm / 3000), 64, 300);

describe('P7-3 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('그림 9개, id가 겹치지 않는다', () => {
    const figs = Object.values(F).filter((v): v is FigureSpec => typeof v === 'object' && v !== null && 'panels' in v);
    expect(figs).toHaveLength(9);
    expect(new Set(figs.map((x) => x.id)).size).toBe(9);
  });

  it('그림 1: 씰이 없으면 반경 32 µm·2X 0, 닿으면 1X 166 µm p-p(수직)·2X 11 µm', () => {
    expect(f(V.rubLightFree.one.fwd, 2)).toBe('32');
    expect(V.rubLightFree.two.vpp).toBeLessThan(1e-6);
    expect([f(V.rubLight.one.vpp, 3), f(V.rubLight.two.vpp, 2), f(V.rubLight.one.fwd, 2)]).toEqual(['166', '11', '85']);
  });

  it('그림 3: 2400 rpm 미스얼라인 약 2X ÷ 1X 0.59(바나나)·강 1.5(8자), 평균 자리 −70 → −57 → −28 µm', () => {
    const m = V.mis;
    expect([f(m.mild.two.vpp / m.mild.one.vpp, 2), f(m.strong.two.vpp / m.strong.one.vpp, 2)]).toEqual(['0.59', '1.5']);
    expect([f(m.normal.mean[1], 2), f(m.mild.mean[1], 2), f(m.strong.mean[1], 2)]).toEqual(['−70', '−57', '−28']);
    expect([f(m.strong.one.vpp, 2), f(m.strong.two.vpp, 2), f(m.mild.two.vpp, 2)]).toEqual(['42', '62', '19']);
  });

  it('그림 5: 구조적 풀림 — 조임 받침 ÷ 베이스 1.3·위상차 0.4°, 풀림 6.2배·37°·2X ÷ 1X 0.48', () => {
    const t = V.foot.tight;
    const l = V.foot.loose;
    expect([f(t.foot.amp / t.base.amp, 2), f(Math.abs(t.foot.lagDeg - t.base.lagDeg), 1)]).toEqual(['1.3', '0.4']);
    expect([f(l.foot.amp / l.base.amp, 2), f(l.foot.lagDeg - l.base.lagDeg, 2), f(l.foot2.amp / l.foot.amp, 2)]).toEqual(['6.2', '37', '0.48']);
  });

  it('그림 6: 회전 풀림 3600 rpm 2X 58 · 3X 28 · 4X 16 µm, 수평 248 · 수직 127 µm p-p / 4200 rpm ½X 111 · 1½X 100 µm', () => {
    const h = V.looseHarm;
    expect([f(h.two.vpp, 2), f(h.three.vpp, 2), f(h.four.vpp, 2), f(h.hpp, 3), f(h.vpp, 3)]).toEqual(['58', '28', '16', '248', '127']);
    expect(h.half.vpp).toBeLessThan(1e-6);
    expect([f(V.looseHalf.half.vpp, 3), f(V.looseHalf.oneHalf.vpp, 3)]).toEqual(['111', '100']);
  });

  it('그림 7: 부분 러브 7800 rpm 수직 ½X 132 µm p-p > 1X 25 µm p-p, 4200 rpm 2X가 선다', () => {
    expect([f(V.rubHalf.half.vpp, 3), f(V.rubHalf.one.vpp, 2)]).toEqual(['132', '25']);
    expect(V.rubLight.two.vpp).toBeGreaterThan(4 * V.rubLight.half.vpp);
  });

  it('그림 8: 정도 100 % 러브의 역방향 봉우리 −0.92 · −0.84 · −0.78X = 120 · 118 · 117 Hz, 오빗 정방향 0 % / 마찰 0.15 → 11바퀴에 1.8배, 마지막 68 % 역방향', () => {
    expect(V.whip.map((w) => f(w.order, 2))).toEqual(['−0.92', '−0.84', '−0.78']);
    expect(V.whip.map((w) => f(w.hz, 3))).toEqual(['120', '118', '117']);
    expect(V.whip.map((w) => w.fwdOrbit)).toEqual([0, 0, 0]);
    expect([V.fullRub.stopped, f(V.fullRub.revs, 2), f(100 * (1 - V.fullRub.fwdLast), 2)]).toEqual([true, '11', '68']);
  });

  it('그림 9: Newkirk 임계속도 아래 1.6 ∠40° → 4.6 ∠140°, 위 1.3 → 1.2', () => {
    const b = V.newkirk.below;
    const a = V.newkirk.above;
    expect([f(b[0].amp, 2), Math.round(b[0].lagDeg), f(b[4].amp, 2), Math.round(b[4].lagDeg)]).toEqual(['1.6', 40, '4.6', 140]);
    expect([f(a[0].amp, 2), f(a[4].amp, 2)]).toEqual(['1.3', '1.2']);
  });

  it('랩 과제: 미스얼라인·러브·풀림·원주 러브 (본문 해석과 같은 숫자)', () => {
    const m25 = lab('misalign', 0.25, 2400);
    const m80 = lab('misalign', 0.8, 2400);
    const r = (rec: ReturnType<typeof lab>) => orderPart(rec, 2).yAmp / orderPart(rec, 1).yAmp;
    expect([f(r(m25), 1), f(r(m80), 2), f(100 * meanPosition(m25)[1], 2), f(100 * meanPosition(m80)[1], 2)]).toEqual(['0.6', '1.5', '−57', '−28']);
    const h = lab('rub', 0.5, 7800);
    expect([f(200 * orderPart(h, 0.5).yAmp, 3), f(200 * orderPart(h, 1).yAmp, 2)]).toEqual(['132', '25']);
    expect(f(100 * orderPart(lab('rub', 0.5, 4200), 1).fwd, 2)).toBe('85');
    const r78 = lab('rub', 1, 7800);
    const [mx, my] = meanPosition(r78);
    expect(forwardFraction(r78.x.slice(-512).map((v) => v - mx), r78.y.slice(-512).map((v) => v - my))).toBe(0);
    expect(() => lab('rub', 1, 9600)).toThrow(RangeError);
  });

  it('확인 문제: Q1 175°, Q2 27.5 Hz, Q3 6배·45°', () => {
    expect([215 - 40, 3300 / 60 / 2, 120 / 20, 60 - 15]).toEqual([175, 27.5, 6, 45]);
  });
});
