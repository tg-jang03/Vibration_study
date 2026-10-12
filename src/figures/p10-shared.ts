/**
 * Part 10 그림 공용 도우미. 규격 표·도표를 옮기지 않은 자체 도식이다 (I-009).
 * 도식 패널은 frame: false, x·y 범위 [0, 100]을 기본으로 쓴다 (x 1단위 ≈ 8.2 px).
 */
import type { FigAnnotation, FigColor } from '../lib/figure';

/** 상자 (옅게 채운 사각형 + 테두리) */
export const box = (x1: number, x2: number, y1: number, y2: number, color: FigColor = 'muted'): FigAnnotation => ({ type: 'rect', x1, x2, y1, y2, color });

/** 여러 줄 글자: 첫 줄 y, 줄 간격 gap(y 단위). 첫 줄만 굵게 하려면 boldFirst */
export function lines(x: number, y: number, texts: string[], o: { gap?: number; anchor?: 'start' | 'middle' | 'end'; color?: FigColor; boldFirst?: boolean; bold?: boolean } = {}): FigAnnotation[] {
  const gap = o.gap ?? 6.5;
  return texts.map((text, i) => ({
    type: 'text' as const, x, y: y - i * gap, text, anchor: o.anchor ?? 'middle',
    bold: o.bold || (o.boldFirst && i === 0), color: !o.boldFirst || i === 0 ? o.color : undefined,
  }));
}

/** 한 방향 화살표 */
export const arrow = (x1: number, y1: number, x2: number, y2: number, label?: string, color: FigColor = 'muted', labelDx?: number, labelDy?: number): FigAnnotation => ({ type: 'arrow', x1, y1, x2, y2, label, color, labelDx, labelDy, double: false });

/** 판정 구간 색 (본문 그림·LAB-ISO-01 공통): A 초록 · B 회색 · C 황토 · D 진한 황토(두 번 칠함) */
export function zoneRects(limits: readonly [number, number, number], x1: number, x2: number, top: number, y0 = 0): FigAnnotation[] {
  const [ab, bc, cd] = limits;
  return [
    { type: 'rect', x1, x2, y1: y0, y2: ab, color: 'c3' },
    { type: 'rect', x1, x2, y1: ab, y2: bc, color: 'muted' },
    { type: 'rect', x1, x2, y1: bc, y2: cd, color: 'warn' },
    { type: 'rect', x1, x2, y1: cd, y2: top, color: 'warn' },
    { type: 'rect', x1, x2, y1: cd, y2: top, color: 'warn' },
  ];
}
