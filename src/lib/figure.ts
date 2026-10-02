/**
 * 본문 예시 그림(정적 SVG)의 데이터 형식과 계산 도우미.
 * 그림은 빌드할 때 그려지므로 조작하지 않아도 바로 보인다 (D-026).
 * 그리기: src/components/content/Figure.astro, 그림 데이터: src/figures/*.ts
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
  | { type: 'point'; x: number; y: number; label?: string; color?: FigColor; dx?: number; dy?: number };

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
