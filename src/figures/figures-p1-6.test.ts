import { describe, expect, it } from 'vitest';
import * as figures from './p1-6';

describe('P1-6 machine composition figures', () => {
  it('contains seven uniquely numbered static figures', () => {
    const values = Object.values(figures);
    expect(values).toHaveLength(7);
    expect(new Set(values.map((f) => f.id)).size).toBe(7);
    values.forEach((f) => expect(f.caption).toMatch(/^그림 [1-7]\./));
  });
  it('has finite data, valid axes, and no annotations outside schematic bounds', () => {
    for (const f of Object.values(figures)) for (const p of f.panels) {
      expect(p.x.range[1]).toBeGreaterThan(p.x.range[0]);
      expect(p.y.range[1]).toBeGreaterThan(p.y.range[0]);
      for (const s of p.series) {
        expect(s.x.length).toBe(s.y.length);
        [...Array.from(s.x), ...Array.from(s.y)].forEach((v) => expect(Number.isFinite(v)).toBe(true));
      }
      if (!p.frame && p.annotations) for (const a of p.annotations) {
        for (const [key, value] of Object.entries(a)) {
          if (typeof value !== 'number') continue;
          expect(Number.isFinite(value)).toBe(true);
          if (/^x[12]?$/.test(key)) expect(value >= p.x.range[0] && value <= p.x.range[1]).toBe(true);
          if (/^y[12]?$/.test(key)) expect(value >= p.y.range[0] && value <= p.y.range[1]).toBe(true);
        }
      }
    }
  });
  it('computes the example curve and displayed baseline from the same SI model', () => {
    const p = figures.supportModel.panels[1];
    const current = p.series[2];
    expect(current.x[0]).toBe(1);
    expect(current.y[0]).toBeCloseTo(10.0658424209, 8);
    expect(p.series[1].y[0]).toBeCloseTo(12.9949466872, 8);
    const curve = p.series[0];
    const y = Array.from(curve.y);
    y.slice(1).forEach((v, i) => expect(v).toBeGreaterThan(y[i]));
    expect(figures.supportModel.caption).toContain('10.07 Hz');
  });
});
