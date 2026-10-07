/**
 * P5-6 "엔벨로프 분석 · Spectral Kurtosis" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호는 랩(LAB-ENV-01 · LAB-SK-01)과 같은 `lib/envelopeDemo.ts`, 계산은 `lib/dsp/envelope.ts`.
 */
import type { FigAnnotation, FigColor, FigSeries, FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { analyticSignal, kurtogramGrid, magnitude, peakNear } from '../lib/dsp/envelope';
import { createRng } from '../lib/dsp/random';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';
import { kurtosis } from '../lib/dsp/stats';
import { analyzeEnvelope, analyzeKurtogram, BRG, DEFAULT_ENV_SIGNAL as D, envSignal, ENV, G } from '../lib/envelopeDemo';

const fmt = formatNumber;
const g = (v: number) => v / G;
const sig = envSignal(D);
const fs = ENV.fs;

/** 좋은 대역(공진 3.3 kHz ± 500 Hz)과 틀린 대역 둘 */
export const BANDS = { good: [2800, 3800] as [number, number], gear: [700, 1700] as [number, number], noise: [5500, 6500] as [number, number] };
const good = analyzeEnvelope(sig, ...BANDS.good);
const gearBand = analyzeEnvelope(sig, ...BANDS.gear);
const noiseBand = analyzeEnvelope(sig, ...BANDS.noise);
const kg = analyzeKurtogram(D);
const innerKg = analyzeKurtogram({ ...D, fault: 'inner' });
const raw = singleSidedSpectrum({ fs, x: sig.x }, { window: 'hann' });

/** 큰 스펙트럼을 묶음마다 최댓값으로 줄여 그린다 (봉우리를 잃지 않게) */
function decimateMax(f: ArrayLike<number>, a: ArrayLike<number>, fMax: number, group: number) {
  const x: number[] = [];
  const y: number[] = [];
  for (let k = 0; k + group <= f.length && f[k] <= fMax; k += group) {
    let m = 0;
    for (let j = 0; j < group; j++) m = Math.max(m, a[k + j]);
    x.push(f[k + (group >> 1)]);
    y.push(m);
  }
  return { x, y };
}
const dB = (v: number) => 20 * Math.log10(Math.max(v, 1e-6));

// 그림 5 — 첨도: 같은 RMS의 세 신호
const KDEMO = (() => {
  const n = 4096;
  const f = 8192;
  const rng = createRng(17);
  const t = Array.from({ length: n }, (_, i) => i / f);
  const noise = t.map(() => rng.normal());
  const sine = t.map((v) => Math.SQRT2 * Math.sin(2 * Math.PI * 200 * v));
  const imp = new Float64Array(n);
  for (let k = 0; k * 0.04 < n / f; k++) {
    const i0 = Math.round(k * 0.04 * f);
    for (let i = i0; i < Math.min(n, i0 + 200); i++) {
      const tau = (i - i0) / f;
      imp[i] += Math.exp(-0.05 * 2 * Math.PI * 1000 * tau) * Math.sin(2 * Math.PI * 1000 * tau);
    }
  }
  let s = 0;
  for (const v of imp) s += v * v;
  const r = Math.sqrt(s / n);
  const impulses = Array.from(imp, (v) => v / r);
  return { t, noise, sine, impulses, k: [kurtosis(noise), kurtosis(sine), kurtosis(impulses)] };
})();

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p5-6.test.ts`) */
export const P56_VALUES = {
  bpfo: BRG.bpfo,
  bpfi: BRG.bpfi,
  rawAtBpfo: peakNear(raw.frequency, raw.amplitude, BRG.bpfo, 2),
  rawAt1X: peakNear(raw.frequency, raw.amplitude, ENV.fr, 1),
  rawGear: peakNear(raw.frequency, raw.amplitude, ENV.gearHz, 1),
  rawHump: peakNear(raw.frequency, raw.amplitude, ENV.resonance, 300),
  rawKurtosis: kurtosis(sig.x),
  bearingKurtosis: kurtosis(sig.bearing),
  good,
  gearBand,
  noiseBand,
  kg,
  innerKg,
  kdemo: KDEMO.k,
};
const V = P56_VALUES;

// ── 그림 1: 원신호에는 BPFO가 안 보인다 ──
const T_SHOW = 0.04;
const nShow = Math.round(T_SHOW * fs);
const tShow = Array.from({ length: nShow }, (_, i) => i / fs);
const rawDb = decimateMax(raw.frequency, raw.amplitude.map((v) => g(v)), 8192, 8);
const rawLo = decimateMax(raw.frequency, raw.amplitude.map((v) => g(v)), 1000, 1);
const impactMarks = (from: number, to: number): FigAnnotation[] =>
  Array.from({ length: Math.ceil((to - from) * BRG.bpfo) + 1 }, (_, k) => k / BRG.bpfo)
    .filter((v) => v >= from && v <= to)
    .map((v) => ({ type: 'vline', x: v * 1000, color: 'muted', dash: true }) as FigAnnotation);

export const rawSignal: FigureSpec = {
  id: 'fig-p5-6-1',
  caption: `그림 1. 외륜에 흠이 있는 6205 베어링(3000 rpm, BPFO ${fmt(BRG.bpfo, 4)} Hz)의 하우징 가속도 — 설명용 예시. 위: 파형 40 ms. 1200 Hz 기어 맞물림과 잡음이 커서 충격(회색 점선 = BPFO 박자)이 잘 드러나지 않는다. 가운데: 0 ~ 8 kHz 스펙트럼(dB). 가장 큰 것은 기어 맞물림(${fmt(g(V.rawGear), 3)} g)이고, 결함이 울리는 3.3 kHz 언덕은 ${fmt(g(V.rawHump), 2)} g로 낮다. 아래: 0 ~ 1000 Hz. BPFO 자리에는 ${fmt(g(V.rawAtBpfo), 1)} g로 거의 아무것도 없다(1X는 ${fmt(g(V.rawAt1X), 2)} g).`,
  panels: [
    {
      title: '① 파형 (40 ms)',
      series: [{ x: tShow.map((v) => v * 1000), y: Array.from(sig.x.slice(0, nShow), g), color: 'c1', width: 1 }],
      annotations: impactMarks(0, T_SHOW),
      x: { range: [0, 40], label: '시각 [ms]' },
      y: { range: [-2.5, 2.5], ticks: [-2, 0, 2], label: '[g]' },
      height: 110,
    },
    {
      title: '② 스펙트럼 0 ~ 8 kHz (dB re 1 g)',
      series: [{ x: rawDb.x, y: rawDb.y.map(dB), color: 'c1', width: 1.2 }],
      annotations: [
        { type: 'text', x: 1200, y: 4, text: '기어 맞물림 1200 Hz', anchor: 'start', color: 'text' },
        { type: 'band', x1: 2800, x2: 3800, color: 'warn', label: '결함이 울리는 곳' },
        { type: 'band', x1: 5000, x2: 7000, color: 'muted', label: '다른 원인의 잡음' },
      ],
      x: { range: [0, 8192], ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], label: '주파수 [Hz]' },
      y: { range: [-80, 10], ticks: [-80, -60, -40, -20, 0], label: '[dB]' },
      height: 140,
    },
    {
      title: '③ 0 ~ 1000 Hz (선형)',
      series: [{ x: rawLo.x, y: rawLo.y, color: 'c1', width: 1.2 }],
      annotations: [
        { type: 'vline', x: BRG.bpfo, color: 'warn', dash: true, label: 'BPFO' },
        { type: 'vline', x: 2 * BRG.bpfo, color: 'warn', dash: true },
        { type: 'vline', x: 3 * BRG.bpfo, color: 'warn', dash: true },
      ],
      x: { range: [0, 1000], ticks: [0, 200, 400, 600, 800, 1000], label: '주파수 [Hz]' },
      y: { range: [0, 0.12], ticks: [0, 0.05, 0.1], label: '[g]' },
      height: 110,
    },
  ],
};

// ── 그림 2: 엔벨로프 분석의 순서 ──
const goodEnvLo = { x: Array.from(good.env.freq), y: Array.from(good.env.amp, g) };
const faultMarks = (f: number, color: FigColor = 'warn'): FigAnnotation[] => [1, 2, 3, 4, 5].map((k) => ({ type: 'vline', x: k * f, color, dash: true, label: k === 1 ? `${fmt(f, 4)} Hz` : undefined }) as FigAnnotation);
export const envelopeSteps: FigureSpec = {
  id: 'fig-p5-6-2',
  caption: `그림 2. 엔벨로프 분석. 위: 그림 1의 신호를 ${BANDS.good[0]} ~ ${BANDS.good[1]} Hz만 남기면(파랑) 충격마다 울림이 솟는다. 그 바깥 꼭대기를 이은 포락선(주황)은 ${fmt(1000 / BRG.bpfo, 3)} ms마다 되풀이된다. 아래: 포락선의 스펙트럼(엔벨로프 스펙트럼). BPFO ${fmt(BRG.bpfo, 4)} Hz에 ${fmt(g(good.lines[0]), 2)} g, 2배·3배에 ${fmt(g(good.lines[1]), 2)}·${fmt(g(good.lines[2]), 2)} g의 줄이 선다 — 바닥(${g(good.floor).toFixed(4)} g)의 약 ${Math.round(good.lines[0] / good.floor / 10) * 10}배다.`,
  panels: [
    {
      title: `① ${BANDS.good[0]} ~ ${BANDS.good[1]} Hz 대역 신호와 포락선`,
      series: [
        { x: tShow.map((v) => v * 1000), y: Array.from(good.env.band.slice(0, nShow), g), color: 'c1', width: 1 },
        { x: tShow.map((v) => v * 1000), y: Array.from(good.env.envelope.slice(0, nShow), g), color: 'c2', width: 2 },
      ],
      annotations: impactMarks(0, T_SHOW),
      x: { range: [0, 40], label: '시각 [ms]' },
      y: { range: [-0.8, 0.8], ticks: [-0.5, 0, 0.5], label: '[g]' },
      height: 120,
    },
    {
      title: '② 엔벨로프 스펙트럼',
      series: [{ x: goodEnvLo.x, y: goodEnvLo.y, color: 'c2', width: 1.4 }],
      annotations: faultMarks(BRG.bpfo, 'muted'),
      x: { range: [0, 1000], ticks: [0, 200, 400, 600, 800, 1000], label: '주파수 [Hz]' },
      y: { range: [0, 0.13], ticks: [0, 0.05, 0.1], label: '[g]' },
      height: 120,
    },
  ],
};

// ── 그림 3: 포락선 구하기 — 해석 신호의 크기 ──
const burst = (() => {
  const f = 65536;
  const n = 1024;
  const t = Array.from({ length: n }, (_, i) => i / f);
  const wn = 2 * Math.PI * 3300;
  // 시작을 0.08 ms에 걸쳐 부드럽게 올린다 (계단처럼 시작하면 해석 신호가 시작 전부터 번진다)
  const x = t.map((v) => (v > 0.002 ? (1 - Math.exp(-(v - 0.002) / 8e-5)) * Math.exp(-0.05 * wn * (v - 0.002)) * Math.sin(wn * (v - 0.002)) : 0));
  const c = analyticSignal(x, f);
  return { t: t.map((v) => v * 1000), x, h: Array.from(c.im), env: Array.from(magnitude(c)) };
})();
export const analytic: FigureSpec = {
  id: 'fig-p5-6-3',
  caption: '그림 3. 울림 하나의 포락선을 구하는 법. 파랑은 대역 신호 x, 초록 점선은 x의 모든 성분을 90° 늦춘 힐베르트 변환 H{x}(cos → sin)다. 둘을 실수부·허수부로 삼은 복소수(해석 신호)의 크기 √(x² + H{x}²)가 주황 포락선이다. x가 0을 지날 때도 H{x}가 꼭대기에 있어서, 크기는 출렁임 없이 바깥 꼭대기를 매끄럽게 잇는다.',
  panels: [
    {
      series: [
        { x: burst.t, y: burst.h, color: 'c3', width: 1.4, dash: true, label: 'H{x} (90° 늦춤)' },
        { x: burst.t, y: burst.x, color: 'c1', width: 1.6, label: 'x (대역 신호)' },
        { x: burst.t, y: burst.env, color: 'c2', width: 2.4, label: '포락선 √(x² + H{x}²)' },
      ],
      x: { range: [1.8, 4.2], ticks: [2, 2.5, 3, 3.5, 4], label: '시각 [ms]' },
      y: { range: [-1.1, 1.3], ticks: [-1, 0, 1] },
      height: 150,
    },
  ],
};

// ── 그림 4: 대역이 성패를 가른다 ──
const envPanel = (a: typeof good, title: string, color: FigColor, marks: FigAnnotation[], last = false) => ({
  title,
  series: [{ x: Array.from(a.env.freq), y: Array.from(a.env.amp, g), color, width: 1.4 }] as FigSeries[],
  annotations: marks,
  x: { range: [0, 1000] as [number, number], ticks: [0, 200, 400, 600, 800, 1000], ...(last ? { label: '주파수 [Hz]' } : {}) },
  y: { range: [0, 0.13] as [number, number], ticks: [0, 0.05, 0.1], label: '[g]' },
  height: 95,
});
export const bandChoice: FigureSpec = {
  id: 'fig-p5-6-4',
  caption: `그림 4. 같은 신호를 대역만 바꿔 엔벨로프 분석했다 (세 그래프의 세로 눈금이 같다). 위: 기어 맞물림 대역(${BANDS.gear[0]} ~ ${BANDS.gear[1]} Hz) — 1X(50 Hz) 간격의 줄만 선다(기어가 1X로 변조되어 있기 때문, P2-8). 가운데: 다른 원인의 잡음 대역(${BANDS.noise[0]} ~ ${BANDS.noise[1]} Hz) — 줄이 없다(BPFO 자리 ${fmt(g(noiseBand.lines[0]), 1)} g). 아래: 결함이 울리는 대역(${BANDS.good[0]} ~ ${BANDS.good[1]} Hz) — BPFO 하모닉이 선다. 대역을 잘못 고르면 결함이 있어도 보이지 않거나, 다른 원인의 줄을 결함으로 오해할 수 있다.`,
  panels: [
    envPanel(gearBand, `${BANDS.gear[0]} ~ ${BANDS.gear[1]} Hz: 기어 맞물림`, 'c4', [1, 2, 3, 4, 5].map((k) => ({ type: 'vline', x: 50 * k, color: 'muted', dash: true, label: k === 1 ? '1X' : undefined }) as FigAnnotation)),
    envPanel(noiseBand, `${BANDS.noise[0]} ~ ${BANDS.noise[1]} Hz: 다른 원인의 잡음`, 'muted', faultMarks(BRG.bpfo, 'muted')),
    envPanel(good, `${BANDS.good[0]} ~ ${BANDS.good[1]} Hz: 결함이 울리는 곳`, 'c2', faultMarks(BRG.bpfo, 'muted'), true),
  ],
};

// ── 그림 5: 첨도 ──
const kPanel = (y: number[], title: string, color: FigColor, last = false) => ({
  title,
  series: [{ x: KDEMO.t.map((v) => v * 1000), y, color, width: 1 }] as FigSeries[],
  x: { range: [0, 200] as [number, number], ...(last ? { label: '시각 [ms]' } : {}) },
  y: { range: [-5, 5] as [number, number], ticks: [-4, 0, 4] },
  height: 70,
});
export const kurtosisIntro: FigureSpec = {
  id: 'fig-p5-6-5',
  caption: `그림 5. RMS가 모두 1인 세 신호의 첨도 K. 정규분포 잡음(위)은 ${fmt(V.kdemo[0], 3)}, 정현파(가운데)는 ${fmt(V.kdemo[1], 2)}, 드문드문 울리는 충격(아래)은 ${fmt(V.kdemo[2], 3)}이다. 크기(RMS)는 같아도, 드물게 크게 튀는 값이 많을수록 K가 커진다.`,
  panels: [
    kPanel(KDEMO.noise, `정규분포 잡음 — K = ${fmt(V.kdemo[0], 3)}`, 'muted'),
    kPanel(KDEMO.sine, `정현파 — K = ${fmt(V.kdemo[1], 2)}`, 'c1'),
    kPanel(KDEMO.impulses, `충격 (25 Hz마다) — K = ${fmt(V.kdemo[2], 3)}`, 'c2', true),
  ],
};

// ── 그림 6: 크기가 큰 대역 ≠ 충격 대역 ──
const skX: number[] = [];
const skY: number[] = [];
const pwY: number[] = [];
kg.sk.freq.forEach((f, k) => {
  if (k === 0 || k === kg.sk.freq.length - 1) return;
  skX.push(f);
  skY.push(kg.sk.sk[k]);
  pwY.push(10 * Math.log10(Math.max(kg.sk.power[k], 1e-30)));
});
const pwMax = Math.max(...pwY);
export const skVsPower: FigureSpec = {
  id: 'fig-p5-6-6',
  caption: `그림 6. 같은 신호를 짧은 프레임(64점, 3.9 ms — 충격 간격 5.58 ms보다 짧게)으로 잘라 본 두 가지. 위: 평균 파워(dB, 가장 큰 곳 = 0). 기어 맞물림(1200·2400 Hz)과 5 ~ 7 kHz 잡음이 크다. 아래: 주파수마다의 첨도(Spectral Kurtosis). 잡음 대역은 0 근처, 크기가 일정한 기어 맞물림은 음수이고, 결함이 울리는 2.8 ~ 4.5 kHz만 양수로 솟는다. 크기가 큰 대역과 충격이 있는 대역은 다르다.`,
  panels: [
    {
      title: '① 평균 파워 (dB)',
      series: [{ x: skX, y: pwY.map((v) => v - pwMax), color: 'c1', width: 1.6 }],
      x: { range: [0, 8192], ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000] },
      y: { range: [-60, 5], ticks: [-60, -40, -20, 0], label: '[dB]' },
      height: 110,
    },
    {
      title: '② Spectral Kurtosis',
      series: [{ x: skX, y: skY, color: 'c2', width: 1.8 }],
      annotations: [{ type: 'hline', y: 0, color: 'muted', label: '정규 잡음 = 0', labelAt: 'end' }, { type: 'band', x1: 2800, x2: 4500, color: 'warn' }],
      x: { range: [0, 8192], ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], label: '주파수 [Hz]' },
      y: { range: [-1.2, 1.2], ticks: [-1, -0.5, 0, 0.5, 1], label: 'SK' },
      height: 120,
    },
  ],
};

// ── 그림 7: Kurtogram ──
const grid = kurtogramGrid(kg.kg, fs, 256);
const NL = kg.kg.levels.length;
/** 세로 위치: 레벨 1(넓은 대역)이 맨 위 */
const yPos = (level: number) => NL + 1 - level;
const yEdges = Array.from({ length: NL + 1 }, (_, i) => i + 0.5);
const zRows = Array.from({ length: NL }, (_, j) => grid.z[NL - 1 - j]);
const b = kg.kg.best;
export const kurtogramFig: FigureSpec = {
  id: 'fig-p5-6-7',
  caption: `그림 7. Kurtogram: 세로는 대역폭(위로 갈수록 좁다: 레벨 k의 폭 = 8192/2^k Hz), 가로는 대역의 가운데 주파수(칸은 반 칸씩 겹쳐 옮기므로 색 하나가 그 가운데 근처를 칠한다), 색의 진하기는 그 대역 포락선의 첨도(SK, 0 이하는 칠하지 않음)다. 가장 진한 칸은 레벨 ${b.level}의 ${fmt(b.f1, 4)} ~ ${fmt(b.f2, 4)} Hz(폭 ${fmt(b.bw, 4)} Hz, SK ${fmt(b.sk, 3)})로, 결함이 울리는 3.3 kHz를 담는다. 이 대역으로 엔벨로프 분석하면 BPFO 줄이 바닥의 ${fmt(kg.best.lines[0] / kg.best.floor, 2)}배로 선다.`,
  panels: [
    {
      series: [],
      heatmap: { x: grid.x, y: yEdges, z: zRows, zRange: [0, 1.1], levels: 6, color: 'c2', legend: 'SK' },
      annotations: [
        // 가로가 "가운데 주파수"이므로 칸의 가운데 ± 반 칸 자리에 테두리 (칸 자체는 f1 ~ f2)
        ...([
          [-1, -0.5, 1, -0.5],
          [1, -0.5, 1, 0.5],
          [1, 0.5, -1, 0.5],
          [-1, 0.5, -1, -0.5],
        ] as const).map(([u1, d1, u2, d2]): FigAnnotation => ({ type: 'line', x1: b.fc + (u1 * b.bw) / 4, y1: yPos(b.level) + d1, x2: b.fc + (u2 * b.bw) / 4, y2: yPos(b.level) + d2, color: 'text', width: 2 })),
        { type: 'text', x: b.fc - b.bw / 4 - 120, y: yPos(b.level) - 0.15, text: `가장 큰 SK ${fmt(b.sk, 3)} (${fmt(b.f1, 4)} ~ ${fmt(b.f2, 4)} Hz) →`, anchor: 'end', color: 'text', bold: true },
      ],
      x: { range: [0, 8192], ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], label: '대역 가운데 주파수 [Hz]' },
      y: {
        range: [0.5, NL + 0.5],
        ticks: kg.kg.levels.map(yPos),
        tickLabels: kg.kg.levels.map((l) => ({ value: yPos(l), label: `${fs / 2 / 2 ** l}` })),
        label: '대역폭 [Hz]',
      },
      height: 200,
    },
  ],
};

// ── 그림 8: 내륜 결함 ──
const ib = innerKg.best;
const innerMarks: FigAnnotation[] = [
  { type: 'vline', x: ENV.fr, color: 'muted', dash: true, label: '1X' },
  { type: 'vline', x: BRG.bpfi, color: 'warn', dash: true, label: 'BPFI' },
  { type: 'vline', x: BRG.bpfi - ENV.fr, color: 'muted', dash: true },
  { type: 'vline', x: BRG.bpfi + ENV.fr, color: 'muted', dash: true },
  { type: 'vline', x: 2 * BRG.bpfi, color: 'warn', dash: true, label: '2×' },
];
export const innerRace: FigureSpec = {
  id: 'fig-p5-6-8',
  caption: `그림 8. 내륜 결함의 엔벨로프 스펙트럼 (Kurtogram이 고른 ${fmt(innerKg.kg.best.f1, 4)} ~ ${fmt(innerKg.kg.best.f2, 4)} Hz). 결함이 축과 함께 돌며 하중을 받는 아래쪽을 1X마다 드나들어, 충격 크기가 1X 박자로 오르내린다. 그래서 BPFI(${fmt(BRG.bpfi, 4)} Hz, ${fmt(g(ib.lines[0]), 2)} g) 양옆에 1X 간격의 측대역(${fmt(g(peakNear(ib.env.freq, ib.env.amp, BRG.bpfi - ENV.fr, 3)), 2)}·${fmt(g(peakNear(ib.env.freq, ib.env.amp, BRG.bpfi + ENV.fr, 3)), 2)} g)이 서고, 1X 자체(${fmt(g(peakNear(ib.env.freq, ib.env.amp, ENV.fr, 2)), 2)} g)도 선다 — P2-8의 진폭 변조다.`,
  panels: [
    {
      series: [{ x: Array.from(ib.env.freq), y: Array.from(ib.env.amp, g), color: 'c2', width: 1.4 }],
      annotations: innerMarks,
      x: { range: [0, 1000], ticks: [0, 200, 400, 600, 800, 1000], label: '주파수 [Hz]' },
      y: { range: [0, 0.09], ticks: [0, 0.04, 0.08], label: '[g]' },
      height: 130,
    },
  ],
};
