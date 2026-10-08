import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { caseConditions, mainSub, onsetOffset, rpmSweep, SUB_CASES, SUB_CAUSES, SUB_LABEL, SUB_MACHINE, subOrbit, subState, type Conditions, type SubCause } from '../../lib/faults/subsync';

/**
 * LAB-SUB-01 1X 아래 성분 감별 (P7-4, Contents §5).
 * 원인과 운전조건(유온·베어링 하중·공정 부하)을 바꾸며 런업 캐스케이드, 운전 회전수의 Full spectrum, 오빗·키페이저 점,
 * 나타남·사라짐 회전수를 보고, 숨은 원인 케이스 7개를 가린다. 계산: lib/faults/subsync.ts (설명용 규칙 모델, 본문 그림과 같음).
 */

type Mode = 'pick' | 'quiz';
export interface SubsyncState {
  mode: Mode;
  cause: SubCause;
  quiz: number;
  answer: boolean;
  rpm: number;
  oilT: number;
  load: number;
  flow: number;
}

const M = SUB_MACHINE;
const MODE_OPTIONS = [
  { value: 'pick' as const, label: '원인을 골라 보기' },
  { value: 'quiz' as const, label: '숨은 원인 맞히기 (케이스 7개)' },
];
const CAUSE_OPTIONS = SUB_CAUSES.map((c) => ({ value: c, label: SUB_LABEL[c] }));
const QUIZ_OPTIONS = SUB_CASES.map((_, i) => ({ value: i, label: `케이스 ${i + 1}` }));
const WHY: Record<SubCause, string> = {
  oilfilm: '0.45X로 회전수를 따라가다 50 Hz(1차 모드)에 잠기고, 정방향이며 키페이저 점이 흩어집니다. 런업 4800 rpm에 나타나 코스트다운 4200 rpm까지 남고(히스테리시스), 유온·베어링 하중을 올리면 휠은 사라집니다(휩은 남을 수 있음).',
  steam: '회전수가 아니라 공정 부하가 80 %를 넘을 때 50 Hz 근처에 나타납니다. 정방향, 유온과 무관하고 부하를 내리면 사라집니다.',
  rub: '임계속도의 약 2배 구간에서만 정확히 ½X와 1½X가 서고, 키페이저 점이 두 자리에 고정되며 역방향 성분이 큽니다. 유온·하중과 무관합니다.',
  looseness: '정확히 ½X와 그 정수배 무리가 서고, 정·역이 같아 한 방향으로 흔들립니다. 베어링 하중을 키우면 눌려서 작아집니다.',
  stall: '공정 유량이 75 % 아래로 줄 때 0.17 ~ 0.2X에 나타나고 유량이 줄수록 커집니다. 베어링 조건과 무관합니다.',
  structural: '회전수와 무관하게 38 Hz에 서고, 정·역이 같습니다. 어떤 운전조건에도 반응하지 않습니다 → 임팩트 시험(P9-1).',
};
const r1 = (v: number) => Math.round(v * 10) / 10;

export default function SubsyncLab({ initial = {} }: { initial?: Partial<SubsyncState> }) {
  const [p, setP] = useState<SubsyncState>({ mode: 'pick', cause: 'oilfilm', quiz: 0, answer: false, rpm: 6000, oilT: M.base.oilT, load: M.base.load, flow: M.base.flow, ...initial });
  const set = <K extends keyof SubsyncState>(k: K) => (v: SubsyncState[K]) =>
    setP((q) => {
      const next = { ...q, [k]: v };
      // 케이스를 고르면 그 케이스의 회전수·조건으로 맞춘다
      if (k === 'quiz' || (k === 'mode' && v === 'quiz')) {
        const c = SUB_CASES[k === 'quiz' ? (v as number) : q.quiz];
        const cc = caseConditions(c.cause);
        return { ...next, answer: false, rpm: c.rpm, oilT: cc.oilT, load: cc.load, flow: cc.flow };
      }
      return next;
    });
  const cause: SubCause = p.mode === 'quiz' ? SUB_CASES[p.quiz].cause : p.cause;
  const cond: Conditions = { oilT: p.oilT, load: p.load, flow: p.flow };
  const st = useMemo(() => subState(cause, p.rpm, cond), [cause, p.rpm, p.oilT, p.load, p.flow]);
  const main = mainSub(st);
  const oo = useMemo(() => onsetOffset(cause, cond), [cause, p.oilT, p.load, p.flow]);
  const f = p.rpm / 60;

  // 런업 캐스케이드 (회전수 × 주파수, 진폭 = 반지름 합)
  const heat = useMemo(() => {
    const rpms = rpmSweep(150);
    const hz = Array.from({ length: 131 }, (_, i) => i);
    const z = hz.map(() => new Array<number>(rpms.length).fill(0));
    rpms.forEach((r, j) => {
      const s = subState(cause, r, cond, 'up');
      const comps = [{ hz: r / 60, a: s.oneX }, ...s.lines.map((l) => ({ hz: l.hz, a: l.fwd + l.bwd }))];
      for (const c of comps)
        for (let i = 0; i < hz.length; i++) {
          const d = (hz[i] - c.hz) / 1.2;
          if (Math.abs(d) < 4) z[i][j] += c.a * Math.exp(-0.5 * d * d);
        }
    });
    return { x: rpms, y: hz, z };
  }, [cause, p.oilT, p.load, p.flow]);

  const orb = useMemo(() => subOrbit(st, 12, 72), [st]);
  const oMax = Math.max(1, ...orb.x.map(Math.abs), ...orb.y.map(Math.abs));
  const S = 80 / oMax;
  const path = orb.x.map((x, i) => `${i ? 'L' : 'M'}${r1(90 + S * x)},${r1(90 - S * orb.y[i])}`).join('');

  const fullX: number[] = [];
  const fullY: number[] = [];
  for (const c of [{ hz: f, fwd: st.oneX, bwd: 0 }, ...st.lines]) {
    fullX.push(c.hz / f, -c.hz / f);
    fullY.push(c.fwd, c.bwd);
  }
  const quiz = p.mode === 'quiz';
  const title = quiz ? `케이스 ${p.quiz + 1}${p.answer ? ` — ${SUB_LABEL[cause]}` : ''}` : SUB_LABEL[cause];

  return (
    <LabFrame id="LAB-SUB-01" title="1X 아래 성분 감별: 어느 원인의 줄인가"
      controls={<>
        <ParamSelect label="보기 방식" value={p.mode} options={MODE_OPTIONS} onChange={set('mode')} />
        {quiz ? <>
          <ParamSelect label="케이스" value={p.quiz} options={QUIZ_OPTIONS} onChange={set('quiz')} />
          <ParamToggle label="정답 보기" checked={p.answer} onChange={set('answer')} />
        </> : <ParamSelect label="원인" value={p.cause} options={CAUSE_OPTIONS} onChange={set('cause')} />}
        <ParamSlider label="운전 회전수" value={p.rpm} min={M.rpmMin} max={M.rpmMax} step={150} unit="rpm" onChange={set('rpm')} hint={`1차 임계속도 ${M.criticalRpm} rpm의 ${formatNumber(p.rpm / M.criticalRpm, 3)}배`} />
        <ParamSlider label="오일 공급 온도" value={p.oilT} min={40} max={60} step={1} unit="°C" onChange={set('oilT')} />
        <ParamSlider label="베어링 하중 (기준 = 1)" value={p.load} min={0.5} max={1.5} step={0.05} onChange={set('load')} />
        <ParamSlider label="공정 부하 (유량)" value={p.flow} min={50} max={110} step={5} unit="%" onChange={set('flow')} />
      </>}
      readouts={<ReadoutTable caption={`읽음값 (${title}, ${p.rpm} rpm)`} rows={[
        { label: '가장 큰 1X 아래 성분 [Hz]', value: main ? main.hz : 0, unit: 'Hz', sig: 3 },
        { label: '그 성분의 차수 (× 회전 주파수)', value: main ? main.hz / f : 0, sig: 3 },
        { label: '정방향 원의 반지름', value: main ? main.fwd : 0, unit: 'µm', sig: 2 },
        { label: '역방향 원의 반지름', value: main ? main.bwd : 0, unit: 'µm', sig: 2 },
        { label: '런업에서 나타나는 회전수 (없으면 0)', value: oo.onsetRpm ?? 0, unit: 'rpm', sig: 4 },
        { label: '코스트다운에서 마지막까지 보이는 회전수', value: oo.offRpm ?? 0, unit: 'rpm', sig: 4 },
        { label: '1X 반지름', value: st.oneX, unit: 'µm', sig: 2 },
      ]} />}
      tasks={[
        { question: '유체막 불안정을 고르고 회전수를 4500 → 6000 → 7200 rpm으로 올리며 1X 아래 성분의 Hz와 차수를 읽으세요. 나타남·사라짐 회전수는?',
          answer: '4500 rpm에는 없고, 6000 rpm에서 45 Hz(0.45X, 오일 휠), 7200 rpm에서 50 Hz(0.417X, 1차 모드에 잠긴 오일 휩)입니다. 런업에서는 4800 rpm에 나타나고 코스트다운에서는 4200 rpm까지 남습니다 — 히스테리시스입니다.' },
        { question: '같은 원인에서 6000 rpm과 7200 rpm 각각 유온을 60 °C로, 또는 베어링 하중을 1.5로 올려 보세요.',
          answer: '6000 rpm의 휠은 유온 약 58 °C 위나 하중 1.5에서 사라집니다(문턱이 6000 rpm 위로 올라감). 7200 rpm의 휩은 문턱(6240·6120 rpm)이 올라가도 여전히 운전 회전수 아래라 그대로입니다. 휠은 운전조건으로 다스려지기도 하지만, 휩은 베어링 설계를 바꿔야 할 때가 많습니다(P4-4 §7).' },
        { question: '6300 rpm에서 원인을 부분 러브 → 회전 풀림 → 유체막 불안정으로 바꾸며 차수·정역 성분·오빗의 키페이저 점을 비교하세요.',
          answer: '러브와 풀림은 정확히 0.5X(52.5 Hz)이고 키페이저 점이 두 자리에 고정됩니다. 러브는 역방향이 정방향의 0.7배, 풀림은 정·역이 같아(선) 한 방향으로 흔들립니다. 유체막은 0.45X(47.25 Hz)로 절반에서 조금 낮고, 정방향이며 점이 흩어집니다.' },
        { question: '보기 방식을 "숨은 원인 맞히기"로 바꾸고 케이스 1 ~ 7을 가려 보세요. 조건 슬라이더를 움직여 확인해도 됩니다.',
          answer: '케이스 1 러브, 2 오일 휠, 3 구조 공진, 4 Rotating stall(유량 60 %), 5 오일 휩, 6 회전 풀림, 7 유체력 선회입니다. "정답 보기"를 켜면 근거가 나옵니다.' },
      ]}
      footer={<p>설명용 규칙 모델입니다: 미끄럼베어링 압축기(1차 임계 {M.criticalRpm} rpm = {M.fn} Hz)에서 원인마다 1X 아래 성분이 회전수·운전조건에 따라 서는 경향을 문헌의 정성적 관찰로 옮겼습니다(유체막 문턱 4800 rpm × 하중^0.6 × (1 + 0.03 × (유온 − 50)), 휠 비 0.45, 내릴 때 문턱의 85 %까지 남음 등). 실제 기계의 문턱·주파수는 베어링·씰·공정에 따라 다르며, 크기는 판정 기준이 아닙니다.</p>}
    >
      {quiz && p.answer && <p className="lab-note"><strong>{SUB_LABEL[cause]}</strong> — {WHY[cause]}</p>}
      <h4>런업 캐스케이드 (현재 운전조건, 점선 = 0.5X · f_n)</h4>
      <Plot series={[
        { x: [M.rpmMin, M.rpmMax], y: [M.rpmMin / 120, M.rpmMax / 120], name: '0.5X', color: 'var(--text-muted)', dash: 'dot', width: 1 },
        { x: [M.rpmMin, M.rpmMax], y: [M.fn, M.fn], name: 'f_n', color: 'var(--text-muted)', dash: 'dash', width: 1 },
        { x: [p.rpm, p.rpm], y: [0, 130], name: '운전 회전수', color: 'var(--status-wip)', width: 1.5 },
      ]} heatmap={{ ...heat, zRange: [0, 30], colorLabel: 'µm' }} x={{ label: '회전수 [rpm]', range: [M.rpmMin, M.rpmMax] }} y={{ label: '주파수 [Hz]', range: [0, 130] }} height={300} ariaLabel="런업 캐스케이드" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: '2 1 320px', minWidth: 0 }}>
          <h4>Full spectrum ({p.rpm} rpm, − 역방향 · + 정방향)</h4>
          <Plot series={[{ x: fullX, y: fullY, name: '원의 반지름', color: 'var(--plot-4)', kind: 'bar', barWidth: 0.06 }]} x={{ label: '차수', range: [-3.2, 3.2] }} y={{ label: '[µm]', range: [0, Math.max(30, ...fullY) * 1.15] }} height={200} ariaLabel="Full spectrum" />
        </div>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <h4>오빗 (12바퀴, 점 = 키페이저)</h4>
          <svg viewBox="0 0 180 180" width="100%" style={{ maxWidth: 240 }} role="img" aria-label="오빗">
            <line x1="5" y1="90" x2="175" y2="90" stroke="var(--border)" />
            <line x1="90" y1="5" x2="90" y2="175" stroke="var(--border)" />
            <path d={path} fill="none" stroke="var(--plot-1)" strokeWidth="1.1" />
            {orb.dots.map(([x, y], i) => <circle key={i} cx={r1(90 + S * x)} cy={r1(90 - S * y)} r="2.6" fill="var(--status-wip)" />)}
          </svg>
        </div>
      </div>
    </LabFrame>
  );
}
