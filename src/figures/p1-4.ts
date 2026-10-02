/**
 * P1-4 "윈도우" 본문 그림 데이터 (빌드 시 계산, D-026).
 */
import { grid, type FigPanel, type FigureSpec } from '../lib/figure';

// 그림 1 — FFT는 프레임이 계속 되풀이된다고 본다: 끝과 시작이 이어지나?
function framePanel(cycles: number, title: string, last: boolean): FigPanel {
  const t = grid(0, 1, 600);
  const x = t.map((tt) => Math.sin(2 * Math.PI * cycles * tt));
  return {
    title,
    series: [
      { x: t, y: x, color: 'c1', width: 2.2, label: '잰 프레임 (1초)' },
      { x: t.map((tt) => tt + 1), y: x, color: 'muted', dash: true, width: 1.8, label: 'FFT가 가정하는 다음 반복' },
    ],
    annotations: [
      { type: 'vline', x: 1, label: '프레임 경계', color: 'warn', dash: true },
      ...(Number.isInteger(cycles)
        ? []
        : [{ type: 'arrow' as const, x1: 1.06, y1: Math.sin(2 * Math.PI * cycles), x2: 1.06, y2: 0, double: true, label: '끊김(불연속)', color: 'warn' as const }]),
    ],
    x: last ? { range: [0, 2], ticks: [0, 0.5, 1, 1.5, 2], label: '시간 [s]' } : { range: [0, 2], ticks: 'none' },
    y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
    height: last ? 130 : 115,
    legend: !last,
  };
}
export const frameEnds: FigureSpec = {
  id: 'fig-4-1',
  caption:
    '그림 1. FFT는 잰 1초 프레임이 앞뒤로 똑같이 되풀이된다고 보고 계산한다(점선). 위: 프레임 안에 정확히 3주기가 들어가면 끝과 다음 시작이 매끄럽게 이어져, 에너지가 3 Hz bin 하나에 모인다. 아래: 3.5주기면 프레임 경계에서 신호가 뚝 끊긴다. 이 끊김을 만들려면 여러 주파수가 필요하므로, 에너지가 주변 bin들로 새어 나간다 — 누설이다.',
  panels: [framePanel(3, '3.0주기: 끝과 시작이 이어진다', false), framePanel(3.5, '3.5주기: 경계에서 끊긴다', true)],
};
