import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import {
  cepAt,
  GEAR_DEMO,
  GEAR_FAULT_LABEL,
  GEAR_FAULTS,
  GEAR_PAIR,
  gearCepstrum,
  gearTsa,
  SIDE_LABEL,
  SIDED,
  TSA_LABEL,
  type GearFault,
  type GearSide,
  type TsaSignal,
} from '../../lib/faults/gear';

/**
 * LAB-GEAR-02 TSA와 켑스트럼: 어느 축의 몇 번 이빨인가 (P7-6, Contents §5).
 * 고른 축의 키페이저 기준으로 M바퀴 평균(TSA)한 한 바퀴와 Residual·Difference, FM4, 켑스트럼을 본다.
 * 신호·계산: lib/faults/gear.ts (본문 그림 7 ~ 8과 같은 신호, 정도 60 %·부하 80 %).
 */

const FAULT_OPTIONS = GEAR_FAULTS.map((f) => ({ value: f, label: GEAR_FAULT_LABEL[f] }));
const SIDE_OPTIONS = (['pinion', 'gear'] as GearSide[]).map((s) => ({ value: s, label: SIDE_LABEL[s] }));
const AVG_OPTIONS = (['pinion', 'gear'] as GearSide[]).map((s) => ({ value: s, label: s === 'pinion' ? `피니언 축 (f₁ = ${formatNumber(GEAR_PAIR.f1, 4)} Hz)` : `기어 축 (f₂ = ${formatNumber(GEAR_PAIR.f2, 4)} Hz)` }));
const SIGNAL_OPTIONS = (['tsa', 'residual', 'difference'] as TsaSignal[]).map((s) => ({ value: s, label: TSA_LABEL[s] }));
const P = GEAR_PAIR;

export interface GearTsaState {
  fault: GearFault;
  side: GearSide;
  /** TSA 기준 축 */
  avg: GearSide;
  revs: number;
  signal: TsaSignal;
  answer: boolean;
}

const vline = (x: number, top: number, bottom: number, name: string, color: string, hide: boolean, dash: 'dash' | 'dot' = 'dot'): PlotSeries => ({ x: [x, x], y: [bottom, top], name, color, dash, width: 1.3, hideInLegend: hide });

export default function GearTsaLab({ initial = {} }: { initial?: Partial<GearTsaState> }) {
  const [p, setP] = useState<GearTsaState>({ fault: 'broken', side: 'gear', avg: 'gear', revs: 15, signal: 'residual', answer: false, ...initial });
  const set = <K extends keyof GearTsaState>(k: K) => (v: GearTsaState[K]) => setP((q) => ({ ...q, [k]: v }));
  const o = useMemo(() => ({ fault: p.fault, side: p.side, severity: 0.6, load: 0.8 }), [p.fault, p.side]);
  const t = useMemo(() => gearTsa(o, p.avg, p.revs), [o, p.avg, p.revs]);
  const cep = useMemo(() => gearCepstrum(o), [o]);
  const sided = SIDED[p.fault];
  const y = p.signal === 'tsa' ? t.tsa : p.signal === 'residual' ? t.residual : t.difference;
  const yMax = Math.max(0.3, ...Array.from(y).map(Math.abs)) * 1.15;
  const z = p.avg === 'pinion' ? GEAR_DEMO.z1 : GEAR_DEMO.z2;
  const fShaft = p.avg === 'pinion' ? P.f1 : P.f2;

  // 정답: 고른 축에 결함 이빨이 있으면 그 자리
  const defectTooth = p.avg === 'pinion' ? GEAR_DEMO.pinionTooth : GEAR_DEMO.gearTooth;
  const hasDefect = (p.fault === 'broken' && p.side === p.avg) || p.fault === 'hunting';
  const answerAngle = (360 * (defectTooth + GEAR_DEMO.offset)) / z;

  const cx: number[] = [];
  const cy: number[] = [];
  for (let q = 0; q < cep.quefrency.length && cep.quefrency[q] <= 0.25; q++) {
    if (cep.quefrency[q] < 0.005) continue;
    cx.push(cep.quefrency[q] * 1000);
    cy.push(cep.c[q]);
  }
  const cMax = Math.max(0.05, ...cy) * 1.15;

  return (
    <LabFrame id="LAB-GEAR-02" title="TSA와 켑스트럼: 어느 축의 몇 번 이빨인가"
      controls={<>
        <ParamSelect label="결함" value={p.fault} options={FAULT_OPTIONS} onChange={set('fault')} />
        <ParamSelect label="결함이 있는 기어" value={p.side} options={SIDE_OPTIONS} onChange={set('side')} disabled={!sided} />
        <ParamSelect label="TSA 기준 축 (그 축의 키페이저로 자른다)" value={p.avg} options={AVG_OPTIONS} onChange={set('avg')} />
        <ParamSlider label="평균할 바퀴 수 M" value={p.revs} min={1} max={60} step={1} unit="바퀴" onChange={set('revs')} hint={`측정 시간 ${formatNumber(p.revs / fShaft, 3)} s`} />
        <ParamSelect label="보기" value={p.signal} options={SIGNAL_OPTIONS} onChange={set('signal')} />
        <ParamToggle label="결함 이빨 자리 보기 (정답)" checked={p.answer} onChange={set('answer')} />
      </>}
      readouts={<ReadoutTable caption={`읽음값 (${GEAR_FAULT_LABEL[p.fault]}${sided ? ` · ${p.side === 'pinion' ? '피니언' : '기어'}` : ''}, ${p.avg === 'pinion' ? '피니언' : '기어'} 축 TSA ${p.revs}바퀴)`} rows={[
        { label: 'FM4 = Difference 신호의 첨도 (건전 ≈ 3)', value: t.fm4, sig: 3 },
        { label: 'Residual의 가장 큰 |값|', value: Math.max(...Array.from(t.residual).map(Math.abs)), unit: 'g', sig: 2 },
        { label: 'Residual이 가장 큰 각도', value: t.peakAngle, unit: '°', sig: 4 },
        { label: `그 각도의 이빨 번호 (키페이저 다음 첫 이빨 = 1, 모두 ${z}개)`, value: t.peakTooth, unit: '번', sig: 3 },
        { label: `켑스트럼 — 피니언 한 바퀴 1/f₁ = ${formatNumber(1000 / P.f1, 4)} ms 자리`, value: cepAt(cep, 1 / P.f1), sig: 2 },
        { label: `켑스트럼 — 기어 한 바퀴 1/f₂ = ${formatNumber(1000 / P.f2, 4)} ms 자리`, value: cepAt(cep, 1 / P.f2), sig: 2 },
      ]} />}
      tasks={[
        { question: '처음 상태(깨진 이·기어, 기어 축 TSA 15바퀴, Residual)에서 봉우리는 몇 도, 몇 번 이빨인가요? "결함 이빨 자리 보기"로 맞춰 보세요.',
          answer: '약 102°, 18번 이빨입니다(이빨 한 칸 = 360° ÷ 61 = 5.9°). FM4는 약 100으로 건전한 기어(약 3)보다 훨씬 큽니다. 기어 축 기준으로 자르면 그 축의 이빨은 매 바퀴 같은 각도에 오므로 평균해도 남습니다.' },
        { question: '같은 결함에서 TSA 기준 축을 피니언으로 바꾸고, 바퀴 수를 1 → 5 → 15 → 40으로 늘리며 FM4를 보세요.',
          answer: 'FM4가 약 33 → 17 → 5.3 → 3.5로 내려가 건전한 감속기(약 3.6)와 같아집니다. 기어 이빨의 충격은 피니언 각도로는 바퀴마다 다른 자리에 오므로(회전수비 2.652가 정수가 아니다) 평균할수록 사라집니다. 1바퀴만 보면 어느 축의 결함인지 모릅니다 — 충분히 평균해야 축이 갈립니다.' },
        { question: '결함 기어를 피니언으로 바꾸고 피니언 축 TSA 40바퀴로 보세요. 이빨 번호와 켑스트럼은?',
          answer: '6번 이빨(약 84°)에서 봉우리가 서고 FM4는 약 35입니다. 켑스트럼은 피니언 한 바퀴 자리(40.27 ms)가 약 0.11로 건전(약 0.009)보다 크고, 기어 한 바퀴 자리(106.8 ms)는 그대로입니다.' },
        { question: '편심(기어)을 고르고 기어 축 TSA를 Residual → Difference로 바꾸세요. FM4는?',
          answer: 'Residual에는 측대역 한 쌍이 만드는 맞물림 물결(크기가 한 바퀴 동안 천천히 오르내린다)이 남지만, ±1 측대역까지 뺀 Difference에는 거의 잡음만 남아 FM4가 약 3.7로 건전(약 3.2)과 비슷합니다. FM4는 고르게 퍼진 변화(편심)가 아니라 한 이빨에 몰린 변화(깨진 이)에 반응하도록 만든 숫자입니다. 편심은 측대역 한 쌍(LAB-GEAR-01)으로 봅니다.' },
      ]}
      footer={<p>설명용 모델입니다: LAB-GEAR-01과 같은 감속기(정도 60 %, 부하 80 %). 회전수가 일정하고 각 축의 키페이저가 있다고 두고, 한 바퀴 {GEAR_DEMO.spr}점으로 각도 재샘플링을 마친 신호를 평균합니다 (회전수가 변하면 P5-4의 차수추적으로 먼저 각도를 맞춥니다). 켑스트럼은 8 s 시간 기록의 것입니다.</p>}
    >
      <h4>{TSA_LABEL[p.signal]} — {p.avg === 'pinion' ? '피니언' : '기어'} 축 한 바퀴</h4>
      <Plot series={[
        { x: t.angle, y, name: TSA_LABEL[p.signal], color: p.avg === 'pinion' ? 'var(--plot-2)' : 'var(--plot-1)', width: 1.1 },
        ...(p.answer && hasDefect ? [vline(answerAngle, yMax, -yMax, `결함 이빨 (${defectTooth + 1}번) 맞물림 시작`, 'var(--status-wip)', false, 'dash')] : []),
      ]} x={{ label: '그 축의 각도 [°] (키페이저 = 0°)', range: [0, 360] }} y={{ label: '[g]', range: [-yMax, yMax] }} height={230} ariaLabel="TSA 한 바퀴" />
      {p.answer && !hasDefect && <p className="lab-note">이 결함은 고른 축에 깨진 이빨이 없습니다.</p>}
      <h4>켑스트럼 (5 ~ 250 ms) — 점선: 피니언 한 바퀴(주황)·기어 한 바퀴(초록)의 정수배</h4>
      <Plot series={[
        { x: cx, y: cy, name: '켑스트럼', color: 'var(--plot-1)', width: 1 },
        ...[1, 2, 3, 4, 5, 6].map((k) => vline((1000 * k) / P.f1, cMax, -0.03, '1/f₁의 정수배', 'var(--plot-2)', k > 1)),
        ...[1, 2].map((k) => vline((1000 * k) / P.f2, cMax, -0.03, '1/f₂의 정수배', 'var(--plot-3)', k > 1)),
      ]} x={{ label: 'quefrency [ms]', range: [5, 250] }} y={{ label: 'c(τ)', range: [-0.03, cMax] }} height={200} ariaLabel="켑스트럼" />
    </LabFrame>
  );
}
