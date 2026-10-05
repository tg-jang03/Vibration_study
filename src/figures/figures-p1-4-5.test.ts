/**
 * P1-4·P1-5 본문 그림의 숫자가 이론값·본문 서술과 맞는지 확인한다 (D-026: 그림 데이터 = 본문 숫자).
 */
import { describe, expect, it } from 'vitest';
import * as F4 from './p1-4';
import { P15_VALUES as V } from './p1-5';
import * as F5 from './p1-5';

const specs = (m: Record<string, unknown>) =>
  Object.values(m).filter((v): v is { id: string; caption: string; panels: { series: { y: ArrayLike<number> }[] }[] } =>
    typeof v === 'object' && v !== null && 'panels' in v);

describe('P1-4·P1-5 그림 데이터', () => {
  it('모든 계열 값이 유한하고 id가 겹치지 않는다', () => {
    const all = [...specs(F4), ...specs(F5)];
    expect(new Set(all.map((s) => s.id)).size).toBe(all.length);
    for (const s of all) for (const p of s.panels) for (const series of p.series) {
      expect(Array.from(series.y).every(Number.isFinite)).toBe(true);
    }
  });

  it('P1-4 캡션의 누설·가리비 숫자가 문헌값과 맞다', () => {
    expect(F4.leakage.caption).toContain('0.64');
    expect(F4.uniformVsHann.caption).toContain('0.85');
    expect(F4.kernelShapes.caption).toContain('−13.3 dB');
    expect(F4.kernelShapes.caption).toContain('−31.5 dB');
  });

  it('파워 평균은 바닥 높이를 유지하고 흔들림만 1/√M로 줄인다', () => {
    expect(V.spread64).toBeGreaterThan(0.125 * 0.8);
    expect(V.spread64).toBeLessThan(0.125 * 1.2);
    // 바닥보다 작은 32 Hz는 파워 평균 후에도 바닥 근처, 70 Hz는 바닥보다 확실히 크다
    expect(V.pa64Tone).toBeLessThan(V.noiseRmsMm * 1.25);
    expect(V.pa64Tone2).toBeGreaterThan(V.noiseRmsMm * 1.5);
  });

  it('트리거한 벡터 평균은 잡음 진폭을 약 1/√M로 줄이고 동기 성분을 남긴다', () => {
    expect(V.vecFloor / V.noiseRmsMm).toBeGreaterThan(0.125 * 0.8);
    expect(V.vecFloor / V.noiseRmsMm).toBeLessThan(0.125 * 1.2);
    expect(V.vecTone).toBeGreaterThan(V.vecFloor * 2);
    expect(Math.abs(V.vecTone2 - V.tone2RmsMm)).toBeLessThan(4 * V.vecFloor);
    expect(V.vecNoTrigTone2).toBeLessThan(V.tone2RmsMm * 0.2);
  });

  it('선형·지수 평균과 오버랩 숫자가 본문과 같다', () => {
    expect(V.linEnd).toBeCloseTo(Math.sqrt(3), 10); // (20·1 + 40·4)/60 = 3
    expect(V.expAt40).toBeGreaterThan(1.9);
    expect(V.meff75).toBeCloseTo(8.59, 1);
    expect(V.meff50).toBeCloseTo(15.2, 1);
  });
});
