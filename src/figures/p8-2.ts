import { grid, squareYRange, type FigPanel, type FigSeries, type FigureSpec } from '../lib/figure';
import { phasor, toDeg, subtractVectors } from '../lib/phase';
import { formatNumber as fmt } from '../lib/format';
import { thermalContribution, thermalResponse, slowRollExample, THERMAL_BASELINE } from '../lib/plots/thermal';
import { trendSeries, phaseTrace } from '../lib/plots/trend';
const time = grid(0, 3600, 241), minutes = time.map(t => t / 60);
const bow = trendSeries({ scenario: 'thermal' }), morton = trendSeries({ scenario: 'morton' });
const closed = time.map(t => thermalResponse(t, { scenario: 'morton', growth: 0 }));
const xy = (v: {amp:number;lag:number}) => { const p=phasor(v); return {x:p.re*1e6,y:p.im*1e6}; };
export const P82_VALUES = {
  bowInitial: bow[0].oneX.amp*1e6, bowEnd: bow[60].oneX.amp*1e6,
  bowEndContribution: bow[60].contribution!.amp*1e6,
  bowChange: subtractVectors(bow[60].oneX,bow[0].oneX).amp*1e6,
  slowInitial: slowRollExample(0).amp*2e6, slowEnd:slowRollExample(3600).amp*2e6,
  slowerContribution: thermalContribution(3600,{decayTime:3600}).amp*1e6,
  slowerTotal: thermalResponse(3600,{decayTime:3600}).oneX.amp*1e6,
  mortonEnd: morton[60].oneX.amp*1e6, mortonLag:toDeg(morton[60].oneX.lag),
  mortonChange:subtractVectors(morton[60].oneX,morton[0].oneX).amp*1e6,
};
const f=(n:number,caption:string,panels:FigPanel[]):FigureSpec=>({id:`fig-p8-2-${n}`,caption:`그림 ${n}. ${caption}`,panels});
const ts=(y:number[],label:string,color:FigSeries['color']='c1',dash=false):FigSeries=>({x:minutes,y,label,color,dash});
const panel=(title:string,series:FigSeries[],range:[number,number],label:string):FigPanel=>({title,height:180,x:{range:[0,60],label:'시각 [분]'},y:{range,label},series});
export const thermalBow=f(1,'정지한 뜨거운 축의 원주 온도가 고르지 않으면 길이 방향 열팽창도 달라져 축이 휠 수 있습니다. 윗부분·아랫부분과 휨의 크기는 설명용이며, 실제 온도 분포나 지지 조건을 계산한 그림이 아닙니다.',[{
  title:'정지 중 온도 차이 → 서로 다른 팽창 → 휨',height:180,frame:false,x:{range:[0,10]},y:{range:[0,5]},series:[{x:grid(1,8.8,61),y:grid(0,Math.PI,61).map(x=>.5+.6*Math.sin(x)),color:'c3',width:4}],annotations:[
    {type:'line',x1:1,y1:4,x2:8.8,y2:4,color:'c2',width:5},
    {type:'text',x:1,y:4.6,text:'더 뜨거운 영역: 더 큰 열팽창',anchor:'start',color:'c2'},
    {type:'line',x1:1,y1:3,x2:8.5,y2:3,color:'c1',width:5},
    {type:'text',x:1,y:2.5,text:'더 차가운 영역: 더 작은 열팽창',anchor:'start',color:'c1'},
    {type:'text',x:5,y:1.9,text:'같은 축 안에서 변형 차이 → 휨 (thermal bow)'},
    {type:'text',x:5,y:.1,text:'완전한 정지에서는 1X를 정의할 회전 기준이 없음',color:'muted'},
  ]
}]);
const turn=grid(0,4,161);
export const turningGear=f(2,'터닝 기어는 축을 천천히 돌려 원주 각 부분이 열 환경을 번갈아 지나게 합니다. 아래 곡선은 특정 재료점의 상대 열 노출 개념도입니다. 실제 회전수·온도·터닝 시간은 나타내지 않습니다.',[{
  title:'한 재료점의 열 환경: 정지하면 고정, 돌리면 번갈아 노출',height:160,x:{range:[0,4],label:'터닝 회전 수 (개념)'},y:{range:[-1.4,1.4],label:'상대 열 노출 (개념)'},series:[
    {x:turn,y:turn.map(()=>1),label:'정지: 한쪽에 머묾',color:'c2'},
    {x:turn,y:turn.map(x=>Math.cos(2*Math.PI*x)),label:'터닝: 원주가 번갈아 노출',color:'c1'},
  ],annotations:[{type:'hline',y:0,color:'muted',dash:true,label:'균등한 노출의 기준'}]
}]);
export const eccentricity=f(3,`별도의 slow roll 기하 예제: bow=12e⁻ᵗ/τ µm Peak@80°, 일정 runout=4 µm Peak@80°, τ=20분입니다. 가상 측정 p-p는 ${fmt(P82_VALUES.slowInitial,4)} → ${fmt(P82_VALUES.slowEnd,4)} µm로 내려가지만 runout 8 µm pp는 남습니다. 고속 1X 응답을 같은 크기로 환산한 것이 아닙니다.`,[
  panel('저속 기하 벡터 합: bow와 runout을 함께 측정',[
    ts(time.map(t=>slowRollExample(t).amp*2e6),'가상 측정 p-p'),
    ts(time.map(t=>thermalContribution(t).amp*2e6),'bow 기하 기여','c2'),
    ts(time.map(()=>8),'고정 runout','muted',true),
  ],[0,35],'저속 변위 [µm pp]')
]);
const u=xy(THERMAL_BASELINE), a=xy(bow[0].oneX), b=xy(bow[60].oneX);
export const vectorSum=f(4,'고정 응답 U=20 µm Peak@350°에 열 기여 Q를 복소 합으로 더합니다. 주황 화살표는 U 끝에서 초기 합 V의 끝으로 향합니다. 회색 기준선의 끝과 합의 끝 사이 거리가 |Q|입니다. 고속 응답 기여의 방향은 물리적 hot spot 자리와 같다고 가정할 수 없습니다.',[{
  title:'V = U + Q · 복소 평면 (e⁻ⁱᶲ)',height:360,x:{range:[0,30],label:'Re [µm Peak]'},y:{range:squareYRange([0,30],360,-10),label:'Im [µm Peak]'},series:[],annotations:[
    {type:'arrow',double:false,x1:0,y1:0,x2:u.x,y2:u.y,color:'muted'},
    {type:'arrow',double:false,x1:0,y1:0,x2:a.x,y2:a.y,color:'c1'},
    {type:'arrow',double:false,x1:u.x,y1:u.y,x2:a.x,y2:a.y,color:'c2'},
    {type:'arrow',double:false,x1:0,y1:0,x2:b.x,y2:b.y,color:'c3'},
    {type:'point',x:u.x,y:u.y,label:'U',color:'muted',dx:12,dy:-12},
    {type:'point',x:a.x,y:a.y,label:'V(0)',color:'c1',dx:12,dy:12},
    {type:'point',x:b.x,y:b.y,label:'V(60분)',color:'c3',dx:12,dy:16},
    {type:'text',x:26,y:-3,text:'Q(0)',color:'c2'},
  ]
}]);
export const bowDecay=f(5,`일정 운전 조건의 응답 기여 예제. τ=20분이면 60분 뒤 |Q|=${fmt(P82_VALUES.bowEndContribution,4)} µm Peak, 합 1X=${fmt(P82_VALUES.bowEnd,4)} µm Peak입니다. τ=60분이면 |Q|=${fmt(P82_VALUES.slowerContribution,4)}, 합=${fmt(P82_VALUES.slowerTotal,4)}입니다. 시간상수를 지정한 곡선으로, 실제 냉각·기동 허용 시간을 예측하지 않습니다.`,[
  panel('열 기여는 감소하지만 합 진폭 변화는 훨씬 작음',[
    ts(time.map(t=>thermalResponse(t).oneX.amp*1e6),'합 1X · τ20분'),
    ts(time.map(t=>thermalContribution(t).amp*1e6),'열 기여 · τ20분','c2'),
    ts(time.map(t=>thermalContribution(t,{decayTime:3600}).amp*1e6),'열 기여 · τ60분','c3',true),
  ],[0,26],'변위 [µm Peak]'),
  {title:'합 1X의 연속 지연각: 360°를 지나도 방향은 이어짐',height:150,x:{range:[0,60],label:'시각 [분]'},y:{range:[345,385],label:'합 지연각 [°]'},series:[{x:bow.map(s=>s.time/60),y:phaseTrace(bow,true).lag.map(toDeg),color:'c1'}]}
]);
export const mortonFeedback=f(6,'Morton effect의 개념: 저널의 고르지 않은 유막 전단 가열이 열 휨을 만들고, 응답 변화가 다시 가열 분포를 바꿀 수 있습니다. 열 전달의 지연 때문에 진폭·위상이 느리게 변할 수 있습니다. 아래 연결은 가능한 피드백을 설명하며 성장·주기·회전 방향을 보장하지 않습니다.',[{
  title:'운전 중 열·진동의 상호작용',height:175,frame:false,x:{range:[0,10]},y:{range:[0,5]},series:[],annotations:[
    {type:'rect',x1:.3,x2:3,y1:3.1,y2:4.6,label:'불균일 유막 전단 가열',color:'c2'},
    {type:'arrow',double:false,x1:3,y1:3.8,x2:4.1,y2:3.8,color:'c2'},
    {type:'rect',x1:4.1,x2:6.4,y1:3.1,y2:4.6,label:'저널 온도차 · 열 휨',color:'c3'},
    {type:'arrow',double:false,x1:6.4,y1:3.8,x2:7.3,y2:3.8,color:'c3'},
    {type:'rect',x1:7.3,x2:9.7,y1:3.1,y2:4.6,label:'1X 응답 변화',color:'c1'},
    {type:'arrow',double:false,x1:8.5,y1:3.1,x2:8.5,y2:1.5,color:'muted'},
    {type:'arrow',double:false,x1:8.5,y1:1.5,x2:1.7,y2:1.5,color:'muted',label:'선회·유막 상태 변화 → 가열 분포에 영향'},
    {type:'arrow',double:false,x1:1.7,y1:1.5,x2:1.7,y2:3.1,color:'muted'},
  ]
}]);
const mp=time.map(t=>xy(thermalResponse(t,{scenario:'morton'}).oneX));
const cp=closed.map(p=>xy(p.oneX));
export const mortonLoops=f(7,'Morton형 시간 곡선을 지정한 예제: Q의 초기 반지름5 µm Peak, 주기30분, 60분간 증가100%입니다. 합 V는 고정 U 끝을 중심으로 커지는 루프를 그립니다. 점선은 증가0%의 닫힌 원입니다. APHT는 같은 합 벡터를 원점 기준 크기·각도로 읽으므로 Q의 각도와 다릅니다. 실제 열 피드백을 푼 결과가 아닙니다.',[
  {title:'Polar와 같은 벡터 경로를 복소 평면에 표시',height:500,x:{range:[5,35],label:'Re [µm Peak]'},y:{range:squareYRange([5,35],500,-7),label:'Im [µm Peak]'},series:[
    {x:mp.map(p=>p.x),y:mp.map(p=>p.y),color:'c1',label:'반지름 증가100%'},
    {x:cp.map(p=>p.x),y:cp.map(p=>p.y),color:'c3',label:'증가0% · 닫힌 원',dash:true},
  ],annotations:[{type:'point',x:u.x,y:u.y,label:'고정 U 끝',color:'muted',dx:12,dy:-12},...[0,30,60].map(i=>({type:'point' as const,...xy(morton[i].oneX),label:`${i}분`,color:'c2' as const,dx:12,dy:i===0?-10:12}))]},
  panel('합 1X 진폭 · 열 기여와 다름',[ts(time.map(t=>thermalResponse(t,{scenario:'morton'}).oneX.amp*1e6),'합 1X'),ts(time.map(t=>thermalContribution(t,{scenario:'morton'}).amp*1e6),'|Q|','c3',true)],[0,32],'변위 [µm Peak]'),
]);
export const heatSources=f(8,'비슷한 1X 나선에도 열원은 다를 수 있습니다. Morton은 저널 유막의 비접촉 전단 가열, Newkirk는 접촉·러브의 국부 마찰 가열과 연결됩니다. 파형·오빗·온도·gap·운전 이력·접촉 흔적을 함께 확인해야 합니다. 이 도식은 베어링/씰의 실제 치수나 hot spot 방향을 나타내지 않습니다.',[{
  title:'나선의 모양보다 열원과 동반 증거를 확인',height:170,frame:false,x:{range:[0,10]},y:{range:[0,5]},series:[],annotations:[
    {type:'rect',x1:.2,x2:4.8,y1:2.7,y2:4.6,label:'Morton · 저널 유막 전단열',color:'c1'},
    {type:'text',x:2.5,y:1.9,text:'유막·저널 온도차·운전 조건',color:'c1'},
    {type:'rect',x1:5.2,x2:9.8,y1:2.7,y2:4.6,label:'Newkirk · 접촉 마찰열',color:'c2'},
    {type:'text',x:7.5,y:1.9,text:'접촉·간극·파형·흔적',color:'c2'},
    {type:'text',x:5,y:.6,text:'둘 다 1X 벡터가 천천히 변할 수 있음 → 나선만으로 구별 불가'},
  ]
}]);
