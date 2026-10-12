/**
 * LAB-CASE-01의 진단 보기 (D-052). 원인 하나 = 보기 하나. 증거 5요소 카드가 있는 원인은 `lib/faults/catalog.ts`의 항목을 가리킨다.
 * 측정 문제(런아웃·에일리어싱·센서 부착)는 기계 결함이 아니라 "측정이 만든 증거"라 따로 묶는다.
 */
import type { FaultId } from '../faults/catalog';

export type DiagId =
  | 'normal'
  | 'unbalance'
  | 'bow'
  | 'misalignment'
  | 'looseness'
  | 'rub'
  | 'resonance'
  | 'oilWhirl'
  | 'oilWhip'
  | 'bearingOuter'
  | 'bearingInner'
  | 'bearingBall'
  | 'bearingCage'
  | 'gearWear'
  | 'gearEccentric'
  | 'gearBroken'
  | 'stator2LF'
  | 'rotorBar'
  | 'flow'
  | 'cavitation'
  | 'morton'
  | 'runout'
  | 'aliasing'
  | 'mount';

export interface DiagInfo {
  id: DiagId;
  label: string;
  /** 증거 5요소 카드 (catalog) */
  fault?: FaultId;
  /** 카드가 없는 보기의 한 줄 설명: 이 원인이면 무엇이 보이나 */
  sign: string;
  page: string;
}

export interface DiagGroup {
  title: string;
  items: DiagInfo[];
}

export const DIAG_GROUPS: DiagGroup[] = [
  {
    title: '축 · 회전체',
    items: [
      { id: 'unbalance', label: '불평형', fault: 'unbalance', sign: '1X가 대부분, 반경 방향, 수평·수직 위상차 약 90°, 회전수 제곱에 비례', page: 'P7-2' },
      { id: 'bow', label: '축 휨 (bow)', fault: 'bow', sign: 'slow roll에서도 1X가 남고, 정지 시간·온도에 따라 1X 벡터가 바뀐다', page: 'P7-2 · P8-2' },
      { id: 'misalignment', label: '미스얼라인', fault: 'misalignment', sign: '축방향 1X·2X가 크고, 커플링 건너편과 약 180°', page: 'P7-3' },
      { id: 'looseness', label: '기계적 풀림', fault: 'looseness', sign: '하모닉 무리, ½X 자리 줄, 뾰족한 파형, 한 방향이 유난히 큼', page: 'P7-3' },
      { id: 'rub', label: '러브 (접촉)', fault: 'rub', sign: '정확한 ½X·⅓X와 하모닉, 잘린 오빗, 역방향 성분', page: 'P7-3' },
    ],
  },
  {
    title: '구조',
    items: [{ id: 'resonance', label: '구조 공진', fault: 'resonance', sign: '한 방향만 크고, 좁은 회전수에서 봉우리와 위상 180° 변화, 정지 임팩트 시험의 고유진동수가 가진 주파수 근처', page: 'P9-1' }],
  },
  {
    title: '유체막 베어링',
    items: [
      { id: 'oilWhirl', label: '오일 휠', fault: 'oilWhirl', sign: '0.38 ~ 0.48X가 회전수를 따라간다', page: 'P7-4' },
      { id: 'oilWhip', label: '오일 휩', fault: 'oilWhip', sign: '1X 아래 성분이 회전체 고유진동수에 잠겨 회전수를 올려도 그 자리에 머문다', page: 'P7-4' },
    ],
  },
  {
    title: '구름베어링',
    items: [
      { id: 'bearingOuter', label: '외륜 결함', fault: 'bearingOuter', sign: '엔벨로프에 BPFO와 하모닉, 1X 측대역 없음', page: 'P7-5' },
      { id: 'bearingInner', label: '내륜 결함', fault: 'bearingInner', sign: '엔벨로프에 BPFI와 1X 간격 측대역', page: 'P7-5' },
      { id: 'bearingBall', label: '볼 결함', fault: 'bearingBall', sign: '2×BSF와 FTF 간격 측대역', page: 'P7-5' },
      { id: 'bearingCage', label: '케이지 결함', fault: 'bearingCage', sign: 'FTF(1X의 약 0.4배)와 그 하모닉', page: 'P7-5' },
    ],
  },
  {
    title: '기어',
    items: [
      { id: 'gearWear', label: '기어 마모', fault: 'gear', sign: '2×·3×GMF가 커지고, 측대역은 넓게 고르게 낮다', page: 'P7-6' },
      { id: 'gearEccentric', label: '기어 편심', fault: 'gear', sign: 'GMF 둘레에 그 축 간격의 측대역 한두 쌍, 한 바퀴에 한 번 출렁이는 진폭', page: 'P7-6' },
      { id: 'gearBroken', label: '깨진 이', fault: 'gear', sign: 'GMF 둘레에 결함 축 간격의 작은 측대역이 많고, 파형에 한 바퀴 한 번 충격', page: 'P7-6' },
    ],
  },
  {
    title: '전기',
    items: [
      { id: 'stator2LF', label: '고정자·공극 자기력 (2×LF)', fault: 'electrical2LF', sign: '2×LF 고정 자리, 전원·계자를 끊는 순간 사라진다', page: 'P7-7' },
      { id: 'rotorBar', label: '로터바', fault: 'rotorBar', sign: '1X ± 극통과 주파수 측대역, 부하에 따라 변한다', page: 'P7-7' },
    ],
  },
  {
    title: '유체 · 공력 · 열',
    items: [
      { id: 'flow', label: '날개 통과 · 유동', fault: 'bladePass', sign: '날개 통과 주파수와 그 2배가 운전점(유량)에 따라 변한다', page: 'P7-8' },
      { id: 'cavitation', label: '캐비테이션', fault: 'cavitation', sign: 'kHz 넓은 대역 잡음, 엔벨로프에 뚜렷한 줄 없음, 흡입 압력에 반응', page: 'P7-8' },
      { id: 'morton', label: 'Morton effect', sign: '정속에서 1X 벡터가 수십 분 ~ 몇 시간 주기로 돌며 오르내린다(Polar에서 고리), 접촉 흔적 없음', page: 'P8-2' },
    ],
  },
  {
    title: '측정 문제',
    items: [
      { id: 'runout', label: '런아웃 (slow roll 미보상)', sign: '근접 프로브만 높고 하우징은 작다, 저속(slow roll)에서도 같은 1X·2X 벡터', page: 'P3-2 · P3-3' },
      { id: 'aliasing', label: '에일리어싱 (가짜 줄)', sign: 'AAF 없이 잰 기록에만 있고, 기계 주파수의 어느 배수에도 맞지 않으며, f_s를 바꾸면 자리가 옮겨 가거나 사라진다', page: 'P2-3' },
      { id: 'mount', label: '센서 부착 불량', sign: '고주파 쪽이 비정상으로 크거나 작고, 같은 자리를 다시 붙여 재면 달라진다', page: 'P3-1' },
    ],
  },
  {
    title: '이상 없음',
    items: [{ id: 'normal', label: '기계 결함 없음', sign: '모든 줄이 건전한 기계의 작은 수준', page: 'P10-1' }],
  },
];

export const DIAG_BY_ID: Record<DiagId, DiagInfo> = Object.fromEntries(DIAG_GROUPS.flatMap((g) => g.items).map((d) => [d.id, d])) as Record<DiagId, DiagInfo>;
export const ALL_DIAGS: DiagId[] = DIAG_GROUPS.flatMap((g) => g.items.map((d) => d.id));

/** 제출한 보기와 정답 비교: 맞힌 것·놓친 것·틀린 것 */
export function grade(truth: readonly DiagId[], chosen: readonly DiagId[]) {
  const hit = chosen.filter((c) => truth.includes(c));
  const missed = truth.filter((t) => !chosen.includes(t));
  const wrong = chosen.filter((c) => !truth.includes(c));
  return { hit, missed, wrong, exact: missed.length === 0 && wrong.length === 0 };
}
