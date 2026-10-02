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

type Mode = PowerAverageMode | 'vector';
type Scenario = 'steady' | 'changing' | 'transient' | 'runup';
const FS = 512;
const N = 512;
const TONE = 32;
const AMP = 0.000025; // 속도 [m/s], 표시 변환만 mm/s
const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'linear', label: 'RMS(파워) 선형 평균' },
  { value: 'exponential', label: '지수 파워 평균' },
  { value: 'peakHold', label: '피크홀드' },
  { value: 'vector', label: '벡터(트리거 동기) 평균' },
];
const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: 'steady', label: '작은 동기 톤 + 백색 잡음' },
  { value: 'changing', label: '서서히 커지는 톤' },
  { value: 'transient', label: '한 번의 과도 이벤트' },
  { value: 'runup', label: '런업 1X (20 → 120 Hz)' },
];
const WINDOWS: { value: WindowType; label: string }[] = [
  { value: 'uniform', label: 'Uniform' }, { value: 'hann', label: 'Hann' },
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
  const signal = acquire({ components: [{ type: 'sine', freq: TONE, amp: AMP, phase: 0.3 }] }, { fs: FS, n: layout.totalSamples });
  for (let i = 0; i < signal.x.length; i++) {
    const t = i / FS;
    if (scenario === 'changing') signal.x[i] *= 0.2 + 3.8 * t / duration;
    if (scenario === 'transient') {
      signal.x[i] += 0.0009 * Math.exp(-0.5 * ((t - 0.45 * duration) / 0.15) ** 2) * Math.cos(2 * Math.PI * 92 * t);
    }
    if (scenario === 'runup') signal.x[i] = 0.00025 * Math.cos(2 * Math.PI * (20 * t + 50 * t ** 2 / duration));
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

export default function AveragingLab() {
  const [mode, setMode] = useState<Mode>('linear');
  const [target, setTarget] = useState(64);
  const [overlap, setOverlap] = useState(0);
  const [windowType, setWindow] = useState<WindowType>('hann');
  const [sigmaMm, setSigma] = useState(0.4);
  const [scenario, setScenario] = useState<Scenario>('steady');
  const [triggered, setTriggered] = useState(true);
  const [count, setCount] = useState(64);
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
      { x: points, y: measured.map((s) => normalize(s.mean)), name: '측정한 평균 파워', mode: 'lines+markers' },
    ];
    if (mode !== 'peakHold') levelSeries.push({ x: points, y: theoryLevel, name: mode === 'vector' ? '독립 벡터 기준 1/M' : 'RMS·지수 평균의 기대값 1', dash: 'dash' });
    const stdSeries: PlotSeries[] = [
      { x: points, y: measured.map((s) => normalize(s.std)), name: '측정한 파워의 표준편차', mode: 'lines+markers' },
      { x: points, y: points.map((m) => 1 / Math.sqrt(m)), name: '독립 RMS 기준 1/√M', dash: 'dash' },
    ];
    if (mode === 'linear' && overlap > 0) stdSeries.push({
      x: points, y: points.map((m) => overlapPowerCv(data.window, m, data.hop)), name: '오버랩 보정 (RMS 근사)', dash: 'dot',
    });
    if (mode === 'vector' || mode === 'exponential') stdSeries.push({
      x: points, y: points.map((m) => independentStd(mode, m, alpha)), name: '선택한 평균의 독립 기준', dash: 'dot',
    });
    return {
      noise, levelSeries, stdSeries,
      tone: Math.sqrt(averaged[TONE]) * 1000,
      spectrumSeries: [
        { x: data.frequency, y: mmAmplitude(current), name: '현재 프레임', opacity: 0.55, width: 1 },
        { x: data.frequency, y: mmAmplitude(averaged), name: String(shown) + '개 프레임 평균', width: 2 },
      ] as PlotSeries[],
    };
  }, [data, shown, mode, alpha, overlap]);

  const duration = frameLayout(N, shown, overlap).totalSamples / FS;
  const modeFormula = mode === 'linear'
    ? '\\bar S_k = \\frac{1}{' + shown + '}\\sum_{m=1}^{' + shown + '}S_{m,k}'
    : mode === 'exponential'
      ? '\\bar S_m=(1-\\alpha)\\bar S_{m-1}+\\alpha S_m'
      : mode === 'peakHold'
        ? '\\bar S_k=\\max_{1\\le m\\le ' + shown + '}S_{m,k}'
        : '\\bar X_k=\\frac{1}{' + shown + '}\\sum_{m=1}^{' + shown + '}X_{m,k}';
  const cvTheory = mode === 'linear' ? overlapPowerCv(data.window, shown, data.hop) : undefined;

  return (
    <LabFrame id="LAB-AVG-01" title="평균화: 잡음 레벨과 흔들림을 따로 보기"
      controls={<>
        <ParamSelect label="평균 방식" value={mode} options={MODE_OPTIONS} onChange={setMode} />
        <ParamSelect label="신호 프리셋" value={scenario} options={SCENARIOS} onChange={setScenario} />
        <ParamSlider label="평균 횟수 M" value={target} min={1} max={256} step={1} onChange={setTarget} />
        <ParamSelect label="오버랩 r" value={overlap}
          options={[{ value: 0, label: '0 %' }, { value: 0.5, label: '50 %' }, { value: 0.75, label: '75 %' }]} onChange={setOverlap} />
        <ParamSelect label="윈도우" value={windowType} options={WINDOWS} onChange={setWindow} />
        <ParamSlider label="백색 잡음 σ" value={sigmaMm} min={0} max={1} step={0.05} unit="mm/s RMS" format={(v) => v.toFixed(2)} onChange={setSigma} />
        <ParamToggle label="트리거 위상 정렬" checked={triggered} onChange={setTriggered}
          disabled={mode !== 'vector'} hint="벡터 평균에서 동기 톤을 남기려면 위상 기준이 필요합니다." />
        <div className="param">
          <span>프레임 재생 (현재 {shown}/{target})</span>
          <button className="lab-button" type="button" onClick={() => {
            if (playing) setPlaying(false);
            else { if (shown >= target) setCount(1); setPlaying(true); }
          }}>{playing ? '일시정지' : shown < target ? '재생 계속' : '처음부터 재생'}</button>
          <button className="lab-button" type="button" onClick={() => { setPlaying(false); setCount(target); }}>전체 프레임 결과</button>
        </div>
      </>}
      formulas={<>
        <Formula display tex={modeFormula} />
        {mode === 'vector' && <Formula display tex={'A_{rms,k}=|\\bar X_k|'} />}
        {mode === 'exponential' && <Formula display tex={'\\alpha=1/' + target + ',\\quad\\bar S_1=S_1'} />}
        <Formula display tex={'T_{tot}=T[1+(m-1)(1-r)]'} />
        <Formula display tex={'T=1\\ \\mathrm{s},\\quad m=' + shown + ',\\quad r=' + overlap} />
        <Formula display tex={'T_{tot}=' + texNumber(duration) + '\\ \\mathrm{s}'} />
        <Formula display tex={'\\text{독립 RMS 기준:}\\quad\\sigma_{\\bar S}/\\mu_S=1/\\sqrt{' + shown + '}=' + texNumber(1 / Math.sqrt(shown))} />
        <p>파워를 평균한 뒤 제곱근으로 RMS 진폭을 표시합니다. 지수 평균의 α는 목표 M으로 고정합니다.</p>
      </>}
      readouts={<ReadoutTable caption="현재 평균 읽음값" rows={[
        { label: '누적 프레임 m', value: shown },
        { label: '총 측정 시간', value: duration, unit: 's' },
        { label: '32 Hz 읽음값', value: clean(view.tone), unit: 'mm/s RMS',
          theory: scenario === 'steady' && sigmaMm === 0 && (mode !== 'vector' || triggered) ? clean(AMP * 1000 / Math.SQRT2) : undefined },
        { label: '잡음 평균 파워', value: clean(view.noise.mean * 1e6), unit: '(mm/s)²' },
        { label: '잡음 파워 표준편차', value: clean(view.noise.std * 1e6), unit: '(mm/s)²' },
        { label: '흔들림 std/mean', value: view.noise.mean > 0 ? clean(view.noise.std / view.noise.mean) : NaN, theory: sigmaMm > 0 ? cvTheory : undefined },
        ...(cvTheory === undefined ? [] : [{ label: '등가 독립 프레임 (RMS 근사)', value: 1 / cvTheory ** 2 }]),
      ]} />}
      tasks={[
        { question: 'RMS 평균에서 M=1 → 64로 바꾸면 잡음 바닥의 평균 파워가 내려갈까요?',
          answer: '평균 파워는 유지되고 흔들림만 줄어듭니다. 독립 프레임의 std/mean 기준은 1 → 0.125입니다. 한 번의 시드 고정 수집에서는 유한한 bin 수 때문에 측정값이 조금 다릅니다.' },
        { question: '벡터 평균으로 바꾼 뒤 트리거 위상 정렬을 끄면 작은 32 Hz 톤은 어떻게 될까요?',
          answer: '기준 위상이 흩어지면 잡음뿐 아니라 톤도 상쇄될 수 있습니다. 정렬한 독립 프레임에서는 잡음 파워가 1/M, 잡음 진폭이 1/√M로 감소하고 동기 톤은 남습니다.' },
        { question: 'M=16, Hann, 오버랩 0 → 75%: 총 측정 시간과 흔들림은?',
          answer: 'T=1 s에서 16 s → 4.75 s입니다. 그러나 겹친 프레임은 독립이 아니므로 16개의 독립 프레임과 같은 흔들림을 보장하지 않습니다. 오버랩 보정선과 비교하세요.' },
        { question: '런업 1X를 재생하며 피크홀드를 선택하면 무엇이 남을까요?',
          answer: '지나간 주파수별 최대값이 남습니다. 현재 프레임과 달리 넓은 경로를 그립니다. 한 번의 과도 이벤트와 잡음의 최대값도 남으므로 정상 운전 레벨로 해석하면 안 됩니다.' },
      ]}
      footer={<>
        <p>N=512, f_s=512 Hz, Δf=1 Hz. 잡음 시드는 고정되어 같은 설정은 같은 결과입니다. 잡음 통계는 신호에서 분리한 백색 잡음의 60~240 Hz 대역을 5 bin 간격으로 읽은 값입니다.</p>
        <p>곡선은 유한한 bin 표본의 측정값입니다. 독립 이론선은 정상 백색 잡음·DC/나이퀴스트 제외 기준이며, 오버랩에서 그대로 적용할 수 없습니다. σ=0이면 잡음 측정 곡선은 0이고 std/mean은 정의되지 않습니다. 이론선은 비교 기준으로 남습니다.</p>
        <p>{mode === 'vector' && !triggered ? '트리거 해제: 프레임 기준 시각이 흩어진 수집을 모사합니다. 동기 톤도 평균에서 줄어들 수 있습니다.' : scenario === 'runup' ? '런업 성분은 20 → 120 Hz로 변합니다. 트리거가 있어도 주파수가 변하는 성분은 같은 복소 벡터가 아닙니다.' : '기본 동기 톤은 32 Hz이며, 선택한 hop마다 정수 회전 주기가 들어갑니다.'}
          {' '}독립 RMS 기준 {formatNumber(1 / Math.sqrt(shown))}.</p>
      </>}
    >
      <h4>현재 프레임 vs 평균 스펙트럼</h4>
      <Plot series={view.spectrumSeries} x={{ label: '주파수 [Hz]', range: [0, 180] }}
        y={{ label: '진폭 [mm/s RMS]' }} height={310} ariaLabel="현재 프레임과 평균 스펙트럼" />
      <h4>잡음 평균 레벨: 무엇이 내려가나</h4>
      <Plot series={view.levelSeries} x={{ label: '누적 프레임 수 m' }}
        y={{ label: '평균 파워 / 단일 프레임 이론값', range: mode === 'peakHold' ? undefined : [0, 1.5] }} height={250} ariaLabel="평균 횟수에 따른 잡음 평균 파워" />
      <h4>잡음 흔들림: 1/√M과 비교</h4>
      <Plot series={view.stdSeries} x={{ label: '누적 프레임 수 m' }}
        y={{ label: '파워 표준편차 / 단일 프레임 이론값' }} height={250} ariaLabel="평균 횟수에 따른 잡음 파워의 흔들림" />
    </LabFrame>
  );
}