import { useMemo, useRef, useState } from 'react';
import { formatNumber } from '../../lib/format';
import { diskUnbalance, lagDiff, ROTOR_1X, vectorAt, type OneXOptions } from '../../lib/faults/oneX';
import { usePlayClock } from '../ui/hooks';
import PlayControls, { turnSpeeds } from '../ui/PlayControls';

/**
 * LAB-1X-01의 움직이는 그림 (D-044): 원판 두 개를 단 강성 로터를 옆에서 본다 (운전 3000 rpm).
 * 축의 위아래 움직임 = 두 베어링 수직 센서가 읽은 1X 벡터를 직선으로 이은 것 (강성 로터: 병진 + 기울기, 움직임 확대).
 * 정적 불평형 → 두 끝이 함께(원통형), 커플 → 반대로(원추형). 원판의 불평형 표시는 diskUnbalance (정답 보기 전에는 숨김).
 */

const W = 720;
const H = 262;
const Y0 = 132;
const B1 = 70;
const B2 = 420;
const D1 = 182;
const D2 = 308;
const RX = 11;
const RY = 64;
const AMP = 28; // 가장 큰 끝의 확대 진폭 [px]
const X0 = 488;
const X1 = W - 14;
const TY = 132; // 오른쪽 띠의 0
const TK = 58; // 띠의 진폭 [px]
const N = 240;
const TWO_PI = 2 * Math.PI;
const RAD = Math.PI / 180;
const fr = ROTOR_1X.opRpm / 60;

export default function OneXRotor({ o, reveal }: { o: OneXOptions; reveal: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const speeds = useMemo(() => turnSpeeds(fr), []);
  const [speed, setSpeed] = useState(0);
  const clock = usePlayClock(speeds[speed].rate, 2 / fr, box);
  const th = TWO_PI * fr * clock.t;

  const m = useMemo(() => {
    const v1 = vectorAt(o, 'B1V', ROTOR_1X.opRpm);
    const v2 = vectorAt(o, 'B2V', ROTOR_1X.opRpm);
    const big = Math.max(v1.amp, v2.amp, 1e-12);
    const k = AMP / big;
    const disks = diskUnbalance(o);
    const dMax = Math.max(disks[0].amp, disks[1].amp, 1e-12);
    // 오른쪽 띠: 두 바퀴
    const xs = Array.from({ length: N }, (_, i) => X0 + ((X1 - X0) * i) / (N - 1));
    const wave = (v: typeof v1) => Array.from({ length: N }, (_, i) => TY - (TK * v.amp * Math.cos((2 * TWO_PI * i) / (N - 1) - v.lagDeg * RAD)) / big);
    return { v1, v2, k, disks, dMax, xs, w1: wave(v1), w2: wave(v2), dphi: lagDiff(v1.lagDeg, v2.lagDeg) };
  }, [o]);

  // 축 위아래 위치: 베어링 두 곳의 값을 직선으로 (원판·끝도 같은 직선 위)
  const y1 = Y0 - m.k * m.v1.amp * Math.cos(th - m.v1.lagDeg * RAD);
  const y2 = Y0 - m.k * m.v2.amp * Math.cos(th - m.v2.lagDeg * RAD);
  const yAt = (x: number) => y1 + ((y2 - y1) * (x - B1)) / (B2 - B1);
  const upto = Math.max(1, Math.floor((th / (2 * TWO_PI)) * (N - 1)) + 1);
  const path = (ys: number[], n = ys.length) => ys.slice(0, n).map((y, i) => `${i ? 'L' : 'M'}${m.xs[i].toFixed(1)},${y.toFixed(1)}`).join('');
  const cursor = X0 + ((X1 - X0) * th) / (2 * TWO_PI);
  const unbalance = reveal && ['static', 'couple', 'dynamic', 'resonance'].includes(o.cause);
  const absPhi = Math.abs(m.dphi);
  const shape = absPhi < 30 ? '두 끝이 함께 — 원통형(병진)' : absPhi > 150 ? '두 끝이 반대로 — 원추형(기울기)' : '병진과 기울기가 섞임';

  return (
    <div className="anim-panel" ref={box}>
      <PlayControls clock={clock} speeds={speeds} speed={speed} onSpeed={setSpeed} status={`축 ${(th / TWO_PI).toFixed(2)}바퀴 · ${ROTOR_1X.opRpm} rpm`} />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}
        aria-label={`원판 두 개 로터를 옆에서 본 모습. 두 베어링 수직 1X 위상차 ${Math.round(m.dphi)}°: ${shape}.`}>
        {/* 제자리 중심선 */}
        <line x1={30} y1={Y0} x2={460} y2={Y0} stroke="var(--border)" strokeDasharray="5 4" />
        {/* 축 (끝까지 같은 직선) */}
        <line x1={30} y1={yAt(30)} x2={460} y2={yAt(460)} stroke="var(--text-muted)" strokeWidth="9" strokeLinecap="round" />
        {/* 원판 */}
        {[D1, D2].map((x, i) => {
          const yc = yAt(x);
          const u = m.disks[i];
          const a = th - u.lagDeg * RAD - Math.PI / 2; // 위(수직 센서 쪽)에서 잰 회전각
          const front = Math.sin(a) >= 0;
          const r = 4 + (6 * u.amp) / m.dMax;
          return (
            <g key={x}>
              <ellipse cx={x} cy={yc} rx={RX} ry={RY} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="2" />
              {unbalance && <circle cx={x + RX * Math.sin(a)} cy={yc - RY * Math.cos(a) * 0.86} r={r} fill="var(--status-wip)" opacity={front ? 1 : 0.35} />}
              <text x={x} y={yc + RY + 16} textAnchor="middle" fontSize="12" fill="var(--text-muted)">원판 {i + 1}</text>
            </g>
          );
        })}
        {/* 베어링 + 센서 */}
        {[B1, B2].map((x, i) => {
          const y = i === 0 ? y1 : y2;
          return (
            <g key={x}>
              {/* 베어링 안에서 축이 움직이는 틈(확대) + 받침 */}
              <rect x={x - 16} y={Y0 - AMP - 10} width={32} height={2 * AMP + 20} rx={4} fill="none" stroke="var(--text-muted)" strokeDasharray="4 3" />
              <polygon points={`${x - 18},${Y0 + AMP + 30} ${x + 18},${Y0 + AMP + 30} ${x},${Y0 + AMP + 11}`} fill="var(--border)" stroke="var(--text-muted)" />
              <rect x={x - 5} y={Y0 - AMP - 40} width={10} height={26} fill="var(--surface)" stroke={i === 0 ? 'var(--plot-1)' : 'var(--plot-3)'} strokeWidth="1.5" />
              <line x1={x} y1={Y0 - AMP - 14} x2={x} y2={y - 5} stroke={i === 0 ? 'var(--plot-1)' : 'var(--plot-3)'} strokeWidth="1.2" strokeDasharray="2 3" />
              <text x={x} y={Y0 - AMP - 46} textAnchor="middle" fontSize="12" fill={i === 0 ? 'var(--plot-1)' : 'var(--plot-3)'} fontWeight="600">센서 {i + 1} (수직)</text>
              <text x={x} y={Y0 + AMP + 46} textAnchor="middle" fontSize="12" fill="var(--text-muted)">베어링 {i + 1}</text>
            </g>
          );
        })}

        {/* 오른쪽 띠: 두 센서의 1X (같은 축척) */}
        <text x={X0} y={20} fontSize="12.5" fill="var(--text-muted)">두 센서의 1X (두 바퀴)</text>
        <line x1={X0} y1={TY} x2={X1} y2={TY} stroke="var(--border)" />
        <line x1={X0 + (X1 - X0) / 2} y1={TY - TK - 8} x2={X0 + (X1 - X0) / 2} y2={TY + TK + 8} stroke="var(--text-muted)" strokeDasharray="3 4" opacity="0.5" />
        <path d={path(m.w1)} fill="none" stroke="var(--plot-1)" strokeWidth="1.2" opacity="0.2" />
        <path d={path(m.w2)} fill="none" stroke="var(--plot-3)" strokeWidth="1.2" opacity="0.2" />
        <path d={path(m.w1, upto)} fill="none" stroke="var(--plot-1)" strokeWidth="2.4" />
        <path d={path(m.w2, upto)} fill="none" stroke="var(--plot-3)" strokeWidth="2.4" strokeDasharray="7 4" />
        <line x1={cursor} y1={TY - TK - 8} x2={cursor} y2={TY + TK + 8} stroke="var(--text-muted)" opacity="0.6" />
        <text x={X0} y={H - 30} fontSize="12.5" fill="var(--text-muted)">위상차 (센서 2 − 센서 1) = <tspan fontWeight="700" fill="var(--text)">{Math.round(m.dphi)}°</tspan></text>
        <text x={X0} y={H - 12} fontSize="12.5" fill="var(--text-muted)">{shape}</text>
      </svg>
      <p className="anim-caption">
        축의 위아래 움직임은 두 수직 센서가 읽은 1X를 직선으로 이은 것입니다(강성 로터, 움직임은 크게 그림 — 센서 1 {formatNumber(2e6 * m.v1.amp, 3)} µm p-p, 센서 2 {formatNumber(2e6 * m.v2.amp, 3)} µm p-p).
        {unbalance ? ' 주황 점은 원판의 불평형(무거운 쪽)입니다. 두 원판에서 같은 각이면 축 전체가 같이 들리고(정적), 반대 각이면 한쪽이 들릴 때 다른 쪽이 내려갑니다(커플).' : ''}
        {reveal && o.cause === 'runout' ? ' 런아웃은 축이 실제로 흔들리는 것이 아니라 축 표면의 굴곡을 센서가 읽은 가짜 1X라, 이 그림은 "센서가 읽은 대로" 그린 것입니다.' : ''}
        {!reveal ? ' 맞히기 모드에서는 원판의 불평형 표시를 숨깁니다 — 두 끝이 함께 움직이는지 반대로 움직이는지부터 보세요.' : ''}
      </p>
    </div>
  );
}
