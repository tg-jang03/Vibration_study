/**
 * 측정 체인 함정 모델 (P3-4, LAB-CHAIN-01). 순수 함수, 내부 단위는 SI (가속도 m/s², 속도 m/s, 전압 V).
 * 예시 기계: 인버터로 도는 펌프 2970 rpm (1X 49.5 Hz, 날개 7개 → 346.5 Hz). IEPE 가속도계로 재고,
 * 분석기는 F_max 5 kHz(f_s 12.8 kHz), Hann, 16384점 × 4회 파워 평균. 속도 스펙트럼은 가속도 스펙트럼을 2πf로 나눠 만든다.
 * 사례마다 측정 체인의 함정 하나를 넣고, 확인 동작을 하면 그 함정이 사라지는지(또는 그대로인지)를 본다.
 * 모든 크기·주파수는 설명용 예시값이다 (I-025). 난수는 시드 고정 (D-011).
 */
import { averagePower } from './dsp/average';
import { createRng } from './dsp/random';
import { bandRms, scaledSpectrum } from './dsp/scaling';
import { fft, zeroPad } from './dsp/fft';
import { MOUNTS, type MountKind } from './sensor';

export const G = 9.80665;

/** 분석기 설정 (예시) */
export const ANALYZER = { fs: 12800, n: 16384, averages: 4 } as const;

/** 예시 기계: 회전수, 날개 수, 차수별 속도 [m/s rms], 가속도 바닥 잡음 [g rms] */
export const MACHINE = {
  rpm: 2970,
  altRpm: 2400,
  vanes: 7,
  lines: [
    { order: 1, v: 1.8e-3 },
    { order: 2, v: 0.6e-3 },
    { order: 3, v: 0.25e-3 },
    { order: 7, v: 0.9e-3 },
  ],
  /** 불평형이 커진 사례의 1X [m/s rms] */
  unbalanceV: 7.5e-3,
  floorG: 0.01,
} as const;

/** IEPE 바이어스 전압 예시 [V]: 정상, 끊김(공급 전압 쪽), 합선 */
export const BIAS = { normal: 11.6, open: 23.8, short: 0.3 } as const;

/** 입력 레인지 [g pk]: 정상 설정, 너무 작게 잡은 설정 */
export const RANGE = { normal: 2.5, tooSmall: 0.25 } as const;

/** 그라운드 루프가 만드는 전원 주파수(60 Hz)와 홀수배 [Hz, g pk] — 홀수배가 오히려 큰 경우가 흔하다 (예시) */
export const GROUND_LOOP = [
  { f: 60, g: 0.03 },
  { f: 180, g: 0.05 },
  { f: 300, g: 0.07 },
] as const;

export type ChainCase = 'normal' | 'machine' | 'mount' | 'skiSlope' | 'groundLoop' | 'openCable' | 'cable' | 'clipping';
export type ChainCheck = 'none' | 'stud' | 'rpm' | 'isolate' | 'wait' | 'tieCable' | 'range';

/** 사례별: 그 함정을 없애는 확인 동작 (machine·normal은 없음) */
export const FIX: Record<ChainCase, ChainCheck | null> = {
  normal: null,
  machine: null,
  mount: 'stud',
  skiSlope: 'wait',
  groundLoop: 'isolate',
  openCable: 'tieCable',
  cable: 'tieCable',
  clipping: 'range',
};

export interface ChainOptions {
  fs?: number;
  n?: number;
  averages?: number;
  /** 가속도계 설치를 직접 정한다 (그림용). 정하지 않으면 사례가 정한다: mount 사례는 손으로 대기, 나머지는 스터드 */
  mount?: MountKind;
  /** 보여 줄 시간파형 길이 [s] (기본 0.2) */
  displaySeconds?: number;
  seed?: number;
}

export interface ChainResult {
  kind: ChainCase;
  check: ChainCheck;
  rpm: number;
  fs: number;
  df: number;
  enbw: number;
  /** 시간파형 (처음 displaySeconds) [s], 가속도 [m/s²] */
  t: Float64Array;
  wave: Float64Array;
  freq: Float64Array;
  /** 가속도 파워 스펙트럼 [(m/s²)²] (rms², Hann, 평균) */
  accelPower: Float64Array;
  /** 속도 파워 스펙트럼 [(m/s)²] = 가속도 파워 ÷ (2πf)² (0 Hz는 0) */
  velPower: Float64Array;
  /** 1X 속도 [m/s rms] (1X ± 4 bin 대역 RMS) */
  oneX: number;
  /** 전체 속도 [m/s rms] (2 ~ 1000 Hz 대역 RMS) */
  overall: number;
  bias: number;
  /** 입력 레인지 [g pk], 넘침 여부 */
  range: number;
  overload: boolean;
}

/**
 * 가속도계 설치 응답을 신호에 입힌다 (P3-1의 H(r) = 1/(1 − r² + j2ζr), r = f/f_n, 정확한 아날로그 응답).
 * 0을 채운 FFT → bin마다 H를 곱함 → 역 FFT. 설치 공진의 울림은 1/(ζω_n) 정도로 짧아 앞부분 몇 ms에만 영향이 있다
 * (measureChain은 앞 0.1 s를 버린다). 입력을 바꾸지 않는다.
 */
export function applyMountResponse(x: ArrayLike<number>, fs: number, fn: number, zeta: number): Float64Array {
  if (!(fn > 0) || !(zeta > 0) || x.length < 1) throw new RangeError('fn > 0, ζ > 0, 빈 입력 불가');
  let size = 1;
  while (size < x.length) size *= 2;
  const X = fft(zeroPad(x, size));
  for (let k = 0; k < size; k++) {
    const fk = (k <= size / 2 ? k : k - size) * (fs / size);
    const r = Math.abs(fk) / fn;
    // H = 1/(a + jb), 음의 주파수는 켤레
    const a = 1 - r * r;
    const b = 2 * zeta * r * Math.sign(fk);
    const d = a * a + b * b;
    const hr = a / d;
    const hi = -b / d;
    const re = X.real[k] * hr - X.imag[k] * hi;
    const im = X.real[k] * hi + X.imag[k] * hr;
    X.real[k] = re;
    X.imag[k] = -im; // 역 FFT = conj(FFT(conj(X))) / N
  }
  const y = fft(X.real, X.imag);
  return Float64Array.from({ length: x.length }, (_, i) => y.real[i] / size);
}

/** 진폭 A인 정현파를 ±L에서 자를 때 기본파 진폭 (2A/π)(α + sinα cosα), α = asin(L/A). L ≥ A면 A */
export function clippedFundamental(amp: number, level: number): number {
  if (level >= amp) return amp;
  const a = Math.asin(level / amp);
  return ((2 * amp) / Math.PI) * (a + Math.sin(a) * Math.cos(a));
}

/** 가속도 파워 → 속도 파워: ÷ (2πf)². 0 Hz는 0 (적분하면 DC를 정할 수 없다) */
export function accelToVelocityPower(accelPower: ArrayLike<number>, freq: ArrayLike<number>): Float64Array {
  return Float64Array.from(accelPower, (p, k) => (freq[k] > 0 ? p / (2 * Math.PI * freq[k]) ** 2 : 0));
}

const WARMUP_S = 0.1;

export function measureChain(kind: ChainCase, check: ChainCheck = 'none', opts: ChainOptions = {}): ChainResult {
  const fs = opts.fs ?? ANALYZER.fs;
  const n = opts.n ?? ANALYZER.n;
  const avg = opts.averages ?? ANALYZER.averages;
  const seed = opts.seed ?? 24;
  const warm = Math.round(WARMUP_S * fs);
  const total = warm + n * avg;
  const rpm = check === 'rpm' ? MACHINE.altRpm : MACHINE.rpm;
  const fr = rpm / 60;
  const rng = createRng(seed);

  // 1) 기계 표면의 가속도: 차수 성분 + 넓은 대역 바닥 잡음
  const mech = new Float64Array(total);
  const lines = MACHINE.lines.map((l) => ({
    f: l.order * fr,
    v: kind === 'machine' && l.order === 1 ? MACHINE.unbalanceV * (rpm / MACHINE.rpm) ** 2 : l.v,
    ph: 0.7 * l.order + 0.3,
  }));
  for (let i = 0; i < total; i++) {
    const t = (i - warm) / fs;
    let a = MACHINE.floorG * G * rng.normal();
    for (const l of lines) a += 2 * Math.PI * l.f * l.v * Math.SQRT2 * Math.cos(2 * Math.PI * l.f * t + l.ph);
    mech[i] = a;
  }

  // 2) 설치: 가속도계와 표면 사이가 무르면 설치 공진이 대역 안으로 내려온다
  const mount: MountKind = opts.mount ?? (kind === 'mount' && check !== 'stud' ? 'hand' : 'stud');
  const m = MOUNTS[mount];
  let x = applyMountResponse(mech, fs, m.fn, m.zeta);

  // 3) 센서·케이블·전원·입력에서 더해지는 것
  const rngB = createRng(seed + 101);
  if (kind === 'skiSlope' && check !== 'wait') {
    // 켠 직후·열 변화로 생긴 아주 낮은 주파수의 흔들림 (3 Hz 1차 저역통과한 잡음, 0.025 g rms)
    const beta = 1 - Math.exp((-2 * Math.PI * 3) / fs);
    const lf = new Float64Array(total);
    let y = 0;
    for (let i = 0; i < total; i++) {
      y += beta * (rngB.normal() - y);
      lf[i] = y;
    }
    let ss = 0;
    for (let i = warm; i < total; i++) ss += lf[i] * lf[i];
    const scale = (0.025 * G) / Math.sqrt(ss / (total - warm));
    x = Float64Array.from(x, (v, i) => v + lf[i] * scale);
  }
  if (kind === 'groundLoop' && check !== 'isolate') {
    x = Float64Array.from(x, (v, i) => {
      const t = (i - warm) / fs;
      let e = 0;
      GROUND_LOOP.forEach((c, j) => (e += c.g * G * Math.cos(2 * Math.PI * c.f * t + 0.4 + j)));
      return v + e;
    });
  }
  if (kind === 'cable' && check !== 'tieCable') {
    // 흔들리는 케이블·느슨한 커넥터: 가끔 튀는 펄스(±0.9 g, 1 ms)와 낮은 주파수 덩어리 (초당 약 2번, 첫 번째는 0.07 s)
    const events: { t0: number; amp: number; f: number; spike: number }[] = [{ t0: 0.07, amp: 0.3, f: 11, spike: 0.9 }];
    for (let t0 = 0.4; t0 < total / fs; t0 += 0.25 + 0.5 * rngB.uniform()) {
      events.push({ t0, amp: 0.12 + 0.2 * rngB.uniform(), f: 7 + 8 * rngB.uniform(), spike: rngB.uniform() < 0.5 ? -0.9 : 0.9 });
    }
    x = Float64Array.from(x, (v, i) => {
      const t = (i - warm) / fs;
      let e = 0;
      for (const ev of events) {
        const d = t - ev.t0;
        if (d < 0 || d > 0.4) continue;
        e += G * (ev.amp * Math.exp(-d / 0.06) * Math.sin(2 * Math.PI * ev.f * d) + (d < 0.001 ? ev.spike : 0));
      }
      return v + e;
    });
  }
  let bias: number = BIAS.normal;
  if (kind === 'openCable' && check !== 'tieCable') {
    // 커넥터가 빠져 센서 전류가 흐르지 않는다: 기계 신호는 없고 전자 잡음만, 바이어스는 공급 전압 쪽
    x = Float64Array.from(x, () => 0.0004 * G * rngB.normal());
    bias = BIAS.open;
  }
  const range = kind === 'clipping' && check !== 'range' ? RANGE.tooSmall : RANGE.normal;
  const lim = range * G;
  let overload = false;
  x = Float64Array.from(x, (v) => {
    if (Math.abs(v) >= lim) {
      overload = true;
      return Math.sign(v) * lim;
    }
    return v;
  });

  // 4) 분석: Hann, 겹침 없이 avg번 파워 평균, 속도는 2πf로 나눈다
  const frames: Float64Array[] = [];
  let enbw = 1.5;
  let freq: Float64Array<ArrayBufferLike> = new Float64Array(0);
  for (let k = 0; k < avg; k++) {
    const s = scaledSpectrum({ fs, x: x.subarray(warm + k * n, warm + (k + 1) * n) }, { window: 'hann' });
    frames.push(s.power);
    enbw = s.enbw;
    freq = s.frequency;
  }
  const accelPower = averagePower(frames, 'linear');
  const velPower = accelToVelocityPower(accelPower, freq);
  const df = fs / n;
  const k1 = Math.round(fr / df);
  const oneX = bandRms(velPower, enbw, Math.max(1, k1 - 4), k1 + 4);
  const overall = bandRms(velPower, enbw, Math.ceil(2 / df), Math.min(velPower.length - 1, Math.floor(1000 / df)));
  const nd = Math.round((opts.displaySeconds ?? 0.2) * fs);
  const t = Float64Array.from({ length: nd }, (_, i) => i / fs);
  const wave = x.slice(warm, warm + nd);
  return { kind, check, rpm, fs, df, enbw, t, wave, freq, accelPower, velPower, oneX, overall, bias, range, overload };
}

/** 그림·랩용: 스펙트럼을 묶음마다 최댓값으로 줄인다 (봉우리를 잃지 않게). 0 Hz bin은 건너뛴다 */
export function decimateMax(freq: ArrayLike<number>, y: ArrayLike<number>, group: number, fMax = Infinity): { f: number[]; y: number[] } {
  const f: number[] = [];
  const out: number[] = [];
  for (let k = 1; k < y.length && freq[k] <= fMax; k += group) {
    let best = k;
    for (let j = k; j < Math.min(k + group, y.length); j++) if (y[j] > y[best]) best = j;
    f.push(freq[best]);
    out.push(y[best]);
  }
  return { f, y: out };
}
