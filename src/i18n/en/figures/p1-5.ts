import type { Dict } from '../../translate';

/** src/figures/p1-5.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  "그림 6. 힘은 질량 1에만 가하고, 변위는 두 질량에서 각각 읽는다. 같은 입력 F₁에 대해 H₁₁은 x₁/F₁, H₂₁은 x₂/F₁이다. 아래 그림의 파랑과 주황은 이 두 응답 위치를 뜻한다.": "Figure 6. Apply force only to mass 1 and read displacement at both masses. For the same input F₁, H₁₁ is x₁/F₁ and H₂₁ is x₂/F₁. Blue and orange in the following plot identify these two response locations.",
  "입력 F₁": "Input F₁",
  "출력 x₁": "Output x₁",
  "출력 x₂": "Output x₂",
  '그림 1. 양쪽 벽 사이에 질량 2개와 스프링 3개(k, k_c, k)를 나란히 연결한 2자유도계. 움직이는 질량이 둘이므로 위치를 나타내는 변위도 x₁과 x₂ 두 개가 필요하다. 가운데 스프링 k_c가 두 질량의 움직임을 서로 엮는다(연성).':
    'Figure 1. A 2-DOF system with two masses and three springs (k, k_c, k) connected in a row between two walls. Because two masses can move, two displacements, x₁ and x₂, are needed to describe the positions. The middle spring k_c ties the motions of the two masses together (coupling).',
  '연성 k_c': 'Coupling k_c',
  '그림 2. 대칭 2자유도계의 두 가지 고유 모드 형상. 위(1차 모드): 두 질량이 같은 방향으로 같이 움직여(동상 [1, 1]) 가운데 스프링이 늘어나지도 줄어들지도 않는다. 고유진동수는 f₁ = 5.03 Hz다. 아래(2차 모드): 두 질량이 반대 방향으로 마주보며 움직여(역상 [1, −1]) 가운데 스프링이 2배로 찌그러진다. 유효 강성이 k + 2k_c가 되어 주파수가 √3배인 f₂ = 8.72 Hz로 높아진다.':
    'Figure 2. The two natural mode shapes of a symmetric 2-DOF system. Top (mode 1): the two masses move together in the same direction (in-phase [1, 1]), so the middle spring is neither stretched nor compressed. The natural frequency is f₁ = 5.03 Hz. Bottom (mode 2): the two masses move toward and away from each other (anti-phase [1, −1]), so the middle spring is squeezed twice as much. The effective stiffness becomes k + 2k_c and the frequency rises to f₂ = 8.72 Hz, √3 times higher.',
  '1차 모드: 동상 [1, 1] — 가운데 스프링 길이 불변': 'Mode 1: in-phase [1, 1] — middle spring length unchanged',
  '늘어남': 'Stretched',
  '길이 그대로': 'Unchanged',
  '줄어듦': 'Compressed',
  '2차 모드: 역상 [1, −1] — 가운데 스프링 2배 압축': 'Mode 2: anti-phase [1, −1] — middle spring squeezed 2×',
  '강하게 압축': 'Compressed hard',
  '그림 3. 모드 형상 비율대로 초기 조건을 준 경우. 위: 두 질량을 같은 방향(+10 mm)으로 당겼다 놓으면 두 파형(파랑 x₁, 주황 x₂)이 완전히 일치하며 f₁ = 5.03 Hz의 단일 정현파로만 진동한다. 아래: 서로 반대(+10 mm, −10 mm)로 당겼다 놓으면 위상이 180° 반대이면서 f₂ = 8.72 Hz로만 진동한다. 다른 모드는 전혀 나타나지 않는다.':
    'Figure 3. Initial conditions given in the ratio of a mode shape. Top: if both masses are pulled the same way (+10 mm) and released, the two waveforms (blue x₁, orange x₂) coincide exactly and vibrate only as a single sinusoid at f₁ = 5.03 Hz. Bottom: if they are pulled in opposite directions (+10 mm, −10 mm) and released, they vibrate 180° out of phase at f₂ = 8.72 Hz only. The other mode does not appear at all.',
  '모드 1 초기 조건 [10, 10] mm: 순수 5.03 Hz 동상 진동': 'Mode 1 initial condition [10, 10] mm: pure 5.03 Hz in-phase vibration',
  'x₁ (질량 1)': 'x₁ (mass 1)',
  'x₂ (질량 2)': 'x₂ (mass 2)',
  '모드 2 초기 조건 [10, −10] mm: 순수 8.72 Hz 역상 진동': 'Mode 2 initial condition [10, −10] mm: pure 8.72 Hz anti-phase vibration',
  '그림 4. 질량 1만 10 mm 당겼다 놓았을 때(x₂ = 0). 위: 실제 변위 파형 x₁(파랑)과 x₂(주황)는 단순한 정현파가 아니라 두 박자가 섞여 울렁거린다. 아래: x₁을 1차 모드 성분(5 mm cos ω₁t, 초록)과 2차 모드 성분(5 mm cos ω₂t, 보라)으로 분해했다. [10, 0] mm는 모드 1(5 mm)과 모드 2(5 mm)의 정확한 1:1 합이다.':
    'Figure 4. Only mass 1 is pulled 10 mm and released (x₂ = 0). Top: the actual displacement waveforms x₁ (blue) and x₂ (orange) are not simple sinusoids; two rhythms are mixed and they wobble. Bottom: x₁ is split into the mode 1 component (5 mm cos ω₁t, green) and the mode 2 component (5 mm cos ω₂t, purple). [10, 0] mm is an exact 1:1 sum of mode 1 (5 mm) and mode 2 (5 mm).',
  '실제 변위 파형: 두 모드가 섞인 복잡한 왕복': 'Actual displacement waveform: a complicated back-and-forth of two mixed modes',
  '질량 1의 모드 분해: x₁(t) = 모드 1(5 mm) + 모드 2(5 mm)': 'Modal decomposition of mass 1: x₁(t) = mode 1 (5 mm) + mode 2 (5 mm)',
  '실제 x₁ (합)': 'Actual x₁ (sum)',
  '모드 1 성분 (5.03 Hz)': 'Mode 1 component (5.03 Hz)',
  '모드 2 성분 (8.72 Hz)': 'Mode 2 component (8.72 Hz)',
  '그림 5. 가운데 스프링이 약할 때(k_c = 100 N/m, 0.1k) 질량 1만 당겼다 놓은 경우. 두 고유진동수(f₁ = 5.03 Hz, f₂ = 5.51 Hz)의 차이가 약 0.48 Hz로 매우 작아진다. 질량 1(파랑)의 진폭이 서서히 줄어드는 동안 질량 2(주황)의 진폭이 최대로 커지고, 다시 질량 1로 되돌아온다. 주기는 약 2.08초다.':
    'Figure 5. Only mass 1 is pulled and released when the middle spring is weak (k_c = 100 N/m, 0.1k). The difference between the two natural frequencies (f₁ = 5.03 Hz, f₂ = 5.51 Hz) becomes very small, about 0.48 Hz. While the amplitude of mass 1 (blue) slowly shrinks, the amplitude of mass 2 (orange) grows to its maximum, and then the energy returns to mass 1. The period is about 2.08 s.',
  '맥놀이 주기 T ≈ 2.08 s': 'Beat period T ≈ 2.08 s',
  '그림 7. 질량 1에 진폭 1 N의 조화 외력을 가했을 때의 주파수응답(FRF, 두 모드 모두 감쇠비 ζ = 0.04). 1자유도는 공진 봉우리가 1개였지만(P1-4), 2자유도는 고유진동수 f₁ = 5.03 Hz와 f₂ = 8.72 Hz 두 곳에서 각각 공진 봉우리가 솟는다. 첫 봉우리에서는 두 질량이 같은 방향(동상), 둘째 봉우리에서는 서로 반대 방향(역상)으로 크게 흔들린다.':
    'Figure 7. Frequency response (FRF) when a harmonic force of amplitude 1 N is applied to mass 1 (damping ratio ζ = 0.04 for both modes). An SDOF system had one resonance peak (P1-4), but a 2-DOF system has a resonance peak at each of the two natural frequencies, f₁ = 5.03 Hz and f₂ = 8.72 Hz. At the first peak the two masses swing strongly in the same direction (in-phase), and at the second in opposite directions (anti-phase).',
  'X₁ (질량 1 응답)': 'X₁ (mass 1 response)',
  'X₂ (질량 2 응답)': 'X₂ (mass 2 response)',
  '1차 공진 (5.03 Hz)': '1st resonance (5.03 Hz)',
  '2차 공진 (8.72 Hz)': '2nd resonance (8.72 Hz)',
  '가진 주파수 f [Hz]': 'Excitation frequency f [Hz]',
  '진폭 [mm]': 'Amplitude [mm]',
  '그림 8. 양 끝이 지지된 긴 배관이나 회전축(연속체)의 고유 모드 형상. 질량과 강성이 연속으로 퍼져 있어 모드가 1차, 2차, 3차…로 끝없이 이어진다. 1차 모드는 가운데가 가장 크게 휘고, 2차 모드는 가운데 절점(마디)을 중심으로 반대로 휘며, 3차 모드는 마디가 2개 생긴다. 실제 진단에서는 관심 주파수 대역의 낮은 차수 몇 개만 살핀다.':
    'Figure 8. Natural mode shapes of a long pipe or rotor shaft (a continuum) supported at both ends. Mass and stiffness are spread continuously, so the modes continue without end: 1st, 2nd, 3rd... The 1st mode bends most at the middle, the 2nd mode bends in opposite directions about the middle node, and the 3rd mode has two nodes. In real diagnosis you look only at the few lowest orders in the frequency band of interest.',
  '1차 굽힘 모드: 마디 0개 (가장 낮은 고유진동수)': '1st bending mode: 0 nodes (lowest natural frequency)',
  '지지점': 'Support',
  '축 길이 방향 위치': 'Position along the shaft',
  '변위 형상': 'Displacement shape',
  '2차 굽힘 모드: 마디 1개 (중간 고유진동수)': '2nd bending mode: 1 node (middle natural frequency)',
  '마디 (절점)': 'Node',
  '3차 굽힘 모드: 마디 2개 (높은 고유진동수)': '3rd bending mode: 2 nodes (high natural frequency)',
  '마디 1': 'Node 1',
  '마디 2': 'Node 2',
};

export default EN;
