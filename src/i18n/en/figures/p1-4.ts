import type { Dict } from '../../translate';

/** src/figures/p1-4.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. P1-3의 질량-스프링-감쇠계에 바깥 힘 F₀ cos ωt를 계속 건다. 위는 모델, 아래는 그 힘의 시간파형(ω = 2π × 4 Hz 예)이다. 힘은 일정한 박자로 오른쪽·왼쪽을 번갈아 민다.':
    'Figure 1. An outside force F₀ cos ωt is applied continuously to the mass-spring-damper system of P1-3. Top: the model. Bottom: the time waveform of that force (example: ω = 2π × 4 Hz). The force pushes right and left in turn at a steady rhythm.',
  '힘 F(t)/F₀': 'Force F(t)/F₀',
  // 그림 2
  '그림 2. 고유진동수 5 Hz, ζ = 0.05인 계에 8 Hz(r = 1.6) 힘을 정지 상태에서 걸기 시작했다. 위: 실제 변위(파랑)는 처음 1초 정도 들쭉날쭉하다가 점점 회색 점선(정상상태 응답, 8 Hz)과 겹친다. 아래: 둘의 차이인 과도 응답(초록)은 5 Hz 근처 박자로 흔들리며 P1-3의 포락선처럼 줄어든다. 약 1.9초(3τ) 뒤에는 처음의 5 % 아래다.':
    'Figure 2. An 8 Hz force (r = 1.6) starts acting on a system at rest with a natural frequency of 5 Hz and ζ = 0.05. Top: the actual displacement (blue) is ragged for the first second or so and then gradually overlaps the gray dotted line (steady-state response, 8 Hz). Bottom: the difference between the two, the transient response (green), oscillates at a rhythm near 5 Hz and shrinks like the envelope in P1-3. After about 1.9 s (3τ) it is below 5 % of its initial size.',
  '실제 변위 x(t)': 'Actual displacement x(t)',
  '정상상태 응답 (8 Hz)': 'Steady-state response (8 Hz)',
  '과도 응답 = 실제 − 정상상태': 'Transient = actual − steady state',
  '과도 [mm]': 'Transient [mm]',
  // 그림 3
  '그림 3. 같은 힘(주황, 크기 1 = X_st)을 ζ = 0.05인 계에 세 박자로 건 정상상태. 점선은 힘의 꼭대기(주황)와 변위의 꼭대기(파랑) 시각이다. r = 0.5에서는 변위가 힘을 거의 그대로 따라가고(1.33배, 3.8° 늦음), r = 1에서는 10배로 커지며 정확히 1/4주기(90°) 늦고, r = 2에서는 0.333배로 작아지며 거의 반대(176.2°)로 움직인다. 세 패널의 세로 눈금이 다르다는 점에 주의.':
    'Figure 3. Steady state when the same force (orange, size 1 = X_st) is applied to a ζ = 0.05 system at three different rhythms. The dotted lines mark the times of the force peak (orange) and the displacement peak (blue). At r = 0.5 the displacement follows the force almost exactly (1.33 times, 3.8° late); at r = 1 it grows to 10 times and lags by exactly a quarter period (90°); at r = 2 it shrinks to 0.333 times and moves almost opposite (176.2°). Note that the three panels have different vertical scales.',
  'r = 0.5 (천천히 밀 때)': 'r = 0.5 (pushing slowly)',
  '힘 F/k (X_st 단위)': 'Force F/k (in X_st)',
  '변위 x/X_st': 'Displacement x/X_st',
  '힘의 주기 수 (ωt / 2π)': 'Force periods (ωt / 2π)',
  'r = 1 (고유진동수로 밀 때)': 'r = 1 (pushing at the natural frequency)',
  'r = 2 (빠르게 밀 때)': 'r = 2 (pushing fast)',
  // 그림 4
  '그림 4. 진동수비 r에 따른 진폭비 X/X_st (같은 힘 F₀, 감쇠비만 다름). r이 0이면 1(정적 처짐), r = 1 근처에서 솟고, r이 커지면 0으로 내려간다. 봉우리 높이는 감쇠비가 정한다 — ζ = 0.05(파랑)는 10.01배(r = 0.9975), ζ = 0.5(보라)는 봉우리가 거의 없다. r = √2보다 빠르면 감쇠와 관계없이 1보다 작아진다.':
    'Figure 4. Amplitude ratio X/X_st versus frequency ratio r (same force F₀, only the damping ratio differs). At r = 0 it is 1 (static deflection), it rises near r = 1, and it falls toward 0 as r grows. The damping ratio sets the peak height: ζ = 0.05 (blue) gives 10.01 times (at r = 0.9975), while ζ = 0.5 (purple) has almost no peak. Faster than r = √2, it is below 1 regardless of damping.',
  'X_st (정적 처짐)': 'X_st (static deflection)',
  '진동수비 r = ω/ωₙ': 'Frequency ratio r = ω/ωₙ',
  '진폭비 X/X_st': 'Amplitude ratio X/X_st',
  // 그림 5
  '그림 5. 같은 네 감쇠비의 위상 지연 φ (변위가 힘보다 늦은 각도). 모든 곡선이 r = 1에서 정확히 90°를 지난다. 감쇠가 작을수록(파랑) 0° → 180°로 넘어가는 구간이 r = 1 근처에 좁게 몰리고, 감쇠가 크면(보라) 완만하게 넘어간다.':
    'Figure 5. Phase lag φ (the angle by which the displacement lags the force) for the same four damping ratios. Every curve passes exactly 90° at r = 1. The smaller the damping (blue), the more narrowly the 0° → 180° transition is squeezed around r = 1; with large damping (purple) it passes gently.',
  '위상 지연 φ [°]': 'Phase lag φ [°]',
  // 그림 6
  '그림 6. r = 1 근처를 확대했다. 봉우리 높이의 1/√2(약 0.707배)가 되는 두 점 사이 폭을 Half-power 폭이라 한다. ζ = 0.05(파랑)는 높이 10.01, 폭 Δr = 0.1 ≈ 2ζ. 감쇠를 절반(ζ = 0.025, 주황)으로 줄이면 높이는 20.01로 약 2배, 폭은 0.05로 약 절반이 된다. 고유진동수 5 Hz라면 파랑의 폭은 약 0.5 Hz다.':
    'Figure 6. A close-up near r = 1. The width between the two points where the height falls to 1/√2 (about 0.707 times) of the peak is called the half-power width. For ζ = 0.05 (blue), the height is 10.01 and the width is Δr = 0.1 ≈ 2ζ. Halving the damping (ζ = 0.025, orange) doubles the height to 20.01 and halves the width to 0.05. With a natural frequency of 5 Hz, the blue width is about 0.5 Hz.',
  // 그림 7
  '그림 7. ζ = 0.01로 감쇠가 아주 작은 계(5 Hz)에 4.5 Hz(r = 0.9) 힘을 정지 상태에서 걸기 시작했다. 5 Hz 근처의 과도 응답과 4.5 Hz의 정상상태 응답이 한동안 함께 남아, 둘이 같은 방향일 때는 더해지고 반대일 때는 상쇄된다. 그래서 진폭이 2초(= 1/(5 − 4.5) s)마다 출렁인다. 과도 응답이 사라지면 출렁임도 줄어 회색 점선(정상상태 진폭 5.24 × X_st)에 머문다.':
    'Figure 7. A 4.5 Hz force (r = 0.9) starts acting on a system at rest (5 Hz) with very small damping, ζ = 0.01. The transient near 5 Hz and the 4.5 Hz steady-state response stay together for a while, adding when they point the same way and cancelling when they point opposite ways. So the amplitude surges every 2 seconds (= 1/(5 − 4.5) s). When the transient dies out, the surging shrinks too and settles at the gray dotted line (steady-state amplitude 5.24 × X_st).',
};

export default EN;
