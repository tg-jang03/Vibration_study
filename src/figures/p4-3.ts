import { grid, squareYRange, type FigPanel, type FigureSpec } from '../lib/figure';
import { PROBE } from '../lib/proximity';
import { journalEquilibrium, measureCenterline, shortBearingPressure, P43_BEARING as B, P43_EXAMPLE as E, type Point } from '../lib/rotor/journalBearing';
const um = (v: number) => v * 1e6;
const deg = (v: number) => v * 180 / Math.PI;
const state = (rpm: number, load = E.load) => journalEquilibrium(B, load, rpm * Math.PI / 30, E.viscosity);
const normal = state(3000);
export const P43_VALUES = {
  normal, light: state(3000, 500), slow: state(1000), fast: state(6000),
  measured: measureCenterline(B, normal, { coldGap: E.coldGap }),
  noCold: measureCenterline(B, normal, { coldGap: E.coldGap, useColdPosition: false }),
  drift: measureCenterline(B, normal, { coldGap: E.coldGap, driftA: .5 }),
  invalid: measureCenterline(B, normal, { coldGap: .3e-3 }),
};
const th = grid(0, 2 * Math.PI, 161), speeds = grid(0, 6000, 121), points = speeds.map(n => state(n));
function circle(p: Point, r: number) { return { x: th.map(t => p.x + r * Math.cos(t)), y: th.map(t => p.y + r * Math.sin(t)) }; }
function centerPanel(title: string, measured?: Point, orbit = false): FigPanel {
  const xr: [number, number] = [-300, 300], yr = squareYRange(xr, 300); yr[0] = -yr[1] / 2; yr[1] = -yr[0];
  return { title, height: 300, x: { range: xr, label: 'X [µm]' }, y: { range: yr, label: 'Y [µm]' },
    series: [
      { ...circle({ x: 0, y: 0 }, 100), color: 'muted', dash: true, label: '중심 이동 한계 Cr' },
      { x: points.map(p => um(p.x)), y: points.map(p => um(p.y)), color: 'c1', label: '회전수별 평균 위치' },
      ...(orbit ? [{ ...circle({ x: um(normal.x), y: um(normal.y) }, 8), color: 'c3' as const, label: '한 회전 오빗 (설명용)' }] : []),
    ], annotations: [
      { type: 'point', x: 0, y: -100, label: '냉간 (0, −100)', dx: -12, dy: 17, color: 'muted' },
      // 글자는 점의 왼쪽(Cr 원 안쪽)에 두어 점선 원과 겹치지 않게 한다
      { type: 'point', x: um(normal.x), y: um(normal.y), label: '3000 rpm 평균', dx: -88, dy: 4, color: 'c1' },
      ...(measured ? [{ type: 'point' as const, x: um(measured.x), y: um(measured.y), label: '전압에서 복원', dx: -88, dy: -12, color: 'c2' as const }, { type: 'arrow' as const, double: false, x1: um(normal.x), y1: um(normal.y), x2: um(measured.x), y2: um(measured.y), color: 'c2' as const }] : []),
      { type: 'text', x: -280, y: 112, text: '자전 ↺ · +Y 위', color: 'muted' },
    ] };
}
const theta = grid(0, 2 * Math.PI, 241);
export const oilWedge: FigureSpec = {
  id: 'fig-p4-3-1',
  caption: '그림 1. 원통 간극을 둘레 방향으로 펼쳤다. θ는 최대 간극에서 자전 방향으로 잰 각도이다. 앞 반원에서 간극이 좁아지고 압력이 생긴다. 아래 압력은 짧은 베어링 모델의 길이 중앙 값이며, 벌어지는 반원의 압력은 0으로 놓았다. 공급 압력으로 축을 들어 올리는 정압 지지와 구분한다.',
  panels: [
    { title: '회전으로 유체를 좁아지는 간극에 끌고 갑니다', height: 170, x: { range: [0, 360], label: 'θ [°]', ticks: [0, 90, 180, 270, 360] }, y: { range: [0, 180], label: '유막 두께 [µm]' }, series: [{ x: theta.map(deg), y: theta.map(t => 100 * (1 + normal.eccentricityRatio * Math.cos(t))), color: 'c1' }], annotations: [{ type: 'band', x1: 0, x2: 180, label: '수렴 간극', color: 'c1' }, { type: 'point', x: 180, y: um(normal.minimumFilm), label: 'hmin = 32.42 µm', dx: 12, dy: 18, color: 'c2' }] },
    { title: '양압 반원의 압력이 하중을 지지합니다', height: 170, x: { range: [0, 360], label: 'θ [°]', ticks: [0, 90, 180, 270, 360] }, y: { range: [0, 2], label: '길이 중앙 압력 [MPa]' }, series: [{ x: theta.map(deg), y: theta.map(t => shortBearingPressure(B, normal.eccentricityRatio, E.omega, E.viscosity, t, 0) / 1e6), color: 'c3', kind: 'area' }] },
  ],
};
const xgeom: [number, number] = [-10, 10]; const g = { x: normal.x / B.radialClearance, y: normal.y / B.radialClearance };
export const clearance: FigureSpec = {
  id: 'fig-p4-3-2',
  caption: '그림 2. 베어링 중심 O와 저널 중심 C 사이가 편심 거리 e이다. Cr는 두 반지름의 차(회색 점선 = 동심 위치의 저널과 베어링 사이), 지름 간극은 2Cr이다. 아래 하중선에서 OC까지 잰 자세각 φ를 쓴다. Cr = 100 µm일 때 ε = 0.6758이면 e = 67.58 µm, 최소 유막은 32.42 µm이다. 형상 간극은 이해를 위해 크게 그렸다.',
  panels: [{ frame: false, height: 300, x: { range: xgeom }, y: { range: squareYRange(xgeom, 300, -4) }, series: [{ ...circle({ x: 0, y: 0 }, 3), color: 'muted' }, { ...circle({ x: 0, y: 0 }, 2), color: 'muted', dash: true }, { ...circle(g, 2), color: 'c1' }, { x: grid(-Math.PI/2, -Math.PI/2+normal.attitude,31).map(t=>.8*Math.cos(t)), y: grid(-Math.PI/2, -Math.PI/2+normal.attitude,31).map(t=>.8*Math.sin(t)), color: 'c2' }], annotations: [
    { type: 'point', x: 0, y: 0, label: 'O', dx: -18, dy: -12, color: 'muted' }, { type: 'point', ...g, label: 'C', dx: 12, dy: 10, color: 'c1' },
    { type: 'arrow', double: false, x1: 0, y1: 0, x2: g.x, y2: g.y, color: 'c2' },
    { type: 'line', x1: 0, y1: 0, x2: 0, y2: -3.1, color: 'muted', dash: true },
    { type: 'arrow', double: false, x1: g.x, y1: g.y - .5, x2: g.x, y2: g.y - 1.8, label: 'W ↓', color: 'c3' },
    { type: 'arrow', x1: 0, y1: 2, x2: 0, y2: 3, double: true, label: 'Cr', labelDx: -25, color: 'c2' },
    {type:'arrow',double:true,x1:g.x+2*g.x/normal.eccentricityRatio,y1:g.y+2*g.y/normal.eccentricityRatio,x2:3*g.x/normal.eccentricityRatio,y2:3*g.y/normal.eccentricityRatio,label:'hmin',labelDx:30,labelDy:12,color:'c3'},
    {type:'text',x:.3,y:-1.2,text:'φ',color:'c2'},
    { type: 'text', x: 3.1, y: 1.8, text: 'ε = e/Cr', color: 'c2' }, { type: 'text', x: 3.1, y: .7, text: 'φ = 40.59° (하중선 ↔ OC)', color: 'c2' }, { type: 'text', x: 3.1, y: -.6, text: 'hmin = Cr − e', color: 'c3' },
  ] }],
};
export const equilibrium: FigureSpec = {
  id: 'fig-p4-3-3', caption: '그림 3. 같은 간극과 점성계수에서 회전수가 오르면 편심률은 줄고 자세각은 커진다. 하중 500 N의 3000 rpm 위치는 하중 1000 N의 6000 rpm 위치와 같다. 하중·점성계수·회전수의 조합으로 정적 위치가 정해지므로 한 점만으로 원인을 단정할 수 없다.',
  panels: [
    { title: '편심률: 중심에서 얼마나 떨어졌나', height: 180, x: { range: [0, 6000], label: '회전수 [rpm]' }, y: { range: [0, 1], label: 'ε' }, series: [{ x: speeds, y: points.map(p => p.eccentricityRatio), color: 'c1', label: 'W = 1000 N' }, { x: speeds, y: speeds.map(n => state(n, 500).eccentricityRatio), color: 'c2', label: 'W = 500 N' }] },
    { title: '자세각: 어느 방향으로 치우쳤나', height: 180, x: { range: [0, 6000], label: '회전수 [rpm]' }, y: { range: [0, 70], label: 'φ [°]' }, series: [{ x: speeds.slice(1), y: points.slice(1).map(p => deg(p.attitude)), color: 'c1', label: 'W = 1000 N' }, { x: speeds.slice(1), y: speeds.slice(1).map(n => deg(state(n, 500).attitude)), color: 'c2', label: 'W = 500 N' }] },
  ],
};
export const centerline: FigureSpec = {
  id: 'fig-p4-3-4', caption: '그림 4. 파란 경로는 각 회전수의 평균 축 위치를 이은 Shaft centerline이다. 초록 작은 원은 3000 rpm 평균점 둘레에서 한 회전 동안 진동하는 오빗의 설명용 그림이며, 이 정적 모델이 계산한 진동이 아니다. 바깥 점선은 반경 Cr의 중심 이동 한계이고 베어링 내경 원이 아니다. X·Y는 같은 축척이다.', panels: [centerPanel('평균 위치의 경로와 평균점 둘레의 오빗', undefined, true)],
};
const probeX: [number, number] = [-10, 10];
export const probes: FigureSpec = {
  id: 'fig-p4-3-5', caption: '그림 5. 위쪽 두 프로브의 법선은 +X에서 A 45°, B 135°이다. A·B 전압 변화는 각 법선에 투영된 이동량이므로 좌표를 변환해야 한다. 냉간 전압을 빼고 감도로 나눈 뒤, 냉간 축 위치 (0, −Cr)를 더하면 베어링 중심 기준의 X·Y가 된다. 회색 원은 축 단면이 아니라 축 중심이 움직일 수 있는 한계(반경 Cr)이고, 점은 축 중심의 냉간 위치다. 센서 설치 gap 1.20 mm는 베어링 반경 간극 0.10 mm와 다른 길이다.',
  panels: [{ frame: false, height: 300, x: { range: probeX }, y: { range: squareYRange(probeX, 300, -3.5) }, series: [{ ...circle({ x: 0, y: 0 }, 1.5), color: 'muted' }], annotations: [
    { type: 'line', x1: -2, y1: 0, x2: 2, y2: 0, color: 'muted', dash: true }, { type: 'line', x1: 0, y1: -2, x2: 0, y2: 2, color: 'muted', dash: true },
    { type: 'arrow', double: false, x1: 0, y1: 0, x2: 2, y2: 2, color: 'c1' }, { type: 'text', x: 2.2, y: 2.25, text: 'A 45°', color: 'c1' },
    { type: 'arrow', double: false, x1: 0, y1: 0, x2: -2, y2: 2, color: 'c2' }, { type: 'text', x: -2.2, y: 2.25, text: 'B 135°', anchor: 'end', color: 'c2' },
    { type: 'point', x: 0, y: -1.5, label: '냉간 축 중심 (0, −Cr)', dx: 12, dy: 14, color: 'muted' },
    { type: 'text', x: -1.6, y: -1.7, text: '중심 이동 한계 Cr', anchor: 'end', color: 'muted' },
    { type: 'text', x: 3, y: 1.6, text: '접근 → gap 감소 → V가 덜 음수', color: 'c1' },
    { type: 'text', x: 3, y: .4, text: 'ΔVA/S = (Δx + Δy)/√2', color: 'c1' },
    { type: 'text', x: 3, y: -.8, text: 'ΔVB/S = (−Δx + Δy)/√2', color: 'c2' },
    { type: 'text', x: 3, y: -2, text: `S = ${(PROBE.sensitivity / 1000).toFixed(3)} V/mm`, color: 'muted' },
  ] }],
};
export const referenceErrors: FigureSpec = {
  id: 'fig-p4-3-6', caption: '그림 6. 파란 모델 평형점은 두 패널에서 같다. 냉간 축 위치를 빠뜨리면 주황 점이 위로 Cr = 100 µm 이동한다. A에만 +0.5 V 드리프트를 더하면 A 법선 방향으로 63.5 µm 이동한다. 이 두 경우의 위치 변화는 기준·드리프트 때문에 생긴 측정 변화이며, 유막 평형은 그대로다. X·Y 같은 축척이며 프로브는 선형 범위이다.',
  panels: [centerPanel('냉간 좌표를 더하지 않음', P43_VALUES.noCold.reconstructed!), centerPanel('냉간 기록 후 A에 +0.5 V 추가', P43_VALUES.drift.reconstructed!)],
};
export const coefficients: FigureSpec = {
  id: 'fig-p4-3-7', caption: '그림 7. 평형점에서 X로 조금 움직이거나 X 방향 속도가 생겼을 때 유막의 힘은 X와 Y에 모두 나타날 수 있다. Y 변화도 두 힘을 만든다. 그림의 화살표는 두 성분의 분해를 설명하며 실제 계수의 크기나 부호를 뜻하지 않는다. 첫 첨자는 힘 방향, 둘째 첨자는 변위 또는 속도 방향이다.',
  panels: [{ frame: false, height: 200, x: { range: [0, 10] }, y: { range: squareYRange([0, 10], 200) }, series: [], annotations: [
    { type: 'point', x: 2, y: 1, label: '평형점', color: 'muted', dx: -40, dy: 18 },
    { type: 'arrow', double: false, x1: 2, y1: 1, x2: 3.5, y2: 1, label: 'δx 또는 δẋ', color: 'c1', labelDy: 22 },
    { type: 'arrow', double: false, x1: 5, y1: 1, x2: 3.5, y2: 1, label: 'δFx: −kxxδx−cxxδẋ', color: 'c2', labelDy: 22 },
    { type: 'arrow', double: false, x1: 3.5, y1: 1, x2: 3.5, y2: 2.5, label: 'δFy: kyx, cyx', color: 'c3', labelDx: 75 },
    { type: 'text', x: 6, y: 2.2, text: 'δy → kxy, kyy', color: 'muted' }, { type: 'text', x: 6, y: 1.1, text: 'δẏ → cxy, cyy', color: 'muted' },
  ] }],
};
