import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { supportProperties, SUPPORT_EXAMPLE } from '../../lib/machine/supportModel';

export default function SupportStiffnessLab() {
  const [supportMN, setSupportMN] = useState(1);
  const [mass, setMass] = useState(100);
  const properties = supportProperties({ ...SUPPORT_EXAMPLE, mass, supportStiffness: supportMN * 1e6 });
  const series = useMemo<PlotSeries[]>(() => {
    const x = Array.from({ length: 199 }, (_, i) => 0.1 + i * 0.05);
    return [
      { x, y: x.map((k) => supportProperties({ ...SUPPORT_EXAMPLE, mass, supportStiffness: k * 1e6 }).frequencyHz), name: '직렬 예제의 고유진동수', color: 'var(--plot-1)' },
      { x: [0.1, 10], y: [properties.rigidSupportFrequencyHz, properties.rigidSupportFrequencyHz], name: '지지 강성 무한대 극한', color: 'var(--plot-2)', dash: 'dash' },
      { x: [supportMN], y: [properties.frequencyHz], name: '현재 값', color: 'var(--plot-3)', mode: 'markers', markerSize: 10 },
    ];
  }, [mass, supportMN, properties.frequencyHz, properties.rigidSupportFrequencyHz]);

  return (
    <LabFrame id="LAB-SUP-01" title="받침대를 단단하게 하면 어디까지 바뀔까?"
      controls={<>
        <ParamSlider label="지지 강성 k_sup" value={supportMN} min={0.1} max={10} step={0.05} unit="MN/m" onChange={setSupportMN} />
        <ParamSlider label="질량 m" value={mass} min={50} max={200} step={10} unit="kg" onChange={setMass} />
        <button type="button" className="lab-button" onClick={() => { setSupportMN(1); setMass(100); }}>처음 값</button>
      </>}
      formulas={<>
        <Formula display tex={`\\frac{1}{k_{eq}}=\\frac{1}{10^6}+\\frac{1}{2\\times10^6}+\\frac{1}{${texNumber(supportMN * 1e6, 4)}}\\quad [\\mathrm{m/N}]`} />
        <Formula display tex={`f_n=\\frac{1}{2\\pi}\\sqrt{\\frac{${texNumber(properties.stiffness, 4)}}{${texNumber(mass, 4)}}}=${texNumber(properties.frequencyHz, 4)}\\ \\mathrm{Hz}`} />
      </>}
      readouts={<ReadoutTable caption="한 방향 직렬 예제 (축 1, 베어링 2 MN/m 고정)" rows={[
        { label: '등가 강성 k_eq', value: properties.stiffness / 1e6, unit: 'MN/m', sig: 4 },
        { label: '고유진동수 fₙ', value: properties.frequencyHz, unit: 'Hz', sig: 4 },
        { label: '지지 강성 무한대 fₙ', value: properties.rigidSupportFrequencyHz, unit: 'Hz', sig: 4 },
      ]} />}
      tasks={[
        { question: 'm = 100 kg에서 지지 강성을 1 → 0.25 MN/m로 낮추면?', answer: '고유진동수가 약 10.07 → 6.786 Hz로 내려갑니다. 로터 질량과 축의 강성을 바꾸지 않아도 지지의 변형이 영향을 줍니다.' },
        { question: '지지를 4 MN/m로 키우면 1 MN/m 때의 fₙ이 두 배가 되나요?', answer: '아닙니다. 약 12.03 Hz입니다. 축과 베어링에도 변형이 남아 있어, 이 모델의 극한은 약 12.99 Hz입니다.' },
        { question: '초기화하고 질량만 200 kg으로 바꾸면?', answer: '등가 강성은 같고 fₙ은 1/√2배인 약 7.118 Hz가 됩니다.' },
      ]}
      footer={<p>같은 힘을 받는 무질량 직렬 스프링 3개와 질량 1개의 교육용 모델입니다. 실제 축계의 베어링 배치·방향·분포 질량·감쇠·회전 효과는 계산하지 않습니다.</p>}
    >
      <Plot series={series} x={{ label: '지지 강성 k_sup [MN/m]', range: [0.1, 10] }} y={{ label: '고유진동수 fₙ [Hz]', range: [0, 19] }} height={300} ariaLabel="지지 강성이 커지면 고유진동수가 증가하지만 축과 베어링의 변형 때문에 극한에 가까워지는 곡선" />
    </LabFrame>
  );
}
