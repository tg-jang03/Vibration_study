import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import PolarPlot from '../ui/PolarPlot';
import ReadoutTable from '../ui/ReadoutTable';
import OneXRotor from './OneXRotor';
import { formatNumber } from '../../lib/format';
import { CAUSE_LABEL, ONEX_CAUSES, oneXReadouts, orbit1X, QUIZ_CASES, ROTOR_1X, sweep, type OneXCause, type OneXOptions, type Sensor } from '../../lib/faults/oneX';

/**
 * LAB-1X-01 1X 감별: 1X가 크면 무엇일까 (P7-2, Contents §5).
 * 원인을 고르거나(직접) 숨긴 채(맞히기) 코스트다운 Bode·2X·두 베어링 벡터·오빗과 읽음값으로 원인을 가른다.
 * 계산: lib/faults/oneX.ts (본문 그림 2 ~ 7과 같은 로터). 진폭은 µm p-p(= 2 × Peak).
 */

type Mode = 'pick' | 'quiz';
export interface OneXState {
  mode: Mode;
  cause: OneXCause | 'healthy';
  severity: number;
  quiz: number;
  answer: boolean;
  compensate: boolean;
}

const R = ROTOR_1X;
const pp = (m: number) => 2e6 * m;
const CAUSE_OPTIONS = [{ value: 'healthy' as const, label: '건전' }, ...ONEX_CAUSES.map((c) => ({ value: c, label: CAUSE_LABEL[c] }))];
const QUIZ_OPTIONS = QUIZ_CASES.map((_, i) => ({ value: i, label: `케이스 ${i + 1}` }));
const MODE_OPTIONS = [
  { value: 'pick' as const, label: '원인을 골라 보기' },
  { value: 'quiz' as const, label: '숨은 원인 맞히기 (케이스 7개)' },
];
const WHY: Record<OneXCause, string> = {
  static: '저속 1X가 작고 회전수 2배에 약 4.5배, 두 베어링이 같은 쪽(위상차 약 0°), 수평·수직 위상차 약 90°',
  couple: '회전수에 따라 약 4배로 커지고 두 베어링 위상차가 약 180°(164°)',
  dynamic: '회전수에 따라 약 4배, 두 베어링 위상차가 0°와 180° 사이',
  bow: 'slow roll 1X가 크고(31 µm) 회전수와 함께 커지며(47 µm), 보상해도 17 µm가 남는다. 두 베어링 동상',
  runout: 'slow roll 1X(32 µm)가 운전 회전수 값(34 µm)과 거의 같고, 보상하면 건전한 로터 수준으로 사라진다',
  crack: '2X가 2500 rpm(병진 모드 5000 rpm의 절반)에서 20 µm 봉우리를 세운다',
  directional: '수평이 수직의 3.3배, 수평·수직 위상차 11°(선 모양 오빗), 저속에서도 크다(회전수 비 1.4)',
  resonance: '베어링 1 수평만 2850 rpm에서 117 µm로 솟고 그 둘레에서 위상이 크게(약 130°) 바뀐다. 회전수 비 17',
};
const SHOW: { s: Sensor; name: string; color: string }[] = [
  { s: 'B1H', name: '베어링 1 수평', color: 'var(--plot-1)' },
  { s: 'B1V', name: '베어링 1 수직', color: 'var(--plot-2)' },
  { s: 'B2H', name: '베어링 2 수평', color: 'var(--plot-3)' },
];
const r1 = (v: number) => Math.round(v * 10) / 10;

export default function OneXLab({ initial = {} }: { initial?: Partial<OneXState> }) {
  const [p, setP] = useState<OneXState>({ mode: 'pick', cause: 'static', severity: 60, quiz: 0, answer: false, compensate: false, ...initial });
  const set = <K extends keyof OneXState>(k: K) => (v: OneXState[K]) => setP((q) => ({ ...q, [k]: v, ...(k === 'quiz' ? { answer: false } : {}) }));
  const o: OneXOptions = useMemo(() => (p.mode === 'quiz' ? { cause: QUIZ_CASES[p.quiz], severity: 0.6 } : { cause: p.cause, severity: p.severity / 100 }), [p.mode, p.cause, p.severity, p.quiz]);
  const rd = useMemo(() => oneXReadouts(o), [o]);
  const bode = useMemo(() => SHOW.map((c) => ({ ...c, pts: sweep(o, c.s, 1, 25, p.compensate) })), [o, p.compensate]);
  const two = useMemo(() => SHOW.slice(0, 2).map((c) => ({ ...c, pts: sweep(o, c.s, 2, 25) })), [o]);
  const orb = useMemo(() => orbit1X(o, 'B1', R.opRpm, 121), [o]);

  const aMax = Math.max(20, ...bode.flatMap((b) => b.pts.map((q) => pp(q.amp)))) * 1.1;
  const tMax = Math.max(5, ...two.flatMap((b) => b.pts.map((q) => pp(q.amp)))) * 1.15;
  const ampSeries: PlotSeries[] = bode.map((b) => ({ x: b.pts.map((q) => q.rpm), y: b.pts.map((q) => pp(q.amp)), name: b.name, color: b.color, width: 2 }));
  const lagSeries: PlotSeries[] = bode.map((b) => ({ x: b.pts.map((q) => q.rpm), y: b.pts.map((q) => q.lagDeg), name: b.name, color: b.color, mode: 'markers', markerSize: 3, hideInLegend: true }));
  const vMax = Math.max(pp(rd.op.B1H.amp), pp(rd.op.B2H.amp), 5) * 1.2;

  // 오빗 (베어링 1, 운전 회전수): 같은 축척, 위 = 수직
  const oMax = Math.max(...orb.x.map(Math.abs), ...orb.y.map(Math.abs), 1e-9);
  const S = 70 / oMax;
  const path = orb.x.map((x, i) => `${i ? 'L' : 'M'}${r1(90 + S * x)},${r1(90 - S * orb.y[i])}`).join('');

  const quiz = p.mode === 'quiz';
  const cause = o.cause as OneXCause | 'healthy';
  const title = quiz ? `케이스 ${p.quiz + 1}${p.answer ? ` — ${CAUSE_LABEL[cause as OneXCause]}` : ''}` : cause === 'healthy' ? '건전' : CAUSE_LABEL[cause];

  return (
    <LabFrame id="LAB-1X-01" title="1X 감별: 1X가 크면 무엇일까"
      controls={<>
        <ParamSelect label="보기 방식" value={p.mode} options={MODE_OPTIONS} onChange={set('mode')} />
        {quiz ? <>
          <ParamSelect label="케이스" value={p.quiz} options={QUIZ_OPTIONS} onChange={set('quiz')} />
          <ParamToggle label="정답 보기" checked={p.answer} onChange={set('answer')} />
        </> : <>
          <ParamSelect label="원인" value={p.cause} options={CAUSE_OPTIONS} onChange={set('cause')} />
          <ParamSlider label="정도" value={p.severity} min={0} max={100} step={5} unit="%" onChange={set('severity')} disabled={p.cause === 'healthy'} />
        </>}
        <ParamToggle label={`slow roll 보상 (${R.slowRollRpm} rpm 벡터를 뺌)`} checked={p.compensate} onChange={set('compensate')} />
      </>}
      readouts={<ReadoutTable caption={`읽음값 (${title}, ${R.opRpm} rpm · 베어링 1 수평 기준)`} rows={[
        { label: `1X 베어링 1 수평 (${R.opRpm} rpm)`, value: pp(rd.op.B1H.amp), unit: 'µm p-p', sig: 3 },
        { label: '1X 베어링 1 수평 위상 지연', value: rd.op.B1H.lagDeg, unit: '°', sig: 3 },
        { label: `slow roll 1X (${R.slowRollRpm} rpm)`, value: pp(rd.slowRoll.B1H.amp), unit: 'µm p-p', sig: 3 },
        { label: `${R.opRpm} rpm ÷ ${R.opRpm / 2} rpm의 1X (불평형이면 약 4)`, value: rd.ratioHalfSpeed, sig: 2 },
        { label: '수평 ÷ 수직 (베어링 1)', value: rd.hvRatio, sig: 2 },
        { label: '수평·수직 위상차 (수직 지연 − 수평 지연)', value: rd.hvPhase, unit: '°', sig: 2 },
        { label: '두 베어링 위상차 (수평, 베어링 2 − 베어링 1)', value: rd.b12Phase, unit: '°', sig: 3 },
        { label: 'slow roll 보상 뒤 1X', value: pp(rd.compensated), unit: 'µm p-p', sig: 2 },
        { label: '코스트다운 중 가장 큰 1X · 그 회전수', value: pp(rd.oneXmax), unit: `µm p-p @ ${rd.oneXmaxRpm} rpm`, sig: 3 },
        { label: '코스트다운 중 가장 큰 2X · 그 회전수', value: pp(rd.twoXmax), unit: rd.twoXmax > 0 ? `µm p-p @ ${rd.twoXmaxRpm} rpm` : 'µm p-p', sig: 2 },
      ]} />}
      tasks={[
        { question: '처음 상태(정적 불평형 60 %)에서 회전수 비, 두 베어링 위상차, 수평·수직 위상차를 읽으세요.',
          answer: `회전수 비 ${formatNumber(oneXReadouts({ cause: 'static', severity: 0.6 }).ratioHalfSpeed, 2)}(원심력 ∝ 회전수² → 약 4, 병진 모드에 다가가며 조금 더), 두 베어링 위상차 약 −3°(같은 쪽), 수평·수직 위상차 약 89°(정방향으로 도는 힘)입니다. 원인을 커플 불평형으로 바꾸면 두 베어링 위상차가 약 −164°로 바뀝니다.` },
        { question: '원인을 휨 → 런아웃으로 바꾸며 slow roll 1X와 운전 회전수 1X를 비교하고, slow roll 보상을 켜 보세요.',
          answer: '휨은 slow roll 31 µm → 운전 47 µm로 커지고 보상 뒤 17 µm가 남습니다. 런아웃은 32 → 34 µm로 거의 그대로이고 보상하면 1.7 µm(건전 수준)로 사라집니다. 둘 다 저속에서 1X가 크다는 점은 같지만, 회전수에 따라 커지는지가 다릅니다.' },
        { question: '원인을 크랙으로 바꾸고 2X 그래프를 보세요. 봉우리는 몇 rpm에 있나요?',
          answer: '수평 2500 rpm(20 µm p-p), 수직 2800 rpm입니다. 병진 모드 고유 회전수(수평 5000 · 수직 5600 rpm)의 절반에서 2X 힘의 주파수가 모드와 맞습니다. 1X만 보면 크랙은 휨과 비슷하게(slow roll 11.5 µm) 보입니다.' },
        { question: '보기 방식을 "숨은 원인 맞히기"로 바꾸고 케이스 1 ~ 7을 본문 그림 8의 순서로 가려 보세요.',
          answer: '케이스 1 휨, 2 정적 불평형, 3 구조 공진, 4 런아웃, 5 방향이 정해진 힘, 6 크랙, 7 커플 불평형입니다. 각 케이스에서 "정답 보기"를 켜면 근거가 나옵니다.' },
      ]}
      footer={<p>설명용 모델입니다: 베어링 두 개로 받친 대칭 강성 로터(병진 모드 수평 {R.trans.H} · 수직 {R.trans.V} rpm, 원추 모드 {R.conic.H} · {R.conic.V} rpm)를 {R.opRpm} rpm에서 세우며(코스트다운) 1X·2X 벡터를 25 rpm마다 기록합니다. 크기는 판정 기준이 아닙니다. 실제 기계는 원인이 섞이므로 한 숫자로 정하지 않고 여러 증거를 함께 봅니다.</p>}
    >
      {quiz && p.answer && cause !== 'healthy' && <p className="lab-note"><strong>{CAUSE_LABEL[cause]}</strong> — {WHY[cause]}</p>}
      <h4>로터를 옆에서 보면: {R.opRpm} rpm에서 축이 어떻게 흔들리나</h4>
      <OneXRotor o={o} reveal={!quiz || p.answer} />
      <h4>코스트다운 Bode — 1X {p.compensate ? '(slow roll 보상 뒤)' : ''}</h4>
      <Plot series={ampSeries} x={{ label: '회전수 [rpm]', range: [0, R.opRpm] }} y={{ label: '1X [µm p-p]', range: [0, aMax] }} height={210} ariaLabel="1X 진폭 대 회전수" />
      <Plot series={lagSeries} x={{ label: '회전수 [rpm]', range: [0, R.opRpm] }} y={{ label: '위상 지연 [°]', range: [0, 360] }} height={170} ariaLabel="1X 위상 대 회전수" />
      <h4>코스트다운 2X (베어링 1)</h4>
      <Plot series={two.map((b) => ({ x: b.pts.map((q) => q.rpm), y: b.pts.map((q) => pp(q.amp)), name: b.name, color: b.color, width: 2 }))} x={{ label: '회전수 [rpm]', range: [0, R.opRpm] }} y={{ label: '2X [µm p-p]', range: [0, tMax] }} height={160} ariaLabel="2X 진폭 대 회전수" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <h4>{R.opRpm} rpm의 1X 벡터 (수평)</h4>
          <PolarPlot rMax={vMax} unit="µm" maxWidth={300} ariaLabel="두 베어링 수평 1X 벡터" series={[
            { amp: [0, pp(rd.op.B1H.amp)], lagDeg: [rd.op.B1H.lagDeg, rd.op.B1H.lagDeg], name: '베어링 1', color: 'var(--plot-1)', arrow: true, width: 2.5 },
            { amp: [0, pp(rd.op.B2H.amp)], lagDeg: [rd.op.B2H.lagDeg, rd.op.B2H.lagDeg], name: '베어링 2', color: 'var(--plot-3)', arrow: true, width: 2.5 },
          ]} />
        </div>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <h4>베어링 1 오빗 ({R.opRpm} rpm, 1X)</h4>
          <svg viewBox="0 0 180 180" width="100%" style={{ maxWidth: 260 }} role="img" aria-label="베어링 1의 1X 오빗">
            <line x1="10" y1="90" x2="170" y2="90" stroke="var(--border)" />
            <line x1="90" y1="10" x2="90" y2="170" stroke="var(--border)" />
            <text x="172" y="86" fontSize="10" fill="var(--text-muted)" textAnchor="end">H</text>
            <text x="94" y="18" fontSize="10" fill="var(--text-muted)">V</text>
            <path d={path} fill="none" stroke="var(--plot-1)" strokeWidth="2" />
          </svg>
          <p className="lab-note">축척은 오빗마다 맞춘다 (모양만 본다). 크기는 읽음값으로.</p>
        </div>
      </div>
    </LabFrame>
  );
}
