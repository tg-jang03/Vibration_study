import {useMemo,useState} from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ReadoutTable from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import Plot from '../ui/Plot';
import PolarPlot from '../ui/PolarPlot';
import {fieldResponse,fieldSeries,FIELD_LABELS,type FieldKind} from '../../lib/machine/generator';
export default function GeneratorFieldLab({initialLagDeg=90}:{initialLagDeg?:number}) {
  const [kind,setKind]=useState<FieldKind>('thermal'),[before,setBefore]=useState(50),[after,setAfter]=useState(100);
  const [tau,setTau]=useState(2),[gain,setGain]=useState(15),[lag,setLag]=useState(initialLagDeg),[time,setTime]=useState(2);
  const options=useMemo(()=>({kind,before:before/100,after:after/100,tau:tau*60,gain:gain*1e-6,lag:lag*Math.PI/180}),[kind,before,after,tau,gain,lag]);
  const curve=useMemo(()=>fieldSeries(options),[options]),v=fieldResponse(time*60,options);
  const reset=()=>{setKind('thermal');setBefore(50);setAfter(100);setTau(2);setGain(15);setLag(initialLagDeg);setTime(2)};
  const x=curve.map(p=>p.time/60),amp=curve.map(p=>p.oneX.amp*1e6),angle=curve.map(p=>p.phaseDeg??NaN);
  return <LabFrame id="LAB-GEN-01" title="발전기 계자 전류와 1X 벡터" controls={<>
    <ParamSelect label="응답 비교" value={kind} onChange={setKind} options={(Object.keys(FIELD_LABELS) as FieldKind[]).map(value=>({value,label:FIELD_LABELS[value]}))}/>
    <ParamSlider label="변경 전 계자 전류" value={before} min={0} max={120} step={10} unit="%" onChange={setBefore}/>
    <ParamSlider label="변경 후 계자 전류" value={after} min={0} max={120} step={10} unit="%" onChange={setAfter}/>
    <ParamSlider label="열 시정수 τ" value={tau} min={.5} max={5} step={.5} unit="min" disabled={kind!=='thermal'} onChange={setTau}/>
    <ParamSlider label="열 성분 G" value={gain} min={0} max={30} step={1} unit="µm Peak" onChange={setGain}/>
    <ParamSlider label="열 성분 지연각 β" value={lag} min={0} max={180} step={15} unit="°" onChange={setLag}/>
    <ParamSlider label="관측 시각" value={time} min={0} max={20} step={.5} unit="min" onChange={setTime}/>
    <button type="button" onClick={reset}>초기화</button>
  </>} formulas={<><Formula display tex={"\\tau\\dot h+h=i^2"}/><Formula display tex={"V=U+Gh e^{-j\\beta},\\quad x=|V|\\cos(\\theta-\\phi)"}/></>}
  readouts={<ReadoutTable rows={[
    {label:'계자 전류 (상대값)',value:v.current*100,unit:'%'},{label:'열 상태 h',value:v.heat,unit:'—'},
    {label:'열 1X 성분',value:v.contribution.amp*1e6,unit:'µm Peak'},
    {label:'합성 1X Peak',value:v.oneX.amp*1e6,unit:'µm'},
    {label:'합성 1X RMS',value:v.oneX.amp*1e6/Math.sqrt(2),unit:'µm'},
    ...(v.phaseDeg===null?[]:[{label:'합성 1X 지연각',value:v.phaseDeg,unit:'°'}]),
    {label:'변경 전과의 차 벡터',value:v.change*1e6,unit:'µm Peak'},
  ]}/>}
  tasks={[
    {question:'열 성분 지연각을 90°·나머지 기본값으로 맞추고 관측 시각 0→2분. 전류와 1X가 동시에 목표에 도달하나요?',answer:'전류는 바로 100%입니다. 열 상태는 0.25→0.7241, 1X는 20.35→22.76 µm Peak·지연각 10.62→28.50°입니다. 2분=τ에서 열 변화의 63.2%가 진행됩니다.'},
    {question:'관측 시각을 10분으로 옮겨 전류와 열 상태를 비교하세요.',answer:'전류는 50%로 복귀하지만 열 상태는 약 0.995로 연속입니다. 그 뒤 서서히 0.25로 돌아옵니다. 즉시 변화 비교에서는 복귀 시각에 응답도 바로 바뀝니다.'},
    {question:'열 성분 위상을 180°로 바꾸면 전류 증가 때 총진폭도 증가하나요?',answer:'기존 20 µm 성분과 반대로 더해져 초기 16.25 µm에서 고전류 정상 상태 5 µm로 줄어듭니다. 진폭 감소만으로 열 민감성을 배제할 수 없습니다.'},
    {question:'G=0 또는 변경 전·후 전류를 같게 하면?',answer:'G=0이면 열 상태와 무관하게 1X는 20 µm입니다. 전류가 같으면 열 상태·1X도 변하지 않습니다. 두 전류 100%, G=20, 위상 180°에서는 상쇄되어 1X=0, 위상은 보류합니다.'},
  ]}
  footer={<p>가상 계자 전류 상대값과 단일 열 시정수의 해석 모형입니다. 변경 전에는 열평형, 0분에 변경, 10분에 복귀합니다. h는 정규화한 상태이며 실제 온도가 아닙니다. 일정 회전수·전달특성·기존 20 µm Peak를 가정합니다. 실기 전류 한계·권선 단락·열응력·보호 동작을 계산하지 않습니다. 그래프 범위를 고정해 조건 간 크기를 비교합니다. 1X가 0.001 µm Peak 미만이면 표시 위상을 보류하며 이 값은 진단 기준이 아닙니다.</p>}
  >
    <p role="status">{v.phaseDeg===null?'1X 진폭 작음: 위상 보류':time<10?'전류 변경 뒤의 1X 벡터를 비교하세요.':'전류 복귀 뒤 열 상태와 1X의 회복을 비교하세요.'}</p>
    <Plot series={[{x,y:curve.map(p=>p.current*100),name:'계자 전류',color:'var(--plot-1)'}]} x={{label:'시각 [min]',range:[-2,20]}} y={{label:'계자 전류 [%]',range:[0,130]}} height={180} ariaLabel="계자 전류 변경과 복귀"/>
    <Plot series={[{x,y:amp,name:'1X Peak',color:'var(--plot-2)'},{x:[time],y:[v.oneX.amp*1e6],mode:'markers',name:'관측 시각',color:'var(--plot-4)'}]} x={{label:'시각 [min]',range:[-2,20]}} y={{label:'합성 1X [µm Peak]',range:[0,70]}} height={220} ariaLabel="열 지연에 따른 1X 진폭"/>
    <Plot series={[{x,y:angle,name:'1X 지연각',color:'var(--plot-3)'}]} x={{label:'시각 [min]',range:[-2,20]}} y={{label:'지연각 φ [°]',range:[0,360]}} height={180} ariaLabel="열 지연에 따른 1X 위상"/>
    <PolarPlot series={[
      {amp,lagDeg:curve.map(p=>p.oneX.lag*180/Math.PI),name:'1X 경로',color:'var(--plot-2)'},
      {amp:[v.reference.amp*1e6],lagDeg:[v.reference.lag*180/Math.PI],name:'변경 전',mode:'markers',color:'var(--plot-1)'},
      {amp:[v.oneX.amp*1e6],lagDeg:[v.oneX.lag*180/Math.PI],name:'관측 1X',mode:'markers',color:'var(--plot-4)'},
      {amp:[0,v.contribution.amp*1e6],lagDeg:[lag,lag],name:'열 성분',arrow:true,color:'var(--plot-3)'},
    ]} rMax={70} unit="µm Peak" ariaLabel="동일 기준의 합성 1X 극좌표"/>
  </LabFrame>;
}
