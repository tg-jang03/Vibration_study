/**
 * P11-1 본문 그림용 예시 기계 (D-052). 랩(LAB-CASE-01) 케이스와 회전수·요소 수·크기가 다른 기계라,
 * 그림이 랩의 풀이를 미리 보여 주지 않는다. 계산은 같은 엔진(`engine.ts`)을 쓴다. 모두 가상의 기계다.
 */
import { supportVec, type CaseMachine, type Source, type Vec } from './engine';
import * as M from './machines';

/** 그림 2·3: 4극 전동기 펌프, 볼 8개 베어링 외륜 결함, 베인 5개 */
export const EX_BRG: CaseMachine = { ...M.M_PUMP, name: '순환수 펌프 (예시)', rpm: 1775, balls: 8, blades: 5, seed: 3101 };
export const EX_BRG_SRC: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [0.9, 30], V: [0.8, 120], A: [0.25, 60] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.25, 80], V: [0.2, 120], A: [0.15, 70] } },
  { kind: 'sync', order: 5, force: 'mass', casing: { H: [0.45, 20], V: [0.4, 70], A: [0.15, 10] } },
  { kind: 'fixed', f: 120, electric: true, casing: { H: [0.08, 0], V: [0.07, 0], A: [0.02, 0] } },
  { kind: 'impact', defect: 'outer', g: 1.1, lineVel: 0.04 },
];

/** 그림 4: 2극 전동기 직결 팬 — 2X(119.0 Hz)와 2×LF(120 Hz) */
export const EX_2LF: CaseMachine = { ...M.M_FAN9, name: '냉각탑 팬 (예시)', rpm: 3570, seed: 3201 };
export const EX_2LF_SRC: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [1.0, 50], V: [0.9, 140], A: [0.3, 60] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.9, 70], V: [0.8, 75], A: [1.4, 95] } },
  { kind: 'fixed', f: 120, electric: true, casing: { H: [1.3, 0], V: [1.6, 0], A: [0.2, 0] } },
];

/** 그림 5: 증속기 GMF 2836.7 Hz (115이빨 × 24.67 Hz)가 f_s 2560 Hz에서 276.7 Hz로 접힌다 */
export const EX_ALIAS: CaseMachine = { ...M.M_BLOWER, name: '공기 압축기 증속기 (예시)', rpm: 1480, gear: { zIn: 115, zOut: 31 }, seed: 3301 };
export const EX_ALIAS_SRC: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [0.8, 40], V: [0.7, 130], A: [0.3, 60] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.2, 70], V: [0.18, 110], A: [0.12, 40] } },
  { kind: 'gear', zIn: 115, zOut: 31, mesh: { H: 0.9, V: 0.75, A: 0.6 }, h2: 0.25, sidebands: { shaft: 'in', count: 2, ratio: 0.08, decay: 0.4 } },
];

/** 그림 6: 근접 프로브 궤도의 런아웃 22 µm가 감시값에 더해진 압축기 */
export const EX_RUNOUT: CaseMachine = { ...M.M_COMP_B, name: '냉동 압축기 (예시)', rpm: 8800, rotor: { fn: 58, zeta: 0.14 }, seed: 3401 };
export const EX_RUNOUT_SRC: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [0.7, 200], V: [0.6, 290], A: [0.15, 200] }, shaft: { X: [12, 200], Y: [11.5, 290] } },
  { kind: 'sync', order: 1, force: 'runout', shaft: { X: [22, 160], Y: [21, 250] } },
  { kind: 'sync', order: 2, force: 'runout', shaft: { X: [6, 30], Y: [6, 210] } },
];

/** 그림 7: 받침 수평 모드 23.6 Hz 위에서 1480 rpm(24.67 Hz)으로 도는 팬 */
export const EX_RES: CaseMachine = {
  ...M.M_FRAME,
  name: '환기 팬 (예시)',
  rpm: 1480,
  support: { H: [{ fn: 23.6, zeta: 0.03, k: 5e6 }, { fn: 120, zeta: 0.03, k: 8e7 }], V: [{ fn: 64, zeta: 0.04, k: 5e7 }], A: [{ fn: 48, zeta: 0.05, k: 3e7 }] },
  seed: 3501,
};
const resVec = (d: 'H' | 'V', base: number, lag0: number): Vec => {
  const [g, lag] = supportVec(EX_RES, d, EX_RES.rpm / 60);
  return [base * g, lag0 + lag];
};
export const EX_RES_SRC: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: resVec('H', 1.1, 30), V: resVec('V', 1.1, 120), A: [0.25, 80] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.2, 60], V: [0.18, 100], A: [0.12, 30] } },
];

/** 그림 8: 정속에서 1X 벡터가 1.6시간 주기로 도는 압축기 (Morton형) */
export const EX_MORTON: CaseMachine = { ...M.M_MORTON, name: '수소 압축기 (예시)', rpm: 12500, seed: 3601 };
export const EX_MORTON_SRC: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [1.2, 60], V: [1.1, 150], A: [0.25, 70] }, shaft: { X: [24, 60], Y: [23, 150] }, thermal: { ratio: 0.45, periodH: 1.6, angle: 40 } },
  { kind: 'sync', order: 2, force: 'const', shaft: { X: [1.5, 30], Y: [1.5, 120] } },
];
