import {expect,it} from 'vitest';
import {forcedMotionAt,nextForcedQuarter} from './forcedAnimation';
import {forcedResponseAt,steadyStateResponse} from './forced';
const w=10*Math.PI,system={mass:1,stiffness:w*w,damping:2*.05*w},f0=system.stiffness*.01;
it('정지 초기조건과 정상상태 초기변위를 구별',()=>{
  const input={forceAmplitude:f0,forcingOmega:w/2};
  expect(forcedMotionAt(system,input,0).displacement).toBe(0);
  expect(forcedMotionAt(system,input,0).force).toBe(f0);
  expect(forcedMotionAt(system,input,0,'steady').displacement*1000).toBeCloseTo(13.27433628,7);
});
it('공진에서 힘·변위가 T/4 지연, 영점은 정확히0',()=>{
  const input={forceAmplitude:f0,forcingOmega:w};
  const expected=[[f0,0],[0,.1],[-f0,0],[0,-.1],[f0,0]];
  for(let i=0;i<5;i++){
    const p=forcedMotionAt(system,input,i*.05,'steady');
    expect(p.force).toBeCloseTo(expected[i][0],12);expect(p.displacement).toBeCloseTo(expected[i][1],12);
    if(expected[i][0]===0)expect(p.force).toBe(0);
    if(expected[i][1]===0)expect(p.displacement).toBe(0);
  }
});
it('공진 아래·위에서 힘 최대일 때 변위 방향과 해석식',()=>{
  for(const r of [.5,2]){
    const p=forcedMotionAt(system,{forceAmplitude:f0,forcingOmega:w*r},0,'steady'),h=steadyStateResponse(r,.05);
    expect(p.displacement).toBeCloseTo(.01*h.amplitudeRatio*Math.cos(h.phaseLag),12);
    expect(Math.sign(p.displacement)).toBe(r<1?1:-1);
  }
});
it('임의 시각에서 기존 과도·정상상태 해와 동등',()=>{
  for(const frequency of [0,2.5,4.5,5,15])for(const t of [0,.031,.17,1.25,4]){
    const input={forceAmplitude:f0,forcingOmega:2*Math.PI*frequency},s=forcedResponseAt(system,input,{x0:0,v0:0},t);
    expect(forcedMotionAt(system,input,t).displacement).toBeCloseTo(s.x,12);
    expect(forcedMotionAt(system,input,t,'steady').displacement).toBeCloseTo(s.steady,12);
    expect(forcedMotionAt(system,input,t).force).toBeCloseTo(f0*Math.cos(input.forcingOmega*t),12);
  }
});
it('T/4 이동은 다음 격자·경계·0Hz·구간 밖 처리',()=>{
  expect(nextForcedQuarter(0,5,4)).toBe(.05);expect(nextForcedQuarter(.05,5,4)).toBe(.1);
  expect(nextForcedQuarter(.075,5,4)).toBe(.1);expect(nextForcedQuarter(3.95,5,4)).toBe(4);
  expect(nextForcedQuarter(4,5,4)).toBeNull();expect(nextForcedQuarter(0,0,4)).toBeNull();expect(nextForcedQuarter(0,.05,4)).toBeNull();
  let time=0;for(let i=0;i<240;i++){const next=nextForcedQuarter(time,15,4)!;expect(next).toBeGreaterThan(time);time=next;}expect(time).toBe(4);
});
it('잘못된 시각·주파수·표시 모드 거부',()=>{
  const input={forceAmplitude:f0,forcingOmega:w};
  expect(()=>forcedMotionAt(system,input,-1)).toThrow();expect(()=>forcedMotionAt(system,input,NaN)).toThrow();
  expect(()=>forcedMotionAt(system,input,0,'bad' as 'steady')).toThrow();
  expect(()=>nextForcedQuarter(0,-1,4)).toThrow();expect(()=>nextForcedQuarter(0,1,0)).toThrow();expect(()=>nextForcedQuarter(Infinity,1,4)).toThrow();
});
