import {grid,squareYRange,type FigureSpec,type FigPanel} from '../lib/figure';
import {pressureModel,closedPipeFundamental,vectorChange} from '../lib/machine/gt';
import {GEAR_PAIR} from '../lib/faults/gear';
import {formatNumber as fmt} from '../lib/format';
const f=(n:number,caption:string,panels:FigPanel[]):FigureSpec=>({id:'fig-p8-4-'+n,caption:'그림 '+n+'. '+caption,panels});
const stall=pressureModel({kind:'stall'}),surge=pressureModel({kind:'surge'}),spinning=pressureModel(),standing=pressureModel({kind:'standing'}),long=pressureModel({kind:'longitudinal'});
const delta=vectorChange(20e-6,0,20e-6,90);
export const P84_VALUES={stall:stall.frequency,surge:surge.frequency,spinningPhase:spinning.phaseDeg,standingB:standing.peakB,longNode:long.peakB,pipe:closedPipeFundamental(600,1),rms:spinning.rmsA/1000,vectorChange:delta.peak*1e6,gearHz:GEAR_PAIR.gmf,gearOut:GEAR_PAIR.f2,bladeCrossing:600/12*60};
export const alford=f(1,'팁 간극이 원주 방향으로 달라지면 날개 열의 일 추출이 고르지 않아 변위에 직각인 힘이 생길 수 있습니다. 파랑은 변위, 주황은 순방향 선회를 돕는 교차력의 방향입니다. 힘 크기·실기 안정 경계를 계산한 그림은 아닙니다.',[{
  title:'터빈 팁 간극 → 일 추출 차이 → 교차력',height:180,frame:false,x:{range:[0,10]},y:{range:[0,5]},series:[],annotations:[
    {type:'rect',x1:.3,x2:3,y1:3,y2:4.4,label:'원주 팁 간극 차이',color:'c1'},
    {type:'arrow',x1:3,y1:3.7,x2:3.8,y2:3.7,double:false,color:'c1'},
    {type:'rect',x1:3.8,x2:6.5,y1:3,y2:4.4,label:'날개 일 추출 차이',color:'c2'},
    {type:'arrow',x1:6.5,y1:3.7,x2:7.3,y2:3.7,double:false,color:'c2'},
    {type:'point',x:8,y:1.2,color:'c1'},
    {type:'arrow',x1:7.2,y1:1.2,x2:8,y2:1.2,label:'변위 x',double:false,color:'c1'},
    {type:'arrow',x1:8,y1:1.2,x2:8,y2:2.6,label:'힘 Fy',double:false,color:'c2'},
    {type:'text',x:3.5,y:1.6,text:'간극 크기 하나로 원인·안정성을 확정하지 않음',anchor:'middle'},
    {type:'text',x:5,y:.4,text:'P4-4의 교차연성·감쇠와 연결',anchor:'middle',color:'c3'},
  ]
}]);
const wave=(model:ReturnType<typeof pressureModel>,title:string):FigPanel=>({title,height:170,x:{range:[0,2/model.frequency],label:'시각 [s]'},y:{range:[-2.2,2.2],label:'동압 [kPa]'},series:[{x:model.time,y:model.a.map(v=>v/1000),color:'c1',label:'A=0°'},{x:model.time,y:model.b.map(v=>v/1000),color:'c2',dash:true,label:'B=90°'}]});
export const compressor=f(2,'3000 rpm의 가상 압축기. 실속 셀1개가 축속도의0.4배로 이동하면 센서 통과는20 Hz, B90°는A보다90° 늦습니다. 지정5 Hz 축대칭 서지는 두 원주 위치가 같은 위상입니다. 파형만 비교하는 모형이며 실제 서지의 유량 역전·발생 경계는 포함하지 않습니다.',[wave(stall,'회전 실속 · 위치에 따라 지연'),wave(surge,'서지 · 지정 축대칭 압력 변동')]);
export const acoustic=f(3,'모두300 Hz·2 kPa Peak를 지정한 공간 모양입니다. 원주 m1 진행파는B90°의 위상만90° 늦고, 정재파는B90°가 절점입니다. 닫힌 양끝 관의 종방향1차 압력은x/L=0.5가 절점입니다. 실제 연소기의 경계조건을 대신하지 않습니다.',[
  wave(spinning,'원주 진행파 · 같은 진폭, 다른 위상'),
  {title:'t=0 공간 모양 · 원주 정재파 m1',height:150,x:{range:[0,360],label:'원주 θ [°]'},y:{range:[-2.2,2.2],label:'동압 [kPa]'},series:[{x:standing.space,y:standing.shape.map(v=>v/1000),color:'c3'}],annotations:[{type:'point',x:90,y:0,label:'B 절점',color:'c2',dy:-14}]},
  {title:'닫힌 관 종방향1차 · 압력 분포',height:150,x:{range:[0,1],label:'축방향 x/L'},y:{range:[-2.2,2.2],label:'동압 [kPa]'},series:[{x:long.space,y:long.shape.map(v=>v/1000),color:'c4'}],annotations:[{type:'point',x:.5,y:0,label:'절점',color:'c2',dy:-14}]},
]);
export const sensorChain=f(4,'같은 GT에서도 압축기 동압·연소기 동압·축 상대 변위·기어박스 케이싱 가속도는 서로 다른 위치와 물리량입니다. 색이 같은 상자가 한 측정 경로입니다. 센서와 수집기 대역·동기 시각을 먼저 확인하고 원인 후보를 비교합니다.',[{
  title:'위치·측정량·대역을 먼저 구별',height:195,frame:false,x:{range:[0,10]},y:{range:[0,5]},series:[],annotations:[
    {type:'rect',x1:.2,x2:4.3,y1:3.8,y2:4.8,label:'압축기 동압 · Pa',color:'c1'},
    {type:'rect',x1:5.3,x2:9.8,y1:3.8,y2:4.8,label:'연소기 동압 · Pa',color:'c2'},
    {type:'rect',x1:.2,x2:4.3,y1:2,y2:3,label:'주축 상대 변위 · µm',color:'c3'},
    {type:'rect',x1:5.3,x2:9.8,y1:2,y2:3,label:'보조기어박스 가속도 · m/s²',color:'c4'},
    {type:'text',x:5,y:1.2,text:'각 채널의 센서 대역·배관/설치·AAF·수집 주파수를 확인',anchor:'middle'},
    {type:'text',x:5,y:.4,text:'동일 시각의 회전수 · 부하 · 연료 · 유량과 연결',anchor:'middle'},
  ]
}]);
export const accessory=f(5,'실제GT 기어비 대신 P7-6의 가상23:61 감속기를 재사용합니다. 입력1490 rpm에서 맞물림은'+fmt(GEAR_PAIR.gmf,5)+' Hz, 출력축은'+fmt(GEAR_PAIR.f2,4)+' Hz입니다. 맞물림 봉우리 주변 측대역의 간격은 어느 축의 반복인지 묻는 단서입니다. 막대 높이는 임의 표시이며 진폭 예측이 아닙니다.',[{
  title:'GMF 주변 · 출력축 간격을 지정한 선 위치',height:165,x:{range:[GEAR_PAIR.gmf-30,GEAR_PAIR.gmf+30],label:'주파수 [Hz]'},y:{range:[0,1.1],label:'임의 표시 크기 [—]'},series:[{x:[GEAR_PAIR.gmf-GEAR_PAIR.f2,GEAR_PAIR.gmf,GEAR_PAIR.gmf+GEAR_PAIR.f2],y:[.3,1,.3],kind:'stem',color:'c1'}],annotations:[{type:'vline',x:GEAR_PAIR.gmf,label:'GMF',dash:true,color:'muted'}]
}]);
const time=grid(0,10,101),phase=time.map(t=>t<5?0:90);
export const fod=f(6,'동일 회전수·위상 기준의 가상 응답: 전후 모두20 µm Peak인데 위상0→90°로 급변합니다. 차 벡터 크기는'+fmt(P84_VALUES.vectorChange,4)+' µm Peak입니다. FOD를 포함한 갑작스러운 질량/접촉 변화와 센서·기준 변화도 후보이며 이 그림은손상 판정이 아닙니다.',[
  {title:'진폭만 보면 놓치는 변화',height:140,x:{range:[0,10],label:'기록 시각 [min]'},y:{range:[0,25],label:'1X [µm Peak]'},series:[{x:time,y:time.map(()=>20),color:'c1'}],annotations:[{type:'vline',x:5,label:'변화 시각',color:'c4',dash:true}]},
  {title:'같은 채널의 위상 변화',height:140,x:{range:[0,10],label:'기록 시각 [min]'},y:{range:[-10,100],label:'위상 φ [°]'},series:[{x:time,y:phase,color:'c2',kind:'step'}]},
  {title:'응답 벡터 B−A · 동일 기준',height:400,x:{range:[-15,35],label:'실수 성분 [µm Peak]'},y:{range:squareYRange([-15,35],400,-5),label:'허수 성분 [µm Peak]'},series:[],annotations:[
    {type:'arrow',x1:0,y1:0,x2:20,y2:0,label:'A',color:'c1',double:false},
    {type:'arrow',x1:0,y1:0,x2:0,y2:20,label:'B',color:'c2',double:false},
    {type:'arrow',x1:20,y1:0,x2:0,y2:20,label:'B−A',color:'c3',double:false},
  ]},
]);
const rpm=grid(0,4500,91);
export const blade=f(7,'유동의 가상 12차 가진과 지정 일정600 Hz 블레이드 모드가3000 rpm에서 교차하는 개념 예제입니다. 실기 모드의 회전 강성·온도 변화, 진폭·피로 수명은 계산하지 않습니다. 주축1X만으로 국부 블레이드 응답을 모두 알 수는 없습니다.', [{
  title:'Campbell 개념도 · 회전수와 가진/모드의 교차',height:180,x:{range:[0,4500],label:'회전수 [rpm]'},y:{range:[0,950],label:'주파수 [Hz]'},series:[{x:rpm,y:rpm.map(n=>12*n/60),color:'c1',label:'12차 가진'},{x:rpm,y:rpm.map(()=>600),color:'c2',label:'지정 블레이드 모드'},{x:rpm,y:rpm.map(n=>n/60),color:'muted',dash:true,label:'축1X'}],annotations:[{type:'point',x:3000,y:600,label:'교차',color:'c3',dx:8,dy:-12}]
}]);
