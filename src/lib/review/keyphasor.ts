/**
 * 키페이저 채널 → 펄스 시각 → 회전수 (P11-3 · LAB-REV-01, D-052). 순수 함수, 시간 [s].
 * - 펄스: 문턱을 정한 쪽(홈이면 내려가는, 돌기면 올라가는)으로 지나는 순간. 두 샘플 사이를 선형 보간해 시각을 잡는다.
 *   한 번 지난 뒤에는 문턱 반대편으로 히스테리시스만큼 돌아가야 다음 펄스를 받는다 (잡음으로 두 번 세지 않게).
 * - 품질: 펄스 간격을 이웃 간격의 중앙값과 비교해 빠진 펄스(간격 ≈ 2배)와 남는 펄스(간격이 짧음)를 찾는다.
 * 키페이저 신호와 위상 관례는 P3-3, 펄스로 축 각도를 얻는 것은 P5-4.
 */

export interface PulseOptions {
  /** 문턱 [채널 단위]. 생략하면 (최소 + 최대) / 2 */
  threshold?: number;
  /** falling: 홈(전압이 내려가는 펄스, 기본) · rising: 돌기·TTL */
  edge?: 'falling' | 'rising';
  /** 히스테리시스: (최대 − 최소)의 몇 배 (기본 0.1) */
  hysteresis?: number;
}

export interface Pulses {
  times: Float64Array;
  threshold: number;
}

export function detectPulses(x: ArrayLike<number>, fs: number, opts: PulseOptions = {}): Pulses {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < x.length; i++) {
    lo = Math.min(lo, x[i]);
    hi = Math.max(hi, x[i]);
  }
  const thr = opts.threshold ?? (lo + hi) / 2;
  const h = (opts.hysteresis ?? 0.1) * (hi - lo);
  const falling = (opts.edge ?? 'falling') === 'falling';
  const out: number[] = [];
  // 시작할 때 이미 펄스 안에 있으면 그 펄스는 세지 않는다
  let armed = falling ? x[0] > thr + h : x[0] < thr - h;
  for (let i = 1; i < x.length; i++) {
    const a = x[i - 1];
    const b = x[i];
    if (armed) {
      const crossed = falling ? a > thr && b <= thr : a < thr && b >= thr;
      if (crossed) {
        const frac = a === b ? 0 : (a - thr) / (a - b);
        out.push((i - 1 + frac) / fs);
        armed = false;
      }
    } else if (falling ? b > thr + h : b < thr - h) armed = true;
  }
  return { times: Float64Array.from(out), threshold: thr };
}

/** 펄스 사이마다 회전수 [rpm]과 그 가운데 시각 */
export function speedFromPulses(times: ArrayLike<number>): { t: Float64Array; rpm: Float64Array } {
  const n = Math.max(0, times.length - 1);
  const t = new Float64Array(n);
  const rpm = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const dt = times[i + 1] - times[i];
    t[i] = (times[i] + times[i + 1]) / 2;
    rpm[i] = dt > 0 ? 60 / dt : 0;
  }
  return { t, rpm };
}

function localMedian(d: ArrayLike<number>, i: number, half = 4): number {
  const v: number[] = [];
  for (let j = Math.max(0, i - half); j <= Math.min(d.length - 1, i + half); j++) if (j !== i) v.push(d[j]);
  v.sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : d[i];
}

export interface PulseRepair {
  times: Float64Array;
  /** 메운 빠진 펄스 수 */
  filled: number;
  /** 지운 남는 펄스 수 */
  removed: number;
}

/**
 * 빠진 펄스를 메우고 남는 펄스를 지운다: 간격이 이웃 중앙값의 1.6배를 넘으면 그 사이에 k − 1개를 고르게 넣고(k = 반올림한 배수),
 * 0.6배보다 짧으면 뒤 펄스를 지운다. 회전수가 이웃 몇 바퀴 사이에 크게 변하지 않는다고 가정한다(기동·정지의 보통 속도).
 */
export function repairPulses(times: ArrayLike<number>): PulseRepair {
  let removed = 0;
  // 1) 남는 펄스: 앞 펄스와의 간격이 너무 짧으면 버린다
  const keep: number[] = [];
  const d0: number[] = [];
  for (let i = 1; i < times.length; i++) d0.push(times[i] - times[i - 1]);
  for (let i = 0; i < times.length; i++) {
    if (i > 0 && keep.length > 0) {
      const last = keep[keep.length - 1];
      const d = times[i] - last;
      const ref = localMedian(d0, Math.min(i - 1, d0.length - 1));
      if (d < 0.6 * ref) {
        removed++;
        // 둘 중 어느 쪽이 가짜인가: 지운 뒤 간격이 ref에 더 가까워지는 쪽을 지운다
        const next = times[i + 1];
        const before = keep.length >= 2 ? keep[keep.length - 2] : undefined;
        if (next !== undefined && before !== undefined && Math.abs(times[i] - before - ref) < Math.abs(next - last - ref)) keep[keep.length - 1] = times[i];
        continue;
      }
    }
    keep.push(times[i]);
  }
  // 2) 빠진 펄스: 간격이 너무 길면 고르게 메운다
  const d1: number[] = [];
  for (let i = 1; i < keep.length; i++) d1.push(keep[i] - keep[i - 1]);
  const out: number[] = [keep[0]];
  let filled = 0;
  for (let i = 1; i < keep.length; i++) {
    const d = keep[i] - keep[i - 1];
    const ref = localMedian(d1, i - 1);
    if (d > 1.6 * ref) {
      const k = Math.round(d / ref);
      for (let j = 1; j < k; j++) out.push(keep[i - 1] + (d * j) / k);
      filled += k - 1;
    }
    out.push(keep[i]);
  }
  return { times: Float64Array.from(out), filled, removed };
}
