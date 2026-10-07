import { describe, it, expect } from 'vitest';
import { orbitPoint, orbitRecord, orbitWindow, idealOneX, distinctMarkCount, blankBeforeMarks, dotPhaseStep } from './orbit';
const um=(v:number)=>v*1e6;
describe('orbit reading examples',()=>{
  it('circle and reverse have equal radius and opposite time direction',()=>{
    expect(um(orbitPoint(0).x)).toBeCloseTo(20,10);
    expect(um(orbitPoint(.25).y)).toBeCloseTo(20,10);
    expect(um(orbitPoint(.25,{sign:-1}).y)).toBeCloseTo(-20,10);
    expect(orbitPoint(.25).x).toBe(0);
  });
  it.each([['circle',40,40],['ellipse',40,20],['eight',40,40],['flat',32,40]] as const)('%s has analytic axis p-p', (shape,xpp,ypp)=>{
    const w=orbitWindow(orbitRecord({shape}),0,2);
    expect(um(w.xpp)).toBeCloseTo(xpp,9); expect(um(w.ypp)).toBeCloseTo(ypp,9);
  });
  it.each([[.5,2],[1/3,3],[2/3,3],[.43,8],[1,1],[2,1]])('q=%s has %s observed distinct marks in 8 turns',(order,n)=>{
    const w=orbitWindow(orbitRecord({shape:'sub',order}),0,8);
    expect(w.marks).toHaveLength(8);expect(w.distinct).toBe(n);
    expect(w.marks[1].time-w.marks[0].time).toBeCloseTo(.02,12);
  });
  it('0.43X moves 154.8 degrees per turn and repeats after 100 turns',()=>{
    expect(dotPhaseStep(.43)).toBeCloseTo(154.8,10); expect(dotPhaseStep(.43,-1)).toBeCloseTo(-154.8,10);
    expect(orbitPoint(100,{shape:'sub',order:.43}).x).toBeCloseTo(orbitPoint(0,{shape:'sub',order:.43}).x,12);
    expect(orbitPoint(1,{shape:'sub',order:.43}).x).not.toBeCloseTo(orbitPoint(0,{shape:'sub',order:.43}).x,7);
  });
  it('1X plus superharmonics still repeats at one mark position',()=>{
    expect(orbitWindow(orbitRecord({shape:'banana'}),0,8).distinct).toBe(1);
    expect(orbitWindow(orbitRecord({shape:'flower'}),0,8).distinct).toBe(1);
  });
  it('flat signal mean and analytic first harmonic match quadrature',()=>{
    const n=32768, pts=Array.from({length:n},(_,i)=>orbitPoint(i/n,{shape:'flat'}).x);
    expect(um(pts.reduce((a,b)=>a+b,0)/n)).toBeCloseTo(0,6);
    const cosine=2*pts.reduce((a,b,i)=>a+b*Math.cos(2*Math.PI*i/n),0)/n;
    expect(um(cosine)).toBeCloseTo(um(idealOneX({shape:'flat'}).ax),6);
    expect(um(cosine)).toBeCloseTo(17.15243,5);
  });
  it.each(['circle','ellipse','banana','eight','loop','flower','flat','sub'] as const)('%s actual settled tracking filter agrees with analytic 1X',(shape)=>{
    const w=orbitWindow(orbitRecord({shape}),0,8), ideal=idealOneX({shape});
    // Finite 4-Hz, fourth-order attenuation, and sampled clipping permit <0.006 um error.
    expect(Math.abs(um(w.ax-ideal.ax))).toBeLessThan(.006); expect(Math.abs(um(w.ay-ideal.ay))).toBeLessThan(.006);
  });
  it('same-frequency loop components combine with phase',()=>{
    expect(um(idealOneX({shape:'loop',order:1,extra:20e-6,phase:Math.PI}).ax)).toBeLessThan(1e-12);
    const w=orbitWindow(orbitRecord({shape:'loop',order:1,extra:20e-6,phase:Math.PI}),0,2);
    expect(um(w.ax)).toBeLessThan(.000001);
  });
  it('blank ends before the dot; no end pulse counted twice',()=>{
    const w=orbitWindow(orbitRecord(),0,2), b=blankBeforeMarks(w.x,w.y,true);
    expect(b.x[127]).toBeNaN();expect(b.x[128]).toBe(20e-6);
    expect(w.marks).toHaveLength(2);expect(w.rev.at(-1)).toBe(2);expect(w.distinct).toBe(1);
    expect(blankBeforeMarks(w.x,w.y,false).x).toEqual(w.x);
  });
  it('rejects invalid options and windows',()=>{
    for(const o of [{extra:-1},{extra:Infinity},{order:0},{sign:0},{phase:NaN},{shape:'bad'}]) expect(()=>orbitRecord(o as never)).toThrow();
    const r=orbitRecord(); expect(()=>orbitWindow(r,31)).toThrow();expect(()=>orbitWindow(r,0,3)).toThrow();expect(()=>orbitWindow(r,.5)).toThrow();expect(()=>distinctMarkCount([],-1)).toThrow();
  });
});