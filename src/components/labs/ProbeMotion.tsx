import { useMemo, useRef, useState } from 'react';
import { formatNumber } from '../../lib/format';
import { gapVoltage, runoutAt, shaftVibration, type ProbeCalibration, type ProbeSim, type RunoutKind } from '../../lib/proximity';
import { usePlayClock } from '../ui/hooks';
import PlayControls, { turnSpeeds } from '../ui/PlayControls';

/**
 * LAB-PROX-01의 움직이는 그림 (D-044): 근접 프로브 앞으로 축 표면이 지나간다.
 * gap = d₀ − 진동 + 런아웃 (lib/proximity.ts의 simulateProbe와 같은 식). 기계적 런아웃(진원도·흠집)은 윤곽으로, 전기적 런아웃(재질 얼룩)은
 * 보라 무늬로 그린다. 오른쪽 = 같은 랩의 출력 전압(두 바퀴)을 축이 도는 만큼 그려 나간다. 움직임·굴곡은 크게 과장.
 */

interface ProbeMotionProps {
  gapMm: number;
  rpm: number;
  /** 운전 회전수에서의 진동 [m pp] */
  vibPp: number;
  runout: RunoutKind;
  probe: ProbeCalibration;
  sim: ProbeSim;
}

const W = 720;
const H = 262;
const C = { x: 140, y: 166 };
const R0 = 76;
const TIP = C.y - R0 - 34; // 프로브 끝 (제자리 gap = 34 px)
const SHOW = 22; // 진동 + 런아웃의 가장 큰 값을 몇 px로 과장하나
const X0 = 316;
const X1 = W - 14;
const VT = 40;
const VB = 196;
const STEP = 3;
const TWO_PI = 2 * Math.PI;
const SEG = 72;

export default function ProbeMotion({ gapMm, rpm, vibPp, runout, probe, sim }: ProbeMotionProps) {
  const box = useRef<HTMLDivElement>(null);
  const fr = rpm / 60;
  const speeds = useMemo(() => turnSpeeds(fr), [fr]);
  const [speed, setSpeed] = useState(0);
  const clock = usePlayClock(speeds[speed].rate, 2 / fr, box);
  const th = TWO_PI * fr * clock.t;
  const vib = useMemo(() => shaftVibration(rpm, vibPp), [rpm, vibPp]);

  const m = useMemo(() => {
    const mech = runout === 'mechanical' || runout === 'both';
    const elec = runout === 'electrical' || runout === 'both';
    let maxR = 0;
    let maxE = 0;
    for (let i = 0; i < 720; i++) {
      const a = (TWO_PI * i) / 720;
      maxR = Math.max(maxR, Math.abs(runoutAt(a, runout)));
      maxE = Math.max(maxE, Math.abs(runoutAt(a, 'electrical')));
    }
    const k = SHOW / Math.max(vib.pp / 2 + maxR, 1e-6); // [px/m]
    // 전압 띠 (simulateProbe 결과를 STEP칸마다)
    const idx = Array.from({ length: Math.floor((sim.voltage.length - 1) / STEP) + 1 }, (_, i) => i * STEP);
    const vMin = Math.min(...Array.from(sim.voltage));
    const vMax = Math.max(...Array.from(sim.voltage));
    const pad = Math.max(0.05, (vMax - vMin) * 0.12);
    const lo = vMin - pad;
    const hi = vMax + pad;
    const vy = (v: number) => VT + ((hi - v) / (hi - lo)) * (VB - VT);
    const xs = idx.map((i) => X0 + ((X1 - X0) * sim.rev[i]) / 2);
    const ys = idx.map((i) => vy(sim.voltage[i]));
    return { mech, elec, k, maxE, lo, hi, vy, xs, ys };
  }, [runout, vib.pp, sim]);

  // 축 중심: 1X로 도는 작은 원 (센서 쪽 성분 = 진동)
  const a = th - vib.phaseLag;
  const cx = C.x - m.k * (vib.pp / 2) * Math.sin(a);
  const cy = C.y - m.k * (vib.pp / 2) * Math.cos(a);
  // 윤곽: 화면 각 ψ(위 = 0, 반시계)의 표면점은 회전각 θ − ψ에 프로브 앞을 지나는 점 → 기계적 런아웃만 모양을 바꾼다
  const outline = Array.from({ length: 181 }, (_, i) => {
    const psi = (TWO_PI * i) / 180;
    const r = R0 - (m.mech ? m.k * runoutAt(th - psi, 'mechanical') : 0);
    return `${i ? 'L' : 'M'}${(cx - r * Math.sin(psi)).toFixed(1)},${(cy - r * Math.cos(psi)).toFixed(1)}`;
  }).join('') + 'Z';
  const stains = m.elec
    ? Array.from({ length: SEG }, (_, i) => {
        const p0 = (TWO_PI * i) / SEG;
        const p1 = (TWO_PI * (i + 1)) / SEG;
        const e = runoutAt(th - (p0 + p1) / 2, 'electrical');
        const r = R0 - 5;
        const pt = (p: number) => `${(cx - r * Math.sin(p)).toFixed(1)},${(cy - r * Math.cos(p)).toFixed(1)}`;
        return { d: `M${pt(p0)} A${r},${r} 0 0 0 ${pt(p1)}`, o: Math.abs(e) / Math.max(m.maxE, 1e-12) };
      })
    : [];
  const gapNow = gapMm / 1000 - (vib.pp / 2) * Math.cos(a) + runoutAt(th, runout);
  const vNow = gapVoltage(gapNow, probe);
  const surfTop = cy - (R0 - (m.mech ? m.k * runoutAt(th, 'mechanical') : 0));
  const upto = Math.max(1, Math.min(m.xs.length, Math.floor((th / (2 * TWO_PI)) * (m.xs.length - 1)) + 1));
  const path = (n: number) => m.ys.slice(0, n).map((y, i) => `${i ? 'L' : 'M'}${m.xs[i].toFixed(1)},${y.toFixed(1)}`).join('');
  const cursor = X0 + ((X1 - X0) * th) / (2 * TWO_PI);
  // 흠집 자리(회전각 200°에 프로브 앞): 화면 각 θ − 200°
  const scratchPsi = th - (200 * Math.PI) / 180;

  return (
    <div className="anim-panel" ref={box}>
      <PlayControls clock={clock} speeds={speeds} speed={speed} onSpeed={setSpeed}
        status={`gap ${formatNumber(gapNow * 1000, 4)} mm → ${vNow.toFixed(2)} V`} />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}
        aria-label={`근접 프로브 앞으로 축이 돈다. 지금 gap ${formatNumber(gapNow * 1000, 4)} mm, 출력 ${vNow.toFixed(2)} V. 오른쪽에 출력 전압이 그려진다.`}>
        {/* 프로브 */}
        <rect x={C.x - 11} y={TIP - 40} width={22} height={40} rx={4} fill="var(--surface)" stroke="var(--plot-1)" strokeWidth="2" />
        <rect x={C.x - 11} y={TIP - 6} width={22} height={6} fill="var(--plot-1)" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${C.x - 9 - 4 * i},${TIP + 3 + 3 * i} Q${C.x},${TIP + 9 + 5 * i} ${C.x + 9 + 4 * i},${TIP + 3 + 3 * i}`} fill="none" stroke="var(--plot-1)" strokeWidth="1" opacity={0.5 - 0.12 * i} />
        ))}
        <text x={C.x + 18} y={TIP - 26} fontSize="12" fill="var(--plot-1)" fontWeight="600">근접 프로브</text>
        {/* gap 표시 */}
        <line x1={C.x + 22} y1={TIP} x2={C.x + 22} y2={surfTop} stroke="var(--status-wip)" strokeWidth="1.6" />
        <line x1={C.x + 16} y1={TIP} x2={C.x + 28} y2={TIP} stroke="var(--status-wip)" />
        <line x1={C.x + 16} y1={surfTop} x2={C.x + 28} y2={surfTop} stroke="var(--status-wip)" />
        <text x={C.x + 32} y={(TIP + surfTop) / 2 + 4} fontSize="12" fontWeight="700" fill="var(--status-wip)">gap</text>
        {/* 축: 윤곽(기계적 런아웃 과장) + 재질 얼룩(전기적 런아웃) */}
        <circle cx={C.x} cy={C.y} r={R0} fill="none" stroke="var(--border)" strokeDasharray="4 4" />
        <path d={outline} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="2" />
        {stains.map((s, i) => s.o > 0.15 && <path key={i} d={s.d} fill="none" stroke="var(--plot-4)" strokeWidth="7" opacity={0.75 * s.o} />)}
        {m.mech && (
          <text x={cx - (R0 + 14) * Math.sin(scratchPsi)} y={cy - (R0 + 14) * Math.cos(scratchPsi) + 4} textAnchor="middle" fontSize="11" fill="var(--text-muted)">흠집</text>
        )}
        <line x1={cx} y1={cy} x2={cx - (R0 - 12) * Math.sin(th)} y2={cy - (R0 - 12) * Math.cos(th)} stroke="var(--plot-1)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={3.5} fill="var(--text-muted)" />
        <text x={C.x} y={H - 4} textAnchor="middle" fontSize="12" fill="var(--text-muted)">축 ↺ (움직임·굴곡은 크게 과장)</text>

        {/* 오른쪽: 출력 전압 */}
        <text x={X0} y={20} fontSize="12.5" fill="var(--text-muted)">출력 전압 [V] (두 바퀴) — gap이 커지면 더 음으로</text>
        <line x1={X0} y1={m.vy(sim.dcVoltage)} x2={X1} y2={m.vy(sim.dcVoltage)} stroke="var(--plot-2)" strokeDasharray="5 4" />
        <text x={X1} y={m.vy(sim.dcVoltage) - 5} textAnchor="end" fontSize="11.5" fill="var(--plot-2)">DC {sim.dcVoltage.toFixed(2)} V (평균 gap)</text>
        <line x1={X0 + (X1 - X0) / 2} y1={VT - 6} x2={X0 + (X1 - X0) / 2} y2={VB + 6} stroke="var(--text-muted)" strokeDasharray="3 4" opacity="0.5" />
        <path d={path(m.xs.length)} fill="none" stroke="var(--plot-1)" strokeWidth="1.2" opacity="0.2" />
        <path d={path(upto)} fill="none" stroke="var(--plot-1)" strokeWidth="2.2" />
        <line x1={cursor} y1={VT - 6} x2={cursor} y2={VB + 6} stroke="var(--text-muted)" opacity="0.6" />
        <circle cx={cursor} cy={m.vy(vNow)} r={4.5} fill="var(--plot-1)" />
        <text x={X0} y={VB + 22} fontSize="11.5" fill="var(--text-muted)">{m.hi.toFixed(2)} ~ {m.lo.toFixed(2)} V</text>
        <text x={X0} y={H - 4} fontSize="12" fill="var(--text-muted)">0</text>
        <text x={X0 + (X1 - X0) / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="var(--text-muted)">1바퀴</text>
        <text x={X1} y={H - 4} textAnchor="end" fontSize="12" fill="var(--text-muted)">2바퀴</text>
      </svg>
      <p className="anim-caption">
        프로브는 바로 앞 축 표면까지의 거리(gap)를 전압으로 바꿉니다. 축이 센서 쪽으로 오면(진동) gap이 줄어 전압이 덜 음으로,
        {runout === 'none' ? ' 멀어지면 더 음으로 갑니다.' : ` 표면이 깎인 곳(흠집·타원 — 기계적 런아웃)이나 재질이 다른 곳(보라 무늬 — 전기적 런아웃)이 지나가면 축이 흔들리지 않아도 전압이 바뀝니다. 그래서 저속에서도 이 무늬가 남습니다.`}
        {' '}지금 진동 {formatNumber(vib.pp * 1e6, 3)} µm pp ({rpm} rpm).
      </p>
    </div>
  );
}
