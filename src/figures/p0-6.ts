/** P0-6 "회전기계의 진동: 불평형과 1X" 본문 그림. 계산은 lib/mck 해석해에서 수행한다. */
import { grid, squareYRange, type FigureSpec } from '../lib/figure';
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
  id: 'fig-p0-6-1',
  caption:
    '그림 1. 불평형이 있는 1자유도 회전체 모델. 회전 중심 O에서 편심 거리 e만큼 떨어진 곳에 불평형 질량 m_u가 붙어 각속도 Ω로 회전한다. 회전체와 함께 도는 원심력 F_u = m_u e Ω²의 수평 방향 성분 F_x(t) = F_u cos(Ωt)가 베어링과 기초를 주기적으로 흔든다.',
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
        // 회전 기계 하우징(질량 M)
        { type: 'rect', x1: 4.5, x2: 11.5, y1: 0.8, y2: 3.2, label: '기계 전체 질량 M', color: 'muted' },
        // 회전 원판 (반경 0.9)
        { type: 'circle', x: 8.0, y: 2.0, r: 0.85, color: 'c1' },
        // 회전 중심 O
        { type: 'point', x: 8.0, y: 2.0, label: '회전 중심 O', color: 'muted', dx: -55, dy: -12 },
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
          label: '불평형 질량 m_u',
          color: 'warn',
          dx: 8,
          dy: 14,
        },
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
  id: 'fig-p0-6-2',
  caption: `그림 2. 회전수(rpm)에 따른 불평형 원심력 크기(F_u = m_u e Ω²). 1500 rpm에서 약 ${f(P0_6_REFERENCE.low.force, 3)} N이던 원심력이 회전수가 2배인 3000 rpm에서는 4배인 ${f(P0_6_REFERENCE.resonance.force, 3)} N으로 커지고, 6000 rpm에서는 16배인 ${f(P0_6_REFERENCE.high.force, 3)} N으로 폭발적으로 증가한다. 회전 속도가 올라갈수록 기계가 받는 불평형 힘은 가속된다.`,
  panels: [
    {
      series: [{ x: rpmAxis, y: forceCurve, label: '원심력 F_u [N]', color: 'warn', width: 2.4 }],
      annotations: [
        { type: 'point', x: 1500, y: P0_6_REFERENCE.low.force, label: `1500 rpm: ${f(P0_6_REFERENCE.low.force, 3)} N`, color: 'warn', dx: 10, dy: -10 },
        { type: 'point', x: 3000, y: P0_6_REFERENCE.resonance.force, label: `3000 rpm: ${f(P0_6_REFERENCE.resonance.force, 3)} N (4배)`, color: 'warn', dx: 10, dy: -10 },
        { type: 'point', x: 6000, y: P0_6_REFERENCE.high.force, label: `6000 rpm: ${f(P0_6_REFERENCE.high.force, 3)} N (16배)`, color: 'warn', dx: -130, dy: -12 },
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
  id: 'fig-p0-6-3',
  caption: `그림 3. 3000 rpm(50 Hz) 정상상태에서 1회전 주기(T = 20 ms) 동안의 불평형 외력 수평 성분(주황 점선)과 수평 변위 응답(파랑 실선). 회전수가 50 Hz이므로 수평 진동도 정확히 50 Hz 정현파로 나타난다(1X 진동). 공진(3000 rpm)에서는 변위가 힘보다 90°(1/4 주기, 5 ms) 늦게 정점을 찍는다.`,
  panels: [
    {
      title: '수평 외력 성분 F_x(t) [환산 진폭]',
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
  id: 'fig-p0-6-4',
  caption: `그림 4. 불평형 응답의 무차원 진폭비(위)와 위상각(아래). 일반 강제진동(P0-4)과 달리 정지 시(r = 0) 진폭비가 0에서 출발한다. r = 1(임계속도) 근처에서 진폭이 1/(2ζ)로 크게 치솟고 위상은 90°를 지나며, r ≫ 1인 초임계 영역에서는 진폭비가 정확히 1로 수렴한다(변위 X → m_u e / M = ${f(P0_6_REFERENCE.eCgMm, 2)} mm). 위상은 180°로 수렴한다.`,
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
        { type: 'point', x: 1, y: 10, label: '1/(2ζ) = 10', color: 'c1', dx: 10, dy: -10 },
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
  id: 'fig-p0-6-5',
  caption:
    '그림 5. 일반 강제진동(파랑, P0-4)과 불평형 진동(주황, P0-6)의 증폭 특성 비교 (ζ = 0.05). 일반 강제진동은 힘의 크기가 일정하여 r = 0에서 정적 처짐 1을 가지며 고속에서는 0으로 꺼진다. 반면 불평형 진동은 힘이 속도 제곱에 비례하므로 r = 0에서 0이고, 고속(r ≫ 1)에서는 진폭비 1(편심량 m_u e / M)로 수렴한다.',
  panels: [
    {
      series: [
        { x: rAxis, y: staticFactor, label: '외력 일정 강제진동 (P0-4)', color: 'c1', width: 2.2 },
        { x: rAxis, y: curveZ005.map((c) => Math.min(c.factor, 12)), label: '불평형 원심력 진동 (P0-6)', color: 'c2', width: 2.2 },
      ],
      annotations: [
        { type: 'point', x: 0, y: 1, label: 'P0-4: 정적 처짐 (1)', color: 'c1', dx: 10, dy: 10 },
        { type: 'point', x: 0, y: 0, label: 'P0-6: 정지 시 힘 없음 (0)', color: 'c2', dx: 10, dy: -12 },
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
const tRun = grid(0, 4.0, 1201);
const runUpDisp = tRun.map((t) => {
  // 회전수가 0에서 60 Hz(3600 rpm)까지 선형 가속 (t = 2.5 s에 50 Hz 임계속도 통과)
  const fInst = 20 * t; // 0 ~ 80 Hz
  const r = fInst / FN;
  const factor = unbalanceResponseFactor(r, ZETA).factor;
  const phi = unbalanceResponseFactor(r, ZETA).phaseLag;
  const currentAmp = Math.min(factor * E_CG_MM, 1.0);
  // 위상 적분 φ(t) = 2π * ∫ (20τ) dτ = 2π * 10 t²
  const phaseAngle = 2 * Math.PI * 10 * t ** 2 - phi;
  return currentAmp * Math.cos(phaseAngle);
});

export const runUpTransient: FigureSpec = {
  id: 'fig-p0-6-6',
  caption:
    '그림 6. 기동 런업(Run-up) 중 임계속도를 통과할 때의 축 진동 파형(개념도). 회전수가 서서히 올라가면서 저속에서는 조용하다가, 고유진동수(50 Hz, 3000 rpm)를 통과하는 약 2.5초 지점에서 진폭이 급격히 1 mm까지 솟구친다(임계속도 통과). 임계속도를 안전하게 넘어서면 진폭이 다시 0.1 mm(편심 거리)로 뚝 떨어져 안정화된다.',
  panels: [
    {
      series: [{ x: tRun, y: runUpDisp, label: '축 수평 변위 x(t) [mm]', color: 'c1', width: 1.8 }],
      annotations: [
        { type: 'hline', y: 0, color: 'muted', dash: true },
        { type: 'vline', x: 2.5, label: '임계속도 통과 (3000 rpm)', color: 'warn', dash: true },
        { type: 'point', x: 2.5, y: 1.0, label: '공진 피크 (1.0 mm)', color: 'warn', dx: 10, dy: -12 },
        { type: 'arrow', x1: 3.5, y1: 0.35, x2: 3.5, y2: 0.12, label: '안정화 (0.1 mm)', color: 'muted', double: false, labelDy: -12 },
      ],
      x: { range: [0, 4.0], label: '가속 시간 t [s]', ticks: [0, 1, 2, 2.5, 3, 4] },
      y: { range: [-1.2, 1.2], ticks: [-1, -0.5, 0, 0.5, 1], label: '변위 [mm]' },
      height: 200,
    },
  ],
};

// ── 그림 7: 초임계 영역의 자기 조심 현상 (Self-centering) ──────
export const selfCenteringDiagram: FigureSpec = {
  id: 'fig-p0-6-7',
  caption:
    '그림 7. 회전 속도에 따른 회전축과 질량 중심의 거동 (자기 조심 현상). 왼쪽(아임계 r ≪ 1): 위상 지연이 0°에 가까워 무거운 점 m_u가 바깥쪽으로 튀어나오며 축 중심 O가 불평형 쪽으로 함께 쏠린다. 오른쪽(초임계 r ≫ 1): 위상 지연이 180°가 되어 무거운 점 m_u가 회전 중심 안쪽으로 파고들고, 실제 질량 중심 G가 회전 중심에 오게 된다. 축은 질량 중심을 축으로 자전하여 진동이 편심 거리 e_cg로 스스로 제한된다.',
  panels: [
    {
      title: '아임계 영역 (r ≪ 1, 저속): 위상 지연 0° — 무거운 점이 바깥으로 쏠림',
      frame: false,
      height: 140,
      x: { range: [0, 10] },
      y: { range: squareYRange([0, 10], 140) },
      series: [],
      annotations: [
        { type: 'circle', x: 5.0, y: 1.2, r: 0.9, color: 'c1' },
        { type: 'point', x: 5.0, y: 1.2, label: '회전 중심 O', color: 'muted', dx: -55, dy: -12 },
        { type: 'point', x: 5.7, y: 1.2, label: '무거운 점 m_u (바깥쪽)', color: 'warn', dx: 8, dy: 12 },
        { type: 'arrow', x1: 5.0, y1: 1.2, x2: 6.2, y2: 1.2, label: '쏠림 방향', color: 'warn', double: false, labelDy: -8 },
      ],
    },
    {
      title: '초임계 영역 (r ≫ 1, 고속): 위상 지연 180° — 질량 중심 G 둘레로 자전 (자기 조심)',
      frame: false,
      height: 140,
      x: { range: [0, 10] },
      y: { range: squareYRange([0, 10], 140) },
      series: [],
      annotations: [
        { type: 'circle', x: 4.4, y: 1.2, r: 0.9, color: 'c2' },
        { type: 'point', x: 5.0, y: 1.2, label: '회전 중심 = 무게 중심 G', color: 'c2', dx: 8, dy: -12 },
        { type: 'point', x: 4.4, y: 1.2, label: '기하학적 축 O', color: 'muted', dx: -55, dy: -12 },
        { type: 'point', x: 5.1, y: 1.2, label: 'm_u (안쪽)', color: 'warn', dx: 8, dy: 14 },
      ],
    },
  ],
};
