import { useEffect, useId, useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame, { type LabTask } from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { unbalancePeak, unbalanceResponseFactor, unbalanceSteadyState } from '../../lib/mck';

const TOTAL_MASS = 100; // 100 kg
const FN = 50; // 50 Hz (3000 rpm)
const OMEGA_N = 2 * Math.PI * FN;
const RPM_MAX = 6000;
const RPM_POINTS = 301;
const RPM_CURVE = Array.from({ length: RPM_POINTS }, (_, i) => (RPM_MAX * i) / (RPM_POINTS - 1));

function clean(value: number): number {
  return Math.abs(value) < 1e-12 ? 0 : value;
}

const deg = (rad: number) => (rad * 180) / Math.PI;

export default function UnbalanceLab() {
  const arrowId = useId().replace(/:/g, '');
  const [rpm, setRpm] = useState(1500);
  const [zeta, setZeta] = useState(0.05);
  const [eCgMm, setECgMm] = useState(0.1); // 편심량 mu*e / M [mm]
  const [runningUp, setRunningUp] = useState(false);
  const [angle, setAngle] = useState(0);

  const me = (eCgMm / 1000) * TOTAL_MASS; // kg*m
  const f1X = rpm / 60;
  const omega = 2 * Math.PI * f1X;
  const r = omega / OMEGA_N;

  const current = useMemo(
    () => unbalanceSteadyState(TOTAL_MASS, me, omega, OMEGA_N, zeta),
    [me, omega, zeta],
  );

  const currentAmpMm = current.displacementAmplitude * 1000;
  const currentPhaseDeg = deg(current.phaseLag);
  const peak = useMemo(() => unbalancePeak(zeta), [zeta]);

  // 런업 자동 가속 제어
  useEffect(() => {
    if (!runningUp) return;
    let lastTime = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setRpm((prev) => {
        const next = prev + 600 * dt; // 10초 동안 0 -> 6000 rpm 가속
        if (next >= RPM_MAX) {
          setRunningUp(false);
          return RPM_MAX;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [runningUp]);

  // 원판 회전 각도 애니메이션 (rpm에 비례)
  useEffect(() => {
    let lastTime = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (rpm > 0) {
        setAngle((prev) => (prev + 2 * Math.PI * f1X * dt) % (2 * Math.PI));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [f1X, rpm]);

  // 진폭 및 위상 곡선 데이터 생성
  const { factorCurve, phaseCurve } = useMemo(() => {
    const factors: number[] = [];
    const phases: number[] = [];
    for (const val of RPM_CURVE) {
      const valR = val / 3000;
      const resp = unbalanceResponseFactor(valR, zeta);
      factors.push(Math.min(resp.factor, 15));
      phases.push(deg(resp.phaseLag));
    }
    return { factorCurve: factors, phaseCurve: phases };
  }, [zeta]);

  // 시간 파형 (현재 주파수 기준 2주기)
  const timePoints = 201;
  const period = f1X > 0 ? 1 / f1X : 0.02;
  const timeAxis = useMemo(
    () => Array.from({ length: timePoints }, (_, i) => ((2 * period) * i) / (timePoints - 1)),
    [period],
  );

  const waveDisp = timeAxis.map((t) => clean(currentAmpMm * Math.cos(omega * t - current.phaseLag)));
  const waveForceNorm = timeAxis.map((t) => clean(currentAmpMm * 0.8 * Math.cos(omega * t)));

  const waveSeries = useMemo<PlotSeries[]>(() => [
    {
      x: timeAxis.map((t) => t * 1000), // ms 단위
      y: waveForceNorm,
      name: '원심력 수평성분 F_x(t) [방향 기준]',
      color: 'var(--plot-2)',
      dash: 'dash',
      width: 1.6,
    },
    {
      x: timeAxis.map((t) => t * 1000),
      y: waveDisp,
      name: `수평 변위 x(t) (진폭 ${formatNumber(currentAmpMm, 3)} mm)`,
      color: 'var(--plot-1)',
      width: 2.2,
    },
  ], [timeAxis, waveForceNorm, waveDisp, currentAmpMm]);

  const bodeAmpSeries = useMemo<PlotSeries[]>(() => [
    {
      x: RPM_CURVE,
      y: factorCurve,
      name: `진폭비 (ζ = ${zeta.toFixed(2)})`,
      color: 'var(--plot-1)',
      width: 2.2,
    },
    {
      x: [0, RPM_MAX],
      y: [1, 1],
      name: '고속 한계 (1.0)',
      color: '#94a3b8',
      dash: 'dash',
      width: 1.2,
    },
    {
      x: [rpm],
      y: [current.responseFactor],
      name: '현재 운전점',
      color: 'var(--plot-2)',
      mode: 'markers',
      markerSize: 10,
    },
  ], [factorCurve, zeta, rpm, current.responseFactor]);

  const bodePhaseSeries = useMemo<PlotSeries[]>(() => [
    {
      x: RPM_CURVE,
      y: phaseCurve,
      name: '위상 지연 φ',
      color: 'var(--plot-1)',
      width: 2.2,
    },
    {
      x: [0, RPM_MAX],
      y: [90, 90],
      name: '90° (임계속도)',
      color: '#94a3b8',
      dash: 'dash',
      width: 1.2,
    },
    {
      x: [rpm],
      y: [currentPhaseDeg],
      name: '현재 운전점',
      color: 'var(--plot-2)',
      mode: 'markers',
      markerSize: 10,
    },
  ], [phaseCurve, rpm, currentPhaseDeg]);

  // 원판 물리 애니메이션 좌표
  const svgCenterEqX = 340;
  const svgCenterY = 90;
  const diskR = 60;
  const animScale = 40; // mm -> px
  const currentInstantX = clean(currentAmpMm * Math.cos(angle - current.phaseLag));
  const diskCenterX = svgCenterEqX + currentInstantX * animScale;
  const massPosRelX = diskR * 0.75 * Math.cos(angle);
  const massPosRelY = diskR * 0.75 * Math.sin(angle);
  const massX = diskCenterX + massPosRelX;
  const massY = svgCenterY + massPosRelY;
  const forceLen = Math.min(65, Math.max(15, current.forceAmplitude * 0.015));
  const forceEndX = massX + forceLen * Math.cos(angle);
  const forceEndY = massY + forceLen * Math.sin(angle);

  const controls = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <ParamSlider
          label="회전수 rpm"
          value={rpm}
          min={0}
          max={RPM_MAX}
          step={50}
          unit="rpm"
          onChange={(val) => {
            setRpm(val);
            setRunningUp(false);
          }}
        />
        <ParamSlider
          label="감쇠비 ζ"
          value={zeta}
          min={0.02}
          max={0.2}
          step={0.01}
          onChange={setZeta}
        />
        <ParamSlider
          label="편심 거리 e_cg (mu*e/M)"
          value={eCgMm}
          min={0.02}
          max={0.25}
          step={0.01}
          unit="mm"
          onChange={setECgMm}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            if (runningUp) {
              setRunningUp(false);
            } else {
              if (rpm >= RPM_MAX - 100) setRpm(0);
              setRunningUp(true);
            }
          }}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '4px',
            border: 'none',
            background: runningUp ? '#ef4444' : '#2563eb',
            color: '#ffffff',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {runningUp ? '런업 중지' : '런업 가속 재생 (0 → 6000 rpm)'}
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setRpm(1500);
              setRunningUp(false);
            }}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: rpm === 1500 ? 'var(--accent-bg, #e0f2fe)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            저속 (1500 rpm, r = 0.5)
          </button>
          <button
            type="button"
            onClick={() => {
              setRpm(3000);
              setRunningUp(false);
            }}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: rpm === 3000 ? 'var(--accent-bg, #e0f2fe)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            임계속도 (3000 rpm, r = 1.0)
          </button>
          <button
            type="button"
            onClick={() => {
              setRpm(5000);
              setRunningUp(false);
            }}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: rpm === 5000 ? 'var(--accent-bg, #e0f2fe)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            초임계 (5000 rpm, r = 1.67)
          </button>
        </div>
      </div>
    </div>
  );

  const readoutsRows: readonly Readout[] = [
    { label: '회전수', value: rpm, unit: 'rpm', sig: 4 },
    { label: '1X 주파수', value: f1X, unit: 'Hz', sig: 3 },
    { label: '진동수비 r (Ω/ω_n)', value: r, unit: '', sig: 3 },
    { label: '원심력 F_u', value: current.forceAmplitude, unit: 'N', sig: 4 },
    { label: '진폭비 (X / e_cg)', value: current.responseFactor, unit: '', sig: 3 },
    { label: '수평 변위 진폭 X', value: currentAmpMm, unit: 'mm', sig: 3 },
    { label: '위상 지연 φ', value: currentPhaseDeg, unit: '°', sig: 3 },
  ];

  const formulas = (
    <Formula
      tex={`\\begin{aligned}
      F_u &= m_u e \\,\\Omega^2 = (${texNumber(me, 3)}) \\cdot (${texNumber(omega, 3)})^2 = ${texNumber(current.forceAmplitude, 3)}\\text{ N} \\\\[2pt]
      \\frac{X}{m_u e / M} &= \\frac{r^2}{\\sqrt{(1-r^2)^2 + (2\\zeta r)^2}} = \\frac{${texNumber(r, 3)}^2}{\\sqrt{(1-${texNumber(r, 3)}^2)^2 + (2 \\cdot ${texNumber(zeta, 2)} \\cdot ${texNumber(r, 3)})^2}} = ${texNumber(current.responseFactor, 3)} \\\\[2pt]
      X &= ${texNumber(eCgMm, 2)}\\text{ mm} \\times ${texNumber(current.responseFactor, 3)} = ${texNumber(currentAmpMm, 3)}\\text{ mm}, \\quad \\varphi = ${texNumber(currentPhaseDeg, 3)}^\\circ
      \\end{aligned}`}
    />
  );

  const tasks: readonly LabTask[] = [
    {
      question:
        '회전수를 1500 rpm에서 3000 rpm으로 2배 올리면 불평형 원심력 F_u는 몇 배가 되나요?',
      answer:
        '원심력 공식은 F_u = m_u e Ω²로 각속도(회전수)의 제곱에 비례합니다. 회전수가 2배가 되면 원심력은 정확히 4배(약 247 N → 약 987 N)로 증가합니다.',
    },
    {
      question:
        '회전수를 3000 rpm(임계속도, r = 1.0)에 맞추어 보세요. 진폭은 편심량 e_cg의 몇 배로 증폭되며 위상 지연은 몇 도인가요?',
      answer:
        'r = 1.0에서는 무차원 진폭비가 1/(2ζ) = 1/(2 × 0.05) = 10배가 되어 편심량 0.1 mm가 1.0 mm로 거대하게 증폭됩니다. 힘과 변위 사이의 위상 지연은 정확히 90°입니다.',
    },
    {
      question:
        '3000 rpm 상태에서 감쇠비 ζ를 0.05에서 0.10으로 올려 보세요. 임계속도에서의 진폭과 Q값은 어떻게 바뀌나요?',
      answer:
        '공진 진폭비는 1/(2ζ)에 비례하므로 감쇠비가 2배가 되면 증폭비는 10배에서 5배로 절반으로 줄어듭니다(진폭 1.0 mm → 0.5 mm). 감쇠가 임계속도 통과 안전성을 결정함을 알 수 있습니다.',
    },
    {
      question:
        '회전수를 5000 rpm 이상(초임계 r ≫ 1)으로 높이면 진폭은 원심력처럼 계속 폭발하나요, 아니면 어떻게 되나요?',
      answer:
        '놀랍게도 진폭은 계속 커지지 않고 편심 거리 e_cg = 0.1 mm(진폭비 1.0)로 일정하게 수렴합니다. 초임계 영역에서는 축이 무게 중심 둘레로 자전하는 자기 조심(Self-centering) 현상이 일어나기 때문입니다.',
    },
  ];

  return (
    <LabFrame
      id="LAB-UNB-01"
      title="불평형 런업과 1X 진동"
      controls={controls}
      readouts={<ReadoutTable rows={readoutsRows} />}
      formulas={formulas}
      tasks={tasks}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {/* 회전 원판 및 편심 질량 물리 애니메이션 도식 */}
        <div
          style={{
            position: 'relative',
            background: 'var(--panel-bg, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '6px',
            padding: '0.5rem',
          }}
        >
          <svg viewBox="0 0 680 180" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <marker id={`${arrowId}-fhead`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ea580c" />
              </marker>
              <marker id={`${arrowId}-xhead`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
              </marker>
            </defs>

            {/* 평형 중심선 및 기준 가이드 */}
            <line x1={svgCenterEqX} y1="20" x2={svgCenterEqX} y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x={svgCenterEqX} y="15" fontSize="11" fill="#94a3b8" textAnchor="middle">베어링 평형 중심</text>

            {/* 회전 로터 원판 */}
            <circle
              cx={diskCenterX}
              cy={svgCenterY}
              r={diskR}
              fill="rgba(59, 130, 246, 0.08)"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />
            {/* 회전 중심 O 점 */}
            <circle cx={diskCenterX} cy={svgCenterY} r="4" fill="#1e40af" />
            <text x={diskCenterX} y={svgCenterY - 10} fontSize="11" fontWeight="bold" fill="#1e40af" textAnchor="middle">
              축 중심 O
            </text>

            {/* 편심 반경 선 */}
            <line
              x1={diskCenterX}
              y1={svgCenterY}
              x2={massX}
              y2={massY}
              stroke="#f97316"
              strokeWidth="2"
            />

            {/* 불평형 질량 점 mu */}
            <circle cx={massX} cy={massY} r="6" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
            <text x={massX} y={massY + (massPosRelY >= 0 ? 16 : -10)} fontSize="11" fontWeight="bold" fill="#ea580c" textAnchor="middle">
              m_u
            </text>

            {/* 원심력 화살표 Fu */}
            {rpm > 100 && (
              <line
                x1={massX}
                y1={massY}
                x2={forceEndX}
                y2={forceEndY}
                stroke="#ea580c"
                strokeWidth="2.8"
                markerEnd={`url(#${arrowId}-fhead)`}
              />
            )}

            {/* 수평 진동 변위 표시 */}
            <line x1="240" y1="160" x2="440" y2="160" stroke="#94a3b8" strokeWidth="1" />
            {Math.abs(currentInstantX) > 0.002 && (
              <line
                x1={svgCenterEqX}
                y1="160"
                x2={diskCenterX}
                y2="160"
                stroke="#2563eb"
                strokeWidth="3"
                markerEnd={`url(#${arrowId}-xhead)`}
              />
            )}
            <text x={diskCenterX} y="175" fontSize="11" fontWeight="bold" fill="#2563eb" textAnchor="middle">
              수평 변위 x = {currentInstantX >= 0 ? `+${currentInstantX.toFixed(2)}` : currentInstantX.toFixed(2)} mm
            </text>

            {/* 좌측 안내 박스 */}
            <rect x="25" y="30" width="160" height="90" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <text x="35" y="50" fontSize="11" fill="#475569">회전수: <strong>{rpm} rpm</strong></text>
            <text x="35" y="70" fontSize="11" fill="#475569">1X 주파수: <strong>{f1X.toFixed(1)} Hz</strong></text>
            <text x="35" y="90" fontSize="11" fill="#475569">진동수비 r: <strong>{r.toFixed(2)}</strong></text>
            <text x="35" y="110" fontSize="11" fill={r >= 0.95 && r <= 1.05 ? '#ef4444' : '#64748b'}>
              상태: <strong>{r >= 0.95 && r <= 1.05 ? '공진 (임계속도!)' : r < 1 ? '아임계 운전' : '초임계 운전'}</strong>
            </text>
          </svg>
        </div>

        {/* 2단 플롯: 왼쪽 Bode 선도 / 오른쪽 시간파형 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Bode 선도 (회전수별 무차원 진폭비)</h4>
            <Plot
              series={bodeAmpSeries}
              x={{ label: '회전수 [rpm]', range: [0, RPM_MAX] }}
              y={{ label: '진폭비 X / (m_u e / M)', range: [0, Math.min(Math.max(peak?.responseFactor ?? 10, 10) * 1.15, 14)] }}
              height={200}
            />
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>정상상태 1X 시간파형 (2주기)</h4>
            <Plot
              series={waveSeries}
              x={{ label: '시간 t [ms]', range: [0, 2 * period * 1000] }}
              y={{ label: '변위 [mm]', range: [-Math.max(0.15, currentAmpMm * 1.2), Math.max(0.15, currentAmpMm * 1.2)] }}
              height={200}
            />
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>위상 지연 곡선 φ (회전수 증가에 따라 0° → 90° → 180°)</h4>
          <Plot
            series={bodePhaseSeries}
            x={{ label: '회전수 [rpm]', range: [0, RPM_MAX] }}
            y={{ label: '위상 지연 [°]', range: [0, 190] }}
            height={160}
          />
        </div>
      </div>
    </LabFrame>
  );
}
