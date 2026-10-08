import { useMemo, useRef, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import { usePlayClock } from '../ui/hooks';
import { SvgArrow } from '../ui/PhasorView';
import PlayControls from '../ui/PlayControls';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { phasorChain, type Phasor } from '../../lib/dsp/phasor';
import { fullSpectrum } from '../../lib/dsp/twoChannel';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import { ORBIT_DEMO, orbitPhasors, orbitSignals } from '../../lib/xchDemo';

/**
 * LAB-FULL-01 Full spectrum: 오빗과 정방향·역방향 성분 (P5-3, Contents §5-1b).
 * 신호: src/lib/xchDemo.ts (본문 그림 5 · 6과 같음), 계산: src/lib/dsp/twoChannel.ts.
 * 오빗은 P4-2의 JeffcottLab처럼 SVG로 그린다 (x 오른쪽, y 위, 반시계 = 정방향).
 * 움직이는 그림 (D-044): 정방향(+1X)·역방향(−1X) 화살표를 이으면 끝이 오빗을 그린다. 화살표 길이 = Full spectrum 막대.
 */

const { f1, fs } = ORBIT_DEMO;
const um = 1e6;
const FMAX = 100;
const SIZE = 300;
const C = SIZE / 2;
const SCALE = 120 / 110e-6; // 110 µm → 120 px
/** 이론상 0인 값의 찌꺼기는 0으로 (I-019) */
const clean = (v: number) => (Math.abs(v) < 1e-6 ? 0 : v);
/** 화살표 색: 정방향 = 파랑, 역방향 = 주황 (Full spectrum 막대와 같음), 0.45X는 보라 */
const ARROW_COLORS = ['var(--plot-1)', 'var(--plot-2)', 'var(--plot-4)', 'var(--plot-4)'];
const ARROW_LABELS = ['+1X', '−1X', '+0.45X', '−0.45X'];
const SPEEDS = [
  { label: '느리게 (실제의 1/100)', rate: 1 / 100 },
  { label: '보통 (실제의 1/50)', rate: 1 / 50 },
  { label: '빠르게 (실제의 1/25)', rate: 1 / 25 },
];
const PERIOD = 0.4; // 1X 20바퀴, 0.45X 9바퀴의 공통 주기 [s]

/** 오빗 위에서 두(네) 화살표가 도는 그림. 시계가 여기에만 있어 아래 Plot은 매 프레임 다시 그리지 않는다 */
function OrbitView({ chain, path, dir }: { chain: Phasor[]; path: string; dir: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(0);
  const clock = usePlayClock(SPEEDS[speed].rate, PERIOD, box);
  const pts = phasorChain(chain, clock.t).map((p) => [C + p.re * SCALE, C - p.im * SCALE] as const);
  const [tx, ty] = pts[pts.length - 1];
  const turns = clock.t * f1;
  // 끝이 방금 지나온 1X 한 바퀴 (전체 오빗은 옅게, 이 꼬리는 진하게)
  const trail = Array.from({ length: 49 }, (_, i) => {
    const tip = phasorChain(chain, clock.t - ((48 - i) / 48) / f1).at(-1)!;
    return `${i === 0 ? 'M' : 'L'}${(C + tip.re * SCALE).toFixed(1)},${(C - tip.im * SCALE).toFixed(1)}`;
  }).join('');
  return (
    <div className="anim-panel" ref={box} style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <PlayControls clock={clock} speeds={SPEEDS} speed={speed} onSpeed={setSpeed} status={`1X ${turns.toFixed(2)}바퀴`} />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`오빗: ${dir}. 정방향 화살표와 역방향 화살표를 이은 끝이 오빗을 그린다.`} style={{ display: 'block', width: '100%' }}>
        <line x1={0} y1={C} x2={SIZE} y2={C} style={{ stroke: 'var(--border)' }} />
        <line x1={C} y1={0} x2={C} y2={SIZE} style={{ stroke: 'var(--border)' }} />
        <circle cx={C} cy={C} r={50e-6 * SCALE} style={{ fill: 'none', stroke: 'var(--border)', strokeDasharray: '4 4' }} />
        <text x={SIZE - 6} y={C - 6} textAnchor="end" style={{ fill: 'var(--text-muted)', fontSize: 12 }}>X</text>
        <text x={C + 6} y={14} style={{ fill: 'var(--text-muted)', fontSize: 12 }}>Y</text>
        <path d={path} style={{ fill: 'none', stroke: 'var(--plot-3)', strokeWidth: 1.4, opacity: chain.length > 2 ? 0.3 : 0.6 }} />
        <path d={trail} style={{ fill: 'none', stroke: 'var(--plot-3)', strokeWidth: 2.4 }} />
        {/* X·Y 센서가 읽는 값 = 끝의 가로·세로 위치 */}
        <line x1={tx} y1={ty} x2={tx} y2={C} stroke="var(--text-muted)" strokeDasharray="2 3" />
        <line x1={tx} y1={ty} x2={C} y2={ty} stroke="var(--text-muted)" strokeDasharray="2 3" />
        {chain.map((a, i) => a.amp * SCALE > 1.5 && (
          <circle key={`c${i}`} cx={pts[i][0]} cy={pts[i][1]} r={a.amp * SCALE} fill="none" stroke={ARROW_COLORS[i]} strokeWidth="1" opacity="0.4" />
        ))}
        {chain.map((_, i) => (
          <SvgArrow key={`a${i}`} x1={pts[i][0]} y1={pts[i][1]} x2={pts[i + 1][0]} y2={pts[i + 1][1]} color={ARROW_COLORS[i]} width={i < 2 ? 3 : 2.2} opacity={i === 3 ? 0.7 : 1} />
        ))}
        {chain.slice(0, 2).map((a, i) => a.amp * SCALE > 10 && (
          <text key={`l${i}`} x={pts[i + 1][0] + 6} y={pts[i + 1][1] - 6} style={{ fill: ARROW_COLORS[i], fontSize: 12, fontWeight: 600 }}>{ARROW_LABELS[i]}</text>
        ))}
        <circle cx={tx} cy={ty} r={5} style={{ fill: 'var(--plot-3)' }} />
        <text x={8} y={SIZE - 8} style={{ fill: 'var(--text-muted)', fontSize: 12 }}>{dir}</text>
      </svg>
      <p className="anim-caption">
        <span style={{ color: 'var(--plot-1)', fontWeight: 600 }}>파랑 +1X</span>는 반시계(정방향)로, <span style={{ color: 'var(--plot-2)', fontWeight: 600 }}>주황 −1X</span>는 시계(역방향)로
        같은 빠르기로 돕니다. 둘을 이은 끝(초록 점)이 오빗을 그리고(진한 선 = 방금 지나온 한 바퀴), 끝의 가로·세로 위치가 X·Y 센서 값입니다. 화살표 길이가 아래 Full spectrum의 같은 색 막대입니다.
        {chain.length > 2 && <> <span style={{ color: 'var(--plot-4)', fontWeight: 600 }}>보라</span>는 0.45X의 정방향·역방향 화살표입니다.</>}
      </p>
    </div>
  );
}

export default function FullSpectrumLab() {
  const [ax, setAx] = useState(50);
  const [ay, setAy] = useState(50);
  const [lag, setLag] = useState(90);
  const [gain, setGain] = useState(0);
  const [angle, setAngle] = useState(0);
  const [whirl, setWhirl] = useState(false);

  const r = useMemo(() => {
    const opts = { ax: ax * 1e-6, ay: ay * 1e-6, lagDeg: lag, gainErr: gain / 100, angleErrDeg: angle, whirl: whirl ? 20e-6 : 0 };
    const s = orbitSignals(opts);
    const full = fullSpectrum(s.x, s.y, fs);
    const keep = Array.from(full.freq.keys()).filter((i) => Math.abs(full.freq[i]) <= FMAX && full.amp[i] * um > 0.05);
    const at = (hz: number) => full.amp[full.freq.findIndex((v) => Math.abs(v - hz) < 1e-9)] * um;
    const hx = singleSidedSpectrum({ fs, x: s.x });
    const hy = singleSidedSpectrum({ fs, x: s.y });
    const half = (h: typeof hx) => Array.from(h.frequency.keys()).filter((i) => h.frequency[i] <= FMAX && h.amplitude[i] * um > 0.05);
    // 오빗: 공통 주기 0.4 s (1X 20바퀴, 0.45X 9바퀴)
    const per = Math.round(0.4 * fs);
    const pts = Array.from({ length: per + 1 }, (_, i) => [C + s.x[i % per] * SCALE, C - s.y[i % per] * SCALE]);
    return {
      fx: keep.map((i) => full.freq[i]),
      fa: keep.map((i) => full.amp[i] * um),
      hxF: half(hx).map((i) => hx.frequency[i]),
      hxA: half(hx).map((i) => hx.amplitude[i] * um),
      hyF: half(hy).map((i) => hy.frequency[i]),
      hyA: half(hy).map((i) => hy.amplitude[i] * um),
      af: clean(at(f1)),
      ab: clean(at(-f1)),
      wf: clean(at(0.45 * f1)),
      wb: clean(at(-0.45 * f1)),
      path: pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(''),
      chain: orbitPhasors(opts),
    };
  }, [ax, ay, lag, gain, angle, whirl]);

  const dir = r.af > r.ab * 1.02 ? '반시계 (정방향)' : r.ab > r.af * 1.02 ? '시계 (역방향)' : '직선 (양쪽 같음)';
  const side = (sign: 1 | -1) => r.fx.flatMap((f, i) => (Math.sign(f) === sign ? [i] : []));
  const fullSeries: PlotSeries[] = [
    { x: side(1).map((i) => r.fx[i]), y: side(1).map((i) => r.fa[i]), name: '정방향 (+, 반시계)', kind: 'bar', barWidth: 2, color: 'var(--plot-1)' },
    { x: side(-1).map((i) => r.fx[i]), y: side(-1).map((i) => r.fa[i]), name: '역방향 (−, 시계)', kind: 'bar', barWidth: 2, color: 'var(--plot-2)' },
  ];
  const halfSeries: PlotSeries[] = [
    { x: r.hxF.map((v) => v - 0.8), y: r.hxA, name: 'X 반쪽 스펙트럼', kind: 'bar', barWidth: 1.5, color: 'var(--plot-2)' },
    { x: r.hyF.map((v) => v + 0.8), y: r.hyA, name: 'Y 반쪽 스펙트럼', kind: 'bar', barWidth: 1.5, color: 'var(--plot-3)' },
  ];
  const lagRad = (lag * Math.PI) / 180;

  return (
    <LabFrame
      id="LAB-FULL-01"
      title="Full spectrum: 오빗과 정방향·역방향 성분"
      controls={
        <>
          <ParamSlider label="X 진폭" value={ax} min={0} max={80} step={5} unit=" µm" onChange={setAx} />
          <ParamSlider label="Y 진폭" value={ay} min={0} max={80} step={5} unit=" µm" onChange={setAy} />
          <ParamSlider label="Y가 X보다 늦은 위상" value={lag} min={0} max={345} step={15} unit="°" onChange={setLag} hint="90° = 반시계 원, 270° = 시계 원" />
          <ParamSlider label="Y 센서 감도 오차" value={gain} min={-20} max={20} step={5} unit=" %" onChange={setGain} />
          <ParamSlider label="Y 센서 설치 각도 오차" value={angle} min={-20} max={20} step={5} unit="°" onChange={setAngle} />
          <ParamToggle label="0.45X 성분 (반시계 원 20 µm)" checked={whirl} onChange={setWhirl} hint="P5-2의 오일 휠처럼 축과 같은 방향으로 도는 성분" />
        </>
      }
      formulas={
        <>
          <Formula display tex={`\\lvert A_f\\rvert = \\dfrac{\\lvert \\tilde X + j\\tilde Y\\rvert}{2},\\quad \\lvert A_b\\rvert = \\dfrac{\\lvert \\tilde X^{*} + j\\tilde Y^{*}\\rvert}{2},\\quad \\tilde X = ${ax},\\ \\tilde Y = ${ay}\\,e^{-j${lag}^\\circ}`} />
          <Formula display tex={`\\text{센서 오차 없으면: } \\lvert A_f\\rvert = ${texNumber(clean((Math.hypot(ax + ay * Math.sin(lagRad), ay * Math.cos(lagRad))) / 2), 3)},\\ \\lvert A_b\\rvert = ${texNumber(clean(Math.hypot(ax - ay * Math.sin(lagRad), ay * Math.cos(lagRad)) / 2), 3)}\\ \\mu\\mathrm{m}`} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '+1X (+50 Hz) 정방향 반지름', value: r.af, unit: 'µm', sig: 3 },
            { label: '−1X (−50 Hz) 역방향 반지름', value: r.ab, unit: 'µm', sig: 3 },
            ...(whirl ? [{ label: '+0.45X (정방향)', value: r.wf, theory: 20, unit: 'µm', sig: 3 }, { label: '−0.45X (역방향)', value: r.wb, theory: 0, unit: 'µm', sig: 3 }] : []),
          ]}
        />
      }
      tasks={[
        {
          question: 'X·Y 진폭을 그대로 두고 Y의 늦음만 90° → 45° → 0° → 270°로 바꾸면, X·Y 반쪽 스펙트럼과 Full spectrum은 각각 어떻게 바뀌나요?',
          answer: '반쪽 스펙트럼은 네 경우 모두 50 Hz에 50 µm로 그대로입니다. Full spectrum은 90°: +50 Hz만 50 µm, 45°: 46.2·19.1 µm, 0°: 양쪽 35.4 µm, 270°: −50 Hz만 50 µm로 바뀝니다. 방향은 X·Y의 위상차에만 들어 있습니다.',
        },
        {
          question: 'Y의 늦음을 45°로 두고 오빗 그림의 재생을 누르세요. 타원의 가장 긴 반지름과 가장 짧은 반지름은 두 화살표 길이로 어떻게 정해질까요?',
          answer: '두 화살표가 같은 쪽을 가리킬 때 끝이 가장 멀고(46.2 + 19.1 = 65.3 µm, 긴 반지름), 서로 반대쪽을 가리킬 때 가장 가깝습니다(46.2 − 19.1 = 27.1 µm, 짧은 반지름). 정방향이 더 길어서 끝은 반시계로 돕니다. 역방향이 0이면 원(90°), 두 길이가 같으면 직선(0°)이 됩니다.',
        },
        {
          question: '반시계 원(90°)에서 Y 센서 감도 오차 +10 %와 각도 오차 10°를 각각 줘 보세요. 가짜 역방향 막대는 반지름의 몇 %인가요?',
          answer: '감도 10 %는 2.5 µm(5 %), 각도 10°는 4.4 µm(sin 5° = 8.7 %)입니다. 작은 역방향 막대는 센서 각도·감도부터 확인합니다.',
        },
      ]}
    >
      <OrbitView chain={r.chain} path={r.path} dir={`회전 방향: ${dir}`} />
      <Plot series={halfSeries} x={{ label: '주파수 [Hz] (반쪽)', range: [0, FMAX] }} y={{ label: '진폭 [µm]', range: [0, 90] }} height={170} ariaLabel="X와 Y의 반쪽 스펙트럼" />
      <Plot series={fullSeries} x={{ label: '주파수 [Hz] (− = 역방향, + = 정방향)', range: [-FMAX, FMAX] }} y={{ label: '반지름 [µm]', range: [0, 90] }} height={200} ariaLabel="Full spectrum" />
    </LabFrame>
  );
}
