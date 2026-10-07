import { describe, expect, it } from 'vitest';
import { exampleRotor, jeffcottResponse, orbitPoint, sampleOrbit } from './jeffcott';
import { unbalanceVector } from './runup';

const omega = (rpm: number) => rpm * Math.PI / 30;
describe('Jeffcott 해석해', () => {
  it.each([500, 1500, 3000, 6000, 7500])('등방 %i rpm: 1자유도 해와 같고 역방향 성분은 정확히 0', rpm => {
    const r = jeffcottResponse(exampleRotor(), omega(rpm));
    const ref = unbalanceVector({ naturalRpm: 3000, zeta: 0.05, eccentricity: 10e-6 }, rpm);
    expect(r.amplitudeX).toBeCloseTo(ref.amp, 12);
    expect(r.amplitudeY).toBeCloseTo(ref.amp, 12);
    expect(r.lagX).toBeCloseTo(ref.lag, 12);
    expect(r.amplitudeBackward).toBe(0);
    for (const p of sampleOrbit(r)) expect(Math.hypot(p.x, p.y)).toBeCloseTo(ref.amp, 12);
    expect(r.direction).toBe('forward');
  });
  it('비등방 고유 회전수는 3000, 3420.5263 rpm', () => {
    const r = jeffcottResponse(exampleRotor(1.3), omega(3200));
    expect(r.omegaX * 30 / Math.PI).toBeCloseTo(3000, 8);
    expect(r.omegaY * 30 / Math.PI).toBeCloseTo(3420.5262753, 6);
    expect(r.amplitudeX * 1e6).toBeCloseTo(65.29847391908446, 6);
    expect(r.amplitudeY * 1e6).toBeCloseTo(58.603334760191466, 6);
    expect(r.amplitudeForward * 1e6).toBeCloseTo(36.11013267552362, 5);
    expect(r.amplitudeBackward * 1e6).toBeCloseTo(50.44976797512838, 5);
    expect(r.direction).toBe('backward');
  });
  it.each([2500, 3200, 4000])('무감쇠 %i rpm: 임계속도 사이에서만 역방향', rpm => {
    const r = jeffcottResponse(exampleRotor(1.3, 0), omega(rpm));
    expect(r.direction).toBe(rpm === 3200 ? 'backward' : 'forward');
  });
  it('감쇠를 키우면 역방향이 사라질 수 있다', () => {
    expect(jeffcottResponse(exampleRotor(1.3, .01), omega(3200)).direction).toBe('backward');
    expect(jeffcottResponse(exampleRotor(1.3, .2), omega(3200)).direction).toBe('forward');
  });
  it('정/역 성분 합은 각 방향 phasor 해와 같고 운동방정식을 만족한다', () => {
    const rotor = exampleRotor(1.3), speed = omega(3200);
    const r = jeffcottResponse(rotor, speed), force = rotor.mass * rotor.eccentricity * speed ** 2;
    for (const theta of [0, .2, 1, 2, 4, 6]) {
      const p = orbitPoint(r, theta);
      const xd = -speed * (r.x.re * Math.sin(theta) + r.x.im * Math.cos(theta));
      const yd = -speed * (r.y.re * Math.sin(theta) + r.y.im * Math.cos(theta));
      expect(p.x).toBeCloseTo(r.x.re * Math.cos(theta) - r.x.im * Math.sin(theta), 12);
      expect(p.y).toBeCloseTo(r.y.re * Math.cos(theta) - r.y.im * Math.sin(theta), 12);
      expect((rotor.kx - rotor.mass * speed ** 2) * p.x + rotor.damping * xd).toBeCloseTo(force * Math.cos(theta), 9);
      expect((rotor.ky - rotor.mass * speed ** 2) * p.y + rotor.damping * yd).toBeCloseTo(force * Math.sin(theta), 9);
    }
  });
  it('오빗 면적 부호와 정/역 성분 우세가 일치한다', () => {
    for (const rpm of [1000, 3200, 6000]) {
      const r = jeffcottResponse(exampleRotor(1.3), omega(rpm));
      const points = sampleOrbit(r, 721);
      const area = points.slice(1).reduce((sum, p, i) => sum + points[i].x * p.y - p.x * points[i].y, 0) / 2;
      expect(area).toBeCloseTo(Math.PI * (r.amplitudeForward ** 2 - r.amplitudeBackward ** 2), 12);
      expect(Math.sign(area)).toBe(r.direction === 'forward' ? 1 : -1);
    }
  });
  it('정지/불평형 0에서는 0, 무감쇠 공진은 유한 해가 없음을 알린다', () => {
    expect(jeffcottResponse(exampleRotor(), 0).direction).toBe('stationary');
    expect(jeffcottResponse({ ...exampleRotor(), eccentricity: 0 }, omega(3000)).amplitudeX).toBe(0);
    expect(() => jeffcottResponse(exampleRotor(1, 0), omega(3000))).toThrow(/resonance/);
  });
  it('잘못된 입력은 거부한다', () => {
    for (const key of ['mass', 'kx', 'ky', 'damping', 'eccentricity'] as const) expect(() => jeffcottResponse({ ...exampleRotor(), [key]: -1 }, 1)).toThrow(RangeError);
    expect(() => jeffcottResponse(exampleRotor(), NaN)).toThrow(RangeError);
    expect(() => sampleOrbit(jeffcottResponse(exampleRotor(), 1), 1)).toThrow(RangeError);
  });
});
