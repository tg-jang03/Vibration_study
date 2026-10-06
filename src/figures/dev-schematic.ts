/**
 * 도식 그림 예시 (개발용, /dev/figures/ 갤러리 전용). Part 0 질량-스프링 그림을 그릴 때 따라 쓰는 견본이다.
 * - 도식 패널: frame: false + squareYRange로 x·y 축척을 같게 → 원은 원으로, 정사각형은 정사각형으로 보인다.
 * - 도형: ground(벽·바닥) · spring · damper · rect(질량) · arrow(힘·변위) · line(기준선) · circle(원판) · point · text.
 * - 실제 페이지 그림의 응답 데이터는 lib/mck(M2.1)로 계산한다. 여기서는 견본이라 감쇠 자유진동 식을 직접 쓴다.
 */
import { grid, squareYRange, type FigureSpec } from '../lib/figure';

const X: [number, number] = [0, 10];

// 감쇠 자유진동 x(t) = x₀ e^(−ζω_n t) cos(ω_d t) (v₀ = 0일 때 sin 항은 작아 견본에서는 생략)
const FN = 2;
const ZETA = 0.05;
const WN = 2 * Math.PI * FN;
const WD = WN * Math.sqrt(1 - ZETA ** 2);
const T = grid(0, 3, 601);
const env = T.map((t) => Math.exp(-ZETA * WN * t));
const resp = T.map((t, i) => env[i] * Math.cos(WD * t));

const unb = { x: 7.3, y: 0.85, r: 0.62, angle: Math.PI / 4 };
const ux = unb.x + 0.42 * Math.cos(unb.angle);
const uy = unb.y + 0.42 * Math.sin(unb.angle);

export const massSpringSchematic: FigureSpec = {
  id: 'fig-dev-schematic-1',
  caption:
    '도식 예. 위: 벽(빗금) – 스프링 k · 감쇠기 c – 질량 m, 바닥, 변위 x의 방향(화살표). 가운데: 같은 계를 당겼다 놓았을 때의 x(t)와 포락선(점선). 아래: 도는 원판과 불평형 질량(점), 원심력 화살표.',
  panels: [
    {
      title: '1자유도 질량-스프링-감쇠기',
      frame: false,
      height: 110,
      x: { range: X },
      y: { range: squareYRange(X, 110) },
      series: [],
      annotations: [
        { type: 'ground', x1: 0.8, y1: 0.12, x2: 0.8, y2: 1.5, side: 'left' },
        { type: 'ground', x1: 0.8, y1: 0.12, x2: 7.2, y2: 0.12, side: 'right' },
        { type: 'spring', x1: 0.8, y1: 1.06, x2: 4.2, y2: 1.06, coils: 7, label: 'k' },
        { type: 'damper', x1: 0.8, y1: 0.48, x2: 4.2, y2: 0.48, label: 'c' },
        { type: 'rect', x1: 4.2, x2: 5.6, y1: 0.16, y2: 1.36, label: 'm', color: 'c1' },
        { type: 'line', x1: 4.9, y1: 1.36, x2: 4.9, y2: 1.56, color: 'muted', dash: true },
        { type: 'arrow', x1: 4.9, y1: 1.5, x2: 6.3, y2: 1.5, double: false, label: 'x (오른쪽이 +)', color: 'c2' },
      ],
    },
    {
      title: '당겼다 놓은 뒤의 변위 x(t)',
      height: 140,
      x: { range: [0, 3], label: '시간 [s]' },
      y: { range: [-1.15, 1.15], label: 'x / x₀' },
      series: [
        { x: T, y: resp, color: 'c1', label: 'x(t)' },
        { x: T, y: env, color: 'muted', dash: true, width: 1.4, label: '포락선 e^(−ζω_n t)' },
        { x: T, y: env.map((v) => -v), color: 'muted', dash: true, width: 1.4 },
      ],
    },
    {
      title: '도는 원판과 불평형',
      frame: false,
      height: 100,
      x: { range: X },
      y: { range: squareYRange(X, 100) },
      series: [],
      annotations: [
        { type: 'circle', x: unb.x, y: unb.y, r: unb.r * (820 / 10), fill: true, color: 'c1' },
        { type: 'point', x: unb.x, y: unb.y, color: 'text' },
        { type: 'point', x: ux, y: uy, color: 'warn', label: 'm_u', dx: -30, dy: -6 },
        { type: 'arrow', x1: ux, y1: uy, x2: ux + 0.8, y2: uy + 0.18, double: false, color: 'warn', label: '원심력 m_u e Ω²' },
        { type: 'text', x: unb.x - 0.95, y: unb.y - 0.05, text: '회전 Ω', anchor: 'end', color: 'muted' },
      ],
    },
  ],
};
