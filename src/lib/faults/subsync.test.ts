import { describe, expect, it } from 'vitest';
import { BASE_COND, caseConditions, conditionResponse, LOCK_RPM, mainSub, oilOnset, onsetOffset, SUB_CASES, SUB_CAUSES, SUB_LABEL, SUB_MACHINE, subOrbit, subState } from './subsync';

describe('lib/faults/subsync — 1X 아래 성분 설명용 규칙 모델 (P7-4)', () => {
  it('유체막: 문턱 위에서 0.45X로 따라가다 0.45 f_r = f_n에서 잠긴다 (6666.7 rpm)', () => {
    expect(LOCK_RPM).toBeCloseTo((60 * 50) / 0.45, 9);
    expect(mainSub(subState('oilfilm', 4500))).toBeNull();
    expect(mainSub(subState('oilfilm', 6000))!.hz).toBeCloseTo(45, 12);
    for (const rpm of [6750, 7200]) expect(mainSub(subState('oilfilm', rpm))!.hz).toBe(SUB_MACHINE.fn);
  });

  it('유체막 문턱은 하중·유온과 함께 오르고, 코스트다운은 문턱의 85 %까지 남는다 (히스테리시스)', () => {
    expect(oilOnset(BASE_COND)).toBe(4800);
    expect(oilOnset({ ...BASE_COND, oilT: 60 })).toBeCloseTo(6240, 9);
    expect(oilOnset({ ...BASE_COND, load: 1.5 })).toBeCloseTo(4800 * 1.5 ** 0.6, 9);
    expect(onsetOffset('oilfilm')).toEqual({ onsetRpm: 4800, offRpm: 4200 });
    expect(onsetOffset('rub')).toEqual({ onsetRpm: 5700, offRpm: 5700 });
  });

  it('러브·풀림은 정확히 ½X이고 회전에 묶인다, 러브는 역방향이 크고 풀림은 정 = 역', () => {
    const r = mainSub(subState('rub', 6300))!;
    expect([r.hz, r.locked]).toEqual([52.5, true]);
    expect(r.bwd / r.fwd).toBeGreaterThan(0.5);
    const l = mainSub(subState('looseness', 6300))!;
    expect([l.hz, l.locked, l.fwd === l.bwd]).toEqual([52.5, true, true]);
  });

  it('구조 공진은 회전수와 무관한 38 Hz, 유체력 선회는 공정 부하 문턱(80 %)에서, stall은 유량 75 % 아래에서', () => {
    for (const rpm of [3000, 4800, 7200]) expect(mainSub(subState('structural', rpm))!.hz).toBe(38);
    expect(mainSub(subState('steam', 6600, { ...BASE_COND, flow: 79 }))).toBeNull();
    expect(mainSub(subState('steam', 6600, { ...BASE_COND, flow: 100 }))).not.toBeNull();
    expect(mainSub(subState('stall', 6600, { ...BASE_COND, flow: 80 }))).toBeNull();
    expect(mainSub(subState('stall', 6600, { ...BASE_COND, flow: 60 }))!.hz / 110).toBeCloseTo(0.17, 9);
  });

  it('운전조건 반응: 휠은 유온·하중에 사라지고 휩은 남는다, 유체력 선회는 부하에, stall은 유량에, 러브는 무반응', () => {
    expect(conditionResponse('oilfilm', 6000, { oilT: 60 })).toBe(0);
    expect(conditionResponse('oilfilm', 6000, { load: 1.5 })).toBe(0);
    expect(conditionResponse('oilfilm', 7200, { oilT: 60 })).toBe(1);
    expect(conditionResponse('steam', 6600, { flow: 80 })).toBe(0);
    expect(conditionResponse('stall', 6600, { flow: 40 })).toBeCloseTo(2, 12);
    expect(conditionResponse('rub', 6300, { oilT: 60, load: 1.5 })).toBe(1);
    expect(conditionResponse('structural', 6600, { oilT: 60, load: 1.5, flow: 60 })).toBe(1);
  });

  it('오빗: ½X(묶임)는 키페이저 점이 두 자리, 0.45X는 흩어진다', () => {
    const distinct = (dots: [number, number][]) => new Set(dots.map(([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`)).size;
    expect(distinct(subOrbit(subState('rub', 6300), 12, 72).dots)).toBe(2);
    expect(distinct(subOrbit(subState('oilfilm', 6000), 12, 72).dots)).toBeGreaterThan(8);
  });

  it('케이스·이름이 빠짐없다', () => {
    expect(SUB_CAUSES.every((c) => SUB_LABEL[c])).toBe(true);
    for (const c of SUB_CASES) expect(mainSub(subState(c.cause, c.rpm, caseConditions(c.cause)))).not.toBeNull();
  });
});
