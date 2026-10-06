/**
 * P5-2 "1자유도 불평형 응답을 Bode/Polar로" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 모든 숫자는 LAB-AF-01과 같은 `src/lib/rotor/runup.ts`의 예시 로터(P41_EXAMPLE)로 계산한다.
 * Polar 그림은 Contents §3 관례: 0°는 위(센서 방향), 지연각은 회전(반시계) 반대인 시계 방향으로 커진다.
 */
import { grid, squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import {
  compensateSlowRoll,
  halfPowerAF,
  P41_EXAMPLE,
  phaseShiftRpm,
  separationMargin,
  simulateRunUp,
  theoreticalPeakRpm,
  unbalanceVector,
  type RunUpPoint,
  type UnbalanceRotor,
} from '../lib/rotor/runup';

type Pt = [number, number];
const fmt = formatNumber;
const R = P41_EXAMPLE.rotor;
const OP = P41_EXAMPLE.operatingRpm;
const pp = (m: number) => m * 2e6; // Peak [m] → µm pp
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;
const PX = 820 / 30;

const fine = (rotor: UnbalanceRotor, end = 6000) => simulateRunUp(rotor, { rpmEnd: end, rpmStep: 5 });
const ampSeries = (pts: RunUpPoint[], color: FigColor, label?: string, extra: Partial<FigSeries> = {}): FigSeries => ({ x: pts.map((p) => p.rpm), y: pts.map((p) => pp(p.amp)), color, label, width: 2.2, ...extra });
const lagSeries = (pts: RunUpPoint[], color: FigColor, label?: string, extra: Partial<FigSeries> = {}): FigSeries => ({ x: pts.map((p) => p.rpm), y: pts.map((p) => deg(p.lag)), color, label, width: 2.2, ...extra });

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p5-2.test.ts`) */
export const P41_VALUES = (() => {
  const truth = fine(R);
  const data = simulateRunUp(R, { rpmEnd: P41_EXAMPLE.rpmEnd, rpmStep: P41_EXAMPLE.rpmStep });
  const hp = halfPowerAF(data)!;
  const v = (rpm: number) => unbalanceVector(R, rpm);
  const z2: UnbalanceRotor = { ...R, zeta: 0.2 };
  const z01: UnbalanceRotor = { ...R, zeta: 0.01 };
  const coarse01 = simulateRunUp(z01, { rpmEnd: 6000, rpmStep: 200 });
  const fine01 = simulateRunUp(z01, { rpmEnd: 6000, rpmStep: 25 });
  const noisy = simulateRunUp(R, { rpmEnd: 6000, rpmStep: 25, noise: 4e-6, seed: P41_EXAMPLE.seed });
  const runout = { amp: 4e-6, lag: rad(60) };
  const withRunout = simulateRunUp(R, { rpmEnd: 6000, rpmStep: 25, runout });
  const compensated = compensateSlowRoll(withRunout, P41_EXAMPLE.slowRollRpm).points;
  return {
    truth,
    data,
    hp,
    low: v(1500),
    crit: v(3000),
    op: v(OP),
    high: v(6000),
    peakRpmTheory: theoreticalPeakRpm(R)!,
    phase90: phaseShiftRpm(truth),
    z2,
    z2Peak: theoreticalPeakRpm(z2)!,
    z2Crit: unbalanceVector(z2, 3000),
    z2Af: halfPowerAF(simulateRunUp(z2, { rpmEnd: 6000, rpmStep: 1 }))!.af,
    sm: separationMargin(OP, hp.peakRpm),
    z01,
    coarse01,
    fine01,
    coarseAf: halfPowerAF(coarse01)!.af,
    fineAf: halfPowerAF(fine01)!.af,
    noisy,
    noisyHp: halfPowerAF(noisy)!,
    runout,
    withRunout,
    compensated,
    runoutHp: halfPowerAF(withRunout)!,
    compHp: halfPowerAF(compensated)!,
  };
})();
const V = P41_VALUES;
const fv = (p: RunUpPoint, sig = 3) => `${fmt(pp(p.amp), sig)} µm pp∠${fmt(deg(p.lag), 3)}°`;

// ── 그림 1 — 런업 기록 = 회전수마다 1X 벡터 하나 ──
const pts100 = V.data.filter((p) => p.rpm % 100 === 0);
export const runUpRecord: FigureSpec = {
  id: 'fig-p5-2-1',
  caption: `그림 1. 예시 로터(고유 회전수 ${R.naturalRpm} rpm, 감쇠비 ${R.zeta}, 편심 거리 ${fmt(R.eccentricity * 1e6, 2)} µm)를 0에서 6000 rpm까지 올리며 100 rpm마다 잰 1X 벡터를 진폭(위)과 위상 지연(아래)으로 나눠 찍었다(파란 점). 회색 선은 같은 모델의 해석해다. 런업 기록은 연속 곡선이 아니라 회전수마다 하나씩 얻은 점의 모음이다. 운전 회전수 ${OP} rpm(점선)에서는 ${fv(V.op)}이다.`,
  panels: [
    {
      title: '진폭',
      series: [ampSeries(V.truth, 'muted', undefined, { width: 1.4 }), { x: pts100.map((p) => p.rpm), y: pts100.map((p) => pp(p.amp)), kind: 'dots', color: 'c1', radius: 3 }],
      annotations: [{ type: 'vline', x: OP, color: 'muted', dash: true, label: `운전 ${OP} rpm` }],
      x: { range: [0, 6000], ticks: 'none' },
      y: { range: [0, 110], ticks: [0, 25, 50, 75, 100], label: '[µm pp]' },
      height: 130,
    },
    {
      title: '위상 지연',
      series: [lagSeries(V.truth, 'muted', undefined, { width: 1.4 }), { x: pts100.map((p) => p.rpm), y: pts100.map((p) => deg(p.lag)), kind: 'dots', color: 'c1', radius: 3 }],
      annotations: [{ type: 'vline', x: OP, color: 'muted', dash: true }, { type: 'hline', y: 90, color: 'muted', dash: true, label: '90°', labelAt: 'start' }],
      x: { range: [0, 6000], ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000], label: '회전수 [rpm]' },
      y: { range: [0, 180], ticks: [0, 90, 180], label: '[°]' },
      height: 120,
    },
  ],
};

// ── 그림 2 — 감쇠가 크면: 낮고 넓은 봉우리, 피크와 90°가 어긋남 ──
const t2 = fine(V.z2);
export const dampingCompare: FigureSpec = {
  id: 'fig-p5-2-2',
  caption: `그림 2. 같은 로터에서 감쇠비만 ${R.zeta}(파랑)와 ${V.z2.zeta}(주황)로 바꾼 Bode 선도. 감쇠가 크면 봉우리가 낮고(${fmt(pp(V.crit.amp), 3)} → ${fmt(pp(V.z2Crit.amp), 3)} µm pp, 3000 rpm 기준) 넓으며, 위상도 천천히 돈다. 두 경우 모두 위상 90°는 정확히 ${fmt(V.phase90, 4)} rpm을 지나지만, 진폭이 가장 큰 회전수는 감쇠비 ${V.z2.zeta}에서 ${fmt(V.z2Peak, 4)} rpm(주황 점)으로 4 % 높다. 감쇠비 ${R.zeta}에서는 ${fmt(V.peakRpmTheory, 4)} rpm으로 거의 같다.`,
  panels: [
    {
      title: '진폭',
      series: [ampSeries(V.truth, 'c1', `ζ = ${R.zeta}`), ampSeries(t2, 'c2', `ζ = ${V.z2.zeta}`)],
      annotations: [
        { type: 'vline', x: 3000, color: 'muted', dash: true },
        { type: 'point', x: V.z2Peak, y: pp(unbalanceVector(V.z2, V.z2Peak).amp), color: 'c2', label: `피크 ${fmt(V.z2Peak, 4)} rpm`, dx: 10, dy: -10 },
      ],
      x: { range: [1500, 5000], ticks: 'none' },
      y: { range: [0, 110], ticks: [0, 25, 50, 75, 100], label: '[µm pp]' },
      height: 140,
      legend: true,
    },
    {
      title: '위상 지연',
      series: [lagSeries(V.truth, 'c1'), lagSeries(t2, 'c2')],
      annotations: [{ type: 'vline', x: 3000, color: 'muted', dash: true, label: '3000 rpm' }, { type: 'hline', y: 90, color: 'muted', dash: true, label: '90°', labelAt: 'start' }],
      x: { range: [1500, 5000], ticks: [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000], label: '회전수 [rpm]' },
      y: { range: [0, 180], ticks: [0, 90, 180], label: '[°]' },
      height: 120,
    },
  ],
};

// ── Polar·도식 공통 도우미 (데이터 좌표, 지연각은 위에서 시계 방향) ──
const pxy = (c: Pt, scale: number, amp: number, lagDeg: number): Pt => [c[0] + scale * amp * Math.sin(rad(lagDeg)), c[1] + scale * amp * Math.cos(rad(lagDeg))];
const circleSeries = (c: Pt, rr: number, color: FigColor = 'muted', width = 1, dash = false): FigSeries => {
  const th = grid(0, 2 * Math.PI, 121);
  return { x: th.map((t) => c[0] + rr * Math.cos(t)), y: th.map((t) => c[1] + rr * Math.sin(t)), color, width, dash };
};
const arcSeries = (c: Pt, rr: number, fromDeg: number, toDeg: number, color: FigColor, width = 1.6): FigSeries => {
  const a = grid(fromDeg, toDeg, 61);
  return { x: a.map((d) => c[0] + rr * Math.sin(rad(d))), y: a.map((d) => c[1] + rr * Math.cos(rad(d))), color, width };
};
function polarGrid(c: Pt, scale: number, rings: number[], unit: string): { series: FigSeries[]; annotations: FigAnnotation[] } {
  const outer = rings[rings.length - 1] * scale;
  return {
    series: rings.map((v, i) => circleSeries(c, v * scale, 'muted', i === rings.length - 1 ? 1.3 : 0.8)),
    annotations: [
      { type: 'line', x1: c[0], y1: c[1] - outer, x2: c[0], y2: c[1] + outer, color: 'muted', dash: true, width: 0.8 },
      { type: 'line', x1: c[0] - outer, y1: c[1], x2: c[0] + outer, y2: c[1], color: 'muted', dash: true, width: 0.8 },
      { type: 'text', x: c[0], y: c[1] + outer + 0.25, text: '0° (센서 방향)', anchor: 'middle', color: 'muted' },
      { type: 'text', x: c[0] + outer + 0.15, y: c[1] - 0.5, text: '90°', anchor: 'start', color: 'muted' },
      { type: 'text', x: c[0], y: c[1] - outer - 0.55, text: '180°', anchor: 'middle', color: 'muted' },
      { type: 'text', x: c[0] - outer - 0.15, y: c[1] - 0.5, text: '270°', anchor: 'end', color: 'muted' },
      ...rings.map((v, i): FigAnnotation => ({ type: 'text', x: c[0] - 0.12, y: c[1] + v * scale - 0.45, text: i === rings.length - 1 ? `${v} ${unit}` : `${v}`, anchor: 'end', color: 'muted' })),
    ],
  };
}

// ── 그림 3 — heavy spot vs high spot (세 회전수의 축 단면) ──
const Y3 = squareYRange([0, 30], 200);
const SR = 2.6;
const shaftPanel = (c: Pt, p: RunUpPoint, title: string): { series: FigSeries[]; annotations: FigAnnotation[] } => {
  const lag = deg(p.lag);
  const heavy = pxy(c, 1, SR - 0.5, 0);
  const high = pxy(c, 1, SR + 0.05, lag);
  return {
    series: lag > 8 ? [arcSeries(c, SR + 0.55, 0, lag, 'muted', 1.4)] : [],
    annotations: [
      { type: 'circle', x: c[0], y: c[1], r: SR * PX, fill: true, color: 'muted' },
      { type: 'line', x1: c[0], y1: c[1] + SR + 0.35, x2: c[0], y2: c[1] + SR + 1.3, color: 'c1', width: 6 },
      { type: 'circle', x: heavy[0], y: heavy[1], r: 7, fill: true, color: 'c2' },
      { type: 'circle', x: high[0], y: high[1], r: 6, fill: true, color: 'c1' },
      { type: 'text', x: c[0], y: c[1] - SR - 0.9, text: title, anchor: 'middle', bold: true },
      { type: 'text', x: c[0], y: c[1] - SR - 1.9, text: `지연 ${fmt(lag, 3)}°`, anchor: 'middle', color: 'muted' },
    ],
  };
};
const C3a: Pt = [5, 5.2];
const C3b: Pt = [15, 5.2];
const C3c: Pt = [25, 5.2];
const s3 = [shaftPanel(C3a, V.low, `저속 ${V.low.rpm} rpm`), shaftPanel(C3b, V.crit, `임계 ${V.crit.rpm} rpm`), shaftPanel(C3c, V.high, `고속 ${V.high.rpm} rpm`)];
export const heavyHighSpot: FigureSpec = {
  id: 'fig-p5-2-3',
  caption: `그림 3. 키페이저 펄스 순간의 축 단면(축 방향에서 본 모습, 회전은 반시계). 주황 점은 불평형이 있는 무거운 점(heavy spot)으로 세 그림 모두 센서(위) 쪽 0°에 두었다. 파란 점은 축이 센서 쪽으로 가장 많이 나온 곳(high spot) — Polar 화살표가 가리키는 방향이다. high spot은 무거운 점보다 회전 반대 방향으로 위상 지연만큼 뒤에 있다: 저속 ${fmt(deg(V.low.lag), 2)}°(거의 같은 곳), 임계속도 90°, 고속 ${fmt(deg(V.high.lag), 3)}°(거의 반대편).`,
  panels: [
    {
      frame: false,
      height: 200,
      x: { range: [0, 30] },
      y: { range: Y3 },
      series: s3.flatMap((s) => s.series),
      annotations: [
        ...s3.flatMap((s) => s.annotations),
        { type: 'text', x: C3a[0] + 1.0, y: C3a[1] + SR + 0.9, text: '센서', anchor: 'start', color: 'c1' },
        { type: 'text', x: 15, y: 0.35, text: '주황 = 무거운 점 (heavy spot) · 파랑 = 가장 많이 나온 곳 (high spot) · 회전 ↺', anchor: 'middle', color: 'muted' },
      ],
    },
  ],
};

// ── 그림 4 — Polar: 공진은 원에 가까운 고리 ──
const P4c: Pt = [15, 5.0];
const P4S = 4.0 / 100;
const g4 = polarGrid(P4c, P4S, [25, 50, 75, 100], 'µm pp');
const polarTrace = (pts: RunUpPoint[], c: Pt, scale: number, color: FigColor, width = 2.2, dash = false): FigSeries => {
  const xy = pts.map((p) => pxy(c, scale, pp(p.amp), deg(p.lag)));
  return { x: xy.map((p) => p[0]), y: xy.map((p) => p[1]), color, width, dash };
};
const z1 = fine({ ...R, zeta: 0.1 });
const marks4: [number, number, number][] = [
  [2700, -78, 4],
  [3000, 10, 4],
  [3300, 10, 16],
  [OP, -10, 22],
  [6000, -82, -6],
];
export const polarLoop: FigureSpec = {
  id: 'fig-p5-2-4',
  caption: `그림 4. 그림 1과 같은 런업을 Polar 플롯으로 그렸다(파랑, 감쇠비 ${R.zeta}). 저속에서 원점 근처 0° 방향으로 출발해, 임계속도를 지나는 동안 원에 가까운 고리를 그리며 시계 방향(지연이 커지는 쪽)으로 돌고, 고속에서는 180° 쪽 ${fmt(pp(R.eccentricity), 2)} µm pp에 다가간다. 고리에서 원점으로부터 가장 먼 점이 3000 rpm(90°)이다. 회색 점선은 감쇠비 0.1로, 고리의 지름이 절반쯤으로 작다.`,
  panels: [
    {
      frame: false,
      height: 235,
      x: { range: [0, 30] },
      y: { range: squareYRange([0, 30], 235) },
      series: [...g4.series, polarTrace(z1, P4c, P4S, 'muted', 1.6, true), polarTrace(V.truth, P4c, P4S, 'c1')],
      annotations: [
        ...g4.annotations,
        ...marks4.map(([n, dx, dy]): FigAnnotation => {
          const v = unbalanceVector(R, n);
          const p = pxy(P4c, P4S, pp(v.amp), deg(v.lag));
          return { type: 'point', x: p[0], y: p[1], color: 'c1', label: `${n} rpm`, dx, dy };
        }),
        { type: 'text', x: 23.5, y: 9.2, text: '회전 ↺ · 지연 ↻', anchor: 'start', color: 'muted' },
      ],
    },
  ],
};

// ── 그림 5 — Half-power로 AF 읽기 ──
const zoom = V.data.filter((p) => p.rpm >= 2400 && p.rpm <= 3800);
const hp = V.hp;
const level = pp(hp.peakAmp) / Math.SQRT2;
export const halfPower: FigureSpec = {
  id: 'fig-p5-2-5',
  caption: `그림 5. 그림 1의 런업을 ${P41_EXAMPLE.rpmStep} rpm 간격으로 잰 진폭(파란 점)에서 Half-power법으로 증폭계수를 읽는다. 피크 ${fmt(pp(hp.peakAmp), 3)} µm pp(N_c = ${hp.peakRpm} rpm)의 0.707배인 ${fmt(level, 3)} µm pp 선(주황 점선)과 만나는 두 회전수가 N₁ = ${fmt(hp.n1, 4)}, N₂ = ${fmt(hp.n2, 4)} rpm(이웃한 두 점을 직선으로 이어 읽음)이다. AF = ${hp.peakRpm} ÷ (${fmt(hp.n2, 4)} − ${fmt(hp.n1, 4)}) = ${fmt(hp.af, 3)}로, 1/(2ζ) = 10에 가깝다.`,
  panels: [
    {
      series: [ampSeries(V.truth.filter((p) => p.rpm >= 2400 && p.rpm <= 3800), 'muted', undefined, { width: 1.2 }), { x: zoom.map((p) => p.rpm), y: zoom.map((p) => pp(p.amp)), kind: 'dots', color: 'c1', radius: 3 }],
      annotations: [
        { type: 'hline', y: level, color: 'warn', dash: true, label: `0.707 × 피크 = ${fmt(level, 3)} µm pp`, labelAt: 'end' },
        { type: 'vline', x: hp.n1, color: 'muted', dash: true },
        { type: 'vline', x: hp.n2, color: 'muted', dash: true },
        { type: 'point', x: hp.peakRpm, y: pp(hp.peakAmp), color: 'warn', label: `피크 N_c = ${hp.peakRpm} rpm`, dx: 10, dy: -4 },
        { type: 'arrow', x1: hp.n1, y1: 20, x2: hp.n2, y2: 20, double: true, color: 'text', label: `N₂ − N₁ = ${fmt(hp.n2 - hp.n1, 3)} rpm` },
        { type: 'text', x: hp.n1 - 20, y: 8, text: `N₁ ${fmt(hp.n1, 4)}`, anchor: 'end', color: 'muted' },
        { type: 'text', x: hp.n2 + 20, y: 8, text: `N₂ ${fmt(hp.n2, 4)}`, anchor: 'start', color: 'muted' },
      ],
      x: { range: [2400, 3800], ticks: [2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800], label: '회전수 [rpm]' },
      y: { range: [0, 115], ticks: [0, 25, 50, 75, 100], label: '[µm pp]' },
      height: 190,
    },
  ],
};

// ── 그림 6 — 분리여유 ──
export const separation: FigureSpec = {
  id: 'fig-p5-2-6',
  caption: `그림 6. 분리여유(Separation Margin)는 운전 회전수 N_op가 임계속도 N_c에서 얼마나 떨어져 있는지를 N_op에 대한 비율로 적은 값이다. 예시 로터는 N_c = ${hp.peakRpm} rpm, N_op = ${OP} rpm이라 SM = ${fmt(V.sm, 3)} %이다. 주황 띠는 Half-power 폭(N₁ ~ N₂)으로, 진폭이 피크의 0.707배 이상인 구간이다. 운전 회전수가 이 띠 가까이에 있으면 작은 변화에도 진폭이 크게 바뀐다.`,
  panels: [
    {
      series: [ampSeries(V.truth, 'c1')],
      annotations: [
        { type: 'band', x1: hp.n1, x2: hp.n2, color: 'warn' },
        { type: 'vline', x: hp.peakRpm, color: 'muted', dash: true, label: `N_c ${hp.peakRpm}` },
        { type: 'vline', x: OP, color: 'muted', dash: true, label: `N_op ${OP}` },
        { type: 'arrow', x1: hp.peakRpm, y1: 70, x2: OP, y2: 70, double: true, color: 'text', label: `SM = ${fmt(V.sm, 3)} %` },
        { type: 'point', x: OP, y: pp(V.op.amp), color: 'c1', label: `${fmt(pp(V.op.amp), 3)} µm pp`, dx: 10, dy: -8 },
      ],
      x: { range: [0, 6000], ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000], label: '회전수 [rpm]' },
      y: { range: [0, 110], ticks: [0, 25, 50, 75, 100], label: '[µm pp]' },
      height: 170,
    },
  ],
};

// ── 그림 7 — 데이터의 오차: rpm 간격, 잡음, 런아웃 ──
const fine01 = fine(V.z01).filter((p) => p.rpm >= 2500 && p.rpm <= 3500);
const c01 = V.coarse01.filter((p) => p.rpm >= 2500 && p.rpm <= 3500);
const win = (pts: RunUpPoint[]) => pts.filter((p) => p.rpm <= 6000);
export const dataErrors: FigureSpec = {
  id: 'fig-p5-2-7',
  caption: `그림 7. 같은 계산이 실제 데이터에서 틀어지는 세 가지 경우(회색 선 = 참 응답). 위: 감쇠비 0.01이면 Half-power 폭이 약 60 rpm인데 200 rpm마다 재면(주황 점) 봉우리 근처에 점이 한두 개뿐이라 AF가 ${fmt(V.coarseAf, 3)}로 나온다(25 rpm 간격이면 ${fmt(V.fineAf, 3)}, 참값 약 50). 가운데: 벡터 성분마다 표준편차 ${fmt(pp(4e-6) / 2, 2)} µm의 잡음이 섞이면 점이 흔들려 AF가 ${fmt(V.noisyHp.af, 3)}가 된다. 아래: 런아웃 ${fmt(pp(V.runout.amp), 2)} µm pp∠60°가 더해지면 저속에서도 ${fmt(pp(V.withRunout[0].amp), 2)} µm pp가 보이고 피크도 ${fmt(pp(V.runoutHp.peakAmp), 3)} µm pp로 바뀐다. ${P41_EXAMPLE.slowRollRpm} rpm 벡터를 빼면(파랑) 참 응답으로 돌아온다.`,
  panels: [
    {
      title: `① rpm 간격: ζ = 0.01, 200 rpm마다`,
      series: [ampSeries(fine01, 'muted', undefined, { width: 1.3 }), { x: c01.map((p) => p.rpm), y: c01.map((p) => pp(p.amp)), kind: 'dots', color: 'c2', radius: 4 }],
      annotations: [],
      x: { range: [2500, 3500], ticks: [2500, 2750, 3000, 3250, 3500] },
      y: { range: [0, 550], ticks: [0, 250, 500], label: '[µm pp]' },
      height: 110,
    },
    {
      title: '② 측정 잡음: 25 rpm마다',
      series: [ampSeries(V.truth, 'muted', undefined, { width: 1.3 }), { x: V.noisy.map((p) => p.rpm), y: V.noisy.map((p) => pp(p.amp)), kind: 'dots', color: 'c2', radius: 2.2 }],
      annotations: [],
      x: { range: [0, 6000], ticks: 'none' },
      y: { range: [0, 120], ticks: [0, 50, 100], label: '[µm pp]' },
      height: 110,
    },
    {
      title: `③ 런아웃 ${fmt(pp(V.runout.amp), 2)} µm pp∠60° (주황) → Slow roll 보상 (파랑)`,
      series: [ampSeries(win(V.withRunout), 'c2', '런아웃 포함', { width: 2 }), ampSeries(win(V.compensated), 'c1', '보상 후', { width: 1.6, dash: true })],
      annotations: [],
      x: { range: [0, 6000], ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000], label: '회전수 [rpm]' },
      y: { range: [0, 120], ticks: [0, 50, 100], label: '[µm pp]' },
      height: 120,
      legend: true,
    },
  ],
};
