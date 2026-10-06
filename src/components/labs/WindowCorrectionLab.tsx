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
 * LAB-WIN-03 진폭 보정(ACF)과 에너지 보정(ECF) (P2-5, Contents §5-1).
 *
 * 정현파 하나와 넓게 퍼진 잡음에 각각 ACF·ECF를 곱해 보고,
 * 어느 쪽에 어느 보정이 맞는지(정현파 → 막대 높이 → ACF, 잡음 → 전체 RMS → ECF)를 숫자로 확인한다.
 */

type SignalMode = 'tone' | 'noise';
type CorrectionMode = 'none' | 'acf' | 'ecf';

const SIGNAL_OPTIONS: ParamOption<SignalMode>[] = [
  { value: 'tone', label: '정현파 하나 (60 Hz, 진폭 1 Peak)' },
  { value: 'noise', label: '넓게 퍼진 잡음 (RMS 1)' },
];

const WINDOW_OPTIONS: ParamOption<WindowType>[] = [
  { value: 'hann', label: 'Hann (ACF 2.00, ECF 1.63)' },
  { value: 'flatTop', label: 'Flat top (ACF 4.64, ECF 2.39)' },
  { value: 'uniform', label: '윈도우 없음 (둘 다 1)' },
];

const CORRECTION_OPTIONS: ParamOption<CorrectionMode>[] = [
  { value: 'none', label: '보정 안 함' },
  { value: 'acf', label: 'ACF 진폭 보정 (막대 높이를 맞춤)' },
  { value: 'ecf', label: 'ECF 에너지 보정 (전체 RMS를 맞춤)' },
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
      for (let i = 0; i < n; i++) rawX[i] = Math.cos((2 * Math.PI * 60 * i) / fs); // 60 Hz = bin 중심
    } else {
      const rng = createRng(42);
      for (let i = 0; i < n; i++) rawX[i] = rng.normal();
    }

    const w = createWindow(winType, n);
    const winProps = windowProperties(w);
    const winX = rawX.map((v, i) => v * w[i]);

    // 윈도우를 곱한 신호를 보정 없이(1/N 기준) 변환한 뒤 보정 계수를 직접 곱한다
    const rawSpec = singleSidedSpectrum({ fs, x: winX });
    const scaleFactor = corrMode === 'acf' ? winProps.acf : corrMode === 'ecf' ? winProps.ecf : 1;
    const scaledAmps = rawSpec.amplitude.map((a) => a * scaleFactor);

    let measPeak = 0;
    for (let k = 50; k <= 70; k++) measPeak = Math.max(measPeak, scaledAmps[k]);

    // 전체 RMS: 윈도우를 곱한 신호의 RMS에 같은 보정 계수를 곱한 값
    let winSumSq = 0;
    for (let i = 0; i < n; i++) winSumSq += winX[i] * winX[i];
    const measRms = Math.sqrt(winSumSq / n) * scaleFactor;

    const truePeak = sigMode === 'tone' ? 1.0 : 0.0;
    const trueRms = sigMode === 'tone' ? 1.0 / Math.SQRT2 : 1.0;
    // 이론상 0인 오차의 부동소수점 잡음(1e-13 수준)은 0으로 — 서버·브라우저 표시가 달라 hydration 오류가 난다 (I-019)
    const tidy = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v);
    const peakError = sigMode === 'tone' ? tidy(((measPeak - truePeak) / truePeak) * 100) : 0;
    const rmsError = tidy(((measRms - trueRms) / trueRms) * 100);

    const plotFreqs: number[] = [];
    const plotAmps: number[] = [];
    for (let k = 0; k <= 120; k++) {
      plotFreqs.push(rawSpec.frequency[k]);
      plotAmps.push(scaledAmps[k]);
    }
    return { winProps, measPeak, measRms, truePeak, trueRms, peakError, rmsError, plotFreqs, plotAmps, scaleFactor };
  }, [sigMode, winType, corrMode]);

  const series: PlotSeries[] = [
    {
      x: data.plotFreqs,
      y: data.plotAmps,
      name: corrMode === 'none' ? '보정 안 한 스펙트럼' : `${corrMode.toUpperCase()}를 곱한 스펙트럼`,
      color: corrMode === 'acf' ? '#10b981' : corrMode === 'ecf' ? '#38bdf8' : '#f59e0b',
    },
  ];

  const controls = (
    <>
      <ParamSelect label="신호" value={sigMode} options={SIGNAL_OPTIONS} onChange={setSigMode} />
      <ParamSelect label="윈도우" value={winType} options={WINDOW_OPTIONS} onChange={setWinType} />
      <ParamSelect label="보정" value={corrMode} options={CORRECTION_OPTIONS} onChange={setCorrMode} />
    </>
  );

  const formulas = (
    <>
      <Formula
        tex={`\\mathrm{ACF} = \\frac{1}{\\overline{w}} = ${texNumber(data.winProps.acf, 3)},\\qquad \\mathrm{ECF} = \\frac{1}{\\sqrt{\\overline{w^2}}} = ${texNumber(data.winProps.ecf, 3)}`}
        display
      />
      <Formula
        tex={`\\text{곱한 값} = ${texNumber(data.scaleFactor, 3)}\\ \\Rightarrow\\ \\text{${sigMode === 'tone' ? '막대 높이' : '전체 RMS'} 오차} = ${texNumber(sigMode === 'tone' ? data.peakError : data.rmsError, 3)}\\ \\%`}
        display
      />
    </>
  );

  const readouts = (
    <ReadoutTable
      rows={[
        { label: '가장 높은 막대', value: data.measPeak, unit: 'Peak', sig: 4 },
        ...(sigMode === 'tone' ? [{ label: '막대 높이 오차 (실제 1)', value: data.peakError, unit: '%', sig: 3 }] : []),
        { label: '전체 RMS', value: data.measRms, sig: 4 },
        { label: '실제 RMS', value: data.trueRms, sig: 4 },
        { label: '전체 RMS 오차', value: data.rmsError, unit: '%', sig: 3 },
      ]}
    />
  );

  const tasks: LabTask[] = [
    {
      question: '정현파에서 "보정 안 함"과 "ACF"를 번갈아 고르세요. Hann에서 막대 높이가 왜 0.5에서 1로 바뀌나요?',
      answer: 'Hann 가중치의 평균이 0.5라서 보정하지 않으면 막대가 절반(0.5)으로 나옵니다. ACF = 1/0.5 = 2를 곱하면 실제 진폭 1이 됩니다.',
    },
    {
      question: '정현파에서 보정을 ECF로 바꾸면 막대 높이 오차는 몇 %인가요?',
      answer: 'Hann의 ECF는 약 1.63이므로 막대가 0.5 × 1.63 ≈ 0.816, 즉 −18.4 %로 낮게 나옵니다. 정현파 진폭을 읽을 때 에너지 보정이 걸려 있으면 진폭을 작게 읽습니다.',
    },
    {
      question: '신호를 잡음으로 바꾸고 ACF와 ECF를 비교하세요. 전체 RMS가 맞는 쪽은?',
      answer: 'ECF입니다(오차 거의 0). ACF를 곱하면 Hann에서 RMS가 2/1.63 ≈ 1.22배(+22 %), 파워로는 1.5배가 됩니다. 이 1.5가 Hann의 ENBW입니다.',
    },
  ];

  return (
    <LabFrame id="LAB-WIN-03" title="진폭 보정(ACF)과 에너지 보정(ECF)" controls={controls} formulas={formulas} readouts={readouts} tasks={tasks}>
      <h4>보정을 곱한 스펙트럼 (0 ~ 120 Hz)</h4>
      <Plot
        series={series}
        x={{ label: '주파수 [Hz]' }}
        y={{ label: '진폭 [Peak]', range: [0, sigMode === 'tone' ? 1.2 : 0.3] }}
        height={240}
        ariaLabel="보정을 곱한 스펙트럼"
      />
    </LabFrame>
  );
}
