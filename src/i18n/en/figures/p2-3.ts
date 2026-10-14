import type { Dict } from '../../translate';

/** src/figures/p2-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 1초에 1000번(f_s = 1000 Hz) 읽을 때. 위: 940 Hz 신호(회색)는 1 ms 사이에 거의 한 바퀴를 돌아 버려서, 읽은 점(파란 점)들이 느린 60 Hz 물결(주황 점선)을 그린다. 아래: 진짜 60 Hz 신호를 같은 속도로 읽은 점. 두 경우의 점이 완전히 같다 — 분석기는 점만 가지고 있으므로 둘을 구분할 방법이 없다.':
    'Figure 1. Reading 1000 times a second (f_s = 1000 Hz). Top: the 940 Hz signal (gray) turns almost a full cycle in 1 ms, so the sampled dots (blue) trace a slow 60 Hz wave (orange dashed). Bottom: a real 60 Hz signal read at the same rate. The dots are exactly the same in both cases — the analyzer has only the dots, so it has no way to tell the two apart.',
  '940 Hz 신호를 1 ms마다 읽으면': 'Reading a 940 Hz signal every 1 ms',
  '실제 신호 940 Hz': 'Real signal 940 Hz',
  '점이 그리는 60 Hz': '60 Hz traced by the dots',
  샘플: 'Samples',
  '진짜 60 Hz 신호를 1 ms마다 읽으면': 'Reading a real 60 Hz signal every 1 ms',
  '시간 [s]': 'Time [s]',
  // 그림 2
  '그림 2. f_s = 1000 Hz일 때 실제 주파수(가로)가 스펙트럼에서 몇 Hz로 보이는지(세로). 0 ~ 500 Hz(f_N)는 그대로 보이고, 그보다 높으면 종이를 접듯 지그재그로 0 ~ 500 Hz 안에 접혀 들어온다. 60, 940, 1060, 1940 Hz가 모두 같은 60 Hz 자리에 앉는다.':
    'Figure 2. With f_s = 1000 Hz: the real frequency (horizontal) and the frequency at which it appears in the spectrum (vertical). 0 to 500 Hz (f_N) appears as it is; anything higher folds back into 0 to 500 Hz in a zigzag, like folded paper. 60, 940, 1060 and 1940 Hz all land on the same 60 Hz spot.',
  '그대로 보이는 구간': 'Seen as it is',
  '모두 60 Hz로 보인다': 'All appear as 60 Hz',
  '실제 주파수 [Hz]': 'Real frequency [Hz]',
  '보이는 주파수 [Hz]': 'Apparent frequency [Hz]',
  // 그림 3
  '그림 3. 신호가 딱 f_N(= 500 Hz)이면 한 주기에 점이 정확히 2개다. 위: 꼭대기와 바닥에 점이 찍히면 신호가 보인다. 아래: 같은 신호가 90° 어긋나 있으면 점이 모두 0을 지나는 순간에 찍혀 신호가 통째로 사라진다. 그래서 f_N "이하"가 아니라 f_N "미만"이어야 안전하다.':
    'Figure 3. A signal exactly at f_N (= 500 Hz) gets exactly two dots per cycle. Top: if the dots land on the peaks and troughs, the signal is visible. Bottom: if the same signal is shifted by 90°, every dot lands on a zero crossing and the signal disappears completely. That is why being "at or below" f_N is not safe — it must be "below" f_N.',
  '위상 0°: 점이 꼭대기·바닥에': 'Phase 0°: dots on peaks and troughs',
  '위상 90°: 점이 모두 0 → 신호가 안 보인다': 'Phase 90°: every dot is 0 → the signal is invisible',
  // 그림 4
  '그림 4. F_max = 1000 Hz, f_s = 2560 Hz인 분석기의 필터(AAF). 실제 필터는 F_max에서 수직으로 끊지 못하고 비스듬히 깎는다(차수가 높을수록 가파르다). 1560 Hz(= f_s − F_max)보다 높은 성분이 남아 있으면 접혀서 화면(0 ~ F_max) 안으로 들어온다. F_max ~ 1560 Hz가 필터가 깎을 시간을 버는 여유 구간이고, 그 앞부분(F_max ~ f_N)은 계산은 하지만 화면에 보여 주지 않는다.':
    'Figure 4. The filter (AAF) of an analyzer with F_max = 1000 Hz and f_s = 2560 Hz. A real filter cannot cut straight down at F_max; it attenuates gradually (more steeply for higher orders). Any component left above 1560 Hz (= f_s − F_max) folds into the screen (0 to F_max). F_max to 1560 Hz is the margin that buys the filter room to attenuate; its first part (F_max to f_N) is computed but not shown on screen.',
  '2차': '2nd order',
  '4차': '4th order',
  '8차': '8th order',
  '이상적 필터': 'Ideal filter',
  '화면에 보이는 구간': 'Shown on screen',
  '여유 구간': 'Margin',
  '남으면 접혀 들어오는 구간': 'Folds in if left',
  '주파수 [Hz]': 'Frequency [Hz]',
  '통과량 [dB]': 'Gain [dB]',
  // 그림 5
  '그림 5. F_max = 1000 Hz, f_s = 2560 Hz. 센서 신호에 300 Hz 성분과, 화면 밖인 1800 Hz 성분이 같은 크기로 들어 있다. AAF가 없으면 1800 Hz가 |1800 − 2560| = 760 Hz로 접혀 화면 안에 가짜 막대를 세운다 — 실제로는 없는 주파수다. 8차 AAF를 거치면 1800 Hz 성분이 미리 0.0091배(약 1 %)로 깎인 뒤 샘플링되므로 가짜 막대가 거의 보이지 않는다.':
    'Figure 5. F_max = 1000 Hz, f_s = 2560 Hz. The sensor signal contains a 300 Hz component and an off-screen 1800 Hz component of the same size. Without an AAF, 1800 Hz folds to |1800 − 2560| = 760 Hz and puts a fake bar on screen — a frequency that does not really exist. With an 8th-order AAF the 1800 Hz component is cut to 0.0091 times (about 1 %) before sampling, so the fake bar is hardly visible.',
  '센서에 들어온 실제 신호': 'Real signal at the sensor',
  '1800 Hz (화면 밖)': '1800 Hz (off screen)',
  'AAF 없이 샘플링한 스펙트럼': 'Spectrum sampled without an AAF',
  '가짜 760 Hz': 'Fake 760 Hz',
  '8차 AAF를 거친 뒤 샘플링': 'Sampled after an 8th-order AAF',
  // 그림 6
  '그림 6. N개 샘플을 FFT하면 0 ~ f_N 사이에 bin이 N/2개 나온다. f_s = 2.56 F_max라서 f_N = 1.28 F_max이므로, 앞쪽 N/2 ÷ 1.28 = N/2.56개만 0 ~ F_max에 해당한다. 분석기는 이 개수를 라인 수(LOR)로 표시하고 나머지는 버린다. 1024 → 400 라인, 2048 → 800 라인.':
    'Figure 6. An FFT of N samples gives N/2 bins between 0 and f_N. Since f_s = 2.56 F_max, f_N = 1.28 F_max, so only the first N/2 ÷ 1.28 = N/2.56 bins fall between 0 and F_max. The analyzer reports this count as the number of lines (LOR) and discards the rest. 1024 → 400 lines, 2048 → 800 lines.',
  'N = 1024 → bin 512개 중 400개만 화면에': 'N = 1024 → only 400 of 512 bins on screen',
  '보이는 400 라인 (0 ~ F_max)': '400 lines shown (0 to F_max)',
  '버림 112': '112 discarded',
  'N = 2048 → bin 1024개 중 800개만 화면에': 'N = 2048 → only 800 of 1024 bins on screen',
  '보이는 800 라인 (0 ~ F_max)': '800 lines shown (0 to F_max)',
  '버림 224': '224 discarded',
  'bin 번호 (오른쪽 끝 = f_N)': 'Bin number (right end = f_N)',
  // 그림 7
  '그림 7. 3 bit ADC(레인지 ±1 V)는 전압을 8칸(2³)으로만 나눠 적는다. 한 칸의 높이가 1 LSB = 2 V / 8 = 0.25 V이고, 실제 값과 저장된 값의 차이(최대 ±½ LSB)가 양자화 잡음이다. 위: 신호가 레인지를 넉넉히 쓰면 8칸 중 7칸을 쓴다. 아래: 신호가 레인지보다 5배 작으면 3칸만 써서 모양이 크게 뭉개진다. 실제 분석기는 16 ~ 24 bit(6만 ~ 1600만 칸)라 훨씬 촘촘하지만 원리는 같다.':
    'Figure 7. A 3-bit ADC (range ±1 V) records voltage in only 8 steps (2³). One step is 1 LSB = 2 V / 8 = 0.25 V, and the difference between the real and the stored value (at most ±½ LSB) is the quantization noise. Top: a signal that uses the range well occupies 7 of the 8 steps. Bottom: a signal five times smaller than the range uses only 3 steps and its shape is badly smeared. Real analyzers have 16 to 24 bits (65 thousand to 16 million steps), far finer, but the principle is the same.',
  '신호 0.7 V, 레인지 ±1 V: 칸을 넉넉히 쓴다': 'Signal 0.7 V, range ±1 V: uses the steps well',
  '원래 신호': 'Original signal',
  '저장된 값': 'Stored values',
  '신호 0.2 V, 레인지 ±1 V: 3칸만 쓴다': 'Signal 0.2 V, range ±1 V: uses only 3 steps',
  // 그림 8
  '그림 8. 진폭 1 V인 50 Hz 정현파를 레인지 ±0.7 V로 받으면 꼭대기와 바닥이 잘린다(클리핑). 잘린 파형은 사각파에 가까워지므로(P2-2 1.2절) 기계에 없던 홀수 하모닉 — 150 Hz(0.11), 250 Hz(0.02) … — 이 스펙트럼에 생긴다. 측정 과정이 만든 가짜이므로 시간파형에서 잘린 모양을 먼저 확인한다.':
    'Figure 8. A 50 Hz sine of 1 V amplitude recorded with a ±0.7 V range has its peaks and troughs cut off (clipping). The clipped waveform is closer to a square wave (P2-2 §1.2), so odd harmonics the machine never had — 150 Hz (0.11), 250 Hz (0.02), … — appear in the spectrum. They are fakes made by the measurement, so check the time waveform for the cut shape first.',
  '시간파형: 레인지(±0.7 V)에서 잘림': 'Time waveform: cut at the range (±0.7 V)',
  '저장된 신호': 'Stored signal',
  '스펙트럼: 홀수 하모닉이 생긴다': 'Spectrum: odd harmonics appear',
};

export default EN;
