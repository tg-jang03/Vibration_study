import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import PolarPlot, { type PolarSeries } from '../ui/PolarPlot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import {
  compensateSlowRoll,
  halfPowerAF,
  P41_EXAMPLE,
  separationMargin,
  simulateRunUp,
  type RunUpPoint,
  type UnbalanceRotor,
} from '../../lib/rotor/runup';

const pp = (m: number) => m * 2e6;
const deg = (rad: number) => (rad * 180) / Math.PI;

interface RunUpBodeLabProps {
  initialNaturalRpm?: number;
  initialZeta?: number;
  initialStep?: number;
  initialOp?: number;
}

export default function RunUpBodeLab({
  initialNaturalRpm = 3000,
  initialZeta = 0.05,
  initialStep = 25,
  initialOp = 3600,
}: RunUpBodeLabProps) {
  const [naturalRpm, setNaturalRpm] = useState(initialNaturalRpm);
  const [zeta, setZeta] = useState(initialZeta);
  const [rpmStep, setRpmStep] = useState(initialStep);
  const [noiseUm, setNoiseUm] = useState(0);
  const [operatingRpm, setOperatingRpm] = useState(initialOp);
  const [hasRunout, setHasRunout] = useState(false);
  const [compensate, setCompensate] = useState(false);
  const [viewMode, setViewMode] = useState<'bode' | 'polar' | 'both'>('bode');

  const rotor = useMemo<UnbalanceRotor>(
    () => ({ naturalRpm, zeta, eccentricity: P41_EXAMPLE.rotor.eccentricity }),
    [naturalRpm, zeta],
  );

  const rawPoints = useMemo<RunUpPoint[]>(() => {
    const runout = hasRunout ? { amp: 4e-6, lag: (60 * Math.PI) / 180 } : undefined;
    return simulateRunUp(rotor, {
      rpmStart: 0,
      rpmEnd: 6000,
      rpmStep,
      noise: noiseUm * 1e-6,
      runout,
      seed: P41_EXAMPLE.seed,
    });
  }, [rotor, rpmStep, noiseUm, hasRunout]);

  const activePoints = useMemo<RunUpPoint[]>(() => {
    if (hasRunout && compensate) {
      return compensateSlowRoll(rawPoints, P41_EXAMPLE.slowRollRpm).points;
    }
    return rawPoints;
  }, [rawPoints, hasRunout, compensate]);

  const hp = useMemo(() => halfPowerAF(activePoints), [activePoints]);
  const sm = useMemo(() => {
    const nc = hp?.peakRpm ?? naturalRpm;
    return separationMargin(operatingRpm, nc);
  }, [hp, naturalRpm, operatingRpm]);

  const theoryAf = 1 / (2 * zeta);
  const peakAmpPp = hp ? pp(hp.peakAmp) : 0;
  const levelPp = peakAmpPp / Math.SQRT2;

  // Bode 플롯 시리즈
  const bodeAmpSeries = useMemo<PlotSeries[]>(() => {
    const x = activePoints.map((p) => p.rpm);
    const y = activePoints.map((p) => pp(p.amp));
    const s: PlotSeries[] = [
      { x, y, name: '1X 진폭', color: 'var(--plot-1)', width: 2 },
    ];
    if (hp) {
      s.push({
        x: [0, 6000],
        y: [levelPp, levelPp],
        name: `0.707 피크 (${formatNumber(levelPp, 3)} µm pp)`,
        color: 'var(--plot-2)',
        dash: 'dash',
        width: 1.5,
      });
      s.push({
        x: [hp.peakRpm],
        y: [peakAmpPp],
        name: `피크 N_c (${hp.peakRpm} rpm)`,
        color: 'var(--plot-3)',
        mode: 'markers',
        markerSize: 9,
      });
    }
    s.push({
      x: [operatingRpm, operatingRpm],
      y: [0, Math.max(120, peakAmpPp * 1.15)],
      name: `운전 속도 N_op (${operatingRpm} rpm)`,
      color: 'var(--plot-4)',
      dash: 'dot',
      width: 1.5,
    });
    return s;
  }, [activePoints, hp, levelPp, peakAmpPp, operatingRpm]);

  const bodePhaseSeries = useMemo<PlotSeries[]>(() => {
    const x = activePoints.map((p) => p.rpm);
    const y = activePoints.map((p) => deg(p.lag));
    const s: PlotSeries[] = [
      { x, y, name: '1X 위상 지연', color: 'var(--plot-1)', width: 2 },
      {
        x: [0, 6000],
        y: [90, 90],
        name: '90° 공진 기준',
        color: 'var(--text-muted)',
        dash: 'dash',
        width: 1.2,
      },
    ];
    if (hp) {
      s.push({
        x: [hp.peakRpm, hp.peakRpm],
        y: [0, 180],
        name: `N_c (${hp.peakRpm} rpm)`,
        color: 'var(--plot-3)',
        dash: 'dot',
        width: 1.2,
      });
    }
    return s;
  }, [activePoints, hp]);

  // Polar 플롯 시리즈
  const polarSeries = useMemo<PolarSeries[]>(() => {
    const ampArr = activePoints.map((p) => pp(p.amp));
    const lagArr = activePoints.map((p) => deg(p.lag));
    const s: PolarSeries[] = [
      {
        amp: ampArr,
        lagDeg: lagArr,
        name: '1X 궤적',
        color: 'var(--plot-1)',
        width: 2,
      },
    ];
    if (hp) {
      s.push({
        amp: [peakAmpPp],
        lagDeg: [deg(activePoints.find((p) => p.rpm === hp.peakRpm)?.lag ?? Math.PI / 2)],
        name: `피크 (${hp.peakRpm} rpm)`,
        color: 'var(--plot-3)',
        mode: 'markers',
        markerSize: 6,
      });
    }
    const opPt = activePoints.find((p) => Math.abs(p.rpm - operatingRpm) < rpmStep);
    if (opPt) {
      s.push({
        amp: [pp(opPt.amp)],
        lagDeg: [deg(opPt.lag)],
        name: `운전 (${operatingRpm} rpm)`,
        color: 'var(--plot-4)',
        mode: 'markers',
        markerSize: 6,
      });
    }
    return s;
  }, [activePoints, hp, peakAmpPp, operatingRpm, rpmStep]);

  const maxPlotAmp = Math.max(110, peakAmpPp * 1.15);

  const resetAll = () => {
    setNaturalRpm(3000);
    setZeta(0.05);
    setRpmStep(25);
    setNoiseUm(0);
    setOperatingRpm(3600);
    setHasRunout(false);
    setCompensate(false);
  };

  return (
    <LabFrame
      id="LAB-AF-01"
      title="Run-up Bode & 증폭계수 (AF)"
      controls={
        <>
          <ParamSlider
            label="고유 회전수 N_n"
            value={naturalRpm}
            min={1500}
            max={4500}
            step={100}
            unit="rpm"
            onChange={setNaturalRpm}
          />
          <ParamSlider
            label="감쇠비 ζ"
            value={zeta}
            min={0.01}
            max={0.25}
            step={0.01}
            unit=""
            onChange={setZeta}
          />
          <ParamSelect
            label="측정 rpm 간격"
            value={rpmStep}
            options={[
              { value: 10, label: '10 rpm (고해상도)' },
              { value: 25, label: '25 rpm (기본)' },
              { value: 50, label: '50 rpm' },
              { value: 100, label: '100 rpm' },
              { value: 200, label: '200 rpm (거침)' },
            ]}
            onChange={setRpmStep}
          />
          <ParamSlider
            label="측정 잡음 σ"
            value={noiseUm}
            min={0}
            max={4}
            step={1}
            unit="µm"
            onChange={setNoiseUm}
          />
          <ParamSlider
            label="운전 회전수 N_op"
            value={operatingRpm}
            min={1500}
            max={6000}
            step={100}
            unit="rpm"
            onChange={setOperatingRpm}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <ParamToggle
              label="런아웃 (8 µm pp ∠60°)"
              checked={hasRunout}
              onChange={(v) => {
                setHasRunout(v);
                if (!v) setCompensate(false);
              }}
            />
            {hasRunout && (
              <ParamToggle
                label="Slow roll 보상 (300 rpm)"
                checked={compensate}
                onChange={setCompensate}
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ParamSelect
              label="표시 방식"
              value={viewMode}
              options={[
                { value: 'bode', label: 'Bode 플롯' },
                { value: 'polar', label: 'Polar 플롯' },
                { value: 'both', label: 'Bode + Polar' },
              ]}
              onChange={setViewMode}
            />
            <button type="button" className="lab-button" onClick={resetAll} style={{ alignSelf: 'flex-end' }}>
              처음 값
            </button>
          </div>
        </>
      }
      formulas={
        <>
          {hp ? (
            <>
              <Formula
                display
                tex={`\\mathrm{AF} = \\frac{N_c}{N_2 - N_1} = \\frac{${texNumber(hp.peakRpm, 4)}}{${texNumber(hp.n2, 4)} - ${texNumber(hp.n1, 4)}} = ${texNumber(hp.af, 3)}`}
              />
              <Formula
                display
                tex={`\\text{이론}\\ \\frac{1}{2\\zeta} = ${texNumber(theoryAf, 3)},\\quad \\text{오차}\\ ${texNumber(((hp.af - theoryAf) / theoryAf) * 100, 2)}\\%`}
              />
            </>
          ) : (
            <Formula display tex={`\\text{0.707 피크 대역 미검출}`} />
          )}
          <Formula
            display
            tex={`\\mathrm{SM} = \\frac{|N_{op} - N_c|}{N_{op}} \\times 100\\% = ${texNumber(sm, 3)}\\%`}
          />
        </>
      }
      readouts={
        <ReadoutTable
          caption="런업 데이터에서 추정한 1X 특성"
          rows={[
            { label: '피크 회전수 N_c', value: hp?.peakRpm ?? Number.NaN, unit: 'rpm', sig: 4 },
            { label: '피크 진폭', value: peakAmpPp, unit: 'µm pp', sig: 3 },
            { label: '0.707 대역폭 (N₂ − N₁)', value: hp ? hp.n2 - hp.n1 : Number.NaN, unit: 'rpm', sig: 3 },
            { label: '추정 AF', value: hp?.af ?? Number.NaN, unit: '', sig: 3 },
            { label: '이론 1/(2ζ)', value: theoryAf, unit: '', sig: 3 },
            { label: '운전 속도 N_op', value: operatingRpm, unit: 'rpm', sig: 4 },
            { label: '분리여유 SM', value: sm, unit: '%', sig: 3 },
          ]}
        />
      }
      tasks={[
        {
          question: '기본값(ζ = 0.05, 25 rpm 간격)에서 추정 AF와 1/(2ζ)는 얼마나 일치하나요?',
          answer:
            'N_c = 3000 rpm, N₁ ≈ 2867 rpm, N₂ ≈ 3171 rpm에서 추정 AF는 약 9.84입니다. 이론 1/(2ζ) = 10 대비 약 -1.6% 차이가 납니다. 불평형 원심력의 r² 비례 항 때문에 완벽한 10이 아니며 정상적인 물리적 특성입니다.',
        },
        {
          question: '감쇠비 ζ를 0.01로 줄였을 때, rpm 간격을 25 → 200 rpm으로 바꾸면 AF는 어떻게 되나요?',
          answer:
            'ζ = 0.01의 이론 AF는 50이고 Half-power 폭(N₂ - N₁)은 약 60 rpm에 불과합니다. 200 rpm 간격으로 성기게 샘플링하면 피크 주변 점이 부족하여 AF가 21.8 수준으로 심각하게 과소평가됩니다.',
        },
        {
          question: '런아웃을 켜면 저속과 피크 진폭에 어떤 변화가 생기고, Slow roll 보상을 켜면 어떻게 되나요?',
          answer:
            '런아웃이 더해지면 정지·저속에서도 8 µm pp(변위 peak 4 µm)의 거짓 진동이 남고, 피크 진폭도 107 µm pp로 왜곡되며 AF 계산값도 틀어집니다. 300 rpm Slow roll 보상을 켜면 참 응답 100 µm pp와 AF ≈ 9.84로 복원됩니다.',
        },
        {
          question: '운전 회전수 N_op를 3600 rpm에서 3200 rpm으로 낮추면 분리여유 SM은 어떻게 변하나요?',
          answer:
            'SM이 약 16.7%에서 약 6.3%로 크게 줄어듭니다. 공진 봉우리 대역(Half-power 대역 N₂ ≈ 3171 rpm)에 근접하여 기계 운전 시 공진 위험이 높아집니다.',
        },
      ]}
      footer={
        <p>
          1자유도 불평형 회전체 모델의 런업 데이터 시뮬레이션입니다. API 684 등 실제 회전기계 진동 규격의
          구체적인 한계 수치는 관련 규격을 참조하세요.
        </p>
      }
    >
      {(viewMode === 'bode' || viewMode === 'both') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Plot
            series={bodeAmpSeries}
            x={{ label: '회전수 [rpm]', range: [0, 6000] }}
            y={{ label: '1X 진폭 [µm pp]', range: [0, maxPlotAmp] }}
            height={220}
            ariaLabel="회전수 변화에 따른 1X 진폭 Bode 곡선과 0.707 피크 Half-power 선"
          />
          <Plot
            series={bodePhaseSeries}
            x={{ label: '회전수 [rpm]', range: [0, 6000] }}
            y={{ label: '위상 지연 [°]', range: [0, 185] }}
            height={160}
            ariaLabel="회전수 변화에 따른 1X 위상 지연 곡선과 90도 공진점"
          />
        </div>
      )}
      {(viewMode === 'polar' || viewMode === 'both') && (
        <div style={{ marginTop: viewMode === 'both' ? 16 : 0 }}>
          <PolarPlot
            series={polarSeries}
            rMax={maxPlotAmp}
            unit="µm pp"
            ariaLabel="1X 벡터가 런업 동안 회전하며 그리는 Polar 고리"
            maxWidth={420}
          />
        </div>
      )}
    </LabFrame>
  );
}
