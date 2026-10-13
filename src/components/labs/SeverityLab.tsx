import { useId, useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamSelect from '../ui/ParamSelect';
import ReadoutTable from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import Plot, { type PlotBand } from '../ui/Plot';
import {
  changeBand, compareChange, compareMagnitude, DEMO, parseNonnegative, severityTrend, trendVerdict, validLimits,
  type Limits, type TrendEvent,
} from '../../lib/assessment/severity';
import { formatNumber, texNumber } from '../../lib/format';
import type { Lang } from '../../i18n';
import { k, makeT } from '../../i18n/lab';
import EN from '../../i18n/en/labs/SeverityLab';

/** 빈칸이 있을 수 있는 임의 수치 입력 (슬라이더로는 빈칸을 나타낼 수 없다). 공통 param 모양을 쓴다. */
function NumberInput({ label, value, unit, onChange }: { label: string; value: string; unit: string; onChange: (v: string) => void }) {
  const id = useId();
  return <div className="param"><label htmlFor={id}>{label} [{unit}]</label>
    <input id={id} type="number" min="0" step="any" value={value} onChange={e => onChange(e.currentTarget.value)} /></div>;
}

type Fields = { ab: string; bc: string; cd: string; value: string; baseline: string; rate: string };
const blank = (): Fields => ({ ab: '', bc: '', cd: '', value: '', baseline: '', rate: '' });
const MEANING = {
  A: k('새로 설치한 기계에서 기대하는 수준'),
  B: k('제한 없이 장기 운전해도 되는 수준'),
  C: k('장기 연속 운전에는 맞지 않음 — 원인 조치까지 제한적으로'),
  D: k('손상을 일으킬 수 있는 수준'),
} as const;
const EVENTS: { value: TrendEvent; label: string }[] = [
  { value: 'step', label: k('계단 증가 (30일째)') },
  { value: 'drift', label: k('서서히 증가 (30 ~ 60일)') },
  { value: 'drop', label: k('갑자기 감소 (30일째)') },
  { value: 'steady', label: k('변화 없음') },
];
/** 구간 색: A 초록 · B 회색 · C 황토 · D 진한 황토 (본문 그림과 같은 약속) */
const zoneBands = (limits: Limits, top: number, scale = 1): PlotBand[] => [
  { y0: 0, y1: limits[0] / scale, color: 'var(--plot-3)', label: 'A' },
  { y0: limits[0] / scale, y1: limits[1] / scale, color: 'var(--text-muted)', label: 'B', opacity: 0.1 },
  { y0: limits[1] / scale, y1: limits[2] / scale, color: 'var(--status-wip)', label: 'C' },
  { y0: limits[2] / scale, y1: top, color: 'var(--status-wip)', label: 'D', opacity: 0.34 },
];

export default function SeverityLab({ lang = 'ko' }: { lang?: Lang }) {
  const tr = makeT(lang, EN);
  const [mode, setMode] = useState<'demo' | 'user'>('demo');
  const [event, setEvent] = useState<TrendEvent>('step');
  const [baseline, setBaseline] = useState<number>(DEMO.baseline);
  const [after, setAfter] = useState<number>(DEMO.value);
  const [rate, setRate] = useState<number>(DEMO.rate);
  const [quantity, setQuantity] = useState<'velocity' | 'displacement'>('velocity');
  const [fields, setFields] = useState<Fields>(blank);
  const [source, setSource] = useState('');
  const sourceId = useId();
  const demo = mode === 'demo';

  // ── 학습 예제: 가상 60일 추세 ──
  const trend = useMemo(() => severityTrend({ baseline, after, event }), [baseline, after, event]);
  const verdict = useMemo(() => trendVerdict(trend, baseline, DEMO.limits, rate), [trend, baseline, rate]);

  // ── 사용자 입력: 보유 규격의 경계 ──
  const unit = quantity === 'velocity' ? 'mm/s RMS' : 'µm p-p';
  const scale = quantity === 'velocity' ? 1e-3 : 1e-6;
  const parse = (key: keyof Fields) => { const n = parseNonnegative(fields[key]); return n === null ? null : n * scale; };
  const uLimits = [parse('ab'), parse('bc'), parse('cd')];
  const uCurrent = parse('value'), uBase = parse('baseline');
  const uRate = parseNonnegative(fields.rate);
  const uValid = uCurrent !== null && uLimits.every(v => v !== null) && validLimits(uLimits as unknown as Limits);
  const uMag = uValid ? compareMagnitude(uCurrent!, uLimits as unknown as Limits, 'review') : null;
  const uRateOk = uRate !== null && uRate > 0;
  const uChange = uValid && uBase !== null ? compareChange(uCurrent!, uBase, uLimits[1]!, uRateOk ? uRate : null) : null;
  const update = (key: keyof Fields, raw: string) => setFields(old => ({ ...old, [key]: raw }));

  const zoneText = (z: keyof typeof MEANING) => tr`구간 ${z} · ${tr(MEANING[z])}`;
  let status: string;
  let changeText: string | null = null;
  if (demo) {
    const baseZone = compareMagnitude(baseline, DEMO.limits, 'upper').zone!;
    status = tr`가상 예제 — 현재 크기(마지막 5일 평균) ${formatNumber(verdict.lastValue, 3)}: ${zoneText(verdict.lastZone)} (기준선은 구간 ${baseZone})`;
    changeText = verdict.changeDay === null
      ? tr`변화: 60일 동안 변화 비교 띠(${formatNumber(verdict.band.lower, 3)} ~ ${formatNumber(verdict.band.upper, 3)}) 안`
      : tr`변화: ${verdict.changeDay}일째 변화 비교 띠를 벗어남 · ${verdict.zoneDay === null ? tr('구간은 끝까지 그대로') : tr`구간이 올라간 날은 ${verdict.zoneDay}일째`}`;
  } else if (!uValid) {
    status = tr('판정 보류: 현재값과 양수·오름차순의 세 경계를 입력하세요. 빈칸을 0으로 보지 않습니다.');
  } else if (uMag!.boundary) {
    status = tr`경계 ${uMag!.boundary}: 경계값이 어느 구간에 드는지는 보유 원문에서 확인하세요.`;
  } else {
    status = tr`입력 경계 기준 ${zoneText(uMag!.zone!)}`;
  }
  if (!demo && uValid) {
    changeText = uBase === null ? tr('변화: 기준선을 넣으면 따로 계산합니다 (크기 구간과 별개).')
      : tr`변화: B/C 경계 대비 ${formatNumber(uChange!.percentOfBC, 3)} % · ${uRateOk ? (uChange!.comparison === 'above' ? tr('입력 비교율 초과') : uChange!.comparison === 'equal' ? tr('입력 비교율과 같음 — 등호 의미는 원문 확인') : tr('입력 비교율 이하')) : fields.rate.trim() === '' ? tr('비교율 미입력 — 비율만 표시') : tr('비교율은 양수여야 합니다')}`;
  }

  // ── 그래프 ──
  const demoTop = Math.max(12, ...trend.value.map(v => v * 1.08));
  const demoSeries = [
    { x: trend.day, y: trend.value, name: tr('가상 일별 전체값'), color: 'var(--plot-1)', mode: 'lines+markers' as const, markerSize: 4 },
    { x: [0, 60], y: [baseline, baseline], name: tr('기준선 x₀'), color: 'var(--text-muted)', dash: 'dot' as const },
    { x: [0, 60], y: [verdict.band.upper, verdict.band.upper], name: tr('변화 비교 띠'), color: 'var(--plot-4)', dash: 'dash' as const },
    { x: [0, 60], y: [verdict.band.lower, verdict.band.lower], name: tr('변화 비교 띠 (아래)'), color: 'var(--plot-4)', dash: 'dash' as const, hideInLegend: true },
  ];
  const uTop = uValid ? Math.max(uLimits[2]! * 1.3, uCurrent! * 1.15, (uBase ?? 0) * 1.15) / scale : 1;
  const uBand = uValid && uBase !== null && uRateOk ? changeBand(uBase, uLimits[1]!, uRate!) : null;
  const userSeries = uValid ? [
    { x: [1], y: [uCurrent! / scale], name: tr('현재'), color: 'var(--plot-1)', mode: 'markers' as const, markerSize: 11 },
    ...(uBase === null ? [] : [{ x: [0], y: [uBase / scale], name: tr('기준선'), color: 'var(--text-muted)', mode: 'markers' as const, markerSize: 11 }]),
    ...(uBand ? [{ x: [-0.2, 1.2], y: [uBand.upper / scale, uBand.upper / scale], name: tr('변화 비교 띠'), color: 'var(--plot-4)', dash: 'dash' as const },
      { x: [-0.2, 1.2], y: [uBand.lower / scale, uBand.lower / scale], name: tr('변화 비교 띠 (아래)'), color: 'var(--plot-4)', dash: 'dash' as const, hideInLegend: true }] : []),
  ] : [];

  const rows = demo ? [
    { label: tr('현재 크기 x (마지막 5일 평균)'), value: verdict.lastValue, unit: tr('무차원'), sig: 3 },
    { label: tr('부호 있는 변화 Δx'), value: verdict.lastChange.delta, unit: tr('무차원'), sig: 3 },
    { label: tr('절대 변화 / B/C 경계'), value: verdict.lastChange.percentOfBC, unit: '%', sig: 3 },
    ...(verdict.changeDay === null ? [] : [{ label: tr('변화 띠를 처음 벗어난 날'), value: verdict.changeDay, unit: tr('일') }]),
    ...(verdict.zoneDay === null ? [] : [{ label: tr('구간이 처음 올라간 날'), value: verdict.zoneDay, unit: tr('일') }]),
  ] : uValid ? [
    { label: tr('현재 크기'), value: uCurrent! / scale, unit },
    ...(uChange ? [{ label: tr('부호 있는 변화 Δx'), value: uChange.delta / scale, unit }, { label: tr('절대 변화 / B/C 경계'), value: uChange.percentOfBC, unit: '%' }] : []),
  ] : [];

  const bcShown = demo ? DEMO.limits[1] : uValid ? uLimits[1]! / scale : null;
  const dShown = demo ? verdict.lastChange.absoluteDelta : uChange ? uChange.absoluteDelta / scale : null;
  const pShown = demo ? verdict.lastChange.percentOfBC : uChange?.percentOfBC ?? null;
  const reset = () => { setMode('demo'); setEvent('step'); setBaseline(DEMO.baseline); setAfter(DEMO.value); setRate(DEMO.rate); setFields(blank()); setSource(''); setQuantity('velocity'); };

  return <LabFrame id="LAB-ISO-01" lang={lang} title={tr('크기 구간과 변화를 따로 판정하기')} controls={<>
    <ParamSelect label={tr('입력 모드')} value={mode} onChange={setMode} options={[{ value: 'demo', label: tr('학습 예제 · 가상 60일 추세') }, { value: 'user', label: tr('내 규격값 입력 · 보유 원문') }]} />
    {demo ? <>
      <p className="lab-note">{tr('경계 2·5·9와 비교율은 규격과 무관한 가상값입니다.')}</p>
      <ParamSelect label={tr('사건')} value={event} onChange={setEvent} options={EVENTS.map(e => ({ ...e, label: tr(e.label) }))} />
      <ParamSlider label={tr('기준선 x₀')} value={baseline} min={0.5} max={8} step={0.1} unit={tr('무차원')} onChange={setBaseline} />
      <ParamSlider label={event === 'drift' ? tr('마지막 날 값') : tr('사건 뒤 값')} value={after} min={0} max={12} step={0.1} unit={tr('무차원')} onChange={setAfter} />
      <ParamSlider label={tr('변화 비교율 (B/C 대비, 예제값)')} value={rate} min={2} max={50} step={1} unit="%" onChange={setRate} />
    </> : <>
      <ParamSelect label={tr('측정량')} value={quantity} options={[{ value: 'velocity', label: tr('비회전부 속도 RMS') }, { value: 'displacement', label: tr('축 상대 변위 p-p') }]}
        onChange={v => { setQuantity(v); setFields(blank()); }} hint={tr('바꾸면 수치를 비웁니다. 두 측정량은 서로 환산하지 않습니다.')} />
      {(['ab', 'bc', 'cd', 'value', 'baseline'] as const).map((key, i) => <NumberInput key={key} label={[tr('A/B 경계'), tr('B/C 경계'), tr('C/D 경계'), tr('현재값'), tr('기준선 (선택)')][i]} unit={unit} value={fields[key]} onChange={raw => update(key, raw)} />)}
      <NumberInput label={tr('변화 비교율 (선택)')} value={fields.rate} unit={tr('B/C 경계 대비 %')} onChange={raw => update('rate', raw)} />
      <div className="param"><label htmlFor={sourceId}>{tr('경계의 출처 (선택)')}</label><input id={sourceId} type="text" value={source} onChange={e => setSource(e.currentTarget.value)} placeholder={tr('문서·판본, 기계 분류, 해당 절')} /></div>
    </>}
    <button type="button" onClick={reset}>{tr('초기화')}</button>
  </>} formulas={<>
    <Formula display tex={'\\Delta x=x-x_0,\\qquad p=100\\,\\frac{\\lvert\\Delta x\\rvert}{b_{BC}}\\ \\%'} />
    {bcShown !== null && dShown !== null && pShown !== null && <Formula display tex={`p=100\\times\\frac{${texNumber(dShown, 3)}}{${texNumber(bcShown, 3)}}=${texNumber(pShown, 3)}\\ \\%`} />}
    {demo && <Formula display tex={`x_0\\pm\\frac{${rate}}{100}\\,b_{BC}=${texNumber(baseline, 3)}\\pm${texNumber(verdict.band.width, 3)}`} />}
  </>} readouts={<ReadoutTable rows={rows} />} tasks={[
    { question: tr('기본값(기준선 2.5, 30일째 4로 계단 증가)에서 크기 구간과 변화 판정은 각각 언제 바뀌나요?'), answer: tr('구간은 60일 내내 B입니다. 변화는 30일째 띠(1.5 ~ 3.5)를 벗어나고, 현재 크기 4.04는 B/C 대비 30.8 % 변화입니다. 구간만 봤다면 놓쳤을 변화입니다.') },
    { question: tr('사건을 "서서히 증가", 마지막 날 값을 6으로 바꾸세요. 어느 판정이 먼저 서나요?'), answer: tr('변화 띠는 39일째, 구간 C(5)는 51일째에 넘어갑니다. 같은 추세를 변화 판정이 12일 먼저 알려 줍니다.') },
    { question: tr('사건을 "갑자기 감소", 기준선 3, 사건 뒤 값 1.5로 바꾸세요.'), answer: tr('구간은 B → A로 좋아 보이지만 Δx ≈ −1.49, 29.7 %로 30일째 변화 띠를 벗어납니다. 부하 감소인지, 센서가 떨어지거나 신호 경로가 바뀐 것인지 먼저 확인합니다.') },
    { question: tr('사건을 계단 증가로 두고 변화 비교율을 2 %와 50 %로 바꿔 보세요. 무엇을 맞바꾸나요?'), answer: tr('2 %에서는 띠 폭이 ±0.1로 하루 흩어짐(약 4 %, ±0.1)과 같아 사건 전인 1일째부터 벗어납니다 — 헛경보입니다. 50 %에서는 ±2.5라 4로 오른 계단을 끝까지 놓칩니다. 실제 비교율은 적용 Part의 원문과 그 기계의 흩어짐을 함께 보고 정합니다.') },
  ]} footer={<p>{tr('입력값은 이 화면에만 있고 저장·전송하지 않습니다. 이 랩은 구간과 산술 비교만 보여 주며, 규격 적합성·결함·잔여 수명·운전 허가·알람/트립 설정값을 정하지 않습니다.')}</p>}>
    <p role="status">{status}</p>
    {changeText && <p>{changeText}</p>}
    {!demo && <p className="lab-note">{source.trim() ? tr`출처: ${source.trim()}` : tr('출처 미기재 — 판정 기록에는 문서·판본·기계 분류·해당 절을 함께 남깁니다.')}</p>}
    {demo
      ? <Plot series={demoSeries} bands={zoneBands(DEMO.limits, demoTop)} x={{ label: tr('가상 기록 날짜 [일]'), range: [0, 60] }} y={{ label: tr('가상 전체값 x [무차원]'), range: [0, demoTop] }} height={300} ariaLabel={tr('구간 색 띠 위의 가상 60일 추세와 변화 비교 띠')} />
      : <Plot series={userSeries} bands={uValid ? zoneBands(uLimits as unknown as Limits, uTop, scale) : []} x={{ label: tr('0 = 기준선 · 1 = 현재'), range: [-0.2, 1.2] }} y={{ label: tr`크기 [${unit}]`, range: [0, uTop] }} height={300} ariaLabel={tr('입력 경계의 구간 띠와 현재·기준선')} />}
  </LabFrame>;
}
