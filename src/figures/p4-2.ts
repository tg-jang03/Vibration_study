import { grid, squareYRange, type FigPanel, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { exampleRotor, jeffcottResponse, orbitPoint, sampleOrbit, type JeffcottResponse } from '../lib/rotor/jeffcott';
const um = (m: number) => m * 1e6;
const speed = (rpm: number) => rpm * Math.PI / 30;
const fmt = formatNumber;
const response = (rpm: number, ratio = 1, zeta = .05) => jeffcottResponse(exampleRotor(ratio, zeta), speed(rpm));
export const P42_VALUES = { isotropic: response(3000), anisotropic: response(3200, 1.3), damped: response(3200, 1.3, .2), high: response(15000), low: response(1500) };
const V = P42_VALUES;
function orbitPanel(r: JeffcottResponse, title: string, components = false): FigPanel {
  const points = sampleOrbit(r), bound = Math.max(um(r.amplitudeForward + r.amplitudeBackward), 10) * 1.3;
  const xr: [number, number] = [-bound * 3.5, bound * 3.5];
  const yr = squareYRange(xr, 240); yr[0] = -yr[1] / 2; yr[1] = -yr[0];
  const series: FigSeries[] = [{ x: points.map(p => um(p.x)), y: points.map(p => um(p.y)), color: 'c3', label: '합성 오빗' }];
  if (components) series.push(
    { x: points.map(p => um(p.forwardX)), y: points.map(p => um(p.forwardY)), color: 'c1', label: '정방향 원', dash: true },
    { x: points.map(p => um(p.backwardX)), y: points.map(p => um(p.backwardY)), color: 'c2', label: '역방향 원', dash: true },
  );
  const a = orbitPoint(r, 1), b = orbitPoint(r, 1.3), key = orbitPoint(r, 0);
  return { title, series, x: { range: xr, label: 'X [µm]' }, y: { range: yr, label: 'Y [µm]' }, height: 240,
    annotations: [{ type: 'point', x: um(key.x), y: um(key.y), label: 'θ = 0', color: 'text', dx: 8, dy: -10 }, { type: 'arrow', x1: um(a.x), y1: um(a.y), x2: um(b.x), y2: um(b.y), color: 'c3', double: false }, { type: 'text', x: xr[0] * .8, y: yr[1] * .7, text: '자전 ↺', color: 'muted' }] };
}

const th = grid(0, 2 * Math.PI, 121);
export const spinWhirl: FigureSpec = {
  id: 'fig-p4-2-1',
  caption: '그림 1. 축 끝에서 바라본 그림이다. O는 고정 기준, C는 축의 기하학적 중심, G는 원판의 질량중심이다. 초록 궤적을 따라 C가 O 둘레를 도는 운동이 선회이고, 원판 위의 표시(주황)가 C 둘레를 도는 운동이 자전이다. 두 운동은 서로 다른 위치를 추적한다. 여기서는 둘 다 반시계이며 같은 주기로 돈다(동기 선회). 길이는 설명을 위해 확대했다.',
  panels: [{ frame: false, x: { range: [0, 10] }, y: { range: squareYRange([0, 10], 230) }, height: 230,
    series: [{ x: th.map(t => 4 + Math.cos(t)), y: th.map(t => 1.6 + Math.sin(t)), color: 'c3', dash: true }],
    annotations: [
      { type: 'point', x: 4, y: 1.6, label: 'O (기준)', color: 'muted', dx: -65, dy: 18 },
      { type: 'circle', x: 5, y: 1.6, r: 35, color: 'c1', fill: true },
      { type: 'point', x: 5, y: 1.6, label: 'C', color: 'c1', dx: 8, dy: 18 },
      { type: 'point', x: 5.25, y: 1.6, label: 'G', color: 'c2', dx: 7, dy: -12 },
      { type: 'arrow', x1: 4.95, y1: 1.92, x2: 4.65, y2: 2.37, color: 'c3', double: false },
      { type: 'text', x: 2.5, y: 2.7, text: '선회 ↺: C가 O 둘레로 이동', color: 'c3' },
      { type: 'text', x: 6.2, y: 1.8, text: '원판 위 표시는 C 둘레로 자전 ↺', color: 'c2' },
      { type: 'line', x1: 4, y1: 1.6, x2: 5, y2: 1.6, color: 'muted', dash: true },
    ] }],
};
export const modeShapes: FigureSpec = {
  id: 'fig-p4-2-2',
  caption: '그림 2. 옆에서 본 축의 세 가지 모드 형상이다(변위 확대). 강체 병진은 축 전체가 같은 방향으로 옮겨가고, 강체 기울기는 곧은 축이 기울어 양끝이 반대로 움직인다. 굽힘에서는 축선 자체가 휘므로 위치마다 변위가 다르다. 점선은 변위가 없는 기준 축선이며, 이 그림은 주파수나 실제 치수를 계산한 형상이 아니다.',
  panels: [
    { title: '강체 병진: 축은 곧고 양끝은 같은 방향', frame: false, x: { range: [0, 10] }, y: { range: [-.7, 1.1] }, height: 100, series: [{ x: [1, 9], y: [.5, .5], color: 'c1', width: 5 }], annotations: [{ type: 'line', x1: 1, y1: 0, x2: 9, y2: 0, dash: true, color: 'muted' }, { type: 'arrow', x1: 2, y1: 0, x2: 2, y2: .5, color: 'c1' }, { type: 'arrow', x1: 8, y1: 0, x2: 8, y2: .5, color: 'c1' }] },
    { title: '강체 기울기: 축은 곧고 양끝은 반대 방향', frame: false, x: { range: [0, 10] }, y: { range: [-.7, 1.1] }, height: 100, series: [{ x: [1, 9], y: [-.5, .5], color: 'c2', width: 5 }], annotations: [{ type: 'line', x1: 1, y1: 0, x2: 9, y2: 0, dash: true, color: 'muted' }, { type: 'arrow', x1: 1, y1: 0, x2: 1, y2: -.5, color: 'c2' }, { type: 'arrow', x1: 9, y1: 0, x2: 9, y2: .5, color: 'c2' }] },
    { title: '굽힘: 축선 자체가 휜다', frame: false, x: { range: [0, 10] }, y: { range: [-.7, 1.1] }, height: 100, series: [{ x: grid(1, 9, 81), y: grid(0, Math.PI, 81).map(t => .7 * Math.sin(t)), color: 'c3', width: 5 }], annotations: [{ type: 'line', x1: 1, y1: 0, x2: 9, y2: 0, dash: true, color: 'muted' }, { type: 'ground', x1: .8, y1: -.2, x2: 1.2, y2: -.2 }, { type: 'ground', x1: 8.8, y1: -.2, x2: 9.2, y2: -.2 }] },
  ],
};
export const model: FigureSpec = {
  id: 'fig-p4-2-3',
  caption: '그림 3. Jeffcott 모델은 축 가운데의 질량 원판과 무질량 탄성축을 남긴다(위). 아래는 원판 단면의 등가 모델이다. x·y는 정적 평형에서 잰 변위이고, 방향별 등가 강성 kx·ky와 공통 감쇠 c가 원판의 운동에 저항한다. 회전하는 불평형 힘 Fu의 두 투영이 x에는 cos, y에는 sin으로 작용한다. 축선의 굽힘은 등가 강성에 들어가며 원판의 기울기·자이로 효과는 생략한다.',
  panels: [
    { title: '옆에서 본 축: 중앙 원판 하나 + 탄성축', frame: false, x: { range: [0, 10] }, y: { range: [-.7, 1.5] }, height: 130, series: [{ x: grid(1, 9, 81), y: grid(0, Math.PI, 81).map(t => .6 * Math.sin(t)), color: 'c1', width: 3 }], annotations: [{ type: 'rect', x1: 4.8, x2: 5.2, y1: .15, y2: 1.1, label: 'm', color: 'c2' }, { type: 'ground', x1: .7, y1: -.2, x2: 1.3, y2: -.2 }, { type: 'ground', x1: 8.7, y1: -.2, x2: 9.3, y2: -.2 }, { type: 'text', x: 7, y: 1.1, text: '무질량 탄성축', color: 'c1' }] },
    { title: '축 끝에서 본 등가 모델: 두 방향의 변위', frame: false, x: { range: [0, 10] }, y: { range: squareYRange([0, 10], 230) }, height: 230, series: [], annotations: [
      { type: 'circle', x: 5, y: 1.6, r: 26, label: 'm', fill: true, color: 'c1' },
      { type: 'spring', x1: 1.5, y1: 1.6, x2: 4.6, y2: 1.6, label: 'kx', color: 'c1' },
      { type: 'damper', x1: 1.5, y1: .8, x2: 4.6, y2: .8, label: 'c', color: 'muted' },
      { type: 'line', x1: 4.6, y1: .8, x2: 5, y2: 1.6, color: 'muted' },
      { type: 'ground', x1: 1.5, y1: .5, x2: 1.5, y2: 2 },
      { type: 'spring', x1: 5, y1: 3, x2: 5, y2: 2, label: 'ky', color: 'c2' },
      { type: 'ground', x1: 4.6, y1: 3, x2: 5.4, y2: 3 },
      { type: 'arrow', x1: 5.4, y1: 1.6, x2: 7, y2: 2.6, label: 'Fu (회전)', color: 'c3', double: false },
      { type: 'text', x: 7.5, y: .9, text: 'x: cos Ωt / y: sin Ωt' },
      { type: 'text', x: 6.1, y: .4, text: '두 방향에 공통 감쇠 c' },
    ] },
  ],
};
export const isotropic: FigureSpec = {
  id: 'fig-p4-2-4',
  caption: `그림 4. 등방 지지(kx = ky), 감쇠비 0.05, 3000 rpm, 편심 거리 10 µm의 정상상태 해다. 오빗 반지름은 ${fmt(um(V.isotropic.amplitudeForward), 4)} µm이며 정방향으로 돈다. 아래 X·Y 파형의 진폭은 같고 위상차는 90°이다. 한 방향에서 보던 불평형 응답을 두 방향으로 함께 보면 원이 된다. 화살표는 시간이 증가하는 방향이다.`,
  panels: [orbitPanel(V.isotropic, '등방: 정방향 원형 오빗'), { title: '한 회전 = 20 ms', series: [
    { x: sampleOrbit(V.isotropic).map(p => p.theta / speed(3000) * 1000), y: sampleOrbit(V.isotropic).map(p => um(p.x)), color: 'c1', label: 'X' },
    { x: sampleOrbit(V.isotropic).map(p => p.theta / speed(3000) * 1000), y: sampleOrbit(V.isotropic).map(p => um(p.y)), color: 'c2', label: 'Y' },
  ], x: { range: [0, 20], label: '시간 [ms]' }, y: { range: [-110, 110], label: '변위 [µm]' }, height: 130 }],
};
const rpm = grid(0, 7500, 1001);
const aniso = rpm.map(n => response(n, 1.3));
export const anisotropic: FigureSpec = {
  id: 'fig-p4-2-5',
  caption: `그림 5. 강성비 ky/kx = 1.3, 공통 감쇠 c(ζx = 0.05)인 로터다. 위의 3200 rpm 오빗은 시계 방향이며, X 진폭 ${fmt(um(V.anisotropic.amplitudeX), 4)} µm와 Y 진폭 ${fmt(um(V.anisotropic.amplitudeY), 4)} µm가 서로 다르다. 아래 점선은 Nx = 3000 rpm, Ny = ${fmt(V.anisotropic.omegaY * 30 / Math.PI, 5)} rpm이다. 감쇠가 없는 임계속도 기준이며 실제 진폭 피크는 조금 위에 나타난다.`,
  panels: [orbitPanel(V.anisotropic, '3200 rpm: 역방향 타원 오빗'), { title: '방향마다 다른 응답 피크', series: [{ x: rpm, y: aniso.map(r => um(r.amplitudeX)), color: 'c1', label: 'X' }, { x: rpm, y: aniso.map(r => um(r.amplitudeY)), color: 'c2', label: 'Y' }], annotations: [{ type: 'vline', x: 3000, color: 'c1', dash: true, label: 'Nx' }, { type: 'vline', x: V.anisotropic.omegaY * 30 / Math.PI, color: 'c2', dash: true, label: 'Ny' }], x: { range: [0, 7500], label: '회전수 [rpm]' }, y: { range: [0, 130], label: '진폭 [µm Peak]' }, height: 170 }],
};
export const components: FigureSpec = {
  id: 'fig-p4-2-6',
  caption: `그림 6. 그림 5의 타원을 반시계 원(파랑, 반지름 ${fmt(um(V.anisotropic.amplitudeForward), 4)} µm)과 시계 원(주황, ${fmt(um(V.anisotropic.amplitudeBackward), 4)} µm)의 합으로 나타냈다. 원들은 각각 원점 중심이며 실제 초록 오빗은 같은 시각의 두 벡터를 더한 결과다. 아래에서 주황이 파랑보다 높은 구간에만 역방향 선회가 나온다. 감쇠비 0.2로 키우면 3200 rpm에서 정방향 ${fmt(um(V.damped.amplitudeForward), 4)} µm, 역방향 ${fmt(um(V.damped.amplitudeBackward), 4)} µm로 우세가 바뀐다.`,
  panels: [orbitPanel(V.anisotropic, '타원 = 정방향 원 + 역방향 원', true), { title: '정방향과 역방향의 반지름 비교 (ζx = 0.05)', series: [{ x: rpm, y: aniso.map(r => um(r.amplitudeForward)), color: 'c1', label: '|Af| 정방향' }, { x: rpm, y: aniso.map(r => um(r.amplitudeBackward)), color: 'c2', label: '|Ab| 역방향' }], x: { range: [0, 7500], label: '회전수 [rpm]' }, y: { range: [0, 80], label: '반지름 [µm]' }, height: 170 }],
};
const selfSpeeds = grid(1500, 30000, 301);
const self = selfSpeeds.map(n => {
  const r = response(n); return { c: r.amplitudeX, g: Math.hypot(r.x.re + 10e-6, r.x.im) };
});
export const selfAlignment: FigureSpec = {
  id: 'fig-p4-2-7',
  caption: `그림 7. 등방 로터의 축 중심 C(파랑)와 질량중심 G(주황)가 정적 평형점 O에서 얼마나 떨어지는지 비교했다. G의 변위는 zC + e exp(jΩt)이다. 고속에서 C는 편심 거리 10 µm에 가까워지지만 G는 O에 가까워진다. 15000 rpm(속도비 5)에서는 C가 ${fmt(um(V.high.amplitudeX), 4)} µm, G가 ${fmt(um(Math.hypot(V.high.x.re + 10e-6, V.high.x.im)), 4)} µm이다. 진동이 완전히 없어지는 것이 아니라 축 중심이 질량중심 둘레로 도는 경향이다.`,
  panels: [{ series: [{ x: selfSpeeds, y: self.map(v => um(v.c)), color: 'c1', label: 'C 축 중심' }, { x: selfSpeeds, y: self.map(v => um(v.g)), color: 'c2', label: 'G 질량중심' }], annotations: [{ type: 'hline', y: 10, color: 'muted', dash: true, label: '편심 거리 10 µm' }], x: { range: [1500, 30000], label: '회전수 [rpm]' }, y: { range: [0, 110], label: 'O에서의 거리 [µm]' }, height: 210 }],
};
