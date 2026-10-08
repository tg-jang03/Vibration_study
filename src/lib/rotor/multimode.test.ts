import { describe, expect, it } from 'vitest';
import { P81_DEFAULT as D, modalVector, multiModeVector, simulateMultiMode, phasePlot, phaseDifference, phaseChange, windowPeak } from './multimode';
import { simulateRunUp, theoreticalPeakRpm, compensateSlowRoll, halfPowerAF } from './runup';
const opt={rpmEnd:5000,rpmStep:20};
const components=(p:{amp:number;lag:number})=>[p.amp*Math.cos(p.lag),-p.amp*Math.sin(p.lag)];
describe('fixed real-mode superposition analytical limits',()=>{
  it.each([0,.8,2.4])('one-mode complex limit agrees with P4-1 at heavySpot %s',heavySpot=>{
    const mode={...D.modes[0],heavySpot};
    const a=simulateMultiMode([mode,{...D.modes[1],eccentricity:0}],0,opt);
    const b=simulateRunUp(mode,opt);
    a.forEach((p,i)=>components(p).forEach((v,k)=>expect(Math.abs(v-components(b[i])[k])).toBeLessThan(1e-12*Math.max(b[i].amp,1e-18))));
  });
  it('superposition adds vectors rather than amplitudes',()=>{
    const parts=D.modes.map(m=>components(modalVector(m,0,2400)));
    const sum=components(multiModeVector(D.modes,0,2400));
    sum.forEach((v,k)=>expect(v).toBeCloseTo(parts[0][k]+parts[1][k],15));
    expect(multiModeVector(D.modes,0,2400).amp).toBeLessThan(D.modes.reduce((a,m)=>a+modalVector(m,0,2400).amp,0));
  });
  it('node rejects exactly the antisymmetric mode at all speeds',()=>{
    for(const rpm of [0,1500,3000,3600,5000]) {
      expect(modalVector(D.modes[1],2,rpm).amp).toBe(0);
      expect(multiModeVector(D.modes,2,rpm).amp).toBeCloseTo(modalVector(D.modes[0],2,rpm).amp,15);
    }
    expect(windowPeak(simulateMultiMode(D.modes,2,opt),2100,4200)).toBeNull();
  });
  it('negative mode shape reverses the isolated mode by 180 degrees',()=>{
    const a=modalVector(D.modes[1],0,3000),b=modalVector(D.modes[1],1,3000);
    expect(a.amp).toBeCloseTo(3e-6/(2*.04),15);expect(b.amp).toBe(a.amp);
    expect(Math.abs(phaseDifference(a,b))).toBeCloseTo(180,12);
  });
  it('bow zero-speed limit equals the signed modal bow sum',()=>{
    const m=D.modes.map((p,i)=>({...p,bow:{amp:(i+1)*1e-6,lag:i*Math.PI/2}}));
    expect(components(multiModeVector(m,0,0))[0]).toBeCloseTo(1e-6,15);
    expect(components(multiModeVector(m,0,0))[1]).toBeCloseTo(-2e-6,15);
  });
  it('isolated peak and half-power agree with the known unbalance solution',()=>{
    const m=D.modes[0],p=simulateMultiMode([m],0,{...opt,rpmStep:1});
    const peak=windowPeak(p,1000,2000)!;
    expect(Math.abs(peak.rpm-theoreticalPeakRpm(m)!)).toBeLessThan(.51);
    expect(halfPowerAF(p)!.af).toBeCloseTo(8.212,2); // finite damping, not exactly 1/(2ζ)
  });
  it('isolated mode phase transition is a finite-window approximation to 180',()=>{
    const p=simulateMultiMode([D.modes[0]],0,opt);
    expect(phaseChange(p,1060,2100)).toBeGreaterThan(159);
    expect(phaseChange(p,1060,2100)).toBeLessThan(180);
  });
  it('high-speed cold limit is minus the sum of modal unbalance vectors',()=>{
    expect(components(multiModeVector(D.modes,0,1e10))[0]).toBeCloseTo(-8e-6,15);
  });
  it('slow-roll compensation keeps speed-dependent bow contribution',()=>{
    const m=D.modes.map((p,i)=>({...p,...(i===0?{bow:D.bow}:{})}));
    const raw=simulateMultiMode(m,0,{...opt,runout:D.runout});
    const p=compensateSlowRoll(raw,200).points;
    expect(p.find(p=>p.rpm===200)!.amp).toBeLessThan(1e-18);
    expect(p.find(p=>p.rpm===1500)!.amp).toBeGreaterThan(multiModeVector(D.modes,0,1500).amp);
    const plain=compensateSlowRoll(simulateMultiMode(m,0,opt),200).points;
    p.forEach((v,i)=>expect(v.amp).toBeCloseTo(plain[i].amp,15));
  });
  it('seeded noise is reproducible but independent between sensors',()=>{
    const a=simulateMultiMode(D.modes,0,{...opt,noise:1e-7});
    expect(a).toEqual(simulateMultiMode(D.modes,0,{...opt,noise:1e-7}));
    expect(a[0]).not.toEqual(simulateMultiMode(D.modes,1,{...opt,noise:1e-7})[0]);
  });
  it('phase display hides zero amplitude and wrap crossings',()=>{
    expect(phasePlot([{rpm:0,amp:0,lag:0},{rpm:1,amp:1e-6,lag:6.27},{rpm:2,amp:1e-6,lag:.01}])[0]).toBeNaN();
    expect(phasePlot([{rpm:1,amp:1e-6,lag:6.27},{rpm:2,amp:1e-6,lag:.01}])[1]).toBeNaN();
    expect(phaseDifference({rpm:0,amp:0,lag:0},{rpm:0,amp:1e-6,lag:0})).toBeNaN();
  });
  it.each([
    {naturalRpm:0},{zeta:0},{eccentricity:-1},{heavySpot:NaN},{shape:[NaN]},
    {bow:{amp:-1,lag:0}},{bow:{amp:1,lag:Infinity}}
  ])('rejects invalid modal input %o',patch=>{
    expect(()=>modalVector({...D.modes[0],...patch},0,1000)).toThrow(RangeError);
  });
  it('validates options and sensor index',()=>{
    expect(()=>simulateMultiMode(D.modes,0,{...opt,noise:-1})).toThrow();
    expect(()=>multiModeVector(D.modes,3,1000)).toThrow();
    expect(()=>multiModeVector([],0,1000)).toThrow();
    expect(()=>simulateMultiMode(D.modes,0,{...opt,runout:{amp:1,lag:NaN}})).toThrow();
  });
});
