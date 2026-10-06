/** P1-5 "여러 질량과 모드" 본문 그림. 계산은 lib/mck 해석해에서 수행한다. */
import { grid, squareYRange, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { symmetricTwoDofModes, twoDofForcedFRF, twoDofFreeResponse } from '../lib/mck';

const M = 1;
const K = 1000;
const KC = 1000;
const X0 = 0.01; // 10 mm

const SYSTEM_DEFAULT = {
  mass1: M,
  mass2: M,
  stiffnessLeft: K,
  stiffnessCoupling: KC,
  stiffnessRight: K,
};

const [MODE1, MODE2] = symmetricTwoDofModes(M, K, KC);

// kc = 0.1k 인 약한 결합계 (맥놀이용)
const KC_WEAK = 100;
const SYSTEM_WEAK = {
  mass1: M,
  mass2: M,
  stiffnessLeft: K,
  stiffnessCoupling: KC_WEAK,
  stiffnessRight: K,
};
const [WEAK_MODE1, WEAK_MODE2] = symmetricTwoDofModes(M, K, KC_WEAK);
const BEAT_FREQ_DIFF = WEAK_MODE2.frequencyHz - WEAK_MODE1.frequencyHz;
const BEAT_PERIOD = 1 / BEAT_FREQ_DIFF;

export const P0_5_REFERENCE = {
  f1: MODE1.frequencyHz,
  f2: MODE2.frequencyHz,
  ratio: MODE2.omega / MODE1.omega, // sqrt(3)
  weakF1: WEAK_MODE1.frequencyHz,
  weakF2: WEAK_MODE2.frequencyHz,
  weakBeatPeriod: BEAT_PERIOD,
} as const;

const f = (v: number, sig = 3) => formatNumber(v, sig);
const mm = (v: number) => 1000 * v;

// ── 그림 1: 2자유도 모델 도식 ──────────────────────────────────
export const twoDofModel: FigureSpec = {
  id: 'fig-p1-5-1',
  caption:
    '그림 1. 양쪽 벽 사이에 질량 2개와 스프링 3개(k, k_c, k)를 나란히 연결한 2자유도계. 움직이는 질량이 둘이므로 위치를 나타내는 변위도 x₁과 x₂ 두 개가 필요하다. 가운데 스프링 k_c가 두 질량의 움직임을 서로 엮는다(연성).',
  panels: [
    {
      frame: false,
      height: 150,
      x: { range: [0, 12] },
      y: { range: squareYRange([0, 12], 150) },
      series: [],
      annotations: [
        { type: 'ground', x1: 0.6, y1: 0.2, x2: 0.6, y2: 1.6, side: 'left' },
        { type: 'spring', x1: 0.6, y1: 0.9, x2: 3.2, y2: 0.9, coils: 6, label: '강성 k' },
        { type: 'rect', x1: 3.2, x2: 4.6, y1: 0.3, y2: 1.5, label: 'm₁', color: 'c1' },
        { type: 'arrow', x1: 3.9, y1: 1.75, x2: 5.1, y2: 1.75, label: 'x₁', color: 'c1', double: false },
        { type: 'spring', x1: 4.6, y1: 0.9, x2: 7.4, y2: 0.9, coils: 6, label: '연성 k_c' },
        { type: 'rect', x1: 7.4, x2: 8.8, y1: 0.3, y2: 1.5, label: 'm₂', color: 'c2' },
        { type: 'arrow', x1: 8.1, y1: 1.75, x2: 9.3, y2: 1.75, label: 'x₂', color: 'c2', double: false },
        { type: 'spring', x1: 8.8, y1: 0.9, x2: 11.4, y2: 0.9, coils: 6, label: '강성 k' },
        { type: 'ground', x1: 11.4, y1: 0.2, x2: 11.4, y2: 1.6, side: 'right' },
      ],
    },
  ],
};

// ── 그림 2: 두 가지 고유 모드 형상 도식 ────────────────────────
export const modeShapesDiagram: FigureSpec = {
  id: 'fig-p1-5-2',
  caption: `그림 2. 대칭 2자유도계의 두 가지 고유 모드 형상. 위(1차 모드): 두 질량이 같은 방향으로 같이 움직여(동상 [1, 1]) 가운데 스프링이 늘어나지도 줄어들지도 않는다. 고유진동수는 f₁ = ${f(P0_5_REFERENCE.f1, 3)} Hz다. 아래(2차 모드): 두 질량이 반대 방향으로 마주보며 움직여(역상 [1, −1]) 가운데 스프링이 2배로 찌그러진다. 유효 강성이 k + 2k_c가 되어 주파수가 √3배인 f₂ = ${f(P0_5_REFERENCE.f2, 3)} Hz로 높아진다.`,
  panels: [
    {
      title: '1차 모드: 동상 [1, 1] — 가운데 스프링 길이 불변',
      frame: false,
      height: 120,
      x: { range: [0, 12] },
      y: { range: squareYRange([0, 12], 120) },
      series: [],
      annotations: [
        { type: 'ground', x1: 0.6, y1: 0.2, x2: 0.6, y2: 1.6, side: 'left' },
        { type: 'spring', x1: 0.6, y1: 0.9, x2: 4.0, y2: 0.9, coils: 7, label: '늘어남' },
        { type: 'rect', x1: 4.0, x2: 5.4, y1: 0.3, y2: 1.5, label: 'm₁ (+)', color: 'c1' },
        { type: 'arrow', x1: 4.7, y1: 1.7, x2: 5.7, y2: 1.7, label: '+1', color: 'c1' },
        { type: 'spring', x1: 5.4, y1: 0.9, x2: 8.2, y2: 0.9, coils: 6, label: '길이 그대로' },
        { type: 'rect', x1: 8.2, x2: 9.6, y1: 0.3, y2: 1.5, label: 'm₂ (+)', color: 'c1' },
        { type: 'arrow', x1: 8.9, y1: 1.7, x2: 9.9, y2: 1.7, label: '+1', color: 'c1' },
        { type: 'spring', x1: 9.6, y1: 0.9, x2: 11.4, y2: 0.9, coils: 4, label: '줄어듦' },
        { type: 'ground', x1: 11.4, y1: 0.2, x2: 11.4, y2: 1.6, side: 'right' },
      ],
    },
    {
      title: '2차 모드: 역상 [1, −1] — 가운데 스프링 2배 압축',
      frame: false,
      height: 120,
      x: { range: [0, 12] },
      y: { range: squareYRange([0, 12], 120) },
      series: [],
      annotations: [
        { type: 'ground', x1: 0.6, y1: 0.2, x2: 0.6, y2: 1.6, side: 'left' },
        { type: 'spring', x1: 0.6, y1: 0.9, x2: 4.0, y2: 0.9, coils: 7, label: '늘어남' },
        { type: 'rect', x1: 4.0, x2: 5.4, y1: 0.3, y2: 1.5, label: 'm₁ (+)', color: 'c1' },
        { type: 'arrow', x1: 4.7, y1: 1.7, x2: 5.7, y2: 1.7, label: '+1', color: 'c1' },
        { type: 'spring', x1: 5.4, y1: 0.9, x2: 6.6, y2: 0.9, coils: 3, label: '강하게 압축' },
        { type: 'rect', x1: 6.6, x2: 8.0, y1: 0.3, y2: 1.5, label: 'm₂ (−)', color: 'c2' },
        { type: 'arrow', x1: 7.3, y1: 1.7, x2: 6.3, y2: 1.7, label: '−1', color: 'c2' },
        { type: 'spring', x1: 8.0, y1: 0.9, x2: 11.4, y2: 0.9, coils: 7, label: '늘어남' },
        { type: 'ground', x1: 11.4, y1: 0.2, x2: 11.4, y2: 1.6, side: 'right' },
      ],
    },
  ],
};

// ── 그림 3: 순수 모드 초기 조건의 진동 ─────────────────────────
const t3 = grid(0, 0.6, 601);
const pureMode1 = twoDofFreeResponse(SYSTEM_DEFAULT, { x1: X0, x2: X0 }, t3);
const pureMode2 = twoDofFreeResponse(SYSTEM_DEFAULT, { x1: X0, x2: -X0 }, t3);

export const pureModeResponses: FigureSpec = {
  id: 'fig-p1-5-3',
  caption: `그림 3. 모드 형상 비율대로 초기 조건을 준 경우. 위: 두 질량을 같은 방향(+10 mm)으로 당겼다 놓으면 두 파형(파랑 x₁, 주황 x₂)이 완전히 일치하며 f₁ = ${f(P0_5_REFERENCE.f1, 3)} Hz의 단일 정현파로만 진동한다. 아래: 서로 반대(+10 mm, −10 mm)로 당겼다 놓으면 위상이 180° 반대이면서 f₂ = ${f(P0_5_REFERENCE.f2, 3)} Hz로만 진동한다. 다른 모드는 전혀 나타나지 않는다.`,
  panels: [
    {
      title: '모드 1 초기 조건 [10, 10] mm: 순수 5.03 Hz 동상 진동',
      series: [
        { x: t3, y: pureMode1.map((s) => mm(s.x1)), label: 'x₁ (질량 1)', color: 'c1', width: 2.2 },
        { x: t3, y: pureMode1.map((s) => mm(s.x2)), label: 'x₂ (질량 2)', color: 'c2', width: 1.8, dash: true },
      ],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, 0.6], label: '시간 t [s]' },
      y: { range: [-12, 12], ticks: [-10, -5, 0, 5, 10], label: '변위 [mm]' },
      height: 140,
    },
    {
      title: '모드 2 초기 조건 [10, −10] mm: 순수 8.72 Hz 역상 진동',
      series: [
        { x: t3, y: pureMode2.map((s) => mm(s.x1)), label: 'x₁ (질량 1)', color: 'c1', width: 2.2 },
        { x: t3, y: pureMode2.map((s) => mm(s.x2)), label: 'x₂ (질량 2)', color: 'c2', width: 2 },
      ],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, 0.6], label: '시간 t [s]' },
      y: { range: [-12, 12], ticks: [-10, -5, 0, 5, 10], label: '변위 [mm]' },
      height: 140,
    },
  ],
};

// ── 그림 4: 한쪽 질량만 당겼을 때: 모드 중첩 ──────────────────
const t4 = grid(0, 0.8, 801);
const mixedResp = twoDofFreeResponse(SYSTEM_DEFAULT, { x1: X0, x2: 0 }, t4);

export const modalSuperposition: FigureSpec = {
  id: 'fig-p1-5-4',
  caption: '그림 4. 질량 1만 10 mm 당겼다 놓았을 때(x₂ = 0). 위: 실제 변위 파형 x₁(파랑)과 x₂(주황)는 단순한 정현파가 아니라 두 박자가 섞여 울렁거린다. 아래: x₁을 1차 모드 성분(5 mm cos ω₁t, 초록)과 2차 모드 성분(5 mm cos ω₂t, 보라)으로 분해했다. [10, 0] mm는 모드 1(5 mm)과 모드 2(5 mm)의 정확한 1:1 합이다.',
  panels: [
    {
      title: '실제 변위 파형: 두 모드가 섞인 복잡한 왕복',
      series: [
        { x: t4, y: mixedResp.map((s) => mm(s.x1)), label: 'x₁ (질량 1)', color: 'c1', width: 2.2 },
        { x: t4, y: mixedResp.map((s) => mm(s.x2)), label: 'x₂ (질량 2)', color: 'c2', width: 2 },
      ],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, 0.8], label: '시간 t [s]' },
      y: { range: [-12, 12], ticks: [-10, -5, 0, 5, 10], label: '변위 [mm]' },
      height: 150,
    },
    {
      title: '질량 1의 모드 분해: x₁(t) = 모드 1(5 mm) + 모드 2(5 mm)',
      series: [
        { x: t4, y: mixedResp.map((s) => mm(s.x1)), label: '실제 x₁ (합)', color: 'c1', width: 1.5, dash: true },
        { x: t4, y: mixedResp.map((s) => mm(s.mode1[0])), label: '모드 1 성분 (5.03 Hz)', color: 'c3', width: 2 },
        { x: t4, y: mixedResp.map((s) => mm(s.mode2[0])), label: '모드 2 성분 (8.72 Hz)', color: 'c4', width: 2 },
      ],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, 0.8], label: '시간 t [s]' },
      y: { range: [-12, 12], ticks: [-10, -5, 0, 5, 10], label: '변위 [mm]' },
      height: 160,
    },
  ],
};

// ── 그림 5: 약한 결합계의 에너지 교환 (맥놀이) ─────────────────
const t5 = grid(0, 4.5, 1501);
const weakResp = twoDofFreeResponse(SYSTEM_WEAK, { x1: X0, x2: 0 }, t5);

export const beatEnergyExchange: FigureSpec = {
  id: 'fig-p1-5-5',
  caption: `그림 5. 가운데 스프링이 약할 때(k_c = 100 N/m, 0.1k) 질량 1만 당겼다 놓은 경우. 두 고유진동수(f₁ = ${f(P0_5_REFERENCE.weakF1, 3)} Hz, f₂ = ${f(P0_5_REFERENCE.weakF2, 3)} Hz)의 차이가 약 ${f(BEAT_FREQ_DIFF, 3)} Hz로 매우 작아진다. 질량 1(파랑)의 진폭이 서서히 줄어드는 동안 질량 2(주황)의 진폭이 최대로 커지고, 다시 질량 1로 되돌아온다. 주기는 약 ${f(P0_5_REFERENCE.weakBeatPeriod, 3)}초다.`,
  panels: [
    {
      series: [
        { x: t5, y: weakResp.map((s) => mm(s.x1)), label: 'x₁ (질량 1)', color: 'c1', width: 2 },
        { x: t5, y: weakResp.map((s) => mm(s.x2)), label: 'x₂ (질량 2)', color: 'c2', width: 2 },
      ],
      annotations: [
        { type: 'hline', y: 0, color: 'muted', dash: true },
        { type: 'arrow', x1: 0, y1: 11, x2: BEAT_PERIOD, y2: 11, label: `맥놀이 주기 T ≈ ${f(BEAT_PERIOD, 3)} s`, color: 'warn', double: true, labelDy: -8 },
      ],
      x: { range: [0, 4.5], label: '시간 t [s]' },
      y: { range: [-12, 13], ticks: [-10, -5, 0, 5, 10], label: '변위 [mm]' },
      height: 220,
    },
  ],
};

// ── 그림 6: 2자유도계 주파수응답 (FRF 봉우리 2개) ──────────────
const FRF_ZETA = 0.04;
const freqAxis = grid(1, 14, 601);
const frfData = freqAxis.map((freq) => {
  const omega = 2 * Math.PI * freq;
  return twoDofForcedFRF(SYSTEM_DEFAULT, omega, FRF_ZETA);
});

export const twoDofFrf: FigureSpec = {
  id: 'fig-p1-5-6',
  caption: `그림 6. 질량 1에 진폭 1 N의 조화 외력을 가했을 때의 주파수응답(FRF, 두 모드 모두 감쇠비 ζ = ${FRF_ZETA}). 1자유도는 공진 봉우리가 1개였지만(P1-4), 2자유도는 고유진동수 f₁ = ${f(P0_5_REFERENCE.f1, 3)} Hz와 f₂ = ${f(P0_5_REFERENCE.f2, 3)} Hz 두 곳에서 각각 공진 봉우리가 솟는다. 첫 봉우리에서는 두 질량이 같은 방향(동상), 둘째 봉우리에서는 서로 반대 방향(역상)으로 크게 흔들린다.`,
  panels: [
    {
      series: [
        { x: freqAxis, y: frfData.map((d) => d.X1 * 1000), label: 'X₁ (질량 1 응답)', color: 'c1', width: 2.2 },
        { x: freqAxis, y: frfData.map((d) => d.X2 * 1000), label: 'X₂ (질량 2 응답)', color: 'c2', width: 2 },
      ],
      annotations: [
        { type: 'vline', x: MODE1.frequencyHz, label: `1차 공진 (${f(MODE1.frequencyHz, 3)} Hz)`, color: 'c1', dash: true },
        { type: 'vline', x: MODE2.frequencyHz, label: `2차 공진 (${f(MODE2.frequencyHz, 3)} Hz)`, color: 'c2', dash: true },
      ],
      x: { range: [1, 14], label: '가진 주파수 f [Hz]' },
      // 봉우리 높이: 1차 ≈ 6.3 mm, 2차 ≈ 2.1 mm
      y: { range: [0, 7.5], ticks: [0, 2, 4, 6], label: '진폭 [mm]' },
      height: 230,
    },
  ],
};

// ── 그림 7: 연속체 구조물의 고유 모드 형상 도식 ─────────────────
const xBeam = grid(0, 10, 201);
const mode1Shape = xBeam.map((x) => Math.sin((Math.PI * x) / 10));
const mode2Shape = xBeam.map((x) => Math.sin((2 * Math.PI * x) / 10));
const mode3Shape = xBeam.map((x) => Math.sin((3 * Math.PI * x) / 10));

export const continuumModes: FigureSpec = {
  id: 'fig-p1-5-7',
  caption:
    '그림 7. 양 끝이 지지된 긴 배관이나 회전축(연속체)의 고유 모드 형상. 질량과 강성이 연속으로 퍼져 있어 모드가 1차, 2차, 3차…로 끝없이 이어진다. 1차 모드는 가운데가 가장 크게 휘고, 2차 모드는 가운데 절점(마디)을 중심으로 반대로 휘며, 3차 모드는 마디가 2개 생긴다. 실제 진단에서는 관심 주파수 대역의 낮은 차수 몇 개만 살핀다.',
  panels: [
    {
      title: '1차 굽힘 모드: 마디 0개 (가장 낮은 고유진동수)',
      series: [{ x: xBeam, y: mode1Shape, color: 'c1', width: 2.2 }],
      annotations: [
        { type: 'hline', y: 0, color: 'muted', dash: true },
        { type: 'point', x: 0, y: 0, label: '지지점', color: 'muted', dx: 6, dy: 14 },
        { type: 'point', x: 10, y: 0, label: '지지점', color: 'muted', dx: -30, dy: 14 },
      ],
      x: { range: [0, 10], label: '축 길이 방향 위치', ticks: [0, 2.5, 5, 7.5, 10] },
      y: { range: [-1.2, 1.2], ticks: [-1, 0, 1], label: '변위 형상' },
      height: 110,
    },
    {
      title: '2차 굽힘 모드: 마디 1개 (중간 고유진동수)',
      series: [{ x: xBeam, y: mode2Shape, color: 'c2', width: 2.2 }],
      annotations: [
        { type: 'hline', y: 0, color: 'muted', dash: true },
        // 곡선이 오른쪽 아래로 내려가므로 글자는 오른쪽 위에 둔다
        { type: 'point', x: 5, y: 0, label: '마디 (절점)', color: 'warn', dx: 10, dy: -8 },
      ],
      x: { range: [0, 10], label: '축 길이 방향 위치', ticks: [0, 2.5, 5, 7.5, 10] },
      y: { range: [-1.2, 1.2], ticks: [-1, 0, 1], label: '변위 형상' },
      height: 110,
    },
    {
      title: '3차 굽힘 모드: 마디 2개 (높은 고유진동수)',
      series: [{ x: xBeam, y: mode3Shape, color: 'c3', width: 2.2 }],
      annotations: [
        { type: 'hline', y: 0, color: 'muted', dash: true },
        { type: 'point', x: 10 / 3, y: 0, label: '마디 1', color: 'warn', dx: 10, dy: -8 },
        { type: 'point', x: 20 / 3, y: 0, label: '마디 2', color: 'warn', dx: 10, dy: 12 },
      ],
      x: { range: [0, 10], label: '축 길이 방향 위치', ticks: [0, 2.5, 5, 7.5, 10] },
      y: { range: [-1.2, 1.2], ticks: [-1, 0, 1], label: '변위 형상' },
      height: 110,
    },
  ],
};
