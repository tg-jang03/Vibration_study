import type { Dict } from '../../translate';

/** src/figures/p7-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 이 페이지의 예시 로터: 베어링 두 개(B1 구동 쪽, B2 반대쪽)로 받친 대칭 로터가 3000 rpm으로 돈다. 베어링마다 수평(H)·수직(V) 근접 센서가 있다. 가운데·아래: 이 로터의 두 강체 모드. 병진 모드는 두 베어링이 같은 쪽으로(수평 5000 · 수직 5600 rpm), 원추 모드는 반대쪽으로 움직인다(6400 · 7200 rpm). 지지 강성이 수평 쪽이 작아 수평의 고유 회전수가 낮다. 운전 회전수는 두 모드보다 아래다.':
    'Figure 1. The example rotor of this page: a symmetric rotor on two bearings (B1 drive end, B2 non-drive end) turning at 3000 rpm. Each bearing has a horizontal (H) and a vertical (V) proximity sensor. Middle and bottom: the two rigid-body modes of this rotor. In the translation mode the two bearings move to the same side (horizontal 5000 · vertical 5600 rpm); in the conical mode they move to opposite sides (6400 · 7200 rpm). The support stiffness is lower in the horizontal direction, so the horizontal natural speed is lower. The operating speed is below both modes.',
  'B1 (구동 쪽)': 'B1 (drive end)',
  'H·V 센서': 'H·V sensors',
  '병진 모드: 두 베어링이 같은 쪽 (수평 5000 · 수직 5600 rpm)': 'Translation mode: both bearings same side (H 5000 · V 5600 rpm)',
  '원추 모드: 두 베어링이 반대쪽 (6400 · 7200 rpm)': 'Conical mode: bearings opposite sides (6400 · 7200 rpm)',
  '그림 2. 세 가지 불평형과 3000 rpm에서 두 베어링 수평 센서의 1X 벡터 (원 = 37 µm p-p, 0°가 위, 지연은 시계 방향). 정적 불평형은 무거운 점이 하나라 병진 모드를 밀어 두 베어링 벡터가 같은 쪽을 가리킨다(위상차 3°). 커플 불평형은 양 끝에 반대쪽 무게가 있어 원추 모드를 밀고 두 벡터가 거의 반대다(164°). 둘이 섞인 동적 불평형은 그 사이(53°)다. 위상차가 0°나 180°에서 조금 벗어나는 것은 건전한 로터에도 있는 작은 불평형·런아웃 때문이다.':
    'Figure 2. The three kinds of unbalance and the 1X vectors of the two bearing horizontal sensors at 3000 rpm (circle = 37 µm p-p, 0° at the top, lag clockwise). Static unbalance has a single heavy spot that pushes the translation mode, so the two bearing vectors point the same way (phase difference 3°). Couple unbalance has opposite weights at the two ends that push the conical mode, and the two vectors are almost opposite (164°). Dynamic unbalance, a mix of both, lies in between (53°). The small departure of the phase difference from 0° or 180° comes from the small unbalance and runout that even a healthy rotor has.',
  '정적 불평형': 'Static unbalance',
  'B1 수평': 'B1 horizontal',
  'B2 수평': 'B2 horizontal',
  '두 베어링 위상차 3°': 'Bearing phase diff. 3°',
  '커플 불평형': 'Couple unbalance',
  '두 베어링 위상차 164°': 'Bearing phase diff. 164°',
  '동적 불평형': 'Dynamic unbalance',
  '두 베어링 위상차 52.5°': 'Bearing phase diff. 52.5°',
  '그림 3. 정적 불평형이 있는 로터를 3000 rpm에서 세우며(코스트다운) 잰 베어링 1의 1X. 위: 진폭은 0에서 출발해 회전수와 함께 커진다. 회전수가 1500 → 3000 rpm으로 2배가 되면 수평 1X는 8.2 → 37 µm p-p로 4.5배다 — 원심력이 회전수의 제곱이라 약 4배이고, 병진 모드(5000 rpm)에 다가가며 조금 더 커진다. 아래: 위상은 거의 변하지 않고, 수직이 수평보다 약 89° 늦다(정방향으로 도는 힘). 수평이 수직의 1.4배인 것은 수평 지지가 무르기 때문이다.':
    'Figure 3. The 1X of bearing 1 measured while a rotor with static unbalance is brought down from 3000 rpm (coastdown). Top: the amplitude starts from 0 and grows with speed. When the speed doubles from 1500 to 3000 rpm, the horizontal 1X goes from 8.2 to 37 µm p-p, 4.5 times: the centrifugal force goes with the speed squared, so about 4 times, and it is a little more because the speed nears the translation mode (5000 rpm). Bottom: the phase hardly changes, and the vertical lags the horizontal by about 89° (a force rotating forward). The horizontal being 1.4 times the vertical is because the horizontal support is softer.',
  '베어링 1 수평': 'Bearing 1 horizontal',
  '베어링 1 수직': 'Bearing 1 vertical',
  '약 89°': 'about 89°',
  '그림 4. 베어링 1 수평 1X를 세 원인에서 비교한다 (정도 같게). 위: 그대로 잰 값. 불평형(파랑)은 0에서 출발하지만, 런아웃(주황)은 300 rpm에서 이미 32 µm p-p이고 회전수와 상관없이 그대로다. 휨(초록)도 저속에서 31 µm p-p로 시작하지만 회전수가 오르면 커진다(3000 rpm에서 47). 아래: 300 rpm의 벡터를 빼는 slow roll 보상(P3-3) 뒤. 런아웃은 건전한 로터 수준(1.7 µm)으로 떨어지고, 휨은 증폭된 몫 17 µm가 남는다.':
    'Figure 4. The bearing 1 horizontal 1X compared for three causes (same severity). Top: as measured. Unbalance (blue) starts from 0, but runout (orange) is already 32 µm p-p at 300 rpm and stays the same regardless of speed. Bow (green) also starts at 31 µm p-p at low speed but grows as the speed rises (47 at 3000 rpm). Bottom: after slow roll compensation (P3-3), subtracting the 300 rpm vector. Runout falls to the healthy-rotor level (1.7 µm), and bow keeps the amplified part, 17 µm.',
  '그대로': 'As measured',
  '런아웃': 'Runout',
  '휨 (bow)': 'Bow',
  'slow roll 보상 뒤 (300 rpm 벡터를 뺌)': 'After slow roll compensation (300 rpm vector subtracted)',
  '그림 5. 크랙. 위: 코스트다운에서 본 2X. 병진 모드 고유 회전수의 절반(수평 2500 · 수직 2800 rpm)에서 2X가 봉우리를 세운다(수평 20 µm p-p) — 2X 힘의 주파수가 모드와 맞기 때문이다. 아래: 크랙이 1년 동안 자랄 때 3000 rpm의 1X·2X와 slow roll 1X(베어링 1 수평). 2X는 0 → 8.6 µm로 늘고, 1X는 크기와 위상이 함께 움직인다(3.7 µm ∠46° → 31 µm ∠313°). slow roll 1X도 2 → 19 µm로 커진다.':
    'Figure 5. A crack. Top: the 2X seen in a coastdown. The 2X peaks at half the natural speed of the translation mode (horizontal 2500 · vertical 2800 rpm), at 20 µm p-p horizontal, because the frequency of the 2X force matches the mode. Bottom: the 1X and 2X at 3000 rpm and the slow roll 1X (bearing 1 horizontal) while a crack grows over one year. The 2X grows from 0 to 8.6 µm, and the 1X moves in both magnitude and phase (3.7 µm ∠46° → 31 µm ∠313°). The slow roll 1X also grows from 2 to 19 µm.',
  '코스트다운의 2X': '2X in the coastdown',
  '크랙이 자라는 1년 (3000 rpm, 베어링 1 수평)': 'One year of crack growth (3000 rpm, bearing 1 horizontal)',
  '개월': 'months',
  '1X 위상 [°]': '1X phase [°]',
  '그림 6. 회전하는 힘(불평형)과 방향이 정해진 힘(편심 풀리가 벨트를 한 바퀴에 한 번 당겼다 놓는 힘)의 차이. 위: 3000 rpm 베어링 1의 1X 오빗(같은 축척, 단위 µm). 불평형은 타원이고 수평·수직 위상차가 89°, 벨트 힘은 수평으로 긴 선(수평 ÷ 수직 3.3, 위상차 11°)이다. 아래: 벨트 힘은 원심력이 아니라서 회전수와 거의 상관없이 저속에서도 크다(300 rpm에서 32 µm p-p).':
    'Figure 6. The difference between a rotating force (unbalance) and a force with a fixed direction (the force with which an eccentric pulley pulls and releases the belt once per revolution). Top: the 1X orbit of bearing 1 at 3000 rpm (same scale, unit µm). Unbalance gives an ellipse with a horizontal-vertical phase difference of 89°; the belt force gives a long horizontal line (horizontal ÷ vertical 3.3, phase difference 11°). Bottom: the belt force is not centrifugal, so it is large even at low speed almost regardless of speed (32 µm p-p at 300 rpm).',
  '방향이 정해진 힘 (벨트)': 'Directional force (belt)',
  '정적 불평형 (수평)': 'Static unbalance (H)',
  '벨트 힘 (수평)': 'Belt force (H)',
  '벨트 힘 (수직)': 'Belt force (V)',
  '그림 7. 베어링 1 받침대의 수평 고유진동수가 2850 rpm(47.5 Hz)인 기계. 작은 불평형만 있어도 수평 1X(파랑)가 2850 rpm에서 117 µm p-p로 솟고, 그 둘레(2600 → 3000 rpm)에서 위상이 약 130° 바뀐다. 같은 베어링의 수직(주황)과 베어링 2(초록)는 매끄럽다. 3000 rpm에서 수평이 72 µm p-p로 커 보이지만, 회전수를 반으로 내리면 17분의 1로 줄어 불평형의 4배 규칙과 맞지 않는다.':
    'Figure 7. A machine whose bearing 1 pedestal has a horizontal natural frequency of 2850 rpm (47.5 Hz). Even with only a small unbalance, the horizontal 1X (blue) rises to 117 µm p-p at 2850 rpm, and the phase changes by about 130° around it (2600 → 3000 rpm). The vertical of the same bearing (orange) and bearing 2 (green) are smooth. The horizontal looks large at 3000 rpm with 72 µm p-p, but halving the speed reduces it to 1/17, which does not fit the 4-times rule of unbalance.',
  '베어링 2 수평': 'Bearing 2 horizontal',
  '받침대 2850 rpm': 'Pedestal 2850 rpm',
  '그림 8. 1X가 클 때 원인을 가르는 순서 (이 페이지의 예). 왼쪽 질문에 "예"이면 오른쪽 후보로, "아니오"이면 아래 질문으로 간다. 실제 기계는 원인이 둘 이상 섞이므로, 한 갈래에서 멈추지 말고 끝까지 확인한다. 축방향 1X·2X가 크면 미스얼라인(P7-3), 전원을 끊는 순간 사라지면 전기적 원인(P7-7)을 함께 본다.':
    'Figure 8. The order for separating causes when 1X is large (the example of this page). If the answer to the question on the left is "Yes," go to the candidate on the right; if "No," go to the question below. A real machine often has more than one cause mixed, so do not stop at one branch but check through to the end. If the axial 1X and 2X are large, also consider misalignment (P7-3); if it vanishes the moment power is cut, also consider an electrical cause (P7-7).',
  '① 한 방향만 크고 오빗이 선 모양인가?': '① Large in one direction only, orbit a line?',
  '(수평 ÷ 수직, 수평·수직 위상차가 0° 근처)': '(H ÷ V; H–V phase near 0°)',
  '방향이 정해진 힘 (벨트·풀리)': 'Directional force (belt/pulley)',
  '또는 받침대 공진 → ⑤로': 'or pedestal resonance → go to ⑤',
  '예': 'Yes',
  '아니오': 'No',
  '② Slow roll(저속) 1X가 큰가?': '② Is the slow roll (low-speed) 1X large?',
  '런아웃: 회전수와 무관, 보상하면 0': 'Runout: independent of speed, 0 when compensated',
  '휨: 회전수와 함께 커짐 (크랙도 → ④)': 'Bow: grows with speed (crack too → ④)',
  '③ 회전수 2배에 1X가 약 4배인가?': '③ Does 1X grow about 4× when speed doubles?',
  '불평형: 두 베어링 위상으로': 'Unbalance: use the two-bearing phase',
  '0° 정적 · 180° 커플 · 그 사이 동적': '0° static · 180° couple · between: dynamic',
  '④ 2X가 임계속도의 절반에서 봉우리,': '④ 2X peak at half the critical speed,',
  '1X·2X 벡터가 달마다 움직이는가?': '1X, 2X vectors moving month to month?',
  '크랙 (slow roll 벡터도 바뀐다)': 'Crack (slow roll vector changes too)',
  '→ 운전 중지 검토': '→ consider stopping',
  '⑤ 특정 회전수 둘레에서만 크고': '⑤ Large only around one speed,',
  '위상이 급변하는가?': 'phase changing sharply?',
  '구조 공진 (임팩트 시험, P9-1)': 'Structural resonance (impact test, P9-1)',
  '아니면 방향이 정해진 힘': 'otherwise directional force',
};

export default EN;
