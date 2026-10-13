import type { Dict } from '../../translate';

/** src/figures/p5-4.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // pipeline
  '그림 2. 계산형 차수추적의 순서 (설명용: 4 Hz에서 출발해 1초에 8 Hz씩 빨라지는 축, 1X + 2X). 위: 고정 f_s로 기록한 파형과 키페이저 시각(주황 점선) — 축이 빨라질수록 펄스 사이가 좁아진다. 가운데: 키페이저 시각마다 각도가 한 바퀴씩 늘어난다는 것으로 각도-시간 곡선(파랑)을 만들고, 한 바퀴를 8등분한 각도마다 그 시각을 곡선에서 읽는다(초록 점). 아래: 그 시각에서 파형을 보간한 값을 각도 순서로 늘어놓으면 — 빨라지는 동안에도 한 바퀴마다 같은 모양이 되풀이된다.':
    'Figure 2. The sequence of computed order tracking (illustrative: a shaft starting at 4 Hz and speeding up by 8 Hz each second, 1X + 2X). Top: the waveform recorded at a fixed f_s and the Keyphasor times (orange dashed) — the faster the shaft, the closer together the pulses. Middle: using the fact that the angle grows by one revolution at each Keyphasor time, the angle-time curve (blue) is built, and for each angle that divides one revolution into 8 equal parts the time is read from the curve (green dots). Bottom: lining up the waveform values interpolated at those times in angle order — the same shape repeats every revolution even while the shaft is speeding up.',
  '① 고정 f_s 파형과 키페이저': '① Fixed-f_s waveform and Keyphasor',
  '시각 [s]': 'Time [s]',
  '② 각도-시간 관계 → 등각도의 시각': '② Angle-time relation → equal-angle times',
  '각도 [바퀴]': 'Angle [rev]',
  '③ 등각도 표본 (가로축 = 각도)': '③ Equal-angle samples (horizontal axis = angle)',
  // timeVsOrder
  '그림 1. 같은 프레임(64바퀴, 2.3 s 동안 1500 → 1844 rpm, 가속 150 rpm/s)을 두 가지로 본다. 위: 고정 f_s 그대로 Hann FFT — 1X·2X가 프레임 동안 움직여 번지고 봉우리가 낮다(1X 13.7 µm, 참값 25 µm). 고정 95 Hz 성분은 또렷하다. 아래: 키페이저로 각도에 맞춰 다시 찍은 차수 스펙트럼 — 1X 25 µm, 2X 7.99 µm로 또렷하고, 이번에는 고정 95 Hz가 차수 3.09 ~ 3.8에 걸쳐 번진다.':
    'Figure 1. The same frame (64 revolutions, 1500 → 1844 rpm over 2.3 s, acceleration 150 rpm/s) seen in two ways. Top: a Hann FFT at the fixed f_s — 1X and 2X move during the frame, so they smear and the peaks are low (1X 13.7 µm, true value 25 µm). The fixed 95 Hz component is sharp. Bottom: the order spectrum re-sampled at equal angles using the Keyphasor — 1X 25 µm and 2X 7.99 µm are sharp, and this time the fixed 95 Hz smears across orders 3.09 to 3.8.',
  '시간 기반 FFT (가로축 Hz)': 'Time-based FFT (horizontal axis in Hz)',
  '1X가 움직인 범위': 'Range 1X moved through',
  '고정 95 Hz': 'Fixed 95 Hz',
  '차수 스펙트럼 (가로축 = 차수)': 'Order spectrum (horizontal axis = order)',
  '고정 95 Hz가 번진 곳': 'Where fixed 95 Hz smears',
  '차수 (1X의 몇 배)': 'Order (multiples of 1X)',
  // orderAliasing
  '그림 3. 23X(3 µm, 날개 통과 예시)가 들어 있는 신호를 회전당 샘플 수를 바꿔 차수추적했다 (1X·2X는 위로 잘려 있다). 위: 회전당 64점 — 최대 차수 25 안이라 23X가 제자리에 2.95 µm로 선다. 가운데: 회전당 32점으로 바로 찍으면 차수 16을 넘는 23X가 32 − 23 = 9X로 접혀 2.96 µm짜리 가짜 줄이 선다 — 재샘플링도 샘플링이다 (P2-3). 아래: 회전당 256점으로 넉넉히 찍은 뒤 차수 영역에서 저역 통과하고 솎으면 가짜 9X가 사라진다(0.006 µm).':
    'Figure 3. A signal containing 23X (3 µm, a blade-pass example) order-tracked with different numbers of samples per revolution (1X and 2X are clipped at the top). Top: 64 points per revolution — within the maximum order of 25, so 23X stands in its place at 2.95 µm. Middle: sampling directly at 32 points per revolution, 23X, which is beyond order 16, folds to 32 − 23 = 9X and a fake line of 2.96 µm appears — re-sampling is also sampling (P2-3). Bottom: sampling generously at 256 points per revolution, then low-pass filtering in the order domain and decimating, removes the fake 9X (0.006 µm).',
  '회전당 64점 (최대 차수 25, 회색 점선)': '64 points per revolution (maximum order 25, gray dotted)',
  '차수': 'Order',
  '회전당 32점, 바로 찍음 (최대 차수 12.5, 회색 점선)': '32 points per revolution, sampled directly (maximum order 12.5, gray dotted)',
  '32점으로는 볼 수 없는 차수': 'Orders not visible with 32 points',
  '접히는 곳 16': 'Folding point 16',
  '가짜 9X': 'Fake 9X',
  '회전당 32점, 넉넉히 찍고 거른 뒤 솎음 (최대 차수 12.5, 회색 점선)': '32 points per revolution, sampled generously, filtered, then decimated (maximum order 12.5, gray dotted)',
  // interpolationLoss
  '그림 4. 등각도 시각의 값을 고정 f_s 표본 사이에서 보간할 때 생기는 진폭 손실 (참값 대비 %). 1X·2X는 f_s 4096 Hz에 비해 느려서 두 방법 모두 거의 손실이 없다. 23X(약 575 ~ 707 Hz)는 표본 사이에서 크게 출렁여 선형 보간(주황)이 8.1 %, 3차 보간(파랑)이 1.6 % 작게 읽는다(막대에는 차수 영역 에일리어싱 방지 필터의 몫 약 0.1 %도 들어 있다). 높은 차수를 볼수록 보간을 촘촘히(높은 f_s, 3차 이상) 해야 한다.':
    'Figure 4. Amplitude loss (% of the true value) when the values at the equal-angle times are interpolated between fixed-f_s samples. 1X and 2X are slow compared with f_s = 4096 Hz, so both methods lose almost nothing. 23X (about 575 to 707 Hz) swings a lot between samples, so linear interpolation (orange) reads 8.1 % low and cubic interpolation (blue) 1.6 % low (the bars also include about 0.1 % from the order-domain anti-aliasing filter). The higher the order you want to see, the finer the interpolation must be (high f_s, cubic or higher).',
  '선형 보간': 'Linear interpolation',
  '3차 보간': 'Cubic interpolation',
  '진폭 손실 [%]': 'Amplitude loss [%]',
  // tacholess
  '그림 5. 키페이저 없이 차수추적하기. 위: 스펙트로그램(P5-2)에서 프레임마다 가장 큰 봉우리(1X)의 주파수를 읽은 능선과 실제 회전수의 차 — 프레임 안에서 최대 3.8 rpm 어긋난다. 이 주파수를 적분해 각도를 만들고 같은 방법으로 재샘플링한다. 가운데: 1X는 키페이저(파랑) 25 µm, 능선(주황) 24.9 µm로 거의 같다. 아래: 23X는 각도 오차가 23배로 커져 능선 쪽이 번진다 — 23.00차 칸은 0.54 µm로 낮아지고, 나머지는 이웃 칸으로 흩어진다(가장 높은 칸 1.4 µm). 각도의 시작점도 알 수 없어 위상은 읽을 수 없다.':
    'Figure 5. Order tracking without a Keyphasor. Top: the difference between the ridge — the frequency of the largest peak (1X) read frame by frame in the spectrogram (P5-2) — and the actual speed; it is off by at most 3.8 rpm within the frame. This frequency is integrated to make the angle, and the data is re-sampled in the same way. Middle: 1X is almost the same, 25 µm with the Keyphasor (blue) and 24.9 µm with the ridge (orange). Bottom: for 23X the angle error grows 23-fold and the ridge result smears — the order 23.00 bin drops to 0.54 µm and the rest scatters into neighboring bins (the highest bin is 1.4 µm). The starting angle is also unknown, so the phase cannot be read.',
  '능선으로 읽은 회전수 − 실제 회전수': 'Speed read from the ridge − actual speed',
  '프레임 안 시각 [s]': 'Time within frame [s]',
  '1X 근처': 'Near 1X',
  '능선 (키페이저 없음)': 'Ridge (no Keyphasor)',
  '23X 근처': 'Near 23X',
};

export default EN;
