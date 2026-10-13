import type { Dict } from '../../translate';

/** src/figures/p4-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 원통 간극을 둘레 방향으로 펼쳤다. θ는 최대 간극에서 자전 방향으로 잰 각도이다. 앞 반원에서 간극이 좁아지고 압력이 생긴다. 아래 압력은 짧은 베어링 모델의 길이 중앙 값이며, 벌어지는 반원의 압력은 0으로 놓았다. 공급 압력으로 축을 들어 올리는 정압 지지와 구분한다.':
    'Figure 1. The cylindrical clearance unrolled along the circumference. θ is measured from the maximum clearance in the direction of spin. In the leading half the clearance narrows and pressure builds up. The pressure below is the mid-length value of the short-bearing model, and the pressure in the diverging half is set to zero. Do not confuse this with hydrostatic support, where supply pressure lifts the shaft.',
  '회전으로 유체를 좁아지는 간극에 끌고 갑니다': 'Rotation drags fluid into the narrowing gap',
  '유막 두께 [µm]': 'Film thickness [µm]',
  '수렴 간극': 'Converging gap',
  '양압 반원의 압력이 하중을 지지합니다': 'Pressure in the positive half carries the load',
  '길이 중앙 압력 [MPa]': 'Mid-length pressure [MPa]',
  // 그림 2
  '그림 2. 베어링 중심 O와 저널 중심 C 사이가 편심 거리 e이다. Cr는 두 반지름의 차(회색 점선 = 동심 위치의 저널과 베어링 사이), 지름 간극은 2Cr이다. 아래 하중선에서 OC까지 잰 자세각 φ를 쓴다. Cr = 100 µm일 때 ε = 0.6758이면 e = 67.58 µm, 최소 유막은 32.42 µm이다. 형상 간극은 이해를 위해 크게 그렸다.':
    'Figure 2. The distance between the bearing center O and the journal center C is the eccentricity e. Cr is the difference of the two radii (gray dashed = between the journal and the bearing at the concentric position), and the diametral clearance is 2Cr. The attitude angle φ is measured from the load line below to OC. For Cr = 100 µm, ε = 0.6758 gives e = 67.58 µm and a minimum film of 32.42 µm. The clearance is drawn enlarged for clarity.',
  'φ = 40.59° (하중선 ↔ OC)': 'φ = 40.59° (load line to OC)',
  // 그림 3
  '그림 3. 같은 간극과 점성계수에서 회전수가 오르면 편심률은 줄고 자세각은 커진다. 하중 500 N의 3000 rpm 위치는 하중 1000 N의 6000 rpm 위치와 같다. 하중·점성계수·회전수의 조합으로 정적 위치가 정해지므로 한 점만으로 원인을 단정할 수 없다.':
    'Figure 3. At the same clearance and viscosity, as speed rises the eccentricity ratio falls and the attitude angle grows. The 3000 rpm position at 500 N is the same as the 6000 rpm position at 1000 N. Because the static position is set by the combination of load, viscosity and speed, a single point cannot pin down the cause.',
  '편심률: 중심에서 얼마나 떨어졌나': 'Eccentricity ratio: how far from the center',
  '자세각: 어느 방향으로 치우쳤나': 'Attitude angle: which way it is offset',
  // 그림 4
  '그림 4. 파란 경로는 각 회전수의 평균 축 위치를 이은 Shaft centerline이다. 초록 작은 원은 3000 rpm 평균점 둘레에서 한 회전 동안 진동하는 오빗의 설명용 그림이며, 이 정적 모델이 계산한 진동이 아니다. 바깥 점선은 반경 Cr의 중심 이동 한계이고 베어링 내경 원이 아니다. X·Y는 같은 축척이다.':
    'Figure 4. The blue path is the shaft centerline, joining the mean shaft position at each speed. The small green circle illustrates the orbit that vibrates around the 3000 rpm mean point during one revolution; it is not vibration computed by this static model. The outer dashed line is the limit of center movement at radius Cr, not the bearing bore circle. X and Y are at the same scale.',
  '평균 위치의 경로와 평균점 둘레의 오빗': 'Path of the mean position and the orbit around the mean point',
  '중심 이동 한계 Cr': 'Center-movement limit Cr',
  '회전수별 평균 위치': 'Mean position by speed',
  '한 회전 오빗 (설명용)': 'One-revolution orbit (illustrative)',
  '냉간 (0, −100)': 'Cold (0, −100)',
  '3000 rpm 평균': '3000 rpm mean',
  '자전 ↺ · +Y 위': 'Spin ↺ · +Y up',
  // 그림 5
  '그림 5. 위쪽 두 프로브의 법선은 +X에서 A 45°, B 135°이다. A·B 전압 변화는 각 법선에 투영된 이동량이므로 좌표를 변환해야 한다. 냉간 전압을 빼고 감도로 나눈 뒤, 냉간 축 위치 (0, −Cr)를 더하면 베어링 중심 기준의 X·Y가 된다. 회색 원은 축 단면이 아니라 축 중심이 움직일 수 있는 한계(반경 Cr)이고, 점은 축 중심의 냉간 위치다. 센서 설치 gap 1.20 mm는 베어링 반경 간극 0.10 mm와 다른 길이다.':
    'Figure 5. The normals of the two upper probes are at 45° (A) and 135° (B) from +X. The A and B voltage changes are displacements projected onto each normal, so the coordinates must be transformed. Subtract the cold voltage, divide by the sensitivity, then add the cold shaft position (0, −Cr) to get X and Y relative to the bearing center. The gray circle is not the shaft cross-section but the limit within which the shaft center can move (radius Cr), and the dot is the cold position of the shaft center. The sensor installation gap of 1.20 mm is a different length from the bearing radial clearance of 0.10 mm.',
  '냉간 축 중심 (0, −Cr)': 'Cold shaft center (0, −Cr)',
  '접근 → gap 감소 → V가 덜 음수': 'Closer → smaller gap → V less negative',
  // 그림 6
  '그림 6. 파란 모델 평형점은 두 패널에서 같다. 냉간 축 위치를 빠뜨리면 주황 점이 위로 Cr = 100 µm 이동한다. A에만 +0.5 V 드리프트를 더하면 A 법선 방향으로 63.5 µm 이동한다. 이 두 경우의 위치 변화는 기준·드리프트 때문에 생긴 측정 변화이며, 유막 평형은 그대로다. X·Y 같은 축척이며 프로브는 선형 범위이다.':
    'Figure 6. The blue model equilibrium point is the same in both panels. If the cold shaft position is left out, the orange point moves up by Cr = 100 µm. If a +0.5 V drift is added to A only, it moves 63.5 µm along the A normal. The position changes in these two cases are measurement changes caused by the reference and the drift; the oil-film equilibrium is unchanged. X and Y are at the same scale and the probes are in the linear range.',
  '냉간 좌표를 더하지 않음': 'Cold coordinates not added',
  '전압에서 복원': 'From voltages',
  '냉간 기록 후 A에 +0.5 V 추가': '+0.5 V added to A after the cold record',
  // 그림 7
  '그림 7. 평형점에서 X로 조금 움직이거나 X 방향 속도가 생겼을 때 유막의 힘은 X와 Y에 모두 나타날 수 있다. Y 변화도 두 힘을 만든다. 그림의 화살표는 두 성분의 분해를 설명하며 실제 계수의 크기나 부호를 뜻하지 않는다. 첫 첨자는 힘 방향, 둘째 첨자는 변위 또는 속도 방향이다.':
    'Figure 7. When the shaft moves slightly in X from the equilibrium point, or gains a velocity in X, the oil-film force can appear in both X and Y. A change in Y also produces both forces. The arrows illustrate the decomposition into two components and do not indicate the actual size or sign of the coefficients. The first subscript is the force direction and the second is the displacement or velocity direction.',
  '평형점': 'Equilibrium point',
  'δx 또는 δẋ': 'δx or δẋ',
};

export default EN;
