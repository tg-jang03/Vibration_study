/** P0-3 "감쇠" 본문 그림. 자유응답은 lib/mck 해석해에서 계산한다. */
import { grid, squareYRange, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { freeResponse, freeResponseAt, sdofProperties } from '../lib/mck';

const MASS = 1;
const FN = 5;
const OMEGA_N = 2 * Math.PI * FN;
const STIFFNESS = MASS * OMEGA_N ** 2;
const X0 = 0.01;

function systemFor(zeta: number) {
  return { mass: MASS, stiffness: STIFFNESS, damping: 2 * zeta * MASS * OMEGA_N };
}

const ZETA = 0.05;
const BASE = systemFor(ZETA);
const BASE_PROPS = sdofProperties(BASE);
const DELTA = BASE_PROPS.logDecrement as number;

export const P0_3_REFERENCE = {
  logDecrement: DELTA,
  frequencyRatio: (BASE_PROPS.omegaD as number) / BASE_PROPS.omegaN,
  nextPeakRatio: Math.exp(-DELTA),
  halfCycles: Math.log(2) / DELTA,
} as const;

export const damperModel: FigureSpec = {
  id: 'fig-p0-3-1',
  caption:
    '그림 1. 질량-스프링에 감쇠기 c를 나란히 붙인 가장 단순한 모델. 질량이 오른쪽으로 움직이면 감쇠력 −cẋ는 왼쪽을 향해 움직임을 방해한다. 복원력 −kx와 합치면 운동방정식은 mẍ + cẋ + kx = 0이다.',
  panels: [{
    frame: false,
    height: 160,
    x: { range: [0, 10] },
    y: { range: squareYRange([0, 10], 160) },
    series: [],
    annotations: [
      { type: 'ground', x1: 0.8, y1: 0.15, x2: 0.8, y2: 1.65, side: 'left' },
      { type: 'spring', x1: 0.8, y1: 1.25, x2: 5.1, y2: 1.25, coils: 8, label: '강성 k' },
      { type: 'damper', x1: 0.8, y1: 0.55, x2: 5.1, y2: 0.55, width: 18, label: '감쇠 계수 c' },
      { type: 'rect', x1: 5.1, x2: 6.65, y1: 0.25, y2: 1.55, label: '질량 m', color: 'c1' },
      { type: 'arrow', x1: 5.85, y1: 1.82, x2: 7.25, y2: 1.82, label: '속도 ẋ', color: 'c1' },
      { type: 'arrow', x1: 5.1, y1: 0.9, x2: 3.9, y2: 0.9, label: '−cẋ', color: 'warn' },
      { type: 'text', x: 8.35, y: 1.25, text: 'mẍ + cẋ + kx = 0', anchor: 'middle', color: 'text', bold: true },
      { type: 'text', x: 8.35, y: 0.65, text: '움직임 → 열', anchor: 'middle', color: 'c3', bold: true },
    ],
  }],
};

const responseTime = grid(0, 1.2, 901);
const undamped = freeResponse(systemFor(0), { x0: X0 }, responseTime);
const damped = freeResponse(BASE, { x0: X0 }, responseTime);
const phaseAmplitude = X0 / Math.sqrt(1 - ZETA ** 2);
const envelope = responseTime.map((t) => 1000 * phaseAmplitude * Math.exp(-ZETA * OMEGA_N * t));

export const decayingWaveform: FigureSpec = {
  id: 'fig-p0-3-3',
  caption:
    '그림 3. 감쇠가 없으면 진폭이 그대로지만, ζ = 0.05이면 파랑 변위가 회색 포락선 안에서 지수적으로 줄어든다. 포락선의 모양 A e^(−ζωₙt)가 진동이 얼마나 오래 남는지 보여 준다.',
  panels: [{
    series: [
      { x: responseTime, y: undamped.map((s) => 1000 * s.x), label: '감쇠 없음 ζ = 0', color: 'c2', width: 1.8 },
      { x: responseTime, y: damped.map((s) => 1000 * s.x), label: '부족감쇠 ζ = 0.05', color: 'c1', width: 2.3 },
      { x: responseTime, y: envelope, label: '포락선', color: 'muted', dash: true, width: 1.4 },
      { x: responseTime, y: envelope.map((v) => -v), color: 'muted', dash: true, width: 1.4 },
    ],
    annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
    x: { range: [0, 1.2], label: '시간 t [s]' },
    y: { range: [-11.5, 11.5], ticks: [-10, 0, 10], label: '변위 x [mm]' },
    height: 235,
  }],
};

const cycle = grid(0, 8, 401);
const peakDecay = (zeta: number) => {
  if (zeta === 0) return cycle.map(() => 1);
  const delta = sdofProperties(systemFor(zeta)).logDecrement as number;
  return cycle.map((n) => Math.exp(-delta * n));
};

export const decayPerCycle: FigureSpec = {
  id: 'fig-p0-3-4',
  caption:
    '그림 4. 가로축을 시간이 아니라 지난 주기 수로 놓으면 감쇠비의 역할이 선명하다. ζ가 클수록 같은 주기 수 뒤에 남는 진폭이 작다. ζ = 0.05는 약 2.2주기 뒤 절반이 된다.',
  panels: [{
    series: [
      { x: cycle, y: peakDecay(0.02), label: 'ζ = 0.02', color: 'c2', width: 2.1 },
      { x: cycle, y: peakDecay(0.05), label: 'ζ = 0.05', color: 'c1', width: 2.3 },
      { x: cycle, y: peakDecay(0.1), label: 'ζ = 0.10', color: 'c3', width: 2.1 },
    ],
    annotations: [
      { type: 'hline', y: 0.5, label: '처음의 절반', color: 'muted', dash: true },
      { type: 'vline', x: P0_3_REFERENCE.halfCycles, label: 'ζ = 0.05: 약 2.2주기', color: 'c1', dash: true },
    ],
    x: { range: [0, 8], label: '지난 주기 수' },
    y: { range: [0, 1.05], ticks: [0, 0.25, 0.5, 0.75, 1], label: '처음 피크에 대한 비' },
    height: 225,
  }],
};

const normalizedTime = grid(0, 10, 601);
const normalizedResponse = (zeta: number) => {
  const system = systemFor(zeta);
  return normalizedTime.map((tau) => 1000 * freeResponseAt(system, { x0: X0 }, tau / OMEGA_N).x);
};

export const dampingRegimes: FigureSpec = {
  id: 'fig-p0-3-2',
  caption:
    '그림 2. 부족감쇠(ζ < 1)는 평형을 지나 여러 번 왕복한다. 임계감쇠(ζ = 1)는 진동하지 않으면서 가장 빠르게 돌아오고, 과감쇠(ζ > 1)는 평형을 넘지 않지만 더 천천히 돌아온다.',
  panels: [{
    series: [
      { x: normalizedTime, y: normalizedResponse(0.2), label: '부족감쇠 ζ = 0.2', color: 'c1', width: 2.2 },
      { x: normalizedTime, y: normalizedResponse(1), label: '임계감쇠 ζ = 1', color: 'c3', width: 2.2 },
      { x: normalizedTime, y: normalizedResponse(1.5), label: '과감쇠 ζ = 1.5', color: 'c4', width: 2.2 },
    ],
    annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
    x: { range: [0, 10], label: '무차원 시간 ωₙt' },
    y: { range: [-5.5, 10.8], ticks: [-5, 0, 5, 10], label: '변위 x [mm]' },
    height: 235,
  }],
};

const zetaAxis = grid(0, 0.8, 401);
const dampedRatio = zetaAxis.map((value) => Math.sqrt(1 - value ** 2));
export const dampedFrequencyShift: FigureSpec = {
  id: 'fig-p0-3-5',
  caption: `그림 5. 부족감쇠의 박자는 ω_d/ω_n = √(1−ζ²)만큼 낮아진다. ζ = 0.05에서는 ${formatNumber(P0_3_REFERENCE.frequencyRatio, 5)}배로, 차이는 약 0.125 %뿐이다. 작은 감쇠는 박자보다 지속 시간을 훨씬 크게 바꾼다.`,
  panels: [{
    series: [{ x: zetaAxis, y: dampedRatio, label: 'ω_d/ωₙ', color: 'c1', width: 2.4 }],
    annotations: [
      { type: 'point', x: 0.05, y: P0_3_REFERENCE.frequencyRatio, label: 'ζ = 0.05', color: 'warn', dx: 14, dy: 18 },
      { type: 'hline', y: 1, label: '감쇠 없음', color: 'muted', dash: true },
    ],
    x: { range: [0, 0.8], label: '감쇠비 ζ' },
    y: { range: [0.55, 1.02], ticks: [0.6, 0.7, 0.8, 0.9, 1], label: '주파수비 ω_d/ωₙ' },
    height: 220,
  }],
};

const dampedPeriod = (2 * Math.PI) / (BASE_PROPS.omegaD as number);
const peakTimes = [0, dampedPeriod, 2 * dampedPeriod, 3 * dampedPeriod];
const peakValues = peakTimes.map((t) => 1000 * freeResponseAt(BASE, { x0: X0 }, t).x);
export const logarithmicDecrement: FigureSpec = {
  id: 'fig-p0-3-6',
  caption: `그림 6. ζ = 0.05에서 같은 방향의 첫 두 피크는 10.0 mm와 ${peakValues[1].toFixed(2)} mm다. 다음/이전 피크 비는 ${formatNumber(P0_3_REFERENCE.nextPeakRatio, 4)}이고, δ = ln(1/${formatNumber(P0_3_REFERENCE.nextPeakRatio, 4)}) = ${formatNumber(P0_3_REFERENCE.logDecrement, 4)}다.`,
  panels: [{
    series: [
      { x: responseTime, y: damped.map((s) => 1000 * s.x), label: '감쇠 자유응답', color: 'c1', width: 2.2 },
      { x: peakTimes, y: peakValues, label: '같은 방향의 피크', color: 'warn', kind: 'dots', radius: 5 },
    ],
    annotations: [
      { type: 'point', x: peakTimes[0], y: peakValues[0], label: 'xᵢ = 10.0 mm', color: 'warn', dx: 14, dy: -12 },
      { type: 'point', x: peakTimes[1], y: peakValues[1], label: `xᵢ₊₁ = ${peakValues[1].toFixed(2)} mm`, color: 'warn', dx: 14, dy: -12 },
    ],
    x: { range: [0, 0.85], label: '시간 t [s]' },
    y: { range: [-9, 11.5], ticks: [-5, 0, 5, 10], label: '변위 x [mm]' },
    height: 230,
  }],
};
