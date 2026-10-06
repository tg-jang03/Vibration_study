/**
 * P1-8 "측정 설정 종합" 본문 그림 데이터 (빌드 시 계산, D-026).
 * 신호와 측정은 랩(LAB-SBX-01)과 같은 `src/lib/sandbox.ts`를 쓴다. 표시만 mm/s (D-012).
 */
import type { FigAnnotation, FigPanel, FigureSpec } from '../lib/figure';
import { formatNumber } from '../lib/format';
import { DEFAULT_MACHINE, DEFAULT_SETTINGS, MACHINE_CONST, RECIPES, runSandbox, type Settings } from '../lib/sandbox';

const MM = 1000;
const f1 = DEFAULT_MACHINE.rpm / 60;
const mesh = MACHINE_CONST.teethA * f1;
const fb = (f1 * MACHINE_CONST.teethA) / MACHINE_CONST.teethB;
const view = (r: ReturnType<typeof runSandbox>, f0: number, f1v: number, db = false) => {
  const a = Math.max(0, Math.round(f0 / r.df));
  const b = Math.min(r.rms.length - 1, Math.round(f1v / r.df));
  const x = Array.from(r.frequency.slice(a, b + 1));
  const y = Array.from(r.rms.slice(a, b + 1), (v) => (db ? 20 * Math.log10(Math.max(v * MM, 1e-6)) : v * MM));
  return { x, y };
};
const item = (r: ReturnType<typeof runSandbox>, key: string) => r.items.find((i) => i.key === key)!;

// 그림 1 — 설정을 정하는 순서 (도식)
type Box = { x: number; y: number; title: string; sub: string; color: 'c1' | 'c3' | 'c4' | 'warn' };
const BW = 22;
const BH = 13;
const boxes: Box[] = [
  { x: 1, y: 30, title: '① 무엇을 보나', sub: '목적: 어떤 성분·결함', color: 'c1' },
  { x: 26, y: 30, title: '② 가장 높은 주파수', sub: '→ F_max (P1-2)', color: 'c1' },
  { x: 51, y: 30, title: '③ 가를 최소 간격', sub: '→ 라인 수·Δf (P1-3)', color: 'c1' },
  { x: 76, y: 30, title: '④ T = 1/Δf가 괜찮나', sub: '그동안 회전수 일정?', color: 'warn' },
  { x: 76, y: 5, title: '⑤ 윈도우', sub: '진폭·분리·누설 (P1-4)', color: 'c3' },
  { x: 51, y: 5, title: '⑥ 평균·오버랩', sub: '→ 총 측정 시간 (P1-5)', color: 'c3' },
  { x: 26, y: 5, title: '⑦ 표시', sub: 'Peak·RMS·PSD·dB (P1-6)', color: 'c3' },
  { x: 1, y: 5, title: '⑧ 결과 확인', sub: '클리핑·1X 위치·수렴', color: 'c4' },
];
const boxAnn: FigAnnotation[] = boxes.flatMap((b): FigAnnotation[] => [
  { type: 'rect', x1: b.x, x2: b.x + BW, y1: b.y, y2: b.y + BH, color: b.color },
  { type: 'text', x: b.x + BW / 2, y: b.y + BH * 0.62, text: b.title, anchor: 'middle', bold: true },
  { type: 'text', x: b.x + BW / 2, y: b.y + BH * 0.22, text: b.sub, anchor: 'middle', color: 'muted' },
]);
const arrowsFlow: FigAnnotation[] = [
  { type: 'arrow', x1: 23.2, y1: 36.5, x2: 25.8, y2: 36.5, color: 'muted', double: false },
  { type: 'arrow', x1: 48.2, y1: 36.5, x2: 50.8, y2: 36.5, color: 'muted', double: false },
  { type: 'arrow', x1: 73.2, y1: 36.5, x2: 75.8, y2: 36.5, color: 'muted', double: false },
  { type: 'arrow', x1: 87, y1: 29.8, x2: 87, y2: 18.2, color: 'muted', double: false },
  { type: 'arrow', x1: 75.8, y1: 11.5, x2: 73.2, y2: 11.5, color: 'muted', double: false },
  { type: 'arrow', x1: 50.8, y1: 11.5, x2: 48.2, y2: 11.5, color: 'muted', double: false },
  { type: 'arrow', x1: 25.8, y1: 11.5, x2: 23.2, y2: 11.5, color: 'muted', double: false },
  { type: 'text', x: 85.5, y: 22.5, text: '너무 길면 ②·③을 다시', anchor: 'end', color: 'warn' },
];
export const decisionFlow: FigureSpec = {
  id: 'fig-p1-8-1',
  caption: '그림 1. 측정 설정을 정하는 순서. 위 줄(파랑)은 "무엇을, 어디까지, 얼마나 촘촘히"를 정해 F_max와 라인 수를 고르는 단계, 주황 상자는 그 결과 측정 시간 T가 운전이 일정한 시간 안인지 되묻는 단계, 아래 줄(초록)은 같은 프레임을 어떻게 다듬어 보여 줄지 정하는 단계다. 괄호 안은 근거를 설명한 페이지다. 마지막에는 결과가 믿을 만한지 확인한다(보라).',
  panels: [
    {
      series: [],
      annotations: [...boxAnn, ...arrowsFlow],
      x: { range: [0, 100], ticks: 'none' },
      y: { range: [2, 45], ticks: 'none' },
      height: 210,
      frame: false,
    },
  ],
};

// 그림 2 — 숫자로 따라가기: 기어 측대역을 가르는 라인 수
const EXAMPLE: Settings = { ...DEFAULT_SETTINGS, fmax: 2000, lor: 800, average: 'linear', count: 8, overlap: 0.5 };
const coarse = runSandbox(DEFAULT_MACHINE, { ...EXAMPLE, lor: 400 });
const fine = runSandbox(DEFAULT_MACHINE, EXAMPLE);
const sbPanel = (r: ReturnType<typeof runSandbox>, lor: number, last: boolean): FigPanel => {
  const v = view(r, mesh - 45, mesh + 45);
  const st = item(r, 'sbLow');
  return {
    title: `${lor} 라인: Δf ${formatNumber(r.df, 3)} Hz → 측대역 간격 ${fb} Hz = ${formatNumber(st.neighborBins, 2)} bin (${st.status === 'visible' ? '갈라짐' : '붙음'})`,
    series: [{ x: v.x, y: v.y, color: last ? 'c3' : 'c1', width: 1.6 }],
    annotations: [mesh - fb, mesh + fb].map((f): FigAnnotation => ({ type: 'vline', x: f, color: 'muted', dash: true })),
    x: last ? { range: [mesh - 45, mesh + 45], ticks: [710, 725, mesh - fb, mesh, mesh + fb, 775, 790], label: '주파수 [Hz]' } : { range: [mesh - 45, mesh + 45], ticks: 'none' },
    y: { range: [0, 0.65], ticks: [0, 0.2, 0.4, 0.6], label: last ? '[mm/s RMS]' : undefined },
    height: last ? 135 : 115,
  };
};
export const exampleGear: FigureSpec = {
  id: 'fig-p1-8-2',
  caption: `그림 2. 같은 기계(1X ${f1} Hz, 맞물림 ${mesh} Hz, 축 B ${fb} Hz)를 F_max 2000 Hz, Hann, 파워 평균 8회로 쟀다. 위: 분석기 기본값 400 라인 — Δf ${formatNumber(coarse.df, 2)} Hz라 측대역 간격 ${fb} Hz가 ${formatNumber(item(coarse, 'sbLow').neighborBins, 2)} bin밖에 안 되어 맞물림 봉우리에 붙는다. 아래: ③단계에서 계산한 800 라인 — Δf ${formatNumber(fine.df, 2)} Hz, ${formatNumber(item(fine, 'sbLow').neighborBins, 2)} bin이라 Hann으로도 갈라진다 (회색 점선 = 측대역 자리). 측정 시간은 프레임 ${formatNumber(fine.frameTime, 2)} s, 평균까지 ${formatNumber(fine.totalTime, 2)} s.`,
  panels: [sbPanel(coarse, 400, false), sbPanel(fine, 800, true)],
};

// 그림 3 — F_max 위쪽: AAF가 없으면 높은 주파수가 접혀 들어온다
const S3: Settings = { ...DEFAULT_SETTINGS, fmax: 1000, lor: 800, count: 8 };
const aafOn = runSandbox(DEFAULT_MACHINE, { ...S3, aaf: true });
const aafOff = runSandbox(DEFAULT_MACHINE, { ...S3, aaf: false });
const ringAlias = item(aafOff, 'ring').aliasAt ?? NaN;
const aafPanel = (r: ReturnType<typeof runSandbox>, title: string, last: boolean): FigPanel => {
  const v = view(r, 0, 1000, true);
  return {
    title,
    series: [{ x: v.x, y: v.y, color: last ? 'warn' : 'c1', width: 1.1 }],
    annotations: last ? [{ type: 'band', x1: 2700 - aafOff.fs, x2: 3300 - aafOff.fs, color: 'warn', label: `접혀 들어온 울림 (2.7 ~ 3.3 kHz → ${2700 - aafOff.fs} ~ ${3300 - aafOff.fs} Hz)` }] : [],
    x: last ? { range: [0, 1000], ticks: [0, 100, 200, 300, 400, 500, 600, 700, 750, 800, 900, 1000], label: '주파수 [Hz]' } : { range: [0, 1000], ticks: 'none' },
    y: { range: [-60, 12], ticks: [-60, -40, -20, 0], label: last ? 'dB (0 dB = 1 mm/s RMS)' : undefined },
    height: last ? 140 : 120,
  };
};
export const aafMatters: FigureSpec = {
  id: 'fig-p1-8-3',
  caption: `그림 3. 같은 기계를 F_max 1000 Hz(f_s ${formatNumber(aafOn.fs, 4)} Hz)로 쟀다. 이 기계에는 3 kHz 근처에서 울리는 짧은 충격(구름베어링형)이 섞여 있다. 위: AAF를 켜면 F_max 위 성분이 깎여 0 ~ 1000 Hz에는 1X·하모닉·0.45X·맞물림과 그 측대역만 보인다. 아래: AAF가 없으면 2.7 ~ 3.3 kHz의 울림 대역이 f_s를 빼고 ${2700 - aafOff.fs} ~ ${3300 - aafOff.fs} Hz(가운데 ${formatNumber(ringAlias, 3)} Hz)로 접혀 들어와, 그 자리에 없는 성분의 막대 무리가 선다 (P1-2). 측정 장비에 AAF가 있는지, F_max 위에 큰 성분이 없는지 확인해야 하는 이유다.`,
  panels: [aafPanel(aafOn, 'AAF 켬', false), aafPanel(aafOff, 'AAF 없음', true)],
};

// 그림 4 — 같은 기계, 목적별 세 화면
const rBal = runSandbox(DEFAULT_MACHINE, RECIPES.balance.settings);
const rSub = runSandbox(DEFAULT_MACHINE, RECIPES.sub.settings);
const rBear = runSandbox(DEFAULT_MACHINE, RECIPES.bearing.settings);
const balView = view(rBal, 0, 500);
const subView = view(rSub, 0, 200, true);
const bearView = view(rBear, 0, 5000, true);
export const purposeViews: FigureSpec = {
  id: 'fig-p1-8-4',
  caption: `그림 4. 같은 기계를 목적만 바꿔 쟀다 (§4 표의 설정). 위: 밸런싱 전 1X — F_max 500 Hz, Flat top. 1X를 ${formatNumber(item(rBal, '1x').value * MM, 4)} mm/s RMS로 읽는다 (실제 ${formatNumber((DEFAULT_MACHINE.x1 / Math.SQRT2) * MM, 4)}). 가운데: 0.4 ~ 0.5X 확인 — F_max 200 Hz, 800 라인(Δf ${formatNumber(rSub.df, 2)} Hz), dB. 1X보다 ${formatNumber(20 * Math.log10(item(rSub, '1x').value / item(rSub, 'sub').value), 2)} dB 작은 22.5 Hz 성분이 1X와 또렷이 갈린다. 아래: 구름베어링 충격 — F_max 5000 Hz, dB. 3 kHz 근처의 울림 대역이 바닥보다 ${formatNumber(item(rBear, 'ring').marginDb, 2)} dB 높게 선다. 한 가지 설정으로는 셋을 모두 잘 보기 어렵다.`,
  panels: [
    {
      title: '밸런싱 전 1X (F_max 500 Hz, 400 라인, Flat top)',
      series: [{ x: balView.x, y: balView.y, color: 'c1', width: 1.4 }],
      x: { range: [0, 500], ticks: [0, 50, 100, 150, 200, 300, 400, 500], label: '주파수 [Hz]' },
      y: { range: [0, 3.2], ticks: [0, 1, 2, 3], label: '[mm/s RMS]' },
      height: 120,
    },
    {
      title: '0.4 ~ 0.5X 확인 (F_max 200 Hz, 800 라인, Hann, dB)',
      series: [{ x: subView.x, y: subView.y, color: 'c3', width: 1.4 }],
      annotations: [{ type: 'point', x: MACHINE_CONST.subOrder * f1, y: 20 * Math.log10(item(rSub, 'sub').value * MM), label: `0.45X = ${MACHINE_CONST.subOrder * f1} Hz`, color: 'warn', dx: 8, dy: -6 }],
      x: { range: [0, 200], ticks: [0, 22.5, 50, 100, 150, 200], label: '주파수 [Hz]' },
      y: { range: [-60, 15], ticks: [-60, -40, -20, 0], label: 'dB (1 mm/s)' },
      height: 120,
    },
    {
      title: '구름베어링 충격 (F_max 5000 Hz, 1600 라인, Hann, dB)',
      series: [{ x: bearView.x, y: bearView.y, color: 'c4', width: 1 }],
      annotations: [{ type: 'band', x1: 2700, x2: 3300, color: 'warn', label: '울림 대역' }],
      x: { range: [0, 5000], ticks: [0, 750, 1000, 2000, 3000, 4000, 5000], label: '주파수 [Hz]' },
      y: { range: [-50, 12], ticks: [-40, -20, 0], label: 'dB (1 mm/s)' },
      height: 135,
    },
  ],
};

/** 본문 숫자 확인용 (테스트에서 사용) */
export const P18_VALUES = {
  coarseBins: item(coarse, 'sbLow').neighborBins,
  coarseStatus: item(coarse, 'sbLow').status,
  fineBins: item(fine, 'sbLow').neighborBins,
  fineStatus: item(fine, 'sbLow').status,
  exampleFrame: fine.frameTime,
  exampleTotal: fine.totalTime,
  ringAlias,
  aafOffRing: item(aafOff, 'ring').status,
  balance1x: item(rBal, '1x').value * MM,
  subStatus: item(rSub, 'sub').status,
  ringMargin: item(rBear, 'ring').marginDb,
};
