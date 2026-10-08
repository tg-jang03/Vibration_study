import {it,expect} from 'vitest';
import {angularState,pulseSpeeds,tipTimingDisplacement} from './torsion';
it('각변동의 해석 미분·등각도 근',()=>{const s=pulseSpeeds();for(let i=0;i<s.pulses.length;i++)expect(angularState(s.pulses[i]).angle).toBeCloseTo(i*2*Math.PI/60,10);const t=.012,d=1e-7;expect((angularState(t+d).angle-angularState(t-d).angle)/(2*d)).toBeCloseTo(angularState(t).speed,6);expect(angularState(0).speed-2*Math.PI*50).toBeCloseTo(.01*2*Math.PI*20,10)});
it('간격식은 그 구간의 평균 속도·순시값으로 수렴',()=>{const p=pulseSpeeds(),a=p.pulses[0],b=p.pulses[1];const analytic=2*Math.PI*50+.01*(Math.sin(2*Math.PI*20*b)-Math.sin(2*Math.PI*20*a))/(b-a);expect(p.speed[0]).toBeCloseTo(analytic,9);const coarse=pulseSpeeds({pulsesPerRev:1});const rms=(s:typeof p)=>Math.sqrt(s.speed.reduce((acc,v,i)=>acc+(v-angularState(s.time[i]).speed)**2,0)/s.speed.length);expect(rms(p)).toBeLessThan(rms(coarse)/100)});
it('진동0·알려진60이와 한회전 간격',()=>{for(const z of [1,60]){const s=pulseSpeeds({amplitude:0,pulsesPerRev:z});for(const dt of s.interval)expect(dt).toBeCloseTo(1/(50*z),12);for(const v of s.speed)expect(v).toBeCloseTo(2*Math.PI*50,8)}});
it('두 위치의 공통 회전은 상대각에서 소거',()=>{const t=.012;const relative=angularState(t,{amplitude:.01}).angle-angularState(t,{amplitude:.005}).angle;expect(relative).toBeCloseTo(.005*Math.sin(2*Math.PI*20*t),12)});
it('BTT 시간 지연의 부호·SI·0·회전수 비례',()=>{expect(tipTimingDisplacement(.5,50,10e-6)).toBeCloseTo(-.5*Math.PI*1e-3,12);expect(tipTimingDisplacement(.5,50,0)).toBe(0);expect(tipTimingDisplacement(.5,100,10e-6)).toBe(2*tipTimingDisplacement(.5,50,10e-6))});
it('역회전·잘못된 이수·큰 각변동 거부',()=>{for(const p of [{rotationHz:0},{pulsesPerRev:1.5},{rotationHz:1,amplitude:1},{duration:0}])expect(()=>pulseSpeeds(p)).toThrow();expect(()=>tipTimingDisplacement(0,50,0)).toThrow()});

