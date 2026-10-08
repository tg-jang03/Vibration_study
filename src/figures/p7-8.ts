/**
 * P7-8 "유체 · 공력 원인" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 계산은 랩(LAB-FLOW-01)과 같은 `lib/faults/flow.ts`의 설명용 모델로 한다. 구름베어링 비교는 `lib/faults/synth.ts`(P7-1·P7-5와 같은 펌프).
 */
import { squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { envelopeSpectrum, spectrumOf, bandAnalytic } from '../lib/dsp/envelope';
import { bearingFrequencies } from '../lib/machine/frequencies';
import { bearingOf } from '../lib/faults/catalog';
import { MACHINES, synthesize } from '../lib/faults/synth';
import {
  bandRms,
  COMP,
  COMP_FR,
  compLines,
  compSlowSignals,
  compState,
  G,
  npshr,
  pressureRatio,
  PUMP,
  PUMP_FR,
  PUMP_VPF,
  pumpEff,
  pumpHead,
  pumpLevels,
  pumpSignals,
  rmsSpectrum,
} from '../lib/faults/flow';

const fmt = formatNumber;
const lv = (q: number, s: Parameters<typeof pumpLevels>[0] = 'normal', up = 0) => pumpLevels(s, { q, suctionUp: up });
const BPFO = bearingFrequencies(bearingOf(MACHINES.pump.balls), MACHINES.pump.rpm / 60).bpfo;

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p7-8.test.ts`) */
export const P78_VALUES = {
  fr: PUMP_FR,
  vpf: PUMP_VPF,
  vpfAt: { q04: lv(0.4).vpf, q1: lv(1).vpf, q125: lv(1.25).vpf, gap1: lv(1, 'gap').vpf },
  recirc04: lv(0.4).recirc,
  hyd: { q06: lv(0.6, 'hydraulic').oneX, q1: lv(1, 'hydraulic').oneX, q13: lv(1.3, 'hydraulic').oneX },
  unb: lv(0.6, 'unbalance').oneX,
  cavit: { q1: lv(1, 'lowSuction').cavit, q1up02: lv(1, 'lowSuction', 0.2).cavit, q07: lv(0.7, 'lowSuction').cavit, margin1: lv(1, 'lowSuction').marginAtQ, margin12normal: lv(1.2).marginAtQ, margin13normal: lv(1.3).marginAtQ },
  bpfo: BPFO,
  comp: {
    fr: COMP_FR,
    stall064: compState({ phi: 0.64, antiSurge: true }).stall!,
    stall070: compState({ phi: 0.7, antiSurge: true }).stall!,
    anti050: compState({ phi: 0.5, antiSurge: true }),
    surge050: compState({ phi: 0.5, antiSurge: false }),
    prDesign: pressureRatio(1),
    prSurge: pressureRatio(COMP.surgeLine),
  },
};
const V = P78_VALUES;

const text = (x: number, y: number, t: string, extra: Partial<Extract<FigAnnotation, { type: 'text' }>> = {}): FigAnnotation => ({ type: 'text', x, y, text: t, anchor: 'middle', ...extra });
const stem = (f: number, a: number, color: FigColor, label?: string): FigSeries => ({ x: [f], y: [a], kind: 'stem', color, label, radius: 3.5 });

// ── 그림 1: 날개 통과 ──
const X1: [number, number] = [-30, 30];
const Y1 = squareYRange(X1, 260, -12);
const RI = 5.4;
const vane = (k: number): FigSeries => {
  const th0 = (2 * Math.PI * k) / PUMP.vanes;
  const pts = Array.from({ length: 13 }, (_, i) => {
    const r = 1.6 + ((RI - 1.6) * i) / 12;
    const th = th0 - 0.9 * ((r - 1.6) / (RI - 1.6)); // 뒤로 휜 날개 (회전은 반시계)
    return [r * Math.cos(th), r * Math.sin(th)];
  });
  return { x: pts.map((p) => p[0]), y: pts.map((p) => p[1]), color: 'c1', width: 1.6 };
};
/** 혀는 맨 아래(−90°), 볼류트는 반시계로 커지며 한 바퀴 돌아 오른쪽 토출구로 나간다 */
const TONGUE = -Math.PI / 2;
const R0 = 6.3;
const R1 = 8.9;
const volute: FigSeries = (() => {
  const a = Array.from({ length: 121 }, (_, i) => TONGUE + (2 * Math.PI * i) / 120);
  const r = a.map((th) => R0 + (R1 - R0) * ((th - TONGUE) / (2 * Math.PI)));
  return { x: a.map((th, i) => r[i] * Math.cos(th)), y: a.map((th, i) => r[i] * Math.sin(th)), color: 'muted', width: 1.4 };
})();
const pipe = (y: number): FigSeries => ({ x: [0, 18], y: [y, y], color: 'muted', width: 1.4 });
const tRev = 2 / PUMP_FR;
const tp = Array.from({ length: 801 }, (_, i) => (i / 800) * tRev);
const pulse = tp.map((t) => {
  let s = 0;
  const T = 1 / PUMP_VPF;
  const ph = (t % T) / T;
  for (const d of [ph, ph - 1]) s += Math.exp(-0.5 * (d / 0.09) ** 2);
  return s * (1 + 0.08 * Math.cos(2 * Math.PI * PUMP_FR * t));
});
const L1 = lv(1);
export const vanePass: FigureSpec = {
  id: 'fig-p7-8-1',
  caption: `그림 1. 날개 7장의 원심 펌프(${PUMP.rpm} rpm, 1X = ${fmt(PUMP_FR, 4)} Hz). 위: 임펠러(파랑)가 돌며 날개 끝이 볼류트 혀(주황 점) 앞을 지날 때마다 그 자리의 압력이 한 번씩 출렁인다. 가운데: 혀 앞의 압력 — 두 바퀴(${fmt(tRev * 1000, 3)} ms)에 14번. 아래: 베어링 하우징 속도 스펙트럼(최고 효율점에서) — 1X와 함께 날개 통과 주파수 VPF = 7 × ${fmt(PUMP_FR, 4)} = ${fmt(PUMP_VPF, 4)} Hz와 그 2배 ${fmt(2 * PUMP_VPF, 4)} Hz에 줄이 선다.`,
  panels: [
    {
      frame: false,
      height: 230,
      x: { range: X1 },
      y: { range: Y1 },
      series: [volute, pipe(-R0), pipe(-R1), ...Array.from({ length: PUMP.vanes }, (_, k) => vane(k))],
      annotations: [
        { type: 'circle', x: 0, y: 0, r: 1.3 * (820 / 60), color: 'c1' },
        { type: 'point', x: 0, y: -R0, color: 'warn' },
        text(-1.5, -10.8, '볼류트 혀', { color: 'warn', anchor: 'end' }),
        text(19, -7.6, '토출 →', { color: 'muted', anchor: 'start' }),
        text(-11, 3, '임펠러: 날개 7장, 반시계 회전', { color: 'c1', anchor: 'end' }),
        text(9.5, 6.5, '케이싱(볼류트)', { color: 'muted', anchor: 'start' }),
      ],
    },
    {
      title: '혀 앞의 압력 (두 바퀴)',
      height: 110,
      x: { range: [0, tRev * 1000], label: '시간 [ms]' },
      y: { range: [0, 1.25], ticks: 'none' },
      series: [{ x: tp.map((t) => t * 1000), y: pulse, color: 'c2', width: 1.6 }],
    },
    {
      title: '베어링 하우징 속도 스펙트럼 (최고 효율점)',
      height: 130,
      x: { range: [0, 900], label: '주파수 [Hz]', ticks: [0, Number(PUMP_FR.toFixed(1)), Number(PUMP_VPF.toFixed(1)), Number((2 * PUMP_VPF).toFixed(1))] },
      y: { range: [0, 1.05], label: '[mm/s rms]' },
      series: [stem(PUMP_FR, L1.oneX, 'muted'), stem(2 * PUMP_FR, 0.25, 'muted'), stem(PUMP_VPF, L1.vpf, 'c1'), stem(2 * PUMP_VPF, L1.vpf2, 'c1')],
      annotations: [text(PUMP_FR, L1.oneX + 0.12, '1X', { color: 'muted' }), text(PUMP_VPF, L1.vpf + 0.12, 'VPF = 7X', { color: 'c1' }), text(2 * PUMP_VPF, L1.vpf2 + 0.12, '2 × VPF', { color: 'c1' })],
    },
  ],
};

// ── 그림 2: 운전점과 BEP ──
const qs = Array.from({ length: 121 }, (_, i) => 0.2 + (i / 120) * 1.2);
export const operatingPoint: FigureSpec = {
  id: 'fig-p7-8-2',
  caption: `그림 2. 회전수를 그대로 두고 유량(Q/Q_BEP)만 바꿀 때. 위: 양정(파랑)과 효율(회색 점선) — 효율이 가장 높은 유량이 최고 효율점(BEP)이다. 가운데: 날개 통과 성분(파랑)은 BEP에서 가장 작고(${fmt(V.vpfAt.q1, 2)} mm/s) 유량을 40 %로 줄이면 ${fmt(V.vpfAt.q04, 3)} mm/s로 커진다. 유량이 60 % 아래로 내려가면 재순환이 만드는 낮은 주파수 넓은 대역(주황)이 나타난다. 임펠러 유로가 고르지 않은 펌프의 1X(보라)는 BEP에서 멀어질수록 커지지만, 기계 불평형의 1X(회색)는 유량과 무관하다. 아래: 흡입 여유(NPSHa ÷ 필요 NPSH)는 유량이 늘수록 줄어든다. 이 모델에서는 1.2 아래에서 캐비테이션이 시작된다 — 흡입 압력이 낮은 펌프(주황)는 BEP에서 이미 ${V.cavit.margin1.toFixed(1)}이다.`,
  panels: [
    {
      title: '성능 곡선',
      height: 120,
      x: { range: [0.2, 1.4], label: 'Q / Q_BEP' },
      y: { range: [0, 1.35], ticks: [0, 0.5, 1] },
      series: [
        { x: qs, y: qs.map(pumpHead), color: 'c1', width: 2, label: '양정 (BEP = 1)' },
        { x: qs, y: qs.map(pumpEff), color: 'muted', dash: true, width: 1.4, label: '효율 (BEP = 1)' },
      ],
      annotations: [{ type: 'vline', x: 1, label: 'BEP', color: 'muted', dash: true }],
    },
    {
      title: '성분 크기',
      height: 160,
      x: { range: [0.2, 1.4], label: 'Q / Q_BEP' },
      y: { range: [0, 4.8], label: '[mm/s rms]' },
      series: [
        { x: qs, y: qs.map((q) => lv(q).vpf), color: 'c1', width: 2, label: '날개 통과 VPF' },
        { x: qs, y: qs.map((q) => lv(q).recirc), color: 'c2', width: 2, label: '재순환 (5 ~ 40 Hz)' },
        { x: qs, y: qs.map((q) => lv(q, 'hydraulic').oneX), color: 'c4', width: 2, label: '1X — 수력 불평형' },
        { x: qs, y: qs.map((q) => lv(q, 'unbalance').oneX), color: 'muted', dash: true, width: 1.4, label: '1X — 기계 불평형 (일정)' },
      ],
      annotations: [{ type: 'vline', x: 1, color: 'muted', dash: true }],
    },
    {
      title: '흡입 여유 NPSHa ÷ NPSHr(Q)',
      height: 130,
      x: { range: [0.2, 1.4], label: 'Q / Q_BEP' },
      y: { range: [0.5, 3.0], ticks: [1.2, 2, 3] },
      series: [
        { x: qs, y: qs.map((q) => 1.6 / npshr(q)), color: 'c1', width: 2, label: '흡입 압력 정상' },
        { x: qs, y: qs.map((q) => 1.0 / npshr(q)), color: 'warn', width: 2, label: '흡입 압력 낮음' },
      ],
      annotations: [{ type: 'hline', y: 1.2, label: '캐비테이션 시작 (이 모델)', color: 'muted', dash: true, labelAt: 'start', labelBelow: true }, { type: 'vline', x: 1, color: 'muted', dash: true }],
    },
  ],
};

// ── 그림 3: 운전점별 속도 스펙트럼 ──
const specAt = (q: number) => {
  const s = pumpSignals('normal', { q, suctionUp: 0 });
  return rmsSpectrum(s.vel, s.fs, 500);
};
const specPanel = (q: number, title: string, color: FigColor): (typeof vanePass)['panels'][number] => {
  const s = specAt(q);
  return {
    title,
    height: 110,
    x: { range: [0, 500], label: '주파수 [Hz]', ticks: [0, 60, 100, 200, 300, 417, 500] },
    y: { range: [0, 1.5], label: '[mm/s rms]' },
    series: [{ x: s.freq, y: s.amp, color, width: 1.2 }],
  };
};
const recircMeasured = (() => {
  const s = specAt(0.4);
  return bandRms(s.freq, s.amp, 5, 40);
})();
export const flowSpectra: FigureSpec = {
  id: 'fig-p7-8-3',
  caption: `그림 3. 같은 펌프·같은 회전수에서 유량만 바꾼 속도 스펙트럼(1 s, Hann). BEP(가운데)에서는 1X(${fmt(PUMP_FR, 3)} Hz)와 작은 날개 통과(417 Hz)뿐이다. 유량 40 %(위)에서는 날개 통과가 ${fmt(V.vpfAt.q04, 3)} mm/s로 커지고, 5 ~ 40 Hz에 줄이 아닌 넓은 둔덕(재순환, 대역 RMS 약 ${fmt(recircMeasured, 2)} mm/s)이 선다. 유량 125 %(아래)에서도 날개 통과가 ${fmt(V.vpfAt.q125, 2)} mm/s로 조금 커진다. 회전 성분(1X)은 세 경우 모두 같다.`,
  panels: [specPanel(0.4, '유량 40 % (저유량)', 'c2'), specPanel(1, '유량 100 % (BEP)', 'c1'), specPanel(1.25, '유량 125 %', 'c4')],
};

// ── 그림 4: 캐비테이션 vs 외륜 결함 ──
const db = (a: number) => 20 * Math.log10(Math.max(a, 1e-4));
const cavSig = pumpSignals('lowSuction', { q: 1, suctionUp: 0 });
const okSig = pumpSignals('normal', { q: 1, suctionUp: 0 });
const cavAcc = rmsSpectrum(cavSig.acc, cavSig.fs, 8000);
const okAcc = rmsSpectrum(okSig.acc, okSig.fs, 8000);
const thin = (s: { freq: Float64Array; amp: Float64Array }, step = 4) => {
  const x: number[] = [];
  const y: number[] = [];
  for (let k = 0; k < s.freq.length; k += step) {
    let m = 0;
    for (let j = k; j < Math.min(k + step, s.freq.length); j++) m = Math.max(m, s.amp[j]);
    x.push(s.freq[k]);
    y.push(db(m));
  }
  return { x, y };
};
const brg = synthesize(MACHINES.pump, { bearingOuter: 0.5 });
const brgAccG = brg.acc.V.map((v) => v / G);
const cavEnv = envelopeSpectrum(spectrumOf(cavSig.acc), cavSig.fs, 2000, 6000, 500);
const brgEnv = envelopeSpectrum(spectrumOf(brgAccG), brg.fs, 2000, 6000, 500);
const win = (x: Float64Array, fs: number, ms: number) => {
  const band = bandAnalytic(spectrumOf(x), fs, 2000, 6000).re;
  const n = Math.round((ms / 1000) * fs);
  return { x: Array.from({ length: n }, (_, i) => (i / fs) * 1000), y: Array.from(band.slice(0, n)) };
};
const cavWave = win(cavSig.acc, cavSig.fs, 40);
const brgWave = win(brgAccG, brg.fs, 40);
const envMax = Math.max(...cavEnv.amp.slice(3), ...brgEnv.amp.slice(3)) * 1.15;
export const cavitation: FigureSpec = {
  id: 'fig-p7-8-4',
  caption: `그림 4. 흡입 압력이 낮아 캐비테이션이 생긴 펌프(BEP 유량). 위: 가속도 스펙트럼(dB, 1 g rms = 0 dB) — 정상(회색)은 회전·날개 통과의 줄 몇 개뿐인데, 캐비테이션(주황)은 2 ~ 6 kHz 넓은 대역이 대역 RMS ${fmt(V.cavit.q1, 2)} g로 솟는다. 줄이 아니라 둔덕이다. 둘째·셋째: 2 ~ 6 kHz만 남긴 파형 40 ms — 캐비테이션(주황)은 불규칙한 잡음이고, 구름베어링 외륜 결함(파랑, P7-5와 같은 펌프)은 BPFO(${fmt(BPFO, 4)} Hz)마다 울리는 충격이다. 아래: 같은 대역의 포락선 스펙트럼(P5-6) — 베어링은 BPFO와 그 하모닉에 줄이 서고, 캐비테이션은 줄 없이 평평하다.`,
  panels: [
    {
      title: '가속도 스펙트럼 (dB)',
      height: 140,
      x: { range: [0, 8000], label: '주파수 [Hz]' },
      y: { range: [-60, 0], label: '[dB re 1 g]' },
      series: [
        { ...thin(cavAcc), color: 'warn', width: 1, label: '캐비테이션' },
        { ...thin(okAcc), color: 'muted', width: 1, label: '정상' },
      ],
      annotations: [{ type: 'band', x1: 2000, x2: 6000, label: '2 ~ 6 kHz', color: 'warn' }],
    },
    { title: '캐비테이션: 2 ~ 6 kHz 파형', height: 100, x: { range: [0, 40], label: '시간 [ms]' }, y: { range: [-5, 5], label: '[g]' }, series: [{ ...cavWave, color: 'warn', width: 0.8 }] },
    { title: '외륜 결함: 2 ~ 6 kHz 파형', height: 100, x: { range: [0, 40], label: '시간 [ms]' }, y: { range: [-5, 5], label: '[g]' }, series: [{ ...brgWave, color: 'c1', width: 0.8 }] },
    {
      title: '포락선 스펙트럼 (2 ~ 6 kHz 대역)',
      height: 130,
      x: { range: [0, 500], label: '주파수 [Hz]', ticks: [0, 100, Number(BPFO.toFixed(1)), 300, Number((2 * BPFO).toFixed(1)), 500] },
      y: { range: [0, envMax], label: '[g]' },
      series: [
        { x: Array.from(brgEnv.freq), y: Array.from(brgEnv.amp), color: 'c1', width: 1.2, label: '외륜 결함' },
        { x: Array.from(cavEnv.freq), y: Array.from(cavEnv.amp), color: 'warn', width: 1.2, label: '캐비테이션' },
      ],
    },
  ],
};

// ── 그림 5: 압축기 성능 지도 ──
const ph = Array.from({ length: 121 }, (_, i) => COMP.surgeLine + (i / 120) * (1.15 - COMP.surgeLine));
const phLeft = Array.from({ length: 31 }, (_, i) => 0.42 + (i / 30) * (COMP.surgeLine - 0.42));
export const compressorMap: FigureSpec = {
  id: 'fig-p7-8-5',
  caption: `그림 5. 원심 압축기의 한 회전수(${COMP.rpm} rpm) 성능 곡선. 유량을 설계점(1.0, 압력비 ${fmt(V.comp.prDesign, 3)})에서 줄이면 압력비가 오르다가 서지선(유량 ${COMP.surgeLine})에서 꼭대기(${V.comp.prSurge.toFixed(1)})에 닿는다. 그 왼쪽(점선)에서는 압축기가 더 높은 압력을 만들지 못해 흐름이 거꾸로 밀려 나오는 서지가 된다. 서지선보다 앞의 ${COMP.stallOnset} 아래에서는 Rotating stall이 먼저 생긴다(이 모델). 서지 방지 제어는 재순환 밸브를 열어 압축기를 지나는 유량을 ${COMP.antiSurgeMin} 아래로 내리지 않는다 — 서지는 막지만 stall 구간은 남을 수 있다.`,
  panels: [
    {
      height: 210,
      x: { range: [0.4, 1.15], label: '유량 / 설계 유량' },
      y: { range: [1.8, 3.25], label: '압력비' },
      series: [
        { x: ph, y: ph.map(pressureRatio), color: 'c1', width: 2.2, label: '성능 곡선' },
        { x: phLeft, y: phLeft.map(pressureRatio), color: 'c1', width: 1.4, dash: true },
        { x: [1, 0.64, 0.5], y: [pressureRatio(1), pressureRatio(0.64), pressureRatio(0.5)], kind: 'dots', color: 'text', radius: 4.5 },
      ],
      annotations: [
        { type: 'vline', x: COMP.surgeLine, label: '서지선', color: 'warn' },
        { type: 'vline', x: COMP.antiSurgeMin, label: '서지 방지선', color: 'c3', dash: true },
        { type: 'vline', x: COMP.stallOnset, label: 'stall 시작', color: 'muted', dash: true },
        text(1, pressureRatio(1) + 0.1, '설계점'),
        text(0.64, pressureRatio(0.64) - 0.12, 'stall (0.64)', { anchor: 'start', dx: 6 }),
        text(0.5, pressureRatio(0.5) + 0.1, '서지 (0.5)'),
      ],
    },
  ],
};

// ── 그림 6: stall 스펙트럼과 서지 파형 ──
const stallLines = compLines({ phi: 0.64, antiSurge: true });
const surgeSlow = compSlowSignals({ phi: 0.5, antiSurge: false });
const sub2 = <T,>(a: ArrayLike<T>) => Array.from({ length: Math.ceil(a.length / 2) }, (_, i) => a[i * 2]);
export const stallSurge: FigureSpec = {
  id: 'fig-p7-8-6',
  caption: `그림 6. 위: 유량 0.64(stall 구간)의 축 변위 스펙트럼 — 1X(${COMP_FR} Hz) 아래 ${fmt(V.comp.stall064.hz, 3)} Hz(${fmt(V.comp.stall064.order, 3)}X)에 실속 셀이 도는 성분(${fmt(V.comp.stall064.amp, 2)} µm)이 선다. 유량을 0.70으로 늘리면 ${fmt(V.comp.stall070.amp, 2)} µm로 줄고, 0.72에 이르면 사라진다. 가운데·아래: 서지 방지를 끄고 유량 0.5로 내렸을 때 10초 기록 — 토출 압력이 천천히 올랐다가 흐름이 거꾸로 밀려 나오는 순간 급히 떨어지기를 ${COMP.surgeHz} Hz(${fmt(1 / COMP.surgeHz, 2)} s마다)로 되풀이하고, 그때마다 축방향 위치가 약 120 µm 튄다(추력이 뒤집힘).`,
  panels: [
    {
      title: '축 변위 스펙트럼 (유량 0.64)',
      height: 120,
      x: { range: [0, 170], label: '주파수 [Hz]', ticks: [0, Number(V.comp.stall064.hz.toFixed(1)), 75, 150] },
      y: { range: [0, 15], label: '[µm pk]' },
      series: stallLines.map((l) => stem(l.hz, l.amp, l.name === '1X' ? 'muted' : 'c2')),
      annotations: [text(V.comp.stall064.hz, V.comp.stall064.amp + 1.6, `stall ${fmt(V.comp.stall064.order, 3)}X`, { color: 'c2' }), text(COMP_FR, 13.6, '1X', { color: 'muted' })],
    },
    { title: '토출 압력 (서지, 유량 0.5)', height: 110, x: { range: [0, 10], label: '시간 [s]' }, y: { range: [90, 145], label: '[% 설계]' }, series: [{ x: sub2(surgeSlow.t), y: sub2(surgeSlow.press), color: 'warn', width: 1.2 }] },
    { title: '축방향 위치 (서지)', height: 110, x: { range: [0, 10], label: '시간 [s]' }, y: { range: [-140, 20], label: '[µm]' }, series: [{ x: sub2(surgeSlow.t), y: sub2(surgeSlow.axial), color: 'c4', width: 1.2 }] },
  ],
};
