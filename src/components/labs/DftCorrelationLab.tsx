import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { correlationTerms, dftAt } from '../../lib/dsp/fourier';
import { acquire } from '../../lib/dsp/sampling';

/**
 * LAB-FOU-01 (b) DFT = 템플릿과의 상관 (P2-2, Contents §5-1)
 * N = 32, fs = 32 Hz → 프레임 1 s, bin k = k Hz.
 */

const N = 32;
const FS = N;
const SWEEP_STEP = 0.02;
const TONE2 = { freq: 9, amp: 0.5 };

type Template = 'cos' | 'sin';
const TEMPLATE_OPTIONS = [
  { value: 'cos' as Template, label: 'cos 템플릿 (합 = 실수부 Re)' },
  { value: 'sin' as Template, label: 'sin 템플릿 (합 = −허수부 Im)' },
];

/** 단일측 진폭 배율: DC·나이퀴스트는 1, 나머지는 2 (Contents §3) */
const sideFactor = (k: number) => (k === 0 || k === N / 2 ? 1 : 2);

export default function DftCorrelationLab() {
  const [f1, setF1] = useState(4); // bin = Hz
  const [phiDeg, setPhiDeg] = useState(0);
  const [tone2, setTone2] = useState(false);
  const [k, setK] = useState(4);
  const [template, setTemplate] = useState<Template>('cos');

  const signal = useMemo(() => {
    const components = [{ type: 'sine' as const, freq: f1, amp: 1, phase: (phiDeg * Math.PI) / 180 }];
    if (tone2) components.push({ type: 'sine', freq: TONE2.freq, amp: TONE2.amp, phase: 0 });
    const s = acquire({ components }, { fs: FS, n: N });
    const n = Array.from({ length: N }, (_, i) => i);
    // k를 쓸어 가며 그린 연속 곡선과 정수 bin
    const sweepK: number[] = [];
    const sweepA: number[] = [];
    for (let kk = 0; kk <= N / 2 + 1e-9; kk += SWEEP_STEP) {
      const v = dftAt(s.x, kk);
      sweepK.push(kk);
      sweepA.push((sideFactor(kk) * Math.hypot(v.re, v.im)) / N);
    }
    const binK: number[] = [];
    const binA: number[] = [];
    for (let kk = 0; kk <= N / 2; kk++) {
      const v = dftAt(s.x, kk);
      binK.push(kk);
      binA.push((sideFactor(kk) * Math.hypot(v.re, v.im)) / N);
    }
    return { x: s.x, n, sweepK, sweepA, binK, binA };
  }, [f1, phiDeg, tone2]);

  const view = useMemo(() => {
    const terms = correlationTerms(signal.x, k);
    const fineN: number[] = [];
    const fineY: number[] = [];
    for (let t = 0; t <= N - 1 + 1e-9; t += 0.05) {
      const a = (2 * Math.PI * k * t) / N;
      fineN.push(t);
      fineY.push(template === 'cos' ? Math.cos(a) : Math.sin(a));
    }
    return {
      terms,
      product: template === 'cos' ? terms.cosProduct : terms.sinProduct,
      cumulative: template === 'cos' ? terms.cosCumulative : terms.sinCumulative,
      fineN,
      fineY,
      X: dftAt(signal.x, k),
    };
  }, [signal, k, template]);

  // 이론상 0인 값에 남는 부동소수점 잡음(1e-15 수준)은 0으로 보여준다.
  // 그대로 두면 학습자에게 혼란스럽고, 서버·브라우저 값이 달라 hydration 오류가 난다 (I-019).
  const tol = 1e-9 * N;
  const clean = (v: number) => (Math.abs(v) < tol ? 0 : v);
  const re = clean(view.X.re);
  const im = clean(view.X.im);
  const mag = Math.hypot(re, im);
  const amp = (sideFactor(k) * mag) / N;
  const phaseDeg = mag === 0 ? Number.NaN : (Math.atan2(im, re) * 180) / Math.PI;

  // 이론값: 톤이 정확히 정수 bin에 있고 k가 그 bin일 때만
  const onBin = Number.isInteger(f1) && Math.abs(k - f1) < 1e-9 && !(tone2 && f1 === TONE2.freq);
  const rows: Readout[] = [
    { label: 'Re X(k) = Σ x·cos', value: re },
    { label: 'Im X(k) = −Σ x·sin', value: im },
    { label: '진폭 2|X(k)|/N', value: amp, theory: onBin ? 1 : undefined },
    { label: '위상 atan2(Im, Re) [°]', value: phaseDeg, theory: onBin && phiDeg !== 0 ? phiDeg : undefined },
  ];

  return (
    <LabFrame
      id="LAB-FOU-01 (b)"
      title="DFT = 템플릿 정현파와의 상관"
      controls={
        <>
          <ParamSlider label="신호 주파수 f₁" value={f1} min={0} max={16} step={0.1} unit="Hz (= bin)" format={(v) => v.toFixed(1)} onChange={setF1} />
          <ParamSlider label="신호 위상 φ₁" value={phiDeg} min={-180} max={180} step={5} unit="°" onChange={setPhiDeg} />
          <ParamToggle label={`두 번째 톤 (${TONE2.freq} Hz, 진폭 ${TONE2.amp})`} checked={tone2} onChange={setTone2} />
          <ParamSlider label="비교할 템플릿 주파수 k" value={k} min={0} max={16} step={0.05} unit="bin" format={(v) => v.toFixed(2)} onChange={setK} />
          <ParamSelect label="템플릿" value={template} options={TEMPLATE_OPTIONS} onChange={setTemplate} />
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={`X(k) = \\sum_{n=0}^{N-1} x[n]\\,e^{-j2\\pi kn/N} = \\sum_n x[n]\\cos\\tfrac{2\\pi kn}{N} \\;-\\; j\\sum_n x[n]\\sin\\tfrac{2\\pi kn}{N}`}
          />
          <Formula
            display
            tex={`k = ${texNumber(k, 3)}:\\quad \\mathrm{Re} = ${texNumber(re, 3)},\\ \\ \\mathrm{Im} = ${texNumber(im, 3)},\\ \\ \\dfrac{2|X(k)|}{N} = ${texNumber(amp, 3)}`}
          />
        </>
      }
      readouts={<ReadoutTable rows={rows} />}
      tasks={[
        {
          question: 'k를 신호 주파수와 같은 4로 두면 진폭 2|X|/N은 얼마일까요? 곱 막대는 어떤 모양일까요?',
          answer:
            '1(신호 진폭)이 됩니다. 곱 x·cos가 cos² 꼴이라 거의 항상 양수여서 누적합이 꾸준히 커집니다. "템플릿과 닮을수록 상관(합)이 크다"가 DFT의 정체입니다.',
        },
        {
          question: 'k를 다른 정수(예: 5)로 바꾸면? 누적합의 끝값을 보세요.',
          answer:
            '0이 됩니다. 프레임 안에 정수 주기가 들어가는 서로 다른 정현파는 곱의 +와 −가 정확히 상쇄됩니다(직교성). FFT의 bin들은 바로 이런 템플릿들입니다.',
        },
        {
          question: '신호 주파수를 4.5 Hz(두 bin 사이)로 바꾸면 정수 bin(아래 그래프의 점)은 어떻게 될까요?',
          answer:
            '모든 정수 bin이 0이 아니게 됩니다. 신호와 정확히 맞는 템플릿이 없어서 에너지가 여러 bin에 퍼지는 것 — 이것이 누설(Spectral Leakage)이고 P2-5 윈도우에서 다룹니다.',
        },
        {
          question: '위상 φ₁을 90°로 바꾸면 cos 템플릿과 sin 템플릿의 누적합은 어떻게 변할까요?',
          answer:
            'cos 쪽 합은 0, sin 쪽 합이 커집니다. 진폭(√(Re²+Im²))은 그대로이고 위상 = atan2(Im, Re)만 바뀝니다. DFT 한 번에 진폭과 위상을 함께 얻는 이유입니다.',
        },
      ]}
    >
      <Plot
        series={[
          { x: signal.n, y: signal.x, name: '신호 x[n]', mode: 'lines+markers', markerSize: 5 },
          { x: view.fineN, y: view.fineY, name: `템플릿 ${template}(2πkn/N)`, dash: 'dash', width: 1.5 },
        ]}
        x={{ label: '샘플 n', range: [-0.5, N - 0.5] }}
        y={{ label: '진폭', range: [-1.7, 1.7] }}
        height={240}
      />
      <Plot
        series={[
          { x: signal.n, y: view.product, name: `곱 x[n]·${template}`, kind: 'bar', barWidth: 0.6 },
          { x: signal.n, y: view.cumulative, name: '누적합', mode: 'lines+markers', markerSize: 4 },
        ]}
        x={{ label: '샘플 n', range: [-0.5, N - 0.5] }}
        y={{ label: '곱 / 누적합' }}
        height={240}
      />
      <Plot
        series={[
          { x: signal.sweepK, y: signal.sweepA, name: 'k를 연속으로 바꾼 2|X(k)|/N', width: 1.5 },
          { x: signal.binK, y: signal.binA, name: '정수 bin (FFT가 계산하는 점)', mode: 'markers', markerSize: 7 },
          { x: [k], y: [amp], name: '현재 k', mode: 'markers', markerSize: 13 },
        ]}
        x={{ label: 'k [bin] (= Hz)', range: [0, N / 2] }}
        y={{ label: '2|X(k)|/N', range: [0, 1.25] }}
        height={260}
      />
    </LabFrame>
  );
}
