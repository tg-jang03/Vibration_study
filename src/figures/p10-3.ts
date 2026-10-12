/**
 * P10-3 "진단 절차와 보고" 본문 그림 (빌드 시 계산, D-026).
 * 사례는 LAB-DIAG-01과 같은 `lib/assessment/diagnosis.ts` (회전체 + 받침을 1자유도로 단순화한 가상 계산 — 현장 자료가 아니다).
 */
import { grid, type FigAnnotation, type FigColor, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { createRng } from '../lib/dsp/random';
import { baseCoastdown, CASE, coastdown, fitErrors, truthSystem } from '../lib/assessment/diagnosis';
import { arrow, box, lines } from './p10-shared';

const fmt = formatNumber;
const UM = 2e6, DEG = 180 / Math.PI;

// ── 사례 기록 ──
const BASE = baseCoastdown();
const TRUTH = truthSystem('stiffness');
const NOW = coastdown(TRUTH);
const OPI = CASE.rpm.indexOf(CASE.operatingRpm);
const FIT = fitErrors(NOW, 'ampPhase');

// ── 그림 2: 120일 추세와 gap 전압 ──
const DAYS = grid(0, 120, 121);
const rng = createRng(1032);
const AMP = DAYS.map((d) => (d < 60 ? 20 : d < 90 ? 20 + (20 * (d - 60)) / 30 : 40) * (1 + 0.02 * rng.normal()));
const GAP = DAYS.map(() => -10 + 0.03 * rng.normal());
const GAP_IF = DAYS.map((d) => (d < 60 ? -10 : d < 90 ? -10 + (1.2 * (d - 60)) / 30 : -8.8));

// ── 그림 6: 같은 점, 다른 모델 ──
const WK = grid(0, 10, 11);
const rngP = createRng(1033);
const OBS = WK.map((w) => 20 * Math.exp(0.07 * w) * (1 + 0.03 * rngP.normal()));
const LIMIT = 80;
const lin = (() => { const n = WK.length, mx = WK.reduce((a, b) => a + b) / n, my = OBS.reduce((a, b) => a + b) / n; const b = WK.reduce((s, x, i) => s + (x - mx) * (OBS[i] - my), 0) / WK.reduce((s, x) => s + (x - mx) ** 2, 0); return { a: my - b * mx, b }; })();
const ex = (() => { const L = OBS.map(Math.log); const n = WK.length, mx = WK.reduce((a, b) => a + b) / n, my = L.reduce((a, b) => a + b) / n; const b = WK.reduce((s, x, i) => s + (x - mx) * (L[i] - my), 0) / WK.reduce((s, x) => s + (x - mx) ** 2, 0); return { a: Math.exp(my - b * mx), b }; })();
const LIN_WEEK = (LIMIT - lin.a) / lin.b;
const EXP_WEEK = Math.log(LIMIT / ex.a) / ex.b;
const FUT = grid(0, 40, 161);
const upTo = (f: (w: number) => number, top = 100) => { const xs = FUT.filter((w) => f(w) <= top); return { x: xs, y: xs.map(f) }; };

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p10-2-3.test.ts`) */
export const P103_VALUES = {
  rpm: CASE.operatingRpm, hz: CASE.operatingRpm / 60,
  baseAmp: BASE[OPI].amp * UM, nowAmp: NOW[OPI].amp * UM,
  baseLag: BASE[OPI].lag * DEG, nowLag: NOW[OPI].lag * DEG,
  ncBase: CASE.baseNcRpm, ncNow: TRUTH.ncRpm,
  h1: { amp: FIT.h1.amp * UM, lag: FIT.h1.lag! * DEG }, h2: { amp: FIT.h2.amp * UM, lag: FIT.h2.lag! * DEG },
  at2500: { base: BASE[CASE.rpm.indexOf(2500)].amp * UM, now: NOW[CASE.rpm.indexOf(2500)].amp * UM },
  linWeek: LIN_WEEK, expWeek: EXP_WEEK, limit: LIMIT,
};

// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { x: 50, y: 86, t: '① 자료 수집', s: '기계 정보 · 측정 유효성' },
  { x: 80, y: 66, t: '② 비교', s: '기준선 · 규격 · 추세' },
  { x: 80, y: 34, t: '③ 이상 감지', s: '무엇이 · 언제부터' },
  { x: 50, y: 14, t: '④ 진단', s: '가설 · 확인 시험' },
  { x: 20, y: 34, t: '⑤ 예측', s: '모델 · 가정 · 불확실성' },
  { x: 20, y: 66, t: '⑥ 권고 · 조치', s: '대상 · 담당 · 시점' },
];
const W2 = 13, H2 = 8.5;
export const loop: FigureSpec = {
  id: 'fig-p10-3-1',
  caption: '그림 1. 진단의 순환(이 사이트의 재구성). ① ~ ⑥을 돌고, 조치 뒤에는 같은 조건으로 다시 재서 ①로 돌아갑니다. 가운데 파랑 화살표처럼 ④의 확인 시험 결과도 새 자료로 ①에 들어가 가설을 바꿉니다. ISO 13373-1·-3·17359의 취지를 연결했지만 규격 도표의 복제가 아닙니다.',
  panels: [{
    frame: false, height: 215, x: { range: [0, 100] }, y: { range: [0, 100] }, series: [],
    annotations: [
      ...STEPS.flatMap((s, i): FigAnnotation[] => [
        box(s.x - W2, s.x + W2, s.y - H2, s.y + H2, i === 3 ? 'c1' : 'muted'),
        ...lines(s.x, s.y + 1.2, [s.t, s.s], { boldFirst: true, gap: 6.8, color: i === 3 ? 'c1' : undefined }),
      ]),
      arrow(63.5, 84, 70, 75), arrow(80, 57, 80, 43), arrow(70, 25, 63.5, 16),
      arrow(36.5, 16, 30, 25), arrow(20, 43, 20, 57), arrow(30, 75, 36.5, 84), { type: 'text', x: 31, y: 84, text: '조치 뒤 재측정', anchor: 'end', color: 'muted' },
      { type: 'arrow', double: false, x1: 50, y1: 23, x2: 50, y2: 77, color: 'c1', label: '확인 시험 결과 = 새 자료', labelDy: 0 },
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
export const validity: FigureSpec = {
  id: 'fig-p10-3-2',
  caption: '그림 2. 가상 사례의 120일 기록. 위 — 3000 rpm 1X 진폭이 60 ~ 90일에 20 → 40 µm p-p로 올랐습니다. 아래 — 같은 프로브의 gap 전압은 그대로(파랑)입니다. 회색 점선처럼 gap이 함께 움직였다면 축이 아니라 프로브·부착·케이블을 먼저 의심합니다.',
  panels: [
    { height: 115, x: { range: [0, 120], label: '날짜 [일]' }, y: { range: [0, 50], label: '1X [µm p-p]' },
      series: [{ x: DAYS, y: AMP, color: 'c1', kind: 'dots', radius: 2.2 }],
      annotations: [{ type: 'band', x1: 60, x2: 90, color: 'c1', label: '증가 구간' }] },
    { height: 95, x: { range: [0, 120], label: '날짜 [일]' }, y: { range: [-10.5, -8.5], label: 'gap [V]', ticks: [-10, -9] },
      series: [{ x: DAYS, y: GAP, color: 'c1', width: 1.6 }, { x: DAYS, y: GAP_IF, color: 'muted', dash: true, width: 1.6 }],
      annotations: [{ type: 'band', x1: 60, x2: 90, color: 'c1' }, { type: 'text', x: 118, y: -9.35, text: '만약 회색 점선처럼 움직였다면 → 센서 먼저', anchor: 'end' }] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
type Mark = 's' | 'x' | '?';
const MARK: Record<Mark, { text: string; color: FigColor }> = { s: { text: '지지', color: 'c3' }, x: { text: '반증', color: 'warn' }, '?': { text: '미확인', color: 'muted' } };
const COLS = ['주파수', '진폭', '위상', '방향 H/V', '속도별 응답'];
const ROWS = ['H1 가진 증가 (불평형·휨)', 'H2 고유진동수 이동 (받침)', 'H3 런아웃 · 측정 변화'];
const matrix = (title: string, marks: Mark[][]) => ({
  frame: false, height: 105, title, x: { range: [0, 100] as [number, number] }, y: { range: [0, 100] as [number, number] }, series: [],
  annotations: [
    ...COLS.map((c, j): FigAnnotation => ({ type: 'text', x: 37.5 + j * 14.5, y: 88, text: c, anchor: 'middle', bold: true })),
    ...ROWS.flatMap((r, i): FigAnnotation[] => {
      const yc = 66 - i * 26;
      return [
        { type: 'text', x: 0, y: yc - 3, text: r, anchor: 'start', bold: true },
        ...marks[i].flatMap((m, j): FigAnnotation[] => [box(31 + j * 14.5, 44 + j * 14.5, yc - 11, yc + 11, MARK[m].color), { type: 'text', x: 37.5 + j * 14.5, y: yc - 3, text: MARK[m].text, anchor: 'middle', color: m === '?' ? undefined : MARK[m].color, bold: m !== '?' }]),
      ];
    }),
  ],
});
export const evidence: FigureSpec = {
  id: 'fig-p10-3-3',
  caption: `그림 3. 후보 × 증거 5요소. 위 — 지금 아는 것(3000 rpm 1X가 20 → 40 µm p-p)은 세 후보 모두를 지지해 아무것도 가르지 못합니다. 아래 — gap·slow roll 점검과 코스트다운 진폭·위상(그림 4)을 본 뒤: H1은 위상과 속도별 응답에서, H3은 진폭·위상·속도별 응답에서 반증이 나오고 H2만 남습니다. 방향은 아직 미확인입니다.`,
  panels: [
    matrix('지금 아는 것', [['s', 's', '?', '?', '?'], ['s', 's', '?', '?', '?'], ['s', 's', '?', '?', '?']]),
    matrix('확인 뒤 (gap · slow roll · 코스트다운)', [['s', 's', 'x', '?', 'x'], ['s', 's', 's', '?', 's'], ['s', 'x', 'x', '?', 'x']]),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
const rpmAll = CASE.rpm as unknown as number[];
export const bode: FigureSpec = {
  id: 'fig-p10-3-4',
  caption: `그림 4. 1년 전(회색)과 지금(파랑 점)의 코스트다운 1X. 두 가설 모두 3000 rpm의 ${fmt(P103_VALUES.nowAmp, 3)} µm p-p에 맞췄습니다. H1 가진 증가(주황 점선)는 곡선 전체를 같은 배수로 올리고 위상은 그대로라고, H2 고유진동수 이동(초록 점선)은 ${CASE.baseNcRpm} → ${fmt(TRUTH.ncRpm, 4)} rpm으로 내려와 같은 회전수의 위상이 커진다고 예측합니다. 기록은 H2를 따릅니다 — 3000 rpm 위상 ${fmt(P103_VALUES.baseLag, 3)}° → ${fmt(P103_VALUES.nowLag, 3)}°.`,
  panels: [
    { height: 140, x: { range: [1950, 3050], label: '회전수 [rpm]' }, y: { range: [0, 45], label: '1X [µm p-p]' },
      series: [
        { x: rpmAll, y: BASE.map((p) => p.amp * UM), color: 'muted', width: 2, label: '1년 전' },
        { x: rpmAll, y: FIT.hypotheses.h1Curve.map((p) => p.amp * UM), color: 'c2', dash: true, width: 2, label: 'H1 가진 증가' },
        { x: rpmAll, y: FIT.hypotheses.h2Curve.map((p) => p.amp * UM), color: 'c3', dash: true, width: 2, label: 'H2 고유진동수 이동' },
        { x: rpmAll, y: NOW.map((p) => p.amp * UM), color: 'c1', kind: 'dots', radius: 3.6, label: '지금 기록' },
      ] },
    { height: 120, x: { range: [1950, 3050], label: '회전수 [rpm]' }, y: { range: [-10, 70], label: '위상 지연 [°]', ticks: [0, 30, 60] },
      series: [
        { x: rpmAll, y: BASE.map((p) => p.lag * DEG), color: 'muted', width: 2 },
        { x: rpmAll, y: FIT.hypotheses.h1Curve.map((p) => p.lag * DEG), color: 'c2', dash: true, width: 2 },
        { x: rpmAll, y: FIT.hypotheses.h2Curve.map((p) => p.lag * DEG), color: 'c3', dash: true, width: 2 },
        { x: rpmAll, y: NOW.map((p) => p.lag * DEG), color: 'c1', kind: 'dots', radius: 3.6 },
      ],
      annotations: [{ type: 'text', x: 2950, y: 62, text: `3000 rpm: ${fmt(P103_VALUES.baseLag, 3)}° → ${fmt(P103_VALUES.nowLag, 3)}°`, anchor: 'end', color: 'c1', bold: true }] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  { t: '요약 · 권고', c: 'c1' as FigColor, l: ['3000 rpm 1X가 60 ~ 90일에 20 → 40 µm p-p. 받침 쪽 고유진동수가 내려온 것과 맞는다.', '권고: 밸런싱 보류, 다음 정지 때 받침 임팩트 시험 · 소프트 풋 · 기초 볼트 점검.'] },
  { t: '근거', c: 'muted' as FigColor, l: [`코스트다운 진폭 · 위상(그림 4): 3000 rpm 위상 ${fmt(P103_VALUES.baseLag, 3)}° → ${fmt(P103_VALUES.nowLag, 3)}°, 2500 rpm은 ${fmt(P103_VALUES.at2500.base, 2)} → ${fmt(P103_VALUES.at2500.now, 3)} µm (2배가 아님).`, 'gap · slow roll 벡터 그대로(그림 2) — 측정 경로 변화는 반증. 원자료 파일 · 채널 위치.'] },
  { t: '확신도 · 한계', c: 'muted' as FigColor, l: ['중간 — 코스트다운 한 번의 비교, 방향(H/V) 비교와 구조 시험 전.', '가진 증가와 함께 일어났을 가능성은 남는다.'] },
  { t: '다음 확인', c: 'muted' as FigColor, l: ['임팩트 시험으로 받침 고유진동수 확인 → 결과로 판단과 권고를 갱신.', '담당 · 시점 · 중단 기준을 적고, 보호 대응은 기존 승인 절차를 따른다.'] },
];
export const report: FigureSpec = {
  id: 'fig-p10-3-5',
  caption: '그림 5. 사례 보고서의 첫 쪽. 맨 위 칸만 읽어도 무엇이 변했고 무엇을 할지 압니다(파랑). 아래 칸은 같은 결론에 다시 도달할 수 있게 근거·확신도·다음 확인을 따로 적습니다. 관측(측정값)과 판단("맞는다")을 한 문장에 섞지 않습니다.',
  panels: [{
    frame: false, height: 220, x: { range: [0, 100] }, y: { range: [0, 100] }, series: [],
    annotations: SECTIONS.flatMap((s, i): FigAnnotation[] => {
      const top = 98 - i * 24.5, bot = top - 22;
      return [
        box(0, 100, bot, top, s.c),
        { type: 'text', x: 1.5, y: top - 7, text: s.t, anchor: 'start', bold: true, color: s.c === 'c1' ? 'c1' : undefined },
        ...lines(17, top - 7, s.l, { anchor: 'start', gap: 8 }),
      ];
    }),
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
export const prognosis: FigureSpec = {
  id: 'fig-p10-3-6',
  caption: `그림 6. 같은 11주 관측점(파랑)에 직선(주황 점선)과 지수(보라 점선)를 맞추면, 가상 조치 기준 ${LIMIT} µm p-p에 닿는 때가 ${fmt(LIN_WEEK, 3)}주와 ${fmt(EXP_WEEK, 3)}주로 갈립니다. 관측 범위 밖의 날짜는 모델이 정합니다 — 열화 메커니즘·운전 조건·불확실성을 갖추기 전에는 고장 날짜를 말하지 않습니다.`,
  panels: [{
    height: 170, x: { range: [0, 40], label: '주' }, y: { range: [0, 100], label: '1X [µm p-p]' },
    series: [
      { ...upTo((w) => lin.a + lin.b * w), color: 'c2', dash: true, width: 2, label: '직선 모델' },
      { ...upTo((w) => ex.a * Math.exp(ex.b * w)), color: 'c4', dash: true, width: 2, label: '지수 모델' },
      { x: WK, y: OBS, color: 'c1', kind: 'dots', radius: 4, label: '관측' },
    ],
    annotations: [
      { type: 'band', x1: 0, x2: 10, color: 'c1', label: '관측 범위' },
      { type: 'hline', y: LIMIT, color: 'text', label: `가상 조치 기준 ${LIMIT}`, labelAt: 'end', labelBelow: true },
      { type: 'point', x: EXP_WEEK, y: LIMIT, color: 'c4', label: `${fmt(EXP_WEEK, 3)}주`, dx: -40, dy: -12 },
      { type: 'point', x: LIN_WEEK, y: LIMIT, color: 'c2', label: `${fmt(LIN_WEEK, 3)}주`, dx: 10, dy: 16 },
    ],
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
const CAT = [
  { t: 'CAT I', l: ['정해진 절차로 측정', '자료 품질 확인'], h: 34 },
  { t: 'CAT II', l: ['기기 설정 · 기본 분석', '스펙트럼 · 파형 판독'], h: 52 },
  { t: 'CAT III', l: ['진단 · 감시 프로그램', '확인 시험 설계 · 권고'], h: 70 },
  { t: 'CAT IV', l: ['복잡한 진단 · 해석', '로터동역학 · 모드 · 개선'], h: 88 },
];
export const categories: FigureSpec = {
  id: 'fig-p10-3-7',
  caption: '그림 7. ISO 18436-2의 진동 분석 인력 네 범주(Vibration Institute의 공개 설명을 줄임). 위로 갈수록 판단의 폭이 넓어집니다. 기계의 진동 등급도, 특정 설비의 운전·보호 변경 권한도 아닙니다.',
  panels: [{
    frame: false, height: 150, x: { range: [0, 100] }, y: { range: [0, 100] }, series: [],
    annotations: CAT.flatMap((c, i): FigAnnotation[] => {
      const x1 = 1 + i * 25, x2 = x1 + 23;
      return [box(x1, x2, 2, c.h, i === 2 ? 'c1' : 'muted'), ...lines((x1 + x2) / 2, c.h - 10, [c.t, ...c.l], { boldFirst: true, gap: 9, color: i === 2 ? 'c1' : undefined })];
    }),
  }],
};
