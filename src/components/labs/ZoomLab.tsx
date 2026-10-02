import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { computeZoomSpectrum } from '../../lib/dsp/zoom';
import type { SignalSpec } from '../../lib/dsp/signal';
import type { WindowType } from '../../lib/dsp/window';

/**
 * LAB-ZOOM-01 Zoom FFT (P1-3, Contents §5-1).
 *
 * 목적:
 * 광대역 신호에서 관심 있는 좁은 대역(예: 기어 물림 GMF 주변의 미세 측대역)을
 * 높은 주파수 분해능으로 확대하는 Zoom FFT의 원리와,
 * 분해능 향상에 반드시 수반되는 "측정 시간 T의 증가 대가"를 체감한다.
 */

type PresetKey = 'gearSideband' | 'zoom8' | 'zoom16' | 'zoom1' | 'custom';

const PRESET_OPTIONS: ParamOption<PresetKey>[] = [
  { value: 'zoom8', label: '8배 Zoom (측대역 선명 분리, T = 1.6 s)' },
  { value: 'zoom16', label: '16배 초정밀 Zoom (T = 3.2 s, 16 bin 분리)' },
  { value: 'zoom1', label: '기본 광대역 (Z = 1, 측대역 뭉개짐, T = 0.2 s)' },
  { value: 'custom', label: '직접 파라미터 조작' },
];

const ZOOM_OPTIONS: ParamOption<number>[] = [
  { value: 1, label: '1배 (기본 광대역 스펙트럼, Zoom 미적용)' },
  { value: 2, label: '2배 (대역폭 1000 Hz, Δf = 2.5 Hz)' },
  { value: 4, label: '4배 (대역폭 500 Hz, Δf = 1.25 Hz)' },
  { value: 8, label: '8배 (대역폭 250 Hz, Δf = 0.625 Hz - 권장)' },
  { value: 16, label: '16배 (대역폭 125 Hz, Δf = 0.3125 Hz)' },
  { value: 32, label: '32배 (대역폭 62.5 Hz, Δf = 0.156 Hz)' },
  { value: 64, label: '64배 (대역폭 31.25 Hz, Δf = 0.078 Hz)' },
];

const LOR_OPTIONS: ParamOption<number>[] = [
  { value: 400, label: '400 line (표준)' },
  { value: 800, label: '800 line' },
];

const WINDOW_OPTIONS: ParamOption<WindowType>[] = [
  { value: 'hann', label: 'Hann (표준)' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'flatTop', label: 'Flat top' },
];

export default function ZoomLab() {
  const [preset, setPreset] = useState<PresetKey>('zoom8');
  const [zoomFactor, setZoomFactor] = useState(8);
  const [centerFreq, setCenterFreq] = useState(1200); // GMF 1200 Hz
  const [fmax] = useState(2000); // 기본 2000 Hz
  const [lor, setLor] = useState(400); // 기본 400 line
  const [sidebandDelta, setSidebandDelta] = useState(5.0); // 1X = 5 Hz (300 rpm)
  const [windowType, setWindowType] = useState<WindowType>('hann');

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    switch (key) {
      case 'zoom8':
        setZoomFactor(8);
        setCenterFreq(1200);
        setLor(400);
        setSidebandDelta(5.0);
        break;
      case 'zoom16':
        setZoomFactor(16);
        setCenterFreq(1200);
        setLor(400);
        setSidebandDelta(5.0);
        break;
      case 'zoom1':
        setZoomFactor(1);
        setCenterFreq(1200);
        setLor(400);
        setSidebandDelta(5.0);
        break;
      case 'custom':
        break;
    }
  };

  // 신호 정의: 기어 GMF(1200 Hz, A=1.0) ± 1X 측대역(±5 Hz, A=0.4) + 약한 잡음
  const signalSpec: SignalSpec = useMemo(
    () => ({
      components: [
        { type: 'sine', freq: centerFreq, amp: 1.0 },
        { type: 'sine', freq: centerFreq - sidebandDelta, amp: 0.4 },
        { type: 'sine', freq: centerFreq + sidebandDelta, amp: 0.4 },
        { type: 'noise', rms: 0.005, seed: 77 },
      ],
    }),
    [centerFreq, sidebandDelta],
  );

  // Zoom 계산 수행
  const zoomResult = useMemo(
    () =>
      computeZoomSpectrum(
        signalSpec,
        {
          fmax,
          lor,
          zoomFactor,
          centerFreq,
        },
        windowType,
      ),
    [signalSpec, fmax, lor, zoomFactor, centerFreq, windowType],
  );

  const { metrics, frequency, amplitude, baseSpectrum } = zoomResult;
  const sidebandBins = sidebandDelta / metrics.deltaFZoom;
  const isSeparated = sidebandBins >= 3.5;

  // 1. 기본 광대역 스펙트럼 플롯 (0 ~ F_max)
  const baseSeries = useMemo<PlotSeries[]>(() => {
    const list: PlotSeries[] = [
      {
        x: baseSpectrum.frequency,
        y: baseSpectrum.amplitude,
        name: `기본 스펙트럼 (Δf = ${formatNumber(metrics.deltaFBase, 4)} Hz, T = ${formatNumber(metrics.durationBase, 4)} s)`,
        mode: 'lines',
        color: '#64748b', // slate
        width: 1.5,
      },
      // Zoom 대역 하한
      {
        x: [metrics.fMin, metrics.fMin],
        y: [0, 1.2],
        name: `Zoom 대역 (${formatNumber(metrics.fMin, 4)} ~ ${formatNumber(metrics.fMax, 4)} Hz)`,
        mode: 'lines',
        color: '#dc2626',
        dash: 'dash',
        width: 1.5,
      },
      // Zoom 대역 상한
      {
        x: [metrics.fMax, metrics.fMax],
        y: [0, 1.2],
        name: 'Zoom 상한',
        mode: 'lines',
        color: '#dc2626',
        dash: 'dash',
        width: 1.5,
        hideInLegend: true,
      },
    ];

    return list;
  }, [baseSpectrum, metrics]);

  // 2. Zoom 고분해능 스펙트럼 플롯 ([fMin, fMax])
  const zoomSeries = useMemo<PlotSeries[]>(() => {
    const list: PlotSeries[] = [
      {
        x: frequency,
        y: amplitude,
        name: `Zoom 스펙트럼 (Z = ${zoomFactor}×, Δf = ${formatNumber(metrics.deltaFZoom, 4)} Hz)`,
        mode: 'lines+markers',
        color: '#2563eb', // blue
        width: 2,
        markerSize: 4,
      },
      // GMF 캐리어 세로선
      {
        x: [centerFreq, centerFreq],
        y: [0, 1.2],
        name: `GMF (${formatNumber(centerFreq)} Hz)`,
        mode: 'lines',
        color: '#16a34a',
        dash: 'dot',
        width: 1.5,
      },
      // -1X 좌측 측대역
      {
        x: [centerFreq - sidebandDelta, centerFreq - sidebandDelta],
        y: [0, 0.6],
        name: `-1X 측대역 (${formatNumber(centerFreq - sidebandDelta, 4)} Hz)`,
        mode: 'lines',
        color: '#ea580c',
        dash: 'dot',
        width: 1.5,
      },
      // +1X 우측 측대역
      {
        x: [centerFreq + sidebandDelta, centerFreq + sidebandDelta],
        y: [0, 0.6],
        name: `+1X 측대역 (${formatNumber(centerFreq + sidebandDelta, 4)} Hz)`,
        mode: 'lines',
        color: '#ea580c',
        dash: 'dot',
        width: 1.5,
        hideInLegend: true,
      },
    ];

    return list;
  }, [frequency, amplitude, zoomFactor, metrics.deltaFZoom, centerFreq, sidebandDelta]);

  return (
    <LabFrame
      id="LAB-ZOOM-01"
      title="Zoom FFT(대역 확대): 고분해능과 측정 시간의 트레이드오프"
      controls={
        <>
          <ParamSelect
            label="실험 프리셋"
            value={preset}
            options={PRESET_OPTIONS}
            onChange={applyPreset}
          />
          <ParamSelect
            label="Zoom 확대 배율 Z"
            value={zoomFactor}
            options={ZOOM_OPTIONS}
            onChange={(v) => {
              setZoomFactor(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="Zoom 중심 주파수 fc (GMF)"
            value={centerFreq}
            min={500}
            max={1800}
            step={50}
            unit=" Hz"
            onChange={(v) => {
              setCenterFreq(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="측대역 간격 (1X 회전주파수)"
            value={sidebandDelta}
            min={1}
            max={20}
            step={0.5}
            unit=" Hz"
            onChange={(v) => {
              setSidebandDelta(v);
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
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={`B = \\dfrac{F_{\\max}}{Z} = \\dfrac{${fmax}}{${zoomFactor}} = ${texNumber(metrics.bandwidth, 4)}\\ \\mathrm{Hz},\\quad [f_{\\min}, f_{\\max}] = [${texNumber(metrics.fMin, 4)}, ${texNumber(metrics.fMax, 4)}]\\ \\mathrm{Hz}`}
          />
          <Formula
            display
            tex={`\\Delta f_{\\text{zoom}} = \\dfrac{B}{\\mathrm{LOR}} = \\dfrac{${fmax}}{${zoomFactor} \\times ${lor}} = \\mathbf{${texNumber(metrics.deltaFZoom, 4)}\\ \\mathrm{Hz}}\\quad (\\text{기본 대비 } ${zoomFactor}\\text{배 미세화})`}
          />
          <Formula
            display
            tex={`T_{\\text{zoom}} = \\dfrac{1}{\\Delta f_{\\text{zoom}}} = ${zoomFactor} \\times T_{\\text{base}} = ${zoomFactor} \\times ${texNumber(metrics.durationBase, 2)}\\ \\mathrm{s} = \\mathbf{${texNumber(metrics.durationZoom, 3)}\\ \\mathrm{s}}\\quad (\\text{측정 시간 } ${zoomFactor}\\text{배 증가})`}
          />
          <Formula
            display
            tex={`\\text{측대역 분리 간격} = \\dfrac{${sidebandDelta}\\ \\mathrm{Hz}}{\\Delta f_{\\text{zoom}}} = \\mathbf{${texNumber(sidebandBins, 3)}\\ \\text{bin}}\\implies ${
              isSeparated
                ? '\\text{분리 성공 (독립 피크 식별)}'
                : '\\text{분리 불가 (GMF 캐리어에 뭉개져 매몰)}'
            }`}
          />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '확대 배율 Z', value: zoomFactor, unit: '배' },
            { label: 'Zoom 유효 대역폭 B', value: metrics.bandwidth, unit: 'Hz', sig: 3 },
            {
              label: '기본 분해능 Δf_base',
              value: metrics.deltaFBase,
              theory: fmax / lor,
              unit: 'Hz',
              sig: 3,
            },
            {
              label: 'Zoom 분해능 Δf_zoom',
              value: metrics.deltaFZoom,
              theory: fmax / (lor * zoomFactor),
              unit: 'Hz',
              sig: 4,
            },
            {
              label: '기본 측정 시간 T_base',
              value: metrics.durationBase,
              theory: lor / fmax,
              unit: 's',
              sig: 3,
            },
            {
              label: 'Zoom 필요 측정 시간 T_zoom',
              value: metrics.durationZoom,
              theory: (lor * zoomFactor) / fmax,
              unit: 's',
              sig: 3,
            },
            {
              label: '측대역 bin 간격',
              value: sidebandBins,
              theory: sidebandDelta / metrics.deltaFZoom,
              unit: 'bin',
              sig: 3,
            },
          ]}
        />
      }
      tasks={[
        {
          question:
            'GMF(1200 Hz) 주변의 ±5 Hz 측대역을 분리하는 데 필요한 최소 Zoom 확대 배율 Z는 얼마인가요?',
          answer:
            'Hann 윈도우에서는 최소 3.5 bin 이상 간격이 필요합니다. 기본 상태(Z=1)에서는 5 Hz / 5.0 Hz = 1 bin이므로 완전히 뭉개집니다. Z = 4배(Δf = 1.25 Hz -> 4 bin) 또는 Z = 8배(Δf = 0.625 Hz -> 8 bin)를 적용하면 3개의 독립된 날카로운 피크로 선명하게 분리됩니다.',
        },
        {
          question:
            '배율을 Z = 16배로 확대하면 측정 시간 T는 기본 측정에 비해 얼마나 늘어나나요? 공짜로 고분해능을 얻을 수 없는 이유는 무엇일까요?',
          answer:
            '측정 시간이 T_base = 0.2 s에서 T_zoom = 16 × 0.2 s = 3.2 s로 정확히 16배 늘어납니다! 푸리에 변환의 기본 법칙인 Δf · T = 1에 의해, 주파수 축을 16배 촘촘하게 보려면 기계의 데이터를 16배 더 길게 수집해야만 합니다. Zoom FFT는 계산 효율을 올려줄 뿐, 물리적 측정 시간은 결코 줄일 수 없습니다.',
        },
      ]}
    >
      <div style={{ marginBottom: '1rem' }}>
        <Plot
          series={baseSeries}
          x={{ label: '전체 주파수 [Hz]', range: [0, fmax] }}
          y={{ label: '진폭 [Pk]', range: [0, 1.25] }}
          height={220}
          ariaLabel="전체 광대역 기본 스펙트럼 및 Zoom 영역 표시"
        />
      </div>
      <div>
        <Plot
          series={zoomSeries}
          x={{ label: 'Zoom 주파수 대역 [Hz]', range: [metrics.fMin, metrics.fMax] }}
          y={{ label: '진폭 [Pk]', range: [0, 1.25] }}
          height={260}
          ariaLabel="Zoom 확대 스펙트럼 및 측대역 분리"
        />
      </div>
    </LabFrame>
  );
}
