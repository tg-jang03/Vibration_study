import { describe, expect, it } from 'vitest';
import { freeResponseAt, sdofProperties } from './sdof';

describe('sdofProperties', () => {
  it('matches the M2.1 natural-frequency reference value', () => {
    const p = sdofProperties({ mass: 1, stiffness: 1000 });
    expect(p.omegaN).toBeCloseTo(Math.sqrt(1000), 12);
    expect(p.frequencyHz).toBeCloseTo(5.0329212104, 9);
    expect(p.period).toBeCloseTo(0.1986917653, 9);
    expect(p.regime).toBe('undamped');
  });

  it('computes damping ratio, damped frequency and logarithmic decrement', () => {
    const c = 2 * 0.05 * Math.sqrt(1000);
    const p = sdofProperties({ mass: 1, stiffness: 1000, damping: c });
    expect(p.zeta).toBeCloseTo(0.05, 12);
    expect((p.omegaD as number) / p.omegaN).toBeCloseTo(0.9987492178, 9);
    expect(p.logDecrement).toBeCloseTo(0.3145527023, 9);
  });
});

describe('freeResponseAt', () => {
  const system = { mass: 1, stiffness: 1000 };
  const p = sdofProperties(system);

  it('has zero velocity at an end point and maximum speed at equilibrium', () => {
    const x0 = 0.01;
    const end = freeResponseAt(system, { x0 }, 0);
    const equilibrium = freeResponseAt(system, { x0 }, p.period / 4);
    expect(end.x).toBeCloseTo(x0, 12);
    expect(end.v).toBeCloseTo(0, 12);
    expect(equilibrium.x).toBeCloseTo(0, 12);
    expect(Math.abs(equilibrium.v)).toBeCloseTo(p.omegaN * x0, 12);
  });

  it('preserves initial conditions and satisfies the equation when underdamped', () => {
    const damped = { ...system, damping: 2 * 0.2 * Math.sqrt(1000) };
    const initial = { x0: 0.012, v0: -0.08 };
    const atZero = freeResponseAt(damped, initial, 0);
    expect(atZero.x).toBeCloseTo(initial.x0, 12);
    expect(atZero.v).toBeCloseTo(initial.v0, 12);
    const state = freeResponseAt(damped, initial, 0.17);
    expect(damped.mass * state.a + damped.damping * state.v + damped.stiffness * state.x).toBeCloseTo(0, 10);
  });

  it('returns to equilibrium without crossing zero at critical and overdamping', () => {
    for (const zeta of [1, 1.5]) {
      const damped = { ...system, damping: 2 * zeta * Math.sqrt(1000) };
      for (const t of [0, 0.05, 0.2, 1]) expect(freeResponseAt(damped, { x0: 0.01 }, t).x).toBeGreaterThanOrEqual(0);
    }
  });

  it('rejects invalid physical inputs', () => {
    expect(() => sdofProperties({ mass: 0, stiffness: 1000 })).toThrow(RangeError);
    expect(() => sdofProperties({ mass: 1, stiffness: -1 })).toThrow(RangeError);
    expect(() => freeResponseAt(system, { x0: 1 }, -0.1)).toThrow(RangeError);
  });
});
