import { describe, expect, it } from 'vitest';
import { unbalanceVector } from '../rotor/runup';
import { CAUSE_LABEL, crackTrend, lagDiff, ONEX_CAUSES, oneXReadouts, orbit1X, QUIZ_CASES, ROTOR_1X, SENSORS, sweep, vectorAt, type OneXOptions, type Sensor } from './oneX';

const R = ROTOR_1X;
const healthy: OneXOptions = { cause: 'healthy', severity: 0 };
/** 원인 o의 벡터에서 건전한 로터의 벡터를 복소수로 뺀 것 (그 원인만의 몫) */
const only = (o: OneXOptions, s: Sensor, rpm: number, order: 1 | 2 = 1) => {
  const a = vectorAt(o, s, rpm, order);
  const b = vectorAt(healthy, s, rpm, order);
  return { re: a.re - b.re, im: a.im - b.im, amp: Math.hypot(a.re - b.re, a.im - b.im) };
};

describe('lib/faults/oneX — 1X 계열 설명용 로터 (P7-2)', () => {
  it('정적 불평형 몫 = P4-1 unbalanceVector (병진 모드 5000 rpm, ζ 0.06, e 30 µm, heavy spot 60°)', () => {
    for (const rpm of [300, 1500, 3000]) {
      const u = only({ cause: 'static', severity: 0.6 }, 'B1H', rpm);
      const ref = unbalanceVector({ naturalRpm: R.trans.H, zeta: R.trans.zeta, eccentricity: 30e-6, heavySpot: (60 * Math.PI) / 180 }, rpm);
      expect(u.re).toBeCloseTo(ref.amp * Math.cos(ref.lag), 12);
      expect(u.im).toBeCloseTo(-ref.amp * Math.sin(ref.lag), 12);
    }
  });

  it('정적 불평형은 두 베어링이 같고, 커플 불평형은 두 베어링이 반대 (모드 형상 [1, 1] · [1, −1])', () => {
    const s = { cause: 'static', severity: 1 } as const;
    const c = { cause: 'couple', severity: 1 } as const;
    const a = only(s, 'B1H', 3000);
    const b = only(s, 'B2H', 3000);
    expect(b.re).toBeCloseTo(a.re, 15);
    expect(b.im).toBeCloseTo(a.im, 15);
    const p = only(c, 'B1H', 3000);
    const q = only(c, 'B2H', 3000);
    expect(q.re).toBeCloseTo(-p.re, 15);
    expect(q.im).toBeCloseTo(-p.im, 15);
  });

  it('정방향 성분은 V가 H보다 90° 늦다 (방향마다 모드가 같으면 정확히 90°)', () => {
    // 방향마다 고유 회전수가 달라 생기는 위상 차를 빼면 90°
    const u = only({ cause: 'static', severity: 1 }, 'B1H', 3000);
    const v = only({ cause: 'static', severity: 1 }, 'B1V', 3000);
    const ph = (r: number) => (Math.atan2(2 * R.trans.zeta * r, 1 - r * r) * 180) / Math.PI;
    const lag = (z: { re: number; im: number }) => (Math.atan2(-z.im, z.re) * 180) / Math.PI;
    expect(lagDiff(lag(u), lag(v)) - (ph(3000 / R.trans.V) - ph(3000 / R.trans.H))).toBeCloseTo(90, 9);
  });

  it('런아웃 몫은 회전수와 무관하고 slow roll 보상으로 사라진다', () => {
    const o: OneXOptions = { cause: 'runout', severity: 0.6 };
    const a = only(o, 'B1H', 300);
    const b = only(o, 'B1H', 3000);
    expect(b.re).toBeCloseTo(a.re, 15);
    expect(b.amp).toBeCloseTo(0.6 * 25e-6, 15);
    const comp = sweep(o, 'B1H', 1, 25, true);
    const compH = sweep(healthy, 'B1H', 1, 25, true);
    expect(comp[comp.length - 1].amp).toBeCloseTo(compH[compH.length - 1].amp, 15);
  });

  it('휨: slow roll에서 b(1/(1 − r²)), 운전 회전수에서 b/(1 − 0.36) = 1.5625 b (감쇠 무시 수준)', () => {
    const o: OneXOptions = { cause: 'bow', severity: 0.6 };
    const b = 0.6 * 25e-6;
    expect(only(o, 'B1H', 300).amp / b).toBeCloseTo(1 / (1 - 0.06 ** 2), 3);
    expect(only(o, 'B1H', 3000).amp / b).toBeCloseTo(1 / Math.hypot(1 - 0.36, 2 * 0.06 * 0.6), 9);
  });

  it('크랙 2X: 병진 모드의 절반(수평 2500 rpm)에서 봉우리, 높이 c₂/(2ζ) = 10 µm Peak', () => {
    const r = oneXReadouts({ cause: 'crack', severity: 0.6 });
    expect(r.twoXmaxRpm).toBe(R.trans.H / 2);
    expect(r.twoXmax).toBeCloseTo((0.6 * 2e-6) / (2 * R.trans.zeta), 12);
    expect(oneXReadouts(healthy).twoXmax).toBe(0);
  });

  it('구조 공진: B1 수평만 받침대 고유진동수(2850 rpm)에서 봉우리, 다른 센서는 증폭 없음', () => {
    const o: OneXOptions = { cause: 'resonance', severity: 0.6 };
    expect(oneXReadouts(o).oneXmaxRpm).toBe(R.pedestal.rpm);
    const s = { cause: 'static', severity: 0.6 * (12 / 50) } as const;
    for (const sensor of ['B1V', 'B2H', 'B2V'] as const) expect(vectorAt(o, sensor, 3000).amp).toBeCloseTo(vectorAt(s, sensor, 3000).amp, 15);
  });

  it('방향이 정해진 힘: 수평이 크고 V는 같은 위상의 30 % — H/V 위상차가 0°에 가깝다', () => {
    const r = oneXReadouts({ cause: 'directional', severity: 0.6 });
    expect(Math.abs(r.hvPhase)).toBeLessThan(15);
    expect(r.hvRatio).toBeGreaterThan(3);
    const u = oneXReadouts({ cause: 'static', severity: 0.6 });
    expect(Math.abs(u.hvPhase - 90)).toBeLessThan(3);
  });

  it('오빗: 운전 회전수의 1X 벡터로 그린 타원의 끝이 H·V 진폭과 같다', () => {
    const o: OneXOptions = { cause: 'static', severity: 0.6 };
    const { x, y } = orbit1X(o, 'B1', 3000, 721);
    expect(Math.max(...x)).toBeCloseTo(vectorAt(o, 'B1H', 3000).amp, 9);
    expect(Math.max(...y)).toBeCloseTo(vectorAt(o, 'B1V', 3000).amp, 9);
  });

  it('크랙 추세: 0개월 = 건전, 12개월 = 정도 1, 2X가 단조 증가', () => {
    const t = crackTrend(12);
    expect(t[0].twoX.amp).toBe(0);
    expect(t[12].twoX.amp).toBeCloseTo(vectorAt({ cause: 'crack', severity: 1 }, 'B1H', 3000, 2).amp, 15);
    for (let m = 1; m <= 12; m++) expect(t[m].twoX.amp).toBeGreaterThan(t[m - 1].twoX.amp);
  });

  it('원인 이름·문제 목록이 빠짐없고, 정도 0이면 건전과 같다 (받침대 공진은 기계의 성질이라 B1 수평은 증폭이 남는다)', () => {
    expect(ONEX_CAUSES.every((c) => CAUSE_LABEL[c])).toBe(true);
    expect(new Set(QUIZ_CASES).size).toBe(QUIZ_CASES.length);
    for (const cause of ONEX_CAUSES)
      for (const s of SENSORS) {
        if (cause === 'resonance' && s === 'B1H') continue;
        expect(vectorAt({ cause, severity: 0 }, s, 3000).amp).toBeCloseTo(vectorAt(healthy, s, 3000).amp, 15);
      }
    expect(vectorAt({ cause: 'resonance', severity: 0 }, 'B1H', 3000).amp).toBeGreaterThan(3 * vectorAt(healthy, 'B1H', 3000).amp);
  });
});
