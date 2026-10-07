import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import { analyzeEnvelope, BRG, envSignal, ENV, G, type Fault } from '../../lib/envelopeDemo';

/**
 * LAB-ENV-01 엔벨로프 분석: 대역 고르기 → 포락선 → 엔벨로프 스펙트럼 (P5-6, Contents §5).
 * 신호·계산: lib/envelopeDemo.ts, lib/dsp/envelope.ts (본문 그림 1 ~ 4·8과 같은 신호).
 */

const FAULT_OPTIONS: { value: Fault; label: string }[] = [
  { value: 'outer', label: '외륜 흠 (BPFO)' },
  { value: 'inner', label: '내륜 흠 (BPFI)' },
  { value: 'none', label: '결함 없음' },
];
const BW_OPTIONS = [250, 500, 1000, 2000].map((v) => ({ value: v, label: `${v} Hz` }));
const HI_OPTIONS = [0, 0.3, 1].map((v) => ({ value: v, label: `${v} g` }));
const T_SHOW = 0.05;

export interface EnvelopeLabState {
  fault: Fault;
  /** 충격 크기 [g] */
  impact: number;
  /** 대역 가운데 [Hz] */
  center: number;
  /** 대역 폭 [Hz] */
  width: number;
  /** 5 ~ 7 kHz 잡음 [g] */
  hiNoise: number;
}

export const DEFAULT_ENVELOPE_LAB: EnvelopeLabState = { fault: 'outer', impact: 0.6, center: 3300, width: 1000, hiNoise: 0.3 };

export interface EnvelopeLabProps {
  initial?: Partial<EnvelopeLabState>;
}

export default function EnvelopeLab({ initial = {} }: EnvelopeLabProps) {
  const [p, setP] = useState<EnvelopeLabState>({ ...DEFAULT_ENVELOPE_LAB, ...initial });
  const set = <K extends keyof EnvelopeLabState>(k: K) => (v: EnvelopeLabState[K]) => setP((q) => ({ ...q, [k]: v }));
  const f1 = Math.max(0, p.center - p.width / 2);
  const f2 = Math.min(ENV.fs / 2, p.center + p.width / 2);
  const sig = useMemo(() => envSignal({ fault: p.fault, impact: p.impact * G, hiNoise: p.hiNoise * G }), [p.fault, p.impact, p.hiNoise]);
  const a = useMemo(() => analyzeEnvelope(sig, f1, f2), [sig, f1, f2]);
  const raw = useMemo(() => {
    const s = singleSidedSpectrum({ fs: ENV.fs, x: sig.x }, { window: 'hann' });
    const x: number[] = [];
    const y: number[] = [];
    for (let k = 0; k + 8 <= s.frequency.length; k += 8) {
      let m = 0;
      for (let j = 0; j < 8; j++) m = Math.max(m, s.amplitude[k + j]);
      x.push(s.frequency[k + 4]);
      y.push(20 * Math.log10(Math.max(m / G, 1e-6)));
    }
    return { x, y };
  }, [sig]);

  const nShow = Math.round(T_SHOW * ENV.fs);
  const tMs = Array.from({ length: nShow }, (_, i) => (i / ENV.fs) * 1000);
  const fault = p.fault === 'inner' ? BRG.bpfi : BRG.bpfo;
  const faultName = p.fault === 'inner' ? 'BPFI' : 'BPFO';
  const vline = (x: number, top: number, name: string, color: string, hide = true): PlotSeries => ({ x: [x, x], y: [0, top], name, color, dash: 'dot', width: 1.2, hideInLegend: hide });
  const envMax = Math.max(0.02, ...Array.from(a.env.amp, (v) => v / G)) * 1.15;
  const ratio = a.floor > 0 ? a.lines[0] / a.floor : 0;

  return (
    <LabFrame id="LAB-ENV-01" title="엔벨로프 분석: 대역 고르기 → 포락선 → 엔벨로프 스펙트럼"
      controls={<>
        <ParamSelect label="베어링 상태" value={p.fault} options={FAULT_OPTIONS} onChange={set('fault')} />
        <ParamSlider label="충격 크기" value={p.impact} min={0} max={1} step={0.05} unit="g" onChange={set('impact')} hint="울림 첫 봉우리" />
        <ParamSlider label="대역 가운데" value={p.center} min={500} max={7700} step={100} unit="Hz" onChange={set('center')} />
        <ParamSelect label="대역 폭" value={p.width} options={BW_OPTIONS} onChange={set('width')} />
        <ParamSelect label="5 ~ 7 kHz 잡음" value={p.hiNoise} options={HI_OPTIONS} onChange={set('hiNoise')} hint="다른 원인의 넓은 대역 잡음" />
      </>}
      formulas={<>
        <Formula display tex={`x_a = x_{[${texNumber(f1, 4)},\\,${texNumber(f2, 4)}]} + j\\,\\mathcal{H}\\{x_{[\\cdots]}\\},\\qquad \\mathrm{env}(t) = \\lvert x_a(t)\\rvert`} />
        <p>대역 폭 {p.width} Hz의 포락선은 {p.width} Hz보다 빠르게 변할 수 없으므로, 엔벨로프 스펙트럼은 0 ~ {p.width} Hz만 담습니다. {faultName} {formatNumber(fault, 4)} Hz의 3배({formatNumber(3 * fault, 4)} Hz)까지 보려면 폭이 그보다 넓어야 합니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값 (엔벨로프 스펙트럼)" rows={[
        { label: `${faultName} 줄`, value: a.lines[0] / G, unit: 'g', sig: 2 },
        { label: `${faultName} × 2 줄`, value: a.lines[1] / G, unit: 'g', sig: 2 },
        { label: '바닥 (중앙값)', value: a.floor / G, unit: 'g', sig: 2 },
        { label: `${faultName} 줄 ÷ 바닥`, value: ratio, unit: '배', sig: 3 },
        { label: '가장 큰 줄의 주파수', value: a.topHz, theory: p.fault === 'none' ? undefined : fault, unit: 'Hz', sig: 4 },
        { label: '대역 신호의 첨도 K', value: a.bandKurtosis, sig: 3 },
      ]} />}
      tasks={[
        { question: '처음 상태(외륜, 대역 2800 ~ 3800 Hz)에서 BPFO 줄은 바닥의 몇 배인가요? 대역 가운데를 1200 Hz로 옮기면 가장 큰 줄은 몇 Hz인가요?',
          answer: '약 180배로 BPFO(179.2 Hz)와 그 2배·3배가 또렷합니다. 1200 Hz(기어 맞물림)로 옮기면 가장 큰 줄이 50 Hz(1X)가 됩니다. 기어가 1X로 변조되어 있어서입니다 — 결함과 상관없는 줄입니다.' },
        { question: '대역 가운데를 6000 Hz로 옮기면? 5 ~ 7 kHz 잡음을 0으로 하면 달라지나요?',
          answer: '6000 Hz 대역에서는 BPFO 줄이 바닥의 2배쯤으로 묻힙니다. 잡음을 0으로 하면 줄이 바닥의 약 9.5배로 다시 섭니다 — 울림의 꼬리가 6 kHz까지 조금 닿기 때문입니다. 결함 신호가 다른 원인보다 큰 대역을 골라야 한다는 뜻이고, 그 대역을 숫자로 찾는 것이 Kurtogram입니다.' },
        { question: '대역 가운데 3300 Hz에서 폭을 250 Hz로 줄이면 BPFO × 2 줄은? 2000 Hz로 넓히면?',
          answer: '250 Hz 폭의 포락선은 250 Hz보다 빨리 변할 수 없어 2배(358 Hz) 줄이 거의 사라집니다. 2000 Hz로 넓히면 줄은 남지만 기어 2배(2400 Hz)가 섞여 바닥이 올라갑니다. 공진을 담되 다른 성분은 빼는 폭이 좋습니다.' },
        { question: '베어링 상태를 "내륜 흠"으로 바꾸면 엔벨로프 스펙트럼에 무엇이 서나요?',
          answer: 'BPFI(270.8 Hz)와 그 양옆 1X(50 Hz) 간격의 측대역, 그리고 1X 자체가 섭니다. 결함이 축과 함께 돌며 하중 영역을 드나들어 충격 크기가 1X로 오르내리기 때문입니다.' },
      ]}
      footer={<p>신호는 설명용 예시입니다: 3000 rpm 축의 6205 베어링(BPFO {formatNumber(BRG.bpfo, 4)} Hz, BPFI {formatNumber(BRG.bpfi, 4)} Hz), 하우징 공진 {ENV.resonance} Hz(ζ {ENV.zeta}), 기어 맞물림 {ENV.gearHz} Hz 1 g(1X 변조), 넓은 대역 잡음, f_s {ENV.fs} Hz, 2초. 대역 통과는 FFT에서 대역 밖을 0으로 만드는 방법(영위상)입니다.</p>}
    >
      <h4>원신호 스펙트럼 (dB re 1 g)과 고른 대역</h4>
      <Plot series={[
        { x: raw.x, y: raw.y, name: '원신호', color: 'var(--plot-1)', width: 1.2 },
        { x: [f1, f1], y: [-80, 10], name: '고른 대역', color: 'var(--plot-2)', dash: 'dash', width: 2 },
        { x: [f2, f2], y: [-80, 10], name: '고른 대역', color: 'var(--plot-2)', dash: 'dash', width: 2, hideInLegend: true },
      ]} x={{ label: '주파수 [Hz]', range: [0, ENV.fs / 2] }} y={{ label: '[dB]', range: [-80, 10] }} height={200} ariaLabel="원신호 스펙트럼과 대역" />
      <h4>대역 신호와 포락선 (50 ms)</h4>
      <Plot series={[
        { x: tMs, y: Array.from(a.env.band.slice(0, nShow), (v) => v / G), name: '대역 신호', color: 'var(--plot-1)', width: 1 },
        { x: tMs, y: Array.from(a.env.envelope.slice(0, nShow), (v) => v / G), name: '포락선', color: 'var(--plot-2)', width: 2 },
      ]} x={{ label: '시각 [ms]', range: [0, T_SHOW * 1000] }} y={{ label: '[g]' }} height={200} ariaLabel="대역 신호와 포락선" />
      <h4>엔벨로프 스펙트럼</h4>
      <Plot series={[
        { x: Array.from(a.env.freq), y: Array.from(a.env.amp, (v) => v / G), name: '엔벨로프 스펙트럼', color: 'var(--plot-2)', width: 1.4 },
        vline(fault, envMax, `${faultName} 하모닉`, 'var(--text-muted)', false),
        vline(2 * fault, envMax, '', 'var(--text-muted)'),
        vline(3 * fault, envMax, '', 'var(--text-muted)'),
        vline(ENV.fr, envMax, '1X', 'var(--status-wip)', false),
      ]} x={{ label: '주파수 [Hz]', range: [0, 1000] }} y={{ label: '[g]', range: [0, envMax] }} height={220} ariaLabel="엔벨로프 스펙트럼" />
    </LabFrame>
  );
}
