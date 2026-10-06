import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { acquire } from '../../lib/dsp/sampling';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';

/** LAB-FOU-01 (c) 제로패딩 vs 측정 시간 — 제로패딩은 분해능을 올리지 않는다 (P2-2) */

const FS = 32; // Hz
const F1 = 8.3; // Hz (bin 중심에서 벗어나게)
const N_OPTIONS = [32, 64, 128].map((n) => ({ value: n, label: `N = ${n} (T = ${n / FS} s)` }));
const PAD_OPTIONS = [1, 2, 4, 8, 16].map((p) => ({ value: p, label: p === 1 ? '없음 (×1)' : `×${p}` }));

/** 구간 안 극댓값 중 최댓값의 30 % 이상인 것의 개수 */
function countPeaks(freq: Float64Array, amp: Float64Array, lo: number, hi: number): number {
  let max = 0;
  for (let i = 0; i < freq.length; i++) if (freq[i] >= lo && freq[i] <= hi) max = Math.max(max, amp[i]);
  let count = 0;
  for (let i = 1; i < freq.length - 1; i++) {
    if (freq[i] < lo || freq[i] > hi) continue;
    if (amp[i] >= 0.3 * max && amp[i] > amp[i - 1] && amp[i] >= amp[i + 1]) count++;
  }
  return count;
}

export default function ZeroPaddingLab() {
  const [delta, setDelta] = useState(0.5); // Hz — 1/T보다 좁게 시작 (1 Hz는 위상에 따라 갈라져 보이는 경계)
  const [n, setN] = useState(32);
  const [pad, setPad] = useState(1);

  const view = useMemo(() => {
    const f2 = F1 + delta;
    const s = acquire(
      { components: [{ type: 'sine', freq: F1, amp: 1 }, { type: 'sine', freq: f2, amp: 1 }] },
      { fs: FS, n },
    );
    const base = singleSidedSpectrum(s);
    const padded = singleSidedSpectrum(s, { fftSize: n * pad });
    const shown = pad > 1 ? padded : base;
    return {
      f2,
      base,
      padded,
      peaks: countPeaks(shown.frequency, shown.amplitude, F1 - 2, f2 + 2),
    };
  }, [delta, n, pad]);

  const df = FS / n;
  const spacing = FS / (n * pad);
  const xRange: [number, number] = [F1 - 4, view.f2 + 4];

  return (
    <LabFrame
      id="LAB-FOU-01 (c)"
      title="제로패딩 vs 측정 시간: 무엇이 두 성분을 갈라놓나"
      controls={
        <>
          <ParamSlider
            label="두 톤 간격 Δ"
            value={delta}
            min={0.5}
            max={4}
            step={0.1}
            unit="Hz"
            format={(v) => v.toFixed(1)}
            onChange={setDelta}
          />
          <ParamSelect label="제로패딩 배수 P" value={pad} options={PAD_OPTIONS} onChange={setPad} />
          <ParamSelect label="샘플 수 N (측정 시간)" value={n} options={N_OPTIONS} onChange={setN} />
        </>
      }
      formulas={
        <>
          <Formula display tex={`\\Delta f = \\dfrac{f_s}{N} = \\dfrac{${FS}}{${n}} = ${texNumber(df)}\\ \\mathrm{Hz}\\quad \\text{(분해능, } T = N/f_s = ${texNumber(n / FS)}\\ \\mathrm{s)}`} />
          <Formula display tex={`\\text{표시 간격} = \\dfrac{f_s}{P\\,N} = \\dfrac{${FS}}{${pad}\\cdot ${n}} = ${texNumber(spacing)}\\ \\mathrm{Hz}`} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '두 톤 간격 Δ', value: delta, unit: 'Hz' },
            { label: '간격 ÷ 분해능 (bin 수)', value: delta / df },
            { label: '보이는 피크 수', value: view.peaks },
            { label: '실제 톤 수', value: 2 },
          ]}
        />
      }
      tasks={[
        {
          question: 'Δ = 0.5 Hz, N = 32(1초)에서 제로패딩을 ×1 → ×16으로 늘리면 두 피크로 갈라질까요?',
          answer:
            '갈라지지 않습니다. 곡선이 매끈해질 뿐 둔덕은 하나이고, 꼭대기도 두 톤 사이(약 8.55 Hz)의 엉뚱한 곳에 생깁니다. 제로패딩은 1초 데이터에 이미 들어 있던 모양을 촘촘히 그릴 뿐 새 정보를 만들지 않습니다.',
        },
        {
          question: '패딩은 그대로 두고 N을 128로(측정 시간 4초) 바꾸면?',
          answer:
            '두 봉우리로 갈라지고 위치도 8.3·8.8 Hz 가까이로 옵니다. 톤 하나가 만드는 둔덕의 폭(약 2/T)이 T가 길어질수록 좁아지기 때문입니다. "가까운 성분을 가르려면 오래 잰다" (P2-4).',
        },
        {
          question: '이번엔 Δ = 1 Hz, N = 32, 제로패딩 ×16으로 두세요. 두 봉우리처럼 보이나요? 봉우리 위치는 실제 톤 위치(점선)와 맞나요?',
          answer:
            '골이 생겨 두 봉우리처럼 보입니다. 하지만 봉우리가 약 8.1 Hz와 9.5 Hz로 실제(8.3, 9.3 Hz)에서 벗어나 있습니다. 간격이 1/T 근처면 두 둔덕이 겹친 모양이 위상에 따라 달라지는 경계 상태입니다. 패딩한 곡선의 골만 보고 "분리됐다"고 판단하면 안 되는 이유입니다.',
        },
        {
          question: '그렇다면 제로패딩은 어디에 쓸까요?',
          answer:
            '피크 하나의 주파수·진폭을 bin 사이에서 더 정확히 읽을 때(보간), 스펙트럼 모양을 매끈하게 볼 때, FFT 크기를 2의 거듭제곱으로 맞출 때 씁니다.',
        },
      ]}
    >
      <Plot
        series={[
          ...(pad > 1
            ? [{ x: view.padded.frequency, y: view.padded.amplitude, name: `제로패딩 ×${pad} (표시 간격 ${texNumber(spacing)} Hz)`, width: 2 }]
            : []),
          {
            x: view.base.frequency,
            y: view.base.amplitude,
            name: `원래 bin (Δf = ${texNumber(df)} Hz)`,
            kind: 'bar' as const,
            barWidth: df * 0.35,
          },
          { x: [F1, F1], y: [0, 1.2], name: '실제 톤 위치', dash: 'dot', width: 1, color: 'gray' },
          { x: [view.f2, view.f2], y: [0, 1.2], name: '실제 톤 위치 2', dash: 'dot', width: 1, color: 'gray', hideInLegend: true },
        ]}
        x={{ label: '주파수 [Hz]', range: xRange }}
        y={{ label: '진폭 (Pk)', range: [0, 1.3] }}
        height={300}
      />
    </LabFrame>
  );
}
