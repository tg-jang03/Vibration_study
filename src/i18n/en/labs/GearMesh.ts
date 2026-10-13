import type { Dict } from '../../translate';

/** GearMesh (LAB-GEAR-01의 움직이는 기어 그림) 영어 (D-054) */
const EN: Dict = {
  '맞물림은 1초에 GMF = {0} × {1} = {2}번, 이빨마다 고르게 일어납니다. 이 그림에서 막대는 고르고, 결함은 스펙트럼과 파형에서 봅니다.':
    'Engagements occur GMF = {0} × {1} = {2} times per second, evenly tooth by tooth. In this drawing the bars are even; look for the fault in the spectrum and waveform.',
  '마모는 모든 이빨이 고르게 닳아 맞물림마다 조금씩 세집니다. 막대는 고르게 높아질 뿐이라, 결함 모양은 GMF 하모닉의 키(스펙트럼)에서 봅니다.':
    'With wear, all teeth wear evenly and each engagement becomes slightly stronger. The bars just rise evenly, so look for the fault shape in the heights of the GMF harmonics (spectrum).',
  '피니언은': 'pinion',
  '기어는': 'gear',
  '편심인 {0} 한 바퀴에 한 번 더 깊게 물렸다 얕게 물립니다. 막대 높이가 그 기어의 회전({1} Hz)으로 오르내림 → GMF 둘레에 그 간격의 측대역.':
    'The eccentric {0} meshes deeply and then shallowly once per turn. The bar height rises and falls at that gear\'s rotation ({1} Hz) → sidebands at that spacing around the GMF.',
  '피니언이 한 바퀴 돌 때({0} ms)': 'when the pinion makes one turn ({0} ms)',
  '기어가 한 바퀴 돌 때({0} ms)': 'when the gear makes one turn ({0} ms)',
  '피니언': 'pinion',
  '기어': 'gear',
  '깨진 이(빨강)는 {0} 한 번만 맞물려 그때만 큰 충격이 옵니다 — 파형에서 한 바퀴에 한 번 튀는 봉우리, 스펙트럼에서 GMF 둘레의 {1} 1X 간격 측대역이 넓게.':
    'The broken tooth (red) engages only once, {0}, and only then comes a large impact — a peak that jumps once per turn in the waveform, and in the spectrum wide sidebands at the {1} 1X spacing around the GMF.',
  '백래시가 크면 가벼운 부하에서 이빨이 떨어졌다 다시 부딪힙니다. 이 그림의 맞물림은 고르게 그렸고, 모양은 파형·스펙트럼에서 봅니다.':
    'With large backlash, the teeth separate and strike again at light load. The engagements in this drawing are drawn evenly; look for the shape in the waveform and spectrum.',
  '피니언의 상한 이빨과 기어의 상한 이빨(둘 다 빨강)은 {0} × {1} = {2}번 맞물림마다 = 피니언 {3}바퀴 = 기어 {4}바퀴마다 한 번만 만납니다({5} s, 헌팅 투스 주기). 작은 주황 막대는 상한 이빨 하나가 맞물릴 때, 큰 빨강 막대는 둘이 만날 때입니다 — 띠에는 두 주기를 담아 큰 막대 사이 간격이 곧 헌팅 투스 주기입니다.':
    'The damaged pinion tooth and the damaged gear tooth (both red) meet only once every {0} × {1} = {2} engagements = {3} pinion turns = {4} gear turns ({5} s, the hunting tooth period). A small orange bar is a single damaged tooth engaging, and a large red bar is the two meeting — the strip holds two periods, so the spacing between the large bars is the hunting tooth period.',
  '피니언 {0}바퀴 · 기어 {1}바퀴': 'Pinion {0} turns · gear {1} turns',
  '{0}이빨 피니언과 {1}이빨 기어가 맞물려 돈다. {2}': 'A {0}-tooth pinion and a {1}-tooth gear turn in mesh. {2}',
  '피니언 {0}이빨 ↺': 'Pinion {0} teeth ↺',
  '기어 {0}이빨 ↻': 'Gear {0} teeth ↻',
  '상한 이빨이 맞물릴 때만 · 헌팅 투스 두 주기 (2 × {0} s)': 'Only when a damaged tooth engages · two hunting tooth periods (2 × {0} s)',
  '기어 2바퀴': '2 gear turns',
  '피니언 4바퀴': '4 pinion turns',
  '맞물림마다의 충격 (막대 높이) · {0} 동안 {1}번': 'Impact at each engagement (bar height) · {1} engagements in {0}',
  '피니언 바퀴 수': 'Pinion turns',
  '기어 바퀴 수': 'Gear turns',
  '파랑·보라 선은 두 기어가 도는 것을 보이는 표시선입니다. 그림은 실제보다 느리게 재생합니다':
    'The blue and purple lines are marker lines that show the two gears turning. The drawing plays slower than real time',
  '(헌팅 투스는 주기를 보려고 더 빠르게 — 이빨이 너무 빨라 거꾸로 도는 것처럼 보이지 않게 피치원만 그림)':
    ' (the hunting tooth case plays faster to show the period — only the pitch circles are drawn so the teeth do not look as if they turn backwards)',
};

export default EN;
