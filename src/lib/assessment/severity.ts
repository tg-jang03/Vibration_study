/** Generic comparison of user-supplied limits. No regulatory values or machine defaults. */
export type Zone = 'A' | 'B' | 'C' | 'D';
export type Limits = readonly [number, number, number];
export type Boundary = 'A/B' | 'B/C' | 'C/D';
export type MagnitudeResult = { zone: Zone; boundary: null } | { zone: null; boundary: Boundary };

export function parseNonnegative(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function validLimits(limits: Limits): boolean {
  return limits.every(Number.isFinite) && limits[0] > 0 && limits[0] < limits[1] && limits[1] < limits[2];
}

/** Values and limits must have the same measurement quantity, statistic, band and units. */
export function compareMagnitude(value: number, limits: Limits, equality: 'upper' | 'review' = 'review'): MagnitudeResult {
  if (!Number.isFinite(value) || value < 0 || !validLimits(limits)) throw new RangeError('Invalid magnitude or limits');
  const at = limits.indexOf(value);
  if (at >= 0 && equality === 'review') return { zone: null, boundary: (['A/B', 'B/C', 'C/D'] as const)[at] };
  const index = limits.findIndex(limit => value < limit);
  return { zone: (['A', 'B', 'C', 'D'] as const)[index < 0 ? 3 : index], boundary: null };
}

/** Arithmetic comparison only. A rate is supplied by the user, never inferred from the standard. */
export function compareChange(value: number, baseline: number, bc: number, rate: number | null = null) {
  if (![value, baseline, bc].every(Number.isFinite) || value < 0 || baseline < 0 || bc <= 0 ||
      (rate !== null && (!Number.isFinite(rate) || rate <= 0))) throw new RangeError('Invalid change inputs');
  const delta = value - baseline;
  let percentOfBC = 100 * (Math.abs(delta) / bc);
  if (!Number.isFinite(percentOfBC)) throw new RangeError('Change ratio exceeds numerical range');
  // Keep a mathematically equal rate at equality after SI conversion and subtraction.
  const equal = rate !== null && Math.abs(percentOfBC - rate) <= 32 * Number.EPSILON * Math.max(1, percentOfBC, rate);
  if (equal) percentOfBC = rate!;
  return { delta: delta === 0 ? 0 : delta, absoluteDelta: Math.abs(delta), percentOfBC,
    comparison: rate === null ? 'unset' as const : equal ? 'equal' as const : percentOfBC > rate ? 'above' as const : 'below' as const };
}

/** Fictional dimensionless exercise; these values are not ISO thresholds. */
export const DEMO = { limits: [2, 5, 9] as Limits, value: 3, baseline: 1.5, rate: 20 } as const;
