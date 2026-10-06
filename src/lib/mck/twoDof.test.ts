import { describe, expect, it } from 'vitest';
import { symmetricTwoDofModes, twoDofModes } from './twoDof';

describe('twoDofModes', () => {
  it('matches symmetric-system analytical modes', () => {
    const [first, second] = symmetricTwoDofModes(2, 800, 800);
    expect(first.omega).toBeCloseTo(Math.sqrt(800 / 2), 10);
    expect(second.omega).toBeCloseTo(Math.sqrt((800 + 2 * 800) / 2), 10);
    expect(second.omega / first.omega).toBeCloseTo(Math.sqrt(3), 10);
    expect(first.shape).toEqual([1, 1]);
    expect(second.shape[0]).toBeCloseTo(1, 12);
    expect(second.shape[1]).toBeCloseTo(-1, 12);
  });

  it('solves an asymmetric positive system with ordered frequencies', () => {
    const [first, second] = twoDofModes({ mass1: 1, mass2: 2, stiffnessLeft: 1000, stiffnessCoupling: 300, stiffnessRight: 800 });
    expect(first.omega).toBeLessThan(second.omega);
    expect(first.shape[0] * first.shape[1]).toBeGreaterThan(0);
    expect(second.shape[0] * second.shape[1]).toBeLessThan(0);
  });
});
