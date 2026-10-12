import { describe, expect, it } from 'vitest';
import { compareChange, compareMagnitude, parseNonnegative, validLimits } from './severity';

describe('comparison against arbitrary supplied limits', () => {
  const limits = [2, 5, 9] as const;
  it.each([[0, 'A'], [1.99, 'A'], [3, 'B'], [7, 'C'], [12, 'D']] as const)('x=%s → %s', (x, zone) => {
    expect(compareMagnitude(x, limits).zone).toBe(zone);
  });
  it.each([[2, 'A/B', 'B'], [5, 'B/C', 'C'], [9, 'C/D', 'D']] as const)('boundary %s needs review or explicit convention', (x, boundary, zone) => {
    expect(compareMagnitude(x, limits)).toEqual({ zone: null, boundary });
    expect(compareMagnitude(x, limits, 'upper').zone).toBe(zone);
  });
  it.each([[0, 5, 9], [5, 2, 9], [2, 2, 9], [2, 5, Infinity], [2, NaN, 9]])('rejects unordered/nonfinite limits %s', (a, b, c) => {
    const invalid = [a, b, c] as const;
    expect(validLimits(invalid)).toBe(false);
    expect(() => compareMagnitude(3, invalid)).toThrow(RangeError);
  });
  it.each([-1, NaN, Infinity])('rejects invalid measurement %s', x => expect(() => compareMagnitude(x, limits)).toThrow());
  it('SI conversion leaves comparisons invariant', () => {
    expect(compareMagnitude(.003, [.002, .005, .009])).toEqual(compareMagnitude(3, limits));
    expect(compareChange(.003, .0015, .005, 20).percentOfBC).toBeCloseTo(30, 12);
    expect(compareMagnitude(30e-6, [20e-6, 50e-6, 90e-6]).zone).toBe('B');
  });
});
describe('independent arithmetic change checks', () => {
  it('a B value can exceed a separately supplied rate', () => {
    expect(compareChange(3, 1.5, 5, 20)).toEqual({ delta: 1.5, absoluteDelta: 1.5, percentOfBC: 30, comparison: 'above' });
  });
  it('decrease has signed delta and positive comparison', () => {
    expect(compareChange(1.5, 3, 5, 20)).toEqual({ delta: -1.5, absoluteDelta: 1.5, percentOfBC: 30, comparison: 'above' });
  });
  it('zero baseline is valid; no division by baseline', () => expect(compareChange(3, 0, 5).percentOfBC).toBe(60));
  it('zero change is exactly zero', () => expect(compareChange(0, 0, 5, 20)).toMatchObject({ delta: 0, percentOfBC: 0, comparison: 'below' }));
  it('rate equality and absent criteria are distinct', () => {
    expect(compareChange(2.5, 1.5, 5, 20).comparison).toBe('equal');
    expect(compareChange(2.5, 1.5, 5).comparison).toBe('unset');
  });
  it.each([[2.6, 1.6], [1.2, .2]])('SI conversion preserves rate equality for %s minus %s', (value, base) => {
    expect(compareChange(value * 1e-3, base * 1e-3, .005, 20)).toMatchObject({ percentOfBC: 20, comparison: 'equal' });
  });
  it('nearby actual differences remain above and below', () => {
    expect(compareChange(.00260001, .0016, .005, 20).comparison).toBe('above');
    expect(compareChange(.00259999, .0016, .005, 20).comparison).toBe('below');
  });
  it.each([[3, -1, 5, 20], [3, 1, 0, 20], [3, 1, 5, 0], [Infinity, 1, 5, 20], [3, 1, 5, NaN]])('invalid inputs are rejected', (x, base, bc, rate) => {
    expect(() => compareChange(x, base, bc, rate)).toThrow();
  });
  it('rejects nonfinite ratio', () => expect(() => compareChange(1, 0, Number.MIN_VALUE)).toThrow());
  it.each(['', ' ', '-1', 'NaN', 'Infinity', '1e999'])('input %s is not coerced to a usable zero', raw => expect(parseNonnegative(raw)).toBeNull());
  it.each([['0', 0], [' 1.5 ', 1.5], ['3e-3', .003]] as const)('parses %s', (raw, value) => expect(parseNonnegative(raw)).toBe(value));
});
