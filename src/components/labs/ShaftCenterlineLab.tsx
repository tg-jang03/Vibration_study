import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { PROBE } from '../../lib/proximity';
import { journalEquilibrium, measureCenterline, P43_BEARING as bearing } from '../../lib/rotor/journalBearing';
const um = (v: number) => v * 1e6;
const omega = (v: number) => v * Math.PI / 30;
const deg = (v: number) => v * 180 / Math.PI;

export default function ShaftCenterlineLab() {
  const [rpm, setRpm] = useState(3000), [load, setLoad] = useState(1000), [viscosity, setViscosity] = useState(20);
  const [rotation, setRotation] = useState<'ccw' | 'cw'>('ccw');
  const [coldGap, setColdGap] = useState(1.2), [useCold, setUseCold] = useState(true);
  const [drift, setDrift] = useState(0), [runout, setRunout] = useState(false);
  const state = useMemo(() => journalEquilibrium(bearing, load, omega(rpm), viscosity / 1000, rotation), [load, rpm, viscosity, rotation]);
  const measurement = useMemo(() => measureCenterline(bearing, state, { coldGap: coldGap / 1000, useColdPosition: useCold, driftA: drift, runoutAmplitude: runout && rpm > 0 ? 20e-6 : 0 }), [state, coldGap, useCold, drift, runout, rpm]);
  const curve = useMemo(() => Array.from({ length: 121 }, (_, i) => ({ rpm: i * 50, ...journalEquilibrium(bearing, load, omega(i * 50), viscosity / 1000, rotation) })), [load, viscosity, rotation]);
  const cr = um(bearing.radialClearance), measured = measurement.reconstructed;
  const bound = Math.max(cr * 1.35, measured ? Math.max(Math.abs(um(measured.x)), Math.abs(um(measured.y))) * 1.2 : 0);
  const scale = 165 / bound, sx = (v: number) => 210 + um(v) * scale, sy = (v: number) => 210 - um(v) * scale;
  const path = curve.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x)},${sy(p.y)}`).join(' ');
  const reset = () => { setRpm(3000); setLoad(1000); setViscosity(20); setRotation('ccw'); setColdGap(1.2); setUseCold(true); setDrift(0); setRunout(false); };
  return <LabFrame id="LAB-SCL-01" title="유막 지지와 Shaft centerline" controls={<>
    <ParamSlider label="회전수 N" value={rpm} min={0} max={6000} step={100} unit="rpm" onChange={setRpm} />
    <ParamSlider label="수직 하중 W" value={load} min={250} max={2000} step={250} unit="N" onChange={setLoad} />
    <ParamSlider label="점성계수 μ" value={viscosity} min={10} max={40} step={5} unit="mPa·s" onChange={setViscosity} />
    <ParamSelect label="축 자전 방향" value={rotation} options={[{ value: 'ccw', label: '반시계 ↺' }, { value: 'cw', label: '시계 ↻' }]} onChange={setRotation} />
    <ParamSelect label="냉간 프로브 gap" value={coldGap} options={[{ value: 1.2, label: '1.20 mm (선형 범위)' }, { value: .3, label: '0.30 mm (범위 이탈 체험)' }]} onChange={setColdGap} />
    <ParamToggle label="냉간 축 위치 (0, −Cr) 더하기" checked={useCold} onChange={setUseCold} />
    <ParamSlider label="냉간 기록 이후 A 전압 drift" value={drift} min={-.5} max={.5} step={.1} unit="V" onChange={setDrift} />
    <ParamToggle label="평균 0인 runout 20 µm Peak 추가" checked={runout} onChange={setRunout} />
    <button type="button" onClick={reset}>초기화</button>
  </>} tasks={[
    { question: '하중을 1000 → 500 N으로 낮추면 중심과 유막은 어떻게 바뀌나요?', answer: '편심률 0.6758 → 0.5597, 최소 유막 32.42 → 44.03 µm입니다. 중심에 가까워집니다. 같은 정적 위치는 회전수 6000 rpm 또는 점성계수 40 mPa·s에서도 나옵니다.' },
    { question: '초기화 후 냉간 축 위치를 더하지 않으면?', answer: '복원 Y가 위로 100 µm 이동합니다. 변화량만 계산하고 기준 위치를 빠뜨린 결과입니다.' },
    { question: '초기화 후 A drift를 +0.5 V로 만들면?', answer: 'A 프로브 방향으로 63.5 µm 이동해 보입니다. 실제 유막 평형점은 그대로입니다.' },
    { question: '냉간 gap 0.30 mm와 평균 0 runout을 각각 시험하면?', answer: '작은 gap에서는 A가 선형 범위를 벗어나 위치 표시를 중단합니다. 초기화 뒤 평균 0 runout만 켜면 선형 범위·정수 한 회전 평균에서 DC 위치는 그대로입니다.' },
  ]}>
    <p>짧은 원통 베어링: 직경 100 mm, 길이 25 mm, 반경 간극 Cr = 100 µm. 하중은 아래로 작용합니다. 온도·패드 운동·안정성은 계산하지 않습니다.</p>
    <h4>평균 축 중심 위치 (X·Y 같은 축척)</h4>
    <svg viewBox="0 0 420 420" role="img" aria-label="회전수별 평균 축 중심과 DC 전압으로 복원한 위치" style={{ width: '100%', maxWidth: 440, display: 'block', margin: 'auto', color: 'var(--text)' }}>
      <path d="M35,210 H385 M210,35 V385" stroke="var(--text-muted)" opacity=".4" />
      <circle cx="210" cy="210" r={cr * scale} fill="none" stroke="var(--text-muted)" strokeDasharray="5 4" />
      <text x="389" y="226" fill="currentColor">X</text><text x="220" y="30" fill="currentColor">Y</text>
      <text x="35" y="400" fontSize="13" fill="currentColor">±{formatNumber(bound, 4)} µm · 자전 {rotation === 'ccw' ? '↺' : '↻'}</text>
      <path d={path} fill="none" stroke="var(--plot-1)" strokeWidth="2.5" />
      <circle cx={sx(0)} cy={sy(-bearing.radialClearance)} r="4" fill="var(--text-muted)" />
      <text x={sx(0) - 8} y={sy(-bearing.radialClearance) + 17} textAnchor="end" fontSize="12" fill="currentColor">냉간 0 rpm</text>
      {[1000, 3000, 6000].map(n => { const p = curve[n / 50]; return <g key={n}><circle cx={sx(p.x)} cy={sy(p.y)} r="3" fill="var(--plot-1)" /><text x={sx(p.x) + (rotation === 'ccw' ? 10 : -10)} y={sy(p.y) + 4} textAnchor={rotation === 'ccw' ? 'start' : 'end'} fontSize="12" fill="currentColor">{n}</text></g>; })}
      {measured && <line x1={sx(state.x)} y1={sy(state.y)} x2={sx(measured.x)} y2={sy(measured.y)} stroke="var(--plot-2)" strokeDasharray="3 3" />}
      <circle data-center="true" cx={sx(state.x)} cy={sy(state.y)} r="6" fill="var(--plot-1)" />
      {measured && <circle data-center="measured" cx={sx(measured.x)} cy={sy(measured.y)} r="8" fill="none" stroke="var(--plot-2)" strokeWidth="2" />}
    </svg>
    <p>파랑: 유막 모델의 평균 위치와 회전수별 경로. 주황 테두리: A·B DC 전압에서 복원한 현재 위치. 점선 원: 축 중심이 움직일 수 있는 반경 Cr. 각 점은 회전수별 평균이며 오빗이 아닙니다.</p>
    <p role="status"><strong>{measurement.valid ? '선형 범위 OK' : '선형 범위 Not OK — DC 위치 복원 중단'}</strong>. 프로브 법선은 +X에서 A 45°, B 135°입니다. 두 gap 모두 0.25–2.30 mm 안에 있어야 합니다.</p>
    {state.contactReference && <p>0 rpm: 외부 가압 없는 냉간 바닥 접촉 기준입니다. ε = 1, 최소 유막 = 0을 표시하며 회전 유막 평형해가 아닙니다.</p>}
    <h4>회전수와 편심률</h4>
    <Plot series={[{ x: curve.map(p => p.rpm), y: curve.map(p => p.eccentricityRatio), name: '편심률 ε', color: 'var(--plot-1)' }, { x: [rpm], y: [state.eccentricityRatio], mode: 'markers', name: '현재', color: 'var(--plot-2)', hideInLegend: true }]} x={{ label: '회전수 [rpm]', range: [0, 6000] }} y={{ label: '편심률 ε', range: [0, 1] }} height={220} ariaLabel="회전수에 따른 편심률" />
    <h4>회전수와 자세각</h4>
    <Plot series={[{ x: curve.slice(1).map(p => p.rpm), y: curve.slice(1).map(p => deg(p.attitude)), name: '자세각 φ', color: 'var(--plot-1)' }, ...(rpm > 0 ? [{ x: [rpm], y: [deg(state.attitude)], mode: 'markers' as const, name: '현재', color: 'var(--plot-2)', hideInLegend: true }] : [])]} x={{ label: '회전수 [rpm]', range: [0, 6000] }} y={{ label: '자세각 [°]' }} height={220} ariaLabel="회전수에 따른 자세각" />
    <Formula display tex={String.raw`\frac{W C_r^2}{\mu\Omega R L^3}=\frac{\varepsilon\sqrt{16\varepsilon^2+\pi^2(1-\varepsilon^2)}}{4(1-\varepsilon^2)^2},\quad h_{\min}=C_r(1-\varepsilon)`} />
    <Formula display tex={String.raw`\begin{bmatrix}\Delta V_A/S\\\Delta V_B/S\end{bmatrix}=\begin{bmatrix}\cos45^\circ&\sin45^\circ\\\cos135^\circ&\sin135^\circ\end{bmatrix}\begin{bmatrix}x-x_{\rm cold}\\y-y_{\rm cold}\end{bmatrix}`} />
    <ReadoutTable caption="유막 평형과 DC 위치 복원" rows={[
      { label: '편심률 ε', value: state.eccentricityRatio },
      ...(rpm > 0 ? [{ label: '자세각 φ', value: deg(state.attitude), unit: '°' }] : []),
      { label: '최소 유막 hmin', value: um(state.minimumFilm), unit: 'µm' },
      { label: '모델 X', value: um(state.x), unit: 'µm' }, { label: '모델 Y', value: um(state.y), unit: 'µm' },
      ...(measured ? [{ label: 'DC 복원 X', value: um(measured.x), theory: um(state.x), unit: 'µm' }, { label: 'DC 복원 Y', value: um(measured.y), theory: um(state.y), unit: 'µm' }, { label: '복원 위치 오차', value: um(measurement.error!), unit: 'µm' }] : []),
      { label: '평균 전압 VA', value: measurement.voltageA, unit: 'V' }, { label: '평균 전압 VB', value: measurement.voltageB, unit: 'V' },
      { label: '냉간 전압 (A·B)', value: measurement.coldVoltage, unit: 'V' },
      { label: '모델 실제 평균 gap A', value: measurement.gapA * 1000, unit: 'mm' }, { label: '모델 실제 평균 gap B', value: measurement.gapB * 1000, unit: 'mm' },
      { label: '프로브 감도 S', value: PROBE.sensitivity / 1000, unit: 'V/mm' },
    ]} />
    <p>전압은 실제 gap의 모의 교정 곡선에서 만듭니다. 선형 범위에서는 V = −S·gap입니다. 범위를 벗어나면 전압만 남기고 복원 점과 오차는 표시하지 않습니다. 평균 0 runout은 두 채널에 정현파로 넣어 정수 한 회전을 평균합니다.</p>
    <p>축 중심에 가까워졌다는 사실만으로 안정성을 판단할 수 없습니다. 이 계산의 하중·점성계수 변화는 정적 평형을 비교하는 학습 조건입니다.</p>
  </LabFrame>;
}
