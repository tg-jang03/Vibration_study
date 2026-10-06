export interface UnbalanceResponse {
  forceAmplitude: number;
  responseFactor: number;
  displacementAmplitude: number;
  phaseLag: number;
}

export interface UnbalancePeak {
  frequencyRatio: number;
  responseFactor: number;
}

function nonnegative(name: string, value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and >= 0`);
  return value;
}

function positive(name: string, value: number): number {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and > 0`);
  return value;
}

/** m_u e Ω². unbalanceMassEccentricity 단위는 kg·m. */
export function unbalanceForce(unbalanceMassEccentricity: number, omega: number): number {
  return nonnegative('unbalanceMassEccentricity', unbalanceMassEccentricity) * nonnegative('omega', omega) ** 2;
}

/** r² / sqrt((1-r²)² + (2ζr)²). */
export function unbalanceResponseFactor(frequencyRatio: number, zeta: number): { factor: number; phaseLag: number } {
  const r = nonnegative('frequencyRatio', frequencyRatio);
  const z = nonnegative('zeta', zeta);
  const real = 1 - r ** 2;
  const imaginary = 2 * z * r;
  const denominator = Math.hypot(real, imaginary);
  return {
    factor: denominator === 0 ? Number.POSITIVE_INFINITY : r ** 2 / denominator,
    phaseLag: denominator === 0 ? Math.PI / 2 : Math.atan2(imaginary, real),
  };
}

/**
 * 불평형 진폭비 피크 위치와 높이.
 * ζ < 1/√2 ≈ 0.7071 일 때만 1보다 큰 피크가 존재한다:
 * r_peak = 1 / sqrt(1 - 2ζ²),  factor_peak = 1 / (2ζ * sqrt(1 - ζ²)).
 */
export function unbalancePeak(zeta: number): UnbalancePeak | null {
  const z = nonnegative('zeta', zeta);
  if (z >= 1 / Math.SQRT2) return null;
  const rPeak = 1 / Math.sqrt(1 - 2 * z ** 2);
  const factorPeak = 1 / (2 * z * Math.sqrt(1 - z ** 2));
  return { frequencyRatio: rPeak, responseFactor: factorPeak };
}

export function unbalanceSteadyState(
  totalMass: number,
  unbalanceMassEccentricity: number,
  omega: number,
  omegaN: number,
  zeta: number,
): UnbalanceResponse {
  const mass = positive('totalMass', totalMass);
  const speed = nonnegative('omega', omega);
  const natural = positive('omegaN', omegaN);
  const response = unbalanceResponseFactor(speed / natural, zeta);
  return {
    forceAmplitude: unbalanceForce(unbalanceMassEccentricity, speed),
    responseFactor: response.factor,
    displacementAmplitude: (unbalanceMassEccentricity / mass) * response.factor,
    phaseLag: response.phaseLag,
  };
}
