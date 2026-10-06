import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { bearingFrequencies } from '../../lib/machine/frequencies';
import {
  buildMap,
  EXAMPLE,
  exampleBearing,
  LINE_FREQUENCY,
  MAP_RANGE,
  PRESETS,
  zoneOf,
  type PresetId,
  type ZoneId,
} from '../../lib/machine/frequencyMap';

/**
 * LAB-FMAP-01 주파수 지도: 기계 요소별 관심 구간 (P1-7, Contents §5-1, D-032).
 * 기계와 회전수·개수를 고르면 요소마다 한 줄씩 그 요소가 만드는 주파수를 로그 주파수 축 위에 세운다.
 * 줄 이름이 겹치지 않도록 지도는 요소별 가로줄 SVG로 그린다 (본문 그림 10과 같은 모양, 같은 계산 `lib/machine`).
 */

const PRESET_OPTIONS = (Object.keys(PRESETS) as PresetId[]).map((id) => ({ value: id, label: PRESETS[id].label }));
const ZONE_NAME: Record<ZoneId, string> = { sub: '1X 아래', low: '1X ~ 10X', mid: '10X ~ 수 kHz', high: '수 kHz 이상' };
const SHORT: Record<string, string> = { '케이지 FTF': 'FTF', '외륜 BPFO': 'BPFO', '내륜 BPFI': 'BPFI', '볼 자전 BSF': 'BSF', };

// SVG 배치
const W = 880;
const ML = 132;
const MR = 16;
const TOP = 30;
const ROW = 46;
const AXIS = 40;
const lx = (f: number) => ML + ((Math.log10(f) - Math.log10(MAP_RANGE[0])) / (Math.log10(MAP_RANGE[1]) - Math.log10(MAP_RANGE[0]))) * (W - ML - MR);
const TICKS = [10, 100, 1000, 10000];
const tickLabel = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));
const ROT = 'var(--plot-1)';
const FIX = 'var(--status-wip)';

export interface FrequencyMapLabProps {
  initialPreset?: PresetId;
}

export default function FrequencyMapLab({ initialPreset = 'motorPump' }: FrequencyMapLabProps) {
  const [preset, setPreset] = useState<PresetId>(initialPreset);
  const p = PRESETS[preset];
  const [rpm, setRpm] = useState(p.rpm);
  const [count, setCount] = useState(p.count);
  const [balls, setBalls] = useState(p.balls ?? 9);

  const choosePreset = (id: PresetId) => {
    const q = PRESETS[id];
    setPreset(id);
    setRpm(q.rpm);
    setCount(q.count);
    setBalls(q.balls ?? 9);
  };

  const map = useMemo(() => buildMap(preset, { rpm, count, balls }), [preset, rpm, count, balls]);
  const fr = map.fr;
  const height = TOP + map.rows.length * ROW + AXIS;
  const flat: { element: string; label: string; f: number; f2?: number; kind: 'rotating' | 'fixed' }[] = map.rows.flatMap((row) => [
    ...row.lines.map((l) => ({ element: row.element, label: l.label, f: l.f, kind: l.kind })),
    ...row.bands.map((b) => ({ element: row.element, label: b.label, f: b.f1, f2: b.f2, kind: b.kind })),
  ]);

  // 기계별 대표 식
  const brg = bearingFrequencies(exampleBearing(balls), preset === 'beltFan' ? (fr * EXAMPLE.motorPulley) / EXAMPLE.fanPulley : fr);
  const frTex = `f_r = \\frac{${texNumber(rpm, 4)}}{60} = ${texNumber(fr, 4)}\\ \\mathrm{Hz}`;
  const formulas: string[] = [frTex];
  if (preset === 'motorPump') {
    formulas.push(`f_{BP} = N_b\\,f_r = ${count} \\times ${texNumber(fr, 4)} = ${texNumber(count * fr, 4)}\\ \\mathrm{Hz}`);
  } else if (preset === 'gearbox') {
    formulas.push(`f_{GM} = z_1 f_r = ${count} \\times ${texNumber(fr, 4)} = ${texNumber(count * fr, 4)}\\ \\mathrm{Hz},\\quad f_2 = \\frac{f_{GM}}{z_2} = \\frac{${texNumber(count * fr, 4)}}{${EXAMPLE.gearTeethOut}} = ${texNumber((count * fr) / EXAMPLE.gearTeethOut, 4)}\\ \\mathrm{Hz}`);
  } else if (preset === 'gtGenerator') {
    formulas.push(`f_{BP} = N_b\\,f_r = ${count} \\times ${texNumber(fr, 4)} = ${texNumber(count * fr, 4)}\\ \\mathrm{Hz},\\quad 2X = ${texNumber(2 * fr, 4)}\\ \\mathrm{Hz}\\ \\text{vs}\\ 2 f_L = ${2 * LINE_FREQUENCY}\\ \\mathrm{Hz}`);
  } else {
    formulas.push(`f_{belt} = \\frac{\\pi D_p f_r}{L} = \\frac{\\pi \\times ${EXAMPLE.motorPulley} \\times ${texNumber(fr, 4)}}{${EXAMPLE.beltLength}} = ${texNumber((Math.PI * EXAMPLE.motorPulley * fr) / EXAMPLE.beltLength, 4)}\\ \\mathrm{Hz}`);
  }
  if (p.balls !== null) {
    formulas.push(`f_{BPFO} = N_r f_{FTF} = ${balls} \\times ${texNumber(brg.ftf, 4)} = ${texNumber(brg.bpfo, 4)}\\ \\mathrm{Hz},\\quad f_{BPFI} = N_r (f_r - f_{FTF}) = ${texNumber(brg.bpfi, 4)}\\ \\mathrm{Hz}`);
  }

  const mainRow = map.rows.find((row) => /날개|맞물림|벨트/.test(row.element));
  const mainLine = mainRow?.lines[0];

  return (
    <LabFrame id="LAB-FMAP-01" title="주파수 지도: 요소마다 어디에 줄이 서나"
      controls={<>
        <ParamSelect label="기계" value={preset} options={PRESET_OPTIONS} onChange={choosePreset} />
        <ParamSlider label={`회전수 (${p.shaftLabel})`} value={rpm} min={300} max={6000} step={10} unit="rpm" onChange={setRpm} hint="전원 주파수 60 Hz와 구조 고유진동수는 그대로 둔 채 회전수만 바꿉니다" />
        <ParamSlider label={p.countLabel} value={count} min={p.countRange[0]} max={p.countRange[1]} step={1} onChange={setCount} />
        <ParamSlider label="베어링 볼 수 N_r" value={balls} min={6} max={16} step={1} disabled={p.balls === null} onChange={setBalls}
          hint={p.balls === null ? '이 축계의 로터는 미끄럼 베어링 위에서 돕니다' : '볼 지름 ÷ 피치 지름은 6205와 같게 (≈ 0.2)'} />
      </>}
      formulas={<>
        {formulas.map((tex) => <Formula key={tex} display tex={tex} />)}
        <p>세는 규칙: 한 바퀴에 k번 일어나면 k × f_r. 파랑 실선은 회전수를 따라 움직이고, 주황 점선·띠(전원·구조)는 제자리입니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: `1X (${p.shaftLabel})`, value: fr, unit: 'Hz' },
        ...(mainLine ? [{ label: `${mainRow?.element} — ${mainLine.label} (${formatNumber(mainLine.f / fr, 4)}X)`, value: mainLine.f, unit: 'Hz' }] : []),
        ...(p.balls !== null ? [
          { label: `외륜 BPFO (${formatNumber(brg.bpfo / fr, 4)}X)`, value: brg.bpfo, unit: 'Hz' },
          { label: `내륜 BPFI (${formatNumber(brg.bpfi / fr, 4)}X)`, value: brg.bpfi, unit: 'Hz' },
        ] : []),
        { label: '전자기력 2 f_L', value: 2 * LINE_FREQUENCY, unit: 'Hz' },
        { label: '지도에서 가장 높은 주파수 (측정 범위의 위 끝 후보)', value: map.highest, unit: 'Hz' },
      ]} />}
      tasks={[
        { question: '전동기-펌프에서 회전수를 3570 → 3000 rpm으로 내리면 어떤 줄이 제자리에 있나요?',
          answer: '전동기 2 f_L(120 Hz), 받침대 고유진동수(85 Hz), 충격 울림 대역(2 ~ 5 kHz)은 그대로입니다. 나머지 줄은 모두 3000 ÷ 3570 = 0.84배로 함께 왼쪽으로 옮겨 갑니다. 회전수를 바꿔 따라 움직이는지 보는 것이 원인을 가르는 첫 단서입니다 (P1-8).' },
        { question: '볼 수를 9 → 12로 바꾸면 BPFO·BPFI는 몇 X가 되나요? 1X의 정수배 자리에 서나요?',
          answer: '케이지는 그대로 약 0.398X이므로 BPFO = 12 × 0.398 ≈ 4.78X, BPFI = 12 × (1 − 0.398) ≈ 7.22X입니다. 여전히 정수배 사이에 섭니다. 둘을 더하면 12X(볼 수 × 1X)입니다.' },
        { question: 'GT-발전기 축계(3600 rpm)에서 2X와 전기 2 f_L은 어디에 서나요? 회전수를 3000 rpm으로 바꾸면?',
          answer: '3600 rpm에서는 둘 다 120 Hz라 주파수만으로는 가를 수 없습니다. 3000 rpm이면 2X는 100 Hz, 2 f_L은 120 Hz로 갈라집니다. 실제 2극 발전기는 전원에 맞춰 늘 3600 rpm(60 Hz 계통)으로 돌므로, 다른 증거(트립 순간 사라지나 등)로 가릅니다 (P7-7).' },
        { question: '기어 상자에서 입력 기어 이빨을 15 → 30으로 바꾸면 맞물림과 그 3배는? 이 기계를 재려면 어디까지 봐야 하나요?',
          answer: '맞물림 1500 Hz, 3배 4500 Hz입니다. 충격 울림 대역(예시 2 ~ 5 kHz)까지 포함하면 5 kHz 이상을 봐야 합니다. 이런 높은 구간은 가속도계로 잽니다 (P3-1). 측정 범위를 정하는 법은 P2-9에서 다룹니다.' },
      ]}
      footer={<p>구조 고유진동수(85 Hz, GT 45 Hz), 충격 울림 대역(2 ~ 5 kHz), 풀리·벨트 치수는 설명용 예시값입니다. 베어링은 볼 수만 바꾸고 볼 지름과 피치 지름의 비는 6205 베어링과 같게 두었습니다.</p>}
    >
      <h4>주파수 지도 (가로축 로그 눈금, 요소마다 한 줄)</h4>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" role="img" aria-label="기계 요소별 주파수 지도" style={{ display: 'block', fontSize: 12 }}>
        {map.zones.map((z, i) => (
          <g key={z.id}>
            {i % 2 === 0 && <rect x={lx(z.f1)} y={TOP - 22} width={Math.max(0, lx(z.f2) - lx(z.f1))} height={map.rows.length * ROW + 22} fill="var(--surface-2)" />}
            <text x={(lx(z.f1) + lx(z.f2)) / 2} y={TOP - 8} textAnchor="middle" fill="var(--text-muted)" fontWeight={700}>{z.label}</text>
          </g>
        ))}
        {map.rows.map((row, i) => {
          const y = TOP + i * ROW + ROW / 2;
          return (
            <g key={row.element}>
              <line x1={ML} x2={W - MR} y1={y + ROW / 2} y2={y + ROW / 2} stroke="var(--border)" />
              <text x={8} y={y + 4} fill="var(--text)" fontWeight={700}>{row.element}</text>
              {row.bands.map((b) => (
                <g key={b.label}>
                  <rect x={lx(b.f1)} y={y - 9} width={Math.max(2, lx(b.f2) - lx(b.f1))} height={18} rx={3}
                    fill={b.kind === 'rotating' ? ROT : FIX} opacity={0.25} stroke={b.kind === 'rotating' ? ROT : FIX} />
                  <text x={(lx(b.f1) + lx(b.f2)) / 2} y={y - 13} textAnchor="middle" fill={b.kind === 'rotating' ? ROT : FIX}>{b.label}</text>
                </g>
              ))}
              {row.lines.map((l) => (
                <g key={l.label}>
                  <line x1={lx(l.f)} x2={lx(l.f)} y1={y - 11} y2={y + 11} stroke={l.kind === 'rotating' ? ROT : FIX} strokeWidth={3}
                    strokeDasharray={l.kind === 'fixed' ? '4 3' : undefined} />
                  <text x={lx(l.f)} y={y - 15} textAnchor="middle" fill={l.kind === 'rotating' ? ROT : FIX}>{SHORT[l.label] ?? l.label}</text>
                </g>
              ))}
            </g>
          );
        })}
        <line x1={ML} x2={W - MR} y1={TOP + map.rows.length * ROW} y2={TOP + map.rows.length * ROW} stroke="var(--text-muted)" />
        {TICKS.map((v) => (
          <g key={v}>
            <line x1={lx(v)} x2={lx(v)} y1={TOP + map.rows.length * ROW} y2={TOP + map.rows.length * ROW + 5} stroke="var(--text-muted)" />
            <text x={lx(v)} y={TOP + map.rows.length * ROW + 18} textAnchor="middle" fill="var(--text-muted)">{tickLabel(v)}</text>
          </g>
        ))}
        <text x={(ML + W - MR) / 2} y={height - 4} textAnchor="middle" fill="var(--text-muted)">주파수 [Hz]</text>
      </svg>
      <table className="readout-table">
        <thead>
          <tr><th>요소</th><th>줄</th><th>주파수 [Hz]</th><th>1X의 몇 배</th><th>구간</th><th>회전수를 따라가나</th></tr>
        </thead>
        <tbody>
          {flat.map((l) => (
            <tr key={`${l.element}-${l.label}`}>
              <td>{l.element}</td>
              <td>{l.label}</td>
              <td>{l.f2 !== undefined ? `${formatNumber(l.f, 3)} ~ ${formatNumber(l.f2, 3)}` : formatNumber(l.f, 4)}</td>
              <td>{l.f2 !== undefined ? `${formatNumber(l.f / fr, 3)} ~ ${formatNumber(l.f2 / fr, 3)}` : formatNumber(l.f / fr, 4)}</td>
              <td>{ZONE_NAME[zoneOf(l.f, map.zones)]}</td>
              <td>{l.kind === 'rotating' ? '따라감' : '제자리'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LabFrame>
  );
}
