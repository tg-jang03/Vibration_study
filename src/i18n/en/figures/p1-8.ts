import type { Dict } from '../../translate';

/** src/figures/p1-8.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 전동기가 커플링을 거쳐 펌프를 돌리는 기계. 축(불평형·정렬), 구름베어링, 펌프 날개, 전동기의 자기력, 받침대가 저마다 다른 박자로 기계를 흔든다. 위 회색 글씨는 이 페이지에서 셀 주파수의 이름이다.':
    'Figure 1. A machine in which a motor drives a pump through a coupling. The shaft (unbalance, alignment), the rolling bearings, the pump blades, the magnetic force of the motor and the pedestal each shake the machine at their own rhythm. The gray text above gives the names of the frequencies we will count on this page.',
  전동기: 'Motor',
  펌프: 'Pump',
  '날개 7개': '7 blades',
  '자기력 2 f_L': 'Magnetic force 2 f_L',
  '축 · 커플링': 'Shaft · coupling',
  구름베어링: 'Rolling bearing',
  '펌프 날개': 'Pump blades',
  '날개 통과': 'Blade pass',
  '받침대(구조): 정해진 고유진동수': 'Pedestal (structure): fixed natural frequency',
  // 그림 2
  '그림 2. 3000 rpm(한 바퀴 20 ms)으로 도는 축에서 일어나는 사건을 시각에 따라 막대로 세웠다. 회색 점선이 한 바퀴의 끝이다. 위: 한 바퀴에 1번(불평형이 한 번 미는 것처럼) → 1초에 50번 = 1X = 50 Hz. 가운데: 한 바퀴에 3번 → 1초에 150번 = 3X. 아래: 두 사건의 주파수를 주파수 축 위에 줄로 세운 주파수 지도. 줄의 높이에는 뜻이 없고 위치만 본다. 회색 점선은 1X의 정수배(하모닉) 자리다.':
    'Figure 2. Events on a shaft turning at 3000 rpm (20 ms per turn), drawn as bars against time. The gray dotted lines mark the end of each turn. Top: once per turn (like unbalance pushing once) → 50 times per second = 1X = 50 Hz. Middle: three times per turn → 150 times per second = 3X. Bottom: a frequency map, with the frequencies of the two events set out as lines on a frequency axis. The height of a line means nothing; only its position counts. The gray dotted lines are the integer multiples (harmonics) of 1X.',
  '한 바퀴에 1번': 'Once per turn',
  '한 바퀴에 3번': 'Three times per turn',
  '한 바퀴': 'One turn',
  '시각 [ms]': 'Time [ms]',
  '주파수 지도': 'Frequency map',
  '주파수 [Hz]': 'Frequency [Hz]',
  // 그림 3
  '그림 3. 한 바퀴에 여러 번 일어나는 일. 왼쪽: 날개 7개짜리 펌프 날개바퀴. 케이싱의 한 점(고정점)을 날개가 한 바퀴에 7번 지나가므로 날개 통과 주파수 = 7 × 1X다 (3600 rpm이면 420 Hz). 오른쪽: 이빨 15개 기어(파랑)가 이빨 60개 기어(초록)를 돌린다. 작은 기어가 3000 rpm(50 Hz)이면 1초에 15 × 50 = 750번 이빨이 맞물린다 = 맞물림 주파수. 큰 기어도 같은 1초 동안 같은 수의 이빨이 맞물리므로 60 × f₂ = 750 → f₂ = 12.5 Hz.':
    'Figure 3. Things that happen several times per turn. Left: a pump impeller with 7 blades. A blade passes a point on the casing (the fixed point) 7 times per turn, so the blade-pass frequency = 7 × 1X (420 Hz at 3600 rpm). Right: a 15-tooth gear (blue) drives a 60-tooth gear (green). If the small gear turns at 3000 rpm (50 Hz), its teeth mesh 15 × 50 = 750 times per second = the mesh frequency. The large gear has the same number of teeth meshing in the same second, so 60 × f₂ = 750 → f₂ = 12.5 Hz.',
  '펌프 날개 7개': 'Pump impeller, 7 blades',
  고정점: 'Fixed point',
  '한 바퀴에 7번 지나감 → 7 × 1X': '7 passes per turn → 7 × 1X',
  '기어 한 쌍 (이빨 15 · 60)': 'Gear pair (15 · 60 teeth)',
  '맞물림 750 Hz': 'Mesh 750 Hz',
  // 그림 4
  '그림 4. 구름베어링을 축 방향에서 본 단면 (볼 9개). 바깥 바퀴(외륜)는 하우징에 끼워져 멈춰 있고, 안쪽 바퀴(내륜)는 축에 끼워져 축과 함께 돈다. 볼은 두 바퀴 사이를 구르고, 케이지(회색 점선, 볼 중심을 잇는 원)가 볼 사이 간격을 잡아 준다. 볼 지름 d와 볼 중심이 그리는 원의 지름(피치 지름) D의 비는 실제 6205 베어링과 같게(d/D ≈ 0.2) 그렸다.':
    'Figure 4. Cross-section of a rolling bearing seen along the shaft (9 balls). The outer wheel (outer ring) is fitted in the housing and stands still; the inner wheel (inner ring) is fitted on the shaft and turns with it. The balls roll between the two rings, and the cage (gray dotted line, the circle through the ball centers) keeps the balls spaced. The ratio of the ball diameter d to the diameter of the circle the ball centers trace (pitch diameter) D is drawn as in a real 6205 bearing (d/D ≈ 0.2).',
  '구름베어링 단면': 'Rolling-bearing section',
  축: 'Shaft',
  '외륜: 하우징에 끼워져 멈춰 있다': 'Outer ring: fixed in housing, still',
  '볼 9개: 두 바퀴 사이를 구른다': '9 balls: roll between the rings',
  '케이지(점선): 볼 간격을 잡고 볼과 함께 돈다': 'Cage (dotted): spaces balls, turns with them',
  '내륜: 축과 함께 f_r로 돈다': 'Inner ring: turns with shaft at f_r',
  '외륜 멈춤 · 내륜과 축 회전': 'Outer ring still · inner ring and shaft turn',
  // 그림 5
  '그림 5. 멈춘 판과 움직이는 판 사이에 낀 것은 위 판 속도의 절반쯤으로 간다. 왼쪽: 아래 판(외륜)이 멈춰 있고 위 판(내륜)이 v로 움직이면, 미끄러지지 않고 구르는 굴림대(볼)의 중심은 v/2로 간다. 그래서 케이지는 내륜보다 느리게 돈다. 오른쪽: 멈춘 베어링 면과 U로 도는 축 표면 사이의 기름은 축 쪽은 U, 베어링 쪽은 0으로 흘러 평균 속도가 U/2쯤이다.':
    'Figure 5. Whatever is caught between a fixed plate and a moving plate moves at about half the speed of the upper plate. Left: when the lower plate (outer ring) is still and the upper plate (inner ring) moves at v, the center of a roller (ball) that rolls without slipping moves at v/2. That is why the cage turns slower than the inner ring. Right: the oil between the fixed bearing surface and the shaft surface turning at U flows at U on the shaft side and 0 on the bearing side, so its average speed is about U/2.',
  '굴림대: 중심은 v/2': 'Roller: center at v/2',
  'v (위 판 = 내륜)': 'v (upper plate = inner ring)',
  '아래 판 멈춤 = 외륜': 'Lower plate still = outer ring',
  '기름막: 평균 ≈ U/2': 'Oil film: average ≈ U/2',
  'U (축 표면)': 'U (shaft surface)',
  '베어링 면 멈춤 (속도 0)': 'Bearing surface still (speed 0)',
  // 그림 6
  '그림 6. 위: 케이지에 올라타서 본 볼. 케이지와 함께 돌며 보면 볼 중심은 제자리이고, 멈춰 있던 외륜이 1초에 FTF바퀴씩 거꾸로 지나간다. 볼은 그 위를 미끄러지지 않고 구르므로, 볼이 외륜에 닿는 원의 둘레 π(D + d)가 한 번 지나가는 동안 π(D + d) ÷ πd = (D + d)/d바퀴 자전한다 → BSF = FTF × (D + d)/d. 6205는 (D + d)/d = 5.92바퀴다. 아래: 6205 베어링(볼 9개, d = 7.94 mm, D = 39.04 mm)의 네 주파수 — 케이지 FTF(초록), 볼 자전 BSF(보라), 외륜 BPFO(파랑), 내륜 BPFI(주황) — 를 1X의 배수로 세운 주파수 지도. 회색 점선은 1X의 정수배(하모닉) 자리다. 케이지 0.3983X, 볼 자전 2.357X, 외륜 3.585X, 내륜 5.415X — 모두 점선 사이에 선다. 3000 rpm(1X = 50 Hz)이면 볼 자전 117.8 Hz, 외륜 179.2 Hz, 내륜 270.8 Hz다. 외륜과 내륜을 더하면 정확히 9X(볼 수 × 1X)다.':
    'Figure 6. Top: a ball seen while riding on the cage. If you go around with the cage, the ball center stays put and the outer ring, which was standing still, goes backwards past you at FTF turns per second. The ball rolls on it without slipping, so while the circumference π(D + d) of the circle where the ball touches the outer ring passes once, the ball spins π(D + d) ÷ πd = (D + d)/d times → BSF = FTF × (D + d)/d. For the 6205, (D + d)/d = 5.92 spins. Bottom: a frequency map of the four frequencies of a 6205 bearing (9 balls, d = 7.94 mm, D = 39.04 mm) — cage FTF (green), ball spin BSF (purple), outer ring BPFO (blue), inner ring BPFI (orange) — set out as multiples of 1X. The gray dotted lines are the integer multiples (harmonics) of 1X. Cage 0.3983X, ball spin 2.357X, outer ring 3.585X, inner ring 5.415X — all stand between dotted lines. At 3000 rpm (1X = 50 Hz), the ball spin is 117.8 Hz, the outer ring 179.2 Hz and the inner ring 270.8 Hz. Adding outer and inner ring gives exactly 9X (number of balls × 1X).',
  '케이지에 올라타서 보면 (볼 자전)': 'Riding on the cage (ball spin)',
  '볼 중심 = 케이지와 함께 제자리': 'Ball center = stays put with the cage',
  '자전': 'Spin',
  '외륜: 1초에 FTF바퀴씩 거꾸로': 'Outer ring: FTF turns per second, backwards',
  '외륜에 닿는 원의 둘레 π(D + d)': 'Circumference where it touches the outer ring π(D + d)',
  '÷ 볼 둘레 πd': '÷ ball circumference πd',
  '= 외륜 한 바퀴에 (D + d)/d바퀴 자전': '= (D + d)/d spins per pass of the outer ring',
  '네 주파수 (6205)': 'The four frequencies (6205)',
  '주파수 (1X의 배수)': 'Frequency (multiples of 1X)',
  // 그림 7
  '그림 7. 외륜 흠집 위를 볼이 지날 때마다 짧은 충격이 생기고, 충격은 하우징을 고유진동수(예시 3 kHz, 감쇠비 0.04)로 울린다 — P1-3의 감쇠 자유진동이 BPFO 박자(179.2 Hz, 5.58 ms 간격)로 되풀이된다. 위: 25 ms 동안의 파형. 가운데: 충격 하나를 1.5 ms만 확대 — 한 번 울리는 데 0.333 ms. 아래: 주파수 지도. 흔들림의 대부분은 울림 주파수 근처(주황 띠)에 모이고, 되풀이 박자 179.2 Hz는 울림이 반복되는 간격으로만 드러난다.':
    'Figure 7. Each time a ball rolls over an outer-ring flaw, a short impact occurs, and the impact rings the housing at its natural frequency (example 3 kHz, damping ratio 0.04) — the damped free vibration of P1-3 repeating at the BPFO rhythm (179.2 Hz, 5.58 ms apart). Top: the waveform over 25 ms. Middle: one impact enlarged to only 1.5 ms — one ring takes 0.333 ms. Bottom: frequency map. Most of the shaking gathers near the ringing frequency (orange band), and the repetition rhythm of 179.2 Hz shows up only as the interval at which the ringing repeats.',
  '25 ms 동안 (정규화)': 'Over 25 ms (normalized)',
  '충격 하나 확대': 'One impact enlarged',
  '울림이 모이는 곳': 'Where ringing gathers',
  '되풀이 박자 BPFO 179.2 Hz': 'Repeat rhythm BPFO 179.2 Hz',
  '주파수 [Hz] (로그 눈금)': 'Frequency [Hz] (log scale)',
  // 그림 8
  '그림 8. 벨트 구동 팬. 위: 지름 0.2 m 풀리가 1780 rpm(29.67 Hz)으로 돌고, 지름 0.4 m 풀리는 절반 빠르기(14.83 Hz)로 돈다. 길이 1.6 m 벨트는 1초에 π × 0.2 × 29.67 ÷ 1.6 = 11.65바퀴 돈다. 아래: 전동기 1X(파랑) 아래에 벨트(주황), 팬 축 1X(초록), 팬 베어링 케이지(보라)가 선다 — 모두 1X보다 낮은 줄이다.':
    'Figure 8. A belt-driven fan. Top: the 0.2 m pulley turns at 1780 rpm (29.67 Hz) and the 0.4 m pulley at half that speed (14.83 Hz). The 1.6 m belt makes π × 0.2 × 29.67 ÷ 1.6 = 11.65 turns per second. Bottom: below the motor 1X (blue) stand the belt (orange), the fan-shaft 1X (green) and the fan-bearing cage (purple) — all lines below 1X.',
  '벨트 구동 팬': 'Belt-driven fan',
  '벨트 길이 1.6 m': 'Belt length 1.6 m',
  '전동기 풀리 0.2 m': 'Motor pulley 0.2 m',
  '팬 풀리 0.4 m': 'Fan pulley 0.4 m',
  '1X보다 낮은 줄': 'Lines below 1X',
  '팬 베어링 FTF 5.91': 'Fan brg. FTF 5.91',
  '벨트 11.7': 'Belt 11.7',
  '팬 1X 14.8': 'Fan 1X 14.8',
  '벨트 × 2 23.3': 'Belt × 2 23.3',
  '전동기 1X 29.7': 'Motor 1X 29.7',
  // 그림 9
  '그림 9. 미끄럼 베어링(유막 저널 베어링)을 축 방향에서 본 단면 — 틈새를 실제보다 크게 그렸다. 위: 축은 무게 때문에 한쪽으로 쏠려 돌고, 축 표면이 좁은 틈으로 끌고 들어간 기름의 압력이 축을 받친다. 기름은 축 둘레를 축의 절반보다 조금 느리게 돌기 때문에, 기름막이 불안정해지면 축 중심(주황 점선 원)이 그 박자(0.38 ~ 0.48X)로 틈새 안을 돈다 — 선회. 볼이나 이빨처럼 한 바퀴에 몇 번 지나가는 것이 없어서 베어링 자신의 결함 주파수는 없다. 축의 움직임은 베어링에 꽂은 변위 센서로 직접 잰다. 아래: 그래서 미끄럼 베어링 기계에서는 1X(불평형), 2X(정렬 불량 등)와 기름막 선회(0.38 ~ 0.48X)를 본다 — 모두 1X 아래 ~ 몇 X에 있다.':
    'Figure 9. Cross-section of a journal bearing (fluid-film journal bearing) seen along the shaft — the clearance is drawn much larger than in reality. Top: the shaft turns pushed to one side by its weight, and the pressure of the oil the shaft surface drags into the narrow gap holds the shaft up. The oil goes around the shaft a little slower than half the shaft speed, so when the oil film becomes unstable the shaft center (orange dotted circle) circles inside the clearance at that rhythm (0.38 – 0.48X) — whirl. Nothing passes a few times per turn the way balls or teeth do, so the bearing has no flaw frequency of its own. The shaft motion is measured directly with displacement sensors mounted in the bearing. Bottom: so on a machine with journal bearings we watch 1X (unbalance), 2X (misalignment and the like) and oil whirl (0.38 – 0.48X) — all of them from below 1X up to a few X.',
  '미끄럼 베어링 단면 (틈새를 크게 그림)': 'Journal bearing cross-section (clearance enlarged)',
  '축 f_r': 'Shaft f_r',
  '베어링 면: 멈춰 있다': 'Bearing surface: stands still',
  '축: f_r로 돈다 · 기름은 평균 절반쯤 빠르기': 'Shaft: turns at f_r · oil averages about half that speed',
  '축 중심(점선 원): 0.38 ~ 0.48X로 돈다 = 선회': 'Shaft center (dotted circle): circles at 0.38 – 0.48X = whirl',
  '변위 센서: 축의 움직임을 직접 잰다': 'Displacement sensor: measures the shaft motion directly',
  '좁은 틈: 끌려 들어간 기름의 압력이 축을 받친다': 'Narrow gap: pressure of the dragged-in oil holds the shaft up',
  '볼·이빨이 없다 → 한 바퀴에 몇 번 칠 것이 없다': 'No balls or teeth → nothing that hits a few times per turn',
  '미끄럼 베어링 기계에서 보는 줄': 'Lines to watch on a journal-bearing machine',
  '기름막 선회 0.38 ~ 0.48X': 'Oil whirl 0.38 – 0.48X',
  '1X 불평형': '1X unbalance',
  '2X 정렬 불량 등': '2X misalignment etc.',
  // 그림 10
  '그림 10. 전동기-펌프(날개 7개)를 0에서 3570 rpm까지 기동할 때, 세로축 회전수마다 각 줄이 가로축 어디에 서는지 그렸다. 회전 관련 줄(1X 파랑, 2X 초록, 날개 통과 보라)은 원점에서 뻗는 직선을 따라 오른쪽으로 움직인다. 전원에 묶인 2 f_L = 120 Hz(회색 점선)와 받침대 고유진동수 85 Hz(주황 점선, 예시)는 회전수와 상관없이 제자리다. 직선이 주황 점선과 만나는 회전수(날개 통과 729 rpm, 2X 2550 rpm)에서 그 고유진동수를 지나간다 — P1-7의 임계속도와 같은 일이다. 운전 회전수에서 2X(119 Hz)와 2 f_L(120 Hz)은 거의 겹친다.':
    'Figure 10. Starting up a motor-pump (7 blades) from 0 to 3570 rpm: for each speed on the vertical axis, where each line stands on the horizontal axis. The speed-related lines (1X blue, 2X green, blade pass purple) move right along straight lines from the origin. The line-frequency-bound 2 f_L = 120 Hz (gray dotted) and the pedestal natural frequency 85 Hz (orange dotted, example) stay put regardless of speed. At the speeds where a straight line meets the orange dotted line (blade pass 729 rpm, 2X 2550 rpm), it passes that natural frequency — the same thing as the critical speed of P1-7. At operating speed, 2X (119 Hz) and 2 f_L (120 Hz) nearly coincide.',
  '운전 3570 rpm': 'Running 3570 rpm',
  '받침대 85 Hz': 'Pedestal 85 Hz',
  '날개 통과 7X': 'Blade pass 7X',
  '회전수 [rpm]': 'Speed [rpm]',
  // 그림 11
  '그림 11. 전동기-펌프(3570 rpm, 1X = 59.5 Hz, 날개 7개, 볼 9개 베어링)의 관심 주파수 구간 지도 (가로축 로그 눈금). 요소마다 한 줄씩, 파랑 실선은 회전수를 따라 움직이는 줄, 주황 점선·띠는 제자리 줄이다. 회색 띠로 구간을 나눴다: 1X 아래 / 1X ~ 10X(59.5 ~ 595 Hz) / 10X ~ 수 kHz / 수 kHz 이상. 이 기계에서 가장 높은 관심 주파수는 충격이 울리는 대역의 위 끝 5000 Hz다.':
    'Figure 11. Map of the frequency bands of interest for a motor-pump (3570 rpm, 1X = 59.5 Hz, 7 blades, bearing with 9 balls), on a logarithmic horizontal axis. One row per element; blue solid lines move with speed, orange dotted lines and bands stay put. Gray bands divide the bands: below 1X / 1X – 10X (59.5 – 595 Hz) / 10X – several kHz / several kHz and above. The highest frequency of interest in this machine is 5000 Hz, the upper end of the impact-ringing band.',
  '1X 아래': 'Below 1X',
  '1X ~ 10X': '1X – 10X',
  '10X ~ 수 kHz': '10X – several kHz',
  '수 kHz 이상': 'Several kHz +',
  '전동기 (전기)': 'Motor (elec.)',
  구조: 'Structure',
  '충격 울림': 'Impact ringing',
  고유진동수: 'Natural freq.',
};

export default EN;
