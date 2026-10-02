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
  { value: 'default16', label: '16 bit (레인지 1.5 V, 작은 성분 −60 dBFS)' },
  { value: 'low8', label: '8 bit (잡음 바닥이 높아 −60 dB 성분이 묻힘)' },
  { value: 'high24', label: '24 bit (잡음 바닥 −140 dBFS 아래)' },
  { value: 'clipping', label: '클리핑 (신호 1.0 V > 레인지 0.7 V → 홀수 하모닉)' },
  { value: 'headroom10', label: '레인지가 너무 큼 (10 V → 20 dB 손해)' },
  { value: 'custom', label: '직접 파라미터 조작' },
];

const BIT_OPTIONS: ParamOption<number>[] = [
  { value: 8, label: '8 bit (256 단계, SQNR ≈ 50 dB)' },
  { value: 12, label: '12 bit (4,096 단계, SQNR ≈ 74 dB)' },
  { value: 16, label: '16 bit (65,536 단계, SQNR ≈ 98 dB)' },
  { value: 24, label: '24 bit (16,777,216 단계, SQNR ≈ 146 dB)' },
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

    // 스펙트럼에서 읽은 값: 두 톤의 레벨과, 톤·DC·나이퀴스트를 뺀 bin들의 평균 파워 → 잡음 바닥
    const k1 = Math.round(f1 / spec.binSpacing);
    const k2 = Math.round(f2 / spec.binSpacing);
    let sumSq = 0;
    let count = 0;
    for (let k = 1; k < spec.amplitude.length - 1; k++) {
      if (k === k1 || k === k2) continue;
      sumSq += spec.amplitude[k] * spec.amplitude[k];
      count++;
    }
    const measuredFloorDbfs = 10 * Math.log10(Math.max(1e-30, sumSq / count) / (range * range));
    const measuredMainDbfs = 20 * Math.log10(Math.max(1e-12, spec.amplitude[k1]) / range);
    const measuredSmallDbfs = 20 * Math.log10(Math.max(1e-12, spec.amplitude[k2]) / range);

    return { t, raw, qRes, spec, specDbfs, measuredFloorDbfs, measuredMainDbfs, measuredSmallDbfs };
  }, [bits, range, a1, a2, f1, f2, fs, n]);

  // 이론값 계산
  const baseSqnr = theoreticalSqnr(bits);
  const backoffDb = 20 * Math.log10(range / a1);
  const effSnr = effectiveSnr(bits, range, a1);
  const fftGainDb = 10 * Math.log10(n / 2); // 10 * log10(512) ≈ 27.09 dB
  // 0 dBFS = 풀스케일 정현파. 양자화 잡음은 LSB로만 정해지므로 dBFS로는 레인지와 무관하게 일정하다.
  // 레인지를 키우면 바닥이 오르는 게 아니라 신호가 −20 log(V_fs/A) dBFS로 내려와 간격(SNR_eff)이 줄어든다.
  const noiseFloorDbfs = -baseSqnr - fftGainDb;
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
        name: `이론 잡음 바닥 (${formatNumber(noiseFloorDbfs, 4)} dBFS)`,
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
            label="작은 성분 크기 (136 Hz, 큰 톤 대비 dB)"
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
            tex={`\\mathrm{SQNR}_{\\text{fs}} \\approx 6.02 \\times ${bits} + 1.76 = ${texNumber(baseSqnr, 4)}\\ \\mathrm{dB}\\quad (\\text{풀스케일 정현파 이론비})`}
          />
          <Formula
            display
            tex={`\\mathrm{SNR}_{\\text{eff}} = \\mathrm{SQNR} - 20\\log_{10}\\left(\\dfrac{V_{fs}}{A_{pk}}\\right) = ${texNumber(baseSqnr, 4)} - ${texNumber(backoffDb, 4)} = ${texNumber(effSnr, 4)}\\ \\mathrm{dB}`}
          />
          <Formula
            display
            tex={`\\text{bin 하나의 잡음 바닥} \\approx -\\mathrm{SQNR} - 10\\log_{10}(N/2) = -${texNumber(baseSqnr, 4)} - ${texNumber(fftGainDb, 4)} = ${texNumber(noiseFloorDbfs, 4)}\\ \\mathrm{dBFS}`}
          />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: 'ADC 분해능', value: bits, unit: 'bit' },
            { label: '풀스케일 레인지 V_fs', value: range, unit: 'V' },
            { label: '1 LSB 전압 크기', value: simData.qRes.lsb, unit: 'V', sig: 4 },
            { label: '풀스케일 SQNR (6.02b + 1.76)', value: baseSqnr, unit: 'dB', sig: 3 },
            { label: '유효 SNR (레인지 여유 반영)', value: effSnr, unit: 'dB', sig: 3 },
            {
              label: '잡음 바닥 (스펙트럼 평균)',
              value: simData.measuredFloorDbfs,
              theory: noiseFloorDbfs,
              unit: 'dBFS',
              sig: 3,
            },
            {
              label: '주 톤 레벨 (50 Hz)',
              value: simData.measuredMainDbfs,
              theory: mainToneDbfs,
              unit: 'dBFS',
              sig: 3,
            },
            {
              label: '작은 톤 레벨 (136 Hz)',
              value: simData.measuredSmallDbfs,
              theory: smallToneDbfs,
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
            '16 bit에서 −60 dB, −100 dB의 작은 성분이 보이나요? 레인지를 신호보다 10배 크게(10 V) 잡으면 어떻게 되나요?',
          answer:
            '16 bit, N = 1024이면 양자화 잡음이 512개 bin에 나뉘어 bin 하나의 잡음 바닥이 약 −125 dBFS까지 내려가므로 −100 dB 성분도 보입니다. 레인지를 10배 키우면 잡음 바닥은 −125 dBFS 그대로지만 신호가 칸을 1/10만 쓰게 되어 큰 톤이 −20 dBFS로 내려옵니다. 신호와 잡음 바닥의 간격이 20 dB 줄어, −100 dB 성분(−120 dBFS)이 잡음 바닥에 거의 붙어 버립니다.',
        },
        {
          question:
            '레인지를 신호 진폭보다 작은 0.7 V로 설정하면 파형과 스펙트럼에 어떤 현상이 발생하나요?',
          answer:
            '신호 꼭대기가 +0.7 V, −0.7 V에서 잘려 평평해집니다(클리핑). 잘린 파형은 사각파에 가까워지므로 스펙트럼에 150 Hz(3X), 250 Hz(5X), 350 Hz(7X) … 홀수 하모닉이 생깁니다. 기계와 상관없이 측정 과정이 만든 성분입니다.',
        },
        {
          question:
            '8 bit ADC와 24 bit ADC의 잡음 바닥 차이는 얼마나 되나요?',
          answer:
            '1 bit마다 약 6 dB씩 차이가 나므로 16 bit 차이면 약 96 dB입니다. 8 bit에서는 잡음 바닥이 약 −77 dBFS라 −60 dB 성분이 잡음과 잘 구별되지 않고, 24 bit에서는 잡음 바닥이 −170 dBFS 아래로 내려가 아주 작은 성분도 보입니다.',
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
