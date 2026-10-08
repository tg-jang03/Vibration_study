import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { analyzeGear, DEFAULT_GEAR as D, G, GEAR } from '../lib/cepstrumDemo';
import * as F from './p5-7';

const V = F.P57_VALUES;
const dB = (v: number) => 20 * Math.log10(v / G);
const ms = (s: number) => s * 1000;

describe('P5-7 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('기어: 맞물림 600 Hz, 기어 16.22 Hz(61.7 ms, 973 rpm), 켑스트럼 40 ms 0.071 · 61.7 ms 0.033, 가장 큰 봉우리 40 ms', () => {
    expect(V.mesh).toBe(600);
    expect(f(V.f2, 4)).toBe('16.22');
    expect(f(ms(1 / V.f2), 3)).toBe('61.7');
    expect(Math.round(V.f2 * 60)).toBe(973);
    expect(f(V.base.peak1, 2)).toBe('0.071');
    expect(f(V.base.peak2, 2)).toBe('0.033');
    expect(f(ms(V.base.topQuefrency), 3)).toBe('40');
  });

  it('라모닉: 200·240 ms가 40 ms와 거의 같은 높이 (±5 %)', () => {
    const r = V.rahmonics;
    expect(Math.abs(r[4] / r[0] - 1)).toBeLessThan(0.05);
    expect(Math.abs(r[5] / r[0] - 1)).toBeLessThan(0.05);
  });

  it('리프터링: 피니언 무리 → 625 Hz 15.0 dB 낮아짐, 616.2 Hz는 2 dB 안. 기어 무리 → 616.2 Hz 약 7 dB, 625 Hz 그대로', () => {
    expect(f(dB(V.pinionCut.sb1[0]) - dB(V.pinionCut.sb1[1]), 3)).toBe('15');
    expect(Math.abs(dB(V.pinionCut.sb2[1]) - dB(V.pinionCut.sb2[0]))).toBeLessThan(2);
    const g = analyzeGear(D, 'gear');
    expect(Math.round(dB(g.sb2[0]) - dB(g.sb2[1]))).toBe(7);
    expect(Math.abs(dB(g.sb1[1]) - dB(g.sb1[0]))).toBeLessThan(0.2);
  });

  it('잡음 0.2 g: 가장 큰 봉우리가 41.7 ms 같은 엉뚱한 자리로', () => {
    expect(f(ms(analyzeGear({ ...D, noise: 0.2 * G }).topQuefrency), 3)).toBe('41.7');
  });

  it('추세: 첨도 최대는 약 15 (진행 55 % 근처)', () => {
    expect(f(V.kPeak, 2)).toBe('15');
  });

  it('랩: 피니언 0이면 40 ms 봉우리가 사라지고 가장 큰 봉우리는 185 ms(기어 3배), 잡음 0.2 g → 0.024, 0.01 g → 0.14', () => {
    const noPinion = analyzeGear({ ...D, m1: 0 });
    expect(noPinion.peak1).toBeLessThan(0.2 * V.base.peak1);
    expect(f(ms(noPinion.topQuefrency), 3)).toBe('185');
    expect(f(analyzeGear({ ...D, noise: 0.2 * G }).peak1, 2)).toBe('0.024');
    expect(f(analyzeGear({ ...D, noise: 0.01 * G }).peak1, 2)).toBe('0.14');
  });

  it('그림 5: 기어 신호 자기상관 R(1.67 ms) 0.966, R(20 ms) 0.974, R(40 ms) 0.952', () => {
    expect(f(V.base.acf[Math.round(GEAR.fs / 600)], 3)).toBe('0.966');
    expect(f(V.base.acf[Math.round(0.02 * GEAR.fs)], 3)).toBe('0.974');
    expect(f(V.base.acf[Math.round(0.04 * GEAR.fs)], 3)).toBe('0.952');
  });

  it('그림 4: 포락선 자기상관 첫 봉우리 5.55 ms → 약 180 Hz', () => {
    expect(f(V.envAcf.firstPeakMs, 3)).toBe('5.55');
    expect(Math.round(1000 / V.envAcf.firstPeakMs)).toBe(180);
    // 다섯째 봉우리 27.89 ms ÷ 5 → 179.3 Hz (표본 간격 오차가 1/5)
    let i5 = -1;
    V.envAcf.lags.forEach((l, i) => { if (l > 27 && l < 29 && (i5 < 0 || V.envAcf.r[i] > V.envAcf.r[i5])) i5 = i; });
    expect(f(V.envAcf.lags[i5], 4)).toBe('27.89');
    expect(f(5000 / V.envAcf.lags[i5], 4)).toBe('179.3');
  });

  it('그림 6: 정현파 CF 1.41 K 1.5, 잡음 3.39·3.02, 충격 6.42·17.9 S 0.83, 눌린 정현파 1.62·1.51 S −0.42', () => {
    const s = V.shapes;
    expect([f(s[0].crest, 3), f(s[0].kurtosis, 2)]).toEqual(['1.41', '1.5']);
    expect([f(s[1].crest, 3), f(s[1].kurtosis, 3)]).toEqual(['3.39', '3.02']);
    expect([f(s[2].crest, 3), f(s[2].kurtosis, 3), f(s[2].skewness, 2)]).toEqual(['6.42', '17.9', '0.83']);
    expect([f(s[3].crest, 3), f(s[3].kurtosis, 3), f(s[3].skewness, 2)]).toEqual(['1.62', '1.51', '−0.42']);
  });

  it('그림 7·랩: 건전 RMS 0.087 g·CF 3.07·K 2.36 → 30 % 0.17 g·6.61·10.7 → 55 % 0.31 g·14.8 → 100 % 0.82 g·CF 5.39·K 3.43', () => {
    const g = (v: number) => v / G;
    expect([f(g(V.healthy.rms), 2), f(V.healthy.crest, 3), f(V.healthy.kurtosis, 3)]).toEqual(['0.087', '3.07', '2.36']);
    expect([f(g(V.early.rms), 2), f(V.early.crest, 3), f(V.early.kurtosis, 3)]).toEqual(['0.17', '6.61', '10.7']);
    expect([f(g(V.mid.rms), 2), f(V.mid.kurtosis, 3)]).toEqual(['0.31', '14.8']);
    expect([f(g(V.late.rms), 2), f(V.late.crest, 3), f(V.late.kurtosis, 3)]).toEqual(['0.82', '5.39', '3.43']);
    const ks = V.trend.f.map((x) => x.kurtosis);
    const iMax = ks.indexOf(Math.max(...ks));
    expect(V.trend.s[iMax]).toBeGreaterThan(0.4);
    expect(V.trend.s[iMax]).toBeLessThan(0.65);
    // RMS는 줄곧 오른다 (잡음 흔들림 1 % 안)
    V.trend.f.forEach((x, i) => {
      if (i > 0) expect(x.rms).toBeGreaterThan(0.99 * V.trend.f[i - 1].rms);
    });
  });
});
