import type { Dict } from '../../translate';

/** src/figures/p10-1.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 기계에서 Part를 고르는 순서(공개 적용 범위 요약). 위에서부터 묻고 처음 "예"인 곳의 Part를 펼칩니다. 맨 위의 20816-1은 측정 방법과 두 기준을 정하는 공통 바탕이고, 각 Part의 제외 항목은 원문에서 다시 확인합니다.':
    'Figure 1. The order for picking a Part from the machine (summary of the public scope statements). Ask from the top down and open the Part at the first "yes". 20816-1 at the top is the common foundation that defines the measurement method and the two criteria; check each Part\'s exclusions again in the original text.',
  'ISO 20816-1 일반 지침 — 측정 방법과 두 기준(크기 · 변화)의 공통 바탕':
    'ISO 20816-1 general guideline — common basis of method and two criteria',
  '대형 GT · ST · 발전기': 'Large GT · ST · generator',
  '40 MW 초과 · 유막 베어링 · 정격 1500·1800·3000·3600 rpm': '> 40 MW · oil-film bearings · rated 1500·1800·3000·3600 rpm',
  '유막 베어링 GT': 'Oil-film-bearing GT',
  '3 MW 초과 · 항공 전용형(aero-derivative)과 -2 대상은 제외': '> 3 MW · aero-derivative and -2 machines excluded',
  '수력 발전 · 양수 설비': 'Hydro · pumped storage',
  '발전기 · 수차 · 펌프-수차의 기계 세트': 'Generator · turbine · pump-turbine sets',
  '산업용 기계': 'Industrial machines',
  '15 kW 초과 · 120 ~ 30 000 rpm · 출력과 지지 강성으로 다시 분류': '> 15 kW · 120 ~ 30 000 rpm · regrouped by power, support stiffness',
  '그 밖: -8 왕복 압축기 · -9 기어 장치 · -21 풍력 — 아직 10816으로 남은 -6 왕복 기계 · -7 펌프':
    'Others: -8 recip. compressors · -9 gear units · -21 wind — still 10816: -6 recip. machines · -7 pumps',
  // 그림 2
  '그림 2. 같은 베어링에 붙은 두 센서. 위 — 속도 센서(파랑)는 공간에 대한 하우징의 움직임을, 프록시미티 프로브(주황)는 베어링에 대한 축의 움직임을 잽니다. 가운데 — 하우징 속도는 RMS(1.56 mm/s)로, 아래 — 축 변위는 p-p(43.3 µm)로 읽습니다. 기준·위치·통계량이 모두 달라 한 판정표에 넣을 수 없습니다.':
    'Figure 2. Two sensors on the same bearing. Top — the velocity sensor (blue) measures the housing\'s motion relative to space, and the proximity probe (orange) measures the shaft\'s motion relative to the bearing. Middle — housing velocity is read as RMS (1.56 mm/s); bottom — shaft displacement is read as p-p (43.3 µm). The reference, location and statistic all differ, so they cannot go into one evaluation table.',
  '속도 센서': 'Velocity sensor',
  프로브: 'Probe',
  '비회전부 진동 — 하우징 위의 속도 센서': 'Non-rotating part — velocity sensor on housing',
  '공간에 대한 하우징의 움직임': 'Housing motion relative to space',
  '평가량: 속도 RMS [mm/s], 넓은 주파수 대역': 'Quantity: velocity RMS [mm/s], broadband',
  '축 상대 진동 — 하우징에 고정한 프로브': 'Shaft relative vibration — probe fixed to housing',
  '베어링(프로브)에 대한 축의 움직임': 'Shaft motion relative to bearing (probe)',
  '평가량: 변위 p-p [µm], 베어링 간극과 견줌': 'Quantity: displacement p-p [µm], vs. bearing clearance',
  '하우징 속도 [mm/s]': 'Housing velocity [mm/s]',
  '축 변위 [µm]': 'Shaft displacement [µm]',
  // 그림 3
  '그림 3. 같은 크기 3(파랑 선)이 위의 기계 분류 X(가상 경계 2·5·9)에서는 B, 아래 분류 Y(가상 경계 1·2.5·5)에서는 C입니다. 구간 이름(A ~ D)의 뜻은 같아도 경계는 기계 분류와 평가량마다 다릅니다. 실제 mm/s·µm 경계가 아닙니다.':
    'Figure 3. The same magnitude 3 (blue line) is B in machine class X above (made-up boundaries 2·5·9) and C in class Y below (made-up boundaries 1·2.5·5). The meaning of the zone names (A to D) is the same, but the boundaries differ with the machine class and the evaluated quantity. These are not real mm/s or µm boundaries.',
  '가상 크기 x [무차원]': 'Made-up magnitude x [dimensionless]',
  '새 기계 수준': 'New machine',
  '장기 운전 가능': 'Long-term OK',
  '제한 운전 · 원인 조치': 'Restricted · fix cause',
  '손상 위험': 'Damage risk',
  '기계 분류 X — 가상 경계 2 · 5 · 9': 'Machine class X — made-up boundaries 2 · 5 · 9',
  '기계 분류 Y — 가상 경계 1 · 2.5 · 5': 'Machine class Y — made-up boundaries 1 · 2.5 · 5',
  '현재 3': 'Now 3',
  // 그림 4
  '그림 4. 가상 60일 기록(LAB-ISO-01 기본값). 기준선 2.5(회색 점선)이 30일째 4로 올랐지만 값은 끝까지 B 구간(2 ~ 5)입니다. 같은 기록을 변화로 보면, 보라 점선의 변화 비교 띠(기준선 ± 20 % × B/C = 1.5 ~ 3.5)를 30일째 벗어납니다. 경계 2·5·9와 20 %는 가상값입니다.':
    'Figure 4. A made-up 60-day record (LAB-ISO-01 defaults). The value rose from the baseline 2.5 (gray dotted line) to 4 on day 30, but stays in zone B (2 to 5) to the end. Seen as a change instead, it leaves the purple dashed change band (baseline ± 20 % × B/C = 1.5 to 3.5) on day 30. The boundaries 2·5·9 and the 20 % are made-up values.',
  '가상 기록 날짜 [일]': 'Made-up record date [day]',
  '가상 전체값 x': 'Made-up overall value x',
  '기준선 2.5': 'Baseline 2.5',
  '변화 비교 띠 3.5': 'Change band 3.5',
  '30일째 변화 띠를 벗어남': 'Leaves change band, day 30',
  // 그림 5
  '그림 5. 같은 분류(가상 경계 2·5·9)의 두 기계. 알람은 각 기계의 기준선에서 출발해 여유(예제: 20 % × B/C = 1)를 더합니다 — 기계 P는 2, 기계 Q는 5.6가 되지만 크기 경계를 크게 넘지 않게 상한을 두어 5입니다. 트립(검정 점선)은 기계 보호용으로, C·D 구간 안에서 제조사 자료로 정합니다. 숫자는 모두 가상값입니다.':
    'Figure 5. Two machines in the same class (made-up boundaries 2·5·9). The alarm starts from each machine\'s baseline and adds a margin (example: 20 % × B/C = 1) — that gives 2 for machine P and 5.6 for machine Q, but the alarm of Q is capped at 5 so it does not go far past the magnitude boundary. The trip (black dashed line) is for machine protection and is set within zones C and D from manufacturer data. All numbers are made-up values.',
  '가상 크기 [무차원]': 'Made-up magnitude [dimensionless]',
  '기준선 1': 'Baseline 1',
  '알람 2': 'Alarm 2',
  '기계 P': 'Machine P',
  '기준선 4.6': 'Baseline 4.6',
  '기준선 + 여유 = 5.6': 'Baseline + margin = 5.6',
  '알람 5 (예제 상한 = B/C)': 'Alarm 5 (cap = B/C)',
  '기계 Q': 'Machine Q',
  '트립: 보호용 — C·D 구간 안에서 제조사 자료로 (기동 중 배율은 P3-5)': 'Trip: protection — within C·D, from manufacturer data (start-up multiplier: P3-5)',
  // 그림 6
  '그림 6. 1X 벡터(극좌표, 0° 위·지연각 시계 방향). 기준 3 ∠ 30°에서 지금 3 ∠ 120°로 위상만 돌았습니다. 크기(진폭) 변화는 0이지만 벡터 차(보라 화살표)는 4.24 — 크기의 √2배입니다. 전체값이나 진폭만 보는 변화 판정으로는 보이지 않습니다.':
    'Figure 6. The 1X vector (polar plot, 0° at top, lag angle clockwise). Only the phase turned, from the reference 3 ∠ 30° to now 3 ∠ 120°. The magnitude (amplitude) change is 0, but the vector difference (purple arrow) is 4.24 — √2 times the magnitude. A change evaluation that looks only at the overall value or the amplitude does not see it.',
  '기준 3 ∠ 30°': 'Reference 3 ∠ 30°',
  '지금 3 ∠ 120°': 'Now 3 ∠ 120°',
  '크기만 보면': 'By magnitude only',
  '|V| = 3 → 3, 변화 0': '|V| = 3 → 3, change 0',
  '벡터로 보면': 'As a vector',
  '같은 회전수·부하에서의 위상 변화도 변화다': 'A phase change at the same speed and load is also a change',
  // 그림 7
  '그림 7. 같은 베어링 하우징의 가상 속도 스펙트럼(성분 RMS). 위 — 기준, 아래 — 지금. 지금은 1X가 2.6 → 2.49 mm/s로 조금 줄고 237 Hz와 그 배수에 구름베어링 외륜 결함 줄(황토, P7-5)이 생겼지만, 전체값은 둘 다 2.78 mm/s RMS입니다. 구간·변화 판정은 이 차이를 보지 못합니다.':
    'Figure 7. Made-up velocity spectra (component RMS) of the same bearing housing. Top — reference; bottom — now. Now the 1X dropped a little, 2.6 → 2.49 mm/s, and outer-race fault lines of a rolling-element bearing (ochre, P7-5) have appeared at 237 Hz and its multiples, yet the overall value is 2.78 mm/s RMS in both. The zone and change evaluations do not see this difference.',
  '기준 — 전체값 2.78 mm/s RMS': 'Reference — overall 2.78 mm/s RMS',
  '속도 [mm/s RMS]': 'Velocity [mm/s RMS]',
  '지금 — 전체값 2.78 mm/s RMS': 'Now — overall 2.78 mm/s RMS',
  '외륜 결함 줄 (BPFO와 배수)': 'Outer-race fault lines (BPFO, multiples)',
};

export default EN;
