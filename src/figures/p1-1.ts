/** P1-1 "진동이란" 본문 그림. 수치는 lib/mck 해석해에서 계산한다. */
import { grid, squareYRange, type FigAnnotation, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { freeResponse, sdofProperties } from '../lib/mck';

const SYSTEM = { mass: 1, stiffness: 1000 };
const X0 = 0.01;
const PROPS = sdofProperties(SYSTEM);
const T = grid(0, 2 * PROPS.period, 601);
const RESPONSE = freeResponse(SYSTEM, { x0: X0 }, T);

export const P0_1_REFERENCE = {
  frequencyHz: PROPS.frequencyHz,
  period: PROPS.period,
  equilibriumSpeed: PROPS.omegaN * X0,
} as const;

const rulerSegments = (deflected: boolean): FigAnnotation[] => {
  const points = grid(0, 1, 14).map((u) => ({
    x: 1.2 + 6.2 * u,
    y: deflected ? 0.85 - 0.55 * u ** 2 : 0.85,
  }));
  return points.slice(1).map((p, i) => ({
    type: 'line' as const,
    x1: points[i].x,
    y1: points[i].y,
    x2: p.x,
    y2: p.y,
    color: deflected ? ('c1' as const) : ('muted' as const),
    dash: !deflected,
    width: deflected ? 4 : 2,
  }));
};

export const rulerQuestion: FigureSpec = {
  id: 'fig-p1-1-1',
  caption:
    '그림 1. 책상 끝에 눌러 둔 자를 아래로 당긴 순간. 왼쪽 빗금은 자를 붙잡아 둔 곳(책상 끝과 누르는 손)이다. 회색 점선은 힘이 균형을 이루는 원래 자리이고, 파랑 선은 당겨진 자다. 손을 놓으면 자는 원래 자리 쪽으로 움직이지만 거기서 바로 멈추지 않는다.',
  panels: [
    {
      title: '당겼다가 손을 놓기 직전',
      frame: false,
      height: 130,
      x: { range: [0, 10] },
      y: { range: squareYRange([0, 10], 130) },
      series: [],
      annotations: [
        { type: 'ground', x1: 1.1, y1: 0.2, x2: 1.1, y2: 1.55, side: 'left' },
        ...rulerSegments(false),
        ...rulerSegments(true),
        { type: 'arrow', x1: 7.4, y1: 0.3, x2: 7.4, y2: 0.05, double: false, label: '당김', color: 'c2' },
        { type: 'text', x: 5.1, y: 1.05, text: '평형 위치', color: 'muted' },
      ],
    },
  ],
};

export const equilibriumAndRestoringForce: FigureSpec = {
  id: 'fig-p1-1-2',
  caption:
    '그림 2. 위: 질량이 평형 위치에 있으면 스프링이 되돌리려는 힘은 0이다. 아래: 질량을 오른쪽으로 x만큼 옮기면 스프링은 왼쪽으로 F = −kx의 복원력을 낸다. 마이너스 부호는 힘이 변위와 반대 방향이라는 뜻이다.',
  panels: [
    {
      title: '평형: x = 0, 복원력 = 0',
      frame: false,
      height: 90,
      x: { range: [0, 10] },
      y: { range: squareYRange([0, 10], 90) },
      series: [],
      annotations: [
        { type: 'ground', x1: 0.9, y1: 0.15, x2: 0.9, y2: 1.2, side: 'left' },
        { type: 'spring', x1: 0.9, y1: 0.68, x2: 4.5, y2: 0.68, coils: 7, label: 'k' },
        { type: 'rect', x1: 4.5, x2: 5.9, y1: 0.18, y2: 1.18, label: 'm', color: 'c1' },
        // 평형 점선은 질량 위·아래로만 그려 'm' 글자를 가리지 않게 한다
        { type: 'line', x1: 5.2, y1: 0.02, x2: 5.2, y2: 0.18, dash: true, color: 'muted' },
        { type: 'line', x1: 5.2, y1: 1.18, x2: 5.2, y2: 1.3, dash: true, color: 'muted' },
        { type: 'text', x: 5.2, y: 1.42, text: '평형', anchor: 'middle', color: 'muted' },
      ],
    },
    {
      title: '오른쪽으로 당김: x > 0, 복원력은 왼쪽',
      frame: false,
      height: 115,
      x: { range: [0, 10] },
      y: { range: squareYRange([0, 10], 115) },
      series: [],
      annotations: [
        { type: 'ground', x1: 0.9, y1: 0.15, x2: 0.9, y2: 1.2, side: 'left' },
        { type: 'spring', x1: 0.9, y1: 0.68, x2: 6.2, y2: 0.68, coils: 9, label: '늘어난 스프링 k' },
        { type: 'rect', x1: 6.2, x2: 7.6, y1: 0.18, y2: 1.18, label: 'm', color: 'c1' },
        { type: 'line', x1: 5.2, y1: 0.02, x2: 5.2, y2: 1.2, dash: true, color: 'muted' },
        // 변위는 질량 아래, 복원력은 질량 위에서 왼쪽으로 (스프링·점선과 겹치지 않게)
        { type: 'arrow', x1: 5.2, y1: 0.07, x2: 6.9, y2: 0.07, label: '변위 x', color: 'c3', labelDx: -28 },
        { type: 'arrow', x1: 6.9, y1: 1.32, x2: 5.3, y2: 1.32, double: false, label: '복원력 F = −kx', color: 'c2' },
      ],
    },
  ],
};

export const oneCycle: FigureSpec = {
  id: 'fig-p1-1-3',
  caption: `그림 3. 질량 1 kg, 강성 1000 N/m인 계를 10 mm 당겼다 놓은 한 주기. 끝점(+10 mm, −10 mm)에서는 방향을 바꾸느라 잠깐 멈추고, 평형점(x = 0)을 지날 때 가장 빠르다. 같은 상태로 돌아오는 데 걸린 시간 T는 ${formatNumber(PROPS.period, 4)} s다.`,
  panels: [
    {
      series: [{ x: T, y: RESPONSE.map((s) => 1000 * s.x), width: 2.4 }],
      annotations: [
        { type: 'point', x: 0, y: 10, label: '끝점: 멈춤', dx: 12, dy: -12, color: 'warn' },
        { type: 'point', x: PROPS.period / 4, y: 0, label: '평형점: 가장 빠름', dx: 12, dy: -12, color: 'c4' },
        { type: 'point', x: PROPS.period / 2, y: -10, label: '반대쪽 끝점', dx: 12, dy: 18, color: 'warn' },
        { type: 'arrow', x1: 0, y1: 13, x2: PROPS.period, y2: 13, label: `주기 T = ${formatNumber(PROPS.period, 4)} s`, color: 'c3' },
      ],
      x: { range: [0, 2 * PROPS.period], label: '시간 t [s]' },
      y: { range: [-15, 15], ticks: [-10, 0, 10], label: '변위 x [mm]' },
      height: 220,
    },
  ],
};

const phase = T.map((t) => PROPS.omegaN * t);
export const energyExchange: FigureSpec = {
  id: 'fig-p1-1-4',
  caption:
    '그림 4. 감쇠가 없는 한 주기 동안 에너지가 머무는 곳. 끝점에서는 움직임이 멈춰 스프링에 에너지가 모두 저장되고, 평형점에서는 스프링이 원래 길이로 돌아와 질량의 움직임에 에너지가 모두 있다. 두 에너지의 합(회색 점선)은 일정하다.',
  panels: [
    {
      series: [
        { x: T, y: phase.map((p) => Math.cos(p) ** 2), label: '스프링에 저장', color: 'c1', width: 2.2 },
        { x: T, y: phase.map((p) => Math.sin(p) ** 2), label: '질량의 움직임', color: 'c2', width: 2.2 },
        { x: T, y: T.map(() => 1), label: '합계', color: 'muted', dash: true, width: 1.5 },
      ],
      annotations: [
        { type: 'vline', x: 0, label: '끝점' },
        { type: 'vline', x: PROPS.period / 4, label: '평형점' },
        { type: 'vline', x: PROPS.period / 2, label: '끝점' },
      ],
      x: { range: [0, PROPS.period], label: '한 주기 안의 시간 [s]' },
      y: { range: [-0.08, 1.15], ticks: [0, 0.5, 1], label: '전체 에너지에 대한 비율' },
      height: 190,
    },
  ],
};

export const modelMap: FigureSpec = {
  id: 'fig-p1-1-5',
  caption:
    '그림 5. 책상 끝의 자, 그네, 기초 위의 기계는 생김새가 다르지만 같은 두 질문으로 단순화할 수 있다. 무엇이 움직이는 질량인가? 무엇이 원래 자리로 되돌리는 힘을 만드는가? 오른쪽 끝은 기초 위 기계를 예로 그 답을 질량 m과 스프링 k로 바꿔 그린 모델이다. 세 물체 각각에서 무엇이 m과 k인지는 아래 표에 정리했다.',
  panels: [
    {
      frame: false,
      height: 125,
      x: { range: [0, 10] },
      y: { range: squareYRange([0, 10], 125) },
      series: [],
      annotations: [
        { type: 'rect', x1: 0.5, x2: 2.4, y1: 0.45, y2: 1.25, label: '책상 끝의 자', color: 'c2' },
        { type: 'rect', x1: 3.1, x2: 5, y1: 0.45, y2: 1.25, label: '그네', color: 'c3' },
        { type: 'rect', x1: 5.7, x2: 7.6, y1: 0.45, y2: 1.25, label: '기초 위 기계', color: 'c4' },
        { type: 'arrow', x1: 7.7, y1: 0.85, x2: 8.45, y2: 0.85, double: false, color: 'muted' },
        { type: 'spring', x1: 8.45, y1: 0.85, x2: 9.1, y2: 0.85, coils: 4, label: 'k' },
        { type: 'rect', x1: 9.1, x2: 9.8, y1: 0.5, y2: 1.2, label: 'm', color: 'c1' },
        { type: 'text', x: 4.05, y: 1.55, text: '모양은 달라도: 관성 m + 복원력 k', anchor: 'middle', color: 'text', bold: true },
      ],
    },
  ],
};
