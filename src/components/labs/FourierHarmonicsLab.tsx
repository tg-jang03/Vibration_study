import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { harmonicPreset, type HarmonicSeries, type WavePreset } from '../../lib/dsp/fourier';
import { createRng } from '../../lib/dsp/random';
import { acquire } from '../../lib/dsp/sampling';
import { crestFactor, peak, rms } from '../../lib/dsp/stats';

/** LAB-FOU-01 (a) 하모닉 쌓기 — 신호는 정현파의 합 (P1-1, Contents §5-1) */

const F0 = 10; // Hz
const FS = 6000; // Hz, 화면용 (15차 150 Hz까지 충분)
const PERIODS = 2;
const N_SAMPLES = (PERIODS / F0) * FS;
const MAX_ORDERS = 15;
const CUSTOM_ORDERS = 5;

type Mode = WavePreset | 'custom';
const MODE_OPTIONS: ParamOption<Mode>[] = [
  { value: 'square', label: '사각파' },
  { value: 'sawtooth', label: '톱니파' },
  { value: 'pulse', label: '펄스열' },
  { value: 'custom', label: '직접 만들기 (1~5차)' },
];

// "위상 섞기"용 고정 오프셋 — 시드 고정이라 언제나 같은 결과
const SHUFFLE = (() => {
  const rng = createRng(2026);
  return Array.from({ length: MAX_ORDERS }, () => rng.uniform() * 2 * Math.PI);
})();

const toDeg = (rad: number) => {
  let d = ((rad * 180) / Math.PI) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
};

function coefficientTex(mode: Mode, duty: number, amps: number[]): string {
  switch (mode) {
    case 'square':
      return 'A_n = \\dfrac{4}{n\\pi}\\ \\ (n\\ \\text{홀수}),\\qquad A_n = 0\\ \\ (n\\ \\text{짝수})';
    case 'sawtooth':
      return 'A_n = \\dfrac{2}{n\\pi}';
    case 'pulse':
      return `A_n = \\left|\\dfrac{2\\sin(n\\pi d)}{n\\pi}\\right|,\\quad d = ${texNumber(duty, 2)}`;
    case 'custom':
      return amps.map((a, i) => `A_${i + 1} = ${texNumber(a, 2)}`).join(',\\ ');
  }
}

export default function FourierHarmonicsLab() {
  const [mode, setMode] = useState<Mode>('square');
  // 1차 하나에서 시작해 직접 쌓아 올리게 한다 (본문 "따라 하기")
  const [orders, setOrders] = useState(1);
  const [duty, setDuty] = useState(0.2);
  const [shuffle, setShuffle] = useState(false);
  const [showParts, setShowParts] = useState(true);
  const [customAmps, setCustomAmps] = useState([1, 0, 0.3, 0, 0]);
  const [customPhases, setCustomPhases] = useState([0, 0, 0, 0, 0]); // deg

  const series: HarmonicSeries = useMemo(() => {
    const base =
      mode === 'custom'
        ? { amps: customAmps, phases: customPhases.map((d) => (d * Math.PI) / 180) }
        : harmonicPreset(mode, orders, duty);
    const phases = shuffle ? base.phases.map((p, i) => p + SHUFFLE[i]) : base.phases;
    return { amps: base.amps, phases };
  }, [mode, orders, duty, shuffle, customAmps, customPhases]);

  const view = useMemo(() => {
    const spec = { components: [{ type: 'harmonics' as const, f0: F0, amps: series.amps, phases: series.phases }] };
    const s = acquire(spec, { fs: FS, n: N_SAMPLES });
    const time: PlotSeries[] = [{ x: s.t, y: s.x, name: '합 x(t)', width: 2.5 }];
    if (showParts) {
      let shown = 0;
      for (let i = 0; i < series.amps.length && shown < 5; i++) {
        if (series.amps[i] < 1e-9) continue;
        const part = acquire(
          { components: [{ type: 'sine', freq: (i + 1) * F0, amp: series.amps[i], phase: series.phases[i] }] },
          { fs: FS, n: N_SAMPLES },
        );
        time.push({ x: part.t, y: part.x, name: `${i + 1}차`, width: 1, dash: 'dot', opacity: 0.8 });
        shown++;
      }
    }
    const freqs = series.amps.map((_, i) => (i + 1) * F0);
    const phaseX: number[] = [];
    const phaseY: number[] = [];
    series.amps.forEach((a, i) => {
      if (a > 1e-9) {
        phaseX.push((i + 1) * F0);
        phaseY.push(toDeg(series.phases[i]));
      }
    });
    return {
      time,
      amp: [{ x: freqs, y: series.amps, name: '진폭 Aₙ', kind: 'bar' as const, barWidth: F0 * 0.35 }],
      phase: [{ x: phaseX, y: phaseY, name: '위상 φₙ', mode: 'markers' as const, markerSize: 9 }],
      rms: rms(s.x),
      peak: peak(s.x),
      cf: crestFactor(s.x),
    };
  }, [series, showParts]);

  const nh = series.amps.length;
  const rmsTheory = Math.sqrt(series.amps.reduce((acc, a) => acc + (a * a) / 2, 0));
  const fMax = (nh + 1) * F0;

  const setCustom = (setter: typeof setCustomAmps, i: number) => (v: number) =>
    setter((prev) => prev.map((old, j) => (j === i ? v : old)));

  // 지금 더한 성분을 글로 보여준다 — "N차까지 더했는데 막대가 왜 적지?"를 바로 알 수 있게
  const nonzero = series.amps
    .map((a, i) => ({ n: i + 1, a, ph: series.phases[i] }))
    .filter((c) => c.a > 1e-9);
  const zeroOrders = series.amps.flatMap((a, i) => (a > 1e-9 ? [] : [i + 1]));
  const componentText = nonzero
    .map((c) => {
      const negative = !shuffle && Math.abs(Math.abs(c.ph) - Math.PI) < 1e-9;
      return `${c.n}차(${c.n * F0} Hz) ${formatNumber(c.a, 3)}${negative ? ' (부호 −)' : ''}`;
    })
    .join(' · ');

  return (
    <LabFrame
      id="LAB-FOU-01 (a)"
      title="하모닉 쌓기: 신호는 정현파의 합"
      controls={
        <>
          <ParamSelect label="파형" value={mode} options={MODE_OPTIONS} onChange={setMode} />
          {mode !== 'custom' && (
            <ParamSlider
              label="최고 차수 N"
              value={orders}
              min={1}
              max={MAX_ORDERS}
              step={1}
              unit="차"
              hint={`1차(${F0} Hz)부터 N차(${orders * F0} Hz)까지 더한다`}
              onChange={setOrders}
            />
          )}
          {mode === 'pulse' && (
            <ParamSlider
              label="듀티비 d (펄스 폭 / 주기)"
              value={duty}
              min={0.05}
              max={0.5}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setDuty}
            />
          )}
          <ParamToggle label="위상 섞기" checked={shuffle} hint="진폭은 그대로, 위상만 바꾼다" onChange={setShuffle} />
          <ParamToggle label="각 성분(점선) 표시" checked={showParts} hint="0이 아닌 성분 앞 5개" onChange={setShowParts} />
          {mode === 'custom' &&
            customAmps.map((a, i) => (
              <ParamSlider
                key={`a${i}`}
                label={`${i + 1}차 진폭 A${i + 1}`}
                value={a}
                min={0}
                max={1.5}
                step={0.05}
                format={(v) => v.toFixed(2)}
                onChange={setCustom(setCustomAmps, i)}
              />
            ))}
          {mode === 'custom' &&
            customPhases.map((p, i) => (
              <ParamSlider
                key={`p${i}`}
                label={`${i + 1}차 위상 φ${i + 1}`}
                value={p}
                min={-180}
                max={180}
                step={5}
                unit="°"
                onChange={setCustom(setCustomPhases, i)}
              />
            ))}
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={`x(t) = \\sum_{n=1}^{${nh}} A_n \\cos(2\\pi n f_0 t + \\varphi_n),\\quad f_0 = ${F0}\\ \\mathrm{Hz}`}
          />
          <Formula display tex={coefficientTex(mode, duty, customAmps.slice(0, CUSTOM_ORDERS))} />
          <Formula
            display
            tex={`x_{rms} = \\sqrt{\\sum_n \\dfrac{A_n^2}{2}} = ${texNumber(rmsTheory)}\\quad \\text{(Parseval)}`}
          />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: 'RMS (시간영역에서 계산)', value: view.rms, theory: rmsTheory },
            { label: 'Peak', value: view.peak },
            { label: 'Crest factor', value: view.cf },
          ]}
        />
      }
      footer={
        <>
          <strong>지금 더한 성분 {nonzero.length}개</strong>: {componentText || '없음'}
          {zeroOrders.length > 0 && <> — 진폭 0인 차수: {zeroOrders.join(', ')}차</>}
        </>
      }
      tasks={[
        {
          question: '사각파에서 "위상 섞기"를 켜면 진폭 스펙트럼, RMS, 파형, Crest factor 중 무엇이 바뀔까요?',
          answer:
            '진폭 스펙트럼과 RMS는 그대로입니다(RMS는 진폭만으로 정해진다 — Parseval). 파형 모양과 Crest factor는 바뀝니다. 진폭 스펙트럼만 보면 이 차이를 놓치므로 시간파형도 함께 봐야 합니다 (P5-1).',
        },
        {
          question: '사각파에는 왜 짝수 하모닉이 없을까요? 성분 표시를 켜고 반주기 뒤의 모양을 보세요.',
          answer:
            '사각파는 반주기 뒤에 부호만 뒤집히는 대칭 x(t + T/2) = −x(t)을 가집니다. 짝수 차 성분은 반주기 뒤에 부호가 그대로라 이 대칭을 만들 수 없어서 0이 됩니다.',
        },
        {
          question: '하모닉을 15개까지 늘리면 모서리의 튀어나온 부분(오버슈트)이 사라질까요?',
          answer:
            '사라지지 않고 약 9 %로 남고 폭만 좁아집니다(깁스 현상). 날카로운 변화를 만들려면 고차 성분이 아주 많이 필요하다는 뜻입니다.',
        },
        {
          question: '펄스열에서 듀티비를 0.05로 줄이면(펄스를 좁게) 진폭 스펙트럼은 어떻게 될까요?',
          answer:
            '고차까지 진폭이 고르게 퍼집니다. 시간에서 짧은 것은 주파수에서 넓다 — 그래서 짧은 임팩트(해머 타격)는 넓은 대역을 한 번에 가진합니다 (P8-1 임팩트 시험).',
        },
      ]}
    >
      <Plot
        series={view.time}
        x={{ label: '시간 t [s]', range: [0, PERIODS / F0] }}
        y={{ label: '진폭', range: [-1.6, 1.6] }}
        ariaLabel="하모닉 합성 파형"
      />
      <Plot series={view.amp} x={{ label: '주파수 [Hz]', range: [0, fMax] }} y={{ label: '진폭 Aₙ', range: [0, 1.4] }} height={220} />
      <Plot
        series={view.phase}
        x={{ label: '주파수 [Hz]', range: [0, fMax] }}
        y={{ label: '위상 φₙ [°] (180° = 부호 반대)', range: [-200, 200] }}
        height={200}
      />
    </LabFrame>
  );
}
