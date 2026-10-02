/**
 * P1-2 "샘플링 · 에일리어싱 · AAF · ADC" 본문 그림 데이터 (빌드 시 계산, D-026).
 */
import { grid, type FigAnnotation, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { acquire, aliasFrequency, butterworthGain, quantize } from '../lib/dsp/sampling';
import { evaluate, type SignalComponent } from '../lib/dsp/signal';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';

function curve(components: SignalComponent[], t0: number, t1: number, points = 1200) {
  const t = grid(t0, t1, points);
  return { t, x: t.map((tt) => evaluate({ components }, tt)) };
}
const samples = (components: SignalComponent[], fs: number, n: number) => {
  const s = acquire({ components }, { fs, n });
  return { t: Array.from(s.t), x: Array.from(s.x).map((v) => (Math.abs(v) < 1e-9 ? 0 : v)) };
};

// 그림 1 — 940 Hz와 60 Hz는 샘플이 똑같다 (f_s = 1000 Hz)
const FS1 = 1000;
const TW = 0.03;
const fast = curve([{ type: 'sine', freq: 940, amp: 1 }], 0, TW, 3600);
const slow = curve([{ type: 'sine', freq: 60, amp: 1 }], 0, TW, 600);
const s940 = samples([{ type: 'sine', freq: 940, amp: 1 }], FS1, 31);
const s60 = samples([{ type: 'sine', freq: 60, amp: 1 }], FS1, 31);
export const aliasSamples: FigureSpec = {
  id: 'fig-2-1',
  caption:
    '그림 1. 1초에 1000번(f_s = 1000 Hz) 읽을 때. 위: 940 Hz 신호(회색)는 1 ms 사이에 거의 한 바퀴를 돌아 버려서, 읽은 점(파란 점)들이 느린 60 Hz 물결(주황 점선)을 그린다. 아래: 진짜 60 Hz 신호를 같은 속도로 읽은 점. 두 경우의 점이 완전히 같다 — 분석기는 점만 가지고 있으므로 둘을 구분할 방법이 없다.',
  panels: [
    {
      title: '940 Hz 신호를 1 ms마다 읽으면',
      series: [
        { x: fast.t, y: fast.x, color: 'muted', width: 0.8, opacity: 0.7, label: '실제 신호 940 Hz' },
        { x: slow.t, y: slow.x, color: 'c2', dash: true, width: 2, label: '점이 그리는 60 Hz' },
        { x: s940.t, y: s940.x, kind: 'dots', color: 'c1', radius: 3.6, label: '샘플' },
      ],
      x: { range: [0, TW], ticks: 'none' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
      height: 140,
    },
    {
      title: '진짜 60 Hz 신호를 1 ms마다 읽으면',
      series: [
        { x: slow.t, y: slow.x, color: 'c2', width: 2 },
        { x: s60.t, y: s60.x, kind: 'dots', color: 'c1', radius: 3.6 },
      ],
      x: { range: [0, TW], label: '시간 [s]' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
      height: 130,
    },
  ],
};

// 그림 2 — 접힘 지도: 실제 주파수 → 보이는 주파수
const fGrid = grid(0, 2600, 521);
const examples = [60, 940, 1060, 1940];
export const foldingMap: FigureSpec = {
  id: 'fig-2-2',
  caption:
    '그림 2. f_s = 1000 Hz일 때 실제 주파수(가로)가 스펙트럼에서 몇 Hz로 보이는지(세로). 0 ~ 500 Hz(f_N)는 그대로 보이고, 그보다 높으면 종이를 접듯 지그재그로 0 ~ 500 Hz 안에 접혀 들어온다. 60, 940, 1060, 1940 Hz가 모두 같은 60 Hz 자리에 앉는다.',
  panels: [
    {
      series: [
        { x: fGrid, y: fGrid.map((f) => aliasFrequency(f, FS1)), color: 'c1', width: 2.4 },
        { x: examples, y: examples.map((f) => aliasFrequency(f, FS1)), kind: 'dots', color: 'warn', radius: 5 },
      ],
      annotations: [
        { type: 'band', x1: 0, x2: 500, label: '그대로 보이는 구간', color: 'c3' },
        { type: 'hline', y: 60, label: '모두 60 Hz로 보인다', labelAt: 'end', color: 'warn', dash: true },
        ...examples.map((f): FigAnnotation => ({
          type: 'text',
          x: f,
          y: 60,
          text: `${f} Hz`,
          // 940·1060은 가까워서 왼쪽·오른쪽으로 벌린다
          anchor: f === 940 ? 'end' : f === 1060 ? 'start' : 'middle',
          dx: f === 940 ? -8 : f === 1060 ? 8 : 0,
          dy: -12,
          color: 'warn',
          bold: true,
        })),
      ],
      x: {
        range: [0, 2600],
        ticks: [0, 500, 1000, 1500, 2000, 2500],
        tickLabels: [
          { value: 500, label: '500 (f_N)' },
          { value: 1000, label: '1000 (f_s)' },
          { value: 2000, label: '2000 (2f_s)' },
        ],
        label: '실제 주파수 [Hz]',
      },
      y: { range: [0, 560], ticks: [0, 100, 200, 300, 400, 500], label: '보이는 주파수 [Hz]' },
      height: 230,
    },
  ],
};

// 그림 3 — 나이퀴스트 주파수에서는 위상에 따라 신호가 사라진다
const TN = 0.01;
const nyq0 = curve([{ type: 'sine', freq: 500, amp: 1 }], 0, TN, 600);
const nyq90 = curve([{ type: 'sine', freq: 500, amp: 1, phase: Math.PI / 2 }], 0, TN, 600);
const sNyq0 = samples([{ type: 'sine', freq: 500, amp: 1 }], FS1, 11);
const sNyq90 = samples([{ type: 'sine', freq: 500, amp: 1, phase: Math.PI / 2 }], FS1, 11);
export const nyquistVanish: FigureSpec = {
  id: 'fig-2-3',
  caption:
    '그림 3. 신호가 딱 f_N(= 500 Hz)이면 한 주기에 점이 정확히 2개다. 위: 꼭대기와 바닥에 점이 찍히면 신호가 보인다. 아래: 같은 신호가 90° 어긋나 있으면 점이 모두 0을 지나는 순간에 찍혀 신호가 통째로 사라진다. 그래서 f_N "이하"가 아니라 f_N "미만"이어야 안전하다.',
  panels: [
    {
      title: '위상 0°: 점이 꼭대기·바닥에',
      series: [
        { x: nyq0.t, y: nyq0.x, color: 'muted', width: 1.4 },
        { x: sNyq0.t, y: sNyq0.x, kind: 'dots', color: 'c1', radius: 4 },
      ],
      x: { range: [0, TN], ticks: 'none' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
      height: 110,
    },
    {
      title: '위상 90°: 점이 모두 0 → 신호가 안 보인다',
      series: [
        { x: nyq90.t, y: nyq90.x, color: 'muted', width: 1.4 },
        { x: sNyq90.t, y: sNyq90.x, kind: 'dots', color: 'warn', radius: 4 },
      ],
      x: { range: [0, TN], label: '시간 [s]' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
      height: 125,
    },
  ],
};

// 그림 4 — 실제 필터는 비스듬히 깎는다: F_max, f_N, f_s − F_max
const FMAX = 1000;
const FS = 2.56 * FMAX;
const fF = grid(1, 3000, 600);
const db = (g: number) => Math.max(-90, 20 * Math.log10(Math.max(g, 1e-6)));
export const aafRolloff: FigureSpec = {
  id: 'fig-2-4',
  caption:
    '그림 4. F_max = 1000 Hz, f_s = 2560 Hz인 분석기의 필터(AAF). 실제 필터는 F_max에서 수직으로 끊지 못하고 비스듬히 깎는다(차수가 높을수록 가파르다). 1560 Hz(= f_s − F_max)보다 높은 성분이 남아 있으면 접혀서 화면(0 ~ F_max) 안으로 들어온다. F_max ~ 1560 Hz가 필터가 깎을 시간을 버는 여유 구간이고, 그 앞부분(F_max ~ f_N)은 계산은 하지만 화면에 보여 주지 않는다.',
  panels: [
    {
      series: [
        { x: fF, y: fF.map((f) => db(butterworthGain(f, FMAX, 2))), color: 'c4', width: 1.8, label: '2차' },
        { x: fF, y: fF.map((f) => db(butterworthGain(f, FMAX, 4))), color: 'c2', width: 1.8, label: '4차' },
        { x: fF, y: fF.map((f) => db(butterworthGain(f, FMAX, 8))), color: 'c1', width: 2.4, label: '8차' },
        { x: [0, FMAX, FMAX, 3000], y: [0, 0, -90, -90], color: 'muted', dash: true, width: 1.4, label: '이상적 필터' },
      ],
      annotations: [
        { type: 'band', x1: 0, x2: FMAX, label: '화면에 보이는 구간', color: 'c3' },
        { type: 'band', x1: FMAX, x2: FS - FMAX, label: '여유 구간', color: 'muted' },
        { type: 'band', x1: FS - FMAX, x2: 3000, label: '남으면 접혀 들어오는 구간', color: 'warn' },
        { type: 'vline', x: FS / 2, color: 'muted', dash: true },
      ],
      x: {
        range: [0, 3000],
        ticks: [0, 500, 1000, 1280, 1560, 2000, 2560, 3000],
        tickLabels: [
          { value: 1000, label: 'F_max' },
          { value: 1280, label: 'f_N' },
          { value: 1560, label: '1560' },
          { value: 2560, label: 'f_s' },
        ],
        label: '주파수 [Hz]',
      },
      y: { range: [-90, 8], ticks: [-80, -60, -40, -20, 0], label: '통과량 [dB]' },
      height: 240,
    },
  ],
};

// 그림 5 — AAF가 없을 때와 있을 때
const F_IN = 300;
const F_OUT = 1800;
const F_FAKE = aliasFrequency(F_OUT, FS);
const g8 = butterworthGain(F_OUT, FMAX, 8);
const gIn = butterworthGain(F_IN, FMAX, 8);
const marks: FigAnnotation[] = [
  { type: 'vline', x: FMAX, label: 'F_max', color: 'muted', dash: true },
  { type: 'vline', x: FS / 2, label: 'f_N', color: 'muted', dash: true },
];
const stemPanel = (title: string, pts: { f: number; a: number; color: 'c1' | 'c2' | 'warn' | 'muted'; text: string }[], last: boolean, extra: FigAnnotation[] = []): FigPanel => ({
  title,
  series: pts.map((p) => ({ x: [p.f], y: [p.a], kind: 'stem' as const, color: p.color, width: 3, radius: 4.5 })),
  annotations: [...marks, ...extra, ...pts.map((p): FigAnnotation => ({ type: 'text', x: p.f, y: p.a, text: p.text, anchor: 'middle', dy: -10, color: p.color }))],
  x: last ? { range: [0, 2000], ticks: [0, 300, 500, 760, 1000, 1280, 1500, 1800, 2000], label: '주파수 [Hz]' } : { range: [0, 2000], ticks: 'none' },
  y: { range: [0, 1.45], ticks: [0, 0.5, 1] },
  height: last ? 130 : 105,
});
export const aafEffect: FigureSpec = {
  id: 'fig-2-5',
  caption: `그림 5. F_max = 1000 Hz, f_s = 2560 Hz. 센서 신호에 300 Hz 성분과, 화면 밖인 1800 Hz 성분이 같은 크기로 들어 있다. AAF가 없으면 1800 Hz가 |1800 − 2560| = ${F_FAKE} Hz로 접혀 화면 안에 가짜 막대를 세운다 — 실제로는 없는 주파수다. 8차 AAF를 거치면 1800 Hz 성분이 미리 ${formatNumber(g8, 2)}배(약 1 %)로 깎인 뒤 샘플링되므로 가짜 막대가 거의 보이지 않는다.`,
  panels: [
    stemPanel('센서에 들어온 실제 신호', [
      { f: F_IN, a: 1, color: 'c1', text: '300 Hz' },
      { f: F_OUT, a: 1, color: 'c2', text: '1800 Hz (화면 밖)' },
    ], false),
    stemPanel('AAF 없이 샘플링한 스펙트럼', [
      { f: F_IN, a: 1, color: 'c1', text: '300 Hz' },
      { f: F_FAKE, a: 1, color: 'warn', text: `가짜 ${F_FAKE} Hz` },
    ], false, [{ type: 'band', x1: FS / 2, x2: 2000, color: 'muted' }]),
    stemPanel('8차 AAF를 거친 뒤 샘플링', [
      { f: F_IN, a: gIn, color: 'c1', text: '300 Hz' },
      { f: F_FAKE, a: g8, color: 'warn', text: `${F_FAKE} Hz: ${formatNumber(g8, 2)}` },
    ], true, [{ type: 'band', x1: FS / 2, x2: 2000, color: 'muted' }]),
  ],
};

// 그림 6 — 400 라인은 어디서 나왔나
const linePanel = (n: number, last: boolean): FigPanel => {
  const bins = n / 2;
  const lor = n / 2.56;
  return {
    title: `N = ${n} → bin ${bins}개 중 ${lor}개만 화면에`,
    series: [],
    annotations: [
      { type: 'rect', x1: 0, x2: lor, y1: 0, y2: 1, label: `보이는 ${lor} 라인 (0 ~ F_max)`, color: 'c3' },
      { type: 'rect', x1: lor, x2: bins, y1: 0, y2: 1, label: `버림 ${bins - lor}`, color: 'muted' },
    ],
    x: last
      ? { range: [0, 1024], ticks: [0, 400, 512, 800, 1024], label: 'bin 번호 (오른쪽 끝 = f_N)' }
      : { range: [0, 1024], ticks: [0, 400, 512] },
    y: { range: [0, 1], ticks: 'none' },
    height: last ? 85 : 65,
  };
};
export const lorLines: FigureSpec = {
  id: 'fig-2-6',
  caption:
    '그림 6. N개 샘플을 FFT하면 0 ~ f_N 사이에 bin이 N/2개 나온다. f_s = 2.56 F_max라서 f_N = 1.28 F_max이므로, 앞쪽 N/2 ÷ 1.28 = N/2.56개만 0 ~ F_max에 해당한다. 분석기는 이 개수를 라인 수(LOR)로 표시하고 나머지는 버린다. 1024 → 400 라인, 2048 → 800 라인.',
  panels: [linePanel(1024, false), linePanel(2048, true)],
};

// 그림 7 — 양자화 계단과 레인지
const TQ = 0.02;
const QBITS = 3;
const qDense = (amp: number) => {
  const s = acquire({ components: [{ type: 'sine', freq: 50, amp }] }, { fs: 60000, n: 1201 });
  const q = quantize(s.x, { bits: QBITS, range: 1 });
  return { t: Array.from(s.t), x: Array.from(s.x), y: Array.from(q.y), lsb: q.lsb };
};
const qGood = qDense(0.7);
const qSmall = qDense(0.2);
const levelTicks = grid(-1, 0.75, 8);
const quantPanel = (d: ReturnType<typeof qDense>, title: string, last: boolean, extra: FigAnnotation[] = []): FigPanel => ({
  title,
  series: [
    { x: d.t, y: d.x, color: 'muted', dash: true, width: 1.4, label: '원래 신호' },
    { x: d.t, y: d.y, color: 'c1', width: 2.2, label: '저장된 값' },
  ],
  annotations: extra,
  x: last ? { range: [0, TQ], label: '시간 [s]' } : { range: [0, TQ], ticks: 'none' },
  y: { range: [-1.05, 1.05], ticks: levelTicks },
  height: last ? 150 : 135,
  legend: !last,
});
export const quantSteps: FigureSpec = {
  id: 'fig-2-7',
  caption: `그림 7. 3 bit ADC(레인지 ±1 V)는 전압을 8칸(2³)으로만 나눠 적는다. 한 칸의 높이가 1 LSB = 2 V / 8 = ${formatNumber(qGood.lsb, 3)} V이고, 실제 값과 저장된 값의 차이(최대 ±½ LSB)가 양자화 잡음이다. 위: 신호가 레인지를 넉넉히 쓰면 8칸 중 7칸을 쓴다. 아래: 신호가 레인지보다 5배 작으면 3칸만 써서 모양이 크게 뭉개진다. 실제 분석기는 16 ~ 24 bit(6만 ~ 1600만 칸)라 훨씬 촘촘하지만 원리는 같다.`,
  panels: [
    quantPanel(qGood, '신호 0.7 V, 레인지 ±1 V: 칸을 넉넉히 쓴다', false, [
      { type: 'arrow', x1: 0.0185, y1: 0.25, x2: 0.0185, y2: 0.5, double: true, label: '1 LSB', labelDx: -1, color: 'warn' },
    ]),
    quantPanel(qSmall, '신호 0.2 V, 레인지 ±1 V: 3칸만 쓴다', true),
  ],
};

// 그림 8 — 클리핑이 만드는 가짜 하모닉
const FSC = 6400;
const NC = 1024; // Δf = 6.25 Hz → 50 Hz = 8번째 bin
const raw = acquire({ components: [{ type: 'sine', freq: 50, amp: 1 }] }, { fs: FSC, n: NC });
const clipped = quantize(raw.x, { bits: 16, range: 0.7 });
const clipSpec = singleSidedSpectrum({ fs: FSC, x: clipped.y });
const harmonics = [1, 3, 5, 7, 9].map((h) => {
  const k = Math.round((h * 50) / clipSpec.binSpacing);
  return { h, f: clipSpec.frequency[k], a: clipSpec.amplitude[k] };
});
const TC = 0.04;
const showN = Math.round(TC * FSC);
export const clippingFigure: FigureSpec = {
  id: 'fig-2-8',
  caption: `그림 8. 진폭 1 V인 50 Hz 정현파를 레인지 ±0.7 V로 받으면 꼭대기와 바닥이 잘린다(클리핑). 잘린 파형은 사각파에 가까워지므로(P1-1 §1.2) 기계에 없던 홀수 하모닉 — 150 Hz(${formatNumber(harmonics[1].a, 2)}), 250 Hz(${formatNumber(harmonics[2].a, 2)}) … — 이 스펙트럼에 생긴다. 측정 과정이 만든 가짜이므로 시간파형에서 잘린 모양을 먼저 확인한다.`,
  panels: [
    {
      title: '시간파형: 레인지(±0.7 V)에서 잘림',
      series: [
        { x: Array.from(raw.t.slice(0, showN)), y: Array.from(raw.x.slice(0, showN)), color: 'muted', dash: true, width: 1.4, label: '원래 신호' },
        { x: Array.from(raw.t.slice(0, showN)), y: Array.from(clipped.y.slice(0, showN)), color: 'c1', width: 2.2, label: '저장된 신호' },
      ],
      annotations: [
        { type: 'hline', y: 0.7, label: '+0.7 V', labelAt: 'end', color: 'warn', dash: true },
        { type: 'hline', y: -0.7, label: '−0.7 V', labelAt: 'end', labelBelow: true, color: 'warn', dash: true },
      ],
      x: { range: [0, TC], label: '시간 [s]' },
      y: { range: [-1.15, 1.15], ticks: [-1, -0.5, 0, 0.5, 1] },
      height: 160,
    },
    {
      title: '스펙트럼: 홀수 하모닉이 생긴다',
      series: [{ x: harmonics.map((p) => p.f), y: harmonics.map((p) => p.a), kind: 'stem', color: 'c2', width: 3, radius: 4.5 }],
      annotations: harmonics.map((p): FigAnnotation => ({ type: 'text', x: p.f, y: p.a, text: p.h === 1 ? `50 Hz ${formatNumber(p.a, 2)}` : `${p.h}X ${formatNumber(p.a, 2)}`, anchor: 'middle', dy: -10, color: p.h === 1 ? 'c1' : 'c2' })),
      x: { range: [0, 500], ticks: [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500], label: '주파수 [Hz]' },
      y: { range: [0, 1.1], ticks: [0, 0.25, 0.5, 0.75, 1] },
      height: 160,
    },
  ],
};
