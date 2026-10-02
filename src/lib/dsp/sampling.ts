import { createRng } from './random';
import { evaluate, type SignalSpec } from './signal';

/**
 * 에일리어스(겉보기) 주파수: f_a = |f − k·f_s|, k = round(f / f_s)  (Contents §3)
 * 샘플링 주파수 fs로 측정한 f [Hz] 정현파가 0 ~ fs/2 사이 어디에 보이는지 돌려준다.
 */
export function aliasFrequency(f: number, fs: number): number {
  const k = Math.round(f / fs);
  return Math.abs(f - k * fs);
}

export interface AcquireOptions {
  /** 샘플링 주파수 [Hz] */
  fs: number;
  /** 샘플 수 */
  n: number;
  /** 첫 샘플 시각 [s] */
  t0?: number;
}

export interface Samples {
  fs: number;
  /** t[i] = t0 + i / fs */
  t: Float64Array;
  x: Float64Array;
}

/**
 * 샘플링: x[i] = x(t0 + i/fs) + 잡음.
 * 잡음은 샘플 번호 i 기준으로 시드에서 생성한다 (같은 시드·같은 n → 같은 잡음).
 * AAF·ADC는 아직 없다 (M1.6에서 추가).
 */
export function acquire(spec: SignalSpec, { fs, n, t0 = 0 }: AcquireOptions): Samples {
  if (!(fs > 0)) throw new RangeError('fs는 0보다 커야 한다');
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n은 0 이상의 정수여야 한다');

  const t = new Float64Array(n);
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    t[i] = t0 + i / fs;
    x[i] = evaluate(spec, t[i]);
  }
  for (const c of spec.components) {
    if (c.type !== 'noise' || c.rms === 0) continue;
    const rng = createRng(c.seed);
    for (let i = 0; i < n; i++) x[i] += c.rms * rng.normal();
  }
  return { fs, t, x };
}
