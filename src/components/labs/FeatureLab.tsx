import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { FEAT, featureSignal, featureTrend, G, stageModel } from '../../lib/cepstrumDemo';

/**
 * LAB-FEAT-01 시간영역 특징량: 결함이 진행하는 동안 RMS · Crest factor · 첨도의 추세 (P5-7, Contents §5).
 * 신호·계산: lib/cepstrumDemo.ts (featureSignal), lib/dsp/stats.ts (본문 그림 7과 같은 신호).
 */

const T_SHOW = 0.05;

export default function FeatureLab({ initial = 0.3 }: { initial?: number }) {
  const [s, setS] = useState(initial);
  const cur = useMemo(() => featureSignal(s), [s]);
  const trend = useMemo(() => featureTrend(), []);
  const healthy = trend.f[0];
  const f = cur.features;
  const m = stageModel(s);
  const nShow = Math.round(T_SHOW * FEAT.fs);
  const tMs = Array.from({ length: nShow }, (_, i) => (i / FEAT.fs) * 1000);
  const sx = trend.s.map((v) => v * 100);
  const marker = (y: number, top: number): PlotSeries[] => [
    { x: [s * 100, s * 100], y: [0, top], name: '지금', color: 'var(--status-wip)', dash: 'dash', width: 1.5, hideInLegend: true },
    { x: [s * 100], y: [y], name: '지금', color: 'var(--status-wip)', mode: 'markers', markerSize: 9, hideInLegend: true },
  ];
  const yMax = Math.max(...trend.f.map((v) => v.peak / G)) * 1.05;

  return (
    <LabFrame id="LAB-FEAT-01" title="시간영역 특징량: 결함이 진행하는 동안의 추세"
      controls={<>
        <ParamSlider label="결함 진행 (설명용)" value={Math.round(s * 1000) / 10} min={0} max={100} step={2.5} unit="%" onChange={(v) => setS(v / 100)} hint="0 = 건전, 100 = 손상이 넓게 퍼짐" />
      </>}
      formulas={<>
        <Formula display tex={`\\mathrm{CF} = \\frac{\\text{Peak}}{\\text{RMS}} = \\frac{${texNumber(f.peak / G, 3)}}{${texNumber(f.rms / G, 3)}} = ${texNumber(f.crest, 3)},\\qquad K = \\frac{E[(x-\\mu)^4]}{\\sigma^4} = ${texNumber(f.kurtosis, 3)}`} />
        <p>지금 모델: 결함 충격 {texNumber(m.impact / G, 2)} g(BPFO 박자), 여기저기 생기는 충격 초당 {Math.round(m.spreadRate)}번, 넓은 대역 잡음 σ {texNumber(m.noise / G, 2)} g.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값 (이론 열 = 건전할 때)" rows={[
        { label: 'RMS', value: f.rms / G, theory: healthy.rms / G, unit: 'g', sig: 3 },
        { label: 'Peak', value: f.peak / G, theory: healthy.peak / G, unit: 'g', sig: 3 },
        { label: 'Crest factor', value: f.crest, theory: healthy.crest, sig: 3 },
        { label: '첨도 K', value: f.kurtosis, theory: healthy.kurtosis, sig: 3 },
        { label: '왜도 S', value: Math.abs(f.skewness) < 0.005 ? 0 : f.skewness, sig: 2 },
      ]} />}
      tasks={[
        { question: '진행 0 → 30 %로 옮기면 RMS와 첨도는 각각 몇 배가 되나요?',
          answer: 'RMS는 0.087 → 0.17 g로 약 2배, 첨도는 2.36 → 10.7로 약 4.5배입니다. 초기에는 드문 충격이 커지므로 첨도와 CF가 RMS보다 먼저, 크게 반응합니다.' },
        { question: '진행 55 %와 100 %의 첨도를 비교하세요. 100 %의 첨도만 보고 "좋아졌다"고 해도 되나요?',
          answer: '55 %에서 약 14.8, 100 %에서 약 3.4로 내려옵니다. 손상이 넓어져 충격이 자주 겹치면 신호가 정규 잡음처럼 되기 때문입니다. 같은 동안 RMS는 0.31 → 0.82 g로 계속 올랐으므로 좋아진 것이 아닙니다 — 특징량 하나가 아니라 여러 개의 추세를 함께 봅니다.' },
        { question: '진행 100 % 근처에서 슬라이더를 조금씩 움직이면 CF가 들쭉날쭉합니다. 왜일까요?',
          answer: 'Peak는 표본 하나(가장 큰 값)로 정해지므로 잡음의 우연한 봉우리에 흔들립니다. RMS와 첨도는 모든 표본을 평균하므로 더 안정적입니다.' },
      ]}
      footer={<p>신호는 설명용 모델입니다: 베어링 하우징 가속도(f_s {FEAT.fs} Hz, 1초) = 1X {FEAT.a1 / G} g + 바탕 잡음 + 외륜 결함 충격(BPFO {FEAT.bpfo} Hz, 공진 {FEAT.resonance} Hz, ζ {FEAT.zeta}). 진행에 따라 결함 충격이 커지고(10 ~ 55 %), 그 뒤 임의 시각의 충격과 넓은 대역 잡음이 늘어납니다(50 ~ 100 %). 실제 결함의 진행 속도와 값은 기계마다 다릅니다.</p>}
    >
      <h4>지금의 파형 (50 ms)</h4>
      <Plot series={[{ x: tMs, y: Array.from(cur.x.slice(0, nShow), (v) => v / G), name: '가속도', color: 'var(--plot-1)', width: 1 }]}
        x={{ label: '시각 [ms]', range: [0, T_SHOW * 1000] }} y={{ label: '[g]', range: [-yMax, yMax] }} height={180} ariaLabel="가속도 파형" />
      <h4>RMS [g]</h4>
      <Plot series={[{ x: sx, y: trend.f.map((v) => v.rms / G), name: 'RMS', color: 'var(--plot-1)', width: 2, mode: 'lines+markers', markerSize: 4 }, ...marker(f.rms / G, 1)]}
        x={{ label: '결함 진행 [%]', range: [0, 100] }} y={{ range: [0, 1] }} height={150} ariaLabel="RMS 추세" />
      <h4>Crest factor</h4>
      <Plot series={[{ x: sx, y: trend.f.map((v) => v.crest), name: 'CF', color: 'var(--plot-4)', width: 2, mode: 'lines+markers', markerSize: 4 }, ...marker(f.crest, 8)]}
        x={{ label: '결함 진행 [%]', range: [0, 100] }} y={{ range: [2, 8] }} height={150} ariaLabel="Crest factor 추세" />
      <h4>첨도 K</h4>
      <Plot series={[
        { x: sx, y: trend.f.map((v) => v.kurtosis), name: '첨도', color: 'var(--plot-2)', width: 2, mode: 'lines+markers', markerSize: 4 },
        { x: [0, 100], y: [3, 3], name: '정규 잡음 = 3', color: 'var(--text-muted)', dash: 'dot', width: 1 },
        ...marker(f.kurtosis, 16),
      ]} x={{ label: '결함 진행 [%]', range: [0, 100] }} y={{ range: [0, 16] }} height={170} ariaLabel="첨도 추세" />
    </LabFrame>
  );
}
