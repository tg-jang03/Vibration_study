import {useMemo,useState} from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ReadoutTable from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import Plot from '../ui/Plot';
import {PRESSURE_LABELS,GT_DEFAULT as D,pressureModel,type PressureKind} from '../../lib/machine/gt';
export default function GasPressureLab({initialKind='spinning'}:{initialKind?:PressureKind}) {
  const [kind,setKind]=useState(initialKind),[rpm,setRpm]=useState(D.rpm),[order,setOrder]=useState(D.order);
  const [separation,setSeparation]=useState(D.separation),[axial,setAxial]=useState(D.axial),[amplitude,setAmplitude]=useState(D.amplitude/1000);
  const model=useMemo(()=>pressureModel({kind,rpm,order,separation,axial,amplitude:amplitude*1000}),[kind,rpm,order,separation,axial,amplitude]);
  const longitudinal=kind==='longitudinal',spatial=kind==='stall'||kind==='spinning'||kind==='standing';
  const reset=()=>{setKind(initialKind);setRpm(D.rpm);setOrder(D.order);setSeparation(D.separation);setAxial(D.axial);setAmplitude(D.amplitude/1000)};
  return <LabFrame id="LAB-GT-01" title="GT 동압: 같은 주파수라도 센서 위치가 다르면?"
    controls={<>
      <ParamSelect label="현상 예제" value={kind} onChange={setKind} options={(Object.keys(PRESSURE_LABELS) as PressureKind[]).map(value=>({value,label:PRESSURE_LABELS[value]}))}/>
      <ParamSlider label="축 회전수" value={rpm} min={1800} max={6000} step={100} unit="rpm" onChange={setRpm}/>
      <ParamSelect label="셀 수 / 원주 모드 차수" value={order} onChange={setOrder} disabled={!spatial} options={[1,2,3].map(value=>({value,label:String(value)}))}/>
      <ParamSlider label="센서 B 원주 위치 (A=0°)" value={separation} min={0} max={180} step={15} unit="°" disabled={!spatial} onChange={setSeparation}/>
      <ParamSlider label="센서 B 축방향 x/L (A=0)" value={axial} min={0} max={1} step={.05} disabled={!longitudinal} onChange={setAxial}/>
      <ParamSlider label="압력 진폭 A" value={amplitude} min={0} max={5} step={.5} unit="kPa Peak" onChange={setAmplitude}/>
      <button type="button" onClick={reset}>초기화</button>
    </>}
    formulas={<Formula display tex={kind==='stall'||kind==='spinning' ? "p'(t,\\theta)=A\\cos(2\\pi ft-m\\theta)" : longitudinal ? "p'(t,x)=A\\cos(\\pi x/L)\\cos(2\\pi ft)" : kind==='standing'?"p'(t,\\theta)=A\\cos(m\\theta)\\cos(2\\pi ft)":"p'(t)=A\\cos(2\\pi ft)"}/>}
    readouts={<ReadoutTable rows={[
      {label:'압력 주파수',value:model.frequency,unit:'Hz'},
      {label:'축 1X',value:model.rotatingHz,unit:'Hz'},
      {label:'축에 대한 차수',value:model.orderRatio,unit:'X'},
      {label:'센서 A Peak',value:model.peakA/1000,unit:'kPa'},
      {label:'센서 B Peak',value:model.peakB/1000,unit:'kPa'},
      {label:'센서 A RMS',value:model.rmsA/1000,unit:'kPa'},
      {label:'센서 B RMS',value:model.rmsB/1000,unit:'kPa'},
      ...(model.phaseDeg===null?[]:[{label:'B−A 위상',value:model.phaseDeg,unit:'°'}]),
    ]}/>}
    tasks={[
      {question:'회전 실속·셀1개에서3000→6000 rpm이면? 서지는?',answer:'지정 셀 회전비0.4에서20→40 Hz입니다. 서지5 Hz는 회전수와 별도 지정값이라 그대로입니다. 셀2개면 통과 주파수는2배가 됩니다.'},
      {question:'원주 진행파 m1·B90°와 원주 정재파를 비교하세요.',answer:'진행파는 두 센서 모두2 kPa Peak·B−A −90°. 정재파는 B가 절점이라0, 위상은 정의되지 않습니다. B180°에서는 반대 위상입니다.'},
      {question:'종방향 x/L을0.5→1로 바꾸면?',answer:'닫힌 양끝 관1차 압력 모양의 절점0에서2 kPa Peak로 올라가고 A와180° 반대가 됩니다. 실제 GT 경계조건은 별도로 확인합니다.'},
    ]}
    footer={<p>무잡음 해석 정현파·공간 모양 예제입니다. 모든 압력·주파수는 지정값이며 평균 압력·유량 역전·열방출 피드백·발생 경계는 계산하지 않습니다. 원주 모드차수는 축1X의 하모닉 차수와 다릅니다. 위상은 p′=A cos(2πft+φ)의 B−A이며 키페이저 지연각이 아닙니다. 파형은 항상2주기·시간축 길이는 주파수에 따라 바뀝니다. 실제 센서 배관·주파수응답·노이즈는 포함하지 않습니다.</p>}
  >
    <p role="status">{model.phaseDeg===null?'절점 또는 진폭0: B−A 위상은 정의되지 않습니다.':'두 센서의 압력 진폭과 위상을 함께 비교하세요.'}</p>
    <Plot series={[{x:model.time,y:model.a.map(v=>v/1000),name:'센서 A',color:'var(--plot-1)'},{x:model.time,y:model.b.map(v=>v/1000),name:'센서 B',color:'var(--plot-2)',dash:'dash'}]} x={{label:'시각 [s]',range:[0,2/model.frequency]}} y={{label:'동압 p′ [kPa]',range:[-5.5,5.5]}} height={240} ariaLabel="두 위치의 동압 파형"/>
    <Plot series={[{x:model.space,y:model.shape.map(v=>v/1000),name:'t=0 공간 압력',color:'var(--plot-3)'}]} x={{label:longitudinal?'축방향 x/L':'원주 θ [°]',range:longitudinal?[0,1]:[0,360]}} y={{label:'동압 p′ [kPa]',range:[-5.5,5.5]}} height={210} ariaLabel="음향 또는 실속 압력 공간 분포"/>
  </LabFrame>;
}
