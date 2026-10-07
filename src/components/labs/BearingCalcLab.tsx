import { useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { bearingFrequencies, type BearingGeometry } from '../../lib/machine/frequencies';
import { ruleOfThumb, slippedFrequencies } from '../../lib/faults/bearing';

/**
 * LAB-BRG-01 베어링 결함 주파수 계산기 (P7-5, Contents §5).
 * 볼 수·볼 지름·피치 지름·접촉각·회전수·미끄럼으로 FTF·BSF(1×·2×)·BPFO·BPFI를 계산하고 어림값과 비교한다.
 * 계산: lib/machine/frequencies.ts(bearingFrequencies), lib/faults/bearing.ts(미끄럼·어림값).
 */

type PresetId = '6205' | 'angular' | 'roller';
const PRESETS: Record<PresetId, { label: string; balls: number; d: number; D: number; alpha: number }> = {
  '6205': { label: '6205 깊은 홈 볼 (CWRU 시험 베어링)', balls: 9, d: 7.94, D: 39.04, alpha: 0 },
  angular: { label: '앵귤러 볼 (가상 치수, α 40°)', balls: 12, d: 9.5, D: 46, alpha: 40 },
  roller: { label: '원통 롤러 (가상 치수)', balls: 14, d: 9, D: 52, alpha: 0 },
};
const PRESET_OPTIONS = (Object.keys(PRESETS) as PresetId[]).map((id) => ({ value: id, label: PRESETS[id].label }));

export interface BearingCalcState {
  preset: PresetId;
  balls: number;
  /** 볼 지름 d [mm] */
  d: number;
  /** 피치 지름 D [mm] */
  D: number;
  /** 접촉각 [°] */
  alpha: number;
  rpm: number;
  /** 미끄럼 [%] */
  slip: number;
}

export const DEFAULT_BEARING_CALC: BearingCalcState = { preset: '6205', balls: 9, d: 7.94, D: 39.04, alpha: 0, rpm: 3575, slip: 0 };

const COLORS = { ftf: 'var(--plot-3)', bsf: 'var(--plot-4)', bpfo: 'var(--plot-1)', bpfi: 'var(--plot-2)' };

export default function BearingCalcLab({ initial = {} }: { initial?: Partial<BearingCalcState> }) {
  const [p, setP] = useState<BearingCalcState>({ ...DEFAULT_BEARING_CALC, ...initial });
  const set = <K extends keyof BearingCalcState>(k: K) => (v: BearingCalcState[K]) => setP((q) => ({ ...q, [k]: v }));
  const choose = (id: PresetId) => setP((q) => ({ ...q, preset: id, balls: PRESETS[id].balls, d: PRESETS[id].d, D: PRESETS[id].D, alpha: PRESETS[id].alpha }));
  const fr = p.rpm / 60;
  const geo = (alphaDeg: number): BearingGeometry => ({ balls: p.balls, ballDiameter: p.d / 1000, pitchDiameter: p.D / 1000, contactAngle: (alphaDeg * Math.PI) / 180 });
  const b = bearingFrequencies(geo(p.alpha), fr);
  const sl = slippedFrequencies(geo(p.alpha), fr, p.slip / 100);
  const rule = ruleOfThumb(p.balls, fr);
  const x = (v: number) => v / fr;
  const ratio = (p.d / p.D) * Math.cos((p.alpha * Math.PI) / 180);

  // 1X 배수 축에 선 네 주파수
  const stem = (v: number, h: number, name: string, color: string, dash?: 'dash'): PlotSeries => ({ x: [x(v), x(v)], y: [0, h], name, color, width: 3, dash });
  const oMax = Math.ceil(x(b.bpfi)) + 1;
  const harmonics: PlotSeries[] = Array.from({ length: oMax }, (_, k) => k + 1).map((k) => ({ x: [k, k], y: [0, 1.15], name: '1X의 정수배', color: 'var(--text-muted)', dash: 'dot', width: 0.8, hideInLegend: k > 1 }));
  const slipped: PlotSeries[] = p.slip > 0 ? [
    { x: [x(sl.bpfo), x(sl.bpfo)], y: [0, 0.9], name: `미끄럼 ${p.slip} % 뒤`, color: 'var(--text)', dash: 'dash', width: 1.5 },
    { x: [x(sl.bpfi), x(sl.bpfi)], y: [0, 0.9], name: '', color: 'var(--text)', dash: 'dash', width: 1.5, hideInLegend: true },
  ] : [];

  // 접촉각에 따른 BPFO·BPFI [X]
  const alphas = Array.from({ length: 46 }, (_, i) => i);
  const ab = alphas.map((a) => bearingFrequencies(geo(a), fr));

  return (
    <LabFrame id="LAB-BRG-01" title="베어링 결함 주파수 계산기"
      controls={<>
        <ParamSelect label="베어링" value={p.preset} options={PRESET_OPTIONS} onChange={choose} hint="고른 뒤 아래 값을 바꿀 수 있다" />
        <ParamSlider label="볼(구름요소) 수 N_r" value={p.balls} min={5} max={20} step={1} onChange={set('balls')} />
        <ParamSlider label="볼 지름 d" value={p.d} min={3} max={20} step={0.01} unit="mm" onChange={set('d')} />
        <ParamSlider label="피치 지름 D" value={p.D} min={25} max={120} step={0.01} unit="mm" onChange={set('D')} hint={`d/D = ${formatNumber(p.d / p.D, 3)}`} />
        <ParamSlider label="접촉각 α" value={p.alpha} min={0} max={40} step={1} unit="°" onChange={set('alpha')} />
        <ParamSlider label="회전수" value={p.rpm} min={300} max={6000} step={5} unit="rpm" onChange={set('rpm')} hint={`1X = ${formatNumber(fr, 4)} Hz`} />
        <ParamSlider label="미끄럼" value={p.slip} min={0} max={3} step={0.1} unit="%" onChange={set('slip')} hint="케이지가 계산보다 늦게 도는 비율" />
      </>}
      formulas={<>
        <Formula display tex={`f_{FTF} = \\frac{f_r}{2}\\left(1 - \\frac{d}{D}\\cos\\alpha\\right) = \\frac{${texNumber(fr, 4)}}{2}\\,(1 - ${texNumber(ratio, 4)}) = ${texNumber(b.ftf, 4)}\\ \\text{Hz}`} />
        <Formula display tex={`f_{BPFO} = N_r f_{FTF} = ${texNumber(b.bpfo, 4)},\\quad f_{BPFI} = N_r (f_r - f_{FTF}) = ${texNumber(b.bpfi, 4)}\\ \\text{Hz}`} />
        <Formula display tex={`f_{BSF} = \\frac{D}{2d} f_r \\left(1 - \\left(\\frac{d}{D}\\cos\\alpha\\right)^2\\right) = ${texNumber(b.bsf, 4)}\\ \\text{Hz},\\quad 2 f_{BSF} = ${texNumber(b.bsf2, 4)}\\ \\text{Hz}`} />
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: `FTF (케이지) = ${formatNumber(x(b.ftf), 4)}X`, value: b.ftf, unit: 'Hz', sig: 4 },
        { label: `BSF 1배 (볼 자전) = ${formatNumber(x(b.bsf), 4)}X`, value: b.bsf, unit: 'Hz', sig: 4 },
        { label: `2×BSF (볼 결함 박자) = ${formatNumber(x(b.bsf2), 4)}X`, value: b.bsf2, unit: 'Hz', sig: 4 },
        { label: `BPFO (외륜) = ${formatNumber(x(b.bpfo), 4)}X`, value: b.bpfo, unit: 'Hz', sig: 4 },
        { label: `BPFI (내륜) = ${formatNumber(x(b.bpfi), 4)}X`, value: b.bpfi, unit: 'Hz', sig: 4 },
        { label: '(BPFO + BPFI) ÷ (N_r × 1X)', value: (b.bpfo + b.bpfi) / (p.balls * fr), sig: 4 },
        { label: 'BPFO 어림값 0.4·N_r·f_r', value: rule.bpfo, unit: 'Hz', sig: 4 },
        { label: 'BPFO 어림값의 차이', value: ((rule.bpfo - b.bpfo) / b.bpfo) * 100, unit: '%', sig: 2 },
        { label: 'BPFI 어림값의 차이 (0.6·N_r·f_r)', value: ((rule.bpfi - b.bpfi) / b.bpfi) * 100, unit: '%', sig: 2 },
        { label: `미끄럼 ${p.slip} % 뒤 BPFO`, value: sl.bpfo, unit: 'Hz', sig: 4 },
        { label: `미끄럼 ${p.slip} % 뒤 BPFI`, value: sl.bpfi, unit: 'Hz', sig: 4 },
      ]} />}
      tasks={[
        { question: '처음 상태(6205, 3575 rpm)에서 BPFO와 BPFI는 몇 Hz, 몇 X인가요? 어림값과는 얼마나 다른가요?',
          answer: 'BPFO 213.6 Hz(3.585X), BPFI 322.7 Hz(5.415X)입니다. 어림값 0.4 × 9 × 59.58 = 214.5 Hz, 0.6 × 9 × 59.58 = 321.8 Hz로 0.4 %·0.3 % 차이입니다. 6205는 d/D ≈ 0.2, α = 0이라 어림값이 잘 맞습니다.' },
        { question: '접촉각을 0°에서 40°로 올리면 BPFO와 BPFI는 어느 쪽으로 움직이나요? 둘의 합은?',
          answer: 'BPFO는 226.4 Hz(3.799X)로 오르고 BPFI는 309.9 Hz(5.201X)로 내립니다. cos α가 작아져 FTF가 f_r/2 쪽으로 다가가기 때문입니다. 합은 언제나 9X(536.3 Hz)입니다 — 읽음값의 "(BPFO + BPFI) ÷ (N_r × 1X)"가 1로 그대로입니다.' },
        { question: '접촉각을 0°로 되돌리고 미끄럼을 2 %로 하세요. BPFO·BPFI는 각각 어느 쪽으로 몇 % 움직이나요?',
          answer: 'BPFO는 209.3 Hz(−2 %), BPFI는 326.9 Hz(+1.3 %)입니다. 케이지가 늦게 돌면 외륜 쪽 박자는 느려지고, 내륜은 케이지를 더 자주 따라잡아 빨라집니다. 그래서 측정한 줄이 계산값과 정확히 맞기를 기대하지 않고, 정수배가 아닌 줄과 그 하모닉 무리로 찾습니다.' },
        { question: '같은 6205에서 BSF는 몇 Hz인가요? 볼 결함이 서는 자리는 어느 쪽인가요?',
          answer: 'BSF(볼 자전) 140.4 Hz, 2×BSF 280.8 Hz입니다. 볼의 흠은 한 바퀴 자전하는 동안 외륜과 내륜에 한 번씩 닿으므로 충격 박자는 2×BSF입니다. 장비나 베어링 목록이 "BSF"라고 적은 값이 1배인지 2배인지 먼저 확인합니다.' },
      ]}
      footer={<p>계산은 내륜이 축과 함께 돌고 외륜이 멈춘 경우입니다. 롤러베어링은 d를 롤러 지름으로 넣습니다. 앵귤러 볼·롤러 프리셋의 치수는 설명용 가상값입니다 — 실제 베어링은 제조사 자료의 치수나 결함 주파수 표를 씁니다.</p>}
    >
      <h4>1X의 배수로 본 자리 (점선 = 1X의 정수배)</h4>
      <Plot series={[
        ...harmonics,
        stem(b.ftf, 0.6, 'FTF', COLORS.ftf),
        stem(b.bsf, 0.5, 'BSF 1배', COLORS.bsf, 'dash'),
        stem(b.bsf2, 0.75, '2×BSF', COLORS.bsf),
        stem(b.bpfo, 1, 'BPFO', COLORS.bpfo),
        stem(b.bpfi, 1, 'BPFI', COLORS.bpfi),
        ...slipped,
      ]} x={{ label: '차수 [X]', range: [0, oMax] }} y={{ label: '', range: [0, 1.2] }} height={200} ariaLabel="결함 주파수의 차수" />
      <h4>접촉각에 따른 BPFO · BPFI [X] (지금 치수)</h4>
      <Plot series={[
        { x: alphas, y: ab.map((v) => x(v.bpfi)), name: 'BPFI', color: COLORS.bpfi, width: 2 },
        { x: alphas, y: ab.map((v) => x(v.bpfo)), name: 'BPFO', color: COLORS.bpfo, width: 2 },
        { x: [0, 45], y: [0.6 * p.balls, 0.6 * p.balls], name: '어림값', color: 'var(--text-muted)', dash: 'dot', width: 1 },
        { x: [0, 45], y: [0.4 * p.balls, 0.4 * p.balls], name: '', color: 'var(--text-muted)', dash: 'dot', width: 1, hideInLegend: true },
        { x: [p.alpha, p.alpha], y: [x(b.bpfo), x(b.bpfi)], name: '지금 α', color: 'var(--text)', dash: 'dash', width: 1.5, mode: 'lines+markers' },
      ]} x={{ label: '접촉각 α [°]', range: [0, 45] }} y={{ label: '[X]', range: [0.3 * p.balls, 0.7 * p.balls] }} height={220} ariaLabel="접촉각에 따른 결함 주파수" />
    </LabFrame>
  );
}
