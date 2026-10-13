import type { Dict } from '../../translate';

/** src/figures/p11-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. CWRU 베어링 시험대의 구성(공식 페이지 설명을 도식으로 그림, 크기 비율은 맞추지 않음). 왼쪽 2 hp 전동기의 양쪽 베어링 — 구동측(DE, 6205)과 팬측(FE, 6203) — 중 하나에 방전 가공(EDM)으로 작은 구멍 하나를 내고, 하우징 12시 자리의 가속도계(파랑)로 잽니다. 오른쪽 동력계로 부하를 0 ~ 3 hp로 바꾸면 회전수가 1797 → 1730 rpm으로 조금씩 내려갑니다. 회전수는 가운데 토크 변환기·엔코더로 읽어 손으로 적었습니다.':
    'Figure 1. Layout of the CWRU bearing test rig (a schematic drawn from the official page description, not to scale). A single small hole is made by electro-discharge machining (EDM) in one of the two bearings of the 2 hp motor on the left — drive end (DE, 6205) or fan end (FE, 6203) — and measured with an accelerometer (blue) at the 12 o\'clock position of the housing. When the dynamometer on the right changes the load from 0 to 3 hp, the speed drops slightly from 1797 to 1730 rpm. The speed was read from the torque transducer/encoder in the middle and written down by hand.',
  '가속도계 FE': 'Accel. FE',
  '가속도계 DE': 'Accel. DE',
  '토크 변환기': 'Torque transducer',
  엔코더: 'Encoder',
  동력계: 'Dynamometer',
  '부하 0 ~ 3 hp': 'Load 0 to 3 hp',
  '받침 BA (일부 기록)': 'Base BA (some records)',

  '그림 2. 같은 기록(합성 예시 B, 12 kHz로 기록)의 평균 스펙트럼 0 ~ 200 Hz. 위 — f_s를 12 kHz로 맞게 넣으면 회전수(1797 rpm)로 계산한 1X 자리 29.95 Hz(회색 점선)에 줄(7.49 mg rms)이 서고 2X도 제자리에 있습니다. 아래 — 48 kHz로 잘못 넣으면 모든 주파수가 4배로 읽혀 1X 자리는 비고, 같은 줄이 117.2 Hz 근처(4 × 29.95 = 119.8 Hz, 주황)에 섭니다. f_s를 모르는 파일은 이렇게 1X로 먼저 확인합니다.':
    'Figure 2. Average spectrum, 0 to 200 Hz, of the same record (synthetic example B, recorded at 12 kHz). Top — with f_s correctly entered as 12 kHz, a line (7.49 mg rms) stands at the 1X position calculated from the speed (1797 rpm), 29.95 Hz (gray dashed), and 2X is in place too. Bottom — entered wrongly as 48 kHz, every frequency is read 4 times higher, so the 1X position is empty and the same line stands near 117.2 Hz (4 × 29.95 = 119.8 Hz, orange). For a file whose f_s is unknown, check it first with 1X like this.',
  'f_s = 12 kHz (맞게 넣음)': 'f_s = 12 kHz (correct)',
  '1X 계산': '1X calc.',
  'f_s = 48 kHz (잘못 넣음)': 'f_s = 48 kHz (wrong)',
  '주파수 [Hz] (잘못 읽은 눈금)': 'Frequency [Hz] (misread scale)',
  '실제 1X가 선 자리': 'Where the real 1X stands',

  '그림 3. 합성 예시 B(구동측 가속도, 10.9 s 중 처음 100 ms)를 랩의 순서로 본 첫 두 단계. 위 — 파형: 약 9.4 ms마다 짧게 울리고 사라지는 충격이 보이고, 첨도는 8.1로 정규 잡음(3)보다 큽니다. 아래 — 평균 스펙트럼(dB, 0 dB = 1 g rms): BPFO 자리(106.9 Hz)의 줄은 바닥의 3.3배로 1X보다도 작습니다. 눈에 띄는 것은 3.2 kHz 근처의 넓은 둔덕 — 충격이 울리는 하우징 공진(P5-6)입니다. 주황 띠는 다음 단계의 Kurtogram이 고른 대역입니다.':
    'Figure 3. The first two steps of the lab sequence for synthetic example B (drive-end acceleration, first 100 ms of 10.9 s). Top — waveform: a short impact that rings and dies away is visible about every 9.4 ms, and the kurtosis of 8.1 is above the 3 of normal noise. Bottom — average spectrum (dB, 0 dB = 1 g rms): the line at the BPFO position (106.9 Hz) is 3.3 times the floor, smaller even than 1X. What stands out is the broad hump near 3.2 kHz — the housing resonance the impacts ring (P5-6). The orange band is the band the kurtogram picks in the next step.',
  '① 파형': '① Waveform',
  '② 평균 스펙트럼 (Hann, 50 % 겹침)': '② Average spectrum (Hann, 50 % overlap)',
  'Kurtogram 대역': 'Kurtogram band',

  '그림 4. 예시 B의 Kurtogram(P5-6 §7): 세로는 대역폭, 가로는 대역의 가운데 주파수, 진하기는 그 대역 포락선의 SK입니다. 가장 진한 칸은 1500 ~ 4500 Hz(폭 3000 Hz, SK 3.83)로 3.2 kHz 공진을 담습니다. 레벨이 셋뿐인 것은 대역 폭을 가장 높은 결함 주파수(BPFI 162.2 Hz)의 3배(487 Hz)보다 좁게 자르지 않기 때문입니다 — 엔벨로프 스펙트럼에는 대역 폭보다 높은 줄이 설 수 없습니다.':
    'Figure 4. Kurtogram of example B (P5-6 §7): the vertical axis is bandwidth, the horizontal axis the band center frequency, and the shade is the SK of that band\'s envelope. The darkest cell is 1500 to 4500 Hz (width 3000 Hz, SK 3.83), which contains the 3.2 kHz resonance. There are only three levels because the band width is not cut narrower than 3 times (487 Hz) the highest defect frequency (BPFI 162.2 Hz) — a line higher than the band width cannot stand in the envelope spectrum.',
  '← 가장 큰 SK 3.83 (1500 ~ 4500 Hz)': '← Largest SK 3.83 (1500 to 4500 Hz)',

  '그림 5. 예시 B의 엔벨로프 스펙트럼, 대역만 바꾼 것. 위 — Kurtogram 대역(1500 ~ 4500 Hz): BPFO 자리에 줄(106.3 Hz, 바닥의 202배)과 2 · 3배가 섭니다. 계산값 107.4 Hz보다 1 % 낮은 것은 미끄럼 때문입니다(P7-5). 아래 — 공진을 비켜 간 300 ~ 900 Hz 대역: 같은 줄이 바닥의 25배로 줄고 바닥이 들쭉날쭉합니다. 결함이 약한 실측 기록이라면 이 대역에서는 줄이 묻힙니다. 점선은 BPFO 계산값과 그 배수(갈색 주황).':
    'Figure 5. Envelope spectrum of example B, with only the band changed. Top — kurtogram band (1500 to 4500 Hz): a line stands at the BPFO position (106.3 Hz, 202 times the floor) with its 2× and 3×. It is 1 % lower than the calculated 107.4 Hz because of slip (P7-5). Bottom — the 300 to 900 Hz band, which avoids the resonance: the same line drops to 25 times the floor and the floor becomes ragged. In a measured record with a weak fault, the line would be buried in this band. Dashed lines are the calculated BPFO and its multiples (brown-orange).',
  '④ 엔벨로프 · 1500 ~ 4500 Hz (Kurtogram 대역)': '④ Envelope · 1500 to 4500 Hz (kurtogram band)',
  '엔벨로프 · 300 ~ 900 Hz (공진을 비켜 간 대역)': 'Envelope · 300 to 900 Hz (band avoiding resonance)',

  '그림 6. 같은 순서로 본 예시 C와 D의 엔벨로프 스펙트럼(각자 Kurtogram 대역). 위(C) — BPFI 자리 163.2 Hz가 바닥의 141배로 서고, 그 양옆 ±1X(29.95 Hz, 회색 점선)에 측대역이 붙습니다: 내륜은 축과 함께 돌아 하중 영역을 회전마다 드나들기 때문입니다(P7-5). 아래(D) — 볼 자리(공개 표의 값 = 2×BSF) 140.4 Hz와 FTF 11.8 Hz(보라)가 섭니다: 볼은 케이지와 함께 FTF로 하중 영역을 돕니다. C의 결함 대조 표에서는 BPFO 3배 칸도 바닥의 79배로 크게 나오는데, BPFI 2배(326.5 Hz)가 BPFO 3배 자리(322.1 Hz)의 허용 폭 ±2 % 안에 들어온 우연입니다. BPFO 1배는 2.4배뿐입니다.':
    'Figure 6. Envelope spectra of examples C and D seen in the same sequence (each in its own kurtogram band). Top (C) — the BPFI position, 163.2 Hz, stands at 141 times the floor, with sidebands at ±1X (29.95 Hz, gray dashed) on both sides: the inner race turns with the shaft and passes through the load zone every turn (P7-5). Bottom (D) — the ball position (the published-table value = 2×BSF) 140.4 Hz and FTF 11.8 Hz (purple) stand: the ball goes around the load zone at FTF together with the cage. In C\'s defect comparison table the BPFO 3× cell also comes out large, at 79 times the floor; this is a coincidence: BPFI 2× (326.5 Hz) falls within the ±2 % tolerance of the BPFO 3× position (322.1 Hz). BPFO 1× is only 2.4 times.',
  '예시 C · 1500 ~ 4500 Hz': 'Example C · 1500 to 4500 Hz',
  '예시 D · 2250 ~ 3750 Hz': 'Example D · 2250 to 3750 Hz',
  볼: 'Ball',

  '그림 7. 예시 E = 예시 B와 같은 외륜 결함 + 베어링과 상관없는 짧은 튐(5.6 kHz로 울리고 바로 사라짐, 1초에 평균 3번, 무작위 시각). 위 — Kurtogram은 튐이 사는 5250 ~ 6000 Hz를 SK 32.7으로 고릅니다(외륜 결함이 울리는 대역의 SK는 4 아래). 드문 튐이 촘촘한 결함 충격보다 "더 드물게 튀기" 때문입니다. 가운데 — 그 대역의 엔벨로프는 들쭉날쭉한 바닥뿐이고(세로 눈금이 아래의 약 35분의 1), 어느 결함 자리도 바닥의 5.4배를 넘지 않습니다. 아래 — 스펙트럼의 둔덕을 보고 2.5 ~ 4.5 kHz로 직접 고르면 BPFO가 바닥의 206배로 섭니다. 회색 점선은 BPFO 계산값과 그 배수입니다.':
    'Figure 7. Example E = the same outer-race fault as example B + short bearing-unrelated spikes (ringing at 5.6 kHz and dying away at once, 3 per second on average, at random times). Top — the kurtogram picks 5250 to 6000 Hz, where the spikes live, with SK 32.7 (the SK of the band where the outer-race fault rings is below 4). It is because the rare spikes "spike more rarely" than the dense fault impacts. Middle — the envelope of that band is only a ragged floor (the vertical scale is about 1/35 of the one below), and no defect position exceeds 5.4 times the floor. Bottom — picking 2.5 to 4.5 kHz yourself by looking at the hump in the spectrum, BPFO stands at 206 times the floor. Gray dashed lines are the calculated BPFO and its multiples.',
  'Kurtogram (예시 E)': 'Kurtogram (example E)',
  '가장 큰 SK 32.7 (5250 ~ 6000 Hz) →': 'Largest SK 32.7 (5250 to 6000 Hz) →',
  '엔벨로프 · 5250 ~ 6000 Hz (Kurtogram 대역)': 'Envelope · 5250 to 6000 Hz (kurtogram band)',
  '엔벨로프 · 2.5 ~ 4.5 kHz (직접 고른 대역)': 'Envelope · 2.5 to 4.5 kHz (picked manually)',
};

export default EN;
