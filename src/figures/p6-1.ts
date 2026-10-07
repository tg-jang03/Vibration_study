import type { FigureSpec, FigPanel } from '../lib/figure';
import { waveform, harmonicValue, waveFeatures, WAVE_LABELS, type WavePattern } from '../lib/plots/waveform';
import { formatNumber as fmt } from '../lib/format';

const panel = (pattern: WavePattern, revolutions = 10): FigPanel => {
  const r = waveform({ pattern, revolutions });
  return {
    title: WAVE_LABELS[pattern], height: 180,
    x: { range: [0, revolutions * 20], label: '시각 [ms]' },
    y: { range: [-35, 35], label: '변위 [µm]' },
    series: [{ x: r.time.map(t => t * 1000), y: r.x.map(v => v * 1e6), color: 'c1' }],
    annotations: r.keyphasor.map(t => ({ type: 'vline', x: t * 1000, color: 'muted', dash: true })),
  };
};
const sine = waveform({ pattern: 'sine', revolutions: 3 });
const beat = waveform({ pattern: 'beat' }), am = waveform({ pattern: 'am' });
const imp = waveform({ pattern: 'impacts', revolutions: 3 });
const trunc = waveform({ pattern: 'truncated', revolutions: 3 }), clip = waveform({ pattern: 'clipped', revolutions: 3 });
const asym = waveform({ pattern: 'asymmetric', revolutions: 3 });
const noisy = waveform({ pattern: 'sine', revolutions: 3, noise: 2e-6 });
const quadrature = asym.time.map((_, i) => harmonicValue(2 * Math.PI * i / 256, 20e-6, Math.PI / 2));

/** 본문·캡션 인용 숫자: figures-p6-1.test.ts로 고정. */
export const P61_VALUES = {
  sine: sine.features, beat: beat.features, am: am.features,
  eventIntervalMs: imp.eventInterval! * 1000, events: imp.events.length,
  truncated: trunc.features, clipped: clip.features, asymmetric: asym.features,
  noisy: noisy.features, quadrature: waveFeatures(quadrature),
};

export const reading: FigureSpec = {
  id: 'fig-p6-1-1',
  caption: `그림 1. 3000 rpm은 한 바퀴 20 ms입니다. 파랑은 기준 진폭 A=20 µm의 정현파, 회색 점선은 키페이저 시각입니다. 한 바퀴마다 한 주기가 반복되며 Pk-Pk는 ${fmt(sine.features.peakToPeak * 1e6, 3)} µm입니다.`,
  panels: [{ ...panel('sine', 3), annotations: [...panel('sine', 3).annotations!, { type: 'hline', y: 0, color: 'muted', dash: true }] }],
};
export const envelopes: FigureSpec = {
  id: 'fig-p6-1-2',
  caption: `그림 2. 위는 1X·1.1X의 맥놀이, 아래는 0.1X 박자로 진폭을 바꾼 AM입니다. 10바퀴=200 ms에서 크기 변화 한 주기를 봅니다. 두 신호의 RMS는 각각 ${fmt(beat.features.rms * 1e6, 3)}·${fmt(am.features.rms * 1e6, 3)} µm입니다. 맥놀이는 봉우리가 키페이저 점선에서 조금씩 밀리고 포락선이 0까지 내려가지만, AM은 봉우리가 매 바퀴 점선에 고정됩니다. 모양만으로 발생 원인을 확정할 수는 없습니다.`,
  panels: [panel('beat'), panel('am')],
};
export const impacts: FigureSpec = {
  id: 'fig-p6-1-3',
  caption: `그림 3. 한 바퀴(20 ms)에 울림이 세 번 시작합니다. 주황 점은 모델이 정한 시작 시각이며 간격은 ${fmt(imp.eventInterval! * 1000, 4)} ms입니다. 울림 안의 여러 봉우리를 각각 사건으로 세지 마세요. 모양 비교를 위해 변위로 그렸지만, 실제 충격 울림은 가속도 파형에서 잘 보입니다.`,
  panels: [{ ...panel('impacts', 3), y: { range: [-20, 20], label: '변위 [µm]' }, series: [...panel('impacts', 3).series, { x: imp.events.map(t => t * 1000), y: imp.events.map(() => -17), kind: 'dots', color: 'c2', label: '모델 사건 시작' }] }],
};
export const limits: FigureSpec = {
  id: 'fig-p6-1-4',
  caption: `그림 4. 한쪽 절단은 아래를 −5 µm, 양쪽 클리핑은 ±13 µm에서 제한한 모양 예시입니다. Pk-Pk는 각각 ${fmt(trunc.features.peakToPeak * 1e6, 3)}·${fmt(clip.features.peakToPeak * 1e6, 3)} µm입니다. 평탄부의 위치와 반복을 읽되 기계 접촉과 측정 체인 포화는 추가 확인으로 구별합니다.`,
  panels: [panel('truncated', 3), panel('clipped', 3)],
};
export const symmetry: FigureSpec = {
  id: 'fig-p6-1-5',
  caption: `그림 5. 1X에 같은 위상의 2X를 0.35A 더하면 위쪽 Peak는 ${fmt(asym.features.max * 1e6, 3)} µm, 아래쪽 크기는 약 ${fmt(Math.abs(asym.features.min) * 1e6, 3)} µm(2X 때문에 생긴 두 골의 바닥)입니다. 평균은 0인데 위아래가 다릅니다. 비대칭은 DC 이동과 구별해야 하며, 그 자체가 비선형 결함의 증명은 아닙니다.`,
  panels: [{ ...panel('asymmetric', 3), annotations: [...panel('asymmetric', 3).annotations!, { type: 'hline', y: 0, color: 'muted', dash: true }] }],
};
export const noise: FigureSpec = {
  id: 'fig-p6-1-6',
  caption: `그림 6. 위는 잡음 없는 정현파, 아래는 σ=2 µm의 시드 고정 잡음을 더한 파형입니다. CF는 ${fmt(sine.features.crestFactor, 3)}에서 ${fmt(noisy.features.crestFactor, 3)}로 바뀝니다. 고립된 봉우리 하나와 반복되는 울림을 구별하고, 필터·시간 길이도 함께 기록하세요.`,
  panels: [panel('sine', 3), { ...panel('sine', 3), title: '같은 정현파 + 잡음', series: [{ x: noisy.time.map(t => 1000 * t), y: noisy.x.map(v => 1e6 * v), color: 'c1' }] }],
};
export const phase: FigureSpec = {
  id: 'fig-p6-1-7',
  caption: `그림 7. 두 파형은 모두 1X 20 µm Peak·2X 7 µm Peak이며 RMS도 ${fmt(asym.features.rms * 1e6, 4)} µm로 같습니다. 위는 2X 앞섬각 0°, 아래는 90°입니다. 진폭 스펙트럼이 숨긴 성분 사이 위상 차이가 파형 모양을 바꿉니다.`,
  panels: [{ ...panel('asymmetric', 3), title: '2X 앞섬각 0°' }, { ...panel('asymmetric', 3), title: '2X 앞섬각 90°', series: [{ x: asym.time.map(t => t * 1000), y: quadrature.map(v => v * 1e6), color: 'c2' }] }],
};