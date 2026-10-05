import { useEffect, useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { averagePower, frameLayout, overlapPowerCv, splitOverlappingFrames, vectorAverage, type PowerAverageMode } from '../../lib/dsp/average';
import type { ComplexSpectrum } from '../../lib/dsp/fft';
import { createRng } from '../../lib/dsp/random';
import { acquire } from '../../lib/dsp/sampling';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import { createWindow, type WindowType } from '../../lib/dsp/window';

/**
 * LAB-AVG-01 평균화 (P1-5, Contents §5-1).
 * 본문 그림(src/figures/p1-5.ts)과 같은 신호·시드를 쓴다: 32 Hz 0.025 mm/s Peak(잡음 바닥보다 작음),
 * 70 Hz 0.07 mm/s Peak(바닥보다 조금 큼), 백색 잡음. 페이지의 절마다 다른 시작 상태로 놓을 수 있다.
 */

type Mode = PowerAverageMode | 'vector';
type Scenario = 'steady' | 'changing' | 'transient' | 'runup';
const FS = 512;
const N = 512;
const TONE = 32;
const AMP = 0.000025; // 속도 [m/s], 표시 변환만 mm/s
const TONE2 = 70;
const AMP2 = 0.00007;
const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'linear', label: '파워(RMS) 평균' },
  { value: 'exponential', label: '지수 평균' },
  { value: 'peakHold', label: '피크 홀드' },
  { value: 'vector', label: '벡터 평균' },
];
const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: 'steady', label: '일정: 70·32 Hz 성분 + 잡음' },
  { value: 'changing', label: '32 Hz가 서서히 커짐' },
  { value: 'transient', label: '92 Hz가 잠깐 커짐' },
  { value: 'runup', label: '회전수 올리기 (20→120 Hz)' },
];
const WINDOWS: { value: WindowType; label: string }[] = [
  { value: 'hann', label: 'Hann' }, { value: 'uniform', label: '윈도우 없음 (Uniform)' },
  { value: 'flatTop', label: 'Flat top' }, { value: 'blackmanHarris', label: 'Blackman-Harris' },
];
const clean = (value: number) => Math.abs(value) < 1e-12 ? 0 : value;
const mmAmplitude = (power: ArrayLike<number>) =>
  Float64Array.from(power, (p) => clean(1000 * Math.sqrt(Math.max(0, p))));

function complexPower(frame: ComplexSpectrum): Float64Array {
  return frame.real.map((re, k) => re ** 2 + frame.imag[k] ** 2);
}

function average(frames: readonly ComplexSpectrum[], mode: Mode, alpha: number): Float64Array {
  return mode === 'vector'
    ? complexPower(vectorAverage(frames))
    : averagePower(frames.map(complexPower), mode, alpha);
}

/** ACF로 정규화한 단일측 RMS 복소 성분. DC·나이퀴스트는 sqrt(2)로 나누지 않는다. */
function rmsPhasors(x: Float64Array, window: Float64Array, timeError = 0): ComplexSpectrum {
  const spectrum = singleSidedSpectrum({ fs: FS, x }, { window });
  const real = new Float64Array(spectrum.amplitude.length);
  const imag = new Float64Array(real.length);
  for (let k = 0; k < real.length; k++) {
    const amplitude = spectrum.amplitude[k] / (k === 0 || k === N / 2 ? 1 : Math.SQRT2);
    if (amplitude === 0) continue; // 0 bin의 NaN 위상 제외
    const phase = spectrum.phase[k] + 2 * Math.PI * spectrum.frequency[k] * timeError;
    real[k] = amplitude * Math.cos(phase);
    imag[k] = amplitude * Math.sin(phase);
  }
  return { real, imag };
}

/** 하나의 잡음 수집을 실제로 분할해 겹치는 샘플을 공유한다. 프레임마다 같은 잡음을 다시 만들지 않는다. */
function prepare(count: number, overlap: number, windowType: WindowType, sigma: number, scenario: Scenario, triggered: boolean) {
  const layout = frameLayout(N, count, overlap);
  const duration = layout.totalSamples / FS;
  const noise = acquire({ components: [{ type: 'noise', rms: sigma, seed: 20261002 }] }, { fs: FS, n: layout.totalSamples });
  const signal = acquire(
    { components: [{ type: 'sine', freq: TONE, amp: AMP, phase: 0.3 }] },
    { fs: FS, n: layout.totalSamples },
  );
  const second = scenario === 'steady'
    ? acquire({ components: [{ type: 'sine', freq: TONE2, amp: AMP2, phase: 1.1 }] }, { fs: FS, n: layout.totalSamples }).x
    : undefined;
  for (let i = 0; i < signal.x.length; i++) {
    const t = i / FS;
    if (scenario === 'changing') signal.x[i] *= 0.2 + 3.8 * t / duration;
    if (scenario === 'transient') {
      signal.x[i] += 0.0009 * Math.exp(-0.5 * ((t - 0.45 * duration) / 0.15) ** 2) * Math.cos(2 * Math.PI * 92 * t);
    }
    if (scenario === 'runup') signal.x[i] = 0.00025 * Math.cos(2 * Math.PI * (20 * t + 50 * t ** 2 / duration));
    if (second) signal.x[i] += second[i];
    signal.x[i] += noise.x[i];
  }
  const window = createWindow(windowType, N);
  const noiseFrames = splitOverlappingFrames(noise.x, N, overlap).frames;
  const frames = splitOverlappingFrames(signal.x, N, overlap).frames;
  const jitter = createRng(317);
  const data: ComplexSpectrum[] = [];
  const noiseData: ComplexSpectrum[] = [];
  for (let m = 0; m < count; m++) {
    // 트리거 해제: 프레임 기준 시각이 흩어진 수집의 위상 불확실성을 모사한다.
    const timeError = triggered ? 0 : jitter.uniform() / TONE;
    data.push(rmsPhasors(frames[m], window, timeError));
    noiseData.push(rmsPhasors(noiseFrames[m], window, timeError));
  }
  const s1 = window.reduce((sum, w) => sum + w, 0);
  const s2 = window.reduce((sum, w) => sum + w ** 2, 0);
  return {
    data, noiseData, window, hop: layout.hop,
    frequency: Float64Array.from({ length: N / 2 + 1 }, (_, k) => k * FS / N),
    noisePower: 2 * sigma ** 2 * s2 / s1 ** 2,
  };
}

/** 잡음만 분리한 검증 대역. 윈도우로 인접 bin이 상관되므로 5 bin 간격으로 읽는다. */
function noiseStats(power: Float64Array) {
  const values = Array.from({ length: 37 }, (_, i) => power[60 + i * 5]);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const std = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
  return { mean, std };
}

function independentStd(mode: Mode, count: number, alpha: number) {
  if (mode === 'linear') return 1 / Math.sqrt(count);
  if (mode === 'vector') return 1 / count; // 평균 파워와 std 모두 1/M, CV 자체는 1
  if (mode === 'exponential') {
    const firstWeightSquared = (1 - alpha) ** (2 * (count - 1));
    return Math.sqrt(firstWeightSquared + alpha / (2 - alpha) * (1 - firstWeightSquared));
  }
  return NaN;
}

export interface AveragingLabProps {
  initialMode?: Mode;
  initialScenario?: Scenario;
  initialCount?: number;
  initialOverlap?: 0 | 0.5 | 0.75;
}

export default function AveragingLab({ initialMode = 'linear', initialScenario = 'steady', initialCount = 64, initialOverlap = 0 }: AveragingLabProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [target, setTarget] = useState(initialCount);
  const [overlap, setOverlap] = useState<number>(initialOverlap);
  const [windowType, setWindow] = useState<WindowType>('hann');
  const [sigmaMm, setSigma] = useState(0.4);
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [triggered, setTriggered] = useState(true);
  const [count, setCount] = useState(initialCount);
  const [playing, setPlaying] = useState(false);
  const shown = Math.min(count, target);
  const alpha = 1 / target;

  useEffect(() => { setCount(target); setPlaying(false); }, [target, overlap, windowType, sigmaMm, scenario, triggered, mode]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setCount((m) => Math.min(target, m + 1)), 250);
    return () => window.clearInterval(timer);
  }, [playing, target]);
  useEffect(() => { if (count >= target) setPlaying(false); }, [count, target]);

  const data = useMemo(() => prepare(target, overlap, windowType, sigmaMm / 1000, scenario, triggered),
    [target, overlap, windowType, sigmaMm, scenario, triggered]);
  const view = useMemo(() => {
    const averaged = average(data.data.slice(0, shown), mode, alpha);
    const current = complexPower(data.data[shown - 1]);
    const noise = noiseStats(average(data.noiseData.slice(0, shown), mode, alpha));
    const points = [1, 2, 4, 8, 16, 32, 64, 128, 256].filter((m) => m <= shown);
    if (!points.includes(shown)) points.push(shown);
    const measured = points.map((m) => noiseStats(average(data.noiseData.slice(0, m), mode, alpha)));
    const normalize = (x: number) => data.noisePower > 0 ? x / data.noisePower : 0;
    const theoryLevel = mode === 'vector' ? points.map((m) => 1 / m) : points.map(() => 1);
    const levelSeries: PlotSeries[] = [
      { x: points, y: measured.map((s) => normalize(s.mean)), name: '잰 값', mode: 'lines+markers' },
    ];
    if (mode !== 'peakHold') levelSeries.push({ x: points, y: theoryLevel, name: mode === 'vector' ? '이론: 1/M로 내려감' : '이론: 1에 머묾', dash: 'dash' });
    const stdSeries: PlotSeries[] = [
      { x: points, y: measured.map((s) => normalize(s.std)), name: '잰 값', mode: 'lines+markers' },
      { x: points, y: points.map((m) => 1 / Math.sqrt(m)), name: '겹치지 않은 프레임의 이론 1/√M', dash: 'dash' },
    ];
    if (mode === 'linear' && overlap > 0) stdSeries.push({
      x: points, y: points.map((m) => overlapPowerCv(data.window, m, data.hop)), name: '겹친 프레임의 이론', dash: 'dot',
    });
    if (mode === 'vector' || mode === 'exponential') stdSeries.push({
      x: points, y: points.map((m) => independentStd(mode, m, alpha)), name: '이 평균 방식의 이론', dash: 'dot',
    });
    return {
      noise, levelSeries, stdSeries,
      tone: Math.sqrt(averaged[TONE]) * 1000,
      tone2: Math.sqrt(averaged[TONE2]) * 1000,
      spectrumSeries: [
        { x: data.frequency, y: mmAmplitude(current), name: '지금 프레임', opacity: 0.55, width: 1 },
        { x: data.frequency, y: mmAmplitude(averaged), name: String(shown) + '개 프레임 평균', width: 2 },
      ] as PlotSeries[],
    };
  }, [data, shown, mode, alpha, overlap]);

  const duration = frameLayout(N, shown, overlap).totalSamples / FS;
  const modeFormula = mode === 'linear'
    ? '\\bar S_k = \\frac{1}{' + shown + '}\\sum_{m=1}^{' + shown + '}S_{m,k}'
    : mode === 'exponential'
      ? '\\bar S_m=(1-\\alpha)\\bar S_{m-1}+\\alpha S_m,\\quad \\alpha = 1/' + target
      : mode === 'peakHold'
        ? '\\bar S_k=\\max_{1\\le m\\le ' + shown + '}S_{m,k}'
        : '\\bar X_k=\\frac{1}{' + shown + '}\\sum_{m=1}^{' + shown + '}X_{m,k}';
  const cvTheory = mode === 'linear' ? overlapPowerCv(data.window, shown, data.hop) : undefined;
  const steadyClean = scenario === 'steady' && sigmaMm === 0 && (mode !== 'vector' || triggered);

  return (
    <LabFrame id="LAB-AVG-01" title="평균화: 잡음 바닥의 높이와 흔들림"
      controls={<>
        <ParamSelect label="평균 방식" value={mode} options={MODE_OPTIONS} onChange={setMode} />
        <ParamSelect label="신호" value={scenario} options={SCENARIOS} onChange={setScenario} />
        <ParamSlider label="평균할 프레임 수 M" value={target} min={1} max={256} step={1} onChange={setTarget} />
        <ParamSelect label="오버랩 r" value={overlap}
          options={[{ value: 0, label: '0 % (겹치지 않음)' }, { value: 0.5, label: '50 %' }, { value: 0.75, label: '75 %' }]} onChange={setOverlap} />
        <ParamSelect label="윈도우" value={windowType} options={WINDOWS} onChange={setWindow} />
        <ParamSlider label="잡음 크기 σ" value={sigmaMm} min={0} max={1} step={0.05} unit="mm/s RMS" format={(v) => v.toFixed(2)} onChange={setSigma} />
        <ParamToggle label="프레임 시작을 회전에 맞춤 (트리거)" checked={triggered} onChange={setTriggered}
          disabled={mode !== 'vector'} hint="벡터 평균에서만 의미가 있습니다. 끄면 프레임마다 시작 시각이 제각각입니다." />
        <div className="param">
          <span>프레임 재생 (지금 {shown}/{target})</span>
          <button className="lab-button" type="button" onClick={() => {
            if (playing) setPlaying(false);
            else { if (shown >= target) setCount(1); setPlaying(true); }
          }}>{playing ? '일시정지' : shown < target ? '재생 계속' : '처음부터 재생'}</button>
          <button className="lab-button" type="button" onClick={() => { setPlaying(false); setCount(target); }}>전체 결과 보기</button>
        </div>
      </>}
      formulas={<>
        <Formula display tex={modeFormula} />
        {mode === 'vector' && <Formula display tex={'A_{rms,k}=\\lvert\\bar X_k\\rvert'} />}
        <Formula display tex={'T_{tot}=T[1+(M-1)(1-r)] = 1\\times[1+(' + shown + '-1)(1-' + overlap + ')] = ' + texNumber(duration) + '\\ \\mathrm{s}'} />
        <p>S는 bin 하나의 파워(RMS 진폭의 제곱), X는 크기와 위상을 함께 담은 값(화살표)입니다. 표시할 때는 제곱근을 취해 mm/s RMS로 바꿉니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: '평균한 프레임 수', value: shown },
        { label: '총 측정 시간', value: duration, unit: 's' },
        { label: '70 Hz 읽음값', value: clean(view.tone2), unit: 'mm/s RMS',
          theory: steadyClean ? clean(AMP2 * 1000 / Math.SQRT2) : undefined },
        { label: '32 Hz 읽음값', value: clean(view.tone), unit: 'mm/s RMS',
          theory: steadyClean ? clean(AMP * 1000 / Math.SQRT2) : undefined },
        { label: '잡음 바닥의 평균 높이 (파워)', value: clean(view.noise.mean * 1e6), unit: '(mm/s)²' },
        { label: '잡음 바닥의 흔들림 (표준편차 ÷ 평균)', value: view.noise.mean > 0 ? clean(view.noise.std / view.noise.mean) : NaN, theory: sigmaMm > 0 ? cvTheory : undefined },
        ...(cvTheory === undefined ? [] : [{ label: '같은 흔들림을 내는 독립 프레임 수', value: 1 / cvTheory ** 2 }]),
      ]} />}
      tasks={[
        { question: '파워 평균에서 M = 1 → 64로 바꾸면 잡음 바닥이 내려갈까요?',
          answer: '바닥의 평균 높이는 그대로이고 흔들림만 1 → 약 0.125로 줄어듭니다. 그래서 바닥보다 조금 큰 70 Hz는 또렷해지지만, 바닥보다 작은 32 Hz는 끝내 드러나지 않습니다.' },
        { question: '벡터 평균으로 바꾼 뒤 트리거를 끄면 성분은 어떻게 될까요?',
          answer: '트리거가 있으면 잡음 바닥이 약 1/8(M = 64)로 내려가 32 Hz가 드러납니다. 끄면 성분의 방향도 프레임마다 달라져 성분까지 상쇄됩니다.' },
        { question: 'M = 16, Hann에서 오버랩을 0 → 75 %로 바꾸면 총 측정 시간과 흔들림은?',
          answer: '총 측정 시간은 16 s → 4.75 s입니다. 흔들림은 겹치지 않은 16개(0.25)보다 조금 큰 약 0.34로, 겹치지 않은 독립 프레임 약 8.6개에 해당합니다.' },
        { question: '회전수 올리기 신호에서 피크 홀드를 고르면 무엇이 남을까요?',
          answer: '1X가 지나간 주파수마다 가장 컸던 값이 남아 20 ~ 120 Hz에 걸친 띠가 됩니다. 지나간 최대값이지 지금 값이 아닙니다. 잡음이 우연히 컸던 순간도 함께 붙잡습니다.' },
      ]}
      footer={<>
        <p>프레임 하나 = 1초 (N = 512, f_s = 512 Hz, Δf = 1 Hz). 잡음은 시드가 고정되어 같은 설정은 같은 결과입니다. 잡음 통계는 신호에서 떼어 낸 잡음만으로 60 ~ 240 Hz를 5 bin 간격으로 읽은 값이라, 이론선과 조금 어긋납니다.</p>
        <p>{mode === 'vector' && !triggered ? '트리거 해제: 프레임마다 시작 시각이 흩어진 수집을 흉내 냅니다. 성분도 평균에서 줄어듭니다.' : scenario === 'runup' ? '회전수 올리기: 1X가 20 → 120 Hz로 움직입니다. 트리거가 있어도 주파수가 바뀌는 성분은 매번 같은 화살표가 아닙니다.' : '70 Hz와 32 Hz 성분은 1초 프레임에 정수 주기가 들어가 프레임 시작에 동기입니다.'}
          {' '}겹치지 않은 프레임의 이론 흔들림 1/√M = {formatNumber(1 / Math.sqrt(shown))}.</p>
      </>}
    >
      <h4>지금 프레임 vs 평균 스펙트럼</h4>
      <Plot series={view.spectrumSeries} x={{ label: '주파수 [Hz]', range: [0, 180] }}
        y={{ label: '진폭 [mm/s RMS]' }} height={310} ariaLabel="지금 프레임과 평균 스펙트럼" />
      <h4>잡음 바닥의 평균 높이 (처음 = 1)</h4>
      <Plot series={view.levelSeries} x={{ label: '평균한 프레임 수 M' }}
        y={{ label: '평균 높이 (파워)', range: mode === 'peakHold' ? undefined : [0, 1.5] }} height={250} ariaLabel="평균 횟수에 따른 잡음 바닥의 평균 높이" />
      <h4>잡음 바닥의 흔들림 (처음 = 1)</h4>
      <Plot series={view.stdSeries} x={{ label: '평균한 프레임 수 M' }}
        y={{ label: '흔들림 (표준편차 ÷ 처음 평균)' }} height={250} ariaLabel="평균 횟수에 따른 잡음 바닥의 흔들림" />
    </LabFrame>
  );
}
