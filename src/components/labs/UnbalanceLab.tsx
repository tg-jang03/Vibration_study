import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame, { type LabTask } from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { unbalancePeak, unbalanceResponseFactor, unbalanceSteadyState } from '../../lib/mck';

const TOTAL_MASS = 100; // 100 kg
const RPM_MAX = 6000;
const RPM_POINTS = 301;
const RPM_CURVE = Array.from({ length: RPM_POINTS }, (_, i) => (RPM_MAX * i) / (RPM_POINTS - 1));
/** 런업 재생 속도: 1초에 600 rpm (0 → 6000 rpm에 10초) */
const RUNUP_RATE = 600;
/** 화면의 원판은 실제보다 이만큼 느리게 돈다 (3000 rpm = 1초에 한 바퀴). 실제 속도로 그리면 60 fps 화면에서 거꾸로 돌거나 멈춘 것처럼 보인다 */
const SLOW_FACTOR = 50;
/** 원심력 화살표 길이 [px]: 6000 rpm, e_cg 0.1 mm일 때 64 px. 회전수 제곱·불평형에 비례 */
const FORCE_PX_AT_MAX = 64;

function clean(value: number): number {
  return Math.abs(value) < 1e-12 ? 0 : value;
}

const deg = (rad: number) => (rad * 180) / Math.PI;

const buttonStyle = (active: boolean) => ({
  fontSize: '0.82rem',
  padding: '0.35rem 0.65rem',
  borderRadius: '4px',
  border: '1px solid #cbd5e1',
  background: active ? 'var(--accent-bg, #e0f2fe)' : 'transparent',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
});

export default function UnbalanceLab() {
  const arrowId = useId().replace(/:/g, '');
  const [rpm, setRpm] = useState(1500);
  const [nnRpm, setNnRpm] = useState(3000); // 고유 회전수 N_n (임계속도)
  const [zeta, setZeta] = useState(0.05);
  const [eCgMm, setECgMm] = useState(0.1); // 편심 거리 m_u e / M [mm]
  const [runningUp, setRunningUp] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0); // 화면 표시용 회전 각도 (첫 렌더는 0)

  const rpmRef = useRef(rpm);
  rpmRef.current = rpm;
  const runningRef = useRef(runningUp);
  runningRef.current = runningUp;

  const me = (eCgMm / 1000) * TOTAL_MASS; // kg*m
  const omegaN = (2 * Math.PI * nnRpm) / 60;
  const f1X = rpm / 60;
  const omega = 2 * Math.PI * f1X;
  const r = omega / omegaN;

  const current = useMemo(
    () => unbalanceSteadyState(TOTAL_MASS, me, omega, omegaN, zeta),
    [me, omega, omegaN, zeta],
  );

  const currentAmpMm = current.displacementAmplitude * 1000;
  const currentPhaseDeg = deg(current.phaseLag);
  const peak = useMemo(() => unbalancePeak(zeta), [zeta]);

  // 재생 루프: 사용자가 런업이나 원판 돌리기를 눌렀을 때만 돈다 (첫 렌더에는 시간 값을 쓰지 않는다)
  const animating = runningUp || spinning;
  useEffect(() => {
    if (!animating) return;
    let lastTime = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      if (runningRef.current) {
        const next = Math.min(RPM_MAX, rpmRef.current + RUNUP_RATE * dt);
        rpmRef.current = next;
        setRpm(next);
        if (next >= RPM_MAX) setRunningUp(false);
      }
      const displayRevPerSec = rpmRef.current / 60 / SLOW_FACTOR;
      setAngle((prev) => (prev + 2 * Math.PI * displayRevPerSec * dt) % (2 * Math.PI));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animating]);

  // 진폭 및 위상 곡선 데이터
  const { factorCurve, phaseCurve } = useMemo(() => {
    const factors: number[] = [];
    const phases: number[] = [];
    for (const val of RPM_CURVE) {
      const resp = unbalanceResponseFactor(val / nnRpm, zeta);
      factors.push(Math.min(resp.factor, 15));
      phases.push(deg(resp.phaseLag));
    }
    return { factorCurve: factors, phaseCurve: phases };
  }, [zeta, nnRpm]);

  // 시간 파형 (현재 주파수 기준 2주기)
  const timePoints = 201;
  const period = f1X > 0 ? 1 / f1X : 0.02;
  const timeAxis = useMemo(
    () => Array.from({ length: timePoints }, (_, i) => (2 * period * i) / (timePoints - 1)),
    [period],
  );

  const waveSeries = useMemo<PlotSeries[]>(() => {
    const tMs = timeAxis.map((t) => t * 1000);
    return [
      {
        x: tMs,
        y: timeAxis.map((t) => clean(currentAmpMm * 0.8 * Math.cos(omega * t))),
        name: '원심력 수평 성분 F_x(t) (크기는 임의, 박자 비교용)',
        color: 'var(--plot-2)',
        dash: 'dash',
        width: 1.6,
      },
      {
        x: tMs,
        y: timeAxis.map((t) => clean(currentAmpMm * Math.cos(omega * t - current.phaseLag))),
        name: `수평 변위 x(t) (진폭 ${formatNumber(currentAmpMm, 3)} mm)`,
        color: 'var(--plot-1)',
        width: 2.2,
      },
    ];
  }, [timeAxis, currentAmpMm, omega, current.phaseLag]);

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

  // 원판 물리 애니메이션 좌표 (SVG 680 × 230)
  const svgCenterEqX = 360;
  const svgCenterY = 115;
  const diskR = 50;
  const animScale = 40; // mm -> px
  const currentInstantX = clean(currentAmpMm * Math.cos(angle - current.phaseLag));
  const diskOffset = Math.max(-150, Math.min(150, currentInstantX * animScale));
  const diskCenterX = svgCenterEqX + diskOffset;
  // 화면 좌표는 y가 아래로 커지므로 sin에 −를 붙여 반시계(수학 방향)로 돌게 한다
  const massPosRelX = diskR * 0.7 * Math.cos(angle);
  const massPosRelY = -diskR * 0.7 * Math.sin(angle);
  const massX = diskCenterX + massPosRelX;
  const massY = svgCenterY + massPosRelY;
  const forceLen = Math.min(75, FORCE_PX_AT_MAX * (rpm / RPM_MAX) ** 2 * (eCgMm / 0.1));
  const forceEndX = massX + forceLen * Math.cos(angle);
  const forceEndY = massY - forceLen * Math.sin(angle);
  const rpmShown = Math.round(rpm);
  const nearCritical = r >= 0.95 && r <= 1.05;

  const presets = [
    { r: 0.5, label: '저속 (r = 0.5)' },
    { r: 1, label: '임계속도 (r = 1)' },
    { r: 2, label: '초임계 (r = 2)' },
  ];

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
          format={(v) => String(Math.round(v))}
          onChange={(val) => {
            setRpm(val);
            setRunningUp(false);
          }}
        />
        <ParamSlider
          label="고유 회전수 N_n (임계속도)"
          value={nnRpm}
          min={1500}
          max={3000}
          step={100}
          unit="rpm"
          onChange={setNnRpm}
        />
        <ParamSlider
          label="감쇠비 ζ"
          value={zeta}
          min={0.02}
          max={0.3}
          step={0.01}
          onChange={setZeta}
        />
        <ParamSlider
          label="편심 거리 e_cg (= m_u e / M)"
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
              rpmRef.current = 0;
              setRpm(0);
              setSpinning(true);
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
            whiteSpace: 'nowrap',
          }}
        >
          {runningUp ? '런업 중지' : '런업 가속 재생 (0 → 6000 rpm)'}
        </button>
        <button type="button" onClick={() => setSpinning(!spinning)} style={buttonStyle(spinning)}>
          {spinning ? '원판 멈추기' : '원판 돌리기'}
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setRpm(p.r * nnRpm);
                setRunningUp(false);
              }}
              style={buttonStyle(!runningUp && Math.abs(rpm - p.r * nnRpm) < 1)}
            >
              {p.label}
            </button>
          ))}
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
      r &= \\frac{N}{N_n} = \\frac{${rpmShown}}{${nnRpm}} = ${texNumber(r, 3)} \\\\[2pt]
      \\frac{X}{m_u e / M} &= \\frac{r^2}{\\sqrt{(1-r^2)^2 + (2\\zeta r)^2}} = \\frac{${texNumber(r, 3)}^2}{\\sqrt{(1-${texNumber(r, 3)}^2)^2 + (2 \\cdot ${texNumber(zeta, 2)} \\cdot ${texNumber(r, 3)})^2}} = ${texNumber(current.responseFactor, 3)} \\\\[2pt]
      X &= ${texNumber(eCgMm, 2)}\\text{ mm} \\times ${texNumber(current.responseFactor, 3)} = ${texNumber(currentAmpMm, 3)}\\text{ mm}, \\quad \\varphi = ${texNumber(currentPhaseDeg, 3)}^\\circ
      \\end{aligned}`}
    />
  );

  const tasks: readonly LabTask[] = [
    {
      question:
        '회전수를 1500 rpm에서 3000 rpm으로 2배 올리면 불평형 원심력 F_u는 몇 배가 되나요? 원심력 화살표의 길이는요?',
      answer:
        '원심력은 F_u = m_u e Ω²로 각속도(회전수)의 제곱에 비례합니다. 회전수가 2배가 되면 원심력은 4배(약 247 N → 약 987 N)가 되고, 화살표 길이도 4배가 됩니다.',
    },
    {
      question:
        '임계속도 (r = 1) 버튼을 눌러 3000 rpm에 맞추어 보세요. 진폭은 편심 거리 e_cg의 몇 배이며 위상 지연은 몇 도인가요?',
      answer:
        'r = 1에서는 진폭비가 1/(2ζ) = 1/(2 × 0.05) = 10이 되어, 편심 거리 0.1 mm의 10배인 1.0 mm가 됩니다. 힘과 변위 사이의 위상 지연은 90°입니다.',
    },
    {
      question:
        '3000 rpm 상태에서 감쇠비 ζ를 0.05에서 0.10으로 올려 보세요. 임계속도에서의 진폭과 Q값은 어떻게 바뀌나요?',
      answer:
        'r = 1의 진폭비는 1/(2ζ)이므로 감쇠비가 2배가 되면 10에서 5로 절반이 됩니다(진폭 1.0 mm → 0.5 mm). Q ≈ 1/(2ζ)도 10에서 5로 줄어듭니다. 감쇠가 클수록 임계속도를 지날 때의 진폭이 작습니다.',
    },
    {
      question:
        '초임계 (r = 2) 버튼을 눌러 6000 rpm으로 올려 보세요. 진폭은 원심력처럼 계속 커지나요?',
      answer:
        '아닙니다. 6000 rpm의 원심력은 3000 rpm의 4배(약 3948 N)이지만 진폭은 0.133 mm(진폭비 1.33), 위상은 176°입니다. 회전수를 더 올리면 진폭은 편심 거리 e_cg = 0.1 mm(진폭비 1)에, 위상은 180°에 다가갑니다. 축 중심이 무거운 점의 반대쪽으로 밀려 전체 질량 중심이 베어링 중심에 머물기 때문입니다(질량 중심 회전).',
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
          <svg viewBox="0 0 680 230" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <marker id={`${arrowId}-fhead`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ea580c" />
              </marker>
              <marker id={`${arrowId}-xhead`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
              </marker>
            </defs>

            {/* 평형 중심선 */}
            <line x1={svgCenterEqX} y1="22" x2={svgCenterEqX} y2="195" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
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
            <circle cx={diskCenterX} cy={svgCenterY} r="4" fill="#1e40af" />
            {/* 글자는 불평형 질량의 반대쪽에 둔다 (겹침 방지) */}
            <text x={diskCenterX + (massX >= diskCenterX ? -8 : 8)} y={svgCenterY + 4} fontSize="11" fontWeight="bold" fill="#1e40af" textAnchor={massX >= diskCenterX ? 'end' : 'start'}>
              축 중심 O
            </text>

            {/* 편심 반경 선과 불평형 질량 */}
            <line x1={diskCenterX} y1={svgCenterY} x2={massX} y2={massY} stroke="#f97316" strokeWidth="2" />
            <circle cx={massX} cy={massY} r="6" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
            <text x={massX} y={massY + (massPosRelY >= 0 ? 18 : -10)} fontSize="11" fontWeight="bold" fill="#ea580c" textAnchor="middle">
              m_u
            </text>

            {/* 원심력 화살표 Fu (길이 ∝ 회전수² × 불평형) */}
            {forceLen > 1 && (
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
            <line x1="250" y1="200" x2="470" y2="200" stroke="#94a3b8" strokeWidth="1" />
            {Math.abs(diskOffset) > 0.5 && (
              <line
                x1={svgCenterEqX}
                y1="200"
                x2={diskCenterX}
                y2="200"
                stroke="#2563eb"
                strokeWidth="3"
                markerEnd={`url(#${arrowId}-xhead)`}
              />
            )}
            <text x={svgCenterEqX} y="220" fontSize="11" fontWeight="bold" fill="#2563eb" textAnchor="middle">
              수평 변위 x = {currentInstantX >= 0 ? `+${currentInstantX.toFixed(3)}` : currentInstantX.toFixed(3)} mm
            </text>

            {/* 좌측 안내 상자 */}
            <rect x="20" y="30" width="190" height="100" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <text x="30" y="52" fontSize="11" fill="#475569">
              회전수: <tspan fontWeight="bold">{rpmShown} rpm</tspan>
            </text>
            <text x="30" y="74" fontSize="11" fill="#475569">
              1X 주파수: <tspan fontWeight="bold">{f1X.toFixed(1)} Hz</tspan>
            </text>
            <text x="30" y="96" fontSize="11" fill="#475569">
              진동수비 r: <tspan fontWeight="bold">{r.toFixed(2)}</tspan>
            </text>
            <text x="30" y="118" fontSize="11" fill={nearCritical ? '#ef4444' : '#475569'}>
              상태: <tspan fontWeight="bold">{nearCritical ? '임계속도 근처 (공진)' : r < 1 ? '아임계 운전' : '초임계 운전'}</tspan>
            </text>
            <text x="20" y="150" fontSize="10" fill="#94a3b8">
              화면의 원판은 실제보다 {SLOW_FACTOR}배 느리게 돈다
            </text>
          </svg>
        </div>

        {/* 2단 플롯: 왼쪽 진폭 곡선 / 오른쪽 시간파형 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Bode 선도: 회전수별 무차원 진폭비</h4>
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
