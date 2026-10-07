import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import { formatNumber } from '../../lib/format';
import { withBase } from '../../lib/site';
import { PARTS } from '../../data/curriculum';
import { candidatesAt, FAMILY_LABEL, FAULTS, type FaultFamily, type MachineInfo, type Tracking } from '../../lib/faults/catalog';
import { MACHINES, type MachineId } from '../../lib/faults/synth';

/**
 * LAB-MAP-01 진단 주파수 지도: 주파수 → 원인 후보 (P7-1, Contents §5).
 * 기계 정보(회전수·전원·날개·잇수·볼 수·극수)로 원인마다의 주파수 자리를 계산하고, 측정한 줄에 맞는 후보와 증거 5요소를 보인다.
 * 계산: lib/faults/catalog.ts (P7-1 그림 1과 같은 규칙).
 */

const MACHINE_OPTIONS = (Object.keys(MACHINES) as MachineId[]).map((id) => ({ value: id, label: MACHINES[id].name }));
const TRACK_OPTIONS: { value: Tracking | 'unknown'; label: string }[] = [
  { value: 'unknown', label: '모름' },
  { value: 'rotating', label: '회전수를 따라 움직인다' },
  { value: 'fixed', label: '회전수를 바꿔도 그대로다' },
];
const FAMILY_OPTIONS: { value: FaultFamily | 'all'; label: string }[] = [{ value: 'all', label: '전체' }, ...(Object.keys(FAMILY_LABEL) as FaultFamily[]).map((f) => ({ value: f, label: FAMILY_LABEL[f] }))];
const FAMILY_ROW: Record<FaultFamily, number> = { shaft: 6, structure: 5, bearing: 4, gear: 3, electrical: 2, flow: 1 };
/** 공개된 절이면 주소, 아직 없으면 undefined (링크를 걸지 않는다) */
const pageHref = (id: string) => PARTS.flatMap((p) => p.sections).find((s) => s.id === id && s.status !== 'planned' && s.href)?.href;
const FAMILY_COLOR: Record<FaultFamily, string> ={ shaft: 'var(--plot-1)', structure: 'var(--text-muted)', bearing: 'var(--plot-2)', gear: 'var(--plot-4)', electrical: 'var(--status-wip)', flow: 'var(--plot-3)' };

export interface FaultMapState {
  machine: MachineId;
  rpm: number;
  f: number;
  tracking: Tracking | 'unknown';
  family: FaultFamily | 'all';
}

export default function FaultMapLab({ initial = {} }: { initial?: Partial<FaultMapState> }) {
  const [p, setP] = useState<FaultMapState>({ machine: 'pump', rpm: MACHINES.pump.rpm, f: 120, tracking: 'unknown', family: 'all', ...initial });
  const set = <K extends keyof FaultMapState>(k: K) => (v: FaultMapState[K]) => setP((q) => ({ ...q, [k]: v }));
  const mm = MACHINES[p.machine];
  const info: MachineInfo = { fr: p.rpm / 60, lineHz: mm.lineHz, blades: mm.blades, teeth: mm.teeth, balls: mm.balls, poles: mm.poles };
  const fMax = Math.max(1000, 2.2 * mm.teeth * info.fr);
  const cands = useMemo(() => candidatesAt(p.f, info, p.tracking).filter((c) => p.family === 'all' || c.fault.family === p.family), [p.f, p.rpm, p.machine, p.tracking, p.family]);

  // 지도: 원인 갈래마다 한 줄, 원인 자리를 점(구간은 선분)으로
  const pts: Record<FaultFamily, { x: number[]; y: number[]; text: string[] }> = { shaft: { x: [], y: [], text: [] }, structure: { x: [], y: [], text: [] }, bearing: { x: [], y: [], text: [] }, gear: { x: [], y: [], text: [] }, electrical: { x: [], y: [], text: [] }, flow: { x: [], y: [], text: [] } };
  const bands: PlotSeries[] = [];
  for (const fault of FAULTS) {
    for (const s of fault.spots(info)) {
      const row = FAMILY_ROW[fault.family];
      if (s.f1 !== undefined && s.f2 !== undefined) {
        bands.push({ x: [s.f1, Math.min(s.f2, fMax)], y: [row, row], name: fault.name, color: FAMILY_COLOR[fault.family], width: 6, opacity: 0.5, hideInLegend: true });
      } else if (s.f <= fMax) {
        pts[fault.family].x.push(s.f);
        pts[fault.family].y.push(row);
        pts[fault.family].text.push(`${fault.name}: ${s.label}`);
      }
    }
  }
  const series: PlotSeries[] = [
    ...bands,
    ...(Object.keys(pts) as FaultFamily[]).map((fam): PlotSeries => ({ x: pts[fam].x, y: pts[fam].y, name: FAMILY_LABEL[fam], mode: 'markers', color: FAMILY_COLOR[fam], markerSize: 8 })),
    { x: [p.f, p.f], y: [0.4, 6.6], name: '측정한 줄', color: 'var(--text)', dash: 'dash', width: 2 },
  ];

  return (
    <LabFrame id="LAB-MAP-01" title="진단 주파수 지도: 주파수 → 원인 후보"
      controls={<>
        <ParamSelect label="기계" value={p.machine} options={MACHINE_OPTIONS} onChange={(v) => setP((q) => ({ ...q, machine: v, rpm: MACHINES[v].rpm }))} />
        <ParamSlider label="회전수" value={p.rpm} min={300} max={7200} step={5} unit="rpm" onChange={set('rpm')} hint={`1X = ${formatNumber(info.fr, 4)} Hz`} />
        <ParamSlider label="측정한 줄의 주파수" value={p.f} min={1} max={Math.round(fMax)} step={0.1} unit="Hz" onChange={set('f')} hint={`= ${formatNumber(p.f / info.fr, 4)}X`} />
        <ParamSelect label="운전 조건을 바꾸면" value={p.tracking} options={TRACK_OPTIONS} onChange={set('tracking')} />
        <ParamSelect label="원인 갈래" value={p.family} options={FAMILY_OPTIONS} onChange={set('family')} />
      </>}
      footer={<p>원인과 증거 문구는 판단의 출발점입니다 (판정 기준이 아니다). 자리의 허용 폭은 정수배 ±2 %(최소 0.5 Hz), 2×LF ±0.3 Hz입니다. 기계 정보: 전원 {mm.lineHz} Hz{mm.poles ? `, ${mm.poles}극 유도전동기` : ''}{mm.blades ? `, 날개 ${mm.blades}개` : ''}{mm.teeth ? `, 기어 ${mm.teeth} → ${mm.mateTeeth}이빨` : ''}, {mm.balls ? `구름베어링(볼 ${mm.balls}개, 6205 치수비)` : '미끄럼베어링'}.</p>}
    >
      <h4>이 기계의 원인 자리 (가로 = 주파수)</h4>
      <Plot series={series} x={{ label: '주파수 [Hz]', range: [0, fMax] }} y={{ label: '', range: [0.4, 6.6] }} height={230} ariaLabel="원인 자리 지도" />
      <p className="lab-note">세로 줄: 위부터 축·회전체, 구조, 베어링, 기어, 전기, 유체·공력. 점선 = 측정한 줄 ({formatNumber(p.f, 4)} Hz = {formatNumber(p.f / info.fr, 4)}X).</p>
      <h4>후보 {cands.length}개 {cands.length > 1 ? '— 같은 자리에 여럿이면 나머지 증거로 가린다' : ''}</h4>
      {cands.length === 0 ? (
        <p>이 자리에 맞는 원인이 목록에 없습니다. 회전수·기계 정보를 확인하거나, 구조 공진(고정 주파수)처럼 자리가 정해지지 않은 원인을 생각합니다.</p>
      ) : (
        <div className="fault-cards">
          {cands.map((c) => (
            <details key={c.fault.id} className="fault-card" open={cands.length <= 2}>
              <summary>
                <strong>{c.fault.name}</strong> — {c.spot.label} ({c.spot.f1 !== undefined ? `${formatNumber(c.spot.f1, 4)} ~ ${formatNumber(c.spot.f2!, 4)} Hz` : `${formatNumber(c.spot.f, 5)} Hz`}{c.miss > 0 ? `, ${formatNumber(c.miss, 2)} Hz 차이` : ''}) · {FAMILY_LABEL[c.fault.family]}
              </summary>
              <ul>
                <li><b>주파수</b>: {c.fault.frequency}</li>
                <li><b>진폭</b>: {c.fault.amplitude}</li>
                <li><b>위상</b>: {c.fault.phase}</li>
                <li><b>방향</b>: {c.fault.direction}</li>
                <li><b>운전조건</b>: {c.fault.condition}</li>
                <li><b>확인</b>: {c.fault.confirm} — {pageHref(c.fault.page) ? <a href={withBase(pageHref(c.fault.page))}>{c.fault.page}</a> : <span>{c.fault.page} (준비 중)</span>}</li>
              </ul>
            </details>
          ))}
        </div>
      )}
    </LabFrame>
  );
}
