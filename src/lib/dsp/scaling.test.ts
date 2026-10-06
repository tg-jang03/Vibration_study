import { describe, expect, it } from 'vitest';
import { acquire } from './sampling';
import { amplitudeDb, bandRms, cumulativeBandRms, powerDb, scaledSpectrum, spectrumIn } from './scaling';

const FS = 1280;

/** bin 중심 톤(진폭 Pk) + 백색 잡음(표준편차 sigma) */
function signal(n: number, tonePk: number, sigma: number, f = 50) {
  return acquire(
    { components: [{ type: 'sine', freq: f, amp: tonePk }, { type: 'noise', rms: sigma, seed: 7 }] },
    { fs: FS, n },
  );
}
const mean = (a: ArrayLike<number>, from: number, to: number) => {
  let s = 0;
  for (let k = from; k < to; k++) s += a[k];
  return s / (to - from);
};

describe('scaledSpectrum — 파워·PSD', () => {
  it('bin 중심 톤의 파워 = 성분의 RMS², Peak 표시 = 진폭 (Uniform·Hann)', () => {
    for (const window of ['uniform', 'hann'] as const) {
      const s = scaledSpectrum(signal(1024, 2, 0), { window });
      const k = 50 / s.df; // 40
      expect(s.power[k]).toBeCloseTo(2, 10); // (2/√2)² = 2
      expect(spectrumIn(s, 'rms')[k]).toBeCloseTo(Math.SQRT2, 10);
      expect(spectrumIn(s, 'peak')[k]).toBeCloseTo(2, 10);
    }
  });

  it('ENBW: Uniform 1, Hann 1.5 bin, Δf = f_s/N', () => {
    expect(scaledSpectrum(signal(1024, 1, 0)).enbw).toBeCloseTo(1, 12);
    const h = scaledSpectrum(signal(1024, 1, 0), { window: 'hann' });
    expect(h.enbw).toBeCloseTo(1.5, 12);
    expect(h.df).toBe(1.25);
  });

  it('백색 잡음의 PSD는 Δf와 무관하게 2σ²/f_s, 파워 바닥은 Δf에 비례', () => {
    const sigma = 0.3;
    const theory = (2 * sigma ** 2) / FS;
    const floors: number[] = [];
    for (const n of [1024, 8192]) {
      const s = scaledSpectrum(signal(n, 0, sigma), { window: 'hann' });
      const half = s.power.length;
      expect(mean(s.psd, 5, half - 5) / theory).toBeGreaterThan(0.93);
      expect(mean(s.psd, 5, half - 5) / theory).toBeLessThan(1.07);
      floors.push(mean(s.power, 5, half - 5));
    }
    // N이 8배 → Δf가 1/8 → bin 하나에 담기는 잡음 파워도 1/8
    expect(floors[0] / floors[1]).toBeGreaterThan(8 * 0.9);
    expect(floors[0] / floors[1]).toBeLessThan(8 * 1.1);
  });

  it('톤의 PSD는 Δf가 1/8이 되면 8배 (톤에는 PSD가 맞지 않는다)', () => {
    const a = scaledSpectrum(signal(1024, 1, 0), { window: 'hann' });
    const b = scaledSpectrum(signal(8192, 1, 0), { window: 'hann' });
    expect(b.psd[50 / b.df] / a.psd[50 / a.df]).toBeCloseTo(8, 10);
    expect(a.psd[40]).toBeCloseTo(0.5 / (1.5 * 1.25), 10);
  });

  it('스케일 사이 관계: asd = √psd, peak = √2·rms', () => {
    const s = scaledSpectrum(signal(512, 1, 0.1), { window: 'hann' });
    const asd = spectrumIn(s, 'asd');
    const pk = spectrumIn(s, 'peak');
    const r = spectrumIn(s, 'rms');
    for (let k = 1; k < 200; k++) {
      expect(asd[k] ** 2).toBeCloseTo(s.psd[k], 12);
      expect(pk[k]).toBeCloseTo(Math.SQRT2 * r[k], 12);
    }
  });
});

describe('bandRms — 스펙트럼에서 전체 크기', () => {
  it('Hann 톤: 이웃 bin까지 더하고 ENBW로 나누면 정확히 RMS, 나누지 않으면 √1.5배', () => {
    const s = scaledSpectrum(signal(1024, 1, 0), { window: 'hann' });
    expect(bandRms(s.power, s.enbw, 37, 43)).toBeCloseTo(Math.SQRT1_2, 10);
    expect(bandRms(s.power, s.enbw, 37, 43, false)).toBeCloseTo(Math.SQRT1_2 * Math.sqrt(1.5), 10);
  });

  it('잡음 + 톤 전체: 파형의 RMS와 맞는다 (Hann, ENBW로 나눔)', () => {
    const x = signal(8192, Math.SQRT2, 1);
    let ms = 0;
    for (const v of x.x) ms += v * v;
    const timeRms = Math.sqrt(ms / x.x.length);
    const s = scaledSpectrum(x, { window: 'hann' });
    expect(bandRms(s.power, s.enbw) / timeRms).toBeGreaterThan(0.97);
    expect(bandRms(s.power, s.enbw) / timeRms).toBeLessThan(1.03);
    const cum = cumulativeBandRms(s.power, s.enbw);
    expect(cum[cum.length - 1]).toBeCloseTo(bandRms(s.power, s.enbw), 12);
  });

  it('Uniform: 파스발 정리와 같다 (ENBW = 1)', () => {
    const x = signal(1024, 1, 0.5);
    let ms = 0;
    for (const v of x.x) ms += v * v;
    const s = scaledSpectrum(x);
    expect(bandRms(s.power, s.enbw)).toBeCloseTo(Math.sqrt(ms / x.x.length), 10);
  });

  it('잘못된 범위·ENBW는 RangeError', () => {
    expect(() => bandRms([1, 2], 0)).toThrow(RangeError);
    expect(() => bandRms([1, 2], 1, 1, 0)).toThrow(RangeError);
  });
});

describe('dB', () => {
  it('진폭 20 log, 파워 10 log — 같은 비면 같은 dB', () => {
    expect(amplitudeDb(0.1)).toBeCloseTo(-20, 12);
    expect(powerDb(0.01)).toBeCloseTo(-20, 12);
    expect(amplitudeDb(3, 2)).toBeCloseTo(powerDb(9, 4), 12);
    expect(amplitudeDb(0)).toBe(-200);
  });
});
