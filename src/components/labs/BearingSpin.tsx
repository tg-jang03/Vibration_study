import { useMemo, useRef, useState } from 'react';
import { formatNumber } from '../../lib/format';
import { BRG_DEMO, DEMO_CALC, DEMO_FR, FAULT_LABEL, RATE_LABEL, type BearingFault } from '../../lib/faults/bearing';
import { bearingImpacts, bearingPose } from '../../lib/faults/bearingMotion';
import { usePlayClock } from '../ui/hooks';
import PlayControls, { turnSpeeds } from '../ui/PlayControls';

/**
 * LAB-BRG-02의 움직이는 그림 (D-044): 6205 볼베어링(볼 9개)이 도는 모습과 결함 충격.
 * 외륜 고정·내륜 = 축·케이지 FTF·볼 자전 BSF (계산값, 미끄럼 없음). 충격 시각·세기는 lib/faults/bearingMotion.ts.
 * 오른쪽 띠: 축 4바퀴 동안의 충격(막대 높이 = 세기). 내륜·볼 결함은 하중대를 들락날락해 세기가 오르내린다.
 */

const N = BRG_DEMO.geometry.balls;
const B = DEMO_CALC;
const FR = DEMO_FR;
const W = 720;
const H = 270;
const C = { x: 140, y: 132 };
const R_OUT = 120; // 외륜 바깥
const R_OR = 98; // 외륜 궤도면
const RP = 80; // 볼 중심 (피치 원)
const RB = RP * (BRG_DEMO.geometry.ballDiameter / BRG_DEMO.geometry.pitchDiameter) + 1.6; // 볼 반지름 ≈ 17.9 px
const R_IR = RP - RB + 1; // 내륜 궤도면
const R_SHAFT = 40;
const X0 = 320;
const X1 = W - 14;
const BASE = 214; // 띠의 바닥선
const STEM = 150; // 세기 1의 막대 높이
const WINDOW_TURNS = 4;
const FLASH = 0.18; // 충격 표시를 남기는 실제 시간 [s]
const TWO_PI = 2 * Math.PI;

/** 아래 = 0, 반시계 + 각도 → 화면 점 */
const at = (a: number, r: number): [number, number] => [C.x + r * Math.sin(a), C.y + r * Math.cos(a)];

function arcBand(a0: number, a1: number, r0: number, r1: number): string {
  const [x0, y0] = at(a0, r1);
  const [x1, y1] = at(a1, r1);
  const [x2, y2] = at(a1, r0);
  const [x3, y3] = at(a0, r0);
  return `M${x0},${y0} A${r1},${r1} 0 0 0 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 1 ${x3},${y3} Z`;
}

function Burst({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <line key={i} x1={x + 5 * size * Math.cos(a)} y1={y + 5 * size * Math.sin(a)} x2={x + 13 * size * Math.cos(a)} y2={y + 13 * size * Math.sin(a)} stroke="#eab308" strokeWidth={2.4} strokeLinecap="round" />;
      })}
      <circle cx={x} cy={y} r={4 * size} fill="#facc15" />
    </g>
  );
}

const EXPLAIN: Record<BearingFault, string> = {
  outer: `외륜은 멈춰 있고 결함은 아래 하중대에 있습니다. 볼 ${N}개를 실은 케이지가 축 한 바퀴에 ${formatNumber(B.ftf / FR, 3)}바퀴(FTF = ${formatNumber(B.ftf, 4)} Hz) 돌므로, 결함 위를 지나는 볼은 1초에 ${N} × ${formatNumber(B.ftf, 4)} = ${formatNumber(B.bpfo, 4)}개 — 이것이 BPFO입니다. 결함이 늘 하중대에 있어 충격 세기가 고릅니다.`,
  inner: `내륜 결함은 축과 함께 1초에 ${formatNumber(FR, 4)}바퀴 돌고, 볼은 그보다 느리게(${formatNumber(B.ftf, 4)} Hz) 돕니다. 결함이 볼을 따라잡는 빈도는 ${N} × (${formatNumber(FR, 4)} − ${formatNumber(B.ftf, 4)}) = ${formatNumber(B.bpfi, 4)} Hz — BPFI입니다. 결함이 축 한 바퀴에 한 번 아래 하중대를 지나며 충격이 커졌다 작아지므로, 충격 세기가 1X로 오르내립니다 → BPFI ± 1X 측대역.`,
  ball: `흠이 난 볼(빨간 점)은 케이지 안에서 1초에 ${formatNumber(B.bsf, 4)}바퀴(BSF) 자전하며, 한 바퀴에 외륜과 내륜에 한 번씩 닿습니다 → 2 × BSF = ${formatNumber(B.bsf2, 4)} Hz. 그 볼은 케이지와 함께 1초에 ${formatNumber(B.ftf, 4)}바퀴 하중대를 들락날락하므로 세기가 FTF로 오르내립니다 → 2×BSF ± FTF.`,
  cage: `케이지의 칸 하나(빨간 칸)가 부러졌습니다. 그 칸이 하중대를 지날 때마다 볼과 부딪히므로 1초에 FTF = ${formatNumber(B.ftf, 4)}번, 축 회전수(${formatNumber(FR, 4)} Hz)보다도 낮습니다. 충격은 궤도면 결함보다 약합니다.`,
};

export default function BearingSpin({ fault, healthy }: { fault: BearingFault; healthy: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const speeds = useMemo(() => turnSpeeds(FR, [0.1, 0.25, 0.5]), []);
  const [speed, setSpeed] = useState(1);
  const rate = speeds[speed].rate;
  const clock = usePlayClock(rate, undefined, box);
  const t = clock.t;
  const pose = bearingPose(B, FR, N, t);
  const Tw = WINDOW_TURNS / FR;
  const w0 = Math.floor(t / Tw) * Tw;
  const hits = useMemo(() => (healthy ? [] : bearingImpacts(fault, B, FR, N, w0, w0 + Tw)), [healthy, fault, w0, Tw]);
  const shown = hits.filter((h) => h.t <= t);
  const last = shown.at(-1);
  const flash = clock.playing && last && (t - last.t) / rate < FLASH ? last : null;
  const xAt = (tt: number) => X0 + ((X1 - X0) * (tt - w0)) / Tw;
  const turns = t * FR;

  // 충격이 난 자리 (화면)
  let burst: [number, number] | null = null;
  if (flash) {
    if (fault === 'outer') burst = at(0, R_OR);
    else if (fault === 'inner') burst = at(pose.inner, R_IR);
    else if (fault === 'ball') burst = at(flash.angle, flash.race === 'outer' ? RP + RB : RP - RB);
    else burst = at(pose.cage + Math.PI / N, RP);
  }
  const ball0 = pose.balls[0];
  const spot: [number, number] = (() => {
    // 볼 흠: 케이지에서 보면 바깥(외륜 쪽)에서 시작해 내륜과 반대로(시계) 돈다
    const [bx, by] = at(ball0, RP);
    const dir = ball0 - pose.spin;
    return [bx + (RB - 4) * Math.sin(dir), by + (RB - 4) * Math.cos(dir)];
  })();

  return (
    <div className="anim-panel" ref={box}>
      <PlayControls clock={clock} speeds={speeds} speed={speed} onSpeed={setSpeed}
        status={`축 ${turns.toFixed(2)}바퀴 · 케이지 ${(turns * (B.ftf / FR)).toFixed(2)}바퀴`} />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}
        aria-label={`볼 ${N}개 베어링이 돈다. ${healthy ? '결함 없음' : `${FAULT_LABEL[fault]} 결함, 충격이 1초에 ${formatNumber(fault === 'outer' ? B.bpfo : fault === 'inner' ? B.bpfi : fault === 'ball' ? B.bsf2 : B.ftf, 4)}번`}.`}>
        {/* 하중대 */}
        <path d={arcBand(-Math.PI / 3, Math.PI / 3, R_OUT + 2, R_OUT + 12)} fill="var(--status-wip)" opacity="0.35" />
        <text x={C.x} y={H - 4} textAnchor="middle" fontSize="12" fill="var(--text-muted)">하중대 (축 무게가 실리는 아래)</text>
        {/* 외륜 (고정) */}
        <circle cx={C.x} cy={C.y} r={(R_OUT + R_OR) / 2} fill="none" stroke="var(--border)" strokeWidth={R_OUT - R_OR} />
        <circle cx={C.x} cy={C.y} r={R_OR} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
        <circle cx={C.x} cy={C.y} r={R_OUT} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
        {!healthy && fault === 'outer' && <path d={arcBand(-0.07, 0.07, R_OR, R_OR + 7)} fill="#dc2626" />}
        {/* 내륜 + 축 (축과 함께 돈다) */}
        <circle cx={C.x} cy={C.y} r={(R_IR + R_SHAFT) / 2} fill="none" stroke="var(--border)" strokeWidth={R_IR - R_SHAFT} />
        <circle cx={C.x} cy={C.y} r={R_IR} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
        <circle cx={C.x} cy={C.y} r={R_SHAFT} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.5" />
        <line x1={at(pose.inner + Math.PI, 6)[0]} y1={at(pose.inner + Math.PI, 6)[1]} x2={at(pose.inner + Math.PI, R_SHAFT - 4)[0]} y2={at(pose.inner + Math.PI, R_SHAFT - 4)[1]} stroke="var(--plot-1)" strokeWidth="3" strokeLinecap="round" />
        <text x={C.x} y={C.y + 4} textAnchor="middle" fontSize="11" fill="var(--text-muted)">축</text>
        {!healthy && fault === 'inner' && <path d={arcBand(pose.inner - 0.09, pose.inner + 0.09, R_IR - 7, R_IR)} fill="#dc2626" />}
        {/* 케이지: 피치 원 + 볼 사이 칸막이 */}
        <circle cx={C.x} cy={C.y} r={RP} fill="none" stroke="var(--plot-4)" strokeWidth="1.2" strokeDasharray="3 3" />
        {pose.balls.map((a, k) => {
          const mid = a + Math.PI / N;
          const broken = !healthy && fault === 'cage' && k === 0;
          const [x1, y1] = at(mid, RP - 9);
          const [x2, y2] = at(mid, RP + 9);
          return <line key={`bar${k}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={broken ? '#dc2626' : 'var(--plot-4)'} strokeWidth={broken ? 4 : 3} strokeDasharray={broken ? '4 3' : undefined} />;
        })}
        {/* 볼 */}
        {pose.balls.map((a, k) => {
          const [x, y] = at(a, RP);
          return <circle key={`ball${k}`} cx={x} cy={y} r={RB} fill="var(--surface)" stroke={k === 0 ? 'var(--plot-2)' : 'var(--text-muted)'} strokeWidth={k === 0 ? 2.4 : 1.5} />;
        })}
        {!healthy && fault === 'ball' && <circle cx={spot[0]} cy={spot[1]} r={3.6} fill="#dc2626" />}
        {burst && <Burst x={burst[0]} y={burst[1]} size={0.6 + 0.6 * (flash?.w ?? 1)} />}
        <text x={C.x - R_OUT} y={14} fontSize="12" fill="var(--text-muted)">외륜 고정 · 내륜(축) ↺</text>

        {/* 오른쪽 띠: 축 4바퀴 동안의 충격 */}
        <text x={X0} y={18} fontSize="12.5" fill="var(--text-muted)">
          {healthy ? '결함이 없으면 충격도 없습니다' : `충격 (막대 높이 = 세기) · 축 ${WINDOW_TURNS}바퀴 동안 ${formatNumber(hits.length, 3)}번`}
        </text>
        <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke="var(--border)" />
        {Array.from({ length: WINDOW_TURNS + 1 }, (_, i) => (
          <g key={i}>
            <line x1={xAt(w0 + i / FR)} y1={BASE - STEM - 10} x2={xAt(w0 + i / FR)} y2={BASE + 6} stroke="var(--text-muted)" strokeDasharray="3 4" opacity="0.5" />
            <text x={xAt(w0 + i / FR)} y={BASE + 20} textAnchor={i === 0 ? 'start' : i === WINDOW_TURNS ? 'end' : 'middle'} fontSize="11.5" fill="var(--text-muted)">{i === 0 ? '축 0바퀴' : `${i}`}</text>
          </g>
        ))}
        {hits.map((h) => (
          <line key={h.t} x1={xAt(h.t)} y1={BASE} x2={xAt(h.t)} y2={BASE - STEM * h.w} stroke={h.race === 'inner' ? 'var(--plot-3)' : 'var(--plot-2)'} strokeWidth="2.2" opacity={h.t <= t ? 1 : 0.15} />
        ))}
        <line x1={xAt(t)} y1={BASE - STEM - 10} x2={xAt(t)} y2={BASE + 6} stroke="var(--text-muted)" />
        {!healthy && (
          <text x={X1} y={H - 6} textAnchor="end" fontSize="12" fill="var(--text-muted)">
            {RATE_LABEL[fault]} = {formatNumber(fault === 'outer' ? B.bpfo : fault === 'inner' ? B.bpfi : fault === 'ball' ? B.bsf2 : B.ftf, 4)} Hz = 축 한 바퀴에 {formatNumber((fault === 'outer' ? B.bpfo : fault === 'inner' ? B.bpfi : fault === 'ball' ? B.bsf2 : B.ftf) / FR, 3)}번
            {fault === 'ball' ? ' (주황 = 외륜에, 초록 = 내륜에)' : ''}
          </text>
        )}
      </svg>
      <p className="anim-caption">
        {healthy ? `건전한 베어링: 축(파란 표시)이 1초에 ${formatNumber(FR, 4)}바퀴, 볼을 실은 케이지(보라)는 그보다 느린 ${formatNumber(B.ftf, 4)}바퀴(FTF) 돕니다. 결함 위치를 고르고 단계를 올리면 충격이 보입니다.` : EXPLAIN[fault]}
        {' '}숫자는 미끄럼 없는 계산값입니다(실제 신호는 미끄럼 1 %로 조금 다름).
      </p>
    </div>
  );
}
