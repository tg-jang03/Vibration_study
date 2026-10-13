import type { Dict } from '../../translate';

const EN: Dict = {
  '정적 불평형': 'Static unbalance',
  '커플 불평형': 'Couple unbalance',
  '동적 불평형 (정적 + 커플)': 'Dynamic unbalance (static + couple)',
  '휨 (bow)': 'Bow',
  '런아웃 (가짜 1X)': 'Runout (false 1X)',
  '크랙': 'Crack',
  '방향이 정해진 1X 힘 (편심 풀리·벨트)': 'Directional 1X force (eccentric pulley, belt)',
  '구조 공진 (받침대)': 'Structural resonance (pedestal)',
  '저속 1X가 작고 회전수 2배에 약 4.5배, 두 베어링이 같은 쪽(위상차 약 0°), 수평·수직 위상차 약 90°':
    'Slow roll 1X is small and grows about 4.5× when speed doubles; the two bearings move to the same side (phase difference about 0°); horizontal-vertical phase difference about 90°',
  '회전수에 따라 약 4배로 커지고 두 베어링 위상차가 약 180°(164°)':
    'Grows about 4× with speed doubling, and the phase difference between the two bearings is about 180° (164°)',
  '회전수에 따라 약 4배, 두 베어링 위상차가 0°와 180° 사이':
    'About 4× with speed doubling, and the phase difference between the two bearings is between 0° and 180°',
  'slow roll 1X가 크고(31 µm) 회전수와 함께 커지며(47 µm), 보상해도 17 µm가 남는다. 두 베어링 동상':
    'Slow roll 1X is large (31 µm) and grows with speed (47 µm); 17 µm remains after compensation. Two bearings in phase',
  'slow roll 1X(32 µm)가 운전 회전수 값(34 µm)과 거의 같고, 보상하면 건전한 로터 수준으로 사라진다':
    'Slow roll 1X (32 µm) is almost the same as the operating-speed value (34 µm), and compensation removes it down to the healthy-rotor level',
  '2X가 2500 rpm(병진 모드 5000 rpm의 절반)에서 20 µm 봉우리를 세운다':
    '2X peaks at 20 µm at 2500 rpm (half of the 5000 rpm translation mode)',
  '수평이 수직의 3.3배, 수평·수직 위상차 11°(선 모양 오빗), 저속에서도 크다(회전수 비 1.4)':
    'Horizontal is 3.3× the vertical, horizontal-vertical phase difference 11° (line-shaped orbit), and large even at low speed (speed ratio 1.4)',
  '베어링 1 수평만 2850 rpm에서 117 µm로 솟고 그 둘레에서 위상이 크게(약 130°) 바뀐다. 회전수 비 17':
    'Only bearing 1 horizontal rises, to 117 µm at 2850 rpm, and the phase changes a lot (about 130°) around it. Speed ratio 17',
  '베어링 1 수평': 'Bearing 1 horizontal',
  '베어링 1 수직': 'Bearing 1 vertical',
  '베어링 2 수평': 'Bearing 2 horizontal',
  '건전': 'Healthy',
  '케이스 {0}': 'Case {0}',
  '원인을 골라 보기': 'Pick a cause',
  '숨은 원인 맞히기 (케이스 7개)': 'Guess the hidden cause (7 cases)',
  '1X 감별: 1X가 크면 무엇일까': 'Telling 1X causes apart: what makes 1X large?',
  '보기 방식': 'View mode',
  '케이스': 'Case',
  '정답 보기': 'Show answer',
  '원인': 'Cause',
  '정도': 'Severity',
  'slow roll 보상 ({0} rpm 벡터를 뺌)': 'Slow roll compensation (subtract the {0} rpm vector)',
  '읽음값 ({0}, {1} rpm · 베어링 1 수평 기준)': 'Readouts ({0}, {1} rpm · bearing 1 horizontal)',
  '1X 베어링 1 수평 ({0} rpm)': '1X bearing 1 horizontal ({0} rpm)',
  '1X 베어링 1 수평 위상 지연': '1X bearing 1 horizontal phase lag',
  '{0} rpm ÷ {1} rpm의 1X (불평형이면 약 4)': '1X at {0} rpm ÷ at {1} rpm (about 4 for unbalance)',
  '수평 ÷ 수직 (베어링 1)': 'Horizontal ÷ vertical (bearing 1)',
  '수평·수직 위상차 (수직 지연 − 수평 지연)': 'Horizontal-vertical phase difference (vertical lag − horizontal lag)',
  '두 베어링 위상차 (수평, 베어링 2 − 베어링 1)': 'Two-bearing phase difference (horizontal, bearing 2 − bearing 1)',
  'slow roll 보상 뒤 1X': '1X after slow roll compensation',
  '코스트다운 중 가장 큰 1X · 그 회전수': 'Largest 1X in the coastdown · its speed',
  '코스트다운 중 가장 큰 2X · 그 회전수': 'Largest 2X in the coastdown · its speed',
  '처음 상태(정적 불평형 60 %)에서 회전수 비, 두 베어링 위상차, 수평·수직 위상차를 읽으세요.':
    'In the initial state (static unbalance 60 %), read the speed ratio, the phase difference between the two bearings, and the horizontal-vertical phase difference.',
  '회전수 비 {0}(원심력 ∝ 회전수² → 약 4, 병진 모드에 다가가며 조금 더), 두 베어링 위상차 약 −3°(같은 쪽), 수평·수직 위상차 약 89°(정방향으로 도는 힘)입니다. 원인을 커플 불평형으로 바꾸면 두 베어링 위상차가 약 −164°로 바뀝니다.':
    'The speed ratio is {0} (centrifugal force ∝ speed² → about 4, a little more as it nears the translation mode), the two-bearing phase difference is about −3° (same side), and the horizontal-vertical phase difference is about 89° (a force rotating forward). Switching the cause to couple unbalance changes the two-bearing phase difference to about −164°.',
  '원인을 휨 → 런아웃으로 바꾸며 slow roll 1X와 운전 회전수 1X를 비교하고, slow roll 보상을 켜 보세요.':
    'Switch the cause from bow to runout, compare the slow roll 1X and the operating-speed 1X, and turn on slow roll compensation.',
  '휨은 slow roll 31 µm → 운전 47 µm로 커지고 보상 뒤 17 µm가 남습니다. 런아웃은 32 → 34 µm로 거의 그대로이고 보상하면 1.7 µm(건전 수준)로 사라집니다. 둘 다 저속에서 1X가 크다는 점은 같지만, 회전수에 따라 커지는지가 다릅니다.':
    'Bow grows from 31 µm at slow roll to 47 µm at operating speed, and 17 µm remains after compensation. Runout stays almost the same at 32 → 34 µm and disappears to 1.7 µm (healthy level) when compensated. Both have a large 1X at low speed; the difference is whether it grows with speed.',
  '원인을 크랙으로 바꾸고 2X 그래프를 보세요. 봉우리는 몇 rpm에 있나요?':
    'Switch the cause to crack and look at the 2X graph. At what rpm is the peak?',
  '수평 2500 rpm(20 µm p-p), 수직 2800 rpm입니다. 병진 모드 고유 회전수(수평 5000 · 수직 5600 rpm)의 절반에서 2X 힘의 주파수가 모드와 맞습니다. 1X만 보면 크랙은 휨과 비슷하게(slow roll 11.5 µm) 보입니다.':
    'Horizontal 2500 rpm (20 µm p-p), vertical 2800 rpm. At half the natural speed of the translation mode (horizontal 5000 · vertical 5600 rpm), the frequency of the 2X force matches the mode. Looking at 1X alone, a crack looks similar to a bow (slow roll 11.5 µm).',
  '보기 방식을 "숨은 원인 맞히기"로 바꾸고 케이스 1 ~ 7을 본문 그림 8의 순서로 가려 보세요.':
    'Switch the view mode to "Guess the hidden cause" and sort cases 1 to 7 in the order of Figure 8 in the text.',
  '케이스 1 휨, 2 정적 불평형, 3 구조 공진, 4 런아웃, 5 방향이 정해진 힘, 6 크랙, 7 커플 불평형입니다. 각 케이스에서 "정답 보기"를 켜면 근거가 나옵니다.':
    'Case 1 bow, 2 static unbalance, 3 structural resonance, 4 runout, 5 directional force, 6 crack, 7 couple unbalance. Turning on "Show answer" in each case shows the evidence.',
  '설명용 모델입니다: 베어링 두 개로 받친 대칭 강성 로터(병진 모드 수평 {0} · 수직 {1} rpm, 원추 모드 {2} · {3} rpm)를 {4} rpm에서 세우며(코스트다운) 1X·2X 벡터를 25 rpm마다 기록합니다.':
    'This is an explanatory model: a symmetric stiff rotor on two bearings (translation mode horizontal {0} · vertical {1} rpm, conical mode {2} · {3} rpm) is brought down from {4} rpm (coastdown), recording the 1X and 2X vectors every 25 rpm.',
  '크기는 판정 기준이 아닙니다. 실제 기계는 원인이 섞이므로 한 숫자로 정하지 않고 여러 증거를 함께 봅니다.':
    'The magnitudes are not acceptance criteria. A real machine has mixed causes, so do not decide from one number; look at several pieces of evidence together.',
  '로터를 옆에서 보면: {0} rpm에서 축이 어떻게 흔들리나': 'The rotor from the side: how does the shaft shake at {0} rpm?',
  '코스트다운 Bode — 1X': 'Coastdown Bode — 1X',
  '(slow roll 보상 뒤)': '(after slow roll compensation)',
  '회전수 [rpm]': 'Speed [rpm]',
  '1X 진폭 대 회전수': '1X amplitude versus speed',
  '위상 지연 [°]': 'Phase lag [°]',
  '1X 위상 대 회전수': '1X phase versus speed',
  '코스트다운 2X (베어링 1)': 'Coastdown 2X (bearing 1)',
  '2X 진폭 대 회전수': '2X amplitude versus speed',
  '{0} rpm의 1X 벡터 (수평)': '1X vectors at {0} rpm (horizontal)',
  '두 베어링 수평 1X 벡터': '1X horizontal vectors of the two bearings',
  '베어링 1': 'Bearing 1',
  '베어링 2': 'Bearing 2',
  '베어링 1 오빗 ({0} rpm, 1X)': 'Bearing 1 orbit ({0} rpm, 1X)',
  '베어링 1의 1X 오빗': '1X orbit of bearing 1',
  '축척은 오빗마다 맞춘다 (모양만 본다). 크기는 읽음값으로.': 'The scale is fitted to each orbit (look at the shape only). Read the size from the readouts.',
};

export default EN;
