import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import type { FigureSpec } from '../lib/figure';
import * as F from './p7-4';

const V = F.P74_VALUES;

describe('P7-4 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('그림 5개, id가 겹치지 않는다', () => {
    const figs = Object.values(F).filter((v): v is FigureSpec => typeof v === 'object' && v !== null && 'panels' in v);
    expect(figs).toHaveLength(5);
    expect(new Set(figs.map((x) => x.id)).size).toBe(5);
  });

  it('유체막: 문턱 4800 rpm, 휩 6667 rpm, 6000 rpm 45 Hz(0.45X), 7200 rpm 50 Hz(0.417X)·65 µm, 코스트다운 4200 rpm', () => {
    expect([V.onset, f(V.lockRpm, 4)]).toEqual([4800, '6667']);
    expect([V.oil.whirl6000.hz, f(V.oil.whirl6000.hz / 100, 2)]).toEqual([45, '0.45']);
    expect([V.oil.whip7200.hz, f(V.oil.whip7200.hz / 120, 3), f(V.oil.whip7200.fwd + V.oil.whip7200.bwd, 2)]).toEqual([50, '0.417', '65']);
    expect(V.oil.hyst).toEqual({ onsetRpm: 4800, offRpm: 4200 });
  });

  it('6300 rpm: 러브·풀림 52.5 Hz(0.5X), 러브 역/정 0.73, 유체막 47.25 Hz / 유체력 선회 49 Hz = 0.445X / stall 18.7 Hz = 0.17X', () => {
    expect([V.rub.hz, V.loose.hz, f(V.rub.bwd / V.rub.fwd, 2)]).toEqual([52.5, 52.5, '0.73']);
    expect(0.45 * 105).toBeCloseTo(47.25, 12);
    expect([V.steam.hz, f(V.steam.hz / 110, 3)]).toEqual([49, '0.445']);
    expect([f(V.stall.hz, 3), f(V.stall.hz / 110, 2)]).toEqual(['18.7', '0.17']);
  });

  it('운전조건: 휠 유온 58 °C·하중 1.5에서 사라짐(휩 그대로, 문턱 6240·6120 rpm), 풀림 0.61배, 유체력 선회 0.89배·부하 80 %에서 사라짐, stall 2배', () => {
    const r = V.resp;
    expect([r.whirlOil, r.whirlLoad, r.whipOil, r.whipLoad]).toEqual([0, 0, 1, 1]);
    expect(f(V.whirlGoneT, 2)).toBe('58');
    expect([f(4800 * 1.3, 3), f(4800 * 1.5 ** 0.6, 3)]).toEqual(['6240', '6120']);
    expect([f(r.looseLoad, 2), f(r.steamLoad, 2), r.steamFlow, f(r.stallFlow, 2), r.rubOil]).toEqual(['0.61', '0.89', 0, '2', 1]);
  });

  it('확인 문제 Q1: 40 Hz 모드, 6000 rpm 0.45X = 45 Hz, 잠김 회전수 약 5330 rpm', () => {
    expect([0.45 * 100, f((40 / 0.45) * 60, 3)]).toEqual([45, '5330']);
  });
});
