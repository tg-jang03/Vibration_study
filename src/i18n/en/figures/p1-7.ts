import type { Dict } from '../../translate';

/** src/figures/p1-7.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 불평형이 있는 1자유도 회전체 모델. 회전체와 함께 흔들리는 기계 전체(회색 상자, 질량 M)가 스프링 k와 감쇠기 c로 지지되어 있다. 원판(파랑)의 회전 중심 O에서 거리 e만큼 떨어진 곳에 불평형 질량 m_u가 붙어 각속도 Ω로 회전한다. 함께 도는 원심력 F_u = m_u e Ω²의 수평 성분 F_x(t) = F_u cos(Ωt)가 기계를 좌우로 흔든다.':
    'Figure 1. A one-degree-of-freedom rotor model with unbalance. The whole machine that shakes with the rotor (gray box, mass M) is supported by a spring k and a damper c. An unbalance mass m_u sits at a distance e from the rotation center O of the disk (blue) and rotates at angular speed Ω. The horizontal component F_x(t) = F_u cos(Ωt) of the co-rotating centrifugal force F_u = m_u e Ω² shakes the machine left and right.',
  '감쇠 c': 'Damping c',
  '진동하는 전체 질량 M': 'Vibrating total mass M',
  '회전 Ω': 'Rotation Ω',
  '회전 중심 O': 'Rotation center O',
  '불평형 질량 m_u': 'Unbalance mass m_u',
  '원심력 F_u': 'Centrifugal force F_u',
  '수평 변위 x(t)': 'Horizontal displacement x(t)',
  // 그림 2
  '그림 2. 회전수(rpm)에 따른 불평형 원심력 크기(F_u = m_u e Ω², m_u e = 0.01 kg·m). 1500 rpm에서 약 247 N이던 원심력이 회전수가 2배인 3000 rpm에서는 4배인 987 N, 4배인 6000 rpm에서는 16배인 3948 N이 된다. 회전수가 올라갈수록 곡선이 가팔라지는 것이 제곱 비례의 모양이다.':
    'Figure 2. Unbalance centrifugal force versus speed (rpm) (F_u = m_u e Ω², m_u e = 0.01 kg·m). The force of about 247 N at 1500 rpm becomes 987 N (4 times) at 3000 rpm, twice the speed, and 3948 N (16 times) at 6000 rpm, four times the speed. The curve getting steeper as speed rises is the shape of a square law.',
  '원심력 F_u [N]': 'Centrifugal force F_u [N]',
  '3000 rpm: 987 N (4배)': '3000 rpm: 987 N (×4)',
  '6000 rpm: 3948 N (16배)': '6000 rpm: 3948 N (×16)',
  '원심력 크기 F_u [N]': 'Centrifugal force F_u [N]',
  // 그림 3
  '그림 3. 3000 rpm(50 Hz) 정상상태에서 세 바퀴(60 ms, 한 바퀴 T = 20 ms) 동안의 불평형 외력 수평 성분(위, 주황 점선)과 수평 변위 응답(아래, 파랑 실선). 회전수가 50 Hz이므로 수평 진동도 정확히 50 Hz 정현파로 나타난다(1X 진동). 공진(3000 rpm)에서는 변위가 힘보다 90°(1/4 주기, 5 ms) 늦게 정점을 찍는다.':
    'Figure 3. Horizontal component of the unbalance force (top, orange dashed) and the horizontal displacement response (bottom, blue solid) over three turns (60 ms, one turn T = 20 ms) in steady state at 3000 rpm (50 Hz). Because the speed is 50 Hz, the horizontal vibration is also exactly a 50 Hz sinusoid (1X vibration). At resonance (3000 rpm) the displacement peaks 90° (a quarter period, 5 ms) after the force.',
  '수평 외력 성분 F_x(t)': 'Horizontal force component F_x(t)',
  '수평 외력 F_x [kN]': 'Horizontal force F_x [kN]',
  '외력 [kN]': 'Force [kN]',
  '수평 변위 응답 x(t) (위상 지연 φ = 90°)': 'Horizontal displacement response x(t) (phase lag φ = 90°)',
  '수평 변위 x [mm]': 'Horizontal displacement x [mm]',
  '위상 지연 90° (5 ms)': 'Phase lag 90° (5 ms)',
  // 그림 4
  '그림 4. 불평형 응답의 무차원 진폭비(위)와 위상각(아래). 일반 강제진동(P1-4)과 달리 정지 시(r = 0) 진폭비가 0에서 출발한다. r = 1(임계속도) 근처에서 진폭이 1/(2ζ)로 크게 치솟고 위상은 90°를 지나며, r ≫ 1인 초임계 영역에서는 진폭비가 정확히 1로 수렴한다(변위 X → m_u e / M = 0.1 mm). 위상은 180°로 수렴한다.':
    'Figure 4. Dimensionless amplitude ratio (top) and phase angle (bottom) of the unbalance response. Unlike ordinary forced vibration (P1-4), the amplitude ratio starts from 0 at rest (r = 0). Near r = 1 (critical speed) the amplitude shoots up to 1/(2ζ) and the phase passes 90°; in the supercritical range r ≫ 1 the amplitude ratio converges to exactly 1 (displacement X → m_u e / M = 0.1 mm). The phase converges to 180°.',
  '무차원 진폭비 X / (m_u e / M)': 'Dimensionless amplitude ratio X / (m_u e / M)',
  'r = 1 (임계속도)': 'r = 1 (critical speed)',
  '진동수비 r = Ω/ω_n': 'Frequency ratio r = Ω/ω_n',
  '진폭비': 'Amplitude ratio',
  '공진 시 90° 지연': '90° lag at resonance',
  '위상 지연 [°]': 'Phase lag [°]',
  // 그림 5
  '그림 5. 일반 강제진동(파랑, P1-4)과 불평형 진동(주황, P1-7)의 증폭 특성 비교 (ζ = 0.05). 일반 강제진동은 힘의 크기가 일정하여 r = 0에서 정적 처짐 1을 가지며 고속에서는 0으로 줄어든다. 반면 불평형 진동은 힘이 속도 제곱에 비례하므로 r = 0에서 0이고, 고속(r ≫ 1)에서는 진폭비 1(편심 거리 m_u e / M)로 수렴한다.':
    'Figure 5. Comparison of the amplification of ordinary forced vibration (blue, P1-4) and unbalance vibration (orange, P1-7) (ζ = 0.05). Ordinary forced vibration has a constant force, so it starts with a static deflection of 1 at r = 0 and shrinks to 0 at high speed. Unbalance vibration, whose force is proportional to speed squared, is 0 at r = 0 and converges at high speed (r ≫ 1) to an amplitude ratio of 1 (the eccentricity m_u e / M).',
  '외력 일정 강제진동 (P1-4)': 'Constant-force forced vibration (P1-4)',
  '불평형 원심력 진동 (P1-7)': 'Unbalance centrifugal vibration (P1-7)',
  'P1-4: 1에서 출발': 'P1-4: starts at 1',
  'P1-7: 0에서 출발': 'P1-7: starts at 0',
  '응답 진폭비': 'Response amplitude ratio',
  // 그림 6
  '그림 6. 회전수를 1초에 1200 rpm씩 0에서 6000 rpm까지 올리는 런업(Run-up) 중의 수평 변위 파형(파랑)과 진폭(회색 점선). 각 순간의 정상상태 진폭으로 그린 개념도다. 저속에서는 진폭이 작다가, 고유진동수(50 Hz, 3000 rpm)를 지나는 2.5초 근처에서 1 mm(편심 거리 0.1 mm의 10배)까지 커진다. 지나고 나면 다시 줄어 6000 rpm(r = 2)에서 0.133 mm가 되고, 회전수를 더 올리면 편심 거리 0.1 mm에 다가간다.':
    'Figure 6. Horizontal displacement waveform (blue) and amplitude (gray dotted) during a run-up in which the speed is raised by 1200 rpm per second from 0 to 6000 rpm. It is a conceptual plot drawn with the steady-state amplitude at each instant. The amplitude is small at low speed, then grows to 1 mm (ten times the eccentricity of 0.1 mm) around 2.5 s, where the natural frequency (50 Hz, 3000 rpm) is passed. Afterwards it shrinks again to 0.133 mm at 6000 rpm (r = 2) and approaches the eccentricity of 0.1 mm as the speed rises further.',
  '진폭 X': 'Amplitude X',
  '공진 피크 1 mm (3000 rpm, t = 2.5 s)': 'Resonance peak 1 mm (3000 rpm, t = 2.5 s)',
  '가속 시간 t [s] (회전수 = 1200 × t rpm)': 'Acceleration time t [s] (speed = 1200 × t rpm)',
  // 그림 7
  '그림 7. 로터를 축 방향에서 본 모습. 점선 원은 축 중심 O가 그리는 궤도, 파란 원은 축 단면, 주황 화살표는 O에서 본 무거운 점(m_u)의 방향이다 (크기는 보기 쉽게 과장했다). 위(아임계): 변위가 힘과 같은 쪽으로 나서 O가 무거운 점 쪽으로 밀리고, 무거운 점은 궤도 바깥쪽을 향한다. 아래(초임계): 변위가 힘의 반대쪽으로 나서 O가 무거운 점의 반대쪽으로 밀리고, 무거운 점은 궤도 안쪽을 향한다. 이때 전체 질량 중심 G가 베어링 중심에 머물고, O는 그 둘레를 반지름 e_cg로 돈다(질량 중심 회전).':
    'Figure 7. The rotor viewed along the shaft axis. The dotted circle is the orbit traced by the shaft center O, the blue circle is the shaft cross-section, and the orange arrow is the direction of the heavy spot (m_u) as seen from O (sizes exaggerated for visibility). Top (subcritical): the displacement is on the same side as the force, so O is pushed toward the heavy spot, which points to the outside of the orbit. Bottom (supercritical): the displacement is on the side opposite the force, so O is pushed away from the heavy spot, which points to the inside of the orbit. The center of mass G of the whole then stays on the bearing center, and O circles around it at radius e_cg (mass-center rotation).',
  '아임계 (r ≪ 1, 저속): 위상 지연 ≈ 0°': 'Subcritical (r ≪ 1, low speed): phase lag ≈ 0°',
  'O의 궤도': 'Orbit of O',
  '베어링 중심': 'Bearing center',
  'm_u 방향': 'm_u direction',
  '변위가 힘과 같은 쪽 (위상 ≈ 0°)': 'Displacement on the force side (phase ≈ 0°)',
  '축 중심 O가 무거운 점 쪽으로 밀린다': 'Shaft center O is pushed toward the heavy spot',
  '무거운 점은 궤도 바깥쪽을 향한다': 'The heavy spot points outside the orbit',
  '초임계 (r ≫ 1, 고속): 위상 지연 ≈ 180° — 질량 중심 회전': 'Supercritical (r ≫ 1, high speed): phase lag ≈ 180° — mass-center rotation',
  '베어링 중심 = 질량 중심 G': 'Bearing center = center of mass G',
  '변위가 힘의 반대쪽 (위상 ≈ 180°)': 'Displacement opposite the force (phase ≈ 180°)',
  '축 중심 O가 무거운 점 반대쪽으로 밀린다': 'Shaft center O is pushed away from the heavy spot',
  '무거운 점은 궤도 안쪽, G는 베어링 중심에 머문다': 'Heavy spot inside the orbit; G stays at the bearing center',
};

export default EN;
