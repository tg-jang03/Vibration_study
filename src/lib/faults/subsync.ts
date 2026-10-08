/**
 * P7-4 "유체막·유체력 불안정 · 서브싱크로너스 감별"의 설명용 규칙 모델 (LAB-SUB-01 · 본문 그림). 순수 함수.
 *
 * 기계: 미끄럼베어링 압축기 로터, 1차 임계속도 3000 rpm(f_n = 50 Hz), 회전수 1200 ~ 7200 rpm.
 * 원인마다 1X 아래 성분이 회전수·운전조건(유온·베어링 하중·공정 부하)에 따라 어떻게 서는지를 규칙으로 둔다.
 * 규칙은 문헌의 정성적 경향(P4-4, P7-3, Bently & Hatch, Muszynska)을 숫자로 옮긴 것이고, 크기는 설명용이다 (I-009).
 *  - 유체막(오일 휠·휩): 문턱 회전수 위에서 0.45X로 따라가다(휠), 0.45 f_r이 f_n에 닿으면 f_n에 잠긴다(휩). 정방향.
 *    문턱은 베어링 하중·유온이 오르면(편심률 ↑, P4-3) 올라간다. 내릴 때는 휩이 더 낮은 회전수까지 남는다(히스테리시스).
 *  - 유체력(증기·씰 교차연성, steam whirl): 공정 부하가 문턱(80 %)을 넘으면 f_n 근처에 선다. 유온과 거의 무관. 정방향.
 *  - 러브: 임계속도의 약 2배(5700 ~ 6900 rpm)에서 정확히 ½X와 1½X, 역방향 성분이 크다 (P7-3). 유온과 무관.
 *  - 회전 풀림: 5000 rpm 위에서 ½X와 그 정수배 무리, 한 방향(선 모양). 베어링 하중이 크면 눌려서 작아진다 (P7-3).
 *  - Rotating stall: 공정 유량이 75 % 아래로 줄면 0.2X 근처(유량이 줄수록 조금 낮아짐)에 선다. 정방향, 베어링과 무관.
 *  - 구조 공진: 회전수와 무관한 38 Hz, 유동 난류에 흔들려 늘 작게 선다. 선 모양(정 = 역).
 */

export type SubCause = 'oilfilm' | 'steam' | 'rub' | 'looseness' | 'stall' | 'structural';
export const SUB_CAUSES: SubCause[] = ['oilfilm', 'steam', 'rub', 'looseness', 'stall', 'structural'];
export const SUB_LABEL: Record<SubCause, string> = {
  oilfilm: '유체막 불안정 (오일 휠·휩)',
  steam: '유체력 불안정 (증기·씰, steam whirl)',
  rub: '부분 러브',
  looseness: '회전 풀림',
  stall: 'Rotating stall',
  structural: '구조 공진 (고정 주파수)',
};

export const SUB_MACHINE = {
  /** 1차 임계속도 [rpm]과 고유진동수 [Hz] */
  criticalRpm: 3000,
  fn: 50,
  /** 유막 평균 속도비 (휠 주파수 = λ f_r) */
  lambda: 0.45,
  /** 기준 유온 [°C]·베어링 하중 [배]·공정 부하 [%] */
  base: { oilT: 50, load: 1, flow: 100 },
  rpmMin: 1200,
  rpmMax: 7200,
} as const;

export interface Conditions {
  /** 오일 공급 온도 [°C] (40 ~ 60) */
  oilT: number;
  /** 베어링 하중 (기준 1, 0.5 ~ 1.5) */
  load: number;
  /** 공정 부하·유량 [%] (50 ~ 110) */
  flow: number;
}
export const BASE_COND: Conditions = { ...SUB_MACHINE.base };

export interface SubLine {
  /** 주파수 [Hz] */
  hz: number;
  /** 정방향·역방향 원의 반지름 [µm] */
  fwd: number;
  bwd: number;
  /** 회전 주파수에 묶였는가 (정확한 분수배 → 키페이저 점이 몇 자리에 고정) */
  locked: boolean;
  /** 이름 */
  name: string;
}

export interface SubState {
  rpm: number;
  /** 1X 정방향 반지름 [µm] */
  oneX: number;
  /** 1X 아래 성분 (없으면 빈 배열) */
  lines: SubLine[];
}

const fr = (rpm: number) => rpm / 60;
const ramp = (x: number, w: number) => Math.min(1, Math.max(0, x / w));

/** 유체막 문턱 회전수: 하중·유온이 오르면 올라간다 */
export function oilOnset(c: Conditions): number {
  return 4800 * c.load ** 0.6 * (1 + 0.03 * (c.oilT - SUB_MACHINE.base.oilT));
}
/** 휩으로 잠기는 회전수 (0.45 f_r = f_n) */
export const LOCK_RPM = (60 * SUB_MACHINE.fn) / SUB_MACHINE.lambda;

/** 1X: 임계속도 3000 rpm·감쇠비 0.1의 불평형 응답 (반지름 [µm]) */
function oneX(rpm: number): number {
  const r = rpm / SUB_MACHINE.criticalRpm;
  return (20 * r * r) / Math.hypot(1 - r * r, 0.2 * r);
}

/**
 * 회전수 rpm에서의 성분. direction: 'up' = 회전수를 올리는 중(런업), 'down' = 내리는 중(코스트다운).
 * 유체막만 히스테리시스가 있다: 내릴 때는 문턱의 85 %까지 남는다.
 */
export function subState(cause: SubCause, rpm: number, c: Conditions = BASE_COND, direction: 'up' | 'down' = 'up'): SubState {
  const M = SUB_MACHINE;
  const f = fr(rpm);
  const lines: SubLine[] = [];
  switch (cause) {
    case 'oilfilm': {
      const on = oilOnset(c);
      const start = direction === 'up' ? on : 0.85 * on;
      if (rpm >= start) {
        const grow = direction === 'up' ? ramp(rpm - on, 500) : 1;
        const whip = M.lambda * f >= M.fn;
        const hz = whip ? M.fn : M.lambda * f;
        const a = (whip ? 60 : 25) * Math.max(0.25, grow);
        lines.push({ hz, fwd: a, bwd: 0.08 * a, locked: false, name: whip ? '오일 휩' : '오일 휠' });
      }
      break;
    }
    case 'steam': {
      const k = ramp(c.flow - 80, 20) * ramp(rpm - 4500, 600);
      if (k > 0) lines.push({ hz: 0.98 * M.fn, fwd: 40 * k / c.load ** 0.3, bwd: 0.1 * 40 * k / c.load ** 0.3, locked: false, name: '유체력 선회' });
      break;
    }
    case 'rub': {
      if (rpm >= 5700 && rpm <= 6900) {
        lines.push({ hz: 0.5 * f, fwd: 22, bwd: 16, locked: true, name: '½X' });
        lines.push({ hz: 1.5 * f, fwd: 5, bwd: 3, locked: true, name: '1½X' });
      }
      break;
    }
    case 'looseness': {
      const k = ramp(rpm - 5000, 600) / c.load ** 1.2;
      if (k > 0)
        for (const [q, a] of [[0.5, 18], [1.5, 9], [2, 8], [2.5, 5], [3, 4]] as const) lines.push({ hz: q * f, fwd: (a * k) / 2, bwd: (a * k) / 2, locked: true, name: `${q}X` });
      break;
    }
    case 'stall': {
      const k = ramp(75 - c.flow, 30);
      if (k > 0 && rpm >= 3000) lines.push({ hz: (0.2 - 0.002 * (75 - c.flow)) * f, fwd: 15 * k, bwd: 1.5 * k, locked: false, name: 'stall' });
      break;
    }
    case 'structural': {
      if (rpm >= 2400) {
        const a = 6 * (rpm / M.rpmMax) ** 2;
        lines.push({ hz: 38, fwd: a, bwd: a, locked: false, name: '38 Hz' });
      }
      break;
    }
  }
  return { rpm, oneX: oneX(rpm), lines };
}

/** 런업(up) 또는 코스트다운(down)의 회전수 격자 */
export function rpmSweep(step = 150): number[] {
  const out: number[] = [];
  for (let r = SUB_MACHINE.rpmMin; r <= SUB_MACHINE.rpmMax + 1e-9; r += step) out.push(r);
  return out;
}

/** 가장 큰 1X 아래 성분 (없으면 null) */
export function mainSub(s: SubState): SubLine | null {
  const sub = s.lines.filter((l) => l.hz < fr(s.rpm) * 0.99);
  return sub.length ? sub.reduce((a, b) => (b.fwd + b.bwd > a.fwd + a.bwd ? b : a)) : null;
}

/** 운전조건을 바꾼 뒤 가장 큰 1X 아래 성분의 크기 비 (기준 = 1, 사라지면 0, 처음부터 없으면 NaN) */
export function conditionResponse(cause: SubCause, rpm: number, change: Partial<Conditions>, base: Conditions = caseConditions(cause)): number {
  const a = mainSub(subState(cause, rpm, base));
  const b = mainSub(subState(cause, rpm, { ...base, ...change }));
  const amp = (l: SubLine | null) => (l ? l.fwd + l.bwd : 0);
  return amp(a) > 0 ? amp(b) / amp(a) : Number.NaN;
}

/** 런업에서 처음 나타나는 회전수와 코스트다운에서 사라지는 회전수 (격자 위) */
export function onsetOffset(cause: SubCause, c: Conditions = BASE_COND, step = 150) {
  const grid = rpmSweep(step);
  const up = grid.find((r) => mainSub(subState(cause, r, c, 'up')) !== null) ?? null;
  // 코스트다운에서 마지막까지 보이던(가장 낮은) 회전수
  const present = grid.filter((r) => mainSub(subState(cause, r, c, 'down')) !== null);
  return { onsetRpm: up, offRpm: present.length ? Math.min(...present) : null };
}

/** 오빗 (1X + 1X 아래 성분, revs바퀴, 한 바퀴 spr점) [µm]과 키페이저 점 */
export function subOrbit(s: SubState, revs = 12, spr = 72) {
  const f = fr(s.rpm);
  const x: number[] = [];
  const y: number[] = [];
  const dots: [number, number][] = [];
  const comps = [{ hz: f, fwd: s.oneX, bwd: 0, ph: 0 }, ...s.lines.map((l, i) => ({ hz: l.hz, fwd: l.fwd, bwd: l.bwd, ph: 0.7 + i }))];
  for (let i = 0; i <= revs * spr; i++) {
    const t = i / (spr * f);
    let zx = 0;
    let zy = 0;
    for (const c of comps) {
      const th = 2 * Math.PI * c.hz * t + c.ph;
      // 정방향 반지름 fwd(반시계) + 역방향 반지름 bwd(시계)
      zx += c.fwd * Math.cos(th) + c.bwd * Math.cos(th);
      zy += c.fwd * Math.sin(th) - c.bwd * Math.sin(th);
    }
    x.push(zx);
    y.push(zy);
    if (i % spr === 0) dots.push([zx, zy]);
  }
  return { x, y, dots };
}

// ── LAB-SUB-01 숨은 원인 케이스 (원인과 운전 회전수) ──
export const SUB_CASES: { cause: SubCause; rpm: number }[] = [
  { cause: 'rub', rpm: 6300 },
  { cause: 'oilfilm', rpm: 6000 },
  { cause: 'structural', rpm: 6600 },
  { cause: 'stall', rpm: 6600 },
  { cause: 'oilfilm', rpm: 7200 },
  { cause: 'looseness', rpm: 6300 },
  { cause: 'steam', rpm: 6600 },
];
/** 케이스마다 처음 보이는 운전조건 (stall·steam은 그 조건에서만 나타난다) */
export function caseConditions(cause: SubCause): Conditions {
  if (cause === 'stall') return { ...BASE_COND, flow: 60 };
  if (cause === 'steam') return { ...BASE_COND, flow: 100 };
  return BASE_COND;
}
