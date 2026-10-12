/**
 * LAB-CASE-01 케이스 목록 (D-052): 보고된 내용 · 보고된 측정 설정 · 정답 · 결정적 증거 · 흔한 오답의 반증 · 다음 확인.
 * 증거 문장의 숫자는 `cases.test.ts`가 엔진 계산과 대조한다. 모두 가상의 기계다.
 */
import type { DiagId } from './diagnoses';
import type { CaseMachine, Settings, Source, SpecUnit } from './engine';
import * as M from './machines';

export type ViewId = 'spectrum' | 'waveform' | 'envelope' | 'phase' | 'orbit' | 'bode' | 'cascade' | 'trend' | 'trip' | 'impact';

export const VIEW_LABEL: Record<ViewId, string> = {
  spectrum: '스펙트럼',
  waveform: '시간 파형',
  envelope: '엔벨로프',
  phase: '1X·2X 위상 표',
  orbit: '오빗',
  bode: '코스트다운 Bode',
  cascade: '기동 캐스케이드',
  trend: '추세',
  trip: '전원·계자 차단 시험',
  impact: '정지 임팩트 시험',
};
export const VIEWS = Object.keys(VIEW_LABEL) as ViewId[];

/** 측정 설정 + 화면 설정 (단위·엔벨로프 대역·slow roll 보상) */
export interface CaseSettings extends Settings {
  unit: SpecUnit;
  /** ENV_BANDS의 번호 */
  band: number;
  compensate: boolean;
}

export interface Evidence {
  view: ViewId;
  /** 이 증거를 보는 설정 (보고된 설정에서 바꿀 것만) */
  set?: Partial<CaseSettings>;
  text: string;
}

export interface CaseDef {
  id: string;
  level: 1 | 2 | 3 | 4;
  title: string;
  machine: CaseMachine;
  sources: Source[];
  report: string;
  settings: CaseSettings;
  truth: DiagId[];
  /** 함께 골라도 틀리지 않은 보기 (측정 문제 케이스의 "기계 결함 없음") */
  alsoOk?: DiagId[];
  evidence: Evidence[];
  /** 고르기 쉬운 오답의 반증 */
  traps: Partial<Record<DiagId, string>>;
  next: string;
}

export const LEVEL_LABEL: Record<CaseDef['level'], string> = { 1: '1단계 · 단일 결함', 2: '2단계 · 닮은꼴 가르기', 3: '3단계 · 복합 결함', 4: '4단계 · 측정 문제' };

const base = (s: Partial<CaseSettings> & Pick<Settings, 'sensor'>): CaseSettings => ({ fMax: 1000, lines: 800, aaf: true, unit: s.sensor === 'X' || s.sensor === 'Y' ? 'disp' : 'vel', band: 0, compensate: false, ...s });

export const CASES: CaseDef[] = [
  {
    id: 'c01',
    level: 1,
    title: '보일러 송풍기 — 몇 주에 걸쳐 진동이 커졌다',
    machine: M.M_FAN,
    sources: M.S_FAN,
    report: '운전원 보고: 한 달 전 2.5 mm/s 안팎이던 팬 구동측 수평 진동이 오늘 5.2 mm/s입니다. 소리는 그대로이고, 회전수·풍량도 그대로입니다.',
    settings: base({ sensor: 'H' }),
    truth: ['unbalance'],
    evidence: [
      { view: 'phase', text: '1X(29.75 Hz)가 H 5.2 · V 4.3 · A 0.5 mm/s로 반경 방향이 크고 축방향은 작습니다. 수직이 수평보다 88° 늦습니다 — 축과 함께 도는 힘의 모양입니다.' },
      { view: 'spectrum', text: '1X 말고는 0.4 mm/s를 넘는 줄이 없습니다. 2X 0.25 mm/s, 날개 통과(10X, 297.5 Hz) 0.35 mm/s는 건전한 수준입니다.' },
      { view: 'trend', text: '30일 추세에서 1X가 2.5 → 5.2 mm/s로 꾸준히 커졌습니다. 날개에 먼지가 쌓이거나 닳아 질량 분포가 서서히 바뀔 때의 모양입니다.' },
      { view: 'bode', text: '코스트다운에서 1X는 회전수와 함께 매끈하게 커지고 봉우리나 급한 위상 변화가 없습니다 — 운전 범위에 공진이 없습니다.' },
    ],
    traps: {
      misalignment: '축방향 1X가 0.5 mm/s로 작고 2X도 작습니다. 커플링 건너편과 반경 방향 위상 차도 12 ~ 15°로 같은 쪽입니다.',
      resonance: '수평·수직이 비슷하고(5.2 · 4.3 mm/s), 코스트다운에 봉우리가 없습니다.',
      looseness: '하모닉 무리나 ½X 자리 줄이 없습니다.',
      bow: '휨은 정지 시간·온도에 따라 변합니다. 여기는 30일 동안 같은 방향으로 서서히 커졌고, 위상은 그대로입니다.',
    },
    next: '같은 운전 조건에서 시험추 런으로 영향계수를 재고 보정합니다(P9-2). 날개 오염이 원인이면 청소한 뒤 다시 잽니다.',
  },
  {
    id: 'c02',
    level: 1,
    title: '냉각수 펌프 — 높은 소리가 늘었다',
    machine: M.M_PUMP,
    sources: M.S_PUMP,
    report: '점검원 보고: 펌프 쪽에서 "쉬익" 하는 높은 소리가 들립니다. 정기 측정(속도 overall 10 ~ 1000 Hz)은 1.0 mm/s로 석 달째 그대로입니다.',
    settings: base({ sensor: 'V' }),
    truth: ['bearingOuter'],
    evidence: [
      { view: 'spectrum', text: '속도 스펙트럼(f_max 1 kHz)에서는 1X 0.84, 베인 통과(7X, 417 Hz) 0.42 mm/s 말고 눈에 띄는 줄이 없고, BPFO(213.6 Hz) 자리는 0.04 mm/s로 바닥 수준입니다.' },
      { view: 'spectrum', set: { fMax: 5000, lines: 1600, unit: 'acc' }, text: 'f_max를 5 kHz로 올려 가속도로 보면 3 ~ 3.6 kHz에 넓은 둔덕이 섭니다. 하우징 공진이 충격에 울리는 자리입니다.' },
      { view: 'envelope', set: { fMax: 5000, lines: 1600, band: 2 }, text: '2.5 ~ 4.5 kHz 대역 엔벨로프에 212.5 Hz(BPFO 213.6 Hz)와 그 2·3·4배가 섭니다. 1X 간격 측대역은 없습니다 — 멈춰 있는 외륜의 결함입니다.' },
      { view: 'waveform', set: { fMax: 5000, lines: 1600, unit: 'acc' }, text: '가속도 파형에 4.7 ms(1/BPFO)마다 충격이 보이고, 첨도가 5.5입니다(정규분포 잡음이면 3).' },
    ],
    traps: {
      bearingInner: '엔벨로프의 줄이 BPFI(322.7 Hz)가 아니라 BPFO 자리이고, 1X 간격 측대역이 없습니다.',
      cavitation: '캐비테이션의 넓은 대역 잡음은 엔벨로프에 뚜렷한 줄을 만들지 않습니다. 여기는 BPFO와 하모닉이 또렷합니다.',
      normal: '속도 overall은 그대로지만 엔벨로프에 BPFO 줄이 섭니다. 초기 베어링 결함은 속도 overall에 잘 드러나지 않습니다.',
      flow: '베인 통과(417 Hz)는 0.42 mm/s로 건전한 수준이고, 높은 소리의 원인인 충격과 관계가 없습니다.',
    },
    next: '엔벨로프 값을 짧은 간격으로 추세 관리하고(P5-7, P7-5), 윤활 상태를 확인한 뒤 교체 시기를 계획합니다. 속도 스펙트럼에 결함 줄이 서기 전 단계입니다.',
  },
  {
    id: 'c03',
    level: 1,
    title: '컨베이어 감속기 — 딱딱 하는 소리',
    machine: M.M_GEAR,
    sources: M.S_GEAR,
    report: '현장 보고: 감속기에서 일정한 간격으로 "딱" 소리가 납니다. 대략 1초에 9 ~ 10번입니다.',
    settings: base({ sensor: 'H' }),
    truth: ['gearBroken'],
    evidence: [
      { view: 'spectrum', text: 'GMF 569.25 Hz(23 × 24.75 Hz) 둘레에 9.33 Hz 간격 측대역이 양쪽으로 7개씩 섭니다. 9.33 Hz는 출력축 회전수(24.75 × 23/61)입니다.' },
      { view: 'waveform', set: { fMax: 5000, lines: 3200, unit: 'acc' }, text: '가속도 파형에 107 ms(1/9.33 Hz)마다 충격이 섭니다 — 출력축이 한 바퀴 돌 때마다 같은 이가 맞물릴 때 납니다.' },
      { view: 'envelope', set: { fMax: 5000, lines: 3200, band: 1 }, text: '1 ~ 2.5 kHz 대역 엔벨로프의 가장 큰 줄이 9.38 Hz(출력축)이고, 그 하모닉이 이어집니다.' },
    ],
    traps: {
      gearWear: '마모는 2×GMF가 커지고 측대역이 넓게 고르게 낮습니다. 여기는 한 바퀴에 한 번 충격이 또렷합니다.',
      gearEccentric: '편심은 측대역이 한두 쌍입니다. 여기는 7쌍이 이어지고 파형에 충격이 있습니다.',
      bearingOuter: '충격 간격 107 ms는 BPFO(88.7 Hz → 11.3 ms)와 다릅니다. 9.33 Hz는 출력축 회전수입니다.',
      looseness: '1X(24.75 Hz)의 하모닉 무리가 아니라 GMF 둘레의 출력축 간격 측대역입니다.',
    },
    next: '출력축 기준 TSA(P7-6)로 몇 번째 이인지 찾고, 정지한 뒤 출력 기어를 육안 점검합니다.',
  },
  {
    id: 'c04',
    level: 1,
    title: '공정 압축기 A — 정격 회전수를 올린 뒤',
    machine: M.M_COMP_A,
    sources: M.S_COMP_A,
    report: '지난주 정격을 9,000 → 10,500 rpm으로 올린 뒤 축 진동(X 프로브) 직접값이 72 µm p-p로 커졌습니다. 예전에는 그 절반쯤이었습니다.',
    settings: base({ sensor: 'X', fMax: 500 }),
    truth: ['oilWhip'],
    evidence: [
      { view: 'spectrum', text: '70.0 Hz에 52 µm p-p — 1X(175 Hz) 19 µm보다 큽니다. 70 / 175 = 0.40X로 1X 아래 성분입니다.' },
      { view: 'cascade', text: '기동 캐스케이드: 6,600 rpm부터 0.45X 줄이 회전수를 따라 오르다가, 9,330 rpm쯤 70 Hz에 닿은 뒤로는 회전수를 올려도 70 Hz에 머물며 커집니다(잠김).' },
      { view: 'bode', text: '코스트다운 1X 봉우리가 약 4,300 rpm(72 Hz 근처) — 1차 임계속도입니다. 잠긴 자리 70 Hz가 이 모드의 고유진동수입니다.' },
      { view: 'orbit', text: '직접 오빗이 1X 필터 오빗보다 훨씬 크고 바퀴마다 모양이 바뀝니다. 키페이저 점이 한자리에 머물지 않습니다 — 1X에 묶이지 않은 성분입니다.' },
    ],
    traps: {
      oilWhirl: '0.45X로 회전수를 따라가는 동안은 오일 휠입니다. 지금은 70 Hz(1차 고유진동수)에 잠겨 회전수와 무관하므로 휩입니다. 휩은 더 위험해 회전수를 낮추거나 베어링을 바꿔야 합니다.',
      rub: '러브라면 정확한 ½X(87.5 Hz)와 하모닉, 잘린 오빗이 보입니다. 70 Hz는 ½X가 아닙니다.',
      looseness: '½X 자리가 아니고, 1X 하모닉 무리가 없습니다.',
      unbalance: '1X는 19 µm로 예전과 비슷합니다. 커진 몫은 1X 아래 70 Hz 성분입니다.',
    },
    next: '회전수를 9,000 rpm 아래로 낮춰 사라지는지 확인하고(내려갈 때 더 낮은 회전수까지 남을 수 있음), 유온·베어링 하중의 영향을 본 뒤 베어링 형식 변경(틸팅 패드 등)을 검토합니다(P4-4, P7-4).',
  },
  {
    id: 'c05',
    level: 2,
    title: '배기 팬 — 밸런싱을 해도 수평만 다시 크다',
    machine: M.M_FRAME,
    sources: M.S_FRAME,
    report: '같은 모델 두 대 가운데 2층 철골 가대 위의 이 팬만 수평 진동이 9.7 mm/s입니다. 수직은 1.5 mm/s쯤입니다. 밸런싱을 하면 잠깐 줄었다가 몇 주 뒤 다시 커집니다.',
    settings: base({ sensor: 'H' }),
    truth: ['resonance'],
    evidence: [
      { view: 'phase', text: '1X가 H 9.7 · V 1.5 mm/s로 6.5배 차이 납니다. 수직이 수평보다 299°(= 61° 앞섬) 늦어, 회전하는 불평형 힘이 단단한 받침에서 만드는 약 90°와 다릅니다.' },
      { view: 'bode', text: '코스트다운 H: 1,710 rpm(28.5 Hz)에서 18.8 mm/s 봉우리, 그 앞뒤로 위상이 28° → 184°로 156° 바뀝니다. V는 봉우리 없이 매끈합니다.' },
      { view: 'impact', text: '정지 임팩트 시험 H에 28.3 Hz 봉우리 — 1X 29.67 Hz와 5 % 떨어져 있습니다. V의 첫 봉우리는 75 Hz입니다.' },
    ],
    traps: {
      unbalance: '가진원은 불평형이 맞지만, 진동이 큰 이유는 가대의 수평 모드(28.3 Hz)가 1X 바로 아래에 있어서입니다. 밸런싱만으로는 작은 불평형 변화에도 다시 커집니다.',
      looseness: '하모닉 무리와 ½X 자리 줄이 없습니다.',
      misalignment: '축방향이 0.3 mm/s로 작고 2X도 작습니다.',
    },
    next: '가대 수평 강성을 보강하거나 질량을 더해 고유진동수를 1X에서 멀리 옮기고, 보강한 뒤 임팩트 시험으로 다시 확인합니다(P9-1). 그동안은 불평형을 아주 작게 맞춰 둡니다.',
  },
  {
    id: 'c06',
    level: 2,
    title: '발전기 — 고정자 프레임이 떤다',
    machine: M.M_GEN,
    sources: M.S_GEN,
    report: '고정자 프레임 수직 진동이 3.9 mm/s로 서서히 늘었습니다. 축 진동(프로브)은 예전과 같은 26 µm p-p입니다.',
    settings: base({ sensor: 'V', fMax: 500, lines: 1600 }),
    truth: ['stator2LF'],
    evidence: [
      { view: 'spectrum', text: '120 Hz 3.9 mm/s가 가장 큰 줄입니다. 2극 동기 발전기라 120 Hz = 2X = 2×LF가 정확히 겹쳐, 분해능을 아무리 높여도 둘로 갈라지지 않습니다.' },
      { view: 'spectrum', set: { sensor: 'X', unit: 'disp' }, text: '축 프로브의 120 Hz는 4.5 µm p-p로 작고 1X 26 µm가 큽니다 — 축은 2X로 크게 흔들리지 않습니다.' },
      { view: 'trip', text: '회전수를 유지한 채 계자를 끊으면 120 Hz가 0.5초 뒤 2.2, 2초 뒤 0.58 mm/s로 떨어지고 0.3 mm/s(기계 2X 몫)만 남습니다. 1X는 그대로입니다.' },
      { view: 'phase', text: '120 Hz(2X 필터)의 수평·수직 위상이 거의 같습니다(3° 차이) — 프레임을 한 방향으로 미는 힘입니다.' },
    ],
    traps: {
      misalignment: '축의 2X가 작고, 계자를 끊자 프레임 120 Hz가 사라졌습니다. 기계적 2X였다면 회전수가 그대로이니 남아야 합니다.',
      looseness: '하모닉 무리와 ½X 자리 줄이 없습니다.',
      unbalance: '1X(0.8 mm/s, 축 26 µm)는 예전과 같습니다.',
    },
    next: '고정자 코어 체결 상태와 프레임 고유진동수(120 Hz 근처인지)를 확인합니다. 계자 전류를 단계로 바꾸며 120 Hz가 전류의 제곱을 따라가는지 봅니다(P7-7, P8-5).',
  },
  {
    id: 'c07',
    level: 2,
    title: '오버행 압축기 — 정속인데 1X가 오르내린다',
    machine: M.M_MORTON,
    sources: M.S_MORTON,
    report: '회전수·부하·유온이 모두 일정한데 축 진동 1X(X)가 12 ~ 46 µm p-p 사이를 몇 시간 주기로 오르내립니다.',
    settings: base({ sensor: 'X' }),
    truth: ['morton'],
    evidence: [
      { view: 'trend', text: '12시간 추세: 1X 크기가 12 → 46 µm로 약 2.4시간 주기로 오르내리고, 위상은 한 방향으로 계속 돕니다. Polar에서는 1X 벡터가 30 µm 자리 둘레로 반지름 약 16 µm인 원을 그립니다.' },
      { view: 'spectrum', text: '1X 말고는 2X 1.9 µm뿐이고 ½X·하모닉 무리·1X 아래 성분이 없습니다 — 접촉(러브)의 흔적이 없습니다.' },
      { view: 'orbit', text: '오빗이 깨끗한 타원(1X)이고, 잘리거나 뾰족한 곳이 없습니다.' },
      { view: 'trend', text: '30일 추세의 하루 한 점은 크게 흩어져, 하루 간격으로는 몇 시간 주기가 보이지 않습니다. 짧은 간격의 추세가 필요한 까닭입니다.' },
    ],
    traps: {
      unbalance: '불평형만이면 회전수·부하가 일정할 때 1X 벡터가 한자리에 머뭅니다.',
      rub: 'Newkirk(러브 마찰열)도 1X 벡터가 돌지만, 접촉 흔적(하모닉·½X·잘린 오빗·gap 변화)이 함께 보입니다. 여기는 없습니다.',
      bow: '정지한 뒤 기동할 때의 열 휨은 운전하면서 한 방향으로 풀려 줄어듭니다. 여기는 정속에서 계속 돕니다.',
    },
    next: '베어링 유온·하중을 바꿨을 때 주기와 크기가 바뀌는지 보고, 오버행 질량·베어링 설계 쪽 대책을 검토합니다(P8-2).',
  },
  {
    id: 'c08',
    level: 3,
    title: '급수 펌프 — 재조립 뒤 축방향이 크고 베어링이 뜨겁다',
    machine: M.M_PUMP8,
    sources: M.S_PUMP8,
    report: '3주 전 베어링 하우징을 열고 재조립했습니다. 그 뒤 구동측 축방향 진동이 5.6 mm/s이고, 베어링 온도가 12 °C 높습니다.',
    settings: base({ sensor: 'A' }),
    truth: ['misalignment', 'bearingInner'],
    evidence: [
      { view: 'phase', text: '축방향 1X 4.1 · 2X 3.8 mm/s로 반경 방향보다 큽니다. 커플링 건너편과 축방향 위상 차가 179°(1X) · 182°(2X)입니다.' },
      { view: 'spectrum', text: '축방향 스펙트럼에 1X·2X·3X가 이어지고(3X 0.9 mm/s), ½X 자리 줄은 없습니다.' },
      { view: 'envelope', set: { sensor: 'V', fMax: 5000, lines: 3200, band: 2 }, text: '2.5 ~ 4.5 kHz 대역 엔벨로프에 BPFI 160.9 Hz와 그 2배, 양쪽 1X 간격 측대역(131.3 · 190.6 Hz), 1X(29.7 Hz) 줄이 섭니다 — 내륜 결함입니다.' },
    ],
    traps: {
      bearingOuter: '엔벨로프 줄은 BPFO(106.4 Hz)가 아니라 BPFI(160.6 Hz) 자리이고, 1X 간격 측대역이 있습니다.',
      looseness: '하모닉이 3X까지만 있고 ½X 자리 줄이 없습니다.',
      unbalance: '1X가 반경 방향보다 축방향에 크고, 커플링 건너 180°입니다.',
    },
    next: '정렬을 다시 재서 바로잡고(P9-3), 내륜 결함 베어링 교체를 계획합니다. 미스얼라인이 베어링 하중을 키워 결함을 앞당겼을 가능성이 큽니다.',
  },
  {
    id: 'c09',
    level: 3,
    title: '배기 송풍기 B — 전동기를 바꾼 뒤 120 Hz 근처가 크다',
    machine: M.M_FAN9,
    sources: M.S_FAN9,
    report: '2주 전 같은 형식의 새 전동기로 바꿨습니다. 그 뒤 수직 스펙트럼의 120 Hz 근처 줄이 2.2 mm/s입니다(전에는 0.3 mm/s 이하).',
    settings: base({ sensor: 'V', lines: 400 }),
    truth: ['misalignment', 'stator2LF'],
    evidence: [
      { view: 'spectrum', set: { fMax: 200, lines: 1600 }, text: 'f_max 200 Hz · 1600 라인(Δf 0.125 Hz)으로 보면 120 Hz 근처가 두 줄로 갈라집니다: 119.33 Hz(2X) 1.3 mm/s와 120.00 Hz(2×LF) 2.7 mm/s. 400 라인(Δf 2.5 Hz)에서는 한 줄로 보였습니다.' },
      { view: 'spectrum', set: { sensor: 'A', fMax: 200, lines: 1600 }, text: '축방향에서는 2X 2.7 mm/s가 크고 2×LF는 0.35 mm/s로 작습니다.' },
      { view: 'phase', text: '2X의 커플링 건너편 위상 차가 약 180°(H 176° · V 182° · A 178°)입니다.' },
      { view: 'trip', text: '전원을 끊으면 120.00 Hz 줄은 0.1초 만에 2.7 → 0.37 mm/s로 사라지고, 119.33 Hz(2X)는 회전수를 따라 천천히 줄어듭니다.' },
    ],
    traps: {
      rotorBar: '1X 둘레의 극통과 측대역이 없습니다. 120.00 Hz는 회전수와 무관한 2×LF 자리입니다.',
      looseness: '하모닉 무리와 ½X 자리 줄이 없습니다.',
      unbalance: '1X는 1.8 mm/s 안팎으로 크지 않고, 문제의 줄은 120 Hz 근처입니다.',
    },
    next: '소프트 풋을 먼저 확인하고(P7-7, P9-1) 정렬을 다시 합니다(P9-3). 소프트 풋은 고정자를 비틀어 공극을 고르지 않게 만들고(2×LF ↑), 정렬도 흐트러뜨립니다.',
  },
  {
    id: 'c10',
    level: 4,
    title: '공정 압축기 B — 감시 채널만 높다',
    machine: M.M_COMP_B,
    sources: M.S_COMP_B,
    report: '오버홀 뒤 기동했습니다. 축 진동 감시 채널(X 프로브) 직접값이 38 µm p-p로 경보값 근처인데, 베어링 하우징 진동은 0.86 mm/s로 작습니다.',
    settings: base({ sensor: 'X' }),
    truth: ['runout'],
    alsoOk: ['normal'],
    evidence: [
      { view: 'bode', text: '코스트다운 1X가 490 rpm(slow roll)에서 이미 30 µm∠115°입니다. 불평형 응답이라면 이렇게 낮은 회전수에서는 거의 0이어야 합니다.' },
      { view: 'bode', set: { compensate: true }, text: 'slow roll 벡터를 빼면 운전점 1X는 15 µm p-p, 임계속도 근처(약 3,900 rpm)에서 44 µm로 정상적인 불평형 응답입니다.' },
      { view: 'spectrum', text: '프로브 스펙트럼에 2X 9 µm · 3X 5 µm가 있는데 하우징에는 2X·3X가 거의 없습니다. 축 표면(프로브가 보는 궤도)의 흠이 회전마다 같은 모양으로 읽히는 것입니다.' },
      { view: 'spectrum', set: { sensor: 'H', unit: 'vel' }, text: '하우징 1X는 0.79 mm/s이고 그 밖의 줄은 거의 없습니다.' },
    ],
    traps: {
      unbalance: '보상한 1X 15 µm는 정상 수준입니다. 감시값을 키운 것은 회전수와 무관하게 더해지는 런아웃 30 µm입니다.',
      bow: '휨이면 하우징 1X도 따라 커지고, 정지·가열 이력에 따라 slow roll 벡터가 바뀝니다. 런아웃은 회전수·온도와 무관하게 같은 벡터입니다.',
      rub: '½X·하모닉 무리·잘린 오빗이 없습니다. 2X·3X는 저속에서도 같은 크기로 있습니다.',
    },
    next: 'slow roll 벡터를 감시 채널의 보상값으로 넣고(P3-3), 다음 정비 때 프로브 궤도(저널) 표면의 기계적·전기적 런아웃을 재서 처리합니다(P3-2).',
  },
  {
    id: 'c11',
    level: 4,
    title: '송풍기 증속기 — 새 장비에서 처음 보는 줄',
    machine: M.M_BLOWER,
    sources: M.S_BLOWER,
    report: '새로 들인 범용 DAQ로 잰 기록에 357.5 Hz, 6.6 mm/s 줄이 섰습니다. 지난달까지 휴대용 분석기 기록에는 없던 줄입니다.',
    settings: base({ sensor: 'H', aaf: false }),
    truth: ['aliasing'],
    alsoOk: ['normal'],
    evidence: [
      { view: 'spectrum', text: '357.5 Hz는 14.4X — 1X(24.75 Hz)·피니언 축 1X(95.8 Hz)·베어링 주파수의 어느 정수배도 아닙니다.' },
      { view: 'spectrum', set: { aaf: true }, text: '같은 설정에서 AAF만 켜면 357.5 Hz 줄이 사라집니다.' },
      { view: 'spectrum', set: { fMax: 200 }, text: 'f_max를 200 Hz(f_s 512 Hz)로 바꾸면 줄이 154.75 Hz로 옮겨 갑니다. 진짜 기계 성분은 측정 설정에 따라 자리를 옮기지 않습니다.' },
      { view: 'spectrum', set: { fMax: 5000, lines: 3200, aaf: true }, text: '진짜 줄은 2202.75 Hz — 대기어 맞물림 GMF(89 × 24.75 Hz) 1.06 mm/s와 작은 측대역입니다. 2560 − 2202.75 = 357.25 Hz로 접혀 들어왔습니다.' },
    ],
    traps: {
      gearWear: '맞물림 자체는 건전한 수준(1.06 mm/s, 측대역 작음)입니다.',
      gearEccentric: '357.5 Hz 둘레의 24.75 Hz 간격 줄은 GMF 측대역이 함께 접힌 것입니다.',
      flow: '송풍기 축 1X(95.8 Hz)의 정수배가 아닙니다.',
    },
    next: 'DAQ 입력단에 AAF를 넣거나 AAF가 있는 장비를 쓰고, f_s를 볼 가장 높은 성분보다 넉넉히 높게 잡습니다(P2-3, P2-9).',
  },
];

export const CASE_BY_ID: Record<string, CaseDef> = Object.fromEntries(CASES.map((c) => [c.id, c]));
