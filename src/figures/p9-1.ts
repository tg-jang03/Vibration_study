/**
 * P9-1 "구조 공진 판별과 임팩트 시험" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 계산은 랩(LAB-HPB-01)과 같은 `lib/fieldwork/impact.ts`로 한다 — 같은 설정이면 그림 숫자 = 랩 읽음값.
 */
import { squareYRange, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import {
  bumpAverage,
  expAddedZeta,
  forceBandwidth10dB,
  FS,
  halfPower,
  halfSineFT,
  impactTest,
  IMPULSE,
  MODE_BANDS,
  PEDESTAL,
  PRETRIGGER,
  runningSpectrum,
  synthRecord,
  TIPS,
  accelerance,
  type ImpactSetup,
  type TipId,
} from '../lib/fieldwork/impact';

const fmt = formatNumber;
const db = (v: number) => 20 * Math.log10(Math.max(v, 1e-12));
const range = (a: number, b: number, step: number) => Array.from({ length: Math.round((b - a) / step) + 1 }, (_, i) => a + i * step);
const BUMP_SEED = 9113;

/** 랩 기본 설정 (플라스틱 · 1 s · 지수 끔 · Force 켬 · 평균 5 · 더블 히트 끔) */
export const LAB_DEFAULT: ImpactSetup = { tip: 'plastic', T: 1, expTau: null, forceWindow: true, averages: 5, doubleHit: false };
const run = (patch: Partial<ImpactSetup>) => impactTest({ ...LAB_DEFAULT, ...patch });
const hp = (r: ReturnType<typeof impactTest>, mode: 0 | 1 | 2) => halfPower(r.freqs, r.mag, MODE_BANDS[mode][0], MODE_BANDS[mode][1])!;
/** 봉우리 bin의 코히어런스 */
const cohAt = (r: ReturnType<typeof impactTest>, f: number) => r.coh[Math.round(f / r.df)];

const DEF = run({});
const EXP = run({ expTau: 0.1 });
const LONG = run({ T: 4 });
const SHORT = run({ T: 0.25 });
const DBL = run({ doubleHit: true });
const RUB = run({ tip: 'rubber' });
const NOFW4 = run({ forceWindow: false, T: 4 });
const trueMag = (f: number) => Math.hypot(...accelerance(PEDESTAL, f));

const SPEEDS = [2400, 2850, 3000] as const;
const RUNS = SPEEDS.map((rpm) => runningSpectrum(rpm));
const BUMP = bumpAverage({ seed: BUMP_SEED });

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p9-1.test.ts`) */
export const P91_VALUES = {
  runOneX: RUNS.map((r) => r.oneX),
  /** 47.5 Hz 둔덕 ÷ 20 Hz 바닥 [dB] */
  humpDb: db(RUNS[0].amp[190] / RUNS[0].amp[80]),
  peakForce: Object.fromEntries((Object.keys(TIPS) as TipId[]).map((id) => [id, (Math.PI * IMPULSE) / (2 * TIPS[id].tc)])) as Record<TipId, number>,
  bw10: Object.fromEntries((Object.keys(TIPS) as TipId[]).map((id) => [id, forceBandwidth10dB(TIPS[id].tc)])) as Record<TipId, number>,
  rubberAt: PEDESTAL.map((m) => db(Math.hypot(...halfSineFT(m.f, TIPS.rubber.tc)) / IMPULSE)),
  /** 기본 설정 1·2·3차 Half-power */
  def: [hp(DEF, 0), hp(DEF, 1), hp(DEF, 2)],
  exp2: hp(EXP, 1),
  exp2Added: expAddedZeta(0.1, hp(EXP, 1).fPeak),
  long1: hp(LONG, 0),
  short1: hp(SHORT, 0),
  long2: hp(LONG, 1),
  dbl: [hp(DBL, 0), hp(DBL, 1), hp(DBL, 2)],
  dblCoh: [cohAt(DBL, hp(DBL, 0).fPeak), cohAt(DBL, hp(DBL, 1).fPeak), cohAt(DBL, hp(DBL, 2).fPeak)],
  defCoh: [cohAt(DEF, hp(DEF, 0).fPeak), cohAt(DEF, hp(DEF, 1).fPeak), cohAt(DEF, hp(DEF, 2).fPeak)],
  rub3: hp(RUB, 2),
  rubCoh3: cohAt(RUB, hp(RUB, 2).fPeak),
  noFw4: hp(NOFW4, 0),
  trueAt: PEDESTAL.map((m) => trueMag(m.f)),
  bump: { single: BUMP.oneXSingle, avg: BUMP.oneXAvg },
  /** 끝(1 s)에서 남은 2차 울림 비율 e^(−ζωT) */
  ring2At1s: Math.exp(-PEDESTAL[1].zeta * 2 * Math.PI * PEDESTAL[1].f * 1),
};
const V = P91_VALUES;

// ── 그림 1: 회전수를 바꾸면 — 1X는 따라가고 둔덕은 머문다 ──
export const runningFig: FigureSpec = {
  id: 'fig-p9-1-1',
  caption: `그림 1. P7-2 그림 7의 받침대(수평 고유진동수 ${PEDESTAL[0].f} Hz)를 회전수 ${SPEEDS.join(' → ')} rpm에서 잰 속도 스펙트럼(dB, 1 mm/s = 0 dB). 1X(점)는 ${SPEEDS.map((s) => s / 60).join(' → ')} Hz로 회전수를 따라 움직이지만, 바닥의 둔덕은 세 번 모두 ${PEDESTAL[0].f} Hz에 머문다(20 Hz 바닥보다 약 ${fmt(V.humpDb, 2)} dB 높다). 흐름·마찰 같은 넓은 대역의 힘이 고유진동수 자리만 키우기 때문이다. 1X가 둔덕 자리에 오는 2850 rpm에서 1X가 ${fmt(V.runOneX[1], 3)} mm/s로 가장 크다(2400 rpm ${fmt(V.runOneX[0], 2)}, 3000 rpm ${fmt(V.runOneX[2], 3)}).`,
  panels: RUNS.map((r, i) => ({
    title: `${SPEEDS[i]} rpm (1X = ${fmt(r.fr, 3)} Hz)`,
    height: 110,
    x: { range: [0, 120] as [number, number], label: i === RUNS.length - 1 ? '주파수 [Hz]' : undefined },
    y: { range: [-70, 15] as [number, number], label: 'dB' },
    series: [
      { x: r.freqs, y: Array.from(r.amp, db), color: 'c1' as const, width: 1.2 },
      { x: [r.fr], y: [db(r.amp[r.k1])], kind: 'dots' as const, color: 'warn' as const, radius: 4 },
    ],
    annotations: [{ type: 'vline' as const, x: PEDESTAL[0].f, color: 'muted' as const, dash: true, label: i === 0 ? `받침대 ${PEDESTAL[0].f} Hz` : undefined }],
  })),
};

// ── 그림 2: 임팩트 시험의 구성과 두 기록 ──
const X2: [number, number] = [0, 20];
const CLEAN = synthRecord(PEDESTAL, TIPS.plastic.tc, [{ t: PRETRIGGER, scale: 1 }]);
const t40 = range(0, 0.04, 1 / FS);
const t1 = range(0, 1 - 1 / FS, 1 / FS);
export const setupFig: FigureSpec = {
  id: 'fig-p9-1-2',
  caption: `그림 2. 임팩트 시험. 힘 센서가 달린 해머로 베어링 받침대를 치고(채널 1 = 힘), 같은 자리의 가속도계가 응답을 잰다(채널 2). 아래는 플라스틱 팁으로 한 번 친 기록: 힘은 ${TIPS.plastic.tc * 1000} ms 동안만 ${fmt(V.peakForce.plastic / 1000, 2)} kN까지 솟고(가운데), 응답은 그 뒤로 여러 고유진동수가 섞여 울리다 잦아든다(아래). 분석기는 두 채널로 FRF(P1-4)를 구한다.`,
  panels: [
    {
      frame: false,
      height: 230,
      x: { range: X2 },
      y: { range: squareYRange(X2, 230) },
      series: [],
      annotations: [
        { type: 'ground', x1: 1, y1: 0.3, x2: 12, y2: 0.3, side: 'right' },
        { type: 'rect', x1: 3.5, x2: 8.5, y1: 0.3, y2: 0.7 },
        { type: 'rect', x1: 5, x2: 7, y1: 0.7, y2: 3.6, label: '받침대' },
        { type: 'rect', x1: 4.6, x2: 7.4, y1: 3.6, y2: 4.6, label: '베어링' },
        { type: 'line', x1: 1.2, y1: 5.9, x2: 3.9, y2: 4.35, width: 3, color: 'text' },
        { type: 'rect', x1: 3.3, x2: 4.5, y1: 3.85, y2: 4.35, color: 'c2' },
        { type: 'text', x: 0.3, y: 6.25, text: '해머 (끝에 힘 센서)', anchor: 'start', color: 'c2', bold: true },
        { type: 'rect', x1: 7.4, x2: 7.9, y1: 3.9, y2: 4.3, color: 'c1' },
        { type: 'text', x: 8.1, y: 4.75, text: '가속도계', anchor: 'start', color: 'c1', bold: true },
        { type: 'line', x1: 1.2, y1: 5.9, x2: 16.25, y2: 5.9, dash: true, color: 'c2', width: 1.2 },
        { type: 'line', x1: 16.25, y1: 5.9, x2: 16.25, y2: 5.0, dash: true, color: 'c2', width: 1.2 },
        { type: 'line', x1: 7.9, y1: 4.1, x2: 13, y2: 4.1, dash: true, color: 'c1', width: 1.2 },
        { type: 'rect', x1: 13, x2: 19.5, y1: 1.2, y2: 5.0 },
        { type: 'text', x: 16.25, y: 4.35, text: '분석기', anchor: 'middle', bold: true },
        { type: 'text', x: 16.25, y: 3.35, text: 'ch1 힘 · ch2 가속도', anchor: 'middle' },
        { type: 'text', x: 16.25, y: 2.35, text: 'FRF · 코히어런스', anchor: 'middle' },
      ],
    },
    {
      title: '채널 1: 힘 (앞 40 ms)',
      height: 120,
      x: { range: [0, 40], label: '시간 [ms]' },
      y: { range: [-0.5, 4.5], label: 'kN' },
      series: [{ x: t40.map((t) => t * 1000), y: t40.map((_, i) => CLEAN.force[i] / 1000), color: 'c2', width: 1.6 }],
    },
    {
      title: '채널 2: 가속도 (1 s)',
      height: 130,
      x: { range: [0, 1], label: '시간 [s]' },
      y: { range: [-30, 30], label: 'm/s²' },
      series: [{ x: t1, y: t1.map((_, i) => CLEAN.accel[i]), color: 'c1', width: 1 }],
    },
  ],
};

// ── 그림 3: 해머 팁 → 접촉 시간 → 가진 대역 ──
const TIP_COLOR: Record<TipId, 'c1' | 'c2' | 'c3'> = { rubber: 'c3', plastic: 'c1', steel: 'c2' };
const tFine = range(0, 0.01, 0.00002);
const fAxis = range(0, 1000, 1);
export const tipFig: FigureSpec = {
  id: 'fig-p9-1-3',
  caption: `그림 3. 같은 충격량(${IMPULSE} N·s, 펄스의 면적)으로 팁만 바꾼 힘. 위: 접촉 시간이 고무 ${TIPS.rubber.tc * 1000} ms(초록) · 플라스틱 ${TIPS.plastic.tc * 1000} ms(파랑) · 강철 ${TIPS.steel.tc * 1000} ms(주황)로 짧아질수록 최대 힘은 ${fmt(V.peakForce.rubber / 1000, 2)} → ${fmt(V.peakForce.plastic / 1000, 2)} → ${fmt(V.peakForce.steel / 1000, 3)} kN으로 커진다(세로는 각자의 최대 힘으로 나눔). 아래: 힘 스펙트럼은 저주파에서 셋 다 같고, 짧을수록 멀리까지 평평하다. −10 dB까지 내려가는 주파수(가진 대역)는 약 1/t_c — 고무 ${fmt(V.bw10.rubber, 3)} Hz, 플라스틱 ${fmt(V.bw10.plastic, 3)} Hz, 강철 ${fmt(V.bw10.steel, 3)} Hz. 회색 점선은 받침대의 세 고유진동수: 고무 팁은 ${PEDESTAL[2].f} Hz를 ${fmt(V.rubberAt[2], 2)} dB로 거의 못 흔든다.`,
  panels: [
    {
      title: '힘 ÷ 최대 힘',
      height: 130,
      x: { range: [0, 10], label: '시간 [ms]' },
      y: { range: [0, 1.1] },
      series: (Object.keys(TIPS) as TipId[]).map((id) => ({
        x: tFine.map((t) => t * 1000),
        y: tFine.map((t) => (t <= TIPS[id].tc ? Math.sin((Math.PI * t) / TIPS[id].tc) : 0)),
        color: TIP_COLOR[id],
        width: 1.8,
        label: `${TIPS[id].label} ${TIPS[id].tc * 1000} ms`,
      })),
    },
    {
      title: '힘 스펙트럼 (저주파 = 0 dB)',
      height: 190,
      x: { range: [0, 1000], label: '주파수 [Hz]' },
      y: { range: [-50, 5], label: 'dB' },
      legend: false,
      series: (Object.keys(TIPS) as TipId[]).map((id) => ({
        x: fAxis,
        y: fAxis.map((f) => Math.max(-60, db(Math.hypot(...halfSineFT(f, TIPS[id].tc)) / IMPULSE))),
        color: TIP_COLOR[id],
        width: 1.6,
      })),
      annotations: [
        { type: 'hline', y: -10, color: 'warn', dash: true, label: '−10 dB', labelAt: 'end' },
        ...PEDESTAL.map((m) => ({ type: 'vline' as const, x: m.f, color: 'muted' as const, dash: true })),
      ],
    },
  ],
};

// ── 그림 4: 지수 윈도우 — 잘림을 없애는 대신 감쇠를 보탠다 ──
const respW = t1.map((_, i) => EXP.accel[i] * EXP.wResp[i]);
const winScale = 30;
const zoom2 = (r: ReturnType<typeof impactTest>, lo = 128, hi = 156) => {
  const xs: number[] = [];
  const ys: number[] = [];
  r.freqs.forEach((f, k) => {
    if (f >= lo && f <= hi) {
      xs.push(f);
      ys.push(db(r.mag[k] * 1000));
    }
  });
  return { xs, ys };
};
const z2def = zoom2(DEF);
const z2exp = zoom2(EXP);
const fTrue2 = range(128, 156, 0.02);
export const expFig: FigureSpec = {
  id: 'fig-p9-1-4',
  caption: `그림 4. 감쇠가 아주 작은 2차 모드(${PEDESTAL[1].f} Hz, ζ ${PEDESTAL[1].zeta})는 1 s 프레임 끝에서도 처음 울림의 ${fmt(V.ring2At1s * 100, 2)} %가 남아 잘린다(위, 파랑). 지수 윈도우 e^(−t/τ)(τ = 0.1 s, 회색 점선)를 곱하면 끝이 0으로 줄어든다(초록). 아래: 2차 봉우리 확대(dB, 1 (m/s²)/kN = 0 dB). 윈도우 없이(파랑)는 Δf = 1 Hz가 봉우리 폭(${fmt(2 * PEDESTAL[1].zeta * PEDESTAL[1].f, 2)} Hz)보다 넓어 bin ${fmt(V.def[1].bins, 2)}개로 읽고 ζ ${fmt(V.def[1].zeta, 2)}(참값의 약 ${fmt(V.def[1].zeta / PEDESTAL[1].zeta, 2)}배)가 나온다. 지수 윈도우(초록)는 봉우리를 넓혀 bin ${fmt(V.exp2.bins, 2)}개로 읽게 하지만 ζ가 ${fmt(V.exp2.zeta, 3)}로 커진다. 윈도우가 보탠 몫(1/(τω_n) = ${fmt(V.exp2Added, 3)})을 빼면 ${fmt(V.exp2.zeta - V.exp2Added, 2)}로 참값 ${PEDESTAL[1].zeta}에 가까워진다.`,
  panels: [
    {
      title: '응답 기록 (1 s 프레임, 2차가 끝까지 울린다)',
      height: 150,
      x: { range: [0, 1], label: '시간 [s]' },
      y: { range: [-30, 30], label: 'm/s²' },
      series: [
        { x: t1, y: t1.map((_, i) => EXP.accel[i]), color: 'c1', width: 1, label: '원기록' },
        { x: t1, y: respW, color: 'c3', width: 1.2, label: '지수 윈도우 곱함' },
        { x: t1, y: t1.map((_, i) => EXP.wResp[i] * winScale), color: 'muted', dash: true, width: 1.4, label: '윈도우 (× 30)' },
      ],
    },
    {
      title: `2차 봉우리 확대 (Δf = ${DEF.df} Hz)`,
      height: 190,
      x: { range: [128, 156], label: '주파수 [Hz]' },
      y: { range: [10, 55], label: 'dB' },
      series: [
        { x: fTrue2, y: fTrue2.map((f) => db(trueMag(f) * 1000)), color: 'muted', dash: true, width: 1.4, label: '참 FRF' },
        { x: z2def.xs, y: z2def.ys, color: 'c1', width: 1.4, label: '윈도우 없음' },
        { x: z2def.xs, y: z2def.ys, kind: 'dots', color: 'c1', radius: 3 },
        { x: z2exp.xs, y: z2exp.ys, color: 'c3', width: 1.4, label: '지수 윈도우 τ 0.1 s' },
        { x: z2exp.xs, y: z2exp.ys, kind: 'dots', color: 'c3', radius: 3 },
      ],
    },
  ],
};

// ── 그림 5: 더블 히트 ──
const t25 = range(0, 0.025, 1 / FS);
const f400 = range(0, 400, 1);
const HIT2 = DBL.hits[0][1];
const DH_DELAY = HIT2.t - DBL.hits[0][0].t;
/** 두 펄스가 실린 힘 스펙트럼 [dB re 한 번 친 펄스의 저주파] — 첫 번째 타격의 실제 간격·세기 */
const dblForceDb = (f: number) => {
  const [re, im] = halfSineFT(f, TIPS.plastic.tc);
  const ph = -2 * Math.PI * f * DH_DELAY;
  const k: [number, number] = [1 + HIT2.scale * Math.cos(ph), HIT2.scale * Math.sin(ph)];
  return db((Math.hypot(re, im) * Math.hypot(k[0], k[1])) / IMPULSE);
};
const FW_END = PRETRIGGER + Math.max(1.5 * TIPS.plastic.tc, 0.002);
const dblZoom = (lo: number, hi: number, yMax: number, title: string) => {
  const ks = Array.from(DEF.freqs).map((f, k) => [f, k] as const).filter(([f]) => f >= lo && f <= hi);
  const ft = range(lo, hi, (hi - lo) / 400);
  return {
    title,
    height: 130,
    x: { range: [lo, hi] as [number, number], label: '주파수 [Hz]' },
    y: { range: [0, yMax] as [number, number] },
    legend: false,
    series: [
      { x: ft, y: ft.map((f) => trueMag(f) * 1000), color: 'muted' as const, dash: true, width: 1.4 },
      { x: ks.map(([f]) => f), y: ks.map(([, k]) => DEF.mag[k] * 1000), color: 'c1' as const, width: 1.4 },
      { x: ks.map(([f]) => f), y: ks.map(([, k]) => DBL.mag[k] * 1000), color: 'c2' as const, width: 1.6 },
    ] as FigSeries[],
  };
};
export const DOUBLE_HIT = {
  delayMs: DH_DELAY * 1000,
  scale: HIT2.scale,
  dipHz: 1 / (2 * DH_DELAY),
  dipDb: 20 * Math.log10(1 - HIT2.scale),
};
export const doubleFig: FigureSpec = {
  id: 'fig-p9-1-5',
  caption: `그림 5. 해머가 튀어 한 번 더 맞은 더블 히트(플라스틱 팁, 평균 5회). 위: 첫 펄스가 시작되고 ${fmt(DOUBLE_HIT.delayMs, 2)} ms 뒤 첫 펄스의 ${fmt(DOUBLE_HIT.scale, 2)}배인 두 번째 펄스가 선다(주황). 회색 띠는 Force 윈도우가 남기는 구간이라 두 번째 펄스는 지워진다. 가운데: 두 펄스가 다 실린 힘 스펙트럼에는 1/(2 × 간격) = ${fmt(DOUBLE_HIT.dipHz, 3)} Hz 자리에 골(${fmt(DOUBLE_HIT.dipDb, 2)} dB)이 생기고, 간격이 칠 때마다 달라 골 자리도 바뀐다. 아래 두 칸: Force 윈도우를 거친 힘으로 구한 FRF(주황, 정상 = 파랑, 참 = 회색 점선)는 1차 봉우리를 ${fmt(V.dbl[0].peak * 1000, 3)}(참 ${fmt(V.trueAt[0] * 1000, 3)}), 2차를 ${fmt(V.dbl[1].peak * 1000, 3)}(참 ${fmt(V.trueAt[1] * 1000, 3)}) (m/s²)/kN로 읽는다. 응답에는 두 번 친 결과가, 힘에는 한 번만 남았기 때문이다. 정상 기록도 2차가 참값보다 낮은 것은 Δf 1 Hz와 잘림 탓이다(§3·§5).`,
  panels: [
    {
      title: '채널 1: 힘 (앞 25 ms)',
      height: 120,
      x: { range: [0, 25], label: '시간 [ms]' },
      y: { range: [-0.5, 4.5], label: 'kN' },
      series: [
        { x: t25.map((t) => t * 1000), y: t25.map((_, i) => DEF.force[i] / 1000), color: 'c1', width: 1.4, label: '정상' },
        { x: t25.map((t) => t * 1000), y: t25.map((_, i) => DBL.force[i] / 1000), color: 'c2', width: 1.4, label: '더블 히트' },
      ],
      annotations: [{ type: 'band', x1: 0, x2: FW_END * 1000, color: 'muted', label: 'Force 윈도우' }],
    },
    {
      title: '두 펄스가 다 실린 힘 스펙트럼 (한 번 친 펄스의 저주파 = 0 dB)',
      height: 140,
      x: { range: [0, 400], label: '주파수 [Hz]' },
      y: { range: [-15, 8], label: 'dB' },
      legend: false,
      series: [
        { x: f400, y: f400.map((f) => db(Math.hypot(...halfSineFT(f, TIPS.plastic.tc)) / IMPULSE)), color: 'c1', width: 1.4 },
        { x: f400, y: f400.map(dblForceDb), color: 'c2', width: 1.6 },
      ],
      annotations: [{ type: 'vline', x: DOUBLE_HIT.dipHz, color: 'muted', dash: true, label: `골 ${fmt(DOUBLE_HIT.dipHz, 3)} Hz` }],
    },
    dblZoom(36, 60, 70, '1차 둘레: Force 윈도우를 거친 |H1| [(m/s²)/kN]'),
    dblZoom(134, 150, 300, '2차 둘레'),
  ],
};

// ── 그림 6: Half-power — bin이 봉우리 폭보다 촘촘해야 ──
const zoomLin = (r: ReturnType<typeof impactTest>, lo: number, hi: number) => {
  const xs: number[] = [];
  const ys: number[] = [];
  r.freqs.forEach((f, k) => {
    if (f >= lo && f <= hi) {
      xs.push(f);
      ys.push(r.mag[k] * 1000);
    }
  });
  return { xs, ys };
};
const fTrue1 = range(36, 60, 0.05);
const hpPanel = (r: ReturnType<typeof impactTest>, h: ReturnType<typeof hp>, color: 'c1' | 'c2', title: string) => {
  const z = zoomLin(r, 36, 60);
  const level = (h.peak * 1000) / Math.SQRT2;
  return {
    title,
    height: 170,
    x: { range: [36, 60] as [number, number], label: '주파수 [Hz]' },
    y: { range: [0, 55] as [number, number], label: '(m/s²)/kN' },
    legend: false,
    series: [
      { x: fTrue1, y: fTrue1.map((f) => trueMag(f) * 1000), color: 'muted' as const, dash: true, width: 1.4 },
      { x: z.xs, y: z.ys, color, width: 1.4 },
      { x: z.xs, y: z.ys, kind: 'dots' as const, color, radius: 3.5 },
      { x: [h.fa, h.fb], y: [level, level], kind: 'dots' as const, color: 'warn' as const, radius: 4.5 },
    ] as FigSeries[],
    annotations: [
      { type: 'hline' as const, y: level, color: 'warn' as const, dash: true, label: '봉우리 × 1/√2', labelAt: 'end' as const },
      { type: 'text' as const, x: 37, y: 50, text: `f_a ${fmt(h.fa, 3)} · f_b ${fmt(h.fb, 3)} Hz → ζ ${fmt(h.zeta, 3)} (bin ${fmt(h.bins, 2)}개)`, anchor: 'start' as const, color },
    ],
  };
};
export const halfPowerFig: FigureSpec = {
  id: 'fig-p9-1-6',
  caption: `그림 6. 1차 봉우리(참 ζ ${PEDESTAL[0].zeta}, 봉우리 폭 2ζf_n = ${fmt(2 * PEDESTAL[0].zeta * PEDESTAL[0].f, 2)} Hz)에서 Half-power 읽기. 봉우리 높이의 1/√2(주황 점선)를 지나는 두 주파수 f_a·f_b를 bin 사이 직선으로 찾아 ζ ≈ (f_b − f_a)/(2f_peak)를 계산한다. 위: T = 4 s(Δf 0.25 Hz)면 폭 안에 bin ${fmt(V.long1.bins, 2)}개가 들어 ζ = ${fmt(V.long1.zeta, 3)}(참값보다 ${fmt((1 - V.long1.zeta / PEDESTAL[0].zeta) * 100, 2)} % 작다 — 잡음 몫). 아래: T = 0.25 s(Δf 4 Hz)면 폭 안에 bin이 약 ${fmt(V.short1.bins, 1)}개뿐이라 봉우리 높이를 참값보다 ${fmt((1 - V.short1.peak / V.trueAt[0]) * 100, 2)} % 낮게 읽고 ζ = ${fmt(V.short1.zeta, 3)}으로 읽는다. 회색 점선은 참 FRF.`,
  panels: [hpPanel(LONG, V.long1, 'c1', 'T = 4 s (Δf 0.25 Hz)'), hpPanel(SHORT, V.short1, 'c2', 'T = 0.25 s (Δf 4 Hz)')],
};

// ── 그림 7: 운전 중 범프 테스트 — 타격에 맞춘 평균 ──
const bIdx = Array.from(BUMP.freqs).map((f, k) => [f, k] as const).filter(([f]) => f >= 20 && f <= 80);
const bumpPanel = (y: Float64Array, color: 'muted' | 'c1', title: string, first: boolean) => ({
  title,
  height: 150,
  x: { range: [20, 80] as [number, number], label: first ? undefined : '주파수 [Hz]' },
  y: { range: [-55, 15] as [number, number], label: 'dB' },
  series: [{ x: bIdx.map(([f]) => f), y: bIdx.map(([, k]) => db(y[k])), color, width: 1.3 }],
  annotations: [
    { type: 'vline' as const, x: PEDESTAL[0].f, color: 'warn' as const, dash: true, label: first ? `받침대 ${PEDESTAL[0].f} Hz` : undefined },
    { type: 'text' as const, x: 53, y: db(y[BUMP.kr]) - 8, text: `1X 50 Hz: ${fmt(y[BUMP.kr], 3)} m/s²`, anchor: 'start' as const },
  ],
});
export const bumpFig: FigureSpec = {
  id: 'fig-p9-1-7',
  caption: `그림 7. 3000 rpm으로 도는 기계의 받침대를 고무 팁으로 치며 잰 가속도 스펙트럼(dB, 1 m/s² = 0 dB, T = 4 s). 위: 한 기록에서는 50 Hz 1X(${fmt(V.bump.single, 3)} m/s²)와 운전 잡음이 커서 ${PEDESTAL[0].f} Hz 봉우리가 바닥에 묻힌다. 아래: 타격 순간에 맞춰 16개 기록을 시간 평균하면 타격 응답은 매번 같은 자리에 있어 그대로 남고, 1X는 기록마다 위상이 달라 ${fmt(V.bump.avg, 2)} m/s²(약 ${fmt(V.bump.single / V.bump.avg, 2)}분의 1)로 줄어든다. 바닥 잡음도 함께 내려가 ${PEDESTAL[0].f} Hz 둘레의 둔덕이 드러난다.`,
  panels: [bumpPanel(BUMP.single, 'muted', '한 기록', true), bumpPanel(BUMP.avg, 'c1', '타격에 맞춘 평균 16회', false)],
};

// ── 그림 8: ODS — 운전 중 같은 주파수의 움직임 모양 (가상의 세 경우) ──
const HEIGHTS = [0, 0.15, 0.3, 0.8, 1.3];
const HEIGHT_NAMES = ['기초', '베이스 플레이트', '받침대 아래', '받침대 가운데', '베어링'];
/** 1X 진폭 [mm/s], 부호 = 베어링(기준)과 같은 위상 +, 반대 위상 − */
export const ODS_CASES = [
  { name: '받침대가 흔들린다', color: 'c1' as const, v: [0.1, 0.2, 0.4, 2.2, 4.5] },
  { name: '기초째 흔들린다', color: 'c2' as const, v: [2.6, 2.8, 3.0, 3.8, 4.5] },
  { name: '이음(베이스 볼트)이 풀렸다', color: 'c3' as const, v: [-0.3, 2.4, 2.7, 3.6, 4.5] },
];
export const odsFig: FigureSpec = {
  id: 'fig-p9-1-8',
  caption: `그림 8. 운전 중(1X) 받침대의 높이 다섯 곳에서 잰 수평 진폭과 위상으로 그린 ODS(가상의 세 경우). 가로 = 진폭(mm/s), 베어링(기준 센서)과 같은 위상이면 +, 반대면 −. 파랑: 위로 갈수록 커지고 기초는 거의 서 있다 → 받침대 자체가 흔들린다(받침대 강성·공진). 주황: 기초부터 이미 크다 → 기초째 흔들린다(기초 강성). 초록: 기초(−0.3)와 베이스 플레이트(2.4) 사이에서 진폭이 뛰고 위상이 뒤집힌다 → 그 이음이 풀렸다(P7-3의 구조적 풀림).`,
  panels: [
    {
      height: 230,
      x: { range: [-1.5, 6.5], label: '1X 진폭 [mm/s] (+ 기준과 같은 위상, − 반대)' },
      y: { range: [-0.1, 1.45], label: '높이 [m]' },
      series: ODS_CASES.flatMap((c) => [
        { x: c.v, y: HEIGHTS, color: c.color, width: 1.8, label: c.name },
        { x: c.v, y: HEIGHTS, kind: 'dots' as const, color: c.color, radius: 3.5 },
      ]),
      annotations: [
        { type: 'vline', x: 0, color: 'muted' },
        ...HEIGHTS.map((h, i) => ({ type: 'text' as const, x: -1.4, y: h, text: HEIGHT_NAMES[i], anchor: 'start' as const, dy: -4 })),
      ],
    },
  ],
};

// ── 그림 9: 소프트 풋 — 볼트를 하나씩 풀며 발이 뜨는 양 (예시) ──
export const SOFT_FOOT_LIFT = [18, 25, 140, 22];
export const softFootFig: FigureSpec = {
  id: 'fig-p9-1-9',
  caption: `그림 9. 모터 발 네 곳(A ~ D)의 볼트를 하나씩 풀며 다이얼 게이지로 잰, 발이 뜨는 양(예시 값). 다른 발은 ${Math.min(...SOFT_FOOT_LIFT)} ~ ${SOFT_FOOT_LIFT.filter((_, i) => i !== 2).reduce((a, b) => Math.max(a, b))} µm인데 C만 ${SOFT_FOOT_LIFT[2]} µm 뜬다 → C가 바닥에 제대로 닿지 않은 소프트 풋이다. 볼트로 조이면 프레임이 비틀려 공극·정렬·고유진동수가 바뀐다. 심(shim)으로 C를 받친 뒤 다시 잰다.`,
  panels: [
    {
      height: 170,
      x: { range: [0.4, 4.6], ticks: [1, 2, 3, 4], tickLabels: [{ value: 1, label: 'A' }, { value: 2, label: 'B' }, { value: 3, label: 'C' }, { value: 4, label: 'D' }], label: '발' },
      y: { range: [0, 160], label: '뜨는 양 [µm]' },
      series: [
        { x: [1, 2, 4], y: [SOFT_FOOT_LIFT[0], SOFT_FOOT_LIFT[1], SOFT_FOOT_LIFT[3]], kind: 'bar', barWidth: 0.5, color: 'c1' },
        { x: [3], y: [SOFT_FOOT_LIFT[2]], kind: 'bar', barWidth: 0.5, color: 'warn' },
      ],
    },
  ],
};
