import type { Dict } from '../../translate';

/** src/figures/p7-5.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 구름베어링을 축을 지나는 면으로 자른 단면 (위쪽 절반, 볼 하나). 볼 지름 d, 피치 지름 D(볼 중심이 그리는 원의 지름). 초록 선은 볼이 외륜·내륜에 닿는 두 점을 잇는 접촉선이다. 왼쪽: 깊은 홈 볼베어링은 반경 방향으로 닿는다(접촉각 α = 0). 오른쪽: 앵귤러 볼베어링은 외륜의 오른쪽, 내륜의 왼쪽 어깨(턱)만 높아 볼이 비스듬히 닿고(α ≠ 0) 축방향 하중도 받는다. 볼이 궤도에서 구르는 반지름 D/2 ∓ (d/2)cos α가 α에 따라 달라져 결함 주파수가 바뀐다.':
    'Figure 1. Cross-section of a rolling-element bearing cut through the shaft axis (upper half, one ball). Ball diameter d, pitch diameter D (the diameter of the circle traced by the ball centers). The green line is the contact line joining the two points where the ball touches the outer and inner races. Left: a deep-groove ball bearing touches in the radial direction (contact angle α = 0). Right: in an angular contact ball bearing only the right shoulder (lip) of the outer race and the left shoulder of the inner race are high, so the ball touches at an angle (α ≠ 0) and the bearing also carries axial load. The radius D/2 ∓ (d/2)cos α at which the ball rolls on the race depends on α, so the fault frequencies change.',
  '깊은 홈 볼베어링 (α = 0)': 'Deep-groove ball bearing (α = 0)',
  '축 중심선': 'Shaft centerline',
  외륜: 'Outer race',
  내륜: 'Inner race',
  '앵귤러 볼베어링 (α ≠ 0)': 'Angular contact ball bearing (α ≠ 0)',
  // 그림 2
  '그림 2. 6205의 치수(볼 9개, d/D = 0.203)를 그대로 두고 접촉각 α만 바꿨을 때의 결함 주파수 (1X의 배수). α가 커지면 cos α가 작아져 볼이 내륜·외륜에서 구르는 반지름 차이가 줄어든다 — BPFO는 3.585X → 3.799X로 오르고 BPFI는 5.415X → 5.201X로 내린다(α = 40°). 둘의 합은 언제나 볼 수 × 1X = 9X다. 보라 곡선 2×BSF(볼 결함 박자)는 4.713X → 4.798X로 조금만 오른다. 회색 점선은 어림값 0.4·N_r = 3.6X와 0.6·N_r = 5.4X — α = 0, d/D ≈ 0.2일 때 잘 맞고 α가 크면 어긋난다.':
    'Figure 2. Fault frequencies (multiples of 1X) when only the contact angle α is changed and the 6205 dimensions (9 balls, d/D = 0.203) are kept. As α grows, cos α gets smaller and the difference between the radii at which the ball rolls on the inner and outer races shrinks: BPFO rises from 3.585X to 3.799X and BPFI falls from 5.415X to 5.201X (α = 40°). Their sum is always the number of balls × 1X = 9X. The purple curve, 2×BSF (the ball-fault rhythm), rises only a little, from 4.713X to 4.798X. The gray dotted lines are the approximations 0.4·N_r = 3.6X and 0.6·N_r = 5.4X, which fit well for α = 0 and d/D ≈ 0.2 and go off when α is large.',
  'BPFI (내륜)': 'BPFI (inner race)',
  '2×BSF (볼)': '2×BSF (ball)',
  'BPFO (외륜)': 'BPFO (outer race)',
  '접촉각 α [°]': 'Contact angle α [°]',
  // 그림 3
  '그림 3. 볼 결함은 볼이 한 바퀴 자전하는 동안 두 번 친다. 위: 흠(초록 점)이 외륜에 닿고, 반 바퀴 뒤에는 내륜에 닿는다. 아래: 충격 시각 (외륜 쪽 파랑, 내륜 쪽 주황, 높이는 설명용 세기). 충격 간격은 1/(2×BSF) = 3.6 ms이고 같은 쪽끼리는 1/BSF = 7.19 ms다. 내륜 쪽 충격은 볼을 거쳐 하우징에 닿아 더 약하다. 볼은 케이지와 함께 돌아 하중 영역을 FTF 주기(42.6 ms)마다 한 번 지나므로, 충격 크기가 FTF로 오르내린다.':
    'Figure 3. A ball fault strikes twice while the ball spins once. Top: the flaw (green dot) touches the outer race, and half a turn later touches the inner race. Bottom: impact times (outer-race side blue, inner-race side orange; heights are explanatory strengths). The spacing between impacts is 1/(2×BSF) = 3.6 ms, and between impacts on the same side 1/BSF = 7.19 ms. The inner-race impact reaches the housing through the ball and is weaker. The ball travels with the cage and passes through the load zone once per FTF period (42.6 ms), so the impact size rises and falls at FTF.',
  '흠이 외륜에 닿는 순간': 'Flaw touches the outer race',
  '자전 반 바퀴': 'Half a spin',
  '반 바퀴 뒤: 흠이 내륜에 닿는다': 'Half a turn later: touches the inner race',
  '충격 시각과 세기 (볼 결함, 설명용)': 'Impact times and strengths (ball fault, explanatory)',
  '외륜에 닿을 때': 'On the outer race',
  '내륜에 닿을 때': 'On the inner race',
  'FTF 주기 42.6 ms': 'FTF period 42.6 ms',
  세기: 'Strength',
  // 그림 4
  '그림 4. 결함 위치마다의 엔벨로프 스펙트럼 (펌프 3575 rpm, 6205, 3단계, 대역 2.8 ~ 3.8 kHz, 설명용). 점선은 실제 신호의 결함 주파수다(미끄럼 1 %로 계산값보다 조금 어긋난 자리). ① 외륜: BPFO(211.5 Hz)와 하모닉만, 측대역이 없다. ② 내륜: BPFI(324.8 Hz) 양옆에 1X 간격의 측대역과 1X 자체. ③ 볼: 2×BSF(278 Hz)가 가장 크고 양옆 23.5 Hz(FTF) 자리에 측대역(−FTF·+FTF), 낮은 쪽에 FTF·BSF. ④ 케이지: FTF(23.5 Hz)와 그 하모닉 — 기본 줄 FTF는 1X보다 낮고 하모닉은 1X 위로도 이어진다. 다른 위치보다 줄이 7 ~ 14배 작다.':
    'Figure 4. Envelope spectrum for each fault location (pump at 3575 rpm, 6205, stage 3, band 2.8 to 3.8 kHz, explanatory). Dotted lines are the fault frequencies of the actual signal (positions a little off the calculated values because of 1 % slip). ① Outer race: only BPFO (211.5 Hz) and harmonics, no sidebands. ② Inner race: sidebands spaced at 1X on both sides of BPFI (324.8 Hz), and 1X itself. ③ Ball: 2×BSF (278 Hz) is the largest, with sidebands (−FTF, +FTF) at 23.5 Hz (FTF) on both sides, and FTF and BSF on the low side. ④ Cage: FTF (23.5 Hz) and its harmonics; the fundamental FTF is below 1X and the harmonics continue above 1X. The lines are 7 to 14 times smaller than at the other locations.',
  '① 외륜 결함': '① Outer-race fault',
  '② 내륜 결함': '② Inner-race fault',
  '③ 볼 결함': '③ Ball fault',
  '④ 케이지 결함': '④ Cage fault',
  // 그림 5
  '그림 5. 외륜 결함이 진행하는 네 단계의 가속도 스펙트럼 (dB re 1 g, 0 ~ 32 kHz, 회색 = 건전, 설명용 모델). 음영은 일반 가속도 측정 대역(0 ~ 10 kHz)이다. 12 kHz 아래의 높은 바닥은 기계의 다른 소리(유동·전자기 등)이고, 그 위는 조용하다. 1단계의 작은 충격은 3.3 kHz 공진을 거의 울리지 못해 일반 측정 대역은 건전과 같고, 조용한 12 kHz 위 대역이 올라오며 24 kHz 둘레가 건전보다 약 25 dB 높아 가장 많이 올라온다. 2단계에서 3.3 kHz 부품 공진이 울리기 시작하고, 3단계에서는 울림이 커진다. 4단계에서는 손상이 넓어져 넓은 대역의 바닥이 함께 올라간다.':
    'Figure 5. Acceleration spectra of the four stages of an advancing outer-race fault (dB re 1 g, 0 to 32 kHz, gray = healthy, explanatory model). The shading is the normal accelerometer band (0 to 10 kHz). The high floor below 12 kHz is other machine sound (flow, electromagnetic, etc.), and above that it is quiet. The small impacts of stage 1 hardly ring the 3.3 kHz resonance, so the normal measurement band is the same as healthy, while the quiet band above 12 kHz comes up and around 24 kHz it is about 25 dB above healthy, the largest rise. At stage 2 the 3.3 kHz part resonance starts to ring, and at stage 3 the ringing grows. At stage 4 the damage has spread and the floor of the broad band rises with it.',
  '1단계: 초음파 대역에만 작은 언덕': 'Stage 1: small hump only in ultrasonic band',
  결함: 'Fault',
  '일반 측정 0 ~ 10 kHz': 'Normal band 0 to 10 kHz',
  '2단계: 부품 공진(3.3 kHz)이 울린다': 'Stage 2: part resonance (3.3 kHz) rings',
  '3단계: 울림이 커지고 낮은 주파수에도 결함 줄': 'Stage 3: ringing grows, fault lines at low frequency too',
  '4단계: 바닥 전체가 올라간다': 'Stage 4: whole floor rises',
  // 그림 6
  '그림 6. 같은 외륜 결함의 속도 스펙트럼 0 ~ 1000 Hz (mm/s rms). 2단계에는 결함 줄이 없다(BPFO 0.036 mm/s) — 엔벨로프에는 이미 또렷한데도. 3단계에서 BPFO와 하모닉이 선다(BPFO 0.72 mm/s). 4단계에서는 1X가 2.9 mm/s로 커지고 바닥이 조금 올라오며, BPFO 줄은 0.23 mm/s로 오히려 작아져 바닥에 묻혀 간다.':
    'Figure 6. Velocity spectrum 0 to 1000 Hz of the same outer-race fault (mm/s rms). At stage 2 there is no fault line (BPFO 0.036 mm/s), even though it is already clear in the envelope. At stage 3, BPFO and its harmonics stand (BPFO 0.72 mm/s). At stage 4, 1X grows to 2.9 mm/s and the floor rises a little, while the BPFO line actually gets smaller, 0.23 mm/s, and sinks into the floor.',
  '2단계': 'Stage 2',
  '3단계': 'Stage 3',
  '4단계': 'Stage 4',
  // 그림 7
  '그림 7. 외륜 결함의 단계마다 결함이 잘 보이는 숫자가 옮겨 간다. 위: 엔벨로프 스펙트럼의 BPFO 줄 ÷ 바닥 — 초음파 대역(20 ~ 28 kHz)은 1단계부터 78배, 공진 대역(2.8 ~ 3.8 kHz)은 2단계부터 117배, 4단계에는 3.4배·4.6배로 떨어진다. 가운데: 속도 스펙트럼의 BPFO 줄은 3단계에만 크고, 1X는 4단계에 커진다. 아래: 가속도 첨도(0 ~ 10 kHz)는 2 ~ 3단계에 오르고 4단계에 다시 3 근처로 내려온다 (P5-7).':
    'Figure 7. The number that shows an outer-race fault best shifts from stage to stage. Top: BPFO line ÷ floor in the envelope spectrum; the ultrasonic band (20 to 28 kHz) gives 78 times from stage 1, the resonance band (2.8 to 3.8 kHz) gives 117 times from stage 2, and at stage 4 they drop to 3.4 and 4.6 times. Middle: the BPFO line in the velocity spectrum is large only at stage 3, and 1X grows at stage 4. Bottom: acceleration kurtosis (0 to 10 kHz) rises at stages 2 to 3 and comes back down near 3 at stage 4 (P5-7).',
  '엔벨로프: BPFO 줄 ÷ 바닥': 'Envelope: BPFO line ÷ floor',
  '초음파 대역': 'Ultrasonic band',
  '공진 대역': 'Resonance band',
  '1단계': 'Stage 1',
  '[배]': '[×]',
  'BPFO 줄': 'BPFO line',
  '가속도 첨도 (0 ~ 10 kHz)': 'Accel. kurtosis (0 to 10 kHz)',
};

export default EN;
