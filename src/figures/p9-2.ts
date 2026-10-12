/**
 * P9-2 "밸런싱" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 계산은 랩(LAB-BAL-01)과 같은 `lib/fieldwork/balance.ts`로 한다. 각은 키페이저 기준·회전 반대 방향(P3-3 지연각과 같은 방향),
 * 극좌표 그림은 0°가 위, 각이 커질수록 시계 방향 (축은 반시계로 돈다): x = A sin φ, y = A cos φ.
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import {
  angleOf,
  BAL_ROTOR,
  balance,
  cabs,
  csub,
  fourRun,
  fourRunAmplitudes,
  influenceMatrix,
  permissibleUnbalance,
  splitWeight,
  toUmPP,
  trialSizeStudy,
  type Cx,
  type Weight,
} from '../lib/fieldwork/balance';

const fmt = formatNumber;
const RAD = Math.PI / 180;
const range = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
const um = (z: Cx) => toUmPP(cabs(z));
const xy = (amp: number, deg: number): [number, number] => [amp * Math.sin(deg * RAD), amp * Math.cos(deg * RAD)];
const circle = (r: number, cx = 0, cy = 0, n = 180) => {
  const t = range(0, 360, n);
  return { x: t.map((d) => cx + r * Math.sin(d * RAD)), y: t.map((d) => cy + r * Math.cos(d * RAD)) };
};
const arrowTo = (z: Cx, color: FigColor, from: [number, number] = [0, 0]): FigAnnotation => {
  const [x2, y2] = xy(um(z), angleOf(z));
  return { type: 'arrow', x1: from[0], y1: from[1], x2: from[0] + x2, y2: from[1] + y2, color, double: false };
};
const wfmt = (w: Weight) => `${fmt(w.g, 3)} g∠${fmt(w.deg, 4)}°`;
const vfmt = (z: Cx) => `${fmt(um(z), 3)} µm∠${fmt(angleOf(z), 3)}°`;

const BASE = { trialG: 30, trialDeg: 0, noise: 0, holes: 0, runoutUncomp: false } as const;
const S1 = balance({ method: 1, caseId: 'static', ...BASE });
const S2 = balance({ method: 2, caseId: 'static', ...BASE });
const C1 = balance({ method: 1, caseId: 'couple', ...BASE });
const C2 = balance({ method: 2, caseId: 'couple', ...BASE });
const D12 = balance({ method: 2, caseId: 'dynamic', ...BASE, holes: 12 });
const NOISY = balance({ method: 1, caseId: 'static', ...BASE, noise: 2 });
const RO = balance({ method: 2, caseId: 'static', ...BASE, runoutUncomp: true });
const A3000 = influenceMatrix(3000);
const FR = fourRunAmplitudes('static', 30);
const FRS = fourRun(FR.A0, FR.A, 30);
const TRIALS = [5, 10, 15, 20, 30, 40, 60, 80, 100, 120];
const STUDY = trialSizeStudy(TRIALS, { noise: 2, repeats: 200 });
const G_EX = permissibleUnbalance(2.5, BAL_ROTOR.rpm, BAL_ROTOR.mass);
/** 시험추 출발점: 원심력 = 그 베어링이 받는 로터 무게의 10 % */
const TRIAL_START_G = ((0.1 * (BAL_ROTOR.mass * 9.81)) / 2 / (BAL_ROTOR.radius * ((2 * Math.PI * BAL_ROTOR.rpm) / 60) ** 2)) * 1000;

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p9-2.test.ts`) */
export const P92_VALUES = {
  a11: { um: um(A3000[0][0]) * 1e-3 * BAL_ROTOR.radius, deg: angleOf(A3000[0][0]) },
  a12: { um: um(A3000[0][1]) * 1e-3 * BAL_ROTOR.radius, deg: angleOf(A3000[0][1]) },
  s1: {
    V0: S1.runs[0].meas.map((z) => ({ um: um(z), deg: angleOf(z) })),
    V1: S1.runs[1].meas.map((z) => ({ um: um(z), deg: angleOf(z) })),
    dV: { um: um(csub(S1.runs[1].meas[0], S1.runs[0].meas[0])), deg: angleOf(csub(S1.runs[1].meas[0], S1.runs[0].meas[0])) },
    corr: S1.correction[0],
    afterB2: um(S1.afterTrue[1]),
  },
  s2corr: S2.correction,
  c1: { before: C1.runs[0].meas.map(um), after: C1.afterTrue.map(um), corr: C1.correction[0] },
  c2: { corr: C2.correction, after: C2.afterTrue.map(um) },
  split: D12.installed,
  dynCorr: D12.correction,
  noisy: { corr: NOISY.correction[0], after: NOISY.afterTrue.map(um) },
  runout: { meas: RO.afterMeas.map(um), true: RO.afterTrue.map(um), trueDeg: RO.afterTrue.map(angleOf) },
  four: { A0: FR.A0, A: FR.A, T: FRS.T, alpha: FRS.alpha, corr: FRS.correction },
  study: STUDY,
  gEx: G_EX,
  trialStartG: TRIAL_START_G,
};
const V = P92_VALUES;

// ── 그림 1: 1면 영향계수 — 벡터 그림과 원판 위의 추 ──
const X1: [number, number] = [-77, 77];
const H1 = 330;
const grid1: FigSeries[] = [10, 20, 30, 40, 50].map((r) => ({ ...circle(r), color: 'muted' as const, width: 0.8, opacity: 0.5 }));
const spokes1: FigAnnotation[] = [0, 90, 180, 270].map((d) => {
  const [x, y] = xy(52, d);
  return { type: 'line' as const, x1: 0, y1: 0, x2: x, y2: y, color: 'muted' as const, width: 0.6, dash: true };
});
const v0 = S1.runs[0].meas[0];
const v1 = S1.runs[1].meas[0];
const [v0x, v0y] = xy(um(v0), angleOf(v0));
const [v1x, v1y] = xy(um(v1), angleOf(v1));
const X1b: [number, number] = [-4.5, 4.5];
const discR = 1;
const discPx = (820 / (X1b[1] - X1b[0])) * discR;
const dot = (deg: number, r = discR) => xy(r, deg);
export const influenceFig: FigureSpec = {
  id: 'fig-p9-2-1',
  caption: `그림 1. 1면 영향계수법(정적 위주 로터, 베어링 1 수평, 3000 rpm). 위: 처음 진동 V₀ = ${vfmt(v0)}(파랑). 평면 1에 시험추(${wfmt({ g: 30, deg: 0 })})를 달자 V₁ = ${vfmt(v1)}(주황)로 바뀌었다. 두 벡터 끝을 잇는 ΔV = V₁ − V₀ = ${fmt(V.s1.dV.um, 3)} µm∠${fmt(V.s1.dV.deg, 2)}°(갈색)가 시험추 하나가 만든 몫이다 → 영향계수 H = ΔV/W_t = ${fmt(V.a11.um, 3)} µm/g∠${fmt(V.a11.deg, 2)}°. 보정추는 V₀를 지울 몫 −V₀(초록 점선)를 만들어야 하므로 W_c = −V₀/H = ${wfmt(V.s1.corr)}. 아래: 원판에서 본 자리. 각은 키페이저 표시(0°)에서 회전 반대 방향으로 잰다.`,
  panels: [
    {
      frame: false,
      height: H1,
      x: { range: X1 },
      y: { range: squareYRange(X1, H1, -27) },
      series: grid1,
      annotations: [
        ...spokes1,
        { type: 'text', x: 0, y: 46.5, text: '0°', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 53, y: -1.5, text: '90°', anchor: 'start', color: 'muted' },
        { type: 'text', x: -53, y: -1.5, text: '270°', anchor: 'end', color: 'muted' },
        { type: 'text', x: 60, y: 30, text: '10 µm 간격', anchor: 'start', color: 'muted' },
        arrowTo(v0, 'c1'),
        arrowTo(v1, 'c2'),
        { type: 'arrow', x1: v0x, y1: v0y, x2: v1x, y2: v1y, color: 'warn', double: false },
        { type: 'arrow', x1: -0.8 * v0x, y1: -0.8 * v0y, x2: -v0x, y2: -v0y, color: 'c3', double: false },
        { type: 'line', x1: 0, y1: 0, x2: -v0x, y2: -v0y, color: 'c3', dash: true, width: 2 },
        { type: 'text', x: v0x + 3, y: v0y - 3, text: `V₀ ${fmt(um(v0), 3)} µm∠${fmt(angleOf(v0), 3)}°`, anchor: 'start', color: 'c1', bold: true },
        { type: 'text', x: v1x + 3, y: v1y + 1, text: `V₁ ${fmt(um(v1), 3)} µm∠${fmt(angleOf(v1), 3)}°`, anchor: 'start', color: 'c2', bold: true },
        { type: 'text', x: (v0x + v1x) / 2 + 4, y: (v0y + v1y) / 2 - 2, text: 'ΔV = H·W_t', anchor: 'start', color: 'warn' },
        { type: 'text', x: -v0x - 3, y: -v0y - 2, text: '−V₀ (보정추가 만들 몫)', anchor: 'end', color: 'c3' },
      ],
    },
    {
      frame: false,
      height: 250,
      x: { range: X1b },
      y: { range: squareYRange(X1b, 250, -1.7) },
      series: [],
      annotations: [
        { type: 'circle', x: 0, y: 0, r: discPx, color: 'muted' },
        { type: 'line', x1: 0, y1: 0.85, x2: 0, y2: 1.15, color: 'text', width: 3 },
        { type: 'text', x: 0.12, y: 1.32, text: '키페이저 표시 0°', anchor: 'start' },
        { type: 'point', x: dot(0, 0.82)[0], y: dot(0, 0.82)[1], color: 'c2' },
        { type: 'text', x: -0.3, y: 1.05, text: `시험추 30 g∠0°`, anchor: 'end', color: 'c2' },
        { type: 'point', x: dot(V.s1.corr.deg, 0.82)[0], y: dot(V.s1.corr.deg, 0.82)[1], color: 'c3' },
        { type: 'text', x: dot(V.s1.corr.deg, 0.82)[0] - 0.15, y: dot(V.s1.corr.deg, 0.82)[1] - 0.25, text: `보정추 ${wfmt(V.s1.corr)}`, anchor: 'end', color: 'c3', bold: true },
        { type: 'arrow', x1: -1.35, y1: 0.55, x2: -1.35, y2: -0.55, color: 'muted', double: false },
        { type: 'text', x: -1.5, y: 0, text: '축 회전 (반시계)', anchor: 'end', color: 'muted' },
        { type: 'arrow', x1: 1.35, y1: 0.55, x2: 1.35, y2: -0.55, color: 'c1', double: false },
        { type: 'text', x: 1.5, y: 0, text: '각이 커지는 쪽 (회전 반대)', anchor: 'start', color: 'c1' },
      ],
    },
  ],
};

// ── 그림 2: 두 평면과 두 베어링 — 1면으로는 커플을 못 잡는다 ──
const X2: [number, number] = [0, 20];
const bars = (r1: number[], r2: number[], r3: number[]): FigSeries[] => [
  { x: [0.75, 1.75], y: r1, kind: 'bar', barWidth: 0.24, color: 'c1', label: '처음' },
  { x: [1, 2], y: r2, kind: 'bar', barWidth: 0.24, color: 'c2', label: '1면 보정 뒤' },
  { x: [1.25, 2.25], y: r3, kind: 'bar', barWidth: 0.24, color: 'c3', label: '2면 보정 뒤' },
];
const zeroMarks = (vals: number[][]): FigAnnotation[] =>
  vals.flatMap((row, k) => row.map((v, j) => ({ v, x: [0.75, 1, 1.25][k] + j }))).filter((q) => q.v < 0.05).map((q) => ({ type: 'text' as const, x: q.x, y: 2.5, text: '0', anchor: 'middle' as const, bold: true }));
const barAxis = { range: [0.4, 2.6] as [number, number], ticks: [1, 2], tickLabels: [{ value: 1, label: '베어링 1' }, { value: 2, label: '베어링 2' }] };
export const twoPlaneFig: FigureSpec = {
  id: 'fig-p9-2-2',
  caption: `그림 2. 위: 로터의 두 보정 평면은 각자 가까운 베어링을 주로 흔들지만 먼 베어링도 조금 흔든다(평면 1의 추 1 g → 베어링 1 ${fmt(V.a11.um, 3)} µm∠${fmt(V.a11.deg, 2)}°, 베어링 2 ${fmt(V.a12.um, 2)} µm∠${fmt(V.a12.deg, 4)}°). 가운데: 정적 위주 로터. 1면 보정은 베어링 1을 0으로 만들지만 베어링 2는 ${fmt(V.s1.V0[1].um, 3)} → ${fmt(V.s1.afterB2, 3)} µm로 오히려 조금 커진다. 아래: 커플 위주 로터. 1면 보정 뒤 베어링 2가 ${fmt(V.c1.before[1], 3)} → ${fmt(V.c1.after[1], 3)} µm로 거의 그대로다. 2면 보정(초록)은 두 베어링을 함께 0으로 만든다(잡음 없는 가상 로터).`,
  panels: [
    {
      frame: false,
      height: 150,
      x: { range: X2 },
      y: { range: squareYRange(X2, 150, -2.2) },
      series: [],
      annotations: [
        { type: 'line', x1: 1.2, y1: 0, x2: 18.8, y2: 0, width: 5, color: 'text' },
        { type: 'rect', x1: 2.2, x2: 3.4, y1: -0.9, y2: -0.25, label: '' },
        { type: 'rect', x1: 16.6, x2: 17.8, y1: -0.9, y2: -0.25, label: '' },
        { type: 'text', x: 2.8, y: -1.6, text: '베어링 1', anchor: 'middle' },
        { type: 'text', x: 17.2, y: -1.6, text: '베어링 2', anchor: 'middle' },
        { type: 'rect', x1: 4.6, x2: 5.2, y1: -1.1, y2: 1.1, color: 'c2' },
        { type: 'rect', x1: 14.8, x2: 15.4, y1: -1.1, y2: 1.1, color: 'c2' },
        { type: 'text', x: 4.9, y: 1.5, text: '평면 1', anchor: 'middle', color: 'c2', bold: true },
        { type: 'text', x: 15.1, y: 1.5, text: '평면 2', anchor: 'middle', color: 'c2', bold: true },
        { type: 'text', x: 10, y: 1.2, text: '정적: 두 평면이 같은 쪽 → 두 베어링이 같은 위상', anchor: 'middle', color: 'c1' },
        { type: 'text', x: 10, y: 0.45, text: '커플: 두 평면이 반대쪽 → 두 베어링이 반대 위상', anchor: 'middle', color: 'c4' },
      ],
    },
    {
      title: '정적 위주 [µm p-p]',
      height: 140,
      x: barAxis,
      y: { range: [0, 45] },
      series: bars(V.s1.V0.map((v) => v.um), S1.afterTrue.map(um), S2.afterTrue.map(um)),
      annotations: zeroMarks([V.s1.V0.map((v) => v.um), S1.afterTrue.map(um), S2.afterTrue.map(um)]),
    },
    {
      title: '커플 위주 [µm p-p]',
      height: 140,
      x: barAxis,
      y: { range: [0, 45] },
      legend: false,
      series: bars(V.c1.before, V.c1.after, V.c2.after),
      annotations: zeroMarks([V.c1.before, V.c1.after, V.c2.after]),
    },
  ],
};

// ── 그림 3: 시험추 크기 — 흔들림보다 뚜렷하게 ──
export const trialFig: FigureSpec = {
  id: 'fig-p9-2-3',
  caption: `그림 3. 런마다 측정 벡터가 2 µm p-p(σ)씩 흔들릴 때, 시험추 질량에 따라 1면 보정 뒤 베어링 1에 남는 진동(정적 위주 로터, 200번 반복). 파랑 = 중앙값, 회색 점선 = 열 번 중 아홉 번이 이 아래. 시험추가 10 g이면 그 효과(약 ${fmt(V.a11.um * 10, 2)} µm)가 흔들림(2 µm)의 약 3배뿐이라 남는 진동의 중앙값이 ${fmt(V.study[1].median, 3)} µm(처음 ${fmt(V.s1.V0[0].um, 3)} µm의 절반)이다. 30 g이면 ${fmt(V.study[4].median, 2)} µm, 80 g이면 ${fmt(V.study[7].median, 2)} µm로 내려간다. 세로 점선은 흔한 출발점(시험추 원심력 = 그 베어링이 받는 로터 무게의 10 %, 이 로터에서 약 ${fmt(V.trialStartG, 2)} g).`,
  panels: [
    {
      height: 210,
      x: { range: [0, 125], label: '시험추 [g] (반지름 200 mm)' },
      y: { range: [0, 40], label: '남는 진동 [µm p-p]' },
      legend: false,
      series: [
        { x: STUDY.map((q) => q.g), y: STUDY.map((q) => q.p90), color: 'muted', dash: true, width: 1.4 },
        { x: STUDY.map((q) => q.g), y: STUDY.map((q) => q.median), color: 'c1', width: 1.8 },
        { x: STUDY.map((q) => q.g), y: STUDY.map((q) => q.median), kind: 'dots', color: 'c1', radius: 3.5 },
      ],
      annotations: [
        { type: 'hline', y: V.s1.V0[0].um, color: 'warn', dash: true, label: `처음 ${fmt(V.s1.V0[0].um, 3)} µm`, labelAt: 'end' },
        { type: 'vline', x: TRIAL_START_G, color: 'muted', dash: true, label: `출발점 ${fmt(V.trialStartG, 2)} g` },
      ],
    },
  ],
};

// ── 그림 4: 4-run — 진폭 네 개로 그리는 원 ──
const X4: [number, number] = [-75, 75];
const H4 = 380;
const centers = [0, 120, 240].map((d) => xy(FRS.T, d + 180));
const tip = xy(FR.A0, FRS.alpha);
const RUN_COLOR = ['c2', 'c3', 'c4'] as const;
export const fourRunFig: FigureSpec = {
  id: 'fig-p9-2-4',
  caption: `그림 4. 위상 없이 진폭만으로 보정하는 4-run법(같은 로터, 베어링 1). 처음 진폭 A₀ = ${fmt(FR.A0, 3)} µm, 같은 시험추 30 g을 0° · 120° · 240°에 차례로 달았을 때 A₁ = ${fmt(FR.A[0], 3)}, A₂ = ${fmt(FR.A[1], 3)}, A₃ = ${fmt(FR.A[2], 3)} µm. 시험추 효과의 크기는 T² = (A₁² + A₂² + A₃²)/3 − A₀²에서 T = ${fmt(FRS.T, 3)} µm. 원점에서 T만큼 떨어진 세 점(시험추 자리의 반대쪽)을 중심으로 반지름 A₁ · A₂ · A₃의 원을 그리면, 반지름 A₀의 원(파랑)과 한 점에서 만난다 — 그 점이 처음 진동의 자리(∠${fmt(FRS.alpha, 3)}°). 보정추는 그 반대쪽 ${fmt(V.four.corr.deg, 4)}°에 30 g × A₀/T = ${fmt(V.four.corr.g, 3)} g으로, 영향계수법의 결과(그림 1)와 같다.`,
  panels: [
    {
      frame: false,
      height: H4,
      x: { range: X4 },
      y: { range: squareYRange(X4, H4, -35) },
      series: [
        { ...circle(FR.A0), color: 'c1', width: 1.8 },
        ...centers.map((c, k) => ({ ...circle(FR.A[k], c[0], c[1]), color: RUN_COLOR[k], width: 1.4 })),
      ],
      annotations: [
        { type: 'point', x: 0, y: 0, color: 'muted', label: '원점' },
        ...centers.map((c, k) => ({ type: 'point' as const, x: c[0], y: c[1], color: RUN_COLOR[k] })),
        ...centers.map((c, k) => ({ type: 'text' as const, x: c[0] + (k === 1 ? -2 : 2), y: c[1] - 4, text: `시험추 ${[0, 120, 240][k]}° → 반지름 A${k + 1}`, anchor: (k === 1 ? 'end' : 'start') as 'end' | 'start', color: RUN_COLOR[k] })),
        { type: 'point', x: tip[0], y: tip[1], color: 'warn' },
        { type: 'text', x: tip[0] + 3, y: tip[1] + 3, text: `만나는 점 = 처음 진동 ∠${fmt(FRS.alpha, 3)}°`, anchor: 'start', color: 'warn', bold: true },
        { type: 'arrow', x1: 0, y1: 0, x2: tip[0], y2: tip[1], color: 'warn', double: false },
        { type: 'text', x: -FR.A0 * 0.72, y: FR.A0 * 0.72 + 3, text: `반지름 A₀ = ${fmt(FR.A0, 3)}`, anchor: 'end', color: 'c1' },
      ],
    },
  ],
};

// ── 그림 5: 분할추 — 고정 구멍 두 곳에 나눠 달기 ──
const X5: [number, number] = [-5, 5];
const H5 = 300;
const R5 = 1.6;
const gScale = 1 / 40;
const holes = range(0, 330, 11);
const dc = V.dynCorr[0];
const [ha, hb] = V.split[0];
const pa = xy(ha.g * gScale, ha.deg);
const pb = xy(hb.g * gScale, hb.deg);
const pc = xy(dc.g * gScale, dc.deg);
export const splitFig: FigureSpec = {
  id: 'fig-p9-2-5',
  caption: `그림 5. 평면 1에 ${wfmt(dc)}를 달아야 하는데 구멍이 30°마다(12개) 뚫려 있다(동적 로터). 양옆 구멍 0°와 30°에 나눠 단다: 0°에 ${fmt(ha.g, 3)} g, 30°에 ${fmt(hb.g, 3)} g. 두 추의 벡터 합(점선 평행사변형)이 원래 추와 같아 진동은 똑같이 0이 된다. 나눈 질량의 합(${fmt(ha.g + hb.g, 3)} g)은 원래 추보다 크다 — 벡터로 더하기 때문이다.`,
  panels: [
    {
      frame: false,
      height: H5,
      x: { range: X5 },
      y: { range: squareYRange(X5, H5, -2.0) },
      series: [{ ...circle(R5), color: 'muted', width: 1 }],
      annotations: [
        ...holes.map((d) => ({ type: 'point' as const, x: xy(R5, d)[0], y: xy(R5, d)[1], color: 'muted' as const })),
        { type: 'text', x: 0, y: R5 + 0.15, text: '0°', anchor: 'middle', color: 'muted' },
        { type: 'arrow', x1: 0, y1: 0, x2: pa[0], y2: pa[1], color: 'c1', double: false },
        { type: 'arrow', x1: 0, y1: 0, x2: pb[0], y2: pb[1], color: 'c1', double: false },
        { type: 'line', x1: pa[0], y1: pa[1], x2: pc[0], y2: pc[1], color: 'muted', dash: true, width: 1 },
        { type: 'line', x1: pb[0], y1: pb[1], x2: pc[0], y2: pc[1], color: 'muted', dash: true, width: 1 },
        { type: 'arrow', x1: 0, y1: 0, x2: pc[0], y2: pc[1], color: 'c3', double: false },
        { type: 'text', x: pa[0] - 0.12, y: pa[1] + 0.08, text: `${fmt(ha.g, 3)} g (0°)`, anchor: 'end', color: 'c1' },
        { type: 'text', x: pb[0] + 0.12, y: pb[1], text: `${fmt(hb.g, 3)} g (30°)`, anchor: 'start', color: 'c1' },
        { type: 'text', x: pc[0] + 0.15, y: pc[1] + 0.2, text: `계산한 보정추 ${wfmt(dc)}`, anchor: 'start', color: 'c3', bold: true },
        { type: 'text', x: -4.8, y: -1.7, text: '화살표 길이 ∝ 질량', anchor: 'start', color: 'muted' },
      ],
    },
  ],
};

// ── 그림 6: 회전수와 유연 로터 ──
const rpms = range(0, 9000, 450);
const aAt = rpms.map((n) => influenceMatrix(Math.max(n, 1))[0][0]);
const X6: [number, number] = [0, 20];
const H6 = 200;
const zs = range(0, 1, 60);
const shapeX = (z: number) => 2 + 16 * z;
const mode1 = (z: number) => Math.sin(Math.PI * z);
const mode2 = (z: number) => Math.sin(2 * Math.PI * z);
const yOff1 = 2.2;
const yOff2 = -0.4;
const amp6 = 1;
export const flexFig: FigureSpec = {
  id: 'fig-p9-2-6',
  caption: `그림 6. 위 두 칸: 같은 평면 1의 추 1 g이 베어링 1에 만드는 진동(영향계수)의 크기와 각을 회전수마다 계산했다. 운전 3000 rpm에서는 각이 ${fmt(V.a11.deg, 2)}°로 무거운 점과 높은 점이 거의 같은 자리지만, 병진(5000 rpm)·원추(6400 rpm) 모드를 지나면 각이 180° 가까이 돌아간다(P4-1의 heavy·high spot). 그래서 영향계수는 잰 회전수에서만 맞다. 아래: 굽힘 모드로 도는 유연 로터의 두 모드와 추 세트. 같은 방향 한 쌍(대칭 세트)은 1차 굽힘만, 반대 방향 한 쌍(역대칭 세트)은 2차 굽힘만 흔든다 — 모드마다 따로 맞추는 모달 밸런싱의 생각.`,
  panels: [
    {
      title: '평면 1 → 베어링 1 영향계수의 크기 [µm p-p / g]',
      height: 130,
      x: { range: [0, 9000], label: '회전수 [rpm]' },
      y: { range: [0, 6] },
      series: [{ x: rpms, y: aAt.map((z) => um(z) * 1e-3 * BAL_ROTOR.radius), color: 'c1', width: 1.8 }],
      annotations: [
        { type: 'vline', x: 3000, color: 'warn', dash: true, label: '운전 3000' },
        { type: 'vline', x: BAL_ROTOR.trans.rpm, color: 'muted', dash: true, label: '병진' },
        { type: 'vline', x: BAL_ROTOR.conic.rpm, color: 'muted', dash: true, label: '원추' },
      ],
    },
    {
      title: '각 [°] (회전 반대 방향)',
      height: 120,
      x: { range: [0, 9000], label: '회전수 [rpm]' },
      y: { range: [0, 200], ticks: [0, 90, 180] },
      series: [{ x: rpms, y: aAt.map((z) => { const d = angleOf(z); return d > 270 ? d - 360 : d; }), color: 'c1', width: 1.8 }],
      annotations: [
        { type: 'vline', x: 3000, color: 'warn', dash: true },
        { type: 'vline', x: BAL_ROTOR.trans.rpm, color: 'muted', dash: true },
        { type: 'vline', x: BAL_ROTOR.conic.rpm, color: 'muted', dash: true },
      ],
    },
    {
      frame: false,
      height: H6,
      x: { range: X6 },
      y: { range: squareYRange(X6, H6, -1.8) },
      series: [
        { x: zs.map(shapeX), y: zs.map((z) => yOff1 + amp6 * mode1(z)), color: 'c1', width: 2 },
        { x: zs.map(shapeX), y: zs.map((z) => yOff2 + amp6 * mode2(z)), color: 'c4', width: 2 },
        { x: [2, 18], y: [yOff1, yOff1], color: 'muted', width: 0.8, dash: true },
        { x: [2, 18], y: [yOff2, yOff2], color: 'muted', width: 0.8, dash: true },
      ],
      annotations: [
        { type: 'text', x: 18.4, y: yOff1 + 0.2, text: '1차 굽힘', anchor: 'start', color: 'c1', bold: true },
        { type: 'text', x: 18.4, y: yOff2 + 0.2, text: '2차 굽힘', anchor: 'start', color: 'c4', bold: true },
        { type: 'arrow', x1: shapeX(0.25), y1: yOff1, x2: shapeX(0.25), y2: yOff1 + 0.75, color: 'c2', double: false },
        { type: 'arrow', x1: shapeX(0.75), y1: yOff1, x2: shapeX(0.75), y2: yOff1 + 0.75, color: 'c2', double: false },
        { type: 'text', x: shapeX(0.5), y: yOff1 - 0.45, text: '대칭 세트 (같은 방향)', anchor: 'middle', color: 'c2' },
        { type: 'arrow', x1: shapeX(0.25), y1: yOff2, x2: shapeX(0.25), y2: yOff2 + 0.75, color: 'c2', double: false },
        { type: 'arrow', x1: shapeX(0.75), y1: yOff2, x2: shapeX(0.75), y2: yOff2 - 0.75, color: 'c2', double: false },
        { type: 'text', x: shapeX(0.5), y: yOff2 - 0.95, text: '역대칭 세트 (반대 방향)', anchor: 'middle', color: 'c2' },
      ],
    },
  ],
};

// ── 그림 7: 밸런스 등급 — e_per = G/Ω ──
const rpmG = range(500, 10000, 190);
const G_LINES = [
  { G: 1, color: 'c3' as const },
  { G: 2.5, color: 'c1' as const },
  { G: 6.3, color: 'c2' as const },
];
export const gradeFig: FigureSpec = {
  id: 'fig-p9-2-7',
  caption: `그림 7. 밸런스 등급의 정의 e_per = G/Ω를 회전수에 따라 그렸다(G 1 · 2.5 · 6.3 mm/s는 예시 숫자 — 기계마다 어떤 G를 쓰는지는 규격의 표를 따른다). 같은 G라도 빨리 도는 로터일수록 허용 편심이 작다. 예: G = 2.5 mm/s, 3000 rpm(Ω = ${fmt(V.gEx.omega, 4)} rad/s)이면 e_per = ${fmt(V.gEx.ePerUm, 3)} µm, 이 로터(800 kg)의 허용 잔류 불평형은 U_per = M·e_per = ${fmt(V.gEx.uPerGmm, 4)} g·mm(반지름 200 mm에서 약 ${fmt(V.gEx.uPerGmm / 200, 3)} g, 두 평면에 나눈다).`,
  panels: [
    {
      height: 210,
      x: { range: [0, 10000], label: '회전수 [rpm]' },
      y: { range: [0, 60], label: '허용 편심 e_per [µm]' },
      series: G_LINES.map((l) => ({ x: rpmG, y: rpmG.map((n) => permissibleUnbalance(l.G, n, 1).ePerUm), color: l.color, width: 1.8, label: `G ${l.G}` })),
      annotations: [{ type: 'point', x: 3000, y: V.gEx.ePerUm, color: 'warn', label: `3000 rpm · G 2.5 → ${fmt(V.gEx.ePerUm, 3)} µm`, dx: 8, dy: -8 }],
    },
  ],
};

