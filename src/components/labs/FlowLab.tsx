import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import {
  bandRms,
  COMP,
  COMP_FR,
  compLines,
  compSlowSignals,
  FLOW_CASES,
  pressureRatio,
  PUMP,
  PUMP_FR,
  PUMP_LABEL,
  PUMP_STATES,
  PUMP_VPF,
  pumpEff,
  pumpHead,
  pumpSignals,
  rmsSpectrum,
  type PumpState,
} from '../../lib/faults/flow';

/**
 * LAB-FLOW-01 운전점을 바꿔 원인 가리기 (P7-8, Contents §5).
 * 원심 펌프(3575 rpm, 날개 7장)는 유량·흡입 압력을, 원심 압축기(9000 rpm)는 유량·서지 방지를 바꾸며
 * 속도·가속도 스펙트럼, 축 변위 스펙트럼, 토출 압력·축방향 위치 파형을 보고, 숨은 케이스 7개를 가린다.
 * 계산: lib/faults/flow.ts (설명용 모델, 본문 그림과 같음).
 */

type Mode = 'pick' | 'quiz';
type Machine = 'pump' | 'comp';
export interface FlowState {
  mode: Mode;
  machine: Machine;
  pumpState: PumpState;
  quiz: number;
  answer: boolean;
  q: number;
  suctionUp: number;
  phi: number;
  antiSurge: boolean;
}

const MODE_OPTIONS = [
  { value: 'pick' as const, label: '상태를 골라 보기' },
  { value: 'quiz' as const, label: '숨은 원인 맞히기 (케이스 7개)' },
];
const MACHINE_OPTIONS = [
  { value: 'pump' as const, label: `원심 펌프 (${PUMP.rpm} rpm, 날개 ${PUMP.vanes}장)` },
  { value: 'comp' as const, label: `원심 압축기 (${COMP.rpm} rpm)` },
];
const STATE_OPTIONS = PUMP_STATES.map((s) => ({ value: s, label: PUMP_LABEL[s] }));
const QUIZ_OPTIONS = FLOW_CASES.map((c, i) => ({ value: i, label: `케이스 ${i + 1} — ${c.machine === 'pump' ? '펌프' : '압축기'}` }));
const CASE_ANSWER = [
  ['캐비테이션 (흡입 압력이 낮음)', '2 ~ 6 kHz 가속도가 줄 없는 넓은 대역으로 솟고, 흡입 압력을 올리거나(+0.2) 유량을 70 %로 줄이면 사라집니다. 유량을 늘리면 더 커집니다.'],
  ['저유량 재순환', '유량 40 %에서 5 ~ 40 Hz에 넓은 둔덕이 서고 날개 통과도 커집니다. 유량을 60 % 위로 올리면 둔덕이 사라지고, 흡입 압력에는 반응하지 않습니다.'],
  ['볼류트 혀 간극이 좁음', 'BEP에서도 날개 통과가 정상의 2배(1.2 mm/s)입니다. 유량을 어떻게 바꿔도 늘 정상의 2배라, 운전점이 아니라 기하(간극)의 문제입니다.'],
  ['수력 불평형', '1X가 크고, 유량을 BEP(100 %)로 옮기면 2.56 → 1.6 mm/s로 줄며 BEP에서 멀어지면 다시 커집니다. 기계 불평형은 유량과 무관합니다(케이스 7과 비교).'],
  ['Rotating stall', '1X 아래 29.4 Hz(0.196X)에 줄이 서고, 유량을 0.72 위로 늘리면 사라집니다. 서지 방지가 켜져 있어도 이 구간은 남습니다.'],
  ['서지', '0.7 Hz로 토출 압력이 크게 오르내리고 축방향 위치가 약 120 µm 튑니다. 서지 방지를 켜면(유량 0.62 유지) 서지는 멈추고 stall만 남습니다.'],
  ['기계 불평형', '1X가 4.3 mm/s로 크지만 유량을 어떻게 바꿔도 그대로입니다. 유체 원인이 아니므로 평형 작업(P9-2) 쪽입니다.'],
];
const db = (a: number) => 20 * Math.log10(Math.max(a, 1e-4));

export default function FlowLab({ initial = {} }: { initial?: Partial<FlowState> }) {
  const [p, setP] = useState<FlowState>({ mode: 'pick', machine: 'pump', pumpState: 'normal', quiz: 0, answer: false, q: 1, suctionUp: 0, phi: 1, antiSurge: true, ...initial });
  const set = <K extends keyof FlowState>(k: K) => (v: FlowState[K]) =>
    setP((s) => {
      const next = { ...s, [k]: v };
      if (k === 'quiz' || (k === 'mode' && v === 'quiz')) {
        const c = FLOW_CASES[k === 'quiz' ? (v as number) : s.quiz];
        return c.machine === 'pump'
          ? { ...next, answer: false, machine: 'pump', q: c.q, suctionUp: 0 }
          : { ...next, answer: false, machine: 'comp', phi: c.phi, antiSurge: c.antiSurge };
      }
      return next;
    });
  const quiz = p.mode === 'quiz';
  const kase = FLOW_CASES[p.quiz];
  const machine: Machine = quiz ? kase.machine : p.machine;
  const pumpState: PumpState = quiz && kase.machine === 'pump' ? kase.state : p.pumpState;

  const pump = useMemo(() => {
    if (machine !== 'pump') return null;
    const s = pumpSignals(pumpState, { q: p.q, suctionUp: p.suctionUp });
    const v = rmsSpectrum(s.vel, s.fs, 900);
    const a = rmsSpectrum(s.acc, s.fs, 8000);
    const ax: number[] = [];
    const ay: number[] = [];
    for (let k = 0; k < a.freq.length; k += 4) {
      let m = 0;
      for (let j = k; j < Math.min(k + 4, a.freq.length); j++) m = Math.max(m, a.amp[j]);
      ax.push(a.freq[k]);
      ay.push(db(m));
    }
    return { L: s.levels, v, acc: { x: ax, y: ay }, low: bandRms(v.freq, v.amp, 5, 40), hf: bandRms(a.freq, a.amp, 2000, 6000) };
  }, [machine, pumpState, p.q, p.suctionUp]);

  const comp = useMemo(() => {
    if (machine !== 'comp') return null;
    const c = { phi: p.phi, antiSurge: p.antiSurge };
    const slow = compSlowSignals(c);
    const step = 2;
    const pick = (a: ArrayLike<number>) => Array.from({ length: Math.ceil(a.length / step) }, (_, i) => a[i * step]);
    return { lines: compLines(c), st: slow.state, t: pick(slow.t), press: pick(slow.press), axial: pick(slow.axial), dP: Math.max(...slow.press) - Math.min(...slow.press), dA: Math.max(...slow.axial) - Math.min(...slow.axial) };
  }, [machine, p.phi, p.antiSurge]);

  const qGrid = Array.from({ length: 61 }, (_, i) => 0.2 + (i / 60) * 1.2);
  const phiGrid = Array.from({ length: 61 }, (_, i) => 0.42 + (i / 60) * 0.73);
  const caseTitle = quiz ? `케이스 ${p.quiz + 1}${p.answer ? ` — ${CASE_ANSWER[p.quiz][0]}` : ''}` : machine === 'pump' ? PUMP_LABEL[pumpState] : '원심 압축기';

  return (
    <LabFrame id="LAB-FLOW-01" title="운전점을 바꿔 원인 가리기: 날개 통과 · 재순환 · 캐비테이션 · stall · 서지"
      controls={<>
        <ParamSelect label="보기 방식" value={p.mode} options={MODE_OPTIONS} onChange={set('mode')} />
        {quiz ? <>
          <ParamSelect label="케이스" value={p.quiz} options={QUIZ_OPTIONS} onChange={set('quiz')} />
          <ParamToggle label="정답 보기" checked={p.answer} onChange={set('answer')} />
        </> : <>
          <ParamSelect label="기계" value={p.machine} options={MACHINE_OPTIONS} onChange={set('machine')} />
          {p.machine === 'pump' && <ParamSelect label="펌프 상태" value={p.pumpState} options={STATE_OPTIONS} onChange={set('pumpState')} />}
        </>}
        {machine === 'pump' ? <>
          <ParamSlider label="유량 Q / Q_BEP" value={p.q} min={0.3} max={1.4} step={0.05} onChange={set('q')} hint={`${formatNumber(p.q * 100, 3)} % (BEP = 100 %)`} />
          <ParamSlider label="흡입 압력 올리기 (흡입 여유 +)" value={p.suctionUp} min={0} max={0.6} step={0.1} onChange={set('suctionUp')} />
        </> : <>
          <ParamSlider label="유량 / 설계 유량" value={p.phi} min={0.45} max={1.1} step={0.01} onChange={set('phi')} hint={`서지선 ${COMP.surgeLine}, stall 시작 ${COMP.stallOnset} (이 모델)`} />
          <ParamToggle label={`서지 방지 (재순환 밸브, 유량 ${COMP.antiSurgeMin} 유지)`} checked={p.antiSurge} onChange={set('antiSurge')} />
        </>}
      </>}
      readouts={pump ? <ReadoutTable caption={`읽음값 (${caseTitle}, 유량 ${formatNumber(p.q * 100, 3)} %)`} rows={[
        { label: `1X (${formatNumber(PUMP_FR, 4)} Hz)`, value: pump.L.oneX, unit: 'mm/s rms', sig: 3 },
        { label: `날개 통과 VPF (${formatNumber(PUMP_VPF, 4)} Hz)`, value: pump.L.vpf, unit: 'mm/s rms', sig: 3 },
        { label: '5 ~ 40 Hz 넓은 대역 RMS (재순환)', value: pump.low, unit: 'mm/s', sig: 2 },
        { label: '2 ~ 6 kHz 가속도 대역 RMS (캐비테이션)', value: pump.hf, unit: 'g', sig: 2 },
        { label: '흡입 여유 NPSHa ÷ NPSHr(Q) (1.2 아래면 캐비테이션)', value: pump.L.marginAtQ, sig: 3 },
        { label: '효율 (BEP = 1)', value: pumpEff(p.q), sig: 3 },
      ]} /> : comp ? <ReadoutTable caption={`읽음값 (${caseTitle}, 요청 유량 ${p.phi})`} rows={[
        { label: '압축기를 지나는 유량 (서지 방지 반영)', value: comp.st.phiEff, sig: 3 },
        { label: 'stall 성분 주파수', value: comp.st.stall ? comp.st.stall.hz : 0, unit: 'Hz', sig: 3 },
        { label: 'stall 성분 차수', value: comp.st.stall ? comp.st.stall.order : 0, unit: 'X', sig: 3 },
        { label: 'stall 성분 크기', value: comp.st.stall ? comp.st.stall.amp : 0, unit: 'µm pk', sig: 2 },
        { label: '서지 주기 (없으면 0)', value: comp.st.surge ? 1 / COMP.surgeHz : 0, unit: 's', sig: 2 },
        { label: '토출 압력 변동 폭 (10 s)', value: comp.dP, unit: '%', sig: 2 },
        { label: '축방향 위치 변동 폭 (10 s)', value: comp.dA, unit: 'µm', sig: 2 },
      ]} /> : null}
      tasks={[
        { question: '펌프 정상 상태에서 유량을 100 → 40 → 125 %로 바꾸며 1X, 날개 통과, 5 ~ 40 Hz 대역을 읽으세요.',
          answer: '1X는 0.8 mm/s 그대로입니다. 날개 통과는 0.6 → 1.25 → 0.71 mm/s로 BEP에서 가장 작습니다. 5 ~ 40 Hz 대역은 40 %에서만 약 1.8 mm/s로 솟습니다(저유량 재순환). 회전수가 같은데 진동이 바뀌면 유체 쪽을 의심합니다.' },
        { question: '상태를 "흡입 압력이 낮음"으로 바꾸고 유량 100 %에서 2 ~ 6 kHz 가속도를 읽으세요. 흡입 압력을 0.2 올리거나, 유량을 70 % 또는 110 %로 바꾸면?',
          answer: '100 %에서 약 1 g의 넓은 대역(캐비테이션)입니다. 흡입 압력 +0.2나 유량 70 %에서는 사라지고, 110 %에서는 더 커집니다(필요 NPSH가 유량과 함께 커지므로). 넓은 대역이라 스펙트럼에 줄이 아니라 둔덕으로 섭니다.' },
        { question: '상태를 수력 불평형과 기계 불평형으로 번갈아 고르고, 유량 60 → 100 → 130 %에서 1X를 비교하세요.',
          answer: '수력 불평형은 2.56 → 1.6 → 2.32 mm/s로 BEP에서 가장 작고, 기계 불평형은 4.3 mm/s로 유량과 무관합니다. 평형추로 잡히는 것은 기계 불평형뿐입니다.' },
        { question: '압축기를 고르고 서지 방지를 켠 채 유량을 1.0 → 0.70 → 0.64 → 0.50으로 줄이세요. 그다음 0.50에서 서지 방지를 끄세요.',
          answer: '0.72 아래에서 stall이 나타나 0.70에서 32.1 Hz(0.214X)·2 µm, 0.64에서 29.4 Hz(0.196X)·8 µm입니다. 0.50을 요청해도 서지 방지가 0.62를 지켜 stall(28.5 Hz, 10 µm)만 남습니다. 끄면 서지가 되어 0.7 Hz로 토출 압력이 약 40 % 폭으로, 축방향 위치가 약 120 µm 폭으로 오르내립니다.' },
        { question: '보기 방식을 "숨은 원인 맞히기"로 바꾸고 케이스 1 ~ 7을 가리세요. 유량·흡입 압력·서지 방지를 바꿔 시험해도 됩니다.',
          answer: '1 캐비테이션, 2 저유량 재순환, 3 혀 간극이 좁음, 4 수력 불평형, 5 Rotating stall, 6 서지, 7 기계 불평형입니다. "정답 보기"를 켜면 근거가 나옵니다.' },
      ]}
      footer={<p>설명용 모델입니다: 날개 통과 = 0.6/간극 × (1 + 3(Q/Q_BEP − 1)²) mm/s, 재순환은 유량 60 % 아래, 캐비테이션은 흡입 여유 NPSHa/NPSHr(Q)가 1.2 아래(필요 NPSH ∝ 0.55 + 0.45(Q/Q_BEP)²), 압축기 stall은 유량 0.72 아래·서지는 0.55 아래로 두었습니다. 실제 문턱·크기는 펌프·압축기·배관마다 다르며, 판정 기준이 아닙니다.</p>}
    >
      {quiz && p.answer && <p className="lab-note"><strong>{CASE_ANSWER[p.quiz][0]}</strong> — {CASE_ANSWER[p.quiz][1]}</p>}
      {pump && <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <h4>성능 곡선과 운전점</h4>
            <Plot series={[
              { x: qGrid, y: qGrid.map(pumpHead), name: '양정', color: 'var(--plot-1)', width: 2 },
              { x: qGrid, y: qGrid.map(pumpEff), name: '효율', color: 'var(--text-muted)', dash: 'dash', width: 1.4 },
              { x: [p.q], y: [pumpHead(p.q)], name: '운전점', color: 'var(--status-wip)', mode: 'markers', markerSize: 11 },
            ]} x={{ label: 'Q / Q_BEP', range: [0.2, 1.4] }} y={{ label: 'BEP = 1', range: [0, 1.35] }} height={220} ariaLabel="펌프 성능 곡선과 운전점" />
          </div>
          <div style={{ flex: '2 1 360px', minWidth: 0 }}>
            <h4>속도 스펙트럼 (1 s, Hann)</h4>
            <Plot series={[{ x: pump.v.freq, y: pump.v.amp, name: '속도', color: 'var(--plot-1)', width: 1.2 }]} x={{ label: '주파수 [Hz]', range: [0, 900] }} y={{ label: '[mm/s rms]', range: [0, Math.max(1.5, ...pump.v.amp) * 1.1] }} height={220} ariaLabel="속도 스펙트럼" />
          </div>
        </div>
        <h4>가속도 스펙트럼 (dB, 1 g rms = 0 dB)</h4>
        <Plot series={[{ x: pump.acc.x, y: pump.acc.y, name: '가속도', color: 'var(--plot-2)', width: 1 }]} x={{ label: '주파수 [Hz]', range: [0, 8000] }} y={{ label: '[dB re 1 g]', range: [-60, 0] }} height={200} ariaLabel="가속도 스펙트럼" />
      </>}
      {comp && <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <h4>성능 지도와 운전점</h4>
            <Plot series={[
              { x: phiGrid.filter((f) => f >= COMP.surgeLine), y: phiGrid.filter((f) => f >= COMP.surgeLine).map(pressureRatio), name: '성능 곡선', color: 'var(--plot-1)', width: 2 },
              { x: [COMP.surgeLine, COMP.surgeLine], y: [1.8, 3.2], name: '서지선', color: 'var(--status-wip)', width: 1.5 },
              { x: [COMP.stallOnset, COMP.stallOnset], y: [1.8, 3.2], name: 'stall 시작', color: 'var(--text-muted)', dash: 'dash', width: 1 },
              { x: [comp.st.phiEff], y: [pressureRatio(comp.st.phiEff)], name: '운전점', color: 'var(--status-wip)', mode: 'markers', markerSize: 11 },
            ]} x={{ label: '유량 / 설계 유량', range: [0.42, 1.15] }} y={{ label: '압력비', range: [1.8, 3.2] }} height={230} ariaLabel="압축기 성능 지도와 운전점" />
          </div>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <h4>축 변위 스펙트럼 (반경 방향)</h4>
            <Plot series={[{ x: comp.lines.map((l) => l.hz), y: comp.lines.map((l) => l.amp), name: '성분', color: 'var(--plot-2)', kind: 'bar', barWidth: 1.6 }]} x={{ label: `주파수 [Hz] (1X = ${COMP_FR} Hz)`, range: [0, 170] }} y={{ label: '[µm pk]', range: [0, 28] }} height={230} ariaLabel="축 변위 스펙트럼" />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <h4>토출 압력 (10 s)</h4>
            <Plot series={[{ x: comp.t, y: comp.press, name: '토출 압력', color: 'var(--status-wip)', width: 1.2 }]} x={{ label: '시간 [s]', range: [0, 10] }} y={{ label: '[% 설계]', range: [90, 145] }} height={190} ariaLabel="토출 압력 파형" />
          </div>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <h4>축방향 위치 (10 s)</h4>
            <Plot series={[{ x: comp.t, y: comp.axial, name: '축방향 위치', color: 'var(--plot-4)', width: 1.2 }]} x={{ label: '시간 [s]', range: [0, 10] }} y={{ label: '[µm]', range: [-140, 20] }} height={190} ariaLabel="축방향 위치 파형" />
          </div>
        </div>
      </>}
    </LabFrame>
  );
}
