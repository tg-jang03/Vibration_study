import type { Dict } from '../../translate';

const EN: Dict = {
  '맞물림': 'Gear mesh',
  'Butterworth (통과 대역이 가장 평평)': 'Butterworth (flattest passband)',
  'Chebyshev (리플 1 dB, 가파름)': 'Chebyshev (ripple 1 dB, steep)',
  'Bessel (군지연이 고름)': 'Bessel (even group delay)',
  'FIR ({0}탭, 선형 위상)': 'FIR ({0} taps, linear phase)',
  '진동 파형 (1X ~ 3X + 맞물림 500 Hz)': 'Vibration waveform (1X to 3X + 500 Hz gear mesh)',
  '사각파 10 Hz (모서리)': 'Square wave 10 Hz (edge)',
  '크기 (두 번 거름 = 제곱)': 'Magnitude (filtered twice = squared)',
  '크기': 'Magnitude',
  '맞물림 500 Hz': 'Gear mesh 500 Hz',
  '한 번 거름': 'Filtered once',
  '두 번 거름 = 0': 'Filtered twice = 0',
  '입력': 'Input',
  '목표 (1X ~ 3X)': 'Target (1X to 3X)',
  '출력 (두 번 거름)': 'Output (filtered twice)',
  '출력': 'Output',
  '필터 설계: 크기 · 군지연 · 시간파형': 'Filter design: magnitude · group delay · time waveform',
  '필터 종류': 'Filter type',
  '차수 n': 'Order n',
  'FIR은 탭 101개로 고정': 'FIR is fixed at 101 taps',
  '차수 하나에 약 6 dB/옥타브': 'About 6 dB/octave per order',
  '차단 주파수 f_c': 'Cutoff frequency f_c',
  '시험 신호': 'Test signal',
  '두 번 거르기 (앞으로 + 거꾸로)': 'Forward-backward filtering (forward + backward)',
  '위상 0, 크기는 제곱 — 저장된 데이터에만': 'Phase 0, magnitude squared — stored data only',
  '디지털 필터: ': 'digital filter: ',
  '두 번: dB가 두 배': 'twice: dB doubles',
  '약': 'approx.',
  '1X 25 Hz 크기': '1X 25 Hz magnitude',
  '3X 75 Hz 크기': '3X 75 Hz magnitude',
  '맞물림 500 Hz 크기': 'Gear mesh 500 Hz magnitude',
  '1X 위상 늦음': '1X phase lag',
  '1X 군지연': '1X group delay',
  '3X 군지연': '3X group delay',
  '모서리 넘침': 'Edge overshoot',
  '진동 파형, 4차, f_c = 150 Hz에서 종류를 Butterworth → Chebyshev → Bessel로 바꿔 보세요. 맞물림 500 Hz를 가장 많이 깎는 것과 1X를 가장 덜 늦추는 것은?':
    'With the vibration waveform, 4th order, f_c = 150 Hz, change the type Butterworth → Chebyshev → Bessel. Which cuts the 500 Hz gear mesh the most, and which delays 1X the least?',
  '500 Hz는 Chebyshev가 −53.9 dB로 가장 많이 깎고(Butterworth −42.5, Bessel −29.1 dB), 1X 위상은 Bessel이 20.2°로 가장 덜 늦습니다(Butterworth 25.0°, Chebyshev 26.8°). 가파르게 깎는 쪽이 위상은 더 흔듭니다.':
    'Chebyshev cuts 500 Hz the most at −53.9 dB (Butterworth −42.5, Bessel −29.1 dB), and Bessel delays the 1X phase the least at 20.2° (Butterworth 25.0°, Chebyshev 26.8°). The steeper the cut, the more the phase is disturbed.',
  '시험 신호를 사각파로 바꾸고 Butterworth와 Bessel의 모서리 넘침을 비교해 보세요. 차수를 2 → 8로 올리면 Butterworth의 넘침은?':
    'Change the test signal to a square wave and compare the edge overshoot of Butterworth and Bessel. What happens to the Butterworth overshoot when you raise the order from 2 to 8?',
  '4차에서 Butterworth 10.9 %, Bessel 0.89 %입니다. Butterworth는 차수를 올릴수록 넘침이 커집니다(2차 약 4 %, 8차 약 16 %). 더 가파르게 깎는 만큼 f_c 근처의 군지연이 더 솟기 때문입니다.':
    'At 4th order, Butterworth overshoots 10.9 % and Bessel 0.89 %. The Butterworth overshoot grows with the order (about 4 % at 2nd order, about 16 % at 8th). The steeper the cut, the higher the group delay rises near f_c.',
  '진동 파형에서 "두 번 거르기"를 켜 보세요. 출력이 목표와 겹치나요? 500 Hz 크기와 1X 군지연은 어떻게 바뀌나요?':
    'On the vibration waveform, turn on "forward-backward filtering". Does the output overlap the target? How do the 500 Hz magnitude and the 1X group delay change?',
  '겹칩니다. 거꾸로 거르며 늦은 만큼 당겨서 군지연·위상이 0이 되고, 크기는 제곱이라 500 Hz가 −42.5 → −85 dB가 됩니다. 대신 앞으로 올 샘플이 필요하므로 저장된 데이터에만 씁니다.':
    'It does. Filtering backward pulls back by as much as it was delayed, so the group delay and phase become 0, and the magnitude is squared so 500 Hz goes from −42.5 to −85 dB. In return it needs the samples that come later, so it is used only on stored data.',
  '주파수 [Hz]': 'Frequency [Hz]',
  '크기 [dB]': 'Magnitude [dB]',
  '필터의 크기 응답': 'Magnitude response of the filter',
  '군지연 [ms]': 'Group delay [ms]',
  '필터의 군지연': 'Group delay of the filter',
  '시간 [ms]': 'Time [ms]',
  '모서리부터 시간 [ms]': 'Time from the edge [ms]',
  '속도 [mm/s]': 'Velocity [mm/s]',
  '진폭': 'Amplitude',
  '입력과 출력 시간파형': 'Input and output time waveforms',
  '차단 주파수의 약속: Butterworth·Bessel·FIR은 크기 −3 dB, Chebyshev는 리플 1 dB의 끝(−1 dB).':
    'Cutoff convention: for Butterworth, Bessel and FIR it is the −3 dB point, for Chebyshev the end of the 1 dB ripple (−1 dB).',
  '{0} Hz 표시는 그 점이다.': 'The {0} Hz shown is that point.',
};

export default EN;
