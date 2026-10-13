import type { Dict } from '../../translate';

const EN: Dict = {
  '두 끝이 함께 — 원통형(병진)': 'Both ends together — cylindrical (translation)',
  '두 끝이 반대로 — 원추형(기울기)': 'Ends opposite — conical (tilting)',
  '병진과 기울기가 섞임': 'Translation and tilting mixed',
  '축 {0}바퀴 · {1} rpm': 'Shaft {0} turns · {1} rpm',
  '원판 두 개 로터를 옆에서 본 모습. 두 베어링 수직 1X 위상차 {0}°: {1}.': 'Side view of a rotor with two disks. Vertical 1X phase difference between the two bearings {0}°: {1}.',
  '원판 {0}': 'Disk {0}',
  '센서 {0} (수직)': 'Sensor {0} (V)',
  '베어링 {0}': 'Bearing {0}',
  '두 센서의 1X (두 바퀴)': '1X of the two sensors (two turns)',
  '위상차 (수직, 센서 2 − 센서 1) =': 'Phase difference (vertical, sensor 2 − sensor 1) =',
  '축의 위아래 움직임은 두 수직 센서가 읽은 1X를 직선으로 이은 것입니다(강성 로터, 움직임은 크게 그리되 축척은 고정이라 진폭 차이도 그대로 보입니다 — 센서 1 {0} µm p-p, 센서 2 {1} µm p-p).':
    'The up-and-down motion of the shaft is a straight line through the 1X read by the two vertical sensors (a stiff rotor; the motion is drawn enlarged but with a fixed scale, so differences in amplitude are visible too — sensor 1 {0} µm p-p, sensor 2 {1} µm p-p).',
  ' 주황 점은 원판의 불평형(무거운 쪽)입니다. 두 원판에서 같은 각이면 축 전체가 같이 들리고(정적), 반대 각이면 한쪽이 들릴 때 다른 쪽이 내려갑니다(커플).':
    ' The orange dot is the unbalance of the disk (the heavy side). If it is at the same angle on both disks, the whole shaft lifts together (static); if at opposite angles, one side drops while the other lifts (couple).',
  ' 런아웃은 축이 실제로 흔들리는 것이 아니라 축 표면의 굴곡을 센서가 읽은 가짜 1X라, 이 그림은 "센서가 읽은 대로" 그린 것입니다.':
    ' Runout is not the shaft actually shaking but a false 1X from the sensor reading the unevenness of the shaft surface, so this drawing shows it "as the sensor read it."',
  ' 이 경우 수평 진동이 수직의 {0}배로 더 큽니다 — 이 그림은 수직만 보므로, 원인을 가릴 때는 랩의 수평 위상도 함께 보세요.':
    ' Here the horizontal vibration is {0} times the vertical — this drawing shows only the vertical, so when separating causes also look at the horizontal phase in the lab.',
  ' 맞히기 모드에서는 원판의 불평형 표시를 숨깁니다 — 두 끝이 함께 움직이는지 반대로 움직이는지부터 보세요.':
    ' In guessing mode the unbalance mark on the disks is hidden — first look at whether the two ends move together or oppositely.',
};

export default EN;
