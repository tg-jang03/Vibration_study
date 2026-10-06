/** 1자유도 질량-스프링-감쇠계의 자유응답. 모든 입력·출력은 SI 단위다. */

export interface SdofSystem {
  mass: number;
  stiffness: number;
  damping?: number;
}

export interface InitialState {
  x0: number;
  v0?: number;
}

export interface SdofState {
  x: number;
  v: number;
  a: number;
}

export interface SdofProperties {
  omegaN: number;
  frequencyHz: number;
  period: number;
  criticalDamping: number;
  zeta: number;
  omegaD: number | null;
  logDecrement: number | null;
  regime: 'undamped' | 'underdamped' | 'critical' | 'overdamped';
}

function finite(name: string, value: number): number {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  return value;
}

function positive(name: string, value: number): number {
  finite(name, value);
  if (value <= 0) throw new RangeError(`${name} must be > 0`);
  return value;
}

function nonnegative(name: string, value: number): number {
  finite(name, value);
  if (value < 0) throw new RangeError(`${name} must be >= 0`);
  return value;
}

export function sdofProperties(system: SdofSystem): SdofProperties {
  const mass = positive('mass', system.mass);
  const stiffness = positive('stiffness', system.stiffness);
  const damping = nonnegative('damping', system.damping ?? 0);
  const omegaN = Math.sqrt(stiffness / mass);
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  const zeta = damping / criticalDamping;
  const nearCritical = Math.abs(zeta - 1) <= 1e-10;
  const regime = damping === 0 ? 'undamped' : nearCritical ? 'critical' : zeta < 1 ? 'underdamped' : 'overdamped';
  const omegaD = zeta < 1 ? omegaN * Math.sqrt(1 - zeta ** 2) : null;
  const logDecrement = zeta < 1 ? (2 * Math.PI * zeta) / Math.sqrt(1 - zeta ** 2) : null;

  return {
    omegaN,
    frequencyHz: omegaN / (2 * Math.PI),
    period: (2 * Math.PI) / omegaN,
    criticalDamping,
    zeta,
    omegaD,
    logDecrement,
    regime,
  };
}

/** m x¨ + c x˙ + kx = 0의 해석해를 한 시각에서 계산한다. */
export function freeResponseAt(system: SdofSystem, initial: InitialState, time: number): SdofState {
  const props = sdofProperties(system);
  const x0 = finite('x0', initial.x0);
  const v0 = finite('v0', initial.v0 ?? 0);
  const t = nonnegative('time', time);
  const { omegaN, zeta, regime } = props;
  let x: number;
  let v: number;

  if (regime === 'undamped') {
    const wt = omegaN * t;
    x = x0 * Math.cos(wt) + (v0 / omegaN) * Math.sin(wt);
    v = -x0 * omegaN * Math.sin(wt) + v0 * Math.cos(wt);
  } else if (regime === 'underdamped') {
    const omegaD = props.omegaD as number;
    const alpha = zeta * omegaN;
    const b = (v0 + alpha * x0) / omegaD;
    const c = Math.cos(omegaD * t);
    const s = Math.sin(omegaD * t);
    const decay = Math.exp(-alpha * t);
    x = decay * (x0 * c + b * s);
    v = decay * ((-alpha * x0 + b * omegaD) * c + (-alpha * b - x0 * omegaD) * s);
  } else if (regime === 'critical') {
    const b = v0 + omegaN * x0;
    const decay = Math.exp(-omegaN * t);
    x = decay * (x0 + b * t);
    v = decay * (b - omegaN * (x0 + b * t));
  } else {
    const q = Math.sqrt(zeta ** 2 - 1);
    const r1 = -omegaN * (zeta - q);
    const r2 = -omegaN * (zeta + q);
    const c1 = (v0 - r2 * x0) / (r1 - r2);
    const c2 = x0 - c1;
    x = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
    v = c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t);
  }

  const damping = system.damping ?? 0;
  const a = -(damping * v + system.stiffness * x) / system.mass;
  return { x, v, a };
}

export function freeResponse(system: SdofSystem, initial: InitialState, times: ArrayLike<number>): SdofState[] {
  return Array.from(times, (time) => freeResponseAt(system, initial, time));
}
