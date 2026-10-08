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
import { acceptance, acceptanceOutline, phaseTrace, trendSeries, TREND_LABELS, PHASE_FLOOR, type TrendScenario } from '../../lib/plots/trend';

export default function TrendLab({ initialScenario = 'rotate' }: { initialScenario?: TrendScenario }) {
  const [scenario, setScenario] = useState<TrendScenario>(initialScenario);
  const [phaseChange, setPhaseChange] = useState(120), [growth, setGrowth] = useState(50);
  const [cursor, setCursor] = useState(60), [refIndex, setRefIndex] = useState(0);
  const [ampTol, setAmpTol] = useState(20), [phaseTol, setPhaseTol] = useState(30);
  const [continuous, setContinuous] = useState(true);
  const [bowAmp, setBowAmp] = useState(12), [mortonAmp, setMortonAmp] = useState(5);
  const [thermalLag, setThermalLag] = useState(80), [decayTime, setDecayTime] = useState(20);
  const [period, setPeriod] = useState(30), [thermalGrowth, setThermalGrowth] = useState(100);
  const isThermal = scenario === 'thermal' || scenario === 'morton';
  const samples = useMemo(() => trendSeries({ scenario, phaseChange: toRad(phaseChange), amplitudeGrowth: growth / 100, thermal: { amplitude: (scenario === 'thermal' ? bowAmp : mortonAmp) * 1e-6, lag: toRad(thermalLag), decayTime: decayTime * 60, period: period * 60, growth: thermalGrowth / 100 } }), [scenario, phaseChange, growth, bowAmp, mortonAmp, thermalLag, decayTime, period, thermalGrowth]);
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
  if (current.baseline) polar.push(
    { amp: [0, current.baseline.amp * 1e6], lagDeg: [toDeg(current.baseline.lag), toDeg(current.baseline.lag)], name: '고정 응답 U', color: 'var(--text-muted)', dash: true, arrow: true },
    { amp: [current.baseline.amp * 1e6, current.oneX.amp * 1e6], lagDeg: [toDeg(current.baseline.lag), toDeg(current.oneX.lag)], name: 'U 끝 → 합 끝: 열 기여 Q', color: 'var(--plot-3)', arrow: true },
  );
  const peakMax = Math.max(45, ...samples.map(s => s.oneX.amp * 1e6 * 1.1));
  const rmsMax = Math.max(30, ...samples.map(s => s.overall * 1e6 * 1.1));
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
      {isThermal && <>
        <ParamSlider label="초기 열 기여 진폭" value={scenario === 'thermal' ? bowAmp : mortonAmp} min={0} max={30} step={1} unit="µm Peak" onChange={scenario === 'thermal' ? setBowAmp : setMortonAmp} />
        <ParamSlider label="초기 열 기여 지연각" value={thermalLag} min={0} max={360} step={10} unit="°" onChange={setThermalLag} />
        {scenario === 'thermal' ? <ParamSlider label="감소 시간상수 τ" value={decayTime} min={5} max={60} step={5} unit="분" onChange={setDecayTime} hint="지정한 곡선의 시간상수. 실제 터닝 시간 예측이 아님" /> : <>
          <ParamSlider label="열 기여 선회 주기 P" value={period} min={10} max={60} step={5} unit="분" onChange={setPeriod} />
          <ParamSlider label="60분간 열 기여 증가율" value={thermalGrowth} min={0} max={200} step={25} unit="%" onChange={setThermalGrowth} />
        </>}
      </>}
      <ParamToggle label="연속 위상 표시" checked={continuous} onChange={setContinuous} />
    </>}
    formulas={<>
      {isThermal && <Formula display tex={scenario === 'thermal' ? '\\vec V(t)=\\vec U+B_0e^{-t/\\tau}e^{-i\\beta}' : '\\vec V(t)=\\vec U+B_0(1+gt/t_{\\rm end})e^{-i(\\beta+2\\pi t/P)},\\quad t_{\\rm end}=3600\\,\\mathrm{s}'} />}
      <Formula display tex={`\\Delta\\vec V=\\vec V(t)-\\vec V_{\\rm ref},\\quad \\lvert\\Delta\\vec V\\rvert=${tex(result.delta.amp * 1e6, 4)}\\,\\mathrm{\\mu m\\ Peak}`} />
      <Formula display tex={`x_{\\rm RMS}=\\sqrt{\\frac{A_1^2+A_2^2}{2}}=\\sqrt{\\frac{${tex(current.oneX.amp * 1e6, 3)}^2+${tex(current.twoX * 1e6, 3)}^2}{2}}=${tex(current.overall * 1e6, 4)}\\,\\mathrm{\\mu m}`} />
    </>}
    readouts={<ReadoutTable caption={`선택 ${cursor}분 / 기준 ${refIndex}분`} rows={[
      ...(current.contribution ? [
        { label: '열 기여 진폭 |Q|', value: current.contribution.amp * 1e6, unit: 'µm Peak' },
        { label: '열 기여 지연각', value: current.contribution.amp > 0 ? toDeg(current.contribution.lag) : NaN, unit: '°' },
      ] : []),
      { label: 'Overall RMS', value: current.overall * 1e6, unit: 'µm' },
      { label: '1X 진폭', value: current.oneX.amp * 1e6, unit: 'µm Peak' },
      { label: '1X 지연각 (0~360°)', value: current.oneX.amp > PHASE_FLOOR ? toDeg(current.oneX.lag) : NaN, unit: '°' },
      { label: 'Not-1X RMS (정확 제거 모델)', value: current.notOneXRms * 1e6, unit: 'µm' },
      { label: '기준 대비 진폭 차이', value: result.deltaAmplitude * 1e6, unit: 'µm Peak' },
      { label: '기준 대비 최단 위상 차이', value: result.phaseDelta === null ? NaN : toDeg(result.phaseDelta), unit: '°' },
      { label: '벡터 변화량 |ΔV|', value: result.delta.amp * 1e6, unit: 'µm Peak' },
      { label: '기준 이후 첫 이탈 표본', value: firstOutside ? firstOutside.time / 60 : NaN, unit: '분' },
    ]} />}
    tasks={isThermal ? scenario === 'thermal' ? [
      { question: '기본 설정에서 선택 시각 60분의 열 기여와 합 1X를 비교하세요. τ를 60분으로 바꾸면?', answer: 'τ=20분이면 열 기여는 0.5974 µm Peak, 합은 20.01입니다. τ=60분이면 기여 4.415, 합 20.48입니다. 모두 지정한 지수 감소 예제이며 실제 기동 대기 시간이 아닙니다.' },
      { question: '초기 열 기여 20 µm Peak, 지연각 170°, 선택 0분으로 바꾸세요.', answer: '고정 U=20 µm Peak@350°와 반대 방향이므로 합 1X=0입니다. 1X 위상과 허용 영역 판정은 보류됩니다. 작은 1X만으로 열 휨이 작다고 판단할 수 없습니다.' },
    ] : [
      { question: '기본 Morton형에서 60분의 열 기여와 합 1X의 각도를 비교하세요.', answer: '열 기여는 10 µm Peak@80°, 합은 22.36 µm Peak@16.57°입니다. 열 기여가 두 바퀴 돌아도 원점에서 읽는 합 위상이 두 바퀴 도는 것은 아닙니다.' },
      { question: '열 기여 증가율을 0%로 두고 선택 0·15·30분을 비교하세요.', answer: '반지름 5 µm Peak의 닫힌 원은 30분에 시작점으로 돌아옵니다. 15분에서는 시작 대비 벡터 변화 10 µm Peak입니다. 끝점이 같아도 중간 기록은 변했습니다.' },
    ] : [
      { question: '초기 상태에서 진폭차와 벡터 변화량을 비교하세요. 1X 크기가 그대로인데 무엇이 달라졌나요?', answer: '진폭차는 0, 위상차는 120°, 벡터 변화량은 34.64 µm Peak입니다. Overall은 14.21 µm RMS로 일정하지만 벡터 끝은 이동했습니다.' },
      { question: '선택 60분·기준 0분에서 기준을 30분으로 바꾸면 벡터 변화량은?', answer: '기준과 선택의 위상차가 120°에서 60°로 줄어 34.64→20 µm Peak입니다. 기준을 바꾸면 비교하는 질문도 바뀝니다. 변화가 사라졌다고 기록하지 마세요.' },
      { question: '기준 0분·선택 60분에서 2X 증가 시나리오를 고르세요. Overall과 Not-1X의 증가율은?', answer: 'Overall은 14.21→15.23 µm RMS(약 7.17%)입니다. 정확하게 1X를 제거한 모델의 Not-1X는 1.414→5.657 µm RMS(4배)이며 1X 벡터는 그대로입니다.' },
    ]}
    footer={<p>{isThermal && '열 휨·Morton형은 지정한 시간 곡선의 복소 합입니다. 열전달·유막 피드백·기동 허용·원인 확정을 계산하지 않습니다. 열 기여 Q는 해당 센서의 응답 기여이며 기하학적 축 휨과 같지 않습니다. 합 1X≤1 µm Peak는 이 예제에서 위상과 영역 판정을 보류합니다. '} 모든 값은 일정 운전 조건의 가상 변위입니다. 성분 진폭은 Peak, Overall·잔여는 RMS입니다. 허용 영역은 임의 학습값이며 규격·알람·트립 설정이 아닙니다. 1분마다 기록하므로 첫 이탈은 관측한 표본 시각입니다. 연속 위상은 모델의 알려진 경로이며 실제 성긴 기록에서 자동 복원된 값이 아닙니다.</p>}
  >
    <h4>스칼라 트렌드: 대역 전체와 성분별 RMS</h4>
    <Plot series={[
      { x: time, y: samples.map(s => s.overall * 1e6), name: 'Overall', color: 'var(--plot-1)' },
      { x: time, y: samples.map(s => s.oneXRms * 1e6), name: '1X RMS', color: 'var(--plot-2)', dash: 'dash' },
      { x: time, y: samples.map(s => s.notOneXRms * 1e6), name: 'Not-1X RMS', color: 'var(--plot-4)' }, marker(rmsMax),
    ]} x={{ label: '시각 [분]', range: [0, 60] }} y={{ label: '변위 [µm RMS]', range: [0, rmsMax] }} height={220} ariaLabel="스칼라 RMS 시간 추세" />
    <h4>APHT: 같은 1X의 진폭과 지연각</h4>
    <Plot series={[{ x: time, y: samples.map(s => s.oneX.amp * 1e6), name: '1X 진폭', color: 'var(--plot-1)' }, ...(isThermal ? [{ x: time, y: samples.map(s => s.contribution!.amp * 1e6), name: '열 기여 |Q|', color: 'var(--plot-3)', dash: 'dash' as const }] : []), marker(peakMax)]} x={{ label: '시각 [분]' }} y={{ label: '1X [µm Peak]', range: [0, peakMax] }} height={170} ariaLabel="APHT 진폭" />
    <Plot series={[{ x: trace.time.map(t => t / 60), y: trace.lag.map(toDeg), name: continuous ? '연속 지연각' : '접힌 지연각', color: 'var(--plot-2)' }]} x={{ label: '시각 [분]' }} y={{ label: '지연각 [°]', ...(continuous ? {} : { range: [0, 360] as [number, number] }) }} height={180} ariaLabel="APHT 위상" />
    <h4>벡터 트렌드: 같은 기록을 Polar로</h4>
    <PolarPlot series={polar} rMax={rMax} unit="µm Peak" ariaLabel="1X 벡터 시간 경로와 학습용 허용 영역" />
    <p role="status">{status}. 진폭 차이 {result.relativeAmplitude === null ? '보류' : `${fmt(result.relativeAmplitude * 100, 3)}%`}, 최단 지연 차이 {result.phaseDelta === null ? '보류' : `${fmt(toDeg(result.phaseDelta), 4)}°`}. 진폭 허용폭 ±{ampTol}%, 지연 허용폭 ±{phaseTol}°를 둘 다 만족해야 영역 안입니다.</p>
  </LabFrame>;
}
