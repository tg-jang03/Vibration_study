import { describe, expect, it } from 'vitest';
import { flatBand, MOUNTS, seismicMotion, sensorResponse } from './sensor';

describe('sensorResponse — 기초가진 1자유도 센서', () => {
  it('가속도계: r ≪ 1에서 1, 공진(r = 1)에서 위상 90°, 진폭비 1/(2ζ)', () => {
    expect(sensorResponse('accelerometer', 10, 25000, 0.02).ratio).toBeCloseTo(1, 6);
    const res = sensorResponse('accelerometer', 25000, 25000, 0.02);
    expect(res.phaseError).toBeCloseTo(Math.PI / 2, 12);
    expect(res.ratio).toBeCloseTo(25, 10);
  });

  it('속도계: r ≫ 1에서 1, r ≪ 1에서 r²로 작아짐, 공진에서 위상 오차 −90°', () => {
    expect(sensorResponse('velocity', 10000, 10, 0.6).ratio).toBeCloseTo(1, 4);
    expect(sensorResponse('velocity', 0.1, 10, 0.6).ratio).toBeCloseTo(1e-4, 6);
    expect(sensorResponse('velocity', 10, 10, 0.3).phaseError).toBeCloseTo(-Math.PI / 2, 12);
  });

  it('비접촉 변위 센서는 대역 안에서 1', () => {
    expect(sensorResponse('proximity', 123, 1, 0)).toEqual({ ratio: 1, phaseError: 0 });
  });
});

describe('flatBand — ±10 % 평탄 대역', () => {
  it('공진 25 kHz, 감쇠 무시 → 상한 ≈ 7.5 kHz (Contents §6: r = √(1 − 1/1.1))', () => {
    const band = flatBand('accelerometer', 25000, 0);
    expect(band.hi).toBeCloseTo(25000 * Math.sqrt(1 - 1 / 1.1), 0);
    expect(band.hi).toBeGreaterThan(7500);
    expect(band.hi).toBeLessThan(7600);
  });

  it('마운팅이 나빠질수록 대역이 좁아진다 (스터드 > 접착 > 자석 > 손)', () => {
    const his = (['stud', 'adhesive', 'magnet', 'hand'] as const).map((k) => flatBand('accelerometer', MOUNTS[k].fn, MOUNTS[k].zeta).hi);
    for (let i = 1; i < his.length; i++) expect(his[i]).toBeLessThan(his[i - 1]);
  });

  it('속도계: 감쇠 0.6이면 0.1일 때보다 낮은 주파수부터 평탄하다', () => {
    const low = flatBand('velocity', 10, 0.1).lo;
    const damped = flatBand('velocity', 10, 0.6).lo;
    expect(damped).toBeLessThan(low);
    expect(damped).toBeGreaterThan(10); // 그래도 고유진동수보다는 위
  });
});

describe('seismicMotion — 통 안 질량의 움직임 (LAB-SNS-01 움직이는 그림)', () => {
  const amp = (re: number, im: number) => Math.hypot(re, im);
  it('r ≪ 1: 질량이 통과 함께(x ≈ 1), 스프링 늘어남 ≈ r² — 가속도에 비례', () => {
    const m = seismicMotion(0.1, 0.02);
    expect(amp(m.xRe, m.xIm)).toBeCloseTo(1.01, 3);
    expect(amp(m.zRe, m.zIm)).toBeCloseTo(0.01 / Math.sqrt((1 - 0.01) ** 2 + 0.004 ** 2), 9);
  });
  it('r = 1: 상대 운동 1/(2ζ), 위상 90° 늦음 / r ≫ 1: 질량이 공간에 거의 멈춤, z ≈ −y', () => {
    const m = seismicMotion(1, 0.05);
    expect(amp(m.zRe, m.zIm)).toBeCloseTo(10, 9);
    expect(m.zRe).toBeCloseTo(0, 9);
    expect(m.zIm).toBeCloseTo(-10, 9); // 늦음 = 허수부 음 (부호까지 고정)
    const h = seismicMotion(20, 0.05);
    expect(amp(h.xRe, h.xIm)).toBeLessThan(0.01);
    expect(h.zRe).toBeCloseTo(-1, 2);
  });
  it('상대 운동의 크기 = 가속도계 응답 × r² (sensorResponse와 같은 H)', () => {
    for (const r of [0.2, 0.7, 1.3, 3]) {
      const m = seismicMotion(r, 0.1);
      expect(amp(m.zRe, m.zIm)).toBeCloseTo(r * r * sensorResponse('accelerometer', r * 1000, 1000, 0.1).ratio, 12);
    }
  });
});
