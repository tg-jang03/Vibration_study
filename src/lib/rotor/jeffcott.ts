import { unbalanceResponseFactor } from '../mck/unbalance';

/** Jeffcott 정상상태 해. SI: m[kg], k[N/m], c[N·s/m], e[m], Ω[rad/s]. */
export interface JeffcottRotor {
  mass: number;
  kx: number;
  ky: number;
  damping: number;
  eccentricity: number;
}
export interface Complex { re: number; im: number }
export interface JeffcottResponse {
  x: Complex;
  y: Complex;
  forward: Complex;
  backward: Complex;
  amplitudeX: number;
  amplitudeY: number;
  amplitudeForward: number;
  amplitudeBackward: number;
  /** 각 방향 가진력에 대한 지연. Y의 cos 기준 phasor 위상과는 90° 차이. */
  lagX: number;
  lagY: number;
  direction: 'forward' | 'backward' | 'line' | 'stationary';
  omegaX: number;
  omegaY: number;
}
const abs = (z: Complex) => Math.hypot(z.re, z.im);
const mulExp = (z: Complex, angle: number): Complex => ({ re: z.re * Math.cos(angle) - z.im * Math.sin(angle), im: z.re * Math.sin(angle) + z.im * Math.cos(angle) });
function check(name: string, v: number, positive = false) {
  if (!Number.isFinite(v) || v < 0 || (positive && v === 0)) throw new RangeError(`${name} must be finite and ${positive ? '> 0' : '>= 0'}`);
}

export const P42_EXAMPLE = { mass: 10, omegaX: 100 * Math.PI, eccentricity: 10e-6, zetaX: 0.05, stiffnessRatio: 1, omega: 100 * Math.PI } as const;
/** x방향 감쇠비를 입력하며 c는 두 방향에 공통으로 적용한다. */
export function exampleRotor(stiffnessRatio = 1, zetaX = 0.05): JeffcottRotor {
  check('stiffnessRatio', stiffnessRatio, true);
  check('zetaX', zetaX);
  const { mass, omegaX, eccentricity } = P42_EXAMPLE;
  const kx = mass * omegaX ** 2;
  return { mass, kx, ky: kx * stiffnessRatio, damping: 2 * zetaX * mass * omegaX, eccentricity };
}

export function jeffcottResponse(rotor: JeffcottRotor, omega: number): JeffcottResponse {
  check('mass', rotor.mass, true); check('kx', rotor.kx, true); check('ky', rotor.ky, true);
  check('damping', rotor.damping); check('eccentricity', rotor.eccentricity); check('omega', omega);
  const omegaX = Math.sqrt(rotor.kx / rotor.mass);
  const omegaY = Math.sqrt(rotor.ky / rotor.mass);
  const response = (natural: number) => unbalanceResponseFactor(omega / natural, rotor.damping / (2 * rotor.mass * natural));
  const rx = response(omegaX), ry = response(omegaY);
  if (rotor.eccentricity > 0 && (!Number.isFinite(rx.factor) || !Number.isFinite(ry.factor))) throw new RangeError('Undamped resonance has no bounded steady-state solution');
  const ax = rotor.eccentricity === 0 ? 0 : rotor.eccentricity * rx.factor;
  const ay = rotor.eccentricity === 0 ? 0 : rotor.eccentricity * ry.factor;
  const x = { re: ax * Math.cos(rx.phaseLag), im: -ax * Math.sin(rx.phaseLag) };
  // sin Ωt = Re(-j exp(jΩt)); Y = -j F/Dy.
  const y = { re: -ay * Math.sin(ry.phaseLag), im: -ay * Math.cos(ry.phaseLag) };
  const forward = { re: (x.re - y.im) / 2, im: (x.im + y.re) / 2 };
  const backward = { re: (x.re + y.im) / 2, im: (-x.im + y.re) / 2 };
  const af = abs(forward), rawAb = abs(backward);
  const ab = rawAb <= 1e-12 * Math.max(ax, ay) ? 0 : rawAb;
  if (ab === 0) { backward.re = 0; backward.im = 0; }
  const scale = Math.max(af, ab);
  const direction = scale === 0 ? 'stationary' : Math.abs(af - ab) <= 1e-10 * scale ? 'line' : af > ab ? 'forward' : 'backward';
  return { x, y, forward, backward, amplitudeX: ax, amplitudeY: ay, amplitudeForward: af, amplitudeBackward: ab, lagX: ax === 0 ? 0 : rx.phaseLag, lagY: ay === 0 ? 0 : ry.phaseLag, direction, omegaX, omegaY };
}

/** θ=Ωt. 정방향은 +θ(반시계), 역방향은 −θ(시계). */
export function orbitPoint(response: JeffcottResponse, theta: number) {
  if (!Number.isFinite(theta)) throw new RangeError('theta must be finite');
  const f = mulExp(response.forward, theta), b = mulExp(response.backward, -theta);
  return { x: f.re + b.re, y: f.im + b.im, forwardX: f.re, forwardY: f.im, backwardX: b.re, backwardY: b.im };
}
export function sampleOrbit(response: JeffcottResponse, samples = 181) {
  if (!Number.isInteger(samples) || samples < 3) throw new RangeError('samples must be an integer >= 3');
  return Array.from({ length: samples }, (_, i) => ({ theta: 2 * Math.PI * i / (samples - 1), ...orbitPoint(response, 2 * Math.PI * i / (samples - 1)) }));
}
