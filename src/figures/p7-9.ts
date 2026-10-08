import {grid,type FigureSpec,type FigPanel} from '../lib/figure';
import {angularState,pulseSpeeds,tipTimingDisplacement} from '../lib/faults/torsion';
import {bladeModes,bladeFrequency,bladeCrossing,bladeResponse} from '../lib/machine/campbell';
const fig=(n:number,caption:string,panels:FigPanel[]):FigureSpec=>({id:'fig-p7-9-'+n,caption:'그림 '+n+'. '+caption,panels});
const blocks=(title:string,labels:string[]):FigPanel=>({title,height:165,frame:false,x:{range:[0,10]},y:{range:[0,4]},series:[],annotations:labels.map((label,i)=>({type:'rect',x1:.15+i*3.3,x2:3.05+i*3.3,y1:1.4,y2:2.7,label,color:(['c1','c2','c3'] as const)[i]}))});
const teeth=pulseSpeeds(),once=pulseSpeeds({pulsesPerRev:1}),time=grid(0,.2,601),mean=2*Math.PI*50;
const modes=bladeModes(400,40),cross=modes.map(m=>bladeCrossing(m,12));
const rpm=[...new Set([...grid(0,6000,601),...cross.map(v=>v.rpm!)])].sort((a,b)=>a-b);
export const P79_VALUES={pulseInterval60:1/3000,pulseInterval1:1/50,speedPeak:.01*2*Math.PI*20,cross1:cross[0].rpm!,cross2:cross[1].rpm!,cross8:bladeCrossing(modes[1],8).rpm!,tipMm:tipTimingDisplacement(.5,50,10e-6)*1000,responseLow:bladeResponse(cross[0].rpm!,modes[0],12,.02).amplitudeRatio,responseHigh:bladeResponse(cross[0].rpm!,modes[0],12,.08).amplitudeRatio};
export const motion=fig(1,'횡 프로브는 축 표면의 반경 방향 간극을 읽고, 각도 센서는 표식의 통과 시각을 읽습니다. 한 위치의 각속도 변동과 두 단면의 상대 비틀림은 서로 다른 측정량입니다.',[
  blocks('어떤 좌표를 재나요?',['횡 프로브: 축 중심 x·y','각도 A: θA(t)','각도 B: θB(t)']),
  {title:'두 축 단면의 상대각 · 평균 회전은 공통',height:170,frame:false,x:{range:[0,10]},y:{range:[0,4]},series:[],annotations:[{type:'circle',x:2,y:2,r:45,label:'A',color:'c1'},{type:'spring',x1:2.6,x2:7.4,y1:2,y2:2,label:'축 비틀림 강성',color:'c3'},{type:'circle',x:8,y:2,r:45,label:'B',color:'c2'},{type:'text',x:5,y:.6,text:'δθB − δθA → 상대 비틀림',color:'text'}]}
]);
export const pulses=fig(2,'3000 rpm에서 등간격 60이의 기준 간격은333.3 µs, 한 회전 펄스는20 ms입니다. 20 Hz·10 mrad 각변동의 각속도 변화 Peak는1.257 rad/s입니다. 펄스 사이 평균을 중간 시각에 놓았으며, 한 회전 평균은 변화 폭을 줄입니다.',[
  {title:'60이 펄스의 간격 · 각속도가 클수록 짧아짐',height:160,x:{range:[0,.02],label:'간격 중간 시각 [s]'},y:{range:[331,336],label:'Δt [µs]'},series:[{x:teeth.time.filter(v=>v<=.02),y:teeth.interval.slice(0,teeth.time.filter(v=>v<=.02).length).map(v=>v*1e6),color:'c1'}]},
  {title:'순시 각속도와 펄스 간격 평균',height:210,x:{range:[0,.2],label:'시각 [s]'},y:{range:[-1.4,1.4],label:'평균 대비 각속도 [rad/s]'},series:[{x:time,y:time.map(t=>angularState(t).speed-mean),color:'c1',label:'해석 순시값'},{x:teeth.time,y:teeth.speed.map(v=>v-mean),color:'c2',dash:true,label:'60이 간격 평균'},{x:once.time,y:once.speed.map(v=>v-mean),kind:'dots',radius:4,color:'c3',label:'한 회전 간격 평균'}]}
]);
export const holzer=fig(4,'다관성 축계에서는 시험 주파수를 가정하고 각 관성의 각변동·연결축 토크를 차례로 계산합니다. 끝단 경계조건의 잔차가0이 되는 주파수를 찾는 것이 Holzer 방법의 핵심입니다. 실제 관성·강성·경계조건이 필요합니다.',[
  {title:'여러 관성을 잇는 축계 · 자유 끝단 개념도',height:175,frame:false,x:{range:[0,10]},y:{range:[0,4]},series:[],annotations:[{type:'rect',x1:.3,x2:2.1,y1:1,y2:3,label:'J₁',color:'c1'},{type:'spring',x1:2.1,x2:4,y1:2,y2:2,label:'Kt₁',color:'c3'},{type:'rect',x1:4,x2:5.8,y1:1,y2:3,label:'J₂',color:'c2'},{type:'spring',x1:5.8,x2:7.7,y1:2,y2:2,label:'Kt₂',color:'c3'},{type:'rect',x1:7.7,x2:9.5,y1:1,y2:3,label:'J₃',color:'c4'}]},
  blocks('시험 주파수 → 전달 계산 → 끝단 확인',['시험 f · 시작 상대각','각변동 / 토크 전달','끝단 잔차 = 0 ?'])
]);
export const torque=fig(3,'토크가 갑자기 바뀐 뒤의 감쇠 진동, 반복 토크에 대한 강제응답, 계통과 축계의 에너지 교환은 발생 조건이 다릅니다. 각속도 파형에 사건 시각·전기 신호·운전조건을 맞춰 원인 후보를 좁힙니다.',[
  blocks('토크의 입력을 먼저 구별',['계통 접속 상태의 급변','드라이브 토크 맥동','계통↔축계 에너지 교환']),
  blocks('기록을 같은 시각에 비교',['전압·전류 / 제어 로그','각속도·상대각·축 변형률','감쇠 / 반복 / 지속 성장'])
]);
export const campbell=fig(5,'가상 f₀₁=400 Hz·c₁=40, f₀₂=700 Hz·c₂=20과12차 가진의 교차는2353.39·3771.71 rpm입니다. 첫 모드의 c=0 교차2000 rpm과 비교하면 강성화가 교차를 옮깁니다. 교차 표시만으로 응력이나 피로수명은 알 수 없습니다.',[
  {title:'회전 강성화와 차수선 · 가상 두 모드',height:300,x:{range:[0,6000],label:'N [rpm]'},y:{range:[0,1300],label:'주파수 [Hz]'},series:[...modes.map((m,i)=>({x:rpm,y:rpm.map(n=>bladeFrequency(n,m)),label:'모드 '+(i+1),color:('c'+(i+1)) as 'c1'|'c2'})),{x:rpm,y:rpm.map(n=>12*n/60),label:'12차 가진',color:'c3'},{x:[0,6000],y:[400,400],label:'모드 1 · c=0',color:'muted',dash:true}],annotations:cross.map((v,i)=>({type:'point',x:v.rpm!,y:v.frequency!,label:(i===0?'2353.39':'3771.71')+' rpm',color:'c4',dy:-14}))}
]);
export const response=fig(6,'같은 교차 위치에서도 감쇠가 응답을 바꿉니다. 첫 모드의 r=1 응답비는ζ=0.02에서25, 0.08에서6.25이며 위상 지연은90°입니다. 변위 응답의 정확한 최대점은 r=1과 조금 다를 수 있습니다.',[
  {title:'가상 첫 모드 · 각 조건의 정적 응답 대비',height:230,x:{range:[0,6000],label:'N [rpm]'},y:{range:[0,27],label:'응답비 R [—]'},series:[{x:rpm,y:rpm.map(n=>bladeResponse(n,modes[0],12,.02).amplitudeRatio),label:'ζ=0.02',color:'c1'},{x:rpm,y:rpm.map(n=>bladeResponse(n,modes[0],12,.08).amplitudeRatio),label:'ζ=0.08',color:'c2'}],annotations:[{type:'vline',x:cross[0].rpm!,label:'r=1 교차',dash:true,color:'muted'}]}
]);
export const tipTiming=fig(7,'반경0.5 m·3000 rpm에서 기준보다10 µs 늦게 통과하면 회전 방향을 양으로 둔 팁 접선 변위는−1.571 mm입니다. 작은 변위·같은 기준 각도의 근사입니다. 블레이드24개·프로브1개면 총1200회/s여도 개별 날개는50회/s만 관측합니다.',[
  {title:'한 날개의 통과 시각 · 기대값과 실측값',height:180,x:{range:[-5,20],label:'기준 통과 대비 시각 [µs]'},y:{range:[0,1.4],ticks:'none'},series:[{x:[0],y:[1],kind:'stem',label:'기준',color:'c1'},{x:[10],y:[1],kind:'stem',label:'실측',color:'c2'}],annotations:[{type:'arrow',x1:0,x2:10,y1:.45,y2:.45,double:true,label:'Δt = +10 µs',color:'c3'}]},
  blocks('시간 편차를 물리량으로 바꾸기',['통과 기준·각도·회전수','센서 기하 → 팁 변위','모드 / 구조 → 국부 응력'])
]);
export const bladeSensors=fig(8,'BTT는 팁 운동을 여러 프로브의 통과 시각에서 추정하고, 스트레인 게이지는 붙인 위치·방향의 변형률을 읽습니다. 둘을 연결하려면 모드 형상과 위치별 보정이 필요합니다. 측정 위치가 마디면 응답이 작아도 전체 모드가 조용하다고 단정할 수 없습니다.',[
  blocks('블레이드에서 어디를 보나요?',['BTT: 끝단 통과 시각','게이지: 국부 변형률','모드 형상·방향·보정']),
]);
