import { useMemo, useRef, useState, type ReactNode } from 'react';
import { formatNumber } from '../../lib/format';
import { phasorChain, phasorLength, phasorSignal, type Phasor } from '../../lib/dsp/phasor';
import { usePlayClock } from './hooks';
import PlayControls, { type PlaySpeed } from './PlayControls';

/**
 * 도는 화살표(위상자)와 그 끝의 높이가 그리는 파형 (D-044).
 * 관례: 신호 축은 위(0°), 회전은 반시계 — PolarPlot과 같은 0° = 위. 화살표 끝의 높이 = A cos(2πft + φ) = x(t).
 * 왼쪽: 화살표를 꼬리-머리로 이은 사슬과 각 화살표 끝이 지나는 원. 오른쪽: 0 ~ span 동안 끝의 높이(또는 길이)를 그려 나간다.
 * 시계는 이 컴포넌트 안에 있어서 매 프레임 이 그림만 다시 그린다 (랩 본체의 Plot은 그대로).
 */

export interface PhasorArrow extends Phasor {
  color?: string;
  /** 화살표 끝 옆에 쓸 짧은 이름 */
  label?: string;
}

interface PhasorViewProps {
  arrows: readonly PhasorArrow[];
  /** 비교용 사슬 (회색 점선, 끝의 높이도 점선으로 함께 그린다) */
  ghost?: readonly Phasor[];
  /** 오른쪽 그래프의 시간 폭 [s]. 이 길이를 되풀이한다 */
  span: number;
  /** 원 패널 반지름(100 px)에 해당하는 크기 — 오른쪽 그래프의 세로 눈금도 같다 */
  rMax: number;
  speeds: readonly PlaySpeed[];
  defaultSpeed?: number;
  /** 이 주파수로 같이 돌며 본다 (그 화살표가 멈춰 보임). 0이면 제자리 */
  frameFreq?: number;
  /** 오른쪽에 그릴 값: 끝의 높이 = 신호(기본) 또는 화살표 합의 길이 = 포락선 */
  trace?: 'signal' | 'length';
  /** 신호 그래프에 ± 길이(포락선) 점선을 함께 */
  envelope?: boolean;
  /** 각 화살표 끝이 지나는 원 (기본 켬) */
  circles?: boolean;
  traceColor?: string;
  /** 오른쪽 그래프 이름 */
  traceLabel: string;
  /** 시간 눈금 단위 변환 (기본 s) */
  timeUnit?: { label: string; scale: number };
  ariaLabel: string;
  /** 재생 막대에 더할 조작 */
  children?: ReactNode;
}

const W = 720;
const H = 250;
const CX = 135;
const CY = 125;
const R = 100;
const X0 = 290;
const X1 = W - 14;
const MAX_POINTS = 4000;

/** 복소 평면 (re = 신호 축) → 화면: re는 위, im은 왼쪽 (반시계 회전이 화면에서도 반시계) */
const toScreen = (re: number, im: number, k: number): [number, number] => [CX - im * k, CY - re * k];

/** 화살표 한 개 (선 + 머리). 공용: 스트로브 원판·오빗 그림도 같은 모양을 쓴다 */
export function SvgArrow({ x1, y1, x2, y2, color, width = 2.6, dash, opacity }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number; dash?: string; opacity?: number }) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 0.5) return null;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const h = Math.min(11, 0.4 * len);
  const w = h * 0.55;
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  const head = `${x2.toFixed(1)},${y2.toFixed(1)} ${(bx - uy * w).toFixed(1)},${(by + ux * w).toFixed(1)} ${(bx + uy * w).toFixed(1)},${(by - ux * w).toFixed(1)}`;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={head} fill={color} />
    </g>
  );
}

function maxFreq(arrows: readonly Phasor[], frameFreq: number): number {
  return arrows.reduce((m, a) => Math.max(m, Math.abs(a.freq), Math.abs(a.freq - frameFreq)), 0);
}

export default function PhasorView({
  arrows,
  ghost,
  span,
  rMax,
  speeds,
  defaultSpeed = 0,
  frameFreq = 0,
  trace = 'signal',
  envelope = false,
  circles = true,
  traceColor = 'var(--plot-1)',
  traceLabel,
  timeUnit = { label: 's', scale: 1 },
  ariaLabel,
  children,
}: PhasorViewProps) {
  const box = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(Math.min(defaultSpeed, speeds.length - 1));
  const clock = usePlayClock(speeds[speed]?.rate ?? speeds[0].rate, span, box);
  const k = R / rMax;
  const tm = clock.t % span;

  // 오른쪽 그래프: 한 주기를 16점 이상으로 (상한 MAX_POINTS)
  const curves = useMemo(() => {
    const f = maxFreq(trace === 'signal' ? [...arrows, ...(ghost ?? [])] : arrows, 0);
    const n = Math.min(MAX_POINTS, Math.max(400, Math.ceil(16 * f * span)));
    const xs: number[] = [];
    const main: number[] = [];
    const env: number[] = [];
    const gh: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = (span * i) / (n - 1);
      xs.push(X0 + ((X1 - X0) * i) / (n - 1));
      const len = phasorLength(arrows, t);
      main.push(trace === 'signal' ? phasorSignal(arrows, t) : len);
      if (envelope) env.push(len);
      if (ghost) gh.push(phasorSignal(ghost, t));
    }
    const path = (ys: number[], upto = ys.length) =>
      ys.slice(0, upto).map((y, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)},${(CY - y * k).toFixed(1)}`).join('');
    return { n, main, path, full: path(main), env: envelope ? [path(env), path(env.map((v) => -v))] : null, gh };
  }, [arrows, ghost, span, trace, envelope, k]);

  const upto = Math.max(1, Math.floor((tm / span) * (curves.n - 1)) + 1);
  const chain = phasorChain(arrows, tm, frameFreq).map((p) => toScreen(p.re, p.im, k));
  const ghostChain = ghost ? phasorChain(ghost, tm, frameFreq).map((p) => toScreen(p.re, p.im, k)) : null;
  const [tx, ty] = chain[chain.length - 1];
  const value = trace === 'signal' ? phasorSignal(arrows, tm) : phasorLength(arrows, tm);
  const cursorX = X0 + (X1 - X0) * (tm / span);
  const valueY = CY - value * k;

  // 길이 모드: 끝을 원점 둘레로 돌려 위쪽 축에 옮긴 뒤 가로로 잇는다
  let connector: string;
  if (trace === 'length') {
    const tip = phasorChain(arrows, tm, frameFreq).at(-1)!;
    const sweep = Math.atan2(tip.im, tip.re) > 0 ? 1 : 0;
    const rr = (value * k).toFixed(1);
    connector = `M${tx.toFixed(1)},${ty.toFixed(1)} A${rr},${rr} 0 0 ${sweep} ${CX},${valueY.toFixed(1)} L${cursorX.toFixed(1)},${valueY.toFixed(1)}`;
  } else {
    connector = `M${tx.toFixed(1)},${ty.toFixed(1)} L${cursorX.toFixed(1)},${ty.toFixed(1)}`;
  }

  const ticks = [0, span / 2, span];
  const status = `t = ${(tm * timeUnit.scale).toFixed(timeUnit.scale * span >= 10 ? 2 : 3)} ${timeUnit.label}`;

  return (
    <div className="anim-panel" ref={box}>
      <PlayControls clock={clock} speeds={speeds} speed={speed} onSpeed={setSpeed} status={status}>
        {children}
      </PlayControls>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={ariaLabel} style={{ display: 'block' }}>
        {/* 축: 위 = 신호 축(0°), 가로 = 0 */}
        <line x1={CX} y1={CY - R - 14} x2={CX} y2={CY + R + 14} stroke="var(--border)" strokeDasharray="4 4" />
        <line x1={CX - R - 14} y1={CY} x2={X1} y2={CY} stroke="var(--border)" />
        <text x={CX + 6} y={14} fontSize="13" fill="var(--text-muted)">0°</text>
        <text x={6} y={16} fontSize="13" fill="var(--text-muted)">회전 ↺</text>
        <line x1={X0} y1={CY - R - 10} x2={X0} y2={CY + R + 6} stroke="var(--border)" />
        <text x={X0 + 6} y={16} fontSize="13" fill="var(--text-muted)">{traceLabel}</text>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={X0 + ((X1 - X0) * v) / span} y1={CY + R + 4} x2={X0 + ((X1 - X0) * v) / span} y2={CY + R + 8} stroke="var(--text-muted)" />
            <text x={X0 + ((X1 - X0) * v) / span} y={H - 2} fontSize="12" textAnchor={v === 0 ? 'start' : v === span ? 'end' : 'middle'} fill="var(--text-muted)">
              {`${formatNumber(v * timeUnit.scale, 3)} ${timeUnit.label}`}
            </text>
          </g>
        ))}

        {/* 오른쪽: 미리보기(옅게) → 지금까지 그린 부분 */}
        {curves.env && curves.env.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--text-muted)" strokeWidth="1.3" strokeDasharray="5 4" />)}
        {ghost && curves.gh.length > 0 && <path d={curves.path(curves.gh, upto)} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="6 4" />}
        <path d={curves.full} fill="none" stroke={traceColor} strokeWidth="1.4" opacity="0.18" />
        <path d={curves.path(curves.main, upto)} fill="none" stroke={traceColor} strokeWidth="2.4" />

        {/* 왼쪽: 비교 사슬 → 원 → 화살표 */}
        {ghostChain && ghostChain.slice(1).map(([x, y], i) => (
          <SvgArrow key={`g${i}`} x1={ghostChain[i][0]} y1={ghostChain[i][1]} x2={x} y2={y} color="var(--text-muted)" width={1.6} dash="5 4" />
        ))}
        {circles && arrows.map((a, i) => a.amp * k > 1.5 && (
          <circle key={`c${i}`} cx={chain[i][0]} cy={chain[i][1]} r={a.amp * k} fill="none" stroke={a.color ?? traceColor} strokeWidth="1" opacity="0.35" />
        ))}
        {arrows.map((a, i) => (
          <SvgArrow key={`a${i}`} x1={chain[i][0]} y1={chain[i][1]} x2={chain[i + 1][0]} y2={chain[i + 1][1]} color={a.color ?? traceColor} width={i === 0 ? 3 : 2.2} />
        ))}
        {arrows.map((a, i) => {
          // 이름은 화살표 가운데에서 진행 방향의 오른쪽으로 비켜 쓴다 (짧은 화살표는 생략)
          const len = a.amp * k;
          if (!a.label || len < 18) return null;
          const [x1, y1] = chain[i];
          const [x2, y2] = chain[i + 1];
          const nx = -(y2 - y1) / len;
          const ny = (x2 - x1) / len;
          return (
            <text key={`l${i}`} x={(x1 + x2) / 2 + nx * 13} y={(y1 + y2) / 2 + ny * 13 + 4} fontSize="13" fontWeight="600" textAnchor="middle" fill={a.color ?? traceColor}>{a.label}</text>
          );
        })}

        {/* 끝 → 오른쪽 그래프의 지금 점 */}
        <path d={connector} fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeDasharray="3 4" />
        <line x1={cursorX} y1={CY - R - 10} x2={cursorX} y2={CY + R + 6} stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
        <circle cx={tx} cy={ty} r={5} fill={traceColor} />
        <circle cx={cursorX} cy={valueY} r={5} fill={traceColor} />
      </svg>
    </div>
  );
}
