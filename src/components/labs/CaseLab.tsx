import { useMemo, useState, type ReactNode } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import PolarPlot from '../ui/PolarPlot';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { FAULT_BY_ID } from '../../lib/faults/catalog';
import { CASES, CASE_BY_ID, VIEWS, type CaseDef, type CaseSettings, type ViewId } from '../../lib/cases/cases';
import { DIAG_BY_ID, DIAG_GROUPS, grade, type DiagId } from '../../lib/cases/diagnoses';
import { useLang } from '../ui/lang';
import type { Lang } from '../../i18n';
import { k, makeT } from '../../i18n/lab';
import EN from '../../i18n/en/labs/CaseLab';
import { faultText } from '../../i18n/en/faults';
import { caseText, diagGroupTitle, diagText, levelLabel, markLabel, viewLabel } from '../../i18n/en/cases';
import {
  acquire,
  acquisition,
  caseEnvelope,
  caseSpectrum,
  caseWaveform,
  cascade,
  coastdown,
  ENV_BANDS,
  F_MAX_OPTIONS,
  frequencyMarks,
  impactFrf,
  isProbe,
  LINE_OPTIONS,
  orbit,
  overall,
  phaseTable,
  trend,
  tripTest,
  UNIT_LABEL,
  wrap360,
  type Sensor,
} from '../../lib/cases/engine';

/**
 * LAB-CASE-01 가상 기계 케이스 (P11-1, D-052). 숨은 결함이 있는 가상 기계 11대 —
 * 측정 설정(센서·f_max·라인·AAF)을 고르고, 자료 10종 가운데 필요한 것을 열어 보고, 진단을 제출하면 정답·결정적 증거·오답의 반증이 나온다.
 * 계산: lib/cases/engine.ts(성분 규칙 → 샘플 신호·해석 자료), machines.ts(기계·성분), cases.ts(정답·해설).
 */

const fmt = formatNumber;
const SENSOR_LABEL: Record<Sensor, string> = { H: k('하우징 수평 (H)'), V: k('하우징 수직 (V)'), A: k('하우징 축방향 (A)'), X: k('근접 프로브 X'), Y: k('근접 프로브 Y') };
const MAX_CHOICE = 2;

function peaks(freq: ArrayLike<number>, amp: ArrayLike<number>, n: number, fMin = 2) {
  const out: { f: number; a: number }[] = [];
  for (let k = 1; k < freq.length - 1; k++) if (freq[k] > fMin && amp[k] > amp[k - 1] && amp[k] >= amp[k + 1]) out.push({ f: freq[k], a: amp[k] });
  return out.sort((a, b) => b.a - a.a).slice(0, n);
}

/** 그리기 점이 많으면 구간마다 최소·최대를 남겨 줄인다 (충격 첨두를 잃지 않게) */
function minMaxDecimate(x: ArrayLike<number>, y: ArrayLike<number>, maxPts: number) {
  const n = x.length;
  if (n <= maxPts) return { x: Array.from(x), y: Array.from(y) };
  const bins = Math.floor(maxPts / 2);
  const step = n / bins;
  const ox: number[] = [];
  const oy: number[] = [];
  for (let b = 0; b < bins; b++) {
    const i0 = Math.floor(b * step);
    const i1 = Math.min(n, Math.floor((b + 1) * step));
    let lo = i0;
    let hi = i0;
    for (let i = i0; i < i1; i++) {
      if (y[i] < y[lo]) lo = i;
      if (y[i] > y[hi]) hi = i;
    }
    const [a, c] = lo < hi ? [lo, hi] : [hi, lo];
    ox.push(x[a], x[c]);
    oy.push(y[a], y[c]);
  }
  return { x: ox, y: oy };
}

const markSeries = (marks: { f: number; label: string }[], fMax: number, yMax: number, lang: Lang): PlotSeries[] =>
  marks
    .filter((m) => m.f > 0 && m.f <= fMax)
    .map((m, i) => ({ x: [m.f, m.f], y: [0, yMax], name: `${markLabel(m.label, lang)} ${fmt(m.f, 4)} Hz`, color: 'var(--text-muted)', dash: 'dot' as const, width: 0.8, hideInLegend: i > 0 }));

function OrbitSvg({ x, y, fx, fy, marks, showFiltered }: { x: number[]; y: number[]; fx: number[]; fy: number[]; marks: number[]; showFiltered: boolean }) {
  const tr = makeT(useLang(), EN);
  const S = 300;
  const C = S / 2;
  const R = Math.max(1, ...x.map(Math.abs), ...y.map(Math.abs), ...fx.map(Math.abs), ...fy.map(Math.abs)) * 1.12;
  const sx = (v: number) => C + (v / R) * (C - 14);
  const sy = (v: number) => C - (v / R) * (C - 14);
  const path = (xs: number[], ys: number[]) => xs.map((v, i) => `${i ? 'L' : 'M'}${sx(v).toFixed(1)},${sy(ys[i]).toFixed(1)}`).join('');
  return (
    <svg className="case-orbit" viewBox={`0 0 ${S} ${S}`} role="img" aria-label={tr`오빗: 직접(파랑)과 1X 필터(주황), 키페이저 점`}>
      <line x1={C} y1={8} x2={C} y2={S - 8} stroke="var(--border)" />
      <line x1={8} y1={C} x2={S - 8} y2={C} stroke="var(--border)" />
      <text x={S - 10} y={C - 6} textAnchor="end" fontSize="11" fill="var(--text-muted)">X</text>
      <text x={C + 6} y={16} fontSize="11" fill="var(--text-muted)">Y</text>
      <path d={path(x, y)} fill="none" stroke="var(--plot-1)" strokeWidth="1.3" />
      {showFiltered && <path d={path(fx, fy)} fill="none" stroke="var(--plot-2)" strokeWidth="1.5" strokeDasharray="5 3" />}
      {marks.map((i) => (
        <circle key={i} cx={sx(x[i])} cy={sy(y[i])} r="3.2" fill="var(--text)" />
      ))}
      <text x={10} y={S - 10} fontSize="11" fill="var(--text-muted)">±{fmt(R, 2)} µm · {tr`회전 반시계`}</text>
    </svg>
  );
}

function PhaseView({ c }: { c: CaseDef }) {
  const tr = makeT(useLang(), EN);
  const rows = [1, 2].map((o) => ({ o, t: phaseTable(c.machine, c.sources, o) }));
  const vec = (v: { amp: number; lag: number }) => (v.amp < 0.03 ? `${fmt(v.amp, 2)}` : `${fmt(v.amp, 3)} ∠${Math.round(v.lag)}°`);
  const diff = (a: { amp: number; lag: number }, b: { amp: number; lag: number }) => (a.amp < 0.03 || b.amp < 0.03 ? '—' : `${Math.round(wrap360(b.lag - a.lag))}°`);
  return (
    <>
      <table className="readout-table">
        <caption>{tr`1X·2X 벡터 (하우징 속도 mm/s rms ∠ 지연각, 키페이저 기준)`}</caption>
        <thead>
          <tr>
            <th scope="col">{tr`자리`}</th>
            <th scope="col">H</th>
            <th scope="col">V</th>
            <th scope="col">A</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ o, t }) => [
            <tr key={`${o}h`}>
              <th scope="row">{o}X {tr`이 베어링`}</th>
              <td>{vec(t.here.H)}</td>
              <td>{vec(t.here.V)}</td>
              <td>{vec(t.here.A)}</td>
            </tr>,
            <tr key={`${o}t`}>
              <th scope="row">{o}X {tr`커플링 건너편`}</th>
              <td>{vec(t.there.H)}</td>
              <td>{vec(t.there.V)}</td>
              <td>{vec(t.there.A)}</td>
            </tr>,
            <tr key={`${o}d`}>
              <th scope="row">{o}X {tr`건너편 − 이쪽`}</th>
              <td>{diff(t.here.H, t.there.H)}</td>
              <td>{diff(t.here.V, t.there.V)}</td>
              <td>{diff(t.here.A, t.there.A)}</td>
            </tr>,
          ])}
        </tbody>
      </table>
      <p className="lab-note">
        {tr`수직이 수평보다 늦은 각:`} 1X {diff(rows[0].t.here.H, rows[0].t.here.V)} · 2X {diff(rows[1].t.here.H, rows[1].t.here.V)}.
        {rows[0].t.probe && <> {tr`프로브 1X:`} X {fmt(rows[0].t.probe.X.amp, 3)} µm p-p ∠{Math.round(rows[0].t.probe.X.lag)}° · Y {fmt(rows[0].t.probe.Y.amp, 3)} µm p-p ∠{Math.round(rows[0].t.probe.Y.lag)}°.</>}
      </p>
    </>
  );
}

export default function CaseLab({ lang = 'ko', initialCase = 'c01' }: { lang?: Lang; initialCase?: string }) {
  const tr = makeT(lang, EN);
  const first = CASE_BY_ID[initialCase] ?? CASES[0];
  const [caseId, setCaseId] = useState(first.id);
  const [s, setS] = useState<CaseSettings>(first.settings);
  const [view, setView] = useState<ViewId>('spectrum');
  const [opened, setOpened] = useState<ViewId[]>(['spectrum']);
  const [chosen, setChosen] = useState<DiagId[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showMarks, setShowMarks] = useState(false);
  const [logY, setLogY] = useState(false);
  const [tShow, setTShow] = useState(0.2);
  const [filtered, setFiltered] = useState(true);
  const c0 = CASE_BY_ID[caseId];
  const c = caseText(c0, lang);
  const m = c0.machine;
  const fr = m.rpm / 60;
  const probe = isProbe(s.sensor);
  const unit = probe ? 'disp' : s.unit;
  const acqInfo = acquisition(s);

  const pickCase = (id: string) => {
    const nc = CASE_BY_ID[id];
    setCaseId(id);
    setS(nc.settings);
    setView('spectrum');
    setOpened(['spectrum']);
    setChosen([]);
    setSubmitted(false);
  };
  const set = <K extends keyof CaseSettings>(k: K) => (v: CaseSettings[K]) => setS((q) => ({ ...q, [k]: v }));
  const open = (v: ViewId, patch: Partial<CaseSettings> = {}) => {
    setView(v);
    setOpened((o) => (o.includes(v) ? o : [...o, v]));
    if (Object.keys(patch).length) setS((q) => ({ ...q, ...patch }));
  };

  const acq = useMemo(() => acquire(c.id, m, c.sources, s), [c.id, s.sensor, s.fMax, s.lines, s.aaf]);
  const marks = useMemo(() => frequencyMarks(m), [c.id]);

  const sensorOptions = (m.probes ? (['H', 'V', 'A', 'X', 'Y'] as Sensor[]) : (['H', 'V', 'A'] as Sensor[])).map((v) => ({ value: v, label: tr(SENSOR_LABEL[v]) }));

  // ── 자료마다 그림과 읽음값 ──
  let body: ReactNode;
  let readouts: Readout[] | null = null;
  if (view === 'spectrum') {
    const sp = caseSpectrum(acq, unit, s.fMax);
    const pk = peaks(sp.freq, sp.amp, 4);
    const yMax = Math.max(1e-3, ...Array.from(sp.amp)) * 1.12;
    const series: PlotSeries[] = [...(showMarks ? markSeries(marks, s.fMax, yMax, lang) : []), { x: Array.from(sp.freq), y: Array.from(sp.amp), name: tr`스펙트럼`, color: 'var(--plot-1)', width: 1.1 }];
    body = (
      <>
        <div className="case-view-controls">
          <ParamToggle label={tr`주파수 자리 표시 (구성표로 계산)`} checked={showMarks} onChange={setShowMarks} />
          <ParamToggle label={tr`세로축 로그`} checked={logY} onChange={setLogY} />
        </div>
        <Plot series={series} x={{ label: tr`주파수 [Hz]`, range: [0, s.fMax] }} y={{ label: `[${UNIT_LABEL[unit]}]`, log: logY, range: logY ? undefined : [0, yMax] }} height={260} ariaLabel={tr`스펙트럼`} />
      </>
    );
    readouts = [
      { label: probe ? tr`직접값 (p-p)` : tr`전체값 (RMS, ~${s.fMax} Hz)`, value: overall(acq, unit, s.fMax), unit: probe ? 'µm p-p' : unit === 'acc' ? 'g rms' : 'mm/s rms', sig: 3 },
      ...pk.map((p, i) => ({ label: tr`큰 줄 ${i + 1}: ${fmt(p.f, 5)} Hz (${fmt(p.f / fr, 3)}X)`, value: p.a, unit: UNIT_LABEL[unit], sig: 3 })),
    ];
  } else if (view === 'waveform') {
    const w = caseWaveform(acq, unit, Math.min(tShow, acqInfo.T));
    const d = minMaxDecimate(w.t, w.y, 6000);
    body = (
      <>
        <div className="case-view-controls">
          <ParamSelect label={tr`보이는 길이`} value={tShow} options={[{ value: 0.05, label: '50 ms' }, { value: 0.2, label: '200 ms' }, { value: 0.5, label: '500 ms' }]} onChange={setTShow} />
        </div>
        <Plot series={[{ x: d.x, y: d.y, name: tr`파형`, color: 'var(--plot-1)', width: 1 }]} x={{ label: tr`시각 [ms]`, range: [0, Math.min(tShow, acqInfo.T) * 1000] }} y={{ label: unit === 'disp' ? '[µm]' : unit === 'acc' ? '[g]' : '[mm/s]' }} height={240} ariaLabel={tr`시간 파형`} />
      </>
    );
    readouts = [
      { label: tr`첨두 (|최대|)`, value: w.peak, unit: unit === 'disp' ? 'µm' : unit === 'acc' ? 'g' : 'mm/s', sig: 3 },
      { label: 'RMS', value: w.rms, unit: unit === 'disp' ? 'µm' : unit === 'acc' ? 'g' : 'mm/s', sig: 3 },
      { label: tr`크레스트 팩터`, value: w.crest, sig: 3 },
      { label: probe ? tr`변위 첨도` : tr`가속도 첨도 (정규 잡음 = 3)`, value: w.kurt, sig: 3 },
    ];
  } else if (view === 'envelope') {
    const band = ENV_BANDS[s.band];
    const fShow = Math.min(1000, Math.max(200, 8 * fr));
    const e = probe ? null : caseEnvelope(acq, band, fShow, s.fMax, s.aaf);
    const env = e && peaks(e.freq, e.amp, 3, 3);
    const yMax = e ? Math.max(1e-4, ...Array.from(e.amp).slice(3)) * 1.15 : 1;
    body = (
      <>
        <div className="case-view-controls">
          <ParamSelect label={tr`엔벨로프 대역 (대역 통과 → 포락선)`} value={s.band} options={ENV_BANDS.map((b, i) => ({ value: i, label: `${b[0]} ~ ${b[1]} Hz` }))} onChange={set('band')} />
          <ParamToggle label={tr`주파수 자리 표시`} checked={showMarks} onChange={setShowMarks} />
        </div>
        {probe ? (
          <p className="case-msg">{tr`엔벨로프는 하우징 가속도계(H·V·A)로 봅니다. 센서를 바꾸세요.`}</p>
        ) : !e ? (
          <p className="case-msg">
            {band[0]} ~ {band[1]} Hz {tr`대역은 지금 측정 범위 밖입니다`} (f_max {s.fMax} Hz{s.aaf ? tr`, AAF 켬` : `, f_s/2 = ${fmt(acqInfo.fs / 2, 4)} Hz`}). {tr`f_max를 올리거나 낮은 대역을 고르세요.`}
          </p>
        ) : (
          <Plot series={[...(showMarks ? markSeries(marks, fShow, yMax, lang) : []), { x: Array.from(e.freq), y: Array.from(e.amp), name: tr`엔벨로프`, color: 'var(--plot-2)', width: 1.2 }]} x={{ label: tr`주파수 [Hz]`, range: [0, fShow] }} y={{ label: '[g]', range: [0, yMax] }} height={240} ariaLabel={tr`엔벨로프 스펙트럼`} />
        )}
      </>
    );
    readouts = env ? env.map((p, i) => ({ label: tr`큰 줄 ${i + 1}: ${fmt(p.f, 4)} Hz (${fmt(p.f / fr, 3)}X)`, value: p.a, unit: 'g', sig: 3 })) : null;
  } else if (view === 'phase') {
    body = <PhaseView c={c0} />;
  } else if (view === 'orbit') {
    const o = orbit(m, c.sources);
    body = o ? (
      <>
        <div className="case-view-controls">
          <ParamToggle label={tr`1X 필터 오빗 겹쳐 보기 (주황 점선)`} checked={filtered} onChange={setFiltered} />
        </div>
        <OrbitSvg x={o.direct.x} y={o.direct.y} fx={o.filtered.x} fy={o.filtered.y} marks={o.marks} showFiltered={filtered} />
        <p className="lab-note">{tr`운전점에서 6바퀴. 검은 점 = 한 바퀴마다 키페이저가 찍힌 자리.`}</p>
      </>
    ) : (
      <p className="case-msg">{tr`이 기계에는 근접 프로브가 없습니다 (구성표 참고). 오빗은 근접 프로브 X·Y로 그립니다.`}</p>
    );
  } else if (view === 'bode') {
    const cd = coastdown(m, c.sources, s.sensor);
    const pts = probe && s.compensate ? cd.compensated : cd.raw;
    const u = probe ? 'µm p-p' : 'mm/s rms';
    const iMax = pts.reduce((b, p, k) => (p.amp > pts[b].amp ? k : b), 0);
    body = (
      <>
        <div className="case-view-controls">
          <ParamToggle label={tr`slow roll 벡터 빼기 (${cd.slowRoll.rpm} rpm)`} checked={s.compensate} disabled={!probe} hint={probe ? undefined : tr`근접 프로브에서만`} onChange={set('compensate')} />
        </div>
        <Plot series={[{ x: cd.rpm, y: pts.map((p) => p.amp), name: tr`1X 크기`, color: 'var(--plot-1)', mode: 'lines+markers', markerSize: 4 }]} x={{ label: tr`회전수 [rpm]`, range: [0, m.rpm * 1.02] }} y={{ label: `1X [${u}]` }} height={220} ariaLabel={tr`코스트다운 1X 크기`} />
        <Plot series={[{ x: cd.rpm, y: pts.map((p) => p.lag), name: tr`1X 지연각`, color: 'var(--plot-2)', mode: 'lines+markers', markerSize: 4 }]} x={{ label: tr`회전수 [rpm]`, range: [0, m.rpm * 1.02] }} y={{ label: tr`지연각 [°]`, range: [0, 360] }} height={190} ariaLabel={tr`코스트다운 1X 위상`} />
        <p className="lab-note">{tr`운전 회전수에서 전원(또는 증기)을 끊고 내려오며 잰 1X`} ({tr(SENSOR_LABEL[s.sensor])}).</p>
      </>
    );
    readouts = [
      { label: `slow roll 1X (${cd.slowRoll.rpm} rpm)`, value: cd.slowRoll.amp, unit: u, sig: 3 },
      { label: tr`가장 큰 1X의 회전수`, value: cd.rpm[iMax], unit: 'rpm', sig: 4 },
      { label: tr`그 1X 크기`, value: pts[iMax].amp, unit: u, sig: 3 },
      { label: tr`운전점 1X`, value: pts.at(-1)!.amp, unit: u, sig: 3 },
    ];
  } else if (view === 'cascade') {
    const cs = cascade(m, c.sources, s.sensor, s.fMax);
    const zMax = Math.max(...cs.z.map((row) => Math.max(...row)));
    const orderLine = (k: number, label: string): PlotSeries => ({ x: cs.rpm.map((r) => (k * r) / 60), y: cs.rpm, name: label, color: 'var(--text-muted)', dash: 'dot', width: 1 });
    body = (
      <>
        <Plot series={[orderLine(1, '1X'), orderLine(0.5, '½X'), orderLine(2, '2X')]} heatmap={{ x: cs.freq, y: cs.rpm, z: cs.z, zRange: [zMax - 50, zMax], colorLabel: 'dB' }} x={{ label: tr`주파수 [Hz]`, range: [0, s.fMax] }} y={{ label: tr`회전수 [rpm]` }} height={360} ariaLabel={tr`기동 캐스케이드`} />
        <p className="lab-note">{tr`기동하며 회전수마다 잰 스펙트럼을 색으로 쌓았습니다 (진할수록 큼, 가장 큰 값 아래 50 dB까지). 점선은 1X·½X·2X 자리.`}</p>
      </>
    );
  } else if (view === 'trend') {
    const trd = trend(m, c.sources, s.sensor);
    const u = probe ? 'µm p-p' : 'mm/s rms';
    const rMax = Math.max(...trd.hourly.map((p) => p.amp)) * 1.15;
    body = (
      <>
        <Plot
          series={[
            { x: trd.days, y: trd.daily.map((p) => p.amp), name: '1X', color: 'var(--plot-1)', mode: 'lines+markers', markerSize: 4 },
            ...(probe ? [] : [{ x: trd.days, y: trd.daily.map((p) => p.overall), name: tr`전체값 (~1 kHz)`, color: 'var(--plot-3)', mode: 'lines+markers' as const, markerSize: 4 }]),
          ]}
          x={{ label: tr`날 (오늘 = 0)`, range: [-30.5, 0.5] }}
          y={{ label: `[${u}]` }}
          height={200}
          ariaLabel={tr`30일 추세`}
        />
        <Plot series={[{ x: trd.hours, y: trd.hourly.map((p) => p.amp), name: tr`1X 크기`, color: 'var(--plot-1)', mode: 'lines+markers', markerSize: 3 }]} x={{ label: tr`시간 [h] (지금 = 0)`, range: [-12.2, 0.2] }} y={{ label: `1X [${u}]` }} height={180} ariaLabel={tr`12시간 1X 크기`} />
        <PolarPlot series={[{ amp: trd.hourly.map((p) => p.amp), lagDeg: trd.hourly.map((p) => p.lag), name: tr`12시간 1X 벡터 (10분 간격)`, color: 'var(--plot-1)', mode: 'lines+markers', markerSize: 3, arrow: true, label: tr`지금` }]} rMax={rMax} unit={probe ? 'µm' : 'mm/s'} ariaLabel={tr`12시간 1X 벡터 Polar`} maxWidth={340} />
      </>
    );
  } else if (view === 'trip') {
    const tt = tripTest(m, c.sources, s.sensor);
    const u = probe ? 'µm p-p' : 'mm/s rms';
    body = tt ? (
      <>
        <p className="lab-note">{tt.kind === 'field' ? tr`t = 0에 회전수를 그대로 둔 채 계자 전류를 끊습니다.` : tr`t = 0에 전동기 전원을 끊습니다. 회전수는 서서히 내려갑니다.`} {tr`운전점에서 큰 줄 넷을 따라갑니다(회전수에 묶인 줄은 회전수를 따라 자리를 옮깁니다).`}</p>
        <Plot series={tt.series.map((q, i) => ({ x: tt.t, y: q.y, name: tr`${fmt(q.f0, 5)} Hz 줄`, color: `var(--plot-${(i % 4) + 1})` }))} x={{ label: tr`시각 [s]`, range: [-2, 10] }} y={{ label: `[${u}]` }} height={240} ariaLabel={tr`차단 시험: 줄마다 크기`} />
        <Plot series={[{ x: tt.t, y: tt.rpm, name: tr`회전수`, color: 'var(--text-muted)' }]} x={{ label: tr`시각 [s]`, range: [-2, 10] }} y={{ label: '[rpm]', range: [0, m.rpm * 1.1] }} height={150} ariaLabel={tr`차단 시험: 회전수`} />
      </>
    ) : (
      <p className="case-msg">{tr`이 기계는 증기터빈으로 돌아 전동기·발전기가 없습니다. 전원·계자 차단 시험을 할 수 없습니다.`}</p>
    );
  } else {
    const fTop = Math.min(1000, Math.max(200, 4 * fr));
    const fi = impactFrf(m, fTop);
    const yMax = Math.max(...fi.H, ...fi.V, ...fi.A) * 2;
    body = (
      <>
        <Plot
          series={[
            ...markSeries([{ f: fr, label: '1X' }, { f: 2 * fr, label: '2X' }], fTop, yMax, lang),
            { x: Array.from(fi.freq), y: Array.from(fi.H), name: 'H', color: 'var(--plot-1)' },
            { x: Array.from(fi.freq), y: Array.from(fi.V), name: 'V', color: 'var(--plot-2)' },
            { x: Array.from(fi.freq), y: Array.from(fi.A), name: 'A', color: 'var(--plot-3)' },
          ]}
          x={{ label: tr`주파수 [Hz]`, range: [0, fTop] }}
          y={{ label: tr`가속도 FRF [(m/s²)/N]`, log: true }}
          height={250}
          ariaLabel={tr`정지 임팩트 시험 FRF`}
        />
        <p className="lab-note">{tr`기계를 세운 상태에서 측정 베어링 하우징을 망치로 쳐서 잰 가속도 FRF(P9-1). 점선은 운전 회전수의 1X·2X 자리.`}</p>
      </>
    );
  }

  const result = submitted ? grade(c.truth, chosen.filter((d) => !(c.alsoOk ?? []).includes(d))) : null;
  const gradeKind = result ? (result.exact ? 'exact' : result.hit.length > 0 ? 'partial' : 'wrong') : null;
  const toggleDiag = (d: DiagId) => setChosen((q) => (q.includes(d) ? q.filter((x) => x !== d) : q.length >= MAX_CHOICE ? q : [...q, d]));

  return (
    <LabFrame
      id="LAB-CASE-01"
      lang={lang}
      title={tr`가상 기계 케이스: 숨은 결함 찾기`}
      controls={
        <>
          <ParamSelect label={tr`케이스`} value={caseId} options={CASES.map((cs, i) => ({ value: cs.id, label: `${i + 1}. ${caseText(cs, lang).title}` }))} onChange={pickCase} />
          <ParamSelect label={tr`센서`} value={s.sensor} options={sensorOptions} onChange={(v) => setS((q) => ({ ...q, sensor: v, unit: isProbe(v) ? 'disp' : q.unit === 'disp' ? 'vel' : q.unit }))} />
          <ParamSelect label="f_max (f_s = 2.56 f_max)" value={s.fMax} options={F_MAX_OPTIONS.map((v) => ({ value: v, label: `${v} Hz` }))} onChange={set('fMax')} />
          <ParamSelect label={tr`라인 수 (Δf = f_max / 라인)`} value={s.lines} options={LINE_OPTIONS.map((v) => ({ value: v, label: `${v}` }))} onChange={set('lines')} />
          <ParamToggle label={tr`AAF (앨리어싱 방지 필터)`} checked={s.aaf} onChange={set('aaf')} />
          <ParamSelect label={tr`단위`} value={unit} disabled={probe} options={probe ? [{ value: 'disp' as const, label: tr`변위 µm p-p (프로브)` }] : [{ value: 'vel' as const, label: tr`속도 mm/s rms` }, { value: 'acc' as const, label: tr`가속도 g rms` }]} onChange={(v) => setS((q) => ({ ...q, unit: v }))} />
        </>
      }
      tasks={[
        {
          question: tr`케이스 1에서 보고된 설정의 스펙트럼과 1X·2X 위상 표를 보세요. 1X 말고 큰 줄이 있나요? 수직은 수평보다 몇 도 늦나요?`,
          answer: tr`1X(29.75 Hz)가 H 5.2 mm/s로 거의 전부이고 나머지 줄은 0.4 mm/s 아래입니다. 수직이 수평보다 88° 늦어 축과 함께 도는 힘(불평형)의 모양입니다. 30일 추세가 2.5 → 5.2 mm/s로 꾸준히 커졌습니다.`,
        },
        {
          question: tr`케이스 2에서 f_max 1 kHz 그대로 엔벨로프를 열면 무엇이 보이나요? 무엇을 바꿔야 하나요?`,
          answer: tr`1 kHz에서는 300 ~ 900 Hz 대역만 고를 수 있고, 거기에는 BPFO가 없습니다. f_max를 5 kHz로 올리고 2.5 ~ 4.5 kHz 대역(하우징 공진)을 고르면 212.5 Hz(BPFO)와 하모닉이 섭니다.`,
        },
        {
          question: tr`케이스 9에서 라인 수를 400 → 1600으로, f_max를 200 Hz로 바꾸면 120 Hz 근처는 어떻게 보이나요?`,
          answer: tr`Δf가 2.5 → 0.125 Hz로 줄어 119.33 Hz(2X) 1.3 mm/s와 120.00 Hz(2×LF) 2.7 mm/s 두 줄로 갈라집니다. 전원 차단 시험에서 120.00 Hz만 곧바로 사라집니다.`,
        },
        {
          question: tr`케이스 11에서 AAF를 켜거나 f_max를 200 Hz로 바꾸면 357.5 Hz 줄은 어떻게 되나요?`,
          answer: tr`AAF를 켜면 사라지고, f_max 200 Hz(f_s 512 Hz)에서는 154.75 Hz로 옮겨 갑니다. 진짜 성분은 f_max 5 kHz에서 보이는 2202.75 Hz(GMF)입니다.`,
        },
      ]}
      footer={<p>{tr`모두 가상의 기계입니다(현장 자료 아님). 성분의 크기는 원인 사이의 모양을 비교하려고 고른 설명용 값이며 판정 기준이 아닙니다. 같은 케이스·같은 설정이면 같은 신호가 나옵니다.`}</p>}
    >
      <div className="case-card">
        <span className="case-level">{levelLabel(c.level, lang)}</span>
        <h4>{c.title}</h4>
        <p className="case-report">{c.report}</p>
        <table className="case-spec">
          <tbody>
            <tr>
              <th scope="row">{tr`기계`}</th>
              <td>
                {c.machine.name} {tr`(가상)`} · {m.rpm.toLocaleString('en-US')} rpm = {fmt(fr, 4)} Hz · {tr`전원`} {m.lineHz} Hz
              </td>
            </tr>
            {c.machine.table.map(([label, v]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="case-acq">
        {tr`지금 설정:`} {tr(SENSOR_LABEL[s.sensor])} · f_s {fmt(acqInfo.fs, 5)} Hz · N {acqInfo.n} · Δf {fmt(acqInfo.df, 4)} Hz · T {fmt(acqInfo.T, 4)} s · AAF {s.aaf ? tr`켬` : tr`끔`}
      </p>
      <div className="case-views" role="group" aria-label={tr`볼 자료`}>
        {VIEWS.map((v) => (
          <button key={v} type="button" aria-pressed={view === v} className={opened.includes(v) ? 'seen' : undefined} onClick={() => open(v)}>
            {viewLabel(v, lang)}
          </button>
        ))}
      </div>
      <h4>{viewLabel(view, lang)}</h4>
      {body}
      {readouts && <ReadoutTable caption={tr`읽음값 — ${viewLabel(view, lang)}`} rows={readouts} />}

      <h4>{tr`진단 제출 — 원인을 ${MAX_CHOICE}개까지 고르세요`}</h4>
      <div className="case-diag">
        {DIAG_GROUPS.map((g) => (
          <fieldset key={g.title} disabled={submitted}>
            <legend>{diagGroupTitle(g, lang)}</legend>
            {g.items.map((d) => (
              <label key={d.id}>
                <input type="checkbox" checked={chosen.includes(d.id)} disabled={!chosen.includes(d.id) && chosen.length >= MAX_CHOICE} onChange={() => toggleDiag(d.id)} />
                <span>{diagText(d, lang).label}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <div className="case-actions">
        <button type="button" className="lab-button" disabled={chosen.length === 0 || submitted} onClick={() => setSubmitted(true)}>
          {tr`제출`}
        </button>
        {submitted && (
          <button type="button" className="lab-button" onClick={() => { setChosen([]); setSubmitted(false); }}>
            {tr`다시 풀기`}
          </button>
        )}
        <span className="lab-note">{tr`열어 본 자료`} {opened.length} / {VIEWS.length}</span>
      </div>

      {result && (
        <div className="case-result" data-grade={gradeKind} role="status">
          <h5>{result.exact ? tr`정답입니다.` : result.hit.length > 0 ? tr`일부 맞았습니다.` : tr`정답과 다릅니다.`} {tr`정답:`} {c.truth.map((t) => diagText(DIAG_BY_ID[t], lang).label).join(' + ')}</h5>
          <div>
            <strong>{tr`결정적 증거`}</strong>
            <ul>
              {c.evidence.map((ev, i) => (
                <li key={i}>
                  <b>{viewLabel(ev.view, lang)}</b>
                  <span className="case-seen">{opened.includes(ev.view) ? tr`열어 봄` : tr`아직 안 봄`}</span> — {ev.text}{' '}
                  <button type="button" className="lab-button" onClick={() => open(ev.view, ev.set ?? {})}>
                    {tr`이 자료 보기`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {(result.wrong.length > 0 || result.missed.length > 0) && (
            <div>
              <strong>{tr`고른 것과 놓친 것`}</strong>
              <ul>
                {result.wrong.map((d) => (
                  <li key={d}>
                    <b>{diagText(DIAG_BY_ID[d], lang).label}</b> — {c.traps[d] ?? tr`그 원인이면 "${diagText(DIAG_BY_ID[d], lang).sign}" 모양이 보여야 하는데, 이 케이스의 자료에는 없습니다.`}
                  </li>
                ))}
                {result.missed.map((d) => (
                  <li key={d}>
                    <b>{tr`놓친 것:`} {diagText(DIAG_BY_ID[d], lang).label}</b> — {diagText(DIAG_BY_ID[d], lang).sign} ({tr`자세히`} {DIAG_BY_ID[d].page})
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p>
            <strong>{tr`다음 확인`}</strong> — {c.next}
          </p>
          <div className="fault-cards">
            {c.truth.map((t) => {
              const info = diagText(DIAG_BY_ID[t], lang);
              const f = info.fault ? faultText(FAULT_BY_ID[info.fault], lang) : null;
              return f ? (
                <details key={t} className="fault-card">
                  <summary>
                    <strong>{info.label}</strong>{tr`의 증거 5요소 — 자세히`} {f.page}
                  </summary>
                  <ul>
                    <li><b>{tr`주파수`}</b>: {f.frequency}</li>
                    <li><b>{tr`진폭`}</b>: {f.amplitude}</li>
                    <li><b>{tr`위상`}</b>: {f.phase}</li>
                    <li><b>{tr`방향`}</b>: {f.direction}</li>
                    <li><b>{tr`운전조건`}</b>: {f.condition}</li>
                  </ul>
                </details>
              ) : (
                <details key={t} className="fault-card">
                  <summary>
                    <strong>{info.label}</strong> — {tr`자세히`} {info.page}
                  </summary>
                  <ul>
                    <li>{info.sign}</li>
                  </ul>
                </details>
              );
            })}
          </div>
        </div>
      )}
    </LabFrame>
  );
}
