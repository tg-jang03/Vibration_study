import { grid, squareYRange, type FigPanel, type FigureSpec } from '../lib/figure';
import { steadyStateResponse } from '../lib/mck/forced';
import { buildMap } from '../lib/machine/frequencyMap';
import { DEFAULT_SOURCES, SOURCE_FS, synthesizeSources } from '../lib/machine/sourceSynthesis';

const base = synthesizeSources(DEFAULT_SOURCES);
const count = Math.floor(0.08 * SOURCE_FS) + 1;
const ms = Array.from(base.t.slice(0, count), (v) => v * 1000);
const um = (x: Float64Array) => Array.from(x.slice(0, count), (v) => v * 1e6);
const timePanel = (title: string, y: ArrayLike<number>, color: 'c1' | 'c2' | 'c3' | 'text'): FigPanel => ({
  title, height: 140, x: { range: [0, 80], label: '시간 [ms]' }, y: { range: [-80, 80], label: '변위 [µm]' },
  series: [{ x: ms, y, color }],
});

export const mixedResponse: FigureSpec = {
  id: 'fig-p1-9-1',
  caption: '그림 1. 3000 rpm·날개 12장의 예시. 50 Hz(40 µm)·100 Hz(20 µm)·600 Hz(10 µm)를 더하면 맨 아래 한 줄이 된다. 세 응답과 합은 같은 시간·변위 축이다.',
  panels: [
    timePanel('1X 응답: 50 Hz', um(base.parts[0].x), 'c1'),
    timePanel('2X 응답: 100 Hz', um(base.parts[1].x), 'c2'),
    timePanel('날개 통과 응답: 600 Hz', um(base.parts[2].x), 'c3'),
    timePanel('센서 신호 = 세 응답의 합', um(base.x), 'text'),
  ],
};

export const forwardInverse: FigureSpec = {
  id: 'fig-p1-9-2',
  caption: '그림 2. 순문제는 힘과 기계의 성질을 주고 응답을 계산한다. 역문제는 응답을 주고 힘과 기계의 성질을 추정한다. 미지수가 여러 개라 추가 증거가 필요하다.',
  panels: [{
    frame: false, height: 200, x: { range: [0, 10] }, y: { range: squareYRange([0, 10], 200) }, series: [],
    annotations: [
      { type: 'text', x: 0.3, y: 2.6, text: '순문제: 알고 시작', anchor: 'start', bold: true, color: 'c1' },
      { type: 'rect', x1: 0.3, x2: 4.2, y1: 1.65, y2: 2.25, label: '힘 + 질량·감쇠·강성', color: 'c1' },
      { type: 'arrow', x1: 4.4, x2: 5.7, y1: 1.95, y2: 1.95, color: 'c1', double: false },
      { type: 'rect', x1: 5.9, x2: 9.7, y1: 1.65, y2: 2.25, label: '응답 예측', color: 'c1' },
      { type: 'text', x: 0.3, y: 1.2, text: '역문제: 측정에서 시작', anchor: 'start', bold: true, color: 'c2' },
      { type: 'rect', x1: 0.3, x2: 4.2, y1: 0.25, y2: 0.85, label: '측정 응답 + 추가 증거', color: 'c2' },
      { type: 'arrow', x1: 4.4, x2: 5.7, y1: 0.55, y2: 0.55, color: 'c2', double: false },
      { type: 'rect', x1: 5.9, x2: 9.7, y1: 0.25, y2: 0.85, label: '원인 후보 비교', color: 'c2' },
    ],
  }],
};

export const ambiguityValues = [0.5, 1].map((r) => {
  const response = steadyStateResponse(r, 0.05);
  return { r, ...response, force: 40 / response.amplitudeRatio }; // k = 1e6 N/m, A = 40 µm
});
const short = grid(0, 40, 401);
export const sameAmplitude: FigureSpec = {
  id: 'fig-p1-9-3',
  caption: '그림 3. 같은 강성 10⁶ N/m·감쇠비 0.05의 두 계. 고유진동수 100 Hz에는 30.1 N, 50 Hz에는 4 N을 가하면 둘 다 50 Hz·40 µm가 된다. 힘 기준의 위상 지연은 각각 3.81°·90°로 다르다.',
  panels: [{
    title: '응답 진폭은 같지만 필요한 힘과 기계의 성질은 다르다',
    x: { range: [0, 40], label: '시간 [ms]' }, y: { range: [-50, 50], label: '변위 [µm]' }, height: 210,
    series: ambiguityValues.map((v, i) => ({ x: short, y: short.map((t) => 40 * Math.cos(2 * Math.PI * 50 * t / 1000 - v.phaseLag)),
      color: i === 0 ? 'c1' : 'c2', label: i === 0 ? 'fₙ = 100 Hz / 30.1 N' : 'fₙ = 50 Hz / 4 N' })),
  }],
};

export const phaseChanges: FigureSpec = {
  id: 'fig-p1-9-4',
  caption: '그림 4. 50 Hz·40 µm와 100 Hz·20 µm는 그대로 두고 2X의 시작 위상만 0° → 180°로 바꿨다. t = 0의 합은 60 → 20 µm, 파형 모양도 달라진다. 성분 크기를 바꾸지 않아도 합은 변한다.',
  panels: [{
    x: { range: [0, 40], label: '시간 [ms]' }, y: { range: [-70, 70], label: '변위 [µm]' }, height: 210,
    series: [0, Math.PI].map((phase, i) => ({ x: short,
      y: short.map((t) => 40 * Math.cos(2 * Math.PI * 50 * t / 1000) + 20 * Math.cos(2 * Math.PI * 100 * t / 1000 + phase)),
      color: i === 0 ? 'c1' : 'c2', label: `2X 시작 위상 ${i === 0 ? '0°' : '180°'}` })),
  }],
};

const ringParams = structuredClone(DEFAULT_SOURCES);
for (const id of ['oneX', 'twoX', 'blade'] as const) ringParams.sources[id].enabled = false;
ringParams.sources.ring.enabled = true;
const ring = synthesizeSources(ringParams);
export const repeatedRing: FigureSpec = {
  id: 'fig-p1-9-7',
  caption: '그림 7. 100 ms마다 충격을 받고 85 Hz로 울리는 구조 응답 예시. 포락선의 감쇠 시정수는 25 ms다. 한 응답도 여러 주파수 막대를 만들므로 막대 수가 원인 수는 아니다.',
  panels: [
    { title: '충격 뒤 감쇠하는 울림이 되풀이된다', height: 170,
      x: { range: [0, 300], label: '시간 [ms]' }, y: { range: [-35, 35], label: '변위 [µm]' },
      series: [{ x: Array.from(ring.t.slice(0, 2458), (t) => t * 1000), y: Array.from(ring.x.slice(0, 2458), (x) => x * 1e6), color: 'c4' }] },
    { title: '같은 응답을 주파수별 크기로 보면', height: 170,
      x: { range: [0, 200], label: '주파수 [Hz]' }, y: { range: [0, 8], label: '성분 진폭 [µm]' },
      series: [{ x: ring.spectrum.frequency.slice(0, 201), y: Array.from(ring.spectrum.amplitude.slice(0, 201), (a) => a * 1e6), kind: 'bar', barWidth: 1, color: 'c4' }] },
  ],
};

const speed = grid(2400, 4200, 61);
const maps = speed.map((rpm) => buildMap('motorPump', { rpm, count: 12, balls: 9 }));
export const speedEvidence: FigureSpec = {
  id: 'fig-p1-9-5',
  caption: '그림 5. 2X는 회전수와 함께 80 → 140 Hz로 움직이지만, 60 Hz 전원의 2 f_L은 120 Hz 그대로다. 3600 rpm에서는 둘이 겹친다. 운전조건을 바꿔 보면 후보를 비교하기 쉬워진다(P1-8의 주파수 지도).',
  panels: [{
    x: { range: [2400, 4200], label: '회전수 [rpm]' }, y: { range: [70, 150], label: '주파수 [Hz]' }, height: 210,
    series: [
      { x: speed, y: maps.map((m) => m.rows[0].lines[1].f), label: '회전 관련 2X', color: 'c1' },
      { x: speed, y: maps.map((m) => m.rows[3].lines[0].f), label: '전원 관련 2 f_L', color: 'c2', dash: true },
    ],
    annotations: [{ type: 'point', x: 3600, y: 120, label: '같은 120 Hz', dx: -12, dy: -15, color: 'text' }],
  }],
};

export const spectrumPreview: FigureSpec = {
  id: 'fig-p1-9-6',
  caption: '그림 6. 그림 1의 합 신호에서 계산한 세 중심 주파수의 크기. 50·100·600 Hz에 40·20·10 µm가 있다. P1-8 지도와 달리 막대의 높이에도 뜻이 있다. 여기서는 중심 막대만 표시했다.',
  panels: [{
    x: { range: [0, 650], label: '주파수 [Hz]', ticks: [0, 50, 100, 300, 600] },
    y: { range: [0, 50], label: '성분 진폭 [µm]' }, height: 200,
    series: [{ x: [50, 100, 600], y: [50, 100, 600].map((f) => base.spectrum.amplitude[f] * 1e6), kind: 'bar', color: 'c1', barWidth: 7 }],
    annotations: [
      { type: 'text', x: 50, y: 44, text: '40' }, { type: 'text', x: 100, y: 24, text: '20' }, { type: 'text', x: 600, y: 14, text: '10' },
    ],
  }],
};
