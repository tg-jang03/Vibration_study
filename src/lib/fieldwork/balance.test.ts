import { describe, expect, it } from 'vitest';
import {
  angleOf,
  BAL_CASES,
  balance,
  cabs,
  cadd,
  fourRun,
  fourRunAmplitudes,
  influenceMatrix,
  permissibleUnbalance,
  polar,
  RUNOUT_UMPP,
  splitWeight,
  toUmPP,
  trialSizeStudy,
  weightCx,
  type CaseId,
} from './balance';

const base = { trialG: 30, trialDeg: 0, noise: 0, holes: 0, runoutUncomp: false } as const;

describe('각 관례와 영향계수 행렬', () => {
  it('A e^{−jφ}: 각은 회전 반대 방향, 곱하면 각이 더해진다', () => {
    const z = polar(2, 30);
    expect(angleOf(z)).toBeCloseTo(30, 9);
    const w = polar(3, 100);
    const prod = { re: z.re * w.re - z.im * w.im, im: z.re * w.im + z.im * w.re };
    expect(angleOf(prod)).toBeCloseTo(130, 9);
    expect(cabs(prod)).toBeCloseTo(6, 9);
  });

  it('대칭 로터: A11 = A22, A12 = A21. 저속에서 각 → 0, 두 모드 위에서는 180° 쪽', () => {
    const A = influenceMatrix(3000);
    expect(cabs(A[0][0])).toBeCloseTo(cabs(A[1][1]), 12);
    expect(cabs(A[0][1])).toBeCloseTo(cabs(A[1][0]), 12);
    expect(angleOf(influenceMatrix(300)[0][0])).toBeLessThan(1);
    const hi = angleOf(influenceMatrix(12000)[0][0]);
    expect(hi).toBeGreaterThan(160);
    expect(hi).toBeLessThan(200);
  });
});

describe('영향계수법', () => {
  it('잡음 없으면 2면 보정은 숨은 불평형을 정확히 지운다 (세 사례)', () => {
    for (const caseId of Object.keys(BAL_CASES) as CaseId[]) {
      const r = balance({ method: 2, caseId, ...base });
      r.correction.forEach((w, p) => {
        expect(w.g).toBeCloseTo(r.exact[p].g, 6);
        expect(w.deg).toBeCloseTo(r.exact[p].deg, 6);
      });
      expect(toUmPP(cabs(r.afterTrue[0]))).toBeLessThan(1e-9);
      expect(toUmPP(cabs(r.afterTrue[1]))).toBeLessThan(1e-9);
    }
  });

  it('1면은 베어링 1만 0으로 만든다 — 커플 위주면 베어링 2가 거의 그대로', () => {
    const r = balance({ method: 1, caseId: 'couple', ...base });
    const before = toUmPP(cabs(r.runs[0].meas[1]));
    expect(toUmPP(cabs(r.afterTrue[0]))).toBeLessThan(1e-9);
    expect(toUmPP(cabs(r.afterTrue[1])) / before).toBeGreaterThan(0.85);
  });

  it('시험추 크기·각과 무관하게 같은 보정추 (선형)', () => {
    const a = balance({ method: 1, caseId: 'static', ...base, trialG: 10, trialDeg: 90 });
    const b = balance({ method: 1, caseId: 'static', ...base, trialG: 120, trialDeg: 270 });
    expect(a.correction[0].g).toBeCloseTo(b.correction[0].g, 6);
    expect(a.correction[0].deg).toBeCloseTo(b.correction[0].deg, 6);
  });

  it('분할추: 이웃 두 구멍의 벡터 합 = 원래 추, 보정 결과도 같다', () => {
    const w = { g: 50, deg: 47 };
    const parts = splitWeight(w, 12);
    expect(parts.map((p) => p.deg)).toEqual([30, 60]);
    const sum = parts.reduce((acc, p) => cadd(acc, weightCx(p)), { re: 0, im: 0 });
    expect(cabs(sum)).toBeCloseTo(cabs(weightCx(w)), 12);
    expect(angleOf(sum)).toBeCloseTo(47, 9);
    const r = balance({ method: 2, caseId: 'dynamic', ...base, holes: 12 });
    expect(toUmPP(cabs(r.afterTrue[0]))).toBeLessThan(1e-9);
  });

  it('slow roll 보상 없이 맞추면 센서는 0을 읽지만 실제 축은 −런아웃만큼 흔들린다', () => {
    const r = balance({ method: 2, caseId: 'static', ...base, runoutUncomp: true });
    expect(toUmPP(cabs(r.afterMeas[0]))).toBeLessThan(1e-9);
    [0, 1].forEach((j) => {
      expect(toUmPP(cabs(r.afterTrue[j]))).toBeCloseTo(RUNOUT_UMPP[j].g, 9);
      expect(angleOf(r.afterTrue[j])).toBeCloseTo((RUNOUT_UMPP[j].deg + 180) % 360, 6);
    });
  });
});

describe('4-run법과 시험추 크기', () => {
  it('진폭 네 개만으로 영향계수법과 같은 보정추를 찾는다', () => {
    const { A0, A } = fourRunAmplitudes('static', 30);
    const f = fourRun(A0, A, 30);
    const r = balance({ method: 1, caseId: 'static', ...base });
    expect(f.correction.g).toBeCloseTo(r.correction[0].g, 6);
    expect(f.correction.deg).toBeCloseTo(r.correction[0].deg, 6);
    // 시험추 효과 T = |H| × 30 g
    expect(f.T).toBeCloseTo(toUmPP(cabs(r.H!)) * 0.03 * 0.2, 6);
  });

  it('흔들림이 같으면 시험추가 작을수록 보정 뒤 남는 진동이 크다', () => {
    const s = trialSizeStudy([5, 30, 120], { repeats: 60 });
    expect(s[0].median).toBeGreaterThan(s[1].median);
    expect(s[1].median).toBeGreaterThan(s[2].median);
  });
});

describe('밸런스 등급 (개념)', () => {
  it('e_per = G/Ω: G 2.5 mm/s · 3000 rpm → 7.96 µm, 800 kg → 6366 g·mm', () => {
    const p = permissibleUnbalance(2.5, 3000, 800);
    expect(p.ePerUm).toBeCloseTo(7.9577, 4);
    expect(p.uPerGmm).toBeCloseTo(6366.2, 1);
  });
});
