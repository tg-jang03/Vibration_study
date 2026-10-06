/**
 * P3-4 "측정 체인 함정" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 스펙트럼·파형은 랩(LAB-CHAIN-01)과 같은 `src/lib/measurementChain.ts`로 만든다 (예시 펌프 2970 rpm, F_max 5 kHz).
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { BIAS, decimateMax, G, GROUND_LOOP, MACHINE, measureChain, RANGE, type ChainResult } from '../lib/measurementChain';
import { MOUNTS } from '../lib/sensor';

const fmt = formatNumber;
const mm = (v: number) => v * 1e3;
const gRms = (p: number) => Math.sqrt(p) / G;
const db = (p: number) => 20 * Math.log10(Math.max(gRms(p), 1e-12));
const velMm = (r: ChainResult) => Array.from(r.velPower, (p) => mm(Math.sqrt(p)));
const upTo = (r: ChainResult, fMax: number) => {
  const k = Math.floor(fMax / r.df);
  return { f: Array.from(r.freq.subarray(0, k + 1)), k };
};
/** 시간파형을 묶음마다 최소·최대 두 점으로 (튀는 펄스를 잃지 않게) */
function minMax(t: ArrayLike<number>, y: ArrayLike<number>, group: number): { t: number[]; y: number[] } {
  const ot: number[] = [];
  const oy: number[] = [];
  for (let i = 0; i < y.length; i += group) {
    let lo = i;
    let hi = i;
    for (let j = i; j < Math.min(i + group, y.length); j++) {
      if (y[j] < y[lo]) lo = j;
      if (y[j] > y[hi]) hi = j;
    }
    for (const j of lo < hi ? [lo, hi] : [hi, lo]) {
      ot.push(t[j]);
      oy.push(y[j]);
    }
  }
  return { t: ot, y: oy };
}

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p3-4.test.ts`) */
export const P24_VALUES = (() => {
  const normal = measureChain('normal', 'none', { displaySeconds: 1 });
  const ski = measureChain('skiSlope');
  const gl = measureChain('groundLoop');
  const glRpm = measureChain('groundLoop', 'rpm');
  const glIso = measureChain('groundLoop', 'isolate');
  const cable = measureChain('cable', 'none', { displaySeconds: 1 });
  const cableFix = measureChain('cable', 'tieCable', { displaySeconds: 1 });
  const clip = measureChain('clipping', 'none', { displaySeconds: 0.04 });
  const noClip = measureChain('clipping', 'range', { displaySeconds: 0.04 });
  const wide = { fs: 25600 };
  const mounts = {
    stud: measureChain('normal', 'none', { ...wide, mount: 'stud' }),
    magnet: measureChain('normal', 'none', { ...wide, mount: 'magnet' }),
    hand: measureChain('normal', 'none', { ...wide, mount: 'hand' }),
  };
  const gl60 = (GROUND_LOOP[0].g * G) / Math.SQRT2 / (2 * Math.PI * 60);
  const tau = 2;
  const lineDb = (r: ChainResult, f: number) => {
    const k = Math.round(f / r.df);
    let sum = 0;
    for (let j = k - 4; j <= k + 4; j++) sum += r.accelPower[j];
    return 20 * Math.log10(Math.sqrt(sum / r.enbw) / G);
  };
  const h5 = { clip: lineDb(clip, 5 * 49.5), noClip: lineDb(noClip, 5 * 49.5) };
  return { h5, normal, ski, gl, glRpm, glIso, cable, cableFix, clip, noClip, mounts, gl60, tau, settle10: Math.exp(-10 / tau) };
})();
const V = P24_VALUES;

// 그림 1 — 측정 체인 (도식)
const Y1 = squareYRange([0, 30], 190);
const STAGES: { name: string; traps: [string, string]; ref: string }[] = [
  { name: '마운팅', traps: ['설치 공진', '→ 고주파 봉우리'], ref: '2절 · P3-1' },
  { name: '센서', traps: ['자체 공진', '열·충격 → 저주파'], ref: '2절 · 4절' },
  { name: '케이블', traps: ['흔들림·커넥터', '→ 튀는 잡음'], ref: '6절' },
  { name: '전원 (IEPE)', traps: ['바이어스로 진단', '켠 직후 정착'], ref: '3절' },
  { name: '분석기 입력', traps: ['접지 → 60 Hz 잡음', '레인지 → 클리핑'], ref: '5절 · 6절' },
  { name: '계산 · 표시', traps: ['적분 → ski-slope', '윈도우·평균'], ref: '4절 · P2-5' },
];
const chainAnn: FigAnnotation[] = STAGES.flatMap((s, i): FigAnnotation[] => {
  const cx = 2.5 + 5 * i;
  const out: FigAnnotation[] = [
    { type: 'rect', x1: cx - 2.1, x2: cx + 2.1, y1: 5.7, y2: 7.2, color: i === 3 || i === 4 ? 'c3' : 'c1' },
    { type: 'text', x: cx, y: 6.3, text: s.name, anchor: 'middle', bold: true },
    { type: 'text', x: cx, y: 4.9, text: s.traps[0], anchor: 'middle', color: 'warn' },
    { type: 'text', x: cx, y: 4.0, text: s.traps[1], anchor: 'middle', color: 'warn' },
    { type: 'text', x: cx, y: 3.0, text: s.ref, anchor: 'middle', color: 'muted' },
  ];
  if (i < STAGES.length - 1) out.push({ type: 'arrow', x1: cx + 2.15, y1: 6.45, x2: cx + 2.85, y2: 6.45, color: 'text', double: false });
  return out;
});
export const chain: FigureSpec = {
  id: 'fig-p3-4-1',
  caption:
    '그림 1. 기계 표면의 진동이 화면의 숫자가 되기까지 거치는 측정 체인과 단계마다 생길 수 있는 가짜 신호 (주황). 화면에 보이는 막대는 이 사슬을 모두 지나온 결과다. 어느 고리에서든 기계에 없는 성분이 생기거나 있는 성분이 사라질 수 있다 — 그래서 이상한 값이 나오면 기계보다 체인을 먼저 의심해 본다.',
  panels: [
    {
      frame: false,
      height: 190,
      x: { range: [0, 30] },
      y: { range: Y1 },
      series: [],
      annotations: [
        { type: 'text', x: 15, y: 7.75, text: '기계 표면 → 마운팅 → 센서 → 케이블 → 전원 → 분석기 → 화면', anchor: 'middle', color: 'muted' },
        ...chainAnn,
        { type: 'text', x: 15, y: 1.5, text: '확인 습관: 바이어스 전압 · 시간파형 · 센서를 바꿔 다시 재기 · 다른 센서와 비교', anchor: 'middle', bold: true },
        { type: 'text', x: 15, y: 0.55, text: '(초록: 전원과 분석기 입력 — 센서 상태와 입력 설정을 숫자로 확인할 수 있는 곳)', anchor: 'middle', color: 'muted' },
      ],
    },
  ],
};

// 그림 2 — 마운팅: 설치 공진 봉우리
const mountSeries = (r: ChainResult, color: FigColor, label: string) => {
  const d = decimateMax(r.freq, r.accelPower, 16, 10000);
  return { x: d.f, y: d.y.map(db), color, width: 1.6, label };
};
export const mounting: FigureSpec = {
  id: 'fig-p3-4-2',
  caption: `그림 2. 같은 펌프(2970 rpm)의 같은 자리를 설치만 바꿔 쟀다 (가속도 스펙트럼, F_max 10 kHz, dB re 1 g rms, 예시값). 스터드(파랑)는 10 kHz까지 평평하다. 자석(주황)은 설치 공진 ${MOUNTS.magnet.fn / 1000} kHz 둘레의 바닥이 ${fmt(1 / (2 * MOUNTS.magnet.zeta), 2)}배(+20 dB), 손으로 댄 탐침(보라)은 ${MOUNTS.hand.fn / 1000} kHz 둘레가 ${fmt(1 / (2 * MOUNTS.hand.zeta), 2)}배(+14 dB)로 솟고, 그 위는 오히려 깎인다. 봉우리는 기계가 아니라 센서를 붙인 방법이 만든 것이다 (P3-1의 설치 공진).`,
  panels: [
    {
      series: [mountSeries(V.mounts.stud, 'c1', '스터드'), mountSeries(V.mounts.magnet, 'c2', '자석'), mountSeries(V.mounts.hand, 'c4', '손으로 대기')],
      annotations: [
        { type: 'text', x: MOUNTS.hand.fn, y: -50, text: '손: 2 kHz', anchor: 'middle', color: 'c4', bold: true },
        { type: 'text', x: MOUNTS.magnet.fn, y: -44, text: '자석: 7 kHz', anchor: 'middle', color: 'c2', bold: true },
      ],
      x: { range: [0, 10000], ticks: [0, 2000, 4000, 6000, 8000, 10000], label: '주파수 [Hz]' },
      y: { range: [-110, -10], ticks: [-100, -80, -60, -40, -20], label: '[dB re 1 g]' },
      height: 200,
      legend: true,
    },
  ],
};

// 그림 3 — IEPE: 정착과 바이어스 전압
const tSettle = Array.from({ length: 301 }, (_, i) => (i * 15) / 300);
export const iepeBias: FigureSpec = {
  id: 'fig-p3-4-3',
  caption: `그림 3. IEPE 센서의 출력에는 진동(± 수십 mV) 밑에 바이어스라는 일정한 전압(예: ${BIAS.normal} V)이 깔려 있다. 위: 분석기는 이 직류를 축전기로 걸러(AC 결합) 진동만 받는데, 전원을 켜는 순간의 계단이 천천히 빠져나간다 — 시정수 τ = ${V.tau} s(예시)면 10 s 뒤에도 ${fmt(V.settle10 * 100, 2)} %가 남는다. 이 꼬리가 남은 채 재면 아주 낮은 주파수가 부풀어 오른다 (4절). 아래: 분석기가 보여 주는 바이어스 전압으로 센서와 케이블 상태를 본다 — 0 V 근처면 합선, 공급 전압(예: 24 V) 근처면 끊김. 정상 범위는 센서 설명서를 따른다.`,
  panels: [
    {
      title: '켠 직후 분석기 입력 (AC 결합 뒤, 진동은 생략)',
      series: [{ x: tSettle, y: tSettle.map((t) => BIAS.normal * Math.exp(-t / V.tau)), color: 'c2', width: 2.2 }],
      annotations: [
        { type: 'vline', x: 10, color: 'muted', label: '10 s 뒤' },
        { type: 'text', x: 2.2, y: 8, text: `τ = ${V.tau} s: 1τ 뒤 37 %, 5τ 뒤 0.7 %`, anchor: 'start', color: 'c2' },
      ],
      x: { range: [0, 15], ticks: [0, 2, 4, 6, 8, 10, 12, 14], label: '전원을 켠 뒤 시간 [s]' },
      y: { range: [0, 12.5], ticks: [0, 4, 8, 12], label: '[V]' },
      height: 130,
    },
    {
      title: '바이어스 전압으로 보는 센서 상태 (예시)',
      series: [],
      annotations: [
        { type: 'band', x1: 0, x2: 1.5, color: 'warn', label: '합선' },
        { type: 'band', x1: 8, x2: 14, color: 'c3', label: '정상 (예)' },
        { type: 'band', x1: 22, x2: 25, color: 'warn', label: '끊김' },
        { type: 'point', x: BIAS.short, y: 0.35, color: 'warn', label: `${BIAS.short} V`, dx: 8, dy: 4 },
        { type: 'point', x: BIAS.normal, y: 0.35, color: 'c3', label: `${BIAS.normal} V`, dx: 8, dy: 4 },
        { type: 'point', x: BIAS.open, y: 0.35, color: 'warn', label: `${BIAS.open} V`, dx: -48, dy: 4 },
      ],
      x: { range: [0, 25], ticks: [0, 5, 10, 15, 20, 25], label: '바이어스 전압 [V]' },
      y: { range: [0, 1], ticks: 'none' },
      height: 70,
    },
  ],
};

// 그림 4 — ski-slope
const lo100n = upTo(V.normal, 100);
const lo100s = upTo(V.ski, 100);
export const skiSlope: FigureSpec = {
  id: 'fig-p3-4-4',
  caption: `그림 4. 켠 직후(정착 전) 잰 데이터(주황)와 정상 측정(회색 점선). 위: 가속도로 보면 1 Hz 근처에 작은 흔들림(약 ${fmt(gRms(V.ski.accelPower[1]), 2)} g)이 더해졌을 뿐이다. 아래: 같은 데이터를 2πf로 나눠 속도로 바꾸면 1 Hz 근처가 ${fmt(mm(Math.sqrt(V.ski.velPower[1])), 3)} mm/s까지 치솟는다 — 49.5 Hz의 1X(${fmt(mm(V.ski.oneX), 3)} mm/s)보다 훨씬 크다. 스키 활강로처럼 왼쪽 끝이 솟아 ski-slope라고 부른다. 2 ~ 1000 Hz 전체 값은 ${fmt(mm(V.normal.overall), 3)} → ${fmt(mm(V.ski.overall), 3)} mm/s로 세 배가 되었다.`,
  panels: [
    {
      title: '가속도 스펙트럼',
      series: [
        { x: lo100n.f, y: Array.from(V.normal.accelPower.subarray(0, lo100n.k + 1), gRms), color: 'muted', dash: true, width: 1.4, label: '정상' },
        { x: lo100s.f, y: Array.from(V.ski.accelPower.subarray(0, lo100s.k + 1), gRms), color: 'c2', width: 1.8, label: '켠 직후' },
      ],
      annotations: [],
      x: { range: [0, 100], ticks: 'none' },
      y: { range: [0, 0.07], ticks: [0, 0.02, 0.04, 0.06], label: '[g rms]' },
      height: 110,
      legend: true,
    },
    {
      title: '같은 데이터의 속도 스펙트럼 (÷ 2πf)',
      series: [
        { x: lo100n.f, y: velMm(V.normal).slice(0, lo100n.k + 1), color: 'muted', dash: true, width: 1.4 },
        { x: lo100s.f, y: velMm(V.ski).slice(0, lo100s.k + 1), color: 'c2', width: 1.8 },
      ],
      annotations: [{ type: 'text', x: 52, y: 3.2, text: '1X 49.5 Hz', anchor: 'start', color: 'muted' }],
      x: { range: [0, 100], ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], label: '주파수 [Hz]' },
      y: { range: [0, 25], ticks: [0, 5, 10, 15, 20, 25], label: '[mm/s rms]' },
      height: 150,
    },
  ],
};

// 그림 5 — 그라운드 루프
const glPanel = (r: ChainResult, title: string, marks: boolean, last: boolean) => {
  const u = upTo(r, 400);
  return {
    title,
    series: [{ x: u.f, y: velMm(r).slice(0, u.k + 1), color: 'c1' as FigColor, width: 1.6 }],
    annotations: marks
      ? GROUND_LOOP.map((c): FigAnnotation => ({ type: 'text', x: c.f, y: mm((c.g * G) / Math.SQRT2 / (2 * Math.PI * c.f)) + 0.25, text: `${c.f} Hz`, anchor: 'middle', color: 'warn', bold: true }))
      : [],
    x: { range: [0, 400] as [number, number], ticks: last ? [0, 50, 100, 150, 200, 250, 300, 350, 400] : ('none' as const), label: last ? '주파수 [Hz]' : undefined },
    y: { range: [0, 2.2] as [number, number], ticks: [0, 1, 2], label: '[mm/s]' },
    height: 85,
  };
};
export const groundLoop: FigureSpec = {
  id: 'fig-p3-4-5',
  caption: `그림 5. 분석기를 공장 전원에 꽂고 쟀을 때의 속도 스펙트럼. 위: 펌프의 성분(1X 49.5 Hz, 2X, 3X, 날개 통과 346.5 Hz) 사이에 60·180·300 Hz 막대(주황 글자)가 섰다 — 60 Hz는 ${fmt(mm(V.gl60), 3)} mm/s로 1X의 1/3쯤 된다. 가운데: 회전수를 ${MACHINE.altRpm} rpm으로 바꾸면 펌프의 성분은 1X 40 Hz를 따라 모두 옮겨 가는데 60·180·300 Hz는 제자리에 남는다. 아래: 센서를 절연하고 배터리로 도는 분석기로 다시 재자 사라졌다 — 기계가 아니라 접지가 만든 전원 주파수 잡음이다.`,
  panels: [
    glPanel(V.gl, `${MACHINE.rpm} rpm, 공장 전원`, true, false),
    glPanel(V.glRpm, `${MACHINE.altRpm} rpm, 공장 전원`, true, false),
    glPanel(V.glIso, `${MACHINE.rpm} rpm, 접지 분리`, false, true),
  ],
};

// 그림 6 — 케이블·커넥터
const wv = (r: ChainResult) => minMax(r.t, Array.from(r.wave, (a) => a / G), 16);
const cw = wv(V.cable);
const fw = wv(V.cableFix);
const lo60c = upTo(V.cable, 60);
export const cableNoise: FigureSpec = {
  id: 'fig-p3-4-6',
  caption: `그림 6. 커넥터가 느슨하고 케이블이 기계에 닿아 흔들릴 때. 위: 가속도 시간파형(1초)에 가끔 툭 튀는 펄스와 천천히 출렁이는 덩어리가 섞인다 (주황). 가운데: 커넥터를 조이고 케이블을 묶은 뒤 같은 자리(파랑) — 펄스가 없다. 아래: 속도 스펙트럼에서는 10 Hz 둘레가 들쭉날쭉 부풀어(회색 점선은 고정한 뒤) 2 ~ 1000 Hz 전체 값이 ${fmt(mm(V.cableFix.overall), 3)} → ${fmt(mm(V.cable.overall), 3)} mm/s로 커졌다. 덩어리는 잴 때마다 다른 자리에 나온다.`,
  panels: [
    {
      title: '느슨한 커넥터 · 흔들리는 케이블',
      series: [{ x: cw.t, y: cw.y, color: 'c2', width: 1 }],
      annotations: [],
      x: { range: [0, 1], ticks: 'none' },
      y: { range: [-1.5, 1.5], ticks: [-1, 0, 1], label: '[g]' },
      height: 90,
    },
    {
      title: '조이고 고정한 뒤',
      series: [{ x: fw.t, y: fw.y, color: 'c1', width: 1 }],
      annotations: [],
      x: { range: [0, 1], ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: '시각 [s]' },
      y: { range: [-1.5, 1.5], ticks: [-1, 0, 1], label: '[g]' },
      height: 90,
    },
    {
      title: '속도 스펙트럼 (0 ~ 60 Hz)',
      series: [
        { x: lo60c.f, y: velMm(V.cableFix).slice(0, lo60c.k + 1), color: 'muted', dash: true, width: 1.4 },
        { x: lo60c.f, y: velMm(V.cable).slice(0, lo60c.k + 1), color: 'c2', width: 1.6 },
      ],
      annotations: [],
      x: { range: [0, 60], ticks: [0, 10, 20, 30, 40, 50, 60], label: '주파수 [Hz]' },
      y: { range: [0, 15], ticks: [0, 5, 10, 15], label: '[mm/s]' },
      height: 110,
    },
  ],
};

// 그림 7 — 입력 넘침 (클리핑)
const ms = (r: ChainResult) => Array.from(r.t, (t) => t * 1e3);
const lo2k = (r: ChainResult) => decimateMax(r.freq, r.accelPower, 2, 2000);
const c2k = lo2k(V.clip);
const n2k = lo2k(V.noClip);
export const clipping: FigureSpec = {
  id: 'fig-p3-4-7',
  caption: `그림 7. 입력 레인지를 ±${RANGE.tooSmall} g로 너무 작게 잡았을 때 (P2-3의 클리핑). 위: 가속도 파형(40 ms)의 봉우리가 레인지(주황 점선)에서 잘려 평평하다 (회색 점선은 레인지 ±${RANGE.normal} g로 다시 잰 파형). 아래: 가속도 스펙트럼에서 잘린 모서리가 1X(49.5 Hz)의 정수배 자리마다 원래 없던 막대를 세웠다 — 5X(247.5 Hz)는 ${fmt(V.h5.noClip, 3)} → ${fmt(V.h5.clip, 3)} dB로 ${fmt(V.h5.clip - V.h5.noClip, 2)} dB 솟았다. 하모닉이 많은 기계 결함(풀림 등, P7-3)으로 오해하기 쉽다. 1X 자체도 ${fmt(mm(V.noClip.oneX), 3)} → ${fmt(mm(V.clip.oneX), 3)} mm/s로 작아졌다. 분석기의 넘침 표시를 확인하고 레인지를 올린다.`,
  panels: [
    {
      title: '가속도 파형',
      series: [
        { x: ms(V.noClip), y: Array.from(V.noClip.wave, (a) => a / G), color: 'muted', dash: true, width: 1.2 },
        { x: ms(V.clip), y: Array.from(V.clip.wave, (a) => a / G), color: 'c2', width: 1.8 },
      ],
      annotations: [
        { type: 'hline', y: RANGE.tooSmall, color: 'warn', dash: true },
        { type: 'hline', y: -RANGE.tooSmall, color: 'warn', dash: true, label: `레인지 ±${RANGE.tooSmall} g`, labelBelow: true },
      ],
      x: { range: [0, 40], ticks: [0, 10, 20, 30, 40], label: '시각 [ms]' },
      y: { range: [-0.5, 0.5], ticks: [-0.5, -0.25, 0, 0.25, 0.5], label: '[g]' },
      height: 130,
    },
    {
      title: '가속도 스펙트럼 (dB re 1 g rms)',
      series: [
        { x: n2k.f, y: n2k.y.map(db), color: 'muted', dash: true, width: 1.2, label: '레인지 ±2.5 g' },
        { x: c2k.f, y: c2k.y.map(db), color: 'c2', width: 1.6, label: '레인지 ±0.25 g (넘침)' },
      ],
      annotations: [],
      x: { range: [0, 2000], ticks: [0, 500, 1000, 1500, 2000], label: '주파수 [Hz]' },
      y: { range: [-110, -10], ticks: [-100, -80, -60, -40, -20], label: '[dB]' },
      height: 150,
      legend: true,
    },
  ],
};
