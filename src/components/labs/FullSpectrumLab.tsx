import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { fullSpectrum } from '../../lib/dsp/twoChannel';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import { ORBIT_DEMO, orbitSignals } from '../../lib/xchDemo';

/**
 * LAB-FULL-01 Full spectrum: 오빗과 정방향·역방향 성분 (P5-3, Contents §5-1b).
 * 신호: src/lib/xchDemo.ts (본문 그림 5 · 6과 같음), 계산: src/lib/dsp/twoChannel.ts.
 * 오빗은 P4-2의 JeffcottLab처럼 SVG로 그린다 (x 오른쪽, y 위, 반시계 = 정방향).
 */

const { f1, fs } = ORBIT_DEMO;
const um = 1e6;
const FMAX = 100;
const SIZE = 300;
const C = SIZE / 2;
const SCALE = 120 / 110e-6; // 110 µm → 120 px
/** 이론상 0인 값의 찌꺼기는 0으로 (I-019) */
const clean = (v: number) => (Math.abs(v) < 1e-6 ? 0 : v);

export default function FullSpectrumLab() {
  const [ax, setAx] = useState(50);
  const [ay, setAy] = useState(50);
  const [lag, setLag] = useState(90);
  const [gain, setGain] = useState(0);
  const [angle, setAngle] = useState(0);
  const [whirl, setWhirl] = useState(false);

  const r = useMemo(() => {
    const s = orbitSignals({ ax: ax * 1e-6, ay: ay * 1e-6, lagDeg: lag, gainErr: gain / 100, angleErrDeg: angle, whirl: whirl ? 20e-6 : 0 });
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
      start: pts[0],
      next: pts[3],
    };
  }, [ax, ay, lag, gain, angle, whirl]);

  const dir = r.af > r.ab * 1.02 ? '반시계 (정방향)' : r.ab > r.af * 1.02 ? '시계 (역방향)' : '직선 (양쪽 같음)';
  const fullSeries: PlotSeries[] = [{ x: r.fx, y: r.fa, name: 'Full spectrum', kind: 'bar', barWidth: 2, color: 'var(--plot-1)' }];
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
            ...(whirl ? [{ label: '+0.45X / −0.45X', value: r.wf, theory: 20, unit: 'µm', sig: 3 }] : []),
          ]}
        />
      }
      tasks={[
        {
          question: 'X·Y 진폭을 그대로 두고 Y의 늦음만 90° → 45° → 0° → 270°로 바꾸면, X·Y 반쪽 스펙트럼과 Full spectrum은 각각 어떻게 바뀌나요?',
          answer: '반쪽 스펙트럼은 네 경우 모두 50 Hz에 50 µm로 그대로입니다. Full spectrum은 90°: +50 Hz만 50 µm, 45°: 46.2·19.1 µm, 0°: 양쪽 35.4 µm, 270°: −50 Hz만 50 µm로 바뀝니다. 방향은 X·Y의 위상차에만 들어 있습니다.',
        },
        {
          question: '반시계 원(90°)에서 Y 센서 감도 오차 +10 %와 각도 오차 10°를 각각 줘 보세요. 가짜 역방향 막대는 반지름의 몇 %인가요?',
          answer: '감도 10 %는 2.5 µm(5 %), 각도 10°는 4.4 µm(sin 5° = 8.7 %)입니다. 작은 역방향 막대는 센서 각도·감도부터 확인합니다.',
        },
      ]}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`오빗: ${dir}`} style={{ display: 'block', width: '100%', maxWidth: 300, margin: '0 auto' }}>
          <line x1={0} y1={C} x2={SIZE} y2={C} style={{ stroke: 'var(--border)' }} />
          <line x1={C} y1={0} x2={C} y2={SIZE} style={{ stroke: 'var(--border)' }} />
          <circle cx={C} cy={C} r={50e-6 * SCALE} style={{ fill: 'none', stroke: 'var(--border)', strokeDasharray: '4 4' }} />
          <text x={SIZE - 6} y={C - 6} textAnchor="end" style={{ fill: 'var(--text-muted)', fontSize: 12 }}>X</text>
          <text x={C + 6} y={14} style={{ fill: 'var(--text-muted)', fontSize: 12 }}>Y</text>
          <path d={r.path} style={{ fill: 'none', stroke: 'var(--plot-3)', strokeWidth: 1.8 }} />
          <circle cx={r.start[0]} cy={r.start[1]} r={4} style={{ fill: 'var(--plot-3)' }} />
          <line x1={r.start[0]} y1={r.start[1]} x2={r.next[0]} y2={r.next[1]} style={{ stroke: 'var(--plot-2)', strokeWidth: 3 }} />
          <text x={8} y={SIZE - 8} style={{ fill: 'var(--text-muted)', fontSize: 12 }}>점: 시작, 주황: 처음 움직이는 쪽 · {dir}</text>
        </svg>
      </div>
      <Plot series={halfSeries} x={{ label: '주파수 [Hz] (반쪽)', range: [0, FMAX] }} y={{ label: '진폭 [µm]', range: [0, 90] }} height={170} ariaLabel="X와 Y의 반쪽 스펙트럼" />
      <Plot series={fullSeries} x={{ label: '주파수 [Hz] (− = 역방향, + = 정방향)', range: [-FMAX, FMAX] }} y={{ label: '반지름 [µm]', range: [0, 90] }} height={200} ariaLabel="Full spectrum" />
    </LabFrame>
  );
}
