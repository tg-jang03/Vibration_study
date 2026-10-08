import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import PolarPlot, { type PolarSeries } from '../ui/PolarPlot';
import ReadoutTable from '../ui/ReadoutTable';
import PhaseShaft from './PhaseShaft';
import { texNumber } from '../../lib/format';
import {
  highestPeakAngle,
  keyphasorThreshold,
  keyphasorVoltage,
  orderVector,
  phaseInConvention,
  shaftDisplacement,
  toAmpLag,
  toDeg,
  toRad,
  wrap2pi,
  type PhaseConvention,
} from '../../lib/phase';

/**
 * LAB-PHS-01 위상 측정: 키페이저 펄스와 1X 위상 (P3-3, Contents §5-1).
 * 키페이저 펄스 → 1X 신호의 다음 양의 피크까지 Δt → φ = 360° × Δt / T. 2X가 섞이면 원신호의 봉우리가 비켜나고,
 * 관례에 따라 같은 신호가 다른 숫자로 적힌다. 계산: src/lib/phase.ts (본문 그림 1 ~ 5와 같은 모델).
 */

const AMP_PP = 50e-6;
const TWO_X_LAG = toRad(300);
const SPR = 256; // 동기 DFT: 한 바퀴 샘플 수
const CONV_OPTIONS: { value: PhaseConvention; label: string }[] = [
  { value: 'lag', label: '지연각: 펄스 → 양의 피크 (이 사이트)' },
  { value: 'lead', label: 'FFT 위상: cos 기준 앞섬각' },
  { value: 'zeroCross', label: '영점 기준: 펄스 → 위로 지나는 영점' },
];
const CONV_NAME: Record<PhaseConvention, string> = { lag: '지연각', lead: '앞섬각', zeroCross: '영점 기준' };
const clean = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v);

export interface PhaseLabProps {
  /** 1X 위상 지연 [°] */
  initialLag?: number;
  initialRpm?: number;
  /** 2X 크기 [% of 1X] */
  initialTwoX?: number;
  initialConvention?: PhaseConvention;
}

export default function PhaseLab({ initialLag = 120, initialRpm = 3600, initialTwoX = 0, initialConvention = 'lag' }: PhaseLabProps) {
  const [lagDeg, setLagDeg] = useState(initialLag);
  const [rpm, setRpm] = useState(initialRpm);
  const [twoXPct, setTwoXPct] = useState(initialTwoX);
  const [conv, setConv] = useState<PhaseConvention>(initialConvention);

  const r = useMemo(() => {
    const fr = rpm / 60;
    const T = 1 / fr;
    const lag = toRad(lagDeg);
    const sig = { oneX: { amp: AMP_PP, lag }, twoX: { amp: (AMP_PP * twoXPct) / 100, lag: TWO_X_LAG } };
    const n = 1201;
    const t = Array.from({ length: n }, (_, i) => -0.1 * T + (2.2 * T * i) / (n - 1));
    const th = t.map((ti) => 2 * Math.PI * fr * ti);
    const raw = th.map((a) => shaftDisplacement(a, sig) * 1e6);
    const one = th.map((a) => shaftDisplacement(a, { oneX: sig.oneX }) * 1e6);
    const kp = th.map((a) => keyphasorVoltage(a));
    const samples = Array.from({ length: SPR * 4 }, (_, i) => shaftDisplacement((2 * Math.PI * i) / SPR, sig));
    const dft = orderVector(samples, SPR, 1);
    const dftAL = toAmpLag(dft);
    const rawPeak = highestPeakAngle((a) => shaftDisplacement(a, sig));
    const conventionValue = phaseInConvention(lag, conv);
    // 관례의 기준점: 지연각·앞섬각은 양의 피크, 영점 기준은 위로 지나는 영점
    const refAngle = conv === 'zeroCross' ? wrap2pi(lag - Math.PI / 2) : lag;
    const refDt = refAngle / (2 * Math.PI * fr);
    return { fr, T, t, raw, one, kp, dftAL, dftLead: Math.atan2(dft.im, dft.re), rawPeak, conventionValue, refDt, dt: lag / (2 * Math.PI * fr) };
  }, [lagDeg, rpm, twoXPct, conv]);

  const msT = r.t.map((v) => v * 1e3);
  const Tms = r.T * 1e3;
  const hasTwoX = twoXPct > 0;
  const kpLines: PlotSeries[] = [0, 1, 2].map((k) => ({ x: [k * Tms, k * Tms], y: [-40, 40], name: '키페이저 펄스', color: 'var(--text-muted)', dash: 'dash', width: 1.2, hideInLegend: k > 0 }));
  const refY = conv === 'zeroCross' ? 0 : 25;
  const waveSeries: PlotSeries[] = [
    ...kpLines,
    ...(hasTwoX ? [{ x: msT, y: r.raw, name: '원신호 (1X + 2X)', color: 'var(--plot-1)', width: 2.2 } as PlotSeries] : []),
    { x: msT, y: r.one, name: hasTwoX ? '1X 성분' : '1X 신호', color: hasTwoX ? 'var(--plot-2)' : 'var(--plot-1)', width: 2, dash: hasTwoX ? 'dash' : 'solid' },
    { x: [0, r.refDt * 1e3], y: [33, 33], name: `Δt (${CONV_NAME[conv]}의 기준점까지)`, mode: 'lines+markers', color: 'var(--status-wip)', width: 3, markerSize: 7 },
    { x: [r.refDt * 1e3, (r.refDt + r.T) * 1e3], y: [refY, refY], name: '기준점', mode: 'markers', color: 'var(--status-wip)', markerSize: 11 },
    ...(hasTwoX
      ? [{ x: [(r.rawPeak / (2 * Math.PI * r.fr)) * 1e3], y: [shaftDisplacement(r.rawPeak, { oneX: { amp: AMP_PP, lag: toRad(lagDeg) }, twoX: { amp: (AMP_PP * twoXPct) / 100, lag: TWO_X_LAG } }) * 1e6], name: '원신호의 가장 높은 봉우리', mode: 'markers', color: 'var(--plot-1)', markerSize: 10 } as PlotSeries]
      : []),
  ];
  const kpSeries: PlotSeries[] = [
    { x: msT, y: r.kp, name: '키페이저 출력', color: 'var(--plot-1)', width: 1.8 },
    { x: [msT[0], msT[msT.length - 1]], y: [keyphasorThreshold(), keyphasorThreshold()], name: '문턱', color: 'var(--status-wip)', dash: 'dash', width: 1.2 },
  ];
  const polarSeries: PolarSeries[] = [
    { amp: [0, 50], lagDeg: [lagDeg, lagDeg], name: '1X 벡터 (1X 성분의 피크)', color: 'var(--plot-1)', width: 2.6, arrow: true },
    ...(hasTwoX ? [{ amp: [0, 50], lagDeg: [toDeg(r.rawPeak), toDeg(r.rawPeak)], name: '원신호 봉우리로 읽으면', color: 'var(--status-wip)', width: 1.8, dash: true, arrow: true } as PolarSeries] : []),
  ];

  const convTex =
    conv === 'lead'
      ? `\\psi = -\\varphi = ${texNumber(clean(toDeg(r.conventionValue)), 4)}^\\circ \\quad (x = A\\cos(\\theta + \\psi))`
      : conv === 'zeroCross'
        ? `\\varphi_0 = \\varphi - 90^\\circ = ${texNumber(clean(toDeg(r.conventionValue)), 4)}^\\circ \\quad (\\text{영점까지})`
        : `\\varphi = ${texNumber(clean(lagDeg), 4)}^\\circ \\quad (\\text{양의 피크까지})`;

  return (
    <LabFrame id="LAB-PHS-01" title="위상 측정: 키페이저 펄스와 1X 위상"
      controls={<>
        <ParamSlider label="1X 위상 (지연각 φ)" value={lagDeg} min={0} max={355} step={5} unit="°" onChange={setLagDeg} hint="이 랩에서는 위상을 직접 정합니다. 실제 기계에서는 회전수에 따라 바뀝니다 (그림 6)" />
        <ParamSlider label="회전수" value={rpm} min={600} max={6000} step={100} unit="rpm" onChange={setRpm} />
        <ParamSlider label="2X 성분 (1X 대비)" value={twoXPct} min={0} max={60} step={5} unit="%" onChange={setTwoXPct} />
        <ParamSelect label="위상 관례" value={conv} options={CONV_OPTIONS} onChange={setConv} />
      </>}
      formulas={<>
        <Formula display tex={`\\varphi = 360^\\circ \\times \\frac{\\Delta t}{T} = 360^\\circ \\times \\frac{${texNumber(r.dt * 1e3, 4)}\\ \\mathrm{ms}}{${texNumber(Tms, 4)}\\ \\mathrm{ms}} = ${texNumber(clean(lagDeg), 4)}^\\circ`} />
        <Formula display tex={`\\vec V = A\\angle\\varphi = 50\\ \\mu\\mathrm{m\\ pp}\\angle ${texNumber(clean(lagDeg), 4)}^\\circ = A\\,e^{-j\\varphi}`} />
        <Formula display tex={convTex} />
        <p>{`Δt는 1X 성분의 피크까지 잽니다. 주황 막대는 지금 고른 관례(${CONV_NAME[conv]})의 기준점까지입니다.`}</p>
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: '한 바퀴 시간 T', value: Tms, unit: 'ms', sig: 4 },
        { label: 'Δt (펄스 → 1X 양의 피크)', value: r.dt * 1e3, unit: 'ms', sig: 4 },
        { label: '위상 — 지연각 (이 사이트)', value: clean(lagDeg), unit: '°', sig: 4 },
        { label: `위상 — 고른 관례 (${CONV_NAME[conv]})`, value: clean(toDeg(r.conventionValue)), unit: '°', sig: 4 },
        { label: '동기 DFT의 1X 진폭', value: r.dftAL.amp * 2 * 1e6, unit: 'µm pp', sig: 4 },
        { label: '동기 DFT의 각도 (cos 기준 앞섬)', value: clean(toDeg(r.dftLead)), unit: '°', sig: 4 },
        { label: '원신호의 가장 높은 봉우리', value: clean(toDeg(r.rawPeak)), unit: '°', sig: 4 },
      ]} />}
      tasks={[
        { question: '3600 rpm, 위상 120°에서 Δt는 몇 ms인가요? 회전수를 1800 rpm으로 내리면 Δt와 위상은 어떻게 되나요?',
          answer: '3600 rpm에서 한 바퀴는 16.7 ms이고 Δt는 그 1/3인 5.56 ms입니다. 1800 rpm에서는 한 바퀴가 33.3 ms로 길어져 Δt도 11.1 ms로 두 배가 되지만, 위상은 120° 그대로입니다. 위상을 시간이 아니라 각도로 적는 이유입니다.' },
        { question: '2X를 40 %로 올리면 원신호의 가장 높은 봉우리는 몇 도에 있나요? 동기 DFT의 1X는?',
          answer: '원신호의 봉우리는 약 138°로 18° 비켜납니다. 동기 DFT는 1X 성분만 골라내므로 진폭 50 µm pp, 각도 −120°(= 지연 120°) 그대로입니다. 위상은 1X 성분으로 정합니다.' },
        { question: '관례를 "FFT 위상"으로 바꾸면 같은 신호가 몇 도로 적히나요? "영점 기준"이면?',
          answer: '앞섬각으로는 −120°, 영점 기준으로는 30°입니다. 신호는 하나인데 숫자가 셋입니다. 다른 장비의 위상과 비교하기 전에 관례부터 맞춰야 합니다.' },
        { question: '축 그림에서 재생을 누르고 "처음으로"를 눌러 펄스 순간에 멈춰 보세요. 위상 120°에서 high spot(주황 점)은 어디에 있나요? 위상을 240°로 바꾸면?',
          answer: '120°에서는 위(센서)에서 시계 방향으로 120° — 오른쪽 아래에 있습니다. 축이 반시계로 120° 더 돌아야 센서 앞에 오므로 봉우리가 Δt = 5.56 ms 뒤에 옵니다. 240°면 시계 방향으로 240°(왼쪽 아래)에 있어 두 배 늦은 11.1 ms 뒤에 옵니다. 두 경우 모두 Polar 화살표가 펄스 순간의 high spot 쪽을 가리킵니다.' },
        { question: '위상을 350°로 두면 Polar 화살표는 어디를 가리키나요? 앞섬각으로는?',
          answer: '0°(위)에서 시계 방향으로 350° — 0°에서 반시계 쪽으로 10° 기운 자리입니다. 앞섬각으로는 −350° = +10°로 적힙니다. 지연이 거의 한 바퀴면 "조금 앞선다"와 같은 자리입니다.' },
      ]}
      footer={<p>1X 진폭은 50 µm pp, 2X의 위상은 300°로 고정한 예시입니다. 키페이저 펄스는 P3-2의 교정 곡선 위에서 gap 1.2 mm, 홈 깊이 1.0 mm, 폭 12°인 예시 홈으로 만들었습니다. 동기 DFT는 펄스에서 시작한 4바퀴(한 바퀴 {SPR}점)를 씁니다.</p>}
    >
      <h4>축이 돌 때: 홈 → 펄스, high spot → 봉우리</h4>
      <PhaseShaft lagDeg={lagDeg} rpm={rpm} oneXpp={AMP_PP} twoXpp={(AMP_PP * twoXPct) / 100} twoXLag={TWO_X_LAG} />
      <h4>키페이저 출력 (두 바퀴)</h4>
      <Plot series={kpSeries} x={{ label: '시각 [ms]' }} y={{ label: '[V]', range: [-19, -7] }} height={150} ariaLabel="키페이저 펄스" />
      <h4>축 진동 신호 (센서 쪽이 +)</h4>
      <Plot series={waveSeries} x={{ label: '시각 [ms]' }} y={{ label: '[µm]', range: [-40, 40] }} height={260} ariaLabel="1X 신호와 키페이저 펄스, 관례의 기준점" />
      <h4>Polar 플롯 (이 사이트 관례: 0°는 센서 방향, 지연은 회전 반대 방향)</h4>
      <PolarPlot series={polarSeries} rMax={60} unit="µm pp" ariaLabel="1X 벡터의 Polar 플롯" />
    </LabFrame>
  );
}
