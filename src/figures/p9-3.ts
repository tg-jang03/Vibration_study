/**
 * P9-3 "정렬" 본문 그림 데이터 (빌드 시 계산, D-026). 계산은 랩(LAB-ALN-01)과 같은 `lib/fieldwork/alignment.ts`.
 * 예시: 펌프 S(고정) + 모터 M(움직임). 수직 평면, 냉간 상태 δ = 0.18 mm, α = 0.04 mm/100 mm, 브래킷 처짐 −0.10 mm.
 * 중심선 그림은 가로(mm)와 세로(mm)의 축척이 다르다 — 어긋남을 크게 보이려고 세로를 수천 배 키웠다.
 */
import { squareYRange, type FigAnnotation, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import {
  ALN_GEOM as G,
  coldTarget,
  footMoves,
  fromReverse,
  fromRimFace,
  heightAt,
  hotOffset,
  reverseReadings,
  rimFaceReadings,
  thermalGrowth,
  type AlignState,
} from '../lib/fieldwork/alignment';

const fmt = formatNumber;
/** 부호를 붙인 mm 글자 (+0.20, −0.30) */
const sg = (v: number, d = 2) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(d)}`;
const per100 = (slope: number) => slope * 100;

export const ALN_EXAMPLE: AlignState = { offset: 0.18, slope: 0.0004 };
export const SAG = -0.1;
const RF = rimFaceReadings(ALN_EXAMPLE, SAG);
const RF_TRUE = rimFaceReadings(ALN_EXAMPLE, 0);
const RV = reverseReadings(ALN_EXAMPLE, SAG);
const FROM_RF = fromRimFace(RF.rim, RF.face, SAG);
const FROM_RF_NOSAG = fromRimFace(RF.rim, RF.face, 0);
const FROM_RV = fromReverse(RV.r1, RV.r2, SAG);
const MOVES = footMoves(FROM_RF);
const MOVES_NOSAG = footMoves(FROM_RF_NOSAG);
/** 열성장 예: 모터 중심 높이 500 mm · 40 K, 펌프 435 mm · 20 K */
const GROWTH_M = thermalGrowth(500, 40);
const GROWTH_S = thermalGrowth(435, 20);
const TARGET = coldTarget(GROWTH_S, GROWTH_M);
const MOVES_T = footMoves(FROM_RF, TARGET);
/** 열간 확인(가상 측정): 근접 센서 gap 변화로 잰 실제 성장 */
const MEAS_S = 0.13;
const MEAS_M = 0.2;
const HOT = hotOffset(TARGET, MEAS_S, MEAS_M);
/** 3시·9시 rim 읽음값 (수평 어긋남 예: 커플링 중심 −0.10 mm, 기울기 0 — rim 자리에서도 −0.10) */
const H_OFF = -0.1;
const V_RIM = heightAt(ALN_EXAMPLE, G.zRim);
const R3 = H_OFF - V_RIM;
const R9 = -H_OFF - V_RIM;

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p9-3.test.ts`) */
export const P93_VALUES = {
  rf: RF,
  rfTrue: RF_TRUE,
  rv: RV,
  fromRf: FROM_RF,
  fromRfNoSag: FROM_RF_NOSAG,
  fromRv: FROM_RV,
  moves: MOVES,
  movesNoSag: MOVES_NOSAG,
  growthS: GROWTH_S,
  growthM: GROWTH_M,
  target: TARGET,
  movesT: MOVES_T,
  hot: HOT,
  measS: MEAS_S,
  measM: MEAS_M,
  r3: R3,
  r9: R9,
  vRim: V_RIM,
};
const V = P93_VALUES;

const zS = [-600, 0];
const zM = [0, 1000];
const lineM = (s: AlignState, color: 'c1' | 'c3' | 'c4' | 'muted' = 'c1', dash = false, label?: string): FigSeries => ({
  x: zM,
  y: zM.map((z) => heightAt(s, z)),
  color,
  width: 2.2,
  dash,
  label,
});
const lineS: FigSeries = { x: zS, y: [0, 0], color: 'c2', width: 2.2, label: '펌프 S 중심선' };
const extS: FigSeries = { x: [0, 1000], y: [0, 0], color: 'muted', width: 1, dash: true };
const feet: FigAnnotation[] = [
  { type: 'vline', x: G.footA, color: 'muted', dash: true, label: `앞발 ${G.footA}` },
  { type: 'vline', x: G.footB, color: 'muted', dash: true, label: `뒷발 ${G.footB}` },
  { type: 'vline', x: 0, color: 'text', label: '커플링' },
];

// ── 그림 1: 평행 어긋남과 각 어긋남 ──
const typePanel = (s: AlignState, title: string, first: boolean) => ({
  title,
  height: 120,
  x: { range: [-600, 1000] as [number, number], label: first ? undefined : '커플링에서 모터 쪽으로 [mm]' },
  y: { range: [-0.2, 0.6] as [number, number], label: 'mm' },
  legend: first,
  series: [lineS, extS, lineM(s, 'c1', false, '모터 M 중심선')],
  annotations: [
    { type: 'vline' as const, x: 0, color: 'text' as const },
    ...(s.offset !== 0 ? [{ type: 'arrow' as const, x1: 30, y1: 0, x2: 30, y2: s.offset, color: 'warn' as const, double: true, label: `δ ${fmt(s.offset, 2)} mm`, labelDx: 50 }] : []),
    ...(s.slope !== 0 ? [{ type: 'text' as const, x: 700, y: heightAt(s, 700) + 0.08, text: `기울기 α = ${fmt(per100(s.slope), 2)} mm/100 mm`, anchor: 'middle' as const, color: 'c1' as const }] : []),
  ],
});
export const typesFig: FigureSpec = {
  id: 'fig-p9-3-1',
  caption: `그림 1. 모터(파랑)의 중심선이 펌프(주황) 중심선의 연장선(회색 점선)에서 얼마나 벗어났는지를 두 숫자로 적는다(세로 축척을 수천 배 키움). 위: 평행 어긋남(offset) — 커플링 중심에서 δ만큼 떨어져 나란하다. 가운데: 각 어긋남(angularity) — 커플링에서는 만나지만 기울기 α로 벌어진다. 아래: 실제로는 둘이 섞인다(예시 기계: δ = ${(ALN_EXAMPLE.offset).toFixed(2)} mm, α = ${fmt(per100(ALN_EXAMPLE.slope), 2)} mm/100 mm). 수직 평면은 심(shim)으로, 수평 평면은 옆으로 밀어 고친다.`,
  panels: [
    typePanel({ offset: 0.2, slope: 0 }, '평행 어긋남 (offset)', true),
    typePanel({ offset: 0, slope: 0.0005 }, '각 어긋남 (angularity)', false),
    typePanel(ALN_EXAMPLE, '섞인 경우 (예시 기계)', false),
  ],
};

// ── 그림 2: rim-face 측정 — 구성과 네 방향 읽음값 ──
const X2: [number, number] = [0, 20];
const H2 = 200;
const X2b: [number, number] = [-5, 5];
const H2b = 230;
const clockR = 1.25;
const clockPx = (820 / (X2b[1] - X2b[0])) * clockR;
export const rimFaceFig: FigureSpec = {
  id: 'fig-p9-3-2',
  caption: `그림 2. rim-face 측정. 위: 펌프 축에 단 브래킷에서 게이지 두 개가 모터 허브의 둘레(rim, 커플링에서 ${G.zRim} mm)와 면(face, 지름 ${G.faceD} mm)을 읽는다. 두 축을 함께 돌려 12시에서 0으로 맞추고 3 · 6 · 9시 값을 적는다(+ = 측정침이 눌려 들어감). 아래: 예시 기계의 rim 읽음값. 6시 ${sg(RF.rim)} mm에는 브래킷 처짐 ${sg(SAG)} mm가 섞여 있어, 빼면 ${sg(RF_TRUE.rim)} mm → 그 자리 높이 = −(${sg(RF_TRUE.rim)})/2 = ${(V.vRim).toFixed(2)} mm. face 6시 ${sg(RF.face)} mm → 기울기 = −(${sg(RF.face)})/${G.faceD} = ${fmt(per100(ALN_EXAMPLE.slope), 2)} mm/100 mm. 3시 + 9시 = 6시((${sg(R3)}) + (${sg(R9)}) = ${sg(R3 + R9)})이면 읽음값이 믿을 만하다(처짐 전 값 기준).`,
  panels: [
    {
      frame: false,
      height: H2,
      x: { range: X2 },
      y: { range: squareYRange(X2, H2, -2.3) },
      series: [],
      annotations: [
        { type: 'line', x1: 0.5, y1: 0, x2: 8.6, y2: 0, width: 7, color: 'c2' },
        { type: 'line', x1: 11.4, y1: 0.12, x2: 19.5, y2: 0.12, width: 7, color: 'c1' },
        { type: 'rect', x1: 7.4, x2: 9.6, y1: -1.2, y2: 1.2, color: 'c2' },
        { type: 'rect', x1: 10.4, x2: 12.6, y1: -1.08, y2: 1.32, color: 'c1' },
        { type: 'text', x: 3.5, y: -0.9, text: '펌프 S (고정)', anchor: 'middle', color: 'c2', bold: true },
        { type: 'text', x: 16.5, y: -0.9, text: '모터 M (움직임)', anchor: 'middle', color: 'c1', bold: true },
        { type: 'line', x1: 8.4, y1: 1.2, x2: 8.4, y2: 2.4, width: 2, color: 'text' },
        { type: 'line', x1: 8.4, y1: 2.4, x2: 11.9, y2: 2.4, width: 2, color: 'text' },
        { type: 'circle', x: 11.9, y: 2.05, r: 9, color: 'warn' },
        { type: 'line', x1: 11.9, y1: 1.85, x2: 11.9, y2: 1.32, width: 1.5, color: 'warn' },
        { type: 'text', x: 12.6, y: 2.2, text: 'rim 게이지 (둘레)', anchor: 'start', color: 'warn' },
        { type: 'circle', x: 9.95, y: 0.9, r: 7, color: 'c4' },
        { type: 'line', x1: 10.15, y1: 0.9, x2: 10.4, y2: 0.9, width: 1.5, color: 'c4' },
        { type: 'line', x1: 9.4, y1: 2.4, x2: 9.95, y2: 1.1, width: 1.5, color: 'text' },
        { type: 'text', x: 6.9, y: 1.55, text: 'face 게이지 (면)', anchor: 'end', color: 'c4' },
        { type: 'text', x: 8.4, y: 2.75, text: '브래킷 (펌프 축에 고정)', anchor: 'start' },
      ],
    },
    {
      frame: false,
      height: H2b,
      x: { range: X2b },
      y: { range: squareYRange(X2b, H2b, -1.68) },
      series: [],
      annotations: [
        { type: 'circle', x: 0, y: 0, r: clockPx, color: 'muted' },
        { type: 'text', x: 0, y: clockR + 0.2, text: '12시: 0.00', anchor: 'middle', bold: true },
        { type: 'text', x: clockR + 0.2, y: -0.05, text: `3시: ${sg(R3)}`, anchor: 'start', bold: true },
        { type: 'text', x: 0, y: -clockR - 0.32, text: `6시: ${sg(RF_TRUE.rim)} (처짐 섞이면 ${sg(RF.rim)})`, anchor: 'middle', bold: true },
        { type: 'text', x: -clockR - 0.2, y: -0.05, text: `9시: ${sg(R9)}`, anchor: 'end', bold: true },
        { type: 'text', x: 0, y: 0.15, text: 'rim 읽음값 [mm]', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 0, y: -0.3, text: '모터 쪽에서 본 시계 방향', anchor: 'middle', color: 'muted' },
      ],
    },
  ],
};

// ── 그림 3: 읽음값에서 발 이동량으로 — 닮은 삼각형 ──
export const feetFig: FigureSpec = {
  id: 'fig-p9-3-3',
  caption: `그림 3. 읽음값으로 얻은 모터 중심선(파랑, δ = ${(FROM_RF.offset).toFixed(2)} mm, α = ${fmt(per100(FROM_RF.slope), 2)} mm/100 mm)을 두 발 자리까지 늘인다. 앞발(${G.footA} mm)에서는 ${(heightAt(FROM_RF, G.footA)).toFixed(2)} mm, 뒷발(${G.footB} mm)에서는 ${(heightAt(FROM_RF, G.footB)).toFixed(2)} mm 높다. 그만큼 내리면(앞발 ${sg(MOVES.front)}, 뒷발 ${sg(MOVES.rear)} mm — 심을 빼기) 모터가 펌프 연장선(회색 점선)에 올라앉는다. 기울기가 있으면 커플링에서 먼 뒷발을 더 많이 옮긴다.`,
  panels: [
    {
      height: 220,
      x: { range: [-600, 1000], label: '커플링에서 모터 쪽으로 [mm]' },
      y: { range: [-0.15, 0.65], label: '높이 [mm]' },
      series: [lineS, extS, lineM(FROM_RF, 'c1', false, '모터 중심선 (읽음값에서)'), { x: [G.footA, G.footB], y: [heightAt(FROM_RF, G.footA), heightAt(FROM_RF, G.footB)], kind: 'dots', color: 'c1', radius: 4 }],
      annotations: [
        ...feet,
        { type: 'arrow', x1: G.footA + 25, y1: heightAt(FROM_RF, G.footA), x2: G.footA + 25, y2: 0, color: 'warn', double: false, label: `${sg(MOVES.front)}`, labelDx: 34 },
        { type: 'arrow', x1: G.footB + 25, y1: heightAt(FROM_RF, G.footB), x2: G.footB + 25, y2: 0, color: 'warn', double: false, label: `${sg(MOVES.rear)}`, labelDx: 34 },
      ],
    },
  ],
};

// ── 그림 4: 브래킷 처짐 ──
const X4: [number, number] = [0, 20];
const H4 = 150;
export const sagFig: FigureSpec = {
  id: 'fig-p9-3-4',
  caption: `그림 4. 브래킷 처짐. 위: 같은 브래킷을 곧은 파이프에 달고 12시에서 0으로 맞춘 뒤 6시로 돌리면 ${sg(SAG)} mm가 읽힌다 — 12시에서는 브래킷이 처져 측정침을 누르고, 6시에서는 처져 떨어지기 때문이다. 아래: 예시 기계에서 이 값을 빼지 않으면 모터를 ${(FROM_RF_NOSAG.offset - FROM_RF.offset).toFixed(2)} mm 더 높게 보아 두 발을 그만큼 더 내리게 된다(앞발 ${sg(MOVES_NOSAG.front)} vs ${sg(MOVES.front)}, 뒷발 ${sg(MOVES_NOSAG.rear)} vs ${sg(MOVES.rear)} mm). 수평(3시·9시)은 처짐이 양쪽에 같아 지워진다.`,
  panels: [
    {
      frame: false,
      height: H4,
      x: { range: X4 },
      y: { range: squareYRange(X4, H4, -1.6) },
      series: [],
      annotations: [
        { type: 'line', x1: 1, y1: 0, x2: 13, y2: 0, width: 9, color: 'muted' },
        { type: 'text', x: 2, y: -0.75, text: '곧은 파이프', anchor: 'start', color: 'muted' },
        { type: 'line', x1: 4, y1: 0.35, x2: 4, y2: 1.5, width: 2, color: 'text' },
        { type: 'line', x1: 4, y1: 1.5, x2: 10, y2: 1.25, width: 2, color: 'text' },
        { type: 'line', x1: 4, y1: 1.5, x2: 10, y2: 1.5, width: 1, color: 'muted', dash: true },
        { type: 'circle', x: 10, y: 0.95, r: 9, color: 'warn' },
        { type: 'line', x1: 10, y1: 0.75, x2: 10, y2: 0.35, width: 1.5, color: 'warn' },
        { type: 'text', x: 10.8, y: 1.2, text: '12시: 처진 만큼 눌려 들어감 → 0으로 맞춤', anchor: 'start' },
        { type: 'text', x: 10.8, y: 0.5, text: `6시로 돌리면 반대로 처져 ${sg(SAG)} mm`, anchor: 'start', color: 'warn', bold: true },
      ],
    },
    {
      title: '앞발 · 뒷발 이동량 [mm]',
      height: 150,
      x: { range: [0.4, 2.6], ticks: [1, 2], tickLabels: [{ value: 1, label: '앞발' }, { value: 2, label: '뒷발' }] },
      y: { range: [-0.65, 0] },
      series: [
        { x: [0.85, 1.85], y: [MOVES.front, MOVES.rear], kind: 'bar', barWidth: 0.28, color: 'c1', label: '처짐 보정' },
        { x: [1.15, 2.15], y: [MOVES_NOSAG.front, MOVES_NOSAG.rear], kind: 'bar', barWidth: 0.28, color: 'c2', label: '보정 안 함' },
      ],
    },
  ],
};

// ── 그림 5: reverse 측정과 레이저 — 두 점이 정하는 직선 ──
const y1 = heightAt(FROM_RV, G.z1);
const y2 = heightAt(FROM_RV, G.z2);
export const reverseFig: FigureSpec = {
  id: 'fig-p9-3-5',
  caption: `그림 5. reverse(역방향) 측정. 펌프 축에 단 게이지가 모터 허브(z₁ = ${G.z1} mm)를, 모터 축에 단 게이지가 펌프 허브(z₂ = −${-G.z2} mm)를 읽는다. 처짐을 뺀 6시 값 R₁ = ${sg(RV.r1 - SAG, 3)}, R₂ = ${sg(RV.r2 - SAG, 3)} mm에서 두 자리의 모터 높이 y₁ = −R₁/2 = ${fmt(y1, 3)}, y₂ = +R₂/2 = ${fmt(y2, 3)} mm(점)를 얻고, 두 점을 잇는 직선이 모터 중심선이다 — 기울기 (y₁ − y₂)/(z₁ − z₂) = ${fmt(per100(FROM_RV.slope), 2)} mm/100 mm, 커플링 중심 ${(FROM_RV.offset).toFixed(2)} mm로 rim-face와 같다. 두 점 사이가 ${G.z1 - G.z2} mm뿐이라 읽음값의 작은 차이가 뒷발에서 크게 불어난다. 레이저 정렬기도 같은 원리로 두 자리를 잰다.`,
  panels: [
    {
      height: 210,
      x: { range: [-200, 1000], label: '커플링에서 모터 쪽으로 [mm]' },
      y: { range: [-0.15, 0.65], label: '높이 [mm]' },
      series: [
        { x: [-200, 0], y: [0, 0], color: 'c2', width: 2.2 },
        extS,
        lineM(FROM_RV, 'c1'),
        { x: [G.z2, G.z1], y: [y2, y1], kind: 'dots', color: 'warn', radius: 5 },
      ],
      annotations: [
        ...feet,
        { type: 'text', x: G.z1 + 20, y: y1 + 0.09, text: `y₁ ${fmt(y1, 3)} (R₁)`, anchor: 'start', color: 'warn' },
        { type: 'text', x: G.z2 - 20, y: y2 + 0.09, text: `y₂ ${fmt(y2, 3)} (R₂)`, anchor: 'end', color: 'warn' },
      ],
    },
  ],
};

// ── 그림 6: 열성장 — 냉간 목표와 열간 확인 ──
export const thermalFig: FigureSpec = {
  id: 'fig-p9-3-6',
  caption: `그림 6. 위: 운전 중 모터는 중심 높이 500 mm × 40 K로 ${(GROWTH_M).toFixed(2)} mm, 펌프는 435 mm × 20 K로 ${(GROWTH_S).toFixed(2)} mm 솟는다(강 11.5 × 10⁻⁶ /K). 운전 중에 한 줄이 되려면 냉간에는 모터를 ${(-TARGET).toFixed(2)} mm 낮게 둔다(냉간 목표 ${sg(TARGET)} mm, 회색 → 운전 중 초록). 아래: 열간 확인 — 운전 뒤 근접 센서 gap 변화로 잰 실제 성장(가상 측정)이 펌프 ${(MEAS_S).toFixed(2)}, 모터 ${(MEAS_M).toFixed(2)} mm였다면 운전 중 모터는 여전히 ${(-HOT).toFixed(2)} mm 낮다. 다음 정렬의 냉간 목표를 실제 성장 차(${sg(MEAS_S - MEAS_M)} mm)로 고친다.`,
  panels: [
    {
      title: '냉간 목표와 운전 중 (모터 중심선)',
      height: 170,
      x: { range: [-600, 1000], label: '커플링에서 모터 쪽으로 [mm]' },
      y: { range: [-0.2, 0.3], label: 'mm' },
      series: [
        { x: zS, y: [0, 0], color: 'c2', width: 2, label: '펌프 냉간' },
        { x: zS, y: [GROWTH_S, GROWTH_S], color: 'c2', width: 2, dash: true, label: '펌프 운전 중' },
        { x: zM, y: [TARGET, TARGET], color: 'muted', width: 2.2, label: '모터 냉간 (목표)' },
        { x: zM, y: [TARGET + GROWTH_M, TARGET + GROWTH_M], color: 'c3', width: 2.2, label: '모터 운전 중' },
      ],
      annotations: [{ type: 'vline', x: 0, color: 'text' }],
    },
    {
      title: '열간 확인: 예상 성장 vs 근접 센서로 잰 성장 [mm]',
      height: 150,
      x: { range: [0.4, 2.6], ticks: [1, 2], tickLabels: [{ value: 1, label: '펌프 S' }, { value: 2, label: '모터 M' }] },
      y: { range: [0, 0.3] },
      series: [
        { x: [0.85, 1.85], y: [GROWTH_S, GROWTH_M], kind: 'bar', barWidth: 0.28, color: 'muted', label: '예상 (열팽창 계산)' },
        { x: [1.15, 2.15], y: [MEAS_S, MEAS_M], kind: 'bar', barWidth: 0.28, color: 'c1', label: '잰 값 (gap 변화)' },
      ],
    },
  ],
};
