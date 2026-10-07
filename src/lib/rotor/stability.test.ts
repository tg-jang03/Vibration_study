import { describe, it, expect } from 'vitest';
import { freeResponseAt, sdofProperties } from '../mck/sdof';
import { stabilityModes, stabilityExample, speedCoupledSystem, forwardInitial, stabilityResponseAt, sampleStabilityResponse, whirlWhipFrequency, whirlWhipPreview, campbellIllustration } from './stability';
const mul = (a: { re: number; im: number }, b: { re: number; im: number }) => ({ re: a.re*b.re-a.im*b.im, im:a.re*b.im+a.im*b.re });
describe('교차연성 선형 안정성', () => {
  it.each([0,.05,.1,.15,.5])('q/k=%s의 복소 특성식과 실수 상태계 잔차', ratio => {
    const s=stabilityExample(3000,.05,ratio), modes=stabilityModes(s);
    for(const l of [modes.forward,modes.backward]) {
      const l2=mul(l,l);expect((s.mass*l2.re+s.damping*l.re+s.stiffness)/s.stiffness).toBeCloseTo(0,11);
      expect((s.mass*l2.im+s.damping*l.im-s.crossStiffness)/s.stiffness).toBeCloseTo(0,11);
    }
    for(const l of modes.eigenvalues) {
      const l2=mul(l,l), a={re:(s.mass*l2.re+s.damping*l.re+s.stiffness)/s.stiffness,im:(s.mass*l2.im+s.damping*l.im)/s.stiffness}, a2=mul(a,a);
      expect(a2.re+ratio**2).toBeCloseTo(0,11);expect(a2.im).toBeCloseTo(0,11);
    }
  });
  it('q=0에서 SDOF 고유치·Log decrement와 일치', () => {
    const s=stabilityExample(3000,.05,0),m=stabilityModes(s),d=sdofProperties(s);
    expect(m.forward.re).toBeCloseTo(-15.7079632679,8);expect(m.forward.im).toBeCloseTo(d.omegaD!,10);
    expect(m.logDecrement).toBeCloseTo(.314552702289,10);expect(m.logDecrement).toBeCloseTo(d.logDecrement!,10);
  });
  it.each([.01,.05,.2])('ζ=%s의 qcrit 경계·양쪽 성장률', zeta => {
    const s=stabilityExample(3000,zeta,2*zeta), m=stabilityModes(s);
    expect(m.forward.re).toBe(0);expect(m.logDecrement).toBe(0);expect(m.status).toBe('marginal');expect(m.forward.im).toBeCloseTo(m.omegaN,10);
    expect(stabilityModes({...s,crossStiffness:s.crossStiffness*.999}).status).toBe('stable');
    expect(stabilityModes({...s,crossStiffness:s.crossStiffness*1.001}).status).toBe('unstable');
  });
  it('c2배: 직접 q 임계2배, q=cΩ/2 회전수 임계 그대로', () => {
    const s=stabilityExample(), a=stabilityModes(s),b=stabilityModes({...s,damping:2*s.damping});
    expect(b.criticalCrossStiffness).toBe(2*a.criticalCrossStiffness);expect(b.criticalOmega).toBe(a.criticalOmega);
    for(const base of [s,{...s,damping:2*s.damping}]) {
      const m=stabilityModes(base);expect(stabilityModes(speedCoupledSystem(base,2*m.omegaN)).forward.re).toBe(0);
      expect(stabilityModes(speedCoupledSystem(base,1.9*m.omegaN)).status).toBe('stable');expect(stabilityModes(speedCoupledSystem(base,2.1*m.omegaN)).status).toBe('unstable');
    }
  });
  it('정지에서 놓기 q=0은 Y=0이며 1D 자유응답과 일치', () => {
    const s=stabilityExample(3000,.05,0), initial={position:{re:20e-6,im:0},velocity:{re:0,im:0}};
    for(const t of [0,.01,.025,.07,.16]) {
      const r=stabilityResponseAt(s,initial,t), d=freeResponseAt(s,{x0:20e-6,v0:0},t);
      expect(r.position.re).toBeCloseTo(d.x,12);expect(r.velocity.re).toBeCloseTo(d.v,12);expect(r.position.im).toBe(0);expect(r.velocity.im).toBe(0);
    }
  });
  it('일반 복소 초기조건·실수 운동방정식·미분 잔차', () => {
    const s=stabilityExample(3000,.05,.15),initial={position:{re:20e-6,im:-10e-6},velocity:{re:.001,im:.002}}, first=stabilityResponseAt(s,initial,0);
    expect(first.position.re).toBeCloseTo(initial.position.re,12);expect(first.position.im).toBeCloseTo(initial.position.im,12);
    expect(first.velocity.re).toBeCloseTo(initial.velocity.re,12);expect(first.velocity.im).toBeCloseTo(initial.velocity.im,12);
    for(const t of [.01,.037,.09]) {
      const r=stabilityResponseAt(s,initial,t);
      expect(s.mass*r.acceleration.re+s.damping*r.velocity.re+s.stiffness*r.position.re+s.crossStiffness*r.position.im).toBeCloseTo(0,9);
      expect(s.mass*r.acceleration.im+s.damping*r.velocity.im+s.stiffness*r.position.im-s.crossStiffness*r.position.re).toBeCloseTo(0,9);
      const h=1e-6, a=stabilityResponseAt(s,initial,t-h),b=stabilityResponseAt(s,initial,t+h);
      expect((b.position.re-a.position.re)/(2*h)).toBeCloseTo(r.velocity.re,8);expect((b.position.im-a.position.im)/(2*h)).toBeCloseTo(r.velocity.im,8);
      expect(Math.hypot(r.position.re,r.position.im)).toBeLessThanOrEqual(r.envelope*(1+1e-12));
    }
  });
  it.each([.05,.1,.15])('정방향 모드 한 주기 진폭비, q/k=%s', ratio => {
    const s=stabilityExample(3000,.05,ratio),m=stabilityModes(s),initial=forwardInitial(s,20e-6),r=stabilityResponseAt(s,initial,2*Math.PI/m.forward.im);
    expect(Math.hypot(r.position.re,r.position.im)/20e-6).toBeCloseTo(Math.exp(-m.logDecrement),10);
    expect(initial.velocity.im).toBeCloseTo(m.forward.im*20e-6,12);
  });
  it('큰 발산에서도 표시 시간은 줄고 포화 없이 유한하다', () => {
    const s=stabilityExample(3000,.01,.5),r=sampleStabilityResponse(s,forwardInitial(s,20e-6));
    expect(r.at(-1)!.time).toBeLessThan(8*.02);expect(r.at(-1)!.envelope/20e-6).toBeCloseTo(20,9);
    r.forEach(p=>expect(Number.isFinite(p.position.re)&&Number.isFinite(p.position.im)).toBe(true));
  });
  it('잘못된 입력·이 모델 밖의 과감쇠 거부', () => {
    const s=stabilityExample();for(const change of [{mass:0},{stiffness:-1},{damping:0},{crossStiffness:-1},{mass:NaN},{damping:2*Math.sqrt(s.mass*s.stiffness)}])expect(()=>stabilityModes({...s,...change})).toThrow(RangeError);
    expect(()=>sampleStabilityResponse(s,forwardInitial(s,20e-6),1)).toThrow();expect(()=>stabilityResponseAt(s,forwardInitial(s,20e-6),-1)).toThrow();
  });
});
describe('별도 개념 주파수선', () => {
  it('0.45X가 모드50Hz에서 고정되고 그 비는 회전수와 감소', () => {
    expect(whirlWhipFrequency(80,50)).toBe(36);expect(whirlWhipFrequency(120,50)).toBe(50);expect(whirlWhipFrequency(150,50)).toBe(50);
    const p=whirlWhipPreview();expect(p[0].rpm).toBe(4500);expect(p.at(-1)!.rpm).toBe(9000);expect(p.at(-1)!.peak).toBe(50);
    expect(()=>whirlWhipFrequency(50,50,1)).toThrow();
  });
  it('자이로 개념선의 무회전 일치와 가상 교차점', () => {
    expect(campbellIllustration(0)).toEqual({forwardRatio:1,backwardRatio:1});
    const fw=1/Math.sqrt(1-.2),bw=1/Math.sqrt(1+.2);expect(campbellIllustration(fw).forwardRatio).toBeCloseTo(fw,12);expect(campbellIllustration(bw).backwardRatio).toBeCloseTo(bw,12);
  });
});

it("속도 연동의 한계 위 주파수는 근처에 머물지만 정확한 잠김은 아니다",()=>{ const b=stabilityExample(); const n=stabilityModes(b).omegaN; const f=(r:number)=>stabilityModes(speedCoupledSystem(b,r*n)).forward.im/n; expect(f(2)).toBeCloseTo(1,12); expect(f(2.5)).toBeCloseTo(1.000700,6); expect(f(3)).toBeCloseTo(1.001553,6); expect(f(100)).toBeGreaterThan(1.7); });
