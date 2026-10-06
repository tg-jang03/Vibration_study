import { useEffect, useId, useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { freeResponse, freeResponseAt, sdofProperties } from '../../lib/mck';

const BASIC_SYSTEM = { mass: 1, stiffness: 1000 };
const DURATION = 3;
const POINTS = 751;
/** 기본 모드 x₀ 최댓값 [mm]. 기본 모드는 이 값으로 그림·그래프 축척을 고정해 당기는 거리에 따라 폭이 달라 보이게 한다. */
const BASIC_MAX_X0_MM = 20;

type DisplayQuantity = 'x' | 'v' | 'a';

interface MassSpringLabProps {
  mode?: 'basic' | 'expanded';
}

const DISPLAY_OPTIONS = [
  { value: 'x', label: '변위 x [mm]' },
  { value: 'v', label: '속도 v [m/s]' },
  { value: 'a', label: '가속도 a [m/s²]' },
] as const;

function springPath(x1: number, x2: number, y: number, coils = 9, height = 22): string {
  const lead = 18;
  const span = Math.max(1, x2 - x1 - 2 * lead);
  const points: Array<[number, number]> = [[x1, y], [x1 + lead, y]];
  for (let i = 0; i < coils * 2; i++) {
    points.push([x1 + lead + ((i + 0.5) / (coils * 2)) * span, y + (i % 2 === 0 ? -height : height)]);
  }
  points.push([x2 - lead, y], [x2, y]);
  return points.map(([x, py], i) => `${i === 0 ? 'M' : 'L'} ${x} ${py}`).join(' ');
}

function clean(value: number): number {
  return Math.abs(value) < 1e-12 ? 0 : value;
}

export default function MassSpringLab({ mode = 'basic' }: MassSpringLabProps) {
  const expanded = mode === 'expanded';
  const arrowId = useId().replace(/:/g, '');
  const [mass, setMass] = useState(BASIC_SYSTEM.mass);
  const [stiffness, setStiffness] = useState(BASIC_SYSTEM.stiffness);
  const [x0Mm, setX0Mm] = useState(10);
  const [v0, setV0] = useState(0);
  const [display, setDisplay] = useState<DisplayQuantity>('x');
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);

  const system = useMemo(() => (expanded ? { mass, stiffness } : BASIC_SYSTEM), [expanded, mass, stiffness]);
  const properties = useMemo(() => sdofProperties(system), [system]);
  const x0 = x0Mm / 1000;
  const initial = useMemo(() => ({ x0, v0: expanded ? v0 : 0 }), [expanded, v0, x0]);
  const amplitude = Math.hypot(initial.x0, initial.v0 / properties.omegaN);

  useEffect(() => {
    if (!playing) return;
    const started = performance.now() - elapsed * 1000;
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(DURATION, (now - started) / 1000);
      setElapsed(next);
      if (next >= DURATION) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const timeline = useMemo(() => Array.from({ length: POINTS }, (_, i) => (DURATION * i) / (POINTS - 1)), []);
  const response = useMemo(() => freeResponse(system, initial, timeline), [initial, system, timeline]);
  const current = freeResponseAt(system, initial, elapsed);
  const visibleCount = Math.max(1, Math.floor((elapsed / DURATION) * (POINTS - 1)) + 1);
  const shownT = timeline.slice(0, visibleCount);
  const shown = response.slice(0, visibleCount);
  const currentMm = clean(current.x * 1000);
  const currentVelocity = clean(current.v);
  const currentAcceleration = clean(current.a);
  const restoringForce = clean(-system.stiffness * current.x);
  const equilibriumX = 350;
  // 기본 모드는 축척 고정(20 mm = 58 px), 확장 모드는 진폭이 100 mm까지 커질 수 있어 진폭에 맞춘다
  const animationScale = expanded ? 58 / Math.max(amplitude * 1000, 2) : 58 / BASIC_MAX_X0_MM;
  const quarter = properties.period / 4;
  const canStep = elapsed + quarter <= DURATION + 1e-9;
  const massX = equilibriumX + currentMm * animationScale;
  const forceLength = Math.min(100, Math.abs(restoringForce) * 5);
  const forceEnd = massX + (restoringForce === 0 ? 0 : Math.sign(restoringForce) * forceLength);

  const displayConfig = {
    x: { values: shown.map((s) => 1000 * s.x), current: currentMm, label: '변위 x [mm]', limit: (expanded ? Math.max(2, amplitude * 1000) : BASIC_MAX_X0_MM) * 1.15 },
    v: { values: shown.map((s) => s.v), current: currentVelocity, label: '속도 v [m/s]', limit: Math.max(0.02, amplitude * properties.omegaN) * 1.15 },
    a: { values: shown.map((s) => s.a), current: currentAcceleration, label: '가속도 a [m/s²]', limit: Math.max(0.2, amplitude * properties.omegaN ** 2) * 1.15 },
  }[display];

  const plotSeries = useMemo<PlotSeries[]>(() => [
    { x: shownT, y: displayConfig.values, name: `지금까지의 ${displayConfig.label}`, color: '#2563eb', width: 2.4 },
    { x: [0, DURATION], y: [0, 0], name: '0 기준선', color: '#94a3b8', dash: 'dash', width: 1.3 },
    ...(display === 'x' ? [
      { x: [0, DURATION], y: [amplitude * 1000, amplitude * 1000], name: '+끝점', color: '#d97706', dash: 'dot' as const, width: 1.1 },
      { x: [0, DURATION], y: [-amplitude * 1000, -amplitude * 1000], name: '−끝점', color: '#d97706', dash: 'dot' as const, width: 1.1, hideInLegend: true },
    ] : []),
    { x: [elapsed], y: [displayConfig.current], name: '현재 값', color: '#16a34a', mode: 'markers', markerSize: 9 },
  ], [amplitude, display, displayConfig, elapsed, shownT]);

  const reset = () => {
    setPlaying(false);
    setElapsed(0);
  };
  const change = (setter: (value: number) => void) => (value: number) => {
    reset();
    setter(value);
  };
  /** 다음 T/4 지점(평형점·끝점)으로 한 칸 넘긴다. 클릭할 때만 상태를 바꾼다. */
  const stepQuarter = () => {
    setPlaying(false);
    setElapsed((e) => Math.min(DURATION, (Math.floor(e / quarter + 1e-6) + 1) * quarter));
  };

  return (
    <LabFrame
      id="LAB-MCK-01"
      title={expanded ? '무엇이 고유진동수를 정할까?' : '질량을 당겼다 놓으면'}
      controls={
        <>
          {expanded && (
            <>
              <ParamSlider label="질량 m" value={mass} min={0.5} max={4} step={0.25} unit="kg" onChange={change(setMass)} />
              <ParamSlider label="강성 k" value={stiffness} min={100} max={4000} step={100} unit="N/m" onChange={change(setStiffness)} />
            </>
          )}
          <ParamSlider label="처음 변위 x₀" value={x0Mm} min={expanded ? -20 : 2} max={BASIC_MAX_X0_MM} step={1} unit="mm" onChange={change(setX0Mm)} />
          {expanded && (
            <>
              <ParamSlider label="처음 속도 v₀" value={v0} min={-0.5} max={0.5} step={0.05} unit="m/s" onChange={change(setV0)} />
              <ParamSelect label="그래프에 표시" value={display} options={DISPLAY_OPTIONS} onChange={setDisplay} />
            </>
          )}
          <div className="param">
            <span>재생 제어</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="lab-button" type="button" onClick={() => { if (elapsed >= DURATION) setElapsed(0); setPlaying(true); }}>
                {elapsed >= DURATION ? '처음부터 재생' : playing ? '재생 중' : '재생'}
              </button>
              <button className="lab-button" type="button" onClick={() => setPlaying(false)} disabled={!playing}>정지</button>
              <button className="lab-button" type="button" onClick={stepQuarter} disabled={!canStep}>T/4 앞으로</button>
              <button className="lab-button" type="button" onClick={reset}>처음 상태</button>
            </div>
          </div>
        </>
      }
      formulas={expanded ? (
        <>
          <Formula display tex={`\\omega_n = \\sqrt{\\dfrac{k}{m}} = \\sqrt{\\dfrac{${texNumber(system.stiffness)}}{${texNumber(system.mass)}}} = ${texNumber(properties.omegaN)}\\ \\mathrm{rad/s}`} />
          <Formula display tex={`f_n = \\dfrac{\\omega_n}{2\\pi} = ${texNumber(properties.frequencyHz)}\\ \\mathrm{Hz},\\qquad T = \\dfrac{1}{f_n} = ${texNumber(properties.period)}\\ \\mathrm{s}`} />
          <Formula display tex={`x(t) = ${texNumber(initial.x0)}\\cos(${texNumber(properties.omegaN)}t) + \\dfrac{${texNumber(initial.v0)}}{${texNumber(properties.omegaN)}}\\sin(${texNumber(properties.omegaN)}t)\\ \\mathrm{m}`} />
        </>
      ) : <Formula display tex={`F = -kx = -(${system.stiffness})(${texNumber(clean(current.x), 3)}) = ${texNumber(restoringForce, 3)}\\ \\mathrm{N}`} />}
      readouts={
        <ReadoutTable
          caption={expanded ? '계의 박자와 현재 상태' : '현재 순간과 한 번 왕복'}
          rows={expanded ? [
            { label: '고유진동수 fₙ', value: properties.frequencyHz, unit: 'Hz', sig: 4 },
            { label: '주기 T', value: properties.period, unit: 's', sig: 4 },
            { label: '진폭 A', value: amplitude * 1000, unit: 'mm', sig: 4 },
            { label: '현재 변위 x', value: currentMm, unit: 'mm', sig: 4 },
            { label: '현재 속도 v', value: currentVelocity, unit: 'm/s', sig: 4 },
            { label: '현재 가속도 a', value: currentAcceleration, unit: 'm/s²', sig: 4 },
          ] : [
            { label: '현재 시각 t', value: elapsed, unit: 's', sig: 4 },
            { label: '현재 변위 x', value: currentMm, unit: 'mm', sig: 4 },
            { label: '현재 속도', value: currentVelocity, unit: 'm/s', sig: 4 },
            { label: '복원력 F', value: restoringForce, unit: 'N', sig: 4 },
            { label: '한 번 왕복 시간 T', value: properties.period, theory: 2 * Math.PI * Math.sqrt(system.mass / system.stiffness), unit: 's', sig: 4 },
          ]}
        />
      }
      tasks={expanded ? [
        { question: 'm = 1 kg, k = 1000 N/m에서 fₙ과 T는 얼마인가요?', answer: 'fₙ ≈ 5.033 Hz, T ≈ 0.1987 s입니다. 1초에 약 5번 왕복합니다.' },
        { question: '질량 m을 1 kg에서 4 kg으로 늘리면 fₙ은 어떻게 되나요?', answer: '제곱근 관계라 절반이 됩니다. √(k/4m) = ½√(k/m).' },
        { question: '강성 k를 1000 N/m에서 4000 N/m으로 늘리면 fₙ은 어떻게 되나요?', answer: '두 배가 됩니다. √(4k/m) = 2√(k/m).' },
        { question: 'x₀만 두 배로 바꾸면 fₙ도 바뀌나요?', answer: '아닙니다. 진폭 A만 바뀌고, fₙ은 m과 k로만 정해집니다.' },
      ] : [
        { question: '재생 직후 오른쪽 끝점에서 속도와 복원력은 각각 어떤가요?', answer: '속도는 0입니다. 복원력은 왼쪽을 향하고 크기는 kx₀입니다. x₀ = 10 mm이면 10 N입니다.' },
        { question: '질량이 평형 위치 x = 0을 지날 때 멈출까요, 가장 빠를까요?', answer: '가장 빠릅니다. 10 mm에서 놓으면 속도 크기는 약 0.316 m/s입니다. T/4 앞으로를 한 번 누르면 그 순간에서 멈춰 읽을 수 있습니다.' },
        { question: '당기는 거리를 두 배 늘리면 한 번 왕복 시간 T도 두 배가 될까요?', answer: '아닙니다. 움직이는 폭·복원력·최대 속도는 두 배가 되지만 T는 약 0.1987 s로 같습니다.' },
      ]}
      footer={expanded ? '감쇠가 없는 선형 질량-스프링 모델. 모든 계산은 SI 단위의 해석해를 사용합니다.' : '기본값: m = 1 kg, k = 1000 N/m, 감쇠 없음. P1-2에서 m·k·초기 속도를 직접 바꿉니다.'}
    >
      <div role="img" aria-label={`벽에 연결된 스프링과 질량. 질량은 평형에서 ${currentMm.toFixed(2)} mm 떨어져 있다.`} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.35rem 0.5rem' }}>
        <svg viewBox="0 0 700 185" width="100%" style={{ display: 'block', minHeight: 180 }}>
          <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--plot-2)" /></marker></defs>
          <line x1="52" y1="35" x2="52" y2="145" stroke="var(--text-muted)" strokeWidth="4" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1="30" y1={42 + i * 13} x2="52" y2={30 + i * 13} stroke="var(--text-muted)" strokeWidth="1.5" />)}
          <line x1={equilibriumX} y1="24" x2={equilibriumX} y2="158" stroke="var(--text-muted)" strokeDasharray="6 5" />
          <text x={equilibriumX} y="174" textAnchor="middle" fill="var(--text-muted)" fontSize="14">평형 위치 x = 0</text>
          <path d={springPath(52, massX - 42, 92)} fill="none" stroke="var(--plot-1)" strokeWidth="3" />
          <rect x={massX - 42} y="52" width="84" height="80" rx="7" fill="var(--accent-soft)" stroke="var(--plot-1)" strokeWidth="3" />
          <text x={massX} y="100" textAnchor="middle" fill="var(--text)" fontSize="21" fontWeight="700">m</text>
          {Math.abs(restoringForce) > 0.02 && <><line x1={massX} y1="40" x2={forceEnd} y2="40" stroke="var(--plot-2)" strokeWidth="3" markerEnd={`url(#${arrowId})`} /><text x={(massX + forceEnd) / 2} y="27" textAnchor="middle" fill="var(--plot-2)" fontSize="14">복원력</text></>}
          <text x="54" y="24" fill="var(--text-muted)" fontSize="14">고정된 벽</text>
          <text x={(52 + massX - 42) / 2} y="138" textAnchor="middle" fill="var(--text-muted)" fontSize="14">스프링 k</text>
        </svg>
      </div>
      <Plot series={plotSeries} x={{ label: '시간 t [s]', range: [0, DURATION] }} y={{ label: displayConfig.label, range: [-displayConfig.limit, displayConfig.limit] }} height={300} ariaLabel={`재생된 시각까지 그려지는 질량의 ${displayConfig.label} 시간파형`} />
    </LabFrame>
  );
}
