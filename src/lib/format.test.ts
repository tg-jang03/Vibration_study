import { describe, expect, it } from 'vitest';
import { formatError, formatNumber, texNumber } from './format';

describe('texNumber', () => {
  it('보통 크기는 유효숫자만큼 그대로', () => {
    expect(texNumber(0.3125)).toBe('0.3125');
    expect(texNumber(10)).toBe('10');
    expect(texNumber(1 / 3)).toBe('0.3333');
  });

  it('아주 작거나 큰 값은 a × 10^b', () => {
    expect(texNumber(1.5e-6)).toBe('1.5 \\times 10^{-6}');
    expect(texNumber(2.56e7)).toBe('2.56 \\times 10^{7}');
  });

  it('0, 무한대', () => {
    expect(texNumber(0)).toBe('0');
    expect(texNumber(Infinity)).toBe('\\infty');
  });
});

describe('formatNumber', () => {
  it('유효숫자 4자리, 음수는 유니코드 마이너스', () => {
    expect(formatNumber(0.84883)).toBe('0.8488');
    expect(formatNumber(-0.5)).toBe('−0.5');
    expect(formatNumber(-2.5e-7)).toBe('−2.5e-7');
  });

  it('NaN은 대시', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
  });
});

describe('formatError', () => {
  it('Hann 스캘럽 손실: 0.849 / 1 → −15.1 %', () => {
    expect(formatError(0.849, 1)).toBe('−15.1 %');
  });

  it('부호와 0', () => {
    expect(formatError(1.02, 1)).toBe('+2.0 %');
    expect(formatError(1, 1)).toBe('0 %');
  });

  it('이론값이 0이면 대시', () => {
    expect(formatError(0.1, 0)).toBe('—');
  });
});
