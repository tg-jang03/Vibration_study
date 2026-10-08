import {grid,type FigureSpec,type FigPanel} from '../lib/figure';
import {generatorFrequencies,endwindingResponse,fieldResponse,fieldSeries,torsionalPair} from '../lib/machine/generator';
const fig=(n:number,caption:string,panels:FigPanel[]):FigureSpec=>({id:'fig-p8-5-'+n,caption:'그림 '+n+'. '+caption,panels});
const block=(title:string,labels:string[]):FigPanel=>({title,height:180,frame:false,x:{range:[0,10]},y:{range:[0,4]},series:[],annotations:labels.flatMap((label,i)=>[
  {type:'rect' as const,x1:.2+i*3.3,x2:3+i*3.3,y1:1.8,y2:3,label,color:(['c1','c2','c3'] as const)[i]},
  ...(i<2?[{type:'arrow' as const,x1:3+i*3.3,x2:3.5+i*3.3,y1:2.4,y2:2.4,double:false,color:'muted' as const}]:[]),
])});
const f2=generatorFrequencies(50,2),f4=generatorFrequencies(60,4),atTau=fieldResponse(120),initial=fieldResponse(-1),pair=torsionalPair(100,200,1e6);
export const P85_VALUES={twoPole:f2,fourPole:f4,initialAmp:initial.oneX.amp*1e6,tauAmp:atTau.oneX.amp*1e6,tauLag:atTau.phaseDeg,torsionHz:pair.frequency};
const t=grid(0,.06,241);
export const lineForce=fig(1,'자기장을 cos(2πLF t)로 둔 제곱에는 일정 성분과 2×LF가 있습니다. 힘 크기는 임의입니다. 2극50 Hz이면 1X=50 Hz·2×LF=100 Hz, 4극60 Hz이면 1X=30 Hz·2×LF=120 Hz=4X입니다.',[{
  title:'자기장과 제곱의 주파수 · 50 Hz 개념 예제',height:185,x:{range:[0,.06],label:'시각 [s]'},y:{range:[-1.1,1.1],label:'정규화한 임의값'},series:[{x:t,y:t.map(v=>Math.cos(2*Math.PI*50*v)),label:'자기장 B',color:'c1'},{x:t,y:t.map(v=>Math.cos(2*Math.PI*50*v)**2),label:'B²',color:'c2'}]
}]);
const freq=grid(60,180,241);
export const endwinding=fig(2,'지정 국부 모드120 Hz의 정적 변위 대비 응답비는 감쇠비0.05에서10, 0.1에서5입니다. r=1의 가진에 대한 위상 지연은90°입니다. 실기 합격 기준이나 진폭이 아닙니다.',[{
  title:'단부 권선의 단일 모드 · 지정 fn=120 Hz',height:185,x:{range:[60,180],label:'가진 주파수 [Hz]'},y:{range:[0,11],label:'정적 변위에 대한 응답비'},series:[{x:freq,y:freq.map(v=>endwindingResponse(v,120,.05).amplitudeRatio),label:'ζ=0.05',color:'c1'},{x:freq,y:freq.map(v=>endwindingResponse(v,120,.1).amplitudeRatio),label:'ζ=0.10',color:'c2'}],annotations:[{type:'vline',x:120,label:'2×60 Hz',color:'c3',dash:true}]
}]);
export const thermalChain=fig(3,'계자 전류가 바뀌면 발열·비대칭 팽창·축의 1X 응답까지 시간 지연이 생길 수 있습니다. 단락·권선 구속·냉각 불균일은 별도 후보이며 하나의 1X 기록으로 구별되지 않습니다.',[block('계자 전류 → 열 상태 → 1X 벡터',['전류 i · i² 발열','비대칭 팽창 / 휨','기존 벡터 + 열 성분'])]);
const curve=fieldSeries(),time=curve.map(v=>v.time/60);
export const fieldTrend=fig(4,'가상 전류50→100%를0분에 바꾸고10분에 복귀합니다. τ=2분. 열 상태는 복귀 시각에도 연속이며1X 진폭·위상이 천천히 돌아옵니다. 2분에서22.76 µm Peak·28.50°입니다.',[
  {title:'입력 · 전류는 즉시 변경',height:135,x:{range:[-2,20],label:'시각 [min]'},y:{range:[0,120],label:'상대 전류 [%]'},series:[{x:time,y:curve.map(v=>v.current*100),color:'c1'}]},
  {title:'응답 · 합성 진폭',height:150,x:{range:[-2,20],label:'시각 [min]'},y:{range:[0,30],label:'1X [µm Peak]'},series:[{x:time,y:curve.map(v=>v.oneX.amp*1e6),color:'c2'}]},
  {title:'응답 · 지연각',height:150,x:{range:[-2,20],label:'시각 [min]'},y:{range:[0,45],label:'φ [°]'},series:[{x:time,y:curve.map(v=>v.phaseDeg??0),color:'c3'}]},
]);
const hotTime=grid(0,600,101);
export const interference=fig(5,'기존20 µm Peak에 같은 열 성분을 더해도 방향에 따라 결과가 다릅니다. β90°는 초기20.35→정상25 µm, β180°는16.25→정상5 µm입니다. 열 변화량이 같다고 총진폭의 변화도 같지는 않습니다.',[{
  title:'동일 열 증가 · 다른 벡터 방향',height:180,x:{range:[0,10],label:'가열 경과 [min]'},y:{range:[0,30],label:'합성 1X [µm Peak]'},series:[{x:hotTime.map(v=>v/60),y:hotTime.map(v=>fieldResponse(v).oneX.amp*1e6),color:'c1',label:'β=90°'},{x:hotTime.map(v=>v/60),y:hotTime.map(v=>fieldResponse(v,{lag:Math.PI}).oneX.amp*1e6),color:'c2',label:'β=180°'}]
}]);
export const grounding=fig(6,'축에 전위차가 생겼을 때 설계된 접지 브러시는 전류의 경로를 제공하고 절연은 의도하지 않은 루프를 끊습니다. 개념도이며 특정 기계의 접지·절연 배치가 아닙니다. 축전압과 접지전류는 별도 측정량입니다.',[block('전위차 · 접지 경로 · 베어링',['축전압 / 전하','설계된 브러시 경로','베어링 절연·전류 경로'])]);
const tt=grid(0,.15,301);
export const torsion=fig(7,'가상 두 관성 J1=100·J2=200 kg·m², Kt=10⁶ N·m/rad의 탄성 모드는19.49 Hz입니다. 평균 회전 위에 얹힌 작은 각변동은 반대 부호이고, 관성 가중합은0입니다. 두 축이 평균적으로 반대 회전한다는 뜻은 아닙니다.',[
  {title:'두 관성 + 축 비틀림 강성',height:150,frame:false,x:{range:[0,10]},y:{range:[0,4]},series:[],annotations:[{type:'rect',x1:.5,x2:3,y1:1,y2:3,label:'J1 = 100',color:'c1'},{type:'spring',x1:3,x2:7,y1:2,y2:2,label:'Kt = 10⁶',color:'c3'},{type:'rect',x1:7,x2:9.5,y1:1,y2:3,label:'J2 = 200',color:'c2'}]},
  {title:'평균 회전에 대한 작은 각변동 · 임의 진폭',height:180,x:{range:[0,.15],label:'시각 [s]'},y:{range:[-.8,.8],label:'정규화 δθ [—]'},series:[{x:tt,y:tt.map(v=>pair.shape[0]*Math.cos(2*Math.PI*pair.frequency*v)),label:'δθ1',color:'c1'},{x:tt,y:tt.map(v=>pair.shape[1]*Math.cos(2*Math.PI*pair.frequency*v)),label:'δθ2',color:'c2'}]},
]);
export const shaftSystem=fig(8,'SSR 후보는 계통의 전기 변동·토크·축계 비틀림의 에너지 교환으로 조사합니다. 커플링 정렬 후보는 축 중심선·열간 성장·여러 베어링의 횡/축방향 응답을 연결합니다. 같은 축계라도 필요한 측정량이 다릅니다.',[block('계통과 축계의 비틀림 연결',['계통 전류·전압','전자기 토크','다관성 축계 각변동']),block('정렬과 횡/축방향 응답',['냉간 / 열간 중심선','커플링 힘·모멘트','여러 베어링 응답'])]);
