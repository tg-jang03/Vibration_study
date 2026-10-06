import { describe, expect, it } from 'vitest';
import {
  accelToVelocityPower,
  ANALYZER,
  BIAS,
  clippedFundamental,
  FIX,
  G,
  GROUND_LOOP,
  MACHINE,
  measureChain,
  applyMountResponse,
  type ChainCase,
  type ChainResult,
} from './measurementChain';
import { sensorResponse } from './sensor';

const mm = (v: number) => v * 1e3;

/** 정상상태 정현파의 이득 (뒤쪽 절반의 RMS 비) */
function sineGain(f: number, fs: number, fn: number, zeta: number): number {
  const n = Math.round(fs * 1.0);
  const x = Float64Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * f * i) / fs));
  const y = applyMountResponse(x, fs, fn, zeta);
  let sx = 0;
  let sy = 0;
  for (let i = n / 2; i < n; i++) {
    sx += x[i] * x[i];
    sy += y[i] * y[i];
  }
  return Math.sqrt(sy / sx);
}

/** f 둘레 ±hw bin의 가속도 파워 평균의 제곱근 [g] */
const floorAt = (r: ChainResult, f: number, hw = 20) => {
  const k = Math.round(f / r.df);
  let s = 0;
  for (let j = k - hw; j <= k + hw; j++) s += r.accelPower[j];
  return Math.sqrt(s / (2 * hw + 1)) / G;
};
/** f 둘레 ±4 bin의 속도 대역 RMS [m/s] */
const velLine = (r: ChainResult, f: number) => {
  const k = Math.round(f / r.df);
  let s = 0;
  for (let j = k - 4; j <= k + 4; j++) s += r.velPower[j];
  return Math.sqrt(s / r.enbw);
};

describe('설치 응답 (가속도계 = 기초가진 1자유도, P3-1)', () => {
  it('DC 이득 1, f_n에서 이득 1/(2ζ) — 손으로 대기(2 kHz, ζ 0.1)면 5배', () => {
    expect(sineGain(5, 12800, 2000, 0.1)).toBeCloseTo(1, 2);
    expect(sineGain(2000, 12800, 2000, 0.1)).toBeCloseTo(5, 1);
  });

  it('공진 아래·위 모두 P3-1의 H(r)와 0.5 % 안에서 같다 (정확한 응답을 주파수 영역에서 곱한다)', () => {
    for (const f of [200, 1000, 1800, 2500, 4000]) {
      const ideal = sensorResponse('accelerometer', f, 2000, 0.1).ratio;
      expect(Math.abs(sineGain(f, 12800, 2000, 0.1) / ideal - 1)).toBeLessThan(0.005);
    }
    expect(() => applyMountResponse([1], 12800, 0, 0.1)).toThrow(RangeError);
  });
});

describe('가속도 → 속도 (÷ 2πf, P2-7)', () => {
  it('0.001 g rms는 1 Hz에서 1.561 mm/s, 100 Hz에서 0.01561 mm/s', () => {
    const a = 0.001 * G;
    const v = accelToVelocityPower([a * a, a * a, a * a], [0, 1, 100]);
    expect(v[0]).toBe(0);
    expect(mm(Math.sqrt(v[1]))).toBeCloseTo(1.561, 3);
    expect(mm(Math.sqrt(v[2]))).toBeCloseTo(0.01561, 5);
  });
});

describe('클리핑된 정현파의 기본파 (2A/π)(α + sinα cosα)', () => {
  it('A = 1을 ±0.5에서 자르면 0.609, 자르지 않으면 그대로', () => {
    expect(clippedFundamental(1, 0.5)).toBeCloseTo(0.609, 3);
    expect(clippedFundamental(2, 3)).toBe(2);
    // 수치 확인: 자른 정현파의 1차 푸리에 계수
    const n = 4096;
    let b1 = 0;
    for (let i = 0; i < n; i++) {
      const th = (2 * Math.PI * i) / n;
      b1 += Math.max(-0.5, Math.min(0.5, Math.sin(th))) * Math.sin(th);
    }
    expect((2 * b1) / n).toBeCloseTo(0.609, 3);
  });
});

describe('측정 체인 사례 (LAB-CHAIN-01, 예시 펌프 2970 rpm)', () => {
  const normal = measureChain('normal');

  it('정상 측정: 1X 1.80 mm/s, 전체(2 ~ 1000 Hz) 2.12 mm/s, 바이어스 11.6 V, 넘침 없음, 같은 입력 → 같은 결과', () => {
    expect(mm(normal.oneX)).toBeCloseTo(1.8, 1);
    expect(mm(normal.overall)).toBeCloseTo(2.12, 1);
    expect(normal.bias).toBe(BIAS.normal);
    expect(normal.overload).toBe(false);
    expect(normal.df).toBeCloseTo(ANALYZER.fs / ANALYZER.n, 9);
    expect(measureChain('normal').overall).toBe(normal.overall);
  });

  it('함정마다 정해진 확인 동작을 하면 정상 측정으로 돌아온다 (2 % 안)', () => {
    const kinds: ChainCase[] = ['mount', 'skiSlope', 'groundLoop', 'openCable', 'cable', 'clipping'];
    for (const k of kinds) {
      const fixed = measureChain(k, FIX[k]!);
      expect(Math.abs(fixed.overall / normal.overall - 1)).toBeLessThan(0.02);
      expect(fixed.overload).toBe(false);
      expect(fixed.bias).toBe(BIAS.normal);
    }
  });

  it('설치 공진: 손으로 대면 2 kHz 둘레 바닥이 5배, 스터드면 그대로', () => {
    const m = measureChain('mount');
    expect(floorAt(m, 2000) / floorAt(normal, 2000)).toBeCloseTo(5, 1);
    expect(floorAt(measureChain('mount', 'stud'), 2000) / floorAt(normal, 2000)).toBeCloseTo(1, 2);
  });

  it('ski-slope: 맨 아래 bin 속도가 정상의 10배 넘고 전체 값이 6 mm/s를 넘는다, 기다리면 사라진다', () => {
    const s = measureChain('skiSlope');
    expect(Math.sqrt(s.velPower[1] / normal.velPower[1])).toBeGreaterThan(10);
    expect(mm(s.overall)).toBeGreaterThan(6);
    expect(mm(s.oneX)).toBeCloseTo(1.8, 1);
  });

  it('그라운드 루프: 60 Hz에 0.552 mm/s rms, 회전수를 바꿔도 60 Hz에 남고 1X만 40 Hz로, 접지를 끊으면 사라진다', () => {
    const expected = (GROUND_LOOP[0].g * G) / Math.SQRT2 / (2 * Math.PI * 60);
    const gl = measureChain('groundLoop');
    expect(mm(velLine(gl, 60))).toBeCloseTo(mm(expected), 2);
    expect(mm(expected)).toBeCloseTo(0.552, 3);
    const moved = measureChain('groundLoop', 'rpm');
    expect(mm(velLine(moved, 60))).toBeCloseTo(mm(expected), 2);
    expect(mm(velLine(moved, MACHINE.altRpm / 60))).toBeCloseTo(1.8, 1);
    expect(mm(velLine(measureChain('groundLoop', 'isolate'), 60))).toBeLessThan(0.02);
  });

  it('케이블 끊김: 신호가 거의 0이고 바이어스가 공급 전압 쪽(23.8 V)', () => {
    const o = measureChain('openCable');
    expect(mm(o.oneX)).toBeLessThan(0.01);
    expect(o.bias).toBe(BIAS.open);
  });

  it('클리핑: ±0.25 g 레인지에서 넘침, 1X가 29 % 작아지고 하모닉이 생긴다', () => {
    const c = measureChain('clipping');
    expect(c.overload).toBe(true);
    expect(1 - c.oneX / normal.oneX).toBeCloseTo(0.29, 1);
    // 4X(198 Hz)는 원래 없는 성분
    expect(velLine(c, 4 * 49.5) / velLine(normal, 4 * 49.5)).toBeGreaterThan(10);
  });

  it('진짜 기계 진동: 확인 동작을 해도 1X 7.5 mm/s가 남고, 회전수를 바꾸면 따라 움직인다 (2400 rpm에서 4.90)', () => {
    for (const ck of ['stud', 'isolate', 'wait', 'tieCable', 'range'] as const) {
      expect(mm(measureChain('machine', ck).oneX)).toBeCloseTo(7.5, 1);
    }
    const r = measureChain('machine', 'rpm');
    expect(r.rpm).toBe(2400);
    expect(mm(r.oneX)).toBeCloseTo(4.9, 1);
  });
});
