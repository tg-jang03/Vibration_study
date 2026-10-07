import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { envelopeSpectrum, spectrumOf } from '../../lib/dsp/envelope';
import { kurtosis, rms } from '../../lib/dsp/stats';
import { FAULT_BY_ID } from '../../lib/faults/catalog';
import { G, hvLagDeg, MACHINES, peakAt, SYNTH_FAULTS, synthesize, topLine, velocitySpectrum, type Dir, type MachineId, type MachineSpec, type SynthFault } from '../../lib/faults/synth';

/**
 * LAB-FAULT-01 결함 신호 합성기 (P7-1, Contents §5. Part 11 케이스의 엔진).
 * 기계를 고르고 결함 두 개까지 정도를 정하면 세 방향 가속도를 만들어 속도 스펙트럼·파형·엔벨로프 스펙트럼과 증거를 보인다.
 * 계산: lib/faults/synth.ts, 결함 문구: lib/faults/catalog.ts (본문 그림 2 ~ 4와 같은 합성기).
 */

const MACHINE_OPTIONS = (Object.keys(MACHINES) as MachineId[]).map((id) => ({ value: id, label: MACHINES[id].name }));
const DIR_OPTIONS: { value: Dir; label: string }[] = [
  { value: 'H', label: '수평 (H)' },
  { value: 'V', label: '수직 (V)' },
  { value: 'A', label: '축방향 (A)' },
];

/** 이 기계에서 만들 수 있는 결함 */
function available(m: MachineSpec): SynthFault[] {
  return SYNTH_FAULTS.filter((f) => {
    if (f === 'gear') return m.teeth > 0;
    if (f === 'oilWhirl') return m.balls === 0;
    if (f === 'bearingOuter' || f === 'bearingInner' || f === 'bearingBall' || f === 'bearingCage') return m.balls > 0;
    if (f === 'bladePass' || f === 'cavitation') return m.blades > 0;
    if (f === 'electrical2LF') return m.poles > 0;
    return true;
  });
}

export interface FaultSynthState {
  machine: MachineId;
  a: SynthFault | 'none';
  sa: number;
  b: SynthFault | 'none';
  sb: number;
  dir: Dir;
}

export default function FaultSynthLab({ initial = {} }: { initial?: Partial<FaultSynthState> }) {
  const [p, setP] = useState<FaultSynthState>({ machine: 'pump', a: 'unbalance', sa: 0.6, b: 'none', sb: 0.5, dir: 'H', ...initial });
  const set = <K extends keyof FaultSynthState>(k: K) => (v: FaultSynthState[K]) => setP((q) => ({ ...q, [k]: v }));
  const m = MACHINES[p.machine];
  const fr = m.rpm / 60;
  const avail = available(m);
  const faultOptions = [{ value: 'none' as const, label: '없음' }, ...avail.map((f) => ({ value: f, label: FAULT_BY_ID[f].name }))];
  const sev = useMemo(() => {
    const s: Partial<Record<SynthFault, number>> = {};
    if (p.a !== 'none' && avail.includes(p.a)) s[p.a] = p.sa;
    if (p.b !== 'none' && avail.includes(p.b)) s[p.b] = Math.max(s[p.b] ?? 0, p.sb);
    return s;
  }, [p.machine, p.a, p.sa, p.b, p.sb]);
  const syn = useMemo(() => synthesize(m, sev), [p.machine, sev]);
  const acc = syn.acc[p.dir];
  const v = useMemo(() => velocitySpectrum(acc, syn.fs, 1000), [acc]);
  const env = useMemo(() => envelopeSpectrum(spectrumOf(acc), syn.fs, 2800, 3800, 1000), [acc]);
  const tShow = 0.2;
  const nShow = Math.round(tShow * syn.fs);
  const step = 4;
  const tw: number[] = [];
  const yw: number[] = [];
  for (let i = 0; i < nShow; i += step) {
    tw.push((i / syn.fs) * 1000);
    yw.push(v.vel[i] * 1000);
  }
  const vMax = Math.max(0.5, ...Array.from(v.amp)) * 1.15;
  const grid: PlotSeries[] = [1, 2, 3, 4, 5, 6, 7, 8].filter((k) => k * fr <= 1000).map((k) => ({ x: [k * fr, k * fr], y: [0, vMax], name: '1X의 정수배', color: 'var(--text-muted)', dash: 'dot', width: 0.8, hideInLegend: k > 1 }));
  const envTop = topLine(env.freq, env.amp);
  const shown = [p.a, p.b].filter((f, i, arr): f is SynthFault => f !== 'none' && avail.includes(f) && arr.indexOf(f) === i);
  const lag = hvLagDeg(syn, fr);

  return (
    <LabFrame id="LAB-FAULT-01" title="결함 신호 합성기: 원인마다의 지문"
      controls={<>
        <ParamSelect label="기계" value={p.machine} options={MACHINE_OPTIONS} onChange={set('machine')} />
        <ParamSelect label="결함 ①" value={avail.includes(p.a as SynthFault) ? p.a : 'none'} options={faultOptions} onChange={set('a')} />
        <ParamSlider label="결함 ①의 정도" value={p.sa} min={0} max={1} step={0.05} onChange={set('sa')} />
        <ParamSelect label="결함 ②" value={avail.includes(p.b as SynthFault) ? p.b : 'none'} options={faultOptions} onChange={set('b')} />
        <ParamSlider label="결함 ②의 정도" value={p.sb} min={0} max={1} step={0.05} onChange={set('sb')} />
        <ParamSelect label="센서 방향" value={p.dir} options={DIR_OPTIONS} onChange={set('dir')} />
      </>}
      readouts={<ReadoutTable caption={`읽음값 (${p.dir} 방향)`} rows={[
        { label: '속도 overall (RMS)', value: rms(v.vel) * 1000, unit: 'mm/s', sig: 3 },
        { label: `1X (${formatNumber(fr, 4)} Hz)`, value: peakAt(v.freq, v.amp, fr), unit: 'mm/s rms', sig: 3 },
        { label: '2X', value: peakAt(v.freq, v.amp, 2 * fr), unit: 'mm/s rms', sig: 3 },
        { label: '½X', value: peakAt(v.freq, v.amp, 0.5 * fr), unit: 'mm/s rms', sig: 2 },
        { label: '1X 위상: 수직이 수평보다 늦은 각', value: lag, unit: '°', sig: 3 },
        { label: '가속도 첨도 K', value: kurtosis(acc), sig: 3 },
        { label: '엔벨로프 스펙트럼의 가장 큰 줄', value: envTop.f, unit: 'Hz', sig: 4 },
        { label: '그 줄 ÷ 바닥(진폭 중앙값)', value: envTop.ratio, unit: '배', sig: 2 },
      ]} />}
      tasks={[
        { question: '펌프에 불평형 0.6을 넣고 방향을 H → V → A로 바꿔 1X를 보세요. 정렬 불량 0.6으로 바꾸면?',
          answer: '불평형은 1X가 H 4.9, V 3.5, A 0.5 mm/s로 반경 방향이 크고, 수직이 수평보다 약 90° 늦습니다. 정렬 불량은 A 1X가 3.1 mm/s로 가장 크고 2X도 커지며, 수평·수직 위상차가 약 26°로 90°에서 멉니다.' },
        { question: '풀림 0.6을 V 방향으로 보세요. 1X의 정수배 말고 어디에 줄이 서나요? 가속도 첨도는?',
          answer: '정수배 사이의 ½X 자리(½X, 1½X …)에도 줄이 섭니다(½X 약 1 mm/s). 하모닉의 위상이 맞아 파형이 뾰족해져 가속도 첨도가 약 10으로 큽니다.' },
        { question: '외륜 결함 0.6을 넣고 V 방향의 속도 스펙트럼과 엔벨로프 스펙트럼을 비교하세요.',
          answer: '속도 스펙트럼에서는 BPFO(213.6 Hz)가 0.5 mm/s쯤으로 작게만 보이지만, 엔벨로프 스펙트럼의 가장 큰 줄은 BPFO이고 하모닉이 이어집니다. 구름베어링은 엔벨로프로 봅니다 (P5-6).' },
        { question: '감속기를 고르고 기어 결함을 넣으면 맞물림 둘레 측대역의 간격은? 그것이 무엇을 가리키나요?',
          answer: '맞물림 571 Hz 둘레에 24.8 Hz(입력축 1X) 간격으로 측대역이 섭니다. 측대역 간격 = 결함이 있는 축의 회전수입니다 (P2-8, P7-6).' },
      ]}
      footer={<p>설명용 합성 신호입니다: {m.name}, {m.rpm} rpm, f_s {m.fs} Hz, {m.seconds}초. 건전한 상태에도 작은 1X·2X·날개 통과·전기 성분과 바탕 잡음 0.02 g가 있습니다. 충격을 만드는 결함이 없으면 엔벨로프 스펙트럼은 바닥 잡음뿐이라, 가장 큰 줄이 바닥의 몇 배인지 함께 봅니다. 크기는 원인 사이의 모양 비교용이며 판정 기준이 아닙니다.</p>}
    >
      <h4>속도 스펙트럼 0 ~ 1000 Hz ({p.dir})</h4>
      <Plot series={[...grid, { x: Array.from(v.freq), y: Array.from(v.amp), name: '속도', color: 'var(--plot-1)', width: 1.2 }]} x={{ label: '주파수 [Hz]', range: [0, 1000] }} y={{ label: '[mm/s rms]', range: [0, vMax] }} height={230} ariaLabel="속도 스펙트럼" />
      <h4>속도 파형 (200 ms)</h4>
      <Plot series={[{ x: tw, y: yw, name: '속도', color: 'var(--plot-1)', width: 1 }]} x={{ label: '시각 [ms]', range: [0, tShow * 1000] }} y={{ label: '[mm/s]' }} height={170} ariaLabel="속도 파형" />
      <h4>가속도 엔벨로프 스펙트럼 (2800 ~ 3800 Hz 대역)</h4>
      <Plot series={[{ x: Array.from(env.freq), y: Array.from(env.amp, (a) => a / G), name: '엔벨로프', color: 'var(--plot-2)', width: 1.2 }]} x={{ label: '주파수 [Hz]', range: [0, 1000] }} y={{ label: '[g]' }} height={180} ariaLabel="엔벨로프 스펙트럼" />
      {shown.length > 0 && <>
        <h4>넣은 결함의 증거 5요소</h4>
        <div className="fault-cards">
          {shown.map((f) => {
            const info = FAULT_BY_ID[f];
            return (
              <details key={f} className="fault-card" open>
                <summary><strong>{info.name}</strong> — 자세히 {info.page}</summary>
                <ul>
                  <li><b>주파수</b>: {info.frequency}</li>
                  <li><b>진폭</b>: {info.amplitude}</li>
                  <li><b>위상</b>: {info.phase}</li>
                  <li><b>방향</b>: {info.direction}</li>
                  <li><b>운전조건</b>: {info.condition}</li>
                </ul>
              </details>
            );
          })}
        </div>
      </>}
    </LabFrame>
  );
}
