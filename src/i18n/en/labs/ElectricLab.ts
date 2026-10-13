import type { Dict } from '../../translate';

/** ElectricLab (LAB-ELEC-01) 영어 (D-054). lib/faults/electric.ts의 기계·원인 이름은 k() 복사본으로 옮긴다 */
const EN: Dict = {
  '2극 유도전동기 (60 Hz)': '2-pole induction motor (60 Hz)',
  '4극 유도전동기 (50 Hz)': '4-pole induction motor (50 Hz)',
  '2극 동기 발전기 (60 Hz)': '2-pole synchronous generator (60 Hz)',
  '건전 (작은 기본 성분만)': 'Healthy (only small baseline components)',
  '고정자 · 정적 공극 편심 (전기)': 'Stator · static air-gap eccentricity (electrical)',
  '로터바 결함 (전기)': 'Rotor bar fault (electrical)',
  '동적 공극 편심 (전기)': 'Dynamic air-gap eccentricity (electrical)',
  '불평형 (기계)': 'Unbalance (mechanical)',
  '미스얼라인 (기계)': 'Misalignment (mechanical)',
  '작은 기본 성분만 있습니다.': 'There are only small baseline components.',
  '2×LF 자리(회전수와 무관한 고정 주파수)가 주인이고, 기록을 늘리면 극수 번째 하모닉과 갈라져 2×LF 쪽이 큽니다. 전원(계자)을 끊는 순간 그 줄이 사라집니다.':
    'The 2×LF position (a fixed frequency independent of speed) dominates, and with a longer record it separates from the pole-number harmonic and the 2×LF side is larger. The moment the power (field) is cut, that line disappears.',
  '1X 둘레에 PPF 간격의 측대역이 서고(기록을 길게 해야 보임) 1X 크기가 1/PPF마다 오르내립니다. 측대역은 부하가 클수록 크고 넓습니다. 전원을 끊으면 측대역이 곧바로 사라집니다.':
    'Sidebands at the PPF spacing stand around 1X (visible only with a long record), and the 1X size rises and falls every 1/PPF. The sidebands are larger and wider the greater the load. When the power is cut, the sidebands disappear immediately.',
  '2×LF 둘레에 PPF 측대역(아래쪽은 극수 번째 하모닉 자리와 겹침)과 1X ± PPF가 함께 섭니다. 전원을 끊으면 곧바로 사라집니다.':
    'PPF sidebands around 2×LF (the lower one overlaps the pole-number harmonic) and 1X ± PPF stand together. They disappear immediately when the power is cut.',
  '1X만 크고 측대역이 없습니다. 전원을 끊어도 회전수를 따라 천천히 줄어듭니다.':
    'Only 1X is large, with no sidebands. Even when the power is cut, it decreases slowly following the speed.',
  '기록을 늘리면 극수 번째 하모닉(2X) 쪽이 2×LF보다 큽니다. 전원(계자)을 끊어도 그대로 남아 회전수를 따라 줄어듭니다.':
    'With a longer record, the pole-number harmonic (2X) side is larger than 2×LF. Even when the power (field) is cut, it remains and decreases following the speed.',
  '원인을 골라 보기': 'Choose a cause',
  '숨은 원인 맞히기 (케이스 7개)': 'Identify the hidden cause (7 cases)',
  '케이스 {0} — {1}': 'Case {0} — {1}',
  '케이스 {0}{1}': 'Case {0}{1}',
  't = 0에 전원 차단 (회전수가 줄어든다)': 'power cut at t = 0 (the speed decreases)',
  't = 0에 계자 차단 (회전수 3600 rpm 유지)': 'field cut at t = 0 (speed kept at 3600 rpm)',
  '전기냐 기계냐: 2×LF · 극통과 측대역 · 전원 차단 시험': 'Electrical or mechanical: 2×LF · pole-pass sidebands · power-cut test',
  '보기 방식': 'View mode',
  '케이스': 'Case',
  '정답 보기': 'Show answer',
  '기계': 'Machine',
  '원인': 'Cause',
  '부하': 'Load',
  '슬립 {0} %, 회전수 {1} rpm': 'Slip {0} %, speed {1} rpm',
  '동기기는 부하와 무관하게 3600 rpm': 'A synchronous machine runs at 3600 rpm regardless of load',
  '기록 길이 T': 'Record length T',
  '세로축 dB (작은 측대역 보기)': 'Vertical axis in dB (to see small sidebands)',
  '읽음값 ({0}, 부하 {1} %)': 'Readouts ({0}, load {1} %)',
  '회전수': 'Speed',
  '슬립': 'Slip',
  '극통과 주파수 PPF = {0} × 슬립 주파수 = 2×LF − {1}X': 'Pole-pass frequency PPF = {0} × slip frequency = 2×LF − {1}X',
  '{0}X (2×LF {1} Hz 옆)': '{0}X (next to 2×LF {1} Hz)',
  'PPF가 몇 칸인가 (PPF ÷ Δf)': 'PPF in bins (PPF ÷ Δf)',
  '시험 0.5 s 뒤 남은 크기 (시험 전 = 1)': 'Size remaining 0.5 s after the test (before the test = 1)',
  '시험 2 s 뒤 남은 크기': 'Size remaining 2 s after the test',
  '2극 60 Hz · 고정자 · 부하 60 %에서 기록을 1 s → 8 s로 늘리며 2×LF 둘레 확대를 보세요. 그다음 스펙트로그램에서 t = 0에 무엇이 사라지나요?':
    'With 2-pole 60 Hz · stator · load 60 %, increase the record 1 s → 8 s and watch the zoom around 2×LF. Then, in the spectrogram, what disappears at t = 0?',
  '1 s(Δf 1 Hz)에서는 119.2 Hz(2X)와 120 Hz(2×LF)가 한 덩어리입니다. PPF 0.8 Hz가 0.8칸뿐이기 때문입니다. 8 s(6.4칸)에서는 120 Hz가 3.2 mm/s로 크고 119.2 Hz는 0.2 mm/s 남짓으로 작게 갈라집니다. 전원을 끊는 순간 120 Hz 줄이 사라져, 0.5 s 뒤 남은 크기가 0.19입니다.':
    'At 1 s (Δf 1 Hz), 119.2 Hz (2X) and 120 Hz (2×LF) are one lump, because the PPF of 0.8 Hz is only 0.8 bin. At 8 s (6.4 bins) they separate: 120 Hz is large at 3.2 mm/s and 119.2 Hz is small at a little over 0.2 mm/s. The moment the power is cut, the 120 Hz line disappears, and the size remaining after 0.5 s is 0.19.',
  '원인만 미스얼라인으로 바꿔 같은 두 가지를 보세요. 무엇이 다른가요?':
    'Change only the cause to misalignment and look at the same two things. What is different?',
  '8 s에서 119.2 Hz(2X)가 약 2.9 mm/s로 크고(줄이 칸 사이에 있어 3.25보다 조금 낮게 읽힘) 120 Hz는 0.2 mm/s입니다. 전원을 끊어도 2X는 남아 회전수를 따라 아래로 휘며 천천히 줄어, 0.5 s 뒤 0.71, 2 s 뒤 0.35입니다. 1 s 기록의 한 덩어리만 보면 두 원인은 구별되지 않습니다.':
    'At 8 s, 119.2 Hz (2X) is large at about 2.9 mm/s (the line lies between bins, so it reads a little lower than 3.25) and 120 Hz is 0.2 mm/s. Even when the power is cut, the 2X remains, bending downward with the speed and decreasing slowly, 0.71 after 0.5 s and 0.35 after 2 s. Looking only at the single lump of a 1 s record, the two causes cannot be told apart.',
  '로터바를 고르고 기록 8 s에서 부하를 20 → 60 → 100 %로 올리세요. 측대역의 간격과 크기는? 부하 20 %에서는 기록을 몇 초로 해야 할까요?':
    'Choose rotor bar and, with an 8 s record, raise the load 20 → 60 → 100 %. What are the spacing and size of the sidebands? How long must the record be at 20 % load?',
  'PPF가 0.27 → 0.8 → 1.33 Hz로 넓어지고 측대역도 0.1 → 0.3 → 0.5 mm/s로 커집니다. 부하 20 %의 PPF 0.27 Hz는 8 s에서 2.1칸이라 1X 봉우리의 옆자락에 묻히고, 16 s(4.3칸)에 dB 축으로 보면 드러납니다. 로터바는 부하를 걸고, 길게 재야 보입니다.':
    'The PPF widens 0.27 → 0.8 → 1.33 Hz and the sidebands grow 0.1 → 0.3 → 0.5 mm/s. The 0.27 Hz PPF at 20 % load is only 2.1 bins at 8 s, so it is buried in the skirt of the 1X peak, and it shows up at 16 s (4.3 bins) on the dB axis. A rotor bar fault is seen only under load and with a long record.',
  '보기 방식을 "숨은 원인 맞히기"로 바꾸고 케이스 1 ~ 7을 가려 보세요. 기록 길이·부하를 바꿔도 됩니다.':
    'Change the view mode to "Identify the hidden cause" and tell cases 1 to 7 apart. You may change the record length and load.',
  '케이스 1 고정자(전기), 2 미스얼라인(기계), 3 로터바(전기, 4극 1X ± 1.6 Hz), 4 불평형(기계), 5 발전기 고정자 자기력(계자 차단에 반응), 6 발전기 기계 2X(계자 차단에 무반응), 7 동적 공극 편심(2×LF ± PPF와 1X ± PPF)입니다. "정답 보기"를 켜면 근거가 나옵니다.':
    'Case 1 stator (electrical), 2 misalignment (mechanical), 3 rotor bar (electrical, 4-pole 1X ± 1.6 Hz), 4 unbalance (mechanical), 5 generator stator magnetic force (responds to the field cut), 6 generator mechanical 2X (does not respond to the field cut), 7 dynamic air-gap eccentricity (2×LF ± PPF and 1X ± PPF). Turn on "Show answer" to see the reasoning.',
  '설명용 모델입니다: 슬립은 부하에 비례(전부하 = 명판 회전수 {0} · {1} rpm), 전원 차단 뒤 전기 성분은 시간 상수 0.1 s(발전기 계자 0.8 s)로 사라지고 회전수는 f_r/(1 + t/3 s)로 줄며 기계 성분은 회전수의 제곱으로 줄어든다고 두었습니다. 실제 시간 상수·크기는 기계마다 다르며, 크기는 판정 기준이 아닙니다.':
    'An illustrative model: slip is proportional to load (full load = nameplate speeds {0} · {1} rpm); after the power is cut, the electrical component disappears with a time constant of 0.1 s (generator field 0.8 s), the speed decreases as f_r/(1 + t/3 s), and the mechanical component decreases with the square of the speed. The real time constants and sizes differ from machine to machine, and the sizes are not criteria.',
  '1X 둘레 (기록 {0} s)': 'Around 1X (record {0} s)',
  '스펙트럼': 'Spectrum',
  '주파수 [Hz]': 'Frequency [Hz]',
  '1X 둘레 확대 스펙트럼': 'Zoomed spectrum around 1X',
  '2×LF 둘레 (기록 {0} s)': 'Around 2×LF (record {0} s)',
  '2×LF 둘레 확대 스펙트럼': 'Zoomed spectrum around 2×LF',
  '시험 전후 스펙트로그램 — {0} (0.5 s 프레임, Δf 2 Hz)': 'Spectrogram before and after the test — {0} (0.5 s frames, Δf 2 Hz)',
  '시험': 'Test',
  '시간 [s]': 'Time [s]',
  '시험 전후 스펙트로그램': 'Spectrogram before and after the test',
};

export default EN;
