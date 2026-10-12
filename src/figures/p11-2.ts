/**
 * P11-2 "공개 데이터셋 실습" 본문 그림 (빌드 시 계산, D-026).
 * 공개 데이터 파일은 저장소에 넣지 않으므로(D-052) 그림은 모두 CWRU 시험대를 흉내 낸 합성 예시(`lib/datafile/example.ts`)를
 * 랩(LAB-DATA-01)과 같은 순서(`runPipeline`)로 계산한다. 그림이 인용하는 숫자는 datafile.test.ts가 고정한다.
 */
import type { FigAnnotation, FigColor, FigPanel, FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { kurtogramGrid, type Kurtogram } from '../lib/dsp/envelope';
import { floorOf, runPipeline, type Pipeline } from '../lib/datafile/analysis';
import { EXAMPLE, exampleRates, exampleSignal } from '../lib/datafile/example';
import { CWRU_DE } from '../lib/datafile/index';

const fmt = formatNumber;
const FS = EXAMPLE.fs;
const RPM = EXAMPLE.rpm;
const FR = RPM / 60;
const RATES = exampleRates(FR);

const run = (kind: Parameters<typeof exampleSignal>[0], band?: [number, number], fs: number = FS) => runPipeline(exampleSignal(kind).de, fs, RPM, CWRU_DE, { band });
const score = (p: Pipeline, key: string) => p.scores.find((s) => s.key === key)!;

const B = run('outer');
const B_LOW = run('outer', [300, 900]);
const B_WRONG = run('outer', undefined, 48000);
const C = run('inner');
const D = run('ball');
const E = run('spiky');
const E_MAN = run('spiky', [2500, 4500]);

/** x 구간만 남긴 선 */
function clip(freq: ArrayLike<number>, amp: ArrayLike<number>, x1: number, x2: number, f: (v: number) => number = (v) => v) {
  const x: number[] = [];
  const y: number[] = [];
  for (let k = 0; k < freq.length; k++) if (freq[k] >= x1 && freq[k] <= x2) {
    x.push(freq[k]);
    y.push(f(amp[k]));
  }
  return { x, y };
}
const dB = (v: number) => 20 * Math.log10(Math.max(v, 1e-6));
const peakNear = (freq: ArrayLike<number>, amp: ArrayLike<number>, f: number, tol: number) => {
  let best = { f, a: 0 };
  for (let k = 0; k < freq.length; k++) if (Math.abs(freq[k] - f) <= tol && amp[k] > best.a) best = { f: freq[k], a: amp[k] };
  return best;
};
const box = (x1: number, x2: number, y1: number, y2: number, label?: string, color: FigColor = 'muted'): FigAnnotation => ({ type: 'rect', x1, x2, y1, y2, label, color });
const text = (x: number, y: number, t: string, o: { bold?: boolean; color?: FigColor; anchor?: 'start' | 'middle' | 'end' } = {}): FigAnnotation => ({ type: 'text', x, y, text: t, anchor: o.anchor ?? 'middle', bold: o.bold, color: o.color });

/** 결함 자리 표시: 계산값의 1 · 2 · 3배 점선 */
const marks = (f: number, label: string, color: FigColor, fMax: number, n = 3): FigAnnotation[] =>
  Array.from({ length: n }, (_, i) => (i + 1) * f)
    .filter((x) => x <= fMax)
    .map((x, i): FigAnnotation => ({ type: 'vline', x, color, dash: true, label: i === 0 ? label : `${i + 1}×` }));

// ─────────────────────────────────────────────────────────────────────────────
// 그림 1: CWRU 시험대 (공식 페이지의 설명을 그린 도식 — 치수 비율은 맞추지 않음)
export const rig: FigureSpec = {
  id: 'fig-p11-2-1',
  caption:
    '그림 1. CWRU 베어링 시험대의 구성(공식 페이지 설명을 도식으로 그림, 크기 비율은 맞추지 않음). 왼쪽 2 hp 전동기의 양쪽 베어링 — 구동측(DE, 6205)과 팬측(FE, 6203) — 중 하나에 방전 가공(EDM)으로 작은 구멍 하나를 내고, 하우징 12시 자리의 가속도계(파랑)로 잽니다. 오른쪽 동력계로 부하를 0 ~ 3 hp로 바꾸면 회전수가 1797 → 1730 rpm으로 조금씩 내려갑니다. 회전수는 가운데 토크 변환기·엔코더로 읽어 손으로 적었습니다.',
  panels: [
    {
      frame: false,
      height: 190,
      x: { range: [0, 100] },
      y: { range: [0, 100] },
      series: [],
      annotations: [
        { type: 'ground', x1: 2, y1: 22, x2: 98, y2: 22, side: 'right' },
        box(6, 40, 34, 70),
        text(23, 55, '전동기', { bold: true }),
        text(23, 44, '2 hp'),
        { type: 'circle', x: 9.5, y: 52, r: 9, fill: true, color: 'warn' },
        { type: 'circle', x: 36.5, y: 52, r: 9, fill: true, color: 'warn' },
        text(9.5, 27, 'FE 6203', { color: 'warn' }),
        text(36.5, 27, 'DE 6205', { color: 'warn' }),
        box(7.5, 11.5, 70, 77, undefined, 'c1'),
        box(34.5, 38.5, 70, 77, undefined, 'c1'),
        text(9.5, 86, '가속도계 FE', { color: 'c1' }),
        text(36.5, 86, '가속도계 DE', { color: 'c1' }),
        { type: 'line', x1: 40, y1: 52, x2: 76, y2: 52, color: 'text', width: 3 },
        box(50, 63, 42, 62),
        text(56.5, 70, '토크 변환기', {}),
        text(56.5, 32, '엔코더'),
        box(76, 95, 30, 74),
        text(85.5, 55, '동력계', { bold: true }),
        text(85.5, 44, '부하 0 ~ 3 hp'),
        box(20, 24, 22, 27, undefined, 'c1'),
        text(22, 12, '받침 BA (일부 기록)', { color: 'c1' }),
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 2: f_s 확인 — 1X가 계산한 자리에 있나
const R_1X = peakNear(B.spectrum.freq, B.spectrum.amp, FR, 1.5);
const W_1X = peakNear(B_WRONG.spectrum.freq, B_WRONG.spectrum.amp, 4 * FR, B_WRONG.spectrum.df * 1.5);
export const fsCheck: FigureSpec = {
  id: 'fig-p11-2-2',
  caption: `그림 2. 같은 기록(합성 예시 B, 12 kHz로 기록)의 평균 스펙트럼 0 ~ 200 Hz. 위 — f_s를 12 kHz로 맞게 넣으면 회전수(${RPM} rpm)로 계산한 1X 자리 ${fmt(FR, 4)} Hz(회색 점선)에 줄(${fmt(R_1X.a * 1000, 3)} mg rms)이 서고 2X도 제자리에 있습니다. 아래 — 48 kHz로 잘못 넣으면 모든 주파수가 4배로 읽혀 1X 자리는 비고, 같은 줄이 ${fmt(W_1X.f, 4)} Hz 근처(4 × ${fmt(FR, 4)} = ${fmt(4 * FR, 4)} Hz, 주황)에 섭니다. f_s를 모르는 파일은 이렇게 1X로 먼저 확인합니다.`,
  panels: [
    {
      title: 'f_s = 12 kHz (맞게 넣음)',
      height: 120,
      x: { range: [0, 200], label: '주파수 [Hz]' },
      y: { range: [0, 9], label: 'mg rms' },
      series: [{ ...clip(B.spectrum.freq, B.spectrum.amp, 0, 200, (v) => v * 1000), color: 'c1', width: 1.3 }],
      annotations: [
        { type: 'vline', x: FR, color: 'muted', dash: true, label: '1X 계산' },
        { type: 'vline', x: 2 * FR, color: 'muted', dash: true, label: '2X' },
      ],
    },
    {
      title: 'f_s = 48 kHz (잘못 넣음)',
      height: 120,
      x: { range: [0, 200], label: '주파수 [Hz] (잘못 읽은 눈금)' },
      y: { range: [0, 9], label: 'mg rms' },
      series: [{ ...clip(B_WRONG.spectrum.freq, B_WRONG.spectrum.amp, 0, 200, (v) => v * 1000), color: 'c1', width: 1.3 }],
      annotations: [
        { type: 'vline', x: FR, color: 'muted', dash: true, label: '1X 계산' },
        { type: 'vline', x: 2 * FR, color: 'muted', dash: true, label: '2X' },
        { type: 'vline', x: 4 * FR, color: 'c2', dash: true, label: '실제 1X가 선 자리' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 3: 예시 B의 파형과 평균 스펙트럼
const T_SHOW = 0.1;
const NW = Math.round(T_SHOW * FS);
const WAVE_X = Array.from({ length: NW }, (_, i) => (i / FS) * 1000);
const WAVE_Y = Array.from(B.x.subarray(0, NW));
const PERIOD_MS = 1000 / RATES.bpfo;
const HUMP = peakNear(B.spectrum.freq, B.spectrum.amp, 3300, 900);
const SP_FLOOR = floorOf(B.spectrum.freq, B.spectrum.amp, 50, 1000);
const SP_BPFO = peakNear(B.spectrum.freq, B.spectrum.amp, CWRU_DE.bpfo * FR, 3);
export const steps: FigureSpec = {
  id: 'fig-p11-2-3',
  caption: `그림 3. 합성 예시 B(구동측 가속도, ${fmt(B.n / FS, 3)} s 중 처음 ${T_SHOW * 1000} ms)를 랩의 순서로 본 첫 두 단계. 위 — 파형: 약 ${fmt(PERIOD_MS, 2)} ms마다 짧게 울리고 사라지는 충격이 보이고, 첨도는 ${fmt(B.stats.kurtosis, 2)}로 정규 잡음(3)보다 큽니다. 아래 — 평균 스펙트럼(dB, 0 dB = 1 g rms): BPFO 자리(${fmt(SP_BPFO.f, 4)} Hz)의 줄은 바닥의 ${fmt(SP_BPFO.a / SP_FLOOR, 2)}배로 1X보다도 작습니다. 눈에 띄는 것은 ${fmt(HUMP.f / 1000, 2)} kHz 근처의 넓은 둔덕 — 충격이 울리는 하우징 공진(P5-6)입니다. 주황 띠는 다음 단계의 Kurtogram이 고른 대역입니다.`,
  panels: [
    {
      title: '① 파형',
      height: 130,
      x: { range: [0, T_SHOW * 1000], label: '시각 [ms]' },
      y: { range: [-1, 1], label: 'g' },
      series: [{ x: WAVE_X, y: WAVE_Y, color: 'c1', width: 0.9 }],
      // 충격은 k / BPFO(미끄럼 반영) 시각에 온다 — 4번째와 5번째 사이
      annotations: [{ type: 'arrow', x1: 4 * PERIOD_MS, y1: 0.85, x2: 5 * PERIOD_MS, y2: 0.85, label: `${fmt(PERIOD_MS, 2)} ms`, color: 'text', double: true, labelDy: -6 }],
    },
    {
      title: '② 평균 스펙트럼 (Hann, 50 % 겹침)',
      height: 150,
      x: { range: [0, FS / 2], label: '주파수 [Hz]' },
      y: { range: [-75, -30], label: 'dB re 1 g rms' },
      series: [{ ...clip(B.spectrum.freq, B.spectrum.amp, 0, FS / 2, dB), color: 'c1', width: 0.9 }],
      annotations: [{ type: 'band', x1: B.autoBand[0], x2: B.autoBand[1], color: 'c2', label: 'Kurtogram 대역' }],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 4 · 7: Kurtogram (P5-6 그림 8과 같은 그리기)
function kurtogramPanel(kg: Kurtogram, title: string, zMax: number): FigPanel {
  const grid = kurtogramGrid(kg, FS, 256);
  const NL = kg.levels.length;
  const yPos = (level: number) => NL + 1 - level;
  const yEdges = Array.from({ length: NL + 1 }, (_, i) => i + 0.5);
  const zRows = Array.from({ length: NL }, (_, j) => grid.z[NL - 1 - j]);
  const b = kg.best;
  const edge = ([u1, d1, u2, d2]: readonly [number, number, number, number]): FigAnnotation => ({ type: 'line', x1: b.fc + (u1 * b.bw) / 4, y1: yPos(b.level) + d1, x2: b.fc + (u2 * b.bw) / 4, y2: yPos(b.level) + d2, color: 'text', width: 2 });
  const leftSide = b.fc > FS / 4;
  return {
    title,
    series: [],
    heatmap: { x: grid.x, y: yEdges, z: zRows, zRange: [0, zMax], levels: 6, color: 'c2', legend: 'SK' },
    annotations: [
      ...([
        [-1, -0.5, 1, -0.5],
        [1, -0.5, 1, 0.5],
        [1, 0.5, -1, 0.5],
        [-1, 0.5, -1, -0.5],
      ] as const).map(edge),
      {
        type: 'text',
        x: leftSide ? b.fc - b.bw / 4 - 80 : b.fc + b.bw / 4 + 80,
        y: yPos(b.level) - 0.1,
        text: leftSide ? `가장 큰 SK ${fmt(b.sk, 3)} (${fmt(b.f1, 4)} ~ ${fmt(b.f2, 4)} Hz) →` : `← 가장 큰 SK ${fmt(b.sk, 3)} (${fmt(b.f1, 4)} ~ ${fmt(b.f2, 4)} Hz)`,
        anchor: leftSide ? 'end' : 'start',
        color: 'text',
        bold: true,
      },
    ],
    x: { range: [0, FS / 2], ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000], label: '대역 가운데 주파수 [Hz]' },
    y: { range: [0.5, NL + 0.5], ticks: kg.levels.map(yPos), tickLabels: kg.levels.map((l) => ({ value: yPos(l), label: `${FS / 2 / 2 ** l}` })), label: '대역폭 [Hz]' },
    height: 150,
  };
}

const BB = B.kg.best;
export const kurtogramFig: FigureSpec = {
  id: 'fig-p11-2-4',
  caption: `그림 4. 예시 B의 Kurtogram(P5-6 §7): 세로는 대역폭, 가로는 대역의 가운데 주파수, 진하기는 그 대역 포락선의 SK입니다. 가장 진한 칸은 ${fmt(BB.f1, 4)} ~ ${fmt(BB.f2, 4)} Hz(폭 ${fmt(BB.bw, 4)} Hz, SK ${fmt(BB.sk, 3)})로 3.2 kHz 공진을 담습니다. 레벨이 셋뿐인 것은 대역 폭을 가장 높은 결함 주파수(BPFI ${fmt(CWRU_DE.bpfi * FR, 4)} Hz)의 3배(${fmt(3 * CWRU_DE.bpfi * FR, 3)} Hz)보다 좁게 자르지 않기 때문입니다 — 엔벨로프 스펙트럼에는 대역 폭보다 높은 줄이 설 수 없습니다.`,
  panels: [kurtogramPanel(B.kg, '③ Kurtogram', 4)],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 5: 예시 B의 엔벨로프 — Kurtogram 대역 vs 엉뚱한 대역
const B_O = score(B, 'bpfo');
const B_LO = score(B_LOW, 'bpfo');
const envPanel = (p: Pipeline, title: string, yMax: number, ann: FigAnnotation[], color: FigColor = 'c1'): FigPanel => ({
  title,
  height: 130,
  x: { range: [0, 500], label: '주파수 [Hz]' },
  y: { range: [0, yMax], label: 'g' },
  series: [{ ...clip(p.env.freq, p.env.amp, 0, 500), color, width: 1.1 }],
  annotations: ann,
});
const envMax = (p: Pipeline) => Math.max(...Array.from(p.env.amp).slice(5)) * 1.15;
export const envelopeFig: FigureSpec = {
  id: 'fig-p11-2-5',
  caption: `그림 5. 예시 B의 엔벨로프 스펙트럼, 대역만 바꾼 것. 위 — Kurtogram 대역(${fmt(B.band[0], 4)} ~ ${fmt(B.band[1], 4)} Hz): BPFO 자리에 줄(${fmt(B_O.harmonics[0].f, 4)} Hz, 바닥의 ${fmt(B_O.ratio, 3)}배)과 2 · 3배가 섭니다. 계산값 ${fmt(B_O.f, 4)} Hz보다 1 % 낮은 것은 미끄럼 때문입니다(P7-5). 아래 — 공진을 비켜 간 300 ~ 900 Hz 대역: 같은 줄이 바닥의 ${fmt(B_LO.ratio, 2)}배로 줄고 바닥이 들쭉날쭉합니다. 결함이 약한 실측 기록이라면 이 대역에서는 줄이 묻힙니다. 점선은 BPFO 계산값과 그 배수(갈색 주황).`,
  panels: [
    envPanel(B, `④ 엔벨로프 · ${fmt(B.band[0], 4)} ~ ${fmt(B.band[1], 4)} Hz (Kurtogram 대역)`, envMax(B), marks(CWRU_DE.bpfo * FR, 'BPFO', 'warn', 500)),
    envPanel(B_LOW, '엔벨로프 · 300 ~ 900 Hz (공진을 비켜 간 대역)', envMax(B_LOW), marks(CWRU_DE.bpfo * FR, 'BPFO', 'warn', 500)),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 6: 내륜(예시 C)과 볼(예시 D) — 측대역과 FTF
const C_I = score(C, 'bpfi');
const C_O = score(C, 'bpfo');
const D_B = score(D, 'ball');
const D_F = score(D, 'ftf');
const BPFI = CWRU_DE.bpfi * FR;
const BALL = CWRU_DE.ball * FR;
const FTF = CWRU_DE.ftf * FR;
export const innerBallFig: FigureSpec = {
  id: 'fig-p11-2-6',
  caption: `그림 6. 같은 순서로 본 예시 C와 D의 엔벨로프 스펙트럼(각자 Kurtogram 대역). 위(C) — BPFI 자리 ${fmt(C_I.harmonics[0].f, 4)} Hz가 바닥의 ${fmt(C_I.ratio, 3)}배로 서고, 그 양옆 ±1X(${fmt(FR, 4)} Hz, 회색 점선)에 측대역이 붙습니다: 내륜은 축과 함께 돌아 하중 영역을 회전마다 드나들기 때문입니다(P7-5). 아래(D) — 볼 자리(공개 표의 값 = 2×BSF) ${fmt(D_B.harmonics[0].f, 4)} Hz와 FTF ${fmt(D_F.harmonics[0].f, 3)} Hz(보라)가 섭니다: 볼은 케이지와 함께 FTF로 하중 영역을 돕니다. C의 결함 대조 표에서는 BPFO 3배 칸도 바닥의 ${fmt(C_O.harmonics[2].ratio, 2)}배로 크게 나오는데, BPFI 2배(${fmt(2 * C_I.harmonics[0].f, 4)} Hz)가 BPFO 3배 자리(${fmt(3 * CWRU_DE.bpfo * FR, 4)} Hz)의 허용 폭 ±2 % 안에 들어온 우연입니다. BPFO 1배는 ${fmt(C_O.ratio, 2)}배뿐입니다.`,
  panels: [
    envPanel(C, `예시 C · ${fmt(C.band[0], 4)} ~ ${fmt(C.band[1], 4)} Hz`, envMax(C), [
      ...marks(BPFI, 'BPFI', 'warn', 500),
      { type: 'vline', x: BPFI - FR, color: 'muted', dash: true },
      { type: 'vline', x: BPFI + FR, color: 'muted', dash: true, label: '±1X' },
    ]),
    envPanel(D, `예시 D · ${fmt(D.band[0], 4)} ~ ${fmt(D.band[1], 4)} Hz`, envMax(D), [...marks(BALL, '볼', 'warn', 500), { type: 'vline', x: FTF, color: 'c4', dash: true, label: 'FTF' }]),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 그림 7: 가장 충격적인 대역 ≠ 결함 대역 (예시 E)
const EB = E.kg.best;
const E_TOP = Math.max(...E.scores.map((s) => s.ratio));
const E_O = score(E_MAN, 'bpfo');
export const spikyFig: FigureSpec = {
  id: 'fig-p11-2-7',
  caption: `그림 7. 예시 E = 예시 B와 같은 외륜 결함 + 베어링과 상관없는 짧은 튐(5.6 kHz로 울리고 바로 사라짐, 1초에 평균 ${EXAMPLE.spikeRate}번, 무작위 시각). 위 — Kurtogram은 튐이 사는 ${fmt(EB.f1, 4)} ~ ${fmt(EB.f2, 4)} Hz를 SK ${fmt(EB.sk, 3)}으로 고릅니다(외륜 결함이 울리는 대역의 SK는 4 아래). 드문 튐이 촘촘한 결함 충격보다 "더 드물게 튀기" 때문입니다. 가운데 — 그 대역의 엔벨로프는 들쭉날쭉한 바닥뿐이고(세로 눈금이 아래의 약 ${fmt(envMax(E_MAN) / envMax(E), 2)}분의 1), 어느 결함 자리도 바닥의 ${fmt(E_TOP, 2)}배를 넘지 않습니다. 아래 — 스펙트럼의 둔덕을 보고 2.5 ~ 4.5 kHz로 직접 고르면 BPFO가 바닥의 ${fmt(E_O.ratio, 3)}배로 섭니다. 회색 점선은 BPFO 계산값과 그 배수입니다.`,
  panels: [
    kurtogramPanel(E.kg, 'Kurtogram (예시 E)', 34),
    // Kurtogram 색(c2)과 겹치지 않게 결함 자리는 회색 점선. 가운데는 제 눈금 — 같은 눈금이면 바닥만 깔려 0처럼 보인다
    envPanel(E, `엔벨로프 · ${fmt(E.band[0], 4)} ~ ${fmt(E.band[1], 4)} Hz (Kurtogram 대역)`, envMax(E), marks(CWRU_DE.bpfo * FR, 'BPFO', 'muted', 500)),
    envPanel(E_MAN, '엔벨로프 · 2.5 ~ 4.5 kHz (직접 고른 대역)', envMax(E_MAN), marks(CWRU_DE.bpfo * FR, 'BPFO', 'muted', 500)),
  ],
};

/** 본문·캡션이 인용하는 숫자 (figures-p11-2.test.ts가 고정) */
export const P112_VALUES = {
  fr: FR,
  periodMs: PERIOD_MS,
  kurtB: B.stats.kurtosis,
  spBpfoRatio: SP_BPFO.a / SP_FLOOR,
  spBpfoBelow1x: SP_BPFO.a < R_1X.a,
  humpHz: HUMP.f,
  bandB: B.band,
  skB: BB.sk,
  bpfoB: B_O.harmonics[0].f,
  ratioB: B_O.ratio,
  ratioLow: B_LO.ratio,
  wrong1x: W_1X.f,
  innerHz: C_I.harmonics[0].f,
  innerRatio: C_I.ratio,
  innerSb: C_I.sideband,
  cBpfo1: C_O.ratio,
  cBpfo3: C_O.harmonics[2].ratio,
  ballHz: D_B.harmonics[0].f,
  ballRatio: D_B.ratio,
  ftfHz: D_F.harmonics[0].f,
  ftfRatio: D_F.ratio,
  eBand: E.band,
  eSk: EB.sk,
  /** 예시 E에서 외륜 결함이 울리는 칸(1.5 ~ 4.5 kHz)의 SK */
  eResonanceSk: E.kg.rows[0].find((c) => c.f1 === 1500)!.sk,
  eTop: E_TOP,
  eManual: E_O.ratio,
};
