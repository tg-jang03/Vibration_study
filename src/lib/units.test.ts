import { describe, expect, it } from 'vitest';
import { convertSine, INCH, MIL, STANDARD_GRAVITY, UNITS, type Detector, type UnitId } from './units';

describe('convertSine — 정현파 진동 단위 환산 (Contents §6)', () => {
  it('상수: 1 mil = 25.4 µm, g = 9.80665 m/s²', () => {
    expect(MIL).toBeCloseTo(25.4e-6, 15);
    expect(INCH).toBe(0.0254);
    expect(UNITS.g.si).toBe(STANDARD_GRAVITY);
  });

  it('25 Hz, 50 µm pp → 2.78 mm/s rms', () => {
    const v = convertSine({ value: 50, unit: 'um', detector: 'pp' }, { unit: 'mm/s', detector: 'rms' }, 25);
    expect(v).toBeCloseTo((Math.PI * 2 * 25 * 25e-6 * 1000) / Math.SQRT2, 10);
    expect(v).toBeCloseTo(2.777, 3);
  });

  it('1 in/s pk → 17.96 mm/s rms (주파수 필요 없음)', () => {
    expect(convertSine({ value: 1, unit: 'in/s', detector: 'pk' }, { unit: 'mm/s', detector: 'rms' })).toBeCloseTo(17.961, 3);
  });

  it('1 g pk = 9.80665 m/s² pk, 표기만 바꾸기: Peak = √2·RMS = PP/2', () => {
    expect(convertSine({ value: 1, unit: 'g', detector: 'pk' }, { unit: 'm/s2', detector: 'pk' })).toBeCloseTo(9.80665, 12);
    expect(convertSine({ value: 1, unit: 'mm/s', detector: 'rms' }, { unit: 'mm/s', detector: 'pk' })).toBeCloseTo(Math.SQRT2, 12);
    expect(convertSine({ value: 1, unit: 'um', detector: 'pk' }, { unit: 'um', detector: 'pp' })).toBeCloseTo(2, 12);
  });

  it('v = 2πf·d, a = (2πf)²·d: 100 Hz, 10 µm pk → 6.283 mm/s pk, 3.948 m/s² pk', () => {
    const d = { value: 10, unit: 'um' as UnitId, detector: 'pk' as Detector };
    expect(convertSine(d, { unit: 'mm/s', detector: 'pk' }, 100)).toBeCloseTo(6.2832, 4);
    expect(convertSine(d, { unit: 'm/s2', detector: 'pk' }, 100)).toBeCloseTo(3.9478, 4);
  });

  it('왕복 환산은 원래 값으로', () => {
    const units: UnitId[] = ['um', 'mil', 'mm/s', 'in/s', 'm/s2', 'g'];
    const dets: Detector[] = ['pk', 'pp', 'rms'];
    for (const u of units) for (const t of units) for (const d of dets) {
      const there = convertSine({ value: 3.7, unit: u, detector: d }, { unit: t, detector: 'rms' }, 47);
      expect(convertSine({ value: there, unit: t, detector: 'rms' }, { unit: u, detector: d }, 47)).toBeCloseTo(3.7, 10);
    }
  });

  it('양이 다른데 주파수가 없으면 RangeError', () => {
    expect(() => convertSine({ value: 1, unit: 'um', detector: 'pk' }, { unit: 'g', detector: 'pk' })).toThrow(RangeError);
  });
});
