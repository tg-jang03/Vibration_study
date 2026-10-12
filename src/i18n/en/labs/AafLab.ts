import type { Dict } from '../../translate';

/** LAB-SMP-02 AafLab 영어 (D-054). 키 = 소스의 한국어 원문 — 뼈대는 node scripts/i18n/scan-lab.mjs AafLab */
const EN: Dict = {
  '일반적인 분석기 설정 (f_s = 2.56 F_max, 8차 필터)': 'Typical analyzer setup (f_s = 2.56 F_max, 8th-order filter)',
  '필터 없음 (1.8 F_max 성분이 0.76 F_max 가짜 막대로 보임)': 'No filter (a 1.8 F_max component shows up as a fake bar at 0.76 F_max)',
  '이상적 필터 (F_max에서 수직으로 끊음 — 실제로는 불가능)': 'Ideal filter (vertical cut at F_max — impossible in practice)',
  'f_s = 2.0 F_max (필터가 깎을 여유 구간이 0)': 'f_s = 2.0 F_max (no room left for the filter to roll off)',
  '직접 파라미터 조작': 'Manual (adjust parameters)',
  'Butterworth 8차 (주파수 2배마다 −48 dB)': 'Butterworth 8th order (−48 dB per doubling of frequency)',
  'Butterworth 4차 (주파수 2배마다 −24 dB)': 'Butterworth 4th order (−24 dB per doubling of frequency)',
  'Butterworth 2차 (주파수 2배마다 −12 dB)': 'Butterworth 2nd order (−12 dB per doubling of frequency)',
  '이상적 필터 (F_max 초과 완벽 차단)': 'Ideal filter (blocks everything above F_max)',
  '필터 없음': 'No filter',
  'AAF 응답 ({0})': 'AAF response ({0})',
  '입력 f_out ({0} Hz, -{1} dB)': 'Input f_out ({0} Hz, -{1} dB)',
  '정상 톤 (0.3 F_max = {0} Hz)': 'Genuine tone (0.3 F_max = {0} Hz)',
  '가짜 에일리어스 피크 ({0} Hz, Pk={1})': 'Fake alias peak ({0} Hz, Pk={1})',
  '폐기 영역 에일리어스 ({0} Hz)': 'Alias in the discarded band ({0} Hz)',
  'F_max 유효 표시 한계': 'F_max (edge of the valid display)',
  'AAF(안티에일리어싱 필터)와 f_s = 2.56 F_max': 'AAF (anti-aliasing filter) and f_s = 2.56 F_max',
  '실험 프리셋': 'Experiment preset',
  '분석 최대 주파수 F_max': 'Maximum analysis frequency F_max',
  '샘플링 비율 fs / F_max': 'Sampling ratio fs / F_max',
  ' 배': ' ×',
  'AAF 필터 종류 (fc = F_max)': 'AAF type (fc = F_max)',
  '대역 밖 고주파 배율 (f_out / F_max)': 'Out-of-band frequency ratio (f_out / F_max)',
  '대역 밖 성분 원래 진폭 A_out': 'Original amplitude of the out-of-band component A_out',
  '위험 경계선 (fs - F_max) 안내': 'Show the danger line (fs - F_max)',
  '이 이보다 높아 화면 안으로 접힌다': ' is above this, so it folds into the display',
  '은 화면 밖(버리는 구간)으로 접힌다': ' folds outside the display (into the discarded band)',
  감쇠: 'attenuation',
  'bin ': 'of the ',
  '개 중 ': ' bins, only ',
  '만 화면에 표시': ' are shown on screen',
  '샘플링 주파수 fs': 'Sampling frequency fs',
  '나이퀴스트 주파수 fN': 'Nyquist frequency fN',
  '유효 대역 침투 한계선 fs - F_max': 'Fold-in limit for the valid band fs - F_max',
  '대역 밖 성분 원래 주파수 f_out': 'Original frequency of the out-of-band component f_out',
  '에일리어스 가짜 피크 위치 fa': 'Location of the fake alias peak fa',
  'AAF 감쇠량': 'AAF attenuation',
  '잔류 피크 진폭 A_eff': 'Residual peak amplitude A_eff',
  '필터를 끄고(필터 없음) 1.8 F_max 성분(1800 Hz)을 넣으면 스펙트럼의 어디에 가짜 막대가 설까요?':
    'Turn the filter off (No filter) and add a 1.8 F_max component (1800 Hz). Where in the spectrum does a fake bar appear?',
  'f_a = |1800 − 2560| = 760 Hz(= 0.76 F_max)에 원래 진폭 그대로(1.0 Pk) 나타납니다. 필터 없이 재면 실제로는 없는 760 Hz 진동이 있다고 잘못 판단하게 됩니다.':
    'It appears at f_a = |1800 − 2560| = 760 Hz (= 0.76 F_max) with its full original amplitude (1.0 Pk). Measuring without a filter, you would wrongly conclude there is a 760 Hz vibration that does not actually exist.',
  '8차 필터를 켜면 1.8 F_max 성분의 진폭은 얼마나 줄어드나요?':
    'With the 8th-order filter on, how much is the amplitude of the 1.8 F_max component reduced?',
  '약 40.8 dB 깎여 진폭이 1.0에서 0.0091 Pk(1 % 미만)로 줄어듭니다. 가짜 막대가 거의 보이지 않게 됩니다.':
    'It is cut by about 40.8 dB, so the amplitude drops from 1.0 to 0.0091 Pk (less than 1 %). The fake bar almost disappears.',
  '샘플링 비율 f_s / F_max를 2.0으로 낮추면 어떤 문제가 생길까요?':
    'What goes wrong if you lower the sampling ratio f_s / F_max to 2.0?',
  'f_s − F_max = F_max가 되어 필터가 깎을 여유 구간이 0이 됩니다. 실제 필터는 F_max에서 수직으로 끊지 못하므로, F_max 바로 위(예: 1.1 F_max)의 성분이 거의 깎이지 않은 채 0.9 F_max로 접혀 들어옵니다. 많은 분석기가 f_s = 2.56 F_max를 쓰는 이유입니다.':
    'Then f_s − F_max = F_max, so the filter has no room left to roll off. A real filter cannot cut vertically at F_max, so a component just above F_max (e.g. 1.1 F_max) folds back to 0.9 F_max with hardly any attenuation. That is why many analyzers use f_s = 2.56 F_max.',
  '주파수 [Hz]': 'Frequency [Hz]',
  'AAF 응답 [dB]': 'AAF response [dB]',
  'AAF 주파수 응답 및 위험 전이대역': 'AAF frequency response and the risky transition band',
  '스펙트럼 진폭 [Pk]': 'Spectral amplitude [Pk]',
  '분석기 스펙트럼 (0~F_max 유효 대역 vs 버리는 대역)': 'Analyzer spectrum (0~F_max valid band vs discarded band)',
};

export default EN;
