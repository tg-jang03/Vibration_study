import type { Dict } from '../../translate';

/** LAB-ENV-01 EnvelopeLab 영어 (D-054). 키 = 소스의 한국어 원문 — 뼈대는 node scripts/i18n/scan-lab.mjs EnvelopeLab */
const EN: Dict = {
  '외륜 흠 (BPFO)': 'Outer-race defect (BPFO)',
  '내륜 흠 (BPFI)': 'Inner-race defect (BPFI)',
  '결함 없음': 'No fault',
  '엔벨로프 분석: 대역 고르기 → 포락선 → 엔벨로프 스펙트럼': 'Envelope analysis: choose a band → envelope → envelope spectrum',
  '베어링 상태': 'Bearing state',
  '충격 크기': 'Impact size',
  '울림 첫 봉우리': 'First peak of the ringing',
  '대역 가운데': 'Band center',
  '대역 폭': 'Band width',
  '5 ~ 7 kHz 잡음': '5 – 7 kHz noise',
  '다른 원인의 넓은 대역 잡음': 'Broadband noise from another source',
  '대역 폭 {0} Hz의 포락선은 {1} Hz보다 빠르게 변할 수 없으므로, 엔벨로프 스펙트럼은 0 ~ {2} Hz만 담습니다. {3} {4} Hz의 3배({5} Hz)까지 보려면 폭이 그보다 넓어야 합니다.':
    'The envelope of a {0} Hz-wide band cannot change faster than {1} Hz, so the envelope spectrum holds only 0 to {2} Hz. To see up to 3× {3} {4} Hz ({5} Hz), the width must be wider than that.',
  '읽음값 (엔벨로프 스펙트럼)': 'Readouts (envelope spectrum)',
  '{0} 줄': '{0} line',
  '{0} × 2 줄': '{0} × 2 line',
  '바닥 (중앙값)': 'Floor (median)',
  '{0} 줄 ÷ 바닥': '{0} line ÷ floor',
  배: '×',
  '가장 큰 줄의 주파수': 'Frequency of the largest line',
  '대역 신호의 첨도 K': 'Kurtosis K of the band signal',
  '처음 상태(외륜, 대역 2800 ~ 3800 Hz)에서 BPFO 줄은 바닥의 몇 배인가요? 대역 가운데를 1200 Hz로 옮기면 가장 큰 줄은 몇 Hz인가요?':
    'In the initial state (outer race, band 2800 to 3800 Hz), how many times the floor is the BPFO line? If you move the band center to 1200 Hz, at what frequency is the largest line?',
  '약 180배로 BPFO(179.2 Hz)와 그 2배·3배가 또렷합니다. 1200 Hz(기어 맞물림)로 옮기면 가장 큰 줄이 50 Hz(1X)가 됩니다. 기어 맞물림의 크기가 1X로 오르내리기 때문입니다 — 결함과 상관없는 줄입니다.':
    'About 180 times; BPFO (179.2 Hz) and its 2× and 3× are clear. Move to 1200 Hz (the gear mesh) and the largest line becomes 50 Hz (1X), because the size of the gear mesh rises and falls at 1X — a line that has nothing to do with the fault.',
  '대역 가운데를 6000 Hz로 옮기면? 5 ~ 7 kHz 잡음을 0으로 하면 달라지나요?':
    'What if you move the band center to 6000 Hz? Does it change if you set the 5 – 7 kHz noise to 0?',
  '6000 Hz 대역에서는 BPFO 줄이 바닥의 2배쯤으로 묻힙니다. 잡음을 0으로 하면 줄이 바닥의 약 9.5배로 다시 섭니다 — 울림의 꼬리가 6 kHz까지 조금 닿기 때문입니다. 결함 신호가 다른 원인보다 큰 대역을 골라야 한다는 뜻이고, 그 대역을 숫자로 찾는 것이 Kurtogram입니다.':
    'In the 6000 Hz band the BPFO line is buried at about twice the floor. With the noise at 0 the line stands again at about 9.5 times the floor — the tail of the ringing reaches a little way up to 6 kHz. This means you must choose a band where the fault signal is larger than other sources; finding that band by numbers is what the kurtogram does.',
  '대역 가운데 3300 Hz에서 폭을 250 Hz로 줄이면 BPFO × 2 줄은? 2000 Hz로 넓히면?':
    'With the band center at 3300 Hz, what happens to the BPFO × 2 line if you reduce the width to 250 Hz? And if you widen it to 2000 Hz?',
  '250 Hz 폭의 포락선은 250 Hz보다 빨리 변할 수 없어 2배(358 Hz) 줄이 거의 사라집니다. 2000 Hz로 넓히면 줄은 남지만 0.11 → 0.040 g로 낮아지고 바닥은 약 3배로 올라, 줄 ÷ 바닥이 약 180 → 23배로 떨어집니다. 큰 기어 2배(2400 Hz)가 대역에 들어와 포락선을 차지하기 때문입니다. 공진을 담되 다른 성분은 빼는 폭이 좋습니다.':
    'The envelope of a 250 Hz-wide band cannot change faster than 250 Hz, so the 2× (358 Hz) line almost disappears. Widened to 2000 Hz, the line remains but drops from 0.11 to 0.040 g while the floor rises about 3 times, so line ÷ floor falls from about 180 to 23 times. The large gear 2× (2400 Hz) enters the band and takes over the envelope. A good width holds the resonance but leaves out other components.',
  '베어링 상태를 "내륜 흠"으로 바꾸면 엔벨로프 스펙트럼에 무엇이 서나요?':
    'If you change the bearing state to "inner-race defect", what stands in the envelope spectrum?',
  'BPFI(270.8 Hz)와 그 양옆 1X(50 Hz) 간격의 측대역, 그리고 1X 자체가 섭니다. 결함이 축과 함께 돌며 하중 영역을 드나들어 충격 크기가 1X로 오르내리기 때문입니다.':
    'BPFI (270.8 Hz) with sidebands spaced at 1X (50 Hz) on both sides, and 1X itself. The defect turns with the shaft and passes in and out of the load zone, so the impact size rises and falls at 1X.',
  '신호는 설명용 예시입니다: 3000 rpm 축의 6205 베어링(BPFO {0} Hz, BPFI {1} Hz), 하우징 공진 {2} Hz(ζ {3}), 기어 맞물림 {4} Hz 1 g(1X 변조), 넓은 대역 잡음, f_s {5} Hz, 2초. 대역 통과는 FFT에서 대역 밖을 0으로 만드는 방법(영위상)입니다.':
    'The signal is an illustrative example: a 6205 bearing on a 3000 rpm shaft (BPFO {0} Hz, BPFI {1} Hz), housing resonance {2} Hz (ζ {3}), gear mesh {4} Hz at 1 g (1X modulation), broadband noise, f_s {5} Hz, 2 s. The band-pass sets everything outside the band to 0 in the FFT (zero phase).',
  '원신호 스펙트럼 (dB re 1 g)과 고른 대역': 'Raw-signal spectrum (dB re 1 g) and the chosen band',
  원신호: 'Raw signal',
  '고른 대역': 'Chosen band',
  '주파수 [Hz]': 'Frequency [Hz]',
  '원신호 스펙트럼과 대역': 'Raw-signal spectrum and band',
  '대역 신호와 포락선 (50 ms)': 'Band signal and envelope (50 ms)',
  '대역 신호': 'Band signal',
  포락선: 'Envelope',
  '시각 [ms]': 'Time [ms]',
  '대역 신호와 포락선': 'Band signal and envelope',
  '엔벨로프 스펙트럼': 'Envelope spectrum',
  '{0} 하모닉': '{0} harmonics',
};

export default EN;
