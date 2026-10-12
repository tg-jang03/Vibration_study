import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import {
  accelerance,
  expAddedZeta,
  forceBandwidth10dB,
  halfPower,
  impactTest,
  MODE_BANDS,
  PEDESTAL,
  TIPS,
  type TipId,
} from '../../lib/fieldwork/impact';

/**
 * LAB-HPB-01 임팩트 시험과 Half-power (P9-1, Contents §5-1b).
 * 계산: src/lib/fieldwork/impact.ts (본문 그림 2 ~ 6과 같은 받침대·해머·잡음·시드).
 */

const TIP_OPTS = (Object.keys(TIPS) as TipId[]).map((id) => ({ value: id, label: `${TIPS[id].label} · ${TIPS[id].tc * 1000} ms` }));
const T_OPTS = [0.25, 0.5, 1, 2, 4].map((t) => ({ value: t, label: `${t} s (Δf ${1 / t} Hz)` }));
const TAU_OPTS = [
  { value: 0, label: '끔' },
  { value: 1, label: 'τ = 1 s' },
  { value: 0.3, label: 'τ = 0.3 s' },
  { value: 0.1, label: 'τ = 0.1 s' },
];
const AVG_OPTS = [1, 3, 5, 10].map((m) => ({ value: m, label: `${m}회` }));
const MODE_OPTS = PEDESTAL.map((m, i) => ({ value: i, label: `${i + 1}차 ${m.f} Hz (ζ ${m.zeta})` }));
/** 확대 그림의 주파수 범위 */
const ZOOM: [number, number][] = [
  [36, 60],
  [134, 150],
  [276, 304],
];
const db = (v: number) => 20 * Math.log10(Math.max(v, 1e-9));
const trueMag = (f: number) => Math.hypot(...accelerance(PEDESTAL, f));
const range = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
const F_TRUE = range(0, 400, 2000);

export default function ImpactLab() {
  const [tip, setTip] = useState<TipId>('plastic');
  const [T, setT] = useState(1);
  const [tau, setTau] = useState(0);
  const [fw, setFw] = useState(true);
  const [avg, setAvg] = useState(5);
  const [dbl, setDbl] = useState(false);
  const [mode, setMode] = useState(0);

  const r = useMemo(
    () => impactTest({ tip, T, expTau: tau > 0 ? tau : null, forceWindow: fw, averages: avg, doubleHit: dbl }),
    [tip, T, tau, fw, avg, dbl],
  );
  const md = PEDESTAL[mode];
  const h = halfPower(r.freqs, r.mag, MODE_BANDS[mode][0], MODE_BANDS[mode][1]);
  const added = h && tau > 0 ? expAddedZeta(tau, h.fPeak) : 0;
  const k400 = Math.min(r.freqs.length - 1, Math.round(400 / r.df));
  const fx = Array.from(r.freqs.slice(0, k400 + 1));

  // ① 시간 기록: 각자 최댓값으로 나눈 힘·응답 + 두 윈도우
  const t = Array.from(r.t);
  const fMax = Math.max(...Array.from(r.force, Math.abs)) || 1;
  const aMax = Math.max(...Array.from(r.accel, Math.abs)) || 1;
  const timeSeries: PlotSeries[] = [
    { x: t, y: Array.from(r.accel, (v) => v / aMax), name: '가속도 (응답)', color: 'var(--plot-1)', width: 1 },
    { x: t, y: Array.from(r.force, (v) => v / fMax), name: '힘', color: 'var(--plot-2)', width: 1.4 },
    { x: t, y: Array.from(r.wResp), name: '지수 윈도우', color: 'var(--text-muted)', dash: 'dash', width: 1.4 },
    ...(fw ? [{ x: t, y: Array.from(r.wForce), name: 'Force 윈도우 (힘 채널)', color: 'var(--plot-3)', dash: 'dot' as const, width: 1.6 }] : []),
  ];

  // ② 힘 스펙트럼, ③ FRF, ④ 코히어런스
  const modeLines: PlotSeries[] = PEDESTAL.map((m, i) => ({
    x: [m.f, m.f],
    y: [-60, 60],
    name: '고유진동수',
    color: 'var(--text-muted)',
    dash: 'dot',
    width: 1,
    hideInLegend: i > 0,
  }));
  const forceSeries: PlotSeries[] = [
    { x: fx, y: fx.map((_, k) => r.forceDb[k]), name: '힘 스펙트럼', color: 'var(--plot-2)', width: 1.6 },
    { x: [0, 400], y: [-10, -10], name: '−10 dB', color: 'var(--status-wip)', dash: 'dash', width: 1.2 },
    ...modeLines,
  ];
  const frfSeries: PlotSeries[] = [
    { x: F_TRUE, y: F_TRUE.map((f) => db(trueMag(f) * 1000)), name: '참 FRF', color: 'var(--text-muted)', dash: 'dash', width: 1.4 },
    { x: fx, y: fx.map((_, k) => db(r.mag[k] * 1000)), name: 'H1 (측정)', color: 'var(--plot-1)', width: 1.5 },
  ];
  const cohSeries: PlotSeries[] = [{ x: fx, y: fx.map((_, k) => r.coh[k]), name: 'γ²', color: 'var(--plot-3)', width: 1.6 }];

  // ⑤ 고른 봉우리 확대 (선형, bin 점)
  const [z0, z1] = ZOOM[mode];
  const zk = fx.map((f, k) => [f, k] as const).filter(([f]) => f >= z0 && f <= z1);
  const zt = range(z0, z1, 600);
  const zoomSeries: PlotSeries[] = [
    { x: zt, y: zt.map((f) => trueMag(f) * 1000), name: '참 FRF', color: 'var(--text-muted)', dash: 'dash', width: 1.4 },
    { x: zk.map(([f]) => f), y: zk.map(([, k]) => r.mag[k] * 1000), name: `H1 bin (Δf ${r.df} Hz)`, color: 'var(--plot-1)', mode: 'lines+markers', markerSize: 6, width: 1.4 },
    ...(h
      ? [
          { x: [z0, z1], y: [(h.peak * 1000) / Math.SQRT2, (h.peak * 1000) / Math.SQRT2], name: '봉우리 × 1/√2', color: 'var(--status-wip)', dash: 'dash' as const, width: 1.2 },
          { x: [h.fa, h.fb], y: [(h.peak * 1000) / Math.SQRT2, (h.peak * 1000) / Math.SQRT2], name: 'f_a · f_b', color: 'var(--status-wip)', mode: 'markers' as const, markerSize: 9 },
        ]
      : []),
  ];
  const zMax = Math.max(trueMag(md.f), ...zk.map(([, k]) => r.mag[k])) * 1000 * 1.12;

  const kPeak = h ? Math.round(h.fPeak / r.df) : 0;
  const bw = forceBandwidth10dB(TIPS[tip].tc);

  return (
    <LabFrame
      id="LAB-HPB-01"
      title="임팩트 시험과 Half-power"
      controls={
        <>
          <ParamSelect label="해머 팁 (접촉 시간)" value={tip} options={TIP_OPTS} onChange={(v) => setTip(v as TipId)} />
          <ParamSelect label="프레임 길이 T" value={T} options={T_OPTS} onChange={(v) => setT(Number(v))} />
          <ParamSelect label="지수 윈도우 (두 채널)" value={tau} options={TAU_OPTS} onChange={(v) => setTau(Number(v))} />
          <ParamToggle label="Force 윈도우 (힘 채널)" checked={fw} onChange={setFw} hint="타격 뒤 짧은 구간만 남기고 나머지 잡음을 0으로" />
          <ParamSelect label="평균 횟수" value={avg} options={AVG_OPTS} onChange={(v) => setAvg(Number(v))} />
          <ParamToggle label="더블 히트" checked={dbl} onChange={setDbl} hint="해머가 튀어 한 번 더 맞음 (칠 때마다 간격이 다름)" />
          <ParamSelect label="확대할 봉우리" value={mode} options={MODE_OPTS} onChange={(v) => setMode(Number(v))} />
        </>
      }
      formulas={
        h ? (
          <>
            <Formula
              display
              tex={`\\zeta \\approx \\dfrac{f_b - f_a}{2 f_{peak}} = \\dfrac{${texNumber(h.fb, 4)} - ${texNumber(h.fa, 4)}}{2 \\times ${texNumber(h.fPeak, 4)}} = ${texNumber(h.zeta, 3)},\\quad Q = \\dfrac{1}{2\\zeta} = ${texNumber(h.q, 3)}`}
            />
            {tau > 0 && (
              <Formula
                display
                tex={`\\zeta_{\\text{보정}} = \\zeta - \\dfrac{1}{\\tau\\,\\omega_n} = ${texNumber(h.zeta, 3)} - \\dfrac{1}{${tau} \\times 2\\pi \\times ${texNumber(h.fPeak, 4)}} = ${texNumber(h.zeta - added, 3)}`}
              />
            )}
          </>
        ) : (
          <Formula display tex={`\\text{이 구간에서 봉우리의 } 1/\\sqrt{2} \\text{ 지점을 찾지 못했습니다}`} />
        )
      }
      readouts={
        <ReadoutTable
          theoryLabel="참값"
          rows={[
            { label: '봉우리 주파수', value: h ? h.fPeak : NaN, theory: md.f, unit: 'Hz', sig: 4 },
            { label: 'Half-power ζ', value: h ? h.zeta : NaN, theory: md.zeta, sig: 3 },
            { label: 'ζ 보정 (지수 윈도우 몫 뺌)', value: h && tau > 0 ? h.zeta - added : NaN, theory: md.zeta, sig: 3 },
            { label: '봉우리 높이 [(m/s²)/kN]', value: h ? h.peak * 1000 : NaN, theory: trueMag(md.f) * 1000, sig: 3 },
            { label: '피크 폭 안의 bin 수', value: h ? h.bins : NaN, sig: 2 },
            { label: '봉우리의 코히어런스 γ²', value: h ? r.coh[kPeak] : NaN, sig: 3 },
            { label: '가진 대역 (힘 −10 dB)', value: bw, unit: 'Hz', sig: 3 },
          ]}
        />
      }
      tasks={[
        {
          question: '1차 봉우리(47.5 Hz)를 고르고 T를 1 s → 0.25 s → 4 s로 바꿉니다. ζ와 피크 폭 안의 bin 수는?',
          answer: '1 s: ζ 0.0381(bin 3.7), 0.25 s: 0.0404(bin 1.0, 봉우리 높이도 참값보다 8.6 % 낮음), 4 s: 0.0339(bin 13). bin이 폭 안에 몇 개 없으면 1/√2 지점을 bin 사이 직선으로 짐작하게 되어 틀립니다. 4 s의 남은 3 % 차이는 잡음 몫입니다(잡음이 없으면 ±1 % 안).',
        },
        {
          question: '2차 봉우리(141.6 Hz, ζ 0.003)를 고릅니다. T 1 s에서 지수 윈도우 끔 → τ 0.1 s로 바꾸면 Half-power ζ와 보정 ζ는?',
          answer: '끔: 0.0058(참값의 약 2배). 봉우리 폭 0.85 Hz가 Δf 1 Hz보다 좁고, 프레임 끝에서 울림이 잘립니다. τ 0.1 s: Half-power 0.0147(약 5배)이지만 bin 4.2개로 읽히고, 윈도우 몫 1/(τω_n) = 0.0112를 빼면 0.0034로 돌아옵니다. 윈도우를 쓰면 반드시 τ를 기록하고 뺍니다.',
        },
        {
          question: '해머 팁을 고무로 바꾸고 3차(290 Hz)를 봅니다. 가진 대역, 봉우리의 코히어런스, 봉우리 높이는?',
          answer: '가진 대역 127 Hz — 290 Hz의 힘은 저주파보다 32 dB 작습니다. 코히어런스 0.80, 봉우리 높이 84 (m/s²)/kN(참 156)으로 낮고 ζ도 0.0064로 틀립니다. 힘이 작은 주파수에서는 힘 쪽 잡음이 상대적으로 커져 H1이 낮아집니다(P5-3). 관심 대역을 덮는 팁을 고릅니다.',
        },
        {
          question: '플라스틱 팁·T 1 s로 돌아와 더블 히트를 켭니다. 시간 기록과 1차·2차 봉우리 높이는?',
          answer: '힘에 두 번째 펄스가 보이고, Force 윈도우가 그것을 잘라 냅니다. 응답에는 두 번째 타격이 들어 있으니 FRF가 틀립니다: 1차 58.5(참 47.6), 2차 131(참 278) (m/s²)/kN. 봉우리 코히어런스는 0.95 ~ 0.96으로 떨어집니다. 더블 히트 기록은 버리고 다시 칩니다.',
        },
        {
          question: '더블 히트를 끄고 Force 윈도우를 끈 채 T를 4 s로 늘립니다. 1차 ζ는?',
          answer: '0.0199로 참값(0.035)의 절반 남짓입니다. 4 s 내내 쌓인 힘 센서 잡음이 힘 스펙트럼에 더해져 H1이 흔들리고, 봉우리 모양이 일그러집니다. Force 윈도우는 타격 순간만 남겨 이 잡음을 지웁니다.',
        },
      ]}
    >
      <Plot series={timeSeries} x={{ label: '시간 [s]', range: [0, T] }} y={{ label: '최댓값으로 나눔', range: [-1.1, 1.1] }} height={190} ariaLabel="첫 타격의 힘·가속도 기록과 윈도우" />
      <Plot series={forceSeries} x={{ label: '주파수 [Hz]', range: [0, 400] }} y={{ label: '힘 [dB]', range: [-40, 5] }} height={170} ariaLabel="평균한 힘 스펙트럼" />
      <Plot series={frfSeries} x={{ label: '주파수 [Hz]', range: [0, 400] }} y={{ label: '|H1| [dB re 1 (m/s²)/kN]', range: [-30, 55] }} height={220} ariaLabel="측정 FRF와 참 FRF" />
      <Plot series={cohSeries} x={{ label: '주파수 [Hz]', range: [0, 400] }} y={{ label: 'γ²', range: [0, 1.05] }} height={140} ariaLabel="코히어런스" />
      <Plot series={zoomSeries} x={{ label: '주파수 [Hz]', range: [z0, z1] }} y={{ label: `${mode + 1}차 |H1| [(m/s²)/kN]`, range: [0, zMax] }} height={220} ariaLabel="고른 봉우리 확대와 Half-power 지점" />
    </LabFrame>
  );
}
