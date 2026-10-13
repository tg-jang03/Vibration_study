import type { Dict } from '../../translate';

/** LAB-SK-01 KurtogramLab 영어 (D-054). 키 = 소스의 한국어 원문 — 뼈대는 node scripts/i18n/scan-lab.mjs KurtogramLab */
const EN: Dict = {
  '외륜 흠 (BPFO)': 'Outer-race defect (BPFO)',
  '내륜 흠 (BPFI)': 'Inner-race defect (BPFI)',
  '결함 없음': 'No fault',
  '{0} (가장 좁은 폭 {1} Hz)': '{0} (narrowest width {1} Hz)',
  '가장 큰 SK': 'Largest SK',
  'Spectral Kurtosis · Kurtogram: 충격 대역 자동으로 찾기': 'Spectral kurtosis · kurtogram: finding the impact band automatically',
  '베어링 상태': 'Bearing state',
  '충격 크기': 'Impact size',
  '기어 맞물림 (1200 Hz)': 'Gear mesh (1200 Hz)',
  '5 ~ 7 kHz 잡음': '5 – 7 kHz noise',
  '가장 깊은 레벨': 'Deepest level',
  '가장 큰 칸: ': 'Largest cell: ',
  'c는 그 대역만 남긴 신호의 복소 포락선(해석 신호)입니다. 정규분포 잡음만 있으면 0, 크기가 일정한 정현파는 −1, 충격이 드문드문 섞이면 양수입니다.':
    'c is the complex envelope (analytic signal) of the signal with only that band kept. It is 0 for Gaussian noise alone, −1 for a sine of constant size, and positive when sparse impacts are mixed in.',
  읽음값: 'Readouts',
  '추천 대역 가운데': 'Suggested band center',
  '추천 대역 폭': 'Suggested band width',
  '추천 대역의 SK': 'SK of the suggested band',
  '원신호 전체의 첨도 K (정규 잡음 = 3)': 'Kurtosis K of the whole raw signal (Gaussian noise = 3)',
  '추천 대역 엔벨로프: {0} 줄 ÷ 바닥': 'Suggested-band envelope: {0} line ÷ floor',
  배: '×',
  '처음 상태에서 Kurtogram이 고른 대역은? 원신호 전체의 첨도는 3보다 큰가요?':
    'In the initial state, which band does the kurtogram choose? Is the kurtosis of the whole raw signal greater than 3?',
  '레벨 3의 2560 ~ 3584 Hz(폭 1024 Hz, SK 약 1.0)로, 결함이 울리는 3.3 kHz를 담습니다. 원신호 전체의 첨도는 약 2.3으로 3보다 작습니다 — 크기가 거의 일정한 기어 맞물림(첨도 약 1.9)이 신호를 지배해서, 전체 첨도로는 충격이 보이지 않습니다.':
    '2560 to 3584 Hz at level 3 (width 1024 Hz, SK about 1.0), which contains the 3.3 kHz the fault rings. The kurtosis of the whole raw signal is about 2.3, below 3 — the gear mesh, whose size is almost constant (kurtosis about 1.9), dominates the signal, so the impacts do not show in the overall kurtosis.',
  '충격 크기를 0.1 g로 줄이면 추천 대역은? 베어링 상태를 "결함 없음"으로 하면?':
    'What is the suggested band if you reduce the impact size to 0.1 g? And if you set the bearing state to "no fault"?',
  '0.1 g에서도 같은 대역(레벨 3)을 고르지만 SK가 약 0.28로 낮아집니다. 결함이 없으면 레벨 6의 좁은 칸 하나를 SK 약 0.28로 고릅니다 — 가장 큰 SK만 보면 둘을 가를 수 없습니다. 좁은 칸일수록 잡음만으로도 SK가 크게 흔들리기 때문입니다. 같은 대역의 SK를 비교하면 다릅니다: 2560 ~ 3584 Hz에서 결함 없음은 약 −0.07, 0.1 g는 0.28입니다.':
    'At 0.1 g the same band (level 3) is chosen, but the SK drops to about 0.28. With no fault, a single narrow cell at level 6 is chosen with an SK of about 0.28 — looking only at the largest SK, you cannot tell the two apart, because the narrower the cell, the more its SK swings from noise alone. Comparing the SK of the same band does tell them apart: at 2560 to 3584 Hz, no fault gives about −0.07 and 0.1 g gives 0.28.',
  '기어 맞물림을 0으로 하면 추천 대역과 SK는? 3 g로 키우면?':
    'What are the suggested band and SK if you set the gear mesh to 0? And if you raise it to 3 g?',
  '0이면 2048 ~ 4096 Hz(SK 약 2.5)를 고릅니다. 2400 Hz의 기어 2배가 사라져 넓은 대역에도 충격만 남기 때문입니다. 3 g로 키워도 추천 대역은 2560 ~ 3584 Hz 그대로입니다 — 크기가 큰 성분이 있어도 SK는 충격성을 봅니다.':
    'At 0 it chooses 2048 to 4096 Hz (SK about 2.5): the gear 2× at 2400 Hz disappears, so only the impacts remain even in a wide band. Raised to 3 g, the suggested band stays at 2560 to 3584 Hz — even with a large component present, SK looks at impulsiveness.',
  '신호는 LAB-ENV-01과 같은 설명용 예시입니다 (f_s {0} Hz, 2초). Kurtogram은 레벨 k마다 폭 {1}/2^k Hz의 칸을 반 칸씩 옮겨 가며 SK를 잽니다 (Antoni의 Fast Kurtogram은 1/3 단계까지 쓴다). SK(f)는 64점(3.9 ms) 프레임의 STFT로 구했습니다.':
    'The signal is the same illustrative example as LAB-ENV-01 (f_s {0} Hz, 2 s). At each level k, the kurtogram moves a cell of width {1}/2^k Hz in half-cell steps and measures the SK (Antoni\'s Fast Kurtogram also uses 1/3 steps). SK(f) was computed from an STFT with 64-point (3.9 ms) frames.',
  'Kurtogram (위로 갈수록 넓은 대역, 진할수록 큰 SK)': 'Kurtogram (wider bands toward the top, darker = larger SK)',
  '대역 가운데 주파수 [Hz]': 'Band center frequency [Hz]',
  '레벨 k (맨 위 1 ~ 맨 아래 {0}, 폭 {1}/2^k Hz)': 'Level k (top 1 to bottom {0}, width {1}/2^k Hz)',
  '정규 잡음 = 0': 'Gaussian noise = 0',
  '주파수 [Hz]': 'Frequency [Hz]',
  '추천 대역 {0} ~ {1} Hz의 엔벨로프 스펙트럼': 'Envelope spectrum of the suggested band {0} – {1} Hz',
  '엔벨로프 스펙트럼': 'Envelope spectrum',
  '{0} 하모닉': '{0} harmonics',
  '추천 대역의 엔벨로프 스펙트럼': 'Envelope spectrum of the suggested band',
};

export default EN;
