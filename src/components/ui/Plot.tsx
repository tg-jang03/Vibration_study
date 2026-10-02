import { useEffect, useRef, useState } from 'react';
import type { Config, Data, Layout } from 'plotly.js';

/**
 * 플롯 래퍼 (D-010). 랩 코드는 Plotly를 직접 쓰지 않고 이 컴포넌트만 쓴다.
 * 나중에 라이브러리를 바꿔도 이 파일만 고치면 된다.
 */

export interface PlotSeries {
  x: ArrayLike<number>;
  y: ArrayLike<number>;
  name?: string;
  mode?: 'lines' | 'markers' | 'lines+markers';
  /** CSS 색. 생략하면 --plot-1, --plot-2 … 순서 */
  color?: string;
  dash?: 'solid' | 'dash' | 'dot';
  width?: number;
  markerSize?: number;
}

export interface PlotAxis {
  label?: string;
  range?: [number, number];
  log?: boolean;
}

interface PlotProps {
  series: PlotSeries[];
  x?: PlotAxis;
  y?: PlotAxis;
  height?: number;
  /** 화면 낭독기용 그래프 설명 */
  ariaLabel?: string;
}

type PlotlyModule = typeof import('plotly.js-cartesian-dist-min').default;

let plotlyPromise: Promise<PlotlyModule> | undefined;
function loadPlotly(): Promise<PlotlyModule> {
  plotlyPromise ??= import('plotly.js-cartesian-dist-min').then((m) => m.default);
  return plotlyPromise;
}

const PALETTE_SIZE = 4;

function readTheme() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    text: v('--text'),
    muted: v('--text-muted'),
    border: v('--border'),
    surface: v('--surface'),
    palette: Array.from({ length: PALETTE_SIZE }, (_, i) => v(`--plot-${i + 1}`)),
  };
}

function axisLayout(axis: PlotAxis | undefined, theme: ReturnType<typeof readTheme>) {
  return {
    title: axis?.label ? { text: axis.label, font: { color: theme.muted } } : undefined,
    range: axis?.range,
    type: axis?.log ? ('log' as const) : ('linear' as const),
    gridcolor: theme.border,
    zerolinecolor: theme.border,
    linecolor: theme.border,
    tickfont: { color: theme.muted },
    automargin: true,
  };
}

const CONFIG: Partial<Config> = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
};

export default function Plot({ series, x, y, height = 320, ariaLabel }: PlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);

  // 라이트/다크 전환 시 다시 그린다
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setThemeVersion((n) => n + 1);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadPlotly().then((Plotly) => {
      const el = ref.current;
      if (cancelled || !el) return;
      const theme = readTheme();
      const data: Data[] = series.map((s, i) => ({
        type: 'scatter',
        x: s.x as unknown as number[],
        y: s.y as unknown as number[],
        name: s.name,
        mode: s.mode ?? 'lines',
        line: { color: s.color ?? theme.palette[i % PALETTE_SIZE], dash: s.dash, width: s.width ?? 2 },
        marker: { color: s.color ?? theme.palette[i % PALETTE_SIZE], size: s.markerSize ?? 6 },
        hovertemplate: '%{x:.4g}, %{y:.4g}<extra>%{fullData.name}</extra>',
      }));
      const layout: Partial<Layout> = {
        height,
        margin: { l: 56, r: 16, t: 16, b: 48 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: theme.text, family: 'inherit' },
        showlegend: series.length > 1,
        legend: { orientation: 'h', y: 1.12, x: 0 },
        xaxis: axisLayout(x, theme),
        yaxis: axisLayout(y, theme),
        hovermode: 'closest',
      };
      Plotly.react(el, data, layout, CONFIG);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [series, x, y, height, themeVersion]);

  // 언마운트 시 Plotly 정리
  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) loadPlotly().then((Plotly) => Plotly.purge(el));
    };
  }, []);

  return (
    <div className="plot" style={{ minHeight: height }} role="img" aria-label={ariaLabel}>
      {!ready && <p className="plot-loading">그래프 불러오는 중…</p>}
      <div ref={ref} />
    </div>
  );
}
