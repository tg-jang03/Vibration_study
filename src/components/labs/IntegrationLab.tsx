import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { highpassGain } from '../../lib/dsp/filter';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import { demoAccel, demoIntegrate, INT_DEMO, type IntMethod } from '../../lib/filterDemo';

/**
 * LAB-INT-01 적분 & ski-slope (P5-1, Contents §5-1b).
 * 계산: src/lib/dsp/filter.ts (integrateSpectral·integrateCumulative), 신호: src/lib/filterDemo.ts (본문 그림 8 · 9와 같음).
 */

type Problem = 'lf' | 'offset' | 'both' | 'none';
const METHODS: { value: IntMethod; label: string }[] = [
  { value: 'spectral', label: '주파수 영역 (÷ j2πf)' },
  { value: 'cumulative', label: '시간 영역 (샘플 누적합)' },
];
const RESULTS: { value: 1 | 2; label: string }[] = [
  { value: 1, label: '속도 (한 번 적분)' },
  { value: 2, label: '변위 (두 번 적분)' },
];
const CUTOFFS: { value: number; label: string }[] = [
  { value: 0, label: '없음' },
  { value: 1, label: '1 Hz' },
  { value: 2, label: '2 Hz' },
  { value: 5, label: '5 Hz' },
  { value: 10, label: '10 Hz' },
  { value: 20, label: '20 Hz' },
];
const PROBLEMS: { value: Problem; label: string }[] = [
  { value: 'lf', label: '켠 직후의 낮은 주파수 흔들림 (0.01 g)' },
  { value: 'offset', label: '직류 오프셋 (0.0005 g)' },
  { value: 'both', label: '둘 다' },
  { value: 'none', label: '없음 (기계 성분만)' },
];

const { fs, n, lines } = INT_DEMO;
const df = fs / n;
const X1 = lines[0];
/** 실제 속도 [mm/s] 또는 변위 [µm] */
const truth = (t: number, times: 1 | 2) =>
  lines.reduce((s, l) => {
    const w = 2 * Math.PI * l.f;
    return s + (times === 1 ? l.v * 1e3 * Math.cos(w * t + l.phase) : (l.v / w) * 1e6 * Math.sin(w * t + l.phase));
  }, 0);
const DEC = 2;
const T_SHOW = Array.from({ length: Math.floor((2 * fs) / DEC) + 1 }, (_, i) => (i * DEC) / fs);

export interface IntegrationLabProps {
  initialMethod?: IntMethod;
  initialProblem?: Problem;
  initialCutoff?: number;
}

export default function IntegrationLab({ initialMethod = 'spectral', initialProblem = 'lf', initialCutoff = 0 }: IntegrationLabProps) {
  const [method, setMethod] = useState<IntMethod>(initialMethod);
  const [times, setTimes] = useState<1 | 2>(1);
  const [hp, setHp] = useState(initialCutoff);
  const [problem, setProblem] = useState<Problem>(initialProblem);

  const unit = times === 1 ? 'mm/s' : 'µm';
  const scale = times === 1 ? 1e3 : 1e6;
  const r = useMemo(() => {
    const a = demoAccel({ lfNoiseG: problem === 'lf' || problem === 'both' ? INT_DEMO.lfNoiseG : 0, offsetG: problem === 'offset' || problem === 'both' ? INT_DEMO.offsetG : 0 });
    const y = demoIntegrate(a, method, times, hp);
    const sp = singleSidedSpectrum({ fs, x: y }, { window: 'hann' });
    let lowMax = 0;
    for (let k = 1; k < Math.round(5 / df); k++) lowMax = Math.max(lowMax, sp.amplitude[k]);
    let late = 0;
    for (let i = fs; i <= 2 * fs; i++) late = Math.max(late, Math.abs(y[i]));
    // 스펙트럼: 높은 쪽은 묶어서 최대값만 (점 수 줄이기)
    const sf: number[] = [];
    const sy: number[] = [];
    for (let k = 1; k < n / 2; ) {
      const step = Math.max(1, Math.floor(k / 80));
      let m = 0;
      for (let j = k; j < Math.min(k + step, n / 2); j++) m = Math.max(m, sp.amplitude[j]);
      sf.push(k * df);
      sy.push(Math.max(m * scale, 1e-5));
      k += step;
    }
    return { y, sf, sy, x1: sp.amplitude[Math.round(X1.f / df)] * scale, lowMax: lowMax * scale, late: late * scale };
  }, [method, times, hp, problem, scale]);

  const trueLine = T_SHOW.map((t) => truth(t, times));
  const trueX1 = times === 1 ? X1.v * 1e3 : (X1.v / (2 * Math.PI * X1.f)) * 1e6;
  const trueMax = Math.max(...trueLine.map(Math.abs));
  const g1 = highpassGain(X1.f, hp) ** (method === 'cumulative' ? times : 1);

  const timeSeries: PlotSeries[] = [
    { x: T_SHOW, y: trueLine, name: '실제', color: 'var(--text-muted)', width: 1.2 },
    { x: T_SHOW, y: T_SHOW.map((_, i) => r.y[i * DEC] * scale), name: '적분 결과', color: 'var(--plot-1)', width: 1.4 },
  ];
  const specSeries: PlotSeries[] = [{ x: r.sf, y: r.sy, name: '적분 결과 스펙트럼', color: 'var(--plot-1)', width: 1.6 }];
  const yMax = Math.max(trueMax * 1.3, Math.min(Math.max(...r.y.slice(0, 2 * fs + 1).map((v) => Math.abs(v * scale))) * 1.1, trueMax * 400));

  return (
    <LabFrame
      id="LAB-INT-01"
      title="적분 & ski-slope: 가속도 → 속도 → 변위"
      controls={
        <>
          <ParamSelect label="센서 쪽 문제" value={problem} options={PROBLEMS} onChange={setProblem} />
          <ParamSelect label="적분 방식" value={method} options={METHODS} onChange={setMethod} />
          <ParamSelect label="결과" value={times} options={RESULTS} onChange={(v) => setTimes(Number(v) as 1 | 2)} />
          <ParamSelect label="하한 컷오프 (2차 고역 통과)" value={hp} options={CUTOFFS} onChange={(v) => setHp(Number(v))} hint="1X는 25 Hz" />
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={
              times === 1
                ? `V = \\dfrac{A}{j2\\pi f}:\\quad 1\\mathrm{X}\\ ${X1.f}\\,\\mathrm{Hz},\\ A = ${texNumber(2 * Math.PI * X1.f * X1.v, 3)}\\,\\mathrm{m/s^2} \\ \\to\\ V = ${texNumber(X1.v * 1e3, 3)}\\,\\mathrm{mm/s}`
                : `D = -\\dfrac{A}{(2\\pi f)^2}:\\quad 1\\mathrm{X}\\ ${X1.f}\\,\\mathrm{Hz} \\ \\to\\ D = ${texNumber(trueX1, 3)}\\,\\mu\\mathrm{m}`
            }
          />
          <Formula display tex={hp > 0 ? `\\text{1X에서 고역 통과 크기} = \\dfrac{1}{\\sqrt{1 + (${hp}/${X1.f})^4}}${method === 'cumulative' && times === 2 ? '^{\\,2}' : ''} = ${texNumber(g1, 4)}` : '\\text{하한 컷오프 없음: } f \\to 0\\text{에서 } 1/(2\\pi f) \\to \\infty'} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: `1X 진폭 (${unit} pk)`, value: r.x1, theory: trueX1, unit, sig: 3 },
            { label: `5 Hz 아래 최대 (${unit} pk)`, value: r.lowMax, unit, sig: 3 },
            { label: `1 ~ 2 s 파형 최대 (${unit})`, value: r.late, theory: trueMax, unit, sig: 3 },
          ]}
        />
      }
      tasks={[
        {
          question: '처음 상태(주파수 영역, 속도, 컷오프 없음, 낮은 주파수 흔들림)에서 5 Hz 아래 최대와 1X를 비교해 보세요. 컷오프를 5 Hz로 올리면?',
          answer: '컷오프가 없으면 5 Hz 아래가 18.2 mm/s로 1X(3.99 mm/s)보다 큽니다 — ski-slope입니다. 5 Hz면 0.71 mm/s로 내려가고 1X는 3.98 mm/s로 거의 그대로입니다.',
        },
        {
          question: '컷오프를 20 Hz로 올려 보세요. 1X 진폭은 몇 % 깎이나요? 1X가 5 Hz인 느린 기계라면?',
          answer: '1X가 3.36 mm/s로 약 16 % 깎입니다(1/√(1 + 0.8⁴) = 0.84). 1X가 5 Hz(300 rpm)인 기계에 5 Hz 컷오프를 걸면 1X가 0.71배가 되므로, 이런 기계는 컷오프를 훨씬 낮추거나 변위·속도를 직접 재는 센서(P3-1)를 씁니다.',
        },
        {
          question: '센서 쪽 문제를 "직류 오프셋", 방식을 "시간 영역", 컷오프 없음으로 두고 속도와 변위를 차례로 보세요. 그다음 컷오프 5 Hz를 걸어 보세요.',
          answer: '속도는 1초에 4.9 mm/s씩 떠내려가 2초에 9.8 mm/s, 변위는 mm 단위까지 벌어집니다(실제 변위는 30 µm 남짓). 5 Hz 고역 통과를 먼저 걸면 둘 다 실제 값 근처에 머뭅니다. 주파수 영역 적분은 DC bin을 0으로 두므로 오프셋에 끌려가지 않습니다.',
        },
      ]}
    >
      <Plot series={timeSeries} x={{ label: '시간 [s]', range: [0, 2] }} y={{ label: times === 1 ? '속도 [mm/s]' : '변위 [µm]', range: [-yMax, yMax] }} height={220} ariaLabel="적분 결과 시간파형" />
      <Plot series={specSeries} x={{ label: '주파수 [Hz]', log: true, range: [Math.log10(0.15), 3] }} y={{ label: times === 1 ? '속도 [mm/s pk]' : '변위 [µm pk]', log: true, range: times === 1 ? [-3, 2.5] : [-3, 4.5] }} height={230} ariaLabel="적분 결과 스펙트럼" />
    </LabFrame>
  );
}
