import type { Dict } from '../../translate';

/** src/figures/p1-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 질량이 오른쪽으로 x만큼 벗어나면 스프링의 복원력 −kx는 왼쪽을 향한다. 뉴턴의 법칙 mẍ = F에 이 힘을 넣으면 mẍ = −kx, 즉 mẍ + kx = 0이 된다.':
    'Figure 1. When the mass moves x to the right, the spring’s restoring force −kx points left. Putting this force into Newton’s law mẍ = F gives mẍ = −kx, that is, mẍ + kx = 0.',
  '강성 k': 'Stiffness k',
  '질량 m': 'Mass m',
  '그림 2. 정현파는 세 숫자로 정해진다. 파랑 선(φ = 0)에서 진폭 A는 중심에서 꼭대기까지의 높이, 주기 T는 같은 상태로 돌아오는 시간이다. 주황 점선은 진폭과 주기가 같고 위상만 φ = −90°인 파형으로, 꼭대기가 한 주기의 1/4(Δt = T/4 = 0.125 s)만큼 늦게 온다. 주파수는 f = 1/T = 2 Hz다.':
    'Figure 2. A sine wave is set by three numbers. On the blue line (φ = 0), the amplitude A is the height from the center to the top, and the period T is the time to return to the same state. The orange dashed line has the same amplitude and period but phase φ = −90°, so its peak comes 1/4 of a period (Δt = T/4 = 0.125 s) later. The frequency is f = 1/T = 2 Hz.',
  'φ = −90° (T/4 늦음)': 'φ = −90° (T/4 late)',
  '주기 T': 'Period T',
  '변위 x / A': 'Displacement x / A',
  '그림 3. 기준 m = 1 kg, k = 1000 N/m의 고유진동수는 5.033 Hz다. 질량을 4배로 하면 박자는 절반, 강성을 4배로 하면 박자는 두 배가 된다.':
    'Figure 3. The natural frequency of the reference m = 1 kg, k = 1000 N/m is 5.033 Hz. Quadrupling the mass halves the rhythm; quadrupling the stiffness doubles it.',
  '기준: m = 1, k = 1000': 'Reference: m = 1, k = 1000',
  '질량 4배: fₙ 절반': 'Mass ×4: fₙ halves',
  '강성 4배: fₙ 두 배': 'Stiffness ×4: fₙ doubles',
  '그림 4. 같은 질량과 강성에서 5 mm와 15 mm로 다르게 당겨 놓았다. 움직이는 폭은 세 배지만 꼭대기와 평형점을 지나는 시각은 같다. 이 선형 모델의 고유진동수는 진폭과 무관하다.':
    'Figure 4. With the same mass and stiffness, the mass is pulled 5 mm in one case and 15 mm in the other. The swing is three times as wide, but the times of the peaks and of passing equilibrium are the same. The natural frequency of this linear model does not depend on the amplitude.',
  '둘 다 한 주기': 'Both: one period',
  '그림 5. 처음 위치에서 놓은 경우와 평형점에서 밀어 준 경우. 두 응답은 진폭과 고유진동수가 같고, 파형이 한 주기의 1/4(90°)만큼 어긋나 있다. 초기조건 x₀·v₀는 진폭과 위상을 정하지만 고유진동수는 바꾸지 않는다.':
    'Figure 5. Released from an initial position versus pushed from the equilibrium point. The two responses have the same amplitude and natural frequency, and the waveforms are offset by 1/4 of a period (90°). The initial conditions x₀ and v₀ set the amplitude and phase but do not change the natural frequency.',
  '그림 6. 변위·속도·가속도를 각자의 최대값으로 나눠 겹쳤다. 속도는 변위보다 90° 앞서고, 가속도는 다시 90° 앞선다. 따라서 끝점에서는 속도가 0이고 가속도 크기가 최대이며, 평형점에서는 그 반대다.':
    'Figure 6. Displacement, velocity and acceleration, each divided by its own maximum and overlaid. Velocity is 90° ahead of displacement, and acceleration is another 90° ahead. So at the end points the velocity is 0 and the acceleration magnitude is at its maximum, and at the equilibrium point it is the other way round.',
  '변위 x/A': 'Displacement x/A',
  '속도 v/(ωₙA)': 'Velocity v/(ωₙA)',
  '가속도 a/(ωₙ²A)': 'Acceleration a/(ωₙ²A)',
  '각 최대값으로 나눈 크기': 'Size divided by each maximum',
  '그림 7. 같은 물체를 올렸을 때 정적으로 많이 처지는 지지는 부드럽고 고유진동수가 낮다. 올린 물체의 무게로 지지가 처진 양 δₛₜ를 알면 fₙ = (1/2π)√(g/δₛₜ)로 질량과 강성을 따로 몰라도 박자를 어림할 수 있다 (g ≈ 9.81 m/s²).':
    'Figure 7. A support that sags a lot under the same object is soft and has a low natural frequency. If you know the amount δₛₜ the support sags under the weight of the object, fₙ = (1/2π)√(g/δₛₜ) estimates the rhythm without knowing the mass and stiffness separately (g ≈ 9.81 m/s²).',
  '정적 처짐으로 어림한 fₙ': 'fₙ estimated from static sag',
  '10 mm → 약 4.98 Hz': '10 mm → about 4.98 Hz',
  '정적 처짐 δₛₜ [mm]': 'Static sag δₛₜ [mm]',
  '고유진동수 fₙ [Hz]': 'Natural frequency fₙ [Hz]',
};

export default EN;
