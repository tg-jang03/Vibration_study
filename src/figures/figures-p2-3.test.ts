import { describe, expect, it } from 'vitest';
import { formatNumber } from '../lib/format';
import { toDeg } from '../lib/phase';
import * as F from './p2-3';

const V = F.P23_VALUES;
const um = (m: number) => m * 1e6;
const fv = (v: { amp: number; lag: number }) => `${formatNumber(um(v.amp), 3)}∠${formatNumber(toDeg(v.lag), 3)}`;

describe('P2-3 본문·그림 숫자 (PageGuide §5-5)', () => {
  it('키페이저: 홈 없는 곳 −9.45 V, 홈 바닥 −17.3 V, 문턱 −13.4 V, 3600 rpm → T 16.7 ms', () => {
    expect(formatNumber(V.vNoNotch, 3)).toBe('−9.45');
    expect(formatNumber(V.vNotch, 3)).toBe('−17.3');
    expect(formatNumber(V.threshold, 3)).toBe('−13.4');
    expect(formatNumber(V.T * 1e3, 3)).toBe('16.7');
  });

  it('위상: Δt 5.56 ms ÷ T 16.7 ms × 360° = 120°, 2X가 섞인 원신호 봉우리는 138°(18° 차이)', () => {
    expect(formatNumber(V.dt * 1e3, 3)).toBe('5.56');
    expect(formatNumber(toDeg(V.oneX.lag), 3)).toBe('120');
    expect(formatNumber(V.rawPeak, 3)).toBe('138');
    expect(formatNumber(V.rawPeak - 120, 2)).toBe('18');
  });

  it('벡터: 50∠120° → 50∠240°의 변화 86.6∠270°, Slow roll 예 44.4∠137° (크기만 빼면 35, 21 % 작게)', () => {
    expect(fv(V.change)).toBe('86.6∠270');
    expect(fv(V.example)).toBe('44.4∠137');
    expect(formatNumber((1 - V.exampleScalar / um(V.example.amp)) * 100, 2)).toBe('21');
  });

  it('런업(그림 6·8): 임계 158 µm pp(측정 171), 운전 45∠171°(측정 42.1∠151°, 보상 45.7∠171°), 300 rpm 15.4∠57.7°', () => {
    expect(formatNumber(um(V.crit.amp), 3)).toBe('158');
    expect(formatNumber(um(V.critMeasured.amp), 3)).toBe('171');
    expect(fv(V.opTruth)).toBe('45∠171');
    expect(fv(V.opMeasured)).toBe('42.1∠151');
    expect(fv(V.opComp)).toBe('45.7∠171');
    const sr = V.ruVec.measured[V.ruVec.rpm.indexOf(300)];
    expect(fv(sr)).toBe('15.4∠57.7');
  });

  it('그림 id 10개가 겹치지 않는다', () => {
    const ids = Object.values(F).flatMap((v) => (typeof v === 'object' && v && 'panels' in v ? [v.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(10);
  });
});
