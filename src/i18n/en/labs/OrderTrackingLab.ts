import type { Dict } from '../../translate';

const EN: Dict = {
  '키페이저': 'Keyphasor',
  '키페이저 없음 (스펙트로그램 능선)': 'No Keyphasor (spectrogram ridge)',
  '3차': 'Cubic',
  '선형': 'Linear',
  '시간 기반 FFT (Hann)': 'Time-based FFT (Hann)',
  '차수 스펙트럼': 'Order spectrum',
  '최대 차수 {0}': 'Maximum order {0}',
  '접히는 곳 {0}': 'Folding point {0}',
  '실제 회전수': 'Actual speed',
  '키페이저 간격으로 본 회전수': 'Speed from Keyphasor intervals',
  '능선 적분으로 만든 펄스의 회전수': 'Speed of pulses built from the integrated ridge',
  '프레임': 'Frame',
  '프레임 끝': 'Frame end',
  '차수추적: 시간 FFT vs 차수 스펙트럼': 'Order tracking: time FFT vs order spectrum',
  '각도 기준': 'Angle reference',
  '가속률': 'Acceleration',
  '프레임 시작에서 약 1500 rpm': 'About 1500 rpm at the start of the frame',
  '프레임 바퀴 수 N_rev': 'Revolutions per frame N_rev',
  '회전당 샘플 수 N_spr': 'Samples per revolution N_spr',
  '신호 보간': 'Signal interpolation',
  '차수 영역 에일리어싱 방지': 'Order-domain anti-aliasing',
  '회전당 256점으로 찍고 걸러서 솎는다': 'Sample at 256 points per revolution, filter, then decimate',
  '동안': 'while going from',
  '차수 스펙트럼은 정수 바퀴 프레임이라 Uniform 윈도우를 씁니다. 시간 기반 FFT는 같은 시간 구간을 Hann 윈도우로 봅니다.':
    'The order spectrum uses a frame of a whole number of revolutions, so it takes the Uniform window. The time-based FFT looks at the same time span with a Hann window.',
  '읽음값 (참값: 1X 25 µm, 2X 8 µm, 23X 3 µm)': 'Readings (true values: 1X 25 µm, 2X 8 µm, 23X 3 µm)',
  '1X — 차수 스펙트럼': '1X — order spectrum',
  '1X — 시간 FFT의 가장 높은 봉우리': '1X — highest peak of the time FFT',
  '2X — 차수 스펙트럼': '2X — order spectrum',
  '23X — 차수 스펙트럼': '23X — order spectrum',
  '9X — 차수 스펙트럼 (가짜 줄 확인)': '9X — order spectrum (check for a fake line)',
  '능선 회전수의 최대 오차 (프레임 안)': 'Maximum ridge speed error (within the frame)',
  '가속률을 0으로 두면 시간 FFT와 차수 스펙트럼의 1X는 어떻게 되나요? 300 rpm/s로 올리면?':
    'With the acceleration at 0, what happens to 1X in the time FFT and in the order spectrum? What if you raise it to 300 rpm/s?',
  '0이면 둘 다 25 µm 근처로 같습니다. 300 rpm/s에서는 시간 FFT 봉우리가 약 10.6 µm로 낮아지고 넓게 번지지만, 차수 스펙트럼의 1X는 25 µm 그대로입니다. 반대로 고정 95 Hz 성분은 차수 스펙트럼에서 번집니다.':
    'At 0 both read about 25 µm. At 300 rpm/s the time-FFT peak drops to about 10.6 µm and spreads out, while 1X in the order spectrum stays at 25 µm. Conversely, the fixed 95 Hz component smears in the order spectrum.',
  '회전당 샘플 수를 32로 두고 에일리어싱 방지를 끄면 어디에 가짜 줄이 서나요? 켜면?':
    'With 32 samples per revolution and anti-aliasing off, where does the fake line appear? And with it on?',
  '23X가 차수 16(= 32/2)을 넘어 32 − 23 = 9X에 약 3 µm의 가짜 줄로 섭니다. 켜면 차수 영역에서 걸러져 사라지고, 23X도 최대 차수 12.5 밖이라 보이지 않습니다. 23X를 보려면 회전당 64점 이상이 필요합니다.':
    '23X lies beyond order 16 (= 32/2) and appears as a fake line of about 3 µm at 32 − 23 = 9X. With anti-aliasing on, it is filtered out in the order domain and disappears; 23X is also outside the maximum order of 12.5, so it is not visible. To see 23X you need at least 64 samples per revolution.',
  '신호 보간을 선형으로 바꾸면 23X는 얼마나 작게 읽히나요? 1X는?':
    'If you switch the signal interpolation to linear, how much smaller does 23X read? And 1X?',
  '23X는 약 8 % 작게(약 2.76 µm), 3차 보간은 약 1.6 % 작게 읽힙니다. 1X는 두 방법 모두 거의 그대로입니다. 높은 차수일수록 보간 오차가 커집니다.':
    '23X reads about 8 % low (about 2.76 µm), and cubic interpolation about 1.6 % low. 1X is nearly unchanged with both methods. The higher the order, the larger the interpolation error.',
  '각도 기준을 "키페이저 없음"으로 바꾸면 1X와 23X는? 위상은 읽을 수 있나요?':
    'If you switch the angle reference to "No Keyphasor", what happens to 1X and 23X? Can you read the phase?',
  '1X는 거의 그대로(약 24.9 µm)지만 23X는 각도 오차가 23배로 커져 이웃 칸으로 흩어지고, 23X 칸의 읽음값은 약 0.5 µm로 낮아집니다. 각도의 시작점을 모르므로 위상은 읽을 수 없습니다 — 밸런싱처럼 위상이 필요한 일에는 키페이저가 있어야 합니다.':
    '1X is almost unchanged (about 24.9 µm), but for 23X the angle error grows 23-fold and the energy scatters into neighboring bins, so the 23X reading drops to about 0.5 µm. Since the starting angle is unknown, the phase cannot be read — for work that needs phase, such as balancing, you need a Keyphasor.',
  '신호는 설명용 예시입니다 (f_s {0} Hz, 1X 25 µm · 2X 8 µm · 23X 3 µm · 고정 95 Hz 4 µm · 잡음 0.2 µm, 진폭은 일정). 키페이저 시각은 각도가 정수 바퀴가 되는 시각으로 정확히 주었습니다.':
    'The signal is an illustrative example (f_s {0} Hz, 1X 25 µm · 2X 8 µm · 23X 3 µm · fixed 95 Hz 4 µm · noise 0.2 µm, constant amplitudes). The Keyphasor times are given exactly, as the instants when the angle reaches a whole number of revolutions.',
  '같은 프레임: 시간 기반 FFT (가로축 Hz)': 'Same frame: time-based FFT (horizontal axis in Hz)',
  '주파수 [Hz]': 'Frequency [Hz]',
  '시간 기반 FFT': 'Time-based FFT',
  '차수 스펙트럼 (가로축 = 차수)': 'Order spectrum (horizontal axis = order)',
  '차수': 'Order',
  '각도 기준: 펄스 간격으로 본 회전수': 'Angle reference: speed seen from the pulse intervals',
  '시각 [s]': 'Time [s]',
  '회전수와 프레임': 'Speed and frame',
};

export default EN;
