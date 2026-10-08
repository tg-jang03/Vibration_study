import {useMemo,useState} from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import ReadoutTable from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import Plot from '../ui/Plot';
import {formatNumber as fmt,texNumber as tex} from '../../lib/format';
import {ADMISSION_LABELS,ST_DEFAULT as D,steamState,steamLoadCurve,steamFreeResponse,type Admission} from '../../lib/rotor/steam';
const statusText={stable:'안정: 자유응답 수렴',marginal:'경계: 자유응답 감쇠 없음',unstable:'불안정: 자유응답 성장'};
const um=(v:number)=>v*1e6;
export default function SteamLoadLab({initialAdmission='full'}:{initialAdmission?:Admission}) {
  const [load,setLoad]=useState(50),[admission,setAdmission]=useState<Admission>(initialAdmission);
  const [zeta,setZeta]=useState(6),[viscosity,setViscosity]=useState(20);
  const [seal,setSeal]=useState(3),[gain,setGain]=useState(15),[amplitude,setAmplitude]=useState(5),[wave,setWave]=useState(false);
  const options=useMemo(()=>({load:load/100,admission,zeta:zeta/100,viscosity:viscosity/1000,sealRatio:seal/100,loadRatio:gain/100}),[load,admission,zeta,viscosity,seal,gain]);
  const state=useMemo(()=>steamState(options),[options]),curve=useMemo(()=>steamLoadCurve(options),[options]);
  const response=useMemo(()=>steamFreeResponse(options,amplitude*1e-6),[options,amplitude]);
  const loads=curve.map(s=>s.load*100),deltas=curve.map(s=>s.modes.logDecrement);
  const limit=state.threshold===null?null:state.threshold*100;
  const deltaRange:[number,number]=[Math.min(-.05,...deltas)*1.15,Math.max(.05,...deltas)*1.15];
  const scope=110,scale=170/scope,sx=(x:number)=>210+um(x)*scale,sy=(y:number)=>210-um(y)*scale;
  const path=curve.map((s,i)=>`${i?'L':'M'}${sx(s.journal.x).toFixed(4)},${sy(s.journal.y).toFixed(4)}`).join(' ');
  const circle=(v:number)=>v*scale;
  const deltaMarker=(x:number,name:string,color:string)=>({x:[x,x],y:deltaRange,name,color,dash:'dash' as const});
  const reset=()=>{setLoad(D.load*100);setAdmission(initialAdmission);setZeta(D.zeta*100);setViscosity(D.viscosity*1000);setSeal(D.sealRatio*100);setGain(D.loadRatio*100);setAmplitude(um(D.amplitude));setWave(false);};
  return <LabFrame id="LAB-ST-01" title="ST 부하와 부분 분사: 경계와 중심 위치"
    controls={<>
      <ParamSlider label="부하 ℓ" value={load} min={0} max={100} step={1} unit="%" onChange={setLoad}/>
      <ParamSelect label="분사 합력 예제" value={admission} options={(Object.keys(ADMISSION_LABELS) as Admission[]).map(value=>({value,label:ADMISSION_LABELS[value]}))} onChange={setAdmission}/>
      <ParamSlider label="모드 감쇠비 ζ" value={zeta} min={2} max={12} step={1} unit="%" onChange={setZeta}/>
      <ParamSlider label="점성계수 μ" value={viscosity} min={10} max={40} step={5} unit="mPa·s" onChange={setViscosity}/>
      <ParamSlider label="기본 교차연성 q₀/k" value={seal} min={0} max={6} step={.5} unit="%" onChange={setSeal}/>
      <ParamSlider label="부하 100%의 교차연성 증가 qL/k" value={gain} min={0} max={30} step={1} unit="%" onChange={setGain}/>
      <ParamSlider label="자유응답 초기 진폭" value={amplitude} min={1} max={10} step={1} unit="µm Peak" onChange={setAmplitude}/>
      <ParamToggle label="X 자유응답 함께 보기" checked={wave} onChange={setWave}/>
      <button type="button" onClick={reset}>초기화</button>
    </>}
    formulas={<>
      <Formula display tex={`q/k=q_0/k+(q_L/k)\\ell=${tex(seal/100,3)}+${tex(gain/100,3)}\\ell,\\quad q_{\\rm crit}/k=2\\zeta=${tex(2*zeta/100,3)}`}/>
      <Formula display tex={`A(t)=A_0e^{\\sigma t},\\quad\\sigma=${tex(state.modes.forward.re,4)}\\,\\mathrm{s}^{-1},\\quad\\delta=-2\\pi\\sigma/\\omega_f=${tex(state.modes.logDecrement,4)}`}/>
    </>}
    readouts={<ReadoutTable rows={[
      {label:'합력 X',value:state.totalForce.x,unit:'N'},
      {label:'합력 Y',value:state.totalForce.y,unit:'N'},
      {label:'베어링 하중 크기',value:state.bearingLoad,unit:'N'},
      {label:'정적 중심 X',value:um(state.journal.x),unit:'µm'},
      {label:'정적 중심 Y',value:um(state.journal.y),unit:'µm'},
      {label:'정적 편심률 ε',value:state.journal.eccentricityRatio},
      {label:'최소 유막 hmin',value:um(state.journal.minimumFilm),unit:'µm'},
      {label:'가상 부하 경계 ℓ*',value:limit??NaN,unit:'%'},
      {label:'성장률 σ',value:state.modes.forward.re,unit:'1/s'},
      {label:'Log decrement δ',value:state.modes.logDecrement},
      {label:'가상 모드 주파수',value:state.modeHz,unit:'Hz'},
      {label:'모드 주파수 / 1X',value:state.modeHz/state.rotatingHz,unit:'X'},
      {label:'자유응답 끝 진폭',value:um(response.at(-1)!.envelope),unit:'µm Peak'},
    ]}/>}
    tasks={[
      {question:'기본 ζ 6%에서 부하 50·60·80%를 비교하세요.',answer:'50%는 δ>0의 수렴, 60%는 σ=δ=0의 경계, 80%는 δ<0의 성장입니다. 경계는 지정한 q/k 법칙의 60%이며 실제 ST 운전 제한이 아닙니다.'},
      {question:'부분 분사 상향, 부하 50%에서 전주 분사와 비교하세요. 안정 경계는?',answer:'하중은 1000→400 N, 편심률은 0.6758보다 작아지고 유막은 두꺼워집니다. 이 정적 계산에서 동계수를 얻지 않으므로 ζ를 유지하면 별도 안정 경계는 60% 그대로입니다.'},
      {question:'ζ를 6→4%로 바꾸면? 초기 진폭을 5→10 µm로 바꾸면?',answer:'감쇠 변경 시 경계는 60→33.33%입니다. 초기 진폭 2배는 자유응답도 2배로 만들지만 고유치·경계는 바뀌지 않습니다.'},
    ]}
    footer={<p>모든 부하·힘·동계수는 학습용 지정값입니다. 반시계 3000 rpm, 짧은 원통 베어링 R50 mm·L25 mm·Cr100 µm·중력 1000 N. 부분 분사 순 반경력은 600 sin(πℓ) N입니다. 정적 ε에서 모드 감쇠·증기/씰 교차연성을 계산하지 않습니다. 주파수선은 고유치에서 얻은 모드이며 관측 스펙트럼이 아닙니다. 자유응답은 최대 8고유주기·20배 성장 이전만 표시하고 운전진폭·비선형 포화를 예측하지 않습니다. 경계 —는 0~100% 안의 유일한 경계가 없다는 뜻입니다.</p>}
  >
    <p role="status">{statusText[state.modes.status]}. {limit===null?'구간 안의 유일한 부하 경계 없음':`지정 모델 경계 ${fmt(limit,4)}%`}. 이 예제의 편심률과 안정성 계수는 별도 계산입니다.</p>
    <h4>부하를 올릴 때: δ의 부호와 모드 주파수</h4>
    <Plot series={[{x:loads,y:deltas,name:'δ',color:'var(--plot-1)'},deltaMarker(load,'현재 부하','var(--plot-2)'),...(limit===null?[]:[deltaMarker(limit,'가상 경계','var(--plot-4)')]),{x:[0,100],y:[0,0],name:'δ=0',color:'var(--text-muted)',dash:'dash'}]} x={{label:'부하 [%]',range:[0,100]}} y={{label:'Log decrement δ',range:deltaRange}} height={220} ariaLabel="ST 부하와 안정성 경계"/>
    <Plot series={[
      {x:loads,y:curve.map(s=>s.modeHz),name:'가상 모드 f',color:'var(--text-muted)',dash:'dash'},
      {x:loads,y:curve.map(s=>s.modes.status==='unstable'?s.modeHz:NaN),name:'성장하는 모드',color:'var(--plot-2)',width:3},
      {x:[0,100],y:[50,50],name:'1X · 회전수 고정',color:'var(--plot-1)'},
    ]} x={{label:'부하 [%]',range:[0,100]}} y={{label:'주파수 [Hz]',range:[0,55]}} height={200} ariaLabel="ST 일정 회전수의 모드 주파수와 1X"/>
    <h4>같은 초기 상태의 자유응답</h4>
    <Plot series={[
      {x:response.map(r=>r.time),y:response.map(r=>um(r.envelope)),name:'자유응답 포락선',color:'var(--plot-2)'},
      ...(wave?[{x:response.map(r=>r.time),y:response.map(r=>um(r.position.re)),name:'X 자유응답',color:'var(--plot-1)'}]:[]),
    ]} x={{label:'시각 [s]'}} y={{label:'변위 [µm Peak]'}} height={220} ariaLabel="ST 선형 자유응답의 감소 또는 성장"/>
    <h4>합력 방향과 정적 Shaft centerline</h4>
    <svg viewBox="0 0 420 440" role="img" aria-label="ST 동일 축척 정적 중심 위치" style={{display:'block',width:'100%',maxWidth:560,margin:'0 auto'}}>
      <circle cx={210} cy={210} r={circle(100)} fill="none" stroke="var(--text-muted)" strokeDasharray="5 4"/>
      <path d="M40 210H380M210 40V380" fill="none" stroke="var(--border)"/>
      <path d={path} fill="none" stroke="var(--plot-1)" strokeWidth={2}/>
      <path d={`M210 210L${sx(state.journal.x).toFixed(4)} ${sy(state.journal.y).toFixed(4)}`} stroke="var(--plot-2)"/>
      <circle cx={sx(state.journal.x)} cy={sy(state.journal.y)} r={5} fill="var(--plot-2)"/>
      <text x={215} y={30} fontSize={13} fill="var(--text-muted)">+Y [µm]</text>
      <text x={335} y={205} fontSize={13} fill="var(--text-muted)">+X [µm]</text>
      <text x={210} y={415} textAnchor="middle" fontSize={13} fill="var(--text)">점선 Cr100 µm · 파랑: 부하 0~100% · 주황: 현재</text>
    </svg>
  </LabFrame>;
}
