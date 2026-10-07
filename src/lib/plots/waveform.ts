/** P6-1 / LAB-TWF-01 판독용 가상 변위. 내부 SI(m), 일정 회전수, 시드 고정. */
import { createRng } from '../dsp/random';
import { rms, crestFactor, skewness } from '../dsp/stats';

export const WAVE_PATTERNS = ['sine', 'beat', 'am', 'impacts', 'truncated', 'clipped', 'asymmetric'] as const;
export type WavePattern = typeof WAVE_PATTERNS[number];
export const WAVE_LABELS: Record<WavePattern, string> = {
  sine: '정현파', beat: '맥놀이', am: '진폭 변조 (AM)', impacts: '반복 충격 울림',
  truncated: '한쪽 절단', clipped: '양쪽 클리핑', asymmetric: '위아래 비대칭',
};
export const WAVE_CLUES: Record<WavePattern, string> = {
  sine: '한 바퀴마다 같은 모양이 반복되고 위아래가 대칭입니다. 정현파라는 모양만으로 불평형을 확정하지는 않습니다.',
  beat: '가까운 두 성분(1X·1.1X)을 더했습니다. 크기가 10바퀴마다 커졌다 작아집니다. AM과 비슷한 모양이므로 성분 주파수도 함께 봅니다.',
  am: '1X 진폭이 0.1X 박자로 변합니다. 10바퀴를 봐야 변조 한 주기가 보입니다. 이 모델은 0.9X·1X·1.1X로 구성됩니다.',
  impacts: '한 바퀴에 세 번 울림이 시작됩니다. 울림 안의 여러 봉우리 대신 새로 시작하는 시각을 셉니다. 주황 점은 모델이 정한 사건 시각이며 자동 검출 결과가 아닙니다.',
  truncated: '아래쪽을 −0.25A에서 제한한 모양 예시입니다. 접촉으로 운동이 제한될 때 이런 절단을 의심하지만, 센서의 한쪽 포화도 같은 모양을 만들 수 있습니다.',
  clipped: '양쪽을 ±0.65A에서 제한했습니다. 센서·신호 조절기·ADC 과부하 여부와 입력 범위를 먼저 확인합니다. 양쪽 평탄부만으로 전기적 원인을 확정할 수는 없습니다.',
  asymmetric: '1X에 같은 위상의 2X를 0.35A만큼 더했습니다. 평균이 0이어도 위아래 Peak가 다릅니다. 비선형 접촉·풀림의 단서일 수 있지만 선형적인 성분 합성도 이런 모양을 만듭니다.',
};

export interface WaveOptions {
  pattern: WavePattern;
  rpm?: number;
  amplitude?: number;
  revolutions?: number;
  noise?: number;
  seed?: number;
}

/** 1X와 2X의 진폭은 고정하고 2X 위상만 바꾸는 비교용 신호. */
export function harmonicValue(theta: number, amplitude: number, phase = 0): number {
  if (![theta, amplitude, phase].every(Number.isFinite) || amplitude < 0) throw new RangeError('invalid harmonic waveform');
  return amplitude * (Math.cos(theta) + 0.35 * Math.cos(2 * theta + phase));
}

export function waveValue(pattern: WavePattern, theta: number, amplitude: number): number {
  if (!WAVE_PATTERNS.includes(pattern) || !Number.isFinite(theta) || !Number.isFinite(amplitude) || amplitude < 0) {
    throw new RangeError('invalid waveform');
  }
  const c = Math.cos(theta);
  switch (pattern) {
    case 'sine': return amplitude * c;
    case 'beat': return amplitude * 0.5 * (c + Math.cos(1.1 * theta));
    case 'am': return amplitude * (1 + 0.5 * Math.cos(0.1 * theta)) * c;
    case 'impacts': {
      // 한 바퀴 세 사건. 사건마다 네 번의 감쇠 진동(ζ ≈ 0.13: 봉우리가 여러 번 보이게); 경계에서 남는 울림은 e^(−1/0.3) ≈ 0.036.
      const phase = ((theta / (2 * Math.PI) * 3) % 1 + 1) % 1;
      return amplitude * Math.exp(-phase / 0.3) * Math.sin(2 * Math.PI * 4 * phase);
    }
    case 'truncated': return amplitude * Math.max(-0.25, c);
    case 'clipped': return amplitude * Math.max(-0.65, Math.min(0.65, c));
    case 'asymmetric': return harmonicValue(theta, amplitude);
  }
}

export function waveFeatures(x: ArrayLike<number>) {
  if (!x.length) throw new RangeError('empty waveform');
  let min = Infinity, max = -Infinity, sum = 0;
  for (let i = 0; i < x.length; i++) {
    if (!Number.isFinite(x[i])) throw new RangeError('nonfinite sample');
    min = Math.min(min, x[i]); max = Math.max(max, x[i]); sum += x[i];
  }
  const mean = sum / x.length;
  const ac = Array.from(x, v => v - mean);
  const scale = Math.abs(max) + Math.abs(min);
  const clean = (v: number) => Math.abs(v) < 1e-12 ? 0 : v;
  return {
    min, max, mean: Math.abs(mean) < Math.max(Math.abs(min), Math.abs(max)) * 1e-12 ? 0 : mean,
    peakToPeak: max - min, rms: rms(x), acRms: rms(ac), crestFactor: crestFactor(x),
    // 0 기준 Peak 차이는 DC 이동에도 변한다. 평균·중심 모멘트인 왜도와 함께 읽는다.
    asymmetry: clean(scale === 0 ? 0 : (Math.abs(max) - Math.abs(min)) / scale),
    skewness: clean(skewness(x)),
  };
}

export function waveform(o: WaveOptions) {
  const rpm = o.rpm ?? 3000, amplitude = o.amplitude ?? 20e-6;
  const revs = o.revolutions ?? 10, noise = o.noise ?? 0, seed = o.seed ?? 6101;
  if (!Number.isFinite(rpm) || rpm <= 0 || !Number.isFinite(amplitude) || amplitude < 0 ||
      !Number.isInteger(revs) || revs < 1 || revs > 40 || !Number.isFinite(noise) || noise < 0 || !Number.isFinite(seed)) {
    throw new RangeError('invalid options');
  }
  const fr = rpm / 60, n = 256 * revs, fs = fr * 256, rng = createRng(seed);
  const time = Array.from({ length: n }, (_, i) => i / fs);
  const x = time.map((_, i) => waveValue(o.pattern, 2 * Math.PI * i / 256, amplitude) + noise * rng.normal());
  const keyphasor = Array.from({ length: revs }, (_, i) => i / fr);
  const events = o.pattern === 'impacts' ? Array.from({ length: revs * 3 }, (_, i) => i / (3 * fr)) : [];
  return { time, x, fr, fs, keyphasor, events, eventInterval: events.length ? 1 / (3 * fr) : null, features: waveFeatures(x) };
}