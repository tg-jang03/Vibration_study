/**
 * 기계 요소가 만드는 주파수 (P1-8, LAB-FMAP-01, D-032). 순수 함수, 단위는 Hz·m (D-012).
 * 세는 규칙: 한 바퀴에 k번 일어나는 사건 → k × f_r. 요소마다 "한 바퀴에 몇 번"만 다르다.
 * Part 7(LAB-BRG-01, LAB-GEAR-01)이 이 모듈을 확장한다.
 */

/** 한 바퀴에 k번 일어나는 사건의 주파수 (k는 정수가 아니어도 된다) */
export function perRevolution(k: number, fr: number): number {
  if (!(fr >= 0)) throw new RangeError('회전 주파수 f_r ≥ 0이어야 한다');
  return k * fr;
}

/** 축의 k차 하모닉 (k × 1X) */
export const shaftHarmonic = (k: number, fr: number) => perRevolution(k, fr);

/** 날개 통과 주파수 N_b × f_r */
export const bladePass = (blades: number, fr: number) => perRevolution(blades, fr);

/** 맞물림 주파수 z × f_r */
export const gearMesh = (teeth: number, fr: number) => perRevolution(teeth, fr);

/**
 * 맞물린 기어 한 쌍: 맞물림 주파수는 두 기어가 같다 (z₁ f₁ = z₂ f₂).
 * 그래서 상대 기어의 회전 주파수 f₂ = f₁ z₁ / z₂.
 */
export function gearPair(z1: number, z2: number, f1: number): { mesh: number; f2: number } {
  if (!(z1 > 0) || !(z2 > 0)) throw new RangeError('잇수는 양수여야 한다');
  const mesh = gearMesh(z1, f1);
  return { mesh, f2: mesh / z2 };
}

/** 구름베어링 치수. 길이는 m, 접촉각은 rad */
export interface BearingGeometry {
  /** 볼(구름요소) 수 N_r */
  balls: number;
  /** 볼 지름 d */
  ballDiameter: number;
  /** 피치 지름 D (볼 중심이 그리는 원의 지름) */
  pitchDiameter: number;
  /** 접촉각 α (기본 0) */
  contactAngle?: number;
}

/** 구름베어링 주파수 [Hz] — 내륜이 축과 함께 f_r로 돌고 외륜은 멈춰 있을 때 */
export interface BearingFrequencies {
  /** 케이지(볼 묶음)의 회전 주파수 */
  ftf: number;
  /** 외륜의 한 점을 볼이 지나는 주파수 = N_r × FTF */
  bpfo: number;
  /** 내륜의 한 점을 볼이 지나는 주파수 = N_r × (f_r − FTF) */
  bpfi: number;
  /** 볼의 자전 주파수 (1× 정의) */
  bsf: number;
  /** 볼 결함이 내·외륜을 모두 칠 때의 2 × BSF (문헌마다 BSF를 이 값으로 쓰기도 한다, I-008) */
  bsf2: number;
}

/**
 * 케이지는 볼 중심과 함께 돈다. 볼은 멈춘 외륜과 도는 내륜 사이를 구르므로
 * 볼 중심은 내륜 접촉점 속도의 절반으로 움직인다 → FTF = (f_r/2)(1 − (d/D)cos α).
 */
export function bearingFrequencies(g: BearingGeometry, fr: number): BearingFrequencies {
  const { balls, ballDiameter: d, pitchDiameter: D } = g;
  const alpha = g.contactAngle ?? 0;
  if (!(balls > 0) || !(d > 0) || !(D > d)) throw new RangeError('볼 수 > 0, 0 < d < D여야 한다');
  if (!(fr >= 0)) throw new RangeError('회전 주파수 f_r ≥ 0이어야 한다');
  const ratio = (d / D) * Math.cos(alpha);
  const ftf = (fr / 2) * (1 - ratio);
  const bsf = (D / (2 * d)) * fr * (1 - ratio * ratio);
  return { ftf, bpfo: balls * ftf, bpfi: balls * (fr - ftf), bsf, bsf2: 2 * bsf };
}

/** 6205 깊은 홈 볼베어링 치수 (CWRU 베어링 데이터의 시험 베어링, R-10) */
export const BEARING_6205: BearingGeometry = { balls: 9, ballDiameter: 7.94e-3, pitchDiameter: 39.04e-3, contactAngle: 0 };

/** 벨트 주파수: 벨트가 1초에 몇 바퀴 도나 = 풀리 둘레 속도 / 벨트 길이 = π D_p f_r / L */
export function beltFrequency(pulleyDiameter: number, beltLength: number, fr: number): number {
  if (!(pulleyDiameter > 0) || !(beltLength > 0)) throw new RangeError('풀리 지름·벨트 길이는 양수여야 한다');
  return (Math.PI * pulleyDiameter * fr) / beltLength;
}

/** 전자기력: 끌어당기는 힘은 전류의 부호와 무관해 전원 한 주기에 두 번 커진다 → 2 f_L */
export function electromagneticForce(lineFrequency: number): number {
  return 2 * lineFrequency;
}

/** 미끄럼 베어링 기름막이 불안정할 때 나타나는 대역 (0.38 ~ 0.48X, Curriculum 7-4) */
export function oilWhirlBand(fr: number): [number, number] {
  return [0.38 * fr, 0.48 * fr];
}
