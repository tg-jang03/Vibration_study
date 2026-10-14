import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ReadoutTable from '../ui/ReadoutTable';
import Plot from '../ui/Plot';
import { baseCoastdown, CASE, coastdown, fitErrors, scatterLevel, truthSystem, type Evidence, type TruthId } from '../../lib/assessment/diagnosis';
import type { Lang } from '../../i18n';
import { k, makeT } from '../../i18n/lab';
import EN from '../../i18n/en/labs/DiagnosisLab';

const UM = 2e6; // m Peak → µm p-p
const DEG = 180 / Math.PI;
/** 숨은 원인 이름의 영어 사전 키 (lib TRUTH_LABEL과 같은 문자열, D-054) */
const TRUTH_KEY: Record<TruthId, string> = { excitation: k('가진 증가 (불평형이 커짐)'), stiffness: k('고유진동수 이동 (받침 강성 저하)'), both: k('둘 다 조금씩') };
const EVIDENCE: { value: Evidence; label: string }[] = [
  { value: 'op', label: k('3000 rpm 진폭 하나 (지금 아는 것)') },
  { value: 'amp', label: k('코스트다운 진폭 (2000 ~ 3000 rpm)') },
  { value: 'ampPhase', label: k('코스트다운 진폭 + 위상') },
];

/** LAB-DIAG-01: 같은 "20 → 40 µm p-p"를 두 가설이 어떻게 다르게 예측하고, 어떤 자료가 가르는지 (P10-3 §4) */
export default function DiagnosisLab({ lang = 'ko' }: { lang?: Lang }) {
  const tr = makeT(lang, EN);
  const [truth, setTruth] = useState<TruthId>('stiffness');
  const [evidence, setEvidence] = useState<Evidence>('op');
  const base = useMemo(() => baseCoastdown(), []);
  const system = useMemo(() => truthSystem(truth), [truth]);
  const data = useMemo(() => coastdown(system), [system]);
  const fit = useMemo(() => fitErrors(data, evidence), [data, evidence]);
  const scatter = useMemo(() => scatterLevel(data, system), [data, system]);
  const opIndex = CASE.rpm.indexOf(CASE.operatingRpm);
  const shown = evidence === 'op' ? [data[opIndex]] : data;
  const okAmp = (e: number) => e <= 2 * scatter.amp;
  const okLag = (e: number | null) => e === null || e <= 2 * scatter.lag;
  const fits = (h: { amp: number; lag: number | null }) => okAmp(h.amp) && okLag(h.lag);
  const f1 = fits(fit.h1), f2 = fits(fit.h2);
  const status = evidence === 'op' ? tr`두 가설 모두 3000 rpm의 40 µm p-p를 정확히 설명합니다 — 이 자료로는 가를 수 없습니다.`
    : f1 && f2 ? tr`두 가설 모두 기록 흩어짐 안에서 맞습니다 — 더 가르는 자료가 필요합니다.`
    : f1 ? tr`가진 증가(H1)만 기록 흩어짐 안에서 맞습니다.`
    : f2 ? tr`고유진동수 이동(H2)만 기록 흩어짐 안에서 맞습니다.`
    : tr`어느 가설 하나로도 기록 흩어짐 안에서 설명되지 않습니다 — 둘이 겹쳤거나 다른 원인을 의심합니다.`;
  const rpmAll = CASE.rpm as unknown as number[];
  const ampSeries = [
    { x: rpmAll, y: base.map(p => p.amp * UM), name: tr`1년 전 코스트다운 (기준)`, color: 'var(--text-muted)', mode: 'lines+markers' as const, markerSize: 4 },
    { x: rpmAll, y: fit.hypotheses.h1Curve.map(p => p.amp * UM), name: tr`H1 가진 증가 예측`, color: 'var(--plot-2)', dash: 'dash' as const },
    { x: rpmAll, y: fit.hypotheses.h2Curve.map(p => p.amp * UM), name: tr`H2 고유진동수 이동 예측`, color: 'var(--plot-3)', dash: 'dash' as const },
    { x: shown.map(p => p.rpm), y: shown.map(p => p.amp * UM), name: tr`지금 기록`, color: 'var(--plot-1)', mode: 'markers' as const, markerSize: 8 },
  ];
  const lagSeries = [
    { x: rpmAll, y: base.map(p => p.lag * DEG), name: tr`1년 전 (기준)`, color: 'var(--text-muted)', mode: 'lines+markers' as const, markerSize: 4 },
    { x: rpmAll, y: fit.hypotheses.h1Curve.map(p => p.lag * DEG), name: tr`H1 예측`, color: 'var(--plot-2)', dash: 'dash' as const },
    { x: rpmAll, y: fit.hypotheses.h2Curve.map(p => p.lag * DEG), name: tr`H2 예측`, color: 'var(--plot-3)', dash: 'dash' as const },
    { x: rpmAll, y: data.map(p => p.lag * DEG), name: tr`지금 기록`, color: 'var(--plot-1)', mode: 'markers' as const, markerSize: 8 },
  ];
  const rows = [
    { label: tr`3000 rpm 진폭 (지금)`, value: data[opIndex].amp * UM, unit: 'µm p-p', sig: 3 },
    { label: tr`H1 진폭 오차 (RMS)`, value: fit.h1.amp * UM, unit: 'µm p-p', sig: 2 },
    { label: tr`H2 진폭 오차 (RMS)`, value: fit.h2.amp * UM, unit: 'µm p-p', sig: 2 },
    ...(evidence === 'ampPhase' ? [{ label: tr`H1 위상 오차 (RMS)`, value: fit.h1.lag! * DEG, unit: '°', sig: 2 }, { label: tr`H2 위상 오차 (RMS)`, value: fit.h2.lag! * DEG, unit: '°', sig: 2 }] : []),
    { label: tr`기록 흩어짐 (진폭)`, value: scatter.amp * UM, unit: 'µm p-p', sig: 2 },
    ...(evidence === 'ampPhase' ? [{ label: tr`기록 흩어짐 (위상)`, value: scatter.lag * DEG, unit: '°', sig: 2 }] : []),
  ];
  const reset = () => { setTruth('stiffness'); setEvidence('op'); };
  return <LabFrame id="LAB-DIAG-01" lang={lang} title={tr`무엇이 변했나: 가설을 가르는 자료`} controls={<>
    <ParamSelect label={tr`숨은 원인 (정답 — 먼저 가리고 시작)`} value={truth} onChange={setTruth} options={(Object.keys(TRUTH_KEY) as TruthId[]).map(id => ({ value: id, label: tr(TRUTH_KEY[id]) }))} />
    <ParamSelect label={tr`보여 줄 자료`} value={evidence} onChange={setEvidence} options={EVIDENCE.map(o => ({ ...o, label: tr(o.label) }))} />
    <p className="lab-note">{tr`회전체 + 받침을 1자유도로 단순화한 가상 사례입니다. 1년 전 임계속도 3500 rpm, ζ 0.08.`}</p>
    <button type="button" onClick={reset}>{tr`초기화`}</button>
  </>} readouts={<ReadoutTable rows={rows} />} tasks={[
    { question: tr`보여 줄 자료가 "3000 rpm 진폭 하나"일 때, 숨은 원인을 바꿔도 판정이 달라지나요?`, answer: tr`아니요. 두 가설 모두 40 µm p-p에 맞춰 만든 것이라 오차가 0입니다. 한 점은 원인을 가르지 못합니다.` },
    { question: tr`"코스트다운 진폭"으로 바꾸세요. 숨은 원인이 받침 강성 저하일 때 두 가설의 오차는?`, answer: tr`H2 ≈ 0.37 µm p-p(흩어짐 수준), H1 ≈ 3.0 µm p-p입니다. 2000 ~ 2800 rpm에서 H1은 1년 전 곡선을 두 배로 올리지만, 실제 기록은 그보다 낮다가 3000 근처에서 가파르게 오릅니다.` },
    { question: tr`"진폭 + 위상"으로 바꾸세요. 3000 rpm의 위상 지연은 1년 전과 어떻게 다른가요?`, answer: tr`1년 전 27°에서 56°로 늘었습니다. H1(가진만 증가)은 위상이 그대로라고 예측하므로 위상 오차가 약 12°, H2는 약 1.6°입니다. 위상이 가장 분명하게 가릅니다.` },
    { question: tr`숨은 원인을 "둘 다 조금씩"으로 바꾸면?`, answer: tr`어느 가설도 흩어짐 안에서 맞지 않습니다(진폭 1.4 ~ 1.7 µm, 위상 5 ~ 7°). 한 원인만 가정한 설명을 버리고, 가진과 강성을 함께 보는 가설이나 다른 원인을 검토합니다.` },
  ]} footer={<p>{tr`"맞음"의 기준은 기록 흩어짐의 2배 이내로 둔 학습용 규칙입니다. 실제 판단에는 같은 조건의 반복 기록과 다른 증거(P10-3 3절)를 함께 씁니다.`}</p>}>
    <p role="status">{status}</p>
    <Plot series={ampSeries} x={{ label: tr`회전수 [rpm]`, range: [1950, 3050] }} y={{ label: tr`1X 진폭 [µm p-p]`, range: [0, 45] }} height={260} ariaLabel={tr`1년 전과 지금의 코스트다운 1X 진폭, 두 가설의 예측`} />
    {evidence === 'ampPhase' && <Plot series={lagSeries} x={{ label: tr`회전수 [rpm]`, range: [1950, 3050] }} y={{ label: tr`1X 위상 지연 [°]`, range: [-10, 70] }} height={220} ariaLabel={tr`1년 전과 지금의 코스트다운 1X 위상, 두 가설의 예측`} />}
  </LabFrame>;
}
