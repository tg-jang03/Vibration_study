import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { acquire } from '../../lib/dsp/sampling';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import { removeOrders, synchronousAverage, tsaGain } from '../../lib/dsp/tsa';
import { GEARBOX, gearboxSpec } from '../../lib/gearbox';

/**
 * LAB-AVG-02 TSA (P2-6 §4, Contents §5-1).
 * 축 A의 키페이저로 한 바퀴(256점)씩 잘라 같은 각도끼리 평균한다. 본문 그림과 같은 신호(src/lib/gearbox.ts)·시드.
 */

const G = GEARBOX;
const SPR = G.samplesPerRev;
const ANGLE = Float64Array.from({ length: SPR }, (_, n) => (360 * n) / SPR);
const RAW_REVS = 3;
const MAX_ORDER = 50;
const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);
const rmsOf = (x: ArrayLike<number>) => Math.sqrt(Array.from(x).reduce((s, v) => s + v * v, 0) / x.length);

function orderSpectrum(rev: Float64Array) {
  const s = singleSidedSpectrum({ fs: SPR, x: rev });
  return { order: Array.from(s.frequency).slice(0, MAX_ORDER + 1), amp: Array.from(s.amplitude, clean).slice(0, MAX_ORDER + 1) };
}

export interface TsaLabProps {
  initialRevs?: number;
  initialResidual?: boolean;
}

export default function TsaLab({ initialRevs = 1, initialResidual = false }: TsaLabProps) {
  const [revs, setRevs] = useState(initialRevs);
  const [bRatio, setBRatio] = useState<number>(G.bRatio);
  const [sigma, setSigma] = useState<number>(G.noiseRms);
  const [defect, setDefect] = useState(true);
  const [residual, setResidual] = useState(initialResidual);

  const data = useMemo(() => {
    const n = SPR * Math.max(revs, RAW_REVS);
    const acq = (opts: Parameters<typeof gearboxSpec>[0]) => acquire(gearboxSpec(opts), { fs: G.fs, n }).x;
    const full = acq({ bRatio, noiseRms: sigma, defect });
    const tsa = synchronousAverage(full, SPR, revs);
    const truth = synchronousAverage(acquire(gearboxSpec({ shaftB: false, noiseRms: 0, defect }), { fs: G.fs, n: SPR }).x, SPR);
    const bOnly = synchronousAverage(acq({ shaftA: false, defect: false, bRatio, noiseRms: 0 }), SPR, revs);
    const noiseOnly = sigma > 0 ? synchronousAverage(acq({ shaftA: false, defect: false, shaftB: false, noiseRms: sigma }), SPR, revs) : new Float64Array(SPR);
    const single = full.slice(0, SPR);
    return {
      raw: Array.from(full.slice(0, SPR * RAW_REVS)),
      tsa,
      truth,
      tsaSpec: orderSpectrum(tsa),
      singleSpec: orderSpectrum(single),
      bLeft: rmsOf(bOnly) * Math.SQRT2 / G.bAmp,
      noiseLeft: rmsOf(noiseOnly),
    };
  }, [revs, bRatio, sigma, defect]);

  const shown = residual ? removeOrders(data.tsa, G.regularOrders) : data.tsa;
  const truthShown = residual ? removeOrders(data.truth, G.regularOrders) : data.truth;
  const gain = tsaGain(bRatio, revs);
  const duration = revs / G.shaftHz;
  const yMax = residual ? 2 : 4;

  const rawT = data.raw.map((_, i) => (1000 * i) / G.fs);
  const kp = [0, 50, 100, 150];
  const rawSeries: PlotSeries[] = [
    { x: rawT, y: data.raw, name: '센서 신호', color: 'var(--plot-1)', width: 1.2 },
    ...kp.map((t, i): PlotSeries => ({
      x: [t, t], y: [-5, 5], name: '키페이저 (한 바퀴 시작)', color: 'var(--text-muted)', dash: 'dash', width: 1, hideInLegend: i > 0,
    })),
  ];
  const angleSeries: PlotSeries[] = [
    { x: ANGLE, y: truthShown, name: '축 A 성분만 (참값)', color: 'var(--text-muted)', dash: 'dash', width: 1.4 },
    { x: ANGLE, y: Array.from(shown, clean), name: residual ? `${revs}바퀴 TSA에서 1X·맞물림을 뺀 것` : `${revs}바퀴 TSA`, color: 'var(--plot-1)', width: 2 },
  ];
  const specSeries: PlotSeries[] = [
    { x: data.singleSpec.order, y: data.singleSpec.amp, name: '한 바퀴만 (M = 1)', kind: 'bar', color: 'var(--text-muted)', opacity: 0.45, barWidth: 0.8 },
    { x: data.tsaSpec.order, y: data.tsaSpec.amp, name: `${revs}바퀴 TSA`, kind: 'bar', color: 'var(--plot-1)', barWidth: 0.45 },
    { x: [bRatio, bRatio], y: [0, 1.2], name: `축 B 성분 자리 (${bRatio.toFixed(2)}차)`, color: 'var(--plot-2)', dash: 'dash', width: 1.4 },
  ];

  return (
    <LabFrame id="LAB-AVG-02" title="TSA: 한 바퀴씩 잘라 같은 각도끼리 평균하기"
      controls={<>
        <ParamSlider label="평균할 바퀴 수 M" value={revs} min={1} max={200} step={1} onChange={setRevs} />
        <ParamSlider label="축 B 성분의 주파수비 ρ (축 A 회전 주파수의 몇 배)" value={bRatio} min={10} max={17} step={0.05}
          format={(v) => v.toFixed(2)} onChange={setBRatio} hint="정수면 축 A와 구분할 수 없습니다. 13.40과 13.05를 비교해 보세요." />
        <ParamSlider label="잡음 크기 σ" value={sigma} min={0} max={1.5} step={0.1} unit="m/s² RMS" format={(v) => v.toFixed(1)} onChange={setSigma} />
        <ParamToggle label="120° 자리 이빨의 결함 충격" checked={defect} onChange={setDefect} />
        <ParamToggle label="규칙적인 성분(1X·맞물림) 빼고 보기" checked={residual} onChange={setResidual}
          hint="TSA 결과에서 1X·15차·30차를 빼면 결함 충격처럼 '규칙에서 벗어난 것'만 남습니다." />
      </>}
      formulas={<>
        <Formula display tex={`\\bar x(\\theta) = \\frac{1}{M}\\sum_{m=0}^{M-1} x(\\theta + 2\\pi m),\\quad M = ${revs}`} />
        <Formula display tex={`\\lvert H\\rvert = \\left\\lvert\\frac{\\sin(\\pi M\\rho)}{M\\sin(\\pi\\rho)}\\right\\rvert = \\left\\lvert\\frac{\\sin(\\pi\\cdot ${revs}\\cdot ${bRatio.toFixed(2)})}{${revs}\\,\\sin(\\pi\\cdot ${bRatio.toFixed(2)})}\\right\\rvert = ${texNumber(clean(gain), 3)}`} />
        <Formula display tex={`\\frac{\\sigma}{\\sqrt{M}} = \\frac{${sigma.toFixed(1)}}{\\sqrt{${revs}}} = ${texNumber(sigma / Math.sqrt(revs), 3)}\\ \\mathrm{m/s^2},\\qquad T = \\frac{M}{f_r} = \\frac{${revs}}{${G.shaftHz}} = ${texNumber(duration, 3)}\\ \\mathrm{s}`} />
        <p>θ는 축 A의 회전 각도, ρ는 축 B 성분의 주파수 ÷ 축 A의 회전 주파수, |H|는 그 성분이 평균 뒤에 남는 비율, f_r = {G.shaftHz} Hz ({G.rpm} rpm)입니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: '평균한 바퀴 수', value: revs },
        { label: '측정 시간', value: duration, unit: 's' },
        { label: '축 B 성분이 남은 비율', value: clean(data.bLeft), theory: clean(gain) },
        { label: '남은 잡음 (RMS)', value: clean(data.noiseLeft), theory: sigma / Math.sqrt(revs), unit: 'm/s²' },
        { label: '맞물림 성분 (15차) 진폭', value: data.tsaSpec.amp[G.teeth], theory: sigma === 0 && !defect ? G.meshAmp : undefined, unit: 'm/s² Pk' },
      ]} />}
      tasks={[
        { question: 'M을 1 → 4 → 16 → 64로 늘리면 TSA 결과에서 무엇이 사라지고 무엇이 남나요?',
          answer: '잡음(RMS 0.8 → 0.1 m/s²)과 축 B 성분(남는 비율 1/M)이 사라지고, 축 A에 묶인 1X·맞물림 성분과 120° 자리의 결함 충격은 그대로 남아 회색 참값 선에 겹쳐집니다.' },
        { question: 'M = 16에서 ρ를 13.40과 13.05로 바꿔 보세요. 축 B 성분이 더 많이 남는 쪽은?',
          answer: '13.05입니다. 남는 비율이 13.40에서는 1/16 = 0.0625, 13.05에서는 0.235입니다. 바퀴마다 위상이 0.05바퀴(18°)씩만 밀려서 16바퀴로는 다 돌지 못합니다. 첫 영점은 M = 1/0.05 = 20입니다.' },
        { question: '"규칙적인 성분 빼고 보기"를 켜고 M을 늘려 보세요. 결함 충격은 몇 바퀴쯤부터 또렷한가요?',
          answer: '한 바퀴로는 잡음에 묻혀 있고, 대략 16바퀴(잡음 0.2 m/s²)부터 120° 자리의 울림이 또렷합니다. 이빨 하나가 24°라서 0°부터 세면 여섯 번째 이빨(120° ~ 144°) 자리입니다.' },
        { question: 'M = 64면 측정 시간은? 축이 60 rpm(1 Hz)으로 돈다면?',
          answer: '1200 rpm(20 Hz)에서는 64 ÷ 20 = 3.2초입니다. 60 rpm이면 64초가 걸립니다. TSA의 측정 시간은 바퀴 수 ÷ 회전 주파수라서 느린 축일수록 오래 걸립니다.' },
      ]}
      footer={<>
        <p>축 A: {G.shaftHz} Hz({G.rpm} rpm), 이빨 {G.teeth}개 → 맞물림 {G.teeth * G.shaftHz} Hz(15차)와 30차, 1X. 결함은 120° 자리 이빨에서 한 바퀴에 한 번 치는 충격(울림 {G.ringHz} Hz). 축 B 성분: ρ × {G.shaftHz} Hz, 진폭 {G.bAmp} m/s². 한 바퀴 = {SPR}점(f_s = {G.fs} Hz), 회전수 일정. 잡음은 시드가 고정되어 같은 설정은 같은 결과입니다.</p>
        <p>이론 잡음 σ/√M = {formatNumber(sigma / Math.sqrt(revs), 3)} m/s². 남은 비율과 잡음의 "잰 값"은 축 B 성분·잡음만 따로 TSA해서 잰 것입니다.</p>
      </>}
    >
      <h4>센서 신호: 처음 세 바퀴 (축 A 키페이저로 나눔)</h4>
      <Plot series={rawSeries} x={{ label: '시간 [ms]', range: [0, 150] }} y={{ label: '가속도 [m/s²]', range: [-5, 5] }} height={250}
        ariaLabel="처음 세 바퀴의 센서 신호와 키페이저 위치" />
      <h4>{residual ? 'TSA에서 1X·맞물림 성분을 뺀 나머지' : 'TSA 결과'} (축 A 회전 각도)</h4>
      <Plot series={angleSeries} x={{ label: '축 A 회전 각도 [°]', range: [0, 360] }} y={{ label: '가속도 [m/s²]', range: [-yMax, yMax] }} height={270}
        ariaLabel="TSA 결과와 축 A 성분만의 참값" />
      <h4>차수 스펙트럼: 한 바퀴만 vs TSA</h4>
      <Plot series={specSeries} x={{ label: '차수 (축 A 회전 주파수의 몇 배)', range: [-0.5, MAX_ORDER + 0.5] }} y={{ label: '진폭 [m/s² Pk]', range: [0, 1.2] }} height={250}
        ariaLabel="한 바퀴 스펙트럼과 TSA 스펙트럼" />
    </LabFrame>
  );
}
