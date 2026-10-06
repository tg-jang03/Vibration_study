/**
 * P2-7 "스펙트럼 스케일링과 진동 단위" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호는 랩(LAB-SPC-01·02)과 같은 `src/lib/scalingDemo.ts`를 쓴다.
 * 계산은 SI(m/s, m/s²), 그림에 넣을 때만 mm/s·µm·g로 바꾼다 (D-012).
 */
import { grid, type FigAnnotation, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { acquire } from '../lib/dsp/sampling';
import { cumulativeBandRms, scaledSpectrum } from '../lib/dsp/scaling';
import { crestFactor, peak, rms } from '../lib/dsp/stats';
import { IMPACT, impactComponents, MACHINE, machineComponents, noiseBinPower, noisePsd, TONE_NOISE, toneNoiseSpectrum } from '../lib/scalingDemo';
import { convertSine } from '../lib/units';

const MM = 1000;
const { toneFreq, noiseRms, fs } = TONE_NOISE;
const db10 = (v: number) => 10 * Math.log10(Math.max(v, 1e-30));
const meanOf = (a: ArrayLike<number>, from: number, to: number) => {
  let s = 0;
  for (let k = from; k < to; k++) s += a[k];
  return s / (to - from);
};
/** f0 ~ f1 [Hz]의 bin 번호 범위 */
const bins = (df: number, f0: number, f1: number) => [Math.round(f0 / df), Math.round(f1 / df)] as const;
const sliceF = (s: { frequency: Float64Array }, df: number, f0: number, f1: number, y: ArrayLike<number>) => {
  const [a, b] = bins(df, f0, f1);
  return { x: Array.from(s.frequency.slice(a, b + 1)), y: Array.from(y).slice(a, b + 1) };
};

const LOW = toneNoiseSpectrum({ lor: 400 });
const HIGH = toneNoiseSpectrum({ lor: 3200 });
/** 잡음만 있는 구간(60 ~ 490 Hz)의 평균 파워 */
const floorPower = (s: typeof LOW) => meanOf(s.power, ...bins(s.df, 60, 490));
const floorPsd = (s: typeof LOW) => meanOf(s.psd, ...bins(s.df, 60, 490));
const toneBin = (s: typeof LOW) => Math.round(toneFreq / s.df);
const lowFloorDb = db10(floorPower(LOW) * MM * MM);
const highFloorDb = db10(floorPower(HIGH) * MM * MM);
const lowFloorTheoryDb = db10(noiseBinPower(noiseRms, LOW.n, LOW.enbw) * MM * MM);
const highFloorTheoryDb = db10(noiseBinPower(noiseRms, HIGH.n, HIGH.enbw) * MM * MM);
const toneDb = (s: typeof LOW) => db10(s.power[toneBin(s)] * MM * MM);

const fTicks = [0, 25, 50, 75, 100, 125, 150, 175, 200];

// 그림 1 — 라인 수를 늘리면 톤은 그대로, 잡음 바닥은 내려간다
function ampDbPanel(s: typeof LOW, lor: number, last: boolean, measuredDb: number): FigPanel {
  const view = sliceF(s, s.df, 0, 200, Array.from(s.power, (p) => db10(p * MM * MM)));
  return {
    title: `${lor} 라인 (Δf = ${formatNumber(s.df, 3)} Hz, 측정 ${formatNumber(s.n / fs, 3)} s)`,
    series: [{ x: view.x, y: view.y, color: 'c1', width: 1.3 }],
    annotations: [
      { type: 'hline', y: measuredDb, color: 'warn', dash: true },
      { type: 'text', x: 197, y: measuredDb + 10, text: `잡음 바닥 ${formatNumber(measuredDb, 3)} dB`, anchor: 'end', color: 'warn', bold: true },
      { type: 'point', x: toneFreq, y: toneDb(s), color: 'text', label: `톤 ${toneDb(s).toFixed(1)} dB`, dx: 10, dy: 2 },
    ],
    x: last ? { range: [0, 200], ticks: fTicks, label: '주파수 [Hz]' } : { range: [0, 200], ticks: 'none' },
    y: { range: [-50, 8], ticks: [-40, -30, -20, -10, 0], label: last ? 'dB (0 dB = 1 mm/s RMS)' : undefined },
    height: last ? 150 : 132,
  };
}
export const linesVsFloor: FigureSpec = {
  id: 'fig-p2-7-1',
  caption: `그림 1. 같은 신호 — 50 Hz 톤 1 mm/s RMS + 0 ~ 640 Hz에 고르게 퍼진 잡음 1 mm/s RMS — 를 400 라인과 3200 라인으로 쟀다 (F_max 500 Hz, Hann, 파워 평균 8회). 세로축은 진폭 RMS를 dB로 그렸다 (0 dB = 1 mm/s). 톤의 높이는 두 경우 모두 ${toneDb(LOW).toFixed(1)} dB(약 1 mm/s)로 같다. 그런데 잡음 바닥(주황 점선)은 ${formatNumber(lowFloorDb, 3)} dB에서 ${formatNumber(highFloorDb, 3)} dB로 약 ${formatNumber(lowFloorDb - highFloorDb, 2)} dB 내려갔다. 잡음은 그대로인데 화면의 바닥 높이가 바뀐 것이다.`,
  panels: [ampDbPanel(LOW, 400, false, lowFloorDb), ampDbPanel(HIGH, 3200, true, highFloorDb)],
};

// 그림 2 — bin 하나는 Δf 폭의 바구니: 같은 10 Hz 폭의 잡음을 몇 개로 나눠 담나
const LOW_N = toneNoiseSpectrum({ lor: 400, toneRms: 0 });
const HIGH_N = toneNoiseSpectrum({ lor: 3200, toneRms: 0 });
const bandSum = (s: typeof LOW) => {
  const [a, b] = bins(s.df, 45, 55);
  let sum = 0;
  for (let k = a; k < b; k++) sum += s.power[k];
  return { sum: sum * MM * MM, count: b - a };
};
const lowBand = bandSum(LOW_N);
const highBand = bandSum(HIGH_N);
/** 아주 작은 값도 지수 표기 없이 (예: 0.00037) */
const fixed = (v: number) => (v < 0.001 ? v.toFixed(5) : formatNumber(v, 2));
const bandTheory = noisePsd(noiseRms) * 10 * MM * MM; // 10 Hz 폭에 실제로 있는 잡음 파워
function basketPanel(s: typeof LOW, lor: number, last: boolean): FigPanel {
  const v = sliceF(s, s.df, 45, 55, Array.from(s.power, (p) => p * MM * MM));
  return {
    title: `${lor} 라인: bin 하나의 폭 ${formatNumber(s.df, 3)} Hz → 10 Hz에 ${lor === 400 ? lowBand.count : highBand.count}개`,
    series: [{ x: v.x, y: v.y, kind: 'stem', color: lor === 400 ? 'c1' : 'c3', radius: lor === 400 ? 3.5 : 2, width: 1.6 }],
    annotations: [
      { type: 'hline', y: noiseBinPower(noiseRms, s.n, s.enbw) * MM * MM, color: 'muted', dash: true },
      { type: 'text', x: 55.5, y: noiseBinPower(noiseRms, s.n, s.enbw) * MM * MM + 0.0013, text: `bin 하나의 평균 ${fixed(noiseBinPower(noiseRms, s.n, s.enbw) * MM * MM)} (점선)`, anchor: 'end', color: 'muted', bold: true },
    ],
    x: last ? { range: [44.4, 55.6], ticks: [45, 47.5, 50, 52.5, 55], label: '주파수 [Hz]' } : { range: [44.4, 55.6], ticks: 'none' },
    y: { range: [0, 0.0065], ticks: [0, 0.002, 0.004, 0.006], label: last ? '파워 [(mm/s)²]' : undefined },
    height: last ? 130 : 112,
  };
}
export const binBasket: FigureSpec = {
  id: 'fig-p2-7-2',
  caption: `그림 2. 그림 1에서 톤을 빼고 잡음만 45 ~ 55 Hz로 확대해 bin마다 파워(RMS²)를 막대로 세웠다. 400 라인(파랑)은 이 10 Hz를 ${lowBand.count}개의 넓은 bin으로, 3200 라인(초록)은 ${highBand.count}개의 좁은 bin으로 나눠 담는다. 막대 하나의 높이는 약 1/8로 낮아졌지만, 10 Hz 안의 막대를 모두 더하면 ${formatNumber(lowBand.sum, 3)}과 ${formatNumber(highBand.sum, 3)} (mm/s)²로 거의 같다. 잡음의 양은 그대로이고, 나눠 담는 바구니가 작아졌을 뿐이다.`,
  panels: [basketPanel(LOW_N, 400, false), basketPanel(HIGH_N, 3200, true)],
};

// 그림 3 — PSD: 잡음 바닥은 그대로, 톤이 커진다
const psdDb = (s: typeof LOW) => Array.from(s.psd, (p) => db10(p * MM * MM));
const psdFloorTheoryDb = db10(noisePsd(noiseRms) * MM * MM);
const tonePsdDb = (s: typeof LOW) => db10(s.psd[toneBin(s)] * MM * MM);
function psdPanel(s: typeof LOW, lor: number, last: boolean): FigPanel {
  const v = sliceF(s, s.df, 0, 200, psdDb(s));
  const floorDb = db10(floorPsd(s) * MM * MM);
  return {
    title: `${lor} 라인`,
    series: [{ x: v.x, y: v.y, color: 'c4', width: 1.3 }],
    annotations: [
      { type: 'hline', y: floorDb, color: 'warn', dash: true },
      { type: 'text', x: 197, y: floorDb + 11, text: `잡음 바닥 ${formatNumber(floorDb, 3)} dB`, anchor: 'end', color: 'warn', bold: true },
      { type: 'point', x: toneFreq, y: tonePsdDb(s), color: 'text', label: `톤 ${formatNumber(tonePsdDb(s), 2)} dB`, dx: 10, dy: 2 },
    ],
    x: last ? { range: [0, 200], ticks: fTicks, label: '주파수 [Hz]' } : { range: [0, 200], ticks: 'none' },
    y: { range: [-45, 15], ticks: [-40, -30, -20, -10, 0, 10], label: last ? 'dB (0 dB = 1 (mm/s)²/Hz)' : undefined },
    height: last ? 150 : 132,
  };
}
export const psdView: FigureSpec = {
  id: 'fig-p2-7-3',
  caption: `그림 3. 그림 1과 같은 측정을 PSD로 그렸다 (보라, 0 dB = 1 (mm/s)²/Hz). 이번에는 반대다. 잡음 바닥은 두 경우 모두 약 ${formatNumber(psdFloorTheoryDb, 3)} dB(이론 2σ²/f_s)로 같고, 톤이 ${formatNumber(tonePsdDb(LOW), 2)} dB에서 ${formatNumber(tonePsdDb(HIGH), 2)} dB로 약 9 dB(8배) 커졌다. PSD는 잡음의 크기를 Δf와 상관없이 읽게 해 주지만, 톤의 높이는 Δf에 따라 달라진다.`,
  panels: [psdPanel(LOW, 400, false), psdPanel(HIGH, 3200, true)],
};

// 그림 4 — 스펙트럼에서 전체 크기(overall) 구하기: ENBW로 나누기
const cumWith = cumulativeBandRms(HIGH.power, HIGH.enbw);
const cumWithout = cumulativeBandRms(HIGH.power, HIGH.enbw, false);
const step4 = 8;
const cumX = Array.from(HIGH.frequency).filter((_, k) => k % step4 === 0);
const pick = (a: Float64Array) => Array.from(a).filter((_, k) => k % step4 === 0).map((v) => v * MM);
const totalWith = cumWith[cumWith.length - 1] * MM;
const totalWithout = cumWithout[cumWithout.length - 1] * MM;
const timeRmsMm = HIGH.timeRms * MM;
export const overallFromSpectrum: FigureSpec = {
  id: 'fig-p2-7-4',
  caption: `그림 4. 3200 라인 스펙트럼(Hann)의 파워를 0 Hz부터 차례로 더해 제곱근을 취했다 — 그 주파수까지의 "대역 RMS". 50 Hz에서 톤 몫(1 mm/s)이 한꺼번에 더해지고, 그 뒤로 잡음 몫이 고르게 쌓인다. 파워 합을 ENBW(Hann 1.5)로 나눈 파랑은 끝에서 ${formatNumber(totalWith, 3)} mm/s로, 시간 파형에서 직접 잰 RMS ${formatNumber(timeRmsMm, 3)} mm/s(회색)와 맞는다. 나누지 않은 주황은 ${formatNumber(totalWithout, 3)} mm/s로 √1.5 ≈ 1.22배 크다.`,
  panels: [
    {
      series: [
        { x: cumX, y: pick(cumWithout), color: 'warn', width: 2.2, label: '파워 합 (ENBW로 나누지 않음)' },
        { x: cumX, y: pick(cumWith), color: 'c1', width: 2.4, label: '파워 합 ÷ ENBW' },
      ],
      annotations: [
        { type: 'hline', y: timeRmsMm, color: 'muted', dash: true },
        { type: 'text', x: 75, y: timeRmsMm + 0.2, text: `파형의 RMS ${formatNumber(timeRmsMm, 3)} mm/s (회색 점선)`, anchor: 'start', color: 'muted', bold: true },
      ],
      x: { range: [0, 640], ticks: [0, 50, 100, 200, 300, 400, 500, 640], label: '여기까지 더한 주파수 [Hz]' },
      y: { range: [0, 2], ticks: [0, 0.5, 1, 1.5, 2], label: '대역 RMS [mm/s]' },
      height: 200,
    },
  ],
};

// 그림 5 — derived peak (√2 × RMS) vs 진짜 Peak
const imp = acquire({ components: impactComponents() }, { fs: IMPACT.fs, n: IMPACT.n });
const impRms = rms(imp.x);
const impPeak = peak(imp.x);
const impDerived = Math.SQRT2 * impRms;
const impCf = crestFactor(imp.x);
const SHOW = Math.round(0.05 * IMPACT.fs);
const impT = Array.from({ length: SHOW }, (_, i) => (i / IMPACT.fs) * 1000);
export const derivedPeak: FigureSpec = {
  id: 'fig-p2-7-5',
  caption: `그림 5. 1X(${IMPACT.x1} Hz, 1 m/s² Peak)에 1초에 ${IMPACT.rate}번 되풀이되는 짧은 충격이 섞인 가속도 파형. 시간 파형에서 잰 진짜 Peak(true peak, 주황)는 ${formatNumber(impPeak, 3)} m/s²다. 이 신호의 RMS는 ${formatNumber(impRms, 3)} m/s²(회색)이고, 많은 분석기가 "Peak"라고 표시하는 √2 × RMS(derived peak, 초록)는 ${formatNumber(impDerived, 3)} m/s²로 진짜 Peak의 ${formatNumber((impDerived / impPeak) * 100, 2)} %밖에 안 된다. Crest factor가 ${formatNumber(impCf, 3)}으로 정현파의 √2보다 훨씬 크기 때문이다.`,
  panels: [
    {
      series: [{ x: impT, y: Array.from(imp.x.slice(0, SHOW)), color: 'c1', width: 1.1 }],
      annotations: [
        { type: 'hline', y: impPeak, color: 'warn', dash: true, label: `진짜 Peak ${formatNumber(impPeak, 3)}`, labelAt: 'end' },
        { type: 'hline', y: impDerived, color: 'c3', dash: true, label: `√2 × RMS ${formatNumber(impDerived, 3)}`, labelAt: 'end' },
        { type: 'hline', y: impRms, color: 'muted', label: `RMS ${formatNumber(impRms, 3)}`, labelAt: 'start', labelBelow: true },
      ],
      x: { range: [0, 50], ticks: [0, 10, 20, 30, 40, 50], label: '시간 [ms]' },
      y: { range: [-8, 8.5], ticks: [-8, -4, 0, 4, 8], label: '가속도 [m/s²]' },
      height: 210,
    },
  ],
};

// 그림 6 — 같은 속도 5 mm/s RMS를 변위·가속도로 보면 (log-log)
const V_RMS = 5;
const lf = grid(0, 4, 81);
const dispPp = lf.map((l) => convertSine({ value: V_RMS, unit: 'mm/s', detector: 'rms' }, { unit: 'um', detector: 'pp' }, 10 ** l));
const accPk = lf.map((l) => convertSine({ value: V_RMS, unit: 'mm/s', detector: 'rms' }, { unit: 'g', detector: 'pk' }, 10 ** l));
const fLabels = [{ value: 0, label: '1' }, { value: 1, label: '10' }, { value: 2, label: '100' }, { value: 3, label: '1k' }, { value: 4, label: '10k' }];
const marks = [10, 100, 1000];
const dAt = (f: number) => convertSine({ value: V_RMS, unit: 'mm/s', detector: 'rms' }, { unit: 'um', detector: 'pp' }, f);
const aAt = (f: number) => convertSine({ value: V_RMS, unit: 'mm/s', detector: 'rms' }, { unit: 'g', detector: 'pk' }, f);
const logPanel = (title: string, y: number[], color: 'c1' | 'c3', yr: [number, number], yLabels: { value: number; label: string }[], at: (f: number) => number, unit: string, last: boolean): FigPanel => ({
  title,
  series: [{ x: lf, y: y.map(Math.log10), color, width: 2.4 }],
  annotations: marks.map((f): FigAnnotation => ({ type: 'point', x: Math.log10(f), y: Math.log10(at(f)), color: 'warn', label: `${f >= 1000 ? `${f / 1000}k` : f} Hz: ${formatNumber(at(f), 3)} ${unit}`, dx: 8, dy: color === 'c1' ? -8 : 14 })),
  x: last ? { range: [0, 4], ticks: [0, 1, 2, 3, 4], tickLabels: fLabels, label: '주파수 [Hz] (로그 눈금)' } : { range: [0, 4], ticks: [0, 1, 2, 3, 4], tickLabels: fLabels },
  y: { range: yr, ticks: yLabels.map((t) => t.value), tickLabels: yLabels },
  height: 165,
});
export const sameVelocity: FigureSpec = {
  id: 'fig-p2-7-6',
  caption: `그림 6. 속도가 늘 ${V_RMS} mm/s RMS인 정현파 진동을 주파수만 바꿔 가며 변위(µm Peak-Peak, 파랑)와 가속도(g Peak, 초록)로 바꿨다. 두 축 모두 로그 눈금이다. 변위는 주파수에 반비례해 10 Hz에서 ${formatNumber(dAt(10), 3)} µm지만 1 kHz에서는 ${formatNumber(dAt(1000), 3)} µm로 작아지고, 가속도는 주파수에 비례해 10 Hz의 ${formatNumber(aAt(10), 2)} g가 1 kHz에서 ${formatNumber(aAt(1000), 3)} g가 된다. 같은 진동이라도 낮은 주파수는 변위로, 높은 주파수는 가속도로 볼 때 숫자가 커서 잘 보인다.`,
  panels: [
    logPanel('변위 [µm Peak-Peak]', dispPp, 'c1', [-1, 4], [-1, 0, 1, 2, 3, 4].map((v) => ({ value: v, label: String(10 ** v) })), dAt, 'µm', false),
    logPanel('가속도 [g Peak]', accPk, 'c3', [-3, 2], [-3, -2, -1, 0, 1, 2].map((v) => ({ value: v, label: String(10 ** v) })), aAt, 'g', true),
  ],
};

// 그림 7 — 선형 축 vs dB: 작은 성분은 dB에서 보인다
const machN = Math.round(2.56 * MACHINE.lor);
const mach = scaledSpectrum(acquire({ components: machineComponents() }, { fs: MACHINE.fs, n: machN }), { window: 'hann' });
const machRms = Array.from(mach.power, (p) => Math.sqrt(p) * MM);
const machDb = machRms.map((a) => 20 * Math.log10(Math.max(a, 1e-12)));
const near = (f: number) => {
  const k = Math.round(f / mach.df);
  let best = k;
  for (let j = k - 2; j <= k + 2; j++) if (machRms[j] > machRms[best]) best = j;
  return best;
};
const smallK = near(MACHINE.smallFreq);
const small2K = near(2 * MACHINE.smallFreq);
const x1K = near(MACHINE.x1);
const machView = sliceF(mach, mach.df, 0, 320, machRms);
const machViewDb = sliceF(mach, mach.df, 0, 320, machDb);
const mTicks = [0, 25, 50, 75, 100, 125, 147, 200, 250, 294];
export const linearVsDb: FigureSpec = {
  id: 'fig-p2-7-7',
  caption: `그림 7. 1X(25 Hz)와 그 정수배 성분 넷, 그리고 1X의 정수배가 아닌 작은 성분 두 개(147 Hz, 294 Hz)가 섞인 속도 스펙트럼 (1600 라인, Hann). 위: 선형 축 — 1X ${formatNumber(machRms[x1K], 3)} mm/s RMS 옆에서 147 Hz의 ${formatNumber(machRms[smallK], 2)} mm/s는 막대가 보이지 않는다. 아래: 같은 스펙트럼을 dB(0 dB = 1 mm/s RMS)로 그리면 1X ${formatNumber(machDb[x1K], 2)} dB, 147 Hz ${formatNumber(machDb[smallK], 3)} dB, 294 Hz ${formatNumber(machDb[small2K], 3)} dB가 잡음 바닥 위에 또렷이 선다. 크기 차이가 수백 배인 성분을 한 화면에 보려면 dB가 필요하다.`,
  panels: [
    {
      title: '선형 축 (mm/s RMS)',
      series: [{ x: machView.x, y: machView.y, color: 'c1', width: 1.4 }],
      annotations: [{ type: 'vline', x: MACHINE.smallFreq, color: 'warn', dash: true, label: '147 Hz' }],
      x: { range: [0, 320], ticks: 'none' },
      y: { range: [0, 2.4], ticks: [0, 0.5, 1, 1.5, 2] },
      height: 130,
    },
    {
      title: 'dB (0 dB = 1 mm/s RMS)',
      series: [{ x: machViewDb.x, y: machViewDb.y, color: 'c1', width: 1.2 }],
      annotations: [
        { type: 'vline', x: MACHINE.smallFreq, color: 'warn', dash: true },
        { type: 'point', x: mach.frequency[smallK], y: machDb[smallK], color: 'warn', label: `${formatNumber(machDb[smallK], 3)} dB`, dx: 8, dy: -6 },
      ],
      x: { range: [0, 320], ticks: mTicks, label: '주파수 [Hz]' },
      y: { range: [-80, 15], ticks: [-80, -60, -40, -20, 0], label: 'dB' },
      height: 165,
    },
  ],
};

/** 본문 숫자 확인용 (테스트에서 사용) */
export const P16_VALUES = {
  lowFloorDb,
  highFloorDb,
  lowFloorTheoryDb,
  highFloorTheoryDb,
  toneDbLow: toneDb(LOW),
  toneDbHigh: toneDb(HIGH),
  lowBandSum: lowBand.sum,
  highBandSum: highBand.sum,
  bandTheory,
  psdFloorLowDb: db10(floorPsd(LOW) * MM * MM),
  psdFloorHighDb: db10(floorPsd(HIGH) * MM * MM),
  psdFloorTheoryDb,
  tonePsdLowDb: tonePsdDb(LOW),
  tonePsdHighDb: tonePsdDb(HIGH),
  totalWith,
  totalWithout,
  timeRmsMm,
  impPeak,
  impRms,
  impDerived,
  impCf,
  machX1Db: machDb[x1K],
  machSmallDb: machDb[smallK],
  machSmall2Db: machDb[small2K],
  machSmallRms: machRms[smallK],
};
