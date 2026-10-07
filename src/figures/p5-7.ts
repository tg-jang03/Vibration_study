/**
 * P5-7 "켑스트럼 · 자기상관 · 특징량" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호는 랩(LAB-CEP-01 · LAB-FEAT-01)과 같은 `lib/cepstrumDemo.ts`, 계산은 `lib/dsp/cepstrum.ts`·`lib/dsp/stats.ts`.
 * 자기상관의 주기 찾기는 P5-6의 베어링 신호(`lib/envelopeDemo.ts`)를 다시 쓴다.
 */
import type { FigAnnotation, FigColor, FigSeries, FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { autocorrelation } from '../lib/dsp/cepstrum';
import { createRng } from '../lib/dsp/random';
import { analyzeGear, DEFAULT_GEAR as D, F2, featureSignal, features, featureTrend, GEAR, MESH, G } from '../lib/cepstrumDemo';
import { analyzeEnvelope, BRG, DEFAULT_ENV_SIGNAL, envSignal, ENV } from '../lib/envelopeDemo';

const fmt = formatNumber;
const g = (v: number) => v / G;
const dB = (v: number) => 20 * Math.log10(Math.max(v / G, 1e-6));
const T1 = 1 / GEAR.f1;
const T2 = 1 / F2;

const base = analyzeGear(D);
const pinionCut = analyzeGear(D, 'pinion');
const lowCut = analyzeGear(D, 'low');

// 자기상관으로 주기 찾기: P5-6 베어링 신호의 포락선 (2800 ~ 3800 Hz)
const envAcf = (() => {
  const a = analyzeEnvelope(envSignal(DEFAULT_ENV_SIGNAL), 2800, 3800);
  const r = autocorrelation(a.env.envelope);
  const lagMax = Math.round(0.03 * ENV.fs);
  const lags = Array.from({ length: lagMax }, (_, i) => (i / ENV.fs) * 1000);
  // 0 근처를 지나 첫 봉우리
  let i0 = Math.round(0.002 * ENV.fs);
  for (let i = i0; i < lagMax; i++) if (r[i] > r[i0]) i0 = i;
  return { lags, r: Array.from(r.slice(0, lagMax)), firstPeakMs: (i0 / ENV.fs) * 1000, firstPeakR: r[i0] };
})();

// 특징량 비교: RMS = 1인 네 신호
const SHAPES = (() => {
  const n = 4096;
  const fs = 8192;
  const rng = createRng(29);
  const t = Array.from({ length: n }, (_, i) => i / fs);
  const norm = (x: number[]) => {
    const m = x.reduce((s, v) => s + v, 0) / x.length;
    const r = Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length);
    return x.map((v) => (v - m) / r);
  };
  const sine = norm(t.map((v) => Math.sin(2 * Math.PI * 100 * v)));
  const noise = norm(t.map(() => rng.normal()));
  const imp = new Array(n).fill(0);
  for (let k = 0; k * 0.04 < n / fs; k++) {
    const i0 = Math.round(k * 0.04 * fs);
    for (let i = i0; i < Math.min(n, i0 + 200); i++) {
      const tau = (i - i0) / fs;
      imp[i] += Math.exp(-0.05 * 2 * Math.PI * 1000 * tau) * Math.sin(2 * Math.PI * 1000 * tau);
    }
  }
  const impulses = norm(imp);
  // 위쪽만 눌린 파형: 위로 갈 때만 0.3에서 막힌다
  const flat = norm(t.map((v) => Math.min(Math.sin(2 * Math.PI * 100 * v), 0.3)));
  const list = [
    { name: '정현파', y: sine, color: 'c1' as FigColor },
    { name: '정규분포 잡음', y: noise, color: 'muted' as FigColor },
    { name: '드문 충격', y: impulses, color: 'c2' as FigColor },
    { name: '위쪽이 눌린 정현파', y: flat, color: 'c4' as FigColor },
  ];
  return { t, list: list.map((s) => ({ ...s, f: features(s.y) })) };
})();

const trend = featureTrend();
const stageAt = (s: number) => featureSignal(s).features;

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p5-7.test.ts`) */
export const P57_VALUES = {
  mesh: MESH,
  f2: F2,
  base,
  pinionCut,
  lowCut,
  envAcf,
  shapes: SHAPES.list.map((s) => ({ name: s.name, ...s.f })),
  healthy: stageAt(0),
  early: stageAt(0.3),
  mid: stageAt(0.55),
  late: stageAt(1),
  trend,
};
const V = P57_VALUES;

// ── 그림 1: 줄 무리가 섞인 스펙트럼 ──
const zoom = (a: ArrayLike<number>, f1: number, f2: number) => {
  const x: number[] = [];
  const y: number[] = [];
  base.cep.freq.forEach((f, k) => {
    if (f >= f1 && f <= f2) {
      x.push(f);
      y.push(dB(a[k]));
    }
  });
  return { x, y };
};
const full = zoom(base.cep.amp, 0, 2048);
const z = zoom(base.cep.amp, 500, 700);
const sbMarks = (f: number, color: FigColor, k: number[]): FigAnnotation[] =>
  k.map((i) => ({ type: 'point', x: MESH + i * f, y: -8, color }) as FigAnnotation);
export const familySpectrum: FigureSpec = {
  id: 'fig-p5-7-1',
  caption: `그림 1. 기어 상자 가속도의 스펙트럼 (설명용: 피니언 24이빨 ${GEAR.f1 * 60} rpm = ${GEAR.f1} Hz, 기어 37이빨 ${fmt(F2, 4)} Hz, 맞물림 ${MESH} Hz). 위: 맞물림 1·2·3배 둘레에 측대역이 빽빽하다. 아래: ${MESH} Hz 둘레를 확대했다. 피니언의 결함은 ${GEAR.f1} Hz 간격(파랑 점), 기어의 결함은 ${fmt(F2, 4)} Hz 간격(초록 점)의 측대역을 세우는데, 두 무리가 섞여 눈으로 간격을 세기 어렵다.`,
  panels: [
    {
      title: '① 0 ~ 2 kHz (dB re 1 g)',
      series: [{ x: full.x, y: full.y, color: 'c1', width: 1 }],
      x: { range: [0, 2048], ticks: [0, 600, 1200, 1800], label: '주파수 [Hz]' },
      y: { range: [-90, 10], ticks: [-80, -60, -40, -20, 0], label: '[dB]' },
      height: 120,
    },
    {
      title: `② ${MESH} Hz 둘레 확대`,
      series: [{ x: z.x, y: z.y, color: 'c1', width: 1.2 }],
      annotations: [...sbMarks(GEAR.f1, 'c1', [-4, -3, -2, -1, 1, 2, 3, 4]), ...sbMarks(F2, 'c3', [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])],
      x: { range: [500, 700], ticks: [500, 550, 600, 650, 700], label: '주파수 [Hz]' },
      y: { range: [-90, 10], ticks: [-80, -60, -40, -20, 0], label: '[dB]' },
      height: 140,
    },
  ],
};

// ── 그림 2: 켑스트럼 ──
const cq: number[] = [];
const cv: number[] = [];
base.cep.quefrency.forEach((q, i) => {
  if (q >= 0.002 && q <= 0.25) {
    cq.push(q * 1000);
    cv.push(base.cep.c[i]);
  }
});
const rah = (T: number, color: FigColor, kMax: number, label: string): FigAnnotation[] =>
  Array.from({ length: kMax }, (_, i) => ({ type: 'vline', x: (i + 1) * T * 1000, color, dash: true, label: i === 0 ? label : undefined }) as FigAnnotation);
export const cepstrumFig: FigureSpec = {
  id: 'fig-p5-7-2',
  caption: `그림 2. 같은 신호의 켑스트럼 — 스펙트럼의 로그를 한 번 더 푸리에 변환한 것으로, 가로축은 시간 단위의 quefrency다. ${GEAR.f1} Hz 간격의 무리는 1/${GEAR.f1} = ${fmt(T1 * 1000, 3)} ms에 봉우리(${fmt(base.peak1, 2)})를 세우고 그 정수배(80, 120 … ms, 라모닉)에도 선다. ${fmt(F2, 4)} Hz 간격의 무리는 ${fmt(T2 * 1000, 3)} ms(${fmt(base.peak2, 2)})에 선다. 스펙트럼에서 섞여 있던 두 간격이 서로 다른 자리로 나뉜다.`,
  panels: [
    {
      series: [{ x: cq, y: cv, color: 'c1', width: 1.2 }],
      annotations: [...rah(T1, 'c1', 6, `${fmt(T1 * 1000, 3)} ms`), ...rah(T2, 'c3', 4, `${fmt(T2 * 1000, 3)} ms`)],
      x: { range: [0, 250], ticks: [0, 40, 80, 120, 160, 200, 250], label: 'quefrency [ms]' },
      y: { range: [-0.04, 0.09], ticks: [-0.04, 0, 0.04, 0.08], label: 'c(τ)' },
      height: 150,
    },
  ],
};

// ── 그림 3: 자기상관은 큰 성분에 덮인다 ──
const acfLag: number[] = [];
const acfV: number[] = [];
for (let i = 0; i < Math.round(0.1 * GEAR.fs); i++) {
  acfLag.push((i / GEAR.fs) * 1000);
  acfV.push(base.acf[i]);
}
export const acfVsCepstrum: FigureSpec = {
  id: 'fig-p5-7-3',
  caption: `그림 3. 같은 기어 신호의 자기상관(신호를 지연시켜 자기 자신과 곱해 평균한 것). 맞물림 ${MESH} Hz가 신호의 대부분이라 ${fmt(1000 / MESH, 3)} ms마다 거의 1로 되돌아오며, 40 ms(${fmt(base.acf[Math.round(T1 * GEAR.fs)], 3)})가 20 ms(${fmt(base.acf[Math.round(0.02 * GEAR.fs)], 3)})보다 두드러지지 않는다. 자기상관은 크기가 큰 성분의 주기를 보이고, 켑스트럼은 로그로 크기 차이를 눌러 작은 측대역 무리의 간격까지 보인다.`,
  panels: [
    {
      series: [{ x: acfLag, y: acfV, color: 'c4', width: 0.8 }],
      annotations: [
        { type: 'vline', x: 40, color: 'muted', dash: true, label: '40 ms' },
        { type: 'vline', x: T2 * 1000, color: 'muted', dash: true, label: `${fmt(T2 * 1000, 3)} ms` },
      ],
      x: { range: [0, 100], ticks: [0, 20, 40, 60, 80, 100], label: '지연 τ [ms]' },
      y: { range: [-1.1, 1.1], ticks: [-1, 0, 1], label: 'R(τ)' },
      height: 130,
    },
  ],
};

// ── 그림 4: 리프터링 ──
const zEd = zoom(pinionCut.edited, 500, 700);
const fullLow = zoom(lowCut.edited, 0, 2048);
export const lifterFig: FigureSpec = {
  id: 'fig-p5-7-4',
  caption: `그림 4. 리프터링: 켑스트럼의 일부를 지우고 스펙트럼으로 되돌린다. 위: ${fmt(T1 * 1000, 3)} ms와 그 정수배를 지운 스펙트럼 — 그림 1 아래와 비교하면 피니언 무리(파랑 점 자리)의 측대역이 사라졌다(${MESH + GEAR.f1} Hz에서 ${fmt(dB(pinionCut.sb1[0]) - dB(pinionCut.sb1[1]), 3)} dB 낮아짐). 기어 무리(초록 점 자리)는 남는다. 아래: 5 ms보다 짧은 quefrency만 남기면(초록) 줄이 모두 사라지고 매끈한 바닥 모양만 남는다. 이 예시에는 구조 공진을 넣지 않아 거의 평평하지만, 실제 기계에서는 전달 경로·공진이 키우는 대역이 이 모양으로 드러난다 — 줄의 간격(원인)과 스펙트럼의 모양(전달 경로)을 나누는 생각이다.`,
  panels: [
    {
      title: `① ${fmt(T1 * 1000, 3)} ms와 그 정수배를 지운 뒤 (${MESH} Hz 둘레)`,
      series: [{ x: zEd.x, y: zEd.y, color: 'c1', width: 1.2 }],
      annotations: [...sbMarks(GEAR.f1, 'c1', [-4, -3, -2, -1, 1, 2, 3, 4]), ...sbMarks(F2, 'c3', [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])],
      x: { range: [500, 700], ticks: [500, 550, 600, 650, 700], label: '주파수 [Hz]' },
      y: { range: [-90, 10], ticks: [-80, -60, -40, -20, 0], label: '[dB]' },
      height: 140,
    },
    {
      title: '② 낮은 quefrency(< 5 ms)만 남기기 (0 ~ 2 kHz)',
      series: [
        { x: full.x, y: full.y, color: 'muted', width: 0.8, label: '원래' },
        { x: fullLow.x, y: fullLow.y, color: 'c3', width: 2.2, label: '매끈한 모양' },
      ],
      x: { range: [0, 2048], ticks: [0, 600, 1200, 1800], label: '주파수 [Hz]' },
      y: { range: [-90, 10], ticks: [-80, -60, -40, -20, 0], label: '[dB]' },
      height: 140,
    },
  ],
};

// ── 그림 5: 자기상관으로 주기 찾기 ──
export const acfPeriod: FigureSpec = {
  id: 'fig-p5-7-5',
  caption: `그림 5. 회전수를 모를 때: P5-6의 베어링 신호를 2800 ~ 3800 Hz만 남겨 구한 포락선의 자기상관. 지연 ${fmt(envAcf.firstPeakMs, 3)} ms에 첫 봉우리(${fmt(envAcf.firstPeakR, 2)})가 서고 그 정수배마다 되풀이된다. 1/${fmt(envAcf.firstPeakMs, 3)} ms = ${fmt(1000 / envAcf.firstPeakMs, 4)} Hz로, BPFO ${fmt(BRG.bpfo, 4)} Hz와 맞는다. 봉우리가 점점 낮아지는 것은 박자가 조금씩 흔들려서다.`,
  panels: [
    {
      series: [{ x: envAcf.lags, y: envAcf.r, color: 'c2', width: 1.4 }],
      annotations: [1, 2, 3, 4, 5].map((k) => ({ type: 'vline', x: (k * 1000) / BRG.bpfo, color: 'muted', dash: true, label: k === 1 ? '1/BPFO' : undefined }) as FigAnnotation),
      x: { range: [0, 30], ticks: [0, 5, 10, 15, 20, 25, 30], label: '지연 τ [ms]' },
      y: { range: [-0.4, 1.05], ticks: [0, 0.5, 1], label: 'R(τ)' },
      height: 130,
    },
  ],
};

// ── 그림 6: 특징량 ──
export const featureShapes: FigureSpec = {
  id: 'fig-p5-7-6',
  caption: `그림 6. RMS가 모두 1인 네 신호의 시간영역 특징량. Crest factor(Peak/RMS)와 첨도는 드문 큰 값에 민감하고(드문 충격: CF ${fmt(V.shapes[2].crest, 3)}, K ${fmt(V.shapes[2].kurtosis, 3)}), 왜도는 위아래가 다를 때만 0에서 벗어난다(위쪽이 눌린 정현파: S ${fmt(V.shapes[3].skewness, 2)}). 정현파는 CF ${fmt(V.shapes[0].crest, 3)}·K ${fmt(V.shapes[0].kurtosis, 2)}, 정규 잡음은 K ${fmt(V.shapes[1].kurtosis, 3)}다.`,
  panels: SHAPES.list.map((s, i) => ({
    title: `${s.name} — CF ${fmt(s.f.crest, 3)}, K ${fmt(s.f.kurtosis, 3)}, S ${fmt(Math.abs(s.f.skewness) < 0.005 ? 0 : s.f.skewness, 2)}`,
    series: [{ x: SHAPES.t.map((v) => v * 1000), y: s.y, color: s.color, width: 1 }] as FigSeries[],
    x: { range: [0, 100] as [number, number], ...(i === SHAPES.list.length - 1 ? { label: '시각 [ms]' } : {}) },
    y: { range: [-5, 7] as [number, number], ticks: [-4, 0, 4] },
    height: 65,
  })),
};

// ── 그림 7: 결함이 진행하는 동안의 추세 ──
const sAxis = trend.s.map((v) => v * 100);
const stageBands: FigAnnotation[] = [
  { type: 'band', x1: 10, x2: 50, color: 'c2', label: '충격이 커짐' },
  { type: 'band', x1: 60, x2: 100, color: 'muted', label: '손상이 넓어짐' },
];
const trendPanel = (y: number[], title: string, color: FigColor, yr: [number, number], ticks: number[], last = false, hline?: number) => ({
  title,
  series: [{ x: sAxis, y, color, width: 2 }, { x: sAxis, y, kind: 'dots', color, radius: 2.2 }] as FigSeries[],
  annotations: [...stageBands, ...(hline !== undefined ? [{ type: 'hline', y: hline, color: 'muted', dash: true, label: `정규 잡음 ${hline}`, labelAt: 'start' } as FigAnnotation] : [])],
  x: { range: [0, 100] as [number, number], ticks: [0, 20, 40, 60, 80, 100], ...(last ? { label: '결함 진행 [%] (설명용)' } : {}) },
  y: { range: yr, ticks },
  height: 95,
});
export const trendFig: FigureSpec = {
  id: 'fig-p5-7-7',
  caption: `그림 7. 외륜 결함이 진행하는 동안의 특징량 추세 (설명용 모델). 처음에는 드문 충격이 커져 첨도가 ${fmt(V.healthy.kurtosis, 3)}에서 ${fmt(V.mid.kurtosis, 3)}까지, CF가 ${fmt(V.healthy.crest, 3)}에서 약 7까지 먼저 오른다. RMS는 그동안 ${fmt(g(V.healthy.rms), 2)} → ${fmt(g(V.mid.rms), 2)} g로 천천히 오른다. 손상이 넓어져 충격이 여기저기서 자주 생기면 RMS는 ${fmt(g(V.late.rms), 2)} g까지 계속 오르지만, 첨도는 ${fmt(V.late.kurtosis, 3)}로 정규 잡음 근처까지 내려온다. 첨도만 보면 말기를 "좋아졌다"고 오해할 수 있다.`,
  panels: [
    trendPanel(trend.f.map((f) => g(f.rms)), 'RMS [g]', 'c1', [0, 1], [0, 0.5, 1]),
    trendPanel(trend.f.map((f) => f.crest), 'Crest factor', 'c4', [2, 8], [3, 5, 7]),
    trendPanel(trend.f.map((f) => f.kurtosis), '첨도 K', 'c2', [0, 16], [0, 3, 8, 15], true, 3),
  ],
};
