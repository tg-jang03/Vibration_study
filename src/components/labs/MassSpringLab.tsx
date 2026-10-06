import { useEffect, useId, useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { freeResponse, freeResponseAt, sdofProperties } from '../../lib/mck';

const SYSTEM = { mass: 1, stiffness: 1000 };
const DURATION = 3;
const POINTS = 751;

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

export default function MassSpringLab() {
  const arrowId = useId().replace(/:/g, '');
  const [x0Mm, setX0Mm] = useState(10);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const props = useMemo(() => sdofProperties(SYSTEM), []);

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

  const x0 = x0Mm / 1000;
  const timeline = useMemo(() => Array.from({ length: POINTS }, (_, i) => (DURATION * i) / (POINTS - 1)), []);
  const response = useMemo(() => freeResponse(SYSTEM, { x0 }, timeline), [timeline, x0]);
  const current = freeResponseAt(SYSTEM, { x0 }, elapsed);
  const visibleCount = Math.max(1, Math.floor((elapsed / DURATION) * (POINTS - 1)) + 1);
  const shownT = timeline.slice(0, visibleCount);
  const shownX = response.slice(0, visibleCount).map((state) => 1000 * state.x);
  const currentMm = Math.abs(current.x) < 1e-12 ? 0 : current.x * 1000;
  const currentVelocity = Math.abs(current.v) < 1e-12 ? 0 : current.v;
  const restoringForce = Math.abs(current.x) < 1e-12 ? 0 : -SYSTEM.stiffness * current.x;
  const equilibriumX = 350;
  const massX = equilibriumX + currentMm * 6;
  const forceEnd = massX + restoringForce * 7;

  const plotSeries = useMemo<PlotSeries[]>(
    () => [
      { x: shownT, y: shownX, name: '지금까지의 변위 x(t)', color: '#2563eb', width: 2.4 },
      { x: [0, DURATION], y: [0, 0], name: '평형 위치', color: '#94a3b8', dash: 'dash', width: 1.3 },
      { x: [0, DURATION], y: [x0Mm, x0Mm], name: '+끝점', color: '#d97706', dash: 'dot', width: 1.1 },
      { x: [0, DURATION], y: [-x0Mm, -x0Mm], name: '−끝점', color: '#d97706', dash: 'dot', width: 1.1, hideInLegend: true },
      { x: [elapsed], y: [currentMm], name: '현재 위치', color: '#16a34a', mode: 'markers', markerSize: 9 },
    ],
    [shownT, shownX, x0Mm, elapsed, currentMm],
  );

  const resetForPull = (value: number) => {
    setPlaying(false);
    setElapsed(0);
    setX0Mm(value);
  };

  return (
    <LabFrame
      id="LAB-MCK-01"
      title="질량을 당겼다 놓으면"
      controls={
        <>
          <ParamSlider
            label="처음 당기는 거리 x₀"
            value={x0Mm}
            min={2}
            max={20}
            step={1}
            unit="mm"
            onChange={resetForPull}
          />
          <div className="param">
            <span>재생 제어</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="lab-button"
                type="button"
                onClick={() => {
                  if (elapsed >= DURATION) setElapsed(0);
                  setPlaying(true);
                }}
              >
                {elapsed >= DURATION ? '처음부터 재생' : playing ? '재생 중' : '재생'}
              </button>
              <button className="lab-button" type="button" onClick={() => setPlaying(false)} disabled={!playing}>
                정지
              </button>
              <button
                className="lab-button"
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setElapsed(0);
                }}
              >
                다시 당기기
              </button>
            </div>
          </div>
        </>
      }
      formulas={
        <Formula
          display
          tex={`F = -kx = -(${SYSTEM.stiffness})(${texNumber(current.x, 3)}) = ${texNumber(restoringForce, 3)}\ \mathrm{N}`}
        />
      }
      readouts={
        <ReadoutTable
          caption="현재 순간과 한 번 왕복"
          rows={[
            { label: '현재 시각 t', value: elapsed, unit: 's', sig: 4 },
            { label: '현재 변위 x', value: currentMm, unit: 'mm', sig: 4 },
            { label: '현재 속도', value: currentVelocity, unit: 'm/s', sig: 4 },
            { label: '복원력 F', value: restoringForce, unit: 'N', sig: 4 },
            { label: '한 번 왕복 시간 T', value: props.period, theory: 2 * Math.PI * Math.sqrt(SYSTEM.mass / SYSTEM.stiffness), unit: 's', sig: 4 },
          ]}
        />
      }
      tasks={[
        {
          question: '재생 직후 오른쪽 끝점에서 속도와 복원력은 각각 어떤가요?',
          answer: '속도는 0입니다. 방향을 바꾸기 직전이라 잠깐 멈춥니다. 복원력은 왼쪽을 향하고 크기는 kx₀입니다. x₀ = 10 mm이면 10 N입니다.',
        },
        {
          question: '질량이 평형 위치 x = 0을 지날 때 멈출까요, 가장 빠를까요?',
          answer: '가장 빠릅니다. 10 mm에서 놓으면 속도 크기는 약 0.316 m/s입니다. 복원력은 그 순간 0이지만 관성 때문에 그대로 지나갑니다.',
        },
        {
          question: '당기는 거리를 10 mm에서 20 mm로 두 배 늘리면 한 번 왕복 시간 T도 두 배가 될까요?',
          answer: '아닙니다. 이 선형 모델에서는 움직이는 폭만 두 배가 되고 T는 약 0.1987 s로 같습니다. 왜 박자가 그대로인지는 P0-2에서 m과 k로 계산합니다.',
        },
      ]}
      footer="기본값: m = 1 kg, k = 1000 N/m, 감쇠 없음. P0-2에서 m·k·초기 속도를 직접 바꾸는 모드로 확장합니다."
    >
      <div
        role="img"
        aria-label={`벽에 연결된 스프링과 질량. 질량은 평형에서 ${currentMm.toFixed(2)} mm 떨어져 있다.`}
        style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.35rem 0.5rem' }}
      >
        <svg viewBox="0 0 700 185" width="100%" style={{ display: 'block', minHeight: 180 }}>
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--plot-2)" />
            </marker>
          </defs>
          <line x1="52" y1="35" x2="52" y2="145" stroke="var(--text-muted)" strokeWidth="4" />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1="30" y1={42 + i * 13} x2="52" y2={30 + i * 13} stroke="var(--text-muted)" strokeWidth="1.5" />
          ))}
          <line x1={equilibriumX} y1="24" x2={equilibriumX} y2="158" stroke="var(--text-muted)" strokeDasharray="6 5" />
          <text x={equilibriumX} y="174" textAnchor="middle" fill="var(--text-muted)" fontSize="14">평형 위치 x = 0</text>
          <path d={springPath(52, massX - 42, 92)} fill="none" stroke="var(--plot-1)" strokeWidth="3" />
          <rect x={massX - 42} y="52" width="84" height="80" rx="7" fill="var(--accent-soft)" stroke="var(--plot-1)" strokeWidth="3" />
          <text x={massX} y="100" textAnchor="middle" fill="var(--text)" fontSize="21" fontWeight="700">m</text>
          {Math.abs(restoringForce) > 0.02 && (
            <>
              <line x1={massX} y1="40" x2={forceEnd} y2="40" stroke="var(--plot-2)" strokeWidth="3" markerEnd={`url(#${arrowId})`} />
              <text x={(massX + forceEnd) / 2} y="27" textAnchor="middle" fill="var(--plot-2)" fontSize="14">복원력</text>
            </>
          )}
          <text x="54" y="24" fill="var(--text-muted)" fontSize="14">고정된 벽</text>
          <text x={(52 + massX - 42) / 2} y="138" textAnchor="middle" fill="var(--text-muted)" fontSize="14">스프링 k</text>
        </svg>
      </div>
      <Plot
        series={plotSeries}
        x={{ label: '시간 t [s]', range: [0, DURATION] }}
        y={{ label: '변위 x [mm]', range: [-22, 22] }}
        height={300}
        ariaLabel="재생된 시각까지 그려지는 질량의 변위 시간파형"
      />
    </LabFrame>
  );
}
