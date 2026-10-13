import type { Dict } from '../../translate';

const EN: Dict = {
  '원심력 수평 성분 F_x(t) (크기는 임의, 박자 비교용)': 'Horizontal centrifugal force F_x(t) (arbitrary scale, for comparing rhythm)',
  '수평 변위 x(t) (진폭 {0} mm)': 'Horizontal displacement x(t) (amplitude {0} mm)',
  '진폭비 (ζ = {0})': 'Amplitude ratio (ζ = {0})',
  '고속 한계 (1.0)': 'High-speed limit (1.0)',
  '현재 운전점': 'Current operating point',
  '위상 지연 φ': 'Phase lag φ',
  '90° (임계속도)': '90° (critical speed)',
  '저속 (r = 0.5)': 'Low speed (r = 0.5)',
  '임계속도 (r = 1)': 'Critical speed (r = 1)',
  '초임계 (r = 2)': 'Supercritical (r = 2)',
  '회전수 rpm': 'Speed rpm',
  '고유 회전수 N_n (임계속도)': 'Natural speed N_n (critical speed)',
  '감쇠비 ζ': 'Damping ratio ζ',
  '편심 거리 e_cg (= m_u e / M)': 'Eccentricity e_cg (= m_u e / M)',
  '런업 중지': 'Stop run-up',
  '런업 가속 재생 (0 → 6000 rpm)': 'Play run-up (0 → 6000 rpm)',
  '원판 멈추기': 'Stop disk',
  '원판 돌리기': 'Spin disk',
  '회전수': 'Speed',
  '1X 주파수': '1X frequency',
  '진동수비 r (Ω/ω_n)': 'Frequency ratio r (Ω/ω_n)',
  '원심력 F_u': 'Centrifugal force F_u',
  '진폭비 (X / e_cg)': 'Amplitude ratio (X / e_cg)',
  '수평 변위 진폭 X': 'Horizontal displacement amplitude X',
  '회전수를 1500 rpm에서 3000 rpm으로 2배 올리면 불평형 원심력 F_u는 몇 배가 되나요? 원심력 화살표의 길이는요?':
    'If you double the speed from 1500 rpm to 3000 rpm, by what factor does the unbalance force F_u grow? And the length of the force arrow?',
  '원심력은 F_u = m_u e Ω²로 각속도(회전수)의 제곱에 비례합니다. 회전수가 2배가 되면 원심력은 4배(약 247 N → 약 987 N)가 되고, 화살표 길이도 4배가 됩니다.':
    'The centrifugal force F_u = m_u e Ω² is proportional to the square of the angular speed (rpm). Doubling the speed makes the force 4 times larger (about 247 N → about 987 N), and the arrow becomes 4 times longer too.',
  '임계속도 (r = 1) 버튼을 눌러 3000 rpm에 맞추어 보세요. 진폭은 편심 거리 e_cg의 몇 배이며 위상 지연은 몇 도인가요?':
    'Press the Critical speed (r = 1) button to set 3000 rpm. How many times the eccentricity e_cg is the amplitude, and what is the phase lag in degrees?',
  'r = 1에서는 진폭비가 1/(2ζ) = 1/(2 × 0.05) = 10이 되어, 편심 거리 0.1 mm의 10배인 1.0 mm가 됩니다. 힘과 변위 사이의 위상 지연은 90°입니다.':
    'At r = 1 the amplitude ratio is 1/(2ζ) = 1/(2 × 0.05) = 10, so the amplitude is 1.0 mm, 10 times the eccentricity of 0.1 mm. The phase lag between force and displacement is 90°.',
  '3000 rpm 상태에서 감쇠비 ζ를 0.05에서 0.10으로 올려 보세요. 임계속도에서의 진폭과 Q값은 어떻게 바뀌나요?':
    'At 3000 rpm, raise the damping ratio ζ from 0.05 to 0.10. How do the amplitude at the critical speed and the Q value change?',
  'r = 1의 진폭비는 1/(2ζ)이므로 감쇠비가 2배가 되면 10에서 5로 절반이 됩니다(진폭 1.0 mm → 0.5 mm). Q ≈ 1/(2ζ)도 10에서 5로 줄어듭니다. 감쇠가 클수록 임계속도를 지날 때의 진폭이 작습니다.':
    'The amplitude ratio at r = 1 is 1/(2ζ), so doubling the damping ratio halves it from 10 to 5 (amplitude 1.0 mm → 0.5 mm). Q ≈ 1/(2ζ) also drops from 10 to 5. The more damping, the smaller the amplitude when passing through the critical speed.',
  '초임계 (r = 2) 버튼을 눌러 6000 rpm으로 올려 보세요. 진폭은 원심력처럼 계속 커지나요?':
    'Press the Supercritical (r = 2) button to go to 6000 rpm. Does the amplitude keep growing like the centrifugal force?',
  '아닙니다. 6000 rpm의 원심력은 3000 rpm의 4배(약 3948 N)이지만 진폭은 0.133 mm(진폭비 1.33), 위상은 176°입니다. 회전수를 더 올리면 진폭은 편심 거리 e_cg = 0.1 mm(진폭비 1)에, 위상은 180°에 다가갑니다. 축 중심이 무거운 점의 반대쪽으로 밀려 전체 질량 중심이 베어링 중심에 머물기 때문입니다(질량 중심 회전).':
    'No. The force at 6000 rpm is 4 times that at 3000 rpm (about 3948 N), yet the amplitude is 0.133 mm (amplitude ratio 1.33) and the phase is 176°. Raising the speed further, the amplitude approaches the eccentricity e_cg = 0.1 mm (ratio 1) and the phase approaches 180°. The shaft center is pushed to the side opposite the heavy spot, so the overall center of mass stays at the bearing center (self-centering).',
  '불평형 런업과 1X 진동': 'Unbalance run-up and 1X vibration',
  '베어링 평형 중심': 'Bearing equilibrium center',
  '축 중심 O': 'Shaft center O',
  '수평 변위 x = {0} mm': 'Horizontal displacement x = {0} mm',
  '회전수:': 'Speed:',
  '1X 주파수:': '1X frequency:',
  '진동수비 r:': 'Frequency ratio r:',
  '상태:': 'State:',
  '임계속도 근처 (공진)': 'Near critical speed (resonance)',
  '아임계 운전': 'Subcritical operation',
  '초임계 운전': 'Supercritical operation',
  '화면의 원판은 실제보다 {0}배 느리게 돈다': 'The disk on screen turns {0} times slower than the real one',
  'Bode 선도: 회전수별 무차원 진폭비': 'Bode plot: dimensionless amplitude ratio vs. speed',
  '회전수 [rpm]': 'Speed [rpm]',
  '진폭비 X / (m_u e / M)': 'Amplitude ratio X / (m_u e / M)',
  '정상상태 1X 시간파형 (2주기)': 'Steady-state 1X time waveform (2 cycles)',
  '시간 t [ms]': 'Time t [ms]',
  '변위 [mm]': 'Displacement [mm]',
  '위상 지연 곡선 φ (회전수 증가에 따라 0° → 90° → 180°)': 'Phase lag curve φ (0° → 90° → 180° as speed increases)',
  '위상 지연 [°]': 'Phase lag [°]',
};

export default EN;
