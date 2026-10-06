import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { DEFAULT_ALARM, evaluateAlarms, scenarioSignal, type ProtScenario, type Voting } from '../../lib/protection';

/**
 * LAB-ALM-01 보호 시스템 알람 논리 (P2-5, Contents §5-1).
 * 한 베어링 X·Y 채널의 진폭에 Alert·Danger 레벨, 시간 지연, 보팅, 기동 중 트립 배율을 적용해 알람·트립 시각을 본다.
 * 계산: src/lib/protection.ts (본문 그림 5·6과 같은 모델). 레벨·지연·배율은 예시값.
 */

const SCENARIOS: { value: ProtScenario; label: string }[] = [
  { value: 'spike', label: '순간 튐 (X 채널, 0.3초)' },
  { value: 'growing', label: '두 채널이 함께 서서히 커짐' },
  { value: 'faultyProbe', label: 'Y 케이블이 가끔 끊겨 값이 튐' },
  { value: 'oneDirection', label: 'X 방향만 커짐 (한 방향 진동)' },
  { value: 'runup', label: '기동: 임계속도 통과' },
];
const VOTINGS: { value: Voting; label: string }[] = [
  { value: '1oo1', label: '1oo1: X 하나만 본다' },
  { value: '1oo2', label: '1oo2: X나 Y 중 하나라도' },
  { value: '2oo2', label: '2oo2: X와 Y 둘 다' },
];
const STORY: Record<ProtScenario, string> = {
  spike: '3600 rpm 운전 중. 20 s에 X 채널에만 0.3초짜리 전기적 튐이 들어온다. 기계는 멀쩡하다.',
  growing: '3600 rpm 운전 중. 10 s부터 두 채널이 함께 서서히 커진다 — 실제로 나빠지는 기계다.',
  faultyProbe: '3600 rpm 운전 중. Y 채널 케이블이 가끔 끊겨 15·32·45 s에 1 ~ 2초씩 값이 튄다. 기계는 멀쩡하다.',
  oneDirection: '3600 rpm 운전 중. X 방향으로만 진동이 커진다 (직선에 가까운 오빗, P2-3). 실제로 나빠지는 기계다.',
  runup: '300 rpm에서 기동해 3600 rpm까지 올린다. 145 s에 임계속도(2000 rpm)를 지나며 몇 초 동안 진동이 커진다.',
};

export interface AlarmLabProps {
  initialScenario?: ProtScenario;
  initialDelay?: number;
  initialVoting?: Voting;
  initialMultiply?: boolean;
}

export default function AlarmLab({ initialScenario = 'spike', initialDelay = 0, initialVoting = '1oo2', initialMultiply = false }: AlarmLabProps) {
  const [scenario, setScenario] = useState<ProtScenario>(initialScenario);
  const [alert, setAlert] = useState(DEFAULT_ALARM.alert);
  const [danger, setDanger] = useState(DEFAULT_ALARM.danger);
  const [delay, setDelay] = useState(initialDelay);
  const [voting, setVoting] = useState<Voting>(initialVoting);
  const [multiply, setMultiply] = useState(initialMultiply);

  const sig = useMemo(() => scenarioSignal(scenario), [scenario]);
  const r = useMemo(() => evaluateAlarms(sig, { alert, danger, delay, voting, tripMultiply: multiply, multiplier: 2 }), [sig, alert, danger, delay, voting, multiply]);

  const t = Array.from(sig.t);
  const tEnd = t[t.length - 1];
  const ampSeries: PlotSeries[] = [
    { x: t, y: Array.from(sig.x), name: 'X 채널', color: 'var(--plot-1)', width: 1.6 },
    { x: t, y: Array.from(sig.y), name: 'Y 채널', color: 'var(--plot-3)', width: 1.4 },
    { x: t, y: Array.from(r.alertLevel), name: 'Alert 레벨', color: 'var(--plot-4)', dash: 'dash', width: 1.4 },
    { x: t, y: Array.from(r.dangerLevel), name: 'Danger 레벨', color: 'var(--status-wip)', dash: 'dash', width: 1.6 },
  ];
  const row = (v: Uint8Array, base: number) => Array.from(v, (s) => base + 0.7 * s);
  const stateSeries: PlotSeries[] = [
    { x: t, y: row(r.alertX, 4), name: 'Alert X', color: 'var(--plot-4)', width: 2 },
    { x: t, y: row(r.alertY, 3), name: 'Alert Y', color: 'var(--plot-4)', width: 2, dash: 'dot' },
    { x: t, y: row(r.dangerX, 2), name: 'Danger X', color: 'var(--status-wip)', width: 2 },
    { x: t, y: row(r.dangerY, 1), name: 'Danger Y', color: 'var(--status-wip)', width: 2, dash: 'dot' },
    { x: t, y: row(r.trip, 0), name: '트립 (보팅 뒤)', color: 'var(--plot-2)', width: 3 },
  ];
  const maxY = Math.max(220, ...r.dangerLevel) * 1.1;
  const voteTex = voting === '1oo1' ? 'D_X' : voting === '1oo2' ? 'D_X \\lor D_Y' : 'D_X \\land D_Y';

  return (
    <LabFrame id="LAB-ALM-01" title="보호 시스템 알람 논리: 레벨 · 지연 · 보팅 · 트립 배율"
      controls={<>
        <ParamSelect label="상황" value={scenario} options={SCENARIOS} onChange={setScenario} />
        <ParamSlider label="Alert 레벨" value={alert} min={50} max={200} step={5} unit="µm pp" onChange={setAlert} />
        <ParamSlider label="Danger 레벨" value={danger} min={80} max={250} step={5} unit="µm pp" onChange={setDanger} />
        <ParamSlider label="시간 지연" value={delay} min={0} max={5} step={0.25} unit="s" format={(v) => v.toFixed(2)} onChange={setDelay} hint="레벨을 이만큼 계속 넘어야 알람이 선다" />
        <ParamSelect label="트립 보팅" value={voting} options={VOTINGS} onChange={setVoting} />
        <ParamToggle label="기동 중 트립 배율 (레벨 ×2, 3500 rpm까지)" checked={multiply} onChange={setMultiply} hint="기동 시나리오에서만 효과가 있다" />
      </>}
      formulas={<>
        <Formula display tex={`D_c = \\big[\\, v_c \\ge L \\ \\text{가}\\ \\tau = ${formatNumber(delay, 3)}\\ \\mathrm{s}\\ \\text{이상 계속} \\,\\big], \\qquad \\text{트립} = ${voteTex}`} />
        <p>{`D는 채널(X·Y)마다의 Danger 상태, v는 진폭, L은 Danger 레벨(지금 ${danger} µm pp${multiply ? ', 기동 중에는 ×2' : ''}), τ는 시간 지연입니다. Alert는 어느 채널이든 서면 경보를 울립니다 (1oo1이면 X만).`}</p>
      </>}
      readouts={<>
        <ReadoutTable caption="읽음값" rows={[
          { label: '처음 Alert 시각', value: r.alertTime ?? Number.NaN, unit: 's', sig: 4 },
          { label: '트립 시각', value: r.tripTime ?? Number.NaN, unit: 's', sig: 4 },
          { label: 'X가 Danger를 넘은 가장 긴 시간', value: r.maxOverX, unit: 's', sig: 3 },
          { label: 'Y가 Danger를 넘은 가장 긴 시간', value: r.maxOverY, unit: 's', sig: 3 },
          { label: '최대 진폭 X', value: Math.max(...sig.x), unit: 'µm pp', sig: 3 },
          { label: '최대 진폭 Y', value: Math.max(...sig.y), unit: 'µm pp', sig: 3 },
        ]} />
        <p className="lab-note"><strong>{r.tripTime === null ? '트립 없음' : `트립: ${formatNumber(r.tripTime, 4)} s`}</strong>{` · ${STORY[scenario]}`}</p>
      </>}
      tasks={[
        { question: '"순간 튐"에서 지연을 0초로 두면? 몇 초로 올려야 트립되지 않나요?',
          answer: '지연 0초면 20 s에 바로 트립됩니다(1oo1·1oo2). 튐은 0.3초이므로 지연을 0.5초 이상으로 두면 알람도 트립도 서지 않습니다. 지연을 너무 길게 잡으면 진짜 이상에도 그만큼 늦게 반응하므로, 예시에서는 1초를 씁니다.' },
        { question: '"Y 케이블이 가끔 끊겨 값이 튐"에서 보팅을 1oo2와 2oo2로 바꿔 보세요. 어느 쪽이 헛트립을 막나요?',
          answer: '1oo2는 Y 하나만 넘어도 트립하므로 16 s에 헛트립합니다. 2oo2는 X도 함께 넘어야 하므로 트립하지 않고, Y의 Alert만 울려 사람이 센서를 점검하게 합니다.' },
        { question: '"X 방향만 커짐"에서는 2oo2가 어떤가요?',
          answer: 'Y는 60 µm pp 근처에 머물러 2oo2는 끝내 트립하지 않습니다. 1oo2는 약 35.7 s에 트립합니다. 보팅을 엄하게 하면 헛트립은 줄지만 한 방향으로만 커지는 진짜 이상을 놓칠 수 있습니다.' },
        { question: '"기동: 임계속도 통과"에서 트립 배율을 끄고 켜 보세요.',
          answer: '배율이 없으면 임계속도(145 s)에서 진폭이 약 140 µm pp로 Danger 125를 몇 초 넘어 144.8 s에 트립합니다. 기동 중 ×2(250)를 켜면 트립되지 않고, 3500 rpm에 닿으면 레벨이 125로 돌아옵니다.' },
      ]}
      footer={<p>레벨(Alert {DEFAULT_ALARM.alert}·Danger {DEFAULT_ALARM.danger} µm pp), 지연, 배율 ×2는 설명용 예시값입니다. 실제 설정은 기계·제조사 권고와 규격을 따릅니다. 신호는 시드를 고정한 예시입니다.</p>}
    >
      <h4>채널 진폭과 레벨</h4>
      <Plot series={ampSeries} x={{ label: '시각 [s]', range: [0, tEnd] }} y={{ label: '[µm pp]', range: [0, maxY] }} height={240} ariaLabel="X·Y 채널 진폭과 Alert·Danger 레벨" />
      <h4>알람 상태 (위에서부터 Alert X · Alert Y · Danger X · Danger Y · 트립, 서면 한 칸 위로)</h4>
      <Plot series={stateSeries} x={{ label: '시각 [s]', range: [0, tEnd] }} y={{ label: '', range: [-0.2, 5] }} height={200} ariaLabel="채널별 Alert·Danger 상태와 트립" />
      {scenario === 'runup' && <>
        <h4>회전수</h4>
        <Plot series={[{ x: t, y: Array.from(sig.rpm), name: '회전수', color: 'var(--text-muted)', width: 1.8 }]} x={{ label: '시각 [s]', range: [0, tEnd] }} y={{ label: '[rpm]', range: [0, 4000] }} height={150} ariaLabel="기동 회전수" />
      </>}
    </LabFrame>
  );
}
