import type { Dict } from '../../translate';

/** src/figures/p4-1.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 예시 로터(고유 회전수 3000 rpm, 감쇠비 0.05, 편심 거리 5 µm)를 0에서 6000 rpm까지 올리며 100 rpm마다 잰 1X 벡터를 진폭(위)과 위상 지연(아래)으로 나눠 찍었다(파란 점). 회색 선은 같은 모델의 해석해다. 런업 기록은 연속 곡선이 아니라 회전수마다 하나씩 얻은 점의 모음이다. 운전 회전수 3600 rpm(점선)에서는 31.6 µm pp∠165°이다.':
    'Figure 1. The example rotor (natural speed 3000 rpm, damping ratio 0.05, eccentricity 5 µm) is run up from 0 to 6000 rpm, and the 1X vector measured every 100 rpm is plotted as amplitude (top) and phase lag (bottom) (blue dots). The gray line is the analytical solution of the same model. A run-up record is not a continuous curve but a collection of points, one per speed. At the operating speed of 3600 rpm (dotted line) it is 31.6 µm pp∠165°.',
  진폭: 'Amplitude',
  '운전 3600 rpm': 'Operating 3600 rpm',
  '[µm pp]': '[µm pp]',
  '위상 지연': 'Phase lag',
  '회전수 [rpm]': 'Speed [rpm]',
  '[°]': '[°]',
  // 그림 2
  '그림 2. 같은 로터에서 감쇠비만 0.05(파랑)와 0.2(주황)로 바꾼 Bode 선도. 감쇠가 크면 봉우리가 낮고(100 → 25 µm pp, 3000 rpm 기준) 넓으며, 위상도 천천히 돈다. 두 경우 모두 위상 90°는 정확히 3000 rpm을 지나지만, 진폭이 가장 큰 회전수는 감쇠비 0.2에서 3128 rpm(주황 점)으로 4 % 높다. 감쇠비 0.05에서는 3008 rpm으로 거의 같다.':
    'Figure 2. Bode plots of the same rotor with only the damping ratio changed to 0.05 (blue) and 0.2 (orange). With more damping the peak is lower (100 → 25 µm pp at 3000 rpm) and broader, and the phase turns more slowly. In both cases the phase passes 90° at exactly 3000 rpm, but the speed of maximum amplitude is 3128 rpm at a damping ratio of 0.2 (orange dot), 4 % higher. At 0.05 it is 3008 rpm, almost the same.',
  '피크 3128 rpm': 'Peak 3128 rpm',
  '3000 rpm': '3000 rpm',
  '90°': '90°',
  // 그림 3
  '그림 3. 키페이저 펄스 순간의 축 단면(축 방향에서 본 모습, 회전은 반시계). 주황 점은 불평형이 있는 무거운 점(heavy spot)으로 세 그림 모두 센서(위) 쪽 0°에 두었다. 파란 점은 축이 센서 쪽으로 가장 많이 나온 곳(high spot) — Polar 점의 위상 방향이다. high spot은 무거운 점보다 회전 반대 방향으로 위상 지연만큼 뒤에 있다: 저속 3.8°(거의 같은 곳), 임계속도 90°, 고속 176°(거의 반대편).':
    'Figure 3. Cross-section of the shaft at the instant of the Keyphasor pulse (viewed along the axis, rotation counter-clockwise). The orange dot is the heavy spot where the unbalance sits; in all three drawings it is placed at 0°, toward the sensor (top). The blue dot is where the shaft bulges most toward the sensor (the high spot) — the phase direction of the Polar point. The high spot lies behind the heavy spot, against the direction of rotation, by the phase lag: 3.8° at low speed (almost the same place), 90° at the critical speed, and 176° at high speed (almost opposite).',
  '저속 1500 rpm': 'Low 1500 rpm',
  '임계 3000 rpm': 'Critical 3000 rpm',
  '고속 6000 rpm': 'High 6000 rpm',
  '지연 3.81°': 'Lag 3.81°',
  '지연 90°': 'Lag 90°',
  '지연 176°': 'Lag 176°',
  센서: 'Sensor',
  '주황 = 무거운 점 (heavy spot) · 파랑 = 가장 많이 나온 곳 (high spot) · 회전 ↺': 'Orange = heavy spot · Blue = high spot · Rotation ↺',
  // 그림 4
  '그림 4. 그림 1과 같은 런업을 Polar 플롯으로 그렸다(파랑, 감쇠비 0.05). 저속에서 원점 근처 0° 방향으로 출발해, 임계속도를 지나는 동안 원에 가까운 고리를 그리며 시계 방향(지연이 커지는 쪽)으로 돌고, 고속에서는 180° 쪽 10 µm pp에 다가간다. 고리에서 원점으로부터 가장 먼 점이 3000 rpm(90°)이다. 회색 점선은 감쇠비 0.1로, 고리의 지름이 절반쯤으로 작다.':
    'Figure 4. The same run-up as Figure 1 drawn as a Polar plot (blue, damping ratio 0.05). It starts near the origin toward 0° at low speed, traces a nearly circular loop clockwise (the direction of increasing lag) as it passes the critical speed, and approaches 10 µm pp at 180° at high speed. The point on the loop farthest from the origin is 3000 rpm (90°). The gray dotted loop is for a damping ratio of 0.1; its diameter is about half as large.',
  '0° (센서 방향)': '0° (sensor side)',
  '270°': '270°',
  '180°': '180°',
  '회전 ↺ · 지연 ↻': 'Rotation ↺ · Lag ↻',
  // 그림 5
  '그림 5. 그림 1의 런업을 25 rpm 간격으로 잰 진폭(파란 점)에서 Half-power법으로 증폭계수를 읽는다. 피크 100 µm pp(N_c = 3000 rpm)의 0.707배인 70.7 µm pp 선(주황 점선)과 만나는 두 회전수가 N₁ = 2867, N₂ = 3171 rpm(이웃한 두 점을 직선으로 이어 읽음)이다. AF = 3000 ÷ (3171 − 2867) = 9.84로, 1/(2ζ) = 10에 가깝다.':
    'Figure 5. The amplification factor is read with the half-power method from the amplitude measured at 25 rpm intervals (blue dots) in the Figure 1 run-up. The two speeds where the curve meets the line at 70.7 µm pp, 0.707 times the peak of 100 µm pp (N_c = 3000 rpm) (orange dotted line), are N₁ = 2867 and N₂ = 3171 rpm (read by joining neighboring points with straight lines). AF = 3000 ÷ (3171 − 2867) = 9.84, close to 1/(2ζ) = 10.',
  '0.707 × 피크 = 70.7 µm pp': '0.707 × peak = 70.7 µm pp',
  '피크 N_c = 3000 rpm': 'Peak N_c = 3000 rpm',
  'N₂ − N₁ = 304 rpm': 'N₂ − N₁ = 304 rpm',
  // 그림 6
  '그림 6. 분리여유(Separation Margin)는 운전 회전수 N_op가 임계속도 N_c에서 얼마나 떨어져 있는지를 N_op에 대한 비율로 적은 값이다. 예시 로터는 N_c = 3000 rpm, N_op = 3600 rpm이라 SM = 16.7 %이다. 주황 띠는 Half-power 폭(N₁ ~ N₂)으로, 진폭이 피크의 0.707배 이상인 구간이다. 운전 회전수가 이 띠 가까이에 있으면 작은 변화에도 진폭이 크게 바뀐다.':
    'Figure 6. The separation margin (SM) is how far the operating speed N_op is from the critical speed N_c, written as a fraction of N_op. The example rotor has N_c = 3000 rpm and N_op = 3600 rpm, so SM = 16.7 %. The orange band is the half-power width (N₁ to N₂), the range where the amplitude is at least 0.707 times the peak. If the operating speed is close to this band, even a small change makes the amplitude change a lot.',
  'N_c 3000': 'N_c 3000',
  'N_op 3600': 'N_op 3600',
  'SM = 16.7 %': 'SM = 16.7 %',
  '31.6 µm pp': '31.6 µm pp',
  // 그림 7
  '그림 7. 같은 계산이 실제 데이터에서 틀어지는 세 가지 경우(회색 선 = 참 응답). 위: 감쇠비 0.01이면 Half-power 폭이 약 60 rpm인데 200 rpm마다 재면(주황 점) 봉우리 근처에 점이 한두 개뿐이라 AF가 21.8로 나온다(25 rpm 간격이면 48.3, 참값 약 50). 가운데: 벡터 성분마다 표준편차 4 µm의 잡음이 섞이면 점이 흔들려 AF가 11.8가 된다. 아래: 런아웃 8 µm pp∠60°가 더해지면 저속에서도 8 µm pp가 보이고 피크도 107 µm pp로 바뀐다. 300 rpm 벡터를 빼면(파랑) 참 응답으로 돌아온다.':
    'Figure 7. Three ways the same calculation goes wrong on real data (gray line = true response). Top: with a damping ratio of 0.01 the half-power width is about 60 rpm, so measuring every 200 rpm (orange dots) leaves only one or two points near the peak and the AF comes out as 21.8 (48.3 at 25 rpm intervals; the true value is about 50). Middle: when noise with a standard deviation of 4 µm per vector component is added, the points scatter and the AF becomes 11.8. Bottom: adding a runout of 8 µm pp∠60° shows 8 µm pp even at low speed and changes the peak to 107 µm pp. Subtracting the 300 rpm vector (blue) brings the true response back.',
  '① rpm 간격: ζ = 0.01, 200 rpm마다': '① rpm interval: ζ = 0.01, every 200 rpm',
  '② 측정 잡음: 25 rpm마다': '② Measurement noise: every 25 rpm',
  '③ 런아웃 8 µm pp∠60° (주황) → Slow roll 보상 (파랑)': '③ Runout 8 µm pp∠60° (orange) → slow-roll compensation (blue)',
  '런아웃 포함': 'With runout',
  '보상 후': 'Compensated',
};

export default EN;
