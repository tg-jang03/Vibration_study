import type { Dict } from '../../translate';

const EN: Dict = {
  '크기가 흔들림 (AM)': 'Size fluctuates (AM)',
  '주파수가 흔들림 (FM)': 'Frequency fluctuates (FM)',
  '크기와 주파수가 함께 (AM + FM)': 'Size and frequency together (AM + FM)',
  '가까운 두 주파수 (맥놀이)': 'Two close frequencies (beating)',
  '직접 설정': 'Set manually',
  '기어 맞물림 300 Hz를 축 A(20 Hz)가 흔듦': '300 Hz gear mesh shaken by shaft A (20 Hz)',
  '기어 맞물림 300 Hz를 축 B(12.5 Hz)가 흔듦': '300 Hz gear mesh shaken by shaft B (12.5 Hz)',
  '회전수가 1초에 2번 출렁이는 60 Hz 성분 (FM)': '60 Hz component with speed wobbling twice a second (FM)',
  '이웃한 두 기계 1800 rpm·1770 rpm (맥놀이)': 'Two neighboring machines, 1800 rpm and 1770 rpm (beating)',
  '반송파': 'Carrier',
  '느리게': 'Slow',
  '보통': 'Normal',
  '빠르게': 'Fast',
  '이론값': 'Theory',
  '파형': 'Waveform',
  '포락선': 'Envelope',
  '스펙트럼 (측정 {0} s, Hann)': 'Spectrum (measured {0} s, Hann)',
  '{0} Hz 막대': '{0} Hz bar',
  '맥놀이 주기 1/∣f₁ − f₂∣': 'Beat period 1/∣f₁ − f₂∣',
  '포락선 최대 (두 크기의 합)': 'Envelope maximum (sum of the two sizes)',
  '포락선 최소 (두 크기의 차)': 'Envelope minimum (difference of the two sizes)',
  '두 막대 사이 bin 수 (Hann은 3.5 이상이면 갈라짐)': 'Bins between the two bars (Hann separates them at 3.5 or more)',
  '반송파 {0} Hz': 'Carrier {0} Hz',
  '아래 측대역 {0} Hz': 'Lower sideband {0} Hz',
  '위 측대역 {0} Hz': 'Upper sideband {0} Hz',
  '측대역 간격 (= 변조 주파수)': 'Sideband spacing (= modulating frequency)',
  '위 측대역 (반송파 대비)': 'Upper sideband (relative to carrier)',
  '측대역 간격 안의 bin 수': 'Bins within the sideband spacing',
  '맥놀이 주기': 'beat period',
  '측대역': 'sideband',
  '측대역은 반송파 f_c에서 f_m의 정수배만큼 떨어진 자리 f_c ± n·f_m에 섭니다. 주황 점은 이론값입니다 (반송파 = 1 mm/s Peak).':
    'Sidebands stand at f_c ± n·f_m, an integer multiple of f_m away from the carrier f_c. The orange dots are theory values (carrier = 1 mm/s Peak).',
  '변조 · 측대역 · 맥놀이': 'Modulation · Sidebands · Beating',
  '예시': 'Example',
  '무엇이 흔들리나': 'What fluctuates',
  '반송파 f_c': 'Carrier f_c',
  '변조 주파수 f_m': 'Modulating frequency f_m',
  'AM 변조 지수 m': 'AM modulation index m',
  '크기가 1 − m ~ 1 + m 사이를 오갑니다': 'The size swings between 1 − m and 1 + m',
  'FM 변조 지수 β': 'FM modulation index β',
  '주파수가 f_c ± {0} Hz 사이를 오갑니다 (β × f_m)': 'The frequency swings within f_c ± {0} Hz (β × f_m)',
  '크기와 주파수의 위상차': 'Phase difference between size and frequency',
  '0°: 크기가 클 때 주파수도 높음': '0°: frequency is also high when size is large',
  '차이 f₁ − f₂': 'Difference f₁ − f₂',
  'f₂의 크기 (f₁ = 1)': 'Size of f₂ (f₁ = 1)',
  '측정 시간 T (Δf = 1/T)': 'Measurement time T (Δf = 1/T)',
  'dB로 보기 (0 dB = 1 mm/s)': 'View in dB (0 dB = 1 mm/s)',
  '읽음값 (스펙트럼에서 잰 Peak, 반송파 = 1)': 'Readout (Peak measured in the spectrum, carrier = 1)',
  'AM에서 m = 0.5일 때 측대역은 반송파보다 몇 dB 낮을까요? m = 0.2라면?': 'In AM with m = 0.5, how many dB below the carrier is the sideband? What if m = 0.2?',
  '측대역 = m/2 = 0.25 → 20 log₁₀ 0.25 ≈ −12.0 dB. m = 0.2면 0.1 → −20 dB입니다. 측대역 높이로 크기가 얼마나 흔들리는지(m) 거꾸로 알 수 있습니다.':
    'Sideband = m/2 = 0.25 → 20 log₁₀ 0.25 ≈ −12.0 dB. For m = 0.2 it is 0.1 → −20 dB. So the sideband height tells you, in reverse, how much the size fluctuates (m).',
  'FM에서 β를 0.5 → 1 → 2.4 → 5로 올리면 측대역 수와 반송파는 어떻게 될까요?': 'In FM, what happens to the number of sidebands and to the carrier when you raise β from 0.5 → 1 → 2.4 → 5?',
  '의미 있는 측대역이 대략 β + 1쌍으로 늘어납니다. 반송파 높이는 J₀(β)를 따라 0.94 → 0.77 → 약 0 → 0.18로 바뀌고, β = 2.4 근처에서는 거의 사라집니다. 크기는 그대로인데도 스펙트럼이 넓게 퍼집니다.':
    'The number of significant sideband pairs rises to roughly β + 1. The carrier height follows J₀(β), changing 0.94 → 0.77 → about 0 → 0.18, and almost vanishes near β = 2.4. The size is unchanged, yet the spectrum spreads wide.',
  'AM + FM에서 위상차를 0° → 90° → 180°로 바꾸면 측대역 좌우 높이는?': 'In AM + FM, what happens to the left and right sideband heights when you change the phase difference 0° → 90° → 180°?',
  '0°에서는 위쪽(f_c + f_m)이 크고, 90°에서는 양쪽이 같고, 180°에서는 아래쪽이 큽니다. 측대역이 비대칭이면 AM과 FM이 함께 있다는 표시입니다.':
    'At 0° the upper one (f_c + f_m) is larger, at 90° both are equal, and at 180° the lower one is larger. Asymmetric sidebands indicate that AM and FM are present together.',
  '맥놀이에서 차이를 0.25 Hz로 두면 포락선 주기는? 측정 시간 T를 1 s로 줄이면 두 막대가 갈라지나요?': 'In beating, what is the envelope period when the difference is 0.25 Hz? If you reduce the measurement time T to 1 s, do the two bars separate?',
  '주기는 1/0.25 = 4 s입니다. T = 1 s(Δf 1 Hz)에서는 두 막대가 0.25 bin 떨어져 하나로 붙습니다. Hann으로 가르려면 약 3.5 bin, 즉 T ≥ 14 s가 필요합니다 (P2-4).':
    'The period is 1/0.25 = 4 s. At T = 1 s (Δf 1 Hz) the two bars are only 0.25 bin apart and merge into one. Separating them with Hann needs about 3.5 bins, i.e. T ≥ 14 s (P2-4).',
  'f_s = 1024 Hz, 반송파(맥놀이는 f₁)의 크기 1 mm/s Peak. 스펙트럼은 Hann 윈도우 한 프레임입니다. 주파수가 Δf = 1/T의 배수가 아니면 막대가 가리비 손실(P2-5)만큼 낮게 읽힙니다.':
    'f_s = 1024 Hz, carrier (f₁ for beating) size 1 mm/s Peak. The spectrum is one frame with a Hann window. If a frequency is not a multiple of Δf = 1/T, the bar reads lower by the scalloping loss (P2-5).',
  '도는 화살표로 보기': 'View as rotating arrows',
  '화살표 합의 길이 = 포락선': 'Length of the arrow sum = envelope',
  '사슬 끝의 높이 = 파형 (점선: 포락선)': 'Height of the chain tip = waveform (dashed: envelope)',
  '길이 1과 {0}인 두 화살표가 1초에 {1}바퀴와 {2}바퀴 돈다. 합의 길이가 {3}와 {4} 사이를 오간다.':
    'Two arrows of length 1 and {0} turn {1} and {2} times per second. The length of the sum swings between {3} and {4}.',
  '반송파 화살표와 측대역 화살표 {0}개를 이은 사슬. 측대역은 반송파 끝에서 1초에 {1}바퀴의 정수배로 돈다.':
    'A chain of the carrier arrow and {0} sideband arrows. The sidebands turn from the carrier tip at an integer multiple of {1} turns per second.',
  'f₁와 같이 돌며 보기': 'View rotating with f₁',
  '반송파와 같이 돌며 보기': 'View rotating with the carrier',
  'f₁ 화살표(파랑)가 멈춰 보이도록 f₁과 같은 빠르기로 돌며 봅니다. f₂ 화살표(주황)는 {0} Hz 느려서 f₁ 끝에서 1초에 {1}바퀴씩 거꾸로 돕니다. 같은 쪽을 가리키면 합이 가장 길고(1 + {2}), 반대쪽이면 가장 짧습니다(∣1 − {3}∣) — 이 길이가 포락선입니다.':
    'We view it rotating at the same speed as f₁ so that the f₁ arrow (blue) looks stationary. The f₂ arrow (orange) is {0} Hz slower, so from the tip of f₁ it turns backwards {1} turns per second. When they point the same way the sum is longest (1 + {2}), and when opposite it is shortest (∣1 − {3}∣) — this length is the envelope.',
  '반송파 화살표(파랑)가 멈춰 보이도록 반송파와 같은 빠르기로 돌며 봅니다. 위 측대역(주황, +n)은 반시계로, 아래 측대역(초록, −n)은 시계로 반송파 끝에서 1초에 n × {0}바퀴 돕니다.':
    'We view it rotating at the same speed as the carrier so that the carrier arrow (blue) looks stationary. From the carrier tip, the upper sidebands (orange, +n) turn counterclockwise and the lower sidebands (green, −n) clockwise, n × {0} turns per second.',
  '두 측대역의 합은 늘 반송파와 같은 방향(위·아래)이라 길이만 1 − m ~ 1 + m로 바뀝니다 — 이것이 포락선입니다.':
    'The sum of the two sidebands always points along the carrier (up or down), so only the length changes, between 1 − m and 1 + m — this is the envelope.',
  '측대역들의 합이 사슬 끝을 반지름 1인 원호를 따라 좌우로 밀어, 길이는 그대로 1이고 방향만 흔들립니다. 방향이 흔들린다 = 도는 빠르기(주파수)가 흔들린다는 뜻입니다.':
    'The sum of the sidebands pushes the chain tip left and right along an arc of radius 1, so the length stays at 1 and only the direction fluctuates. A fluctuating direction means the rotation speed (frequency) is fluctuating.',
  '이번에는 측대역 합이 반송파 방향과 비스듬해서 길이(크기)와 방향(주파수)이 함께 흔들립니다. 위상차를 바꾸면 위·아래 측대역의 길이가 달라집니다.':
    'This time the sideband sum is slanted relative to the carrier, so the length (size) and direction (frequency) fluctuate together. Changing the phase difference changes the lengths of the upper and lower sidebands.',
  '실제처럼 화살표가 각자의 주파수로 돕니다(양의 주파수는 반시계). 사슬 끝의 높이가 파형이고, 점선은 화살표 합의 길이(포락선)입니다.':
    'As in reality, each arrow turns at its own frequency (positive frequencies counterclockwise). The height of the chain tip is the waveform, and the dashed line is the length of the arrow sum (the envelope).',
  'f₁이 빨라 화면은 아주 느리게 재생합니다.': 'f₁ is fast, so the screen plays very slowly.',
  '반송파가 빨라 화면은 아주 느리게 재생합니다.': 'The carrier is fast, so the screen plays very slowly.',
  '파형과 포락선': 'Waveform and envelope',
  '시간 [s]': 'Time [s]',
  '스펙트럼': 'Spectrum',
  '주파수 [Hz]': 'Frequency [Hz]',
  '스펙트럼과 이론값': 'Spectrum and theory values',
};

export default EN;
