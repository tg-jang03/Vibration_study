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
  smearingMetrics,
} from '../../lib/dsp/resolution';
import { acquire } from '../../lib/dsp/sampling';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import type { WindowType } from '../../lib/dsp/window';

/**
 * LAB-RES-02 Smearing: 변하는 회전수 (P2-4, Contents §5-1).
 *
 * 목적:
 * 코스트다운이나 가속 중 회전수가 변할 때,
 * 측정 시간 T가 길면 1X 피크가 여러 bin에 걸쳐 번지고(Smearing) 진폭이 낮아지는 현상을 체험한다.
 * "분해능을 무작정 높이는 것이 항상 좋은 것은 아니다"라는 현장 교훈을 체득한다.
 */

type PresetKey = 'default60' | 'heavy120' | 'gentle20' | 'steady0' | 'custom';

const PRESET_OPTIONS: ParamOption<PresetKey>[] = [
  { value: 'default60', label: '감속 중 측정 (60 rpm/s = 1초에 1 Hz씩 느려짐, LOR 1600)' },
  { value: 'heavy120', label: '빠른 감속 (120 rpm/s)' },
  { value: 'gentle20', label: '느린 감속 (20 rpm/s)' },
  { value: 'steady0', label: '정속 운전 (0 rpm/s, 비교 기준)' },
  { value: 'custom', label: '직접 조작' },
];

const FMAX_OPTIONS: ParamOption<number>[] = [
  { value: 500, label: '500 Hz' },
  { value: 1000, label: '1000 Hz' },
  { value: 2000, label: '2000 Hz' },
];

const LOR_OPTIONS: ParamOption<number>[] = [
  { value: 400, label: '400 line (T 짧음 → 번짐 작음)' },
  { value: 800, label: '800 line' },
  { value: 1600, label: '1600 line' },
  { value: 3200, label: '3200 line (T 김 → 번짐 큼)' },
];

const WINDOW_OPTIONS: ParamOption<WindowType>[] = [
  { value: 'hann', label: 'Hann (분석기 기본값)' },
  { value: 'uniform', label: '윈도우 없음' },
  { value: 'flatTop', label: 'Flat top' },
];

export default function SmearingLab() {
  const [preset, setPreset] = useState<PresetKey>('default60');
  const [rpm0, setRpm0] = useState(3600); // 초기 회전수 (60 Hz)
  const [rateRpm, setRateRpm] = useState(60); // 감속률 a [rpm/s]
  const [fmax, setFmax] = useState(1000);
  const [lor, setLor] = useState(1600);
  const [windowType, setWindowType] = useState<WindowType>('hann');
  const [showSteadyRef, setShowSteadyRef] = useState(true);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    switch (key) {
      case 'default60':
        setRpm0(3600);
        setRateRpm(60);
        setFmax(1000);
        setLor(1600);
        break;
      case 'heavy120':
        setRpm0(3600);
        setRateRpm(120);
        setFmax(1000);
        setLor(1600);
        break;
      case 'gentle20':
        setRpm0(3600);
        setRateRpm(20);
        setFmax(1000);
        setLor(1600);
        break;
      case 'steady0':
        setRpm0(3600);
        setRateRpm(0);
        setFmax(1000);
        setLor(1600);
        break;
      case 'custom':
        break;
    }
  };

  const f0 = rpm0 / 60; // 시작 1X 주파수 [Hz]
  const res = useMemo(() => calculateResolution({ fmax, lor }), [fmax, lor]);
  const smearing = useMemo(
    () => smearingMetrics(rateRpm, res.duration, res.deltaF),
    [rateRpm, res.duration, res.deltaF],
  );

  const fEnd = f0 - smearing.deltaF1X;

  // 신호 수집 및 스펙트럼 계산
  const { specChirp, specSteady } = useMemo(() => {
    let fftSize = 256;
    while (fftSize < res.n) fftSize *= 2;

    // 감속 처프 신호: df/dt = -rateRpm / 60 [Hz/s]
    const chirpRate = -(rateRpm / 60);
    const chirpSamples = acquire(
      {
        components: [
          { type: 'chirp', f0, rate: chirpRate, amp: 1.0 },
          { type: 'noise', rms: 0.005, seed: 101 },
        ],
      },
      { fs: res.fs, n: res.n },
    );

    // 정속 기준 신호 (a = 0)
    const steadySamples = acquire(
      {
        components: [
          { type: 'sine', freq: f0, amp: 1.0 },
          { type: 'noise', rms: 0.005, seed: 101 },
        ],
      },
      { fs: res.fs, n: res.n },
    );

    const chirpSpec = singleSidedSpectrum(
      { fs: res.fs, x: chirpSamples.x },
      { fftSize, window: windowType },
    );
    const steadySpec = singleSidedSpectrum(
      { fs: res.fs, x: steadySamples.x },
      { fftSize, window: windowType },
    );

    return { specChirp: chirpSpec, specSteady: steadySpec };
  }, [f0, rateRpm, res, windowType]);

  // 피크 진폭 측정
  const peakChirpAmp = useMemo(() => {
    let maxVal = 0;
    for (let i = 0; i < specChirp.amplitude.length; i++) {
      if (specChirp.amplitude[i] > maxVal) maxVal = specChirp.amplitude[i];
    }
    return maxVal;
  }, [specChirp]);

  const peakSteadyAmp = useMemo(() => {
    let maxVal = 0;
    for (let i = 0; i < specSteady.amplitude.length; i++) {
      if (specSteady.amplitude[i] > maxVal) maxVal = specSteady.amplitude[i];
    }
    return maxVal;
  }, [specSteady]);

  const ampDropPercent =
    peakSteadyAmp > 0 ? Math.max(0, (1 - peakChirpAmp / peakSteadyAmp) * 100) : 0;

  // 플롯 시리즈 구성
  const plotSeries = useMemo<PlotSeries[]>(() => {
    const list: PlotSeries[] = [
      {
        x: specChirp.frequency,
        y: specChirp.amplitude,
        name: `감속 중 신호 (${rateRpm} rpm/s)`,
        mode: 'lines',
        color: '#dc2626', // red
        width: 2.2,
      },
    ];

    if (showSteadyRef) {
      list.push({
        x: specSteady.frequency,
        y: specSteady.amplitude,
        name: '정속 운전 기준 (a = 0 rpm/s)',
        mode: 'lines',
        color: '#2563eb', // blue
        dash: 'dash',
        width: 1.5,
      });
    }

    // 주파수 시작점과 끝점 수직선 표시
    list.push({
      x: [f0, f0],
      y: [0, 1.15],
      name: `시작 f0 (${formatNumber(f0, 4)} Hz)`,
      mode: 'lines',
      color: '#16a34a',
      dash: 'dot',
      width: 1.2,
    });

    if (rateRpm > 0) {
      list.push({
        x: [fEnd, fEnd],
        y: [0, 1.15],
        name: `종료 f_end (${formatNumber(fEnd, 4)} Hz)`,
        mode: 'lines',
        color: '#f97316',
        dash: 'dot',
        width: 1.2,
      });
    }

    return list;
  }, [specChirp, specSteady, showSteadyRef, rateRpm, f0, fEnd]);

  // X축 관심 대역 확대: f0 근처 ± 10 Hz
  const xSpan = Math.max(8, smearing.deltaF1X * 2.5);
  const xRange: [number, number] = [Math.max(0, f0 - xSpan), f0 + xSpan * 0.6];

  return (
    <LabFrame
      id="LAB-RES-02"
      title="스미어링(Smearing): 측정 중에 회전수가 변하면"
      controls={
        <>
          <ParamSelect
            label="실험 프리셋"
            value={preset}
            options={PRESET_OPTIONS}
            onChange={applyPreset}
          />
          <ParamSlider
            label="측정 시작 회전수"
            value={rpm0}
            min={1800}
            max={7200}
            step={60}
            unit=" rpm"
            onChange={(v) => {
              setRpm0(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="감속률 a"
            value={rateRpm}
            min={0}
            max={150}
            step={5}
            unit=" rpm/s"
            onChange={(v) => {
              setRateRpm(v);
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
            label="분석 최대 주파수 F_max"
            value={fmax}
            options={FMAX_OPTIONS}
            onChange={(v) => {
              setFmax(v);
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
          <div style={{ marginTop: '0.5rem' }}>
            <ParamToggle
              label="정속 운전(a = 0) 기준 피크 겹쳐보기"
              checked={showSteadyRef}
              onChange={setShowSteadyRef}
            />
          </div>
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={`T = \\dfrac{\\mathrm{LOR}}{F_{\\max}} = \\dfrac{${lor}}{${fmax}} = ${texNumber(res.duration, 3)}\\ \\mathrm{s},\\quad \\Delta f = ${texNumber(res.deltaF, 4)}\\ \\mathrm{Hz}`}
          />
          <Formula
            display
            tex={`\\Delta f_{1X} = \\dfrac{a}{60} \\times T = \\dfrac{${rateRpm}}{60} \\times ${texNumber(res.duration, 3)} = ${texNumber(smearing.deltaF1X, 3)}\\ \\mathrm{Hz}`}
          />
          <Formula
            display
            tex={`\\text{퍼진 bin 수} = \\dfrac{\\Delta f_{1X}}{\\Delta f} = \\dfrac{a}{60} T^2 = \\dfrac{${rateRpm}}{60} \\times (${texNumber(res.duration, 2)})^2 = \\mathbf{${texNumber(smearing.smearedBins, 2)}\\ \\text{bin}}\\quad (${rateRpm > 0 ? '\\text{피크 진폭 ' + texNumber(ampDropPercent, 4) + '\\% 감소}' : '\\text{정속 운전}'})`}
          />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '초기 회전주파수 f0', value: f0, unit: 'Hz', sig: 3 },
            { label: '측정 시간 T', value: res.duration, unit: 's', sig: 3 },
            { label: '주파수 분해능 Δf', value: res.deltaF, unit: 'Hz', sig: 4 },
            {
              label: '프레임 동안 1X 주파수 이동폭',
              value: smearing.deltaF1X,
              theory: (rateRpm / 60) * res.duration,
              unit: 'Hz',
              sig: 3,
            },
            {
              label: '스미어링 번짐 bin 수',
              value: smearing.smearedBins,
              theory: (rateRpm / 60) * res.duration * res.duration,
              unit: 'bin',
              sig: 3,
            },
            {
              label: '측정된 피크 진폭',
              value: peakChirpAmp,
              unit: 'Pk',
              sig: 3,
            },
            {
              label: '정속 대비 진폭 감소율',
              value: ampDropPercent,
              unit: '%',
              sig: 2,
            },
          ]}
        />
      }
      tasks={[
        {
          question:
            'F_max = 1000 Hz, LOR = 3200 line (T = 3.2 s)에서 감속률 a = 60 rpm/s로 코스트다운하면 1X 주파수는 프레임 동안 몇 Hz 변하고 몇 bin에 걸쳐 퍼지나요?',
          answer:
            '1X가 (60/60) × 3.2 = 3.2 Hz 움직이고, Δf = 0.3125 Hz이므로 약 10 bin에 걸쳐 넓게 번집니다. 날카로운 막대가 넓은 둔덕이 되고, 에너지가 여러 bin에 나뉘어 가장 높은 막대의 진폭도 크게 낮아집니다(읽음값의 진폭 감소율 확인).',
        },
        {
          question:
            'LOR을 400 line (T = 0.4 s)으로 대폭 낮추면 스미어링 bin 수는 어떻게 변하나요? 왜 그럴까요?',
          answer:
            '번진 bin 수는 T²에 비례합니다. T가 3.2 s → 0.4 s로 8배 줄면 번짐은 8² = 64배 줄어 약 0.16 bin이 됩니다. 회전수가 변하는 동안에는 라인 수를 낮춰 T를 짧게 하거나, 회전 각도에 맞춰 샘플링하는 차수 추적(Order Tracking, P5-4)을 씁니다.',
        },
      ]}
    >
      <Plot
        series={plotSeries}
        x={{ label: '주파수 [Hz]', range: xRange }}
        y={{ label: '진폭 [Pk]', range: [0, 1.25] }}
        height={300}
        ariaLabel="회전수 변동에 따른 1X 피크 스미어링"
      />
    </LabFrame>
  );
}
