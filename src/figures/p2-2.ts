/**
 * P2-2 "푸리에 기초" 본문 그림 데이터 (빌드 시 계산, D-026).
 */
import { grid, type FigAnnotation, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { correlationTerms, harmonicPreset } from '../lib/dsp/fourier';
import { acquire } from '../lib/dsp/sampling';
import { evaluate, type SignalComponent } from '../lib/dsp/signal';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';
import { crestFactor } from '../lib/dsp/stats';

const F0 = 10; // Hz, 기본 주파수 (랩 LAB-FOU-01 (a)와 같음)

function curve(components: SignalComponent[], t0: number, t1: number, points = 900) {
  const t = grid(t0, t1, points);
  return { t, x: t.map((tt) => evaluate({ components }, tt)) };
}

function harmonicCurve(amps: readonly number[], phases: readonly number[], t1: number, points = 900) {
  return curve([{ type: 'harmonics', f0: F0, amps, phases }], 0, t1, points);
}

// 그림 1 — 사각파를 하모닉으로 쌓기
const T2 = 2 / F0; // 두 주기
const squareTarget = (() => {
  const t = grid(0, T2, 1200);
  return { t, x: t.map((tt) => (Math.cos(2 * Math.PI * F0 * tt) >= 0 ? 1 : -1)) };
})();
const buildPanel = (orders: number, title: string, last = false): FigPanel => {
  const h = harmonicPreset('square', orders);
  const c = harmonicCurve(h.amps, h.phases, T2);
  return {
    title,
    series: [
      { x: squareTarget.t, y: squareTarget.x, color: 'muted', dash: true, width: 1.2 },
      { x: c.t, y: c.x, color: 'c1', width: 2.2 },
    ],
    x: last ? { range: [0, T2], label: '시간 [s]' } : { range: [0, T2], ticks: 'none' },
    y: { range: [-1.5, 1.5], ticks: [-1, 0, 1] },
    height: last ? 110 : 90,
  };
};
export const squareBuild: FigureSpec = {
  id: 'fig-1-1',
  caption:
    '그림 1. 10 Hz 사각파(점선)를 정현파로 쌓아 가는 과정. 1차(10 Hz) 하나는 둥근 물결이지만, 3차(30 Hz)와 5차(50 Hz)를 알맞은 크기로 더할 때마다 꼭대기가 평평해지고 모서리가 가팔라진다. 15차(150 Hz)까지 더하면 거의 사각형이다. 모서리 옆의 작은 뿔(약 9 %)은 성분을 더 더해도 폭만 좁아질 뿐 남는다(깁스 현상, Gibbs Phenomenon).',
  panels: [
    buildPanel(1, '1차만 (10 Hz)'),
    buildPanel(3, '1차 + 3차 (10 + 30 Hz)'),
    buildPanel(5, '1 + 3 + 5차'),
    buildPanel(15, '15차까지 (홀수 8개)', true),
  ],
};

// 그림 2 — 사각파의 레시피 (진폭 스펙트럼)
const sq15 = harmonicPreset('square', 15);
const sqOdd = sq15.amps.map((a, i) => ({ f: (i + 1) * F0, a })).filter((c) => c.a > 1e-9);
export const squareRecipe: FigureSpec = {
  id: 'fig-1-2',
  caption:
    '그림 2. 그림 1의 사각파(높이 ±1)를 만드는 레시피 — 각 하모닉의 진폭. 홀수 차(10, 30, 50 … Hz)만 있고 크기는 4/(nπ)로 차수에 반비례해 줄어든다. 짝수 차(20, 40 … Hz)는 정확히 0이다. 이 막대그래프가 사각파의 진폭 스펙트럼이다.',
  panels: [
    {
      series: [{ x: sqOdd.map((c) => c.f), y: sqOdd.map((c) => c.a), kind: 'stem', color: 'c1', width: 3, radius: 4.5 }],
      annotations: [
        ...sqOdd.slice(0, 4).map(
          (c, i): FigAnnotation => ({ type: 'text', x: c.f, y: c.a, text: `${2 * i + 1}차 ${formatNumber(c.a, 3)}`, anchor: 'middle', dy: -10, color: 'c1' }),
        ),
        ...[20, 40, 60].map((f): FigAnnotation => ({ type: 'text', x: f, y: 0, text: '0', anchor: 'middle', dy: -6, color: 'muted' })),
      ],
      x: { range: [0, 160], ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150], label: '주파수 [Hz]' },
      y: { range: [0, 1.55], ticks: [0, 0.5, 1], label: '진폭' },
      height: 190,
    },
  ],
};

// 그림 3 — 진폭은 같고 위상만 다른 두 신호
const sq7 = harmonicPreset('square', 7);
const SHIFT = [0, 0, 2.2, 0, -1.4, 0, 0.9]; // 3·5·7차 위상만 옮긴다
const sqA = harmonicCurve(sq7.amps, sq7.phases, T2, 1600);
const sqB = harmonicCurve(sq7.amps, sq7.phases.map((p, i) => p + SHIFT[i]), T2, 1600);
const cfA = crestFactor(sqA.x);
const cfB = crestFactor(sqB.x);
const sq7Odd = sq7.amps.map((a, i) => ({ f: (i + 1) * F0, a })).filter((c) => c.a > 1e-9);
export const phaseMatters: FigureSpec = {
  id: 'fig-1-3',
  caption: `그림 3. 두 신호는 같은 성분(10·30·50·70 Hz, 진폭도 같음)으로 만들었고 3·5·7차의 위상만 다르다. 진폭 스펙트럼(아래)은 똑같고 RMS도 같지만, 파형 모양과 Crest factor(${formatNumber(cfA, 3)} → ${formatNumber(cfB, 3)})는 다르다. 진폭 스펙트럼은 위상을 버리고 그리기 때문이다.`,
  panels: [
    {
      title: `위상을 맞춘 합 (사각파에 가까움): CF = ${formatNumber(cfA, 3)}`,
      series: [{ x: sqA.t, y: sqA.x, color: 'c1', width: 2 }],
      x: { range: [0, T2], ticks: 'none' },
      y: { range: [-2.3, 2.3], ticks: [-2, -1, 0, 1, 2] },
      height: 100,
    },
    {
      title: `3·5·7차 위상만 옮긴 합: CF = ${formatNumber(cfB, 3)}`,
      series: [{ x: sqB.t, y: sqB.x, color: 'c2', width: 2 }],
      x: { range: [0, T2], label: '시간 [s]' },
      y: { range: [-2.3, 2.3], ticks: [-2, -1, 0, 1, 2] },
      height: 115,
    },
    {
      title: '두 신호의 진폭 스펙트럼 (똑같다)',
      series: [{ x: sq7Odd.map((c) => c.f), y: sq7Odd.map((c) => c.a), kind: 'stem', color: 'text', width: 3, radius: 4 }],
      x: { range: [0, 80], ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80], label: '주파수 [Hz]' },
      y: { range: [0, 1.5], ticks: [0, 0.5, 1] },
      height: 115,
    },
  ],
};

// 그림 4 — 펄스 폭과 스펙트럼 폭 (시간에서 짧으면 주파수에서 넓다)
const PULSE_ORDERS = 30;
const pulsePanels = (duty: number, name: string, color: 'c1' | 'c2', last: boolean): FigPanel[] => {
  const t = grid(0, T2, 1600);
  const x = t.map((tt) => {
    const ph = ((tt * F0) % 1 + 1) % 1; // 0~1, 펄스는 0을 가운데로
    return ph < duty / 2 || ph > 1 - duty / 2 ? 1 : 0;
  });
  const h = harmonicPreset('pulse', PULSE_ORDERS, duty);
  const freqs = [0, ...h.amps.map((_, i) => (i + 1) * F0)];
  const amps = [duty, ...h.amps];
  return [
    {
      title: `${name}: 폭 τ = ${Math.round((duty / F0) * 1000)} ms (한 주기의 ${Math.round(duty * 100)} %)`,
      series: [{ x: t, y: x, color, width: 2 }],
      x: { range: [0, T2], ticks: 'none' },
      y: { range: [-0.2, 1.25], ticks: [0, 1] },
      height: 80,
    },
    {
      series: [{ x: freqs, y: amps, kind: 'stem', color, width: 2, radius: 2.6 }],
      annotations: [{ type: 'vline', x: 1 / (duty / F0), label: `첫 0점 1/τ = ${Math.round(1 / (duty / F0))} Hz`, color: 'warn', dash: true }],
      x: last ? { range: [-3, 303], ticks: [0, 50, 100, 150, 200, 250, 300], label: '주파수 [Hz]' } : { range: [-3, 303], ticks: [0, 50, 100, 150, 200, 250, 300] },
      y: { range: [0, 0.75], ticks: [0, 0.25, 0.5] },
      height: last ? 120 : 105,
    },
  ];
};
export const pulseWidth: FigureSpec = {
  id: 'fig-1-4',
  caption:
    '그림 4. 10 Hz로 반복되는 펄스 두 개와 각각의 진폭 스펙트럼. 막대 키를 이은 모양(포락선)이 처음 0이 되는 주파수는 펄스 폭 τ의 역수 1/τ이다. 넓은 펄스(40 ms)는 성분이 25 Hz 안쪽에 몰려 있고, 좁은 펄스(10 ms)는 성분 하나하나는 작지만 100 Hz까지 넓게 퍼져 있다. 시간에서 짧은 것은 주파수에서 넓다 — 그래서 짧게 "탁" 치는 충격은 넓은 주파수 범위를 한꺼번에 흔든다. 0 Hz 막대는 평균값(DC)이다.',
  panels: [...pulsePanels(0.4, '넓은 펄스', 'c1', false), ...pulsePanels(0.1, '좁은 펄스', 'c2', true)],
};

// 그림 5 — DFT의 아이디어: 템플릿을 곱해서 더한다
const N = 32;
const FS = 32; // Hz → T = 1 s, bin k = k Hz
const sig4 = acquire({ components: [{ type: 'sine', freq: 4, amp: 1 }] }, { fs: FS, n: N });
const tSamples = Array.from(sig4.t);
const dense = curve([{ type: 'sine', freq: 4, amp: 1 }], 0, 1, 600);
const template = (k: number) => curve([{ type: 'sine', freq: k, amp: 1 }], 0, 1, 600);
const corr4 = correlationTerms(sig4.x, 4);
const corr5 = correlationTerms(sig4.x, 5);
const sum4 = corr4.cosCumulative[N - 1];
const sum5 = corr5.cosCumulative[N - 1];
const clean = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v);
const signalAndTemplate = (k: number, title: string): FigPanel => ({
  title,
  series: [
    { x: dense.t, y: dense.x, color: 'c1', width: 1.8, label: '신호 (4 Hz)' },
    { x: template(k).t, y: template(k).x, color: 'c2', dash: true, width: 1.6, label: `템플릿 (${k} Hz)` },
    { x: tSamples, y: Array.from(sig4.x), kind: 'dots', color: 'c1', radius: 2.6 },
  ],
  x: { range: [0, 1], ticks: 'none' },
  y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
  height: 105,
});
const productPanel = (prod: Float64Array, sum: number, last: boolean): FigPanel => ({
  title: `샘플마다 곱한 값 → 32개를 모두 더하면 ${formatNumber(clean(sum), 3)}`,
  series: [{ x: tSamples, y: Array.from(prod), kind: 'bar', barWidth: 0.018, color: 'c3' }],
  x: last ? { range: [0, 1], label: '시간 [s] (샘플 32개, f_s = 32 Hz)' } : { range: [0, 1], ticks: 'none' },
  y: { range: [-1.15, 1.15], ticks: [-1, 0, 1] },
  height: last ? 105 : 85,
});
export const correlationIdea: FigureSpec = {
  id: 'fig-1-5',
  caption: `그림 5. 신호에 "4 Hz가 들었나?"를 묻는 방법. 위 두 칸: 4 Hz 템플릿을 대고 샘플마다 곱하면 두 파형이 늘 같은 방향이라 곱이 모두 0 이상이다 → 합이 ${formatNumber(sum4, 3)}으로 크다. 아래 두 칸: 5 Hz 템플릿은 박자가 어긋나 곱이 +와 −를 오가고 → 합이 정확히 0이 된다. 합을 N/2(= 16)로 나누면 그 주파수 성분의 진폭(1)이 나온다.`,
  panels: [
    signalAndTemplate(4, '같은 주파수 템플릿 (4 Hz)'),
    productPanel(corr4.cosProduct, sum4, false),
    signalAndTemplate(5, '다른 주파수 템플릿 (5 Hz)'),
    productPanel(corr5.cosProduct, sum5, true),
  ],
};

// 그림 6 — 위상을 모르므로 sin 템플릿도 쓴다
const sinSig = acquire({ components: [{ type: 'sine', freq: 4, amp: 1, phase: -Math.PI / 2 }] }, { fs: FS, n: N });
const sinCorr = correlationTerms(sinSig.x, 4);
const cosSum = clean(sinCorr.cosCumulative[N - 1]);
const sinSum = clean(sinCorr.sinCumulative[N - 1]);
export const sinTemplate: FigureSpec = {
  id: 'fig-1-6',
  caption: `그림 6. 이번 신호는 같은 4 Hz지만 위상이 90° 늦다(꼭대기가 1/4 주기 늦게 온다). cos 템플릿과 곱하면 +와 −가 똑같이 나와 합이 ${formatNumber(cosSum, 3)} — 성분이 있는데도 못 찾는다. sin 템플릿과 곱하면 합이 ${formatNumber(sinSum, 3)}이다. 신호의 위상을 미리 모르므로 DFT는 cos와 sin 두 템플릿을 모두 대 보고, 두 합을 피타고라스로 묶어 크기를 구한다.`,
  panels: [
    {
      title: `cos 템플릿과 곱한 값 → 합 ${formatNumber(cosSum, 3)}`,
      series: [{ x: tSamples, y: Array.from(sinCorr.cosProduct), kind: 'bar', barWidth: 0.018, color: 'c3' }],
      x: { range: [0, 1], ticks: 'none' },
      y: { range: [-1.15, 1.15], ticks: [-1, 0, 1] },
      height: 85,
    },
    {
      title: `sin 템플릿과 곱한 값 → 합 ${formatNumber(sinSum, 3)}`,
      series: [{ x: tSamples, y: Array.from(sinCorr.sinProduct), kind: 'bar', barWidth: 0.018, color: 'c2' }],
      x: { range: [0, 1], label: '시간 [s]' },
      y: { range: [-1.15, 1.15], ticks: [-1, 0, 1] },
      height: 105,
    },
  ],
};

// 그림 7 — 양측 스펙트럼을 접어 단일측으로
export const twoSided: FigureSpec = {
  id: 'fig-1-7',
  caption:
    '그림 7. 진폭 1인 60 Hz 정현파의 스펙트럼 (f_s = 256 Hz). 위: DFT 계산 결과를 그대로 그리면 +60 Hz와 −60 Hz에 절반(0.5)씩 나뉘어 나온다(양측 스펙트럼). 실제 측정 신호에서는 −쪽이 +쪽의 거울상이라 새 정보가 없다. 아래: 분석기는 −쪽을 버리고 +쪽을 2배 해서 0 ~ f_s/2만 보여 준다(단일측 스펙트럼).',
  panels: [
    {
      title: '양측 스펙트럼 (계산 결과 그대로)',
      series: [{ x: [-60, 60], y: [0.5, 0.5], kind: 'stem', color: 'c1', width: 3, radius: 4.5 }],
      annotations: [
        { type: 'text', x: -60, y: 0.5, text: '−60 Hz: 0.5', anchor: 'middle', dy: -10, color: 'c1' },
        { type: 'text', x: 60, y: 0.5, text: '+60 Hz: 0.5', anchor: 'middle', dy: -10, color: 'c1' },
        { type: 'vline', x: 0, color: 'muted' },
      ],
      x: { range: [-128, 128], ticks: [-128, -60, 0, 60, 128], tickLabels: [{ value: -128, label: '−f_s/2' }, { value: 128, label: 'f_s/2' }] },
      y: { range: [0, 1.3], ticks: [0, 0.5, 1] },
      height: 120,
    },
    {
      title: '단일측 스펙트럼 (분석기 화면)',
      series: [{ x: [60], y: [1], kind: 'stem', color: 'c1', width: 3, radius: 4.5 }],
      annotations: [{ type: 'text', x: 60, y: 1, text: '60 Hz: 0.5 × 2 = 1', anchor: 'middle', dy: -10, color: 'c1' }],
      x: { range: [-128, 128], ticks: [0, 60, 128], tickLabels: [{ value: 128, label: 'f_s/2' }], label: '주파수 [Hz]' },
      y: { range: [0, 1.3], ticks: [0, 0.5, 1] },
      height: 135,
    },
  ],
};

// 그림 8 — 톤 하나가 만드는 둔덕의 폭: 패딩이 아니라 측정 시간이 정한다
const one = (n: number, pad: number) => singleSidedSpectrum(acquire({ components: [{ type: 'sine', freq: 8.3, amp: 1 }] }, { fs: FS, n }), { fftSize: n * pad });
const hump1 = one(32, 16);
const bins1 = one(32, 1);
const hump4 = one(128, 4);
const bins4 = one(128, 1);
const XR: [number, number] = [4, 13];
export const humpWidth: FigureSpec = {
  id: 'fig-1-8',
  caption:
    '그림 8. 8.3 Hz 정현파 하나의 스펙트럼. 점은 원래 bin, 선은 제로패딩으로 bin 사이를 촘촘히 채워 그린 모양이다. 위: 1초 측정 — 성분 하나가 폭 2 Hz(= 2/T)짜리 둔덕으로 그려진다. 패딩을 아무리 늘려도 이 둔덕은 더 촘촘히 그려질 뿐 좁아지지 않는다. 아래: 4초 측정 — 둔덕 폭이 0.5 Hz로 좁아진다. 가까운 두 성분을 가를 수 있는지는 이 둔덕 폭, 즉 측정 시간 T가 정한다.',
  panels: [
    {
      title: 'T = 1 s (N = 32) + 제로패딩 ×16',
      series: [
        { x: Array.from(hump1.frequency), y: Array.from(hump1.amplitude), color: 'c2', width: 2 },
        { x: Array.from(bins1.frequency), y: Array.from(bins1.amplitude), kind: 'dots', color: 'c1', radius: 3.6 },
      ],
      annotations: [
        { type: 'vline', x: 8.3, color: 'warn', dash: true },
        { type: 'arrow', x1: 7.3, y1: 1.12, x2: 9.3, y2: 1.12, double: true, label: '둔덕 폭 2/T = 2 Hz', labelDx: 70, color: 'c2' },
      ],
      x: { range: XR, ticks: 'none' },
      y: { range: [0, 1.4], ticks: [0, 0.5, 1] },
      height: 125,
    },
    {
      title: 'T = 4 s (N = 128) + 제로패딩 ×4',
      series: [
        { x: Array.from(hump4.frequency), y: Array.from(hump4.amplitude), color: 'c3', width: 2 },
        { x: Array.from(bins4.frequency), y: Array.from(bins4.amplitude), kind: 'dots', color: 'c3', radius: 3 },
      ],
      annotations: [
        { type: 'vline', x: 8.3, color: 'warn', dash: true },
        { type: 'arrow', x1: 8.05, y1: 1.12, x2: 8.55, y2: 1.12, double: true, label: '2/T = 0.5 Hz', color: 'c3' },
      ],
      x: { range: XR, label: '주파수 [Hz]' },
      y: { range: [0, 1.4], ticks: [0, 0.5, 1] },
      height: 140,
    },
  ],
};

// 그림 9 — 두 성분이 0.5 Hz 차이일 때: 패딩 vs 측정 시간
const TONES: SignalComponent[] = [
  { type: 'sine', freq: 8.3, amp: 1 },
  { type: 'sine', freq: 8.8, amp: 1 },
];
const two = (n: number, pad: number) => singleSidedSpectrum(acquire({ components: TONES }, { fs: FS, n }), { fftSize: n * pad });
const t1 = two(32, 1);
const t1pad = two(32, 16);
const t4 = two(128, 1);
const t4pad = two(128, 4);
const truth: FigAnnotation[] = [
  { type: 'vline', x: 8.3, color: 'warn', dash: true },
  { type: 'vline', x: 8.8, color: 'warn', dash: true },
];
export const zeroPadding: FigureSpec = {
  id: 'fig-1-9',
  caption:
    '그림 9. 8.3 Hz와 8.8 Hz(주황 점선) 두 성분이 0.5 Hz 차이로 섞인 신호. 위: 1초 측정, bin 간격 1 Hz — 막대만으로는 알 수 없다. 가운데: 같은 1초 데이터에 제로패딩 ×16 — 곡선은 매끈해졌지만 둔덕은 하나이고, 꼭대기도 두 성분 사이의 엉뚱한 곳에 있다. 아래: 4초 측정 — 두 봉우리로 갈라진다. 제로패딩은 이미 잰 데이터를 촘촘히 그릴 뿐, 새로운 정보를 만들지 않는다.',
  panels: [
    {
      title: 'T = 1 s (N = 32), 패딩 없음: bin 간격 1 Hz',
      series: [{ x: Array.from(t1.frequency), y: Array.from(t1.amplitude), kind: 'stem', color: 'c1', width: 2.5, radius: 3.5 }],
      annotations: truth,
      x: { range: XR, ticks: 'none' },
      y: { range: [0, 2.3], ticks: [0, 1, 2] },
      height: 105,
    },
    {
      title: 'T = 1 s (N = 32) + 제로패딩 ×16: 둔덕 하나',
      series: [
        { x: Array.from(t1pad.frequency), y: Array.from(t1pad.amplitude), color: 'c2', width: 2 },
        { x: Array.from(t1.frequency), y: Array.from(t1.amplitude), kind: 'dots', color: 'c1', radius: 3.5 },
      ],
      annotations: truth,
      x: { range: XR, ticks: 'none' },
      y: { range: [0, 2.3], ticks: [0, 1, 2] },
      height: 105,
    },
    {
      title: 'T = 4 s (N = 128): 측정 시간을 늘리면 갈라진다',
      series: [
        { x: Array.from(t4pad.frequency), y: Array.from(t4pad.amplitude), color: 'c3', width: 2 },
        { x: Array.from(t4.frequency), y: Array.from(t4.amplitude), kind: 'dots', color: 'c3', radius: 2.6 },
      ],
      annotations: truth,
      x: { range: XR, label: '주파수 [Hz]' },
      y: { range: [0, 2.3], ticks: [0, 1, 2] },
      height: 125,
    },
  ],
};
