/**
 * P7-5 "구름베어링" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 결함 주파수는 `lib/machine/frequencies.ts`, 신호는 랩(LAB-BRG-01 · LAB-BRG-02)과 같은 `lib/faults/bearing.ts`로 만든다.
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigPanel, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { peakNear } from '../lib/dsp/envelope';
import { bearingFrequencies, BEARING_6205 } from '../lib/machine/frequencies';
import { G } from '../lib/faults/synth';
import {
  analyzeBearing,
  bearingSignal,
  BRG_DEMO,
  DEMO_ACTUAL,
  DEMO_CALC,
  DEMO_FR,
  envFloor,
  pooledDb,
  ruleOfThumb,
  slippedFrequencies,
  type BearingFault,
  type BearingStage,
} from '../lib/faults/bearing';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';

const fmt = formatNumber;
const FR = DEMO_FR;
const CALC = DEMO_CALC;
const ACT = DEMO_ACTUAL;
const N = BEARING_6205.balls;
const DD = BEARING_6205.ballDiameter / BEARING_6205.pitchDiameter;
const deg = (a: number) => (a * Math.PI) / 180;
const atAlpha = (a: number) => bearingFrequencies({ ...BEARING_6205, contactAngle: deg(a) }, FR);
const upTo = (x: ArrayLike<number>, y: ArrayLike<number>, f1: number, f2: number, scale = 1) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < x.length; i++) if (x[i] >= f1 && x[i] <= f2) { xs.push(x[i]); ys.push(y[i] * scale); }
  return { x: xs, y: ys };
};

const STAGE_LIST: BearingStage[] = [0, 1, 2, 3, 4];
const FAULTS: BearingFault[] = ['outer', 'inner', 'ball', 'cage'];
const an = (f: BearingFault, s: BearingStage) => analyzeBearing(bearingSignal(f, s));
const stageNums = STAGE_LIST.map((s) => an('outer', s).readouts);
/** 그림 4(결함 위치마다의 모양)에 쓰는 단계 — 케이지 결함도 또렷한 3단계 */
const LOC_STAGE: BearingStage = 3;
const envAt = (f: BearingFault, s: BearingStage, hz: number) => {
  const e = an(f, s).env.res;
  return peakNear(e.freq, e.amp, hz, 1.5) / G;
};

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p7-5.test.ts`) */
export const P75_VALUES = {
  fr: FR,
  calc: CALC,
  actual: ACT,
  rule: ruleOfThumb(N, FR),
  dd: DD,
  alpha40: atAlpha(40),
  slip2: slippedFrequencies(BEARING_6205, FR, 0.02),
  /** 위치마다 3단계 공진 대역 엔벨로프 [g] */
  loc: {
    outer: { main: envAt('outer', LOC_STAGE, ACT.bpfo), h2: envAt('outer', LOC_STAGE, 2 * ACT.bpfo), floor: envFloor(an('outer', LOC_STAGE).env.res) / G },
    inner: { main: envAt('inner', LOC_STAGE, ACT.bpfi), lo: envAt('inner', LOC_STAGE, ACT.bpfi - FR), hi: envAt('inner', LOC_STAGE, ACT.bpfi + FR), x1: envAt('inner', LOC_STAGE, FR) },
    ball: { main: envAt('ball', LOC_STAGE, ACT.bsf2), lo: envAt('ball', LOC_STAGE, ACT.bsf2 - ACT.ftf), hi: envAt('ball', LOC_STAGE, ACT.bsf2 + ACT.ftf), bsf: envAt('ball', LOC_STAGE, ACT.bsf), ftf: envAt('ball', LOC_STAGE, ACT.ftf) },
    cage: { main: envAt('cage', LOC_STAGE, ACT.ftf), h2: envAt('cage', LOC_STAGE, 2 * ACT.ftf) },
  },
  /** 외륜 결함 단계 0 ~ 4의 읽음값 */
  stages: stageNums,
  /** 위치마다 단계 0 ~ 4의 읽음값 (랩 해석용) */
  byFault: Object.fromEntries(FAULTS.map((f) => [f, STAGE_LIST.map((s) => an(f, s).readouts)])) as Record<BearingFault, typeof stageNums>,
};
const V = P75_VALUES;

// ── 그림 1: 접촉각 (도식) ──
const PX = 820 / 30;
const X1: [number, number] = [0, 30];
const Y1 = squareYRange(X1, 230);
const R_P = 4.3; // 피치 반지름 (그림 단위)
const R_B = R_P * DD; // 볼 반지름 = d/2 = (d/D) × (D/2)
const AXIS_Y = 0.9;
const bearingSketch = (xc: number, alphaDeg: number, title: string, showDims: boolean): FigAnnotation[] => {
  const yc = AXIS_Y + R_P;
  const a = deg(alphaDeg);
  const s = Math.sin(a);
  const c = Math.cos(a);
  const reach = R_B + 0.75;
  return [
    { type: 'text', x: xc, y: Y1[1] - 0.45, text: title, anchor: 'middle', bold: true },
    { type: 'line', x1: xc - 5.2, y1: AXIS_Y, x2: xc + 5.2, y2: AXIS_Y, color: 'muted', dash: true, width: 1.2 },
    { type: 'text', x: xc + 5.2, y: AXIS_Y - 0.5, text: '축 중심선', anchor: 'end', color: 'muted' },
    // 외륜(위)·내륜(아래): 글자는 볼에 가리지 않게 고리 왼쪽에
    { type: 'rect', x1: xc - 1.5, x2: xc + 1.5, y1: yc + R_B * 0.82, y2: yc + R_B + 0.9, color: 'muted' },
    { type: 'rect', x1: xc - 1.5, x2: xc + 1.5, y1: yc - R_B - 0.9, y2: yc - R_B * 0.82, color: 'c2' },
    { type: 'text', x: xc - 1.7, y: yc + R_B + 0.3, text: '외륜', anchor: 'end', color: 'muted' },
    { type: 'text', x: xc - 1.7, y: yc - R_B - 0.6, text: '내륜', anchor: 'end', color: 'c2' },
    // 앵귤러: 외륜은 오른쪽, 내륜은 왼쪽 어깨(턱)만 높아 볼이 비스듬히 눌린다
    ...(alphaDeg > 0
      ? ([
          { type: 'rect', x1: xc + R_B * 0.98, x2: xc + 1.5, y1: yc + R_B * 0.2, y2: yc + R_B * 0.82, color: 'muted' },
          { type: 'rect', x1: xc - 1.5, x2: xc - R_B * 0.98, y1: yc - R_B * 0.82, y2: yc - R_B * 0.2, color: 'c2' },
        ] as FigAnnotation[])
      : []),
    { type: 'circle', x: xc, y: yc, r: R_B * PX, fill: true, color: 'c1' },
    // 접촉선과 접촉점
    { type: 'line', x1: xc - reach * s, y1: yc - reach * c, x2: xc + reach * s, y2: yc + reach * c, color: 'c3', width: 2 },
    { type: 'point', x: xc + R_B * s, y: yc + R_B * c, color: 'c3' },
    { type: 'point', x: xc - R_B * s, y: yc - R_B * c, color: 'c3' },
    ...(alphaDeg > 0
      ? ([
          { type: 'line', x1: xc, y1: yc, x2: xc, y2: yc + reach + 0.2, color: 'text', dash: true, width: 1 },
          { type: 'text', x: xc + 0.35, y: yc + reach + 0.45, text: `α = ${alphaDeg}°`, anchor: 'start', color: 'c3', bold: true },
        ] as FigAnnotation[])
      : ([{ type: 'text', x: xc + 0.3, y: yc + reach + 0.45, text: 'α = 0', anchor: 'start', color: 'c3', bold: true }] as FigAnnotation[])),
    ...(showDims
      ? ([
          { type: 'arrow', x1: xc - 4.2, y1: AXIS_Y, x2: xc - 4.2, y2: yc, double: true, label: 'D/2', color: 'text', labelDx: -6 },
          { type: 'line', x1: xc - 4.4, y1: yc, x2: xc - R_B, y2: yc, color: 'muted', dash: true, width: 1 },
          { type: 'line', x1: xc, y1: yc + R_B, x2: xc + 2.6, y2: yc + R_B, color: 'muted', dash: true, width: 1 },
          { type: 'line', x1: xc, y1: yc - R_B, x2: xc + 2.6, y2: yc - R_B, color: 'muted', dash: true, width: 1 },
          { type: 'arrow', x1: xc + 2.4, y1: yc - R_B, x2: xc + 2.4, y2: yc + R_B, double: true, label: 'd', color: 'text', labelDx: 8 },
        ] as FigAnnotation[])
      : []),
  ];
};
export const contactAngle: FigureSpec = {
  id: 'fig-p7-5-1',
  caption:
    '그림 1. 구름베어링을 축을 지나는 면으로 자른 단면 (위쪽 절반, 볼 하나). 볼 지름 d, 피치 지름 D(볼 중심이 그리는 원의 지름). 초록 선은 볼이 외륜·내륜에 닿는 두 점을 잇는 접촉선이다. 왼쪽: 깊은 홈 볼베어링은 반경 방향으로 닿는다(접촉각 α = 0). 오른쪽: 앵귤러 볼베어링은 외륜의 오른쪽, 내륜의 왼쪽 어깨(턱)만 높아 볼이 비스듬히 닿고(α ≠ 0) 축방향 하중도 받는다. 볼이 궤도에서 구르는 반지름 D/2 ∓ (d/2)cos α가 α에 따라 달라져 결함 주파수가 바뀐다.',
  panels: [
    {
      frame: false,
      height: 230,
      x: { range: X1 },
      y: { range: Y1 },
      series: [],
      annotations: [...bearingSketch(7.5, 0, '깊은 홈 볼베어링 (α = 0)', true), ...bearingSketch(22.5, 30, '앵귤러 볼베어링 (α ≠ 0)', false)],
    },
  ],
};

// ── 그림 2: 접촉각에 따른 결함 주파수 [X] ──
const ALPHAS = Array.from({ length: 41 }, (_, i) => i);
const curve = (key: 'bpfo' | 'bpfi' | 'bsf2' | 'ftf', mul = 1) => ALPHAS.map((a) => (atAlpha(a)[key] / FR) * mul);
export const alphaEffect: FigureSpec = {
  id: 'fig-p7-5-2',
  caption: `그림 2. 6205의 치수(볼 ${N}개, d/D = ${fmt(DD, 3)})를 그대로 두고 접촉각 α만 바꿨을 때의 결함 주파수 (1X의 배수). α가 커지면 cos α가 작아져 볼이 내륜·외륜에서 구르는 반지름 차이가 줄어든다 — BPFO는 ${fmt(CALC.bpfo / FR, 4)}X → ${fmt(V.alpha40.bpfo / FR, 4)}X로 오르고 BPFI는 ${fmt(CALC.bpfi / FR, 4)}X → ${fmt(V.alpha40.bpfi / FR, 4)}X로 내린다(α = 40°). 둘의 합은 언제나 볼 수 × 1X = ${N}X다. 보라 곡선 2×BSF(볼 결함 박자)는 ${fmt(CALC.bsf2 / FR, 4)}X → ${fmt(V.alpha40.bsf2 / FR, 4)}X로 조금만 오른다. 회색 점선은 어림값 0.4·N_r = ${fmt(0.4 * N, 2)}X와 0.6·N_r = ${fmt(0.6 * N, 2)}X — α = 0, d/D ≈ 0.2일 때 잘 맞고 α가 크면 어긋난다.`,
  panels: [
    {
      series: [
        { x: ALPHAS, y: curve('bpfi'), color: 'c2', width: 2, label: 'BPFI (내륜)' },
        { x: ALPHAS, y: curve('bsf2'), color: 'c4', width: 2, label: '2×BSF (볼)' },
        { x: ALPHAS, y: curve('bpfo'), color: 'c1', width: 2, label: 'BPFO (외륜)' },
      ],
      annotations: [
        { type: 'hline', y: 0.6 * N, label: '0.6·N_r', color: 'muted', dash: true, labelAt: 'end' },
        { type: 'hline', y: 0.4 * N, label: '0.4·N_r', color: 'muted', dash: true, labelAt: 'start', labelBelow: true },
      ],
      x: { range: [0, 40], ticks: [0, 10, 20, 30, 40], label: '접촉각 α [°]' },
      y: { range: [3, 6], ticks: [3, 4, 5, 6], label: '[X]' },
      height: 190,
    },
  ],
};

// ── 그림 3: 볼 결함은 한 번 자전에 두 번 친다 ──
const X3: [number, number] = [0, 30];
const Y3 = squareYRange(X3, 120);
const ballMoment = (xc: number, top: boolean, label: string): FigAnnotation[] => {
  const yc = Y3[1] / 2 - 0.1;
  const r = 1.25;
  const spotY = top ? yc + r : yc - r;
  return [
    { type: 'line', x1: xc - 3.2, y1: yc + r, x2: xc + 3.2, y2: yc + r, color: 'muted', width: 3 },
    { type: 'line', x1: xc - 3.2, y1: yc - r, x2: xc + 3.2, y2: yc - r, color: 'c2', width: 3 },
    { type: 'text', x: xc - 3.4, y: yc + r - 0.12, text: '외륜', anchor: 'end', color: 'muted' },
    { type: 'text', x: xc - 3.4, y: yc - r - 0.12, text: '내륜', anchor: 'end', color: 'c2' },
    { type: 'circle', x: xc, y: yc, r: r * PX, fill: true, color: 'c1' },
    { type: 'circle', x: xc, y: spotY, r: 5, fill: true, color: 'c3' },
    { type: 'text', x: xc, y: Y3[0] + 0.1, text: label, anchor: 'middle', color: top ? 'c1' : 'c2', bold: true },
  ];
};
const T3 = 0.09;
const hits = (() => {
  const xs: number[][] = [[], []];
  const ys: number[][] = [[], []];
  for (let k = 0; k / ACT.bsf2 <= T3; k++) {
    const t = k / ACT.bsf2;
    const w = (k % 2 === 0 ? 1 : 0.6) * (0.55 + 0.45 * Math.cos(2 * Math.PI * ACT.ftf * t));
    xs[k % 2].push(t * 1000);
    ys[k % 2].push(w);
  }
  return { xs, ys };
})();
export const ballTwice: FigureSpec = {
  id: 'fig-p7-5-3',
  caption: `그림 3. 볼 결함은 볼이 한 바퀴 자전하는 동안 두 번 친다. 위: 흠(초록 점)이 외륜에 닿고, 반 바퀴 뒤에는 내륜에 닿는다. 아래: 충격 시각 (외륜 쪽 파랑, 내륜 쪽 주황, 높이는 설명용 세기). 충격 간격은 1/(2×BSF) = ${fmt(1000 / ACT.bsf2, 3)} ms이고 같은 쪽끼리는 1/BSF = ${fmt(1000 / ACT.bsf, 3)} ms다. 내륜 쪽 충격은 볼을 거쳐 하우징에 닿아 더 약하다. 볼은 케이지와 함께 돌아 하중 영역을 FTF 주기(${fmt(1000 / ACT.ftf, 3)} ms)마다 한 번 지나므로, 충격 크기가 FTF로 오르내린다.`,
  panels: [
    {
      frame: false,
      height: 120,
      x: { range: X3 },
      y: { range: Y3 },
      series: [],
      annotations: [
        ...ballMoment(8, true, '흠이 외륜에 닿는 순간'),
        { type: 'arrow', x1: 12.6, y1: Y3[1] / 2, x2: 17.4, y2: Y3[1] / 2, label: '자전 반 바퀴', color: 'text' },
        ...ballMoment(22, false, '반 바퀴 뒤: 흠이 내륜에 닿는다'),
      ],
    },
    {
      title: '충격 시각과 세기 (볼 결함, 설명용)',
      series: [
        { x: hits.xs[0], y: hits.ys[0], kind: 'stem', color: 'c1', label: '외륜에 닿을 때', radius: 3 },
        { x: hits.xs[1], y: hits.ys[1], kind: 'stem', color: 'c2', label: '내륜에 닿을 때', radius: 3 },
      ],
      annotations: [
        { type: 'arrow', x1: 0, y1: 1.12, x2: 1000 / ACT.bsf2, y2: 1.12, double: true, label: '1/(2·BSF)', color: 'text', labelDy: -4 },
        { type: 'arrow', x1: 0, y1: 1.32, x2: 1000 / ACT.ftf, y2: 1.32, double: true, label: `FTF 주기 ${fmt(1000 / ACT.ftf, 3)} ms`, color: 'muted', labelDy: -4 },
      ],
      x: { range: [0, T3 * 1000], label: '시각 [ms]' },
      y: { range: [0, 1.45], ticks: [0, 0.5, 1], label: '세기' },
      height: 140,
    },
  ],
};

// ── 그림 4: 결함 위치마다의 엔벨로프 스펙트럼 (3단계, 공진 대역) ──
const ENV_MAX = 500;
/** 세로 눈금 끝: 짧은 숫자가 되도록 정해 둔 값 중 봉우리를 담는 가장 작은 것 */
const NICE_TOPS = [0.005, 0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5];
const envPanel = (f: BearingFault, title: string, color: FigColor, marks: { x: number; label?: string; color?: FigColor }[], extra: FigAnnotation[] = [], last = false): FigPanel => {
  const e = an(f, LOC_STAGE).env.res;
  const d = upTo(e.freq, e.amp, 0, ENV_MAX, 1 / G);
  const top = Math.max(...d.y.filter((_, i) => d.x[i] > 5));
  const yMax = NICE_TOPS.find((v) => v >= top * 1.15) ?? 1;
  return {
    title,
    series: [{ x: d.x, y: d.y, color, width: 1.3 } as FigSeries],
    annotations: [...marks.map((m): FigAnnotation => ({ type: 'vline', x: m.x, color: m.color ?? 'muted', dash: true, label: m.label })), ...extra],
    x: { range: [0, ENV_MAX], ...(last ? { label: '주파수 [Hz]' } : {}) },
    y: { range: [0, yMax], ticks: [0, yMax], label: '[g]' },
    height: 90,
  };
};
export const locationPatterns: FigureSpec = {
  id: 'fig-p7-5-4',
  caption: `그림 4. 결함 위치마다의 엔벨로프 스펙트럼 (펌프 ${BRG_DEMO.rpm} rpm, 6205, 3단계, 대역 2.8 ~ 3.8 kHz, 설명용). 점선은 실제 신호의 결함 주파수다(미끄럼 1 %로 계산값보다 조금 어긋난 자리). ① 외륜: BPFO(${fmt(ACT.bpfo, 4)} Hz)와 하모닉만, 측대역이 없다. ② 내륜: BPFI(${fmt(ACT.bpfi, 4)} Hz) 양옆에 1X 간격의 측대역과 1X 자체. ③ 볼: 2×BSF(${fmt(ACT.bsf2, 4)} Hz)가 가장 크고 양옆 ${fmt(ACT.ftf, 3)} Hz(FTF) 자리에 측대역(−FTF·+FTF), 낮은 쪽에 FTF·BSF. ④ 케이지: FTF(${fmt(ACT.ftf, 4)} Hz)와 그 하모닉 — 기본 줄 FTF는 1X보다 낮고 하모닉은 1X 위로도 이어진다. 다른 위치보다 줄이 7 ~ 14배 작다.`,
  panels: [
    envPanel('outer', '① 외륜 결함', 'c1', [{ x: ACT.bpfo, label: 'BPFO' }, { x: 2 * ACT.bpfo, label: '2×' }]),
    envPanel('inner', '② 내륜 결함', 'c2', [{ x: FR, label: '1X' }, { x: ACT.bpfi - FR, label: '−1X' }, { x: ACT.bpfi, label: 'BPFI' }, { x: ACT.bpfi + FR, label: '+1X' }]),
    envPanel('ball', '③ 볼 결함', 'c4', [{ x: ACT.ftf, label: 'FTF' }, { x: ACT.bsf, label: 'BSF' }, { x: ACT.bsf2, label: '2×BSF' }], [
      { type: 'text', x: ACT.bsf2 - ACT.ftf, y: V.loc.ball.lo + 0.012, text: '−FTF', anchor: 'middle', color: 'muted' },
      { type: 'text', x: ACT.bsf2 + ACT.ftf, y: V.loc.ball.hi + 0.012, text: '+FTF', anchor: 'middle', color: 'muted' },
    ]),
    envPanel('cage', '④ 케이지 결함', 'c3', [{ x: ACT.ftf, label: 'FTF' }, { x: FR, label: '1X', color: 'c1' }], [], true),
  ],
};

// ── 그림 5: 단계마다의 가속도 스펙트럼 (dB) ──
const accDb = (s: BearingStage) => {
  const sig = bearingSignal('outer', s);
  const sp = singleSidedSpectrum({ fs: sig.fs, x: sig.acc }, { window: 'hann' });
  return pooledDb(sp.frequency, sp.amplitude, 64);
};
const DB_RANGE: [number, number] = [-90, 0];
const healthyDb = accDb(0);
const STAGE_NOTE: Record<number, string> = {
  1: '1단계: 초음파 대역에만 작은 언덕',
  2: '2단계: 부품 공진(3.3 kHz)이 울린다',
  3: '3단계: 울림이 커지고 낮은 주파수에도 결함 줄',
  4: '4단계: 바닥 전체가 올라간다',
};
const kHz = (v: number) => v / 1000;
export const stagesAcc: FigureSpec = {
  id: 'fig-p7-5-5',
  caption: `그림 5. 외륜 결함이 진행하는 네 단계의 가속도 스펙트럼 (dB re 1 g, 0 ~ 32 kHz, 회색 = 건전, 설명용 모델). 음영은 일반 가속도 측정 대역(0 ~ 10 kHz)이다. 12 kHz 아래의 높은 바닥은 기계의 다른 소리(유동·전자기 등)이고, 그 위는 조용하다. 1단계의 작은 충격은 3.3 kHz 공진을 거의 울리지 못해 일반 측정 대역은 건전과 같고, 조용한 12 kHz 위 대역이 올라오며 24 kHz 둘레가 건전보다 약 25 dB 높아 가장 많이 올라온다. 2단계에서 3.3 kHz 부품 공진이 울리기 시작하고, 3단계에서는 울림이 커진다. 4단계에서는 손상이 넓어져 넓은 대역의 바닥이 함께 올라간다.`,
  panels: ([1, 2, 3, 4] as BearingStage[]).map((s, i): FigPanel => {
    const d = accDb(s);
    return {
      title: STAGE_NOTE[s],
      series: [
        { x: healthyDb.x.map(kHz), y: healthyDb.y, color: 'muted', width: 1, label: i === 0 ? '건전' : undefined },
        { x: d.x.map(kHz), y: d.y, color: 'c1', width: 1.2, label: i === 0 ? '결함' : undefined },
      ],
      annotations: [{ type: 'band', x1: 0, x2: kHz(BRG_DEMO.normalHz), color: 'muted', label: i === 0 ? '일반 측정 0 ~ 10 kHz' : undefined }],
      x: { range: [0, 32], ticks: [0, 5, 10, 15, 20, 25, 30], ...(i === 3 ? { label: '주파수 [kHz]' } : {}) },
      y: { range: DB_RANGE, ticks: [-90, -60, -30, 0], label: '[dB]' },
      height: 85,
      legend: i === 0,
    };
  }),
};

// ── 그림 6: 단계마다의 속도 스펙트럼 ──
const velPanel = (s: BearingStage, title: string, last = false): FigPanel => {
  const v = an('outer', s).vel;
  const d = upTo(v.freq, v.amp, 0, 1000);
  return {
    title,
    series: [{ x: d.x, y: d.y, color: 'c1', width: 1.2 }],
    annotations: [
      { type: 'vline', x: FR, color: 'muted', dash: true, label: '1X' },
      ...[1, 2, 3].map((k): FigAnnotation => ({ type: 'vline', x: k * ACT.bpfo, color: 'warn', dash: true, label: k === 1 ? 'BPFO' : `${k}×` })),
    ],
    x: { range: [0, 1000], ...(last ? { label: '주파수 [Hz]' } : {}) },
    y: { range: [0, 3.2], ticks: [0, 1, 2, 3], label: '[mm/s]' },
    height: 90,
  };
};
export const stagesVel: FigureSpec = {
  id: 'fig-p7-5-6',
  caption: `그림 6. 같은 외륜 결함의 속도 스펙트럼 0 ~ 1000 Hz (mm/s rms). 2단계에는 결함 줄이 없다(BPFO ${fmt(V.stages[2].velDefect, 2)} mm/s) — 엔벨로프에는 이미 또렷한데도. 3단계에서 BPFO와 하모닉이 선다(BPFO ${fmt(V.stages[3].velDefect, 2)} mm/s). 4단계에서는 1X가 ${fmt(V.stages[4].vel1X, 2)} mm/s로 커지고 바닥이 조금 올라오며, BPFO 줄은 ${fmt(V.stages[4].velDefect, 2)} mm/s로 오히려 작아져 바닥에 묻혀 간다.`,
  panels: [velPanel(2, '2단계'), velPanel(3, '3단계'), velPanel(4, '4단계', true)],
};

// ── 그림 7: 단계마다 잘 보이는 숫자 ──
const SX = STAGE_LIST.map((s) => s);
const stageTicks = STAGE_LIST.map((s) => ({ value: s, label: s === 0 ? '건전' : `${s}단계` }));
const bar = (dx: number, ys: number[], color: FigColor, label: string): FigSeries => ({ x: SX.map((x) => x + dx), y: ys, kind: 'bar', color, barWidth: 0.32, label });
export const stageNumbers: FigureSpec = {
  id: 'fig-p7-5-7',
  caption: `그림 7. 외륜 결함의 단계마다 결함이 잘 보이는 숫자가 옮겨 간다. 위: 엔벨로프 스펙트럼의 BPFO 줄 ÷ 바닥 — 초음파 대역(20 ~ 28 kHz)은 1단계부터 ${fmt(V.stages[1].envRatio.ultra, 2)}배, 공진 대역(2.8 ~ 3.8 kHz)은 2단계부터 ${fmt(V.stages[2].envRatio.res, 3)}배, 4단계에는 ${fmt(V.stages[4].envRatio.ultra, 2)}배·${fmt(V.stages[4].envRatio.res, 2)}배로 떨어진다. 가운데: 속도 스펙트럼의 BPFO 줄은 3단계에만 크고, 1X는 4단계에 커진다. 아래: 가속도 첨도(0 ~ 10 kHz)는 2 ~ 3단계에 오르고 4단계에 다시 3 근처로 내려온다 (P5-7).`,
  panels: [
    {
      title: '엔벨로프: BPFO 줄 ÷ 바닥',
      series: [bar(-0.17, V.stages.map((r) => r.envRatio.ultra), 'c3', '초음파 대역'), bar(0.17, V.stages.map((r) => r.envRatio.res), 'c4', '공진 대역')],
      x: { range: [-0.5, 4.5], ticks: SX, tickLabels: stageTicks },
      y: { range: [0, 200], ticks: [0, 100, 200], label: '[배]' },
      height: 105,
    },
    {
      title: '속도 [mm/s]',
      series: [bar(-0.17, V.stages.map((r) => r.velDefect), 'warn', 'BPFO 줄'), bar(0.17, V.stages.map((r) => r.vel1X), 'c1', '1X')],
      x: { range: [-0.5, 4.5], ticks: SX, tickLabels: stageTicks },
      y: { range: [0, 3.2], ticks: [0, 1, 2, 3], label: '[mm/s]' },
      height: 105,
    },
    {
      title: '가속도 첨도 (0 ~ 10 kHz)',
      series: [{ x: SX, y: V.stages.map((r) => r.kurtosis), kind: 'bar', color: 'c1', barWidth: 0.4 }],
      annotations: [{ type: 'hline', y: 3, label: '정규 잡음 3', color: 'muted', dash: true, labelAt: 'end' }],
      x: { range: [-0.5, 4.5], ticks: SX, tickLabels: stageTicks },
      y: { range: [0, 7], ticks: [0, 3, 6], label: 'K' },
      height: 105,
    },
  ],
};
