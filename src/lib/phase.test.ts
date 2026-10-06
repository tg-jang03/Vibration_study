import { describe, expect, it } from 'vitest';
import { gapVoltage } from './proximity';
import {
  addVectors,
  compensate,
  delayFromLag,
  highestPeakAngle,
  KEY_NOTCH,
  keyphasorThreshold,
  keyphasorVoltage,
  lagFromDelay,
  orderVector,
  phaseInConvention,
  phasor,
  responseVector,
  shaftDisplacement,
  simulateRunUp,
  SR_ROTOR,
  subtractVectors,
  toAmpLag,
  toDeg,
  toRad,
  wrap2pi,
  wrapPi,
} from './phase';

const um = 1e-6;

describe('1X 벡터 (Contents §3: V = A e^{−jφ})', () => {
  it('A∠φ ↔ 복소수 왕복, 지연 90°는 −j 방향', () => {
    const p = phasor({ amp: 2, lag: toRad(90) });
    expect(p.re).toBeCloseTo(0, 12);
    expect(p.im).toBeCloseTo(-2, 12);
    for (const deg of [0, 30, 120, 200, 359]) {
      const back = toAmpLag(phasor({ amp: 3, lag: toRad(deg) }));
      expect(back.amp).toBeCloseTo(3, 12);
      expect(toDeg(back.lag)).toBeCloseTo(deg, 9);
    }
    expect(toAmpLag({ re: 0, im: 0 })).toEqual({ amp: 0, lag: 0 });
  });

  it('Slow roll 보상 기준값: 50 µm∠120° − 15 µm∠60° = 44.4 µm∠137° (Contents §6)', () => {
    const c = subtractVectors({ amp: 50 * um, lag: toRad(120) }, { amp: 15 * um, lag: toRad(60) });
    expect(c.amp / um).toBeCloseTo(44.44, 2);
    expect(toDeg(c.lag)).toBeCloseTo(137.0, 1);
    // 크기만 빼면 35 µm — 벡터 결과와 다르다
    expect(compensate({ amp: 50 * um, lag: toRad(120) }, { amp: 15 * um, lag: toRad(60) }, 'scalar').amp / um).toBeCloseTo(35, 9);
  });

  it('크기가 같아도 위상이 120° 바뀌면 변화 벡터는 √3배: 50∠120° → 50∠240°는 86.6 µm', () => {
    const d = subtractVectors({ amp: 50 * um, lag: toRad(240) }, { amp: 50 * um, lag: toRad(120) });
    expect(d.amp / um).toBeCloseTo(50 * Math.sqrt(3), 9);
    expect(toDeg(d.lag)).toBeCloseTo(270, 9);
  });

  it('더하고 빼면 제자리', () => {
    const a = { amp: 42 * um, lag: toRad(151) };
    const b = { amp: 15 * um, lag: toRad(60) };
    const back = subtractVectors(addVectors(a, b), b);
    expect(back.amp / um).toBeCloseTo(42, 9);
    expect(toDeg(back.lag)).toBeCloseTo(151, 9);
  });
});

describe('시간 차이 → 지연각과 관례', () => {
  it('3600 rpm에서 Δt 5.556 ms → 120°, 되돌리면 같은 Δt', () => {
    const fr = 3600 / 60;
    expect(toDeg(lagFromDelay(5.5556e-3, fr))).toBeCloseTo(120, 2);
    expect(delayFromLag(toRad(120), fr) * 1e3).toBeCloseTo(5.5556, 3);
    // 한 바퀴를 넘으면 접는다
    expect(toDeg(lagFromDelay(1 / fr + 5.5556e-3, fr))).toBeCloseTo(120, 2);
    expect(() => lagFromDelay(1e-3, 0)).toThrow(RangeError);
  });

  it('관례별 숫자: 지연 120° = 앞섬 −120° = 영점 기준 30°', () => {
    expect(toDeg(phaseInConvention(toRad(120), 'lag'))).toBeCloseTo(120, 9);
    expect(toDeg(phaseInConvention(toRad(120), 'lead'))).toBeCloseTo(-120, 9);
    expect(toDeg(phaseInConvention(toRad(120), 'zeroCross'))).toBeCloseTo(30, 9);
    expect(toDeg(phaseInConvention(toRad(270), 'lead'))).toBeCloseTo(90, 9);
    expect(toDeg(phaseInConvention(toRad(30), 'zeroCross'))).toBeCloseTo(300, 9);
  });

  it('wrap: 0 ≤ wrap2pi < 2π, −π ≤ wrapPi < π', () => {
    expect(wrap2pi(-1e-18)).toBe(0);
    expect(wrap2pi(2 * Math.PI)).toBe(0);
    expect(wrapPi(Math.PI)).toBeCloseTo(-Math.PI, 12);
  });
});

describe('동기 DFT (P1-1의 DFT를 키페이저에서 시작한 정수 바퀴에)', () => {
  const spr = 64;
  const sig = (oneX: number, lag1: number, twoX = 0, lag2 = 0) =>
    Float64Array.from({ length: spr * 3 }, (_, i) => {
      const th = (2 * Math.PI * i) / spr;
      return shaftDisplacement(th, { oneX: { amp: oneX, lag: lag1 }, twoX: { amp: twoX, lag: lag2 } });
    });

  it('A/2·cos(θ − φ) (pp = A) → 1X 성분 = (A/2) e^{−jφ}, 피크 진폭과 지연각이 그대로', () => {
    const v = toAmpLag(orderVector(sig(100, toRad(120)), spr, 1));
    expect(v.amp).toBeCloseTo(50, 9); // 단일측 피크 진폭 = pp/2
    expect(toDeg(v.lag)).toBeCloseTo(120, 9);
  });

  it('2X가 섞여도 1X 성분은 그대로이고, 2X 성분은 따로 나온다', () => {
    const x = sig(100, toRad(120), 40, toRad(300));
    const v1 = toAmpLag(orderVector(x, spr, 1));
    const v2 = toAmpLag(orderVector(x, spr, 2));
    expect(v1.amp).toBeCloseTo(50, 9);
    expect(toDeg(v1.lag)).toBeCloseTo(120, 9);
    expect(v2.amp).toBeCloseTo(20, 9);
    expect(toDeg(v2.lag)).toBeCloseTo(300, 9);
    expect(() => orderVector([1, 2, 3], spr)).toThrow(RangeError);
  });

  it('원신호에서 가장 높은 봉우리는 2X 때문에 1X 피크(120°)에서 비켜난다: 2X 40 %·300° → 138.4°', () => {
    const oneOnly = { oneX: { amp: 100, lag: toRad(120) } };
    expect(toDeg(highestPeakAngle((th) => shaftDisplacement(th, oneOnly)))).toBeCloseTo(120, 1);
    const withTwo = { oneX: { amp: 100, lag: toRad(120) }, twoX: { amp: 40, lag: toRad(300) } };
    expect(toDeg(highestPeakAngle((th) => shaftDisplacement(th, withTwo)))).toBeCloseTo(138.4, 1);
  });
});

describe('키페이저 펄스 (P2-2 교정 곡선 위)', () => {
  it('홈 없는 곳 −9.45 V, 홈 바닥 −17.3 V, 앞 가장자리 θ = 0에서 문턱 −13.4 V', () => {
    expect(keyphasorVoltage(Math.PI)).toBeCloseTo(gapVoltage(KEY_NOTCH.gap), 9);
    expect(keyphasorVoltage(KEY_NOTCH.width / 2)).toBeCloseTo(gapVoltage(KEY_NOTCH.gap + KEY_NOTCH.depth), 1);
    expect(keyphasorThreshold()).toBeCloseTo(-13.39, 2);
    expect(keyphasorVoltage(0)).toBeCloseTo(keyphasorThreshold(), 5);
    expect(keyphasorVoltage(KEY_NOTCH.width)).toBeCloseTo(keyphasorThreshold(), 5);
    // 펄스 앞은 문턱보다 위(덜 음), 뒤는 아래
    expect(keyphasorVoltage(toRad(-2))).toBeGreaterThan(keyphasorThreshold());
    expect(keyphasorVoltage(toRad(2))).toBeLessThan(keyphasorThreshold());
  });
});

describe('런업과 Slow roll 보상 (예시 로터: 임계 2000 rpm, ζ 0.1, 운전 3600 rpm)', () => {
  it('불평형 응답: 운전 회전수에서 지정 크기, 임계에서 위상 90°, 크기는 1/(2ζ)·(1/1.428)배', () => {
    const op = responseVector(SR_ROTOR.operatingRpm, 45 * um);
    expect(op.amp / um).toBeCloseTo(45, 9);
    expect(toDeg(op.lag)).toBeCloseTo(170.87, 2);
    const crit = responseVector(SR_ROTOR.criticalRpm, 45 * um);
    expect(toDeg(crit.lag)).toBeCloseTo(90, 9);
    expect(crit.amp / um).toBeCloseTo(157.55, 1);
  });

  it('런아웃은 회전수와 무관하게 더해진다: 측정 − 참 = 런아웃 (모든 회전수)', () => {
    const runout = { amp: 15 * um, lag: toRad(60) };
    const ru = simulateRunUp({ respAtOp: 45 * um, runout, slowRollRpm: 300, mode: 'none' });
    for (let i = 0; i < ru.rpm.length; i += 37) {
      const d = subtractVectors(ru.measured[i], ru.truth[i]);
      expect(d.amp / um).toBeCloseTo(15, 9);
      expect(toDeg(d.lag)).toBeCloseTo(60, 6);
    }
  });

  it('300 rpm 벡터 보상 → 운전 회전수에서 참값과 0.72 µm 이내, 크기만 빼면 41 % 작게, 1200 rpm에서 잡으면 37 % 크게', () => {
    const base = { respAtOp: 45 * um, runout: { amp: 15 * um, lag: toRad(60) }, rpm: [3600] };
    const vec = simulateRunUp({ ...base, slowRollRpm: 300, mode: 'vector' });
    expect(vec.slowRoll.amp / um).toBeCloseTo(15.39, 2);
    expect(vec.measured[0].amp / um).toBeCloseTo(42.06, 2);
    expect(toDeg(vec.measured[0].lag)).toBeCloseTo(151.4, 1);
    expect(vec.compensated[0].amp / um).toBeCloseTo(45.71, 2);
    expect(Math.abs(vec.compensated[0].amp - 45 * um) / um).toBeLessThan(0.75);
    const sca = simulateRunUp({ ...base, slowRollRpm: 300, mode: 'scalar' });
    expect(sca.compensated[0].amp / um).toBeCloseTo(26.67, 2);
    expect(toDeg(sca.compensated[0].lag)).toBeCloseTo(151.4, 1);
    const high = simulateRunUp({ ...base, slowRollRpm: 1200, mode: 'vector' });
    expect(high.slowRoll.amp / um).toBeCloseTo(29.47, 2);
    expect(high.compensated[0].amp / um).toBeCloseTo(61.68, 2);
  });

  it('런아웃 위상에 따라 측정값이 커지고 작아진다 (LAB-SRO-01 과제): 170° → 60.0, 350° → 30.0 µm pp', () => {
    const at = (deg: number) => simulateRunUp({ respAtOp: 45 * um, runout: { amp: 15 * um, lag: toRad(deg) }, slowRollRpm: 300, mode: 'none', rpm: [3600] }).measured[0].amp / um;
    expect(at(170)).toBeCloseTo(60.0, 1);
    expect(at(350)).toBeCloseTo(30.0, 1);
  });
});
