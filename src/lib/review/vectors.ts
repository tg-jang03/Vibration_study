/**
 * 기록 다시 그리기 (P11-3 · LAB-REV-01): 펄스 사이를 한 바퀴로 보고 회전마다 nX 벡터를 뽑아 Bode·Polar·캐스케이드를 만든다. 순수 함수.
 * - 축 각도: 펄스 k에서 θ = 0, 다음 펄스까지 시간에 비례해 2π (한 바퀴 안에서는 회전수가 일정하다고 본다, P5-4).
 * - nX 벡터: 그 바퀴의 샘플로 X = (2/N) Σ x e^(−jnθ) — x = A cos(nθ − φ)이면 X = A e^(−jφ), φ = 지연각(P3-3 관례).
 *   한 바퀴 DFT는 폭 약 1/T_rev의 트래킹 필터와 같고(P5-5), m바퀴를 평균하면 잡음은 줄지만 빠르게 변하는 곳은 뭉개진다(P3-5).
 */
import { halfPowerAF, phaseShiftRpm, type RunUpPoint } from '../rotor/runup';
import { singleSidedSpectrum } from '../dsp/spectrum';

const TWO_PI = 2 * Math.PI;
const DEG = 180 / Math.PI;

export interface RevVector {
  /** 그 바퀴(들)의 가운데 시각 [s]과 평균 회전수 [rpm] */
  t: number;
  rpm: number;
  /** 벡터 (채널 단위, Peak) */
  re: number;
  im: number;
  /** 크기 [채널 단위 Peak]과 지연각 [°, 0 ~ 360] */
  amp: number;
  lag: number;
}

const lagDeg = (re: number, im: number) => {
  const d = (-Math.atan2(im, re) * DEG) % 360;
  return d < 0 ? d + 360 : d;
};
const pack = (t: number, rpm: number, re: number, im: number): RevVector => ({ t, rpm, re, im, amp: Math.hypot(re, im), lag: lagDeg(re, im) });

/** 회전마다(또는 revsPerPoint바퀴마다 평균한) nX 벡터 */
export function perRevVectors(x: ArrayLike<number>, fs: number, pulses: ArrayLike<number>, order = 1, revsPerPoint = 1): RevVector[] {
  const out: RevVector[] = [];
  let accRe = 0;
  let accIm = 0;
  let accN = 0;
  let accT = 0;
  let accRpm = 0;
  for (let k = 0; k + 1 < pulses.length; k++) {
    const t0 = pulses[k];
    const t1 = pulses[k + 1];
    const T = t1 - t0;
    if (!(T > 0)) continue;
    const i0 = Math.ceil(t0 * fs);
    const i1 = Math.min(x.length - 1, Math.floor(t1 * fs - 1e-9));
    const n = i1 - i0 + 1;
    if (n < 4) continue; // 한 바퀴에 샘플이 너무 적으면 버린다
    // 그 바퀴의 평균(gap 전압 같은 DC)을 먼저 뺀다 — 한 바퀴의 샘플 수가 정수가 아니어서 큰 DC가 nX로 새는 것을 막는다
    let mean = 0;
    for (let i = i0; i <= i1; i++) mean += x[i];
    mean /= n;
    let re = 0;
    let im = 0;
    for (let i = i0; i <= i1; i++) {
      const th = (order * TWO_PI * (i / fs - t0)) / T;
      re += (x[i] - mean) * Math.cos(th);
      im -= (x[i] - mean) * Math.sin(th);
    }
    accRe += (2 * re) / n;
    accIm += (2 * im) / n;
    accN++;
    accT += (t0 + t1) / 2;
    accRpm += 60 / T;
    if (accN === revsPerPoint) {
      out.push(pack(accT / accN, accRpm / accN, accRe / accN, accIm / accN));
      accRe = accIm = accT = accRpm = 0;
      accN = 0;
    }
  }
  return out;
}

/** 회전수 칸(step rpm)마다 벡터를 평균해 회전수 순으로 (Bode·Polar용) */
export function binByRpm(v: readonly RevVector[], step: number): RevVector[] {
  const bins = new Map<number, { re: number; im: number; t: number; rpm: number; n: number }>();
  for (const p of v) {
    const k = Math.round(p.rpm / step);
    const b = bins.get(k) ?? { re: 0, im: 0, t: 0, rpm: 0, n: 0 };
    b.re += p.re;
    b.im += p.im;
    b.t += p.t;
    b.rpm += p.rpm;
    b.n++;
    bins.set(k, b);
  }
  return [...bins.entries()].sort((a, b) => a[0] - b[0]).map(([, b]) => pack(b.t / b.n, b.rpm / b.n, b.re / b.n, b.im / b.n));
}

/** slow roll 벡터: 회전수 [lo, hi] 안 벡터의 평균. 없으면 null */
export function slowRollVector(v: readonly RevVector[], lo: number, hi: number): RevVector | null {
  const s = v.filter((p) => p.rpm >= lo && p.rpm <= hi);
  if (s.length === 0) return null;
  const m = (f: (p: RevVector) => number) => s.reduce((a, p) => a + f(p), 0) / s.length;
  return pack(m((p) => p.t), m((p) => p.rpm), m((p) => p.re), m((p) => p.im));
}

/** 벡터에서 slow roll 벡터를 뺀다 (복소수 뺄셈, P3-3) */
export function compensate(v: readonly RevVector[], sr: RevVector | null): RevVector[] {
  if (!sr) return [...v];
  return v.map((p) => pack(p.t, p.rpm, p.re - sr.re, p.im - sr.im));
}

/** Bode 요약: 가장 큰 1X의 회전수·크기, Half-power AF, 위상이 90° 더 늦어지는 회전수 */
export function bodeSummary(points: readonly RevVector[]) {
  const pts: RunUpPoint[] = points.map((p) => ({ rpm: p.rpm, amp: p.amp, lag: p.lag / DEG }));
  let k = 0;
  for (let i = 1; i < pts.length; i++) if (pts[i].amp > pts[k].amp) k = i;
  const hp = halfPowerAF(pts);
  return {
    peakRpm: pts[k]?.rpm ?? Number.NaN,
    peakAmp: pts[k]?.amp ?? Number.NaN,
    af: hp?.af ?? null,
    n1: hp?.n1 ?? null,
    n2: hp?.n2 ?? null,
    /** 위상이 90° 더 늦어지는 회전수 — 기준은 크기가 봉우리의 10 %를 넘는 가장 낮은 회전수의 위상(그 아래는 잡음에 흔들린다) */
    rpm90: phaseShiftRpm(pts.filter((p) => p.amp >= 0.1 * (pts[k]?.amp ?? 0))),
  };
}

export interface CascadeRow {
  rpm: number;
  t: number;
  amp: Float64Array;
}

/**
 * 캐스케이드: nfft점 창(Hann)을 hop마다 옮기며 스펙트럼 [채널 단위 Peak], 창 가운데의 회전수(펄스로).
 * 회전수 순으로 정렬해 돌려준다 (기동이든 정지든 아래가 저속).
 */
export function cascadeRows(x: ArrayLike<number>, fs: number, pulses: ArrayLike<number>, nfft: number, maxRows = 80, fMax = fs / 2) {
  const rows: CascadeRow[] = [];
  const total = Math.floor((x.length - nfft) / nfft) + 1;
  const step = Math.max(1, Math.ceil(total / maxRows));
  const kEnd = Math.floor((Math.min(fMax, fs / 2) * nfft) / fs);
  const rpmAt = (t: number) => {
    // 펄스 간격으로 t의 회전수
    let lo = 0;
    let hi = pulses.length - 1;
    if (hi < 1) return 0;
    if (t <= pulses[0]) return 60 / (pulses[1] - pulses[0]);
    if (t >= pulses[hi]) return 60 / (pulses[hi] - pulses[hi - 1]);
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pulses[mid] <= t) lo = mid;
      else hi = mid;
    }
    return 60 / (pulses[hi] - pulses[lo]);
  };
  for (let w = 0; w < total; w += step) {
    const i0 = w * nfft;
    const seg = new Float64Array(nfft);
    let m = 0;
    for (let i = 0; i < nfft; i++) m += x[i0 + i];
    m /= nfft;
    for (let i = 0; i < nfft; i++) seg[i] = x[i0 + i] - m;
    const sp = singleSidedSpectrum({ fs, x: seg }, { window: 'hann' });
    const t = (i0 + nfft / 2) / fs;
    rows.push({ rpm: rpmAt(t), t, amp: sp.amplitude.slice(0, kEnd + 1) });
  }
  rows.sort((a, b) => a.rpm - b.rpm);
  const freq = Float64Array.from({ length: kEnd + 1 }, (_, k) => (k * fs) / nfft);
  return { freq, rows };
}
