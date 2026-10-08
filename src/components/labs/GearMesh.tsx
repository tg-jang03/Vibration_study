import { useMemo, useRef, useState } from 'react';
import { formatNumber } from '../../lib/format';
import { GEAR_DEMO, GEAR_PAIR, type GearFault, type GearSide } from '../../lib/faults/gear';
import { gearToothAngle, meshEvents, pinionToothAngle } from '../../lib/faults/gearMotion';
import { usePlayClock } from '../ui/hooks';
import PlayControls, { turnSpeeds } from '../ui/PlayControls';

/**
 * LAB-GEAR-01의 움직이는 그림 (D-044): 23이빨 피니언(반시계)과 61이빨 기어(시계)가 맞물려 돈다.
 * 상한 이빨(빨강)이 맞물림 자리에 오면 충격 → 오른쪽 띠에 막대. 맞물림 시각·이빨 번호는 lib/faults/gearMotion.ts (신호 모델과 같음).
 * 헌팅 투스는 두 상한 이빨이 다시 만나기까지 피니언 61바퀴(2.456 s)라 빠르게 재생하고 상한 이빨의 맞물림만 띠에 둔다.
 */

const { z1, z2, f1, f2, htPeriod } = GEAR_PAIR;
const W = 720;
const H = 270;
const R1 = 34; // 피니언 피치 반지름
const R2 = (R1 * z2) / z1; // 기어 ≈ 90.2
const P = { x: 52, y: 132 };
const G = { x: P.x + R1 + R2, y: P.y };
const ADD = 4; // 이빨 높이의 절반
const X0 = 336;
const X1 = W - 14;
const BASE = 206;
const STEM = 26; // 세기 1의 막대 높이
const FLASH = 0.15;

/** 수학 각(+x = 0, 반시계) → 화면 */
const pos = (c: { x: number; y: number }, a: number, r: number): [number, number] => [c.x + r * Math.cos(a), c.y - r * Math.sin(a)];

/** 이빨 z개의 윤곽. angleOf(i) = 이빨 i 가운데의 각도 */
function gearPath(c: { x: number; y: number }, r: number, z: number, angleOf: (i: number) => number): string {
  const pa = (2 * Math.PI) / z;
  const pts: string[] = [];
  for (let i = 0; i < z; i++) {
    const a = angleOf(i);
    for (const [da, rr] of [[-0.27, r - ADD], [-0.13, r + ADD], [0.13, r + ADD], [0.27, r - ADD]] as const) {
      const [x, y] = pos(c, a + da * pa, rr);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
  }
  return `M${pts.join(' L')} Z`;
}

function toothMark(c: { x: number; y: number }, r: number, a: number, z: number): string {
  const pa = (2 * Math.PI) / z;
  return [[-0.27, r - ADD], [-0.13, r + ADD], [0.13, r + ADD], [0.27, r - ADD]]
    .map(([da, rr]) => pos(c, a + da * pa, rr).map((v) => v.toFixed(1)).join(','))
    .join(' ');
}

const EXPLAIN: Record<GearFault, (side: GearSide) => string> = {
  healthy: () => `맞물림은 1초에 GMF = ${z1} × ${formatNumber(f1, 4)} = ${formatNumber(GEAR_PAIR.gmf, 4)}번, 이빨마다 고르게 일어납니다. 이 그림에서 막대는 고르고, 결함은 스펙트럼과 파형에서 봅니다.`,
  wear: () => '마모는 모든 이빨이 고르게 닳아 맞물림마다 조금씩 세집니다. 막대는 고르게 높아질 뿐이라, 결함 모양은 GMF 하모닉의 키(스펙트럼)에서 봅니다.',
  eccentric: (s) => `편심인 ${s === 'pinion' ? '피니언은' : '기어는'} 한 바퀴에 한 번 더 깊게 물렸다 얕게 물립니다. 막대 높이가 그 기어의 회전(${formatNumber(s === 'pinion' ? f1 : f2, 4)} Hz)으로 오르내림 → GMF 둘레에 그 간격의 측대역.`,
  broken: (s) => `깨진 이(빨강)는 ${s === 'pinion' ? `피니언이 한 바퀴 돌 때(${formatNumber(1000 / f1, 3)} ms)` : `기어가 한 바퀴 돌 때(${formatNumber(1000 / f2, 4)} ms)`} 한 번만 맞물려 그때만 큰 충격이 옵니다 — 파형에서 한 바퀴에 한 번 튀는 봉우리, 스펙트럼에서 GMF 둘레의 ${s === 'pinion' ? '피니언' : '기어'} 1X 간격 측대역이 넓게.`,
  backlash: () => '백래시가 크면 가벼운 부하에서 이빨이 떨어졌다 다시 부딪힙니다. 이 그림의 맞물림은 고르게 그렸고, 모양은 파형·스펙트럼에서 봅니다.',
  hunting: () => `피니언의 상한 이빨과 기어의 상한 이빨(둘 다 빨강)은 ${z1} × ${z2} = ${z1 * z2}번 맞물림마다 = 피니언 ${z2}바퀴 = 기어 ${z1}바퀴마다 한 번만 만납니다(${formatNumber(htPeriod, 4)} s, 헌팅 투스 주기). 작은 주황 막대는 상한 이빨 하나가 맞물릴 때, 큰 빨강 막대는 둘이 만날 때입니다 — 띠에는 두 주기를 담아 큰 막대 사이 간격이 곧 헌팅 투스 주기입니다.`,
};

export default function GearMesh({ fault, side }: { fault: GearFault; side: GearSide }) {
  const box = useRef<HTMLDivElement>(null);
  const hunting = fault === 'hunting';
  const speeds = useMemo(() => turnSpeeds(f1, hunting ? [1, 2, 4] : [0.1, 0.25, 0.5]), [hunting]);
  const [speed, setSpeed] = useState(1);
  const rate = speeds[Math.min(speed, speeds.length - 1)].rate;
  const clock = usePlayClock(rate, undefined, box);
  const t = clock.t;

  // 이빨이 한 프레임(60 fps)에 0.3피치 넘게 움직이면 이빨 윤곽이 거꾸로 기는 것처럼 보인다(D-044 §4) → 그때는 피치원만 그린다
  const blur = (f1 * rate * z1) / 60 > 0.3;
  // 오른쪽 띠의 창: 헌팅 = 두 주기(큰 막대 간격이 보이게), 기어 쪽 결함 = 기어 2바퀴, 그 밖 = 피니언 4바퀴
  const gearSideWin = (fault === 'broken' || fault === 'eccentric') && side === 'gear';
  const Tw = hunting ? 2 * htPeriod : gearSideWin ? 2 / f2 : 4 / f1;
  const w0 = Math.floor(t / Tw) * Tw;
  const events = useMemo(() => meshEvents(fault, side, w0, w0 + Tw, hunting), [fault, side, w0, Tw, hunting]);
  const shown = events.filter((e) => e.t <= t);
  const lastDamaged = [...shown].reverse().find((e) => e.damaged > 0);
  const flash = clock.playing && lastDamaged && (t - lastDamaged.t) / rate < FLASH ? lastDamaged : null;
  const xAt = (tt: number) => X0 + ((X1 - X0) * (tt - w0)) / Tw;
  const maxW = hunting ? 6 : fault === 'broken' ? 5 : 1.8;
  const stemK = (BASE - 40) / maxW;

  const markPinion = (fault === 'broken' && side === 'pinion') || hunting;
  const markGear = (fault === 'broken' && side === 'gear') || hunting;
  // 기어 이빨은 반 칸 비켜 그린다: 피니언 이빨이 맞물림 자리에서 기어 이빨 사이 골에 들어가게
  const gearDraw = (g: number) => gearToothAngle(g, t) - Math.PI / z2; // −: 충격 순간 빨간 이빨이 밀리는 쪽(맞물림 자리)에 온다
  const mesh = pos(P, 0, R1);
  const grid = hunting ? 20 : gearSideWin ? 1 / f2 : 1 / f1;
  const gridLines = hunting
    ? Array.from({ length: Math.floor((2 * z2) / 20) + 1 }, (_, i) => w0 + (i * 20) / f1)
    : Array.from({ length: Math.round(Tw / grid) + 1 }, (_, i) => w0 + i * grid);

  return (
    <div className="anim-panel" ref={box}>
      <PlayControls clock={clock} speeds={speeds} speed={Math.min(speed, speeds.length - 1)} onSpeed={setSpeed}
        status={`피니언 ${(t * f1).toFixed(2)}바퀴 · 기어 ${(t * f2).toFixed(2)}바퀴`} />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}
        aria-label={`${z1}이빨 피니언과 ${z2}이빨 기어가 맞물려 돈다. ${EXPLAIN[fault](side)}`}>
        {blur ? (
          <>
            <circle cx={G.x} cy={G.y} r={R2} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.3" strokeDasharray="5 4" />
            <circle cx={P.x} cy={P.y} r={R1} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.3" strokeDasharray="5 4" />
          </>
        ) : (
          <>
            <path d={gearPath(G, R2, z2, gearDraw)} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.3" />
            <path d={gearPath(P, R1, z1, (p) => pinionToothAngle(p, t))} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="1.3" />
          </>
        )}
        {/* 회전을 보이는 표시선 */}
        <line x1={P.x} y1={P.y} x2={pos(P, pinionToothAngle(0, t) + Math.PI, R1 - 10)[0]} y2={pos(P, pinionToothAngle(0, t) + Math.PI, R1 - 10)[1]} stroke="var(--plot-1)" strokeWidth="3" strokeLinecap="round" />
        <line x1={G.x} y1={G.y} x2={pos(G, gearDraw(0) + Math.PI, R2 - 18)[0]} y2={pos(G, gearDraw(0) + Math.PI, R2 - 18)[1]} stroke="var(--plot-4)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={P.x} cy={P.y} r={4} fill="var(--text-muted)" />
        <circle cx={G.x} cy={G.y} r={5} fill="var(--text-muted)" />
        {markPinion && <polygon points={toothMark(P, R1, pinionToothAngle(GEAR_DEMO.pinionTooth, t), z1)} fill="#dc2626" />}
        {markGear && <polygon points={toothMark(G, R2, gearDraw(GEAR_DEMO.gearTooth), z2)} fill="#dc2626" />}
        {flash && (
          <g>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              const s = flash.damaged === 2 ? 1.5 : 1;
              return <line key={i} x1={mesh[0] + 6 * s * Math.cos(a)} y1={mesh[1] + 6 * s * Math.sin(a)} x2={mesh[0] + 15 * s * Math.cos(a)} y2={mesh[1] + 15 * s * Math.sin(a)} stroke="#eab308" strokeWidth="2.6" strokeLinecap="round" />;
            })}
          </g>
        )}
        <text x={P.x} y={P.y + R1 + 26} textAnchor="middle" fontSize="12" fill="var(--text-muted)">피니언 {z1}이빨 ↺</text>
        <text x={G.x} y={G.y + R2 + 26} textAnchor="middle" fontSize="12" fill="var(--text-muted)">기어 {z2}이빨 ↻</text>

        {/* 오른쪽 띠 */}
        <text x={X0} y={18} fontSize="12.5" fill="var(--text-muted)">
          {hunting ? `상한 이빨이 맞물릴 때만 · 헌팅 투스 두 주기 (2 × ${formatNumber(htPeriod, 4)} s)` : `맞물림마다의 충격 (막대 높이) · ${gearSideWin ? '기어 2바퀴' : '피니언 4바퀴'} 동안 ${events.length}번`}
        </text>
        <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke="var(--border)" />
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={xAt(g)} y1={30} x2={xAt(g)} y2={BASE + 5} stroke="var(--text-muted)" strokeDasharray="3 4" opacity="0.45" />
            <text x={xAt(g)} y={BASE + 19} textAnchor={i === 0 ? 'start' : 'middle'} fontSize="11.5" fill="var(--text-muted)">
              {hunting ? `${i * 20}` : `${i}`}
            </text>
          </g>
        ))}
        <text x={X1} y={BASE + 36} textAnchor="end" fontSize="11.5" fill="var(--text-muted)">
          {hunting ? '피니언 바퀴 수' : gearSideWin ? '기어 바퀴 수' : '피니언 바퀴 수'}
        </text>
        {events.map((e) => (
          <line key={e.n} x1={xAt(e.t)} y1={BASE} x2={xAt(e.t)} y2={BASE - e.w * stemK} stroke={e.damaged === 2 ? '#dc2626' : e.damaged === 1 ? 'var(--plot-2)' : 'var(--plot-1)'}
            strokeWidth={e.damaged ? 2.4 : 1.1} opacity={e.t <= t ? 1 : 0.15} />
        ))}
        <line x1={xAt(t)} y1={30} x2={xAt(t)} y2={BASE + 5} stroke="var(--text-muted)" />
      </svg>
      <p className="anim-caption">{EXPLAIN[fault](side)} 파랑·보라 선은 두 기어가 도는 것을 보이는 표시선입니다. 그림은 실제보다 느리게 재생합니다{hunting ? '(헌팅 투스는 주기를 보려고 더 빠르게 — 이빨이 너무 빨라 거꾸로 도는 것처럼 보이지 않게 피치원만 그림)' : ''}.</p>
    </div>
  );
}
