/**
 * P7-2 "1X 계열" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 계산은 랩(LAB-1X-01)과 같은 `lib/faults/oneX.ts`로 한다. 진폭은 µm p-p(= 2 × Peak)로 그린다.
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { crackTrend, oneXReadouts, orbit1X, ROTOR_1X, sweep, vectorAt, type OneXOptions, type Sensor } from '../lib/faults/oneX';

const fmt = formatNumber;
const R = ROTOR_1X;
const pp = (m: number) => 2e6 * m;
const o = (cause: OneXOptions['cause'], severity = 0.6): OneXOptions => ({ cause, severity });
const STATIC = o('static');
const COUPLE = o('couple');
const DYNAMIC = o('dynamic');
const BOW = o('bow');
const RUNOUT = o('runout');
const CRACK = o('crack');
const FORCE = o('directional');
const RESON = o('resonance');

const rd = (x: OneXOptions) => oneXReadouts(x);
const ppAt = (x: OneXOptions, s: Sensor, rpm: number, order: 1 | 2 = 1) => pp(vectorAt(x, s, rpm, order).amp);

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p7-2.test.ts`) */
export const P72_VALUES = {
  static: rd(STATIC),
  couple: rd(COUPLE),
  dynamic: rd(DYNAMIC),
  bow: rd(BOW),
  runout: rd(RUNOUT),
  crack: rd(CRACK),
  force: rd(FORCE),
  reson: rd(RESON),
  healthy: rd(o('healthy', 0)),
  /** 정적 불평형 B1 H: 1500 · 3000 rpm [µm pp] */
  static1500: ppAt(STATIC, 'B1H', 1500),
  static3000: ppAt(STATIC, 'B1H', 3000),
  trend: crackTrend(12),
};
const V = P72_VALUES;

// ── 공통 ──
const circle = (cx: number, cy: number, r: number, color: FigColor = 'muted', width = 1, dash = false): FigSeries => {
  const a = Array.from({ length: 73 }, (_, i) => (2 * Math.PI * i) / 72);
  return { x: a.map((t) => cx + r * Math.cos(t)), y: a.map((t) => cy + r * Math.sin(t)), color, width, dash };
};
const line = (x1: number, y1: number, x2: number, y2: number, color: FigColor = 'text', width = 1.4, dash = false): FigAnnotation => ({ type: 'line', x1, y1, x2, y2, color, width, dash });
const text = (x: number, y: number, t: string, extra: Partial<Extract<FigAnnotation, { type: 'text' }>> = {}): FigAnnotation => ({ type: 'text', x, y, text: t, anchor: 'middle', ...extra });

// ── 그림 1: 예시 로터와 두 강체 모드 ──
const X1: [number, number] = [0, 100];
const Y1 = squareYRange(X1, 300);
/** 모드 모양의 로터: B1(x 25)·B2(x 82)에서 dy1·dy2만큼 움직인 축(직선)과 몸통(기울어진 사각형) */
const rotorRow = (y: number, dy1: number, dy2: number, color: FigColor): FigSeries[] => {
  const at = (x: number) => y + dy1 + ((dy2 - dy1) * (x - 25)) / (82 - 25);
  return [
    { x: [16, 91], y: [at(16), at(91)], color, width: 1.6 },
    { x: [36, 72, 72, 36, 36], y: [at(36) + 2.6, at(72) + 2.6, at(72) - 2.6, at(36) - 2.6, at(36) + 2.6], color, width: 1.4 },
  ];
};
export const rotorModes: FigureSpec = {
  id: 'fig-p7-2-1',
  caption: `그림 1. 이 페이지의 예시 로터: 베어링 두 개(B1 구동 쪽, B2 반대쪽)로 받친 대칭 로터가 ${R.opRpm} rpm으로 돈다. 베어링마다 수평(H)·수직(V) 근접 센서가 있다. 가운데·아래: 이 로터의 두 강체 모드. 병진 모드는 두 베어링이 같은 쪽으로(수평 ${R.trans.H} · 수직 ${R.trans.V} rpm), 원추 모드는 반대쪽으로 움직인다(${R.conic.H} · ${R.conic.V} rpm). 지지 강성이 수평 쪽이 작아 수평의 고유 회전수가 낮다. 운전 회전수는 두 모드보다 아래다.`,
  panels: [
    {
      frame: false,
      height: 300,
      x: { range: X1 },
      y: { range: Y1 },
      series: [...rotorRow(22, 2.4, 2.4, 'c3'), ...rotorRow(8, 2.4, -2.4, 'c4')],
      annotations: [
        // 위: 기계
        { type: 'rect', x1: 2, x2: 12, y1: 33, y2: 41, color: 'muted' },
        text(7, 36.2, '전동기', { color: 'muted' }),
        { type: 'rect', x1: 12, x2: 16, y1: 35.6, y2: 38.4, color: 'muted' },
        line(16, 37, 36, 37, 'text', 2.2),
        line(72, 37, 91, 37, 'text', 2.2),
        { type: 'rect', x1: 36, x2: 72, y1: 34.4, y2: 39.6, color: 'c1' },
        text(54, 41.4, '로터', { color: 'c1', bold: true }),
        ...[25, 82].flatMap((x, i): FigAnnotation[] => [
          { type: 'rect', x1: x - 2.2, x2: x + 2.2, y1: 33.2, y2: 35.6, color: 'text' },
          text(x, 30.6, i === 0 ? 'B1 (구동 쪽)' : 'B2', { bold: true }),
          { type: 'arrow', double: false, x1: x + 6, y1: 37, x2: x + 3, y2: 37, color: 'c2' },
          { type: 'arrow', double: false, x1: x, y1: 42.6, x2: x, y2: 39.6, color: 'c2' },
        ]),
        text(95, 40.6, 'H·V 센서', { color: 'c2', anchor: 'end' }),
        // 가운데: 병진 모드
        line(16, 22, 91, 22, 'muted', 1, true),
        ...[25, 82].map((x): FigAnnotation => ({ type: 'arrow', double: false, x1: x, y1: 22, x2: x, y2: 25.4, color: 'c3' })),
        text(54, 16.4, `병진 모드: 두 베어링이 같은 쪽 (수평 ${R.trans.H} · 수직 ${R.trans.V} rpm)`, { color: 'c3' }),
        // 아래: 원추 모드
        line(16, 8, 91, 8, 'muted', 1, true),
        { type: 'arrow', double: false, x1: 25, y1: 8, x2: 25, y2: 11.2, color: 'c4' },
        { type: 'arrow', double: false, x1: 82, y1: 8, x2: 82, y2: 4.8, color: 'c4' },
        text(54, 1.6, `원추 모드: 두 베어링이 반대쪽 (${R.conic.H} · ${R.conic.V} rpm)`, { color: 'c4' }),
      ],
    },
  ],
};

// ── 그림 2: 정적·커플·동적 불평형과 두 베어링의 1X 벡터 ──
const X2: [number, number] = [0, 120];
const Y2 = squareYRange(X2, 300);
const PR = 9;
/** 극좌표 화살표: 0°가 위, 지연은 시계 방향 (반시계 회전, P3-3) */
const polarArrow = (cx: number, cy: number, amp: number, lagDeg: number, max: number, color: FigColor, label?: string): FigAnnotation => {
  const a = (lagDeg * Math.PI) / 180;
  const r = (PR * amp) / max;
  return { type: 'arrow', double: false, x1: cx, y1: cy, x2: cx + r * Math.sin(a), y2: cy + r * Math.cos(a), color, label, labelDy: -6 };
};
const UB_TYPES: [string, OneXOptions, [number, number][]][] = [
  ['정적 불평형', STATIC, [[0, 1]]],
  ['커플 불평형', COUPLE, [[-9, 1], [9, -1]]],
  ['동적 불평형', DYNAMIC, [[-9, 1], [4, -1]]],
];
const ubMax = Math.max(...UB_TYPES.flatMap(([, x]) => [pp(vectorAt(x, 'B1H', 3000).amp), pp(vectorAt(x, 'B2H', 3000).amp)]));
export const unbalanceTypes: FigureSpec = {
  id: 'fig-p7-2-2',
  caption: `그림 2. 세 가지 불평형과 ${R.opRpm} rpm에서 두 베어링 수평 센서의 1X 벡터 (원 = ${fmt(ubMax, 2)} µm p-p, 0°가 위, 지연은 시계 방향). 정적 불평형은 무거운 점이 하나라 병진 모드를 밀어 두 베어링 벡터가 같은 쪽을 가리킨다(위상차 ${fmt(Math.abs(V.static.b12Phase), 1)}°). 커플 불평형은 양 끝에 반대쪽 무게가 있어 원추 모드를 밀고 두 벡터가 거의 반대다(${fmt(Math.abs(V.couple.b12Phase), 3)}°). 둘이 섞인 동적 불평형은 그 사이(${fmt(Math.abs(V.dynamic.b12Phase), 2)}°)다. 위상차가 0°나 180°에서 조금 벗어나는 것은 건전한 로터에도 있는 작은 불평형·런아웃 때문이다.`,
  panels: [
    {
      frame: false,
      height: 300,
      x: { range: X2 },
      y: { range: Y2 },
      series: UB_TYPES.flatMap((_, i) => [circle(20 + 40 * i - 10.5, 14, PR), circle(20 + 40 * i + 10.5, 14, PR)]),
      annotations: UB_TYPES.flatMap(([name, x, spots], i): FigAnnotation[] => {
        const cx = 20 + 40 * i;
        const b1 = vectorAt(x, 'B1H', 3000);
        const b2 = vectorAt(x, 'B2H', 3000);
        return [
          text(cx, 50.5, name, { bold: true }),
          line(cx - 17, 40, cx + 17, 40, 'text', 2),
          { type: 'rect', x1: cx - 11, x2: cx + 11, y1: 37.4, y2: 42.6, color: 'c1' },
          ...[cx - 14, cx + 14].map((bx): FigAnnotation => ({ type: 'rect', x1: bx - 1.4, x2: bx + 1.4, y1: 36.4, y2: 38, color: 'text' })),
          ...spots.map(([dx, side]): FigAnnotation => ({ type: 'point', x: cx + dx, y: side > 0 ? 43.4 : 36.6, color: 'warn' })),
          text(cx - 14, 32.4, 'B1', { color: 'muted' }),
          text(cx + 14, 32.4, 'B2', { color: 'muted' }),
          text(cx - 10.5, 25.2, 'B1 수평', { color: 'c1' }),
          text(cx + 10.5, 25.2, 'B2 수평', { color: 'c2' }),
          polarArrow(cx - 10.5, 14, pp(b1.amp), b1.lagDeg, ubMax, 'c1'),
          polarArrow(cx + 10.5, 14, pp(b2.amp), b2.lagDeg, ubMax, 'c2'),
          text(cx, 1.4, `두 베어링 위상차 ${fmt(Math.abs(x === STATIC ? V.static.b12Phase : x === COUPLE ? V.couple.b12Phase : V.dynamic.b12Phase), x === STATIC ? 1 : 3)}°`, { bold: true }),
        ];
      }),
    },
  ],
};

// ── 그림 3: 불평형의 지문 — 회전수에 따라 ──
const xs = (pts: { rpm: number }[]) => pts.map((p) => p.rpm);
const ampSeries = (x: OneXOptions, s: Sensor, color: FigColor, label: string, comp = false, dash = false): FigSeries => {
  const pts = sweep(x, s, 1, 25, comp);
  return { x: xs(pts), y: pts.map((p) => pp(p.amp)), color, label, width: 2, dash };
};
const lagSeries = (x: OneXOptions, s: Sensor, color: FigColor, label: string, order: 1 | 2 = 1): FigSeries => {
  const pts = sweep(x, s, order, 25);
  return { x: xs(pts), y: pts.map((p) => p.lagDeg), color, label, width: 2, kind: 'dots', radius: 1.6 };
};
const RPM_AXIS = { range: [0, R.opRpm] as [number, number], label: '회전수 [rpm]', ticks: [0, 500, 1000, 1500, 2000, 2500, 3000] };
export const unbalanceBode: FigureSpec = {
  id: 'fig-p7-2-3',
  caption: `그림 3. 정적 불평형이 있는 로터를 ${R.opRpm} rpm에서 세우며(코스트다운) 잰 베어링 1의 1X. 위: 진폭은 0에서 출발해 회전수와 함께 커진다. 회전수가 ${R.opRpm / 2} → ${R.opRpm} rpm으로 2배가 되면 수평 1X는 ${fmt(V.static1500, 2)} → ${fmt(V.static3000, 3)} µm p-p로 ${fmt(V.static.ratioHalfSpeed, 2)}배다 — 원심력이 회전수의 제곱이라 약 4배이고, 병진 모드(${R.trans.H} rpm)에 다가가며 조금 더 커진다. 아래: 위상은 거의 변하지 않고, 수직이 수평보다 약 ${fmt(V.static.hvPhase, 2)}° 늦다(정방향으로 도는 힘). 수평이 수직의 ${fmt(V.static.hvRatio, 2)}배인 것은 수평 지지가 무르기 때문이다.`,
  panels: [
    {
      height: 150,
      x: RPM_AXIS,
      y: { range: [0, 45], label: '1X [µm p-p]' },
      series: [ampSeries(STATIC, 'B1H', 'c1', '베어링 1 수평'), ampSeries(STATIC, 'B1V', 'c2', '베어링 1 수직')],
      annotations: [
        { type: 'point', x: 1500, y: V.static1500, color: 'c1', label: `${fmt(V.static1500, 2)}`, dx: -6, dy: -10 },
        { type: 'point', x: 3000, y: V.static3000, color: 'c1', label: `${fmt(V.static3000, 3)}`, dx: -44, dy: -4 },
      ],
    },
    {
      height: 130,
      x: RPM_AXIS,
      y: { range: [0, 360], label: '위상 지연 [°]', ticks: [0, 90, 180, 270, 360] },
      series: [lagSeries(STATIC, 'B1H', 'c1', '베어링 1 수평'), lagSeries(STATIC, 'B1V', 'c2', '베어링 1 수직')],
      annotations: [{ type: 'arrow', x1: 2600, y1: vectorAt(STATIC, 'B1H', 2600).lagDeg, x2: 2600, y2: vectorAt(STATIC, 'B1V', 2600).lagDeg, double: true, label: `약 ${fmt(V.static.hvPhase, 2)}°`, color: 'text', labelDx: 34 }],
    },
  ],
};

// ── 그림 4: 저속에서도 있는 1X — 런아웃 · 휨 · 불평형 ──
export const slowRollCauses: FigureSpec = {
  id: 'fig-p7-2-4',
  caption: `그림 4. 베어링 1 수평 1X를 세 원인에서 비교한다 (정도 같게). 위: 그대로 잰 값. 불평형(파랑)은 0에서 출발하지만, 런아웃(주황)은 ${R.slowRollRpm} rpm에서 이미 ${fmt(pp(V.runout.slowRoll.B1H.amp), 2)} µm p-p이고 회전수와 상관없이 그대로다. 휨(초록)도 저속에서 ${fmt(pp(V.bow.slowRoll.B1H.amp), 2)} µm p-p로 시작하지만 회전수가 오르면 커진다(${R.opRpm} rpm에서 ${fmt(pp(V.bow.op.B1H.amp), 2)}). 아래: ${R.slowRollRpm} rpm의 벡터를 빼는 slow roll 보상(P3-3) 뒤. 런아웃은 건전한 로터 수준(${fmt(pp(V.runout.compensated), 2)} µm)으로 떨어지고, 휨은 증폭된 몫 ${fmt(pp(V.bow.compensated), 2)} µm가 남는다.`,
  panels: [
    {
      title: '그대로',
      height: 140,
      x: RPM_AXIS,
      y: { range: [0, 55], label: '1X [µm p-p]' },
      series: [ampSeries(STATIC, 'B1H', 'c1', '정적 불평형'), ampSeries(RUNOUT, 'B1H', 'c2', '런아웃'), ampSeries(BOW, 'B1H', 'c3', '휨 (bow)')],
    },
    {
      title: `slow roll 보상 뒤 (${R.slowRollRpm} rpm 벡터를 뺌)`,
      height: 140,
      x: RPM_AXIS,
      y: { range: [0, 55], label: '1X [µm p-p]' },
      series: [ampSeries(STATIC, 'B1H', 'c1', '정적 불평형', true), ampSeries(RUNOUT, 'B1H', 'c2', '런아웃', true), ampSeries(BOW, 'B1H', 'c3', '휨 (bow)', true)],
    },
  ],
};

// ── 그림 5: 크랙 — 2X 봉우리와 추세 ──
const amp2 = (s: Sensor) => {
  const pts = sweep(CRACK, s, 2, 25);
  return { x: xs(pts), y: pts.map((p) => pp(p.amp)) };
};
const tr = V.trend;
const months = tr.map((t) => t.month);
export const crackFig: FigureSpec = {
  id: 'fig-p7-2-5',
  caption: `그림 5. 크랙. 위: 코스트다운에서 본 2X. 병진 모드 고유 회전수의 절반(수평 ${R.trans.H / 2} · 수직 ${R.trans.V / 2} rpm)에서 2X가 봉우리를 세운다(수평 ${fmt(pp(V.crack.twoXmax), 2)} µm p-p) — 2X 힘의 주파수가 모드와 맞기 때문이다. 아래: 크랙이 1년 동안 자랄 때 ${R.opRpm} rpm의 1X·2X와 slow roll 1X(베어링 1 수평). 2X는 ${fmt(pp(tr[0].twoX.amp), 1)} → ${fmt(pp(tr[12].twoX.amp), 2)} µm로 늘고, 1X는 크기와 위상이 함께 움직인다(${fmt(pp(tr[0].oneX.amp), 2)} µm ∠${Math.round(tr[0].oneX.lagDeg)}° → ${fmt(pp(tr[12].oneX.amp), 2)} µm ∠${Math.round(tr[12].oneX.lagDeg)}°). slow roll 1X도 ${fmt(pp(tr[0].slowRoll.amp), 2)} → ${fmt(pp(tr[12].slowRoll.amp), 2)} µm로 커진다.`,
  panels: [
    {
      title: '코스트다운의 2X',
      height: 130,
      x: RPM_AXIS,
      y: { range: [0, 25], label: '2X [µm p-p]' },
      series: [{ ...amp2('B1H'), color: 'c1', width: 2, label: '베어링 1 수평' }, { ...amp2('B1V'), color: 'c2', width: 2, label: '베어링 1 수직' }],
      annotations: [{ type: 'vline', x: R.trans.H / 2, color: 'muted', dash: true, label: `${R.trans.H} ÷ 2` }],
    },
    {
      title: `크랙이 자라는 1년 (${R.opRpm} rpm, 베어링 1 수평)`,
      height: 130,
      x: { range: [0, 12], label: '개월', ticks: [0, 2, 4, 6, 8, 10, 12] },
      y: { range: [0, 50], label: '[µm p-p]' },
      series: [
        { x: months, y: tr.map((t) => pp(t.oneX.amp)), color: 'c1', width: 2, label: '1X' },
        { x: months, y: tr.map((t) => pp(t.twoX.amp)), color: 'c2', width: 2, label: '2X' },
        { x: months, y: tr.map((t) => pp(t.slowRoll.amp)), color: 'c3', width: 2, dash: true, label: `slow roll 1X (${R.slowRollRpm} rpm)` },
      ],
    },
    {
      height: 110,
      x: { range: [0, 12], label: '개월', ticks: [0, 2, 4, 6, 8, 10, 12] },
      y: { range: [0, 360], label: '1X 위상 [°]', ticks: [0, 90, 180, 270, 360] },
      series: [{ x: months, y: tr.map((t) => t.oneX.lagDeg), color: 'c1', kind: 'dots', radius: 3.5 }],
    },
  ],
};

// ── 그림 6: 방향이 정해진 힘 — 선 모양 오빗, 회전수와 거의 무관 ──
const ORB_C = 34;
const orbMax = Math.max(...[STATIC, FORCE].flatMap((x) => [vectorAt(x, 'B1H', 3000).amp, vectorAt(x, 'B1V', 3000).amp])) * 1e6;
const X6: [number, number] = [-70, 70];
const Y6 = squareYRange(X6, 320, -orbMax * 1.25);
const orbitSeries = (x: OneXOptions, cx: number, color: FigColor): FigSeries => {
  const { x: ox, y: oy } = orbit1X(x, 'B1', 3000);
  return { x: ox.map((v) => cx + v * 1e6), y: oy.map((v) => v * 1e6), color, width: 2 };
};
export const directionalFig: FigureSpec = {
  id: 'fig-p7-2-6',
  caption: `그림 6. 회전하는 힘(불평형)과 방향이 정해진 힘(편심 풀리가 벨트를 한 바퀴에 한 번 당겼다 놓는 힘)의 차이. 위: ${R.opRpm} rpm 베어링 1의 1X 오빗(같은 축척, 단위 µm). 불평형은 타원이고 수평·수직 위상차가 ${fmt(V.static.hvPhase, 2)}°, 벨트 힘은 수평으로 긴 선(수평 ÷ 수직 ${fmt(V.force.hvRatio, 2)}, 위상차 ${fmt(V.force.hvPhase, 2)}°)이다. 아래: 벨트 힘은 원심력이 아니라서 회전수와 거의 상관없이 저속에서도 크다(${R.slowRollRpm} rpm에서 ${fmt(pp(V.force.slowRoll.B1H.amp), 2)} µm p-p).`,
  panels: [
    {
      height: 320,
      x: { range: X6, ticks: 'none' },
      y: { range: Y6, ticks: 'none' },
      frame: false,
      series: [orbitSeries(STATIC, -ORB_C, 'c1'), orbitSeries(FORCE, ORB_C, 'c2')],
      annotations: [
        line(-ORB_C - 30, 0, -ORB_C + 30, 0, 'muted', 0.8),
        line(-ORB_C, -orbMax * 1.05, -ORB_C, orbMax * 1.05, 'muted', 0.8),
        line(ORB_C - 30, 0, ORB_C + 30, 0, 'muted', 0.8),
        line(ORB_C, -orbMax * 1.05, ORB_C, orbMax * 1.05, 'muted', 0.8),
        text(-ORB_C, orbMax * 1.25, '정적 불평형', { color: 'c1', bold: true }),
        text(ORB_C, orbMax * 1.25, '방향이 정해진 힘 (벨트)', { color: 'c2', bold: true }),
        text(-ORB_C + 31, -1.6, 'H', { color: 'muted', anchor: 'start' }),
        text(ORB_C + 31, -1.6, 'H', { color: 'muted', anchor: 'start' }),
        text(-ORB_C + 1.4, orbMax * 0.95, 'V', { color: 'muted', anchor: 'start' }),
        text(ORB_C + 1.4, orbMax * 0.95, 'V', { color: 'muted', anchor: 'start' }),
      ],
    },
    {
      height: 130,
      x: RPM_AXIS,
      y: { range: [0, 55], label: '1X [µm p-p]' },
      series: [ampSeries(STATIC, 'B1H', 'c1', '정적 불평형 (수평)'), ampSeries(FORCE, 'B1H', 'c2', '벨트 힘 (수평)'), ampSeries(FORCE, 'B1V', 'c2', '벨트 힘 (수직)', false, true)],
    },
  ],
};

// ── 그림 7: 받침대 구조 공진 ──
export const pedestalFig: FigureSpec = {
  id: 'fig-p7-2-7',
  caption: `그림 7. 베어링 1 받침대의 수평 고유진동수가 ${R.pedestal.rpm} rpm(${fmt(R.pedestal.rpm / 60, 3)} Hz)인 기계. 작은 불평형만 있어도 수평 1X(파랑)가 ${R.pedestal.rpm} rpm에서 ${fmt(pp(V.reson.oneXmax), 3)} µm p-p로 솟고, 그 둘레(2600 → 3000 rpm)에서 위상이 약 130° 바뀐다. 같은 베어링의 수직(주황)과 베어링 2(초록)는 매끄럽다. ${R.opRpm} rpm에서 수평이 ${fmt(pp(V.reson.op.B1H.amp), 2)} µm p-p로 커 보이지만, 회전수를 반으로 내리면 ${fmt(V.reson.ratioHalfSpeed, 2)}분의 1로 줄어 불평형의 4배 규칙과 맞지 않는다.`,
  panels: [
    {
      height: 150,
      x: RPM_AXIS,
      y: { range: [0, 130], label: '1X [µm p-p]' },
      series: [ampSeries(RESON, 'B1H', 'c1', '베어링 1 수평'), ampSeries(RESON, 'B1V', 'c2', '베어링 1 수직'), ampSeries(RESON, 'B2H', 'c3', '베어링 2 수평')],
      annotations: [{ type: 'vline', x: R.pedestal.rpm, color: 'muted', dash: true, label: `받침대 ${R.pedestal.rpm} rpm` }],
    },
    {
      height: 130,
      x: RPM_AXIS,
      y: { range: [0, 360], label: '위상 지연 [°]', ticks: [0, 90, 180, 270, 360] },
      series: [lagSeries(RESON, 'B1H', 'c1', '베어링 1 수평'), lagSeries(RESON, 'B1V', 'c2', '베어링 1 수직'), lagSeries(RESON, 'B2H', 'c3', '베어링 2 수평')],
    },
  ],
};

// ── 그림 8: 1X 감별 순서 ──
const X8: [number, number] = [0, 100];
const Y8: [number, number] = [0, 64];
const box = (x1: number, x2: number, y1: number, y2: number, lines: string[], color: FigColor, bold = false): FigAnnotation[] => [
  { type: 'rect', x1, x2, y1, y2, color },
  ...lines.map((t, i) => text((x1 + x2) / 2, (y1 + y2) / 2 + (lines.length - 1) * 1.55 - i * 3.1 - 0.9, t, { color: bold && i === 0 ? color : 'text', bold: bold && i === 0 })),
];
const STEPS: [string[], string[]][] = [
  [['① 한 방향만 크고 오빗이 선 모양인가?', '(수평 ÷ 수직, 수평·수직 위상차가 0° 근처)'], ['방향이 정해진 힘 (벨트·풀리)', '또는 받침대 공진 → ⑤로']],
  [['② Slow roll(저속) 1X가 큰가?'], ['런아웃: 회전수와 무관, 보상하면 0', '휨: 회전수와 함께 커짐 (크랙도 → ④)']],
  [['③ 회전수 2배에 1X가 약 4배인가?'], ['불평형: 두 베어링 위상으로', '0° 정적 · 180° 커플 · 그 사이 동적']],
  [['④ 2X가 임계속도의 절반에서 봉우리,', '1X·2X 벡터가 달마다 움직이는가?'], ['크랙 (slow roll 벡터도 바뀐다)', '→ 운전 중지 검토']],
  [['⑤ 특정 회전수 둘레에서만 크고', '위상이 급변하는가?'], ['구조 공진 (임팩트 시험, P9-1)', '아니면 방향이 정해진 힘']],
];
export const flowchart: FigureSpec = {
  id: 'fig-p7-2-8',
  caption: '그림 8. 1X가 클 때 원인을 가르는 순서 (이 페이지의 예). 왼쪽 질문에 "예"이면 오른쪽 후보로, "아니오"이면 아래 질문으로 간다. 실제 기계는 원인이 둘 이상 섞이므로, 한 갈래에서 멈추지 말고 끝까지 확인한다. 축방향 1X·2X가 크면 미스얼라인(P7-3), 전원을 끊는 순간 사라지면 전기적 원인(P7-7)을 함께 본다.',
  panels: [
    {
      frame: false,
      height: 420,
      x: { range: X8 },
      y: { range: Y8 },
      series: [],
      annotations: STEPS.flatMap(([q, a], i): FigAnnotation[] => {
        const y2 = 62 - i * 12.6;
        const y1 = y2 - 9;
        const mid = (y1 + y2) / 2;
        return [
          ...box(1, 47, y1, y2, q, 'accent'),
          ...box(57, 99, y1, y2, a, 'c3', true),
          { type: 'arrow', double: false, x1: 47, y1: mid, x2: 57, y2: mid, color: 'c3', label: '예', labelDy: -6 },
          ...(i < STEPS.length - 1 ? [{ type: 'arrow', double: false, x1: 24, y1, x2: 24, y2: y1 - 3.6, color: 'muted', label: '아니오', labelDx: 26, labelDy: 4 } as FigAnnotation] : []),
        ];
      }),
    },
  ],
};
