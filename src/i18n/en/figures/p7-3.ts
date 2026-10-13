import type { Dict } from '../../translate';

/** src/figures/p7-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 같은 로터(임계속도 3000 rpm, 씰 반경 간극 100 µm, 중력 처짐 70 µm)를 4200 rpm으로 돌릴 때 수직 변위. 위: 씰이 없다면(회색 점선) 처진 자리에서 반경 32 µm의 원을 그려 파형이 사인파이고 1X 하나뿐이다. 그 원의 바닥이 씰에 살짝 닿자 축이 튕겨 나가 간극을 크게 도는 운동으로 옮겨 갔다(파랑, 1X 166 µm p-p) — 접촉이 오히려 진동을 키운다. 파형은 바닥에서 씰에 막혀 꺾인다. 아래: 수직 성분을 차수로 나눈 크기(p-p). 접촉이 2X(11 µm)와 3X·½X를 만든다. 힘이 변위에 비례하지 않는 계(비선형)는 사인파 힘을 넣어도 사인파로 답하지 않는다.':
    'Figure 1. Vertical displacement when the same rotor (critical speed 3000 rpm, radial seal clearance 100 µm, gravity sag 70 µm) turns at 4200 rpm. Top: without the seal (gray dotted), it draws a circle of 32 µm radius around the sagged position, so the waveform is a sine and has only 1X. When the bottom of that circle lightly touched the seal, the shaft was bounced away and moved to a motion circling widely in the clearance (blue, 1X 166 µm p-p) — the contact actually increases the vibration. The waveform bends where it is blocked by the seal at the bottom. Bottom: the vertical component split by order (p-p). The contact creates 2X (11 µm) and 3X and ½X. A system whose force is not proportional to displacement (nonlinear) does not answer a sine force with a sine.',
  '회전각 [°] (키페이저 = 0°)': 'Rotation angle [°] (keyphasor = 0°)',
  '수직 [µm]': 'Vertical [µm]',
  '씰이 없다면': 'Without seal',
  '씰에 닿음': 'Touches seal',
  '씰 (아래쪽)': 'Seal (bottom)',
  '차수 (× 회전 주파수)': 'Order (× rotation frequency)',
  '수직 [µm p-p]': 'Vertical [µm p-p]',
  '그림 2. 미스얼라인먼트(정렬 불량, P3-3): 커플링으로 이은 두 축의 중심선이 어긋나거나(평행) 꺾인(각) 상태. 실제로는 둘이 섞여 있다. 어긋난 축을 커플링이 억지로 이으므로 (1) 두 축을 서로 끌어당기는 정적 힘(예하중)이 생겨 베어링 속 축의 자리가 바뀌고, (2) 커플링이 한 바퀴에 한두 번 굽혔다 펴지며 1X·2X 힘을 만들고, (3) 각 미스얼라인에서는 두 축을 축방향으로 서로 반대로 민다.':
    'Figure 2. Misalignment (P3-3): the centerlines of two shafts joined by a coupling are offset (parallel) or bent (angular). In practice the two are mixed. Because the coupling forces the offset shafts together, (1) a static force pulling the two shafts toward each other (preload) arises and changes the position of the shaft in the bearing, (2) the coupling bends and straightens once or twice per revolution and makes 1X and 2X forces, and (3) with angular misalignment the two shafts are pushed in opposite axial directions.',
  '평행 미스얼라인: 두 중심선이 나란히 어긋남': 'Parallel misalignment: centerlines offset side by side',
  '어긋남': 'Offset',
  '각 미스얼라인: 두 중심선이 커플링에서 꺾임': 'Angular misalignment: centerlines bend at the coupling',
  '축방향으로 서로 반대': 'Opposite axially',
  '그림 3. 2400 rpm에서 본 오빗 (같은 축척, 단위 µm, 점 = 키페이저). 정렬이 좋으면 불평형만의 작은 원이다. 미스얼라인이 생기면 커플링의 1X·2X 힘이 한 방향으로 미는 것이 더해져 오빗이 바나나 모양으로 휘고(약: 2X 19 µm p-p), 2X가 1X보다 커지면 8자가 된다(강: 1X 42 · 2X 62 µm p-p). 십자(+)는 각 오빗의 평균 자리 — Shaft centerline(P4-3)의 한 점이다. 예하중이 축을 위·오른쪽으로 밀어 정렬 양호(−70 µm)보다 42 µm 높이 떴다.':
    'Figure 3. Orbits at 2400 rpm (same scale, unit µm, dot = keyphasor). With good alignment it is the small circle of unbalance alone. With misalignment, the 1X and 2X coupling forces pushing in one direction are added, the orbit bends into a banana shape (mild: 2X 19 µm p-p), and when the 2X exceeds the 1X it becomes a figure eight (strong: 1X 42 · 2X 62 µm p-p). The cross (+) is the mean position of each orbit — one point of the shaft centerline (P4-3). The preload pushed the shaft up and to the right, 42 µm higher than with good alignment (−70 µm).',
  '정렬 양호': 'Good alignment',
  '미스얼라인 (약)': 'Misalignment (mild)',
  '미스얼라인 (강)': 'Misalignment (strong)',
  '점선 = 정렬 양호의 평균 자리': 'Dotted = mean position, good alignment',
  '그림 4. 커플링 양쪽 베어링의 축방향 진동 (설명용 파형, 같은 시각 기록). 위: 각 미스얼라인은 커플링이 두 축을 반대로 밀므로 전동기 쪽(파랑)과 펌프 쪽(주황)이 거울처럼 반대로 움직인다 — 1X·2X 모두 위상차 약 180°. 아래: 불평형만이면 축방향은 작고 두 쪽이 거의 같이 움직인다. 같은 방향으로 센서를 달았는지(극성)를 먼저 확인해야 180°를 믿을 수 있다.':
    'Figure 4. Axial vibration of the bearings on both sides of the coupling (explanatory waveforms, recorded at the same instant). Top: with angular misalignment the coupling pushes the two shafts in opposite directions, so the motor side (blue) and the pump side (orange) move oppositely like a mirror — phase difference about 180° for both 1X and 2X. Bottom: with unbalance alone the axial vibration is small and the two sides move almost together. First check that the sensors are mounted in the same direction (polarity); only then can the 180° be trusted.',
  '미스얼라인먼트': 'Misalignment',
  '회전각 [°]': 'Rotation angle [°]',
  '축방향 (상대)': 'Axial (relative)',
  '전동기 쪽': 'Motor side',
  '펌프 쪽': 'Pump side',
  '불평형만': 'Unbalance only',
  '그림 5. 구조적 풀림: 기계 받침(발)과 그 아래 베이스를 함께 잰 수직 변위 (설명용 모델, 받침 무게보다 큰 1X 힘). 위: 볼트가 조여 있으면 받침과 베이스가 함께 움직인다(1X 0.12 vs 0.09, 위상차 0.4°). 아래: 볼트가 풀리면 받침만 들렸다 떨어져 1X가 베이스의 6.2배, 위상차 37°이고, 파형이 위쪽으로만 솟아 2X가 1X의 0.48배다. 이음의 양쪽을 재서 진폭과 위상이 갑자기 바뀌는 곳을 찾는다.':
    'Figure 5. Structural looseness: vertical displacement measured at the machine foot and the base below it together (explanatory model, a 1X force larger than the foot weight). Top: with the bolts tight, the foot and the base move together (1X 0.12 vs 0.09, phase difference 0.4°). Bottom: when the bolts are loose, only the foot lifts and drops, so the 1X is 6.2 times the base with a phase difference of 37°, and the waveform rises only upward so the 2X is 0.48 times the 1X. Measure both sides of the joint and look for where the amplitude and phase suddenly change.',
  '볼트 조임': 'Bolts tight',
  '수직 (상대)': 'Vertical (relative)',
  '받침': 'Foot',
  '베이스': 'Base',
  '볼트 풀림': 'Bolts loose',
  '그림 6. 회전 풀림: 베어링 간극이 커져 축이 간극 바닥에 얹혀 있다가 불평형 힘이 무게를 이기는 순간 들렸다 떨어지는 로터 (간극 100 µm). 위: 수직 파형. 3600 rpm(파랑)은 아래가 바닥에 막혀 잘리고, 4200 rpm(주황)은 두 바퀴마다 모양이 되풀이된다. 아래: 수직 성분(p-p). 3600 rpm은 1X 위로 2X ~ 5X가 줄지어 서고(2X 58 · 3X 28 · 4X 16 µm), 4200 rpm은 ½X(110 µm)와 1½X(100 µm)가 선다. 같은 기계가 회전수에 따라 다른 지문을 보인다.':
    'Figure 6. Rotating looseness: a rotor whose bearing clearance has grown, so the shaft rests on the clearance floor and lifts and drops the moment the unbalance force exceeds the weight (clearance 100 µm). Top: vertical waveform. At 3600 rpm (blue) the bottom is blocked by the floor and cut off, and at 4200 rpm (orange) the shape repeats every two turns. Bottom: vertical components (p-p). At 3600 rpm 2X to 5X stand in a row above 1X (2X 58 · 3X 28 · 4X 16 µm), and at 4200 rpm ½X (110 µm) and 1½X (100 µm) stand. The same machine shows a different fingerprint depending on speed.',
  '간극 바닥': 'Clearance floor',
  '그림 7. 부분 러브 — 축이 한 바퀴의 일부 동안만 씰(회색 원, 반경 간극 100 µm)에 닿는다. 위: 오빗(점 = 키페이저). 4200 rpm(파랑)은 씰 원을 따라 크게 돌며 바닥에서 씰에 막힌다. 매 바퀴 닿는 자리가 조금씩 달라 키페이저 점이 한 자리에 모이지 않고 흩어진다 — 같은 모양이 정확히 되풀이되지 않는 운동이다. 7800 rpm(주황)은 임계속도의 약 2배라, 닿을 때마다 로터가 제 고유진동수로 울려 두 바퀴에 한 번 같은 모양이 된다 — 점이 두 자리이고, 수직 ½X 132 µm p-p가 1X(25 µm p-p)보다 훨씬 크다. 아래: Full spectrum(P5-3, 원의 반지름, 오른쪽 = 정방향, 왼쪽 = 역방향). 접촉은 하모닉과 역방향 성분을 만든다.':
    'Figure 7. Partial rub — the shaft touches the seal (gray circle, radial clearance 100 µm) for only part of each turn. Top: orbits (dot = keyphasor). At 4200 rpm (blue) it goes widely around the seal circle and is blocked by the seal at the bottom. The contact place differs a little each turn, so the keyphasor dots scatter instead of gathering in one place — a motion whose shape does not repeat exactly. 7800 rpm (orange) is about twice the critical speed, so each time it touches the rotor rings at its own natural frequency and the same shape repeats once every two turns — the dots are in two places, and the vertical ½X of 132 µm p-p is much larger than the 1X (25 µm p-p). Bottom: full spectrum (P5-3, circle radius, right = forward, left = reverse). Contact makes harmonics and a reverse component.',
  '차수 (− 역방향 · + 정방향)': 'Order (− reverse · + forward)',
  '그림 8. 원주 러브로 번질 때. 위: 정도 100 %의 부분 러브를 7800 · 8400 · 9000 rpm으로 돌린 Full spectrum. 가장 큰 성분이 역방향이고(−0.92X · −0.84X · −0.78X), 차수는 회전수마다 다르지만 주파수는 120 · 118 · 117 Hz로 거의 같다 — 역방향 선회가 회전수가 아니라 접촉으로 단단해진 계의 고유진동수에 잠긴다(dry whip). 가운데·아래: 마찰이 더 큰(마찰 계수 0.15) 씰에 6900 rpm으로 닿은 로터를 정지 위치에서 출발시킨 오빗과 반지름. 축이 씰 원주를 따라 미끄러지며 회전과 반대로 돌고(마지막 세 바퀴의 68 %가 역방향), 11바퀴 만에 간극의 1.8배(180 µm)를 넘어 계산을 멈췄다. 접촉 마찰이 축을 회전 반대로 미는 힘이 역방향 선회를 키우는 것으로(dry whirl), 실제 기계라면 씰·축이 크게 손상된다. 즉시 정지할 상황이다.':
    'Figure 8. When it spreads to full annular rub. Top: full spectrum of partial rub at severity 100 % run at 7800 · 8400 · 9000 rpm. The largest component is reverse (−0.92X · −0.84X · −0.78X); the orders differ with speed but the frequency is almost the same at 120 · 118 · 117 Hz — the reverse whirl is locked not to the speed but to the natural frequency of the system stiffened by contact (dry whip). Middle and bottom: the orbit and radius of a rotor touching a seal with more friction (friction coefficient 0.15) at 6900 rpm, started from the rest position. The shaft slides along the seal circumference and turns against the rotation (68 % of the last three turns reverse), and in 11 turns exceeded 1.8 times the clearance (180 µm), where the calculation was stopped. The force of contact friction pushing the shaft against the rotation grows the reverse whirl (dry whirl); in a real machine the seal and shaft would be badly damaged. This is a situation for an immediate stop.',
  '정도 100 % 부분 러브의 Full spectrum (원의 반지름)': 'Full spectrum of partial rub at severity 100 % (circle radius)',
  '오빗 (정지 위치에서 출발)': 'Orbit (started from rest position)',
  '회색 원 = 씰 간극': 'Gray circle = seal clearance',
  '축의 회전: 반시계': 'Shaft rotation: counterclockwise',
  '선회: 시계 (역방향)': 'Whirl: clockwise (reverse)',
  '바퀴': 'Turns',
  '씰 간극': 'Seal clearance',
  '그림 9. 열적 러브(Newkirk effect): 축이 씰에 닿는 쪽(high spot)이 마찰열로 데워져 그쪽으로 휘고, 휜 축이 다시 1X를 바꾼다. 4시간 동안의 1X 벡터 (Polar, 0°가 위, 지연은 시계 방향, 점 = 1시간마다, 설명용 모델). 왼쪽: 임계속도 아래(응답 지연 40°)에서는 휨의 응답이 high spot보다 조금 늦어 벡터가 회전 반대 방향으로 돌며 커진다(1.6 ∠40° → 4.6 ∠140°). 오른쪽: 임계속도 위(150°)에서는 휨이 진동을 줄이는 쪽이라 거의 그대로다(1.3 → 1.2). 크기는 불평형만의 응답에 대한 비. APHT(P6-4)에서 1X 벡터가 원이나 나선을 그리면 열적 원인을 의심한다(Morton effect는 P8-2).':
    'Figure 9. Thermal rub (Newkirk effect): the side where the shaft touches the seal (the high spot) is heated by friction and the shaft bows toward it, and the bent shaft changes the 1X again. The 1X vector over 4 hours (polar, 0° at the top, lag clockwise, dot = every hour, explanatory model). Left: below the critical speed (response lag 40°) the response of the bow lags the high spot a little, so the vector rotates against the rotation direction while growing (1.6 ∠40° → 4.6 ∠140°). Right: above the critical speed (150°) the bow tends to reduce the vibration, so it is almost unchanged (1.3 → 1.2). The size is a ratio to the response of unbalance alone. If the 1X vector draws a circle or a spiral in APHT (P6-4), suspect a thermal cause (Morton effect: P8-2).',
  '임계속도 아래 (지연 40°)': 'Below critical speed (lag 40°)',
  '임계속도 위 (지연 150°)': 'Above critical speed (lag 150°)',
};

export default EN;
