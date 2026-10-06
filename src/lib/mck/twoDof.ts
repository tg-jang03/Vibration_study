export interface TwoDofSystem {
  mass1: number;
  mass2: number;
  stiffnessLeft: number;
  stiffnessCoupling: number;
  stiffnessRight: number;
}

export interface Mode {
  omega: number;
  frequencyHz: number;
  shape: [number, number];
}

function positive(name: string, value: number): number {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and > 0`);
  return value;
}

function normalizedShape(coupling: number, diagonal: number, lambda: number, mass1: number): [number, number] {
  let x1 = coupling;
  let x2 = diagonal - lambda * mass1;
  const scale = Math.max(Math.abs(x1), Math.abs(x2));
  x1 /= scale;
  x2 /= scale;
  if (x1 < 0) return [-x1, -x2];
  return [x1, x2];
}

/** det(K - ω²M) = 0을 푼 2자유도 고유진동수와 모드 형상. */
export function twoDofModes(system: TwoDofSystem): [Mode, Mode] {
  const m1 = positive('mass1', system.mass1);
  const m2 = positive('mass2', system.mass2);
  const kL = positive('stiffnessLeft', system.stiffnessLeft);
  const kC = positive('stiffnessCoupling', system.stiffnessCoupling);
  const kR = positive('stiffnessRight', system.stiffnessRight);
  const k11 = kL + kC;
  const k22 = kR + kC;
  const a = m1 * m2;
  const b = -(k11 * m2 + k22 * m1);
  const c = k11 * k22 - kC ** 2;
  const discriminant = Math.max(0, b ** 2 - 4 * a * c);
  const roots = [(-b - Math.sqrt(discriminant)) / (2 * a), (-b + Math.sqrt(discriminant)) / (2 * a)];

  return roots.map((lambda) => {
    const omega = Math.sqrt(lambda);
    return {
      omega,
      frequencyHz: omega / (2 * Math.PI),
      shape: normalizedShape(kC, k11, lambda, m1),
    };
  }) as [Mode, Mode];
}

export function symmetricTwoDofModes(mass: number, stiffness: number, coupling: number): [Mode, Mode] {
  return twoDofModes({
    mass1: mass,
    mass2: mass,
    stiffnessLeft: stiffness,
    stiffnessCoupling: coupling,
    stiffnessRight: stiffness,
  });
}
