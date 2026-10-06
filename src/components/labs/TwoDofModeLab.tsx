import { useEffect, useId, useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame, { type LabTask } from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { symmetricTwoDofModes, twoDofFreeResponse, twoDofFreeResponseAt } from '../../lib/mck';

const M = 1; // 1 kg
const K = 1000; // 1000 N/m
const DURATION = 3.5;
const POINTS = 801;

type InitialConditionKey = 'mode1' | 'mode2' | 'mass1_only' | 'arbitrary';

const INITIAL_OPTIONS = [
  { value: 'mode1' as const, label: '모드 1: 동상 [10, 10] mm' },
  { value: 'mode2' as const, label: '모드 2: 역상 [10, −10] mm' },
  { value: 'mass1_only' as const, label: '왼쪽만 당김 [10, 0] mm (중첩/맥놀이)' },
  { value: 'arbitrary' as const, label: '비대칭 임의 [10, 4] mm' },
];

function clean(value: number): number {
  return Math.abs(value) < 1e-12 ? 0 : value;
}

function springPath(x1: number, x2: number, y: number, coils = 7, height = 16): string {
  const lead = 14;
  const span = Math.max(1, x2 - x1 - 2 * lead);
  const points: Array<[number, number]> = [[x1, y], [x1 + lead, y]];
  for (let i = 0; i < coils * 2; i++) {
    points.push([x1 + lead + ((i + 0.5) / (coils * 2)) * span, y + (i % 2 === 0 ? -height : height)]);
  }
  points.push([x2 - lead, y], [x2, y]);
  return points.map(([x, py], i) => `${i === 0 ? 'M' : 'L'} ${x} ${py}`).join(' ');
}

export default function TwoDofModeLab() {
  const arrowId = useId().replace(/:/g, '');
  const [kc, setKc] = useState(1000);
  const [initKey, setInitKey] = useState<InitialConditionKey>('mass1_only');
  const [showDecomp, setShowDecomp] = useState(false);
  const [slowMo, setSlowMo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const initialDisplacements = useMemo(() => {
    switch (initKey) {
      case 'mode1':
        return { x1: 0.01, x2: 0.01 };
      case 'mode2':
        return { x1: 0.01, x2: -0.01 };
      case 'mass1_only':
        return { x1: 0.01, x2: 0 };
      case 'arbitrary':
        return { x1: 0.01, x2: 0.004 };
    }
  }, [initKey]);

  const system = useMemo(
    () => ({
      mass1: M,
      mass2: M,
      stiffnessLeft: K,
      stiffnessCoupling: kc,
      stiffnessRight: K,
    }),
    [kc],
  );

  const [mode1, mode2] = useMemo(() => symmetricTwoDofModes(M, K, kc), [kc]);
  const f1 = mode1.frequencyHz;
  const f2 = mode2.frequencyHz;
  const ratio = f2 / f1;
  const deltaF = Math.abs(f2 - f1);
  const beatPeriod = deltaF > 1e-4 ? 1 / deltaF : 0;

  // 모드 좌표 초기값: x1 = q1 + q2, x2 = q1 - q2  => q1 = (x1 + x2)/2, q2 = (x1 - x2)/2
  const q1_0_mm = ((initialDisplacements.x1 + initialDisplacements.x2) / 2) * 1000;
  const q2_0_mm = ((initialDisplacements.x1 - initialDisplacements.x2) / 2) * 1000;

  // 애니메이션 제어
  const speedFactor = slowMo ? 0.35 : 1.0;
  useEffect(() => {
    if (!playing) return;
    let lastNow = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = ((now - lastNow) / 1000) * speedFactor;
      lastNow = now;
      setElapsed((prev) => {
        const next = prev + dt;
        if (next >= DURATION) {
          setPlaying(false);
          return DURATION;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speedFactor]);

  // 시간 파형 데이터 생성
  const timeline = useMemo(() => Array.from({ length: POINTS }, (_, i) => (DURATION * i) / (POINTS - 1)), []);
  const response = useMemo(
    () => twoDofFreeResponse(system, initialDisplacements, timeline),
    [system, initialDisplacements, timeline],
  );

  // 현재 시점 상태
  const current = useMemo(
    () => twoDofFreeResponseAt(system, initialDisplacements, elapsed),
    [system, initialDisplacements, elapsed],
  );

  const currentX1Mm = clean(current.x1 * 1000);
  const currentX2Mm = clean(current.x2 * 1000);

  // 플롯 시리즈
  const plotSeries = useMemo<PlotSeries[]>(() => {
    const s: PlotSeries[] = [
      {
        x: timeline,
        y: response.map((r) => clean(r.x1 * 1000)),
        name: '질량 1 변위 x₁(t)',
        color: 'var(--plot-1)',
        width: 2.2,
      },
      {
        x: timeline,
        y: response.map((r) => clean(r.x2 * 1000)),
        name: '질량 2 변위 x₂(t)',
        color: 'var(--plot-2)',
        width: 2.0,
      },
    ];

    if (showDecomp) {
      s.push({
        x: timeline,
        y: response.map((r) => clean(r.mode1[0] * 1000)),
        name: `x₁ 모드 1 성분 (${formatNumber(f1, 3)} Hz)`,
        color: 'var(--plot-3)',
        width: 1.5,
        dash: 'dash',
      });
      s.push({
        x: timeline,
        y: response.map((r) => clean(r.mode2[0] * 1000)),
        name: `x₁ 모드 2 성분 (${formatNumber(f2, 3)} Hz)`,
        color: 'var(--plot-4)',
        width: 1.5,
        dash: 'dash',
      });
    }

    // 현재 재생 위치 마커
    s.push({
      x: [elapsed, elapsed],
      y: [-15, 15],
      name: '현재 시점 t',
      color: 'rgba(239, 68, 68, 0.65)',
      width: 1.5,
      dash: 'dot',
    });

    return s;
  }, [timeline, response, showDecomp, f1, f2, elapsed]);

  // 도식 좌표 계산 (SVG 680x160)
  const leftWallX = 35;
  const rightWallX = 645;
  const eqX1 = 220; // 질량 1 평형 위치
  const eqX2 = 460; // 질량 2 평형 위치
  const animScale = 3.5; // mm -> px
  const m1X = eqX1 + currentX1Mm * animScale;
  const m2X = eqX2 + currentX2Mm * animScale;
  const blockW = 60;
  const blockH = 50;
  const blockY = 55;

  const handleReset = () => {
    setPlaying(false);
    setElapsed(0);
  };

  const handlePlayToggle = () => {
    if (elapsed >= DURATION) {
      setElapsed(0);
    }
    setPlaying(!playing);
  };

  const controls = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <ParamSlider
          label="가운데 연성 스프링 강성 kc"
          value={kc}
          min={50}
          max={2000}
          step={25}
          unit="N/m"
          onChange={(val) => {
            setKc(val);
            handleReset();
          }}
        />
        <ParamSelect
          label="초기 변위 [x₁(0), x₂(0)]"
          value={initKey}
          options={INITIAL_OPTIONS}
          onChange={(val) => {
            setInitKey(val);
            handleReset();
          }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <ParamToggle
          label="질량 1 모드 성분 분해 표시"
          checked={showDecomp}
          onChange={setShowDecomp}
        />
        <ParamToggle
          label="슬로우 모션 (0.35x)"
          checked={slowMo}
          onChange={setSlowMo}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setKc(100);
              setInitKey('mass1_only');
              handleReset();
            }}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: kc === 100 ? 'var(--accent-bg, #e0f2fe)' : 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            약한 결합 (kc = 0.1k, 맥놀이)
          </button>
          <button
            type="button"
            onClick={() => {
              setKc(1000);
              handleReset();
            }}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: kc === 1000 ? 'var(--accent-bg, #e0f2fe)' : 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            표준 결합 (kc = k)
          </button>
        </div>
      </div>
    </div>
  );

  const readoutsRows: readonly Readout[] = [
    { label: '1차 고유진동수 f₁', value: f1, unit: 'Hz', sig: 3 },
    { label: '2차 고유진동수 f₂', value: f2, unit: 'Hz', sig: 3 },
    { label: '진동수 비 f₂ / f₁', value: ratio, unit: '', sig: 3 },
    { label: '모드 1 형상 비 x₂ / x₁', value: clean(mode1.shape[1] / mode1.shape[0]), unit: '', sig: 3 },
    { label: '모드 2 형상 비 x₂ / x₁', value: clean(mode2.shape[1] / mode2.shape[0]), unit: '', sig: 3 },
    { label: '처음 변위 중 모드 1 몫', value: q1_0_mm, unit: 'mm', sig: 3 },
    { label: '처음 변위 중 모드 2 몫', value: q2_0_mm, unit: 'mm', sig: 3 },
    { label: '맥놀이 주기 1 / (f₂ − f₁)', value: beatPeriod, unit: 's', sig: 3 },
  ];

  const formulas = (
    <Formula
      tex={`\\begin{aligned}
      \\omega_1 &= \\sqrt{\\frac{k}{m}} = \\sqrt{\\frac{1000}{1}} = ${texNumber(mode1.omega, 3)}\\text{ rad/s} \\implies f_1 = ${texNumber(f1, 3)}\\text{ Hz} \\\\[2pt]
      \\omega_2 &= \\sqrt{\\frac{k + 2k_c}{m}} = \\sqrt{\\frac{1000 + 2(${kc})}{1}} = ${texNumber(mode2.omega, 3)}\\text{ rad/s} \\implies f_2 = ${texNumber(f2, 3)}\\text{ Hz} \\\\[2pt]
      x_1(t) &= ${texNumber(q1_0_mm, 2)} \\cos(\\omega_1 t) + (${texNumber(q2_0_mm, 2)}) \\cos(\\omega_2 t) \\quad [\\text{mm}] \\\\[2pt]
      x_2(t) &= ${texNumber(q1_0_mm, 2)} \\cos(\\omega_1 t) - (${texNumber(q2_0_mm, 2)}) \\cos(\\omega_2 t) \\quad [\\text{mm}]
      \\end{aligned}`}
    />
  );

  const tasks: readonly LabTask[] = [
    {
      question:
        '초기 조건을 "모드 1: 동상 [10, 10] mm"으로 두고 재생해 보세요. 두 질량의 변위 파형이 완전히 포개지며, 주파수는 f₁ 하나뿐인가요? 가운데 스프링의 길이는 어떻게 되나요?',
      answer:
        '두 질량이 같은 방향으로 정확히 같이 움직이므로 x₁(t) = x₂(t)가 되어 두 파형이 완전히 포개집니다. 두 질량 사이의 상대 거리가 일정하므로 가운데 스프링은 늘어나지도 줄어들지도 않습니다.',
    },
    {
      question:
        '초기 조건을 "모드 2: 역상 [10, −10] mm"으로 바꾸어 보세요. 두 질량이 서로 반대로 마주보며 움직이고 주파수가 f₂로 높아집니다. kc = 1000 N/m일 때 f₂/f₁ 비율은 얼마인가요?',
      answer:
        '두 질량이 반대 위상으로 마주보며 움직이므로 가운데 스프링이 2배로 강하게 압축/인장되어 유효 강성이 k + 2kc가 됩니다. kc = k일 때 f₂/f₁ 비율은 정확히 √3 ≈ 1.732배입니다.',
    },
    {
      question:
        '초기 조건을 "왼쪽만 당김 [10, 0] mm"으로 두고, "질량 1 모드 성분 분해 표시"를 켜보세요. 질량 1의 울렁거리는 복잡한 파형은 모드 1과 모드 2 성분으로 어떻게 분해되나요?',
      answer:
        '초기 변위 [10, 0] mm는 모드 1 성분 5 mm와 모드 2 성분 5 mm의 정확한 1:1 합입니다. 따라서 x₁(t)는 5.03 Hz 정현파와 8.72 Hz 정현파가 더해져 울렁거리는 모양을 만듭니다.',
    },
    {
      question:
        '약한 결합 (kc = 0.1k) 버튼을 누르고 "왼쪽만 당김" 상태로 재생해 보세요. 에너지가 질량 1에서 질량 2로 갔다가 다시 돌아오는 맥놀이 주기는 얼마인가요?',
      answer:
        'kc = 100 N/m일 때 f₁ ≈ 5.033 Hz, f₂ ≈ 5.513 Hz로 주파수 차이가 0.480 Hz에 불과합니다. 따라서 에너지가 두 질량 사이를 오가는 맥놀이 주기는 T_beat = 1/Δf ≈ 2.08초입니다.',
    },
  ];

  return (
    <LabFrame
      id="LAB-2DOF-01"
      title="2자유도 모드와 에너지 교환"
      controls={controls}
      readouts={<ReadoutTable rows={readoutsRows} />}
      formulas={formulas}
      tasks={tasks}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {/* 두 질량 물리 애니메이션 도식 */}
        <div
          style={{
            position: 'relative',
            background: 'var(--panel-bg, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '6px',
            padding: '0.5rem',
          }}
        >
          <svg viewBox="0 0 680 160" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <pattern id="hatch-wall" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#94a3b8" strokeWidth="2" />
              </pattern>
              <marker id={`${arrowId}-head`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
              </marker>
              <marker id={`${arrowId}-head2`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f97316" />
              </marker>
            </defs>

            {/* 좌우 고정벽 */}
            <rect x="15" y="25" width="20" height="110" fill="url(#hatch-wall)" stroke="#64748b" strokeWidth="1.5" />
            <line x1={leftWallX} y1="25" x2={leftWallX} y2="135" stroke="#475569" strokeWidth="2.5" />

            <rect x={rightWallX} y="25" width="20" height="110" fill="url(#hatch-wall)" stroke="#64748b" strokeWidth="1.5" />
            <line x1={rightWallX} y1="25" x2={rightWallX} y2="135" stroke="#475569" strokeWidth="2.5" />

            {/* 평형 위치 점선 */}
            <line x1={eqX1} y1="35" x2={eqX1} y2="125" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={eqX2} y1="35" x2={eqX2} y2="125" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />

            {/* 스프링 1 (벽 ~ m1) */}
            <path d={springPath(leftWallX, m1X - blockW / 2, 80, 6, 14)} fill="none" stroke="#64748b" strokeWidth="2.2" />
            <text x={(leftWallX + eqX1 - blockW / 2) / 2} y="55" fontSize="11" fill="#64748b" textAnchor="middle">k</text>

            {/* 스프링 2 (연성 kc: m1 ~ m2) */}
            <path d={springPath(m1X + blockW / 2, m2X - blockW / 2, 80, 7, 14)} fill="none" stroke="#e11d48" strokeWidth="2.5" />
            <text x={(eqX1 + eqX2) / 2} y="55" fontSize="11" fill="#e11d48" fontWeight="bold" textAnchor="middle">
              kc = {kc} N/m
            </text>

            {/* 스프링 3 (m2 ~ 벽) */}
            <path d={springPath(m2X + blockW / 2, rightWallX, 80, 6, 14)} fill="none" stroke="#64748b" strokeWidth="2.2" />
            <text x={(eqX2 + blockW / 2 + rightWallX) / 2} y="55" fontSize="11" fill="#64748b" textAnchor="middle">k</text>

            {/* 질량 1 블록 */}
            <rect
              x={m1X - blockW / 2}
              y={blockY}
              width={blockW}
              height={blockH}
              rx="5"
              fill="#dbeafe"
              stroke="#2563eb"
              strokeWidth="2.5"
            />
            <text x={m1X} y={blockY + 28} fontSize="14" fontWeight="bold" fill="#1e40af" textAnchor="middle">
              m₁ (1kg)
            </text>
            <text x={m1X} y={blockY + 44} fontSize="11" fill="#2563eb" textAnchor="middle">
              {currentX1Mm >= 0 ? `+${currentX1Mm.toFixed(1)}` : currentX1Mm.toFixed(1)} mm
            </text>

            {/* 질량 2 블록 */}
            <rect
              x={m2X - blockW / 2}
              y={blockY}
              width={blockW}
              height={blockH}
              rx="5"
              fill="#ffedd5"
              stroke="#ea580c"
              strokeWidth="2.5"
            />
            <text x={m2X} y={blockY + 28} fontSize="14" fontWeight="bold" fill="#9a3412" textAnchor="middle">
              m₂ (1kg)
            </text>
            <text x={m2X} y={blockY + 44} fontSize="11" fill="#ea580c" textAnchor="middle">
              {currentX2Mm >= 0 ? `+${currentX2Mm.toFixed(1)}` : currentX2Mm.toFixed(1)} mm
            </text>

            {/* 변위 상태 표시 화살표 */}
            {Math.abs(currentX1Mm) > 0.5 && (
              <line
                x1={eqX1}
                y1="32"
                x2={m1X}
                y2="32"
                stroke="#2563eb"
                strokeWidth="2"
                markerEnd={`url(#${arrowId}-head)`}
              />
            )}
            {Math.abs(currentX2Mm) > 0.5 && (
              <line
                x1={eqX2}
                y1="32"
                x2={m2X}
                y2="32"
                stroke="#ea580c"
                strokeWidth="2"
                markerEnd={`url(#${arrowId}-head2)`}
              />
            )}

            {/* 바닥 가이드 */}
            <line x1="30" y1="135" x2="650" y2="135" stroke="#cbd5e1" strokeWidth="1" />
          </svg>

          {/* 재생 컨트롤 바 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', padding: '0 0.5rem' }}>
            <button
              type="button"
              onClick={handlePlayToggle}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '4px',
                border: 'none',
                background: playing ? '#f59e0b' : '#2563eb',
                color: '#ffffff',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {playing ? '일시정지' : elapsed >= DURATION ? '다시 재생' : '재생'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              처음으로 (t=0)
            </button>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
              진행 시간: <strong>{elapsed.toFixed(2)}</strong> s / {DURATION.toFixed(1)} s
            </span>
          </div>
        </div>

        {/* 변위 시간 파형 플롯 */}
        <Plot
          series={plotSeries}
          x={{ label: '시간 t [s]', range: [0, DURATION] }}
          y={{ label: '변위 [mm]', range: [-13, 13] }}
          height={220}
        />
      </div>
    </LabFrame>
  );
}
