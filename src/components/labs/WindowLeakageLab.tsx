import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame, { type LabTask } from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { createWindow, type WindowType } from '../../lib/dsp/window';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';

/**
 * LAB-WIN-01 누설과 가리비 손실 (P1-4, Contents §5-1).
 *
 * 성분 주파수가 bin(눈금) 위에서 벗어날 때 (1) 에너지가 옆 bin으로 새고(누설)
 * (2) 가장 높은 막대가 깎이는(가리비 손실) 것을, 윈도우를 바꿔 가며 시간·주파수 양쪽에서 본다.
 * 조건은 본문 그림(src/figures/p1-4.ts)과 같다: f_s = 1024 Hz, N = 1024 → Δf = 1 Hz, T = 1 s.
 */

const WINDOW_OPTIONS: ParamOption<WindowType>[] = [
  { value: 'uniform', label: '윈도우 없음 (Uniform)' },
  { value: 'hann', label: 'Hann (분석기 기본값)' },
  { value: 'flatTop', label: 'Flat top (진폭 측정용)' },
  { value: 'blackmanHarris', label: 'Blackman-Harris (작은 성분 찾기용)' },
];
const DB_FLOOR = -120;
const toDb = (a: number) => Math.max(DB_FLOOR, 20 * Math.log10(Math.max(a, 1e-12)));
/** 이론상 0인 값의 부동소수점 잡음은 0으로 (hydration, I-019) */
const tidy = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v);

const FS = 1024;
const N = 1024;
const F0 = 60;

export default function WindowLeakageLab() {
  const [delta, setDelta] = useState<number>(0.0);
  const [winType, setWinType] = useState<WindowType>('uniform');
  const [showDb, setShowDb] = useState(false);
  const f = F0 + delta;

  const data = useMemo(() => {
    const rawX = new Float64Array(N);
    for (let i = 0; i < N; i++) rawX[i] = Math.cos((2 * Math.PI * f * i) / FS);
    const w = createWindow(winType, N);
    const spec = singleSidedSpectrum({ fs: FS, x: rawX }, { window: w });

    let peakAmp = 0;
    for (let k = 55; k <= 66; k++) peakAmp = Math.max(peakAmp, spec.amplitude[k]);
    const scallopDb = tidy(20 * Math.log10(Math.max(1e-6, peakAmp)));
    // 성분에서 10 bin 떨어진 곳(70 Hz 근처)의 크기 — 누설이 얼마나 멀리 가나
    const far = toDb(Math.max(spec.amplitude[70], spec.amplitude[71]));

    // 시간영역: 1초 프레임 전체 (곱한 신호의 바깥 모양이 윈도우 모양이다)
    const step = 2;
    const t: number[] = [];
    const raw: number[] = [];
    const win: number[] = [];
    const weight: number[] = [];
    for (let i = 0; i < N; i += step) {
      t.push(i / FS);
      raw.push(rawX[i]);
      win.push(rawX[i] * w[i]);
      weight.push(w[i]);
    }
    const lo = showDb ? 30 : 48;
    const hi = showDb ? 90 : 72;
    const sf: number[] = [];
    const sa: number[] = [];
    for (let k = lo; k <= hi; k++) {
      sf.push(spec.frequency[k]);
      sa.push(showDb ? toDb(spec.amplitude[k]) : spec.amplitude[k]);
    }
    return { peakAmp: tidy(peakAmp), scallopDb, far, t, raw, win, weight, sf, sa };
  }, [f, winType, showDb]);

  const timeSeries: PlotSeries[] = [
    { x: data.t, y: data.raw, name: '원래 신호', color: '#94a3b8', width: 0.8, opacity: 0.6 },
    { x: data.t, y: data.win, name: '윈도우를 곱한 신호', color: '#38bdf8', width: 1 },
    { x: data.t, y: data.weight, name: '윈도우 가중치', color: '#f59e0b', dash: 'dash', width: 2 },
  ];
  const specSeries: PlotSeries[] = showDb
    ? [{ x: data.sf, y: data.sa, name: '스펙트럼 [dB]', mode: 'lines+markers', color: '#6366f1', width: 1.4, markerSize: 4 }]
    : [{ x: data.sf, y: data.sa, name: '스펙트럼 [Peak]', kind: 'bar', barWidth: 0.7, color: '#6366f1' }];

  const controls = (
    <>
      <ParamSelect label="윈도우" value={winType} options={WINDOW_OPTIONS} onChange={(v) => setWinType(v as WindowType)} />
      <ParamSlider
        label="성분이 눈금(60 Hz)에서 벗어난 정도 δ"
        min={0}
        max={0.5}
        step={0.05}
        value={delta}
        onChange={setDelta}
        format={(v) => `${v.toFixed(2)} bin (${(F0 + v).toFixed(2)} Hz)`}
      />
      <ParamToggle label="dB로 보기 (멀리 새는 양이 보인다)" checked={showDb} onChange={setShowDb} />
    </>
  );

  const formulas = (
    <>
      <Formula tex={`f = 60 + \\delta\\,\\Delta f = 60 + ${texNumber(delta, 2)} \\times 1 = ${texNumber(f, 4)}\\ \\mathrm{Hz}`} display />
      <Formula
        tex={`\\text{가리비 손실} = 20\\log_{10}\\frac{\\text{가장 높은 막대}}{\\text{실제 진폭 }1} = 20\\log_{10}${texNumber(data.peakAmp, 3)} = ${texNumber(data.scallopDb, 3)}\\ \\mathrm{dB}`}
        display
      />
    </>
  );

  const readouts = (
    <ReadoutTable
      rows={[
        { label: '성분 주파수', value: f, unit: 'Hz', sig: 4 },
        { label: '가장 높은 막대 (실제 1)', value: data.peakAmp, unit: 'Peak', sig: 4 },
        { label: '가리비 손실', value: data.scallopDb, unit: 'dB', sig: 3 },
        { label: '10 bin 떨어진 곳(70 Hz)의 크기', value: data.far, unit: 'dB', sig: 3 },
      ]}
    />
  );

  const tasks: LabTask[] = [
    {
      question: 'δ = 0(성분이 정확히 60 Hz)에서 윈도우를 바꿔 보세요. 가장 높은 막대는 얼마인가요?',
      answer: '네 윈도우 모두 1.000입니다. 다만 윈도우가 있으면 60 Hz 양옆 막대에도 값이 생깁니다(Hann은 59·61 Hz에 0.5). 봉우리 폭이 넓어진 것이지 진폭이 틀린 것은 아닙니다.',
    },
    {
      question: '윈도우 없이 δ = 0.5로 옮기세요. 가장 높은 막대와 10 bin 떨어진 곳의 크기는?',
      answer: '가장 높은 막대가 약 0.64(−3.9 dB)로 깎이고, 70 Hz에도 약 −29 dB가 남습니다. Hann으로 바꾸면 0.85(−1.4 dB)와 약 −69 dB, Flat top이면 0.999(−0.01 dB)입니다.',
    },
    {
      question: 'dB로 보기를 켜고 δ = 0.5에서 윈도우 없음과 Blackman-Harris를 비교하세요.',
      answer: '윈도우 없음은 바닥 전체에 −30 ~ −40 dB의 누설이 깔리지만, Blackman-Harris는 성분에서 몇 bin만 벗어나면 −90 dB 아래로 떨어집니다. 그 대신 가운데 봉우리가 ±4 bin으로 넓습니다.',
    },
  ];

  return (
    <LabFrame id="LAB-WIN-01" title="누설과 가리비 손실" controls={controls} formulas={formulas} readouts={readouts} tasks={tasks}>
      <h4>시간파형: 1초 프레임 전체</h4>
      <Plot series={timeSeries} x={{ label: '시간 [s]' }} y={{ label: '값', range: [-1.15, 1.15] }} height={200} ariaLabel="윈도우를 곱한 시간파형" />
      <h4>스펙트럼 ({showDb ? '30 ~ 90 Hz, dB' : '48 ~ 72 Hz'})</h4>
      <Plot
        series={specSeries}
        x={{ label: '주파수 [Hz]' }}
        y={showDb ? { label: '[dB]', range: [DB_FLOOR, 5] } : { label: '진폭 [Peak]', range: [0, 1.15] }}
        height={230}
        ariaLabel="누설 스펙트럼"
      />
    </LabFrame>
  );
}
