/**
 * P1-3 "분해능 · 측정 시간 · Zoom FFT" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 스펙트럼 그림은 분석기·랩(LAB-RES-01, ZOOM-01)의 기본값인 Hann 윈도우로 계산한다 (윈도우 자체는 P1-4).
 * 윈도우 없이 계산하면 bin 위에 정확히 놓인 성분이 거친 Δf에서도 깨끗이 갈라져 보이는 등 실제 화면과 달라진다.
 */
import { grid, type FigAnnotation, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { acquire } from '../lib/dsp/sampling';
import { evaluate, type SignalComponent } from '../lib/dsp/signal';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';

function curve(components: SignalComponent[], t0: number, t1: number, points = 1200) {
  const t = grid(t0, t1, points);
  return { t, x: t.map((tt) => evaluate({ components }, tt)) };
}
const arr = (a: ArrayLike<number>) => Array.from(a);
function inRange(spec: { frequency: Float64Array; amplitude: Float64Array }, lo: number, hi: number) {
  const f: number[] = [];
  const a: number[] = [];
  for (let i = 0; i < spec.frequency.length; i++) {
    if (spec.frequency[i] >= lo && spec.frequency[i] <= hi) {
      f.push(spec.frequency[i]);
      a.push(spec.amplitude[i]);
    }
  }
  return { f, a };
}

// 그림 1 — 1 Hz 차이는 1초짜리 맥놀이로만 드러난다
const BEAT: SignalComponent[] = [
  { type: 'sine', freq: 10, amp: 1 },
  { type: 'sine', freq: 11, amp: 1 },
];
const beat = curve(BEAT, 0, 2, 2400);
const env = beat.t.map((t) => Math.abs(2 * Math.cos(Math.PI * 1 * t)));
const short = curve(BEAT, 0, 0.25, 600);
export const beatTime: FigureSpec = {
  id: 'fig-3-1',
  caption:
    '그림 1. 10 Hz와 11 Hz 정현파를 더한 신호. 위: 2초 동안 보면 크기가 1초마다 커졌다 작아졌다 한다(맥놀이, 점선은 그 바깥 모양). 이 "1초짜리 출렁임"이 두 성분이 1 Hz 차이라는 유일한 흔적이다. 아래: 처음 0.25초만 잘라 보면 그냥 10.5 Hz 정현파 하나처럼 보인다. 1 Hz 차이를 알아보려면 1초 가까이 봐야 한다 — 이것이 Δf = 1/T의 뜻이다.',
  panels: [
    {
      title: '2초 동안 보면: 1초마다 크기가 출렁인다',
      series: [
        { x: beat.t, y: beat.x, color: 'c1', width: 1.2 },
        { x: beat.t, y: env, color: 'c2', dash: true, width: 1.6 },
        { x: beat.t, y: env.map((v) => -v), color: 'c2', dash: true, width: 1.6 },
      ],
      annotations: [
        { type: 'band', x1: 0, x2: 0.25, label: '0.25초', color: 'warn' },
        { type: 'arrow', x1: 0, y1: 2.35, x2: 1, y2: 2.35, double: true, label: '1초 = 1 / (11 − 10 Hz)', color: 'c2' },
      ],
      x: { range: [0, 2], label: '시간 [s]' },
      y: { range: [-2.4, 2.8], ticks: [-2, 0, 2] },
      height: 150,
    },
    {
      title: '처음 0.25초만 보면: 정현파 하나처럼 보인다',
      series: [{ x: short.t, y: short.x, color: 'c1', width: 2 }],
      x: { range: [0, 0.25], label: '시간 [s]' },
      y: { range: [-2.4, 2.4], ticks: [-2, 0, 2] },
      height: 110,
    },
  ],
};

// 그림 2 — 같은 두 성분(25.2, 28.8 Hz)을 0.4초 vs 1.6초 측정
const FS2 = 2560; // F_max 1000 Hz
const TWO: SignalComponent[] = [
  { type: 'sine', freq: 25.2, amp: 1 },
  { type: 'sine', freq: 28.8, amp: 0.8 },
];
const sp = (n: number, pad: number) => singleSidedSpectrum(acquire({ components: TWO }, { fs: FS2, n }), { fftSize: n * pad, window: 'hann' });
const lo2 = 15;
const hi2 = 39;
const b400 = inRange(sp(1024, 1), lo2, hi2);
const c400 = inRange(sp(1024, 32), lo2, hi2);
const b1600 = inRange(sp(4096, 1), lo2, hi2);
const c1600 = inRange(sp(4096, 8), lo2, hi2);
const truth2: FigAnnotation[] = [
  { type: 'vline', x: 25.2, color: 'warn', dash: true },
  { type: 'vline', x: 28.8, color: 'warn', dash: true },
];
const specPanel = (title: string, c: { f: number[]; a: number[] }, b: { f: number[]; a: number[] }, color: 'c1' | 'c3', last: boolean): FigPanel => ({
  title,
  series: [
    { x: c.f, y: c.a, color, width: 1.6, opacity: 0.5 },
    { x: b.f, y: b.a, kind: 'stem', color, width: 2.4, radius: 3.2 },
  ],
  annotations: truth2,
  x: last ? { range: [lo2, hi2], label: '주파수 [Hz]' } : { range: [lo2, hi2], ticks: 'none' },
  y: { range: [0, 1.2], ticks: [0, 0.5, 1] },
  height: last ? 125 : 105,
});
export const twoTonesVsT: FigureSpec = {
  id: 'fig-3-2',
  caption:
    '그림 2. 25.2 Hz와 28.8 Hz(주황 점선, 간격 3.6 Hz) 두 성분. F_max = 1000 Hz, Hann 윈도우(분석기 기본값)에서 라인 수만 바꿨다. 막대는 분석기가 계산한 bin, 옅은 선은 bin 사이를 채운 모양. 위: 400 라인 → Δf = 2.5 Hz, T = 0.4 s. 간격이 1.4 bin뿐이라 두 성분이 하나의 둔덕으로 뭉친다. 아래: 1600 라인 → Δf = 0.625 Hz, T = 1.6 s. 간격이 5.8 bin이 되어 두 봉우리로 갈라진다.',
  panels: [
    specPanel('400 라인 (T = 0.4 s): 하나로 뭉친다', c400, b400, 'c1', false),
    specPanel('1600 라인 (T = 1.6 s): 두 개로 갈라진다', c1600, b1600, 'c3', true),
  ],
};

// 그림 3 — 감속 중에는 1X가 움직인다: 짧은 프레임과 긴 프레임
const RATE = -1; // Hz/s (= 60 rpm/s 감속)
const F0 = 60;
const tLine = grid(0, 5, 51);
export const sweepFrames: FigureSpec = {
  id: 'fig-3-3',
  caption:
    '그림 3. 3600 rpm에서 1초에 60 rpm씩 느려지는 기계(감속률 60 rpm/s). 1X는 1초에 1 Hz씩 내려간다. 0.5초 프레임 동안에는 1X가 0.5 Hz만 움직이지만, 4초 프레임 동안에는 4 Hz나 움직인다. 긴 프레임의 스펙트럼에는 그 4 Hz 전체가 한꺼번에 찍힌다.',
  panels: [
    {
      series: [{ x: tLine, y: tLine.map((t) => F0 + RATE * t), color: 'c1', width: 2.6, label: '1X 주파수' }],
      annotations: [
        { type: 'rect', x1: 0, x2: 0.5, y1: 55.6, y2: 60.4, color: 'c3' },
        { type: 'rect', x1: 0.5, x2: 4.5, y1: 55.6, y2: 60.4, color: 'warn' },
        { type: 'text', x: 0.25, y: 60.4, text: '0.5초', anchor: 'middle', dy: -8, color: 'c3', bold: true },
        { type: 'text', x: 2.5, y: 60.4, text: '4초 프레임: 이 동안 1X가 4 Hz 움직인다', anchor: 'middle', dy: -8, color: 'warn', bold: true },
      ],
      x: { range: [0, 5], ticks: [0, 0.5, 1, 2, 3, 4, 4.5, 5], label: '시간 [s]' },
      y: { range: [54.5, 61.6], ticks: [55, 56, 57, 58, 59, 60], label: '1X [Hz]' },
      height: 160,
      legend: false,
    },
  ],
};

// 그림 4 — 스미어링: 긴 프레임에서는 막대가 넓게 퍼지고 낮아진다
const FS4 = 256;
const chirp = (n: number) =>
  singleSidedSpectrum(acquire({ components: [{ type: 'chirp', f0: F0, rate: RATE, amp: 1 }] }, { fs: FS4, n }), { window: 'hann' });
const steady = (n: number) => singleSidedSpectrum(acquire({ components: [{ type: 'sine', freq: F0, amp: 1 }] }, { fs: FS4, n }), { window: 'hann' });
const sShort = inRange(chirp(128), 48, 64);
const sLong = inRange(chirp(1024), 48, 64);
const sLongSteady = inRange(steady(1024), 48, 64);
const peakShort = Math.max(...sShort.a);
const peakLong = Math.max(...sLong.a);
export const smearing: FigureSpec = {
  id: 'fig-3-4',
  caption: `그림 4. 그림 3의 신호를 두 길이로 잰 스펙트럼. 위: 0.5초(Δf = 2 Hz) — 1X가 0.25 bin만 움직여 막대 하나가 높게(${formatNumber(peakShort, 2)}) 선다. 아래: 4초(Δf = 0.25 Hz) — 눈금은 8배 촘촘해졌지만 1X가 16 bin에 걸쳐 움직여, 에너지가 여러 막대에 나뉘어 퍼지고 가장 높은 막대도 ${formatNumber(peakLong, 2)}로 낮아진다. 회색 막대는 같은 4초 동안 회전수가 일정했다면 보였을 모양(가운데 1.0)이다. 이렇게 퍼지는 것을 스미어링(Smearing)이라 한다.`,
  panels: [
    {
      title: '0.5초 측정 (Δf = 2 Hz): 막대가 좁고 높다',
      series: [{ x: sShort.f, y: sShort.a, kind: 'stem', color: 'c3', width: 3, radius: 4 }],
      x: { range: [48, 64], ticks: 'none' },
      y: { range: [0, 1.15], ticks: [0, 0.5, 1] },
      height: 105,
    },
    {
      title: '4초 측정 (Δf = 0.25 Hz): 넓게 퍼지고 낮아진다',
      series: [
        { x: sLongSteady.f, y: sLongSteady.a, kind: 'stem', color: 'muted', width: 1.4, radius: 0, opacity: 0.6 },
        { x: sLong.f, y: sLong.a, kind: 'stem', color: 'warn', width: 2, radius: 2.4 },
      ],
      annotations: [{ type: 'arrow', x1: 56, y1: 0.62, x2: 60, y2: 0.62, double: true, label: '프레임 동안 1X가 움직인 4 Hz', color: 'warn' }],
      x: { range: [48, 64], ticks: [48, 50, 52, 54, 56, 58, 60, 62, 64], label: '주파수 [Hz]' },
      y: { range: [0, 1.15], ticks: [0, 0.5, 1] },
      height: 125,
    },
  ],
};

// 그림 5 — Zoom FFT: 전체를 보다가 한 구간만 촘촘하게
const ZFS = 5120; // F_max 2000 Hz
const GEAR: SignalComponent[] = [
  { type: 'sine', freq: 1200, amp: 1 },
  { type: 'sine', freq: 1195, amp: 0.4 },
  { type: 'sine', freq: 1205, amp: 0.4 },
  { type: 'sine', freq: 300, amp: 0.6 },
];
const wide = singleSidedSpectrum(acquire({ components: GEAR }, { fs: ZFS, n: 1024 }), { window: 'hann' }); // Δf = 5 Hz
const fine = singleSidedSpectrum(acquire({ components: GEAR }, { fs: ZFS, n: 8192 }), { window: 'hann' }); // Δf = 0.625 Hz
const wideAll = inRange(wide, 0, 2000);
const fineBand = inRange(fine, 1185, 1215);
const wideBand = inRange(wide, 1185, 1215);
export const zoomIdea: FigureSpec = {
  id: 'fig-3-5',
  caption:
    '그림 5. 1200 Hz 성분(진폭 1) 양옆 ±5 Hz에 작은 성분(측대역, 진폭 0.4)이 붙은 신호. 위: 0 ~ 2000 Hz 전체를 400 라인으로 보면 Δf = 5 Hz라 세 성분의 둔덕이 겹친다. 가운데: 그 부분을 크게 그리면 막대 모양만으로는 성분이 몇 개인지 알 수 없고, 겹친 둔덕끼리 서로 깎아 1200 Hz 막대 높이도 1이 아니라 약 0.6으로 틀리게 나온다. 아래: 1200 Hz 주변만 8배 촘촘하게(Δf = 0.625 Hz) 보면 세 성분이 갈라진다. 이렇게 "좁은 구간만 촘촘히" 보는 것이 Zoom FFT다. 대신 측정 시간도 0.2 s → 1.6 s로 8배 길어진다.',
  panels: [
    {
      title: '전체 0 ~ 2000 Hz, 400 라인 (Δf = 5 Hz, T = 0.2 s)',
      series: [{ x: wideAll.f, y: wideAll.a, kind: 'stem', color: 'c1', width: 1.6, radius: 0 }],
      annotations: [{ type: 'band', x1: 1100, x2: 1300, label: '확대할 구간', color: 'warn' }],
      x: { range: [0, 2000], ticks: [0, 300, 500, 1000, 1200, 1500, 2000], label: '주파수 [Hz]' },
      y: { range: [0, 1.25], ticks: [0, 0.5, 1] },
      height: 110,
    },
    {
      title: '같은 스펙트럼의 1185 ~ 1215 Hz 부분: 막대 간격 5 Hz',
      series: [{ x: wideBand.f, y: wideBand.a, kind: 'stem', color: 'c1', width: 3, radius: 4 }],
      x: { range: [1185, 1215], ticks: 'none' },
      y: { range: [0, 1.25], ticks: [0, 0.5, 1] },
      height: 95,
    },
    {
      title: 'Zoom ×8: 1200 Hz 주변만 Δf = 0.625 Hz (T = 1.6 s)',
      series: [{ x: fineBand.f, y: fineBand.a, kind: 'stem', color: 'c3', width: 2, radius: 2.6 }],
      annotations: [
        { type: 'text', x: 1195, y: 0.4, text: '1195 Hz', anchor: 'middle', dy: -10, color: 'c3' },
        { type: 'text', x: 1200, y: 1, text: '1200 Hz', anchor: 'middle', dy: -10, color: 'c3' },
        { type: 'text', x: 1205, y: 0.4, text: '1205 Hz', anchor: 'middle', dy: -10, color: 'c3' },
      ],
      x: { range: [1185, 1215], ticks: [1185, 1190, 1195, 1200, 1205, 1210, 1215], label: '주파수 [Hz]' },
      y: { range: [0, 1.25], ticks: [0, 0.5, 1] },
      height: 120,
    },
  ],
};
