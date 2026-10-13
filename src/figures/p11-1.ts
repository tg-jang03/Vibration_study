/**
 * P11-1 "가상 기계 케이스" 본문 그림 (빌드 시 계산, D-026).
 * 그림은 랩(LAB-CASE-01) 케이스와 다른 예시 기계(`lib/cases/examples.ts`)를 같은 엔진(`lib/cases/engine.ts`)으로 계산한다 —
 * 그림이 랩의 풀이를 미리 보여 주지 않게. 모두 가상의 기계다.
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import * as E from '../lib/cases/engine';
import * as X from '../lib/cases/examples';

const fmt = formatNumber;
const RAD = Math.PI / 180;

// ── 도식 도우미 (x·y 범위 [0, 100]) ──
const box = (x1: number, x2: number, y1: number, y2: number, color: FigColor = 'muted'): FigAnnotation => ({ type: 'rect', x1, x2, y1, y2, color });
const text = (x: number, y: number, t: string, o: { bold?: boolean; color?: FigColor; anchor?: 'start' | 'middle' | 'end' } = {}): FigAnnotation => ({ type: 'text', x, y, text: t, anchor: o.anchor ?? 'middle', bold: o.bold, color: o.color });
const arrow = (x1: number, y1: number, x2: number, y2: number, label?: string, color: FigColor = 'muted'): FigAnnotation => ({ type: 'arrow', x1, y1, x2, y2, label, color, double: false });

/** 측정 → 표시 스펙트럼 (엔진과 같은 계산) */
function spectrum(id: string, m: E.CaseMachine, s: E.Source[], st: E.Settings, unit: E.SpecUnit) {
  const acq = E.acquire(id, m, s, st);
  const sp = E.caseSpectrum(acq, unit, st.fMax);
  return { acq, freq: Array.from(sp.freq), amp: Array.from(sp.amp), overall: E.overall(acq, unit, st.fMax) };
}
const near = (sp: { freq: number[]; amp: number[] }, f: number, tol: number) => E.peakNear(sp.freq, sp.amp, f, tol);
/** x 구간 [x1, x2]만 남긴 선 */
const clip = (sp: { freq: number[]; amp: number[] }, x1: number, x2: number) => {
  const i = sp.freq.map((f, k) => (f >= x1 && f <= x2 ? k : -1)).filter((k) => k >= 0);
  return { x: i.map((k) => sp.freq[k]), y: i.map((k) => sp.amp[k]) };
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 1: 진단의 순서
const STEPS = [
  { x: 17, y: 75, t: '① 보고 읽기', s: '무엇이 · 언제부터 · 어디서' },
  { x: 50, y: 75, t: '② 기계 구성표', s: '회전수 · 극수 · 요소 수' },
  { x: 83, y: 75, t: '③ 주파수 지도', s: '후보 자리 계산 (P7-1)' },
  { x: 83, y: 25, t: '④ 측정 설정', s: '센서 · f_max · Δf · AAF (P2-9)' },
  { x: 50, y: 25, t: '⑤ 자료 고르기', s: '가를 질문에 맞는 플롯' },
  { x: 17, y: 25, t: '⑥ 결론', s: '증거 · 반증 · 확신도 (P10-3)' },
];
export const flow: FigureSpec = {
  id: 'fig-p11-1-1',
  caption:
    '그림 1. 이 페이지에서 케이스를 푸는 순서. ① ~ ③은 측정 전에 책상에서 하는 일이고, ④ ~ ⑤는 가설을 가를 자료를 고르는 일입니다(파랑). ⑤에서 후보가 갈리지 않으면 설정을 바꿔 ④로 돌아갑니다. ⑥에서는 원인 하나만이 아니라 반증한 후보와 확신도, 다음 확인까지 씁니다.',
  panels: [
    {
      frame: false,
      height: 200,
      x: { range: [0, 100] },
      y: { range: [0, 100] },
      series: [],
      annotations: [
        ...STEPS.flatMap((s, i): FigAnnotation[] => {
          const hi = i === 3 || i === 4;
          return [box(s.x - 14.5, s.x + 14.5, s.y - 13, s.y + 13, hi ? 'c1' : 'muted'), text(s.x, s.y + 3, s.t, { bold: true, color: hi ? 'c1' : undefined }), text(s.x, s.y - 6.5, s.s)];
        }),
        arrow(31.5, 75, 35.5, 75),
        arrow(64.5, 75, 68.5, 75),
        arrow(83, 62, 83, 38),
        arrow(68.5, 21, 64.5, 21),
        arrow(35.5, 25, 31.5, 25),
        arrow(64.5, 31, 68.5, 31, undefined, 'c1'),
        text(66.5, 45, '못 가르면 다시 잰다', { color: 'c1' }),
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 2: 주파수 지도 (순환수 펌프 예시)
const BRG_MARKS = E.frequencyMarks(X.EX_BRG);
const MARK_STYLE: Record<string, { color: FigColor; h: number; group: string; anchor?: 'start' | 'end' }> = {
  FTF: { color: 'warn', h: 0.45, group: '구름베어링', anchor: 'end' },
  '½X': { color: 'c1', h: 0.8, group: '축 (회전수의 배수)', anchor: 'start' },
  '1X': { color: 'c1', h: 1.0, group: '축 (회전수의 배수)' },
  '2X': { color: 'c1', h: 1.0, group: '축 (회전수의 배수)' },
  '3X': { color: 'c1', h: 0.6, group: '축 (회전수의 배수)', anchor: 'end' },
  BPFO: { color: 'warn', h: 1.0, group: '구름베어링', anchor: 'start' },
  '2×LF': { color: 'c4', h: 1.0, group: '전기' },
  '2×BSF': { color: 'warn', h: 0.42, group: '구름베어링', anchor: 'end' },
  BPFI: { color: 'warn', h: 0.72, group: '구름베어링', anchor: 'end' },
};
const markStyle = (label: string) => MARK_STYLE[label] ?? { color: 'c3' as FigColor, h: 1.06, group: '유체 (베인 통과)', anchor: 'end' as const };
/** 지도 글자: 날개 통과는 펌프라 베인 통과로 부른다 */
const markText = (label: string) => label.replace('날개 통과', '베인 통과');
const groups = ['축 (회전수의 배수)', '구름베어링', '전기', '유체 (베인 통과)'];
const BRG_FR = X.EX_BRG.rpm / 60;
export const map: FigureSpec = {
  id: 'fig-p11-1-2',
  caption: `그림 2. 예시 순환수 펌프(4극 전동기 ${X.EX_BRG.rpm} rpm = ${fmt(BRG_FR, 4)} Hz, 볼 8개 베어링, 베인 5개)의 주파수 지도. 측정하기 전에 구성표만으로 계산합니다. 파랑 = 회전수의 배수, 갈색 주황 = 구름베어링(P1-8), 보라 = 전기(2×LF), 초록 = 베인 통과. BPFI(${fmt(BRG_MARKS.find((k) => k.label === 'BPFI')!.f, 4)} Hz)와 2×BSF(${fmt(BRG_MARKS.find((k) => k.label === '2×BSF')!.f, 4)} Hz), 베인 통과(${fmt(5 * BRG_FR, 4)} Hz)가 몇 Hz 안에 몰려 있어, 이 근처의 줄은 Δf가 촘촘해야 어느 자리인지 가릴 수 있습니다.`,
  panels: [
    {
      height: 210,
      x: { range: [0, 160], label: '주파수 [Hz]' },
      y: { range: [0, 1.32], ticks: 'none' },
      series: groups.map((g): FigSeries => {
        const ks = BRG_MARKS.filter((k) => markStyle(k.label).group === g);
        return { x: ks.map((k) => k.f), y: ks.map((k) => markStyle(k.label).h), kind: 'stem', color: markStyle(ks[0]?.label ?? '').color, label: g, radius: 3 };
      }),
      annotations: BRG_MARKS.map((k): FigAnnotation => {
        const st = markStyle(k.label);
        const anchor = st.anchor ?? 'middle';
        return { type: 'text', x: k.f, y: st.h + 0.06, text: `${markText(k.label)} ${fmt(k.f, 4)}`, anchor, dx: anchor === 'start' ? 4 : anchor === 'end' ? -4 : 0, color: st.color };
      }),
      legend: true,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 3: 속도 스펙트럼으로는 안 보이는 외륜 결함 — f_max와 엔벨로프 대역
const BRG_B = E.bearingFreqs(X.EX_BRG, BRG_FR);
const V1K = spectrum('ex-brg', X.EX_BRG, X.EX_BRG_SRC, { sensor: 'V', fMax: 1000, lines: 800, aaf: true }, 'vel');
const A5K = spectrum('ex-brg', X.EX_BRG, X.EX_BRG_SRC, { sensor: 'V', fMax: 5000, lines: 1600, aaf: true }, 'acc');
const ENV = E.caseEnvelope(A5K.acq, E.ENV_BANDS[2], 500, 5000, true)!;
const ENV_SP = { freq: Array.from(ENV.freq), amp: Array.from(ENV.amp) };
const KURT = E.caseWaveform(A5K.acq, 'acc', 0.1).kurt;
export const envelopeFig: FigureSpec = {
  id: 'fig-p11-1-3',
  caption: `그림 3. 같은 펌프를 세 가지로 본 것(수직). 위 — 보고된 설정(속도, f_max 1 kHz): 1X ${fmt(near(V1K, BRG_FR, 1).a, 2)} · 베인 통과 ${fmt(near(V1K, 5 * BRG_FR, 1).a, 2)} mm/s 말고는 바닥뿐이고, BPFO(${fmt(BRG_B.bpfo, 4)} Hz, 갈색 주황 점선) 자리는 ${fmt(near(V1K, BRG_B.bpfo, 1).a, 2)} mm/s입니다. 가운데 — f_max를 5 kHz로 올려 가속도로 보면 3 ~ 3.5 kHz에 넓은 둔덕이 섭니다(하우징 공진이 충격에 울리는 자리). 아래 — 그 둔덕을 담는 2.5 ~ 4.5 kHz 대역의 엔벨로프: BPFO와 그 하모닉(${fmt(near(ENV_SP, BRG_B.bpfo, 1.6).a, 2)} g, 점선)이 또렷합니다.`,
  panels: [
    {
      title: '속도 스펙트럼 · f_max 1 kHz · 800 라인 (보고된 설정)',
      height: 130,
      x: { range: [0, 400], label: '주파수 [Hz]' },
      y: { range: [0, 0.9], label: 'mm/s rms' },
      series: [{ ...clip(V1K, 0, 400), color: 'c1', width: 1.2 }],
      annotations: [{ type: 'vline', x: BRG_B.bpfo, color: 'warn', dash: true, label: 'BPFO' }],
    },
    {
      title: '가속도 스펙트럼 · f_max 5 kHz · 1600 라인',
      height: 130,
      x: { range: [0, 5000], label: '주파수 [Hz]' },
      y: { range: [0, 0.045], label: 'g rms' },
      series: [{ x: A5K.freq, y: A5K.amp, color: 'c1', width: 1 }],
      annotations: [{ type: 'band', x1: 2500, x2: 4500, color: 'c2', label: '엔벨로프 대역' }],
    },
    {
      title: '엔벨로프 스펙트럼 · 2.5 ~ 4.5 kHz 대역',
      height: 130,
      x: { range: [0, 500], label: '주파수 [Hz]' },
      y: { range: [0, 0.2], label: 'g' },
      series: [{ ...clip(ENV_SP, 0, 500), color: 'c2', width: 1.2 }],
      annotations: [1, 2, 3, 4, 5].map((h): FigAnnotation => ({ type: 'vline', x: h * BRG_B.bpfo, color: 'warn', dash: true, label: h === 1 ? 'BPFO' : `${h}×` })),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 4: 분해능 — 2X와 2×LF
const R_COARSE = spectrum('ex-2lf', X.EX_2LF, X.EX_2LF_SRC, { sensor: 'V', fMax: 1000, lines: 400, aaf: true }, 'vel');
const R_FINE = spectrum('ex-2lf', X.EX_2LF, X.EX_2LF_SRC, { sensor: 'V', fMax: 200, lines: 1600, aaf: true }, 'vel');
const F2X = (2 * X.EX_2LF.rpm) / 60;
export const resolutionFig: FigureSpec = {
  id: 'fig-p11-1-4',
  caption: `그림 4. 예시 2극 전동기 팬(${X.EX_2LF.rpm} rpm)의 수직 스펙트럼, 110 ~ 130 Hz만 확대. 위 — f_max 1 kHz · 400 라인(Δf 2.5 Hz): 120 Hz 근처에 줄 하나(${fmt(near(R_COARSE, 120, 2).a, 3)} mm/s)로 보입니다. 아래 — f_max 200 Hz · 1600 라인(Δf 0.125 Hz): 2X(${F2X.toFixed(1)} Hz, ${fmt(near(R_FINE, F2X, 0.07).a, 2)} mm/s)와 2×LF(120.0 Hz, ${fmt(near(R_FINE, 120, 0.07).a, 2)} mm/s)가 갈라집니다. 두 줄의 간격 ${(120 - F2X).toFixed(1)} Hz보다 Δf가 몇 배 촘촘해야 합니다(P2-4).`,
  panels: [
    {
      title: 'f_max 1 kHz · 400 라인 (Δf 2.5 Hz)',
      height: 130,
      x: { range: [110, 130], label: '주파수 [Hz]' },
      y: { range: [0, 1.8], label: 'mm/s rms' },
      series: [{ ...clip(R_COARSE, 110, 130), color: 'c1', width: 1.4 }, { ...clip(R_COARSE, 110, 130), color: 'c1', kind: 'dots', radius: 2.5 }],
    },
    {
      title: 'f_max 200 Hz · 1600 라인 (Δf 0.125 Hz)',
      height: 130,
      x: { range: [110, 130], label: '주파수 [Hz]' },
      y: { range: [0, 1.8], label: 'mm/s rms' },
      series: [{ ...clip(R_FINE, 110, 130), color: 'c1', width: 1.4 }],
      annotations: [text(F2X - 0.4, near(R_FINE, F2X, 0.07).a + 0.12, '2X', { anchor: 'end', color: 'c1' }), text(120.4, near(R_FINE, 120, 0.07).a + 0.05, '2×LF', { anchor: 'start', color: 'c4' })],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 5: AAF가 없으면 높은 성분이 접혀 들어온다
const AL_FR = X.EX_ALIAS.rpm / 60;
const AL_GMF = 115 * AL_FR;
const AL_OFF = spectrum('ex-alias', X.EX_ALIAS, X.EX_ALIAS_SRC, { sensor: 'H', fMax: 1000, lines: 800, aaf: false }, 'vel');
const AL_ON = spectrum('ex-alias', X.EX_ALIAS, X.EX_ALIAS_SRC, { sensor: 'H', fMax: 1000, lines: 800, aaf: true }, 'vel');
const AL_HI = spectrum('ex-alias', X.EX_ALIAS, X.EX_ALIAS_SRC, { sensor: 'H', fMax: 5000, lines: 3200, aaf: true }, 'vel');
const AL_FAKE = Math.abs(AL_GMF - 2560);
export const aliasFig: FigureSpec = {
  id: 'fig-p11-1-5',
  caption: `그림 5. 예시 증속기(전동기 축 ${X.EX_ALIAS.rpm} rpm, 115이빨 대기어)의 수평 속도 스펙트럼. 위 — AAF 없이 f_max 1 kHz(f_s 2560 Hz)로 잼: ${fmt(near(AL_OFF, AL_FAKE, 1).a, 2)} mm/s의 큰 줄이 ${fmt(AL_FAKE, 4)} Hz(= ${fmt(AL_FAKE / AL_FR, 3)}X)에 섭니다. 가운데 — 같은 설정에 AAF만 켬: 그 줄이 없습니다. 아래 — f_max 5 kHz: 진짜 줄은 GMF ${fmt(AL_GMF, 5)} Hz(${fmt(near(AL_HI, AL_GMF, 1).a, 2)} mm/s)입니다. ${fmt(AL_GMF, 5)} − 2560 = ${fmt(AL_FAKE, 4)} Hz로 접혔고, 속도로 바꿀 때 접힌 자리의 낮은 주파수로 나누어 ${fmt(near(AL_OFF, AL_FAKE, 1).a / near(AL_HI, AL_GMF, 1).a, 2)}배로 부풀었습니다.`,
  panels: [
    { title: 'AAF 끔 · f_max 1 kHz', height: 120, x: { range: [0, 1000], label: '주파수 [Hz]' }, y: { range: [0, 10], label: 'mm/s rms' }, series: [{ x: AL_OFF.freq, y: AL_OFF.amp, color: 'warn', width: 1.2 }], annotations: [text(AL_FAKE + 25, near(AL_OFF, AL_FAKE, 1).a - 0.6, '가짜 줄: 기계 주파수 어디에도 없음', { anchor: 'start', color: 'warn' })] },
    { title: 'AAF 켬 · f_max 1 kHz', height: 120, x: { range: [0, 1000], label: '주파수 [Hz]' }, y: { range: [0, 10], label: 'mm/s rms' }, series: [{ x: AL_ON.freq, y: AL_ON.amp, color: 'c1', width: 1.2 }] },
    { title: 'AAF 켬 · f_max 5 kHz', height: 120, x: { range: [0, 5000], label: '주파수 [Hz]' }, y: { range: [0, 1.2], label: 'mm/s rms' }, series: [{ x: AL_HI.freq, y: AL_HI.amp, color: 'c1', width: 1.2 }], annotations: [{ type: 'vline', x: 2560, color: 'muted', dash: true, label: 'f_s = 2560 Hz (위의 측정)' }, text(AL_GMF + 60, 0.9, `GMF ${fmt(AL_GMF, 5)} Hz`, { anchor: 'start', color: 'c1' })] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 6: 근접 프로브의 런아웃 — slow roll 벡터를 빼기 전과 뒤
const RO = E.coastdown(X.EX_RUNOUT, X.EX_RUNOUT_SRC, 'X');
const RO_PEAK = RO.compensated.reduce((b, p, k) => (p.amp > RO.compensated[b].amp ? k : b), 0);
const RO_HOUSING = E.coastdown(X.EX_RUNOUT, X.EX_RUNOUT_SRC, 'H').raw.at(-1)!.amp;
export const runoutFig: FigureSpec = {
  id: 'fig-p11-1-6',
  caption: `그림 6. 예시 압축기(${X.EX_RUNOUT.rpm} rpm)의 코스트다운 1X(X 프로브). 회색 — 잰 그대로: ${RO.slowRoll.rpm} rpm(slow roll)에서 이미 ${fmt(RO.slowRoll.amp, 3)} µm p-p이고 운전점은 ${fmt(RO.raw.at(-1)!.amp, 3)} µm입니다. 파랑 — slow roll 벡터를 뺀 것: 저속에서 0으로 시작해 ${fmt(RO.rpm[RO_PEAK], 3)} rpm 근처 봉우리 ${fmt(RO.compensated[RO_PEAK].amp, 3)} µm, 운전점 ${fmt(RO.compensated.at(-1)!.amp, 3)} µm으로 불평형 응답의 모양입니다. 같은 때 하우징 1X는 ${fmt(RO_HOUSING, 2)} mm/s로 작았습니다.`,
  panels: [
    {
      height: 150,
      x: { range: [0, X.EX_RUNOUT.rpm * 1.02], label: '회전수 [rpm]' },
      y: { range: [0, 60], label: '1X [µm p-p]' },
      series: [
        { x: RO.rpm, y: RO.raw.map((p) => p.amp), color: 'muted', width: 1.6, label: '잰 그대로' },
        { x: RO.rpm, y: RO.compensated.map((p) => p.amp), color: 'c1', width: 1.8, label: 'slow roll 벡터를 뺌' },
      ],
      annotations: [{ type: 'point', x: RO.slowRoll.rpm, y: RO.slowRoll.amp, color: 'muted', label: 'slow roll', dy: -10 }],
      legend: true,
    },
    {
      height: 120,
      x: { range: [0, X.EX_RUNOUT.rpm * 1.02], label: '회전수 [rpm]' },
      y: { range: [0, 360], label: '지연각 [°]', ticks: [0, 90, 180, 270, 360] },
      series: [
        { x: RO.rpm, y: RO.raw.map((p) => p.lag), color: 'muted', width: 1.6 },
        { x: RO.rpm.slice(1), y: RO.compensated.slice(1).map((p) => p.lag), color: 'c1', width: 1.8 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 7: 구조 공진 — 한 방향만 봉우리, 위상 급변, 정지 임팩트 FRF
const RES_FR = X.EX_RES.rpm / 60;
const RES_H = E.coastdown(X.EX_RES, X.EX_RES_SRC, 'H');
const RES_V = E.coastdown(X.EX_RES, X.EX_RES_SRC, 'V');
const RES_PK = RES_H.raw.reduce((b, p, k) => (p.amp > RES_H.raw[b].amp ? k : b), 0);
const RES_FRF = E.impactFrf(X.EX_RES, 100);
const argmaxIn = (a: Float64Array, lo: number, hi: number) => {
  let b = -1;
  for (let k = 0; k < a.length; k++) if (RES_FRF.freq[k] >= lo && RES_FRF.freq[k] <= hi && (b < 0 || a[k] > a[b])) b = k;
  return RES_FRF.freq[b];
};
const RES_FH = argmaxIn(RES_FRF.H, 5, 60);
const RES_FV = argmaxIn(RES_FRF.V, 5, 100);
const RES_PT = E.phaseTable(X.EX_RES, X.EX_RES_SRC, 1);
export const resonanceFig: FigureSpec = {
  id: 'fig-p11-1-7',
  caption: `그림 7. 예시 환기 팬(${X.EX_RES.rpm} rpm = ${fmt(RES_FR, 4)} Hz). 위 — 코스트다운 1X: 수평(파랑)만 ${fmt(RES_H.rpm[RES_PK], 3)} rpm에서 ${fmt(RES_H.raw[RES_PK].amp, 3)} mm/s 봉우리를 만들고 운전점에서도 ${fmt(RES_PT.here.H.amp, 2)} mm/s, 수직(주황)은 ${fmt(RES_PT.here.V.amp, 2)} mm/s로 매끈합니다. 가운데 — 수평 위상은 봉우리를 지나며 ${Math.round(RES_H.raw[3].lag)}° → ${Math.round(RES_H.raw.at(-1)!.lag)}°로 바뀝니다. 아래 — 세워 놓고 친 임팩트 FRF: 수평 ${fmt(RES_FH, 3)} Hz, 수직 ${fmt(RES_FV, 3)} Hz. 수평 고유진동수가 1X(점선) 바로 아래에 있습니다.`,
  panels: [
    {
      height: 130,
      x: { range: [700, 1500], label: '회전수 [rpm]' },
      y: { range: [0, 16], label: '1X [mm/s rms]' },
      series: [
        { x: RES_H.rpm, y: RES_H.raw.map((p) => p.amp), color: 'c1', width: 1.8, label: '수평 H' },
        { x: RES_V.rpm, y: RES_V.raw.map((p) => p.amp), color: 'c2', width: 1.8, label: '수직 V' },
      ],
      legend: true,
    },
    {
      height: 110,
      x: { range: [700, 1500], label: '회전수 [rpm]' },
      y: { range: [0, 360], label: '지연각 [°]', ticks: [0, 90, 180, 270, 360] },
      series: [
        { x: RES_H.rpm, y: RES_H.raw.map((p) => p.lag), color: 'c1', width: 1.8 },
        { x: RES_V.rpm, y: RES_V.raw.map((p) => p.lag), color: 'c2', width: 1.8 },
      ],
    },
    {
      height: 120,
      x: { range: [0, 100], label: '주파수 [Hz]' },
      y: { range: [0, Math.max(...RES_FRF.H) * 1.15], label: '(m/s²)/N' },
      series: [
        { x: Array.from(RES_FRF.freq), y: Array.from(RES_FRF.H), color: 'c1', width: 1.6 },
        { x: Array.from(RES_FRF.freq), y: Array.from(RES_FRF.V), color: 'c2', width: 1.6 },
      ],
      annotations: [{ type: 'vline', x: RES_FR, color: 'muted', dash: true, label: '1X' }],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 8: 정속인데 1X 벡터가 돈다 (Morton형)
const MT = E.trend(X.EX_MORTON, X.EX_MORTON_SRC, 'X');
const MT_AMP = MT.hourly.map((p) => p.amp);
const MT_MIN = Math.min(...MT_AMP);
const MT_MAX = Math.max(...MT_AMP);
const pxy = (a: number, lag: number): [number, number] => [a * Math.sin(lag * RAD), a * Math.cos(lag * RAD)];
const ring = (r: number) => {
  const t = Array.from({ length: 121 }, (_, i) => i * 3);
  return { x: t.map((d) => r * Math.sin(d * RAD)), y: t.map((d) => r * Math.cos(d * RAD)) };
};
const MT_PTS = MT.hourly.map((p) => pxy(p.amp, p.lag));
const MT_BASE = X.EX_MORTON_SRC[0].kind === 'sync' ? X.EX_MORTON_SRC[0].shaft!.X! : [0, 0];
const [MBX, MBY] = pxy(MT_BASE[0], MT_BASE[1]);
export const mortonFig: FigureSpec = {
  id: 'fig-p11-1-8',
  caption: `그림 8. 예시 압축기(${X.EX_MORTON.rpm.toLocaleString('en-US')} rpm 정속)의 12시간 1X(X 프로브, 10분 간격). 위 — 크기가 ${fmt(MT_MIN, 2)} ~ ${fmt(MT_MAX, 2)} µm p-p 사이를 ${X.EX_MORTON_SRC[0].kind === 'sync' ? X.EX_MORTON_SRC[0].thermal!.periodH : 0}시간 주기로 오르내립니다. 아래 — 같은 기록을 Polar(0° 위, 지연각은 시계 방향)로 그리면 1X 벡터가 원점이 아닌 한 점(회색 점 = 기계 벡터, ${MT_BASE[0]} µm∠${MT_BASE[1]}°) 둘레를 돕니다. 회전수·부하가 그대로인데 벡터가 이렇게 돌면 열 휨이 천천히 자리를 옮기는 것을 의심합니다(P8-2).`,
  panels: [
    {
      height: 120,
      x: { range: [-12.2, 0.2], label: '시간 [h] (지금 = 0)' },
      y: { range: [0, 40], label: '1X [µm p-p]' },
      series: [{ x: MT.hours, y: MT_AMP, color: 'c1', width: 1.6 }, { x: MT.hours, y: MT_AMP, color: 'c1', kind: 'dots', radius: 2 }],
    },
    {
      frame: false,
      height: 260,
      x: { range: [-121, 121] },
      y: { range: squareYRange([-121, 121], 260, -46) },
      series: [
        ...[10, 20, 30, 40].map((r): FigSeries => ({ ...ring(r), color: 'muted', width: 0.6 })),
        { x: [-42, 42], y: [0, 0], color: 'muted', width: 0.6 },
        { x: [0, 0], y: [-42, 42], color: 'muted', width: 0.6 },
        { x: MT_PTS.map((p) => p[0]), y: MT_PTS.map((p) => p[1]), color: 'c1', width: 1.4 },
        { x: MT_PTS.map((p) => p[0]), y: MT_PTS.map((p) => p[1]), color: 'c1', kind: 'dots', radius: 2 },
      ],
      annotations: [
        text(0, 42.5, '0°', { color: 'muted' }),
        text(44, -3, '90°', { anchor: 'end', color: 'muted' }),
        ...[10, 20, 30, 40].map((r): FigAnnotation => text(-1.5, r + 1, `${r}`, { anchor: 'end', color: 'muted' })),
        // 라벨은 점 아래, 1X 고리 안쪽 (오른쪽 아래로 두면 고리 선·"지금" 라벨과 겹침)
        { type: 'point', x: MBX, y: MBY, color: 'muted', label: '기계 벡터', dx: -28, dy: 20 },
        { type: 'point', x: MT_PTS.at(-1)![0], y: MT_PTS.at(-1)![1], color: 'c1', label: '지금', dx: 8 },
      ],
    },
  ],
};

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p11-1.test.ts`) */
export const P111_VALUES = {
  brg: { fr: BRG_FR, bpfo: BRG_B.bpfo, bpfi: BRG_B.bpfi, bsf2: BRG_B.bsf2, vane: 5 * BRG_FR, velBpfo: near(V1K, BRG_B.bpfo, 1).a, vel1X: near(V1K, BRG_FR, 1).a, velOverall: V1K.overall, envBpfo: near(ENV_SP, BRG_B.bpfo, 1.6).a, kurt: KURT },
  res2: { coarse: near(R_COARSE, 120, 2).a, f2x: F2X, a2x: near(R_FINE, F2X, 0.07).a, a2lf: near(R_FINE, 120, 0.07).a },
  alias: { fr: AL_FR, gmf: AL_GMF, fake: AL_FAKE, fakeAmp: near(AL_OFF, AL_FAKE, 1).a, onAmp: near(AL_ON, AL_FAKE, 2).a, gmfAmp: near(AL_HI, AL_GMF, 1).a, overallOff: AL_OFF.overall, overallOn: AL_ON.overall },
  runout: { slowRpm: RO.slowRoll.rpm, slow: RO.slowRoll.amp, rawOp: RO.raw.at(-1)!.amp, compOp: RO.compensated.at(-1)!.amp, peakRpm: RO.rpm[RO_PEAK], peak: RO.compensated[RO_PEAK].amp, housing: RO_HOUSING },
  res: { fr: RES_FR, peakRpm: RES_H.rpm[RES_PK], peak: RES_H.raw[RES_PK].amp, h: RES_PT.here.H.amp, v: RES_PT.here.V.amp, vMinusH: E.wrap360(RES_PT.here.V.lag - RES_PT.here.H.lag), lagLow: RES_H.raw[3].lag, lagOp: RES_H.raw.at(-1)!.lag, fH: RES_FH, fV: RES_FV },
  morton: { min: MT_MIN, max: MT_MAX },
};
