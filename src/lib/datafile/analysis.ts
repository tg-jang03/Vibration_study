/**
 * 실측 신호의 베어링 진단 순서 (P11-2 · LAB-DATA-01): 기록 자르기 → 통계 → 평균 스펙트럼 → Kurtogram으로 대역 → 엔벨로프 → 결함 주파수 대조.
 * 순수 함수. 계산은 Part 5의 `lib/dsp`(envelope·kurtogram·stats)를 그대로 쓴다.
 */
import { envelopeSpectrum, kurtogram, spectrumOf, type Kurtogram } from '../dsp/envelope';
import { crestFactor, kurtosis, rms } from '../dsp/stats';
import { hannWindow } from '../dsp/window';
import { fft } from '../dsp/fft';
import type { BearingFactors } from './index';

/** 쓸 기록 길이: 2의 거듭제곱 중 len 이하에서 가장 큰 것(최대 maxN) */
export function recordLength(len: number, maxN = 1 << 17): number {
  let n = 1;
  while (n * 2 <= Math.min(len, maxN)) n *= 2;
  return n;
}

/** 앞에서 n점을 잘라 평균을 뺀다 */
export function takeRecord(x: ArrayLike<number>, n: number): Float64Array {
  const out = new Float64Array(n);
  let m = 0;
  for (let i = 0; i < n; i++) m += x[i];
  m /= n;
  for (let i = 0; i < n; i++) out[i] = x[i] - m;
  return out;
}

export function stats(x: ArrayLike<number>) {
  return { rms: rms(x), kurtosis: kurtosis(x), crest: crestFactor(x) };
}

/**
 * 평균 스펙트럼 (Welch: Hann, 50 % 겹침, 파워 평균). 진폭은 RMS(입력 단위). 프레임 nfft점.
 * 파워를 평균한 뒤 제곱근 — 줄의 높이는 그대로, 바닥의 흔들림만 줄어든다 (P2-6).
 */
export function averagedSpectrum(x: ArrayLike<number>, fs: number, nfft: number) {
  const w = hannWindow(nfft);
  let s1 = 0;
  for (const v of w) s1 += v;
  const half = nfft / 2;
  const p = new Float64Array(half + 1);
  const buf = new Float64Array(nfft);
  let frames = 0;
  for (let s = 0; s + nfft <= x.length; s += nfft / 2) {
    for (let i = 0; i < nfft; i++) buf[i] = x[s + i] * w[i];
    const X = fft(buf);
    for (let k = 0; k <= half; k++) {
      const a = ((k === 0 || k === half ? 1 : 2) * Math.hypot(X.real[k], X.imag[k])) / s1;
      p[k] += a * a;
    }
    frames++;
  }
  const freq = Float64Array.from({ length: half + 1 }, (_, k) => (k * fs) / nfft);
  const amp = p.map((v) => Math.sqrt(v / Math.max(1, frames)) / Math.SQRT2);
  return { freq, amp, frames, df: fs / nfft };
}

/**
 * Kurtogram과 가장 충격적인 대역. 대역 폭이 minBw보다 좁은 레벨은 보지 않는다 —
 * 엔벨로프 스펙트럼에는 대역 폭보다 높은 줄이 설 수 없으므로, 결함 주파수의 몇 배(보통 3배)는 담을 만큼 넓어야 한다.
 */
export function bestBand(x: Float64Array, fs: number, minBw = 0, maxLevel = 7): { kg: Kurtogram; band: [number, number] } {
  let level = 1;
  while (level < maxLevel && fs / 2 / 2 ** (level + 1) >= minBw) level++;
  const kg = kurtogram(spectrumOf(x), fs, level);
  return { kg, band: [kg.best.f1, kg.best.f2] };
}

/** 엔벨로프 스펙트럼 [입력 단위, Peak] 0 ~ fShow */
export function envelope(x: Float64Array, fs: number, band: readonly [number, number], fShow: number) {
  const e = envelopeSpectrum(spectrumOf(x), fs, Math.max(0, band[0]), Math.min(fs / 2, band[1]), fShow);
  return { freq: e.freq, amp: e.amp };
}

export interface DefectLine {
  key: 'bpfo' | 'bpfi' | 'ball' | 'ftf';
  label: string;
  f: number;
}

export function defectLines(b: BearingFactors, fr: number): DefectLine[] {
  return [
    { key: 'bpfo', label: 'BPFO (외륜)', f: b.bpfo * fr },
    { key: 'bpfi', label: 'BPFI (내륜)', f: b.bpfi * fr },
    { key: 'ball', label: '볼 (표의 값)', f: b.ball * fr },
    { key: 'ftf', label: 'FTF (케이지)', f: b.ftf * fr },
  ];
}

/** 스펙트럼 바닥: fMin ~ fMax의 진폭 중앙값 */
export function floorOf(freq: ArrayLike<number>, amp: ArrayLike<number>, fMin: number, fMax: number): number {
  const v: number[] = [];
  for (let k = 0; k < freq.length; k++) if (freq[k] >= fMin && freq[k] <= fMax) v.push(amp[k]);
  if (v.length === 0) return 0;
  v.sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)];
}

function peakIn(freq: ArrayLike<number>, amp: ArrayLike<number>, f: number, tol: number) {
  let best = { f, a: 0 };
  for (let k = 0; k < freq.length; k++) if (Math.abs(freq[k] - f) <= tol && amp[k] > best.a) best = { f: freq[k], a: amp[k] };
  return best;
}

export interface DefectScore extends DefectLine {
  /** 1 · 2 · 3배 자리에서 찾은 봉우리 (허용 폭 안) */
  harmonics: { f: number; a: number; ratio: number }[];
  /** 1배 둘레 ± 1X 측대역의 바닥 대비 (내륜 결함의 표시) */
  sideband: number;
  /** 1배 자리의 바닥 대비 */
  ratio: number;
}

/**
 * 결함 주파수마다 엔벨로프 스펙트럼의 1 · 2 · 3배 자리 봉우리를 바닥과 비교한다.
 * 허용 폭 = 계산값의 tolPct % (미끄럼·회전수 오차, P7-5) 또는 2 bin 중 큰 것.
 * 판정을 대신하지 않는다 — 어느 자리가 바닥 위로 섰는지 보여 줄 뿐이다.
 */
export function scoreDefects(freq: ArrayLike<number>, amp: ArrayLike<number>, lines: DefectLine[], fr: number, tolPct = 2, bandwidth = Infinity): DefectScore[] {
  const df = freq.length > 1 ? freq[1] - freq[0] : 1;
  // 대역 폭 위로는 줄이 설 수 없으므로 바닥과 비교 범위를 거기까지로
  const fMax = Math.min(freq[freq.length - 1], bandwidth);
  const floor = floorOf(freq, amp, 5, fMax) || 1e-30;
  return lines.map((l) => {
    const harmonics = [1, 2, 3]
      .filter((h) => h * l.f <= fMax)
      .map((h) => {
        const p = peakIn(freq, amp, h * l.f, Math.max(2 * df, (tolPct / 100) * h * l.f));
        return { f: p.f, a: p.a, ratio: p.a / floor };
      });
    const sb = [-1, 1].map((s) => peakIn(freq, amp, l.f + s * fr, Math.max(2 * df, (tolPct / 100) * l.f)).a / floor);
    return { ...l, harmonics, sideband: Math.min(sb[0], sb[1]), ratio: harmonics[0]?.ratio ?? 0 };
  });
}
