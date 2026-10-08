/**
 * P5-3 "2채널 분석" 본문 그림 데이터 (빌드 시 계산, D-026).
 * FRF 예시와 오빗 예시는 랩(LAB-XCH-01·LAB-FULL-01)과 같은 `lib/xchDemo.ts`, 계산은 `lib/dsp/twoChannel.ts`.
 */
import { FIG_LAYOUT, FIG_PLOT_WIDTH, squareYRange, type FigAnnotation, type FigSeries, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { averageCross, coherence, cxAbs, cxArg, frfH1, frfH2, fullSpectrum } from '../lib/dsp/twoChannel';
import { ANTI_F, FREQS, frfFrames, ORBIT_DEMO, orbitSignals, TRUE_H, type OrbitOptions } from '../lib/xchDemo';

const fmt = formatNumber;
const f = Array.from(FREQS);
const db = (v: number) => 20 * Math.log10(Math.max(v, 1e-6));
const deg = (r: number) => (r * 180) / Math.PI;
const wrapDeg = (r: number) => ((((deg(r) + 270) % 360) + 360) % 360) - 270;
const K80 = FREQS.indexOf(80);
const KA = FREQS.indexOf(ANTI_F);
const trueMag = cxAbs(TRUE_H);

const est = (frames: number, inputNoise: number, outputNoise: number) => {
  const { x, y } = frfFrames({ frames, inputNoise, outputNoise });
  const g = averageCross(x, y);
  return { g, x, y, h1: frfH1(g), h2: frfH2(g), coh: coherence(g) };
};
const OUT = est(64, 0, 0.1);
const INP = est(64, 0.3, 0);

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p5-3.test.ts`) */
export const P53_VALUES = (() => {
  const one = est(1, 0, 0.1);
  const c16 = est(16, 0, 0.1).coh;
  const c256 = est(256, 0, 0.1).coh;
  return {
    anti: ANTI_F,
    true80: trueMag[K80],
    trueAnti: trueMag[KA],
    true210: trueMag[FREQS.indexOf(210)],
    ratio1Anti: Math.hypot(one.y[0].re[KA], one.y[0].im[KA]) / Math.hypot(one.x[0].re[KA], one.x[0].im[KA]),
    out: { h1_80: cxAbs(OUT.h1)[K80], h2_80: cxAbs(OUT.h2)[K80], h1Anti: cxAbs(OUT.h1)[KA], h2Anti: cxAbs(OUT.h2)[KA], cohAnti: OUT.coh[KA], coh80: OUT.coh[K80] },
    inp: { h1_80: cxAbs(INP.h1)[K80], h2_80: cxAbs(INP.h2)[K80] },
    coh: { m1: one.coh[KA], m16: c16[KA], m256: c256[KA], m256_80: c256[K80] },
  };
})();
const V = P53_VALUES;

// ── 그림 1: 한 프레임의 나눗셈 ──
const ONE = est(1, 0, 0.1);
const mag = (a: { re: Float64Array; im: Float64Array }) => Array.from(a.re, (v, i) => Math.hypot(v, a.im[i]));

export const ratioOneFrame: FigureSpec = {
  id: 'fig-p5-3-1',
  caption: `그림 1. 받침대에 랜덤 힘을 주고 응답을 잰 한 프레임(예시: 80 Hz·210 Hz 두 공진, 그 사이 ${V.anti} Hz에 반공진). 위: 힘 스펙트럼은 bin마다 들쭉날쭉하다. 가운데: 응답은 두 공진에서 솟는다. 아래: 둘을 나눈 크기(파랑)는 공진 근처에서는 참 FRF(회색 점선)와 비슷하지만, 응답이 작은 반공진 근처에서는 응답 쪽 잡음(응답의 평균 크기의 10 %)이 몇 배로 커져 ${fmt(V.ratio1Anti, 3)}(참값 ${fmt(V.trueAnti, 3)})이 된다.`,
  panels: [
    { title: '힘 (입력) 한 프레임', series: [{ x: f, y: mag(ONE.x[0]), kind: 'line', color: 'c2', width: 1.2 }], x: { range: [0, 400], ticks: [0, 80, 106, 210, 300, 400] }, y: { range: [0, 2.5], ticks: [0, 1, 2], label: '크기' }, height: 90 },
    { title: '응답 (출력) 한 프레임', series: [{ x: f, y: mag(ONE.y[0]), kind: 'line', color: 'c1', width: 1.2 }], x: { range: [0, 400], ticks: [0, 80, 106, 210, 300, 400] }, y: { range: [0, 50], ticks: [0, 25, 50], label: '크기' }, height: 90 },
    {
      title: '응답 ÷ 힘 (한 프레임) vs 참 FRF',
      series: [
        { x: f, y: Array.from(trueMag, db), color: 'muted', dash: true, width: 1.8, label: '참 FRF' },
        { x: f, y: mag(ONE.y[0]).map((v, i) => db(v / Math.max(mag(ONE.x[0])[i], 1e-9))), color: 'c1', width: 1.4, label: '응답 ÷ 힘' },
      ],
      annotations: [{ type: 'vline', x: V.anti, color: 'warn', dash: true, label: `반공진 ${V.anti} Hz` }],
      x: { range: [0, 400], ticks: [0, 80, 106, 210, 300, 400], label: '주파수 [Hz]' },
      y: { range: [-30, 40], ticks: [-20, 0, 20, 40], label: '[dB]' },
      height: 170,
    },
  ],
};

// ── 그림 2: 프레임마다의 화살표 ──
const FR16 = est(16, 0, 0.1);
/** 원점에서 (x, y)로 가는 화살표가 상자를 넘으면 상자 안쪽에서 끝을 자른다 */
const clip = (x: number, y: number, xr: [number, number], yr: [number, number]) => {
  let s = 1;
  if (x > 0) s = Math.min(s, (0.97 * xr[1]) / x);
  if (x < 0) s = Math.min(s, (0.97 * xr[0]) / x);
  if (y > 0) s = Math.min(s, (0.97 * yr[1]) / y);
  if (y < 0) s = Math.min(s, (0.97 * yr[0]) / y);
  return [x * s, y * s];
};
const arrows = (k: number, color: 'muted', xr: [number, number], yr: [number, number]) =>
  FR16.x.map((X, m): FigAnnotation => {
    const Y = FR16.y[m];
    const d = X.re[k] ** 2 + X.im[k] ** 2;
    // Y/X = Y·X*/∣X∣²
    const re = (Y.re[k] * X.re[k] + Y.im[k] * X.im[k]) / d;
    const im = (Y.im[k] * X.re[k] - Y.re[k] * X.im[k]) / d;
    const [ex, ey] = clip(re, im, xr, yr);
    return { type: 'arrow', x1: 0, y1: 0, x2: ex, y2: ey, color, double: false };
  });
const h1_16 = frfH1(FR16.g);
// 가로·세로 축척을 같게 (화살표의 각도가 그대로 보이도록), 패널 높이 210
const XR1: [number, number] = [-32, 32];
const YR1 = (() => {
  const r = squareYRange(XR1, 210);
  const span = r[1] - r[0];
  return [-span + 0.8, 0.8] as [number, number];
})();
const XR2: [number, number] = [-3, 3];
const YR2 = (() => {
  const r = squareYRange(XR2, 210);
  const span = r[1] - r[0];
  return [-span / 2, span / 2] as [number, number];
})();

export const crossArrows: FigureSpec = {
  id: 'fig-p5-3-2',
  caption: `그림 2. 프레임 16장 각각의 "응답 ÷ 힘"을 화살표로 그렸다(회색, 가로 = 실수부, 세로 = 허수부). 위(80 Hz 공진): 화살표가 한 방향(약 −90°)으로 모여 평균(주황)이 참값(초록 점)과 겹친다. 아래(${V.anti} Hz 반공진): 응답이 작아 잡음이 대부분이라 화살표가 사방으로 흩어진다(그림 밖으로 나가는 화살표는 끝을 잘랐다). 교차 스펙트럼은 힘을 위상 기준으로 삼아 이 화살표들을 (힘이 큰 프레임에 더 큰 무게 |X|²를 주어) 평균하는 것이다 — P2-6의 벡터 평균과 같고, 트리거가 필요 없다.`,
  panels: [
    {
      title: '80 Hz (공진)',
      series: [],
      annotations: [
        ...arrows(K80, 'muted', XR1, YR1),
        // 평균 화살표 끝과 참값 점이 거의 겹치므로 글자 하나로 오른쪽에 둔다
        { type: 'arrow', x1: 0, y1: 0, x2: h1_16.re[K80], y2: h1_16.im[K80], color: 'warn', double: false },
        { type: 'point', x: TRUE_H.re[K80], y: TRUE_H.im[K80], color: 'c3', label: `평균 ${fmt(Math.hypot(h1_16.re[K80], h1_16.im[K80]), 3)} · 참값 ${fmt(V.true80, 3)}`, dx: 48, dy: 4 },
      ],
      x: { range: XR1, ticks: [-30, -20, -10, 0, 10, 20, 30], label: '실수부' },
      y: { range: YR1, ticks: [-15, -10, -5, 0], label: '허수부' },
      height: 210,
    },
    {
      title: `${V.anti} Hz (반공진)`,
      series: [],
      annotations: [
        ...arrows(KA, 'muted', XR2, YR2),
        { type: 'arrow', x1: 0, y1: 0, x2: h1_16.re[KA], y2: h1_16.im[KA], color: 'warn', double: false },
        { type: 'point', x: TRUE_H.re[KA], y: TRUE_H.im[KA], color: 'c3' },
        { type: 'text', x: XR2[1] * 0.95, y: YR2[0] * 0.85, text: `초록 점 = 참값 ${fmt(V.trueAnti, 2)}, 주황 = 평균`, anchor: 'end', color: 'c3' },
      ],
      x: { range: XR2, ticks: [-3, -2, -1, 0, 1, 2, 3], label: '실수부' },
      y: { range: YR2, ticks: [-0.5, 0, 0.5], label: '허수부' },
      height: 210,
    },
  ],
};

// ── 그림 3: H1과 H2 ──
const dbs = (a: { re: Float64Array; im: Float64Array }) => Array.from(cxAbs(a), db);
export const h1h2: FigureSpec = {
  id: 'fig-p5-3-3',
  caption: `그림 3. 같은 받침대를 64장 평균해 H1(파랑)과 H2(주황)로 추정했다. 위(응답 쪽 잡음 10 %): H1은 참 FRF(회색 점선)를 따라가고(반공진 근처는 흔들리지만 한쪽으로 쏠리지 않는다), H2는 응답이 작은 반공진에서 ${fmt(V.out.h2Anti, 3)}(참값 ${fmt(V.trueAnti, 3)})로 크게 부푼다(평균을 늘려도 참값이 아니라 약 1.6 둘레로 모인다). 가운데(힘 쪽 잡음 30 %): 이번에는 H2가 맞고, H1이 모든 주파수에서 1/(1 + 0.3²) = 0.92배로 낮다(80 Hz: ${fmt(V.inp.h1_80, 3)}, 참값 ${fmt(V.true80, 3)}). 아래: H1의 위상(응답 쪽 잡음 경우). 공진마다 위상이 180°씩 늦어지고(P1-4), 반공진에서 다시 돌아오며, 잡음이 큰 반공진 근처만 흔들린다.`,
  panels: [
    {
      title: '응답 쪽 잡음 10 %',
      series: [
        { x: f, y: Array.from(trueMag, db), color: 'muted', dash: true, width: 1.8, label: '참 FRF' },
        { x: f, y: dbs(OUT.h1), color: 'c1', width: 1.6, label: 'H1' },
        { x: f, y: dbs(OUT.h2), color: 'c2', width: 1.6, label: 'H2' },
      ],
      annotations: [{ type: 'point', x: V.anti, y: db(V.out.h2Anti), color: 'c2', label: `H2 ${fmt(V.out.h2Anti, 3)}`, dx: 8, dy: -4 }],
      x: { range: [0, 400], ticks: [0, 80, 106, 210, 300, 400] },
      y: { range: [-25, 35], ticks: [-20, 0, 20], label: '[dB]' },
      height: 160,
    },
    {
      title: '힘 쪽 잡음 30 %',
      series: [
        { x: f, y: Array.from(trueMag, db), color: 'muted', dash: true, width: 1.8, label: '참 FRF' },
        { x: f, y: dbs(INP.h1), color: 'c1', width: 1.6, label: 'H1' },
        { x: f, y: dbs(INP.h2), color: 'c2', width: 1.6, label: 'H2' },
      ],
      x: { range: [0, 400], ticks: [0, 80, 106, 210, 300, 400] },
      y: { range: [-25, 35], ticks: [-20, 0, 20], label: '[dB]' },
      height: 160,
      legend: false,
    },
    {
      title: 'H1의 위상 (응답 쪽 잡음 10 %)',
      series: [
        { x: f, y: Array.from(cxArg(TRUE_H), wrapDeg), color: 'muted', dash: true, width: 1.8 },
        { x: f, y: Array.from(cxArg(OUT.h1), wrapDeg), color: 'c1', width: 1.6 },
      ],
      annotations: [
        { type: 'vline', x: 80, color: 'muted', dash: true },
        { type: 'vline', x: 210, color: 'muted', dash: true },
      ],
      x: { range: [0, 400], ticks: [0, 80, 106, 210, 300, 400], label: '주파수 [Hz]' },
      y: { range: [-280, 100], ticks: [-270, -180, -90, 0, 90], label: '위상 [°]' },
      height: 130,
    },
  ],
};

// ── 그림 4: 코히어런스 ──
const C1 = Array.from(est(1, 0, 0.1).coh);
const C16 = Array.from(est(16, 0, 0.1).coh);
const C256 = Array.from(est(256, 0, 0.1).coh);

export const coherenceFig: FigureSpec = {
  id: 'fig-p5-3-4',
  caption: `그림 4. 같은 측정(응답 쪽 잡음 10 %)의 코히어런스 γ². 한 장(M = 1, 회색)은 모든 주파수에서 정확히 1이라 아무것도 알려 주지 않는다. 16장(주황)과 256장(파랑)으로 평균하면 공진 근처는 1에 가깝고(80 Hz: ${fmt(V.coh.m256_80, 3)}), 응답이 작은 반공진에서는 16장 ${fmt(V.coh.m16, 2)}, 256장 ${fmt(V.coh.m256, 2)}로 낮다(이론값 약 0.11). 그 주파수의 응답은 힘으로 설명되지 않는 몫(잡음)이 크다는 뜻이다. 평균이 적으면 코히어런스는 실제보다 높게, 크게 흔들려 나온다.`,
  panels: [
    {
      series: [
        { x: f, y: C1, color: 'muted', width: 2, label: 'M = 1' },
        { x: f, y: C16, color: 'c2', width: 1.6, label: 'M = 16' },
        { x: f, y: C256, color: 'c1', width: 1.8, label: 'M = 256' },
      ],
      annotations: [{ type: 'vline', x: V.anti, color: 'warn', dash: true, label: '반공진' }],
      x: { range: [0, 400], ticks: [0, 80, 106, 210, 300, 400], label: '주파수 [Hz]' },
      y: { range: [0, 1.08], ticks: [0, 0.25, 0.5, 0.75, 1], label: 'γ²' },
      height: 190,
    },
  ],
};

// ── 그림 5·6: Full spectrum ──
const A = 50e-6;
const um = 1e6;
const FMAX = 100;
const fullPanel = (o: OrbitOptions, title: string, last = false, note?: string) => {
  const s = orbitSignals(o);
  const sp = fullSpectrum(s.x, s.y, ORBIT_DEMO.fs);
  const fx: number[] = [];
  const ay: number[] = [];
  sp.freq.forEach((v, i) => {
    if (Math.abs(v) <= FMAX && sp.amp[i] * um > 0.3) {
      fx.push(v);
      ay.push(sp.amp[i] * um);
    }
  });
  // 오빗 끼워 넣기: 패널 오른쪽 위, 반지름 R px, 같은 축척
  const H = 130;
  const yr: [number, number] = [0, 62];
  const R = 34;
  const ux = (2 * FMAX) / FIG_PLOT_WIDTH;
  const uy = (yr[1] - yr[0]) / (H * FIG_LAYOUT.HSCALE);
  const cx = 72;
  const cy = 38;
  const maxA = 60e-6;
  // 한 바퀴(1X 한 주기)만 그린다
  const per = Math.round(ORBIT_DEMO.fs / ORBIT_DEMO.f1);
  const ox = Array.from({ length: per + 1 }, (_, i) => cx + (s.x[i % per] / maxA) * R * ux);
  const oy = Array.from({ length: per + 1 }, (_, i) => cy + (s.y[i % per] / maxA) * R * uy);
  const af = sp.amp[sp.freq.findIndex((v) => Math.abs(v - ORBIT_DEMO.f1) < 1e-9)] * um;
  const ab = sp.amp[sp.freq.findIndex((v) => Math.abs(v + ORBIT_DEMO.f1) < 1e-9)] * um;
  return {
    af,
    ab,
    panel: {
      title,
      series: [
        { x: fx, y: ay, kind: 'stem', color: 'c1' } as FigSeries,
        { x: ox, y: oy, color: 'c3', width: 1.8 } as FigSeries,
        { x: [ox[0]], y: [oy[0]], kind: 'dots', color: 'c3', radius: 3.5 } as FigSeries,
      ],
      annotations: [
        { type: 'vline', x: 0, color: 'muted' },
        { type: 'text', x: -FMAX + 4, y: 56, text: '← 역방향 (시계)', anchor: 'start', color: 'muted' },
        { type: 'text', x: 4, y: 56, text: '정방향 (반시계) →', anchor: 'start', color: 'muted' },
        // 오빗이 도는 방향: 시작점에서 한 바퀴의 1/10만큼 나아간 곳까지
        { type: 'arrow', x1: ox[0], y1: oy[0], x2: ox[Math.round(per / 10)], y2: oy[Math.round(per / 10)], color: 'c3', double: false },
        // 가짜 역방향 글자는 −1X(−50 Hz)의 작은 막대 바로 위에
        ...(note ? [{ type: 'text', x: -ORBIT_DEMO.f1, y: 12, text: note, anchor: 'middle', color: 'warn', bold: true } as FigAnnotation] : []),
      ] as FigAnnotation[],
      x: { range: [-FMAX, FMAX] as [number, number], ticks: [-100, -50, 0, 50, 100], ...(last ? { label: '주파수 [Hz] (− = 역방향)' } : {}) },
      y: { range: yr, ticks: [0, 25, 50], label: '[µm]' },
      height: H,
    },
  };
};

const CASES = [
  fullPanel({ ax: A, ay: A, lagDeg: 90 }, 'Y가 90° 늦음: 반시계 원'),
  fullPanel({ ax: A, ay: A, lagDeg: 45 }, 'Y가 45° 늦음: 반시계 타원'),
  fullPanel({ ax: A, ay: A, lagDeg: 0 }, 'Y가 같은 위상: 비스듬한 직선'),
  fullPanel({ ax: A, ay: A, lagDeg: 270 }, 'Y가 90° 앞섬: 시계 원', true),
];
export const FULL_VALUES = CASES.map((c) => ({ af: c.af, ab: c.ab }));

export const fullIdea: FigureSpec = {
  id: 'fig-p5-3-5',
  caption: `그림 5. X·Y 센서가 모두 1X(50 Hz)를 진폭 50 µm로 읽는 네 경우. 둘의 반쪽 스펙트럼은 네 경우 모두 50 Hz에 50 µm 막대 하나씩으로 똑같다. 다른 것은 X와 Y의 위상차뿐이다. z = x + jy를 FFT한 Full spectrum은 오른쪽(+)에 반시계로 도는 원, 왼쪽(−)에 시계로 도는 원의 반지름을 보인다(오빗은 초록, 점은 시작, 화살표는 도는 방향). 원은 한쪽에만(${fmt(FULL_VALUES[0].af, 3)} µm), 타원은 양쪽에 다른 크기(${fmt(FULL_VALUES[1].af, 3)}·${fmt(FULL_VALUES[1].ab, 3)} µm), 직선은 양쪽이 같은 크기(${fmt(FULL_VALUES[2].af, 3)} µm)로 선다 — P4-2의 정방향·역방향 반지름 Af·Ab를 데이터에서 계산한 것이다.`,
  panels: CASES.map((c) => c.panel),
};

const P1 = fullPanel({ ax: A, ay: A, lagDeg: 90, gainErr: 0.1 }, 'Y 센서 감도가 10 % 큼', false, '가짜 역방향');
const P2 = fullPanel({ ax: A, ay: A, lagDeg: 90, angleErrDeg: 10 }, 'Y 센서가 90°가 아니라 100°에 붙음', true, '가짜 역방향');
export const PREMISE_VALUES = { gainAb: P1.ab, angleAb: P2.ab };

export const premise: FigureSpec = {
  id: 'fig-p5-3-6',
  caption: `그림 6. 축은 그림 5 맨 위처럼 반시계 원(반지름 50 µm)으로 도는데, Y 센서가 조금 틀렸을 때의 Full spectrum. 위: 감도가 10 % 크면 역방향 쪽에 ${fmt(PREMISE_VALUES.gainAb, 2)} µm(반지름의 5 %)가 선다. 아래: 설치 각도가 10° 어긋나면 ${fmt(PREMISE_VALUES.angleAb, 2)} µm(반지름 × sin 5° = 8.7 %)가 선다. Full spectrum은 두 센서가 서로 90°이고 감도가 같다는 전제 위에서만 맞다.`,
  panels: [P1.panel, P2.panel],
};
