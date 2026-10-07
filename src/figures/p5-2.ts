/**
 * P5-2 "STFT · 스펙트로그램 · 워터폴" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호는 랩(LAB-STFT-01)과 같은 `lib/stftDemo.ts`(600 → 3600 rpm 기동 40초 + 20초 유지), STFT는 `lib/dsp/stft.ts`.
 */
import type { FigAnnotation, FigHeatmap, FigSeries, FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { bestFrameSeconds, stft, type Stft } from '../lib/dsp/stft';
import { CRIT_HZ, LOCK_RPM, LOCK_TIME, RAMP_RATE, RUN, rpmAt, runSignal } from '../lib/stftDemo';

const fmt = formatNumber;
const um = 1e6;
const db = (v: number) => 20 * Math.log10(Math.max(v * um, 1e-3)); // dB re 1 µm
const SIG = runSignal();
const Z_RANGE: [number, number] = [-6, 34];

/** STFT 결과를 색 지도로 (x = 주파수, y = 시각) */
function heat(S: Stft, fMax: number, tMax: number = RUN.seconds, legend?: string): FigHeatmap {
  const kMax = Math.min(S.freqs.length - 1, Math.floor(fMax / S.df));
  const dt = S.hop / RUN.fs;
  const rows = S.times.filter((tm) => tm - dt / 2 < tMax).length;
  const x = Array.from({ length: kMax + 2 }, (_, k) => Math.max(0, (k - 0.5) * S.df));
  const y = Array.from({ length: rows + 1 }, (_, m) => (m === 0 ? Math.max(0, S.times[0] - dt / 2) : Math.min(tMax, S.times[m - 1] + dt / 2)));
  const z = S.amp.slice(0, rows).map((row) => Array.from(row.slice(0, kMax + 1), db));
  return { x, y, z, zRange: Z_RANGE, levels: 10, color: 'c1', legend };
}
const nearest = (S: Stft, t: number) => {
  let m = 0;
  for (let j = 1; j < S.times.length; j++) if (Math.abs(S.times[j] - t) < Math.abs(S.times[m] - t)) m = j;
  return m;
};
const peakNear = (S: Stft, m: number, f: number, span = 3) => {
  let v = 0;
  for (let k = Math.max(0, Math.round((f - span) / S.df)); k <= Math.min(S.freqs.length - 1, Math.round((f + span) / S.df)); k++) v = Math.max(v, S.amp[m][k]);
  return v * um;
};

const S512 = stft(SIG.x, RUN.fs, { n: 512, overlap: 0.5, fMax: 130 });

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p5-2.test.ts`) */
export const P52_VALUES = (() => {
  const m = (t: number) => nearest(S512, t);
  const tradeoff = [128, 512, 4096].map((n) => {
    const S = stft(SIG.x, RUN.fs, { n, overlap: 0.75, fMax: 130 });
    const j = nearest(S, 20);
    const f1 = rpmAt(S.times[j]) / 60;
    const row = S.amp[j];
    let k = Math.round(f1 / S.df);
    for (let q = Math.max(0, k - Math.round(6 / S.df)); q <= Math.min(row.length - 1, k + Math.round(6 / S.df)); q++) if (row[q] > row[k]) k = q;
    let lo = k;
    let hi = k;
    while (lo > 0 && row[lo] > row[k] / 2) lo--;
    while (hi < row.length - 1 && row[hi] > row[k] / 2) hi++;
    return { n, T: S.frameSeconds, df: S.df, move: RAMP_RATE * S.frameSeconds, peak: row[k] * um, width: (hi - lo) * S.df };
  });
  return {
    rate: RAMP_RATE,
    best: bestFrameSeconds(RAMP_RATE),
    best2: bestFrameSeconds(2 * RAMP_RATE),
    lockRpm: LOCK_RPM,
    lockTime: LOCK_TIME,
    x1Crit: peakNear(S512, m(12), CRIT_HZ),
    x1Op: peakNear(S512, m(50), 60),
    x2Res: peakNear(S512, m(30), 95),
    whirl30: peakNear(S512, m(30), 0.45 * (rpmAt(30) / 60)),
    whip55: peakNear(S512, m(55), CRIT_HZ),
    whip42: peakNear(S512, m(42), CRIT_HZ),
    struct5: peakNear(S512, m(5), RUN.structHz, 1),
    tradeoff,
  };
})();
const V = P52_VALUES;

// ── 그림 1: 짧은 프레임을 밀면서 FFT ──
const env = (() => {
  const step = RUN.fs / 10;
  const t: number[] = [];
  const y: number[] = [];
  for (let i = 0; i + step <= SIG.x.length; i += step) {
    let lo = Infinity;
    let hi = -Infinity;
    for (let j = i; j < i + step; j++) {
      lo = Math.min(lo, SIG.x[j]);
      hi = Math.max(hi, SIG.x[j]);
    }
    t.push(i / RUN.fs, i / RUN.fs);
    y.push(lo * um, hi * um);
  }
  return { t, y };
})();
const PICK = [10, 30, 50];
const frameSpec = (t: number) => {
  const m = nearest(S512, t);
  return { f: Array.from(S512.freqs), y: Array.from(S512.amp[m], (v) => v * um), t: S512.times[m], rpm: rpmAt(S512.times[m]) };
};
const FR = PICK.map(frameSpec);
const FRC = ['c1', 'c2', 'c3'] as const;

export const stftIdea: FigureSpec = {
  id: 'fig-p5-2-1',
  caption: `그림 1. 예시 기동(600 → 3600 rpm을 40초에 올린 뒤 20초 유지)의 축 변위 파형(맨 위)에서 1초짜리 프레임을 떼어 FFT한 스펙트럼 세 장. 10 s(1350 rpm)에는 1X가 22.5 Hz에, 30 s(2850 rpm)에는 47.5 Hz에, 50 s(3600 rpm)에는 60 Hz에 선다. 1X 아래에 생긴 막대(30 s의 21 Hz, 50 s의 25 Hz)는 2절에서 다룬다. 이렇게 프레임을 조금씩 밀며 FFT를 되풀이하는 것이 STFT다.`,
  panels: [
    {
      title: '축 변위 파형 (프레임 세 곳 표시)',
      series: [{ x: env.t, y: env.y, color: 'muted', width: 0.8 }],
      annotations: PICK.map((t, i): FigAnnotation => ({ type: 'band', x1: t - 0.5, x2: t + 0.5, color: FRC[i], label: `${t} s` })),
      x: { range: [0, 60], ticks: [0, 10, 20, 30, 40, 50, 60], label: '시간 [s]' },
      y: { range: [-45, 45], ticks: [-40, 0, 40], label: '[µm]' },
      height: 120,
    },
    ...FR.map((fr, i) => ({
      title: `${PICK[i]} s 프레임 (${fmt(fr.rpm, 4)} rpm, 1X = ${fmt(fr.rpm / 60, 3)} Hz)`,
      series: [{ x: fr.f, y: fr.y, color: FRC[i], width: 1.8 } as FigSeries],
      annotations: [{ type: 'vline', x: fr.rpm / 60, color: 'muted', dash: true, label: '1X' } as FigAnnotation],
      x: { range: [0, 130] as [number, number], ticks: [0, 25, 50, 75, 95, 120], ...(i === 2 ? { label: '주파수 [Hz]' } : {}) },
      y: { range: [0, i === 0 ? 40 : 16] as [number, number], ticks: i === 0 ? [0, 20, 40] : [0, 8, 16], label: '[µm pk]' },
      height: 80,
    })),
  ],
};

// ── 그림 2: 스펙트로그램 ──
const lbl = (x: number, y: number, text: string, color: 'c2' | 'warn' | 'text' = 'c2', anchor: 'start' | 'middle' | 'end' = 'start'): FigAnnotation => ({ type: 'text', x, y, text, color, anchor, bold: true });

export const spectrogram: FigureSpec = {
  id: 'fig-p5-2-2',
  caption: `그림 2. 같은 기동의 스펙트로그램: 프레임마다의 스펙트럼을 시각 높이에 놓고 크기를 색의 진하기로 칠한 지도(N = 512, T = 1 s, 겹침 50 %). 가로가 주파수, 세로가 시간이다. 1X·2X는 회전수를 따라 비스듬히 올라가고, 1X는 임계속도(1500 rpm, 12 s 근처)에서 가장 진하다(${fmt(V.x1Crit, 3)} µm). 95 Hz 구조 공진은 세로줄로 늘 제자리이고, 2X가 그 위를 지나는 30 s(2850 rpm)에 2X가 ${fmt(V.x2Res, 3)} µm로 커진다. 2400 rpm(24 s)부터 1X 아래에 0.45X 줄이 생겨 비스듬히 따라가다가 ${fmt(V.lockTime, 3)} s(${fmt(V.lockRpm, 4)} rpm)에 25 Hz에서 세로로 꺾여 멈춘다.`,
  panels: [
    {
      title: 'N = 512, T = 1 s, 겹침 50 %',
      series: [],
      heatmap: heat(S512, 130, RUN.seconds, '진폭 (dB re 1 µm)'),
      annotations: [
        { type: 'hline', y: RUN.rampEnd, color: 'muted', dash: true, label: '40 s: 3600 rpm 도달, 유지', labelAt: 'end', labelBelow: true },
        lbl(63, 50, '1X', 'c2'),
        lbl(122, 50, '2X', 'c2'),
        lbl(96, 3, '95 Hz 구조 공진 (고정)', 'warn'),
        lbl(30, 9, '임계 1500 rpm', 'text'),
        lbl(98, 29, '2X가 95 Hz를 지날 때', 'text'),
        lbl(22.5, 55, '25 Hz에 잠김', 'warn', 'end'),
        lbl(5, 30, '0.45X →', 'warn'),
      ],
      x: { range: [0, 130], ticks: [0, 10, 25, 50, 60, 75, 95, 120], label: '주파수 [Hz]' },
      y: { range: [0, 60], ticks: [0, 10, 20, 30, 40, 50, 60], label: '시간 [s]' },
      height: 300,
    },
  ],
};

// ── 그림 3: 프레임 길이의 트레이드오프 ──
const TO = [128, 512, 4096].map((n) => stft(SIG.x, RUN.fs, { n, overlap: n === 128 ? 0 : n === 512 ? 0.5 : 0.75, fMax: 80 }));

export const tradeoff: FigureSpec = {
  id: 'fig-p5-2-3',
  caption: `그림 3. 같은 기동(0 ~ 40 s, 1X가 1초에 ${fmt(V.rate, 3)} Hz씩 오름)을 프레임 길이만 바꿔 본 스펙트로그램. 위: N = 128(T = 0.25 s)은 시각은 촘촘하지만 Δf = 4 Hz라 줄이 굵다(20 s에서 1X 봉우리 폭 약 ${fmt(V.tradeoff[0].width, 2)} Hz). 가운데: N = 512(T = 1 s)는 줄이 가장 가늘다(${fmt(V.tradeoff[1].width, 2)} Hz). 아래: N = 4096(T = 8 s)은 Δf = 0.125 Hz지만 한 프레임 동안 1X가 ${fmt(V.tradeoff[2].move, 2)} Hz 움직여 번지고, 봉우리도 ${fmt(V.tradeoff[1].peak, 3)} → ${fmt(V.tradeoff[2].peak, 2)} µm로 낮아진다. 세로 칸(시각)도 8초로 굵다.`,
  panels: TO.map((S, i) => ({
    title: [`N = 128 (T = 0.25 s, Δf = 4 Hz)`, `N = 512 (T = 1 s, Δf = 1 Hz)`, `N = 4096 (T = 8 s, Δf = 0.125 Hz)`][i],
    series: [],
    heatmap: heat(S, 80, 40),
    x: { range: [0, 80] as [number, number], ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80], ...(i === 2 ? { label: '주파수 [Hz]' } : {}) },
    y: { range: [0, 40] as [number, number], ticks: [0, 10, 20, 30, 40], label: '시간 [s]' },
    height: 120,
  })),
};

// ── 그림 4: 워터폴(시간) vs 캐스케이드(회전수) ──
const fAx = Array.from(S512.freqs);
const lineAt = (m: number, base: number, scale: number): FigSeries => ({ x: fAx, y: Array.from(S512.amp[m], (v) => base + v * um * scale), color: 'c1', width: 1 });
const WF_T = Array.from({ length: 24 }, (_, i) => 1 + i * 2.5);
const CS_T = Array.from({ length: 30 }, (_, i) => 1 + i * 2);

export const waterfallCascade: FigureSpec = {
  id: 'fig-p5-2-4',
  caption: `그림 4. 같은 STFT 결과를 줄로 쌓은 두 그림. 위(워터폴, Waterfall): 시각 높이에 쌓는다. 40 s 뒤 회전수를 유지하는 동안에도 줄이 계속 쌓여, 25 Hz 성분이 ${fmt(V.whip42, 2)} µm에서 ${fmt(V.whip55, 3)} µm로 자라는 것이 보인다. 아래(캐스케이드, Cascade): 회전수 높이에 쌓는다. 회전 성분은 회전수에 비례하는 곧은 줄이 되지만, 유지하는 20초의 스펙트럼은 모두 3600 rpm 한 높이에 겹쳐 시간 변화가 숨는다.`,
  panels: [
    {
      title: '워터폴: 세로 = 시간',
      series: WF_T.map((t) => lineAt(nearest(S512, t), t, 0.13)),
      annotations: [{ type: 'hline', y: RUN.rampEnd, color: 'muted', dash: true, label: '유지 시작', labelAt: 'end', labelBelow: true }],
      x: { range: [0, 130], ticks: [0, 25, 50, 60, 75, 95, 120] },
      y: { range: [0, 66], ticks: [0, 10, 20, 30, 40, 50, 60], label: '시간 [s]' },
      height: 210,
    },
    {
      title: '캐스케이드: 세로 = 회전수',
      series: CS_T.map((t) => {
        const m = nearest(S512, t);
        return lineAt(m, rpmAt(S512.times[m]), 4.5);
      }),
      annotations: [{ type: 'text', x: 127, y: 3830, text: '40 ~ 60 s가 모두 3600 rpm에 겹침', anchor: 'end', color: 'warn', bold: true }],
      x: { range: [0, 130], ticks: [0, 25, 50, 60, 75, 95, 120], label: '주파수 [Hz]' },
      y: { range: [400, 3950], ticks: [600, 1200, 1800, 2400, 3000, 3600], label: '회전수 [rpm]' },
      height: 210,
    },
  ],
};

// ── 그림 5: 줄의 모양으로 원인 가르기 ──
const rpmG = Array.from({ length: 61 }, (_, i) => i * 60);
const orderLine = (k: number, color: 'c1' | 'c2'): FigSeries => ({ x: rpmG.map((r) => (k * r) / 60), y: rpmG, color, width: 2 });
const whirlPts = rpmG.filter((r) => r >= RUN.whirlStartRpm);

export const lineReading: FigureSpec = {
  id: 'fig-p5-2-5',
  caption: `그림 5. 회전수–주파수 평면에서 줄의 모양 읽기. 원점에서 나오는 곧은 줄은 회전을 따라가는 성분이고, 기울기가 차수다(1X, 2X, 0.45X). 세로줄은 회전수와 상관없이 제자리인 성분이다(구조 공진, 전원 주파수의 2배 같은 전기 성분). 비스듬히 따라가던 줄이 어느 회전수부터 세로로 꺾이면(0.45X → 25 Hz) 무언가에 "잠긴" 것이다. 회전 줄이 세로줄과 만나는 곳(1X × 25 Hz = 1500 rpm, 2X × 95 Hz = 2850 rpm)이 커질 수 있는 자리다.`,
  panels: [
    {
      series: [
        orderLine(1, 'c1'),
        orderLine(2, 'c1'),
        { x: whirlPts.map((r) => Math.min((RUN.whirlRatio * r) / 60, CRIT_HZ)), y: whirlPts, color: 'c2', width: 2.4, label: '0.45X → 잠김' },
        { x: [RUN.structHz, RUN.structHz], y: [0, 3600], color: 'c3', width: 2.4, label: '구조 공진 95 Hz' },
      ],
      annotations: [
        { type: 'vline', x: CRIT_HZ, color: 'muted', dash: true, label: '1차 임계 25 Hz' },
        { type: 'point', x: CRIT_HZ, y: RUN.critRpm, color: 'warn', label: '1500 rpm', dx: 8, dy: 4 },
        { type: 'point', x: RUN.structHz, y: 2850, color: 'warn', label: '2850 rpm', dx: 8, dy: 4 },
        { type: 'text', x: 62, y: 3480, text: '1X', color: 'c1', anchor: 'start', bold: true },
        { type: 'text', x: 118, y: 3300, text: '2X', color: 'c1', anchor: 'end', bold: true },
      ],
      x: { range: [0, 130], ticks: [0, 25, 50, 60, 75, 95, 120], label: '주파수 [Hz]' },
      y: { range: [0, 3800], ticks: [0, 600, 1200, 1800, 2400, 3000, 3600], label: '회전수 [rpm]' },
      height: 220,
    },
  ],
};

// ── 그림 6: STFT와 웨이블릿의 칸 나누기 ──
const tiles: FigAnnotation[] = [];
for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) tiles.push({ type: 'rect', x1: i * 1 + 0.05, x2: i * 1 + 0.95, y1: j * 2 + 0.1, y2: j * 2 + 1.9, color: 'c1' });
const wtiles: FigAnnotation[] = [];
[
  { y1: 0, y2: 1, w: 4 },
  { y1: 1, y2: 2, w: 2 },
  { y1: 2, y2: 4, w: 1 },
  { y1: 4, y2: 8, w: 0.5 },
].forEach((b) => {
  for (let x = 0; x < 8 - 1e-9; x += b.w) wtiles.push({ type: 'rect', x1: x + 0.05, x2: x + b.w - 0.05, y1: b.y1 + 0.06, y2: b.y2 - 0.06, color: 'c3' });
});

export const tiling: FigureSpec = {
  id: 'fig-p5-2-6',
  caption: '그림 6. 시간–주파수 평면을 나누는 두 방식(개념도). 칸 하나가 "이만큼의 시간 동안, 이만큼의 주파수 폭"을 뜻하고, 넓이(시간 폭 × 주파수 폭)는 어느 쪽이든 1 근처보다 작아질 수 없다. 위: STFT는 프레임 길이 하나로 모든 주파수를 같은 칸으로 나눈다. 아래: 웨이블릿은 낮은 주파수는 길게(주파수를 촘촘히), 높은 주파수는 짧게(시각을 촘촘히) 나눈다 — 느린 변화와 짧은 충격을 한 그림에서 볼 때 쓴다.',
  panels: [
    {
      title: 'STFT: 모든 주파수에서 같은 칸',
      series: [],
      annotations: tiles,
      x: { range: [0, 8], ticks: 'none' },
      y: { range: [0, 8], ticks: 'none', label: '주파수 →' },
      height: 110,
    },
    {
      title: '웨이블릿: 낮은 주파수는 길게, 높은 주파수는 짧게',
      series: [],
      annotations: wtiles,
      x: { range: [0, 8], ticks: 'none', label: '시간 →' },
      y: { range: [0, 8], ticks: 'none', label: '주파수 →' },
      height: 110,
    },
  ],
};
