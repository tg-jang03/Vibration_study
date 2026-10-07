import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { averageCross, coherence, cxAbs, cxArg, frfH1, frfH2 } from '../../lib/dsp/twoChannel';
import { ANTI_F, FREQS, frfFrames, TRUE_H } from '../../lib/xchDemo';

/**
 * LAB-XCH-01 FRF 추정과 코히어런스 (P5-3, Contents §5-1b).
 * 신호: src/lib/xchDemo.ts (본문 그림 1 ~ 4와 같은 받침대·시드), 계산: src/lib/dsp/twoChannel.ts.
 */

const MS = [1, 4, 16, 64, 256].map((m) => ({ value: m, label: `${m}장` }));
const NOISE = [0, 0.05, 0.1, 0.3].map((v) => ({ value: v, label: `${v * 100} %` }));
const F = Array.from(FREQS);
const K80 = FREQS.indexOf(80);
const KA = FREQS.indexOf(ANTI_F);
const TRUE_MAG = cxAbs(TRUE_H);
const db = (v: number) => 20 * Math.log10(Math.max(v, 1e-6));
const deg = (r: number) => (r * 180) / Math.PI;

export default function FrfLab() {
  const [m, setM] = useState(16);
  const [outN, setOutN] = useState(0.1);
  const [inN, setInN] = useState(0);

  const r = useMemo(() => {
    const { x, y } = frfFrames({ frames: m, inputNoise: inN, outputNoise: outN });
    const g = averageCross(x, y);
    const h1 = frfH1(g);
    const h2 = frfH2(g);
    return { h1, h2, m1: cxAbs(h1), m2: cxAbs(h2), coh: coherence(g) };
  }, [m, outN, inN]);

  const magSeries: PlotSeries[] = [
    { x: F, y: Array.from(TRUE_MAG, db), name: '참 FRF', color: 'var(--text-muted)', dash: 'dash', width: 1.8 },
    { x: F, y: Array.from(r.m1, db), name: 'H1', color: 'var(--plot-1)', width: 1.8 },
    { x: F, y: Array.from(r.m2, db), name: 'H2', color: 'var(--plot-2)', width: 1.6 },
  ];
  const phaseSeries: PlotSeries[] = [
    { x: F, y: Array.from(cxArg(TRUE_H), deg), name: '참 FRF', color: 'var(--text-muted)', dash: 'dash', width: 1.6 },
    { x: F, y: Array.from(cxArg(r.h1), deg), name: 'H1 위상', color: 'var(--plot-1)', width: 1.6 },
  ];
  const cohSeries: PlotSeries[] = [{ x: F, y: Array.from(r.coh), name: 'γ²', color: 'var(--plot-3)', width: 1.8 }];

  return (
    <LabFrame
      id="LAB-XCH-01"
      title="FRF 추정과 코히어런스"
      controls={
        <>
          <ParamSelect label="평균한 프레임 수 M" value={m} options={MS} onChange={(v) => setM(Number(v))} />
          <ParamSelect label="응답 쪽 잡음 (응답 평균 크기 대비)" value={outN} options={NOISE} onChange={(v) => setOutN(Number(v))} />
          <ParamSelect label="힘 쪽 잡음 (힘 크기 대비)" value={inN} options={NOISE} onChange={(v) => setInN(Number(v))} />
        </>
      }
      formulas={
        <>
          <Formula display tex={`H_1 = \\dfrac{G_{xy}}{G_{xx}},\\quad H_2 = \\dfrac{G_{yy}}{G_{yx}},\\quad \\gamma^2 = \\dfrac{\\lvert G_{xy}\\rvert^2}{G_{xx}G_{yy}} = \\dfrac{\\lvert H_1\\rvert}{\\lvert H_2\\rvert}`} />
          <Formula display tex={`${ANTI_F}\\,\\mathrm{Hz}:\\ \\gamma^2 = \\dfrac{${texNumber(r.m1[KA], 3)}}{${texNumber(r.m2[KA], 3)}} = ${texNumber(r.coh[KA], 3)}`} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '80 Hz (공진) H1', value: r.m1[K80], theory: TRUE_MAG[K80], sig: 3 },
            { label: '80 Hz (공진) H2', value: r.m2[K80], theory: TRUE_MAG[K80], sig: 3 },
            { label: `${ANTI_F} Hz (반공진) H1`, value: r.m1[KA], theory: TRUE_MAG[KA], sig: 3 },
            { label: `${ANTI_F} Hz (반공진) H2`, value: r.m2[KA], theory: TRUE_MAG[KA], sig: 3 },
            { label: `${ANTI_F} Hz 코히어런스 γ²`, value: r.coh[KA], sig: 3 },
            { label: '80 Hz 코히어런스 γ²', value: r.coh[K80], sig: 3 },
          ]}
        />
      }
      tasks={[
        {
          question: '응답 쪽 잡음 10 %에서 M을 16 → 256으로 늘리면 반공진의 H1과 H2는 각각 참값(0.177)에 가까워지나요?',
          answer: 'H1은 0.275 → 0.153으로 참값 쪽으로 모입니다(평균할수록 흔들림이 줄어듦). H2는 1.23 → 1.90으로 오히려 더 멀어집니다. 응답 쪽 잡음이 G_yy에 쌓이는 쏠림이라 평균으로 줄지 않기 때문입니다.',
        },
        {
          question: '힘 쪽 잡음만 30 %로 두면 80 Hz의 H1은 참값(16.7)의 몇 배가 되나요? 평균 수를 바꾸면?',
          answer: '약 1/(1 + 0.3²) = 0.917배, 15.4 근처입니다. 평균 수를 늘려도 이 비율은 그대로이고 흔들림만 줄어듭니다. 이 경우는 H2가 참값에 맞습니다.',
        },
      ]}
    >
      <Plot series={magSeries} x={{ label: '주파수 [Hz]', range: [0, 400] }} y={{ label: '크기 [dB]', range: [-30, 40] }} height={240} ariaLabel="FRF 크기: 참값, H1, H2" />
      <Plot series={phaseSeries} x={{ label: '주파수 [Hz]', range: [0, 400] }} y={{ label: '위상 [°]', range: [-190, 190] }} height={170} ariaLabel="FRF 위상" />
      <Plot series={cohSeries} x={{ label: '주파수 [Hz]', range: [0, 400] }} y={{ label: 'γ²', range: [0, 1.05] }} height={170} ariaLabel="코히어런스" />
    </LabFrame>
  );
}
