import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { analyzeOrder, DEFAULT_ORDER_PARAMS as D, ORD } from '../lib/orderDemo';
import * as F from './p5-4';

const V = F.P54_VALUES;
const um = 1e6;

describe('P5-4 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('기본 프레임: 64바퀴 2.3 s, 1500 → 1844 rpm, 시간 FFT 1X 13.7 µm vs 차수 25.0 µm, 고정 95 Hz는 3.09 ~ 3.8차', () => {
    expect(f(V.base.tEnd - V.base.tStart, 2)).toBe('2.3');
    expect(f(V.base.rpmEnd, 4)).toBe('1844');
    expect(f(V.base.timePeak1 * um, 3)).toBe('13.7');
    expect(f(V.base.amp1 * um, 3)).toBe('25');
    expect(f(V.base.amp2 * um, 3)).toBe('7.99');
    expect(f(V.fixedOrderLo, 3)).toBe('3.09');
    expect(f(V.fixedOrderHi, 2)).toBe('3.8');
  });

  it('가속 0 → 시간 FFT도 25 µm, 300 rpm/s → 10.6 µm, 16바퀴 → 0.62 s·93 rpm·24.5 µm', () => {
    expect(f(V.steady.timePeak1 * um, 3)).toBe('25');
    expect(f(analyzeOrder({ ...D, rate: 300 }).timePeak1 * um, 3)).toBe('10.6');
    const r16 = analyzeOrder({ ...D, revs: 16 });
    expect(f(r16.tEnd - r16.tStart, 2)).toBe('0.62');
    expect(Math.round(r16.rpmEnd - r16.rpmStart)).toBe(93);
    expect(f(r16.timePeak1 * um, 3)).toBe('24.5');
  });

  it('에일리어싱: 32점 바로 → 9X 2.96 µm, 방지 켬 → 0.006 µm, 64점 → 23X 2.95 µm', () => {
    expect(f(V.alias9raw * um, 3)).toBe('2.96');
    expect(f(V.alias9aa * um, 1)).toBe('0.006');
    expect(f(V.base.ampHigh * um, 3)).toBe('2.95');
  });

  it('보간: 23X 선형 2.76 µm (8.1 % 손실), 3차 1.6 % 손실', () => {
    expect(f(V.lin.ampHigh * um, 3)).toBe('2.76');
    expect(f((1 - V.lin.ampHigh / ORD.aHigh) * 100, 2)).toBe('8.1');
    expect(f((1 - V.base.ampHigh / ORD.aHigh) * 100, 2)).toBe('1.6');
  });

  it('tacholess: 능선 최대 오차 3.8 rpm, 1X 24.9 µm, 23X 0.54 µm', () => {
    expect(f(V.tacho.ridgeErrRpm ?? 0, 2)).toBe('3.8');
    expect(f(V.tacho.amp1 * um, 3)).toBe('24.9');
    expect(f(V.tacho.ampHigh * um, 2)).toBe('0.54');
    expect(f(V.tachoHighMax * um, 2)).toBe('1.4');
    expect(f(V.tacho.amp2 * um, 3)).toBe('7.92');
  });

  it('tacholess + 가속 0: 능선 오차가 한쪽으로 쏠려 쌓인다 → 1X 24.0 µm(−4 %), 2X 6.67 µm(−17 %)', () => {
    expect(f(V.tachoSteady.ridgeErrRpm ?? 0, 2)).toBe('4');
    expect(f(V.tachoSteady.amp1 * um, 3)).toBe('24');
    expect(f(V.tachoSteady.amp2 * um, 3)).toBe('6.67');
    expect(Math.round((1 - V.tachoSteady.amp1 / ORD.a1) * 100)).toBe(4);
    expect(Math.round((1 - V.tachoSteady.amp2 / ORD.a2) * 100)).toBe(17);
  });

  it('그림 id 5개가 겹치지 않는다', () => {
    const ids = Object.values(F).flatMap((v) => (v && typeof v === 'object' && 'panels' in v ? [v.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(5);
  });
});
