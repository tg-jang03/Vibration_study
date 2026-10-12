import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import {
  ALN_GEOM as G,
  coldTarget,
  footMoves,
  fromReverse,
  fromRimFace,
  heightAt,
  reverseReadings,
  rimFaceReadings,
  type AlignState,
} from '../../lib/fieldwork/alignment';

/**
 * LAB-ALN-01 정렬 계산기 (P9-3, Contents §5-1b).
 * 계산: src/lib/fieldwork/alignment.ts (본문 그림 2 ~ 6과 같은 기하·예시).
 */

type Method = 'rimface' | 'reverse';
type Source = 'example' | 'parallel' | 'angular' | 'custom';
const METHOD_OPTS = [
  { value: 'rimface', label: 'rim-face (브래킷 하나)' },
  { value: 'reverse', label: 'reverse (게이지 두 개 · 레이저와 같은 원리)' },
];
const SOURCE_OPTS = [
  { value: 'example', label: '예시 기계: 그림 2 (δ 0.18 mm, α 0.04 mm/100 mm)' },
  { value: 'parallel', label: '예시 기계: 평행만 (δ 0.20 mm)' },
  { value: 'angular', label: '예시 기계: 각만 (α 0.05 mm/100 mm)' },
  { value: 'custom', label: '직접 입력 (내 측정값)' },
];
const STATES: Record<Exclude<Source, 'custom'>, AlignState> = {
  example: { offset: 0.18, slope: 0.0004 },
  parallel: { offset: 0.2, slope: 0 },
  angular: { offset: 0, slope: 0.0005 },
};
const SAG_OPTS = [0, -0.05, -0.1, -0.2].map((v) => ({ value: v, label: v === 0 ? '0 (처짐 없음)' : `${v.toFixed(2)} mm` }));
const mm = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}`;
const fmt3 = (v: number) => v.toFixed(3);
/** 이론상 0인 값의 부동소수점 찌꺼기는 0으로 (I-019) */
const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);

export default function AlignmentLab() {
  const [method, setMethod] = useState<Method>('rimface');
  const [source, setSource] = useState<Source>('example');
  const [sag, setSag] = useState(-0.1);
  const [sagFix, setSagFix] = useState(true);
  const [gS, setGS] = useState(0);
  const [gM, setGM] = useState(0);
  const [custom, setCustom] = useState({ rim: -0.5, face: -0.04, r1: -0.508, r2: 0.212 });

  const readings = useMemo(() => {
    if (source === 'custom') return custom;
    const s = STATES[source];
    const rf = rimFaceReadings(s, sag);
    const rv = reverseReadings(s, sag);
    return { rim: rf.rim, face: rf.face, r1: rv.r1, r2: rv.r2 };
  }, [source, sag, custom]);

  const pickSource = (v: Source) => {
    if (v === 'custom') setCustom(readings);
    setSource(v);
  };
  const setReading = (key: keyof typeof custom) => (v: number) => setCustom({ ...readings, [key]: v });

  const corr = sagFix ? sag : 0;
  const st = method === 'rimface' ? fromRimFace(readings.rim, readings.face, corr) : fromReverse(readings.r1, readings.r2, corr);
  const stNoFix = method === 'rimface' ? fromRimFace(readings.rim, readings.face, 0) : fromReverse(readings.r1, readings.r2, 0);
  const target = coldTarget(gS, gM);
  const mv = footMoves(st, target);
  const mvNoFix = footMoves(stNoFix, target);

  const zM = [0, 1000];
  const yA = heightAt(st, G.footA);
  const yB = heightAt(st, G.footB);
  const yMax = Math.max(0.3, ...zM.map((z) => heightAt(st, z)), target) + 0.15;
  const yMin = Math.min(-0.15, ...zM.map((z) => heightAt(st, z)), target) - 0.1;
  const series: PlotSeries[] = [
    { x: [-600, 0], y: [0, 0], name: '펌프 S 중심선', color: 'var(--plot-2)', width: 2.4 },
    { x: [0, 1000], y: [0, 0], name: '펌프 연장선', color: 'var(--text-muted)', dash: 'dash', width: 1.2 },
    { x: zM, y: zM.map((z) => heightAt(st, z)), name: '모터 M 중심선 (읽음값에서)', color: 'var(--plot-1)', width: 2.4 },
    { x: zM, y: [target, target], name: '냉간 목표', color: 'var(--plot-3)', dash: 'dash', width: 2 },
    { x: [G.footA, G.footA], y: [yA, target], name: '발 이동', color: 'var(--status-wip)', mode: 'lines+markers', markerSize: 7, width: 2 },
    { x: [G.footB, G.footB], y: [yB, target], name: '발 이동', color: 'var(--status-wip)', mode: 'lines+markers', markerSize: 7, width: 2, hideInLegend: true },
  ];
  const moveWord = (v: number) => (Math.abs(v) < 0.005 ? '그대로' : v < 0 ? `심 ${Math.abs(v).toFixed(2)} mm 빼기` : `심 ${v.toFixed(2)} mm 더하기`);
  const editable = source === 'custom';

  return (
    <LabFrame
      id="LAB-ALN-01"
      title="정렬 계산기"
      controls={
        <>
          <ParamSelect label="측정법" value={method} options={METHOD_OPTS} onChange={(v) => setMethod(v as Method)} />
          <ParamSelect label="읽음값 출처" value={source} options={SOURCE_OPTS} onChange={(v) => pickSource(v as Source)} />
          {method === 'rimface' ? (
            <>
              <ParamSlider label="rim 6시 읽음값" value={readings.rim} min={-1} max={1} step={0.002} unit="mm" format={fmt3} disabled={!editable} onChange={setReading('rim')} hint="12시 0, + = 측정침 들어감" />
              <ParamSlider label={`face 6시 읽음값 (지름 ${G.faceD} mm)`} value={readings.face} min={-0.3} max={0.3} step={0.002} unit="mm" format={fmt3} disabled={!editable} onChange={setReading('face')} />
            </>
          ) : (
            <>
              <ParamSlider label={`R₁: 펌프 쪽 게이지 → 모터 허브 (z ${G.z1} mm)`} value={readings.r1} min={-1} max={1} step={0.002} unit="mm" format={fmt3} disabled={!editable} onChange={setReading('r1')} />
              <ParamSlider label={`R₂: 모터 쪽 게이지 → 펌프 허브 (z ${G.z2} mm)`} value={readings.r2} min={-1} max={1} step={0.002} unit="mm" format={fmt3} disabled={!editable} onChange={setReading('r2')} />
            </>
          )}
          <ParamSelect label="브래킷 처짐 (파이프 시험 6시 값)" value={sag} options={SAG_OPTS} onChange={(v) => setSag(Number(v))} />
          <ParamToggle label="처짐 보정 (읽음값에서 처짐 빼기)" checked={sagFix} onChange={setSagFix} />
          <ParamSlider label="펌프 S 열성장 (운전 중 솟는 양)" value={gS} min={0} max={0.4} step={0.01} unit="mm" format={(v) => v.toFixed(2)} onChange={setGS} />
          <ParamSlider label="모터 M 열성장" value={gM} min={0} max={0.4} step={0.01} unit="mm" format={(v) => v.toFixed(2)} onChange={setGM} />
        </>
      }
      formulas={
        <>
          {method === 'rimface' ? (
            <Formula
              display
              tex={`\\alpha = -\\dfrac{F}{D} = -\\dfrac{${texNumber(readings.face, 3)}}{${G.faceD}},\\quad y_{rim} = -\\dfrac{R - S_{sag}}{2} = -\\dfrac{${texNumber(readings.rim, 3)} - (${texNumber(corr, 2)})}{2} = ${texNumber(clean(heightAt(st, G.zRim)), 3)}\\ \\text{mm}`}
            />
          ) : (
            <Formula
              display
              tex={`y_1 = -\\dfrac{R_1 - S_{sag}}{2} = ${texNumber(clean(heightAt(st, G.z1)), 3)},\\quad y_2 = \\dfrac{R_2 - S_{sag}}{2} = ${texNumber(clean(heightAt(st, G.z2)), 3)},\\quad \\alpha = \\dfrac{y_1 - y_2}{z_1 - z_2}`}
            />
          )}
          <Formula
            display
            tex={`\\text{이동} = \\text{목표} - (\\delta + \\alpha z):\\ \\text{앞발 } ${texNumber(clean(target), 2)} - ${texNumber(clean(yA), 3)} = ${texNumber(clean(mv.front), 3)},\\ \\text{뒷발 } ${texNumber(clean(target), 2)} - ${texNumber(clean(yB), 3)} = ${texNumber(clean(mv.rear), 3)}\\ \\text{mm}`}
          />
        </>
      }
      readouts={
        <>
          <ReadoutTable
            theoryLabel="처짐 보정 안 하면"
            errorLabel="차이"
            rows={[
              { label: '커플링 중심 어긋남 δ', value: clean(st.offset), theory: clean(stNoFix.offset), unit: 'mm', sig: 3 },
              { label: '기울기 α', value: clean(st.slope * 100), theory: clean(stNoFix.slope * 100), unit: 'mm/100 mm', sig: 3 },
              { label: '냉간 목표 (ΔH_S − ΔH_M)', value: clean(target), unit: 'mm', sig: 3 },
              { label: `앞발 이동 (z ${G.footA})`, value: clean(mv.front), theory: clean(mvNoFix.front), unit: 'mm', sig: 3 },
              { label: `뒷발 이동 (z ${G.footB})`, value: clean(mv.rear), theory: clean(mvNoFix.rear), unit: 'mm', sig: 3 },
            ]}
          />
          <p className="lab-note">
            앞발: <strong>{moveWord(mv.front)}</strong> · 뒷발: <strong>{moveWord(mv.rear)}</strong> (수직 평면, + = 올림). 지금 읽음값: {method === 'rimface' ? `rim ${mm(readings.rim)}, face ${mm(readings.face)}` : `R₁ ${mm(readings.r1)}, R₂ ${mm(readings.r2)}`} mm
          </p>
        </>
      }
      tasks={[
        {
          question: '처음 상태(rim-face, 그림 2의 예, 처짐 −0.10 보정, 열성장 0)에서 δ·α와 두 발의 이동량은?',
          answer: 'rim −0.50에서 처짐 −0.10을 빼면 −0.40 → rim 자리 높이 0.20 mm, face −0.04 → 기울기 0.04 mm/100 mm, 커플링 중심 δ = 0.20 − 0.0004 × 50 = 0.18 mm. 앞발 −0.30, 뒷발 −0.50 mm(심 빼기).',
        },
        {
          question: '처짐 보정을 끄면 결과가 어떻게 바뀌나요?',
          answer: 'δ가 0.23 mm로 0.05 mm(= 처짐 0.10의 절반) 크게 나와 앞발 −0.35, 뒷발 −0.55 mm로 두 발을 더 내리게 됩니다. 처짐은 rim에만 더해지므로 기울기는 그대로입니다.',
        },
        {
          question: '처짐 보정을 다시 켜고 열성장을 펌프 0.10, 모터 0.23 mm로 둡니다. 냉간 목표와 이동량은?',
          answer: '냉간 목표 = 0.10 − 0.23 = −0.13 mm(모터를 0.13 mm 낮게). 앞발 −0.13 − 0.30 = −0.43, 뒷발 −0.13 − 0.50 = −0.63 mm. 운전 중 모터가 0.13 mm 더 솟아 한 줄이 됩니다.',
        },
        {
          question: '열성장을 0으로 돌리고 측정법을 reverse로 바꿉니다. 읽음값과 결과는?',
          answer: 'R₁ −0.508, R₂ +0.212 mm(처짐 포함). 처짐을 빼면 y₁ = 0.204, y₂ = 0.156 mm, 기울기 (0.204 − 0.156)/120 = 0.04 mm/100 mm, δ 0.18 mm로 rim-face와 같고 이동량도 −0.30 · −0.50 mm입니다.',
        },
        {
          question: '읽음값 출처를 "각만"으로 바꿉니다(rim-face). 두 발 이동량은 왜 다른가요?',
          answer: '앞발 −0.15, 뒷발 −0.40 mm. 커플링에서는 어긋남이 0이지만 기울기 0.05 mm/100 mm가 거리에 비례해 커져, 300 mm의 앞발보다 800 mm의 뒷발을 더 내려야 합니다.',
        },
      ]}
    >
      <Plot series={series} x={{ label: '커플링에서 모터 쪽으로 [mm]', range: [-600, 1000] }} y={{ label: '높이 [mm] (가로와 축척이 다름)', range: [yMin, yMax] }} height={260} ariaLabel="펌프·모터 중심선과 냉간 목표, 발 이동" />
    </LabFrame>
  );
}
