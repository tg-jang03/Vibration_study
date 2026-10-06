import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import PolarPlot, { type PolarSeries } from '../ui/PolarPlot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { simulateRunUp, SR_ROTOR, toDeg, toRad, type AmpLag, type CompensationMode } from '../../lib/phase';

/**
 * LAB-SRO-01 Slow roll 보상: 런아웃이 섞인 런업 Bode·Polar와 보상 전후 (P3-3, Contents §5-1).
 * 예시 로터(P3-2와 같다: 임계 2000 rpm, ζ 0.1, 운전 3600 rpm에서 불평형 응답 45 µm pp) + 회전수와 무관한 런아웃 1X 벡터.
 * 계산: src/lib/phase.ts (본문 그림 6 ~ 8과 같은 모델).
 */

const RESP_AT_OP = 45e-6;
const RPM = Array.from({ length: 396 }, (_, i) => 50 + i * 10);
const MODE_OPTIONS: { value: CompensationMode; label: string }[] = [
  { value: 'none', label: '보상 없음' },
  { value: 'scalar', label: '크기만 빼기 (틀린 방법)' },
  { value: 'vector', label: '벡터로 빼기' },
];
const MODE_NAME: Record<CompensationMode, string> = { none: '보상 없음', scalar: '크기만 빼기', vector: '벡터로 빼기' };

const um = (v: AmpLag[]) => v.map((p) => p.amp * 1e6);
/** 위상 [°] vs 회전수. 360° 경계를 넘는 곳은 NaN으로 끊는다 (세로선이 생기지 않게) */
function phaseTrace(v: AmpLag[], rpm: number[]): { x: number[]; y: number[] } {
  const x: number[] = [];
  const y: number[] = [];
  v.forEach((p, i) => {
    const d = toDeg(p.lag);
    if (i > 0 && Math.abs(d - toDeg(v[i - 1].lag)) > 180) {
      x.push(Number.NaN);
      y.push(Number.NaN);
    }
    x.push(rpm[i]);
    y.push(d);
  });
  return { x, y };
}
const vecTex = (v: AmpLag) => `${texNumber(v.amp * 1e6, 3)}\\angle ${texNumber(toDeg(v.lag), 4)}^\\circ`;

export interface SlowRollLabProps {
  initialSlowRollRpm?: number;
  initialMode?: CompensationMode;
  /** 런아웃 [µm pp] */
  initialRunoutAmp?: number;
  /** 런아웃 위상 [°] */
  initialRunoutLag?: number;
}

export default function SlowRollLab({ initialSlowRollRpm = 300, initialMode = 'vector', initialRunoutAmp = 15, initialRunoutLag = 60 }: SlowRollLabProps) {
  const [srRpm, setSrRpm] = useState(initialSlowRollRpm);
  const [mode, setMode] = useState<CompensationMode>(initialMode);
  const [roAmp, setRoAmp] = useState(initialRunoutAmp);
  const [roLag, setRoLag] = useState(initialRunoutLag);
  const [showTruth, setShowTruth] = useState(true);

  const ru = useMemo(
    () => simulateRunUp({ respAtOp: RESP_AT_OP, runout: { amp: roAmp * 1e-6, lag: toRad(roLag) }, slowRollRpm: srRpm, mode, rpm: RPM }),
    [srRpm, mode, roAmp, roLag],
  );
  const iOp = RPM.indexOf(SR_ROTOR.operatingRpm);
  const opMeas = ru.measured[iOp];
  const opComp = ru.compensated[iOp];
  const opTrue = ru.truth[iOp];
  const showComp = mode !== 'none';
  // 보상 결과는 Slow roll 회전수보다 위에서만 뜻이 있다
  const from = RPM.findIndex((n) => n > srRpm);
  const compPart = ru.compensated.slice(from);
  const rpmComp = RPM.slice(from);

  const srLine = (y: [number, number]): PlotSeries => ({ x: [srRpm, srRpm], y, name: 'Slow roll 회전수', color: 'var(--plot-4)', dash: 'dash', width: 1.4 });
  const ampSeries: PlotSeries[] = [
    ...(showTruth ? [{ x: RPM, y: um(ru.truth), name: '참값 (런아웃 없음)', color: 'var(--text-muted)', dash: 'dash', width: 1.6 } as PlotSeries] : []),
    { x: RPM, y: um(ru.measured), name: '측정 (진동 + 런아웃)', color: 'var(--plot-2)', width: 2.2 },
    ...(showComp ? [{ x: rpmComp, y: um(compPart), name: `보상 (${MODE_NAME[mode]})`, color: 'var(--plot-1)', width: 2.2 } as PlotSeries] : []),
    srLine([0, 220]),
  ];
  const phaseSeries: PlotSeries[] = [
    ...(showTruth ? [{ ...phaseTrace(ru.truth, RPM), name: '참값', color: 'var(--text-muted)', dash: 'dash', width: 1.6 } as PlotSeries] : []),
    { ...phaseTrace(ru.measured, RPM), name: '측정', color: 'var(--plot-2)', width: 2.2 },
    ...(showComp
      ? [{ ...phaseTrace(compPart, rpmComp), name: '보상', color: 'var(--plot-1)', width: 2.2 } as PlotSeries]
      : []),
    srLine([0, 360]),
  ];
  const polarSeries: PolarSeries[] = [
    ...(showTruth ? [{ amp: um(ru.truth), lagDeg: ru.truth.map((p) => toDeg(p.lag)), name: '참값', color: 'var(--text-muted)', dash: true, width: 1.6 } as PolarSeries] : []),
    { amp: um(ru.measured), lagDeg: ru.measured.map((p) => toDeg(p.lag)), name: '측정', color: 'var(--plot-2)', width: 2.2 },
    ...(showComp ? [{ amp: um(compPart), lagDeg: compPart.map((p) => toDeg(p.lag)), name: '보상', color: 'var(--plot-1)', width: 2.2 } as PolarSeries] : []),
    { amp: [0, ru.slowRoll.amp * 1e6], lagDeg: [toDeg(ru.slowRoll.lag), toDeg(ru.slowRoll.lag)], name: 'Slow roll 벡터', color: 'var(--plot-4)', width: 2.2, arrow: true },
    { amp: [opMeas.amp * 1e6, ...(showComp ? [opComp.amp * 1e6] : [])], lagDeg: [toDeg(opMeas.lag), ...(showComp ? [toDeg(opComp.lag)] : [])], name: `${SR_ROTOR.operatingRpm} rpm`, mode: 'markers', color: 'var(--text)', markerSize: 4.5 },
  ];

  const compTex =
    mode === 'vector'
      ? `\\vec V_c = \\vec V - \\vec V_{sr} = ${vecTex(opMeas)} - ${vecTex(ru.slowRoll)} = ${vecTex(opComp)}`
      : mode === 'scalar'
        ? `\\lvert V\\rvert - \\lvert V_{sr}\\rvert = ${texNumber(opMeas.amp * 1e6, 3)} - ${texNumber(ru.slowRoll.amp * 1e6, 3)} = ${texNumber(opComp.amp * 1e6, 3)}\\ \\mu\\mathrm{m\\ pp}\\ (\\text{위상은 } ${texNumber(toDeg(opMeas.lag), 4)}^\\circ \\text{ 그대로})`
        : `\\vec V = ${vecTex(opMeas)}\\ (\\text{보상 없음})`;

  return (
    <LabFrame id="LAB-SRO-01" title="Slow roll 보상: 런아웃을 벡터로 빼기"
      controls={<>
        <ParamSelect label="보상 방법" value={mode} options={MODE_OPTIONS} onChange={setMode} />
        <ParamSlider label="Slow roll 회전수" value={srRpm} min={100} max={1500} step={50} unit="rpm" onChange={setSrRpm} hint={`이 회전수에서 읽은 1X 벡터를 런아웃으로 보고 뺍니다 (임계속도 ${SR_ROTOR.criticalRpm} rpm)`} />
        <ParamSlider label="런아웃 크기 (1X)" value={roAmp} min={0} max={30} step={1} unit="µm pp" onChange={setRoAmp} />
        <ParamSlider label="런아웃 위상" value={roLag} min={0} max={355} step={5} unit="°" onChange={setRoLag} />
        <ParamToggle label="참값 (런아웃 없는 응답) 표시" checked={showTruth} onChange={setShowTruth} />
      </>}
      formulas={<>
        <Formula display tex={`\\vec V_{sr} = ${vecTex(ru.slowRoll)} \\quad (${srRpm}\\ \\mathrm{rpm})`} />
        <Formula display tex={compTex} />
        <p>{`운전 회전수 ${SR_ROTOR.operatingRpm} rpm의 참값은 ${texNumber(opTrue.amp * 1e6, 3)} µm pp∠${texNumber(toDeg(opTrue.lag), 4)}°입니다. 단위는 µm pp, 각도는 지연각입니다.`}</p>
      </>}
      readouts={<ReadoutTable caption={`읽음값 (${SR_ROTOR.operatingRpm} rpm)`} rows={[
        { label: '측정 크기', value: opMeas.amp * 1e6, theory: opTrue.amp * 1e6, unit: 'µm pp', sig: 4 },
        { label: '측정 위상', value: toDeg(opMeas.lag), unit: '°', sig: 4 },
        { label: 'Slow roll 벡터 크기', value: ru.slowRoll.amp * 1e6, unit: 'µm pp', sig: 4 },
        { label: 'Slow roll 벡터 위상', value: toDeg(ru.slowRoll.lag), unit: '°', sig: 4 },
        { label: `보상 크기 (${MODE_NAME[mode]})`, value: opComp.amp * 1e6, theory: opTrue.amp * 1e6, unit: 'µm pp', sig: 4 },
        { label: '보상 위상', value: toDeg(opComp.lag), unit: '°', sig: 4 },
        { label: '참 위상', value: toDeg(opTrue.lag), unit: '°', sig: 4 },
      ]} />}
      tasks={[
        { question: '처음 상태(벡터로 빼기, Slow roll 300 rpm, 런아웃 15 µm pp∠60°)에서 3600 rpm의 측정·보상·참값을 비교하세요.',
          answer: '측정 42.1 µm pp∠151°, 보상 45.7 µm pp∠171°, 참값 45.0 µm pp∠171°입니다. 보상이 0.7 µm 남는 것은 300 rpm에서도 진동이 0.7 µm pp쯤 있어서 함께 빠졌기 때문입니다.' },
        { question: '"보상 없음"으로 두면 저속(500 rpm 아래)에서 진폭과 위상은 어떻게 보이나요? Polar 곡선은 어디서 출발하나요?',
          answer: '진폭이 0으로 내려가지 않고 약 15 µm pp에 머물고, 위상은 진동이 아니라 런아웃의 위상(약 60°)을 가리킵니다. Polar 곡선은 원점이 아니라 런아웃 벡터의 끝에서 출발합니다.' },
        { question: '"크기만 빼기"로 바꾸면 3600 rpm 값은 몇 µm pp인가요?',
          answer: '42.1 − 15.4 = 26.7 µm pp로 참값 45 µm pp보다 41 % 작고, 위상은 151°에 그대로 남습니다. 런아웃과 진동의 방향이 다르면 크기끼리 뺄 수 없습니다.' },
        { question: 'Slow roll 회전수를 1200 rpm으로 올리면 보상 결과는?',
          answer: '1200 rpm에서는 진동이 이미 17 µm pp쯤 자라 있어 Slow roll 벡터가 29.5 µm pp로 커지고, 이것을 빼면 3600 rpm 값이 61.7 µm pp로 37 % 크게 나옵니다. Slow roll은 1X 진폭과 위상이 회전수에 따라 거의 변하지 않는 낮은 구간에서 잡습니다.' },
        { question: '런아웃 위상을 170°로, 그다음 350°로 바꾸면 3600 rpm의 측정값은 몇 µm pp인가요?',
          answer: '170°에서는 약 60 µm pp, 350°에서는 약 30 µm pp입니다. 참 응답(45 µm pp∠171°)과 같은 쪽을 향하면 15 µm pp가 그대로 더해지고, 반대쪽이면 그대로 빠집니다. 런아웃은 위상에 따라 진동을 크게도 작게도 보이게 합니다.' },
      ]}
      footer={<p>예시 로터는 P3-2와 같습니다 (임계속도 {SR_ROTOR.criticalRpm} rpm, 감쇠비 {SR_ROTOR.zeta}, 운전 {SR_ROTOR.operatingRpm} rpm에서 불평형 응답 45 µm pp). 참값의 위상은 불평형 응답의 위상 지연 그대로입니다 (키페이저·센서·무거운 점의 각도가 더하는 일정한 값은 0으로 둠). 보상 곡선은 Slow roll 회전수보다 위에서만 그립니다.</p>}
    >
      <h4>Bode: 1X 진폭</h4>
      <Plot series={ampSeries} x={{ label: '회전수 [rpm]', range: [0, 4000] }} y={{ label: '[µm pp]', range: [0, 220] }} height={230} ariaLabel="런업 1X 진폭: 측정, 보상, 참값" />
      <h4>Bode: 1X 위상 (지연각)</h4>
      <Plot series={phaseSeries} x={{ label: '회전수 [rpm]', range: [0, 4000] }} y={{ label: '[°]', range: [0, 360] }} height={200} ariaLabel="런업 1X 위상: 측정, 보상, 참값" />
      <h4>Polar</h4>
      <PolarPlot series={polarSeries} rMax={200} unit="µm pp" ariaLabel="런업 1X 벡터의 Polar 플롯: 측정, 보상, 참값, Slow roll 벡터" />
    </LabFrame>
  );
}
