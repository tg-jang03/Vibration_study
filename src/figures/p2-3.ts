/**
 * P2-3 "키페이저 · 위상 · 1X 벡터" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 키페이저 펄스·위상·런업·Slow roll 보상은 랩(LAB-PHS-01·LAB-SRO-01)과 같은 `src/lib/phase.ts`로 계산한다.
 * Polar 그림은 Contents §3 관례: 0°는 위(센서 방향), 지연각은 회전(반시계) 반대인 시계 방향으로 커진다.
 */
import { grid, squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import {
  highestPeakAngle,
  keyphasorThreshold,
  keyphasorVoltage,
  KEY_NOTCH,
  shaftDisplacement,
  simulateRunUp,
  SR_ROTOR,
  subtractVectors,
  toDeg,
  toRad,
  type AmpLag,
} from '../lib/phase';
import { gapVoltage } from '../lib/proximity';

type Pt = [number, number];
const PX = 820 / 30; // 도식 패널 x 범위 [0, 30]의 1단위 px
const um = (m: number) => m * 1e6;
const UM = 1e-6;
const fmt = formatNumber;

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p2-3.test.ts`) */
export const P23_VALUES = (() => {
  const rpm = 3600;
  const fr = rpm / 60;
  const T = 1 / fr;
  const oneX: AmpLag = { amp: 50 * UM, lag: toRad(120) };
  const dt = toRad(120) / (2 * Math.PI * fr);
  const twoX: AmpLag = { amp: 20 * UM, lag: toRad(300) };
  const rawPeak = toDeg(highestPeakAngle((th) => shaftDisplacement(th, { oneX, twoX })));
  const change = subtractVectors({ amp: 50 * UM, lag: toRad(240) }, { amp: 50 * UM, lag: toRad(120) });
  const example = subtractVectors({ amp: 50 * UM, lag: toRad(120) }, { amp: 15 * UM, lag: toRad(60) });
  const runout: AmpLag = { amp: 15 * UM, lag: toRad(60) };
  const respAtOp = 45 * UM;
  const op = SR_ROTOR.operatingRpm;
  const ruVec = simulateRunUp({ respAtOp, runout, slowRollRpm: 300, mode: 'vector' });
  const at = (n: number) => ruVec.rpm.indexOf(n);
  return {
    rpm,
    T,
    dt,
    oneX,
    twoX,
    rawPeak,
    change,
    example,
    exampleScalar: 50 - 15,
    runout,
    respAtOp,
    op,
    ruVec,
    crit: ruVec.truth[at(SR_ROTOR.criticalRpm)],
    critMeasured: ruVec.measured[at(SR_ROTOR.criticalRpm)],
    opTruth: ruVec.truth[at(op)],
    opMeasured: ruVec.measured[at(op)],
    opComp: ruVec.compensated[at(op)],
    threshold: keyphasorThreshold(),
    vNoNotch: gapVoltage(KEY_NOTCH.gap),
    vNotch: gapVoltage(KEY_NOTCH.gap + KEY_NOTCH.depth),
  };
})();
const V = P23_VALUES;
const fv = (v: AmpLag, sig = 3) => `${fmt(um(v.amp), sig)} µm pp∠${fmt(toDeg(v.lag), 3)}°`;

// ── Polar 그림 도우미 (데이터 좌표, 지연각은 위에서 시계 방향) ──
const pxy = (c: Pt, scale: number, amp: number, lagDeg: number): Pt => [
  c[0] + scale * amp * Math.sin(toRad(lagDeg)),
  c[1] + scale * amp * Math.cos(toRad(lagDeg)),
];
const circleSeries = (c: Pt, rr: number, color: FigColor = 'muted', width = 1, dash = false): FigSeries => {
  const th = grid(0, 2 * Math.PI, 121);
  return { x: th.map((t) => c[0] + rr * Math.cos(t)), y: th.map((t) => c[1] + rr * Math.sin(t)), color, width, dash };
};
/** 지연각 from → to (°) 사이의 원호 */
const arcSeries = (c: Pt, rr: number, fromDeg: number, toDeg_: number, color: FigColor, width = 1.6): FigSeries => {
  const a = grid(fromDeg, toDeg_, 61);
  return { x: a.map((d) => c[0] + rr * Math.sin(toRad(d))), y: a.map((d) => c[1] + rr * Math.cos(toRad(d))), color, width };
};
function polarGrid(c: Pt, scale: number, rings: number[], unit: string): { series: FigSeries[]; annotations: FigAnnotation[] } {
  const outer = rings[rings.length - 1] * scale;
  const series = rings.map((v, i) => circleSeries(c, v * scale, 'muted', i === rings.length - 1 ? 1.3 : 0.8));
  const annotations: FigAnnotation[] = [
    { type: 'line', x1: c[0], y1: c[1] - outer, x2: c[0], y2: c[1] + outer, color: 'muted', dash: true, width: 0.8 },
    { type: 'line', x1: c[0] - outer, y1: c[1], x2: c[0] + outer, y2: c[1], color: 'muted', dash: true, width: 0.8 },
    { type: 'text', x: c[0], y: c[1] + outer + 0.25, text: '0° (센서 방향)', anchor: 'middle', color: 'muted' },
    { type: 'text', x: c[0] + outer + 0.15, y: c[1] - 0.5, text: '90°', anchor: 'start', color: 'muted' },
    { type: 'text', x: c[0], y: c[1] - outer - 0.55, text: '180°', anchor: 'middle', color: 'muted' },
    { type: 'text', x: c[0] - outer - 0.15, y: c[1] - 0.5, text: '270°', anchor: 'end', color: 'muted' },
    ...rings.map((v, i): FigAnnotation => ({ type: 'text', x: c[0] - 0.12, y: c[1] + v * scale - 0.45, text: i === rings.length - 1 ? `${v} ${unit}` : `${v}`, anchor: 'end', color: 'muted' })),
  ];
  return { series, annotations };
}
const vectorArrow = (from: Pt, to: Pt, color: FigColor): FigAnnotation => ({ type: 'arrow', x1: from[0], y1: from[1], x2: to[0], y2: to[1], color, double: false });

// 그림 1 — 키페이저 (도식 + 펄스)
const Y1 = squareYRange([0, 30], 170);
const SH: Pt = [5.5, 3.3];
const SHR = 2.3;
const probe45 = (deg: number, r1: number, r2: number): FigAnnotation => {
  const a = toRad(deg);
  return { type: 'line', x1: SH[0] + r1 * Math.sin(a), y1: SH[1] + r1 * Math.cos(a), x2: SH[0] + r2 * Math.sin(a), y2: SH[1] + r2 * Math.cos(a), color: 'c1', width: 7 };
};
const kpTime = grid(-4e-3, 46e-3, 2501);
const kpVolt = kpTime.map((t) => keyphasorVoltage(2 * Math.PI * (V.rpm / 60) * t));
const ms = (s: number) => s * 1e3;
export const keyphasor: FigureSpec = {
  id: 'fig-p2-3-1',
  caption: `그림 1. 키페이저(회전 기준 센서). 위: 축의 홈(키 홈 등) 위에 비접촉 변위 센서를 하나 더 단다 (축 방향에서 본 모습, 예시). 아래: ${V.rpm} rpm에서 그 센서의 출력. 홈이 없는 곳은 gap ${KEY_NOTCH.gap * 1e3} mm로 ${fmt(V.vNoNotch, 3)} V이고, 홈(깊이 ${KEY_NOTCH.depth * 1e3} mm)이 지나가는 순간 gap이 커져 ${fmt(V.vNotch, 3)} V까지 떨어진다 (P2-2의 교정 곡선). 내려가며 문턱(주황 점선, ${fmt(V.threshold, 3)} V)을 지나는 순간이 한 바퀴의 기준(0°)이고, 펄스 간격 T = ${fmt(ms(1 / (V.rpm / 60)), 3)} ms에서 회전수 60 ÷ T = ${V.rpm} rpm이 나온다.`,
  panels: [
    {
      frame: false,
      height: 170,
      x: { range: [0, 30] },
      y: { range: Y1 },
      series: [],
      annotations: [
        { type: 'circle', x: SH[0], y: SH[1], r: SHR * PX, fill: true, color: 'muted', label: '축' },
        { type: 'rect', x1: SH[0] - 0.35, x2: SH[0] + 0.35, y1: SH[1] + SHR - 0.45, y2: SH[1] + SHR, color: 'warn' },
        { type: 'text', x: SH[0] - 0.6, y: SH[1] + SHR + 0.2, text: '홈', anchor: 'end', color: 'warn', bold: true },
        probe45(0, SHR + 0.35, SHR + 1.6),
        { type: 'circle', x: SH[0], y: SH[1] + SHR + 0.35, r: 4, fill: true, color: 'c2' },
        { type: 'text', x: SH[0] + 0.5, y: SH[1] + SHR + 1.2, text: '키페이저 프로브', anchor: 'start', color: 'c1' },
        probe45(60, SHR + 0.35, SHR + 1.5),
        { type: 'text', x: SH[0] + (SHR + 1.7) * Math.sin(toRad(60)), y: SH[1] + (SHR + 1.7) * Math.cos(toRad(60)) - 0.15, text: '진동 센서', anchor: 'start', color: 'c1' },
        { type: 'text', x: SH[0], y: 0.35, text: '회전 ↺ (반시계)', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 13, y: 6.4, text: '키페이저가 주는 두 가지', anchor: 'start', bold: true },
        { type: 'text', x: 13, y: 5.2, text: '· 펄스 간격 T → 회전수 = 60 ÷ T [rpm]', anchor: 'start' },
        { type: 'text', x: 13, y: 4.0, text: '· 펄스 순간 → 회전 각도의 기준 (0°)', anchor: 'start' },
        { type: 'text', x: 13, y: 2.8, text: '· 홈 대신 돌기를 쓰면 펄스가 위로 선다', anchor: 'start', color: 'muted' },
        { type: 'text', x: 13, y: 1.6, text: '· 광학 센서 + 반사 테이프로 만들기도 한다', anchor: 'start', color: 'muted' },
      ],
    },
    {
      series: [{ x: kpTime.map(ms), y: kpVolt, color: 'c1', width: 2 }],
      annotations: [
        { type: 'hline', y: V.threshold, color: 'warn', dash: true },
        { type: 'text', x: 45.5, y: V.threshold - 1.1, text: `문턱 ${fmt(V.threshold, 3)} V`, anchor: 'end', color: 'warn' },
        { type: 'arrow', x1: 0, y1: -7.6, x2: ms(V.T), y2: -7.6, double: true, color: 'text', label: `T = ${fmt(ms(V.T), 3)} ms` },
        { type: 'point', x: 0, y: V.threshold, color: 'warn' },
        { type: 'point', x: ms(V.T), y: V.threshold, color: 'warn' },
        { type: 'point', x: ms(2 * V.T), y: V.threshold, color: 'warn' },
        { type: 'text', x: 24, y: V.vNoNotch + 0.6, text: `홈 없는 곳 ${fmt(V.vNoNotch, 3)} V`, anchor: 'middle', color: 'muted' },
      ],
      x: { range: [-4, 46], ticks: [0, 10, 20, 30, 40], label: '시각 [ms]' },
      y: { range: [-19, -6], ticks: [-18, -15, -12, -9, -6], label: '[V]' },
      height: 150,
    },
  ],
};

// 그림 2 — 시간 차이로 위상 읽기
const t2 = grid(-2e-3, 36e-3, 1901);
const omega = 2 * Math.PI * (V.rpm / 60);
const wave2 = t2.map((t) => um(shaftDisplacement(omega * t, { oneX: V.oneX })));
export const phaseByTiming: FigureSpec = {
  id: 'fig-p2-3-2',
  caption: `그림 2. 키페이저 펄스(위)와 같은 시간축에 그린 1X 진동 신호(아래, ${fmt(um(V.oneX.amp), 2)} µm pp, ${V.rpm} rpm, 축이 센서 쪽으로 오면 +). 펄스(회색 점선)에서 다음 양(+)의 피크(주황 점)까지 Δt = ${fmt(ms(V.dt), 3)} ms이고, 한 바퀴는 ${fmt(ms(V.T), 3)} ms다. 각도로 바꾸면 360° × ${fmt(ms(V.dt), 3)} ÷ ${fmt(ms(V.T), 3)} = ${fmt(toDeg(V.oneX.lag), 3)}° — 이 신호의 위상은 ${fmt(toDeg(V.oneX.lag), 3)}°다. 다음 바퀴에서도 같은 자리에 피크가 온다.`,
  panels: [
    {
      title: '키페이저 펄스',
      series: [{ x: t2.map(ms), y: t2.map((t) => keyphasorVoltage(omega * t)), color: 'c1', width: 1.8 }],
      annotations: [],
      x: { range: [-2, 36], ticks: 'none' },
      y: { range: [-19, -7], ticks: [-17, -9], label: '[V]' },
      height: 70,
    },
    {
      title: '1X 진동 신호',
      series: [{ x: t2.map(ms), y: wave2, color: 'c1', width: 2.2 }],
      annotations: [
        { type: 'vline', x: 0, color: 'muted', dash: true },
        { type: 'vline', x: ms(V.T), color: 'muted', dash: true },
        { type: 'vline', x: ms(2 * V.T), color: 'muted', dash: true },
        { type: 'point', x: ms(V.dt), y: 25, color: 'warn' },
        { type: 'point', x: ms(V.T + V.dt), y: 25, color: 'warn' },
        { type: 'arrow', x1: 0, y1: 33, x2: ms(V.dt), y2: 33, double: true, color: 'warn', label: `Δt = ${fmt(ms(V.dt), 3)} ms` },
        { type: 'arrow', x1: ms(V.T), y1: 33, x2: ms(V.T + V.dt), y2: 33, double: true, color: 'warn' },
      ],
      x: { range: [-2, 36], ticks: [0, 5, 10, 15, 20, 25, 30, 35], label: '시각 [ms]' },
      y: { range: [-32, 42], ticks: [-25, 0, 25], label: '[µm]' },
      height: 150,
    },
  ],
};

// 그림 3 — 원신호의 봉우리 vs 1X 성분의 피크
const th3 = grid(0, 360, 721);
const sig3 = { oneX: V.oneX, twoX: V.twoX };
const rawPeakVal = um(shaftDisplacement(toRad(V.rawPeak), sig3));
export const oneXComponent: FigureSpec = {
  id: 'fig-p2-3-3',
  caption: `그림 3. 같은 1X(${fmt(um(V.oneX.amp), 2)} µm pp, 위상 ${fmt(toDeg(V.oneX.lag), 3)}°)에 2X(${fmt(um(V.twoX.amp), 2)} µm pp)가 섞인 신호를 한 바퀴 그렸다 (가로축은 키페이저 펄스부터의 회전 각도). 파랑 원신호에서 가장 높은 봉우리는 ${fmt(V.rawPeak, 3)}°에 있지만, 원신호에서 1X만 골라낸 주황 점선의 피크는 ${fmt(toDeg(V.oneX.lag), 3)}°다. 위상은 1X 성분으로 정한다 — 원신호의 봉우리로 읽으면 ${fmt(V.rawPeak - toDeg(V.oneX.lag), 2)}° 틀린다.`,
  panels: [
    {
      series: [
        { x: th3, y: th3.map((d) => um(shaftDisplacement(toRad(d), sig3))), color: 'c1', width: 2.2, label: '원신호 (1X + 2X)' },
        { x: th3, y: th3.map((d) => um(shaftDisplacement(toRad(d), { oneX: V.oneX }))), color: 'c2', width: 2, dash: true, label: '1X 성분만' },
      ],
      annotations: [
        { type: 'line', x1: toDeg(V.oneX.lag), y1: -40, x2: toDeg(V.oneX.lag), y2: 25, color: 'c2', dash: true, width: 1.2 },
        { type: 'line', x1: V.rawPeak, y1: -40, x2: V.rawPeak, y2: rawPeakVal, color: 'c1', dash: true, width: 1.2 },
        { type: 'point', x: toDeg(V.oneX.lag), y: 25, color: 'c2' },
        { type: 'point', x: V.rawPeak, y: rawPeakVal, color: 'c1' },
        { type: 'text', x: 228, y: 33, text: `1X 성분의 피크: ${fmt(toDeg(V.oneX.lag), 3)}° (= 위상)`, anchor: 'start', color: 'c2', bold: true },
        { type: 'text', x: 228, y: 24, text: `원신호의 가장 높은 봉우리: ${fmt(V.rawPeak, 3)}°`, anchor: 'start', color: 'c1', bold: true },
      ],
      x: { range: [0, 360], ticks: [0, 60, 120, 180, 240, 300, 360], label: '키페이저 펄스부터의 회전 각도 [°]' },
      y: { range: [-40, 45], ticks: [-30, 0, 30], label: '[µm]' },
      height: 180,
      legend: true,
    },
  ],
};

// 그림 4 — 관례가 다르면 숫자가 다르다
export const conventions: FigureSpec = {
  id: 'fig-p2-3-4',
  caption: `그림 4. 하나의 1X 신호(${fmt(um(V.oneX.amp), 2)} µm pp)를 세 가지 관례로 읽기. 키페이저에서 양의 피크까지의 지연각은 120°(주황), 위로 지나는 영점까지의 지연각은 30°(초록, 피크보다 90° 앞), cos 기준 앞섬각으로 적는 FFT 분석기는 −120°(보라)로 적는다. 신호는 같고 숫자만 다르다 — 장비가 어느 관례를 쓰는지 모르면 위상을 비교할 수 없다.`,
  panels: [
    {
      series: [{ x: th3, y: th3.map((d) => um(shaftDisplacement(toRad(d), { oneX: V.oneX }))), color: 'c1', width: 2.2 }],
      annotations: [
        { type: 'vline', x: 0, color: 'muted', dash: true },
        { type: 'arrow', x1: 0, y1: 33, x2: 120, y2: 33, double: false, color: 'warn', label: '지연각 (→ 양의 피크) 120°' },
        { type: 'point', x: 120, y: 25, color: 'warn' },
        { type: 'arrow', x1: 0, y1: -33, x2: 30, y2: -33, double: false, color: 'c3', label: '영점 기준 30°' },
        { type: 'point', x: 30, y: 0, color: 'c3' },
        { type: 'text', x: 355, y: 33, text: 'FFT 위상 (cos 기준 앞섬각): −120°', anchor: 'end', color: 'c4', bold: true },
        { type: 'text', x: 355, y: 26, text: 'x = A cos(θ + ψ)로 적으면 ψ = −120°', anchor: 'end', color: 'c4' },
      ],
      x: { range: [0, 360], ticks: [0, 30, 90, 120, 180, 270, 360], label: '키페이저 펄스부터의 회전 각도 [°]' },
      y: { range: [-42, 42], ticks: [-25, 0, 25], label: '[µm]' },
      height: 180,
    },
  ],
};

// 그림 5 — Polar 점이 뜻하는 것
const Y5 = squareYRange([0, 30], 220);
const S5: Pt = [6.5, 4.4];
const S5R = 2.5;
const hs = pxy(S5, 1, S5R, 120);
const P5: Pt = [21.5, 4.6];
const P5S = 3.6 / 60;
const g5 = polarGrid(P5, P5S, [20, 40, 60], 'µm pp');
const tip5 = pxy(P5, P5S, 50, 120);
export const polarMeaning: FigureSpec = {
  id: 'fig-p2-3-5',
  caption: `그림 5. 1X 벡터 ${fmt(um(V.oneX.amp), 2)} µm pp∠120°를 Polar 플롯(오른쪽)에 찍는 법과 그 뜻. 왼쪽: 키페이저 펄스가 나오는 순간의 축. 축이 센서 쪽으로 가장 많이 나온 곳(주황 점)은 아직 센서에 오지 않았고, 회전 방향(반시계)으로 120° 더 돌아야 센서 앞에 온다 — 그래서 피크가 120°만큼 늦다. 오른쪽: 0°를 센서 방향(위)에 두고 지연각을 회전 반대 방향(시계 방향)으로 재면, 벡터의 방향이 왼쪽 그림의 주황 점 방향과 같아진다. 화살표 길이는 진폭이다.`,
  panels: [
    {
      frame: false,
      height: 220,
      x: { range: [0, 30] },
      y: { range: Y5 },
      series: [arcSeries(S5, S5R + 0.75, 120, 9, 'warn', 1.8), ...g5.series, arcSeries(P5, 1.1, 0, 120, 'warn', 1.6)],
      annotations: [
        { type: 'circle', x: S5[0], y: S5[1], r: S5R * PX, fill: true, color: 'muted', label: '축' },
        { type: 'line', x1: S5[0], y1: S5[1] + S5R + 0.3, x2: S5[0], y2: S5[1] + S5R + 1.6, color: 'c1', width: 7 },
        { type: 'text', x: S5[0] + 0.45, y: S5[1] + S5R + 1.1, text: '센서', anchor: 'start', color: 'c1', bold: true },
        { type: 'point', x: hs[0], y: hs[1], color: 'warn' },
        { type: 'text', x: hs[0] + 0.05, y: hs[1] - 1.35, text: '가장 많이 나온 곳', anchor: 'start', color: 'warn' },
        vectorArrow(pxy(S5, 1, S5R + 0.75, 15), pxy(S5, 1, S5R + 0.75, 7), 'warn'),
        { type: 'text', x: S5[0] + 2.2, y: S5[1] + S5R + 0.55, text: '120° 더 돌면 센서 앞', anchor: 'start', color: 'warn' },
        { type: 'text', x: S5[0], y: 0.3, text: '키페이저 펄스 순간 · 회전 ↺', anchor: 'middle', color: 'muted' },
        ...g5.annotations,
        vectorArrow(P5, tip5, 'c1'),
        { type: 'text', x: tip5[0] + 0.3, y: tip5[1] - 0.55, text: '50 µm pp∠120°', anchor: 'start', color: 'c1', bold: true },
        { type: 'text', x: P5[0] + 1.25, y: P5[1] + 0.55, text: '120°', anchor: 'start', color: 'warn' },
      ],
    },
  ],
};

// 그림 6 — 런업의 1X 벡터: Bode와 Polar
const rpm6 = V.ruVec.rpm;
const amp = (a: AmpLag[]) => a.map((v) => um(v.amp));
const lagD = (a: AmpLag[]) => a.map((v) => toDeg(v.lag));
const P6: Pt = [15, 5.0];
const P6S = 4.0 / 180;
const g6 = polarGrid(P6, P6S, [60, 120, 180], 'µm pp');
const marks6 = [1600, 2000, 2400, 3600];
const polarTrace = (vs: AmpLag[], c: Pt, scale: number, color: FigColor, width = 2.2, dash = false): FigSeries => {
  const pts = vs.map((v) => pxy(c, scale, um(v.amp), toDeg(v.lag)));
  return { x: pts.map((p) => p[0]), y: pts.map((p) => p[1]), color, width, dash };
};
export const runUpBodePolar: FigureSpec = {
  id: 'fig-p2-3-6',
  caption: `그림 6. 런업(정지 → 운전 회전수) 동안 회전수마다 잰 1X 벡터 (P2-2의 예시 로터: 임계속도 ${SR_ROTOR.criticalRpm} rpm, 감쇠비 ${SR_ROTOR.zeta}, 운전 ${V.op} rpm에서 ${fmt(um(V.respAtOp), 2)} µm pp, 런아웃 없음). 위 두 그래프는 진폭과 위상을 회전수에 대해 따로 그린 Bode 선도(P0-6), 아래는 같은 벡터의 끝을 이어 그린 Polar 플롯이다. 저속에서는 원점 근처에서 출발해, 임계속도에서 가장 크고(${fmt(um(V.crit.amp), 3)} µm pp) 위상이 90°가 되며, 운전 회전수에서는 ${fv(V.opTruth)}에 이른다. Bode의 두 그래프가 Polar에서는 곡선 하나다.`,
  panels: [
    {
      title: '진폭',
      series: [{ x: rpm6, y: amp(V.ruVec.truth), color: 'c1', width: 2.2 }],
      annotations: [
        { type: 'vline', x: SR_ROTOR.criticalRpm, color: 'muted', label: `임계 ${SR_ROTOR.criticalRpm} rpm` },
        { type: 'vline', x: V.op, color: 'muted', label: `운전 ${V.op} rpm` },
      ],
      x: { range: [0, 4000], ticks: 'none' },
      y: { range: [0, 180], ticks: [0, 50, 100, 150], label: '[µm pp]' },
      height: 110,
    },
    {
      title: '위상 (지연각)',
      series: [{ x: rpm6, y: lagD(V.ruVec.truth), color: 'c1', width: 2.2 }],
      annotations: [
        { type: 'vline', x: SR_ROTOR.criticalRpm, color: 'muted' },
        { type: 'vline', x: V.op, color: 'muted' },
        { type: 'hline', y: 90, color: 'muted', dash: true },
      ],
      x: { range: [0, 4000], ticks: [0, 1000, 2000, 3000, 4000], label: '회전수 [rpm]' },
      y: { range: [0, 180], ticks: [0, 90, 180], label: '[°]' },
      height: 110,
    },
    {
      title: 'Polar (같은 벡터의 끝을 이은 곡선)',
      frame: false,
      height: 230,
      x: { range: [0, 30] },
      y: { range: squareYRange([0, 30], 230) },
      series: [...g6.series, polarTrace(V.ruVec.truth, P6, P6S, 'c1')],
      annotations: [
        ...g6.annotations,
        ...marks6.map((n): FigAnnotation => {
          const v = V.ruVec.truth[rpm6.indexOf(n)];
          const p = pxy(P6, P6S, um(v.amp), toDeg(v.lag));
          const off: Record<number, [number, number]> = { 1600: [-70, -14], 2000: [8, -12], 2400: [8, 16], 3600: [-70, 6] };
          return { type: 'point', x: p[0], y: p[1], color: 'c1', label: `${n} rpm`, dx: off[n][0], dy: off[n][1] };
        }),
      ],
    },
  ],
};

// 그림 7 — Slow roll 보상: 벡터로 빼기
const P7: Pt = [8, 4.7];
const P7S = 3.6 / 60;
const g7 = polarGrid(P7, P7S, [20, 40, 60], 'µm pp');
const tipV = pxy(P7, P7S, 50, 120);
const tipSr = pxy(P7, P7S, 15, 60);
const tipC = pxy(P7, P7S, um(V.example.amp), toDeg(V.example.lag));
const note7 = (y: number, text: string, color: FigColor = 'text', bold = false): FigAnnotation => ({ type: 'text', x: 15.5, y, text, anchor: 'start', color, bold });
export const slowRollSubtraction: FigureSpec = {
  id: 'fig-p2-3-7',
  caption: `그림 7. Slow roll 보상을 Polar 플롯 위에서. 운전 중 측정 50 µm pp∠120°(주황)에서 저속에서 잰 런아웃 15 µm pp∠60°(보라)를 벡터로 빼면 ${fv(V.example)}(파랑)이다. 회색 점선은 보라 화살표 끝에서 주황 화살표 끝까지 — 파랑 화살표와 길이·방향이 같다. 크기만 빼면 50 − 15 = 35 µm pp로 ${fmt((1 - 35 / um(V.example.amp)) * 100, 2)} % 작게 나오고, 위상은 고칠 수도 없다.`,
  panels: [
    {
      frame: false,
      height: 220,
      x: { range: [0, 30] },
      y: { range: squareYRange([0, 30], 220) },
      series: [...g7.series],
      annotations: [
        ...g7.annotations,
        { type: 'line', x1: tipSr[0], y1: tipSr[1], x2: tipV[0], y2: tipV[1], color: 'muted', dash: true, width: 1.6 },
        vectorArrow(P7, tipV, 'c2'),
        vectorArrow(P7, tipSr, 'c4'),
        vectorArrow(P7, tipC, 'c1'),
        { type: 'text', x: pxy(P7, P7S, 64, 120)[0], y: pxy(P7, P7S, 64, 120)[1] - 0.3, text: '측정', anchor: 'start', color: 'c2', bold: true },
        { type: 'text', x: tipSr[0] + 0.2, y: tipSr[1] + 0.2, text: 'Slow roll', anchor: 'start', color: 'c4', bold: true },
        { type: 'text', x: tipC[0] - 0.25, y: tipC[1] - 0.6, text: '보상', anchor: 'end', color: 'c1', bold: true },
        note7(8.4, '벡터로 빼기: 보상 = 측정 − Slow roll', 'text', true),
        note7(7.2, '측정 50 µm pp∠120°', 'c2'),
        note7(6.1, '− Slow roll 15 µm pp∠60°', 'c4'),
        note7(5.0, `= 보상 ${fv(V.example)}`, 'c1', true),
        note7(3.4, '크기만 빼면 (틀린 방법)', 'text', true),
        note7(2.3, `50 − 15 = 35 µm pp → ${fmt((1 - 35 / um(V.example.amp)) * 100, 2)} % 작다`, 'muted'),
        note7(1.2, '위상은 120° 그대로 → 17° 틀린다', 'muted'),
      ],
    },
  ],
};

// 그림 8 — 런아웃이 섞인 런업과 보상
const P8: Pt = [15, 5.0];
const from8 = rpm6.findIndex((n) => n >= 400);
const comp8 = V.ruVec.compensated.slice(from8);
const rpm8 = rpm6.slice(from8);
const srAt = V.ruVec.rpm.indexOf(300);
export const runoutBodePolar: FigureSpec = {
  id: 'fig-p2-3-8',
  caption: `그림 8. 그림 6의 로터에 런아웃 15 µm pp∠60°가 섞였을 때. 주황: 센서가 읽은 1X 벡터. 저속에서도 0이 되지 않고 런아웃(300 rpm에서 ${fv(V.ruVec.measured[srAt])})이 남으며, 저속의 위상은 진동이 아니라 런아웃의 위상이다. 임계속도의 피크는 ${fmt(um(V.critMeasured.amp), 3)} µm pp(참값 ${fmt(um(V.crit.amp), 3)}), 운전 회전수에서는 ${fv(V.opMeasured)}(참값 ${fv(V.opTruth)})로 읽힌다. Polar에서는 곡선 전체가 런아웃 벡터만큼 옮겨져 원점이 아닌 곳에서 출발한다. 파랑: 300 rpm 벡터를 모든 회전수에서 벡터로 뺀 결과 — 회색 점선(참값)과 거의 겹친다.`,
  panels: [
    {
      title: '진폭',
      series: [
        { x: rpm6, y: amp(V.ruVec.truth), color: 'muted', width: 1.6, dash: true, label: '참값 (런아웃 없음)' },
        { x: rpm6, y: amp(V.ruVec.measured), color: 'c2', width: 2.2, label: '측정 (진동 + 런아웃)' },
        { x: rpm8, y: amp(comp8), color: 'c1', width: 2, label: '보상 (벡터로 뺌)' },
      ],
      annotations: [{ type: 'vline', x: 300, color: 'c4', label: 'Slow roll 300 rpm' }],
      x: { range: [0, 4000], ticks: 'none' },
      y: { range: [0, 190], ticks: [0, 50, 100, 150], label: '[µm pp]' },
      height: 120,
      legend: true,
    },
    {
      title: '위상 (지연각)',
      series: [
        { x: rpm6, y: lagD(V.ruVec.truth), color: 'muted', width: 1.6, dash: true },
        { x: rpm6, y: lagD(V.ruVec.measured), color: 'c2', width: 2.2 },
        { x: rpm8, y: lagD(comp8), color: 'c1', width: 2 },
      ],
      annotations: [{ type: 'vline', x: 300, color: 'c4' }],
      x: { range: [0, 4000], ticks: [0, 1000, 2000, 3000, 4000], label: '회전수 [rpm]' },
      y: { range: [0, 180], ticks: [0, 60, 90, 120, 180], label: '[°]' },
      height: 110,
    },
    {
      title: 'Polar',
      frame: false,
      height: 230,
      x: { range: [0, 30] },
      y: { range: squareYRange([0, 30], 230) },
      series: [...g6.series, polarTrace(V.ruVec.truth, P8, P6S, 'muted', 1.6, true), polarTrace(V.ruVec.measured, P8, P6S, 'c2'), polarTrace(comp8, P8, P6S, 'c1', 2)],
      annotations: [
        ...g6.annotations,
        vectorArrow(P8, pxy(P8, P6S, 15, 60), 'c4'),
        { type: 'text', x: P8[0] - 0.4, y: P8[1] - 1.2, text: '보라: 런아웃 15 µm pp∠60°', anchor: 'end', color: 'c4', bold: true },
      ],
    },
  ],
};

// 그림 9 — X-Y 위상차와 궤적
const th9 = grid(0, 360, 361);
const xy9 = (lagX: number, lagY: number) => ({
  x: th9.map((d) => 25 * Math.cos(toRad(d - lagX))),
  y: th9.map((d) => 25 * Math.cos(toRad(d - lagY))),
});
const a9 = xy9(30, 120);
const b9 = xy9(30, 30);
const O1: Pt = [8, 3.4];
const O2: Pt = [22, 3.4];
const OS = 2.4 / 25;
const orbitSeries = (o: Pt, s: { x: number[]; y: number[] }, color: FigColor): FigSeries => ({ x: s.x.map((v) => o[0] + v * OS), y: s.y.map((v) => o[1] + v * OS), color, width: 2.4 });
const cross = (o: Pt): FigAnnotation[] => [
  { type: 'line', x1: o[0] - 3, y1: o[1], x2: o[0] + 3, y2: o[1], color: 'muted', width: 0.8 },
  { type: 'line', x1: o[0], y1: o[1] - 2.9, x2: o[0], y2: o[1] + 2.9, color: 'muted', width: 0.8 },
  { type: 'text', x: o[0] + 3.1, y: o[1] - 0.12, text: 'X', anchor: 'start', color: 'muted' },
  { type: 'text', x: o[0] + 0.15, y: o[1] + 2.75, text: 'Y', anchor: 'start', color: 'muted' },
];
export const xyPhase: FigureSpec = {
  id: 'fig-p2-3-9',
  caption: '그림 9. 한 베어링의 X·Y 센서(P2-2 그림 6)가 같은 크기의 1X를 읽을 때, 두 신호의 위상차가 무엇을 알려 주나. 위: 위상차 90°(X 30°, Y 120°) — 한쪽이 피크일 때 다른 쪽은 0을 지난다. 가운데: 위상차 0° — 두 신호가 함께 오르내린다. 아래: X를 가로, Y를 세로 좌표로 삼아 점을 찍은 축 중심의 궤적(오빗). 90°면 원을 그리며 돌고, 0°면 한 방향(대각선)으로만 왕복한다.',
  panels: [
    {
      title: '위상차 90°',
      series: [
        { x: th9, y: a9.x, color: 'c1', width: 2, label: 'X (30°)' },
        { x: th9, y: a9.y, color: 'c2', width: 2, label: 'Y (120°)' },
      ],
      annotations: [],
      x: { range: [0, 360], ticks: 'none' },
      y: { range: [-30, 30], ticks: [-25, 0, 25], label: '[µm]' },
      height: 90,
      legend: true,
    },
    {
      title: '위상차 0°',
      series: [
        { x: th9, y: b9.x, color: 'c1', width: 2, label: 'X (30°)' },
        { x: th9, y: b9.y, color: 'c2', width: 2, dash: true, label: 'Y (30°)' },
      ],
      annotations: [],
      x: { range: [0, 360], ticks: [0, 90, 180, 270, 360], label: '회전 각도 [°]' },
      y: { range: [-30, 30], ticks: [-25, 0, 25], label: '[µm]' },
      height: 90,
      legend: true,
    },
    {
      title: '두 신호로 그린 궤적 (오빗)',
      frame: false,
      height: 150,
      x: { range: [0, 30] },
      y: { range: squareYRange([0, 30], 150) },
      series: [orbitSeries(O1, a9, 'c1'), orbitSeries(O2, b9, 'c1')],
      annotations: [
        ...cross(O1),
        ...cross(O2),
        { type: 'text', x: O1[0] + 4.2, y: O1[1] + 1.2, text: '원 — 위상차 90°', anchor: 'start', bold: true },
        { type: 'text', x: O1[0] + 4.2, y: O1[1] + 0.2, text: '축이 원을 그리며 돈다', anchor: 'start', color: 'muted' },
        { type: 'text', x: O2[0] + 3.6, y: O2[1] + 1.2, text: '직선 — 0°', anchor: 'start', bold: true },
        { type: 'text', x: O2[0] + 3.6, y: O2[1] + 0.2, text: '한 방향으로만', anchor: 'start', color: 'muted' },
      ],
    },
  ],
};

// 그림 10 — 두 베어링의 위상: 동상과 역상
const shaftLine = (x1: number, y1: number, x2: number, y2: number, color: FigColor, width: number, dash = false): FigAnnotation => ({ type: 'line', x1, y1, x2, y2, color, width, dash });
/** 베어링 (축이 지나가는 블록, 축의 움직임을 과장해 그리므로 넉넉하게) */
const bearing = (x: number, y: number): FigAnnotation[] => [{ type: 'rect', x1: x - 0.45, x2: x + 0.45, y1: y - 1.25, y2: y + 1.25, color: 'muted' }];
const Y10 = 3.6;
const tilt = (x: number) => Y10 + 0.13 * (22.5 - x);
export const bearingPhase: FigureSpec = {
  id: 'fig-p2-3-10',
  caption: '그림 10. 한 축의 두 베어링에서 같은 방향(예: 둘 다 수직)의 1X 위상을 비교하기 (옆에서 본 모습, 움직임은 과장). 왼쪽: 두 베어링이 같은 쪽으로 함께 움직인다 — 위상차 ≈ 0°(동상). 축이 통째로 평행 이동하는 병진 모드이고, 축 가운데에 무거운 점이 하나 있는 정적 불평형과 잘 맞는다. 오른쪽: 두 베어링이 서로 반대로 움직인다 — 위상차 ≈ 180°(역상). 축이 시소처럼 기울며 도는 원추 모드이고, 양 끝에 반대 방향으로 무거운 점이 있는 커플 불평형과 잘 맞는다 (P0-5의 동상·역상 모드).',
  panels: [
    {
      frame: false,
      height: 180,
      x: { range: [0, 30] },
      y: { range: squareYRange([0, 30], 180) },
      series: [],
      annotations: [
        shaftLine(1.2, Y10, 13.8, Y10, 'muted', 1.4, true),
        shaftLine(1.2, Y10 + 0.9, 13.8, Y10 + 0.9, 'c1', 4),
        ...bearing(3, Y10),
        ...bearing(12, Y10),
        { type: 'rect', x1: 7.2, x2: 7.8, y1: Y10 + 0.9 - 1.3, y2: Y10 + 0.9 + 1.3, color: 'c1' },
        { type: 'circle', x: 7.5, y: Y10 + 0.9 + 1.3, r: 6, fill: true, color: 'warn' },
        vectorArrow([3, Y10 + 1.4], [3, Y10 + 2.5], 'c2'),
        vectorArrow([12, Y10 + 1.4], [12, Y10 + 2.5], 'c2'),
        { type: 'text', x: 3, y: Y10 + 2.8, text: '베어링 1', anchor: 'middle', color: 'c2' },
        { type: 'text', x: 12, y: Y10 + 2.8, text: '베어링 2', anchor: 'middle', color: 'c2' },
        { type: 'text', x: 7.5, y: 6.95, text: '동상 (위상차 ≈ 0°)', anchor: 'middle', bold: true },
        { type: 'text', x: 7.5, y: 1.0, text: '병진 모드 · 정적 불평형', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 7.5, y: 0.2, text: '무거운 점 하나 (가운데)', anchor: 'middle', color: 'warn' },
        shaftLine(16.2, Y10, 28.8, Y10, 'muted', 1.4, true),
        shaftLine(16.2, tilt(16.2), 28.8, tilt(28.8), 'c1', 4),
        ...bearing(18, Y10),
        ...bearing(27, Y10),
        { type: 'circle', x: 17.0, y: tilt(17.0) + 0.45, r: 6, fill: true, color: 'warn' },
        { type: 'circle', x: 28.0, y: tilt(28.0) - 0.45, r: 6, fill: true, color: 'warn' },
        vectorArrow([18, Y10 + 1.4], [18, Y10 + 2.5], 'c2'),
        vectorArrow([27, Y10 - 1.4], [27, Y10 - 2.5], 'c2'),
        { type: 'text', x: 18, y: Y10 + 2.8, text: '베어링 1', anchor: 'middle', color: 'c2' },
        { type: 'text', x: 27.5, y: Y10 - 2.3, text: '베어링 2', anchor: 'start', color: 'c2' },
        { type: 'text', x: 22.5, y: 6.95, text: '역상 (위상차 ≈ 180°)', anchor: 'middle', bold: true },
        { type: 'text', x: 22.5, y: 1.0, text: '원추 모드 · 커플 불평형', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 22.5, y: 0.2, text: '양 끝에 반대 방향으로 하나씩', anchor: 'middle', color: 'warn' },
      ],
    },
  ],
};
