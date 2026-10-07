import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import { formatNumber, texNumber } from '../../lib/format';
import { kurtogramGrid } from '../../lib/dsp/envelope';
import { analyzeKurtogram, BRG, ENV, G, type Fault } from '../../lib/envelopeDemo';

/**
 * LAB-SK-01 Spectral Kurtosis · Kurtogram: 충격이 있는 대역을 자동으로 찾아 엔벨로프 분석에 넘긴다 (P5-6, Contents §5).
 * 신호·계산: lib/envelopeDemo.ts, lib/dsp/envelope.ts (본문 그림 6 · 7과 같은 신호).
 */

const FAULT_OPTIONS: { value: Fault; label: string }[] = [
  { value: 'outer', label: '외륜 흠 (BPFO)' },
  { value: 'inner', label: '내륜 흠 (BPFI)' },
  { value: 'none', label: '결함 없음' },
];
const HI_OPTIONS = [0, 0.3, 1].map((v) => ({ value: v, label: `${v} g` }));
const GEAR_OPTIONS = [0, 1, 3].map((v) => ({ value: v, label: `${v} g` }));
const LEVEL_OPTIONS = [4, 5, 6].map((v) => ({ value: v, label: `${v} (가장 좁은 폭 ${ENV.fs / 2 / 2 ** v} Hz)` }));

export interface KurtogramLabState {
  fault: Fault;
  impact: number;
  hiNoise: number;
  gear: number;
  maxLevel: number;
}

export const DEFAULT_KURTOGRAM_LAB: KurtogramLabState = { fault: 'outer', impact: 0.6, hiNoise: 0.3, gear: 1, maxLevel: 6 };

export default function KurtogramLab({ initial = {} }: { initial?: Partial<KurtogramLabState> }) {
  const [p, setP] = useState<KurtogramLabState>({ ...DEFAULT_KURTOGRAM_LAB, ...initial });
  const set = <K extends keyof KurtogramLabState>(k: K) => (v: KurtogramLabState[K]) => setP((q) => ({ ...q, [k]: v }));
  const a = useMemo(() => analyzeKurtogram({ fault: p.fault, impact: p.impact * G, hiNoise: p.hiNoise * G, gearScale: p.gear }, p.maxLevel), [p]);
  const b = a.kg.best;
  const NL = a.kg.levels.length;
  const grid = useMemo(() => kurtogramGrid(a.kg, ENV.fs, 256), [a]);
  const xc = Array.from({ length: grid.x.length - 1 }, (_, i) => (grid.x[i] + grid.x[i + 1]) / 2);
  // 세로 = 레벨, 축을 뒤집어 레벨 1(넓은 대역)이 위
  const levels = a.kg.levels;
  const zRows = grid.z.map((r) => Array.from(r));
  const yPos = (lev: number) => lev;
  const fault = p.fault === 'inner' ? BRG.bpfi : BRG.bpfo;
  const faultName = p.fault === 'inner' ? 'BPFI' : 'BPFO';
  const skX: number[] = [];
  const skY: number[] = [];
  a.sk.freq.forEach((f, k) => {
    if (k > 0 && k < a.sk.freq.length - 1) {
      skX.push(f);
      skY.push(a.sk.sk[k]);
    }
  });
  const envMax = Math.max(0.02, ...Array.from(a.best.env.amp, (v) => v / G)) * 1.15;
  // 가로가 "대역 가운데"이므로 가운데 ± 반 칸에 테두리 (대역 자체는 f1 ~ f2)
  const lo = b.fc - b.bw / 4;
  const hi = b.fc + b.bw / 4;
  const best: PlotSeries = { x: [lo, hi, hi, lo, lo], y: [yPos(b.level) - 0.5, yPos(b.level) - 0.5, yPos(b.level) + 0.5, yPos(b.level) + 0.5, yPos(b.level) - 0.5], name: '가장 큰 SK', color: 'var(--text)', width: 2 };

  return (
    <LabFrame id="LAB-SK-01" title="Spectral Kurtosis · Kurtogram: 충격 대역 자동으로 찾기"
      controls={<>
        <ParamSelect label="베어링 상태" value={p.fault} options={FAULT_OPTIONS} onChange={set('fault')} />
        <ParamSlider label="충격 크기" value={p.impact} min={0} max={1} step={0.05} unit="g" onChange={set('impact')} />
        <ParamSelect label="기어 맞물림 (1200 Hz)" value={p.gear} options={GEAR_OPTIONS} onChange={set('gear')} />
        <ParamSelect label="5 ~ 7 kHz 잡음" value={p.hiNoise} options={HI_OPTIONS} onChange={set('hiNoise')} />
        <ParamSelect label="가장 깊은 레벨" value={p.maxLevel} options={LEVEL_OPTIONS} onChange={set('maxLevel')} />
      </>}
      formulas={<>
        <Formula display tex={`\\mathrm{SK} = \\frac{E\\lvert c\\rvert^4}{(E\\lvert c\\rvert^2)^2} - 2,\\qquad \\text{가장 큰 칸: } ${texNumber(b.f1, 4)} \\sim ${texNumber(b.f2, 4)}\\ \\mathrm{Hz},\\ \\mathrm{SK} = ${texNumber(b.sk, 3)}`} />
        <p>c는 그 대역만 남긴 신호의 복소 포락선(해석 신호)입니다. 정규분포 잡음만 있으면 0, 크기가 일정한 정현파는 −1, 충격이 드문드문 섞이면 양수입니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: '추천 대역 가운데', value: b.fc, unit: 'Hz', sig: 4 },
        { label: '추천 대역 폭', value: b.bw, unit: 'Hz', sig: 4 },
        { label: '추천 대역의 SK', value: b.sk, sig: 3 },
        { label: '원신호 전체의 첨도 K (정규 잡음 = 3)', value: a.rawKurtosis, sig: 3 },
        { label: `추천 대역 엔벨로프: ${faultName} 줄 ÷ 바닥`, value: a.best.floor > 0 ? a.best.lines[0] / a.best.floor : 0, unit: '배', sig: 3 },
      ]} />}
      tasks={[
        { question: '처음 상태에서 Kurtogram이 고른 대역은? 원신호 전체의 첨도는 3보다 큰가요?',
          answer: '레벨 3의 2560 ~ 3584 Hz(폭 1024 Hz, SK 약 1.0)로, 결함이 울리는 3.3 kHz를 담습니다. 원신호 전체의 첨도는 약 2.3으로 3보다 작습니다 — 크기가 일정한 기어 맞물림이 신호를 지배해서, 전체 첨도로는 충격이 보이지 않습니다.' },
        { question: '충격 크기를 0.1 g로 줄이면 추천 대역은? 베어링 상태를 "결함 없음"으로 하면?',
          answer: '0.1 g에서도 같은 대역을 고르지만 SK가 약 0.3으로 낮아집니다. 결함이 없으면 좁은 칸 하나(SK 약 0.3)를 고릅니다 — Kurtogram은 결함이 없어도 늘 "가장 큰 칸"을 고르므로, SK가 잡음의 흔들림 수준인지 결함이 없는 기록과 비교해 판단합니다.' },
        { question: '기어 맞물림을 0으로 하면 추천 대역과 SK는? 3 g로 키우면?',
          answer: '0이면 2048 ~ 4096 Hz(SK 약 2.5)를 고릅니다. 2400 Hz의 기어 2배가 사라져 넓은 대역에도 충격만 남기 때문입니다. 3 g로 키워도 추천 대역은 2560 ~ 3584 Hz 그대로입니다 — 크기가 큰 성분이 있어도 SK는 충격성을 봅니다.' },
      ]}
      footer={<p>신호는 LAB-ENV-01과 같은 설명용 예시입니다 (f_s {ENV.fs} Hz, 2초). Kurtogram은 레벨 k마다 폭 {ENV.fs / 2}/2^k Hz의 칸을 반 칸씩 옮겨 가며 SK를 잽니다 (Antoni의 Fast Kurtogram은 1/3 단계까지 쓴다). SK(f)는 64점(3.9 ms) 프레임의 STFT로 구했습니다.</p>}
    >
      <h4>Kurtogram (위로 갈수록 넓은 대역, 진할수록 큰 SK)</h4>
      <Plot series={[best]} heatmap={{ x: xc, y: levels, z: zRows, zRange: [0, Math.max(1, b.sk)], colorLabel: 'SK' }}
        x={{ label: '대역 가운데 주파수 [Hz]', range: [0, ENV.fs / 2] }} y={{ label: `레벨 k (폭 ${ENV.fs / 2}/2^k Hz)`, range: [NL + 0.5, 0.5] }} height={260} ariaLabel="Kurtogram" />
      <h4>Spectral Kurtosis SK(f)</h4>
      <Plot series={[
        { x: skX, y: skY, name: 'SK(f)', color: 'var(--plot-2)', width: 1.8 },
        { x: [0, ENV.fs / 2], y: [0, 0], name: '정규 잡음 = 0', color: 'var(--text-muted)', dash: 'dash', width: 1 },
      ]} x={{ label: '주파수 [Hz]', range: [0, ENV.fs / 2] }} y={{ label: 'SK', range: [-1.2, Math.max(1.2, ...skY) * 1.1] }} height={190} ariaLabel="Spectral Kurtosis" />
      <h4>추천 대역 {formatNumber(b.f1, 4)} ~ {formatNumber(b.f2, 4)} Hz의 엔벨로프 스펙트럼</h4>
      <Plot series={[
        { x: Array.from(a.best.env.freq), y: Array.from(a.best.env.amp, (v) => v / G), name: '엔벨로프 스펙트럼', color: 'var(--plot-2)', width: 1.4 },
        ...[1, 2, 3].map((k): PlotSeries => ({ x: [k * fault, k * fault], y: [0, envMax], name: `${faultName} 하모닉`, color: 'var(--text-muted)', dash: 'dot', width: 1.2, hideInLegend: k > 1 })),
      ]} x={{ label: '주파수 [Hz]', range: [0, 1000] }} y={{ label: '[g]', range: [0, envMax] }} height={200} ariaLabel="추천 대역의 엔벨로프 스펙트럼" />
    </LabFrame>
  );
}
