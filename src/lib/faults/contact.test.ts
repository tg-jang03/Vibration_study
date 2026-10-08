import { describe, expect, it } from 'vitest';
import { footLooseness, forwardFraction, fullOrderSpectrum, harmonicOf, meanPosition, newkirk, nlRotor, orderPart, simulate, simulateTransient, SPR, type ContactRecord } from './contact';

const jeffcott = (e: number, W: number, zeta: number) => (e * W * W) / Math.hypot(1 - W * W, 2 * zeta * W);

describe('lib/faults/contact — 비선형 로터 (P7-3)', () => {
  it('orderPart: 알려진 정·역 성분을 정확히 되찾는다 (½X 포함)', () => {
    const revs = 8;
    const n = revs * SPR;
    const x = new Float64Array(n);
    const y = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const th = (2 * Math.PI * i) / SPR;
      // 1X 정방향 반지름 0.3 + 1X 역방향 0.1 + ½X 정방향 0.2
      x[i] = 0.3 * Math.cos(th) + 0.1 * Math.cos(th) + 0.2 * Math.cos(th / 2);
      y[i] = 0.3 * Math.sin(th) - 0.1 * Math.sin(th) + 0.2 * Math.sin(th / 2);
    }
    const rec: ContactRecord = { rotor: nlRotor('normal', 0, 1), spr: SPR, revs, x, y, contactFraction: 0 };
    const o1 = orderPart(rec, 1);
    const oh = orderPart(rec, 0.5);
    expect([o1.fwd, o1.bwd, oh.fwd, oh.bwd].map((v) => Math.round(v * 1e9) / 1e9)).toEqual([0.3, 0.1, 0.2, 0]);
  });

  it('접촉이 없으면 Jeffcott 해석해: 정방향 원 e r²/∣1 − r² + j2ζr∣, 역방향 0, 평균 = 중력 처짐', () => {
    for (const W of [0.6, 1.4, 2.6]) {
      const rec = simulate({ speed: W, zeta: 0.05, kappa: 1, e: 0.16, fs: [0, -0.7] }, 32, 200);
      const o = orderPart(rec, 1);
      expect(o.fwd).toBeCloseTo(jeffcott(0.16, W, 0.05), 6);
      expect(o.bwd).toBeLessThan(1e-6);
      const [mx, my] = meanPosition(rec);
      expect(mx).toBeCloseTo(0, 6);
      expect(my).toBeCloseTo(-0.7, 6);
    }
  });

  it('미스얼라인 2X: 방향이 정해진 힘의 선형 응답 a₂/∣1 − (2Ω)² + j2ζ·2Ω∣, 정·역이 같다(선), 평균이 예하중만큼 이동', () => {
    const r = nlRotor('misalign', 0.8, 0.8);
    const rec = simulate(r, 32, 200);
    const o2 = orderPart(rec, 2);
    const amp = r.misalign!.a2 / Math.hypot(1 - 1.6 ** 2, 2 * 0.05 * 1.6);
    expect(o2.fwd).toBeCloseTo(amp / 2, 6);
    expect(o2.bwd).toBeCloseTo(amp / 2, 6);
    const [mx, my] = meanPosition(rec);
    const p = r.misalign!.p;
    expect(mx).toBeCloseTo(p * Math.cos(Math.PI / 3), 6);
    expect(my).toBeCloseTo(-0.7 + p * Math.sin(Math.PI / 3), 6);
  });

  it('접촉 마찰은 축을 회전 반대로 민다: 큰 마찰의 원주 러브는 역방향 선회로 커지다 멈춘다', () => {
    const t = simulateTransient({ ...nlRotor('rub', 0.5, 2.3), e: 0.25, contact: { cx: 0, cy: 0, kc: 40, mu: 0.15 } }, 200, 1.8);
    expect(t.stopped).toBe(true);
    expect(forwardFraction(t.x, t.y, t.x.length - 3 * SPR)).toBeLessThan(0.5);
    const free = simulateTransient({ ...nlRotor('rub', 0.5, 2.3), e: 0.25, contact: { cx: 0, cy: 0, kc: 40, mu: 0 } }, 60, 1.8);
    expect(free.stopped).toBe(false);
  });

  it('부분 러브는 임계속도의 약 2배에서 ½X, 원주 러브로 번지면 역방향 성분이 회전수와 무관한 주파수에 머문다', () => {
    const half = simulate(nlRotor('rub', 0.5, 2.6), 64, 300);
    expect(orderPart(half, 0.5).yAmp).toBeGreaterThan(4 * orderPart(half, 1).yAmp);
    const hz = [2.6, 2.8, 3.0].map((W) => {
      const f = fullOrderSpectrum(simulate(nlRotor('rub', 1, W), 64, 300));
      let bi = 0;
      for (let i = 0; i < f.order.length; i++) if (f.order[i] < -0.05 && f.amp[i] > f.amp[bi]) bi = i;
      return Math.abs(f.order[bi]) * W;
    });
    // 분해능 1/64 차수 × Ω ≈ 0.05의 두 칸 안 (회전수는 15 % 바뀜)
    expect(Math.max(...hz) - Math.min(...hz)).toBeLessThan(0.1);
  });

  it('구조적 풀림: 조이면 선형(2X 없음, 받침 ≈ 베이스), 풀면 받침만 커지고 2X가 생긴다', () => {
    const t = footLooseness({ loose: false, force: 1.6, speed: 0.6 });
    const l = footLooseness({ loose: true, force: 1.6, speed: 0.6 });
    expect(harmonicOf(t.foot, t.spr, 2).amp).toBeLessThan(1e-6);
    expect(harmonicOf(t.foot, t.spr, 1).amp / harmonicOf(t.base, t.spr, 1).amp).toBeLessThan(1.5);
    expect(harmonicOf(l.foot, l.spr, 1).amp / harmonicOf(l.base, l.spr, 1).amp).toBeGreaterThan(5);
    expect(harmonicOf(l.foot, l.spr, 2).amp).toBeGreaterThan(0.3 * harmonicOf(l.foot, l.spr, 1).amp);
  });

  it('Newkirk: 닿지 않으면 그대로, 임계속도 아래는 회전 반대로 돌며 커지고 위는 머문다', () => {
    const none = newkirk({ gain: 1.0, lagDeg: 40, touch: 1.2, heat: 0.02, cool: 60, minutes: 120 });
    expect(none[120].amp).toBeCloseTo(1.0, 12);
    const below = newkirk({ gain: 1.6, lagDeg: 40, touch: 1.2, heat: 0.02, cool: 60, minutes: 240 });
    expect(below[240].amp).toBeGreaterThan(2.5 * below[0].amp);
    expect(below[240].lagDeg).toBeGreaterThan(below[0].lagDeg + 60);
    const above = newkirk({ gain: 1.3, lagDeg: 150, touch: 1.2, heat: 0.02, cool: 60, minutes: 240 });
    expect(above[240].amp).toBeLessThan(above[0].amp);
  });

  it('같은 입력이면 같은 결과 (난수 없음), 발산하면 RangeError', () => {
    const a = simulate(nlRotor('looseRot', 0.5, 1.4), 16, 100);
    const b = simulate(nlRotor('looseRot', 0.5, 1.4), 16, 100);
    expect(Array.from(a.y)).toEqual(Array.from(b.y));
    expect(() => simulate(nlRotor('rub', 1, 3.2), 16, 300)).toThrow(RangeError);
  });
});
