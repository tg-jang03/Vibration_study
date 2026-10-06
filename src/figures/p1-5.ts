/**
 * P1-5 "평균화" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 기본 조건은 랩(LAB-AVG-01)과 같다: f_s = 512 Hz, N = 512 → T = 1 s, Δf = 1 Hz, Hann 윈도우,
 * 32 Hz 작은 성분 0.025 mm/s Peak(= 0.0177 mm/s RMS, 잡음 바닥보다 작음) + 70 Hz 성분 0.07 mm/s Peak(= 0.0495 mm/s RMS,
 * 잡음 바닥보다 조금 큼) + 백색 잡음 0.4 mm/s RMS, 시드 고정. 두 성분 모두 1초 프레임에 정수 주기라 프레임 시작에 동기다.
 * 계산은 SI(m/s)로 하고 그림에 넣을 때만 mm/s로 바꾼다 (D-012).
 * TSA 그림(9 ~ 12)은 랩 LAB-AVG-02와 같은 기어 상자 신호(src/lib/gearbox.ts, 가속도 m/s²)를 쓴다.
 */
import { grid, type FigAnnotation, type FigPanel, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { averagePower, frameLayout, overlapPowerCv, splitOverlappingFrames, vectorAverage } from '../lib/dsp/average';
import type { ComplexSpectrum } from '../lib/dsp/fft';
import { createRng } from '../lib/dsp/random';
import { acquire } from '../lib/dsp/sampling';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';
import { removeOrders, synchronousAverage, tsaGain } from '../lib/dsp/tsa';
import { createWindow } from '../lib/dsp/window';
import { GEARBOX, gearboxSpec } from '../lib/gearbox';

const FS = 512;
const N = 512;
const TONE = 32;
const AMP = 0.000025; // m/s Peak
const TONE2 = 70;
const AMP2 = 0.00007; // m/s Peak
const SIGMA = 0.0004; // m/s RMS
const SEED = 20261002;
const MM = 1000;
const HANN = createWindow('hann', N);
const S1 = HANN.reduce((s, w) => s + w, 0);
const S2 = HANN.reduce((s, w) => s + w * w, 0);
/** 잡음만 있을 때 bin 하나의 평균 파워 [(m/s)²] (단일측 RMS 기준) */
const noisePowerOf = (sigma: number) => (2 * sigma ** 2 * S2) / S1 ** 2;
const NOISE_RMS_MM = Math.sqrt(noisePowerOf(SIGMA)) * MM;
const TONE_RMS_MM = (AMP / Math.SQRT2) * MM;
const TONE2_RMS_MM = (AMP2 / Math.SQRT2) * MM;
const FREQ = Array.from({ length: N / 2 + 1 }, (_, k) => (k * FS) / N);
const VIEW = 101; // 0 ~ 100 Hz

/** 단일측 RMS 복소 성분 (랩과 같은 정규화). timeError [s]는 트리거가 없을 때 프레임 기준 시각의 어긋남 */
function phasors(x: Float64Array, timeError = 0): ComplexSpectrum {
  const s = singleSidedSpectrum({ fs: FS, x }, { window: HANN });
  const real = new Float64Array(s.amplitude.length);
  const imag = new Float64Array(s.amplitude.length);
  for (let k = 0; k < real.length; k++) {
    const a = s.amplitude[k] / (k === 0 || k === N / 2 ? 1 : Math.SQRT2);
    if (a === 0) continue;
    const ph = s.phase[k] + 2 * Math.PI * s.frequency[k] * timeError;
    real[k] = a * Math.cos(ph);
    imag[k] = a * Math.sin(ph);
  }
  return { real, imag };
}
const power = (c: ComplexSpectrum) => c.real.map((re, k) => re ** 2 + c.imag[k] ** 2);
/** 파워 → mm/s RMS 진폭, 앞쪽 count개 bin */
const toMm = (p: ArrayLike<number>, count = VIEW) => Array.from(p, (v) => Math.sqrt(Math.max(0, v)) * MM).slice(0, count);
const VIEW_F = FREQ.slice(0, VIEW);

/** 겹치지 않는 1초 프레임 count개 (작은 성분 + 잡음, 잡음만) */
function collect(count: number, overlap = 0, sigma = SIGMA, triggered = true) {
  const { totalSamples } = frameLayout(N, count, overlap);
  const noise = acquire({ components: [{ type: 'noise', rms: sigma, seed: SEED }] }, { fs: FS, n: totalSamples });
  const sig = acquire(
    { components: [{ type: 'sine', freq: TONE, amp: AMP, phase: 0.3 }, { type: 'sine', freq: TONE2, amp: AMP2, phase: 1.1 }] },
    { fs: FS, n: totalSamples },
  );
  const mixed = sig.x.map((v, i) => v + noise.x[i]);
  const rng = createRng(317);
  const frames = splitOverlappingFrames(mixed, N, overlap).frames;
  const noiseFrames = splitOverlappingFrames(noise.x, N, overlap).frames;
  const data: ComplexSpectrum[] = [];
  const noiseOnly: ComplexSpectrum[] = [];
  for (let m = 0; m < count; m++) {
    const te = triggered ? 0 : rng.uniform() / TONE;
    data.push(phasors(frames[m], te));
    noiseOnly.push(phasors(noiseFrames[m], te));
  }
  return { data, noiseOnly };
}
const run64 = collect(64);
const toneLine: FigAnnotation = { type: 'vline', x: TONE, color: 'warn', dash: true };
const toneLine2: FigAnnotation = { type: 'vline', x: TONE2, color: 'c3', dash: true };
const noiseLevel = (label?: string): FigAnnotation => ({ type: 'hline', y: NOISE_RMS_MM, color: 'muted', label, labelAt: 'end' });
const specPanel = (title: string, y: number[], color: 'c1' | 'c3' | 'c2' | 'warn', last: boolean, extra: FigAnnotation[] = [], yMax = 0.1): FigPanel => ({
  title,
  series: [{ x: VIEW_F, y, color, width: 1.6 }],
  annotations: [toneLine, toneLine2, ...extra],
  x: last ? { range: [0, 100], ticks: [0, 10, 20, 32, 40, 50, 60, 70, 80, 90, 100], label: '주파수 [Hz]' } : { range: [0, 100], ticks: 'none' },
  y: { range: [0, yMax], ticks: yMax < 0.1 ? [0, 0.02, 0.04, 0.06] : [0, 0.05, 0.1] },
  height: last ? 105 : 88,
});
/** 아주 작은 값도 지수 표기 없이 (예: 0.0004) */
const fixedMm = (v: number) => (v < 0.001 ? v.toFixed(4) : formatNumber(v, 2));

// 그림 1 — 한 번 잰 스펙트럼의 바닥은 들쭉날쭉하고, 잴 때마다 모양이 다르다
const frameA = toMm(power(run64.data[0]));
const frameB = toMm(power(run64.data[5]));
export const jaggedFloor: FigureSpec = {
  id: 'fig-5-1',
  caption: `그림 1. 같은 기계를 1초씩 두 번 잰 스펙트럼 (Δf = 1 Hz, Hann, 세로축 mm/s RMS). 성분은 두 개다 — 70 Hz(초록 점선) ${formatNumber(TONE2_RMS_MM, 2)} mm/s, 32 Hz(주황 점선) ${formatNumber(TONE_RMS_MM, 2)} mm/s. 나머지는 불규칙한 잡음이다. 잡음 막대는 평균(회색 선, ${formatNumber(NOISE_RMS_MM, 2)} mm/s) 근처에서 크게 들쭉날쭉하고, 그 모양이 잴 때마다 바뀐다. 한 번 잰 것만으로는 70 Hz 막대도 우연히 튄 잡음 봉우리와 잘 구분되지 않고, 32 Hz는 아예 보이지 않는다.`,
  panels: [
    specPanel('0 ~ 1초에 잰 프레임', frameA, 'c1', false, [noiseLevel('잡음의 평균 높이')]),
    specPanel('5 ~ 6초에 잰 프레임', frameB, 'c1', true, [noiseLevel()]),
  ],
};

// 그림 2 — 파워 평균: 바닥이 매끈해지지만 내려가지는 않는다
const powerAvgAt = (m: number) => toMm(averagePower(run64.data.slice(0, m).map(power), 'linear'));
const pa = [1, 4, 16, 64].map((m) => ({ m, y: powerAvgAt(m) }));
const pa64Tone = pa[3].y[TONE];
const pa64Tone2 = pa[3].y[TONE2];
export const powerAverageSteps: FigureSpec = {
  id: 'fig-5-2',
  caption: `그림 2. 그림 1과 같은 신호를 1, 4, 16, 64개 프레임만큼 파워 평균한 스펙트럼. 평균 횟수가 늘수록 바닥의 들쭉날쭉함이 줄어 매끈해지지만, 바닥의 높이는 회색 선(${formatNumber(NOISE_RMS_MM, 2)} mm/s) 근처에서 그대로다. 매끈해진 바닥 위로 70 Hz 막대(${formatNumber(pa64Tone2, 2)} mm/s)는 확실히 솟아 보인다. 하지만 바닥보다 작은 32 Hz 성분은 64개를 평균해도 ${formatNumber(pa64Tone, 2)} mm/s로 바닥과 구분되지 않는다.`,
  panels: pa.map((p, i) => specPanel(`${p.m}개 프레임 평균 (측정 ${p.m}초)`, p.y, 'c1', i === pa.length - 1, [noiseLevel(i === 0 ? '잡음의 평균 높이' : undefined)])),
};

// 그림 3 — 평균 횟수에 따른 잡음 바닥의 높이와 흔들림
const STAT_BINS = Array.from({ length: 251 }, (_, i) => i + 3).filter((k) => Math.abs(k - TONE) > 4 && k < N / 2 - 2);
function floorStats(powers: Float64Array) {
  const v = STAT_BINS.map((k) => powers[k]);
  const mean = v.reduce((s, x) => s + x, 0) / v.length;
  const std = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / v.length);
  return { mean, std };
}
const MS = [1, 2, 4, 8, 16, 32, 64];
const P0 = noisePowerOf(SIGMA);
const stats = MS.map((m) => floorStats(averagePower(run64.noiseOnly.slice(0, m).map(power), 'linear')));
const logX = MS.map((m) => Math.log2(m));
const mTicks = { ticks: logX, tickLabels: MS.map((m, i) => ({ value: logX[i], label: String(m) })) };
export const levelVsSpread: FigureSpec = {
  id: 'fig-5-3',
  caption: `그림 3. 잡음 바닥만 떼어 내 평균 횟수 M에 따라 두 숫자를 쟀다 (처음 한 프레임의 이론값 = 1). 파랑: 바닥의 평균 높이(파워) — M을 64까지 늘려도 1 근처에 머문다. 초록: 바닥의 흔들림(표준편차 ÷ 평균) — 1에서 시작해 점선 1/√M을 따라 줄어든다 (M = 64에서 ${formatNumber(stats[6].std / stats[6].mean, 2)}). 파워 평균이 줄이는 것은 흔들림이지 높이가 아니다.`,
  panels: [
    {
      series: [
        { x: logX, y: stats.map((s) => s.mean / P0), color: 'c1', width: 2.2, label: '바닥의 평균 높이' },
        { x: logX, y: stats.map((s) => s.mean / P0), kind: 'dots', color: 'c1', radius: 4 },
        { x: grid(0, 6, 61), y: grid(0, 6, 61).map((l) => 1 / Math.sqrt(2 ** l)), color: 'c3', dash: true, width: 1.8, label: '1/√M' },
        { x: logX, y: stats.map((s) => s.std / s.mean), kind: 'dots', color: 'c3', radius: 4.5, label: '바닥의 흔들림 (표준편차 ÷ 평균)' },
      ],
      x: { range: [-0.2, 6.2], ...mTicks, label: '평균한 프레임 수 M' },
      y: { range: [0, 1.4], ticks: [0, 0.25, 0.5, 0.75, 1, 1.25] },
      height: 190,
    },
  ],
};

// 그림 4 — bin 값을 화살표로: 동기 성분은 방향이 같고, 잡음은 제각각이다
const ar = createRng(5);
const CX = 2.3;
const toneArrows = Array.from({ length: 8 }, () => {
  const len = 1 + 0.12 * ar.normal();
  const ang = 0.6 + 0.12 * ar.normal();
  return [len * Math.cos(ang), len * Math.sin(ang)];
});
const nr = createRng(24); // 평균 길이가 기대값(약 0.27)에 가까운 시드
const noiseArrows = Array.from({ length: 8 }, () => [0.62 * nr.normal(), 0.62 * nr.normal()]);
const meanOf = (a: number[][]) => [a.reduce((s, v) => s + v[0], 0) / a.length, a.reduce((s, v) => s + v[1], 0) / a.length];
const toneMean = meanOf(toneArrows);
const noiseMean = meanOf(noiseArrows);
const len = (v: number[]) => Math.hypot(v[0], v[1]);
const noiseLenAvg = noiseArrows.reduce((s, v) => s + len(v), 0) / noiseArrows.length;
const circle = (cx: number): FigSeries => {
  const th = grid(0, 2 * Math.PI, 121);
  return { x: th.map((t) => cx + Math.cos(t)), y: th.map((t) => Math.sin(t)), color: 'muted', dash: true, width: 1 };
};
const arrowsFrom = (cx: number, list: number[][]): FigAnnotation[] =>
  list.map((v) => ({ type: 'arrow', x1: cx, y1: 0, x2: cx + v[0], y2: v[1], color: 'muted', double: false }));
export const phasorAverage: FigureSpec = {
  id: 'fig-5-4',
  caption: `그림 4. 프레임 8개에서 같은 bin의 값을 화살표로 그렸다. 화살표 길이는 크기, 방향은 위상이다 (P1-1의 cos·sin 두 합을 가로·세로로 놓은 것). 왼쪽: 프레임 시작을 축의 회전에 맞춘 동기 성분은 매번 거의 같은 방향이라, 8개를 평균한 화살표(주황)의 길이가 ${formatNumber(len(toneMean), 2)}로 거의 그대로다. 오른쪽: 잡음은 방향이 제멋대로라 서로 상쇄되어, 화살표 하나의 평균 길이 ${formatNumber(noiseLenAvg, 2)}가 평균하면 ${formatNumber(len(noiseMean), 2)}로 줄어든다. 점선 원은 길이 1이다.`,
  panels: [
    {
      series: [circle(-CX), circle(CX)],
      annotations: [
        ...arrowsFrom(-CX, toneArrows),
        ...arrowsFrom(CX, noiseArrows),
        { type: 'arrow', x1: -CX, y1: 0, x2: -CX + toneMean[0], y2: toneMean[1], color: 'warn', double: false },
        { type: 'arrow', x1: CX, y1: 0, x2: CX + noiseMean[0], y2: noiseMean[1], color: 'warn', double: false },
        { type: 'text', x: -CX, y: 1.32, text: '동기 성분: 매번 거의 같은 방향', anchor: 'middle', bold: true, color: 'c1' },
        { type: 'text', x: CX, y: 1.32, text: '잡음: 매번 제멋대로', anchor: 'middle', bold: true, color: 'c1' },
        { type: 'text', x: -CX, y: -1.3, text: `8개 평균(주황) 길이 ${formatNumber(len(toneMean), 2)}`, anchor: 'middle', color: 'warn', bold: true },
        { type: 'text', x: CX, y: -1.3, text: `8개 평균(주황) 길이 ${formatNumber(len(noiseMean), 2)}`, anchor: 'middle', color: 'warn', bold: true },
      ],
      x: { range: [-4.6, 4.6], ticks: 'none' },
      y: { range: [-1.5, 1.5], ticks: 'none' },
      height: 222,
      legend: false,
    },
  ],
};

// 그림 5 — 같은 64개 프레임: 파워 평균 vs 벡터 평균(트리거 있음/없음)
const vecTrig = toMm(power(vectorAverage(run64.data)));
const untrig = collect(64, 0, SIGMA, false);
const vecNoTrig = toMm(power(vectorAverage(untrig.data)));
const vecFloor = Math.sqrt(floorStats(power(vectorAverage(run64.noiseOnly))).mean) * MM;
export const vectorVsPower: FigureSpec = {
  id: 'fig-5-5',
  caption: `그림 5. 같은 64개 프레임을 세 가지로 평균했다. 위: 파워 평균 — 바닥이 ${formatNumber(NOISE_RMS_MM, 2)} mm/s 근처에 그대로 있고 32 Hz는 묻혀 있다. 가운데: 벡터 평균(프레임 시작을 회전에 맞춤) — 잡음 화살표가 서로 상쇄되어 바닥이 약 ${formatNumber(vecFloor, 2)} mm/s(약 1/8)로 내려가고, 32 Hz 성분이 ${formatNumber(vecTrig[TONE], 2)} mm/s로 뚜렷하게 드러난다 (원래 값 ${formatNumber(TONE_RMS_MM, 2)}과의 차이는 덜 지워진 잡음). 70 Hz도 ${formatNumber(vecTrig[TONE2], 2)} mm/s로 그대로 남는다. 아래: 프레임 시작을 맞추지 않고 벡터 평균하면 성분의 방향도 매번 달라져, 32 Hz는 ${fixedMm(vecNoTrig[TONE])} mm/s, 70 Hz는 ${fixedMm(vecNoTrig[TONE2])} mm/s로 성분까지 깎인다. (세 패널 모두 세로축 0 ~ 0.06 mm/s)`,
  panels: [
    specPanel('파워 평균 64개', pa[3].y, 'c1', false, [noiseLevel('파워 평균의 바닥')], 0.06),
    specPanel('벡터 평균 64개 (프레임 시작을 회전에 맞춤)', vecTrig, 'c3', false, [
      noiseLevel(),
      { type: 'point', x: TONE, y: vecTrig[TONE], label: `32 Hz: ${formatNumber(vecTrig[TONE], 2)}`, color: 'warn', dx: 8, dy: -10 },
    ], 0.06),
    specPanel('벡터 평균 64개 (맞추지 않음)', vecNoTrig, 'warn', true, [noiseLevel()], 0.06),
  ],
};

// 그림 6 — 상태가 바뀔 때: 선형 평균 vs 지수 평균
const FRAMES = 60;
const STEP_AT = 20;
const ampSeq = Array.from({ length: FRAMES }, (_, i) => (i < STEP_AT ? 1 : 2)); // mm/s RMS
const powSeq = ampSeq.map((a) => Float64Array.of(a * a));
const ALPHA = 1 / 8;
const running = (mode: 'linear' | 'exponential') =>
  Array.from({ length: FRAMES }, (_, m) => Math.sqrt(averagePower(powSeq.slice(0, m + 1), mode, mode === 'exponential' ? ALPHA : 1 / (m + 1))[0]));
const linRun = running('linear');
const expRun = running('exponential');
const frameNo = Array.from({ length: FRAMES }, (_, i) => i + 1);
export const expTracking: FigureSpec = {
  id: 'fig-5-6',
  caption: `그림 6. 20번째 프레임 뒤에 진동이 1 → 2 mm/s RMS로 커진 경우(회색 계단 = 매 프레임의 값). 처음부터 모두 같은 무게로 더하는 선형 평균(파랑)은 옛날 값에 끌려 60번째 프레임에도 ${formatNumber(linRun[FRAMES - 1], 3)} mm/s에 머문다. 새 값에 1/8의 무게를 주는 지수 평균(초록)은 약 20프레임 만에 ${formatNumber(expRun[STEP_AT + 19], 3)} mm/s까지 따라간다.`,
  panels: [
    {
      series: [
        { x: frameNo, y: ampSeq, kind: 'step', color: 'muted', width: 2, label: '매 프레임의 값' },
        { x: frameNo, y: linRun, color: 'c1', width: 2.4, label: '선형 평균' },
        { x: frameNo, y: expRun, color: 'c3', width: 2.4, label: '지수 평균 (α = 1/8)' },
      ],
      annotations: [{ type: 'vline', x: STEP_AT + 0.5, label: '여기서 진동이 커짐', color: 'warn', dash: true }],
      x: { range: [1, FRAMES], ticks: [1, 10, 20, 30, 40, 50, 60], label: '프레임 번호' },
      y: { range: [0, 2.4], ticks: [0, 0.5, 1, 1.5, 2], label: '[mm/s RMS]' },
      height: 180,
    },
  ],
};

// 그림 7 — 런업: 마지막 프레임 vs 선형 평균 vs 피크 홀드
const RU_FRAMES = 100; // 1초 프레임마다 1X가 1 Hz(1 bin)씩 움직이도록
const RU_SIGMA = 0.0001;
const ruTotal = N * RU_FRAMES;
const ruDuration = ruTotal / FS;
const ruNoise = acquire({ components: [{ type: 'noise', rms: RU_SIGMA, seed: SEED }] }, { fs: FS, n: ruTotal });
const ruX = Float64Array.from({ length: ruTotal }, (_, i) => {
  const t = i / FS;
  return 0.00025 * Math.cos(2 * Math.PI * (20 * t + (50 * t * t) / ruDuration)) + ruNoise.x[i];
});
const ruPow = splitOverlappingFrames(ruX, N, 0).frames.map((f) => power(phasors(f)));
const RU_VIEW = 131; // 0 ~ 130 Hz
const ruLast = toMm(ruPow[RU_FRAMES - 1], RU_VIEW);
const ruLinear = toMm(averagePower(ruPow, 'linear'), RU_VIEW);
const ruHold = toMm(averagePower(ruPow, 'peakHold'), RU_VIEW);
const RU_F = FREQ.slice(0, RU_VIEW);
const ruHoldMin = Math.min(...ruHold.slice(30, 111));
const ruHoldMax = Math.max(...ruHold.slice(30, 111));
export const runupPeakHold: FigureSpec = {
  id: 'fig-5-7',
  caption: `그림 7. ${RU_FRAMES}초 동안 회전수를 올려 1X가 20 Hz에서 120 Hz로 옮겨 가는 동안(1초에 1 Hz씩) 1초 프레임 ${RU_FRAMES}개를 모았다 (1X 진폭 0.25 mm/s Peak = 0.18 mm/s RMS). 회색: 마지막 프레임 — 지금 1X는 120 Hz 근처에만 있다. 파랑: 선형 평균 — 지나간 위치들이 1/${RU_FRAMES}씩 섞여 낮고 넓게 퍼진다. 주황: 피크 홀드 — 주파수마다 지금까지 가장 컸던 값을 남겨, 1X가 지나간 길 전체가 ${formatNumber(ruHoldMin, 2)} ~ ${formatNumber(ruHoldMax, 2)} mm/s 높이로 그려진다 (실제 0.18보다 조금 낮은 것은 프레임 하나 동안 1X가 1 Hz 움직인 번짐(P1-3)과 가리비 손실(P1-4) 때문이다). 피크 홀드는 "지금 값"이 아니라 "지나간 최대값"이다.`,
  panels: [
    {
      series: [
        { x: RU_F, y: ruLast, color: 'muted', width: 1.6, label: '마지막 프레임' },
        { x: RU_F, y: ruLinear, color: 'c1', width: 2, label: '선형 평균' },
        { x: RU_F, y: ruHold, color: 'warn', width: 2.4, label: '피크 홀드' },
      ],
      x: { range: [0, 130], ticks: [0, 20, 40, 60, 80, 100, 120], label: '주파수 [Hz]' },
      y: { range: [0, 0.2], ticks: [0, 0.05, 0.1, 0.15, 0.2], label: '[mm/s RMS]' },
      height: 180,
    },
  ],
};

// 그림 8 — 오버랩: 같은 4.75초 안에 프레임을 몇 개 넣을 수 있나
const SPAN = 4.75;
function overlapPanel(r: number, title: string, last: boolean): FigPanel {
  const hop = 1 - r;
  const starts: number[] = [];
  for (let s = 0; s + 1 <= SPAN + 1e-9; s += hop) starts.push(Number(s.toFixed(6)));
  const tt = grid(0, 1, 60);
  return {
    title: `${title}: 프레임 ${starts.length}개`,
    series: starts.map((s, i) => ({
      x: tt.map((t) => s + t),
      y: tt.map((t) => 0.5 - 0.5 * Math.cos(2 * Math.PI * t)),
      color: i % 2 === 0 ? 'c1' : 'c3',
      width: 1.8,
    })),
    annotations: r > 0 ? [{ type: 'arrow', x1: 0, y1: 1.12, x2: hop, y2: 1.12, double: true, label: `다음 프레임까지 ${formatNumber(hop, 2)}초`, color: 'warn' }] : [],
    x: last ? { range: [0, 5], ticks: [0, 1, 2, 3, 4, 4.75, 5], label: '시간 [s]' } : { range: [0, 5], ticks: 'none' },
    y: { range: [0, 1.3], ticks: 'none' },
    height: last ? 85 : 70,
    legend: false,
  };
}
const HANN_HOP = { 0.5: frameLayout(N, 16, 0.5).hop, 0.75: frameLayout(N, 16, 0.75).hop };
const effective = (r: 0.5 | 0.75, m: number) => 1 / overlapPowerCv(HANN, m, HANN_HOP[r]) ** 2;
export const overlapLayout: FigureSpec = {
  id: 'fig-5-8',
  caption: `그림 8. 4.75초 동안 1초짜리 Hann 프레임을 몇 개 넣을 수 있는지 (종 모양 하나 = 프레임 하나의 가중치). 겹치지 않으면 4개, 50 % 겹치면 8개, 75 % 겹치면 16개다. 겹친 프레임은 데이터 일부를 같이 쓰므로 완전히 새로운 정보는 아니다. 그래도 Hann은 프레임 양 끝을 작게 보므로, 75 %로 겹친 16개는 겹치지 않은 독립 프레임 약 ${formatNumber(effective(0.75, 16), 2)}개만큼 흔들림을 줄인다 — 같은 4.75초에 겹치지 않고 모은 4개의 두 배가 넘는다.`,
  panels: [overlapPanel(0, '오버랩 0 %', false), overlapPanel(0.5, '오버랩 50 %', false), overlapPanel(0.75, '오버랩 75 %', true)],
};

// ── TSA (§6) — 랩 LAB-AVG-02와 같은 신호 (src/lib/gearbox.ts) ──
const GB = GEARBOX;
const SPR = GB.samplesPerRev;
const TSA_REVS = 64;
const gbFull = acquire(gearboxSpec(), { fs: GB.fs, n: SPR * TSA_REVS }).x;
const gbPart = (o: Parameters<typeof gearboxSpec>[0]) => Array.from(acquire(gearboxSpec(o), { fs: GB.fs, n: SPR * 3 }).x);
const gbTruth = synchronousAverage(acquire(gearboxSpec({ shaftB: false, noiseRms: 0 }), { fs: GB.fs, n: SPR }).x, SPR);
const ANG = Array.from({ length: SPR }, (_, n) => (360 * n) / SPR);
const T3 = Array.from({ length: SPR * 3 }, (_, i) => (1000 * i) / GB.fs);
const tsaOf = (m: number) => synchronousAverage(gbFull, SPR, m);
const rmsDiff = (a: ArrayLike<number>, b: ArrayLike<number>) => Math.sqrt(Array.from(a).reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length);
const tsa4 = tsaOf(4);
const tsa64 = tsaOf(TSA_REVS);
const tsaDev = { m1: rmsDiff(tsaOf(1), gbTruth), m4: rmsDiff(tsa4, gbTruth), m64: rmsDiff(tsa64, gbTruth) };
const kpLines = (label = false): FigAnnotation[] =>
  [50, 100].map((t, i): FigAnnotation => ({ type: 'vline', x: t, color: 'muted', label: label && i === 0 ? '키페이저' : undefined }));
const timePanel = (title: string, y: number[], color: FigSeries['color'], range: number, last: boolean, h = 80): FigPanel => ({
  title,
  series: [{ x: T3, y, color, width: last ? 1.4 : 1.6 }],
  annotations: kpLines(),
  x: last ? { range: [0, 150], ticks: [0, 25, 50, 75, 100, 125, 150], label: '시간 [ms] (점선: 축 A 키페이저 = 한 바퀴 시작)' } : { range: [0, 150], ticks: 'none' },
  y: { range: [-range, range], ticks: [-range, 0, range] },
  height: h,
});

// 그림 9 — 센서 신호 한 줄에 섞인 축 A·결함·축 B 성분
export const tsaMixture: FigureSpec = {
  id: 'fig-5-9',
  caption: `그림 9. 기어 상자 센서 신호의 처음 세 바퀴(맨 위, 가속도 m/s²)와 그 안에 섞인 성분. 축 A는 ${GB.rpm} rpm(${GB.shaftHz} Hz)으로 돌고 기어 이빨이 ${GB.teeth}개라 맞물림 성분이 ${GB.teeth * GB.shaftHz} Hz(15차)에 생긴다(파랑). 120° 자리 이빨의 결함은 바퀴마다 한 번 '딱' 치고 울린다(주황). 축 A의 성분은 점선(키페이저) 사이 같은 자리에 같은 모양으로 되풀이된다. 이웃 축 B의 성분(보라, ${GB.bRatio} × ${GB.shaftHz} = ${formatNumber(GB.bRatio * GB.shaftHz, 3)} Hz)은 한 바퀴에 ${GB.bRatio}번 흔들려 바퀴마다 시작 위치가 다르다. 여기에 잡음(σ = ${GB.noiseRms} m/s²)까지 더해진 맨 위 신호에서는 결함 충격을 찾기 어렵다.`,
  panels: [
    { ...timePanel('센서 신호 (모두 + 잡음)', Array.from(gbFull.slice(0, SPR * 3)), 'text', 5, false, 120), annotations: kpLines(true) },
    timePanel('축 A: 1X + 맞물림 성분 (15차·30차)', gbPart({ defect: false, shaftB: false, noiseRms: 0 }), 'c1', 2, false),
    timePanel('축 A 결함 충격 (바퀴마다 120° 자리)', gbPart({ shaftA: false, shaftB: false, noiseRms: 0 }), 'warn', 1.5, false),
    timePanel(`축 B 성분 (축 A 회전 주파수의 ${GB.bRatio}배)`, gbPart({ shaftA: false, defect: false, noiseRms: 0 }), 'c4', 1.5, true, 100),
  ],
};

const anglePanel = (title: string, series: FigSeries[], range: number, last: boolean, extra: FigAnnotation[] = [], h = 95): FigPanel => ({
  title,
  series,
  annotations: extra,
  x: last ? { range: [0, 360], ticks: [0, 60, 120, 180, 240, 300, 360], label: '축 A 회전 각도 [°]' } : { range: [0, 360], ticks: 'none' },
  y: { range: [-range, range], ticks: [-range, 0, range] },
  height: h,
});
const truthLine: FigSeries = { x: ANG, y: gbTruth, color: 'muted', dash: true, width: 1.4, label: '축 A 성분만 (참값)' };

// 그림 10 — 한 바퀴씩 잘라 같은 각도끼리 평균
export const tsaStack: FigureSpec = {
  id: 'fig-5-10',
  caption: `그림 10. 키페이저 펄스마다 한 바퀴씩 잘라 가로축을 회전 각도로 바꿨다. 위: 처음 4바퀴를 겹쳐 그리면 바퀴마다 모양이 다르다(축 B 성분과 잡음이 매번 다르게 얹힌다). 가운데: 같은 각도끼리 4바퀴를 평균. 아래: 64바퀴를 평균하면 축 A 성분만의 참값(회색 점선)에 거의 겹친다. 참값과의 차이(RMS)는 한 바퀴 ${tsaDev.m1.toFixed(2)} → 4바퀴 ${tsaDev.m4.toFixed(2)} → 64바퀴 ${tsaDev.m64.toFixed(2)} m/s²로 줄어든다. 120° 근처의 결함 충격은 아래 그림에서 맞물림 파형이 일그러진 모양으로 보인다.`,
  panels: [
    anglePanel('한 바퀴씩 잘라 겹친 것 (처음 4바퀴)', [0, 1, 2, 3].map((r): FigSeries => ({ x: ANG, y: gbFull.slice(r * SPR, (r + 1) * SPR), color: 'c1', width: 1.1, opacity: 0.5 })), 5, false),
    anglePanel('4바퀴 평균', [truthLine, { x: ANG, y: tsa4, color: 'c1', width: 1.6, label: '4바퀴 TSA' }], 3, false),
    anglePanel('64바퀴 평균', [truthLine, { x: ANG, y: tsa64, color: 'c1', width: 1.6, label: '64바퀴 TSA' }], 3, true, [{ type: 'vline', x: GB.defectDeg, color: 'warn', label: '120°' }], 110),
  ],
};

// 그림 11 — 빗살 모양 통과 특성 |H| vs ρ
const RHO = grid(12, 15, 1201);
const gainAt = { r134: tsaGain(13.4, 16), r1305: tsaGain(13.05, 16), r1305m64: tsaGain(13.05, 64) };
export const tsaComb: FigureSpec = {
  id: 'fig-5-11',
  caption: `그림 11. 축 A 회전 주파수의 ρ배인 성분이 TSA 뒤에 남는 비율 |H|. 정수배(13, 14 …)는 1로 그대로 남고, 그 사이는 거의 지워진다 — 빗(comb)의 살처럼 생겼다. 평균 바퀴 수 M이 클수록 살이 가늘어진다(살이 0으로 떨어지는 곳까지의 거리 = 1/M). ρ = 13.4는 M = 16에서 ${formatNumber(gainAt.r134, 3)}(= 1/16)만 남지만, 정수에 가까운 ρ = 13.05는 ${formatNumber(gainAt.r1305, 3)}이 남는다. 13.05를 지우려면 M이 1/0.05 = 20 이상이어야 한다.`,
  panels: [
    {
      series: [
        { x: RHO, y: RHO.map((r) => tsaGain(r, 4)), color: 'c2', width: 1.6, label: 'M = 4' },
        { x: RHO, y: RHO.map((r) => tsaGain(r, 16)), color: 'c1', width: 1.8, label: 'M = 16' },
      ],
      // 점 라벨은 13과 14 사이 위쪽 빈자리(곡선 없음)에 두고 화살표로 잇는다
      annotations: [
        { type: 'arrow', x1: 13.2, y1: 0.86, x2: 13.06, y2: gainAt.r1305 + 0.04, double: false, color: 'c4' },
        { type: 'arrow', x1: 13.36, y1: 0.66, x2: 13.4, y2: gainAt.r134 + 0.04, double: false, color: 'c3' },
        { type: 'point', x: 13.05, y: gainAt.r1305, color: 'c4' },
        { type: 'point', x: 13.4, y: gainAt.r134, color: 'c3' },
        { type: 'text', x: 13.22, y: 0.86, text: `13.05 → ${formatNumber(gainAt.r1305, 3)}`, color: 'c4', bold: true, dy: 5 },
        { type: 'text', x: 13.38, y: 0.68, text: `13.4 → ${formatNumber(gainAt.r134, 3)}`, color: 'c3', bold: true, dy: 5 },
      ],
      x: { range: [12, 15], ticks: [12, 12.5, 13, 13.5, 14, 14.5, 15], label: 'ρ = 성분 주파수 ÷ 축 A 회전 주파수' },
      y: { range: [0, 1.05], ticks: [0, 0.25, 0.5, 0.75, 1], label: '남는 비율 |H|' },
      height: 190,
    },
  ],
};

// 그림 12 — 규칙적인 성분을 빼면 결함 충격만 남는다 (Residual)
const res64 = removeOrders(tsa64, GB.regularOrders);
const truthRes = removeOrders(gbTruth, GB.regularOrders);
const inDefect = (deg: number) => deg >= GB.defectDeg && deg < GB.defectDeg + 45;
const resIn = Array.from(res64).filter((_, n) => inDefect(ANG[n]));
const resOut = Array.from(res64).filter((_, n) => !inDefect(ANG[n]));
const resPeak = Math.max(...resIn.map(Math.abs));
const resElse = Math.sqrt(resOut.reduce((s, v) => s + v * v, 0) / resOut.length);
const toothDeg = 360 / GB.teeth;
export const tsaResidual: FigureSpec = {
  id: 'fig-5-12',
  caption: `그림 12. 위: 64바퀴 TSA. 맞물림 성분이 커서 결함 충격은 파형의 작은 일그러짐일 뿐이다. 아래: 여기서 규칙적인 성분(1X, 맞물림 15차·30차)을 빼낸 나머지(Residual). 120° 자리에서 울림(최대 ${formatNumber(resPeak, 2)} m/s²)이 다른 각도의 남은 잡음(RMS ${formatNumber(resElse, 2)} m/s²)보다 확실히 크다. 이빨 하나가 ${formatNumber(toothDeg, 2)}°를 차지하므로 0°부터 세어 여섯 번째 이빨(120° ~ 144°) 자리다.`,
  panels: [
    anglePanel('64바퀴 TSA', [{ x: ANG, y: tsa64, color: 'c1', width: 1.6 }], 3, false),
    anglePanel('1X·맞물림 성분을 뺀 나머지 (Residual)', [
      { ...truthLine, y: truthRes, label: '참값에서 뺀 것' },
      { x: ANG, y: res64, color: 'c1', width: 1.6, label: '64바퀴 TSA에서 뺀 것' },
    ], 1.6, true, [{ type: 'band', x1: GB.defectDeg, x2: GB.defectDeg + 45, color: 'warn', label: '결함 충격' }], 120),
  ],
};

/** 본문 숫자 확인용 (테스트에서 사용) */
export const P15_VALUES = {
  tsaDev1: tsaDev.m1,
  tsaDev4: tsaDev.m4,
  tsaDev64: tsaDev.m64,
  tsaGain134: gainAt.r134,
  tsaGain1305: gainAt.r1305,
  tsaGain1305m64: gainAt.r1305m64,
  tsaResPeak: resPeak,
  tsaResElse: resElse,
  noiseRmsMm: NOISE_RMS_MM,
  toneRmsMm: TONE_RMS_MM,
  tone2RmsMm: TONE2_RMS_MM,
  pa64Tone,
  pa64Tone2,
  vecFloor,
  vecTone: vecTrig[TONE],
  vecTone2: vecTrig[TONE2],
  vecNoTrigTone: vecNoTrig[TONE],
  vecNoTrigTone2: vecNoTrig[TONE2],
  phasorToneMean: len(toneMean),
  phasorNoiseMean: len(noiseMean),
  phasorNoiseEach: noiseLenAvg,
  runupHoldMin: ruHoldMin,
  runupHoldMax: ruHoldMax,
  linEnd: linRun[FRAMES - 1],
  expAt40: expRun[STEP_AT + 19],
  meff75: effective(0.75, 16),
  meff50: effective(0.5, 16),
  spread64: stats[6].std / stats[6].mean,
};
