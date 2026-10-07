import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { analyzeGear, DEFAULT_GEAR, F2, G, GEAR, MESH, type LifterMode } from '../../lib/cepstrumDemo';

/**
 * LAB-CEP-01 켑스트럼: 줄 무리의 간격 → quefrency 봉우리, 리프터링 (P5-7, Contents §5).
 * 신호·계산: lib/cepstrumDemo.ts, lib/dsp/cepstrum.ts (본문 그림 1 ~ 4와 같은 신호).
 */

const LIFTER_OPTIONS: { value: LifterMode; label: string }[] = [
  { value: 'none', label: '끔' },
  { value: 'pinion', label: `피니언 무리 지우기 (${formatNumber(1000 / GEAR.f1, 3)} ms의 정수배)` },
  { value: 'gear', label: `기어 무리 지우기 (${formatNumber(1000 / F2, 3)} ms의 정수배)` },
  { value: 'low', label: '낮은 quefrency(< 5 ms)만 남기기' },
];
const NOISE_OPTIONS = [0.01, 0.05, 0.2].map((v) => ({ value: v, label: `${v} g` }));
const dB = (v: number) => 20 * Math.log10(Math.max(v / G, 1e-6));

export interface CepstrumLabState {
  m1: number;
  m2: number;
  noise: number;
  lifter: LifterMode;
}

export default function CepstrumLab({ initial = {} }: { initial?: Partial<CepstrumLabState> }) {
  const [p, setP] = useState<CepstrumLabState>({ m1: DEFAULT_GEAR.m1, m2: DEFAULT_GEAR.m2, noise: DEFAULT_GEAR.noise / G, lifter: 'none', ...initial });
  const set = <K extends keyof CepstrumLabState>(k: K) => (v: CepstrumLabState[K]) => setP((q) => ({ ...q, [k]: v }));
  const a = useMemo(() => analyzeGear({ m1: p.m1, m2: p.m2, noise: p.noise * G }, p.lifter), [p]);

  const zoomX: number[] = [];
  const zoomY: number[] = [];
  const zoomE: number[] = [];
  a.cep.freq.forEach((f, k) => {
    if (f >= 500 && f <= 700) {
      zoomX.push(f);
      zoomY.push(dB(a.cep.amp[k]));
      zoomE.push(dB(a.edited[k]));
    }
  });
  const cq: number[] = [];
  const cv: number[] = [];
  a.cep.quefrency.forEach((q, i) => {
    if (q >= 0.002 && q <= 0.25) {
      cq.push(q * 1000);
      cv.push(a.cep.c[i]);
    }
  });
  const cMax = Math.max(0.05, ...cv) * 1.15;
  const marks = (T: number, kMax: number, name: string, color: string): PlotSeries[] =>
    Array.from({ length: kMax }, (_, i) => ({ x: [(i + 1) * T, (i + 1) * T], y: [-cMax, cMax], name, color, dash: 'dot', width: 1, hideInLegend: i > 0 }));
  const sbDrop1 = dB(a.sb1[1]) - dB(a.sb1[0]);
  const sbDrop2 = dB(a.sb2[1]) - dB(a.sb2[0]);

  return (
    <LabFrame id="LAB-CEP-01" title="켑스트럼: 줄 무리의 간격 → quefrency 봉우리, 리프터링"
      controls={<>
        <ParamSlider label="피니언 결함 (25 Hz 간격 무리)" value={p.m1} min={0} max={0.5} step={0.05} onChange={set('m1')} hint="변조 깊이" />
        <ParamSlider label={`기어 결함 (${formatNumber(F2, 4)} Hz 간격 무리)`} value={p.m2} min={0} max={0.5} step={0.05} onChange={set('m2')} hint="변조 깊이" />
        <ParamSelect label="넓은 대역 잡음" value={p.noise} options={NOISE_OPTIONS} onChange={set('noise')} />
        <ParamSelect label="리프터링" value={p.lifter} options={LIFTER_OPTIONS} onChange={set('lifter')} />
      </>}
      formulas={<>
        <Formula display tex={`c(\\tau) = \\mathcal{F}^{-1}\\{\\ln A(f)\\},\\qquad \\tau_1 = \\frac{1}{${GEAR.f1}\\ \\mathrm{Hz}} = 40\\ \\mathrm{ms},\\quad \\tau_2 = \\frac{1}{${formatNumber(F2, 4)}\\ \\mathrm{Hz}} = ${formatNumber(1000 / F2, 4)}\\ \\mathrm{ms}`} />
        <p>스펙트럼에서 Δf 간격으로 늘어선 줄 무리는 로그 스펙트럼에 주기 Δf의 물결을 만들고, 그 물결이 quefrency 1/Δf에 봉우리로 모입니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: '켑스트럼 40 ms 봉우리 (피니언)', value: a.peak1, sig: 3 },
        { label: `켑스트럼 ${formatNumber(1000 / F2, 3)} ms 봉우리 (기어)`, value: a.peak2, sig: 3 },
        { label: '2 ~ 200 ms에서 가장 큰 봉우리', value: a.topQuefrency * 1000, unit: 'ms', sig: 3 },
        { label: `${MESH + GEAR.f1} Hz 측대역 (피니언)`, value: dB(a.sb1[0]), unit: 'dB', sig: 3 },
        { label: `리프터 뒤 변화 (피니언 측대역)`, value: Math.abs(sbDrop1) < 0.05 ? 0 : sbDrop1, unit: 'dB', sig: 3 },
        { label: `리프터 뒤 변화 (기어 측대역 ${formatNumber(MESH + F2, 4)} Hz)`, value: Math.abs(sbDrop2) < 0.05 ? 0 : sbDrop2, unit: 'dB', sig: 3 },
      ]} />}
      tasks={[
        { question: '처음 상태에서 켑스트럼의 가장 큰 봉우리는 몇 ms인가요? 피니언 결함을 0으로 하면?',
          answer: '40 ms(1/25 Hz)입니다. 그 정수배(80, 120 … ms)에도 라모닉이 섭니다. 피니언 결함을 0으로 하면 40 ms 봉우리가 거의 사라지고 기어 무리의 61.7 ms와 그 정수배만 남습니다 — 정수배(185 ms)가 가장 클 수도 있으니 봉우리의 간격으로 읽습니다.' },
        { question: '리프터링을 "피니언 무리 지우기"로 바꾸면 625 Hz와 616.2 Hz 측대역은 각각 얼마나 변하나요?',
          answer: '625 Hz(피니언) 측대역은 약 15 dB 낮아지고, 616.2 Hz(기어) 측대역은 거의 그대로(약 +2 dB)입니다. 켑스트럼에서 자리가 나뉘어 있으므로 한 무리만 골라 지울 수 있습니다.' },
        { question: '잡음을 0.2 g로 키우면 켑스트럼 봉우리는? 0.01 g이면?',
          answer: '0.2 g에서는 40 ms 봉우리가 약 0.024로 낮아집니다. 측대역이 잡음 바닥에 묻혀 로그 스펙트럼의 물결이 약해지기 때문입니다. 0.01 g이면 약 0.14로 커집니다. 켑스트럼은 줄 무리가 잡음 바닥보다 위에 있어야 드러납니다.' },
      ]}
      footer={<p>신호는 설명용 예시입니다: 피니언 24이빨 {GEAR.f1 * 60} rpm, 기어 37이빨(공약수 없음), 맞물림 {MESH} Hz의 1·2·3배를 두 축의 국부 결함 펄스로 진폭 변조, f_s {GEAR.fs} Hz, {GEAR.n / GEAR.fs}초, Hann. 리프터링은 켑스트럼에서 정수배 자리 ± 0.5 ms를 0으로 만든 뒤 스펙트럼으로 되돌립니다.</p>}
    >
      <h4>스펙트럼 {MESH} Hz 둘레 (dB re 1 g)</h4>
      <Plot series={[
        { x: zoomX, y: zoomY, name: '원래', color: 'var(--text-muted)', width: 1 },
        ...(p.lifter === 'none' ? [] : [{ x: zoomX, y: zoomE, name: '리프터링 뒤', color: 'var(--plot-1)', width: 1.6 } as PlotSeries]),
      ]} x={{ label: '주파수 [Hz]', range: [500, 700] }} y={{ label: '[dB]', range: [-90, 10] }} height={220} ariaLabel="맞물림 둘레 스펙트럼" />
      <h4>켑스트럼</h4>
      <Plot series={[
        ...marks(1000 / GEAR.f1, 6, '1/25 Hz의 정수배', 'var(--plot-1)'),
        ...marks(1000 / F2, 4, `1/${formatNumber(F2, 4)} Hz의 정수배`, 'var(--plot-3)'),
        { x: cq, y: cv, name: 'c(τ)', color: 'var(--plot-2)', width: 1.2 },
      ]} x={{ label: 'quefrency [ms]', range: [0, 250] }} y={{ label: 'c(τ)', range: [-cMax * 0.5, cMax] }} height={220} ariaLabel="켑스트럼" />
    </LabFrame>
  );
}
