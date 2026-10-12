import { describe, expect, it } from 'vitest';
import {
  accelerance,
  bumpAverage,
  expAddedZeta,
  forceBandwidth10dB,
  halfPower,
  halfSineFT,
  impactTest,
  IMPULSE,
  MODE_BANDS,
  PEDESTAL,
  runningSpectrum,
  TIPS,
} from './impact';

const absC = (z: [number, number]) => Math.hypot(z[0], z[1]);

describe('반사인 충격의 스펙트럼 (P9-1 §2)', () => {
  it('F(0) = 충격량, 첫 0 = 1.5/t_c, 극한점 ω = π/t_c가 이웃과 이어진다', () => {
    const tc = TIPS.plastic.tc;
    expect(absC(halfSineFT(0, tc))).toBeCloseTo(IMPULSE, 9);
    expect(absC(halfSineFT(1.5 / tc, tc))).toBeLessThan(1e-9);
    const fa = 0.5 / tc;
    expect(absC(halfSineFT(fa, tc))).toBeCloseTo(absC(halfSineFT(fa * (1 + 1e-6), tc)), 4);
  });

  it('−10 dB 대역 ≈ 1.02/t_c (고무 127 Hz, 플라스틱 510 Hz, 강철 2.55 kHz)', () => {
    for (const { tc } of Object.values(TIPS)) {
      const f10 = forceBandwidth10dB(tc);
      expect(f10 * tc).toBeCloseTo(1.019, 3);
      expect(20 * Math.log10(absC(halfSineFT(f10, tc)) / IMPULSE)).toBeCloseTo(-10, 6);
    }
  });
});

describe('받침대 가속도 FRF와 Half-power', () => {
  const fine = Array.from({ length: 40001 }, (_, i) => i * 0.01);
  const mag = fine.map((f) => absC(accelerance(PEDESTAL, f)));

  it('깨끗한 FRF에서 Half-power ζ는 모드마다 참값의 ±2 % 안 (가속도 FRF, 이웃 모드 영향 포함)', () => {
    MODE_BANDS.forEach(([lo, hi], i) => {
      const h = halfPower(fine, mag, lo, hi)!;
      expect(Math.abs(h.zeta - PEDESTAL[i].zeta) / PEDESTAL[i].zeta).toBeLessThan(0.02);
      expect(h.q).toBeCloseTo(1 / (2 * h.zeta), 9);
    });
  });

  it('봉우리를 구간 끝에서 찾으면(경계) 읽지 않는다', () => {
    expect(halfPower(fine, mag, 50, 100)).toBeNull();
  });
});

describe('가상 임팩트 시험 (LAB-HPB-01)', () => {
  const quiet = { responseNoise: 0, forceNoise: 0 };

  it('잡음 없고 다 잦아드는 프레임(4 s)이면 H1 = 해석 FRF (0 ~ 400 Hz, 차이 < 가장 큰 봉우리의 0.1 %)', () => {
    const r = impactTest({ tip: 'plastic', T: 4, expTau: null, forceWindow: false, averages: 1, doubleHit: false, ...quiet });
    // 대역 제한(이상적인 AAF)한 펄스의 1/t 꼬리가 프레임에서 잘려 저주파에 아주 작은 찌꺼기(≈ 3e-6)가 남는다
    let worst = 0;
    let peak = 0;
    for (let k = 1; k < r.freqs.length && r.freqs[k] <= 400; k++) {
      const h = absC(accelerance(PEDESTAL, r.freqs[k]));
      peak = Math.max(peak, h);
      worst = Math.max(worst, Math.abs(r.mag[k] - h));
    }
    expect(worst / peak).toBeLessThan(1e-3);
  });

  it('평균 1장이면 코히어런스는 어디서나 1', () => {
    const r = impactTest({ tip: 'plastic', T: 1, expTau: null, forceWindow: true, averages: 1, doubleHit: false });
    expect(Math.min(...Array.from(r.coh.slice(1, 400)))).toBeGreaterThan(1 - 1e-9);
  });

  it('지수 윈도우는 ζ를 1/(τω_n)만큼 보탠다 → 빼면 참값 근처 (T 4 s, τ 0.3 s)', () => {
    const tau = 0.3;
    const r = impactTest({ tip: 'plastic', T: 4, expTau: tau, forceWindow: true, averages: 1, doubleHit: false, ...quiet });
    for (const i of [0, 1, 2]) {
      const h = halfPower(r.freqs, r.mag, MODE_BANDS[i][0], MODE_BANDS[i][1])!;
      const added = expAddedZeta(tau, h.fPeak);
      expect(Math.abs(h.zeta - added - PEDESTAL[i].zeta) / PEDESTAL[i].zeta).toBeLessThan(0.08);
      expect(h.zeta).toBeGreaterThan(PEDESTAL[i].zeta + 0.8 * added);
    }
  });

  it('고무 팁은 290 Hz 3차를 거의 못 흔든다 (힘 −32 dB) → 코히어런스가 떨어진다', () => {
    const tc = TIPS.rubber.tc;
    expect(20 * Math.log10(absC(halfSineFT(290, tc)) / IMPULSE)).toBeLessThan(-30);
    const rub = impactTest({ tip: 'rubber', T: 1, expTau: null, forceWindow: true, averages: 5, doubleHit: false });
    const pla = impactTest({ tip: 'plastic', T: 1, expTau: null, forceWindow: true, averages: 5, doubleHit: false });
    expect(rub.coh[290]).toBeLessThan(0.9);
    expect(pla.coh[290]).toBeGreaterThan(0.99);
  });
});

describe('운전 중 판별과 범프 테스트', () => {
  it('1X는 회전수를 따라가고, 바닥의 둔덕은 47.5 Hz에 머문다', () => {
    const a = runningSpectrum(2400);
    const b = runningSpectrum(3000);
    expect(a.freqs[a.k1]).toBeCloseTo(40, 9);
    expect(b.freqs[b.k1]).toBeCloseTo(50, 9);
    expect(a.amp[190]).toBeCloseTo(b.amp[190], 12); // 47.5 Hz 바닥은 회전수와 무관
    expect(a.amp[190] / a.amp[80]).toBeGreaterThan(10); // 둔덕 ≫ 20 Hz 바닥
    expect(runningSpectrum(2850).oneX).toBeGreaterThan(b.oneX);
  });

  it('타격에 맞춘 평균: 1X는 줄고 타격 응답(47.5 Hz)은 남는다', () => {
    const r = bumpAverage({ seed: 9113 });
    expect(r.oneXAvg / r.oneXSingle).toBeLessThan(0.3);
    expect(r.avg[190]).toBeGreaterThan(0.08);
  });
});
