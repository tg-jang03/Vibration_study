import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import {
  calculateResolution,
  minSeparationBins,
  separatedBins,
} from '../../lib/dsp/resolution';
import { acquire } from '../../lib/dsp/sampling';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import type { WindowType } from '../../lib/dsp/window';

/**
 * LAB-RES-01 분해능: 두 성분 분리 (P1-3, Contents §5-1).
 *
 * 목적:
 * Δf · T = 1의 기본 관계와, "가까운 두 주파수 성분을 분리하려면 측정 시간 T가 길어야 한다"는
 * 신호처리의 대원칙을 현장 사례(1X vs 2LF, Oil whirl, 베어링 측대역)를 통해 체감한다.
 */

type PresetKey = 'presetA' | 'presetB' | 'presetC' | 'presetD' | 'custom';

const PRESET_OPTIONS: ParamOption<PresetKey>[] = [
  { value: 'presetA', label: '(a) 3600 rpm: 1X(60 Hz) vs 2×LF(120 Hz) [쉬움]' },
  { value: 'presetB', label: '(b) 2극 동기발전기: 1X(60 Hz) vs LF(60 Hz) [동일 주파수 분리불가]' },
  { value: 'presetC', label: '(c) 3600 rpm: Oil whirl 0.42X(25.2 Hz) vs 0.48X(28.8 Hz)' },
  { value: 'presetD', label: '(d) 300 rpm(5 Hz) 저속축: BPFI(36 Hz) ± 1X(5 Hz) 측대역' },
  { value: 'custom', label: '직접 파라미터 조작' },
];

const FMAX_OPTIONS: ParamOption<number>[] = [
  { value: 100, label: '100 Hz' },
  { value: 200, label: '200 Hz' },
  { value: 500, label: '500 Hz' },
  { value: 1000, label: '1000 Hz' },
  { value: 2000, label: '2000 Hz' },
  { value: 5000, label: '5000 Hz' },
];

const LOR_OPTIONS: ParamOption<number>[] = [
  { value: 100, label: '100 line' },
  { value: 200, label: '200 line' },
  { value: 400, label: '400 line (표준)' },
  { value: 800, label: '800 line' },
  { value: 1600, label: '1600 line' },
  { value: 3200, label: '3200 line' },
  { value: 6400, label: '6400 line' },
];

const WINDOW_OPTIONS: ParamOption<WindowType>[] = [
  { value: 'hann', label: 'Hann (메인로브 ±2 bin, 범용 권장)' },
  { value: 'uniform', label: 'Uniform (메인로브 ±1 bin, 좁지만 누설 큼)' },
  { value: 'flatTop', label: 'Flat top (메인로브 ±5 bin, 진폭정밀, 분해능 나쁨)' },
];

export default function ResolutionLab() {
  const [preset, setPreset] = useState<PresetKey>('presetC');
  const [fmax, setFmax] = useState(1000);
  const [lor, setLor] = useState(400);
  const [f1, setF1] = useState(25.2);
  const [f2, setF2] = useState(28.8);
  const [a1, setA1] = useState(1.0);
  const [a2, setA2] = useState(0.8);
  const [windowType, setWindowType] = useState<WindowType>('hann');
  const [zoomRegion, setZoomRegion] = useState(true);
  const [showBinMarkers, setShowBinMarkers] = useState(true);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    switch (key) {
      case 'presetA':
        setFmax(500);
        setLor(400);
        setF1(60);
        setF2(120);
        setA1(1.0);
        setA2(0.5);
        setZoomRegion(false);
        break;
      case 'presetB':
        setFmax(200);
        setLor(400);
        setF1(60);
        setF2(60);
        setA1(1.0);
        setA2(1.0);
        setZoomRegion(true);
        break;
      case 'presetC':
        setFmax(1000);
        setLor(400);
        setF1(25.2);
        setF2(28.8);
        setA1(1.0);
        setA2(0.8);
        setZoomRegion(true);
        break;
      case 'presetD':
        setFmax(2000);
        setLor(400);
        setF1(36);
        setF2(41);
        setA1(1.0);
        setA2(0.6);
        setZoomRegion(true);
        break;
      case 'custom':
        break;
    }
  };

  // 분해능 기본 계산
  const metrics = useMemo(() => calculateResolution({ fmax, lor }), [fmax, lor]);
  const binDiff = useMemo(() => separatedBins(f1, f2, metrics.deltaF), [f1, f2, metrics.deltaF]);
  const reqBins = useMemo(() => {
    if (windowType === 'uniform') return minSeparationBins('uniform');
    if (windowType === 'flatTop') return minSeparationBins('flatTop');
    return minSeparationBins('hann');
  }, [windowType]);

  const isSeparable = f1 !== f2 && binDiff >= reqBins;

  // 스펙트럼 계산: FFT 크기는 2의 거듭제곱으로 제로패딩 없이 n에 맞춤
  const specData = useMemo(() => {
    // 2.56 * lor에 가장 가까운 2의 거듭제곱
    let fftSize = 256;
    while (fftSize < metrics.n) fftSize *= 2;

    const { x } = acquire(
      {
        components: [
          { type: 'sine', freq: f1, amp: a1 },
          { type: 'sine', freq: f2, amp: a2 },
          { type: 'noise', rms: 0.01, seed: 42 },
        ],
      },
      { fs: metrics.fs, n: metrics.n },
    );

    const spec = singleSidedSpectrum(
      { fs: metrics.fs, x },
      { fftSize, window: windowType },
    );

    return spec;
  }, [f1, f2, a1, a2, metrics, windowType]);

  // 플롯 X 범위 결정
  const xRange = useMemo<[number, number]>(() => {
    if (!zoomRegion) return [0, fmax];
    const center = (f1 + f2) / 2;
    const span = Math.max(15, Math.abs(f1 - f2) * 4, metrics.deltaF * 20);
    return [Math.max(0, center - span / 2), Math.min(fmax, center + span / 2)];
  }, [zoomRegion, f1, f2, fmax, metrics.deltaF]);

  // 플롯 시리즈 구성
  const specSeries = useMemo<PlotSeries[]>(() => {
    const list: PlotSeries[] = [
      {
        x: specData.frequency,
        y: specData.amplitude,
        name: `스펙트럼 (${windowType}, Δf = ${formatNumber(metrics.deltaF, 3)} Hz)`,
        mode: showBinMarkers ? 'lines+markers' : 'lines',
        color: '#2563eb',
        width: 1.8,
        markerSize: showBinMarkers ? 4 : 0,
      },
      // f1 위치 세로선
      {
        x: [f1, f1],
        y: [0, Math.max(a1, a2) * 1.15],
        name: `f1 (${formatNumber(f1, 4)} Hz)`,
        mode: 'lines',
        color: '#16a34a',
        dash: 'dash',
        width: 1.5,
      },
    ];

    if (f1 !== f2) {
      list.push({
        x: [f2, f2],
        y: [0, Math.max(a1, a2) * 1.15],
        name: `f2 (${formatNumber(f2, 4)} Hz)`,
        mode: 'lines',
        color: '#ea580c',
        dash: 'dot',
        width: 1.5,
      });
    }

    return list;
  }, [specData, windowType, metrics.deltaF, showBinMarkers, f1, f2, a1, a2]);

  return (
    <LabFrame
      id="LAB-RES-01"
      title="주파수 분해능(Δf)과 두 성분 분리 한계"
      controls={
        <>
          <ParamSelect
            label="현장 사례 프리셋"
            value={preset}
            options={PRESET_OPTIONS}
            onChange={applyPreset}
          />
          <ParamSelect
            label="분석 최대 주파수 F_max"
            value={fmax}
            options={FMAX_OPTIONS}
            onChange={(v) => {
              setFmax(v);
              setPreset('custom');
            }}
          />
          <ParamSelect
            label="스펙트럼 라인 수 LOR"
            value={lor}
            options={LOR_OPTIONS}
            onChange={(v) => {
              setLor(v);
              setPreset('custom');
            }}
          />
          <ParamSelect
            label="윈도우 함수"
            value={windowType}
            options={WINDOW_OPTIONS}
            onChange={(v) => {
              setWindowType(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="성분 1 주파수 f1"
            value={f1}
            min={5}
            max={Math.min(fmax, 500)}
            step={0.1}
            unit=" Hz"
            onChange={(v) => {
              setF1(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="성분 2 주파수 f2"
            value={f2}
            min={5}
            max={Math.min(fmax, 500)}
            step={0.1}
            unit=" Hz"
            onChange={(v) => {
              setF2(v);
              setPreset('custom');
            }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <ParamToggle label="관심 대역 확대 보기" checked={zoomRegion} onChange={setZoomRegion} />
            <ParamToggle label="개별 bin 샘플점 표시" checked={showBinMarkers} onChange={setShowBinMarkers} />
          </div>
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={`\\Delta f = \\dfrac{F_{\\max}}{\\mathrm{LOR}} = \\dfrac{${fmax}}{${lor}} = ${texNumber(metrics.deltaF, 4)}\\ \\mathrm{Hz},\\quad T = \\dfrac{1}{\\Delta f} = ${texNumber(metrics.duration, 3)}\\ \\mathrm{s}`}
          />
          <Formula
            display
            tex={`\\text{두 성분 간격} = |f_1 - f_2| = |${texNumber(f1, 4)} - ${texNumber(f2, 4)}| = ${texNumber(Math.abs(f1 - f2), 3)}\\ \\mathrm{Hz}\\implies \\mathbf{${texNumber(binDiff, 2)}\\ \\text{bin}}`}
          />
          <Formula
            display
            tex={`\\text{분리 판정: } ${
              f1 === f2
                ? '\\text{동일 주파수: FFT로 절대 분리 불가 (전원 차단 시험 등 다른 시험 필요)}'
                : isSeparable
                  ? `\\text{분리 성공} \\quad (\\text{간격 } ${texNumber(binDiff, 4)}\\ \\text{bin} \\ge \\text{필요 } ${texNumber(reqBins, 4)}\\ \\text{bin})`
                  : `\\text{분리 불가(하나의 뭉텅이 피크로 병합)} \\quad (\\text{간격 } ${texNumber(binDiff, 4)}\\ \\text{bin} < \\text{필요 } ${texNumber(reqBins, 4)}\\ \\text{bin})`
            }`}
          />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '분석 최대 주파수 F_max', value: fmax, unit: 'Hz' },
            { label: '라인 수 LOR', value: lor, unit: 'line' },
            { label: '주파수 분해능 Δf', value: metrics.deltaF, unit: 'Hz', sig: 4 },
            { label: '측정 시간 T', value: metrics.duration, unit: 's', sig: 3 },
            { label: '두 성분 주파수 간격', value: Math.abs(f1 - f2), unit: 'Hz', sig: 3 },
            { label: '간격에 해당하는 bin 수', value: binDiff, unit: 'bin', sig: 3 },
            { label: '필요 최소 bin 수 (윈도우 한계)', value: reqBins, unit: 'bin', sig: 2 },
            { label: '전체 시간 샘플 수 N', value: metrics.n, unit: 'pts' },
          ]}
        />
      }
      tasks={[
        {
          question:
            'F_max = 1000 Hz, LOR = 3200 line일 때 주파수 분해능 Δf와 측정 시간 T는 각각 얼마인가요?',
          answer:
            'Δf = 1000 / 3200 = 0.3125 Hz이며, 측정 시간 T = 1 / Δf = 3.2 s입니다! 분해능을 미세하게(0.3 Hz 수준) 쪼개려면 기계가 최소 3.2초 동안 안정적으로 운전되는 신호를 받아야 합니다.',
        },
        {
          question:
            '프리셋 (c) Oil whirl(25.2 Hz vs 28.8 Hz, 간격 3.6 Hz)에서 LOR = 400일 때 두 피크가 분리되나요? 분리하려면 LOR을 얼마로 올려야 할까요?',
          answer:
            'LOR = 400일 때 Δf = 2.5 Hz이므로 간격이 1.44 bin에 불과하여 두 피크가 하나의 넓은 둔덕으로 뭉개져 분리되지 않습니다. LOR을 1600(Δf = 0.625 Hz, 5.76 bin) 이상으로 올리면 두 개의 뾰족한 독립 피크로 선명하게 갈라집니다!',
        },
        {
          question:
            '프리셋 (b) 2극 발전기에서 회전 불평형 1X(60 Hz)와 전기적 라인주파수 LF(60 Hz)는 LOR을 6400으로 극대화하면 분리할 수 있나요?',
          answer:
            '분리할 수 없습니다! 두 성분의 주파수가 수학적으로 완전히 동일하기 때문에 FFT 분해능을 아무리 높여도 하나의 60 Hz 피크로만 보입니다. 현장에서는 발전기 전원을 차단(Trip)했을 때 즉시 사라지면 전기적 결함(LF), 회전수가 서서히 떨어지면서 완만하게 줄면 기계적 불평형(1X)으로 판정합니다.',
        },
      ]}
    >
      <Plot
        series={specSeries}
        x={{ label: '주파수 [Hz]', range: xRange }}
        y={{ label: '진폭 [Pk]', range: [0, Math.max(a1, a2) * 1.25] }}
        height={300}
        ariaLabel="두 성분 분해능 스펙트럼"
      />
    </LabFrame>
  );
}
