/**
 * 본문 예시 그림(정적 SVG)의 데이터 형식과 계산 도우미.
 * 그림은 빌드할 때 그려지므로 조작하지 않아도 바로 보인다 (D-026).
 * 그리기: src/components/content/Figure.astro, 그림 데이터: src/figures/*.ts
 * 도식(질량·스프링·감쇠기·벽·원판)은 frame: false 패널 + 도식 주석(line·spring·damper·ground·circle·rect·arrow). 예: src/figures/dev-schematic.ts
 */

export type FigColor = 'c1' | 'c2' | 'c3' | 'c4' | 'muted' | 'text' | 'warn' | 'accent';

export interface FigSeries {
  x: ArrayLike<number>;
  y: ArrayLike<number>;
  /** line 선, stem 세로 막대+점(스펙트럼), bar 막대, dots 점, step 계단, area 0까지 채운 면 */
  kind?: 'line' | 'stem' | 'bar' | 'dots' | 'step' | 'area';
  color?: FigColor;
  dash?: boolean;
  width?: number;
  /** 범례에 쓸 이름 */
  label?: string;
  /** bar 폭 (x축 단위) */
  barWidth?: number;
  /** dots·stem 점 반지름 (px) */
  radius?: number;
  opacity?: number;
}

export type FigAnnotation =
  | { type: 'text'; x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; color?: FigColor; dx?: number; dy?: number; bold?: boolean }
  | { type: 'hline'; y: number; label?: string; color?: FigColor; dash?: boolean; labelAt?: 'start' | 'end'; labelBelow?: boolean }
  | { type: 'vline'; x: number; label?: string; color?: FigColor; dash?: boolean }
  /** 치수 화살표. double이면 양쪽 화살촉 */
  | { type: 'arrow'; x1: number; y1: number; x2: number; y2: number; label?: string; color?: FigColor; double?: boolean; labelDx?: number; labelDy?: number }
  /** x 구간 음영 (패널 전체 높이) */
  | { type: 'band'; x1: number; x2: number; label?: string; color?: FigColor }
  | { type: 'rect'; x1: number; x2: number; y1: number; y2: number; label?: string; color?: FigColor }
  | { type: 'point'; x: number; y: number; label?: string; color?: FigColor; dx?: number; dy?: number }
  // ── 도식용 (질량-스프링 그림 등, 보통 frame: false 패널에서 쓴다) ──
  /** 선분 (막대·축·기준선). width [px] */
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; color?: FigColor; dash?: boolean; width?: number }
  /** 스프링 (지그재그). coils 지그재그 수, width 폭 [px]. 글자는 가로 스프링이면 위, 세로면 오른쪽 */
  | { type: 'spring'; x1: number; y1: number; x2: number; y2: number; coils?: number; width?: number; label?: string; color?: FigColor }
  /** 감쇠기 (대시포트: 통 + 피스톤). width 통 폭 [px] */
  | { type: 'damper'; x1: number; y1: number; x2: number; y2: number; width?: number; label?: string; color?: FigColor }
  /** 고정면 (벽·바닥): 선분 + 빗금. side는 (x1,y1)→(x2,y2) 진행 방향의 왼쪽/오른쪽 중 빗금 쪽 */
  | { type: 'ground'; x1: number; y1: number; x2: number; y2: number; side?: 'left' | 'right'; color?: FigColor }
  /** 원 (반지름 r [px]). fill이면 옅게 채움. 글자는 가운데 */
  | { type: 'circle'; x: number; y: number; r: number; fill?: boolean; dash?: boolean; label?: string; color?: FigColor };

export interface FigAxis {
  range: [number, number];
  label?: string;
  /** 눈금 위치. 생략하면 자동, 'none'이면 눈금 없음 */
  ticks?: number[] | 'none';
  /** 특정 눈금의 글자 바꾸기 (예: 1000 → 'f_s') */
  tickLabels?: { value: number; label: string }[];
}

export interface FigPanel {
  title?: string;
  series: FigSeries[];
  annotations?: FigAnnotation[];
  x: FigAxis;
  y: FigAxis;
  /** 패널 높이 (px, 기본 200) */
  height?: number;
  /** 범례 표시 (label이 있는 계열이 2개 이상이면 기본 표시) */
  legend?: boolean;
  /** false면 축·격자·눈금을 그리지 않는다 (도식 그림용). 기본 true */
  frame?: boolean;
}

export interface FigureSpec {
  /** 페이지 안에서 겹치지 않는 이름 (예: 'fig-0-1') */
  id: string;
  caption: string;
  panels: FigPanel[];
}

/** 사람이 읽기 좋은 눈금 (1, 2, 2.5, 5 × 10^k 간격) */
export function niceTicks(min: number, max: number, target = 5): number[] {
  if (!(max > min)) return [min];
  const raw = (max - min) / Math.max(1, target);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const start = Math.ceil(min / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : Number(v.toPrecision(12)));
  return ticks;
}

/** 값 → 화면 좌표 선형 변환 */
export function linearScale(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
  const k = (r1 - r0) / (d1 - d0);
  return (v) => r0 + (v - d0) * k;
}

/** 0부터 end까지 n개 점 (끝점 포함) */
export function grid(start: number, end: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => start + ((end - start) * i) / (n - 1));
}

/**
 * 그림 배치 상수 (Figure.astro와 공유). SVG 폭 900 중 그래프 영역은 ML ~ W−MR.
 * 패널 height는 680 폭 기준으로 적으므로 실제 높이는 height × HSCALE [px].
 */
export const FIG_LAYOUT = { W: 900, HSCALE: 1.2, ML: 62, MR: 18 } as const;
export const FIG_PLOT_WIDTH = FIG_LAYOUT.W - FIG_LAYOUT.ML - FIG_LAYOUT.MR;

/**
 * 도식 그림에서 x·y 축척을 같게 만드는 y 범위 (정사각형이 정사각형으로 보이게).
 * x 범위와 패널 height가 정해지면, y는 y0부터 같은 px/단위로 위로 잡는다.
 */
export function squareYRange(x: [number, number], height = 200, y0 = 0): [number, number] {
  const unitsPerPx = (x[1] - x[0]) / FIG_PLOT_WIDTH;
  return [y0, y0 + height * FIG_LAYOUT.HSCALE * unitsPerPx];
}

type Pt = [number, number];
type Seg = [number, number, number, number];

/** p1→p2 방향 단위벡터 u와, 화면에서 그 왼쪽을 가리키는 법선 n (y가 아래로 커지는 화면 좌표) */
function frameOf(p1: Pt, p2: Pt) {
  const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
  const u: Pt = [(p2[0] - p1[0]) / len, (p2[1] - p1[1]) / len];
  const n: Pt = [u[1], -u[0]];
  const at = (t: number, off = 0): Pt => [p1[0] + (p2[0] - p1[0]) * t + n[0] * off, p1[1] + (p2[1] - p1[1]) * t + n[1] * off];
  return { len, u, n, at };
}

/** 스프링 지그재그 꼭짓점 (화면 좌표). 양 끝 lead 비율은 곧은 선, 가운데 2·coils개 꼭짓점이 ±width/2로 번갈아 */
export function springPoints(p1: Pt, p2: Pt, coils = 6, width = 14, lead = 0.12): Pt[] {
  const { at } = frameOf(p1, p2);
  const pts: Pt[] = [p1, at(lead)];
  const m = 2 * coils;
  for (let i = 0; i < m; i++) pts.push(at(lead + ((i + 0.5) / m) * (1 - 2 * lead), (i % 2 === 0 ? 1 : -1) * (width / 2)));
  pts.push(at(1 - lead), p2);
  return pts;
}

/** 감쇠기(대시포트) 선분 목록 (화면 좌표): 막대 → 통(p2 쪽이 열린 ㄷ자) + 피스톤 → 막대 */
export function damperSegments(p1: Pt, p2: Pt, width = 16): Seg[] {
  const { at } = frameOf(p1, p2);
  const h = width / 2;
  const seg = (a: Pt, b: Pt): Seg => [a[0], a[1], b[0], b[1]];
  return [
    seg(p1, at(0.32)),
    seg(at(0.32, h), at(0.32, -h)),
    seg(at(0.32, h), at(0.68, h)),
    seg(at(0.32, -h), at(0.68, -h)),
    seg(at(0.52, h * 0.72), at(0.52, -h * 0.72)),
    seg(at(0.52), p2),
  ];
}

/** 고정면 빗금 선분 목록 (화면 좌표): 본선 + spacing 간격의 짧은 사선 */
export function groundSegments(p1: Pt, p2: Pt, side: 'left' | 'right' = 'left', spacing = 9, tick = 8): Seg[] {
  const { len, u, n } = frameOf(p1, p2);
  const s = side === 'left' ? 1 : -1;
  const segs: Seg[] = [[p1[0], p1[1], p2[0], p2[1]]];
  const count = Math.max(1, Math.floor(len / spacing));
  for (let i = 0; i <= count; i++) {
    const q: Pt = [p1[0] + u[0] * i * spacing, p1[1] + u[1] * i * spacing];
    // 빗금은 바깥쪽(side)으로, 진행 방향 뒤로 45° 기울인다
    const d: Pt = [(n[0] * s - u[0]) * tick * Math.SQRT1_2, (n[1] * s - u[1]) * tick * Math.SQRT1_2];
    if (i * spacing <= len + 1e-9) segs.push([q[0], q[1], q[0] + d[0], q[1] + d[1]]);
  }
  return segs;
}
