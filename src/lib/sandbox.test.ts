import { describe, expect, it } from 'vitest';
import { DEFAULT_MACHINE, DEFAULT_SETTINGS, RECIPES, runSandbox, type Machine, type Purpose, type Settings } from './sandbox';

const only = (patch: Partial<Machine>): Machine => ({ ...DEFAULT_MACHINE, x1: 0, x2: 0, x3: 0, sub: 0, gear: 0, bearing: 0, noisePsd: 0, ...patch });
const item = (r: ReturnType<typeof runSandbox>, key: string) => r.items.find((i) => i.key === key)!;

describe('runSandbox — 측정 설정과 판정', () => {
  it('f_s = 2.56 F_max, N = 2.56 LOR, Δf = F_max/LOR, 오버랩 총 시간', () => {
    const r = runSandbox(only({ x1: 0.001 }), { ...DEFAULT_SETTINGS, fmax: 2000, lor: 1600, count: 8, overlap: 0.5 });
    expect(r.fs).toBe(5120);
    expect(r.n).toBe(4096);
    expect(r.df).toBeCloseTo(1.25, 12);
    expect(r.frameTime).toBeCloseTo(0.8, 12);
    expect(r.totalTime).toBeCloseTo(0.8 * (1 + 7 * 0.5), 12);
  });

  it('AAF를 끄면 3 kHz 울림이 f_s − 3000 = 440 Hz로 접혀 들어오고, 켜면 사라진다 (F_max 1000 Hz)', () => {
    const m = only({ bearing: DEFAULT_MACHINE.bearing });
    const s: Settings = { ...DEFAULT_SETTINGS, fmax: 1000, lor: 800 };
    const off = runSandbox(m, { ...s, aaf: false });
    const on = runSandbox(m, { ...s, aaf: true });
    expect(item(off, 'ring').status).toBe('aliased');
    expect(item(off, 'ring').aliasAt).toBeCloseTo(440, 6);
    expect(item(on, 'ring').status).toBe('outside');
    const peakNear = (r: typeof on, f: number) => Math.max(...Array.from(r.rms).filter((_, k) => Math.abs(k * r.df - f) < 120));
    expect(peakNear(on, 440) / peakNear(off, 440)).toBeLessThan(1e-3); // 8차 AAF: (1000/3000)^8 ≈ −76 dB
  });

  it('잡음 PSD는 F_max를 바꿔도 같다 (bin 파워 ÷ (ENBW·Δf))', () => {
    const m = only({ noisePsd: DEFAULT_MACHINE.noisePsd });
    for (const fmax of [500, 2000]) {
      const r = runSandbox(m, { ...DEFAULT_SETTINGS, fmax, lor: 800, count: 8 });
      const vals = Array.from(r.rms).slice(10, Math.round(0.9 * r.rms.length * 0.78));
      const meanPow = vals.reduce((a, v) => a + v * v, 0) / vals.length;
      expect(meanPow / (1.5 * r.df) / m.noisePsd).toBeGreaterThan(0.85);
      expect(meanPow / (1.5 * r.df) / m.noisePsd).toBeLessThan(1.15);
    }
  });

  it('기본값(2000 Hz, 400 라인, Hann)에서는 측대역이 맞물림과 붙고, 1600 라인이면 갈라진다', () => {
    const base = runSandbox(DEFAULT_MACHINE, DEFAULT_SETTINGS);
    expect(item(base, 'sbLow').neighborBins).toBeCloseTo(2.5, 6);
    expect(item(base, 'sbLow').status).toBe('merged');
    const fine = runSandbox(DEFAULT_MACHINE, { ...DEFAULT_SETTINGS, lor: 1600 });
    expect(item(fine, 'sbLow').status).toBe('visible');
    expect(item(fine, 'sbHigh').status).toBe('visible');
  });

  it('Flat top은 회전수가 bin 사이에 와도 1X를 정확히 읽는다 (2970 rpm)', () => {
    const m = only({ rpm: 2970, x1: 0.004 });
    const truth = 0.004 / Math.SQRT2;
    const ft = item(runSandbox(m, { ...DEFAULT_SETTINGS, fmax: 500, lor: 400, window: 'flatTop' }), '1x').value;
    const hann = item(runSandbox(m, { ...DEFAULT_SETTINGS, fmax: 500, lor: 400, window: 'hann' }), '1x').value;
    expect(Math.abs(ft / truth - 1)).toBeLessThan(0.002);
    expect(Math.abs(hann / truth - 1)).toBeGreaterThan(0.05);
  });

  it('목적별 도우미 설정에서는 그 목적의 성분이 모두 "보임"', () => {
    for (const [purpose, recipe] of Object.entries(RECIPES) as [Purpose, (typeof RECIPES)[Purpose]][]) {
      const r = runSandbox(DEFAULT_MACHINE, recipe.settings);
      for (const key of recipe.targets) expect(`${purpose}:${key}:${item(r, key).status}`).toBe(`${purpose}:${key}:visible`);
    }
  });
});
