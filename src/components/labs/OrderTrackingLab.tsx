import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import type { InterpMethod } from '../../lib/dsp/order';
import { analyzeOrder, DEFAULT_ORDER_PARAMS, ORD, orderRun, type OrderParams, type Reference } from '../../lib/orderDemo';

/**
 * LAB-ORD-01 차수추적: 시간 FFT vs 차수 스펙트럼 (P5-4, Contents §5).
 * 같은 프레임을 고정 f_s 그대로(Hann FFT)와 키페이저 각도에 맞춘 재샘플링(차수 스펙트럼)으로 본다.
 * 계산: lib/dsp/order.ts, 예시 신호·분석: lib/orderDemo.ts (본문 그림 2 ~ 5와 같은 계산).
 */

const REF_OPTIONS: { value: Reference; label: string }[] = [
  { value: 'keyphasor', label: '키페이저' },
  { value: 'tacholess', label: '키페이저 없음 (스펙트로그램 능선)' },
];
const POW_OPTIONS = [16, 32, 64, 128].map((v) => ({ value: v, label: String(v) }));
const INTERP_OPTIONS: { value: InterpMethod; label: string }[] = [
  { value: 'cubic', label: '3차' },
  { value: 'linear', label: '선형' },
];
const um = 1e6;
const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);

export interface OrderTrackingLabProps {
  initial?: Partial<OrderParams>;
}

export default function OrderTrackingLab({ initial = {} }: OrderTrackingLabProps) {
  const [p, setP] = useState<OrderParams>({ ...DEFAULT_ORDER_PARAMS, ...initial });
  const set = <K extends keyof OrderParams>(k: K) => (v: OrderParams[K]) => setP((q) => ({ ...q, [k]: v }));
  const a = useMemo(() => analyzeOrder(p), [p]);
  const run = orderRun(p.rate);

  const fMax = 150;
  const tf: PlotSeries = {
    x: Array.from(a.timeFreq).filter((f) => f <= fMax),
    y: Array.from(a.timeAmp.slice(0, Array.from(a.timeFreq).filter((f) => f <= fMax).length), (v) => v * um),
    name: '시간 기반 FFT (Hann)',
    color: 'var(--plot-2)',
    width: 1.6,
  };
  const oMaxShow = p.spr / 2;
  const nO = Array.from(a.spectrum.order).filter((o) => o <= oMaxShow).length;
  const os: PlotSeries = { x: Array.from(a.spectrum.order.slice(0, nO)), y: Array.from(a.spectrum.amplitude.slice(0, nO), (v) => v * um), name: '차수 스펙트럼', color: 'var(--plot-1)', width: 1.6 };
  const omaxLine: PlotSeries = { x: [a.orderMax, a.orderMax], y: [0, 28], name: `최대 차수 ${formatNumber(a.orderMax, 3)}`, color: 'var(--text-muted)', dash: 'dash', width: 1.2 };
  const foldLine: PlotSeries = { x: [p.spr / 2, p.spr / 2], y: [0, 28], name: `접히는 곳 ${p.spr / 2}`, color: 'var(--status-wip)', dash: 'dot', width: 1.2 };

  // 회전수: 실제 vs (키페이저/능선) 펄스 간격으로 본 회전수
  const pulses = a.pulsesUsed;
  const rpmT: number[] = [];
  const rpmV: number[] = [];
  for (let k = 1; k < pulses.length; k++) {
    const tm = 0.5 * (pulses[k] + pulses[k - 1]);
    if (tm < a.tStart - 0.2 || tm > a.tEnd + 0.2) continue;
    rpmT.push(tm);
    rpmV.push(60 / (pulses[k] - pulses[k - 1]));
  }
  const rpmSeries: PlotSeries[] = [
    { x: [a.tStart - 0.2, a.tEnd + 0.2], y: [run.rpmAt(a.tStart - 0.2), run.rpmAt(a.tEnd + 0.2)], name: '실제 회전수', color: 'var(--text-muted)', width: 2 },
    { x: rpmT, y: rpmV, name: p.reference === 'keyphasor' ? '키페이저 간격으로 본 회전수' : '능선 적분으로 만든 펄스의 회전수', mode: 'markers', color: 'var(--plot-1)', markerSize: 4 },
    { x: [a.tStart, a.tStart], y: [ORD.rpm0 - 100, a.rpmEnd + 100], name: '프레임', color: 'var(--status-wip)', dash: 'dash', width: 1, hideInLegend: false },
    { x: [a.tEnd, a.tEnd], y: [ORD.rpm0 - 100, a.rpmEnd + 100], name: '프레임 끝', color: 'var(--status-wip)', dash: 'dash', width: 1, hideInLegend: true },
  ];

  return (
    <LabFrame id="LAB-ORD-01" title="차수추적: 시간 FFT vs 차수 스펙트럼"
      controls={<>
        <ParamSelect label="각도 기준" value={p.reference} options={REF_OPTIONS} onChange={set('reference')} />
        <ParamSlider label="가속률" value={p.rate} min={0} max={300} step={10} unit="rpm/s" onChange={set('rate')} hint="프레임 시작에서 1500 rpm" />
        <ParamSelect label="프레임 바퀴 수 N_rev" value={p.revs} options={POW_OPTIONS} onChange={set('revs')} />
        <ParamSelect label="회전당 샘플 수 N_spr" value={p.spr} options={POW_OPTIONS} onChange={set('spr')} />
        <ParamSelect label="신호 보간" value={p.interp} options={INTERP_OPTIONS} onChange={set('interp')} />
        <ParamToggle label="차수 영역 에일리어싱 방지" checked={p.antiAlias} onChange={set('antiAlias')} hint="회전당 256점으로 찍고 걸러서 솎는다" />
      </>}
      formulas={<>
        <Formula display tex={`\\Delta o = \\frac{1}{N_{rev}} = \\frac{1}{${p.revs}} = ${texNumber(a.deltaOrder, 3)},\\qquad o_{max} = \\frac{N_{spr}}{2.56} = \\frac{${p.spr}}{2.56} = ${texNumber(a.orderMax, 3)}`} />
        <Formula display tex={`T = ${texNumber(a.tEnd - a.tStart, 3)}\\ \\mathrm{s}\\ \\text{동안}\\ ${texNumber(a.rpmStart, 4)} \\to ${texNumber(a.rpmEnd, 4)}\\ \\mathrm{rpm}`} />
        <p>차수 스펙트럼은 정수 바퀴 프레임이라 Uniform 윈도우를 씁니다. 시간 기반 FFT는 같은 시간 구간을 Hann 윈도우로 봅니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값 (참값: 1X 25 µm, 2X 8 µm, 23X 3 µm)" rows={[
        { label: '1X — 차수 스펙트럼', value: a.amp1 * um, theory: ORD.a1 * um, unit: 'µm', sig: 4 },
        { label: '1X — 시간 FFT의 가장 높은 봉우리', value: a.timePeak1 * um, theory: ORD.a1 * um, unit: 'µm', sig: 4 },
        { label: '2X — 차수 스펙트럼', value: a.amp2 * um, theory: ORD.a2 * um, unit: 'µm', sig: 4 },
        { label: '23X — 차수 스펙트럼', value: clean(a.ampHigh * um), theory: a.orderMax >= ORD.highOrder ? ORD.aHigh * um : 0, unit: 'µm', sig: 3 },
        { label: '9X — 차수 스펙트럼 (가짜 줄 확인)', value: clean((a.spectrum.amplitude[Math.round(9 / a.deltaOrder)] ?? 0) * um), theory: 0, unit: 'µm', sig: 3 },
        ...(a.ridgeErrRpm !== undefined ? [{ label: '능선 회전수의 최대 오차 (프레임 안)', value: a.ridgeErrRpm, unit: 'rpm', sig: 3 }] : []),
      ]} />}
      tasks={[
        { question: '가속률을 0으로 두면 시간 FFT와 차수 스펙트럼의 1X는 어떻게 되나요? 300 rpm/s로 올리면?',
          answer: '0이면 둘 다 25 µm 근처로 같습니다. 300 rpm/s에서는 시간 FFT 봉우리가 약 11 µm로 낮아지고 넓게 번지지만, 차수 스펙트럼의 1X는 25 µm 그대로입니다. 반대로 고정 95 Hz 성분은 차수 스펙트럼에서 번집니다.' },
        { question: '회전당 샘플 수를 32로 두고 에일리어싱 방지를 끄면 어디에 가짜 줄이 서나요? 켜면?',
          answer: '23X가 차수 16(= 32/2)을 넘어 32 − 23 = 9X에 약 3 µm의 가짜 줄로 섭니다. 켜면 차수 영역에서 걸러져 사라지고, 23X도 최대 차수 12.5 밖이라 보이지 않습니다. 23X를 보려면 회전당 64점 이상이 필요합니다.' },
        { question: '신호 보간을 선형으로 바꾸면 23X는 얼마나 작게 읽히나요? 1X는?',
          answer: '23X는 약 8 % 작게(약 2.76 µm), 3차 보간은 약 1.6 % 작게 읽힙니다. 1X는 두 방법 모두 거의 그대로입니다. 높은 차수일수록 보간 오차가 커집니다.' },
        { question: '각도 기준을 "키페이저 없음"으로 바꾸면 1X와 23X는? 위상은 읽을 수 있나요?',
          answer: '1X는 거의 그대로(약 24.9 µm)지만 23X는 각도 오차가 23배로 커져 번지면서 약 0.5 µm로 낮아집니다. 각도의 시작점을 모르므로 위상은 읽을 수 없습니다 — 밸런싱처럼 위상이 필요한 일에는 키페이저가 있어야 합니다.' },
      ]}
      footer={<p>신호는 설명용 예시입니다 (f_s {ORD.fs} Hz, 1X 25 µm · 2X 8 µm · 23X 3 µm · 고정 95 Hz 4 µm · 잡음 0.2 µm, 진폭은 일정). 키페이저 시각은 각도가 정수 바퀴가 되는 시각으로 정확히 주었습니다.</p>}
    >
      <h4>같은 프레임: 시간 기반 FFT (가로축 Hz)</h4>
      <Plot series={[tf]} x={{ label: '주파수 [Hz]', range: [0, fMax] }} y={{ label: '[µm]', range: [0, 28] }} height={220} ariaLabel="시간 기반 FFT" />
      <h4>차수 스펙트럼 (가로축 = 차수)</h4>
      <Plot series={[os, omaxLine, foldLine]} x={{ label: '차수', range: [0, oMaxShow] }} y={{ label: '[µm]', range: [0, 28] }} height={220} ariaLabel="차수 스펙트럼" />
      <h4>각도 기준: 펄스 간격으로 본 회전수</h4>
      <Plot series={rpmSeries} x={{ label: '시각 [s]' }} y={{ label: '[rpm]' }} height={200} ariaLabel="회전수와 프레임" />
    </LabFrame>
  );
}
