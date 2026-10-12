/**
 * P11-3 "현장 데이터 복기 가이드" 본문 그림 (빌드 시 계산, D-026).
 * 기록은 LAB-REV-01과 같은 합성 정지 기록 A·B(`lib/review/example.ts`, 가상의 압축기 — 현장 자료가 아니다),
 * 계산은 같은 `lib/review/`(keyphasor·vectors)로 한다.
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { RECORDS, REVIEW, reviewRecord, speedAt, type RecordId } from '../lib/review/example';
import { detectPulses, repairPulses, speedFromPulses } from '../lib/review/keyphasor';
import { binByRpm, bodeSummary, cascadeRows, compensate, perRevVectors, slowRollVector, type RevVector } from '../lib/review/vectors';

const fmt = formatNumber;
const RAD = Math.PI / 180;
const TWO_PI = 2 * Math.PI;
const pp = (a: number) => 2 * a;

const box = (x1: number, x2: number, y1: number, y2: number, color: FigColor = 'muted'): FigAnnotation => ({ type: 'rect', x1, x2, y1, y2, color });
const text = (x: number, y: number, t: string, o: { bold?: boolean; color?: FigColor; anchor?: 'start' | 'middle' | 'end' } = {}): FigAnnotation => ({ type: 'text', x, y, text: t, anchor: o.anchor ?? 'middle', bold: o.bold, color: o.color });
const arrow = (x1: number, y1: number, x2: number, y2: number, color: FigColor = 'muted'): FigAnnotation => ({ type: 'arrow', x1, y1, x2, y2, color, double: false });

// ── 두 기록의 분석 (랩의 기본 설정: 펄스 고침, 1X, 1바퀴, 50 rpm 칸, slow roll 200 ~ 500 rpm) ──
function analyse(id: RecordId) {
  const rec = reviewRecord(id);
  const raw = detectPulses(rec.key, rec.fs);
  const rep = repairPulses(raw.times);
  const bins = binByRpm(perRevVectors(rec.x, rec.fs, rep.times, 1, 1), 50);
  const sr = slowRollVector(bins, 200, 500)!;
  const comp = compensate(bins, sr);
  return { rec, raw, rep, bins, sr, comp, sRaw: bodeSummary(bins), sComp: bodeSummary(comp) };
}
const A = analyse('A');
const B = analyse('B');
const at = (pts: readonly RevVector[], rpm: number) => pts.reduce((b, q) => (Math.abs(q.rpm - rpm) < Math.abs(b.rpm - rpm) ? q : b));
const top = (pts: readonly RevVector[]) => pts[pts.length - 1];

// ─────────────────────────────────────────────────────────────────────────────
// 그림 1: 복기 순서
const STEPS = [
  { x: 17, y: 75, t: '① 기록 모으기', s: '원파형 · 키페이저 · 운전 · 당시 판단' },
  { x: 50, y: 75, t: '② 기록 확인', s: '채널 · f_s · 단위 · 펄스' },
  { x: 83, y: 75, t: '③ 다시 뽑기', s: '회전수 · 회전마다 1X 벡터' },
  { x: 83, y: 25, t: '④ 다시 그리기', s: 'Bode · Polar · 캐스케이드' },
  { x: 50, y: 25, t: '⑤ 당시 판단과 비교', s: 'slow roll 보상 · 기준 기록' },
  { x: 17, y: 25, t: '⑥ 남기기', s: '배운 점 · 기준선 · 절차' },
];
export const flow: FigureSpec = {
  id: 'fig-p11-3-1',
  caption:
    '그림 1. 이 페이지의 복기 순서. ①은 기록이 남아 있어야 할 수 있고, ②에서 기록이 쓸 만한지부터 확인합니다. ③ ~ ④는 당시 화면을 그대로 믿지 않고 원파형에서 같은 방법으로 다시 뽑는 단계, ⑤(파랑)가 복기의 핵심 — 당시 판단이 다시 그린 자료와 맞는지 봅니다. ⑥에서 얻은 것을 다음 판단의 기준으로 남깁니다.',
  panels: [
    {
      frame: false,
      height: 200,
      x: { range: [0, 100] },
      y: { range: [0, 100] },
      series: [],
      annotations: [
        ...STEPS.flatMap((s, i): FigAnnotation[] => {
          const hi = i === 4;
          return [box(s.x - 14.5, s.x + 14.5, s.y - 13, s.y + 13, hi ? 'c1' : 'muted'), text(s.x, s.y + 3, s.t, { bold: true, color: hi ? 'c1' : undefined }), text(s.x, s.y - 6.5, s.s)];
        }),
        arrow(31.5, 75, 35.5, 75),
        arrow(64.5, 75, 68.5, 75),
        arrow(83, 62, 83, 38),
        arrow(68.5, 25, 64.5, 25),
        arrow(35.5, 25, 31.5, 25),
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 2: 키페이저 — 빠진 펄스 하나가 회전수를 반으로 만든다 (기록 B, 20.3초 근처)
const MISS = RECORDS.B.missing[0];
const W0 = MISS - 0.12;
const W1 = MISS + 0.14;
const fsR = REVIEW.fs;
const i0 = Math.floor(W0 * fsR);
const i1 = Math.ceil(W1 * fsR);
const keyT = Array.from({ length: i1 - i0 }, (_, k) => (i0 + k) / fsR);
const keyV = Array.from(B.rec.key.subarray(i0, i1));
const pulsesIn = Array.from(B.raw.times).filter((t) => t >= W0 && t <= W1);
// 가장 긴 펄스 간격(= 빠진 자리)의 가운데
const GAP_MID = pulsesIn.slice(1).reduce((b, t, k) => (t - pulsesIn[k] > b.d ? { d: t - pulsesIn[k], m: (t + pulsesIn[k]) / 2 } : b), { d: 0, m: MISS }).m;
const spRaw = speedFromPulses(B.raw.times);
const spRep = speedFromPulses(B.rep.times);
const win = (s: { t: Float64Array; rpm: Float64Array }, a: number, b: number) => {
  const idx = Array.from(s.t.keys()).filter((k) => s.t[k] >= a && s.t[k] <= b);
  return { x: idx.map((k) => s.t[k]), y: idx.map((k) => s.rpm[k]) };
};
const RW = win(spRaw, MISS - 0.6, MISS + 0.6);
const RF = win(spRep, MISS - 0.6, MISS + 0.6);
const RPM_MISS = (speedAt(MISS).w * 60) / TWO_PI;
const RPM_DIP = Math.min(...RW.y);
export const keyFig: FigureSpec = {
  id: 'fig-p11-3-2',
  caption: `그림 2. 기록 B의 ${fmt(MISS, 3)}초 근처. 위 — 키페이저 전압(파랑)과 문턱 ${fmt(B.raw.threshold, 3)} V(회색 점선), 찾은 펄스(갈색 주황 점). 홈이 지나가야 할 자리에서 전압이 떨어지지 않아 펄스 하나가 빠졌습니다(프로브·케이블의 순간 이상을 흉내 냄). 아래 — 펄스 간격으로 구한 회전수: 고치지 않으면(회색) 그 바퀴만 ${fmt(RPM_DIP, 4)} rpm으로 반이 되고, 이웃 간격의 두 배인 간격을 둘로 나누어 메우면(파랑) ${fmt(RPM_MISS, 4)} rpm 근처로 이어집니다.`,
  panels: [
    {
      height: 120,
      x: { range: [W0, W1], label: '시각 [s]' },
      y: { range: [-17, -6], label: '키페이저 [V]' },
      series: [
        { x: keyT, y: keyV, color: 'c1', width: 1.2 },
        { x: [W0, W1], y: [B.raw.threshold, B.raw.threshold], color: 'muted', dash: true, width: 1 },
        { x: pulsesIn, y: pulsesIn.map(() => B.raw.threshold), color: 'warn', kind: 'dots', radius: 3.5 },
      ],
      annotations: [text(GAP_MID, -7.2, '여기서 펄스가 빠졌다', { color: 'warn' })],
    },
    {
      height: 120,
      x: { range: [MISS - 0.6, MISS + 0.6], label: '시각 [s]' },
      y: { range: [0, RPM_MISS * 1.25], label: '회전수 [rpm]' },
      series: [
        { x: RW.x, y: RW.y, color: 'muted', width: 1.6, label: '펄스 그대로' },
        { x: RF.x, y: RF.y, color: 'c1', width: 1.8, label: '빠진 펄스를 메움' },
      ],
      legend: true,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 3: 한 바퀴의 1X 벡터 (기록 A, 4000 rpm 근처)
const revVecs = perRevVectors(A.rec.x, A.rec.fs, A.rep.times, 1, 1);
const REV = revVecs.reduce((b, q, k) => (Math.abs(q.rpm - 4000) < Math.abs(revVecs[b].rpm - 4000) ? k : b), 0);
const V1 = revVecs[REV];
// 그 바퀴의 펄스 번호 찾기 (가운데 시각으로)
const KREV = Array.from(A.rep.times).findIndex((t, k) => k + 1 < A.rep.times.length && t <= V1.t && A.rep.times[k + 1] > V1.t);
const T0 = A.rep.times[KREV];
const T1 = A.rep.times[KREV + 1];
const j0 = Math.ceil(T0 * fsR);
const j1 = Math.floor(T1 * fsR);
const angle = Array.from({ length: j1 - j0 + 1 }, (_, k) => (360 * ((j0 + k) / fsR - T0)) / (T1 - T0));
const xRev = Array.from(A.rec.x.subarray(j0, j1 + 1));
const fitDeg = Array.from({ length: 181 }, (_, k) => 2 * k);
const fit = fitDeg.map((d) => V1.amp * Math.cos(d * RAD - V1.lag * RAD));
export const oneRevFig: FigureSpec = {
  id: 'fig-p11-3-3',
  caption: `그림 3. 기록 A에서 ${fmt(V1.rpm, 4)} rpm일 때의 한 바퀴. 키페이저 펄스 = 0°, 다음 펄스 = 360°로 놓고 샘플 ${j1 - j0 + 1}개(파랑 점)에 X = (2/N) Σ x e^(−jθ)를 하면 1X 벡터 ${fmt(pp(V1.amp), 3)} µm p-p ∠${Math.round(V1.lag)}°가 나옵니다. 주황은 그 벡터로 그린 1X 코사인 — 양의 봉우리가 지연각 ${Math.round(V1.lag)}°(점선)에 섭니다. 점이 주황 곡선에서 벗어난 만큼이 2X 런아웃과 잡음입니다.`,
  panels: [
    {
      height: 150,
      x: { range: [0, 360], label: '키페이저부터 돈 각 [°]', ticks: [0, 90, 180, 270, 360] },
      y: { range: [-35, 35], label: '변위 [µm]' },
      series: [
        { x: fitDeg, y: fit, color: 'c2', width: 1.8, label: '뽑은 1X' },
        { x: angle, y: xRev, color: 'c1', kind: 'dots', radius: 2.4, label: '그 바퀴의 샘플' },
      ],
      annotations: [{ type: 'vline', x: V1.lag, color: 'muted', dash: true, label: `φ = ${Math.round(V1.lag)}°` }],
      legend: true,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 4: 기록 A — 잰 그대로와 slow roll 벡터를 뺀 것
const rpmMax = REVIEW.rpm0 * 1.02;
export const compFig: FigureSpec = {
  id: 'fig-p11-3-4',
  caption: `그림 4. 기록 A를 다시 그린 Bode(50 rpm 칸). 회색 — 잰 그대로: 200 ~ 500 rpm에서도 1X가 ${fmt(pp(A.sr.amp), 2)} µm p-p ∠${Math.round(A.sr.lag)}°(런아웃)이고 봉우리는 ${fmt(A.sRaw.peakRpm, 4)} rpm ${fmt(pp(A.sRaw.peakAmp), 3)} µm p-p. 파랑 — 그 벡터를 뺀 것: 저속에서 0으로 시작해 ${fmt(A.sComp.peakRpm, 4)} rpm ${fmt(pp(A.sComp.peakAmp), 3)} µm p-p 봉우리, Half-power AF ${fmt(A.sComp.af!, 3)}. 아래 위상도 보상한 쪽이 저속 ${Math.round(at(A.comp, 1500).lag)}°에서 시작해 봉우리를 지나며 약 180° 늦어집니다.`,
  panels: [
    {
      height: 140,
      x: { range: [0, rpmMax], label: '회전수 [rpm]' },
      y: { range: [0, 85], label: '1X [µm p-p]' },
      series: [
        { x: A.bins.map((p) => p.rpm), y: A.bins.map((p) => pp(p.amp)), color: 'muted', width: 1.6, label: '잰 그대로' },
        { x: A.comp.map((p) => p.rpm), y: A.comp.map((p) => pp(p.amp)), color: 'c1', width: 1.8, label: 'slow roll 벡터를 뺌' },
      ],
      annotations: [{ type: 'band', x1: 200, x2: 500, color: 'muted', label: 'slow roll' }],
      legend: true,
    },
    {
      height: 120,
      x: { range: [0, rpmMax], label: '회전수 [rpm]' },
      y: { range: [0, 360], label: '지연각 [°]', ticks: [0, 90, 180, 270, 360] },
      series: [
        { x: A.bins.map((p) => p.rpm), y: A.bins.map((p) => p.lag), color: 'muted', kind: 'dots', radius: 1.8 },
        { x: A.comp.filter((p) => p.rpm > 600).map((p) => p.rpm), y: A.comp.filter((p) => p.rpm > 600).map((p) => p.lag), color: 'c1', kind: 'dots', radius: 1.8 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 5: 기록 B의 캐스케이드 0 ~ 250 Hz
const CB = cascadeRows(B.rec.x, B.rec.fs, B.rep.times, 4096, 60, 250);
const db = (a: number) => 20 * Math.log10(Math.max(2 * a, 1e-3));
const zMax = Math.max(...CB.rows.flatMap((r) => Array.from(r.amp, db)));
const df = CB.freq[1] - CB.freq[0];
const cx = Array.from({ length: CB.freq.length + 1 }, (_, k) => Math.max(0, (k - 0.5) * df));
const cy = CB.rows.map((r, m) => (m === 0 ? Math.max(0, r.rpm - (CB.rows[1].rpm - r.rpm) / 2) : (CB.rows[m - 1].rpm + r.rpm) / 2));
cy.push(CB.rows[CB.rows.length - 1].rpm + (CB.rows[CB.rows.length - 1].rpm - CB.rows[CB.rows.length - 2].rpm) / 2);
export const cascadeFig: FigureSpec = {
  id: 'fig-p11-3-5',
  caption: `그림 5. 기록 B를 4096점 창(0.8초)마다 스펙트럼으로 바꿔 회전수 순으로 쌓은 캐스케이드(진할수록 큼, 가장 큰 값 아래 40 dB까지). 비스듬한 진한 줄이 1X, 그 오른쪽의 옅은 줄은 2X(런아웃 2X)입니다. 1X 아래 성분이나 회전수와 무관한 세로 줄은 없습니다 — 복기할 때 Bode만 보지 않고 캐스케이드로 "다른 성분은 없었나"를 함께 확인합니다.`,
  panels: [
    {
      height: 200,
      x: { range: [0, 250], label: '주파수 [Hz]' },
      y: { range: [cy[0], cy[cy.length - 1]], label: '회전수 [rpm]' },
      series: [],
      heatmap: { x: cx, y: cy, z: CB.rows.map((r) => Array.from(r.amp, db)), zRange: [zMax - 40, zMax], levels: 8, color: 'c1', legend: '크기 [dB re 1 µm p-p]' },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 6: 1년 전(A)과 이번(B) — 보상한 Bode와 Polar
const pxy = (a: number, lag: number): [number, number] => [a * Math.sin(lag * RAD), a * Math.cos(lag * RAD)];
const ring = (r: number) => {
  const t = Array.from({ length: 121 }, (_, i) => i * 3);
  return { x: t.map((d) => r * Math.sin(d * RAD)), y: t.map((d) => r * Math.cos(d * RAD)) };
};
const polarOf = (pts: readonly RevVector[]) => {
  const p = pts.filter((q) => q.rpm >= 600).map((q) => pxy(pp(q.amp), q.lag));
  return { x: p.map((q) => q[0]), y: p.map((q) => q[1]) };
};
const PA = polarOf(A.comp);
const PB = polarOf(B.comp);
const A3000 = at(A.comp, 3000);
const B3000 = at(B.comp, 3000);
export const compareFig: FigureSpec = {
  id: 'fig-p11-3-6',
  caption: `그림 6. slow roll 벡터를 뺀 두 기록. 위 — 봉우리가 1년 전(파랑) ${fmt(A.sComp.peakRpm, 4)} rpm → 이번(주황) ${fmt(B.sComp.peakRpm, 4)} rpm으로 내려왔고, 크기는 ${pp(A.sComp.peakAmp).toFixed(1)} → ${pp(B.sComp.peakAmp).toFixed(1)} µm p-p로 오히려 작아졌습니다. 최고 회전수의 1X는 ${fmt(pp(top(A.comp).amp), 3)} → ${fmt(pp(top(B.comp).amp), 3)} µm p-p로 거의 같습니다. 가운데 — 3000 rpm의 지연각이 ${Math.round(A3000.lag)}° → ${Math.round(B3000.lag)}°로 커졌습니다. 아래 — Polar(0° 위, 지연은 시계 방향, 600 rpm부터): B의 원이 조금 작고, 같은 회전수에서 더 많이 돌아가 있습니다.`,
  panels: [
    {
      height: 130,
      x: { range: [0, rpmMax], label: '회전수 [rpm]' },
      y: { range: [0, 80], label: '1X [µm p-p]' },
      series: [
        { x: A.comp.map((p) => p.rpm), y: A.comp.map((p) => pp(p.amp)), color: 'c1', width: 1.8, label: 'A 1년 전' },
        { x: B.comp.map((p) => p.rpm), y: B.comp.map((p) => pp(p.amp)), color: 'c2', width: 1.8, label: 'B 이번' },
      ],
      legend: true,
    },
    {
      height: 110,
      x: { range: [0, rpmMax], label: '회전수 [rpm]' },
      y: { range: [0, 360], label: '지연각 [°]', ticks: [0, 90, 180, 270, 360] },
      series: [
        { x: A.comp.filter((p) => p.rpm > 600).map((p) => p.rpm), y: A.comp.filter((p) => p.rpm > 600).map((p) => p.lag), color: 'c1', kind: 'dots', radius: 1.8 },
        { x: B.comp.filter((p) => p.rpm > 600).map((p) => p.rpm), y: B.comp.filter((p) => p.rpm > 600).map((p) => p.lag), color: 'c2', kind: 'dots', radius: 1.8 },
      ],
      annotations: [{ type: 'vline', x: 3000, color: 'muted', dash: true, label: '3000 rpm' }],
    },
    {
      frame: false,
      height: 280,
      x: { range: [-215, 215] },
      y: { range: squareYRange([-215, 215], 280, -86) },
      series: [
        ...[20, 40, 60, 80].map((r): FigSeries => ({ ...ring(r), color: 'muted', width: 0.6 })),
        { x: [-84, 84], y: [0, 0], color: 'muted', width: 0.6 },
        { x: [0, 0], y: [-84, 84], color: 'muted', width: 0.6 },
        { ...PA, color: 'c1', width: 1.6 },
        { ...PB, color: 'c2', width: 1.6 },
      ],
      annotations: [text(0, 86, '0°', { color: 'muted' }), text(88, -3, '90°', { anchor: 'start', color: 'muted' }), ...[20, 40, 60, 80].map((r): FigAnnotation => text(-2, r + 2, `${r}`, { anchor: 'end', color: 'muted' }))],
    },
  ],
};

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p11-3.test.ts`) */
export const P113_VALUES = {
  missRpm: RPM_MISS,
  dipRpm: RPM_DIP,
  rev: { rpm: V1.rpm, ampPP: pp(V1.amp), lag: V1.lag, samples: j1 - j0 + 1 },
  A: { srPP: pp(A.sr.amp), srLag: A.sr.lag, rawPeakRpm: A.sRaw.peakRpm, rawPeakPP: pp(A.sRaw.peakAmp), peakRpm: A.sComp.peakRpm, peakPP: pp(A.sComp.peakAmp), af: A.sComp.af, rawTopPP: pp(top(A.bins).amp), topPP: pp(top(A.comp).amp), lag3000: A3000.lag, pulses: A.raw.times.length },
  B: { srPP: pp(B.sr.amp), srLag: B.sr.lag, rawPeakRpm: B.sRaw.peakRpm, rawPeakPP: pp(B.sRaw.peakAmp), peakRpm: B.sComp.peakRpm, peakPP: pp(B.sComp.peakAmp), af: B.sComp.af, rawTopPP: pp(top(B.bins).amp), topPP: pp(top(B.comp).amp), lag3000: B3000.lag, pulses: B.raw.times.length, filled: B.rep.filled, removed: B.rep.removed },
  notchSamples: (REVIEW.notchDeg / 360 / (REVIEW.rpm0 / 60)) * REVIEW.fs,
};
