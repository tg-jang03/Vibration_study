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
  /** 'bar'면 막대 (스펙트럼 bin, 곱의 부호 등). 기본 'line' */
  kind?: 'line' | 'bar';
  /** 막대 폭 (x축 단위). 생략하면 자동 */
  barWidth?: number;
  /** 0~1 */
  opacity?: number;
  /** 범례에서 숨기기 */
  hideInLegend?: boolean;
}

export interface PlotAxis {
  label?: string;
  range?: [number, number];
  log?: boolean;
}

/** 색 지도 (스펙트로그램, P5-2). x·y는 칸 가운데, z[j][i]는 y j번째 · x i번째 값 */
export interface PlotHeatmap {
  x: ArrayLike<number>;
  y: ArrayLike<number>;
  z: ArrayLike<number>[];
  zRange?: [number, number];
  /** 색 막대 제목 (예: 'dB') */
  colorLabel?: string;
  name?: string;
}

interface PlotProps {
  series: PlotSeries[];
  /** 계열 아래에 깔리는 색 지도 (선택) */
  heatmap?: PlotHeatmap;
  x?: PlotAxis;
  y?: PlotAxis;
  height?: number;
  /** 화면 낭독기용 그래프 설명 */
  ariaLabel?: string;
  /** 그리기가 끝날 때마다 걸린 시간 [ms]을 알려준다 (성능 측정용) */
  onRendered?: (ms: number) => void;
}

type PlotlyModule = typeof import('plotly.js-cartesian-dist-min').default;

let plotlyPromise: Promise<PlotlyModule> | undefined;
function loadPlotly(): Promise<PlotlyModule> {
  plotlyPromise ??= import('plotly.js-cartesian-dist-min')
    .then((m) => m.default)
    .catch((err: unknown) => {
      plotlyPromise = undefined; // 다음 렌더에서 다시 시도
      throw err;
    });
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
    /** 'var(--plot-2)'처럼 CSS 변수로 준 색을 실제 색으로 (Plotly는 var()를 모른다). 그 밖의 색은 그대로 */
    resolve: (color: string) => {
      const m = /^var\((--[\w-]+)\)$/.exec(color.trim());
      return m ? v(m[1]) || color : color;
    },
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

export default function Plot({ series, heatmap, x, y, height = 320, ariaLabel, onRendered }: PlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [themeVersion, setThemeVersion] = useState(0);
  const onRenderedRef = useRef(onRendered);
  useEffect(() => {
    onRenderedRef.current = onRendered;
  });
  // 축 설정은 보통 매 렌더 새 객체로 넘어오므로 내용으로 비교한다
  const xKey = JSON.stringify(x ?? {});
  const yKey = JSON.stringify(y ?? {});

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
      const data: Data[] = series.map((s, i): Data => {
        const color = s.color ? theme.resolve(s.color) : theme.palette[i % PALETTE_SIZE];
        const common = {
          x: s.x as unknown as number[],
          y: s.y as unknown as number[],
          name: s.name,
          opacity: s.opacity,
          showlegend: s.hideInLegend ? false : undefined,
          hovertemplate: '%{x:.4g}, %{y:.4g}<extra>%{fullData.name}</extra>',
        };
        if (s.kind === 'bar') {
          return { ...common, type: 'bar', width: s.barWidth, marker: { color } };
        }
        return {
          ...common,
          type: 'scatter',
          mode: s.mode ?? 'lines',
          line: { color, dash: s.dash, width: s.width ?? 2 },
          marker: { color, size: s.markerSize ?? 6 },
        };
      });
      if (heatmap) {
        data.unshift({
          type: 'heatmap',
          x: Array.from(heatmap.x),
          y: Array.from(heatmap.y),
          z: heatmap.z.map((row) => Array.from(row)),
          zmin: heatmap.zRange?.[0],
          zmax: heatmap.zRange?.[1],
          name: heatmap.name,
          colorscale: [
            [0, theme.surface],
            [1, theme.palette[0]],
          ],
          colorbar: { title: { text: heatmap.colorLabel ?? '' }, thickness: 12, tickfont: { color: theme.muted } },
          hovertemplate: '%{x:.4g}, %{y:.4g}: %{z:.3g}<extra></extra>',
        } as Data);
      }
      const layout: Partial<Layout> = {
        height,
        margin: { l: 56, r: 16, t: 16, b: 48 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: theme.text, family: 'inherit' },
        showlegend: series.filter((s) => !s.hideInLegend).length > 1,
        legend: { orientation: 'h', y: 1.12, x: 0 },
        bargap: 0.4,
        barmode: 'overlay',
        xaxis: axisLayout(x, theme),
        yaxis: axisLayout(y, theme),
        hovermode: 'closest',
      };
      const start = performance.now();
      void Plotly.react(el, data, layout, CONFIG).then(() => {
        if (!cancelled) onRenderedRef.current?.(performance.now() - start);
      });
      setStatus('ready');
    }).catch((err: unknown) => {
      console.error('[Plot] 플롯 라이브러리를 불러오지 못했습니다', err);
      if (!cancelled) setStatus('error');
    });
    return () => {
      cancelled = true;
    };
    // x, y는 xKey, yKey(내용)로 비교한다
  }, [series, heatmap, xKey, yKey, height, themeVersion]);

  // 언마운트 시 Plotly 정리
  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) loadPlotly().then((Plotly) => Plotly.purge(el));
    };
  }, []);

  return (
    <div className="plot" style={{ minHeight: height }} role="img" aria-label={ariaLabel}>
      {status === 'loading' && <p className="plot-loading">그래프 불러오는 중…</p>}
      {status === 'error' && <p className="plot-loading">그래프를 불러오지 못했습니다. 페이지를 새로고침해 주세요.</p>}
      <div ref={ref} />
    </div>
  );
}
