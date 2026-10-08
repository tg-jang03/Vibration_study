/**
 * P5-4 "차수추적" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호와 분석은 랩(LAB-ORD-01)과 같은 `lib/orderDemo.ts`, 재샘플링은 `lib/dsp/order.ts`.
 */
import type { FigAnnotation, FigSeries, FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { interpolateAt, timesAtRevs } from '../lib/dsp/order';
import { analyzeOrder, DEFAULT_ORDER_PARAMS as D, ORD, orderRun } from '../lib/orderDemo';

const fmt = formatNumber;
const um = 1e6;
const toUm = (a: ArrayLike<number>) => Array.from(a, (v) => v * um);
const upTo = (xs: ArrayLike<number>, ys: ArrayLike<number>, xMax: number, xMin = 0) => {
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < xs.length; i++) if (xs[i] >= xMin && xs[i] <= xMax) { x.push(xs[i]); y.push(ys[i]); }
  return { x, y };
};

const base = analyzeOrder(D);
const steady = analyzeOrder({ ...D, rate: 0 });
const spr32raw = analyzeOrder({ ...D, spr: 32, antiAlias: false });
const spr32aa = analyzeOrder({ ...D, spr: 32, antiAlias: true });
const lin = analyzeOrder({ ...D, interp: 'linear' });
const tacho = analyzeOrder({ ...D, reference: 'tacholess' });
const tachoSteady = analyzeOrder({ ...D, reference: 'tacholess', rate: 0 });
const amp9 = (a: typeof base) => a.spectrum.amplitude[Math.round(9 / a.deltaOrder)];
const maxIn = (a: typeof base, lo: number, hi: number) => {
  let m = 0;
  a.spectrum.order.forEach((o, i) => { if (o >= lo && o <= hi) m = Math.max(m, a.spectrum.amplitude[i]); });
  return m;
};

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p5-4.test.ts`) */
export const P54_VALUES = {
  base,
  steady,
  spr32raw,
  spr32aa,
  lin,
  tacho,
  tachoSteady,
  /** 키페이저 없음: 22.5 ~ 23.5차 안에서 가장 높은 칸 (23.00차 칸 대신 이웃으로 흩어진 곳) */
  tachoHighMax: maxIn(tacho, 22.5, 23.5),
  alias9raw: amp9(spr32raw),
  alias9aa: amp9(spr32aa),
  fixedOrderLo: ORD.fixedHz / (base.rpmEnd / 60),
  fixedOrderHi: ORD.fixedHz / (base.rpmStart / 60),
};
const V = P54_VALUES;

// 그림 2 — 계산 순서 (설명용: 4 Hz에서 1초에 8 Hz/s로 빨라지는 축)
const demo = (() => {
  const f0 = 4;
  const a = 8;
  const fs = 400;
  const revAt = (t: number) => f0 * t + (a * t * t) / 2;
  const tAt = (r: number) => (-f0 + Math.sqrt(f0 * f0 + 2 * a * r)) / a;
  const n = fs + 1;
  const t = Float64Array.from({ length: n }, (_, i) => i / fs);
  const x = t.map((tt) => Math.cos(2 * Math.PI * revAt(tt)) + 0.35 * Math.cos(4 * Math.PI * revAt(tt) + 0.6));
  const pulses = Float64Array.from({ length: Math.floor(revAt(1)) + 1 }, (_, k) => tAt(k));
  const spr = 8;
  const revs = Float64Array.from({ length: (pulses.length - 1) * spr + 1 }, (_, j) => j / spr);
  const tt = timesAtRevs(pulses, revs, 'quadratic');
  const y = interpolateAt(x, fs, tt, 'cubic');
  return { t, x, pulses, revs, tt, y, revAt, spr };
})();
const pulseLines = (top: number): FigAnnotation[] => Array.from(demo.pulses, (p) => ({ type: 'line', x1: p, y1: -top, x2: p, y2: top, color: 'warn', dash: true, width: 1 }) as FigAnnotation);
export const pipeline: FigureSpec = {
  id: 'fig-p5-4-2',
  caption: `그림 2. 계산형 차수추적의 순서 (설명용: 4 Hz에서 출발해 1초에 8 Hz씩 빨라지는 축, 1X + 2X). 위: 고정 f_s로 기록한 파형과 키페이저 시각(주황 점선) — 축이 빨라질수록 펄스 사이가 좁아진다. 가운데: 키페이저 시각마다 각도가 한 바퀴씩 늘어난다는 것으로 각도-시간 곡선(파랑)을 만들고, 한 바퀴를 ${demo.spr}등분한 각도마다 그 시각을 곡선에서 읽는다(초록 점). 아래: 그 시각에서 파형을 보간한 값을 각도 순서로 늘어놓으면 — 빨라지는 동안에도 한 바퀴마다 같은 모양이 되풀이된다.`,
  panels: [
    {
      title: '① 고정 f_s 파형과 키페이저',
      series: [{ x: demo.t, y: demo.x, color: 'c1', width: 1.6 }],
      annotations: pulseLines(1.5),
      x: { range: [0, 1], label: '시각 [s]' },
      y: { range: [-1.6, 1.6], ticks: 'none' },
      height: 110,
    },
    {
      title: '② 각도-시간 관계 → 등각도의 시각',
      series: [
        { x: demo.t, y: demo.t.map(demo.revAt), color: 'c1', width: 2 },
        { x: demo.pulses, y: demo.pulses.map((_, k) => k), kind: 'dots', color: 'warn', radius: 4 },
        { x: demo.tt, y: demo.revs, kind: 'dots', color: 'c3', radius: 2.2 },
      ],
      annotations: [],
      x: { range: [0, 1], label: '시각 [s]' },
      y: { range: [0, 8.5], ticks: [0, 2, 4, 6, 8], label: '각도 [바퀴]' },
      height: 150,
    },
    {
      title: '③ 등각도 표본 (가로축 = 각도)',
      series: [{ x: demo.revs, y: demo.y, kind: 'dots', color: 'c3', radius: 2.4 }, { x: demo.revs, y: demo.y, color: 'c3', width: 1, dash: true }],
      annotations: Array.from({ length: 8 }, (_, k) => ({ type: 'vline', x: k + 1, color: 'warn', dash: true }) as FigAnnotation),
      x: { range: [0, 8], ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8], label: '각도 [바퀴]' },
      y: { range: [-1.6, 1.6], ticks: 'none' },
      height: 110,
    },
  ],
};

// 그림 1 — 같은 프레임, 시간 FFT vs 차수 스펙트럼
const tf = upTo(base.timeFreq, base.timeAmp, 150);
const os = upTo(base.spectrum.order, base.spectrum.amplitude, 5);
export const timeVsOrder: FigureSpec = {
  id: 'fig-p5-4-1',
  caption: `그림 1. 같은 프레임(${D.revs}바퀴, ${fmt(base.tEnd - base.tStart, 3)} s 동안 ${fmt(base.rpmStart, 4)} → ${fmt(base.rpmEnd, 4)} rpm, 가속 ${D.rate} rpm/s)을 두 가지로 본다. 위: 고정 f_s 그대로 Hann FFT — 1X·2X가 프레임 동안 움직여 번지고 봉우리가 낮다(1X ${fmt(base.timePeak1 * um, 3)} µm, 참값 ${fmt(ORD.a1 * um, 2)} µm). 고정 ${ORD.fixedHz} Hz 성분은 또렷하다. 아래: 키페이저로 각도에 맞춰 다시 찍은 차수 스펙트럼 — 1X ${fmt(base.amp1 * um, 3)} µm, 2X ${fmt(base.amp2 * um, 3)} µm로 또렷하고, 이번에는 고정 ${ORD.fixedHz} Hz가 차수 ${fmt(V.fixedOrderLo, 3)} ~ ${fmt(V.fixedOrderHi, 3)}에 걸쳐 번진다.`,
  panels: [
    {
      title: '시간 기반 FFT (가로축 Hz)',
      series: [{ x: tf.x, y: toUm(tf.y), color: 'c2', width: 1.6 }],
      annotations: [
        { type: 'band', x1: base.rpmStart / 60, x2: base.rpmEnd / 60, color: 'muted', label: '1X가 움직인 범위' },
        { type: 'band', x1: (2 * base.rpmStart) / 60, x2: (2 * base.rpmEnd) / 60, color: 'muted', label: '2X' },
        { type: 'text', x: ORD.fixedHz, y: ORD.aFixed * um + 1.5, text: `고정 ${ORD.fixedHz} Hz`, anchor: 'middle', color: 'c2' },
      ],
      x: { range: [0, 150], label: '주파수 [Hz]' },
      y: { range: [0, 28], ticks: [0, 5, 10, 15, 20, 25], label: '[µm]' },
      height: 150,
    },
    {
      title: '차수 스펙트럼 (가로축 = 차수)',
      series: [{ x: os.x, y: toUm(os.y), color: 'c1', width: 1.6 }],
      annotations: [
        { type: 'band', x1: V.fixedOrderLo, x2: V.fixedOrderHi, color: 'muted', label: `고정 ${ORD.fixedHz} Hz가 번진 곳` },
        { type: 'text', x: 1, y: base.amp1 * um + 1.2, text: '1X', anchor: 'middle', color: 'c1' },
        { type: 'text', x: 2, y: base.amp2 * um + 1.2, text: '2X', anchor: 'middle', color: 'c1' },
      ],
      x: { range: [0, 5], ticks: [0, 1, 2, 3, 4, 5], label: '차수 (1X의 몇 배)' },
      y: { range: [0, 28], ticks: [0, 5, 10, 15, 20, 25], label: '[µm]' },
      height: 150,
    },
  ],
};

// 그림 3 — 재샘플링도 샘플링이다: 차수 영역의 에일리어싱
const orderPanel = (a: typeof base, title: string, color: 'c1' | 'c2' | 'c3', extra: FigAnnotation[] = []) => {
  const half = a.params.spr / 2;
  const d = upTo(a.spectrum.order, a.spectrum.amplitude, half);
  const unseen: FigAnnotation[] = half < 32 ? [{ type: 'band', x1: half, x2: 32, color: 'muted', label: `${a.params.spr}점으로는 볼 수 없는 차수` }] : [];
  return {
    title: `${title} (최대 차수 ${fmt(a.orderMax, 3)}, 회색 점선)`,
    series: [{ x: d.x, y: toUm(d.y), color, width: 1.6 }] as FigSeries[],
    annotations: [...unseen, { type: 'vline', x: a.orderMax, color: 'muted', dash: true } as FigAnnotation, ...extra],
    x: { range: [0, 32] as [number, number], ticks: [0, 4, 8, 12, 16, 20, 24, 28, 32], label: '차수' },
    y: { range: [0, 6] as [number, number], ticks: [0, 2, 4, 6], label: '[µm]' },
    height: 110,
  };
};
export const orderAliasing: FigureSpec = {
  id: 'fig-p5-4-3',
  caption: `그림 3. 23X(${fmt(ORD.aHigh * um, 2)} µm, 날개 통과 예시)가 들어 있는 신호를 회전당 샘플 수를 바꿔 차수추적했다 (1X·2X는 위로 잘려 있다). 위: 회전당 64점 — 최대 차수 ${fmt(V.base.orderMax, 3)} 안이라 23X가 제자리에 ${fmt(V.base.ampHigh * um, 3)} µm로 선다. 가운데: 회전당 32점으로 바로 찍으면 차수 16을 넘는 23X가 32 − 23 = 9X로 접혀 ${fmt(V.alias9raw * um, 3)} µm짜리 가짜 줄이 선다 — 재샘플링도 샘플링이다 (P2-3). 아래: 회전당 256점으로 넉넉히 찍은 뒤 차수 영역에서 저역 통과하고 솎으면 가짜 9X가 사라진다(${fmt(V.alias9aa * um, 1)} µm).`,
  panels: [
    orderPanel(V.base, '회전당 64점', 'c1', [{ type: 'text', x: ORD.highOrder, y: V.base.ampHigh * um + 0.7, text: '23X', anchor: 'middle', color: 'c1' }]),
    orderPanel(V.spr32raw, '회전당 32점, 바로 찍음', 'c2', [
      { type: 'vline', x: 16, color: 'warn', dash: true, label: '접히는 곳 16' },
      { type: 'text', x: 9, y: V.alias9raw * um + 0.7, text: '가짜 9X', anchor: 'middle', color: 'c2' },
    ]),
    orderPanel(V.spr32aa, '회전당 32점, 넉넉히 찍고 거른 뒤 솎음', 'c3'),
  ],
};

// 그림 4 — 보간 오차
const ratios = (a: typeof base) => [a.amp1 / ORD.a1, a.amp2 / ORD.a2, a.ampHigh / ORD.aHigh].map((r) => (1 - r) * 100);
const linLoss = ratios(V.lin);
const cubLoss = ratios(V.base);
export const interpolationLoss: FigureSpec = {
  id: 'fig-p5-4-4',
  caption: `그림 4. 등각도 시각의 값을 고정 f_s 표본 사이에서 보간할 때 생기는 진폭 손실 (참값 대비 %). 1X·2X는 f_s ${ORD.fs} Hz에 비해 느려서 두 방법 모두 거의 손실이 없다. 23X(약 ${fmt((ORD.highOrder * base.rpmStart) / 60, 3)} ~ ${fmt((ORD.highOrder * base.rpmEnd) / 60, 3)} Hz)는 표본 사이에서 크게 출렁여 선형 보간(주황)이 ${fmt(linLoss[2], 2)} %, 3차 보간(파랑)이 ${fmt(cubLoss[2], 2)} % 작게 읽는다(막대에는 차수 영역 에일리어싱 방지 필터의 몫 약 0.1 %도 들어 있다). 높은 차수를 볼수록 보간을 촘촘히(높은 f_s, 3차 이상) 해야 한다.`,
  panels: [
    {
      series: [
        { x: [0.85, 1.85, 2.85], y: linLoss, kind: 'bar', barWidth: 0.28, color: 'c2', label: '선형 보간' },
        { x: [1.15, 2.15, 3.15], y: cubLoss, kind: 'bar', barWidth: 0.28, color: 'c1', label: '3차 보간' },
      ],
      annotations: [],
      x: { range: [0.4, 3.6], ticks: [1, 2, 3], tickLabels: [{ value: 1, label: '1X' }, { value: 2, label: '2X' }, { value: 3, label: '23X' }] },
      y: { range: [0, 10], ticks: [0, 2, 4, 6, 8, 10], label: '진폭 손실 [%]' },
      height: 150,
      legend: true,
    },
  ],
};

// 그림 5 — 키페이저 없이 (tacholess)
const run = orderRun(D.rate);
const rt = Array.from(V.tacho.ridgeTimes ?? []);
const rh = Array.from(V.tacho.ridgeHz ?? []);
const inFrame = rt.map((t, m) => ({ t, err: rh[m] * 60 - run.rpmAt(t) })).filter((p) => p.t >= V.tacho.tStart && p.t <= V.tacho.tEnd);
const near1 = (a: typeof base) => upTo(a.spectrum.order, a.spectrum.amplitude, 1.3, 0.7);
const near23 = (a: typeof base) => upTo(a.spectrum.order, a.spectrum.amplitude, 24, 22);
export const tacholess: FigureSpec = {
  id: 'fig-p5-4-5',
  caption: `그림 5. 키페이저 없이 차수추적하기. 위: 스펙트로그램(P5-2)에서 프레임마다 가장 큰 봉우리(1X)의 주파수를 읽은 능선과 실제 회전수의 차 — 프레임 안에서 최대 ${fmt(V.tacho.ridgeErrRpm ?? 0, 2)} rpm 어긋난다. 이 주파수를 적분해 각도를 만들고 같은 방법으로 재샘플링한다. 가운데: 1X는 키페이저(파랑) ${fmt(base.amp1 * um, 3)} µm, 능선(주황) ${fmt(V.tacho.amp1 * um, 3)} µm로 거의 같다. 아래: 23X는 각도 오차가 23배로 커져 능선 쪽이 번진다 — 23.00차 칸은 ${fmt(V.tacho.ampHigh * um, 2)} µm로 낮아지고, 나머지는 이웃 칸으로 흩어진다(가장 높은 칸 ${fmt(V.tachoHighMax * um, 2)} µm). 각도의 시작점도 알 수 없어 위상은 읽을 수 없다.`,
  panels: [
    {
      title: '능선으로 읽은 회전수 − 실제 회전수',
      series: [{ x: inFrame.map((p) => p.t - V.tacho.tStart), y: inFrame.map((p) => p.err), kind: 'dots', color: 'c2', radius: 2.6 }],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, V.tacho.tEnd - V.tacho.tStart], label: '프레임 안 시각 [s]' },
      y: { range: [-6, 6], ticks: [-6, -3, 0, 3, 6], label: '[rpm]' },
      height: 110,
    },
    {
      title: '1X 근처',
      series: [
        { ...(() => { const d = near1(base); return { x: d.x, y: toUm(d.y) }; })(), color: 'c1', width: 2, label: '키페이저' },
        { ...(() => { const d = near1(V.tacho); return { x: d.x, y: toUm(d.y) }; })(), color: 'c2', width: 1.6, dash: true, label: '능선 (키페이저 없음)' },
      ],
      annotations: [],
      x: { range: [0.7, 1.3], label: '차수' },
      y: { range: [0, 28], ticks: [0, 10, 20], label: '[µm]' },
      height: 110,
      legend: true,
    },
    {
      title: '23X 근처',
      series: [
        { ...(() => { const d = near23(base); return { x: d.x, y: toUm(d.y) }; })(), color: 'c1', width: 2 },
        { ...(() => { const d = near23(V.tacho); return { x: d.x, y: toUm(d.y) }; })(), color: 'c2', width: 1.6, dash: true },
      ],
      annotations: [],
      x: { range: [22, 24], label: '차수' },
      y: { range: [0, 3.5], ticks: [0, 1, 2, 3], label: '[µm]' },
      height: 110,
    },
  ],
};
