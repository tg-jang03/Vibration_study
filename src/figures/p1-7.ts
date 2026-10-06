/**
 * P1-7 "변조 · 측대역 · 맥놀이" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호는 랩(LAB-MOD-01)과 같은 `src/lib/modulationDemo.ts`·`signal.ts`의 'modulated' 성분을 쓴다.
 * 진폭은 mm/s Peak로 표시한다 (계산은 m/s, D-012).
 */
import { grid, type FigAnnotation, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { beatEnvelope, besselJ, modulationLines } from '../lib/dsp/modulation';
import { evaluateRange, type SignalComponent } from '../lib/dsp/signal';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';
import { BEAT_EXAMPLE, GEAR_EXAMPLE, MOD_AMP, MOD_FS, modSpectrum, peakNear, relDb } from '../lib/modulationDemo';

const MM = 1000;
const T_SPEC = 8; // 스펙트럼 측정 시간 8 s → Δf = 0.125 Hz
const am = (carrier: number, modFreq: number, m: number, extra: Partial<SignalComponent> = {}): SignalComponent =>
  ({ type: 'modulated', carrier, amp: MOD_AMP, modFreq, am: m, ...extra }) as SignalComponent;
const fm = (carrier: number, modFreq: number, beta: number): SignalComponent => ({ type: 'modulated', carrier, amp: MOD_AMP, modFreq, fm: beta });
const wave = (c: SignalComponent[], t1: number, points = 3000) => {
  const r = evaluateRange({ components: c }, 0, t1, points);
  return { t: Array.from(r.t), x: Array.from(r.x, (v) => v * MM) };
};
const view = (s: ReturnType<typeof modSpectrum>, f0: number, f1: number) => {
  const a = Math.round(f0 / s.df);
  const b = Math.round(f1 / s.df);
  return { x: Array.from(s.frequency.slice(a, b + 1)), y: Array.from(s.amplitude.slice(a, b + 1)) };
};
const fmt = (v: number) => formatNumber(v, 2);

// 그림 1 — 크기가 오르내리는 진동 (AM)
const FC = 100;
const FMOD = 5;
const M = 0.5;
const plain = wave([am(FC, FMOD, 0)], 0.4);
const amw = wave([am(FC, FMOD, M)], 0.4);
const envT = grid(0, 0.4, 200);
const envUp = envT.map((t) => (1 + M * Math.cos(2 * Math.PI * FMOD * t)));
export const amWave: FigureSpec = {
  id: 'fig-p1-7-1',
  caption: `그림 1. 위: ${FC} Hz 정현파(크기 1 mm/s Peak). 아래: 같은 정현파의 크기를 1초에 ${FMOD}번 오르내리게 한 진동 — 크기가 ${1 - M}에서 ${1 + M} mm/s 사이를 오간다 (회색 점선 = 포락선, 꼭대기를 이은 선). 빠르게 떠는 ${FC} Hz는 그대로이고, 그 크기가 ${FMOD} Hz로 천천히 바뀐다. 이렇게 크기가 주기적으로 변하는 것을 진폭 변조(AM)라고 한다.`,
  panels: [
    {
      title: `${FC} Hz 정현파 (변조 없음)`,
      series: [{ x: plain.t, y: plain.x, color: 'c1', width: 1.1 }],
      x: { range: [0, 0.4], ticks: 'none' },
      y: { range: [-1.7, 1.7], ticks: [-1, 0, 1] },
      height: 90,
    },
    {
      title: `크기를 ${FMOD} Hz로 오르내리게 함 (m = ${M})`,
      series: [
        { x: amw.t, y: amw.x, color: 'c1', width: 1.1 },
        { x: envT, y: envUp, color: 'muted', dash: true, width: 1.6 },
        { x: envT, y: envUp.map((v) => -v), color: 'muted', dash: true, width: 1.6 },
      ],
      annotations: [{ type: 'arrow', x1: 0.2, y1: 1.75, x2: 0.4, y2: 1.75, label: `한 번 오르내리는 데 1/${FMOD} = ${1 / FMOD} s`, color: 'warn', double: true, labelDy: -10 }],
      x: { range: [0, 0.4], ticks: [0, 0.1, 0.2, 0.3, 0.4], label: '시간 [s]' },
      y: { range: [-1.7, 2.25], ticks: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5], label: '[mm/s]' },
      height: 165,
    },
  ],
};

// 그림 2 — AM의 스펙트럼: 반송파 + 양옆 측대역
const amSpec = modSpectrum([am(FC, FMOD, M)], T_SPEC);
const amV = view(amSpec, 85, 115);
const amSide = peakNear(amSpec, FC + FMOD);
export const amSpectrum: FigureSpec = {
  id: 'fig-p1-7-2',
  caption: `그림 2. 그림 1 아래 진동의 스펙트럼 (측정 ${T_SPEC} s, Hann). 막대는 셋이다 — 가운데 ${FC} Hz(반송파) ${fmt(peakNear(amSpec, FC))} mm/s, 양옆 ${FC - FMOD} Hz와 ${FC + FMOD} Hz(측대역) 각 ${fmt(amSide)} mm/s. 측대역은 반송파에서 변조 주파수(${FMOD} Hz)만큼 떨어져 있고, 높이는 m/2 = ${M / 2}배(${formatNumber(relDb(amSide, peakNear(amSpec, FC)), 3)} dB)다. ${FMOD} Hz 자리에는 아무것도 없다.`,
  panels: [
    {
      series: [{ x: amV.x, y: amV.y, color: 'c1', width: 1.6 }],
      annotations: [
        { type: 'text', x: FC, y: 1.08, text: `반송파 ${fmt(peakNear(amSpec, FC))}`, anchor: 'middle', bold: true, color: 'c1' },
        { type: 'text', x: FC - FMOD, y: amSide + 0.08, text: `측대역 ${fmt(amSide)}`, anchor: 'middle', color: 'warn', bold: true },
        { type: 'text', x: FC + FMOD, y: amSide + 0.08, text: `측대역 ${fmt(amSide)}`, anchor: 'middle', color: 'warn', bold: true },
        { type: 'arrow', x1: FC, y1: 0.6, x2: FC + FMOD, y2: 0.6, label: `간격 ${FMOD} Hz = 변조 주파수`, color: 'muted', double: true, labelDy: -10 },
      ],
      x: { range: [85, 115], ticks: [85, 90, 95, 100, 105, 110, 115], label: '주파수 [Hz]' },
      y: { range: [0, 1.2], ticks: [0, 0.25, 0.5, 0.75, 1], label: '[mm/s Peak]' },
      height: 190,
    },
  ],
};

// 그림 3 — 측대역 간격이 원인을 가리킨다 (기어 맞물림 300 Hz)
const G = GEAR_EXAMPLE;
const gearA = modSpectrum([am(G.mesh, G.shaftA, G.m)], T_SPEC);
const gearB = modSpectrum([am(G.mesh, G.shaftB, G.m)], T_SPEC);
const gearPanel = (s: typeof gearA, fm: number, title: string, last: boolean): FigPanel => {
  const v = view(s, 265, 335);
  return {
    title,
    series: [{ x: v.x, y: v.y, color: last ? 'c3' : 'c1', width: 1.6 }],
    annotations: [
      { type: 'arrow', x1: G.mesh, y1: 0.4, x2: G.mesh + fm, y2: 0.4, label: `${fm} Hz`, color: 'warn', double: true, labelDy: -10 },
      { type: 'arrow', x1: G.mesh - fm, y1: 0.4, x2: G.mesh, y2: 0.4, label: `${fm} Hz`, color: 'warn', double: true, labelDy: -10 },
    ],
    x: last ? { range: [265, 335], ticks: [270, 280, 287.5, 300, 312.5, 320, 330], label: '주파수 [Hz]' } : { range: [265, 335], ticks: [270, 280, 287.5, 300, 312.5, 320, 330] },
    y: { range: [0, 1.15], ticks: [0, 0.5, 1], label: last ? '[mm/s Peak]' : undefined },
    height: last ? 135 : 118,
  };
};
export const spacingTellsCause: FigureSpec = {
  id: 'fig-p1-7-3',
  caption: `그림 3. 기어 상자에서 맞물림 주파수(P1-5) ${G.mesh} Hz의 크기가 오르내리는 두 경우. 위: 20 Hz로 도는 축 A가 원인 — 측대역이 ${G.mesh - G.shaftA}·${G.mesh + G.shaftA} Hz, 간격 ${G.shaftA} Hz. 아래: 12.5 Hz로 도는 축 B가 원인 — 측대역이 ${G.mesh - G.shaftB}·${G.mesh + G.shaftB} Hz, 간격 ${G.shaftB} Hz. 반송파는 같아도 측대역 간격이 다르다. 간격을 재면 크기를 흔드는 것이 어느 축인지 알 수 있다.`,
  panels: [gearPanel(gearA, G.shaftA, '축 A(20 Hz)가 한 바퀴에 한 번씩 맞물림을 세게 함', false), gearPanel(gearB, G.shaftB, '축 B(12.5 Hz)가 한 바퀴에 한 번씩 맞물림을 세게 함', true)],
};

// 그림 4 — 짧게 커지는 변조: 측대역이 여러 쌍, 간격은 그대로
const PULSE_RATE = G.shaftA;
const SIG = 0.004; // 포락선 펄스 폭 [s]
const pulseEnv = (t: number) => {
  let p = 0;
  const k0 = Math.round(t * PULSE_RATE);
  for (let k = k0 - 2; k <= k0 + 2; k++) p += Math.exp(-((t - k / PULSE_RATE) ** 2) / (2 * SIG * SIG));
  return 0.5 + p;
};
const pulseN = MOD_FS * T_SPEC;
const pulseX = Float64Array.from({ length: pulseN }, (_, i) => {
  const t = i / MOD_FS;
  return MOD_AMP * pulseEnv(t) * Math.cos(2 * Math.PI * G.mesh * t);
});
const pulseSpecRaw = singleSidedSpectrum({ fs: MOD_FS, x: pulseX }, { window: 'hann' });
const pulseSpec = { frequency: pulseSpecRaw.frequency, amplitude: pulseSpecRaw.amplitude.map((a) => a * MM), df: pulseSpecRaw.binSpacing };
const pulseView = view(pulseSpec, 180, 420);
const pulseWaveT = grid(0, 0.15, 3000);
const pulseWave = pulseWaveT.map((t) => pulseEnv(t) * Math.cos(2 * Math.PI * G.mesh * t));
const pulsePairs = [1, 2, 3, 4, 5].filter((n) => peakNear(pulseSpec, G.mesh + n * PULSE_RATE) > 0.02 * peakNear(pulseSpec, G.mesh)).length;
export const pulseModulation: FigureSpec = {
  id: 'fig-p1-7-4',
  caption: `그림 4. 맞물림 ${G.mesh} Hz가 한 바퀴(1/${PULSE_RATE} s)에 한 번 짧게 커지는 경우 — 예를 들어 이빨 하나가 상했을 때. 위: 파형과 포락선. 아래: 스펙트럼. 크기의 변화가 정현파 모양이 아니라 짧은 펄스 모양이면 측대역이 한 쌍이 아니라 여러 쌍(여기서 눈에 띄는 것만 ±${pulsePairs}쌍) 생긴다. 그래도 간격은 모두 ${PULSE_RATE} Hz — 원인 축의 회전 주파수 — 로 같다.`,
  panels: [
    {
      title: '파형 (회색 점선 = 포락선)',
      series: [
        { x: pulseWaveT, y: pulseWave, color: 'c1', width: 0.9 },
        { x: pulseWaveT, y: pulseWaveT.map(pulseEnv), color: 'muted', dash: true, width: 1.4 },
      ],
      x: { range: [0, 0.15], ticks: [0, 0.05, 0.1, 0.15], label: '시간 [s]' },
      y: { range: [-1.7, 1.7], ticks: [-1, 0, 1], label: '[mm/s]' },
      height: 130,
    },
    {
      title: '스펙트럼',
      series: [{ x: pulseView.x, y: pulseView.y, color: 'c1', width: 1.4 }],
      annotations: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((n): FigAnnotation => ({ type: 'vline', x: G.mesh + n * PULSE_RATE, color: 'muted', dash: true })),
      x: { range: [180, 420], ticks: [200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400], label: '주파수 [Hz]' },
      y: { range: [0, 0.75], ticks: [0, 0.25, 0.5, 0.75], label: '[mm/s Peak]' },
      height: 160,
    },
  ],
};

// 그림 5 — 주파수가 흔들리는 진동 (FM)
const BETA = 2;
const FC5 = 40; // 흔들림(±10 Hz)이 반송파의 25 %라 물결 간격 변화가 눈에 보이도록
const fmw = wave([fm(FC5, FMOD, BETA)], 0.4);
const instT = grid(0, 0.4, 200);
const instF = instT.map((t) => FC5 + BETA * FMOD * Math.cos(2 * Math.PI * FMOD * t));
export const fmWave: FigureSpec = {
  id: 'fig-p1-7-5',
  caption: `그림 5. 위: ${FC5} Hz 정현파의 주파수를 1초에 ${FMOD}번 흔든 진동(FM). 크기는 늘 1 mm/s로 일정하지만, 물결 간격이 촘촘해졌다 넓어졌다를 되풀이한다. 아래: 그 순간의 주파수 — ${FC5 - BETA * FMOD} Hz와 ${FC5 + BETA * FMOD} Hz 사이를 오간다. 최대 흔들림 ${BETA * FMOD} Hz를 변조 주파수 ${FMOD} Hz로 나눈 β = ${BETA}가 FM 변조 지수다.`,
  panels: [
    {
      title: `주파수를 ${FMOD} Hz로 흔듦 (β = ${BETA})`,
      series: [{ x: fmw.t, y: fmw.x, color: 'c1', width: 1.1 }],
      x: { range: [0, 0.4], ticks: 'none' },
      y: { range: [-1.4, 1.4], ticks: [-1, 0, 1], label: '[mm/s]' },
      height: 120,
    },
    {
      title: '그 순간의 주파수',
      series: [{ x: instT, y: instF, color: 'c3', width: 2.2 }],
      annotations: [{ type: 'hline', y: FC5, color: 'muted', dash: true, label: `${FC5} Hz`, labelAt: 'end' }],
      x: { range: [0, 0.4], ticks: [0, 0.1, 0.2, 0.3, 0.4], label: '시간 [s]' },
      y: { range: [FC5 - 14, FC5 + 14], ticks: [FC5 - 10, FC5, FC5 + 10], label: '[Hz]' },
      height: 120,
    },
  ],
};

// 그림 6 — FM 스펙트럼: β가 커지면 측대역이 늘어난다
const BETAS = [0.5, 1, 2.4, 5];
const fmSpecs = BETAS.map((b) => modSpectrum([fm(FC, FMOD, b)], T_SPEC));
export const fmSpectra: FigureSpec = {
  id: 'fig-p1-7-6',
  caption: `그림 6. ${FC} Hz 반송파의 주파수를 ${FMOD} Hz로 흔든 FM 진동을 β만 바꿔 가며 스펙트럼으로 봤다. 측대역이 ${FMOD} Hz 간격으로 여러 쌍 서고, 높이는 베셀 함수 Jₙ(β)를 따른다. β = 1이면 반송파 ${fmt(Math.abs(besselJ(0, 1)))}, 첫째 측대역 ${fmt(besselJ(1, 1))}, 둘째 ${fmt(besselJ(2, 1))}. β가 커질수록 의미 있는 측대역이 대략 β + 1쌍으로 늘어나고, β = 2.4 근처에서는 반송파가 거의 사라진다(${formatNumber(Math.abs(besselJ(0, 2.4)), 1)}). 크기는 그대로이고 주파수만 흔들려도, 스펙트럼에는 반송파 하나가 아니라 넓게 퍼진 막대들이 보인다.`,
  panels: fmSpecs.map((s, i): FigPanel => {
    const v = view(s, 70, 130);
    const last = i === fmSpecs.length - 1;
    return {
      title: `β = ${BETAS[i]}`,
      series: [{ x: v.x, y: v.y, color: 'c3', width: 1.4 }],
      x: last ? { range: [70, 130], ticks: [70, 80, 90, 100, 110, 120, 130], label: '주파수 [Hz]' } : { range: [70, 130], ticks: 'none' },
      y: { range: [0, 1.05], ticks: [0, 0.5, 1], label: last ? '[mm/s Peak]' : undefined },
      height: last ? 105 : 85,
    };
  }),
};

// 그림 7 — AM과 FM이 함께: 측대역이 비대칭
const AMFM = { m: 0.4, beta: 0.6 };
const asymCases = [
  { title: `AM만 (m = ${AMFM.m})`, c: [am(FC, FMOD, AMFM.m)], color: 'c1' as const },
  { title: `FM만 (β = ${AMFM.beta})`, c: [fm(FC, FMOD, AMFM.beta)], color: 'c3' as const },
  { title: '둘 다, 크기가 클 때 주파수도 높음 (위상차 0°)', c: [{ type: 'modulated', carrier: FC, amp: MOD_AMP, modFreq: FMOD, am: AMFM.m, fm: AMFM.beta, amPhase: 0 } as SignalComponent], color: 'c4' as const },
];
const asymSpecs = asymCases.map((k) => modSpectrum(k.c, T_SPEC));
const both = asymSpecs[2];
const lowerBoth = peakNear(both, FC - FMOD);
const upperBoth = peakNear(both, FC + FMOD);
const theoryBoth = modulationLines(AMFM.m, AMFM.beta, 0, 3);
export const amfmAsymmetry: FigureSpec = {
  id: 'fig-p1-7-7',
  caption: `그림 7. 같은 ${FMOD} Hz로 크기와 주파수가 함께 흔들리면? 위·가운데: AM만, FM만이면 측대역이 양쪽 같은 높이다 (AM ${fmt(peakNear(asymSpecs[0], FC + FMOD))}, FM ${fmt(peakNear(asymSpecs[1], FC + FMOD))}). 아래: 둘이 함께, 크기가 가장 클 때 주파수도 가장 높으면 위쪽 측대역 ${fmt(upperBoth)}, 아래쪽 ${fmt(lowerBoth)}로 한쪽이 커진다 (이론 ${fmt(theoryBoth.find((l) => l.n === 1)!.ratio)}·${fmt(theoryBoth.find((l) => l.n === -1)!.ratio)}). 측대역의 좌우 높이가 다르면 AM과 FM이 함께 있다는 표시다. 간격은 여전히 ${FMOD} Hz다.`,
  panels: asymSpecs.map((s, i): FigPanel => {
    const v = view(s, 85, 115);
    const last = i === asymSpecs.length - 1;
    return {
      title: asymCases[i].title,
      series: [{ x: v.x, y: v.y, color: asymCases[i].color, width: 1.6 }],
      x: last ? { range: [85, 115], ticks: [85, 90, 95, 100, 105, 110, 115], label: '주파수 [Hz]' } : { range: [85, 115], ticks: 'none' },
      y: { range: [0, 1.05], ticks: [0, 0.5, 1], label: last ? '[mm/s Peak]' : undefined },
      height: last ? 110 : 90,
    };
  }),
};

// 그림 8 — 맥놀이: 가까운 두 주파수
const B = BEAT_EXAMPLE;
const beatC: SignalComponent[] = [
  { type: 'sine', freq: B.f1, amp: B.a1 * MOD_AMP },
  { type: 'sine', freq: B.f2, amp: B.a2 * MOD_AMP },
];
const beatW = wave(beatC, 6, 6000);
const beatEnvT = grid(0, 6, 300);
const beatEnv = beatEnvT.map((t) => beatEnvelope(B.a1, B.a2, B.f1, B.f2, t));
const beatSpec = modSpectrum(beatC, T_SPEC);
const beatV = view(beatSpec, 27, 33);
const beatPeriod = 1 / Math.abs(B.f1 - B.f2);
export const beatWave: FigureSpec = {
  id: 'fig-p1-7-8',
  caption: `그림 8. 이웃한 두 기계 — ${B.f1} Hz(${B.f1 * 60} rpm, 크기 ${B.a1})와 ${B.f2} Hz(${B.f2 * 60} rpm, 크기 ${B.a2}) — 의 진동이 한 센서에 함께 들어온 경우. 위: 크기가 ${beatPeriod} s마다 한 번 ${B.a1 + B.a2}까지 커졌다 ${formatNumber(Math.abs(B.a1 - B.a2), 2)}까지 작아진다 (맥놀이, P1-3). 아래: 스펙트럼에는 막대가 둘뿐이다 — AM(그림 2)처럼 가운데 반송파와 대칭인 측대역 셋이 아니다. 둘을 가르려면 1/${formatNumber(Math.abs(B.f1 - B.f2), 2)} Hz = ${beatPeriod} s보다 훨씬 길게 재야 한다 (여기서는 ${T_SPEC} s).`,
  panels: [
    {
      title: '파형 (회색 점선 = 포락선)',
      series: [
        { x: beatW.t, y: beatW.x, color: 'c1', width: 0.6 },
        { x: beatEnvT, y: beatEnv, color: 'muted', dash: true, width: 1.6 },
        { x: beatEnvT, y: beatEnv.map((v) => -v), color: 'muted', dash: true, width: 1.6 },
      ],
      annotations: [{ type: 'arrow', x1: 0, y1: 1.85, x2: beatPeriod, y2: 1.85, label: `${beatPeriod} s = 1 / ${formatNumber(Math.abs(B.f1 - B.f2), 2)} Hz`, color: 'warn', double: true, labelDy: -10 }],
      x: { range: [0, 6], ticks: [0, 1, 2, 3, 4, 5, 6], label: '시간 [s]' },
      y: { range: [-2.1, 2.3], ticks: [-1.6, -0.4, 0, 0.4, 1.6], label: '[mm/s]' },
      height: 160,
    },
    {
      title: `스펙트럼 (측정 ${T_SPEC} s)`,
      series: [{ x: beatV.x, y: beatV.y, color: 'c1', width: 1.6 }],
      annotations: [
        { type: 'text', x: B.f1 + 0.15, y: peakNear(beatSpec, B.f1), text: `${B.f1} Hz: ${fmt(peakNear(beatSpec, B.f1))}`, anchor: 'start', bold: true },
        { type: 'text', x: B.f2 - 0.15, y: peakNear(beatSpec, B.f2), text: `${B.f2} Hz: ${fmt(peakNear(beatSpec, B.f2))}`, anchor: 'end', bold: true },
      ],
      x: { range: [27, 33], ticks: [27, 28, 29, 29.5, 30, 31, 32, 33], label: '주파수 [Hz]' },
      y: { range: [0, 1.2], ticks: [0, 0.5, 1], label: '[mm/s Peak]' },
      height: 150,
    },
  ],
};

/** 본문 숫자 확인용 (테스트에서 사용) */
export const P17_VALUES = {
  amCarrier: peakNear(amSpec, FC),
  amSide,
  amSideDb: relDb(amSide, peakNear(amSpec, FC)),
  gearALow: peakNear(gearA, G.mesh - G.shaftA),
  gearBLow: peakNear(gearB, G.mesh - G.shaftB),
  pulsePairs,
  fmBeta1: [0, 1, 2].map((n) => peakNear(fmSpecs[1], FC + n * FMOD)),
  fmCarrier24: peakNear(fmSpecs[2], FC),
  upperBoth,
  lowerBoth,
  beatA1: peakNear(beatSpec, B.f1),
  beatA2: peakNear(beatSpec, B.f2),
  beatPeriod,
};
