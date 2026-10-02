import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame, { type LabTask } from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { createWindow, windowProperties, type WindowType } from '../../lib/dsp/window';
import { fft, zeroPad } from '../../lib/dsp/fft';

/**
 * LAB-WIN-02 윈도우 8종 비교 & 선택 가이드 (P1-4, Contents §5-1).
 *
 * 목적:
 * 윈도우 8종의 시간영역 모양과 주파수 스펙트럼(|W(f)|)을 직접 겹쳐 비교하며,
 * 메인로브 폭(분해능)과 사이드로브 감쇠율(동적범위)의 트레이드오프를 확인한다.
 */

const WINDOW_OPTIONS: ParamOption<WindowType>[] = [
  { value: 'hann', label: 'Hann (실무 만능 기본값)' },
  { value: 'uniform', label: 'Uniform (사각 윈도우)' },
  { value: 'flatTop', label: 'Flat top (진폭 정확도 특화)' },
  { value: 'blackmanHarris', label: 'Blackman-Harris (초고동적범위 -92 dB)' },
  { value: 'hamming', label: 'Hamming (첫 사이드로브 -42.7 dB)' },
  { value: 'kaiser', label: 'Kaiser (β = 6.0 조정형)' },
  { value: 'exponential', label: 'Exponential (모달 감쇠 보조)' },
  { value: 'force', label: 'Force (해머 펄스 게이트)' },
];

export default function WindowComparisonLab() {
  const [winA, setWinA] = useState<WindowType>('hann');
  const [winB, setWinB] = useState<WindowType>('uniform');

  const n = 512;
  const padN = 4096; // 8x 제로패딩으로 주파수 응답 곡선을 매끄럽게 보간

  const data = useMemo(() => {
    const wA = createWindow(winA, n);
    const wB = createWindow(winB, n);

    const propsA = windowProperties(wA);
    const propsB = windowProperties(wB);

    // 시간영역 축 (0 ~ 1 정규화 시간)
    const timeNorm: number[] = [];
    const valA: number[] = [];
    const valB: number[] = [];
    for (let i = 0; i < n; i++) {
      timeNorm.push(i / n);
      valA.push(wA[i]);
      valB.push(wB[i]);
    }

    // 주파수 응답 계산 (제로패딩 FFT 후 0 dB 정규화)
    const calcResponse = (w: Float64Array) => {
      const padded = zeroPad(w, padN);
      const res = fft(padded);
      const binScale = padN / n; // 8

      // DC 피크 크기
      const peakMag = Math.hypot(res.real[0], res.imag[0]);

      const bins: number[] = [];
      const dbVals: number[] = [];

      // ±10 bin 대역 추출
      const maxBin = 10;
      const step = 1 / binScale;

      for (let k = 0; k <= maxBin * binScale; k++) {
        const bin = k * step;
        const mag = Math.hypot(res.real[k], res.imag[k]);
        const db = 20 * Math.log10(Math.max(1e-5, mag / peakMag));
        bins.push(bin);
        dbVals.push(db);
      }

      // 음수 bin 대칭 복제
      const allBins: number[] = [];
      const allDbs: number[] = [];
      for (let i = bins.length - 1; i > 0; i--) {
        allBins.push(-bins[i]);
        allDbs.push(dbVals[i]);
      }
      for (let i = 0; i < bins.length; i++) {
        allBins.push(bins[i]);
        allDbs.push(dbVals[i]);
      }

      return { bins: allBins, dbs: allDbs };
    };

    const respA = calcResponse(wA);
    const respB = calcResponse(wB);

    return {
      timeNorm,
      valA,
      valB,
      propsA,
      propsB,
      respA,
      respB,
    };
  }, [winA, winB]);

  const timeSeries: PlotSeries[] = [
    {
      x: data.timeNorm,
      y: data.valA,
      name: `윈도우 A (${winA})`,
      color: '#38bdf8',
    },
    {
      x: data.timeNorm,
      y: data.valB,
      name: `윈도우 B (${winB})`,
      color: '#f59e0b',
    },
  ];

  const freqSeries: PlotSeries[] = [
    {
      x: data.respA.bins,
      y: data.respA.dbs,
      name: `스펙트럼 A (${winA})`,
      color: '#38bdf8',
    },
    {
      x: data.respB.bins,
      y: data.respB.dbs,
      name: `스펙트럼 B (${winB})`,
      color: '#f59e0b',
    },
  ];

  const controls = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <ParamSelect
        label="비교 윈도우 A"
        value={winA}
        options={WINDOW_OPTIONS}
        onChange={(v) => setWinA(v as WindowType)}
      />
      <ParamSelect
        label="비교 윈도우 B"
        value={winB}
        options={WINDOW_OPTIONS}
        onChange={(v) => setWinB(v as WindowType)}
      />
    </div>
  );

  const formulas = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Formula
        tex={`\\mathrm{ENBW}_{A} = \\left(\\frac{\\mathrm{ACF}}{\\mathrm{ECF}}\\right)^2 = \\left(\\frac{${texNumber(data.propsA.acf, 3)}}{${texNumber(data.propsA.ecf, 2)}}\\right)^2 = ${texNumber(data.propsA.enbw, 2)}\\ \\mathrm{bin}`}
        display
      />
      <Formula
        tex={`\\mathrm{ENBW}_{B} = \\left(\\frac{\\mathrm{ACF}}{\\mathrm{ECF}}\\right)^2 = \\left(\\frac{${texNumber(data.propsB.acf, 3)}}{${texNumber(data.propsB.ecf, 2)}}\\right)^2 = ${texNumber(data.propsB.enbw, 2)}\\ \\mathrm{bin}`}
        display
      />
    </div>
  );

  const readouts = (
    <ReadoutTable
      rows={[
        { label: `[A:${winA}] 코히어런트 이득 CG`, value: data.propsA.cg, sig: 3 },
        { label: `[A:${winA}] 진폭 보정계수 ACF`, value: data.propsA.acf, sig: 3 },
        { label: `[A:${winA}] 등가잡음대역폭 ENBW`, value: data.propsA.enbw, unit: 'bin', sig: 3 },
        { label: `[A:${winA}] 최대 스캘럽 손실`, value: data.propsA.scallopLossDb, unit: 'dB', sig: 3 },
        { label: `[B:${winB}] 진폭 보정계수 ACF`, value: data.propsB.acf, sig: 3 },
        { label: `[B:${winB}] 등가잡음대역폭 ENBW`, value: data.propsB.enbw, unit: 'bin', sig: 3 },
        { label: `[B:${winB}] 최대 스캘럽 손실`, value: data.propsB.scallopLossDb, unit: 'dB', sig: 3 },
      ]}
    />
  );

  const tasks: LabTask[] = [
    {
      question: '과제 1: 윈도우 A를 Hann, B를 Uniform으로 두고 오른쪽 주파수 응답을 보세요. 사이드로브가 얼마나 차이 나나요?',
      answer: 'Uniform의 최고 사이드로브는 -13.3 dB로 매우 높지만, Hann은 -31.5 dB로 뚝 떨어집니다. 대신 Hann의 메인로브 폭은 ±2 bin으로 Uniform(±1 bin)의 2배가 됩니다.',
    },
    {
      question: '과제 2: 윈도우 B를 Flat top으로 바꿔보세요. 메인로브 꼭대기 모양과 스캘럽 손실은 어떤가요?',
      answer: 'Flat top의 메인로브는 ±5 bin에 걸쳐 완만하게 퍼져 분해능은 낮지만, 스캘럽 손실이 0.01 dB 미만으로 사실상 0입니다! 진폭을 절대적으로 지켜야 하는 밸런싱/교정에 쓰입니다.',
    },
  ];

  return (
    <LabFrame
      id="LAB-WIN-02"
      title="LAB-WIN-02 윈도우 8종 비교 & 선택 가이드"
      controls={controls}
      formulas={formulas}
      readouts={readouts}
      tasks={tasks}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            시간영역 윈도우 형상 w[n] (0 ~ 1 정규화)
          </div>
          <Plot
            series={timeSeries}
            x={{ label: '정규화 시간 (n / N)' }}
            y={{ label: '가중치 w[n]', range: [0, 1.1] }}
            height={200}
          />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
            주파수 응답 |W(f)| (중심 주파수 기준 ±10 bin 대역)
          </div>
          <Plot
            series={freqSeries}
            x={{ label: '주파수 [bin 오프셋]' }}
            y={{ label: '감쇠율 [dB]', range: [-100, 5] }}
            height={240}
          />
        </div>
      </div>
    </LabFrame>
  );
}
