/**
 * P7-1 "진단 주파수 지도 · 회전수 추정" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호는 랩(LAB-MAP-01 · LAB-FAULT-01 · LAB-RPM-01)과 같은 `lib/faults/` 합성기·목록·추정으로 만든다.
 */
import type { FigAnnotation, FigColor, FigSeries, FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { envelopeSpectrum, spectrumOf } from '../lib/dsp/envelope';
import { bearingFrequencies } from '../lib/machine/frequencies';
import { bearingOf } from '../lib/faults/catalog';
import { estimateRpm, type QuefrencyCurve, type ScoreCurve } from '../lib/faults/rpm';
import { G, hvLagDeg, MACHINES, peakAt, synthesize, velocitySpectrum, type Dir, type Severity } from '../lib/faults/synth';

const fmt = formatNumber;
const PUMP = MACHINES.pump;
const FR = PUMP.rpm / 60;
const BRG = bearingFrequencies(bearingOf(PUMP.balls), FR);

const spec = (sev: Severity, d: Dir, fMax = 1000, m = PUMP) => {
  const s = synthesize(m, sev);
  return { s, ...velocitySpectrum(s.acc[d], s.fs, fMax) };
};
const lineAt = (sev: Severity, d: Dir, k: number) => {
  const v = spec(sev, d);
  return peakAt(v.freq, v.amp, k * FR);
};
const upTo = (x: ArrayLike<number>, y: ArrayLike<number>, f1: number, f2: number) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < x.length; i++) if (x[i] >= f1 && x[i] <= f2) { xs.push(x[i]); ys.push(y[i]); }
  return { x: xs, y: ys };
};

// 그림 2: 불평형 vs 정렬 불량
const UNB: Severity = { unbalance: 0.6 };
const MIS: Severity = { misalignment: 0.6 };
const bars = (sev: Severity) => (['H', 'V', 'A'] as Dir[]).flatMap((d) => [1, 2].map((k) => ({ d, k, v: lineAt(sev, d, k) })));
const unbBars = bars(UNB);
const misBars = bars(MIS);

// 그림 3: 2X vs 2×LF
const ELEC: Severity = { misalignment: 0.3, electrical2LF: 0.4 };
const elec = synthesize(PUMP, ELEC);
const elecLong = velocitySpectrum(elec.acc.H, elec.fs);
const elecShort = velocitySpectrum(elec.acc.H.slice(0, 8192), elec.fs);

// 그림 4: 지문
const LOOSE: Severity = { looseness: 0.6 };
const OUTER: Severity = { bearingOuter: 0.6 };
const outerSyn = synthesize(PUMP, OUTER);
const outerEnv = envelopeSpectrum(spectrumOf(outerSyn.acc.V), outerSyn.fs, 2800, 3800, 1000);

// 그림 5·표: 회전수 추정
export const RPM_CASES = {
  pump: { m: MACHINES.pump, sev: { unbalance: 0.4, misalignment: 0.3, electrical2LF: 0.3, bladePass: 0.3 } as Severity },
  gearbox: { m: MACHINES.gearbox, sev: { gear: 0.6, unbalance: 0.2 } as Severity },
  fan: { m: MACHINES.fan, sev: { looseness: 0.7, unbalance: 0.2 } as Severity },
};
export type RpmCase = keyof typeof RPM_CASES;
const METHODS = ['harmonic', 'cepstrum', 'autocorr'] as const;
const rpmTable = Object.fromEntries(
  (Object.keys(RPM_CASES) as RpmCase[]).map((id) => {
    const { m, sev } = RPM_CASES[id];
    const s = synthesize(m, sev);
    const v = velocitySpectrum(s.acc.H, s.fs, 2048);
    return [id, { truth: s.fr, est: Object.fromEntries(METHODS.map((mm) => [mm, estimateRpm(v, s.fs, mm, `${id}`)])) }];
  }),
) as Record<RpmCase, { truth: number; est: Record<(typeof METHODS)[number], ReturnType<typeof estimateRpm>> }>;

// 그림 6: 운전 조건 변경 (부하가 늘어 슬립이 커지면 3575 → 3545 rpm)
const OPS: Severity = { electrical2LF: 0.4, bladePass: 0.4, misalignment: 0.3 };
const op1 = spec(OPS, 'H');
const op2 = spec(OPS, 'H', 1000, { ...PUMP, rpm: 3545 });

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p7-1.test.ts`) */
export const P71_VALUES = {
  fr: FR,
  brg: BRG,
  unb: unbBars,
  mis: misBars,
  unbLag: hvLagDeg(synthesize(PUMP, UNB), FR),
  misLag: hvLagDeg(synthesize(PUMP, MIS), FR),
  twoX: peakAt(elecLong.freq, elecLong.amp, 2 * FR, 0.2),
  twoLF: peakAt(elecLong.freq, elecLong.amp, 120, 0.2),
  merged: peakAt(elecShort.freq, elecShort.amp, 119.6, 2),
  outerEnvG: Math.max(...Array.from(outerEnv.amp).filter((_, k) => Math.abs(outerEnv.freq[k] - BRG.bpfo) <= 2)) / G,
  looseHalf: lineAt(LOOSE, 'V', 0.5),
  rpm: rpmTable,
};
const V = P71_VALUES;
const bar = (b: typeof unbBars) => b.find((x) => x.d === 'A' && x.k === 1)!.v;

// ── 그림 1: 주파수 → 원인 지도 (X 배수) ──
type Row = { label: string; color: FigColor; spots: { x: number; label?: string }[]; band?: [number, number] };
const ROWS: Row[] = [
  { label: '회전체', color: 'c1', spots: [{ x: 0.5, label: '½X' }, { x: 1, label: '1X' }, { x: 2, label: '2X' }, { x: 3, label: '3X' }, { x: 4 }, { x: 5 }] },
  { label: '기름막', color: 'c3', spots: [], band: [0.38, 0.48] },
  { label: '구름', color: 'c2', spots: [{ x: BRG.ftf / FR, label: 'FTF' }, { x: BRG.bpfo / FR, label: 'BPFO' }, { x: BRG.bsf2 / FR, label: '2×BSF' }, { x: BRG.bpfi / FR, label: 'BPFI' }] },
  { label: '날개', color: 'c4', spots: [{ x: 7, label: '7X (베인 7개)' }] },
  { label: '전기', color: 'warn', spots: [{ x: 120 / FR, label: '2×LF (고정)' }] },
];
const NR = ROWS.length;
const rowY = (i: number) => NR - i;
export const reverseMap: FigureSpec = {
  id: 'fig-p7-1-1',
  caption: `그림 1. 주파수 → 원인 지도 (2극 전동기-펌프, ${PUMP.rpm} rpm, 6205 베어링, 베인 7개, 60 Hz 계통). 세로는 원인 갈래(회전체 · 미끄럼베어링 기름막 · 구름베어링 · 날개 · 전기), 가로는 1X의 몇 배인가(차수)다. 회전체의 원인은 1X의 정수배·½X에, 미끄럼베어링의 기름막은 0.38 ~ 0.48X 구간에, 구름베어링은 정수배가 아닌 자리(BPFO ${fmt(BRG.bpfo / FR, 4)}X 등)에, 날개는 날개 수 × X에 선다. 전기(2×LF = 120 Hz)는 회전수와 무관한 자리라 이 회전수에서는 ${fmt(120 / FR, 4)}X — 2X 바로 옆에 선다. 구조 공진은 어느 자리에나 설 수 있어 지도에 그리지 않았다.`,
  panels: [
    {
      series: ROWS.flatMap((r, i): FigSeries[] => (r.spots.length ? [{ x: r.spots.map((s) => s.x), y: r.spots.map(() => rowY(i)), kind: 'dots', color: r.color, radius: 5 }] : [])),
      annotations: [
        ...ROWS.flatMap((r, i): FigAnnotation[] => [
          // 정수배 점선 위의 자리는 라벨을 점선 오른쪽에 붙여 선과 겹치지 않게 한다
          ...r.spots.filter((s) => s.label).map((s): FigAnnotation => {
            const onLine = Math.round(s.x) >= 1 && Math.abs(s.x - Math.round(s.x)) < 0.15;
            return { type: 'text', x: onLine ? s.x + 0.07 : s.x, y: rowY(i) + 0.3, text: s.label!, anchor: onLine ? 'start' : 'middle', color: r.color };
          }),
          ...(r.band ? [{ type: 'rect', x1: r.band[0], x2: r.band[1], y1: rowY(i) - 0.2, y2: rowY(i) + 0.2, color: r.color } as FigAnnotation, { type: 'text', x: (r.band[0] + r.band[1]) / 2, y: rowY(i) + 0.3, text: '0.38 ~ 0.48X', anchor: 'middle', color: r.color } as FigAnnotation] : []),
        ]),
        ...[1, 2, 3, 4, 5, 6, 7].map((k): FigAnnotation => ({ type: 'vline', x: k, color: 'muted', dash: true })),
      ],
      x: { range: [0, 8], ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8], label: '차수 (1X의 몇 배)' },
      y: { range: [0.4, NR + 0.7], ticks: ROWS.map((_, i) => rowY(i)), tickLabels: ROWS.map((r, i) => ({ value: rowY(i), label: r.label })) },
      height: 200,
    },
  ],
};

// ── 그림 2: 같은 1X, 다른 원인 ──
const CAT = ['H 1X', 'V 1X', 'A 1X', 'H 2X', 'V 2X', 'A 2X'];
const order = (b: typeof unbBars) => [b.find((x) => x.d === 'H' && x.k === 1)!, b.find((x) => x.d === 'V' && x.k === 1)!, b.find((x) => x.d === 'A' && x.k === 1)!, b.find((x) => x.d === 'H' && x.k === 2)!, b.find((x) => x.d === 'V' && x.k === 2)!, b.find((x) => x.d === 'A' && x.k === 2)!];
const barPanel = (b: typeof unbBars, title: string, color: FigColor, last = false) => ({
  title,
  series: [{ x: [1, 2, 3, 4, 5, 6], y: order(b).map((x) => x.v), kind: 'bar', color, barWidth: 0.6 } as FigSeries],
  annotations: order(b).map((x, i): FigAnnotation => ({ type: 'text', x: i + 1, y: x.v + 0.35, text: fmt(x.v, 2), anchor: 'middle', color: 'text' })),
  x: { range: [0.4, 6.6] as [number, number], ticks: [1, 2, 3, 4, 5, 6], tickLabels: CAT.map((c, i) => ({ value: i + 1, label: c })), ...(last ? { label: '방향 · 성분' } : {}) },
  y: { range: [0, 6] as [number, number], ticks: [0, 2, 4, 6], label: '[mm/s rms]' },
  height: 110,
});
export const sameLine: FigureSpec = {
  id: 'fig-p7-1-2',
  caption: `그림 2. 같은 펌프에 불평형(위)과 정렬 불량(아래)을 넣었다 (정도 0.6, 설명용). 둘 다 수평 1X가 커서 수평 스펙트럼 하나로는 가르기 어렵다. 나머지 증거가 다르다 — 불평형은 반경 방향이 크고 축방향 1X가 ${fmt(bar(unbBars), 2)} mm/s로 작으며, 수직이 수평보다 ${fmt(V.unbLag, 2)}° 늦다(회전하는 힘). 정렬 불량은 축방향 1X가 ${fmt(bar(misBars), 3)} mm/s로 가장 크고 2X도 크며, 수평·수직의 위상차가 ${fmt(V.misLag, 2)}°로 90°에서 멀다(한 방향으로 미는 힘).`,
  panels: [barPanel(unbBars, `불평형 — 수직이 ${fmt(V.unbLag, 2)}° 늦음`, 'c1'), barPanel(misBars, `정렬 불량 — 수평·수직 위상차 ${fmt(V.misLag, 2)}°`, 'c2', true)],
};

// ── 그림 3: 2X와 2×LF ──
const zl = upTo(elecLong.freq, elecLong.amp, 110, 130);
const zs = upTo(elecShort.freq, elecShort.amp, 110, 130);
export const twoXvsLine: FigureSpec = {
  id: 'fig-p7-1-3',
  caption: `그림 3. 같은 신호(정렬 불량 + 전기)의 110 ~ 130 Hz. 위: 2초 기록(Δf 0.5 Hz)에서는 2X(${fmt(2 * FR, 5)} Hz, ${fmt(V.twoX, 2)} mm/s)와 2×LF(120 Hz, ${fmt(V.twoLF, 3)} mm/s)가 따로 선다. 아래: 0.5초 기록(Δf 2 Hz)에서는 두 줄이 ${fmt(V.merged, 3)} mm/s 하나로 합쳐진다 — 0.83 Hz 떨어진 두 원인을 가르려면 기록을 길게 잡는다 (P2-4).`,
  panels: [
    {
      title: '2초 기록 (Δf 0.5 Hz)',
      series: [{ x: zl.x, y: zl.y, color: 'c1', width: 1.6 }, { x: zl.x, y: zl.y, kind: 'dots', color: 'c1', radius: 2.5 }],
      annotations: [
        { type: 'text', x: 2 * FR - 0.3, y: V.twoX + 0.25, text: '2X', anchor: 'end', color: 'c1' },
        { type: 'text', x: 120.3, y: V.twoLF + 0.25, text: '2×LF', anchor: 'start', color: 'warn' },
      ],
      x: { range: [110, 130], ticks: [110, 115, 120, 125, 130] },
      y: { range: [0, 2.6], ticks: [0, 1, 2], label: '[mm/s rms]' },
      height: 110,
    },
    {
      title: '0.5초 기록 (Δf 2 Hz)',
      series: [{ x: zs.x, y: zs.y, color: 'c2', width: 1.6 }, { x: zs.x, y: zs.y, kind: 'dots', color: 'c2', radius: 2.5 }],
      x: { range: [110, 130], ticks: [110, 115, 120, 125, 130], label: '주파수 [Hz]' },
      y: { range: [0, 2.6], ticks: [0, 1, 2], label: '[mm/s rms]' },
      height: 110,
    },
  ],
};

// ── 그림 4: 원인마다의 지문 ──
const g1 = spec(UNB, 'H', 500);
const g2 = spec(MIS, 'A', 500);
const g3 = spec(LOOSE, 'V', 500);
const fpPanel = (x: ArrayLike<number>, y: ArrayLike<number>, title: string, color: FigColor, yr: [number, number], unit: string, last = false, xr: [number, number] = [0, 500]) => ({
  title,
  series: [{ x: Array.from(x), y: Array.from(y), color, width: 1.3 }] as FigSeries[],
  annotations: [1, 2, 3, 4, 5, 6, 7, 8].filter((k) => k * FR <= xr[1]).map((k): FigAnnotation => ({ type: 'vline', x: k * FR, color: 'muted', dash: true, label: k === 1 ? '1X' : undefined })),
  x: { range: xr, ...(last ? { label: '주파수 [Hz]' } : {}) },
  y: { range: yr, ticks: [yr[0], yr[1] / 2, yr[1]], label: unit },
  height: 85,
});
export const fingerprints: FigureSpec = {
  id: 'fig-p7-1-4',
  caption: `그림 4. 결함 합성기(LAB-FAULT-01)로 만든 원인마다의 지문 (정도 0.6). ① ~ ③의 점선은 1X의 정수배, ④의 점선은 BPFO의 정수배다. ① 불평형 · 수평: 1X 하나. ② 정렬 불량 · 축방향: 1X·2X·3X. ③ 풀림 · 수직: 1X ~ 8X가 늘어서고 그 사이 ½X 자리에도 줄(½X ${fmt(V.looseHalf, 2)} mm/s). ④ 외륜 결함 · 수직 가속도의 엔벨로프 스펙트럼(2800 ~ 3800 Hz): 1X의 정수배가 아닌 BPFO ${fmt(BRG.bpfo, 4)} Hz(${fmt(BRG.bpfo / FR, 4)}X)와 그 2배에 줄이 선다(BPFO ${fmt(V.outerEnvG, 2)} g) — 속도 스펙트럼에서는 작게만 보인다 (P5-6).`,
  panels: [
    fpPanel(g1.freq, g1.amp, '① 불평형 · 수평 속도', 'c1', [0, 6], '[mm/s]'),
    fpPanel(g2.freq, g2.amp, '② 정렬 불량 · 축방향 속도', 'c2', [0, 4], '[mm/s]'),
    fpPanel(g3.freq, g3.amp, '③ 풀림 · 수직 속도', 'c4', [0, 2.4], '[mm/s]'),
    {
      ...fpPanel(outerEnv.freq, Array.from(outerEnv.amp, (v) => v / G), '④ 외륜 결함 · 수직 가속도의 엔벨로프', 'c3', [0, 0.5], '[g]', true, [0, 1000]),
      annotations: [1, 2, 3, 4].map((k): FigAnnotation => ({ type: 'vline', x: k * BRG.bpfo, color: 'warn', dash: true, label: k === 1 ? 'BPFO' : undefined })),
    },
  ],
};

// ── 그림 5: 회전수 찾기 (펌프) ──
const pumpEst = V.rpm.pump.est;
const hs = pumpEst.harmonic.curve as ScoreCurve;
const cs = pumpEst.cepstrum.curve as QuefrencyCurve;
const pumpSpec = upTo(pumpEst.harmonic.freq, pumpEst.harmonic.amp, 0, 500);
export const rpmMethods: FigureSpec = {
  id: 'fig-p7-1-5',
  caption: `그림 5. 회전수를 모른다고 하고 펌프의 수평 속도 스펙트럼(위)에서 1X를 찾는다. 가운데: 하모닉 무리 점수 — 후보 f₀마다 정수배 자리의 줄 높이(로그)에서 반 칸 자리의 높이를 뺀 평균. ${fmt(pumpEst.harmonic.fr, 4)} Hz(${fmt(pumpEst.harmonic.fr * 60, 4)} rpm)에서 가장 크다(참값 ${fmt(FR, 4)} Hz). 아래: 켑스트럼(P5-7)은 ${fmt(1000 / FR, 3)} ms가 아니라 그 2배 자리를 골라 ${fmt(pumpEst.cepstrum.fr, 3)} Hz — 절반으로 읽었다. 방법 하나로 정하지 않는다.`,
  panels: [
    {
      title: '수평 속도 스펙트럼 (점선 = 하모닉 무리로 찾은 f₀의 정수배)',
      series: [{ x: pumpSpec.x, y: pumpSpec.y, color: 'c1', width: 1.2 }],
      annotations: [1, 2, 3, 4, 5, 6, 7, 8].map((k): FigAnnotation => ({ type: 'vline', x: k * pumpEst.harmonic.fr, color: 'muted', dash: true })),
      x: { range: [0, 500], label: '주파수 [Hz]' },
      y: { range: [0, 4], ticks: [0, 2, 4], label: '[mm/s]' },
      height: 95,
    },
    {
      title: '하모닉 무리 점수',
      series: [{ x: Array.from(hs.f0), y: Array.from(hs.score), color: 'c3', width: 1.4 }],
      annotations: [{ type: 'vline', x: pumpEst.harmonic.fr, color: 'c3', label: `${fmt(pumpEst.harmonic.fr, 4)} Hz` }],
      x: { range: [5, 100], ticks: [5, 20, 40, 60, 80, 100], label: '후보 f₀ [Hz]' },
      y: { range: [Math.min(...hs.score) - 0.1, Math.max(...hs.score) + 0.2] },
      height: 95,
    },
    {
      title: '켑스트럼 (가로 = 1/quefrency로 바꾼 주파수)',
      series: [{ x: Array.from(cs.tau, (t) => 1 / t), y: Array.from(cs.c), color: 'c2', width: 1.2 }],
      annotations: [
        { type: 'vline', x: pumpEst.cepstrum.fr, color: 'c2', label: `${fmt(pumpEst.cepstrum.fr, 3)} Hz` },
        { type: 'vline', x: FR, color: 'muted', dash: true, label: '참 1X' },
      ],
      x: { range: [5, 100], ticks: [5, 20, 40, 60, 80, 100], label: '1/τ [Hz]' },
      y: { range: [Math.min(...cs.c) - 0.01, Math.max(...cs.c) + 0.03] },
      height: 95,
    },
  ],
};

// ── 그림 6: 운전 조건을 바꾸면 ──
const oa1 = upTo(op1.freq, op1.amp, 112, 124);
const oa2 = upTo(op2.freq, op2.amp, 112, 124);
const ob1 = upTo(op1.freq, op1.amp, 405, 425);
const ob2 = upTo(op2.freq, op2.amp, 405, 425);
export const conditionChange: FigureSpec = {
  id: 'fig-p7-1-6',
  caption: `그림 6. 부하가 늘어 유도전동기의 슬립이 커지면 회전수가 ${PUMP.rpm} → 3545 rpm으로 조금 내려간다 (파랑 → 주황). 왼쪽: 2X는 ${fmt(2 * FR, 5)} → ${fmt((2 * 3545) / 60, 5)} Hz로 따라 움직이지만 2×LF는 120 Hz 그대로다. 오른쪽: 베인 통과 7X는 ${fmt(7 * FR, 4)} → ${fmt((7 * 3545) / 60, 4)} Hz로 7배만큼 더 크게 움직인다. 따라 움직이면 회전 관련, 그대로면 전기·구조 쪽이다.`,
  panels: [
    {
      title: '2X와 2×LF',
      series: [
        { x: oa1.x, y: oa1.y, color: 'c1', width: 1.6, label: `${PUMP.rpm} rpm` },
        { x: oa2.x, y: oa2.y, color: 'c2', width: 1.6, dash: true, label: '3545 rpm' },
      ],
      annotations: [{ type: 'vline', x: 120, color: 'muted', dash: true, label: '120 Hz' }],
      x: { range: [112, 124], ticks: [112, 116, 120, 124] },
      y: { range: [0, 2], ticks: [0, 1, 2], label: '[mm/s]' },
      height: 110,
    },
    {
      title: '베인 통과 7X',
      series: [
        { x: ob1.x, y: ob1.y, color: 'c1', width: 1.6 },
        { x: ob2.x, y: ob2.y, color: 'c2', width: 1.6, dash: true },
      ],
      x: { range: [405, 425], ticks: [405, 410, 415, 420, 425], label: '주파수 [Hz]' },
      y: { range: [0, 2], ticks: [0, 1, 2], label: '[mm/s]' },
      height: 110,
    },
  ],
};
