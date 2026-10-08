import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import BearingSpin from './BearingSpin';
import { formatNumber } from '../../lib/format';
import { G } from '../../lib/faults/synth';
import {
  analyzeBearing,
  bearingSignal,
  BRG_DEMO,
  DEMO_ACTUAL,
  DEMO_CALC,
  DEMO_FR,
  defectRate,
  FAULT_LABEL,
  RATE_LABEL,
  STAGES,
  type BearingFault,
  type BearingStage,
  type EnvBand,
} from '../../lib/faults/bearing';

/**
 * LAB-BRG-02 결함 위치와 고장 단계 (P7-5, Contents §5).
 * 결함 위치(외륜·내륜·볼·케이지)와 단계(건전 ~ 4)를 골라 가속도(dB)·파형·속도·엔벨로프 스펙트럼과 숫자를 본다.
 * 신호·계산: lib/faults/bearing.ts (본문 그림 4 ~ 7과 같은 신호).
 */

const FAULT_OPTIONS = (Object.keys(FAULT_LABEL) as BearingFault[]).map((f) => ({ value: f, label: `${FAULT_LABEL[f]} (${RATE_LABEL[f]})` }));
const STAGE_HINT: Record<BearingStage, string> = {
  0: '결함 없음',
  1: '아주 작은 흠: 초음파 대역만',
  2: '부품 공진이 울린다',
  3: '결함 줄과 측대역',
  4: '손상이 넓어짐: 바닥·1X 상승',
};
const STAGE_OPTIONS = ([0, 1, 2, 3, 4] as BearingStage[]).map((s) => ({ value: s, label: `${STAGES[s].name} — ${STAGE_HINT[s]}` }));
const BAND_OPTIONS: { value: EnvBand; label: string }[] = [
  { value: 'res', label: '공진 대역 2.8 ~ 3.8 kHz' },
  { value: 'ultra', label: '초음파 대역 20 ~ 28 kHz' },
];
const T_SHOW = 0.05;

export interface BearingStageState {
  fault: BearingFault;
  stage: BearingStage;
  band: EnvBand;
}

/** 결함 위치마다 엔벨로프에 표시할 자리 (실제 신호의 값, 미끄럼 포함) */
function marks(fault: BearingFault): { x: number; name: string }[] {
  const b = DEMO_ACTUAL;
  const fr = DEMO_FR;
  switch (fault) {
    case 'outer':
      return [1, 2].map((k) => ({ x: k * b.bpfo, name: k === 1 ? 'BPFO' : '2×BPFO' }));
    case 'inner':
      return [{ x: fr, name: '1X' }, { x: b.bpfi - fr, name: 'BPFI − 1X' }, { x: b.bpfi, name: 'BPFI' }, { x: b.bpfi + fr, name: 'BPFI + 1X' }];
    case 'ball':
      return [{ x: b.ftf, name: 'FTF' }, { x: b.bsf, name: 'BSF' }, { x: b.bsf2 - b.ftf, name: '2×BSF − FTF' }, { x: b.bsf2, name: '2×BSF' }, { x: b.bsf2 + b.ftf, name: '2×BSF + FTF' }];
    case 'cage':
      return [1, 2, 3].map((k) => ({ x: k * b.ftf, name: k === 1 ? 'FTF' : `${k}×FTF` }));
  }
}

export default function BearingStageLab({ initial = {} }: { initial?: Partial<BearingStageState> }) {
  const [p, setP] = useState<BearingStageState>({ fault: 'outer', stage: 2, band: 'res', ...initial });
  const set = <K extends keyof BearingStageState>(k: K) => (v: BearingStageState[K]) => setP((q) => ({ ...q, [k]: v }));
  const a = useMemo(() => analyzeBearing(bearingSignal(p.fault, p.stage)), [p.fault, p.stage]);
  const healthy = useMemo(() => analyzeBearing(bearingSignal(p.fault, 0)), [p.fault]);
  const r = a.readouts;
  const rate = defectRate(p.fault, DEMO_ACTUAL);
  const calc = defectRate(p.fault, DEMO_CALC);
  const env = a.env[p.band];
  const [b1, b2] = BRG_DEMO.bands[p.band];

  // 엔벨로프에서 결함 자리 둘레(계산값 ± 3 %)의 가장 큰 줄
  let kTop = -1;
  for (let k = 0; k < env.freq.length; k++) if (Math.abs(env.freq[k] - calc) <= 0.03 * calc && (kTop < 0 || env.amp[k] > env.amp[kTop])) kTop = k;
  const envTopHz = kTop >= 0 ? env.freq[kTop] : 0;

  const nShow = Math.round(T_SHOW * BRG_DEMO.fs);
  const step = 4;
  const tw: number[] = [];
  const yw: number[] = [];
  for (let i = 0; i < nShow; i += step) {
    tw.push((i / BRG_DEMO.fs) * 1000);
    yw.push(a.normal[i] / G);
  }
  const envX: number[] = [];
  const envY: number[] = [];
  env.freq.forEach((f, k) => {
    if (f <= 500) {
      envX.push(f);
      envY.push(env.amp[k] / G);
    }
  });
  const envMax = Math.max(0.005, ...envY.filter((_, i) => envX[i] > 5)) * 1.15;
  const vMax = Math.max(1.5, ...Array.from(a.vel.amp)) * 1.15;
  const vline = (x: number, top: number, name: string, color: string, hide: boolean): PlotSeries => ({ x: [x, x], y: [0, top], name, color, dash: 'dot', width: 1.2, hideInLegend: hide });
  const kHz = (v: number) => v / 1000;

  return (
    <LabFrame id="LAB-BRG-02" title="결함 위치와 고장 단계: 어디에 먼저 보이나"
      controls={<>
        <ParamSelect label="결함 위치" value={p.fault} options={FAULT_OPTIONS} onChange={set('fault')} />
        <ParamSelect label="단계" value={p.stage} options={STAGE_OPTIONS} onChange={set('stage')} />
        <ParamSelect label="엔벨로프 대역" value={p.band} options={BAND_OPTIONS} onChange={set('band')} />
      </>}
      readouts={<ReadoutTable caption={`읽음값 (${FAULT_LABEL[p.fault]} · ${STAGES[p.stage].name})`} rows={[
        { label: '속도 overall (10 ~ 1000 Hz)', value: r.velOverall, unit: 'mm/s', sig: 3 },
        { label: `1X (${formatNumber(DEMO_FR, 4)} Hz)`, value: r.vel1X, unit: 'mm/s rms', sig: 3 },
        { label: `속도 스펙트럼의 ${RATE_LABEL[p.fault]} 줄`, value: r.velDefect, unit: 'mm/s rms', sig: 2 },
        { label: '가속도 RMS (0 ~ 10 kHz)', value: r.accRmsG, unit: 'g', sig: 3 },
        { label: '가속도 첨도 K (0 ~ 10 kHz)', value: r.kurtosis, sig: 3 },
        { label: `엔벨로프 ${RATE_LABEL[p.fault]} 줄 ÷ 바닥 — 공진 대역`, value: r.envRatio.res, unit: '배', sig: 3 },
        { label: `엔벨로프 ${RATE_LABEL[p.fault]} 줄 ÷ 바닥 — 초음파 대역`, value: r.envRatio.ultra, unit: '배', sig: 3 },
        { label: '초음파 대역 RMS (20 ~ 28 kHz)', value: r.ultraRmsG, unit: 'g', sig: 2 },
        { label: `엔벨로프 결함 줄의 주파수 (이론 = 미끄럼 없는 계산값)`, value: envTopHz, theory: calc, unit: 'Hz', sig: 4 },
      ]} />}
      tasks={[
        { question: '외륜 결함에서 단계를 건전 → 1 → 2로 올리며 두 대역의 "줄 ÷ 바닥"을 보세요. 1단계의 결함은 어느 대역에서만 보이나요?',
          answer: '1단계는 초음파 대역에서 약 78배로 또렷하지만 공진 대역은 약 2.3배로 바닥과 구별이 안 됩니다. 작은 충격은 3.3 kHz 공진을 거의 울리지 못하고(이 모델에서 0.004 g, 24 kHz는 0.25 g) 그마저 기계의 다른 소리에 묻히는데, 초음파 대역은 다른 소리가 적기 때문입니다. 2단계에서 공진 대역도 약 117배로 섭니다. 속도 overall·1X·가속도 RMS는 1단계까지 건전할 때와 거의 같습니다.' },
        { question: '단계를 2 → 3 → 4로 올리며 속도 스펙트럼의 BPFO 줄, 1X, 첨도를 보세요.',
          answer: 'BPFO 줄은 0.036 → 0.72 → 0.23 mm/s로 3단계에만 큽니다. 1X는 1.0 → 1.3 → 2.9 mm/s로 4단계에 커지고, 첨도는 4.2 → 5.6 → 3.2로 4단계에 다시 내려옵니다. 4단계에서는 엔벨로프의 BPFO 줄도 바닥의 5배 아래로 흐려집니다 — 결함 주파수가 안 보인다고 멀쩡한 것이 아닙니다.' },
        { question: '단계 3에서 결함 위치를 내륜 → 볼 → 케이지로 바꾸며 엔벨로프 스펙트럼의 모양을 비교하세요.',
          answer: '내륜은 BPFI(324.8 Hz) 양옆에 1X(59.6 Hz) 간격의 측대역과 1X 자체가 섭니다. 볼은 2×BSF(278.0 Hz)가 가장 크고 양옆에 FTF(23.5 Hz) 간격의 측대역, 낮은 쪽에 FTF·BSF가 섭니다. 케이지는 FTF와 그 하모닉만 서고, 기본 줄 FTF가 1X보다 낮습니다(하모닉은 1X 위로도 이어집니다).' },
        { question: '엔벨로프 결함 줄의 주파수를 "이론"(미끄럼 없는 계산값)과 비교하세요. 왜 다른가요?',
          answer: '실제 신호에는 미끄럼 1 %를 넣었습니다. 외륜은 211 Hz로 계산값 213.6 Hz보다 약 1 % 낮고, 내륜은 325 Hz로 계산값 322.7 Hz보다 약 0.7 % 높습니다. 측정한 줄이 계산값과 1 ~ 2 % 어긋나는 것은 흔하므로, 정확히 맞는 줄보다 그 근처의 하모닉 무리와 측대역 간격으로 확인합니다.' },
      ]}
      footer={<p>설명용 모델입니다: P7-1의 펌프 축(3575 rpm, 6205, 미끄럼 1 %), f_s {BRG_DEMO.fs} Hz, 1초. 충격마다 부품 공진 {BRG_DEMO.res.f} Hz와 초음파 대역 공진 {BRG_DEMO.ultra.f} Hz를 울리고, 기계의 다른 소리 0.5 ~ 12 kHz {BRG_DEMO.machineNoiseG} g가 있습니다. 단계는 흔히 쓰는 4단계 설명을 따른 것으로, 실제 베어링은 단계를 건너뛰거나 머무는 시간이 제각각입니다. 크기는 판정 기준이 아닙니다.</p>}
    >
      <h4>베어링이 도는 모습: 결함에 닿을 때마다 충격</h4>
      <BearingSpin fault={p.fault} healthy={p.stage === 0} />
      <h4>가속도 스펙트럼 (dB re 1 g) · 고른 엔벨로프 대역</h4>
      <Plot series={[
        { x: healthy.accDb.x.map(kHz), y: healthy.accDb.y, name: '건전', color: 'var(--text-muted)', width: 1 },
        { x: a.accDb.x.map(kHz), y: a.accDb.y, name: STAGES[p.stage].name, color: 'var(--plot-1)', width: 1.2 },
        { x: [kHz(b1), kHz(b1)], y: [-100, 10], name: '엔벨로프 대역', color: 'var(--plot-2)', dash: 'dash', width: 2 },
        { x: [kHz(b2), kHz(b2)], y: [-100, 10], name: '', color: 'var(--plot-2)', dash: 'dash', width: 2, hideInLegend: true },
        { x: [kHz(BRG_DEMO.normalHz), kHz(BRG_DEMO.normalHz)], y: [-100, 10], name: '일반 측정 대역 끝 (10 kHz)', color: 'var(--text-muted)', dash: 'dot', width: 1.5 },
      ]} x={{ label: '주파수 [kHz]', range: [0, BRG_DEMO.fs / 2000] }} y={{ label: '[dB]', range: [-100, 10] }} height={210} ariaLabel="가속도 스펙트럼" />
      <h4>가속도 파형 (0 ~ 10 kHz, 50 ms)</h4>
      <Plot series={[{ x: tw, y: yw, name: '가속도', color: 'var(--plot-1)', width: 1 }]} x={{ label: '시각 [ms]', range: [0, T_SHOW * 1000] }} y={{ label: '[g]' }} height={170} ariaLabel="가속도 파형" />
      <h4>속도 스펙트럼 0 ~ 1000 Hz</h4>
      <Plot series={[
        { x: Array.from(a.vel.freq), y: Array.from(a.vel.amp), name: '속도', color: 'var(--plot-1)', width: 1.2 },
        vline(DEMO_FR, vMax, '1X', 'var(--text-muted)', false),
        ...[1, 2, 3].map((k) => vline(k * rate, vMax, `${RATE_LABEL[p.fault]}의 정수배`, 'var(--status-wip)', k > 1)),
      ]} x={{ label: '주파수 [Hz]', range: [0, 1000] }} y={{ label: '[mm/s rms]', range: [0, vMax] }} height={200} ariaLabel="속도 스펙트럼" />
      <h4>엔벨로프 스펙트럼 ({BAND_OPTIONS.find((o) => o.value === p.band)!.label})</h4>
      <Plot series={[
        { x: envX, y: envY, name: '엔벨로프', color: 'var(--plot-2)', width: 1.3 },
        ...marks(p.fault).map((m, i) => vline(m.x, envMax, m.name, i % 2 === 0 ? 'var(--text-muted)' : 'var(--status-wip)', false)),
      ]} x={{ label: '주파수 [Hz]', range: [0, 500] }} y={{ label: '[g]', range: [0, envMax] }} height={220} ariaLabel="엔벨로프 스펙트럼" />
    </LabFrame>
  );
}
