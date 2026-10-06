import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { forcedResponse, resonancePeak, steadyStateResponse } from '../../lib/mck';

/** LAB-FRC-01: m = 1 kg, f_n = 5 Hz, X_st = F₀/k = 10 mm로 고정한 1자유도 강제진동. */
const MASS = 1;
const FN = 5;
const OMEGA_N = 2 * Math.PI * FN;
const STIFFNESS = MASS * OMEGA_N ** 2;
const X_ST_MM = 10;
const F0 = (STIFFNESS * X_ST_MM) / 1000;
const DURATION = 4;
const POINTS = 4001;
const R_MAX = 3;
const CURVE = Array.from({ length: 601 }, (_, i) => (R_MAX * i) / 600);

type DisplayMode = 'total' | 'steady';
const DISPLAY_OPTIONS = [
  { value: 'total' as const, label: '정지 상태에서 시작 (과도 포함)' },
  { value: 'steady' as const, label: '정상상태만' },
];

function clean(value: number): number {
  return Math.abs(value) < 1e-12 ? 0 : value;
}

const deg = (rad: number) => (rad * 180) / Math.PI;

interface ForcedVibrationLabProps {
  initialFrequency?: number;
  initialZeta?: number;
}

export default function ForcedVibrationLab({ initialFrequency = 2.5, initialZeta = 0.05 }: ForcedVibrationLabProps) {
  const [forcingHz, setForcingHz] = useState(initialFrequency);
  const [zeta, setZeta] = useState(initialZeta);
  const [display, setDisplay] = useState<DisplayMode>('total');

  const r = forcingHz / FN;
  const response = steadyStateResponse(r, zeta);
  const phaseDeg = deg(response.phaseLag);
  const peak = resonancePeak(zeta);
  const tau = 1 / (zeta * OMEGA_N);
  const system = useMemo(() => ({ mass: MASS, stiffness: STIFFNESS, damping: 2 * zeta * MASS * OMEGA_N }), [zeta]);
  const time = useMemo(() => Array.from({ length: POINTS }, (_, i) => (DURATION * i) / (POINTS - 1)), []);
  const states = useMemo(
    () => forcedResponse(system, { forceAmplitude: F0, forcingOmega: 2 * Math.PI * forcingHz }, { x0: 0, v0: 0 }, time),
    [forcingHz, system, time],
  );

  const displacement = states.map((s) => clean(1000 * (display === 'total' ? s.x : s.steady)));
  const force = time.map((t) => clean(X_ST_MM * Math.cos(2 * Math.PI * forcingHz * t)));
  const lastSecond = displacement.slice(Math.floor(((DURATION - 1) / DURATION) * (POINTS - 1)));
  const lastSecondPeak = Math.max(...lastSecond.map(Math.abs)) / X_ST_MM;
  const firstPeak = Math.max(...displacement.map(Math.abs)) / X_ST_MM;
  const yLimit = Math.max(X_ST_MM, ...displacement.map(Math.abs)) * 1.1;

  const timeSeries = useMemo<PlotSeries[]>(() => [
    { x: time, y: force, name: '힘 F(t)/k [mm 환산]', color: 'var(--plot-2)', width: 1.4 },
    { x: time, y: displacement, name: display === 'total' ? '변위 x(t)' : '정상상태 변위', color: 'var(--plot-1)', width: 2 },
  ], [display, displacement, force, time]);

  const amplitudeCurve = CURVE.map((value) => Math.min(steadyStateResponse(value, zeta).amplitudeRatio, 60));
  const phaseCurve = CURVE.map((value) => deg(steadyStateResponse(value, zeta).phaseLag));
  const ampMax = Math.min(Math.max(peak?.amplitudeRatio ?? 1, 1) * 1.15, 55);

  const amplitudeSeries: PlotSeries[] = [
    { x: CURVE, y: amplitudeCurve, name: `진폭비 (ζ = ${Number(zeta.toFixed(3))})`, color: 'var(--plot-1)', width: 2.2 },
    { x: [0, R_MAX], y: [1, 1], name: 'X_st', color: '#94a3b8', dash: 'dash', width: 1.2 },
    { x: [r], y: [response.amplitudeRatio], name: '현재 점', color: 'var(--plot-2)', mode: 'markers', markerSize: 11 },
  ];
  const phaseSeries: PlotSeries[] = [
    { x: CURVE, y: phaseCurve, name: '위상 지연', color: 'var(--plot-1)', width: 2.2 },
    { x: [0, R_MAX], y: [90, 90], name: '90°', color: '#94a3b8', dash: 'dash', width: 1.2 },
    { x: [r], y: [phaseDeg], name: '현재 점', color: 'var(--plot-2)', mode: 'markers', markerSize: 11 },
  ];

  const regime = r < 0.75
    ? '스프링이 지배: 힘과 거의 같이 움직임'
    : r <= 1.3
      ? '공진 근처: 감쇠만이 진폭을 제한'
      : '질량(관성)이 지배: 작게, 힘과 거의 반대로 움직임';

  return (
    <LabFrame
      id="LAB-FRC-01"
      title="같은 힘, 다른 박자: 언제 크게 흔들릴까?"
      controls={
        <>
          <ParamSlider label="가진 주파수 f" value={forcingHz} min={0} max={15} step={0.05} unit="Hz" format={(v) => v.toFixed(2)} onChange={setForcingHz} />
          <ParamSlider label="감쇠비 ζ" value={zeta} min={0.01} max={0.5} step={0.005} format={(v) => v.toFixed(3)} onChange={setZeta} />
          <ParamSelect label="시간파형" value={display} options={DISPLAY_OPTIONS} onChange={setDisplay} />
        </>
      }
      formulas={
        <>
          <Formula display tex={`r = \\dfrac{f}{f_n} = \\dfrac{${texNumber(forcingHz, 3)}}{${FN}} = ${texNumber(r, 3)}`} />
          <Formula
            display
            tex={`\\dfrac{X}{X_{st}} = \\dfrac{1}{\\sqrt{(1-r^2)^2 + (2\\zeta r)^2}} = \\dfrac{1}{\\sqrt{(${texNumber(clean(1 - r ** 2), 3)})^2 + (${texNumber(2 * zeta * r, 3)})^2}} = ${texNumber(response.amplitudeRatio, 4)}`}
          />
          <Formula display tex={`\\varphi = \\operatorname{atan2}(2\\zeta r,\\ 1-r^2) = ${texNumber(clean(phaseDeg), 4)}^\\circ`} />
          <p style={{ margin: 0 }}><strong>지금 구간:</strong> {regime}</p>
        </>
      }
      readouts={
        <ReadoutTable
          caption="정상상태 응답과 공진"
          rows={[
            { label: '진동수비 r', value: r, sig: 3 },
            { label: '정상상태 진폭비 X/X_st (식)', value: response.amplitudeRatio, sig: 4 },
            { label: '마지막 1초의 최대 |x|/X_st (파형)', value: lastSecondPeak, theory: response.amplitudeRatio, sig: 4 },
            { label: '전체 구간의 최대 |x|/X_st', value: firstPeak, sig: 4 },
            { label: '위상 지연 φ', value: clean(phaseDeg), unit: '°', sig: 4 },
            { label: '공진 봉우리 ≈ 1/(2ζ)', value: 1 / (2 * zeta), sig: 4 },
            { label: '과도 응답이 1/e로 줄어드는 시간 τ', value: tau, unit: 's', sig: 3 },
          ]}
        />
      }
      tasks={[
        {
          question: 'ζ = 0.05에서 f = 2.5, 5, 10 Hz(r = 0.5, 1, 2)의 진폭비와 위상은?',
          answer: '약 1.33배·3.8°, 10.0배·90°, 0.333배·176°입니다. 같은 힘인데 박자만 바꿔 응답 크기가 30배 달라집니다.',
        },
        {
          question: 'f = 5 Hz에서 ζ를 0.05 → 0.025로 줄이면 봉우리 높이와 폭은?',
          answer: '높이는 10 → 20으로 약 2배, 진폭비 곡선의 봉우리 폭은 약 절반이 됩니다. 감쇠가 작을수록 공진은 높고 날카롭습니다.',
        },
        {
          question: '"정지 상태에서 시작"으로 두고 f = 5 Hz, ζ = 0.05이면 마지막 1초의 진폭이 식의 값 10에 도달했나요?',
          answer: '아직 조금 모자랍니다. 과도 응답이 τ ≈ 0.64 s로 줄어드는데, 공진에서는 진폭이 1 − e^(−t/τ) 모양으로 천천히 차오르기 때문입니다. "정상상태만"으로 바꾸면 10이 됩니다.',
        },
        {
          question: 'ζ = 0.01, f = 4.5 Hz, "정지 상태에서 시작"이면 시간파형에 무엇이 보이나요?',
          answer: '진폭이 약 2초 주기로 커졌다 작아지는 맥놀이입니다. 5 Hz 근처의 과도 응답과 4.5 Hz의 정상상태 응답이 겹쳐서 생기며, 과도 응답이 사라질수록 줄어듭니다.',
        },
      ]}
      footer="m = 1 kg, fₙ = 5 Hz, 힘의 크기는 X_st = F₀/k = 10 mm가 되도록 고정. 주황 선은 힘을 k로 나눠 mm로 그린 것(그 힘을 천천히 걸었을 때의 처짐)입니다. 진폭비 곡선은 60에서 자릅니다."
    >
      <Plot
        series={timeSeries}
        x={{ label: '시간 t [s]', range: [0, DURATION] }}
        y={{ label: '변위 x [mm]', range: [-yLimit, yLimit] }}
        height={300}
        ariaLabel="가진력과 변위의 시간파형. 과도 응답이 줄어들며 가진 주파수의 정상상태로 수렴한다"
      />
      <Plot
        series={amplitudeSeries}
        x={{ label: '진동수비 r = f/fₙ', range: [0, R_MAX] }}
        y={{ label: '진폭비 X/X_st', range: [0, ampMax] }}
        height={240}
        ariaLabel="진동수비에 따른 진폭비 곡선과 현재 가진 주파수의 점"
      />
      <Plot
        series={phaseSeries}
        x={{ label: '진동수비 r = f/fₙ', range: [0, R_MAX] }}
        y={{ label: '위상 지연 φ [°]', range: [0, 185] }}
        height={220}
        ariaLabel="진동수비에 따른 위상 지연 곡선과 현재 가진 주파수의 점"
      />
    </LabFrame>
  );
}
