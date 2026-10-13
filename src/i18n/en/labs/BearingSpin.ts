import type { Dict } from '../../translate';

const EN: Dict = {
  "외륜": 'outer-race',
  "내륜": 'inner-race',
  "볼": 'ball',
  "케이지": 'cage',
  "외륜은 멈춰 있고 결함은 아래 하중대에 있습니다. 볼 {0}개를 실은 케이지가 축 한 바퀴에 {1}바퀴(FTF = {2} Hz) 돌므로, 결함 위를 지나는 볼은 1초에 {3} × {4} = {5}개 — 이것이 BPFO입니다. 결함이 늘 하중대에 있어 충격 세기가 고릅니다.": 'The outer race is stationary and the fault is in the load zone at the bottom. The cage carrying {0} balls turns {1} times per shaft turn (FTF = {2} Hz), so the number of balls passing over the fault is {3} × {4} = {5} per second: this is BPFO. The fault is always in the load zone, so the impact strength is even.',
  "내륜 결함은 축과 함께 1초에 {0}바퀴 돌고, 볼은 그보다 느리게({1} Hz) 돕니다. 결함이 볼을 따라잡는 빈도는 {2} × ({3} − {4}) = {5} Hz — BPFI입니다. 결함이 축 한 바퀴에 한 번 아래 하중대를 지나며 충격이 커졌다 작아지므로, 충격 세기가 1X로 오르내립니다 → BPFI ± 1X 측대역.": 'The inner-race fault turns with the shaft {0} times per second, and the balls turn more slowly ({1} Hz). The rate at which the fault catches up with the balls is {2} × ({3} − {4}) = {5} Hz: this is BPFI. The fault passes through the lower load zone once per shaft turn, so the impact grows and shrinks, and the impact strength rises and falls at 1X → BPFI ± 1X sidebands.',
  "흠이 난 볼(빨간 점)은 케이지 안에서 1초에 {0}바퀴(BSF) 자전하며, 한 바퀴에 외륜과 내륜에 한 번씩 닿습니다 → 2 × BSF = {1} Hz. 그 볼은 케이지와 함께 1초에 {2}바퀴 하중대를 들락날락하므로 세기가 FTF로 오르내립니다 → 2×BSF ± FTF.": 'The ball with the flaw (red dot) spins {0} times per second (BSF) inside the cage, touching the outer race and the inner race once each per spin → 2 × BSF = {1} Hz. That ball goes in and out of the load zone {2} times per second together with the cage, so its strength rises and falls at FTF → 2×BSF ± FTF.',
  "케이지의 칸 하나(빨간 칸)가 부러졌습니다. 그 칸이 하중대를 지날 때마다 볼과 부딪히므로 1초에 FTF = {0}번, 축 회전수({1} Hz)보다도 낮습니다. 충격은 궤도면 결함보다 약합니다.": 'One pocket divider of the cage (red) is broken. It hits a ball each time it passes through the load zone, so FTF = {0} times per second, even lower than the shaft speed ({1} Hz). The impact is weaker than a raceway fault.',
  "축 {0}바퀴 · 케이지 {1}바퀴": 'Shaft {0} turns · cage {1} turns',
  "결함 없음": 'no fault',
  "{0} 결함, 충격이 1초에 {1}번": '{0} fault, {1} impacts per second',
  "볼 {0}개 베어링이 돈다. {1}.": 'A bearing with {0} balls turns. {1}.',
  "하중대 (축 무게가 실리는 아래)": 'Load zone (below, where the shaft weight acts)',
  "축": 'Shaft',
  "외륜 고정 · 내륜(축) ↺": 'Outer race fixed · inner race (shaft) ↺',
  "결함이 없으면 충격도 없습니다": 'With no fault there are no impacts',
  "충격 (막대 높이 = 세기) · 축 {0}바퀴 동안 {1}번": 'Impacts (bar height = strength) · {1} in {0} shaft turns',
  "축 0바퀴": 'Shaft 0 turns',
  "{0} = {1} Hz = 축 한 바퀴에 {2}번": '{0} = {1} Hz = {2} per shaft turn',
  " (주황 = 외륜에, 초록 = 내륜에)": ' (orange = on the outer race, green = on the inner race)',
  "건전한 베어링: 축(파란 표시)이 1초에 {0}바퀴, 볼을 실은 케이지(보라)는 그보다 느린 {1}바퀴(FTF) 돕니다. 결함 위치를 고르고 단계를 올리면 충격이 보입니다.": 'Healthy bearing: the shaft (blue mark) turns {0} times per second, and the cage carrying the balls (purple) turns more slowly, {1} times (FTF). Choose a fault location and raise the stage to see the impacts.',
  "숫자는 미끄럼 없는 계산값입니다(실제 신호는 미끄럼 1 %로 조금 다름).": 'The numbers are calculated values without slip (the actual signal has 1 % slip and differs a little).',
};

export default EN;
