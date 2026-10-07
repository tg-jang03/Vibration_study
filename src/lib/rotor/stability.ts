import type { Complex } from './jeffcott';
/** 등방 직접 k,c와 반대칭 교차 강성 q를 남긴 2방향 선형 학습 모델. SI 단위. */
export interface StabilitySystem { mass: number; stiffness: number; damping: number; crossStiffness: number }
export interface StabilityInitial { position: Complex; velocity: Complex }
export interface StabilityModes {
  forward: Complex; backward: Complex; eigenvalues: Complex[];
  omegaN: number; zeta: number; logDecrement: number;
  criticalCrossStiffness: number; criticalOmega: number;
  status: 'stable' | 'marginal' | 'unstable';
}
const add = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
const sub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
const mul = (a: Complex, b: Complex): Complex => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const div = (a: Complex, b: Complex): Complex => { const d = b.re ** 2 + b.im ** 2; return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }; };
const conj = (a: Complex): Complex => ({ re: a.re, im: -a.im });
const abs = (a: Complex) => Math.hypot(a.re, a.im);
function finitePositive(name: string, v: number, zero = false) {
  if (!Number.isFinite(v) || v < 0 || (!zero && v === 0)) throw new RangeError(`${name} must be finite and ${zero ? '>=0' : '>0'}`);
}
export function stabilityModes(s: StabilitySystem): StabilityModes {
  const { mass: m, stiffness: k, damping: c, crossStiffness: q } = s;
  finitePositive('mass', m); finitePositive('stiffness', k); finitePositive('damping', c); finitePositive('crossStiffness', q, true);
  const omegaN = Math.sqrt(k / m), zeta = c / (2 * m * omegaN);
  if (zeta >= 1) throw new RangeError('this teaching model requires 0 < zeta < 1');
  // underdamped이면 D의 실수부가 음수. 작은 q에서 실수 제곱근의 cancellation을 피한다.
  const a = c * c - 4 * m * k, b = 4 * m * q, v = Math.sqrt((Math.hypot(a, b) - a) / 2), u = b / (2 * v);
  let sigma = (-c + u) / (2 * m);
  if (Math.abs(sigma) <= 1e-12 * omegaN) sigma = 0;
  const forward = { re: sigma, im: v / (2 * m) }, backward = { re: (-c - u) / (2 * m), im: -v / (2 * m) };
  return { forward, backward, eigenvalues: [forward, conj(forward), backward, conj(backward)], omegaN, zeta,
    logDecrement: sigma === 0 ? 0 : -2 * Math.PI * sigma / forward.im,
    criticalCrossStiffness: c * omegaN, criticalOmega: 2 * omegaN,
    status: sigma < 0 ? 'stable' : sigma > 0 ? 'unstable' : 'marginal' };
}
export function stabilityExample(naturalRpm = 3000, zeta = .05, crossRatio = .05): StabilitySystem {
  finitePositive('naturalRpm', naturalRpm); finitePositive('zeta', zeta); finitePositive('crossRatio', crossRatio, true);
  if (zeta >= 1) throw new RangeError('zeta must be <1');
  const mass = 10, omega = naturalRpm * Math.PI / 30, stiffness = mass * omega ** 2;
  return { mass, stiffness, damping: 2 * zeta * mass * omega, crossStiffness: crossRatio * stiffness };
}
export function speedCoupledSystem(s: StabilitySystem, omega: number): StabilitySystem {
  stabilityModes(s); finitePositive('omega', omega, true);
  return { ...s, crossStiffness: s.damping * omega / 2 };
}
export function forwardInitial(s: StabilitySystem, amplitude: number): StabilityInitial {
  finitePositive('amplitude', amplitude, true); const f = stabilityModes(s).forward;
  return { position: { re: amplitude, im: 0 }, velocity: { re: f.re * amplitude, im: f.im * amplitude } };
}
export function modalAmplitudes(s: StabilitySystem, initial: StabilityInitial) {
  if (![initial.position.re, initial.position.im, initial.velocity.re, initial.velocity.im].every(Number.isFinite)) throw new RangeError('initial state must be finite');
  const { forward: f, backward: b } = stabilityModes(s), denominator = sub(f, b);
  return { forward: div(sub(initial.velocity, mul(b, initial.position)), denominator), backward: div(sub(mul(f, initial.position), initial.velocity), denominator) };
}
export function stabilityResponseAt(s: StabilitySystem, initial: StabilityInitial, time: number) {
  finitePositive('time', time, true); const modes = stabilityModes(s), amplitude = modalAmplitudes(s, initial);
  const exp = (lambda: Complex): Complex => ({ re: Math.exp(lambda.re * time) * Math.cos(lambda.im * time), im: Math.exp(lambda.re * time) * Math.sin(lambda.im * time) });
  const f = mul(amplitude.forward, exp(modes.forward)), b = mul(amplitude.backward, exp(modes.backward));
  const position = add(f, b), velocity = add(mul(modes.forward, f), mul(modes.backward, b));
  const acceleration = add(mul(mul(modes.forward, modes.forward), f), mul(mul(modes.backward, modes.backward), b));
  const envelope = abs(amplitude.forward) * Math.exp(modes.forward.re * time) + abs(amplitude.backward) * Math.exp(modes.backward.re * time);
  if (![position.re, position.im, velocity.re, velocity.im, acceleration.re, acceleration.im, envelope].every(Number.isFinite)) throw new RangeError('linear response overflow: shorten the time range');
  return { time, position, velocity, acceleration, envelope };
}
/** 최대 8 고유 주기. 포락선 상한이 초기 모드 계수 합의 20배 이상 커지기 전에 표시를 끝낸다. */
export function sampleStabilityResponse(s: StabilitySystem, initial: StabilityInitial, count = 501) {
  if (!Number.isInteger(count) || count < 2) throw new RangeError('count must be an integer >=2');
  const m = stabilityModes(s), nominal = 8 * 2 * Math.PI / m.omegaN;
  const end = m.forward.re > 0 ? Math.min(nominal, Math.log(20) / m.forward.re) : nominal;
  return Array.from({ length: count }, (_, i) => stabilityResponseAt(s, initial, end * i / (count - 1)));
}
/** 별도 가상 주파수선: 실제 유막/FFT/안정성 발생 한계·진폭 해가 아니다. */
export function whirlWhipFrequency(rotatingHz: number, modeHz: number, swirlRatio = .45): number {
  finitePositive('rotatingHz', rotatingHz, true); finitePositive('modeHz', modeHz); finitePositive('swirlRatio', swirlRatio);
  if (swirlRatio >= 1) throw new RangeError('swirlRatio must be <1');
  return Math.min(swirlRatio * rotatingHz, modeHz);
}
export function whirlWhipPreview(modeHz = 50) {
  finitePositive('modeHz', modeHz);
  const frequencies = Array.from({ length: 301 }, (_, i) => 2.1 * modeHz * i / 300);
  return Array.from({ length: 7 }, (_, i) => {
    const rotatingHz = modeHz * (1.5 + i * .25), peak = whirlWhipFrequency(rotatingHz, modeHz);
    return { rpm: rotatingHz * 60, peak, frequencies, normalized: frequencies.map(f => Math.exp(-.5 * ((f - peak) / (modeHz * .025)) ** 2)) };
  });
}
/** 자이로 효과를 설명하기 위한 가상 모드선. 실제 로터 해석 결과가 아니다. */
export function campbellIllustration(ratio: number, gyro = .2) {
  finitePositive('ratio', ratio, true); finitePositive('gyro', gyro, true);
  const h = Math.hypot(1, gyro * ratio / 2), shift = gyro * ratio / 2;
  return { forwardRatio: h + shift, backwardRatio: h - shift };
}
