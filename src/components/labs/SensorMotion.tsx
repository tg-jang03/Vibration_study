import { useMemo, useRef, useState } from 'react';
import { formatNumber } from '../../lib/format';
import { seismicMotion } from '../../lib/sensor';
import { usePlayClock } from '../ui/hooks';
import PlayControls, { turnSpeeds } from '../ui/PlayControls';

/**
 * LAB-SNS-01의 움직이는 그림 (D-044): 바닥과 함께 흔들리는 센서 케이스와 그 안의 질량-스프링.
 * 바닥 y = Y cos ωt, 질량 x = y + z (lib/sensor.ts의 seismicMotion). r = f/f_n이 아래·근처·위일 때 질량이 어떻게 움직이는지.
 * 화면 크기는 케이스·질량이 상자 안에 들어가게 맞춘다(바닥 움직임은 r마다 다른 축척).
 */

type View = 'test' | 'low' | 'res' | 'high';
const VIEW_R: Record<Exclude<View, 'test'>, number> = { low: 0.2, res: 1, high: 5 };

const W = 720;
const H = 262;
const CX = 150; // 케이스 가운데
const FLOOR = 214; // 바닥판 윗면(제자리)
const CASE_H = 168;
const MASS_W = 74;
const MASS_H = 40;
const M0 = FLOOR - 104; // 질량 가운데(제자리)
const X0 = 330;
const X1 = W - 14;
const T1 = 82; // 위 띠의 0
const T2 = 202; // 아래 띠의 0
const TK = 46;
const N = 240;
const TWO_PI = 2 * Math.PI;

function spring(x: number, yBottom: number, yTop: number, coils = 7, half = 16): string {
  const lead = 6;
  const span = yBottom - yTop - 2 * lead;
  const pts: string[] = [`M${x},${yBottom.toFixed(1)}`, `L${x},${(yBottom - lead).toFixed(1)}`];
  for (let i = 0; i < coils * 2; i++) {
    pts.push(`L${(x + (i % 2 ? -half : half)).toFixed(1)},${(yBottom - lead - ((i + 0.5) / (coils * 2)) * span).toFixed(1)}`);
  }
  pts.push(`L${x},${(yTop + lead).toFixed(1)}`, `L${x},${yTop.toFixed(1)}`);
  return pts.join(' ');
}

export default function SensorMotion({ fn, zeta, testF, velocity }: { fn: number; zeta: number; testF: number; velocity: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>('low');
  const r = view === 'test' ? testF / fn : VIEW_R[view];
  const f = r * fn;
  const speeds = useMemo(() => turnSpeeds(f, [0.25, 0.5, 1]).map((s, i) => ({ ...s, label: `${['느리게', '보통', '빠르게'][i]} — 1초에 ${[0.25, 0.5, 1][i]}번 왕복` })), [f]);
  const [speed, setSpeed] = useState(1);
  const clock = usePlayClock(speeds[speed].rate, 2 / f, box);
  const th = TWO_PI * f * clock.t;

  const m = useMemo(() => {
    const s = seismicMotion(r, zeta);
    const xa = Math.hypot(s.xRe, s.xIm);
    const za = Math.hypot(s.zRe, s.zIm);
    // 화면 축척: 바닥 움직임 Yd [px] — 질량이 공간에서 34 px, 케이스 안에서 30 px를 넘지 않게
    const Yd = Math.min(30, 34 / Math.max(xa, 1e-9), 30 / Math.max(za, 1e-9));
    const xs = Array.from({ length: N }, (_, i) => X0 + ((X1 - X0) * i) / (N - 1));
    const big = Math.max(1, xa);
    const at = (i: number) => (2 * TWO_PI * i) / (N - 1);
    const base = xs.map((_, i) => T1 - (TK * Math.cos(at(i))) / big);
    const mass = xs.map((_, i) => T1 - (TK * (s.xRe * Math.cos(at(i)) - s.xIm * Math.sin(at(i)))) / big);
    const rel = xs.map((_, i) => T2 - (TK * 0.8 * (s.zRe * Math.cos(at(i)) - s.zIm * Math.sin(at(i)))) / Math.max(za, 1e-12));
    return { s, xa, za, Yd, xs, base, mass, rel };
  }, [r, zeta]);

  const yd = m.Yd * Math.cos(th); // 바닥(케이스) 위로 +
  const xd = m.Yd * (m.s.xRe * Math.cos(th) - m.s.xIm * Math.sin(th)); // 질량(공간) 위로 +
  const floor = FLOOR - yd;
  const massC = M0 - xd;
  const upto = Math.max(1, Math.floor((th / (2 * TWO_PI)) * (N - 1)) + 1);
  const path = (ys: number[], n = ys.length) => ys.slice(0, n).map((y, i) => `${i ? 'L' : 'M'}${m.xs[i].toFixed(1)},${y.toFixed(1)}`).join('');
  const cursor = X0 + ((X1 - X0) * th) / (2 * TWO_PI);
  const regime = r < 0.5 ? 'low' : r <= 2 ? 'res' : 'high';
  const say = {
    low: `아래(r = ${formatNumber(r, 2)}): 질량이 케이스와 거의 함께 움직이고, 스프링은 바닥 움직임의 ${formatNumber(m.za, 2)}배만 늘었다 줄었다 합니다. 이 작은 늘어남은 바닥의 가속도에 비례하므로 가속도계는 이것을 압전 소자로 읽습니다 — 가속도계의 평탄 대역입니다.`,
    res: `고유진동수 근처(r = ${formatNumber(r, 2)}): 질량이 바닥보다 훨씬 크게 흔들립니다. 스프링 늘어남이 바닥 움직임의 ${formatNumber(m.za, 3)}배(r = 1이면 1/(2ζ))라 센서가 실제보다 크게 읽습니다 — 공진.`,
    high: `위(r = ${formatNumber(r, 2)}): 질량은 공간에서 거의 멈춰 있고(바닥의 ${formatNumber(m.xa, 2)}배) 케이스만 그 둘레를 오갑니다. 스프링 늘어남 ≈ 바닥 변위(부호 반대)라, 동전형 속도계는 이 상대 운동의 빠르기를 코일로 읽습니다 — 속도계의 평탄 대역입니다.`,
  }[regime];

  return (
    <div className="anim-panel" ref={box}>
      <PlayControls clock={clock} speeds={speeds} speed={speed} onSpeed={setSpeed} status={`r = f/fₙ = ${formatNumber(r, 3)}`}>
        <label className="anim-speed">
          보기
          <select value={view} onChange={(e) => setView(e.target.value as View)}>
            <option value="low">고유진동수 아래 (r = 0.2)</option>
            <option value="res">고유진동수 근처 (r = 1)</option>
            <option value="high">고유진동수 위 (r = 5)</option>
            <option value="test">랩의 시험 주파수 ({formatNumber(testF, 4)} Hz)</option>
          </select>
        </label>
      </PlayControls>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}
        aria-label={`${velocity ? '속도계' : '가속도계'} 케이스 안의 질량과 스프링. ${say}`}>
        {/* 공간에 고정된 기준 높이 */}
        <line x1={30} y1={M0} x2={290} y2={M0} stroke="var(--status-wip)" strokeDasharray="6 4" opacity="0.8" />
        <text x={218} y={M0 - 6} fontSize="11.5" fill="var(--status-wip)">질량의 제자리</text>
        {/* 바닥판 (기계 표면) */}
        <rect x={40} y={floor} width={220} height={12} fill="var(--border)" stroke="var(--text-muted)" />
        <text x={150} y={floor + 30} textAnchor="middle" fontSize="12" fill="var(--text-muted)">기계 표면 (흔들림)</text>
        {/* 케이스 */}
        <rect x={CX - 62} y={floor - CASE_H} width={124} height={CASE_H} rx={6} fill="none" stroke="var(--text-muted)" strokeWidth="2.4" />
        <text x={CX + 66} y={floor - CASE_H + 14} fontSize="12" fill="var(--text-muted)">케이스</text>
        {/* 스프링 (케이스 바닥 → 질량 아래) */}
        <path d={spring(CX, floor - 2, massC + MASS_H / 2)} fill="none" stroke="var(--plot-2)" strokeWidth="2.4" />
        <rect x={CX - MASS_W / 2} y={massC - MASS_H / 2} width={MASS_W} height={MASS_H} rx={5} fill="var(--accent-soft)" stroke="var(--plot-1)" strokeWidth="2.4" />
        <text x={CX} y={massC + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">m</text>

        {/* 위 띠: 바닥과 질량 (같은 축척) */}
        <text x={X0} y={18} fontSize="12.5" fill="var(--text-muted)">
          <tspan fill="var(--text-muted)">바닥(케이스) ━</tspan> <tspan fill="var(--plot-1)">질량 ━</tspan> (공간에서 본 높이)
        </text>
        <line x1={X0} y1={T1} x2={X1} y2={T1} stroke="var(--border)" />
        <path d={path(m.base)} fill="none" stroke="var(--text-muted)" strokeWidth="1.2" opacity="0.25" />
        <path d={path(m.mass)} fill="none" stroke="var(--plot-1)" strokeWidth="1.2" opacity="0.2" />
        <path d={path(m.base, upto)} fill="none" stroke="var(--text-muted)" strokeWidth="2.2" />
        <path d={path(m.mass, upto)} fill="none" stroke="var(--plot-1)" strokeWidth="2.4" />
        {/* 아래 띠: 스프링 늘어남 = 센서가 읽는 것 */}
        <text x={X0} y={T2 - 52} fontSize="12.5" fill="var(--plot-2)">스프링 늘어남 z = 센서가 읽는 것</text>
        <text x={X1} y={H - 4} textAnchor="end" fontSize="11.5" fill="var(--text-muted)">z의 크기 = 바닥의 {formatNumber(m.za, 2)}배 (그림은 크기를 따로 맞춤)</text>
        <line x1={X0} y1={T2} x2={X1} y2={T2} stroke="var(--border)" />
        <path d={path(m.rel)} fill="none" stroke="var(--plot-2)" strokeWidth="1.2" opacity="0.2" />
        <path d={path(m.rel, upto)} fill="none" stroke="var(--plot-2)" strokeWidth="2.4" />
        <line x1={cursor} y1={26} x2={cursor} y2={H - 8} stroke="var(--text-muted)" opacity="0.5" />
      </svg>
      <p className="anim-caption">{say} 그림은 상자 안에 들어가게 크기를 맞췄고 실제보다 아주 느리게 재생합니다 (센서 고유진동수 {formatNumber(fn, 4)} Hz, ζ = {formatNumber(zeta, 2)}).</p>
    </div>
  );
}
