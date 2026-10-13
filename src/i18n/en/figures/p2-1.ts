import type { Dict } from '../../translate';

/** src/figures/p2-1.ts 그림의 영어 (D-054). 페이지 본문에서 번호를 바꿔 쓰는 그림(그림 3~7)은 영어 MDX가 caption을 직접 넘긴다. */
const EN: Dict = {
  '그림 1. 3600 rpm으로 도는 기계의 케이싱 진동 (예시로 만든 신호). 가로축은 시간, 세로축은 그 순간의 진동 속도다. 0.1초 동안 큰 물결이 6번 반복된다 — 1초에 60번, 회전과 같은 박자다. 큰 물결 위의 잔물결과 들쭉날쭉함은 다른 성분과 잡음이다.':
    'Figure 1. Casing vibration of a machine running at 3600 rpm (a made-up signal). The horizontal axis is time and the vertical axis is the vibration velocity at that instant. The large wave repeats 6 times in 0.1 s — 60 times a second, the same beat as the rotation. The ripples and jaggedness on top of the large wave are other components and noise.',
  '속도 [mm/s]': 'Velocity [mm/s]',

  '그림 2. 같은 움직임을 세 가지 양으로 본 모습. 느린 흔들림(60 Hz, 변위 50 µm)과 아주 작은 빠른 떨림(600 Hz, 변위 0.5 µm)이 섞여 있다. 변위로 보면 빠른 떨림은 거의 안 보이지만, 속도에서는 잔물결로, 가속도에서는 느린 흔들림과 같은 크기(7.11 m/s²)로 드러난다. 미분할 때마다 성분이 주파수에 비례해 커지기 때문이다.':
    'Figure 2. The same motion seen as three quantities. A slow shake (60 Hz, displacement 50 µm) is mixed with a very small fast tremor (600 Hz, displacement 0.5 µm). In displacement the fast tremor is hardly visible, but in velocity it shows up as ripples, and in acceleration it appears as large as the slow shake (7.11 m/s²). This is because each differentiation makes a component grow in proportion to its frequency.',
  '변위 d [µm]': 'Displacement d [µm]',
  '속도 v [mm/s]': 'Velocity v [mm/s]',
  '가속도 a [m/s²]': 'Acceleration a [m/s²]',

  '그림 3. 정현파 x(t) = A cos(2πft). 진폭 A는 가운데(0)에서 꼭대기까지의 높이, 주기 T는 같은 모양이 다시 시작될 때까지 걸리는 시간이다. 이 예는 T = 0.2 s이므로 1초에 5번 반복한다 → 주파수 f = 1/T = 5 Hz.':
    'Figure 3. A sine wave x(t) = A cos(2πft). The amplitude A is the height from the middle (0) to the top, and the period T is the time until the same shape starts again. In this example T = 0.2 s, so it repeats 5 times a second → frequency f = 1/T = 5 Hz.',
  '주기 T = 0.2 s': 'Period T = 0.2 s',
  '진폭 A': 'Amplitude A',

  '그림 4. 위상은 같은 주파수의 두 정현파가 시간상 얼마나 어긋났는지를 각도로 나타낸다. 한 주기 = 360°. 위: 꼭대기가 T/4(= 0.05 s)만큼 늦게 온다 → 90° 늦음. 아래: 반 주기 어긋나 위아래가 뒤집혔다 → 180° = 부호가 반대.':
    'Figure 4. Phase expresses, as an angle, how far two sine waves of the same frequency are offset in time. One period = 360°. Top: the peak arrives T/4 (= 0.05 s) later → 90° late. Bottom: offset by half a period, so it is turned upside down → 180° = opposite sign.',
  '90° 늦은 정현파': 'Sine 90° late',
  '기준 (φ = 0°)': 'Reference (φ = 0°)',
  'φ = −90° (90° 늦음)': 'φ = −90° (90° late)',
  '180° 어긋난 정현파': 'Sine 180° off',
  'φ = 180° (부호 반대)': 'φ = 180° (opposite sign)',

  '그림 5. 가로축을 시간 대신 "축이 돈 각도"로 그렸다. 1X는 축이 한 바퀴(360°) 돌 때 한 번 흔들리고, 2X는 두 번 흔들린다. 회전수가 바뀌어도 이 관계는 그대로라서, 회전 주파수의 몇 배인지(차수)로 성분을 부른다.':
    'Figure 5. The horizontal axis is drawn as "the angle the shaft has turned" instead of time. 1X shakes once while the shaft makes one turn (360°), and 2X shakes twice. This relation holds even when the speed changes, so we name components by how many times the rotating frequency they are (the order).',
  '1X: 한 바퀴에 1번': '1X: once per turn',
  '2X: 한 바퀴에 2번': '2X: twice per turn',
  '한 바퀴': 'One turn',
  '두 바퀴': 'Two turns',
  '축 회전각 [°]': 'Shaft angle [°]',

  '그림 6. 같은 정현파(진폭 A = 1)를 숫자 하나로 나타내는 세 방법. Peak는 0에서 꼭대기까지(1), Pk-Pk는 바닥에서 꼭대기까지(2), RMS는 "평균적인 크기"(0.707)다. 정현파에서만 RMS = Peak/√2가 성립한다.':
    'Figure 6. Three ways to express the same sine wave (amplitude A = 1) as one number. Peak is from 0 to the top (1), Pk-Pk is from the bottom to the top (2), and RMS is the "average size" (0.707). RMS = Peak/√2 holds only for a sine wave.',

  '그림 7. 두 신호의 RMS는 똑같이 1이다. 위의 정현파는 Peak 1.41 → Crest factor 1.41. 아래는 짧은 충격이 0.1초마다 섞인 신호로 Peak 6.87 → Crest factor 6.87. RMS만 보면 같은 크기이지만 모양은 전혀 다르다 — Crest factor가 이 차이를 잡아낸다.':
    'Figure 7. Both signals have an RMS of exactly 1. The sine wave on top has Peak 1.41 → crest factor 1.41. Below, a signal with a short impact mixed in every 0.1 s has Peak 6.87 → crest factor 6.87. By RMS alone they are the same size, but the shapes are completely different — the crest factor catches this difference.',
  '정현파: CF = 1.41': 'Sine wave: CF = 1.41',
  '충격이 섞인 신호: CF = 6.87': 'Signal with impacts: CF = 6.87',

  '그림 8. (위) 세 정현파가 더해진 시간파형 — 이것만 보고 성분을 알아내기는 어렵다. (가운데) 같은 신호를 성분별로 나누면 60·120·180 Hz 정현파 세 개다. (아래) 스펙트럼은 이 성분표를 그래프로 그린 것이다: 가로축 = 각 성분의 주파수, 세로축 = 그 진폭(Peak).':
    'Figure 8. (Top) The time waveform of three sine waves added together — it is hard to find the components from this alone. (Middle) Split into components, the same signal is three sine waves at 60, 120 and 180 Hz. (Bottom) The spectrum is a graph of this component list: horizontal axis = frequency of each component, vertical axis = its amplitude (Peak).',
  '시간파형 (섞인 신호)': 'Time waveform (mixed signal)',
  '성분으로 나누면': 'Split into components',
  '스펙트럼 (성분표)': 'Spectrum (component list)',
  '60 Hz, 진폭 5': '60 Hz, amplitude 5',
  '120 Hz, 진폭 2': '120 Hz, amplitude 2',
  '180 Hz, 진폭 1': '180 Hz, amplitude 1',
  '진폭': 'Amplitude',

  '그림 9. 분석기는 연속 신호(회색 선)를 일정한 간격 Δt마다 읽어 숫자(점)로 저장한다. 이 예는 1초에 100번 읽으므로 샘플링 주파수 f_s = 100 Hz, 샘플 간격 Δt = 1/f_s = 0.01 s다. n번째 샘플을 x[n]이라고 쓴다.':
    'Figure 9. The analyzer reads a continuous signal (gray line) at regular intervals Δt and stores it as numbers (dots). This example reads 100 times a second, so the sampling frequency is f_s = 100 Hz and the sample interval is Δt = 1/f_s = 0.01 s. The n-th sample is written x[n].',
  '연속 신호 x(t)': 'Continuous signal x(t)',
  '샘플 x[n]': 'Sample x[n]',

  '그림 10. 같은 10 Hz 신호를 두 속도로 읽었다. 위: 1초에 100번(한 주기에 10개) 읽으면 점을 이었을 때 원래 모양이 살아 있다. 아래: 1초에 12번(한 주기에 1.2개)만 읽으면 점들이 느린 2 Hz 물결(점선)을 그린다 — 실제로는 없는 주파수가 보이는 에일리어싱이다. 한 주기에 샘플이 2개보다 많아야 한다(P2-3에서 자세히).':
    'Figure 10. The same 10 Hz signal read at two rates. Top: reading 100 times a second (10 per period), the original shape survives when you connect the dots. Bottom: reading only 12 times a second (1.2 per period), the dots draw a slow 2 Hz wave (dotted line) — aliasing, where a frequency that is not really there appears. You need more than 2 samples per period (details in P2-3).',
  'f_s = 100 Hz: 한 주기에 샘플 10개 → 원래 모양 그대로': 'f_s = 100 Hz: 10 samples per period → original shape kept',
  'f_s = 12 Hz: 한 주기에 1.2개 → 2 Hz처럼 보인다 (에일리어싱)': 'f_s = 12 Hz: 1.2 per period → looks like 2 Hz (aliasing)',
  '점이 그리는 가짜 2 Hz': 'Fake 2 Hz drawn by the dots',
};

export default EN;
