import type { Dict } from '../../translate';

const EN: Dict = {
  '전동기-펌프 (2극, 베인 7개)': 'Motor-pump (2-pole, 7 vanes)',
  '감속기 입력축 (23 → 61이빨)': 'Gearbox input shaft (23 → 61 teeth)',
  '벨트 구동 팬 (날개 8개)': 'Belt-driven fan (8 blades)',
  '미끄럼베어링 압축기 (날개 19개)': 'Journal-bearing compressor (19 blades)',
  '모름': 'Unknown',
  '회전수를 따라 움직인다': 'Moves with speed',
  '회전수를 바꿔도 그대로다': 'Unchanged when speed changes',
  '전체': 'All',
  '측정한 줄': 'Measured line',
  '진단 주파수 지도: 주파수 → 원인 후보': 'Diagnosis map: frequency → candidate faults',
  '기계': 'Machine',
  '회전수': 'Speed',
  '측정한 줄의 주파수': 'Frequency of measured line',
  '운전 조건을 바꾸면': 'If the operating condition is changed',
  '원인 갈래': 'Cause family',
  '원인과 증거 문구는 판단의 출발점입니다 (판정 기준이 아니다). 자리의 허용 폭은 정수배 ±2 %(최소 0.5 Hz), 2×LF ±0.3 Hz입니다. 기계 정보: 전원 {0} Hz':
    'The causes and evidence wording are a starting point for judgment (not a criterion). The tolerance of a spot is ±2 % for integer multiples (minimum 0.5 Hz) and ±0.3 Hz for 2×LF. Machine info: line frequency {0} Hz',
  ', {0}극 유도전동기': ', {0}-pole induction motor',
  ', 날개 {0}개': ', {0} blades',
  ', 기어 {0} → {1}이빨': ', gears {0} → {1} teeth',
  '구름베어링(볼 {0}개, 6205 치수비)': 'rolling bearing ({0} balls, 6205 proportions)',
  '미끄럼베어링': 'journal bearing',
  '이 기계의 원인 자리 (가로 = 주파수)': 'Cause spots of this machine (horizontal = frequency)',
  '주파수 [Hz]': 'Frequency [Hz]',
  '원인 자리 지도': 'Map of cause spots',
  '세로 줄: 위부터 축·회전체, 구조, 베어링, 기어, 전기, 유체·공력. 점선 = 측정한 줄 ({0} Hz = {1}X).':
    'Rows from the top: shaft · rotor, structure, bearing, gear, electrical, fluid · aerodynamic. Dashed line = measured line ({0} Hz = {1}X).',
  '후보 {0}개 ': 'Candidates: {0} ',
  '— 같은 자리에 여럿이면 나머지 증거로 가린다': '— if several share the spot, sort them out with the remaining evidence',
  '이 자리에 맞는 원인이 목록에 없습니다. 회전수·기계 정보를 확인하거나, 구조 공진(고정 주파수)처럼 자리가 정해지지 않은 원인을 생각합니다.':
    'No cause in the list fits this spot. Check the speed and machine information, or consider causes with no fixed spot, such as structural resonance (fixed frequency).',
  ', {0} Hz 차이': ', {0} Hz off',
  '주파수': 'Frequency',
  '진폭': 'Amplitude',
  '위상': 'Phase',
  '방향': 'Direction',
  '운전조건': 'Operating condition',
  '확인': 'Confirm',
  '(준비 중)': '(in preparation)',
};

export default EN;
