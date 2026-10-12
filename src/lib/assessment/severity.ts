import { createRng } from '../dsp/random';
/** Generic comparison of user-supplied limits. No regulatory values or machine defaults. */
export type Zone = 'A' | 'B' | 'C' | 'D';
export type Limits = readonly [number, number, number];
export type Boundary = 'A/B' | 'B/C' | 'C/D';
export type MagnitudeResult = { zone: Zone; boundary: null } | { zone: null; boundary: Boundary };

export function parseNonnegative(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function validLimits(limits: Limits): boolean {
  return limits.every(Number.isFinite) && limits[0] > 0 && limits[0] < limits[1] && limits[1] < limits[2];
}

/** Values and limits must have the same measurement quantity, statistic, band and units. */
export function compareMagnitude(value: number, limits: Limits, equality: 'upper' | 'review' = 'review'): MagnitudeResult {
  if (!Number.isFinite(value) || value < 0 || !validLimits(limits)) throw new RangeError('Invalid magnitude or limits');
  const at = limits.indexOf(value);
  if (at >= 0 && equality === 'review') return { zone: null, boundary: (['A/B', 'B/C', 'C/D'] as const)[at] };
  const index = limits.findIndex(limit => value < limit);
  return { zone: (['A', 'B', 'C', 'D'] as const)[index < 0 ? 3 : index], boundary: null };
}

/** Arithmetic comparison only. A rate is supplied by the user, never inferred from the standard. */
export function compareChange(value: number, baseline: number, bc: number, rate: number | null = null) {
  if (![value, baseline, bc].every(Number.isFinite) || value < 0 || baseline < 0 || bc <= 0 ||
      (rate !== null && (!Number.isFinite(rate) || rate <= 0))) throw new RangeError('Invalid change inputs');
  const delta = value - baseline;
  let percentOfBC = 100 * (Math.abs(delta) / bc);
  if (!Number.isFinite(percentOfBC)) throw new RangeError('Change ratio exceeds numerical range');
  // Keep a mathematically equal rate at equality after SI conversion and subtraction.
  const equal = rate !== null && Math.abs(percentOfBC - rate) <= 32 * Number.EPSILON * Math.max(1, percentOfBC, rate);
  if (equal) percentOfBC = rate!;
  return { delta: delta === 0 ? 0 : delta, absoluteDelta: Math.abs(delta), percentOfBC,
    comparison: rate === null ? 'unset' as const : equal ? 'equal' as const : percentOfBC > rate ? 'above' as const : 'below' as const };
}

/** Fictional dimensionless exercise; these values are not ISO thresholds. */
export const DEMO = { limits: [2, 5, 9] as Limits, value: 4, baseline: 2.5, rate: 20 } as const;

// ── 추세 위의 크기·변화 판정 (P10-1 §4, LAB-ISO-01) ──────────────────────────

export type TrendEvent = 'step' | 'drift' | 'drop' | 'steady';
export interface TrendOptions {
  /** 같은 조건의 건전한 기준선 */
  baseline: number;
  /** 사건 뒤 값 (drift는 마지막 날 값) */
  after: number;
  event: TrendEvent;
  /** 기록 일수 (기본 60) */
  days?: number;
  /** 사건이 시작되는 날 (기본 30, drift는 이날부터 마지막 날까지 직선) */
  eventDay?: number;
  /** 날마다 곱하는 상대 잡음의 표준편차 (기본 0.04) */
  noise?: number;
  seed?: number;
}

/** 가상 일별 전체값 추세. 잡음은 시드 고정 (D-011), 음수는 0으로. */
export function severityTrend(o: TrendOptions): { day: number[]; value: number[] } {
  const days = o.days ?? 60, start = o.eventDay ?? 30, noise = o.noise ?? 0.04;
  if (![o.baseline, o.after, noise].every((v) => Number.isFinite(v) && v >= 0) || !(days > start && start >= 0)) throw new RangeError('Invalid trend options');
  const rng = createRng(o.seed ?? 1001);
  const day = Array.from({ length: days + 1 }, (_, i) => i);
  const value = day.map((d) => {
    let truth = o.baseline;
    if (o.event === 'step' || o.event === 'drop') truth = d >= start ? o.after : o.baseline;
    else if (o.event === 'drift') truth = d <= start ? o.baseline : o.baseline + ((o.after - o.baseline) * (d - start)) / (days - start);
    return Math.max(0, truth * (1 + noise * rng.normal()));
  });
  return { day, value };
}

/** 변화 비교 띠: 기준선 ± (비교율 % × B/C 경계). 아래쪽은 0에서 자른다. */
export function changeBand(baseline: number, bc: number, ratePct: number) {
  if (![baseline, bc, ratePct].every(Number.isFinite) || baseline < 0 || bc <= 0 || ratePct <= 0) throw new RangeError('Invalid change band');
  const w = (ratePct / 100) * bc;
  return { lower: Math.max(0, baseline - w), upper: baseline + w, width: w };
}

/** 추세에서 조건을 처음 만족한 날 (없으면 null) */
export function firstDay(trend: { day: number[]; value: number[] }, test: (v: number) => boolean): number | null {
  const i = trend.value.findIndex(test);
  return i < 0 ? null : trend.day[i];
}

/**
 * 추세 판정 요약. 현재 크기 = 마지막 5일 평균 (하루 잡음에 판정이 흔들리지 않게).
 * changeDay = 하루 값이 변화 비교 띠를 처음 벗어난 날, zoneDay = 하루 값이 기준선의 구간보다 위 구간에 처음 들어간 날.
 */
export function trendVerdict(trend: { day: number[]; value: number[] }, baseline: number, limits: Limits, ratePct: number) {
  const band = changeBand(baseline, limits[1], ratePct);
  const zoneIndex = (v: number) => 'ABCD'.indexOf(compareMagnitude(v, limits, 'upper').zone!);
  const baseZone = zoneIndex(baseline);
  const tail = trend.value.slice(-5);
  const last = tail.reduce((a, b) => a + b, 0) / tail.length;
  return {
    band,
    lastValue: last,
    lastZone: compareMagnitude(last, limits, 'upper').zone!,
    lastChange: compareChange(last, baseline, limits[1], ratePct),
    changeDay: firstDay(trend, (v) => v > band.upper || v < band.lower),
    zoneDay: firstDay(trend, (v) => zoneIndex(v) > baseZone),
  };
}
