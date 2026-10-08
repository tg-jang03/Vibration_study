import { useRef, useState, type ReactNode } from 'react';
import { formatNumber } from '../../lib/format';
import { strobeApparentFreq } from '../../lib/dsp/phasor';
import { usePlayClock } from '../ui/hooks';
import PlayControls from '../ui/PlayControls';
import { SvgArrow } from '../ui/PhasorView';

/**
 * LAB-SMP-01의 움직이는 그림 (D-044): 스트로브로 찍은 회전 원판 = 마차 바퀴 효과 = 에일리어싱.
 * 원판은 1초에 f 바퀴(신호 주파수) 돌고, 플래시는 1초에 f_s 번(샘플링 주파수) 터진다.
 * 관례는 PhasorView와 같다: 0° = 위, 반시계, 표시의 높이 = cos(2πft + φ) = 신호 값. 플래시 때의 높이 = 샘플 x[n].
 * 시계는 이 컴포넌트 안에만 있다 (SamplingLab의 Plot은 다시 그리지 않음).
 */

interface StrobeDiskProps {
  freq: number;
  fs: number;
  /** 신호 위상 [rad] */
  phase: number;
}

const W = 720;
const H = 250;
const R = 88;
const REAL = { x: 118, y: 132 };
const STROBE = { x: 352, y: 132 };
const SX0 = 500;
const SX1 = W - 14;
const K = 16; // 오른쪽 띠에 보이는 플래시 수
const TWO_PI = 2 * Math.PI;
const SPEEDS = [
  { label: '플래시 1초에 2번', flashes: 2 },
  { label: '플래시 1초에 5번', flashes: 5 },
  { label: '플래시 1초에 12번', flashes: 12 },
];

/** 0° = 위, 반시계 각 θ → 원 위의 점 */
const rim = (c: { x: number; y: number }, theta: number, r = R): [number, number] => [c.x - r * Math.sin(theta), c.y - r * Math.cos(theta)];

function arcPath(c: { x: number; y: number }, from: number, to: number, r: number): string {
  const [x1, y1] = rim(c, from, r);
  const [x2, y2] = rim(c, to, r);
  const large = Math.abs(to - from) > Math.PI ? 1 : 0;
  // 반시계(θ 증가)는 화면에서 sweep-flag 0
  const sweep = to > from ? 0 : 1;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} ${sweep} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

function Disk({ c, theta, dim, children }: { c: { x: number; y: number }; theta: number; dim?: boolean; children?: ReactNode }) {
  const [tx, ty] = rim(c, theta);
  return (
    <g opacity={dim ? 0.55 : 1}>
      <circle cx={c.x} cy={c.y} r={R} fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
      <line x1={c.x} y1={c.y - R - 8} x2={c.x} y2={c.y + R + 8} stroke="var(--border)" strokeDasharray="4 4" />
      {children}
      <SvgArrow x1={c.x} y1={c.y} x2={tx} y2={ty} color="var(--plot-2)" width={3} />
      <circle cx={tx} cy={ty} r={6} fill="var(--plot-2)" />
      <circle cx={c.x} cy={c.y} r={4} fill="var(--text-muted)" />
    </g>
  );
}

export default function StrobeDisk({ freq, fs, phase }: StrobeDiskProps) {
  const box = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(1);
  const flashesPerSec = SPEEDS[speed].flashes;
  const rate = flashesPerSec / fs;
  const clock = usePlayClock(rate, undefined, box);
  const t = clock.t;

  const theta = (time: number) => TWO_PI * freq * time + phase;
  const n = Math.floor(t * fs + 1e-9);
  const thetaN = (k: number) => theta(k / fs);

  // 실제 원판: 지난 약 두 화면 프레임(1/30 s) 동안 지나간 자리를 흐릿하게 — 너무 빠르면 고리가 된다
  const blurSpan = TWO_PI * freq * (rate / 30);
  const blur = clock.playing && blurSpan > 0.05;
  const lamp = clock.playing && (t - n / fs) / rate < 0.07;

  const app = strobeApparentFreq(freq, fs);
  const step = app / fs; // 플래시마다 겉보기로 도는 바퀴 (−0.5 ~ +0.5)
  const nyquist = Math.abs(Math.abs(app) - fs / 2) < 1e-9;
  const still = Math.abs(app) < 1e-9;
  const verdict = still
    ? '멈춰 보임 (플래시마다 정확히 정수 바퀴)'
    : nyquist
      ? '반 바퀴씩 건너뜀 — 방향을 알 수 없음 (f = f_N)'
      : app > 0
        ? `반시계(실제와 같은 방향)로 1초에 ${formatNumber(app, 4)}바퀴`
        : `시계 방향(거꾸로)으로 1초에 ${formatNumber(-app, 4)}바퀴`;

  // 오른쪽 띠: K개 플래시 창 안에서 지금까지 찍은 높이
  const first = Math.floor(n / K) * K;
  const sx = (k: number) => SX0 + ((SX1 - SX0) * (k - first + 0.5)) / K;
  const samples = Array.from({ length: n - first + 1 }, (_, i) => first + i);
  const sy = (k: number) => STROBE.y - R * Math.cos(thetaN(k));
  const ghosts = [1, 2, 3, 4, 5].map((d) => n - d).filter((k) => k >= 0);
  const [cx, cy] = rim(STROBE, thetaN(n));

  return (
    <div className="anim-panel" ref={box}>
      <PlayControls
        clock={clock}
        speeds={SPEEDS.map((s) => ({ label: s.label, rate: s.flashes / fs }))}
        speed={speed}
        onSpeed={setSpeed}
        status={`플래시 n = ${n} · 실제의 1/${formatNumber(fs / flashesPerSec, 3)}`}
      />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}
        aria-label={`1초에 ${freq}바퀴 도는 원판을 1초에 ${fs}번 플래시로 보면 ${verdict}. 플래시마다 ${formatNumber(step, 3)}바퀴.`}>
        <text x={REAL.x} y={18} textAnchor="middle" fontSize="13" fill="var(--text-muted)">실제 원판 · 1초에 {formatNumber(freq, 4)}바퀴</text>
        <text x={STROBE.x} y={18} textAnchor="middle" fontSize="13" fill="var(--text-muted)">플래시로 본 원판 · 1초에 {formatNumber(fs, 4)}번</text>
        <text x={(SX0 + SX1) / 2} y={18} textAnchor="middle" fontSize="13" fill="var(--text-muted)">플래시 때의 높이 = 샘플 x[n]</text>

        <Disk c={REAL} theta={theta(t)}>
          {blur && (blurSpan >= TWO_PI
            ? <circle cx={REAL.x} cy={REAL.y} r={R - 5} fill="none" stroke="var(--plot-2)" strokeWidth="9" opacity="0.25" />
            : <path d={arcPath(REAL, theta(t) - blurSpan, theta(t), R - 5)} fill="none" stroke="var(--plot-2)" strokeWidth="9" strokeLinecap="round" opacity="0.3" />)}
        </Disk>

        <Disk c={STROBE} theta={thetaN(n)} dim={clock.playing && !lamp}>
          {ghosts.map((k, i) => {
            const [gx, gy] = rim(STROBE, thetaN(k));
            return <circle key={k} cx={gx} cy={gy} r={5 - i * 0.6} fill="var(--plot-2)" opacity={0.55 - i * 0.1} />;
          })}
        </Disk>
        <g transform={`translate(${STROBE.x + R - 4}, ${STROBE.y - R + 2})`}>
          <circle r="9" fill={lamp ? '#facc15' : 'var(--surface)'} stroke="var(--text-muted)" strokeWidth="1.2" />
          {lamp && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} x1={13 * Math.cos((i * Math.PI) / 4)} y1={13 * Math.sin((i * Math.PI) / 4)} x2={18 * Math.cos((i * Math.PI) / 4)} y2={18 * Math.sin((i * Math.PI) / 4)} stroke="#eab308" strokeWidth="2" />
          ))}
        </g>

        {/* 띠: 0 선, 지금까지의 샘플 점과 점을 잇는 옅은 선(겉보기 물결) */}
        <line x1={SX0} y1={STROBE.y} x2={SX1} y2={STROBE.y} stroke="var(--border)" />
        <line x1={SX0} y1={STROBE.y - R} x2={SX0} y2={STROBE.y + R} stroke="var(--border)" />
        <text x={SX0 - 4} y={STROBE.y - R + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)">+1</text>
        <text x={SX0 - 4} y={STROBE.y + R + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)">−1</text>
        <polyline points={samples.map((k) => `${sx(k).toFixed(1)},${sy(k).toFixed(1)}`).join(' ')} fill="none" stroke="var(--plot-2)" strokeWidth="1.2" opacity="0.45" />
        {samples.map((k) => (
          <g key={k}>
            <line x1={sx(k)} y1={STROBE.y} x2={sx(k)} y2={sy(k)} stroke="var(--plot-2)" strokeWidth="1" opacity="0.35" />
            <circle cx={sx(k)} cy={sy(k)} r={k === n ? 5.5 : 4} fill="var(--plot-2)" />
          </g>
        ))}
        <line x1={cx} y1={cy} x2={sx(n)} y2={cy} stroke="var(--text-muted)" strokeWidth="1.1" strokeDasharray="3 4" />
        <text x={SX0} y={H - 6} fontSize="12" fill="var(--text-muted)">n = {first}</text>
        <text x={SX1} y={H - 6} textAnchor="end" fontSize="12" fill="var(--text-muted)">{first + K - 1}</text>
      </svg>
      <p className="anim-caption">
        플래시 사이(1/f_s = {formatNumber(1000 / fs, 3)} ms)에 원판은 {formatNumber(freq / fs, 4)}바퀴 돕니다. 정수 바퀴를 빼면
        플래시마다 <strong>{step > 0 ? '+' : ''}{formatNumber(step, 3)}바퀴</strong> → 겉보기로 <strong>{verdict}</strong>. 흐린 점은 앞선 플래시 5번의 자리입니다.
      </p>
    </div>
  );
}
