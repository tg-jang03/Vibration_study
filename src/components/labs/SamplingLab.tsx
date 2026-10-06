import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { acquire, aliasComponent } from '../../lib/dsp/sampling';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';

/**
 * LAB-SMP-01 샘플링 & 에일리어싱 (P2-3, Contents §5-1).
 *
 * 목적:
 * fs가 신호 주파수의 2배보다 작으면(f > fs/2) 다른 주파수로 접혀 보인다는 것을
 * 시간영역(참 신호 vs 샘플 점 vs 겉보기 정현파)과 주파수영역(스펙트럼 피크)에서 동시에 체감한다.
 */

type PresetKey =
  | 'custom'
  | 'normal'
  | 'alias940'
  | 'alias1060'
  | 'alias1940'
  | 'nyquist0'
  | 'nyquist90';

const PRESET_OPTIONS: ParamOption<PresetKey>[] = [
  { value: 'normal', label: '정상 샘플링 (60 Hz, fs=1000)' },
  { value: 'alias940', label: '940 Hz → 60 Hz로 보임 (f_s − f, 위상 반전)' },
  { value: 'alias1060', label: '1060 Hz → 60 Hz로 보임 (f − f_s)' },
  { value: 'alias1940', label: '1940 Hz → 60 Hz로 보임 (2f_s − f, 위상 반전)' },
  { value: 'nyquist0', label: '나이퀴스트 한계 (500 Hz, 위상 0°)' },
  { value: 'nyquist90', label: '나이퀴스트 소멸 (500 Hz, 위상 90° → 샘플 0)' },
  { value: 'custom', label: '직접 조작 (슬라이더)' },
];

export default function SamplingLab() {
  const [preset, setPreset] = useState<PresetKey>('normal');
  const [freq, setFreq] = useState(60);
  const [fs, setFs] = useState(1000);
  const [phaseDeg, setPhaseDeg] = useState(0);
  const [durationMs, setDurationMs] = useState(50); // ms 단위 (기본 50 ms = 0.05 s)

  // 표시 토글
  const [showTrue, setShowTrue] = useState(true);
  const [showSamples, setShowSamples] = useState(true);
  const [showAlias, setShowAlias] = useState(true);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    switch (key) {
      case 'normal':
        setFreq(60);
        setFs(1000);
        setPhaseDeg(0);
        setDurationMs(50);
        break;
      case 'alias940':
        setFreq(940);
        setFs(1000);
        setPhaseDeg(30);
        setDurationMs(50);
        break;
      case 'alias1060':
        setFreq(1060);
        setFs(1000);
        setPhaseDeg(30);
        setDurationMs(50);
        break;
      case 'alias1940':
        setFreq(1940);
        setFs(1000);
        setPhaseDeg(30);
        setDurationMs(50);
        break;
      case 'nyquist0':
        setFreq(500);
        setFs(1000);
        setPhaseDeg(0);
        setDurationMs(20);
        break;
      case 'nyquist90':
        setFreq(500);
        setFs(1000);
        setPhaseDeg(90);
        setDurationMs(20);
        break;
      case 'custom':
        break;
    }
  };

  const duration = durationMs / 1000;
  const phaseRad = (phaseDeg * Math.PI) / 180;
  const fn = fs / 2;

  // 에일리어스 성분 계산
  const alias = useMemo(() => aliasComponent(freq, phaseRad, fs), [freq, phaseRad, fs]);
  const isAliased = freq > fn;

  // 시간영역 및 스펙트럼 계산
  const viewData = useMemo(() => {
    // 1) 참 신호 (연속 곡선 느낌을 위해 고밀도 600개 점)
    const denseN = 600;
    const tTrue = new Float64Array(denseN);
    const yTrue = new Float64Array(denseN);
    for (let i = 0; i < denseN; i++) {
      const t = (i / (denseN - 1)) * duration;
      tTrue[i] = t;
      yTrue[i] = Math.cos(2 * Math.PI * freq * t + phaseRad);
    }

    // 2) 이산 샘플 점 (fs로 실제 샘플링)
    const nSamples = Math.max(2, Math.floor(duration * fs) + 1);
    const tSamples = new Float64Array(nSamples);
    const ySamples = new Float64Array(nSamples);
    for (let i = 0; i < nSamples; i++) {
      const t = i / fs;
      tSamples[i] = t;
      ySamples[i] = Math.cos(2 * Math.PI * freq * t + phaseRad);
    }

    // 3) 겉보기 에일리어스 정현파 (고밀도 시간 벡터에서 xa(t) 계산)
    const yAlias = new Float64Array(denseN);
    for (let i = 0; i < denseN; i++) {
      const t = tTrue[i];
      yAlias[i] = Math.cos(2 * Math.PI * alias.freq * t + alias.phase);
    }

    // 4) 실제 DFT 스펙트럼 계산 (충분한 길이로 FFT)
    // 분해능을 위해 최소 1024 샘플 수집
    const fftN = 1024;
    const spectrumSamples = acquire(
      { components: [{ type: 'sine', freq, amp: 1.0, phase: phaseRad }] },
      { fs, n: fftN },
    );
    const spec = singleSidedSpectrum(spectrumSamples);

    // 스펙트럼에서 피크 주파수 탐색
    let maxIdx = 0;
    let maxAmp = -1;
    for (let k = 0; k < spec.amplitude.length; k++) {
      if (spec.amplitude[k] > maxAmp) {
        maxAmp = spec.amplitude[k];
        maxIdx = k;
      }
    }
    const peakFreq = spec.frequency[maxIdx];
    const peakAmp = maxAmp;

    return {
      tTrue,
      yTrue,
      tSamples,
      ySamples,
      yAlias,
      specFreq: spec.frequency,
      specAmp: spec.amplitude,
      peakFreq,
      peakAmp,
    };
  }, [freq, fs, phaseRad, duration, alias]);

  // 시간영역 시리즈 구성
  const timeSeries: PlotSeries[] = [];
  if (showTrue) {
    timeSeries.push({
      x: viewData.tTrue,
      y: viewData.yTrue,
      name: `참 신호 x(t) (${freq} Hz)`,
      color: '#3b82f6', // blue
      width: 1.8,
    });
  }
  if (showAlias && isAliased) {
    timeSeries.push({
      x: viewData.tTrue,
      y: viewData.yAlias,
      name: `겉보기 신호 xa(t) (${formatNumber(alias.freq, 4)} Hz)`,
      color: '#ef4444', // red
      dash: 'dash',
      width: 2.2,
    });
  }
  if (showSamples) {
    timeSeries.push({
      x: viewData.tSamples,
      y: viewData.ySamples,
      name: `샘플 점 x[n] (fs=${fs} Hz)`,
      mode: 'markers',
      color: '#f97316', // orange
      markerSize: 7,
    });
  }

  // 스펙트럼 시리즈 구성 (0 ~ fs/2 단일측 피크)
  const specSeries: PlotSeries[] = [
    {
      x: viewData.specFreq,
      y: viewData.specAmp,
      name: '단일측 스펙트럼',
      kind: 'bar',
      color: isAliased ? '#ef4444' : '#3b82f6',
      barWidth: Math.max(1, fs / 1024),
    },
  ];

  return (
    <LabFrame
      id="LAB-SMP-01"
      title="샘플링 & 에일리어싱"
      controls={
        <>
          <ParamSelect
            label="프리셋 시나리오"
            value={preset}
            options={PRESET_OPTIONS}
            onChange={applyPreset}
          />
          <ParamSlider
            label="신호 주파수 f"
            value={freq}
            min={10}
            max={2000}
            step={5}
            unit=" Hz"
            onChange={(v) => {
              setFreq(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="샘플링 주파수 fs"
            value={fs}
            min={100}
            max={3000}
            step={50}
            unit=" Hz"
            onChange={(v) => {
              setFs(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="신호 위상 φ"
            value={phaseDeg}
            min={-180}
            max={180}
            step={5}
            unit="°"
            onChange={(v) => {
              setPhaseDeg(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="시간 표시 범위"
            value={durationMs}
            min={10}
            max={100}
            step={5}
            unit=" ms"
            onChange={setDurationMs}
          />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <ParamToggle label="참 신호 x(t)" checked={showTrue} onChange={setShowTrue} />
            <ParamToggle label="샘플 점 x[n]" checked={showSamples} onChange={setShowSamples} />
            <ParamToggle label="겉보기 신호 xa(t)" checked={showAlias} onChange={setShowAlias} />
          </div>
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={`f_N = \\dfrac{f_s}{2} = \\dfrac{${fs}}{2} = ${texNumber(fn)}\\ \\mathrm{Hz}\\quad \\text{(나이퀴스트 주파수)}`}
          />
          <Formula
            display
            tex={`f_a = |f - k f_s| = |${freq} - ${alias.zone}\\times ${fs}| = ${texNumber(alias.freq)}\\ \\mathrm{Hz}\\quad (${alias.inverted ? '\\text{위상 반전 } -\\varphi' : '\\text{위상 유지 } +\\varphi'})`}
          />
          {isAliased ? (
            <Formula
              display
              tex={`x_a(t) = \\cos(2\\pi \\cdot ${texNumber(alias.freq)} t ${alias.phase >= 0 ? '+' : ''}${texNumber(alias.phase, 2)})\\quad \\text{— 샘플 점들이 이 겉보기 정현파 위에 완벽히 놓임}`}
            />
          ) : (
            <Formula display tex={`f \\le f_N\\quad \\text{— 에일리어싱 없음 (정상 수집)}`} />
          )}
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '입력 신호 주파수 f', value: freq, unit: 'Hz' },
            { label: '샘플링 주파수 fs', value: fs, unit: 'Hz' },
            { label: '나이퀴스트 주파수 fN', value: fn, unit: 'Hz' },
            {
              label: '이론 에일리어스 주파수 fa',
              value: alias.freq,
              theory: alias.freq,
              unit: 'Hz',
            },
            {
              label: '스펙트럼 측정 피크 주파수',
              value: viewData.peakFreq,
              theory: alias.freq,
              unit: 'Hz',
            },
            {
              label: '스펙트럼 피크 진폭',
              value: viewData.peakAmp,
              unit: 'Pk',
              sig: 3,
            },
          ]}
        />
      }
      tasks={[
        {
          question:
            'fs = 1000 Hz에서 신호 주파수가 60 Hz일 때와 940 Hz, 1060 Hz일 때 스펙트럼 피크는 각각 어디에 나타날까요?',
          answer:
            '세 경우 모두 60 Hz에 같은 크기로 나타납니다. 940 Hz = 1000 − 60, 1060 Hz = 1000 + 60이라 둘 다 f_s에서 60 Hz만큼 떨어져 있기 때문입니다. 시간 그래프에서 샘플 점들이 60 Hz 겉보기 정현파(점선) 위에 놓이는 것을 확인하세요.',
        },
        {
          question:
            '940 Hz와 1060 Hz의 샘플 점은 둘 다 60 Hz로 보이는데, 둘 사이에 어떤 차이가 있을까요?',
          answer:
            '위상이 다릅니다. 1060 Hz(f_s보다 위)는 원래 위상 +φ 그대로 보이지만, 940 Hz(f_s보다 아래)는 거울처럼 뒤집혀 접히므로 위상 부호가 바뀐 −φ로 보입니다. 진폭 스펙트럼만 보면 둘은 같습니다.',
        },
        {
          question:
            '신호 주파수를 정확히 나이퀴스트 한계인 f = fs/2 = 500 Hz에 놓고 위상 φ를 0°에서 90°로 바꾸면 샘플 점에 어떤 일이 생기나요?',
          answer:
            'φ = 0°이면 샘플 점이 +1, −1, +1, −1로 꼭대기와 바닥에 찍히지만, φ = 90°이면 모든 점이 0을 지나는 순간에 찍혀 신호가 사라집니다. 그래서 신호 주파수는 f_N과 "같아도" 안 되고 f_N보다 "작아야" 합니다.',
        },
        {
          question:
            '1940 Hz 프리셋을 누르면 왜 여전히 60 Hz로 보일까요?',
          answer:
            '1940 Hz = 2 × 1000 − 60이라 2f_s에서 60 Hz만큼 떨어져 있기 때문입니다. f_N을 넘는 주파수는 f_s, 2f_s, 3f_s … 근처마다 지그재그로 계속 0 ~ f_N 안에 접혀 들어옵니다. 샘플만으로는 진짜와 가짜를 구분할 수 없으므로, 샘플링하기 전에 필터(AAF)로 높은 주파수를 미리 깎아야 합니다.',
        },
      ]}
    >
      <Plot
        series={timeSeries}
        x={{ label: '시간 t [s]', range: [0, duration] }}
        y={{ label: '진폭 x(t)', range: [-1.4, 1.4] }}
        height={280}
        ariaLabel="샘플링 시간영역 파형"
      />
      <Plot
        series={specSeries}
        x={{ label: '주파수 [Hz]', range: [0, fn] }}
        y={{ label: '스펙트럼 진폭 (Pk)', range: [0, 1.2] }}
        height={220}
        ariaLabel="단일측 진폭 스펙트럼 피크"
      />
    </LabFrame>
  );
}
