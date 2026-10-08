/**
 * P7-3 "미스얼라인먼트 · 풀림 · 러브"의 설명용 비선형 로터 (LAB-NL-01 · 본문 그림). 순수 함수.
 *
 * 무차원 Jeffcott 로터 (P4-2): 시간 τ = ω_n t, 변위 단위 = 씰 간극 δ, 회전수비 Ω = 회전 각속도 ÷ ω_n.
 *   z'' + 2ζ z' + κ z = e Ω² e^{jΩτ} + f_s + f_c(z, z') + f_m(τ),   z = x + jy (x 수평 오른쪽, y 위, 축은 반시계)
 *  - e Ω² e^{jΩτ}: 불평형 (도는 힘)
 *  - f_s: 정적 힘 (중력·예하중)
 *  - f_c: 접촉 — 중심 c, 반지름 1(간극) 원 밖으로 나가면 법선 −k_c p n과 마찰 −μ k_c p t (t = 회전 방향 접선; 축 표면이
 *    회전 방향으로 미끄러지므로 마찰은 축을 회전 반대로 민다, Muszynska 2005)
 *  - f_m: 미스얼라인 — 커플링이 정해진 방향으로 미는 정적 예하중 + 1X·2X (방향이 정해진 힘, P7-2 §5)
 * 적분: 고정 간격 RK4 (한 바퀴 256걸음), 앞쪽 과도 구간을 버리고 한 바퀴 64점으로 기록한다.
 * 크기는 설명용이다 (판정 기준이 아니다, I-009). 난수를 쓰지 않으므로 같은 입력이면 같은 결과.
 */
import { fullSpectrum } from '../dsp/twoChannel';

export interface ContactRotor {
  /** 회전수비 Ω/ω_n */
  speed: number;
  zeta: number;
  /** 축 강성 (κ = 1이면 고유진동수 1) */
  kappa: number;
  /** 불평형 편심 (간극 단위) */
  e: number;
  /** 정적 힘 [x, y] (간극 단위의 힘, κ = 1이면 그만큼 처진다) */
  fs: [number, number];
  /** 접촉: 원의 중심 [x, y], 접촉 강성 k_c (0이면 접촉 없음), 마찰 계수 μ */
  contact?: { cx: number; cy: number; kc: number; mu: number; k3?: number };
  /** 미스얼라인: 커플링 힘의 방향 [°] (x에서 반시계), 정적 예하중 p, 1X·2X 크기와 위상 [°] */
  misalign?: { dirDeg: number; p: number; a1: number; a2: number; ph1: number; ph2: number };
}

export interface ContactRecord {
  rotor: ContactRotor;
  /** 한 바퀴 점 수, 바퀴 수 */
  spr: number;
  revs: number;
  /** 회전각 θ = Ωτ (기록 시작 = 0, 키페이저 = θ가 2π의 배수) */
  x: Float64Array;
  y: Float64Array;
  /** 접촉 중인 점의 비율 */
  contactFraction: number;
}

const STEPS_PER_REV = 256;
export const SPR = 64;

/** 정상상태 기록: 과도 skip바퀴를 버린 뒤 revs바퀴 */
export function simulate(r: ContactRotor, revs = 64, skip = 240): ContactRecord {
  const W = r.speed;
  const h = (2 * Math.PI) / W / STEPS_PER_REV;
  const c = r.contact;
  const m = r.misalign;
  const md = m ? [Math.cos((m.dirDeg * Math.PI) / 180), Math.sin((m.dirDeg * Math.PI) / 180)] : [0, 0];
  const f = (tau: number, s: number[], out: number[]) => {
    const [x, y, vx, vy] = s;
    const th = W * tau;
    let fx = r.e * W * W * Math.cos(th) + r.fs[0] - r.kappa * x - 2 * r.zeta * vx;
    let fy = r.e * W * W * Math.sin(th) + r.fs[1] - r.kappa * y - 2 * r.zeta * vy;
    if (c && c.kc > 0) {
      const dx = x - c.cx;
      const dy = y - c.cy;
      const d = Math.hypot(dx, dy);
      if (d > 1) {
        const p = d - 1;
        const fn = c.kc * p + (c.k3 ?? 0) * p * p * p;
        const nx = dx / d;
        const ny = dy / d;
        // 법선(안쪽으로) + 마찰(회전 반대 = 시계 방향 접선 −t, t = (−ny, nx))
        fx += -fn * nx + c.mu * fn * ny;
        fy += -fn * ny - c.mu * fn * nx;
      }
    }
    if (m) {
      const g = m.p + m.a1 * Math.cos(th + (m.ph1 * Math.PI) / 180) + m.a2 * Math.cos(2 * th + (m.ph2 * Math.PI) / 180);
      fx += g * md[0];
      fy += g * md[1];
    }
    out[0] = vx;
    out[1] = vy;
    out[2] = fx;
    out[3] = fy;
  };
  // 정적 위치에서 출발
  let s = [r.fs[0] / r.kappa, r.fs[1] / r.kappa, 0, 0];
  const k1 = [0, 0, 0, 0];
  const k2 = [0, 0, 0, 0];
  const k3 = [0, 0, 0, 0];
  const k4 = [0, 0, 0, 0];
  const tmp = [0, 0, 0, 0];
  const n = revs * SPR;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  let contactCount = 0;
  const every = STEPS_PER_REV / SPR;
  let tau = 0;
  const total = (skip + revs) * STEPS_PER_REV;
  for (let i = 0; i < total; i++) {
    if (i >= skip * STEPS_PER_REV && (i - skip * STEPS_PER_REV) % every === 0) {
      const j = (i - skip * STEPS_PER_REV) / every;
      x[j] = s[0];
      y[j] = s[1];
      if (c && c.kc > 0 && Math.hypot(s[0] - c.cx, s[1] - c.cy) > 1) contactCount++;
    }
    f(tau, s, k1);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + (h / 2) * k1[q];
    f(tau + h / 2, tmp, k2);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + (h / 2) * k2[q];
    f(tau + h / 2, tmp, k3);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + h * k3[q];
    f(tau + h, tmp, k4);
    for (let q = 0; q < 4; q++) s[q] += (h / 6) * (k1[q] + 2 * k2[q] + 2 * k3[q] + k4[q]);
    tau += h;
    if (!(Math.abs(s[0]) < 50 && Math.abs(s[1]) < 50)) throw new RangeError('적분이 발산했다 (접촉 마찰로 역방향 선회가 끝없이 커짐)');
  }
  return { rotor: r, spr: SPR, revs, x, y, contactFraction: contactCount / n };
}

export interface OrderPart {
  /** 차수 (회전 주파수의 배수) */
  order: number;
  /** 정방향·역방향 원의 반지름 (간극 단위) */
  fwd: number;
  bwd: number;
  /** 수평·수직 성분의 크기 (Peak) */
  xAmp: number;
  yAmp: number;
}

/** 정상상태 기록에서 차수 q 성분 (정수 주기 평균, q·revs가 정수가 되는 바퀴만 쓴다) */
export function orderPart(rec: ContactRecord, q: number): OrderPart {
  // q·k가 정수가 되는 가장 많은 바퀴 수 k ≤ revs
  let k = rec.revs;
  while (k > 0 && Math.abs(q * k - Math.round(q * k)) > 1e-9) k--;
  if (k === 0) throw new RangeError('정수 주기를 만들 수 없다');
  const n = k * rec.spr;
  let xr = 0;
  let xi = 0;
  let yr = 0;
  let yi = 0;
  for (let i = 0; i < n; i++) {
    const th = (2 * Math.PI * q * i) / rec.spr;
    xr += rec.x[i] * Math.cos(th);
    xi += -rec.x[i] * Math.sin(th);
    yr += rec.y[i] * Math.cos(th);
    yi += -rec.y[i] * Math.sin(th);
  }
  const s = 2 / n;
  [xr, xi, yr, yi] = [xr * s, xi * s, yr * s, yi * s];
  // z = x + jy, 정방향 = e^{+jqθ}: A_f = (X + jY)/2, A_b = (X* + jY*)/2 의 크기 (P4-2, twoChannel.forwardBackward와 같은 식)
  const fwd = Math.hypot(xr - yi, xi + yr) / 2;
  const bwd = Math.hypot(xr + yi, -xi + yr) / 2;
  return { order: q, fwd, bwd, xAmp: Math.hypot(xr, xi), yAmp: Math.hypot(yr, yi) };
}

/** 평균 위치 (Shaft centerline의 한 점) */
export function meanPosition(rec: ContactRecord): [number, number] {
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < rec.x.length; i++) {
    sx += rec.x[i];
    sy += rec.y[i];
  }
  return [sx / rec.x.length, sy / rec.y.length];
}

/** Full spectrum (차수 축, 정방향 +, 역방향 −). 정수 바퀴 기록이라 Uniform 창 */
export function fullOrderSpectrum(rec: ContactRecord) {
  const fs = fullSpectrum(rec.x, rec.y, rec.spr);
  return { order: fs.freq, amp: fs.amp };
}

// ── 원주 러브의 시작 (과도): 앞에서부터 기록하다 반지름이 stop을 넘으면 멈춘다 ──
export interface TransientRecord {
  x: number[];
  y: number[];
  /** 기록한 바퀴 수 */
  revs: number;
  /** stop을 넘어 멈췄는가 */
  stopped: boolean;
}

/** 같은 운동방정식 (미스얼라인 힘 없이)을 정지 위치에서 출발해 적분한다 */
export function simulateTransient(r: ContactRotor, maxRevs = 200, stop = 2.5, spr = SPR): TransientRecord {
  const W = r.speed;
  const h = (2 * Math.PI) / W / STEPS_PER_REV;
  const c = r.contact;
  const f = (tau: number, s: number[], out: number[]) => {
    const [x, y, vx, vy] = s;
    const th = W * tau;
    let fx = r.e * W * W * Math.cos(th) + r.fs[0] - r.kappa * x - 2 * r.zeta * vx;
    let fy = r.e * W * W * Math.sin(th) + r.fs[1] - r.kappa * y - 2 * r.zeta * vy;
    if (c && c.kc > 0) {
      const dx = x - c.cx;
      const dy = y - c.cy;
      const d = Math.hypot(dx, dy);
      if (d > 1) {
        const p = d - 1;
        const fn = c.kc * p + (c.k3 ?? 0) * p * p * p;
        fx += -fn * (dx / d) + c.mu * fn * (dy / d);
        fy += -fn * (dy / d) - c.mu * fn * (dx / d);
      }
    }
    out[0] = vx;
    out[1] = vy;
    out[2] = fx;
    out[3] = fy;
  };
  const s = [r.fs[0] / r.kappa, r.fs[1] / r.kappa, 0, 0];
  const k = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const tmp = [0, 0, 0, 0];
  const x: number[] = [];
  const y: number[] = [];
  const every = STEPS_PER_REV / spr;
  let tau = 0;
  for (let i = 0; i < maxRevs * STEPS_PER_REV; i++) {
    if (i % every === 0) {
      x.push(s[0]);
      y.push(s[1]);
      if (Math.hypot(s[0], s[1]) > stop) return { x, y, revs: i / STEPS_PER_REV, stopped: true };
    }
    f(tau, s, k[0]);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + (h / 2) * k[0][q];
    f(tau + h / 2, tmp, k[1]);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + (h / 2) * k[1][q];
    f(tau + h / 2, tmp, k[2]);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + h * k[2][q];
    f(tau + h, tmp, k[3]);
    for (let q = 0; q < 4; q++) s[q] += (h / 6) * (k[0][q] + 2 * k[1][q] + 2 * k[2][q] + k[3][q]);
    tau += h;
  }
  return { x, y, revs: maxRevs, stopped: false };
}

/** 선회 방향: 연속한 두 점이 원점 둘레를 반시계로 도는 비율 (1 = 모두 정방향, 0 = 모두 역방향) */
export function forwardFraction(x: ArrayLike<number>, y: ArrayLike<number>, from = 0): number {
  let fwd = 0;
  let n = 0;
  for (let i = Math.max(1, from); i < x.length; i++) {
    if (x[i - 1] * y[i] - y[i - 1] * x[i] > 0) fwd++;
    n++;
  }
  return n ? fwd / n : 0;
}

// ── 구조적 풀림: 받침(발) m₁이 볼트 이음(누르면 단단, 당기면 볼트만)으로 베이스 m₂에, 베이스는 기초에 ──
export interface FootOptions {
  /** 볼트가 풀렸는가 (당길 때 강성이 이음 강성의 0.5 %) */
  loose: boolean;
  /** 풀렸을 때 당김 강성 ÷ 이음 강성 (기본 0.005) */
  ktRatio?: number;
  /** 1X 힘의 크기 (받침 무게 = 1) */
  force: number;
  /** 1X 힘의 각진동수 (받침 무게·이음 60 기준의 무차원) */
  speed: number;
}
export interface FootRecord {
  spr: number;
  /** 정상상태 수직 변위 (받침·베이스) */
  foot: number[];
  base: number[];
}
/** 수직 1자유도 둘: 받침 m₁ = 1(무게 1), 무겁고 단단한 베이스 m₂ = 5 · 기초 강성 20, 이음 60 (ζ 0.05씩) */
export function footLooseness(o: FootOptions): FootRecord {
  const m1 = 1;
  const m2 = 5;
  const k2 = 20;
  const kj = 60;
  const kt = o.loose ? (o.ktRatio ?? 0.005) * kj : kj;
  const c2 = 2 * 0.05 * Math.sqrt(k2 * (m1 + m2));
  const cj = 2 * 0.05 * Math.sqrt(kj * m1);
  const g = 1;
  const W = o.speed;
  const spr = SPR;
  const steps = 512;
  const h = (2 * Math.PI) / W / steps;
  const f = (tau: number, s: number[], out: number[]) => {
    const [x1, x2, v1, v2] = s;
    const d = x1 - x2; // + = 이음이 벌어짐(당김)
    const fj = d > 0 ? kt * d : kj * d;
    const fv = cj * (v1 - v2);
    out[0] = v1;
    out[1] = v2;
    out[2] = (o.force * Math.cos(W * tau) - g - fj - fv) / m1;
    out[3] = (fj + fv - k2 * x2 - c2 * v2) / m2;
  };
  const s = [-g / k2 - g / kj, -g / k2, 0, 0];
  const k = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const tmp = [0, 0, 0, 0];
  const skip = 200;
  const revs = 32;
  const foot: number[] = [];
  const base: number[] = [];
  let tau = 0;
  for (let i = 0; i < (skip + revs) * steps; i++) {
    if (i >= skip * steps && (i - skip * steps) % (steps / spr) === 0) {
      foot.push(s[0]);
      base.push(s[1]);
    }
    f(tau, s, k[0]);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + (h / 2) * k[0][q];
    f(tau + h / 2, tmp, k[1]);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + (h / 2) * k[1][q];
    f(tau + h / 2, tmp, k[2]);
    for (let q = 0; q < 4; q++) tmp[q] = s[q] + h * k[2][q];
    f(tau + h, tmp, k[3]);
    for (let q = 0; q < 4; q++) s[q] += (h / 6) * (k[0][q] + 2 * k[1][q] + 2 * k[2][q] + k[3][q]);
    tau += h;
  }
  return { spr, foot, base };
}

/** 한 바퀴 spr점 신호에서 q차 성분 (Peak, 지연각 [°]) — 정수 바퀴 평균 */
export function harmonicOf(sig: ArrayLike<number>, spr: number, q: number) {
  let re = 0;
  let im = 0;
  for (let i = 0; i < sig.length; i++) {
    const th = (2 * Math.PI * q * i) / spr;
    re += sig[i] * Math.cos(th);
    im -= sig[i] * Math.sin(th);
  }
  return { amp: (2 * Math.hypot(re, im)) / sig.length, lagDeg: ((((Math.atan2(-im, re) * 180) / Math.PI) % 360) + 360) % 360 };
}

// ── Newkirk: 러브 마찰열로 생긴 휨이 1X 벡터를 천천히 돌린다 ──
export interface NewkirkOptions {
  /** 응답 배율의 크기와 지연각 [°] (공진 아래 < 90°, 위 > 90°) */
  gain: number;
  lagDeg: number;
  /** 접촉이 시작되는 1X 진폭 */
  touch: number;
  /** 1분마다 데워지는 정도, 식는 시간 [분] */
  heat: number;
  cool: number;
  minutes: number;
}
/** 1분마다의 1X 벡터. 불평형 1 ∠0°에 마찰열 휨 B가 더해지고 V = H(1 + B) */
export function newkirk(o: NewkirkOptions) {
  const lag = (o.lagDeg * Math.PI) / 180;
  const Hr = o.gain * Math.cos(lag);
  const Hi = -o.gain * Math.sin(lag);
  let br = 0;
  let bi = 0;
  const out: { minute: number; amp: number; lagDeg: number }[] = [];
  for (let t = 0; t <= o.minutes; t++) {
    const ur = 1 + br;
    const ui = bi;
    const vr = Hr * ur - Hi * ui;
    const vi = Hr * ui + Hi * ur;
    const a = Math.hypot(vr, vi);
    out.push({ minute: t, amp: a, lagDeg: ((((Math.atan2(-vi, vr) * 180) / Math.PI) % 360) + 360) % 360 });
    // 닿으면 high spot(지금 진동 벡터 쪽)이 데워져 그쪽으로 휜다. 휨은 식는 시간으로 줄어든다
    const rub = Math.max(0, a - o.touch);
    br += o.heat * rub * (vr / a) - br / o.cool;
    bi += o.heat * rub * (vi / a) - bi / o.cool;
  }
  return out;
}

// ── 커플링 양쪽 축방향 (설명용): 각 미스얼라인은 휜 커플링이 두 축을 반대 방향으로 민다 ──
export function couplingAxial(kind: 'misalign' | 'unbalance', revs = 2, spr = SPR) {
  const motor: number[] = [];
  const pump: number[] = [];
  for (let i = 0; i < spr * revs; i++) {
    const th = (2 * Math.PI * i) / spr;
    if (kind === 'misalign') {
      const a = Math.cos(th - 0.5) + 0.7 * Math.cos(2 * th - 1.2);
      motor.push(a);
      pump.push(-0.85 * a);
    } else {
      motor.push(0.15 * Math.cos(th - 0.4));
      pump.push(0.13 * Math.cos(th - 0.55));
    }
  }
  return { spr, motor, pump };
}

// ── LAB-NL-01 · 본문 그림이 쓰는 상태 ──
export type NlKind = 'normal' | 'misalign' | 'looseRot' | 'rub';
export const NL_KINDS: NlKind[] = ['normal', 'misalign', 'looseRot', 'rub'];
export const NL_LABEL: Record<NlKind, string> = {
  normal: '정상 (불평형만)',
  misalign: '미스얼라인먼트',
  looseRot: '회전 풀림 (베어링 간극 과다)',
  rub: '부분 러브 (씰 접촉)',
};
/**
 * 상태 → 로터. 정도 s = 0 ~ 1.
 *  - 정상·미스얼라인·러브: 축 강성 1, 중력으로 간극의 0.7만큼 아래로 처짐, 씰 간극 1 (러브만 닿는다), 불평형 0.1 + 0.12 s
 *  - 미스얼라인: 커플링이 위·오른쪽(60°)으로 미는 예하중 0.6 s와 1X 0.1 s · 2X 0.7 s (방향이 정해진 힘)
 *  - 회전 풀림: 간극 안에서는 약한 강성 0.3, 중력 1.2로 바닥에 얹힘, 베어링 벽(간극 1) 접촉 강성 40, 마찰 없음, 불평형 0.6 + 0.4 s
 *  - 러브: 씰 접촉 강성 40, 마찰 0.05
 */
export function nlRotor(kind: NlKind, severity: number, speed: number): ContactRotor {
  const s = Math.min(1, Math.max(0, severity));
  if (kind === 'looseRot') return { speed, zeta: 0.05, kappa: 0.3, e: 0.6 + 0.4 * s, fs: [0, -1.2], contact: { cx: 0, cy: 0, kc: 40, mu: 0 } };
  const base: ContactRotor = { speed, zeta: 0.05, kappa: 1, e: 0.1 + 0.12 * s, fs: [0, -0.7] };
  if (kind === 'rub') return { ...base, contact: { cx: 0, cy: 0, kc: 40, mu: 0.05 } };
  if (kind === 'misalign') return { ...base, e: 0.1, misalign: { dirDeg: 60, p: 0.6 * s, a1: 0.1 * s, a2: 0.7 * s, ph1: 20, ph2: 70 } };
  return { ...base, e: 0.1 };
}
