import type { Dict } from '../../translate';

/** src/figures/p6-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 7200 rpm의 X 변위 FFT입니다. 1X 120 Hz를 먼저 잡고, 2X 240 Hz·1X 아래 40 Hz·비동기 73 Hz·고주파 320 Hz 순서로 위치를 읽습니다. 아래 패널은 같은 기록에 시드 고정 잡음을 더해 바닥을 확대한 것입니다. 줄 하나가 원인 이름은 아닙니다.':
    'Figure 1. X displacement FFT at 7200 rpm. Fix 1X at 120 Hz first, then read the positions in this order: 2X at 240 Hz, the line below 1X at 40 Hz, the asynchronous line at 73 Hz, and the high-frequency line at 320 Hz. The bottom panel adds seeded noise to the same record and zooms in on the floor. A single line is not a cause name.',
  '변위 [µm Peak]': 'Displacement [µm Peak]',
  '③ 1X 아래': '③ Below 1X',
  '④ 비동기': '④ Async',
  '⑤ 고주파': '⑤ High freq.',
  '⑥ 바닥 보기: 같은 시드 잡음, 세로축 확대': '⑥ Looking at the floor: same seeded noise, zoomed vertical axis',
  '그림 2. 잠김 시나리오의 같은 FFT를 회전수순으로 쌓았습니다. 줄의 가로 위치를 따라가세요. 1X·2X는 회전수와 함께 오른쪽으로, 73 Hz(점선, 3 µm라 작음)는 같은 자리에 머뭅니다. 주황은 7200 rpm을 유지한 기록 10 ~ 12로, 같은 기준선에 겹칩니다. 세로축은 기록 기준 회전수에 진폭 표시 높이를 더한 것으로 봉우리 꼭대기를 회전수로 읽지 않습니다.':
    'Figure 2. The same FFTs of the locking scenario, stacked in order of shaft speed. Follow the horizontal position of each line. 1X and 2X move to the right with the shaft speed, while 73 Hz (dotted, small at 3 µm) stays at the same place. Orange marks records 10 ~ 12 held at 7200 rpm, which overlap on the same baseline. The vertical axis is the recorded shaft speed plus a displayed amplitude height, so do not read a peak top as the shaft speed.',
  '회전수 [rpm] + 진폭 표시 높이': 'Shaft speed [rpm] + displayed amplitude height',
  '그림 3. FFT 기록에서 읽는 비교 성분의 주파수 경로입니다. 추종만이면 4800→7200 rpm에서 36→54 Hz, 잠김 모델은 36→40 Hz입니다. 600 rpm 간격 기록을 이은 선이라 잠김 꺾임(모델 약 5333 rpm)이 5400 rpm 기록에서 보입니다. 처음부터 40 Hz인 줄도 마지막은 40 Hz이므로 앞의 경로와 운전·베어링 정보를 함께 확인합니다. 모드 40 Hz·비율 0.45는 학습값입니다.':
    'Figure 3. Frequency path of the comparison component read from the FFT records. With tracking only it goes 36→54 Hz from 4800→7200 rpm; the locking model goes 36→40 Hz. Because the line joins records 600 rpm apart, the locking kink (about 5333 rpm in the model) shows up at the 5400 rpm record. A line at 40 Hz from the start also ends at 40 Hz, so check the earlier path together with operating and bearing information. Mode 40 Hz and ratio 0.45 are learning values.',
  '비율 추종만': 'Ratio tracking only',
  '추종 → 잠김': 'Tracking → locking',
  '처음부터 고정': 'Fixed from start',
  '비교 성분 주파수 [Hz]': 'Comparison component frequency [Hz]',
  '그림 4. 그림 3을 차수로 나누어 읽었습니다. 추종 줄은 0.45X로 일정합니다. 잠긴 40 Hz 줄은 회전수가 높아지면 0.4X(6000 rpm)→0.333X(7200 rpm)로 내려옵니다. 차수 감소는 주파수 감소와 같지 않습니다.':
    'Figure 4. Figure 3 read in orders. The tracking line is constant at 0.45X. The locked 40 Hz line comes down from 0.4X (6000 rpm) to 0.333X (7200 rpm) as the shaft speed rises. A decrease in order is not the same as a decrease in frequency.',
  '잠김 모델': 'Locking model',
  '서브 성분 차수 [X]': 'Sub component order [X]',
  '그림 5. 기록 10~12는 모두 7200 rpm, X 1X는 20→25→30 µm Peak입니다. 위 Waterfall은 100·110·120 s 기준선이 나뉘지만 아래 Cascade는 같은 7200 rpm에 겹칩니다. 변화 시각과 수치는 선택 스펙트럼·시간 추세로 확인하세요.':
    'Figure 5. Records 10 ~ 12 are all at 7200 rpm, with X 1X going 20→25→30 µm Peak. In the upper waterfall the 100, 110 and 120 s baselines are separate, but in the lower cascade they overlap at the same 7200 rpm. Check the time of the change and the values in the selected spectrum and the time trend.',
  '시각 [s] + 진폭 표시 높이': 'Time [s] + displayed amplitude height',
  '같은 회전수, 다른 시각': 'Same shaft speed, different times',
  'Cascade 기준선은 모두 7200 rpm': 'All cascade baselines are 7200 rpm',
  '그림 6. X 오른쪽·Y 위쪽·축 반시계 회전의 Full spectrum cascade입니다. 1X는 +와 −쪽 모두 회전수를 따라가고, 서브 성분은 +쪽에서 추종 후 40 Hz에 잠깁니다. 주황은 7200 rpm 유지 기록 10 ~ 12입니다. +/−는 선회 방향 분해입니다. 원 반지름을 X 채널 Peak와 같은 값으로 읽지 마세요.':
    'Figure 6. Full spectrum cascade with X to the right, Y up and the shaft turning counterclockwise. 1X follows the shaft speed on both the + and − sides, and the sub component tracks on the + side and then locks at 40 Hz. Orange marks the 7200 rpm hold records 10 ~ 12. +/− is the whirl-direction split. Do not read a circle radius as the same value as the X channel peak.',
  '주파수 [Hz] (+ 정방향 / − 역방향)': 'Frequency [Hz] (+ forward / − backward)',
  '그림 7. 선택 기록 10(7200 rpm)에서 X 1X는 20 µm Peak, Full spectrum의 +1X 반지름은 15, −1X는 5 µm입니다. 역방향 몫 50 %로 바꾸면 X 1X는 20 그대로, 두 반지름은 10/10 µm가 됩니다. 역 성분의 존재 자체가 고장을 확정하지 않습니다.':
    'Figure 7. In the selected record 10 (7200 rpm), X 1X is 20 µm Peak and the full spectrum has a +1X radius of 15 and −1X of 5 µm. Changing the backward share to 50 % leaves X 1X at 20, and the two radii become 10/10 µm. The mere presence of a backward component does not confirm a fault.',
  '원 반지름 [µm]': 'Circle radius [µm]',
  '서브 12 µm': 'Sub 12 µm',
};
export default EN;
