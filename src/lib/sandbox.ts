/**
 * Signal Lab 샌드박스 엔진 (LAB-SBX-01, P1-8). 그림(src/figures/p1-8.ts)과 랩이 같이 쓴다.
 * 기계 신호(속도 [m/s])를 만들고, 측정 설정(F_max·LOR·윈도우·AAF·평균)대로 스펙트럼을 계산한 뒤
 * 성분마다 "지금 설정으로 보이는가"를 판정한다. 표시 단위 변환(mm/s)은 UI에서 한다 (D-012).
 */
import { averagePower, frameLayout, splitOverlappingFrames } from './dsp/average';
import { acquire, butterworthGain } from './dsp/sampling';
import type { SignalComponent } from './dsp/signal';
import { singleSidedSpectrum } from './dsp/spectrum';
import { createWindow, type WindowType } from './dsp/window';

export type SandboxWindow = 'uniform' | 'hann' | 'flatTop' | 'blackmanHarris';
export type SandboxAverage = 'none' | 'linear' | 'peakHold';

/** 기계의 구성 — 크기는 속도 Peak [m/s] */
export interface Machine {
  rpm: number;
  x1: number;
  x2: number;
  x3: number;
  /** 0.45X 성분 (1X보다 낮은 성분, 유막 베어링 불안정의 표시 — Part 6) */
  sub: number;
  /** 기어 맞물림 (축 A 이빨 15개 → 15X) */
  gear: number;
  /** 맞물림 크기를 축 B(이빨 60개 → 1X/4)가 흔드는 정도 m */
  gearM: number;
  /** 구름베어링형 충격 (반복 3.26X, 울림 3 kHz) */
  bearing: number;
  /** 백색 잡음 단일측 PSD [(m/s)²/Hz] — F_max를 바꿔도 같다 */
  noisePsd: number;
}

export const MACHINE_CONST = {
  teethA: 15,
  teethB: 60,
  subOrder: 0.45,
  bearingOrder: 3.26,
  ringFreq: 3000,
  ringDecay: 0.0005,
  seed: 20261006,
};

export const DEFAULT_MACHINE: Machine = {
  rpm: 3000,
  x1: 0.004,
  x2: 0.0012,
  x3: 0.0005,
  sub: 0.0003,
  gear: 0.0008,
  gearM: 0.3,
  bearing: 0.002,
  noisePsd: 5.3e-11,
};

export interface Settings {
  fmax: number;
  lor: number;
  window: SandboxWindow;
  aaf: boolean;
  average: SandboxAverage;
  count: number;
  overlap: number;
}

export const FMAX_OPTIONS = [200, 500, 1000, 2000, 5000];
export const LOR_OPTIONS = [100, 200, 400, 800, 1600, 3200, 6400];
/** 두 막대를 가르는 데 필요한 최소 간격 [bin] (P1-3: 없음 2, Hann 3.5, Flat top 8. Blackman-Harris는 메인로브 ±4 bin) */
export const MIN_SEPARATION: Record<SandboxWindow, number> = { uniform: 2, hann: 3.5, flatTop: 8, blackmanHarris: 7 };
/** "보인다"로 볼 최소 높이: 주변 바닥보다 6 dB(2배) */
export const VISIBLE_MARGIN_DB = 6;

export const DEFAULT_SETTINGS: Settings = { fmax: 2000, lor: 400, window: 'hann', aaf: true, average: 'linear', count: 4, overlap: 0 };

/** 기계의 성분 목록. AAF를 켜면 성분마다 Butterworth 8차(차단 F_max) 이득을 곱한다 */
export function machineComponents(m: Machine, s: Pick<Settings, 'fmax' | 'aaf'>): SignalComponent[] {
  const f1 = m.rpm / 60;
  const fs = 2.56 * s.fmax;
  const g = (f: number) => (s.aaf ? butterworthGain(f, s.fmax, 8) : 1);
  const C = MACHINE_CONST;
  const list: SignalComponent[] = [];
  if (m.x1 > 0) list.push({ type: 'sine', freq: f1, amp: m.x1 * g(f1), phase: 0.3 });
  if (m.x2 > 0) list.push({ type: 'sine', freq: 2 * f1, amp: m.x2 * g(2 * f1), phase: 1.1 });
  if (m.x3 > 0) list.push({ type: 'sine', freq: 3 * f1, amp: m.x3 * g(3 * f1), phase: 2.0 });
  if (m.sub > 0) list.push({ type: 'sine', freq: C.subOrder * f1, amp: m.sub * g(C.subOrder * f1), phase: 0.7 });
  if (m.gear > 0) {
    const mesh = C.teethA * f1;
    list.push({ type: 'modulated', carrier: mesh, amp: m.gear * g(mesh), modFreq: (f1 * C.teethA) / C.teethB, am: m.gearM, phase: 0.2 });
  }
  if (m.bearing > 0) {
    list.push({ type: 'impulses', rate: C.bearingOrder * f1, amp: m.bearing * g(C.ringFreq), ringFreq: C.ringFreq, decay: C.ringDecay, offset: 0.0013 });
  }
  if (m.noisePsd > 0) list.push({ type: 'noise', rms: Math.sqrt((m.noisePsd * fs) / 2), seed: C.seed });
  return list;
}

export type ItemStatus = 'visible' | 'merged' | 'buried' | 'outside' | 'aliased';
export const STATUS_LABEL: Record<ItemStatus, string> = {
  visible: '보임',
  merged: '이웃과 붙음',
  buried: '바닥에 묻힘',
  outside: 'F_max 밖',
  aliased: '접혀 들어옴',
};

export interface Item {
  key: string;
  label: string;
  /** 성분 주파수 [Hz] (대역이면 가운데) */
  freq: number;
  band?: boolean;
  status: ItemStatus;
  /** 스펙트럼에서 읽은 RMS [m/s] (보기 범위 밖이면 NaN) */
  value: number;
  /** 주변 바닥보다 몇 dB */
  marginDb: number;
  /** 가장 가까운 이웃 성분까지 [bin] */
  neighborBins: number;
  /** 접혀 들어온 자리 [Hz] */
  aliasAt?: number;
}

export interface SandboxResult {
  fs: number;
  n: number;
  df: number;
  /** 프레임 하나의 측정 시간 [s] */
  frameTime: number;
  /** 평균까지 포함한 총 측정 시간 [s] */
  totalTime: number;
  frequency: Float64Array;
  /** 평균한 스펙트럼, RMS [m/s] */
  rms: Float64Array;
  items: Item[];
}

const median = (v: number[]) => {
  if (v.length === 0) return NaN;
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const alias = (f: number, fs: number) => Math.abs(f - Math.round(f / fs) * fs);

/** 판정할 성분 목록 (켜진 것만) */
export function itemTargets(m: Machine): { key: string; label: string; freq: number; band?: boolean }[] {
  const f1 = m.rpm / 60;
  const C = MACHINE_CONST;
  const mesh = C.teethA * f1;
  const fb = (f1 * C.teethA) / C.teethB;
  const t: { key: string; label: string; freq: number; band?: boolean }[] = [];
  if (m.x1 > 0) t.push({ key: '1x', label: '1X', freq: f1 });
  if (m.x2 > 0) t.push({ key: '2x', label: '2X', freq: 2 * f1 });
  if (m.x3 > 0) t.push({ key: '3x', label: '3X', freq: 3 * f1 });
  if (m.sub > 0) t.push({ key: 'sub', label: '0.45X', freq: C.subOrder * f1 });
  if (m.gear > 0) {
    t.push({ key: 'mesh', label: '기어 맞물림 (15X)', freq: mesh });
    if (m.gearM > 0) {
      t.push({ key: 'sbLow', label: '측대역 (맞물림 − 축 B)', freq: mesh - fb });
      t.push({ key: 'sbHigh', label: '측대역 (맞물림 + 축 B)', freq: mesh + fb });
    }
  }
  if (m.bearing > 0) t.push({ key: 'ring', label: '충격의 울림 (3 kHz 대역)', freq: C.ringFreq, band: true });
  return t;
}

/** 설정대로 재고 평균한 스펙트럼과 성분별 판정 */
export function runSandbox(m: Machine, s: Settings): SandboxResult {
  const fs = 2.56 * s.fmax;
  const n = Math.round(2.56 * s.lor);
  const count = s.average === 'none' ? 1 : Math.max(1, Math.round(s.count));
  const overlap = count > 1 ? s.overlap : 0;
  const layout = frameLayout(n, count, overlap);
  const x = acquire({ components: machineComponents(m, s) }, { fs, n: layout.totalSamples }).x;
  const w = createWindow(s.window as WindowType, n);
  const frames = splitOverlappingFrames(x, n, overlap).frames.slice(0, count);
  let frequency: Float64Array = new Float64Array(0);
  const powers = frames.map((frame) => {
    const sp = singleSidedSpectrum({ fs, x: frame }, { window: w });
    frequency = sp.frequency;
    const last = sp.amplitude.length - 1;
    return sp.amplitude.map((a, k) => (k === 0 || k === last ? a * a : (a * a) / 2));
  });
  const pow = averagePower(powers, s.average === 'peakHold' ? 'peakHold' : 'linear');
  const rms = pow.map((p) => Math.sqrt(p));
  const df = fs / n;
  const kMax = Math.round(s.fmax / df);
  const targets = itemTargets(m);
  const lineFreqs = targets.filter((t) => !t.band).map((t) => t.freq);
  const near = (k: number) => {
    let best = 0;
    for (let j = Math.max(0, k - 2); j <= Math.min(kMax, k + 2); j++) best = Math.max(best, rms[j]);
    return best;
  };
  const items: Item[] = targets.map((t) => {
    const others = lineFreqs.filter((f) => Math.abs(f - t.freq) > 1e-9);
    const neighborBins = t.band ? Infinity : Math.min(Infinity, ...others.map((f) => Math.abs(f - t.freq) / df));
    if (t.freq > s.fmax) {
      const a = alias(t.freq, fs);
      if (!s.aaf && a <= s.fmax) {
        const k = Math.round(a / df);
        return { ...t, status: 'aliased' as const, value: near(k), marginDb: NaN, neighborBins, aliasAt: a };
      }
      return { ...t, status: 'outside' as const, value: NaN, marginDb: NaN, neighborBins };
    }
    const k = Math.round(t.freq / df);
    let value: number;
    const floorVals: number[] = [];
    if (t.band) {
      const lo = Math.round((t.freq - 300) / df);
      const hi = Math.min(kMax, Math.round((t.freq + 300) / df));
      value = 0;
      for (let j = lo; j <= hi; j++) value = Math.max(value, rms[j]);
      for (const [a, b] of [[t.freq - 1200, t.freq - 700], [t.freq + 700, t.freq + 1200]]) {
        for (let j = Math.max(1, Math.round(a / df)); j <= Math.min(kMax, Math.round(b / df)); j++) floorVals.push(rms[j]);
      }
    } else {
      value = near(k);
      const span = 60;
      for (let j = Math.max(1, k - span); j <= Math.min(kMax, k + span); j++) {
        const fj = j * df;
        if (Math.abs(j - k) <= 6) continue;
        if (lineFreqs.some((f) => Math.abs(f - fj) <= 6 * df)) continue;
        floorVals.push(rms[j]);
      }
    }
    const floor = median(floorVals);
    const marginDb = floor > 0 ? 20 * Math.log10(value / floor) : Infinity;
    let status: ItemStatus = 'visible';
    if (!t.band && neighborBins < MIN_SEPARATION[s.window]) status = 'merged';
    else if (!(marginDb >= VISIBLE_MARGIN_DB)) status = 'buried';
    return { ...t, status, value, marginDb, neighborBins };
  });
  return {
    fs,
    n,
    df,
    frameTime: n / fs,
    totalTime: layout.totalSamples / fs,
    frequency,
    rms,
    items,
  };
}

export type Purpose = 'general' | 'balance' | 'sub' | 'gear' | 'bearing';
export interface Recipe {
  label: string;
  settings: Settings;
  /** 이 목적에서 꼭 보여야 하는 성분 */
  targets: string[];
  /** 단계별 이유 (예시값 — 출처 대조 전, I-014) */
  reasons: string[];
  /** 표시 권장 */
  peak?: boolean;
  db?: boolean;
}

/** 목적별 출발점 설정 — 3000 rpm(1X 50 Hz) 기계 기준 예시값 (I-014: 출처 대조 전) */
export const RECIPES: Record<Purpose, Recipe> = {
  general: {
    label: '일반 상태 점검',
    settings: { fmax: 2000, lor: 1600, window: 'hann', aaf: true, average: 'linear', count: 8, overlap: 0.5 },
    targets: ['1x', '2x', '3x', 'sub', 'mesh', 'sbLow', 'sbHigh'],
    reasons: [
      'F_max 2000 Hz (1X의 40배): 하모닉과 기어 맞물림(750 Hz)까지 한 화면에 들어온다',
      '1600 라인 → Δf 1.25 Hz, T 0.8 s: 측대역 간격 12.5 Hz를 10 bin으로 가르면서도 측정이 짧다',
      'Hann: 성분을 가르는 힘과 누설 사이의 무난한 기본값 (P1-4)',
      '파워 평균 8회 · 오버랩 50 %: 바닥의 흔들림을 줄이고 총 3.6 s (P1-5)',
    ],
  },
  balance: {
    label: '밸런싱 전 1X 측정',
    settings: { fmax: 500, lor: 400, window: 'flatTop', aaf: true, average: 'linear', count: 4, overlap: 0 },
    targets: ['1x'],
    peak: true,
    reasons: [
      'F_max 500 Hz (1X의 10배): 1X와 낮은 하모닉만 보면 된다',
      '400 라인 → Δf 1.25 Hz: 1X 하나를 읽는 데는 충분하다',
      'Flat top: 회전수가 bin 사이에 와도 진폭 오차 0.01 dB 미만 (P1-4). 대신 이웃과는 8 bin 이상 떨어져야 한다',
      '평균 4회. 위상까지 평균하려면 회전 표식 센서(키페이저)로 트리거한 벡터 평균 (P1-5, P2-3)',
    ],
  },
  sub: {
    label: '0.4 ~ 0.5X 성분 확인',
    settings: { fmax: 200, lor: 800, window: 'hann', aaf: true, average: 'linear', count: 4, overlap: 0.5 },
    targets: ['sub', '1x'],
    reasons: [
      'F_max 200 Hz (1X의 4배): 1X 아래쪽을 자세히 본다',
      '800 라인 → Δf 0.25 Hz, T 4 s: 0.45X(22.5 Hz)가 0.4 ~ 0.5X 사이 어디인지 0.25 Hz 단위로 읽는다',
      'T가 4 s로 길다 → 그동안 회전수가 일정해야 한다 (P1-3 스미어링)',
      'Hann · 파워 평균 4회 · 오버랩 50 %',
    ],
  },
  gear: {
    label: '기어 측대역',
    settings: { fmax: 5000, lor: 3200, window: 'hann', aaf: true, average: 'linear', count: 8, overlap: 0.5 },
    targets: ['mesh', 'sbLow', 'sbHigh'],
    db: true,
    reasons: [
      'F_max 5000 Hz: 맞물림 750 Hz의 3배(2250 Hz) 이상을 본다',
      '3200 라인 → Δf 1.56 Hz: 측대역 간격 12.5 Hz를 8 bin으로 가른다 (P1-7)',
      'dB로 본다: 측대역은 맞물림보다 16 dB 이상 낮다 (P1-6)',
      '파워 평균 8회 · 오버랩 50 %. 한 축만 골라 보려면 TSA (P1-5)',
    ],
  },
  bearing: {
    label: '구름베어링 충격',
    settings: { fmax: 5000, lor: 1600, window: 'hann', aaf: true, average: 'linear', count: 8, overlap: 0.5 },
    targets: ['ring'],
    db: true,
    reasons: [
      'F_max 5000 Hz: 충격이 울리는 높은 주파수(3 kHz 근처)가 들어와야 한다',
      '1600 라인 → Δf 3.1 Hz: 넓게 퍼진 울림 대역을 보는 데는 충분하다',
      'dB로 본다: 울림 대역의 막대는 작다',
      '충격이 몇 번 되풀이되는지(반복 주파수)는 엔벨로프 분석으로 따로 본다 (P3-7)',
    ],
  },
};
