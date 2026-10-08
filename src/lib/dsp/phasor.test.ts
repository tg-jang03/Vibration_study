import { describe, expect, it } from 'vitest';
import { phasorChain, phasorLength, phasorSignal, strobeApparentFreq, type Phasor } from './phasor';
import { harmonicPreset } from './fourier';
import { beatEnvelope, modulationLines } from './modulation';
import { aliasComponent } from './sampling';
import { evaluate } from './signal';
import { forwardBackward } from './twoChannel';
import { ORBIT_DEMO, orbitPhasors, orbitSignals, type OrbitOptions } from '../xchDemo';

const TIMES = [0, 0.0013, 0.017, 0.0421, 0.1234, 0.377];

describe('phasorChain — 화살표 하나', () => {
  it('끝점 = A(cos θ, sin θ), θ = 2πft + φ. 실수부가 정현파 A cos(2πft + φ)', () => {
    const a: Phasor = { amp: 1.5, freq: 5, phase: -Math.PI / 2 };
    for (const t of TIMES) {
      const tip = phasorChain([a], t)[1];
      const theta = 2 * Math.PI * 5 * t - Math.PI / 2;
      expect(tip.re).toBeCloseTo(1.5 * Math.cos(theta), 12);
      expect(tip.im).toBeCloseTo(1.5 * Math.sin(theta), 12);
      expect(phasorSignal([a], t)).toBeCloseTo(evaluate({ components: [{ type: 'sine', freq: 5, amp: 1.5, phase: -Math.PI / 2 }] }, t), 12);
    }
  });
  it('같이 도는 틀(frameFreq = f)에서는 멈춰 있다 — 언제나 t = 0의 위치', () => {
    const a: Phasor = { amp: 1, freq: 100, phase: 0.3 };
    for (const t of TIMES) {
      const tip = phasorChain([a], t, 100)[1];
      expect(tip.re).toBeCloseTo(Math.cos(0.3), 12);
      expect(tip.im).toBeCloseTo(Math.sin(0.3), 12);
    }
  });
});

describe('사슬 끝 = 성분의 합 (LAB-FOU-01 · LAB-MOD-01)', () => {
  it('사각파 15차까지의 사슬 끝 실수부 = harmonics 신호', () => {
    const s = harmonicPreset('square', 15);
    const arrows = s.amps.map((amp, i) => ({ amp, freq: (i + 1) * 10, phase: s.phases[i] }));
    for (const t of TIMES) {
      const x = evaluate({ components: [{ type: 'harmonics', f0: 10, amps: s.amps, phases: s.phases }] }, t);
      expect(phasorChain(arrows, t).at(-1)!.re).toBeCloseTo(x, 12);
    }
  });

  it('AM·FM·AM+FM: 측대역 복소 계수 c_n의 사슬 = modulated 신호', () => {
    const fc = 100;
    const fm = 5;
    for (const [m, beta, psi] of [[0.5, 0, 0], [0, 2.4, 0], [0.4, 0.6, Math.PI / 3]] as const) {
      const arrows = modulationLines(m, beta, psi, 14).map((l) => ({ amp: l.ratio, freq: fc + l.n * fm, phase: Math.atan2(l.im, l.re) }));
      for (const t of TIMES) {
        const x = evaluate({ components: [{ type: 'modulated', carrier: fc, amp: 1, modFreq: fm, am: m, fm: beta, amPhase: psi }] }, t);
        expect(phasorSignal(arrows, t)).toBeCloseTo(x, 10);
      }
    }
  });

  it('AM에서 화살표 합의 길이 = 포락선 1 + m cos(2πf_m t + ψ), FM에서는 1 그대로', () => {
    const am = modulationLines(0.5, 0, 0.7, 3).map((l) => ({ amp: l.ratio, freq: 100 + l.n * 5, phase: Math.atan2(l.im, l.re) }));
    const fm = modulationLines(0, 2, 0, 14).map((l) => ({ amp: l.ratio, freq: 100 + l.n * 5, phase: Math.atan2(l.im, l.re) }));
    for (const t of TIMES) {
      expect(phasorLength(am, t)).toBeCloseTo(1 + 0.5 * Math.cos(2 * Math.PI * 5 * t + 0.7), 12);
      expect(phasorLength(fm, t)).toBeCloseTo(1, 10);
    }
  });

  it('맥놀이: 두 화살표 합의 길이 = beatEnvelope (최대 1 + r, 최소 1 − r)', () => {
    const arrows = [{ amp: 1, freq: 30, phase: 0 }, { amp: 0.8, freq: 29.5, phase: 0 }];
    for (const t of TIMES) expect(phasorLength(arrows, t)).toBeCloseTo(beatEnvelope(1, 0.8, 30, 29.5, t), 12);
    expect(phasorLength(arrows, 0)).toBeCloseTo(1.8, 12);
    expect(phasorLength(arrows, 1)).toBeCloseTo(0.2, 12); // 1/(f₁ − f₂) = 2 s의 절반
  });
});

describe('strobeApparentFreq — 마차 바퀴 효과 (LAB-SMP-01)', () => {
  it('f_s 1000 Hz: 60·1060 Hz는 +60 Hz(같은 방향), 940·1940 Hz는 −60 Hz(거꾸로)', () => {
    expect(strobeApparentFreq(60, 1000)).toBeCloseTo(60, 9);
    expect(strobeApparentFreq(1060, 1000)).toBeCloseTo(60, 9);
    expect(strobeApparentFreq(940, 1000)).toBeCloseTo(-60, 9);
    expect(strobeApparentFreq(1940, 1000)).toBeCloseTo(-60, 9);
    expect(strobeApparentFreq(1000, 1000)).toBeCloseTo(0, 9); // 플래시마다 정확히 한 바퀴 → 멈춰 보임
  });
  it('크기는 에일리어스 주파수, 음수 ⇔ aliasComponent의 위상 반전', () => {
    for (let f = 10; f <= 3000; f += 35) {
      for (const fs of [700, 1000, 1280]) {
        const app = strobeApparentFreq(f, fs);
        const a = aliasComponent(f, 0.4, fs);
        expect(Math.abs(app)).toBeCloseTo(a.freq, 9);
        expect(app < 0).toBe(a.inverted);
        expect(Math.abs(app)).toBeLessThanOrEqual(fs / 2 + 1e-9);
      }
    }
  });
});

describe('orbitPhasors — 정·역 화살표 두 쌍의 끝 = 오빗 (LAB-FULL-01)', () => {
  const cases: OrbitOptions[] = [
    { ax: 50e-6, ay: 50e-6, lagDeg: 90 },
    { ax: 50e-6, ay: 50e-6, lagDeg: 45 },
    { ax: 60e-6, ay: 30e-6, lagDeg: 270, gainErr: 0.1, angleErrDeg: 10, whirl: 20e-6 },
  ];
  it('사슬 끝 (re, im) = 측정된 (x, y)', () => {
    for (const o of cases) {
      const chain = orbitPhasors(o);
      const s = orbitSignals(o);
      for (const i of [0, 7, 100, 513, 1000]) {
        const tip = phasorChain(chain, s.t[i]).at(-1)!;
        expect(tip.re).toBeCloseTo(s.x[i], 12);
        expect(tip.im).toBeCloseTo(s.y[i], 12);
      }
    }
  });
  it('화살표 길이 = forwardBackward의 A_f·A_b, 원 90°는 정방향 50 µm만', () => {
    const [f, b] = orbitPhasors(cases[0]);
    const ref = forwardBackward(50e-6, 0, 0, -50e-6);
    expect(f.amp).toBeCloseTo(ref.af, 15);
    expect(b.amp).toBeCloseTo(ref.ab, 15);
    expect(f.amp).toBeCloseTo(50e-6, 15);
    expect(b.amp).toBeCloseTo(0, 15);
    expect(f.freq).toBe(ORBIT_DEMO.f1);
    expect(b.freq).toBe(-ORBIT_DEMO.f1);
  });
});
