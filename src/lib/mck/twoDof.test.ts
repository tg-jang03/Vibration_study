import { describe, expect, it } from 'vitest';
import { symmetricTwoDofModes, twoDofForcedFRF, twoDofFreeResponseAt, twoDofModes } from './twoDof';

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

describe('twoDofFreeResponse', () => {
  const symmetric = {
    mass1: 1,
    mass2: 1,
    stiffnessLeft: 1000,
    stiffnessCoupling: 1000,
    stiffnessRight: 1000,
  };
  const [m1, m2] = symmetricTwoDofModes(1, 1000, 1000);

  it('keeps x1 = x2 purely at omega1 under mode 1 initial condition', () => {
    const state = twoDofFreeResponseAt(symmetric, { x1: 0.01, x2: 0.01 }, 0.123);
    const expected = 0.01 * Math.cos(m1.omega * 0.123);
    expect(state.x1).toBeCloseTo(expected, 10);
    expect(state.x2).toBeCloseTo(expected, 10);
    expect(state.mode2[0]).toBeCloseTo(0, 12);
    expect(state.mode2[1]).toBeCloseTo(0, 12);
  });

  it('keeps x1 = -x2 purely at omega2 under mode 2 initial condition', () => {
    const state = twoDofFreeResponseAt(symmetric, { x1: 0.01, x2: -0.01 }, 0.123);
    const expected = 0.01 * Math.cos(m2.omega * 0.123);
    expect(state.x1).toBeCloseTo(expected, 10);
    expect(state.x2).toBeCloseTo(-expected, 10);
    expect(state.mode1[0]).toBeCloseTo(0, 12);
    expect(state.mode1[1]).toBeCloseTo(0, 12);
  });

  it('decomposes single-mass deflection into equal 50:50 modal components', () => {
    const state0 = twoDofFreeResponseAt(symmetric, { x1: 0.01, x2: 0 }, 0);
    expect(state0.mode1[0]).toBeCloseTo(0.005, 12);
    expect(state0.mode2[0]).toBeCloseTo(0.005, 12);
    expect(state0.mode1[1]).toBeCloseTo(0.005, 12);
    expect(state0.mode2[1]).toBeCloseTo(-0.005, 12);
    expect(state0.x1).toBeCloseTo(0.01, 12);
    expect(state0.x2).toBeCloseTo(0, 12);
  });
});

describe('twoDofForcedFRF', () => {
  const symmetric = {
    mass1: 1,
    mass2: 1,
    stiffnessLeft: 1000,
    stiffnessCoupling: 1000,
    stiffnessRight: 1000,
  };
  const [m1, m2] = symmetricTwoDofModes(1, 1000, 1000);

  it('shows resonant peaks near both natural frequencies', () => {
    const atPeak1 = twoDofForcedFRF(symmetric, m1.omega, 0.03);
    const nearPeak1 = twoDofForcedFRF(symmetric, m1.omega * 0.8, 0.03);
    expect(atPeak1.X1).toBeGreaterThan(nearPeak1.X1 * 3);

    const atPeak2 = twoDofForcedFRF(symmetric, m2.omega, 0.03);
    const nearPeak2 = twoDofForcedFRF(symmetric, m2.omega * 1.3, 0.03);
    expect(atPeak2.X1).toBeGreaterThan(nearPeak2.X1 * 3);
  });
});
