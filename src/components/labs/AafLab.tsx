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
  aliasFrequency,
  butterworthAttenuationDb,
  butterworthGain,
} from '../../lib/dsp/sampling';

/**
 * LAB-SMP-02 AAF와 fs = 2.56 F_max (P1-2, Contents §5-1).
 *
 * 목적:
 * 상용 진동 분석기가 왜 fs = 2.56 F_max를 쓰는지,
 * 아날로그 AAF가 없을 때 대역 밖 고주파가 어떻게 유효 분석 대역으로 침투하는지 체험한다.
 */

type AafType = 'none' | 'ideal' | 'butter2' | 'butter4' | 'butter8';
type PresetKey = 'default8' | 'noAaf' | 'ideal' | 'ratio2' | 'custom';

const PRESET_OPTIONS: ParamOption<PresetKey>[] = [
  { value: 'default8', label: '일반적인 분석기 설정 (f_s = 2.56 F_max, 8차 필터)' },
  { value: 'noAaf', label: '필터 없음 (1.8 F_max 성분이 0.76 F_max 가짜 막대로 보임)' },
  { value: 'ideal', label: '이상적 필터 (F_max에서 수직으로 끊음 — 실제로는 불가능)' },
  { value: 'ratio2', label: 'f_s = 2.0 F_max (필터가 깎을 여유 구간이 0)' },
  { value: 'custom', label: '직접 파라미터 조작' },
];

const AAF_OPTIONS: ParamOption<AafType>[] = [
  { value: 'butter8', label: 'Butterworth 8차 (주파수 2배마다 −48 dB)' },
  { value: 'butter4', label: 'Butterworth 4차 (주파수 2배마다 −24 dB)' },
  { value: 'butter2', label: 'Butterworth 2차 (주파수 2배마다 −12 dB)' },
  { value: 'ideal', label: '이상적 필터 (F_max 초과 완벽 차단)' },
  { value: 'none', label: '필터 없음' },
];

export default function AafLab() {
  const [preset, setPreset] = useState<PresetKey>('default8');
  const [fmax, setFmax] = useState(1000); // F_max [Hz]
  const [ratio, setRatio] = useState(2.56); // fs / F_max ratio
  const [aafType, setAafType] = useState<AafType>('butter8');
  const [fOutMultiplier, setFOutMultiplier] = useState(1.8); // f_out / F_max
  const [outAmp, setOutAmp] = useState(1.0); // 대역 밖 신호 진폭
  const [showDangerBand, setShowDangerBand] = useState(true);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    switch (key) {
      case 'default8':
        setFmax(1000);
        setRatio(2.56);
        setAafType('butter8');
        setFOutMultiplier(1.8);
        setOutAmp(1.0);
        break;
      case 'noAaf':
        setFmax(1000);
        setRatio(2.56);
        setAafType('none');
        setFOutMultiplier(1.8);
        setOutAmp(1.0);
        break;
      case 'ideal':
        setFmax(1000);
        setRatio(2.56);
        setAafType('ideal');
        setFOutMultiplier(1.8);
        setOutAmp(1.0);
        break;
      case 'ratio2':
        setFmax(1000);
        setRatio(2.0);
        setAafType('butter8');
        setFOutMultiplier(1.8);
        setOutAmp(1.0);
        break;
      case 'custom':
        break;
    }
  };

  const fs = ratio * fmax;
  const fn = fs / 2;
  const fGuard = Math.max(0, fs - fmax); // 위험 경계선 (이보다 높으면 0 ~ F_max로 접힘)
  const fIn = 0.3 * fmax; // 정상 신호 (진폭 1.0)
  const fOut = fOutMultiplier * fmax; // 대역 밖 고주파 성분

  // AAF 이득 및 감쇠 계산 함수 (fc = fmax)
  const getFilterGain = (freq: number): number => {
    if (aafType === 'none') return 1.0;
    if (aafType === 'ideal') return freq <= fmax ? 1.0 : 0.0;
    const order = aafType === 'butter2' ? 2 : aafType === 'butter4' ? 4 : 8;
    return butterworthGain(freq, fmax, order);
  };

  const getFilterAttDb = (freq: number): number => {
    if (aafType === 'none') return 0.0;
    if (aafType === 'ideal') return freq <= fmax ? 0.0 : 120.0;
    const order = aafType === 'butter2' ? 2 : aafType === 'butter4' ? 4 : 8;
    return butterworthAttenuationDb(freq, fmax, order);
  };

  // 대역 밖 성분의 에일리어싱 및 필터 통과 후 크기
  const aliasOutFreq = aliasFrequency(fOut, fs);
  const outGain = getFilterGain(fOut);
  const outAttDb = getFilterAttDb(fOut);
  const effectiveOutAmp = outAmp * outGain;
  const entersDisplayedBand = aliasOutFreq <= fmax;

  // 1. 필터 응답 곡선 데이터 (0 ~ 2.5 * F_max)
  const filterCurveData = useMemo(() => {
    const maxPlotFreq = Math.max(fs, 2.5 * fmax);
    const numPoints = 250;
    const freqs: number[] = [];
    const gainsDb: number[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const f = (maxPlotFreq * i) / numPoints;
      freqs.push(f);
      const att = getFilterAttDb(f);
      // dB 응답: -80 dB 하한
      gainsDb.push(Math.max(-80, -att));
    }

    return { freqs, gainsDb, maxPlotFreq };
  }, [fmax, fs, aafType]);

  // 플롯 시리즈 구성
  const responseSeries = useMemo<PlotSeries[]>(() => {
    const list: PlotSeries[] = [
      {
        x: filterCurveData.freqs,
        y: filterCurveData.gainsDb,
        name: `AAF 응답 (${aafType})`,
        mode: 'lines',
        color: '#2563eb', // blue
        width: 2.5,
      },
      // F_max 세로선
      {
        x: [fmax, fmax],
        y: [-80, 5],
        name: `F_max (${formatNumber(fmax)} Hz)`,
        mode: 'lines',
        color: '#16a34a', // green
        dash: 'dash',
        width: 1.5,
      },
      // 나이퀴스트 f_N 세로선
      {
        x: [fn, fn],
        y: [-80, 5],
        name: `f_N = fs/2 (${formatNumber(fn)} Hz)`,
        mode: 'lines',
        color: '#9333ea', // purple
        dash: 'dot',
        width: 1.5,
      },
      // 위험 경계선 f_s - F_max
      {
        x: [fGuard, fGuard],
        y: [-80, 5],
        name: `fs - F_max (${formatNumber(fGuard)} Hz)`,
        mode: 'lines',
        color: '#dc2626', // red
        dash: 'dash',
        width: 2,
      },
      // 대역 밖 성분 f_out 동작점 마커
      {
        x: [fOut],
        y: [Math.max(-80, -outAttDb)],
        name: `입력 f_out (${formatNumber(fOut)} Hz, -${formatNumber(outAttDb, 4)} dB)`,
        mode: 'markers',
        color: '#ea580c', // orange
        markerSize: 9,
      },
    ];

    return list;
  }, [filterCurveData, aafType, fmax, fn, fGuard, fOut, outAttDb]);

  // 2. 단일측 스펙트럼 표시 (0 ~ f_N)
  // 표시 대역: 0 ~ F_max (유효 분석 대역), F_max ~ f_N (분석기 폐기 대역 0.28 F_max)
  const specSeries = useMemo<PlotSeries[]>(() => {
    // 막대 그래프 형태로 주파수 피크 표시
    const list: PlotSeries[] = [
      // 정상 신호 (0.3 F_max, 진폭 1.0)
      {
        x: [fIn],
        y: [1.0],
        name: `정상 톤 (0.3 F_max = ${formatNumber(fIn)} Hz)`,
        kind: 'bar',
        barWidth: Math.max(5, fmax * 0.02),
        color: '#16a34a',
      },
      // 대역 밖 성분이 에일리어싱되어 나타난 피크
      {
        x: [aliasOutFreq],
        y: [effectiveOutAmp],
        name: entersDisplayedBand
          ? `가짜 에일리어스 피크 (${formatNumber(aliasOutFreq)} Hz, Pk=${formatNumber(effectiveOutAmp, 3)})`
          : `폐기 영역 에일리어스 (${formatNumber(aliasOutFreq)} Hz)`,
        kind: 'bar',
        barWidth: Math.max(5, fmax * 0.02),
        color: entersDisplayedBand ? (effectiveOutAmp > 0.05 ? '#dc2626' : '#f97316') : '#94a3b8',
      },
      // F_max 경계선
      {
        x: [fmax, fmax],
        y: [0, 1.2],
        name: 'F_max 유효 표시 한계',
        mode: 'lines',
        color: '#16a34a',
        dash: 'dash',
        width: 1.5,
      },
    ];

    return list;
  }, [fIn, fmax, aliasOutFreq, effectiveOutAmp, entersDisplayedBand]);

  return (
    <LabFrame
      id="LAB-SMP-02"
      title="AAF(안티에일리어싱 필터)와 f_s = 2.56 F_max"
      controls={
        <>
          <ParamSelect
            label="실험 프리셋"
            value={preset}
            options={PRESET_OPTIONS}
            onChange={applyPreset}
          />
          <ParamSlider
            label="분석 최대 주파수 F_max"
            value={fmax}
            min={500}
            max={2000}
            step={100}
            unit=" Hz"
            onChange={(v) => {
              setFmax(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="샘플링 비율 fs / F_max"
            value={ratio}
            min={2.0}
            max={4.0}
            step={0.04}
            unit=" 배"
            onChange={(v) => {
              setRatio(v);
              setPreset('custom');
            }}
          />
          <ParamSelect
            label="AAF 필터 종류 (fc = F_max)"
            value={aafType}
            options={AAF_OPTIONS}
            onChange={(v) => {
              setAafType(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="대역 밖 고주파 배율 (f_out / F_max)"
            value={fOutMultiplier}
            min={1.1}
            max={3.0}
            step={0.05}
            unit=" × F_max"
            onChange={(v) => {
              setFOutMultiplier(v);
              setPreset('custom');
            }}
          />
          <ParamSlider
            label="대역 밖 성분 원래 진폭 A_out"
            value={outAmp}
            min={0}
            max={1.5}
            step={0.1}
            unit=" Pk"
            onChange={(v) => {
              setOutAmp(v);
              setPreset('custom');
            }}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <ParamToggle
              label="위험 경계선 (fs - F_max) 안내"
              checked={showDangerBand}
              onChange={setShowDangerBand}
            />
          </div>
        </>
      }
      formulas={
        <>
          <Formula
            display
            tex={`f_s = ${texNumber(ratio, 3)} \\times F_{\\max} = ${texNumber(fs, 4)}\\ \\mathrm{Hz},\\quad f_N = \\dfrac{f_s}{2} = ${texNumber(fn, 4)}\\ \\mathrm{Hz}`}
          />
          <Formula
            display
            tex={`f_s - F_{\\max} = ${texNumber(fGuard, 4)}\\ \\mathrm{Hz}\\quad ${fOut >= fGuard ? '\\Rightarrow\\ f_{\\text{out}}\\text{이 이보다 높아 화면 안으로 접힌다}' : '\\Rightarrow\\ f_{\\text{out}}\\text{은 화면 밖(버리는 구간)으로 접힌다}'}`}
          />
          <Formula
            display
            tex={`|H(f_{\\text{out}})| = ${texNumber(outGain, 4)}\\quad (\\text{감쇠 } ${texNumber(outAttDb, 4)}\\ \\mathrm{dB})\\implies A_{\\text{eff}} = A_{\\text{out}} \\times |H| = ${texNumber(effectiveOutAmp, 4)}\\ \\mathrm{Pk}`}
          />
          <Formula
            display
            tex={`\\dfrac{N}{2} = 1.28 \\times \\mathrm{LOR}\\quad (\\text{bin } N/2\\text{개 중 } 78\\,\\%\\text{만 화면에 표시})`}
          />
        </>
      }
      readouts={
        <ReadoutTable
          rows={[
            { label: '분석 최대 주파수 F_max', value: fmax, unit: 'Hz' },
            { label: '샘플링 주파수 fs', value: fs, unit: 'Hz' },
            { label: '나이퀴스트 주파수 fN', value: fn, unit: 'Hz' },
            {
              label: '유효 대역 침투 한계선 fs - F_max',
              value: fGuard,
              theory: (ratio - 1) * fmax,
              unit: 'Hz',
            },
            { label: '대역 밖 성분 원래 주파수 f_out', value: fOut, unit: 'Hz' },
            {
              label: '에일리어스 가짜 피크 위치 fa',
              value: aliasOutFreq,
              theory: aliasFrequency(fOut, fs),
              unit: 'Hz',
            },
            {
              label: 'AAF 감쇠량',
              value: outAttDb,
              unit: 'dB',
              sig: 3,
            },
            {
              label: '잔류 피크 진폭 A_eff',
              value: effectiveOutAmp,
              unit: 'Pk',
              sig: 4,
            },
          ]}
        />
      }
      tasks={[
        {
          question:
            '필터를 끄고(필터 없음) 1.8 F_max 성분(1800 Hz)을 넣으면 스펙트럼의 어디에 가짜 막대가 설까요?',
          answer:
            'f_a = |1800 − 2560| = 760 Hz(= 0.76 F_max)에 원래 진폭 그대로(1.0 Pk) 나타납니다. 필터 없이 재면 실제로는 없는 760 Hz 진동이 있다고 잘못 판단하게 됩니다.',
        },
        {
          question:
            '8차 필터를 켜면 1.8 F_max 성분의 진폭은 얼마나 줄어드나요?',
          answer:
            '약 40.8 dB 깎여 진폭이 1.0에서 0.0091 Pk(1 % 미만)로 줄어듭니다. 가짜 막대가 거의 보이지 않게 됩니다.',
        },
        {
          question:
            '샘플링 비율 f_s / F_max를 2.0으로 낮추면 어떤 문제가 생길까요?',
          answer:
            'f_s − F_max = F_max가 되어 필터가 깎을 여유 구간이 0이 됩니다. 실제 필터는 F_max에서 수직으로 끊지 못하므로, F_max 바로 위(예: 1.1 F_max)의 성분이 거의 깎이지 않은 채 0.9 F_max로 접혀 들어옵니다. 많은 분석기가 f_s = 2.56 F_max를 쓰는 이유입니다.',
        },
      ]}
    >
      <div style={{ marginBottom: '1rem' }}>
        <Plot
          series={responseSeries}
          x={{ label: '주파수 [Hz]', range: [0, filterCurveData.maxPlotFreq] }}
          y={{ label: 'AAF 응답 [dB]', range: [-80, 5] }}
          height={260}
          ariaLabel="AAF 주파수 응답 및 위험 전이대역"
        />
      </div>
      <div>
        <Plot
          series={specSeries}
          x={{ label: '주파수 [Hz]', range: [0, fn] }}
          y={{ label: '스펙트럼 진폭 [Pk]', range: [0, 1.2] }}
          height={240}
          ariaLabel="분석기 스펙트럼 (0~F_max 유효 대역 vs 버리는 대역)"
        />
      </div>
    </LabFrame>
  );
}
