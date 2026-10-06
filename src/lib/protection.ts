/**
 * 기계 보호 시스템의 알람 논리 (P3-5, LAB-ALM-01). 순수 함수.
 * 한 베어링의 X·Y 두 채널 진폭 [µm pp]이 시간에 따라 주어지면, Alert·Danger 두 단계 레벨, 시간 지연, 보팅,
 * 기동 중 트립 배율로 알람·트립이 언제 나는지 계산한다. 레벨·지연·배율은 설명용 예시값이다
 * (실제 값은 기계·제조사 권고와 규격을 따른다. 규격 수치는 옮기지 않는다, I-009).
 */
import { createRng } from './dsp/random';
import { runupResponse, runupRpm, runupTimeAt, RUNUP_END, RUNUP_ROTOR } from './transient';

/** 보팅: 1oo1 = X 하나만 본다, 1oo2 = 둘 중 하나라도, 2oo2 = 둘 다 */
export type Voting = '1oo1' | '1oo2' | '2oo2';

export interface AlarmSettings {
  /** Alert 레벨 [µm pp] */
  alert: number;
  /** Danger 레벨 [µm pp] */
  danger: number;
  /** 시간 지연 [s]: 레벨을 이만큼 계속 넘어야 알람이 선다 */
  delay: number;
  voting: Voting;
  /** 기동 중 트립 배율을 켰나 (켜면 기동 신호가 있는 동안 두 레벨에 multiplier를 곱한다) */
  tripMultiply: boolean;
  multiplier?: number;
}

export const DEFAULT_ALARM: AlarmSettings = { alert: 90, danger: 125, delay: 1, voting: '2oo2', tripMultiply: false, multiplier: 2 };

export type ProtScenario = 'spike' | 'growing' | 'faultyProbe' | 'oneDirection' | 'runup';

export interface ProtSignal {
  dt: number;
  t: Float64Array;
  /** 채널 X·Y 진폭 [µm pp] */
  x: Float64Array;
  y: Float64Array;
  /** 회전수 [rpm] */
  rpm: Float64Array;
  /** 기동 신호 (1이면 기동 중 → 트립 배율 대상) */
  startup: Uint8Array;
}

const ramp = (t: number, t0: number, t1: number, v0: number, v1: number) => (t <= t0 ? v0 : t >= t1 ? v1 : v0 + ((v1 - v0) * (t - t0)) / (t1 - t0));

/** 시나리오별 예시 신호. 기동 시나리오 외에는 3600 rpm 운전 중 60초 */
export function scenarioSignal(s: ProtScenario): ProtSignal {
  const runup = s === 'runup';
  const dt = runup ? 0.25 : 0.05;
  const tEnd = runup ? RUNUP_END : 60;
  const n = Math.round(tEnd / dt) + 1;
  const rng = createRng(52);
  const t = Float64Array.from({ length: n }, (_, i) => i * dt);
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const rpm = new Float64Array(n);
  const startup = new Uint8Array(n);
  const tStartupEnd = runupTimeAt(3500);
  for (let i = 0; i < n; i++) {
    const ti = t[i];
    const nx = 1.5 * rng.normal();
    const ny = 1.5 * rng.normal();
    rpm[i] = runup ? runupRpm(ti) : RUNUP_ROTOR.operatingRpm;
    startup[i] = runup && ti < tStartupEnd ? 1 : 0;
    switch (s) {
      case 'spike': // X 채널에 0.3초짜리 전기적 튐 (20 s)
        x[i] = 40 + nx + (ti >= 20 && ti < 20.3 ? 170 : 0);
        y[i] = 38 + ny;
        break;
      case 'growing': // 두 채널이 함께 서서히 커진다 (러브·불안정 같은 실제 이상)
        x[i] = ramp(ti, 10, 55, 40, 190) + nx;
        y[i] = ramp(ti, 10, 55, 40, 175) + ny;
        break;
      case 'faultyProbe': // Y 케이블이 가끔 끊겨 값이 튄다 (15 s 1.5초, 32 s 2초, 45 s 1.2초)
        x[i] = 40 + nx;
        y[i] = 38 + ny + ((ti >= 15 && ti < 16.5) || (ti >= 32 && ti < 34) || (ti >= 45 && ti < 46.2) ? 220 : 0);
        break;
      case 'oneDirection': // 한 방향으로만 커지는 진동 (직선 오빗, P3-3) — X만 커진다
        x[i] = ramp(ti, 10, 50, 40, 180) + nx;
        y[i] = ramp(ti, 10, 50, 50, 60) + ny;
        break;
      case 'runup': {
        // 기동: 임계속도(2000 rpm) 통과 때 두 채널이 함께 커진다
        const a = runupResponse(rpm[i]).amp * 1e6;
        x[i] = a + 0.3 * nx;
        y[i] = 0.95 * a + 0.3 * ny;
        break;
      }
    }
  }
  return { dt, t, x, y, rpm, startup };
}

export interface ProtResult {
  /** 실제로 쓰인 레벨 (배율 반영) */
  alertLevel: Float64Array;
  dangerLevel: Float64Array;
  /** 채널별: 지연을 채워 선 알람 */
  alertX: Uint8Array;
  alertY: Uint8Array;
  dangerX: Uint8Array;
  dangerY: Uint8Array;
  /** 트립 (한 번 서면 유지) */
  trip: Uint8Array;
  /** 처음 Alert가 선 시각 (어느 채널이든), 트립 시각 [s] — 없으면 null */
  alertTime: number | null;
  tripTime: number | null;
  /** Danger 레벨을 넘은 가장 긴 연속 시간 [s] (채널별) */
  maxOverX: number;
  maxOverY: number;
}

/** 레벨을 계속 넘은 시간이 delay 이상이면 1. 레벨 아래로 내려가면 타이머가 0으로 돌아간다 */
function delayed(v: Float64Array, level: Float64Array, dt: number, delay: number): { on: Uint8Array; maxOver: number } {
  const on = new Uint8Array(v.length);
  let timer = -1;
  let maxOver = 0;
  for (let i = 0; i < v.length; i++) {
    if (v[i] >= level[i]) {
      timer = timer < 0 ? 0 : timer + dt;
      maxOver = Math.max(maxOver, timer + dt);
      on[i] = timer >= delay - 1e-9 ? 1 : 0;
    } else {
      timer = -1;
    }
  }
  return { on, maxOver };
}

export function evaluateAlarms(sig: ProtSignal, st: AlarmSettings): ProtResult {
  const mult = st.multiplier ?? 2;
  const k = Float64Array.from(sig.startup, (s) => (st.tripMultiply && s ? mult : 1));
  const alertLevel = Float64Array.from(k, (m) => st.alert * m);
  const dangerLevel = Float64Array.from(k, (m) => st.danger * m);
  const ax = delayed(sig.x, alertLevel, sig.dt, st.delay);
  const ay = delayed(sig.y, alertLevel, sig.dt, st.delay);
  const dx = delayed(sig.x, dangerLevel, sig.dt, st.delay);
  const dy = delayed(sig.y, dangerLevel, sig.dt, st.delay);
  const trip = new Uint8Array(sig.t.length);
  let tripped = false;
  let tripTime: number | null = null;
  let alertTime: number | null = null;
  for (let i = 0; i < sig.t.length; i++) {
    const vote = st.voting === '1oo1' ? dx.on[i] === 1 : st.voting === '1oo2' ? dx.on[i] === 1 || dy.on[i] === 1 : dx.on[i] === 1 && dy.on[i] === 1;
    if (vote && !tripped) {
      tripped = true;
      tripTime = sig.t[i];
    }
    trip[i] = tripped ? 1 : 0;
    const alertNow = st.voting === '1oo1' ? ax.on[i] === 1 : ax.on[i] === 1 || ay.on[i] === 1;
    if (alertNow && alertTime === null) alertTime = sig.t[i];
  }
  return { alertLevel, dangerLevel, alertX: ax.on, alertY: ay.on, dangerX: dx.on, dangerY: dy.on, trip, alertTime, tripTime, maxOverX: dx.maxOver, maxOverY: dy.maxOver };
}
