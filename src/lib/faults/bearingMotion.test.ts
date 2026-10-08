import { describe, expect, it } from 'vitest';
import { BRG_DEMO, DEMO_CALC, DEMO_FR } from './bearing';
import { bearingImpacts, bearingPose, loadWeight } from './bearingMotion';

const N = BRG_DEMO.geometry.balls;
const b = DEMO_CALC;
const fr = DEMO_FR;

describe('bearingPose — 케이지·볼·내륜의 각도', () => {
  it('케이지는 축 한 바퀴에 FTF/f_r = 0.398바퀴, 볼 9개는 40°씩 떨어져 함께 돈다', () => {
    const p = bearingPose(b, fr, N, 1 / fr);
    expect(p.inner / (2 * Math.PI)).toBeCloseTo(1, 12);
    expect(p.cage / (2 * Math.PI)).toBeCloseTo(0.3983, 4);
    expect(p.balls[1] - p.balls[0]).toBeCloseTo((2 * Math.PI) / 9, 12);
  });
});

describe('bearingImpacts — 충격의 빈도가 결함 주파수 (P7-5, Contents §6)', () => {
  const T = 2; // s
  const rate = (f: Parameters<typeof bearingImpacts>[0]) => bearingImpacts(f, b, fr, N, 0, T).length / T;
  it('외륜 213.6 Hz = 9 × FTF, 내륜 322.7 Hz = 9 × (f_r − FTF), 볼 280.8 Hz = 2 × BSF, 케이지 23.7 Hz = FTF', () => {
    expect(rate('outer')).toBeCloseTo(b.bpfo, -0.3);
    expect(rate('inner')).toBeCloseTo(b.bpfi, -0.3);
    expect(rate('ball')).toBeCloseTo(b.bsf2, -0.3);
    expect(rate('cage')).toBeCloseTo(b.ftf, -0.3);
    expect(b.bpfo).toBeCloseTo(213.6, 1);
    expect(b.bpfi).toBeCloseTo(322.7, 1);
  });
  it('외륜 충격은 볼이 결함(아래, 0)에 올 때: 충격 시각에 어느 볼 하나가 각도 0의 정수 바퀴에 있다', () => {
    for (const hit of bearingImpacts('outer', b, fr, N, 0.013, 0.05)) {
      const p = bearingPose(b, fr, N, hit.t);
      const near = p.balls.some((a) => Math.abs(Math.cos(a) - 1) < 1e-9);
      expect(near).toBe(true);
    }
  });
  it('내륜 충격: 결함 자리에 볼이 있고, 세기는 결함 자리의 하중대 가중 → 축 한 바퀴 주기(1X)로 오르내림', () => {
    const hits = bearingImpacts('inner', b, fr, N, 0, 1 / fr);
    for (const hit of hits) {
      const p = bearingPose(b, fr, N, hit.t);
      expect(p.balls.some((a) => Math.abs(Math.cos(a - p.inner) - 1) < 1e-9)).toBe(true);
      expect(hit.w).toBeCloseTo(loadWeight(p.inner), 12);
    }
    expect(Math.max(...hits.map((h) => h.w))).toBeGreaterThan(0.95);
    expect(Math.min(...hits.map((h) => h.w))).toBeLessThan(0.15);
  });
  it('볼 충격은 외륜·내륜에 번갈아, 외륜 쪽이 크다', () => {
    const hits = bearingImpacts('ball', b, fr, N, 0, 0.02);
    expect(hits[0].race).toBe('outer');
    expect(hits[1].race).toBe('inner');
    expect(hits[1].w / hits[0].w).toBeLessThan(0.61);
  });
});
