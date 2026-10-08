import { useEffect, useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { singleSidedSpectrum } from '../../lib/dsp/spectrum';
import { forwardFraction, fullOrderSpectrum, meanPosition, NL_KINDS, NL_LABEL, nlRotor, orderPart, simulate, type ContactRecord, type NlKind } from '../../lib/faults/contact';

/**
 * LAB-NL-01 비선형의 지문: 미스얼라인·풀림·러브 (P7-3, Contents §5).
 * 같은 Jeffcott 로터에 미스얼라인 힘·베어링 간극·씰 접촉을 넣고 시간 적분한 오빗·파형·Full spectrum·차수 성분을 본다.
 * 계산: lib/faults/contact.ts (본문 그림 1 · 3 · 6 · 7과 같은 모델). 간극 1 = 100 µm, 회전수비 1 = 3000 rpm.
 * 접촉 운동은 초기값에 민감해 서버(Node)와 브라우저의 마지막 자리 차이가 읽음값을 바꿀 수 있다 → 마운트 뒤에만 계산한다 (I-019).
 */

export interface NonlinearState {
  kind: NlKind;
  severity: number;
  rpm: number;
}

const UM = 100;
const RPM1 = 3000;
const REVS = 64;
const KIND_OPTIONS = NL_KINDS.map((k) => ({ value: k, label: NL_LABEL[k] }));
const r1 = (v: number) => Math.round(v * 10) / 10;

export default function NonlinearLab({ initial = {} }: { initial?: Partial<NonlinearState> }) {
  const [p, setP] = useState<NonlinearState>({ kind: 'rub', severity: 50, rpm: 4200, ...initial });
  const set = <K extends keyof NonlinearState>(k: K) => (v: NonlinearState[K]) => setP((q) => ({ ...q, [k]: v }));
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const res = useMemo((): { rec: ContactRecord } | { error: string } | null => {
    if (!ready) return null;
    try {
      return { rec: simulate(nlRotor(p.kind, p.severity / 100, p.rpm / RPM1), REVS, 300) };
    } catch {
      return { error: 'diverge' };
    }
  }, [ready, p.kind, p.severity, p.rpm]);
  const rec = res && 'rec' in res ? res.rec : null;

  const parts = useMemo(() => {
    if (!rec) return null;
    const q = (o: number) => orderPart(rec, o);
    return { half: q(0.5), one: q(1), two: q(2), three: q(3), third: q(1 / 3) };
  }, [rec]);
  const seal = p.kind === 'rub' || p.kind === 'looseRot';

  // 오빗 (마지막 8바퀴, 같은 축척 ±180 µm, 위 = 수직)
  const L = 180;
  const S = 85 / L;
  const sx = (v: number) => r1(90 + S * UM * v);
  const sy = (v: number) => r1(90 - S * UM * v);
  let orbit = '';
  const dots: [number, number][] = [];
  let mx = 0;
  let my = 0;
  if (rec) {
    const n = rec.x.length;
    for (let i = n - 8 * 64; i < n; i++) {
      orbit += `${i === n - 8 * 64 ? 'M' : 'L'}${sx(rec.x[i])},${sy(rec.y[i])}`;
      if (i % 64 === 0 && dots.length < 4) dots.push([sx(rec.x[i]), sy(rec.y[i])]);
    }
    [mx, my] = meanPosition(rec);
  }
  const wave = rec ? (() => {
    const n = 4 * 64;
    const from = rec.x.length - n;
    return { t: Array.from({ length: n }, (_, i) => (360 * i) / 64), x: Array.from({ length: n }, (_, i) => UM * rec.x[from + i]), y: Array.from({ length: n }, (_, i) => UM * rec.y[from + i]) };
  })() : null;
  // 정수 바퀴 기록이라 Uniform 창 — 정수배·분수배 성분이 칸에 딱 맞고, 회전과 무관한 성분도 그 자리에 선다
  const spec = useMemo(() => {
    if (!rec) return null;
    const f = fullOrderSpectrum(rec);
    const fo: number[] = [];
    const fa: number[] = [];
    for (let i = 0; i < f.order.length; i++) if (Math.abs(f.order[i]) <= 4) { fo.push(f.order[i]); fa.push(UM * f.amp[i]); }
    const v = singleSidedSpectrum({ fs: rec.spr, x: rec.y }, { window: 'uniform' });
    const vo: number[] = [];
    const va: number[] = [];
    for (let i = 1; i < v.frequency.length && v.frequency[i] <= 5; i++) { vo.push(v.frequency[i]); va.push(2 * UM * v.amplitude[i]); }
    let bi = -1;
    for (let i = 0; i < fo.length; i++) if (fo[i] < -0.05 && (bi < 0 || fa[i] > fa[bi])) bi = i;
    return { fo, fa, vo, va, bwdOrder: bi >= 0 ? fo[bi] : 0, bwdAmp: bi >= 0 ? fa[bi] : 0 };
  }, [rec]);
  const vpp = (o: { yAmp: number }) => 2 * UM * o.yAmp;
  const ff = rec ? forwardFraction(rec.x.slice(-8 * 64).map((v) => v - mx), rec.y.slice(-8 * 64).map((v) => v - my)) : 0;

  return (
    <LabFrame id="LAB-NL-01" title="비선형의 지문: 미스얼라인 · 풀림 · 러브"
      controls={<>
        <ParamSelect label="상태" value={p.kind} options={KIND_OPTIONS} onChange={set('kind')} />
        <ParamSlider label="정도" value={p.severity} min={0} max={100} step={5} unit="%" onChange={set('severity')} disabled={p.kind === 'normal'} />
        <ParamSlider label="회전수" value={p.rpm} min={1200} max={10200} step={300} unit="rpm" onChange={set('rpm')} hint={`임계속도 ${RPM1} rpm의 ${formatNumber(p.rpm / RPM1, 2)}배`} />
      </>}
      readouts={rec && parts ? <ReadoutTable caption={`읽음값 (${NL_LABEL[p.kind]}, ${p.rpm} rpm, 정상상태 ${REVS}바퀴)`} rows={[
        { label: '씰·베어링 벽에 닿아 있는 시간 비율', value: 100 * rec.contactFraction, unit: '%', sig: 2 },
        { label: '½X (수직 p-p)', value: vpp(parts.half), unit: 'µm', sig: 2 },
        { label: '⅓X (수직 p-p)', value: vpp(parts.third), unit: 'µm', sig: 2 },
        { label: '1X 정방향 · 원의 반지름', value: UM * parts.one.fwd, unit: 'µm', sig: 3 },
        { label: '1X 역방향 · 원의 반지름', value: UM * parts.one.bwd, unit: 'µm', sig: 2 },
        { label: '2X (수직 p-p)', value: vpp(parts.two), unit: 'µm', sig: 2 },
        { label: '3X (수직 p-p)', value: vpp(parts.three), unit: 'µm', sig: 2 },
        { label: '평균 자리 (Shaft centerline) 수평', value: UM * mx, unit: 'µm', sig: 2 },
        { label: '평균 자리 수직 (정상 = −70 µm, 중력 처짐)', value: UM * my, unit: 'µm', sig: 2 },
        { label: '오빗이 정방향(반시계)으로 도는 비율', value: 100 * ff, unit: '%', sig: 2 },
        ...(spec ? [{ label: `가장 큰 역방향 성분 (차수 ${formatNumber(spec.bwdOrder, 3)} = ${formatNumber((Math.abs(spec.bwdOrder) * p.rpm) / 60, 3)} Hz) · 반지름`, value: spec.bwdAmp, unit: 'µm', sig: 2 }] : []),
      ]} /> : undefined}
      tasks={[
        { question: '상태를 미스얼라인먼트로, 회전수를 2400 rpm으로 두고 정도를 25 % → 80 %로 올리세요. 오빗 모양과 평균 자리는?',
          answer: '25 %에서는 2X가 1X의 약 0.6배라 오빗이 바나나처럼 휘고, 80 %에서는 2X가 1X보다 커져(약 1.5배) 8자가 됩니다. 평균 자리는 정상(−70 µm)에서 25 % −57 µm, 80 % −28 µm로 위로 뜹니다 — 커플링 예하중이 축을 들어 올린 것으로, Shaft centerline(P4-3)이 정상 자리에서 벗어나는 증거입니다.' },
        { question: '상태를 부분 러브(정도 50 %)로 두고 회전수를 4200 → 7800 rpm으로 올리세요. 어떤 성분이 주인공이 되나요?',
          answer: '4200 rpm(임계속도의 1.4배)에서는 1X가 주인공이고 2X가 섭니다. 7800 rpm(2.6배)에서는 ½X가 1X보다 커집니다 — 닿을 때마다 로터가 제 고유진동수 근처로 울리고, 그 주기가 두 바퀴에 맞기 때문입니다. 키페이저 점도 두 자리로 갈라집니다.' },
        { question: '상태를 회전 풀림으로 두고 정도 100 %에서 3600 rpm, 정도 50 %에서 4200 rpm을 보세요.',
          answer: '3600 rpm(100 %)은 수직 파형의 아래가 간극 바닥에 막혀 잘리고, 수직 성분에 2X·3X·4X·5X가 줄지어 섭니다. 4200 rpm(50 %)은 두 바퀴마다 되풀이되어 ½X와 1½X가 섭니다. 같은 풀림이 회전수와 정도에 따라 하모닉 무리 또는 ½X 무리로 보입니다.' },
        { question: '부분 러브의 정도를 100 %로 올리고 회전수를 7800 rpm 이상으로 올려 보세요.',
          answer: '7800 rpm부터 오빗이 회전 반대로 돌고(정방향 비율 0 %), Full spectrum의 가장 큰 성분이 역방향 −0.92X(약 120 Hz)입니다. 8400 · 9000 rpm에서는 −0.84X · −0.78X로 차수는 바뀌지만 주파수는 약 118 · 117 Hz로 거의 그대로입니다 — 역방향 선회가 회전수가 아닌 고유진동수에 잠긴 것입니다. 9600 rpm에서는 계산이 멈춥니다: 접촉 마찰이 키운 역방향 선회가 끝없이 커지는 원주 러브(dry whirl·whip)로, 실제 기계라면 즉시 정지할 상황입니다(본문 그림 8).' },
      ]}
      footer={<p>설명용 모델입니다: 무차원 Jeffcott 로터(감쇠비 0.05)를 한 바퀴 256걸음 RK4로 적분하고, 300바퀴를 버린 뒤 {REVS}바퀴를 한 바퀴 64점으로 기록합니다. 간극 1 = {UM} µm, 회전수비 1 = {RPM1} rpm으로 읽습니다. 러브는 씰 접촉 강성 40·마찰 계수 0.05, 회전 풀림은 간극 안 강성 0.3·중력 1.2·벽 강성 40, 미스얼라인은 60° 방향 예하중과 1X·2X 힘입니다. 크기는 판정 기준이 아닙니다. 비선형 계는 시작 조건에 따라 다른 정상상태에 들어갈 수 있습니다(이 랩은 늘 정지 위치에서 출발).</p>}
    >
      {!res && <p className="lab-note">계산 중…</p>}
      {res && !rec && <p className="lab-note"><strong>계산이 멈췄습니다</strong> — 진동이 간극의 50배를 넘었습니다. 접촉 마찰이 축을 회전 반대로 밀어 역방향 선회가 끝없이 커지는 원주 러브(dry whirl)로 번졌습니다. 실제 기계라면 즉시 정지할 상황입니다. 정도나 회전수를 낮춰 보세요.</p>}
      {rec && wave && spec && <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <h4>오빗 (마지막 8바퀴, ±{L} µm, 점 = 키페이저)</h4>
            <svg viewBox="0 0 180 180" width="100%" style={{ maxWidth: 300 }} role="img" aria-label="오빗">
              <line x1="5" y1="90" x2="175" y2="90" stroke="var(--border)" />
              <line x1="90" y1="5" x2="90" y2="175" stroke="var(--border)" />
              {seal && <circle cx="90" cy="90" r={r1(S * UM)} fill="none" stroke="var(--text-muted)" strokeDasharray="3 3" />}
              <path d={orbit} fill="none" stroke="var(--plot-1)" strokeWidth="1.3" />
              {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="var(--status-wip)" />)}
              <path d={`M${sx(mx) - 5},${sy(my)}H${sx(mx) + 5}M${sx(mx)},${sy(my) - 5}V${sy(my) + 5}`} stroke="var(--text)" strokeWidth="1.5" />
              <text x="172" y="86" fontSize="9" fill="var(--text-muted)" textAnchor="end">H</text>
              <text x="94" y="14" fontSize="9" fill="var(--text-muted)">V</text>
            </svg>
            <p className="lab-note">점선 원 = 씰·베어링 간극 ({UM} µm), 십자 = 평균 자리.</p>
          </div>
          <div style={{ flex: '2 1 320px', minWidth: 0 }}>
            <h4>파형 (마지막 4바퀴)</h4>
            <Plot series={[
              { x: wave.t, y: wave.x, name: '수평', color: 'var(--plot-1)', width: 1.5 },
              { x: wave.t, y: wave.y, name: '수직', color: 'var(--plot-2)', width: 1.5 },
            ]} x={{ label: '회전각 [°] (키페이저 = 0°)', range: [0, 1440] }} y={{ label: '[µm]', range: [-L, L] }} height={220} ariaLabel="수평·수직 파형" />
          </div>
        </div>
        <h4>Full spectrum (원의 반지름, − 역방향 · + 정방향)</h4>
        <Plot series={[{ x: spec.fo, y: spec.fa, name: 'Full spectrum', color: 'var(--plot-4)', width: 1.4 }]} x={{ label: '차수 (× 회전 주파수)', range: [-4, 4] }} y={{ label: '[µm]', range: [0, Math.max(20, ...spec.fa) * 1.15] }} height={180} ariaLabel="Full spectrum" />
        <h4>수직 스펙트럼 (p-p)</h4>
        <Plot series={[{ x: spec.vo, y: spec.va, name: '수직', color: 'var(--plot-2)', width: 1.4 }]} x={{ label: '차수 (× 회전 주파수)', range: [0, 5] }} y={{ label: '[µm p-p]', range: [0, Math.max(20, ...spec.va) * 1.15] }} height={170} ariaLabel="수직 스펙트럼" />
      </>}
    </LabFrame>
  );
}
