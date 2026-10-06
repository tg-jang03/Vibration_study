/**
 * P2-9 본문 그림의 숫자가 본문 서술과 맞는지 확인한다 (D-026: 그림 데이터 = 본문 숫자).
 */
import { describe, expect, it } from 'vitest';
import * as F8 from './p2-9';
import { P18_VALUES as V } from './p2-9';

const specs = Object.values(F8 as Record<string, unknown>).filter((v): v is { id: string; panels: { series: { y: ArrayLike<number> }[] }[] } =>
  typeof v === 'object' && v !== null && 'panels' in v);

describe('P2-9 그림 데이터', () => {
  it('그림 4개, id가 겹치지 않고 모든 값이 유한하다', () => {
    expect(specs).toHaveLength(4);
    expect(new Set(specs.map((s) => s.id)).size).toBe(4);
    for (const s of specs) for (const p of s.panels) for (const series of p.series) {
      expect(Array.from(series.y).every(Number.isFinite)).toBe(true);
    }
  });

  it('기어 예: 400 라인은 2.5 bin으로 붙고, 800 라인은 5 bin으로 갈라진다. T 0.4 s, 총 1.8 s', () => {
    expect(V.coarseBins).toBeCloseTo(2.5, 10);
    expect(V.coarseStatus).toBe('merged');
    expect(V.fineBins).toBeCloseTo(5, 10);
    expect(V.fineStatus).toBe('visible');
    expect(V.exampleFrame).toBeCloseTo(0.4, 10);
    expect(V.exampleTotal).toBeCloseTo(1.8, 10);
  });

  it('AAF 없이 F_max 1000 Hz: 3 kHz 울림이 440 Hz로 접혀 들어온다', () => {
    expect(V.ringAlias).toBeCloseTo(440, 10);
    expect(V.aafOffRing).toBe('aliased');
  });

  it('목적별 화면: Flat top 1X 2.83 mm/s RMS, 0.45X 보임, 울림 대역이 바닥보다 6 dB 이상', () => {
    expect(V.balance1x).toBeCloseTo(4 / Math.SQRT2, 1);
    expect(V.subStatus).toBe('visible');
    expect(V.ringMargin).toBeGreaterThan(6);
  });
});
