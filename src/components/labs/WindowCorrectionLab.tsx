import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame, { type LabTask } from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { createWindow, windowProperties, type WindowType } from '../../lib/dsp/window';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import { createRng } from '../../lib/dsp/random';

/**
 * LAB-WIN-03 3가지 진폭 보정 & ENBW 랩 (P1-4, Contents §5-1).
 *
 * 목적:
 * 단일 톤 신호와 광대역 랜덤 잡음에서,
 * ACF(진폭 보정)와 ECF(에너지 보정)를 올바르게 적용했을 때와
 * 거꾸로 적용했을 때 발생하는 진폭/RMS 복원 오차를 직접 실험하여 체감한다.
 */

type SignalMode = 'tone' | 'noise';
type CorrectionMode = 'none' | 'acf' | 'ecf';

const SIGNAL_OPTIONS: ParamOption<SignalMode>[] = [
  { value: 'tone', label: '단일 정현파 톤 (60 Hz, 참 진폭 1.000 Pk)' },
  { value: 'noise', label: '광대역 백색잡음 (참 RMS 1.000)' },
];

const WINDOW_OPTIONS: ParamOption<WindowType>[] = [
  { value: 'hann', label: 'Hann (해닝: ACF = 2.00, ECF = 1.633)' },
  { value: 'flatTop', label: 'Flat top (플랫 톱: ACF = 4.639, ECF = 2.389)' },
  { value: 'uniform', label: 'Uniform (사각: ACF = 1.00, ECF = 1.00)' },
];

const CORRECTION_OPTIONS: ParamOption<CorrectionMode>[] = [
  { value: 'none', label: '보정 없음 (Uncorrected, 1/N)' },
  { value: 'acf', label: 'ACF 진폭 보정 (N / S₁ - 피크 톤 전용)' },
  { value: 'ecf', label: 'ECF 에너지 보정 (√(N / S₂) - 잡음/파워 전용)' },
];

export default function WindowCorrectionLab() {
  const [sigMode, setSigMode] = useState<SignalMode>('tone');
  const [winType, setWinType] = useState<WindowType>('hann');
  const [corrMode, setCorrMode] = useState<CorrectionMode>('acf');

  const fs = 1024;
  const n = 1024;

  const data = useMemo(() => {
    const rawX = new Float64Array(n);
    if (sigMode === 'tone') {
      const f = 60.0; // 정확히 60.0 Hz bin 중심
      for (let i = 0; i < n; i++) {
        const t = i / fs;
        rawX[i] = 1.0 * Math.cos(2 * Math.PI * f * t);
      }
    } else {
      const rng = createRng(42);
      for (let i = 0; i < n; i++) {
        rawX[i] = rng.normal();
      }
    }

    const w = createWindow(winType, n);
    const winProps = windowProperties(w);

    const winX = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      winX[i] = rawX[i] * w[i];
    }

    // spectrum.ts는 기본적으로 ACF로 스케일링하므로,
    // 보정 없음 및 ECF를 시험하기 위해 스케일 팩터를 직접 계산
    // spectrum()에 아무 윈도우도 넘기지 않으면 1/N 기준 스펙트럼이 나옴
    const rawSpec = singleSidedSpectrum({ fs, x: winX });

    let scaleFactor = 1.0;
    if (corrMode === 'acf') {
      scaleFactor = winProps.acf;
    } else if (corrMode === 'ecf') {
      scaleFactor = winProps.ecf;
    }

    const scaledAmps = new Float64Array(rawSpec.amplitude.length);
    for (let k = 0; k < scaledAmps.length; k++) {
      scaledAmps[k] = rawSpec.amplitude[k] * scaleFactor;
    }

    // 측정 피크 진폭 (50~70 Hz 부근)
    let measPeak = 0;
    for (let k = 0; k < rawSpec.frequency.length; k++) {
      const freq = rawSpec.frequency[k];
      if (freq >= 50 && freq <= 70) {
        if (scaledAmps[k] > measPeak) {
          measPeak = scaledAmps[k];
        }
      }
    }

    // 측정 시간영역 RMS
    let winSumSq = 0;
    for (let i = 0; i < n; i++) {
      winSumSq += winX[i] * winX[i];
    }
    const uncorrectedRms = Math.sqrt(winSumSq / n);
    const measRms = uncorrectedRms * scaleFactor;

    const truePeak = sigMode === 'tone' ? 1.000 : 0.0;
    const trueRms = sigMode === 'tone' ? 1.0 / Math.SQRT2 : 1.000;

    const peakError = sigMode === 'tone' ? ((measPeak - truePeak) / truePeak) * 100 : 0;
    const rmsError = ((measRms - trueRms) / trueRms) * 100;

    // 플롯 데이터 (0~150 Hz 대역)
    const plotFreqs: number[] = [];
    const plotAmps: number[] = [];
    for (let k = 0; k < rawSpec.frequency.length; k++) {
      const freq = rawSpec.frequency[k];
      if (freq <= 120) {
        plotFreqs.push(freq);
        plotAmps.push(scaledAmps[k]);
      }
    }

    return {
      winProps,
      measPeak,
      measRms,
      truePeak,
      trueRms,
      peakError,
      rmsError,
      plotFreqs,
      plotAmps,
      scaleFactor,
    };
  }, [sigMode, winType, corrMode]);

  const series: PlotSeries[] = [
    {
      x: data.plotFreqs,
      y: data.plotAmps,
      name: `스케일된 스펙트럼 [${corrMode.toUpperCase()} 보정]`,
      color: corrMode === 'acf' ? '#10b981' : corrMode === 'ecf' ? '#38bdf8' : '#f59e0b',
    },
  ];

  const controls = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ParamSelect
        label="입력 신호 형태"
        value={sigMode}
        options={SIGNAL_OPTIONS}
        onChange={(v) => setSigMode(v as SignalMode)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <ParamSelect
          label="적용 윈도우"
          value={winType}
          options={WINDOW_OPTIONS}
          onChange={(v) => setWinType(v as WindowType)}
        />
        <ParamSelect
          label="적용 보정 방식"
          value={corrMode}
          options={CORRECTION_OPTIONS}
          onChange={(v) => setCorrMode(v as CorrectionMode)}
        />
      </div>
    </div>
  );

  const formulas = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Formula
        tex={`\\mathrm{ACF} = \\frac{N}{S_1} = ${texNumber(data.winProps.acf, 3)},\\quad \\mathrm{ECF} = \\sqrt{\\frac{N}{S_2}} = ${texNumber(data.winProps.ecf, 3)}`}
        display
      />
      <Formula
        tex={`\\text{적용 승수} = ${texNumber(data.scaleFactor, 3)}\\quad \\rightarrow \\quad \\text{복원 오차} = ${texNumber(sigMode === 'tone' ? data.peakError : data.rmsError, 4)}\\%`}
        display
      />
    </div>
  );

  const readouts = (
    <ReadoutTable
      rows={[
        { label: '측정된 피크 진폭', value: data.measPeak, unit: 'Pk', sig: 4 },
        { label: '목표 참 피크 진폭', value: data.truePeak, unit: 'Pk', sig: 4 },
        { label: '피크 복원 오차율', value: data.peakError, unit: '%', sig: 3 },
        { label: '측정된 전체 RMS', value: data.measRms, sig: 4 },
        { label: '목표 참 RMS', value: data.trueRms, sig: 4 },
        { label: 'RMS 복원 오차율', value: data.rmsError, unit: '%', sig: 3 },
      ]}
    />
  );

  const tasks: LabTask[] = [
    {
      question: '과제 1: 단일 톤에서 보정 없음(None)과 ACF를 번갈아 선택해 보세요. 진폭이 왜 0.5에서 1.0으로 바뀌나요?',
      answer: 'Hann 윈도우는 평균 높이가 0.5(CG = 0.5)이므로 아무 보정도 안 하면 피크가 0.50 Pk로 반토막 납니다. ACF = 1/0.5 = 2.0을 곱해 주어야 원래 피크 1.000 Pk가 정확히 복원됩니다.',
    },
    {
      question: '과제 2: 단일 톤에서 보정 방식을 ECF로 바꿔보세요. 몇 %의 오차가 남나요?',
      answer: 'Hann의 ECF는 1.633이므로 측정 피크가 0.816 Pk로 표시되어 -18.4%의 오차가 생깁니다! 회전기계 1X 진폭을 읽을 때 분석기가 ECF 모드로 되어 있으면 진폭을 18%나 깎아먹게 됩니다.',
    },
    {
      question: '과제 3: 신호를 백색잡음으로 바꾸고 ECF를 선택해 보세요. 참 RMS가 어떻게 복원되나요?',
      answer: '광대역 잡음은 주파수 전체에 퍼져 있으므로 에너지 보정 계수인 ECF(1.633)를 곱해야만 시간영역의 원래 RMS인 1.000이 오차 없이 100% 복원됩니다.',
    },
  ];

  return (
    <LabFrame
      id="LAB-WIN-03"
      title="LAB-WIN-03 3가지 진폭 보정 & ENBW"
      controls={controls}
      formulas={formulas}
      readouts={readouts}
      tasks={tasks}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>
          보정 적용 스펙트럼 (0 ~ 120 Hz)
        </div>
        <Plot
          series={series}
          x={{ label: '주파수 [Hz]' }}
          y={{ label: '진폭', range: [0, sigMode === 'tone' ? 1.2 : 0.3] }}
          height={240}
        />
      </div>
    </LabFrame>
  );
}
