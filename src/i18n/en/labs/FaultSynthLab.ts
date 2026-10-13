import type { Dict } from '../../translate';

const EN: Dict = {
  '전동기-펌프 (2극, 베인 7개)': 'Motor-pump (2-pole, 7 vanes)',
  '감속기 입력축 (23 → 61이빨)': 'Gearbox input shaft (23 → 61 teeth)',
  '벨트 구동 팬 (날개 8개)': 'Belt-driven fan (8 blades)',
  '미끄럼베어링 압축기 (날개 19개)': 'Journal-bearing compressor (19 blades)',
  '수평 (H)': 'Horizontal (H)',
  '수직 (V)': 'Vertical (V)',
  '축방향 (A)': 'Axial (A)',
  '없음': 'None',
  '1X의 정수배': 'Integer multiples of 1X',
  '결함 신호 합성기: 원인마다의 지문': 'Fault signal synthesizer: the fingerprint of each cause',
  '기계': 'Machine',
  '결함 ①': 'Fault ①',
  '결함 ①의 정도': 'Severity of fault ①',
  '결함 ②': 'Fault ②',
  '결함 ②의 정도': 'Severity of fault ②',
  '센서 방향': 'Sensor direction',
  '읽음값 ({0} 방향)': 'Readouts ({0} direction)',
  '속도 overall (RMS)': 'Velocity overall (RMS)',
  '1X 위상: 수직이 수평보다 늦은 각': '1X phase: angle by which vertical lags horizontal',
  '가속도 첨도 K': 'Acceleration kurtosis K',
  '엔벨로프 스펙트럼의 가장 큰 줄': 'Largest line in the envelope spectrum',
  '그 줄 ÷ 바닥(진폭 중앙값)': 'That line ÷ floor (median amplitude)',
  '배': '×',
  '펌프에 불평형 0.6을 넣고 방향을 H → V → A로 바꿔 1X를 보세요. 정렬 불량 0.6으로 바꾸면?':
    'Put unbalance 0.6 into the pump and look at 1X while changing the direction H → V → A. What if you change it to misalignment 0.6?',
  '불평형은 1X가 H 4.9, V 3.5, A 0.5 mm/s로 반경 방향이 크고, 수직이 수평보다 약 90° 늦습니다. 정렬 불량은 A 1X가 3.1 mm/s로 가장 크고 2X도 커지며, 수평·수직 위상차가 약 26°로 90°에서 멉니다.':
    'For unbalance, 1X is H 4.9, V 3.5, A 0.5 mm/s, large in the radial directions, and vertical lags horizontal by about 90°. For misalignment, axial 1X is the largest at 3.1 mm/s, 2X also grows, and the horizontal-vertical phase difference is about 26°, far from 90°.',
  '풀림 0.6을 V 방향으로 보세요. 1X의 정수배 말고 어디에 줄이 서나요? 가속도 첨도는?':
    'Look at looseness 0.6 in the V direction. Besides the integer multiples of 1X, where do lines appear? What is the acceleration kurtosis?',
  '정수배 사이의 ½X 자리(½X, 1½X …)에도 줄이 섭니다(½X 약 1 mm/s). 하모닉의 위상이 맞아 파형이 뾰족해져 가속도 첨도가 약 10으로 큽니다.':
    'Lines also appear at the ½X spots between the integer multiples (½X, 1½X …; ½X about 1 mm/s). The harmonics are phase-aligned, so the waveform becomes spiky and the acceleration kurtosis is large, about 10.',
  '외륜 결함 0.6을 넣고 V 방향의 속도 스펙트럼과 엔벨로프 스펙트럼을 비교하세요.':
    'Put in an outer-race fault 0.6 and compare the velocity spectrum with the envelope spectrum in the V direction.',
  '속도 스펙트럼에서는 BPFO(213.6 Hz)가 0.5 mm/s쯤으로 작게만 보이지만, 엔벨로프 스펙트럼의 가장 큰 줄은 BPFO이고 하모닉이 이어집니다. 구름베어링은 엔벨로프로 봅니다 (P5-6).':
    'In the velocity spectrum, BPFO (213.6 Hz) looks small at about 0.5 mm/s, but the largest line of the envelope spectrum is BPFO, followed by its harmonics. Rolling bearings are examined with the envelope (P5-6).',
  '감속기를 고르고 기어 결함을 넣으면 맞물림 둘레 측대역의 간격은? 그것이 무엇을 가리키나요?':
    'Choose the gearbox and put in a gear fault. What is the spacing of the sidebands around the mesh? What does it indicate?',
  '맞물림 571 Hz 둘레에 24.8 Hz(입력축 1X) 간격으로 측대역이 섭니다. 측대역 간격 = 결함이 있는 축의 회전수입니다 (P2-8, P7-6).':
    'Sidebands stand around the 571 Hz mesh at a spacing of 24.8 Hz (input shaft 1X). Sideband spacing = speed of the faulty shaft (P2-8, P7-6).',
  '설명용 합성 신호입니다: {0}, {1} rpm, f_s {2} Hz, {3}초. 건전한 상태에도 작은 1X·2X·날개 통과·전기 성분과 바탕 잡음 0.02 g가 있습니다. 충격을 만드는 결함이 없으면 엔벨로프 스펙트럼은 바닥 잡음뿐이라, 가장 큰 줄이 바닥의 몇 배인지 함께 봅니다. 크기는 원인 사이의 모양 비교용이며 판정 기준이 아닙니다.':
    'Illustrative synthetic signal: {0}, {1} rpm, f_s {2} Hz, {3} s. Even the healthy state has small 1X, 2X, blade-pass and electrical components and a background noise of 0.02 g. Without an impact-producing fault the envelope spectrum is only floor noise, so also look at how many times the floor the largest line is. Magnitudes are for comparing shapes between causes and are not a judgment criterion.',
  '속도 스펙트럼 0 ~ 1000 Hz ({0})': 'Velocity spectrum 0 to 1000 Hz ({0})',
  '속도': 'Velocity',
  '주파수 [Hz]': 'Frequency [Hz]',
  '속도 스펙트럼': 'Velocity spectrum',
  '속도 파형 (200 ms)': 'Velocity waveform (200 ms)',
  '시각 [ms]': 'Time [ms]',
  '속도 파형': 'Velocity waveform',
  '가속도 엔벨로프 스펙트럼 (2800 ~ 3800 Hz 대역)': 'Acceleration envelope spectrum (2800 to 3800 Hz band)',
  '엔벨로프': 'Envelope',
  '엔벨로프 스펙트럼': 'Envelope spectrum',
  '넣은 결함의 증거 5요소': 'Five pieces of evidence for the faults put in',
  '자세히 {0}': 'Details: {0}',
  '주파수': 'Frequency',
  '진폭': 'Amplitude',
  '위상': 'Phase',
  '방향': 'Direction',
  '운전조건': 'Operating condition',
};

export default EN;
