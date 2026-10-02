/**
 * P1-0 "신호와 스펙트럼의 기본" 본문 그림 데이터 (빌드 시 계산, D-026).
 */
import { grid, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { acquire } from '../lib/dsp/sampling';
import type { SignalComponent } from '../lib/dsp/signal';
import { crestFactor, peak, rms } from '../lib/dsp/stats';

const DEG = Math.PI / 180;

/** 연속 신호처럼 그리기 위한 촘촘한 샘플 */
function trace(components: SignalComponent[], duration: number, points = 1200) {
  const fs = (points - 1) / duration;
  const s = acquire({ components }, { fs, n: points });
  return { t: Array.from(s.t), x: Array.from(s.x) };
}

// 그림 1 — 기계 진동 시간파형
const machine = trace(
  [
    { type: 'sine', freq: 60, amp: 4 },
    { type: 'sine', freq: 120, amp: 1.2, phase: 0.8 },
    { type: 'sine', freq: 300, amp: 0.5, phase: 1.1 },
    { type: 'noise', rms: 0.25, seed: 3 },
  ],
  0.1,
  1600,
);
export const machineWaveform: FigureSpec = {
  id: 'fig-0-1',
  caption:
    '그림 1. 3600 rpm으로 도는 기계의 케이싱 진동 (예시로 만든 신호). 가로축은 시간, 세로축은 그 순간의 진동 속도다. 0.1초 동안 큰 물결이 6번 반복된다 — 1초에 60번, 회전과 같은 박자다. 큰 물결 위의 잔물결과 들쭉날쭉함은 다른 성분과 잡음이다.',
  panels: [
    {
      series: [{ x: machine.t, y: machine.x, width: 1.6 }],
      x: { range: [0, 0.1], label: '시간 [s]' },
      y: { range: [-7, 7], label: '속도 [mm/s]' },
      height: 190,
    },
  ],
};

// 그림 2 — 같은 움직임을 변위·속도·가속도로
// d = 50 µm·cos(2π60t) + 0.5 µm·cos(2π600t) → 미분할 때마다 성분이 2πf배
const T2 = 0.05;
const d = trace([{ type: 'sine', freq: 60, amp: 50 }, { type: 'sine', freq: 600, amp: 0.5 }], T2, 1500);
const v1 = 2 * Math.PI * 60 * 50e-3; // mm/s (µm → mm)
const v2 = 2 * Math.PI * 600 * 0.5e-3;
const v = trace([{ type: 'sine', freq: 60, amp: v1, phase: 90 * DEG }, { type: 'sine', freq: 600, amp: v2, phase: 90 * DEG }], T2, 1500);
const a1 = (2 * Math.PI * 60) ** 2 * 50e-6; // m/s²
const a2 = (2 * Math.PI * 600) ** 2 * 0.5e-6;
const acc = trace([{ type: 'sine', freq: 60, amp: a1, phase: 180 * DEG }, { type: 'sine', freq: 600, amp: a2, phase: 180 * DEG }], T2, 1500);
export const threeMeasures: FigureSpec = {
  id: 'fig-0-2',
  caption: `그림 2. 같은 움직임을 세 가지 양으로 본 모습. 느린 흔들림(60 Hz, 변위 50 µm)과 아주 작은 빠른 떨림(600 Hz, 변위 0.5 µm)이 섞여 있다. 변위로 보면 빠른 떨림은 거의 안 보이지만, 속도에서는 잔물결로, 가속도에서는 느린 흔들림과 같은 크기(${formatNumber(a2, 3)} m/s²)로 드러난다. 미분할 때마다 성분이 주파수에 비례해 커지기 때문이다.`,
  panels: [
    { title: '변위 d [µm]', series: [{ x: d.t, y: d.x, width: 1.6 }], x: { range: [0, T2], ticks: 'none' }, y: { range: [-60, 60] }, height: 110 },
    { title: '속도 v [mm/s]', series: [{ x: v.t, y: v.x, width: 1.6, color: 'c2' }], x: { range: [0, T2], ticks: 'none' }, y: { range: [-24, 24] }, height: 110 },
    { title: '가속도 a [m/s²]', series: [{ x: acc.t, y: acc.x, width: 1.4, color: 'c3' }], x: { range: [0, T2], label: '시간 [s]' }, y: { range: [-16, 16] }, height: 110 },
  ],
};

// 그림 3 — 정현파의 진폭과 주기
const sine5 = trace([{ type: 'sine', freq: 5, amp: 1 }], 0.5, 800);
export const sineAnatomy: FigureSpec = {
  id: 'fig-0-3',
  caption:
    '그림 3. 정현파 x(t) = A cos(2πft). 진폭 A는 가운데(0)에서 꼭대기까지의 높이, 주기 T는 같은 모양이 다시 시작될 때까지 걸리는 시간이다. 이 예는 T = 0.2 s이므로 1초에 5번 반복한다 → 주파수 f = 1/T = 5 Hz.',
  panels: [
    {
      series: [{ x: sine5.t, y: sine5.x, width: 2.4 }],
      annotations: [
        { type: 'hline', y: 1 },
        { type: 'hline', y: -1 },
        { type: 'arrow', x1: 0, y1: 1.28, x2: 0.2, y2: 1.28, label: '주기 T = 0.2 s', color: 'c2' },
        { type: 'arrow', x1: 0.53, y1: 0, x2: 0.53, y2: 1, label: '진폭 A', color: 'warn' },
      ],
      x: { range: [0, 0.62], ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], label: '시간 [s]' },
      y: {
        range: [-1.4, 1.55],
        ticks: [-1, 0, 1],
        tickLabels: [
          { value: 1, label: '+A' },
          { value: -1, label: '−A' },
        ],
      },
      height: 210,
    },
  ],
};

// 그림 4 — 위상 90°, 180°
const ref = trace([{ type: 'sine', freq: 5, amp: 1 }], 0.4, 700);
const lag90 = trace([{ type: 'sine', freq: 5, amp: 1, phase: -90 * DEG }], 0.4, 700);
const inv = trace([{ type: 'sine', freq: 5, amp: 1, phase: 180 * DEG }], 0.4, 700);
export const phaseShift: FigureSpec = {
  id: 'fig-0-4',
  caption:
    '그림 4. 위상은 같은 주파수의 두 정현파가 시간상 얼마나 어긋났는지를 각도로 나타낸다. 한 주기 = 360°. 위: 꼭대기가 T/4(= 0.05 s)만큼 늦게 온다 → 90° 늦음. 아래: 반 주기 어긋나 위아래가 뒤집혔다 → 180° = 부호가 반대.',
  panels: [
    {
      title: '90° 늦은 정현파',
      series: [
        { x: ref.t, y: ref.x, color: 'muted', dash: true, label: '기준 (φ = 0°)' },
        { x: lag90.t, y: lag90.x, color: 'c1', width: 2.4, label: 'φ = −90° (90° 늦음)' },
      ],
      annotations: [{ type: 'arrow', x1: 0.2, y1: 1.22, x2: 0.25, y2: 1.22, label: 'Δt = T/4 = 0.05 s', labelDx: 60, labelDy: 4, color: 'c2' }],
      x: { range: [0, 0.4], ticks: 'none' },
      y: { range: [-1.3, 1.45], ticks: [-1, 0, 1] },
      height: 150,
    },
    {
      title: '180° 어긋난 정현파',
      series: [
        { x: ref.t, y: ref.x, color: 'muted', dash: true, label: '기준 (φ = 0°)' },
        { x: inv.t, y: inv.x, color: 'c2', width: 2.4, label: 'φ = 180° (부호 반대)' },
      ],
      x: { range: [0, 0.4], label: '시간 [s]' },
      y: { range: [-1.3, 1.45], ticks: [-1, 0, 1] },
      height: 150,
    },
  ],
};

// 그림 5 — 1X, 2X (축 회전각 기준)
const ang = grid(0, 720, 721);
export const ordersFigure: FigureSpec = {
  id: 'fig-0-5',
  caption:
    '그림 5. 가로축을 시간 대신 "축이 돈 각도"로 그렸다. 1X는 축이 한 바퀴(360°) 돌 때 한 번 흔들리고, 2X는 두 번 흔들린다. 회전수가 바뀌어도 이 관계는 그대로라서, 회전 주파수의 몇 배인지(차수)로 성분을 부른다.',
  panels: [
    {
      series: [
        { x: ang, y: ang.map((a) => Math.cos(a * DEG)), width: 2.4, label: '1X: 한 바퀴에 1번' },
        { x: ang, y: ang.map((a) => 0.6 * Math.cos(2 * a * DEG)), width: 2, color: 'c2', label: '2X: 한 바퀴에 2번' },
      ],
      annotations: [{ type: 'vline', x: 360, label: '한 바퀴' }, { type: 'vline', x: 720, label: '두 바퀴' }],
      x: { range: [0, 720], ticks: [0, 90, 180, 270, 360, 450, 540, 630, 720], label: '축 회전각 [°]' },
      y: { range: [-1.25, 1.25], ticks: [-1, 0, 1] },
      height: 170,
    },
  ],
};

// 그림 6 — Peak, Pk-Pk, RMS
const s6 = trace([{ type: 'sine', freq: 5, amp: 1 }], 0.4, 700);
export const amplitudeMeasures: FigureSpec = {
  id: 'fig-0-6',
  caption:
    '그림 6. 같은 정현파(진폭 A = 1)를 숫자 하나로 나타내는 세 방법. Peak는 0에서 꼭대기까지(1), Pk-Pk는 바닥에서 꼭대기까지(2), RMS는 "평균적인 크기"(0.707)다. 정현파에서만 RMS = Peak/√2가 성립한다.',
  panels: [
    {
      series: [{ x: s6.t, y: s6.x, width: 2.4 }],
      annotations: [
        { type: 'hline', y: 1, label: 'Peak = A = 1', labelAt: 'end', color: 'warn' },
        { type: 'hline', y: Math.SQRT1_2, label: 'RMS = 0.707', labelAt: 'end', labelBelow: true, color: 'c3', dash: false },
        { type: 'hline', y: -1, color: 'muted' },
        { type: 'arrow', x1: 0.43, y1: -1, x2: 0.43, y2: 1, label: 'Pk-Pk = 2A = 2', labelDy: -14, color: 'c2' },
      ],
      x: { range: [0, 0.6], ticks: [0, 0.1, 0.2, 0.3, 0.4], label: '시간 [s]' },
      y: { range: [-1.3, 1.3], ticks: [-1, -0.707, 0, 0.707, 1] },
      height: 210,
    },
  ],
};

// 그림 7 — RMS는 같은데 Crest factor가 다른 두 신호
const sineCf = trace([{ type: 'sine', freq: 5, amp: Math.SQRT2 }], 0.4, 1600);
const impulsive = (() => {
  const n = 1600;
  const t = grid(0, 0.4, n);
  const raw = t.map((tt) => {
    let v = 0.55 * Math.cos(2 * Math.PI * 5 * tt);
    for (let k = 0; k < 4; k++) {
      const tau = tt - (0.03 + 0.1 * k);
      if (tau >= 0) v += 3.2 * Math.exp(-tau / 0.004) * Math.cos(2 * Math.PI * 180 * tau);
    }
    return v;
  });
  const r = rms(raw);
  return { t, x: raw.map((v) => v / r) };
})();
const cfSine = crestFactor(sineCf.x);
const cfImp = crestFactor(impulsive.x);
const pkImp = peak(impulsive.x);
export const crestFactorFigure: FigureSpec = {
  id: 'fig-0-7',
  caption: `그림 7. 두 신호의 RMS는 똑같이 1이다. 위의 정현파는 Peak ${formatNumber(Math.SQRT2, 3)} → Crest factor ${formatNumber(cfSine, 3)}. 아래는 짧은 충격이 0.1초마다 섞인 신호로 Peak ${formatNumber(pkImp, 3)} → Crest factor ${formatNumber(cfImp, 3)}. RMS만 보면 같은 크기이지만 모양은 전혀 다르다 — Crest factor가 이 차이를 잡아낸다.`,
  panels: [
    {
      title: `정현파: CF = ${formatNumber(cfSine, 3)}`,
      series: [{ x: sineCf.t, y: sineCf.x, width: 2 }],
      annotations: [
        { type: 'hline', y: Math.SQRT2, label: `Peak ${formatNumber(Math.SQRT2, 3)}`, color: 'warn' },
        { type: 'hline', y: 1, label: 'RMS 1.0', labelBelow: true, color: 'c3', dash: false },
      ],
      x: { range: [0, 0.52], ticks: 'none' },
      y: { range: [-7.5, 7.5], ticks: [-6, -3, 0, 3, 6] },
      height: 140,
    },
    {
      title: `충격이 섞인 신호: CF = ${formatNumber(cfImp, 3)}`,
      series: [{ x: impulsive.t, y: impulsive.x, width: 1.4, color: 'c2' }],
      annotations: [
        { type: 'hline', y: pkImp, label: `Peak ${formatNumber(pkImp, 3)}`, color: 'warn' },
        { type: 'hline', y: 1, label: 'RMS 1.0', labelBelow: true, color: 'c3', dash: false },
      ],
      x: { range: [0, 0.52], ticks: [0, 0.1, 0.2, 0.3, 0.4], label: '시간 [s]' },
      y: { range: [-7.5, 7.5], ticks: [-6, -3, 0, 3, 6] },
      height: 140,
    },
  ],
};

// 그림 8 — 섞인 신호 → 성분 → 스펙트럼
const parts = [
  { f: 60, a: 5, p: 0, name: '60 Hz (1X)', color: 'c1' as const },
  { f: 120, a: 2, p: 1, name: '120 Hz (2X)', color: 'c2' as const },
  { f: 180, a: 1, p: 2, name: '180 Hz (3X)', color: 'c3' as const },
];
const mix = trace(parts.map((c) => ({ type: 'sine' as const, freq: c.f, amp: c.a, phase: c.p })), 0.05, 1200);
const partTraces = parts.map((c) => trace([{ type: 'sine', freq: c.f, amp: c.a, phase: c.p }], 0.05, 1200));
export const mixToSpectrum: FigureSpec = {
  id: 'fig-0-8',
  caption:
    '그림 8. (위) 세 정현파가 더해진 시간파형 — 이것만 보고 성분을 알아내기는 어렵다. (가운데) 같은 신호를 성분별로 나누면 60·120·180 Hz 정현파 세 개다. (아래) 스펙트럼은 이 성분표를 그래프로 그린 것이다: 가로축 = 각 성분의 주파수, 세로축 = 그 진폭(Peak).',
  panels: [
    { title: '시간파형 (섞인 신호)', series: [{ x: mix.t, y: mix.x, width: 2, color: 'text' }], x: { range: [0, 0.05], ticks: 'none' }, y: { range: [-8.5, 8.5], ticks: [-5, 0, 5] }, height: 120 },
    {
      title: '성분으로 나누면',
      series: partTraces.map((p, i) => ({ x: p.t, y: p.x, color: parts[i].color, width: 1.8, label: parts[i].name })),
      x: { range: [0, 0.05], label: '시간 [s]' },
      y: { range: [-6, 6], ticks: [-5, 0, 5] },
      height: 130,
    },
    {
      title: '스펙트럼 (성분표)',
      series: parts.map((c) => ({ x: [c.f], y: [c.a], kind: 'stem' as const, color: c.color, width: 3, radius: 5 })),
      annotations: parts.map((c) => ({ type: 'text' as const, x: c.f, y: c.a, text: `${c.f} Hz, 진폭 ${c.a}`, anchor: 'middle' as const, dy: -10, color: c.color })),
      x: { range: [0, 250], label: '주파수 [Hz]' },
      y: { range: [0, 6.8], ticks: [0, 1, 2, 3, 4, 5, 6], label: '진폭' },
      height: 150,
    },
  ],
};

// 그림 9 — 샘플과 Δt
const cont9 = trace([{ type: 'sine', freq: 10, amp: 1 }], 0.2, 600);
const smp9 = acquire({ components: [{ type: 'sine', freq: 10, amp: 1 }] }, { fs: 100, n: 21 });
export const samplesFigure: FigureSpec = {
  id: 'fig-0-9',
  caption:
    '그림 9. 분석기는 연속 신호(회색 선)를 일정한 간격 Δt마다 읽어 숫자(점)로 저장한다. 이 예는 1초에 100번 읽으므로 샘플링 주파수 f_s = 100 Hz, 샘플 간격 Δt = 1/f_s = 0.01 s다. n번째 샘플을 x[n]이라고 쓴다.',
  panels: [
    {
      series: [
        { x: cont9.t, y: cont9.x, color: 'muted', width: 1.6, label: '연속 신호 x(t)' },
        { x: Array.from(smp9.t), y: Array.from(smp9.x), kind: 'dots', color: 'c1', radius: 4, label: '샘플 x[n]' },
      ],
      annotations: [
        { type: 'arrow', x1: 0.1, y1: -1.28, x2: 0.11, y2: -1.28, label: 'Δt = 0.01 s', labelDx: 44, labelDy: 4, color: 'c2' },
        { type: 'text', x: 0, y: 1, text: 'x[0]', dx: 6, dy: -8, color: 'c1' },
        { type: 'text', x: 0.01, y: Math.cos(2 * Math.PI * 0.1), text: 'x[1]', dx: 6, dy: -8, color: 'c1' },
        { type: 'text', x: 0.02, y: Math.cos(2 * Math.PI * 0.2), text: 'x[2]', dx: 6, dy: -8, color: 'c1' },
      ],
      x: { range: [0, 0.2], label: '시간 [s]' },
      y: { range: [-1.45, 1.35], ticks: [-1, 0, 1] },
      height: 190,
    },
  ],
};

// 그림 10 — 샘플이 충분할 때와 부족할 때
const cont10 = trace([{ type: 'sine', freq: 10, amp: 1 }], 1, 2000);
const good = acquire({ components: [{ type: 'sine', freq: 10, amp: 1 }] }, { fs: 100, n: 101 });
const bad = acquire({ components: [{ type: 'sine', freq: 10, amp: 1 }] }, { fs: 12, n: 13 });
const alias = trace([{ type: 'sine', freq: 2, amp: 1 }], 1, 400);
export const enoughSamples: FigureSpec = {
  id: 'fig-0-10',
  caption:
    '그림 10. 같은 10 Hz 신호를 두 속도로 읽었다. 위: 1초에 100번(한 주기에 10개) 읽으면 점을 이었을 때 원래 모양이 살아 있다. 아래: 1초에 12번(한 주기에 1.2개)만 읽으면 점들이 느린 2 Hz 물결(점선)을 그린다 — 실제로는 없는 주파수가 보이는 에일리어싱이다. 한 주기에 샘플이 2개보다 많아야 한다(P1-2에서 자세히).',
  panels: [
    {
      title: 'f_s = 100 Hz: 한 주기에 샘플 10개 → 원래 모양 그대로',
      series: [
        { x: cont10.t, y: cont10.x, color: 'muted', width: 1 },
        { x: Array.from(good.t), y: Array.from(good.x), kind: 'dots', color: 'c1', radius: 2.6 },
      ],
      x: { range: [0, 1], ticks: 'none' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
      height: 120,
    },
    {
      title: 'f_s = 12 Hz: 한 주기에 1.2개 → 2 Hz처럼 보인다 (에일리어싱)',
      series: [
        { x: cont10.t, y: cont10.x, color: 'muted', width: 1, opacity: 0.6 },
        { x: alias.t, y: alias.x, color: 'c2', dash: true, width: 2, label: '점이 그리는 가짜 2 Hz' },
        { x: Array.from(bad.t), y: Array.from(bad.x), kind: 'dots', color: 'c1', radius: 4.5, label: '샘플' },
      ],
      x: { range: [0, 1], label: '시간 [s]' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
      height: 140,
    },
  ],
};
