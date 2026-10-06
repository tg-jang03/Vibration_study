import { describe, expect, it } from 'vitest';
import { formatNumber } from '../lib/format';
import { buildMap, PRESETS } from '../lib/machine/frequencyMap';
import * as F from './p0-7';

const V = F.P07_VALUES;

describe('P0-7 본문·그림 숫자 (PageGuide §5-5)', () => {
  it('기어 15·60, 3000 rpm → 맞물림 750 Hz, 큰 기어 12.5 Hz / 날개 7장 3600 rpm → 420 Hz', () => {
    expect(V.gearMesh).toBe(750);
    expect(V.gearOut).toBeCloseTo(12.5, 12);
    expect(V.bladePass7).toBeCloseTo(420, 12);
  });

  it('6205 3000 rpm: FTF 19.9 Hz, BPFO 179.2 Hz, BPFI 270.8 Hz (예시 상자)', () => {
    expect(formatNumber(V.brg.ftf, 3)).toBe('19.9');
    expect(formatNumber(V.brg.bpfo, 4)).toBe('179.2');
    expect(formatNumber(V.brg.bpfi, 4)).toBe('270.8');
    expect(V.brg.bpfo + V.brg.bpfi).toBeCloseTo(450, 9);
    expect(formatNumber(V.brgX.bpfo, 4)).toBe('3.585');
    expect(formatNumber(V.brgX.bpfi, 4)).toBe('5.415');
  });

  it('벨트 구동 팬: 전동기 29.67 Hz, 벨트 11.65 Hz, 팬 14.83 Hz', () => {
    expect(formatNumber(V.fanMotorFr, 4)).toBe('29.67');
    expect(formatNumber(V.belt, 4)).toBe('11.65');
    expect(formatNumber(V.fanFr, 4)).toBe('14.83');
  });

  it('기동 지도: 날개 통과는 729 rpm, 2X는 2550 rpm에서 받침대 85 Hz를 지난다. 운전 3570 rpm의 2X = 119 Hz', () => {
    expect(formatNumber(V.crossBp, 3)).toBe('729');
    expect(V.cross2X).toBe(2550);
    expect((2 * V.pumpRpm) / 60).toBeCloseTo(119, 12);
  });

  it('랩 처음 상태(전동기-펌프 3570 rpm): 본문 해석의 BSF 140, BPFO 213, BPFI 322, 날개 417 Hz, 가장 높은 주파수 5000 Hz', () => {
    const p = PRESETS.motorPump;
    const map = buildMap('motorPump', { rpm: p.rpm, count: p.count, balls: p.balls ?? 9 });
    const brg = map.rows.find((r) => r.element === '구름베어링')!.lines;
    const f = (label: string) => brg.find((l) => l.label === label)!.f;
    expect(formatNumber(f('볼 자전 BSF'), 3)).toBe('140');
    expect(formatNumber(f('외륜 BPFO'), 3)).toBe('213');
    expect(formatNumber(f('내륜 BPFI'), 3)).toBe('322');
    expect(formatNumber(map.rows.find((r) => r.element === '펌프 날개')!.lines[0].f, 3)).toBe('417');
    expect(map.highest).toBe(5000);
  });

  it('그림 id가 겹치지 않는다', () => {
    const ids = Object.values(F).flatMap((v) => ('panels' in v ? [v.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(10);
  });
});
