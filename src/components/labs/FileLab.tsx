import { useEffect, useId, useMemo, useState, type ChangeEvent } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { kurtogramGrid } from '../../lib/dsp/envelope';
import { averagedSpectrum, bestBand, DEFECT_TOL_PCT, defectLines, envelope, envelopeSpan, MIN_BAND_HARMONICS, QUIET_RATIO, recordLength, scoreDefects, spectrumFrame, stats, takeRecord } from '../../lib/datafile/analysis';
import { EXAMPLE, EXAMPLE_KINDS, EXAMPLE_LABEL, exampleSignal, type ExampleKind } from '../../lib/datafile/example';
import { CWRU_DE, CWRU_FE, datasetSetup, PADERBORN_6203, readDataFile, type BearingFactors, type DataSet } from '../../lib/datafile/index';
import type { Lang } from '../../i18n';
import { k, makeT } from '../../i18n/lab';
import { bearingName, channelName, dataMessage, datasetLabelText, defectLabel, EXAMPLE_LABEL_EN } from '../../i18n/en/datafile';
import EN from '../../i18n/en/labs/FileLab';

/**
 * LAB-DATA-01 내 파일 분석기 (P11-2, D-052). 브라우저 안에서 MAT·WAV·CSV를 열어(서버 전송 없음)
 * 파형·평균 스펙트럼 → Kurtogram 대역 → 엔벨로프 → 베어링 결함 주파수 대조를 한다. 파일이 없으면 합성 예시.
 * 계산: lib/datafile/(파일 읽기·analysis·example), lib/dsp/envelope(Kurtogram).
 */

const fmt = formatNumber;
type BearingKey = 'de' | 'fe' | 'pb' | 'custom';
const BEARINGS: Record<Exclude<BearingKey, 'custom'>, BearingFactors> = { de: CWRU_DE, fe: CWRU_FE, pb: PADERBORN_6203 };
const DEFECT_COLOR: Record<string, string> = { bpfo: 'var(--plot-2)', bpfi: 'var(--plot-3)', ball: 'var(--plot-4)', ftf: 'var(--text-muted)' };

/** 숫자 입력: 지우는 중("")이나 0 이하는 반영하지 않고, 밖에서 값이 바뀌면 따라간다 */
function NumberField({ label, value, step, onChange, hint }: { label: string; value: number; step?: number; onChange: (v: number) => void; hint?: string }) {
  const id = useId();
  const [text, setText] = useState(String(value));
  useEffect(() => setText((t) => (Number(t) === value ? t : String(value))), [value]);
  return (
    <div className="param param-number">
      <label htmlFor={id}>
        <span>{label}</span>
      </label>
      <input
        id={id}
        type="number"
        value={text}
        min={0}
        step={step ?? 'any'}
        onChange={(e) => {
          const t = e.currentTarget.value;
          setText(t);
          const v = Number(t);
          if (t.trim() !== '' && Number.isFinite(v) && v > 0) onChange(v);
        }}
      />
      {hint && <small className="param-hint">{hint}</small>}
    </div>
  );
}

/** 그리기 점이 많으면 구간마다 최소·최대를 남긴다 */
function decimate(x: ArrayLike<number>, y: ArrayLike<number>, maxPts: number) {
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

type Source = { kind: 'example'; ex: ExampleKind } | { kind: 'file'; ds: DataSet; notes: string[] };
const EXAMPLE_NAME: Record<ExampleKind, string> = { normal: k('예시 A'), outer: k('예시 B'), inner: k('예시 C'), ball: k('예시 D'), spiky: k('예시 E') };

export default function FileLab({ lang = 'ko', initialExample = 'outer' }: { lang?: Lang; initialExample?: ExampleKind }) {
  const tr = makeT(lang, EN);
  const [source, setSource] = useState<Source>({ kind: 'example', ex: initialExample });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState(0);
  const [fs, setFs] = useState<number>(EXAMPLE.fs);
  const [rpm, setRpm] = useState<number>(EXAMPLE.rpm);
  const [bearing, setBearing] = useState<BearingKey>('de');
  const [custom, setCustom] = useState<BearingFactors>({ ...CWRU_DE, name: k('직접 입력') });
  const [recLog2, setRecLog2] = useState(17);
  const [bandMode, setBandMode] = useState<'auto' | 'manual'>('auto');
  const [manual, setManual] = useState<[number, number]>([2500, 4500]);
  const [logY, setLogY] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const [unit, setUnit] = useState('g');

  const channels = useMemo(() => {
    if (source.kind === 'file') return source.ds.channels;
    const s = exampleSignal(source.ex);
    return [
      { name: k('구동측 DE (합성)'), data: s.de },
      { name: k('팬측 FE (합성)'), data: s.fe },
    ];
  }, [source]);
  const ch = Math.min(channel, channels.length - 1);
  const data = channels[ch].data;
  const fileName = source.kind === 'file' ? source.ds.fileName : tr`합성 ${tr(EXAMPLE_NAME[source.ex])}`;
  const label = source.kind === 'file' ? datasetLabelText(source.ds.fileName, lang) : tr`${lang === 'en' ? EXAMPLE_LABEL_EN[source.ex] : EXAMPLE_LABEL[source.ex]} (합성, 미끄럼 1 %)`;
  const unitT = tr(unit);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const f = input.files?.[0];
    if (!f) return;
    setLoading(true);
    setError(null);
    try {
      const ds = await readDataFile(f.name, await f.arrayBuffer());
      const set = datasetSetup(ds);
      setSource({ kind: 'file', ds, notes: set ? [...ds.notes, set.note] : ds.notes });
      setChannel(set?.channel ?? 0);
      setFs(set?.fs ?? ds.fs ?? fs);
      if (set) setBearing(set.bearing);
      const r = ds.rpm ?? set?.rpm;
      if (r) setRpm(r);
      setBandMode('auto');
      setShowLabel(false);
      setUnit(ds.format === 'wav' ? k('전체 눈금') : k('파일 단위'));
    } catch (err) {
      setError(dataMessage(err instanceof Error ? err.message : String(err), lang));
    } finally {
      setLoading(false);
      input.value = '';
    }
  };
  const pickExample = (ex: ExampleKind) => {
    setSource({ kind: 'example', ex });
    setChannel(0);
    setFs(EXAMPLE.fs);
    setRpm(EXAMPLE.rpm);
    setBearing('de');
    setUnit('g');
    setShowLabel(false);
    setError(null);
  };

  const maxLog2 = Math.max(10, Math.floor(Math.log2(Math.min(data.length, 1 << 18))));
  const n = recordLength(data.length, 1 << Math.min(recLog2, maxLog2));
  const x = useMemo(() => takeRecord(data, n), [data, n]);
  const st = useMemo(() => stats(x), [x]);
  const fr = rpm / 60;
  const factors = bearing === 'custom' ? custom : BEARINGS[bearing];
  const lines = defectLines(factors, fr);
  const fTop = Math.max(...lines.map((l) => l.f));
  // 순서와 설정은 lib/datafile/analysis의 runPipeline과 같다 (테스트가 과제 숫자를 그쪽으로 고정). 단계마다 따로 기억해 대역만 바꿀 때 다시 계산하지 않는다
  const nfft = spectrumFrame(n);
  const sp = useMemo(() => averagedSpectrum(x, fs, nfft), [x, fs, nfft]);
  const kb = useMemo(() => bestBand(x, fs, MIN_BAND_HARMONICS * fTop), [x, fs, fTop]);
  const band: [number, number] = bandMode === 'auto' ? kb.band : [Math.max(0, Math.min(manual[0], manual[1])), Math.min(fs / 2, Math.max(manual[0], manual[1]))];
  const fShow = envelopeSpan(fTop, fs);
  const env = useMemo(() => envelope(x, fs, band, fShow), [x, fs, band[0], band[1], fShow]);
  const scores = scoreDefects(env.freq, env.amp, lines, fr, DEFECT_TOL_PCT, band[1] - band[0]);
  const kgGrid = useMemo(() => {
    const g = kurtogramGrid(kb.kg, fs, 192);
    const xc = Array.from({ length: g.x.length - 1 }, (_, i) => (g.x[i] + g.x[i + 1]) / 2);
    return { x: xc, y: kb.kg.levels, z: g.z };
  }, [kb, fs]);

  // ── 그림 계열 ──
  const tShow = Math.min(0.1, n / fs);
  const nShow = Math.round(tShow * fs);
  const wave = decimate(Array.from({ length: nShow }, (_, i) => (i / fs) * 1000), x.subarray(0, nShow), 4000);
  const spMax = Math.max(...Array.from(sp.amp).slice(2));
  const bandLines: PlotSeries[] = band.map((f, i) => ({ x: [f, f], y: logY ? [spMax * 1e-5, spMax * 2] : [0, spMax * 1.1], name: tr`엔벨로프 대역`, color: 'var(--plot-2)', dash: 'dash' as const, width: 1.2, hideInLegend: i > 0 }));
  const envMax = Math.max(1e-12, ...Array.from(env.amp).slice(3)) * 1.15;
  const markers: PlotSeries[] = lines.flatMap((l) =>
    [1, 2, 3]
      .filter((h) => h * l.f <= fShow)
      .map((h, i) => ({ x: [h * l.f, h * l.f], y: [0, envMax], name: `${defectLabel(l.label, lang)} ${fmt(l.f, 4)} Hz`, color: DEFECT_COLOR[l.key], dash: 'dot' as const, width: 1, hideInLegend: i > 0 })),
  );
  const ranked = [...scores].sort((a, b) => b.ratio - a.ratio);
  const fsOptions = [...new Set([fs, 12000, 48000, 20000, 25600, 51200, 64000])].sort((a, b) => a - b).map((v) => ({ value: v, label: `${v.toLocaleString('en-US')} Hz` }));
  const recOptions = [14, 15, 16, 17, 18].filter((k) => 2 ** k <= data.length).map((k) => ({ value: k, label: tr`${(2 ** k).toLocaleString('en-US')}점 (${fmt(2 ** k / fs, 3)} s)` }));
  if (recOptions.length === 0) recOptions.push({ value: maxLog2, label: tr`${n}점` });

  return (
    <LabFrame
      id="LAB-DATA-01"
      lang={lang}
      title={tr`내 파일 분석기: 실측 신호에서 베어링 결함 찾기`}
      controls={
        <>
          <ParamSelect label={tr`합성 예시`} value={source.kind === 'example' ? source.ex : ('file' as const)} options={[...EXAMPLE_KINDS.map((k) => ({ value: k, label: tr`합성 ${tr(EXAMPLE_NAME[k])}` })), ...(source.kind === 'file' ? [{ value: 'file' as const, label: tr`내 파일` }] : [])]} onChange={(v) => v !== 'file' && pickExample(v)} hint={tr`어느 예시가 무슨 결함인지는 라벨 보기 전까지 가립니다`} />
          <ParamSelect label={tr`채널`} value={ch} options={channels.map((c, i) => ({ value: i, label: tr`${channelName(tr(c.name), lang)} (${c.data.length.toLocaleString('en-US')}점)` }))} onChange={setChannel} />
          <ParamSelect label={tr`샘플링 주파수 f_s`} value={fs} options={fsOptions} onChange={setFs} hint={source.kind === 'file' && !source.ds.fs ? tr`파일에 f_s가 없습니다 — 받은 곳의 설명대로` : undefined} />
          <NumberField label={tr`회전수 [rpm]`} value={rpm} step={1} onChange={setRpm} hint={source.kind === 'file' && source.ds.rpm ? tr`파일 기록 ${fmt(source.ds.rpm, 4)} rpm` : undefined} />
          <ParamSelect label={tr`베어링 (결함 주파수 배수)`} value={bearing} options={[{ value: 'de' as const, label: bearingName(CWRU_DE.name, lang) }, { value: 'fe' as const, label: bearingName(CWRU_FE.name, lang) }, { value: 'pb' as const, label: bearingName(PADERBORN_6203.name, lang) }, { value: 'custom' as const, label: tr`직접 입력` }]} onChange={setBearing} />
          <ParamSelect label={tr`기록 길이`} value={Math.min(recLog2, Math.max(...recOptions.map((o) => o.value)))} options={recOptions} onChange={setRecLog2} />
          <ParamSelect label={tr`엔벨로프 대역`} value={bandMode} options={[{ value: 'auto' as const, label: tr`Kurtogram이 고른 대역` }, { value: 'manual' as const, label: tr`직접 정하기` }]} onChange={setBandMode} />
          <ParamToggle label={tr`스펙트럼 세로축 로그`} checked={logY} onChange={setLogY} />
        </>
      }
      tasks={[
        {
          question: tr`처음 상태(합성 예시 B, 구동측 DE)에서 위 스펙트럼과 아래 엔벨로프 스펙트럼의 BPFO(107.4 Hz) 자리를 비교하세요.`,
          answer: tr`스펙트럼에서는 106 Hz 근처에 바닥의 3배쯤 되는 작은 줄이 1X보다 낮게 있을 뿐이고, 3 ~ 3.4 kHz에 둔덕이 섭니다. Kurtogram이 고른 1.5 ~ 4.5 kHz 대역의 엔벨로프에서는 106.3 Hz 줄이 바닥의 약 200배로 서고 2·3배가 이어집니다. 계산값보다 1 % 낮은 것은 미끄럼 때문입니다(P7-5). 외륜 결함입니다.`,
        },
        {
          question: tr`대역을 "직접 정하기"로 바꾸고 300 ~ 900 Hz로 두면 엔벨로프는 어떻게 되나요? 2500 ~ 4500 Hz로 두면?`,
          answer: tr`300 ~ 900 Hz로 두면 BPFO 줄의 바닥 대비가 약 200배에서 25배로 줄어듭니다 — 충격이 크게 울리는 공진 대역을 비켜 갔기 때문입니다. 2500 ~ 4500 Hz는 3.2 kHz 공진을 담아 약 210배로 Kurtogram 대역과 비슷합니다. 실제 기록처럼 결함이 약하면 엉뚱한 대역에서는 줄이 아예 묻힙니다.`,
        },
        {
          question: tr`예시 A·C·D를 차례로 열어, 결함 대조 표와 Kurtogram 최고 SK로 각각 무엇인지 판단한 뒤 라벨을 보세요.`,
          answer: tr`A는 최고 SK가 0.04로 충격 대역이 없고 어느 결함 자리도 바닥의 4배를 넘지 않습니다(정상). C는 BPFI(계산 162.2 Hz) 자리 163.2 Hz와 그 양옆 ±1X 측대역(내륜), D는 볼 자리 140.4 Hz와 FTF 11.8 Hz가 섭니다(볼).`,
        },
        {
          question: tr`예시 B에서 채널을 팬측 FE로 바꾸면 무엇이 달라지나요?`,
          answer: tr`결함은 구동측에 있어 FE에는 충격이 약하게 전해지고(합성 예시는 4분의 1), 울리는 공진도 2.2 kHz로 다릅니다. Kurtogram 대역이 1.5 ~ 3 kHz로 옮겨 가고 BPFO 줄의 바닥 대비가 약 200배에서 90배로 줄어듭니다. 결함에 가까운 센서를 쓰는 까닭입니다.`,
        },
        {
          question: tr`예시 E를 여세요. Kurtogram은 어느 대역을 고르고, 결함 대조 표는 무엇을 말하나요? 대역을 직접 2500 ~ 4500 Hz로 두면?`,
          answer: tr`Kurtogram은 5.25 ~ 6 kHz(SK 약 33)를 고르지만, 그 대역의 엔벨로프에는 어느 결함 자리도 바닥의 6배를 넘지 않습니다(안내 문장이 뜹니다). 그 대역의 충격은 베어링과 상관없는 드문 튐이기 때문입니다. 2500 ~ 4500 Hz로 두면 BPFO 자리 106.3 Hz가 바닥의 약 200배로 서서 외륜 결함이 드러납니다. SK가 가장 큰 대역이 늘 결함 대역은 아닙니다.`,
        },
      ]}
      footer={
        <p>
          {tr`파일은 이 브라우저 안에서만 읽습니다(서버로 보내지 않음). 합성 예시는 CWRU 시험대(6205 구동측, 1797 rpm, 12 kHz)를 흉내 낸 가상 신호이며 실제 데이터가 아닙니다. 결함 대조 표는 어느 자리가 바닥 위로 섰는지 보여 줄 뿐, 판정을 대신하지 않습니다.`}
        </p>
      }
    >
      <div className="file-open">
        <label className="lab-button file-open-button">
          {tr`내 파일 열기 (.mat · .wav · .csv · .txt)`}
          <input type="file" accept=".mat,.wav,.csv,.txt" onChange={onFile} />
        </label>
        <span className="lab-note">{loading ? tr`읽는 중…` : tr`지금 자료: ${fileName}`}</span>
      </div>
      {error && <p className="case-msg">{tr`파일을 읽지 못했습니다: ${error}`}</p>}
      {source.kind === 'file' && source.notes.length > 0 && (
        <ul className="lab-note file-notes">
          {source.notes.map((t) => (
            <li key={t}>{dataMessage(t, lang)}</li>
          ))}
        </ul>
      )}
      {bearing === 'custom' && (
        <div className="case-view-controls">
          {(['bpfo', 'bpfi', 'ball', 'ftf'] as const).map((k) => (
            <NumberField key={k} label={tr`${k.toUpperCase()} 배수`} value={custom[k]} onChange={(v) => setCustom((c) => ({ ...c, [k]: v }))} />
          ))}
        </div>
      )}
      {bandMode === 'manual' && (
        <div className="case-view-controls">
          <NumberField label={tr`대역 시작 [Hz]`} value={manual[0]} step={50} onChange={(v) => setManual((m) => [v, m[1]])} />
          <NumberField label={tr`대역 끝 [Hz]`} value={manual[1]} step={50} onChange={(v) => setManual((m) => [m[0], v])} />
        </div>
      )}

      <h4>{tr`1. 파형 (처음 ${fmt(tShow * 1000, 3)} ms)`}</h4>
      <Plot series={[{ x: wave.x, y: wave.y, name: tr`파형`, color: 'var(--plot-1)', width: 1 }]} x={{ label: tr`시각 [ms]`, range: [0, tShow * 1000] }} y={{ label: `[${unitT}]` }} height={180} ariaLabel={tr`파형`} />
      <ReadoutTable
        caption={tr`기록 ${n.toLocaleString('en-US')}점 = ${fmt(n / fs, 3)} s · f_s ${fs.toLocaleString('en-US')} Hz · 1X = ${fmt(fr, 4)} Hz`}
        rows={[
          { label: 'RMS', value: st.rms, unit: unitT, sig: 3 },
          { label: tr`첨도 (정규 잡음 = 3)`, value: st.kurtosis, sig: 3 },
          { label: tr`크레스트 팩터`, value: st.crest, sig: 3 },
        ]}
      />

      <h4>{tr`2. 평균 스펙트럼 (Hann, ${nfft}점 프레임 · 50 % 겹침 · ${sp.frames}번 평균, Δf ${fmt(sp.df, 3)} Hz)`}</h4>
      <Plot series={[...bandLines, { x: Array.from(sp.freq), y: Array.from(sp.amp), name: tr`스펙트럼`, color: 'var(--plot-1)', width: 1 }]} x={{ label: tr`주파수 [Hz]`, range: [0, fs / 2] }} y={{ label: `[${unitT} rms]`, log: logY }} height={220} ariaLabel={tr`평균 스펙트럼`} />

      <h4>{tr`3. Kurtogram — 충격이 가장 두드러진 대역 찾기`}</h4>
      <Plot series={[]} heatmap={{ x: kgGrid.x, y: kgGrid.y, z: kgGrid.z, colorLabel: 'SK' }} x={{ label: tr`주파수 [Hz]`, range: [0, fs / 2] }} y={{ label: tr`레벨 (아래 = 좁은 대역)`, range: [kb.kg.levels.length + 0.5, 0.5] }} height={200} ariaLabel="Kurtogram" />
      <p className="lab-note">
        {tr`최고 SK ${fmt(kb.kg.best.sk, 3)} — 대역 ${fmt(kb.band[0], 4)} ~ ${fmt(kb.band[1], 4)} Hz (레벨 ${kb.kg.best.level}). 대역 폭이 가장 높은 결함 주파수의 ${MIN_BAND_HARMONICS}배(${fmt(MIN_BAND_HARMONICS * fTop, 4)} Hz)보다 좁은 레벨은 보지 않습니다. SK가 0 근처면 충격이 두드러진 대역이 없다는 뜻입니다.`}
        {kb.empty > 0 && tr` 신호가 거의 없는 칸 ${kb.empty}개(평균 밀도보다 40 dB 넘게 낮음 — AAF가 잘라 낸 나이퀴스트 근처 등)는 튀는 값 몇 개로 SK가 부풀므로 0으로 두고 고르지 않았습니다.`}
      </p>

      <h4>{tr`4. 엔벨로프 스펙트럼 (${fmt(band[0], 4)} ~ ${fmt(band[1], 4)} Hz 대역)`}</h4>
      <Plot series={[...markers, { x: Array.from(env.freq), y: Array.from(env.amp), name: tr`엔벨로프`, color: 'var(--plot-1)', width: 1.2 }]} x={{ label: tr`주파수 [Hz]`, range: [0, fShow] }} y={{ label: `[${unitT}]`, range: [0, envMax] }} height={240} ariaLabel={tr`엔벨로프 스펙트럼`} />
      <table className="readout-table">
        <caption>{tr`결함 주파수 대조 — 계산 자리 ± ${DEFECT_TOL_PCT} % 안의 봉우리 ÷ 엔벨로프 바닥(중앙값)`}</caption>
        <thead>
          <tr>
            <th scope="col">{tr`자리`}</th>
            <th scope="col">{tr`계산 [Hz]`}</th>
            <th scope="col">{tr`찾은 봉우리 [Hz]`}</th>
            <th scope="col">{tr`1 · 2 · 3배 바닥 대비`}</th>
            <th scope="col">{tr`± 1X 측대역`}</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((d) => (
            <tr key={d.key}>
              <th scope="row">{defectLabel(d.label, lang)}</th>
              <td>{fmt(d.f, 4)}</td>
              <td>{d.harmonics[0] ? fmt(d.harmonics[0].f, 4) : '—'}</td>
              <td>{d.harmonics.map((h) => fmt(h.ratio, 2)).join(' · ') || '—'}</td>
              <td>{d.key === 'ftf' ? '—' : fmt(d.sideband, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {bandMode === 'auto' && kb.kg.best.sk > 1 && ranked[0].ratio < QUIET_RATIO && (
        <p className="lab-note">
          {tr`Kurtogram이 고른 대역에는 충격이 있는데(SK ${fmt(kb.kg.best.sk, 3)}), 결함 자리 어디에도 바닥의 ${QUIET_RATIO}배 넘는 줄이 서지 않았습니다. SK는 "드물게 튀는 정도"일 뿐, 그 튐이 베어링에서 왔는지는 모릅니다(전기 잡음 등). 스펙트럼의 둔덕을 보고 "엔벨로프 대역 → 직접 정하기"로 다른 대역을 열어 보세요.`}
        </p>
      )}

      <div className="case-view-controls">
        <ParamToggle label={tr`정답 라벨 보기 (먼저 스스로 판단한 뒤)`} checked={showLabel} onChange={setShowLabel} />
      </div>
      {showLabel && (
        <p className="case-msg">
          {label ? tr`라벨: ${label}` : tr`이 파일 이름에서는 라벨을 찾지 못했습니다 (CWRU 다운로드 목록 — 12 kHz 구동측·48 kHz 구동측·12 kHz 팬측·정상 — 의 번호와 Paderborn 파일 이름 규칙만 압니다). 받은 곳의 목록과 비교하세요.`}
        </p>
      )}
    </LabFrame>
  );
}
