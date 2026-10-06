/**
 * P2-2 "비접촉 변위 센서 시스템" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 교정 곡선·신호는 랩(LAB-PROX-01)과 같은 `src/lib/proximity.ts`로 계산한다.
 */
import { grid, squareYRange, type FigAnnotation, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { distanceFromVoltage, gapVoltage, PROBE, simulateProbe } from '../lib/proximity';

const PX = 820 / 30; // 도식 패널 x 범위 [0, 30]의 1단위 px
const mm = (m: number) => m * 1e3;
const um = (m: number) => m * 1e6;
const S_MM = PROBE.sensitivity / 1000; // V/mm

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p2-2.test.ts`) */
export const P22_VALUES = (() => {
  const exampleV = -9.5;
  const exampleD = distanceFromVoltage(exampleV);
  const dcac = simulateProbe({ gap: exampleD, rpm: 3600, vibPp: 60e-6, runout: 'none' });
  const inside = simulateProbe({ gap: 1.2e-3, rpm: 3600, vibPp: 300e-6, runout: 'none' });
  const outside = simulateProbe({ gap: 2.4e-3, rpm: 3600, vibPp: 300e-6, runout: 'none' });
  const slow = simulateProbe({ gap: 1.2e-3, rpm: 300, vibPp: 60e-6, runout: 'both', revolutions: 1 });
  const fast = simulateProbe({ gap: 1.2e-3, rpm: 3600, vibPp: 60e-6, runout: 'both', revolutions: 1 });
  return { exampleV, exampleD, dcac, acVpp: dcac.truePp * PROBE.sensitivity, inside, outside, slow, fast };
})();
const V = P22_VALUES;

// 그림 1 — 프로브 시스템 (도식)
const X1: [number, number] = [0, 30];
const Y1 = squareYRange(X1, 170);
const cy = 3.7;
export const probeSystem: FigureSpec = {
  id: 'fig-p2-2-1',
  caption:
    '그림 1. 비접촉 변위 센서 시스템. 프로브 끝의 코일이 고주파 자기장을 내면 축 표면에 맴돌이 전류(와전류)가 생기고, 그 세기는 축까지의 거리(gap)에 따라 달라진다. 드라이버(프록시미터)가 이 변화를 거리에 비례하는 음(−)의 전압으로 바꿔 내보낸다. 프로브·케이블·드라이버는 정해진 길이와 표적 재질로 한 세트로 교정되어 있다.',
  panels: [
    {
      frame: false,
      height: 170,
      x: { range: X1 },
      y: { range: Y1 },
      series: [],
      annotations: [
        { type: 'circle', x: 3.0, y: cy, r: 2.6 * PX, fill: true, color: 'muted', label: '축' },
        { type: 'rect', x1: 6.1, x2: 10.5, y1: cy - 0.35, y2: cy + 0.35, color: 'c1' },
        { type: 'rect', x1: 6.1, x2: 6.5, y1: cy - 0.35, y2: cy + 0.35, color: 'c2' },
        { type: 'arrow', x1: 5.6, y1: cy + 1.0, x2: 6.1, y2: cy + 1.0, double: true, color: 'warn', label: 'gap', labelDy: -8 },
        { type: 'text', x: 8.3, y: cy - 1.05, text: '프로브 (끝에 코일)', anchor: 'middle', color: 'c1' },
        { type: 'line', x1: 10.5, y1: cy, x2: 17.5, y2: cy, color: 'text', width: 2 },
        { type: 'rect', x1: 13.6, x2: 14.4, y1: cy - 0.25, y2: cy + 0.25, color: 'muted' },
        { type: 'text', x: 14.0, y: cy + 0.7, text: '케이블 + 연장 케이블', anchor: 'middle', color: 'muted' },
        { type: 'rect', x1: 17.5, x2: 23.0, y1: cy - 1.1, y2: cy + 1.1, color: 'c3' },
        { type: 'text', x: 20.25, y: cy + 0.15, text: '드라이버', anchor: 'middle', bold: true },
        { type: 'text', x: 20.25, y: cy - 0.55, text: '(프록시미터)', anchor: 'middle', color: 'muted' },
        { type: 'arrow', x1: 23.0, y1: cy, x2: 27.6, y2: cy, double: false, color: 'c1', label: '출력 전압 (−)', labelDy: -8 },
        { type: 'text', x: 25.3, y: cy - 0.75, text: '→ 감시 장치·분석기', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 15.0, y: 0.4, text: '세 부품을 한 세트로 교정한다 (케이블 길이·표적 재질 포함)', anchor: 'middle', color: 'muted' },
      ],
    },
  ],
};

// 그림 2 — 교정 곡선
const dGrid = grid(0, 3e-3, 601);
const curve = dGrid.map((d) => gapVoltage(d));
export const calibrationCurve: FigureSpec = {
  id: 'fig-p2-2-2',
  caption: `그림 2. 교정 곡선(예시): 축까지의 거리와 출력 전압. 회색 띠의 선형 범위(${mm(PROBE.linearMin)} ~ ${mm(PROBE.linearMax)} mm) 안에서는 전압이 거리에 비례한다 — 기울기(감도)는 ${formatNumber(S_MM, 3)} V/mm(= 200 mV/mil). 거리가 멀수록 더 음이다. 주황 점선: 출력 ${formatNumber(V.exampleV, 2)} V는 ${formatNumber(V.exampleV, 2)} ÷ (−${formatNumber(S_MM, 3)}) = ${formatNumber(mm(V.exampleD), 3)} mm. 범위 밖에서는 곡선이 눕는다 (실제 모양은 프로브·표적에 따라 다르다).`,
  panels: [
    {
      series: [{ x: dGrid.map(mm), y: curve, color: 'c1', width: 2.4 }],
      annotations: [
        { type: 'band', x1: mm(PROBE.linearMin), x2: mm(PROBE.linearMax), color: 'muted', label: '선형 범위' },
        { type: 'line', x1: 0, y1: V.exampleV, x2: mm(V.exampleD), y2: V.exampleV, color: 'warn', dash: true, width: 1.4 },
        { type: 'line', x1: mm(V.exampleD), y1: V.exampleV, x2: mm(V.exampleD), y2: 0, color: 'warn', dash: true, width: 1.4 },
        { type: 'point', x: mm(V.exampleD), y: V.exampleV, color: 'warn', label: `${formatNumber(V.exampleV, 2)} V → ${formatNumber(mm(V.exampleD), 3)} mm`, dx: 10, dy: -4 },
        { type: 'text', x: 2.0, y: -13.5, text: `기울기 −${formatNumber(S_MM, 3)} V/mm`, anchor: 'start', color: 'c1' },
      ],
      x: { range: [0, 3], ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3], label: '축까지의 거리 gap [mm]' },
      y: { range: [-22, 0], ticks: [-20, -15, -10, -5, 0], label: '출력 [V]' },
      height: 220,
    },
  ],
};

// 그림 3 — DC와 AC
const ms = Array.from(V.dcac.time, (t) => t * 1000);
export const dcAndAc: FigureSpec = {
  id: 'fig-p2-2-3',
  caption: `그림 3. 평균 gap ${formatNumber(mm(V.exampleD), 3)} mm에서 축이 ${formatNumber(um(V.dcac.truePp), 3)} µm pp로 흔들릴 때(3600 rpm)의 출력 전압. 위: 0 V부터 그리면 거의 평평한 ${formatNumber(V.exampleV, 2)} V — 평균(DC)이 축의 평균 위치다. 아래: 같은 신호를 확대하면 ±${formatNumber(V.acVpp / 2, 3)} V로 출렁인다 — 이 교류(AC) ${formatNumber(V.acVpp, 3)} V pp ÷ ${formatNumber(S_MM, 3)} V/mm = ${formatNumber(um(V.dcac.truePp), 3)} µm pp가 진동이다. 한 신호에 위치와 진동이 함께 들어 있다.`,
  panels: [
    {
      title: '0 V부터 (DC가 대부분)',
      series: [{ x: ms, y: V.dcac.voltage, color: 'c1', width: 2 }],
      annotations: [
        { type: 'hline', y: V.dcac.dcVoltage, color: 'warn', dash: true },
        { type: 'text', x: ms[ms.length - 1], y: -14, text: `DC ${formatNumber(V.dcac.dcVoltage, 2)} V = 평균 위치`, anchor: 'end', color: 'warn' },
      ],
      x: { range: [0, ms[ms.length - 1]] },
      y: { range: [-20, 0], ticks: [-20, -15, -10, -5, 0], label: '[V]' },
      height: 120,
    },
    {
      title: '확대 (AC = 진동)',
      series: [{ x: ms, y: V.dcac.voltage, color: 'c1', width: 2 }],
      annotations: [
        { type: 'hline', y: V.dcac.dcVoltage, color: 'warn', dash: true },
        { type: 'arrow', x1: 1.5, y1: V.dcac.dcVoltage - V.acVpp / 2, x2: 1.5, y2: V.dcac.dcVoltage + V.acVpp / 2, double: true, color: 'c2' },
        { type: 'text', x: 2.3, y: V.dcac.dcVoltage + V.acVpp / 2 + 0.03, text: `${formatNumber(V.acVpp, 3)} V pp`, anchor: 'start', color: 'c2' },
      ],
      x: { range: [0, ms[ms.length - 1]], label: '시각 [ms]' },
      y: { range: [V.exampleV - 0.4, V.exampleV + 0.4], label: '[V]' },
      height: 130,
    },
  ],
};

// 그림 4 — 선형 범위 밖
const revDeg = (r: Float64Array) => Array.from(r, (v) => v * 360);
const centered = (a: Float64Array, mean: number) => Array.from(a, (v) => um(v - mean));
export const outOfRange: FigureSpec = {
  id: 'fig-p2-2-4',
  caption: `그림 4. 같은 축 진동 ${formatNumber(um(V.inside.truePp), 3)} µm pp를 평균 gap 1.2 mm(파랑)와 2.4 mm(주황)에서 쟀다. 위: 교정 곡선 위에서 신호가 오가는 구간. 2.4 mm 쪽은 선형 범위 끝(${mm(PROBE.linearMax)} mm)을 넘는다. 아래: 전압을 감도로 나눠 거리로 환산한 파형 (회색 점선은 실제 — 1.2 mm의 파랑과 겹친다). 1.2 mm에서는 ${formatNumber(um(V.inside.readPp), 3)} µm pp로 정확하지만, 2.4 mm에서는 먼 쪽이 눌려 ${formatNumber(um(V.outside.readPp), 3)} µm pp로 ${formatNumber((1 - V.outside.readPp / V.outside.truePp) * 100, 2)} % 작게 읽힌다.`,
  panels: [
    {
      title: '교정 곡선 위의 동작 구간',
      series: [{ x: dGrid.map(mm), y: curve, color: 'muted', width: 2 }],
      annotations: [
        { type: 'band', x1: 1.05, x2: 1.35, color: 'c1', label: '1.2 mm' },
        { type: 'band', x1: 2.25, x2: 2.55, color: 'c2', label: '2.4 mm' },
        { type: 'vline', x: mm(PROBE.linearMax), color: 'warn', dash: true },
        { type: 'text', x: mm(PROBE.linearMax), y: -6, text: `선형 범위 끝 ${mm(PROBE.linearMax)} mm`, anchor: 'end', color: 'warn', dx: -4 },
      ],
      x: { range: [0.5, 3], ticks: [0.5, 1, 1.5, 2, 2.5, 3], label: 'gap [mm]' },
      y: { range: [-22, -2], ticks: [-20, -15, -10, -5], label: '[V]' },
      height: 150,
    },
    {
      title: '전압에서 환산한 거리 (평균을 뺀 값)',
      series: [
        { x: revDeg(V.inside.rev), y: centered(V.inside.gap, 1.2e-3), color: 'muted', dash: true, width: 1.4 },
        { x: revDeg(V.inside.rev), y: centered(V.inside.readGap, V.inside.readMeanGap), color: 'c1', width: 2.2, label: '평균 gap 1.2 mm' },
        { x: revDeg(V.outside.rev), y: centered(V.outside.readGap, V.outside.readMeanGap), color: 'c2', width: 2.2, label: '평균 gap 2.4 mm' },
      ],
      annotations: [],
      x: { range: [0, 720], ticks: [0, 180, 360, 540, 720], label: '회전 각도 [°]' },
      y: { range: [-200, 200], ticks: [-150, -100, -50, 0, 50, 100, 150], label: 'gap 변화 [µm]' },
      height: 170,
      legend: true,
    },
  ],
};

// 그림 5 — 런아웃
const mech = simulateProbe({ gap: 1.2e-3, rpm: 300, vibPp: 0, runout: 'mechanical', revolutions: 1 });
const elec = simulateProbe({ gap: 1.2e-3, rpm: 300, vibPp: 0, runout: 'electrical', revolutions: 1 });
export const runoutFigure: FigureSpec = {
  id: 'fig-p2-2-5',
  caption: `그림 5. 런아웃 — 축이 흔들리지 않아도 센서가 읽는 신호 (예시, 한 바퀴). 위: 기계적 런아웃 — 축 표면이 조금 편심이거나 타원이면 1X·2X처럼, 흠집은 한 각도의 뾰족한 펄스로 보인다 (${formatNumber(um(mech.runoutPp), 2)} µm pp). 가운데: 전기적 런아웃 — 재질이 고르지 않거나 자기를 띤 곳이 있으면 거리가 같아도 출력이 달라져 들쭉날쭉한 무늬가 된다 (${formatNumber(um(elec.runoutPp), 2)} µm pp). 아래: 둘 다 있는 축을 300 rpm(초록)과 3600 rpm(파랑)에서 잰 gap 변화. 300 rpm에서는 진동이 ${formatNumber(um(V.slow.vibPp), 2)} µm pp뿐이라 신호(${formatNumber(um(V.slow.truePp), 3)} µm pp)의 거의 전부가 런아웃이다. 런아웃 무늬는 회전수가 바뀌어도 같은 각도에 같은 모양으로 남는다.`,
  panels: [
    {
      title: '기계적 런아웃 (진원도·흠집)',
      series: [{ x: revDeg(mech.rev), y: Array.from(mech.runout, um), color: 'c4', width: 2 }],
      annotations: [],
      x: { range: [0, 360], ticks: [0, 90, 180, 270, 360] },
      y: { range: [-6, 10], ticks: [-5, 0, 5, 10], label: '[µm]' },
      height: 100,
    },
    {
      title: '전기적 런아웃 (재질·자기)',
      series: [{ x: revDeg(elec.rev), y: Array.from(elec.runout, um), color: 'c4', width: 2 }],
      annotations: [],
      x: { range: [0, 360], ticks: [0, 90, 180, 270, 360] },
      y: { range: [-6, 6], ticks: [-5, 0, 5], label: '[µm]' },
      height: 100,
    },
    {
      title: '같은 축, 두 회전수 (gap 변화)',
      series: [
        { x: revDeg(V.fast.rev), y: centered(V.fast.gap, 1.2e-3), color: 'c1', width: 1.8, label: '3600 rpm (진동 + 런아웃)' },
        { x: revDeg(V.slow.rev), y: centered(V.slow.gap, 1.2e-3), color: 'c3', width: 2.4, label: '300 rpm (거의 런아웃만)' },
      ],
      annotations: [],
      x: { range: [0, 360], ticks: [0, 90, 180, 270, 360], label: '회전 각도 [°]' },
      y: { range: [-45, 45], ticks: [-40, -20, 0, 20, 40], label: '[µm]' },
      height: 150,
      legend: true,
    },
  ],
};

// 그림 6 — X-Y 설치 (도식)
const X6: [number, number] = [0, 30];
const Y6 = squareYRange(X6, 220);
const C6 = { x: 7.5, y: 4.6, r: 2.4 };
const probeAt = (deg: number): FigAnnotation[] => {
  const a = (deg * Math.PI) / 180;
  const p = (rr: number): [number, number] => [C6.x + rr * Math.cos(a), C6.y + rr * Math.sin(a)];
  const [x1, y1] = p(C6.r + 0.35);
  const [x2, y2] = p(C6.r + 2.6);
  return [
    { type: 'line', x1, y1, x2, y2, color: 'c1', width: 7 },
    { type: 'circle', x: x1, y: y1, r: 4, fill: true, color: 'c2' },
  ];
};
const label6 = (deg: number, text: string): FigAnnotation => {
  const a = (deg * Math.PI) / 180;
  return { type: 'text', x: C6.x + (C6.r + 3.2) * Math.cos(a), y: C6.y + (C6.r + 3.2) * Math.sin(a), text, anchor: 'middle', bold: true, color: 'c1' };
};
const note6 = (y: number, text: string): FigAnnotation => ({ type: 'text', x: 15.2, y, text, anchor: 'start' });
export const xyProbes: FigureSpec = {
  id: 'fig-p2-2-6',
  caption:
    '그림 6. 한 베어링에 비접촉 변위 센서 두 개를 수직선 양쪽 45°에 서로 90° 떨어뜨려 단다 (축 방향에서 본 모습, 예시). 두 방향의 변위를 함께 보면 축이 평면 안에서 어디로 움직이는지 알 수 있다 (오빗, P5-3). 어느 쪽을 X·Y로 부르는지는 장비 관례를 따른다 — 흔히 구동기 쪽에서 볼 때 Y에서 회전과 상관없이 시계 방향으로 90° 간 쪽을 X라 한다.',
  panels: [
    {
      frame: false,
      height: 220,
      x: { range: X6 },
      y: { range: Y6 },
      series: [],
      annotations: [
        { type: 'line', x1: C6.x, y1: 0.5, x2: C6.x, y2: Y6[1] - 0.3, color: 'muted', dash: true, width: 1.2 },
        { type: 'circle', x: C6.x, y: C6.y, r: C6.r * PX, fill: true, color: 'muted', label: '축' },
        ...probeAt(135),
        ...probeAt(45),
        label6(135, 'Y'),
        label6(45, 'X'),
        { type: 'text', x: C6.x - 0.9, y: C6.y + C6.r + 1.6, text: '45°', anchor: 'end', color: 'muted' },
        { type: 'text', x: C6.x + 0.9, y: C6.y + C6.r + 1.6, text: '45°', anchor: 'start', color: 'muted' },
        { type: 'text', x: C6.x, y: 0.2, text: '수직선', anchor: 'middle', color: 'muted' },
        { type: 'text', x: 15.2, y: 8.6, text: '설치에서 챙길 것', anchor: 'start', bold: true },
        note6(7.4, '· 두 센서를 90° 떨어뜨린다 → 평면 안의 움직임을 다 본다'),
        note6(6.2, '· 베어링 윗덮개 쪽 45°: 떼고 달기 쉽다'),
        note6(5.0, '· 센서 끝끼리 너무 가까우면 서로 간섭한다'),
        note6(3.8, '· 브래킷이 흔들리면 그 흔들림이 섞인다'),
        note6(2.6, '· 센서가 보는 축 표면을 매끈하게 → 런아웃을 줄인다'),
      ],
    },
  ],
};
