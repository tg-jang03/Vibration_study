import { describe, it, expect } from 'vitest';
import * as F from './p4-2';
import { type FigureSpec } from '../lib/figure';
describe('P4-2 그림·본문 숫자 회귀', () => {
  it('7개 그림의 ID, 캡션과 유한 좌표', () => {
    const figs = Object.values(F).filter((v): v is FigureSpec => 'id' in v);
    expect(figs).toHaveLength(7);
    expect(new Set(figs.map(v => v.id)).size).toBe(7);
    figs.forEach((f, i) => {
      expect(f.caption).toMatch(new RegExp(`^그림 ${i + 1}\\.`));
      f.panels.forEach(p => p.series.forEach(s => [...Array.from(s.x), ...Array.from(s.y)].forEach(v => expect(Number.isFinite(v)).toBe(true))));
    });
  });
  it('등방 공진: 100µm 반지름, 역방향 0', () => {
    expect(F.P42_VALUES.isotropic.amplitudeForward * 1e6).toBeCloseTo(100, 9);
    expect(F.P42_VALUES.isotropic.amplitudeBackward).toBe(0);
  });
  it('비등방과 큰 감쇠의 정역 우세', () => {
    const a = F.P42_VALUES.anisotropic, d = F.P42_VALUES.damped;
    expect(a.amplitudeForward * 1e6).toBeCloseTo(36.1101326755, 7);
    expect(a.amplitudeBackward * 1e6).toBeCloseTo(50.4497679751, 7);
    expect(d.amplitudeForward * 1e6).toBeCloseTo(23.72953129, 5);
    expect(d.amplitudeBackward * 1e6).toBeCloseTo(8.33899366, 5);
    expect(a.direction).toBe('backward'); expect(d.direction).toBe('forward');
  });
  it('고속 자기정렬: C≈10.41µm, G≈0.466µm', () => {
    const r = F.P42_VALUES.high;
    expect(r.amplitudeX * 1e6).toBeCloseTo(10.4144, 3);
    expect(Math.hypot(r.x.re + 10e-6, r.x.im) * 1e6).toBeCloseTo(.465746, 5);
  });
});
