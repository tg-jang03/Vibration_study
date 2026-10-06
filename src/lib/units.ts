/**
 * 진동 단위 환산 (P1-6, LAB-UNIT-01). 표시 계층용 순수 함수 (D-012: 계산은 SI, 단위 변환은 UI에서).
 * 정현파 하나를 가정한다: Peak = √2·RMS = Peak-Peak / 2, v = 2πf·d, a = (2πf)²·d.
 * 여러 성분이 섞인 신호의 overall 값에는 이 환산을 쓰면 안 된다 (P1-0 §4, P1-6 §5).
 */

export type Quantity = 'displacement' | 'velocity' | 'acceleration';
export type Detector = 'pk' | 'pp' | 'rms';
export type UnitId = 'um' | 'mil' | 'mm/s' | 'in/s' | 'm/s2' | 'g';

/** 표준 중력가속도 [m/s²] */
export const STANDARD_GRAVITY = 9.80665;
/** 1 inch [m] */
export const INCH = 0.0254;
/** 1 mil = 1/1000 inch [m] */
export const MIL = INCH / 1000;

export interface UnitInfo {
  quantity: Quantity;
  /** 이 단위 1의 SI 값 (m, m/s, m/s²) */
  si: number;
  label: string;
}

export const UNITS: Record<UnitId, UnitInfo> = {
  um: { quantity: 'displacement', si: 1e-6, label: 'µm' },
  mil: { quantity: 'displacement', si: MIL, label: 'mil' },
  'mm/s': { quantity: 'velocity', si: 1e-3, label: 'mm/s' },
  'in/s': { quantity: 'velocity', si: INCH, label: 'in/s' },
  'm/s2': { quantity: 'acceleration', si: 1, label: 'm/s²' },
  g: { quantity: 'acceleration', si: STANDARD_GRAVITY, label: 'g' },
};

export const DETECTOR_LABEL: Record<Detector, string> = { pk: 'Peak', pp: 'Peak-Peak', rms: 'RMS' };

/** 정현파 가정에서 표기(Peak·Peak-Peak·RMS) → Peak 배율 */
export function toPeakFactor(detector: Detector): number {
  return detector === 'pk' ? 1 : detector === 'pp' ? 0.5 : Math.SQRT2;
}

const ORDER: Record<Quantity, number> = { displacement: 0, velocity: 1, acceleration: 2 };

export interface VibrationValue {
  value: number;
  unit: UnitId;
  detector: Detector;
}

/**
 * 정현파 진동 값 하나를 다른 단위·표기로 바꾼다. 양(변위·속도·가속도)이 다르면 주파수 freq [Hz]가 필요하다.
 * 예: 25 Hz, 50 µm pp → 2.777 mm/s rms. 1 in/s pk → 17.96 mm/s rms.
 */
export function convertSine(from: VibrationValue, to: { unit: UnitId; detector: Detector }, freq?: number): number {
  if (!Number.isFinite(from.value)) throw new RangeError('값은 유한한 수여야 한다');
  const a = UNITS[from.unit];
  const b = UNITS[to.unit];
  let siPeak = from.value * a.si * toPeakFactor(from.detector);
  const steps = ORDER[b.quantity] - ORDER[a.quantity];
  if (steps !== 0) {
    if (freq === undefined || !(freq > 0)) throw new RangeError('변위·속도·가속도 사이 환산에는 양의 주파수가 필요하다');
    siPeak *= (2 * Math.PI * freq) ** steps;
  }
  return siPeak / b.si / toPeakFactor(to.detector);
}
