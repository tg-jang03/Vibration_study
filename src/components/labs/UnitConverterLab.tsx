import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { convertSine, DETECTOR_LABEL, UNITS, type Detector, type UnitId } from '../../lib/units';

/**
 * LAB-UNIT-01 진동 단위 환산기 (P1-6 §6, Contents §5-1).
 * 정현파 하나를 가정하고 변위·속도·가속도 × Peak·Peak-Peak·RMS × SI·인치 단위를 서로 바꾼다 (src/lib/units.ts).
 */

interface UnitSetup {
  min: number;
  max: number;
  step: number;
  initial: number;
  /** 업계에서 흔히 같이 쓰는 표기 */
  detector: Detector;
}
const SETUP: Record<UnitId, UnitSetup> = {
  um: { min: 1, max: 500, step: 1, initial: 50, detector: 'pp' },
  mil: { min: 0.1, max: 20, step: 0.1, initial: 2, detector: 'pp' },
  'mm/s': { min: 0.1, max: 50, step: 0.1, initial: 5, detector: 'rms' },
  'in/s': { min: 0.01, max: 2, step: 0.01, initial: 0.25, detector: 'pk' },
  'm/s2': { min: 0.1, max: 100, step: 0.1, initial: 10, detector: 'rms' },
  g: { min: 0.01, max: 10, step: 0.01, initial: 1, detector: 'pk' },
};
const UNIT_OPTIONS: { value: UnitId; label: string }[] = [
  { value: 'um', label: '변위 µm' }, { value: 'mil', label: '변위 mil (1/1000 inch)' },
  { value: 'mm/s', label: '속도 mm/s' }, { value: 'in/s', label: '속도 in/s' },
  { value: 'm/s2', label: '가속도 m/s²' }, { value: 'g', label: '가속도 g' },
];
/** 표에 보여 줄 조합 — 업계에서 흔히 쓰는 것부터 */
const ROWS: { unit: UnitId; detector: Detector }[] = [
  { unit: 'um', detector: 'pp' }, { unit: 'um', detector: 'pk' }, { unit: 'mil', detector: 'pp' },
  { unit: 'mm/s', detector: 'rms' }, { unit: 'mm/s', detector: 'pk' }, { unit: 'in/s', detector: 'pk' },
  { unit: 'g', detector: 'pk' }, { unit: 'g', detector: 'rms' }, { unit: 'm/s2', detector: 'rms' },
];
const QTY: Record<string, string> = { displacement: '변위', velocity: '속도', acceleration: '가속도' };
const LOG_F = Array.from({ length: 81 }, (_, i) => 10 ** (i / 20)); // 1 Hz ~ 10 kHz
const decimals = (step: number) => (step >= 1 ? 0 : step >= 0.1 ? 1 : 2);

export default function UnitConverterLab() {
  const [unit, setUnit] = useState<UnitId>('um');
  const [detector, setDetector] = useState<Detector>('pp');
  const [value, setValue] = useState(50);
  const [freq, setFreq] = useState(25);
  const setup = SETUP[unit];
  const changeUnit = (u: UnitId) => {
    setUnit(u);
    setValue(SETUP[u].initial);
    setDetector(SETUP[u].detector);
  };
  const from = { value, unit, detector };
  const conv = (u: UnitId, d: Detector, f = freq) => convertSine(from, { unit: u, detector: d }, f);

  const plots = useMemo(() => {
    const curve = (u: UnitId, d: Detector, color: string, name: string): { series: PlotSeries[]; range: [number, number] } => {
      const y = LOG_F.map((f) => convertSine({ value, unit, detector }, { unit: u, detector: d }, f));
      // 로그 축 범위: 곡선이 들어가는 10의 거듭제곱 구간, 평평한 곡선이면 위아래로 한 단씩
      let lo = Math.floor(Math.log10(Math.min(...y)) + 1e-9);
      let hi = Math.ceil(Math.log10(Math.max(...y)) - 1e-9);
      if (hi - lo < 2) { lo -= 1; hi += 1; }
      return {
        series: [
          { x: LOG_F, y, name, color, width: 2 },
          { x: [freq], y: [convertSine({ value, unit, detector }, { unit: u, detector: d }, freq)], name: `${formatNumber(freq, 4)} Hz`, mode: 'markers', color: 'var(--plot-2)', markerSize: 10 },
        ],
        range: [lo, hi],
      };
    };
    return {
      disp: curve('um', 'pp', 'var(--plot-1)', '변위 [µm Peak-Peak]'),
      vel: curve('mm/s', 'rms', 'var(--plot-4)', '속도 [mm/s RMS]'),
      acc: curve('g', 'pk', 'var(--plot-3)', '가속도 [g Peak]'),
    };
  }, [value, unit, detector, freq]);

  const vPk = conv('mm/s', 'pk');
  const dPk = conv('um', 'pk');
  const aPk = conv('m/s2', 'pk');

  return (
    <LabFrame id="LAB-UNIT-01" title="진동 단위 환산기 (정현파 하나)"
      controls={<>
        <ParamSelect label="단위" value={unit} options={UNIT_OPTIONS} onChange={changeUnit} />
        <ParamSelect label="표기" value={detector}
          options={(['pk', 'pp', 'rms'] as Detector[]).map((d) => ({ value: d, label: DETECTOR_LABEL[d] }))} onChange={setDetector} />
        <ParamSlider label="값" value={value} min={setup.min} max={setup.max} step={setup.step}
          unit={`${UNITS[unit].label} ${DETECTOR_LABEL[detector]}`} format={(v) => v.toFixed(decimals(setup.step))} onChange={setValue} />
        <ParamSlider label="주파수" value={freq} min={1} max={1000} step={0.5}
          format={(v) => `${v.toFixed(1)} Hz (1X라면 ${Math.round(v * 60)} rpm)`} onChange={setFreq}
          hint="변위·속도·가속도 사이를 바꿀 때만 필요합니다" />
      </>}
      formulas={<>
        <Formula display tex={'\\text{Peak} = \\sqrt2\\,\\text{RMS} = \\tfrac{1}{2}\\,\\text{Peak-Peak}\\quad(\\text{정현파일 때만})'} />
        <Formula display tex={'v = 2\\pi f\\,d = 2\\pi\\times' + texNumber(freq, 4) + '\\times' + texNumber(dPk, 4) + '\\ \\mu\\mathrm{m} = ' + texNumber(vPk, 4) + '\\ \\mathrm{mm/s}\\ (\\text{Peak})'} />
        <Formula display tex={'a = 2\\pi f\\,v = ' + texNumber(aPk, 4) + '\\ \\mathrm{m/s^2} = ' + texNumber(aPk / 9.80665, 4) + '\\ g\\ (\\text{Peak})'} />
        <p>1 mil = 25.4 µm, 1 in/s = 25.4 mm/s, 1 g = 9.80665 m/s². 여러 성분이 섞인 overall 값에는 이 환산이 맞지 않습니다.</p>
      </>}
      readouts={<ReadoutTable caption={`${formatNumber(value, 4)} ${UNITS[unit].label} ${DETECTOR_LABEL[detector]} @ ${formatNumber(freq, 4)} Hz를 바꾸면`} rows={ROWS.map((r) => ({
        label: `${QTY[UNITS[r.unit].quantity]} ${UNITS[r.unit].label} ${DETECTOR_LABEL[r.detector]}`,
        value: conv(r.unit, r.detector),
      }))} />}
      tasks={[
        { question: '25 Hz, 50 µm Peak-Peak 변위는 몇 mm/s RMS일까요?',
          answer: 'Peak 25 µm → v = 2π × 25 × 25 µm ≈ 3.93 mm/s Peak → ÷ √2 ≈ 2.78 mm/s RMS입니다.' },
        { question: '1 in/s Peak는 몇 mm/s RMS일까요? (주파수는 필요할까요?)',
          answer: '같은 속도끼리라 주파수는 필요 없습니다. 25.4 mm/s Peak ÷ √2 ≈ 17.96 mm/s RMS입니다.' },
        { question: '한 보고서는 "0.25 in/s pk", 다른 보고서는 "3.2 mm/s rms"입니다. 어느 쪽이 큰가요?',
          answer: '0.25 in/s pk = 0.25 × 17.96 ≈ 4.49 mm/s rms이므로 0.25 in/s pk 쪽이 약 1.4배 큽니다. 숫자만 보고 0.25 < 3.2로 비교하면 틀립니다.' },
        { question: '속도 5 mm/s RMS를 그대로 두고 주파수를 10 Hz → 1000 Hz로 바꾸면 변위와 가속도는?',
          answer: '변위는 주파수에 반비례해 약 225 → 2.25 µm Peak-Peak(1/100), 가속도는 비례해 약 0.045 → 4.5 g Peak(100배)가 됩니다. 낮은 주파수는 변위로, 높은 주파수는 가속도로 볼 때 숫자가 커서 잘 보입니다.' },
      ]}
      footer={<p>정현파 하나를 가정한 환산입니다. 표의 값은 모두 같은 진동을 다른 단위·표기로 나타낸 것입니다. 아래 그래프는 지금 진동과 같은 크기를 주파수만 바꿔 가며 세 가지 양으로 본 것입니다 (가로·세로 로그 눈금).</p>}
    >
      <h4>같은 진동을 주파수에 따라 세 가지 양으로</h4>
      <Plot series={plots.disp.series} x={{ label: '주파수 [Hz]', log: true, range: [0, 4] }} y={{ label: '변위 [µm pp]', log: true, range: plots.disp.range }} height={210} ariaLabel="주파수에 따른 변위" />
      <Plot series={plots.vel.series} x={{ label: '주파수 [Hz]', log: true, range: [0, 4] }} y={{ label: '속도 [mm/s rms]', log: true, range: plots.vel.range }} height={190} ariaLabel="주파수에 따른 속도" />
      <Plot series={plots.acc.series} x={{ label: '주파수 [Hz]', log: true, range: [0, 4] }} y={{ label: '가속도 [g pk]', log: true, range: plots.acc.range }} height={210} ariaLabel="주파수에 따른 가속도" />
    </LabFrame>
  );
}
