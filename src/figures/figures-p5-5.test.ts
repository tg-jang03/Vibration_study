import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { trackingNoise, trackOrder } from '../lib/dsp/tracking';
import { analyzeTracking, DEFAULT_TRACK_PARAMS as D, steadySignal, TRK } from '../lib/trackingDemo';
import * as F from './p5-5';

const V = F.P55_VALUES;
const pp = (m: number) => m * 2e6;
const um = 1e6;
const deg = (r: number) => (r * 180) / Math.PI;

describe('P5-5 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('3600 rpm 1X = 31.57 µm pp∠164.7°, 실수부 −15.23 · 허수부 −4.154 µm (그림 2는 2 s에 −15.2 · −4.15)', () => {
    expect(f(pp(V.v36.amp), 4)).toBe('31.57');
    expect(f(deg(V.v36.lag), 4)).toBe('164.7');
    expect(f(V.v36.amp * Math.cos(V.v36.lag) * um, 4)).toBe('−15.23');
    expect(f(-V.v36.amp * Math.sin(V.v36.lag) * um, 4)).toBe('−4.154');
    expect(f(V.demodEnd.re * um, 3)).toBe('−15.2');
    expect(f(V.demodEnd.im * um, 3)).toBe('−4.15');
  });

  it('B = 2 Hz는 0에서 시작해 1초쯤 지나면 자리 잡는다 (1.2 s 뒤 오차 < 1 %)', () => {
    const s = steadySignal({ rpm: 3600, seconds: 2, amp: V.v36.amp, lag: V.v36.lag, fs: 4096 });
    const v = trackOrder(s.x, s.theta, { fs: 4096, bandwidth: 2 });
    for (let i = Math.round(1.2 * 4096); i < s.x.length; i += 64) expect(Math.abs(Math.hypot(v.re[i], v.im[i]) / V.v36.amp - 1)).toBeLessThan(0.01);
  });

  it('그림 3: 절반까지 0.092 · 0.455 · 2.28 s ≈ τ_g(0.090 · 0.450 · 2.25 s), 90 %는 약 1.9배, 흔들림 1.47 · 0.66 · 0.29 µm pp', () => {
    const [b5, b1, b02] = V.step;
    expect([f(b5.t50, 2), f(b1.t50, 3), f(b02.t50, 3)]).toEqual(['0.092', '0.455', '2.28']);
    expect([f(b5.delay, 2), f(b1.delay, 3), f(b02.delay, 3)]).toEqual(['0.09', '0.45', '2.25']);
    for (const s of V.step) expect(f(s.t90 / s.delay, 2)).toBe('1.9');
    expect([f(pp(b5.noise), 3), f(pp(b1.noise), 2), f(pp(b02.noise), 2)]).toEqual(['1.47', '0.66', '0.29']);
  });

  it('지연 0.45/B: B = 0.5 → 0.90 s, 200 rpm/s면 180 rpm. B = 1 → 0.45 s, 300 rpm/s면 135 rpm', () => {
    expect(f(V.delayB05, 2)).toBe('0.9');
    expect(f(V.runB05.shiftRpm, 3)).toBe('180');
    expect(f(analyzeTracking({ ...D, bandwidth: 1, rate: 300 }).shiftRpm, 3)).toBe('135');
  });

  it('그림 4: 참 봉우리 3008 rpm·100.1 µm pp·AF 9.90, B = 2 → 3066·98.9·10.0, B = 0.5 → 3197·76.5·5.88·90° 3187', () => {
    expect(f(V.runB05.truePeakRpm, 4)).toBe('3008');
    expect(f(pp(V.runB05.truePeakAmp), 4)).toBe('100.1');
    expect(f(V.runB05.trueAf!.af, 3)).toBe('9.9');
    expect(f(V.runB2.peakRpm, 4)).toBe('3066');
    expect(f(pp(V.runB2.peakAmp), 3)).toBe('98.9');
    expect(f(V.runB2.af!.af, 3)).toBe('10');
    expect(f(V.runB05.peakRpm, 4)).toBe('3197');
    expect(f(pp(V.runB05.peakAmp), 3)).toBe('76.5');
    expect(f(V.runB05.af!.af, 3)).toBe('5.88');
    expect(f(V.runB05.phase90Rpm, 4)).toBe('3187');
    expect(V.runB05.trueAf!.n2 - V.runB05.trueAf!.n1).toBeGreaterThan(295);
    expect(V.runB05.trueAf!.n2 - V.runB05.trueAf!.n1).toBeLessThan(310);
  });

  it('그림 5: 코스트다운 2864 rpm (런업과 333 rpm), 두 번 거르기 3038 rpm·69.0 µm pp·90° 2997, B = 2 두 번 3014·97.6', () => {
    expect(f(V.downB05.peakRpm, 4)).toBe('2864');
    expect(f(V.runB05.peakRpm - V.downB05.peakRpm, 3)).toBe('333');
    expect(f(V.zpB05.peakRpm, 4)).toBe('3038');
    expect(f(pp(V.zpB05.peakAmp), 3)).toBe('69');
    expect(f(V.zpB05.phase90Rpm, 4)).toBe('2997');
    expect(f(V.zpB2.peakRpm, 4)).toBe('3014');
    expect(f(pp(V.zpB2.peakAmp), 3)).toBe('97.6');
  });

  it('랩 과제: 50 rpm/s·B 0.5 ≈ 200 rpm/s·B 2 (봉우리 3065 rpm·99.6 µm pp), 흔들림 0.5 → 0.9 µm pp', () => {
    const slow = analyzeTracking({ ...D, rate: 50 });
    expect(f(slow.peakRpm, 4)).toBe('3065');
    expect(f(pp(slow.peakAmp), 3)).toBe('99.6');
    expect(Math.abs(slow.peakRpm - V.runB2.peakRpm)).toBeLessThan(1);
    expect(f(pp(V.runB05.noiseStd), 1)).toBe('0.5');
    expect(f(pp(V.runB2.noiseStd), 1)).toBe('0.9');
    expect(f(pp(trackingNoise(D.noise, 0.5, TRK.fs)), 2)).toBe('0.47');
  });

  it('그림 6·노치: 직접 11.4 → 12.2 µm (7 %), Not-1X 2.35 → 4.86 µm, 남은 1X 최대 2.67 µm (3031 rpm). B 0.5 → 10.5 µm, 잡음 5 µm → 6.91 µm', () => {
    const n = V.notchRun;
    expect(f(V.directNoWhirl * um, 3)).toBe('11.4');
    expect(f(n.holdDirect * um, 3)).toBe('12.2');
    expect(f((n.holdDirect / V.directNoWhirl - 1) * 100, 1)).toBe('7');
    expect(f(V.notOneXBefore * um, 3)).toBe('2.35');
    expect(f(n.holdNotOneX * um, 3)).toBe('4.86');
    expect(Math.abs(n.holdNotOneX / n.holdTruth - 1)).toBeLessThan(0.01);
    expect(f(n.maxLeak * um, 3)).toBe('2.67');
    const at = n.blocks.reduce((m, b) => (b.leak > m.leak ? b : m));
    expect(Math.round(at.rpm)).toBe(3031);
    const narrow = analyzeTracking({ ...D, rate: 50, bandwidth: 0.5, noise: 1e-6, notch: true });
    expect(f(narrow.maxLeak * um, 3)).toBe('10.5');
    const noisy = analyzeTracking({ ...D, rate: 50, bandwidth: 2, noise: 5e-6, notch: true });
    expect(f(noisy.holdNotOneX * um, 3)).toBe('6.91');
  });
});
