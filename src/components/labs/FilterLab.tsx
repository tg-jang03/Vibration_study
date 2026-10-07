import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { demoFilter, demoResponse, demoSamples, edgeOvershoot, FLT_DEMO, squareWave, type DemoFilter, type FilterChoice } from '../../lib/filterDemo';

/**
 * LAB-FLT-01 필터 설계: 크기 · 군지연 · 시간파형 (P5-1, Contents §5-1b).
 * 계산: src/lib/dsp/filter.ts, 신호: src/lib/filterDemo.ts (본문 그림 1 ~ 6과 같은 신호·필터).
 */

const TYPES: { value: DemoFilter; label: string }[] = [
  { value: 'butterworth', label: 'Butterworth (통과 대역이 가장 평평)' },
  { value: 'chebyshev1', label: 'Chebyshev (리플 1 dB, 가파름)' },
  { value: 'bessel', label: 'Bessel (군지연이 고름)' },
  { value: 'fir', label: `FIR (${FLT_DEMO.firTaps}탭, 선형 위상)` },
];
const SIGNALS: { value: 'vib' | 'square'; label: string }[] = [
  { value: 'vib', label: '진동 파형 (1X ~ 3X + 맞물림 500 Hz)' },
  { value: 'square', label: '사각파 10 Hz (모서리)' },
];

const { fs, f1 } = FLT_DEMO;
const FREQS = Array.from({ length: 280 }, (_, i) => 10 ** (Math.log10(5) + ((Math.log10(3000) - Math.log10(5)) * i) / 279));
const MARKS = [
  { f: f1, name: '1X' },
  { f: 2 * f1, name: '2X' },
  { f: 3 * f1, name: '3X' },
  { f: 20 * f1, name: '맞물림' },
];
const db = (m: number) => 20 * Math.log10(Math.max(m, 1e-12));
const deg = (r: number) => (r * 180) / Math.PI;
/** 이론상 0인 값의 찌꺼기와 0.001 dB 아래의 잔값은 0으로 (I-019) */
const clean = (v: number) => (Math.abs(v) < 5e-4 ? 0 : v);

// 시간파형 시료 (한 번만 만든다)
const VIB = demoSamples(0.6);
const SQ_T0 = -0.5;
const SQ = (() => {
  const n = Math.round((0.03 - SQ_T0) * fs);
  const t = Float64Array.from({ length: n }, (_, i) => SQ_T0 + i / fs);
  return { t, x: t.map((ti) => squareWave(10, ti)) };
})();

export interface FilterLabProps {
  initialType?: DemoFilter;
  initialSignal?: 'vib' | 'square';
  initialTwice?: boolean;
}

export default function FilterLab({ initialType = 'butterworth', initialSignal = 'vib', initialTwice = false }: FilterLabProps) {
  const [type, setType] = useState<DemoFilter>(initialType);
  const [order, setOrder] = useState<number>(FLT_DEMO.order);
  const [fc, setFc] = useState<number>(FLT_DEMO.fc);
  const [signal, setSignal] = useState<'vib' | 'square'>(initialSignal);
  const [twice, setTwice] = useState(initialTwice);

  const choice: FilterChoice = useMemo(() => ({ type, order, fc, fs, rippleDb: 1 }), [type, order, fc]);
  const resp = useMemo(() => demoResponse(choice, FREQS), [choice]);
  const marks = useMemo(() => demoResponse(choice, MARKS.map((m) => m.f)), [choice]);
  const k = twice ? 2 : 1;

  const time = useMemo(() => {
    if (signal === 'vib') {
      const y = demoFilter(choice, VIB.x, twice);
      const i0 = Math.round(0.4 * fs);
      const i1 = Math.round(0.52 * fs);
      const pick = (a: ArrayLike<number>, s = 1) => Array.from(a).slice(i0, i1 + 1).map((v) => v * s);
      return { t: pick(VIB.t).map((v) => (v - 0.4) * 1e3), x: pick(VIB.x, 1e3), target: pick(VIB.target, 1e3), y: pick(y, 1e3), overshoot: NaN };
    }
    const y = demoFilter(choice, SQ.x, twice);
    const keep = (i: number) => SQ.t[i] >= -0.005;
    const idx = Array.from(SQ.t.keys()).filter(keep);
    const yy = idx.map((i) => y[i]);
    return { t: idx.map((i) => SQ.t[i] * 1e3), x: idx.map((i) => SQ.x[i]), target: [] as number[], y: yy, overshoot: edgeOvershoot(choice, yy, twice) };
  }, [choice, signal, twice]);

  const magSeries: PlotSeries[] = [
    { x: FREQS, y: resp.mag.map((m) => k * db(m)), name: twice ? '크기 (두 번 거름 = 제곱)' : '크기', color: 'var(--plot-1)', width: 2.2 },
    { x: MARKS.slice(0, 3).map((m) => m.f), y: marks.mag.slice(0, 3).map((m) => k * db(m)), name: '1X ~ 3X', mode: 'markers', color: 'var(--plot-3)', markerSize: 9 },
    { x: [MARKS[3].f], y: [k * db(marks.mag[3])], name: '맞물림 500 Hz', mode: 'markers', color: 'var(--plot-2)', markerSize: 9 },
  ];
  const gdSeries: PlotSeries[] = [
    { x: FREQS, y: resp.groupDelay.map((g) => g * 1e3), name: '한 번 거름', color: 'var(--plot-1)', width: 2.2 },
    ...(twice ? [{ x: FREQS, y: FREQS.map(() => 0), name: '두 번 거름 = 0', color: 'var(--plot-3)', width: 2, dash: 'dash' as const }] : []),
  ];
  const timeSeries: PlotSeries[] = [
    { x: time.t, y: time.x, name: '입력', color: 'var(--text-muted)', width: 1.2 },
    ...(signal === 'vib' ? [{ x: time.t, y: time.target, name: '목표 (1X ~ 3X)', color: 'var(--plot-3)', width: 1.8, dash: 'dash' as const }] : []),
    { x: time.t, y: time.y, name: twice ? '출력 (두 번 거름)' : '출력', color: 'var(--plot-1)', width: 2.2 },
  ];

  const ph1 = twice ? 0 : clean(-deg(marks.phase[0]));
  const gd1 = twice ? 0 : marks.groupDelay[0] * 1e3;
  const gd3 = twice ? 0 : marks.groupDelay[2] * 1e3;
  const r500 = 1 / Math.sqrt(1 + (500 / fc) ** (2 * order));

  return (
    <LabFrame
      id="LAB-FLT-01"
      title="필터 설계: 크기 · 군지연 · 시간파형"
      controls={
        <>
          <ParamSelect label="필터 종류" value={type} options={TYPES} onChange={setType} />
          <ParamSlider label="차수 n" value={order} min={1} max={8} step={1} onChange={setOrder} disabled={type === 'fir'} hint={type === 'fir' ? 'FIR은 탭 101개로 고정' : '차수 하나에 약 6 dB/옥타브'} />
          <ParamSlider label="차단 주파수 f_c" value={fc} min={50} max={400} step={10} unit=" Hz" onChange={setFc} />
          <ParamSelect label="시험 신호" value={signal} options={SIGNALS} onChange={setSignal} />
          <ParamToggle label="두 번 거르기 (앞으로 + 거꾸로)" checked={twice} onChange={setTwice} hint="위상 0, 크기는 제곱 — 저장된 데이터에만" />
        </>
      }
      formulas={
        <>
          {type === 'butterworth' ? (
            <Formula display tex={`|H(500\\,\\mathrm{Hz})| = \\dfrac{1}{\\sqrt{1 + (500/${fc})^{${2 * order}}}} = ${texNumber(r500, 3)}\\ (${texNumber(db(r500), 3)}\\ \\mathrm{dB}),\\ \\ \\text{디지털 필터: } ${texNumber(k * db(marks.mag[3]), 3)}\\ \\mathrm{dB}${twice ? '\\ (|H|^2)' : ''}`} />
          ) : (
            <Formula display tex={`|H(500\\,\\mathrm{Hz})| = ${texNumber(k * db(marks.mag[3]), 3)}\\ \\mathrm{dB}${twice ? '\\ (\\text{두 번: dB가 두 배})' : ''}`} />
          )}
          <Formula display tex={`\\tau_g = -\\dfrac{d\\varphi}{d\\omega}:\\quad \\tau_g(1\\mathrm{X}) = ${texNumber(gd1, 3)}\\ \\mathrm{ms},\\ \\ \\varphi(1\\mathrm{X}) = -${texNumber(ph1, 3)}^\\circ = -360^\\circ \\times ${f1}\\,\\mathrm{Hz} \\times ${texNumber(gd1, 3)}\\,\\mathrm{ms}\\ (\\text{약})`} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '1X 25 Hz 크기', value: clean(k * db(marks.mag[0])), unit: 'dB', sig: 3 },
            { label: '3X 75 Hz 크기', value: clean(k * db(marks.mag[2])), unit: 'dB', sig: 3 },
            { label: '맞물림 500 Hz 크기', value: k * db(marks.mag[3]), unit: 'dB', sig: 3 },
            { label: '1X 위상 늦음', value: ph1, unit: '°', sig: 3 },
            { label: '1X 군지연', value: gd1, unit: 'ms', sig: 3 },
            { label: '3X 군지연', value: gd3, unit: 'ms', sig: 3 },
            ...(signal === 'square' ? [{ label: '모서리 넘침', value: clean(time.overshoot), unit: '%', sig: 3 }] : []),
          ]}
        />
      }
      tasks={[
        {
          question: '진동 파형, 4차, f_c = 150 Hz에서 종류를 Butterworth → Chebyshev → Bessel로 바꿔 보세요. 맞물림 500 Hz를 가장 많이 깎는 것과 1X를 가장 덜 늦추는 것은?',
          answer: '500 Hz는 Chebyshev가 −53.9 dB로 가장 많이 깎고(Butterworth −42.5, Bessel −29.1 dB), 1X 위상은 Bessel이 20.2°로 가장 덜 늦습니다(Butterworth 25.0°, Chebyshev 26.8°). 가파르게 깎는 쪽이 위상은 더 흔듭니다.',
        },
        {
          question: '시험 신호를 사각파로 바꾸고 Butterworth와 Bessel의 모서리 넘침을 비교해 보세요. 차수를 2 → 8로 올리면 Butterworth의 넘침은?',
          answer: '4차에서 Butterworth 10.9 %, Bessel 0.89 %입니다. Butterworth는 차수를 올릴수록 넘침이 커집니다(2차 약 4 %, 8차 약 16 %). 더 가파르게 깎는 만큼 f_c 근처의 군지연이 더 솟기 때문입니다.',
        },
        {
          question: '진동 파형에서 "두 번 거르기"를 켜 보세요. 출력이 목표와 겹치나요? 500 Hz 크기와 1X 군지연은 어떻게 바뀌나요?',
          answer: '겹칩니다. 거꾸로 거르며 늦은 만큼 당겨서 군지연·위상이 0이 되고, 크기는 제곱이라 500 Hz가 −42.5 → −85 dB가 됩니다. 대신 앞으로 올 샘플이 필요하므로 저장된 데이터에만 씁니다.',
        },
      ]}
    >
      <Plot series={magSeries} x={{ label: '주파수 [Hz]', log: true, range: [Math.log10(5), Math.log10(3000)] }} y={{ label: '크기 [dB]', range: [-100, 5] }} height={230} ariaLabel="필터의 크기 응답" />
      <Plot series={gdSeries} x={{ label: '주파수 [Hz]', log: true, range: [Math.log10(5), Math.log10(3000)] }} y={{ label: '군지연 [ms]', range: [-0.5, 12] }} height={190} ariaLabel="필터의 군지연" />
      <Plot
        series={timeSeries}
        x={{ label: signal === 'vib' ? '시간 [ms]' : '모서리부터 시간 [ms]', range: signal === 'vib' ? [0, 120] : [-5, 30] }}
        y={{ label: signal === 'vib' ? '속도 [mm/s]' : '진폭', range: signal === 'vib' ? [-8, 8] : [-1.5, 1.6] }}
        height={230}
        ariaLabel="입력과 출력 시간파형"
      />
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
        차단 주파수의 약속: Butterworth·Bessel·FIR은 크기 −3 dB, Chebyshev는 리플 1 dB의 끝(−1 dB). {formatNumber(fc, 3)} Hz 표시는 그 점이다.
      </p>
    </LabFrame>
  );
}
