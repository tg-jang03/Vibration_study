import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import PhasorView, { type PhasorArrow } from '../ui/PhasorView';
import { rateLabel } from '../ui/PlayControls';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { beatEnvelope, besselJ, modulationLines } from '../../lib/dsp/modulation';
import { phasorChain } from '../../lib/dsp/phasor';
import { evaluateRange, type SignalComponent } from '../../lib/dsp/signal';
import { BEAT_EXAMPLE, GEAR_EXAMPLE, MOD_AMP, modSpectrum, peakNear, relDb } from '../../lib/modulationDemo';

/**
 * LAB-MOD-01 변조 · 측대역 · 맥놀이 (P2-8, Contents §5-1).
 * 반송파의 크기(AM)·주파수(FM)를 변조 주파수로 흔들거나, 가까운 두 주파수를 더해(맥놀이) 파형·포락선과 스펙트럼을 함께 본다.
 * 본문 그림과 같은 신호 정의(src/lib/modulationDemo.ts, signal.ts의 'modulated').
 * 움직이는 그림 (D-044): 스펙트럼의 선 하나 = 도는 화살표 하나. 반송파와 같이 도는 틀에서 보면 반송파는 멈추고
 * 측대역 화살표가 그 끝에서 ±f_m으로 돈다 — 합의 길이 = 포락선. 맥놀이는 f₂ 화살표가 f₁ 끝에서 (f₂ − f₁)로 돈다.
 */

type Mode = 'am' | 'fm' | 'amfm' | 'beat';
const MODES: { value: Mode; label: string }[] = [
  { value: 'am', label: '크기가 흔들림 (AM)' },
  { value: 'fm', label: '주파수가 흔들림 (FM)' },
  { value: 'amfm', label: '크기와 주파수가 함께 (AM + FM)' },
  { value: 'beat', label: '가까운 두 주파수 (맥놀이)' },
];
type Preset = 'none' | 'gearA' | 'gearB' | 'speed' | 'beat';
const PRESETS: { value: Preset; label: string }[] = [
  { value: 'none', label: '직접 설정' },
  { value: 'gearA', label: '기어 맞물림 300 Hz를 축 A(20 Hz)가 흔듦' },
  { value: 'gearB', label: '기어 맞물림 300 Hz를 축 B(12.5 Hz)가 흔듦' },
  { value: 'speed', label: '회전수가 1초에 2번 출렁이는 60 Hz 성분 (FM)' },
  { value: 'beat', label: '이웃한 두 기계 1800 rpm·1770 rpm (맥놀이)' },
];
const T_OPTIONS = [1, 2, 4, 8];
const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);

export interface ModulationLabProps {
  initialMode?: Mode;
}

export default function ModulationLab({ initialMode = 'am' }: ModulationLabProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fc, setFc] = useState(100);
  const [fm, setFm] = useState(5);
  const [m, setM] = useState(initialMode === 'amfm' ? 0.4 : 0.5);
  const [beta, setBeta] = useState(initialMode === 'fm' ? 1 : 0.6);
  const [psiDeg, setPsi] = useState(0);
  const [f1, setF1] = useState(BEAT_EXAMPLE.f1);
  const [gap, setGap] = useState(BEAT_EXAMPLE.f1 - BEAT_EXAMPLE.f2);
  const [ratio, setRatio] = useState(BEAT_EXAMPLE.a2);
  const [seconds, setSeconds] = useState(8);
  const [db, setDb] = useState(false);
  const [preset, setPreset] = useState<Preset>('none');
  const [rotating, setRotating] = useState(true);

  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p === 'gearA' || p === 'gearB') {
      setMode('am'); setFc(GEAR_EXAMPLE.mesh); setFm(p === 'gearA' ? GEAR_EXAMPLE.shaftA : GEAR_EXAMPLE.shaftB); setM(GEAR_EXAMPLE.m);
    } else if (p === 'speed') {
      setMode('fm'); setFc(60); setFm(2); setBeta(1.5);
    } else if (p === 'beat') {
      setMode('beat'); setF1(BEAT_EXAMPLE.f1); setGap(BEAT_EXAMPLE.f1 - BEAT_EXAMPLE.f2); setRatio(BEAT_EXAMPLE.a2);
    }
  };
  const beat = mode === 'beat';
  const useAm = mode === 'am' || mode === 'amfm';
  const useFm = mode === 'fm' || mode === 'amfm';
  const mEff = useAm ? m : 0;
  const betaEff = useFm ? beta : 0;
  const psi = mode === 'amfm' ? (psiDeg * Math.PI) / 180 : 0;
  const f2 = f1 - gap;

  const components = useMemo((): SignalComponent[] => beat
    ? [{ type: 'sine', freq: f1, amp: MOD_AMP }, { type: 'sine', freq: f2, amp: ratio * MOD_AMP }]
    : [{ type: 'modulated', carrier: fc, amp: MOD_AMP, modFreq: fm, am: mEff, fm: betaEff, amPhase: psi }],
  [beat, f1, f2, ratio, fc, fm, mEff, betaEff, psi]);

  const data = useMemo(() => {
    const spec = modSpectrum(components, seconds);
    // 파형: 포락선이 두세 번 오르내리는 길이
    const tShow = beat ? Math.min(8, 3 / Math.max(gap, 0.125)) : Math.min(2, 2.5 / fm);
    const r = evaluateRange({ components }, 0, tShow, 4000);
    const t = Array.from(r.t);
    const x = Array.from(r.x, (v) => v * 1000);
    const env = beat
      ? t.map((tt) => beatEnvelope(1, ratio, f1, f2, tt))
      : t.map((tt) => 1 + mEff * Math.cos(2 * Math.PI * fm * tt + psi));
    // 스펙트럼 보기 범위
    const span = beat ? Math.max(3, 4 * gap) : Math.max(4, (useFm ? Math.ceil(betaEff) + 3 : 2) * fm);
    const center = beat ? (f1 + f2) / 2 : fc;
    const lo = Math.max(0, center - span);
    const hi = Math.min(511, center + span);
    const a = Math.round(lo / spec.df);
    const b = Math.round(hi / spec.df);
    const fx = Array.from(spec.frequency.slice(a, b + 1));
    const ay = Array.from(spec.amplitude.slice(a, b + 1));
    return { spec, t, x, env, tShow, fx, ay, lo, hi };
  }, [components, seconds, beat, gap, fm, ratio, f1, f2, mEff, psi, fc, useFm, betaEff]);

  const lines = useMemo(() => (beat ? [] : modulationLines(mEff, betaEff, psi, 8)), [beat, mEff, betaEff, psi]);

  // 도는 화살표: 반송파(파랑) → +1, −1, +2, −2 … 측대역(위 = 주황, 아래 = 초록). 맥놀이는 f₁·f₂ 두 개
  const arrows = useMemo<PhasorArrow[]>(() => {
    if (beat) {
      return [
        { amp: 1, freq: f1, phase: 0, color: 'var(--plot-1)', label: 'f₁' },
        { amp: ratio, freq: f2, phase: 0, color: 'var(--plot-2)', label: 'f₂' },
      ];
    }
    return modulationLines(mEff, betaEff, psi, 12)
      .filter((l) => l.ratio > 0.005)
      .sort((a, b) => Math.abs(a.n) - Math.abs(b.n) || b.n - a.n)
      .map((l) => ({
        amp: l.ratio,
        freq: fc + l.n * fm,
        phase: Math.atan2(l.im, l.re),
        color: l.n === 0 ? 'var(--plot-1)' : l.n > 0 ? 'var(--plot-2)' : 'var(--plot-3)',
        label: l.n === 0 ? '반송파' : l.n > 0 ? `+${l.n}` : `−${-l.n}`,
      }));
  }, [beat, f1, f2, ratio, mEff, betaEff, psi, fc, fm]);
  const fMod = beat ? gap : fm; // 포락선·측대역이 도는 빠르기
  const fFast = beat ? f1 : fc;
  const anim = useMemo(() => {
    const span = rotating ? 2 / fMod : Math.min(1 / fMod, 60 / fFast);
    const base = rotating ? 1 / fMod : 1 / fFast; // 같이 도는 틀: 측대역 1바퀴 / 제자리: 반송파 1바퀴 = 실제 1초
    const speeds = (rotating ? [0.25, 0.5, 1] : [0.5, 1, 2]).map((k) => ({ rate: k * base, label: '' }));
    speeds.forEach((s, i) => (s.label = `${['느리게', '보통', '빠르게'][i]} (${rateLabel(s.rate)})`));
    return { span, speeds };
  }, [rotating, fMod, fFast]);
  const { rMax, layout } = useMemo(() => {
    if (!rotating) return { rMax: Math.max(2.2, 0.75 * arrows.reduce((s, a) => s + a.amp, 0)), layout: 'center' as const };
    // 같이 도는 틀: 한 변조 주기 동안 사슬(과 두 번째 화살표부터의 궤적 원)이 닿는 범위를 잰다.
    // 원점 아래로 거의 안 내려가면(AM·맥놀이·작은 β) 원점을 아래에 두고(위 172 · 옆 125 · 아래 28 px),
    // FM에서 β가 커져 아래로 휘면 원점을 가운데에 둔다 — 그래야 β 0.5와 2.4를 비교할 때 그림이 쪼그라들지 않는다.
    let up = 1.6;
    let side = 0;
    let down = 0;
    let radial = 1;
    for (let i = 0; i < 240; i++) {
      const chain = phasorChain(arrows, i / 240 / fMod, fFast);
      chain.forEach((p, k) => {
        const a = arrows[k];
        const r = a && Math.abs(a.freq - fFast) > 1e-9 ? a.amp : 0; // 화살표 k의 궤적 원 (중심 = 점 k, 틀과 같이 도는 반송파는 원 없음)
        up = Math.max(up, p.re + r);
        side = Math.max(side, Math.abs(p.im) + r);
        down = Math.max(down, -(p.re - r));
        radial = Math.max(radial, Math.hypot(p.re, p.im) + r);
      });
    }
    if (down > 0.15) return { rMax: radial * 1.04, layout: 'center' as const };
    return { rMax: Math.max(up, (side * 172) / 125, (down * 172) / 28) * 1.04, layout: 'upper' as const };
  }, [rotating, arrows, fMod, fFast]);
  const yOf = (v: number) => (db ? relDb(v, 1) : clean(v));
  const carrier = beat ? peakNear(data.spec, f1) : peakNear(data.spec, fc);
  const upper = beat ? peakNear(data.spec, f2) : peakNear(data.spec, fc + fm);
  const lower = beat ? 0 : peakNear(data.spec, fc - fm);
  const theoryLine = (n: number) => lines.find((l) => l.n === n)?.ratio ?? 0;
  const theory: PlotSeries[] = beat
    ? [{ x: [f1, f2], y: [yOf(1), yOf(ratio)], name: '이론값', mode: 'markers', color: 'var(--plot-2)', markerSize: 9 }]
    : [{ x: lines.map((l) => fc + l.n * fm), y: lines.map((l) => yOf(l.ratio)), name: '이론값', mode: 'markers', color: 'var(--plot-2)', markerSize: 9 }];
  const waveSeries: PlotSeries[] = [
    { x: data.t, y: data.x, name: '파형', color: 'var(--plot-1)', width: 1 },
    { x: data.t, y: data.env, name: '포락선', color: 'var(--text-muted)', dash: 'dash', width: 1.6 },
    { x: data.t, y: data.env.map((v) => -v), name: '포락선', color: 'var(--text-muted)', dash: 'dash', width: 1.6, hideInLegend: true },
  ];
  const specSeries: PlotSeries[] = [
    { x: data.fx, y: data.ay.map(yOf), name: `스펙트럼 (측정 ${seconds} s, Hann)`, color: 'var(--plot-1)', width: 1.4 },
    ...theory,
  ];

  const rows: Readout[] = beat
    ? [
        { label: `${formatNumber(f1, 4)} Hz 막대`, value: carrier, unit: 'mm/s', theory: 1 },
        { label: `${formatNumber(f2, 4)} Hz 막대`, value: upper, unit: 'mm/s', theory: ratio },
        { label: '맥놀이 주기 1/∣f₁ − f₂∣', value: 1 / gap, unit: 's' },
        { label: '포락선 최대 (두 크기의 합)', value: 1 + ratio, unit: 'mm/s' },
        { label: '포락선 최소 (두 크기의 차)', value: clean(1 - ratio), unit: 'mm/s' },
        { label: '두 막대 사이 bin 수 (Hann은 3.5 이상이면 갈라짐)', value: gap * seconds },
      ]
    : [
        { label: `반송파 ${formatNumber(fc, 4)} Hz`, value: carrier, unit: 'mm/s', theory: theoryLine(0) },
        { label: `아래 측대역 ${formatNumber(fc - fm, 4)} Hz`, value: lower, unit: 'mm/s', theory: theoryLine(-1) },
        { label: `위 측대역 ${formatNumber(fc + fm, 4)} Hz`, value: upper, unit: 'mm/s', theory: theoryLine(1) },
        { label: '측대역 간격 (= 변조 주파수)', value: fm, unit: 'Hz' },
        { label: '위 측대역 (반송파 대비)', value: relDb(upper, carrier), unit: 'dB', sig: 3 },
        { label: '측대역 간격 안의 bin 수', value: fm * seconds },
      ];

  const formulas = beat ? (
    <>
      <Formula display tex={'\\cos 2\\pi f_1 t + \\cos 2\\pi f_2 t = 2\\cos\\pi(f_1 - f_2)t\\,\\cos\\pi(f_1 + f_2)t'} />
      <Formula display tex={'\\text{맥놀이 주기} = \\frac{1}{\\lvert f_1 - f_2\\rvert} = \\frac{1}{' + texNumber(gap, 3) + '} = ' + texNumber(1 / gap, 3) + '\\ \\mathrm{s}'} />
    </>
  ) : (
    <>
      <Formula display tex={'x = A' + (useAm ? '\\,(1 + ' + texNumber(mEff, 2) + '\\cos(2\\pi\\,' + texNumber(fm, 3) + 't' + (psi ? ' + ' + texNumber(psiDeg, 3) + '^\\circ' : '') + '))' : '') + '\\cos(2\\pi\\,' + texNumber(fc, 4) + 't' + (useFm ? ' + ' + texNumber(betaEff, 2) + '\\sin 2\\pi\\,' + texNumber(fm, 3) + 't' : '') + ')'} />
      {useAm && !useFm && <Formula display tex={'\\text{측대역} = \\frac{m}{2} = ' + texNumber(m / 2, 3) + '\\ \\to\\ 20\\log_{10}' + texNumber(m / 2, 3) + ' = ' + texNumber(relDb(m / 2, 1), 3) + '\\ \\mathrm{dB}'} />}
      {useFm && <Formula display tex={'J_0(' + texNumber(beta, 2) + ') = ' + texNumber(besselJ(0, beta), 3) + ',\\ J_1 = ' + texNumber(besselJ(1, beta), 3) + ',\\ J_2 = ' + texNumber(besselJ(2, beta), 3) + ',\\ J_3 = ' + texNumber(besselJ(3, beta), 3)} />}
      <p>측대역은 반송파 f_c에서 f_m의 정수배만큼 떨어진 자리 f_c ± n·f_m에 섭니다. 주황 점은 이론값입니다 (반송파 = 1 mm/s Peak).</p>
    </>
  );

  return (
    <LabFrame id="LAB-MOD-01" title="변조 · 측대역 · 맥놀이"
      controls={<>
        <ParamSelect label="예시" value={preset} options={PRESETS} onChange={applyPreset} />
        <ParamSelect label="무엇이 흔들리나" value={mode} options={MODES} onChange={(v) => { setMode(v); setPreset('none'); }} />
        {!beat && <ParamSlider label="반송파 f_c" value={fc} min={40} max={400} step={0.5} unit="Hz" onChange={setFc} />}
        {!beat && <ParamSlider label="변조 주파수 f_m" value={fm} min={0.5} max={40} step={0.5} unit="Hz" onChange={setFm} />}
        {useAm && <ParamSlider label="AM 변조 지수 m" value={m} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} onChange={setM} hint="크기가 1 − m ~ 1 + m 사이를 오갑니다" />}
        {useFm && <ParamSlider label="FM 변조 지수 β" value={beta} min={0} max={5} step={0.1} format={(v) => v.toFixed(1)} onChange={setBeta} hint={`주파수가 f_c ± ${formatNumber(beta * fm, 3)} Hz 사이를 오갑니다 (β × f_m)`} />}
        {mode === 'amfm' && <ParamSlider label="크기와 주파수의 위상차" value={psiDeg} min={0} max={180} step={15} unit="°" onChange={setPsi} hint="0°: 크기가 클 때 주파수도 높음" />}
        {beat && <ParamSlider label="f₁" value={f1} min={10} max={100} step={0.5} unit="Hz" onChange={setF1} />}
        {beat && <ParamSlider label="차이 f₁ − f₂" value={gap} min={0.125} max={5} step={0.125} unit="Hz" format={(v) => v.toFixed(3)} onChange={setGap} />}
        {beat && <ParamSlider label="f₂의 크기 (f₁ = 1)" value={ratio} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} onChange={setRatio} />}
        <ParamSelect label="측정 시간 T (Δf = 1/T)" value={seconds} options={T_OPTIONS.map((s) => ({ value: s, label: `${s} s (Δf ${formatNumber(1 / s, 3)} Hz)` }))} onChange={setSeconds} />
        <ParamToggle label="dB로 보기 (0 dB = 1 mm/s)" checked={db} onChange={setDb} />
      </>}
      formulas={formulas}
      readouts={<ReadoutTable caption="읽음값 (스펙트럼에서 잰 Peak, 반송파 = 1)" rows={rows} />}
      tasks={[
        { question: 'AM에서 m = 0.5일 때 측대역은 반송파보다 몇 dB 낮을까요? m = 0.2라면?',
          answer: '측대역 = m/2 = 0.25 → 20 log₁₀ 0.25 ≈ −12.0 dB. m = 0.2면 0.1 → −20 dB입니다. 측대역 높이로 크기가 얼마나 흔들리는지(m) 거꾸로 알 수 있습니다.' },
        { question: 'FM에서 β를 0.5 → 1 → 2.4 → 5로 올리면 측대역 수와 반송파는 어떻게 될까요?',
          answer: '의미 있는 측대역이 대략 β + 1쌍으로 늘어납니다. 반송파 높이는 J₀(β)를 따라 0.94 → 0.77 → 약 0 → 0.18로 바뀌고, β = 2.4 근처에서는 거의 사라집니다. 크기는 그대로인데도 스펙트럼이 넓게 퍼집니다.' },
        { question: 'AM + FM에서 위상차를 0° → 90° → 180°로 바꾸면 측대역 좌우 높이는?',
          answer: '0°에서는 위쪽(f_c + f_m)이 크고, 90°에서는 양쪽이 같고, 180°에서는 아래쪽이 큽니다. 측대역이 비대칭이면 AM과 FM이 함께 있다는 표시입니다.' },
        { question: '맥놀이에서 차이를 0.25 Hz로 두면 포락선 주기는? 측정 시간 T를 1 s로 줄이면 두 막대가 갈라지나요?',
          answer: '주기는 1/0.25 = 4 s입니다. T = 1 s(Δf 1 Hz)에서는 두 막대가 0.25 bin 떨어져 하나로 붙습니다. Hann으로 가르려면 약 3.5 bin, 즉 T ≥ 14 s가 필요합니다 (P2-4).' },
      ]}
      footer={<p>f_s = 1024 Hz, 반송파(맥놀이는 f₁)의 크기 1 mm/s Peak. 스펙트럼은 Hann 윈도우 한 프레임입니다. 주파수가 Δf = 1/T의 배수가 아니면 막대가 가리비 손실(P2-5)만큼 낮게 읽힙니다.</p>}
    >
      <h4>도는 화살표로 보기</h4>
      <PhasorView
        arrows={arrows}
        span={anim.span}
        rMax={rMax}
        speeds={anim.speeds}
        frameFreq={rotating ? fFast : 0}
        trace={rotating ? 'length' : 'signal'}
        envelope={!rotating}
        layout={layout}
        traceLabel={rotating ? '화살표 합의 길이 = 포락선' : '사슬 끝의 높이 = 파형 (점선: 포락선)'}
        ariaLabel={beat
          ? `길이 1과 ${ratio}인 두 화살표가 1초에 ${f1}바퀴와 ${f2}바퀴 돈다. 합의 길이가 ${formatNumber(1 + ratio, 3)}와 ${formatNumber(Math.abs(1 - ratio), 3)} 사이를 오간다.`
          : `반송파 화살표와 측대역 화살표 ${arrows.length - 1}개를 이은 사슬. 측대역은 반송파 끝에서 1초에 ${fm}바퀴의 정수배로 돈다.`}
      >
        <ParamToggle label={`${beat ? 'f₁' : '반송파'}와 같이 돌며 보기`} checked={rotating} onChange={setRotating} />
      </PhasorView>
      <p className="anim-caption">
        {rotating
          ? beat
            ? `f₁ 화살표(파랑)가 멈춰 보이도록 f₁과 같은 빠르기로 돌며 봅니다. f₂ 화살표(주황)는 ${formatNumber(gap, 3)} Hz 느려서 f₁ 끝에서 1초에 ${formatNumber(gap, 3)}바퀴씩 거꾸로 돕니다. 같은 쪽을 가리키면 합이 가장 길고(1 + ${formatNumber(ratio, 2)}), 반대쪽이면 가장 짧습니다(∣1 − ${formatNumber(ratio, 2)}∣) — 이 길이가 포락선입니다.`
            : `반송파 화살표(파랑)가 멈춰 보이도록 반송파와 같은 빠르기로 돌며 봅니다. 위 측대역(주황, +n)은 반시계로, 아래 측대역(초록, −n)은 시계로 반송파 끝에서 1초에 n × ${formatNumber(fm, 3)}바퀴 돕니다. ${
              mode === 'am'
                ? '두 측대역의 합은 늘 반송파와 같은 방향(위·아래)이라 길이만 1 − m ~ 1 + m로 바뀝니다 — 이것이 포락선입니다.'
                : mode === 'fm'
                  ? '측대역들의 합이 사슬 끝을 반지름 1인 원호를 따라 좌우로 밀어, 길이는 그대로 1이고 방향만 흔들립니다. 방향이 흔들린다 = 도는 빠르기(주파수)가 흔들린다는 뜻입니다.'
                  : '이번에는 측대역 합이 반송파 방향과 비스듬해서 길이(크기)와 방향(주파수)이 함께 흔들립니다. 위상차를 바꾸면 위·아래 측대역의 길이가 달라집니다.'
            }`
          : `실제처럼 화살표가 각자의 주파수로 돕니다(양의 주파수는 반시계). 사슬 끝의 높이가 파형이고, 점선은 화살표 합의 길이(포락선)입니다. ${beat ? "f₁이" : "반송파가"} 빨라 화면은 아주 느리게 재생합니다.`}
      </p>
      <h4>파형과 포락선</h4>
      <Plot series={waveSeries} x={{ label: '시간 [s]', range: [0, data.tShow] }} y={{ label: '[mm/s]' }} height={240} ariaLabel="파형과 포락선" />
      <h4>스펙트럼</h4>
      <Plot series={specSeries} x={{ label: '주파수 [Hz]', range: [data.lo, data.hi] }}
        y={{ label: db ? 'dB (0 dB = 1 mm/s Peak)' : '[mm/s Peak]', range: db ? [-80, 5] : [0, 1.15] }} height={270} ariaLabel="스펙트럼과 이론값" />
    </LabFrame>
  );
}
