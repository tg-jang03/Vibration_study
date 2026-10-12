/**
 * LAB-CASE-01 케이스 11개의 기계와 숨은 성분 (D-052). 모두 가상의 기계다 — 현장 자료가 아니다.
 * 크기는 원인 사이의 모양을 비교하려고 고른 설명용 값이다 (판정 기준 아님, I-009).
 * 성분 규칙은 `engine.ts`, 정답·해설은 `cases.ts`.
 */
import { supportVec, type CaseMachine, type Source, type Vec } from './engine';

const BRG = '구름베어링 (6205와 같은 치수비, 볼 9개)';

// ── 케이스 1: 보일러 송풍기 — 불평형 ──
export const M_FAN: CaseMachine = {
  name: '보일러 송풍기',
  blades: 10,
  rpm: 1785,
  lineHz: 60,
  drive: 'induction',
  balls: 9,
  probes: false,
  housingHz: 3300,
  housingZeta: 0.05,
  rotor: { fn: 78, zeta: 0.06 },
  support: { H: [{ fn: 62, zeta: 0.04, k: 4e7 }, { fn: 180, zeta: 0.03, k: 1.5e8 }], V: [{ fn: 88, zeta: 0.04, k: 7e7 }], A: [{ fn: 48, zeta: 0.05, k: 3e7 }] },
  coastTau: 25,
  noiseG: 0.01,
  noiseUm: 0.3,
  seed: 1101,
  table: [
    ['구동', '4극 유도전동기 60 Hz, 명판 1780 rpm (지금 1785 rpm)'],
    ['연결', '유연 커플링 직결'],
    ['회전체', '팬 날개 10개, 두 베어링 사이에 있음'],
    ['베어링', BRG],
    ['센서', '팬 구동측 베어링 하우징 가속도계 H·V·A (커플링 건너편 = 전동기 부하측)'],
  ],
};
export const S_FAN: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [5.2, 40], V: [4.3, 128], A: [0.5, 70] }, across: { H: [0.75, 15], V: [0.75, 12], A: [0.8, 175] }, growth: 0.5 },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.25, 100], V: [0.2, 150], A: [0.18, 80] } },
  { kind: 'sync', order: 10, force: 'mass', casing: { H: [0.35, 10], V: [0.3, 60], A: [0.15, 0] } },
  { kind: 'fixed', f: 120, electric: true, casing: { H: [0.06, 0], V: [0.05, 0], A: [0.02, 0] } },
];

// ── 케이스 2: 냉각수 펌프 — 외륜 결함 2단계 ──
export const M_PUMP: CaseMachine = {
  name: '냉각수 펌프',
  blades: 7,
  rpm: 3575,
  lineHz: 60,
  drive: 'induction',
  balls: 9,
  probes: false,
  housingHz: 3300,
  housingZeta: 0.05,
  rotor: { fn: 115, zeta: 0.08 },
  support: { H: [{ fn: 142, zeta: 0.04, k: 9e7 }], V: [{ fn: 195, zeta: 0.04, k: 1.4e8 }], A: [{ fn: 96, zeta: 0.05, k: 6e7 }] },
  coastTau: 6,
  noiseG: 0.012,
  noiseUm: 0.3,
  seed: 1201,
  table: [
    ['구동', '2극 유도전동기 60 Hz, 명판 3560 rpm (지금 3575 rpm)'],
    ['연결', '유연 커플링 직결'],
    ['회전체', '원심 임펠러 베인 7개'],
    ['베어링', BRG],
    ['센서', '펌프 구동측 베어링 하우징 가속도계 H·V·A'],
  ],
};
export const S_PUMP: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [1.1, 30], V: [0.9, 118], A: [0.3, 60] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.3, 80], V: [0.25, 120], A: [0.2, 70] } },
  { kind: 'sync', order: 7, force: 'mass', casing: { H: [0.55, 20], V: [0.45, 70], A: [0.2, 10] } },
  { kind: 'fixed', f: 120, electric: true, casing: { H: [0.1, 0], V: [0.08, 0], A: [0.02, 0] } },
  { kind: 'impact', defect: 'outer', g: 1.0, lineVel: 0.035, growth: 0.45 },
];

// ── 케이스 3: 컨베이어 감속기 — 깨진 이 (출력축 기어) ──
export const M_GEAR: CaseMachine = {
  name: '컨베이어 감속기',
  gear: { zIn: 23, zOut: 61 },
  rpm: 1485,
  lineHz: 50,
  drive: 'induction',
  balls: 9,
  probes: false,
  housingHz: 3000,
  housingZeta: 0.05,
  rotor: { fn: 140, zeta: 0.08 },
  support: { H: [{ fn: 160, zeta: 0.04, k: 1e8 }], V: [{ fn: 210, zeta: 0.04, k: 1.5e8 }], A: [{ fn: 120, zeta: 0.05, k: 8e7 }] },
  coastTau: 3,
  noiseG: 0.012,
  noiseUm: 0.3,
  seed: 1301,
  table: [
    ['구동', '4극 유도전동기 50 Hz, 1485 rpm'],
    ['감속기', '1단 평기어: 입력 피니언 23이빨 → 출력 기어 61이빨'],
    ['베어링', `입력축 ${BRG}`],
    ['센서', '감속기 입력축 베어링 하우징 가속도계 H·V·A'],
  ],
};
export const S_GEAR: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [0.9, 40], V: [0.8, 130], A: [0.4, 60] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.3, 70], V: [0.25, 110], A: [0.2, 40] } },
  { kind: 'sync', order: 23 / 61, force: 'mass', casing: { H: [0.3, 20], V: [0.25, 110], A: [0.1, 30] } },
  { kind: 'fixed', f: 100, electric: true, casing: { H: [0.08, 0], V: [0.06, 0], A: [0.02, 0] } },
  { kind: 'gear', zIn: 23, zOut: 61, mesh: { H: 1.5, V: 1.2, A: 0.9 }, h2: 0.35, sidebands: { shaft: 'out', count: 7, ratio: 0.3, decay: 0.15 }, broken: { shaft: 'out', g: 6 } },
];

// ── 케이스 4: 공정 압축기 A — 오일 휩 ──
export const M_COMP_A: CaseMachine = {
  name: '공정 압축기 A',
  rpm: 10500,
  lineHz: 60,
  drive: 'turbine',
  balls: 0,
  probes: true,
  housingHz: 3800,
  housingZeta: 0.05,
  rotor: { fn: 70, zeta: 0.12 },
  support: { H: [{ fn: 160, zeta: 0.05, k: 2e8 }], V: [{ fn: 230, zeta: 0.05, k: 3e8 }], A: [{ fn: 140, zeta: 0.05, k: 1.5e8 }] },
  coastTau: 40,
  noiseG: 0.008,
  noiseUm: 0.5,
  seed: 1401,
  table: [
    ['구동', '증기터빈 (전동기 없음), 정격 10,500 rpm'],
    ['회전체', '원심 임펠러 4단, 두 베어링 사이. 1차 임계속도 설계값 약 4,200 rpm'],
    ['베어링', '원통형 유막 베어링 (가벼운 하중)'],
    ['센서', '근접 프로브 X·Y (구동측 베어링) + 베어링 하우징 가속도계 H·V·A'],
    ['이력', '지난주 정격을 9,000 → 10,500 rpm으로 올림'],
  ],
};
export const S_COMP_A: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [1.0, 200], V: [0.9, 290], A: [0.2, 210] }, shaft: { X: [18, 230], Y: [17, 320] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.15, 30], V: [0.12, 120], A: [0.1, 40] }, shaft: { X: [2.5, 40], Y: [2.4, 130] } },
  { kind: 'sync', order: 1, force: 'runout', shaft: { X: [3, 300], Y: [3, 30] } },
  { kind: 'whirl', ratio: 0.45, onsetRpm: 6600, casing: { H: [1.6, 0], V: [1.5, 90], A: [0.2, 0] }, shaft: { X: [52, 0], Y: [50, 90] } },
];

// ── 케이스 5: 배기 팬 (철골 가대) — 구조 공진 ──
export const M_FRAME: CaseMachine = {
  name: '배기 팬 (철골 가대 위)',
  blades: 8,
  rpm: 1780,
  lineHz: 60,
  drive: 'induction',
  balls: 9,
  probes: false,
  housingHz: 3300,
  housingZeta: 0.05,
  rotor: { fn: 80, zeta: 0.06 },
  support: { H: [{ fn: 28.2, zeta: 0.025, k: 6e6 }, { fn: 140, zeta: 0.03, k: 8e7 }], V: [{ fn: 75, zeta: 0.04, k: 6e7 }], A: [{ fn: 55, zeta: 0.05, k: 3e7 }] },
  coastTau: 25,
  noiseG: 0.01,
  noiseUm: 0.3,
  seed: 1501,
  table: [
    ['구동', '4극 유도전동기 60 Hz, 1780 rpm'],
    ['연결', '유연 커플링 직결'],
    ['회전체', '팬 날개 8개, 두 베어링 사이'],
    ['베어링', BRG],
    ['설치', '2층 철골 가대 위 (같은 모델 한 대는 1층 콘크리트 기초 위에서 1.5 mm/s 안팎)'],
    ['센서', '팬 구동측 베어링 하우징 가속도계 H·V·A'],
    ['이력', '작년에 현장 밸런싱 두 번 — 잠깐 줄었다가 몇 주 뒤 다시 커짐'],
  ],
};
const FRAME_FR = M_FRAME.rpm / 60;
/** 불평형 힘(단단한 받침이면 1.25 mm/s)이 가대를 지나 보이는 값: 방향마다 지지 구조 전달을 곱한다 */
const frameVec = (d: 'H' | 'V', base: number, lag0: number): Vec => {
  const [g, lag] = supportVec(M_FRAME, d, FRAME_FR);
  return [base * g, lag0 + lag];
};
export const S_FRAME: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: frameVec('H', 1.25, 30), V: frameVec('V', 1.25, 120), A: [0.3, 80] }, across: { H: [0.9, 8], V: [0.85, 10], A: [0.7, 170] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.2, 60], V: [0.18, 100], A: [0.12, 30] } },
  { kind: 'sync', order: 8, force: 'mass', casing: { H: [0.3, 10], V: [0.25, 60], A: [0.1, 0] } },
  { kind: 'fixed', f: 120, electric: true, casing: { H: [0.05, 0], V: [0.05, 0], A: [0.02, 0] } },
];

// ── 케이스 6: 발전기 — 고정자 자기력 (2×LF = 2X) ──
export const M_GEN: CaseMachine = {
  name: '발전기',
  rpm: 3600,
  lineHz: 60,
  drive: 'generator',
  balls: 0,
  probes: true,
  housingHz: 2900,
  housingZeta: 0.05,
  rotor: { fn: 22, zeta: 0.08 },
  support: { H: [{ fn: 95, zeta: 0.04, k: 2e8 }], V: [{ fn: 140, zeta: 0.04, k: 3e8 }], A: [{ fn: 70, zeta: 0.05, k: 1.5e8 }] },
  coastTau: 60,
  noiseG: 0.008,
  noiseUm: 0.5,
  seed: 1601,
  table: [
    ['형식', '2극 동기 발전기 60 Hz, 3600 rpm (가스터빈 구동)'],
    ['베어링', '유막 베어링 2개'],
    ['센서', '근접 프로브 X·Y (터빈측 베어링) + 고정자 프레임 가속도계 H·V·A'],
    ['이력', '정기 점검 때 고정자 코어 체결부를 다시 조임. 그 뒤 프레임 진동이 서서히 늘었다는 운전원 보고'],
  ],
};
export const S_GEN: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [1.0, 60], V: [0.8, 150], A: [0.2, 80] }, shaft: { X: [28, 110], Y: [26, 200] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.35, 40], V: [0.3, 40], A: [0.25, 60] }, shaft: { X: [4, 20], Y: [4, 110] } },
  { kind: 'sync', order: 1, force: 'runout', shaft: { X: [2.5, 250], Y: [2.5, 340] } },
  { kind: 'fixed', f: 120, electric: true, casing: { H: [2.4, 10], V: [3.6, 15], A: [0.3, 0] }, shaft: { X: [0.6, 0], Y: [0.6, 90] } },
];

// ── 케이스 7: 오버행 압축기 — Morton effect ──
export const M_MORTON: CaseMachine = {
  name: '오버행 압축기',
  rpm: 11200,
  lineHz: 60,
  drive: 'turbine',
  balls: 0,
  probes: true,
  housingHz: 4200,
  housingZeta: 0.05,
  rotor: { fn: 95, zeta: 0.1 },
  support: { H: [{ fn: 180, zeta: 0.05, k: 2e8 }], V: [{ fn: 250, zeta: 0.05, k: 3e8 }], A: [{ fn: 150, zeta: 0.05, k: 1.5e8 }] },
  coastTau: 45,
  noiseG: 0.008,
  noiseUm: 0.5,
  seed: 1701,
  table: [
    ['구동', '증기터빈 (전동기 없음), 정속 11,200 rpm'],
    ['회전체', '임펠러 1단이 베어링 바깥에 매달린(오버행) 로터. 1차 임계속도 약 5,700 rpm'],
    ['베어링', '틸팅 패드 유막 베어링'],
    ['센서', '근접 프로브 X·Y (임펠러쪽 베어링) + 베어링 하우징 가속도계 H·V·A'],
    ['운전', '회전수·부하·유온 모두 일정'],
  ],
};
export const S_MORTON: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [1.4, 80], V: [1.3, 170], A: [0.3, 90] }, shaft: { X: [30, 75], Y: [29, 165] }, thermal: { ratio: 0.55, periodH: 2.4, angle: 270 } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.12, 20], V: [0.1, 110], A: [0.08, 30] }, shaft: { X: [2, 30], Y: [2, 120] } },
  { kind: 'sync', order: 1, force: 'runout', shaft: { X: [2, 300], Y: [2, 30] } },
];

// ── 케이스 8: 재조립한 급수 펌프 — 미스얼라인 + 내륜 결함 ──
export const M_PUMP8: CaseMachine = {
  name: '급수 펌프',
  blades: 6,
  rpm: 1780,
  lineHz: 60,
  drive: 'induction',
  balls: 9,
  probes: false,
  housingHz: 3300,
  housingZeta: 0.05,
  rotor: { fn: 70, zeta: 0.08 },
  support: { H: [{ fn: 85, zeta: 0.04, k: 6e7 }], V: [{ fn: 120, zeta: 0.04, k: 1e8 }], A: [{ fn: 60, zeta: 0.05, k: 4e7 }] },
  coastTau: 8,
  noiseG: 0.012,
  noiseUm: 0.3,
  seed: 1801,
  table: [
    ['구동', '4극 유도전동기 60 Hz, 1780 rpm'],
    ['연결', '기어형 커플링'],
    ['회전체', '원심 임펠러 베인 6개'],
    ['베어링', BRG],
    ['센서', '펌프 구동측(커플링쪽) 베어링 하우징 가속도계 H·V·A (건너편 = 전동기 부하측)'],
    ['이력', '3주 전 베어링 하우징을 열고 재조립. 그 뒤 구동측 베어링 온도가 12 °C 높다'],
  ],
};
export const S_PUMP8: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [0.8, 200], V: [0.7, 292], A: [0.15, 210] } },
  { kind: 'sync', order: 1, force: 'const', casing: { H: [1.9, 35], V: [1.5, 38], A: [4.2, 50] }, across: { H: [0.9, 178], V: [0.9, 182], A: [0.95, 180] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [2.4, 100], V: [1.9, 104], A: [3.8, 120] }, across: { H: [0.9, 180], V: [0.9, 175], A: [0.9, 182] } },
  { kind: 'sync', order: 3, force: 'const', casing: { H: [0.6, 10], V: [0.5, 10], A: [0.9, 20] } },
  { kind: 'sync', order: 6, force: 'mass', casing: { H: [0.4, 30], V: [0.35, 80], A: [0.15, 20] } },
  { kind: 'fixed', f: 120, electric: true, casing: { H: [0.08, 0], V: [0.07, 0], A: [0.02, 0] } },
  { kind: 'impact', defect: 'inner', g: 1.4, lineVel: 0.1, growth: 0.4 },
];

// ── 케이스 9: 모터를 바꾼 배기 송풍기 — 미스얼라인(2X) + 고정자 자기력(2×LF) ──
export const M_FAN9: CaseMachine = {
  name: '배기 송풍기 B',
  blades: 8,
  rpm: 3580,
  lineHz: 60,
  drive: 'induction',
  balls: 9,
  probes: false,
  housingHz: 3300,
  housingZeta: 0.05,
  rotor: { fn: 120, zeta: 0.08 },
  support: { H: [{ fn: 150, zeta: 0.04, k: 1e8 }], V: [{ fn: 210, zeta: 0.04, k: 1.5e8 }], A: [{ fn: 100, zeta: 0.05, k: 6e7 }] },
  coastTau: 15,
  noiseG: 0.01,
  noiseUm: 0.3,
  seed: 1901,
  table: [
    ['구동', '2극 유도전동기 60 Hz, 3580 rpm (2주 전 같은 형식의 새 전동기로 교체)'],
    ['연결', '유연 커플링 직결'],
    ['회전체', '팬 날개 8개'],
    ['베어링', BRG],
    ['센서', '전동기 부하측(커플링쪽) 베어링 하우징 가속도계 H·V·A (건너편 = 팬 구동측)'],
  ],
};
export const S_FAN9: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [1.2, 50], V: [1.0, 140], A: [0.3, 60] } },
  { kind: 'sync', order: 1, force: 'const', casing: { H: [0.7, 20], V: [0.6, 20], A: [1.6, 30] }, across: { H: [0.9, 176], V: [0.9, 180], A: [0.9, 180] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [1.7, 75], V: [1.4, 78], A: [2.9, 95] }, across: { H: [0.9, 176], V: [0.9, 182], A: [0.92, 178] } },
  { kind: 'sync', order: 8, force: 'mass', casing: { H: [0.35, 10], V: [0.3, 60], A: [0.12, 0] } },
  { kind: 'fixed', f: 120, electric: true, casing: { H: [2.2, 0], V: [2.7, 0], A: [0.35, 0] } },
];

// ── 케이스 10: 공정 압축기 B — 런아웃 (slow roll 미보상) ──
export const M_COMP_B: CaseMachine = {
  name: '공정 압축기 B',
  rpm: 9800,
  lineHz: 60,
  drive: 'turbine',
  balls: 0,
  probes: true,
  housingHz: 3800,
  housingZeta: 0.05,
  rotor: { fn: 62, zeta: 0.15 },
  support: { H: [{ fn: 170, zeta: 0.05, k: 2e8 }], V: [{ fn: 240, zeta: 0.05, k: 3e8 }], A: [{ fn: 150, zeta: 0.05, k: 1.5e8 }] },
  coastTau: 40,
  noiseG: 0.008,
  noiseUm: 0.5,
  seed: 2001,
  table: [
    ['구동', '증기터빈 (전동기 없음), 9,800 rpm'],
    ['회전체', '원심 임펠러 5단, 1차 임계속도 약 3,700 rpm'],
    ['베어링', '틸팅 패드 유막 베어링'],
    ['센서', '근접 프로브 X·Y (구동측 베어링, 감시 채널) + 베어링 하우징 가속도계 H·V·A'],
    ['이력', '오버홀 때 저널을 다시 연마하고 새 로터를 넣음'],
  ],
};
export const S_COMP_B: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [0.85, 220], V: [0.75, 310], A: [0.15, 200] }, shaft: { X: [15, 210], Y: [14, 300] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.08, 30], V: [0.07, 120], A: [0.05, 30] }, shaft: { X: [1.5, 60], Y: [1.5, 150] } },
  { kind: 'sync', order: 1, force: 'runout', shaft: { X: [30, 115], Y: [29, 205] } },
  { kind: 'sync', order: 2, force: 'runout', shaft: { X: [8, 40], Y: [8, 220] } },
  { kind: 'sync', order: 3, force: 'runout', shaft: { X: [5, 300], Y: [5, 210] } },
];

// ── 케이스 11: 송풍기 증속기 — 에일리어싱 ──
export const M_BLOWER: CaseMachine = {
  name: '송풍기 증속기',
  gear: { zIn: 89, zOut: 23 },
  rpm: 1485,
  lineHz: 50,
  drive: 'induction',
  balls: 9,
  probes: false,
  housingHz: 4800,
  housingZeta: 0.05,
  rotor: { fn: 130, zeta: 0.08 },
  support: { H: [{ fn: 160, zeta: 0.04, k: 1e8 }], V: [{ fn: 220, zeta: 0.04, k: 1.5e8 }], A: [{ fn: 120, zeta: 0.05, k: 8e7 }] },
  coastTau: 10,
  noiseG: 0.01,
  noiseUm: 0.3,
  seed: 2101,
  table: [
    ['구동', '4극 유도전동기 50 Hz, 1485 rpm'],
    ['증속기', '대기어 89이빨 (전동기 축) → 피니언 23이빨 (송풍기 축)'],
    ['베어링', `대기어 축 ${BRG}`],
    ['센서', '증속기 대기어 축 베어링 하우징 가속도계 H·V·A'],
    ['측정 장비', '보고된 기록은 새로 들인 범용 DAQ(입력단 AAF 없음). 지난달까지는 휴대용 진동 분석기로 잼'],
  ],
};
export const S_BLOWER: Source[] = [
  { kind: 'sync', order: 1, force: 'mass', casing: { H: [0.9, 40], V: [0.8, 130], A: [0.3, 60] } },
  { kind: 'sync', order: 2, force: 'const', casing: { H: [0.25, 70], V: [0.2, 110], A: [0.15, 40] } },
  { kind: 'sync', order: 89 / 23, force: 'mass', casing: { H: [0.5, 10], V: [0.45, 100], A: [0.2, 20] } },
  { kind: 'fixed', f: 100, electric: true, casing: { H: [0.07, 0], V: [0.06, 0], A: [0.02, 0] } },
  { kind: 'gear', zIn: 89, zOut: 23, mesh: { H: 1.1, V: 0.9, A: 0.7 }, h2: 0.3, sidebands: { shaft: 'in', count: 2, ratio: 0.08, decay: 0.4 } },
];
