import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { acquire } from '../../lib/dsp/sampling';
import { scaledSpectrum, spectrumIn } from '../../lib/dsp/scaling';
import { crestFactor, peak, rms } from '../../lib/dsp/stats';
import { IMPACT, impactComponents, MACHINE, machineComponents } from '../../lib/scalingDemo';

/**
 * LAB-SPC-02 진폭 표기 · dB (P2-7 §5, §7, Contents §5-1).
 * (1) 충격이 섞인 가속도: 진짜 Peak vs √2 × RMS(derived peak). (2) 기계 속도 신호: 선형 축에서 안 보이는 작은 성분을 dB로.
 * 본문 그림 5·7과 같은 신호(src/lib/scalingDemo.ts).
 */

type SignalKind = 'impact' | 'machine';
type YScale = 'linear' | 'db';
type Notation = 'peak' | 'rms';
type DbRef = 'max' | 'unit' | 'iso';

interface SignalSetup {
  label: string;
  fs: number;
  n: number;
  /** SI → 표시 단위 배율 */
  factor: number;
  unit: string;
  /** ISO 1683 기준값을 표시 단위로 (속도 1 nm/s, 가속도 1 µm/s²) */
  isoRef: number;
  isoLabel: string;
  showMs: number;
  fMax: number;
  marker: { freq: number; label: string };
}
const SETUP: Record<SignalKind, SignalSetup> = {
  impact: {
    label: `충격이 섞인 가속도 (1X ${IMPACT.x1} Hz + 1초에 ${IMPACT.rate}번 충격)`, fs: IMPACT.fs, n: IMPACT.n, factor: 1, unit: 'm/s²',
    isoRef: 1e-6, isoLabel: '1 µm/s²', showMs: 50, fMax: 5000, marker: { freq: IMPACT.x1, label: `1X ${IMPACT.x1} Hz` },
  },
  machine: {
    label: '기계 속도 (1X 25 Hz와 정수배 + 작은 성분 147·294 Hz)', fs: MACHINE.fs, n: Math.round(2.56 * MACHINE.lor), factor: 1000, unit: 'mm/s',
    isoRef: 1e-6, isoLabel: '1 nm/s', showMs: 400, fMax: 320, marker: { freq: MACHINE.smallFreq, label: '147 Hz' },
  },
};
const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);

export interface AmplitudeScaleLabProps {
  initialSignal?: SignalKind;
  initialScale?: YScale;
}

export default function AmplitudeScaleLab({ initialSignal = 'impact', initialScale = 'linear' }: AmplitudeScaleLabProps) {
  const [kind, setKind] = useState<SignalKind>(initialSignal);
  const [yScale, setYScale] = useState<YScale>(initialScale);
  const [notation, setNotation] = useState<Notation>('peak');
  const [dbRef, setDbRef] = useState<DbRef>('unit');
  const setup = SETUP[kind];

  const data = useMemo(() => {
    const sig = acquire({ components: kind === 'impact' ? impactComponents() : machineComponents() }, { fs: setup.fs, n: setup.n });
    const x = Float64Array.from(sig.x, (v) => v * setup.factor);
    const spec = scaledSpectrum({ fs: setup.fs, x }, { window: 'hann' });
    const show = Math.round((setup.showMs / 1000) * setup.fs);
    const step = Math.max(1, Math.floor(show / 2000));
    const t: number[] = [];
    const y: number[] = [];
    for (let i = 0; i < show; i += step) {
      t.push((i / setup.fs) * 1000);
      y.push(x[i]);
    }
    return { x, spec, t, y, truePeak: peak(x), rms: rms(x), cf: crestFactor(x) };
  }, [kind, setup]);

  const view = useMemo(() => {
    const amp = spectrumIn(data.spec, notation === 'peak' ? 'peak' : 'rms');
    const kMax = Math.min(amp.length - 1, Math.round(setup.fMax / data.spec.df));
    const largest = Math.max(...Array.from(amp.slice(1, kMax + 1)));
    const ref = dbRef === 'max' ? largest : dbRef === 'unit' ? 1 : setup.isoRef;
    const toY = (a: number) => (yScale === 'db' ? (a > 0 ? 20 * Math.log10(a / ref) : -200) : clean(a));
    const k0 = Math.round(setup.marker.freq / data.spec.df);
    let km = k0;
    for (let j = k0 - 2; j <= k0 + 2; j++) if (amp[j] > amp[km]) km = j;
    return {
      amp: Array.from(amp.slice(0, kMax + 1), toY),
      f: Array.from(data.spec.frequency.slice(0, kMax + 1)),
      marker: amp[km],
      markerY: toY(amp[km]),
      largest,
      largestY: toY(largest),
      ref,
    };
  }, [data, notation, yScale, dbRef, setup]);

  const derived = Math.SQRT2 * data.rms;
  const lines = (y: number, name: string, color: string, dash: 'dash' | 'dot' | 'solid'): PlotSeries => ({
    x: [0, setup.showMs], y: [y, y], name, color, dash, width: 1.6,
  });
  const wave: PlotSeries[] = [
    { x: data.t, y: data.y, name: '파형', color: 'var(--plot-1)', width: 1.1 },
    lines(data.truePeak, `진짜 Peak ${texNumber(data.truePeak, 3)}`, 'var(--plot-2)', 'dash'),
    lines(derived, `√2 × RMS ${texNumber(derived, 3)}`, 'var(--plot-3)', 'dash'),
    lines(data.rms, `RMS ${texNumber(data.rms, 3)}`, 'var(--text-muted)', 'solid'),
  ];
  const refLabel = dbRef === 'max' ? '가장 큰 성분' : dbRef === 'unit' ? `1 ${setup.unit}` : `${setup.isoLabel} (ISO 1683 기준값)`;
  const spectrum: PlotSeries[] = [
    { x: view.f, y: view.amp, name: `스펙트럼 (${notation === 'peak' ? 'Peak' : 'RMS'})`, color: 'var(--plot-1)', width: 1.2 },
    { x: [setup.marker.freq], y: [view.markerY], name: setup.marker.label, mode: 'markers', color: 'var(--plot-2)', markerSize: 10 },
  ];
  const yLabel = yScale === 'db' ? `dB (0 dB = ${refLabel})` : `${notation === 'peak' ? 'Peak' : 'RMS'} [${setup.unit}]`;

  return (
    <LabFrame id="LAB-SPC-02" title="진폭 표기와 dB: 어느 Peak인가, 작은 성분은 어디 있나"
      controls={<>
        <ParamSelect label="신호" value={kind} options={(Object.keys(SETUP) as SignalKind[]).map((k) => ({ value: k, label: SETUP[k].label }))} onChange={setKind} />
        <ParamSelect label="스펙트럼 세로축" value={yScale} options={[{ value: 'linear', label: '선형' }, { value: 'db', label: 'dB (20 log)' }]} onChange={setYScale} />
        <ParamSelect label="스펙트럼 표기" value={notation} options={[{ value: 'peak', label: 'Peak (= √2 × 성분의 RMS)' }, { value: 'rms', label: 'RMS' }]} onChange={setNotation} />
        <ParamSelect label="dB 기준값 (0 dB)" value={dbRef} disabled={yScale !== 'db'}
          options={[{ value: 'unit', label: `1 ${setup.unit}` }, { value: 'max', label: '가장 큰 성분 = 0 dB' }, { value: 'iso', label: `${setup.isoLabel} (ISO 1683 기준값)` }]} onChange={setDbRef} />
      </>}
      formulas={<>
        <Formula display tex={'\\sqrt{2}\\times \\mathrm{RMS} = \\sqrt{2}\\times' + texNumber(data.rms, 4) + ' = ' + texNumber(derived, 4) + '\\quad\\text{vs 진짜 Peak } ' + texNumber(data.truePeak, 4)} />
        <Formula display tex={'CF = \\frac{\\text{Peak}}{\\mathrm{RMS}} = ' + texNumber(data.cf, 3) + '\\quad(\\text{정현파는 }\\sqrt 2 \\approx 1.414)'} />
        <Formula display tex={'L = 20\\log_{10}\\frac{A}{A_{ref}},\\quad A_{ref} = ' + texNumber(view.ref, 4) + '\\ \\mathrm{' + (setup.unit === 'mm/s' ? 'mm/s' : 'm/s^2') + '}'} />
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: '진짜 Peak (파형의 최대 크기)', value: data.truePeak, unit: setup.unit },
        { label: 'RMS (파형 전체)', value: data.rms, unit: setup.unit },
        { label: '√2 × RMS (derived peak)', value: derived, unit: setup.unit, theory: data.truePeak },
        { label: 'Crest factor (정현파는 1.414)', value: data.cf },
        { label: `${setup.marker.label} 성분 (${notation === 'peak' ? 'Peak' : 'RMS'})`, value: view.marker, unit: setup.unit },
        ...(yScale === 'db' ? [
          { label: `${setup.marker.label} 성분 (dB)`, value: view.markerY, unit: 'dB', sig: 3 },
          { label: '가장 큰 성분 (dB)', value: view.largestY, unit: 'dB', sig: 3 },
        ] : []),
      ]} />}
      tasks={[
        { question: '"충격이 섞인 가속도"에서 √2 × RMS는 진짜 Peak의 몇 %일까요? Crest factor는?',
          answer: '√2 × RMS ≈ 1.70 m/s²로 진짜 Peak 약 6.4 m/s²의 27 % 정도입니다. Crest factor가 약 5.3으로 정현파(1.41)보다 훨씬 커서, Peak를 RMS에서 거꾸로 계산하면 크게 낮게 나옵니다. 읽음값 표의 오차 열이 이 차이입니다.' },
        { question: '"기계 속도" 신호를 선형 축으로 보면 147 Hz가 보이나요? dB로 바꾸면?',
          answer: '선형 축에서는 1X 막대(약 3 mm/s Peak) 옆에서 0.017 mm/s Peak의 147 Hz는 보이지 않습니다. dB(기준 1 mm/s)로 바꾸면 약 −35 dB로 잡음 바닥 위에 서고, 294 Hz도 약 −43 dB로 보입니다.' },
        { question: 'dB 기준값을 1 mm/s → 1 nm/s로 바꾸면 그래프가 어떻게 바뀌나요?',
          answer: '모양은 그대로이고 모든 값이 20 log₁₀(10⁶) = 120 dB만큼 올라갑니다. dB 숫자는 기준값을 함께 적어야 뜻이 있습니다.' },
        { question: '표기를 Peak → RMS로 바꾸면 dB 값은 얼마나 달라지나요?',
          answer: 'RMS = Peak/√2이므로 20 log₁₀ √2 ≈ 3.01 dB 낮아집니다. 모든 성분이 같은 만큼 내려가므로 성분 사이의 차이(dB)는 그대로입니다.' },
      ]}
      footer={<p>스펙트럼은 Hann 윈도우, 한 프레임. 스펙트럼의 "Peak"는 성분 하나하나를 정현파로 보고 √2 × RMS로 바꾼 값입니다 — 성분 하나에는 정확합니다. ISO 1683 기준값(속도 1 nm/s, 가속도 1 µm/s²)은 원문 대조가 남아 있습니다 (I-006).</p>}
    >
      <h4>시간 파형과 세 가지 크기</h4>
      <Plot series={wave} x={{ label: '시간 [ms]', range: [0, setup.showMs] }} y={{ label: `[${setup.unit}]` }} height={260} ariaLabel="시간 파형과 진짜 Peak, √2 × RMS, RMS" />
      <h4>스펙트럼</h4>
      <Plot series={spectrum} x={{ label: '주파수 [Hz]', range: [0, setup.fMax] }}
        y={{ label: yLabel }} height={280} ariaLabel="스펙트럼" />
    </LabFrame>
  );
}
