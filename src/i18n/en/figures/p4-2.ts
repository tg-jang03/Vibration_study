import type { Dict } from '../../translate';

/** src/figures/p4-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 축 끝에서 바라본 그림이다. O는 고정 기준, C는 축의 기하학적 중심, G는 원판의 질량중심이다. 초록 궤적을 따라 C가 O 둘레를 도는 운동이 선회이고, 원판에 고정된 점 G(주황)가 C 둘레를 도는 운동이 자전이다. 두 운동은 서로 다른 위치를 추적한다. 여기서는 둘 다 반시계이며 같은 주기로 돈다(동기 선회). 길이는 설명을 위해 확대했다.':
    'Figure 1. Viewed from the end of the shaft. O is the fixed reference, C the geometric center of the shaft and G the center of mass of the disk. The motion of C around O along the green path is whirl, and the motion of point G (orange), fixed to the disk, around C is spin. The two motions follow different points. Here both are counterclockwise and have the same period (synchronous whirl). Lengths are exaggerated for clarity.',
  'O (기준)': 'O (ref.)',
  '선회 ↺: C가 O 둘레로 이동': 'Whirl ↺: C moves around O',
  '원판에 고정된 점 G는 C 둘레로 자전 ↺': 'Disk point G spins about C ↺',
  // 그림 2
  '그림 2. 옆에서 본 축의 세 가지 모드 형상이다(변위 확대). 강체 병진은 축 전체가 같은 방향으로 옮겨가고, 강체 기울기는 곧은 축이 기울어 양끝이 반대로 움직인다. 굽힘에서는 축선 자체가 휘어 곡선이 되므로 변위가 위치에 따라 직선으로 변하지 않는다. 점선은 변위가 없는 기준 축선이며, 이 그림은 주파수나 실제 치수를 계산한 형상이 아니다.':
    'Figure 2. Three mode shapes of the shaft seen from the side (displacements exaggerated). In rigid-body translation the whole shaft shifts in the same direction; in rigid-body tilt the straight shaft tilts and its two ends move in opposite directions. In bending the shaft line itself bends into a curve, so the displacement does not change linearly with position. The dashed line is the undisplaced reference shaft line; these shapes are not calculated for any frequency or real dimensions.',
  '강체 병진: 축은 곧고 양끝은 같은 방향': 'Rigid translation: both ends move the same way',
  '강체 기울기: 축은 곧고 양끝은 반대 방향': 'Rigid tilt: the ends move opposite ways',
  '굽힘: 축선 자체가 휜다': 'Bending: the shaft line itself bends',
  // 그림 3
  '그림 3. Jeffcott 모델은 축 가운데의 질량 원판과 무질량 탄성축을 남긴다(위). 아래는 원판 단면의 등가 모델이다. x·y는 정적 평형에서 잰 변위이고, 방향별 등가 강성 kx·ky(축 굽힘 + 베어링·받침대, 공간에 고정된 방향)와 고정 좌표의 공통 감쇠 c가 원판의 운동에 저항한다. 감쇠기는 x 방향만 그렸지만 y 방향에도 같은 c가 있다. 회전하는 불평형 힘 Fu의 두 투영이 x에는 cos, y에는 sin으로 작용한다. 원판의 기울기·자이로 효과는 생략한다.':
    'Figure 3. The Jeffcott model keeps a mass disk at the middle of the shaft and a massless elastic shaft (top). Below is the equivalent model at the disk cross-section. x and y are displacements measured from static equilibrium; the directional equivalent stiffnesses kx and ky (shaft bending + bearings and pedestals, directions fixed in space) and the common damping c in fixed coordinates resist the motion of the disk. The damper is drawn only in the x direction, but the same c also acts in the y direction. The two projections of the rotating unbalance force Fu act as cos on x and as sin on y. Disk tilt and gyroscopic effects are neglected.',
  '옆에서 본 축: 중앙 원판 하나 + 탄성축': 'Side view: one center disk + elastic shaft',
  'm (원판)': 'm (disk)',
  '무질량 탄성축': 'Massless shaft',
  '축 끝에서 본 등가 모델: 두 방향의 변위': 'End-view model: displacement in two directions',
  'Fu (회전)': 'Fu (rotating)',
  '두 방향에 공통 감쇠 c': 'Same c for x and y',
  // 그림 4
  '그림 4. 등방 지지(kx = ky), 감쇠비 0.05, 3000 rpm, 편심 거리 10 µm의 정상상태 해다. 오빗 반지름은 100 µm이며 정방향으로 돈다. 아래 X·Y 파형의 진폭은 같고 위상차는 90°이다. 한 방향에서 보던 불평형 응답을 두 방향으로 함께 보면 원이 된다. 화살표는 시간이 증가하는 방향이다.':
    'Figure 4. Steady-state solution for isotropic supports (kx = ky), damping ratio 0.05, 3000 rpm and an eccentricity of 10 µm. The orbit radius is 100 µm and the whirl is forward. The X and Y waveforms below have equal amplitudes and a phase difference of 90°. The unbalance response we looked at in one direction becomes a circle when you look at both directions together. The arrow points in the direction of increasing time.',
  '등방: 정방향 원형 오빗': 'Isotropic: forward circle',
  '합성 오빗': 'Combined orbit',
  '자전 ↺': 'Spin ↺',
  '한 회전 = 20 ms': 'One rev. = 20 ms',
  '시간 [ms]': 'Time [ms]',
  '변위 [µm]': 'Displacement [µm]',
  // 그림 5
  '그림 5. 강성비 ky/kx = 1.3, 공통 감쇠 c(ζx = 0.05)인 로터다. 위의 3200 rpm 오빗은 시계 방향이며, X 진폭 65.3 µm와 Y 진폭 58.6 µm가 서로 다르다. 아래 점선은 Nx = 3000 rpm, Ny = 3421 rpm이다. 감쇠가 없는 임계속도 기준이며 실제 진폭 피크는 조금 위에 나타난다.':
    'Figure 5. A rotor with stiffness ratio ky/kx = 1.3 and common damping c (ζx = 0.05). The 3200 rpm orbit at the top turns clockwise, and the X amplitude of 65.3 µm and the Y amplitude of 58.6 µm differ. The dashed lines below are Nx = 3000 rpm and Ny = 3421 rpm. These are undamped critical speeds; the actual amplitude peaks appear slightly above them.',
  '3200 rpm: 역방향 타원 오빗': '3200 rpm: reverse ellipse',
  '방향마다 다른 응답 피크': 'Separate peaks for X and Y',
  '회전수 [rpm]': 'Speed [rpm]',
  '진폭 [µm Peak]': 'Amplitude [µm Peak]',
  // 그림 6
  '그림 6. 그림 5의 타원을 반시계 원(파랑, 반지름 36.11 µm)과 시계 원(주황, 50.45 µm)의 합으로 나타냈다. 원들은 각각 원점 중심이며 실제 초록 오빗은 같은 시각의 두 벡터를 더한 결과다. 아래에서 주황이 파랑보다 높은 구간에만 역방향 선회가 나온다. 감쇠비 0.2로 키우면 3200 rpm에서 정방향 23.73 µm, 역방향 8.339 µm로 우세가 바뀐다.':
    'Figure 6. The ellipse of Figure 5 written as the sum of a counterclockwise circle (blue, radius 36.11 µm) and a clockwise circle (orange, 50.45 µm). Each circle is centered on the origin, and the actual green orbit is the sum of the two vectors at the same instant. Below, reverse whirl appears only where orange is above blue. Raising the damping ratio to 0.2 changes which one dominates at 3200 rpm: forward 23.73 µm, reverse 8.339 µm.',
  '타원 = 정방향 원 + 역방향 원': 'Ellipse = forward + reverse circle',
  '정방향 원': 'Forward circle',
  '역방향 원': 'Reverse circle',
  '정방향과 역방향의 반지름 비교 (ζx = 0.05)': 'Forward vs reverse radius (ζx = 0.05)',
  '|Af| 정방향': '|Af| forward',
  '|Ab| 역방향': '|Ab| reverse',
  '반지름 [µm]': 'Radius [µm]',
  // 그림 7
  '그림 7. 등방 로터의 축 중심 C(파랑)와 질량중심 G(주황)가 정적 평형점 O에서 얼마나 떨어지는지 비교했다. G의 변위는 zC + e exp(jΩt)이다. 고속에서 C는 편심 거리 10 µm에 가까워지지만 G는 O에 가까워진다. 15000 rpm(속도비 5)에서는 C가 10.41 µm, G가 0.4657 µm이다. 진동이 완전히 없어지는 것이 아니라 축 중심이 질량중심 둘레로 도는 경향이다.':
    'Figure 7. How far the shaft center C (blue) and the center of mass G (orange) of an isotropic rotor are from the static equilibrium point O. The displacement of G is zC + e exp(jΩt). At high speed C approaches the eccentricity of 10 µm, while G approaches O. At 15000 rpm (speed ratio 5), C is at 10.41 µm and G at 0.4657 µm. The vibration does not vanish; rather, the shaft center tends to go around the center of mass.',
  'C 축 중심': 'C shaft center',
  'G 질량중심': 'G center of mass',
  '편심 거리 10 µm': 'Eccentricity 10 µm',
  'O에서의 거리 [µm]': 'Distance from O [µm]',
};

export default EN;
