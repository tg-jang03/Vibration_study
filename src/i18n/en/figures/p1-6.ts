import type { Dict } from '../../translate';

/** src/figures/p1-6.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 위는 모터가 펌프를 돌리는 구성, 아래는 터빈이 발전기를 돌리는 구성입니다. 파란 상자는 회전력을 내는 쪽, 주황 상자는 그 회전력을 받아 일을 하는 쪽입니다. 발전기는 전기를 만드는 쪽이지 구동 모터가 아닙니다.':
    'Figure 1. Top: a motor driving a pump. Bottom: a turbine driving a generator. The blue box is the side that supplies torque, the orange box the side that takes that torque and does work. The generator is the side that makes electricity, not a driving motor.',
  '기계의 역할과 에너지 흐름 (실제 크기 비율 아님)': 'Machine roles and energy flow (not to scale)',
  전기: 'Electricity',
  '모터 · 구동기': 'Motor · driver',
  '축 · 회전력': 'Shaft · torque',
  '펌프 · 피동기': 'Pump · driven',
  유체: 'Fluid',
  '터빈 · 구동기': 'Turbine · driver',
  발전기: 'Generator',
  // 그림 2
  '그림 2. 모터 전체 안에 도는 로터와 움직이지 않는 고정자가 함께 있습니다. 파란 부분은 회전부, 회색 테두리는 고정자·하우징입니다. 베어링은 축을 받치는 위치만 간략히 표시했고, 단면은 축 방향에 직각으로 잘랐습니다.':
    'Figure 2. Inside the whole motor there are a turning rotor and a stator that does not move. The blue part is the rotating part; the gray outline is the stator and housing. Bearings are shown only as the positions that support the shaft, and the cross-section is cut at right angles to the shaft axis.',
  '왼쪽: 모터 옆모습 / 오른쪽: 모터 단면 (구조 개념도)': 'Left: motor side view / Right: motor cross-section (concept sketch)',
  로터: 'Rotor',
  '고정자 · 바깥 하우징': 'Stator · outer housing',
  베어링: 'Bearing',
  축: 'Shaft',
  고정자: 'Stator',
  공극: 'Air gap',
  // 그림 3
  '그림 3. 두 기계의 축을 커플링으로 이어 토크를 전달합니다. 아래 정면도에서 접선 방향 힘은 회전축 주위의 토크를 만들고, 반경 방향 힘은 축을 옆으로 미는 하중입니다. 두 화살표는 서로 다른 하중의 예이지 같은 힘의 분해가 아닙니다.':
    'Figure 3. The shafts of two machines are joined by a coupling to transmit torque. In the front views below, a tangential force produces torque about the rotation axis, and a radial force is a load pushing the shaft sideways. The two arrows are examples of different loads, not a decomposition of the same force.',
  '옆모습: 회전부를 잇는 축계': 'Side view: shaft train joining the rotating parts',
  '모터 로터': 'Motor rotor',
  '펌프 임펠러': 'Pump impeller',
  커플링: 'Coupling',
  '회전축을 따라 토크 전달': 'Torque passes along the shaft',
  '축 정면: 토크와 반경 하중을 구분': 'Shaft front view: torque vs. radial load',
  '접선 힘 → 토크': 'Tangential force → torque',
  '반경 하중': 'Radial load',
  '축을 비틀어 돌림': 'Twists the shaft around',
  '축을 옆으로 밀음': 'Pushes the shaft sideways',
  // 그림 4
  '그림 4. 왼쪽은 볼이 두 고리 사이에서 하중을 전달하는 구름베어링, 오른쪽은 저널과 고정부 사이 유막이 하중을 받치는 베어링의 개념 단면입니다. 구름/유막은 방식의 분류이며 반경/추력은 별도로 하중 방향을 말합니다. 틈은 이해를 위해 크게 그렸습니다.':
    'Figure 4. Concept cross-sections: on the left a rolling-element bearing, where balls transmit load between two rings; on the right a bearing where an oil film between the journal and the fixed part carries the load. Rolling/fluid-film is a classification by method; radial/thrust is a separate classification by load direction. The gap is drawn large for clarity.',
  '구름요소로 받침 / 기름막으로 받침': 'Supported by rolling elements / by an oil film',
  '구름베어링 · 볼의 접촉': 'Rolling bearing · ball contact',
  저널: 'Journal',
  '유막 베어링 · 틈의 오일': 'Fluid-film bearing · oil in gap',
  '유막 지지': 'Oil-film support',
  // 그림 5
  '그림 5. 축에서 나온 반경 하중은 베어링·하우징·받침대를 거쳐 기초로 전달됩니다. 왼쪽의 아래 화살표는 하중 경로, 오른쪽의 위 화살표는 축방향 추력의 방향입니다. 실제 축방향 하중도 이를 받는 베어링에서 고정부로 전달됩니다.':
    'Figure 5. The radial load from the shaft passes through the bearing, housing and pedestal to the foundation. The downward arrow on the left is the load path; the arrow on the right shows the direction of axial thrust. A real axial load is likewise passed from the bearing that carries it to the fixed part.',
  '반경 방향 전달 경로와 축방향 하중': 'Radial load path and axial load',
  받침대: 'Pedestal',
  하우징: 'Housing',
  '도는 축': 'Turning shaft',
  기초: 'Foundation',
  '반경 하중 경로': 'Radial load path',
  '축 방향 추력': 'Axial thrust',
  // 그림 6
  '그림 6. 같은 회전축에도 횡·축·비틀림 진동이 있습니다. 위는 축 중심이 옆으로 움직임, 가운데는 축을 따라 왕복, 아래는 두 단면 사이 상대 비틀림각이 변함입니다. 점선은 기준 위치입니다. 축의 지속적인 자전과 이 진동들은 구별합니다.':
    'Figure 6. The same rotating shaft can have lateral, axial and torsional vibration. Top: the shaft center moves sideways. Middle: back-and-forth along the shaft. Bottom: the relative twist angle between two cross-sections changes. Dashed lines are reference positions. The shaft\'s continuous spin is distinct from these vibrations.',
  '횡진동: 축에 직각 (X·Y 중 한 방향만 그림)': 'Lateral: perpendicular to the shaft (only one of X·Y drawn)',
  '옆으로 왕복': 'Sideways back-and-forth',
  '축진동: 축을 따라': 'Axial: along the shaft',
  '길이 방향 왕복': 'Lengthwise back-and-forth',
  '비틀림 진동: 두 단면 사이 상대 각도 변화 (위치만 분리)': 'Torsional: relative angle change between two sections (positions only)',
  '단면 A': 'Section A',
  '단면 B · 상대 각도': 'Section B · relative angle',
  // 그림 7
  '그림 7. 한 질량과 무질량 직렬 스프링 3개의 교육용 예제입니다. 기본값에서 등가 강성은 0.4 MN/m, 고유진동수는 10.07 Hz입니다. 지지만 단단하게 해도 축과 베어링의 변형은 남아 무한 강성이 되지 않습니다. 실제 두 베어링 축계의 배치를 그린 것은 아닙니다.':
    'Figure 7. An educational example of one mass and three massless springs in series. At the default values the equivalent stiffness is 0.4 MN/m and the natural frequency is 10.07 Hz. Even if only the support is made stiff, the deformation of shaft and bearing remains, so the stiffness never becomes infinite. It does not depict the layout of a real two-bearing shaft train.',
  '한 방향 직렬 예제: 연결부의 질량·회전 효과 무시': 'One-direction series example: mass of connections and rotating effects ignored',
  '지지 k_sup': 'Support k_sup',
  '베어링 k_br': 'Bearing k_br',
  '축 k_sh': 'Shaft k_sh',
  '지지 강성만 변화시킨 고유진동수': 'Natural frequency with only the support stiffness varied',
  '지지 강성 [MN/m]': 'Support stiffness [MN/m]',
  '직렬 예제': 'Series example',
  '지지 강성 무한대 극한': 'Infinite-support limit',
  기본값: 'Default',
};

export default EN;
