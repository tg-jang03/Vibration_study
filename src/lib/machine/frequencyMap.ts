/**
 * 주파수 지도 (P1-7 그림·LAB-FMAP-01이 함께 쓰는 예시 기계). 순수 함수, 단위 Hz (D-012).
 * 요소마다 한 줄(row)에 그 요소가 만드는 주파수 줄(line)과 대역(band)을 모은다.
 * - rotating: 회전수를 따라 움직인다 / fixed: 전원 주파수·고유진동수에 묶여 제자리
 * 구조 고유진동수·울림 대역·풀리·벨트 치수는 설명용 예시값이다.
 */
import {
  BEARING_6205,
  bearingFrequencies,
  beltFrequency,
  bladePass,
  electromagneticForce,
  gearPair,
  oilWhirlBand,
  shaftHarmonic,
  type BearingGeometry,
} from './frequencies';

export type LineKind = 'rotating' | 'fixed';

export interface MapLine {
  label: string;
  f: number;
  kind: LineKind;
}

export interface MapBand {
  label: string;
  f1: number;
  f2: number;
  kind: LineKind;
}

export interface MapRow {
  element: string;
  lines: MapLine[];
  bands: MapBand[];
}

export type ZoneId = 'sub' | 'low' | 'mid' | 'high';

export interface InterestZone {
  id: ZoneId;
  label: string;
  f1: number;
  f2: number;
}

export interface FrequencyMap {
  /** 기준 축(회전수 슬라이더의 축) 회전 주파수 */
  fr: number;
  rows: MapRow[];
  zones: InterestZone[];
  /** 지도에 있는 가장 높은 주파수 (줄·대역 끝 포함) = 측정 범위의 위 끝 후보 */
  highest: number;
}

/** 지도 가로축 범위 [Hz] — 회전수를 바꿔도 줄이 움직이는 것이 보이도록 고정 */
export const MAP_RANGE: [number, number] = [2, 20000];

/** 전원 주파수 [Hz] (한국) */
export const LINE_FREQUENCY = 60;

/** 높은 구간의 시작 (수 kHz, 예시) */
export const HIGH_ZONE_START = 2000;

/** 관심 주파수 구간 4개: 1X 아래 / 1X ~ 10X / 10X ~ 수 kHz / 수 kHz 이상 */
export function interestZones(fr: number): InterestZone[] {
  const tenX = 10 * fr;
  const midEnd = Math.max(HIGH_ZONE_START, tenX);
  return [
    { id: 'sub', label: '1X 아래', f1: MAP_RANGE[0], f2: fr },
    { id: 'low', label: '1X ~ 10X', f1: fr, f2: tenX },
    { id: 'mid', label: '10X ~ 수 kHz', f1: tenX, f2: midEnd },
    { id: 'high', label: '수 kHz 이상', f1: midEnd, f2: MAP_RANGE[1] },
  ];
}

export type PresetId = 'motorPump' | 'gearbox' | 'gtGenerator' | 'beltFan';

export interface Preset {
  id: PresetId;
  label: string;
  /** 회전수 슬라이더가 가리키는 축 */
  shaftLabel: string;
  rpm: number;
  /** 날개 수 또는 잇수 */
  countLabel: string;
  count: number;
  countRange: [number, number];
  /** 구름베어링이 있으면 기본 볼 수, 없으면 null (미끄럼 베어링) */
  balls: number | null;
}

export const PRESETS: Record<PresetId, Preset> = {
  motorPump: {
    id: 'motorPump',
    label: '전동기-펌프 (직결)',
    shaftLabel: '전동기·펌프 축',
    rpm: 3570,
    countLabel: '펌프 날개 수 N_b',
    count: 7,
    countRange: [3, 12],
    balls: 9,
  },
  gearbox: {
    id: 'gearbox',
    label: '기어 상자 (이빨 15 → 60)',
    shaftLabel: '입력 축',
    rpm: 3000,
    countLabel: '입력 기어 이빨 수 z₁ (출력 기어 60)',
    count: 15,
    countRange: [10, 40],
    balls: 9,
  },
  gtGenerator: {
    id: 'gtGenerator',
    label: 'GT-발전기 축계 (미끄럼 베어링)',
    shaftLabel: '로터',
    rpm: 3600,
    countLabel: '압축기 1단 날개 수 N_b',
    count: 30,
    countRange: [10, 60],
    balls: null,
  },
  beltFan: {
    id: 'beltFan',
    label: '벨트 구동 팬',
    shaftLabel: '전동기 축',
    rpm: 1780,
    countLabel: '팬 날개 수 N_b',
    count: 6,
    countRange: [3, 12],
    balls: 9,
  },
};

/** 예시 치수·값 */
export const EXAMPLE = {
  /** 출력 기어 잇수 */
  gearTeethOut: 60,
  /** 받침대(구조) 고유진동수 [Hz] */
  structureNatural: 85,
  /** GT 받침대 고유진동수 [Hz] */
  gtStructureNatural: 45,
  /** 충격이 울리는 하우징 고유진동수 대역 [Hz] */
  ringBand: [2000, 5000] as [number, number],
  /** 벨트 구동: 전동기 풀리 지름, 팬 풀리 지름, 벨트 길이 [m] */
  motorPulley: 0.2,
  fanPulley: 0.4,
  beltLength: 1.6,
} as const;

/** 볼 수만 바꾸고 볼 지름·피치 지름 비는 6205와 같게 둔 베어링 */
export function exampleBearing(balls: number): BearingGeometry {
  return { ...BEARING_6205, balls };
}

const r = (label: string, f: number): MapLine => ({ label, f, kind: 'rotating' });
const fixed = (label: string, f: number): MapLine => ({ label, f, kind: 'fixed' });

function bearingRow(element: string, balls: number, fr: number): MapRow {
  const b = bearingFrequencies(exampleBearing(balls), fr);
  return {
    element,
    lines: [r('케이지 FTF', b.ftf), r('외륜 BPFO', b.bpfo), r('내륜 BPFI', b.bpfi), r('볼 자전 BSF', b.bsf)],
    bands: [],
  };
}

function structureRow(natural: number, ring: boolean): MapRow {
  return {
    element: '구조',
    lines: [fixed('고유진동수', natural)],
    bands: ring ? [{ label: '충격 울림', f1: EXAMPLE.ringBand[0], f2: EXAMPLE.ringBand[1], kind: 'fixed' }] : [],
  };
}

export interface MapParams {
  rpm: number;
  /** 날개 수 또는 입력 기어 잇수 */
  count: number;
  /** 볼 수 (구름베어링이 없으면 무시) */
  balls: number;
}

/** 프리셋 기계의 주파수 지도 */
export function buildMap(id: PresetId, params: MapParams): FrequencyMap {
  const fr = params.rpm / 60;
  const twoFL = electromagneticForce(LINE_FREQUENCY);
  const rows: MapRow[] = [];
  if (id === 'motorPump') {
    rows.push(
      { element: '축 · 커플링', lines: [r('1X', fr), r('2X', shaftHarmonic(2, fr)), r('3X', shaftHarmonic(3, fr))], bands: [] },
      bearingRow('구름베어링', params.balls, fr),
      { element: '펌프 날개', lines: [r('날개 통과', bladePass(params.count, fr)), r('× 2', 2 * bladePass(params.count, fr))], bands: [] },
      { element: '전동기 (전기)', lines: [fixed('2 f_L', twoFL)], bands: [] },
      structureRow(EXAMPLE.structureNatural, true),
    );
  } else if (id === 'gearbox') {
    const pair = gearPair(params.count, EXAMPLE.gearTeethOut, fr);
    rows.push(
      { element: '입력 축', lines: [r('1X', fr), r('2X', 2 * fr)], bands: [] },
      { element: '출력 축', lines: [r('1X', pair.f2), r('2X', 2 * pair.f2)], bands: [] },
      { element: '기어 맞물림', lines: [r('맞물림', pair.mesh), r('× 2', 2 * pair.mesh), r('× 3', 3 * pair.mesh)], bands: [] },
      bearingRow('구름베어링 (입력 축)', params.balls, fr),
      structureRow(EXAMPLE.structureNatural, true),
    );
  } else if (id === 'gtGenerator') {
    const [w1, w2] = oilWhirlBand(fr);
    rows.push(
      { element: '로터', lines: [r('1X', fr), r('2X', 2 * fr)], bands: [] },
      { element: '미끄럼 베어링', lines: [], bands: [{ label: '기름막 0.38 ~ 0.48X', f1: w1, f2: w2, kind: 'rotating' }] },
      { element: '압축기 날개', lines: [r('날개 통과', bladePass(params.count, fr))], bands: [] },
      { element: '발전기 (전기)', lines: [fixed('2 f_L', twoFL)], bands: [] },
      structureRow(EXAMPLE.gtStructureNatural, false),
    );
  } else {
    const fanFr = (fr * EXAMPLE.motorPulley) / EXAMPLE.fanPulley;
    const belt = beltFrequency(EXAMPLE.motorPulley, EXAMPLE.beltLength, fr);
    rows.push(
      { element: '전동기 축', lines: [r('1X', fr), r('2X', 2 * fr)], bands: [] },
      { element: '벨트', lines: [r('벨트', belt), r('× 2', 2 * belt)], bands: [] },
      { element: '팬 축', lines: [r('팬 1X', fanFr), r('팬 2X', 2 * fanFr)], bands: [] },
      { element: '팬 날개', lines: [r('날개 통과', bladePass(params.count, fanFr))], bands: [] },
      bearingRow('구름베어링 (팬 축)', params.balls, fanFr),
      { element: '전동기 (전기)', lines: [fixed('2 f_L', twoFL)], bands: [] },
      structureRow(EXAMPLE.structureNatural, true),
    );
  }
  const highest = Math.max(...rows.flatMap((row) => [...row.lines.map((l) => l.f), ...row.bands.map((b) => b.f2)]));
  return { fr, rows, zones: interestZones(fr), highest };
}

/** 줄이 어느 관심 구간에 드나 */
export function zoneOf(f: number, zones: InterestZone[]): ZoneId {
  for (const z of zones) if (f < z.f2) return z.id;
  return 'high';
}
