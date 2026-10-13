import type { Dict } from '../../translate';

/** src/figures/p2-4.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 10 Hz와 11 Hz 정현파를 더한 신호. 위: 2초 동안 보면 크기가 1초마다 커졌다 작아졌다 한다(맥놀이, 점선은 그 바깥 모양). 이 "1초짜리 출렁임"이 두 성분이 1 Hz 차이라는 유일한 흔적이다. 아래: 처음 0.25초만 잘라 보면 그냥 10.5 Hz 정현파 하나처럼 보인다. 1 Hz 차이를 알아보려면 1초 가까이 봐야 한다 — 이것이 Δf = 1/T의 뜻이다.':
    'Figure 1. The sum of 10 Hz and 11 Hz sine waves. Top: over 2 seconds, the amplitude swells and fades every second (a beat; the dashed line is its outline). This "1-second swelling" is the only trace that the two components differ by 1 Hz. Bottom: cut to just the first 0.25 s, it looks like a single 10.5 Hz sine wave. To notice a 1 Hz difference you must watch for nearly a second — this is the meaning of Δf = 1/T.',
  '2초 동안 보면: 1초마다 크기가 출렁인다': 'Over 2 s: the amplitude swells every 1 s',
  '0.25초': '0.25 s',
  '1초 = 1 / (11 − 10 Hz)': '1 s = 1 / (11 − 10 Hz)',
  '처음 0.25초만 보면: 정현파 하나처럼 보인다': 'First 0.25 s only: looks like one sine wave',
  // 그림 2
  '그림 2. 25.2 Hz와 28.8 Hz(주황 점선, 간격 3.6 Hz) 두 성분. F_max = 1000 Hz, Hann 윈도우(분석기 기본값)에서 라인 수만 바꿨다. 막대는 분석기가 계산한 bin, 옅은 선은 bin 사이를 채운 모양. 위: 400 라인 → Δf = 2.5 Hz, T = 0.4 s. 간격이 1.4 bin뿐이라 두 성분이 하나의 둔덕으로 뭉친다. 아래: 1600 라인 → Δf = 0.625 Hz, T = 1.6 s. 간격이 5.8 bin이 되어 두 봉우리로 갈라진다.':
    'Figure 2. Two components at 25.2 Hz and 28.8 Hz (orange dashed, spacing 3.6 Hz). F_max = 1000 Hz, Hann window (analyzer default); only the number of lines is changed. Bars are the bins the analyzer computes; the faint line fills in between the bins. Top: 400 lines → Δf = 2.5 Hz, T = 0.4 s. The spacing is only 1.4 bins, so the two components merge into one hump. Bottom: 1600 lines → Δf = 0.625 Hz, T = 1.6 s. The spacing becomes 5.8 bins and they split into two peaks.',
  '400 라인 (T = 0.4 s): 하나로 뭉친다': '400 lines (T = 0.4 s): merge into one',
  '1600 라인 (T = 1.6 s): 두 개로 갈라진다': '1600 lines (T = 1.6 s): split into two',
  // 그림 3
  '그림 3. 3600 rpm에서 1초에 60 rpm씩 느려지는 기계(감속률 60 rpm/s). 1X는 1초에 1 Hz씩 내려간다. 0.5초 프레임 동안에는 1X가 0.5 Hz만 움직이지만, 4초 프레임 동안에는 4 Hz나 움직인다. 긴 프레임의 스펙트럼에는 그 4 Hz 전체가 한꺼번에 찍힌다.':
    'Figure 3. A machine slowing by 60 rpm every second from 3600 rpm (deceleration rate 60 rpm/s). 1X drops 1 Hz every second. During a 0.5 s frame 1X moves only 0.5 Hz, but during a 4 s frame it moves a full 4 Hz. The spectrum of the long frame records that whole 4 Hz at once.',
  '1X 주파수': '1X frequency',
  '0.5초': '0.5 s',
  '4초 프레임: 이 동안 1X가 4 Hz 움직인다': '4 s frame: 1X moves 4 Hz in this time',
  // 그림 4
  '그림 4. 그림 3의 신호를 두 길이로 잰 스펙트럼. 위: 0.5초(Δf = 2 Hz) — 1X가 0.25 bin만 움직여 막대 하나가 높게(0.99) 선다. 아래: 4초(Δf = 0.25 Hz) — 눈금은 8배 촘촘해졌지만 1X가 16 bin에 걸쳐 움직여, 에너지가 여러 막대에 나뉘어 퍼지고 가장 높은 막대도 0.5로 낮아진다. 회색 막대는 같은 4초 동안 회전수가 일정했다면 보였을 모양(가운데 1.0)이다. 이렇게 퍼지는 것을 스미어링(Smearing)이라 한다.':
    'Figure 4. Spectra of the signal in Figure 3 measured at two lengths. Top: 0.5 s (Δf = 2 Hz) — 1X moves only 0.25 bin, so a single bar stands tall (0.99). Bottom: 4 s (Δf = 0.25 Hz) — the grid is 8 times finer, but 1X moves across 16 bins, so the energy is divided among several bars and even the tallest drops to 0.5. The gray bars show what you would see if the speed had stayed constant for the same 4 s (1.0 in the middle). This spreading is called smearing.',
  '0.5초 측정 (Δf = 2 Hz): 막대가 좁고 높다': '0.5 s measurement (Δf = 2 Hz): narrow, tall bar',
  '4초 측정 (Δf = 0.25 Hz): 넓게 퍼지고 낮아진다': '4 s measurement (Δf = 0.25 Hz): spread wide and lower',
  '프레임 동안 1X가 움직인 4 Hz': '4 Hz that 1X moved during the frame',
  // 그림 5
  '그림 5. 1200 Hz 성분(진폭 1) 양옆 ±5 Hz에 작은 성분(측대역, 진폭 0.4)이 붙은 신호. 위: 0 ~ 2000 Hz 전체를 400 라인으로 보면 Δf = 5 Hz라 세 성분의 둔덕이 겹친다. 가운데: 그 부분을 크게 그리면 막대 모양만으로는 성분이 몇 개인지 알 수 없고, 겹친 둔덕끼리 서로 깎아 1200 Hz 막대 높이도 1이 아니라 약 0.6으로 틀리게 나온다. 아래: 1200 Hz 주변만 8배 촘촘하게(Δf = 0.625 Hz) 보면 세 성분이 갈라진다. 이렇게 "좁은 구간만 촘촘히" 보는 것이 Zoom FFT다. 대신 측정 시간도 0.2 s → 1.6 s로 8배 길어진다.':
    'Figure 5. A signal with small components (sidebands, amplitude 0.4) attached at ±5 Hz on either side of a 1200 Hz component (amplitude 1). Top: viewing the whole 0 to 2000 Hz with 400 lines gives Δf = 5 Hz, so the humps of the three components overlap. Middle: drawn larger, the bar shapes alone do not tell you how many components there are, and the overlapping humps cut into each other so that the 1200 Hz bar reads about 0.6 instead of 1. Bottom: viewing only the area around 1200 Hz 8 times finer (Δf = 0.625 Hz) separates the three components. This "fine look at only a narrow band" is zoom FFT. In return, the measurement time is also 8 times longer, 0.2 s → 1.6 s.',
  '전체 0 ~ 2000 Hz, 400 라인 (Δf = 5 Hz, T = 0.2 s)': 'Full 0 to 2000 Hz, 400 lines (Δf = 5 Hz, T = 0.2 s)',
  '확대할 구간': 'Band to zoom',
  '같은 스펙트럼의 1185 ~ 1215 Hz 부분: 막대 간격 5 Hz': 'Same spectrum, 1185 to 1215 Hz: bar spacing 5 Hz',
  'Zoom ×8: 1200 Hz 주변만 Δf = 0.625 Hz (T = 1.6 s)': 'Zoom ×8: only around 1200 Hz, Δf = 0.625 Hz (T = 1.6 s)',
};

export default EN;
