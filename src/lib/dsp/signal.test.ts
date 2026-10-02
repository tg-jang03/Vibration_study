import { describe, expect, it } from 'vitest';
import { evaluate, evaluateRange, type SignalSpec } from './signal';

describe('evaluate', () => {
  it('정현파 A·cos(2πft + φ): t = 0이면 A·cos φ', () => {
    const spec: SignalSpec = { components: [{ type: 'sine', freq: 50, amp: 2, phase: Math.PI / 3 }] };
    expect(evaluate(spec, 0)).toBeCloseTo(1, 12);
  });

  it('정현파는 주기 T = 1/f마다 같은 값으로 돌아온다', () => {
    const spec: SignalSpec = { components: [{ type: 'sine', freq: 25, amp: 1, phase: 0.4 }] };
    const t = 0.0123;
    expect(evaluate(spec, t + 1 / 25)).toBeCloseTo(evaluate(spec, t), 12);
  });

  it('하모닉 열 = 같은 주파수 정현파들의 합', () => {
    const harmonics: SignalSpec = {
      components: [{ type: 'harmonics', f0: 10, amps: [1, 0.5, 0.25], phases: [0, 0.3, -1] }],
    };
    const sines: SignalSpec = {
      components: [
        { type: 'sine', freq: 10, amp: 1, phase: 0 },
        { type: 'sine', freq: 20, amp: 0.5, phase: 0.3 },
        { type: 'sine', freq: 30, amp: 0.25, phase: -1 },
      ],
    };
    for (const t of [0, 0.01, 0.037, 0.5]) {
      expect(evaluate(harmonics, t)).toBeCloseTo(evaluate(sines, t), 12);
    }
  });

  it('선형성: 성분을 합친 신호 = 각 신호의 합', () => {
    const a: SignalSpec = { components: [{ type: 'sine', freq: 13, amp: 0.7 }] };
    const b: SignalSpec = { components: [{ type: 'harmonics', f0: 4, amps: [0.2, 0.1] }] };
    const ab: SignalSpec = { components: [...a.components, ...b.components] };
    const t = 0.2345;
    expect(evaluate(ab, t)).toBeCloseTo(evaluate(a, t) + evaluate(b, t), 12);
  });

  it('잡음 성분은 참(연속) 신호에 포함하지 않는다', () => {
    const spec: SignalSpec = {
      components: [
        { type: 'sine', freq: 5, amp: 1 },
        { type: 'noise', rms: 3, seed: 1 },
      ],
    };
    expect(evaluate(spec, 0)).toBe(1);
  });
});

describe('evaluateRange', () => {
  it('양 끝점을 포함해 points개를 고르게 평가한다', () => {
    const spec: SignalSpec = { components: [{ type: 'sine', freq: 1, amp: 1 }] };
    const { t, x } = evaluateRange(spec, 0, 1, 5);
    expect(Array.from(t)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(x[0]).toBeCloseTo(1, 12);
    expect(x[2]).toBeCloseTo(-1, 12);
  });

  it('points가 2보다 작으면 오류', () => {
    const spec: SignalSpec = { components: [] };
    expect(() => evaluateRange(spec, 0, 1, 1)).toThrow(RangeError);
  });
});
