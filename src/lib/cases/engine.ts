/**
 * Part 11 가상 기계 케이스 엔진 (LAB-CASE-01 · P11-1 그림, D-052). 순수 함수, 내부 단위 SI.
 *
 * 케이스 = 기계 구성 + 성분(source) 목록. 성분마다 주파수·크기·위상이 회전수·시간·전원 상태에 따라 어떻게 변하는지를 규칙으로 둔다.
 * 같은 성분 목록에서 측정 설정(센서·f_max·라인 수·AAF)에 맞춘 샘플 신호와 자료 10종(스펙트럼 … 임팩트 시험)을 만든다.
 * 그래서 어떤 자료를 골라도 같은 기계를 본다 — 자료가 있다/없다로 답이 새지 않는다.
 *
 * 관례: 1X 벡터는 [크기, 지연각 °] (키페이저 기준, 회전 반대 방향으로 커짐, P3-3). 시간 신호는 A cos(2πft − φ).
 * 케이싱 = 베어링 하우징 가속도계(H 수평·V 수직·A 축방향), 프로브 = 근접 프로브 X(수평)·Y(수직) 축 상대 변위.
 * 회전은 반시계(X 오른쪽·Y 위에서 볼 때)라, 정방향 원은 Y가 X보다 90° 늦다.
 * 크기는 모두 설명용 예시 값이다 (판정 기준 아님, I-009). 같은 케이스·같은 설정이면 같은 신호(시드 고정).
 */
import { envelopeSpectrum, ifft, spectrumOf } from '../dsp/envelope';
import { integrateSpectral } from '../dsp/filter';
import { createRng } from '../dsp/random';
import { butterworthGain } from '../dsp/sampling';
import { singleSidedSpectrum } from '../dsp/spectrum';
import { crestFactor, kurtosis, rms } from '../dsp/stats';
import { BEARING_6205, bearingFrequencies, type BearingFrequencies } from '../machine/frequencies';

export const G = 9.80665;
const TAU = 2 * Math.PI;
const RAD = Math.PI / 180;

export type Dir = 'H' | 'V' | 'A';
export type Probe = 'X' | 'Y';
export type Sensor = Dir | Probe;
export const DIRS: Dir[] = ['H', 'V', 'A'];
export const PROBES: Probe[] = ['X', 'Y'];
export const isProbe = (s: Sensor): s is Probe => s === 'X' || s === 'Y';

/** [크기, 지연각 °] — 케이싱은 mm/s rms, 프로브는 µm p-p */
export type Vec = readonly [number, number];

export interface Mode {
  fn: number;
  zeta: number;
}
export interface SupportMode extends Mode {
  /** 모드 강성 [N/m] — 임팩트 FRF의 크기 */
  k: number;
}

export interface CaseMachine {
  name: string;
  rpm: number;
  lineHz: number;
  /** induction 유도전동기 구동 · generator 2극 동기 발전기 · turbine 터빈 구동(전동기 없음) */
  drive: 'induction' | 'generator' | 'turbine';
  /** 구름베어링 볼 수 (6205 치수비), 0이면 미끄럼베어링 */
  balls: number;
  /** 근접 프로브 X·Y가 있나 */
  probes: boolean;
  /** 하우징 공진 [Hz]과 감쇠비 — 충격이 울리는 곳 */
  housingHz: number;
  housingZeta: number;
  /** 회전체 1차 모드 (코스트다운·캐스케이드·휩이 잠기는 곳) */
  rotor: Mode;
  /** 지지 구조 모드 (방향별, 정지 상태 임팩트 시험) */
  support: Record<Dir, SupportMode[]>;
  /** 전원 차단 뒤 회전수 e^(−t/τ)의 τ [s] */
  coastTau: number;
  /** 바탕 잡음: 케이싱 가속도 [g rms, 0 ~ 5 kHz 기준], 프로브 [µm rms] */
  noiseG: number;
  noiseUm: number;
  seed: number;
  /** 기계 구성표 (화면에 보이는 것) */
  table: readonly (readonly [string, string])[];
  /** 주파수 자리 표시용: 날개(베인) 수, 이 축 기어와 상대 기어의 잇수 */
  blades?: number;
  gear?: { zIn: number; zOut: number };
}

/** 구성표로 계산해 둘 수 있는 주파수 자리 (진단 지도, P7-1) */
export function frequencyMarks(m: CaseMachine): { f: number; label: string }[] {
  const fr = m.rpm / 60;
  const out = [
    { f: 0.5 * fr, label: '½X' },
    { f: fr, label: '1X' },
    { f: 2 * fr, label: '2X' },
    { f: 3 * fr, label: '3X' },
  ];
  if (m.drive !== 'turbine') out.push({ f: 2 * m.lineHz, label: '2×LF' });
  if (m.balls > 0) {
    const b = bearingFreqs(m, fr);
    out.push({ f: b.ftf, label: 'FTF' }, { f: b.bpfo, label: 'BPFO' }, { f: b.bpfi, label: 'BPFI' }, { f: b.bsf2, label: '2×BSF' });
  }
  if (m.blades) out.push({ f: m.blades * fr, label: `날개 통과 ${m.blades}X` });
  if (m.gear) out.push({ f: m.gear.zIn * fr, label: 'GMF' }, { f: (fr * m.gear.zIn) / m.gear.zOut, label: '상대 축 1X' });
  return out.sort((a, b) => a.f - b.f);
}

/** 회전수에 묶인 성분 (k × f_r): 불평형·미스얼라인·런아웃·발전기 자기력 2X 등 */
export interface SyncSource {
  kind: 'sync';
  order: number;
  /** 운전점 케이싱 속도 [mm/s rms, 지연 °] */
  casing?: Partial<Record<Dir, Vec>>;
  /** 운전점 축 상대 변위 [µm p-p, 지연 °] */
  shaft?: Partial<Record<Probe, Vec>>;
  /** 커플링 건너편 베어링: [크기 비, 위상 차 °] (없으면 [1, 0]) */
  across?: Partial<Record<Dir, Vec>>;
  /** 회전수에 따른 힘: mass ∝ Ω² (불평형), const 일정 (미스얼라인 예하중), runout 회전수와 무관한 측정 성분(프로브 궤도의 흠) */
  force: 'mass' | 'const' | 'runout';
  /** 전기 자기력 (전원·계자 차단에 사라진다) */
  electric?: boolean;
  /** 30일 전 크기 ÷ 지금 크기 (서서히 커짐), 없으면 1 */
  growth?: number;
  /** Morton형 열 벡터: 기계 벡터에 더해지는 벡터의 반지름 비·주기 [h]·지금의 각 [°] (회전 반대 방향으로 돈다) */
  thermal?: { ratio: number; periodH: number; angle: number };
}

/** 회전수와 무관한 고정 주파수 성분 (유도전동기 2×LF 등) */
export interface FixedSource {
  kind: 'fixed';
  f: number;
  casing?: Partial<Record<Dir, Vec>>;
  shaft?: Partial<Record<Probe, Vec>>;
  electric?: boolean;
  /** 차단 뒤 사라지는 시간 상수 [s] (기본 0.05) */
  decay?: number;
}

/** 유막 불안정: 문턱 위에서 ratio × f_r로 따라가다(휠), 회전체 1차 고유진동수에 닿으면 잠긴다(휩) */
export interface WhirlSource {
  kind: 'whirl';
  ratio: number;
  onsetRpm: number;
  casing?: Partial<Record<Dir, Vec>>;
  shaft?: Partial<Record<Probe, Vec>>;
}

/** 구름베어링 결함 충격 (하우징 공진이 울린다) + 속도 스펙트럼의 결함 주파수 줄 */
export interface ImpactSource {
  kind: 'impact';
  defect: 'outer' | 'inner' | 'ball' | 'cage';
  /** 충격 하나가 만드는 하우징 응답 첨두 [g] (V 기준, H 0.6배·A 0.3배) */
  g: number;
  /** 결함 주파수 줄 (1·2·3배) [mm/s rms] (V 기준) */
  lineVel: number;
  growth?: number;
}

/** 기어 맞물림: GMF·2×GMF, 결함 축 간격의 측대역, 깨진 이의 한 바퀴 한 번 충격 */
export interface GearSource {
  kind: 'gear';
  /** 이 축(입력) 잇수와 상대(출력) 잇수 */
  zIn: number;
  zOut: number;
  /** GMF 크기 [mm/s rms] */
  mesh: Partial<Record<Dir, number>>;
  /** 2×GMF ÷ GMF */
  h2: number;
  sidebands?: { shaft: 'in' | 'out'; count: number; ratio: number; decay: number };
  broken?: { shaft: 'in' | 'out'; g: number };
}

export type Source = SyncSource | FixedSource | WhirlSource | ImpactSource | GearSource;

export interface Settings {
  sensor: Sensor;
  /** 표시 최대 주파수 [Hz] (f_s = 2.56 f_max) */
  fMax: number;
  /** 라인 수 (N = 2.56 × 라인) */
  lines: number;
  aaf: boolean;
}

export const F_MAX_OPTIONS = [200, 500, 1000, 2000, 5000, 10000] as const;
export const LINE_OPTIONS = [400, 800, 1600, 3200, 6400] as const;

/** 측정 설정에서 나오는 값: f_s, N, Δf, T */
export function acquisition(s: Pick<Settings, 'fMax' | 'lines'>) {
  const fs = 2.56 * s.fMax;
  const n = Math.round(2.56 * s.lines);
  return { fs, n, df: fs / n, T: n / fs };
}

/** 측정기 AAF: 차단 1.1 f_max, 24차 (f_max까지 평탄, 1.56 f_max에서 −73 dB) */
export const aafGain = (f: number, fMax: number) => butterworthGain(f, 1.1 * fMax, 24);

// ── 복소수 (지연각 관례: c = A e^(−jφ)) ──
interface Cx {
  re: number;
  im: number;
}
const cx = (re: number, im: number): Cx => ({ re, im });
const fromVec = (a: number, lagDeg: number): Cx => cx(a * Math.cos(lagDeg * RAD), -a * Math.sin(lagDeg * RAD));
const cmul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const cadd = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
const csub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
const cabs = (a: Cx) => Math.hypot(a.re, a.im);
/** 지연각 [°] 0 ~ 360 */
const lagOf = (a: Cx) => {
  const d = (-Math.atan2(a.im, a.re) / RAD) % 360;
  return d < 0 ? d + 360 : d;
};
export const wrap360 = (d: number) => ((d % 360) + 360) % 360;

/** 1자유도 모드의 변위 응답 1/(1 − r² + j2ζr) */
function modeG(m: Mode, f: number): Cx {
  const r = f / m.fn;
  return cdiv(cx(1, 0), cx(1 - r * r, 2 * m.zeta * r));
}

/** 지지 구조 전달 (정적 컴플라이언스로 정규화한 모드 합): 0 Hz에서 1 */
function supportG(modes: readonly SupportMode[], f: number): Cx {
  if (modes.length === 0) return cx(1, 0);
  let sum = cx(0, 0);
  let st = 0;
  for (const m of modes) {
    const g = modeG(m, f);
    sum = cadd(sum, cx(g.re / m.k, g.im / m.k));
    st += 1 / m.k;
  }
  return cx(sum.re / st, sum.im / st);
}

/** 지지 구조가 방향 d에서 주파수 f의 성분을 몇 배로, 몇 도 늦게 전하나 (단단한 받침 = [1, 0°]) */
export function supportVec(m: CaseMachine, d: Dir, f: number): Vec {
  const z = supportG(m.support[d], f);
  return [cabs(z), lagOf(z)];
}

/** 성분이 보이는 센서의 전달: 케이싱 = 회전체 × 지지 × f(속도), 프로브 = 회전체 */
function transfer(m: CaseMachine, sensor: Sensor, f: number, rotorMode = true): Cx {
  const rot = rotorMode ? modeG(m.rotor, f) : cx(1, 0);
  if (isProbe(sensor)) return rot;
  const s = cmul(rot, supportG(m.support[sensor], f));
  return cx(s.re * f, s.im * f);
}

export interface Cond {
  rpm: number;
  /** 지금부터의 시간 [h] (12시간 추세), 지금 = 0 */
  tH: number;
  /** 오늘부터의 날 [일] (−30 ~ 0) */
  day: number;
  /** 전기 자기력의 크기 비: 1 = 전원·계자가 들어와 있음, 0 = 끊김 (차단 직후에는 그 사이) */
  elec: number;
}
export const nowCond = (m: CaseMachine): Cond => ({ rpm: m.rpm, tH: 0, day: 0, elec: 1 });
const at = (rpm: number, elec = 1): Cond => ({ rpm, tH: 0, day: 0, elec });

/** 성분 하나의 줄: 주파수 [Hz], 표시 단위 크기(케이싱 mm/s rms · 프로브 µm p-p), 지연 [°] */
export interface Line {
  f: number;
  amp: number;
  lag: number;
  /** 성분 목록의 번호 */
  src: number;
  label: string;
}

const growthAt = (growth: number | undefined, day: number) => (growth === undefined ? 1 : 1 + (1 - growth) * (day / 30));

function vecFor(s: { casing?: Partial<Record<Dir, Vec>>; shaft?: Partial<Record<Probe, Vec>> }, sensor: Sensor): Vec | undefined {
  return isProbe(sensor) ? s.shaft?.[sensor] : s.casing?.[sensor];
}

/** 동기 성분의 복소 벡터 (표시 단위) — 운전점 벡터 × 힘 비 × 전달 비, Morton 열 벡터, 30일 변화 */
export function syncVector(m: CaseMachine, s: SyncSource, sensor: Sensor, c: Cond): Cx {
  const v = vecFor(s, sensor);
  if (!v || v[0] === 0) return cx(0, 0);
  if (s.force === 'runout' && !isProbe(sensor)) return cx(0, 0);
  const e = s.electric ? c.elec : 1;
  if (e <= 0) return cx(0, 0);
  let z = fromVec(v[0] * e, v[1]);
  if (s.force !== 'runout') {
    const f0 = (s.order * m.rpm) / 60;
    const f = (s.order * c.rpm) / 60;
    if (f <= 0) return cx(0, 0);
    const law = s.force === 'mass' ? (f / f0) ** 2 : 1;
    // 1X·2X는 회전체를 거쳐 베어링으로 오고, 날개 통과 같은 높은 차수는 케이싱에 바로 걸린다
    const viaRotor = s.order <= 2.5;
    const ratio = cdiv(transfer(m, sensor, f, viaRotor), transfer(m, sensor, f0, viaRotor));
    z = cmul(z, cx(ratio.re * law, ratio.im * law));
  }
  if (s.thermal) {
    // 기계 벡터 V₀에 ratio·|V₀| 크기의 열 벡터가 더해져 V₀ 둘레를 돈다: V = V₀(1 + ratio·e^(−jθ(t))) — 센서마다 같은 모양
    const ang = s.thermal.angle + (360 * c.tH) / s.thermal.periodH;
    z = cmul(z, cadd(cx(1, 0), fromVec(s.thermal.ratio, ang)));
  }
  const g = growthAt(s.growth, c.day);
  return cx(z.re * g, z.im * g);
}

/** 휠·휩 성분의 주파수와 크기 비 (운전점 = 1) */
export function whirlState(m: CaseMachine, w: WhirlSource, rpm: number): { f: number; k: number; locked: boolean } {
  const fr = rpm / 60;
  const kAt = (r: number) => {
    if (r < w.onsetRpm) return 0;
    return (w.ratio * r) / 60 >= m.rotor.fn ? 1 : 0.35;
  };
  const k0 = kAt(m.rpm);
  const locked = w.ratio * fr >= m.rotor.fn;
  return { f: locked ? m.rotor.fn : w.ratio * fr, k: k0 > 0 ? kAt(rpm) / k0 : 0, locked };
}

export function bearingFreqs(m: CaseMachine, fr: number): BearingFrequencies {
  return bearingFrequencies({ ...BEARING_6205, balls: m.balls || 9 }, fr);
}
export const DEFECT_RATE: Record<ImpactSource['defect'], keyof BearingFrequencies> = { outer: 'bpfo', inner: 'bpfi', ball: 'bsf2', cage: 'ftf' };

const DIR_W: Record<Dir, number> = { H: 0.6, V: 1, A: 0.3 };

/** 조건 c에서 센서 sensor가 보는 줄 목록 (충격의 울림·잡음 제외) */
export function linesAt(m: CaseMachine, sources: readonly Source[], sensor: Sensor, c: Cond): Line[] {
  const out: Line[] = [];
  const fr = c.rpm / 60;
  const scale = (c.rpm / m.rpm) ** 2;
  sources.forEach((s, i) => {
    if (s.kind === 'sync') {
      const z = syncVector(m, s, sensor, c);
      if (cabs(z) > 0) out.push({ f: s.order * fr, amp: cabs(z), lag: lagOf(z), src: i, label: `${s.order}X` });
    } else if (s.kind === 'fixed') {
      const v = vecFor(s, sensor);
      const e = s.electric ? c.elec : 1;
      if (v && v[0] > 0 && e > 0) out.push({ f: s.f, amp: v[0] * e, lag: v[1], src: i, label: `${s.f} Hz` });
    } else if (s.kind === 'whirl') {
      const v = vecFor(s, sensor);
      const st = whirlState(m, s, c.rpm);
      if (v && v[0] > 0 && st.k > 0) out.push({ f: st.f, amp: v[0] * st.k, lag: v[1], src: i, label: st.locked ? '휩' : '휠' });
    } else if (s.kind === 'impact') {
      if (isProbe(sensor) || m.balls === 0) return;
      const b = bearingFreqs(m, fr);
      const rate = b[DEFECT_RATE[s.defect]];
      const g = growthAt(s.growth, c.day) * scale;
      [1, 0.7, 0.4].forEach((w, h) => out.push({ f: (h + 1) * rate, amp: s.lineVel * w * DIR_W[sensor] * g, lag: 30 * h, src: i, label: `${h + 1}×${DEFECT_RATE[s.defect].toUpperCase()}` }));
      if (s.defect === 'inner') {
        for (const sgn of [-1, 1]) out.push({ f: rate + sgn * fr, amp: 0.45 * s.lineVel * DIR_W[sensor] * g, lag: 60, src: i, label: 'BPFI ± 1X' });
      }
    } else if (s.kind === 'gear') {
      if (isProbe(sensor)) return;
      const a = s.mesh[sensor] ?? 0;
      if (a <= 0) return;
      const gmf = s.zIn * fr;
      const sc = (c.rpm / m.rpm) ** 1.5;
      out.push({ f: gmf, amp: a * sc, lag: 20, src: i, label: 'GMF' }, { f: 2 * gmf, amp: a * s.h2 * sc, lag: 80, src: i, label: '2×GMF' });
      if (s.sidebands) {
        const sp = s.sidebands.shaft === 'in' ? fr : (fr * s.zIn) / s.zOut;
        for (let j = 1; j <= s.sidebands.count; j++) {
          const b = a * s.sidebands.ratio * Math.exp(-(j - 1) * s.sidebands.decay) * sc;
          for (const sgn of [-1, 1]) {
            out.push({ f: gmf + sgn * j * sp, amp: b, lag: 37 * j + (sgn > 0 ? 90 : 0), src: i, label: 'GMF 측대역' });
            out.push({ f: 2 * gmf + sgn * j * sp, amp: 0.5 * b * s.h2 * 2, lag: 53 * j + (sgn > 0 ? 45 : 0), src: i, label: '2×GMF 측대역' });
          }
        }
      }
    }
  });
  return out;
}

// ── 샘플 신호 ──

/** 주파수 영역 고역 통과: fc 아래 bin은 0, fc ~ 2fc는 코사인으로 이어 붙인다 (길이 2의 거듭제곱) */
function highpassInPlace(x: Float64Array, fs: number, fc: number) {
  const n = x.length;
  const X = spectrumOf(x);
  const re = Float64Array.from(X.re);
  const im = Float64Array.from(X.im);
  for (let k = 0; k <= n / 2; k++) {
    const f = (k * fs) / n;
    const g = f <= fc ? 0 : f >= 2 * fc ? 1 : 0.5 - 0.5 * Math.cos((Math.PI * (f - fc)) / fc);
    if (g === 1) continue;
    re[k] *= g;
    im[k] *= g;
    if (k > 0 && k < n / 2) {
      re[n - k] *= g;
      im[n - k] *= g;
    }
  }
  const y = ifft(re, im);
  for (let i = 0; i < n; i++) x[i] = y.re[i];
}

export interface Acquired {
  fs: number;
  n: number;
  df: number;
  T: number;
  /** 케이싱 가속도 [m/s²] 또는 프로브 변위 [m] */
  x: Float64Array;
  lines: Line[];
}

const acqCache = new Map<string, Acquired>();

/** 측정 설정으로 지금(운전점)의 신호를 잰다. AAF가 꺼져 있으면 f_s/2 위 성분이 그대로 접힌다 */
export function acquire(caseId: string, m: CaseMachine, sources: readonly Source[], s: Settings): Acquired {
  const key = `${caseId}|${s.sensor}|${s.fMax}|${s.lines}|${s.aaf}`;
  const hit = acqCache.get(key);
  if (hit) return hit;
  const { fs, n, df, T } = acquisition(s);
  const probe = isProbe(s.sensor);
  const c = nowCond(m);
  const lines = linesAt(m, sources, s.sensor, c);
  const x = new Float64Array(n);
  const rng = createRng(m.seed + (probe ? 7 : 0) + DIRS.indexOf(s.sensor as Dir) * 13);
  // 정현 성분: 회전 점화식 cos(θ + iΔ)
  for (const ln of lines) {
    let a = probe ? (ln.amp / 2) * 1e-6 : (ln.amp / 1000) * Math.SQRT2 * TAU * ln.f; // µm p-p → m peak · mm/s rms → m/s² peak
    if (s.aaf) a *= aafGain(ln.f, s.fMax);
    if (a < 1e-15) continue;
    const d = (TAU * ln.f) / fs;
    const cd = Math.cos(d);
    const sd = Math.sin(d);
    let co = Math.cos(-ln.lag * RAD);
    let si = Math.sin(-ln.lag * RAD);
    for (let i = 0; i < n; i++) {
      x[i] += a * co;
      const nc = co * cd - si * sd;
      si = si * cd + co * sd;
      co = nc;
    }
  }
  if (!probe) {
    const dir = s.sensor as Dir;
    const fr = m.rpm / 60;
    const wn = TAU * m.housingHz;
    const zeta = m.housingZeta;
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    const ringLen = Math.min(n, Math.round((6 / (zeta * wn)) * fs));
    const ringGain = s.aaf ? aafGain(m.housingHz, s.fMax) : 1;
    const impacts = (rate: number, gPk: number, weight: (t: number) => number, jitter: number) => {
      if (!(rate > 0) || gPk <= 0 || ringGain < 1e-9) return;
      const amp = gPk * G * DIR_W[dir] * ringGain;
      for (let k = -Math.ceil(ringLen / fs * rate); k / rate < T; k++) {
        const tk = (k + jitter * rng.normal()) / rate;
        const ak = amp * Math.max(0, 1 + 0.1 * rng.normal()) * weight(tk);
        const i0 = Math.ceil(tk * fs);
        for (let i = Math.max(0, i0); i < Math.min(n, i0 + ringLen); i++) {
          const tau = i / fs - tk;
          x[i] += ak * Math.exp(-zeta * wn * tau) * Math.sin(wd * tau);
        }
      }
    };
    for (const src of sources) {
      if (src.kind === 'impact' && m.balls > 0) {
        const b = bearingFreqs(m, fr);
        const rate = b[DEFECT_RATE[src.defect]];
        const mod = src.defect === 'inner' ? (t: number) => 0.55 + 0.45 * Math.cos(TAU * fr * t) : src.defect === 'ball' ? (t: number) => 0.55 + 0.45 * Math.cos(TAU * b.ftf * t) : () => 1;
        impacts(rate, src.g, mod, 0.01);
      }
      if (src.kind === 'gear' && src.broken) {
        const rate = src.broken.shaft === 'in' ? fr : (fr * src.zIn) / src.zOut;
        impacts(rate, src.broken.g, () => 1, 0.002);
      }
    }
    // 바탕 잡음: 0 ~ 5 kHz에서 noiseG g rms가 되는 일정한 밀도
    const sigma = m.noiseG * G * Math.sqrt(fs / 2 / 5000);
    for (let i = 0; i < n; i++) x[i] += sigma * rng.normal();
    // 가속도계·입력단의 고역 통과(약 5 Hz): 충격 울림이 남기는 아주 낮은 주파수 성분이 속도로 바꿀 때 부풀지 않게
    highpassInPlace(x, fs, 5);
  } else {
    const sigma = m.noiseUm * 1e-6;
    for (let i = 0; i < n; i++) x[i] += sigma * rng.normal();
  }
  const out: Acquired = { fs, n, df, T, x, lines };
  if (acqCache.size > 60) acqCache.clear();
  acqCache.set(key, out);
  return out;
}

export type SpecUnit = 'vel' | 'acc' | 'disp';
export const UNIT_LABEL: Record<SpecUnit, string> = { vel: 'mm/s rms', acc: 'g rms', disp: 'µm p-p' };

/** 표시 스펙트럼 0 ~ f_max (Hann). 속도는 bin마다 2πf로 나눈다 (2 Hz 아래는 0) */
export function caseSpectrum(acq: Acquired, unit: SpecUnit, fMax: number) {
  const s = singleSidedSpectrum({ fs: acq.fs, x: acq.x }, { window: 'hann' });
  const kEnd = Math.min(s.frequency.length - 1, Math.floor(fMax / s.binSpacing + 1e-9));
  const freq = s.frequency.slice(0, kEnd + 1);
  const amp = new Float64Array(kEnd + 1);
  for (let k = 0; k <= kEnd; k++) {
    const a = s.amplitude[k];
    const f = freq[k];
    if (unit === 'disp') amp[k] = 2 * a * 1e6;
    else if (unit === 'acc') amp[k] = a / Math.SQRT2 / G;
    else amp[k] = f < 2 ? 0 : (a / (TAU * f) / Math.SQRT2) * 1000;
  }
  return { freq, amp };
}

/** 스펙트럼에서 f ± tol의 가장 큰 값과 그 주파수 */
export function peakNear(freq: ArrayLike<number>, amp: ArrayLike<number>, f: number, tol: number): { f: number; a: number } {
  let best = { f, a: 0 };
  for (let k = 0; k < freq.length; k++) if (Math.abs(freq[k] - f) <= tol && amp[k] > best.a) best = { f: freq[k], a: amp[k] };
  return best;
}

/** 전체값: 속도 RMS [mm/s] (2 Hz ~ f_max) 또는 가속도 RMS [g] 또는 변위 p-p [µm] */
export function overall(acq: Acquired, unit: SpecUnit, fMax: number): number {
  if (unit === 'disp') {
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of acq.x) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
    return (hi - lo) * 1e6;
  }
  const { freq, amp } = caseSpectrum(acq, unit, fMax);
  // Hann 진폭 스펙트럼의 bin 합 → ENBW 1.5로 나눠 RMS
  let s2 = 0;
  for (let k = 0; k < freq.length; k++) if (freq[k] >= 2) s2 += amp[k] * amp[k];
  return Math.sqrt(s2 / 1.5);
}

/** 시간 파형 (표시 단위): 가속도 g · 속도 mm/s · 변위 µm, 처음 tShow초 */
export function caseWaveform(acq: Acquired, unit: SpecUnit, tShow: number) {
  const y =
    unit === 'disp' ? acq.x.map((v) => v * 1e6) : unit === 'acc' ? acq.x.map((v) => v / G) : integrateSpectral(acq.x, acq.fs, 1, 2).map((v) => v * 1000);
  const nShow = Math.min(acq.n, Math.round(tShow * acq.fs));
  const t = Float64Array.from({ length: nShow }, (_, i) => (i / acq.fs) * 1000);
  const shown = y.slice(0, nShow);
  return { t, y: shown, rms: rms(y), peak: Math.max(...Array.from(y, Math.abs)), crest: crestFactor(y), kurt: kurtosis(acq.x) };
}

export const ENV_BANDS: readonly (readonly [number, number])[] = [
  [300, 900],
  [1000, 2500],
  [2500, 4500],
  [4000, 8000],
];

/** 엔벨로프 스펙트럼 [g] (케이싱 가속도만). 대역이 측정 범위 밖이면 null */
export function caseEnvelope(acq: Acquired, band: readonly [number, number], fShow: number, fMax: number, aaf: boolean) {
  const limit = aaf ? fMax : acq.fs / 2;
  if (band[1] > limit) return null;
  const e = envelopeSpectrum(spectrumOf(acq.x), acq.fs, band[0], band[1], fShow);
  return { freq: e.freq, amp: e.amp.map((a) => a / G) };
}

// ── 해석 자료 (시간 신호 없이 성분에서 바로) ──

/** 위상 표: 이 베어링 H·V·A와 커플링 건너편의 k X 벡터 [mm/s rms, °], 프로브 X·Y [µm p-p, °] */
export function phaseTable(m: CaseMachine, sources: readonly Source[], order: number) {
  const c = nowCond(m);
  const here: Record<Dir, Cx> = { H: cx(0, 0), V: cx(0, 0), A: cx(0, 0) };
  const there: Record<Dir, Cx> = { H: cx(0, 0), V: cx(0, 0), A: cx(0, 0) };
  const probe: Record<Probe, Cx> = { X: cx(0, 0), Y: cx(0, 0) };
  const f = (order * m.rpm) / 60;
  for (const s of sources) {
    if (s.kind === 'sync' && s.order === order) {
      for (const d of DIRS) {
        const z = syncVector(m, s, d, c);
        here[d] = cadd(here[d], z);
        const a = s.across?.[d] ?? [1, 0];
        there[d] = cadd(there[d], cmul(z, fromVec(a[0], a[1])));
      }
      if (m.probes) for (const p of PROBES) probe[p] = cadd(probe[p], syncVector(m, s, p, c));
    }
    // 회전수와 같은 자리의 고정 성분(2극 동기 발전기의 2×LF = 2X)은 1X·2X 필터를 그대로 지난다
    if (s.kind === 'fixed' && Math.abs(s.f - f) < 0.01) {
      for (const d of DIRS) {
        const v = s.casing?.[d];
        if (v) {
          here[d] = cadd(here[d], fromVec(v[0], v[1]));
          there[d] = cadd(there[d], fromVec(v[0] * 0.9, v[1] + 5));
        }
      }
    }
  }
  const vec = (z: Cx) => ({ amp: cabs(z), lag: cabs(z) > 1e-9 ? lagOf(z) : 0 });
  return {
    here: { H: vec(here.H), V: vec(here.V), A: vec(here.A) },
    there: { H: vec(there.H), V: vec(there.V), A: vec(there.A) },
    probe: m.probes ? { X: vec(probe.X), Y: vec(probe.Y) } : null,
  };
}

/** 코스트다운 1X: 회전수 격자마다 [크기, 지연] (전원 끈 상태 — 전기 성분 없음) */
export function coastdown(m: CaseMachine, sources: readonly Source[], sensor: Sensor, steps = 48) {
  const rpm0 = Math.round(m.rpm * 0.05);
  const rpm = Array.from({ length: steps }, (_, i) => rpm0 + ((m.rpm - rpm0) * i) / (steps - 1));
  const pts = rpm.map((r) => {
    let z = cx(0, 0);
    for (const s of sources) if (s.kind === 'sync' && s.order === 1) z = cadd(z, syncVector(m, s, sensor, at(r, 0)));
    return z;
  });
  const ref = pts[0];
  const pack = (zs: Cx[]) => zs.map((z) => ({ amp: cabs(z), lag: lagOf(z) }));
  return { rpm, raw: pack(pts), compensated: pack(pts.map((z) => csub(z, ref))), slowRoll: { rpm: rpm0, amp: cabs(ref), lag: lagOf(ref) } };
}

/** 기동 캐스케이드: 회전수마다 줄 목록을 주파수 격자에 펼친 dB 지도 */
export function cascade(m: CaseMachine, sources: readonly Source[], sensor: Sensor, fMax: number, rows = 48, cols = 300) {
  const rpm = Array.from({ length: rows }, (_, i) => m.rpm * (0.1 + (0.9 * i) / (rows - 1)));
  const freq = Float64Array.from({ length: cols }, (_, j) => ((j + 0.5) * fMax) / cols);
  const width = fMax / cols;
  const floor = isProbe(sensor) ? 0.2 : 0.01;
  const z = rpm.map((r) => {
    const row = new Float64Array(cols).fill(floor);
    for (const ln of linesAt(m, sources, sensor, at(r))) {
      if (ln.f > fMax) continue;
      // 줄 하나를 세 칸에 펼친다 (가운데 1, 양옆 0.5 — Hann 창 봉우리처럼 보이게)
      const j = Math.min(cols - 1, Math.floor(ln.f / width));
      for (const [dj, w] of [[0, 1], [-1, 0.5], [1, 0.5]] as const) {
        const jj = j + dj;
        if (jj >= 0 && jj < cols) row[jj] = Math.hypot(row[jj], w * ln.amp);
      }
    }
    return row.map((v) => 20 * Math.log10(v));
  });
  return { rpm, freq, z };
}

/** 추세: 30일(하루 한 점)과 12시간(10분 한 점)의 1X [크기, 지연]·전체값 */
export function trend(m: CaseMachine, sources: readonly Source[], sensor: Sensor) {
  const rng = createRng(m.seed + 501);
  const point = (c: Cond) => {
    let z = cx(0, 0);
    let s2 = 0;
    for (const s of sources) if (s.kind === 'sync' && s.order === 1) z = cadd(z, syncVector(m, s, sensor, c));
    for (const ln of linesAt(m, sources, sensor, c)) if (ln.f <= 1000) s2 += isProbe(sensor) ? 0 : ln.amp * ln.amp;
    // 기록의 흔들림 ±2 % · ±1.5° (지금 = 보고된 값은 흔들림 없이)
    const now = c.day === 0 && c.tH === 0;
    const e1 = rng.normal();
    const e2 = rng.normal();
    const k = now ? 1 : 1 + 0.02 * e1;
    return { amp: cabs(z) * k, lag: wrap360(lagOf(z) + (now ? 0 : 1.5 * e2)), overall: isProbe(sensor) ? cabs(z) * k : Math.sqrt(s2) * k };
  };
  const days = Array.from({ length: 31 }, (_, i) => i - 30);
  const hours = Array.from({ length: 73 }, (_, i) => -12 + i / 6);
  // 하루 한 점은 순회 점검처럼 그날그날 다른 시각에 잰 값 (몇 시간 주기의 변화는 흩어져 보인다)
  const when = createRng(m.seed + 777);
  const dayHour = days.map((d) => (d === 0 ? 0 : d * 24 + 24 * when.uniform()));
  return {
    days,
    daily: days.map((d, i) => point({ rpm: m.rpm, tH: dayHour[i], day: d, elec: 1 })),
    hours,
    hourly: hours.map((h) => point({ rpm: m.rpm, tH: h, day: 0, elec: 1 })),
  };
}

/** 전원(계자) 차단 시험: t = 0에 끊는다. 유도전동기는 회전수가 내려가고, 발전기는 회전수를 유지한 채 계자만 끊는다 */
export function tripTest(m: CaseMachine, sources: readonly Source[], sensor: Sensor) {
  if (m.drive === 'turbine') return null;
  const t = Array.from({ length: 121 }, (_, i) => -2 + i * 0.1);
  const gen = m.drive === 'generator';
  const rpmAt = (ti: number) => (gen || ti <= 0 ? m.rpm : m.rpm * Math.exp(-ti / m.coastTau));
  // 차단 뒤 전기 자기력: 유도전동기는 곧바로(0.05 s), 발전기는 계자 전류가 줄어드는 만큼(0.8 s)
  const elecAt = (ti: number) => (ti <= 0 ? 1 : Math.exp(-ti / (gen ? 0.8 : 0.05)));
  // 측정기가 보는 것은 주파수마다의 합이다: 운전점에서 큰 줄(같은 자리 ± 0.05 Hz는 한 줄로) 4개를 골라 따라간다
  const sumAt = (lines: Line[], f: number) => {
    let z = cx(0, 0);
    for (const l of lines) if (Math.abs(l.f - f) < 0.05) z = cadd(z, fromVec(l.amp, l.lag));
    return cabs(z);
  };
  const base = linesAt(m, sources, sensor, nowCond(m)).filter((l) => l.f <= 1000);
  const feats: { f0: number; order: number | null; amp: number }[] = [];
  for (const l of base) {
    if (feats.some((q) => Math.abs(q.f0 - l.f) < 0.05)) continue;
    const src = sources[l.src];
    // 회전수를 따라가는 줄(동기 성분이 하나라도 섞인 자리)은 차수로, 아니면 고정 주파수로 따라간다
    const sync = base.some((q) => Math.abs(q.f - l.f) < 0.05 && sources[q.src].kind === 'sync');
    feats.push({ f0: l.f, order: sync || src.kind === 'gear' || src.kind === 'impact' ? (l.f * 60) / m.rpm : null, amp: sumAt(base, l.f) });
  }
  const picked = feats.sort((a, b) => b.amp - a.amp).slice(0, 4);
  const series = picked.map((p) => {
    const y = t.map((ti) => {
      const r = rpmAt(ti);
      const lines = linesAt(m, sources, sensor, { rpm: r, tH: 0, day: 0, elec: elecAt(ti) });
      const fNow = p.order === null ? p.f0 : (p.order * r) / 60;
      const a = sumAt(lines, fNow);
      // 고정 자리였는데 회전수가 내려가 다른 줄이 그 자리를 지나가면 섞이지 않게: 고정 자리는 고정 성분만 더한다
      if (p.order === null) {
        let z = cx(0, 0);
        for (const l of lines) if (Math.abs(l.f - fNow) < 0.05 && sources[l.src].kind === 'fixed') z = cadd(z, fromVec(l.amp, l.lag));
        return cabs(z);
      }
      return a;
    });
    return { f0: p.f0, order: p.order, y };
  });
  return { t, rpm: t.map(rpmAt), series, kind: gen ? ('field' as const) : ('power' as const) };
}

/** 정지 상태 임팩트 시험: 방향별 가속도 FRF 크기 [(m/s²)/N] */
export function impactFrf(m: CaseMachine, fMax: number, n = 600) {
  const freq = Float64Array.from({ length: n }, (_, i) => ((i + 1) * fMax) / n);
  const frf = (d: Dir) =>
    freq.map((f) => {
      let z = cx(0, 0);
      for (const md of m.support[d]) {
        const g = modeG(md, f);
        z = cadd(z, cx(g.re / md.k, g.im / md.k));
      }
      return (TAU * f) ** 2 * cabs(z);
    });
  return { freq, H: frf('H'), V: frf('V'), A: frf('A') };
}

/** 직접·1X 필터 오빗 (프로브, 운전점, revs 바퀴) [µm]과 키페이저 점 */
export function orbit(m: CaseMachine, sources: readonly Source[], revs = 6, perRev = 120) {
  if (!m.probes) return null;
  const c = nowCond(m);
  const fr = m.rpm / 60;
  const lx = linesAt(m, sources, 'X', c);
  const ly = linesAt(m, sources, 'Y', c);
  const n = revs * perRev + 1;
  const t = Array.from({ length: n }, (_, i) => i / perRev / fr);
  const sig = (ls: Line[], only1X: boolean) =>
    t.map((ti) => ls.reduce((s, l) => (only1X && Math.abs(l.f - fr) > 1e-6 ? s : s + (l.amp / 2) * Math.cos(TAU * l.f * ti - l.lag * RAD)), 0));
  const direct = { x: sig(lx, false), y: sig(ly, false) };
  const filtered = { x: sig(lx, true), y: sig(ly, true) };
  const marks = Array.from({ length: revs + 1 }, (_, r) => r * perRev);
  return { direct, filtered, marks };
}
