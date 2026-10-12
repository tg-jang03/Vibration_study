import type { FigAnnotation, FigureSpec } from '../lib/figure';
type Card = { title: string; lines: string[] };
/** Original concept diagrams, never reproductions of standard tables. */
export function cards(id: string, caption: string, items: Card[]): FigureSpec {
  const rows = Math.ceil(items.length / 3);
  const annotations: FigAnnotation[] = [];
  items.forEach((card, index) => {
    const cx = 16.5 + (index % 3) * 33.5;
    const cy = (rows - Math.floor(index / 3) - .5) * 90;
    annotations.push({ type: 'rect', x1: cx - 15, x2: cx + 15, y1: cy - 34, y2: cy + 34, color: 'muted' });
    annotations.push({ type: 'text', x: cx, y: cy + 20, text: card.title, anchor: 'middle', bold: true, color: 'c1' });
    card.lines.forEach((text, j) => annotations.push({ type: 'text', x: cx, y: cy + 2 - j * 17, text, anchor: 'middle' }));
  });
  return { id, caption, panels: [{ frame: false, height: rows * 125, x: { range: [0, 100] }, y: { range: [0, rows * 90] }, series: [], annotations }] };
}
