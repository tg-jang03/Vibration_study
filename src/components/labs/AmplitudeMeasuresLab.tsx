import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { crestFactor, peak, rms } from '../../lib/dsp/stats';

/**
 * LAB-BAS-02 진폭을 숫자 하나로: Peak · Pk-Pk · RMS · Crest factor (P1-0)
 * 네 신호 모두 꼭대기 높이(Peak)를 1로 맞춘 뒤 크기 배율을 곱한다 → Peak가 같아도 RMS는 다르다.
 */

type Shape = 'sine' | 'twoSines' | 'square' | 'impulsive';
const SHAPES: ParamOption<Shape>[] = [
  { value: 'sine', label: '정현파 하나 (5 Hz)' },
  { value: 'twoSines', label: '정현파 두 개의 합 (5 Hz + 15 Hz)' },
  { value: 'square', label: '사각파' },
  { value: 'impulsive', label: '짧은 충격이 반복되는 신호' },
];
const DURATION = 0.4; // s
const N = 4000;
const F = 5; // Hz

function rawValue(shape: Shape, t: number): number {
  const w = 2 * Math.PI * F * t;
  switch (shape) {
    case 'sine':
      return Math.cos(w);
    case 'twoSines':
      return Math.cos(w) + 0.6 * Math.cos(3 * w);
    case 'square':
      return Math.cos(w) >= 0 ? 1 : -1;
    case 'impulsive': {
      // 작은 바탕 흔들림 + 0.1 s마다 한 번씩 "탁" 치고 금방 사라지는 울림
      let v = 0.15 * Math.cos(w);
      for (let k = 0; k < 4; k++) {
        const tau = t - (0.03 + 0.1 * k);
        if (tau >= 0) v += Math.exp(-tau / 0.004) * Math.cos(2 * Math.PI * 180 * tau);
      }
      return v;
    }
  }
}

/** 꼭대기 높이(Peak)가 1이 되도록 맞춘 신호 */
function unitPeakSignal(shape: Shape): { t: number[]; x: number[] } {
  const t = Array.from({ length: N }, (_, i) => (i / (N - 1)) * DURATION);
  const raw = t.map((tt) => rawValue(shape, tt));
  const p = peak(raw);
  return { t, x: raw.map((v) => v / p) };
}

export default function AmplitudeMeasuresLab() {
  const [shape, setShape] = useState<Shape>('sine');
  const [scale, setScale] = useState(1);

  const base = useMemo(() => unitPeakSignal(shape), [shape]);

  const view = useMemo(() => {
    const x = base.x.map((v) => scale * v);
    const pk = peak(x);
    const r = rms(x);
    const line = (y: number, name: string, color: string, dash: boolean, hideInLegend = false) => ({
      x: [0, DURATION],
      y: [y, y],
      name,
      color,
      dash: dash ? ('dash' as const) : ('solid' as const),
      width: 1.8,
      hideInLegend,
    });
    return {
      pk,
      pp: Math.max(...x) - Math.min(...x),
      r,
      cf: crestFactor(x),
      series: [
        { x: base.t, y: x, name: '신호', width: 2 },
        line(pk, 'Peak (꼭대기)', '#c47a1d', true),
        line(-pk, '−Peak', '#c47a1d', true, true),
        line(r, 'RMS (실효값)', '#2f855a', false),
      ],
    };
  }, [base, scale]);

  const sineAssumed = view.pk / Math.SQRT2;
  const assumedErr = ((sineAssumed - view.r) / view.r) * 100;

  return (
    <LabFrame
      id="LAB-BAS-02"
      title="진폭을 숫자 하나로: Peak · Pk-Pk · RMS · Crest factor"
      controls={
        <>
          <ParamSelect label="신호 모양" value={shape} options={SHAPES} hint="네 신호 모두 꼭대기 높이를 1로 맞춰 두었습니다" onChange={setShape} />
          <ParamSlider label="크기 배율" value={scale} min={0.5} max={3} step={0.1} format={(v) => v.toFixed(1)} onChange={setScale} />
        </>
      }
      formulas={
        <>
          <Formula display tex={`x_{rms} = \\sqrt{\\overline{x^2}} = ${texNumber(view.r, 3)},\\qquad \\text{Peak} = ${texNumber(view.pk, 3)}`} />
          <Formula display tex={`CF = \\dfrac{\\text{Peak}}{x_{rms}} = \\dfrac{${texNumber(view.pk, 3)}}{${texNumber(view.r, 3)}} = ${texNumber(view.cf, 3)}`} />
          <Formula display tex={`\\text{정현파라고 가정하면 } x_{rms} \\approx \\dfrac{\\text{Peak}}{\\sqrt 2} = ${texNumber(sineAssumed, 3)}`} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: 'Peak', value: view.pk, sig: 3 },
            { label: 'Pk-Pk', value: view.pp, sig: 3 },
            { label: 'RMS (직접 계산)', value: view.r, sig: 3 },
            { label: 'Crest factor', value: view.cf, sig: 3 },
            { label: 'Peak/√2 (정현파 가정 환산)', value: sineAssumed, sig: 3 },
            { label: '환산값의 오차', value: Math.abs(assumedErr) < 0.05 ? 0 : assumedErr, unit: '%', sig: 3 },
          ]}
        />
      }
      tasks={[
        {
          question: '정현파 하나에서 Pk-Pk는 Peak의 몇 배, RMS는 Peak의 몇 배일까요? 크기 배율을 바꿔도 비율이 그대로인지 보세요.',
          answer: 'Pk-Pk = 2 × Peak, RMS = Peak/√2 ≈ 0.707 × Peak, Crest factor = √2 ≈ 1.41. 크기를 바꿔도 비율은 그대로입니다.',
        },
        {
          question: '네 신호 모두 Peak가 1입니다. RMS가 가장 큰 신호와 가장 작은 신호는 무엇일까요?',
          answer:
            '가장 큰 것은 사각파(RMS = 1), 가장 작은 것은 충격 신호입니다. 사각파는 항상 꼭대기 높이에 머물러 있고, 충격 신호는 대부분의 시간 동안 거의 0이라서 평균 에너지가 작습니다.',
        },
        {
          question: '"짧은 충격이 반복되는 신호"에서 Peak/√2로 RMS를 환산하면 실제 RMS와 얼마나 다를까요?',
          answer:
            '약 5배 크게 나옵니다 (오차 약 +420 %). Peak/√2 환산은 정현파 하나일 때만 맞습니다. 정현파 두 개의 합에서도 +37 %, 사각파에서는 반대로 −29 % 어긋납니다. 측정기가 RMS를 직접 계산하는지, Peak에서 환산하는지 꼭 확인해야 하는 이유입니다.',
        },
        {
          question: '네 신호를 Crest factor가 작은 순서로 늘어놓으면?',
          answer: '사각파(1.0) < 정현파 하나(1.41) < 정현파 두 개의 합(약 1.9) < 충격 신호(약 7.4). CF가 클수록 평소 크기에 비해 꼭대기가 뾰족하게 튀는 신호입니다.',
        },
      ]}
    >
      <Plot series={view.series} x={{ label: '시간 t [s]', range: [0, DURATION] }} y={{ label: '진폭', range: [-3.3, 3.3] }} height={280} />
    </LabFrame>
  );
}
