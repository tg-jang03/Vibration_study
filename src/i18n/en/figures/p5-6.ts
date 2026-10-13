import type { Dict } from '../../translate';

/** src/figures/p5-6.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 외륜에 흠이 있는 6205 베어링(3000 rpm, BPFO 179.2 Hz)의 하우징 가속도 — 설명용 예시. 위: 파형 40 ms. 1200 Hz 기어 맞물림과 잡음이 커서 충격(회색 점선 = BPFO 박자)이 잘 드러나지 않는다. 가운데: 0 ~ 8 kHz 스펙트럼(dB). 가장 큰 것은 기어 맞물림(1 g)이고, 결함이 울리는 3.3 kHz 언덕은 0.045 g로 낮다. 아래: 0 ~ 1000 Hz. BPFO와 그 하모닉 자리(주황 점선)에는 0.01 g 남짓(BPFO 0.009 g)으로 거의 아무것도 없다(1X는 0.099 g).':
    'Figure 1. Housing acceleration of a 6205 bearing with an outer-race defect (3000 rpm, BPFO 179.2 Hz) — an illustrative example. Top: 40 ms of waveform. The 1200 Hz gear mesh and the noise are large, so the impacts (gray dashed lines = BPFO rhythm) hardly show. Middle: spectrum from 0 to 8 kHz (dB). The largest thing is the gear mesh (1 g); the 3.3 kHz hump rung by the fault is low at 0.045 g. Bottom: 0 to 1000 Hz. At BPFO and its harmonics (orange dashed lines) there is barely 0.01 g (BPFO 0.009 g) — almost nothing (1X is 0.099 g).',
  '① 파형 (40 ms)': '① Waveform (40 ms)',
  '시각 [ms]': 'Time [ms]',
  '② 스펙트럼 0 ~ 8 kHz (dB re 1 g)': '② Spectrum 0 – 8 kHz (dB re 1 g)',
  '기어 맞물림 1200 Hz': 'Gear mesh 1200 Hz',
  '결함이 울리는 곳': 'Fault rings here',
  '다른 원인의 잡음': 'Other noise',
  '③ 0 ~ 1000 Hz (선형)': '③ 0 – 1000 Hz (linear)',
  // 그림 2
  '그림 2. 엔벨로프 분석. 위: 그림 1의 신호를 2800 ~ 3800 Hz만 남기면(파랑) 충격마다 울림이 솟는다. 그 바깥 꼭대기를 이은 포락선(주황)은 5.58 ms마다 되풀이된다. 아래: 포락선의 스펙트럼(엔벨로프 스펙트럼). BPFO 179.2 Hz에 0.11 g, 2배·3배에 0.072·0.026 g의 줄이 선다 — 바닥(0.0006 g)의 약 180배다.':
    'Figure 2. Envelope analysis. Top: keep only 2800 to 3800 Hz of the signal of Figure 1 (blue) and the ringing jumps up at every impact. The envelope connecting its outer peaks (orange) repeats every 5.58 ms. Bottom: the spectrum of the envelope (envelope spectrum). Lines stand at BPFO 179.2 Hz with 0.11 g and at 2× and 3× with 0.072 and 0.026 g — about 180 times the floor (0.0006 g).',
  '① 2800 ~ 3800 Hz 대역 신호와 포락선': '① 2800 – 3800 Hz band signal and envelope',
  '② 엔벨로프 스펙트럼': '② Envelope spectrum',
  // 그림 3
  '그림 3. 울림 하나의 포락선을 구하는 법. 파랑은 대역 신호 x, 초록 점선은 x의 모든 성분을 90° 늦춘 힐베르트 변환 H{x}(cos → sin)다. 둘을 실수부·허수부로 삼은 복소수(해석 신호)의 크기 √(x² + H{x}²)가 주황 포락선이다. x가 0을 지날 때도 H{x}가 꼭대기에 있어서, 크기는 출렁임 없이 바깥 꼭대기를 매끄럽게 잇는다.':
    'Figure 3. How to get the envelope of a single ringing. Blue is the band signal x; the green dashed line is the Hilbert transform H{x}, with every component of x delayed by 90° (cos → sin). The magnitude √(x² + H{x}²) of the complex number that takes the two as real and imaginary parts (the analytic signal) is the orange envelope. Even when x crosses zero, H{x} is at a peak, so the magnitude connects the outer peaks smoothly without rippling.',
  'H{x} (90° 늦춤)': 'H{x} (90° delay)',
  'x (대역 신호)': 'x (band signal)',
  '포락선 √(x² + H{x}²)': 'Envelope √(x² + H{x}²)',
  // 그림 4
  '그림 4. 같은 신호를 대역만 바꿔 엔벨로프 분석했다 (세 그래프의 세로 눈금이 같다). 위: 기어 맞물림 대역(700 ~ 1700 Hz) — 1X(50 Hz) 줄 하나가 0.3 g로 눈금 밖까지 솟는다(기어 맞물림의 크기가 1X로 오르내리기 때문, P2-8). BPFO 자리에는 줄이 없다. 가운데: 다른 원인의 잡음 대역(5500 ~ 6500 Hz) — 줄이 없다(BPFO 자리 0.008 g). 아래: 결함이 울리는 대역(2800 ~ 3800 Hz) — BPFO 하모닉이 선다. 대역을 잘못 고르면 결함이 있어도 보이지 않거나, 다른 원인의 줄을 결함으로 오해할 수 있다.':
    'Figure 4. Envelope analysis of the same signal with only the band changed (the three graphs share the same vertical scale). Top: gear-mesh band (700 to 1700 Hz) — a single 1X (50 Hz) line shoots up to 0.3 g, off the scale (because the size of the gear mesh rises and falls at 1X, P2-8). There is no line at BPFO. Middle: noise band from another source (5500 to 6500 Hz) — no lines (0.008 g at BPFO). Bottom: band the fault rings (2800 to 3800 Hz) — the BPFO harmonics stand. With the wrong band, a fault can stay invisible, or a line from another cause can be mistaken for a fault.',
  '700 ~ 1700 Hz: 기어 맞물림': '700 – 1700 Hz: gear mesh',
  '5500 ~ 6500 Hz: 다른 원인의 잡음': '5500 – 6500 Hz: noise from another source',
  '2800 ~ 3800 Hz: 결함이 울리는 곳': '2800 – 3800 Hz: where the fault rings',
  // 그림 5
  '그림 5. 내륜 결함의 엔벨로프 스펙트럼 (외륜과 같은 결함 대역 2800 ~ 3800 Hz). 결함이 축과 함께 돌며 하중을 받는 아래쪽을 1X마다 드나들어, 충격 크기가 1X 박자로 오르내린다. 그래서 BPFI(270.8 Hz, 0.068 g) 양옆에 1X 간격의 측대역(0.036·0.027 g)이 서고, 1X 자체(0.065 g)도 선다 — P2-8의 진폭 변조다.':
    'Figure 5. Envelope spectrum of an inner-race fault (same fault band as the outer race, 2800 to 3800 Hz). The defect turns with the shaft and passes in and out of the loaded lower side once every 1X, so the impact size rises and falls at the 1X rhythm. That is why 1X-spaced sidebands (0.036 and 0.027 g) stand on both sides of BPFI (270.8 Hz, 0.068 g), and 1X itself (0.065 g) stands too — the amplitude modulation of P2-8.',
  // 그림 6
  '그림 6. RMS가 모두 1인 세 신호의 첨도 K. 정규분포 잡음(위)은 2.93, 정현파(가운데)는 1.5, 드문드문 울리는 충격(아래)은 17.9이다. 크기(RMS)는 같아도, 드물게 크게 튀는 값이 많을수록 K가 커진다.':
    'Figure 6. Kurtosis K of three signals, all with an RMS of 1. Gaussian noise (top) is 2.93, a sine (middle) is 1.5, and sparse ringing impacts (bottom) are 17.9. Even at the same size (RMS), the more rare large spikes there are, the larger K becomes.',
  '정규분포 잡음 — K = 2.93': 'Gaussian noise — K = 2.93',
  '정현파 — K = 1.5': 'Sine — K = 1.5',
  '충격 (25 Hz마다) — K = 17.9': 'Impacts (every 25 Hz) — K = 17.9',
  // 그림 7
  '그림 7. 같은 신호를 짧은 프레임(64점, 3.9 ms — 충격 간격 5.58 ms보다 짧게)으로 잘라 본 두 가지. 위: 평균 파워(dB, 가장 큰 곳 = 0). 기어 맞물림(1200·2400 Hz)과 5 ~ 7 kHz 잡음이 크다. 아래: 주파수마다의 첨도(Spectral Kurtosis). 잡음 대역은 0 근처, 크기가 거의 일정한 기어 맞물림은 음수(−0.8쯤)이고, 결함이 울리는 2.8 ~ 4.5 kHz만 양수로 솟는다. 크기가 큰 대역과 충격이 있는 대역은 다르다.':
    'Figure 7. Two views of the same signal cut into short frames (64 points, 3.9 ms — shorter than the 5.58 ms impact interval). Top: average power (dB, largest = 0). The gear mesh (1200 and 2400 Hz) and the 5 to 7 kHz noise are large. Bottom: kurtosis at each frequency (spectral kurtosis). The noise band is near 0, the gear mesh of almost constant size is negative (about −0.8), and only the 2.8 to 4.5 kHz band the fault rings rises positive. The band with the largest size and the band with the impacts are different.',
  '① 평균 파워 (dB)': '① Average power (dB)',
  '정규 잡음 = 0': 'Gaussian noise = 0',
  // 그림 8
  '그림 8. Kurtogram: 세로는 대역폭(위로 갈수록 넓다: 레벨 k의 폭 = 8192/2^k Hz), 가로는 대역의 가운데 주파수(칸은 반 칸씩 겹쳐 옮기므로 색 하나가 그 가운데 근처를 칠한다), 색의 진하기는 그 대역 포락선의 첨도(SK, 0 이하는 칠하지 않음)다. 가장 진한 칸은 레벨 3의 2560 ~ 3584 Hz(폭 1024 Hz, SK 1.01)로, 결함이 울리는 3.3 kHz를 담는다. 이 대역으로 엔벨로프 분석하면 BPFO 줄이 바닥의 150배로 선다.':
    'Figure 8. Kurtogram: the vertical axis is the band width (wider toward the top: width at level k = 8192/2^k Hz), the horizontal axis is the band center frequency (cells move in overlapping half-cell steps, so each color paints the area around its center), and the color depth is the kurtosis of that band\'s envelope (SK; values of 0 or below are not colored). The darkest cell is 2560 to 3584 Hz at level 3 (width 1024 Hz, SK 1.01), which contains the 3.3 kHz the fault rings. Envelope analysis with this band makes the BPFO line stand 150 times the floor.',
  '가장 큰 SK 1.01 (2560 ~ 3584 Hz) →': 'Largest SK 1.01 (2560 – 3584 Hz) →',
  '대역 가운데 주파수 [Hz]': 'Band center frequency [Hz]',
  '대역폭 [Hz]': 'Band width [Hz]',
};

export default EN;
