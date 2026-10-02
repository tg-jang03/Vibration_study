import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import ParamSlider from '../ui/ParamSlider';
import Plot from '../ui/Plot';
import { texNumber } from '../../lib/format';
import { evaluateRange } from '../../lib/dsp/signal';

/**
 * M0.4 검증용 데모: 슬라이더 → 플롯 → 살아있는 수식.
 * 랩 구조(조작 → 플롯 → 수식 → 과제)의 시제품이다.
 */

const DURATION = 0.5; // s
const POINTS = 2000;

export default function SineDemo() {
  const [freq, setFreq] = useState(10); // Hz
  const [amp, setAmp] = useState(1);

  const series = useMemo(() => {
    const { t, x } = evaluateRange({ components: [{ type: 'sine', freq, amp }] }, 0, DURATION, POINTS);
    return [{ x: t, y: x, name: 'x(t)' }];
  }, [freq, amp]);

  const period = 1 / freq;

  return (
    <section className="lab" aria-label="정현파 데모">
      <div className="lab-controls">
        <ParamSlider label="주파수 f" value={freq} min={1} max={50} step={0.5} unit="Hz" onChange={setFreq} />
        <ParamSlider label="진폭 A" value={amp} min={0.1} max={2} step={0.1} format={(v) => v.toFixed(1)} onChange={setAmp} />
      </div>

      <Plot
        series={series}
        x={{ label: '시간 t [s]', range: [0, DURATION] }}
        y={{ label: '진폭', range: [-2.2, 2.2] }}
        ariaLabel={`진폭 ${amp}, 주파수 ${freq} Hz 정현파`}
      />

      <div className="lab-formulas">
        <Formula display tex={`x(t) = A\\cos(2\\pi f t) = ${texNumber(amp, 2)}\\,\\cos(2\\pi \\cdot ${texNumber(freq)}\\,t)`} />
        <Formula display tex={`T = \\dfrac{1}{f} = \\dfrac{1}{${texNumber(freq)}} = ${texNumber(period)}\\ \\mathrm{s}`} />
      </div>
    </section>
  );
}
