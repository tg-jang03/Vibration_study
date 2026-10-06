import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { acquire } from '../../lib/dsp/sampling';
import type { SignalComponent } from '../../lib/dsp/signal';

/**
 * M1.3 확인용: 공통 랩 부품을 모두 쓰고, 슬라이더 갱신 성능을 잰다.
 * 주소에 ?bench 를 붙이면 열리자마자 벤치마크를 돌리고 결과를 콘솔과 화면에 남긴다.
 * ?bench&n=16384 처럼 샘플 수도 지정할 수 있다.
 */

const FS = 2560; // Hz
const AMP = 1;
const NOISE_RMS = 0.2;
const BENCH_FRAMES = 30;
const N_OPTIONS = [1024, 4096, 16384].map((n) => ({ value: n, label: `${n} 점` }));

interface BenchState {
  n: number;
  samples: number[];
}

export default function LabUiDemo() {
  const [freq, setFreq] = useState(60); // Hz
  const [n, setN] = useState(4096);
  const [noise, setNoise] = useState(false);
  const [plotMs, setPlotMs] = useState<number | null>(null);
  const [benchResult, setBenchResult] = useState<string | null>(null);
  const bench = useRef<BenchState | null>(null);
  const nRef = useRef(n);
  useEffect(() => {
    nRef.current = n;
  });
  // 시간처럼 서버(빌드)와 브라우저에서 값이 달라지는 것은 hydration 뒤에만 보여준다 (React 오류 #418 방지)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const { series, rms, peak, computeMs } = useMemo(() => {
    const start = performance.now();
    const components: SignalComponent[] = [{ type: 'sine', freq, amp: AMP }];
    if (noise) components.push({ type: 'noise', rms: NOISE_RMS, seed: 1 });
    const s = acquire({ components }, { fs: FS, n });
    let sumSq = 0;
    let max = 0;
    for (let i = 0; i < s.x.length; i++) {
      sumSq += s.x[i] * s.x[i];
      max = Math.max(max, Math.abs(s.x[i]));
    }
    return {
      series: [{ x: s.t, y: s.x, name: 'x[n]' }],
      rms: Math.sqrt(sumSq / n),
      peak: max,
      computeMs: performance.now() - start,
    };
  }, [freq, n, noise]);

  const startBench = useCallback(() => {
    const benchN = nRef.current;
    bench.current = { n: benchN, samples: [] };
    setBenchResult(`측정 중… (N = ${benchN}, ${BENCH_FRAMES}회)`);
    setFreq((f) => (f === 20 ? 21 : 20));
  }, []);

  const handleRendered = useCallback((ms: number) => {
    setPlotMs(ms);
    const b = bench.current;
    if (!b) return;
    b.samples.push(ms);
    if (b.samples.length < BENCH_FRAMES) {
      const next = 20 + b.samples.length * 3;
      // rAF는 헤드리스 브라우저에서 돌지 않을 수 있어 setTimeout으로 다음 갱신을 예약한다
      window.setTimeout(() => setFreq(next), 0);
      return;
    }
    bench.current = null;
    const avg = b.samples.reduce((a, v) => a + v, 0) / b.samples.length;
    const max = Math.max(...b.samples);
    const text = `N = ${b.n}: 그리기 평균 ${formatNumber(avg, 3)} ms, 최대 ${formatNumber(max, 3)} ms (${BENCH_FRAMES}회)`;
    setBenchResult(text);
    console.log(`[bench] ${text}`);
  }, []);

  // ?bench 로 열면 첫 그림이 나온 뒤 자동 실행
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('bench')) return;
    const qn = Number(params.get('n'));
    if (N_OPTIONS.some((o) => o.value === qn)) setN(qn);
    const timer = window.setTimeout(startBench, 1500);
    return () => window.clearTimeout(timer);
  }, [startBench]);

  const rmsTheory = Math.sqrt(AMP ** 2 / 2 + (noise ? NOISE_RMS ** 2 : 0));

  return (
    <LabFrame
      id="LAB-UI-DEMO"
      title="공통 랩 부품 확인 · 갱신 성능"
      controls={
        <>
          <ParamSlider label="주파수 f" value={freq} min={1} max={500} step={1} unit="Hz" onChange={setFreq} />
          <ParamSelect label="샘플 수 N" value={n} options={N_OPTIONS} onChange={setN} />
          <ParamToggle label="잡음 추가" checked={noise} hint={`백색 잡음 rms ${NOISE_RMS}`} onChange={setNoise} />
        </>
      }
      formulas={
        <>
          <Formula display tex={`x[n] = A\\cos\\!\\left(2\\pi f \\dfrac{n}{f_s}\\right),\\quad f = ${texNumber(freq)}\\ \\mathrm{Hz}`} />
          <Formula display tex={`T = \\dfrac{N}{f_s} = \\dfrac{${n}}{${FS}} = ${texNumber(n / FS)}\\ \\mathrm{s}`} />
          <Formula display tex={`x_{rms} = \\sqrt{\\dfrac{A^2}{2} + \\sigma^2} = ${texNumber(rmsTheory)}`} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: 'RMS', value: rms, theory: rmsTheory },
            { label: 'Peak', value: peak, theory: noise ? undefined : AMP },
            ...(hydrated ? [{ label: '계산 시간', value: computeMs, unit: 'ms', sig: 3 }] : []),
            ...(plotMs === null ? [] : [{ label: '그리기 시간', value: plotMs, unit: 'ms', sig: 3 }]),
          ]}
        />
      }
      tasks={[
        {
          question: '잡음(rms 0.2)을 켜면 RMS 이론값은 얼마가 될까요?',
          answer: '정현파와 잡음은 서로 상관이 없어서 파워(제곱)가 더해집니다: √(0.5 + 0.04) ≈ 0.735',
        },
        {
          question: '주파수를 바꾸면 RMS 측정값이 이론값에서 조금씩 벗어나는 이유는?',
          answer:
            '프레임(T = N/fs) 안에 정수 주기가 들어가지 않으면 마지막 불완전한 주기 때문에 평균이 달라집니다. 이것이 P2-5 윈도우에서 다룰 누설의 시간영역 모습입니다.',
        },
      ]}
      footer={
        <>
          <button type="button" className="lab-button" onClick={startBench}>
            갱신 성능 측정 ({BENCH_FRAMES}회)
          </button>{' '}
          {benchResult && <span>{benchResult}</span>}
        </>
      }
    >
      <Plot
        series={series}
        x={{ label: '시간 t [s]', range: [0, n / FS] }}
        y={{ label: '진폭', range: [-1.8, 1.8] }}
        onRendered={handleRendered}
        ariaLabel={`${freq} Hz 정현파 ${n}점`}
      />
    </LabFrame>
  );
}
