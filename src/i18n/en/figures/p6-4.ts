import type { Dict } from '../../translate';

/** src/figures/p6-4.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 1X 진폭 20 µm Peak·2X 2 µm Peak를 유지하고 1X 지연각만 350°→470°로 바꿨습니다. Overall은 14.21 µm RMS로 평평합니다(점선 1X RMS 14.14 µm와 거의 겹칩니다). 큰 변화가 없다는 뜻으로 바로 읽으면 위상 이동을 놓칩니다.':
    'Figure 1. The 1X amplitude of 20 µm Peak and 2X of 2 µm Peak are kept, and only the 1X lag angle changes from 350° to 470°. Overall is flat at 14.21 µm RMS (the dashed 1X RMS of 14.14 µm almost overlaps it). Reading this directly as "no big change" misses the phase shift.',
  '크기는 그대로': 'Magnitude unchanged',
  '시각 [분]': 'Time [min]',
  '변위 [µm RMS]': 'Displacement [µm RMS]',
  '그림 2. 같은 1X 기록을 진폭과 지연각으로 나눈 APHT입니다. 진폭은 20 µm Peak로 일정하고 지연각은 60분 동안 120° 증가합니다. 가로축은 시간이며, 회전수가 가로축인 Bode와 구별하세요.':
    'Figure 2. APHT: the same 1X record split into amplitude and lag angle. The amplitude is constant at 20 µm Peak and the lag angle increases by 120° over 60 minutes. The horizontal axis is time; do not confuse it with Bode, whose horizontal axis is rotating speed.',
  '1X 진폭': '1X amplitude',
  '1X 연속 지연각': '1X continuous lag',
  '그림 3. 파랑은 그림 2의 같은 1X 벡터 끝 경로입니다. 기준 벡터(0분, 350°)와 60분 벡터(110°, 연속 470°)의 길이는 둘 다 20 µm Peak입니다. 보라 화살표는 두 끝 사이 변화량 34.64 µm Peak이며 진폭차 0과 다릅니다.':
    'Figure 3. The blue path is the tip of the same 1X vector as in Figure 2. The reference vector (0 min, 350°) and the 60 min vector (110°, continuous 470°) are both 20 µm Peak long. The purple arrow is the change between the two tips, 34.64 µm Peak, which differs from the amplitude difference of 0.',
  '0분·350°': '0 min · 350°',
  '60분·110°': '60 min · 110°',
  '그림 4. 초록 윤곽은 기준 20 µm Peak·350°의 진폭 ±20%·지연 ±30° 허용 영역입니다. 진폭 16~24 µm Peak와 지연 320°~20°(0°를 넘어 이어짐)를 함께 봅니다. 15분 경계는 포함되고 첫 이탈 표본은 16분입니다. 임의 학습값이며 규격 한계가 아닙니다.':
    'Figure 4. The green outline is the acceptance region of ±20% amplitude and ±30° lag around the reference of 20 µm Peak and 350°. Amplitudes of 16 to 24 µm Peak and lags of 320° to 20° (continuing past 0°) are read together. The 15 min boundary is included and the first departing sample is 16 min. These are arbitrary learning values, not standard limits.',
  '허용 영역 경계': 'Acceptance boundary',
  '1X 경로': '1X path',
  '15분 경계': '15 min',
  '60분 영역 밖': '60 min outside',
  '그림 5. 1X는 20 µm Peak 그대로, 2X는 2→8 µm Peak로 증가합니다. Overall은 14.21→15.23 µm RMS(7.17% 증가)입니다. 정확히 1X를 제거한 잔여 RMS는 1.414→5.657 µm로 4배입니다. 대역 전체 값과 잔여 값을 함께 확인하세요.':
    'Figure 5. 1X stays at 20 µm Peak while 2X grows from 2 to 8 µm Peak. Overall goes from 14.21 to 15.23 µm RMS (a 7.17% increase). The residual RMS with exactly 1X removed goes from 1.414 to 5.657 µm, 4 times. Check the whole-band value and the residual value together.',
  '전체와 잔여를 같은 눈금으로': 'Total and residual on the same scale',
  'Not-1X (정확 제거 모델)': 'Not-1X (exact-removal model)',
  '그림 6. 위는 350°→470°의 알려진 연속 경로, 아래는 0~360°로 접은 같은 위상입니다. 4분 358°→5분 0°는 358° 점프가 아니라 +2° 이동입니다. 경계에서 선을 끊어 거짓 세로선을 피합니다. 실제 표본 간 이동이 180°를 넘으면 인접 위상만으로 선회 횟수를 복원할 수 없습니다.':
    'Figure 6. Top: the known continuous path from 350° to 470°. Bottom: the same phase wrapped into 0 to 360°. 358° at 4 min to 0° at 5 min is a movement of +2°, not a 358° jump. The line is broken at the boundary to avoid a false vertical line. If the real movement between samples exceeds 180°, the number of rotations cannot be recovered from adjacent phases alone.',
  '연속 지연각': 'Continuous lag',
  '0~360°로 접은 지연각': 'Lag wrapped into 0 to 360°',
};

export default EN;
