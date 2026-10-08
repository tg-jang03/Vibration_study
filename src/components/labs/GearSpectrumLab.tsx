import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Formula from '../ui/Formula';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import GearMesh from './GearMesh';
import { formatNumber, texNumber } from '../../lib/format';
import { G } from '../../lib/faults/synth';
import {
  analyzeGear,
  GEAR_DEMO,
  GEAR_FAULT_LABEL,
  GEAR_FAULTS,
  GEAR_PAIR,
  envelopeHold,
  gearSignal,
  RES_BAND,
  SB_COUNT,
  SIDE_LABEL,
  SIDED,
  ZOOM_HALF,
  type GearFault,
  type GearSide,
} from '../../lib/faults/gear';

/**
 * LAB-GEAR-01 기어 결함의 스펙트럼 지문 (P7-6, Contents §5).
 * 결함·결함 기어·정도·부하를 골라 가속도 스펙트럼, 맞물림 둘레 확대, 파형(0.25 s·8 s)과 숫자를 본다.
 * 신호·계산: lib/faults/gear.ts (본문 그림 2 ~ 6과 같은 신호).
 */

const FAULT_OPTIONS = GEAR_FAULTS.map((f) => ({ value: f, label: GEAR_FAULT_LABEL[f] }));
const SIDE_OPTIONS = (['pinion', 'gear'] as GearSide[]).map((s) => ({ value: s, label: SIDE_LABEL[s] }));
const P = GEAR_PAIR;
const T_SHOW = 0.25;

export interface GearSpectrumState {
  fault: GearFault;
  side: GearSide;
  /** 정도 [%] */
  severity: number;
  /** 부하 [%] */
  load: number;
}

const tick = (x: number, y0: number, y1: number, name: string, color: string, hide: boolean): PlotSeries => ({ x: [x, x], y: [y0, y1], name, color, width: 1.5, hideInLegend: hide });

export default function GearSpectrumLab({ initial = {} }: { initial?: Partial<GearSpectrumState> }) {
  const [p, setP] = useState<GearSpectrumState>({ fault: 'healthy', side: 'gear', severity: 60, load: 80, ...initial });
  const set = <K extends keyof GearSpectrumState>(k: K) => (v: GearSpectrumState[K]) => setP((q) => ({ ...q, [k]: v }));
  const o = useMemo(() => ({ fault: p.fault, side: p.side, severity: p.severity / 100, load: p.load / 100 }), [p]);
  const a = useMemo(() => analyzeGear(o), [o]);
  const sig = useMemo(() => gearSignal(o), [o]);
  const long = useMemo(() => envelopeHold(sig.acc, sig.fs, 64), [sig]);
  const r = a.readouts;
  const sided = SIDED[p.fault];

  const nShow = Math.round(T_SHOW * sig.fs);
  const tw: number[] = [];
  const yw: number[] = [];
  for (let i = 0; i < nShow; i++) {
    tw.push((i / sig.fs) * 1000);
    yw.push(sig.acc[i] / G);
  }
  const wMax = Math.max(1.5, ...yw.map(Math.abs)) * 1.1;
  const lMax = Math.max(1.5, ...long.y) * 1.1;
  const kHz = (v: number) => v / 1000;

  const ticksP = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((k, i) => tick(P.gmf + k * P.f1, -6, 0, `피니언 간격 f₁ = ${formatNumber(P.f1, 4)} Hz`, 'var(--plot-2)', i > 0));
  const ticksG = Array.from({ length: 26 }, (_, i) => (i < 13 ? i - 13 : i - 12)).map((k, i) => tick(P.gmf + k * P.f2, -14, -8, `기어 간격 f₂ = ${formatNumber(P.f2, 4)} Hz`, 'var(--plot-3)', i > 0));

  return (
    <LabFrame id="LAB-GEAR-01" title="기어 결함의 스펙트럼 지문"
      controls={<>
        <ParamSelect label="결함" value={p.fault} options={FAULT_OPTIONS} onChange={set('fault')} />
        <ParamSelect label="결함이 있는 기어" value={p.side} options={SIDE_OPTIONS} onChange={set('side')} disabled={!sided}
          hint={sided ? undefined : p.fault === 'hunting' ? `피니언 ${GEAR_DEMO.pinionTooth + 1}번·기어 ${GEAR_DEMO.gearTooth + 1}번 이빨이 함께 상했다` : '두 기어 사이의 일이라 고르지 않는다'} />
        <ParamSlider label="정도" value={p.severity} min={0} max={100} step={5} unit="%" onChange={set('severity')} disabled={p.fault === 'healthy'} />
        <ParamSlider label="부하" value={p.load} min={20} max={100} step={5} unit="%" onChange={set('load')} hint="맞물림 힘은 부하와 함께 커진다" />
      </>}
      formulas={<>
        <Formula display tex={`\\text{GMF} = z_1 f_1 = ${GEAR_DEMO.z1} \\times ${texNumber(P.f1, 4)} = ${texNumber(P.gmf, 4)}\\ \\text{Hz} = z_2 f_2 = ${GEAR_DEMO.z2} \\times ${texNumber(P.f2, 4)}\\ \\text{Hz}`} />
        <Formula display tex={`f_{HT} = \\frac{\\text{GMF}}{\\text{LCM}(z_1, z_2)} = \\frac{${texNumber(P.gmf, 4)}}{${P.lcm}} = ${texNumber(P.fHT, 4)}\\ \\text{Hz} \\;(${texNumber(P.htPeriod, 4)}\\ \\text{s})`} />
      </>}
      readouts={<ReadoutTable caption={`읽음값 (${GEAR_FAULT_LABEL[p.fault]}${sided ? ` · ${p.side === 'pinion' ? '피니언' : '기어'}` : ''} · 부하 ${p.load} %)`} rows={[
        { label: `GMF 줄 (${formatNumber(P.gmf, 4)} Hz)`, value: r.gmf, unit: 'g', sig: 3 },
        { label: '2×GMF ÷ GMF', value: r.gmf2 / r.gmf, sig: 2 },
        { label: '3×GMF ÷ GMF', value: r.gmf3 / r.gmf, sig: 2 },
        { label: `측대역 ±1 ~ ±6 합 ÷ GMF — 피니언 간격 ${formatNumber(P.f1, 4)} Hz`, value: r.sbPinion, sig: 2 },
        { label: `측대역 ±1 ~ ±6 합 ÷ GMF — 기어 간격 ${formatNumber(P.f2, 4)} Hz`, value: r.sbGear, sig: 2 },
        { label: `GMF의 ${SB_COUNT.ratio * 100} %를 넘는 측대역 수 (±${SB_COUNT.kMax}까지) — 피니언 간격`, value: r.nPinion, unit: '개', sig: 2 },
        { label: `GMF의 ${SB_COUNT.ratio * 100} %를 넘는 측대역 수 (±${SB_COUNT.kMax}까지) — 기어 간격`, value: r.nGear, unit: '개', sig: 2 },
        { label: `맞물림 공진 대역 RMS (${RES_BAND[0] / 1000} ~ ${RES_BAND[1] / 1000} kHz)`, value: r.resRms, unit: 'g', sig: 2 },
        { label: '가속도 RMS', value: r.rmsG, unit: 'g', sig: 3 },
        { label: '크레스트 팩터 (8 s)', value: r.crest, sig: 3 },
        { label: '첨도 K', value: r.kurtosis, sig: 3 },
      ]} />}
      tasks={[
        { question: '건전 → 편심(피니언) → 편심(기어)으로 바꾸며 맞물림 둘레 확대 그래프와 측대역 숫자를 보세요. 측대역의 간격과 개수는?',
          answer: `건전하면 GMF 옆이 거의 비어 있습니다(1 %를 넘는 측대역 0개). 피니언 편심은 ${formatNumber(P.f1, 4)} Hz 간격, 기어 편심은 ${formatNumber(P.f2, 4)} Hz 간격으로 첫 쌍이 GMF의 약 19 %씩 서고, 1 %를 넘는 것은 ±1·±2 네 개뿐입니다. 간격이 그 기어의 회전 주파수이므로 어느 축이 편심인지 압니다.` },
        { question: '깨진 이를 고르고 결함 기어를 피니언 ↔ 기어로 바꾸세요. 측대역 수와 0.25 s 파형은 어떻게 다른가요?',
          answer: `기어 이빨이 깨지면 기어 간격 측대역이 30개(±15까지 모두), 피니언 이빨이면 피니언 간격 측대역이 30개 섭니다 — 편심의 한두 쌍과 달리 낮지만 넓게 많이 섭니다. 파형에서는 충격이 기어 한 바퀴(${formatNumber(1000 / P.f2, 4)} ms) 또는 피니언 한 바퀴(${formatNumber(1000 / P.f1, 4)} ms)마다 한 번 옵니다.` },
        { question: '마모(기어)를 고르고 정도를 0 → 60 → 100 %로 올리세요. 어느 숫자가 가장 많이 변하나요?',
          answer: '2×GMF ÷ GMF가 0.35 → 0.79, 3×GMF ÷ GMF가 0.15 → 0.46(60 %)으로 GMF 자신(0.86 → 0.96 g)보다 훨씬 많이 커지고, 맞물림 공진 대역 RMS가 0.018 → 0.067 g로 오릅니다. 이 모양(하모닉이 커지는 것)이 고르게 닳은 이의 특징입니다. 측대역은 별로 늘지 않습니다.' },
        { question: '백래시 과다를 고르고 부하를 80 → 30 → 100 %로 바꾸세요. 건전일 때와 비교하면?',
          answer: '맞물림 공진 대역 RMS가 0.044 → 0.14 → 0.020 g로 부하가 가벼울수록 커지고, 100 %에서는 건전과 같아집니다. 건전한 기어는 부하와 상관없이 약 0.015 ~ 0.020 g입니다. GMF 줄은 둘 다 부하와 함께 커집니다. 부하를 바꿔 보면 백래시를 가를 수 있습니다.' },
        { question: '헌팅 투스를 고르고 8 s 파형을 보세요. 큰 충격 사이의 간격은?',
          answer: `약 ${formatNumber(P.htPeriod, 4)} s(1.42 → 3.88 → 6.33 s)마다 한 번입니다. 피니언 ${P.pinionRevs}바퀴, 기어 ${P.gearRevs}바퀴 = 맞물림 ${P.lcm}번마다 상한 두 이빨이 다시 만납니다. 그 사이에는 각 이빨의 작은 충격이 한 바퀴에 한 번씩 옵니다. 헌팅 투스 주파수 ${formatNumber(P.fHT, 4)} Hz는 스펙트럼보다 긴 파형에서 찾기 쉽습니다.` },
      ]}
      footer={<p>설명용 모델입니다: P7-1의 감속기(피니언 {GEAR_DEMO.z1}이빨 {GEAR_DEMO.rpm} rpm ↔ 기어 {GEAR_DEMO.z2}이빨), f_s {GEAR_DEMO.fs} Hz, 8 s, Hann. 맞물림 1·2·3배와 맞물림마다의 짧은 충격(맞물림 공진 {GEAR_DEMO.res.f} Hz를 울림), 두 축의 1X, 흰 잡음 {GEAR_DEMO.noise} g. 크기는 판정 기준이 아닙니다.</p>}
    >
      <h4>기어가 도는 모습: 상한 이빨이 맞물릴 때 충격</h4>
      <GearMesh fault={p.fault} side={p.side} />
      <h4>가속도 스펙트럼 0 ~ 3.5 kHz (dB re 1 g)</h4>
      <Plot series={[
        { x: a.accDb.x.map(kHz), y: a.accDb.y, name: '가속도', color: 'var(--plot-1)', width: 1 },
        ...[1, 2, 3].map((h) => tick(kHz(h * P.gmf), -90, 10, 'GMF의 정수배', 'var(--text-muted)', h > 1)),
        { x: [kHz(RES_BAND[0]), kHz(RES_BAND[0])], y: [-90, 10], name: '맞물림 공진 대역', color: 'var(--status-wip)', dash: 'dash', width: 1.5 },
        { x: [kHz(RES_BAND[1]), kHz(RES_BAND[1])], y: [-90, 10], name: '', color: 'var(--status-wip)', dash: 'dash', width: 1.5, hideInLegend: true },
      ]} x={{ label: '주파수 [kHz]', range: [0, 3.5] }} y={{ label: '[dB]', range: [-90, 10] }} height={220} ariaLabel="가속도 스펙트럼" />
      <h4>맞물림 둘레 확대 (GMF ± {ZOOM_HALF} Hz) — 위쪽 눈금: 측대역이 설 자리</h4>
      <Plot series={[
        { x: a.zoomDb.x, y: a.zoomDb.y, name: '가속도', color: 'var(--plot-1)', width: 1.1 },
        ...ticksP,
        ...ticksG,
      ]} x={{ label: '주파수 [Hz]', range: [P.gmf - ZOOM_HALF, P.gmf + ZOOM_HALF] }} y={{ label: '[dB]', range: [-80, 2] }} height={230} ariaLabel="맞물림 둘레 확대 스펙트럼" />
      <h4>가속도 파형 (처음 {T_SHOW * 1000} ms)</h4>
      <Plot series={[{ x: tw, y: yw, name: '가속도', color: 'var(--plot-1)', width: 1 }]} x={{ label: '시각 [ms]', range: [0, T_SHOW * 1000] }} y={{ label: '[g]', range: [-wMax, wMax] }} height={180} ariaLabel="가속도 파형" />
      <h4>8 s 기록 (포락선의 짧은 구간마다 최댓값)</h4>
      <Plot series={[{ x: long.t, y: long.y, name: '포락선 최댓값', color: 'var(--plot-2)', width: 1 }]} x={{ label: '시각 [s]', range: [0, GEAR_DEMO.n / GEAR_DEMO.fs] }} y={{ label: '[g]', range: [0, lMax] }} height={160} ariaLabel="8초 기록의 포락선 최댓값" />
    </LabFrame>
  );
}
