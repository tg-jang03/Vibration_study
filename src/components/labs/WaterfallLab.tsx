import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import ReadoutTable from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import Plot, { type PlotSeries } from '../ui/Plot';
import { CASCADE, CASCADE_LABELS, amplitudeAt, cascadeRecords, spectrumAxis, type CascadeScenario } from '../../lib/plots/cascade';
import { formatNumber as fmt, texNumber as tex } from '../../lib/format';
type View='cascade'|'waterfall'|'full';
export default function WaterfallLab() {
  const [scenario,setScenario]=useState<CascadeScenario>('lock');
  const [view,setView]=useState<View>('cascade');
  const [order,setOrder]=useState(false), [cursor,setCursor]=useState(10);
  const [mode,setMode]=useState(40), [ratio,setRatio]=useState(.45), [reverse,setReverse]=useState(25), [noise,setNoise]=useState(false);
  const records=useMemo(()=>cascadeRecords({scenario,modeHz:mode,ratio,reverseFraction:reverse/100,noise}),[scenario,mode,ratio,reverse,noise]);
  const current=records[cursor], full=view==='full', waterfall=view==='waterfall';
  const base=(r:typeof current)=>waterfall?r.time:r.rotatingHz*60;
  const gain=waterfall ? 0.25 : 15;
  const xMax=order?3:260;
  const stack:PlotSeries[]=records.map((r,i)=>{
    const s=full?r.full:r.half, f=spectrumAxis(s,r.rotatingHz,order), keep=f.map((v,k)=>Math.abs(v)<=xMax?k:-1).filter(k=>k>=0);
    return {x:keep.map(k=>f[k]),y:keep.map(k=>base(r)+s.amp[k]*1e6*gain),name:`기록 ${i}: ${r.time}s / ${r.rotatingHz*60}rpm`,color:i===cursor?'var(--plot-2)':'var(--plot-1)',width:i===cursor?2.5:1,hideInLegend:true};
  });
  const guide:PlotSeries[]=[{x:records.map(r=>order?1:r.rotatingHz),y:records.map(base),name:'1X 자리 (기록 기준선)',color:'var(--text-muted)',dash:'dot'}];
  if(full) guide.push({x:records.map(r=>order?-1:-r.rotatingHz),y:records.map(base),name:'−1X 자리',color:'var(--text-muted)',dash:'dot'});
  const halfX=spectrumAxis(current.half,current.rotatingHz,order), fullX=spectrumAxis(current.full,current.rotatingHz,order);
  const af=amplitudeAt(current.full,current.rotatingHz)*1e6, ab=amplitudeAt(current.full,-current.rotatingHz)*1e6;
  return <LabFrame id="LAB-WF-01" title="줄의 이동을 읽기: Waterfall·Cascade"
    controls={<>
      <ParamSelect label="비교 성분 시나리오" value={scenario} options={(Object.keys(CASCADE_LABELS) as CascadeScenario[]).map(value=>({value,label:CASCADE_LABELS[value]}))} onChange={setScenario}/>
      <ParamSelect label="쌓은 그림" value={view} options={[{value:'cascade',label:'Cascade (기준 = 회전수)'},{value:'waterfall',label:'Waterfall (기준 = 시각)'},{value:'full',label:'Full spectrum cascade (±주파수)'}]} onChange={setView}/>
      <ParamSelect label="가로축" value={order?'order':'hz'} options={[{value:'hz',label:'주파수 [Hz]'},{value:'order',label:'각 기록의 차수 [X]'}]} onChange={v=>setOrder(v==='order')}/>
      <ParamSlider label="선택 기록" value={cursor} min={0} max={12} step={1} onChange={setCursor} hint="0~10 상승, 10~12는 7200 rpm 유지"/>
      <ParamSlider label="모드 주파수 (학습값)" value={mode} min={30} max={50} step={5} unit="Hz" onChange={setMode} disabled={scenario==='follow'}/>
      <ParamSlider label="추종 비율" value={ratio} min={.4} max={.5} step={.05} format={v=>fmt(v,2)} onChange={setRatio} disabled={scenario==='fixed'}/>
      <ParamSlider label="1X 역방향 몫" value={reverse} min={0} max={75} step={25} unit="%" onChange={setReverse}/>
      <ParamToggle label="시드 고정 백색 잡음 추가" checked={noise} onChange={setNoise}/>
    </>}
    formulas={<>
      <Formula display tex={`f_r=N/60=${tex(current.rotatingHz,4)}\\,\\mathrm{Hz},\\quad o_{\\rm line}=f_{\\rm line}/f_r=${tex(current.subHz/current.rotatingHz,4)}\\,\\mathrm{X}`}/>
      <Formula display tex={`A_{+1X}=${tex(af,4)}\\,\\mathrm{\\mu m},\\quad A_{-1X}=${tex(ab,4)}\\,\\mathrm{\\mu m}\\quad(\\text{원 반지름})`}/>
    </>}
    readouts={<ReadoutTable caption={`기록 ${cursor} · 모든 진폭은 변위`} rows={[
      {label:'기록 시각',value:current.time,unit:'s'}, {label:'회전수',value:current.rotatingHz*60,unit:'rpm'},
      {label:'1X 주파수',value:current.rotatingHz,unit:'Hz'}, {label:'비교 성분 지정 주파수',value:current.subHz,unit:'Hz'},
      {label:'비교 성분 차수',value:current.subHz/current.rotatingHz,unit:'X'},
      {label:'X의 1X 칸 진폭',value:amplitudeAt(current.half,current.rotatingHz)*1e6,unit:'µm Peak'},
      {label:'+1X 반지름 (반시계·정)',value:af,unit:'µm'}, {label:'−1X 반지름 (시계·역)',value:ab,unit:'µm'},
      {label:scenario==='lock'&&60*mode/ratio>7200?'잠김 모델 교차 회전수 (기록 범위 7200 rpm 밖 → 이 기록에서는 잠기지 않음)':'잠김 모델 교차 회전수',value:scenario==='lock'?60*mode/ratio:NaN,unit:'rpm'},
      {label:'FFT 분해능',value:CASCADE.df,unit:'Hz'},
    ]}/>}
    tasks={[
      {question:'초기 설정에서 선택 기록을 6(4800 rpm)과 10(7200 rpm)으로 바꾸세요. 서브 성분의 Hz와 차수는?',answer:'36→40 Hz, 0.45→0.3333X입니다. 잠긴 뒤 Hz는 일정하지만 회전수가 높아져 차수는 낮아집니다. 추종만으로 바꾸면 마지막은 54 Hz·0.45X입니다.'},
      {question:'모드를 50 Hz로 바꾸면 모델 교차 회전수는? 다시 40 Hz로 되돌리고 처음부터 고정 시나리오와 비교하세요.',answer:'50/0.45×60≈6667 rpm입니다. 초기 40 Hz 모델은 약 5333 rpm입니다. 처음부터 고정도 마지막 40 Hz이지만 앞의 이동 경로가 달라 한 장으로 휩을 확정할 수 없습니다.'},
      {question:'Waterfall에서 기록 10 ~ 12를 고르세요. 다음에는 Full cascade·기록 10에서 역방향 몫을 25 → 50 %로 바꾸세요.',answer:'같은 7200 rpm에서 X의 1X가 20 → 25 → 30 µm Peak입니다. Cascade에서는 기준선이 겹칩니다. 역방향 몫 25 → 50 %에서 X 1X는 20 그대로, ± 반지름은 15/5 → 10/10 µm입니다.'},
    ]}
    footer={<p>각 기록은 별도의 정속 2초 신호입니다(1024 Hz·2048점·Hann). 연속 런업 중 번짐·발생 한계·진폭 성장은 풀지 않습니다. X 오른쪽·Y 위쪽·축 반시계 회전을 가정해 +f가 정방향입니다. 같은 칸의 성분은 합쳐지고 잡음도 포함됩니다. 모든 성분을 0.5 Hz 칸 한가운데에 놓아 Hann 진폭이 정확히 나오게 했습니다. 실제 기록에서 칸 사이에 걸린 줄은 최대 약 15 % 낮게 읽힐 수 있습니다(P2-5). 쌓은 그림은 0 ~ 260 Hz(Full은 ±260 Hz) 또는 차수축 0 ~ 3X입니다. Full의 차수축은 ±260 Hz까지만 계산해 높은 회전수 기록에서는 3X보다 앞에서 끝납니다. 선택 X 스펙트럼은 0 ~ 360 Hz입니다.</p>}
  >
    <h4>{full?'Full spectrum cascade':waterfall?'시간순 Waterfall':'회전수순 Cascade'}</h4>
    <Plot series={[...stack.filter((_,i)=>i!==cursor),...guide,stack[cursor]]} x={{label:order?'차수 [X]':'주파수 [Hz]',range:[full?-xMax:0,xMax]}} y={{label:waterfall?'기록 시각 [s] + 진폭 표시 높이':'기록 회전수 [rpm] + 진폭 표시 높이',range:waterfall?[-3,133]:[1000,8000]}} height={340} ariaLabel="주파수 성분을 기록별로 쌓은 그림"/>
    <p role="status">강조한 기록 {cursor}: {current.time} s·{current.rotatingHz*60} rpm. 선의 세로 높이는 진폭을 나타내기 위한 표시 오프셋입니다. 7200 rpm 유지 기록 3개는 Cascade의 기준선이 같아 서로 겹칩니다.</p>
    <h4>선택 기록: X 한 채널의 반쪽 스펙트럼</h4>
    <Plot series={[{x:halfX,y:current.half.amp.map(a=>a*1e6),name:'X FFT',color:'var(--plot-1)'}]} x={{label:order?'차수 [X]':'주파수 [Hz]',range:[0,order?360/current.rotatingHz:360]}} y={{label:'변위 [µm Peak]',range:[0,35]}} height={210} ariaLabel="선택 기록의 X 반쪽 스펙트럼"/>
    <h4>선택 기록: X와 Y로 나눈 ±성분</h4>
    <Plot series={[{x:fullX,y:current.full.amp.map(a=>a*1e6),name:'X+jY FFT',color:'var(--plot-3)'}]} x={{label:order?'signed 차수 [X]':'signed 주파수 [Hz]',range:[order?-260/current.rotatingHz:-260,order?260/current.rotatingHz:260]}} y={{label:'원 반지름 [µm]',range:[0,35]}} height={210} ariaLabel="선택 기록의 정방향·역방향 Full spectrum"/>
  </LabFrame>;
}