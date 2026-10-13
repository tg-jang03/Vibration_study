import type { Dict } from '../../translate';

const EN: Dict = {
  '정상 (불평형만)': 'Normal (unbalance only)',
  '미스얼라인먼트': 'Misalignment',
  '회전 풀림 (베어링 간극 과다)': 'Rotating looseness (excess bearing clearance)',
  '부분 러브 (씰 접촉)': 'Partial rub (seal contact)',
  '비선형의 지문: 미스얼라인 · 풀림 · 러브': 'Nonlinear fingerprints: misalignment · looseness · rub',
  '상태': 'Condition',
  '정도': 'Severity',
  '회전수': 'Speed',
  '임계속도 {0} rpm의 {1}배': '{1} times the critical speed of {0} rpm',
  '읽음값 ({0}, {1} rpm, 정상상태 {2}바퀴)': 'Readouts ({0}, {1} rpm, steady state {2} turns)',
  '씰·베어링 벽에 닿아 있는 시간 비율': 'Fraction of time touching the seal or bearing wall',
  '½X (수직 p-p)': '½X (vertical p-p)',
  '⅓X (수직 p-p)': '⅓X (vertical p-p)',
  '1X 정방향 · 원의 반지름': '1X forward · circle radius',
  '1X 역방향 · 원의 반지름': '1X reverse · circle radius',
  '2X (수직 p-p)': '2X (vertical p-p)',
  '3X (수직 p-p)': '3X (vertical p-p)',
  '평균 자리 (Shaft centerline) 수평': 'Mean position (shaft centerline) horizontal',
  '평균 자리 수직 (정상 = −70 µm, 중력 처짐)': 'Mean position vertical (normal = −70 µm, gravity sag)',
  '오빗이 정방향(반시계)으로 도는 비율': 'Fraction of the orbit going forward (counterclockwise)',
  '가장 큰 역방향 성분 (차수 {0} = {1} Hz) · 반지름': 'Largest reverse component (order {0} = {1} Hz) · radius',
  '상태를 미스얼라인먼트로, 회전수를 2400 rpm으로 두고 정도를 25 % → 80 %로 올리세요. 오빗 모양과 평균 자리는?':
    'Set the condition to misalignment and the speed to 2400 rpm, and raise the severity from 25 % to 80 %. What are the orbit shape and the mean position?',
  '25 %에서는 2X가 1X의 약 0.6배라 오빗이 바나나처럼 휘고, 80 %에서는 2X가 1X보다 커져(약 1.5배) 8자가 됩니다. 평균 자리는 정상(−70 µm)에서 25 % −57 µm, 80 % −28 µm로 위로 뜹니다 — 커플링 예하중이 축을 들어 올린 것으로, Shaft centerline(P4-3)이 정상 자리에서 벗어나는 증거입니다.':
    'At 25 % the 2X is about 0.6 times the 1X, so the orbit bends like a banana; at 80 % the 2X exceeds the 1X (about 1.5 times) and it becomes a figure eight. The mean position lifts from normal (−70 µm) to −57 µm at 25 % and −28 µm at 80 % — the coupling preload lifted the shaft, which is evidence that the shaft centerline (P4-3) has left its normal position.',
  '상태를 부분 러브(정도 50 %)로 두고 회전수를 4200 → 7800 rpm으로 올리세요. 어떤 성분이 주인공이 되나요?':
    'Set the condition to partial rub (severity 50 %) and raise the speed from 4200 to 7800 rpm. Which component becomes the main one?',
  '4200 rpm(임계속도의 1.4배)에서는 1X가 주인공이고 2X가 섭니다. 7800 rpm(2.6배)에서는 ½X가 1X보다 커집니다 — 닿을 때마다 로터가 제 고유진동수 근처로 울리고, 그 주기가 두 바퀴에 맞기 때문입니다. 키페이저 점도 두 자리로 갈라집니다.':
    'At 4200 rpm (1.4 times the critical speed) the 1X is the main one and a 2X appears. At 7800 rpm (2.6 times) the ½X exceeds the 1X — each time it touches, the rotor rings near its own natural frequency, and the period of that ringing matches two turns. The keyphasor dots also split into two places.',
  '상태를 회전 풀림으로 두고 정도 100 %에서 3600 rpm, 정도 50 %에서 4200 rpm을 보세요.':
    'Set the condition to rotating looseness and look at 3600 rpm at severity 100 % and 4200 rpm at severity 50 %.',
  '3600 rpm(100 %)은 수직 파형의 아래가 간극 바닥에 막혀 잘리고, 수직 성분에 2X·3X·4X·5X가 줄지어 섭니다. 4200 rpm(50 %)은 두 바퀴마다 되풀이되어 ½X와 1½X가 섭니다. 같은 풀림이 회전수와 정도에 따라 하모닉 무리 또는 ½X 무리로 보입니다.':
    'At 3600 rpm (100 %) the bottom of the vertical waveform is blocked by the clearance floor and cut off, and 2X, 3X, 4X and 5X stand in a row in the vertical components. At 4200 rpm (50 %) the shape repeats every two turns and ½X and 1½X appear. The same looseness shows as a harmonic cluster or a ½X cluster depending on speed and severity.',
  '부분 러브의 정도를 100 %로 올리고 회전수를 7800 rpm 이상으로 올려 보세요.':
    'Raise the severity of the partial rub to 100 % and raise the speed to 7800 rpm or more.',
  '7800 rpm부터 오빗이 회전 반대로 돌고(정방향 비율 0 %), Full spectrum의 가장 큰 성분이 역방향 −0.92X(약 120 Hz)입니다. 8400 · 9000 rpm에서는 −0.84X · −0.78X로 차수는 바뀌지만 주파수는 약 118 · 117 Hz로 거의 그대로입니다 — 역방향 선회가 회전수가 아닌 고유진동수에 잠긴 것입니다. 9600 rpm에서는 계산이 멈춥니다: 접촉 마찰이 키운 역방향 선회가 끝없이 커지는 원주 러브(dry whirl·whip)로, 실제 기계라면 즉시 정지할 상황입니다(본문 그림 8).':
    'From 7800 rpm the orbit turns against the rotation (forward fraction 0 %), and the largest component of the full spectrum is reverse −0.92X (about 120 Hz). At 8400 and 9000 rpm the order changes to −0.84X and −0.78X, but the frequency stays almost the same at about 118 and 117 Hz — the reverse whirl is locked to the natural frequency, not to the speed. At 9600 rpm the calculation stops: it is full annular rub (dry whirl and whip) in which the reverse whirl grown by contact friction increases without limit, a situation in which a real machine would be stopped immediately (Figure 8 in the text).',
  '설명용 모델입니다: 무차원 Jeffcott 로터(감쇠비 0.05)를 한 바퀴 256걸음 RK4로 적분하고, 300바퀴를 버린 뒤 {0}바퀴를 한 바퀴 64점으로 기록합니다. 간극 1 = {1} µm, 회전수비 1 = {2} rpm으로 읽습니다. 러브는 씰 접촉 강성 40·마찰 계수 0.05, 회전 풀림은 간극 안 강성 0.3·중력 1.2·벽 강성 40, 미스얼라인은 60° 방향 예하중과 1X·2X 힘입니다. 크기는 판정 기준이 아닙니다. 비선형 계는 시작 조건에 따라 다른 정상상태에 들어갈 수 있습니다(이 랩은 늘 정지 위치에서 출발).':
    'This is an explanatory model: a nondimensional Jeffcott rotor (damping ratio 0.05) is integrated with RK4 at 256 steps per turn, 300 turns are discarded, and then {0} turns are recorded at 64 points per turn. Read clearance 1 = {1} µm and speed ratio 1 = {2} rpm. For rub, the seal contact stiffness is 40 and the friction coefficient 0.05; for rotating looseness, the stiffness inside the clearance is 0.3, gravity 1.2 and wall stiffness 40; for misalignment, a preload in the 60° direction and 1X and 2X forces. The magnitudes are not acceptance criteria. A nonlinear system can enter a different steady state depending on the starting condition (this lab always starts from the rest position).',
  '계산 중…': 'Calculating…',
  '계산이 멈췄습니다': 'The calculation stopped',
  '— 진동이 간극의 50배를 넘었습니다. 접촉 마찰이 축을 회전 반대로 밀어 역방향 선회가 끝없이 커지는 원주 러브(dry whirl)로 번졌습니다. 실제 기계라면 즉시 정지할 상황입니다. 정도나 회전수를 낮춰 보세요.':
    '— the vibration exceeded 50 times the clearance. Contact friction pushed the shaft against the rotation, and it spread into full annular rub (dry whirl) in which the reverse whirl grows without limit. A real machine would be stopped immediately. Try lowering the severity or the speed.',
  '오빗 (마지막 8바퀴, ±{0} µm, 점 = 키페이저)': 'Orbit (last 8 turns, ±{0} µm, dot = keyphasor)',
  '오빗': 'Orbit',
  '점선 원 = 씰·베어링 간극 ({0} µm), 십자 = 평균 자리.': 'Dashed circle = seal or bearing clearance ({0} µm), cross = mean position.',
  '파형 (마지막 4바퀴)': 'Waveform (last 4 turns)',
  '수평': 'Horizontal',
  '수직': 'Vertical',
  '회전각 [°] (키페이저 = 0°)': 'Rotation angle [°] (keyphasor = 0°)',
  '수평·수직 파형': 'Horizontal and vertical waveforms',
  'Full spectrum (원의 반지름, − 역방향 · + 정방향)': 'Full spectrum (circle radius, − reverse · + forward)',
  '차수 (× 회전 주파수)': 'Order (× rotation frequency)',
  '수직 스펙트럼 (p-p)': 'Vertical spectrum (p-p)',
  '수직 스펙트럼': 'Vertical spectrum',
};

export default EN;
