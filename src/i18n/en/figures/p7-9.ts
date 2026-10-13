import type { Dict } from '../../translate';

/** src/figures/p7-9.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 횡 프로브는 축 표면의 반경 방향 간극을 읽고, 각도 센서는 표식의 통과 시각을 읽습니다. 한 위치의 각속도 변동과 두 단면의 상대 비틀림은 서로 다른 측정량입니다.':
    'Figure 1. A lateral probe reads the radial gap at the shaft surface, and an angle sensor reads the pass times of markers. The angular-speed fluctuation at one location and the relative twist between two sections are different measured quantities.',
  '어떤 좌표를 재나요?': 'Which coordinate is measured?',
  '횡 프로브: 축 중심 x·y': 'Lateral probe: shaft center x, y',
  '각도 A: θA(t)': 'Angle A: θA(t)',
  '각도 B: θB(t)': 'Angle B: θB(t)',
  '두 축 단면의 상대각 · 평균 회전은 공통': 'Relative angle of two sections · mean rotation is common',
  '축 비틀림 강성': 'Shaft torsional stiffness',
  'δθB − δθA → 상대 비틀림': 'δθB − δθA → relative twist',
  '그림 2. 3000 rpm에서 등간격 60이의 기준 간격은333.3 µs, 한 회전 펄스는20 ms입니다. 20 Hz·10 mrad 각변동의 각속도 변화 Peak는1.257 rad/s입니다. 펄스 사이 평균을 중간 시각에 놓았으며, 한 회전 평균은 변화 폭을 줄입니다.':
    'Figure 2. At 3000 rpm the reference interval of 60 equally spaced teeth is 333.3 µs, and the one-pulse-per-revolution interval is 20 ms. The angular-speed change peak of a 20 Hz, 10 mrad angular fluctuation is 1.257 rad/s. The pulse-to-pulse average is placed at the midpoint time, and a one-revolution average reduces the swing.',
  '60이 펄스의 간격 · 각속도가 클수록 짧아짐': 'Interval of 60-tooth pulses · shorter at higher angular speed',
  '간격 중간 시각 [s]': 'Interval midpoint time [s]',
  '순시 각속도와 펄스 간격 평균': 'Instantaneous angular speed and pulse-interval average',
  '평균 대비 각속도 [rad/s]': 'Angular speed vs mean [rad/s]',
  '해석 순시값': 'Analytical instantaneous',
  '60이 간격 평균': '60-tooth interval average',
  '한 회전 간격 평균': 'One-rev interval average',
  '그림 4. 다관성 축계에서는 시험 주파수를 가정하고 각 관성의 각변동·연결축 토크를 차례로 계산합니다. 끝단 경계조건의 잔차가0이 되는 주파수를 찾는 것이 Holzer 방법의 핵심입니다. 실제 관성·강성·경계조건이 필요합니다.':
    "Figure 4. In a multi-inertia shaft train, a trial frequency is assumed and the angular fluctuation of each inertia and the torque of the connecting shaft are calculated in order. The core of Holzer's method is to find the frequency at which the residual of the end boundary condition becomes 0. Real inertias, stiffnesses and boundary conditions are needed.",
  '여러 관성을 잇는 축계 · 자유 끝단 개념도': 'Shaft train joining several inertias · free-end concept',
  '시험 주파수 → 전달 계산 → 끝단 확인': 'Trial frequency → transfer calculation → end check',
  '시험 f · 시작 상대각': 'Trial f · starting relative angle',
  '각변동 / 토크 전달': 'Angle / torque transfer',
  '끝단 잔차 = 0 ?': 'End residual = 0 ?',
  '그림 3. 토크가 갑자기 바뀐 뒤의 감쇠 진동, 반복 토크에 대한 강제응답, 계통과 축계의 에너지 교환은 발생 조건이 다릅니다. 각속도 파형에 사건 시각·전기 신호·운전조건을 맞춰 원인 후보를 좁힙니다.':
    'Figure 3. The decaying oscillation after a sudden torque change, the forced response to a repeating torque, and the energy exchange between the grid and the shaft train arise under different conditions. Align the event time, electrical signals and operating conditions with the angular-speed waveform to narrow the candidate causes.',
  '토크의 입력을 먼저 구별': 'First separate the torque input',
  '계통 접속 상태의 급변': 'Sudden grid connection change',
  '드라이브 토크 맥동': 'Drive torque pulsation',
  '계통↔축계 에너지 교환': 'Grid ↔ shaft energy exchange',
  '기록을 같은 시각에 비교': 'Compare records at the same time',
  '전압·전류 / 제어 로그': 'Voltage, current / control log',
  '각속도·상대각·축 변형률': 'Angular speed, relative angle, shaft strain',
  '감쇠 / 반복 / 지속 성장': 'Decays / repeats / persists or grows',
  '그림 5. 가상 f₀₁=400 Hz·c₁=40, f₀₂=700 Hz·c₂=20과12차 가진의 교차는2353.39·3771.71 rpm입니다. 첫 모드의 c=0 교차2000 rpm과 비교하면 강성화가 교차를 옮깁니다. 교차 표시만으로 응력이나 피로수명은 알 수 없습니다.':
    'Figure 5. For the virtual f₀₁=400 Hz, c₁=40 and f₀₂=700 Hz, c₂=20 with order-12 excitation, the crossings are at 2353.39 and 3771.71 rpm. Compared with the c=0 crossing of the first mode at 2000 rpm, stiffening moves the crossing. The crossing marks alone do not tell you stress or fatigue life.',
  '회전 강성화와 차수선 · 가상 두 모드': 'Rotational stiffening and order line · two virtual modes',
  '모드 1': 'Mode 1',
  '모드 2': 'Mode 2',
  '12차 가진': 'Order 12 excitation',
  '모드 1 · c=0': 'Mode 1 · c=0',
  '그림 6. 같은 교차 위치에서도 감쇠가 응답을 바꿉니다. 첫 모드의 r=1 응답비는ζ=0.02에서25, 0.08에서6.25이며 위상 지연은90°입니다. 변위 응답의 정확한 최대점은 r=1과 조금 다를 수 있습니다.':
    'Figure 6. Even at the same crossing position, damping changes the response. The r=1 response ratio of the first mode is 25 at ζ=0.02 and 6.25 at 0.08, and the phase lag is 90°. The exact maximum of the displacement response may differ slightly from r=1.',
  '가상 첫 모드 · 각 조건의 정적 응답 대비': 'Virtual first mode · relative to static response of each case',
  '응답비 R [—]': 'Response ratio R [—]',
  'r=1 교차': 'r=1 crossing',
  '그림 7. 반경0.5 m·3000 rpm에서 기준보다10 µs 늦게 통과하면 회전 방향을 양으로 둔 팁 접선 변위는−1.571 mm입니다. 작은 변위·같은 기준 각도의 근사입니다. 블레이드24개·프로브1개면 총1200회/s여도 개별 날개는50회/s만 관측합니다.':
    'Figure 7. At radius 0.5 m and 3000 rpm, a pass 10 µs later than the reference gives a tip tangential displacement of −1.571 mm with the rotation direction taken as positive. It is an approximation for small displacement and the same reference angle. With 24 blades and 1 probe, the total is 1200 passes per second, yet each individual blade is observed only 50 times per second.',
  '한 날개의 통과 시각 · 기대값과 실측값': 'Pass times of one blade · expected and measured',
  '기준 통과 대비 시각 [µs]': 'Time vs reference pass [µs]',
  '기준': 'Reference',
  '실측': 'Measured',
  '시간 편차를 물리량으로 바꾸기': 'Turning a time deviation into a physical quantity',
  '통과 기준·각도·회전수': 'Pass reference, angle, speed',
  '센서 기하 → 팁 변위': 'Sensor geometry → tip displacement',
  '모드 / 구조 → 국부 응력': 'Mode / structure → local stress',
  '그림 8. BTT는 팁 운동을 여러 프로브의 통과 시각에서 추정하고, 스트레인 게이지는 붙인 위치·방향의 변형률을 읽습니다. 둘을 연결하려면 모드 형상과 위치별 보정이 필요합니다. 측정 위치가 마디면 응답이 작아도 전체 모드가 조용하다고 단정할 수 없습니다.':
    'Figure 8. BTT estimates tip motion from the pass times at several probes, and a strain gauge reads the strain at the position and direction where it is attached. Connecting the two needs the mode shape and location-specific calibration. If the measurement location is a node, a small response does not mean the whole mode is quiet.',
  '블레이드에서 어디를 보나요?': 'Where do we look on a blade?',
  'BTT: 끝단 통과 시각': 'BTT: tip pass time',
  '게이지: 국부 변형률': 'Gauge: local strain',
  '모드 형상·방향·보정': 'Mode shape, direction, calibration',
};
export default EN;
