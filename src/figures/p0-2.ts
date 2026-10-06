/** P0-2 "고유진동수" 본문 그림. 수치는 lib/mck의 자유응답 해석해에서 계산한다. */
import { grid, squareYRange, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { freeResponse, sdofProperties } from '../lib/mck';

const BASE = { mass: 1, stiffness: 1000 };
const HEAVY = { mass: 4, stiffness: 1000 };
const STIFF = { mass: 1, stiffness: 4000 };
const X0 = 0.01;
const BASE_PROPS = sdofProperties(BASE);

export const P0_2_REFERENCE = {
  omegaN: BASE_PROPS.omegaN,
  frequencyHz: BASE_PROPS.frequencyHz,
  period: BASE_PROPS.period,
  equilibriumSpeed: BASE_PROPS.omegaN * X0,
  endAcceleration: BASE_PROPS.omegaN ** 2 * X0,
} as const;

export const equationBalance: FigureSpec = {
  id: 'fig-p0-2-1',
  caption:
    '그림 1. 질량이 오른쪽으로 x만큼 벗어나면 스프링의 복원력 −kx는 왼쪽을 향한다. 뉴턴의 법칙 mẍ = F에 이 힘을 넣으면 mẍ = −kx, 즉 mẍ + kx = 0이 된다.',
  panels: [{
    frame: false,
    height: 145,
    x: { range: [0, 10] },
    y: { range: squareYRange([0, 10], 145) },
    series: [],
    annotations: [
      { type: 'ground', x1: 0.8, y1: 0.2, x2: 0.8, y2: 1.35, side: 'left' },
      { type: 'spring', x1: 0.8, y1: 0.78, x2: 4.8, y2: 0.78, coils: 8, label: '강성 k' },
      { type: 'rect', x1: 4.8, x2: 6.25, y1: 0.28, y2: 1.28, label: '질량 m', color: 'c1' },
      { type: 'line', x1: 4.1, y1: 0.1, x2: 4.1, y2: 1.5, dash: true, color: 'muted' },
      { type: 'arrow', x1: 4.1, y1: 1.53, x2: 5.52, y2: 1.53, label: '변위 x', color: 'c2' },
      { type: 'arrow', x1: 4.8, y1: 0.78, x2: 3.25, y2: 0.78, label: 'F = −kx', color: 'warn' },
      { type: 'text', x: 8.05, y: 1.1, text: 'mẍ = −kx', anchor: 'middle', color: 'text', bold: true },
      { type: 'text', x: 8.05, y: 0.58, text: 'mẍ + kx = 0', anchor: 'middle', color: 'c3', bold: true },
    ],
  }],
};

const sineT = grid(0, 1, 501);
const sine = sineT.map((t) => Math.cos(2 * Math.PI * 2 * t));
export const sineAnatomy: FigureSpec = {
  id: 'fig-p0-2-2',
  caption:
    '그림 2. 정현파는 세 숫자로 정해진다. 진폭 A는 중심에서 꼭대기까지의 높이, 주기 T는 같은 상태로 돌아오는 시간, 위상 φ는 같은 박자 안에서 시작 위치가 얼마나 어긋났는지 나타낸다. 주파수는 f = 1/T다.',
  panels: [{
    series: [{ x: sineT, y: sine, label: 'x(t) = A cos(2πft + φ)', width: 2.4 }],
    annotations: [
      { type: 'hline', y: 0, color: 'muted', dash: true },
      { type: 'arrow', x1: 0, y1: 0, x2: 0, y2: 1, label: '진폭 A', color: 'c2', labelDx: 8 },
      { type: 'arrow', x1: 0, y1: 1.2, x2: 0.5, y2: 1.2, label: '주기 T', color: 'c3' },
      { type: 'point', x: 0.125, y: 0, label: '한 주기의 1/4 = 90°', color: 'warn', dx: 12, dy: -12 },
    ],
    x: { range: [0, 1], label: '시간 t [s]' },
    y: { range: [-1.3, 1.35], ticks: [-1, 0, 1], label: '변위 x / A' },
    height: 220,
  }],
};

const compareT = grid(0, 0.8, 801);
const responseMm = (system: typeof BASE) => freeResponse(system, { x0: X0 }, compareT).map((s) => 1000 * s.x);
export const massAndStiffness: FigureSpec = {
  id: 'fig-p0-2-3',
  caption: `그림 3. 기준 m = 1 kg, k = 1000 N/m의 고유진동수는 ${formatNumber(BASE_PROPS.frequencyHz, 4)} Hz다. 질량을 4배로 하면 박자는 절반, 강성을 4배로 하면 박자는 두 배가 된다.`,
  panels: [{
    series: [
      { x: compareT, y: responseMm(BASE), label: '기준: m = 1, k = 1000', color: 'c1', width: 2.3 },
      { x: compareT, y: responseMm(HEAVY), label: '질량 4배: fₙ 절반', color: 'c2', width: 2.1 },
      { x: compareT, y: responseMm(STIFF), label: '강성 4배: fₙ 두 배', color: 'c3', width: 2.1 },
    ],
    annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
    x: { range: [0, 0.8], label: '시간 t [s]' },
    y: { range: [-11.5, 11.5], ticks: [-10, 0, 10], label: '변위 x [mm]' },
    height: 235,
  }],
};

const twoPeriods = grid(0, 2 * BASE_PROPS.period, 501);
const small = freeResponse(BASE, { x0: 0.005 }, twoPeriods);
const large = freeResponse(BASE, { x0: 0.015 }, twoPeriods);
export const amplitudeIndependence: FigureSpec = {
  id: 'fig-p0-2-4',
  caption:
    '그림 4. 같은 질량과 강성에서 5 mm와 15 mm로 다르게 당겨 놓았다. 움직이는 폭은 세 배지만 꼭대기와 평형점을 지나는 시각은 같다. 이 선형 모델의 고유진동수는 진폭과 무관하다.',
  panels: [{
    series: [
      { x: twoPeriods, y: small.map((s) => 1000 * s.x), label: 'x₀ = 5 mm', color: 'c2', width: 2.1 },
      { x: twoPeriods, y: large.map((s) => 1000 * s.x), label: 'x₀ = 15 mm', color: 'c1', width: 2.1 },
    ],
    annotations: [
      { type: 'vline', x: BASE_PROPS.period, label: '둘 다 한 주기' },
      { type: 'hline', y: 0, color: 'muted', dash: true },
    ],
    x: { range: [0, 2 * BASE_PROPS.period], label: '시간 t [s]' },
    y: { range: [-17, 17], ticks: [-15, 0, 15], label: '변위 x [mm]' },
    height: 220,
  }],
};

const initA = freeResponse(BASE, { x0: 0.01, v0: 0 }, twoPeriods);
const initB = freeResponse(BASE, { x0: 0, v0: BASE_PROPS.omegaN * 0.01 }, twoPeriods);
export const initialConditions: FigureSpec = {
  id: 'fig-p0-2-5',
  caption:
    '그림 5. 처음 위치에서 놓은 경우와 평형점에서 밀어 준 경우. 두 응답은 진폭과 고유진동수가 같고 시작 위치만 한 주기의 1/4만큼 다르다. 초기조건 x₀·v₀는 진폭과 위상을 정하지만 고유진동수는 바꾸지 않는다.',
  panels: [{
    series: [
      { x: twoPeriods, y: initA.map((s) => 1000 * s.x), label: 'x₀ = 10 mm, v₀ = 0', color: 'c1', width: 2.2 },
      { x: twoPeriods, y: initB.map((s) => 1000 * s.x), label: 'x₀ = 0, v₀ = 0.316 m/s', color: 'c3', width: 2.2 },
    ],
    annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
    x: { range: [0, 2 * BASE_PROPS.period], label: '시간 t [s]' },
    y: { range: [-11.5, 11.5], ticks: [-10, 0, 10], label: '변위 x [mm]' },
    height: 220,
  }],
};

const phaseResponse = freeResponse(BASE, { x0: X0 }, twoPeriods);
export const displacementVelocityAcceleration: FigureSpec = {
  id: 'fig-p0-2-6',
  caption:
    '그림 6. 변위·속도·가속도를 각자의 최대값으로 나눠 겹쳤다. 속도는 변위보다 90° 앞서고, 가속도는 다시 90° 앞선다. 따라서 끝점에서는 속도가 0이고 가속도 크기가 최대이며, 평형점에서는 그 반대다.',
  panels: [{
    series: [
      { x: twoPeriods, y: phaseResponse.map((s) => s.x / X0), label: '변위 x/A', color: 'c1', width: 2.2 },
      { x: twoPeriods, y: phaseResponse.map((s) => s.v / (BASE_PROPS.omegaN * X0)), label: '속도 v/(ωₙA)', color: 'c2', width: 2.2 },
      { x: twoPeriods, y: phaseResponse.map((s) => s.a / (BASE_PROPS.omegaN ** 2 * X0)), label: '가속도 a/(ωₙ²A)', color: 'c3', width: 2.2 },
    ],
    annotations: [
      { type: 'vline', x: 0, label: '끝점' },
      { type: 'vline', x: BASE_PROPS.period / 4, label: '평형점' },
      { type: 'hline', y: 0, color: 'muted', dash: true },
    ],
    x: { range: [0, 2 * BASE_PROPS.period], label: '시간 t [s]' },
    y: { range: [-1.25, 1.25], ticks: [-1, 0, 1], label: '각 최대값으로 나눈 크기' },
    height: 235,
  }],
};

const deflectionMm = grid(1, 25, 301);
const g = 9.80665;
const deflectionHz = deflectionMm.map((mm) => Math.sqrt(g / (mm / 1000)) / (2 * Math.PI));
export const staticDeflectionEstimate: FigureSpec = {
  id: 'fig-p0-2-7',
  caption:
    '그림 7. 같은 물체를 올렸을 때 정적으로 많이 처지는 지지는 부드럽고 고유진동수가 낮다. 자기 무게로 처진 양 δₛₜ를 알면 fₙ = (1/2π)√(g/δₛₜ)로 질량과 강성을 따로 몰라도 박자를 어림할 수 있다.',
  panels: [{
    series: [{ x: deflectionMm, y: deflectionHz, label: '정적 처짐으로 어림한 fₙ', color: 'c4', width: 2.4 }],
    annotations: [
      { type: 'point', x: 10, y: Math.sqrt(g / 0.01) / (2 * Math.PI), label: '10 mm → 약 4.98 Hz', color: 'warn', dx: 12, dy: -12 },
    ],
    x: { range: [1, 25], label: '정적 처짐 δₛₜ [mm]' },
    y: { range: [2.8, 16.5], label: '고유진동수 fₙ [Hz]' },
    height: 220,
  }],
};
