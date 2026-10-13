import type { Dict } from '../../translate';

const EN: Dict = {
  'cos 템플릿 (합 = 실수부 Re)': 'cos template (sum = real part Re)',
  'sin 템플릿 (합 = −허수부 Im)': 'sin template (sum = −imaginary part Im)',
  '진폭 2|X(k)|/N': 'Amplitude 2|X(k)|/N',
  '위상 atan2(Im, Re) [°]': 'Phase atan2(Im, Re) [°]',
  'DFT = 템플릿 정현파와의 상관': 'DFT = correlation with a template sinusoid',
  '신호 주파수 f₁': 'Signal frequency f₁',
  '신호 위상 φ₁': 'Signal phase φ₁',
  '두 번째 톤 ({0} Hz, 진폭 {1})': 'Second tone ({0} Hz, amplitude {1})',
  '비교할 템플릿 주파수 k': 'Template frequency k to compare',
  '템플릿': 'Template',
  'k를 신호 주파수와 같은 4로 두면 진폭 2|X|/N은 얼마일까요? 곱 막대는 어떤 모양일까요?':
    'If you set k to 4, the same as the signal frequency, what is the amplitude 2|X|/N? What do the product bars look like?',
  '1(신호 진폭)이 됩니다. 곱 x·cos가 cos² 꼴이라 거의 항상 양수여서 누적합이 꾸준히 커집니다. "템플릿과 닮을수록 상관(합)이 크다"가 DFT의 정체입니다.':
    'It is 1 (the signal amplitude). The product x·cos has the form cos², so it is almost always positive and the running sum keeps growing. "The more it resembles the template, the larger the correlation (sum)" is what the DFT is.',
  'k를 다른 정수(예: 5)로 바꾸면? 누적합의 끝값을 보세요.':
    'What if you change k to another integer (for example 5)? Look at the end value of the running sum.',
  '0이 됩니다. 프레임 안에 정수 주기가 들어가는 서로 다른 정현파는 곱의 +와 −가 정확히 상쇄됩니다(직교성). FFT의 bin들은 바로 이런 템플릿들입니다.':
    'It becomes 0. For different sinusoids that fit a whole number of periods in the frame, the + and − of the product cancel exactly (orthogonality). The FFT bins are exactly such templates.',
  '신호 주파수를 4.5 Hz(두 bin 사이)로 바꾸면 정수 bin(아래 그래프의 점)은 어떻게 될까요?':
    'If you change the signal frequency to 4.5 Hz (between two bins), what happens to the integer bins (the dots in the graph below)?',
  '모든 정수 bin이 0이 아니게 됩니다. 신호와 정확히 맞는 템플릿이 없어서 에너지가 여러 bin에 퍼지는 것 — 이것이 누설(Spectral Leakage)이고 P2-5 윈도우에서 다룹니다.':
    'Every integer bin becomes nonzero. There is no template that matches the signal exactly, so the energy spreads over several bins — this is spectral leakage, covered in the P2-5 windows.',
  '위상 φ₁을 90°로 바꾸면 cos 템플릿과 sin 템플릿의 누적합은 어떻게 변할까요?':
    'If you change the phase φ₁ to 90°, how do the running sums for the cos template and the sin template change?',
  'cos 쪽 합은 0, sin 쪽 합이 커집니다. 진폭(√(Re²+Im²))은 그대로이고 위상 = atan2(Im, Re)만 바뀝니다. DFT 한 번에 진폭과 위상을 함께 얻는 이유입니다.':
    'The cos-side sum becomes 0 and the sin-side sum grows. The amplitude (√(Re²+Im²)) stays the same and only the phase = atan2(Im, Re) changes. This is why one DFT gives amplitude and phase together.',
  '신호 x[n]': 'Signal x[n]',
  '템플릿 {0}(2πkn/N)': 'Template {0}(2πkn/N)',
  '샘플 n': 'Sample n',
  '진폭': 'Amplitude',
  '곱 x[n]·{0}': 'Product x[n]·{0}',
  '누적합': 'Running sum',
  '곱 / 누적합': 'Product / running sum',
  'k를 연속으로 바꾼 2|X(k)|/N': '2|X(k)|/N with k varied continuously',
  '정수 bin (FFT가 계산하는 점)': 'Integer bins (the points the FFT calculates)',
  '현재 k': 'Current k',
};

export default EN;
