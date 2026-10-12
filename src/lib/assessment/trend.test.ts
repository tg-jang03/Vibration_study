import { describe, expect, it } from 'vitest';
import { changeBand, compareMagnitude, DEMO, severityTrend, trendVerdict } from './severity';

describe('severity trend (LAB-ISO-01)', () => {
  it('noise-free step: value equals baseline before the event and the new value after', () => {
    const t = severityTrend({ baseline: 1.5, after: 3, event: 'step', noise: 0 });
    expect(t.day.length).toBe(61);
    expect(t.value[29]).toBe(1.5);
    expect(t.value[30]).toBe(3);
  });
  it('drift reaches the end value on the last day, linearly', () => {
    const t = severityTrend({ baseline: 1, after: 4, event: 'drift', noise: 0 });
    expect(t.value[30]).toBe(1);
    expect(t.value[45]).toBeCloseTo(2.5, 12);
    expect(t.value[60]).toBeCloseTo(4, 12);
  });
  it('same seed → same trend', () => {
    const a = severityTrend({ baseline: 1.5, after: 3, event: 'step' });
    const b = severityTrend({ baseline: 1.5, after: 3, event: 'step' });
    expect(a.value).toEqual(b.value);
  });
  it('change band = baseline ± rate × B/C, lower clipped at 0', () => {
    expect(changeBand(1.5, 5, 20)).toEqual({ lower: 0.5, upper: 2.5, width: 1 });
    expect(changeBand(0.5, 5, 20).lower).toBe(0);
  });
  it('step to 3 stays in zone B but leaves the change band on the event day', () => {
    const t = severityTrend({ baseline: 1.5, after: 3, event: 'step', noise: 0 });
    const v = trendVerdict(t, 1.5, DEMO.limits, DEMO.rate);
    expect(v.lastZone).toBe('B');
    expect(v.changeDay).toBe(30);
    expect(v.zoneDay).toBe(30); // A(1.5) → B(3): 구간도 한 칸 올라간다
    expect(v.lastChange.percentOfBC).toBeCloseTo(30, 12);
  });
  it('baseline already in B: step to 4 changes nothing in zone, change fires', () => {
    const t = severityTrend({ baseline: 2.5, after: 4, event: 'step', noise: 0 });
    const v = trendVerdict(t, 2.5, DEMO.limits, DEMO.rate);
    expect(compareMagnitude(2.5, DEMO.limits).zone).toBe('B');
    expect(v.zoneDay).toBeNull();
    expect(v.changeDay).toBe(30);
  });
  it('drop below the band is a change too', () => {
    const t = severityTrend({ baseline: 3, after: 1.5, event: 'drop', noise: 0 });
    const v = trendVerdict(t, 3, DEMO.limits, DEMO.rate);
    expect(v.changeDay).toBe(30);
    expect(v.lastChange.delta).toBeCloseTo(-1.5, 12);
  });
});
