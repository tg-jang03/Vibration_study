import {useMemo,useState} from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamSelect from '../ui/ParamSelect';
import Formula from '../ui/Formula';
import ReadoutTable from '../ui/ReadoutTable';
import Plot from '../ui/Plot';
import {bladeModes,bladeFrequency,bladeCrossing,bladeResponse,orderFrequency,CAMP_MAX_RPM} from '../../lib/machine/campbell';
import {formatNumber} from '../../lib/format';

export default function CampbellLab(){
  const [rpm,setRpm]=useState(2400),[f0,setF0]=useState(400),[c,setC]=useState(40),[order,setOrder]=useState(12),[zeta,setZeta]=useState(.02);
  const modes=useMemo(()=>bladeModes(f0,c),[f0,c]);
  const crossings=useMemo(()=>modes.map(m=>bladeCrossing(m,order)),[modes,order]);
  const x=useMemo(()=>[...new Set([...Array.from({length:601},(_,i)=>i*10),rpm,...crossings.filter(v=>v.kind==='inside').map(v=>v.rpm!)])].sort((a,b)=>a-b),[rpm,crossings]);
  const current=modes.map(m=>bladeResponse(rpm,m,order,zeta));
  const reset=()=>{setRpm(2400);setF0(400);setC(40);setOrder(12);setZeta(.02)};
  const status=crossings.map((v,i)=>'모드 '+(i+1)+': '+(v.kind==='none'?'교차 없음 (차수² ≤ 강성화 계수)':v.kind==='outside'?'표시 범위 밖 · '+formatNumber(v.rpm!,6)+' rpm':'범위 안 · '+formatNumber(v.rpm!,6)+' rpm')).join(' / ');
  return <LabFrame id="LAB-CAMP-01" title="회전 강성화와 Campbell 교차" controls={<>
    <ParamSlider label="관측 회전수" value={rpm} min={0} max={6000} step={100} unit="rpm" onChange={setRpm}/>
    <ParamSlider label="모드 1 정지 고유진동수" value={f0} min={200} max={600} step={50} unit="Hz" onChange={setF0}/>
    <ParamSlider label="모드 1 강성화 계수 c" value={c} min={0} max={180} step={4} onChange={setC}/>
    <ParamSelect label="가진 차수 o" value={order} onChange={setOrder} options={[4,8,12,16].map(value=>({value,label:value+'차'}))}/>
    <ParamSlider label="감쇠비 ζ" value={zeta} min={.01} max={.10} step={.01} onChange={setZeta}/>
    <button type="button" onClick={reset}>초기화</button>
  </>} formulas={<>
    <Formula display tex={"f_{n,m}^2=f_{0,m}^2+c_m f_r^2,\\quad f_{exc}=o f_r,\\quad f_r=N/60"}/>
    <Formula display tex={"R_m=\\frac{1}{\\sqrt{(1-r_m^2)^2+(2\\zeta r_m)^2}},\\quad r_m=f_{exc}/f_{n,m}"}/>
  </>} readouts={<ReadoutTable rows={[
    {label:'관측 회전수',value:rpm,unit:'rpm'},
    {label:'가진 주파수',value:orderFrequency(rpm,order),unit:'Hz'},
    ...current.flatMap((v,i)=>[{label:'모드 '+(i+1)+' 고유진동수',value:v.naturalHz,unit:'Hz'},{label:'모드 '+(i+1)+' 응답비',value:v.amplitudeRatio,unit:'—'},{label:'모드 '+(i+1)+' 위상 지연',value:v.phaseLag*180/Math.PI,unit:'°'}]),
    ...crossings.flatMap((v,i)=>v.rpm===null?[]:[{label:'모드 '+(i+1)+' 교차 회전수',value:v.rpm,unit:'rpm',sig:6}]),
  ]}/>} tasks={[
    {question:'기본값에서 교차 회전수를 읽고 c=0으로 바꾸세요.',answer:'모드 1은 2353.39→2000 rpm입니다. 강성화는 이 예제에서 교차를 높은 회전수로 옮깁니다. 모드 2 기본 교차는 3771.71 rpm입니다.'},
    {question:'기본값으로 돌아와 가진 차수를 8차로 바꾸세요.',answer:'모드 1은 4898.98 rpm입니다. 모드 2의 양의 해 6331.74 rpm은 표시 범위 밖입니다. 교차 없음과 구별하세요.'},
    {question:'c=40, 4차에서는? 이어서 12차·c=144에서는?',answer:'4차에서는 두 모드 모두 차수²≤각 모드의 c라 양의 교차가 없습니다. 12차·c=144는 모드 1의 등호 경계라 교차가 없지만 c₂=72인 모드 2에는 교차가 있습니다.'},
    {question:'기본값에서 감쇠비만 0.02→0.08로 바꾸세요.',answer:'교차 위치는 그대로이고 응답 봉우리가 낮아지고 넓어집니다. 정확히 r=1일 때 응답비는 25→6.25, 위상 지연은 모두 90°입니다. 변위 응답의 최대점이 항상 r=1인 것은 아닙니다.'},
  ]} footer={<p>원심 강성화의 경향을 단순화한 가상 두 모드입니다. 모드 2는 f₀₂=1.75f₀₁, c₂=c₁/2로 정합니다. 자이로 효과·온도·모드 결합·가진력 변화는 제외합니다. 각 응답비는 해당 모드의 정적 응답에 대한 비이며 두 곡선을 실제 변위로 합산하지 않습니다. 0 rpm은 정적 극한입니다. 응력·피로수명·실기 운전 허용 범위는 계산하지 않습니다.</p>}>
    <p role="status">{status}</p>
    <Plot series={[
      ...modes.map((m,i)=>({x,y:x.map(n=>bladeFrequency(n,m)),name:'모드 '+(i+1),color:'var(--plot-'+(i+1)+')'})),
      {x,y:x.map(n=>orderFrequency(n,order)),name:order+'차 가진',color:'var(--plot-3)'},
      {x:crossings.filter(v=>v.kind==='inside').map(v=>v.rpm!),y:crossings.filter(v=>v.kind==='inside').map(v=>v.frequency!),name:'교차',mode:'markers' as const,color:'var(--plot-4)'},
      {x:[rpm,rpm],y:current.map(v=>v.naturalHz),name:'관측 모드',mode:'markers' as const,color:'var(--text)'},
    ]} x={{label:'회전수 N [rpm]',range:[0,CAMP_MAX_RPM]}} y={{label:'주파수 [Hz]',range:[0,1700]}} height={300} ariaLabel="Campbell 선도: 두 모드와 가진 차수선"/>
    <Plot series={[
      ...modes.map((m,i)=>({x,y:x.map(n=>bladeResponse(n,m,order,zeta).amplitudeRatio),name:'모드 '+(i+1)+' 응답비',color:'var(--plot-'+(i+1)+')'})),
      {x:[rpm],y:[current[0].amplitudeRatio],name:'관측 모드 1',mode:'markers' as const,color:'var(--plot-4)'},
    ]} x={{label:'회전수 N [rpm]',range:[0,CAMP_MAX_RPM]}} y={{label:'각 모드의 정적 응답 대비 비',range:[0,55]}} height={260} ariaLabel="감쇠에 따른 각 모드의 정규화 응답"/>
  </LabFrame>;
}

