import { describe, expect, it } from 'vitest';
import { bestFrameSeconds, smearWidth, stft } from './stft';

const tone = (f: number, fs: number, n: number, amp = 1) => Float64Array.from({ length: n }, (_, i) => amp * Math.cos((2 * Math.PI * f * i) / fs));

describe('STFT', () => {
  it('프레임 수 = ⌊(L − N)/hop⌋ + 1, 시각은 프레임 가운데', () => {
    const s = stft(new Float64Array(10000), 1000, { n: 256, overlap: 0.75 });
    expect(s.hop).toBe(64);
    expect(s.times.length).toBe(Math.floor((10000 - 256) / 64) + 1);
    expect(s.times[0]).toBeCloseTo(128 / 1000, 12);
    expect(s.times[1] - s.times[0]).toBeCloseTo(0.064, 12);
    expect(s.df).toBeCloseTo(1000 / 256, 12);
  });

  it('bin 가운데 톤은 모든 프레임에서 진폭 그대로 (Hann 진폭 보정)', () => {
    const fs = 512;
    const s = stft(tone(64, fs, 4096, 2.5), fs, { n: 256, overlap: 0.5 });
    for (const row of s.amp) expect(row[32]).toBeCloseTo(2.5, 10);
  });

  it('주파수가 오르는 신호: 프레임마다 봉우리가 그 시각의 순간 주파수에 선다', () => {
    const fs = 512;
    const a = 2; // Hz/s
    const n = fs * 20;
    const x = Float64Array.from({ length: n }, (_, i) => Math.cos(2 * Math.PI * (10 * (i / fs) + (a / 2) * (i / fs) ** 2)));
    const s = stft(x, fs, { n: 512, overlap: 0.5 });
    s.amp.forEach((row, m) => {
      let k = 0;
      for (let j = 1; j < row.length; j++) if (row[j] > row[k]) k = j;
      expect(Math.abs(s.freqs[k] - (10 + a * s.times[m]))).toBeLessThanOrEqual(s.df);
    });
  });

  it('짧은 충격은 그 시각 근처 프레임에만 나타난다 (시간 쪽 해상도 ≈ 프레임 길이)', () => {
    const fs = 1000;
    const x = new Float64Array(8000);
    x[4000] = 1;
    const s = stft(x, fs, { n: 256, overlap: 0.75 });
    s.amp.forEach((row, m) => {
      const hit = Math.abs(s.times[m] - 4) < 256 / 2 / fs;
      if (!hit) expect(Math.max(...row)).toBe(0);
    });
  });

  it('번짐 어림: 1/T와 a·T가 같아지는 T = 1/√a에서 가장 작다', () => {
    const a = 1.25;
    const T = bestFrameSeconds(a);
    expect(T).toBeCloseTo(0.894, 3);
    expect(smearWidth(a, T)).toBeLessThan(smearWidth(a, T / 2));
    expect(smearWidth(a, T)).toBeLessThan(smearWidth(a, 2 * T));
  });
});
