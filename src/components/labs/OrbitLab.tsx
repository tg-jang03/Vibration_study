import { useEffect, useId, useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import Formula from '../ui/Formula';
import ReadoutTable from '../ui/ReadoutTable';
import { ORBIT, ORBIT_LABELS, EXTRA_DEFAULT, orbitRecord, orbitWindow, idealOneX, blankBeforeMarks, dotPhaseStep, type OrbitShape } from '../../lib/plots/orbit';
import { formatNumber as fmt, texNumber as tex } from '../../lib/format';
const um=(v:number)=>v*1e6;
export default function OrbitLab() {
  const [shape,setShape]=useState<OrbitShape>('circle'), [extra,setExtra]=useState(0), [phase,setPhase]=useState(0);
  const [order,setOrder]=useState(.5), [sign,setSign]=useState<1|-1>(1), [start,setStart]=useState(0), [turns,setTurns]=useState(2);
  const [marks,setMarks]=useState(true), [play,setPlay]=useState(false);
  const uid=useId().replace(/:/g,''), options=useMemo(()=>({shape,extra:extra*1e-6,phase:phase*Math.PI/180,order,sign}),[shape,extra,phase,order,sign]);
  const record=useMemo(()=>orbitRecord(options),[options]), w=useMemo(()=>orbitWindow(record,start,turns),[record,start,turns]);
  const ideal=idealOneX(options), compare=shape==='sub'||shape==='loop', adjustable=['banana','eight','loop','flower'].includes(shape);
  useEffect(()=>{
    if(!play) return;
    let frame=0, previous=0;
    const tick=(time:number)=>{ if(!previous) previous=time; if(time-previous>=700) {setStart(v=>(v+1)%(ORBIT.maxStart+1));previous=time;} frame=requestAnimationFrame(tick); };
    frame=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(frame);
  },[play]);
  const choose=(value:OrbitShape)=>{setShape(value);setExtra(um(EXTRA_DEFAULT[value]));setPhase(0);setStart(0);setPlay(false);};
  const reset=()=>{choose('circle');setOrder(.5);setSign(1);setTurns(2);setMarks(true);};
  const sx=(v:number)=>Number((210+um(v)*2.35).toFixed(3)), sy=(v:number)=>Number((210-um(v)*2.35).toFixed(3));
  const path=(xs:number[],ys:number[])=>{let move=true;return xs.map((v,i)=>{if(!Number.isFinite(v)||!Number.isFinite(ys[i])) {move=true;return '';}const token=`${move?'M':'L'}${sx(v).toFixed(3)},${sy(ys[i]).toFixed(3)}`;move=false;return token;}).join(' ');};
  const picture=(filtered:boolean)=>{
    const x=filtered?w.fx:w.x,y=filtered?w.fy:w.y,b=blankBeforeMarks(x,y,marks), color=filtered?'var(--plot-3)':'var(--plot-1)', arrowId=`orbit-arrow-${uid}-${filtered?'f':'d'}`;
    return <svg viewBox="0 0 420 420" role="img" aria-label={`${filtered?'1X 필터':'직접'} 오빗 · X/Y 동일 축척 · ${sign===1?'기준 반시계':'기준 시계'} · 시작 ${start}바퀴`} style={{display:'block',width:'100%',maxWidth:440,margin:'auto',color:'var(--text)'}}>
      <defs><marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={color}/></marker></defs>
      {[-60,-30,0,30,60].map(t=><g key={t} stroke="var(--border)"><line x1={sx(t*1e-6)} x2={sx(t*1e-6)} y1="45" y2="375"/><line y1={sy(t*1e-6)} y2={sy(t*1e-6)} x1="45" x2="375"/></g>)}
      <text x="385" y="220" fill="currentColor">X</text><text x="219" y="32" fill="currentColor">Y</text>
      <text x="35" y="400" fontSize="12" fill="currentColor">두 축 ±70 µm · AC · 축 자전 ↺</text>
      <path className="orbit-trace" d={path(b.x,b.y)} fill="none" stroke={color} strokeWidth="2"/>
      {marks&&w.marks.map(m=><circle className="orbit-mark" key={m.rev} cx={sx(filtered?m.fx:m.x)} cy={sy(filtered?m.fy:m.y)} r="4" fill="var(--text)"><title>{`k=${m.rev} · ${fmt(m.time*1000,5)} ms`}</title></circle>)}
      {marks&&<text x={sx(x[0])+8} y={sy(y[0])-9} fontSize="12" fill="currentColor">k={start}</text>}
      {Math.hypot(x[16]-x[8],y[16]-y[8])>5e-8&&<line className="orbit-arrow" x1={sx(x[8])} y1={sy(y[8])} x2={sx(x[16])} y2={sy(y[16])} stroke={color} strokeWidth="2" markerEnd={`url(#${arrowId})`}/>}
    </svg>;
  };
  return <LabFrame id="LAB-ORB-01" title="오빗: 모양·방향·점의 시간 순서"
    controls={<>
      <ParamSelect label="형태" value={shape} options={(Object.keys(ORBIT_LABELS) as OrbitShape[]).map(value=>({value,label:ORBIT_LABELS[value]}))} onChange={choose}/>
      <ParamSelect label="비교 성분 차수" value={String(order)} options={[{value:'0.5',label:'1/2X (0.5X)'},{value:String(1/3),label:'1/3X'},{value:'0.43',label:'0.43X'},{value:'1',label:'1X'},{value:'2',label:'2X'}]} onChange={v=>setOrder(Number(v))} disabled={!compare}/>
      <ParamSelect label="선회 부호 (Y 반전)" value={String(sign)} options={[{value:'1',label:'+ · 단독 원은 반시계(정)'},{value:'-1',label:'− · 단독 원은 시계(역)'}]} onChange={v=>setSign(Number(v) as 1|-1)}/>
      <ParamSelect label="표시 축 바퀴 수" value={String(turns)} options={[2,4,8].map(v=>({value:String(v),label:`${v}바퀴`}))} onChange={v=>setTurns(Number(v))}/>
      <ParamSlider label="추가 성분 진폭" value={extra} min={0} max={40} step={1} unit="µm Peak" disabled={!adjustable} onChange={setExtra}/>
      <ParamSlider label="추가/단독 성분 시작 위상" value={phase} min={0} max={360} step={15} unit="°" disabled={!adjustable&&shape!=='sub'} onChange={setPhase}/>
      <ParamSlider label="표시 시작 바퀴 k" value={start} min={0} max={30} step={1} onChange={v=>{setStart(v);setPlay(false);}} hint="키페이저 k/50초에서 시작; 다음 창으로 옮겨 점의 고정/이동 비교"/>
      <ParamToggle label="키페이저 blank→dot 표시" checked={marks} onChange={setMarks}/>
      <ParamToggle label="시간 창 재생 (시작 바퀴 증가)" checked={play} onChange={setPlay}/>
      <button type="button" className="lab-btn" onClick={reset}>초기화</button>
    </>}
    formulas={<>
      <Formula display tex={String.raw`z(t)=x(t)+jy(t),\quad\theta=2\pi f_rt,\quad t_k=k/f_r`}/>
      <Formula display tex={`f_r=50\\,\\mathrm{Hz},\\quad T_r=20\\,\\mathrm{ms},\\quad \\Delta\\psi=${tex(dotPhaseStep(compare?order:1,sign),5)}^\\circ`} />
      <p>Δψ는 단독 비교 성분의 바퀴당 시작 위상 변화입니다. 여러 성분을 합한 전체 궤적의 회전각과는 다릅니다.</p>
    </>}
    readouts={<ReadoutTable caption="직접 신호와 실제 1X 트래킹 필터" rows={[
      {label:'회전수',value:3000,unit:'rpm'}, {label:'시작 키페이저 k',value:start},
      {label:'기록 길이',value:turns/ORBIT.fr*1000,unit:'ms'}, {label:'서로 다른 직접 점 자리',value:w.distinct},
      {label:'직접 X p-p',value:um(w.xpp),unit:'µm p-p'}, {label:'직접 Y p-p',value:um(w.ypp),unit:'µm p-p'},
      {label:'필터 X 중앙 벡터',value:um(w.ax),theory:um(ideal.ax),unit:'µm Peak',sig:5},
      {label:'필터 Y 중앙 벡터',value:um(w.ay),theory:um(ideal.ay),unit:'µm Peak',sig:5},
      {label:'필터 띠 폭',value:ORBIT.bandwidth,unit:'Hz'},
    ]}/>}
    tasks={[
      {question:'처음 원에서 Y 반전으로 역방향을 고르세요. p-p와 방향은 어떻게 바뀌나요? 바나나와 1X 필터도 비교하세요.',answer:'X/Y p-p는 모두 40 µm 그대로이고 시간 화살표는 반시계→시계입니다. 바나나 기본 직접 신호에는 Y 2X 12 µm가 섞입니다. 필터는 X/Y 1X 약20/12 µm Peak를 남깁니다.'},
      {question:'단독 비교 성분·8바퀴에서 1/2X→1/3X→0.43X→2X를 고르세요. 점 자리는? 0.43X에서 시간 창도 옮겨 보세요.',answer:'각각 2·3·8·1자리입니다(표시 끝의 중복 펄스 제외). 0.43X 점은 바퀴마다 154.8° 이동하며 다음 창에서도 같은 자리에 머물지 않습니다. 정확한0.43=43/100은100바퀴 뒤 반복합니다. 2X는 두 번 선회해도 매 펄스 위치가 같아1자리입니다.'},
      {question:'평평한 면을 고르세요. 직접 X p-p와 필터 X 진폭은? 원인을 접촉으로 확정할 수 있나요?',answer:'직접 X는32 µm p-p이고 1X는약17.15 µm Peak입니다. 필터로 상단 평평한 면이 사라져도 직접 신호의 왜곡은 남아 있습니다. 이 예제는 신호를 자른 것으로 센서 포화와 같은 모양도 만들 수 있어 접촉을 확정할 수 없습니다.'},
    ]}
    footer={<p>가상 AC 신호이며 축 위치·간극·접촉력·불안정 발생을 풀지 않습니다. 축 끝에서 X 오른쪽/Y 위쪽·자전 반시계·센서 보정 완료를 가정합니다. 직접 오빗도 취득 대역 안 신호입니다. 양 채널의 실제 트래킹 필터는 동일한 4차 저역 통과·띠 폭4 Hz, 준비 구간4초 제외입니다. 유한 감쇠로 작은 잔여 성분이 남아 1X=0인 예제에서는 필터의 미세 궤적·방향을 판정하지 마세요. 재생은 기록 창을 0.7초마다 한 바퀴 옮기는 느린 표시입니다.</p>}
  >
    <h4>직접 오빗 · 같은 축척</h4>{picture(false)}
    <h4>1X 필터 오빗 · 같은 축척</h4>{picture(true)}
    <p role="status">k={start}~{start+turns-1}의 키페이저 {turns}번: 서로 다른 직접 점 {w.distinct}자리. 간격 20 ms. 화살표는 첫 점 이후의 시간 증가 방향입니다. 복합 형태는 구간마다 진행 방향이 달라질 수 있습니다.</p>
    <p>빈 구간 직후의 점이 펄스 시각입니다. 겹친 점은 하나처럼 보이므로 아래 좌표와 파형의 시간 순서도 확인하세요.</p>
    <div style={{overflowX:'auto'}}><table><caption>펄스 순간의 직접 오빗 좌표</caption><thead><tr><th>k</th><th>시각 [ms]</th><th>X [µm]</th><th>Y [µm]</th></tr></thead><tbody>{w.marks.map(m=><tr key={m.rev}><td>{m.rev}</td><td>{fmt(m.time*1000,5)}</td><td>{fmt(um(m.x),4)}</td><td>{fmt(um(m.y),4)}</td></tr>)}</tbody></table></div>
    <h4>X/Y 시간파형과 20 ms 간격 펄스</h4>
    <Plot series={[{x:w.time.map(t=>t*1000),y:w.x.map(um),name:'X 직접',color:'var(--plot-1)'},{x:w.time.map(t=>t*1000),y:w.y.map(um),name:'Y 직접',color:'var(--plot-2)'},...w.marks.map(m=>({x:[m.time*1000,m.time*1000],y:[-65,65],name:'키페이저',color:'var(--text-muted)',dash:'dot' as const,width:1,hideInLegend:true}))]} x={{label:'절대 시각 [ms]',range:[start/50*1000,(start+turns)/50*1000]}} y={{label:'AC 변위 [µm]',range:[-70,70]}} height={250} ariaLabel="직접 X/Y 파형과 키페이저 펄스 시각"/>
  </LabFrame>;
}