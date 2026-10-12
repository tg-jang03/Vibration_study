/**
 * 밸런싱 (P9-2, LAB-BAL-01). 순수 함수, 내부 단위 SI (불평형 kg·m, 변위 Peak m).
 *
 * 로터: P7-2의 그 로터 (`lib/faults/oneX.ts`의 ROTOR_1X) — 베어링 두 개의 대칭 강성 로터, 운전 3000 rpm,
 *   수평 방향 병진 모드 5000 rpm(ζ 0.06)·원추 모드 6400 rpm(ζ 0.05). 질량 800 kg, 베어링 간격 L 1.6 m,
 *   보정 평면은 중심에서 ±0.64 m(베어링 안쪽), 추는 반지름 200 mm에 단다.
 * 응답 (베어링 j, 평면 p, s = +1 (1쪽) / −1 (2쪽)):
 *   x_j = Σ_p [D_t + s_j s_p k_c D_c] U_p / M,  D = r²/(1 − r² + j2ζr) (P4-1),  k_c = 12 a (L/2) / L² = 2.4
 *   병진 모드는 두 평면의 합(정적 몫)에, 원추 모드는 차(커플 몫)에 반응한다 (P7-2).
 * 벡터·추의 각: 키페이저 기준, 회전 반대 방향으로 잰 각 (P3-3의 지연각과 같은 방향). 복소수로는 A e^{−jφ}.
 *   그래서 V = H·W이면 V의 각 = H의 각 + W의 각. 영향계수 H의 각에 heavy–high spot 지연(P4-1)과 센서 자리가 함께 담긴다.
 */
import { createRng } from '../dsp/random';
import { ROTOR_1X } from '../faults/oneX';

export interface Cx {
  re: number;
  im: number;
}
const cx = (re: number, im = 0): Cx => ({ re, im });
export const cadd = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
export const csub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
export const cmul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
export const cscale = (a: Cx, k: number): Cx => cx(a.re * k, a.im * k);
export const cabs = (a: Cx) => Math.hypot(a.re, a.im);
const RAD = Math.PI / 180;
const wrap360 = (d: number) => ((d % 360) + 360) % 360;
/** 크기 A, 각 φ [°] (회전 반대 방향) → A e^{−jφ} */
export const polar = (amp: number, deg: number): Cx => cx(amp * Math.cos(deg * RAD), -amp * Math.sin(deg * RAD));
/** 복소수 → 각 [°] (0 ≤ φ < 360, 회전 반대 방향) */
export const angleOf = (z: Cx) => wrap360(-Math.atan2(z.im, z.re) / RAD);

export const BAL_ROTOR = {
  mass: 800,
  L: 1.6,
  a: 0.64,
  /** 추를 다는 반지름 [m] */
  radius: 0.2,
  rpm: ROTOR_1X.opRpm,
  trans: { rpm: ROTOR_1X.trans.H, zeta: ROTOR_1X.trans.zeta },
  conic: { rpm: ROTOR_1X.conic.H, zeta: ROTOR_1X.conic.zeta },
} as const;

const R = BAL_ROTOR;
const KC = (12 * R.a * (R.L / 2)) / (R.L * R.L);
const D = (r: number, zeta: number): Cx => cdiv(cx(r * r), cx(1 - r * r, 2 * zeta * r));

/** 그램(반지름 200 mm) ↔ 불평형 [kg·m] */
export const gramsToU = (g: number) => (g / 1000) * R.radius;
/** Peak [m] → µm p-p */
export const toUmPP = (m: number) => 2e6 * m;

/** 영향계수 행렬 A[j][p] [m Peak / (kg·m)] — 베어링 j (0 = B1, 1 = B2), 평면 p */
export function influenceMatrix(rpm: number = R.rpm): Cx[][] {
  const dt = D(rpm / R.trans.rpm, R.trans.zeta);
  const dc = D(rpm / R.conic.rpm, R.conic.zeta);
  const s = [1, -1];
  return s.map((sj) => s.map((sp) => cscale(cadd(dt, cscale(dc, sj * sp * KC)), 1 / R.mass)));
}

/** 추 하나: 질량 [g]과 각 [°] */
export interface Weight {
  g: number;
  deg: number;
}
export const weightCx = (w: Weight) => polar(gramsToU(w.g), w.deg);
export const cxToWeight = (u: Cx): Weight => ({ g: (cabs(u) / R.radius) * 1000, deg: angleOf(u) });

/** 숨은 불평형 (평면 1 · 2, 반지름 200 mm의 그램으로) — 설명용 예시 */
export type CaseId = 'static' | 'couple' | 'dynamic';
export const BAL_CASES: Record<CaseId, { label: string; planes: [Weight, Weight] }> = {
  static: { label: '정적 위주 (두 평면이 같은 쪽)', planes: [{ g: 60, deg: 40 }, { g: 55, deg: 50 }] },
  couple: { label: '커플 위주 (두 평면이 반대쪽)', planes: [{ g: 60, deg: 110 }, { g: 60, deg: 290 }] },
  dynamic: { label: '동적 (둘이 섞임)', planes: [{ g: 70, deg: 200 }, { g: 30, deg: 320 }] },
};
/** slow roll 보상을 하지 않으면 섞이는 런아웃 [µm p-p ∠°] (B1, B2) */
export const RUNOUT_UMPP: [Weight, Weight] = [
  { g: 4, deg: 70 },
  { g: 3, deg: 250 },
];
const runoutCx = (j: number) => polar(RUNOUT_UMPP[j].g / 2e6, RUNOUT_UMPP[j].deg);

/** 평면 불평형(합) → 두 베어링의 실제 움직임 [m Peak 복소] */
export function response(U: [Cx, Cx], rpm: number = R.rpm): [Cx, Cx] {
  const A = influenceMatrix(rpm);
  return [0, 1].map((j) => cadd(cmul(A[j][0], U[0]), cmul(A[j][1], U[1]))) as [Cx, Cx];
}

export interface BalanceSetup {
  /** 1 = 평면 1 · 베어링 1만, 2 = 두 평면 · 두 베어링 */
  method: 1 | 2;
  caseId: CaseId;
  /** 시험추 [g]과 각 [°] (2면이면 평면 2에도 같은 추) */
  trialG: number;
  trialDeg: number;
  /** 런마다 측정 벡터의 흔들림 σ [µm p-p] (복소 정규, 실·허 각각) */
  noise: number;
  /** 보정추를 둘레의 고정 구멍 n개에 나눠 단다 (0이면 계산값 그대로) */
  holes: number;
  /** slow roll 보상 안 함 (런아웃이 측정값에 섞임) */
  runoutUncomp: boolean;
  seed?: number;
}

export interface Run {
  label: string;
  /** 평면별로 단 추 (없으면 null) */
  weights: (Weight | null)[];
  /** 센서가 읽은 값 [m Peak 복소] (B1, B2) */
  meas: [Cx, Cx];
}

export interface BalanceResult {
  runs: Run[];
  /** 1면: H = (V1 − V0)/W_t [m/(kg·m)] — 2면이면 A의 추정 2×2 */
  H: Cx | null;
  Aest: Cx[][] | null;
  /** 계산한 보정추 (평면별) */
  correction: Weight[];
  /** 실제로 단 추 (나눠 달기면 평면마다 둘) */
  installed: Weight[][];
  /** 보정 뒤 센서 값과 실제 움직임 [m Peak 복소] */
  afterMeas: [Cx, Cx];
  afterTrue: [Cx, Cx];
  /** 숨은 불평형을 정확히 지우는 추 (평면별) */
  exact: Weight[];
}

/** 고정 구멍(0°부터 360/n 간격)에 나눠 달기: 이웃한 두 구멍의 질량 */
export function splitWeight(w: Weight, n: number): Weight[] {
  const step = 360 / n;
  const a = Math.floor(wrap360(w.deg) / step) * step;
  const b = a + step;
  const th = wrap360(w.deg);
  const sinS = Math.sin(step * RAD);
  const ma = (w.g * Math.sin((b - th) * RAD)) / sinS;
  const mb = (w.g * Math.sin((th - a) * RAD)) / sinS;
  return [
    { g: ma, deg: wrap360(a) },
    { g: mb, deg: wrap360(b) },
  ].filter((x) => x.g > 1e-9);
}

/** 영향계수법 한 번: 처음 런 → 시험추 런(들) → 보정추 계산 → 보정 런 */
export function balance(s: BalanceSetup): BalanceResult {
  const rng = createRng(s.seed ?? 9201);
  const hidden = BAL_CASES[s.caseId].planes.map(weightCx) as [Cx, Cx];
  const sig = s.noise / 2e6;
  const measure = (U: [Cx, Cx]): [Cx, Cx] => {
    const x = response(U);
    return [0, 1].map((j) => {
      let v = x[j];
      if (s.runoutUncomp) v = cadd(v, runoutCx(j));
      return cadd(v, cx(sig * rng.normal(), sig * rng.normal()));
    }) as [Cx, Cx];
  };
  const trial: Weight = { g: s.trialG, deg: s.trialDeg };
  const Wt = weightCx(trial);
  const runs: Run[] = [];
  const V0 = measure(hidden);
  runs.push({ label: '처음 (런 0)', weights: [null, null], meas: V0 });
  const V1 = measure([cadd(hidden[0], Wt), hidden[1]]);
  runs.push({ label: '시험추 평면 1 (런 1)', weights: [trial, null], meas: V1 });

  let H: Cx | null = null;
  let Aest: Cx[][] | null = null;
  let corrCx: Cx[];
  if (s.method === 1) {
    H = cdiv(csub(V1[0], V0[0]), Wt);
    corrCx = [cscale(cdiv(V0[0], H), -1), cx(0)];
  } else {
    const V2 = measure([hidden[0], cadd(hidden[1], Wt)]);
    runs.push({ label: '시험추 평면 2 (런 2)', weights: [null, trial], meas: V2 });
    const a11 = cdiv(csub(V1[0], V0[0]), Wt);
    const a21 = cdiv(csub(V1[1], V0[1]), Wt);
    const a12 = cdiv(csub(V2[0], V0[0]), Wt);
    const a22 = cdiv(csub(V2[1], V0[1]), Wt);
    Aest = [
      [a11, a12],
      [a21, a22],
    ];
    // W = −A⁻¹ V0 (2×2 크래머)
    const det = csub(cmul(a11, a22), cmul(a12, a21));
    const w1 = cdiv(csub(cmul(a22, V0[0]), cmul(a12, V0[1])), det);
    const w2 = cdiv(csub(cmul(a11, V0[1]), cmul(a21, V0[0])), det);
    corrCx = [cscale(w1, -1), cscale(w2, -1)];
  }
  const correction = corrCx.map(cxToWeight);
  const installed = correction.map((w) => (w.g < 1e-9 ? [] : s.holes > 0 ? splitWeight(w, s.holes) : [w]));
  const installedCx = installed.map((ws) => ws.reduce((acc, w) => cadd(acc, weightCx(w)), cx(0)));
  const Ufinal: [Cx, Cx] = [cadd(hidden[0], installedCx[0]), cadd(hidden[1], installedCx[1])];
  const afterTrue = response(Ufinal);
  const afterMeas = measure(Ufinal);
  runs.push({ label: '보정 뒤', weights: installed.map((ws) => (ws.length ? cxToWeight(ws.reduce((acc, w) => cadd(acc, weightCx(w)), cx(0))) : null)), meas: afterMeas });
  const exact = hidden.map((u) => cxToWeight(cscale(u, -1)));
  return { runs, H, Aest, correction, installed, afterMeas, afterTrue, exact };
}

// ── 4-run법: 위상 없이 진폭만 (시험추를 0° · 120° · 240°에) ──

export interface FourRun {
  /** 시험추 효과의 크기 T [진폭 단위] */
  T: number;
  /** 처음 벡터의 각 α [°] — 시험추 0° 효과를 기준으로, 추 각과 같은 방향 */
  alpha: number;
  /** 보정추 */
  correction: Weight;
}

/**
 * 진폭 A0(처음), A1 · A2 · A3(같은 시험추를 0° · 120° · 240°에 달았을 때)으로 보정추를 구한다.
 * A_k² = A0² + T² + 2A0T cos(α − θ_k) → T² = (A1² + A2² + A3²)/3 − A0², e^{jα} ∝ Σ cos(α − θ_k) e^{jθ_k}
 */
export function fourRun(A0: number, A: [number, number, number], trialG: number): FourRun {
  const T2 = (A[0] ** 2 + A[1] ** 2 + A[2] ** 2) / 3 - A0 * A0;
  const T = Math.sqrt(Math.max(T2, 1e-30));
  const th = [0, 120, 240];
  let re = 0;
  let im = 0;
  th.forEach((t, k) => {
    const c = (A[k] ** 2 - A0 * A0 - T2) / (2 * A0 * T);
    re += c * Math.cos(t * RAD);
    im += c * Math.sin(t * RAD);
  });
  const alpha = wrap360(Math.atan2(im, re) / RAD);
  return { T, alpha, correction: { g: (trialG * A0) / T, deg: wrap360(alpha + 180) } };
}

/** 1면 로터(베어링 1)에서 4-run 진폭 측정을 흉내 낸다: 처음 + 시험추 0° · 120° · 240° [µm p-p] */
export function fourRunAmplitudes(caseId: CaseId, trialG: number): { A0: number; A: [number, number, number] } {
  const hidden = BAL_CASES[caseId].planes.map(weightCx) as [Cx, Cx];
  const amp = (U: [Cx, Cx]) => toUmPP(cabs(response(U)[0]));
  const A0 = amp(hidden);
  const A = [0, 120, 240].map((d) => amp([cadd(hidden[0], weightCx({ g: trialG, deg: d })), hidden[1]])) as [number, number, number];
  return { A0, A };
}

// ── 시험추 크기와 결과의 흔들림 (그림): 같은 측정 흔들림에서 시험추가 작으면 보정이 크게 빗나간다 ──

/**
 * 1면 정적 위주 사례에서 시험추 질량마다 M번 반복 → 보정 뒤 남은 진동(실제 움직임, B1)의 중앙값 [µm p-p].
 */
export function trialSizeStudy(trialGs: number[], { noise = 2, repeats = 200, seed = 9202, caseId = 'static' as CaseId } = {}) {
  return trialGs.map((g, i) => {
    const res: number[] = [];
    for (let m = 0; m < repeats; m++) {
      const r = balance({ method: 1, caseId, trialG: g, trialDeg: 0, noise, holes: 0, runoutUncomp: false, seed: seed + 1000 * i + m });
      res.push(toUmPP(cabs(r.afterTrue[0])));
    }
    res.sort((a, b) => a - b);
    return { g, median: res[Math.floor(repeats / 2)], p90: res[Math.floor(repeats * 0.9)] };
  });
}

// ── 밸런스 등급 (개념): 허용 비례 불평형 e_per = G/Ω ──

/** G [mm/s], 회전수 [rpm] → e_per [µm], 로터 질량 [kg] → 허용 잔류 불평형 U_per [g·mm] */
export function permissibleUnbalance(G: number, rpm: number, mass: number) {
  const omega = (2 * Math.PI * rpm) / 60;
  const ePerUm = (G / omega) * 1000;
  return { omega, ePerUm, uPerGmm: mass * ePerUm };
}
