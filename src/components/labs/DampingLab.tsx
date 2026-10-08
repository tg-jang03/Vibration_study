import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import DampingMotion from './DampingMotion';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { freeResponse, freeResponseAt, sdofProperties } from '../../lib/mck';

const DURATION = 2;
const POINTS = 1601;
const MASS = 1;

function clean(value: number): number {
  return Math.abs(value) < 1e-12 ? 0 : value;
}

export default function DampingLab() {
  const [zeta, setZeta] = useState(0.05);
  const [frequencyHz, setFrequencyHz] = useState(5);
  const [x0Mm, setX0Mm] = useState(10);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [showPeaks, setShowPeaks] = useState(true);

  const omegaN = 2 * Math.PI * frequencyHz;
  const stiffness = MASS * omegaN ** 2;
  const damping = 2 * zeta * MASS * omegaN;
  const system = useMemo(() => ({ mass: MASS, stiffness, damping }), [damping, stiffness]);
  const properties = useMemo(() => sdofProperties(system), [system]);
  const x0 = x0Mm / 1000;
  const time = useMemo(() => Array.from({ length: POINTS }, (_, i) => (DURATION * i) / (POINTS - 1)), []);
  const response = useMemo(() => freeResponse(system, { x0 }, time), [system, time, x0]);
  const underdamped = properties.omegaD !== null;
  const alpha = zeta * omegaN;
  const phaseAmplitude = underdamped ? x0 / Math.sqrt(1 - zeta ** 2) : Number.NaN;
  const envelope = useMemo(() => underdamped ? time.map((t) => 1000 * phaseAmplitude * Math.exp(-alpha * t)) : [], [underdamped, time, phaseAmplitude, alpha]);
  const displacement = useMemo(() => response.map(state => clean(1000 * state.x)), [response]);

  const peakData = useMemo(() => {
    const omegaD = properties.omegaD;
    if (omegaD === null || omegaD === 0) return { t: [] as number[], x: [] as number[] };
    const dampedPeriod = (2 * Math.PI) / omegaD;
    const count = Math.floor(DURATION / dampedPeriod);
    const t = Array.from({ length: count + 1 }, (_, i) => i * dampedPeriod);
    return { t, x: t.map((value) => 1000 * freeResponseAt(system, { x0 }, value).x) };
  }, [properties.omegaD, system, x0]);

  const logDecrement = properties.logDecrement ?? Number.NaN;
  // 읽음값의 "측정"은 그려진 파형의 첫 두 양의 피크에서 잰다 (2초 안에 피크가 둘 없으면 —)
  const hasTwoPeaks = underdamped && peakData.x.length >= 2 && peakData.x[1] > 0;
  const measuredPeakRatio = hasTwoPeaks ? peakData.x[1] / peakData.x[0] : Number.NaN;
  const measuredDelta = hasTwoPeaks ? clean(Math.log(peakData.x[0] / peakData.x[1])) : Number.NaN;
  const estimatedZeta = hasTwoPeaks
    ? measuredDelta / Math.sqrt((2 * Math.PI) ** 2 + measuredDelta ** 2)
    : Number.NaN;
  const halfCycles = hasTwoPeaks ? (measuredDelta === 0 ? Number.POSITIVE_INFINITY : Math.log(2) / measuredDelta) : Number.NaN;
  const frequencyRatio = underdamped ? (properties.omegaD as number) / properties.omegaN : Number.NaN;
  const regimeName = properties.regime === 'undamped'
    ? '감쇠 없음'
    : properties.regime === 'underdamped'
      ? '부족감쇠: 진동하며 복귀'
      : properties.regime === 'critical'
        ? '임계감쇠: 진동 없이 가장 빠르게 복귀'
        : '과감쇠: 진동 없이 천천히 복귀';

  const series = useMemo<PlotSeries[]>(() => [
    { x: time, y: displacement, name: '변위 x(t)', color: 'var(--plot-1)', width: 2.4 },
    { x: [0, DURATION], y: [0, 0], name: '평형 위치', color: '#94a3b8', dash: 'dash', width: 1.2 },
    ...(showEnvelope && underdamped ? [
      { x: time, y: envelope, name: '위쪽 포락선', color: 'var(--text-muted)', dash: 'dash' as const, width: 1.4 },
      { x: time, y: envelope.map((value) => -value), name: '아래쪽 포락선', color: 'var(--text-muted)', dash: 'dash' as const, width: 1.4, hideInLegend: true },
    ] : []),
    ...(showPeaks && underdamped ? [
      { x: peakData.t, y: peakData.x, name: '같은 방향의 피크', color: 'var(--plot-2)', mode: 'markers' as const, markerSize: 8 },
    ] : []),
  ], [envelope, peakData, displacement, showEnvelope, showPeaks, time, underdamped]);

  const yLimit = underdamped && showEnvelope
    ? Math.max(x0Mm, phaseAmplitude * 1000) * 1.12
    : x0Mm * 1.12;

  return (
    <LabFrame
      id="LAB-DAMP-01"
      title="감쇠는 몇 주기 동안 진동을 남길까?"
      controls={
        <>
          <ParamSlider label="감쇠비 ζ" value={zeta} min={0} max={1.5} step={0.01} format={(value) => value.toFixed(2)} onChange={setZeta} />
          <ParamSlider label="고유진동수 fₙ" value={frequencyHz} min={1} max={20} step={0.5} unit="Hz" onChange={setFrequencyHz} />
          <ParamSlider label="처음 변위 x₀" value={x0Mm} min={2} max={20} step={1} unit="mm" onChange={setX0Mm} />
          <ParamToggle label="포락선 표시" checked={showEnvelope} disabled={!underdamped} onChange={setShowEnvelope} />
          <ParamToggle label="같은 방향 피크 표시" checked={showPeaks} disabled={!underdamped} onChange={setShowPeaks} />
        </>
      }
      formulas={
        <>
          <Formula display tex={`c = 2\\zeta m\\omega_n = 2(${texNumber(zeta, 3)})(${texNumber(MASS)})(${texNumber(omegaN)}) = ${texNumber(damping)}\\ \\mathrm{N\\,s/m}`} />
          {underdamped ? (
            <>
              <Formula display tex={`\\omega_d = \\omega_n\\sqrt{1-\\zeta^2} = ${texNumber(properties.omegaD as number)}\\ \\mathrm{rad/s}`} />
              <Formula display tex={`\\delta = \\ln\\!\\left(\\dfrac{x_i}{x_{i+1}}\\right) = \\dfrac{2\\pi\\zeta}{\\sqrt{1-\\zeta^2}} = ${texNumber(logDecrement)}`} />
            </>
          ) : (
            <Formula display tex={`\\zeta = ${texNumber(zeta, 3)} \\ge 1\\quad\\Rightarrow\\quad \\text{진동하지 않고 평형으로 복귀}`} />
          )}
          <p style={{ margin: 0 }}><strong>현재 상태:</strong> {regimeName}</p>
        </>
      }
      readouts={
        <ReadoutTable
          caption="전체 2초 파형에서 읽은 박자와 줄어드는 속도"
          rows={[
            { label: '감쇠 주파수비 ωd/ωₙ', value: frequencyRatio, sig: 5 },
            { label: '다음/이전 양의 피크 (파형)', value: measuredPeakRatio, theory: underdamped ? Math.exp(-logDecrement) : undefined, sig: 4 },
            { label: '대수감쇠율 δ (파형)', value: measuredDelta, theory: underdamped ? logDecrement : undefined, sig: 5 },
            { label: 'δ로 추정한 ζ', value: estimatedZeta, theory: underdamped ? zeta : undefined, sig: 4 },
            { label: '진폭 반감까지', value: halfCycles, unit: Number.isNaN(halfCycles) ? undefined : '주기', sig: 4 },
          ]}
        />
      }
      tasks={[
        {
          question: 'ζ = 0.05에서 첫 양의 피크 1.00에 대한 다음 양의 피크의 비와 반감 주기 수는 얼마인가요?',
          answer: '다음/이전 피크는 약 0.730, 대수감쇠율은 0.3146, 반감까지는 약 2.20주기입니다.',
        },
        {
          question: 'ζ를 0.05에서 0.20으로 올리면 박자와 진폭 감소 중 무엇이 더 크게 달라지나요?',
          answer: '진폭 감소가 훨씬 크게 달라집니다. ωd/ωₙ은 약 0.999에서 0.980으로 조금 줄지만, 진폭은 매 주기 훨씬 빠르게 감소합니다.',
        },
        {
          question: 'fₙ을 5 Hz에서 10 Hz로 올리면 반감 주기 수와 반감 시간은 각각 어떻게 되나요?',
          answer: 'ζ가 같으면 반감 주기 수는 같습니다. 하지만 한 주기가 절반으로 짧아지므로 초 단위 반감 시간도 절반이 됩니다.',
        },
        {
          question: 'ζ를 1.00과 1.50으로 올리면 평형을 지나 반대쪽으로 넘어가나요?',
          answer: '넘어가지 않습니다. 임계감쇠와 과감쇠 모두 진동 없이 같은 쪽에서 평형으로 돌아옵니다.',
        },
      ]}
      footer="m = 1 kg, v₀ = 0인 점성 감쇠 1자유도계. 피크 비·δ는 그려진 파형의 첫 두 양의 피크에서 재고, 이론은 δ = 2πζ/√(1−ζ²)입니다. ζ ≥ 1이거나 2초 안에 같은 방향 피크가 둘 없으면 읽음값을 —로 표시합니다."
    >
      <DampingMotion key={`${zeta}:${frequencyHz}:${x0Mm}`} system={system} x0Mm={x0Mm} time={time} displacement={displacement} envelope={envelope} peaks={peakData} yLimit={yLimit} showEnvelope={showEnvelope && underdamped} showPeaks={showPeaks && underdamped} />
      <p className="lab-note">아래는 전체 2초 파형입니다. 피크 비·대수감쇠율은 재생 시각과 관계없이 이 전체 구간의 첫 두 양의 피크에서 계산합니다.</p>
      <Plot
        series={series}
        x={{ label: '시간 t [s]', range: [0, DURATION] }}
        y={{ label: '변위 x [mm]', range: [-yLimit, yLimit] }}
        height={340}
        ariaLabel="감쇠비에 따라 줄어드는 자유진동 변위와 포락선, 같은 방향의 연속 피크"
      />
    </LabFrame>
  );
}
