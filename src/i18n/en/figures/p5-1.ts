import type { Dict } from '../../translate';

/** src/figures/p5-1.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 필터의 크기 응답: 성분마다 몇 배로 남기는지를 주파수에 따라 그린 것(가로는 로그 눈금, 세로는 dB). 위: 4차 저역 통과(Butterworth, f_c = 150 Hz). 1X ~ 3X(25 ~ 75 Hz)는 0 dB 근처라 그대로 남고, 맞물림 500 Hz는 −42.5 dB(약 1/130)로 깎인다. f_c의 2배인 300 Hz에서 이미 −24.3 dB — 차수 하나에 약 6 dB씩이다. 아래: 2차 고역 통과(f_c = 5 Hz)는 반대로 낮은 쪽을 깎는다. 1 Hz 흔들림은 −28 dB, 1X는 0.9992배로 거의 그대로.':
    'Figure 1. Magnitude response of a filter: how many times each component is kept, plotted against frequency (log horizontal axis, vertical in dB). Top: 4th-order low-pass (Butterworth, f_c = 150 Hz). 1X to 3X (25 to 75 Hz) are near 0 dB and stay as they are, while the 500 Hz gear mesh is cut by −42.5 dB (about 1/130). Already at 300 Hz, twice f_c, it is −24.3 dB — about 6 dB per order. Bottom: a 2nd-order high-pass (f_c = 5 Hz) cuts the low side instead. A 1 Hz wobble is cut by −28 dB, while 1X is almost unchanged at 0.9992 times.',
  '저역 통과: 4차 Butterworth, f_c = 150 Hz (f_s = 6400 Hz)': 'Low-pass: 4th-order Butterworth, f_c = 150 Hz (f_s = 6400 Hz)',
  '통과 대역': 'Passband',
  '전이 대역': 'Transition band',
  '차단 대역': 'Stopband',
  '1X ~ 3X: 그대로': '1X to 3X: unchanged',
  '맞물림 500 Hz: −42.5 dB': 'Gear mesh 500 Hz: −42.5 dB',
  '크기 [dB]': 'Magnitude [dB]',
  '고역 통과: 2차 Butterworth, f_c = 5 Hz (f_s = 2560 Hz)': 'High-pass: 2nd-order Butterworth, f_c = 5 Hz (f_s = 2560 Hz)',
  '깎는 쪽': 'Cut side',
  '1 Hz 흔들림: −28 dB': '1 Hz wobble: −28 dB',
  '1X 25 Hz: 그대로': '1X 25 Hz: unchanged',
  // 그림 2
  '그림 2. 같은 4차, 같은 f_c = 150 Hz라도 종류에 따라 모양이 다르다. 위(통과 대역 확대): Butterworth(파랑)는 f_c 직전까지 평평하고, Chebyshev(주황)는 1 dB 안에서 오르내리며(리플, 25 Hz에서 −0.64 dB), Bessel(초록)은 일찍부터 천천히 내려간다(75 Hz에서 이미 −0.7 dB). 아래(차단 대역): 맞물림 500 Hz를 Chebyshev는 −53.9 dB, Butterworth는 −42.5 dB, Bessel은 −29.1 dB만 깎는다. Chebyshev는 가파름 대신 통과 대역의 리플을, Bessel은 고른 늦음 대신 일찍 처지는 통과 대역과 완만한 기울기를 내준다(Chebyshev의 f_c는 리플 끝인 −1 dB 점이고, −3 dB 점은 158 Hz다).':
    'Figure 2. Even with the same order (4th) and the same f_c = 150 Hz, the shape differs by type. Top (passband enlarged): Butterworth (blue) is flat until just before f_c, Chebyshev (orange) rises and falls within 1 dB (ripple, −0.64 dB at 25 Hz), and Bessel (green) starts sagging gently from early on (already −0.7 dB at 75 Hz). Bottom (stopband): at the 500 Hz gear mesh, Chebyshev cuts −53.9 dB, Butterworth −42.5 dB and Bessel only −29.1 dB. Chebyshev gives up passband ripple for steepness, and Bessel gives up an early-sagging passband and a gentle slope for even lateness (the f_c of Chebyshev is the −1 dB point at the end of the ripple, and its −3 dB point is 158 Hz).',
  '통과 대역 가까이 (세로 확대)': 'Near the passband (vertical zoom)',
  'Chebyshev (리플 1 dB)': 'Chebyshev (ripple 1 dB)',
  '차단 대역 (로그 눈금)': 'Stopband (log scale)',
  '맞물림 500 Hz': 'Gear mesh 500 Hz',
  // 그림 3
  '그림 3. 같은 세 필터의 위상(위)과 군지연(아래). 위상은 주파수가 오를수록 더 늦어진다: Butterworth는 1X(25 Hz)에서 25°, 3X(75 Hz)에서 77.8° 늦다. 군지연은 위상이 주파수에 따라 늦어지는 기울기로, 이웃 성분들의 묶음(파형의 덩어리)이 몇 ms 늦게 나오는지다(성분 하나의 늦음은 위상 지연). Bessel(초록)은 통과 대역에서 2.24 ms로 거의 평평해 모든 성분이 같이 늦고, Butterworth(파랑)는 2.8 ms에서 f_c의 3.94 ms로(최대 4.16 ms), Chebyshev(주황)는 f_c에서 8.5 ms(최대 약 8.7 ms)로 솟는다.':
    'Figure 3. Phase (top) and group delay (bottom) of the same three filters. The phase lags more as the frequency rises: Butterworth lags 25° at 1X (25 Hz) and 77.8° at 3X (75 Hz). Group delay is the slope of how the phase lag grows with frequency, that is, by how many ms a group of neighboring components (a lump of the waveform) comes out late (the lateness of a single component is the phase delay). Bessel (green) is almost flat at 2.24 ms in the passband, so all components are late together; Butterworth (blue) rises from 2.8 ms to 3.94 ms at f_c (maximum 4.16 ms); Chebyshev (orange) rises to 8.5 ms at f_c (maximum about 8.7 ms).',
  '위상 (늦은 쪽이 아래)': 'Phase (later is lower)',
  '위상 [°]': 'Phase [°]',
  '군지연: 이웃 성분들의 묶음이 몇 ms 늦게 나오나': 'Group delay: how many ms a group of neighboring components is late',
  'Bessel: 2.24 ms로 평평': 'Bessel: flat at 2.24 ms',
  '군지연 [ms]': 'Group delay [ms]',
  // 그림 4
  '그림 4. 사각파(10 Hz)의 모서리를 같은 4차, f_c = 150 Hz 필터에 통과시킨 결과. 회색이 입력이다. 위: Butterworth(파랑)는 모서리 뒤에서 10.9 % 넘쳤다가 출렁이며 자리 잡고, Bessel(초록)은 0.89 %로 거의 넘치지 않는다. 아래: Chebyshev(주황)는 21.9 %로 더 크게 출렁이고, 짝수 차수라 리플만큼 낮은 0.89(−1 dB)에 자리 잡는다. FIR(보라, 탭 101개)은 출렁임이 모서리 앞뒤로 대칭이고, 전체가 정확히 7.81 ms 늦다. 넘침과 출렁임은 f_c 근처를 가파르게 자를수록(크기), 늦음이 성분마다 다를수록(위상, 그림 3) 커진다. FIR은 늦음이 고르지만 가파르게 잘라 약 5.9 % 넘친다.':
    'Figure 4. The edge of a square wave (10 Hz) passed through the same 4th-order, f_c = 150 Hz filters. Gray is the input. Top: Butterworth (blue) overshoots by 10.9 % after the edge and rings before settling, while Bessel (green) hardly overshoots at 0.89 %. Bottom: Chebyshev (orange) rings more strongly at 21.9 % and, being an even order, settles at 0.89 (−1 dB), lower by the ripple. The FIR (purple, 101 taps) rings symmetrically before and after the edge and is late by exactly 7.81 ms overall. Overshoot and ringing grow the more steeply the filter cuts near f_c (magnitude) and the more the lateness differs between components (phase, Figure 3). The FIR has even lateness but cuts steeply, so it overshoots by about 5.9 %.',
  '입력': 'Input',
  'Chebyshev vs FIR (선형 위상)': 'Chebyshev vs FIR (linear phase)',
  'FIR (101탭)': 'FIR (101 taps)',
  '모서리부터 시간 [ms]': 'Time from the edge [ms]',
  // 그림 5
  '그림 5. 예시 기계(1500 rpm, 1X = 25 Hz)의 속도 파형에서 맞물림 500 Hz 성분을 걷어 내 1X ~ 3X 모양을 보려 한다. 위: 원래 파형(회색)과 걸러서 얻고 싶은 목표(초록 점선). 아래: 4차 Butterworth로 한 번 거르면(파랑) 모양은 목표와 비슷하지만 전체가 약 2.8 ms 늦다 — 1X로 치면 위상 25°다. 두 번 거르면(초록 실선, §3) 목표와 겹친다.':
    'Figure 5. In the velocity waveform of the example machine (1500 rpm, 1X = 25 Hz), we want to remove the 500 Hz gear-mesh component to see the shape of 1X to 3X. Top: the original waveform (gray) and the target we want from filtering (green dotted line). Bottom: filtering once with a 4th-order Butterworth (blue) gives a shape similar to the target, but the whole thing is about 2.8 ms late — a phase of 25° at 1X. Filtering twice (solid green, §3) overlaps the target.',
  '원래 파형과 목표 (1X ~ 3X)': 'Original waveform and target (1X to 3X)',
  '원래 (맞물림 포함)': 'Original (with gear mesh)',
  '목표: 1X ~ 3X': 'Target: 1X to 3X',
  '4차 Butterworth 저역 통과 (f_c = 150 Hz)': '4th-order Butterworth low-pass (f_c = 150 Hz)',
  '목표': 'Target',
  '한 번 거름': 'Filtered once',
  '두 번 거름': 'Filtered twice',
  // 그림 6
  '그림 6. 같은 4차 Butterworth를 한 번(파랑)과 앞뒤로 두 번(초록) 걸었을 때. 위: 두 번 거르면 크기는 제곱이 되어 dB로는 두 배다. f_c에서 −3 dB가 −6 dB가 되고, 500 Hz는 −42.5 → −85 dB. 아래: 앞으로 늦춘 만큼 거꾸로 거르며 당겨서 위상은 모든 주파수에서 0이다.':
    'Figure 6. The same 4th-order Butterworth applied once (blue) and forward-backward twice (green). Top: filtering twice squares the magnitude, which doubles it in dB. At f_c, −3 dB becomes −6 dB, and 500 Hz goes from −42.5 to −85 dB. Bottom: filtering backward pulls back by as much as the forward pass delayed, so the phase is 0 at every frequency.',
  '크기': 'Magnitude',
  '한 번': 'Once',
  '두 번 (앞뒤로)': 'Twice (forward-backward)',
  'f_c = 150 Hz에서 한 번 −3 dB, 두 번 −6 dB': 'At f_c = 150 Hz: once −3 dB, twice −6 dB',
  '위상': 'Phase',
  // 그림 7
  '그림 7. 가속도 진폭 1 m/s²인 성분이 적분하면 얼마가 되는지를 주파수에 따라 그렸다(양쪽 로그 눈금). 위: 속도 = 가속도 ÷ 2πf. 주파수가 10배 낮아질 때마다 10배 커진다(−20 dB/디케이드). 아래: 변위 = 가속도 ÷ (2πf)², 10배마다 100배. 적분은 낮은 주파수를 키우는 필터다. 초록 점선은 5 Hz 고역 통과를 함께 건 것으로, 5 Hz 아래에서 키움을 멈추게 한다.':
    'Figure 7. What a component of acceleration amplitude 1 m/s² becomes after integration, plotted against frequency (log-log). Top: velocity = acceleration ÷ 2πf. It grows 10 times for every 10 times lower frequency (−20 dB/decade). Bottom: displacement = acceleration ÷ (2πf)², 100 times per 10 times. Integration is a filter that boosts low frequencies. The green dotted line adds a 5 Hz high-pass, which stops the boost below 5 Hz.',
  '가속도 → 속도: × 1/(2πf)': 'Acceleration → velocity: × 1/(2πf)',
  '적분만': 'Integration only',
  '적분 + 5 Hz 고역 통과': 'Integration + 5 Hz high-pass',
  '가속도 → 변위: × 1/(2πf)²': 'Acceleration → displacement: × 1/(2πf)²',
  '두 번 + 5 Hz 고역 통과': 'Twice + 5 Hz high-pass',
  // 그림 8
  '그림 8. 예시 가속도(1X 25 Hz, 2X, 맞물림 500 Hz + 켠 직후의 낮은 주파수 흔들림 0.01 g)를 주파수 영역에서 적분한 속도 스펙트럼. 위: 하한 컷오프가 없으면(주황) 5 Hz 아래가 최대 18.2 mm/s로 솟아 1X(3.99 mm/s)보다 크다 — P3-4의 ski-slope다. 5 Hz 고역 통과(파랑)를 함께 걸면 0.71 mm/s로 내려간다. 아래: 컷오프를 20 Hz로 올리면(주황) ski-slope는 더 줄지만 1X도 3.98 → 3.36 mm/s로 깎인다.':
    'Figure 8. Velocity spectrum from integrating the example acceleration (1X 25 Hz, 2X, 500 Hz gear mesh + a low-frequency wobble of 0.01 g just after startup) in the frequency domain. Top: with no low cutoff (orange), below 5 Hz it rises to a maximum of 18.2 mm/s, larger than 1X (3.99 mm/s) — the ski slope of P3-4. Adding a 5 Hz high-pass (blue) brings it down to 0.71 mm/s. Bottom: raising the cutoff to 20 Hz (orange) reduces the ski slope further, but 1X is also cut from 3.98 to 3.36 mm/s.',
  '속도 스펙트럼 (양쪽 로그 눈금)': 'Velocity spectrum (log-log)',
  '컷오프 없음': 'No cutoff',
  '5 Hz 고역 통과': '5 Hz high-pass',
  '속도 [mm/s pk]': 'Velocity [mm/s pk]',
  '1X 근처 (선형 눈금): 컷오프 5 Hz vs 20 Hz': 'Near 1X (linear scale): cutoff 5 Hz vs 20 Hz',
  '20 Hz 고역 통과': '20 Hz high-pass',
  '실제 1X 4 mm/s': 'True 1X 4 mm/s',
  // 그림 9
  '그림 9. 같은 기계 가속도에 직류 오프셋 0.0005 g(4.9 mm/s²)만 있을 때, 샘플을 차례로 더해(누적합) 적분했다. 위: 오프셋이 속도를 1초에 4.9 mm/s씩 끌고 가서 2초 동안 9.81 mm/s 떠내려간다(주황). 누적합은 처음 속도를 모르므로 곡선 전체가 약 4.2 mm/s 아래로 밀려 있기도 하다. 5 Hz 고역 통과를 먼저 걸면(파랑) 실제 속도 범위(±6.3 mm/s) 근처에 머문다. 아래: 한 번 더 적분한 변위는 두 오차가 다시 쌓여 2초 안에 1.85 mm까지 벗어나지만(실제 변위는 30 µm Peak 남짓, 약 61 µm p-p), 고역 통과를 먼저 건 쪽은 1초 뒤부터 28 µm 안이다.':
    'Figure 9. The same machine acceleration with only a DC offset of 0.0005 g (4.9 mm/s²), integrated by adding up the samples one after another (cumulative sum). Top: the offset drags the velocity by 4.9 mm/s every second, so it drifts away by 9.81 mm/s over 2 seconds (orange). The cumulative sum also does not know the initial velocity, so the whole curve is shifted down by about 4.2 mm/s. With a 5 Hz high-pass applied first (blue), it stays near the real velocity range (±6.3 mm/s). Bottom: integrating once more piles the two errors up again, and the displacement strays up to 1.85 mm within 2 seconds (the real displacement is a little over 30 µm peak, about 61 µm p-p), while the high-pass-first trace stays within 28 µm after the first second.',
  '속도 (가속도를 한 번 누적합)': 'Velocity (cumulative sum of acceleration once)',
  '그대로 적분': 'Integrated as is',
  '5 Hz 고역 통과 후 적분': 'Integrated after 5 Hz high-pass',
  '변위 (한 번 더 누적합)': 'Displacement (cumulative sum once more)',
  '변위 [mm]': 'Displacement [mm]',
  // 그림 10
  '그림 10. f_s = 12 800 Hz로 잰 신호(100 Hz와 1300 Hz)를 8개마다 하나만 남겨 f_s = 1600 Hz로 줄인다(데시메이션). 새 나이퀴스트 주파수는 800 Hz다. 가운데: 거르지 않고 줄이면 1300 Hz가 |1300 − 1600| = 300 Hz로 접혀 가짜 막대(0.5)가 선다 — P2-3의 에일리어싱과 같다. 아래: 저역 통과를 먼저 걸고 줄이면 가짜 막대가 없다.':
    'Figure 10. A signal measured at f_s = 12 800 Hz (100 Hz and 1300 Hz) is thinned to one sample in every 8, reducing f_s to 1600 Hz (decimation). The new Nyquist frequency is 800 Hz. Middle: reducing without filtering folds 1300 Hz to |1300 − 1600| = 300 Hz and a fake bar (0.5) appears — the same as the aliasing of P2-3. Bottom: filtering with a low-pass first and then reducing leaves no fake bar.',
  '원래 (f_s = 12 800 Hz)': 'Original (f_s = 12 800 Hz)',
  '새 나이퀴스트 800 Hz': 'New Nyquist 800 Hz',
  '거르지 않고 8개마다 하나 (f_s = 1600 Hz)': 'One in every 8, unfiltered (f_s = 1600 Hz)',
  '300 Hz: 접혀 온 가짜': '300 Hz: fake, folded in',
  '저역 통과 후 8개마다 하나': 'One in every 8 after low-pass',
};

export default EN;
