/**
 * P7-4 "유체막·유체력 불안정 · 서브싱크로너스 감별" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 계산은 랩(LAB-SUB-01)과 같은 `lib/faults/subsync.ts`의 설명용 규칙 모델로 한다.
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import {
  BASE_COND,
  caseConditions,
  conditionResponse,
  LOCK_RPM,
  mainSub,
  oilOnset,
  onsetOffset,
  rpmSweep,
  SUB_MACHINE,
  subOrbit,
  subState,
  type Conditions,
  type SubCause,
} from '../lib/faults/subsync';

const fmt = formatNumber;
const M = SUB_MACHINE;
const amp = (cause: SubCause, rpm: number, c: Conditions = caseConditions(cause), dir: 'up' | 'down' = 'up') => {
  const m = mainSub(subState(cause, rpm, c, dir));
  return m ? m.fwd + m.bwd : 0;
};
const sub = (cause: SubCause, rpm: number, c: Conditions = caseConditions(cause)) => mainSub(subState(cause, rpm, c))!;

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p7-4.test.ts`) */
export const P74_VALUES = {
  lockRpm: LOCK_RPM,
  onset: oilOnset(BASE_COND),
  oil: { hyst: onsetOffset('oilfilm'), whirl6000: sub('oilfilm', 6000), whip7200: sub('oilfilm', 7200) },
  rub: sub('rub', 6300),
  loose: sub('looseness', 6300),
  steam: sub('steam', 6600),
  stall: sub('stall', 6600),
  structural: sub('structural', 6600),
  resp: {
    whirlOil: conditionResponse('oilfilm', 6000, { oilT: 60 }),
    whirlLoad: conditionResponse('oilfilm', 6000, { load: 1.5 }),
    whipOil: conditionResponse('oilfilm', 7200, { oilT: 60 }),
    whipLoad: conditionResponse('oilfilm', 7200, { load: 1.5 }),
    steamFlow: conditionResponse('steam', 6600, { flow: 80 }),
    steamLoad: conditionResponse('steam', 6600, { load: 1.5 }),
    looseLoad: conditionResponse('looseness', 6300, { load: 1.5 }),
    stallFlow: conditionResponse('stall', 6600, { flow: 40 }),
    rubOil: conditionResponse('rub', 6300, { oilT: 60 }),
  },
  /** 유온을 올릴 때 휠이 사라지는 온도 [°C] (6000 rpm, 문턱 = 6000) */
  whirlGoneT: 50 + (6000 / 4800 - 1) / 0.03,
};
const V = P74_VALUES;

const RPM_AXIS = { range: [M.rpmMin, M.rpmMax] as [number, number], label: '회전수 [rpm]', ticks: [1200, 2400, 3600, 4800, 6000, 7200] };

// ── 그림 1: 1X 아래 후보 지도 ──
const grid = rpmSweep(50);
const lineOf = (pick: (rpm: number) => number | null): { x: number[]; y: number[] } => {
  const x: number[] = [];
  const y: number[] = [];
  for (const r of grid) {
    const v = pick(r);
    if (v !== null) {
      x.push(r);
      y.push(v);
    }
  }
  return { x, y };
};
const oilLine = lineOf((r) => mainSub(subState('oilfilm', r))?.hz ?? null);
const halfLine = lineOf((r) => (r >= 5700 && r <= 6900 ? r / 120 : null));
const stallLine = lineOf((r) => mainSub(subState('stall', r, { ...BASE_COND, flow: 60 }))?.hz ?? null);
const structLine = lineOf((r) => (r >= 2400 ? 38 : null));
const steamLine = lineOf((r) => mainSub(subState('steam', r))?.hz ?? null);
const ftf = { x: [M.rpmMin, M.rpmMax], y: [(0.4 * M.rpmMin) / 60, (0.4 * M.rpmMax) / 60] };
export const candidateMap: FigureSpec = {
  id: 'fig-p7-4-1',
  caption: `그림 1. 1X 아래(서브싱크로너스) 후보를 한 장의 주파수-회전수 지도에 그렸다 (설명용, 1차 임계속도 ${M.criticalRpm} rpm = ${M.fn} Hz). 오일 휠(파랑)은 문턱(${fmt(V.onset, 2)} rpm) 위에서 0.45X로 따라가다 ${fmt(V.lockRpm, 3)} rpm에서 ${M.fn} Hz에 잠기고(오일 휩), 유체력 선회(보라)는 처음부터 ${M.fn} Hz 근처에 선다. 러브·회전 풀림의 ½X(주황)는 임계속도의 약 2배 구간에서 정확히 회전수의 절반이다. Rotating stall(초록)은 유량이 줄면 0.17 ~ 0.2X에, 구조 공진(회색)은 회전수와 무관하게 38 Hz에 선다. 구름베어링이라면 케이지 FTF(약 0.4X, 점선)도 있다. 6000 ~ 7200 rpm에서 0.4 ~ 0.5X 둘레에 후보 여럿이 몇 Hz 차이로 겹친다 — 자리만으로는 가를 수 없다.`,
  panels: [
    {
      height: 200,
      x: RPM_AXIS,
      y: { range: [0, 130], label: '주파수 [Hz]' },
      series: [
        { x: [M.rpmMin, M.rpmMax], y: [M.rpmMin / 60, M.rpmMax / 60], color: 'muted', width: 1.2, label: '1X' },
        { ...ftf, color: 'muted', width: 1, dash: true, label: 'FTF 0.4X (구름베어링)' },
        { ...oilLine, color: 'c1', width: 2.4, label: '오일 휠 → 휩' },
        { ...steamLine, color: 'c4', width: 1.8, dash: true, label: '유체력 선회' },
        { ...halfLine, color: 'c2', width: 2.4, label: '½X (러브·풀림)' },
        { ...stallLine, color: 'c3', width: 2, label: 'Rotating stall (유량 60 %)' },
        { ...structLine, color: 'text', width: 1.4, label: '구조 공진 38 Hz' },
      ],
      annotations: [{ type: 'hline', y: M.fn, color: 'muted', dash: true, label: `f_n = ${M.fn} Hz`, labelAt: 'start' }],
    },
  ],
};

// ── 그림 2: 유체막 불안정의 히스테리시스 ──
const upAmp = grid.map((r) => amp('oilfilm', r, BASE_COND, 'up'));
const downAmp = grid.map((r) => amp('oilfilm', r, BASE_COND, 'down'));
export const oilHysteresis: FigureSpec = {
  id: 'fig-p7-4-2',
  caption: `그림 2. 유체막 불안정의 1X 아래 성분 크기(정·역 반지름의 합, 설명용). 회전수를 올릴 때(파랑)는 ${fmt(V.oil.hyst.onsetRpm!, 2)} rpm에서 갑자기 나타나고, ${fmt(V.lockRpm, 3)} rpm 위에서 휩으로 잠기며 크게 자란다(${fmt(V.oil.whip7200.fwd + V.oil.whip7200.bwd, 2)} µm). 내릴 때(주황 점선)는 나타났던 회전수보다 낮은 ${fmt(V.oil.hyst.offRpm!, 2)} rpm까지 남아 있다 — 한번 시작된 선회는 더 낮은 회전수까지 이어진다(히스테리시스). 런업과 코스트다운의 문턱이 다르면 불안정을 의심하는 단서가 된다.`,
  panels: [
    {
      height: 160,
      x: RPM_AXIS,
      y: { range: [0, 75], label: '1X 아래 [µm]' },
      series: [
        { x: grid, y: upAmp, color: 'c1', width: 2.2, label: '런업', kind: 'step' },
        { x: grid, y: downAmp, color: 'c2', width: 2, dash: true, label: '코스트다운', kind: 'step' },
      ],
      annotations: [
        { type: 'vline', x: V.oil.hyst.onsetRpm!, color: 'c1', dash: true, label: '나타남' },
        { type: 'vline', x: V.oil.hyst.offRpm!, color: 'c2', dash: true, label: '사라짐' },
        { type: 'vline', x: V.lockRpm, color: 'muted', dash: true, label: '휩' },
      ],
    },
  ],
};

// ── 그림 3: 운전조건을 바꾸면 ──
const T_GRID = Array.from({ length: 41 }, (_, i) => 40 + i * 0.5);
const L_GRID = Array.from({ length: 41 }, (_, i) => 0.5 + i * 0.025);
const F_GRID = Array.from({ length: 31 }, (_, i) => 50 + i * 2);
const curve = (cause: SubCause, rpm: number, xs: number[], key: keyof Conditions, color: FigColor, label: string, dash = false): FigSeries => ({
  x: xs,
  y: xs.map((v) => amp(cause, rpm, { ...caseConditions(cause), [key]: v })),
  color,
  width: 2,
  label,
  dash,
});
export const conditionCurves: FigureSpec = {
  id: 'fig-p7-4-3',
  caption: `그림 3. 운전조건 하나씩 바꾸며 본 1X 아래 성분 크기 (설명용 규칙 모델, 나머지 조건은 기준값: 유온 ${M.base.oilT} °C·베어링 하중 1·공정 부하 100 %). 위: 유온을 올리면 오일 휠(6000 rpm)은 ${fmt(V.whirlGoneT, 3)} °C 근처에서 사라지지만 휩(7200 rpm)은 그대로이고, 러브는 무관하다. 가운데: 베어링 하중을 키우면(편심률 ↑, P4-3) 휠이 사라지고 회전 풀림이 ${fmt(V.resp.looseLoad, 2)}배로 줄며, 유체력 선회는 조금 줄 뿐이다. 아래: 공정 부하(유량)를 줄이면 유체력 선회는 80 % 아래에서 사라지고 Rotating stall은 75 % 아래에서 나타난다. 원인마다 반응하는 조건이 다르다 — 감별의 가장 강한 증거다.`,
  panels: [
    {
      title: '유온',
      height: 120,
      x: { range: [40, 60], label: '오일 공급 온도 [°C]' },
      y: { range: [0, 75], label: '[µm]' },
      series: [curve('oilfilm', 6000, T_GRID, 'oilT', 'c1', '오일 휠 6000 rpm'), curve('oilfilm', 7200, T_GRID, 'oilT', 'c1', '오일 휩 7200 rpm', true), curve('rub', 6300, T_GRID, 'oilT', 'c2', '러브 ½X 6300 rpm')],
    },
    {
      title: '베어링 하중',
      height: 120,
      x: { range: [0.5, 1.5], label: '베어링 하중 (기준 = 1)' },
      y: { range: [0, 75], label: '[µm]' },
      series: [curve('oilfilm', 6000, L_GRID, 'load', 'c1', '오일 휠'), curve('oilfilm', 7200, L_GRID, 'load', 'c1', '오일 휩', true), curve('looseness', 6300, L_GRID, 'load', 'c3', '회전 풀림 ½X'), curve('steam', 6600, L_GRID, 'load', 'c4', '유체력 선회')],
    },
    {
      title: '공정 부하 (유량)',
      height: 120,
      x: { range: [50, 110], label: '공정 부하 [%]' },
      y: { range: [0, 75], label: '[µm]' },
      series: [curve('steam', 6600, F_GRID, 'flow', 'c4', '유체력 선회 6600 rpm'), curve('stall', 6600, F_GRID, 'flow', 'c3', 'Rotating stall 6600 rpm'), curve('oilfilm', 6000, F_GRID, 'flow', 'c1', '오일 휠 6000 rpm')],
    },
  ],
};

// ── 그림 4: 오빗과 키페이저 점 ──
const ORB = [
  { cause: 'oilfilm' as SubCause, rpm: 6000, title: '오일 휠 6000 rpm', color: 'c1' as FigColor },
  { cause: 'rub' as SubCause, rpm: 6300, title: '러브 ½X 6300 rpm', color: 'c2' as FigColor },
  { cause: 'structural' as SubCause, rpm: 6600, title: '구조 공진 6600 rpm', color: 'text' as FigColor },
];
const orbs = ORB.map((o) => subOrbit(subState(o.cause, o.rpm, caseConditions(o.cause)), 12, 72));
const oMax = Math.max(...orbs.flatMap((o) => [...o.x.map(Math.abs), ...o.y.map(Math.abs)]));
const ORB_C = [-2.3 * oMax, 0, 2.3 * oMax];
const X4: [number, number] = [-3.45 * oMax, 3.45 * oMax];
const Y4 = squareYRange(X4, 260, -1.25 * oMax);
export const subOrbits: FigureSpec = {
  id: 'fig-p7-4-4',
  caption: `그림 4. 1X에 1X 아래 성분이 더해진 오빗 (12바퀴, 같은 축척, 점 = 키페이저). 오일 휠은 1X의 0.45배라 매 바퀴 같은 자리로 돌아오지 않아 점이 원을 따라 흩어진다(정방향 안쪽 고리). 러브의 ½X는 정확히 절반이라 점이 두 자리에 고정되고, 역방향 성분 때문에 고리가 찌그러진다. 구조 공진(38 Hz)도 회전과 묶이지 않아 점이 흩어지지만, 정·역 크기가 같아 한 방향으로 흔들린다. 점이 몇 자리에 고정되는지, 흩어지는지는 P6-3의 판독 그대로다.`,
  panels: [
    {
      frame: false,
      height: 260,
      x: { range: X4, ticks: 'none' },
      y: { range: Y4, ticks: 'none' },
      series: orbs.map((o, i) => ({ x: o.x.map((v) => v + ORB_C[i]), y: o.y, color: ORB[i].color, width: 1.1 })),
      annotations: [
        ...orbs.flatMap((o, i) => o.dots.map(([x, y]): FigAnnotation => ({ type: 'point', x: x + ORB_C[i], y, color: 'warn' }))),
        ...ORB.map((o, i): FigAnnotation => ({ type: 'text', x: ORB_C[i], y: 1.1 * oMax, text: o.title, anchor: 'middle', color: o.color, bold: true })),
      ],
    },
  ],
};

// ── 그림 5: 부하 문턱 (유체력 선회) — 같은 회전수에서 공정 부하만 올린다 ──
const LOADS = Array.from({ length: 31 }, (_, i) => 50 + i * 2);
export const steamThreshold: FigureSpec = {
  id: 'fig-p7-4-5',
  caption: `그림 5. 회전수(6600 rpm)를 그대로 두고 공정 부하만 올릴 때(설명용). 유체력 선회는 부하가 문턱(80 %)을 넘는 순간 ${M.fn} Hz 근처(${fmt(V.steam.hz, 2)} Hz = ${fmt(V.steam.hz / 110, 3)}X)에 나타나 부하와 함께 커진다. 증기터빈의 steam whirl(P8-3)과 압축기 씰의 교차연성이 이런 모양이다 — 회전수가 아니라 부하·압력이 문턱을 만든다. 오일 휠은 부하와 상관없이 그대로다.`,
  panels: [
    {
      height: 130,
      x: { range: [50, 110], label: '공정 부하 [%]' },
      y: { range: [0, 50], label: '1X 아래 [µm]' },
      series: [
        { x: LOADS, y: LOADS.map((l) => amp('steam', 6600, { ...BASE_COND, flow: l })), color: 'c4', width: 2.2, label: '유체력 선회' },
        { x: LOADS, y: LOADS.map((l) => amp('oilfilm', 6000, { ...BASE_COND, flow: l })), color: 'c1', width: 2, dash: true, label: '오일 휠 (6000 rpm)' },
      ],
      annotations: [{ type: 'vline', x: 80, color: 'muted', dash: true, label: '부하 문턱' }],
    },
  ],
};
