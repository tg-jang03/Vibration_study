/** P1-7 "회전기계의 진동: 불평형과 1X" 본문 그림. 계산은 lib/mck 해석해에서 수행한다. */
import { grid, squareYRange, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { unbalanceForce, unbalancePeak, unbalanceResponseFactor, unbalanceSteadyState } from '../lib/mck';

const TOTAL_MASS = 100; // 100 kg
const FN = 50; // 50 Hz (3000 rpm)
const OMEGA_N = 2 * Math.PI * FN; // 314.159 rad/s
const ME = 0.01; // mu * e = 0.01 kg*m
const E_CG_MM = (ME / TOTAL_MASS) * 1000; // 0.1 mm (100 um)
const ZETA = 0.05;

const low1500 = unbalanceSteadyState(TOTAL_MASS, ME, 2 * Math.PI * 25, OMEGA_N, ZETA);
const res3000 = unbalanceSteadyState(TOTAL_MASS, ME, 2 * Math.PI * 50, OMEGA_N, ZETA);
const high6000 = unbalanceSteadyState(TOTAL_MASS, ME, 2 * Math.PI * 100, OMEGA_N, ZETA);
const peak = unbalancePeak(ZETA)!;

const deg = (rad: number) => (rad * 180) / Math.PI;
const f = (v: number, sig = 3) => formatNumber(v, sig);
const mm = (m: number) => 1000 * m;

export const P0_6_REFERENCE = {
  fn: FN,
  omegaN: OMEGA_N,
  eCgMm: E_CG_MM,
  low: {
    rpm: 1500,
    r: 0.5,
    force: low1500.forceAmplitude,
    factor: low1500.responseFactor,
    amplitudeMm: mm(low1500.displacementAmplitude),
    phaseDeg: deg(low1500.phaseLag),
  },
  resonance: {
    rpm: 3000,
    r: 1.0,
    force: res3000.forceAmplitude,
    factor: res3000.responseFactor,
    amplitudeMm: mm(res3000.displacementAmplitude),
    phaseDeg: deg(res3000.phaseLag),
  },
  high: {
    rpm: 6000,
    r: 2.0,
    force: high6000.forceAmplitude,
    factor: high6000.responseFactor,
    amplitudeMm: mm(high6000.displacementAmplitude),
    phaseDeg: deg(high6000.phaseLag),
  },
  peak: {
    r: peak.frequencyRatio,
    factor: peak.responseFactor,
    rpm: peak.frequencyRatio * 3000,
  },
} as const;

// ── 그림 1: 불평형 회전체 물리 모델 도식 ──────────────────────
export const unbalanceModel: FigureSpec = {
  id: 'fig-p1-7-1',
  caption:
    '그림 1. 불평형이 있는 1자유도 회전체 모델. 회전체와 함께 흔들리는 기계 전체(회색 상자, 질량 M)가 스프링 k와 감쇠기 c로 지지되어 있다. 원판(파랑)의 회전 중심 O에서 거리 e만큼 떨어진 곳에 불평형 질량 m_u가 붙어 각속도 Ω로 회전한다. 함께 도는 원심력 F_u = m_u e Ω²의 수평 성분 F_x(t) = F_u cos(Ωt)가 기계를 좌우로 흔든다.',
  panels: [
    {
      frame: false,
      height: 200,
      x: { range: [0, 14] },
      y: { range: squareYRange([0, 14], 200) },
      series: [],
      annotations: [
        // 기초 벽 및 베어링 지지대
        { type: 'ground', x1: 1.2, y1: 0.5, x2: 1.2, y2: 3.5, side: 'left' },
        { type: 'spring', x1: 1.2, y1: 2.5, x2: 4.5, y2: 2.5, coils: 6, label: '강성 k' },
        { type: 'damper', x1: 1.2, y1: 1.5, x2: 4.5, y2: 1.5, label: '감쇠 c' },
        // 회전체와 함께 흔들리는 기계 전체(질량 M). 글자는 원판과 겹치지 않게 왼쪽 위에 따로 쓴다
        { type: 'rect', x1: 4.5, x2: 11.5, y1: 0.8, y2: 3.2, color: 'muted' },
        { type: 'text', x: 4.75, y: 2.85, text: '진동하는 전체 질량 M', color: 'muted' },
        // 회전 원판 (반지름 0.85 단위 → px: 820 px / 14 단위)
        { type: 'circle', x: 8.0, y: 2.0, r: 0.85 * (820 / 14), fill: true, color: 'c1' },
        { type: 'text', x: 7.05, y: 1.95, text: '회전 Ω', anchor: 'end', color: 'muted' },
        // 회전 중심 O (글자는 원판 안 아래쪽)
        { type: 'point', x: 8.0, y: 2.0, color: 'text' },
        { type: 'text', x: 8.0, y: 2.0, text: '회전 중심 O', anchor: 'middle', color: 'text', dy: 22 },
        { type: 'text', x: 8.12, y: 2.3, text: 'e', anchor: 'end', color: 'warn', dx: -4 },
        // 편심 질량 mu (45도 위치)
        {
          type: 'line',
          x1: 8.0,
          y1: 2.0,
          x2: 8.0 + 0.6 * Math.cos(Math.PI / 4),
          y2: 2.0 + 0.6 * Math.sin(Math.PI / 4),
          color: 'warn',
          width: 2,
        },
        {
          type: 'point',
          x: 8.0 + 0.6 * Math.cos(Math.PI / 4),
          y: 2.0 + 0.6 * Math.sin(Math.PI / 4),
          color: 'warn',
        },
        { type: 'text', x: 8.95, y: 2.2, text: '불평형 질량 m_u', anchor: 'start', color: 'warn' },
        // 원심력 화살표
        {
          type: 'arrow',
          x1: 8.0 + 0.6 * Math.cos(Math.PI / 4),
          y1: 2.0 + 0.6 * Math.sin(Math.PI / 4),
          x2: 8.0 + 1.2 * Math.cos(Math.PI / 4),
          y2: 2.0 + 1.2 * Math.sin(Math.PI / 4),
          label: '원심력 F_u',
          color: 'warn',
          double: false,
          labelDx: 8,
        },
        // 수평 변위 화살표
        { type: 'arrow', x1: 7.0, y1: 3.5, x2: 9.0, y2: 3.5, label: '수평 변위 x(t)', color: 'c1', double: false },
      ],
    },
  ],
};

// ── 그림 2: 회전수 제곱에 비례하는 원심력 ──────────────────────
const rpmAxis = grid(0, 6000, 301);
const forceCurve = rpmAxis.map((rpm) => {
  const omega = (2 * Math.PI * rpm) / 60;
  return unbalanceForce(ME, omega);
});

export const centrifugalForceCurve: FigureSpec = {
  id: 'fig-p1-7-2',
  caption: `그림 2. 회전수(rpm)에 따른 불평형 원심력 크기(F_u = m_u e Ω², m_u e = ${f(ME, 2)} kg·m). 1500 rpm에서 약 ${f(P0_6_REFERENCE.low.force, 3)} N이던 원심력이 회전수가 2배인 3000 rpm에서는 4배인 ${f(P0_6_REFERENCE.resonance.force, 3)} N, 4배인 6000 rpm에서는 16배인 ${f(P0_6_REFERENCE.high.force, 4)} N이 된다. 회전수가 올라갈수록 곡선이 가팔라지는 것이 제곱 비례의 모양이다.`,
  panels: [
    {
      series: [{ x: rpmAxis, y: forceCurve, label: '원심력 F_u [N]', color: 'warn', width: 2.4 }],
      annotations: [
        // 아래로 볼록한 곡선이라 점의 왼쪽 위는 비어 있다 → 글자를 왼쪽 위에 둔다
        { type: 'point', x: 1500, y: P0_6_REFERENCE.low.force, color: 'warn' },
        { type: 'text', x: 1500, y: P0_6_REFERENCE.low.force, text: `1500 rpm: ${f(P0_6_REFERENCE.low.force, 3)} N`, anchor: 'end', color: 'warn', dx: -8, dy: -8, bold: true },
        { type: 'point', x: 3000, y: P0_6_REFERENCE.resonance.force, color: 'warn' },
        { type: 'text', x: 3000, y: P0_6_REFERENCE.resonance.force, text: `3000 rpm: ${f(P0_6_REFERENCE.resonance.force, 3)} N (4배)`, anchor: 'end', color: 'warn', dx: -8, dy: -8, bold: true },
        { type: 'point', x: 6000, y: P0_6_REFERENCE.high.force, color: 'warn' },
        { type: 'text', x: 6000, y: P0_6_REFERENCE.high.force, text: `6000 rpm: ${f(P0_6_REFERENCE.high.force, 4)} N (16배)`, anchor: 'end', color: 'warn', dx: -10, dy: -4, bold: true },
      ],
      x: { range: [0, 6000], ticks: [0, 1500, 3000, 4500, 6000], label: '회전수 [rpm]' },
      y: { range: [0, 4500], ticks: [0, 1000, 2000, 3000, 4000], label: '원심력 크기 F_u [N]' },
      height: 220,
    },
  ],
};

// ── 그림 3: 1X 진동 시간파형과 위상 지연 ───────────────────────
const t3 = grid(0, 0.06, 601); // 50 Hz(T = 0.02 s) 기준 3주기
const fx3 = t3.map((t) => res3000.forceAmplitude * Math.cos(2 * Math.PI * FN * t));
const x3 = t3.map((t) => mm(res3000.displacementAmplitude) * Math.cos(2 * Math.PI * FN * t - res3000.phaseLag));

export const timeWaveform1X: FigureSpec = {
  id: 'fig-p1-7-3',
  caption: `그림 3. 3000 rpm(50 Hz) 정상상태에서 세 바퀴(60 ms, 한 바퀴 T = 20 ms) 동안의 불평형 외력 수평 성분(위, 주황 점선)과 수평 변위 응답(아래, 파랑 실선). 회전수가 50 Hz이므로 수평 진동도 정확히 50 Hz 정현파로 나타난다(1X 진동). 공진(3000 rpm)에서는 변위가 힘보다 90°(1/4 주기, 5 ms) 늦게 정점을 찍는다.`,
  panels: [
    {
      title: '수평 외력 성분 F_x(t)',
      series: [{ x: t3, y: fx3.map((v) => v / 1000), label: '수평 외력 F_x [kN]', color: 'warn', width: 2, dash: true }],
      annotations: [{ type: 'hline', y: 0, color: 'muted', dash: true }],
      x: { range: [0, 0.06], label: '시간 t [s]', ticks: [0, 0.02, 0.04, 0.06] },
      y: { range: [-1.2, 1.2], ticks: [-1, 0, 1], label: '외력 [kN]' },
      height: 120,
    },
    {
      title: '수평 변위 응답 x(t) (위상 지연 φ = 90°)',
      series: [{ x: t3, y: x3, label: '수평 변위 x [mm]', color: 'c1', width: 2.2 }],
      annotations: [
        { type: 'hline', y: 0, color: 'muted', dash: true },
        { type: 'arrow', x1: 0, y1: 1.05, x2: 0.005, y2: 1.05, label: '위상 지연 90° (5 ms)', color: 'warn', double: true, labelDy: -8 },
      ],
      x: { range: [0, 0.06], label: '시간 t [s]', ticks: [0, 0.02, 0.04, 0.06] },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1], label: '변위 [mm]' },
      height: 140,
    },
  ],
};

// ── 그림 4: 불평형 진폭비 및 위상 곡선 (Bode 선도) ─────────────
const rAxis = grid(0, 3, 601);
const curveZ005 = rAxis.map((r) => unbalanceResponseFactor(r, 0.05));
const curveZ010 = rAxis.map((r) => unbalanceResponseFactor(r, 0.1));
const curveZ020 = rAxis.map((r) => unbalanceResponseFactor(r, 0.2));

export const unbalanceBode: FigureSpec = {
  id: 'fig-p1-7-4',
  caption: `그림 4. 불평형 응답의 무차원 진폭비(위)와 위상각(아래). 일반 강제진동(P1-4)과 달리 정지 시(r = 0) 진폭비가 0에서 출발한다. r = 1(임계속도) 근처에서 진폭이 1/(2ζ)로 크게 치솟고 위상은 90°를 지나며, r ≫ 1인 초임계 영역에서는 진폭비가 정확히 1로 수렴한다(변위 X → m_u e / M = ${f(P0_6_REFERENCE.eCgMm, 2)} mm). 위상은 180°로 수렴한다.`,
  panels: [
    {
      title: '무차원 진폭비 X / (m_u e / M)',
      series: [
        { x: rAxis, y: curveZ005.map((c) => Math.min(c.factor, 12)), label: 'ζ = 0.05', color: 'c1', width: 2.2 },
        { x: rAxis, y: curveZ010.map((c) => Math.min(c.factor, 12)), label: 'ζ = 0.10', color: 'c2', width: 2 },
        { x: rAxis, y: curveZ020.map((c) => Math.min(c.factor, 12)), label: 'ζ = 0.20', color: 'c3', width: 1.8 },
      ],
      annotations: [
        { type: 'hline', y: 1, color: 'muted', dash: true },
        { type: 'vline', x: 1, label: 'r = 1 (임계속도)', color: 'warn', dash: true },
        // 세로선 글자(오른쪽 위)와 겹치지 않게 봉우리 왼쪽에 쓴다
        { type: 'point', x: 1, y: 10, color: 'c1' },
        { type: 'text', x: 1, y: 10, text: 'ζ = 0.05: 1/(2ζ) = 10', anchor: 'end', color: 'c1', dx: -10, dy: 4, bold: true },
      ],
      x: { range: [0, 3], label: '진동수비 r = Ω/ω_n', ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3] },
      y: { range: [0, 11], ticks: [0, 1, 2, 4, 6, 8, 10], label: '진폭비' },
      height: 180,
    },
    {
      title: '위상 지연 φ [°]',
      series: [
        { x: rAxis, y: curveZ005.map((c) => deg(c.phaseLag)), label: 'ζ = 0.05', color: 'c1', width: 2.2 },
        { x: rAxis, y: curveZ010.map((c) => deg(c.phaseLag)), label: 'ζ = 0.10', color: 'c2', width: 2 },
        { x: rAxis, y: curveZ020.map((c) => deg(c.phaseLag)), label: 'ζ = 0.20', color: 'c3', width: 1.8 },
      ],
      annotations: [
        { type: 'hline', y: 90, color: 'muted', dash: true },
        { type: 'hline', y: 180, color: 'muted', dash: true },
        { type: 'point', x: 1, y: 90, label: '공진 시 90° 지연', color: 'warn', dx: 10, dy: -10 },
      ],
      x: { range: [0, 3], label: '진동수비 r = Ω/ω_n', ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3] },
      y: { range: [0, 190], ticks: [0, 45, 90, 135, 180], label: '위상 지연 [°]' },
      height: 160,
    },
  ],
};

// ── 그림 5: 외력 일정 강제진동 vs 불평형 강제진동 ──────────────
const staticFactor = rAxis.map((r) => {
  const den = Math.hypot(1 - r ** 2, 2 * ZETA * r);
  return den === 0 ? 12 : Math.min(1 / den, 12);
});

export const staticVsUnbalance: FigureSpec = {
  id: 'fig-p1-7-5',
  caption:
    '그림 5. 일반 강제진동(파랑, P1-4)과 불평형 진동(주황, P1-7)의 증폭 특성 비교 (ζ = 0.05). 일반 강제진동은 힘의 크기가 일정하여 r = 0에서 정적 처짐 1을 가지며 고속에서는 0으로 줄어든다. 반면 불평형 진동은 힘이 속도 제곱에 비례하므로 r = 0에서 0이고, 고속(r ≫ 1)에서는 진폭비 1(편심 거리 m_u e / M)로 수렴한다.',
  panels: [
    {
      series: [
        { x: rAxis, y: staticFactor, label: '외력 일정 강제진동 (P1-4)', color: 'c1', width: 2.2 },
        { x: rAxis, y: curveZ005.map((c) => Math.min(c.factor, 12)), label: '불평형 원심력 진동 (P1-7)', color: 'c2', width: 2.2 },
      ],
      annotations: [
        { type: 'point', x: 0, y: 1, color: 'c1' },
        { type: 'text', x: 0, y: 1, text: 'P1-4: 1에서 출발', color: 'c1', dx: 8, dy: -10, bold: true },
        { type: 'point', x: 0, y: 0, color: 'c2' },
        { type: 'text', x: 0, y: 0, text: 'P1-7: 0에서 출발', color: 'c2', dx: 8, dy: -4, bold: true },
        { type: 'hline', y: 1, color: 'muted', dash: true },
        { type: 'vline', x: 1, color: 'muted', dash: true },
      ],
      x: { range: [0, 3], label: '진동수비 r = Ω/ω_n', ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3] },
      y: { range: [0, 11], ticks: [0, 1, 2, 4, 6, 8, 10], label: '응답 진폭비' },
      height: 220,
    },
  ],
};

// ── 그림 6: 런업 중 임계속도 통과 파형 ────────────────────────
// 회전수를 1초에 1200 rpm(20 Hz)씩 0 → 6000 rpm(100 Hz)까지 올린다. t = 2.5 s에 50 Hz(임계속도) 통과.
// 각 순간의 정상상태 진폭·위상으로 그린 개념도. 100 Hz에서도 한 주기에 12점 이상이 되도록 점을 촘촘히 둔다.
const RUN_T = 5;
const RUN_RATE_HZ = 20; // Hz/s
const tRun = grid(0, RUN_T, 6001);
const runUpEnvT = grid(0, RUN_T, 501);
const runUpAmp = (t: number) => unbalanceResponseFactor((RUN_RATE_HZ * t) / FN, ZETA).factor * E_CG_MM;
const runUpDisp = tRun.map((t) => {
  const phi = unbalanceResponseFactor((RUN_RATE_HZ * t) / FN, ZETA).phaseLag;
  // 회전 각도 θ(t) = 2π ∫ 20τ dτ = 2π · 10 t²
  const theta = 2 * Math.PI * (RUN_RATE_HZ / 2) * t ** 2;
  return runUpAmp(t) * Math.cos(theta - phi);
});
const runUpEnv = runUpEnvT.map(runUpAmp);
const RUN_PEAK_MM = E_CG_MM * peak.responseFactor;

export const runUpTransient: FigureSpec = {
  id: 'fig-p1-7-6',
  caption: `그림 6. 회전수를 1초에 1200 rpm씩 0에서 6000 rpm까지 올리는 런업(Run-up) 중의 수평 변위 파형(파랑)과 진폭(회색 점선). 각 순간의 정상상태 진폭으로 그린 개념도다. 저속에서는 진폭이 작다가, 고유진동수(50 Hz, 3000 rpm)를 지나는 2.5초 근처에서 ${f(RUN_PEAK_MM, 2)} mm(편심 거리 ${f(E_CG_MM, 2)} mm의 10배)까지 커진다. 지나고 나면 다시 줄어 6000 rpm(r = 2)에서 ${f(P0_6_REFERENCE.high.amplitudeMm, 3)} mm가 되고, 회전수를 더 올리면 편심 거리 ${f(E_CG_MM, 2)} mm에 다가간다.`,
  panels: [
    {
      series: [
        { x: tRun, y: runUpDisp, label: '수평 변위 x(t)', color: 'c1', width: 1.2 },
        { x: runUpEnvT, y: runUpEnv, label: '진폭 X', color: 'muted', width: 1.4, dash: true },
        { x: runUpEnvT, y: runUpEnv.map((v) => -v), color: 'muted', width: 1.4, dash: true },
      ],
      annotations: [
        { type: 'hline', y: 0, color: 'muted', dash: true },
        { type: 'vline', x: 2.5, color: 'warn', dash: true },
        { type: 'point', x: 2.5, y: RUN_PEAK_MM, color: 'warn' },
        { type: 'text', x: 2.5, y: RUN_PEAK_MM, text: `공진 피크 ${f(RUN_PEAK_MM, 2)} mm (3000 rpm, t = 2.5 s)`, color: 'warn', dx: 10, dy: 4, bold: true },
        { type: 'text', x: RUN_T, y: P0_6_REFERENCE.high.amplitudeMm, text: `6000 rpm(r = 2): ${f(P0_6_REFERENCE.high.amplitudeMm, 3)} mm`, anchor: 'end', color: 'text', dx: -4, dy: -14, bold: true },
      ],
      x: { range: [0, RUN_T], label: '가속 시간 t [s] (회전수 = 1200 × t rpm)', ticks: [0, 1, 2, 2.5, 3, 4, 5] },
      y: { range: [-1.3, 1.3], ticks: [-1, -0.5, 0, 0.5, 1], label: '변위 [mm]' },
      height: 200,
    },
  ],
};

// ── 그림 7: 초임계 영역의 질량 중심 회전 (Self-centering) ──────
// 로터를 축 방향에서 본 모습: 베어링 중심 B, 축 중심 O가 그리는 궤도(점선), 축 단면(파랑 원), O에서 본 무거운 점 방향(화살표).
const PX = 820 / 10; // 단위 → px (x 범위 10)
const B_X = 2.6;
const C_Y = 1.4;
const ORBIT_R = 0.8;
const O_X = B_X + ORBIT_R;
const SHAFT_R = 0.3;
const HEAVY_LEN = 0.5;

function selfCenteringPanel(supercritical: boolean): FigPanel {
  const tipX = supercritical ? O_X - HEAVY_LEN : O_X + HEAVY_LEN;
  const lines = supercritical
    ? ['변위가 힘의 반대쪽 (위상 ≈ 180°)', '축 중심 O가 무거운 점 반대쪽으로 밀린다', '무거운 점은 궤도 안쪽, G는 베어링 중심에 머문다']
    : ['변위가 힘과 같은 쪽 (위상 ≈ 0°)', '축 중심 O가 무거운 점 쪽으로 밀린다', '무거운 점은 궤도 바깥쪽을 향한다'];
  return {
    title: supercritical
      ? '초임계 (r ≫ 1, 고속): 위상 지연 ≈ 180° — 질량 중심 회전'
      : '아임계 (r ≪ 1, 저속): 위상 지연 ≈ 0°',
    frame: false,
    height: 190,
    x: { range: [0, 10] },
    y: { range: squareYRange([0, 10], 190) },
    series: [],
    annotations: [
      // 궤도와 베어링 중심
      { type: 'circle', x: B_X, y: C_Y, r: ORBIT_R * PX, dash: true, color: 'muted' },
      { type: 'text', x: B_X, y: C_Y + ORBIT_R, text: 'O의 궤도', anchor: 'middle', color: 'muted', dy: -6 },
      { type: 'line', x1: B_X - 0.1, y1: C_Y, x2: B_X + 0.1, y2: C_Y, color: 'text', width: 1.5 },
      { type: 'line', x1: B_X, y1: C_Y - 0.1, x2: B_X, y2: C_Y + 0.1, color: 'text', width: 1.5 },
      { type: 'line', x1: B_X, y1: C_Y - 0.12, x2: B_X, y2: 0.42, color: 'muted', dash: true, width: 1 },
      {
        type: 'text',
        x: B_X,
        y: 0.2,
        text: supercritical ? '베어링 중심 = 질량 중심 G' : '베어링 중심',
        anchor: 'middle',
        color: supercritical ? 'c3' : 'text',
        bold: true,
      },
      // 축 단면과 축 중심 O
      { type: 'circle', x: O_X, y: C_Y, r: SHAFT_R * PX, fill: true, color: 'c1' },
      { type: 'point', x: O_X, y: C_Y, color: 'c1' },
      { type: 'text', x: O_X, y: C_Y, text: 'O', anchor: 'middle', color: 'c1', dy: -9, bold: true },
      // O에서 본 무거운 점의 방향
      { type: 'arrow', x1: O_X, y1: C_Y, x2: tipX, y2: C_Y, color: 'warn', double: false },
      supercritical
        ? { type: 'text', x: tipX, y: C_Y, text: 'm_u 방향', anchor: 'end', color: 'warn', dy: -10, bold: true }
        : { type: 'text', x: tipX, y: C_Y, text: 'm_u 방향', anchor: 'start', color: 'warn', dx: 6, dy: 4, bold: true },
      // 설명
      { type: 'text', x: 5.2, y: C_Y + 0.4, text: lines[0], color: 'text', bold: true },
      { type: 'text', x: 5.2, y: C_Y, text: lines[1], color: 'text' },
      { type: 'text', x: 5.2, y: C_Y - 0.4, text: lines[2], color: 'warn' },
    ],
  };
}

export const selfCenteringDiagram: FigureSpec = {
  id: 'fig-p1-7-7',
  caption:
    '그림 7. 로터를 축 방향에서 본 모습. 점선 원은 축 중심 O가 그리는 궤도, 파란 원은 축 단면, 주황 화살표는 O에서 본 무거운 점(m_u)의 방향이다 (크기는 보기 쉽게 과장했다). 위(아임계): 변위가 힘과 같은 쪽으로 나서 O가 무거운 점 쪽으로 밀리고, 무거운 점은 궤도 바깥쪽을 향한다. 아래(초임계): 변위가 힘의 반대쪽으로 나서 O가 무거운 점의 반대쪽으로 밀리고, 무거운 점은 궤도 안쪽을 향한다. 이때 전체 질량 중심 G가 베어링 중심에 머물고, O는 그 둘레를 반지름 e_cg로 돈다(질량 중심 회전).',
  panels: [selfCenteringPanel(false), selfCenteringPanel(true)],
};
