import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { evaluateRange } from '../../lib/dsp/signal';

/** LAB-BAS-01 정현파 3요소 — 진폭·주파수·위상 (P0-2, D-027) */

const DURATION = 1; // s
const POINTS = 1500;

export default function SineBasicsLab() {
  const [amp, setAmp] = useState(1);
  const [freq, setFreq] = useState(5);
  const [phiDeg, setPhiDeg] = useState(0);
  const [showRef, setShowRef] = useState(true);

  const series = useMemo(() => {
    const cur = evaluateRange({ components: [{ type: 'sine', freq, amp, phase: (phiDeg * Math.PI) / 180 }] }, 0, DURATION, POINTS);
    const ref = evaluateRange({ components: [{ type: 'sine', freq, amp: 1 }] }, 0, DURATION, POINTS);
    return [
      ...(showRef ? [{ x: ref.t, y: ref.x, name: '기준 (A = 1, φ = 0°)', color: '#94a3b8', dash: 'dash' as const, width: 1.5 }] : []),
      { x: cur.t, y: cur.x, name: '내가 만든 정현파', width: 2.5 },
    ];
  }, [amp, freq, phiDeg, showRef]);

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
          question: '진폭을 바꾸면 주기가 바뀔까요?',
          answer: '바뀌지 않습니다. 세 숫자는 서로 독립입니다 — 진폭은 높이, 주파수는 빠르기, 위상은 시작 시점만 정합니다.',
        },
      ]}
    >
      <Plot series={series} x={{ label: '시간 t [s]', range: [0, DURATION] }} y={{ label: '진폭', range: [-2.2, 2.2] }} height={280} />
    </LabFrame>
  );
}
