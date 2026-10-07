import { describe, expect, it } from 'vitest';
import { halfPowerAF, simulateRunUp, P41_EXAMPLE } from '../lib/rotor/runup';
import {
  dampingCompare,
  dataErrors,
  halfPower,
  heavyHighSpot,
  P41_VALUES,
  polarLoop,
  runUpRecord,
  separation,
} from './p4-1';

describe('P4-1 본문 그림 회귀 테스트', () => {
  it('P41_VALUES 수치 정합성', () => {
    // 3000 rpm 고유 회전수, ζ = 0.05, 편심거리 5 µm (10 µm pp)
    expect(P41_VALUES.crit.amp * 2e6).toBeCloseTo(100, 1);
    expect((P41_VALUES.crit.lag * 180) / Math.PI).toBeCloseTo(90, 5);

    // 운전 회전수 3600 rpm: 약 31.57 µm pp, 164.7°
    expect(P41_VALUES.op.amp * 2e6).toBeCloseTo(31.57, 1);
    expect((P41_VALUES.op.lag * 180) / Math.PI).toBeCloseTo(164.74, 1);

    // Half-power AF (25 rpm 간격): 피크 3000 rpm, AF 약 9.84
    expect(P41_VALUES.hp.peakRpm).toBe(3000);
    expect(P41_VALUES.hp.af).toBeCloseTo(9.839, 2);
    expect(P41_VALUES.hp.n1).toBeCloseTo(2866.5, 0);
    expect(P41_VALUES.hp.n2).toBeCloseTo(3171.5, 0);

    // 분리여유 SM: |3600 - 3000| / 3600 = 16.67 %
    expect(P41_VALUES.sm).toBeCloseTo(16.67, 1);

    // 감쇠비 0.2 비교: 피크 회전수 3128 rpm (이론값과 일치)
    expect(P41_VALUES.z2Peak).toBeCloseTo(3127.7, 0);
    expect(P41_VALUES.z2Af).toBeCloseTo(2.07, 1);
  });

  it('7개 그림 Spec id 및 패널 구성', () => {
    expect(runUpRecord.id).toBe('fig-p4-1-1');
    expect(runUpRecord.panels.length).toBe(2);

    expect(dampingCompare.id).toBe('fig-p4-1-2');
    expect(dampingCompare.panels.length).toBe(2);

    expect(heavyHighSpot.id).toBe('fig-p4-1-3');
    expect(heavyHighSpot.panels.length).toBe(1);

    expect(polarLoop.id).toBe('fig-p4-1-4');
    expect(polarLoop.panels.length).toBe(1);

    expect(halfPower.id).toBe('fig-p4-1-5');
    expect(halfPower.panels.length).toBe(1);

    expect(separation.id).toBe('fig-p4-1-6');
    expect(separation.panels.length).toBe(1);

    expect(dataErrors.id).toBe('fig-p4-1-7');
    expect(dataErrors.panels.length).toBe(3);
  });
});

it("본문 해석 숫자: 런아웃 AF 9.90 → 보상 9.84, ζ 0.05 간격 100·200 rpm AF 9.64·10.06, ζ 0.01 간격 25·50 rpm AF 48.3·49.7",()=>{
  const af=(zeta:number,rpmStep:number)=>halfPowerAF(simulateRunUp({...P41_EXAMPLE.rotor,zeta},{rpmEnd:6000,rpmStep}))!.af;
  expect(P41_VALUES.runoutHp.af).toBeCloseTo(9.905,2);
  expect(P41_VALUES.compHp.af).toBeCloseTo(9.835,2);
  expect(af(.05,100)).toBeCloseTo(9.64,2);
  expect(af(.05,200)).toBeCloseTo(10.06,2);
  expect(af(.01,25)).toBeCloseTo(48.33,1);
  expect(af(.01,50)).toBeCloseTo(49.70,1);
});
it("성긴 rpm 예제는 피크를 유지하고 보간 폭을 늘린다",()=>{for(const [zeta,rpmStep,amp,width,af]of [[.01,200,500,137.629864,21.797595],[.005,100,1000,68.790050,43.610958]]){const v=halfPowerAF(simulateRunUp({...P41_EXAMPLE.rotor,zeta},{rpmEnd:6000,rpmStep}))!;expect(v.peakRpm).toBe(3000);expect(v.peakAmp*2e6).toBeCloseTo(amp,6);expect(v.n2-v.n1).toBeCloseTo(width,5);expect(v.af).toBeCloseTo(af,5);}});
