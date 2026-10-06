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

export interface TwoDofInitialState {
  x1: number;
  x2: number;
  v1?: number;
  v2?: number;
}

export interface TwoDofState {
  x1: number;
  x2: number;
  v1: number;
  v2: number;
  /** 모드 1 기여분 [x1, x2] */
  mode1: [number, number];
  /** 모드 2 기여분 [x1, x2] */
  mode2: [number, number];
}

/** 2자유도 비감쇠 자유진동 시간 응답 (모드 중첩 해석해). */
export function twoDofFreeResponseAt(
  system: TwoDofSystem,
  initial: TwoDofInitialState,
  time: number,
): TwoDofState {
  const modes = twoDofModes(system);
  const m1 = positive('mass1', system.mass1);
  const m2 = positive('mass2', system.mass2);
  const x1_0 = initial.x1;
  const x2_0 = initial.x2;
  const v1_0 = initial.v1 ?? 0;
  const v2_0 = initial.v2 ?? 0;

  const modal = modes.map((m) => {
    const phi1 = m.shape[0];
    const phi2 = m.shape[1];
    const modalMass = m1 * phi1 ** 2 + m2 * phi2 ** 2;
    const eta0 = (m1 * x1_0 * phi1 + m2 * x2_0 * phi2) / modalMass;
    const etaDot0 = (m1 * v1_0 * phi1 + m2 * v2_0 * phi2) / modalMass;
    const cosTerm = eta0 * Math.cos(m.omega * time);
    const sinTerm = m.omega === 0 ? etaDot0 * time : (etaDot0 / m.omega) * Math.sin(m.omega * time);
    const eta = cosTerm + sinTerm;
    const etaDot = -m.omega * eta0 * Math.sin(m.omega * time) + etaDot0 * Math.cos(m.omega * time);
    return {
      contribX: [phi1 * eta, phi2 * eta] as [number, number],
      contribV: [phi1 * etaDot, phi2 * etaDot] as [number, number],
    };
  });

  return {
    x1: modal[0].contribX[0] + modal[1].contribX[0],
    x2: modal[0].contribX[1] + modal[1].contribX[1],
    v1: modal[0].contribV[0] + modal[1].contribV[0],
    v2: modal[0].contribV[1] + modal[1].contribV[1],
    mode1: modal[0].contribX,
    mode2: modal[1].contribX,
  };
}

export function twoDofFreeResponse(
  system: TwoDofSystem,
  initial: TwoDofInitialState,
  times: ArrayLike<number>,
): TwoDofState[] {
  return Array.from(times, (t) => twoDofFreeResponseAt(system, initial, t));
}

/**
 * 2자유도 조화 가진 (모드 감쇠 ζ 적용) 시의 주파수응답 크기.
 * 질량 1에 크기 1의 힘을 가했을 때 질량 1, 2의 정상상태 진폭 X₁, X₂.
 */
export function twoDofForcedFRF(
  system: TwoDofSystem,
  forcingOmega: number,
  zeta = 0.03,
): { X1: number; X2: number } {
  const modes = twoDofModes(system);
  const m1 = positive('mass1', system.mass1);
  const m2 = positive('mass2', system.mass2);

  let real1 = 0;
  let imag1 = 0;
  let real2 = 0;
  let imag2 = 0;

  for (const m of modes) {
    const phi1 = m.shape[0];
    const phi2 = m.shape[1];
    const modalMass = m1 * phi1 ** 2 + m2 * phi2 ** 2;
    const denomReal = m.omega ** 2 - forcingOmega ** 2;
    const denomImag = 2 * zeta * m.omega * forcingOmega;
    const denomMagSq = denomReal ** 2 + denomImag ** 2;

    const factor = phi1 / (modalMass * denomMagSq);
    const etaReal = factor * denomReal;
    const etaImag = factor * -denomImag;

    real1 += phi1 * etaReal;
    imag1 += phi1 * etaImag;
    real2 += phi2 * etaReal;
    imag2 += phi2 * etaImag;
  }

  return {
    X1: Math.hypot(real1, imag1),
    X2: Math.hypot(real2, imag2),
  };
}
