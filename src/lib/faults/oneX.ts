/**
 * P7-2 "1X 계열"의 설명용 로터 (LAB-1X-01 · 본문 그림). 순수 함수, SI (변위 Peak [m], 위상 지연각 [rad]).
 *
 * 기계: 베어링 두 개(B1 구동 쪽 · B2 반대쪽)로 받친 대칭 강성 로터, 운전 3000 rpm (50 Hz 2극 전동기 직결).
 *   근접 센서는 베어링마다 수평 H와 수직 V (축은 반시계로 돌고, V는 H에서 회전 방향으로 90° 앞에 있다).
 *   1X 벡터 = A e^{−jφ} (φ = 키페이저에서 다음 양의 봉우리까지의 지연각, Contents §3, P3-3).
 * 모드 (지지 강성이 수평 < 수직이라 방향마다 따로): 병진 모드 5000 / 5600 rpm (ζ 0.06), 원추 모드 6400 / 7200 rpm (ζ 0.05).
 *   모드 형상 [B1, B2]: 병진 [1, 1], 원추 [1, −1]. 운전 회전수는 두 모드 모두 아래 (강성 로터).
 * 정방향으로 도는 성분은 V가 H보다 90° 늦다. 방향이 정해진 힘(벨트)은 H만 민다.
 * 원인 (정도 s = 0 ~ 1, 크기는 설명용 — 판정 기준이 아니다, I-009):
 *  - 정적 불평형: 병진 모드만, e r²/(1 − r² + j2ζr) (P4-1)     - 커플 불평형: 원추 모드만     - 동적 불평형: 둘 다
 *  - 휨(bow): 병진 모드 모양으로 휜 축, b/(1 − r² + j2ζr) — 저속에서 b, 회전수가 오르면 증폭 (Nicholas 등 1976)
 *  - 런아웃: 센서마다 회전수와 무관한 벡터 (가짜 1X, P3-2)
 *  - 크랙: 1X는 bow처럼 c₁/(1 − r² + j2ζr), 2X는 c₂/(1 − (2r)² + j2ζ·2r) — 임계속도의 절반에서 2X 봉우리
 *  - 방향성 힘(편심 풀리·벨트): 수평으로만 미는 1X 힘, 크기가 회전수와 무관 → F/(1 − r² + j2ζr) (V는 같은 위상의 30 % 연성)
 *  - 구조 공진: B1 받침대의 수평 고유진동수 2850 rpm (ζ 0.035) — B1 H 응답에 받침대 증폭을 곱한다 (불평형은 작게)
 * 건전한 로터에도 작은 불평형(정적 2 µm·커플 1 µm)과 런아웃(1 µm)이 있다.
 */

export type Sensor = 'B1H' | 'B1V' | 'B2H' | 'B2V';
export const SENSORS: Sensor[] = ['B1H', 'B1V', 'B2H', 'B2V'];
export const SENSOR_LABEL: Record<Sensor, string> = { B1H: '베어링 1 수평', B1V: '베어링 1 수직', B2H: '베어링 2 수평', B2V: '베어링 2 수직' };

export type OneXCause = 'static' | 'couple' | 'dynamic' | 'bow' | 'runout' | 'crack' | 'directional' | 'resonance';
export const ONEX_CAUSES: OneXCause[] = ['static', 'couple', 'dynamic', 'bow', 'runout', 'crack', 'directional', 'resonance'];
export const CAUSE_LABEL: Record<OneXCause, string> = {
  static: '정적 불평형',
  couple: '커플 불평형',
  dynamic: '동적 불평형 (정적 + 커플)',
  bow: '휨 (bow)',
  runout: '런아웃 (가짜 1X)',
  crack: '크랙',
  directional: '방향이 정해진 1X 힘 (편심 풀리·벨트)',
  resonance: '구조 공진 (받침대)',
};

const UM = 1e-6;
const RAD = Math.PI / 180;

export const ROTOR_1X = {
  opRpm: 3000,
  slowRollRpm: 300,
  /** 병진·원추 모드의 고유 회전수 [rpm] (H, V)과 감쇠비 */
  trans: { H: 5000, V: 5600, zeta: 0.06 },
  conic: { H: 6400, V: 7200, zeta: 0.05 },
  /** B1 받침대 수평 고유진동수 [rpm]과 감쇠비 (구조 공진 원인에서만) */
  pedestal: { rpm: 2850, zeta: 0.035 },
  /** 건전한 로터의 작은 불평형 [m]과 각 [°], 런아웃 [m] (B1·B2 트랙의 각) */
  base: { staticE: 2 * UM, staticDeg: 30, coupleE: 1 * UM, coupleDeg: 200, runout: 1 * UM, runoutDeg: { B1: 50, B2: 290 } },
  /** 정도 1일 때의 크기 [m]와 각 [°] */
  full: {
    staticE: 50 * UM, staticDeg: 60,
    coupleE: 50 * UM, coupleDeg: 150,
    dynamicE: 35 * UM,
    bow: 25 * UM, bowDeg: 120,
    runout: 25 * UM, runoutDeg: { B1: 40, B2: 250 },
    crack1: 10 * UM, crack1Deg: 300, crack2: 2 * UM, crack2Deg: 20,
    force: 25 * UM, forceDeg: 80, forceCross: 0.3,
    resonanceE: 12 * UM,
  },
} as const;

export interface OneXOptions {
  cause: OneXCause | 'healthy';
  /** 정도 0 ~ 1 */
  severity: number;
}
export const DEFAULT_1X: OneXOptions = { cause: 'static', severity: 0.6 };

interface C { re: number; im: number }
const c = (re: number, im = 0): C => ({ re, im });
const add = (a: C, b: C): C => c(a.re + b.re, a.im + b.im);
const mul = (a: C, b: C): C => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const scale = (a: C, k: number): C => c(a.re * k, a.im * k);
const div = (a: C, b: C): C => {
  const d = b.re * b.re + b.im * b.im;
  return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
/** 크기 A, 지연각 φ [°]의 벡터 A e^{−jφ} */
const vec = (amp: number, lagDeg: number): C => c(amp * Math.cos(lagDeg * RAD), -amp * Math.sin(lagDeg * RAD));
/** 1자유도 동적 배율 1/(1 − r² + j2ζr) */
const dyn = (r: number, zeta: number): C => div(c(1), c(1 - r * r, 2 * zeta * r));

export interface Vector1X {
  /** 진폭 Peak [m] */
  amp: number;
  /** 지연각 [°], 0 ≤ φ < 360 */
  lagDeg: number;
  re: number;
  im: number;
}
const wrap360 = (d: number) => ((d % 360) + 360) % 360;
const toVector = (z: C): Vector1X => ({ amp: Math.hypot(z.re, z.im), lagDeg: wrap360(Math.atan2(-z.im, z.re) / RAD), re: z.re, im: z.im });
/** 두 지연각의 차 b − a를 (−180°, 180°]로 */
export const lagDiff = (a: number, b: number) => {
  const d = wrap360(b - a);
  return d > 180 ? d - 360 : d;
};

interface Parts {
  staticU: C;
  coupleU: C;
  bow: C;
  runout: Record<'B1' | 'B2', C>;
  crack1: C;
  crack2: C;
  force: C;
  pedestal: boolean;
}

function parts(o: OneXOptions): Parts {
  const R = ROTOR_1X;
  const s = Math.min(1, Math.max(0, o.severity));
  const F = R.full;
  const B = R.base;
  let staticU = vec(B.staticE, B.staticDeg);
  let coupleU = vec(B.coupleE, B.coupleDeg);
  let bow = c(0);
  const runout = { B1: vec(B.runout, B.runoutDeg.B1), B2: vec(B.runout, B.runoutDeg.B2) };
  let crack1 = c(0);
  let crack2 = c(0);
  let force = c(0);
  let pedestal = false;
  switch (o.cause) {
    case 'static':
      staticU = add(staticU, vec(F.staticE * s, F.staticDeg));
      break;
    case 'couple':
      coupleU = add(coupleU, vec(F.coupleE * s, F.coupleDeg));
      break;
    case 'dynamic':
      staticU = add(staticU, vec(F.dynamicE * s, F.staticDeg));
      coupleU = add(coupleU, vec(F.dynamicE * s, F.coupleDeg));
      break;
    case 'bow':
      bow = vec(F.bow * s, F.bowDeg);
      break;
    case 'runout':
      runout.B1 = add(runout.B1, vec(F.runout * s, F.runoutDeg.B1));
      runout.B2 = add(runout.B2, vec(0.7 * F.runout * s, F.runoutDeg.B2));
      break;
    case 'crack':
      crack1 = vec(F.crack1 * s, F.crack1Deg);
      crack2 = vec(F.crack2 * s, F.crack2Deg);
      break;
    case 'directional':
      force = vec(F.force * s, F.forceDeg);
      break;
    case 'resonance':
      staticU = add(staticU, vec(F.resonanceE * s, F.staticDeg));
      pedestal = true;
      break;
  }
  return { staticU, coupleU, bow, runout, crack1, crack2, force, pedestal };
}

/** 센서 하나의 n차 성분 (n = 1 또는 2) 복소 벡터 [m] */
function component(p: Parts, sensor: Sensor, rpm: number, order: 1 | 2): C {
  const R = ROTOR_1X;
  const dir = sensor.endsWith('H') ? 'H' : 'V';
  const bearing = sensor.startsWith('B1') ? 'B1' : 'B2';
  const sign = bearing === 'B1' ? 1 : -1;
  const rt = rpm / R.trans[dir];
  const rc = rpm / R.conic[dir];
  // 정방향으로 도는 성분: V는 H보다 90°(n차 위상으로 90°) 늦다
  const lagV = dir === 'V' ? vec(1, 90) : c(1);
  let z = c(0);
  if (order === 1) {
    const dt = dyn(rt, R.trans.zeta);
    const dc = dyn(rc, R.conic.zeta);
    z = add(z, mul(scale(p.staticU, rt * rt), dt));
    z = add(z, scale(mul(scale(p.coupleU, rc * rc), dc), sign));
    z = add(z, mul(add(p.bow, p.crack1), dt));
    z = mul(z, lagV);
    // 방향성 힘: H만 민다 (V는 같은 위상의 작은 연성 — 선 모양 오빗)
    z = add(z, scale(mul(p.force, dt), dir === 'H' ? 1 : R.full.forceCross));
  } else {
    z = mul(mul(p.crack2, dyn(2 * rt, R.trans.zeta)), lagV);
  }
  // 받침대 공진은 실제 움직임만 키운다 (런아웃은 센서가 읽는 가짜 1X라 그대로)
  if (p.pedestal && sensor === 'B1H') z = mul(z, dyn((order * rpm) / R.pedestal.rpm, R.pedestal.zeta));
  if (order === 1) z = add(z, mul(p.runout[bearing], lagV));
  return z;
}

/**
 * 원판 두 개의 불평형 (움직이는 그림용, D-044): 원판 1(B1 쪽) = 정적 + 커플, 원판 2(B2 쪽) = 정적 − 커플 [m, 지연각 °].
 * 정적이면 두 원판의 각이 같고, 커플이면 180° 반대다.
 */
export function diskUnbalance(o: OneXOptions): [Vector1X, Vector1X] {
  const p = parts(o);
  return [toVector(add(p.staticU, p.coupleU)), toVector(add(p.staticU, scale(p.coupleU, -1)))];
}

/** 센서 하나, 회전수 rpm에서 n차 벡터 */
export function vectorAt(o: OneXOptions, sensor: Sensor, rpm: number, order: 1 | 2 = 1): Vector1X {
  return toVector(component(parts(o), sensor, rpm, order));
}

export interface SweepPoint extends Vector1X {
  rpm: number;
}

/** 코스트다운 Bode 데이터 (0 ~ 운전 회전수, step rpm 간격). compensate면 slow roll 벡터를 복소수로 뺀다 (P3-3) */
export function sweep(o: OneXOptions, sensor: Sensor, order: 1 | 2 = 1, step = 25, compensate = false): SweepPoint[] {
  const p = parts(o);
  const ref = compensate ? component(p, sensor, ROTOR_1X.slowRollRpm, order) : c(0);
  const out: SweepPoint[] = [];
  for (let rpm = step; rpm <= ROTOR_1X.opRpm + 1e-9; rpm += step) {
    const z = component(p, sensor, rpm, order);
    out.push({ rpm, ...toVector(c(z.re - ref.re, z.im - ref.im)) });
  }
  return out;
}

/** 운전 회전수에서 한 베어링의 1X 오빗 (H = x, V = y) [m] */
export function orbit1X(o: OneXOptions, bearing: 'B1' | 'B2', rpm = ROTOR_1X.opRpm, n = 121) {
  const h = vectorAt(o, `${bearing}H` as Sensor, rpm);
  const v = vectorAt(o, `${bearing}V` as Sensor, rpm);
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const th = (2 * Math.PI * i) / (n - 1);
    x.push(h.amp * Math.cos(th - h.lagDeg * RAD));
    y.push(v.amp * Math.cos(th - v.lagDeg * RAD));
  }
  return { x, y };
}

export interface OneXReadouts {
  /** 운전 회전수의 1X (센서별) */
  op: Record<Sensor, Vector1X>;
  /** slow roll (300 rpm) 1X (센서별) */
  slowRoll: Record<Sensor, Vector1X>;
  /** B1 H: 운전 회전수 ÷ 그 절반에서의 1X 진폭 */
  ratioHalfSpeed: number;
  /** B1: V 지연 − H 지연 [°] (정방향 원·타원이면 약 +90°) */
  hvPhase: number;
  /** B1 H ÷ B1 V 진폭 */
  hvRatio: number;
  /** 수평: B2 지연 − B1 지연 [°] (동상 0°, 역상 180°) */
  b12Phase: number;
  /** B1 H: slow roll 보상 뒤 운전 회전수의 1X [m] */
  compensated: number;
  /** B1 H 2X: 운전 회전수의 값과 코스트다운 중 가장 큰 값·그 회전수 */
  twoXop: number;
  twoXmax: number;
  twoXmaxRpm: number;
  /** B1 H 1X: 코스트다운 중 가장 큰 값·그 회전수 */
  oneXmax: number;
  oneXmaxRpm: number;
}

export function oneXReadouts(o: OneXOptions): OneXReadouts {
  const R = ROTOR_1X;
  const rec = (rpm: number) => Object.fromEntries(SENSORS.map((s) => [s, vectorAt(o, s, rpm)])) as Record<Sensor, Vector1X>;
  const op = rec(R.opRpm);
  const slowRoll = rec(R.slowRollRpm);
  const two = sweep(o, 'B1H', 2);
  const one = sweep(o, 'B1H', 1);
  const t2 = two.reduce((a, b) => (b.amp > a.amp ? b : a));
  const t1 = one.reduce((a, b) => (b.amp > a.amp ? b : a));
  const comp = sweep(o, 'B1H', 1, 25, true);
  return {
    op,
    slowRoll,
    ratioHalfSpeed: op.B1H.amp / vectorAt(o, 'B1H', R.opRpm / 2).amp,
    hvPhase: lagDiff(op.B1H.lagDeg, op.B1V.lagDeg),
    hvRatio: op.B1H.amp / op.B1V.amp,
    b12Phase: lagDiff(op.B1H.lagDeg, op.B2H.lagDeg),
    compensated: comp[comp.length - 1].amp,
    twoXop: vectorAt(o, 'B1H', R.opRpm, 2).amp,
    twoXmax: t2.amp,
    twoXmaxRpm: t2.rpm,
    oneXmax: t1.amp,
    oneXmaxRpm: t1.rpm,
  };
}

/** 크랙이 자라는 동안의 추세: 개월 m마다 정도 (m/12)^1.5, 운전 회전수의 B1 H 1X·2X와 slow roll 1X */
export function crackTrend(months = 12) {
  return Array.from({ length: months + 1 }, (_, m) => {
    const o: OneXOptions = { cause: 'crack', severity: (m / months) ** 1.5 };
    return { month: m, oneX: vectorAt(o, 'B1H', ROTOR_1X.opRpm), twoX: vectorAt(o, 'B1H', ROTOR_1X.opRpm, 2), slowRoll: vectorAt(o, 'B1H', ROTOR_1X.slowRollRpm) };
  });
}

// ── 숨은 원인 맞히기 (LAB-1X-01) ──
export const QUIZ_CASES: OneXCause[] = ['bow', 'static', 'resonance', 'runout', 'directional', 'crack', 'couple'];
