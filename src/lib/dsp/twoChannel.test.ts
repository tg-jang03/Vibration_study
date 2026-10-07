import { describe, expect, it } from 'vitest';
import { createRng } from './random';
import { averageCross, coherence, cxAbs, forwardBackward, frfH1, frfH2, fullSpectrum, spectraFrames } from './twoChannel';

describe('교차 스펙트럼 · FRF · 코히어런스', () => {
  it('프레임 하나(M = 1)면 코히어런스는 잡음과 상관없이 항상 1', () => {
    const rng = createRng(3);
    const mk = () => ({ re: Float64Array.from({ length: 64 }, () => rng.normal()), im: Float64Array.from({ length: 64 }, () => rng.normal()) });
    const g = averageCross([mk()], [mk()]);
    for (const v of coherence(g)) expect(v).toBeCloseTo(1, 12);
  });

  it('잡음이 없으면 H1 = H2 = 참 FRF(0.5배 + 3샘플 지연), γ² ≈ 1 (시간 신호 → 프레임 → 평균)', () => {
    const fs = 1000;
    const rng = createRng(5);
    const x = Float64Array.from({ length: 64 * 1024 }, () => rng.normal());
    const y = Float64Array.from(x, (_, i) => (i >= 3 ? 0.5 * x[i - 3] : 0));
    const g = averageCross(spectraFrames(x, 1024, 0.5), spectraFrames(y, 1024, 0.5));
    const h1 = frfH1(g);
    const h2 = cxAbs(frfH2(g));
    const gamma = coherence(g);
    for (const f of [20, 100, 250, 400]) {
      const k = Math.round(f / (fs / 1024));
      expect(Math.hypot(h1.re[k], h1.im[k])).toBeCloseTo(0.5, 2);
      expect(h2[k]).toBeCloseTo(0.5, 2);
      // 위상 = −2π f · 3 / f_s (지연)
      const ph = Math.atan2(h1.im[k], h1.re[k]);
      const want = -2 * Math.PI * ((k * fs) / 1024) * (3 / fs);
      expect(Math.abs(Math.atan2(Math.sin(ph - want), Math.cos(ph - want)))).toBeLessThan(1e-3);
      expect(gamma[k]).toBeGreaterThan(0.99); // 두 채널 사이 지연만큼 조금 낮다
    }
  });

  it('잡음의 기대값: 출력 잡음만 → H1 그대로·H2 커짐, 입력 잡음만 → H2 그대로·H1 작아짐', () => {
    const rng = createRng(9);
    const M = 4000;
    const H = 0.5; // 실수 FRF 한 bin
    const run = (nx: number, ny: number) => {
      const xs = [];
      const ys = [];
      for (let m = 0; m < M; m++) {
        const ur = rng.normal();
        const ui = rng.normal();
        xs.push({ re: Float64Array.of(ur + nx * rng.normal()), im: Float64Array.of(ui + nx * rng.normal()) });
        ys.push({ re: Float64Array.of(H * ur + ny * rng.normal()), im: Float64Array.of(H * ui + ny * rng.normal()) });
      }
      const g = averageCross(xs, ys);
      return { h1: cxAbs(frfH1(g))[0], h2: cxAbs(frfH2(g))[0], gamma: coherence(g)[0] };
    };
    const out = run(0, 0.5); // 출력 잡음 파워 = 응답 파워 (H² = 0.25)
    expect(out.h1).toBeCloseTo(0.5, 1);
    expect(out.h2).toBeCloseTo(0.5 * (1 + 0.25 / 0.25), 1); // H(1 + G_nn/∣H∣²G_uu) = 1.0
    expect(out.gamma).toBeCloseTo(0.5, 1);
    const inp = run(1, 0); // 입력 잡음 파워 = 입력 파워
    expect(inp.h1).toBeCloseTo(0.25, 1); // H·G_uu/(G_uu + G_mm)
    expect(inp.h2).toBeCloseTo(0.5, 1);
  });
});

describe('Full spectrum', () => {
  const fs = 1280;
  const n = 1024;
  const f = 50;
  const sig = (fx: (w: number) => number, fy: (w: number) => number) => ({
    x: Float64Array.from({ length: n }, (_, i) => fx(2 * Math.PI * f * (i / fs))),
    y: Float64Array.from({ length: n }, (_, i) => fy(2 * Math.PI * f * (i / fs))),
  });
  const at = (s: { freq: Float64Array; amp: Float64Array }, hz: number) => s.amp[s.freq.findIndex((v) => Math.abs(v - hz) < 1e-9)];

  it('반시계 원 → +f에만, 시계 원 → −f에만 (진폭 = 반지름)', () => {
    const ccw = sig((w) => 3 * Math.cos(w), (w) => 3 * Math.sin(w));
    const cw = sig((w) => 3 * Math.cos(w), (w) => -3 * Math.sin(w));
    const a = fullSpectrum(ccw.x, ccw.y, fs);
    const b = fullSpectrum(cw.x, cw.y, fs);
    expect(at(a, 50)).toBeCloseTo(3, 10);
    expect(at(a, -50)).toBeCloseTo(0, 10);
    expect(at(b, -50)).toBeCloseTo(3, 10);
    expect(at(b, 50)).toBeCloseTo(0, 10);
  });

  it('직선 → 양쪽이 같은 크기(진폭의 절반), 타원(반축 a, b) → (a + b)/2와 ∣a − b∣/2', () => {
    const line = sig((w) => 4 * Math.cos(w), () => 0);
    const l = fullSpectrum(line.x, line.y, fs);
    expect(at(l, 50)).toBeCloseTo(2, 10);
    expect(at(l, -50)).toBeCloseTo(2, 10);
    const el = sig((w) => 5 * Math.cos(w), (w) => 2 * Math.sin(w));
    const e = fullSpectrum(el.x, el.y, fs);
    expect(at(e, 50)).toBeCloseTo(3.5, 10);
    expect(at(e, -50)).toBeCloseTo(1.5, 10);
  });

  it('복소 진폭 식(P4-2의 A_f·A_b)과 FFT가 같다', () => {
    const lag = (70 * Math.PI) / 180;
    const s = sig((w) => 4 * Math.cos(w + 0.3), (w) => 2.5 * Math.cos(w + 0.3 - lag));
    const fsp = fullSpectrum(s.x, s.y, fs);
    const r = forwardBackward(4 * Math.cos(0.3), 4 * Math.sin(0.3), 2.5 * Math.cos(0.3 - lag), 2.5 * Math.sin(0.3 - lag));
    expect(at(fsp, 50)).toBeCloseTo(r.af, 10);
    expect(at(fsp, -50)).toBeCloseTo(r.ab, 10);
  });
});
