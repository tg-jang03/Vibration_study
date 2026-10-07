/**
 * P3-5 "과도 데이터 수집과 보호 시스템" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 기동·수집은 `src/lib/transient.ts`, 알람 논리는 랩(LAB-ALM-01)과 같은 `src/lib/protection.ts`로 계산한다.
 */
import { grid, squareYRange, type FigAnnotation, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { DEFAULT_ALARM, evaluateAlarms, scenarioSignal, type ProtSignal } from '../lib/protection';
import { cascadeLines, countIn, runupResponse, runupRpm, runupTimeAt, RUNUP_ROTOR, sampleByRpm, sampleByTime, smearDemo } from '../lib/transient';

const fmt = formatNumber;
const um = (m: number) => m * 1e6;

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p3-5.test.ts`) */
export const P25_VALUES = (() => {
  const byTime = sampleByTime(10);
  const byRpm = sampleByRpm(10);
  const peakTrue = Math.max(...grid(1800, 2200, 4001).map((r) => runupResponse(r).amp));
  const peakTime = Math.max(...byTime.map((p) => p.amp));
  const smear = smearDemo();
  const peakIn = (a: Float64Array, x: Float64Array, lo: number, hi: number) => Math.max(...Array.from(a).filter((_, k) => x[k] >= lo && x[k] <= hi));
  const runup = scenarioSignal('runup');
  const runNo = evaluateAlarms(runup, DEFAULT_ALARM);
  const runMul = evaluateAlarms(runup, { ...DEFAULT_ALARM, tripMultiply: true });
  return {
    byTime,
    byRpm,
    inBandTime: countIn(byTime, 1900, 2100),
    inBandRpm: countIn(byRpm, 1900, 2100),
    peakTrue,
    peakTime,
    tCrit: runupTimeAt(RUNUP_ROTOR.criticalRpm),
    smear,
    fixed1: peakIn(smear.fixedAmp, smear.fixedFreq, 25, 40),
    fixed2: peakIn(smear.fixedAmp, smear.fixedFreq, 55, 75),
    runup,
    runNo,
    runMul,
  };
})();
const V = P25_VALUES;

// 그림 1 — 언제 저장하나: Δt vs Δrpm
const tLine = grid(0, 330, 661);
export const triggers: FigureSpec = {
  id: 'fig-p3-5-1',
  caption: `그림 1. 예시 기동(300 → 3600 rpm, 임계속도 ${RUNUP_ROTOR.criticalRpm} rpm 둘레의 1500 ~ 2500 rpm은 20 rpm/s로 빨리 지난다)에서 데이터를 저장하는 두 방식. 위: 10초마다 저장하면(주황 점) 기동 전체에서 ${V.byTime.length}점이고, 1900 ~ 2100 rpm(회색 띠) 안에는 ${V.inBandTime}점뿐이다. 10 rpm마다 저장하면 ${V.byRpm.length}점, 같은 구간에 ${V.inBandRpm}점이다. 아래: 두 방식으로 그린 1X 진폭 vs 회전수(Bode, P1-7). 10초마다 모은 주황 선은 봉우리를 건너뛰어 최대를 ${fmt(um(V.peakTime) * 1, 3)} µm pp로 읽는다 — 참 최대 ${fmt(um(V.peakTrue), 3)} µm pp의 ${fmt((V.peakTime / V.peakTrue) * 100, 2)} %. 10 rpm마다 모은 파랑 점은 곡선을 그대로 따라간다.`,
  panels: [
    {
      title: '회전수와 저장 시점',
      series: [
        { x: tLine, y: tLine.map(runupRpm), color: 'c1', width: 2 },
        { x: V.byTime.map((p) => p.t), y: V.byTime.map((p) => p.rpm), kind: 'dots', color: 'c2', radius: 3.5, label: '10초마다' },
      ],
      annotations: [{ type: 'rect', x1: 0, x2: 330, y1: 1900, y2: 2100, color: 'muted' }, { type: 'text', x: 5, y: 2250, text: '1900 ~ 2100 rpm', anchor: 'start', color: 'muted' }],
      x: { range: [0, 330], ticks: [0, 60, 120, 180, 240, 300], label: '시각 [s]' },
      y: { range: [0, 3800], ticks: [0, 1000, 2000, 3000], label: '[rpm]' },
      height: 130,
    },
    {
      title: '1X 진폭 vs 회전수',
      series: [
        { x: grid(300, 3600, 1321), y: grid(300, 3600, 1321).map((r) => um(runupResponse(r).amp)), color: 'muted', width: 1.4, dash: true, label: '참 곡선' },
        { x: V.byRpm.map((p) => p.rpm), y: V.byRpm.map((p) => um(p.amp)), kind: 'dots', color: 'c1', radius: 1.8, label: '10 rpm마다' },
        { x: V.byTime.map((p) => p.rpm), y: V.byTime.map((p) => um(p.amp)), color: 'c2', width: 2, label: '10초마다 (점을 이음)' },
        { x: V.byTime.map((p) => p.rpm), y: V.byTime.map((p) => um(p.amp)), kind: 'dots', color: 'c2', radius: 3.5 },
      ],
      annotations: [],
      x: { range: [300, 3600], ticks: [500, 1000, 1500, 2000, 2500, 3000, 3500], label: '회전수 [rpm]' },
      y: { range: [0, 150], ticks: [0, 50, 100, 150], label: '[µm pp]' },
      height: 170,
      legend: true,
    },
  ],
};

// 그림 2 — 동기 샘플링
const S = V.smear;
const fixedUpTo = S.fixedFreq.findIndex((f) => f > 80);
const ordUpTo = S.order.findIndex((o) => o > 4);
export const syncSampling: FigureSpec = {
  id: 'fig-p3-5-2',
  caption: `그림 2. 회전수가 20 rpm/s로 오르는 임계속도 구간(${S.rpmStart} rpm부터)에서 1X ${fmt(um(2 * 25e-6), 2)} µm pp·2X ${fmt(um(2 * 7.5e-6), 2)} µm pp인 신호를 잰다 (크기는 일정하다고 둔 예). 위: 시간 간격을 고정해(f_s 1280 Hz, 6.4 s) 찍으면 그동안 회전수가 ${S.rpmEndFixed} rpm까지 올라 1X·2X가 여러 bin에 번진다 (P2-4의 스미어링) — 봉우리는 ${fmt(um(2 * V.fixed1), 3)}·${fmt(um(2 * V.fixed2), 3)} µm pp로 낮게 읽힌다. 아래: 키페이저에 맞춰 한 바퀴에 64점씩 256바퀴를 찍고(동기 샘플링) 가로축을 차수로 그리면 1X·2X가 차수 1·2에 정확히 서고 크기도 그대로다.`,
  panels: [
    {
      title: '시간 간격을 고정해 찍은 스펙트럼',
      series: [{ x: Array.from(S.fixedFreq.subarray(0, fixedUpTo)), y: Array.from(S.fixedAmp.subarray(0, fixedUpTo), (a) => um(2 * a)), color: 'c2', width: 1.8 }],
      annotations: [],
      x: { range: [0, 80], ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80], label: '주파수 [Hz]' },
      y: { range: [0, 55], ticks: [0, 25, 50], label: '[µm pp]' },
      height: 120,
    },
    {
      title: '한 바퀴에 같은 수로 찍은 스펙트럼 (가로축 = 차수)',
      series: [{ x: Array.from(S.order.subarray(0, ordUpTo)), y: Array.from(S.orderAmp.subarray(0, ordUpTo), (a) => um(2 * a)), color: 'c1', width: 1.8 }],
      annotations: [
        { type: 'text', x: 1.05, y: 48, text: '1X: 50 µm pp', anchor: 'start', color: 'c1', bold: true },
        { type: 'text', x: 2.05, y: 15, text: '2X: 15 µm pp', anchor: 'start', color: 'c1', bold: true },
      ],
      x: { range: [0, 4], ticks: [0, 1, 2, 3, 4], label: '차수 (회전 주파수의 몇 배)' },
      y: { range: [0, 55], ticks: [0, 25, 50], label: '[µm pp]' },
      height: 120,
    },
  ],
};

// 그림 3 — Cascade (회전수마다 스펙트럼을 쌓기)
const fC = grid(0, 150, 601);
const cascadeRpms = grid(600, 3600, 16);
const SCALE = 3; // 1 µm pp → 3 rpm 높이
const shape = (f: number, f0: number) => 1 / (1 + ((f - f0) / 0.9) ** 2);
export const cascade: FigureSpec = {
  id: 'fig-p3-5-3',
  caption: `그림 3. 기동하며 회전수마다 저장한 스펙트럼을 그 회전수 높이에 쌓은 그림(Cascade, 예시 로터). 회전에서 나온 1X·2X는 회전수를 따라 비스듬한 줄을 이루고, 1X 줄은 임계속도 ${RUNUP_ROTOR.criticalRpm} rpm(33.3 Hz)에서 가장 높이 솟는다. 95 Hz 성분은 회전수와 상관없이 제자리에 서 있다 — 구조 공진처럼 고정된 주파수다 (P1-8, P3-4). 한 장으로 "무엇이 회전을 따라가고 무엇이 고정됐나"를 본다 (자세히는 P6-2).`,
  panels: [
    {
      series: cascadeRpms.map((rpm): FigSeries => {
        const lines = cascadeLines(rpm);
        return { x: fC, y: fC.map((f) => rpm + SCALE * lines.reduce((s, l) => s + um(l.amp) * shape(f, l.f), 0)), color: 'c1', width: 1.2 };
      }),
      annotations: [
        { type: 'line', x1: 10, y1: 600, x2: 60, y2: 3600, color: 'c2', dash: true, width: 1.2 },
        { type: 'text', x: 61, y: 3700, text: '1X (= rpm/60)', anchor: 'start', color: 'c2', bold: true },
        { type: 'text', x: 121, y: 3700, text: '2X', anchor: 'middle', color: 'c2', bold: true },
        { type: 'text', x: 96, y: 450, text: '95 Hz (고정)', anchor: 'start', color: 'warn', bold: true },
        { type: 'text', x: 36, y: 2420, text: '임계 2000 rpm', anchor: 'start', color: 'text' },
      ],
      x: { range: [0, 150], ticks: [0, 25, 50, 75, 100, 125, 150], label: '주파수 [Hz]' },
      y: { range: [400, 3900], ticks: [600, 1200, 1800, 2400, 3000, 3600], label: '회전수 [rpm]' },
      height: 230,
    },
  ],
};

// 그림 4 — 보호 시스템의 채널 구성 (도식)
const Y4 = squareYRange([0, 30], 230);
const SY = 6.4;
const box = (x1: number, x2: number, y1: number, y2: number, color: 'c1' | 'c3' | 'c4' | 'muted', lines: string[]): FigAnnotation[] => [
  { type: 'rect', x1, x2, y1, y2, color },
  ...lines.map((t, i): FigAnnotation => ({ type: 'text', x: (x1 + x2) / 2, y: (y1 + y2) / 2 + 0.45 * (lines.length - 1) - 0.9 * i - 0.15, text: t, anchor: 'middle', bold: i === 0 })),
];
export const channels: FigureSpec = {
  id: 'fig-p3-5-4',
  caption:
    '그림 4. 터빈 한 대의 보호 시스템 채널 구성 (예시, 옆에서 본 모습). 베어링마다 축의 X·Y 비접촉 변위 센서(P3-2), 축 끝에는 축 방향 위치(추력) 센서 두 개, 회전 기준인 키페이저(P3-3), 필요하면 케이싱의 속도·가속도 센서(P3-1)를 단다. 보호 모니터는 채널마다 진폭을 Alert·Danger 레벨과 비교하고, 릴레이로 경보를 울리거나 보팅을 거쳐 트립(기계 정지) 신호를 낸다. 같은 원신호를 상태감시 시스템으로도 보내 저장·진단에 쓴다.',
  panels: [
    {
      frame: false,
      height: 230,
      x: { range: [0, 30] },
      y: { range: Y4 },
      series: [],
      annotations: [
        { type: 'line', x1: 1.5, y1: SY, x2: 12.6, y2: SY, color: 'muted', width: 6 },
        ...[3, 10].flatMap((bx, i): FigAnnotation[] => [
          { type: 'rect', x1: bx - 0.6, x2: bx + 0.6, y1: SY - 1.0, y2: SY + 1.0, color: 'muted' },
          { type: 'line', x1: bx - 0.3, y1: SY + 1.05, x2: bx - 0.9, y2: SY + 2.0, color: 'c1', width: 4 },
          { type: 'line', x1: bx + 0.3, y1: SY + 1.05, x2: bx + 0.9, y2: SY + 2.0, color: 'c1', width: 4 },
          { type: 'text', x: bx, y: SY + 2.35, text: `베어링 ${i + 1}: X·Y`, anchor: 'middle', color: 'c1', bold: true },
          { type: 'rect', x1: bx - 0.35, x2: bx + 0.35, y1: SY - 1.85, y2: SY - 1.05, color: 'c4' },
        ]),
        { type: 'text', x: 6.5, y: SY - 2.55, text: '케이싱 센서 (속도·가속도)', anchor: 'middle', color: 'c4' },
        { type: 'line', x1: 0.2, y1: SY, x2: 1.2, y2: SY, color: 'c1', width: 4 },
        { type: 'text', x: 0.1, y: SY - 3.2, text: '← 축 끝: 축 방향 위치 ×2', anchor: 'start', color: 'c1' },
        { type: 'line', x1: 6.5, y1: SY + 1.0, x2: 6.5, y2: SY + 1.9, color: 'c3', width: 4 },
        { type: 'text', x: 6.5, y: SY + 2.35, text: '키페이저', anchor: 'middle', color: 'c3', bold: true },
        { type: 'text', x: 6.5, y: SY - 0.55, text: '로터', anchor: 'middle', color: 'muted' },
        { type: 'arrow', x1: 13.0, y1: SY, x2: 15.2, y2: SY, color: 'text', double: false },
        ...box(15.3, 20.7, SY - 1.6, SY + 1.6, 'c1', ['보호 모니터', '채널마다 비교', 'Alert · Danger']),
        { type: 'arrow', x1: 20.8, y1: SY + 0.8, x2: 22.6, y2: SY + 1.6, color: 'text', double: false },
        { type: 'arrow', x1: 20.8, y1: SY - 0.8, x2: 22.6, y2: SY - 1.6, color: 'text', double: false },
        ...box(22.7, 29.4, SY + 1.0, SY + 2.6, 'c4', ['Alert → 경보', '사람이 확인']),
        ...box(22.7, 29.4, SY - 2.6, SY - 1.0, 'muted', ['Danger → 보팅 → 트립', '기계를 자동으로 세운다']),
        { type: 'line', x1: 18.0, y1: SY - 1.7, x2: 18.0, y2: 2.6, color: 'muted', dash: true, width: 1.6 },
        ...box(13.0, 23.0, 0.5, 2.5, 'c3', ['상태감시 시스템', '원신호 저장 · 스펙트럼 · Bode · 진단']),
      ],
    },
  ],
};

// 그림 5 — 레벨과 시간 지연
const T5 = grid(0, 50, 1001);
const sig5: ProtSignal = (() => {
  const x = Float64Array.from(T5, (t) => 40 + (t >= 10 && t < 10.3 ? 170 : 0) + (t <= 25 ? 0 : t >= 35 ? 110 : (110 * (t - 25)) / 10));
  return { dt: 0.05, t: Float64Array.from(T5), x, y: Float64Array.from(x), rpm: Float64Array.from(T5, () => 3600), startup: new Uint8Array(T5.length) };
})();
const r5 = evaluateAlarms(sig5, { ...DEFAULT_ALARM, voting: '1oo1' });
/** 25 s 뒤 처음으로 레벨 이상인 샘플 시각 */
const firstOver = (level: number) => T5.find((t, i) => t > 25 && sig5.x[i] >= level) ?? NaN;
const cross5 = firstOver(DEFAULT_ALARM.danger);
const crossA5 = firstOver(DEFAULT_ALARM.alert);
export const levelsDelay: FigureSpec = {
  id: 'fig-p3-5-5',
  caption: `그림 5. 한 채널의 진폭(파랑)과 두 단계 레벨 — Alert ${DEFAULT_ALARM.alert} µm pp(보라 점선), Danger ${DEFAULT_ALARM.danger} µm pp(주황 점선), 시간 지연 ${DEFAULT_ALARM.delay}초 (예시값). 10 s의 0.3초짜리 튐은 Danger를 넘었지만 지연보다 짧아 아무 알람도 서지 않는다. 25 s부터 진동이 실제로 커지면 Alert를 넘은 ${fmt(crossA5, 3)} s에서 1초 뒤 Alert가, Danger를 넘은 ${fmt(cross5, 3)} s에서 1초 뒤(${fmt(r5.tripTime ?? NaN, 3)} s) Danger가 서고 트립 신호가 나간다. 아래 줄은 알람 상태(서면 위로)다.`,
  panels: [
    {
      series: [{ x: T5, y: Array.from(sig5.x), color: 'c1', width: 2 }],
      annotations: [
        { type: 'hline', y: DEFAULT_ALARM.alert, color: 'c4', dash: true, label: `Alert ${DEFAULT_ALARM.alert}`, labelAt: 'start' },
        { type: 'hline', y: DEFAULT_ALARM.danger, color: 'warn', dash: true, label: `Danger ${DEFAULT_ALARM.danger}`, labelAt: 'start' },
        { type: 'text', x: 10.8, y: 195, text: '0.3초 튐 → 지연보다 짧아 무시', anchor: 'start', color: 'c1' },
        { type: 'arrow', x1: cross5, y1: 175, x2: cross5 + DEFAULT_ALARM.delay, y2: 175, double: true, color: 'warn', label: '지연 1초' },
      ],
      x: { range: [0, 50], ticks: 'none' },
      y: { range: [0, 220], ticks: [0, 50, 100, 150, 200], label: '[µm pp]' },
      height: 150,
    },
    {
      series: [
        { x: T5, y: Array.from(r5.alertX, (v) => 1.2 + 0.7 * v), kind: 'step', color: 'c4', width: 2.2 },
        { x: T5, y: Array.from(r5.trip, (v) => 0.2 + 0.7 * v), kind: 'step', color: 'warn', width: 2.2 },
      ],
      annotations: [
        { type: 'text', x: 0.5, y: 1.45, text: 'Alert (경보)', anchor: 'start', color: 'c4', bold: true },
        { type: 'text', x: 0.5, y: 0.45, text: 'Danger → 트립', anchor: 'start', color: 'warn', bold: true },
      ],
      x: { range: [0, 50], ticks: [0, 10, 20, 30, 40, 50], label: '시각 [s]' },
      y: { range: [0, 2.1], ticks: 'none' },
      height: 70,
    },
  ],
};

// 그림 6 — 기동 중 트립 배율
const R6 = V.runup;
const t6 = Array.from(R6.t);
export const tripMultiply: FigureSpec = {
  id: 'fig-p3-5-6',
  caption: `그림 6. 예시 기동에서 X 채널 진폭(파랑). 임계속도(${RUNUP_ROTOR.criticalRpm} rpm, ${fmt(V.tCrit, 3)} s)를 지나는 몇 초 동안 진폭이 ${fmt(Math.max(...R6.x), 3)} µm pp까지 올라 Danger ${DEFAULT_ALARM.danger}(주황 점선)를 넘는다 — 배율이 없으면 ${fmt(V.runNo.tripTime ?? NaN, 4)} s에 트립되어 기동이 실패한다. 기동하는 동안 레벨을 2배로 올리면(트립 배율, 초록 실선 ${DEFAULT_ALARM.danger * 2}) 임계속도를 지나도 트립되지 않고, 운전 회전수 가까이(3500 rpm) 오면 원래 레벨로 돌아온다. 배율과 기간은 예시값이다.`,
  panels: [
    {
      series: [
        { x: t6, y: Array.from(R6.x), color: 'c1', width: 2 },
        { x: t6, y: Array.from(V.runMul.dangerLevel), kind: 'step', color: 'c3', width: 2 },
      ],
      annotations: [
        { type: 'hline', y: DEFAULT_ALARM.danger, color: 'warn', dash: true, label: `Danger ${DEFAULT_ALARM.danger} (배율 없음)`, labelAt: 'end' },
        { type: 'text', x: 200, y: 262, text: `기동 중 ×2 = ${DEFAULT_ALARM.danger * 2}`, anchor: 'start', color: 'c3', bold: true },
        { type: 'vline', x: V.tCrit, color: 'muted', label: '임계속도 통과' },
      ],
      x: { range: [0, 360], ticks: 'none' },
      y: { range: [0, 280], ticks: [0, 50, 100, 150, 200, 250], label: '[µm pp]' },
      height: 150,
    },
    {
      series: [{ x: t6, y: Array.from(R6.rpm), color: 'muted', width: 2 }],
      annotations: [{ type: 'vline', x: V.tCrit, color: 'muted' }],
      x: { range: [0, 360], ticks: [0, 60, 120, 180, 240, 300, 360], label: '시각 [s]' },
      y: { range: [0, 4000], ticks: [0, 2000, 3600], label: '[rpm]' },
      height: 80,
    },
  ],
};
