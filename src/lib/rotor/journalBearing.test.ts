import { describe, expect, it } from 'vitest';
import { PROBE } from '../proximity';
import { P43_BEARING as B, P43_EXAMPLE as E, attitudeAngle, loadFactor, journalEquilibrium, shortBearingLoad, shortBearingPressure, measureCenterline } from './journalBearing';
const omega = (rpm: number) => rpm * Math.PI / 30;
const state = (load = E.load, rpm = 3000, viscosity = E.viscosity) => journalEquilibrium(B, load, omega(rpm), viscosity);

describe('Ocvirk 짧은 베어링 해석해', () => {
  it('NACA 하중/자세각 식: ε=.5 문헌 기준', () => {
    expect(loadFactor(.5)).toBeCloseTo(.7503810818121557, 12);
    expect(attitudeAngle(.5) * 180 / Math.PI).toBeCloseTo(53.68020059989583, 10);
  });
  it.each([.2, .5, .8])('ε=%f 압력의 독립 수치 적분과 하중 성분', epsilon => {
    const nx = 1200, nz = 10, dtheta = Math.PI / nx, dz = B.length / nz;
    let radial = 0, tangent = 0;
    for (let i = 0; i <= nx; i++) {
      const theta = i * dtheta, wi = i === 0 || i === nx ? 1 : i % 2 ? 4 : 2;
      let integrated = 0;
      for (let j = 0; j <= nz; j++) {
        const wj = j === 0 || j === nz ? 1 : j % 2 ? 4 : 2;
        integrated += wj * shortBearingPressure(B, epsilon, E.omega, E.viscosity, theta, -B.length / 2 + j * dz) * B.radius;
      }
      integrated *= dz / 3;
      radial += wi * integrated * Math.cos(theta); tangent += wi * integrated * Math.sin(theta);
    }
    radial *= dtheta / 3; tangent *= dtheta / 3;
    const scale = E.viscosity * E.omega * B.radius * B.length ** 3 / B.radialClearance ** 2;
    const radialTheory = -scale * epsilon ** 2 / (1 - epsilon ** 2) ** 2;
    const tangentTheory = scale * Math.PI * epsilon / (4 * (1 - epsilon ** 2) ** 1.5);
    expect(radial / radialTheory).toBeCloseTo(1, 7);
    expect(tangent / tangentTheory).toBeCloseTo(1, 7);
    expect(Math.hypot(radial, tangent) / shortBearingLoad(B, epsilon, E.omega, E.viscosity)).toBeCloseTo(1, 7);
  });
  it('1000 N, 3000 rpm 수치와 힘 평형', () => {
    const r = state();
    expect(r.eccentricityRatio).toBeCloseTo(.6757879254239436, 12);
    expect(r.attitude * 180 / Math.PI).toBeCloseTo(40.585022065584184, 10);
    expect(r.x * 1e6).toBeCloseTo(43.965120984956535, 9);
    expect(r.y * 1e6).toBeCloseTo(-51.322133025295344, 9);
    expect(r.minimumFilm * 1e6).toBeCloseTo(32.42120745760564, 9);
    expect(shortBearingLoad(B, r.eccentricityRatio, E.omega, E.viscosity)).toBeCloseTo(1000, 9);
    const scale = E.viscosity * E.omega * B.radius * B.length ** 3 / B.radialClearance ** 2;
    const a = scale * r.eccentricityRatio ** 2 / (1 - r.eccentricityRatio ** 2) ** 2;
    const b = scale * Math.PI * r.eccentricityRatio / (4 * (1 - r.eccentricityRatio ** 2) ** 1.5);
    expect(-a * Math.sin(r.attitude) + b * Math.cos(r.attitude)).toBeCloseTo(0, 9);
    expect(a * Math.cos(r.attitude) + b * Math.sin(r.attitude)).toBeCloseTo(E.load, 9);
  });
  it('하중 반/회전수 2배/점도 2배의 무차원 해가 같다', () => {
    const r = state(500), speed = state(1000, 6000), viscosity = state(1000, 3000, .04);
    expect(r.eccentricityRatio).toBe(speed.eccentricityRatio);
    expect(r.eccentricityRatio).toBe(viscosity.eccentricityRatio);
    expect(r.eccentricityRatio).toBeCloseTo(.5596683868695211, 12);
    expect(r.attitude).toBeGreaterThan(state().attitude);
    expect(r.minimumFilm).toBeGreaterThan(state().minimumFilm);
  });
  it('회전 방향을 바꾸면 x만 반전', () => {
    const a=state(),b=journalEquilibrium(B,E.load,E.omega,E.viscosity,'cw');
    expect(b.x).toBe(-a.x); expect(b.y).toBe(a.y); expect(b.minimumFilm).toBe(a.minimumFilm);
  });
  it('정지 바닥은 유체 해와 구분하며 압력은 끝/발산 반원에서 0', () => {
    expect(state(1000, 0)).toEqual({ x:0,y:-B.radialClearance,eccentricityRatio:1,attitude:0,minimumFilm:0,contactReference:true });
    expect(shortBearingPressure(B,.5,E.omega,E.viscosity,1,B.length/2)).toBe(0);
    expect(shortBearingPressure(B,.5,E.omega,E.viscosity,4,0)).toBe(0);
    expect(shortBearingPressure(B,.5,0,E.viscosity,1,0)).toBe(0);
  });
  it('불가능한 입력 거부', () => {
    expect(()=>loadFactor(1)).toThrow(RangeError);
    expect(()=>journalEquilibrium(B,0,E.omega,E.viscosity)).toThrow(RangeError);
    expect(()=>journalEquilibrium(B,E.load,-1,E.viscosity)).toThrow(RangeError);
    expect(()=>journalEquilibrium({...B,radialClearance:B.radius},E.load,E.omega,E.viscosity)).toThrow(RangeError);
  });
});

describe('Shaft centerline DC 차분 환산', () => {
  it.each(['ccw','cw'] as const)('%s 방향의 45°/135° 프로브 위치 왕복', rotation => {
    const p=journalEquilibrium(B,E.load,E.omega,E.viscosity,rotation),r=measureCenterline(B,p,{coldGap:E.coldGap});
    expect(r.valid).toBe(true); expect(r.reconstructed!.x).toBeCloseTo(p.x,12); expect(r.reconstructed!.y).toBeCloseTo(p.y,12); expect(r.error).toBe(0);
  });
  it('현재 전압은 −8.933 V / −9.423 V', () => {
    const r=measureCenterline(B,state(),{coldGap:E.coldGap});
    expect(r.voltageA).toBeCloseTo(-8.933004054994802,12);
    expect(r.voltageB).toBeCloseTo(-9.422579412225506,12);
    expect(r.coldVoltage).toBeCloseTo(-9.448818897637794,12);
  });
  it('동일 cold/운전 바이어스는 취소', () => {
    const a=measureCenterline(B,state(),{coldGap:E.coldGap}), b=measureCenterline(B,state(),{coldGap:E.coldGap,commonBias:.2});
    expect(b.voltageA-a.voltageA).toBeCloseTo(.2,12); expect(b.error).toBe(0);
  });
  it('기준 이후 0.5 V drift는 63.5 µm 오차', () => {
    const r=measureCenterline(B,state(),{coldGap:E.coldGap,driftA:.5});
    expect(r.error!*1e6).toBeCloseTo(.5/PROBE.sensitivity*1e6,9);
    expect(r.error!*1e6).toBeCloseTo(63.5,9);
  });
  it('cold 바닥 위치를 빼먹으면 반경 간극만큼 y 오류', () => {
    const r=measureCenterline(B,state(),{coldGap:E.coldGap,useColdPosition:false});
    expect(r.reconstructed!.y-state().y).toBeCloseTo(B.radialClearance,12);
    expect(r.error!*1e6).toBeCloseTo(100,9);
  });
  it('선형 범위의 평균0 런아웃은 DC를 옮기지 않음', () => {
    const a=measureCenterline(B,state(),{coldGap:E.coldGap}),b=measureCenterline(B,state(),{coldGap:E.coldGap,runoutAmplitude:20e-6});
    expect(b.voltageA).toBeCloseTo(a.voltageA,12); expect(b.voltageB).toBeCloseTo(a.voltageB,12); expect(b.error).toBe(0);
  });
  it('비선형 범위에서는 전압이 있어도 위치 환산 거부', () => {
    const r=measureCenterline(B,state(),{coldGap:.3e-3});
    expect(r.valid).toBe(false); expect(r.reconstructed).toBeNull(); expect(r.error).toBeNull(); expect(Number.isFinite(r.voltageA)).toBe(true);
  });
  it('종속/잘못된 프로브 입력 거부', () => {
    expect(()=>measureCenterline(B,state(),{coldGap:E.coldGap,angleA:0,angleB:Math.PI})).toThrow(RangeError);
    expect(()=>measureCenterline(B,state(),{coldGap:E.coldGap,driftA:NaN})).toThrow(RangeError);
  });
});
