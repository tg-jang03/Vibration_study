import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import PhasorView, { type PhasorArrow } from '../ui/PhasorView';
import { rateLabel } from '../ui/PlayControls';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { evaluateRange } from '../../lib/dsp/signal';

/** LAB-BAS-01 정현파 3요소 — 진폭·주파수·위상 (P1-2, D-027). 도는 화살표와 그 높이로 "위상 = 출발 각도"를 본다 (D-044) */

const DURATION = 1; // s
const POINTS = 1500;
const SPEEDS = [
  { label: '아주 느리게 (실제의 1/20)', rate: 1 / 20 },
  { label: '느리게 (실제의 1/10)', rate: 1 / 10 },
  { label: '조금 느리게 (실제의 1/4)', rate: 1 / 4 },
  { label: '실제 속도', rate: 1 },
];

export default function SineBasicsLab() {
  const [amp, setAmp] = useState(1);
  const [freq, setFreq] = useState(5);
  const [phiDeg, setPhiDeg] = useState(0);
  // 반정수 f는 1초에 반 바퀴가 남아 되감을 때 180° 튀므로 그때는 2초 단위로 되감는다(span).
  // '실제 속도'는 화면에서 1초에 6바퀴(60 fps에서 프레임당 0.1바퀴)를 넘으면 거꾸로 보이므로 그 위에서는 느리게 (D-044 §4)
  const speeds = useMemo(() => SPEEDS.map((sp, i) => (i === SPEEDS.length - 1 && freq > 6 ? { rate: 6 / freq, label: `빠르게 (${rateLabel(6 / freq)})` } : sp)), [freq]);
  const [showRef, setShowRef] = useState(true);

  const series = useMemo(() => {
    const cur = evaluateRange({ components: [{ type: 'sine', freq, amp, phase: (phiDeg * Math.PI) / 180 }] }, 0, DURATION, POINTS);
    const ref = evaluateRange({ components: [{ type: 'sine', freq, amp: 1 }] }, 0, DURATION, POINTS);
    return [
      ...(showRef ? [{ x: ref.t, y: ref.x, name: '기준 (A = 1, φ = 0°)', color: '#94a3b8', dash: 'dash' as const, width: 1.5 }] : []),
      { x: cur.t, y: cur.x, name: '내가 만든 정현파', width: 2.5, color: 'var(--plot-1)' },
    ];
  }, [amp, freq, phiDeg, showRef]);

  const arrows = useMemo<PhasorArrow[]>(() => [{ amp, freq, phase: (phiDeg * Math.PI) / 180, color: 'var(--plot-1)', label: 'A' }], [amp, freq, phiDeg]);
  const ghost = useMemo(() => (showRef ? [{ amp: 1, freq, phase: 0 }] : undefined), [showRef, freq]);

  const period = 1 / freq;
  const phiRad = (phiDeg * Math.PI) / 180;
  const shift = (phiDeg / 360) * period; // φ > 0 이면 앞섬(꼭대기가 먼저), φ < 0 이면 늦음
  const shiftText = phiDeg === 0 ? '어긋남 없음' : phiDeg > 0 ? `${texNumber(Math.abs(shift))} s 앞섬` : `${texNumber(Math.abs(shift))} s 늦음`;

  return (
    <LabFrame
      id="LAB-BAS-01"
      title="정현파의 세 숫자: 진폭 · 주파수 · 위상"
      controls={
        <>
          <ParamSlider label="진폭 A" value={amp} min={0.2} max={2} step={0.1} format={(v) => v.toFixed(1)} onChange={setAmp} />
          <ParamSlider label="주파수 f" value={freq} min={1} max={20} step={0.5} unit="Hz" onChange={setFreq} />
          <ParamSlider label="위상 φ" value={phiDeg} min={-180} max={180} step={15} unit="°" onChange={setPhiDeg} />
          <ParamToggle label="기준 파형(점선) 표시" checked={showRef} onChange={setShowRef} />
        </>
      }
      formulas={
        <>
          <Formula display tex={`x(t) = A\\cos(2\\pi f t + \\varphi) = ${texNumber(amp, 2)}\\cos(2\\pi\\cdot ${texNumber(freq)}\\,t ${phiDeg >= 0 ? '+' : '-'} ${texNumber(Math.abs(phiRad), 4)})`} />
          <Formula display tex={`\\theta(t) = 2\\pi f t + \\varphi\\ \\text{(화살표 각도)},\\qquad x(t) = A\\cos\\theta(t)\\ \\text{(끝의 높이)}`} />
          <Formula display tex={`\\varphi = ${phiDeg}^\\circ = ${phiDeg}\\times\\dfrac{\\pi}{180} = ${texNumber(phiRad, 4)}\\ \\mathrm{rad}`} />
          <Formula display tex={`T = \\dfrac{1}{f} = \\dfrac{1}{${texNumber(freq)}} = ${texNumber(period)}\\ \\mathrm{s}`} />
          <Formula display tex={`\\Delta t = \\dfrac{\\varphi}{360^\\circ}\\times T = \\dfrac{${phiDeg}}{360}\\times ${texNumber(period)} = ${texNumber(shift)}\\ \\mathrm{s}`} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '주기 T [s]', value: period },
            { label: '1초에 반복하는 횟수', value: freq, unit: '번' },
            { label: '꼭대기 높이 (Peak)', value: amp },
          ]}
          caption={`읽음값 — 기준 대비 ${shiftText}`}
        />
      }
      tasks={[
        {
          question: '주파수를 5 Hz에서 10 Hz로 올리면 주기 T와 화면 속 물결 개수는 어떻게 될까요?',
          answer: 'T는 0.2 s → 0.1 s로 절반이 되고, 1초 화면 안의 물결은 5개 → 10개로 두 배가 됩니다. f = 1/T.',
        },
        {
          question: '위상을 −90°로 두면 꼭대기가 기준보다 앞에 올까요, 뒤에 올까요? 얼마만큼?',
          answer: '뒤에 옵니다(늦음). 한 주기의 1/4만큼, 5 Hz라면 0.2 s × 1/4 = 0.05 s 늦습니다.',
        },
        {
          question: '위상을 180°로 두면 파형은 기준과 어떤 관계가 될까요?',
          answer: '위아래가 정확히 뒤집힌 모양, 즉 부호가 반대인 정현파가 됩니다 (−A cos(2πft)). 진폭과 주파수는 그대로입니다.',
        },
        {
          question: '위상을 +90°로 두고 “처음으로”를 누르면 화살표는 어디서 출발하나요? 재생하면 파형은 먼저 위로 갈까요, 아래로 갈까요?',
          answer: '위(0°)에서 반시계로 90° 돌아간 왼쪽에서 출발합니다. 높이 0에서 시작해 반시계로 돌며 아래로 내려가므로 파형도 0에서 아래로 내려갑니다. 꼭대기(0°)를 이미 T/4 전에 지나온 셈이라 기준보다 “앞섬”입니다.',
        },
        {
          question: '진폭을 바꾸면 주기가 바뀔까요?',
          answer: '바뀌지 않습니다. 세 숫자는 서로 독립입니다 — 진폭은 높이, 주파수는 빠르기, 위상은 시작 시점만 정합니다.',
        },
      ]}
    >
      <PhasorView
        arrows={arrows}
        ghost={ghost}
        span={Number.isInteger(freq) ? DURATION : 2 * DURATION}
        rMax={2.2}
        speeds={speeds}
        defaultSpeed={1}
        traceLabel="화살표 끝의 높이 = x(t)"
        ariaLabel={`길이 ${amp}, 1초에 ${freq}바퀴 도는 화살표. t = 0에 위에서 반시계로 ${phiDeg}° 돌아간 곳에서 출발하고, 끝의 높이가 오른쪽에 정현파를 그린다.`}
      />
      <p className="anim-caption">
        길이 A인 화살표가 1초에 f 바퀴씩 반시계로 돕니다. 화살표 끝의 <strong>높이</strong>가 그 순간의 x(t)이고, 오른쪽은 그 높이를 시간 순서로 옮겨 적은 것입니다.
        t = 0에 화살표가 위(0°)에서 얼마나 돌아가 있는지가 위상 φ입니다 — 반시계로 돌아가 있으면 +, 시계 쪽이면 −.
        {showRef && ' 회색 점선 화살표는 기준(A = 1, φ = 0°)입니다.'}
      </p>
      <Plot series={series} x={{ label: '시간 t [s]', range: [0, DURATION] }} y={{ label: '진폭', range: [-2.2, 2.2] }} height={280} />
    </LabFrame>
  );
}
