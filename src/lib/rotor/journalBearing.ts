import { PROBE, gapVoltage, distanceFromVoltage, inLinearRange, type ProbeCalibration } from '../proximity';

/** Ocvirk 짧은 원통 베어링의 정적 half-Sommerfeld 해. 모든 단위는 SI. */
export interface JournalBearing { radius: number; length: number; radialClearance: number }
export interface Point { x: number; y: number }
export interface JournalState extends Point {
  eccentricityRatio: number;
  attitude: number;
  minimumFilm: number;
  contactReference: boolean;
}
export const P43_BEARING: JournalBearing = { radius: .05, length: .025, radialClearance: 100e-6 };
export const P43_EXAMPLE = { load: 1000, viscosity: .02, omega: 100 * Math.PI, coldGap: 1.2e-3 };
const positive = (name: string, v: number, allowZero = false) => {
  if (!Number.isFinite(v) || v < 0 || (!allowZero && v === 0)) throw new RangeError(`${name} must be finite and ${allowZero ? '>= 0' : '> 0'}`);
};
const checkGeometry = (b: JournalBearing) => {
  positive('radius', b.radius); positive('length', b.length); positive('radialClearance', b.radialClearance);
  if (b.radialClearance >= b.radius) throw new RangeError('radialClearance must be smaller than radius');
};
function checkEpsilon(e: number) {
  if (!Number.isFinite(e) || e < 0 || e >= 1) throw new RangeError('eccentricityRatio must be in [0,1)');
}
/** W C_r²/(μ Ω R L³). NACA TN-2808, Applied Load (1952). */
export function loadFactor(epsilon: number): number {
  checkEpsilon(epsilon);
  return epsilon * Math.sqrt(16 * epsilon ** 2 + Math.PI ** 2 * (1 - epsilon ** 2)) / (4 * (1 - epsilon ** 2) ** 2);
}
/** 하중 방향(아래)과 중심 연결선 사이 각도 크기 [rad]. */
export function attitudeAngle(epsilon: number): number {
  checkEpsilon(epsilon);
  return Math.atan2(Math.PI * Math.sqrt(1 - epsilon ** 2), 4 * epsilon);
}
export function shortBearingLoad(b: JournalBearing, epsilon: number, omega: number, viscosity: number): number {
  checkGeometry(b); positive('omega', omega, true); positive('viscosity', viscosity);
  return viscosity * omega * b.radius * b.length ** 3 / b.radialClearance ** 2 * loadFactor(epsilon);
}

/** 하중은 수직 아래. +x 오른쪽,+y 위. 반시계 자전이면 x>0, 시계면 x<0. */
export function journalEquilibrium(b: JournalBearing, load: number, omega: number, viscosity: number, rotation: 'ccw' | 'cw' = 'ccw'): JournalState {
  checkGeometry(b); positive('load', load); positive('omega', omega, true); positive('viscosity', viscosity);
  if (rotation !== 'ccw' && rotation !== 'cw') throw new RangeError('rotation must be ccw or cw');
  const cr = b.radialClearance;
  if (omega === 0) return { x: 0, y: -cr, eccentricityRatio: 1, attitude: 0, minimumFilm: 0, contactReference: true };
  let low = 0, high = 1 - Number.EPSILON;
  const scale = viscosity * omega * b.radius * b.length ** 3 / cr ** 2;
  for (let i = 0; i < 70; i++) {
    const mid = (low + high) / 2;
    if (scale * loadFactor(mid) < load) low = mid; else high = mid;
  }
  const epsilon = (low + high) / 2, attitude = attitudeAngle(epsilon);
  return { x: (rotation === 'ccw' ? 1 : -1) * cr * epsilon * Math.sin(attitude), y: -cr * epsilon * Math.cos(attitude), eccentricityRatio: epsilon, attitude, minimumFilm: cr * (1 - epsilon), contactReference: false };
}

/** θ는 최대 간극에서 자전 방향으로 잰 각도. 수렴 반원 0<θ<π만 양압, z는 축 길이 중앙 기준. */
export function shortBearingPressure(b: JournalBearing, epsilon: number, omega: number, viscosity: number, theta: number, axial: number): number {
  checkGeometry(b); checkEpsilon(epsilon); positive('omega', omega, true); positive('viscosity', viscosity);
  if (!Number.isFinite(theta) || !Number.isFinite(axial)) throw new RangeError('coordinates must be finite');
  if (Math.abs(axial) > b.length / 2) throw new RangeError('axial coordinate is outside the bearing');
  if (theta <= 0 || theta >= Math.PI) return 0;
  return 3 * viscosity * omega * epsilon * (b.length ** 2 / 4 - axial ** 2) * Math.sin(theta) / (b.radialClearance ** 2 * (1 + epsilon * Math.cos(theta)) ** 3);
}

export interface ProbeSetup {
  coldGap: number;
  angleA?: number;
  angleB?: number;
  useColdPosition?: boolean;
  /** cold 기록 뒤 A 채널에만 추가된 DC drift [V] */
  driftA?: number;
  /** cold·운전 두 기록에 공통인 동일 바이어스 [V]. 차분에서는 소거된다. */
  commonBias?: number;
  runoutAmplitude?: number;
  probe?: ProbeCalibration;
}
export interface CenterlineMeasurement {
  voltageA: number; voltageB: number; coldVoltage: number;
  gapA: number; gapB: number;
  valid: boolean; reconstructed: Point | null; error: number | null;
}
/** 선형일 때 정수 한 회전 평균. 센서 법선에 대한 1차 gap 투영(간극 ≪ 축 반경). */
export function measureCenterline(b: JournalBearing, position: Point, setup: ProbeSetup): CenterlineMeasurement {
  checkGeometry(b); positive('coldGap', setup.coldGap); positive('runoutAmplitude', setup.runoutAmplitude ?? 0, true);
  const probe = setup.probe ?? PROBE;
  positive('sensitivity', probe.sensitivity);
  const a = setup.angleA ?? Math.PI / 4, c = setup.angleB ?? 3 * Math.PI / 4;
  const drift = setup.driftA ?? 0, bias = setup.commonBias ?? 0;
  if (![a, c, drift, bias, position.x, position.y].every(Number.isFinite)) throw new RangeError('probe inputs must be finite');
  const ax = Math.cos(a), ay = Math.sin(a), bx = Math.cos(c), by = Math.sin(c), determinant = ax * by - ay * bx;
  if (Math.abs(determinant) < 1e-8) throw new RangeError('probe directions must be independent');
  const coldY = -b.radialClearance;
  const gapA = setup.coldGap - ax * position.x - ay * (position.y - coldY);
  const gapB = setup.coldGap - bx * position.x - by * (position.y - coldY);
  const amplitude = setup.runoutAmplitude ?? 0;
  let voltageA = 0, voltageB = 0, valid = inLinearRange(setup.coldGap, probe);
  const n = amplitude === 0 ? 1 : 128;
  for (let i = 0; i < n; i++) {
    const theta = 2 * Math.PI * i / n;
    const da = gapA + amplitude * Math.cos(theta), db = gapB + amplitude * Math.sin(theta);
    valid &&= inLinearRange(da, probe) && inLinearRange(db, probe);
    voltageA += gapVoltage(da, probe) / n; voltageB += gapVoltage(db, probe) / n;
  }
  voltageA += bias + drift; voltageB += bias;
  const coldVoltage = gapVoltage(setup.coldGap, probe) + bias;
  valid &&= inLinearRange(distanceFromVoltage(voltageA, probe.sensitivity), probe) && inLinearRange(distanceFromVoltage(voltageB, probe.sensitivity), probe);
  if (!valid) return { voltageA, voltageB, coldVoltage, gapA, gapB, valid: false, reconstructed: null, error: null };
  const qa = (voltageA - coldVoltage) / probe.sensitivity, qb = (voltageB - coldVoltage) / probe.sensitivity;
  const reconstructed = { x: (qa * by - ay * qb) / determinant, y: (ax * qb - qa * bx) / determinant + (setup.useColdPosition === false ? 0 : coldY) };
  const rawError = Math.hypot(reconstructed.x - position.x, reconstructed.y - position.y);
  return { voltageA, voltageB, coldVoltage, gapA, gapB, valid: true, reconstructed, error: rawError < 1e-12 ? 0 : rawError };
}
