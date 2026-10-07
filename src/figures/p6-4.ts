import { squareYRange, type FigureSpec, type FigPanel, type FigSeries, type FigAnnotation } from '../lib/figure';
import { toDeg, toRad, type AmpLag } from '../lib/phase';
import { acceptance, acceptanceOutline, trendSeries } from '../lib/plots/trend';
import { formatNumber as fmt } from '../lib/format';
const s = trendSeries(), residual = trendSeries({ scenario: 'residual' });
const region = { amplitudeFraction: 0.2, phaseHalfWidth: toRad(30) };
const result = acceptance(s[60].oneX, s[0].oneX, region);
const time = s.map(p => p.time / 60);
export const P64_VALUES = {
  overall: s[0].overall * 1e6, delta: result.delta.amp * 1e6,
  midDelta: acceptance(s[60].oneX, s[30].oneX, region).delta.amp * 1e6,
  firstOutside: s.findIndex(p => acceptance(p.oneX, s[0].oneX, region).inside === false),
  residualStart: residual[0].overall * 1e6, residualEnd: residual[60].overall * 1e6,
  residualGrowth: 100 * (residual[60].overall / residual[0].overall - 1),
};
const trendPanel = (title: string, series: FigSeries[], range: [number, number], label: string): FigPanel => ({
  title, series, x: { range: [0, 60], label: '시각 [분]' }, y: { range, label }, height: 150,
});
export const scalar: FigureSpec = {
  id: 'fig-p6-4-1',
  caption: `그림 1. 1X 진폭 20 µm Peak·2X 2 µm Peak를 유지하고 1X 지연각만 350°→470°로 바꿨습니다. Overall은 ${fmt(P64_VALUES.overall, 4)} µm RMS로 평평합니다(점선 1X RMS 14.14 µm와 거의 겹칩니다). 큰 변화가 없다는 뜻으로 바로 읽으면 위상 이동을 놓칩니다.`,
  panels: [trendPanel('크기는 그대로', [{ x: time, y: s.map(p => p.overall * 1e6), color: 'c1', label: 'Overall RMS' }, { x: time, y: s.map(p => p.oneXRms * 1e6), color: 'c2', dash: true, label: '1X RMS' }], [0, 20], '변위 [µm RMS]')],
};
export const apht: FigureSpec = {
  id: 'fig-p6-4-2',
  caption: '그림 2. 같은 1X 기록을 진폭과 지연각으로 나눈 APHT입니다. 진폭은 20 µm Peak로 일정하고 지연각은 60분 동안 120° 증가합니다. 가로축은 시간이며, 회전수가 가로축인 Bode와 구별하세요.',
  panels: [trendPanel('1X 진폭', [{ x: time, y: s.map(p => p.oneX.amp * 1e6), color: 'c1' }], [0, 30], '[µm Peak]'), trendPanel('1X 연속 지연각', [{ x: time, y: s.map(p => toDeg(p.continuousLag)), color: 'c2' }], [340, 480], '[°]')],
};
// FigPanel은 y 위쪽 증가. 0° 위·지연 시계 방향, 원은 px 축척을 맞춘다.
const cx = 15, cy = 7.2, scale = 0.24;
const xy = (v: AmpLag) => [cx + scale * v.amp * 1e6 * Math.sin(v.lag), cy + scale * v.amp * 1e6 * Math.cos(v.lag)] as const;
const path = (vectors: AmpLag[], color: 'c1' | 'c3', label?: string): FigSeries => ({ x: vectors.map(v => xy(v)[0]), y: vectors.map(v => xy(v)[1]), color, label });
const at = (i: number) => xy(s[i].oneX);
const arrow = (from: readonly [number, number], to: readonly [number, number], color: 'c1' | 'c2' | 'c4' | 'muted'): FigAnnotation => ({ type: 'arrow', x1: from[0], y1: from[1], x2: to[0], y2: to[1], color, double: false });
// 링 글자는 데이터가 없는 225° 쪽 원 위에 둔다. 24 µm 원(허용 영역 +20 %)은 그림 4에만.
const ringLabel = (a: number, text: string): FigAnnotation => {
  const p = xy({ amp: a * 1e-6, lag: toRad(225) });
  return { type: 'text', x: p[0] - 0.15, y: p[1], text, anchor: 'end', color: 'muted' };
};
const polarPanel = (withOuter = false): FigPanel => ({
  frame: false, height: 330, x: { range: [0, 30] }, y: { range: squareYRange([0, 30], 330) },
  series: (withOuter ? [10, 20, 24] : [10, 20]).map(a => path(Array.from({ length: 121 }, (_, i) => ({ amp: a * 1e-6, lag: 2 * Math.PI * i / 120 })), 'c3')),
  annotations: [
    { type: 'line', x1: cx - 5.76, y1: cy, x2: cx + 5.76, y2: cy, color: 'muted', dash: true },
    { type: 'line', x1: cx, y1: cy - 5.76, x2: cx, y2: cy + 5.76, color: 'muted', dash: true },
    { type: 'text', x: cx, y: 13.65, text: '0° (센서 방향)', anchor: 'middle', color: 'muted' },
    { type: 'text', x: 21.6, y: cy, text: '90°', color: 'muted' },
    { type: 'text', x: cx, y: 0.8, text: '180°', anchor: 'middle', color: 'muted' },
    { type: 'text', x: 8.5, y: cy, text: '270°', anchor: 'end', color: 'muted' },
    ringLabel(10, '10'),
    ringLabel(20, '20 µm Peak'),
    ...(withOuter ? [ringLabel(24, '24 (+20 %)')] : []),
    { type: 'text', x: 22.5, y: 13.65, text: '회전 ↺ · 지연 ↻', anchor: 'start', color: 'muted' },
  ],
});
export const vector: FigureSpec = {
  id: 'fig-p6-4-3',
  caption: `그림 3. 파랑은 그림 2의 같은 1X 벡터 끝 경로입니다. 기준 벡터(0분, 350°)와 60분 벡터(110°, 연속 470°)의 길이는 둘 다 20 µm Peak입니다. 보라 화살표는 두 끝 사이 변화량 ${fmt(P64_VALUES.delta, 4)} µm Peak이며 진폭차 0과 다릅니다.`,
  panels: [{ ...polarPanel(), series: [...polarPanel().series.map(p => ({ ...p, color: 'muted' as const })), path(s.map(p => p.oneX), 'c1')], annotations: [...polarPanel().annotations!, arrow([cx, cy], at(0), 'muted'), arrow([cx, cy], at(60), 'c2'), arrow(at(0), at(60), 'c4'), { type: 'text', x: 12.2, y: 13.65, text: '0분·350°', anchor: 'end', color: 'muted' }, { type: 'text', x: 20.9, y: 4.6, text: '60분·110°', color: 'c2' }, { type: 'text', x: 21.0, y: 10.2, text: `|ΔV| ${fmt(P64_VALUES.delta, 4)} µm Peak`, color: 'c4' }] }],
};
const outline = acceptanceOutline(s[0].oneX, region);
export const accepted: FigureSpec = {
  id: 'fig-p6-4-4',
  caption: `그림 4. 초록 윤곽은 기준 20 µm Peak·350°의 진폭 ±20%·지연 ±30° 허용 영역입니다. 진폭 16~24 µm Peak와 지연 320°~20°(0°를 넘어 이어짐)를 함께 봅니다. 15분 경계는 포함되고 첫 이탈 표본은 ${P64_VALUES.firstOutside}분입니다. 임의 학습값이며 규격 한계가 아닙니다.`,
  panels: [{ ...polarPanel(true), series: [...polarPanel(true).series.map(p => ({ ...p, color: 'muted' as const })), path(outline, 'c3', '허용 영역 경계'), path(s.map(p => p.oneX), 'c1', '1X 경로')], annotations: [...polarPanel(true).annotations!, { type: 'point', x: at(15)[0], y: at(15)[1], label: '15분 경계', color: 'c3', dx: 15, dy: -15 }, { type: 'point', x: at(60)[0], y: at(60)[1], label: '60분 영역 밖', color: 'c2', dx: 34, dy: 4 }] }],
};
export const residualTrend: FigureSpec = {
  id: 'fig-p6-4-5',
  caption: `그림 5. 1X는 20 µm Peak 그대로, 2X는 2→8 µm Peak로 증가합니다. Overall은 ${fmt(P64_VALUES.residualStart, 4)}→${fmt(P64_VALUES.residualEnd, 4)} µm RMS(${fmt(P64_VALUES.residualGrowth, 3)}% 증가)입니다. 정확히 1X를 제거한 잔여 RMS는 1.414→5.657 µm로 4배입니다. 대역 전체 값과 잔여 값을 함께 확인하세요.`,
  panels: [trendPanel('전체와 잔여를 같은 눈금으로', [{ x: time, y: residual.map(p => p.overall * 1e6), color: 'c1', label: 'Overall' }, { x: time, y: residual.map(p => p.notOneXRms * 1e6), color: 'c4', label: 'Not-1X (정확 제거 모델)' }], [0, 20], '[µm RMS]')],
};
export const wrapped: FigureSpec = {
  id: 'fig-p6-4-6',
  caption: '그림 6. 위는 350°→470°의 알려진 연속 경로, 아래는 0~360°로 접은 같은 위상입니다. 4분 358°→5분 0°는 358° 점프가 아니라 +2° 이동입니다. 경계에서 선을 끊어 거짓 세로선을 피합니다. 실제 표본 간 이동이 180°를 넘으면 인접 위상만으로 선회 횟수를 복원할 수 없습니다.',
  panels: [trendPanel('연속 지연각', [{ x: time, y: s.map(p => toDeg(p.continuousLag)), color: 'c2' }], [340, 480], '[°]'), trendPanel('0~360°로 접은 지연각', [s.slice(0, 5), s.slice(5)].map(part => ({ x: part.map(p => p.time / 60), y: part.map(p => toDeg(p.oneX.lag)), color: 'c2' })), [0, 360], '[°]')],
};
