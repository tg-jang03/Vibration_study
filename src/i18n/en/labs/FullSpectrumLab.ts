import type { Dict } from '../../translate';

const EN: Dict = {
  '느리게 (실제의 1/100)': 'Slow (1/100 of real)',
  '보통 (실제의 1/50)': 'Normal (1/50 of real)',
  '빠르게 (실제의 1/25)': 'Fast (1/25 of real)',
  '1X {0}바퀴': '1X {0} turns',
  '오빗: {0}. 정방향 화살표와 역방향 화살표를 이은 끝이 오빗을 그린다.': 'Orbit: {0}. The tip of the forward arrow and the reverse arrow joined end to end draws the orbit.',
  '파랑 +1X': 'Blue +1X',
  '는 반시계(정방향)로, ': ' turns counterclockwise (forward), ',
  '주황 −1X': 'orange −1X',
  '는 시계(역방향)로 같은 빠르기로 돕니다. 둘을 이은 끝(초록 점)이 오빗을 그리고(진한 선 = 방금 지나온 한 바퀴), 끝의 가로·세로 위치가 X·Y 센서 값입니다. 화살표 길이가 아래 Full spectrum의 같은 색 막대입니다.':
    ' clockwise (reverse), at the same speed. The joined tip (green dot) draws the orbit (dark line = the last turn it just made), and the horizontal and vertical position of the tip are the X and Y sensor values. The arrow lengths are the bars of the same color in the full spectrum below.',
  '보라': 'Purple',
  '는 0.45X의 정방향·역방향 화살표입니다.': ' arrows are the forward and reverse arrows of 0.45X.',
  '반시계 (정방향)': 'Counterclockwise (forward)',
  '시계 (역방향)': 'Clockwise (reverse)',
  '직선 (양쪽 같음)': 'Straight line (both equal)',
  '정방향 (+, 반시계)': 'Forward (+, counterclockwise)',
  '역방향 (−, 시계)': 'Reverse (−, clockwise)',
  'X 반쪽 스펙트럼': 'X half spectrum',
  'Y 반쪽 스펙트럼': 'Y half spectrum',
  'Full spectrum: 오빗과 정방향·역방향 성분': 'Full spectrum: orbit and forward/reverse components',
  'X 진폭': 'X amplitude',
  'Y 진폭': 'Y amplitude',
  'Y가 X보다 늦은 위상': 'Phase by which Y lags X',
  '90° = 반시계 원, 270° = 시계 원': '90° = counterclockwise circle, 270° = clockwise circle',
  'Y 센서 감도 오차': 'Y sensor sensitivity error',
  'Y 센서 설치 각도 오차': 'Y sensor mounting-angle error',
  '0.45X 성분 (반시계 원 20 µm)': '0.45X component (counterclockwise circle 20 µm)',
  'P5-2의 오일 휠처럼 축과 같은 방향으로 도는 성분': 'A component that turns in the same direction as the shaft, like the oil whirl of P5-2',
  '센서 오차 없으면: ': 'Without sensor error: ',
  '+1X (+50 Hz) 정방향 반지름': '+1X (+50 Hz) forward radius',
  '−1X (−50 Hz) 역방향 반지름': '−1X (−50 Hz) reverse radius',
  '+0.45X (정방향)': '+0.45X (forward)',
  '−0.45X (역방향)': '−0.45X (reverse)',
  'X·Y 진폭을 그대로 두고 Y의 늦음만 90° → 45° → 0° → 270°로 바꾸면, X·Y 반쪽 스펙트럼과 Full spectrum은 각각 어떻게 바뀌나요?':
    'Keeping the X and Y amplitudes, change only the Y lag, 90° → 45° → 0° → 270°. How do the X·Y half spectra and the full spectrum each change?',
  '반쪽 스펙트럼은 네 경우 모두 50 Hz에 50 µm로 그대로입니다. Full spectrum은 90°: +50 Hz만 50 µm, 45°: 46.2·19.1 µm, 0°: 양쪽 35.4 µm, 270°: −50 Hz만 50 µm로 바뀝니다. 방향은 X·Y의 위상차에만 들어 있습니다.':
    'The half spectra stay at 50 µm at 50 Hz in all four cases. The full spectrum changes: at 90°, 50 µm only at +50 Hz; at 45°, 46.2 and 19.1 µm; at 0°, 35.4 µm on both sides; at 270°, 50 µm only at −50 Hz. The direction is contained only in the phase difference between X and Y.',
  'Y의 늦음을 45°로 두고 오빗 그림의 재생을 누르세요. 타원의 가장 긴 반지름과 가장 짧은 반지름은 두 화살표 길이로 어떻게 정해질까요?':
    'Set the Y lag to 45° and press play on the orbit figure. How are the longest and shortest radii of the ellipse set by the two arrow lengths?',
  '두 화살표가 같은 쪽을 가리킬 때 끝이 가장 멀고(46.2 + 19.1 = 65.3 µm, 긴 반지름), 서로 반대쪽을 가리킬 때 가장 가깝습니다(46.2 − 19.1 = 27.1 µm, 짧은 반지름). 정방향이 더 길어서 끝은 반시계로 돕니다. 역방향이 0이면 원(90°), 두 길이가 같으면 직선(0°)이 됩니다.':
    'When the two arrows point the same way the tip is farthest (46.2 + 19.1 = 65.3 µm, the long radius), and when they point opposite ways it is closest (46.2 − 19.1 = 27.1 µm, the short radius). The forward arrow is longer, so the tip turns counterclockwise. If the reverse arrow is 0 it is a circle (90°), and if the two lengths are equal it is a straight line (0°).',
  '반시계 원(90°)에서 Y 센서 감도 오차 +10 %와 각도 오차 10°를 각각 줘 보세요. 가짜 역방향 막대는 반지름의 몇 %인가요?':
    'On the counterclockwise circle (90°), apply a Y sensor sensitivity error of +10 % and an angle error of 10°, one at a time. What percentage of the radius is the false reverse bar?',
  '감도 10 %는 2.5 µm(5 %), 각도 10°는 4.4 µm(sin 5° = 8.7 %)입니다. 작은 역방향 막대는 센서 각도·감도부터 확인합니다.':
    'A 10 % sensitivity error gives 2.5 µm (5 %) and a 10° angle error 4.4 µm (sin 5° = 8.7 %). For a small reverse bar, check the sensor angle and sensitivity first.',
  '회전 방향: {0}': 'Direction of rotation: {0}',
  '주파수 [Hz] (반쪽)': 'Frequency [Hz] (half)',
  '진폭 [µm]': 'Amplitude [µm]',
  'X와 Y의 반쪽 스펙트럼': 'Half spectra of X and Y',
  '주파수 [Hz] (− = 역방향, + = 정방향)': 'Frequency [Hz] (− = reverse, + = forward)',
  '반지름 [µm]': 'Radius [µm]',
};

export default EN;
