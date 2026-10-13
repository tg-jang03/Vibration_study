import type { Dict } from '../../translate';

/** LAB-RES-02 SmearingLab 영어 (D-054). 키 = 소스의 한국어 원문 — 뼈대는 node scripts/i18n/scan-lab.mjs SmearingLab */
const EN: Dict = {
  '감속 중 측정 (60 rpm/s = 1초에 1 Hz씩 느려짐, LOR 1600)': 'Measuring while decelerating (60 rpm/s = slowing 1 Hz per second, LOR 1600)',
  '빠른 감속 (120 rpm/s)': 'Fast deceleration (120 rpm/s)',
  '느린 감속 (20 rpm/s)': 'Slow deceleration (20 rpm/s)',
  '정속 운전 (0 rpm/s, 비교 기준)': 'Steady speed (0 rpm/s, reference)',
  '직접 조작': 'Manual',
  '400 line (T 짧음 → 번짐 작음)': '400 lines (short T → little smearing)',
  '3200 line (T 김 → 번짐 큼)': '3200 lines (long T → heavy smearing)',
  'Hann (분석기 기본값)': 'Hann (analyzer default)',
  '윈도우 없음': 'No window',
  '감속 중 신호 ({0} rpm/s)': 'Decelerating signal ({0} rpm/s)',
  '정속 운전 기준 (a = 0 rpm/s)': 'Steady-speed reference (a = 0 rpm/s)',
  '시작 f0 ({0} Hz)': 'Start f0 ({0} Hz)',
  '종료 f_end ({0} Hz)': 'End f_end ({0} Hz)',
  '스미어링(Smearing): 측정 중에 회전수가 변하면': 'Smearing: when the speed changes during a measurement',
  '실험 프리셋': 'Experiment preset',
  '측정 시작 회전수': 'Speed at start of measurement',
  '감속률 a': 'Deceleration rate a',
  '스펙트럼 라인 수 LOR': 'Number of spectral lines (LOR)',
  '분석 최대 주파수 F_max': 'Maximum analysis frequency F_max',
  '윈도우 함수': 'Window function',
  '정속 운전(a = 0) 기준 피크 겹쳐보기': 'Steady-speed (a = 0) overlay',
  '퍼진 bin 수': 'bins smeared',
  '피크 진폭': 'peak amplitude',
  '감소': 'lower',
  '정속 운전': 'steady speed',
  '초기 회전주파수 f0': 'Initial rotation frequency f0',
  '측정 시간 T': 'Measurement time T',
  '주파수 분해능 Δf': 'Frequency resolution Δf',
  '프레임 동안 1X 주파수 이동폭': '1X frequency shift during the frame',
  '스미어링 번짐 bin 수': 'Number of bins smeared',
  '측정된 피크 진폭': 'Measured peak amplitude',
  '정속 대비 진폭 감소율': 'Amplitude drop vs. steady speed',
  'F_max = 1000 Hz, LOR = 3200 line (T = 3.2 s)에서 감속률 a = 60 rpm/s로 코스트다운하면 1X 주파수는 프레임 동안 몇 Hz 변하고 몇 bin에 걸쳐 퍼지나요?':
    'At F_max = 1000 Hz and LOR = 3200 lines (T = 3.2 s), if the machine coasts down at a = 60 rpm/s, how many Hz does 1X shift during the frame and across how many bins does it spread?',
  '1X가 (60/60) × 3.2 = 3.2 Hz 움직이고, Δf = 0.3125 Hz이므로 약 10 bin에 걸쳐 넓게 번집니다. 날카로운 막대가 넓은 둔덕이 되고, 에너지가 여러 bin에 나뉘어 가장 높은 막대의 진폭도 크게 낮아집니다(읽음값의 진폭 감소율 확인).':
    '1X moves (60/60) × 3.2 = 3.2 Hz, and with Δf = 0.3125 Hz it smears widely across about 10 bins. The sharp bar becomes a wide hump, the energy is divided among several bins, and even the tallest bar drops a lot (check the amplitude drop in the readouts).',
  'LOR을 400 line (T = 0.4 s)으로 대폭 낮추면 스미어링 bin 수는 어떻게 변하나요? 왜 그럴까요?':
    'If you lower LOR sharply to 400 lines (T = 0.4 s), how does the number of smeared bins change? Why?',
  '번진 bin 수는 T²에 비례합니다. T가 3.2 s → 0.4 s로 8배 줄면 번짐은 8² = 64배 줄어 약 0.16 bin이 됩니다. 회전수가 변하는 동안에는 라인 수를 낮춰 T를 짧게 하거나, 회전 각도에 맞춰 샘플링하는 차수 추적(Order Tracking, P5-4)을 씁니다.':
    'The number of bins smeared is proportional to T². If T falls 8 times, from 3.2 s to 0.4 s, the smearing falls 8² = 64 times to about 0.16 bin. While the speed is changing, lower the number of lines to shorten T, or use order tracking (P5-4), which samples in step with the rotation angle.',
  '주파수 [Hz]': 'Frequency [Hz]',
  '진폭 [Pk]': 'Amplitude [Pk]',
  '회전수 변동에 따른 1X 피크 스미어링': 'Smearing of the 1X peak due to speed variation',
};

export default EN;
