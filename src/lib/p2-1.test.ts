/** M2.9: 재사용 그림의 수치와 P2-1의 측정 관점 정리를 고정한다. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as F from '../figures/p2-1';
import { crestFactor, peak, rms } from './dsp/stats';

const source = readFileSync(new URL('../pages/p2-1.mdx', import.meta.url), 'utf8');
const displayed = [
  F.machineWaveform, F.threeMeasures, F.amplitudeMeasures,
  F.crestFactorFigure, F.mixToSpectrum, F.samplesFigure, F.enoughSamples,
];

describe('P2-1 측정 기초 (M2.9)', () => {
  it('기존 그림 7개·크기 비교 랩을 유지하고 물리 설명은 Part 1로 연결한다', () => {
    expect(source.match(/<Figure /g)).toHaveLength(7);
    expect(source.match(/<AmplitudeMeasuresLab /g)).toHaveLength(1);
    expect(source).not.toMatch(/F\.(sineAnatomy|phaseShift|ordersFigure)/);
    expect(source).toContain("withBase('/p1-2/#21-정현파의-세-숫자를-직접-바꾸기')");
    for (const page of ['p1-7', 'p1-8', 'p1-9', 'p2-2', 'p2-3', 'p2-4', 'p2-7']) {
      expect(source).toContain("withBase('/" + page + "/')");
    }
    expect(source.match(/<summary><strong>Q\d\./g)).toHaveLength(7);
    // 트랙 A의 기존 페이지가 참조하는 절 번호는 바꾸지 않는다.
    for (const heading of ['## 3. 회전 주파수와 차수', '## 4. 크기를 숫자 하나로', '## 5. 스펙트럼:', '## 6. 샘플링:']) {
      expect(source).toContain(heading);
    }
  });

  it('재사용 그림의 ID가 겹치지 않고 모든 값이 유한하다', () => {
    expect(new Set(displayed.map((f) => f.id)).size).toBe(7);
    for (const f of displayed) for (const panel of f.panels) for (const series of panel.series ?? []) {
      expect(Array.from(series.x).every(Number.isFinite)).toBe(true);
      expect(Array.from(series.y).every(Number.isFinite)).toBe(true);
    }
  });

  it('변위·속도·가속도 그림은 두 정현파의 해석해와 일치한다', () => {
    const signal = F.threeMeasures.panels.map((p) => p.series![0]);
    const components = [
      [50, 0.5],
      [2 * Math.PI * 60 * 50e-3, 2 * Math.PI * 600 * 0.5e-3],
      [(2 * Math.PI * 60) ** 2 * 50e-6, (2 * Math.PI * 600) ** 2 * 0.5e-6],
    ];
    signal.forEach((s, derivative) => {
      for (let i = 0; i < s.x.length; i += 17) {
        const t = s.x[i];
        const expected = components[derivative].reduce((sum, a, k) =>
          sum + a * Math.cos(2 * Math.PI * [60, 600][k] * t + derivative * Math.PI / 2), 0);
        expect(s.y[i]).toBeCloseTo(expected, 9);
      }
    });
    expect(components[1][0]).toBeCloseTo(18.8496, 4);
    expect(components[2][0]).toBeCloseTo(7.10612, 4);
    expect(components[2][1]).toBeCloseTo(components[2][0], 12);
  });

  it('Peak 1 정현파는 RMS 약 0.707·CF 약 1.41이고, 같은 RMS라도 충격의 Peak가 더 크다', () => {
    const sine = F.amplitudeMeasures.panels[0].series![0].y;
    expect(peak(sine)).toBeCloseTo(1, 12);
    expect(rms(sine)).toBeCloseTo(1 / Math.SQRT2, 2);
    expect(crestFactor(sine)).toBeCloseTo(Math.SQRT2, 2);
    const [smooth, impulsive] = F.crestFactorFigure.panels.map((p) => p.series![0].y);
    expect(rms(smooth)).toBeCloseTo(1, 2);
    expect(rms(impulsive)).toBeCloseTo(1, 12);
    expect(peak(impulsive)).toBeGreaterThan(peak(smooth) * 2);
  });

  it('성분표는 60·120·180 Hz에서 Peak 5·2·1이다', () => {
    const spectrum = F.mixToSpectrum.panels[2].series!;
    expect(spectrum.map((s) => [s.x[0], s.y[0]])).toEqual([[60, 5], [120, 2], [180, 1]]);
    expect(source).toContain('60 Hz의 크기는 5, 120 Hz는 2, 180 Hz는 1');
  });

  it('10 Hz 신호의 12 Hz 샘플은 2 Hz의 샘플과 구별되지 않는다', () => {
    const dots = F.enoughSamples.panels[1].series!.find((s) => s.kind === 'dots')!;
    expect(dots.x[1] - dots.x[0]).toBeCloseTo(1 / 12, 12);
    for (let i = 0; i < dots.x.length; i++) {
      expect(dots.y[i]).toBeCloseTo(Math.cos(2 * Math.PI * 2 * dots.x[i]), 12);
    }
  });

  it('환산·측정 시간·눈금 간격 예시는 본문과 일치한다', () => {
    expect(25 / Math.SQRT2).toBeCloseTo(17.7, 1);
    expect(10 / Math.SQRT2).toBeCloseTo(7.07, 2);
    expect(1024 / 2560).toBe(0.4);
    expect(2560 / 1024).toBe(2.5);
    expect(2560 / 2).toBe(1280);
    expect(source).toContain('평균을 빼고 계산한 RMS');
    expect(source).toContain('눈금 간격과 가까운 두 성분을 실제로 구별하는 능력');
  });
});
