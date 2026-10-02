import { describe, expect, it } from 'vitest';
import { aliasFrequency } from './sampling';

describe('aliasFrequency', () => {
  it('나이퀴스트 아래 성분은 그대로 보인다', () => {
    expect(aliasFrequency(60, 1000)).toBeCloseTo(60);
  });

  it('fs 1000 Hz에서 940·1060·1940 Hz는 모두 60 Hz로 보인다 (Contents §6)', () => {
    for (const f of [940, 1060, 1940]) {
      expect(aliasFrequency(f, 1000)).toBeCloseTo(60);
    }
  });

  it('AAF 없는 1.8·F_max 성분: F_max 1000 Hz, fs 2560 Hz → 760 Hz', () => {
    expect(aliasFrequency(1800, 2560)).toBeCloseTo(760);
  });
});
