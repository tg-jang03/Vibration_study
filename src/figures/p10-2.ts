/**
 * P10-2 "API 규격 요점" 본문 그림 (빌드 시 계산, D-026).
 * AF·SM은 P4-1과 같은 예시 로터(`P41_EXAMPLE`), 예측 오차는 LAB-SM-01과 같은 `lib/assessment/margin.ts`,
 * 안정성은 P4-4와 같은 `lib/rotor/stability.ts`. 규격의 AF 구분·요구 SM·로그 감쇠 기준값은 넣지 않는다 (I-009).
 */
import { grid, type FigAnnotation, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { halfPowerAF, P41_EXAMPLE, separationMargin, simulateRunUp } from '../lib/rotor/runup';
import { stabilityExample, stabilityModes } from '../lib/rotor/stability';
import { marginAtOperating, marginCurve } from '../lib/assessment/margin';
import { arrow, box, lines } from './p10-shared';

const fmt = formatNumber;
const R = P41_EXAMPLE.rotor;
const OP = P41_EXAMPLE.operatingRpm;
const RUN = simulateRunUp(R, { rpmEnd: P41_EXAMPLE.rpmEnd, rpmStep: P41_EXAMPLE.rpmStep });
const HP = halfPowerAF(RUN)!;
const SM = separationMargin(OP, HP.peakRpm);
const PP = (m: number) => m * 2e6;
const SHOWN = RUN.filter((p) => p.rpm >= 1500 && p.rpm <= 5000);

const SM_PCT = (100 * Math.abs(OP - R.naturalRpm)) / OP;
const HIGH = marginAtOperating({ af: 10, smPct: SM_PCT, errorPct: 10, operatingRpm: OP });
const LOW = marginAtOperating({ af: 2.5, smPct: SM_PCT, errorPct: 10, operatingRpm: OP });
const RPM = grid(1500, 5000, 351);

// 안정성: P4-4 예시(3000 rpm, ζ 0.05)에서 교차연성 q를 키운다
const QR = grid(0, 0.15, 151);
const DELTA = QR.map((q) => stabilityModes(stabilityExample(3000, 0.05, q)).logDecrement);
const Q0 = stabilityModes(stabilityExample(3000, 0.05, 0)).criticalCrossStiffness / stabilityExample(3000, 0.05, 0).stiffness;
const QA = 0.04;
const DELTA_QA = stabilityModes(stabilityExample(3000, 0.05, QA)).logDecrement;

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p10-2-3.test.ts`) */
export const P102_VALUES = { af: HP.af, peakRpm: HP.peakRpm, n1: HP.n1, n2: HP.n2, sm: SM, high: HIGH, low: LOW, q0: Q0, qa: QA, deltaQa: DELTA_QA, delta0: DELTA[0] };

// ─────────────────────────────────────────────────────────────────────────────
const STAGES: { x: number; t: string; blocks: string[][] }[] = [
  { x: 12.5, t: '설계 · 해석', blocks: [['API 617 · 612 · 616', '해석 요구: 임계속도 ·', '불평형 응답 · 안정성'], ['API 684 (RP · TR 684-1)', '그 해석을 읽는 튜토리얼']] },
  { x: 37.5, t: '공장 시험', blocks: [['API 617 · 612 · 616', '기계적 운전 시험 ·', '성능 시험 · 계약 조건']] },
  { x: 62.5, t: '설치 · 시운전', blocks: [['API 670', '보호 시스템: 센서 ·', '모니터 · 트립 · 시험']] },
  { x: 87.5, t: '운전 · 감시', blocks: [['ISO 20816 (P10-1)', '설치된 기계의', '크기 · 변화 평가'], ['API 670', '알람 · 트립 운용']] },
];
const stageText = (s: (typeof STAGES)[number]): FigAnnotation[] => {
  const out: FigAnnotation[] = [];
  let y = 66;
  for (const b of s.blocks) { out.push(...lines(s.x, y, b, { boldFirst: true, color: 'c1', gap: 8 })); y -= b.length * 8 + 6; }
  return out;
};
export const purposes: FigureSpec = {
  id: 'fig-p10-2-1',
  caption: '그림 1. 문서는 기계의 일생에서 쓰이는 때가 다릅니다. 장비 규격(617·612·616)이 설계 해석과 공장 시험의 요구를 담고, 684는 그 해석을 설명하는 튜토리얼, 670은 설치 뒤 보호 시스템, ISO 20816은 운전 중인 기계의 평가입니다.',
  panels: [{
    frame: false, height: 150, x: { range: [0, 100] }, y: { range: [10, 100] }, series: [],
    annotations: [
      ...STAGES.flatMap((s, i): FigAnnotation[] => [
        box(s.x - 11, s.x + 11, 76, 90, 'accent'), ...lines(s.x, 81, [s.t], { bold: true, color: 'accent' }), ...stageText(s),
        ...(i < STAGES.length - 1 ? [arrow(s.x + 11.3, 83, STAGES[i + 1].x - 11.3, 83, undefined, 'accent')] : []),
      ]),
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
const CHAIN = [
  { x: 10, t: '센서', s: '프로브 · 가속도계', c: '위치 · 방향 · 갭' },
  { x: 31.5, t: '드라이버', s: '프록시미터 · 케이블', c: '교정 · 범위 · Not OK' },
  { x: 53, t: '모니터 채널', s: 'Alert · Danger · 지연', c: '보팅 · 기동 중 배율' },
  { x: 74.5, t: '릴레이 출력', s: '트립 회로 · 경보', c: '기능 시험 · 바이패스' },
];
export const protection: FigureSpec = {
  id: 'fig-p10-2-2',
  caption: '그림 2. 보호 경로를 사양서에서 따라가 봅니다. 칸의 위쪽은 신호가 지나는 길, 아래쪽 "확인"은 그 칸에서 볼 것입니다. 모니터의 버퍼 출력은 상태감시·진단 장비로 갈라져 나갑니다 — 진단 장비는 보호 기능에 끼어들지 않습니다. 각 기능의 뜻은 P3-5에서 다뤘습니다.',
  panels: [{
    frame: false, height: 175, x: { range: [0, 100] }, y: { range: [0, 100] }, series: [],
    annotations: [
      ...CHAIN.flatMap((c, i): FigAnnotation[] => [
        box(c.x - 10, c.x + 10, 34, 96, i === 3 ? 'c2' : 'c1'),
        ...lines(c.x, 85, [c.t, c.s], { boldFirst: true, gap: 10, color: i === 3 ? 'c2' : 'c1' }),
        ...lines(c.x, 54, ['확인', c.c], { boldFirst: true, gap: 10, color: 'muted' }),
        ...(i < CHAIN.length - 1 ? [arrow(c.x + 10.3, 72, CHAIN[i + 1].x - 10.3, 72)] : []),
      ]),
      arrow(84.8, 72, 90.5, 72, undefined, 'c2'),
      ...lines(95.5, 74, ['기계', '정지'], { bold: true, color: 'c2', gap: 9 }),
      arrow(53, 33.5, 53, 15, undefined, 'muted'),
      box(40, 100, 0, 14, 'muted'),
      ...lines(70, 5, ['버퍼 출력 → 상태감시 · 진단 장비 (보호 경로 밖)'], { bold: true }),
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
export const peak: FigureSpec = {
  id: 'fig-p10-2-3',
  caption: `그림 3. P4-1의 예시 로터(ζ 0.05)를 25 rpm 간격으로 읽은 런업(P4-1 §4와 같은 자료). 위 — 진폭: 피크 ${fmt(HP.peakRpm, 4)} rpm, 0.707배 지점 ${fmt(HP.n1, 5)}·${fmt(HP.n2, 5)} rpm에서 AF = ${fmt(HP.af, 3)}. 운전 회전수 ${OP} rpm(보라)까지의 분리여유는 ${fmt(SM, 3)} %. 아래 — 위상 지연은 피크 근처에서 90°를 지납니다.`,
  panels: [
    {
      height: 150, x: { range: [1500, 5000], label: '회전수 [rpm]' }, y: { range: [0, 115], label: '1X 진폭 [µm p-p]' },
      series: [{ x: SHOWN.map((p) => p.rpm), y: SHOWN.map((p) => PP(p.amp)), color: 'c1', width: 2.2 }],
      annotations: [
        { type: 'hline', y: PP(HP.peakAmp) / Math.SQRT2, color: 'muted', label: '피크 × 0.707', labelAt: 'start' },
        { type: 'vline', x: HP.n1, color: 'muted' }, { type: 'vline', x: HP.n2, color: 'muted' },
        { type: 'arrow', x1: HP.n1, y1: 18, x2: HP.n2, y2: 18, double: true, color: 'c1', label: `N₂ − N₁ = ${fmt(HP.n2 - HP.n1, 3)} rpm`, labelDx: 0 },
        { type: 'vline', x: OP, color: 'c4', dash: false, label: `운전 ${OP} rpm` },
        { type: 'arrow', x1: HP.peakRpm, y1: 92, x2: OP, y2: 92, double: true, color: 'c4', label: `SM ${fmt(SM, 3)} %` },
      ],
    },
    {
      height: 95, x: { range: [1500, 5000], label: '회전수 [rpm]' }, y: { range: [0, 180], label: '위상 지연 [°]', ticks: [0, 90, 180] },
      series: [{ x: SHOWN.map((p) => p.rpm), y: SHOWN.map((p) => (p.lag * 180) / Math.PI), color: 'c1', width: 2.2 }],
      annotations: [{ type: 'hline', y: 90, color: 'muted' }, { type: 'vline', x: OP, color: 'c4', dash: false }],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
const errPanel = (af: number, m: typeof HIGH, top: number) => ({
  height: 120, title: `AF ${fmt(af, 3)} — 운전점 응답 ${fmt(m.predictedAmp, 3)} → ${fmt(m.actualAmp, 3)} (${fmt(m.growth, 3)}배)`,
  x: { range: [1500, 5000] as [number, number], label: '회전수 [rpm]' }, y: { range: [0, top] as [number, number], label: '진폭 / 편심 X/e' },
  series: [
    { x: RPM, y: marginCurve(m.predictedNc, af, RPM), color: 'muted' as const, dash: true, width: 2, label: `예측 (임계속도 ${fmt(m.predictedNc, 4)} rpm)` },
    { x: RPM, y: marginCurve(m.actualNc, af, RPM), color: 'c1' as const, width: 2.2, label: `실제 (+10 % → ${fmt(m.actualNc, 4)} rpm)` },
    { x: [OP, OP], y: [m.predictedAmp, m.actualAmp], kind: 'dots' as const, color: 'c4' as const, radius: 4.5 },
  ],
  annotations: [{ type: 'vline' as const, x: OP, color: 'c4' as const, dash: false, label: `운전 ${OP}` }],
});
export const uncertainty: FigureSpec = {
  id: 'fig-p10-2-4',
  caption: `그림 4. 같은 로터 배치(임계속도 예측 3000 rpm, 운전 3600 rpm, SM ${fmt(SM_PCT, 3)} %)에서 실제 임계속도가 10 % 높은 3300 rpm이었다면. 위 — 뾰족한 AF 10: 운전점 응답이 ${fmt(HIGH.growth, 3)}배. 아래 — 펑퍼짐한 AF 2.5: ${fmt(LOW.growth, 3)}배. 같은 오차가 뾰족한 봉우리에서 훨씬 크게 번집니다.`,
  panels: [errPanel(10, HIGH, 11), errPanel(2.5, LOW, 3.2)],
};

// ─────────────────────────────────────────────────────────────────────────────
export const stability: FigureSpec = {
  id: 'fig-p10-2-5',
  caption: `그림 5. P4-4 학습 모델(3000 rpm, ζ 0.05)에서 교차연성 q를 키울 때 첫 전진 모드의 로그 감쇠 δ. q = 0에서 δ = ${fmt(DELTA[0], 3)}, q가 k의 ${fmt(Q0 * 100, 3)} %(q₀)에 닿으면 δ = 0. Level I의 생각은 예상 공력 교차연성 qₐ(가상: k의 ${QA * 100} %)에서의 δ(${fmt(DELTA_QA, 3)})와 여유 q₀/qₐ(${fmt(Q0 / QA, 3)})를 보는 것입니다. 기준값은 적용 판본에서 확인합니다.`,
  panels: [{
    height: 175, x: { range: [0, 15], label: '교차연성 q / k [%]' }, y: { range: [-0.2, 0.35], label: '로그 감쇠 δ' },
    series: [{ x: QR.map((q) => q * 100), y: DELTA, color: 'c1', width: 2.4 }],
    annotations: [
      { type: 'hline', y: 0, color: 'text', dash: false, label: 'δ = 0 — 안정 한계', labelAt: 'start', labelBelow: true },
      { type: 'vline', x: QA * 100, color: 'c4', label: `qₐ (가상) ${QA * 100} %` },
      { type: 'point', x: QA * 100, y: DELTA_QA, color: 'c4', label: `δ = ${fmt(DELTA_QA, 3)}`, dx: 8, dy: -10 },
      { type: 'vline', x: Q0 * 100, color: 'c2', label: `q₀ ${fmt(Q0 * 100, 3)} %` },
      { type: 'arrow', x1: QA * 100, y1: -0.06, x2: Q0 * 100, y2: -0.06, double: true, color: 'c2', label: `여유 q₀/qₐ = ${fmt(Q0 / QA, 3)}` },
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
const TT = [0, 1, 2.2, 3.2, 3.5, 3.9, 4.2, 9.2, 10.6];
const SP = [0, 0.4, 1, 1, 1.1, 1.1, 1, 1, 0];
export const acceptance: FigureSpec = {
  id: 'fig-p10-2-6',
  caption: '그림 6. 기계적 운전 시험의 흐름(시간은 눈금 없이 순서만). 최대 연속 회전수(MCS)까지 올려 베어링 온도가 안정되기를 기다리고, 트립 회전수를 잠깐 확인한 뒤, MCS에서 정해진 시간 동안 연속 운전하며 진동을 평가합니다. 감속하면서 기록한 Bode로 임계속도·AF를 해석과 견줍니다. 구간 길이와 판정 항목은 적용 장비 규격·계약에서 확인합니다.',
  panels: [{
    height: 150, x: { range: [0, 11], ticks: 'none', label: '시간 →' }, y: { range: [0, 1.35], label: '회전수 / MCS', ticks: [0, 1] },
    series: [{ x: TT, y: SP, color: 'c1', width: 2.6 }],
    annotations: [
      { type: 'text', x: 0.5, y: 0.58, text: '가속', anchor: 'middle' },
      { type: 'text', x: 2.7, y: 1.07, text: '온도 안정', anchor: 'middle' },
      { type: 'text', x: 3.7, y: 1.17, text: '트립 회전수', anchor: 'middle', color: 'c2', bold: true },
      { type: 'text', x: 6.7, y: 1.07, text: 'MCS 연속 운전 — 진동 · 온도 기록과 평가', anchor: 'middle', bold: true },
      { type: 'text', x: 9.3, y: 0.55, text: '감속 Bode', anchor: 'end', color: 'c4', bold: true },
      { type: 'text', x: 9.3, y: 0.4, text: '임계속도 · AF 확인', anchor: 'end', color: 'c4' },
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
export const trace: FigureSpec = {
  id: 'fig-p10-2-7',
  caption: '그림 7. 적합성 주장이 지나는 길. 적용 요구(문서·판본·항목) → 증거(시험 조건·채널·원자료의 위치) → 결론 세 가지 중 하나. "미확인"은 "충족"으로 바꾸지 않고, 이유와 다음 시험·승인 계획을 붙입니다.',
  panels: [{
    frame: false, height: 140, x: { range: [0, 100] }, y: { range: [0, 100] }, series: [],
    annotations: [
      box(0, 26, 30, 80, 'c1'), ...lines(13, 66, ['1. 적용 요구', '문서 · 판본 · 계약', '해당 항목 · 예외'], { boldFirst: true, color: 'c1', gap: 13 }),
      arrow(27, 55, 35, 55),
      box(36, 62, 30, 80, 'c1'), ...lines(49, 66, ['2. 증거', '시험 조건 · 채널 · 교정', '원자료 · 해석 모델 위치'], { boldFirst: true, color: 'c1', gap: 13 }),
      arrow(63, 62, 71, 85), arrow(63, 55, 71, 55), arrow(63, 48, 71, 25),
      box(72, 100, 76, 96, 'c3'), ...lines(86, 83.5, ['충족 — 근거 위치 함께'], { bold: true, color: 'c3' }),
      box(72, 100, 45, 65, 'c2'), ...lines(86, 52.5, ['미충족 — 차이 · 조치'], { bold: true, color: 'c2' }),
      box(72, 100, 14, 34, 'muted'), ...lines(86, 21.5, ['미확인 — 이유 · 다음 시험'], { bold: true }),
    ],
  }],
};
