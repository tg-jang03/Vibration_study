/**
 * P7-3 "미스얼라인먼트 · 풀림 · 러브" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 계산은 랩(LAB-NL-01)과 같은 `lib/faults/contact.ts`로 한다. 무차원 값을 이렇게 읽는다:
 * 로터 임계속도 3000 rpm (회전수비 1 = 3000 rpm), 간극 1 = 100 µm.
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import {
  couplingAxial,
  footLooseness,
  forwardFraction,
  fullOrderSpectrum,
  harmonicOf,
  meanPosition,
  newkirk,
  nlRotor,
  orderPart,
  simulate,
  simulateTransient,
  type ContactRecord,
  type ContactRotor,
} from '../lib/faults/contact';

const fmt = formatNumber;
/** 간극 1 = 100 µm, 회전수비 1 = 3000 rpm */
export const UM = 100;
export const RPM1 = 3000;
const um = (v: number) => UM * v;

// ── 기록 ──
const REVS = 64;
const run = (r: ContactRotor) => simulate(r, REVS, 300);
const NO_CONTACT = (r: ContactRotor): ContactRotor => ({ ...r, contact: undefined });
export const CASES = {
  rubLight: nlRotor('rub', 0.5, 1.4),
  rubHalf: nlRotor('rub', 0.5, 2.6),
  looseHarm: nlRotor('looseRot', 1, 1.2),
  looseHalf: nlRotor('looseRot', 0.5, 1.4),
  misMild: nlRotor('misalign', 0.25, 0.8),
  misStrong: nlRotor('misalign', 0.8, 0.8),
  normal08: nlRotor('normal', 0.5, 0.8),
  fullRub: { ...nlRotor('rub', 0.5, 2.3), e: 0.25, contact: { cx: 0, cy: 0, kc: 40, mu: 0.15 } } as ContactRotor,
};
const REC = {
  rubLight: run(CASES.rubLight),
  rubLightFree: run(NO_CONTACT(CASES.rubLight)),
  rubHalf: run(CASES.rubHalf),
  looseHarm: run(CASES.looseHarm),
  looseHalf: run(CASES.looseHalf),
  misMild: run(CASES.misMild),
  misStrong: run(CASES.misStrong),
  normal08: run(CASES.normal08),
};
const FULL = simulateTransient(CASES.fullRub, 200, 1.8);
/** 정도 100 % 부분 러브: 역방향 선회가 고유진동수에 잠김 (dry whip) */
const WHIP = [7800, 8400, 9000].map((rpm) => ({ rpm, rec: run(nlRotor('rub', 1, rpm / RPM1)) }));
const whipPeak = (rec: ContactRecord, rpm: number) => {
  const f = fullOrderSpectrum(rec);
  let bi = -1;
  for (let i = 0; i < f.order.length; i++) if (f.order[i] < -0.05 && (bi < 0 || f.amp[i] > f.amp[bi])) bi = i;
  return { rpm, order: f.order[bi], hz: (Math.abs(f.order[bi]) * rpm) / 60, amp: um(f.amp[bi]), fwdOrbit: forwardFraction(rec.x, rec.y) };
};
const FOOT = { tight: footLooseness({ loose: false, force: 1.6, speed: 0.6 }), loose: footLooseness({ loose: true, force: 1.6, speed: 0.6 }) };
const NK = {
  below: newkirk({ gain: 1.6, lagDeg: 40, touch: 1.2, heat: 0.02, cool: 60, minutes: 240 }),
  above: newkirk({ gain: 1.3, lagDeg: 150, touch: 1.2, heat: 0.02, cool: 60, minutes: 240 }),
};

/** 차수 q의 정·역 성분 반지름 [µm]과 수직 p-p [µm] */
const part = (rec: ContactRecord, q: number) => {
  const p = orderPart(rec, q);
  return { fwd: um(p.fwd), bwd: um(p.bwd), vpp: 2 * um(p.yAmp), hpp: 2 * um(p.xAmp) };
};
const pp = (a: ArrayLike<number>) => um(Math.max(...Array.from(a)) - Math.min(...Array.from(a)));
const mean = (rec: ContactRecord) => meanPosition(rec).map(um) as [number, number];

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p7-3.test.ts`) */
export const P73_VALUES = {
  rubLight: { half: part(REC.rubLight, 0.5), one: part(REC.rubLight, 1), two: part(REC.rubLight, 2), three: part(REC.rubLight, 3), cf: REC.rubLight.contactFraction, vpp: pp(REC.rubLight.y), hpp: pp(REC.rubLight.x) },
  rubLightFree: { one: part(REC.rubLightFree, 1), two: part(REC.rubLightFree, 2), vpp: pp(REC.rubLightFree.y) },
  rubHalf: { half: part(REC.rubHalf, 0.5), one: part(REC.rubHalf, 1), quarter: part(REC.rubHalf, 0.25), cf: REC.rubHalf.contactFraction },
  looseHarm: { one: part(REC.looseHarm, 1), two: part(REC.looseHarm, 2), three: part(REC.looseHarm, 3), four: part(REC.looseHarm, 4), five: part(REC.looseHarm, 5), half: part(REC.looseHarm, 0.5), vpp: pp(REC.looseHarm.y), hpp: pp(REC.looseHarm.x) },
  looseHalf: { half: part(REC.looseHalf, 0.5), one: part(REC.looseHalf, 1), oneHalf: part(REC.looseHalf, 1.5), two: part(REC.looseHalf, 2) },
  mis: {
    mild: { one: part(REC.misMild, 1), two: part(REC.misMild, 2), mean: mean(REC.misMild) },
    strong: { one: part(REC.misStrong, 1), two: part(REC.misStrong, 2), mean: mean(REC.misStrong) },
    normal: { one: part(REC.normal08, 1), mean: mean(REC.normal08) },
  },
  whip: WHIP.map((w) => whipPeak(w.rec, w.rpm)),
  fullRub: { revs: FULL.revs, stopped: FULL.stopped, fwdLast: forwardFraction(FULL.x, FULL.y, FULL.x.length - 3 * 64), fwdFirst: forwardFraction(FULL.x.slice(0, 2 * 64), FULL.y.slice(0, 2 * 64)) },
  foot: {
    tight: { foot: harmonicOf(FOOT.tight.foot, 64, 1), base: harmonicOf(FOOT.tight.base, 64, 1), foot2: harmonicOf(FOOT.tight.foot, 64, 2) },
    loose: { foot: harmonicOf(FOOT.loose.foot, 64, 1), base: harmonicOf(FOOT.loose.base, 64, 1), foot2: harmonicOf(FOOT.loose.foot, 64, 2) },
  },
  newkirk: { below: [0, 60, 120, 180, 240].map((m) => NK.below[m]), above: [0, 60, 120, 180, 240].map((m) => NK.above[m]) },
};
const V = P73_VALUES;

// ── 공통 ──
const line = (x1: number, y1: number, x2: number, y2: number, color: FigColor = 'text', width = 1.4, dash = false): FigAnnotation => ({ type: 'line', x1, y1, x2, y2, color, width, dash });
const text = (x: number, y: number, t: string, extra: Partial<Extract<FigAnnotation, { type: 'text' }>> = {}): FigAnnotation => ({ type: 'text', x, y, text: t, anchor: 'middle', ...extra });
const circle = (cx: number, cy: number, r: number, color: FigColor = 'muted', width = 1, dash = false): FigSeries => {
  const a = Array.from({ length: 121 }, (_, i) => (2 * Math.PI * i) / 120);
  return { x: a.map((t) => cx + r * Math.cos(t)), y: a.map((t) => cy + r * Math.sin(t)), color, width, dash };
};
/** 한 기록의 마지막 n바퀴 오빗 [µm] (cx 만큼 옮김)과 키페이저 점 */
const orbitOf = (rec: ContactRecord | { x: ArrayLike<number>; y: ArrayLike<number> }, cx: number, color: FigColor, revs = 8): { s: FigSeries; dots: FigAnnotation[] } => {
  const n = rec.x.length;
  const from = Math.max(0, n - revs * 64);
  const xs: number[] = [];
  const ys: number[] = [];
  const dots: FigAnnotation[] = [];
  for (let i = from; i < n; i++) {
    xs.push(cx + um(rec.x[i]));
    ys.push(um(rec.y[i]));
    if (i % 64 === 0 && dots.length < 4) dots.push({ type: 'point', x: cx + um(rec.x[i]), y: um(rec.y[i]), color: 'warn' });
  }
  return { s: { x: xs, y: ys, color, width: 1.3 }, dots };
};
/** 차수 막대 (수직 p-p) */
const ORDERS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const orderBars = (rec: ContactRecord, color: FigColor, dx = 0, label?: string): FigSeries => ({
  x: ORDERS.map((q) => q + dx),
  y: ORDERS.map((q) => part(rec, q).vpp),
  kind: 'bar',
  barWidth: 0.16,
  color,
  label,
});
const ORDER_AXIS = { range: [0.2, 5.3] as [number, number], label: '차수 (× 회전 주파수)', ticks: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] };

// ── 그림 1: 닿으면 파형이 납작해지고 하모닉이 생긴다 ──
const wave = (rec: ContactRecord, revs = 2) => {
  const n = revs * 64;
  const from = rec.y.length - n;
  return { x: Array.from({ length: n }, (_, i) => (360 * i) / 64), y: Array.from({ length: n }, (_, i) => um(rec.y[from + i])) };
};
export const contactIntro: FigureSpec = {
  id: 'fig-p7-3-1',
  caption: `그림 1. 같은 로터(임계속도 ${RPM1} rpm, 씰 반경 간극 ${UM} µm, 중력 처짐 ${um(0.7)} µm)를 ${fmt(1.4 * RPM1, 2)} rpm으로 돌릴 때 수직 변위. 위: 씰이 없다면(회색 점선) 처진 자리에서 반경 ${fmt(V.rubLightFree.one.fwd, 2)} µm의 원을 그려 파형이 사인파이고 1X 하나뿐이다. 그 원의 바닥이 씰에 살짝 닿자 축이 튕겨 나가 간극을 크게 도는 운동으로 옮겨 갔다(파랑, 1X ${fmt(V.rubLight.one.vpp, 3)} µm p-p) — 접촉이 오히려 진동을 키운다. 파형은 바닥에서 씰에 막혀 꺾인다. 아래: 수직 성분을 차수로 나눈 크기(p-p). 접촉이 2X(${fmt(V.rubLight.two.vpp, 2)} µm)와 3X·½X를 만든다. 힘이 변위에 비례하지 않는 계(비선형)는 사인파 힘을 넣어도 사인파로 답하지 않는다.`,
  panels: [
    {
      height: 140,
      x: { range: [0, 720], label: '회전각 [°] (키페이저 = 0°)', ticks: [0, 90, 180, 270, 360, 450, 540, 630, 720] },
      y: { range: [-125, 105], label: '수직 [µm]' },
      series: [{ ...wave(REC.rubLightFree), color: 'muted', width: 1.4, dash: true, label: '씰이 없다면' }, { ...wave(REC.rubLight), color: 'c1', width: 2, label: '씰에 닿음' }],
      annotations: [{ type: 'hline', y: -UM, color: 'warn', dash: true, label: '씰 (아래쪽)', labelAt: 'end', labelBelow: true }],
    },
    {
      height: 130,
      x: ORDER_AXIS,
      y: { range: [0, 180], label: '수직 [µm p-p]' },
      series: [orderBars(REC.rubLightFree, 'muted', -0.09, '씰이 없다면'), orderBars(REC.rubLight, 'c1', 0.09, '씰에 닿음')],
    },
  ],
};

// ── 그림 2: 미스얼라인먼트 — 평행·각, 커플링이 미는 힘 ──
const X2: [number, number] = [0, 100];
const Y2 = squareYRange(X2, 260);
const shaftRow = (y0: number, dyPump: number, tilt: number, title: string): FigAnnotation[] => [
  text(50, y0 + 9.4, title, { bold: true }),
  // 전동기
  { type: 'rect', x1: 4, x2: 24, y1: y0 - 3.2, y2: y0 + 3.2, color: 'muted' },
  text(14, y0 - 0.6, '전동기', { color: 'muted' }),
  line(24, y0, 47, y0, 'text', 2),
  // 커플링
  { type: 'rect', x1: 47, x2: 50, y1: y0 - 2.2, y2: y0 + 2.2, color: 'c2' },
  { type: 'rect', x1: 50.4, x2: 53.4, y1: y0 - 2.2 + dyPump, y2: y0 + 2.2 + dyPump, color: 'c2' },
  // 펌프 축 (기울기 tilt: 커플링에서 멀어질수록)
  line(53.4, y0 + dyPump, 80, y0 + dyPump + tilt, 'text', 2),
  { type: 'rect', x1: 80, x2: 96, y1: y0 - 3.2 + dyPump + tilt, y2: y0 + 3.2 + dyPump + tilt, color: 'muted' },
  text(88, y0 - 0.6 + dyPump + tilt, '펌프', { color: 'muted' }),
  // 중심선 (전동기 축의 연장)
  line(24, y0, 96, y0, 'muted', 0.8, true),
];
export const misalignSketch: FigureSpec = {
  id: 'fig-p7-3-2',
  caption: '그림 2. 미스얼라인먼트(정렬 불량, P3-3): 커플링으로 이은 두 축의 중심선이 어긋나거나(평행) 꺾인(각) 상태. 실제로는 둘이 섞여 있다. 어긋난 축을 커플링이 억지로 이으므로 (1) 두 축을 서로 끌어당기는 정적 힘(예하중)이 생겨 베어링 속 축의 자리가 바뀌고, (2) 커플링이 한 바퀴에 한두 번 굽혔다 펴지며 1X·2X 힘을 만들고, (3) 각 미스얼라인에서는 두 축을 축방향으로 서로 반대로 민다.',
  panels: [
    {
      frame: false,
      height: 260,
      x: { range: X2 },
      y: { range: Y2 },
      series: [],
      annotations: [
        ...shaftRow(Y2[1] * 0.68, -2.6, 0, '평행 미스얼라인: 두 중심선이 나란히 어긋남'),
        { type: 'arrow', double: true, x1: 58, y1: Y2[1] * 0.68, x2: 58, y2: Y2[1] * 0.68 - 2.6, color: 'warn', label: '어긋남' },
        ...shaftRow(Y2[1] * 0.2, 0, -4.4, '각 미스얼라인: 두 중심선이 커플링에서 꺾임'),
        { type: 'arrow', double: false, x1: 45, y1: Y2[1] * 0.2 + 4.2, x2: 38, y2: Y2[1] * 0.2 + 4.2, color: 'c1' },
        { type: 'arrow', double: false, x1: 55, y1: Y2[1] * 0.2 + 4.2, x2: 62, y2: Y2[1] * 0.2 + 4.2, color: 'c1' },
        text(50, Y2[1] * 0.2 + 6.2, '축방향으로 서로 반대', { color: 'c1' }),
      ],
    },
  ],
};

// ── 그림 3: 미스얼라인 오빗 — 바나나 → 8자, 축 자리 이동 ──
const misOrbits = [
  { rec: REC.normal08, title: '정렬 양호', color: 'c1' as FigColor },
  { rec: REC.misMild, title: '미스얼라인 (약)', color: 'c2' as FigColor },
  { rec: REC.misStrong, title: '미스얼라인 (강)', color: 'c4' as FigColor },
];
const misNormalMean = V.mis.normal.mean;
// 오빗마다 실제 범위로 칸을 나눠 (수평 평균 이동도 그대로 보이게) 왼쪽부터 놓는다
const misExt = misOrbits.map((m) => {
  const n = m.rec.x.length;
  const xs = Array.from(m.rec.x.slice(n - 8 * 64)).map(um);
  const ys = Array.from(m.rec.y.slice(n - 8 * 64)).map(um);
  return { x0: Math.min(...xs, -20), x1: Math.max(...xs, 20), y0: Math.min(...ys), y1: Math.max(...ys) };
});
const MIS_GAP = 16;
const MIS_C: number[] = [];
let misCursor = 0;
for (const e of misExt) {
  const c = misCursor + MIS_GAP - e.x0;
  MIS_C.push(c);
  misCursor = c + e.x1 + MIS_GAP;
}
const X3: [number, number] = [0, misCursor];
const misY0 = Math.min(...misExt.map((e) => e.y0), misNormalMean[1]) - 16;
const misY1 = Math.max(...misExt.map((e) => e.y1)) + 26;
const MIS_H = Math.round((misY1 - misY0) / ((1.2 * (X3[1] - X3[0])) / 820));
const Y3 = squareYRange(X3, MIS_H, misY0);
export const misalignOrbits: FigureSpec = {
  id: 'fig-p7-3-3',
  caption: `그림 3. ${fmt(0.8 * RPM1, 2)} rpm에서 본 오빗 (같은 축척, 단위 µm, 점 = 키페이저). 정렬이 좋으면 불평형만의 작은 원이다. 미스얼라인이 생기면 커플링의 1X·2X 힘이 한 방향으로 미는 것이 더해져 오빗이 바나나 모양으로 휘고(약: 2X ${fmt(V.mis.mild.two.vpp, 2)} µm p-p), 2X가 1X보다 커지면 8자가 된다(강: 1X ${fmt(V.mis.strong.one.vpp, 2)} · 2X ${fmt(V.mis.strong.two.vpp, 2)} µm p-p). 십자(+)는 각 오빗의 평균 자리 — Shaft centerline(P4-3)의 한 점이다. 예하중이 축을 위·오른쪽으로 밀어 정렬 양호(${fmt(misNormalMean[1], 2)} µm)보다 ${fmt(V.mis.strong.mean[1] - misNormalMean[1], 2)} µm 높이 떴다.`,
  panels: [
    {
      frame: false,
      height: MIS_H,
      x: { range: X3, ticks: 'none' },
      y: { range: Y3, ticks: 'none' },
      series: misOrbits.map((m, i) => orbitOf(m.rec, MIS_C[i], m.color).s),
      annotations: [
        ...misOrbits.flatMap((m, i): FigAnnotation[] => {
          const [mx, my] = mean(m.rec);
          const e = misExt[i];
          return [
            text(MIS_C[i] + (e.x0 + e.x1) / 2, Y3[1] - 12, m.title, { color: m.color, bold: true }),
            ...orbitOf(m.rec, MIS_C[i], m.color).dots.slice(0, 1),
            line(MIS_C[i] + mx - 5, my, MIS_C[i] + mx + 5, my, 'text', 1.6),
            line(MIS_C[i] + mx, my - 5, MIS_C[i] + mx, my + 5, 'text', 1.6),
            line(MIS_C[i] + e.x0 - 6, misNormalMean[1], MIS_C[i] + e.x1 + 6, misNormalMean[1], 'muted', 0.8, true),
          ];
        }),
        text(X3[1] - 4, misNormalMean[1] - 10, '점선 = 정렬 양호의 평균 자리', { color: 'muted', anchor: 'end' }),
      ],
    },
  ],
};

// ── 그림 4: 커플링 건너 축방향 위상 ──
const axial = (kind: 'misalign' | 'unbalance') => {
  const a = couplingAxial(kind, 2);
  const x = Array.from({ length: a.motor.length }, (_, i) => (360 * i) / a.spr);
  return { x, motor: a.motor, pump: a.pump };
};
const AX = { mis: axial('misalign'), ub: axial('unbalance') };
export const couplingPhase: FigureSpec = {
  id: 'fig-p7-3-4',
  caption: '그림 4. 커플링 양쪽 베어링의 축방향 진동 (설명용 파형, 같은 시각 기록). 위: 각 미스얼라인은 커플링이 두 축을 반대로 밀므로 전동기 쪽(파랑)과 펌프 쪽(주황)이 거울처럼 반대로 움직인다 — 1X·2X 모두 위상차 약 180°. 아래: 불평형만이면 축방향은 작고 두 쪽이 거의 같이 움직인다. 같은 방향으로 센서를 달았는지(극성)를 먼저 확인해야 180°를 믿을 수 있다.',
  panels: [
    {
      title: '미스얼라인먼트',
      height: 130,
      x: { range: [0, 720], label: '회전각 [°]', ticks: [0, 180, 360, 540, 720] },
      y: { range: [-2, 2], label: '축방향 (상대)' },
      series: [{ x: AX.mis.x, y: AX.mis.motor, color: 'c1', width: 2, label: '전동기 쪽' }, { x: AX.mis.x, y: AX.mis.pump, color: 'c2', width: 2, label: '펌프 쪽' }],
    },
    {
      title: '불평형만',
      height: 110,
      x: { range: [0, 720], label: '회전각 [°]', ticks: [0, 180, 360, 540, 720] },
      y: { range: [-2, 2], label: '축방향 (상대)' },
      series: [{ x: AX.ub.x, y: AX.ub.motor, color: 'c1', width: 2, label: '전동기 쪽' }, { x: AX.ub.x, y: AX.ub.pump, color: 'c2', width: 2, label: '펌프 쪽' }],
    },
  ],
};

// ── 그림 5: 구조적 풀림 — 받침과 베이스 ──
const footWave = (r: { foot: number[]; base: number[] }, key: 'foot' | 'base') => {
  const n = 2 * 64;
  const s = r[key];
  const from = s.length - n;
  const ref = r.base.slice(from).reduce((a, b) => a + b, 0) / n;
  return { x: Array.from({ length: n }, (_, i) => (360 * i) / 64), y: Array.from({ length: n }, (_, i) => s[from + i] - ref) };
};
const ft = V.foot;
export const footFig: FigureSpec = {
  id: 'fig-p7-3-5',
  caption: `그림 5. 구조적 풀림: 기계 받침(발)과 그 아래 베이스를 함께 잰 수직 변위 (설명용 모델, 받침 무게보다 큰 1X 힘). 위: 볼트가 조여 있으면 받침과 베이스가 함께 움직인다(1X ${fmt(ft.tight.foot.amp, 2)} vs ${fmt(ft.tight.base.amp, 2)}, 위상차 ${fmt(Math.abs(ft.tight.foot.lagDeg - ft.tight.base.lagDeg), 1)}°). 아래: 볼트가 풀리면 받침만 들렸다 떨어져 1X가 베이스의 ${fmt(ft.loose.foot.amp / ft.loose.base.amp, 2)}배, 위상차 ${fmt(ft.loose.foot.lagDeg - ft.loose.base.lagDeg, 2)}°이고, 파형이 위쪽으로만 솟아 2X가 1X의 ${fmt(ft.loose.foot2.amp / ft.loose.foot.amp, 2)}배다. 이음의 양쪽을 재서 진폭과 위상이 갑자기 바뀌는 곳을 찾는다.`,
  panels: [
    {
      title: '볼트 조임',
      height: 120,
      x: { range: [0, 720], label: '회전각 [°]', ticks: [0, 180, 360, 540, 720] },
      y: { range: [-1, 1.6], label: '수직 (상대)' },
      series: [{ ...footWave(FOOT.tight, 'foot'), color: 'c1', width: 2, label: '받침' }, { ...footWave(FOOT.tight, 'base'), color: 'c3', width: 2, dash: true, label: '베이스' }],
    },
    {
      title: '볼트 풀림',
      height: 120,
      x: { range: [0, 720], label: '회전각 [°]', ticks: [0, 180, 360, 540, 720] },
      y: { range: [-1, 1.6], label: '수직 (상대)' },
      series: [{ ...footWave(FOOT.loose, 'foot'), color: 'c1', width: 2, label: '받침' }, { ...footWave(FOOT.loose, 'base'), color: 'c3', width: 2, dash: true, label: '베이스' }],
    },
  ],
};

// ── 그림 6: 회전 풀림 — 많은 하모닉, ½X ──
export const looseRotFig: FigureSpec = {
  id: 'fig-p7-3-6',
  caption: `그림 6. 회전 풀림: 베어링 간극이 커져 축이 간극 바닥에 얹혀 있다가 불평형 힘이 무게를 이기는 순간 들렸다 떨어지는 로터 (간극 ${UM} µm). 위: 수직 파형. ${fmt(1.2 * RPM1, 2)} rpm(파랑)은 아래가 바닥에 막혀 잘리고, ${fmt(1.4 * RPM1, 2)} rpm(주황)은 두 바퀴마다 모양이 되풀이된다. 아래: 수직 성분(p-p). ${fmt(1.2 * RPM1, 2)} rpm은 1X 위로 2X ~ 5X가 줄지어 서고(2X ${fmt(V.looseHarm.two.vpp, 2)} · 3X ${fmt(V.looseHarm.three.vpp, 2)} · 4X ${fmt(V.looseHarm.four.vpp, 2)} µm), ${fmt(1.4 * RPM1, 2)} rpm은 ½X(${fmt(V.looseHalf.half.vpp, 2)} µm)와 1½X(${fmt(V.looseHalf.oneHalf.vpp, 2)} µm)가 선다. 같은 기계가 회전수에 따라 다른 지문을 보인다.`,
  panels: [
    {
      height: 140,
      x: { range: [0, 1440], label: '회전각 [°]', ticks: [0, 360, 720, 1080, 1440] },
      y: { range: [-140, 140], label: '수직 [µm]' },
      series: [{ ...wave(REC.looseHarm, 4), color: 'c1', width: 1.8, label: `${fmt(1.2 * RPM1, 2)} rpm` }, { ...wave(REC.looseHalf, 4), color: 'c2', width: 1.4, label: `${fmt(1.4 * RPM1, 2)} rpm` }],
      annotations: [{ type: 'hline', y: -UM, color: 'warn', dash: true, label: '간극 바닥', labelAt: 'end', labelBelow: true }],
    },
    {
      height: 130,
      x: ORDER_AXIS,
      y: { range: [0, 200], label: '수직 [µm p-p]' },
      series: [orderBars(REC.looseHarm, 'c1', -0.09, `${fmt(1.2 * RPM1, 2)} rpm`), orderBars(REC.looseHalf, 'c2', 0.09, `${fmt(1.4 * RPM1, 2)} rpm`)],
    },
  ],
};

// ── 그림 7: 부분 러브 — 오빗과 Full spectrum ──
const X7: [number, number] = [-240, 240];
const Y7 = squareYRange(X7, 370, -128);
const RUB_C = [-118, 118];
const fullBars = (rec: ContactRecord, color: FigColor, dx = 0, label?: string): FigSeries => {
  const qs = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3];
  return {
    x: qs.map((q) => q + dx),
    y: qs.map((q) => {
      const p = part(rec, Math.abs(q));
      return q > 0 ? p.fwd : p.bwd;
    }),
    kind: 'bar',
    barWidth: 0.18,
    color,
    label,
  };
};
export const rubFig: FigureSpec = {
  id: 'fig-p7-3-7',
  caption: `그림 7. 부분 러브 — 축이 한 바퀴의 일부 동안만 씰(회색 원, 반경 간극 ${UM} µm)에 닿는다. 위: 오빗(점 = 키페이저). ${fmt(1.4 * RPM1, 2)} rpm(파랑)은 씰 원을 따라 크게 돌며 바닥에서 씰에 막힌다. 매 바퀴 닿는 자리가 조금씩 달라 키페이저 점이 한 자리에 모이지 않고 흩어진다 — 같은 모양이 정확히 되풀이되지 않는 운동이다. ${fmt(2.6 * RPM1, 2)} rpm(주황)은 임계속도의 약 2배라, 닿을 때마다 로터가 제 고유진동수로 울려 두 바퀴에 한 번 같은 모양이 된다 — 점이 두 자리이고, 수직 ½X ${fmt(V.rubHalf.half.vpp, 3)} µm p-p가 1X(${fmt(V.rubHalf.one.vpp, 2)} µm p-p)보다 훨씬 크다. 아래: Full spectrum(P5-3, 원의 반지름, 오른쪽 = 정방향, 왼쪽 = 역방향). 접촉은 하모닉과 역방향 성분을 만든다.`,
  panels: [
    {
      frame: false,
      height: 370,
      x: { range: X7, ticks: 'none' },
      y: { range: Y7, ticks: 'none' },
      series: [circle(RUB_C[0], 0, UM, 'muted', 1.2), circle(RUB_C[1], 0, UM, 'muted', 1.2), orbitOf(REC.rubLight, RUB_C[0], 'c1').s, orbitOf(REC.rubHalf, RUB_C[1], 'c2').s],
      annotations: [
        ...orbitOf(REC.rubLight, RUB_C[0], 'c1').dots,
        ...orbitOf(REC.rubHalf, RUB_C[1], 'c2').dots,
        text(RUB_C[0], 116, `${fmt(1.4 * RPM1, 2)} rpm`, { color: 'c1', bold: true }),
        text(RUB_C[1], 116, `${fmt(2.6 * RPM1, 2)} rpm`, { color: 'c2', bold: true }),
        line(RUB_C[0], -4, RUB_C[0], 4, 'muted', 1),
        line(RUB_C[0] - 4, 0, RUB_C[0] + 4, 0, 'muted', 1),
        line(RUB_C[1], -4, RUB_C[1], 4, 'muted', 1),
        line(RUB_C[1] - 4, 0, RUB_C[1] + 4, 0, 'muted', 1),
      ],
    },
    {
      height: 140,
      x: { range: [-3.4, 3.4], label: '차수 (− 역방향 · + 정방향)', ticks: [-3, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 3] },
      y: { range: [0, 90], label: '[µm]' },
      series: [fullBars(REC.rubLight, 'c1', -0.1, `${fmt(1.4 * RPM1, 2)} rpm`), fullBars(REC.rubHalf, 'c2', 0.1, `${fmt(2.6 * RPM1, 2)} rpm`)],
      annotations: [{ type: 'vline', x: 0, color: 'muted' }],
    },
  ],
};

// ── 그림 8: 원주 러브의 시작 — 역방향 선회가 빠르게 커진다 ──
const X8: [number, number] = [-420, 420];
const Y8 = squareYRange(X8, 300, -185);
const fullOrbit = { x: FULL.x.map(um), y: FULL.y.map(um) };
const radius = FULL.x.map((x, i) => um(Math.hypot(x, FULL.y[i])));
const WHIP_COLORS: FigColor[] = ['c1', 'c2', 'c3'];
const whipSeries = WHIP.map((w, i): FigSeries => {
  const fsp = fullOrderSpectrum(w.rec);
  const xs: number[] = [];
  const ys: number[] = [];
  for (let k = 0; k < fsp.order.length; k++)
    if (Math.abs(fsp.order[k]) <= 2) {
      xs.push(fsp.order[k]);
      ys.push(um(fsp.amp[k]));
    }
  return { x: xs, y: ys, color: WHIP_COLORS[i], width: 1.4, label: `${w.rpm} rpm` };
});
export const fullRubFig: FigureSpec = {
  id: 'fig-p7-3-8',
  caption: `그림 8. 원주 러브로 번질 때. 위: 정도 100 %의 부분 러브를 ${V.whip.map((w) => w.rpm).join(' · ')} rpm으로 돌린 Full spectrum. 가장 큰 성분이 역방향이고(${V.whip.map((w) => `${fmt(w.order, 2)}X`).join(' · ')}), 차수는 회전수마다 다르지만 주파수는 ${V.whip.map((w) => fmt(w.hz, 3)).join(' · ')} Hz로 거의 같다 — 역방향 선회가 회전수가 아니라 접촉으로 단단해진 계의 고유진동수에 잠긴다(dry whip). 가운데·아래: 마찰이 더 큰(마찰 계수 0.15) 씰에 ${fmt(2.3 * RPM1, 2)} rpm으로 닿은 로터를 정지 위치에서 출발시킨 오빗과 반지름. 축이 씰 원주를 따라 미끄러지며 회전과 반대로 돌고(마지막 세 바퀴의 ${fmt(100 * (1 - V.fullRub.fwdLast), 2)} %가 역방향), ${fmt(V.fullRub.revs, 2)}바퀴 만에 간극의 1.8배(${um(1.8)} µm)를 넘어 계산을 멈췄다. 접촉 마찰이 축을 회전 반대로 미는 힘이 역방향 선회를 키우는 것으로(dry whirl), 실제 기계라면 씰·축이 크게 손상된다. 즉시 정지할 상황이다.`,
  panels: [
    {
      title: '정도 100 % 부분 러브의 Full spectrum (원의 반지름)',
      height: 130,
      x: { range: [-2, 2], label: '차수 (− 역방향 · + 정방향)', ticks: [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2] },
      y: { range: [0, 110], label: '[µm]' },
      series: whipSeries,
      annotations: [{ type: 'vline', x: 0, color: 'muted' }],
    },
    {
      frame: false,
      height: 300,
      x: { range: X8, ticks: 'none' },
      y: { range: Y8, ticks: 'none' },
      series: [circle(0, 0, UM, 'muted', 1.4), { x: fullOrbit.x, y: fullOrbit.y, color: 'c4', width: 1 }],
      annotations: [text(-250, 150, '오빗 (정지 위치에서 출발)', { color: 'c4', bold: true }), text(-250, 120, '회색 원 = 씰 간극', { color: 'muted' }), text(250, 150, '축의 회전: 반시계', { color: 'text' }), text(250, 120, '선회: 시계 (역방향)', { color: 'c4', bold: true })],
    },
    {
      height: 120,
      x: { range: [0, Math.ceil(FULL.revs)], label: '바퀴' },
      y: { range: [0, 200], label: '반지름 [µm]' },
      series: [{ x: radius.map((_, i) => i / 64), y: radius, color: 'c4', width: 1.4 }],
      annotations: [{ type: 'hline', y: UM, color: 'muted', dash: true, label: '씰 간극', labelAt: 'start' }],
    },
  ],
};

// ── 그림 9: Newkirk — 1X 벡터가 천천히 돈다 ──
const X9: [number, number] = [-6, 6];
const Y9 = squareYRange(X9, 340, -2.8);
const polarXY = (amp: number, lagDeg: number, cx: number): [number, number] => {
  const a = (lagDeg * Math.PI) / 180;
  return [cx + amp * Math.sin(a), amp * Math.cos(a)];
};
const nkCenters = [-3.1, 3.1];
const nkScale = [0.42, 1.4];
const nkSeries = (o: typeof NK.below, cx: number, k: number, color: FigColor): FigSeries => ({
  x: o.map((p) => polarXY(k * p.amp, p.lagDeg, cx)[0]),
  y: o.map((p) => polarXY(k * p.amp, p.lagDeg, cx)[1]),
  color,
  width: 2,
});
export const newkirkFig: FigureSpec = {
  id: 'fig-p7-3-9',
  caption: `그림 9. 열적 러브(Newkirk effect): 축이 씰에 닿는 쪽(high spot)이 마찰열로 데워져 그쪽으로 휘고, 휜 축이 다시 1X를 바꾼다. 4시간 동안의 1X 벡터 (Polar, 0°가 위, 지연은 시계 방향, 점 = 1시간마다, 설명용 모델). 왼쪽: 임계속도 아래(응답 지연 40°)에서는 휨의 응답이 high spot보다 조금 늦어 벡터가 회전 반대 방향으로 돌며 커진다(${fmt(V.newkirk.below[0].amp, 2)} ∠${Math.round(V.newkirk.below[0].lagDeg)}° → ${fmt(V.newkirk.below[4].amp, 2)} ∠${Math.round(V.newkirk.below[4].lagDeg)}°). 오른쪽: 임계속도 위(150°)에서는 휨이 진동을 줄이는 쪽이라 거의 그대로다(${fmt(V.newkirk.above[0].amp, 2)} → ${fmt(V.newkirk.above[4].amp, 2)}). 크기는 불평형만의 응답에 대한 비. APHT(P6-4)에서 1X 벡터가 원이나 나선을 그리면 열적 원인을 의심한다(Morton effect는 P8-2).`,
  panels: [
    {
      frame: false,
      height: 340,
      x: { range: X9, ticks: 'none' },
      y: { range: Y9, ticks: 'none' },
      series: [
        ...nkCenters.flatMap((cx) => [1, 2].map((r) => circle(cx, 0, r, 'muted', 0.7, true))),
        nkSeries(NK.below, nkCenters[0], nkScale[0], 'c2'),
        nkSeries(NK.above, nkCenters[1], nkScale[1], 'c1'),
      ],
      annotations: [
        ...nkCenters.flatMap((cx): FigAnnotation[] => [line(cx, 0, cx, 2.3, 'muted', 0.8), text(cx, 2.5, '0°', { color: 'muted' })]),
        ...[0, 60, 120, 180, 240].map((m): FigAnnotation => ({ type: 'point', x: polarXY(nkScale[0] * NK.below[m].amp, NK.below[m].lagDeg, nkCenters[0])[0], y: polarXY(nkScale[0] * NK.below[m].amp, NK.below[m].lagDeg, nkCenters[0])[1], color: 'c2', label: m === 0 ? '0 h' : m === 240 ? '4 h' : undefined })),
        ...[0, 240].map((m): FigAnnotation => ({ type: 'point', x: polarXY(nkScale[1] * NK.above[m].amp, NK.above[m].lagDeg, nkCenters[1])[0], y: polarXY(nkScale[1] * NK.above[m].amp, NK.above[m].lagDeg, nkCenters[1])[1], color: 'c1', label: m === 0 ? '0 h · 4 h' : undefined })),
        text(nkCenters[0], -2.55, '임계속도 아래 (지연 40°)', { color: 'c2', bold: true }),
        text(nkCenters[1], -2.55, '임계속도 위 (지연 150°)', { color: 'c1', bold: true }),
      ],
    },
  ],
};
