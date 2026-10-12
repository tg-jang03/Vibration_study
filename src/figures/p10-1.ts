/**
 * P10-1 "진동 판정 규격" 본문 그림 (빌드 시 계산, D-026).
 * 경계·비교율은 모두 규격과 무관한 가상 무차원값이다 (I-009). 추세는 LAB-ISO-01과 같은 `lib/assessment/severity.ts`.
 * 극좌표(그림 6)는 Contents §3 관례: 0°가 위, 지연각은 시계 방향 (x = A sin φ, y = A cos φ).
 */
import { grid, squareYRange, type FigAnnotation, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { changeBand, compareChange, DEMO, severityTrend, trendVerdict } from '../lib/assessment/severity';
import { arrow, box, lines, zoneRects } from './p10-shared';

const fmt = formatNumber;
const RAD = Math.PI / 180;

// ── 그림 2의 가상 파형 ──
const T = grid(0, 0.04, 801);
const VEL = T.map((t) => 2.0 * Math.sin(2 * Math.PI * 50 * t) + 0.8 * Math.sin(2 * Math.PI * 150 * t + 0.6) + 0.5 * Math.sin(2 * Math.PI * 400 * t));
const DISP = T.map((t) => 20 * Math.sin(2 * Math.PI * 50 * t) + 6 * Math.sin(2 * Math.PI * 100 * t + 1));
const velRms = Math.sqrt(VEL.reduce((s, v) => s + v * v, 0) / VEL.length);
const dMax = Math.max(...DISP), dMin = Math.min(...DISP);

// ── 그림 4: LAB-ISO-01 기본값 ──
const TREND = severityTrend({ baseline: DEMO.baseline, after: DEMO.value, event: 'step' });
const VERDICT = trendVerdict(TREND, DEMO.baseline, DEMO.limits, DEMO.rate);
const BAND = changeBand(DEMO.baseline, DEMO.limits[1], DEMO.rate);

// ── 그림 5: 기준선이 다른 두 기계의 알람 (가상 여유 = 비교율 × B/C) ──
const MARGIN = (DEMO.rate / 100) * DEMO.limits[1];
const P_BASE = 1.0, Q_BASE = 4.6;
const P_ALARM = P_BASE + MARGIN, Q_RAW = Q_BASE + MARGIN, Q_ALARM = Math.min(Q_RAW, DEMO.limits[1]);

// ── 그림 6: 1X 벡터 변화 ──
const V0 = { amp: 3, deg: 30 }, V1 = { amp: 3, deg: 120 };
const xy = (a: number, d: number): [number, number] => [a * Math.sin(d * RAD), a * Math.cos(d * RAD)];
const [x0, y0] = xy(V0.amp, V0.deg), [x1, y1] = xy(V1.amp, V1.deg);
const DV = Math.hypot(x1 - x0, y1 - y0);

// ── 그림 7: 전체값이 같은 두 스펙트럼 (성분 RMS, mm/s) ──
const BASE_LINES = [[50, 2.6], [100, 0.9], [150, 0.4]] as const;
const BPFO = 237;
const DEFECT_EXTRA = [[BPFO, 0.5], [2 * BPFO, 0.45], [3 * BPFO, 0.35]] as const;
const total = (ls: readonly (readonly [number, number])[]) => Math.sqrt(ls.reduce((s, [, a]) => s + a * a, 0));
const BASE_TOTAL = total(BASE_LINES);
/** 지금의 1X는 전체값이 기준과 같아지도록 정한다 */
const NOW_1X = Math.sqrt(BASE_TOTAL ** 2 - total([[100, 0.9], [150, 0.4], ...DEFECT_EXTRA]) ** 2);
const NOW_LINES = [[50, NOW_1X], [100, 0.9], [150, 0.4], ...DEFECT_EXTRA] as const;

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p10-1.test.ts`) */
export const P101_VALUES = {
  velRms, dispPP: dMax - dMin,
  verdict: VERDICT, band: BAND,
  margin: MARGIN, pAlarm: P_ALARM, qRaw: Q_RAW, qAlarm: Q_ALARM,
  dv: DV, baseTotal: BASE_TOTAL, nowTotal: total(NOW_LINES), now1x: NOW_1X,
  zoneDemo: compareChange(DEMO.value, DEMO.baseline, DEMO.limits[1], DEMO.rate),
};

// ─────────────────────────────────────────────────────────────────────────────
const Q = [
  { y: 79, title: '대형 GT · ST · 발전기', cond: '40 MW 초과 · 유막 베어링 · 정격 1500·1800·3000·3600 rpm', part: 'ISO 20816-2' },
  { y: 60, title: '유막 베어링 GT', cond: '3 MW 초과 · 항공 전용형(aero-derivative)과 -2 대상은 제외', part: 'ISO 20816-4' },
  { y: 41, title: '수력 발전 · 양수 설비', cond: '발전기 · 수차 · 펌프-수차의 기계 세트', part: 'ISO 20816-5' },
  { y: 22, title: '산업용 기계', cond: '15 kW 초과 · 120 ~ 30 000 rpm · 출력과 지지 강성으로 다시 분류', part: 'ISO 20816-3' },
];
export const scope: FigureSpec = {
  id: 'fig-p10-1-1',
  caption: '그림 1. 기계에서 Part를 고르는 순서(공개 적용 범위 요약). 위에서부터 묻고 처음 "예"인 곳의 Part를 펼칩니다. 맨 위의 20816-1은 측정 방법과 두 기준을 정하는 공통 바탕이고, 각 Part의 제외 항목은 원문에서 다시 확인합니다.',
  panels: [{
    frame: false, height: 300, x: { range: [0, 100] }, y: { range: [0, 100] }, series: [],
    annotations: [
      box(0, 100, 90, 99, 'accent'),
      ...lines(50, 93.4, ['ISO 20816-1 일반 지침 — 측정 방법과 두 기준(크기 · 변화)의 공통 바탕'], { bold: true, color: 'accent' }),
      ...Q.flatMap((q, i): FigAnnotation[] => [
        box(0, 68, q.y - 6, q.y + 6, 'muted'),
        ...lines(2, q.y + 1, [q.title, q.cond], { anchor: 'start', boldFirst: true, gap: 4.8 }),
        arrow(68.5, q.y, 75.5, q.y, '예', 'c1', 0, -8),
        box(76, 100, q.y - 4, q.y + 4, 'c1'),
        ...lines(88, q.y - 1.2, [q.part], { bold: true, color: 'c1' }),
        ...(i < Q.length - 1 ? [arrow(10, q.y - 6.2, 10, Q[i + 1].y + 6.2, '아니오', 'muted', 0, 0)] : [arrow(10, q.y - 6.2, 10, 10.2, '아니오', 'muted', 0, 0)]),
      ]),
      box(0, 100, 0.5, 10, 'muted'),
      ...lines(2, 4, ['그 밖: -8 왕복 압축기 · -9 기어 장치 · -21 풍력 — 아직 10816으로 남은 -6 왕복 기계 · -7 펌프'], { anchor: 'start' }),
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
export const quantities: FigureSpec = {
  id: 'fig-p10-1-2',
  caption: `그림 2. 같은 베어링에 붙은 두 센서. 위 — 속도 센서(파랑)는 공간에 대한 하우징의 움직임을, 프록시미티 프로브(주황)는 베어링에 대한 축의 움직임을 잽니다. 가운데 — 하우징 속도는 RMS(${fmt(velRms, 3)} mm/s)로, 아래 — 축 변위는 p-p(${fmt(dMax - dMin, 3)} µm)로 읽습니다. 기준·위치·통계량이 모두 달라 한 판정표에 넣을 수 없습니다.`,
  panels: [
    {
      frame: false, height: 150, x: { range: [0, 100] }, y: { range: [0, 100] }, series: [],
      annotations: [
        { type: 'ground', x1: 2, y1: 14, x2: 38, y2: 14, side: 'right' },
        box(6, 34, 14, 76, 'muted'),
        { type: 'circle', x: 20, y: 45, r: 40, dash: true, color: 'muted' },
        { type: 'circle', x: 20, y: 45, r: 31, fill: true, color: 'text', label: '축' },
        box(17, 23, 76, 89, 'c1'),
        { type: 'line', x1: 25.2, y1: 45, x2: 40, y2: 45, color: 'c2', width: 6 },
        ...lines(20, 93, ['속도 센서'], { color: 'c1', bold: true }),
        ...lines(41.5, 43.5, ['프로브'], { anchor: 'start', color: 'c2', bold: true }),
        ...lines(52, 86, ['비회전부 진동 — 하우징 위의 속도 센서', '공간에 대한 하우징의 움직임', '평가량: 속도 RMS [mm/s], 넓은 주파수 대역'], { anchor: 'start', boldFirst: true, color: 'c1', gap: 10 }),
        ...lines(52, 44, ['축 상대 진동 — 하우징에 고정한 프로브', '베어링(프로브)에 대한 축의 움직임', '평가량: 변위 p-p [µm], 베어링 간극과 견줌'], { anchor: 'start', boldFirst: true, color: 'c2', gap: 10 }),
      ],
    },
    {
      height: 110, x: { range: [0, 40], label: '시간 [ms]' }, y: { range: [-4, 4], label: '하우징 속도 [mm/s]' },
      series: [{ x: T.map((t) => t * 1000), y: VEL, color: 'c1', width: 1.8 }],
      annotations: [{ type: 'hline', y: velRms, label: `RMS ${fmt(velRms, 3)} mm/s`, color: 'c1' }, { type: 'hline', y: -velRms, color: 'c1' }],
    },
    {
      height: 110, x: { range: [0, 40], label: '시간 [ms]' }, y: { range: [-35, 35], label: '축 변위 [µm]' },
      series: [{ x: T.map((t) => t * 1000), y: DISP, color: 'c2', width: 1.8 }],
      annotations: [
        { type: 'hline', y: dMax, color: 'muted' }, { type: 'hline', y: dMin, color: 'muted' },
        { type: 'arrow', x1: 34, y1: dMin, x2: 34, y2: dMax, double: true, color: 'c2', label: `p-p ${fmt(dMax - dMin, 3)} µm`, labelDx: 46 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
const LX = DEMO.limits, LY = [1, 2.5, 5] as const;
const MEAN = ['새 기계 수준', '장기 운전 가능', '제한 운전 · 원인 조치', '손상 위험'];
const rowZones = (lim: readonly [number, number, number], ya: number, yb: number, meaning: boolean): FigAnnotation[] => {
  const xs = [0, ...lim, 12];
  const out: FigAnnotation[] = [];
  const colors = ['c3', 'muted', 'warn', 'warn'] as const;
  for (let i = 0; i < 4; i++) {
    out.push({ type: 'rect', x1: xs[i], x2: xs[i + 1], y1: ya, y2: yb, color: colors[i] });
    if (i === 3) out.push({ type: 'rect', x1: xs[i], x2: xs[i + 1], y1: ya, y2: yb, color: colors[i] });
    const cx = (xs[i] + xs[i + 1]) / 2;
    out.push({ type: 'text', x: cx, y: meaning ? (ya + yb) / 2 + 0.25 : (ya + yb) / 2 - 0.35, text: 'ABCD'[i], anchor: 'middle', bold: true });
    if (meaning) out.push({ type: 'text', x: cx, y: (ya + yb) / 2 - 1.05, text: MEAN[i], anchor: 'middle' });
  }
  return out;
};
export const zones: FigureSpec = {
  id: 'fig-p10-1-3',
  caption: '그림 3. 같은 크기 3(파랑 선)이 위의 기계 분류 X(가상 경계 2·5·9)에서는 B, 아래 분류 Y(가상 경계 1·2.5·5)에서는 C입니다. 구간 이름(A ~ D)의 뜻은 같아도 경계는 기계 분류와 평가량마다 다릅니다. 실제 mm/s·µm 경계가 아닙니다.',
  panels: [{
    height: 175, x: { range: [0, 12], label: '가상 크기 x [무차원]', ticks: [0, 1, 2, 2.5, 3, 5, 9, 12] }, y: { range: [0, 10], ticks: 'none' }, series: [],
    annotations: [
      ...rowZones(LX, 5.2, 8.4, true),
      ...rowZones(LY, 0.4, 3.6, false),
      { type: 'text', x: 11.95, y: 8.9, text: '기계 분류 X — 가상 경계 2 · 5 · 9', anchor: 'end', bold: true },
      { type: 'text', x: 11.95, y: 4.1, text: '기계 분류 Y — 가상 경계 1 · 2.5 · 5', anchor: 'end', bold: true },
      { type: 'vline', x: 3, color: 'c1', dash: false },
      { type: 'text', x: 3.15, y: 9.55, text: '현재 3', anchor: 'start', color: 'c1', bold: true },
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
export const changes: FigureSpec = {
  id: 'fig-p10-1-4',
  caption: `그림 4. 가상 60일 기록(LAB-ISO-01 기본값). 기준선 ${fmt(DEMO.baseline, 2)}(회색 점선)이 30일째 ${fmt(DEMO.value, 2)}로 올랐지만 값은 끝까지 B 구간(2 ~ 5)입니다. 같은 기록을 변화로 보면, 보라 점선의 변화 비교 띠(기준선 ± 20 % × B/C = ${fmt(BAND.lower, 2)} ~ ${fmt(BAND.upper, 2)})를 30일째 벗어납니다. 경계 2·5·9와 20 %는 가상값입니다.`,
  panels: [{
    height: 190, x: { range: [0, 60], label: '가상 기록 날짜 [일]', ticks: [0, 10, 20, 30, 40, 50, 60] }, y: { range: [0, 6], label: '가상 전체값 x' },
    series: [
      { x: TREND.day, y: TREND.value, color: 'c1', kind: 'line', width: 1.6 },
      { x: TREND.day, y: TREND.value, color: 'c1', kind: 'dots', radius: 2.6 },
    ],
    annotations: [
      { type: 'rect', x1: 0, x2: 60, y1: 0, y2: 2, color: 'c3' },
      { type: 'rect', x1: 0, x2: 60, y1: 2, y2: 5, color: 'muted' },
      { type: 'rect', x1: 0, x2: 60, y1: 5, y2: 6, color: 'warn' },
      { type: 'text', x: 59.3, y: 1.55, text: 'A', anchor: 'end', bold: true },
      { type: 'text', x: 59.3, y: 4.55, text: 'B', anchor: 'end', bold: true },
      { type: 'text', x: 59.3, y: 5.55, text: 'C', anchor: 'end', bold: true },
      { type: 'hline', y: DEMO.baseline, color: 'muted', label: `기준선 ${fmt(DEMO.baseline, 2)}`, labelAt: 'end', labelBelow: true },
      { type: 'hline', y: BAND.upper, color: 'c4', label: `변화 비교 띠 ${fmt(BAND.upper, 2)}`, labelAt: 'start' },
      { type: 'hline', y: BAND.lower, color: 'c4' },
      { type: 'vline', x: 30, color: 'c4', label: '30일째 변화 띠를 벗어남' },
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
const machineBar = (xa: number, xb: number, name: string, base: number, alarm: number, raw?: number): FigAnnotation[] => {
  const left = raw !== undefined; // 기준선이 높은 기계: 기준선·계산값은 왼쪽, 알람은 오른쪽에 써서 겹치지 않게
  const side = (y: number, text: string, color?: 'c4', bold = false, onLeft = false): FigAnnotation => ({ type: 'text', x: onLeft ? xa - 1 : xb + 1, y: y - 0.15, text, anchor: onLeft ? 'end' : 'start', color, bold });
  return [
    { type: 'line', x1: xa, y1: base, x2: xb, y2: base, color: 'muted', width: 2.5 },
    side(base, `기준선 ${fmt(base, 2)}`, undefined, false, left),
    ...(raw !== undefined ? [{ type: 'line' as const, x1: xa, y1: raw, x2: xb, y2: raw, color: 'c4' as const, width: 1.5, dash: true }, side(raw, `기준선 + 여유 = ${fmt(raw, 2)}`, 'c4', false, true)] : []),
    { type: 'line', x1: xa, y1: alarm, x2: xb, y2: alarm, color: 'c4', width: 3 },
    side(left ? alarm + 0.5 : alarm, left ? `알람 ${fmt(alarm, 2)} (예제 상한 = B/C)` : `알람 ${fmt(alarm, 2)}`, 'c4', true),
    { type: 'text', x: (xa + xb) / 2, y: 10.4, text: name, anchor: 'middle', bold: true },
  ];
};
export const limits: FigureSpec = {
  id: 'fig-p10-1-5',
  caption: `그림 5. 같은 분류(가상 경계 2·5·9)의 두 기계. 알람은 각 기계의 기준선에서 출발해 여유(예제: 20 % × B/C = ${fmt(MARGIN, 2)})를 더합니다 — 기계 P는 ${fmt(P_ALARM, 2)}, 기계 Q는 ${fmt(Q_RAW, 2)}가 되지만 크기 경계를 크게 넘지 않게 상한을 두어 ${fmt(Q_ALARM, 2)}입니다. 트립(검정 점선)은 기계 보호용으로, C·D 구간 안에서 제조사 자료로 정합니다. 숫자는 모두 가상값입니다.`,
  panels: [{
    height: 200, x: { range: [0, 100], ticks: 'none' }, y: { range: [0, 11], label: '가상 크기 [무차원]', ticks: [0, 2, 5, 9] },
    series: [],
    annotations: [
      ...zoneRects(DEMO.limits, 0, 100, 11),
      { type: 'text', x: 99, y: 0.3, text: 'A', anchor: 'end', bold: true },
      { type: 'text', x: 99, y: 2.3, text: 'B', anchor: 'end', bold: true },
      { type: 'text', x: 99, y: 5.3, text: 'C', anchor: 'end', bold: true },
      { type: 'text', x: 99, y: 9.3, text: 'D', anchor: 'end', bold: true },
      ...machineBar(8, 24, '기계 P', P_BASE, P_ALARM),
      ...machineBar(62, 76, '기계 Q', Q_BASE, Q_ALARM, Q_RAW),
      { type: 'hline', y: 8.2, color: 'text', label: '트립: 보호용 — C·D 구간 안에서 제조사 자료로 (기동 중 배율은 P3-5)', labelAt: 'start' },
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
const HV = 230;
const VX: [number, number] = [-4.2, -4.2 + (8.4 * 820) / (HV * 1.2) ];
const ring = (r: number): FigSeries => { const t = grid(0, 360, 181); return { x: t.map((d) => r * Math.sin(d * RAD)), y: t.map((d) => r * Math.cos(d * RAD)), color: 'muted', width: 1, dash: true }; };
export const vector: FigureSpec = {
  id: 'fig-p10-1-6',
  caption: `그림 6. 1X 벡터(극좌표, 0° 위·지연각 시계 방향). 기준 ${fmt(V0.amp, 2)} ∠ ${V0.deg}°에서 지금 ${fmt(V1.amp, 2)} ∠ ${V1.deg}°로 위상만 돌았습니다. 크기(진폭) 변화는 0이지만 벡터 차(보라 화살표)는 ${fmt(DV, 3)} — 크기의 √2배입니다. 전체값이나 진폭만 보는 변화 판정으로는 보이지 않습니다.`,
  panels: [{
    frame: false, height: HV, x: { range: VX }, y: { range: squareYRange(VX, HV, -4.2) }, series: [ring(1), ring(2), ring(3)],
    annotations: [
      { type: 'line', x1: 0, y1: -3.6, x2: 0, y2: 3.6, color: 'muted', width: 1 },
      { type: 'line', x1: -3.6, y1: 0, x2: 3.6, y2: 0, color: 'muted', width: 1 },
      { type: 'text', x: 0, y: 3.75, text: '0°', anchor: 'middle' },
      { type: 'text', x: 3.75, y: -0.1, text: '90°', anchor: 'start' },
      { type: 'arrow', double: false, x1: 0, y1: 0, x2: x0, y2: y0, color: 'muted' },
      { type: 'arrow', double: false, x1: 0, y1: 0, x2: x1, y2: y1, color: 'c1' },
      { type: 'arrow', double: false, x1: x0, y1: y0, x2: x1, y2: y1, color: 'c4' },
      { type: 'text', x: x0 - 0.2, y: y0 + 0.25, text: `기준 ${fmt(V0.amp, 2)} ∠ ${V0.deg}°`, anchor: 'end', bold: true },
      { type: 'text', x: x1 + 0.25, y: y1 - 0.55, text: `지금 ${fmt(V1.amp, 2)} ∠ ${V1.deg}°`, anchor: 'start', color: 'c1', bold: true },
      { type: 'text', x: (x0 + x1) / 2 + 0.35, y: (y0 + y1) / 2 + 0.3, text: `ΔV = ${fmt(DV, 3)}`, anchor: 'start', color: 'c4', bold: true },
      ...lines(5.2, 2.6, ['크기만 보면', `|V| = ${fmt(V0.amp, 2)} → ${fmt(V1.amp, 2)}, 변화 0`], { anchor: 'start', boldFirst: true, gap: 0.62 }),
      ...lines(5.2, 0.4, ['벡터로 보면', `|ΔV| = ${fmt(DV, 3)} = ${fmt(V0.amp, 2)} × √2`, '같은 회전수·부하에서의 위상 변화도 변화다'], { anchor: 'start', boldFirst: true, gap: 0.62, color: 'c4' }),
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
const stem = (ls: readonly (readonly [number, number])[], color: 'c1' | 'warn'): FigSeries => ({ x: ls.map(([f]) => f), y: ls.map(([, a]) => a), kind: 'stem', color });
export const overall: FigureSpec = {
  id: 'fig-p10-1-7',
  caption: `그림 7. 같은 베어링 하우징의 가상 속도 스펙트럼(성분 RMS). 위 — 기준, 아래 — 지금. 지금은 1X가 ${fmt(BASE_LINES[0][1], 2)} → ${fmt(NOW_1X, 3)} mm/s로 조금 줄고 ${BPFO} Hz와 그 배수에 구름베어링 외륜 결함 줄(황토, P7-5)이 생겼지만, 전체값은 둘 다 ${fmt(BASE_TOTAL, 3)} mm/s RMS입니다. 구간·변화 판정은 이 차이를 보지 못합니다.`,
  panels: [
    { height: 110, title: `기준 — 전체값 ${fmt(BASE_TOTAL, 3)} mm/s RMS`, x: { range: [0, 800], label: '주파수 [Hz]' }, y: { range: [0, 3], label: '속도 [mm/s RMS]' }, series: [stem(BASE_LINES, 'c1')] },
    { height: 110, title: `지금 — 전체값 ${fmt(total(NOW_LINES), 3)} mm/s RMS`, x: { range: [0, 800], label: '주파수 [Hz]' }, y: { range: [0, 3], label: '속도 [mm/s RMS]' }, series: [stem(NOW_LINES.slice(0, 3), 'c1'), stem(DEFECT_EXTRA, 'warn')],
      annotations: [{ type: 'text', x: BPFO + 8, y: 0.95, text: '외륜 결함 줄 (BPFO와 배수)', anchor: 'start', color: 'warn', bold: true }] },
  ],
};
