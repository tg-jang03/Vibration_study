/**
 * P7-7 "전기적 원인 (모터 · 발전기)" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 계산은 랩(LAB-ELEC-01)과 같은 `lib/faults/electric.ts`의 설명용 모델로 한다.
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { bandAnalytic, magnitude, spectrumOf } from '../lib/dsp/envelope';
import {
  countPeaks,
  ELEC_MACHINES as EM,
  ELEC_SIG,
  elecLines,
  elecSignal,
  elecSpectrogram,
  elecSpectrum,
  electricRatio,
  mechRatio,
  motorFreqs,
  speedRatio,
} from '../lib/faults/electric';

const fmt = formatNumber;

const F2 = motorFreqs(EM.ind2, 60);
const F4 = motorFreqs(EM.ind4, 60);
const RB_LINES = elecLines(EM.ind2, 'rotorBar', 60);
const TRIP_LINES = elecLines(EM.ind2, ['stator', 'misalign'], 60);
const TRIP_T = 0.5;

/** 같은 주파수의 전기·기계 성분을 벡터로 더한 크기 [mm/s rms] (동기 발전기 120 Hz) */
function genAmp120(cause: 'stator' | 'misalign', t: number): number {
  const ls = elecLines(EM.syn2, cause, 100).filter((l) => Math.abs(l.f - 120) < 1e-9);
  let re = 0;
  let im = 0;
  for (const l of ls) {
    const g = l.electric ? electricRatio(EM.syn2, t) : mechRatio(EM.syn2, t);
    re += l.amp * g * Math.cos(l.ph);
    im += l.amp * g * Math.sin(l.ph);
  }
  return Math.hypot(re, im);
}

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p7-7.test.ts`) */
export const P77_VALUES = {
  ind2: F2,
  ind4: F4,
  ind4at80: motorFreqs(EM.ind4, 80),
  ind2full: motorFreqs(EM.ind2, 100),
  beatSeconds: 1 / F2.ppf,
  /** 로터바(2극, 부하 60 %): 1X 둘레(57 ~ 62 Hz) 봉우리 수 — 기록 2 s / 8 s */
  rbPeaks: { T2: countPeaks(elecSpectrum(EM.ind2, RB_LINES, 2).freq, elecSpectrum(EM.ind2, RB_LINES, 2).amp, 57, 62), T8: countPeaks(elecSpectrum(EM.ind2, RB_LINES, 8).freq, elecSpectrum(EM.ind2, RB_LINES, 8).amp, 57, 62) },
  /** 전원 차단 0.5 s 뒤: 전기 성분 비·기계 성분 비·회전수 비 */
  trip: { t: TRIP_T, elec: electricRatio(EM.ind2, TRIP_T), mech: mechRatio(EM.ind2, TRIP_T), speed: speedRatio(EM.ind2, TRIP_T) },
  /** 동기 발전기 120 Hz 크기: 계자 차단 전·2 s 뒤 */
  gen: {
    stator: { before: genAmp120('stator', 0), after2: genAmp120('stator', 2) },
    misalign: { before: genAmp120('misalign', 0), after2: genAmp120('misalign', 2) },
    fieldRatio2: electricRatio(EM.syn2, 2),
  },
};
const V = P77_VALUES;

// ── 공통 ──
const circle = (cx: number, cy: number, r: number, color: FigColor = 'muted', width = 1, dash = false): FigSeries => {
  const a = Array.from({ length: 97 }, (_, i) => (2 * Math.PI * i) / 96);
  return { x: a.map((t) => cx + r * Math.cos(t)), y: a.map((t) => cy + r * Math.sin(t)), color, width, dash };
};
const text = (x: number, y: number, t: string, extra: Partial<Extract<FigAnnotation, { type: 'text' }>> = {}): FigAnnotation => ({ type: 'text', x, y, text: t, anchor: 'middle', ...extra });
const stem = (f: number, a: number, color: FigColor, label?: string): FigSeries => ({ x: [f], y: [a], kind: 'stem', color, label, radius: 3.5 });

// ── 그림 1: 전류의 제곱 → 2배 주파수 ──
const tMs = Array.from({ length: 401 }, (_, i) => (i / 400) * (2000 / 60));
const cur = tMs.map((t) => Math.cos((2 * Math.PI * 60 * t) / 1000));
export const forceDoubling: FigureSpec = {
  id: 'fig-p7-7-1',
  caption:
    '그림 1. 60 Hz 전류(위)와 그 전류가 만드는 자기 끌림(가운데, 전류의 제곱에 비례). 전류가 +일 때도 −일 때도 철을 끌어당기므로, 힘은 전류 한 주기(16.7 ms)에 두 번 세진다 — 봉우리 간격 8.33 ms, 곧 120 Hz다. 아래 스펙트럼에서 전류는 60 Hz 한 줄이지만, 힘은 0 Hz(늘 당기는 평균)와 120 Hz(출렁임) 두 줄이 된다. 진동이 되는 것은 120 Hz 출렁임이다.',
  panels: [
    {
      title: '전류 i(t), 60 Hz',
      height: 120,
      x: { range: [0, 2000 / 60], label: '시간 [ms]', ticks: [0, 8.33, 16.67, 25, 33.33] },
      y: { range: [-1.2, 1.2], ticks: [-1, 0, 1] },
      series: [{ x: tMs, y: cur, color: 'c1', width: 1.8 }],
    },
    {
      title: '자기 끌림 ∝ i², 120 Hz로 출렁임',
      height: 120,
      x: { range: [0, 2000 / 60], label: '시간 [ms]', ticks: [0, 8.33, 16.67, 25, 33.33] },
      y: { range: [0, 1.15], ticks: [0, 0.5, 1] },
      series: [{ x: tMs, y: cur.map((c) => c * c), color: 'c2', width: 1.8 }],
      annotations: [{ type: 'hline', y: 0.5, label: '평균 (늘 당김)', color: 'muted', dash: true }],
    },
    {
      title: '스펙트럼으로 보면',
      height: 130,
      x: { range: [-5, 140], label: '주파수 [Hz]', ticks: [0, 60, 120] },
      y: { range: [0, 1.25], ticks: 'none' },
      series: [stem(60, 1, 'c1', '전류'), stem(0, 0.5, 'c2', '자기 끌림'), stem(120, 0.5, 'c2')],
      annotations: [text(60, 1.12, '60 Hz', { color: 'c1' }), text(120, 0.62, '120 Hz = 2×LF', { color: 'c2' }), text(4, 0.62, '평균', { color: 'c2', anchor: 'start' })],
    },
  ],
};

// ── 그림 2: 공극 도식 ──
const X2: [number, number] = [0, 90];
const Y2 = squareYRange(X2, 270);
const RS_OUT = 10.4;
const RS_IN = 7.8;
const RR = 6.2;
const ECC = 0.9;
const CY = 18.4;
/** 회전자 겉면에서 바깥으로 끌림 화살표 (길이 ∝ 1/공극²) */
const pulls = (cx: number, rx: number, ry: number): FigAnnotation[] =>
  Array.from({ length: 12 }, (_, k) => {
    const th = (2 * Math.PI * k) / 12;
    // 이 방향의 공극 = 고정자 안쪽 반지름 − (회전자 중심 오프셋을 그 방향으로 투영 + 회전자 반지름)
    const off = (rx - cx) * Math.cos(th) + (ry - CY) * Math.sin(th);
    const gap = RS_IN - RR - off;
    const len = Math.min(3.4, 1.6 * ((RS_IN - RR) / gap) ** 2);
    const x1 = rx + (RR - 3.6) * Math.cos(th);
    const y1 = ry + (RR - 3.6) * Math.sin(th);
    return { type: 'arrow', x1, y1, x2: x1 + len * Math.cos(th), y2: y1 + len * Math.sin(th), color: 'muted' } as FigAnnotation;
  });
const stator = (cx: number): FigSeries[] => [circle(cx, CY, RS_OUT, 'muted', 1.2), circle(cx, CY, RS_IN, 'muted', 1.2)];
const G = [15, 45, 75];
export const airGap: FigureSpec = {
  id: 'fig-p7-7-2',
  caption: `그림 2. 고정자(회색 고리) 안에서 도는 회전자(파랑)와 공극. 작은 화살표는 회전자를 고정자 쪽으로 끄는 자기력이고, 공극이 좁은 쪽일수록 세다. 왼쪽: 공극이 고르면 사방의 끌림이 상쇄되어 회전자에는 합력이 없고, 고정자 철심만 2×LF로 출렁인다. 가운데: 회전자가 한쪽으로 치우친 정적 편심은 좁은 쪽(주황 점)이 고정되어, 그 방향으로 2×LF 합력(주황 화살표)이 생긴다. 오른쪽: 회전자 자체가 회전 중심에서 벗어난 동적 편심은 좁은 쪽이 회전자와 함께 돌아, 도는 끌림이 1X와 극통과 주파수(PPF)로 변조된다(점선 = 회전자가 도는 자리).`,
  panels: [
    {
      frame: false,
      height: 270,
      x: { range: X2 },
      y: { range: Y2 },
      series: [
        ...stator(G[0]),
        circle(G[0], CY, RR, 'c1', 1.8),
        ...stator(G[1]),
        circle(G[1] + ECC, CY, RR, 'c1', 1.8),
        ...stator(G[2]),
        circle(G[2] + ECC * Math.cos(0.8), CY + ECC * Math.sin(0.8), RR, 'c1', 1.8),
        circle(G[2] + ECC * Math.cos(0.8 + Math.PI * 0.9), CY + ECC * Math.sin(0.8 + Math.PI * 0.9), RR, 'c1', 1, true),
        circle(G[2], CY, ECC, 'warn', 1, true),
      ],
      annotations: [
        ...pulls(G[0], G[0], CY),
        ...pulls(G[1], G[1] + ECC, CY),
        ...pulls(G[2], G[2] + ECC * Math.cos(0.8), CY + ECC * Math.sin(0.8)),
        { type: 'point', x: G[1] + RS_IN - 0.35, y: CY, color: 'warn' },
        { type: 'arrow', x1: G[1] + ECC, y1: CY, x2: G[1] + ECC + 5.2, y2: CY, color: 'warn' },
        { type: 'point', x: G[2] + RS_IN * Math.cos(0.8) - 0.3, y: CY + RS_IN * Math.sin(0.8) - 0.3, color: 'warn' },
        { type: 'arrow', x1: G[2] + ECC * Math.cos(0.8), y1: CY + ECC * Math.sin(0.8), x2: G[2] + 5.4 * Math.cos(0.8), y2: CY + 5.4 * Math.sin(0.8), color: 'warn' },
        text(G[0], 31.2, '고른 공극', { bold: true }),
        text(G[1], 31.2, '정적 편심', { bold: true }),
        text(G[2], 31.2, '동적 편심', { bold: true }),
        text(G[0], 5.4, '끌림이 상쇄, 합력 0'),
        text(G[0], 2.0, '고정자만 2×LF로 출렁', { color: 'muted' }),
        text(G[1], 5.4, '좁은 쪽이 고정'),
        text(G[1], 2.0, '한 방향 2×LF 합력', { color: 'warn' }),
        text(G[2], 5.4, '좁은 쪽이 회전자와 함께 돈다'),
        text(G[2], 2.0, '1X ± PPF, 2×LF ± PPF', { color: 'warn' }),
      ],
    },
  ],
};

// ── 그림 3: 유도전동기의 주파수 사다리 ──
const ladderPanel = (q: typeof F2, poles: number, title: string, wide: [number, number]) => {
  const hs = Array.from({ length: poles }, (_, i) => i + 1);
  return {
    title,
    height: 150,
    x: { range: wide, label: '주파수 [Hz]', ticks: hs.map((h) => (h * q.twoLF) / poles) },
    y: { range: [0, 1.35] as [number, number], ticks: 'none' as const },
    series: [...hs.map((h) => stem(h * q.fr, h === poles ? 0.8 : 0.55, 'c1', h === 1 ? '회전 하모닉 (기계)' : undefined)), stem(q.twoLF, 1, 'warn', '2×LF (전기)')],
    annotations: [
      { type: 'vline' as const, x: q.fsync, label: `동기속도 ${fmt(q.fsync, 3)} Hz`, color: 'muted' as FigColor, dash: true },
      text(q.twoLF, 1.17, `2×LF ${q.twoLF}`, { color: 'warn' }),
      text(poles * q.fr, 0.94, `${poles}X ${fmt(poles * q.fr, 4)}`, { color: 'c1', anchor: 'end', dx: -4 }),
    ],
  };
};
const zoomPanel = (q: typeof F2, poles: number, title: string) => ({
  title,
  height: 120,
  x: { range: [q.pX - 1.6, q.twoLF + 1.2] as [number, number], label: '주파수 [Hz]', ticks: [q.pX, q.twoLF] },
  y: { range: [0, 1.4] as [number, number], ticks: 'none' as const },
  series: [stem(q.pX, 0.8, 'c1'), stem(q.twoLF, 1, 'warn')],
  annotations: [
    { type: 'arrow' as const, x1: q.pX, y1: 1.18, x2: q.twoLF, y2: 1.18, double: true, color: 'text' as FigColor, label: `PPF = ${fmt(q.ppf, 2)} Hz` },
    text(q.pX, 0.94, `${poles}X`, { color: 'c1' }),
    text(q.twoLF, 0.6, '2×LF', { color: 'warn', anchor: 'start', dx: 6 }),
  ],
});
export const inductionLadder: FigureSpec = {
  id: 'fig-p7-7-3',
  caption: `그림 3. 부하 60 %로 도는 유도전동기의 회전 하모닉(파랑)과 2×LF(주황). 2극 60 Hz 전동기는 동기속도 60 Hz보다 슬립 ${fmt(F2.slip * 100, 2)} %만큼 늦은 ${fmt(F2.fr, 3)} Hz(${fmt(F2.rpm, 4)} rpm)로 돌아, 2X ${fmt(F2.pX, 4)} Hz가 2×LF 120 Hz보다 ${fmt(F2.ppf, 2)} Hz 아래에 선다. 4극 50 Hz 전동기는 ${fmt(F4.fr, 3)} Hz(${fmt(F4.rpm, 4)} rpm)로 돌고, 2×LF 100 Hz에 붙는 것은 2X가 아니라 4X ${fmt(F4.pX, 3)} Hz다(${fmt(F4.ppf, 2)} Hz 차이). 어느 쪽이든 2×LF는 극수 번째 하모닉보다 극통과 주파수 PPF만큼 위에 있다.`,
  panels: [ladderPanel(F2, 2, '2극 · 60 Hz · 부하 60 %', [0, 130]), zoomPanel(F2, 2, '2X와 2×LF 확대'), ladderPanel(F4, 4, '4극 · 50 Hz · 부하 60 %', [0, 110]), zoomPanel(F4, 4, '4X와 2×LF 확대')],
};

// ── 그림 4: 로터바 결함의 1X ± PPF ──
const rbSpec = (T: number) => elecSpectrum(EM.ind2, RB_LINES, T);
const cut = (s: { freq: Float64Array; amp: Float64Array }, f1: number, f2: number) => {
  const x: number[] = [];
  const y: number[] = [];
  for (let k = 0; k < s.freq.length; k++) if (s.freq[k] >= f1 && s.freq[k] <= f2) {
    x.push(s.freq[k]);
    y.push(s.amp[k]);
  }
  return { x, y };
};
const RB2 = cut(rbSpec(2), 56.5, 62.5);
const RB8 = cut(rbSpec(8), 56.5, 62.5);
const rbSig = elecSignal(EM.ind2, RB_LINES, { t0: 0, t1: 8, trip: false });
const rbBand = bandAnalytic(spectrumOf(rbSig.v), rbSig.fs, 54, 66);
const rbEnv = magnitude(rbBand);
const rbT = Array.from(rbSig.t);
const rbStep = 2;
const sub = <T,>(a: ArrayLike<T>) => Array.from({ length: Math.floor(a.length / rbStep) }, (_, i) => a[i * rbStep]);
const sbMarks = (y: number): FigAnnotation[] => [
  { type: 'vline', x: F2.fr - F2.ppf, color: 'muted', dash: true },
  { type: 'vline', x: F2.fr + F2.ppf, color: 'muted', dash: true },
  text(F2.fr - F2.ppf, y, '1X − PPF', { color: 'muted', anchor: 'end', dx: -4 }),
  text(F2.fr + F2.ppf, y, '1X + PPF', { color: 'muted', anchor: 'start', dx: 4 }),
];
const rbMax = Math.max(...RB2.y, ...RB8.y) * 1.25;
export const rotorBar: FigureSpec = {
  id: 'fig-p7-7-4',
  caption: `그림 4. 로터바가 깨진 2극 전동기(부하 60 %)의 1X 둘레. 기록 2 s(Δf 0.5 Hz, 위)에서는 1X(${fmt(F2.fr, 3)} Hz)와 양옆 ${fmt(F2.ppf, 2)} Hz 떨어진 측대역이 한 덩어리(봉우리 ${V.rbPeaks.T2}개)라 불평형의 1X와 구별되지 않는다. 기록 8 s(Δf 0.125 Hz, 가운데)로 늘리면 ${fmt(F2.fr - F2.ppf, 3)}·${fmt(F2.fr, 3)}·${fmt(F2.fr + F2.ppf, 3)} Hz 세 줄(봉우리 ${V.rbPeaks.T8}개)로 갈라진다. 아래는 1X 둘레만 남긴 파형(파랑)과 포락선(회색): 1X의 크기가 ${fmt(V.beatSeconds, 3)} s(= 1/PPF)마다 커졌다 작아진다 — 맥놀이(P2-8)다.`,
  panels: [
    { title: '기록 2 s (Δf 0.5 Hz)', height: 120, x: { range: [56.5, 62.5], label: '주파수 [Hz]' }, y: { range: [0, rbMax], label: '[mm/s rms]' }, series: [{ ...RB2, color: 'c1', width: 1.6 }], annotations: sbMarks(rbMax * 0.86) },
    { title: '기록 8 s (Δf 0.125 Hz)', height: 120, x: { range: [56.5, 62.5], label: '주파수 [Hz]' }, y: { range: [0, rbMax], label: '[mm/s rms]' }, series: [{ ...RB8, color: 'c1', width: 1.6 }], annotations: sbMarks(rbMax * 0.86) },
    {
      title: '1X 둘레만 남긴 파형 (54 ~ 66 Hz)',
      height: 130,
      x: { range: [0, 8], label: '시간 [s]' },
      y: { range: [-3.2, 3.2], label: '[mm/s]' },
      series: [
        { x: sub(rbT), y: sub(rbBand.re), color: 'c1', width: 0.7 },
        { x: sub(rbT), y: sub(rbEnv), color: 'muted', width: 1.4 },
      ],
      annotations: [{ type: 'arrow', x1: 2.0, y1: 2.85, x2: 2.0 + V.beatSeconds, y2: 2.85, double: true, color: 'text', label: `${fmt(V.beatSeconds, 3)} s` }],
    },
  ],
};

// ── 그림 5: 전원 차단 시험 (2극, 2X + 2×LF) ──
const SG = elecSpectrogram(EM.ind2, TRIP_LINES, 140);
const edges = (c: number[]) => {
  const h = c.length > 1 ? (c[1] - c[0]) / 2 : 0.5;
  return [...c.map((v) => v - h), c[c.length - 1] + h];
};
const sgZ = SG.freqs.map((_, k) => SG.amp.map((row) => row[k]));
const tLine = Array.from({ length: 201 }, (_, i) => ELEC_SIG.t0 + (i / 200) * (ELEC_SIG.t1 - ELEC_SIG.t0));
const lineAmp = (name: string) => TRIP_LINES.find((l) => l.name === name)!.amp;
export const tripTest: FigureSpec = {
  id: 'fig-p7-7-5',
  caption: `그림 5. 미스얼라인(기계 2X)과 고정자 문제(전기 2×LF)가 함께 있는 2극 전동기(부하 60 %)의 전원을 t = 0에 끊었을 때. 위: 0.5 s 프레임 스펙트로그램(Δf 2 Hz). 차단 전에는 2X(${fmt(F2.pX, 4)} Hz)와 2×LF(120 Hz)가 한 칸에 섞여 ${fmt(V.beatSeconds, 3)} s마다 진해졌다 옅어진다(맥놀이). 차단하는 순간 2×LF는 사라지고, 남은 2X는 회전수를 따라 아래로 휘며 천천히 약해진다. 아래: 성분별 크기. 0.5 s 뒤 전기 성분은 처음의 ${fmt(V.trip.elec * 100, 2)} %, 기계 2X는 ${fmt(V.trip.mech * 100, 2)} %이고 그 주파수는 ${fmt(F2.pX * V.trip.speed, 4)} Hz다(회전수 ${fmt(V.trip.speed * 100, 2)} %).`,
  panels: [
    {
      title: '스펙트로그램 (진할수록 큼)',
      height: 200,
      x: { range: [ELEC_SIG.t0 + 0.25, ELEC_SIG.t1 - 0.25], label: '시간 [s] (0 = 전원 차단)' },
      y: { range: [0, 140], label: '주파수 [Hz]', ticks: [0, 30, 60, 90, 120] },
      series: [],
      heatmap: { x: edges(SG.times), y: edges(SG.freqs), z: sgZ, zRange: [0, 4.5], levels: 8, color: 'c1', legend: '[mm/s rms]' },
      annotations: [
        { type: 'vline', x: 0, color: 'warn', dash: true },
        text(-2, 131, '2X + 2×LF (맥놀이)', { color: 'text' }),
        text(3.4, 84, '2X가 회전수를 따라 내려감', { color: 'text' }),
      ],
    },
    {
      title: '성분별 크기',
      height: 140,
      x: { range: [ELEC_SIG.t0 + 0.25, ELEC_SIG.t1 - 0.25], label: '시간 [s] (0 = 전원 차단)' },
      y: { range: [0, 3.8], label: '[mm/s rms]' },
      series: [
        { x: tLine, y: tLine.map((t) => lineAmp('2×LF') * electricRatio(EM.ind2, t)), color: 'warn', width: 2, label: '2×LF (전기)' },
        { x: tLine, y: tLine.map((t) => lineAmp('2X') * mechRatio(EM.ind2, t)), color: 'c1', width: 2, label: '2X (기계)' },
      ],
      annotations: [{ type: 'vline', x: 0, label: '전원 차단', color: 'muted', dash: true }],
    },
  ],
};

// ── 그림 6: 2극 동기 발전기 ──
const tg = Array.from({ length: 161 }, (_, i) => -2 + (i / 160) * 8);
export const generator: FigureSpec = {
  id: 'fig-p7-7-6',
  caption: `그림 6. 2극 동기 발전기(60 Hz)는 슬립이 없어 1X = 60 Hz = LF, 2X = 120 Hz = 2×LF로 자리가 정확히 겹친다(위). 기록을 아무리 늘려도 갈라지지 않으므로, 회전수를 3600 rpm으로 유지한 채 t = 0에 계자(회전자 전자석의 전류)를 끊는 시험으로 가른다(아래). 고정자 쪽 자기력이 주인이면(주황) 120 Hz가 ${fmt(V.gen.stator.before, 2)} → ${fmt(V.gen.stator.after2, 2)} mm/s로 자속을 따라 몇 초 안에 줄고, 기계 2X가 주인이면(파랑) ${fmt(V.gen.misalign.before, 3)} → ${fmt(V.gen.misalign.after2, 3)} mm/s로 거의 그대로다. 발전기 쪽 시험은 P8-5에서 다시 다룬다.`,
  panels: [
    {
      title: '자리: 1X = LF, 2X = 2×LF',
      height: 120,
      x: { range: [0, 140], label: '주파수 [Hz]', ticks: [0, 60, 120] },
      y: { range: [0, 1.4], ticks: 'none' },
      series: [stem(60, 0.7, 'c1', '회전 하모닉 (기계)'), stem(120, 0.5, 'c1'), { x: [120], y: [1], kind: 'dots', color: 'warn', radius: 5, label: '2×LF (전기)' }],
      annotations: [text(60, 0.86, '1X = LF', { color: 'c1' }), text(120, 1.18, '2X = 2×LF', { color: 'text' })],
    },
    {
      title: '120 Hz 크기 — t = 0에 계자 차단 (회전수 유지)',
      height: 150,
      x: { range: [-2, 6], label: '시간 [s]' },
      y: { range: [0, 4], label: '[mm/s rms]' },
      series: [
        { x: tg, y: tg.map((t) => genAmp120('stator', t)), color: 'warn', width: 2, label: '고정자 자기력이 주인' },
        { x: tg, y: tg.map((t) => genAmp120('misalign', t)), color: 'c1', width: 2, label: '기계 2X가 주인' },
      ],
      annotations: [{ type: 'vline', x: 0, label: '계자 차단', color: 'muted', dash: true }],
    },
  ],
};
