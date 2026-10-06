import { useMemo, useState, type ReactNode } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { decimateMax, G, MACHINE, measureChain, RANGE, type ChainCase, type ChainCheck, type ChainResult } from '../../lib/measurementChain';

/**
 * LAB-CHAIN-01 센서 문제인가, 기계 문제인가 (P3-4, Contents §5-1).
 * 사례마다 측정 체인의 함정 하나(또는 진짜 기계 진동)가 들어 있다. 확인 동작을 해 보며 무엇이 바뀌는지 보고 판정한다.
 * explore: 사례 하나를 설명과 함께 / quiz: 7개 사례를 섞어서, 판정을 고르면 맞았는지 알려 준다.
 * 계산: src/lib/measurementChain.ts (본문 그림 2 ~ 7과 같은 모델).
 */

type Kind = Exclude<ChainCase, 'normal'>;
const QUIZ_ORDER: Kind[] = ['groundLoop', 'machine', 'mount', 'clipping', 'skiSlope', 'openCable', 'cable'];

const CASES: Record<Kind, { scene: string; name: string; explain: string }> = {
  groundLoop: {
    scene: '새 휴대용 분석기를 공장 전원에 꽂고 쟀더니, 속도 스펙트럼에 지난달에 없던 막대가 몇 개 섰습니다.',
    name: '그라운드 루프 (전원 주파수 잡음)',
    explain: '60·180·300 Hz 막대는 회전수를 바꿔도 제자리에 남고, 접지를 분리하면 사라집니다. 두 접지 사이의 전위차가 케이블 실드로 흘러 전원 주파수와 그 홀수배가 섞였습니다 (5절).',
  },
  machine: {
    scene: '임펠러를 교체한 뒤 잰 1X가 지난달보다 크게 나왔습니다.',
    name: '기계의 진짜 진동',
    explain: '어떤 확인 동작을 해도 1X 7.5 mm/s가 남고, 회전수를 바꾸면 1X를 따라 40 Hz로 옮겨 가며 작아집니다. 측정 체인이 아니라 기계(불평형, P1-6)의 진동입니다. 체인을 확인한 덕분에 자신 있게 보고할 수 있습니다.',
  },
  mount: {
    scene: '베어링 상태를 보려고 탐침을 손으로 대고 쟀더니, 가속도 스펙트럼 2 kHz 둘레가 넓게 솟았습니다.',
    name: '설치 공진 (센서를 붙인 방법)',
    explain: '같은 자리에 스터드로 붙여 다시 재면 2 kHz 봉우리가 사라집니다. 손으로 대면 설치 공진이 2 kHz까지 내려와 그 둘레를 5배로 부풀립니다 (2절, P3-1). 회전수를 바꿔도 봉우리는 제자리입니다.',
  },
  clipping: {
    scene: '가속도 스펙트럼에 1X의 정수배가 줄지어 섰습니다. 풀림일까요?',
    name: '입력 넘침 (클리핑)',
    explain: '입력 넘침이 "있음"이고 시간파형 봉우리가 ±0.25 g에서 평평하게 잘렸습니다. 레인지를 올리면 정수배 막대가 사라지고 1X도 1.28 → 1.8 mm/s로 돌아옵니다 (6절, P2-3).',
  },
  skiSlope: {
    scene: '센서를 연결하자마자 쟀더니 속도 스펙트럼 왼쪽 끝이 치솟고, 전체 값이 평소의 세 배로 경보를 넘었습니다.',
    name: '저주파 부풀림 (ski-slope)',
    explain: '30초 기다렸다 다시 재면 사라집니다. 켠 직후 정착이 덜 된 아주 낮은 주파수의 흔들림이 2πf로 나누는 적분에서 크게 부풀었습니다. 가속도 스펙트럼에서는 거의 보이지 않고, 1X는 그대로입니다 (4절).',
  },
  openCable: {
    scene: '어제까지 1X 1.8 mm/s였던 펌프가 오늘은 거의 0으로 나왔습니다. 기계가 좋아졌을까요?',
    name: '센서·케이블 끊김 (바이어스 이상)',
    explain: '바이어스 전압이 23.8 V로 공급 전압 쪽에 붙어 있습니다 — 센서로 전류가 흐르지 않는 끊김입니다. 커넥터를 다시 꽂으면 11.6 V와 원래 진동이 돌아옵니다 (3절). 진동이 갑자기 사라지면 먼저 의심합니다.',
  },
  cable: {
    scene: '시간파형에 가끔 툭 튀는 펄스가 보이고, 잴 때마다 낮은 주파수 막대가 달라집니다.',
    name: '케이블·커넥터 잡음',
    explain: '커넥터를 조이고 케이블을 고정하면 사라집니다. 기다려도 그대로이므로 ski-slope(정착)와 다르고, 바이어스 전압이 정상이라 끊긴 것도 아닙니다 (6절).',
  },
};

const CHECK_OPTIONS: { value: ChainCheck; label: string }[] = [
  { value: 'none', label: '처음 측정 그대로' },
  { value: 'stud', label: '같은 자리에 스터드로 다시 붙여 재기' },
  { value: 'rpm', label: `회전수를 ${MACHINE.altRpm} rpm으로 바꿔 재기` },
  { value: 'isolate', label: '접지 분리 (절연 받침·배터리 분석기)' },
  { value: 'wait', label: '30초 기다렸다 다시 재기 (정착)' },
  { value: 'tieCable', label: '커넥터를 다시 꽂아 조이고 케이블 고정' },
  { value: 'range', label: `입력 레인지 올리기 (±${RANGE.tooSmall} → ±${RANGE.normal} g)` },
];
type Answer = Kind | 'unset';
const ANSWER_OPTIONS: { value: Answer; label: string }[] = [
  { value: 'unset', label: '— 판정을 고르세요 —' },
  ...(['machine', 'mount', 'skiSlope', 'groundLoop', 'openCable', 'cable', 'clipping'] as Kind[]).map((k) => ({ value: k, label: CASES[k].name })),
];

const mm = (v: number) => v * 1e3;

function feedbackBox(ok: boolean | null, children: ReactNode) {
  const color = ok === null ? 'var(--accent)' : ok ? 'var(--status-done)' : 'var(--status-wip)';
  return (
    <div style={{ borderLeft: `4px solid ${color}`, background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 6, margin: '8px 0 14px', lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

export interface ChainQuizLabProps {
  mode?: 'quiz' | 'explore';
  /** explore 모드에서 보여 줄 사례 */
  initialCase?: Kind;
  initialCheck?: ChainCheck;
}

export default function ChainQuizLab({ mode = 'quiz', initialCase = 'groundLoop', initialCheck = 'none' }: ChainQuizLabProps) {
  const quiz = mode === 'quiz';
  const [idx, setIdx] = useState(0);
  const [check, setCheck] = useState<ChainCheck>(initialCheck);
  const [answers, setAnswers] = useState<Answer[]>(() => QUIZ_ORDER.map(() => 'unset'));
  const [showBase, setShowBase] = useState(true);
  const kind: Kind = quiz ? QUIZ_ORDER[idx] : initialCase;
  const answer = answers[idx];

  const base = useMemo(() => measureChain('normal'), []);
  const r: ChainResult = useMemo(() => measureChain(kind, check), [kind, check]);

  const tMs = Array.from(r.t, (t) => t * 1e3);
  const waveSeries: PlotSeries[] = [
    { x: tMs, y: Array.from(r.wave, (a) => a / G), name: '가속도', color: 'var(--plot-1)', width: 1.2 },
    ...(r.overload
      ? [
          { x: [0, 200], y: [r.range, r.range], name: '입력 레인지', color: 'var(--status-wip)', dash: 'dash', width: 1.2 } as PlotSeries,
          { x: [0, 200], y: [-r.range, -r.range], name: '입력 레인지', color: 'var(--status-wip)', dash: 'dash', width: 1.2, hideInLegend: true } as PlotSeries,
        ]
      : []),
  ];
  const acc = (x: ChainResult) => decimateMax(x.freq, x.accelPower, 4, 5000);
  const ra = acc(r);
  const ba = acc(base);
  const toG = (p: number) => Math.max(Math.sqrt(p) / G, 1e-7);
  const accSeries: PlotSeries[] = [
    ...(showBase ? [{ x: ba.f, y: ba.y.map(toG), name: '지난달 정상 측정', color: 'var(--text-muted)', width: 1, opacity: 0.8 } as PlotSeries] : []),
    { x: ra.f, y: ra.y.map(toG), name: '지금 측정', color: 'var(--plot-2)', width: 1.3 },
  ];
  const kv = Math.floor(400 / r.df);
  const fv = Array.from(r.freq.subarray(1, kv + 1));
  const vel = (x: ChainResult) => Array.from(x.velPower.subarray(1, kv + 1), (p) => mm(Math.sqrt(p)));
  const rv = vel(r);
  const velTop = Math.max(2.5, ...rv) * 1.1;
  const velSeries: PlotSeries[] = [
    ...(showBase ? [{ x: fv, y: vel(base), name: '지난달 정상 측정', color: 'var(--text-muted)', width: 1, dash: 'dash' } as PlotSeries] : []),
    { x: fv, y: rv, name: '지금 측정', color: 'var(--plot-2)', width: 1.6 },
  ];

  const f1 = r.rpm / 60;
  const a1 = (r.oneX * 2 * Math.PI * f1) / G;
  const info = CASES[kind];
  const correct = answer !== 'unset' && answer === kind;
  const caseOptions = QUIZ_ORDER.map((k, i) => ({ value: i, label: `사례 ${i + 1}${answers[i] !== 'unset' ? (answers[i] === k ? ' ✓' : ' ✗') : ''}` }));
  const score = answers.filter((a, i) => a === QUIZ_ORDER[i]).length;

  return (
    <LabFrame id="LAB-CHAIN-01" title={quiz ? '센서 문제인가, 기계 문제인가: 판정 퀴즈' : `측정 체인 함정 살펴보기: ${info.name}`}
      controls={<>
        {quiz && <ParamSelect label="사례" value={idx} options={caseOptions} onChange={(v) => { setIdx(v); setCheck('none'); }} hint={`맞힌 사례 ${score} / ${QUIZ_ORDER.length}`} />}
        <ParamSelect label="확인 동작" value={check} options={CHECK_OPTIONS} onChange={setCheck} hint="하나씩 해 보고 무엇이 바뀌는지 보세요" />
        {quiz && <ParamSelect label="내 판정" value={answer} options={ANSWER_OPTIONS} onChange={(v) => setAnswers((a) => a.map((x, i) => (i === idx ? v : x)))} />}
        <ParamToggle label="지난달 정상 측정 겹쳐 보기 (회색)" checked={showBase} onChange={setShowBase} />
      </>}
      formulas={<>
        <Formula display tex={`v = \\frac{a}{2\\pi f} \\quad\\Rightarrow\\quad v_{1X} = \\frac{${texNumber(a1, 3)}\\ \\mathrm{g} \\times 9.81}{2\\pi \\times ${texNumber(f1, 3)}\\ \\mathrm{Hz}} = ${texNumber(mm(r.oneX), 3)}\\ \\mathrm{mm/s\\ rms}`} />
        <p>같은 0.001 g라도 1 Hz에서는 1.56 mm/s, 100 Hz에서는 0.0156 mm/s가 됩니다. 속도 스펙트럼은 낮은 주파수를 크게 부풀립니다 (4절).</p>
      </>}
      readouts={<>
        <ReadoutTable caption="읽음값" rows={[
          { label: '회전수', value: r.rpm, unit: 'rpm', sig: 4 },
          { label: '1X 속도', value: mm(r.oneX), unit: 'mm/s rms', sig: 3 },
          { label: '전체 속도 (2 ~ 1000 Hz)', value: mm(r.overall), unit: 'mm/s rms', sig: 3 },
          { label: 'IEPE 바이어스 전압', value: r.bias, unit: 'V', sig: 3 },
        ]} />
        <p className="lab-note">{`입력 레인지 ±${r.range} g · 입력 넘침: ${r.overload ? '있음' : '없음'} · 지난달 정상: 1X ${texNumber(mm(base.oneX), 3)}, 전체 ${texNumber(mm(base.overall), 3)} mm/s, 바이어스 ${base.bias} V`}</p>
      </>}
      tasks={[
        { question: '사례마다 먼저 "처음 측정"만 보고 판정해 본 뒤, 확인 동작을 하나씩 해 보세요. 어느 동작에서 무엇이 사라지나요?',
          answer: '설치 공진은 스터드로, ski-slope는 기다리면, 그라운드 루프는 접지를 분리하면, 끊김과 커넥터 잡음은 커넥터를 다시 꽂고 고정하면, 클리핑은 레인지를 올리면 사라집니다. 진짜 기계 진동은 어떤 동작에도 남고, 회전수를 바꾸면 따라 움직입니다.' },
        { question: '회전수를 바꿨을 때 따라 움직이지 않는 막대는 무엇을 뜻하나요?',
          answer: '회전과 묶이지 않은 성분입니다. 전원 주파수(그라운드 루프나 전기적 원인), 설치 공진·구조 공진처럼 고정된 고유진동수가 그렇습니다. 회전에서 나온 성분(1X, 정수배, 날개 통과)은 회전수를 따라 옮겨 갑니다 (P1-7).' },
        { question: '"진동이 사라졌다"거나 "갑자기 세 배가 됐다"는 결과를 보고하기 전에 무엇을 보나요?',
          answer: '바이어스 전압(센서가 살아 있나), 시간파형(잘림·튀는 펄스·흘러가는 바닥), 입력 넘침 표시, 그리고 가능하면 다른 센서로 같은 자리를 다시 잽니다. 지난 측정과 겹쳐 보는 것도 좋은 습관입니다.' },
      ]}
      footer={<p>예시 펌프는 {MACHINE.rpm} rpm(1X 49.5 Hz, 날개 7개 → 346.5 Hz), 가속도계는 IEPE, 분석기는 F_max 5 kHz·Hann·4회 평균입니다. 함정의 크기와 설치 공진(손 2 kHz)은 설명용 예시값입니다. 그라운드 루프는 60 Hz 전원 기준입니다.</p>}
    >
      {feedbackBox(null, <><strong>{quiz ? `사례 ${idx + 1}. ` : '상황: '}</strong>{info.scene}</>)}
      {!quiz && feedbackBox(true, <><strong>{info.name}</strong> — {info.explain}</>)}
      {quiz && answer !== 'unset' && feedbackBox(correct, correct
        ? <><strong>맞습니다 — {info.name}.</strong> {info.explain}</>
        : <><strong>아닙니다.</strong> 확인 동작을 하나씩 더 해 보세요. 어떤 동작에서 이상한 부분이 사라지나요? 바이어스 전압과 입력 넘침도 보세요.</>)}
      <h4>시간파형 (가속도, 처음 0.2초)</h4>
      <Plot series={waveSeries} x={{ label: '시각 [ms]', range: [0, 200] }} y={{ label: '[g]', range: [-1.5, 1.5] }} height={180} ariaLabel="가속도 시간파형" />
      <h4>가속도 스펙트럼 (0 ~ 5 kHz, 세로축 로그)</h4>
      <Plot series={accSeries} x={{ label: '주파수 [Hz]', range: [0, 5000] }} y={{ label: '[g rms]', log: true, range: [-6.5, 0] }} height={220} ariaLabel="가속도 스펙트럼" />
      <h4>속도 스펙트럼 (0 ~ 400 Hz)</h4>
      <Plot series={velSeries} x={{ label: '주파수 [Hz]', range: [0, 400] }} y={{ label: '[mm/s rms]', range: [0, velTop] }} height={220} ariaLabel="속도 스펙트럼" />
    </LabFrame>
  );
}
