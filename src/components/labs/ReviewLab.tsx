import { useEffect, useId, useMemo, useState, type ChangeEvent } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import PolarPlot from '../ui/PolarPlot';
import { formatNumber } from '../../lib/format';
import type { Lang } from '../../i18n';
import { k, makeT, type T } from '../../i18n/lab';
import EN from '../../i18n/en/labs/ReviewLab';
import { channelName, dataMessage } from '../../i18n/en/datafile';
import { readDataFile, type DataSet } from '../../lib/datafile/index';
import { RECORDS, REVIEW, reviewRecord, type RecordId } from '../../lib/review/example';
import { detectPulses, repairPulses, speedFromPulses } from '../../lib/review/keyphasor';
import { binByRpm, bodeSummary, cascadeRows, compensate, perRevVectors, slowRollVector, type RevVector } from '../../lib/review/vectors';

/**
 * LAB-REV-01 기동·정지 기록 복기 (P11-3, D-052). 키페이저 + 진동 채널 기록 두 개(합성 예시 또는 내 파일, 브라우저 안에서만)를
 * 펄스 → 회전수 → 회전마다 1X 벡터 → Bode·Polar·캐스케이드로 다시 그려 겹쳐 보고, slow roll 보상·펄스 고치기의 영향을 본다.
 * 계산: lib/review/(keyphasor·vectors·example), 파일 읽기 lib/datafile.
 */

const fmt = formatNumber;
const COLOR: Record<RecordId, string> = { A: 'var(--plot-1)', B: 'var(--plot-2)' };
/** 예시 기록 이름의 영어 사전 키 (D-054). 한국어 화면은 RECORDS[id].label(lib/review/example)을 그대로 쓴다 */
const RECORD_KEY: Record<RecordId, string> = { A: k('기록 A — 1년 전 정지'), B: k('기록 B — 이번 정지') };

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

interface RecordSetup {
  /** null이면 합성 예시 */
  ds: DataSet | null;
  key: number;
  vib: number;
  fs: number;
  /** 진동 채널 1단위 = scale µm */
  scale: number;
  edge: 'falling' | 'rising';
}
const exampleSetup = (): RecordSetup => ({ ds: null, key: 0, vib: 1, fs: REVIEW.fs, scale: 1, edge: 'falling' });

/** 채널 이름이 키페이저처럼 보이나: key·kp·tach·pulse·once·'키페이저'·'펄스'. 한글 두 낱말은 화면 글이 아니라서
 *  문자 코드로 만든다 (번역 검사가 감싸지 않은 한글로 세지 않게) */
const KEY_NAME = new RegExp(['key', 'kp', 'tach', 'pulse', 'once', String.fromCharCode(0xd0a4, 0xd398, 0xc774, 0xc800), String.fromCharCode(0xd384, 0xc2a4)].join('|'), 'i');

/** 키페이저처럼 보이는 채널: 이름으로, 아니면 0번 */
function guessChannels(ds: DataSet): { key: number; vib: number } {
  const k = ds.channels.findIndex((c) => KEY_NAME.test(c.name));
  const key = k >= 0 ? k : 0;
  const vib = ds.channels.findIndex((_, i) => i !== key);
  return { key, vib: vib >= 0 ? vib : key };
}

interface Analysis {
  pulses: Float64Array;
  rawCount: number;
  filled: number;
  removed: number;
  speed: { t: Float64Array; rpm: Float64Array };
  bins: RevVector[];
  comp: RevVector[];
  sr: RevVector | null;
  threshold: number;
  key: Float64Array;
  vib: Float64Array;
  fs: number;
}

function analyse(id: RecordId, s: RecordSetup, o: { repair: boolean; order: number; revs: number; step: number; srLo: number; srHi: number }, tr: T): Analysis | { error: string } {
  const rec = s.ds ? null : reviewRecord(id);
  const key = s.ds ? s.ds.channels[s.key]?.data : rec!.key;
  const vibRaw = s.ds ? s.ds.channels[s.vib]?.data : rec!.x;
  if (!key || !vibRaw) return { error: tr('채널을 고르세요') };
  const vib = s.scale === 1 ? Float64Array.from(vibRaw) : Float64Array.from(vibRaw, (v) => v * s.scale);
  const p = detectPulses(key, s.fs, { edge: s.edge });
  if (p.times.length < 10) return { error: tr`키페이저 펄스를 ${p.times.length}개만 찾았습니다 — 채널·방향(내려감/올라감)·f_s를 확인하세요` };
  const rep = o.repair ? repairPulses(p.times) : { times: p.times, filled: 0, removed: 0 };
  const v = perRevVectors(vib, s.fs, rep.times, o.order, o.revs);
  const bins = binByRpm(v, o.step);
  const sr = slowRollVector(bins, o.srLo, o.srHi);
  return { pulses: rep.times, rawCount: p.times.length, filled: rep.filled, removed: rep.removed, speed: speedFromPulses(rep.times), bins, comp: compensate(bins, sr), sr, threshold: p.threshold, key: Float64Array.from(key), vib, fs: s.fs };
}

export default function ReviewLab({ lang = 'ko' }: { lang?: Lang }) {
  const tr = makeT(lang, EN);
  const [setups, setSetups] = useState<Record<RecordId, RecordSetup>>({ A: exampleSetup(), B: exampleSetup() });
  const [errors, setErrors] = useState<Record<RecordId, string | null>>({ A: null, B: null });
  const [repair, setRepair] = useState(true);
  const [compensateOn, setCompensateOn] = useState(false);
  const [order, setOrder] = useState(1);
  const [revs, setRevs] = useState(1);
  const [step, setStep] = useState(50);
  const [srLo, setSrLo] = useState(200);
  const [srHi, setSrHi] = useState(500);
  const [cascadeOf, setCascadeOf] = useState<RecordId>('B');
  const [cascadeMax, setCascadeMax] = useState(250);
  const [memo, setMemo] = useState('');

  const opts = { repair, order, revs, step, srLo, srHi };
  const res = {
    A: useMemo(() => analyse('A', setups.A, opts, tr), [setups.A, repair, order, revs, step, srLo, srHi]),
    B: useMemo(() => analyse('B', setups.B, opts, tr), [setups.B, repair, order, revs, step, srLo, srHi]),
  };
  const ok = (id: RecordId) => !('error' in res[id]) ? (res[id] as Analysis) : null;
  const ids: RecordId[] = ['A', 'B'];
  const nameOf = (id: RecordId) => (setups[id].ds ? `${id}: ${setups[id].ds!.fileName}` : tr(RECORD_KEY[id]));

  const setSetup = (id: RecordId, patch: Partial<RecordSetup>) => setSetups((q) => ({ ...q, [id]: { ...q[id], ...patch } }));
  const onFile = (id: RecordId) => async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const f = input.files?.[0];
    if (!f) return;
    setErrors((q) => ({ ...q, [id]: null }));
    try {
      const ds = await readDataFile(f.name, await f.arrayBuffer());
      if (ds.channels.length < 2) {
        setErrors((q) => ({ ...q, [id]: tr('키페이저와 진동, 채널이 둘 이상 있어야 합니다') }));
        return;
      }
      const g = guessChannels(ds);
      setSetup(id, { ds, key: g.key, vib: g.vib, fs: ds.fs ?? setups[id].fs, scale: 1 });
    } catch (err) {
      setErrors((q) => ({ ...q, [id]: dataMessage(err instanceof Error ? err.message : String(err), lang) }));
    } finally {
      input.value = '';
    }
  };

  // ── 그림 ──
  const pp = (a: number) => 2 * a; // Peak → p-p (변위)
  const pts = (id: RecordId) => {
    const r = ok(id);
    return r ? (compensateOn ? r.comp : r.bins) : [];
  };
  const ampSeries: PlotSeries[] = ids.flatMap((id) => {
    const p = pts(id);
    return p.length ? [{ x: p.map((q) => q.rpm), y: p.map((q) => pp(q.amp)), name: nameOf(id), color: COLOR[id], mode: 'lines+markers' as const, markerSize: 3 }] : [];
  });
  const lagSeries: PlotSeries[] = ids.flatMap((id) => {
    const p = pts(id);
    return p.length ? [{ x: p.map((q) => q.rpm), y: p.map((q) => q.lag), name: nameOf(id), color: COLOR[id], mode: 'markers' as const, markerSize: 4 }] : [];
  });
  const rpmSeries: PlotSeries[] = ids.flatMap((id) => {
    const r = ok(id);
    if (!r) return [];
    // 점이 많으면 고르게 줄인다 (튐은 그대로 보이도록 최댓값·최솟값 쪽을 남기지는 않지만, 고치지 않으면 튐이 많이 보인다)
    const n = r.speed.t.length;
    const every = Math.max(1, Math.floor(n / 1500));
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < n; i++) {
      const spike = i > 0 && Math.abs(r.speed.rpm[i] / r.speed.rpm[i - 1] - 1) > 0.2;
      if (i % every === 0 || spike) {
        xs.push(r.speed.t[i]);
        ys.push(r.speed.rpm[i]);
      }
    }
    return [{ x: xs, y: ys, name: nameOf(id), color: COLOR[id], width: 1.2 }];
  });
  const maxAmp = Math.max(1, ...ids.flatMap((id) => pts(id).map((q) => pp(q.amp))));
  // 펄스를 고치지 않으면 튄 바퀴가 아주 높은 회전수 칸을 만든다 — 축 범위는 98 % 지점으로
  const maxRpm = Math.max(100, ...ids.map((id) => {
    const b = ok(id)?.bins ?? [];
    return b.length ? b[Math.floor(0.98 * (b.length - 1))].rpm : 0;
  }));

  const casc = useMemo(() => {
    const r = ok(cascadeOf);
    if (!r) return null;
    const c = cascadeRows(r.vib, r.fs, r.pulses, 4096, 70, cascadeMax);
    let zMax = -Infinity;
    const z = c.rows.map((row) => Float64Array.from(row.amp, (a) => {
      const d = 20 * Math.log10(Math.max(2 * a, 1e-3));
      zMax = Math.max(zMax, d);
      return d;
    }));
    return { x: Array.from(c.freq), y: c.rows.map((row) => row.rpm), z, zMax };
  }, [res[cascadeOf], cascadeMax]);

  const summaries = ids.map((id) => {
    const r = ok(id);
    return r ? { id, r, s: bodeSummary(compensateOn ? r.comp : r.bins), top: (compensateOn ? r.comp : r.bins).at(-1)! } : null;
  });
  const cell = (f: (x: NonNullable<(typeof summaries)[number]>) => string) => summaries.map((x, i) => <td key={i}>{x ? f(x) : '—'}</td>);

  // 키페이저 파형 (기록 B, 처음 0.1초): 문턱과 찾은 펄스
  const kp = ok(cascadeOf);
  const kpShow = kp ? Math.min(kp.key.length, Math.round(0.05 * kp.fs)) : 0;

  return (
    <LabFrame
      id="LAB-REV-01"
      lang={lang}
      title={tr`기동·정지 기록 복기: 다시 뽑고 다시 그리기`}
      controls={
        <>
          <ParamToggle label={tr`빠진·남는 키페이저 펄스 고치기`} checked={repair} onChange={setRepair} />
          <ParamToggle label={tr`slow roll 벡터 빼기`} checked={compensateOn} onChange={setCompensateOn} />
          <ParamSelect label={tr`성분`} value={order} options={[{ value: 1, label: '1X' }, { value: 2, label: '2X' }]} onChange={setOrder} />
          <ParamSelect label={tr`벡터 하나에 평균할 바퀴`} value={revs} options={[1, 4, 16].map((v) => ({ value: v, label: tr`${v}바퀴` }))} onChange={setRevs} />
          <ParamSelect label={tr`Bode 회전수 칸`} value={step} options={[25, 50, 100].map((v) => ({ value: v, label: `${v} rpm` }))} onChange={setStep} />
          <NumberField label={tr`slow roll 범위 시작 [rpm]`} value={srLo} step={50} onChange={setSrLo} />
          <NumberField label={tr`slow roll 범위 끝 [rpm]`} value={srHi} step={50} onChange={setSrHi} />
        </>
      }
      tasks={[
        {
          question: tr('처음 상태(잰 그대로)에서 두 기록의 Bode 봉우리를 비교하세요. 당시 판단처럼 "B에서 불평형이 커졌다"고 볼 수 있나요?'),
          answer: tr('잰 그대로는 B 봉우리가 3050 rpm에서 84 µm p-p로 A(3350 rpm, 77 µm)보다 크고, 최고 회전수 1X도 21 → 34 µm p-p로 커 보입니다. 하지만 아직 slow roll을 확인하지 않았습니다.'),
        },
        {
          question: tr('읽음값 표에서 slow roll 1X를 비교한 뒤 "slow roll 벡터 빼기"를 켜세요. 봉우리와 6000 rpm 근처 1X는 어떻게 바뀌나요?'),
          answer: tr('slow roll 1X가 A 3.9 µm, B 24 µm p-p입니다 — B의 프로브 궤도 런아웃이 커졌습니다. 빼면 B 봉우리는 60 µm(A 75 µm)로 오히려 작고, 최고 회전수 1X는 A 17 · B 16 µm p-p로 거의 같습니다. 불평형은 그대로입니다.'),
        },
        {
          question: tr('보상한 상태에서 두 기록의 봉우리 회전수, AF, 3000 rpm의 위상을 비교하세요. 무엇이 변했나요?'),
          answer: tr('봉우리가 3300 → 3050 rpm으로 내려왔고(강성으로 약 14 % ↓), 3000 rpm의 지연각이 약 80° → 130°로 커졌습니다. 같은 회전수에서 위상이 더 늦으면 고유진동수가 내려온 것입니다(P10-3). 밸런싱보다 베어링 간극·받침 상태를 먼저 봅니다.'),
        },
        {
          question: tr('"펄스 고치기"를 끄고 회전수 그래프를 보세요. 기록 B에 무엇이 보이나요?'),
          answer: tr('펄스가 빠진 세 곳에서 회전수가 반으로 떨어지고, 잡음 펄스가 찍힌 곳에서 몇 배로 튑니다. 그 바퀴의 1X 벡터도 틀립니다. 복기 전에 키페이저부터 확인하는 까닭입니다.'),
        },
      ]}
      footer={<p>{tr`파일은 이 브라우저 안에서만 읽습니다(서버로 보내지 않음). 합성 기록은 가상의 압축기이며 현장 자료가 아닙니다. 복기 메모는 저장되지 않습니다 — 필요하면 복사해 두세요.`}</p>}
    >
      <div className="review-records">
        {ids.map((id) => {
          const s = setups[id];
          const r = res[id];
          return (
            <div key={id} className="review-record" style={{ borderLeftColor: COLOR[id] }}>
              <strong>{nameOf(id)}</strong>
              <div className="file-open">
                <label className="lab-button file-open-button">
                  {tr`내 파일 열기 (키페이저 + 진동)`}
                  <input type="file" accept=".mat,.wav,.csv,.txt" onChange={onFile(id)} />
                </label>
                {s.ds && (
                  <button type="button" className="lab-button" onClick={() => setSetup(id, exampleSetup())}>
                    {tr`합성 기록으로`}
                  </button>
                )}
              </div>
              {errors[id] && <p className="case-msg">{tr`파일을 읽지 못했습니다: `}{errors[id]}</p>}
              {s.ds && (
                <div className="case-view-controls">
                  <ParamSelect label={tr`키페이저 채널`} value={s.key} options={s.ds.channels.map((c, i) => ({ value: i, label: channelName(c.name, lang) }))} onChange={(v) => setSetup(id, { key: v })} />
                  <ParamSelect label={tr`진동 채널`} value={s.vib} options={s.ds.channels.map((c, i) => ({ value: i, label: channelName(c.name, lang) }))} onChange={(v) => setSetup(id, { vib: v })} />
                  <NumberField label="f_s [Hz]" value={s.fs} step={1} onChange={(v) => setSetup(id, { fs: v })} hint={s.ds.fs ? undefined : tr('파일에 f_s가 없습니다')} />
                  <NumberField label={tr`진동 1단위 = ? µm`} value={s.scale} onChange={(v) => setSetup(id, { scale: v })} hint={tr('근접 프로브를 V로 기록했다면 1 ÷ 감도 — 7.87 V/mm면 127')} />
                  <ParamSelect label={tr`펄스 방향`} value={s.edge} options={[{ value: 'falling' as const, label: tr('내려감 (홈)') }, { value: 'rising' as const, label: tr('올라감 (돌기·TTL)') }]} onChange={(v) => setSetup(id, { edge: v })} />
                </div>
              )}
              {'error' in r ? (
                <p className="case-msg">{r.error}</p>
              ) : (
                <p className="lab-note">
                  {tr`펄스 ${r.rawCount.toLocaleString('en-US')}개`}
                  {repair ? tr` → 고친 뒤 ${r.pulses.length.toLocaleString('en-US')}개 (메움 ${r.filled} · 지움 ${r.removed})` : ''}
                  {tr` · 최고 ${fmt(Math.max(...Array.from(r.speed.rpm)), 4)} rpm`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <h4>{tr`1. 키페이저 확인 — 펄스 사이마다 회전수`}</h4>
      <Plot series={rpmSeries} x={{ label: tr('시각 [s]') }} y={{ label: tr('회전수 [rpm]') }} height={200} ariaLabel={tr('키페이저로 구한 회전수')} />
      {kp && (
        <>
          <Plot
            series={[
              { x: Array.from({ length: kpShow }, (_, i) => (i / kp.fs) * 1000), y: Array.from(kp.key.subarray(0, kpShow)), name: tr('키페이저'), color: 'var(--plot-1)', width: 1 },
              { x: [0, (kpShow / kp.fs) * 1000], y: [kp.threshold, kp.threshold], name: tr('문턱'), color: 'var(--text-muted)', dash: 'dash' as const, width: 1 },
              { x: Array.from(kp.pulses).filter((t) => t * 1000 <= (kpShow / kp.fs) * 1000).map((t) => t * 1000), y: Array.from(kp.pulses).filter((t) => t * 1000 <= (kpShow / kp.fs) * 1000).map(() => kp.threshold), name: tr('찾은 펄스'), color: 'var(--plot-2)', mode: 'markers' as const, markerSize: 7 },
            ]}
            x={{ label: tr`시각 [ms] (${nameOf(cascadeOf)}, 처음 50 ms)` }}
            y={{ label: tr('[채널 단위]') }}
            height={160}
            ariaLabel={tr('키페이저 파형과 문턱')}
          />
        </>
      )}

      <h4>{tr`2. Bode — ${order}X ${compensateOn ? tr('(slow roll 벡터를 뺌)') : tr('(잰 그대로)')}`}</h4>
      <Plot series={ampSeries} x={{ label: tr('회전수 [rpm]'), range: [0, maxRpm * 1.03] }} y={{ label: `${order}X [µm p-p]`, range: [0, maxAmp * 1.1] }} height={240} ariaLabel={tr('Bode 크기')} />
      <Plot series={lagSeries} x={{ label: tr('회전수 [rpm]'), range: [0, maxRpm * 1.03] }} y={{ label: tr('지연각 [°]'), range: [0, 360] }} height={190} ariaLabel={tr('Bode 위상')} />
      <PolarPlot
        series={ids.flatMap((id) => {
          const p = pts(id).filter((q) => q.rpm >= srLo);
          return p.length ? [{ amp: p.map((q) => pp(q.amp)), lagDeg: p.map((q) => q.lag), name: nameOf(id), color: COLOR[id], mode: 'lines' as const, width: 1.6 }] : [];
        })}
        rMax={maxAmp * 1.1}
        unit="µm"
        ariaLabel="Polar"
        maxWidth={380}
      />

      <table className="readout-table">
        <caption>{tr`읽음값 — ${order}X ${compensateOn ? tr('보상한 뒤') : tr('잰 그대로')}`}</caption>
        <thead>
          <tr>
            <th scope="col">{tr`항목`}</th>
            {ids.map((id) => (
              <th key={id} scope="col">
                {tr`기록 ${id}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              slow roll {order}X ({srLo} ~ {srHi} rpm)
            </th>
            {cell((x) => (x.r.sr ? `${fmt(pp(x.r.sr.amp), 3)} µm p-p ∠${Math.round(x.r.sr.lag)}°` : tr('범위에 점 없음')))}
          </tr>
          <tr>
            <th scope="row">{tr`가장 큰 ${order}X`}</th>
            {cell((x) => `${fmt(pp(x.s.peakAmp), 3)} µm p-p @ ${fmt(x.s.peakRpm, 4)} rpm`)}
          </tr>
          <tr>
            <th scope="row">Half-power AF</th>
            {cell((x) => (x.s.af ? fmt(x.s.af, 3) : tr('구할 수 없음')))}
          </tr>
          <tr>
            <th scope="row">{tr`위상이 90° 더 늦는 회전수`}</th>
            {cell((x) => (Number.isFinite(x.s.rpm90) ? `${fmt(x.s.rpm90, 4)} rpm` : '—'))}
          </tr>
          <tr>
            <th scope="row">{tr`최고 회전수의 ${order}X`}</th>
            {cell((x) => `${fmt(pp(x.top.amp), 3)} µm p-p ∠${Math.round(x.top.lag)}° @ ${fmt(x.top.rpm, 4)} rpm`)}
          </tr>
        </tbody>
      </table>

      <h4>{tr`3. 캐스케이드`}</h4>
      <div className="case-view-controls">
        <ParamSelect label={tr`기록`} value={cascadeOf} options={ids.map((id) => ({ value: id, label: nameOf(id) }))} onChange={setCascadeOf} />
        <ParamSelect label={tr`주파수 범위`} value={cascadeMax} options={[125, 250, 500, 1000].map((v) => ({ value: v, label: tr`0 ~ ${v} Hz` }))} onChange={setCascadeMax} />
      </div>
      {casc ? (
        <Plot series={[]} heatmap={{ x: casc.x, y: casc.y, z: casc.z, zRange: [casc.zMax - 40, casc.zMax], colorLabel: 'dB µm' }} x={{ label: tr('주파수 [Hz]'), range: [0, cascadeMax] }} y={{ label: tr('회전수 [rpm]') }} height={320} ariaLabel={tr('캐스케이드')} />
      ) : (
        <p className="case-msg">{tr`이 기록은 아직 분석할 수 없습니다.`}</p>
      )}

      <h4>{tr`4. 복기 메모`}</h4>
      <textarea
        className="review-memo"
        rows={6}
        value={memo}
        placeholder={tr('당시 판단: …\n다시 그린 자료가 보여 준 것: …\n당시와 다른 점과 그 까닭: …\n다음에 바꿀 것(기준선·측정·판단 절차): …')}
        onChange={(e) => setMemo(e.currentTarget.value)}
        aria-label={tr('복기 메모')}
      />
    </LabFrame>
  );
}
