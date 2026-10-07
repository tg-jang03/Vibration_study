import { describe, expect, it } from 'vitest';
import {
  analogPrototype,
  besselPolynomial,
  decimate,
  designIir,
  filtfilt,
  firFilter,
  firLowpass,
  firResponse,
  iirResponse,
  integrateCumulative,
  integrateSpectral,
  sosFilter,
} from './filter';

const sine = (f: number, fs: number, n: number, amp = 1, ph = 0) => Float64Array.from({ length: n }, (_, i) => amp * Math.cos(2 * Math.PI * f * (i / fs) + ph));
/** 정상 구간에서 cos·sin 상관으로 진폭·위상 (정수 주기 구간) */
function toneAt(x: ArrayLike<number>, f: number, fs: number, from: number, to: number) {
  let c = 0;
  let s = 0;
  for (let i = from; i < to; i++) {
    c += x[i] * Math.cos((2 * Math.PI * f * i) / fs);
    s += x[i] * Math.sin((2 * Math.PI * f * i) / fs);
  }
  const m = to - from;
  return { amp: (2 * Math.hypot(c, s)) / m, phase: Math.atan2(-s, c) };
}

describe('아날로그 원형', () => {
  it('Bessel 다항식 계수: θ2 = s² + 3s + 3, θ3 = s³ + 6s² + 15s + 15', () => {
    expect(besselPolynomial(2)).toEqual([3, 3, 1]);
    expect(besselPolynomial(3)).toEqual([15, 15, 6, 1]);
  });

  it('Bessel 2차 극(−3 dB 정규화) = −1.1016 ± 0.6360j (scipy besselap norm=mag)', () => {
    const { poles } = analogPrototype('bessel', 2);
    const p = poles.find((q) => q.im > 0)!;
    expect(p.re).toBeCloseTo(-1.10160133, 6);
    expect(p.im).toBeCloseTo(0.63600982, 6);
  });

  it('Chebyshev I 짝수 차수의 DC 이득은 리플만큼 낮다', () => {
    expect(analogPrototype('chebyshev1', 4, 1).dcGain).toBeCloseTo(10 ** (-1 / 20), 10);
    expect(analogPrototype('chebyshev1', 3, 1).dcGain).toBe(1);
  });
});

describe('디지털 IIR 크기 응답', () => {
  const fs = 6400;
  it('Butterworth는 쌍선형 변환 뒤에도 |H| = 1/√(1 + (tan(πf/fs)/tan(πfc/fs))^{2n})', () => {
    for (const n of [1, 2, 3, 4, 8]) {
      for (const kind of ['lowpass', 'highpass'] as const) {
        const d = designIir({ family: 'butterworth', kind, order: n, fc: 150, fs });
        const fr = iirResponse(d, [10, 75, 150, 300, 1000, 3000]);
        fr.freq.forEach((f, i) => {
          const r = Math.tan((Math.PI * f) / fs) / Math.tan((Math.PI * 150) / fs);
          const want = kind === 'lowpass' ? 1 / Math.sqrt(1 + r ** (2 * n)) : 1 / Math.sqrt(1 + r ** (-2 * n));
          expect(fr.mag[i]).toBeCloseTo(want, 10);
        });
      }
    }
  });

  it('차단 주파수에서 Butterworth·Bessel은 −3 dB, Chebyshev I는 −리플 dB', () => {
    const at = (family: 'butterworth' | 'bessel' | 'chebyshev1') => iirResponse(designIir({ family, order: 4, fc: 150, fs, rippleDb: 1 }), [150]).mag[0];
    expect(at('butterworth')).toBeCloseTo(Math.SQRT1_2, 10);
    expect(at('bessel')).toBeCloseTo(Math.SQRT1_2, 3);
    expect(at('chebyshev1')).toBeCloseTo(10 ** (-1 / 20), 8);
  });

  it('차수 하나에 20 dB/디케이드: fs ≫ fc에서 4차는 10배 위로 80 dB 더 깎는다', () => {
    const d = designIir({ family: 'butterworth', order: 4, fc: 10, fs: 51200 });
    const [a, b] = iirResponse(d, [100, 1000]).mag;
    expect(20 * Math.log10(a / b)).toBeCloseTo(80, 0);
  });

  it('SOS로 거른 정상 상태 정현파 = |H|·진폭, 위상 = arg H', () => {
    const d = designIir({ family: 'chebyshev1', order: 5, fc: 150, fs, rippleDb: 1 });
    const f = 100;
    const y = sosFilter(d.sos, sine(f, fs, 6400));
    const got = toneAt(y, f, fs, 3200, 6400);
    const fr = iirResponse(d, [f]);
    expect(got.amp).toBeCloseTo(fr.mag[0], 6);
    const dph = Math.atan2(Math.sin(got.phase - fr.phase[0]), Math.cos(got.phase - fr.phase[0]));
    expect(Math.abs(dph)).toBeLessThan(1e-6);
  });
});

describe('위상과 군지연', () => {
  it('Bessel은 통과 대역 군지연이 거의 일정하고 Butterworth는 차단 주파수 근처에서 커진다', () => {
    const fs = 51200;
    const fr = (family: 'butterworth' | 'bessel') => iirResponse(designIir({ family, order: 4, fc: 500, fs }), [1, 250, 450]).groupDelay;
    const [b0, b5, b9] = fr('bessel');
    const [w0, , w9] = fr('butterworth');
    expect(Math.abs(b5 / b0 - 1)).toBeLessThan(0.01);
    expect(Math.abs(b9 / b0 - 1)).toBeLessThan(0.06);
    expect(w9 / w0).toBeGreaterThan(1.3);
    // 4차 Butterworth의 DC 군지연 = Σ 1/sin(θ_k)… = 2.6131/ω_c
    expect(w0).toBeCloseTo(2.6131 / (2 * Math.PI * 500), 5);
  });

  it('계단 응답 오버슈트: 4차 Butterworth 10.8 %, 4차 Bessel 0.84 % (문헌값)', () => {
    const fs = 102400;
    const step = new Float64Array(20000).fill(1);
    const over = (family: 'butterworth' | 'bessel') => {
      const y = sosFilter(designIir({ family, order: 4, fc: 100, fs }).sos, step);
      return (Math.max(...y) - 1) * 100;
    };
    expect(over('butterworth')).toBeCloseTo(10.8, 1);
    expect(over('bessel')).toBeCloseTo(0.84, 1);
  });

  it('두 번 거르기: 위상 0, 크기는 |H|² (차단 주파수에서 0.5)', () => {
    const fs = 6400;
    const d = designIir({ family: 'butterworth', order: 4, fc: 150, fs });
    const x = sine(150, fs, 12800);
    const y = filtfilt(d.sos, x);
    const got = toneAt(y, 150, fs, 3200, 9600);
    expect(got.amp).toBeCloseTo(0.5, 4);
    expect(Math.abs(got.phase)).toBeLessThan(1e-3);
  });
});

describe('FIR', () => {
  it('대칭 계수 → 군지연 (N − 1)/2 샘플로 일정, DC 이득 1, f_c에서 −3 dB', () => {
    const fs = 6400;
    const h = firLowpass(101, 150, fs);
    const fr = firResponse(h, fs, [0, 50, 100, 150]);
    expect(fr.mag[0]).toBeCloseTo(1, 10);
    expect(fr.mag[3]).toBeCloseTo(Math.SQRT1_2, 6);
    fr.groupDelay.forEach((g) => expect(g * fs).toBeCloseTo(50, 6));
    const y = firFilter(h, sine(100, fs, 6400));
    expect(toneAt(y, 100, fs, 3200, 6400).amp).toBeCloseTo(fr.mag[2], 6);
  });
});

describe('적분', () => {
  const fs = 2560;
  const n = 8192;
  it('주파수 영역: a = A cos 2πft → v = A/(2πf) sin 2πft, 두 번이면 −A/(2πf)² cos', () => {
    const f = 25; // n·f/fs = 80 → 정수 주기
    const a = sine(f, fs, n, 3);
    const v = integrateSpectral(a, fs, 1);
    const d = integrateSpectral(a, fs, 2);
    const w = 2 * Math.PI * f;
    for (const i of [0, 37, 1000, 5000]) {
      const t = i / fs;
      expect(v[i]).toBeCloseTo((3 / w) * Math.sin(w * t), 10);
      expect(d[i]).toBeCloseTo((-3 / (w * w)) * Math.cos(w * t), 10);
    }
  });

  it('하한 컷오프: 2차 고역 통과 크기만큼 줄어든다 (20 Hz 컷오프면 25 Hz가 0.84배)', () => {
    const v = integrateSpectral(sine(25, fs, n, 1), fs, 1, 20);
    const amp = Math.max(...v);
    expect(amp * 2 * Math.PI * 25).toBeCloseTo(1 / Math.sqrt(1 + (20 / 25) ** 4), 6);
  });

  it('시간 영역 누적합: 직류 오프셋 a0는 속도를 a0·t로 끌고 간다, 고역 통과를 먼저 걸면 머문다', () => {
    const a0 = 0.005;
    const x = new Float64Array(n).fill(a0);
    const v = integrateCumulative(x, fs);
    expect(v[n - 1]).toBeCloseTo(a0 * ((n - 1) / fs), 10);
    const vh = integrateCumulative(x, fs, 5);
    expect(Math.abs(vh[n - 1])).toBeLessThan(1e-6);
  });
});

describe('데시메이션', () => {
  it('저역 통과 없이 줄이면 1300 Hz가 1600 − 1300 = 300 Hz로 접힌다, 거르면 사라진다', () => {
    const fs = 12800;
    const n = 12800;
    const x = Float64Array.from({ length: n }, (_, i) => Math.cos((2 * Math.PI * 100 * i) / fs) + 0.5 * Math.cos((2 * Math.PI * 1300 * i) / fs));
    const raw = decimate(x, fs, 8, false);
    const filt = decimate(x, fs, 8, true);
    expect(raw.fs).toBe(1600);
    expect(toneAt(raw.x, 300, 1600, 0, 1600).amp).toBeCloseTo(0.5, 6);
    expect(toneAt(filt.x, 300, 1600, 200, 1400).amp).toBeLessThan(1e-3);
    expect(toneAt(filt.x, 100, 1600, 200, 1400).amp).toBeCloseTo(1, 2);
  });
});
