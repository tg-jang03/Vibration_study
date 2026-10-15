/**
 * 슬라이더를 마우스·손가락으로 끌 때 쓸 값 (ParamSlider).
 *
 * 칸 수가 트랙 폭(px)보다 많으면 한 픽셀에 여러 칸이 몰려, 끌어서는 3600 rpm 같은 값에 멈출 수 없다.
 * 그런 슬라이더만 끌 때 값을 step의 1·2·5·10…배 격자(한 칸이 MIN_CELL_PX 이상)의 가까운 점으로 옮긴다.
 * 격자는 0에서 센 배수라서 반올림한 값(50 rpm, 0.01 mm …)이 남는다. 키보드 화살표는 원래 step 그대로.
 * marks: 격자 밖이지만 본문·과제가 쓰는 값(예: 3570 rpm). 격자 점과 똑같이 가장 가까운 후보로 고른다.
 */

/** 이보다 촘촘하면(칸 하나 < 1 px) 끌어서 닿지 않는 값이 생긴다 → 격자로 옮긴다 */
const UNREACHABLE_PX = 1;
/** 옮길 때 격자 한 칸의 최소 폭 */
const MIN_CELL_PX = 1.5;

export interface SnapOptions {
  min: number;
  max: number;
  step: number;
  /** 손잡이가 움직이는 트랙 길이 [px] */
  trackPx: number;
  marks?: readonly number[];
}

const decimals = (x: number) => {
  const s = String(x);
  if (s.includes('e-')) return Number(s.split('e-')[1]);
  return s.includes('.') ? s.length - s.indexOf('.') - 1 : 0;
};

/** step 격자 위 값인지 (HTML range의 기준점은 min) */
const onStepGrid = (v: number, min: number, step: number) => {
  const n = (v - min) / step;
  return Math.abs(n - Math.round(n)) < 1e-6;
};

/**
 * 끌 때의 격자 간격: 한 칸이 MIN_CELL_PX 이상인 가장 작은 "둥근 수"(1·2·5 × 10ⁿ, step의 정수배).
 * 둥근 수가 step의 배수가 아니면(예: step 30) step × 2, 5, 10, 20 … 가운데에서 고른다.
 */
export function dragGrid({ min, max, step, trackPx }: SnapOptions): number {
  const span = max - min;
  if (!(span > 0) || !(step > 0) || !(trackPx > 0)) return step;
  const pxPerStep = (trackPx * step) / span;
  if (pxPerStep >= UNREACHABLE_PX) return step;
  const wide = (g: number) => (g / step) * pxPerStep >= MIN_CELL_PX;
  const isMultiple = (g: number) => Math.abs(g / step - Math.round(g / step)) < 1e-9;
  const nice = (i: number) => Number(([1, 2, 5][((i % 3) + 3) % 3] * 10 ** Math.floor(i / 3)).toPrecision(12));
  for (let i = Math.floor(3 * Math.log10(step)) - 3; nice(i) <= span; i++) {
    const g = nice(i);
    if (g > step && isMultiple(g) && wide(g)) return g;
  }
  for (let i = 1; i < 30; i++) {
    const g = Number((step * [1, 2, 5][i % 3] * 10 ** Math.floor(i / 3)).toPrecision(12));
    if (wide(g)) return g;
  }
  return step;
}

/** 브라우저가 준 값(raw)을 끌기용 값으로 */
export function snapDragValue(raw: number, opts: SnapOptions): number {
  const { min, max, step } = opts;
  const g = dragGrid(opts);
  if (g === step || raw <= min || raw >= max) return raw;
  const dec = Math.max(decimals(step), decimals(min), decimals(g));
  const clean = (v: number) => Number(v.toFixed(dec));
  const lo = Math.floor(raw / g) * g;
  let grid = [lo, lo + g].map(clean).filter((v) => v >= min && v <= max);
  // 0에서 센 배수가 step 격자(min 기준)에서 벗어나면 min에서 센 배수로
  if (!grid.every((v) => onStepGrid(v, min, step))) {
    const rel = min + Math.floor((raw - min) / g) * g;
    grid = [rel, rel + g].map(clean).filter((v) => v >= min && v <= max);
  }
  const candidates = [...(opts.marks ?? []).filter((m) => m >= min && m <= max), ...grid, min, max];
  let best = raw;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = Math.abs(c - raw);
    if (d < bestDist - 1e-12) {
      best = c;
      bestDist = d;
    }
  }
  return best;
}
