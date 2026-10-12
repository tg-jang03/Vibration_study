import { describe, expect, it } from 'vitest';
import { CASES, CASE_BY_ID, type CaseSettings } from './cases';
import { ALL_DIAGS, grade } from './diagnoses';
import * as E from './engine';

/** 케이스 c의 설정 s(보고된 설정 + 바꾼 것)로 잰 스펙트럼 */
function measure(id: string, set: Partial<CaseSettings> = {}) {
  const c = CASE_BY_ID[id];
  const s = { ...c.settings, ...set };
  const acq = E.acquire(c.id, c.machine, c.sources, s);
  const unit = set.unit ?? (E.isProbe(s.sensor) ? 'disp' : c.settings.unit);
  return { c, s, acq, unit, sp: E.caseSpectrum(acq, unit, s.fMax), overall: E.overall(acq, unit, s.fMax) };
}
const near = (m: ReturnType<typeof measure>, f: number, tol = 1) => E.peakNear(m.sp.freq, m.sp.amp, f, tol);
/** f 둘레 ± skip을 뺀 나머지에서 가장 큰 줄 */
function largestExcept(m: ReturnType<typeof measure>, skip: number[], half: number, fMin = 5) {
  let a = 0;
  for (let k = 0; k < m.sp.freq.length; k++) {
    const f = m.sp.freq[k];
    if (f < fMin || skip.some((s) => Math.abs(f - s) <= half)) continue;
    a = Math.max(a, m.sp.amp[k]);
  }
  return a;
}

describe('케이스 목록', () => {
  it('11개, 정답은 진단 보기 안에 있고 증거 자료는 모든 기계에서 열린다', () => {
    expect(CASES).toHaveLength(11);
    for (const c of CASES) {
      for (const t of [...c.truth, ...(c.alsoOk ?? [])]) expect(ALL_DIAGS).toContain(t);
      for (const t of Object.keys(c.traps)) expect(ALL_DIAGS).toContain(t);
      expect(c.evidence.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('채점: 맞힘·놓침·틀림', () => {
    expect(grade(['misalignment', 'bearingInner'], ['misalignment'])).toMatchObject({ hit: ['misalignment'], missed: ['bearingInner'], wrong: [], exact: false });
    expect(grade(['oilWhip'], ['oilWhip'])).toMatchObject({ exact: true });
  });
});

describe('모든 케이스 × 센서 × 자료가 유한한 값을 낸다 (랩 화면의 계산)', () => {
  for (const c of CASES) {
    it(c.id, () => {
      const sensors: E.Sensor[] = c.machine.probes ? ['H', 'V', 'A', 'X', 'Y'] : ['H', 'V', 'A'];
      const finite = (xs: ArrayLike<number>) => Array.from(xs).every(Number.isFinite);
      for (const sensor of sensors) {
        for (const fMax of [200, 5000]) {
          const st = { ...c.settings, sensor, fMax, lines: 800 };
          const acq = E.acquire(c.id, c.machine, c.sources, st);
          const unit = E.isProbe(sensor) ? 'disp' : 'vel';
          expect(finite(E.caseSpectrum(acq, unit, fMax).amp)).toBe(true);
          expect(Number.isFinite(E.overall(acq, unit, fMax))).toBe(true);
          expect(Number.isFinite(E.caseWaveform(acq, unit, 0.2).kurt)).toBe(true);
          for (const b of E.ENV_BANDS) {
            const e = E.isProbe(sensor) ? null : E.caseEnvelope(acq, b, 500, fMax, true);
            if (e) expect(finite(e.amp)).toBe(true);
          }
        }
        const cd = E.coastdown(c.machine, c.sources, sensor);
        expect(finite(cd.raw.map((p) => p.amp))).toBe(true);
        expect(E.cascade(c.machine, c.sources, sensor, 1000).z.every(finite)).toBe(true);
        const tr = E.trend(c.machine, c.sources, sensor);
        expect(finite(tr.hourly.map((p) => p.amp))).toBe(true);
        const tt = E.tripTest(c.machine, c.sources, sensor);
        if (tt) for (const s of tt.series) expect(finite(s.y)).toBe(true);
      }
      expect(finite(E.impactFrf(c.machine, 500).H)).toBe(true);
      const o = E.orbit(c.machine, c.sources);
      if (o) expect(finite(o.direct.x)).toBe(true);
      expect(E.tripTest(c.machine, c.sources, 'H') === null).toBe(c.machine.drive === 'turbine');
    });
  }
});

describe('엔진 기본 성질', () => {
  it('AAF: f_max까지 평탄, 1.56 f_max에서 −70 dB 아래', () => {
    expect(E.aafGain(1000, 1000)).toBeGreaterThan(0.99);
    expect(20 * Math.log10(E.aafGain(1560, 1000))).toBeLessThan(-70);
  });
  it('측정 설정: f_s = 2.56 f_max, Δf = f_max / 라인', () => {
    expect(E.acquisition({ fMax: 1000, lines: 800 })).toMatchObject({ fs: 2560, n: 2048, df: 1.25, T: 0.8 });
  });
  it('같은 케이스·같은 설정이면 같은 신호 (시드 고정)', () => {
    const a = measure('c02', { lines: 400 });
    const c = CASE_BY_ID.c02;
    const b = E.acquire('again', c.machine, c.sources, a.s);
    expect(Array.from(b.x.slice(0, 50))).toEqual(Array.from(a.acq.x.slice(0, 50)));
  });
});

describe('c01 불평형', () => {
  const pt = E.phaseTable(CASE_BY_ID.c01.machine, CASE_BY_ID.c01.sources, 1);
  it('1X 위상 표', () => {
    expect(pt.here.H.amp).toBeCloseTo(5.2, 2);
    expect(pt.here.V.amp).toBeCloseTo(4.3, 2);
    expect(E.wrap360(pt.here.V.lag - pt.here.H.lag)).toBeCloseTo(88, 0);
    expect(E.wrap360(pt.there.H.lag - pt.here.H.lag)).toBeCloseTo(15, 0);
    expect(E.wrap360(pt.there.V.lag - pt.here.V.lag)).toBeCloseTo(12, 0);
  });
  it('보고값 overall과 1X 밖의 줄', () => {
    const m = measure('c01');
    expect(m.overall).toBeGreaterThan(5.1);
    expect(m.overall).toBeLessThan(5.3);
    expect(largestExcept(m, [29.75], 3)).toBeLessThan(0.4);
  });
  it('30일 추세 2.5 → 5.2', () => {
    const tr = E.trend(CASE_BY_ID.c01.machine, CASE_BY_ID.c01.sources, 'H');
    expect(tr.daily[0].amp).toBeGreaterThan(2.45);
    expect(tr.daily[0].amp).toBeLessThan(2.75);
    expect(tr.daily.at(-1)!.amp).toBeCloseTo(5.2, 2);
  });
});

describe('c02 외륜 결함', () => {
  it('속도 스펙트럼 1 kHz: 1X 0.84, 7X 0.42, BPFO 바닥', () => {
    const m = measure('c02');
    expect(m.overall).toBeGreaterThan(0.95);
    expect(m.overall).toBeLessThan(1.05);
    expect(near(m, 59.58, 1).a).toBeCloseTo(0.84, 1);
    expect(near(m, 417.1, 1).a).toBeCloseTo(0.42, 1);
    expect(near(m, 213.6, 1).a).toBeLessThan(0.05);
  });
  it('엔벨로프 2.5 ~ 4.5 kHz: BPFO가 가장 큰 줄, 1 kHz에서는 대역을 고를 수 없다', () => {
    const m = measure('c02', { fMax: 5000, lines: 1600 });
    const e = E.caseEnvelope(m.acq, E.ENV_BANDS[2], 1000, 5000, true)!;
    const top = E.peakNear(e.freq, e.amp, 213.6, 1.6);
    let max = 0;
    for (let k = 0; k < e.freq.length; k++) if (e.freq[k] > 5) max = Math.max(max, e.amp[k]);
    expect(top.a).toBe(max);
    expect(top.f).toBeCloseTo(212.5, 1);
    expect(E.caseEnvelope(measure('c02').acq, E.ENV_BANDS[2], 1000, 1000, true)).toBeNull();
    const w = E.caseWaveform(m.acq, 'acc', 0.1);
    expect(w.kurt).toBeGreaterThan(5);
    expect(w.kurt).toBeLessThan(6);
  });
});

describe('c03 깨진 이', () => {
  it('GMF 둘레 출력축 간격 측대역 7쌍', () => {
    const m = measure('c03');
    const fo = (24.75 * 23) / 61;
    expect(fo).toBeCloseTo(9.332, 3);
    for (let j = 1; j <= 7; j++) {
      expect(near(m, 569.25 + j * fo, 0.7).a).toBeGreaterThan(0.1);
      expect(near(m, 569.25 - j * fo, 0.7).a).toBeGreaterThan(0.1);
    }
  });
  it('엔벨로프 1 ~ 2.5 kHz의 가장 큰 줄 = 출력축', () => {
    const m = measure('c03', { fMax: 5000, lines: 3200 });
    const e = E.caseEnvelope(m.acq, E.ENV_BANDS[1], 200, 5000, true)!;
    let best = { f: 0, a: 0 };
    for (let k = 0; k < e.freq.length; k++) if (e.freq[k] > 3 && e.amp[k] > best.a) best = { f: e.freq[k], a: e.amp[k] };
    expect(best.f).toBeCloseTo(9.38, 1);
  });
});

describe('c04 오일 휩', () => {
  const c = CASE_BY_ID.c04;
  it('프로브 스펙트럼: 70 Hz 52 µm, 1X 19 µm', () => {
    const m = measure('c04');
    expect(near(m, 70, 0.7).a).toBeCloseTo(52, 0);
    expect(near(m, 175, 0.7).a).toBeCloseTo(19, 0);
    expect(m.overall).toBeCloseTo(72, -0.5);
  });
  it('휠 시작 6,600 rpm, 잠김 9,333 rpm', () => {
    const w = c.sources.find((s) => s.kind === 'whirl') as E.WhirlSource;
    expect(E.whirlState(c.machine, w, 6500).k).toBe(0);
    expect(E.whirlState(c.machine, w, 9300).locked).toBe(false);
    expect(E.whirlState(c.machine, w, 9340).locked).toBe(true);
  });
  it('코스트다운 1X 봉우리 약 4,300 rpm', () => {
    const cd = E.coastdown(c.machine, c.sources, 'X');
    const i = cd.raw.reduce((b, p, k) => (p.amp > cd.raw[b].amp ? k : b), 0);
    expect(cd.rpm[i]).toBeGreaterThan(4150);
    expect(cd.rpm[i]).toBeLessThan(4450);
  });
});

describe('c05 구조 공진', () => {
  const c = CASE_BY_ID.c05;
  it('1X 위상 표: H 9.7 · V 1.5, V−H 299°', () => {
    const pt = E.phaseTable(c.machine, c.sources, 1);
    expect(pt.here.H.amp).toBeCloseTo(9.7, 1);
    expect(pt.here.V.amp).toBeCloseTo(1.48, 1);
    expect(E.wrap360(pt.here.V.lag - pt.here.H.lag)).toBeCloseTo(299, 0);
  });
  it('코스트다운 H 봉우리 1,710 rpm 18.8 mm/s, 위상 28° → 184°', () => {
    const cd = E.coastdown(c.machine, c.sources, 'H');
    const i = cd.raw.reduce((b, p, k) => (p.amp > cd.raw[b].amp ? k : b), 0);
    expect(cd.rpm[i]).toBeCloseTo(1708, -1);
    expect(cd.raw[i].amp).toBeCloseTo(18.8, 1);
    expect(cd.raw[5].lag).toBeCloseTo(28, 0);
    expect(cd.raw.at(-1)!.lag).toBeCloseTo(184, 0);
  });
  it('임팩트 FRF: H 28.3 Hz, V 75 Hz', () => {
    const fr = E.impactFrf(c.machine, 200);
    const argmax = (a: Float64Array, lo: number, hi: number) => {
      let b = -1;
      for (let k = 0; k < a.length; k++) if (fr.freq[k] >= lo && fr.freq[k] <= hi && (b < 0 || a[k] > a[b])) b = k;
      return fr.freq[b];
    };
    expect(argmax(fr.H, 10, 60)).toBeCloseTo(28.3, 0);
    expect(argmax(fr.V, 10, 120)).toBeCloseTo(75, 0);
  });
});

describe('c06 발전기 2×LF', () => {
  const c = CASE_BY_ID.c06;
  it('프레임 120 Hz 3.9, 프로브 120 Hz 4.5 µm', () => {
    expect(near(measure('c06'), 120, 0.4).a).toBeCloseTo(3.87, 1);
    expect(near(measure('c06', { sensor: 'X', unit: 'disp' }), 120, 0.4).a).toBeCloseTo(4.52, 1);
  });
  it('계자 차단: 0.5 s 2.2, 2 s 0.58, 남는 0.3 · 1X 그대로', () => {
    const tr = E.tripTest(c.machine, c.sources, 'V')!;
    const s120 = tr.series.find((s) => Math.abs(s.f0 - 120) < 0.01)!;
    const at = (t: number) => s120.y[tr.t.findIndex((v) => Math.abs(v - t) < 1e-6)];
    expect(at(0.5)).toBeCloseTo(2.2, 1);
    expect(at(2)).toBeCloseTo(0.58, 2);
    expect(s120.y.at(-1)!).toBeCloseTo(0.3, 2);
    const s60 = tr.series.find((s) => Math.abs(s.f0 - 60) < 0.01)!;
    expect(s60.y.at(-1)).toBeCloseTo(s60.y[0], 6);
  });
});

describe('c07 Morton', () => {
  const c = CASE_BY_ID.c07;
  it('12시간 1X: 12 ~ 46 µm, 2X 1.9 µm', () => {
    const tr = E.trend(c.machine, c.sources, 'X');
    const amps = tr.hourly.map((p) => p.amp);
    expect(Math.min(...amps)).toBeGreaterThan(11);
    expect(Math.min(...amps)).toBeLessThan(14);
    expect(Math.max(...amps)).toBeGreaterThan(44);
    expect(Math.max(...amps)).toBeLessThan(48);
    expect(near(measure('c07'), 373.3, 0.7).a).toBeCloseTo(1.9, 0);
  });
});

describe('c08 미스얼라인 + 내륜', () => {
  const c = CASE_BY_ID.c08;
  it('축방향 1X 4.1 · 2X 3.8, 건너편 179° · 182°, 3X 0.9', () => {
    const p1 = E.phaseTable(c.machine, c.sources, 1);
    const p2 = E.phaseTable(c.machine, c.sources, 2);
    expect(p1.here.A.amp).toBeCloseTo(4.06, 1);
    expect(p2.here.A.amp).toBeCloseTo(3.8, 2);
    expect(E.wrap360(p1.there.A.lag - p1.here.A.lag)).toBeCloseTo(179, 0);
    expect(E.wrap360(p2.there.A.lag - p2.here.A.lag)).toBeCloseTo(182, 0);
    expect(measure('c08').overall).toBeCloseTo(5.6, 0);
  });
  it('엔벨로프: BPFI 160.9 가장 큼, 측대역 131.3 · 190.6', () => {
    const m = measure('c08', { sensor: 'V', fMax: 5000, lines: 3200 });
    const e = E.caseEnvelope(m.acq, E.ENV_BANDS[2], 500, 5000, true)!;
    let best = { f: 0, a: 0 };
    for (let k = 0; k < e.freq.length; k++) if (e.freq[k] > 3 && e.amp[k] > best.a) best = { f: e.freq[k], a: e.amp[k] };
    expect(best.f).toBeCloseTo(160.9, 0);
    expect(E.peakNear(e.freq, e.amp, 131.3, 1).a).toBeGreaterThan(0.05);
    expect(E.peakNear(e.freq, e.amp, 190.6, 1).a).toBeGreaterThan(0.05);
  });
});

describe('c09 2X + 2×LF', () => {
  const c = CASE_BY_ID.c09;
  it('400 라인은 한 줄, 1600 라인(200 Hz)은 119.33 · 120.00 두 줄', () => {
    const coarse = measure('c09');
    expect(coarse.acq.df).toBe(2.5);
    const fine = measure('c09', { fMax: 200, lines: 1600 });
    expect(near(fine, 119.333, 0.07).a).toBeCloseTo(1.3, 1);
    expect(near(fine, 120, 0.07).a).toBeCloseTo(2.7, 1);
    const ax = measure('c09', { sensor: 'A', fMax: 200, lines: 1600 });
    expect(near(ax, 119.333, 0.07).a).toBeCloseTo(2.7, 1);
    expect(near(ax, 120, 0.07).a).toBeCloseTo(0.35, 1);
    expect(near(coarse, 120, 2).a).toBeCloseTo(2.2, 1);
  });
  it('2X 건너편 176 · 182 · 178°, 전원 차단 0.1 s 0.37', () => {
    const p2 = E.phaseTable(c.machine, c.sources, 2);
    expect(E.wrap360(p2.there.H.lag - p2.here.H.lag)).toBeCloseTo(176, 0);
    expect(E.wrap360(p2.there.V.lag - p2.here.V.lag)).toBeCloseTo(182, 0);
    expect(E.wrap360(p2.there.A.lag - p2.here.A.lag)).toBeCloseTo(178, 0);
    const tr = E.tripTest(c.machine, c.sources, 'V')!;
    const s = tr.series.find((q) => Math.abs(q.f0 - 120) < 0.01)!;
    expect(s.y[tr.t.findIndex((v) => Math.abs(v - 0.1) < 1e-6)]).toBeCloseTo(0.37, 1);
    const p1 = E.phaseTable(c.machine, c.sources, 1);
    expect(p1.here.H.amp).toBeCloseTo(1.8, 0);
  });
});

describe('c10 런아웃', () => {
  const c = CASE_BY_ID.c10;
  it('slow roll 30 µm∠115°, 보상 뒤 운전점 15 µm · 봉우리 44 µm (3,857 rpm)', () => {
    const cd = E.coastdown(c.machine, c.sources, 'X');
    expect(cd.slowRoll.rpm).toBe(490);
    expect(cd.slowRoll.amp).toBeCloseTo(30, 0);
    expect(cd.slowRoll.lag).toBeCloseTo(115, 0);
    expect(cd.compensated.at(-1)!.amp).toBeCloseTo(15, 0);
    const i = cd.compensated.reduce((b, p, k) => (p.amp > cd.compensated[b].amp ? k : b), 0);
    expect(cd.compensated[i].amp).toBeCloseTo(43.6, 0);
    expect(cd.rpm[i]).toBeCloseTo(3857, -1);
  });
  it('감시 채널 38 µm p-p, 하우징 0.86 · 1X 0.79 mm/s', () => {
    const x = measure('c10');
    expect(x.overall).toBeCloseTo(38, -0.5);
    expect(near(x, 326.67, 0.7).a).toBeCloseTo(9, 0);
    expect(near(x, 490, 0.7).a).toBeCloseTo(5, 0);
    const h = measure('c10', { sensor: 'H', unit: 'vel' });
    expect(h.overall).toBeCloseTo(0.86, 1);
    expect(near(h, 163.3, 0.7).a).toBeCloseTo(0.79, 1);
  });
});

describe('c11 에일리어싱', () => {
  it('AAF 끔: 357.5 Hz 6.6 mm/s, AAF 켬: 사라짐, 200 Hz: 154.75 Hz, 5 kHz: GMF 2202.75 Hz 1.06', () => {
    const off = measure('c11');
    expect(near(off, 357.25, 0.7).a).toBeCloseTo(6.6, 1);
    expect(357.25 / 24.75).toBeCloseTo(14.43, 2);
    expect(near(measure('c11', { aaf: true }), 357.25, 2).a).toBeLessThan(0.05);
    const low = measure('c11', { fMax: 200 });
    expect(near(low, 154.75, 0.3).a).toBeGreaterThan(10);
    const hi = measure('c11', { fMax: 5000, lines: 3200, aaf: true });
    expect(near(hi, 2202.75, 1).a).toBeCloseTo(1.06, 1);
    expect(2560 - 89 * 24.75).toBeCloseTo(357.25, 6);
  });
});
