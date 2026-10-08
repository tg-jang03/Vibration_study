import {grid,squareYRange,type FigureSpec,type FigPanel,type FigSeries} from '../lib/figure';
import {steamState,steamLoadCurve,steamFreeResponse,uniformExpansion,axialReferences} from '../lib/rotor/steam';
import {formatNumber as fmt} from '../lib/format';
const f=(n:number,caption:string,panels:FigPanel[]):FigureSpec=>({id:`fig-p8-3-${n}`,caption:`그림 ${n}. ${caption}`,panels});
const curve=steamLoadCurve(),up=steamLoadCurve({admission:'up'}),down=steamLoadCurve({admission:'down'});
const at=(load:number)=>steamState({load}),u=steamState({admission:'up'}),d=steamState({admission:'down'}),r=steamState({admission:'right'});
const loads=curve.map(s=>s.load*100),um=(v:number)=>v*1e6;
const axial=axialReferences(uniformExpansion(8,250),uniformExpansion(8,150),.2e-3);
export const P83_VALUES={
  threshold:at(.5).threshold!*100,lowDelta:at(.5).modes.logDecrement,highDelta:at(.8).modes.logDecrement,
  highSigma:at(.8).modes.forward.re,highFrequency:at(.8).modeHz,
  lowEnd:um(steamFreeResponse({load:.5}).at(-1)!.envelope),highEnd:um(steamFreeResponse({load:.8}).at(-1)!.envelope),
  upEpsilon:u.journal.eccentricityRatio,upFilm:um(u.journal.minimumFilm),downEpsilon:d.journal.eccentricityRatio,
  baseEpsilon:at(.5).journal.eccentricityRatio,baseFilm:um(at(.5).journal.minimumFilm),
  thermalDifference:axial.thermalDifference*1000,measuredDE:axial.differentialExpansion*1000,
};
export const steamMechanism=f(1,'회전수가 일정한 ST에서도 증기 유동·씰 선회류의 교차력이 횡진동에 에너지를 공급할 수 있습니다. 여기서는 부하에 따른 교차연성 q의 변화를 지정해 P4-4의 감쇠와 경쟁하는 모습을 읽습니다. 실제 증기 유동·모드·베어링 동계수를 계산한 그림은 아닙니다.',[{
  title:'부하·증기 조건 → 교차연성 vs 감쇠',height:160,frame:false,x:{range:[0,10]},y:{range:[0,5]},series:[],annotations:[
    {type:'rect',x1:.2,x2:3,y1:2.7,y2:4.4,label:'증기 유동 · 씰 선회류',color:'c2'},
    {type:'arrow',double:false,x1:3,y1:3.5,x2:4,y2:3.5,color:'c2'},
    {type:'rect',x1:4,x2:6.2,y1:2.7,y2:4.4,label:'교차연성 q',color:'c2'},
    {type:'arrow',double:false,x1:6.2,y1:3.5,x2:7.2,y2:3.5,color:'c2'},
    {type:'rect',x1:7.2,x2:9.8,y1:2.7,y2:4.4,label:'횡진동 · 선회',color:'c1'},
    {type:'text',x:5,y:1.5,text:'베어링·지지의 감쇠와 함께 평가',anchor:'middle',color:'c3'},
    {type:'text',x:5,y:.6,text:'1X가 아닌 주파수선 + 부하·증기 조건 + 여러 위치의 자료',anchor:'middle'},
  ]
}]);
const deltaPanel:FigPanel={title:'지정 모델: q/k=0.03+0.15ℓ · ζ=0.06',height:190,x:{range:[0,100],label:'부하 [%]'},y:{range:[-.2,.32],label:'Log decrement δ'},series:[{x:loads,y:curve.map(s=>s.modes.logDecrement),color:'c1'}],annotations:[{type:'vline',x:60,label:'경계 60%',color:'c4',dash:true},{type:'hline',y:0,color:'muted',dash:true}]};
export const loadThreshold=f(2,`등가 모드 1800 rpm·자전 3000 rpm인 가상 모델. 경계는 q/k=2ζ에서 ${fmt(P83_VALUES.threshold,4)}%입니다. 50%의 δ=${fmt(P83_VALUES.lowDelta,4)}는 양수, 80%의 δ=${fmt(P83_VALUES.highDelta,4)}는 음수입니다. 주파수선은 모드 고유치이며 관측 스펙트럼이나 실제 ST 부하 제한이 아닙니다.`,[
  deltaPanel,
  {title:'회전수는 그대로지만 별도 모드가 성장할 수 있음',height:160,x:{range:[0,100],label:'부하 [%]'},y:{range:[0,55],label:'주파수 [Hz]'},series:[
    {x:loads,y:curve.map(s=>s.modeHz),color:'muted',dash:true,label:'가상 모드'},
    {x:curve.filter(s=>s.modes.status==='unstable').map(s=>s.load*100),y:curve.filter(s=>s.modes.status==='unstable').map(s=>s.modeHz),color:'c2',label:'성장 구간'},
    {x:[0,100],y:[50,50],color:'c1',label:'1X=50 Hz'},
  ]}
]);
export const freeResponse=f(3,`같은 5 µm Peak 초기 모드에서 선형 자유응답을 시작한 예제입니다. 8고유주기(0.2667 s) 뒤 50%는 ${fmt(P83_VALUES.lowEnd,4)}, 80%는 ${fmt(P83_VALUES.highEnd,4)} µm Peak입니다. 안정 모드도 초기 교란에 대한 응답이 존재합니다. 성장 곡선은 실제 운전 진폭·비선형 포화값이 아닙니다.`,[{
  title:'초기 교란이 잦아드는가, 커지는가?',height:180,x:{range:[0,8/30],label:'시각 [s]'},y:{range:[0,12],label:'자유응답 포락선 [µm Peak]'},series:[.5,.6,.8].map((load,i)=>{const v=steamFreeResponse({load});return {x:v.map(s=>s.time),y:v.map(s=>um(s.envelope)),label:`부하${load*100}%`,color:(['c1','c3','c2'] as const)[i]};})
}]);
export const partialAdmission=f(4,'부분 분사는 원주의 일부 구간으로 증기를 보내는 방식입니다. 밸브 조합과 유로에 따라 반경 방향 증기력의 크기·방향이 달라져 베어링 하중을 바꿀 수 있습니다. 이 그림의 상향·하향 화살표는 가능한 합력 방향 예시이며 실제 노즐 배치·밸브 순서를 나타내지 않습니다.',[{
  title:'같은 출력이라도 반경 합력은 분사 조건에 따라 달라짐',height:185,frame:false,x:{range:[0,10]},y:{range:[0,5]},series:[],annotations:[
    {type:'circle',x:2.4,y:2.7,r:55,color:'c1'},
    {type:'text',x:2.4,y:4.6,text:'전주 분사 예제',anchor:'middle',color:'c1'},
    {type:'text',x:2.4,y:.7,text:'대칭으로 순 반경력 0을 지정',anchor:'middle',color:'c1'},
    {type:'circle',x:7.5,y:2.7,r:55,color:'c2'},
    {type:'arrow',double:false,x1:7.5,y1:1.4,x2:7.5,y2:3.9,color:'c2'},
    {type:'text',x:7.5,y:4.6,text:'부분 분사 · 상향 예제',anchor:'middle',color:'c2'},
    {type:'text',x:7.5,y:.7,text:'중력과 반대 → 하중 감소 가능',anchor:'middle',color:'c2'},
  ]
}]);
const position=(s:ReturnType<typeof steamState>)=>({x:um(s.journal.x),y:um(s.journal.y)});
export const centerline=f(5,'부하 50%에서 순 증기력을 0·상향 600·하향 600·우향 600 N으로 지정했습니다. 중력은 1000 N 아래 방향입니다. 등방 짧은 원통의 정적해를 합력 방향으로 회전한 결과를 동일 축척으로 확대했습니다. 원점(간극 중심)은 표시 범위 밖입니다. 정적 위치 변화는 진동 오빗과 다릅니다.',[{
  title:'정적 Shaft centerline · +X 오른쪽,+Y 위 · 원점 기준 위치',height:520,x:{range:[30,90],label:'X [µm]'},y:{range:squareYRange([30,90],520,-69),label:'Y [µm]'},series:[],annotations:[
    ...[at(.5),u,d,r].map((s,i)=>({type:'point' as const,...position(s),label:['전주 ·1000 N','상향 ·400 N','하향 ·1600 N','우향 ·1166 N'][i],color:(['c1','c2','c3','c4'] as const)[i],dx:12,dy:i>=2?15:-10})),
  ]
}]);
const eps=(v:ReturnType<typeof steamLoadCurve>,label:string,color:FigSeries['color']):FigSeries=>({x:loads,y:v.map(s=>s.journal.eccentricityRatio),label,color});
export const bearingLoad=f(6,`지정된 부분 분사력은 600 sin(πℓ) N으로, 50%에서 가장 큽니다. 상향이면 ε=${fmt(P83_VALUES.baseEpsilon,4)} → ${fmt(P83_VALUES.upEpsilon,4)}, 최소유막=${fmt(P83_VALUES.baseFilm,4)} → ${fmt(P83_VALUES.upFilm,4)} µm입니다. 하향이면 ε=${fmt(P83_VALUES.downEpsilon,4)}로 커집니다. ε에서 감쇠·교차연성이나 실제 안정 한계를 계산한 것은 아닙니다.`,[{
  title:'상향/하향 분사에 따른 정적 편심률',height:185,x:{range:[0,100],label:'부하 [%]'},y:{range:[.45,.8],label:'편심률 ε'},series:[eps(curve,'전주','c1'),eps(up,'상향','c2'),eps(down,'하향','c3')]
}]);
export const axialChannels=f(7,`서로 다른 기준을 갖는 채널의 기하 예제입니다. 균일 자유팽창 α_T=12×10⁻⁶/K·L=8 m, 로터/케이싱 온도증가 250/150 K를 지정하면 팽창 24/14.4 mm·열팽창 차이${fmt(P83_VALUES.thermalDifference,4)} mm입니다. 전체 축이+0.2 mm 이동하면 이 단순 타깃 배치의 상대 측정은${fmt(P83_VALUES.measuredDE,4)} mm입니다. 실제 DE 채널은 장착·보상 방식과 추력 기준에 따라 달라집니다.`,[
  {title:'기준·타깃을 확인: thrust와DE는 같은 질문이 아님',height:190,frame:false,x:{range:[0,10]},y:{range:[0,5]},series:[],annotations:[
    {type:'line',x1:1,y1:3.7,x2:9,y2:3.7,color:'c1',width:6},
    {type:'line',x1:1,y1:2.2,x2:7.3,y2:2.2,color:'c2',width:6},
    {type:'text',x:5,y:4.5,text:'로터 타깃 · 팽창 + 전체 축 이동',anchor:'middle',color:'c1'},
    {type:'text',x:5,y:1.5,text:'케이싱 타깃 · 케이싱 팽창',anchor:'middle',color:'c2'},
    {type:'line',x1:1,y1:1,x2:1,y2:4.2,color:'muted',dash:true},
    {type:'arrow',double:false,x1:7.3,y1:2.8,x2:9,y2:2.8,color:'c3',label:'상대 측정'},
    {type:'text',x:5,y:.4,text:'Thrust: 추력 기준 부근 축 위치 / DE: 장착한 로터·케이싱 사이 상대 변위',anchor:'middle'},
  ]},
  {title:'가상 단위 계산 · 전체 축 이동을 열팽창과 구별',height:160,x:{range:[-.5,4.5],tickLabels:[{value:0,label:'로터 팽창'},{value:1,label:'케이싱 팽창'},{value:2,label:'열팽창 차이'},{value:3,label:'전체 축 이동'},{value:4,label:'상대 측정'}],ticks:[0,1,2,3,4]},y:{range:[0,26],label:'변위 [mm]'},series:[{x:[0,1,2,3,4],y:[24,14.4,9.6,.2,9.8],kind:'stem',color:'c1'}]}
]);
const x=grid(0,3,121),sag=x.map(v=>-.4*Math.sin(Math.PI*v/3));
export const shaftAlignment=f(8,'다축 ST의 정렬은 커플링 두 면뿐 아니라 여러 베어링과 축계 전체를 봅니다. 위 곡선은 자중 처짐을 고려하는 shaft-line 개념도, 아래 점은 지지부의 서로 다른 열 이동 개념도입니다. 정확한 catenary·베어링 반력·열 이동량을 계산한 결과가 아니며, 실제 정렬 목표는 제작사 축계 모델·측정값으로 정합니다.',[
  {title:'자중 처짐과 여러 지지부 · 모두 수평인 한 직선이 목표인가?',height:150,frame:false,x:{range:[-.2,3.2]},y:{range:[-1,1]},series:[{x,y:sag,color:'c1'}],annotations:[...Array.from({length:4},(_,i)=>({type:'circle' as const,x:i,y:sag[i*40],r:9,color:'c3' as const})),{type:'text',x:1.5,y:.7,text:'HP · IP · LP · 발전기로 이어지는 축계 (개념)',anchor:'middle'}]},
  {title:'냉간 정렬 + 지지부 열 이동 → 열간 정렬·하중 분배',height:150,frame:false,x:{range:[-.2,3.2]},y:{range:[-1,1]},series:[{x:[0,1,2,3],y:[0,0,0,0],color:'muted',dash:true,label:'냉간 기준'},{x:[0,1,2,3],y:[.1,.5,.3,.15],color:'c2',label:'열 이동을 지정한 예제'}],annotations:[{type:'text',x:1.5,y:-.6,text:'한 베어링 높이 변화 → 이웃 베어링 반력도 함께 변할 수 있음',anchor:'middle'}]}
]);
