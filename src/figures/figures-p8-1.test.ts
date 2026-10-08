import { describe, expect, it } from 'vitest';
import { P81_VALUES as V } from './p8-1';
describe('P8-1 text / figures / lab numerical contract',()=>{
  it('locks sampled peaks and AF/SM',()=>{
    expect(V.firstPeakRpm).toBe(1500);expect(V.secondPeakRpm).toBe(3020);
    expect(V.firstPeak).toBeCloseTo(83.4635277,5);expect(V.secondPeak).toBeCloseTo(78.7255436,5);
    expect(V.af1).toBeCloseTo(8.2153257,5);expect(V.sm1).toBeCloseTo(58.333333,5);expect(V.sm2).toBeCloseTo(16.111111,5);
  });
  it('locks sensor and damping contrasts',()=>{
    expect(V.b1At3000).toBeCloseTo(77.2051148,5);expect(V.b2At3000).toBeCloseTo(75.1176725,5);expect(V.centerAt3000).toBeCloseTo(19.9363056,5);
    expect(V.phaseDiff1).toBeCloseTo(2.7418779,5);expect(V.phaseDiff2).toBeCloseTo(159.9606078,5);
    expect(V.dampedAt3000).toBeCloseTo(15,10);
  });
  it('locks bow and compensation examples',()=>{
    expect(V.hotAtZero).toBeCloseTo(4,10);expect(V.hotAt200).toBeCloseTo(4.1793629,5);
    expect(V.coldAt1500).toBeCloseTo(83.4635277,5);expect(V.hotAt1500).toBeCloseTo(103.650626,5);expect(V.compAt1500).toBeCloseTo(100.8227437,5);
  });
});
