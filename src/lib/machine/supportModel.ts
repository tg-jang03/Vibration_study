import { sdofProperties } from '../mck';

/** One-direction teaching model, NOT a general rotor/bearing assembly.
 * Massless connections carry the same force; their deflections add.
 * All values are SI. bearingStiffness is already equivalent for this path.
 */
export interface SupportModel {
  mass: number;
  shaftStiffness: number;
  bearingStiffness: number;
  supportStiffness: number;
}

export const SUPPORT_EXAMPLE: Readonly<SupportModel> = Object.freeze({
  mass: 100, shaftStiffness: 1e6, bearingStiffness: 2e6, supportStiffness: 1e6,
});

export function seriesStiffness(stiffnesses: readonly number[]): number {
  if (!stiffnesses.length || stiffnesses.some((k) => !Number.isFinite(k) || k <= 0)) {
    throw new RangeError('stiffnesses must be nonempty, finite and positive');
  }
  // Scale by the weakest spring to avoid overflow in reciprocal sums.
  const weakest = Math.min(...stiffnesses);
  return weakest / stiffnesses.reduce((sum, k) => sum + weakest / k, 0);
}

export function supportProperties(model: SupportModel) {
  const stiffness = seriesStiffness([model.shaftStiffness, model.bearingStiffness, model.supportStiffness]);
  const rigidSupportStiffness = seriesStiffness([model.shaftStiffness, model.bearingStiffness]);
  return {
    stiffness,
    frequencyHz: sdofProperties({ mass: model.mass, stiffness }).frequencyHz,
    rigidSupportStiffness,
    rigidSupportFrequencyHz: sdofProperties({ mass: model.mass, stiffness: rigidSupportStiffness }).frequencyHz,
  };
}
