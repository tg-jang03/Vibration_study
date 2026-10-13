import type { Dict } from '../../translate';

/** src/figures/p1-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 질량-스프링에 감쇠기 c를 나란히 붙인 가장 단순한 모델. 질량이 오른쪽으로 움직이면 감쇠력 −cẋ는 왼쪽을 향해 움직임을 방해한다. 복원력 −kx와 합치면 운동방정식은 mẍ + cẋ + kx = 0이다.':
    'Figure 1. The simplest model: a damper c attached in parallel with the mass-spring. When the mass moves right, the damping force −cẋ points left and resists the motion. Combined with the restoring force −kx, the equation of motion is mẍ + cẋ + kx = 0.',
  '감쇠 계수 c': 'Damping coeff. c',
  '속도 ẋ': 'Velocity ẋ',
  '움직임 → 열': 'Motion → heat',
  // 그림 3
  '그림 3. 감쇠가 없으면 진폭이 그대로지만, ζ = 0.05이면 파랑 변위가 회색 포락선 안에서 지수적으로 줄어든다. 포락선의 모양 A e^(−ζωₙt)가 진동이 얼마나 오래 남는지 보여 준다.':
    'Figure 3. Without damping the amplitude stays the same, but with ζ = 0.05 the blue displacement shrinks exponentially inside the gray envelope. The envelope shape A e^(−ζωₙt) shows how long the vibration lasts.',
  '감쇠 없음 ζ = 0': 'Undamped ζ = 0',
  '부족감쇠 ζ = 0.05': 'Underdamped ζ = 0.05',
  포락선: 'Envelope',
  // 그림 4
  '그림 4. 가로축을 시간이 아니라 지난 주기 수로 놓으면 감쇠비의 역할이 선명하다. ζ가 클수록 같은 주기 수 뒤에 남는 진폭이 작다. ζ = 0.05는 약 2.2주기 뒤 절반이 된다.':
    'Figure 4. Putting the number of elapsed cycles, not time, on the horizontal axis makes the role of the damping ratio clear. The larger ζ is, the smaller the amplitude left after the same number of cycles. For ζ = 0.05 it halves after about 2.2 cycles.',
  '처음의 절반': 'Half of initial',
  'ζ = 0.05: 약 2.2주기': 'ζ = 0.05: about 2.2 cycles',
  '지난 주기 수': 'Elapsed cycles',
  '처음 피크에 대한 비': 'Ratio to first peak',
  // 그림 2
  '그림 2. 부족감쇠(ζ < 1)는 평형을 지나 여러 번 왕복한다. 임계감쇠(ζ = 1)는 진동하지 않으면서 가장 빠르게 돌아오고, 과감쇠(ζ > 1)는 평형을 넘지 않지만 더 천천히 돌아온다.':
    'Figure 2. An underdamped system (ζ < 1) passes through equilibrium and swings back and forth several times. A critically damped one (ζ = 1) returns fastest without oscillating, and an overdamped one (ζ > 1) does not cross equilibrium but returns more slowly.',
  '부족감쇠 ζ = 0.2': 'Underdamped ζ = 0.2',
  '임계감쇠 ζ = 1': 'Critical ζ = 1',
  '과감쇠 ζ = 1.5': 'Overdamped ζ = 1.5',
  '무차원 시간 ωₙt': 'Scaled time ωₙt',
  // 그림 5
  '그림 5. 부족감쇠의 박자는 ω_d/ω_n = √(1−ζ²)만큼 낮아진다. ζ = 0.05에서는 0.99875배로, 차이는 약 0.125 %뿐이다. 작은 감쇠는 박자보다 지속 시간을 훨씬 크게 바꾼다.':
    'Figure 5. The rhythm of an underdamped system drops by the factor ω_d/ω_n = √(1−ζ²). At ζ = 0.05 it is 0.99875 times, a difference of only about 0.125 %. Small damping changes the duration far more than the rhythm.',
  '감쇠 없음': 'Undamped',
  '감쇠비 ζ': 'Damping ratio ζ',
  '주파수비 ω_d/ωₙ': 'Frequency ratio ω_d/ωₙ',
  // 그림 6
  '그림 6. ζ = 0.05에서 같은 방향의 첫 두 피크는 10.0 mm와 7.30 mm다. 다음/이전 피크 비는 0.7301이고, δ = ln(1/0.7301) = 0.3146다.':
    'Figure 6. At ζ = 0.05, the first two peaks in the same direction are 10.0 mm and 7.30 mm. The next/previous peak ratio is 0.7301, and δ = ln(1/0.7301) = 0.3146.',
  '감쇠 자유응답': 'Damped free response',
  '같은 방향의 피크': 'Same-direction peaks',
};

export default EN;
