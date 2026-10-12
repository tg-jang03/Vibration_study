import { describe, expect, it } from 'vitest';
import { RECORDS, REVIEW, recordSeconds, reviewRecord, speedAt, unbalanceVector } from './example';
import { detectPulses, repairPulses, speedFromPulses } from './keyphasor';
import { binByRpm, bodeSummary, cascadeRows, compensate, perRevVectors, slowRollVector } from './vectors';

const TWO_PI = 2 * Math.PI;

describe('키페이저 펄스', () => {
  it('깨끗한 펄스열: 문턱을 지나는 시각을 샘플 사이에서 잡는다', () => {
    const fs = 1000;
    // 10 Hz, 폭 5 샘플 내려가는 펄스. 앞 가장자리를 0.0123 s + k/10 s에 둔다 (선형 경사 2샘플)
    const x = new Float64Array(1000).fill(0);
    const t0 = 0.0123;
    for (let k = 0; k < 10; k++) {
      const tk = t0 + k / 10;
      for (let i = 0; i < 1000; i++) {
        const u = i / fs - tk;
        if (u >= -0.001 && u < 0.001) x[i] = -5 * ((u + 0.001) / 0.002); // 내려가는 비탈: u = 0에서 −2.5 (문턱)
        else if (u >= 0.001 && u < 0.006) x[i] = -5;
      }
    }
    const p = detectPulses(x, fs);
    expect(p.threshold).toBeCloseTo(-2.5, 9);
    expect(p.times.length).toBe(10);
    p.times.forEach((t, k) => expect(t).toBeCloseTo(t0 + k / 10, 6));
    const s = speedFromPulses(p.times);
    expect(s.rpm[3]).toBeCloseTo(600, 6);
  });
  it('빠진 펄스는 메우고 남는 펄스는 지운다', () => {
    const real = Array.from({ length: 40 }, (_, k) => k * 0.02 * (1 + 0.002 * k));
    const lost = real.filter((_, k) => k !== 10 && k !== 25);
    const withExtra = [...lost.slice(0, 30), lost[29] + 0.015, ...lost.slice(30)];
    const r = repairPulses(withExtra);
    expect(r.filled).toBe(2);
    expect(r.removed).toBe(1);
    expect(r.times.length).toBe(real.length);
    r.times.forEach((t, k) => expect(t).toBeCloseTo(real[k], 3));
  });
});

describe('합성 정지 기록', () => {
  const T = recordSeconds();
  it('6000 → 150 rpm, 약 73초', () => {
    expect(T).toBeCloseTo(73.0, 1);
    expect((speedAt(0).w * 60) / TWO_PI).toBeCloseTo(6000, 9);
    expect((speedAt(T).w * 60) / TWO_PI).toBeCloseTo(150, 6);
  });
  for (const id of ['A', 'B'] as const) {
    it(`${id}: 펄스 수 = 바퀴 수 (B는 고친 뒤), 1X 벡터 = 참값`, () => {
      const rec = reviewRecord(id);
      const p = detectPulses(rec.key, rec.fs);
      // 기록은 θ = 0(홈 앞 가장자리 한가운데)에서 시작해 그 펄스는 세지 않는다 → 펄스 수 = 끝까지 지난 바퀴 수
      const revs = Math.floor(speedAt(T).theta / TWO_PI);
      const tr = RECORDS[id];
      expect(p.times.length).toBe(revs - tr.missing.length + tr.extra.length);
      const rep = repairPulses(p.times);
      expect(rep.filled).toBe(tr.missing.length);
      expect(rep.removed).toBe(tr.extra.length);
      expect(rep.times.length).toBe(revs);
      const v = perRevVectors(rec.x, rec.fs, rep.times, 1, 1);
      // 4000 rpm 근처 한 점: 참값 = 불평형 응답 + 런아웃 1X
      const p0 = v.reduce((b, q) => (Math.abs(q.rpm - 4000) < Math.abs(b.rpm - 4000) ? q : b));
      const u = unbalanceVector(p0.rpm, tr.criticalRpm, tr.zeta);
      const ro = { re: (tr.runout1[0] / 2) * Math.cos((tr.runout1[1] * Math.PI) / 180), im: -(tr.runout1[0] / 2) * Math.sin((tr.runout1[1] * Math.PI) / 180) };
      expect(p0.re).toBeCloseTo(u.re + ro.re, 0);
      expect(p0.im).toBeCloseTo(u.im + ro.im, 0);
    });
  }
  it('slow roll(200 ~ 500 rpm) 벡터 ≈ 런아웃, 보상한 Bode 봉우리 ≈ 임계속도, AF ≈ 1/(2ζ)', () => {
    for (const id of ['A', 'B'] as const) {
      const rec = reviewRecord(id);
      const tr = RECORDS[id];
      const pulses = repairPulses(detectPulses(rec.key, rec.fs).times).times;
      const bins = binByRpm(perRevVectors(rec.x, rec.fs, pulses, 1, 1), 50);
      const sr = slowRollVector(bins, 200, 500)!;
      expect(2 * sr.amp).toBeCloseTo(tr.runout1[0], 0);
      expect(sr.lag).toBeCloseTo(tr.runout1[1], -1);
      const s = bodeSummary(compensate(bins, sr));
      expect(s.peakRpm / tr.criticalRpm).toBeGreaterThan(0.98);
      expect(s.peakRpm / tr.criticalRpm).toBeLessThan(1.04);
      expect(s.af!).toBeCloseTo(1 / (2 * tr.zeta), 0);
      expect(s.rpm90 / tr.criticalRpm).toBeCloseTo(1, 1);
    }
  });
  it('캐스케이드: 회전수 순 정렬, 줄 위치가 1X를 따라간다', () => {
    const rec = reviewRecord('A');
    const pulses = repairPulses(detectPulses(rec.key, rec.fs).times).times;
    const c = cascadeRows(rec.x, rec.fs, pulses, 4096, 40, 250);
    for (let i = 1; i < c.rows.length; i++) expect(c.rows[i].rpm).toBeGreaterThanOrEqual(c.rows[i - 1].rpm);
    const top = c.rows[c.rows.length - 1];
    let k = 1;
    for (let j = 1; j < top.amp.length; j++) if (top.amp[j] > top.amp[k]) k = j;
    expect(Math.abs(c.freq[k] - top.rpm / 60)).toBeLessThan(2);
    expect(REVIEW.fs).toBe(5120);
  });
});
