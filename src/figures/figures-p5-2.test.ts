import { describe, expect, it } from 'vitest';
import * as F from './p5-2';
import { stft } from '../lib/dsp/stft';
import { RUN, rpmAt, runSignal, trueX1 } from '../lib/stftDemo';

const V = F.P52_VALUES;

describe('P5-2 그림 숫자 (본문·캡션이 인용)', () => {
  it('기동과 잠김', () => {
    expect(V.rate).toBeCloseTo(1.25, 10);
    expect(V.best).toBeCloseTo(0.894, 3);
    expect(V.best2).toBeCloseTo(0.632, 3);
    expect(V.lockRpm).toBeCloseTo(3333, 0);
    expect(V.lockTime).toBeCloseTo(36.4, 1);
  });

  it('그림 2: 진해지는 곳과 줄의 크기', () => {
    expect(V.x1Crit).toBeCloseTo(40.7, 1);
    expect(V.x2Res).toBeCloseTo(10.2, 1);
    expect(V.whip42).toBeCloseTo(7.7, 1);
    expect(V.whip55).toBeCloseTo(14.0, 1);
  });

  it('그림 3: 프레임 길이별 20 s 1X 봉우리 폭·높이', () => {
    const [a, b, c] = V.tradeoff;
    expect(a.width).toBeCloseTo(12, 6);
    expect(b.width).toBeCloseTo(4, 6);
    expect(c.move).toBeCloseTo(10, 10);
    expect(b.peak).toBeCloseTo(16.1, 1);
    expect(c.peak).toBeCloseTo(3.65, 2);
  });
});

describe('LAB-STFT-01 읽음값 (겹침 50 % 기본)', () => {
  it('20 s 1X 실제 진폭 16.3 µm, N = 128 / 512 / 4096의 봉우리 15.6 / 16.1 / 3.65 µm', () => {
    expect(trueX1(rpmAt(20)) * 1e6).toBeCloseTo(16.3, 1);
    const x = runSignal().x;
    const peak = (n: number) => {
      const S = stft(x, RUN.fs, { n, overlap: 0.5, fMax: 130 });
      const m = S.times.findIndex((t) => Math.abs(t - 20) < 1e-9);
      expect(m).toBeGreaterThanOrEqual(0);
      const f1 = rpmAt(20) / 60;
      let p = 0;
      for (let k = Math.floor((f1 - 6) / S.df); k <= Math.ceil((f1 + 6) / S.df); k++) p = Math.max(p, S.amp[m][k]);
      return p * 1e6;
    };
    expect(peak(128)).toBeCloseTo(15.6, 1);
    expect(peak(512)).toBeCloseTo(16.1, 1);
    expect(peak(4096)).toBeCloseTo(3.65, 2);
  });
});
