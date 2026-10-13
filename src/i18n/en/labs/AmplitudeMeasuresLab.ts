import type { Dict } from '../../translate';

/** LAB-BAS-02 AmplitudeMeasuresLab 영어 (D-054). 키 = 소스의 한국어 원문 */
const EN: Dict = {
  '정현파 하나 (5 Hz)': 'Single sine wave (5 Hz)',
  '정현파 두 개의 합 (5 Hz + 15 Hz)': 'Sum of two sine waves (5 Hz + 15 Hz)',
  '사각파': 'Square wave',
  '짧은 충격이 반복되는 신호': 'Repeated short impacts',
  '신호': 'Signal',
  'Peak (꼭대기)': 'Peak (top)',
  'RMS (실효값)': 'RMS',
  '진폭을 숫자 하나로: Peak · Pk-Pk · RMS · Crest factor': 'Amplitude as one number: Peak · Pk-Pk · RMS · Crest factor',
  '신호 모양': 'Signal shape',
  '네 신호 모두 꼭대기 높이를 1로 맞춰 두었습니다': 'All four signals are scaled to a Peak of 1',
  '크기 배율': 'Amplitude scale',
  '정현파라고 가정하면': 'Assuming a sine wave',
  'RMS (직접 계산)': 'RMS (computed directly)',
  'Peak/√2 (정현파 가정 환산)': 'Peak/√2 (sine-wave conversion)',
  '환산값의 오차': 'Error of the converted value',
  '정현파 하나에서 Pk-Pk는 Peak의 몇 배, RMS는 Peak의 몇 배일까요? 크기 배율을 바꿔도 비율이 그대로인지 보세요.':
    'For a single sine wave, how many times the Peak are Pk-Pk and RMS? Check whether the ratios stay the same when you change the amplitude scale.',
  'Pk-Pk = 2 × Peak, RMS = Peak/√2 ≈ 0.707 × Peak, Crest factor = √2 ≈ 1.41. 크기를 바꿔도 비율은 그대로입니다.':
    'Pk-Pk = 2 × Peak, RMS = Peak/√2 ≈ 0.707 × Peak, crest factor = √2 ≈ 1.41. The ratios stay the same when the size changes.',
  '네 신호 모두 Peak가 1입니다. RMS가 가장 큰 신호와 가장 작은 신호는 무엇일까요?':
    'All four signals have a Peak of 1. Which signal has the largest RMS and which the smallest?',
  '가장 큰 것은 사각파(RMS = 1), 가장 작은 것은 충격 신호입니다. 사각파는 항상 꼭대기 높이에 머물러 있고, 충격 신호는 대부분의 시간 동안 거의 0이라서 평균 에너지가 작습니다.':
    'The largest is the square wave (RMS = 1) and the smallest is the impact signal. The square wave always stays at the top height, while the impact signal is almost 0 most of the time, so its average energy is small.',
  '"짧은 충격이 반복되는 신호"에서 Peak/√2로 RMS를 환산하면 실제 RMS와 얼마나 다를까요?':
    'For "repeated short impacts", how far is the RMS converted as Peak/√2 from the actual RMS?',
  '약 5배 크게 나옵니다 (오차 약 +420 %). Peak/√2 환산은 정현파 하나일 때만 맞습니다. 정현파 두 개의 합에서도 +37 %, 사각파에서는 반대로 −29 % 어긋납니다. 측정기가 RMS를 직접 계산하는지, Peak에서 환산하는지 꼭 확인해야 하는 이유입니다.':
    'It comes out about 5 times too large (error about +420 %). The Peak/√2 conversion is right only for a single sine wave. It is off by +37 % even for the sum of two sine waves, and by −29 % the other way for the square wave. This is why you must check whether the instrument computes RMS directly or converts it from Peak.',
  '네 신호를 Crest factor가 작은 순서로 늘어놓으면?': 'Put the four signals in order of increasing crest factor.',
  '사각파(1.0) < 정현파 하나(1.41) < 정현파 두 개의 합(약 1.9) < 충격 신호(약 7.4). CF가 클수록 평소 크기에 비해 꼭대기가 뾰족하게 튀는 신호입니다.':
    'Square wave (1.0) < single sine wave (1.41) < sum of two sine waves (about 1.9) < impact signal (about 7.4). The larger the CF, the more sharply the peaks stick out compared with the usual size.',
  '시간 t [s]': 'Time t [s]',
  '진폭': 'Amplitude',
};

export default EN;
