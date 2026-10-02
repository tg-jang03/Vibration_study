import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame, { type LabTask } from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { createWindow, windowProperties, type WindowType } from '../../lib/dsp/window';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';

/**
 * LAB-WIN-01 누설 & 피켓펜스 랩 (P1-4, Contents §5-1).
 *
 * 목적:
 * 신호 주파수가 bin 중심에서 벗어날 때(비정수 주기),
 * 프레임 끝의 불연속으로 인한 스펙트럴 누설과 피켓펜스 스캘럽 손실을
 * 시간영역과 주파수영역에서 직접 조작하며 체감한다.
 */

const WINDOW_OPTIONS: ParamOption<WindowType>[] = [
  { value: 'uniform', label: 'Uniform (사각 윈도우 - 누설 관찰용)' },
  { value: 'hann', label: 'Hann (해닝 - 실무 표준)' },
  { value: 'flatTop', label: 'Flat top (플랫 톱 - 진폭 정확도)' },
];

export default function WindowLeakageLab() {
  const [delta, setDelta] = useState<number>(0.0);
  const [winType, setWinType] = useState<WindowType>('uniform');

  // 분석기 고정 조건: fs = 1024 Hz, N = 1024 -> T = 1.0 s, Δf = 1.0 Hz
  const fs = 1024;
  const n = 1024;
  const deltaF = fs / n; // 1.0 Hz
  const f0 = 60; // 60 Hz 기준
  const f = f0 + delta * deltaF;

  const data = useMemo(() => {
    const rawX = new Float64Array(n);
    const timeSec = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / fs;
      timeSec[i] = t;
      rawX[i] = Math.cos(2 * Math.PI * f * t);
    }

    const w = createWindow(winType, n);
    const winProps = windowProperties(w);

    const winX = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      winX[i] = rawX[i] * w[i];
    }

    // spectrum 계산 (w 적용, 진폭은 ACF 정규화가 내부 지원됨)
    const spec = singleSidedSpectrum({ fs, x: rawX }, { window: w });

    // 피크 bin 찾기 (40~80 Hz 대역)
    let peakAmp = 0;
    let peakIdx = 0;
    let peakFreq = 0;

    for (let k = 0; k < spec.frequency.length; k++) {
      const freq = spec.frequency[k];
      if (freq >= 45 && freq <= 75) {
        if (spec.amplitude[k] > peakAmp) {
          peakAmp = spec.amplitude[k];
          peakIdx = k;
          peakFreq = freq;
        }
      }
    }

    // 스캘럽 손실 (참값 1.0 Pk 대비 감쇠 dB)
    const scallopDb = 20 * Math.log10(Math.max(1e-6, peakAmp / 1.0));

    // 누설 파워 계산: 중심 ±1 bin 외부에 샌 파워의 비율
    let totalPower = 0;
    let mainlobePower = 0;
    for (let k = 0; k < spec.amplitude.length; k++) {
      const p = spec.amplitude[k] * spec.amplitude[k];
      totalPower += p;
      if (Math.abs(k - peakIdx) <= 1) {
        mainlobePower += p;
      }
    }
    const leakageRatio = totalPower > 0 ? Math.max(0, (totalPower - mainlobePower) / totalPower) * 100 : 0;

    // 플롯용 데이터 추출
    // 시간영역 (앞 80개 샘플, 약 0.08초 = 약 5주기)
    const previewCount = 80;
    const timeX = Array.from(timeSec.subarray(0, previewCount));
    const rawTimeY = Array.from(rawX.subarray(0, previewCount));
    const winTimeY = Array.from(winX.subarray(0, previewCount));

    // 주파수영역 (45~75 Hz 대역)
    const specFreqs: number[] = [];
    const specAmps: number[] = [];
    const specDbs: number[] = [];
    for (let k = 0; k < spec.frequency.length; k++) {
      const f_k = spec.frequency[k];
      if (f_k >= 48 && f_k <= 72) {
        specFreqs.push(f_k);
        specAmps.push(spec.amplitude[k]);
        specDbs.push(20 * Math.log10(Math.max(1e-4, spec.amplitude[k])));
      }
    }

    return {
      peakAmp,
      peakFreq,
      scallopDb,
      leakageRatio,
      winProps,
      timeX,
      rawTimeY,
      winTimeY,
      specFreqs,
      specAmps,
      specDbs,
    };
  }, [delta, winType]);

  const timeSeries: PlotSeries[] = [
    {
      x: data.timeX,
      y: data.rawTimeY,
      name: '원래 신호 x(t)',
      dash: 'dash',
      color: '#94a3b8',
    },
    {
      x: data.timeX,
      y: data.winTimeY,
      name: '윈도우 적용 신호 xw[t]',
      color: '#38bdf8',
    },
  ];

  const specSeries: PlotSeries[] = [
    {
      x: data.specFreqs,
      y: data.specAmps,
      name: '진폭 스펙트럼 [Pk]',
      kind: 'bar',
      barWidth: 0.8,
      color: winType === 'flatTop' ? '#10b981' : winType === 'hann' ? '#6366f1' : '#f59e0b',
    },
  ];

  const controls = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ParamSelect
        label="윈도우 종류"
        value={winType}
        options={WINDOW_OPTIONS}
        onChange={(v) => setWinType(v as WindowType)}
      />
      <ParamSlider
        label="주파수 오프셋 δ (bin 중심과의 거리)"
        min={0.0}
        max={0.5}
        step={0.05}
        value={delta}
        onChange={setDelta}
        format={(v) => `${v.toFixed(2)} bin (${(f0 + v * deltaF).toFixed(2)} Hz)`}
      />
    </div>
  );

  const formulas = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Formula
        tex={`f = f_0 + \\delta \\cdot \\Delta f = ${f0} + ${texNumber(delta, 2)} \\cdot 1.0 = ${texNumber(f, 2)}\\ \\mathrm{Hz}`}
        display
      />
      <Formula
        tex={`\\text{Scallop Loss} = 20\\log_{10}\\left(\\frac{A_{\\mathrm{meas}}}{A_{\\mathrm{true}}}\\right) = 20\\log_{10}\\left(\\frac{${texNumber(data.peakAmp, 3)}}{1.000}\\right) = ${texNumber(data.scallopDb, 2)}\\ \\mathrm{dB}`}
        display
      />
    </div>
  );

  const readouts = (
    <ReadoutTable
      rows={[
        { label: '입력 신호 주파수 f', value: f, unit: 'Hz', sig: 4 },
        { label: '주파수 오프셋 δ', value: delta, unit: 'bin', sig: 2 },
        { label: '측정된 피크 진폭', value: data.peakAmp, unit: 'Pk', sig: 4 },
        { label: '스캘럽 손실', value: data.scallopDb, unit: 'dB', sig: 3 },
        { label: '주변 bin 누설 에너지 비율', value: data.leakageRatio, unit: '%', sig: 3 },
      ]}
    />
  );

  const tasks: LabTask[] = [
    {
      question: '과제 1: 오프셋 δ = 0.0에서 Uniform을 켜보세요. 누설이 생기나요?',
      answer: '정확히 60 Hz 단 하나의 막대만 서고, 누설 비율은 0%입니다. 프레임 양 끝이 매끄럽게 연결되기 때문입니다.',
    },
    {
      question: '과제 2: 오프셋을 0.5 bin(두 bin 한가운데)으로 옮겨보세요. 진폭이 어떻게 변하나요?',
      answer: 'Uniform은 피크가 0.637 Pk로 떨어져 -3.92 dB (36.3% 손실)를 기록합니다. 반면 Flat top으로 바꾸면 0.5 bin에서도 진폭이 0.999 Pk로 거의 100% 온전히 유지됩니다!',
    },
  ];

  return (
    <LabFrame
      id="LAB-WIN-01"
      title="LAB-WIN-01 누설 & 피켓펜스 (Scallop Loss)"
      controls={controls}
      formulas={formulas}
      readouts={readouts}
      tasks={tasks}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            시간영역 파형 (앞부분 약 5주기 관찰)
          </div>
          <Plot
            series={timeSeries}
            x={{ label: '시간 t [s]' }}
            y={{ label: '진폭', range: [-1.2, 1.2] }}
            height={200}
          />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            주파수 스펙트럼 (48 ~ 72 Hz 중심 대역)
          </div>
          <Plot
            series={specSeries}
            x={{ label: '주파수 [Hz]' }}
            y={{ label: '진폭 [Pk]', range: [0, 1.2] }}
            height={220}
          />
        </div>
      </div>
    </LabFrame>
  );
}
