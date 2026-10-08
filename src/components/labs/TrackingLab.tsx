import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { analyzeTracking, DEFAULT_TRACK_PARAMS, lagForPlot, ROTOR, TRK, type Direction, type TrackParams } from '../../lib/trackingDemo';

/**
 * LAB-FLT-02 트래킹 필터와 노치: 런업에서 1X 벡터 뽑기 (P5-5, Contents §5).
 * P4-1의 예시 로터를 올리거나(내리며) 기록한 신호에서 트래킹 필터(복소 복조 + 저역 통과)로 1X 크기·위상을 뽑고,
 * 그 1X를 빼서(노치) Not-1X를 본다. 계산: lib/dsp/tracking.ts, 예시 신호·분석: lib/trackingDemo.ts (본문 그림 4 ~ 6과 같은 계산).
 */

const DIR_OPTIONS: { value: Direction; label: string }[] = [
  { value: 'up', label: '올림 (런업 600 → 3600 rpm)' },
  { value: 'down', label: '내림 (코스트다운 3600 → 600 rpm)' },
];
const RATE_OPTIONS = [50, 100, 200, 400, 800].map((v) => ({ value: v, label: `${v} rpm/s` }));
const B_OPTIONS = [0.1, 0.2, 0.5, 1, 2, 5].map((v) => ({ value: v, label: `${v} Hz` }));
const MODE_OPTIONS: { value: 'realtime' | 'offline'; label: string }[] = [
  { value: 'realtime', label: '실시간 (한 방향)' },
  { value: 'offline', label: '저장된 기록 (두 번 거르기)' },
];
const NOISE_OPTIONS = [0, 1, 5, 10].map((v) => ({ value: v, label: `${v} µm` }));
const um = 1e6;
const pp = (m: number) => m * 2e6;
const deg = (r: number) => (r * 180) / Math.PI;
/** 1X가 이보다 작으면 위상을 그리지 않는다 [m Peak] (잡음에 묻혀 의미가 없다) */
const PHASE_MIN = 1e-6;

export interface TrackingLabProps {
  initial?: Partial<TrackParams>;
}

export default function TrackingLab({ initial = {} }: TrackingLabProps) {
  const [p, setP] = useState<TrackParams>({ ...DEFAULT_TRACK_PARAMS, ...initial });
  const set = <K extends keyof TrackParams>(k: K) => (v: TrackParams[K]) => setP((q) => ({ ...q, [k]: v }));
  const a = useMemo(() => analyzeTracking(p), [p]);
  const fc = p.bandwidth / 2;

  const truthAmp: PlotSeries = { x: a.rpm, y: a.trueAmp.map(pp), name: '참값 (그 회전수의 정상 응답)', color: 'var(--text-muted)', dash: 'dash', width: 1.8 };
  const estAmp: PlotSeries = { x: a.rpm, y: a.amp.map(pp), name: '트래킹 필터', color: 'var(--plot-1)', width: 2 };
  const peak: PlotSeries = { x: [a.peakRpm], y: [pp(a.peakAmp)], name: '읽은 봉우리', mode: 'markers', color: 'var(--plot-2)', markerSize: 9 };
  const truthLag: PlotSeries = { x: a.rpm, y: a.trueLag.map((l) => deg(lagForPlot(l))), name: '참값', color: 'var(--text-muted)', dash: 'dash', width: 1.8, hideInLegend: true };
  const estLag: PlotSeries = { x: a.rpm, y: a.lag.map((l, i) => (a.amp[i] >= PHASE_MIN ? deg(lagForPlot(l)) : Number.NaN)), name: '트래킹 필터', color: 'var(--plot-1)', width: 2, hideInLegend: true };
  const ninety: PlotSeries = { x: [TRK.rpmLo, TRK.rpmHi], y: [90, 90], name: '90°', color: 'var(--text-muted)', dash: 'dot', width: 1, hideInLegend: true };
  const b = a.blocks;
  const direct: PlotSeries = { x: b.map((v) => v.rpm), y: b.map((v) => v.direct * um), name: '직접 (거르지 않음)', color: 'var(--plot-1)', width: 2 };
  const notOne: PlotSeries[] = [
    { x: b.map((v) => v.rpm), y: b.map((v) => v.truth * um), name: '참 Not-1X (2X + 0.45X + 잡음)', color: 'var(--text-muted)', dash: 'dash', width: 1.8 },
    { x: b.map((v) => v.rpm), y: b.map((v) => v.notOneX * um), name: 'Not-1X (노치 뒤)', color: 'var(--plot-2)', width: 2 },
  ];
  const notMax = Math.max(6, ...b.map((v) => v.notOneX * um)) * 1.1;

  const rows: Readout[] = [
    { label: '봉우리 회전수', value: a.peakRpm, theory: a.truePeakRpm, unit: 'rpm', sig: 4 },
    { label: '봉우리 크기', value: pp(a.peakAmp), theory: pp(a.truePeakAmp), unit: 'µm pp', sig: 3 },
    { label: '위상 90° 회전수', value: a.phase90Rpm, theory: ROTOR.naturalRpm, unit: 'rpm', sig: 4 },
    { label: 'AF (Half-power, P4-1)', value: a.af ? a.af.af : Number.NaN, theory: a.trueAf?.af, sig: 3 },
    { label: '3600 rpm에서 크기 흔들림 (표준편차)', value: pp(a.noiseStd), theory: pp(a.noiseTheory), unit: 'µm pp', sig: 2 },
    ...(p.notch
      ? [
          { label: '3600 rpm: 직접 RMS', value: a.holdDirect * um, unit: 'µm', sig: 3 },
          { label: '3600 rpm: Not-1X RMS', value: a.holdNotOneX * um, theory: a.holdTruth * um, unit: 'µm', sig: 3 },
          { label: '노치가 남긴 1X (런업 중 가장 큰 RMS)', value: a.maxLeak * um, theory: 0, unit: 'µm', sig: 2 },
        ]
      : []),
  ];

  return (
    <LabFrame id="LAB-FLT-02" title="트래킹 필터와 노치: 런업에서 1X 벡터 뽑기"
      controls={<>
        <ParamSelect label="회전수 변화" value={p.direction} options={DIR_OPTIONS} onChange={set('direction')} />
        <ParamSelect label="가속률" value={p.rate} options={RATE_OPTIONS} onChange={set('rate')} />
        <ParamSelect label="트래킹 필터 폭 B" value={p.bandwidth} options={B_OPTIONS} onChange={set('bandwidth')} hint="1X를 가운데 둔 −3 dB 폭 (저역 통과 차단 = B/2)" />
        <ParamSelect label="거르기" value={p.zeroPhase ? 'offline' : 'realtime'} options={MODE_OPTIONS} onChange={(v) => set('zeroPhase')(v === 'offline')} />
        <ParamSelect label="넓은 대역 잡음 σ" value={Math.round(p.noise * um)} options={NOISE_OPTIONS} onChange={(v) => set('noise')(v / um)} />
        <ParamToggle label="노치로 1X 지우기 (Not-1X 보기)" checked={p.notch} onChange={set('notch')} />
      </>}
      formulas={<>
        <Formula display tex={`\\vec V_{1X}(t) = 2\\,\\mathrm{LPF}\\{x(t)\\,e^{-j\\theta(t)}\\},\\qquad f_c = \\frac{B}{2} = ${texNumber(fc, 3)}\\ \\mathrm{Hz}`} />
        {p.zeroPhase
          ? <Formula display tex={`\\text{두 번 거르기: 지연}\\ 0,\\ \\text{크기 응답}\\ \\lvert H\\rvert^2`} />
          : <Formula display tex={`\\tau_g = \\frac{\\sqrt{2}}{\\pi B} = ${texNumber(a.delay, 3)}\\ \\mathrm{s} \\;\\Rightarrow\\; \\Delta N \\approx R\\,\\tau_g = ${p.rate} \\times ${texNumber(a.delay, 3)} = ${texNumber(a.shiftRpm, 3)}\\ \\mathrm{rpm}`} />}
        <p>저역 통과는 2차 Butterworth(P5-1)입니다. 실시간 필터는 τ_g만큼 늦게 읽으므로, 그동안 회전수가 ΔN만큼 지나갑니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값 (이론 = 참 응답에서 같은 방법으로 읽은 값)" rows={rows} />}
      tasks={[
        { question: '올림·200 rpm/s·B = 0.5 Hz·실시간에서 B를 2 Hz로 넓히면 봉우리와 AF는 어떻게 되나요? 대신 무엇을 잃나요?',
          answer: '봉우리가 3197 rpm·76.5 µm pp에서 3066 rpm·98.9 µm pp로, AF가 5.9에서 10.0으로 참값(3008 rpm·100 µm pp·AF 9.9)에 가까워집니다. 대신 3600 rpm에서 크기 흔들림이 약 0.5에서 0.9 µm pp로 커집니다.' },
        { question: '올림·실시간에서 50 rpm/s·B = 0.5 Hz로 두면? 200 rpm/s·B = 2 Hz와 비교해 보세요.',
          answer: '둘 다 봉우리가 약 3065 rpm·99 µm pp로 거의 같습니다. 지연 동안 지나가는 회전수 R·τ_g가 50 × 0.9 = 200 × 0.225 = 45 rpm으로 같기 때문입니다. 결과를 정하는 것은 B 하나가 아니라 가속률과의 짝입니다.' },
        { question: '200 rpm/s·B = 0.5 Hz·실시간에서 회전수 변화를 "내림"으로 바꾸면 봉우리는 어느 쪽으로 밀리나요?',
          answer: '아래로, 2864 rpm으로 밀립니다. 실시간 필터는 늘 지나온 회전수를 보여 주므로, 런업(3197 rpm)과 코스트다운의 봉우리가 333 rpm 벌어집니다. 둘을 같은 B로 비교할 때 이 차이를 기계의 변화로 읽지 않도록 합니다.' },
        { question: '올림·200 rpm/s·B = 0.5 Hz에서 거르기를 "저장된 기록 (두 번 거르기)"로 바꾸면 봉우리 회전수와 크기는?',
          answer: '지연이 없어져 봉우리가 3038 rpm, 위상 90°가 2997 rpm으로 거의 제자리에 옵니다. 그러나 크기는 69.0 µm pp로 더 깎입니다. 두 번 거르면 크기 응답이 |H|²라 더 좁은 필터가 되기 때문입니다. B를 2 Hz로 넓히면 97.6 µm pp까지 돌아옵니다.' },
        { question: '노치를 켜고(50 rpm/s, B = 2 Hz, 잡음 1 µm) 3300 rpm 위에서 직접과 Not-1X를 비교하세요. B를 0.5 Hz로 좁히면 임계속도 근처의 Not-1X는?',
          answer: '0.45X가 생기면 Not-1X는 약 2.3에서 4.9 µm로 두 배가 넘게 커지지만, 직접 RMS는 1X에 가려 거의 그대로입니다. B를 0.5 Hz로 좁히면 임계속도 근처에서 1X가 빨리 변하는 것을 노치가 따라가지 못해, 남은 1X가 최대 약 10.5 µm로 Not-1X를 크게 부풀립니다.' },
      ]}
      footer={<p>신호는 설명용 예시입니다: P4-1의 예시 로터(고유 회전수 {ROTOR.naturalRpm} rpm, ζ {ROTOR.zeta}, 편심 {formatNumber(ROTOR.eccentricity * um, 2)} µm)의 1X 정상 응답 + 2X {formatNumber(pp(TRK.a2), 2)} µm pp + 0.45X({TRK.whirlFrom} → {TRK.whirlTo} rpm에서 0 → {formatNumber(pp(TRK.aWhirl), 2)} µm pp) + 넓은 대역 잡음, f_s {TRK.fs} Hz. 회전체가 공진에 자리 잡는 시간(약 64 ms)이 짧아 1X는 그 회전수의 정상 응답으로 두었으므로, 이 랩에서 참값과의 어긋남은 모두 필터 때문입니다. 실제 회전체는 빨리 지나가면 자체 과도 응답으로도 봉우리가 같은 방향으로 조금 밀립니다(이 로터를 200 rpm/s로 지나면 약 30 rpm, 800 rpm/s면 약 90 rpm). 양 끝 회전수에서 {TRK.hold}초씩 머문 기록이며, 1X가 2 µm pp보다 작은 곳은 위상을 그리지 않습니다.</p>}
    >
      <h4>1X 크기 (Bode)</h4>
      <Plot series={[truthAmp, estAmp, peak]} x={{ label: '회전수 [rpm]', range: [TRK.rpmLo, TRK.rpmHi] }} y={{ label: '[µm pp]', range: [0, 115] }} height={240} ariaLabel="1X 크기 Bode" />
      <h4>1X 위상 (지연각)</h4>
      <Plot series={[ninety, truthLag, estLag]} x={{ label: '회전수 [rpm]', range: [TRK.rpmLo, TRK.rpmHi] }} y={{ label: '[°]', range: [-30, 210] }} height={190} ariaLabel="1X 위상 Bode" />
      {p.notch && <>
        <h4>직접 RMS (0.25초마다)</h4>
        <Plot series={[direct]} x={{ label: '회전수 [rpm]', range: [TRK.rpmLo, TRK.rpmHi] }} y={{ label: '[µm rms]', range: [0, 40] }} height={170} ariaLabel="직접 RMS" />
        <h4>Not-1X RMS (노치 뒤, 세로 눈금이 다르다)</h4>
        <Plot series={notOne} x={{ label: '회전수 [rpm]', range: [TRK.rpmLo, TRK.rpmHi] }} y={{ label: '[µm rms]', range: [0, notMax] }} height={190} ariaLabel="Not-1X RMS" />
      </>}
    </LabFrame>
  );
}
