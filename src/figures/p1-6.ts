import { grid, squareYRange, type FigAnnotation, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { supportProperties, SUPPORT_EXAMPLE } from '../lib/machine/supportModel';

const X: [number, number] = [0, 10];
const PX = 82;
const text = (x: number, y: number, value: string): FigAnnotation => ({ type: 'text', x, y, text: value, anchor: 'middle' });
const panel = (title: string, annotations: FigAnnotation[], height = 140): FigPanel => ({ title, frame: false, height, x: { range: X }, y: { range: squareYRange(X, height) }, series: [], annotations });

export const machineRoles: FigureSpec = {
  id: 'fig-p1-6-1', caption: '그림 1. 위는 모터가 펌프를 돌리는 구성, 아래는 터빈이 발전기를 돌리는 구성입니다. 파란 상자는 회전력을 내는 쪽, 주황 상자는 그 회전력을 받아 일을 하는 쪽입니다. 발전기는 전기를 만드는 쪽이지 구동 모터가 아닙니다.',
  panels: [panel('기계의 역할과 에너지 흐름 (실제 크기 비율 아님)', [
    text(0.65, 1.6, '전기'),
    { type: 'rect', x1: 1.3, x2: 3.7, y1: 1.3, y2: 1.95, color: 'c1', label: '모터 · 구동기' },
    { type: 'arrow', x1: 3.8, y1: 1.6, x2: 5.9, y2: 1.6, label: '축 · 회전력', color: 'muted', double: false },
    { type: 'rect', x1: 6, x2: 8.4, y1: 1.3, y2: 1.95, color: 'c2', label: '펌프 · 피동기' },
    text(9.1, 1.6, '유체'),
    text(0.65, 0.5, '유체'),
    { type: 'rect', x1: 1.3, x2: 3.7, y1: 0.18, y2: 0.83, color: 'c1', label: '터빈 · 구동기' },
    { type: 'arrow', x1: 3.8, y1: 0.5, x2: 5.9, y2: 0.5, label: '축 · 회전력', color: 'muted', double: false },
    { type: 'rect', x1: 6, x2: 8.4, y1: 0.18, y2: 0.83, color: 'c2', label: '발전기' },
    text(9.1, 0.5, '전기'),
  ], 160)],
};

export const shaftCoupling: FigureSpec = {
  id: 'fig-p1-6-3', caption: '그림 3. 두 기계의 축을 커플링으로 이어 토크를 전달합니다. 아래 정면도에서 접선 방향 힘은 회전축 주위의 토크를 만들고, 반경 방향 힘은 축을 옆으로 미는 하중입니다. 두 화살표는 서로 다른 하중의 예이지 같은 힘의 분해가 아닙니다.',
  panels: [panel('옆모습: 회전부를 잇는 축계', [
    { type: 'rect', x1: 0.6, x2: 3.6, y1: 0.5, y2: 1.25, label: '모터 로터', color: 'c1' },
    { type: 'rect', x1: 6.4, x2: 9.4, y1: 0.5, y2: 1.25, label: '펌프 임펠러', color: 'c1' },
    { type: 'line', x1: 2.9, y1: 0.88, x2: 7.1, y2: 0.88, width: 7, color: 'c1' },
    { type: 'rect', x1: 4.5, x2: 5.5, y1: 0.42, y2: 1.33, color: 'c2' },
    text(5, 1.6, '커플링'), text(5, 0.15, '회전축을 따라 토크 전달'),
  ], 125), panel('축 정면: 토크와 반경 하중을 구분', [
    { type: 'circle', x: 3, y: 1, r: 0.58 * PX, color: 'c1' },
    { type: 'point', x: 3, y: 1, color: 'text' },
    { type: 'arrow', x1: 3.58, y1: 1, x2: 3.58, y2: 1.75, color: 'c2', label: '접선 힘 → 토크', double: false },
    { type: 'circle', x: 7, y: 1, r: 0.58 * PX, color: 'c1' },
    { type: 'arrow', x1: 7, y1: 1, x2: 8.3, y2: 1, color: 'warn', label: '반경 하중', double: false },
    text(3, 0.2, '축을 비틀어 돌림'), text(7, 0.2, '축을 옆으로 밀음'),
  ], 155)],
};

export const bearingWays: FigureSpec = {
  id: 'fig-p1-6-4', caption: '그림 4. 왼쪽은 볼이 두 고리 사이에서 하중을 전달하는 구름베어링, 오른쪽은 저널과 고정부 사이 유막이 하중을 받치는 베어링의 개념 단면입니다. 구름/유막은 방식의 분류이며 반경/추력은 별도로 하중 방향을 말합니다. 틈은 이해를 위해 크게 그렸습니다.',
  panels: [panel('구름요소로 받침 / 기름막으로 받침', [
    { type: 'circle', x: 2.5, y: 1.15, r: 0.88 * PX, color: 'muted' },
    { type: 'circle', x: 2.5, y: 1.15, r: 0.48 * PX, color: 'c1' },
    ...Array.from({ length: 8 }, (_, i): FigAnnotation => ({ type: 'circle', x: 2.5 + 0.68 * Math.cos(i * Math.PI / 4), y: 1.15 + 0.68 * Math.sin(i * Math.PI / 4), r: 0.16 * PX, color: 'c2', fill: true })),
    text(2.5, 1.15, '축'), text(2.5, 0.12, '구름베어링 · 볼의 접촉'),
    { type: 'circle', x: 7.5, y: 1.15, r: 0.88 * PX, color: 'muted' },
    { type: 'circle', x: 7.5, y: 1.02, r: 0.64 * PX, color: 'c1', fill: true, label: '저널' },
    text(7.5, 0.12, '유막 베어링 · 틈의 오일'),
    { type: 'arrow', x1: 7.5, y1: 0.3, x2: 7.5, y2: 0.7, color: 'c2', double: false },
    text(8.85, 0.55, '유막 지지'),
  ], 185)],
};

const stiffnessMN = grid(0.1, 10, 199);
const baseline = supportProperties(SUPPORT_EXAMPLE);
export const supportModel: FigureSpec = {
  id: 'fig-p1-6-7', caption: `그림 7. 한 질량과 무질량 직렬 스프링 3개의 교육용 예제입니다. 기본값에서 등가 강성은 ${formatNumber(baseline.stiffness / 1e6, 3)} MN/m, 고유진동수는 ${formatNumber(baseline.frequencyHz, 4)} Hz입니다. 지지만 단단하게 해도 축과 베어링의 변형은 남아 무한 강성이 되지 않습니다. 실제 두 베어링 축계의 배치를 그린 것은 아닙니다.`,
  panels: [panel('한 방향 직렬 예제: 연결부의 질량·회전 효과 무시', [
    { type: 'ground', x1: 0.5, y1: 0.2, x2: 0.5, y2: 1.5, side: 'left' },
    { type: 'spring', x1: 0.5, y1: 0.85, x2: 2.65, y2: 0.85, label: '지지 k_sup', color: 'c3' },
    { type: 'spring', x1: 2.65, y1: 0.85, x2: 4.85, y2: 0.85, label: '베어링 k_br', color: 'c2' },
    { type: 'spring', x1: 4.85, y1: 0.85, x2: 7.05, y2: 0.85, label: '축 k_sh', color: 'c1' },
    { type: 'rect', x1: 7.05, x2: 8.65, y1: 0.4, y2: 1.3, label: '질량 m', color: 'c1' },
    text(1.6, 0.35, '1 MN/m'), text(3.75, 0.35, '2 MN/m'), text(5.95, 0.35, '1 MN/m'), text(7.85, 0.17, '100 kg'),
  ], 125), {
    title: '지지 강성만 변화시킨 고유진동수', height: 160,
    x: { range: [0, 10], label: '지지 강성 [MN/m]' }, y: { range: [0, 14], label: 'fₙ [Hz]' },
    series: [
      { x: stiffnessMN, y: stiffnessMN.map((k) => supportProperties({ ...SUPPORT_EXAMPLE, supportStiffness: k * 1e6 }).frequencyHz), color: 'c1', label: '직렬 예제' },
      { x: [0, 10], y: [baseline.rigidSupportFrequencyHz, baseline.rigidSupportFrequencyHz], color: 'c2', dash: true, label: '지지 강성 무한대 극한' },
      { x: [1], y: [baseline.frequencyHz], kind: 'dots', color: 'c3', radius: 5, label: '기본값' },
    ],
  }],
};
