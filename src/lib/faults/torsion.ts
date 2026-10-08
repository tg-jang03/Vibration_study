/** P7-9각변동에서 등각도 펄스로. 순수 함수·SI, 전달/실기 모드 추정은 하지 않음. */
export interface PulseOptions {rotationHz?:number;vibrationHz?:number;amplitude?:number;pulsesPerRev?:number;duration?:number}
export const PULSE_DEFAULT={rotationHz:50,vibrationHz:20,amplitude:.01,pulsesPerRev:60,duration:.2};
function parameters(o:PulseOptions){const p={...PULSE_DEFAULT,...o};if(!Object.values(p).every(Number.isFinite)||p.rotationHz<=0||p.vibrationHz<=0||p.amplitude<0||!Number.isInteger(p.pulsesPerRev)||p.pulsesPerRev<1||p.pulsesPerRev>4096||p.duration<=0||p.duration>10||p.rotationHz<=p.amplitude*p.vibrationHz)throw new RangeError('pulse parameters');return p}
export function angularState(time:number,options:PulseOptions={}){const p=parameters(options);if(!Number.isFinite(time))throw new RangeError('time');const mean=2*Math.PI*p.rotationHz,w=2*Math.PI*p.vibrationHz;return {angle:mean*time+p.amplitude*Math.sin(w*time),speed:mean+p.amplitude*w*Math.cos(w*time),perturbation:p.amplitude*Math.sin(w*time)}}
export function pulseSpeeds(options:PulseOptions={}){
  const p=parameters(options),pitch=2*Math.PI/p.pulsesPerRev,mean=2*Math.PI*p.rotationHz,w=2*Math.PI*p.vibrationHz;
  const angle=(t:number)=>mean*t+p.amplitude*Math.sin(w*t);
  const count=Math.floor(angle(p.duration)/pitch+1e-10);if(count>1e6)throw new RangeError('pulse count');
  const pulses=[0];for(let k=1;k<=count;k++){let lo=pulses[k-1],hi=p.duration;const target=k*pitch;for(let i=0;i<55;i++){const mid=(lo+hi)/2;if(angle(mid)<target)lo=mid;else hi=mid}pulses.push((lo+hi)/2)}
  const time:number[]=[],speed:number[]=[],interval:number[]=[];
  for(let i=1;i<pulses.length;i++){const dt=pulses[i]-pulses[i-1];interval.push(dt);time.push((pulses[i]+pulses[i-1])/2);speed.push(pitch/dt)}
  return {pulses,time,speed,interval,mean,pitch};
}
/** t실측−t기준. 회전 방향이 양인 팁 접선 변위의 작은 변위 근사. */
export function tipTimingDisplacement(radius:number,rotationHz:number,delay:number){if(![radius,rotationHz,delay].every(Number.isFinite)||radius<=0||rotationHz<0)throw new RangeError('tip timing');return delay===0||rotationHz===0?0:-radius*2*Math.PI*rotationHz*delay}

