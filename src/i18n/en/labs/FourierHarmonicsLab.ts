import type { Dict } from '../../translate';

const EN: Dict = {
  '느리게 (실제의 1/40)': 'Slow (1/40 of real time)',
  '보통 (실제의 1/20)': 'Normal (1/20 of real time)',
  '빠르게 (실제의 1/10)': 'Fast (1/10 of real time)',
  '사각파': 'Square wave',
  '톱니파': 'Sawtooth wave',
  '펄스열': 'Pulse train',
  '직접 만들기 (1~5차)': 'Build your own (orders 1 to 5)',
  '홀수': 'odd',
  '짝수': 'even',
  '합 x(t)': 'Sum x(t)',
  '{0}차': 'n={0}',
  '진폭 Aₙ': 'Amplitude Aₙ',
  '위상 φₙ': 'Phase φₙ',
  ' (부호 −)': ' (sign −)',
  '{0}차({1} Hz) {2}{3}': 'n={0} ({1} Hz) {2}{3}',
  '하모닉 쌓기: 신호는 정현파의 합': 'Stacking harmonics: a signal is a sum of sinusoids',
  '파형': 'Waveform',
  '최고 차수 N': 'Highest order N',
  '차': '',
  '1차({0} Hz)부터 N차({1} Hz)까지 더한다': 'Add from order 1 ({0} Hz) up to order N ({1} Hz)',
  '듀티비 d (펄스 폭 / 주기)': 'Duty ratio d (pulse width / period)',
  '위상 섞기': 'Shuffle phases',
  '진폭은 그대로, 위상만 바꾼다': 'Amplitudes stay the same; only the phases change',
  '각 성분(점선) 표시': 'Show each component (dotted)',
  '0이 아닌 성분 앞 5개': 'First 5 nonzero components',
  '{0}차 진폭 A{1}': 'Order {0} amplitude A{1}',
  '{0}차 위상 φ{1}': 'Order {0} phase φ{1}',
  'RMS (시간영역에서 계산)': 'RMS (calculated in the time domain)',
  '지금 더한 성분 {0}개': 'Components added now: {0}',
  '없음': 'none',
  '진폭 0인 차수: {0}차': 'orders with amplitude 0: {0}',
  '사각파에서 "위상 섞기"를 켜면 진폭 스펙트럼, RMS, 파형, Crest factor 중 무엇이 바뀔까요?':
    'For the square wave, which of the amplitude spectrum, RMS, waveform and crest factor change when you turn on "Shuffle phases"?',
  '진폭 스펙트럼과 RMS는 그대로입니다(RMS는 진폭만으로 정해진다 — Parseval). 파형 모양과 Crest factor는 바뀝니다. 진폭 스펙트럼만 보면 이 차이를 놓치므로 시간파형도 함께 봐야 합니다 (P6-1).':
    'The amplitude spectrum and RMS stay the same (RMS is set by the amplitudes alone — Parseval). The waveform shape and crest factor change. The amplitude spectrum alone misses this difference, so look at the time waveform too (P6-1).',
  '사각파에는 왜 짝수 하모닉이 없을까요? 성분 표시를 켜고 반주기 뒤의 모양을 보세요.':
    'Why does the square wave have no even harmonics? Turn on the component display and look at the shape half a period later.',
  '사각파는 반주기 뒤에 부호만 뒤집히는 대칭 x(t + T/2) = −x(t)을 가집니다. 짝수 차 성분은 반주기 뒤에 부호가 그대로라 이 대칭을 만들 수 없어서 0이 됩니다.':
    'The square wave has the symmetry x(t + T/2) = −x(t): half a period later it only flips sign. An even-order component keeps its sign after half a period, so it cannot build this symmetry and is 0.',
  '하모닉을 15개까지 늘리면 모서리의 튀어나온 부분(오버슈트)이 사라질까요?':
    'If you raise the harmonics up to 15, does the bump at the corner (overshoot) disappear?',
  '사라지지 않고 약 9 %로 남고 폭만 좁아집니다(깁스 현상). 날카로운 변화를 만들려면 고차 성분이 아주 많이 필요하다는 뜻입니다.':
    'It does not disappear; it stays at about 9 % and only gets narrower (the Gibbs phenomenon). It means that making a sharp change takes a great many high-order components.',
  '펄스열에서 듀티비를 0.05로 줄이면(펄스를 좁게) 진폭 스펙트럼은 어떻게 될까요?':
    'For the pulse train, what happens to the amplitude spectrum if you reduce the duty ratio to 0.05 (a narrower pulse)?',
  '고차까지 진폭이 고르게 퍼집니다. 시간에서 짧은 것은 주파수에서 넓다 — 그래서 짧은 임팩트(해머 타격)는 넓은 대역을 한 번에 가진합니다 (P9-1 임팩트 시험).':
    'The amplitude spreads evenly out to high orders. Short in time means wide in frequency — which is why a short impact (a hammer strike) excites a wide band at once (P9-1, impact test).',
  '사슬 끝의 높이 = 합 x(t)': 'Height of the chain end = sum x(t)',
  '하모닉 {0}개를 화살표로 이은 사슬. n차 화살표는 1초에 {1}·n 바퀴 돌고, 사슬 끝의 높이가 오른쪽에 합성 파형을 그린다.':
    'A chain of {0} harmonics drawn as arrows. The order-n arrow turns {1}·n times per second, and the height of the chain end draws the combined waveform on the right.',
  'n차 하모닉은 길이 Aₙ, 1초에 n × {0}바퀴 도는 화살표입니다. 1차 끝에 2차를, 그 끝에 3차를… 차례로 이으면 사슬 끝의 높이가 모든 성분의 합 x(t)입니다.':
    'The nth harmonic is an arrow of length Aₙ that turns n × {0} times per second. Attach the 2nd to the end of the 1st, the 3rd to the end of that, and so on, and the height of the chain end is the sum x(t) of all the components.',
  '빠른 고차 화살표가 끝을 잘게 흔들어 모서리를 만듭니다. 위상을 바꾸면 각 화살표의 출발 각도만 바뀌어 사슬이 다른 모양으로 펴집니다.':
    "The fast high-order arrows shake the end in small jiggles and make the corners. Changing the phases only changes each arrow's starting angle, so the chain unfolds into a different shape.",
  '시간 t [s]': 'Time t [s]',
  '진폭': 'Amplitude',
  '하모닉 합성 파형': 'Combined harmonic waveform',
  '주파수 [Hz]': 'Frequency [Hz]',
  '위상 φₙ [°] (180° = 부호 반대)': 'Phase φₙ [°] (180° = flipped)',
};

export default EN;
