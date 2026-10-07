import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import PolarPlot, { type PolarSeries } from '../ui/PolarPlot';
import Formula from '../ui/Formula';
import ReadoutTable from '../ui/ReadoutTable';
import { toDeg, toRad } from '../../lib/phase';
import { formatNumber as fmt, texNumber as tex } from '../../lib/format';
import { acceptance, acceptanceOutline, phaseTrace, trendSeries, TREND_LABELS, type TrendScenario } from '../../lib/plots/trend';

export default function TrendLab() {
  const [scenario, setScenario] = useState<TrendScenario>('rotate');
  const [phaseChange, setPhaseChange] = useState(120), [growth, setGrowth] = useState(50);
  const [cursor, setCursor] = useState(60), [refIndex, setRefIndex] = useState(0);
  const [ampTol, setAmpTol] = useState(20), [phaseTol, setPhaseTol] = useState(30);
  const [continuous, setContinuous] = useState(true);
  const samples = useMemo(() => trendSeries({ scenario, phaseChange: toRad(phaseChange), amplitudeGrowth: growth / 100 }), [scenario, phaseChange, growth]);
  const current = samples[cursor], ref = samples[refIndex];
  const region = { amplitudeFraction: ampTol / 100, phaseHalfWidth: toRad(phaseTol) };
  const result = acceptance(current.oneX, ref.oneX, region);
  const afterReference = samples.slice(refIndex);
  const firstOutside = afterReference.find(s => acceptance(s.oneX, ref.oneX, region).inside === false);
  const boundary = acceptanceOutline(ref.oneX, region);
  const polar: PolarSeries[] = [
    { amp: boundary.map(v => v.amp * 1e6), lagDeg: boundary.map(v => toDeg(v.lag)), name: '학습용 허용 영역 경계', color: 'var(--plot-3)', dash: true },
    { amp: samples.map(s => s.oneX.amp * 1e6), lagDeg: samples.map(s => toDeg(s.oneX.lag)), name: '1X 시간 경로', color: 'var(--plot-1)' },
    { amp: [0, ref.oneX.amp * 1e6], lagDeg: [toDeg(ref.oneX.lag), toDeg(ref.oneX.lag)], name: '기준 벡터', color: 'var(--text-muted)', arrow: true },
    { amp: [0, current.oneX.amp * 1e6], lagDeg: [toDeg(current.oneX.lag), toDeg(current.oneX.lag)], name: '선택 벡터', color: 'var(--plot-2)', arrow: true },
    { amp: [ref.oneX.amp * 1e6, current.oneX.amp * 1e6], lagDeg: [toDeg(ref.oneX.lag), toDeg(current.oneX.lag)], name: '기준 끝 → 선택 끝', color: 'var(--plot-4)', arrow: true },
  ];
  const time = samples.map(s => s.time / 60);
  const trace = phaseTrace(samples, continuous);
  const marker = (high: number) => ({ x: [cursor, cursor], y: [0, high], name: '선택 시각', color: 'var(--text-muted)', dash: 'dash' as const, hideInLegend: true });
  const status = result.inside === null ? '판정 보류' : result.inside ? '허용 영역 안' : '허용 영역 밖';
  // 데이터·경계 중 큰 쪽에 맞춰 Polar를 채운다 (기본 약 28 µm, 진폭 증가 시나리오에서 커짐)
  const rMax = Math.max(5, ...samples.map(s => s.oneX.amp * 1e6), ...boundary.map(v => v.amp * 1e6)) * 1.15;
  return <LabFrame id="LAB-TRND-01" title="같은 크기, 다른 벡터: 트렌드·APHT"
    controls={<>
      <ParamSelect label="시나리오" value={scenario} options={(Object.keys(TREND_LABELS) as TrendScenario[]).map(value => ({ value, label: TREND_LABELS[value] }))} onChange={setScenario} />
      <ParamSlider label="최종 지연각 변화" value={phaseChange} min={0} max={360} step={10} unit="°" disabled={scenario !== 'rotate'} onChange={setPhaseChange} />
      <ParamSlider label="최종 1X 진폭 증가" value={growth} min={0} max={100} step={10} unit="%" disabled={scenario !== 'grow'} onChange={setGrowth} />
      <ParamSlider label="선택 시각" value={cursor} min={0} max={60} step={1} unit="분" onChange={setCursor} />
      <ParamSlider label="기준 시각" value={refIndex} min={0} max={60} step={1} unit="분" onChange={setRefIndex} hint="같은 운전 조건의 기준점을 고르는 연습" />
      <ParamSlider label="진폭 허용폭 ±" value={ampTol} min={0} max={50} step={5} unit="%" onChange={setAmpTol} />
      <ParamSlider label="지연각 허용폭 ±" value={phaseTol} min={0} max={180} step={5} unit="°" onChange={setPhaseTol} />
      <ParamToggle label="연속 위상 표시" checked={continuous} onChange={setContinuous} />
    </>}
    formulas={<>
      <Formula display tex={`\\Delta\\vec V=\\vec V(t)-\\vec V_{\\rm ref},\\quad \\lvert\\Delta\\vec V\\rvert=${tex(result.delta.amp * 1e6, 4)}\\,\\mathrm{\\mu m\\ Peak}`} />
      <Formula display tex={`x_{\\rm RMS}=\\sqrt{\\frac{A_1^2+A_2^2}{2}}=\\sqrt{\\frac{${tex(current.oneX.amp * 1e6, 3)}^2+${tex(current.twoX * 1e6, 3)}^2}{2}}=${tex(current.overall * 1e6, 4)}\\,\\mathrm{\\mu m}`} />
    </>}
    readouts={<ReadoutTable caption={`선택 ${cursor}분 / 기준 ${refIndex}분`} rows={[
      { label: 'Overall RMS', value: current.overall * 1e6, unit: 'µm' },
      { label: '1X 진폭', value: current.oneX.amp * 1e6, unit: 'µm Peak' },
      { label: '1X 지연각 (0~360°)', value: toDeg(current.oneX.lag), unit: '°' },
      { label: 'Not-1X RMS (정확 제거 모델)', value: current.notOneXRms * 1e6, unit: 'µm' },
      { label: '기준 대비 진폭 차이', value: result.deltaAmplitude * 1e6, unit: 'µm Peak' },
      { label: '기준 대비 최단 위상 차이', value: result.phaseDelta === null ? NaN : toDeg(result.phaseDelta), unit: '°' },
      { label: '벡터 변화량 |ΔV|', value: result.delta.amp * 1e6, unit: 'µm Peak' },
      { label: '기준 이후 첫 이탈 표본', value: firstOutside ? firstOutside.time / 60 : NaN, unit: '분' },
    ]} />}
    tasks={[
      { question: '초기 상태에서 진폭차와 벡터 변화량을 비교하세요. 1X 크기가 그대로인데 무엇이 달라졌나요?', answer: '진폭차는 0, 위상차는 120°, 벡터 변화량은 34.64 µm Peak입니다. Overall은 14.21 µm RMS로 일정하지만 벡터 끝은 이동했습니다.' },
      { question: '선택 60분·기준 0분에서 기준을 30분으로 바꾸면 벡터 변화량은?', answer: '기준과 선택의 위상차가 120°에서 60°로 줄어 34.64→20 µm Peak입니다. 기준을 바꾸면 비교하는 질문도 바뀝니다. 변화가 사라졌다고 기록하지 마세요.' },
      { question: '기준 0분·선택 60분에서 2X 증가 시나리오를 고르세요. Overall과 Not-1X의 증가율은?', answer: 'Overall은 14.21→15.23 µm RMS(약 7.17%)입니다. 정확하게 1X를 제거한 모델의 Not-1X는 1.414→5.657 µm RMS(4배)이며 1X 벡터는 그대로입니다.' },
    ]}
    footer={<p>모든 값은 일정 운전 조건의 가상 변위입니다. 성분 진폭은 Peak, Overall·잔여는 RMS입니다. 허용 영역은 임의 학습값이며 규격·알람·트립 설정이 아닙니다. 1분마다 기록하므로 첫 이탈은 관측한 표본 시각입니다. 연속 위상은 모델의 알려진 경로이며 실제 성긴 기록에서 자동 복원된 값이 아닙니다.</p>}
  >
    <h4>스칼라 트렌드: 대역 전체와 성분별 RMS</h4>
    <Plot series={[
      { x: time, y: samples.map(s => s.overall * 1e6), name: 'Overall', color: 'var(--plot-1)' },
      { x: time, y: samples.map(s => s.oneXRms * 1e6), name: '1X RMS', color: 'var(--plot-2)', dash: 'dash' },
      { x: time, y: samples.map(s => s.notOneXRms * 1e6), name: 'Not-1X RMS', color: 'var(--plot-4)' }, marker(30),
    ]} x={{ label: '시각 [분]', range: [0, 60] }} y={{ label: '변위 [µm RMS]', range: [0, 30] }} height={220} ariaLabel="스칼라 RMS 시간 추세" />
    <h4>APHT: 같은 1X의 진폭과 지연각</h4>
    <Plot series={[{ x: time, y: samples.map(s => s.oneX.amp * 1e6), name: '1X 진폭', color: 'var(--plot-1)' }, marker(45)]} x={{ label: '시각 [분]' }} y={{ label: '1X [µm Peak]', range: [0, 45] }} height={170} ariaLabel="APHT 진폭" />
    <Plot series={[{ x: trace.time.map(t => t / 60), y: trace.lag.map(toDeg), name: continuous ? '연속 지연각' : '접힌 지연각', color: 'var(--plot-2)' }]} x={{ label: '시각 [분]' }} y={{ label: '지연각 [°]', ...(continuous ? {} : { range: [0, 360] as [number, number] }) }} height={180} ariaLabel="APHT 위상" />
    <h4>벡터 트렌드: 같은 기록을 Polar로</h4>
    <PolarPlot series={polar} rMax={rMax} unit="µm Peak" ariaLabel="1X 벡터 시간 경로와 학습용 허용 영역" />
    <p role="status">{status}. 진폭 차이 {fmt((result.relativeAmplitude ?? 0) * 100, 3)}%, 최단 지연 차이 {result.phaseDelta === null ? '보류' : `${fmt(toDeg(result.phaseDelta), 4)}°`}. 진폭 허용폭 ±{ampTol}%, 지연 허용폭 ±{phaseTol}°를 둘 다 만족해야 영역 안입니다.</p>
  </LabFrame>;
}
