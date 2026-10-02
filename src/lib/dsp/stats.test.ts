import { describe, expect, it } from 'vitest';
import { crestFactor, peak, rms } from './stats';
import { acquire } from './sampling';

describe('rms · peak · crestFactor', () => {
  // 정수 주기가 들어가도록 fs = 1000 Hz, N = 1000, f = 50 Hz
  const sine = acquire({ components: [{ type: 'sine', freq: 50, amp: 2 }] }, { fs: 1000, n: 1000 }).x;

  it('정현파: RMS = A/√2, Peak = A, CF = √2 (Contents §6)', () => {
    expect(rms(sine)).toBeCloseTo(2 / Math.SQRT2, 10);
    expect(peak(sine)).toBeCloseTo(2, 10);
    expect(crestFactor(sine)).toBeCloseTo(Math.SQRT2, 10);
  });

  it('상수 신호: CF = 1, 빈 신호와 0 신호는 0', () => {
    expect(crestFactor([3, -3, 3, -3])).toBe(1);
    expect(rms([])).toBe(0);
    expect(crestFactor([0, 0])).toBe(0);
  });
});
