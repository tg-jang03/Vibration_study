import { describe, expect, it } from 'vitest';
import { DEFAULT_ALARM, evaluateAlarms, scenarioSignal, type AlarmSettings, type ProtScenario } from './protection';

const run = (s: ProtScenario, o: Partial<AlarmSettings> = {}) => evaluateAlarms(scenarioSignal(s), { ...DEFAULT_ALARM, ...o });

describe('알람 논리 (LAB-ALM-01, 예시 Alert 90 · Danger 125 µm pp)', () => {
  it('0.3초 스파이크: 지연 0이면 1oo2로 20 s에 트립, 지연 1초면 알람도 트립도 없다', () => {
    expect(run('spike', { voting: '1oo2', delay: 0 }).tripTime).toBeCloseTo(20, 9);
    const r = run('spike', { voting: '1oo2', delay: 1 });
    expect(r.tripTime).toBeNull();
    expect(r.alertTime).toBeNull();
    expect(r.maxOverX).toBeCloseTo(0.3, 9);
  });

  it('두 채널이 함께 커지면 어떤 보팅이든 트립 (2oo2는 Y까지 기다려 약 2.6초 늦다)', () => {
    const one = run('growing', { voting: '1oo2' });
    const two = run('growing', { voting: '2oo2' });
    expect(one.tripTime).toBeCloseTo(37.15, 1);
    expect(two.tripTime).toBeCloseTo(39.75, 1);
    expect(one.alertTime).toBeLessThan(one.tripTime!);
  });

  it('Y 케이블이 끊겨 튀면: 1oo2는 16 s에 헛트립, 2oo2는 트립 없이 Alert만', () => {
    expect(run('faultyProbe', { voting: '1oo2' }).tripTime).toBeCloseTo(16, 9);
    const r = run('faultyProbe', { voting: '2oo2' });
    expect(r.tripTime).toBeNull();
    expect(r.alertTime).toBeCloseTo(16, 9);
  });

  it('X만 커지면(한 방향 진동): 1oo2는 트립, 2oo2는 놓친다', () => {
    expect(run('oneDirection', { voting: '1oo2' }).tripTime).toBeCloseTo(35.7, 1);
    expect(run('oneDirection', { voting: '2oo2' }).tripTime).toBeNull();
  });

  it('기동 중 임계속도 통과: 배율 없이 2oo2로 144.75 s에 트립, 기동 중 ×2를 켜면 트립 없음', () => {
    expect(run('runup').tripTime).toBeCloseTo(144.75, 2);
    const m = run('runup', { tripMultiply: true });
    expect(m.tripTime).toBeNull();
    expect(Math.max(...m.dangerLevel)).toBe(250);
    expect(m.dangerLevel[m.dangerLevel.length - 1]).toBe(125);
    // 배율 대신 지연을 늘려도 막을 수는 있다 (Y가 Danger를 3.25초만 넘으므로 3.5초) — 운전 중에도 늦어지는 대가
    const r = run('runup');
    expect(r.maxOverY).toBeCloseTo(3.25, 9);
    expect(run('runup', { delay: 3.5 }).tripTime).toBeNull();
  });

  it('트립은 한 번 서면 유지된다', () => {
    const r = run('spike', { voting: '1oo1', delay: 0 });
    const i = r.trip.indexOf(1);
    expect(i).toBeGreaterThan(0);
    expect(r.trip.slice(i).every((v) => v === 1)).toBe(true);
  });
});
