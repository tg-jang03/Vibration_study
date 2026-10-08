import { grid, squareYRange, type FigPanel, type FigColor, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber as fmt } from '../lib/format';
import { P81_DEFAULT as D, multiModeVector, simulateMultiMode, phasePlot, windowPeak, phaseDifference, type ModalComponent } from '../lib/rotor/multimode';
import { compensateSlowRoll, halfPowerAF, separationMargin, type RunUpPoint } from '../lib/rotor/runup';
const opts={rpmEnd:D.rpmEnd,rpmStep:D.rpmStep};
const cold=[0,1,2].map(s=>simulateMultiMode(D.modes,s,opts));
const hotModes=D.modes.map((m,i)=>({...m,...(i===0?{bow:D.bow}:{})}));
const hot=simulateMultiMode(hotModes,0,opts);
const compensated=compensateSlowRoll(hot,D.slowRollRpm).points;
const p1=windowPeak(cold[0],1050,2100)!,p2=windowPeak(cold[0],2100,4200)!;
const pp=(v:number)=>v*2e6;
const at=(m:readonly ModalComponent[],s:number,n:number)=>multiModeVector(m,s,n);
export const P81_VALUES={
  firstPeakRpm:p1.rpm,firstPeak:pp(p1.amp),secondPeakRpm:p2.rpm,secondPeak:pp(p2.amp),
  b1At3000:pp(at(D.modes,0,3000).amp),b2At3000:pp(at(D.modes,1,3000).amp),centerAt3000:pp(at(D.modes,2,3000).amp),
  phaseDiff1:phaseDifference(at(D.modes,0,1500),at(D.modes,1,1500)),phaseDiff2:phaseDifference(at(D.modes,0,3000),at(D.modes,1,3000)),
  coldAt1500:pp(at(D.modes,0,1500).amp),hotAt1500:pp(at(hotModes,0,1500).amp),compAt1500:pp(compensated.find(p=>p.rpm===1500)!.amp),
  hotAtZero:pp(at(hotModes,0,0).amp),hotAt200:pp(at(hotModes,0,200).amp),
  af1:halfPowerAF(simulateMultiMode([D.modes[0]],0,{...opts,rpmStep:2}))!.af,
  sm1:separationMargin(3600,p1.rpm),sm2:separationMargin(3600,p2.rpm),
  dampedAt3000:pp(at([{...D.modes[1],zeta:.2}],0,3000).amp),
};
const amp=(p:RunUpPoint[],color:FigColor,label?:string,dash=false):FigSeries=>({x:p.map(v=>v.rpm),y:p.map(v=>pp(v.amp)),color,label,dash});
const phase=(p:RunUpPoint[],color:FigColor,label?:string):FigSeries=>({x:p.map(v=>v.rpm),y:phasePlot(p),color,label});
const panel=(title:string,series:FigSeries[],range:[number,number],phaseAxis=false):FigPanel=>({title,height:180,x:{range:[0,5000],label:'회전수 [rpm]'},y:{range,label:phaseAxis?'지연각 [°]':'1X [µm pp]'},series,
  annotations: [{type:'vline',x:1500,color:'muted',dash:true},{type:'vline',x:3000,color:'muted',dash:true},{type:'vline',x:3600,color:'c4',dash:true,label:'운전'}]});
const f=(id:number,caption:string,panels:FigPanel[]):FigureSpec=>({id:'fig-p8-1-'+id,caption:'그림 '+id+'. '+caption,panels});
const sx=grid(0,1,81);
const shape=(title:string,fn:(x:number)=>number,color:FigColor):FigPanel=>({title,height:120,x:{range:[0,1],label:'축 길이 방향 (개념도)'},y:{range:[-1.6,1.6],label:'상대 변위'},series:[{x:sx,y:sx.map(fn),color},{x:[0,1],y:[0,0],color:'muted',dash:true}],annotations:[{type:'point',x:0,y:fn(0),color},{type:'point',x:1,y:fn(1),color}]});
export const modeShapes=f(1,'강체 병진은 양 끝이 같은 쪽, 원추는 반대쪽으로 움직입니다. 굽힘은 축 자체가 휘며 차수가 높아지면 마디가 늘어납니다. 이 네 개념도는 실제 기계 모드의 계산 결과가 아니며, 두 끝의 위상만으로 병진과 굽힘을 확정할 수 없습니다.',[
  shape('강체 병진 · 양 끝 동상',()=>1,'c1'),shape('강체 원추 · 양 끝 역상',x=>1-2*x,'c2'),
  shape('1차 굽힘 · 대칭 예시',x=>.3+.7*Math.sin(Math.PI*x),'c3'),shape('2차 굽힘 · 중앙 마디 예시',x=>.3*Math.cos(Math.PI*x)+Math.sin(2*Math.PI*x),'c4')]);
export const twoPeaks=f(2,'냉간 2모드 모델: N₁=1500·N₂=3000 rpm, ζ₁=0.06·ζ₂=0.04, e₁=5·e₂=3 µm Peak입니다. 베어링 1(파랑)의 표본 피크는 '+P81_VALUES.firstPeakRpm+' rpm·'+fmt(P81_VALUES.firstPeak,4)+' µm pp와 '+P81_VALUES.secondPeakRpm+' rpm·'+fmt(P81_VALUES.secondPeak,4)+' µm pp입니다. 베어링 2(주황)는 2차 성분 부호가 반대라 합성 위상이 다릅니다. 20 rpm 간격, 점선=고유 회전수, 보라=운전 3600 rpm.',[
  panel('같은 기동 · 베어링마다 다른 진폭',[amp(cold[0],'c1','베어링 1'),amp(cold[1],'c2','베어링 2')],[0,100]),
  panel('위상도 센서 위치와 중첩의 영향을 받음',[phase(cold[0],'c1','베어링 1'),phase(cold[1],'c2','베어링 2')],[0,360],true)]);
const individual=D.modes.map(m=>simulateMultiMode([m],0,opts));
export const superposition=f(3,'베어링 1의 합성 응답(파랑)과 분리한 1차(회색)·2차(보라)를 비교하세요. 진폭의 산술합이 아닌 복소 벡터 합이라 두 피크 사이에 상쇄 골이 생깁니다. 각 분리 모드는 지연이 거의 180° 전이하지만 합성 위상은 골 근처에서 되돌아갈 수 있습니다.',[
  panel('성분 크기를 더하면 이 합성 곡선이 나오지 않음',[amp(cold[0],'c1','합성'),amp(individual[0],'muted','1차',true),amp(individual[1],'c4','2차',true)],[0,100]),
  panel('분리 모드의 위상과 합성 위상을 함께 보기',[phase(cold[0],'c1','합성'),phase(individual[0],'muted','1차'),phase(individual[1],'c4','2차')],[0,200],true)]);
function polar(p:RunUpPoint[],color:FigColor,title:string):FigPanel {
  const xr:[number,number]=[-110,110],height=620,yr=squareYRange(xr,height,-116);
  return {title,frame:false,height,x:{range:xr},y:{range:yr},series:[{x:p.map(v=>pp(v.amp)*Math.sin(v.lag)),y:p.map(v=>pp(v.amp)*Math.cos(v.lag)),color}],annotations:[
    {type:'line',x1:-95,y1:0,x2:95,y2:0,color:'muted',dash:true},{type:'line',x1:0,y1:-95,x2:0,y2:65,color:'muted',dash:true},
    {type:'text',x:0,y:69,text:'0° 센서 방향 · 지연 ↻',anchor:'middle',color:'muted'},
    {type:'text',x:102,y:0,text:'90°',anchor:'end',color:'muted'},{type:'text',x:-102,y:0,text:'270°',color:'muted'},
    {type:'text',x:0,y:-108,text:'180° · 좌표 단위 µm pp',anchor:'middle',color:'muted'},
    ...[1500,3000,3600].map((n,i)=>{const v=p.find(q=>q.rpm===n)!;return {type:'point' as const,x:pp(v.amp)*Math.sin(v.lag),y:pp(v.amp)*Math.cos(v.lag),label:n+' rpm',color:i===2?'c4' as const:color,dx:i===2?-50:15,dy:i===0?-14:16};})]};
}
export const polarLoops=f(4,'그림 2를 Polar로 읽습니다. 두 공진 구간에서 경로가 둥글게 돌아가지만 베어링 2의 두 번째 경로는 반대쪽입니다. 점은 1500·3000·3600 rpm, 경로는 0→5000 rpm 순서입니다. 고속 벡터가 0으로 돌아가지 않으므로 완전히 닫힌 원 두 개를 요구하지 않습니다. 오빗(시간에 따른 X/Y 축 위치)과 구별하세요.',[
  polar(cold[0],'c1','베어링 1 · 모드 두 개의 굽은 경로'),polar(cold[1],'c2','베어링 2 · 2차 부호 반전')]);
export const nodeSensor=f(5,'중앙(초록)의 형상은 1차 1.5·2차 0입니다. 3000 rpm에서 베어링 1='+fmt(P81_VALUES.b1At3000,4)+'·베어링 2='+fmt(P81_VALUES.b2At3000,4)+' µm pp인데 중앙은 '+fmt(P81_VALUES.centerAt3000,4)+' µm pp입니다. 중앙의 값은 1차 꼬리이며 2차 성분은 정확히 0입니다. 센서 방향·위상 기준이 같은 두 베어링의 위상차는 1500 rpm '+fmt(P81_VALUES.phaseDiff1,3)+'°, 3000 rpm '+fmt(P81_VALUES.phaseDiff2,3)+'°입니다.',[
  panel('마디의 센서는 그 모드를 보지 못함',[amp(cold[0],'c1','베어링 1'),amp(cold[1],'c2','베어링 2'),amp(cold[2],'c3','중앙')],[0,140])]);
const damped=simulateMultiMode([{...D.modes[1],zeta:.2}],0,opts);
const close=simulateMultiMode(D.modes.map((m,i)=>({...m,naturalRpm:i?1900:1500})),0,opts);
export const dampingOverlap=f(6,'위: 분리한 2차 모드에서 ζ₂=0.04(보라)→0.20(초록)이면 3000 rpm 진폭은 75→15 µm pp입니다. 피크가 낮고 넓어집니다. 아래: N₂를 3000(파랑)→1900 rpm(주황)으로 옮긴 베어링 1 합성 응답입니다. 모드가 겹치면 피크의 위치·수와 위상·Polar 회전이 함께 달라집니다.',[
  panel('감쇠 비교 · 2차만 분리한 응답',[amp(individual[1],'c4','ζ₂ 0.04'),amp(damped,'c3','ζ₂ 0.20')],[0,85]),
  panel('가까운 모드 · 합성 피크를 분리하기 어려움',[amp(cold[0],'c1','N₂ 3000'),amp(close,'c2','N₂ 1900')],[0,105])]);
export const thermalComparison=f(7,'1차에 b₁=2 µm Peak·60°의 등가 열 휨을 더했습니다. 저속 0 rpm 한계는 '+fmt(P81_VALUES.hotAtZero,3)+' µm pp이며 200 rpm 표본은 '+fmt(P81_VALUES.hotAt200,4)+' µm pp입니다. 1500 rpm에서 냉간 '+fmt(P81_VALUES.coldAt1500,4)+'→열간 '+fmt(P81_VALUES.hotAt1500,4)+' µm pp, 200 rpm 벡터 보상 뒤에도 '+fmt(P81_VALUES.compAt1500,4)+' µm pp입니다. 보상은 열 휨의 속도 의존 응답을 전부 지우지 못합니다.',[
  panel('동일 회전수에서 냉간·열간·보상 비교',[amp(cold[0],'c1','냉간'),amp(hot,'c2','열간'),amp(compensated,'c3','열간 보상')],[0,120]),
  {...panel('저속 확대 · 열 휨은 정지 한계에서도 남음',[amp(cold[0],'c1','냉간'),amp(hot,'c2','열간'),amp(compensated,'c3','열간 보상')],[0,7]),x:{range:[0,400],label:'회전수 [rpm]'},annotations:[]}]);
const raw=simulateMultiMode(D.modes,0,{...opts,runout:D.runout});
export const runoutEffect=f(8,'같은 냉간 응답에 3 µm Peak·60°의 일정 런아웃을 더합니다(주황). 200 rpm 표본 벡터를 빼면 초록 곡선이 파란 동적 응답에 가까워지지만, 그 표본에 있던 실제 동적 응답도 함께 빠집니다. 벡터 상쇄 골 하나를 새 임계속도로 읽지 마세요.',[
  panel('기계 응답·측정 벡터·보상 결과',[amp(cold[0],'c1','동적 참값'),amp(raw,'c2','런아웃 포함'),amp(compensateSlowRoll(raw,200).points,'c3','200 rpm 보상')],[0,100])]);
