import type { Dict } from '../../translate';

/** LAB-RES-01 ResolutionLab 영어 (D-054). 키 = 소스의 한국어 원문 — 뼈대는 node scripts/i18n/scan-lab.mjs ResolutionLab */
const EN: Dict = {
  '(a) 간격 3.6 Hz: 25.2 Hz와 28.8 Hz': '(a) Spacing 3.6 Hz: 25.2 Hz and 28.8 Hz',
  '(b) 2극 유도전동기: 2X 119 Hz와 전원 2배 120 Hz (간격 1 Hz)': '(b) 2-pole induction motor: 2X 119 Hz and 2LF 120 Hz (spacing 1 Hz)',
  '(c) 2극 동기기: 2X와 전원 2배가 둘 다 120 Hz (간격 0)': '(c) 2-pole synchronous machine: 2X and 2LF both 120 Hz (spacing 0)',
  '(d) 저속 축(1X = 5 Hz): 36 Hz와 41 Hz (간격 = 1X)': '(d) Slow shaft (1X = 5 Hz): 36 Hz and 41 Hz (spacing = 1X)',
  '직접 조작': 'Manual',
  '400 line (표준)': '400 lines (standard)',
  'Hann (분석기 기본값, 필요 간격 약 3.5 bin)': 'Hann (analyzer default, spacing needed about 3.5 bins)',
  '윈도우 없음 (필요 간격 약 2 bin)': 'No window (spacing needed about 2 bins)',
  'Flat top (진폭 측정용, 필요 간격 약 8 bin)': 'Flat top (for amplitude measurement, spacing needed about 8 bins)',
  '스펙트럼 ({0}, Δf = {1} Hz)': 'Spectrum ({0}, Δf = {1} Hz)',
  '주파수 분해능(Δf)과 두 성분 분리 한계': 'Frequency resolution (Δf) and the limit for separating two components',
  '사례 프리셋': 'Case preset',
  '분석 최대 주파수 F_max': 'Maximum analysis frequency F_max',
  '스펙트럼 라인 수 LOR': 'Number of spectral lines (LOR)',
  '윈도우 함수': 'Window function',
  '성분 1 주파수 f1': 'Component 1 frequency f1',
  '성분 2 주파수 f2': 'Component 2 frequency f2',
  '관심 대역 확대 보기': 'Zoom in on the band of interest',
  '개별 bin 샘플점 표시': 'Show individual bin points',
  '두 성분 간격': 'Spacing of the two components',
  '분리 판정:': 'Separation verdict:',
  '같은 주파수: 측정 시간을 늘려도 가를 수 없다 (다른 시험이 필요)': 'Same frequency: cannot be separated by measuring longer (another test is needed)',
  '갈라진다': 'separates',
  '간격': 'spacing',
  '필요': 'needed',
  '하나로 뭉친다': 'merges into one',
  '라인 수 LOR': 'Number of lines LOR',
  '주파수 분해능 Δf': 'Frequency resolution Δf',
  '측정 시간 T': 'Measurement time T',
  '두 성분 주파수 간격': 'Frequency spacing of the two components',
  '간격에 해당하는 bin 수': 'Spacing in bins',
  '갈라지는 데 필요한 간격 (윈도우별)': 'Spacing needed to separate (by window)',
  '전체 시간 샘플 수 N': 'Total number of time samples N',
  'F_max = 1000 Hz, LOR = 3200 line이면 Δf와 측정 시간 T는 얼마인가요?': 'With F_max = 1000 Hz and LOR = 3200 lines, what are Δf and the measurement time T?',
  'Δf = 1000 / 3200 = 0.3125 Hz, T = 1 / Δf = 3.2 s입니다. 0.3 Hz 간격으로 보려면 기계가 3.2초 동안 같은 상태로 돌고 있어야 합니다.':
    'Δf = 1000 / 3200 = 0.3125 Hz and T = 1 / Δf = 3.2 s. To look at 0.3 Hz spacing, the machine must run in the same state for 3.2 seconds.',
  '프리셋 (a)(간격 3.6 Hz)에서 LOR = 400이면 두 막대가 갈라지나요? 갈라지려면 LOR을 얼마로 올려야 할까요?':
    'In preset (a) (spacing 3.6 Hz), do the two bars separate at LOR = 400? To what value must LOR be raised for them to separate?',
  'LOR = 400이면 Δf = 2.5 Hz라서 간격이 1.44 bin뿐이라 하나로 뭉칩니다(Hann은 약 3.5 bin 필요). LOR = 1600(Δf = 0.625 Hz, 5.76 bin)이면 갈라집니다. 측정 시간은 0.4 s → 1.6 s로 늘어납니다.':
    'At LOR = 400, Δf = 2.5 Hz, so the spacing is only 1.44 bins and they merge into one (Hann needs about 3.5 bins). At LOR = 1600 (Δf = 0.625 Hz, 5.76 bins) they separate. The measurement time grows from 0.4 s to 1.6 s.',
  '프리셋 (b)(119 Hz와 120 Hz)를 Hann으로 가르려면 Δf가 얼마 이하여야 하나요? F_max = 500 Hz라면 LOR은?':
    'To separate preset (b) (119 Hz and 120 Hz) with Hann, how small must Δf be? What LOR is needed at F_max = 500 Hz?',
  '간격 1 Hz가 3.5 bin 이상이어야 하므로 Δf ≤ 1/3.5 ≈ 0.29 Hz. F_max = 500 Hz에서는 LOR = 3200(Δf ≈ 0.156 Hz)이면 됩니다(1600은 0.3125 Hz로 조금 모자람). 측정 시간은 6.4 s입니다.':
    'The 1 Hz spacing must be at least 3.5 bins, so Δf ≤ 1/3.5 ≈ 0.29 Hz. At F_max = 500 Hz, LOR = 3200 (Δf ≈ 0.156 Hz) is enough (1600 gives 0.3125 Hz, a little short). The measurement time is 6.4 s.',
  '프리셋 (c)처럼 두 성분이 정확히 같은 주파수면 LOR을 6400으로 올려 가를 수 있나요?':
    'As in preset (c), if two components have exactly the same frequency, can you separate them by raising LOR to 6400?',
  '가를 수 없습니다. 주파수가 같으면 측정 시간을 아무리 늘려도 막대 하나에 겹칩니다. 전동기라면 전원을 끊는 순간 바로 사라지는 쪽이 전기적 원인, 회전수와 함께 서서히 줄어드는 쪽이 기계적 원인이라는 식으로 다른 시험으로 가립니다.':
    'No. If the frequencies are the same, they overlap in one bar however long you measure. For a motor you tell them apart with another test: the part that disappears the moment the power is cut is electrical in origin, and the part that fades gradually with the speed is mechanical.',
  '주파수 [Hz]': 'Frequency [Hz]',
  '진폭 [Pk]': 'Amplitude [Pk]',
  '두 성분 분해능 스펙트럼': 'Resolution spectrum of two components',
};

export default EN;
