import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { bestFrameSeconds, smearWidth, stft } from '../../lib/dsp/stft';
import type { WindowType } from '../../lib/dsp/window';
import { RAMP_RATE, RUN, rpmAt, runSignal, trueX1 } from '../../lib/stftDemo';

/**
 * LAB-STFT-01 스펙트로그램 · 워터폴 · 캐스케이드 (P5-2, Contents §5-1b).
 * 신호: src/lib/stftDemo.ts (본문 그림 1 ~ 5와 같은 기동), STFT: src/lib/dsp/stft.ts.
 */

type View = 'spec' | 'waterfall' | 'cascade';
const NS = [128, 256, 512, 1024, 2048, 4096].map((n) => ({ value: n, label: `${n} (T = ${n / RUN.fs} s, Δf = ${RUN.fs / n} Hz)` }));
const OVERLAPS = [
  { value: 0, label: '0 %' },
  { value: 0.5, label: '50 %' },
  { value: 0.75, label: '75 %' },
  { value: 0.9, label: '90 %' },
];
const WINDOWS: { value: WindowType; label: string }[] = [
  { value: 'hann', label: 'Hann' },
  { value: 'uniform', label: '사각 (윈도우 없음)' },
];
const VIEWS: { value: View; label: string }[] = [
  { value: 'spec', label: '스펙트로그램 (색 지도)' },
  { value: 'waterfall', label: '워터폴 (세로 = 시간)' },
  { value: 'cascade', label: '캐스케이드 (세로 = 회전수)' },
];
const F_MAX = 130;
const SIGNALS = { on: runSignal({ instability: true }), off: runSignal({ instability: false }) };
const db = (v: number) => 20 * Math.log10(Math.max(v * 1e6, 1e-3));

export default function StftLab() {
  const [n, setN] = useState(512);
  const [overlap, setOverlap] = useState(0.5);
  const [win, setWin] = useState<WindowType>('hann');
  const [view, setView] = useState<View>('spec');
  const [instab, setInstab] = useState(true);

  const S = useMemo(() => stft((instab ? SIGNALS.on : SIGNALS.off).x, RUN.fs, { n, overlap, window: win, fMax: F_MAX }), [n, overlap, win, instab]);

  // 20 s에 가장 가까운 프레임의 1X 봉우리
  const read = useMemo(() => {
    let m = 0;
    for (let j = 1; j < S.times.length; j++) if (Math.abs(S.times[j] - 20) < Math.abs(S.times[m] - 20)) m = j;
    const f1 = rpmAt(S.times[m]) / 60;
    let peak = 0;
    for (let k = Math.max(0, Math.floor((f1 - 6) / S.df)); k <= Math.min(S.freqs.length - 1, Math.ceil((f1 + 6) / S.df)); k++) peak = Math.max(peak, S.amp[m][k]);
    return { t: S.times[m], peak: peak * 1e6, truth: trueX1(rpmAt(S.times[m])) * 1e6 };
  }, [S]);

  const heat = useMemo(() => (view === 'spec' ? { x: Array.from(S.freqs), y: Array.from(S.times), z: S.amp.map((row) => Array.from(row, db)), zRange: [-6, 34] as [number, number], colorLabel: 'dB re 1 µm' } : undefined), [S, view]);

  const lines = useMemo((): PlotSeries[] => {
    if (view === 'spec') return [];
    // 프레임을 2초 간격 정도로 골라 쌓는다
    const step = Math.max(1, Math.round(2 / (S.hop / RUN.fs)));
    const freqs = Array.from(S.freqs);
    const out: PlotSeries[] = [];
    for (let m = 0; m < S.times.length; m += step) {
      const base = view === 'waterfall' ? S.times[m] : rpmAt(S.times[m]);
      const k = view === 'waterfall' ? 0.13 : 4.5;
      out.push({ x: freqs, y: Array.from(S.amp[m], (v) => base + v * 1e6 * k), color: 'var(--plot-1)', width: 1, hideInLegend: true });
    }
    return out;
  }, [S, view]);

  const T = n / RUN.fs;
  const move = RAMP_RATE * T;
  const best = bestFrameSeconds(RAMP_RATE);

  return (
    <LabFrame
      id="LAB-STFT-01"
      title="스펙트로그램 · 워터폴 · 캐스케이드"
      controls={
        <>
          <ParamSelect label="프레임 길이 N" value={n} options={NS} onChange={(v) => setN(Number(v))} />
          <ParamSelect label="겹침" value={overlap} options={OVERLAPS} onChange={(v) => setOverlap(Number(v))} />
          <ParamSelect label="윈도우" value={win} options={WINDOWS} onChange={setWin} />
          <ParamSelect label="보기" value={view} options={VIEWS} onChange={setView} />
          <ParamToggle label="불안정 성분 (오일 휠 → 휩)" checked={instab} onChange={setInstab} hint="2400 rpm부터 0.45X, 3333 rpm부터 25 Hz에 잠김" />
        </>
      }
      formulas={
        <>
          <Formula display tex={`T = \\dfrac{N}{f_s} = \\dfrac{${n}}{${RUN.fs}} = ${texNumber(T, 3)}\\ \\mathrm{s},\\quad \\Delta f = \\dfrac{1}{T} = ${texNumber(1 / T, 3)}\\ \\mathrm{Hz},\\quad \\mathrm{hop} = ${S.hop}\\ (${texNumber(S.hop / RUN.fs, 3)}\\ \\mathrm{s})`} />
          <Formula display tex={`\\text{번짐} \\approx \\max\\!\\left(\\dfrac{1}{T},\\ aT\\right) = \\max(${texNumber(1 / T, 3)},\\ ${texNumber(move, 3)}) = ${texNumber(smearWidth(RAMP_RATE, T), 3)}\\ \\mathrm{Hz},\\quad T_{best} = \\dfrac{1}{\\sqrt{${RAMP_RATE}}} = ${texNumber(best, 3)}\\ \\mathrm{s}`} />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '프레임 수', value: S.times.length, sig: 4 },
            { label: '프레임 동안 1X가 움직인 폭 aT', value: move, unit: 'Hz', sig: 3 },
            { label: `${texNumber(read.t, 3)} s 1X 봉우리`, value: read.peak, theory: read.truth, unit: 'µm', sig: 3 },
          ]}
        />
      }
      tasks={[
        {
          question: 'N을 128 → 512 → 4096으로 바꾸며 20 s 1X 봉우리를 읽어 보세요. 실제 값(16.3 µm)에 가장 가까운 것은?',
          answer: '128은 15.6, 512는 16.1, 4096은 3.65 µm입니다. 4096(8 s)은 한 프레임 동안 1X가 10 Hz 움직여 봉우리가 크게 낮아집니다. 1X가 1.25 Hz/s로 오르므로 T_best = 0.89 s, 곧 N = 512 근처가 가장 또렷합니다.',
        },
        {
          question: '겹침을 0 % → 90 %로 바꾸면 줄의 굵기가 바뀌나요? 무엇이 바뀌나요?',
          answer: '줄의 굵기(주파수 쪽)는 그대로입니다. 프레임 길이가 같기 때문입니다. 바뀌는 것은 장 수와 세로 칸의 간격(hop)이라, 그림이 세로로 매끄러워집니다. 겹친 장은 완전히 새 정보가 아닙니다(P2-6 §5.2).',
        },
        {
          question: '보기를 캐스케이드로 두고 "불안정 성분"을 켰다 껐다 해 보세요. 40 s 뒤 3600 rpm 높이에서 무엇이 달라지나요? 워터폴에서는?',
          answer: '켜면 3600 rpm 높이에 25 Hz 봉우리가 생기지만, 캐스케이드에서는 유지한 20초가 한 높이에 겹쳐 그 봉우리가 자라는 과정이 보이지 않습니다. 워터폴에서는 40 → 60 s 동안 25 Hz가 7.7 → 14.0 µm로 자라는 것이 보입니다.',
        },
      ]}
    >
      {view === 'spec' ? (
        <Plot series={[]} heatmap={heat} x={{ label: '주파수 [Hz]', range: [0, F_MAX] }} y={{ label: '시간 [s]', range: [0, RUN.seconds] }} height={380} ariaLabel="스펙트로그램" />
      ) : (
        <Plot
          series={lines}
          x={{ label: '주파수 [Hz]', range: [0, F_MAX] }}
          y={view === 'waterfall' ? { label: '시간 [s]', range: [0, 66] } : { label: '회전수 [rpm]', range: [400, 3950] }}
          height={380}
          ariaLabel={view === 'waterfall' ? '워터폴' : '캐스케이드'}
        />
      )}
    </LabFrame>
  );
}
