/**
 * P5-1 "디지털 필터와 적분" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 필터는 `lib/dsp/filter.ts`, 예시 신호는 랩(LAB-FLT-01·LAB-INT-01)과 같은 `lib/filterDemo.ts`로 만든다.
 * 예시 기계: 1500 rpm (1X = 25 Hz), 기어 맞물림 500 Hz, 저역 통과 4차 f_c = 150 Hz, f_s = 6400 Hz.
 */
import type { FigAnnotation, FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { decimate, designIir, iirResponse, highpassGain } from '../lib/dsp/filter';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';
import { demoAccel, demoFilter, demoIntegrate, edgeOvershoot, demoResponse, demoSamples, FLT_DEMO, INT_DEMO, squareWave, trueVelocity, type DemoFilter } from '../lib/filterDemo';

const fmt = formatNumber;
const db = (m: number) => 20 * Math.log10(Math.max(m, 1e-12));
const deg = (r: number) => (r * 180) / Math.PI;
const logGrid = (lo: number, hi: number, n: number) => Array.from({ length: n }, (_, i) => 10 ** (Math.log10(lo) + ((Math.log10(hi) - Math.log10(lo)) * i) / (n - 1)));
const linGrid = (lo: number, hi: number, n: number) => Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
const fLabel = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));
const logTicks = (vals: number[]) => ({ ticks: vals.map(Math.log10), tickLabels: vals.map((v) => ({ value: Math.log10(v), label: fLabel(v) })) });

const { fs, fc, order } = FLT_DEMO;
const FAMS: { type: DemoFilter; color: 'c1' | 'c2' | 'c3' | 'c4'; label: string }[] = [
  { type: 'butterworth', color: 'c1', label: 'Butterworth' },
  { type: 'chebyshev1', color: 'c2', label: 'Chebyshev (리플 1 dB)' },
  { type: 'bessel', color: 'c3', label: 'Bessel' },
];
const choice = (type: DemoFilter) => ({ type, order, fc, fs, rippleDb: 1 });
const at = (type: DemoFilter, f: number) => demoResponse(choice(type), [f]);

/** 본문·캡션이 인용하는 숫자 (회귀 테스트 `figures-p5-1.test.ts`) */
export const P51_VALUES = (() => {
  const hp = iirResponse(designIir({ family: 'butterworth', kind: 'highpass', order: 2, fc: 5, fs: INT_DEMO.fs }), [1, 25]);
  const fam = Object.fromEntries(
    (['butterworth', 'chebyshev1', 'bessel', 'fir'] as const).map((t) => {
      const r = demoResponse(choice(t), [25, 75, fc, 300, 500]);
      return [t, { db25: db(r.mag[0]), db75: db(r.mag[1]), db300: db(r.mag[3]), db500: db(r.mag[4]), ph25: deg(r.phase[0]), ph75: deg(r.phase[1]), gd25: r.groupDelay[0] * 1e3, gd75: r.groupDelay[1] * 1e3, gdFc: r.groupDelay[2] * 1e3 }];
    }),
  ) as Record<DemoFilter, { db25: number; db75: number; db300: number; db500: number; ph25: number; ph75: number; gd25: number; gd75: number; gdFc: number }>;
  // 사각파 모서리 (−1 → +1)의 넘침 [%]
  const edge = squareEdge();
  const overshoot = Object.fromEntries(edge.lines.map((l) => [l.type, edgeOvershoot(choice(l.type), l.y)])) as Record<DemoFilter, number>;
  // 적분
  const vSpec = (hpHz: number) => {
    const v = demoIntegrate(demoAccel(), 'spectral', 1, hpHz);
    const sp = singleSidedSpectrum({ fs: INT_DEMO.fs, x: v }, { window: 'hann' });
    const df = INT_DEMO.fs / INT_DEMO.n;
    let lowMax = 0;
    for (let k = 1; k < Math.round(5 / df); k++) lowMax = Math.max(lowMax, sp.amplitude[k]);
    return { x1: sp.amplitude[Math.round(25 / df)] * 1e3, lowMax: lowMax * 1e3, sp };
  };
  const drift = (hpHz: number) => {
    const a = demoAccel({ lfNoiseG: 0, offsetG: INT_DEMO.offsetG });
    const v = demoIntegrate(a, 'cumulative', 1, hpHz);
    const d = demoIntegrate(a, 'cumulative', 2, hpHz);
    const i2 = 2 * INT_DEMO.fs;
    let dMax = 0;
    let dLate = 0;
    for (let i = 0; i <= i2; i++) {
      dMax = Math.max(dMax, Math.abs(d[i]));
      if (i >= INT_DEMO.fs) dLate = Math.max(dLate, Math.abs(d[i]));
    }
    return { v, d, v2: v[i2] * 1e3, d2: d[i2] * 1e3, dMax: dMax * 1e3, dLate: dLate * 1e6 };
  };
  return {
    lp: { db300: fam.butterworth.db300, db500: fam.butterworth.db500 },
    hp: { db1: db(hp.mag[0]), x1: hp.mag[1] },
    fam,
    overshoot,
    firDelay: ((FLT_DEMO.firTaps - 1) / 2 / fs) * 1e3,
    v0: vSpec(0),
    v5: vSpec(5),
    v20: vSpec(20),
    drift0: drift(0),
    drift5: drift(5),
    offsetV2: INT_DEMO.offsetG * INT_DEMO.g * 2 * 1e3,
    vStart: trueVelocity(0) * 1e3,
  };
})();

// ── 그림 1: 필터 사양 ──
const fLp = logGrid(10, 3000, 300);
const lpR = demoResponse(choice('butterworth'), fLp);
const fHp = logGrid(0.3, 1000, 300);
const hpD = designIir({ family: 'butterworth', kind: 'highpass', order: 2, fc: 5, fs: INT_DEMO.fs });
const hpR = iirResponse(hpD, fHp);
const V = P51_VALUES;

export const filterSpec: FigureSpec = {
  id: 'fig-p5-1-1',
  caption: `그림 1. 필터의 크기 응답: 성분마다 몇 배로 남기는지를 주파수에 따라 그린 것(가로는 로그 눈금, 세로는 dB). 위: 4차 저역 통과(Butterworth, f_c = 150 Hz). 1X ~ 3X(25 ~ 75 Hz)는 0 dB 근처라 그대로 남고, 맞물림 500 Hz는 ${fmt(V.lp.db500, 3)} dB(약 1/${fmt(1 / 10 ** (V.lp.db500 / 20), 2)})로 깎인다. f_c의 2배인 300 Hz에서 이미 ${fmt(V.lp.db300, 3)} dB — 차수 하나에 약 6 dB씩이다. 아래: 2차 고역 통과(f_c = 5 Hz)는 반대로 낮은 쪽을 깎는다. 1 Hz 흔들림은 ${fmt(V.hp.db1, 3)} dB, 1X는 ${fmt(V.hp.x1, 4)}배로 거의 그대로.`,
  panels: [
    {
      title: '저역 통과: 4차 Butterworth, f_c = 150 Hz (f_s = 6400 Hz)',
      series: [{ x: fLp.map(Math.log10), y: lpR.mag.map(db), color: 'c1', width: 2.4 }],
      annotations: [
        { type: 'band', x1: 1, x2: Math.log10(100), color: 'c3', label: '통과 대역' },
        { type: 'band', x1: Math.log10(100), x2: Math.log10(450), color: 'muted', label: '전이 대역' },
        { type: 'band', x1: Math.log10(450), x2: Math.log10(3000), color: 'warn', label: '차단 대역' },
        { type: 'hline', y: -3, color: 'muted', dash: true },
        { type: 'point', x: Math.log10(fc), y: -3, color: 'text', label: '−3 dB: f_c = 150 Hz', dx: -150, dy: 18 },
        ...[25, 50, 75].map((f): FigAnnotation => ({ type: 'point', x: Math.log10(f), y: db(at('butterworth', f).mag[0]), color: 'c3' })),
        { type: 'text', x: Math.log10(50), y: -12, text: '1X ~ 3X: 그대로', color: 'c3', anchor: 'middle' },
        { type: 'point', x: Math.log10(300), y: V.lp.db300, color: 'c1', label: `300 Hz: ${fmt(V.lp.db300, 3)} dB`, dx: 8, dy: -6 },
        { type: 'point', x: Math.log10(500), y: V.lp.db500, color: 'warn', label: `맞물림 500 Hz: ${fmt(V.lp.db500, 3)} dB`, dx: 8, dy: -6 },
      ],
      x: { range: [1, Math.log10(3000)], ...logTicks([10, 30, 100, 300, 1000, 3000]) },
      y: { range: [-80, 6], ticks: [-80, -60, -40, -20, 0], label: '크기 [dB]' },
      height: 210,
    },
    {
      title: '고역 통과: 2차 Butterworth, f_c = 5 Hz (f_s = 2560 Hz)',
      series: [{ x: fHp.map(Math.log10), y: hpR.mag.map(db), color: 'c1', width: 2.4 }],
      annotations: [
        { type: 'band', x1: Math.log10(0.3), x2: Math.log10(5), color: 'warn', label: '깎는 쪽' },
        { type: 'band', x1: Math.log10(5), x2: 3, color: 'c3', label: '통과 대역' },
        { type: 'hline', y: -3, color: 'muted', dash: true },
        { type: 'point', x: Math.log10(5), y: -3, color: 'text', label: 'f_c = 5 Hz', dx: 8, dy: 14 },
        { type: 'point', x: 0, y: V.hp.db1, color: 'warn', label: `1 Hz 흔들림: ${fmt(V.hp.db1, 3)} dB`, dx: 8, dy: 4 },
        { type: 'point', x: Math.log10(25), y: db(V.hp.x1), color: 'c3', label: '1X 25 Hz: 그대로', dx: 8, dy: 30 },
      ],
      x: { range: [Math.log10(0.3), 3], ...logTicks([0.3, 1, 3, 10, 30, 100, 300, 1000]), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [-60, 6], ticks: [-60, -40, -20, 0], label: '크기 [dB]' },
      height: 190,
    },
  ],
};

// ── 그림 2: 종류별 크기 ──
const fNear = linGrid(0, 250, 251);
const fWide = logGrid(50, 2000, 300);
const respNear = FAMS.map((f) => demoResponse(choice(f.type), fNear));
const respWide = FAMS.map((f) => demoResponse(choice(f.type), fWide));
const fam = V.fam;

export const familyMagnitude: FigureSpec = {
  id: 'fig-p5-1-2',
  caption: `그림 2. 같은 4차, 같은 f_c = 150 Hz라도 종류에 따라 모양이 다르다. 위(통과 대역 확대): Butterworth(파랑)는 f_c 직전까지 평평하고, Chebyshev(주황)는 1 dB 안에서 오르내리며(리플, 25 Hz에서 ${fmt(fam.chebyshev1.db25, 2)} dB), Bessel(초록)은 일찍부터 천천히 내려간다(75 Hz에서 이미 ${fmt(fam.bessel.db75, 2)} dB). 아래(차단 대역): 맞물림 500 Hz를 Chebyshev는 ${fmt(fam.chebyshev1.db500, 3)} dB, Butterworth는 ${fmt(fam.butterworth.db500, 3)} dB, Bessel은 ${fmt(fam.bessel.db500, 3)} dB만 깎는다. Chebyshev는 가파름 대신 통과 대역의 리플을, Bessel은 고른 늦음 대신 일찍 처지는 통과 대역과 완만한 기울기를 내준다(Chebyshev의 f_c는 리플 끝인 −1 dB 점이고, −3 dB 점은 158 Hz다).`,
  panels: [
    {
      title: '통과 대역 가까이 (세로 확대)',
      series: FAMS.map((f, i) => ({ x: fNear, y: respNear[i].mag.map(db), color: f.color, width: 2, label: f.label })),
      annotations: [
        { type: 'hline', y: -3, color: 'muted', dash: true, label: '−3 dB', labelAt: 'start' },
        { type: 'vline', x: fc, color: 'muted', dash: true, label: 'f_c' },
        { type: 'band', x1: 22, x2: 78, color: 'muted', label: '1X ~ 3X' },
      ],
      x: { range: [0, 250], ticks: [0, 25, 50, 75, 100, 150, 200, 250] },
      y: { range: [-6, 1], ticks: [-6, -4, -3, -2, -1, 0, 1], label: '크기 [dB]' },
      height: 200,
    },
    {
      title: '차단 대역 (로그 눈금)',
      series: FAMS.map((f, i) => ({ x: fWide.map(Math.log10), y: respWide[i].mag.map(db), color: f.color, width: 2, label: f.label })),
      annotations: [
        { type: 'vline', x: Math.log10(500), color: 'warn', dash: true, label: '맞물림 500 Hz' },
        // 500 Hz 점의 값은 선이 지나지 않는 오른쪽 위(1.4 kHz 둘레)에 같은 색 글자로 모아 적는다
        ...FAMS.map((f): FigAnnotation => ({ type: 'point', x: Math.log10(500), y: fam[f.type].db500, color: f.color })),
        ...FAMS.map((f, i): FigAnnotation => ({ type: 'text', x: Math.log10(1050), y: -8 - 9 * i, text: `500 Hz: ${fmt(fam[f.type].db500, 3)} dB`, anchor: 'start', color: f.color })),
      ],
      x: { range: [Math.log10(50), Math.log10(2000)], ...logTicks([50, 100, 150, 300, 500, 1000, 2000]), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [-80, 6], ticks: [-80, -60, -40, -20, 0], label: '크기 [dB]' },
      height: 200,
      legend: false,
    },
  ],
};

// ── 그림 3: 위상과 군지연 ──
const fPh = linGrid(0.5, 300, 300);
const respPh = FAMS.map((f) => demoResponse(choice(f.type), fPh));

export const familyPhase: FigureSpec = {
  id: 'fig-p5-1-3',
  caption: `그림 3. 같은 세 필터의 위상(위)과 군지연(아래). 위상은 주파수가 오를수록 더 늦어진다: Butterworth는 1X(25 Hz)에서 ${fmt(-fam.butterworth.ph25, 3)}°, 3X(75 Hz)에서 ${fmt(-fam.butterworth.ph75, 3)}° 늦다. 군지연은 위상이 주파수에 따라 늦어지는 기울기로, 이웃 성분들의 묶음(파형의 덩어리)이 몇 ms 늦게 나오는지다(성분 하나의 늦음은 위상 지연). Bessel(초록)은 통과 대역에서 ${fmt(fam.bessel.gd25, 3)} ms로 거의 평평해 모든 성분이 같이 늦고, Butterworth(파랑)는 ${fmt(fam.butterworth.gd25, 3)} ms에서 f_c의 ${fmt(fam.butterworth.gdFc, 3)} ms로(최대 4.16 ms), Chebyshev(주황)는 f_c에서 ${fmt(fam.chebyshev1.gdFc, 2)} ms(최대 약 8.7 ms)로 솟는다.`,
  panels: [
    {
      title: '위상 (늦은 쪽이 아래)',
      series: FAMS.map((f, i) => ({ x: fPh, y: respPh[i].phase.map(deg), color: f.color, width: 2, label: f.label })),
      annotations: [
        { type: 'vline', x: 25, color: 'muted', dash: true, label: '1X' },
        { type: 'vline', x: 75, color: 'muted', dash: true, label: '3X' },
        { type: 'vline', x: fc, color: 'muted', dash: true, label: 'f_c' },
      ],
      x: { range: [0, 300], ticks: [0, 25, 75, 150, 200, 250, 300] },
      y: { range: [-360, 0], ticks: [-360, -270, -180, -90, 0], label: '위상 [°]' },
      height: 190,
    },
    {
      title: '군지연: 이웃 성분들의 묶음이 몇 ms 늦게 나오나',
      series: FAMS.map((f, i) => ({ x: fPh, y: respPh[i].groupDelay.map((g) => g * 1e3), color: f.color, width: 2, label: f.label })),
      annotations: [
        { type: 'vline', x: 25, color: 'muted', dash: true },
        { type: 'vline', x: 75, color: 'muted', dash: true },
        { type: 'vline', x: fc, color: 'muted', dash: true },
        { type: 'point', x: 75, y: fam.bessel.gd75, color: 'c3', label: `Bessel: ${fmt(fam.bessel.gd75, 3)} ms로 평평`, dx: 8, dy: 16 },
      ],
      x: { range: [0, 300], ticks: [0, 25, 75, 150, 200, 250, 300], label: '주파수 [Hz]' },
      y: { range: [0, 9], ticks: [0, 2, 4, 6, 8], label: '군지연 [ms]' },
      height: 190,
      legend: false,
    },
  ],
};

// ── 그림 4: 사각파 모서리 ──
function squareEdge() {
  const f0 = 10;
  const t0 = -0.5; // 앞부분에서 필터가 자리 잡게
  const n = Math.round((0.03 - t0) * fs);
  const t = Array.from({ length: n }, (_, i) => t0 + i / fs);
  // 모서리가 t = 0에 오도록: t < 0이면 −1쪽 반주기, t ≥ 0이면 +1
  const x = t.map((ti) => squareWave(f0, ti));
  const keep = t.map((ti) => ti >= -0.005);
  const pick = (y: ArrayLike<number>) => Array.from(y).filter((_, i) => keep[i]);
  const tt = pick(t).map((v) => v * 1e3);
  const types: DemoFilter[] = ['butterworth', 'chebyshev1', 'bessel', 'fir'];
  return { t: tt, x: pick(x), lines: types.map((type) => ({ type, y: pick(demoFilter(choice(type), x)) })) };
}
const edge = squareEdge();
const edgeLine = (type: DemoFilter) => edge.lines.find((l) => l.type === type)!.y;

export const squareEdgeFig: FigureSpec = {
  id: 'fig-p5-1-4',
  caption: `그림 4. 사각파(10 Hz)의 모서리를 같은 4차, f_c = 150 Hz 필터에 통과시킨 결과. 회색이 입력이다. 위: Butterworth(파랑)는 모서리 뒤에서 ${fmt(V.overshoot.butterworth, 3)} % 넘쳤다가 출렁이며 자리 잡고, Bessel(초록)은 ${fmt(V.overshoot.bessel, 2)} %로 거의 넘치지 않는다. 아래: Chebyshev(주황)는 ${fmt(V.overshoot.chebyshev1, 3)} %로 더 크게 출렁이고, 짝수 차수라 리플만큼 낮은 0.89(−1 dB)에 자리 잡는다. FIR(보라, 탭 ${FLT_DEMO.firTaps}개)은 출렁임이 모서리 앞뒤로 대칭이고, 전체가 정확히 ${fmt(V.firDelay, 3)} ms 늦다. 넘침과 출렁임은 f_c 근처를 가파르게 자를수록(크기), 늦음이 성분마다 다를수록(위상, 그림 3) 커진다. FIR은 늦음이 고르지만 가파르게 잘라 약 5.9 % 넘친다.`,
  panels: [
    {
      title: 'Butterworth vs Bessel',
      series: [
        { x: edge.t, y: edge.x, color: 'muted', width: 1.6, kind: 'step', label: '입력' },
        { x: edge.t, y: edgeLine('butterworth'), color: 'c1', width: 2.2, label: 'Butterworth' },
        { x: edge.t, y: edgeLine('bessel'), color: 'c3', width: 2.2, label: 'Bessel' },
      ],
      annotations: [{ type: 'hline', y: 1, color: 'muted', dash: true }],
      x: { range: [-5, 30], ticks: [-5, 0, 5, 10, 15, 20, 25, 30] },
      y: { range: [-1.4, 1.5], ticks: [-1, 0, 1], label: '진폭' },
      height: 170,
    },
    {
      title: 'Chebyshev vs FIR (선형 위상)',
      series: [
        { x: edge.t, y: edge.x, color: 'muted', width: 1.6, kind: 'step', label: '입력' },
        { x: edge.t, y: edgeLine('chebyshev1'), color: 'c2', width: 2.2, label: 'Chebyshev' },
        { x: edge.t, y: edgeLine('fir'), color: 'c4', width: 2.2, label: `FIR (${FLT_DEMO.firTaps}탭)` },
      ],
      annotations: [
        { type: 'hline', y: 1, color: 'muted', dash: true },
        { type: 'vline', x: V.firDelay, color: 'c4', dash: true, label: `${fmt(V.firDelay, 3)} ms` },
      ],
      x: { range: [-5, 30], ticks: [-5, 0, 5, 10, 15, 20, 25, 30], label: '모서리부터 시간 [ms]' },
      y: { range: [-1.4, 1.5], ticks: [-1, 0, 1], label: '진폭' },
      height: 170,
    },
  ],
};

// ── 그림 5: 진동 파형을 거르면 ──
const wave = demoSamples(0.6);
const w1 = demoFilter(choice('butterworth'), wave.x);
const w2 = demoFilter(choice('butterworth'), wave.x, true);
const win = (y: ArrayLike<number>) => Array.from(y).slice(Math.round(0.4 * fs), Math.round(0.52 * fs) + 1);
const wt = win(wave.t).map((v) => (v - 0.4) * 1e3);
const mm = (y: number[]) => y.map((v) => v * 1e3);

export const waveDelay: FigureSpec = {
  id: 'fig-p5-1-5',
  caption: `그림 5. 예시 기계(1500 rpm, 1X = 25 Hz)의 속도 파형에서 맞물림 500 Hz 성분을 걷어 내 1X ~ 3X 모양을 보려 한다. 위: 원래 파형(회색)과 걸러서 얻고 싶은 목표(초록 점선). 아래: 4차 Butterworth로 한 번 거르면(파랑) 모양은 목표와 비슷하지만 전체가 약 ${fmt(V.fam.butterworth.gd25, 2)} ms 늦다 — 1X로 치면 위상 ${fmt(-V.fam.butterworth.ph25, 2)}°다. 두 번 거르면(초록 실선, §3) 목표와 겹친다.`,
  panels: [
    {
      title: '원래 파형과 목표 (1X ~ 3X)',
      series: [
        { x: wt, y: mm(win(wave.x)), color: 'muted', width: 1.4, label: '원래 (맞물림 포함)' },
        { x: wt, y: mm(win(wave.target)), color: 'c3', width: 2, dash: true, label: '목표: 1X ~ 3X' },
      ],
      x: { range: [0, 120], ticks: [0, 20, 40, 60, 80, 100, 120] },
      y: { range: [-8, 8], ticks: [-8, -4, 0, 4, 8], label: '속도 [mm/s]' },
      height: 170,
    },
    {
      title: '4차 Butterworth 저역 통과 (f_c = 150 Hz)',
      series: [
        { x: wt, y: mm(win(wave.target)), color: 'muted', width: 1.6, dash: true, label: '목표' },
        { x: wt, y: mm(win(w1)), color: 'c1', width: 2.2, label: '한 번 거름' },
        { x: wt, y: mm(win(w2)), color: 'c3', width: 2, label: '두 번 거름' },
      ],
      x: { range: [0, 120], ticks: [0, 20, 40, 60, 80, 100, 120], label: '시간 [ms]' },
      y: { range: [-8, 8], ticks: [-8, -4, 0, 4, 8], label: '속도 [mm/s]' },
      height: 170,
    },
  ],
};

// ── 그림 6: 두 번 거르기의 응답 ──
const fFf = logGrid(10, 1000, 300);
const ffR = demoResponse(choice('butterworth'), fFf);

export const filtfiltResponse: FigureSpec = {
  id: 'fig-p5-1-6',
  caption: `그림 6. 같은 4차 Butterworth를 한 번(파랑)과 앞뒤로 두 번(초록) 걸었을 때. 위: 두 번 거르면 크기는 제곱이 되어 dB로는 두 배다. f_c에서 −3 dB가 −6 dB가 되고, 500 Hz는 ${fmt(V.lp.db500, 3)} → ${fmt(2 * V.lp.db500, 3)} dB. 아래: 앞으로 늦춘 만큼 거꾸로 거르며 당겨서 위상은 모든 주파수에서 0이다.`,
  panels: [
    {
      title: '크기',
      series: [
        { x: fFf.map(Math.log10), y: ffR.mag.map(db), color: 'c1', width: 2.2, label: '한 번' },
        { x: fFf.map(Math.log10), y: ffR.mag.map((m) => 2 * db(m)), color: 'c3', width: 2.2, label: '두 번 (앞뒤로)' },
      ],
      annotations: [
        { type: 'vline', x: Math.log10(fc), color: 'muted', dash: true },
        { type: 'point', x: Math.log10(fc), y: -3, color: 'c1' },
        { type: 'point', x: Math.log10(fc), y: -6, color: 'c3' },
        { type: 'text', x: Math.log10(40), y: -30, text: 'f_c = 150 Hz에서 한 번 −3 dB, 두 번 −6 dB', color: 'text', anchor: 'middle' },
      ],
      x: { range: [1, 3], ...logTicks([10, 30, 100, 150, 300, 1000]) },
      y: { range: [-90, 6], ticks: [-80, -60, -40, -20, 0], label: '크기 [dB]' },
      height: 180,
    },
    {
      title: '위상',
      series: [
        { x: fFf.map(Math.log10), y: ffR.phase.map(deg), color: 'c1', width: 2.2, label: '한 번' },
        { x: fFf.map(Math.log10), y: fFf.map(() => 0), color: 'c3', width: 2.2, label: '두 번 (앞뒤로)' },
      ],
      annotations: [{ type: 'vline', x: Math.log10(fc), color: 'muted', dash: true }],
      x: { range: [1, 3], ...logTicks([10, 30, 100, 150, 300, 1000]), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [-360, 30], ticks: [-360, -270, -180, -90, 0], label: '위상 [°]' },
      height: 170,
      legend: false,
    },
  ],
};

// ── 그림 7: 적분은 1/(2πf)를 곱하는 필터 ──
const fInt = logGrid(0.1, 1000, 300);
const velGain = (f: number) => 1e3 / (2 * Math.PI * f); // [mm/s] per 1 m/s²
const dispGain = (f: number) => 1e6 / (2 * Math.PI * f) ** 2; // [µm] per 1 m/s²
const mk = (f: number, g: (f: number) => number, unit: string): FigAnnotation => ({ type: 'point', x: Math.log10(f), y: Math.log10(g(f)), color: 'c1', label: `${fLabel(f)} Hz: ${fmt(g(f), 3)} ${unit}`, dx: f >= 100 ? -150 : 8, dy: f >= 100 ? 20 : -6 });
const powTicks = (lo: number, hi: number) => {
  const v: number[] = [];
  for (let e = lo; e <= hi; e++) v.push(e);
  const name = (e: number) => (e >= 6 ? `${10 ** (e - 6)}M` : e >= 3 ? `${10 ** (e - 3)}k` : String(Number((10 ** e).toPrecision(1))));
  return { ticks: v, tickLabels: v.map((e) => ({ value: e, label: name(e) })) };
};

export const integrationGain: FigureSpec = {
  id: 'fig-p5-1-7',
  caption: `그림 7. 가속도 진폭 1 m/s²인 성분이 적분하면 얼마가 되는지를 주파수에 따라 그렸다(양쪽 로그 눈금). 위: 속도 = 가속도 ÷ 2πf. 주파수가 10배 낮아질 때마다 10배 커진다(−20 dB/디케이드). 아래: 변위 = 가속도 ÷ (2πf)², 10배마다 100배. 적분은 낮은 주파수를 키우는 필터다. 초록 점선은 5 Hz 고역 통과를 함께 건 것으로, 5 Hz 아래에서 키움을 멈추게 한다.`,
  panels: [
    {
      title: '가속도 → 속도: × 1/(2πf)',
      series: [
        { x: fInt.map(Math.log10), y: fInt.map((f) => Math.log10(velGain(f))), color: 'c1', width: 2.4, label: '적분만' },
        { x: fInt.map(Math.log10), y: fInt.map((f) => Math.log10(velGain(f) * highpassGain(f, 5))), color: 'c3', width: 2, dash: true, label: '적분 + 5 Hz 고역 통과' },
      ],
      annotations: [mk(1, velGain, 'mm/s'), mk(25, velGain, 'mm/s'), mk(500, velGain, 'mm/s')],
      x: { range: [-1, 3], ...logTicks([0.1, 1, 10, 100, 1000]) },
      y: { range: [-1, 4], ...powTicks(-1, 4), label: '속도 [mm/s]' },
      height: 190,
    },
    {
      title: '가속도 → 변위: × 1/(2πf)²',
      series: [
        { x: fInt.map(Math.log10), y: fInt.map((f) => Math.log10(dispGain(f))), color: 'c1', width: 2.4, label: '적분만' },
        { x: fInt.map(Math.log10), y: fInt.map((f) => Math.log10(dispGain(f) * highpassGain(f, 5) ** 2)), color: 'c3', width: 2, dash: true, label: '두 번 + 5 Hz 고역 통과' },
      ],
      annotations: [mk(1, dispGain, 'µm'), mk(25, dispGain, 'µm'), mk(500, dispGain, 'µm')],
      x: { range: [-1, 3], ...logTicks([0.1, 1, 10, 100, 1000]), label: '주파수 [Hz] (로그 눈금)' },
      y: { range: [-2, 7], ...powTicks(-2, 7), label: '변위 [µm]' },
      height: 200,
      legend: false,
    },
  ],
};

// ── 그림 8: ski-slope와 하한 컷오프 ──
const df = INT_DEMO.fs / INT_DEMO.n;
const specLine = (sp: { amplitude: Float64Array }, f0: number, f1: number) => {
  const k0 = Math.max(1, Math.round(f0 / df));
  const k1 = Math.round(f1 / df);
  const f: number[] = [];
  const y: number[] = [];
  // 높은 쪽은 점이 너무 많으므로 묶어서 최대값만
  for (let k = k0; k <= k1; ) {
    const step = Math.max(1, Math.floor(k / 60));
    let m = 0;
    for (let j = k; j < Math.min(k + step, k1 + 1); j++) m = Math.max(m, sp.amplitude[j]);
    f.push(Math.log10(k * df));
    y.push(Math.log10(Math.max(m * 1e3, 1e-4)));
    k += step;
  }
  return { f, y };
};
const s0 = specLine(V.v0.sp, 0.15, 1000);
const s5 = specLine(V.v5.sp, 0.15, 1000);
const zoom = (sp: { amplitude: Float64Array }) => {
  const k0 = Math.round(10 / df);
  const k1 = Math.round(60 / df);
  const f: number[] = [];
  const y: number[] = [];
  for (let k = k0; k <= k1; k++) {
    f.push(k * df);
    y.push(sp.amplitude[k] * 1e3);
  }
  return { f, y };
};
const z5 = zoom(V.v5.sp);
const z20 = zoom(V.v20.sp);

export const skiSlope: FigureSpec = {
  id: 'fig-p5-1-8',
  caption: `그림 8. 예시 가속도(1X 25 Hz, 2X, 맞물림 500 Hz + 켠 직후의 낮은 주파수 흔들림 ${INT_DEMO.lfNoiseG} g)를 주파수 영역에서 적분한 속도 스펙트럼. 위: 하한 컷오프가 없으면(주황) 5 Hz 아래가 최대 ${fmt(V.v0.lowMax, 3)} mm/s로 솟아 1X(${fmt(V.v0.x1, 3)} mm/s)보다 크다 — P3-4의 ski-slope다. 5 Hz 고역 통과(파랑)를 함께 걸면 ${fmt(V.v5.lowMax, 2)} mm/s로 내려간다. 아래: 컷오프를 20 Hz로 올리면(주황) ski-slope는 더 줄지만 1X도 ${fmt(V.v5.x1, 3)} → ${fmt(V.v20.x1, 3)} mm/s로 깎인다.`,
  panels: [
    {
      title: '속도 스펙트럼 (양쪽 로그 눈금)',
      series: [
        { x: s0.f, y: s0.y, color: 'c2', width: 1.6, label: '컷오프 없음' },
        { x: s5.f, y: s5.y, color: 'c1', width: 1.8, label: '5 Hz 고역 통과' },
      ],
      annotations: [
        { type: 'point', x: Math.log10(25), y: Math.log10(V.v5.x1), color: 'c1', label: `1X ${fmt(V.v5.x1, 3)} mm/s`, dx: 8, dy: -6 },
        { type: 'text', x: Math.log10(0.5), y: Math.log10(V.v0.lowMax) + 0.25, text: 'ski-slope', color: 'c2', anchor: 'middle' },
      ],
      x: { range: [Math.log10(0.15), 3], ...logTicks([0.2, 1, 5, 25, 100, 500]) },
      y: { range: [-3, 2], ...powTicks(-3, 2), label: '속도 [mm/s pk]' },
      height: 210,
    },
    {
      title: '1X 근처 (선형 눈금): 컷오프 5 Hz vs 20 Hz',
      series: [
        { x: z5.f, y: z5.y, color: 'c1', width: 2, label: '5 Hz 고역 통과' },
        { x: z20.f, y: z20.y, color: 'c2', width: 2, label: '20 Hz 고역 통과' },
      ],
      annotations: [
        { type: 'hline', y: INT_DEMO.lines[0].v * 1e3, color: 'muted', dash: true, label: '실제 1X 4 mm/s', labelAt: 'start' },
        { type: 'point', x: 25, y: V.v20.x1, color: 'c2', label: `${fmt(V.v20.x1, 3)} mm/s (−${fmt((1 - V.v20.x1 / V.v5.x1) * 100, 2)} %)`, dx: 8, dy: 4 },
      ],
      x: { range: [10, 60], ticks: [10, 20, 25, 30, 40, 50, 60], label: '주파수 [Hz]' },
      y: { range: [0, 5], ticks: [0, 1, 2, 3, 4, 5], label: '속도 [mm/s pk]' },
      height: 170,
      legend: true,
    },
  ],
};

// ── 그림 9: 시간 영역 적분과 드리프트 ──
const DEC = 4;
const nShow = 2 * INT_DEMO.fs + 1;
const td = Array.from({ length: Math.ceil(nShow / DEC) }, (_, i) => (i * DEC) / INT_DEMO.fs);
const thin = (y: ArrayLike<number>, k: number) => Array.from({ length: Math.ceil(nShow / DEC) }, (_, i) => y[i * DEC] * k);

export const driftFig: FigureSpec = {
  id: 'fig-p5-1-9',
  caption: `그림 9. 같은 기계 가속도에 직류 오프셋 ${INT_DEMO.offsetG} g(${fmt(INT_DEMO.offsetG * INT_DEMO.g * 1e3, 3)} mm/s²)만 있을 때, 샘플을 차례로 더해(누적합) 적분했다. 위: 오프셋이 속도를 1초에 ${fmt(V.offsetV2 / 2, 3)} mm/s씩 끌고 가서 2초 동안 ${fmt(V.drift0.v2, 3)} mm/s 떠내려간다(주황). 누적합은 처음 속도를 모르므로 곡선 전체가 약 ${fmt(V.vStart, 2)} mm/s 아래로 밀려 있기도 하다. 5 Hz 고역 통과를 먼저 걸면(파랑) 실제 속도 범위(±${fmt(INT_DEMO.lines.reduce((s, l) => s + l.v, 0) * 1e3, 2)} mm/s) 근처에 머문다. 아래: 한 번 더 적분한 변위는 두 오차가 다시 쌓여 2초 안에 ${fmt(V.drift0.dMax, 3)} mm까지 벗어나지만(실제 변위는 30 µm Peak 남짓, 약 61 µm p-p), 고역 통과를 먼저 건 쪽은 1초 뒤부터 ${fmt(V.drift5.dLate, 2)} µm 안이다.`,
  panels: [
    {
      title: '속도 (가속도를 한 번 누적합)',
      series: [
        { x: td, y: thin(V.drift0.v, 1e3), color: 'c2', width: 1.2, label: '그대로 적분' },
        { x: td, y: thin(V.drift5.v, 1e3), color: 'c1', width: 1.2, label: '5 Hz 고역 통과 후 적분' },
      ],
      x: { range: [0, 2], ticks: [0, 0.5, 1, 1.5, 2] },
      y: { range: [-12, 18], ticks: [-10, 0, 10], label: '속도 [mm/s]' },
      height: 180,
    },
    {
      title: '변위 (한 번 더 누적합)',
      series: [
        { x: td, y: thin(V.drift0.d, 1e3), color: 'c2', width: 1.6, label: '그대로 적분' },
        { x: td, y: thin(V.drift5.d, 1e3), color: 'c1', width: 1.6, label: '5 Hz 고역 통과 후 적분' },
      ],
      x: { range: [0, 2], ticks: [0, 0.5, 1, 1.5, 2], label: '시간 [s]' },
      y: { range: [-2, 2], ticks: [-2, -1, 0, 1, 2], label: '변위 [mm]' },
      height: 160,
      legend: false,
    },
  ],
};

// ── 그림 10: 데시메이션 ──
export const DEC_DEMO = (() => {
  const fsHi = 12800;
  const n = 16384;
  const x = Float64Array.from({ length: n }, (_, i) => Math.cos((2 * Math.PI * 100 * i) / fsHi) + 0.5 * Math.cos((2 * Math.PI * 1300 * i) / fsHi + 0.7));
  const spec = (y: Float64Array, f: number) => singleSidedSpectrum({ fs: f, x: y });
  const raw = decimate(x, fsHi, 8, false);
  const filt = decimate(x, fsHi, 8, true);
  return { fsHi, orig: spec(x, fsHi), raw: spec(raw.x, raw.fs), filt: spec(filt.x, filt.fs), fsLo: raw.fs };
})();
const stems = (sp: { frequency: Float64Array; amplitude: Float64Array }, fMax: number) => {
  const f: number[] = [];
  const y: number[] = [];
  sp.frequency.forEach((fv, k) => {
    if (fv <= fMax && sp.amplitude[k] > 0.02) {
      f.push(fv);
      y.push(sp.amplitude[k]);
    }
  });
  return { f, y };
};
const dO = stems(DEC_DEMO.orig, 2000);
const dR = stems(DEC_DEMO.raw, 800);
const dF = stems(DEC_DEMO.filt, 800);
const amp300 = (sp: { frequency: Float64Array; amplitude: Float64Array }) => sp.amplitude[Math.round(300 / (sp.frequency[1] - sp.frequency[0]))];
export const DEC_VALUES = { alias: amp300(DEC_DEMO.raw), filtered: amp300(DEC_DEMO.filt) };

export const decimationFig: FigureSpec = {
  id: 'fig-p5-1-10',
  caption: `그림 10. f_s = 12 800 Hz로 잰 신호(100 Hz와 1300 Hz)를 8개마다 하나만 남겨 f_s = 1600 Hz로 줄인다(데시메이션). 새 나이퀴스트 주파수는 800 Hz다. 가운데: 거르지 않고 줄이면 1300 Hz가 |1300 − 1600| = 300 Hz로 접혀 가짜 막대(${fmt(DEC_VALUES.alias, 2)})가 선다 — P2-3의 에일리어싱과 같다. 아래: 저역 통과를 먼저 걸고 줄이면 가짜 막대가 없다.`,
  panels: [
    {
      title: '원래 (f_s = 12 800 Hz)',
      series: [{ x: dO.f, y: dO.y, kind: 'stem', color: 'c1' }],
      annotations: [{ type: 'vline', x: 800, color: 'warn', dash: true, label: '새 나이퀴스트 800 Hz' }],
      x: { range: [0, 2000], ticks: [0, 100, 500, 800, 1000, 1300, 1500, 2000] },
      y: { range: [0, 1.2], ticks: [0, 0.5, 1], label: '진폭' },
      height: 130,
    },
    {
      title: '거르지 않고 8개마다 하나 (f_s = 1600 Hz)',
      series: [{ x: dR.f, y: dR.y, kind: 'stem', color: 'c1' }],
      annotations: [{ type: 'point', x: 300, y: DEC_VALUES.alias, color: 'warn', label: '300 Hz: 접혀 온 가짜', dx: 8, dy: -4 }],
      x: { range: [0, 800], ticks: [0, 100, 200, 300, 400, 500, 600, 700, 800] },
      y: { range: [0, 1.2], ticks: [0, 0.5, 1], label: '진폭' },
      height: 120,
    },
    {
      title: '저역 통과 후 8개마다 하나',
      series: [{ x: dF.f, y: dF.y, kind: 'stem', color: 'c3' }],
      x: { range: [0, 800], ticks: [0, 100, 200, 300, 400, 500, 600, 700, 800], label: '주파수 [Hz]' },
      y: { range: [0, 1.2], ticks: [0, 0.5, 1], label: '진폭' },
      height: 120,
    },
  ],
};
