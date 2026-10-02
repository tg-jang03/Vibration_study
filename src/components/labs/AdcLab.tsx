import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect, { type ParamOption } from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import {
  effectiveSnr,
  quantize,
  theoreticalSqnr,
} from '../../lib/dsp/sampling';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';

/**
 * LAB-SMP-03 ADC 분해능 & 입력 레인지 (P1-2, Contents §5-1).
 *
 * 목적:
 * ADC 비트 수(8~24 bit)와 입력 레인지 설정이 양자화 잡음 바닥(Noise Floor),
 * 미소 결함 신호 검출능, 그리고 포화 클리핑(Clipping) 왜곡에 미치는 영향을 체감한다.
 */

type PresetKey = 'default16' | 'low8' | 'high24' | 'clipping' | 'headroom10' | 'custom';

const PRESET_OPTIONS: ParamOption<PresetKey>[] = [
  { value: 'default16', label: '16 bit 표준 (일반 진동계: 레인지 1.5 V, 미소톤 -60 dBFS)' },
  { value: 'low8', label: '8 bit 저해상도 (노이즈 바닥 상승 -> -60 dB 미소톤 매몰)' },
  { value: 'high24', label: '24 bit 고정밀 (24 bit 델타-시그마: 초저잡음 바닥 -140 dB 이하)' },
  { value: 'clipping', label: '클리핑 포화 왜곡 (신호 1.0 V > 레인지 0.7 V -> 강력한 홀수 하모닉)' },
  { value: 'headroom10', label: '레인지 과대 (10.0 V 레인지 -> 20 dB 분해능 낭비)' },
  { value: 'custom', label: '직접 파라미터 조작' },
];

const BIT_OPTIONS: ParamOption<number>[] = [
  { value: 8, label: '8 bit (256 단계, SQNR ≈ 50 dB)' },
  { value: 12, label: '12 bit (4,096 단계, SQNR ≈ 74 dB)' },
  { value: 16, label: '16 bit (65,536 단계, SQNR ≈ 98 dB - 산업용 표준)' },
  { value: 24, label: '24 bit (16,777,216 단계, SQNR ≈ 146 dB - 고정밀 DAQ)' },
];

export default function AdcLab() {
  const [preset, setPreset] = useState<PresetKey>('default16');
  const [bits, setBits] = useState(16);
  const [range, setRange] = useState(1.5); // V_fs (풀스케일 피크)
  const [smallToneDb, setSmallToneDb] = useState(-60); // dB relative to main tone
  const [zoomTime, setZoomTime] = useState(false);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    switch (key) {
      case 'default16':
        setBits(16);
        setRange(1.5);
        setSmallToneDb(-60);
        setZoomTime(false);
        break;
      case 'low8':
        setBits(8);
        setRange(1.5);
        setSmallToneDb(-60);
        setZoomTime(true);
        break;
      case 'high24':
        setBits(24);
        setRange(1.5);
        setSmallToneDb(-100);
        setZoomTime(false);
        break;
      case 'clipping':
        setBits(16);
        setRange(0.7);
        setSmallToneDb(-60);
        setZoomTime(false);
        break;
      case 'headroom10':
        setBits(16);
        setRange(10.0);
        setSmallToneDb(-60);
        setZoomTime(false);
        break;
      case 'custom':
        break;
    }
  };

  // 신호 파라미터
  const f1 = 50; // 주 톤 50 Hz (1X 회전주파수 가정)
  const a1 = 1.0; // 주 톤 진폭 1.0 V
  const f2 = 136; // 미세 톤 136 Hz (베어링/블레이드 결함 신호)
  const a2 = Math.pow(10, smallToneDb / 20) * a1;

  // 샘플링 & FFT 설정: N=1024, fs=2048 Hz -> bin 해상도 2 Hz (50 Hz는 bin 25, 136 Hz는 bin 68로 누설 없음)
  const n = 1024;
  const fs = 2048;

  // 1. 신호 생성 및 양자화
  const simData = useMemo(() => {
    const raw = new Float64Array(n);
    const t = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      t[i] = i / fs;
      raw[i] = a1 * Math.sin(2 * Math.PI * f1 * t[i]) + a2 * Math.sin(2 * Math.PI * f2 * t[i]);
    }

    const qRes = quantize(raw, { bits, range });
    const spec = singleSidedSpectrum({ fs, x: qRes.y });

    // dBFS 스펙트럼 (0 dBFS = 풀스케일 레인지 range)
    const specDbfs = new Float64Array(spec.amplitude.length);
    for (let i = 0; i < spec.amplitude.length; i++) {
      const amp = Math.max(1e-12, spec.amplitude[i]);
      specDbfs[i] = 20 * Math.log10(amp / range);
    }

    return { t, raw, qRes, spec, specDbfs };
  }, [bits, range, a1, a2, f1, f2, fs, n]);

  // 이론값 계산
  const baseSqnr = theoreticalSqnr(bits);
  const backoffDb = 20 * Math.log10(range / a1);
  const effSnr = effectiveSnr(bits, range, a1);
  const fftGainDb = 10 * Math.log10(n / 2); // 10 * log10(512) ≈ 27.09 dB
  const noiseFloorDbfs = -effSnr - fftGainDb;
  const smallToneDbfs = 20 * Math.log10(a2 / range);
  const mainToneDbfs = 20 * Math.log10(a1 / range);

  // 시간영역 플롯 시리즈
  const timeSeries = useMemo<PlotSeries[]>(() => {
    const maxT = zoomTime ? 0.04 : 0.08;
    const pts = Math.floor(maxT * fs);
    const tSub = simData.t.slice(0, pts);
    const rawSub = simData.raw.slice(0, pts);
    const qSub = simData.qRes.y.slice(0, pts);

    const list: PlotSeries[] = [
      {
        x: tSub,
        y: rawSub,
        name: '원 신호 x(t)',
        mode: 'lines',
        color: '#94a3b8', // slate gray
        dash: 'dot',
        width: 1.5,
      },
      {
        x: tSub,
        y: qSub,
        name: `양자화 신호 y[n] (${bits} bit)`,
        mode: bits <= 8 ? 'lines+markers' : 'lines',
        color: simData.qRes.clipped ? '#dc2626' : '#2563eb',
        width: 2,
        markerSize: 4,
      },
      // +Range 상한선
      {
        x: [0, maxT],
        y: [range, range],
        name: `+V_fs (+${formatNumber(range, 2)} V)`,
        mode: 'lines',
        color: '#ef4444',
        dash: 'dash',
        width: 1.5,
      },
      // -Range 하한선
      {
        x: [0, maxT],
        y: [-range, -range],
        name: `-V_fs (-${formatNumber(range, 2)} V)`,
        mode: 'lines',
        color: '#ef4444',
        dash: 'dash',
        width: 1.5,
      },
    ];

    return list;
  }, [simData, zoomTime, bits, range]);

  // 스펙트럼 플롯 시리즈 (dBFS)
  const specSeries = useMemo<PlotSeries[]>(() => {
    const list: PlotSeries[] = [
      {
        x: simData.spec.frequency,
        y: simData.specDbfs,
        name: `스펙트럼 (${bits} bit ADC)`,
        mode: 'lines',
        color: '#2563eb',
        width: 1.5,
      },
      // 이론 양자화 잡음 바닥선
      {
        x: [0, fs / 2],
        y: [noiseFloorDbfs, noiseFloorDbfs],
        name: `이론 FFT 잡음 바닥 (${formatNumber(noiseFloorDbfs, 1)} dBFS)`,
        mode: 'lines',
        color: '#f59e0b',
        dash: 'dash',
        width: 1.5,
      },
      // 0 dBFS 포화 기준선
      {
        x: [0, fs / 2],
        y: [0, 0],
        name: '0 dBFS (포화 클리핑 한계)',
        mode: 'lines',
        color: '#dc2626',
        dash: 'dot',
        width: 1.2,
      },
    ];

    return list;
  }, [simData, bits, fs, noiseFloorDbfs]);

  return (
    <LabFrame
      id="LAB-SMP-03"
      title="ADC 분해능(bit)과 입력 레인지(Headroom)"
      controls={
        <>
          <ParamSelect
            label="실험 프리셋"
            value={preset}
            options={PRESET_OPTIONS}
            onChange={applyPreset}
          />
          <ParamSelect
            label="ADC 비트 수"
            value={bits}
            options={BIT_OPTIONS}
            onChange={(v) => {
              setBits(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="입력 풀스케일 레인지 V_fs"
            value={range}
            min={0.5}
            max={10.0}
            step={0.1}
            unit=" V"
            onChange={(v) => {
              setRange(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="미소 결함 톤 레벨 (136 Hz)"
            value={smallToneDb}
            min={-120}
            max={-20}
            step={5}
            unit=" dB"
            onChange={(v) => {
              setSmallToneDb(v);
              setPreset('custom');
            }}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <ParamToggle
              label="시간 파형 확대 (계단 스텝 관찰)"
              checked={zoomTime}
              onChange={setZoomTime}
            />
          </div>
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={`\\Delta = \\dfrac{2 V_{fs}}{2^b} = \\dfrac{2 \\times ${texNumber(range, 2)}}{2^{${bits}}} = ${texNumber(simData.qRes.lsb, 6)}\\ \\mathrm{V}\\quad (1\\ \\mathrm{LSB}\\ \\text{양자화 스텝})`}
          />
          <Formula
            display
            tex={`\\mathrm{SQNR}_{\\text{fs}} \\approx 6.02 \\times ${bits} + 1.76 = ${texNumber(baseSqnr, 2)}\\ \\mathrm{dB}\\quad (\\text{풀스케일 정현파 이론비})`}
          />
          <Formula
            display
            tex={`\\mathrm{SNR}_{\\text{eff}} = \\mathrm{SQNR} - 20\\log_{10}\\left(\\dfrac{V_{fs}}{A_{pk}}\\right) = ${texNumber(baseSqnr, 1)} - ${texNumber(backoffDb, 1)} = ${texNumber(effSnr, 1)}\\ \\mathrm{dB}`}
          />
          <Formula
            display
            tex={`\\text{FFT 잡음 바닥} \\approx -\\mathrm{SNR}_{\\text{eff}} - 10\\log_{10}(N/2) = -${texNumber(effSnr, 1)} - ${texNumber(fftGainDb, 1)} = ${texNumber(noiseFloorDbfs, 1)}\\ \\mathrm{dBFS}`}
          />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: 'ADC 분해능', value: bits, unit: 'bit' },
            { label: '풀스케일 레인지 V_fs', value: range, unit: 'V' },
            { label: '1 LSB 전압 크기', value: simData.qRes.lsb, unit: 'V', sig: 4 },
            {
              label: '이론 풀스케일 SQNR',
              value: baseSqnr,
              theory: 6.02 * bits + 1.76,
              unit: 'dB',
              sig: 3,
            },
            {
              label: '유효 SNR (여유 마진 반영)',
              value: effSnr,
              theory: baseSqnr - backoffDb,
              unit: 'dB',
              sig: 3,
            },
            {
              label: 'FFT 잡음 바닥',
              value: noiseFloorDbfs,
              theory: -effSnr - fftGainDb,
              unit: 'dBFS',
              sig: 3,
            },
            {
              label: '주 톤 레벨 (50 Hz)',
              value: mainToneDbfs,
              theory: 20 * Math.log10(a1 / range),
              unit: 'dBFS',
              sig: 3,
            },
            {
              label: '미소 결함 톤 레벨 (136 Hz)',
              value: smallToneDbfs,
              theory: 20 * Math.log10(a2 / range),
              unit: 'dBFS',
              sig: 3,
            },
            {
              label: '클리핑 샘플 비율',
              value: simData.qRes.clipRatio * 100,
              unit: '%',
              sig: 2,
            },
          ]}
        />
      }
      tasks={[
        {
          question:
            '16 bit 표준 진동계에서 -60 dB, -100 dB 미소 신호가 보이나요? 레인지를 신호 피크 대비 10배(10.0 V)로 잡으면 어떻게 되나요?',
          answer:
            '16 bit에서 1024점 FFT를 수행하면 FFT 처리 이득(27 dB) 덕분에 잡음 바닥이 약 -125 dBFS에 위치하여 -60 dB는 물론 -100 dB 신호도 뚜렷이 보입니다. 하지만 레인지를 10 V(10배 여유)로 키우면 20 dB의 헤드룸 손실로 잡음 바닥이 -105 dBFS로 상승하여 -100 dB 미소 신호가 잡음 바닥에 묻히기 직전까지 올라갑니다.',
        },
        {
          question:
            '레인지를 신호 진폭보다 작은 0.7 V로 설정하면 파형과 스펙트럼에 어떤 현상이 발생하나요?',
          answer:
            '신호의 꼭대기가 +0.7 V, -0.7 V에서 잘려 평평해지는 클리핑(포화)이 발생합니다. 이 잘린 파형은 사각파의 성질을 띠게 되므로 스펙트럼에 150 Hz(3X), 250 Hz(5X), 350 Hz(7X)... 등 매우 강력한 홀수 하모닉(고조파) 스퍼가 솟구칩니다. 기계 결함이 없는데도 센서 포화로 인해 심각한 결함 신호로 오인될 수 있습니다.',
        },
        {
          question:
            '8 bit ADC와 24 bit ADC의 잡음 바닥 차이는 얼마나 되나요?',
          answer:
            '비트당 약 6.02 dB 차이가 나므로 16 bit 차이에 의해 무려 96 dB 이상의 잡음 바닥 차이가 발생합니다! 8 bit에서는 잡음 바닥이 약 -77 dBFS에 달해 -60 dB 미소 진동이 거의 잡음과 구별되지 않지만, 24 bit에서는 잡음 바닥이 -170 dBFS 아래로 내려가 극도로 미세한 결함도 선명하게 포착할 수 있습니다.',
        },
      ]}
    >
      <div style={{ marginBottom: '1rem' }}>
        <Plot
          series={timeSeries}
          x={{ label: '시간 t [s]', range: [0, zoomTime ? 0.04 : 0.08] }}
          y={{
            label: '전압 [V]',
            range: [-Math.max(1.4, range * 1.15), Math.max(1.4, range * 1.15)],
          }}
          height={260}
          ariaLabel="ADC 양자화 및 클리핑 시간 파형"
        />
      </div>
      <div>
        <Plot
          series={specSeries}
          x={{ label: '주파수 [Hz]', range: [0, fs / 2] }}
          y={{ label: '스펙트럼 진폭 [dBFS]', range: [-160, 5] }}
          height={260}
          ariaLabel="dBFS 스펙트럼 및 양자화 잡음 바닥"
        />
      </div>
    </LabFrame>
  );
}
