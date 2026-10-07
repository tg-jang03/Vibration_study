/** P1-9: 센서 한 위치의 선형 응답 합. 힘·결함 심각도를 추정하는 모델은 아니다. */
import { acquire } from '../dsp/sampling';
import { type SignalSpec } from '../dsp/signal';
import { singleSidedSpectrum } from '../dsp/spectrum';
import { buildMap, EXAMPLE } from './frequencyMap';

export type SourceId = 'oneX' | 'twoX' | 'blade' | 'ring' | 'noise';
export interface SourceSetting { enabled: boolean; amplitude: number }
export interface SourceParams {
  /** 회전 주파수 [Hz]. buildMap의 기존 rpm 인터페이스에만 환산해서 전달한다. */
  shaftHz: number;
  blades: number;
  sources: Record<SourceId, SourceSetting>;
  seed: number;
}
export const SOURCE_IDS: SourceId[] = ['oneX', 'twoX', 'blade', 'ring', 'noise'];
export const SOURCE_PHASES = { oneX: 0, twoX: Math.PI / 3, blade: -Math.PI / 4 };
export const RING_DECAY = 0.025;
export const RING_RATE = 10;
export const SOURCE_FS = 8192;
export const SOURCE_N = 8192;
export const DEFAULT_SOURCES: SourceParams = {
  shaftHz: 50, blades: 12, seed: 80,
  sources: {
    oneX: { enabled: true, amplitude: 40e-6 },
    twoX: { enabled: true, amplitude: 20e-6 },
    blade: { enabled: true, amplitude: 10e-6 },
    ring: { enabled: false, amplitude: 30e-6 },
    noise: { enabled: false, amplitude: 5e-6 },
  },
};

export function sourceFrequencies(shaftHz: number, blades: number) {
  if (!Number.isFinite(shaftHz) || shaftHz <= 0) throw new RangeError('shaftHz must be positive');
  if (!Number.isInteger(blades) || blades < 1) throw new RangeError('blades must be a positive integer');
  const map = buildMap('motorPump', { rpm: shaftHz * 60, count: blades, balls: 9 });
  const line = (name: string) => map.rows.flatMap((r) => r.lines).find((l) => l.label === name)!.f;
  return { oneX: line('1X'), twoX: line('2X'), blade: line('날개 통과'), ring: EXAMPLE.structureNatural };
}

/** 기존 시드 잡음·감쇠 충격 응답·FFT를 재사용한다. 숨기기는 UI만 바꾸며 계산은 같다. */
export function synthesizeSources(params: SourceParams) {
  const frequencies = sourceFrequencies(params.shaftHz, params.blades);
  // 최고 조작값 100 Hz × 24장 = 2400 Hz. 85 Hz 울림은 이상적 충격의 저주파 응답 예시.
  if (frequencies.blade >= SOURCE_FS / 2) throw new RangeError('blade frequency exceeds the display bandwidth');
  const parts = SOURCE_IDS.map((id) => {
    const setting = params.sources[id];
    if (!Number.isFinite(setting.amplitude) || setting.amplitude < 0) throw new RangeError('amplitude must be nonnegative');
    const amp = setting.enabled ? setting.amplitude : 0;
    const spec: SignalSpec = {
      components: id === 'noise' ? [{ type: 'noise', rms: amp, seed: params.seed }]
        : id === 'ring' ? [{ type: 'impulses', rate: RING_RATE, ringFreq: frequencies.ring, decay: RING_DECAY, amp }]
          : [{ type: 'sine', freq: frequencies[id], amp, phase: SOURCE_PHASES[id] }],
    };
    return { id, enabled: setting.enabled, ...acquire(spec, { fs: SOURCE_FS, n: SOURCE_N }) };
  });
  const t = parts[0].t;
  const x = new Float64Array(SOURCE_N);
  for (const part of parts) for (let i = 0; i < SOURCE_N; i++) x[i] += part.x[i];
  const spectrum = singleSidedSpectrum({ fs: SOURCE_FS, x }, { window: 'hann' });
  return { t, x, parts, frequencies, spectrum };
}
