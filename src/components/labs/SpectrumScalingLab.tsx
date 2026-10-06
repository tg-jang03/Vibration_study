import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { bandRms, spectrumIn } from '../../lib/dsp/scaling';
import { noiseBinPower, noisePsd, TONE_NOISE, toneNoiseSpectrum } from '../../lib/scalingDemo';

/**
 * LAB-SPC-01 스펙트럼의 세로축: 진폭 · 파워 · PSD (P1-6 §3, Contents §5-1).
 * 50 Hz 톤 + 백색 잡음을 라인 수 400 ~ 3200(F_max 500 Hz)으로 잰다. 본문 그림 1 ~ 4와 같은 신호·시드(src/lib/scalingDemo.ts).
 */

type Scale = 'rms' | 'power' | 'psd' | 'asd';
type Win = 'hann' | 'uniform';
const SCALES: { value: Scale; label: string }[] = [
  { value: 'rms', label: '진폭 (RMS) [mm/s]' },
  { value: 'power', label: '파워 [(mm/s)²]' },
  { value: 'psd', label: 'PSD [(mm/s)²/Hz]' },
  { value: 'asd', label: 'ASD = √PSD [mm/s/√Hz]' },
];
const UNIT: Record<Scale, string> = { rms: 'mm/s', power: '(mm/s)²', psd: '(mm/s)²/Hz', asd: 'mm/s/√Hz' };
/** SI → 표시 단위 배율 (m/s → mm/s) */
const FACTOR: Record<Scale, number> = { rms: 1e3, power: 1e6, psd: 1e6, asd: 1e3 };
/** 진폭 계열(rms·asd)은 20 log, 파워 계열(power·psd)은 10 log — 같은 비면 같은 dB */
const toDb = (v: number, scale: Scale) => (v > 0 ? (scale === 'rms' || scale === 'asd' ? 20 : 10) * Math.log10(v) : -200);
const LORS = TONE_NOISE.lors;
const { fs, toneFreq } = TONE_NOISE;

function mean(a: ArrayLike<number>, from: number, to: number) {
  let s = 0;
  for (let k = from; k < to; k++) s += a[k];
  return s / (to - from);
}

export default function SpectrumScalingLab() {
  const [scale, setScale] = useState<Scale>('rms');
  const [lor, setLor] = useState<number>(400);
  const [win, setWin] = useState<Win>('hann');
  const [noiseMm, setNoise] = useState(1);
  const [toneMm, setTone] = useState(1);
  const [db, setDb] = useState(true);

  const all = useMemo(
    () => LORS.map((l) => toneNoiseSpectrum({ lor: l, window: win, toneRms: toneMm / 1000, noiseRms: noiseMm / 1000 })),
    [win, toneMm, noiseMm],
  );
  const view = useMemo(() => {
    const show = (v: number) => (db ? toDb(v, scale) : v);
    const stats = all.map((s) => {
      const y = spectrumIn(s, scale);
      const k = Math.round(toneFreq / s.df);
      const [a, b] = [Math.round(60 / s.df), Math.round(490 / s.df)];
      // 바닥은 파워(또는 PSD)로 평균한 뒤 표시 단위로 바꾼다 (진폭을 평균하면 낮게 나온다)
      const floorPow = mean(scale === 'psd' || scale === 'asd' ? s.psd : s.power, a, b);
      const floor = scale === 'rms' || scale === 'asd' ? Math.sqrt(floorPow) : floorPow;
      return { y, tone: y[k] * FACTOR[scale], floor: floor * FACTOR[scale] };
    });
    const i = LORS.indexOf(lor as (typeof LORS)[number]);
    const s = all[i];
    const kMax = Math.round(200 / s.df);
    const spectrum: PlotSeries[] = [
      { x: Array.from(s.frequency).slice(0, kMax + 1), y: Array.from(stats[i].y.slice(0, kMax + 1), (v) => show(v * FACTOR[scale])), name: `${lor} 라인`, color: 'var(--plot-1)', width: 1.3 },
      { x: [0, 200], y: [show(stats[i].floor), show(stats[i].floor)], name: '잡음 바닥 (60 ~ 490 Hz 평균)', color: 'var(--plot-2)', dash: 'dash', width: 1.4 },
    ];
    const track: PlotSeries[] = [
      { x: [...LORS], y: stats.map((st) => show(st.tone)), name: '톤 높이 (50 Hz)', mode: 'lines+markers', color: 'var(--plot-1)' },
      { x: [...LORS], y: stats.map((st) => show(st.floor)), name: '잡음 바닥', mode: 'lines+markers', color: 'var(--plot-2)' },
      { x: [lor, lor], y: [show(stats[i].tone), show(stats[i].floor)], name: '지금 라인 수', mode: 'markers', color: 'var(--text)', markerSize: 11 },
    ];
    return { s, stats, i, spectrum, track };
  }, [all, scale, lor, db]);

  const { s } = view;
  const toneRms = toneMm / 1000;
  const noiseRms = noiseMm / 1000;
  const theoryTonePow = toneRms ** 2;
  const theoryFloorPow = noiseBinPower(noiseRms, s.n, s.enbw);
  const theory = (pow: number, psd: number) => {
    const v = scale === 'power' ? pow : scale === 'rms' ? Math.sqrt(pow) : scale === 'psd' ? psd : Math.sqrt(psd);
    return v * FACTOR[scale];
  };
  const theoryTone = theory(theoryTonePow, theoryTonePow / (s.enbw * s.df));
  const theoryFloor = theory(theoryFloorPow, noisePsd(noiseRms, fs));
  const band = bandRms(s.power, s.enbw) * 1000;
  const bandRaw = bandRms(s.power, s.enbw, 0, s.power.length - 1, false) * 1000;

  return (
    <LabFrame id="LAB-SPC-01" title="스펙트럼의 세로축: 진폭 · 파워 · PSD"
      controls={<>
        <ParamSelect label="세로축" value={scale} options={SCALES} onChange={setScale} />
        <ParamSelect label="라인 수 (F_max 500 Hz)" value={lor}
          options={LORS.map((l) => ({ value: l, label: `${l} 라인 (Δf ${formatNumber(500 / l, 3)} Hz)` }))} onChange={setLor} />
        <ParamToggle label="dB로 보기" checked={db} onChange={setDb}
          hint="진폭·ASD는 20 log, 파워·PSD는 10 log. 0 dB = 그 단위의 1" />
        <ParamSelect label="윈도우" value={win} options={[{ value: 'hann', label: 'Hann (ENBW 1.5 bin)' }, { value: 'uniform', label: '윈도우 없음 (ENBW 1 bin)' }]} onChange={setWin} />
        <ParamSlider label="톤 크기 (50 Hz)" value={toneMm} min={0} max={2} step={0.1} unit="mm/s RMS" format={(v) => v.toFixed(1)} onChange={setTone} />
        <ParamSlider label="잡음 크기 σ (0 ~ 640 Hz)" value={noiseMm} min={0.1} max={2} step={0.1} unit="mm/s RMS" format={(v) => v.toFixed(1)} onChange={setNoise} />
      </>}
      formulas={<>
        <Formula display tex={'\\Delta f = \\frac{F_{max}}{\\mathrm{LOR}} = \\frac{500}{' + lor + '} = ' + texNumber(s.df, 4) + '\\ \\mathrm{Hz}'} />
        <Formula display tex={'PSD_k = \\frac{PS_k}{\\mathrm{ENBW}\\cdot\\Delta f} = \\frac{PS_k}{' + texNumber(s.enbw, 3) + '\\times' + texNumber(s.df, 4) + '\\ \\mathrm{Hz}}'} />
        <Formula display tex={'\\text{대역 RMS} = \\sqrt{\\frac{\\sum PS_k}{\\mathrm{ENBW}}} = \\sqrt{\\frac{' + texNumber(bandRaw ** 2, 4) + '}{' + texNumber(s.enbw, 3) + '}} = ' + texNumber(band, 4) + '\\ \\mathrm{mm/s}'} />
        <p>PS는 bin의 파워(RMS²), ENBW는 bin 하나가 실제로 모으는 폭(P1-4). 진폭(RMS) = √PS, ASD = √PSD입니다.</p>
      </>}
      readouts={<ReadoutTable caption="읽음값 (지금 라인 수)" rows={[
        { label: '분해능 Δf', value: s.df, unit: 'Hz' },
        { label: '프레임 하나의 측정 시간 T', value: s.n / fs, unit: 's' },
        { label: '50 Hz 톤 높이', value: view.stats[view.i].tone, unit: UNIT[scale], theory: theoryTone },
        { label: '잡음 바닥 (평균)', value: view.stats[view.i].floor, unit: UNIT[scale], theory: theoryFloor },
        ...(db ? [
          { label: '톤 높이 (dB)', value: toDb(view.stats[view.i].tone, scale), unit: 'dB', sig: 3 },
          { label: '잡음 바닥 (dB)', value: toDb(view.stats[view.i].floor, scale), unit: 'dB', sig: 3 },
        ] : []),
        { label: '대역 RMS 0 ~ 640 Hz (÷ ENBW)', value: band, unit: 'mm/s', theory: Math.hypot(toneMm, noiseMm) },
        { label: '대역 RMS, ENBW로 나누지 않음', value: bandRaw, unit: 'mm/s' },
        { label: '파형에서 직접 잰 RMS', value: s.timeRms * 1000, unit: 'mm/s' },
      ]} />}
      tasks={[
        { question: '진폭(RMS)·dB로 보면서 라인 수를 400 → 3200으로 바꾸면 톤과 잡음 바닥은 몇 dB 움직일까요?',
          answer: '톤은 약 0 dB(1 mm/s)에 그대로이고, 잡음 바닥은 약 −25 dB에서 −34 dB로 9 dB(파워 1/8) 내려갑니다. 라인 수가 8배면 bin 폭이 1/8이 되어 bin 하나에 담기는 잡음도 1/8이기 때문입니다.' },
        { question: '세로축을 PSD로 바꾸고 같은 일을 하면?',
          answer: '이번에는 잡음 바닥이 약 −28 dB(= 2σ²/f_s = 0.00156 (mm/s)²/Hz)에 그대로이고, 톤이 약 −2.6 dB에서 +6.4 dB로 9 dB 올라갑니다. PSD는 잡음을 1 Hz 폭당으로 나타내므로 Δf와 무관하지만, 한 bin에 몰린 톤은 Δf로 나눈 만큼 커집니다.' },
        { question: '윈도우를 "윈도우 없음"으로 바꾸면 두 대역 RMS 읽음값은 어떻게 되나요?',
          answer: '윈도우가 없으면 ENBW = 1이라 나누든 안 나누든 같습니다. Hann에서는 나누지 않은 값이 √1.5 ≈ 1.22배 큽니다 — 윈도우가 정현파 막대 높이를 맞추려고(ACF) 잡음 파워를 1.5배로 부풀렸기 때문입니다 (P1-4).' },
        { question: '톤 크기를 0으로 하고 잡음 σ를 1 → 2 mm/s로 올리면 PSD 바닥은 몇 dB 오를까요?',
          answer: '잡음 파워가 4배이므로 PSD 바닥이 10 log 4 ≈ 6 dB 오릅니다 (−28 → −22 dB). 대역 RMS도 1 → 2 mm/s로 따라갑니다.' },
      ]}
      footer={<p>F_max 500 Hz, f_s = 1280 Hz, 라인 수에 따라 N = 1024 ~ 8192. 바닥이 덜 들쭉날쭉하도록 프레임 8개를 파워 평균했습니다 (P1-5). 50 Hz 톤은 모든 라인 수에서 bin 중심에 있습니다. 잡음은 시드가 고정되어 같은 설정은 같은 결과입니다.</p>}
    >
      <h4>스펙트럼 ({SCALES.find((o) => o.value === scale)?.label}{db ? ', dB' : ''})</h4>
      <Plot series={view.spectrum} x={{ label: '주파수 [Hz]', range: [0, 200] }}
        y={{ label: db ? `dB (0 dB = 1 ${UNIT[scale]})` : UNIT[scale] }} height={290} ariaLabel="지금 라인 수의 스펙트럼" />
      <h4>라인 수에 따른 톤 높이와 잡음 바닥</h4>
      <Plot series={view.track} x={{ label: '라인 수 (LOR)', range: [0, 3400] }}
        y={{ label: db ? 'dB' : UNIT[scale] }} height={240} ariaLabel="라인 수에 따른 톤 높이와 잡음 바닥" />
    </LabFrame>
  );
}
