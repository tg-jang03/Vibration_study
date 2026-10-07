import { useEffect, useId, useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { exampleRotor, jeffcottResponse, orbitPoint, sampleOrbit } from '../../lib/rotor/jeffcott';

const um = (m: number) => m * 1e6;
const omega = (rpm: number) => rpm * Math.PI / 30;
const deg = (r: number) => r * 180 / Math.PI;
const directionText = { forward: '정방향 (반시계)', backward: '역방향 (시계)', line: '직선 왕복', stationary: '정지' };
interface Props { initialRpm?: number; initialRatio?: number; initialZeta?: number }

export default function JeffcottLab({ initialRpm = 3000, initialRatio = 1, initialZeta = .05 }: Props) {
  const [rpm, setRpm] = useState(initialRpm);
  const [ratio, setRatio] = useState(initialRatio);
  const [zeta, setZeta] = useState(initialZeta);
  const [playing, setPlaying] = useState(false);
  const [angle, setAngle] = useState(0);
  const arrowId = useId().replace(/:/g, '');
  const rotor = useMemo(() => exampleRotor(ratio, zeta), [ratio, zeta]);
  const response = useMemo(() => jeffcottResponse(rotor, omega(rpm)), [rotor, rpm]);
  const orbit = useMemo(() => sampleOrbit(response), [response]);
  const curves = useMemo(() => {
    const speeds = Array.from({ length: 501 }, (_, i) => i * 15);
    const values = speeds.map(n => jeffcottResponse(rotor, omega(n)));
    const make = (key: 'amplitudeX' | 'amplitudeY' | 'amplitudeForward' | 'amplitudeBackward', name: string, color: string): PlotSeries => ({ x: speeds, y: values.map(v => um(v[key])), name, color });
    const current = (key: 'amplitudeX' | 'amplitudeY' | 'amplitudeForward' | 'amplitudeBackward', color: string): PlotSeries => ({ x: [rpm], y: [um(response[key])], name: '현재', color, mode: 'markers', markerSize: 8, hideInLegend: true });
    return {
      xy: [make('amplitudeX', 'X', 'var(--plot-1)'), make('amplitudeY', 'Y', 'var(--plot-2)'), current('amplitudeX', 'var(--plot-1)'), current('amplitudeY', 'var(--plot-2)')],
      components: [make('amplitudeForward', '|Af| 정방향', 'var(--plot-1)'), make('amplitudeBackward', '|Ab| 역방향', 'var(--plot-2)'), current('amplitudeForward', 'var(--plot-1)'), current('amplitudeBackward', 'var(--plot-2)')],
      wave: [
        { x: orbit.map(p => rpm === 0 ? p.theta / (2 * Math.PI) : p.theta / omega(rpm) * 1000), y: orbit.map(p => um(p.x)), name: 'X', color: 'var(--plot-1)' },
        { x: orbit.map(p => rpm === 0 ? p.theta / (2 * Math.PI) : p.theta / omega(rpm) * 1000), y: orbit.map(p => um(p.y)), name: 'Y', color: 'var(--plot-2)' },
      ] satisfies PlotSeries[],
    };
  }, [rotor, rpm, response, orbit]);
  useEffect(() => { setPlaying(false); setAngle(0); }, [rpm, ratio, zeta]);
  useEffect(() => {
    if (!playing || rpm === 0) return;
    let handle = 0, previous: number | undefined;
    const tick = (now: number) => {
      if (previous !== undefined) { const dt = Math.min((now - previous) / 1000, .1); setAngle(a => (a + dt * 2 * Math.PI * rpm / 3000) % (2 * Math.PI)); }
      previous = now;
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [playing, rpm]);

  const point = orbitPoint(response, angle), key = orbitPoint(response, 0);
  const bound = Math.max(um(response.amplitudeForward + response.amplitudeBackward) * 1.2, 12);
  const scale = 160 / bound;
  const sx = (v: number) => 210 + um(v) * scale;
  const sy = (v: number) => 210 - um(v) * scale;
  const path = (x: 'x' | 'forwardX' | 'backwardX', y: 'y' | 'forwardY' | 'backwardY') => orbit.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p[x])},${sy(p[y])}`).join(' ');
  const next = orbitPoint(response, angle + .12);
  const reset = () => { setRpm(initialRpm); setRatio(initialRatio); setZeta(initialZeta); setPlaying(false); setAngle(0); };

  return <LabFrame id="LAB-JEF-01" title="Jeffcott 로터: 선회와 오빗" controls={<>
    <ParamSlider label="회전수 N" value={rpm} min={0} max={7500} step={25} unit="rpm" onChange={setRpm} />
    <ParamSlider label="강성비 ky/kx" value={ratio} min={1} max={1.6} step={.05} onChange={setRatio} />
    <ParamSlider label="x방향 감쇠비 ζx" value={zeta} min={.01} max={.2} step={.01} onChange={setZeta} />
    <ParamToggle label="오빗 재생 (실제 속도의 1/50)" checked={playing} onChange={v => setPlaying(v && rpm > 0)} />
    <button type="button" onClick={reset}>초기화</button>
  </>} tasks={[
    { question: '3000 rpm, 강성비 1에서 역방향 성분은 얼마인가요?', answer: '정방향 100 µm, 역방향 0 µm입니다. 반지름 100 µm의 원을 반시계로 돕니다.' },
    { question: '강성비 1.3, 3200 rpm, 감쇠비 0.05에서는 어느 방향으로 도나요?', answer: '정방향 36.11 µm보다 역방향 50.45 µm가 커서 시계로 도는 타원입니다.' },
    { question: '같은 조건에서 감쇠비를 0.2로 올리면?', answer: '정방향 23.73 µm, 역방향 8.339 µm가 되어 반시계로 바뀝니다. 감쇠가 있으면 두 고유 회전수 사이 전체가 역방향은 아닙니다.' },
  ]}>
    <p>질량 10 kg, 편심 거리 10 µm, Nₓ = 3000 rpm. 감쇠계수 c는 두 방향에 공통입니다. 모든 진폭은 µm Peak입니다.</p>
    <h4>축 단면의 오빗 (X·Y 같은 축척)</h4>
    <svg viewBox="0 0 420 420" role="img" aria-label={`오빗: ${directionText[response.direction]}`} style={{ display: 'block', width: '100%', maxWidth: 440, margin: 'auto', color: 'var(--text)' }}>
      <defs><marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--plot-3)" /></marker></defs>
      <path d="M35,210 H385 M210,35 V385" stroke="var(--text-muted)" opacity=".4" />
      <text x="389" y="226" fill="currentColor">X</text><text x="220" y="30" fill="currentColor">Y</text>
      <text x="40" y="404" fill="currentColor" fontSize="13">축 범위 ±{formatNumber(bound, 3)} µm · 자전 ↺</text>
      <path d={path('forwardX', 'forwardY')} fill="none" stroke="var(--plot-1)" strokeWidth="2" strokeDasharray="5 4" />
      <path d={path('backwardX', 'backwardY')} fill="none" stroke="var(--plot-2)" strokeWidth="2" strokeDasharray="3 3" />
      <path d={path('x', 'y')} fill="none" stroke="var(--plot-3)" strokeWidth="2.5" />
      <line x1="210" y1="210" x2={sx(point.forwardX)} y2={sy(point.forwardY)} stroke="var(--plot-1)" />
      <line x1={sx(point.forwardX)} y1={sy(point.forwardY)} x2={sx(point.x)} y2={sy(point.y)} stroke="var(--plot-2)" />
      <circle cx={sx(key.x)} cy={sy(key.y)} r="5" fill="var(--text)" /><text x={sx(key.x) + (key.x > 0 ? -8 : 8)} y={sy(key.y) - 8} textAnchor={key.x > 0 ? "end" : "start"} fontSize="12" fill="currentColor">키페이저 θ=0</text>
      {rpm > 0 && <line x1={sx(point.x)} y1={sy(point.y)} x2={sx(next.x)} y2={sy(next.y)} stroke="var(--plot-3)" strokeWidth="2" markerEnd={`url(#${arrowId})`} />}
      <circle cx={sx(point.x)} cy={sy(point.y)} r="4" fill="var(--plot-3)" />
    </svg>
    <p>파랑: 정방향 원 · 주황: 역방향 원 · 초록: 두 벡터를 합한 실제 오빗. 선회: <strong>{directionText[response.direction]}</strong>.</p>
    <h4>X·Y 시간파형: 한 회전</h4>
    <Plot series={curves.wave} x={{ label: rpm === 0 ? '정지 (회전 없음)' : '시간 [ms]' }} y={{ label: '변위 [µm]' }} height={220} ariaLabel="X와 Y의 한 회전 시간파형" />
    <h4>X·Y 진폭과 두 고유 회전수</h4>
    <p>Nₓ = 3000 rpm, Nᵧ = {formatNumber(response.omegaY * 30 / Math.PI, 5)} rpm. 감쇠가 있으면 진폭 피크가 이 값보다 약간 위에 생깁니다. 점은 현재 회전수입니다.</p>
    <Plot series={curves.xy} x={{ label: '회전수 [rpm]', range: [0, 7500] }} y={{ label: '진폭 [µm Peak]' }} height={240} ariaLabel="회전수에 따른 X와 Y 진폭" />
    <h4>정방향과 역방향 성분</h4>
    <Plot series={curves.components} x={{ label: '회전수 [rpm]', range: [0, 7500] }} y={{ label: '원 반지름 [µm]' }} height={240} ariaLabel="회전수에 따른 정방향과 역방향 성분" />
    <Formula display tex={String.raw`m\ddot x+c\dot x+k_xx=me\Omega^2\cos\Omega t,\quad m\ddot y+c\dot y+k_yy=me\Omega^2\sin\Omega t`} />
    <Formula display tex={String.raw`z=A_f e^{j\Omega t}+A_b e^{-j\Omega t},\quad |A_f|=${texNumber(um(response.amplitudeForward), 4)}\,\mu\mathrm{m},\quad |A_b|=${texNumber(um(response.amplitudeBackward), 4)}\,\mu\mathrm{m}`} />
    <ReadoutTable rows={[
      { label: 'Nₓ (무감쇠 임계속도)', value: response.omegaX * 30 / Math.PI, unit: 'rpm' },
      { label: 'Nᵧ (무감쇠 임계속도)', value: response.omegaY * 30 / Math.PI, unit: 'rpm' },
      { label: 'X 진폭', value: um(response.amplitudeX), unit: 'µm Peak' },
      { label: 'Y 진폭', value: um(response.amplitudeY), unit: 'µm Peak' },
      ...(rpm > 0 ? [{ label: 'X 키페이저 기준 지연', value: deg(response.lagX), unit: '°' }, { label: 'Y 키페이저 기준 지연', value: deg(response.lagY) + 90, unit: '°' }] : []),
      { label: '|Af| 정방향', value: um(response.amplitudeForward), unit: 'µm' },
      { label: '|Ab| 역방향', value: um(response.amplitudeBackward), unit: 'µm', ...(ratio === 1 ? { theory: 0 } : {}) },
    ]} />
    <p>{rpm === 0 ? '정지 상태에서는 위상이 정의되지 않습니다.' : '키페이저 순간을 cos 기준 0°로 놓았습니다. X 지연은 lagX, Y 지연은 lagY+90°입니다. 등방이면 Y가 X보다 90° 늦어 반시계 원이 됩니다.'}</p>
  </LabFrame>;
}
