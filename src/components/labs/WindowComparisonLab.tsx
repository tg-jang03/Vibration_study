import { useMemo, useState } from 'react';
import LabFrame, { type LabTask } from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { createWindow, windowProperties, type WindowType } from '../../lib/dsp/window';
import { fft, zeroPad } from '../../lib/dsp/fft';

/**
 * LAB-WIN-02 윈도우 비교: 메인로브 폭과 사이드로브 높이 (P1-4, Contents §5-1).
 *
 * 두 윈도우의 시간 모양과, 성분 하나가 그 윈도우에서 그려지는 모양(|W|)을 겹쳐 비교한다.
 * 읽음값은 본문에서 설명한 세 숫자(메인로브 반폭, 가장 높은 사이드로브, 가리비 손실)만 쓴다.
 * 큰 성분 옆 작은 성분이 보이는지는 본문 그림 7(동적 범위)로 보여 준다.
 */

type Win = 'uniform' | 'hann' | 'flatTop' | 'blackmanHarris' | 'hamming';
const WINDOW_OPTIONS: ParamOption<Win>[] = [
  { value: 'hann', label: 'Hann (분석기 기본값)' },
  { value: 'uniform', label: '윈도우 없음 (Uniform)' },
  { value: 'flatTop', label: 'Flat top (진폭 측정용)' },
  { value: 'blackmanHarris', label: 'Blackman-Harris (작은 성분 찾기용)' },
  { value: 'hamming', label: 'Hamming (Hann과 비슷, 첫 사이드로브가 더 낮음)' },
];
const NAME: Record<Win, string> = {
  hann: 'Hann',
  uniform: '윈도우 없음',
  flatTop: 'Flat top',
  blackmanHarris: 'Blackman-Harris',
  hamming: 'Hamming',
};
const N = 512;
const PAD = 16;
const SPAN = 12; // bin

function analyze(type: WindowType) {
  const w = createWindow(type, N);
  const r = fft(zeroPad(w, N * PAD));
  const dc = Math.hypot(r.real[0], r.imag[0]);
  const count = SPAN * PAD + 1;
  const offset = Array.from({ length: count }, (_, k) => k / PAD);
  const db = offset.map((_, k) => Math.max(-140, 20 * Math.log10(Math.max(1e-12, Math.hypot(r.real[k], r.imag[k]) / dc))));
  // 메인로브 반폭: 가운데에서 처음으로 값이 다시 커지기 시작하는 곳(첫 골)
  let first = count - 1;
  for (let k = 1; k < count - 1; k++) {
    if (db[k] < db[k - 1] && db[k] <= db[k + 1]) {
      first = k;
      break;
    }
  }
  const side = Math.max(...db.slice(first + 1));
  const props = windowProperties(w);
  const time = Array.from({ length: N / 4 + 1 }, (_, i) => i / (N / 4));
  const shape = time.map((t) => w[Math.min(N - 1, Math.round(t * N))]);
  return {
    time,
    shape,
    offset: [...offset.slice(1).reverse().map((x) => -x), ...offset],
    db: [...db.slice(1).reverse(), ...db],
    halfWidth: first / PAD,
    side: Math.round(side * 10) / 10,
    scallop: props.scallopLossDb,
  };
}

export default function WindowComparisonLab() {
  const [winA, setWinA] = useState<Win>('hann');
  const [winB, setWinB] = useState<Win>('uniform');
  const a = useMemo(() => analyze(winA), [winA]);
  const b = useMemo(() => analyze(winB), [winB]);

  const timeSeries: PlotSeries[] = [
    { x: a.time, y: a.shape, name: `A: ${NAME[winA]}`, color: '#38bdf8', width: 2 },
    { x: b.time, y: b.shape, name: `B: ${NAME[winB]}`, color: '#f59e0b', width: 2 },
  ];
  const freqSeries: PlotSeries[] = [
    { x: a.offset, y: a.db, name: `A: ${NAME[winA]}`, color: '#38bdf8', width: 1.6 },
    { x: b.offset, y: b.db, name: `B: ${NAME[winB]}`, color: '#f59e0b', width: 1.6 },
  ];

  const controls = (
    <>
      <ParamSelect label="윈도우 A" value={winA} options={WINDOW_OPTIONS} onChange={setWinA} />
      <ParamSelect label="윈도우 B" value={winB} options={WINDOW_OPTIONS} onChange={setWinB} />
    </>
  );

  const readouts = (
    <ReadoutTable
      rows={[
        { label: `A ${NAME[winA]}: 메인로브 반폭 (첫 0까지)`, value: a.halfWidth, unit: 'bin', sig: 3 },
        { label: `A ${NAME[winA]}: 가장 높은 사이드로브`, value: a.side, unit: 'dB', sig: 3 },
        { label: `A ${NAME[winA]}: 최대 가리비 손실`, value: a.scallop, unit: 'dB', sig: 3 },
        { label: `B ${NAME[winB]}: 메인로브 반폭 (첫 0까지)`, value: b.halfWidth, unit: 'bin', sig: 3 },
        { label: `B ${NAME[winB]}: 가장 높은 사이드로브`, value: b.side, unit: 'dB', sig: 3 },
        { label: `B ${NAME[winB]}: 최대 가리비 손실`, value: b.scallop, unit: 'dB', sig: 3 },
      ]}
    />
  );

  const tasks: LabTask[] = [
    {
      question: 'A를 Hann, B를 윈도우 없음으로 두고 아래 그래프를 보세요. 메인로브 폭과 사이드로브 높이는 각각 어느 쪽이 유리한가요?',
      answer: '메인로브는 윈도우 없음이 좁고(±1 bin, Hann ±2 bin), 사이드로브는 Hann이 훨씬 낮습니다(−31.5 dB vs −13.3 dB). 가까운 두 성분 가르기에는 좁은 쪽이, 큰 성분 옆 작은 성분 찾기에는 낮은 쪽이 유리합니다.',
    },
    {
      question: 'B를 Flat top으로 바꾸세요. 가리비 손실과 메인로브 폭은 어떤가요?',
      answer: '가리비 손실은 약 0.01 dB로 거의 없지만, 메인로브가 ±5 bin으로 가장 넓습니다. 진폭을 정확히 읽을 때 쓰고, 가까운 성분을 가를 때는 쓰지 않습니다.',
    },
    {
      question: 'B를 Blackman-Harris로 바꾸세요. Hann과 비교해 얻는 것과 잃는 것은?',
      answer: '사이드로브가 −92 dB까지 내려가 큰 성분 옆의 아주 작은 성분이 보이지만(본문 그림 7), 메인로브가 ±4 bin으로 Hann의 두 배입니다.',
    },
  ];

  return (
    <LabFrame id="LAB-WIN-02" title="윈도우 비교: 메인로브와 사이드로브" controls={controls} readouts={readouts} tasks={tasks}>
      <h4>윈도우 모양 (프레임 시작 0 → 끝 1)</h4>
      <Plot series={timeSeries} x={{ label: '프레임 안의 위치' }} y={{ label: '가중치', range: [0, 1.1] }} height={200} ariaLabel="윈도우 가중치 모양" />
      <h4>성분 하나가 그려지는 모양 (성분에서 ±12 bin)</h4>
      <Plot series={freqSeries} x={{ label: '성분에서 떨어진 거리 [bin]' }} y={{ label: '[dB]', range: [-130, 5] }} height={250} ariaLabel="윈도우의 주파수 모양" />
    </LabFrame>
  );
}
