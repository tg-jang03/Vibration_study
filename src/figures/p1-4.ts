/**
 * P1-4 "윈도우" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 스펙트럼은 랩(LAB-WIN-01)과 같은 조건: f_s = 1024 Hz, N = 1024 → Δf = 1 Hz, T = 1 s.
 * 색은 그림마다 같게 쓴다: Uniform c1, Hann c3, Flat top c2, Blackman-Harris c4.
 */
import { grid, type FigAnnotation, type FigColor, type FigPanel, type FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { fft, zeroPad } from '../lib/dsp/fft';
import { acquire } from '../lib/dsp/sampling';
import type { SignalComponent } from '../lib/dsp/signal';
import { singleSidedSpectrum } from '../lib/dsp/spectrum';
import { createWindow, type WindowType } from '../lib/dsp/window';

const FS = 1024;
const N = 1024;
const DB_FLOOR = -120;
const toDb = (a: number) => Math.max(DB_FLOOR, 20 * Math.log10(Math.max(a, 1e-12)));
const WIN_COLOR: Record<'uniform' | 'hann' | 'flatTop' | 'blackmanHarris', FigColor> = {
  uniform: 'c1',
  hann: 'c3',
  flatTop: 'c2',
  blackmanHarris: 'c4',
};
const WIN_NAME = { uniform: 'Uniform (윈도우 없음)', hann: 'Hann', flatTop: 'Flat top', blackmanHarris: 'Blackman-Harris' } as const;

function spectrum(components: SignalComponent[], window: WindowType) {
  return singleSidedSpectrum(acquire({ components }, { fs: FS, n: N }), { window });
}
const tone = (freq: number, amp = 1): SignalComponent => ({ type: 'sine', freq, amp });
function band(spec: { frequency: Float64Array; amplitude: Float64Array }, lo: number, hi: number) {
  const f: number[] = [];
  const a: number[] = [];
  for (let i = 0; i < spec.frequency.length; i++) {
    if (spec.frequency[i] >= lo && spec.frequency[i] <= hi) {
      f.push(spec.frequency[i]);
      a.push(spec.amplitude[i]);
    }
  }
  return { f, a, db: a.map(toDb) };
}
const at = (b: { f: number[]; a: number[] }, freq: number) => b.a[b.f.indexOf(freq)];

// 그림 1 — FFT는 프레임이 계속 되풀이된다고 본다: 끝과 시작이 이어지나?
function framePanel(cycles: number, title: string, last: boolean): FigPanel {
  const t = grid(0, 1, 600);
  const x = t.map((tt) => Math.sin(2 * Math.PI * cycles * tt));
  return {
    title,
    series: [
      { x: t, y: x, color: 'c1', width: 2.2, label: '잰 프레임 (1초)' },
      { x: t.map((tt) => tt + 1), y: x, color: 'muted', dash: true, width: 1.8, label: 'FFT가 가정하는 다음 반복' },
    ],
    annotations: [
      { type: 'vline', x: 1, label: '프레임 경계', color: 'warn', dash: true },
      ...(Number.isInteger(cycles)
        ? []
        : [{ type: 'arrow' as const, x1: 1.06, y1: Math.sin(2 * Math.PI * cycles), x2: 1.06, y2: 0, double: true, label: '끊김(불연속)', color: 'warn' as const }]),
    ],
    x: last ? { range: [0, 2], ticks: [0, 0.5, 1, 1.5, 2], label: '시간 [s]' } : { range: [0, 2], ticks: 'none' },
    y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
    height: last ? 130 : 115,
    legend: !last,
  };
}
export const frameEnds: FigureSpec = {
  id: 'fig-4-1',
  caption:
    '그림 1. FFT는 잰 1초 프레임이 앞뒤로 똑같이 되풀이된다고 보고 계산한다(점선). 위: 프레임 안에 정확히 3주기가 들어가면 끝과 다음 시작이 매끄럽게 이어져, 에너지가 3 Hz bin 하나에 모인다. 아래: 3.5주기면 프레임 경계에서 신호가 뚝 끊긴다. 이 끊김을 만들려면 여러 주파수가 필요하므로, 에너지가 주변 bin들로 새어 나간다 — 누설이다.',
  panels: [framePanel(3, '3.0주기: 끝과 시작이 이어진다', false), framePanel(3.5, '3.5주기: 경계에서 끊긴다', true)],
};

// 그림 2 — 윈도우 없이(Uniform) 60.0 Hz와 60.5 Hz를 잰 스펙트럼
const u60 = band(spectrum([tone(60)], 'uniform'), 50, 70);
const u605 = band(spectrum([tone(60.5)], 'uniform'), 50, 70);
const u605wide = band(spectrum([tone(60.5)], 'uniform'), 30, 90);
const uPeak = Math.max(...u605.a);
const uFar = toDb(at(u605wide, 70));
export const leakage: FigureSpec = {
  id: 'fig-4-2',
  caption: `그림 2. 진폭 1인 정현파를 윈도우 없이 1초 동안 잰 스펙트럼 (Δf = 1 Hz). 위: 60.0 Hz는 1초에 정확히 60주기라 60 Hz 막대 하나에 높이 1로 모인다. 가운데: 60.5 Hz는 60.5주기라 프레임 끝이 끊기고(그림 1), 에너지가 양옆 막대로 새면서 가장 높은 막대도 ${formatNumber(uPeak, 2)}로 낮아진다. 아래: 가운데와 같은 스펙트럼을 dB로 그리면, 10 bin 떨어진 70 Hz에도 ${formatNumber(uFar, 2)} dB(약 1/30)가 남아 있다. 새어 나간 에너지가 아주 멀리까지 깔린다.`,
  panels: [
    {
      title: '60.0 Hz (1초에 정확히 60주기): 막대 하나',
      series: [{ x: u60.f, y: u60.a, kind: 'stem', color: 'c1', width: 2.6, radius: 3.6 }],
      x: { range: [50, 70], ticks: 'none' },
      y: { range: [0, 1.2], ticks: [0, 0.5, 1] },
      height: 95,
    },
    {
      title: '60.5 Hz (60.5주기): 옆으로 퍼지고 낮아진다',
      series: [{ x: u605.f, y: u605.a, kind: 'stem', color: 'c1', width: 2.6, radius: 3.6 }],
      annotations: [
        { type: 'vline', x: 60.5, color: 'warn', dash: true },
        { type: 'text', x: 61, y: uPeak, text: `가장 높은 막대 ${formatNumber(uPeak, 2)}`, dx: 10, dy: 4, color: 'c1', bold: true },
      ],
      x: { range: [50, 70], ticks: [50, 55, 60, 65, 70], label: '주파수 [Hz]' },
      y: { range: [0, 1.2], ticks: [0, 0.5, 1] },
      height: 110,
    },
    {
      title: '같은 60.5 Hz를 dB로 보면: 멀리까지 깔린다',
      series: [
        { x: u605wide.f, y: u605wide.db, color: 'c1', width: 1.4 },
        { x: u605wide.f, y: u605wide.db, kind: 'dots', color: 'c1', radius: 2.6 },
      ],
      annotations: [{ type: 'point', x: 70, y: uFar, label: `10 bin 떨어진 곳: ${formatNumber(uFar, 2)} dB`, color: 'warn', dx: 10, dy: -8 }],
      x: { range: [30, 90], ticks: [30, 40, 50, 60, 70, 80, 90], label: '주파수 [Hz]' },
      y: { range: [-60, 5], ticks: [-60, -40, -20, 0], label: '[dB]' },
      height: 130,
    },
  ],
};

// 그림 3 — 윈도우: 프레임 양 끝을 0으로 줄인다
const tw = grid(0, 1, 600);
const hannCurve = tw.map((t) => 0.5 - 0.5 * Math.cos(2 * Math.PI * t));
const raw35 = tw.map((t) => Math.sin(2 * Math.PI * 3.5 * t));
const win35 = raw35.map((v, i) => v * hannCurve[i]);
export const windowTime: FigureSpec = {
  id: 'fig-4-3',
  caption:
    '그림 3. 그림 1 아래의 3.5주기 신호에 Hann 윈도우를 곱한 모습. 위: Hann 가중치(주황 점선)는 프레임 가운데에서 1, 양 끝에서 0인 종 모양이다. 아래: 곱한 신호는 양 끝이 0으로 모이므로, FFT가 가정하는 다음 반복(점선)과 경계에서 끊김 없이 이어진다. 끊김이 없으니 멀리까지 새는 에너지가 크게 줄어든다.',
  panels: [
    {
      title: '원래 신호와 Hann 가중치',
      series: [
        { x: tw, y: raw35, color: 'c1', width: 1.8, label: '잰 신호 (3.5주기)' },
        { x: tw, y: hannCurve, color: 'warn', dash: true, width: 2.2, label: 'Hann 가중치 w(t)' },
      ],
      x: { range: [0, 2], ticks: 'none' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
      height: 115,
    },
    {
      title: '가중치를 곱한 신호: 양 끝이 0이라 반복해도 끊기지 않는다',
      series: [
        { x: tw, y: win35, color: 'c3', width: 2.2, label: '곱한 신호' },
        { x: tw.map((t) => t + 1), y: win35, color: 'muted', dash: true, width: 1.8, label: 'FFT가 가정하는 다음 반복' },
      ],
      annotations: [{ type: 'vline', x: 1, label: '프레임 경계', color: 'warn', dash: true }],
      x: { range: [0, 2], ticks: [0, 0.5, 1, 1.5, 2], label: '시간 [s]' },
      y: { range: [-1.3, 1.3], ticks: [-1, 0, 1] },
      height: 130,
    },
  ],
};

// 그림 4 — 같은 60.5 Hz: 윈도우 없음 vs Hann (dB)
const h605 = band(spectrum([tone(60.5)], 'hann'), 30, 90);
const hPeak = Math.max(...h605.a);
const hFar = toDb(at(h605, 70));
const dbPanel = (title: string, b: { f: number[]; db: number[] }, color: FigColor, far: number, last: boolean): FigPanel => ({
  title,
  series: [
    { x: b.f, y: b.db, color, width: 1.4 },
    { x: b.f, y: b.db, kind: 'dots', color, radius: 2.6 },
  ],
  annotations: [
    { type: 'vline', x: 60.5, color: 'warn', dash: true },
    { type: 'point', x: 70, y: far, label: `70 Hz: ${formatNumber(far, 2)} dB`, color: 'warn', dx: 10, dy: -8 },
  ],
  x: last ? { range: [30, 90], ticks: [30, 40, 50, 60, 70, 80, 90], label: '주파수 [Hz]' } : { range: [30, 90], ticks: 'none' },
  y: { range: [-100, 5], ticks: [-100, -80, -60, -40, -20, 0], label: '[dB]' },
  height: last ? 125 : 110,
});
export const uniformVsHann: FigureSpec = {
  id: 'fig-4-4',
  caption: `그림 4. 같은 60.5 Hz 신호(진폭 1)를 윈도우 없이(위)와 Hann 윈도우로(아래) 잰 dB 스펙트럼. Hann은 가운데 봉우리가 조금 넓어지지만, 10 bin 떨어진 70 Hz의 누설이 ${formatNumber(uFar, 2)} dB에서 ${formatNumber(hFar, 2)} dB로 약 ${formatNumber(Math.round(uFar - hFar), 2)} dB(1/100) 내려가고, 가장 높은 막대도 ${formatNumber(uPeak, 2)} → ${formatNumber(hPeak, 2)}로 실제 값 1에 가까워진다.`,
  panels: [
    dbPanel('윈도우 없음 (Uniform)', u605wide, 'c1', uFar, false),
    dbPanel('Hann 윈도우', h605, 'c3', hFar, true),
  ],
};

// 그림 5 — 성분이 bin 사이 어디에 있느냐에 따라 가장 높은 막대가 깎이는 정도 (가리비 모양)
const SC_WINDOWS = ['uniform', 'hann', 'flatTop'] as const;
const scF = grid(59, 62, 151);
const scallopCurves = SC_WINDOWS.map((w) => ({
  w,
  y: scF.map((f) => {
    const s = spectrum([tone(f)], w);
    let m = 0;
    for (let k = 56; k <= 65; k++) m = Math.max(m, s.amplitude[k]);
    return m;
  }),
}));
const MID = scF.findIndex((f) => Math.abs(f - 60.5) < 1e-9);
const mid = (w: (typeof SC_WINDOWS)[number]) => scallopCurves.find((c) => c.w === w)!.y[MID];
export const scallop: FigureSpec = {
  id: 'fig-4-5',
  caption: `그림 5. 진폭 1인 성분의 주파수를 59 Hz에서 62 Hz까지 조금씩 옮기며, 스펙트럼에서 가장 높은 막대의 높이를 그렸다 (Δf = 1 Hz, 세로축은 0.55부터). 성분이 눈금(59, 60, 61, 62 Hz) 위에 있으면 모두 1이지만, 눈금 한가운데(예: 60.5 Hz)에서는 윈도우 없음 ${formatNumber(mid('uniform'), 2)}, Hann ${formatNumber(mid('hann'), 2)}, Flat top ${formatNumber(mid('flatTop'), 3)}으로 깎인다. 눈금마다 되풀이되는 아치 모양 때문에 이 깎임을 가리비 손실(Scallop Loss)이라 부른다.`,
  panels: [
    {
      series: scallopCurves.map((c) => ({ x: scF, y: c.y, color: WIN_COLOR[c.w], width: 2.4, label: WIN_NAME[c.w] })),
      annotations: [59, 60, 61, 62].map((f) => ({ type: 'vline' as const, x: f, color: 'muted' as const, dash: true })),
      x: { range: [59, 62], ticks: [59, 59.5, 60, 60.5, 61, 61.5, 62], label: '성분의 주파수 [Hz] (눈금 = 59, 60, 61, 62 Hz)' },
      y: { range: [0.55, 1.05], ticks: [0.6, 0.7, 0.8, 0.9, 1], label: '가장 높은 막대' },
      height: 200,
    },
  ],
};

// 그림 6 — 윈도우 모양을 주파수로 본 것: 메인로브와 사이드로브
const KW = ['uniform', 'hann', 'flatTop', 'blackmanHarris'] as const;
const KN = 512;
const KPAD = 16;
const kernels = KW.map((w) => {
  const r = fft(zeroPad(createWindow(w, KN), KN * KPAD));
  const dc = Math.hypot(r.real[0], r.imag[0]);
  const count = 12 * KPAD + 1;
  const x = Array.from({ length: count }, (_, k) => k / KPAD);
  const mag = x.map((_, k) => Math.hypot(r.real[k], r.imag[k]) / dc);
  return { w, x, mag, db: mag.map(toDb) };
});
const sideLevel = (w: (typeof KW)[number], from: number) => {
  const k = kernels.find((c) => c.w === w)!;
  return Math.max(...k.db.filter((_, i) => k.x[i] >= from));
};
const side = { uniform: sideLevel('uniform', 1), hann: sideLevel('hann', 2), flatTop: sideLevel('flatTop', 5), blackmanHarris: sideLevel('blackmanHarris', 4) };
export const kernelShapes: FigureSpec = {
  id: 'fig-4-6',
  caption: `그림 6. 진폭 1인 성분 하나가 각 윈도우에서 어떤 모양으로 그려지는지를, 성분에서 떨어진 거리(bin)에 따라 그렸다. 위(그대로의 높이): 가운데 봉우리 — 메인로브 — 가 처음 0이 되는 곳이 윈도우 없음 1 bin, Hann 2 bin, Blackman-Harris 4 bin, Flat top 5 bin이다. 봉우리가 넓을수록 가까운 두 성분이 하나로 뭉치기 쉽다. 아래(dB): 메인로브 바깥의 작은 봉우리들 — 사이드로브 — 의 가장 높은 값(점선)이 윈도우 없음 ${formatNumber(side.uniform, 3)} dB, Hann ${formatNumber(side.hann, 3)} dB, Blackman-Harris ${formatNumber(side.blackmanHarris, 3)} dB, Flat top ${formatNumber(side.flatTop, 3)} dB이다. 사이드로브가 낮을수록 큰 성분 옆의 작은 성분이 덜 가려진다.`,
  panels: [
    {
      title: '그대로의 높이: 메인로브 폭',
      series: kernels.map((k) => ({ x: k.x, y: k.mag, color: WIN_COLOR[k.w], width: 2.2, label: WIN_NAME[k.w] })),
      annotations: [
        { type: 'point', x: 1, y: 0, label: '1', color: 'c1', dx: -4, dy: -10 },
        { type: 'point', x: 2, y: 0, label: '2', color: 'c3', dx: -4, dy: -10 },
        { type: 'point', x: 4, y: 0, label: '4', color: 'c4', dx: -4, dy: -10 },
        { type: 'point', x: 5, y: 0, label: '5', color: 'c2', dx: -4, dy: -10 },
      ],
      x: { range: [0, 6], ticks: [0, 1, 2, 3, 4, 5, 6] },
      y: { range: [0, 1.08], ticks: [0, 0.5, 1] },
      height: 150,
    },
    {
      title: 'dB로 본 높이: 사이드로브 높이',
      series: kernels.map((k) => ({ x: k.x, y: k.db, color: WIN_COLOR[k.w], width: 1.8, label: WIN_NAME[k.w] })),
      // 가장 높은 사이드로브 높이 (값은 캡션에). 글자는 곡선과 겹치므로 선만 긋는다
      annotations: [
        { type: 'hline', y: side.uniform, color: 'c1' },
        { type: 'hline', y: side.hann, color: 'c3' },
        { type: 'hline', y: side.blackmanHarris, color: 'c4' },
      ],
      x: { range: [0, 12], ticks: [0, 2, 4, 6, 8, 10, 12], label: '성분에서 떨어진 거리 [bin]' },
      y: { range: [-120, 5], ticks: [-120, -100, -80, -60, -40, -20, 0], label: '[dB]' },
      height: 190,
      legend: false,
    },
  ],
};

// 그림 7 — 큰 성분 옆의 작은 성분 (−70 dB, 8 bin 떨어짐)
const SMALL_DB = -70;
const BIG_F = 100.5;
const SMALL_F = 108.5;
const drComponents = [tone(BIG_F), tone(SMALL_F, 10 ** (SMALL_DB / 20))];
const drWindows = ['uniform', 'hann', 'blackmanHarris'] as const;
const dr = drWindows.map((w) => {
  const withSmall = band(spectrum(drComponents, w), 85, 125);
  const bigOnly = band(spectrum([tone(BIG_F)], w), 85, 125);
  return { w, b: withSmall, leakAtSmall: Math.max(toDb(at(bigOnly, 108)), toDb(at(bigOnly, 109))) };
});
const drTitle = {
  uniform: '윈도우 없음: 큰 성분의 누설에 완전히 묻힌다',
  hann: 'Hann: 아직 묻힌다',
  blackmanHarris: 'Blackman-Harris: 작은 성분이 드러난다',
} as const;
export const dynamicRange: FigureSpec = {
  id: 'fig-4-7',
  caption: `그림 7. 큰 성분(${BIG_F} Hz, 진폭 1)에서 8 bin 떨어진 곳(${SMALL_F} Hz, 주황 점선)에 ${formatNumber(SMALL_DB)} dB(약 1/3000) 작은 성분이 있다. 작은 성분 자리에 큰 성분이 흘린 누설은 윈도우 없음 ${formatNumber(dr[0].leakAtSmall, 2)} dB, Hann ${formatNumber(dr[1].leakAtSmall, 2)} dB, Blackman-Harris ${formatNumber(dr[2].leakAtSmall, 2)} dB이다. 이 누설보다 작은 성분이 커야 보인다. 작은 성분이 −50 dB였다면 Hann으로도 보였을 것이다.`,
  panels: dr.map((d, i) => ({
    title: drTitle[d.w],
    series: [
      { x: d.b.f, y: d.b.db, color: WIN_COLOR[d.w], width: 1.4 },
      { x: d.b.f, y: d.b.db, kind: 'dots', color: WIN_COLOR[d.w], radius: 2.4 },
    ],
    annotations: [{ type: 'vline', x: SMALL_F, color: 'warn', dash: true, label: i === 0 ? `작은 성분 (${formatNumber(SMALL_DB)} dB)` : undefined }] as FigAnnotation[],
    x: i === dr.length - 1 ? { range: [85, 125], ticks: [85, 90, 95, 100, 105, 110, 115, 120, 125], label: '주파수 [Hz]' } : { range: [85, 125], ticks: 'none' },
    y: { range: [-120, 5], ticks: [-120, -90, -60, -30, 0], label: '[dB]' },
    height: i === dr.length - 1 ? 120 : 105,
  })),
};

// 그림 8 — 진폭 보정과 에너지 보정의 차이: w의 평균과 w²의 평균
const hannSq = hannCurve.map((v) => v * v);
export const windowAverages: FigureSpec = {
  id: 'fig-4-8',
  caption:
    '그림 8. Hann 가중치 w(t)(파랑)와 그 제곱 w²(t)(초록). 정현파 막대의 높이는 신호에 w를 곱한 만큼 줄어드는데, w의 평균이 0.5이므로 막대가 절반이 된다 → 2배 해 주는 진폭 보정(ACF = 2). 잡음처럼 넓게 퍼진 신호는 에너지(제곱)로 따지므로 w²의 평균 0.375만큼 줄어든다 → 에너지를 되돌리려면 1/√0.375 ≈ 1.63배 하는 에너지 보정(ECF ≈ 1.63). 두 평균이 다르기 때문에 보정도 두 가지가 필요하다.',
  panels: [
    {
      series: [
        { x: tw, y: hannCurve, color: 'c1', width: 2.4, label: '가중치 w(t)' },
        { x: tw, y: hannSq, color: 'c3', width: 2.4, label: '가중치의 제곱 w²(t)' },
      ],
      annotations: [
        { type: 'hline', y: 0.5, label: 'w의 평균 0.5', color: 'c1', labelAt: 'start' },
        { type: 'hline', y: 0.375, label: 'w²의 평균 0.375', color: 'c3', labelAt: 'start', labelBelow: true },
      ],
      x: { range: [0, 1], ticks: [0, 0.25, 0.5, 0.75, 1], label: '프레임 안의 시간 (0 = 시작, 1 = 끝)' },
      y: { range: [0, 1.08], ticks: [0, 0.25, 0.5, 0.75, 1] },
      height: 180,
    },
  ],
};
