import { useId, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import ReadoutTable from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import Plot from '../ui/Plot';
import { compareChange, compareMagnitude, DEMO, parseNonnegative, validLimits, type Limits } from '../../lib/assessment/severity';
import { formatNumber, texNumber } from '../../lib/format';

/** Blank arbitrary numeric inputs cannot be represented by a slider. Uses the common param styling. */
function NumberInput({ label, value, unit, onChange }: { label: string; value: string; unit: string; onChange: (v: string) => void }) {
  const id = useId();
  return <div className="param"><label htmlFor={id}>{label} [{unit}]</label>
    <input id={id} type="number" min="0" step="any" value={value} onChange={e => onChange(e.currentTarget.value)} /></div>;
}
type Fields = { ab: string; bc: string; cd: string; value: string; baseline: string; rate: string };
const blank = (): Fields => ({ ab: '', bc: '', cd: '', value: '', baseline: '', rate: '' });
const meanings = { A: '새 기계의 낮은 진동 구간이라는 취지', B: '지속 운전 평가 구간이라는 취지', C: '장기 운전의 적합성을 재검토하는 취지', D: '손상 위험을 포함해 신속히 대응을 검토하는 취지' };

export default function SeverityLab() {
  const [mode, setMode] = useState<'demo' | 'user'>('demo');
  const [quantity, setQuantity] = useState<'velocity' | 'displacement'>('velocity');
  const [family, setFamily] = useState('2');
  const [value, setValue] = useState<number>(DEMO.value), [baseline, setBaseline] = useState<number>(DEMO.baseline);
  const [fields, setFields] = useState<Fields>(blank);
  const [source, setSource] = useState(''), [confirmed, setConfirmed] = useState(false);
  const sourceId = useId();
  const demo = mode === 'demo';
  const unit = demo ? '무차원' : quantity === 'velocity' ? 'mm/s RMS' : 'µm p-p';
  const scale = demo ? 1 : quantity === 'velocity' ? 1e-3 : 1e-6;
  const update = (key: keyof Fields, raw: string) => { setFields(old => ({ ...old, [key]: raw })); if (['ab', 'bc', 'cd'].includes(key)) setConfirmed(false); };
  const parse = (key: keyof Fields) => { const n = parseNonnegative(fields[key]); return n === null ? null : n * scale; };
  const current = demo ? value : parse('value');
  const base = demo ? baseline : parse('baseline');
  const limits = demo ? DEMO.limits : [parse('ab'), parse('bc'), parse('cd')];
  const rate = demo ? DEMO.rate : parseNonnegative(fields.rate);
  const valuesValid = current !== null && Number.isFinite(current) && limits.every(v => v !== null) && validLimits(limits as Limits);
  const ready = valuesValid && (demo || (confirmed && source.trim().length > 0));
  const magnitude = ready ? compareMagnitude(current!, limits as Limits, demo ? 'upper' : 'review') : null;
  let change: ReturnType<typeof compareChange> | null = null;
  let changeError = false;
  if (ready && base !== null && Number.isFinite(base)) {
    try { change = compareChange(current!, base, limits[1]!, rate !== null && rate > 0 ? rate : null); }
    catch { changeError = true; }
  }
  const rateInvalid = !demo && fields.rate.trim() !== '' && (rate === null || rate <= 0);
  const status = !valuesValid ? '판정 보류: 현재값과 양수·오름차순의 세 경계를 입력하세요.' : !ready ? '판정 보류: 판본·분류 출처와 조건 대조를 완료하세요.' : magnitude?.boundary ? `경계 ${magnitude.boundary}: 등호의 구간 포함은 보유 원문에서 확인하세요.` : `${demo ? '가상 예제' : '입력 경계에 따른'} 구간 ${magnitude!.zone} · ${meanings[magnitude!.zone!]}`;
  const rawMax = valuesValid ? Math.max(current! / scale, limits[2]! / scale, (base ?? 0) / scale) : 1;
  const max = rawMax > Number.MAX_VALUE / 1.15 ? rawMax : rawMax * 1.15;
  const plotSeries = valuesValid ? [
    ...(limits as Limits).map((v, i) => ({ x: [0, 1], y: [v / scale, v / scale], name: ['A/B', 'B/C', 'C/D'][i] + ' 입력 경계', color: 'var(--text-muted)', dash: 'dash' as const })),
    { x: [1], y: [current! / scale], name: '현재', color: 'var(--plot-1)', mode: 'markers' as const },
    ...(base === null || !Number.isFinite(base) ? [] : [{ x: [0], y: [base / scale], name: '기준선', color: 'var(--plot-3)', mode: 'markers' as const }]),
  ] : [];
  const rows = ready ? [
    { label: '현재 크기', value: current! / scale, unit },
    ...(change ? [{ label: '기준선', value: base! / scale, unit }, { label: '부호 있는 변화 Δx', value: change.delta / scale, unit },
      { label: '절대 변화 / B/C 경계', value: change.percentOfBC, unit: '%' }] : []),
  ] : [];
  const reset = () => { setMode('demo'); setValue(DEMO.value); setBaseline(DEMO.baseline); setFields(blank()); setSource(''); setConfirmed(false); setQuantity('velocity'); setFamily('2'); };
  return <LabFrame id="LAB-ISO-01" title="크기와 변화의 별도 판정" controls={<>
    <ParamSelect label="입력 모드" value={mode} onChange={setMode} options={[{ value: 'demo', label: '학습 예제 · 가상 무차원 값' }, { value: 'user', label: '사용자 입력 · 보유 규격 대조' }]} />
    {demo ? <>
      <p className="lab-note">경계 2·5·9와 비교율 20%는 규격과 무관한 가상값입니다.</p>
      <ParamSlider label="가상 현재값 x" value={value} min={0} max={12} step={.1} unit="무차원" onChange={setValue} />
      <ParamSlider label="가상 기준선 x₀" value={baseline} min={0} max={12} step={.1} unit="무차원" onChange={setBaseline} />
    </> : <>
      <ParamSelect label="측정량" value={quantity} options={[{ value: 'velocity', label: '비회전부 속도 RMS' }, { value: 'displacement', label: '축 상대 변위 p-p' }]}
        onChange={v => { setQuantity(v); setFields(blank()); setConfirmed(false); setSource(''); }} hint="바꾸면 수치·출처를 비웁니다. 두 측정량을 자동 환산하지 않습니다." />
      <ParamSelect label="기계별 규격 후보" value={family} options={[{ value: '2', label: '20816-2 · 육상 GT/ST·발전기' }, { value: '3', label: '20816-3 · 산업용 기계' }, { value: '4', label: '20816-4 · 유막 베어링 GT' }, { value: '5', label: '20816-5 · 수력 설비' }, { value: 'other', label: '기타 · 보유 문서에서 확인' }]}
        onChange={v => { setFamily(v); setConfirmed(false); setSource(''); }} hint="후보 선택은 적용 범위와 기계 분류를 자동 확정하지 않습니다." />
      {(['ab', 'bc', 'cd', 'value', 'baseline'] as const).map((key, i) => <NumberInput key={key} label={['A/B 경계', 'B/C 경계', 'C/D 경계', '현재값', '기준선 (선택)'][i]} unit={unit} value={fields[key]} onChange={raw => update(key, raw)} />)}
      <NumberInput label="변화 비교율 (선택)" value={fields.rate} unit="B/C 경계 대비 %" onChange={raw => update('rate', raw)} />
      <div className="param"><label htmlFor={sourceId}>판본·기계 분류·평가 조건의 출처</label><input id={sourceId} type="text" value={source} onChange={e => { setSource(e.currentTarget.value); setConfirmed(false); }} placeholder="문서 판본, 분류, 해당 절·표의 위치" /></div>
      <ParamToggle label="범위·분류·센서·대역·통계량·운전 조건을 원문과 대조했습니다" checked={confirmed} onChange={setConfirmed} />
    </>}
    <button type="button" onClick={reset}>초기화</button>
  </>} formulas={<>
    <Formula display tex={'\\Delta x=x-x_0,\\qquad p=100\\frac{\\lvert\\Delta x\\rvert}{b_{BC}}\\%'} />
    {change && <Formula display tex={`p=100\\frac{${texNumber(change.absoluteDelta / scale, 4)}}{${texNumber(limits[1]! / scale, 4)}}=${texNumber(change.percentOfBC, 4)}\\%`} />}
  </>} readouts={<ReadoutTable rows={rows} />} tasks={[
    { question: '학습 예제 기본값에서 크기와 변화 결과를 각각 읽으세요.', answer: '현재 3은 B 구간입니다. 기준 1.5에서 1.5 증가해 B/C=5 대비 30%입니다. 예제의 임의 비교율 20%를 넘습니다.' },
    { question: '현재값을 1.8, 이어서 5로 바꾸세요.', answer: '1.8은 A·변화 6%입니다. 5는 예제 등호 관례에 따라 C·변화 70%입니다. 사용자 입력의 등호는 원문 확인으로 남깁니다.' },
    { question: '현재값을 1.5, 기준선을 3으로 바꾸면?', answer: 'Δx=-1.5, 절대 변화 비교는 30%입니다. 감소도 변화이며 운전 조건과 센서 상태를 확인합니다.' },
    { question: '사용자 모드를 열고, 입력 전 상태와 측정량 변경을 확인하세요.', answer: '빈칸은 0으로 간주하지 않습니다. 유효 경계·출처·조건 대조 전에는 보류입니다. 측정량 변경은 수치를 비워 다른 단위의 경계를 재사용하지 않게 합니다.' },
  ]} footer={<p>사용자 입력은 이 화면의 메모리에만 있으며 저장·전송 기능이 없습니다. 구간과 산술 비교를 보여주며, 규격 적합성·결함·잔여 수명·운전 허가·알람/트립 설정을 자동 결정하지 않습니다. 실제 기준은 적용 판본·계약·제조사 절차와 대조하세요.</p>}>
    <p role="status">{status}</p>
    {change && !rateInvalid && <p>변화 비교: {formatNumber(change.percentOfBC, 4)}% · {change.comparison === 'unset' ? '비교율 미입력: 비율만 표시' : change.comparison === 'equal' ? '입력 비교율과 같음: 등호 의미 원문 확인' : change.comparison === 'above' ? '입력 비교율 초과' : '입력 비교율 미만'}</p>}
    {!demo && ready && base === null && <p>변화 판정 보류: 유효한 기준선이 필요합니다. 크기 구간은 따로 표시합니다.</p>}
    {rateInvalid && <p>변화 기준 보류: 비교율은 양수여야 합니다.</p>}
    {changeError && <p>변화 판정 보류: 수치 범위를 확인하세요.</p>}
    <Plot series={plotSeries} x={{ label: '0=기준선 · 1=현재', range: [-.1, 1.1] }} y={{ label: `크기 [${unit}]`, range: [0, max] }} height={280} ariaLabel="입력 경계와 현재 크기·기준선 비교" />
  </LabFrame>;
}
