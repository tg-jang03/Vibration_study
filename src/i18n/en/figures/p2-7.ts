import type { Dict } from '../../translate';

/** src/figures/p2-7.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 같은 신호 — 50 Hz 톤 1 mm/s RMS + 0 ~ 640 Hz에 고르게 퍼진 잡음 1 mm/s RMS — 를 400 라인과 3200 라인으로 쟀다 (F_max 500 Hz, Hann, 파워 평균 8회). 세로축은 진폭 RMS를 dB로 그렸다 (0 dB = 1 mm/s). 톤의 높이는 두 경우 모두 0.1 dB(약 1 mm/s)로 같다. 그런데 잡음 바닥(주황 점선)은 −25.3 dB에서 −34.3 dB로 약 9 dB 내려갔다. 잡음은 그대로인데 화면의 바닥 높이가 바뀐 것이다.':
    'Figure 1. The same signal (a 50 Hz tone of 1 mm/s RMS plus noise of 1 mm/s RMS spread evenly over 0 – 640 Hz) measured with 400 lines and with 3200 lines (F_max 500 Hz, Hann, power averaged 8 times). The vertical axis is the amplitude RMS in dB (0 dB = 1 mm/s). The tone height is the same in both cases, 0.1 dB (about 1 mm/s). But the noise floor (orange dashed line) dropped about 9 dB, from −25.3 dB to −34.3 dB. The noise is unchanged; only the height of the floor on the screen changed.',
  '400 라인 (Δf = 1.25 Hz, 측정 0.8 s)': '400 lines (Δf = 1.25 Hz, 0.8 s record)',
  '잡음 바닥 −25.3 dB': 'Noise floor −25.3 dB',
  '톤 0.1 dB': 'Tone 0.1 dB',
  '3200 라인 (Δf = 0.156 Hz, 측정 6.4 s)': '3200 lines (Δf = 0.156 Hz, 6.4 s record)',
  '잡음 바닥 −34.3 dB': 'Noise floor −34.3 dB',
  // 그림 2
  '그림 2. 그림 1에서 톤을 빼고 잡음만 45 ~ 55 Hz로 확대해 bin마다 파워(RMS²)를 막대로 세웠다. 400 라인(파랑)은 이 10 Hz를 8개의 넓은 bin으로, 3200 라인(초록)은 64개의 좁은 bin으로 나눠 담는다. 막대 하나의 높이는 약 1/8로 낮아졌지만, 10 Hz 안의 막대를 모두 더하면 0.0213과 0.0227 (mm/s)²로 거의 같다. 잡음의 양은 그대로이고, 나눠 담는 바구니가 작아졌을 뿐이다.':
    'Figure 2. Figure 1 with the tone removed, zoomed to the noise alone at 45 – 55 Hz, with the power (RMS²) of each bin drawn as a bar. With 400 lines (blue) these 10 Hz are split into 8 wide bins, with 3200 lines (green) into 64 narrow bins. Each bar is about 1/8 as tall, but adding up the bars within the 10 Hz gives 0.0213 and 0.0227 (mm/s)², almost the same. The amount of noise is unchanged; the baskets it is divided into just got smaller.',
  '400 라인: bin 하나의 폭 1.25 Hz → 10 Hz에 8개': '400 lines: bin width 1.25 Hz → 8 in 10 Hz',
  'bin 하나의 평균 0.0029 (점선)': 'Mean per bin 0.0029 (dashed)',
  '3200 라인: bin 하나의 폭 0.156 Hz → 10 Hz에 64개': '3200 lines: bin width 0.156 Hz → 64 in 10 Hz',
  'bin 하나의 평균 0.00037 (점선)': 'Mean per bin 0.00037 (dashed)',
  '파워 [(mm/s)²]': 'Power [(mm/s)²]',
  // 그림 3
  '그림 3. 그림 1과 같은 측정을 PSD로 그렸다 (보라, 0 dB = 1 (mm/s)²/Hz). 이번에는 반대다. 잡음 바닥은 두 경우 모두 약 −28.1 dB(이론 2σ²/f_s)로 같고, 톤이 −2.6 dB에서 6.4 dB로 약 9 dB(8배) 커졌다. PSD는 잡음의 크기를 Δf와 상관없이 읽게 해 주지만, 톤의 높이는 Δf에 따라 달라진다.':
    'Figure 3. The same measurement as Figure 1, drawn as a PSD (purple, 0 dB = 1 (mm/s)²/Hz). This time it is the other way round. The noise floor is the same in both cases, about −28.1 dB (theory 2σ²/f_s), and the tone grew from −2.6 dB to 6.4 dB, about 9 dB (a factor of 8). The PSD lets you read the size of noise independently of Δf, but the height of a tone depends on Δf.',
  '400 라인': '400 lines',
  '잡음 바닥 −28 dB': 'Noise floor −28 dB',
  '톤 −2.6 dB': 'Tone −2.6 dB',
  '3200 라인': '3200 lines',
  '톤 6.4 dB': 'Tone 6.4 dB',
  // 그림 4
  '그림 4. 3200 라인 스펙트럼(Hann)의 파워를 0 Hz부터 차례로 더해 제곱근을 취했다 — 그 주파수까지의 "대역 RMS". 50 Hz에서 톤 몫(1 mm/s)이 한꺼번에 더해지고, 그 뒤로 잡음 몫이 고르게 쌓인다. 파워 합을 ENBW(Hann 1.5)로 나눈 파랑은 끝에서 1.43 mm/s로, 시간 파형에서 직접 잰 RMS 1.42 mm/s(회색)와 맞는다. 나누지 않은 주황은 1.75 mm/s로 √1.5 ≈ 1.22배 크다.':
    'Figure 4. The power of the 3200-line spectrum (Hann) added up from 0 Hz and square-rooted: the "band RMS" up to that frequency. At 50 Hz the share of the tone (1 mm/s) is added all at once, and after that the share of the noise piles up evenly. The blue curve, the power sum divided by the ENBW (1.5 for Hann), ends at 1.43 mm/s, which matches the RMS of 1.42 mm/s measured directly from the time waveform (gray). The orange curve, not divided, ends at 1.75 mm/s, √1.5 ≈ 1.22 times too large.',
  '파워 합 (ENBW로 나누지 않음)': 'Power sum (not divided by ENBW)',
  '파워 합 ÷ ENBW': 'Power sum ÷ ENBW',
  '파형의 RMS 1.42 mm/s (회색 점선)': 'Waveform RMS 1.42 mm/s (gray dashed)',
  '여기까지 더한 주파수 [Hz]': 'Summed up to frequency [Hz]',
  '대역 RMS [mm/s]': 'Band RMS [mm/s]',
  // 그림 5
  '그림 5. 1X(25 Hz, 1 m/s² Peak)에 1초에 107번 되풀이되는 짧은 충격이 섞인 가속도 파형. 시간 파형에서 잰 진짜 Peak(true peak, 주황)는 6.41 m/s²다. 이 신호의 RMS는 1.21 m/s²(회색)이고, 많은 분석기가 "Peak"라고 표시하는 √2 × RMS(derived peak, 초록)는 1.7 m/s²로 진짜 Peak의 27 %밖에 안 된다. Crest factor가 5.32으로 정현파의 √2보다 훨씬 크기 때문이다.':
    'Figure 5. An acceleration waveform of 1X (25 Hz, 1 m/s² Peak) mixed with short impacts repeating 107 times a second. The true peak measured on the time waveform (orange) is 6.41 m/s². The RMS of this signal is 1.21 m/s² (gray), and √2 × RMS (the derived peak, green), which many analyzers display as "Peak", is 1.7 m/s², only 27 % of the true peak. The reason is that the crest factor, 5.32, is much larger than the √2 of a sine.',
  '진짜 Peak 6.41': 'True peak 6.41',
  '가속도 [m/s²]': 'Acceleration [m/s²]',
  // 그림 6
  '그림 6. 속도가 늘 5 mm/s RMS인 정현파 진동을 주파수만 바꿔 가며 변위(µm Peak-Peak, 파랑)와 가속도(g Peak, 초록)로 바꿨다. 두 축 모두 로그 눈금이다. 변위는 주파수에 반비례해 10 Hz에서 225 µm지만 1 kHz에서는 2.25 µm로 작아지고, 가속도는 주파수에 비례해 10 Hz의 0.045 g가 1 kHz에서 4.53 g가 된다. 같은 진동이라도 낮은 주파수는 변위로, 높은 주파수는 가속도로 볼 때 숫자가 커서 잘 보인다.':
    'Figure 6. A sine vibration whose velocity is always 5 mm/s RMS, converted to displacement (µm Peak-Peak, blue) and acceleration (g Peak, green) while only the frequency changes. Both axes are logarithmic. Displacement is inversely proportional to frequency: 225 µm at 10 Hz, shrinking to 2.25 µm at 1 kHz. Acceleration is proportional to frequency: 0.045 g at 10 Hz becomes 4.53 g at 1 kHz. Even for the same vibration, low frequencies are easier to see in displacement and high frequencies in acceleration, because the numbers are larger.',
  '변위 [µm Peak-Peak]': 'Displacement [µm Peak-Peak]',
  '가속도 [g Peak]': 'Acceleration [g Peak]',
  '주파수 [Hz] (로그 눈금)': 'Frequency [Hz] (log scale)',
  // 그림 7
  '그림 7. 1X(25 Hz)와 그 정수배 성분 넷, 그리고 1X의 정수배가 아닌 작은 성분 두 개(147 Hz, 294 Hz)가 섞인 속도 스펙트럼 (1600 라인, Hann). 위: 선형 축 — 1X 2.12 mm/s RMS 옆에서 147 Hz의 0.012 mm/s는 막대가 보이지 않는다. 아래: 같은 스펙트럼을 dB(0 dB = 1 mm/s RMS)로 그리면 1X 6.5 dB, 147 Hz −38.4 dB, 294 Hz −46 dB가 잡음 바닥 위에 또렷이 선다. 크기 차이가 수백 배인 성분을 한 화면에 보려면 dB가 필요하다.':
    'Figure 7. A velocity spectrum (1600 lines, Hann) mixing 1X (25 Hz), four of its integer multiples, and two small components that are not integer multiples of 1X (147 Hz, 294 Hz). Top: linear axis; next to 1X at 2.12 mm/s RMS, the 0.012 mm/s of 147 Hz shows no visible bar. Bottom: drawn in dB (0 dB = 1 mm/s RMS), the same spectrum shows 1X at 6.5 dB, 147 Hz at −38.4 dB and 294 Hz at −46 dB standing out clearly above the noise floor. To see components that differ in size by hundreds of times on one screen you need dB.',
  '선형 축 (mm/s RMS)': 'Linear axis (mm/s RMS)',
};

export default EN;
