import { fft } from './fft';

/**
 * 시간 동기 평균 (TSA, Time Synchronous Averaging) — P1-5 §4, LAB-AVG-02.
 * 키페이저로 축 한 바퀴씩 자른 구간을 같은 각도끼리 평균한다:
 *   x̄(θ) = (1/M) Σ_{m=0}^{M−1} x(θ + 2πm)   (Contents §3)
 * 그 축의 회전 주파수의 정수배인 성분은 그대로 남고, 다른 주파수의 성분과 잡음은 줄어든다.
 * 여기서는 회전수가 일정하고 한 바퀴의 샘플 수가 정수라고 둔다 (회전수가 변할 때의 각도 재샘플링은 P3-5 차수추적).
 */

/**
 * 한 바퀴 samplesPerRev개씩 잘라 revolutions바퀴를 같은 각도끼리 평균한 한 바퀴 파형.
 * revolutions를 생략하면 들어 있는 온전한 바퀴를 모두 쓴다. 입력을 변경하지 않는다.
 */
export function synchronousAverage(x: ArrayLike<number>, samplesPerRev: number, revolutions?: number): Float64Array {
  if (!Number.isInteger(samplesPerRev) || samplesPerRev < 1) throw new RangeError('한 바퀴 샘플 수는 1 이상의 정수여야 한다');
  const available = Math.floor(x.length / samplesPerRev);
  const m = revolutions ?? available;
  if (!Number.isInteger(m) || m < 1) throw new RangeError('평균할 바퀴 수는 1 이상의 정수여야 한다');
  if (m > available) throw new RangeError(`샘플이 ${m}바퀴에 모자란다 (${available}바퀴 분량)`);
  const avg = new Float64Array(samplesPerRev);
  for (let r = 0; r < m; r++) {
    const start = r * samplesPerRev;
    for (let n = 0; n < samplesPerRev; n++) {
      const v = x[start + n];
      if (!Number.isFinite(v)) throw new RangeError('샘플은 유한한 수여야 한다');
      avg[n] += v;
    }
  }
  for (let n = 0; n < samplesPerRev; n++) avg[n] /= m;
  return avg;
}

/**
 * 주파수가 회전 주파수의 ratio배인 성분이 M바퀴 TSA 뒤에 남는 비율 (빗살 모양 통과 특성):
 *   |H| = |sin(π M ρ) / (M sin(π ρ))|
 * ρ가 정수면 1 (동기 성분은 그대로), 정수에서 1/M만큼 벗어나면 0 (첫 영점).
 */
export function tsaGain(ratio: number, revolutions: number): number {
  if (!Number.isFinite(ratio)) throw new RangeError('주파수비는 유한한 수여야 한다');
  if (!Number.isInteger(revolutions) || revolutions < 1) throw new RangeError('평균할 바퀴 수는 1 이상의 정수여야 한다');
  // 정수에서 벗어난 양만 쓴다 (sin(π(n + d)) = ±sin(πd)) — 큰 ρ·M에서도 정밀도를 지킨다
  const d = ratio - Math.round(ratio);
  const den = revolutions * Math.sin(Math.PI * d);
  if (Math.abs(den) < 1e-12) return 1;
  return Math.abs(Math.sin(Math.PI * revolutions * d) / den);
}

/**
 * 한 바퀴 파형에서 지정한 차수(회전 주파수의 정수배) 성분을 빼낸 나머지.
 * 기어 진단의 Residual 신호(규칙적인 맞물림 성분을 뺀 것)를 만들 때 쓴다. 길이는 2의 거듭제곱.
 * 차수 k는 FFT bin k와 N−k를 0으로 만든 뒤 되돌린다. 0차(평균)는 orders에 0을 넣으면 뺀다.
 */
export function removeOrders(rev: ArrayLike<number>, orders: readonly number[]): Float64Array {
  const n = rev.length;
  const spectrum = fft(rev);
  for (const k of orders) {
    if (!Number.isInteger(k) || k < 0 || k > n / 2) throw new RangeError(`차수는 0 ~ ${n / 2} 사이 정수여야 한다`);
    spectrum.real[k] = 0;
    spectrum.imag[k] = 0;
    if (k > 0 && k < n / 2) {
      spectrum.real[n - k] = 0;
      spectrum.imag[n - k] = 0;
    }
  }
  // 역변환: x[n] = (1/N) Re{ FFT(conj X)[n] } (실신호)
  const back = fft(spectrum.real, spectrum.imag.map((v) => -v));
  return back.real.map((v) => v / n);
}
