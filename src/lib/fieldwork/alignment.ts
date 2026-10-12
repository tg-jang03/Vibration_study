/**
 * 축 정렬 (P9-3, LAB-ALN-01). 순수 함수. 정렬은 관례상 mm 단위로 다룬다 (길이 mm, 기울기 mm/mm — 화면에서는 mm/100 mm).
 *
 * 기계: 고정 기계 S(펌프)와 움직일 기계 M(모터)이 커플링으로 이어져 있다. z = 커플링 중심에서 M 쪽으로 잰 거리 [mm].
 * 정렬 상태 (한 평면 — 수직 또는 수평): M의 중심선 높이를 S 중심선의 연장선 기준으로 y_M(z) = δ + α z.
 *   δ = 커플링 중심의 어긋남(offset), α = 기울기(angularity). + = M이 높다(수직) / 기준 쪽으로 나왔다(수평).
 * 다이얼 게이지 관례: 12시에서 0으로 맞추고 6시 값을 읽는다. + = 측정침이 눌려 들어감.
 *   rim(둘레): 브래킷이 S 축에 달려 M 허브 둘레를 읽으면 R = −2 y_M(z_rim)  (M이 높으면 6시에서 측정침이 빠져 −)
 *   face(면): 지름 D의 면을 읽으면 F = −α D
 *   브래킷 처짐: 파이프에 달아 12시 0 → 6시 값 S_sag(보통 −)를 재 둔다. 수직 rim 읽음값에 그대로 더해지므로 빼서 보정.
 * reverse(역방향 두 개): S에 단 게이지가 M 허브(z₁)를, M에 단 게이지가 S 허브(z₂)를 읽는다.
 *   R₁ = −2 y_M(z₁),  R₂ = +2 y_M(z₂)  (M에 달려 함께 돌면 S가 M에 대해 −y_M만큼 어긋나 보인다)
 * 발 이동량: move(z) = 목표(z) − y_M(z), 앞발 z = A, 뒷발 z = B (닮은 삼각형). + = 올린다(심 추가) / 기준 쪽으로 민다.
 * 열성장: ΔH = 열팽창계수 × 중심 높이 × 온도 상승. 냉간 목표 어긋남 = ΔH_S − ΔH_M (운전 중 한 줄이 되게).
 */

export const ALN_GEOM = {
  /** rim 게이지가 M 허브를 읽는 자리 z [mm] */
  zRim: 50,
  /** face 게이지가 읽는 면의 지름 [mm] */
  faceD: 100,
  /** reverse: S에 단 게이지가 읽는 M 허브 자리 z₁, M에 단 게이지가 읽는 S 허브 자리 z₂ [mm] */
  z1: 60,
  z2: -60,
  /** M(모터)의 앞발·뒷발 자리 [mm] */
  footA: 300,
  footB: 800,
} as const;

export interface AlignState {
  /** 커플링 중심의 어긋남 δ [mm] */
  offset: number;
  /** 기울기 α [mm/mm] */
  slope: number;
}

export const heightAt = (s: AlignState, z: number) => s.offset + s.slope * z;

/** rim-face 읽음값 [mm] (12시 0 → 6시). sag = 파이프 시험의 6시 값 (rim에만 더해진다) */
export function rimFaceReadings(s: AlignState, sag = 0, g = ALN_GEOM): { rim: number; face: number } {
  return { rim: -2 * heightAt(s, g.zRim) + sag, face: -s.slope * g.faceD };
}

/** rim-face 읽음값 → 정렬 상태. sagCorrection = 빼 줄 처짐 값 (보정하지 않으면 0) */
export function fromRimFace(rim: number, face: number, sagCorrection = 0, g = ALN_GEOM): AlignState {
  const slope = -face / g.faceD;
  const yRim = -(rim - sagCorrection) / 2;
  return { offset: yRim - slope * g.zRim, slope };
}

/** reverse 읽음값 [mm] (두 게이지 모두 12시 0 → 6시). 처짐은 두 rim 읽음값에 같은 값이 더해진다고 둔다 */
export function reverseReadings(s: AlignState, sag = 0, g = ALN_GEOM): { r1: number; r2: number } {
  return { r1: -2 * heightAt(s, g.z1) + sag, r2: 2 * heightAt(s, g.z2) + sag };
}

export function fromReverse(r1: number, r2: number, sagCorrection = 0, g = ALN_GEOM): AlignState {
  const y1 = -(r1 - sagCorrection) / 2;
  const y2 = (r2 - sagCorrection) / 2;
  const slope = (y1 - y2) / (g.z1 - g.z2);
  return { offset: y2 - slope * g.z2, slope };
}

/** 발 이동량 [mm] — 목표 어긋남 target(냉간 목표, 기울기 0)으로 옮길 때. + = 올림(심 추가) */
export function footMoves(s: AlignState, target = 0, g = ALN_GEOM): { front: number; rear: number } {
  return { front: target - heightAt(s, g.footA), rear: target - heightAt(s, g.footB) };
}

/** 열성장 ΔH [mm] = 열팽창계수 × 중심 높이 [mm] × 온도 상승 [K] (강 11.5e-6 /K) */
export const thermalGrowth = (heightMm: number, dT: number, coef = 11.5e-6) => coef * heightMm * dT;

/** 냉간 목표 어긋남 [mm]: 운전 중 S와 M이 한 줄이 되게 — M을 (ΔH_M − ΔH_S)만큼 낮게 둔다 */
export const coldTarget = (growthS: number, growthM: number) => growthS - growthM;

/** 운전 중(열간) 실제 어긋남 = 냉간 어긋남 + (실제 ΔH_M − 실제 ΔH_S) */
export const hotOffset = (coldOffset: number, growthS: number, growthM: number) => coldOffset + growthM - growthS;
