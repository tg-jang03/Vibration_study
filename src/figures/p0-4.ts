/** P0-4 "강제진동과 공진" 본문 그림. 응답은 lib/mck 해석해에서 계산한다. */
import { grid, squareYRange, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { forcedResponse, halfPowerPoints, resonancePeak, steadyStateResponse } from '../lib/mck';

const MASS = 1;
const FN = 5;
const OMEGA_N = 2 * Math.PI * FN;
const STIFFNESS = MASS * OMEGA_N ** 2;
/** 같은 힘을 아주 천천히 걸었을 때의 처짐 X_st = F₀/k [m]. 그림은 모두 이 값을 10 mm로 둔다 */
const X_ST = 0.01;
const F0 = STIFFNESS * X_ST;

function systemFor(zeta: number) {
  return { mass: MASS, stiffness: STIFFNESS, damping: 2 * zeta * MASS * OMEGA_N };
}

const deg = (rad: number) => (rad * 180) / Math.PI;
const ZETA = 0.05;
const at = (r: number, zeta = ZETA) => steadyStateResponse(r, zeta);

export const P0_4_REFERENCE = {
  low: { amplitudeRatio: at(0.5).amplitudeRatio, phaseDeg: deg(at(0.5).phaseLag) },
  resonance: { amplitudeRatio: at(1).amplitudeRatio, phaseDeg: deg(at(1).phaseLag) },
  high: { amplitudeRatio: at(2).amplitudeRatio, phaseDeg: deg(at(2).phaseLag) },
  peak: resonancePeak(ZETA)!,
  halfPower: halfPowerPoints(ZETA)!,
  halfPowerHalfZeta: halfPowerPoints(ZETA / 2)!,
  transientTau: 1 / (ZETA * OMEGA_N),
  example: { r: 1.6, amplitudeRatio: at(1.6).amplitudeRatio, phaseDeg: deg(at(1.6).phaseLag) },
  beat: { r: 0.9, zeta: 0.01, amplitudeRatio: at(0.9, 0.01).amplitudeRatio, periodS: 1 / (FN - 0.9 * FN) },
} as const;

const f = (v: number, sig = 3) => formatNumber(v, sig);

// ── 그림 1: 모델 ──────────────────────────────────────────────
const forceTime = grid(0, 0.5, 301);
export const forcedModel: FigureSpec = {
  id: 'fig-p0-4-1',
  caption:
    '그림 1. P0-3의 질량-스프링-감쇠계에 바깥 힘 F₀ cos ωt를 계속 건다. 위는 모델, 아래는 그 힘의 시간파형(ω = 2π × 4 Hz 예)이다. 힘은 일정한 박자로 오른쪽·왼쪽을 번갈아 민다.',
  panels: [
    {
      frame: false,
      height: 150,
      x: { range: [0, 10] },
      y: { range: squareYRange([0, 10], 150) },
      series: [],
      annotations: [
        { type: 'ground', x1: 0.8, y1: 0.15, x2: 0.8, y2: 1.65, side: 'left' },
        { type: 'spring', x1: 0.8, y1: 1.25, x2: 4.6, y2: 1.25, coils: 8, label: '강성 k' },
        { type: 'damper', x1: 0.8, y1: 0.55, x2: 4.6, y2: 0.55, width: 18, label: '감쇠 계수 c' },
        { type: 'rect', x1: 4.6, x2: 6.15, y1: 0.25, y2: 1.55, label: '질량 m', color: 'c1' },
        { type: 'arrow', x1: 6.15, y1: 0.9, x2: 7.6, y2: 0.9, label: 'F₀ cos ωt', color: 'c2', double: false },
        { type: 'text', x: 8.75, y: 1.45, text: 'mẍ + cẋ + kx', anchor: 'middle', color: 'text', bold: true },
        { type: 'text', x: 8.75, y: 1.05, text: '= F₀ cos ωt', anchor: 'middle', color: 'c2', bold: true },
      ],
    },
    {
      height: 100,
      series: [{ x: forceTime, y: forceTime.map((t) => Math.cos(2 * Math.PI * 4 * t)), label: '힘 F(t)/F₀', color: 'c2', width: 2.2 }],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, 0.5], label: '시간 t [s]' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1], label: 'F/F₀' },
    },
  ],
};

// ── 그림 2: 과도 + 정상상태 ───────────────────────────────────
const exampleTime = grid(0, 2.5, 1501);
const exampleInput = { forceAmplitude: F0, forcingOmega: 1.6 * OMEGA_N };
const exampleResponse = forcedResponse(systemFor(ZETA), exampleInput, { x0: 0, v0: 0 }, exampleTime);
const mm = (v: number) => 1000 * v;
export const transientAndSteady: FigureSpec = {
  id: 'fig-p0-4-2',
  caption: `그림 2. 고유진동수 5 Hz, ζ = 0.05인 계에 8 Hz(r = 1.6) 힘을 정지 상태에서 걸기 시작했다. 위: 실제 변위(파랑)는 처음 0.5초 동안 들쭉날쭉하다가 점점 회색 점선(정상상태 응답, 8 Hz)과 겹친다. 아래: 둘의 차이인 과도 응답(초록)은 5 Hz 근처 박자로 흔들리며 P0-3의 포락선처럼 줄어든다. 약 ${f(3 * P0_4_REFERENCE.transientTau, 2)}초(3τ) 뒤에는 처음의 5 % 아래다.`,
  panels: [
    {
      series: [
        { x: exampleTime, y: exampleResponse.map((s) => mm(s.x)), label: '실제 변위 x(t)', color: 'c1', width: 2.1 },
        { x: exampleTime, y: exampleResponse.map((s) => mm(s.steady)), label: '정상상태 응답 (8 Hz)', color: 'muted', dash: true, width: 1.6 },
      ],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, 2.5], label: '시간 t [s]' },
      y: { range: [-14, 14], ticks: [-10, 0, 10], label: '변위 x [mm]' },
      height: 190,
    },
    {
      series: [
        { x: exampleTime, y: exampleResponse.map((s) => mm(s.transient)), label: '과도 응답 = 실제 − 정상상태', color: 'c3', width: 2 },
      ],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, 2.5], label: '시간 t [s]' },
      y: { range: [-8, 8], ticks: [-5, 0, 5], label: '과도 [mm]' },
      height: 150,
      legend: true,
    },
  ],
};

// ── 그림 3: 세 구간의 힘과 응답 ───────────────────────────────
const cycles = grid(0, 2, 401);
function regimePanel(r: number, yMax: number, ticks: number[], title: string) {
  const res = at(r);
  const lagCycles = res.phaseLag / (2 * Math.PI);
  return {
    title,
    series: [
      { x: cycles, y: cycles.map((n) => Math.cos(2 * Math.PI * n)), label: '힘 F/k (X_st 단위)', color: 'c2' as const, width: 1.8 },
      { x: cycles, y: cycles.map((n) => res.amplitudeRatio * Math.cos(2 * Math.PI * n - res.phaseLag)), label: '변위 x/X_st', color: 'c1' as const, width: 2.3 },
    ],
    annotations: [
      { type: 'hline' as const, y: 0, color: 'muted' as const, dash: true },
      { type: 'vline' as const, x: 1, color: 'c2' as const, dash: true },
      { type: 'vline' as const, x: 1 + lagCycles, color: 'c1' as const, dash: true },
    ],
    x: { range: [0, 2] as [number, number], label: '힘의 주기 수 (ωt / 2π)' },
    y: { range: [-yMax, yMax] as [number, number], ticks, label: '× X_st' },
    height: 125,
  };
}
const R = P0_4_REFERENCE;
export const threeRegimes: FigureSpec = {
  id: 'fig-p0-4-3',
  caption: `그림 3. 같은 힘(주황, 크기 1 = X_st)을 ζ = 0.05인 계에 세 박자로 건 정상상태. 점선은 힘의 꼭대기(주황)와 변위의 꼭대기(파랑) 시각이다. r = 0.5에서는 변위가 힘을 거의 그대로 따라가고(${f(R.low.amplitudeRatio, 4)}배, ${f(R.low.phaseDeg, 2)}° 늦음), r = 1에서는 ${f(R.resonance.amplitudeRatio, 3)}배로 커지며 정확히 1/4주기(90°) 늦고, r = 2에서는 ${f(R.high.amplitudeRatio, 3)}배로 작아지며 거의 반대(${f(R.high.phaseDeg, 4)}°)로 움직인다. 세 패널의 세로 눈금이 다르다는 점에 주의.`,
  panels: [
    regimePanel(0.5, 1.6, [-1, 0, 1], 'r = 0.5 (천천히 밀 때)'),
    regimePanel(1, 11.5, [-10, -5, 0, 5, 10], 'r = 1 (고유진동수로 밀 때)'),
    regimePanel(2, 1.25, [-1, 0, 1], 'r = 2 (빠르게 밀 때)'),
  ],
};

// ── 그림 4·5: 진폭비·위상 vs r ────────────────────────────────
const rAxis = grid(0, 3, 601);
const curveZetas = [
  { zeta: 0.05, color: 'c1' as const, width: 2.4 },
  { zeta: 0.1, color: 'c2' as const, width: 2 },
  { zeta: 0.25, color: 'c3' as const, width: 2 },
  { zeta: 0.5, color: 'c4' as const, width: 2 },
];
export const amplitudeCurve: FigureSpec = {
  id: 'fig-p0-4-4',
  caption: `그림 4. 진동수비 r에 따른 진폭비 X/X_st (같은 힘 F₀, 감쇠비만 다름). r이 0이면 1(정적 처짐), r = 1 근처에서 솟고, r이 커지면 0으로 내려간다. 봉우리 높이는 감쇠비가 정한다 — ζ = 0.05(파랑)는 ${f(R.peak.amplitudeRatio, 4)}배(r = ${f(R.peak.frequencyRatio, 4)}), ζ = 0.5(보라)는 봉우리가 거의 없다. r = √2보다 빠르면 감쇠와 관계없이 1보다 작아진다.`,
  panels: [{
    series: curveZetas.map(({ zeta, color, width }) => ({
      x: rAxis,
      y: rAxis.map((r) => Math.min(at(r, zeta).amplitudeRatio, 12)),
      label: `ζ = ${zeta}`,
      color,
      width,
    })),
    annotations: [
      { type: 'hline', y: 1, label: 'X_st (정적 처짐)', color: 'muted', dash: true, labelAt: 'end' },
      { type: 'vline', x: Math.SQRT2, label: 'r = √2', color: 'muted', dash: true },
      { type: 'point', x: R.peak.frequencyRatio, y: R.peak.amplitudeRatio, label: `≈ 1/(2ζ) = ${f(R.peak.amplitudeRatio, 3)}`, color: 'c1', dx: 14, dy: 4 },
    ],
    x: { range: [0, 3], label: '진동수비 r = ω/ωₙ' },
    y: { range: [0, 11.5], ticks: [0, 1, 2, 4, 6, 8, 10], label: '진폭비 X/X_st' },
    height: 240,
  }],
};

export const phaseCurve: FigureSpec = {
  id: 'fig-p0-4-5',
  caption: '그림 5. 같은 네 감쇠비의 위상 지연 φ (변위가 힘보다 늦은 각도). 모든 곡선이 r = 1에서 정확히 90°를 지난다. 감쇠가 작을수록(파랑) 0° → 180°로 넘어가는 구간이 r = 1 근처에 좁게 몰리고, 감쇠가 크면(보라) 완만하게 넘어간다.',
  panels: [{
    series: curveZetas.map(({ zeta, color, width }) => ({
      x: rAxis,
      y: rAxis.map((r) => deg(at(r, zeta).phaseLag)),
      label: `ζ = ${zeta}`,
      color,
      width,
    })),
    annotations: [
      { type: 'hline', y: 90, label: '90°', color: 'muted', dash: true, labelAt: 'start' },
      { type: 'vline', x: 1, label: 'r = 1', color: 'muted', dash: true },
    ],
    x: { range: [0, 3], label: '진동수비 r = ω/ωₙ' },
    y: { range: [0, 185], ticks: [0, 45, 90, 135, 180], label: '위상 지연 φ [°]' },
    height: 220,
  }],
};

// ── 그림 6: 봉우리 높이와 폭 ──────────────────────────────────
const zoomAxis = grid(0.8, 1.2, 801);
const hp = R.halfPower;
const hp2 = R.halfPowerHalfZeta;
const peak2 = resonancePeak(ZETA / 2)!;
export const peakWidth: FigureSpec = {
  id: 'fig-p0-4-6',
  caption: `그림 6. r = 1 근처를 확대했다. 봉우리 높이의 1/√2(약 0.707배)가 되는 두 점 사이 폭을 Half-power 폭이라 한다. ζ = 0.05(파랑)는 높이 ${f(R.peak.amplitudeRatio, 4)}, 폭 Δr = ${f(hp.width, 3)} ≈ 2ζ. 감쇠를 절반(ζ = 0.025, 주황)으로 줄이면 높이는 ${f(peak2.amplitudeRatio, 4)}로 약 2배, 폭은 ${f(hp2.width, 3)}로 약 절반이 된다. 고유진동수 5 Hz라면 파랑의 폭은 약 ${f(hp.width * FN, 2)} Hz다.`,
  panels: [{
    series: [
      { x: zoomAxis, y: zoomAxis.map((r) => at(r, ZETA / 2).amplitudeRatio), label: 'ζ = 0.025', color: 'c2', width: 2 },
      { x: zoomAxis, y: zoomAxis.map((r) => at(r, ZETA).amplitudeRatio), label: 'ζ = 0.05', color: 'c1', width: 2.4 },
    ],
    annotations: [
      { type: 'arrow', x1: hp.lower, y1: R.peak.amplitudeRatio / Math.SQRT2, x2: hp.upper, y2: R.peak.amplitudeRatio / Math.SQRT2, label: `Δr = ${f(hp.width, 3)}`, color: 'c1', double: true, labelDy: 16 },
      { type: 'arrow', x1: hp2.lower, y1: peak2.amplitudeRatio / Math.SQRT2, x2: hp2.upper, y2: peak2.amplitudeRatio / Math.SQRT2, label: `Δr = ${f(hp2.width, 3)}`, color: 'c2', double: true, labelDy: -10 },
      { type: 'hline', y: 1, color: 'muted', dash: true },
    ],
    x: { range: [0.8, 1.2], label: '진동수비 r = ω/ωₙ' },
    y: { range: [0, 21.5], ticks: [0, 5, 10, 15, 20], label: '진폭비 X/X_st' },
    height: 230,
  }],
};

// ── 그림 7: 맥놀이 ────────────────────────────────────────────
const beatTime = grid(0, 8, 4001);
const beatInput = { forceAmplitude: F0, forcingOmega: R.beat.r * OMEGA_N };
const beatResponse = forcedResponse(systemFor(R.beat.zeta), beatInput, { x0: 0, v0: 0 }, beatTime);
export const beatStart: FigureSpec = {
  id: 'fig-p0-4-7',
  caption: `그림 7. ζ = 0.01로 감쇠가 아주 작은 계(5 Hz)에 4.5 Hz(r = 0.9) 힘을 정지 상태에서 걸기 시작했다. 5 Hz 근처의 과도 응답과 4.5 Hz의 정상상태 응답이 한동안 함께 남아, 둘이 같은 방향일 때는 더해지고 반대일 때는 상쇄된다. 그래서 진폭이 ${f(R.beat.periodS, 2)}초(= 1/(5 − 4.5) s)마다 출렁인다. 과도 응답이 사라지면 출렁임도 줄어 회색 점선(정상상태 진폭 ${f(R.beat.amplitudeRatio, 3)} × X_st)에 머문다.`,
  panels: [{
    series: [
      { x: beatTime, y: beatResponse.map((s) => s.x / X_ST), label: '변위 x/X_st', color: 'c1', width: 1.5 },
    ],
    annotations: [
      { type: 'hline', y: R.beat.amplitudeRatio, color: 'muted', dash: true },
      { type: 'hline', y: -R.beat.amplitudeRatio, color: 'muted', dash: true },
      { type: 'arrow', x1: 0, y1: 10.6, x2: R.beat.periodS, y2: 10.6, label: `${f(R.beat.periodS, 2)} s`, color: 'warn', double: true, labelDy: -8 },
    ],
    x: { range: [0, 8], label: '시간 t [s]' },
    y: { range: [-11.5, 12], ticks: [-10, -5, 0, 5, 10], label: '변위 x/X_st' },
    height: 220,
  }],
};
