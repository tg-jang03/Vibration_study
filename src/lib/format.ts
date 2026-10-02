/**
 * 살아있는 수식에 대입할 숫자를 TeX 문자열로 만든다.
 * 유효숫자 sig자리, 아주 크거나 작은 값은 a \times 10^{b} 꼴.
 * texNumber(0.3125) → '0.3125', texNumber(1.5e-6) → '1.5 \times 10^{-6}'
 */
export function texNumber(value: number, sig = 4): string {
  if (!Number.isFinite(value)) return value > 0 ? '\\infty' : value < 0 ? '-\\infty' : '\\text{NaN}';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e-3 && abs < 1e6) {
    return String(Number(value.toPrecision(sig)));
  }
  const [mantissa, exponent] = value.toExponential(sig - 1).split('e');
  return `${Number(mantissa)} \\times 10^{${Number(exponent)}}`;
}
