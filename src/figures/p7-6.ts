/**
 * P7-6 "기어" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호·계산은 랩(LAB-GEAR-01 · LAB-GEAR-02)과 같은 `lib/faults/gear.ts`로 만든다.
 */
import { squareYRange, type FigAnnotation, type FigPanel, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { G } from '../lib/faults/synth';
import {
  analyzeGear,
  cepAt,
  gearCepstrum,
  gearPair,
  GEAR_DEMO,
  GEAR_PAIR,
  gearSignal,
  gearTsa,
  envelopeHold,
  lcm,
  RES_BAND,
  sidebands,
  ZOOM_HALF,
  type GearOptions,
} from '../lib/faults/gear';

const fmt = formatNumber;
const P = GEAR_PAIR;
const D = GEAR_DEMO;
const opt = (fault: GearOptions['fault'], side: GearOptions['side'] = 'gear', load = 0.8): GearOptions => ({ fault, side, severity: 0.6, load });
const LIGHT = 0.3;

const HEALTHY = opt('healthy');
const ECC_P = opt('eccentric', 'pinion');
const ECC_G = opt('eccentric', 'gear');
const WEAR_G = opt('wear', 'gear');
const BROKEN_G = opt('broken', 'gear');
const BROKEN_P = opt('broken', 'pinion');
const BACKLASH_LIGHT = opt('backlash', 'gear', LIGHT);
const HUNTING = opt('hunting');

const r = (o: GearOptions) => analyzeGear(o).readouts;
const sbPct = (o: GearOptions, spacing: number) => {
  const a = analyzeGear(o);
  const { lo, hi } = sidebands(a.spec.frequency, a.spec.amplitude, P.gmf, spacing, 2);
  const g1 = a.readouts.gmf * G;
  return { lo: lo.map((v) => (100 * v) / g1), hi: hi.map((v) => (100 * v) / g1) };
};
const LOADS = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
/** 헌팅 투스: 두 결함 이빨이 만나는 맞물림 번호 (n ≡ 피니언 이빨 mod z₁, n ≡ 기어 이빨 mod z₂) */
const HT_MESH = (() => {
  for (let n = 0; n < P.lcm; n++) if (n % D.z1 === D.pinionTooth && n % D.z2 === D.gearTooth) return n;
  return -1;
})();
const HT_TIMES = [0, 1, 2, 3].map((k) => (HT_MESH + k * P.lcm + D.offset) / P.gmf).filter((t) => t < D.n / D.fs);
const COMBOS: [number, number][] = [
  [23, 61],
  [24, 37],
  [24, 36],
  [20, 60],
];
const TSA_REVS = { gear: 15, pinion: 40 };
/** 그림 5: 처음 0.25 s, 깨진 기어 이빨이 맞물리는 시각 [ms] */
const T5 = 0.25;
const brokenTimes = [0, 1, 2].map((k) => ((D.gearTooth + k * D.z2 + D.offset) / P.gmf) * 1000);
/** 그림 5 깨진 이(기어) 파형: 그 이빨이 맞물릴 때(−1 ~ +6 ms)의 |최댓값|과 그 밖의 |최댓값| [g] */
const brokenWave = (() => {
  const x = gearSignal(BROKEN_G).acc;
  let impact = 0;
  let mesh = 0;
  for (let i = 0; i < T5 * D.fs; i++) {
    const ms = (1000 * i) / D.fs;
    const v = Math.abs(x[i]) / G;
    if (brokenTimes.some((t) => ms >= t - 1 && ms <= t + 6)) impact = Math.max(impact, v);
    else mesh = Math.max(mesh, v);
  }
  return { impact, mesh };
})();

/** 본문·캡션·랩 해석이 인용하는 숫자 (회귀 테스트 `figures-p7-6.test.ts`) */
export const P76_VALUES = {
  pair: P,
  outRpm: P.f2 * 60,
  ratio: D.z2 / D.z1,
  combos: COMBOS.map(([a, b]) => ({ z1: a, z2: b, lcm: lcm(a, b), pair: gearPair(a, b, P.f1) })),
  htMesh: HT_MESH,
  htTimes: HT_TIMES,
  healthy: r(HEALTHY),
  wear: r(WEAR_G),
  eccP: r(ECC_P),
  eccG: r(ECC_G),
  brokenG: r(BROKEN_G),
  brokenP: r(BROKEN_P),
  backlashLight: r(BACKLASH_LIGHT),
  hunting: r(HUNTING),
  brokenWave,
  sbEccP: sbPct(ECC_P, P.f1),
  sbEccG: sbPct(ECC_G, P.f2),
  load: LOADS.map((l) => ({ load: l, healthy: r(opt('healthy', 'gear', l)), backlash: r(opt('backlash', 'gear', l)) })),
  tsa: {
    brokenG: { gear: gearTsa(BROKEN_G, 'gear', TSA_REVS.gear), pinion: gearTsa(BROKEN_G, 'pinion', TSA_REVS.pinion) },
    healthy: { gear: gearTsa(HEALTHY, 'gear', TSA_REVS.gear), pinion: gearTsa(HEALTHY, 'pinion', TSA_REVS.pinion) },
    brokenGPinion1: gearTsa(BROKEN_G, 'pinion', 1),
  },
  cep: {
    healthy: { p: cepAt(gearCepstrum(HEALTHY), 1 / P.f1), g: cepAt(gearCepstrum(HEALTHY), 1 / P.f2) },
    brokenP: { p: cepAt(gearCepstrum(BROKEN_P), 1 / P.f1), g: cepAt(gearCepstrum(BROKEN_P), 1 / P.f2) },
    brokenG: { p: cepAt(gearCepstrum(BROKEN_G), 1 / P.f1), g: cepAt(gearCepstrum(BROKEN_G), 1 / P.f2) },
    eccG: { p: cepAt(gearCepstrum(ECC_G), 1 / P.f1), g: cepAt(gearCepstrum(ECC_G), 1 / P.f2) },
  },
};
const V = P76_VALUES;

// ── 그림 1: 맞물린 두 기어 (도식) ──
const X1: [number, number] = [0, 30];
const Y1 = squareYRange(X1, 300);
const R2 = 5;
const R1 = (R2 * D.z1) / D.z2;
const MOD = (2 * R2) / D.z2;
const CY = Y1[1] / 2 - 0.2;
const CX2 = 6.2;
const CX1 = CX2 + R2 + R1;
/** 이빨 z개의 바깥 선 (가운데 cx·cy, 피치 반지름 R, 첫 이빨 가운데 각 a0) */
function gearOutline(cx: number, cy: number, z: number, R: number, a0: number): FigSeries['x'][] {
  const xs: number[] = [];
  const ys: number[] = [];
  const rr = R - 1.25 * MOD;
  const rt = R + MOD;
  const p = (2 * Math.PI) / z;
  const push = (rad: number, a: number) => {
    xs.push(cx + rad * Math.cos(a));
    ys.push(cy + rad * Math.sin(a));
  };
  for (let i = 0; i < z; i++) {
    const c = a0 + i * p;
    push(rr, c - 0.5 * p);
    push(rr, c - 0.28 * p);
    push(rt, c - 0.14 * p);
    push(rt, c + 0.14 * p);
    push(rr, c + 0.28 * p);
  }
  push(rr, a0 - 0.5 * p);
  return [xs, ys];
}
const [g2x, g2y] = gearOutline(CX2, CY, D.z2, R2, Math.PI / D.z2);
const [g1x, g1y] = gearOutline(CX1, CY, D.z1, R1, Math.PI);
const hub = (cx: number, rad: number): FigSeries => {
  const a = Array.from({ length: 49 }, (_, i) => (2 * Math.PI * i) / 48);
  return { x: a.map((t) => cx + rad * Math.cos(t)), y: a.map((t) => CY + rad * Math.sin(t)), color: 'muted', width: 1 };
};
export const gearMesh: FigureSpec = {
  id: 'fig-p7-6-1',
  caption: `그림 1. P7-1의 감속기: 입력 피니언(${D.z1}이빨, ${D.rpm} rpm)이 출력 기어(${D.z2}이빨)를 돌린다. 이빨 한 쌍이 맞물렸다가 다음 쌍에 넘겨줄 때마다 힘이 한 번 출렁인다. 피니언이 한 바퀴 돌 때 ${D.z1}번이므로 맞물림 주파수는 ${D.z1} × ${fmt(P.f1, 4)} = ${fmt(P.gmf, 4)} Hz이고, 같은 시간에 기어 쪽에서도 같은 이빨들이 ${D.z2} × ${fmt(P.f2, 4)} = ${fmt(P.gmf, 4)} Hz로 맞물린다. 두 축은 회전수가 다르지만 맞물림 줄은 하나다.`,
  panels: [
    {
      frame: false,
      height: 300,
      x: { range: X1 },
      y: { range: Y1 },
      series: [
        { x: g2x, y: g2y, color: 'c1', width: 1.4 },
        { x: g1x, y: g1y, color: 'c2', width: 1.4 },
        hub(CX2, 0.5),
        hub(CX1, 0.3),
      ],
      annotations: [
        { type: 'text', x: CX2, y: CY + 1.4, text: `기어 z₂ = ${D.z2}`, anchor: 'middle', color: 'c1', bold: true },
        { type: 'text', x: CX2, y: CY - 1.4, text: `${fmt(V.outRpm, 4)} rpm`, anchor: 'middle', color: 'c1' },
        { type: 'text', x: CX2, y: CY - 2.3, text: `f₂ = ${fmt(P.f2, 4)} Hz`, anchor: 'middle', color: 'c1' },
        { type: 'text', x: CX1, y: CY + R1 + 1.5, text: `피니언 z₁ = ${D.z1}`, anchor: 'middle', color: 'c2', bold: true },
        { type: 'text', x: CX1 + R1 + 0.4, y: CY + 0.25, text: `${D.rpm} rpm`, anchor: 'start', color: 'c2' },
        { type: 'text', x: CX1 + R1 + 0.4, y: CY - 0.75, text: `f₁ = ${fmt(P.f1, 4)} Hz`, anchor: 'start', color: 'c2' },
        // 회전 방향: 기어는 반시계(위쪽이 왼쪽으로), 피니언은 시계(위쪽이 오른쪽으로)
        { type: 'arrow', x1: CX2 + 1.4, y1: CY + R2 + 0.75, x2: CX2 - 1.4, y2: CY + R2 + 0.75, color: 'c1' },
        { type: 'arrow', x1: CX1 - 0.9, y1: CY + R1 + 0.6, x2: CX1 + 0.9, y2: CY + R1 + 0.6, color: 'c2' },
        // 맞물림 점: 두 기어 사이 틈으로 아래까지 내린 선 끝에 글자
        { type: 'point', x: CX2 + R2, y: CY, color: 'c3' },
        { type: 'line', x1: CX2 + R2, y1: CY - 0.2, x2: CX2 + R2, y2: CY - R2 - 0.5, color: 'c3', dash: true, width: 1 },
        { type: 'text', x: CX2 + R2, y: CY - R2 - 1.1, text: '맞물림 점', anchor: 'middle', color: 'c3' },
        { type: 'text', x: 19.6, y: CY + 3.0, text: `피니언 한 바퀴 = 맞물림 ${D.z1}번`, anchor: 'start', bold: true },
        { type: 'text', x: 19.6, y: CY + 1.9, text: `GMF = z₁ f₁ = ${D.z1} × ${fmt(P.f1, 4)} = ${fmt(P.gmf, 4)} Hz`, anchor: 'start' },
        { type: 'text', x: 19.6, y: CY + 0.8, text: `     = z₂ f₂ = ${D.z2} × ${fmt(P.f2, 4)} Hz`, anchor: 'start' },
        { type: 'text', x: 19.6, y: CY - 0.6, text: `회전수비 f₁ / f₂ = z₂ / z₁ = ${fmt(V.ratio, 4)}`, anchor: 'start', color: 'muted' },
      ],
    },
  ],
};

// ── 그림 2: 측대역 간격 = 결함 축의 회전수 ──
const zoomPanel = (o: GearOptions, title: string, spacing: number, label: string, color: 'c1' | 'c2'): FigPanel => {
  const z = analyzeGear(o).zoomDb;
  return {
    title,
    height: 150,
    x: { range: [P.gmf - ZOOM_HALF, P.gmf + ZOOM_HALF], label: '주파수 [Hz]' },
    y: { range: [-75, 5], label: '[dB re 1 g]' },
    series: [{ x: z.x, y: z.y, color, width: 1.1 }],
    annotations: [
      { type: 'vline', x: P.gmf, label: 'GMF', color: 'muted', dash: true },
      { type: 'arrow', x1: P.gmf, y1: -8, x2: P.gmf + spacing, y2: -8, double: true, label, color: 'text', labelDx: spacing < 15 ? 30 : 0, labelDy: spacing < 15 ? 14 : 26 },
    ],
  };
};
export const sidebandSpacing: FigureSpec = {
  id: 'fig-p7-6-2',
  caption: `그림 2. 맞물림 둘레 확대 (GMF ± ${ZOOM_HALF} Hz, 기록 8 s, Δf = ${fmt(D.fs / D.n, 3)} Hz). 위: 피니언이 편심이면 맞물림이 피니언 한 바퀴에 한 번 세졌다 약해져 측대역이 f₁ = ${fmt(P.f1, 4)} Hz 간격으로 선다 (첫 쌍 ${fmt(V.sbEccP.lo[0], 2)} % · ${fmt(V.sbEccP.hi[0], 2)} %). 아래: 기어가 편심이면 같은 맞물림 줄 옆에 f₂ = ${fmt(P.f2, 4)} Hz 간격으로 선다. 측대역 간격이 어느 축이 결함인지 알려 준다.`,
  panels: [
    zoomPanel(ECC_P, '피니언 편심', P.f1, `${fmt(P.f1, 4)} Hz`, 'c2'),
    zoomPanel(ECC_G, '기어 편심', P.f2, `${fmt(P.f2, 4)} Hz`, 'c1'),
  ],
};

// ── 그림 3: 헌팅 투스 ──
const huntWave = envelopeHold(gearSignal(HUNTING).acc, D.fs, 64);
const huntMax = Math.max(...huntWave.y);
export const huntingTooth: FigureSpec = {
  id: 'fig-p7-6-3',
  caption: `그림 3. 위: 피니언 ${D.pinionTooth + 1}번 이빨과 기어 ${D.gearTooth + 1}번 이빨이 함께 상한 감속기의 8초 기록 (포락선(P5-6)의 짧은 구간마다 가장 큰 값). 두 이빨은 LCM(${D.z1}, ${D.z2}) = ${P.lcm}번 맞물림마다 한 번 만나 ${fmt(P.htPeriod, 4)} s(피니언 ${P.pinionRevs}바퀴 = 기어 ${P.gearRevs}바퀴)마다 큰 충격을 낸다 (헌팅 투스 주파수 ${fmt(P.fHT, 4)} Hz). 아래: 같은 이빨 쌍이 다시 만나기까지의 맞물림 수 LCM(z₁, z₂). 23·61, 24·37처럼 공약수가 없으면 길고, 24·36(공약수 12)이나 20·60처럼 공약수가 크면 같은 쌍이 자주 만난다.`,
  panels: [
    {
      height: 150,
      x: { range: [0, D.n / D.fs], label: '시각 [s]' },
      y: { range: [0, Math.ceil(huntMax * 1.25)], label: '포락선 최댓값 [g]' },
      series: [{ x: huntWave.t, y: huntWave.y, color: 'c1', width: 1 }],
      annotations: [
        ...HT_TIMES.slice(0, 2).map((t, i): FigAnnotation => ({ type: 'arrow', x1: t, y1: huntMax * 1.12, x2: t + P.htPeriod, y2: huntMax * 1.12, double: true, label: i === 0 ? `${fmt(P.htPeriod, 4)} s` : undefined, color: 'text', labelDy: -8 })),
      ],
    },
    {
      height: 140,
      x: { range: [-0.6, COMBOS.length - 0.4], ticks: COMBOS.map((_, i) => i), tickLabels: COMBOS.map(([a, b], i) => ({ value: i, label: `${a} · ${b}` })), label: '잇수 z₁ · z₂' },
      y: { range: [0, 1650], label: '맞물림 수' },
      series: [{ x: COMBOS.map((_, i) => i), y: V.combos.map((c) => c.lcm), kind: 'bar', barWidth: 0.5, color: 'c2' }],
      annotations: V.combos.map((c, i): FigAnnotation => ({ type: 'text', x: i, y: c.lcm + 60, text: `${c.lcm}`, anchor: 'middle', bold: true })),
    },
  ],
};

// ── 그림 4: 결함마다의 스펙트럼 ──
const specPanel = (o: GearOptions, title: string): FigPanel => {
  const a = analyzeGear(o).accDb;
  return {
    title,
    height: 100,
    x: { range: [0, 3500], label: '주파수 [Hz]' },
    y: { range: [-80, 5], label: '[dB]' },
    series: [{ x: a.x, y: a.y, color: 'c1', width: 1 }],
    annotations: [
      { type: 'band', x1: RES_BAND[0], x2: RES_BAND[1], color: 'c3' },
      ...[1, 2, 3].map((h): FigAnnotation => ({ type: 'vline', x: h * P.gmf, color: 'muted', dash: true, label: h === 1 ? 'GMF' : `${h}×` })),
    ],
  };
};
export const faultSpectra: FigureSpec = {
  id: 'fig-p7-6-4',
  caption: `그림 4. 결함마다의 가속도 스펙트럼 (dB re 1 g, 0 ~ 3.5 kHz, 초록 띠 = 맞물림 공진 대역 ${RES_BAND[0] / 1000} ~ ${RES_BAND[1] / 1000} kHz). 건전: GMF ${fmt(V.healthy.gmf, 2)} g, 2×GMF ÷ GMF = ${fmt(V.healthy.gmf2 / V.healthy.gmf, 2)}. 마모: 2×·3×GMF가 커지고(${fmt(V.wear.gmf2 / V.wear.gmf, 2)} · ${fmt(V.wear.gmf3 / V.wear.gmf, 2)}) 공진 대역이 ${fmt(V.wear.resRms / V.healthy.resRms, 2)}배로 오른다. 편심: 줄 무리는 그대로이고 GMF 옆에 측대역 한 쌍(그림 2). 깨진 이: 측대역이 넓게 많이 선다(기어 간격으로 GMF의 1 %를 넘는 줄 ${V.brokenG.nGear}개). 백래시(부하 ${LIGHT * 100} %): 맞물림마다 크기가 제각각인 충격이 공진 대역 전체를 ${fmt(V.backlashLight.resRms / r(opt('healthy', 'gear', LIGHT)).resRms, 2)}배로 올린다. 설명용 모델이며 크기는 판정 기준이 아니다.`,
  panels: [specPanel(HEALTHY, '건전 (부하 80 %)'), specPanel(WEAR_G, '마모 (기어)'), specPanel(ECC_G, '편심 (기어)'), specPanel(BROKEN_G, '깨진 이 (기어 18번)'), specPanel(BACKLASH_LIGHT, `백래시 과다 (부하 ${LIGHT * 100} %)`)],
};

// ── 그림 5: 결함마다의 시간파형 ──
const wavePanel = (o: GearOptions, title: string, extra: FigAnnotation[] = []): FigPanel => {
  const x = gearSignal(o).acc;
  const n = Math.round(T5 * D.fs);
  const t: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    t.push((i / D.fs) * 1000);
    y.push(x[i] / G);
  }
  return { title, height: 100, x: { range: [0, T5 * 1000], label: '시각 [ms]' }, y: { range: [-3.2, 3.2], label: '[g]' }, series: [{ x: t, y, color: 'c1', width: 0.8 }], annotations: extra };
};
export const faultWaves: FigureSpec = {
  id: 'fig-p7-6-5',
  caption: `그림 5. 같은 결함들의 가속도 파형 (처음 ${T5 * 1000} ms). 편심은 맞물림 파형의 크기가 기어 한 바퀴(${fmt(1000 / P.f2, 4)} ms)마다 한 번 커졌다 작아진다. 깨진 이는 그 이빨이 맞물릴 때(점선)마다 한 번 크게 친다(봉우리 약 ${fmt(V.brokenWave.impact, 2)} g, 맞물림 물결은 약 ${fmt(V.brokenWave.mesh, 2)} g) — 간격이 기어 한 바퀴다. 백래시는 맞물림마다 작은 충격이 제각각의 크기로 섞여 파형이 거칠어진다.`,
  panels: [
    wavePanel(HEALTHY, '건전'),
    wavePanel(ECC_G, '편심 (기어)'),
    wavePanel(BROKEN_G, '깨진 이 (기어 18번)', [
      ...brokenTimes.map((t): FigAnnotation => ({ type: 'vline', x: t, color: 'warn', dash: true })),
      { type: 'arrow', x1: brokenTimes[0], y1: 2.85, x2: brokenTimes[1], y2: 2.85, double: true, label: `${fmt(1000 / P.f2, 4)} ms`, color: 'text', labelDy: -8 },
    ]),
    wavePanel(BACKLASH_LIGHT, `백래시 과다 (부하 ${LIGHT * 100} %)`),
  ],
};

// ── 그림 6: 부하에 따른 변화 ──
export const loadEffect: FigureSpec = {
  id: 'fig-p7-6-6',
  caption: `그림 6. 부하를 바꾸며 본 숫자. 위: GMF 줄은 건전·백래시 모두 부하와 함께 커진다 (${fmt(V.load[0].healthy.gmf, 2)} → ${fmt(V.load[V.load.length - 1].healthy.gmf, 2)} g) — GMF가 크다고 바로 결함은 아니다. 아래: 맞물림 공진 대역의 RMS는 건전하면 부하와 거의 상관없지만(${fmt(V.load[0].healthy.resRms, 2)} ~ ${fmt(V.load[V.load.length - 1].healthy.resRms, 2)} g), 백래시가 크면 부하가 가벼울수록 커진다 (부하 20 %에서 ${fmt(V.load[0].backlash.resRms, 2)} g, 100 %에서 ${fmt(V.load[V.load.length - 1].backlash.resRms, 2)} g). 이가 서로 떨어졌다 부딪히는 일은 부하가 이를 눌러 줄 때 줄어든다.`,
  panels: [
    {
      height: 130,
      x: { range: [20, 100], label: '부하 [%]' },
      y: { range: [0, 1.1], label: 'GMF [g]' },
      series: [
        { x: LOADS.map((l) => l * 100), y: V.load.map((v) => v.healthy.gmf), color: 'c1', width: 2, label: '건전' },
        { x: LOADS.map((l) => l * 100), y: V.load.map((v) => v.backlash.gmf), color: 'c2', width: 2, dash: true, label: '백래시 과다' },
      ],
    },
    {
      height: 130,
      x: { range: [20, 100], label: '부하 [%]' },
      y: { range: [0, 0.18], label: '공진 대역 RMS [g]' },
      series: [
        { x: LOADS.map((l) => l * 100), y: V.load.map((v) => v.healthy.resRms), color: 'c1', width: 2, label: '건전' },
        { x: LOADS.map((l) => l * 100), y: V.load.map((v) => v.backlash.resRms), color: 'c2', width: 2, label: '백래시 과다' },
      ],
    },
  ],
};

// ── 그림 7: TSA Residual — 어느 축의 몇 번 이빨인가 ──
const tsaPanel = (t: ReturnType<typeof gearTsa>, title: string, z: number, mark: boolean): FigPanel => ({
  title,
  height: 130,
  x: { range: [0, 360], label: '그 축의 각도 [°] (키페이저 = 0°)', ticks: [0, 60, 120, 180, 240, 300, 360] },
  y: { range: [-2.8, 2.8], label: 'Residual [g]' },
  series: [{ x: t.angle, y: t.residual, color: z === D.z2 ? 'c1' : 'c2', width: 1 }],
  annotations: mark ? [{ type: 'vline', x: t.defectAngle, color: 'warn', dash: true, label: `${D.gearTooth + 1}번 이빨` }] : [],
});
export const tsaResidual: FigureSpec = {
  id: 'fig-p7-6-7',
  caption: `그림 7. 기어 ${D.gearTooth + 1}번 이빨이 깨진 감속기를 축마다 TSA한 뒤 Residual(맞물림 하모닉과 1X·2X를 뺀 것)을 본다. 위: 기어 축 기준 ${TSA_REVS.gear}바퀴 평균 — ${fmt(V.tsa.brokenG.gear.peakAngle, 3)}°(${V.tsa.brokenG.gear.peakTooth}번 이빨 자리)에 충격 하나가 선다 (FM4 = ${fmt(V.tsa.brokenG.gear.fm4, 2)}). 아래: 피니언 축 기준 ${TSA_REVS.pinion}바퀴 평균 — 기어의 충격은 피니언 각도로는 매번 다른 자리에 와서 평균에서 사라진다 (FM4 = ${fmt(V.tsa.brokenG.pinion.fm4, 2)}, 건전한 감속기를 같은 방법으로 보면 ${fmt(V.tsa.healthy.pinion.fm4, 2)}).`,
  panels: [
    tsaPanel(V.tsa.brokenG.gear, `기어 축 TSA (${TSA_REVS.gear}바퀴) → Residual`, D.z2, true),
    tsaPanel(V.tsa.brokenG.pinion, `피니언 축 TSA (${TSA_REVS.pinion}바퀴) → Residual`, D.z1, false),
  ],
};

// ── 그림 8: 켑스트럼 — 측대역 무리의 간격 ──
const cepPanel = (o: GearOptions, title: string): FigPanel => {
  const c = gearCepstrum(o);
  const x: number[] = [];
  const y: number[] = [];
  for (let q = 0; q < c.quefrency.length && c.quefrency[q] <= 0.25; q++) {
    if (c.quefrency[q] < 0.005) continue;
    x.push(c.quefrency[q] * 1000);
    y.push(c.c[q]);
  }
  return {
    title,
    height: 130,
    x: { range: [5, 250], label: 'quefrency [ms]' },
    y: { range: [-0.03, 0.2], label: 'c(τ)' },
    series: [{ x, y, color: 'c1', width: 1 }],
    annotations: [
      ...[1, 2, 3, 4, 5, 6].map((k): FigAnnotation => ({ type: 'vline', x: (1000 * k) / P.f1, color: 'c2', dash: true, label: k === 1 ? '1/f₁' : undefined })),
      ...[1, 2].map((k): FigAnnotation => ({ type: 'vline', x: (1000 * k) / P.f2, color: 'c3', dash: true, label: k === 1 ? '1/f₂' : undefined })),
    ],
  };
};
export const gearCepstrumFig: FigureSpec = {
  id: 'fig-p7-6-8',
  caption: `그림 8. 켑스트럼 (5 ~ 250 ms). 주황 점선은 피니언 한 바퀴(1/f₁ = ${fmt(1000 / P.f1, 4)} ms)의 정수배, 초록 점선은 기어 한 바퀴(1/f₂ = ${fmt(1000 / P.f2, 4)} ms)의 정수배다. 위: 피니언 이빨이 깨지면 1/f₁ 자리에 ${fmt(V.cep.brokenP.p, 2)} (건전 ${fmt(V.cep.healthy.p, 2)}). 아래: 기어 이빨이 깨지면 1/f₂ 자리에 ${fmt(V.cep.brokenG.g, 2)} (건전 ${fmt(V.cep.healthy.g, 2)}). 측대역 무리 전체의 간격이 봉우리 하나로 모인다 (P5-7).`,
  panels: [cepPanel(BROKEN_P, '깨진 이 (피니언 6번)'), cepPanel(BROKEN_G, '깨진 이 (기어 18번)')],
};
