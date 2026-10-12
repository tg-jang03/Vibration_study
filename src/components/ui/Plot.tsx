import { useMobileLayout } from './hooks';
import { useUi } from './lang';
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

/** y 구간 띠 (판정 구간 등, P10-1). 계열 아래에 그린다. color는 CSS 색 또는 var(--…) */
export interface PlotBand {
  y0: number;
  y1: number;
  color: string;
  /** 띠 안 오른쪽 위에 쓸 글자 */
  label?: string;
  /** 0~1, 기본 0.14 */
  opacity?: number;
}

interface PlotProps {
  series: PlotSeries[];
  /** 계열 아래에 깔리는 y 구간 띠 (선택) */
  bands?: PlotBand[];
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
    /** 글꼴은 이름으로 넘긴다: 'inherit'이면 Plotly가 폭을 재는 글꼴과 그리는 글꼴(기본 Open Sans → Verdana)이 달라 범례 끝이 잘린다 */
    font: v('--font-sans') || getComputedStyle(document.body).fontFamily,
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

export default function Plot({ series, heatmap, bands, x, y, height = 320, ariaLabel, onRendered }: PlotProps) {
  const t = useUi();
  const ref = useRef<HTMLDivElement>(null);
  const mobile = useMobileLayout();
  const plotHeight = mobile ? Math.min(height, Math.max(220, Math.round(height * 0.78))) : height;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [themeVersion, setThemeVersion] = useState(0);
  const onRenderedRef = useRef(onRendered);
  useEffect(() => {
    onRenderedRef.current = onRendered;
  });
  // 축 설정은 보통 매 렌더 새 객체로 넘어오므로 내용으로 비교한다
  const xKey = JSON.stringify(x ?? {});
  const yKey = JSON.stringify(y ?? {});
  const bandsKey = JSON.stringify(bands ?? []);

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
        height: plotHeight,
        margin: { l: 56, r: 16, t: 16, b: 48 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: theme.text, family: theme.font },
        showlegend: series.filter((s) => !s.hideInLegend).length > 1,
        legend: { orientation: 'h', y: 1.12, x: 0 },
        bargap: 0.4,
        barmode: 'overlay',
        xaxis: { ...axisLayout(x, theme), ...(mobile ? { nticks: 4 } : {}) },
        yaxis: { ...axisLayout(y, theme), ...(mobile ? { nticks: 4 } : {}) },
        hovermode: 'closest',
      };
      if (bands?.length) {
        layout.shapes = bands.map((b) => ({
          type: 'rect' as const, xref: 'paper' as const, yref: 'y' as const, x0: 0, x1: 1, y0: b.y0, y1: b.y1,
          fillcolor: theme.resolve(b.color), opacity: b.opacity ?? 0.14, line: { width: 0 }, layer: 'below' as const,
        }));
        layout.annotations = bands.filter((b) => b.label).map((b) => ({
          xref: 'paper' as const, yref: 'y' as const, x: 1, y: Math.min(b.y1, y?.range?.[1] ?? b.y1), xanchor: 'right' as const, yanchor: 'top' as const,
          text: b.label!, showarrow: false, font: { color: theme.resolve(b.color), size: 12 },
        }));
      }
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
  }, [series, heatmap, bandsKey, xKey, yKey, plotHeight, mobile, themeVersion]);

  // 언마운트 시 Plotly 정리
  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) loadPlotly().then((Plotly) => Plotly.purge(el));
    };
  }, []);

  return (
    <div className="plot" style={{ minHeight: plotHeight }} role="img" aria-label={ariaLabel}>
      {status === 'loading' && <p className="plot-loading">{t.plotLoading}</p>}
      {status === 'error' && <p className="plot-loading">{t.plotError}</p>}
      <div ref={ref} />
    </div>
  );
}
