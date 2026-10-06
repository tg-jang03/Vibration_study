/**
 * P0-7 "기계 요소가 만드는 주파수" 본문 그림 데이터 (빌드 시 계산, D-026·D-032).
 * 주파수는 랩(LAB-FMAP-01)과 같은 `src/lib/machine/`로, 울림 파형은 `lib/mck`의 감쇠 자유진동으로 계산한다.
 */
import { grid, squareYRange, type FigAnnotation, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { freeResponseAt } from '../lib/mck';
import { BEARING_6205, bearingFrequencies, beltFrequency, bladePass, electromagneticForce, gearPair } from '../lib/machine/frequencies';
import { buildMap, EXAMPLE, LINE_FREQUENCY, MAP_RANGE, PRESETS } from '../lib/machine/frequencyMap';

const PX_PER_UNIT = 820 / 30; // 도식 패널 x 범위 [0, 30]의 1단위 = 27.3 px
const hz = (v: number) => formatNumber(v, 4);
const logTicks = (lo: number, hi: number) =>
  Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => ({ value: v, label: v >= 3 ? `${10 ** (v - 3)}k` : String(10 ** v) }));

/** 그림·본문이 인용하는 숫자 (회귀 테스트 `p0-7.test.ts`) */
export const P07_VALUES = (() => {
  const fr = 3000 / 60;
  const gear = gearPair(15, 60, fr);
  const brg = bearingFrequencies(BEARING_6205, fr);
  const brgX = bearingFrequencies(BEARING_6205, 1);
  const pumpFr = 3600 / 60;
  const fanMotorFr = PRESETS.beltFan.rpm / 60;
  return {
    fr,
    gearMesh: gear.mesh,
    gearOut: gear.f2,
    bladePass7: bladePass(7, pumpFr),
    brg,
    brgX,
    belt: beltFrequency(EXAMPLE.motorPulley, EXAMPLE.beltLength, fanMotorFr),
    fanMotorFr,
    fanFr: (fanMotorFr * EXAMPLE.motorPulley) / EXAMPLE.fanPulley,
    twoFL: electromagneticForce(LINE_FREQUENCY),
    pumpRpm: PRESETS.motorPump.rpm,
    /** 전동기-펌프 기동: 2X가 받침대 고유진동수를 지나는 회전수 */
    cross2X: (EXAMPLE.structureNatural / 2) * 60,
    /** 날개 통과(7X)가 받침대 고유진동수를 지나는 회전수 */
    crossBp: (EXAMPLE.structureNatural / 7) * 60,
  };
})();
const V = P07_VALUES;

// 그림 1 — 한 기계 안의 요소들 (도식)
const X1: [number, number] = [0, 30];
const Y1 = squareYRange(X1, 175);
export const machineElements: FigureSpec = {
  id: 'fig-p0-7-1',
  caption:
    '그림 1. 전동기가 커플링을 거쳐 펌프를 돌리는 기계. 축(불평형·정렬), 구름베어링, 펌프 날개, 전동기의 자기력, 받침대가 저마다 다른 박자로 기계를 흔든다. 위 회색 글씨는 이 페이지에서 셀 주파수의 이름이다.',
  panels: [
    {
      frame: false,
      height: 175,
      x: { range: X1 },
      y: { range: Y1 },
      series: [],
      annotations: [
        { type: 'ground', x1: 0.8, y1: 1.0, x2: 29.2, y2: 1.0, side: 'right' },
        { type: 'rect', x1: 1.5, x2: 8.5, y1: 1.05, y2: 5.2, color: 'muted', label: '전동기' },
        { type: 'line', x1: 8.5, y1: 3.4, x2: 12.6, y2: 3.4, color: 'text', width: 4 },
        { type: 'rect', x1: 12.6, x2: 14.2, y1: 2.6, y2: 4.2, color: 'c1' },
        { type: 'line', x1: 14.2, y1: 3.4, x2: 22.0, y2: 3.4, color: 'text', width: 4 },
        { type: 'rect', x1: 15.6, x2: 16.8, y1: 1.05, y2: 4.0, color: 'c1' },
        { type: 'rect', x1: 19.0, x2: 20.2, y1: 1.05, y2: 4.0, color: 'c1' },
        { type: 'rect', x1: 22.0, x2: 28.2, y1: 1.05, y2: 5.6, color: 'muted', label: '펌프' },
        { type: 'text', x: 25.1, y: 2.0, text: '날개 7개', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 5.0, y: 7.0, text: '전동기', anchor: 'middle', bold: true },
        { type: 'text', x: 5.0, y: 6.2, text: '자기력 2 f_L', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 12.0, y: 7.0, text: '축 · 커플링', anchor: 'middle', bold: true },
        { type: 'text', x: 12.0, y: 6.2, text: '1X · 2X', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 17.9, y: 7.0, text: '구름베어링', anchor: 'middle', bold: true },
        { type: 'text', x: 17.9, y: 6.2, text: 'BPFO · BPFI', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 25.1, y: 7.0, text: '펌프 날개', anchor: 'middle', bold: true },
        { type: 'text', x: 25.1, y: 6.2, text: '날개 통과', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 15.0, y: 0.25, text: '받침대(구조): 정해진 고유진동수', anchor: 'middle', color: 'muted' },
      ],
    },
  ],
};

// 그림 2 — 세는 규칙: 한 바퀴에 k번 → k × 1X
const revMs = 1000 / V.fr; // 20 ms
const events = (k: number) => Array.from({ length: 2 * k }, (_, i) => 3 + (i * revMs) / k);
const revLines: FigAnnotation[] = [revMs, 2 * revMs].map((t) => ({ type: 'vline', x: t, color: 'muted', dash: true }));
export const countingRule: FigureSpec = {
  id: 'fig-p0-7-2',
  caption: `그림 2. 3000 rpm(한 바퀴 ${formatNumber(revMs, 3)} ms)으로 도는 축에서 일어나는 사건을 시각에 따라 막대로 세웠다. 회색 점선이 한 바퀴의 끝이다. 위: 한 바퀴에 1번(불평형이 한 번 미는 것처럼) → 1초에 ${V.fr}번 = 1X = ${V.fr} Hz. 가운데: 한 바퀴에 3번 → 1초에 ${3 * V.fr}번 = 3X. 아래: 두 사건의 주파수를 주파수 축 위에 줄로 세운 주파수 지도. 줄의 높이에는 뜻이 없고 위치만 본다. 회색 점선은 1X의 정수배(하모닉) 자리다.`,
  panels: [
    {
      title: '한 바퀴에 1번',
      series: [{ x: events(1), y: events(1).map(() => 1), kind: 'stem', color: 'c1', width: 2.4 }],
      annotations: [...revLines, { type: 'text', x: revMs, y: 1.15, text: '한 바퀴', anchor: 'end', color: 'muted', dx: -4 }],
      x: { range: [0, 2 * revMs + 1] },
      y: { range: [0, 1.4], ticks: 'none' },
      height: 80,
    },
    {
      title: '한 바퀴에 3번',
      series: [{ x: events(3), y: events(3).map(() => 1), kind: 'stem', color: 'c2', width: 2.4 }],
      annotations: revLines,
      x: { range: [0, 2 * revMs + 1], label: '시각 [ms]' },
      y: { range: [0, 1.4], ticks: 'none' },
      height: 80,
    },
    {
      title: '주파수 지도',
      series: [
        { x: [V.fr], y: [1], kind: 'stem', color: 'c1', width: 3 },
        { x: [3 * V.fr], y: [1], kind: 'stem', color: 'c2', width: 3 },
      ],
      annotations: [
        ...[2, 4, 5, 6].map((k): FigAnnotation => ({ type: 'vline', x: k * V.fr, color: 'muted', dash: true })),
        { type: 'text', x: V.fr, y: 1.12, text: `1X = ${V.fr} Hz`, anchor: 'middle', color: 'c1' },
        { type: 'text', x: 3 * V.fr, y: 1.12, text: `3X = ${3 * V.fr} Hz`, anchor: 'middle', color: 'c2' },
      ],
      x: { range: [0, 330], ticks: [0, 50, 100, 150, 200, 250, 300], label: '주파수 [Hz]' },
      y: { range: [0, 1.35], ticks: 'none' },
      height: 105,
    },
  ],
};

// 그림 3 — 날개와 기어 (도식)
const X3: [number, number] = [0, 30];
const Y3 = squareYRange(X3, 220);
const imp = { x: 6.5, y: 4.6, hub: 0.7, tip: 2.8, casing: 3.4, blades: 7 };
const bladeLines: FigAnnotation[] = Array.from({ length: imp.blades }, (_, k) => {
  const a = Math.PI / 2 + (2 * Math.PI * k) / imp.blades;
  return { type: 'line', x1: imp.x + imp.hub * Math.cos(a), y1: imp.y + imp.hub * Math.sin(a), x2: imp.x + imp.tip * Math.cos(a), y2: imp.y + imp.tip * Math.sin(a), color: 'c1', width: 3 };
});
const tongueA = (20 * Math.PI) / 180;
const gA = { x: 15.6, y: 4.6, r: 0.95, z: 15 };
const gB = { x: gA.x + 5 * gA.r, y: 4.6, r: 4 * gA.r, z: 60 };
const teeth = (g: { x: number; y: number; r: number; z: number }, color: 'c1' | 'c3'): FigAnnotation[] =>
  Array.from({ length: g.z }, (_, k) => {
    const a = (2 * Math.PI * k) / g.z;
    return { type: 'line', x1: g.x + (g.r - 0.13) * Math.cos(a), y1: g.y + (g.r - 0.13) * Math.sin(a), x2: g.x + (g.r + 0.13) * Math.cos(a), y2: g.y + (g.r + 0.13) * Math.sin(a), color, width: 2 };
  });
export const bladesAndGears: FigureSpec = {
  id: 'fig-p0-7-3',
  caption: `그림 3. 한 바퀴에 여러 번 일어나는 일. 왼쪽: 날개 7개짜리 펌프 날개바퀴. 케이싱의 한 점(고정점)을 날개가 한 바퀴에 7번 지나가므로 날개 통과 주파수 = 7 × 1X다 (3600 rpm이면 ${hz(V.bladePass7)} Hz). 오른쪽: 이빨 15개 기어(파랑)가 이빨 60개 기어(초록)를 돌린다. 작은 기어가 3000 rpm(${V.fr} Hz)이면 1초에 15 × ${V.fr} = ${hz(V.gearMesh)}번 이빨이 맞물린다 = 맞물림 주파수. 큰 기어도 같은 1초 동안 같은 수의 이빨이 맞물리므로 60 × f₂ = ${hz(V.gearMesh)} → f₂ = ${hz(V.gearOut)} Hz.`,
  panels: [
    {
      frame: false,
      height: 220,
      x: { range: X3 },
      y: { range: Y3 },
      series: [],
      annotations: [
        { type: 'text', x: imp.x, y: Y3[1] - 0.5, text: '펌프 날개 7개', anchor: 'middle', bold: true },
        { type: 'circle', x: imp.x, y: imp.y, r: imp.casing * PX_PER_UNIT, dash: true, color: 'muted' },
        { type: 'circle', x: imp.x, y: imp.y, r: imp.hub * PX_PER_UNIT, fill: true, color: 'muted' },
        ...bladeLines,
        { type: 'point', x: imp.x + imp.casing * Math.cos(tongueA), y: imp.y + imp.casing * Math.sin(tongueA), color: 'warn', label: '고정점', dx: 8, dy: -6 },
        { type: 'text', x: imp.x, y: 0.4, text: '한 바퀴에 7번 지나감 → 7 × 1X', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 20.0, y: Y3[1] - 0.5, text: '기어 한 쌍 (이빨 15 · 60)', anchor: 'middle', bold: true },
        { type: 'circle', x: gA.x, y: gA.y, r: gA.r * PX_PER_UNIT, color: 'c1' },
        ...teeth(gA, 'c1'),
        { type: 'circle', x: gB.x, y: gB.y, r: gB.r * PX_PER_UNIT, color: 'c3' },
        ...teeth(gB, 'c3'),
        { type: 'text', x: gA.x, y: gA.y - gA.r - 0.75, text: `${V.fr} Hz`, anchor: 'middle', color: 'c1' },
        { type: 'text', x: gB.x, y: gB.y - 0.15, text: `${hz(V.gearOut)} Hz`, anchor: 'middle', color: 'c3' },
        { type: 'point', x: gA.x + gA.r, y: gA.y, color: 'warn' },
        { type: 'line', x1: gA.x + gA.r, y1: gA.y + 0.15, x2: gA.x + gA.r - 0.5, y2: gA.y + 1.9, color: 'warn', width: 1.2 },
        { type: 'text', x: gA.x + gA.r - 0.5, y: gA.y + 2.1, text: `맞물림 ${hz(V.gearMesh)} Hz`, anchor: 'end', color: 'warn' },
      ],
    },
  ],
};

// 그림 4 — 구름베어링 단면 (도식)
const X4: [number, number] = [0, 30];
const Y4 = squareYRange(X4, 230);
const B = { x: 8.5, y: 4.9, pitch: 2.7, ball: 0.55, n: 9 };
const ang = (deg: number) => (deg * Math.PI) / 180;
const ballCircles: FigAnnotation[] = Array.from({ length: B.n }, (_, k) => {
  const a = Math.PI / 2 + (2 * Math.PI * k) / B.n;
  return { type: 'circle', x: B.x + B.pitch * Math.cos(a), y: B.y + B.pitch * Math.sin(a), r: B.ball * PX_PER_UNIT, fill: true, color: 'c1' };
});
const at = (r: number, deg: number): [number, number] => [B.x + r * Math.cos(ang(deg)), B.y + r * Math.sin(ang(deg))];
const tag = (y: number, text: string, target: [number, number], color: 'text' | 'c1' | 'c2' | 'muted' = 'text'): FigAnnotation[] => [
  { type: 'text', x: 14.2, y: y - 0.12, text, anchor: 'start', color },
  { type: 'line', x1: 14.0, y1: y, x2: target[0], y2: target[1], color: 'muted', width: 1.2 },
];
export const bearingSection: FigureSpec = {
  id: 'fig-p0-7-4',
  caption:
    '그림 4. 구름베어링을 축 방향에서 본 단면 (볼 9개). 바깥 바퀴(외륜)는 하우징에 끼워져 멈춰 있고, 안쪽 바퀴(내륜)는 축에 끼워져 축과 함께 돈다. 볼은 두 바퀴 사이를 구르고, 케이지(회색 점선, 볼 중심을 잇는 원)가 볼 사이 간격을 잡아 준다. 볼 지름 d와 볼 중심이 그리는 원의 지름(피치 지름) D의 비는 실제 6205 베어링과 같게(d/D ≈ 0.2) 그렸다.',
  panels: [
    {
      frame: false,
      height: 230,
      x: { range: X4 },
      y: { range: Y4 },
      series: [],
      annotations: [
        { type: 'text', x: B.x, y: Y4[1] - 0.5, text: '구름베어링 단면', anchor: 'middle', bold: true },
        { type: 'circle', x: B.x, y: B.y, r: 4.0 * PX_PER_UNIT, color: 'text' },
        { type: 'circle', x: B.x, y: B.y, r: (B.pitch + B.ball) * PX_PER_UNIT, color: 'text' },
        { type: 'circle', x: B.x, y: B.y, r: (B.pitch - B.ball) * PX_PER_UNIT, color: 'c2' },
        { type: 'circle', x: B.x, y: B.y, r: 1.35 * PX_PER_UNIT, fill: true, color: 'muted', label: '축' },
        { type: 'circle', x: B.x, y: B.y, r: B.pitch * PX_PER_UNIT, dash: true, color: 'muted' },
        ...ballCircles,
        ...tag(8.4, '외륜: 하우징에 끼워져 멈춰 있다', at(3.6, 40)),
        ...tag(6.6, '볼 9개: 두 바퀴 사이를 구른다', at(B.pitch + 0.4, 10), 'c1'),
        ...tag(4.6, '케이지(점선): 볼 간격을 잡고 볼과 함께 돈다', at(B.pitch, 350), 'muted'),
        ...tag(2.5, '내륜: 축과 함께 f_r로 돈다', at(1.75, 290), 'c2'),
        { type: 'text', x: B.x, y: 0.3, text: '외륜 멈춤 · 내륜과 축 회전', anchor: 'middle', color: 'muted' },
      ],
    },
  ],
};

// 그림 5 — 사이에 낀 것은 절반 속도로 간다 (굴림대, 기름막)
const X5: [number, number] = [0, 30];
const Y5 = squareYRange(X5, 160);
const profileY = [1.55, 2.15, 2.75, 3.35];
const wallY = 1.2;
const shaftY = 3.7;
const uLen = 6;
export const halfSpeed: FigureSpec = {
  id: 'fig-p0-7-5',
  caption:
    '그림 5. 멈춘 판과 움직이는 판 사이에 낀 것은 위 판 속도의 절반쯤으로 간다. 왼쪽: 아래 판(외륜)이 멈춰 있고 위 판(내륜)이 v로 움직이면, 미끄러지지 않고 구르는 굴림대(볼)의 중심은 v/2로 간다. 그래서 케이지는 내륜보다 느리게 돈다. 오른쪽: 멈춘 베어링 면과 U로 도는 축 표면 사이의 기름은 축 쪽은 U, 베어링 쪽은 0으로 흘러 평균 속도가 U/2쯤이다.',
  panels: [
    {
      frame: false,
      height: 160,
      x: { range: X5 },
      y: { range: Y5 },
      series: [],
      annotations: [
        { type: 'text', x: 7.0, y: Y5[1] - 0.45, text: '굴림대: 중심은 v/2', anchor: 'middle', bold: true },
        { type: 'ground', x1: 1.0, y1: wallY, x2: 13.0, y2: wallY, side: 'right' },
        { type: 'circle', x: 6.0, y: wallY + 0.8, r: 0.8 * PX_PER_UNIT, fill: true, color: 'c1' },
        { type: 'rect', x1: 2.5, x2: 12.5, y1: wallY + 1.6, y2: wallY + 2.1, color: 'c2' },
        { type: 'arrow', x1: 8.6, y1: wallY + 2.75, x2: 11.6, y2: wallY + 2.75, color: 'c2', double: false, label: 'v (위 판 = 내륜)', labelDy: -8 },
        { type: 'arrow', x1: 6.0, y1: wallY + 0.8, x2: 7.5, y2: wallY + 0.8, color: 'warn', double: false },
        { type: 'text', x: 8.0, y: wallY + 0.6, text: 'v/2', anchor: 'start', color: 'warn', bold: true },
        { type: 'text', x: 7.0, y: 0.25, text: '아래 판 멈춤 = 외륜', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 22.5, y: Y5[1] - 0.45, text: '기름막: 평균 ≈ U/2', anchor: 'middle', bold: true },
        { type: 'ground', x1: 17.0, y1: wallY, x2: 28.5, y2: wallY, side: 'right' },
        { type: 'rect', x1: 17.0, x2: 28.5, y1: shaftY, y2: shaftY + 0.4, color: 'muted' },
        { type: 'arrow', x1: 23.0, y1: shaftY + 0.95, x2: 26.0, y2: shaftY + 0.95, color: 'c2', double: false, label: 'U (축 표면)', labelDy: -8 },
        ...profileY.map((y): FigAnnotation => ({ type: 'arrow', x1: 18.5, y1: y, x2: 18.5 + (uLen * (y - wallY)) / (shaftY - wallY), y2: y, color: 'c1', double: false })),
        { type: 'line', x1: 18.5, y1: wallY, x2: 18.5 + uLen, y2: shaftY, color: 'c1', dash: true, width: 1.2 },
        { type: 'text', x: 22.5, y: 0.25, text: '베어링 면 멈춤 (속도 0)', anchor: 'middle', color: 'muted' },
      ],
    },
  ],
};

// 그림 6 — 베어링 줄은 하모닉 사이에 선다 (6205, 3000 rpm)
const bx = V.brgX;
const brgStems = [
  { x: bx.ftf, h: 0.62, color: 'c3' as const, name: 'FTF' },
  { x: bx.bsf, h: 0.78, color: 'c4' as const, name: 'BSF' },
  { x: bx.bpfo, h: 1.0, color: 'c1' as const, name: 'BPFO' },
  { x: bx.bpfi, h: 0.9, color: 'c2' as const, name: 'BPFI' },
];
export const bearingLines: FigureSpec = {
  id: 'fig-p0-7-6',
  caption: `그림 6. 6205 베어링(볼 9개, d = 7.94 mm, D = 39.04 mm)의 네 주파수 — 케이지 FTF(초록), 볼 자전 BSF(보라), 외륜 BPFO(파랑), 내륜 BPFI(주황) — 를 1X의 배수로 세운 주파수 지도. 회색 점선은 1X의 정수배(하모닉) 자리다. 케이지 ${formatNumber(bx.ftf, 4)}X, 볼 자전 ${formatNumber(bx.bsf, 4)}X, 외륜 ${formatNumber(bx.bpfo, 4)}X, 내륜 ${formatNumber(bx.bpfi, 4)}X — 모두 점선 사이에 선다. 3000 rpm(1X = ${V.fr} Hz)이면 외륜 ${hz(V.brg.bpfo)} Hz, 내륜 ${hz(V.brg.bpfi)} Hz다. 외륜과 내륜을 더하면 정확히 9X(볼 수 × 1X)다.`,
  panels: [
    {
      series: brgStems.map((s) => ({ x: [s.x], y: [s.h], kind: 'stem' as const, color: s.color, width: 3 })),
      annotations: [
        ...Array.from({ length: 9 }, (_, i): FigAnnotation => ({ type: 'vline', x: i + 1, color: 'muted', dash: true })),
        ...brgStems.map((s): FigAnnotation => ({ type: 'text', x: s.x, y: s.h + 0.1, text: `${s.name} ${formatNumber(s.x, 3)}X`, anchor: 'middle', color: s.color })),
      ],
      x: {
        range: [0, 9.6],
        ticks: Array.from({ length: 10 }, (_, i) => i),
        tickLabels: Array.from({ length: 10 }, (_, i) => ({ value: i, label: i === 0 ? '0' : `${i}X` })),
        label: '주파수 (1X의 배수)',
      },
      y: { range: [0, 1.3], ticks: 'none' },
      height: 150,
    },
  ],
};

// 그림 7 — 흠집의 충격은 높은 주파수를 울린다
const RING = { fn: 3000, zeta: 0.04 };
const ringSys = { mass: 1, stiffness: (2 * Math.PI * RING.fn) ** 2, damping: 2 * RING.zeta * 2 * Math.PI * RING.fn };
const impactPeriod = 1 / V.brg.bpfo;
const tMax7 = 0.025;
const t7 = grid(0, tMax7, 5001);
const impacts = Array.from({ length: Math.ceil(tMax7 / impactPeriod) }, (_, i) => 0.0008 + i * impactPeriod).filter((t) => t < tMax7);
const ring7 = t7.map((t) => impacts.reduce((sum, ti) => (t >= ti ? sum + freeResponseAt(ringSys, { x0: 0, v0: 1 }, t - ti).x : sum), 0));
const ringPeak = Math.max(...ring7.map(Math.abs));
const ring7n = ring7.map((v) => v / ringPeak);
const tZoom = grid(0, 0.0015, 1201);
const ringZoom = tZoom.map((t) => freeResponseAt(ringSys, { x0: 0, v0: 1 }, t).x / ringPeak);
export const impactRinging: FigureSpec = {
  id: 'fig-p0-7-7',
  caption: `그림 7. 외륜 흠집 위를 볼이 지날 때마다 짧은 충격이 생기고, 충격은 하우징을 고유진동수(예시 ${RING.fn / 1000} kHz, 감쇠비 ${RING.zeta})로 울린다 — P0-3의 감쇠 자유진동이 BPFO 박자(${hz(V.brg.bpfo)} Hz, ${formatNumber(impactPeriod * 1000, 3)} ms 간격)로 되풀이된다. 위: 25 ms 동안의 파형. 가운데: 충격 하나를 1.5 ms만 확대 — 한 번 울리는 데 ${formatNumber(1000 / RING.fn, 3)} ms. 아래: 주파수 지도. 흔들림의 대부분은 울림 주파수 근처(주황 띠)에 모이고, 되풀이 박자 ${hz(V.brg.bpfo)} Hz는 울림이 반복되는 간격으로만 드러난다.`,
  panels: [
    {
      title: '25 ms 동안 (정규화)',
      series: [{ x: t7.map((t) => t * 1000), y: ring7n, color: 'c1', width: 1.2 }],
      annotations: [
        { type: 'arrow', x1: impacts[1] * 1000, y1: 1.15, x2: impacts[2] * 1000, y2: 1.15, color: 'warn', label: `${formatNumber(impactPeriod * 1000, 3)} ms = 1 / BPFO`, labelDy: -6 },
      ],
      x: { range: [0, tMax7 * 1000], label: '시각 [ms]' },
      y: { range: [-1.2, 1.5], ticks: 'none' },
      height: 130,
    },
    {
      title: '충격 하나 확대',
      series: [{ x: tZoom.map((t) => t * 1000), y: ringZoom, color: 'c1', width: 1.6 }],
      annotations: [
        { type: 'arrow', x1: 0.25 / RING.fn * 1000 + (1000 / RING.fn) * 1, y1: 1.05, x2: 0.25 / RING.fn * 1000 + (1000 / RING.fn) * 2, y2: 1.05, color: 'warn', label: `${formatNumber(1000 / RING.fn, 3)} ms → ${RING.fn / 1000} kHz`, labelDy: -6 },
      ],
      x: { range: [0, 1.5], label: '시각 [ms]' },
      y: { range: [-1.2, 1.4], ticks: 'none' },
      height: 110,
    },
    {
      title: '주파수 지도',
      series: [{ x: [Math.log10(V.brg.bpfo)], y: [0.6], kind: 'stem', color: 'c1', width: 2.4 }],
      annotations: [
        { type: 'band', x1: Math.log10(RING.fn * 0.85), x2: Math.log10(RING.fn * 1.15), color: 'warn', label: '울림이 모이는 곳' },
        { type: 'text', x: Math.log10(V.brg.bpfo), y: 0.75, text: `되풀이 박자 BPFO ${hz(V.brg.bpfo)} Hz`, anchor: 'middle', color: 'c1' },
      ],
      x: { range: [1, 4.3], ticks: [1, 2, 3, 4], tickLabels: logTicks(1, 4), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [0, 1.1], ticks: 'none' },
      height: 95,
    },
  ],
};

// 그림 8 — 벨트와 1X보다 낮은 줄
const X8: [number, number] = [0, 30];
const Y8 = squareYRange(X8, 140);
const pm = { x: 6.0, y: 2.9, r: 1.0 };
const pf = { x: 21.5, y: 2.9, r: 2.0 };
const fanBrg = bearingFrequencies(BEARING_6205, V.fanFr);
const sub8 = [
  { f: fanBrg.ftf, h: 0.55, color: 'c4' as const, name: '팬 베어링 FTF' },
  { f: V.belt, h: 1.0, color: 'c2' as const, name: '벨트' },
  { f: V.fanFr, h: 0.75, color: 'c3' as const, name: '팬 1X' },
  { f: 2 * V.belt, h: 0.55, color: 'c2' as const, name: '벨트 × 2' },
  { f: V.fanMotorFr, h: 1.0, color: 'c1' as const, name: '전동기 1X' },
];
export const beltDrive: FigureSpec = {
  id: 'fig-p0-7-8',
  caption: `그림 8. 벨트 구동 팬. 위: 지름 ${EXAMPLE.motorPulley} m 풀리가 ${PRESETS.beltFan.rpm} rpm(${hz(V.fanMotorFr)} Hz)으로 돌고, 지름 ${EXAMPLE.fanPulley} m 풀리는 절반 빠르기(${hz(V.fanFr)} Hz)로 돈다. 길이 ${EXAMPLE.beltLength} m 벨트는 1초에 π × ${EXAMPLE.motorPulley} × ${hz(V.fanMotorFr)} ÷ ${EXAMPLE.beltLength} = ${hz(V.belt)}바퀴 돈다. 아래: 전동기 1X(파랑) 아래에 벨트(주황), 팬 축 1X(초록), 팬 베어링 케이지(보라)가 선다 — 모두 1X보다 낮은 줄이다.`,
  panels: [
    {
      frame: false,
      height: 140,
      x: { range: X8 },
      y: { range: Y8 },
      series: [],
      annotations: [
        { type: 'text', x: 13.75, y: Y8[1] - 0.4, text: '벨트 구동 팬', anchor: 'middle', bold: true },
        { type: 'circle', x: pm.x, y: pm.y, r: pm.r * PX_PER_UNIT, color: 'c1' },
        { type: 'circle', x: pf.x, y: pf.y, r: pf.r * PX_PER_UNIT, color: 'c3' },
        { type: 'line', x1: pm.x, y1: pm.y + pm.r, x2: pf.x, y2: pf.y + pf.r, color: 'c2', width: 2.4 },
        { type: 'line', x1: pm.x, y1: pm.y - pm.r, x2: pf.x, y2: pf.y - pf.r, color: 'c2', width: 2.4 },
        { type: 'text', x: 13.75, y: 4.75, text: `벨트 길이 ${EXAMPLE.beltLength} m`, anchor: 'middle', color: 'c2' },
        { type: 'text', x: pm.x, y: 0.3, text: `전동기 풀리 ${EXAMPLE.motorPulley} m`, anchor: 'middle', color: 'c1' },
        { type: 'text', x: pf.x + 4.6, y: pf.y - 0.1, text: `팬 풀리 ${EXAMPLE.fanPulley} m`, anchor: 'start', color: 'c3' },
      ],
    },
    {
      title: '1X보다 낮은 줄',
      series: sub8.map((s) => ({ x: [s.f], y: [s.h], kind: 'stem' as const, color: s.color, width: 3 })),
      annotations: sub8.map((s): FigAnnotation => ({ type: 'text', x: s.f, y: s.h + 0.1, text: `${s.name} ${formatNumber(s.f, 3)}`, anchor: 'middle', color: s.color })),
      x: { range: [0, 35], ticks: [0, 5, 10, 15, 20, 25, 30, 35], label: '주파수 [Hz]' },
      y: { range: [0, 1.3], ticks: 'none' },
      height: 120,
    },
  ],
};

// 그림 9 — 기동하면서 움직이는 줄과 제자리 줄 (전동기-펌프)
const rpmTop = PRESETS.motorPump.rpm;
const rays = [
  { k: 1, color: 'c1' as const, name: '1X' },
  { k: 2, color: 'c3' as const, name: '2X' },
  { k: 7, color: 'c4' as const, name: '날개 통과 7X' },
];
export const runUpMap: FigureSpec = {
  id: 'fig-p0-7-9',
  caption: `그림 9. 전동기-펌프(날개 7개)를 0에서 ${rpmTop} rpm까지 기동할 때, 세로축 회전수마다 각 줄이 가로축 어디에 서는지 그렸다. 회전 관련 줄(1X 파랑, 2X 초록, 날개 통과 보라)은 원점에서 뻗는 직선을 따라 오른쪽으로 움직인다. 전원에 묶인 2 f_L = ${V.twoFL} Hz(회색 점선)와 받침대 고유진동수 ${EXAMPLE.structureNatural} Hz(주황 점선, 예시)는 회전수와 상관없이 제자리다. 직선이 주황 점선과 만나는 회전수(날개 통과 ${formatNumber(V.crossBp, 3)} rpm, 2X ${formatNumber(V.cross2X, 4)} rpm)에서 그 고유진동수를 지나간다 — P0-6의 임계속도와 같은 일이다. 운전 회전수에서 2X(${hz((2 * rpmTop) / 60)} Hz)와 2 f_L(${V.twoFL} Hz)은 거의 겹친다.`,
  panels: [
    {
      series: rays.map((ray) => ({ x: [0, (ray.k * rpmTop) / 60], y: [0, rpmTop], color: ray.color, width: 2.4 })),
      annotations: [
        { type: 'vline', x: V.twoFL, color: 'muted', dash: true },
        { type: 'vline', x: EXAMPLE.structureNatural, color: 'warn', dash: true },
        { type: 'hline', y: rpmTop, color: 'muted', dash: true, label: `운전 ${rpmTop} rpm`, labelAt: 'start', labelBelow: true },
        { type: 'point', x: EXAMPLE.structureNatural, y: V.crossBp, color: 'warn' },
        { type: 'text', x: EXAMPLE.structureNatural, y: V.crossBp, text: `${formatNumber(V.crossBp, 3)} rpm`, anchor: 'end', color: 'warn', dx: -6, dy: -10 },
        { type: 'point', x: EXAMPLE.structureNatural, y: V.cross2X, color: 'warn' },
        { type: 'text', x: EXAMPLE.structureNatural, y: V.cross2X, text: `${formatNumber(V.cross2X, 4)} rpm`, anchor: 'end', color: 'warn', dx: -6, dy: -10 },
        { type: 'text', x: EXAMPLE.structureNatural, y: rpmTop + 260, text: `받침대 ${EXAMPLE.structureNatural} Hz`, anchor: 'end', color: 'warn', dx: -4 },
        { type: 'text', x: V.twoFL, y: rpmTop + 260, text: `2 f_L ${V.twoFL} Hz`, anchor: 'start', color: 'muted', dx: 4 },
        { type: 'text', x: 50, y: 3000, text: '1X', anchor: 'end', color: 'c1', dx: -6 },
        { type: 'text', x: 100, y: 3000, text: '2X', anchor: 'start', color: 'c3', dx: 6 },
        { type: 'text', x: (7 * 2600) / 60, y: 2600, text: '날개 통과 7X', anchor: 'end', color: 'c4', dx: -4, dy: -10 },
      ],
      x: { range: [0, 450], ticks: [0, 50, 100, 150, 200, 250, 300, 350, 400, 450], label: '주파수 [Hz]' },
      y: { range: [0, rpmTop + 450], ticks: [0, 1000, 2000, 3000], label: '회전수 [rpm]' },
      height: 210,
    },
  ],
};

// 그림 10 — 관심 주파수 구간 지도 (전동기-펌프, LAB-FMAP-01 처음 상태)
const pump = PRESETS.motorPump;
const map10 = buildMap('motorPump', { rpm: pump.rpm, count: pump.count, balls: pump.balls ?? 9 });
const L = Math.log10;
const nRows = map10.rows.length;
const rowY = (i: number) => nRows - i;
const zoneLabels = map10.zones.map((z): FigAnnotation => ({ type: 'text', x: (L(z.f1) + L(z.f2)) / 2, y: nRows + 0.75, text: z.label, anchor: 'middle', color: 'muted', bold: true }));
const SHORT: Record<string, string> = { '케이지 FTF': 'FTF', '외륜 BPFO': 'BPFO', '내륜 BPFI': 'BPFI', '볼 자전 BSF': 'BSF', };
const laneAnnotations: FigAnnotation[] = map10.rows.flatMap((row, i) => [
  { type: 'text', x: L(MAP_RANGE[0]) + 0.04, y: rowY(i) - 0.1, text: row.element, anchor: 'start', bold: true } as FigAnnotation,
  ...row.bands.map((b): FigAnnotation => ({ type: 'rect', x1: L(b.f1), x2: L(b.f2), y1: rowY(i) - 0.25, y2: rowY(i) + 0.25, color: 'warn', label: b.label })),
  ...row.lines.flatMap((line): FigAnnotation[] => [
    { type: 'line', x1: L(line.f), y1: rowY(i) - 0.28, x2: L(line.f), y2: rowY(i) + 0.28, color: line.kind === 'rotating' ? 'c1' : 'warn', dash: line.kind === 'fixed', width: 2.6 },
    { type: 'text', x: L(line.f), y: rowY(i) + 0.36, text: SHORT[line.label] ?? line.label, anchor: 'middle', color: line.kind === 'rotating' ? 'c1' : 'warn' },
  ]),
]);
export const interestMap: FigureSpec = {
  id: 'fig-p0-7-10',
  caption: `그림 10. 전동기-펌프(${pump.rpm} rpm, 1X = ${hz(map10.fr)} Hz, 날개 ${pump.count}개, 볼 ${pump.balls}개 베어링)의 관심 주파수 구간 지도 (가로축 로그 눈금). 요소마다 한 줄씩, 파랑 실선은 회전수를 따라 움직이는 줄, 주황 점선·띠는 제자리 줄이다. 회색 띠로 구간을 나눴다: 1X 아래 / 1X ~ 10X(${hz(map10.fr)} ~ ${hz(10 * map10.fr)} Hz) / 10X ~ 수 kHz / 수 kHz 이상. 이 기계에서 가장 높은 관심 주파수는 충격이 울리는 대역의 위 끝 ${hz(map10.highest)} Hz다.`,
  panels: [
    {
      series: [],
      annotations: [
        { type: 'band', x1: L(map10.zones[0].f1), x2: L(map10.zones[0].f2), color: 'muted' },
        { type: 'band', x1: L(map10.zones[2].f1), x2: L(map10.zones[2].f2), color: 'muted' },
        ...zoneLabels,
        ...laneAnnotations,
      ],
      x: { range: [L(MAP_RANGE[0]), L(MAP_RANGE[1])], ticks: [1, 2, 3, 4], tickLabels: logTicks(1, 4), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [0.35, nRows + 1.05], ticks: 'none' },
      height: 250,
    },
  ],
};
