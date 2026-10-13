import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import PolarPlot, { type PolarSeries } from '../ui/PolarPlot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { angleOf, BAL_CASES, balance, cabs, csub, toUmPP, type CaseId, type Cx, type Weight } from '../../lib/fieldwork/balance';
import type { Lang } from '../../i18n';
import { k, makeT, type T } from '../../i18n/lab';
import EN from '../../i18n/en/labs/BalanceLab';

/**
 * LAB-BAL-01 영향계수 밸런싱 (P9-2, Contents §5-1b).
 * 계산: src/lib/fieldwork/balance.ts (본문 그림 1 ~ 5와 같은 로터·사례·시드).
 */

/** lib/fieldwork/balance.ts의 한국어 라벨 영어 사전 키 (lib와 글자가 같아야 한다, D-054) */
const CASE_KEY: Record<CaseId, string> = {
  static: k('정적 위주 (두 평면이 같은 쪽)'),
  couple: k('커플 위주 (두 평면이 반대쪽)'),
  dynamic: k('동적 (둘이 섞임)'),
};
/** balance()가 만드는 런 이름 — 사전 키 표시용, 화면에는 tr(q.label) */
const RUN_LABEL_KEYS: string[] = [k('처음 (런 0)'), k('시험추 평면 1 (런 1)'), k('시험추 평면 2 (런 2)'), k('보정 뒤')];
void RUN_LABEL_KEYS;
const methodOpts = (tr: T) => [
  { value: 1, label: tr('1면 (평면 1 · 베어링 1)') },
  { value: 2, label: tr('2면 (평면 1·2 · 베어링 1·2)') },
];
const caseOpts = (tr: T) => (Object.keys(BAL_CASES) as CaseId[]).map((id) => ({ value: id, label: tr(CASE_KEY[id]) }));
const ANGLE_OPTS = Array.from({ length: 12 }, (_, i) => ({ value: i * 30, label: `${i * 30}°` }));
const noiseOpts = (tr: T) => [0, 1, 3].map((v) => ({ value: v, label: v === 0 ? tr('없음') : `${v} µm p-p` }));
const um = (z: Cx) => toUmPP(cabs(z));
/** 이론상 0인 값의 부동소수점 찌꺼기는 0으로 (I-019) */
const clean = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v);
const wtxt = (w: Weight) => `${formatNumber(w.g, 3)} g∠${formatNumber(w.deg, 4)}°`;
const vtxt = (z: Cx) => (um(z) < 1e-9 ? '0' : `${formatNumber(um(z), 3)} µm∠${formatNumber(angleOf(z), 3)}°`);
const vec = (z: Cx, name: string, color: string, label?: string): PolarSeries => ({
  amp: [0, clean(um(z))],
  lagDeg: [angleOf(z), angleOf(z)],
  name,
  color,
  mode: 'lines',
  width: 2.2,
  arrow: true,
  label,
});

export default function BalanceLab({ lang = 'ko' }: { lang?: Lang }) {
  const tr = makeT(lang, EN);
  const [method, setMethod] = useState<1 | 2>(1);
  const [caseId, setCaseId] = useState<CaseId>('static');
  const [trialG, setTrialG] = useState(30);
  const [trialDeg, setTrialDeg] = useState(0);
  const [noise, setNoise] = useState(0);
  const [split, setSplit] = useState(false);
  const [runout, setRunout] = useState(false);
  const [reveal, setReveal] = useState(false);

  const r = useMemo(
    () => balance({ method, caseId, trialG, trialDeg, noise, holes: split ? 12 : 0, runoutUncomp: runout }),
    [method, caseId, trialG, trialDeg, noise, split, runout],
  );
  const V0 = r.runs[0].meas;
  const V1 = r.runs[1].meas;
  const V2 = method === 2 ? r.runs[2].meas : null;
  const rMax = Math.max(10, ...r.runs.flatMap((q) => q.meas.map(um))) * 1.15;

  const polar = (j: 0 | 1): PolarSeries[] => [
    vec(V0[j], tr('처음 (런 0)'), 'var(--plot-1)', 'V₀'),
    vec(V1[j], tr('시험추 평면 1 (런 1)'), 'var(--plot-2)', 'V₁'),
    ...(V2 ? [vec(V2[j], tr('시험추 평면 2 (런 2)'), 'var(--plot-4)', 'V₂')] : []),
    vec(r.afterMeas[j], tr('보정 뒤 (센서)'), 'var(--plot-3)'),
    { amp: [um(V0[j]), um(V1[j])], lagDeg: [angleOf(V0[j]), angleOf(V1[j])], name: tr('ΔV (평면 1 시험추의 몫)'), color: 'var(--status-wip)', mode: 'lines', dash: true, width: 1.6 },
  ];

  const dV1 = csub(V1[0], V0[0]);
  const corrTxt = r.correction.filter((w) => w.g > 1e-9).map(wtxt).join(' · ');
  const installedTxt = r.installed
    .map((ws, p) => (ws.length ? tr`평면 ${p + 1}: ${ws.map(wtxt).join(' + ')}` : ''))
    .filter(Boolean)
    .join(' / ');
  const reduce = (j: 0 | 1) => 100 * (1 - um(r.afterTrue[j]) / um(V0[j]));
  const exactTxt = r.exact.map((w, p) => tr`평면 ${p + 1} ${wtxt(w)}`).join(' · ');

  return (
    <LabFrame
      id="LAB-BAL-01"
      title={tr`영향계수 밸런싱`}
      lang={lang}
      controls={
        <>
          <ParamSelect label={tr`방법`} value={method} options={methodOpts(tr)} onChange={(v) => setMethod(Number(v) as 1 | 2)} />
          <ParamSelect label={tr`숨은 불평형`} value={caseId} options={caseOpts(tr)} onChange={(v) => setCaseId(v as CaseId)} />
          <ParamSlider label={tr`시험추 질량 (반지름 200 mm)`} value={trialG} min={5} max={150} step={5} unit="g" onChange={setTrialG} />
          <ParamSelect label={tr`시험추 각 (회전 반대 방향)`} value={trialDeg} options={ANGLE_OPTS} onChange={(v) => setTrialDeg(Number(v))} />
          <ParamSelect label={tr`런마다 측정 흔들림 σ`} value={noise} options={noiseOpts(tr)} onChange={(v) => setNoise(Number(v))} />
          <ParamToggle label={tr`보정추를 구멍 12개(30°마다)에 나눠 달기`} checked={split} onChange={setSplit} />
          <ParamToggle label={tr`slow roll 보상 안 함`} checked={runout} onChange={setRunout} hint={tr`런아웃(B1 4 µm, B2 3 µm)이 측정값에 섞인다`} />
          <ParamToggle label={tr`숨은 불평형과 정확한 보정추 보기`} checked={reveal} onChange={setReveal} />
        </>
      }
      formulas={
        method === 1 && r.H ? (
          <>
            <Formula
              display
              tex={`H = \\dfrac{V_1 - V_0}{W_t} = \\dfrac{${texNumber(um(dV1), 3)}\\angle ${texNumber(angleOf(dV1), 3)}^\\circ\\ \\mu\\text{m}}{${trialG}\\angle ${trialDeg}^\\circ\\ \\text{g}} = ${texNumber(um(dV1) / trialG, 3)}\\angle ${texNumber(angleOf(r.H), 3)}^\\circ\\ \\mu\\text{m/g}`}
            />
            <Formula
              display
              tex={`W_c = -\\dfrac{V_0}{H} = \\dfrac{${texNumber(um(V0[0]), 3)}\\angle ${texNumber((angleOf(V0[0]) + 180) % 360, 4)}^\\circ}{${texNumber(um(dV1) / trialG, 3)}\\angle ${texNumber(angleOf(r.H), 3)}^\\circ} = ${texNumber(r.correction[0].g, 3)}\\ \\text{g}\\angle ${texNumber(r.correction[0].deg, 4)}^\\circ`}
            />
          </>
        ) : (
          <>
            <Formula display tex={`\\begin{bmatrix} V_{B1} \\\\ V_{B2} \\end{bmatrix} = \\begin{bmatrix} A_{11} & A_{12} \\\\ A_{21} & A_{22} \\end{bmatrix} \\begin{bmatrix} W_1 \\\\ W_2 \\end{bmatrix} + V_0,\\qquad W = -A^{-1} V_0`} />
            <Formula display tex={`A_{11} = \\dfrac{V_{1,B1} - V_{0,B1}}{W_t},\\ A_{21} = \\dfrac{V_{1,B2} - V_{0,B2}}{W_t},\\ A_{12} = \\dfrac{V_{2,B1} - V_{0,B1}}{W_t},\\ A_{22} = \\dfrac{V_{2,B2} - V_{0,B2}}{W_t}`} />
          </>
        )
      }
      readouts={
        <>
          <table className="readout-table">
            <caption>{tr`런 기록 (센서 값, µm p-p ∠ 회전 반대 방향)`}</caption>
            <thead>
              <tr>
                <th scope="col">{tr`런`}</th>
                <th scope="col">{tr`단 추`}</th>
                <th scope="col">{tr`베어링 1`}</th>
                <th scope="col">{tr`베어링 2`}</th>
              </tr>
            </thead>
            <tbody>
              {r.runs.map((q) => (
                <tr key={q.label}>
                  <th scope="row">{tr(q.label)}</th>
                  <td>{q.weights.map((w, p) => (w ? tr`평면 ${p + 1} ${wtxt(w)}` : '')).filter(Boolean).join(' · ') || '—'}</td>
                  <td>{vtxt(q.meas[0])}</td>
                  <td>{vtxt(q.meas[1])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ReadoutTable
            theoryLabel={tr`처음`}
            errorLabel={tr`변화`}
            rows={[
              { label: tr('보정 뒤 베어링 1 실제 움직임'), value: clean(um(r.afterTrue[0])), theory: um(V0[0]), unit: 'µm p-p', sig: 3 },
              { label: tr('보정 뒤 베어링 2 실제 움직임'), value: clean(um(r.afterTrue[1])), theory: um(V0[1]), unit: 'µm p-p', sig: 3 },
              { label: tr('보정 뒤 베어링 1 센서 값'), value: clean(um(r.afterMeas[0])), unit: 'µm p-p', sig: 3 },
              { label: tr('보정 뒤 베어링 2 센서 값'), value: clean(um(r.afterMeas[1])), unit: 'µm p-p', sig: 3 },
              { label: tr('베어링 1 줄어든 비율'), value: clean(reduce(0)), unit: '%', sig: 3 },
              { label: tr('베어링 2 줄어든 비율'), value: clean(reduce(1)), unit: '%', sig: 3 },
            ]}
          />
          <p className="lab-note">
            {tr`계산한 보정추:`} <strong>{corrTxt}</strong>
            {split && installedTxt ? <> → {tr`단 추:`} {installedTxt}</> : null}
            {reveal ? <> · {tr`정확한 보정추(숨은 불평형의 반대):`} {exactTxt}</> : null}
          </p>
        </>
      }
      tasks={[
        {
          question: tr('처음 상태(1면·정적 위주·시험추 30 g∠0°)에서 보정추와 보정 뒤 두 베어링의 진동은?'),
          answer: tr('보정추 54.7 g∠220.5°. 베어링 1은 33.7 → 0 µm이 되지만 베어링 2는 30.7 → 33.6 µm로 오히려 조금 커집니다. 평면 1의 추 하나로는 베어링 하나만 맞출 수 있습니다.'),
        },
        {
          question: tr('숨은 불평형을 커플 위주로 바꿉니다. 1면이면 베어링 2는? 방법을 2면으로 바꾸면?'),
          answer: tr('1면: 베어링 2가 40.5 → 36.7 µm로 거의 그대로입니다. 2면: 평면 1에 60 g∠290°, 평면 2에 60 g∠110°(서로 반대쪽 — 커플)가 계산되고 두 베어링이 함께 0이 됩니다.'),
        },
        {
          question: tr('1면·정적 위주로 돌아와 측정 흔들림을 3 µm로 둡니다. 시험추 10 g과 60 g에서 보정 뒤 베어링 1의 실제 움직임은?'),
          answer: tr('10 g: 보정추가 29.2 g∠227.1°로 빗나가 15.9 µm가 남습니다. 시험추 효과(약 6 µm)가 흔들림의 2배 남짓이라 영향계수가 크게 틀립니다. 60 g: 46.3 g∠219.6°, 5.2 µm. 시험추는 흔들림보다 뚜렷한 변화를 만들어야 합니다.'),
        },
        {
          question: tr('흔들림을 없애고 2면·동적, 구멍 12개 나눠 달기를 켭니다. 어디에 몇 g을 다나요?'),
          answer: tr('평면 1: 계산값 70 g∠20° → 0°에 24.3 g + 30°에 47.9 g. 평면 2: 30 g∠140° → 120°에 10.4 g + 150°에 20.5 g. 벡터 합이 같아 보정 뒤 진동은 0입니다.'),
        },
        {
          question: tr('2면·정적 위주에서 "slow roll 보상 안 함"을 켭니다. 보정 뒤 센서 값과 실제 움직임은?'),
          answer: tr('센서는 두 베어링 모두 0을 읽지만 실제 축은 베어링 1이 4 µm, 베어링 2가 3 µm로 흔들립니다(런아웃의 반대 방향). 런아웃까지 추로 지우려 한 셈이라, 축이 런아웃과 반대로 흔들리도록 맞춰진 것입니다. 밸런싱 전에 slow roll 벡터를 빼야 합니다(P3-3).'),
        },
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        <div>
          <p className="lab-note">{tr`베어링 1 (Polar, µm p-p)`}</p>
          <PolarPlot series={polar(0)} rMax={rMax} unit="µm" ariaLabel={tr`베어링 1의 런별 1X 벡터`} maxWidth={380} />
        </div>
        <div>
          <p className="lab-note">{tr`베어링 2 (Polar, µm p-p)`}</p>
          <PolarPlot series={polar(1)} rMax={rMax} unit="µm" ariaLabel={tr`베어링 2의 런별 1X 벡터`} maxWidth={380} />
        </div>
      </div>
    </LabFrame>
  );
}
