import { useId } from 'react';
import { niceTicks } from '../../lib/figure';

/**
 * Polar 플롯 (1X 벡터 A∠φ, D-035). Plot 래퍼(Plotly 카테시안 번들)에 극좌표가 없어 SVG로 직접 그린다.
 * 관례 (Contents §3, D-034): 0°는 위(센서 방향), 지연각은 회전 반대 방향으로 커진다 — 기본 회전 반시계 → 지연은 시계 방향.
 * 서버에서도 같은 그림이 나오도록 시간·난수·window를 쓰지 않는다 (I-019).
 */

export interface PolarSeries {
  /** 진폭 (표시 단위, 예: µm pp) */
  amp: ArrayLike<number>;
  /** 위상 지연 [°] */
  lagDeg: ArrayLike<number>;
  name?: string;
  /** CSS 색. 'var(--plot-1)'처럼 테마 변수를 쓴다 */
  color?: string;
  mode?: 'lines' | 'markers' | 'lines+markers';
  width?: number;
  dash?: boolean;
  markerSize?: number;
  /** 마지막 점에 화살촉 (벡터) */
  arrow?: boolean;
  /** 마지막 점 옆 글자 */
  label?: string;
  hideInLegend?: boolean;
}

interface PolarPlotProps {
  series: PolarSeries[];
  /** 바깥 원의 진폭 */
  rMax: number;
  /** 진폭 단위 (눈금 글자) */
  unit?: string;
  /** 축의 회전 방향 (기본 반시계) */
  rotation?: 'ccw' | 'cw';
  /** 화면 낭독기용 설명 */
  ariaLabel?: string;
  /** 그림 최대 폭 [px] */
  maxWidth?: number;
}

const SIZE = 360;
const C = SIZE / 2;
const R = 132;
const DEFAULT_COLORS = ['var(--plot-1)', 'var(--plot-2)', 'var(--plot-3)', 'var(--plot-4)'];
const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

export default function PolarPlot({ series, rMax, unit, rotation = 'ccw', ariaLabel, maxWidth = 440 }: PolarPlotProps) {
  const clipId = `polar-clip-${useId().replace(/:/g, '')}`;
  const dir = rotation === 'ccw' ? 1 : -1;
  const s = R / rMax;
  const xy = (amp: number, lagDeg: number): [number, number] => {
    const a = (lagDeg * Math.PI) / 180;
    return [C + dir * s * amp * Math.sin(a), C - s * amp * Math.cos(a)];
  };
  const rings = niceTicks(0, rMax, 4).filter((v) => v > 0 && v <= rMax + 1e-9);
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
  const legend = series.map((sr, i) => ({ sr, color: sr.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] })).filter((e) => e.sr.name && !e.sr.hideInLegend);

  return (
    <figure className="polar-plot" style={{ margin: '0 auto', width: '100%', maxWidth }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" role="img" aria-label={ariaLabel} style={{ display: 'block', fontSize: 13 }}>
        <defs>
          <clipPath id={clipId}>
            <circle cx={C} cy={C} r={R + 4} />
          </clipPath>
        </defs>
        {spokes.map((deg) => {
          const [x, y] = xy(rMax, deg);
          const [lx, ly] = xy(rMax * 1.13, deg);
          return (
            <g key={deg}>
              <line x1={C} y1={C} x2={x} y2={y} stroke="var(--border)" strokeWidth={deg % 90 === 0 ? 1.2 : 0.8} />
              <text x={lx} y={ly + 4} textAnchor="middle" fill="var(--text-muted)">{`${deg}°`}</text>
            </g>
          );
        })}
        {rings.map((v, i) => (
          <g key={v}>
            <circle cx={C} cy={C} r={v * s} fill="none" stroke="var(--border)" strokeWidth={i === rings.length - 1 ? 1.4 : 0.8} />
            <text x={C + 4} y={C - v * s + 13} fill="var(--text-muted)" fontSize={12}>{i === rings.length - 1 && unit ? `${f1(v)} ${unit}` : f1(v)}</text>
          </g>
        ))}
        <text x={6} y={14} fill="var(--text-muted)">{rotation === 'ccw' ? '회전 ↺' : '회전 ↻'}</text>
        <text x={SIZE - 6} y={14} textAnchor="end" fill="var(--text-muted)">{rotation === 'ccw' ? '지연 ↻' : '지연 ↺'}</text>
        <text x={6} y={SIZE - 6} fill="var(--text-muted)" fontSize={12}>0° = 센서 방향</text>
        <g clipPath={`url(#${clipId})`}>
          {series.map((sr, i) => {
            const color = sr.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            const mode = sr.mode ?? 'lines';
            const pts: ([number, number] | null)[] = Array.from({ length: sr.amp.length }, (_, j) =>
              Number.isFinite(sr.amp[j]) && Number.isFinite(sr.lagDeg[j]) ? xy(sr.amp[j], sr.lagDeg[j]) : null,
            );
            let d = '';
            let pen = false;
            for (const p of pts) {
              if (!p) {
                pen = false;
                continue;
              }
              d += `${pen ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`;
              pen = true;
            }
            const valid = pts.filter((p): p is [number, number] => p !== null);
            const last = valid[valid.length - 1];
            const prev = valid[valid.length - 2];
            let head: string | null = null;
            if (sr.arrow && last && prev) {
              const th = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
              const bx = last[0] - 10 * Math.cos(th);
              const by = last[1] - 10 * Math.sin(th);
              head = `${last[0].toFixed(2)},${last[1].toFixed(2)} ${(bx - 4.5 * Math.sin(th)).toFixed(2)},${(by + 4.5 * Math.cos(th)).toFixed(2)} ${(bx + 4.5 * Math.sin(th)).toFixed(2)},${(by - 4.5 * Math.cos(th)).toFixed(2)}`;
            }
            return (
              <g key={i}>
                {mode !== 'markers' && d && (
                  <path d={d} fill="none" stroke={color} strokeWidth={sr.width ?? 2} strokeDasharray={sr.dash ? '5 4' : undefined} strokeLinejoin="round" />
                )}
                {mode !== 'lines' && valid.map((p, j) => <circle key={j} cx={p[0]} cy={p[1]} r={sr.markerSize ?? 4} fill={color} />)}
                {head && <polygon points={head} fill={color} />}
              </g>
            );
          })}
        </g>
        {series.map((sr, i) => {
          if (!sr.label) return null;
          const n = sr.amp.length - 1;
          if (n < 0 || !Number.isFinite(sr.amp[n])) return null;
          const [x, y] = xy(sr.amp[n], sr.lagDeg[n]);
          const right = x >= C;
          return (
            <text key={`l${i}`} x={x + (right ? 8 : -8)} y={y + (y < C ? -6 : 14)} textAnchor={right ? 'start' : 'end'} fill={sr.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} fontWeight={700}>
              {sr.label}
            </text>
          );
        })}
      </svg>
      {legend.length > 0 && (
        <figcaption style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          {legend.map(({ sr, color }, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width="22" height="10" aria-hidden="true">
                {sr.mode === 'markers' ? (
                  <circle cx="11" cy="5" r="4" fill={color} />
                ) : (
                  <line x1="1" y1="5" x2="21" y2="5" stroke={color} strokeWidth={sr.width ?? 2} strokeDasharray={sr.dash ? '4 3' : undefined} />
                )}
              </svg>
              {sr.name}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
