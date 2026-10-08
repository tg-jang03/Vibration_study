import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import Formula from '../ui/Formula';
import Plot, { type PlotSeries } from '../ui/Plot';
import PolarPlot from '../ui/PolarPlot';
import { formatNumber } from '../../lib/format';
import { P81_DEFAULT as D, simulateMultiMode, phasePlot, windowPeak, phaseDifference, phaseChange, type ModalComponent } from '../../lib/rotor/multimode';
import { compensateSlowRoll, halfPowerAF, separationMargin } from '../../lib/rotor/runup';
const pp=(m:number)=>m*2e6;
const names=['베어링 1','베어링 2','중앙'];
const colors=['var(--plot-1)','var(--plot-2)','var(--plot-3)'];
export default function MultiModeBodeLab({initialHot=false}:{initialHot?:boolean}) {
  const [n1,setN1]=useState(1500), [n2,setN2]=useState(3000);
  const [z1,setZ1]=useState(.06), [z2,setZ2]=useState(.04);
  const [e1,setE1]=useState(5), [e2,setE2]=useState(3);
  const [theta1,setTheta1]=useState(0), [theta2,setTheta2]=useState(0);
  const [sensor,setSensor]=useState('bearings');
  const [hot,setHot]=useState(initialHot), [bow,setBow]=useState(2), [beta,setBeta]=useState(60);
  const [runout,setRunout]=useState(false), [comp,setComp]=useState(false);
  const [noise,setNoise]=useState(0), [op,setOp]=useState(3600), [components,setComponents]=useState(false);
  const modes=useMemo<ModalComponent[]>(()=>D.modes.map((m,i)=>({...m,naturalRpm:i?n2:n1,zeta:i?z2:z1,
    eccentricity:(i?e2:e1)*1e-6,heavySpot:(i?theta2:theta1)*Math.PI/180,
    ...(hot && i===0 ? {bow:{amp:bow*1e-6,lag:beta*Math.PI/180}}:{})})),[n1,n2,z1,z2,e1,e2,theta1,theta2,hot,bow,beta]);
  const all=useMemo(()=>[0,1,2].map(s=>{
    const raw=simulateMultiMode(modes,s,{rpmEnd:D.rpmEnd,rpmStep:D.rpmStep,runout:runout?D.runout:undefined,noise:noise*1e-6,seed:D.seed});
    return comp?compensateSlowRoll(raw,D.slowRollRpm).points:raw;
  }),[modes,runout,noise,comp]);
  const visible=sensor==='bearings'?[0,1]:sensor==='all'?[0,1,2]:[Number(sensor)];
  const ref=visible[0];
  const modeCurves=useMemo(()=>modes.map(m=>simulateMultiMode([m],ref,{rpmEnd:D.rpmEnd,rpmStep:D.rpmStep})),[modes,ref]);
  const x=all[0].map(p=>p.rpm);
  const ampSeries:PlotSeries[]=visible.map(s=>({x,y:all[s].map(p=>pp(p.amp)),name:names[s],color:colors[s]}));
  const phaseSeries:PlotSeries[]=visible.map(s=>({x,y:phasePlot(all[s]),name:names[s],color:colors[s]}));
  if(components) modeCurves.forEach((p,i)=>{
    ampSeries.push({x,y:p.map(v=>pp(v.amp)),name:(i+1)+'차 성분 ('+names[ref]+')',color:i?'var(--plot-4)':'var(--text-muted)',dash:'dash'});
    phaseSeries.push({x,y:phasePlot(p),name:(i+1)+'차 성분',color:i?'var(--plot-4)':'var(--text-muted)',dash:'dash'});
  });
  [n1,n2].forEach((n,i)=>{ampSeries.push({x:[n,n],y:[0,Math.max(10,...all[ref].map(p=>pp(p.amp)))*1.12],name:(i+1)+'차 N_m',color:'var(--text-muted)',dash:'dot'});});
  const max=Math.max(10,...visible.flatMap(s=>all[s].map(p=>pp(p.amp))),...(components?modeCurves.flatMap(p=>p.map(v=>pp(v.amp))):[]))*1.12;
  ampSeries.push({x:[op,op],y:[0,max],name:'운전 회전수',color:'var(--text-muted)',dash:'dot'});
  const peaks=modes.map(m=>visible.map(s=>windowPeak(all[s],.7*m.naturalRpm,Math.min(D.rpmEnd,1.4*m.naturalRpm))));
  const rows:Readout[]=[];
  modes.forEach((m,i)=>{
    visible.forEach((s,k)=>{
      const p=peaks[i][k];
      rows.push({label:(i+1)+'차 창 국소 피크 · '+names[s],value:p?.rpm ?? NaN,unit:'rpm'});
      rows.push({label:(i+1)+'차 창 피크 진폭 · '+names[s],value:p?pp(p.amp):NaN,unit:'µm pp'});
    });
    rows.push({label:(i+1)+'차 창 합성 위상 변화 · '+names[ref],value:phaseChange(all[ref],.7*m.naturalRpm,1.4*m.naturalRpm),unit:'°'});
    const at=all[0].findIndex(p=>p.rpm>=m.naturalRpm);
    rows.push({label:(i+1)+'차 N_m 근처 베어링 위상차',value:phaseDifference(all[0][at],all[1][at]),unit:'°'});
    const isolated=simulateMultiMode([{...m,bow:undefined}],ref,{rpmEnd:D.rpmEnd,rpmStep:2});
    const hp=halfPowerAF(isolated);
    rows.push({label:(i+1)+'차 불평형 성분 AF · '+names[ref],value:hp?.af??NaN,theory:m.shape[ref]!==0 && m.eccentricity>0 ? 1/(2*m.zeta):undefined});
    rows.push({label:(i+1)+'차 피크의 개념 SM · '+names[ref],value:peaks[i][0]?separationMargin(op,peaks[i][0]!.rpm):NaN,unit:'%'});
  });
  visible.forEach(s=>rows.push({label:'운전 1X · '+names[s],value:pp(all[s].find(p=>p.rpm===op)!.amp),unit:'µm pp'}));
  rows.push({label:'200 rpm · '+names[ref],value:pp(all[ref].find(p=>p.rpm===200)!.amp),unit:'µm pp'});
  const reset=()=>{setN1(1500);setN2(3000);setZ1(.06);setZ2(.04);setE1(5);setE2(3);setTheta1(0);setTheta2(0);setSensor('bearings');setHot(initialHot);setBow(2);setBeta(60);setRunout(false);setComp(false);setNoise(0);setOp(3600);setComponents(false);};
  return <LabFrame id="LAB-BODE-01" title="여러 모드의 Bode / Polar" controls={<>
    <ParamSelect label="표시 센서" value={sensor} onChange={setSensor} options={[{value:'bearings',label:'베어링 두 곳'},{value:'0',label:'베어링 1'},{value:'1',label:'베어링 2'},{value:'2',label:'중앙 (2차 마디)'},{value:'all',label:'세 곳 모두'}]} />
    <ParamSlider label="1차 고유 회전수 N₁" value={n1} onChange={setN1} min={800} max={1800} step={100} unit="rpm" />
    <ParamSlider label="2차 고유 회전수 N₂" value={n2} onChange={setN2} min={1900} max={4000} step={100} unit="rpm" />
    <ParamSlider label="1차 감쇠비 ζ₁" value={z1} onChange={setZ1} min={.02} max={.3} step={.01} />
    <ParamSlider label="2차 감쇠비 ζ₂" value={z2} onChange={setZ2} min={.02} max={.3} step={.01} />
    <ParamSlider label="1차 모드 불평형 e₁" value={e1} onChange={setE1} min={0} max={10} step={.5} unit="µm Peak" />
    <ParamSlider label="2차 모드 불평형 e₂" value={e2} onChange={setE2} min={0} max={10} step={.5} unit="µm Peak" />
    <ParamSlider label="1차 불평형 지연 θ₁" value={theta1} onChange={setTheta1} min={0} max={360} step={15} unit="°" />
    <ParamSlider label="2차 불평형 지연 θ₂" value={theta2} onChange={setTheta2} min={0} max={360} step={15} unit="°" />
    <ParamSelect label="열 상태" value={hot?'hot':'cold'} onChange={v=>setHot(v==='hot')} options={[{value:'cold',label:'냉간 런업 (bow 0)'},{value:'hot',label:'열간 코스트다운 (bow 추가)'}]} />
    <ParamSlider label="1차 열 휨 b₁" value={bow} onChange={setBow} min={0} max={5} step={.5} unit="µm Peak" disabled={!hot} />
    <ParamSlider label="열 휨 지연 β" value={beta} onChange={setBeta} min={0} max={360} step={15} unit="°" disabled={!hot} />
    <ParamToggle label="런아웃 추가 (3 µm Peak·60°)" checked={runout} onChange={setRunout} />
    <ParamToggle label="200 rpm slow roll 벡터 보상" checked={comp} onChange={setComp} />
    <ParamToggle label="분리한 모드 성분 겹쳐 보기" checked={components} onChange={setComponents} />
    <ParamSelect label="1X 벡터 잡음 σ" value={noise} onChange={setNoise} options={[{value:0,label:'0 µm Peak'},{value:.1,label:'0.1 µm Peak'},{value:.5,label:'0.5 µm Peak'}]} />
    <ParamSlider label="운전 회전수" value={op} onChange={setOp} min={2000} max={4800} step={100} unit="rpm" />
    <button type="button" className="lab-button" onClick={reset}>초기화</button>
  </>} formulas={<Formula tex={'X_j=\\sum_{m=1}^{2}\\Phi_{jm}\\frac{e_m r_m^2e^{-j\\theta_m}+b_me^{-j\\beta_m}}{1-r_m^2+j2\\zeta_m r_m},\\quad r_m=N/N_m'} />}
    readouts={<><ReadoutTable rows={rows} caption="1X 읽음값 (진폭 µm pp·동일 방향 센서)" />
      <p className="lab-note">창은 0.7~1.4 N_m입니다. 국소 피크가 없으면 —이며, 가까운 모드에서는 같은 피크가 두 창에 잡힐 수 있습니다. AF는 bow·런아웃·잡음을 뺀 분리 모드의 Half-power 값입니다. 이론 열 1/(2ζ)는 작은 감쇠 근사입니다. SM은 P4-1의 개념식이며 운전 허용 판정이 아닙니다.</p></>}
    tasks={[
      {question:'기본값에서 두 베어링의 1500·3000 rpm 위상차를 비교하세요.',answer:'각각 약 2.74°·160°입니다. 1차는 동상에 가깝고 2차는 역상에 가깝지만 다른 모드가 섞여 정확히 0°·180°는 아닙니다.'},
      {question:'중앙을 고르고 모드 성분을 켜세요. 2차 피크는 어디로 갔나요?',answer:'중앙의 2차 형상 값은 0이므로 그 성분이 0입니다. 모드가 없어졌다는 뜻은 아닙니다. 기본값 중앙 3000 rpm은 1차 꼬리 19.94 µm pp입니다.'},
      {question:'2차 감쇠비를 0.04→0.20으로 바꾸세요. 분리한 성분의 위상은요?',answer:'2차 N₂에서 성분 진폭은 75→15 µm pp입니다. 분리 모드의 위상 전이는 완만해지고 합성 피크는 덜 뚜렷해집니다.'},
      {question:'N₂를 1900 rpm으로 내리고 두 모드 성분을 비교하세요.',answer:'겹친 피크·위상·Polar 경로를 봅니다. 루프 수나 창 안 피크 수를 모드 수와 그대로 같다고 읽지 않습니다.'},
      {question:'초기화 후 열간을 고르고 200 rpm 보상을 켜세요. 1500 rpm은 냉간과 같아지나요?',answer:'열간 1500 rpm은 103.7, 보상 뒤 100.8 µm pp이며 냉간 83.46과 다릅니다. 속도에 따라 변하는 bow 응답까지 지우지는 못합니다.'},
      {question:'냉간·런아웃 켬에서 θ₁·θ₂를 바꾸고 보상 전후의 저속 골·Polar 이동을 비교하세요.',answer:'측정 벡터의 덧셈으로 골이 생길 수 있습니다. 일정 런아웃을 빼도 200 rpm의 실제 동적 응답을 함께 뺀 편향이 남습니다.'},
    ]} footer={<p>교육용 0~5000 rpm 수학 곡선입니다. 감속은 같은 열간 응답을 높은 회전수에서 낮은 쪽으로 읽습니다. 실제 과속·가속률·보호 설정은 기계별 승인 절차를 따릅니다. 같은 잡음 설정에서는 같은 곡선을 표시합니다.</p>}>
    <p className="lab-note">형상: 1차 [1, 1, 1.5], 2차 [1, −1, 0]. {n2/n1<1.8?'모드가 가까워 합성 곡선의 분리가 어렵습니다. ':' '}{hot?'열간 bow를 1차에만 더했습니다.':'냉간 bow는 0입니다.'} 저진폭 0.000002 µm pp 미만 위상과 0°/360° 접힘은 선을 끊습니다.</p>
    <Plot series={ampSeries} x={{label:'회전수 [rpm]',range:[0,D.rpmEnd]}} y={{label:'1X [µm pp]',range:[0,max]}} height={270} ariaLabel="여러 모드 1X 진폭 Bode" />
    <Plot series={phaseSeries} x={{label:'회전수 [rpm]',range:[0,D.rpmEnd]}} y={{label:'지연각 [°]',range:[0,360]}} height={250} ariaLabel="여러 모드 1X 위상 Bode" />
    <PolarPlot series={[...visible.map(s=>({amp:all[s].map(p=>pp(p.amp)),lagDeg:all[s].map(p=>p.lag*180/Math.PI),name:names[s],color:colors[s]})),...[n1,n2,op].map(n=>{const p=all[ref].find(p=>p.rpm===n)!;return {amp:[pp(p.amp)],lagDeg:[p.lag*180/Math.PI],name:names[ref]+' '+n+' rpm',color:colors[ref],mode:'markers' as const,markerSize:5,label:n+' rpm'};})]} rMax={max} unit="µm pp" ariaLabel="베어링별 1X Polar·0도 센서 방향" />
    <p className="lab-note">운전 {op} rpm · {names[ref]}: {formatNumber(pp(all[ref].find(p=>p.rpm===op)!.amp),4)} µm pp. Polar의 경로는 회전수 증가 순서이며 축 단면의 오빗과 구별하세요.</p>
  </LabFrame>;
}
