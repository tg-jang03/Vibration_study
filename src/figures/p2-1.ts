/**
 * P2-1 "센서 원리와 선택" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 센서 응답은 랩(LAB-SNS-01)과 같은 `src/lib/sensor.ts`(lib/mck의 H(r)·r²H(r))로 계산한다.
 */
import { grid, squareYRange, type FigAnnotation, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { flatBand, MOUNTS, sensorResponse, type MountKind } from '../lib/sensor';

const deg = (rad: number) => (rad * 180) / Math.PI;
const logTicks = (lo: number, hi: number) =>
  Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => ({ value: v, label: v >= 3 ? `${10 ** (v - 3)}k` : String(10 ** v) }));

// 그림 1 — 세 가지 센서 (도식)
const X1: [number, number] = [0, 30];
const Y1 = squareYRange(X1, 190);
const top = Y1[1];
export const threeSensors: FigureSpec = {
  id: 'fig-p2-1-1',
  caption: '그림 1. 진동을 전압으로 바꾸는 세 가지 센서. 왼쪽: 비접촉 변위 센서는 센서 끝과 축 사이의 거리(간격)를 잰다 — 센서가 붙은 곳에 대한 축의 상대 변위다. 가운데·오른쪽: 속도계와 가속도계는 기계 표면에 붙이고, 통 안에 스프링에 매달린 질량(m)이 들어 있다. 통이 흔들리면 질량과 통 사이에 상대 운동이 생기고, 센서는 그것을 전압으로 바꾼다 — 기계 표면 자체의 절대 진동을 잰다. 속도계의 스프링은 무르고(고유진동수가 낮다), 가속도계의 압전 소자는 아주 단단하다(고유진동수가 높다).',
  panels: [
    {
      frame: false,
      height: 190,
      x: { range: X1 },
      y: { range: Y1 },
      series: [],
      annotations: [
        // A: 비접촉 변위 센서
        { type: 'text', x: 4.5, y: top - 0.45, text: '비접촉 변위 센서', anchor: 'middle', bold: true },
        { type: 'circle', x: 2.6, y: top * 0.48, r: 1.8 * (820 / 30), fill: true, color: 'muted', label: '축' },
        { type: 'rect', x1: 5.5, x2: 8.8, y1: top * 0.48 - 0.4, y2: top * 0.48 + 0.4, color: 'c1', label: '센서' },
        { type: 'arrow', x1: 4.4, y1: top * 0.48 + 0.95, x2: 5.5, y2: top * 0.48 + 0.95, double: true, color: 'warn', label: '간격', labelDy: -8 },
        { type: 'text', x: 4.5, y: 0.4, text: '축까지의 거리 → 상대 변위', anchor: 'middle', color: 'muted' },
        // B: 동전형 속도계
        { type: 'text', x: 15, y: top - 0.45, text: '동전형 속도계', anchor: 'middle', bold: true },
        { type: 'ground', x1: 11, y1: 1.1, x2: 19, y2: 1.1, side: 'right' },
        { type: 'rect', x1: 12.3, x2: 17.7, y1: 1.15, y2: top - 1.0, color: 'muted' },
        { type: 'spring', x1: 15, y1: 1.2, x2: 15, y2: top * 0.52, coils: 5, label: '무른 스프링' },
        { type: 'rect', x1: 13.8, x2: 16.2, y1: top * 0.52, y2: top * 0.52 + 1.1, color: 'c1', label: 'm' },
        { type: 'text', x: 15, y: top * 0.52 + 1.6, text: '코일 · 자석', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 15, y: 0.4, text: '기계 표면의 절대 속도', anchor: 'middle', color: 'muted' },
        // C: 가속도계
        { type: 'text', x: 25.5, y: top - 0.45, text: '가속도계 (압전)', anchor: 'middle', bold: true },
        { type: 'ground', x1: 21.5, y1: 1.1, x2: 29.5, y2: 1.1, side: 'right' },
        { type: 'rect', x1: 23.3, x2: 27.7, y1: 1.15, y2: top * 0.62, color: 'muted' },
        { type: 'spring', x1: 25.5, y1: 1.2, x2: 25.5, y2: 2.0, coils: 2 },
        { type: 'text', x: 25.5, y: 3.35, text: '압전 소자 (단단함)', anchor: 'middle', color: 'muted' },
        { type: 'rect', x1: 24.3, x2: 26.7, y1: 2.0, y2: 3.0, color: 'c1', label: 'm' },
        { type: 'text', x: 25.5, y: 0.4, text: '기계 표면의 절대 가속도', anchor: 'middle', color: 'muted' },
      ],
    },
  ],
};

// 그림 2 — 같은 질량-스프링, 쓰는 구간이 다르다
const ZETA2 = 0.1;
const lr = grid(-2, 2, 401);
const accR = lr.map((l) => Math.log10(sensorResponse('accelerometer', 10 ** l, 1, ZETA2).ratio));
const velR = lr.map((l) => Math.log10(sensorResponse('velocity', 10 ** l, 1, ZETA2).ratio));
export const twoRegimes: FigureSpec = {
  id: 'fig-p2-1-2',
  caption: `그림 2. 통 안의 질량-스프링(감쇠비 ${ZETA2})이 기계 표면의 진동을 얼마나 그대로 옮기는지를 진동수비 r = 진동 주파수 ÷ 센서 고유진동수에 대해 그렸다 (두 축 모두 로그 눈금). 파랑: 가속도계로 쓸 때 — 읽은 값 ÷ 실제 가속도 = H(r)(P0-4의 진폭비). r ≪ 1에서 1로 평탄하다. 초록: 속도계로 쓸 때 — 읽은 값 ÷ 실제 속도 = r²H(r). r ≫ 1에서 1로 평탄하다. 같은 계가 공진 아래에서는 가속도를, 위에서는 속도(질량이 제자리에 머물고 통만 움직임)를 그대로 읽는다. r = 1 근처는 둘 다 공진으로 부풀려진다.`,
  panels: [
    {
      series: [
        { x: lr, y: accR, color: 'c1', width: 2.4, label: '가속도계: H(r)' },
        { x: lr, y: velR, color: 'c3', width: 2.4, label: '속도계: r²H(r)' },
      ],
      annotations: [
        { type: 'band', x1: -2, x2: Math.log10(0.3), color: 'c1', label: '가속도계가 쓰는 곳' },
        { type: 'band', x1: Math.log10(3), x2: 2, color: 'c3', label: '속도계가 쓰는 곳' },
        { type: 'hline', y: 0, color: 'muted', dash: true },
        { type: 'vline', x: 0, color: 'warn', dash: true, label: '공진 r = 1' },
      ],
      x: { range: [-2, 2], ticks: [-2, -1, 0, 1, 2], tickLabels: [-2, -1, 0, 1, 2].map((v) => ({ value: v, label: String(10 ** v) })), label: '진동수비 r = f / f_n (로그 눈금)' },
      y: { range: [-3, 1.2], ticks: [-3, -2, -1, 0, 1], tickLabels: [-3, -2, -1, 0, 1].map((v) => ({ value: v, label: String(10 ** v) })), label: '읽은 값 ÷ 실제 값' },
      height: 220,
    },
  ],
};

// 그림 3 — 가속도계 (공진 25 kHz)
const ACC = { fn: 25000, zeta: 0.02 };
const accBand = flatBand('accelerometer', ACC.fn, ACC.zeta);
const accBand0 = flatBand('accelerometer', ACC.fn, 0);
const lf3 = grid(1, Math.log10(50000), 500);
const acc3 = lf3.map((l) => sensorResponse('accelerometer', 10 ** l, ACC.fn, ACC.zeta));
export const accelerometerResponse: FigureSpec = {
  id: 'fig-p2-1-3',
  caption: `그림 3. 공진 ${ACC.fn / 1000} kHz(감쇠비 ${ACC.zeta})인 가속도계의 응답. 위: 읽은 값 ÷ 실제 가속도 — 낮은 주파수에서 1이고, 공진에 가까워질수록 커진다. 회색 띠는 ±10 %, 오른쪽 회색 점선은 공진이다. 진폭비가 1.1을 넘는 곳이 ${formatNumber(accBand.hi / 1000, 3)} kHz(공진의 ${formatNumber(accBand.hi / ACC.fn, 2)}배)이므로, 이 센서로 ±10 % 안에서 믿고 쓸 수 있는 대역은 그 아래다 (감쇠를 무시하면 ${formatNumber(accBand0.hi / 1000, 3)} kHz). 아래: 위상 지연 — 평탄 대역 안에서는 몇 도뿐이다.`,
  panels: [
    {
      title: '읽은 값 ÷ 실제 가속도',
      series: [{ x: lf3, y: acc3.map((s) => s.ratio), color: 'c1', width: 2.2 }],
      annotations: [
        { type: 'rect', x1: 1, x2: Math.log10(50000), y1: 0.9, y2: 1.1, color: 'muted', label: '' },
        { type: 'vline', x: Math.log10(accBand.hi), color: 'warn', dash: true, label: `±10 % 상한 ${formatNumber(accBand.hi / 1000, 3)} kHz` },
        { type: 'vline', x: Math.log10(ACC.fn), color: 'muted', dash: true },
      ],
      x: { range: [1, Math.log10(50000)], ticks: [1, 2, 3, 4], tickLabels: logTicks(1, 4) },
      y: { range: [0, 3], ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3] },
      height: 165,
    },
    {
      title: '위상 지연 [°]',
      series: [{ x: lf3, y: acc3.map((s) => deg(s.phaseError)), color: 'c1', width: 2.2 }],
      annotations: [{ type: 'vline', x: Math.log10(accBand.hi), color: 'warn', dash: true }],
      x: { range: [1, Math.log10(50000)], ticks: [1, 2, 3, 4], tickLabels: logTicks(1, 4), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [0, 180], ticks: [0, 45, 90, 135, 180] },
      height: 120,
    },
  ],
};

// 그림 4 — 동전형 속도계 (고유진동수 10 Hz)
const VEL = { fn: 10 };
const zetas4 = [0.1, 0.6];
const lf4 = grid(0, 3, 400);
const vel4 = zetas4.map((z) => lf4.map((l) => sensorResponse('velocity', 10 ** l, VEL.fn, z)));
const velBands = zetas4.map((z) => flatBand('velocity', VEL.fn, z));
const v5 = sensorResponse('velocity', 5, VEL.fn, 0.6);
export const velocityResponse: FigureSpec = {
  id: 'fig-p2-1-4',
  caption: `그림 4. 고유진동수 ${VEL.fn} Hz인 동전형 속도계의 응답. 위: 읽은 값 ÷ 실제 속도 — 높은 주파수에서 1이다. 감쇠가 작으면(ζ 0.1, 파랑) 고유진동수 근처에서 크게 부풀고 ${formatNumber(velBands[0].lo, 3)} Hz부터 ±10 % 안에 든다. 감쇠를 키우면(ζ 0.6, 초록) 부풀림이 사라져 ${formatNumber(velBands[1].lo, 3)} Hz부터 쓸 수 있다. 그래도 고유진동수 아래에서는 급히 작아진다 — 5 Hz(300 rpm 기계의 1X)를 재면 실제의 ${formatNumber(v5.ratio * 100, 2)} %로 읽힌다. 아래: 위상 차이 — 낮은 주파수일수록 크게 어긋난다 (5 Hz에서 ${formatNumber(Math.abs(deg(v5.phaseError)), 3)}°).`,
  panels: [
    {
      title: '읽은 값 ÷ 실제 속도',
      series: zetas4.map((z, i) => ({ x: lf4, y: vel4[i].map((s) => s.ratio), color: i === 0 ? ('c1' as const) : ('c3' as const), width: 2.2, label: `ζ = ${z}` })),
      annotations: [
        { type: 'rect', x1: 0, x2: 3, y1: 0.9, y2: 1.1, color: 'muted', label: '' },
        { type: 'vline', x: 1, color: 'muted', dash: true, label: '고유진동수 10 Hz' },
        { type: 'point', x: Math.log10(5), y: v5.ratio, color: 'warn', label: `5 Hz: ${formatNumber(v5.ratio, 2)}`, dx: 10, dy: 14 },
      ],
      x: { range: [0, 3], ticks: [0, 1, 2, 3], tickLabels: logTicks(0, 3) },
      y: { range: [0, 2.5], ticks: [0, 0.5, 1, 1.5, 2, 2.5] },
      height: 170,
    },
    {
      title: '위상 차이 [°] (높은 주파수 기준)',
      series: zetas4.map((_, i) => ({ x: lf4, y: vel4[i].map((s) => deg(s.phaseError)), color: i === 0 ? ('c1' as const) : ('c3' as const), width: 2.2 })),
      x: { range: [0, 3], ticks: [0, 1, 2, 3], tickLabels: logTicks(0, 3), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [-180, 0], ticks: [-180, -135, -90, -45, 0] },
      height: 120,
      legend: false,
    },
  ],
};

// 그림 5 — 마운팅별 응답
const MKEYS: MountKind[] = ['stud', 'adhesive', 'magnet', 'hand'];
const MCOL = { stud: 'c1', adhesive: 'c3', magnet: 'c4', hand: 'warn' } as const;
const SHORT = { stud: '스터드', adhesive: '접착', magnet: '자석', hand: '손' } as const;
const lf5 = grid(2, Math.log10(30000), 500);
const mountBands = MKEYS.map((k) => flatBand('accelerometer', MOUNTS[k].fn, MOUNTS[k].zeta).hi);
export const mountingResponse: FigureSpec = {
  id: 'fig-p2-1-5',
  caption: `그림 5. 같은 가속도계를 붙이는 방법만 바꿨다 (설치 공진은 예시값: ${MKEYS.map((k) => `${SHORT[k]} ${formatNumber(MOUNTS[k].fn / 1000, 2)} kHz`).join(', ')} — I-025). 붙이는 방법이 무를수록 센서와 기계 사이에 스프링이 하나 더 생긴 셈이라 공진이 내려온다. ±10 % 안에서 쓸 수 있는 상한도 ${mountBands.map((b) => `${formatNumber(b / 1000, 2)} kHz`).join(' → ')}로 줄어든다. 자석으로 붙이고 수 kHz의 성분을 재면 실제보다 크게 읽힌다.`,
  panels: [
    {
      series: MKEYS.map((k) => ({ x: lf5, y: lf5.map((l) => sensorResponse('accelerometer', 10 ** l, MOUNTS[k].fn, MOUNTS[k].zeta).ratio), color: MCOL[k], width: 2.2, label: MOUNTS[k].label })),
      annotations: [
        { type: 'rect', x1: 2, x2: Math.log10(30000), y1: 0.9, y2: 1.1, color: 'muted', label: '' },
        ...MKEYS.map((k, i): FigAnnotation => ({ type: 'point', x: Math.log10(mountBands[i]), y: 1.1, color: MCOL[k] })),
      ],
      x: { range: [2, Math.log10(30000)], ticks: [2, 3, 4], tickLabels: logTicks(2, 4), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [0, 3], ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3], label: '읽은 값 ÷ 실제 가속도' },
      height: 220,
    },
  ],
};

// 그림 6 — 측정 스펙트럼이 바뀐다
const LINES = [500, 1000, 2000, 3000, 4000, 5000, 6000, 8000];
const studRead = LINES.map((f) => sensorResponse('accelerometer', f, MOUNTS.stud.fn, MOUNTS.stud.zeta).ratio);
const magRead = LINES.map((f) => sensorResponse('accelerometer', f, MOUNTS.magnet.fn, MOUNTS.magnet.zeta).ratio);
const specPanel = (y: number[], title: string, color: 'c1' | 'c4', last: boolean): FigPanel => ({
  title,
  series: [{ x: LINES.map((f) => f / 1000), y, kind: 'stem', color, radius: 4, width: 2 }],
  annotations: [{ type: 'hline', y: 1, color: 'muted', dash: true, label: '실제 크기 1', labelAt: 'end' }],
  x: last ? { range: [0, 8.6], ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8], label: '주파수 [kHz]' } : { range: [0, 8.6], ticks: 'none' },
  y: { range: [0, 4], ticks: [0, 1, 2, 3, 4], label: last ? '[m/s² Peak]' : undefined },
  height: last ? 130 : 110,
});
export const spectrumDistortion: FigureSpec = {
  id: 'fig-p2-1-6',
  caption: `그림 6. 기계에 크기가 모두 1 m/s²인 성분 여덟 개(0.5 ~ 8 kHz)가 있다. 위: 스터드로 고정한 가속도계 — 8 kHz도 ${formatNumber(studRead[studRead.length - 1], 3)}로 거의 그대로다. 아래: 자석으로 붙인 가속도계(설치 공진 예시 7 kHz) — 공진 근처의 5 kHz가 ${formatNumber(magRead[5], 2)}배, 6 kHz가 ${formatNumber(magRead[6], 2)}배, 8 kHz가 ${formatNumber(magRead[7], 2)}배로 부풀었다. 기계는 같은데 스펙트럼 모양이 달라졌다. 고주파 근처의 큰 막대가 기계가 아니라 센서 설치 때문일 수 있다 (P2-4).`,
  panels: [specPanel(studRead, '스터드 (설치 공진 25 kHz)', 'c1', false), specPanel(magRead, '자석 (설치 공진 예시 7 kHz)', 'c4', true)],
};

// 그림 7 — GT/ST: 축을 직접 잰다 (도식)
const X7: [number, number] = [0, 30];
const Y7 = squareYRange(X7, 210);
const cy = (Y7[1] + Y7[0]) / 2 + 0.1;
const cx = 15;
const shaftR = 1.6;
const brgR = 2.05;
const pxPerUnit = 820 / 30;
const probeAt = (angDeg: number) => {
  const a = (angDeg * Math.PI) / 180;
  return { x1: cx + Math.cos(a) * (brgR + 2.6), y1: cy + Math.sin(a) * (brgR + 2.6), x2: cx + Math.cos(a) * (brgR + 0.15), y2: cy + Math.sin(a) * (brgR + 0.15) };
};
const pY = probeAt(45);
const pX = probeAt(135);
export const turbineMeasurement: FigureSpec = {
  id: 'fig-p2-1-7',
  caption: '그림 7. 발전용 가스·증기 터빈(GT/ST)의 베어링 단면 (축 방향에서 본 모습, 크기는 과장했다). 축(파랑)은 기름막을 사이에 두고 미끄럼 베어링 안에서 돈다. 두 비접촉 변위 센서(주황)가 축을 위쪽 양옆 45°에서 직접 겨냥해 베어링 틈 안에서 축이 얼마나 움직이는지 잰다. 바깥의 무거운 케이싱에 붙인 가속도계·속도계(보라)는 기름막과 케이싱을 거쳐 약해진 진동만 받는다.',
  panels: [
    {
      frame: false,
      height: 210,
      x: { range: X7 },
      y: { range: Y7 },
      series: [],
      annotations: [
        { type: 'rect', x1: 4, x2: 26, y1: Y7[0] + 0.3, y2: Y7[1] - 0.3, color: 'muted', label: '' },
        { type: 'text', x: 5, y: Y7[1] - 0.9, text: '케이싱 (무겁다)', anchor: 'start', color: 'muted', bold: true },
        { type: 'circle', x: cx, y: cy, r: (brgR + 0.9) * pxPerUnit, color: 'muted' },
        { type: 'circle', x: cx, y: cy, r: brgR * pxPerUnit, color: 'muted', dash: true },
        { type: 'circle', x: cx + 0.25, y: cy - 0.15, r: shaftR * pxPerUnit, fill: true, color: 'c1', label: '축' },
        { type: 'text', x: cx + brgR + 1.2, y: cy - 0.2, text: '베어링 · 기름막', anchor: 'start', color: 'muted' },
        { type: 'line', ...pY, color: 'warn', width: 5 },
        { type: 'line', ...pX, color: 'warn', width: 5 },
        { type: 'text', x: pY.x1 + 0.2, y: pY.y1 + 0.35, text: '변위 센서 Y', anchor: 'start', color: 'warn', bold: true },
        { type: 'text', x: pX.x1 - 0.2, y: pX.y1 + 0.35, text: '변위 센서 X', anchor: 'end', color: 'warn', bold: true },
        { type: 'rect', x1: 26, x2: 27.6, y1: cy - 0.5, y2: cy + 0.5, color: 'c4', label: '' },
        { type: 'text', x: 27.8, y: cy + 0.9, text: '케이싱 센서', anchor: 'end', color: 'c4', bold: true },
      ],
    },
  ],
};

/** 본문 숫자 확인용 (테스트에서 사용) */
export const P21_VALUES = {
  accHi: accBand.hi,
  accHi0: accBand0.hi,
  velLo01: velBands[0].lo,
  velLo06: velBands[1].lo,
  vel5ratio: v5.ratio,
  vel5phaseDeg: deg(v5.phaseError),
  mountBands,
  mag5k: magRead[5],
  mag6k: magRead[6],
  mag8k: magRead[7],
  stud8k: studRead[studRead.length - 1],
};
