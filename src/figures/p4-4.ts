import { grid, squareYRange, type FigPanel, type FigureSpec } from '../lib/figure';
import { stabilityExample, stabilityModes, forwardInitial, stabilityResponseAt, speedCoupledSystem, whirlWhipPreview, whirlWhipFrequency, campbellIllustration } from '../lib/rotor/stability';
const system=(q=.05,zeta=.05)=>stabilityExample(3000,zeta,q), state=(q=.05,zeta=.05)=>stabilityModes(system(q,zeta));
export const P44_VALUES={zero:state(0),stable:state(.05),boundary:state(.1),unstable:state(.15),doubled:state(.15,.1),whirl:whirlWhipFrequency(80,50),whip:whirlWhipFrequency(150,50),lockRpm:3000/.45,campbellFw:3000/Math.sqrt(.8)};
const ratios=grid(0,.5,251), speeds=grid(0,3,251);
function forcePanel(q:number):FigPanel {
  const th=grid(0,2*Math.PI,121),xr:[number,number]=[-5,5];
  return {title:q<.1?'q/k=0.05: 감쇠 쪽이 더 큽니다':'q/k=0.15: 접선 공급 쪽이 더 큽니다',height:230,frame:false,x:{range:xr},y:{range:squareYRange(xr,230,-1.7)},series:[{x:th.map(Math.cos),y:th.map(Math.sin),color:'muted',dash:true}],annotations:[
    {type:'point',x:1,y:0,color:'c1',label:'축 중심',dx:12,dy:16},
    {type:'arrow',x1:1,y1:0,x2:1,y2:q/.1,color:'c3',double:false,label:'교차 힘 +qA',labelDx:65},
    {type:'arrow',x1:1,y1:0,x2:1,y2:-1,color:'c2',double:false,label:'감쇠 힘 −cωA',labelDx:78},
    {type:'text',x:-4,y:1.2,text:'정방향 선회 ↺',color:'c1'},
    {type:'arrow',x1:1,y1:0,x2:0,y2:0,color:'muted',double:false,label:'직접 복원력',labelDy:25},
  ]};
}
export const energy:FigureSpec={id:'fig-p4-4-1',caption:'그림 1. 같은 반시계 원 운동을 놓고 접선 방향 힘을 비교한다. 오른쪽 점에서 교차 힘은 위로, 감쇠 힘은 아래로 작용한다. 벡터 길이는 ω=ωn에서 cωnA를 1로 정규화했다. 복원력은 중심을 향한다. 선회가 얻는 에너지가 감쇠 손실보다 크면 작은 흔들림이 커질 수 있다.',panels:[forcePanel(.05),forcePanel(.15)]};
function orbitPanel(q:number,title:string):FigPanel {
  const s=system(q),initial=forwardInitial(s,20e-6),ts=grid(0,.08,401),p=ts.map(t=>stabilityResponseAt(s,initial,t));
  const xr:[number,number]=[-160,160],yr=squareYRange(xr,250);yr[0]=-yr[1]/2;yr[1]=-yr[0];
  return {title,height:250,x:{range:xr,label:'X [µm]'},y:{range:yr,label:'Y [µm]'},series:[{x:p.map(v=>v.position.re*1e6),y:p.map(v=>v.position.im*1e6),color:q<.1?'c1':q>.1?'warn':'c3'}],annotations:[{type:'point',x:20,y:0,label:'시작',color:'c3',dx:8,dy:14},{type:'point',x:p.at(-1)!.position.re*1e6,y:p.at(-1)!.position.im*1e6,label:'80 ms',color:'c2',dx:12,dy:-12}]};
}
export const freeOrbits:FigureSpec={id:'fig-p4-4-2',caption:'그림 2. ζ=0.05에서 정방향 모드만 80 ms 그렸다. q/k=0.05는 수렴, 0.10은 경계, 0.15는 발산이다. 모든 초기 변위는 20 µm이며 초기 속도 λfA가 포함된다. 경계의 원은 여러 번 겹쳐 그려졌다. 각 패널의 X·Y 축척은 같다.',panels:[orbitPanel(.05,'σf < 0: 진폭 감소'),orbitPanel(.1,'σf = 0: 경계'),orbitPanel(.15,'σf > 0: 진폭 증가')]};
const roots=ratios.map(q=>state(q));
export const eigenvalues:FigureSpec={id:'fig-p4-4-3',caption:'그림 3. q/k를 0에서 0.5까지 올린 실수 상태계의 네 고유치 궤적이다. 파란 정방향 쌍이 σ=0을 넘어 오른쪽으로 간다. 주황 역방향 쌍은 더 왼쪽으로 간다. 초록 점은 q/k=0.10의 경계이며, q=0에서는 두 모드의 고유치가 같은 두 위치에 겹친다.',panels:[{height:260,x:{range:[-.35,.22],label:'σ/ωn'},y:{range:[-1.15,1.15],label:'Im(λ)/ωn'},series:[...(['forward','backward'] as const).flatMap(branch=>[1,-1].map(sign=>({x:roots.map(v=>v[branch].re/v.omegaN),y:roots.map(v=>sign*Math.abs(v[branch].im)/v.omegaN),color:branch==='forward'?'c1' as const:'c2' as const,label:branch==='forward'?'정방향 모드':'역방향 모드'})))],annotations:[{type:'vline',x:0,color:'muted',dash:true},{type:'point',x:0,y:1,color:'c3',label:'q/k = 0.10',dx:12,dy:17},{type:'point',x:0,y:-1,color:'c3'}]}]};
export const decrement:FigureSpec={id:'fig-p4-4-4',caption:'그림 4. 직접 q를 입력할 때 ζ를 0.05에서 0.10으로 키우면 경계 q/k가 0.10에서 0.20으로 옮겨진다. 속도 연동 q=cΩ/2에서는 c와 q가 함께 커지므로 경계 r=2는 그대로다. δ=0에서 교차하며, δ가 음수이면 모드 진폭이 한 주기마다 커진다.',panels:[
  {title:'q 직접 입력',height:200,x:{range:[0,.5],label:'q/k'},y:{range:[-1.6,1.4],label:'δ'},series:[{x:ratios,y:ratios.map(q=>state(q,.05).logDecrement),color:'c1',label:'ζ=0.05'},{x:ratios,y:ratios.map(q=>state(q,.1).logDecrement),color:'c2',label:'ζ=0.10'}],annotations:[{type:'hline',y:0,color:'muted',dash:true},{type:'point',x:.1,y:0,label:'0.10',dx:0,dy:-15,color:'c1'},{type:'point',x:.2,y:0,label:'0.20',dx:0,dy:-15,color:'c2'}]},
  {title:'q=cΩ/2 속도 연동',height:200,x:{range:[0,3],label:'r = Ω/ωn'},y:{range:[-.7,.7],label:'δ'},series:[{x:speeds,y:speeds.map(r=>stabilityModes(speedCoupledSystem(system(.05,.05),r*100*Math.PI)).logDecrement),color:'c1',label:'ζ=0.05'},{x:speeds,y:speeds.map(r=>stabilityModes(speedCoupledSystem(system(.05,.1),r*100*Math.PI)).logDecrement),color:'c2',label:'ζ=0.10'}],annotations:[{type:'hline',y:0,color:'muted',dash:true},{type:'vline',x:2,label:'모델 한계 r=2',color:'muted',dash:true}]},
]};
const rpm=grid(0,9000,181),preview=whirlWhipPreview();
export const whirlWhip:FigureSpec={id:'fig-p4-4-5',caption:'그림 5. 가상 봉우리를 min(0.45×회전 주파수, 50 Hz)에 놓았다. 4800 rpm에서는 36 Hz(0.45X), 9000 rpm에서는 50 Hz(0.3333X)이다. 전환점은 6667 rpm이며 q=cΩ/2 모델의 안정 한계 6000 rpm과 다른 개념이다. 아래는 동일 높이로 정규화한 가상 스펙트럼을 회전수별로 쌓은 미리보기로, 실제 FFT나 비선형 유막 해가 아니다.',panels:[
  {title:'회전수 추종 → 모드 근처 주파수 고정',height:210,x:{range:[0,9000],label:'회전수 [rpm]'},y:{range:[0,160],label:'주파수 [Hz]'},series:[{x:rpm,y:rpm.map(n=>n/60),color:'muted',dash:true,label:'1X'},{x:rpm,y:rpm.map(n=>whirlWhipFrequency(n/60,50)),color:'c2',label:'가상 subsynchronous 봉우리'}],annotations:[{type:'hline',y:50,label:'f_n = 50 Hz',color:'c1',dash:true}]},
  {title:'가상 워터폴: 봉우리의 위치를 비교하세요',height:260,x:{range:[0,105],label:'주파수 [Hz]'},y:{range:[1.4,3.3],label:'회전수 / 3000 + 정규화 높이'},series:preview.map(p=>({x:p.frequencies,y:p.normalized.map(v=>p.rpm/3000+.14*v),color:'c2'})),annotations:[{type:'vline',x:50,color:'c1',dash:true}]},
]};
const gyro=speeds.map(r=>campbellIllustration(r));
export const campbell:FigureSpec={id:'fig-p4-4-6',caption:'그림 6. Campbell 선도는 회전수별 모드 주파수와 차수선을 겹친다. 이 그림의 가상 자이로 모드선은 f/f_n=√(1+0.01r²)±0.1r, f_n=50 Hz, r=N/3000이다. 파랑은 정방향, 주황은 역방향이다. 초록 점의 1X·정방향 교차는 3354 rpm이다. 교차점은 가진 조건을 더 확인할 잠재 공진이지, 불안정 판정이나 실제 축계 임계속도 예측이 아니다.',panels:[{height:260,x:{range:[0,9000],label:'회전수 [rpm]'},y:{range:[0,320],label:'주파수 [Hz]'},series:[{x:speeds.map(r=>r*3000),y:gyro.map(g=>50*g.forwardRatio),color:'c1',label:'가상 FW 모드'},{x:speeds.map(r=>r*3000),y:gyro.map(g=>50*g.backwardRatio),color:'c2',label:'가상 BW 모드'},{x:speeds.map(r=>r*3000),y:speeds.map(r=>50*r),color:'muted',dash:true,label:'1X'},{x:speeds.map(r=>r*3000),y:speeds.map(r=>100*r),color:'muted',dash:true,label:'2X'}],annotations:[{type:'point',x:P44_VALUES.campbellFw,y:P44_VALUES.campbellFw/60,color:'c3',label:'1X × FW',dx:12,dy:-14}]}]};
export const mitigation:FigureSpec={id:'fig-p4-4-7',caption:'그림 7. q=0.15k를 고정한 직접 모드에서 감쇠를 두 배로 하면 한계 qcrit가 0.10k에서 0.20k로 바뀌어 안정 쪽으로 간다. 실제 베어링·씰 변경은 q만 또는 c만 바꾸지 않을 수 있으므로 새 계수와 모드를 함께 검토한다. 막대는 이 학습 모델의 정규화 강성이다.',panels:[{height:210,x:{range:[0,3],ticks:[.5,1.5,2.5],tickLabels:[{value:.5,label:'현재 q'},{value:1.5,label:'현재 qcrit'},{value:2.5,label:'c2배 qcrit'}]},y:{range:[0,.25],label:'강성 / k'},series:[{x:[.5,1.5,2.5],y:[.15,.1,.2],kind:'bar',color:'c1',barWidth:.45}],annotations:[{type:'hline',y:.15,label:'q=0.15k 고정',color:'c2',dash:true}]}]};
