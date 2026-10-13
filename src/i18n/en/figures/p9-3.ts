import type { Dict } from '../../translate';

/** src/figures/p9-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  "그림 1. 모터(파랑)의 중심선이 펌프(주황) 중심선의 연장선(회색 점선)에서 얼마나 벗어났는지를 두 숫자로 적는다(세로 축척을 수천 배 키움). 위: 평행 어긋남(offset) — 커플링 중심에서 δ만큼 떨어져 나란하다. 가운데: 각 어긋남(angularity) — 커플링에서는 만나지만 기울기 α로 벌어진다. 아래: 실제로는 둘이 섞인다(예시 기계: δ = 0.18 mm, α = 0.04 mm/100 mm). 수직 평면은 심(shim)으로, 수평 평면은 옆으로 밀어 고친다.":
    "Figure 1. How far the motor centerline (blue) departs from the extension of the pump centerline (orange; gray dashed line) is written as two numbers (vertical scale magnified thousands of times). Top: offset — parallel, δ apart at the coupling center. Middle: angularity — the lines meet at the coupling but diverge with slope α. Bottom: in practice the two mix (example machine: δ = 0.18 mm, α = 0.04 mm/100 mm). The vertical plane is corrected with shims, the horizontal plane by pushing sideways.",
  "평행 어긋남 (offset)": "Offset",
  "펌프 S 중심선": "Pump S centerline",
  "모터 M 중심선": "Motor M centerline",
  "각 어긋남 (angularity)": "Angularity",
  "커플링에서 모터 쪽으로 [mm]": "Coupling toward motor [mm]",
  "기울기 α = 0.05 mm/100 mm": "Slope α = 0.05 mm/100 mm",
  "섞인 경우 (예시 기계)": "Combined (example machine)",
  "기울기 α = 0.04 mm/100 mm": "Slope α = 0.04 mm/100 mm",
  // 그림 2
  "그림 2. rim-face 측정. 위: 펌프 축에 단 브래킷에서 게이지 두 개가 모터 허브의 둘레(rim, 커플링에서 50 mm)와 면(face, 지름 100 mm)을 읽는다. 두 축을 함께 돌려 12시에서 0으로 맞추고 3 · 6 · 9시 값을 적는다(+ = 측정침이 눌려 들어감). 아래: 예시 기계의 rim 읽음값. 6시 −0.50 mm에는 브래킷 처짐 −0.10 mm가 섞여 있어, 빼면 −0.40 mm → 그 자리 높이 = −(−0.40)/2 = 0.20 mm. face 6시 −0.04 mm → 기울기 = −(−0.04)/100 = 0.04 mm/100 mm. 3시 + 9시 = 6시((−0.30) + (−0.10) = −0.40)이면 읽음값이 믿을 만하다(처짐 전 값 기준).":
    "Figure 2. The rim-face method. Top: from a bracket on the pump shaft, two indicators read the motor hub rim (50 mm from the coupling) and face (diameter 100 mm). Rotate both shafts together, zero at 12 o'clock and record the 3, 6 and 9 o'clock values (+ = plunger pushed in). Bottom: rim readings of the example machine. The 6 o'clock −0.50 mm includes a bracket sag of −0.10 mm; subtracting it gives −0.40 mm → height at that position = −(−0.40)/2 = 0.20 mm. Face 6 o'clock −0.04 mm → slope = −(−0.04)/100 = 0.04 mm/100 mm. If 3 o'clock + 9 o'clock = 6 o'clock ((−0.30) + (−0.10) = −0.40), the readings can be trusted (based on the values before sag correction).",
  "펌프 S (고정)": "Pump S (stationary)",
  "모터 M (움직임)": "Motor M (movable)",
  "rim 게이지 (둘레)": "rim indicator",
  "face 게이지 (면)": "face indicator",
  "브래킷 (펌프 축에 고정)": "Bracket (on pump shaft)",
  "12시: 0.00": "12 o'clock: 0.00",
  "3시: −0.30": "3 o'clock: −0.30",
  "6시: −0.40 (처짐 섞이면 −0.50)": "6 o'clock: −0.40 (−0.50 with sag)",
  "9시: −0.10": "9 o'clock: −0.10",
  "rim 읽음값 [mm]": "rim reading [mm]",
  "모터 쪽에서 본 시계 방향": "Clockwise seen from motor side",
  // 그림 3
  "그림 3. 읽음값으로 얻은 모터 중심선(파랑, δ = 0.18 mm, α = 0.04 mm/100 mm)을 두 발 자리까지 늘인다. 앞발(300 mm)에서는 0.30 mm, 뒷발(800 mm)에서는 0.50 mm 높다. 그만큼 내리면(앞발 −0.30, 뒷발 −0.50 mm — 심을 빼기) 모터가 펌프 연장선(회색 점선)에 올라앉는다. 기울기가 있으면 커플링에서 먼 뒷발을 더 많이 옮긴다.":
    "Figure 3. The motor centerline obtained from the readings (blue, δ = 0.18 mm, α = 0.04 mm/100 mm) is extended to the two foot positions. It is 0.30 mm high at the front feet (300 mm) and 0.50 mm high at the back feet (800 mm). Lowering by that much (front feet −0.30, back feet −0.50 mm — removing shims) puts the motor on the pump extension line (gray dashed). With a slope, the back feet, farther from the coupling, are moved more.",
  "높이 [mm]": "Height [mm]",
  "모터 중심선 (읽음값에서)": "Motor centerline (from readings)",
  "앞발 300": "Front feet 300",
  "뒷발 800": "Back feet 800",
  // 그림 4
  "그림 4. 브래킷 처짐. 위: 같은 브래킷을 곧은 파이프에 달고 12시에서 0으로 맞춘 뒤 6시로 돌리면 −0.10 mm가 읽힌다 — 12시에서는 브래킷이 처져 측정침을 누르고, 6시에서는 처져 떨어지기 때문이다. 아래: 예시 기계에서 이 값을 빼지 않으면 모터를 0.05 mm 더 높게 보아 두 발을 그만큼 더 내리게 된다(앞발 −0.35 vs −0.30, 뒷발 −0.55 vs −0.50 mm). 수평(3시·9시)은 처짐이 양쪽에 같아 지워진다.":
    "Figure 4. Bracket sag. Top: mount the same bracket on a straight pipe, zero at 12 o'clock and rotate to 6 o'clock, and −0.10 mm is read — at 12 o'clock the bracket sags and pushes the plunger in, and at 6 o'clock it sags away from it. Bottom: if this value is not subtracted on the example machine, the motor is seen 0.05 mm higher and both feet are lowered that much more (front feet −0.35 vs −0.30, back feet −0.55 vs −0.50 mm). In the horizontal plane (3 and 9 o'clock) the sag is the same on both sides and cancels.",
  "곧은 파이프": "Straight pipe",
  "12시: 처진 만큼 눌려 들어감 → 0으로 맞춤": "12 o'clock: pushed in by the sag → zeroed",
  "6시로 돌리면 반대로 처져 −0.10 mm": "At 6 o'clock it sags away: −0.10 mm",
  "앞발 · 뒷발 이동량 [mm]": "Front / back feet move [mm]",
  "앞발": "Front feet",
  "뒷발": "Back feet",
  "처짐 보정": "Sag corrected",
  "보정 안 함": "Not corrected",
  // 그림 5
  "그림 5. reverse(역방향) 측정. 펌프 축에 단 게이지가 모터 허브(z₁ = 60 mm)를, 모터 축에 단 게이지가 펌프 허브(z₂ = −60 mm)를 읽는다. 처짐을 뺀 6시 값 R₁ = −0.408, R₂ = +0.312 mm에서 두 자리의 모터 높이 y₁ = −R₁/2 = 0.204, y₂ = +R₂/2 = 0.156 mm(점)를 얻고, 두 점을 잇는 직선이 모터 중심선이다 — 기울기 (y₁ − y₂)/(z₁ − z₂) = 0.04 mm/100 mm, 커플링 중심 0.18 mm로 rim-face와 같다. 두 점 사이가 120 mm뿐이라 읽음값의 작은 차이가 뒷발에서 크게 불어난다. 레이저 정렬기도 같은 원리로 두 자리를 잰다.":
    "Figure 5. The reverse indicator method. The indicator on the pump shaft reads the motor hub (z₁ = 60 mm) and the indicator on the motor shaft reads the pump hub (z₂ = −60 mm). From the 6 o'clock values with sag removed, R₁ = −0.408 and R₂ = +0.312 mm, the motor heights at the two positions, y₁ = −R₁/2 = 0.204 and y₂ = +R₂/2 = 0.156 mm (dots), are obtained, and the line through the two points is the motor centerline — slope (y₁ − y₂)/(z₁ − z₂) = 0.04 mm/100 mm and 0.18 mm at the coupling center, the same as rim-face. Because the two points are only 120 mm apart, a small difference in the readings grows large at the back feet. A laser alignment tool measures the two positions on the same principle.",
  // 그림 6
  "그림 6. 위: 운전 중 모터는 중심 높이 500 mm × 40 K로 0.23 mm, 펌프는 435 mm × 20 K로 0.10 mm 솟는다(강 11.5 × 10⁻⁶ /K). 운전 중에 한 줄이 되려면 냉간에는 모터를 0.13 mm 낮게 둔다(냉간 목표 −0.13 mm, 회색 → 운전 중 초록). 아래: 열간 확인 — 운전 뒤 근접 센서 gap 변화로 잰 실제 성장(가상 측정)이 펌프 0.13, 모터 0.20 mm였다면 운전 중 모터는 여전히 0.06 mm 낮다. 다음 정렬의 냉간 목표를 실제 성장 차(−0.07 mm)로 고친다.":
    "Figure 6. Top: in operation the motor rises 0.23 mm (centerline height 500 mm × 40 K) and the pump 0.10 mm (435 mm × 20 K) (steel, 11.5 × 10⁻⁶ /K). To be in a single line in operation, the motor is set 0.13 mm low when cold (cold target −0.13 mm, gray → green in operation). Bottom: hot check — if the actual growth measured from the proximity probe gap change after running (a hypothetical measurement) were 0.13 mm for the pump and 0.20 mm for the motor, the motor would still be 0.06 mm low in operation. Correct the next alignment's cold target to the actual growth difference (−0.07 mm).",
  "냉간 목표와 운전 중 (모터 중심선)": "Cold target and in operation (motor centerline)",
  "펌프 냉간": "Pump cold",
  "펌프 운전 중": "Pump running",
  "모터 냉간 (목표)": "Motor cold (target)",
  "모터 운전 중": "Motor running",
  "열간 확인: 예상 성장 vs 근접 센서로 잰 성장 [mm]": "Hot check: expected vs probe-measured growth [mm]",
  "펌프 S": "Pump S",
  "모터 M": "Motor M",
  "예상 (열팽창 계산)": "Expected (thermal calc.)",
  "잰 값 (gap 변화)": "Measured (gap change)",
};

export default EN;
