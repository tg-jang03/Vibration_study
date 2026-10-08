import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import type { FigureSpec } from '../lib/figure';
import * as F from './p7-8';

const V = F.P78_VALUES;

describe('P7-8 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('그림 6개, id가 겹치지 않는다', () => {
    const figs = Object.values(F).filter((v): v is FigureSpec => typeof v === 'object' && v !== null && 'panels' in v);
    expect(figs).toHaveLength(6);
    expect(new Set(figs.map((x) => x.id)).size).toBe(6);
  });

  it('펌프: 1X 59.58 Hz, VPF 417.1 Hz, VPF 0.6(BEP)·1.25(40 %)·0.71(125 %)·1.2(간극 절반), 재순환 1.67', () => {
    expect([f(V.fr, 4), f(V.vpf, 4), f(2 * V.vpf, 4)]).toEqual(['59.58', '417.1', '834.2']);
    expect([f(V.vpfAt.q1, 2), f(V.vpfAt.q04, 3), f(V.vpfAt.q125, 2), f(V.vpfAt.gap1, 2), f(V.recirc04, 3)]).toEqual(['0.6', '1.25', '0.71', '1.2', '1.67']);
  });

  it('1X: 수력 불평형 2.56(60 %)·1.6(BEP)·2.32(130 %), 기계 불평형 4.3 일정', () => {
    expect([f(V.hyd.q06, 3), f(V.hyd.q1, 2), f(V.hyd.q13, 3), f(V.unb, 2)]).toEqual(['2.56', '1.6', '2.32', '4.3']);
  });

  it('캐비테이션: 흡입 여유 1.0 → 1 g, +0.2 또는 유량 70 %면 0 / 정상 펌프 여유 1.34(120 %)·1.22(130 %), BPFO 213.6 Hz', () => {
    expect([f(V.cavit.q1, 2), V.cavit.q1up02, V.cavit.q07, V.cavit.margin1.toFixed(1)]).toEqual(['1', 0, 0, '1.0']);
    expect([f(V.cavit.margin12normal, 3), f(V.cavit.margin13normal, 3), f(V.bpfo, 4)]).toEqual(['1.34', '1.22', '213.6']);
  });

  it('압축기: 설계 압력비 2.29, 서지선 3.0, stall 0.64 → 29.4 Hz·0.196X·8 µm, 0.70 → 2 µm, 서지 방지면 0.62에 머묾(stall 10 µm)', () => {
    const c = V.comp;
    expect([f(c.prDesign, 3), c.prSurge.toFixed(1)]).toEqual(['2.29', '3.0']);
    expect([f(c.stall064.hz, 3), f(c.stall064.order, 3), f(c.stall064.amp, 2), f(c.stall070.amp, 2)]).toEqual(['29.4', '0.196', '8', '2']);
    expect([c.anti050.phiEff, c.anti050.surge, f(c.anti050.stall!.amp, 2), f(c.anti050.stall!.hz, 3)]).toEqual([0.62, false, '10', '28.5']);
    expect(c.surge050.surge).toBe(true);
  });
});
