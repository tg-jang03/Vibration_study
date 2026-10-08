import { useEffect, useId, useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { forcedResponse, resonancePeak, steadyStateResponse } from '../../lib/mck';
import { forcedMotionAt, nextForcedQuarter } from '../../lib/mck/forcedAnimation';

/** LAB-FRC-01: m = 1 kg, f_n = 5 Hz, X_st = F₀/k = 10 mm로 고정한 1자유도 강제진동. */
const MASS = 1;
const FN = 5;
const OMEGA_N = 2 * Math.PI * FN;
const STIFFNESS = MASS * OMEGA_N ** 2;
const X_ST_MM = 10;
const F0 = (STIFFNESS * X_ST_MM) / 1000;
const DURATION = 4;
const POINTS = 4001;
const R_MAX = 3;
const CURVE = Array.from({ length: 601 }, (_, i) => (R_MAX * i) / 600);

type DisplayMode = 'total' | 'steady';
const DISPLAY_OPTIONS = [
  { value: 'total' as const, label: '정지 상태에서 시작 (과도 포함)' },
  { value: 'steady' as const, label: '정상상태만' },
];
const SPEED_OPTIONS = [{value:0.1,label:'0.1배'}, {value:0.25,label:'0.25배'}, {value:0.5,label:'0.5배'}, {value:1,label:'1배'}];

function springPath(x1:number,x2:number,y:number):string {
  const lead=16,span=x2-x1-2*lead;
  const points=[[x1,y],[x1+lead,y],...Array.from({length:18},(_,i)=>[x1+lead+(i+.5)/18*span,y+(i%2?-14:14)]),[x2-lead,y],[x2,y]];
  return points.map(([x,py],i)=>`${i?'L':'M'}${x},${py}`).join(' ');
}

function clean(value: number): number {
  return Math.abs(value) < 1e-12 ? 0 : value;
}

const deg = (rad: number) => (rad * 180) / Math.PI;

interface ForcedVibrationLabProps {
  initialFrequency?: number;
  initialZeta?: number;
}

export default function ForcedVibrationLab({ initialFrequency = 2.5, initialZeta = 0.05 }: ForcedVibrationLabProps) {
  const [forcingHz, setForcingHz] = useState(initialFrequency);
  const [zeta, setZeta] = useState(initialZeta);
  const [display, setDisplay] = useState<DisplayMode>('total');
  const [elapsed,setElapsed]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(.25),[showAll,setShowAll]=useState(false);
  const arrowId=useId().replace(/:/g,'');
  useEffect(()=>{
    if(!playing)return;
    const started=performance.now()-elapsed/speed*1000;
    let frame=0,lastDraw=0;
    const tick=(now:number)=>{
      const next=Math.max(0,Math.min(DURATION,(now-started)/1000*speed));
      if(now-lastDraw>=40||next>=DURATION){setElapsed(next);lastDraw=now;}
      if(next>=DURATION)setPlaying(false);else frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
    // 재생 시작·속도 변경 때 현재 시각에서 이어간다.
  },[playing,speed]);
  const reset=()=>{setPlaying(false);setElapsed(0);};
  const change=<T,>(setter:(value:T)=>void)=>(value:T)=>{reset();setter(value);};
  const preset=(frequency:number)=>{reset();setForcingHz(frequency);setDisplay('steady');};

  const r = forcingHz / FN;
  const response = steadyStateResponse(r, zeta);
  const phaseDeg = deg(response.phaseLag);
  const peak = resonancePeak(zeta);
  const tau = 1 / (zeta * OMEGA_N);
  const system = useMemo(() => ({ mass: MASS, stiffness: STIFFNESS, damping: 2 * zeta * MASS * OMEGA_N }), [zeta]);
  const input=useMemo(()=>({forceAmplitude:F0,forcingOmega:2*Math.PI*forcingHz}),[forcingHz]);
  const time = useMemo(() => Array.from({ length: POINTS }, (_, i) => (DURATION * i) / (POINTS - 1)), []);
  const states = useMemo(
    () => forcedResponse(system, { forceAmplitude: F0, forcingOmega: 2 * Math.PI * forcingHz }, { x0: 0, v0: 0 }, time),
    [forcingHz, system, time],
  );

  const displacement = useMemo(()=>states.map((s) => clean(1000 * (display === 'total' ? s.x : s.steady))),[states,display]);
  const force = useMemo(()=>time.map((t) => clean(X_ST_MM * Math.cos(2 * Math.PI * forcingHz * t))),[time,forcingHz]);
  const {lastSecondPeak,firstPeak,yLimit}=useMemo(()=>{
    const lastSecond=displacement.slice(Math.floor(((DURATION-1)/DURATION)*(POINTS-1)));
    const max=Math.max(...displacement.map(Math.abs));
    return {lastSecondPeak:Math.max(...lastSecond.map(Math.abs))/X_ST_MM,firstPeak:max/X_ST_MM,yLimit:Math.max(X_ST_MM,max)*1.1};
  },[displacement]);
  const current=forcedMotionAt(system,input,elapsed,display),currentMm=clean(current.displacement*1000),forceMm=clean(current.force/STIFFNESS*1000);
  const count=showAll?POINTS:Math.max(1,Math.floor(elapsed/DURATION*(POINTS-1))+1);
  const windowSeconds=forcingHz>0?Math.min(DURATION,2/forcingHz):DURATION;
  const timeRange:[number,number]=showAll?[0,DURATION]:[Math.max(0,elapsed-windowSeconds),Math.max(windowSeconds,elapsed)];
  const startIndex=showAll?0:Math.floor(timeRange[0]/DURATION*(POINTS-1));
  const nextQuarter=nextForcedQuarter(elapsed,forcingHz,DURATION);
  const scale=65/(yLimit/1.1),offset=currentMm*scale,massX=350+offset,pistonX=163+offset;
  const forceEnd=massX+75*current.force/F0;

  const timeSeries = useMemo<PlotSeries[]>(() => [
    { x: time.slice(startIndex,count), y: force.slice(startIndex,count), name: '힘 F(t)/k [mm 환산]', color: 'var(--plot-2)', width: 1.4 },
    { x: time.slice(startIndex,count), y: displacement.slice(startIndex,count), name: display === 'total' ? '변위 x(t)' : '정상상태 변위', color: 'var(--plot-1)', width: 2 },
    {x:[elapsed,elapsed],y:[-yLimit,yLimit],name:'현재 시각',color:'var(--text-muted)',dash:'dot',hideInLegend:true},
    {x:[elapsed],y:[forceMm],name:'현재 힘 / k',color:'var(--plot-2)',mode:'markers',markerSize:9,hideInLegend:true},
    {x:[elapsed],y:[currentMm],name:'현재 변위',color:'var(--plot-1)',mode:'markers',markerSize:9,hideInLegend:true},
  ], [display, displacement, force, time,count,startIndex,elapsed,yLimit,forceMm,currentMm]);

  const amplitudeCurve = useMemo(()=>CURVE.map((value) => Math.min(steadyStateResponse(value, zeta).amplitudeRatio, 60)),[zeta]);
  const phaseCurve = useMemo(()=>CURVE.map((value) => deg(steadyStateResponse(value, zeta).phaseLag)),[zeta]);
  const ampMax = Math.min(Math.max(peak?.amplitudeRatio ?? 1, 1) * 1.15, 55);

  const amplitudeSeries = useMemo<PlotSeries[]>(()=>[
    { x: CURVE, y: amplitudeCurve, name: `진폭비 (ζ = ${Number(zeta.toFixed(3))})`, color: 'var(--plot-1)', width: 2.2 },
    { x: [0, R_MAX], y: [1, 1], name: 'X_st', color: '#94a3b8', dash: 'dash', width: 1.2 },
    { x: [r], y: [response.amplitudeRatio], name: '현재 점', color: 'var(--plot-2)', mode: 'markers', markerSize: 11 },
  ],[amplitudeCurve,zeta,r,response.amplitudeRatio]);
  const phaseSeries = useMemo<PlotSeries[]>(()=>[
    { x: CURVE, y: phaseCurve, name: '위상 지연', color: 'var(--plot-1)', width: 2.2 },
    { x: [0, R_MAX], y: [90, 90], name: '90°', color: '#94a3b8', dash: 'dash', width: 1.2 },
    { x: [r], y: [phaseDeg], name: '현재 점', color: 'var(--plot-2)', mode: 'markers', markerSize: 11 },
  ],[phaseCurve,r,phaseDeg]);

  const regime = r < 0.75
    ? '스프링이 지배: 힘과 거의 같이 움직임'
    : r <= 1.3
      ? '공진 근처: 감쇠만이 진폭을 제한'
      : '질량(관성)이 지배: 작게, 힘과 거의 반대로 움직임';

  return (
    <LabFrame
      id="LAB-FRC-01"
      title="같은 힘, 다른 박자: 언제 크게 흔들릴까?"
      controls={
        <>
          <ParamSlider label="가진 주파수 f" value={forcingHz} min={0} max={15} step={0.05} unit="Hz" format={(v) => v.toFixed(2)} onChange={change(setForcingHz)} />
          <ParamSlider label="감쇠비 ζ" value={zeta} min={0.01} max={0.5} step={0.005} format={(v) => v.toFixed(3)} onChange={change(setZeta)} />
          <ParamSelect label="시간파형" value={display} options={DISPLAY_OPTIONS} onChange={change(setDisplay)} />
          <div className="param"><span>위상 비교 — 정상상태로 선택</span><div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
            {[[2.5,'공진 아래'],[5,'공진'],[10,'공진 위']].map(([f,label])=><button key={f} className="lab-button" type="button" data-frc-preset={f} onClick={()=>preset(Number(f))}>{label} ({f} Hz)</button>)}
          </div></div>
          <ParamSelect label="재생 속도" value={speed} options={SPEED_OPTIONS} onChange={setSpeed}/>
          <ParamSlider label="선택 시각 t" value={elapsed} min={0} max={DURATION} step={.001} unit="s" format={v=>v.toFixed(3)} onChange={change(setElapsed)}/>
          <ParamToggle label="전체 시간파형 보기" checked={showAll} onChange={setShowAll}/>
          <div className="param"><span>재생 제어</span><div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
            <button className="lab-button" type="button" disabled={playing} onClick={()=>{if(elapsed>=DURATION)setElapsed(0);setPlaying(true);}}>{elapsed>=DURATION?'처음부터 재생':playing?'재생 중':'재생'}</button>
            <button className="lab-button" type="button" disabled={!playing} onClick={()=>setPlaying(false)}>정지</button>
            <button className="lab-button" type="button" disabled={nextQuarter===null} onClick={()=>{setPlaying(false);if(nextQuarter!==null)setElapsed(nextQuarter);}}>T/4 앞으로</button>
            <button className="lab-button" type="button" onClick={reset}>처음 상태</button>
          </div></div>
        </>
      }
      formulas={
        <>
          <Formula display tex={`r = \\dfrac{f}{f_n} = \\dfrac{${texNumber(forcingHz, 3)}}{${FN}} = ${texNumber(r, 3)}`} />
          <Formula
            display
            tex={`\\dfrac{X}{X_{st}} = \\dfrac{1}{\\sqrt{(1-r^2)^2 + (2\\zeta r)^2}} = \\dfrac{1}{\\sqrt{(${texNumber(clean(1 - r ** 2), 3)})^2 + (${texNumber(2 * zeta * r, 3)})^2}} = ${texNumber(response.amplitudeRatio, 4)}`}
          />
          <Formula display tex={`\\varphi = \\operatorname{atan2}(2\\zeta r,\\ 1-r^2) = ${texNumber(clean(phaseDeg), 4)}^\\circ`} />
          <p style={{ margin: 0 }}><strong>지금 구간:</strong> {regime}</p>
        </>
      }
      readouts={
        <ReadoutTable
          caption="정상상태 응답과 공진"
          rows={[
            { label:'현재 시각',value:elapsed,unit:'s',sig:4 },
            { label:'현재 가진력 F(t)',value:current.force,unit:'N',sig:4 },
            { label:'현재 변위 x(t)',value:currentMm,unit:'mm',sig:4 },
            { label: '진동수비 r', value: r, sig: 3 },
            { label: '정상상태 진폭비 X/X_st (식)', value: response.amplitudeRatio, sig: 4 },
            { label: '3~4초의 최대 |x|/X_st (전체 계산)', value: lastSecondPeak, theory: response.amplitudeRatio, sig: 4 },
            { label: '전체 구간의 최대 |x|/X_st', value: firstPeak, sig: 4 },
            { label: '위상 지연 φ', value: clean(phaseDeg), unit: '°', sig: 4 },
            { label: '공진 봉우리 ≈ 1/(2ζ)', value: 1 / (2 * zeta), sig: 4 },
            { label: '과도 응답이 1/e로 줄어드는 시간 τ', value: tau, unit: 's', sig: 3 },
          ]}
        />
      }
      tasks={[
        {question:'공진 (5 Hz)을 고르고 T/4를 누르면 힘과 변위는?',answer:'정상상태의 t=0에서 힘은 +F₀, 변위는 0입니다. 0.05 s 뒤 힘은 0, 변위는 +100 mm입니다(ζ=.05). 힘의 피크에서 T/4 늦게 변위가 피크에 도달합니다.'},
        {
          question: 'ζ = 0.05에서 f = 2.5, 5, 10 Hz(r = 0.5, 1, 2)의 진폭비와 위상은?',
          answer: '약 1.33배·3.8°, 10.0배·90°, 0.333배·176°입니다. 같은 힘인데 박자만 바꿔 응답 크기가 30배 달라집니다.',
        },
        {
          question: 'f = 5 Hz에서 ζ를 0.05 → 0.025로 줄이면 봉우리 높이와 폭은?',
          answer: '높이는 10 → 20으로 약 2배, 진폭비 곡선의 봉우리 폭은 약 절반이 됩니다. 감쇠가 작을수록 공진은 높고 날카롭습니다.',
        },
        {
          question: '"정지 상태에서 시작"으로 두고 f = 5 Hz, ζ = 0.05이면 마지막 1초의 진폭이 식의 값 10에 도달했나요?',
          answer: '아직 조금 모자랍니다. 과도 응답이 τ ≈ 0.64 s로 줄어드는데, 공진에서는 진폭이 1 − e^(−t/τ) 모양으로 천천히 차오르기 때문입니다. "정상상태만"으로 바꾸면 10이 됩니다.',
        },
        {
          question: 'ζ = 0.01, f = 4.5 Hz, "정지 상태에서 시작"이면 시간파형에 무엇이 보이나요?',
          answer: '진폭이 약 2초 주기로 커졌다 작아지는 맥놀이입니다. 5 Hz 근처의 과도 응답과 4.5 Hz의 정상상태 응답이 겹쳐서 생기며, 과도 응답이 사라질수록 줄어듭니다.',
        },
      ]}
      footer="m = 1 kg, fₙ = 5 Hz, 힘의 크기는 X_st = F₀/k = 10 mm가 되도록 고정. 주황 선은 힘을 k로 나눠 mm로 그린 것(그 힘을 천천히 걸었을 때의 처짐)입니다. 기본 시간축은 최근 두 가진 주기를 확대하고, 전체 시간파형은 4초를 보여 줍니다. 최대값 읽음은 전체 4초 계산 결과입니다. 진폭비 곡선은 60에서 자릅니다."
    >
      <p role="status">{display==='steady'?'정상상태: 힘과 변위의 위상 지연을 비교합니다.':'과도 포함: 처음 정지한 질량에서 응답이 차오릅니다. 위상 비교는 정상상태를 선택하세요.'} T/4는 가진력의 한 주기를 네 등분한 시간입니다. 재생 속도는 화면에서 흐르는 시간만 바꿉니다.</p>
      <svg viewBox="0 0 520 240" role="img" aria-label="가진력과 질량 변위가 같은 시각에 움직이는 질량·스프링·댐퍼" style={{display:'block',width:'100%',maxWidth:700,margin:'0 auto',background:'var(--surface-2)',borderRadius:'var(--radius)'}}>
        <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--plot-2)"/></marker></defs>
        <line x1={52} y1={35} x2={52} y2={180} stroke="var(--text-muted)" strokeWidth={4}/>
        {Array.from({length:11},(_,i)=><line key={i} x1={30} y1={43+i*13} x2={52} y2={31+i*13} stroke="var(--text-muted)"/>)}
        <line x1={350} y1={28} x2={350} y2={205} stroke="var(--text-muted)" strokeDasharray="5 5"/>
        <text x={350} y={225} textAnchor="middle" fontSize={14} fill="var(--text-muted)">평형 x=0</text>
        <path d={springPath(52,massX-42,88)} fill="none" stroke="var(--plot-1)" strokeWidth={3}/>
        <text x={170} y={63} textAnchor="middle" fontSize={14} fill="var(--text-muted)">스프링 k</text>
        <line x1={52} y1={147} x2={88} y2={147} stroke="var(--plot-3)" strokeWidth={3}/>
        <rect x={88} y={133} width={150} height={28} fill="none" stroke="var(--plot-3)" strokeWidth={2}/>
        <line data-frc-piston="true" x1={pistonX} y1={136} x2={pistonX} y2={158} stroke="var(--plot-3)" strokeWidth={3}/>
        <line x1={pistonX} y1={147} x2={massX-42} y2={147} stroke="var(--plot-3)" strokeWidth={3}/>
        <text x={163} y={190} textAnchor="middle" fontSize={14} fill="var(--text-muted)">감쇠 c</text>
        <rect data-frc-mass="true" x={massX-42} y={65} width={84} height={112} rx={7} fill="var(--accent-soft)" stroke="var(--plot-1)" strokeWidth={3}/>
        <text x={massX} y={123} textAnchor="middle" fontSize={21} fontWeight={700} fill="var(--text)">m</text>
        {Math.abs(current.force)>.002&&<line data-frc-force="true" x1={massX} y1={38} x2={forceEnd} y2={38} stroke="var(--plot-2)" strokeWidth={3} markerEnd={`url(#${arrowId})`}/>}
        <text x={350} y={20} textAnchor="middle" fontSize={14} fill="var(--plot-2)">가진력 F(t)</text>
      </svg>
      <p className="lab-note">파랑은 질량 변위, 주황은 외부 가진력입니다. 장치 그림의 변위 범위는 조건마다 ±{(yLimit/1.1).toFixed(2)} mm로 조정합니다. 힘 화살표는 같은 힘에 같은 길이입니다. 진폭 크기는 파형·읽음값의 mm로 비교하세요.</p>
      <Plot
        series={timeSeries}
        x={{ label: '시간 t [s]', range: timeRange }}
        y={{ label: '변위 x [mm]', range: [-yLimit, yLimit] }}
        height={300}
        ariaLabel="가진력과 변위의 시간파형. 과도 응답이 줄어들며 가진 주파수의 정상상태로 수렴한다"
      />
      <Plot
        series={amplitudeSeries}
        x={{ label: '진동수비 r = f/fₙ', range: [0, R_MAX] }}
        y={{ label: '진폭비 X/X_st', range: [0, ampMax] }}
        height={240}
        ariaLabel="진동수비에 따른 진폭비 곡선과 현재 가진 주파수의 점"
      />
      <Plot
        series={phaseSeries}
        x={{ label: '진동수비 r = f/fₙ', range: [0, R_MAX] }}
        y={{ label: '위상 지연 φ [°]', range: [0, 185] }}
        height={220}
        ariaLabel="진동수비에 따른 위상 지연 곡선과 현재 가진 주파수의 점"
      />
    </LabFrame>
  );
}
