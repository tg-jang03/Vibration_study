/**
 * P5-5 "트래킹 · 노치 필터" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 런업 신호와 분석은 랩(LAB-FLT-02)과 같은 `lib/trackingDemo.ts`, 필터는 `lib/dsp/tracking.ts`.
 * 로터는 P4-1의 예시(`P41_EXAMPLE`), 위상은 지연각 관례(Contents §3).
 */
import { grid, squareYRange, type FigAnnotation, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { reconstructOrder, trackingDelay, trackingNoise, trackOrder } from '../lib/dsp/tracking';
import { analyzeTracking, DEFAULT_TRACK_PARAMS as D, lagForPlot, ROTOR, steadySignal, TRK, type TrackAnalysis } from '../lib/trackingDemo';
import { unbalanceVector } from '../lib/rotor/runup';

const fmt = formatNumber;
const um = 1e6;
const pp = (m: number) => m * 2e6;
const deg = (r: number) => (r * 180) / Math.PI;
const V36 = unbalanceVector(ROTOR, 3600);
const init36 = { re: V36.amp * Math.cos(V36.lag), im: -V36.amp * Math.sin(V36.lag) };
const NOTCH_PARAMS = { ...D, rate: 50, bandwidth: 2, noise: 1e-6, notch: true };
/** 위상은 1X가 이보다 작으면 그리지 않는다 (잡음에 묻혀 의미가 없다) [m Peak] */
export const PHASE_MIN = 1e-6;

const runB2 = analyzeTracking({ ...D, bandwidth: 2 });
const runB05 = analyzeTracking(D);
const downB05 = analyzeTracking({ ...D, direction: 'down' });
const zpB05 = analyzeTracking({ ...D, zeroPhase: true });
const zpB2 = analyzeTracking({ ...D, zeroPhase: true, bandwidth: 2 });
const notchRun = analyzeTracking(NOTCH_PARAMS);

// 그림 2 — 복조: 3600 rpm, 1X + 2X, B = 2 Hz (0에서 시작)
const demod = (() => {
  const s = steadySignal({ rpm: 3600, seconds: 2, amp: V36.amp, lag: V36.lag, a2: TRK.a2, fs: 4096 });
  const v = trackOrder(s.x, s.theta, { fs: s.fs, bandwidth: 2 });
  const rawRe = s.x.map((x, i) => 2 * x * Math.cos(s.theta[i]));
  const rawIm = s.x.map((x, i) => -2 * x * Math.sin(s.theta[i]));
  const k = s.x.length - 1;
  return { s, v, rawRe, rawIm, endRe: v.re[k], endIm: v.im[k] };
})();

// 그림 3 — 대역폭과 응답: 3600 rpm에서 t = 4 s에 1X 크기가 1.5배로, 잡음 σ = 5 µm
const STEP = { at: 4, seconds: 12, factor: 1.5, noise: D.noise, Bs: [5, 1, 0.2] as const };
const step = (() => {
  const noisy = steadySignal({ rpm: 3600, seconds: STEP.seconds, amp: V36.amp, lag: V36.lag, ampAfter: V36.amp * STEP.factor, tStep: STEP.at, a2: TRK.a2, noise: STEP.noise, seed: 21 });
  const clean = steadySignal({ rpm: 3600, seconds: STEP.seconds, amp: V36.amp, lag: V36.lag, ampAfter: V36.amp * STEP.factor, tStep: STEP.at, a2: TRK.a2 });
  return STEP.Bs.map((B) => {
    const v = trackOrder(noisy.x, noisy.theta, { fs: noisy.fs, bandwidth: B, initial: init36 });
    const c = trackOrder(clean.x, clean.theta, { fs: clean.fs, bandwidth: B, initial: init36 });
    const ampOf = (r: typeof v, i: number) => Math.hypot(r.re[i], r.im[i]);
    let t50 = Number.NaN;
    let t90 = Number.NaN;
    for (let i = STEP.at * noisy.fs; i < noisy.x.length; i++) {
      const frac = (ampOf(c, i) - V36.amp) / ((STEP.factor - 1) * V36.amp);
      if (Number.isNaN(t50) && frac >= 0.5) t50 = i / noisy.fs - STEP.at;
      if (frac >= 0.9) {
        t90 = i / noisy.fs - STEP.at;
        break;
      }
    }
    const t: number[] = [];
    const a: number[] = [];
    for (let i = 0; i < noisy.x.length; i += 4) {
      t.push(i / noisy.fs);
      a.push(pp(ampOf(v, i)));
    }
    return { B, t, a, t50, t90, delay: trackingDelay(B, noisy.fs), noise: trackingNoise(STEP.noise, B, noisy.fs) };
  });
})();

// 그림 6 — 3600 rpm에 머무는 동안의 파형: 1X + 2X + 0.45X + 잡음 1 µm, 노치 B = 2 Hz
const notchWave = (() => {
  const s = steadySignal({ rpm: 3600, seconds: 3, amp: V36.amp, lag: V36.lag, a2: TRK.a2, whirl: TRK.aWhirl, noise: NOTCH_PARAMS.noise, seed: 31, fs: 4096 });
  const v = trackOrder(s.x, s.theta, { fs: s.fs, bandwidth: NOTCH_PARAMS.bandwidth, initial: init36 });
  const rec = reconstructOrder(v, s.theta);
  const from = 2 * s.fs;
  const to = from + Math.round(0.4 * s.fs);
  const t = Array.from({ length: to - from }, (_, i) => i / s.fs);
  return {
    t,
    x: Array.from({ length: to - from }, (_, i) => s.x[from + i] * um),
    not1: Array.from({ length: to - from }, (_, i) => (s.x[from + i] - rec[from + i]) * um),
    truth: Array.from({ length: to - from }, (_, i) => (s.x[from + i] - s.oneX[from + i]) * um),
  };
})();
/** 3600 rpm에서 0.45X가 없을 때의 직접 RMS (1X·2X·잡음은 서로 다른 주파수라 제곱해 더한다) */
const directNoWhirl = Math.sqrt((V36.amp ** 2 + TRK.a2 ** 2) / 2 + NOTCH_PARAMS.noise ** 2);
const notOneXBefore = Math.sqrt(TRK.a2 ** 2 / 2 + NOTCH_PARAMS.noise ** 2);

// 그림 7 — 오빗: X(가로)·Y(세로) 3600 rpm. 1X는 Y가 90° 늦고 0.7배(정방향 타원), 0.45X는 정방향 원
const ORB = { fs: 4096, revs: 8, yRatio: 0.7, noise: 0.2e-6 };
const orbit = (() => {
  const common = { rpm: 3600, seconds: 3, a2: TRK.a2, whirl: TRK.aWhirl, noise: ORB.noise, fs: ORB.fs };
  const sx = steadySignal({ ...common, amp: V36.amp, lag: V36.lag, seed: 41 });
  const sy = steadySignal({ ...common, amp: ORB.yRatio * V36.amp, lag: V36.lag + Math.PI / 2, lag2: TRK.lag2 + Math.PI / 2, whirlPhase: TRK.whirlPhase - Math.PI / 2, seed: 42 });
  const iy = { re: ORB.yRatio * V36.amp * Math.cos(V36.lag + Math.PI / 2), im: -ORB.yRatio * V36.amp * Math.sin(V36.lag + Math.PI / 2) };
  const vx = trackOrder(sx.x, sx.theta, { fs: ORB.fs, bandwidth: 2, initial: init36 });
  const vy = trackOrder(sy.x, sy.theta, { fs: ORB.fs, bandwidth: 2, initial: iy });
  const fx = reconstructOrder(vx, sx.theta);
  const fy = reconstructOrder(vy, sy.theta);
  const from = 2 * ORB.fs;
  const len = Math.round((ORB.revs / 60) * ORB.fs);
  const pick = (a: ArrayLike<number>) => Array.from({ length: len + 1 }, (_, i) => a[from + i] * um);
  return { dx: pick(sx.x), dy: pick(sy.x), fx: pick(fx), fy: pick(fy) };
})();

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p5-5.test.ts`) */
export const P55_VALUES = {
  v36: V36,
  demodEnd: { re: demod.endRe, im: demod.endIm },
  step,
  runB2,
  runB05,
  downB05,
  zpB05,
  zpB2,
  notchRun,
  directNoWhirl,
  notOneXBefore,
  delayB05: trackingDelay(D.bandwidth, TRK.fs),
};
const V = P55_VALUES;

// ── 그림 1: 고정 필터 vs 트래킹 필터 ──
const rpmAxis = grid(TRK.rpmLo, TRK.rpmHi, 61);
const whirlRpm = grid(TRK.whirlFrom, TRK.rpmHi, 7);
const FIXED = { f: 27, half: 2 };
export const fixedVsTracking: FigureSpec = {
  id: 'fig-p5-5-1',
  caption: `그림 1. 런업(${TRK.rpmLo} → ${TRK.rpmHi} rpm) 동안 성분들의 주파수. 1X(파랑)·2X(보라)는 회전수를 따라 오르고, 0.45X(초록)는 ${TRK.whirlFrom} rpm부터 나타난다. 회색 띠는 ${FIXED.f} ± ${FIXED.half} Hz에 고정한 띠 통과 필터다 — 810 rpm 근처에서는 2X를, 1620 rpm 근처에서는 1X를, ${TRK.rpmHi} rpm에서는 0.45X를 통과시킨다. 같은 필터 출력이 회전수마다 다른 성분을 담는다. 주황 띠는 트래킹 필터로, 통과 띠의 가운데가 늘 1X에 있다 (폭은 보기 좋게 과장).`,
  panels: [
    {
      series: [
        { x: rpmAxis, y: rpmAxis.map((r) => r / 60), color: 'warn', width: 14, opacity: 0.25, label: '트래킹 필터 (1X를 따라 움직임)' },
        { x: rpmAxis, y: rpmAxis.map((r) => r / 60), color: 'c1', width: 2, label: '1X' },
        { x: rpmAxis, y: rpmAxis.map((r) => (2 * r) / 60), color: 'c4', width: 2, label: '2X' },
        { x: whirlRpm, y: whirlRpm.map((r) => (TRK.whirlRatio * r) / 60), color: 'c3', width: 2.4, label: '0.45X' },
      ],
      annotations: [
        { type: 'rect', x1: TRK.rpmLo, x2: TRK.rpmHi, y1: FIXED.f - FIXED.half, y2: FIXED.f + FIXED.half, color: 'muted' },
        { type: 'text', x: 2350, y: FIXED.f - 9, text: `고정 띠 통과 ${FIXED.f} ± ${FIXED.half} Hz`, anchor: 'middle', color: 'muted' },
        { type: 'point', x: (FIXED.f * 60) / 2, y: FIXED.f, color: 'c4' },
        { type: 'point', x: FIXED.f * 60, y: FIXED.f, color: 'c1' },
        { type: 'point', x: TRK.rpmHi, y: (TRK.whirlRatio * TRK.rpmHi) / 60, color: 'c3' },
      ],
      x: { range: [TRK.rpmLo, TRK.rpmHi], ticks: [600, 1200, 1800, 2400, 3000, 3600], label: '회전수 [rpm]' },
      y: { range: [0, 125], ticks: [0, 25, 50, 75, 100, 125], label: '주파수 [Hz]' },
      height: 210,
    },
  ],
};

// ── 그림 2: 돌려 세우고 평균한다 ──
const tDemo = Array.from(demod.s.t);
const thin = <T>(a: ArrayLike<T>) => Array.from(a).filter((_, i) => i % 3 === 0);
const sub = <T extends ArrayLike<number>>(a: T, tMax: number) => Array.from(a).filter((_, i) => tDemo[i] <= tMax);
export const demodulation: FigureSpec = {
  id: 'fig-p5-5-2',
  caption: `그림 2. 트래킹 필터의 계산 (3600 rpm, 1X ${fmt(pp(V36.amp), 3)} µm pp∠${fmt(deg(V36.lag), 4)}° + 2X ${fmt(pp(TRK.a2), 2)} µm pp). 위: 측정 파형. 가운데·아래: 파형에 2cos θ와 −2sin θ를 곱한 값(옅은 선)은 빠르게 출렁이지만, 그 가운데는 일정하다. 저역 통과(B = 2 Hz, 진한 선)를 지나면 출렁임이 사라지고 실수부 ${fmt(demod.endRe * um, 3)} µm, 허수부 ${fmt(demod.endIm * um, 3)} µm에 자리 잡는다 — 이 두 숫자가 1X의 크기와 위상이다.`,
  panels: [
    {
      title: '① 측정 파형 x(t) (0.1초 = 6바퀴)',
      series: [{ x: sub(demod.s.t, 0.1), y: sub(demod.s.x, 0.1).map((v) => v * um), color: 'text', width: 1.4 }],
      x: { range: [0, 0.1], label: '시각 [s]' },
      y: { range: [-25, 25], ticks: [-20, 0, 20], label: '[µm]' },
      height: 100,
    },
    {
      title: '② 실수부: 2x cos θ → 저역 통과',
      series: [
        { x: thin(tDemo), y: thin(demod.rawRe).map((v) => v * um), color: 'c1', width: 0.8, opacity: 0.3 },
        { x: thin(tDemo), y: thin(demod.v.re).map((v) => v * um), color: 'c1', width: 2.4 },
      ],
      annotations: [{ type: 'hline', y: init36.re * um, color: 'muted', dash: true, label: `A cos φ = ${fmt(init36.re * um, 3)}`, labelAt: 'end' }],
      x: { range: [0, 2], label: '시각 [s]' },
      y: { range: [-50, 30], ticks: [-40, -20, 0, 20], label: '[µm]' },
      height: 130,
    },
    {
      title: '③ 허수부: −2x sin θ → 저역 통과',
      series: [
        { x: thin(tDemo), y: thin(demod.rawIm).map((v) => v * um), color: 'c2', width: 0.8, opacity: 0.3 },
        { x: thin(tDemo), y: thin(demod.v.im).map((v) => v * um), color: 'c2', width: 2.4 },
      ],
      annotations: [{ type: 'hline', y: init36.im * um, color: 'muted', dash: true, label: `−A sin φ = ${fmt(init36.im * um, 3)}`, labelAt: 'end' }],
      x: { range: [0, 2], label: '시각 [s]' },
      y: { range: [-40, 30], ticks: [-40, -20, 0, 20], label: '[µm]' },
      height: 130,
    },
  ],
};

// ── 그림 3: 대역폭 — 잡음과 응답 속도 ──
const STEP_COLORS: FigColor[] = ['c1', 'c3', 'c4'];
export const bandwidthStep: FigureSpec = {
  id: 'fig-p5-5-3',
  caption: `그림 3. 3600 rpm에서 t = ${STEP.at} s에 1X가 ${fmt(pp(V36.amp), 3)} → ${fmt(pp(V36.amp * STEP.factor), 3)} µm pp로 바뀐다(회색 점선). 넓은 대역 잡음 σ = ${fmt(STEP.noise * um, 2)} µm가 섞여 있다. 같은 신호를 폭이 다른 트래킹 필터 셋으로 읽었다. B = ${STEP.Bs[0]} Hz는 ${fmt(step[0].t50, 2)} s 만에 변화의 절반을 따라잡지만 크기가 ±${fmt(pp(step[0].noise), 3)} µm pp(표준편차, 이론값)쯤 흔들린다. B = ${STEP.Bs[2]} Hz는 흔들림이 ${fmt(pp(step[2].noise), 2)} µm pp로 작지만 절반에 ${fmt(step[2].t50, 3)} s, 90 %에 ${fmt(step[2].t90, 2)} s가 걸린다.`,
  panels: step.map((s, k) => ({
    title: `B = ${s.B} Hz — 지연 τ_g ${fmt(s.delay, 3)} s, 잡음 흔들림(이론) ${fmt(pp(s.noise), 3)} µm pp`,
    series: [
      { x: [0, STEP.at, STEP.at, STEP.seconds], y: [pp(V36.amp), pp(V36.amp), pp(V36.amp * STEP.factor), pp(V36.amp * STEP.factor)], color: 'muted', dash: true, width: 1.6 },
      { x: s.t, y: s.a, color: STEP_COLORS[k], width: 1.6 },
    ] as FigSeries[],
    annotations: [{ type: 'vline', x: STEP.at, color: 'muted' }] as FigAnnotation[],
    x: { range: [0, STEP.seconds] as [number, number], ...(k === step.length - 1 ? { label: '시각 [s]' } : {}) },
    y: { range: [24, 54] as [number, number], ticks: [30, 40, 50], label: '[µm pp]' },
    height: 105,
  })),
};

// ── 그림 4·5: 런업 Bode ──
const RPM_ZOOM: [number, number] = [2000, 3600];
const ampLine = (a: TrackAnalysis, color: FigColor, label: string): FigSeries => ({ x: a.rpm, y: a.amp.map(pp), color, width: 2, label });
/** 위상: 확대 구간 안에서 1X가 PHASE_MIN 이상인 점만 (그림은 선을 끊지 않으므로 걸러 낸다) */
const lagLine = (a: TrackAnalysis, color: FigColor, label?: string): FigSeries => {
  const keep = a.rpm.map((r, i) => r >= RPM_ZOOM[0] && r <= RPM_ZOOM[1] && a.amp[i] >= PHASE_MIN);
  return { x: a.rpm.filter((_, i) => keep[i]), y: a.lag.filter((_, i) => keep[i]).map((l) => deg(lagForPlot(l))), color, width: 2, label };
};
const truthAmp = (a: TrackAnalysis): FigSeries => ({ x: a.rpm, y: a.trueAmp.map(pp), color: 'muted', dash: true, width: 1.6, label: '참값 (그 회전수의 정상 응답)' });
const truthLag = (a: TrackAnalysis): FigSeries => ({ x: a.rpm, y: a.trueLag.map((l) => deg(lagForPlot(l))), color: 'muted', dash: true, width: 1.6 });
const peakMark = (a: TrackAnalysis, color: FigColor, dx = 8, dy = -10): FigAnnotation => ({ type: 'point', x: a.peakRpm, y: pp(a.peakAmp), color, label: `${fmt(a.peakRpm, 4)} rpm`, dx, dy });

export const runupBode: FigureSpec = {
  id: 'fig-p5-5-4',
  caption: `그림 4. P4-1의 예시 로터를 ${D.rate} rpm/s로 올리며(잡음 σ = ${fmt(D.noise * um, 2)} µm) 실시간 트래킹 필터로 그린 Bode. 회색 점선은 각 회전수의 참 응답(봉우리 ${fmt(V.runB05.truePeakRpm, 4)} rpm, ${fmt(pp(V.runB05.truePeakAmp), 4)} µm pp). B = 2 Hz(파랑)는 봉우리 ${fmt(V.runB2.peakRpm, 4)} rpm·${fmt(pp(V.runB2.peakAmp), 3)} µm pp로 거의 맞는다. B = 0.5 Hz(주황)는 봉우리가 ${fmt(V.runB05.peakRpm, 4)} rpm으로 밀리고 ${fmt(pp(V.runB05.peakAmp), 3)} µm pp로 낮아지며, 위상 90°도 ${fmt(V.runB05.phase90Rpm, 4)} rpm으로 밀린다. 지연 ${fmt(V.delayB05, 2)} s 동안 회전수가 ${fmt(V.runB05.shiftRpm, 3)} rpm 올라가기 때문이다.`,
  panels: [
    {
      title: '1X 크기',
      series: [truthAmp(V.runB05), ampLine(V.runB2, 'c1', 'B = 2 Hz'), ampLine(V.runB05, 'c2', 'B = 0.5 Hz')],
      annotations: [peakMark(V.runB2, 'c1'), peakMark(V.runB05, 'c2')],
      x: { range: RPM_ZOOM, ticks: [2000, 2400, 2800, 3200, 3600] },
      y: { range: [0, 115], ticks: [0, 25, 50, 75, 100], label: '[µm pp]' },
      height: 170,
    },
    {
      title: '1X 위상 (지연각)',
      series: [truthLag(V.runB05), lagLine(V.runB2, 'c1'), lagLine(V.runB05, 'c2')],
      annotations: [{ type: 'hline', y: 90, color: 'muted', label: '90°', labelAt: 'start' }],
      x: { range: RPM_ZOOM, ticks: [2000, 2400, 2800, 3200, 3600], label: '회전수 [rpm]' },
      y: { range: [0, 180], ticks: [0, 45, 90, 135, 180], label: '[°]' },
      height: 130,
    },
  ],
};

export const upDownZeroPhase: FigureSpec = {
  id: 'fig-p5-5-5',
  caption: `그림 5. 같은 B = 0.5 Hz, ${D.rate} rpm/s. 위: 실시간 필터는 늘 "지나온 쪽"으로 밀린다 — 런업(주황, 그림 4와 같은 기록)은 봉우리가 ${fmt(V.runB05.peakRpm, 4)} rpm, 코스트다운(파랑)은 ${fmt(V.downB05.peakRpm, 4)} rpm으로 둘이 ${fmt(V.runB05.peakRpm - V.downB05.peakRpm, 3)} rpm 벌어진다. 아래: 기록을 두 번 거르면(영위상, P5-1) 지연이 없어 봉우리 회전수가 ${fmt(V.zpB05.peakRpm, 4)} rpm으로 거의 돌아오지만, 크기는 ${pp(V.zpB05.peakAmp).toFixed(1)} µm pp로 오히려 더 깎인다(초록). 폭을 2 Hz로 넓혀 두 번 거르면(보라) ${fmt(V.zpB2.peakRpm, 4)} rpm·${fmt(pp(V.zpB2.peakAmp), 3)} µm pp로 참값에 가깝다.`,
  panels: [
    {
      title: '실시간(한 방향): 런업 vs 코스트다운',
      series: [truthAmp(V.runB05), ampLine(V.runB05, 'c2', '런업'), ampLine(V.downB05, 'c1', '코스트다운')],
      annotations: [peakMark(V.runB05, 'c2'), peakMark(V.downB05, 'c1', -74)],
      x: { range: RPM_ZOOM, ticks: [2000, 2400, 2800, 3200, 3600] },
      y: { range: [0, 115], ticks: [0, 25, 50, 75, 100], label: '[µm pp]' },
      height: 160,
    },
    {
      title: '저장된 기록을 두 번 거르기 (런업)',
      series: [truthAmp(V.runB05), ampLine(V.zpB05, 'c3', 'B = 0.5 Hz, 두 번'), ampLine(V.zpB2, 'c4', 'B = 2 Hz, 두 번')],
      annotations: [peakMark(V.zpB05, 'c3', 8, 22)],
      x: { range: RPM_ZOOM, ticks: [2000, 2400, 2800, 3200, 3600], label: '회전수 [rpm]' },
      y: { range: [0, 115], ticks: [0, 25, 50, 75, 100], label: '[µm pp]' },
      height: 160,
    },
  ],
};

// ── 그림 6: 노치 ──
const blocks = V.notchRun.blocks;
export const notch: FigureSpec = {
  id: 'fig-p5-5-6',
  caption: `그림 6. 노치로 1X를 지운다 (트래킹 필터 B = ${NOTCH_PARAMS.bandwidth} Hz로 뽑은 1X 파형을 뺀다). 위: 3600 rpm의 측정 파형 — 1X(${fmt(pp(V36.amp), 3)} µm pp)에 섞인 0.45X(${fmt(pp(TRK.aWhirl), 2)} µm pp)는 봉우리 높이를 들쭉날쭉하게 할 뿐, 그것이 무엇이고 얼마인지는 파형으로 읽기 어렵다. 가운데: 1X를 뺀 Not-1X 파형(주황)은 참 성분(회색 점선, 2X + 0.45X + 잡음)과 겹친다. 아래 둘: 런업(${NOTCH_PARAMS.rate} rpm/s) 동안 0.25초마다 잰 RMS. 0.45X가 생기는 ${TRK.whirlFrom} rpm 위에서 Not-1X(주황)는 ${fmt(V.notOneXBefore * um, 3)} → ${fmt(V.notchRun.holdNotOneX * um, 3)} µm로 두 배가 넘게 커지지만, 직접(파랑)은 1X가 대부분이라 그 변화가 드러나지 않는다. 임계속도 근처의 작은 언덕은 1X가 빨리 변해 노치가 다 지우지 못한 몫이다.`,
  panels: [
    {
      title: '① 직접 (거르지 않은 파형), 3600 rpm',
      series: [{ x: notchWave.t, y: notchWave.x, color: 'c1', width: 1.4 }],
      x: { range: [0, 0.4] },
      y: { range: [-28, 28], ticks: [-20, 0, 20], label: '[µm]' },
      height: 95,
    },
    {
      title: '② Not-1X = 직접 − 뽑은 1X',
      series: [
        { x: notchWave.t, y: notchWave.truth, color: 'muted', dash: true, width: 1.6 },
        { x: notchWave.t, y: notchWave.not1, color: 'c2', width: 1.4 },
      ],
      x: { range: [0, 0.4], label: '시각 [s]' },
      y: { range: [-14, 14], ticks: [-10, 0, 10], label: '[µm]' },
      height: 95,
    },
    {
      title: '③ 런업 동안의 직접 RMS (0.25초마다)',
      series: [{ x: blocks.map((b) => b.rpm), y: blocks.map((b) => b.direct * um), color: 'c1', width: 2 }],
      annotations: [{ type: 'band', x1: TRK.whirlFrom, x2: TRK.rpmHi, color: 'muted', label: '0.45X' }],
      x: { range: [TRK.rpmLo, TRK.rpmHi], ticks: [600, 1200, 1800, 2400, 3000, 3600] },
      y: { range: [0, 40], ticks: [0, 20, 40], label: '[µm rms]' },
      height: 105,
    },
    {
      title: '④ 같은 런업의 Not-1X RMS (세로 눈금이 다르다)',
      series: [
        { x: blocks.map((b) => b.rpm), y: blocks.map((b) => b.truth * um), color: 'muted', dash: true, width: 1.6, label: '참 Not-1X' },
        { x: blocks.map((b) => b.rpm), y: blocks.map((b) => b.notOneX * um), color: 'c2', width: 2, label: 'Not-1X' },
      ],
      annotations: [{ type: 'band', x1: TRK.whirlFrom, x2: TRK.rpmHi, color: 'muted', label: '0.45X' }],
      x: { range: [TRK.rpmLo, TRK.rpmHi], ticks: [600, 1200, 1800, 2400, 3000, 3600], label: '회전수 [rpm]' },
      y: { range: [0, 6], ticks: [0, 2, 4, 6], label: '[µm rms]' },
      height: 120,
    },
  ],
};

// ── 그림 7: 직접 오빗 vs 1X 필터 오빗 ──
const OX: [number, number] = [-90, 90];
const OH = 240;
const C = 45;
const cross = (cx: number): FigAnnotation[] => [
  { type: 'line', x1: cx - 30, y1: 0, x2: cx + 30, y2: 0, color: 'muted', width: 1 },
  { type: 'line', x1: cx, y1: -27, x2: cx, y2: 27, color: 'muted', width: 1 },
];
export const orbitCompare: FigureSpec = {
  id: 'fig-p5-5-7',
  caption: `그림 7. 3600 rpm에서 X(가로, 오른쪽 +)·Y(세로, 위 +) 두 센서로 ${ORB.revs}바퀴 동안 그린 오빗 (P4-2). 왼쪽: 거르지 않은 직접 오빗 — 1X 타원에 0.45X(바퀴마다 조금씩 어긋나는 큰 고리)와 2X·잡음이 더해져 바퀴마다 다른 길을 간다. 오른쪽: 두 채널을 각각 트래킹 필터(B = 2 Hz)로 거른 1X 필터 오빗 — ${ORB.revs}바퀴가 한 타원에 겹친다. 1X 필터 오빗은 1X(동기) 응답 — 이 예에서는 불평형 응답 — 의 모양을, 직접 오빗은 1X 밖의 움직임까지 보여 준다. 읽는 법은 P6-3.`,
  panels: [
    {
      frame: false,
      series: [
        { x: orbit.dx.map((v) => v - C), y: orbit.dy, color: 'c1', width: 1.2 },
        { x: orbit.fx.map((v) => v + C), y: orbit.fy, color: 'c3', width: 2 },
      ],
      annotations: [
        ...cross(-C),
        ...cross(C),
        { type: 'text', x: -C, y: 29, text: '직접 오빗', anchor: 'middle', color: 'c1', bold: true },
        { type: 'text', x: C, y: 29, text: '1X 필터 오빗', anchor: 'middle', color: 'c3', bold: true },
      ],
      x: { range: OX },
      y: { range: squareYRange(OX, OH, -(squareYRange(OX, OH)[1] / 2)) },
      height: OH,
    },
  ],
};
