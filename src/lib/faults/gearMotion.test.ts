import { describe, expect, it } from 'vitest';
import { GEAR_DEMO, GEAR_PAIR } from './gear';
import { gearToothAngle, meshEvents, meshTime, pinionToothAngle } from './gearMotion';

const { z1, z2, f1, f2, htPeriod } = GEAR_PAIR;
const near = (a: number, b: number) => Math.abs(Math.cos(a - b) - 1) < 1e-9;

describe('기어 이빨의 각도와 맞물림 시각', () => {
  it('맞물림 n에서 피니언 이빨 n mod 23은 기어 쪽(0), 기어 이빨 n mod 61은 피니언 쪽(π)에 있다', () => {
    for (const n of [0, 1, 22, 23, 60, 61, 500, 1402]) {
      const t = meshTime(n);
      expect(near(pinionToothAngle(n % z1, t), 0)).toBe(true);
      expect(near(gearToothAngle(n % z2, t), Math.PI)).toBe(true);
    }
  });
});

describe('meshEvents — 상한 이빨의 충격 간격 (P7-6, Contents §6)', () => {
  const gaps = (ev: { t: number }[]) => ev.slice(1).map((e, i) => e.t - ev[i].t);
  it('깨진 피니언 이빨: 피니언 한 바퀴(1/24.83 s)마다 한 번, 깨진 기어 이빨: 기어 한 바퀴(1/9.363 s)마다', () => {
    for (const g of gaps(meshEvents('broken', 'pinion', 0, 0.5, true))) expect(g).toBeCloseTo(1 / f1, 12);
    for (const g of gaps(meshEvents('broken', 'gear', 0, 1, true))) expect(g).toBeCloseTo(1 / f2, 12);
    expect(f1).toBeCloseTo(24.83, 2);
    expect(f2).toBeCloseTo(9.363, 3);
  });
  it('헌팅 투스: 두 상한 이빨이 함께 맞물리는 것은 2.456 s(= 1403번 = 피니언 61바퀴 = 기어 23바퀴)마다 한 번', () => {
    const both = meshEvents('hunting', 'gear', 0, 3 * htPeriod, true).filter((e) => e.damaged === 2);
    expect(both.length).toBe(3);
    for (const g of gaps(both)) expect(g).toBeCloseTo(2.456, 3);
    expect(both[1].n - both[0].n).toBe(z1 * z2);
    expect(both[0].p).toBe(GEAR_DEMO.pinionTooth);
    expect(both[0].g).toBe(GEAR_DEMO.gearTooth);
  });
  it('맞물림은 1초에 GMF = 571.2번', () => {
    expect(meshEvents('healthy', 'gear', 0, 1).length).toBe(Math.round(GEAR_PAIR.gmf));
  });
});
