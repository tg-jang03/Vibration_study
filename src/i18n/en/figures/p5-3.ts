import type { Dict } from '../../translate';

/** src/figures/p5-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 받침대에 랜덤 힘을 주고 응답을 잰 한 프레임(예시: 80 Hz·210 Hz 두 공진, 그 사이 106 Hz에 반공진). 위: 힘 스펙트럼은 bin마다 들쭉날쭉하다. 가운데: 응답은 두 공진에서 솟는다. 아래: 둘을 나눈 크기(파랑)는 공진 근처에서는 참 FRF(회색 점선)와 비슷하지만, 응답이 작은 반공진 근처에서는 응답 쪽 잡음(응답의 평균 크기의 10 %)이 몇 배로 커져 1.35(참값 0.177)이 된다.':
    'Figure 1. One frame of a pedestal excited by a random force with the response measured (example: two resonances at 80 Hz and 210 Hz, with an antiresonance at 106 Hz between them). Top: the force spectrum is ragged from bin to bin. Middle: the response rises at the two resonances. Bottom: the magnitude of their quotient (blue) is close to the true FRF (gray dashed) near the resonances, but near the antiresonance, where the response is small, the response-side noise (10 % of the mean response magnitude) is amplified several times and the quotient becomes 1.35 (true value 0.177).',
  '힘 (입력) 한 프레임': 'Force (input), one frame',
  '응답 (출력) 한 프레임': 'Response (output), one frame',
  '응답 ÷ 힘 (한 프레임) vs 참 FRF': 'Response ÷ force (one frame) vs true FRF',
  '참 FRF': 'True FRF',
  '응답 ÷ 힘': 'Response ÷ force',
  '반공진 106 Hz': 'Antiresonance 106 Hz',
  // 그림 2
  '그림 2. 프레임 16장 각각의 "응답 ÷ 힘"을 화살표로 그렸다(회색, 가로 = 실수부, 세로 = 허수부). 위(80 Hz 공진): 화살표가 한 방향(약 −90°)으로 모여 평균(주황)이 참값(초록 점)과 겹친다. 아래(106 Hz 반공진): 응답이 작아 잡음이 대부분이라 화살표가 사방으로 흩어진다(그림 밖으로 나가는 화살표는 끝을 잘랐다). 교차 스펙트럼은 힘을 위상 기준으로 삼아 이 화살표들을 (힘이 큰 프레임에 더 큰 무게 |X|²를 주어) 평균하는 것이다 — P2-6의 벡터 평균과 같고, 트리거가 필요 없다.':
    'Figure 2. The "response ÷ force" of each of 16 frames drawn as an arrow (gray; horizontal = real part, vertical = imaginary part). Top (80 Hz resonance): the arrows gather in one direction (about −90°), so the average (orange) coincides with the true value (green dot). Bottom (106 Hz antiresonance): the response is small and mostly noise, so the arrows scatter in all directions (arrows leaving the plot are clipped). The cross spectrum uses the force as the phase reference and averages these arrows (giving frames with larger force more weight |X|²) — the same as the vector average of P2-6, with no trigger needed.',
  '80 Hz (공진)': '80 Hz (resonance)',
  '평균 16.6 · 참값 16.7': 'Mean 16.6 · true 16.7',
  실수부: 'Real part',
  허수부: 'Imaginary part',
  '106 Hz (반공진)': '106 Hz (antiresonance)',
  '초록 점 = 참값 0.18, 주황 = 평균': 'Green dot = true 0.18, orange = mean',
  // 그림 3
  '그림 3. 같은 받침대를 64장 평균해 H1(파랑)과 H2(주황)로 추정했다. 위(응답 쪽 잡음 10 %): H1은 참 FRF(회색 점선)를 따라가고(반공진 근처는 흔들리지만 한쪽으로 쏠리지 않는다), H2는 응답이 작은 반공진에서 3.33(참값 0.177)로 크게 부푼다(평균을 늘려도 참값이 아니라 약 1.6 둘레로 모인다). 가운데(힘 쪽 잡음 30 %): 이번에는 H2가 맞고, H1이 모든 주파수에서 1/(1 + 0.3²) = 0.92배로 낮다(80 Hz: 15.4, 참값 16.7). 아래: H1의 위상(응답 쪽 잡음 경우). 공진마다 위상이 180°씩 늦어지고(P1-4), 반공진에서 다시 돌아오며, 잡음이 큰 반공진 근처만 흔들린다.':
    'Figure 3. The same pedestal estimated with H1 (blue) and H2 (orange) from 64 averages. Top (10 % noise on the response): H1 follows the true FRF (gray dashed; it scatters near the antiresonance but is not biased to one side), while H2 balloons to 3.33 (true value 0.177) at the antiresonance where the response is small (with more averages it converges to about 1.6, not to the true value). Middle (30 % noise on the force): this time H2 is right and H1 is low by a factor of 1/(1 + 0.3²) = 0.92 at every frequency (80 Hz: 15.4, true 16.7). Bottom: the phase of H1 (response-noise case). The phase lags by another 180° at each resonance (P1-4), comes back at the antiresonance, and scatters only near the noisy antiresonance.',
  '응답 쪽 잡음 10 %': 'Response noise 10 %',
  '힘 쪽 잡음 30 %': 'Force noise 30 %',
  'H1의 위상 (응답 쪽 잡음 10 %)': 'Phase of H1 (response noise 10 %)',
  // 그림 4
  '그림 4. 같은 측정(응답 쪽 잡음 10 %)의 코히어런스 γ². 한 장(M = 1, 회색)은 모든 주파수에서 정확히 1이라 아무것도 알려 주지 않는다. 16장(주황)과 256장(파랑)으로 평균하면 공진 근처는 1에 가깝고(80 Hz: 0.999), 응답이 작은 반공진에서는 16장 0.22, 256장 0.081로 낮다(이론값 약 0.11). 그 주파수의 응답은 힘으로 설명되지 않는 몫(잡음)이 크다는 뜻이다. 평균이 적으면 코히어런스는 실제보다 높게, 크게 흔들려 나온다.':
    'Figure 4. The coherence γ² of the same measurement (response noise 10 %). With one frame (M = 1, gray) it is exactly 1 at every frequency and tells you nothing. Averaged over 16 frames (orange) and 256 frames (blue), it is close to 1 near the resonances (80 Hz: 0.999) and low at the antiresonance where the response is small: 0.22 with 16 and 0.081 with 256 (theoretical value about 0.11). It means the response at that frequency has a large share (noise) not explained by the force. With few averages, coherence comes out higher than the real value and scatters widely.',
  반공진: 'Antiresonance',
  // 그림 5
  '그림 5. X·Y 센서가 모두 1X(50 Hz)를 진폭 50 µm로 읽는 네 경우. 둘의 반쪽 스펙트럼은 네 경우 모두 50 Hz에 50 µm 막대 하나씩으로 똑같다. 다른 것은 X와 Y의 위상차뿐이다. z = x + jy를 FFT한 Full spectrum은 오른쪽(+)에 반시계로 도는 원, 왼쪽(−)에 시계로 도는 원의 반지름을 보인다(오빗은 초록, 점은 시작, 화살표는 도는 방향). 원은 한쪽에만(50 µm), 타원은 양쪽에 다른 크기(46.2·19.1 µm), 직선은 양쪽이 같은 크기(35.4 µm)로 선다 — P4-2의 정방향·역방향 반지름 Af·Ab를 데이터에서 계산한 것이다.':
    'Figure 5. Four cases in which the X and Y sensors both read 1X (50 Hz) with an amplitude of 50 µm. The half spectra of the two are the same in all four cases: one 50 µm bar at 50 Hz each. The only difference is the phase difference between X and Y. The full spectrum, the FFT of z = x + jy, shows the radius of the counterclockwise circle on the right (+) and of the clockwise circle on the left (−) (orbit in green, dot = start, arrow = direction of travel). A circle stands on one side only (50 µm), an ellipse on both sides with different sizes (46.2 and 19.1 µm), and a straight line with equal sizes on both sides (35.4 µm) — this is the forward and reverse radii Af and Ab of P4-2 computed from data.',
  'Y가 90° 늦음: 반시계 원': 'Y lags 90°: counterclockwise circle',
  '← 역방향 (시계)': '← Reverse (clockwise)',
  '정방향 (반시계) →': 'Forward (counterclockwise) →',
  'Y가 45° 늦음: 반시계 타원': 'Y lags 45°: counterclockwise ellipse',
  'Y가 같은 위상: 비스듬한 직선': 'Y in phase: diagonal line',
  'Y가 90° 앞섬: 시계 원': 'Y leads 90°: clockwise circle',
  '주파수 [Hz] (− = 역방향)': 'Frequency [Hz] (− = reverse)',
  // 그림 6
  '그림 6. 축은 그림 5 맨 위처럼 반시계 원(반지름 50 µm)으로 도는데, Y 센서가 조금 틀렸을 때의 Full spectrum. 위: 감도가 10 % 크면 역방향 쪽에 2.5 µm(반지름의 5 %)가 선다. 아래: 설치 각도가 10° 어긋나면 4.4 µm(반지름 × sin 5° = 8.7 %)가 선다. Full spectrum은 두 센서가 서로 90°이고 감도가 같다는 전제 위에서만 맞다.':
    'Figure 6. The full spectrum when the Y sensor is slightly off, with the shaft turning in a counterclockwise circle (radius 50 µm) as at the top of Figure 5. Top: if the sensitivity is 10 % too high, 2.5 µm (5 % of the radius) stands on the reverse side. Bottom: if the mounting angle is off by 10°, 4.4 µm (radius × sin 5° = 8.7 %) stands there. The full spectrum is correct only on the assumption that the two sensors are 90° apart and have equal sensitivity.',
  'Y 센서 감도가 10 % 큼': 'Y sensor sensitivity 10 % high',
  '가짜 역방향': 'False reverse',
  'Y 센서가 90°가 아니라 100°에 붙음': 'Y sensor mounted at 100°, not 90°',
};

export default EN;
