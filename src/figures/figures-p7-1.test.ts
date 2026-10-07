import { describe, expect, it } from 'vitest';
import { formatNumber as f } from '../lib/format';
import { envelopeSpectrum, spectrumOf } from '../lib/dsp/envelope';
import { kurtosis } from '../lib/dsp/stats';
import { candidatesAt } from '../lib/faults/catalog';
import { syncRpm } from '../lib/faults/rpm';
import { MACHINES, peakAt, synthesize, topLine, velocitySpectrum } from '../lib/faults/synth';
import * as F from './p7-1';

const V = F.P71_VALUES;
const get = (b: typeof V.unb, d: 'H' | 'V' | 'A', k: number) => b.find((x) => x.d === d && x.k === k)!.v;

describe('P7-1 본문·그림·랩 해석 숫자 (PageGuide §5-5)', () => {
  it('펌프 3575 rpm: 1X 59.58 Hz, BPFO 3.585X (213.6 Hz), 2×LF는 2.014X, 2X와 0.83 Hz 차이, 베인 7X 417.1 Hz', () => {
    expect(f(V.fr, 4)).toBe('59.58');
    expect(f(V.brg.bpfo / V.fr, 4)).toBe('3.585');
    expect(f(V.brg.bpfo, 4)).toBe('213.6');
    expect(f(120 / V.fr, 4)).toBe('2.014');
    expect(f(120 - 2 * V.fr, 2)).toBe('0.83');
    expect(f(7 * V.fr, 4)).toBe('417.1');
  });

  it('그림 2: 불평형 H 4.91 · V 3.53 · A 0.49 mm/s, 90° / 정렬 불량 A 1X 3.10 · A 2X 2.57, 위상차 26°', () => {
    expect([f(get(V.unb, 'H', 1), 3), f(get(V.unb, 'V', 1), 3), f(get(V.unb, 'A', 1), 2)]).toEqual(['4.91', '3.53', '0.49']);
    expect(Math.round(V.unbLag)).toBe(90);
    expect([f(get(V.mis, 'A', 1), 3), f(get(V.mis, 'A', 2), 3)]).toEqual(['3.1', '2.57']);
    expect(Math.round(V.misLag)).toBe(26);
  });

  it('그림 3: 2초 기록 2X 0.96 · 2×LF 1.27 mm/s, 0.5초 기록은 합쳐 2.25', () => {
    expect([f(V.twoX, 2), f(V.twoLF, 3), f(V.merged, 3)]).toEqual(['0.96', '1.27', '2.25']);
  });

  it('그림 4: 풀림 ½X ≈ 1 mm/s(0.98), 외륜 엔벨로프 BPFO 0.41 g', () => {
    expect(f(V.looseHalf, 2)).toBe('0.98');
    expect(f(V.outerEnvG, 2)).toBe('0.41');
  });

  it('회전수 표: 펌프 3573/1792/3576, 감속기 1492/1490/1558, 풀림 팬 590/590/1180 rpm', () => {
    const rpm = (id: 'pump' | 'gearbox' | 'fan') => (['harmonic', 'cepstrum', 'autocorr'] as const).map((m) => Math.round(V.rpm[id].est[m].fr * 60));
    expect(rpm('pump')).toEqual([3573, 1792, 3576]);
    expect(rpm('gearbox')).toEqual([1492, 1490, 1558]);
    expect(rpm('fan')).toEqual([590, 590, 1180]);
  });

  it('역산: 571.2 Hz ÷ 23 = 1490 rpm, 417.1 ÷ 7 = 3575 rpm, 2극 60 Hz 3600 rpm, 출력 561.8 rpm', () => {
    const g = MACHINES.gearbox;
    expect(f((g.teeth * g.rpm) / 60, 4)).toBe('571.2');
    expect(syncRpm(60, 2)).toBe(3600);
    expect(f((g.rpm * g.teeth) / g.mateTeeth, 4)).toBe('561.8');
    expect(f(3560 / 60, 4)).toBe('59.33');
  });

  it('랩 지도 과제: 120 Hz → 전기 먼저 + 2X 후보 4, 59.6 Hz → 1X 후보 7, 압축기 43 Hz → 오일 휠·휩·stall', () => {
    const p = MACHINES.pump;
    const info = { fr: p.rpm / 60, lineHz: 60, blades: 7, teeth: 0, balls: 9, poles: 2 };
    const c120 = candidatesAt(120, info);
    expect(c120[0].fault.id).toBe('electrical2LF');
    expect(c120.slice(1).map((c) => c.fault.id).sort()).toEqual(['crack', 'looseness', 'misalignment', 'rub']);
    expect(candidatesAt(120, info, 'fixed').map((c) => c.fault.id)).toEqual(['electrical2LF']);
    expect(candidatesAt(59.6, info)).toHaveLength(7);
    const cmp = MACHINES.compressor;
    const c43 = candidatesAt(43, { fr: cmp.rpm / 60, lineHz: 60, blades: cmp.blades, teeth: 0, balls: 0, poles: 0 }).map((c) => c.fault.id).sort();
    expect(c43).toEqual(['oilWhip', 'oilWhirl', 'rotatingStall']);
  });

  it('랩 합성기 과제: 풀림 V 가속도 첨도 약 10, 외륜 V 속도 BPFO 0.5 mm/s쯤 · 엔벨로프 최대 줄 = BPFO', () => {
    const p = MACHINES.pump;
    const loose = synthesize(p, { looseness: 0.6 });
    expect(Math.round(kurtosis(loose.acc.V))).toBe(10);
    const outer = synthesize(p, { bearingOuter: 0.6 });
    const v = velocitySpectrum(outer.acc.V, outer.fs, 1000);
    expect(f(peakAt(v.freq, v.amp, V.brg.bpfo), 1)).toBe('0.5');
    const env = envelopeSpectrum(spectrumOf(outer.acc.V), outer.fs, 2800, 3800, 1000);
    const top = topLine(env.freq, env.amp);
    expect(Math.abs(top.f - V.brg.bpfo)).toBeLessThan(1);
    expect(top.ratio).toBeGreaterThan(20);
    // 충격이 없는 불평형: 가장 큰 줄은 바닥 잡음 (바닥의 몇 배 안)
    const unb = synthesize(p, { unbalance: 0.6 });
    const envU = envelopeSpectrum(spectrumOf(unb.acc.H), unb.fs, 2800, 3800, 1000);
    expect(topLine(envU.freq, envU.amp).ratio).toBeLessThan(5);
  });
});
