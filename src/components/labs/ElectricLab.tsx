import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import {
  causesFor,
  ELEC_CASES,
  ELEC_LABEL,
  ELEC_MACHINE_IDS,
  ELEC_MACHINES,
  elecLines,
  elecSpectrogram,
  elecSpectrum,
  motorFreqs,
  remainingAfter,
  type ElecCause,
  type ElecMachineId,
} from '../../lib/faults/electric';

/**
 * LAB-ELEC-01 전기냐 기계냐 (P7-7, Contents §5).
 * 유도전동기(2극 60 Hz · 4극 50 Hz)와 2극 동기 발전기에 원인 하나를 넣고, 부하(슬립)·기록 길이를 바꿔 1X 둘레·2×LF 둘레를 확대해 보며,
 * t = 0의 전원 차단(발전기는 회전수를 유지한 채 계자 차단) 전후 스펙트로그램으로 전기·기계를 가른다. 숨은 케이스 7개.
 * 계산: lib/faults/electric.ts (설명용 모델, 본문 그림과 같음).
 */

type Mode = 'pick' | 'quiz';
/** dB 축의 바닥: 0.003 mm/s (−50 dB) */
const DB_FLOOR = 0.00316;
export interface ElectricState {
  mode: Mode;
  machine: ElecMachineId;
  cause: ElecCause;
  quiz: number;
  answer: boolean;
  load: number;
  seconds: number;
  logY: boolean;
}

const MODE_OPTIONS = [
  { value: 'pick' as const, label: '원인을 골라 보기' },
  { value: 'quiz' as const, label: '숨은 원인 맞히기 (케이스 7개)' },
];
const MACHINE_OPTIONS = ELEC_MACHINE_IDS.map((id) => ({ value: id, label: ELEC_MACHINES[id].name }));
const QUIZ_OPTIONS = ELEC_CASES.map((c, i) => ({ value: i, label: `케이스 ${i + 1} — ${ELEC_MACHINES[c.machine].name}` }));
const T_OPTIONS = [1, 2, 4, 8, 16].map((s) => ({ value: s, label: `${s} s (Δf ${formatNumber(1 / s, 3)} Hz)` }));
const WHY: Record<ElecCause, string> = {
  none: '작은 기본 성분만 있습니다.',
  stator: '2×LF 자리(회전수와 무관한 고정 주파수)가 주인이고, 기록을 늘리면 극수 번째 하모닉과 갈라져 2×LF 쪽이 큽니다. 전원(계자)을 끊는 순간 그 줄이 사라집니다.',
  rotorBar: '1X 둘레에 PPF 간격의 측대역이 서고(기록을 길게 해야 보임) 1X 크기가 1/PPF마다 오르내립니다. 측대역은 부하가 클수록 크고 넓습니다. 전원을 끊으면 측대역이 곧바로 사라집니다.',
  dynEcc: '2×LF 둘레에 PPF 측대역(아래쪽은 극수 번째 하모닉 자리와 겹침)과 1X ± PPF가 함께 섭니다. 전원을 끊으면 곧바로 사라집니다.',
  unbalance: '1X만 크고 측대역이 없습니다. 전원을 끊어도 회전수를 따라 천천히 줄어듭니다.',
  misalign: '기록을 늘리면 극수 번째 하모닉(2X) 쪽이 2×LF보다 큽니다. 전원(계자)을 끊어도 그대로 남아 회전수를 따라 줄어듭니다.',
};

export default function ElectricLab({ initial = {} }: { initial?: Partial<ElectricState> }) {
  const [p, setP] = useState<ElectricState>({ mode: 'pick', machine: 'ind2', cause: 'stator', quiz: 0, answer: false, load: 60, seconds: 2, logY: true, ...initial });
  const set = <K extends keyof ElectricState>(k: K) => (v: ElectricState[K]) =>
    setP((q) => {
      const next = { ...q, [k]: v };
      if (k === 'quiz' || (k === 'mode' && v === 'quiz')) {
        const c = ELEC_CASES[k === 'quiz' ? (v as number) : q.quiz];
        return { ...next, answer: false, load: c.load };
      }
      if (k === 'machine' && !causesFor(ELEC_MACHINES[v as ElecMachineId]).includes(q.cause)) return { ...next, cause: 'stator' };
      return next;
    });
  const quiz = p.mode === 'quiz';
  const machineId: ElecMachineId = quiz ? ELEC_CASES[p.quiz].machine : p.machine;
  const cause: ElecCause = quiz ? ELEC_CASES[p.quiz].cause : p.cause;
  const m = ELEC_MACHINES[machineId];
  const induction = m.kind === 'induction';
  const q = motorFreqs(m, p.load);
  const lines = useMemo(() => elecLines(m, cause, p.load), [machineId, cause, p.load]);
  const spec = useMemo(() => elecSpectrum(m, lines, p.seconds), [lines, p.seconds]);
  const sg = useMemo(() => elecSpectrogram(m, lines, 140), [lines]);
  const rem = (t: number) => {
    const a = remainingAfter(m, lines, t);
    const b = remainingAfter(m, lines, 0);
    return (a.electric + a.mechanical) / (b.electric + b.mechanical);
  };

  const cut = (f1: number, f2: number) => {
    const x: number[] = [];
    const y: number[] = [];
    for (let k = 0; k < spec.freq.length; k++)
      if (spec.freq[k] >= f1 && spec.freq[k] <= f2) {
        x.push(spec.freq[k]);
        y.push(p.logY ? 20 * Math.log10(Math.max(spec.amp[k], DB_FLOOR)) : spec.amp[k]);
      }
    return { x, y };
  };
  const w1: [number, number] = [q.fr - 3, q.fr + 3];
  const w2: [number, number] = [q.pX - 2.5, q.twoLF + 2.5];
  const s1 = cut(...w1);
  const s2 = cut(...w2);
  const yMax = p.logY ? 15 : Math.max(1, ...s1.y, ...s2.y) * 1.3;
  const yMin = p.logY ? 20 * Math.log10(DB_FLOOR) : 0;
  const yAxis = { label: p.logY ? '[dB, 1 mm/s rms = 0 dB]' : '[mm/s rms]', range: [yMin, yMax] as [number, number] };
  const mark = (f: number, name: string, color: string) => ({ x: [f, f], y: [yMin, yMax], name, color, dash: 'dot' as const, width: 1 });
  const sbMarks = induction ? [mark(q.fr - q.ppf, '1X ± PPF', 'var(--text-muted)'), { ...mark(q.fr + q.ppf, '1X + PPF', 'var(--text-muted)'), hideInLegend: true }] : [];
  const heat = useMemo(() => ({ x: sg.times, y: sg.freqs, z: sg.freqs.map((_, k) => sg.amp.map((row) => row[k])) }), [sg]);

  const title = quiz ? `케이스 ${p.quiz + 1}${p.answer ? ` — ${ELEC_LABEL[cause]}` : ''}` : ELEC_LABEL[cause];
  const testName = induction ? 't = 0에 전원 차단 (회전수가 줄어든다)' : 't = 0에 계자 차단 (회전수 3600 rpm 유지)';

  return (
    <LabFrame id="LAB-ELEC-01" title="전기냐 기계냐: 2×LF · 극통과 측대역 · 전원 차단 시험"
      controls={<>
        <ParamSelect label="보기 방식" value={p.mode} options={MODE_OPTIONS} onChange={set('mode')} />
        {quiz ? <>
          <ParamSelect label="케이스" value={p.quiz} options={QUIZ_OPTIONS} onChange={set('quiz')} />
          <ParamToggle label="정답 보기" checked={p.answer} onChange={set('answer')} />
        </> : <>
          <ParamSelect label="기계" value={p.machine} options={MACHINE_OPTIONS} onChange={set('machine')} />
          <ParamSelect label="원인" value={p.cause} options={causesFor(m).map((c) => ({ value: c, label: ELEC_LABEL[c] }))} onChange={set('cause')} />
        </>}
        <ParamSlider label="부하" value={p.load} min={20} max={100} step={10} unit="%" onChange={set('load')} hint={induction ? `슬립 ${formatNumber(q.slip * 100, 2)} %, 회전수 ${formatNumber(q.rpm, 4)} rpm` : '동기기는 부하와 무관하게 3600 rpm'} />
        <ParamSelect label="기록 길이 T" value={p.seconds} options={T_OPTIONS} onChange={set('seconds')} />
        <ParamToggle label="세로축 dB (작은 측대역 보기)" checked={p.logY} onChange={set('logY')} />
      </>}
      readouts={<ReadoutTable caption={`읽음값 (${title}, 부하 ${p.load} %)`} rows={[
        { label: '회전수', value: q.rpm, unit: 'rpm', sig: 4 },
        { label: '1X', value: q.fr, unit: 'Hz', sig: 4 },
        { label: '슬립', value: q.slip * 100, unit: '%', sig: 2 },
        { label: `극통과 주파수 PPF = ${m.poles} × 슬립 주파수 = 2×LF − ${m.poles}X`, value: q.ppf, unit: 'Hz', sig: 3 },
        { label: `${m.poles}X (2×LF ${q.twoLF} Hz 옆)`, value: q.pX, unit: 'Hz', sig: 5 },
        { label: 'Δf = 1/T', value: 1 / p.seconds, unit: 'Hz', sig: 3 },
        { label: 'PPF가 몇 칸인가 (PPF ÷ Δf)', value: q.ppf * p.seconds, sig: 3 },
        { label: '시험 0.5 s 뒤 남은 크기 (시험 전 = 1)', value: rem(0.5), sig: 2 },
        { label: '시험 2 s 뒤 남은 크기', value: rem(2), sig: 2 },
      ]} />}
      tasks={[
        { question: '2극 60 Hz · 고정자 · 부하 60 %에서 기록을 1 s → 8 s로 늘리며 2×LF 둘레 확대를 보세요. 그다음 스펙트로그램에서 t = 0에 무엇이 사라지나요?',
          answer: '1 s(Δf 1 Hz)에서는 119.2 Hz(2X)와 120 Hz(2×LF)가 한 덩어리입니다. PPF 0.8 Hz가 0.8칸뿐이기 때문입니다. 8 s(6.4칸)에서는 120 Hz가 3.2 mm/s로 크고 119.2 Hz는 0.2 mm/s 남짓으로 작게 갈라집니다. 전원을 끊는 순간 120 Hz 줄이 사라져, 0.5 s 뒤 남은 크기가 0.19입니다.' },
        { question: '원인만 미스얼라인으로 바꿔 같은 두 가지를 보세요. 무엇이 다른가요?',
          answer: '8 s에서 119.2 Hz(2X)가 약 2.9 mm/s로 크고(줄이 칸 사이에 있어 3.25보다 조금 낮게 읽힘) 120 Hz는 0.2 mm/s입니다. 전원을 끊어도 2X는 남아 회전수를 따라 아래로 휘며 천천히 줄어, 0.5 s 뒤 0.71, 2 s 뒤 0.35입니다. 1 s 기록의 한 덩어리만 보면 두 원인은 구별되지 않습니다.' },
        { question: '로터바를 고르고 기록 8 s에서 부하를 20 → 60 → 100 %로 올리세요. 측대역의 간격과 크기는? 부하 20 %에서는 기록을 몇 초로 해야 할까요?',
          answer: 'PPF가 0.27 → 0.8 → 1.33 Hz로 넓어지고 측대역도 0.1 → 0.3 → 0.5 mm/s로 커집니다. 부하 20 %의 PPF 0.27 Hz는 8 s에서 2.1칸이라 1X 봉우리의 옆자락에 묻히고, 16 s(4.3칸)에 dB 축으로 보면 드러납니다. 로터바는 부하를 걸고, 길게 재야 보입니다.' },
        { question: '보기 방식을 "숨은 원인 맞히기"로 바꾸고 케이스 1 ~ 7을 가려 보세요. 기록 길이·부하를 바꿔도 됩니다.',
          answer: '케이스 1 고정자(전기), 2 미스얼라인(기계), 3 로터바(전기, 4극 1X ± 1.6 Hz), 4 불평형(기계), 5 발전기 고정자 자기력(계자 차단에 반응), 6 발전기 기계 2X(계자 차단에 무반응), 7 동적 공극 편심(2×LF ± PPF와 1X ± PPF)입니다. "정답 보기"를 켜면 근거가 나옵니다.' },
      ]}
      footer={<p>설명용 모델입니다: 슬립은 부하에 비례(전부하 = 명판 회전수 {ELEC_MACHINES.ind2.fullLoadRpm} · {ELEC_MACHINES.ind4.fullLoadRpm} rpm), 전원 차단 뒤 전기 성분은 시간 상수 0.1 s(발전기 계자 0.8 s)로 사라지고 회전수는 f_r/(1 + t/3 s)로 줄며 기계 성분은 회전수의 제곱으로 줄어든다고 두었습니다. 실제 시간 상수·크기는 기계마다 다르며, 크기는 판정 기준이 아닙니다.</p>}
    >
      {quiz && p.answer && <p className="lab-note"><strong>{ELEC_LABEL[cause]}</strong> — {WHY[cause]}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <h4>1X 둘레 (기록 {p.seconds} s)</h4>
          <Plot series={[{ ...s1, name: '스펙트럼', color: 'var(--plot-1)', width: 1.6 }, mark(q.fr, '1X', 'var(--plot-1)'), ...sbMarks]} x={{ label: '주파수 [Hz]', range: w1 }} y={yAxis} height={220} ariaLabel="1X 둘레 확대 스펙트럼" />
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <h4>2×LF 둘레 (기록 {p.seconds} s)</h4>
          <Plot series={[{ ...s2, name: '스펙트럼', color: 'var(--plot-1)', width: 1.6 }, mark(q.pX, `${m.poles}X`, 'var(--plot-1)'), mark(q.twoLF, '2×LF', 'var(--status-wip)')]} x={{ label: '주파수 [Hz]', range: w2 }} y={yAxis} height={220} ariaLabel="2×LF 둘레 확대 스펙트럼" />
        </div>
      </div>
      <h4>시험 전후 스펙트로그램 — {testName} (0.5 s 프레임, Δf 2 Hz)</h4>
      <Plot series={[{ x: [0, 0], y: [0, 140], name: '시험', color: 'var(--status-wip)', dash: 'dash', width: 1.5 }]} heatmap={{ ...heat, zRange: [0, 4], colorLabel: 'mm/s' }} x={{ label: '시간 [s]', range: [sg.times[0], sg.times[sg.times.length - 1]] }} y={{ label: '주파수 [Hz]', range: [0, 140] }} height={280} ariaLabel="시험 전후 스펙트로그램" />
    </LabFrame>
  );
}
