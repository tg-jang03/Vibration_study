import type { Dict } from '../../translate';

/** src/figures/p9-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 1면 영향계수법(정적 위주 로터, 베어링 1 수평, 3000 rpm). 위: 처음 진동 V₀ = 33.7 µm∠45.3°(파랑). 평면 1에 시험추(30 g∠0°)를 달자 V₁ = 49.3 µm∠31.2°(주황)로 바뀌었다. 두 벡터 끝을 잇는 ΔV = V₁ − V₀ = 18.5 µm∠4.8°(갈색)가 시험추 하나가 만든 몫이다 → 영향계수 H = ΔV/W_t = 0.617 µm/g∠4.8°. 보정추는 V₀를 지울 몫 −V₀(초록 점선)를 만들어야 하므로 W_c = −V₀/H = 54.7 g∠220.5°. 아래: 원판에서 본 자리. 각은 키페이저 표시(0°)에서 회전 반대 방향으로 잰다.':
    'Figure 1. Single-plane influence coefficient method (static-dominant rotor, bearing 1 horizontal, 3000 rpm). Top: initial vibration V₀ = 33.7 µm∠45.3° (blue). With a trial weight (30 g∠0°) in plane 1, it changes to V₁ = 49.3 µm∠31.2° (orange). ΔV = V₁ − V₀ = 18.5 µm∠4.8° (brown), joining the two vector tips, is the share made by the trial weight alone → influence coefficient H = ΔV/W_t = 0.617 µm/g∠4.8°. The correction weight must make −V₀ (green dashed), the share that cancels V₀, so W_c = −V₀/H = 54.7 g∠220.5°. Bottom: the positions seen on the disk. Angles are measured from the Keyphasor mark (0°), opposite to the direction of rotation.',
  '10 µm 간격': '10 µm spacing',
  '−V₀ (보정추가 만들 몫)': '−V₀ (share the correction weight must make)',
  '키페이저 표시 0°': 'Keyphasor mark 0°',
  '시험추 30 g∠0°': 'Trial weight 30 g∠0°',
  '보정추 54.7 g∠220.5°': 'Correction weight 54.7 g∠220.5°',
  '축 회전 (반시계)': 'Shaft rotation (CCW)',
  '각이 커지는 쪽 (회전 반대)': 'Angle increases this way (opposite to rotation)',
  // 그림 2
  '그림 2. 위: 로터의 두 보정 평면은 각자 가까운 베어링을 주로 흔들지만 먼 베어링도 조금 흔든다(평면 1의 추 1 g → 베어링 1 0.617 µm∠4.8°, 베어링 2 0.06 µm∠169.4°). 가운데: 정적 위주 로터. 1면 보정은 베어링 1을 0으로 만들지만 베어링 2는 30.7 → 33.6 µm로 오히려 조금 커진다. 아래: 커플 위주 로터. 1면 보정 뒤 베어링 2가 40.5 → 36.7 µm로 거의 그대로다. 2면 보정(초록)은 두 베어링을 함께 0으로 만든다(잡음 없는 가상 로터).':
    'Figure 2. Top: each of the rotor\'s two correction planes mainly shakes the nearer bearing, but also shakes the farther bearing a little (1 g in plane 1 → bearing 1 0.617 µm∠4.8°, bearing 2 0.06 µm∠169.4°). Middle: static-dominant rotor. The single-plane correction brings bearing 1 to zero, but bearing 2 actually grows slightly, 30.7 → 33.6 µm. Bottom: couple-dominant rotor. After the single-plane correction bearing 2 stays nearly the same, 40.5 → 36.7 µm. The two-plane correction (green) brings both bearings to zero (a noise-free virtual rotor).',
  '평면 1': 'Plane 1',
  '평면 2': 'Plane 2',
  '정적: 두 평면이 같은 쪽 → 두 베어링이 같은 위상': 'Static: planes on the same side → bearings in phase',
  '커플: 두 평면이 반대쪽 → 두 베어링이 반대 위상': 'Couple: planes on opposite sides → bearings in opposite phase',
  '정적 위주 [µm p-p]': 'Static-dominant [µm p-p]',
  '처음': 'Initial',
  '1면 보정 뒤': 'After single plane',
  '2면 보정 뒤': 'After two planes',
  '커플 위주 [µm p-p]': 'Couple-dominant [µm p-p]',
  // 그림 3
  '그림 3. 런마다 측정 벡터가 2 µm p-p(σ)씩 흔들릴 때, 시험추 질량에 따라 1면 보정 뒤 베어링 1에 남는 진동(정적 위주 로터, 200번 반복). 파랑 = 중앙값, 회색 점선 = 열 번 중 아홉 번이 이 아래. 시험추가 10 g이면 그 효과(약 6.2 µm)가 흔들림(2 µm)의 약 3배뿐이라 남는 진동의 중앙값이 16.5 µm(처음 33.7 µm의 절반)이다. 30 g이면 7.4 µm, 80 g이면 4.3 µm로 내려간다. 세로 점선은 흔한 출발점(시험추 원심력 = 그 베어링이 받는 로터 무게의 10 %, 이 로터에서 약 20 g).':
    'Figure 3. Vibration left at bearing 1 after the single-plane correction, versus trial weight mass, when the measured vector scatters by 2 µm p-p (σ) in each run (static-dominant rotor, 200 repeats). Blue = median, gray dashed = nine times out of ten the result is below this. With a 10 g trial weight, its effect (about 6.2 µm) is only about 3 times the scatter (2 µm), so the median of the remaining vibration is 16.5 µm (half of the initial 33.7 µm). It falls to 7.4 µm at 30 g and 4.3 µm at 80 g. The vertical dashed line is a common starting point (trial weight centrifugal force = 10 % of the rotor weight carried by that bearing, about 20 g for this rotor).',
  '시험추 [g] (반지름 200 mm)': 'Trial weight [g] (radius 200 mm)',
  '남는 진동 [µm p-p]': 'Remaining vibration [µm p-p]',
  '처음 33.7 µm': 'Initial 33.7 µm',
  '출발점 20 g': 'Start 20 g',
  // 그림 4
  '그림 4. 위상 없이 진폭만으로 보정하는 4-run법(같은 로터, 베어링 1). 처음 진폭 A₀ = 33.7 µm, 같은 시험추 30 g을 0° · 120° · 240°에 차례로 달았을 때 A₁ = 49.3, A₂ = 41.3, A₃ = 17.4 µm. 시험추 효과의 크기는 T² = (A₁² + A₂² + A₃²)/3 − A₀²에서 T = 18.5 µm. 원점에서 T만큼 떨어진 세 점(시험추 자리의 반대쪽)을 중심으로 반지름 A₁ · A₂ · A₃의 원을 그리면, 반지름 A₀의 원(파랑)과 한 점에서 만난다 — 그 점이 처음 진동의 자리(∠40.5°). 보정추는 그 반대쪽 220.5°에 30 g × A₀/T = 54.7 g으로, 영향계수법의 결과(그림 1)와 같다.':
    'Figure 4. The four-run method, which corrects with amplitude only and no phase (same rotor, bearing 1). Initial amplitude A₀ = 33.7 µm; with the same 30 g trial weight attached in turn at 0° · 120° · 240°, A₁ = 49.3, A₂ = 41.3, A₃ = 17.4 µm. The size of the trial weight effect is T = 18.5 µm from T² = (A₁² + A₂² + A₃²)/3 − A₀². Drawing circles of radius A₁ · A₂ · A₃ around three points at distance T from the origin (opposite the trial weight positions), they meet the circle of radius A₀ (blue) at one point — that point is the direction of the initial vibration (∠40.5°). The correction weight goes on the opposite side, at 220.5°, with 30 g × A₀/T = 54.7 g, the same as the influence coefficient method (Figure 1).',
  '원점': 'Origin',
  '시험추 0° → 반지름 A1': 'Trial 0° → radius A1',
  '시험추 120° → 반지름 A2': 'Trial 120° → radius A2',
  '시험추 240° → 반지름 A3': 'Trial 240° → radius A3',
  '만나는 점 = 처음 진동 ∠40.5°': 'Intersection = initial vibration ∠40.5°',
  '반지름 A₀ = 33.7': 'Radius A₀ = 33.7',
  // 그림 5
  '그림 5. 평면 1에 70 g∠20°를 달아야 하는데 구멍이 30°마다(12개) 뚫려 있다(동적 로터). 양옆 구멍 0°와 30°에 나눠 단다: 0°에 24.3 g, 30°에 47.9 g. 두 추의 벡터 합(점선 평행사변형)이 원래 추와 같아 진동은 똑같이 0이 된다. 나눈 질량의 합(72.2 g)은 원래 추보다 크다 — 벡터로 더하기 때문이다.':
    'Figure 5. A 70 g∠20° weight is needed in plane 1, but the holes are drilled every 30° (12 holes) (dynamic rotor). It is split between the neighboring holes at 0° and 30°: 24.3 g at 0° and 47.9 g at 30°. The vector sum of the two weights (dashed parallelogram) equals the original weight, so the vibration goes to zero just the same. The sum of the split masses (72.2 g) is larger than the original weight, because they add as vectors.',
  '계산한 보정추 70 g∠20°': 'Computed correction weight 70 g∠20°',
  '화살표 길이 ∝ 질량': 'Arrow length ∝ mass',
  // 그림 6
  '그림 6. 위 두 칸: 같은 평면 1의 추 1 g이 베어링 1에 만드는 진동(영향계수)의 크기와 각을 회전수마다 계산했다. 운전 3000 rpm에서는 각이 4.8°로 무거운 점과 높은 점이 거의 같은 자리지만, 병진(5000 rpm)·원추(6400 rpm) 모드를 지나면 각이 180° 가까이 돌아간다(P4-1의 heavy·high spot). 그래서 영향계수는 잰 회전수에서만 맞다. 아래: 굽힘 모드로 도는 유연 로터의 두 모드와 추 세트. 같은 방향 한 쌍(대칭 세트)은 1차 굽힘만, 반대 방향 한 쌍(역대칭 세트)은 2차 굽힘만 흔든다 — 모드마다 따로 맞추는 모달 밸런싱의 생각.':
    'Figure 6. Top two panels: the magnitude and angle of the vibration made at bearing 1 by 1 g in plane 1 (the influence coefficient), computed at each speed. At the operating 3000 rpm the angle is 4.8°, so the heavy spot and high spot are almost at the same position, but after passing the translational (5000 rpm) and conical (6400 rpm) modes the angle turns to nearly 180° (heavy and high spot in P4-1). So an influence coefficient holds only at the speed where it was measured. Bottom: two modes of a flexible rotor in bending, and the weight sets. A pair in the same direction (symmetric set) excites only the first bending mode, and a pair in opposite directions (antisymmetric set) only the second — the idea of modal balancing, which balances each mode separately.',
  '평면 1 → 베어링 1 영향계수의 크기 [µm p-p / g]': 'Plane 1 → bearing 1 influence coefficient magnitude [µm p-p / g]',
  '운전 3000': 'Operating 3000',
  '병진': 'Transl.',
  '원추': 'Conical',
  '각 [°] (회전 반대 방향)': 'Angle [°] (opposite to rotation)',
  '1차 굽힘': '1st bending',
  '2차 굽힘': '2nd bending',
  '대칭 세트 (같은 방향)': 'Symmetric set (same way)',
  '역대칭 세트 (반대 방향)': 'Antisymmetric set (opposed)',
  // 그림 7
  '그림 7. 밸런스 등급의 정의 e_per = G/Ω를 회전수에 따라 그렸다(G 1 · 2.5 · 6.3 mm/s는 예시 숫자 — 기계마다 어떤 G를 쓰는지는 규격의 표를 따른다). 같은 G라도 빨리 도는 로터일수록 허용 편심이 작다. 예: G = 2.5 mm/s, 3000 rpm(Ω = 314.2 rad/s)이면 e_per = 7.96 µm, 이 로터(800 kg)의 허용 잔류 불평형은 U_per = M·e_per = 6366 g·mm(반지름 200 mm에서 약 31.8 g, 두 평면에 나눈다).':
    'Figure 7. The definition of the balance quality grade, e_per = G/Ω, plotted against speed (G 1 · 2.5 · 6.3 mm/s are example numbers — which G is used for which machine follows the standard\'s tables). Even for the same G, a faster rotor has a smaller permissible eccentricity. Example: for G = 2.5 mm/s at 3000 rpm (Ω = 314.2 rad/s), e_per = 7.96 µm, and the permissible residual unbalance of this rotor (800 kg) is U_per = M·e_per = 6366 g·mm (about 31.8 g at a radius of 200 mm, divided between two planes).',
  '허용 편심 e_per [µm]': 'Permissible eccentricity e_per [µm]',
};

export default EN;
