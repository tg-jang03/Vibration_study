import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamSelect from '../ui/ParamSelect';
import ReadoutTable from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import Plot from '../ui/Plot';
import type { Lang } from '../../i18n';
import { makeT } from '../../i18n/lab';
import EN from '../../i18n/en/labs/SeparationMarginLab';
import { marginAtOperating, marginCurve } from '../../lib/assessment/margin';
import { formatNumber, texNumber } from '../../lib/format';

const OP = 3600;
const P41_SM = (100 * 600) / 3600;
const RPM = Array.from({ length: 351 }, (_, i) => 1500 + i * 10);

/** LAB-SM-01: 임계속도 예측이 틀렸을 때, 뾰족한 봉우리(AF 큼)일수록 운전점 응답이 크게 뛴다 (P10-2 §4) */
export default function SeparationMarginLab({ lang = 'ko' }: { lang?: Lang }) {
  const tr = makeT(lang, EN);
  const [af, setAf] = useState(10);
  const [sm, setSm] = useState(P41_SM);
  const [side, setSide] = useState<'below' | 'above'>('below');
  const [err, setErr] = useState(10);
  const m = useMemo(() => marginAtOperating({ af, smPct: sm, errorPct: err, side, operatingRpm: OP }), [af, sm, err, side]);
  const series = useMemo(() => [
    { x: RPM, y: marginCurve(m.predictedNc, af, RPM), name: tr('해석이 예측한 응답'), color: 'var(--text-muted)', dash: 'dash' as const },
    { x: RPM, y: marginCurve(m.actualNc, af, RPM), name: tr('실제 응답 (예측 오차 반영)'), color: 'var(--plot-1)' },
    { x: [OP, OP], y: [0, Math.max(af * 1.1, 4)], name: tr('운전 회전수 3600 rpm'), color: 'var(--plot-4)', dash: 'dot' as const },
    { x: [OP], y: [m.predictedAmp], name: tr('운전점 (예측)'), color: 'var(--text-muted)', mode: 'markers' as const, markerSize: 9, hideInLegend: true },
    { x: [OP], y: [m.actualAmp], name: tr('운전점 (실제)'), color: 'var(--plot-1)', mode: 'markers' as const, markerSize: 10, hideInLegend: true },
  ], [m, af, lang]);
  const reset = () => { setAf(10); setSm(P41_SM); setSide('below'); setErr(10); };
  return <LabFrame id="LAB-SM-01" lang={lang} title={tr('AF가 크면 왜 분리여유를 더 두나')} controls={<>
    <ParamSlider label={tr('증폭계수 AF (≈ 1/(2ζ))')} value={af} min={2} max={20} step={0.5} unit="" onChange={setAf} />
    <ParamSlider label={tr('해석이 예측한 분리여유 SM')} value={sm} min={0} max={40} step={0.1} unit="%" format={v => formatNumber(v, 3)} onChange={setSm} />
    <ParamSelect label={tr('임계속도 위치')} value={side} onChange={setSide} options={[{ value: 'below', label: tr('운전점 아래 (P4-1 예시 로터)') }, { value: 'above', label: tr('운전점 위') }]} />
    <ParamSlider label={tr('임계속도 예측 오차')} value={err} min={-20} max={20} step={1} unit="%" onChange={setErr} />
    <button type="button" onClick={reset}>{tr('초기화')}</button>
  </>} formulas={<>
    <Formula display tex={'\\frac{X}{e}=\\frac{r^2}{\\sqrt{(1-r^2)^2+(2\\zeta r)^2}},\\quad r=\\frac{N_{op}}{N_c},\\quad \\zeta\\approx\\frac{1}{2\\,AF}'} />
    <Formula display tex={`N_c:\\ ${texNumber(m.predictedNc, 4)}\\ \\to\\ ${texNumber(m.actualNc, 4)}\\ \\text{rpm},\\qquad \\frac{X_{\\text{${tr`실제`}}}}{X_{\\text{${tr`예측`}}}}=\\frac{${texNumber(m.actualAmp, 3)}}{${texNumber(m.predictedAmp, 3)}}=${texNumber(m.growth, 3)}`} />
  </>} readouts={<ReadoutTable rows={[
    { label: tr('예측 임계속도'), value: m.predictedNc, unit: 'rpm' },
    { label: tr('실제 임계속도'), value: m.actualNc, unit: 'rpm' },
    { label: tr('실제 분리여유'), value: m.actualSmPct, unit: '%', sig: 3 },
    { label: tr('운전점 응답 X/e (예측)'), value: m.predictedAmp, sig: 3 },
    { label: tr('운전점 응답 X/e (실제)'), value: m.actualAmp, sig: 3 },
    { label: tr('실제 / 예측'), value: m.growth, unit: tr('배'), sig: 3 },
  ]} />} tasks={[
    { question: tr('기본값(P4-1 로터: AF 10, 임계속도 3000 rpm, SM 16.7 %)에서 실제 임계속도가 10 % 높게(3300 rpm) 나왔다면 운전점 응답은?'), answer: tr('X/e가 3.16 → 5.43으로 1.72배가 됩니다. 실제 분리여유는 8.3 %입니다.') },
    { question: tr('AF만 2.5로 바꾸면?'), answer: tr('같은 10 % 오차에도 2.21 → 2.50, 1.13배입니다. 봉우리가 펑퍼짐하면 임계속도가 조금 옮겨도 운전점 응답이 크게 바뀌지 않습니다.') },
    { question: tr('AF 10에서 같은 오차의 영향을 1.13배로 묶으려면 SM을 얼마나 둬야 하나요?'), answer: tr('SM을 40 %까지 늘려야 1.13배가 됩니다(30 %에서 1.24배). 같은 안심을 얻는 데 필요한 분리여유가 AF에 따라 달라지는 이유입니다.') },
    { question: tr('오차를 +20 %로 올리면?'), answer: tr('실제 임계속도가 3600 rpm, 곧 운전점에 올라탑니다. 응답이 봉우리 높이(≈ AF = 10)가 되어 예측의 3.2배입니다.') },
  ]} footer={<p>{tr('1자유도 불평형 응답의 학습 모델입니다. 규격의 AF 구분이나 요구 분리여유 값은 넣지 않았습니다 — 적용 장비 규격과 판본에서 확인합니다.')}</p>}>
    <p role="status">{tr`실제 임계속도 ${formatNumber(m.actualNc, 4)} rpm · 운전점 응답이 예측의 ${formatNumber(m.growth, 3)}배`}</p>
    <Plot series={series} x={{ label: tr('회전수 [rpm]'), range: [1500, 5000] }} y={{ label: tr('진폭 / 편심 X/e [무차원]'), range: [0, Math.max(af * 1.1, 4)] }} height={300} ariaLabel={tr('예측 응답과 실제 응답, 운전 회전수의 응답')} />
  </LabFrame>;
}
