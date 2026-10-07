import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable, { type Readout } from '../ui/ReadoutTable';
import { formatNumber } from '../../lib/format';
import { estimateRpm, type LagCurve, type QuefrencyCurve, type RpmMethod, type ScoreCurve } from '../../lib/faults/rpm';
import { synthesize, velocitySpectrum, type Severity } from '../../lib/faults/synth';
import { MACHINES } from '../../lib/faults/synth';

/**
 * LAB-RPM-01 회전수 추정: 회전수를 모르는 신호에서 1X 찾기 (P7-1, Contents §5).
 * 같은 신호에 하모닉 무리·켑스트럼·자기상관 세 방법을 걸어 추정값을 비교한다.
 * 계산: lib/faults/rpm.ts, 신호: lib/faults/synth.ts (본문 그림 5와 표의 세 경우와 같다).
 */

const CASES = {
  pump: { m: MACHINES.pump, sev: { unbalance: 0.4, misalignment: 0.3, electrical2LF: 0.3, bladePass: 0.3 } as Severity, label: '전동기-펌프 (불평형 + 정렬 불량 + 전기 + 베인)' },
  gearbox: { m: MACHINES.gearbox, sev: { gear: 0.6, unbalance: 0.2 } as Severity, label: '감속기 입력축 (기어 결함)' },
  fan: { m: MACHINES.fan, sev: { looseness: 0.7, unbalance: 0.2 } as Severity, label: '벨트 구동 팬 (풀림)' },
};
type CaseId = keyof typeof CASES;
const CASE_OPTIONS = (Object.keys(CASES) as CaseId[]).map((id) => ({ value: id, label: CASES[id].label }));
const METHOD_LABEL: Record<RpmMethod, string> = { harmonic: '하모닉 무리', cepstrum: '켑스트럼', autocorr: '자기상관' };
const METHOD_OPTIONS = (Object.keys(METHOD_LABEL) as RpmMethod[]).map((m) => ({ value: m, label: METHOD_LABEL[m] }));

export default function RpmLab({ initial = {} }: { initial?: Partial<{ scenario: CaseId; method: RpmMethod; reveal: boolean }> }) {
  const [scenario, setScenario] = useState<CaseId>(initial.scenario ?? 'pump');
  const [method, setMethod] = useState<RpmMethod>(initial.method ?? 'harmonic');
  const [reveal, setReveal] = useState(initial.reveal ?? false);
  const c = CASES[scenario];
  const all = useMemo(() => {
    const s = synthesize(c.m, c.sev);
    const v = velocitySpectrum(s.acc.H, s.fs, 2048);
    return { truth: s.fr, est: Object.fromEntries((Object.keys(METHOD_LABEL) as RpmMethod[]).map((mm) => [mm, estimateRpm(v, s.fs, mm, scenario)])) as Record<RpmMethod, ReturnType<typeof estimateRpm>> };
  }, [scenario]);
  const e = all.est[method];
  const spec: { x: number[]; y: number[] } = { x: [], y: [] };
  e.freq.forEach((f, k) => {
    if (f <= 700) {
      spec.x.push(f);
      spec.y.push(e.amp[k]);
    }
  });
  const yMax = Math.max(...spec.y) * 1.1;
  const marks: PlotSeries[] = [1, 2, 3, 4, 5, 6, 7, 8].filter((k) => k * e.fr <= 700).map((k) => ({ x: [k * e.fr, k * e.fr], y: [0, yMax], name: `추정한 1X의 정수배`, color: 'var(--plot-2)', dash: 'dot', width: 1.2, hideInLegend: k > 1 }));
  const truthMark: PlotSeries[] = reveal ? [{ x: [all.truth, all.truth], y: [0, yMax], name: '참 1X', color: 'var(--plot-3)', dash: 'dash', width: 2 }] : [];

  let curve: PlotSeries[];
  let cx: { label: string; range: [number, number] };
  if (method === 'harmonic') {
    const h = e.curve as ScoreCurve;
    curve = [{ x: Array.from(h.f0), y: Array.from(h.score), name: '하모닉 무리 점수', color: 'var(--plot-3)', width: 1.4 }];
    cx = { label: '후보 f₀ [Hz]', range: [5, 100] };
  } else if (method === 'cepstrum') {
    const q = e.curve as QuefrencyCurve;
    curve = [{ x: Array.from(q.tau, (t) => t * 1000), y: Array.from(q.c), name: '켑스트럼', color: 'var(--plot-2)', width: 1.2 }];
    cx = { label: 'quefrency [ms] (1X = 1000 / ms)', range: [10, 200] };
  } else {
    const l = e.curve as LagCurve;
    const step = Math.max(1, Math.floor(l.lag.length / 1500));
    curve = [{ x: Array.from(l.lag).filter((_, i) => i % step === 0).map((t) => t * 1000), y: Array.from(l.r).filter((_, i) => i % step === 0), name: '자기상관', color: 'var(--plot-4)', width: 1 }];
    cx = { label: '지연 [ms]', range: [10, 200] };
  }
  const rows: Readout[] = (Object.keys(METHOD_LABEL) as RpmMethod[]).map((mm) => ({
    label: `${METHOD_LABEL[mm]} → rpm`,
    value: all.est[mm].fr * 60,
    theory: reveal ? all.truth * 60 : undefined,
    unit: 'rpm',
    sig: 4,
  }));

  return (
    <LabFrame id="LAB-RPM-01" title="회전수 추정: 회전수를 모를 때 1X 찾기"
      controls={<>
        <ParamSelect label="기록" value={scenario} options={CASE_OPTIONS} onChange={setScenario} />
        <ParamSelect label="방법 (그래프)" value={method} options={METHOD_OPTIONS} onChange={setMethod} />
        <ParamToggle label="정답(참 회전수) 보기" checked={reveal} onChange={setReveal} />
      </>}
      readouts={<ReadoutTable caption="세 방법의 추정 (후보 5 ~ 100 Hz)" rows={rows} />}
      tasks={[
        { question: '펌프 기록에서 세 방법이 같은 답을 내나요? 다르다면 어느 쪽이 의심스러운가요?',
          answer: '하모닉 무리(약 3573 rpm)와 자기상관(약 3576 rpm)은 맞고, 켑스트럼은 약 1792 rpm으로 절반을 고릅니다. 2극 전동기(동기 3600 rpm)라는 명판 정보와 맞는 쪽이 3575 rpm 근처입니다.' },
        { question: '감속기 기록에서 자기상관은 왜 틀리나요?',
          answer: '맞물림 571 Hz가 신호의 대부분이라 자기상관이 그 짧은 주기에 덮여, 5 ~ 100 Hz 후보에서 엉뚱한 봉우리를 고릅니다 (P5-7). 하모닉 무리와 켑스트럼(측대역 간격)은 입력축 1490 rpm 근처를 찾습니다.' },
        { question: '풀림 팬 기록에서 하모닉 무리와 켑스트럼은 몇 rpm을 고르나요? 왜 그럴까요?',
          answer: '둘 다 약 590 rpm, 참값(1180 rpm)의 절반을 고릅니다. 풀림의 ½X 분수 하모닉 때문에 ½X 간격의 무리가 생겼기 때문입니다. 이번에는 자기상관이 맞습니다. 방법 하나로 정하지 말고, 키페이저·명판·운전 조건 변화로 확인합니다.' },
      ]}
      footer={<p>설명용 합성 신호의 수평 가속도를 속도로 바꿔 썼습니다 (f_s 16384 Hz, 2초, 하모닉 무리·켑스트럼은 0 ~ 2048 Hz 속도 스펙트럼, 자기상관은 속도 파형). 그래프 위 스펙트럼의 주황 점선은 고른 방법이 찾은 1X의 정수배입니다.</p>}
    >
      <h4>수평 속도 스펙트럼 (주황 점선 = {METHOD_LABEL[method]}이 찾은 {formatNumber(e.fr, 4)} Hz의 정수배)</h4>
      <Plot series={[...marks, ...truthMark, { x: spec.x, y: spec.y, name: '속도', color: 'var(--plot-1)', width: 1.2 }]} x={{ label: '주파수 [Hz]', range: [0, 700] }} y={{ label: '[mm/s rms]', range: [0, yMax] }} height={220} ariaLabel="속도 스펙트럼과 추정한 1X" />
      <h4>{METHOD_LABEL[method]}</h4>
      <Plot series={curve} x={cx} y={{ label: '' }} height={190} ariaLabel={METHOD_LABEL[method]} />
    </LabFrame>
  );
}
