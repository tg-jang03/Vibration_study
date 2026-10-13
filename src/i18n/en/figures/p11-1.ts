import type { Dict } from '../../translate';

/** src/figures/p11-1.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 이 페이지에서 케이스를 푸는 순서. ① ~ ③은 측정 전에 책상에서 하는 일이고, ④ ~ ⑤는 가설을 가를 자료를 고르는 일입니다(파랑). ⑤에서 후보가 갈리지 않으면 설정을 바꿔 ④로 돌아갑니다. ⑥에서는 원인 하나만이 아니라 반증한 후보와 확신도, 다음 확인까지 씁니다.':
    'Figure 1. The order for solving a case on this page. ① – ③ are desk work before measuring, and ④ – ⑤ are about choosing the data that separates the hypotheses (blue). If the candidates do not separate in ⑤, change the setup and go back to ④. In ⑥ you write not just one cause but also the candidates rebutted, the confidence and the next check.',
  '① 보고 읽기': '① Read report',
  '무엇이 · 언제부터 · 어디서': 'What · since when · where',
  '② 기계 구성표': '② Configuration',
  '회전수 · 극수 · 요소 수': 'Speed · poles · counts',
  '③ 주파수 지도': '③ Frequency map',
  '후보 자리 계산 (P7-1)': 'Candidate positions (P7-1)',
  '④ 측정 설정': '④ Setup',
  '센서 · f_max · Δf · AAF (P2-9)': 'Sensor · f_max · Δf · AAF (P2-9)',
  '⑤ 자료 고르기': '⑤ Choose data',
  '가를 질문에 맞는 플롯': 'Plot that fits the question',
  '⑥ 결론': '⑥ Conclusion',
  '증거 · 반증 · 확신도 (P10-3)': 'Evidence · rebuttal · confidence (P10-3)',
  '못 가르면 다시 잰다': 'Cannot separate: measure again',
  // 그림 2
  '그림 2. 예시 순환수 펌프(4극 전동기 1775 rpm = 29.58 Hz, 볼 8개 베어링, 베인 5개)의 주파수 지도. 측정하기 전에 구성표만으로 계산합니다. 파랑 = 회전수의 배수, 갈색 주황 = 구름베어링(P1-8), 보라 = 전기(2×LF), 초록 = 베인 통과. BPFI(142.4 Hz)와 2×BSF(139.4 Hz), 베인 통과(147.9 Hz)가 몇 Hz 안에 몰려 있어, 이 근처의 줄은 Δf가 촘촘해야 어느 자리인지 가릴 수 있습니다.':
    'Figure 2. Frequency map of the example circulation pump (4-pole motor at 1775 rpm = 29.58 Hz, bearing with 8 balls, 5 vanes). It is calculated from the configuration table alone, before measuring. Blue = multiples of speed, brown-orange = rolling bearing (P1-8), purple = electrical (2×LF), green = vane pass. BPFI (142.4 Hz), 2×BSF (139.4 Hz) and the vane pass (147.9 Hz) are crowded within a few Hz, so lines near here can be told apart only if Δf is fine enough.',
  '축 (회전수의 배수)': 'Shaft (speed multiples)',
  '유체 (베인 통과)': 'Fluid (vane pass)',
  '베인 통과 5X 147.9': 'Vane pass 5X 147.9',
  // 그림 3
  '그림 3. 같은 펌프를 세 가지로 본 것(수직). 위 — 보고된 설정(속도, f_max 1 kHz): 1X 0.74 · 베인 통과 0.37 mm/s 말고는 바닥뿐이고, BPFO(94.27 Hz, 갈색 주황 점선) 자리는 0.037 mm/s입니다. 가운데 — f_max를 5 kHz로 올려 가속도로 보면 3 ~ 3.5 kHz에 넓은 둔덕이 섭니다(하우징 공진이 충격에 울리는 자리). 아래 — 그 둔덕을 담는 2.5 ~ 4.5 kHz 대역의 엔벨로프: BPFO와 그 하모닉(0.17 g, 점선)이 또렷합니다.':
    'Figure 3. The same pump seen three ways (vertical). Top — the reported setup (velocity, f_max 1 kHz): apart from 1X 0.74 and vane pass 0.37 mm/s there is only the floor, and the BPFO position (94.27 Hz, brown-orange dotted) is 0.037 mm/s. Middle — raising f_max to 5 kHz and looking at acceleration shows a broad hump at 3 – 3.5 kHz (where the housing resonance rings from the impacts). Bottom — the envelope of the 2.5 – 4.5 kHz band that contains that hump: BPFO and its harmonics (0.17 g, dotted) are clear.',
  '속도 스펙트럼 · f_max 1 kHz · 800 라인 (보고된 설정)': 'Velocity spectrum · f_max 1 kHz · 800 lines (reported setup)',
  '가속도 스펙트럼 · f_max 5 kHz · 1600 라인': 'Acceleration spectrum · f_max 5 kHz · 1600 lines',
  '엔벨로프 대역': 'Envelope band',
  '엔벨로프 스펙트럼 · 2.5 ~ 4.5 kHz 대역': 'Envelope spectrum · 2.5 – 4.5 kHz band',
  // 그림 4
  '그림 4. 예시 2극 전동기 팬(3570 rpm)의 수직 스펙트럼, 110 ~ 130 Hz만 확대. 위 — f_max 1 kHz · 400 라인(Δf 2.5 Hz): 120 Hz 근처에 줄 하나(1.07 mm/s)로 보입니다. 아래 — f_max 200 Hz · 1600 라인(Δf 0.125 Hz): 2X(119.0 Hz, 0.8 mm/s)와 2×LF(120.0 Hz, 1.6 mm/s)가 갈라집니다. 두 줄의 간격 1.0 Hz보다 Δf가 몇 배 촘촘해야 합니다(P2-4).':
    'Figure 4. Vertical spectrum of the example 2-pole motor fan (3570 rpm), zoomed to 110 – 130 Hz. Top — f_max 1 kHz · 400 lines (Δf 2.5 Hz): it looks like a single line (1.07 mm/s) near 120 Hz. Bottom — f_max 200 Hz · 1600 lines (Δf 0.125 Hz): 2X (119.0 Hz, 0.8 mm/s) and 2×LF (120.0 Hz, 1.6 mm/s) separate. Δf must be several times finer than the 1.0 Hz spacing of the two lines (P2-4).',
  'f_max 1 kHz · 400 라인 (Δf 2.5 Hz)': 'f_max 1 kHz · 400 lines (Δf 2.5 Hz)',
  'f_max 200 Hz · 1600 라인 (Δf 0.125 Hz)': 'f_max 200 Hz · 1600 lines (Δf 0.125 Hz)',
  // 그림 5
  '그림 5. 예시 증속기(전동기 축 1480 rpm, 115이빨 대기어)의 수평 속도 스펙트럼. 위 — AAF 없이 f_max 1 kHz(f_s 2560 Hz)로 잼: 8.6 mm/s의 큰 줄이 276.7 Hz(= 11.2X)에 섭니다. 가운데 — 같은 설정에 AAF만 켬: 그 줄이 없습니다. 아래 — f_max 5 kHz: 진짜 줄은 GMF 2836.7 Hz(0.78 mm/s)입니다. 2836.7 − 2560 = 276.7 Hz로 접혔고, 속도로 바꿀 때 접힌 자리의 낮은 주파수로 나누어 11배로 부풀었습니다.':
    'Figure 5. Horizontal velocity spectrum of the example speed increaser (motor shaft 1480 rpm, 115-tooth large gear). Top — measured without an AAF at f_max 1 kHz (f_s 2560 Hz): a large 8.6 mm/s line stands at 276.7 Hz (= 11.2X). Middle — same setup with only the AAF turned on: that line is gone. Bottom — f_max 5 kHz: the real line is the GMF at 2836.7 Hz (0.78 mm/s). It folded to 2836.7 − 2560 = 276.7 Hz, and converting to velocity divides by the low frequency of the folded position, inflating it 11 times.',
  'AAF 끔 · f_max 1 kHz': 'AAF off · f_max 1 kHz',
  '가짜 줄: 기계 주파수 어디에도 없음': 'Fake line: fits no machine frequency',
  'AAF 켬 · f_max 1 kHz': 'AAF on · f_max 1 kHz',
  'AAF 켬 · f_max 5 kHz': 'AAF on · f_max 5 kHz',
  'f_s = 2560 Hz (위의 측정)': 'f_s = 2560 Hz (top measurement)',
  // 그림 6
  '그림 6. 예시 압축기(8800 rpm)의 코스트다운 1X(X 프로브). 회색 — 잰 그대로: 440 rpm(slow roll)에서 이미 21.9 µm p-p이고 운전점은 32.1 µm입니다. 파랑 — slow roll 벡터를 뺀 것: 저속에서 0으로 시작해 3640 rpm 근처 봉우리 36.3 µm, 운전점 12.2 µm으로 불평형 응답의 모양입니다. 같은 때 하우징 1X는 0.7 mm/s로 작았습니다.':
    'Figure 6. Coastdown 1X (X probe) of the example compressor (8800 rpm). Gray — as measured: already 21.9 µm p-p at 440 rpm (slow roll), and 32.1 µm at the operating point. Blue — with the slow roll vector subtracted: it starts at 0 at low speed, peaks at 36.3 µm near 3640 rpm and is 12.2 µm at the operating point, the shape of an unbalance response. At the same time the housing 1X was small at 0.7 mm/s.',
  '잰 그대로': 'As measured',
  'slow roll 벡터를 뺌': 'Slow roll vector removed',
  // 그림 7
  '그림 7. 예시 환기 팬(1480 rpm = 24.67 Hz). 위 — 코스트다운 1X: 수평(파랑)만 1420 rpm에서 15 mm/s 봉우리를 만들고 운전점에서도 9.2 mm/s, 수직(주황)은 1.3 mm/s로 매끈합니다. 가운데 — 수평 위상은 봉우리를 지나며 28° → 176°로 바뀝니다. 아래 — 세워 놓고 친 임팩트 FRF: 수평 23.7 Hz, 수직 64.2 Hz. 수평 고유진동수가 1X(점선) 바로 아래에 있습니다.':
    'Figure 7. Example ventilation fan (1480 rpm = 24.67 Hz). Top — coastdown 1X: only the horizontal (blue) makes a 15 mm/s peak at 1420 rpm and is still 9.2 mm/s at the operating point, while the vertical (orange) is smooth at 1.3 mm/s. Middle — the horizontal phase changes from 28° to 176° through the peak. Bottom — impact FRF taken while stopped: horizontal 23.7 Hz, vertical 64.2 Hz. The horizontal natural frequency sits just below 1X (dotted).',
  '수평 H': 'Horizontal H',
  '수직 V': 'Vertical V',
  // 그림 8
  '그림 8. 예시 압축기(12,500 rpm 정속)의 12시간 1X(X 프로브, 10분 간격). 위 — 크기가 13 ~ 36 µm p-p 사이를 1.6시간 주기로 오르내립니다. 아래 — 같은 기록을 Polar(0° 위, 지연각은 시계 방향)로 그리면 1X 벡터가 원점이 아닌 한 점(회색 점 = 기계 벡터, 24 µm∠60°) 둘레를 돕니다. 회전수·부하가 그대로인데 벡터가 이렇게 돌면 열 휨이 천천히 자리를 옮기는 것을 의심합니다(P8-2).':
    'Figure 8. 12-hour 1X (X probe, 10-minute interval) of the example compressor (constant 12,500 rpm). Top — the amplitude swings between 13 and 36 µm p-p with a period of 1.6 hours. Bottom — plotting the same record on a Polar plot (0° at top, lag angle clockwise), the 1X vector circles a point that is not the origin (gray dot = machine vector, 24 µm∠60°). When speed and load are unchanged and the vector turns like this, suspect a thermal bow that slowly shifts position (P8-2).',
  '시간 [h] (지금 = 0)': 'Time [h] (now = 0)',
  '기계 벡터': 'Machine',
  지금: 'Now',
};

export default EN;
