import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import ProbeMotion from './ProbeMotion';
import { formatNumber, texNumber } from '../../lib/format';
import { gapVoltage, PROBE, ROTOR, simulateProbe, type RunoutKind } from '../../lib/proximity';

/**
 * LAB-PROX-01 비접촉 변위 센서: gap 전압과 런아웃 (P3-2, Contents §5-1).
 * 교정 곡선 위의 동작 구간, 출력 전압(DC + AC), 전압에서 환산한 거리와 실제 거리, 진동·런아웃 성분.
 * 계산: src/lib/proximity.ts (본문 그림 2 ~ 5와 같은 모델).
 */

type Target = 'same' | 'different';
const RUNOUT_OPTIONS: { value: RunoutKind; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'mechanical', label: '기계적 (진원도·흠집)' },
  { value: 'electrical', label: '전기적 (재질·자기)' },
  { value: 'both', label: '둘 다' },
];
const TARGET_OPTIONS: { value: Target; label: string }[] = [
  { value: 'same', label: '교정할 때와 같은 재질' },
  { value: 'different', label: '다른 재질 (실제 감도 12 % 낮음 — 예시)' },
];
const S_MM = PROBE.sensitivity / 1000;
const CURVE_D = Array.from({ length: 301 }, (_, i) => (i * 3) / 300); // mm
const CURVE_V = CURVE_D.map((d) => gapVoltage(d / 1000));

export interface ProximityLabProps {
  /** 평균 gap [mm] */
  initialGap?: number;
  initialRpm?: number;
  /** 운전 3600 rpm에서의 진동 [µm pp] */
  initialVib?: number;
  initialRunout?: RunoutKind;
}

export default function ProximityLab({ initialGap = 1.2, initialRpm = 3600, initialVib = 60, initialRunout = 'none' }: ProximityLabProps) {
  const [gapMm, setGapMm] = useState(initialGap);
  const [rpm, setRpm] = useState(initialRpm);
  const [vib, setVib] = useState(initialVib);
  const [runout, setRunout] = useState<RunoutKind>(initialRunout);
  const [target, setTarget] = useState<Target>('same');

  const probe = useMemo(() => (target === 'same' ? PROBE : { ...PROBE, sensitivity: PROBE.sensitivity * 0.88 }), [target]);
  const sim = useMemo(() => simulateProbe({ gap: gapMm / 1000, rpm, vibPp: vib * 1e-6, runout, probe }), [gapMm, rpm, vib, runout, probe]);

  const deg = Array.from(sim.rev, (r) => r * 360);
  const minGap = Math.min(...sim.gap) * 1000;
  const maxGap = Math.max(...sim.gap) * 1000;
  const curveSeries: PlotSeries[] = [
    { x: CURVE_D, y: CURVE_V, name: '교정 곡선 (예시)', color: 'var(--text-muted)', width: 2 },
    { x: [PROBE.linearMin * 1000, PROBE.linearMin * 1000], y: [-22, 0], name: '선형 범위 끝', color: 'var(--status-wip)', dash: 'dash', width: 1.2 },
    { x: [PROBE.linearMax * 1000, PROBE.linearMax * 1000], y: [-22, 0], name: '선형 범위 끝', color: 'var(--status-wip)', dash: 'dash', width: 1.2, hideInLegend: true },
    { x: [minGap, maxGap], y: [gapVoltage(minGap / 1000), gapVoltage(maxGap / 1000)], name: '지금 오가는 구간', color: 'var(--plot-1)', width: 7 },
    { x: [sim.readMeanGap * 1000], y: [sim.dcVoltage], name: 'DC (평균)', mode: 'markers', color: 'var(--plot-2)', markerSize: 10 },
  ];
  const voltSeries: PlotSeries[] = [{ x: deg, y: Array.from(sim.voltage), name: '출력 전압', color: 'var(--plot-1)', width: 2 }];
  const um = (a: Float64Array, mean: number) => Array.from(a, (v) => (v - mean) * 1e6);
  const gapSeries: PlotSeries[] = [
    { x: deg, y: um(sim.gap, gapMm / 1000), name: '실제 gap 변화', color: 'var(--text-muted)', dash: 'dash', width: 1.5 },
    { x: deg, y: um(sim.readGap, sim.readMeanGap), name: '전압에서 환산', color: 'var(--plot-1)', width: 2.2 },
    { x: deg, y: Array.from(sim.vibration, (v) => -v * 1e6), name: '진동만', color: 'var(--plot-3)', width: 1.2 },
    ...(runout !== 'none' ? [{ x: deg, y: Array.from(sim.runout, (v) => v * 1e6), name: '런아웃만', color: 'var(--plot-4)', width: 1.2 } as PlotSeries] : []),
  ];
  const yLim = Math.max(20, (sim.truePp * 1e6) / 2 + 10);
  const acVpp = Math.max(...sim.voltage) - Math.min(...sim.voltage);

  return (
    <LabFrame id="LAB-PROX-01" title="비접촉 변위 센서: gap 전압과 런아웃"
      controls={<>
        <ParamSlider label="평균 gap d₀" value={gapMm} min={0.1} max={2.8} step={0.01} unit="mm" format={(v) => v.toFixed(2)} onChange={setGapMm} />
        <ParamSlider label="회전수" value={rpm} min={100} max={4000} step={50} unit="rpm" onChange={setRpm} hint={`예시 로터: 임계속도 ${ROTOR.criticalRpm} rpm, 운전 ${ROTOR.operatingRpm} rpm`} />
        <ParamSlider label="축 진동 (운전 3600 rpm에서)" value={vib} min={0} max={300} step={5} unit="µm pp" onChange={setVib} hint="다른 회전수의 진동은 불평형 응답으로 정해집니다 (P1-7)" />
        <ParamSelect label="런아웃" value={runout} options={RUNOUT_OPTIONS} onChange={setRunout} />
        <ParamSelect label="표적 재질" value={target} options={TARGET_OPTIONS} onChange={setTarget} hint="환산에는 늘 교정 감도 7.87 V/mm를 씁니다" />
      </>}
      formulas={<>
        <Formula display tex={`d = \\frac{V_{gap}}{-S} = \\frac{${texNumber(sim.dcVoltage, 4)}\\ \\mathrm{V}}{-${texNumber(S_MM, 3)}\\ \\mathrm{V/mm}} = ${texNumber(sim.readMeanGap * 1000, 4)}\\ \\mathrm{mm}`} />
        <Formula display tex={`d_{pp} = \\frac{\\Delta V_{pp}}{S} = \\frac{${texNumber(acVpp, 3)}\\ \\mathrm{V}}{${texNumber(S_MM, 3)}\\ \\mathrm{V/mm}} = ${texNumber(sim.readPp * 1e6, 3)}\\ \\mu\\mathrm{m\\ pp}`} />
        <p>{sim.linear ? '신호가 선형 범위 안에서만 오갑니다 — 환산한 진동이 실제와 같습니다.' : '신호가 선형 범위를 벗어납니다 — 범위 밖에서는 곡선이 눕기 때문에 환산한 진동이 실제와 다릅니다.'}</p>
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: 'gap 전압 (DC)', value: sim.dcVoltage, unit: 'V', sig: 4 },
        { label: '평균 거리 (전압에서 환산)', value: sim.readMeanGap * 1000, theory: gapMm, unit: 'mm', sig: 4 },
        { label: '진동 + 런아웃 pp (전압에서 환산)', value: sim.readPp * 1e6, theory: sim.truePp * 1e6, unit: 'µm', sig: 4 },
        { label: '그중 진동만 (실제)', value: sim.vibPp * 1e6, unit: 'µm pp', sig: 3 },
        { label: '그중 런아웃만 (실제)', value: sim.runoutPp * 1e6, unit: 'µm pp', sig: 3 },
      ]} />}
      tasks={[
        { question: 'gap 전압이 −9.5 V 근처가 되도록 평균 gap을 맞추면 몇 mm인가요?',
          answer: '약 1.21 mm입니다 (9.5 ÷ 7.87 = 1.207). 이때 신호는 선형 범위(0.25 ~ 2.3 mm)의 가운데쯤에서 오갑니다.' },
        { question: '평균 gap 2.4 mm, 진동 300 µm pp로 두면 환산 진동은 실제보다 얼마나 작게 읽히나요? 1.2 mm로 옮기면?',
          answer: '2.4 mm에서는 먼 쪽이 선형 범위 밖이라 약 193 µm pp로 36 % 작게 읽힙니다. 1.2 mm로 옮기면 300 µm pp 그대로입니다. 그래서 gap을 선형 범위 가운데쯤에 맞춰 설치합니다.' },
        { question: '런아웃 "둘 다"로 두고 회전수를 300 rpm으로 내리면 무엇이 남나요?',
          answer: '진동은 1 µm pp 정도로 거의 사라지고, 약 13 µm pp의 런아웃이 남습니다. 축이 거의 흔들리지 않는데도 센서는 신호를 냅니다. 이 저속 값을 운전 중 값에서 빼는 것이 Slow roll 보상입니다 (P3-3).' },
        { question: '표적 재질을 "다른 재질"로 바꾸면 진동이 몇 % 틀리게 읽히나요? 평균 거리는?',
          answer: '실제 감도가 12 % 낮은데 교정 감도로 나누므로 진동도 평균 거리도 12 % 작게 읽힙니다. 축 재질이 교정 표적과 다르면 그 재질로 다시 교정해야 합니다.' },
      ]}
      footer={<p>교정 곡선의 선형 범위 밖 모양, 런아웃 무늬, 표적 재질에 따른 감도 차이(12 %)는 설명용 예시값입니다. 진동은 임계속도 {ROTOR.criticalRpm} rpm·감쇠비 {ROTOR.zeta}인 불평형 응답으로 회전수에 따라 바뀝니다.</p>}
    >
      <h4>프로브 앞으로 축이 지나갈 때</h4>
      <ProbeMotion gapMm={gapMm} rpm={rpm} vibPp={vib * 1e-6} runout={runout} probe={probe} sim={sim} />
      <h4>교정 곡선 위에서 신호가 오가는 구간</h4>
      <Plot series={curveSeries} x={{ label: '축까지의 거리 gap [mm]', range: [0, 3] }} y={{ label: '출력 [V]', range: [-22, 0] }} height={240} ariaLabel="교정 곡선과 동작 구간" />
      <h4>출력 전압 (두 바퀴)</h4>
      <Plot series={voltSeries} x={{ label: '회전 각도 [°]', range: [0, 720] }} y={{ label: '[V]' }} height={200} ariaLabel="출력 전압 파형" />
      <h4>전압에서 환산한 gap 변화와 실제 (평균을 뺀 값)</h4>
      <Plot series={gapSeries} x={{ label: '회전 각도 [°]', range: [0, 720] }} y={{ label: 'gap 변화 [µm]', range: [-yLim, yLim] }} height={240} ariaLabel="환산 거리와 실제 거리, 진동과 런아웃 성분" />
      <p className="lab-note">{`지금 신호가 오가는 거리: ${formatNumber(minGap, 3)} ~ ${formatNumber(maxGap, 3)} mm`}</p>
    </LabFrame>
  );
}
