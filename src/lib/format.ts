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

/**
 * 읽음값 표 등 일반 텍스트용 숫자 표기. 유효숫자 sig자리, 음수는 유니코드 마이너스(−).
 * formatNumber(0.84883) → '0.8488', formatNumber(-2.5e-7) → '−2.5e-7'
 */
export function formatNumber(value: number, sig = 4): string {
  if (Number.isNaN(value)) return '—';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '−∞';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  const text =
    abs >= 1e-3 && abs < 1e6
      ? String(Number(abs.toPrecision(sig)))
      : (() => {
          const [m, e] = abs.toExponential(sig - 1).split('e');
          return `${Number(m)}e${Number(e)}`;
        })();
  return value < 0 ? `−${text}` : text;
}

/**
 * 측정값과 이론값의 상대 오차 [%] 문자열. 이론값이 0이면 '—'.
 * formatError(0.849, 1) → '−15.1 %'
 */
export function formatError(measured: number, theory: number, digits = 1): string {
  if (theory === 0 || !Number.isFinite(measured) || !Number.isFinite(theory)) return '—';
  const pct = ((measured - theory) / Math.abs(theory)) * 100;
  const rounded = Number(pct.toFixed(digits));
  if (rounded === 0) return `0 %`;
  return `${rounded < 0 ? '−' : '+'}${Math.abs(rounded).toFixed(digits)} %`;
}
