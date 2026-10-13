import type { Dict } from '../../translate';

/** src/figures/p7-4.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 1X 아래(서브싱크로너스) 후보를 한 장의 주파수-회전수 지도에 그렸다 (설명용, 1차 임계속도 3000 rpm = 50 Hz). 오일 휠(파랑)은 문턱(4800 rpm) 위에서 0.45X로 따라가다 6670 rpm에서 50 Hz에 잠기고(오일 휩), 유체력 선회(보라)는 처음부터 50 Hz 근처에 선다. 러브·회전 풀림의 ½X(주황)는 임계속도의 약 2배 구간에서 정확히 회전수의 절반이다. Rotating stall(초록)은 유량이 줄면 0.17 ~ 0.2X에, 구조 공진(회색)은 회전수와 무관하게 38 Hz에 선다. 구름베어링이라면 케이지 FTF(약 0.4X, 점선)도 있다. 6000 ~ 7200 rpm에서 0.4 ~ 0.5X 둘레에 후보 여럿이 몇 Hz 차이로 겹친다 — 자리만으로는 가를 수 없다.':
    'Figure 1. The candidates below 1X (subsynchronous) drawn on one frequency-versus-speed map (explanatory; first critical speed 3000 rpm = 50 Hz). Oil whirl (blue) follows at 0.45X above its threshold (4800 rpm) and locks at 50 Hz from 6670 rpm (oil whip); fluid-force whirl (purple) stands near 50 Hz from the start. The ½X of rub and rotating looseness (orange) is exactly half the speed in the range about twice the critical speed. Rotating stall (green) stands at 0.17 to 0.2X when the flow drops, and structural resonance (gray) stands at 38 Hz regardless of speed. With rolling-element bearings there is also the cage FTF (about 0.4X, dotted). At 6000 to 7200 rpm several candidates overlap within a few Hz around 0.4 to 0.5X, so position alone cannot separate them.',
  'FTF 0.4X (구름베어링)': 'FTF 0.4X',
  '오일 휠 → 휩': 'Oil whirl → whip',
  '유체력 선회': 'Fluid whirl',
  '½X (러브·풀림)': '½X (rub, loose)',
  'Rotating stall (유량 60 %)': 'Stall (flow 60 %)',
  '구조 공진 38 Hz': 'Structural resonance 38 Hz',
  // 그림 2
  '그림 2. 유체막 불안정의 1X 아래 성분 크기(정·역 반지름의 합, 설명용). 회전수를 올릴 때(파랑)는 4800 rpm에서 갑자기 나타나고, 6670 rpm 위에서 휩으로 잠기며 크게 자란다(65 µm). 내릴 때(주황 점선)는 나타났던 회전수보다 낮은 4200 rpm까지 남아 있다 — 한번 시작된 선회는 더 낮은 회전수까지 이어진다(히스테리시스). 런업과 코스트다운의 문턱이 다르면 불안정을 의심하는 단서가 된다.':
    'Figure 2. Size of the component below 1X in fluid-film instability (sum of the forward and reverse radii, explanatory). On the way up (blue) it appears suddenly at 4800 rpm and, above 6670 rpm, locks as whip and grows large (65 µm). On the way down (orange dashed) it remains down to 4200 rpm, lower than the speed where it appeared: once started, the whirl continues to lower speeds (hysteresis). If the run-up and coast-down thresholds differ, that is a clue to suspect instability.',
  '1X 아래 [µm]': 'Below 1X [µm]',
  나타남: 'Appears',
  사라짐: 'Disappears',
  휩: 'Whip',
  // 그림 3
  '그림 3. 운전조건 하나씩 바꾸며 본 1X 아래 성분 크기 (설명용 규칙 모델, 나머지 조건은 기준값: 유온 50 °C·베어링 하중 1·공정 부하 100 %). 위: 유온을 올리면 오일 휠(6000 rpm)은 58.3 °C 근처에서 사라지지만 휩(7200 rpm)은 그대로이고, 러브는 무관하다. 가운데: 베어링 하중을 키우면(편심률 ↑, P4-3) 휠이 사라지고 회전 풀림이 0.61배로 줄며, 유체력 선회는 조금 줄 뿐이다. 아래: 공정 부하(유량)를 줄이면 유체력 선회는 80 % 아래에서 사라지고 Rotating stall은 75 % 아래에서 나타난다. 원인마다 반응하는 조건이 다르다 — 감별의 가장 강한 증거다.':
    'Figure 3. Size of the component below 1X as one operating condition at a time is changed (explanatory rule model; the other conditions stay at reference values: oil temperature 50 °C, bearing load 1, process load 100 %). Top: raising the oil temperature makes the oil whirl (6000 rpm) disappear near 58.3 °C, while the whip (7200 rpm) stays and rub is unaffected. Middle: increasing the bearing load (eccentricity ratio up, P4-3) removes the whirl and shrinks rotating looseness to 0.61 times, while fluid-force whirl decreases only a little. Bottom: lowering the process load (flow) makes fluid-force whirl disappear below 80 % and rotating stall appear below 75 %. Each cause responds to different conditions, which makes this the strongest evidence for discrimination.',
  유온: 'Oil temp.',
  '오일 공급 온도 [°C]': 'Oil supply temperature [°C]',
  '오일 휠 6000 rpm': 'Oil whirl 6000 rpm',
  '오일 휩 7200 rpm': 'Oil whip 7200 rpm',
  '러브 ½X 6300 rpm': 'Rub ½X 6300 rpm',
  '베어링 하중': 'Bearing load',
  '베어링 하중 (기준 = 1)': 'Bearing load (reference = 1)',
  '오일 휠': 'Oil whirl',
  '오일 휩': 'Oil whip',
  '회전 풀림 ½X': 'Rotating looseness ½X',
  '공정 부하 (유량)': 'Process load (flow)',
  '공정 부하 [%]': 'Process load [%]',
  '유체력 선회 6600 rpm': 'Fluid-force whirl 6600 rpm',
  // 그림 4
  '그림 4. 1X에 1X 아래 성분이 더해진 오빗 (12바퀴, 같은 축척, 점 = 키페이저). 오일 휠은 1X의 0.45배라 매 바퀴 같은 자리로 돌아오지 않아 점이 원을 따라 흩어진다(정방향 안쪽 고리). 러브의 ½X는 정확히 절반이라 점이 두 자리에 고정되고, 역방향 성분 때문에 고리가 찌그러진다. 구조 공진(38 Hz)도 회전과 묶이지 않아 점이 흩어지지만, 정·역 크기가 같아 한 방향으로 흔들린다. 점이 몇 자리에 고정되는지, 흩어지는지는 P6-3의 판독 그대로다.':
    'Figure 4. Orbits with a component below 1X added to 1X (12 turns, same scale, dot = keyphasor). Oil whirl is 0.45 times 1X, so it does not return to the same place every turn and the dots scatter along the circle (forward inner loop). The ½X of rub is exactly half, so the dots are fixed at two places, and the loop is distorted by the reverse component. Structural resonance (38 Hz) is not tied to the rotation either, so the dots scatter, but forward and reverse are equal in size, so it oscillates in one direction. How many places the dots are fixed at, or whether they scatter, is read exactly as in P6-3.',
  '구조 공진 6600 rpm': 'Structural res. 6600 rpm',
  // 그림 5
  '그림 5. 회전수(6600 rpm)를 그대로 두고 공정 부하만 올릴 때(설명용). 유체력 선회는 부하가 문턱(80 %)을 넘는 순간 50 Hz 근처(49 Hz = 0.445X)에 나타나 부하와 함께 커진다. 증기터빈의 steam whirl(P8-3)과 압축기 씰의 교차연성이 이런 모양이다 — 회전수가 아니라 부하·압력이 문턱을 만든다. 오일 휠은 부하와 상관없이 그대로다.':
    'Figure 5. Keeping the speed (6600 rpm) fixed and raising only the process load (explanatory). Fluid-force whirl appears near 50 Hz (49 Hz = 0.445X) the moment the load passes the threshold (80 %), and grows with the load. Steam whirl in steam turbines (P8-3) and cross-coupling in compressor seals look like this: the threshold is set by load and pressure, not by speed. Oil whirl is unaffected by load.',
  '오일 휠 (6000 rpm)': 'Oil whirl (6000 rpm)',
  '부하 문턱': 'Load threshold',
};

export default EN;
