/**
 * 결함 목록: 원인마다 주파수 규칙과 증거 5요소(P1-9: 주파수·진폭·위상·방향·운전조건) — P7-1 진단 지도(LAB-MAP-01)와
 * 결함 합성기(LAB-FAULT-01, `synth.ts`)가 같이 쓴다 (D-042). 문구는 판단의 출발점일 뿐 판정 기준이 아니다 (I-009).
 * 규칙의 숫자(0.38 ~ 0.48X, 슬립 ±2 % 등)는 Curriculum Part 7과 앞 Part에서 쓴 어림값이다.
 */
import { bearingFrequencies, BEARING_6205, type BearingGeometry } from '../machine/frequencies';

export type FaultFamily = 'shaft' | 'bearing' | 'gear' | 'electrical' | 'flow' | 'structure';

export const FAMILY_LABEL: Record<FaultFamily, string> = {
  shaft: '축 · 회전체',
  bearing: '구름베어링 · 미끄럼베어링',
  gear: '기어',
  electrical: '전기',
  flow: '유체 · 공력',
  structure: '구조',
};

export type FaultId =
  | 'unbalance'
  | 'bow'
  | 'crack'
  | 'resonance'
  | 'misalignment'
  | 'looseness'
  | 'rub'
  | 'oilWhirl'
  | 'oilWhip'
  | 'bearingOuter'
  | 'bearingInner'
  | 'bearingBall'
  | 'bearingCage'
  | 'gear'
  | 'electrical2LF'
  | 'rotorBar'
  | 'bladePass'
  | 'rotatingStall'
  | 'cavitation';

/** 측정한 줄이 회전수를 따라가는지 */
export type Tracking = 'rotating' | 'fixed' | 'either';

/** 기계 정보 (지도에서 주파수 규칙을 계산할 때) */
export interface MachineInfo {
  /** 회전 주파수 f_r [Hz] */
  fr: number;
  /** 전원 주파수 [Hz] (50 또는 60) */
  lineHz: number;
  /** 날개(베인) 수, 0이면 없음 */
  blades: number;
  /** 이 축 기어의 잇수, 0이면 없음 */
  teeth: number;
  /** 구름베어링 볼 수, 0이면 미끄럼베어링 */
  balls: number;
  /** 전동기 극수 (유도전동기), 0이면 모름 */
  poles: number;
}

/** 규칙이 가리키는 주파수 자리: 한 점(f ± tol) 또는 구간 [f1, f2] */
export interface Spot {
  label: string;
  f: number;
  /** 허용 폭 [Hz] (구간이면 f1·f2) */
  tol?: number;
  f1?: number;
  f2?: number;
}

export interface FaultInfo {
  id: FaultId;
  name: string;
  family: FaultFamily;
  tracking: Tracking;
  /** 증거 5요소 */
  frequency: string;
  amplitude: string;
  phase: string;
  direction: string;
  condition: string;
  /** 감별·확인 방법 */
  confirm: string;
  /** 자세히 다루는 페이지 */
  page: string;
  /** 이 기계에서 이 원인이 서는 주파수 자리 (없으면 해당 없음) */
  spots: (m: MachineInfo) => Spot[];
}

const order = (label: string, k: number, fr: number, rel = 0.02): Spot => ({ label, f: k * fr, tol: Math.max(0.5, rel * k * fr) });
const band = (label: string, f1: number, f2: number): Spot => ({ label, f: (f1 + f2) / 2, f1, f2 });

export function bearingOf(balls: number): BearingGeometry {
  return { ...BEARING_6205, balls };
}

export const FAULTS: FaultInfo[] = [
  {
    id: 'unbalance',
    name: '불평형',
    family: 'shaft',
    tracking: 'rotating',
    frequency: '1X가 대부분, 하모닉은 작다',
    amplitude: '공진보다 낮은 회전수에서는 회전수의 제곱에 비례해 커진다',
    phase: '1X 위상이 안정. 등방 지지면 수평-수직 위상차 약 90°',
    direction: '반경 방향(수평·수직)이 크고 축방향은 작다 (오버행 로터는 예외)',
    condition: '회전수에 따라 변하고 부하·온도에는 둔하다',
    confirm: '1X 벡터(Polar)·위상, 시험추로 영향계수 확인 (P9-2)',
    page: 'P7-2',
    spots: (m) => [order('1X', 1, m.fr)],
  },
  {
    id: 'bow',
    name: '축 휨 · 열변형 (bow)',
    family: 'shaft',
    tracking: 'rotating',
    frequency: '1X (축방향에 2X가 섞이기도 한다)',
    amplitude: '저속(slow roll)에서도 1X가 남고, 회전수가 오르면 동적으로 커진다',
    phase: '1X 위상이 불평형과 비슷해 위상만으로는 가르기 어렵다',
    direction: '반경 방향, 축방향 1X가 함께 클 수 있다',
    condition: '정지 시간·온도에 따라 변한다 (터닝 기어, 열 불균일)',
    confirm: 'Slow roll 1X 벡터의 변화, 런아웃과 비교 (P3-3, P8-2)',
    page: 'P7-2',
    spots: (m) => [order('1X', 1, m.fr)],
  },
  {
    id: 'crack',
    name: '로터 크랙',
    family: 'shaft',
    tracking: 'rotating',
    frequency: '1X·2X',
    amplitude: '1X·2X 벡터가 추세로 변한다. 임계속도의 1/2 회전수에서 2X 봉우리',
    phase: '1X·2X 벡터가 운전 조건이 같아도 바뀐다',
    direction: '반경 방향',
    condition: '기동·정지 때 2X 봉우리, Slow roll 벡터 변화',
    confirm: '1X·2X 벡터 트렌드, 기동 Bode의 2X (P7-2)',
    page: 'P7-2',
    spots: (m) => [order('1X', 1, m.fr), order('2X', 2, m.fr)],
  },
  {
    id: 'resonance',
    name: '구조 공진 (응답 증폭)',
    family: 'structure',
    tracking: 'either',
    frequency: '힘의 주파수(주로 1X) 그대로 — 고유진동수 근처에서만 크다',
    amplitude: '특정 회전수 범위에서만 크다',
    phase: '고유진동수를 지날 때 위상이 크게(약 180°) 바뀐다',
    direction: '공진 모드의 방향으로 크다 (수평과 수직이 크게 다르다)',
    condition: '회전수를 조금 바꾸면 크게 변한다. 힘 자체는 원인이 따로 있다',
    confirm: '런업 Bode·위상, 임팩트 시험으로 고유진동수 확인 (P9-1)',
    page: 'P7-2',
    spots: (m) => [order('1X (공진이 키움)', 1, m.fr)],
  },
  {
    id: 'misalignment',
    name: '미스얼라인먼트 (정렬 불량)',
    family: 'shaft',
    tracking: 'rotating',
    frequency: '1X·2X(·3X). 각·평행으로 깔끔히 나뉘지 않는다',
    amplitude: '부하·열성장에 따라 변한다',
    phase: '커플링 건너 축방향 위상 약 180°',
    direction: '축방향 성분이 크다',
    condition: '부하·온도(열성장)에 따라 변한다',
    confirm: '커플링 양쪽 위상, 오빗(바나나·8자), Shaft centerline (P7-3)',
    page: 'P7-3',
    spots: (m) => [order('1X', 1, m.fr), order('2X', 2, m.fr), order('3X', 3, m.fr)],
  },
  {
    id: 'looseness',
    name: '풀림 (구조적 · 회전)',
    family: 'shaft',
    tracking: 'rotating',
    frequency: '하모닉이 많다(1X ~ 10X), 회전 풀림은 0.5X 분수 하모닉도',
    amplitude: '작은 힘 변화에도 크게 변하고 불안정하다',
    phase: '위상이 측정마다 흔들린다. 구조적 풀림은 부재 사이 위상차',
    direction: '한 방향(보통 풀린 쪽)으로 치우친다',
    condition: '부하·온도에 민감, 파형이 위아래로 비대칭',
    confirm: '파형 비대칭, 부재 사이 위상 비교, 볼트·받침 점검 (P7-3)',
    page: 'P7-3',
    spots: (m) => [0.5, 1, 1.5, 2, 2.5, 3, 4, 5].map((k) => order(`${k}X`, k, m.fr)),
  },
  {
    id: 'rub',
    name: '러브 (마찰 접촉)',
    family: 'shaft',
    tracking: 'rotating',
    frequency: '1/2X·1/3X 분수 하모닉 + 하모닉. 열적 러브는 1X',
    amplitude: '접촉 정도에 따라 오르내린다',
    phase: '열적 러브는 1X 벡터가 천천히 돈다',
    direction: '접촉한 쪽, 역방향 성분이 생긴다',
    condition: '기동 중·열팽창 때, 간극이 작아지는 조건',
    confirm: '오빗 찌그러짐·평평한 면, Full spectrum 역방향 (P7-3)',
    page: 'P7-3',
    spots: (m) => [order('1/3X', 1 / 3, m.fr), order('1/2X', 0.5, m.fr), order('1X', 1, m.fr), order('3/2X', 1.5, m.fr), order('2X', 2, m.fr)],
  },
  {
    id: 'oilWhirl',
    name: '오일 휠 (Oil whirl)',
    family: 'bearing',
    tracking: 'rotating',
    frequency: '0.38 ~ 0.48X, 회전수를 따라간다',
    amplitude: '간극 안에서 커지며 불안정하다',
    phase: '정방향 선회',
    direction: 'X·Y 모두 (원에 가까운 오빗, 내부 루프)',
    condition: '기름 온도·점도, 베어링 하중이 작을 때',
    confirm: '캐스케이드에서 회전수 추종, 오빗 내부 루프 (P7-4)',
    page: 'P7-4',
    spots: (m) => (m.balls === 0 ? [band('0.38 ~ 0.48X', 0.38 * m.fr, 0.48 * m.fr)] : []),
  },
  {
    id: 'oilWhip',
    name: '오일 휩 (Oil whip)',
    family: 'bearing',
    tracking: 'fixed',
    frequency: '1차 임계속도에 잠긴 서브싱크로너스 (회전수가 올라도 그대로)',
    amplitude: '크고 위험하다',
    phase: '정방향 선회',
    direction: 'X·Y 모두',
    condition: '회전수가 1차 임계의 약 2배를 넘을 때',
    confirm: '캐스케이드에서 세로로 꺾여 잠김 (P5-2, P7-4)',
    page: 'P7-4',
    spots: (m) => (m.balls === 0 ? [band('1X 아래 고정 (1차 임계)', 0.2 * m.fr, 0.5 * m.fr)] : []),
  },
  {
    id: 'bearingOuter',
    name: '구름베어링 외륜',
    family: 'bearing',
    tracking: 'rotating',
    frequency: 'BPFO(≈ 0.4·N_r X, 정수배 아님)와 하모닉 — 엔벨로프 스펙트럼에서 또렷',
    amplitude: '초기에는 kHz 울림만, 진행하면 결함 주파수가 커진다',
    phase: '1X 위상과 관계없다',
    direction: '하중 방향(보통 수직)',
    condition: '회전수 추종, 미끄럼으로 계산값과 1 ~ 2 % 어긋남',
    confirm: '엔벨로프 스펙트럼의 BPFO 하모닉 (P5-6, P7-5)',
    page: 'P7-5',
    spots: (m) => (m.balls > 0 ? [order('BPFO', bearingFrequencies(bearingOf(m.balls), m.fr).bpfo / m.fr, m.fr)] : []),
  },
  {
    id: 'bearingInner',
    name: '구름베어링 내륜',
    family: 'bearing',
    tracking: 'rotating',
    frequency: 'BPFI(≈ 0.6·N_r X) ± 1X 측대역',
    amplitude: '하중 영역을 지날 때만 커진다 (1X로 진폭 변조)',
    phase: '1X 위상과 관계없다',
    direction: '하중 방향',
    condition: '회전수 추종',
    confirm: '엔벨로프 스펙트럼의 BPFI와 1X 측대역 (P5-6, P7-5)',
    page: 'P7-5',
    spots: (m) => {
      if (m.balls === 0) return [];
      const f = bearingFrequencies(bearingOf(m.balls), m.fr).bpfi;
      return [order('BPFI', f / m.fr, m.fr), order('BPFI − 1X', (f - m.fr) / m.fr, m.fr), order('BPFI + 1X', (f + m.fr) / m.fr, m.fr)];
    },
  },
  {
    id: 'bearingBall',
    name: '구름베어링 볼',
    family: 'bearing',
    tracking: 'rotating',
    frequency: '2×BSF ± FTF 측대역 (문헌마다 BSF를 1배·2배로 다르게 쓴다, I-008)',
    amplitude: '볼이 하중 영역을 드나들며 FTF로 변조',
    phase: '1X 위상과 관계없다',
    direction: '하중 방향',
    condition: '회전수 추종',
    confirm: '엔벨로프 스펙트럼의 2×BSF와 FTF 측대역 (P7-5)',
    page: 'P7-5',
    spots: (m) => (m.balls > 0 ? [order('2×BSF', bearingFrequencies(bearingOf(m.balls), m.fr).bsf2 / m.fr, m.fr)] : []),
  },
  {
    id: 'bearingCage',
    name: '구름베어링 케이지',
    family: 'bearing',
    tracking: 'rotating',
    frequency: 'FTF ≈ 0.4X (서브싱크로너스)',
    amplitude: '작게 나타나며 다른 결함 주파수의 측대역으로 보이기도 한다',
    phase: '1X 위상과 관계없다',
    direction: '반경 방향',
    condition: '회전수 추종',
    confirm: '엔벨로프·저주파 스펙트럼의 FTF (P7-5)',
    page: 'P7-5',
    spots: (m) => (m.balls > 0 ? [order('FTF', bearingFrequencies(bearingOf(m.balls), m.fr).ftf / m.fr, m.fr)] : []),
  },
  {
    id: 'gear',
    name: '기어 (마모·편심·깨진 이)',
    family: 'gear',
    tracking: 'rotating',
    frequency: 'GMF = 잇수 × X와 그 하모닉, ± 결함 축 회전수 간격의 측대역',
    amplitude: '마모는 GMF 하모닉, 편심은 GMF ± 1X, 깨진 이는 측대역 여러 쌍',
    phase: 'TSA로 결함 이의 각도를 찾는다',
    direction: '반경·축방향(헬리컬)',
    condition: '부하에 따라 GMF가 변한다',
    confirm: '측대역 간격 = 결함 축, TSA·켑스트럼 (P2-6, P5-7, P7-6)',
    page: 'P7-6',
    spots: (m) => (m.teeth > 0 ? [order('GMF', m.teeth, m.fr), order('GMF − 1X', m.teeth - 1, m.fr), order('GMF + 1X', m.teeth + 1, m.fr), order('2×GMF', 2 * m.teeth, m.fr)] : []),
  },
  {
    id: 'electrical2LF',
    name: '전자기력 (고정자 · 정적 공극 편심)',
    family: 'electrical',
    tracking: 'fixed',
    frequency: '전원 주파수의 2배(2×LF) — 회전수와 무관하게 고정',
    amplitude: '부하 전류에 따라 변한다',
    phase: '1X와 관계없다',
    direction: '반경 방향',
    condition: '전원을 끊는 순간 사라진다 (기계적 원인은 천천히 줄어든다)',
    confirm: '전원 차단 순간의 감쇠, 2X와 분해능으로 분리 (P2-4, P7-7)',
    page: 'P7-7',
    spots: (m) => [{ label: '2×LF', f: 2 * m.lineHz, tol: 0.3 }],
  },
  {
    id: 'rotorBar',
    name: '유도전동기 로터바',
    family: 'electrical',
    tracking: 'rotating',
    frequency: '1X ± 극통과 주파수(PPF = 극수 × 슬립 주파수) 측대역',
    amplitude: '부하가 클수록 측대역이 커진다',
    phase: '측대역 때문에 1X 크기가 맥놀이처럼 오르내린다',
    direction: '반경 방향',
    condition: '부하(슬립)에 따라 측대역 간격이 변한다',
    confirm: '좁은 분해능(긴 기록)으로 1X 둘레 측대역, 전류 스펙트럼 (P7-7)',
    page: 'P7-7',
    spots: (m) => {
      if (m.poles <= 0) return [order('1X 둘레', 1, m.fr)];
      const sync = (2 * m.lineHz) / m.poles;
      const ppf = m.poles * (sync - m.fr);
      return ppf > 0 ? [{ label: '1X − PPF', f: m.fr - ppf, tol: 0.15 }, { label: '1X + PPF', f: m.fr + ppf, tol: 0.15 }] : [];
    },
  },
  {
    id: 'bladePass',
    name: '날개 · 베인 통과',
    family: 'flow',
    tracking: 'rotating',
    frequency: '날개 수 × X와 그 하모닉',
    amplitude: '유량(운전점)·간극·손상에 따라 변한다',
    phase: '—',
    direction: '반경 방향, 케이싱',
    condition: '유량·압력에 따라 변한다',
    confirm: '운전점을 바꿔 비교, 날개 수 확인 (P7-8)',
    page: 'P7-8',
    spots: (m) => (m.blades > 0 ? [order('날개 통과', m.blades, m.fr), order('× 2', 2 * m.blades, m.fr)] : []),
  },
  {
    id: 'rotatingStall',
    name: 'Rotating stall (압축기·팬)',
    family: 'flow',
    tracking: 'either',
    frequency: '1X보다 낮은 비동기 성분 (실속 셀이 로터보다 느리게 돈다, 범위는 문헌마다 다르다)',
    amplitude: '운전점에 따라 갑자기 나타난다',
    phase: '—',
    direction: '반경 방향, 압력 맥동',
    condition: '유량이 작은 운전점에서 나타난다',
    confirm: '운전점 변화, 동압 센서 (P7-8)',
    page: 'P7-8',
    spots: (m) => [band('1X 아래 비동기', 0.1 * m.fr, 0.9 * m.fr)],
  },
  {
    id: 'cavitation',
    name: '캐비테이션 (펌프)',
    family: 'flow',
    tracking: 'fixed',
    frequency: '넓은 대역의 고주파 랜덤 (줄이 아니다)',
    amplitude: '흡입 압력이 낮을수록 커진다',
    phase: '—',
    direction: '케이싱 전체',
    condition: '흡입 압력·유량에 따라 변한다',
    confirm: '흡입 조건을 바꿔 비교, 소리 (P7-8)',
    page: 'P7-8',
    spots: () => [band('고주파 넓은 대역', 2000, 10000)],
  },
];

export const FAULT_BY_ID = Object.fromEntries(FAULTS.map((f) => [f.id, f])) as Record<FaultId, FaultInfo>;

export interface Candidate {
  fault: FaultInfo;
  spot: Spot;
  /** 자리와의 차이 [Hz] (구간 안이면 0) */
  miss: number;
}

/**
 * 측정한 주파수 f [Hz]에 맞는 원인 후보 (P7-1 지도를 거꾸로). tracking으로 "회전수를 따라감 / 고정"을 걸러 낸다.
 * 가까운 것부터 정렬. 1X처럼 여러 원인이 같은 자리를 가리키면 모두 나온다 — 나머지 증거로 가린다.
 */
export function candidatesAt(f: number, m: MachineInfo, tracking: Tracking | 'unknown' = 'unknown'): Candidate[] {
  const out: Candidate[] = [];
  for (const fault of FAULTS) {
    if (tracking !== 'unknown' && fault.tracking !== 'either' && fault.tracking !== tracking) continue;
    let best: Candidate | undefined;
    for (const spot of fault.spots(m)) {
      const inBand = spot.f1 !== undefined && spot.f2 !== undefined;
      const miss = inBand ? (f >= spot.f1! && f <= spot.f2! ? 0 : Math.min(Math.abs(f - spot.f1!), Math.abs(f - spot.f2!))) : Math.abs(f - spot.f);
      const ok = inBand ? miss === 0 : miss <= (spot.tol ?? 0.5);
      if (ok && (!best || miss < best.miss)) best = { fault, spot, miss };
    }
    if (best) out.push(best);
  }
  return out.sort((a, b) => a.miss - b.miss);
}
