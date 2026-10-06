import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import {
  DEFAULT_MACHINE, DEFAULT_SETTINGS, FMAX_OPTIONS, LOR_OPTIONS, MACHINE_CONST, MIN_SEPARATION, RECIPES, runSandbox, STATUS_LABEL,
  type ItemStatus, type Machine, type Purpose, type SandboxAverage, type SandboxWindow, type Settings,
} from '../../lib/sandbox';

/**
 * LAB-SBX-01 Signal Lab 샌드박스 (P1-8 §6, /lab/, Contents §5-1).
 * 기계 신호를 직접 만들고 Part 1의 설정을 모두 바꿔 가며, 성분마다 "지금 설정으로 보이는가"를 판정한다.
 * 목적을 고르면 설정 도우미가 출발점 설정과 이유를 채운다 (예시값, I-014). 계산: src/lib/sandbox.ts (그림과 같은 엔진).
 */

const WINDOWS: { value: SandboxWindow; label: string }[] = [
  { value: 'hann', label: 'Hann' }, { value: 'uniform', label: '윈도우 없음' },
  { value: 'flatTop', label: 'Flat top' }, { value: 'blackmanHarris', label: 'Blackman-Harris' },
];
const AVERAGES: { value: SandboxAverage; label: string }[] = [
  { value: 'none', label: '한 번만 (평균 없음)' }, { value: 'linear', label: '파워 평균' }, { value: 'peakHold', label: '피크 홀드' },
];
type ViewKey = 'all' | 'low' | 'mesh' | 'ring';
const STATUS_COLOR: Record<ItemStatus, string> = {
  visible: 'var(--plot-3)', merged: 'var(--plot-2)', buried: 'var(--text-muted)', outside: 'var(--text-muted)', aliased: 'var(--plot-4)',
};
const PURPOSES: { value: Purpose | 'custom'; label: string }[] = [
  { value: 'custom', label: '직접 설정' },
  ...(Object.keys(RECIPES) as Purpose[]).map((p) => ({ value: p, label: RECIPES[p].label })),
];

export interface SandboxLabProps {
  /** 시작할 때의 목적 (도우미 설정을 채운 상태로 시작) */
  initialPurpose?: Purpose | 'custom';
}

export default function SandboxLab({ initialPurpose = 'custom' }: SandboxLabProps) {
  const start = initialPurpose === 'custom' ? undefined : RECIPES[initialPurpose];
  const [machine, setMachine] = useState<Machine>(DEFAULT_MACHINE);
  const [settings, setSettings] = useState<Settings>(start?.settings ?? DEFAULT_SETTINGS);
  const [purpose, setPurpose] = useState<Purpose | 'custom'>(initialPurpose);
  const [peak, setPeak] = useState(start?.peak ?? false);
  const [db, setDb] = useState(start?.db ?? false);
  const [viewKey, setViewKey] = useState<ViewKey>('all');
  const [noiseScale, setNoiseScale] = useState(1);

  const m = { ...machine, noisePsd: DEFAULT_MACHINE.noisePsd * noiseScale ** 2 };
  const setM = (patch: Partial<Machine>) => setMachine((old) => ({ ...old, ...patch }));
  const setS = (patch: Partial<Settings>) => { setSettings((old) => ({ ...old, ...patch })); setPurpose('custom'); };
  const choose = (p: Purpose | 'custom') => {
    setPurpose(p);
    if (p === 'custom') return;
    setSettings(RECIPES[p].settings);
    setPeak(RECIPES[p].peak ?? false);
    setDb(RECIPES[p].db ?? false);
    setViewKey(p === 'gear' ? 'mesh' : p === 'bearing' ? 'ring' : p === 'sub' || p === 'balance' ? 'low' : 'all');
  };

  const result = useMemo(() => runSandbox(m, settings), [machine, noiseScale, settings]); // eslint-disable-line react-hooks/exhaustive-deps
  const f1 = machine.rpm / 60;
  const mesh = MACHINE_CONST.teethA * f1;
  const range = ((): [number, number] => {
    if (viewKey === 'low') return [0, Math.min(settings.fmax, 4 * f1)];
    if (viewKey === 'mesh') return [Math.max(0, mesh - 60), Math.min(settings.fmax, mesh + 60)];
    if (viewKey === 'ring') return [Math.max(0, MACHINE_CONST.ringFreq - 800), Math.min(settings.fmax, MACHINE_CONST.ringFreq + 800)];
    return [0, settings.fmax];
  })();
  const scale = (v: number) => {
    const a = v * 1000 * (peak ? Math.SQRT2 : 1);
    return db ? 20 * Math.log10(Math.max(a, 1e-6)) : a;
  };

  const plot = useMemo(() => {
    const a = Math.max(0, Math.floor(range[0] / result.df));
    const b = Math.min(result.rms.length - 1, Math.ceil(range[1] / result.df));
    const series: PlotSeries[] = [
      { x: Array.from(result.frequency.slice(a, b + 1)), y: Array.from(result.rms.slice(a, b + 1), scale), name: '스펙트럼', color: 'var(--plot-1)', width: 1.2 },
    ];
    for (const st of ['visible', 'merged', 'buried', 'aliased'] as ItemStatus[]) {
      const its = result.items.filter((i) => i.status === st);
      if (its.length === 0) continue;
      const xs = its.map((i) => (st === 'aliased' ? i.aliasAt ?? i.freq : i.freq));
      series.push({ x: xs, y: its.map((i) => scale(i.value)), name: STATUS_LABEL[st], mode: 'markers', color: STATUS_COLOR[st], markerSize: 10 });
    }
    return series;
  }, [result, range[0], range[1], peak, db]); // eslint-disable-line react-hooks/exhaustive-deps

  const recipe = purpose === 'custom' ? undefined : RECIPES[purpose];
  const unit = db ? `dB (0 dB = 1 mm/s ${peak ? 'Peak' : 'RMS'})` : `mm/s ${peak ? 'Peak' : 'RMS'}`;

  return (
    <LabFrame id="LAB-SBX-01" title="Signal Lab: 내 설정으로 무엇이 보이나"
      controls={<>
        <ParamSelect label="목적 (설정 도우미)" value={purpose} options={PURPOSES} onChange={choose}
          hint="고르면 출발점 설정을 채웁니다. 예시값이므로 기계마다 다시 정합니다 (I-014)." />
        <ParamSelect label="F_max" value={settings.fmax} options={FMAX_OPTIONS.map((f) => ({ value: f, label: `${f} Hz (f_s ${formatNumber(2.56 * f, 5)} Hz)` }))} onChange={(v) => setS({ fmax: v })} />
        <ParamSelect label="라인 수" value={settings.lor} options={LOR_OPTIONS.map((l) => ({ value: l, label: `${l} 라인 (Δf ${formatNumber(settings.fmax / l, 3)} Hz)` }))} onChange={(v) => setS({ lor: v })} />
        <ParamSelect label="윈도우" value={settings.window} options={WINDOWS} onChange={(v) => setS({ window: v })} />
        <ParamToggle label="AAF (안티에일리어싱 필터)" checked={settings.aaf} onChange={(v) => setS({ aaf: v })} hint="끄면 F_max 위 성분이 접혀 들어옵니다 (P1-2)" />
        <ParamSelect label="평균" value={settings.average} options={AVERAGES} onChange={(v) => setS({ average: v })} />
        <ParamSlider label="평균 횟수 M" value={settings.count} min={1} max={32} step={1} disabled={settings.average === 'none'} onChange={(v) => setS({ count: v })} />
        <ParamSelect label="오버랩" value={settings.overlap} options={[{ value: 0, label: '0 %' }, { value: 0.5, label: '50 %' }, { value: 0.75, label: '75 %' }]} onChange={(v) => setS({ overlap: v })} />
        <ParamToggle label="Peak로 표시 (끄면 RMS)" checked={peak} onChange={setPeak} />
        <ParamToggle label="dB로 보기" checked={db} onChange={setDb} />
        <ParamSelect label="보기 범위" value={viewKey} onChange={setViewKey}
          options={[{ value: 'all', label: '0 ~ F_max 전체' }, { value: 'low', label: '1X 근처 (0 ~ 4X)' }, { value: 'mesh', label: '기어 맞물림 ± 60 Hz' }, { value: 'ring', label: '충격 울림 3 kHz ± 800 Hz' }]} />
        <ParamSlider label="회전수" value={machine.rpm} min={600} max={6000} step={30} unit="rpm" format={(v) => `${v} (1X ${formatNumber(v / 60, 4)} Hz)`} onChange={(v) => setM({ rpm: v })} />
        <ParamSlider label="1X 크기" value={machine.x1 * 1000} min={0} max={8} step={0.1} unit="mm/s Peak" format={(v) => v.toFixed(1)} onChange={(v) => setM({ x1: v / 1000 })} />
        <ParamSlider label="2X · 3X 크기" value={machine.x2 * 1000} min={0} max={3} step={0.1} unit="mm/s Peak" format={(v) => `${v.toFixed(1)} · ${(v * 5 / 12).toFixed(2)}`} onChange={(v) => setM({ x2: v / 1000, x3: (v / 1000) * 5 / 12 })} />
        <ParamSlider label="0.45X 크기" value={machine.sub * 1000} min={0} max={2} step={0.05} unit="mm/s Peak" format={(v) => v.toFixed(2)} onChange={(v) => setM({ sub: v / 1000 })} hint="1X보다 낮은 성분. 미끄럼 베어링 유막의 불안정에서 생길 수 있다 (Part 6)" />
        <ParamSlider label="기어 맞물림 크기 (15X)" value={machine.gear * 1000} min={0} max={2} step={0.05} unit="mm/s Peak" format={(v) => v.toFixed(2)} onChange={(v) => setM({ gear: v / 1000 })} />
        <ParamSlider label="축 B가 맞물림을 흔드는 정도 m" value={machine.gearM} min={0} max={0.8} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => setM({ gearM: v })} hint={`측대역 간격 = 축 B 회전 주파수 ${formatNumber(f1 / 4, 4)} Hz (P1-7)`} />
        <ParamSlider label="구름베어링형 충격 크기" value={machine.bearing * 1000} min={0} max={5} step={0.1} unit="mm/s" format={(v) => v.toFixed(1)} onChange={(v) => setM({ bearing: v / 1000 })} hint="한 바퀴에 3.26번 '딱', 3 kHz로 울림" />
        <ParamSlider label="잡음 크기 (기본 = 1)" value={noiseScale} min={0} max={5} step={0.1} format={(v) => v.toFixed(1)} onChange={setNoiseScale} />
      </>}
      formulas={<>
        <Formula display tex={'f_s = 2.56\\,F_{max} = ' + texNumber(result.fs, 5) + '\\ \\mathrm{Hz},\\quad \\Delta f = \\frac{F_{max}}{\\mathrm{LOR}} = ' + texNumber(result.df, 4) + '\\ \\mathrm{Hz},\\quad T = \\frac{1}{\\Delta f} = ' + texNumber(result.frameTime, 4) + '\\ \\mathrm{s}'} />
        <Formula display tex={'T_{tot} = T[1 + (M-1)(1-r)] = ' + texNumber(result.totalTime, 4) + '\\ \\mathrm{s}'} />
        {recipe ? (
          <div>
            <p><strong>도우미: {recipe.label}</strong> (3000 rpm 기계 기준 예시값)</p>
            <ol>{recipe.reasons.map((r) => <li key={r}>{r}</li>)}</ol>
          </div>
        ) : (
          <p>판정 기준: 이웃 성분과 {MIN_SEPARATION[settings.window]} bin 이상 떨어져야 "갈라짐"(지금 윈도우, P1-3), 주변 바닥보다 6 dB 이상 높아야 "보임".</p>
        )}
      </>}
      readouts={<>
        <ReadoutTable caption="측정 설정에서 나온 값" rows={[
          { label: '샘플 수 N (프레임 하나)', value: result.n },
          { label: '분해능 Δf', value: result.df, unit: 'Hz' },
          { label: '프레임 하나의 측정 시간 T', value: result.frameTime, unit: 's' },
          { label: '총 측정 시간 (평균·오버랩 포함)', value: result.totalTime, unit: 's' },
        ]} />
        <table className="readout-table">
          <caption>성분별 판정 (지금 설정으로 보이나)</caption>
          <thead><tr><th scope="col">성분</th><th scope="col">주파수</th><th scope="col">읽음값</th><th scope="col">바닥보다</th><th scope="col">이웃까지</th><th scope="col">판정</th></tr></thead>
          <tbody>
            {result.items.map((i) => (
              <tr key={i.key}>
                <th scope="row">{i.label}</th>
                <td>{formatNumber(i.freq, 4)} Hz</td>
                <td>{Number.isFinite(i.value) ? `${formatNumber(i.value * 1000 * (peak ? Math.SQRT2 : 1), 3)} mm/s` : '—'}</td>
                <td>{Number.isFinite(i.marginDb) ? `${formatNumber(i.marginDb, 3)} dB` : '—'}</td>
                <td>{Number.isFinite(i.neighborBins) ? `${formatNumber(i.neighborBins, 3)} bin` : '—'}</td>
                <td style={{ color: STATUS_COLOR[i.status], fontWeight: 600 }}>
                  {STATUS_LABEL[i.status]}{i.status === 'aliased' && i.aliasAt !== undefined ? ` (${formatNumber(i.aliasAt, 4)} Hz에 가짜 막대)` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>}
      tasks={[
        { question: '처음 상태(F_max 2000 Hz, 400 라인, Hann)에서 기어 측대역은 판정이 어떻게 나오나요? 라인 수를 몇으로 올리면 "보임"이 되나요?',
          answer: 'Δf 5 Hz라 측대역 간격 12.5 Hz가 2.5 bin밖에 안 되어 "이웃과 붙음"입니다. 800 라인(Δf 2.5 Hz, 5 bin)부터 Hann으로 갈라집니다. 이때 T = 0.4 s입니다.' },
        { question: '"0.4 ~ 0.5X 성분 확인" 시나리오: 0.45X가 정확히 몇 Hz인지 0.25 Hz 단위로 읽으려면 F_max·라인 수를 어떻게 정할까요? 회전수를 6000 rpm으로 올리면?',
          answer: '3000 rpm이면 0.45X = 22.5 Hz. F_max 200 Hz, 800 라인이면 Δf 0.25 Hz, T 4 s입니다(도우미 설정). 6000 rpm이면 1X 100 Hz, 0.45X 45 Hz로 올라가 F_max 500 Hz가 필요합니다. 0.25 Hz 단위로 읽으려면 2000 라인이 필요하므로 3200 라인(Δf 0.16 Hz, T 6.4 s)을 고릅니다. T가 길어지는 만큼 회전수가 일정해야 합니다.' },
        { question: '"밸런싱 전 1X 측정": 회전수를 2970 rpm으로 바꾸고 윈도우를 Hann ↔ Flat top으로 바꾸면 1X 읽음값이 어떻게 다른가요?',
          answer: '2970 rpm이면 1X = 49.5 Hz로 bin 사이에 와서, Hann은 약 10 % 낮게 읽습니다(가리비 손실, P1-4). Flat top은 0.1 % 안쪽으로 정확합니다(1X 4 mm/s Peak → 약 2.83 mm/s RMS).' },
        { question: '"구름베어링 충격" 시나리오: F_max 2000 Hz에서 울림이 보이나요? F_max 1000 Hz에서 AAF를 끄면 어디에 무엇이 생기나요?',
          answer: 'F_max 2000 Hz에서는 3 kHz 울림이 "F_max 밖"입니다. 5000 Hz로 올리면 보입니다. F_max 1000 Hz(f_s 2560 Hz)에서 AAF를 끄면 3000 Hz가 2560 − 3000 → 440 Hz 근처로 접혀 들어와 가짜 막대가 섭니다.' },
        { question: '잡음 크기를 4로 올리면 어떤 성분부터 "바닥에 묻힘"이 되나요? 평균 횟수를 늘리면 다시 보이나요?',
          answer: '작은 성분(0.45X, 측대역, 울림 대역)부터 묻힙니다. 파워 평균은 바닥의 흔들림만 줄이고 높이는 낮추지 않으므로(P1-5), 바닥보다 작아진 성분은 평균을 늘려도 다시 보이지 않습니다. 라인 수를 늘려 bin 하나의 잡음을 줄이는 편(P1-6)이 효과가 있습니다.' },
      ]}
      footer={<p>기계: 축 A {MACHINE_CONST.teethA}개 이빨 기어(맞물림 = 15X), 축 B {MACHINE_CONST.teethB}개(회전 1X/4), 충격은 한 바퀴에 {MACHINE_CONST.bearingOrder}번. 잡음은 1 Hz당 크기(PSD)가 고정이라 F_max를 바꿔도 바닥 밀도는 같습니다. 판정은 학습용 단순 규칙입니다 (이웃 {MIN_SEPARATION.hann} bin·바닥 +6 dB, Hann 기준).</p>}
    >
      <h4>스펙트럼 ({unit}) — 점: 판정한 성분 (초록 보임 · 주황 붙음 · 회색 묻힘 · 보라 접혀 들어옴)</h4>
      <Plot series={plot} x={{ label: '주파수 [Hz]', range }} y={{ label: unit }} height={320} ariaLabel="샌드박스 스펙트럼과 성분 판정" />
    </LabFrame>
  );
}
