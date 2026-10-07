import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import Formula from '../ui/Formula';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { stabilityExample, stabilityModes, speedCoupledSystem, forwardInitial, sampleStabilityResponse, whirlWhipPreview } from '../../lib/rotor/stability';
const um = (v: number) => v * 1e6;
const statusText = { stable: '안정 (수렴)', marginal: '경계 (감쇠 없음)', unstable: '불안정 (발산)' };
export default function StabilityLab() {
  const [mode, setMode] = useState<'direct' | 'speed'>('direct'), [naturalRpm, setNaturalRpm] = useState(3000);
  const [zeta, setZeta] = useState(.05), [cross, setCross] = useState(.05), [ratio, setRatio] = useState(1), [amplitude, setAmplitude] = useState(20);
  const [released, setReleased] = useState(false), [preview, setPreview] = useState(false);
  const base = useMemo(() => stabilityExample(naturalRpm, zeta, cross), [naturalRpm, zeta, cross]);
  const system = useMemo(() => mode === 'direct' ? base : speedCoupledSystem(base, ratio * Math.sqrt(base.stiffness / base.mass)), [base, mode, ratio]);
  const modes = useMemo(() => stabilityModes(system), [system]);
  const initial = useMemo(() => released ? { position: { re: amplitude / 1e6, im: 0 }, velocity: { re: 0, im: 0 } } : forwardInitial(system, amplitude / 1e6), [system, amplitude, released]);
  const response = useMemo(() => sampleStabilityResponse(system, initial), [system, initial]);
  const curves = useMemo(() => {
    const xs = Array.from({ length: 251 }, (_, i) => (mode === 'direct' ? .5 : 3) * i / 250);
    const values = xs.map(v => stabilityModes(mode === 'direct' ? { ...base, crossStiffness: v * base.stiffness } : speedCoupledSystem(base, v * modes.omegaN)));
    const eigen: PlotSeries[] = [];
    for(const branch of ['forward', 'backward'] as const) for(const sign of [1,-1]) eigen.push({ x: values.map(v => v[branch].re / v.omegaN), y: values.map(v => sign * Math.abs(v[branch].im) / v.omegaN), name: branch === 'forward' ? '정방향 모드 쌍' : '역방향 모드 쌍', color: branch === 'forward' ? 'var(--plot-1)' : 'var(--plot-2)', hideInLegend: sign < 0 });
    eigen.push({ x: [0,0], y: [-1.2,1.2], name: 'σ=0', color: 'var(--text-muted)', dash: 'dash' }, { x: modes.eigenvalues.map(v=>v.re/modes.omegaN), y: modes.eigenvalues.map(v=>v.im/modes.omegaN), name: '현재 네 근', mode:'markers', color:'var(--plot-3)', markerSize:8 });
    const delta = values.map(v=>v.logDecrement), limit = mode === 'direct' ? 2*zeta : 2;
    return { eigen, delta: [
      { x:xs, y:delta, name:'정방향 δ', color:'var(--plot-1)' },
      { x:[limit,limit], y:[Math.min(...delta),Math.max(...delta)], name:'안정 한계', color:'var(--text-muted)', dash:'dash' },
      { x:[mode === 'direct' ? cross : ratio], y:[modes.logDecrement], mode:'markers', name:'현재', color:'var(--plot-3)', markerSize:8 },
    ] satisfies PlotSeries[] };
  }, [base, mode, modes, cross, ratio, zeta]);
  const previewLines = useMemo(() => whirlWhipPreview(naturalRpm / 60).map((p,i): PlotSeries => ({ x:p.frequencies, y:p.normalized.map(v=>p.rpm/naturalRpm+.14*v), name:i===0?'가상 봉우리 (높이 정규화)':String(p.rpm), color:'var(--plot-2)', hideInLegend:i!==0 })), [naturalRpm]);
  const bound = Math.max(amplitude, ...response.map(p=>Math.max(Math.abs(um(p.position.re)),Math.abs(um(p.position.im))))) * 1.2;
  const scale = 165/bound, sx = (v:number)=>210+um(v)*scale, sy=(v:number)=>210-um(v)*scale;
  const path = response.map((p,i)=>`${i?'L':'M'}${sx(p.position.re)},${sy(p.position.im)}`).join(' '), last=response.at(-1)!;
  const reset=()=>{setMode('direct');setNaturalRpm(3000);setZeta(.05);setCross(.05);setRatio(1);setAmplitude(20);setReleased(false);setPreview(false);};
  return <LabFrame id="LAB-STB-01" title="교차연성과 안정성" controls={<>
    <ParamSelect label="교차연성 입력 방식" value={mode} options={[{value:'direct',label:'q 직접: q/k 조작'},{value:'speed',label:'속도 연동: q = cΩ/2'}]} onChange={setMode}/>
    <ParamSlider label="무감쇠 고유 회전수 Nn (강성 조작)" value={naturalRpm} min={1000} max={4000} step={250} unit="rpm" onChange={setNaturalRpm}/>
    <ParamSlider label="직접 감쇠비 ζ" value={zeta} min={.01} max={.2} step={.01} onChange={setZeta}/>
    <ParamSlider label="교차 강성비 q/k" value={cross} min={0} max={.5} step={.01} disabled={mode!=='direct'} onChange={setCross}/>
    <ParamSlider label="회전수 비 r = Ω/ωn" value={ratio} min={0} max={3} step={.05} disabled={mode!=='speed'} onChange={setRatio}/>
    <ParamSlider label="초기 변위 A" value={amplitude} min={5} max={50} step={5} unit="µm" onChange={setAmplitude}/>
    <ParamToggle label="정지에서 놓기 (초기 속도 0)" checked={released} onChange={setReleased}/>
    <ParamToggle label="가상 Whirl → Whip 캐스케이드 미리보기" checked={preview} onChange={setPreview}/>
    <button type="button" onClick={reset}>초기화</button>
  </>} tasks={[
    {question:'ζ=0.05에서 q/k를 0.05 → 0.10 → 0.15로 바꾸면?',answer:'δ는 +0.1571 → 0 → −0.1561입니다. 순서대로 수렴·경계·발산입니다. 고유치의 실수부가 가장 큰 정방향 모드를 봅니다.'},
    {question:'q 직접 입력 방식, q/k=0.15에서 ζ를 0.10으로 올리면?',answer:'직접 c가 2배가 되어 한계 q/k가 0.10에서 0.20으로 옮겨집니다. q/k=0.15는 안정 쪽으로 바뀝니다.'},
    {question:'속도 연동 방식에서 ζ를 바꿔도 한계 r=2가 그대로인 이유는?',answer:'q=cΩ/2에서는 c를 키울 때 교차 강성 q도 함께 커집니다. 실제 기계의 감쇠 대책이 무효라는 결론은 아닙니다.'},
    {question:'q/k=0에서 정지에서 놓기를 켜면?',answer:'Y=0인 직선 왕복이 됩니다. 기본 정방향 모드에는 초기 속도가 포함되어 있어 q=0에서도 줄어드는 원 선회입니다.'},
    {question:'발산을 표시 시간 끝에서 멈추면 실제 기계도 그 진폭에 머무르나요?',answer:'아닙니다. 그래프는 최대 8 고유 주기 동안 초기 모드 포락선의 20배를 넘기기 전에 표시를 끝냅니다. 접촉·포화·비선형 진폭은 계산하지 않습니다.'},
  ]}>
    <p>질량 10 kg, +X 오른쪽·+Y 위·자전 반시계. Fx_cross = −qy, Fy_cross = +qx. 등방 직접 k,c와 반대칭 교차 강성만 남긴 선형 모델입니다. 원점은 평균 평형 위치입니다.</p>
    <p role="status"><strong>{statusText[modes.status]}</strong> · q/k = {formatNumber(system.crossStiffness/system.stiffness,4)}, 한계 q/k = {formatNumber(2*zeta,4)}. {mode==='speed' ? `현재 ${formatNumber(naturalRpm*ratio,5)} rpm, 이 모델의 한계 ${formatNumber(2*naturalRpm,5)} rpm.` : 'q 직접 입력 방식에서는 회전수가 독립 입력으로 들어가지 않습니다.'}</p>
    <h4>자유응답 오빗 (X·Y 같은 축척)</h4>
    <svg viewBox="0 0 420 420" role="img" aria-label={`자유응답: ${statusText[modes.status]}`} style={{width:'100%',maxWidth:440,display:'block',margin:'auto',color:'var(--text)'}}>
      <path d="M35,210 H385 M210,35 V385" stroke="var(--text-muted)" opacity=".4"/>
      <path d={path} fill="none" stroke="var(--plot-1)" strokeWidth="2"/>
      <circle cx={sx(initial.position.re)} cy={sy(initial.position.im)} r="5" fill="var(--plot-3)"/>
      <circle cx={sx(last.position.re)} cy={sy(last.position.im)} r="5" fill="var(--plot-2)"/>
      <text x="389" y="226" fill="currentColor">X</text><text x="220" y="30" fill="currentColor">Y</text>
      <text x="30" y="400" fontSize="13" fill="currentColor">±{formatNumber(bound,4)} µm · 초록 시작 / 주황 끝</text>
    </svg>
    <p>{released?'초기 속도 0으로 놓은 두 모드의 합입니다.':'정방향 모드만 표시합니다. 초기 속도는 λf·A이므로 처음부터 선회합니다.'} 표시 시간 {formatNumber(last.time*1000,4)} ms. 최대 8 고유 주기 동안, 초기 모드 포락선의 20배를 넘기기 전에 표시를 끝내며, 실제 진폭 포화가 아닙니다.</p>
    <h4>X 시간파형과 포락선</h4>
    <Plot series={[{x:response.map(p=>p.time*1000),y:response.map(p=>um(p.position.re)),name:'X',color:'var(--plot-1)'},{x:response.map(p=>p.time*1000),y:response.map(p=>um(p.envelope)),name:released?'두 모드 합의 상한':'정방향 진폭 포락선',color:'var(--plot-2)',dash:'dash'},{x:response.map(p=>p.time*1000),y:response.map(p=>-um(p.envelope)),name:'하한',color:'var(--plot-2)',dash:'dash',hideInLegend:true}]} x={{label:'시간 [ms]'}} y={{label:'변위 [µm]'}} height={240} ariaLabel="X 자유응답과 진폭 포락선"/>
    <h4>실수 상태계의 네 고유치</h4>
    <Plot series={curves.eigen} x={{label:'성장률 σ/ωn',range:[-.75,.3]}} y={{label:'Im(λ)/ωn',range:[-1.2,1.2]}} height={280} ariaLabel="정방향·역방향 고유치 궤적"/>
    <p>현재점 네 개 중 같은 점이 겹칠 수 있습니다. 세로 점선 오른쪽에 하나라도 있으면 불안정합니다. 정방향·역방향 모드 각각에 실수 상태계의 켤레쌍이 있습니다.</p>
    <h4>정방향 모드 Log decrement와 한계</h4>
    <Plot series={curves.delta} x={{label:mode==='direct'?'교차 강성비 q/k':'회전수 비 Ω/ωn',range:[0,mode==='direct'?.5:3]}} y={{label:'Log decrement δ'}} height={240} ariaLabel="교차연성에 따른 모드 Log decrement"/>
    <Formula display tex={String.raw`m\lambda^2+c\lambda+k-jq=0,\quad \delta=-\frac{2\pi\sigma_f}{\omega_f}=${texNumber(modes.logDecrement,4)}`} />
    <Formula display tex={String.raw`q_{\rm crit}=c\omega_n=2\zeta k,\quad q=c\Omega/2\ \Rightarrow\ \Omega_{\rm crit}=2\omega_n`} />
    <ReadoutTable caption="모드와 안정 한계" rows={[
      {label:'직접 강성 k',value:system.stiffness,unit:'N/m',sig:6},{label:'직접 감쇠 c',value:system.damping,unit:'N·s/m'},{label:'교차 강성 q',value:system.crossStiffness,unit:'N/m'},
      {label:'정방향 성장률 σf',value:modes.forward.re,unit:'1/s'},{label:'정방향 주파수 ωf',value:modes.forward.im,unit:'rad/s'},
      {label:'역방향 성장률 σb',value:modes.backward.re,unit:'1/s'},{label:'역방향 주파수 크기',value:Math.abs(modes.backward.im),unit:'rad/s'},
      ...(mode==='speed' && ratio>0 ? [{label:'모드 선회 차수 ωf/Ω',value:modes.forward.im/(ratio*modes.omegaN),unit:'X'}] : []),
      {label:'Log decrement δ',value:modes.logDecrement},{label:'모드 한 주기 진폭비',value:Math.exp(-modes.logDecrement)},
      {label:'한계 q/k',value:modes.criticalCrossStiffness/system.stiffness},{label:'속도 연동 모델 한계 r',value:2},
      {label:'표시 시간',value:last.time*1000,unit:'ms'},{label:'초기 X 속도',value:initial.velocity.re*1000,unit:'mm/s'},{label:'초기 Y 속도',value:initial.velocity.im*1000,unit:'mm/s'},
    ]}/>
    <p>δ는 모드 한 주기 진폭비의 로그 ln[A(t)/A(t+T)]입니다. 두 모드가 섞인 초기 응답의 연속 피크에서 그대로 측정하는 값은 아닙니다. q=0의 정지에서 놓기는 P1-3의 감쇠 자유진동과 같습니다.</p>
    {preview && <>
      <h4>별도 가상 그림: Whirl → Whip</h4>
      <Plot series={previewLines} x={{label:'주파수 [Hz]',range:[0,2.1*naturalRpm/60]}} y={{label:'회전수 / Nn + 정규화 높이',range:[1.4,3.3]}} height={300} ariaLabel="가상 0.45X 추종에서 고정 모드 주파수로 바뀌는 캐스케이드"/>
      <p>봉우리를 min(0.45×회전 주파수, Nn/60)에 놓았습니다. Nn={naturalRpm} rpm이면 고정선은 {formatNumber(naturalRpm/60,4)} Hz, 가상 전환점은 {formatNumber(naturalRpm/.45,5)} rpm입니다. 높이는 모두 정규화했습니다. 실제 FFT·유막 해·진폭이나 발생 한계 예측이 아니며 위 고유치 계산과 분리되어 있습니다.</p>
    </>}
  </LabFrame>;
}
