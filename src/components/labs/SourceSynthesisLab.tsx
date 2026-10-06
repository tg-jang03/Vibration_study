import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot from '../ui/Plot';
import Formula from '../ui/Formula';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { DEFAULT_SOURCES, SOURCE_FS, SOURCE_IDS, synthesizeSources, type SourceId } from '../../lib/machine/sourceSynthesis';

const LABEL: Record<SourceId, string> = { oneX: '1X 응답', twoX: '2X 응답', blade: '날개 통과 응답', ring: '충격 뒤 구조 울림', noise: '잡음' };
const COLOR: Record<SourceId, string> = { oneX: 'var(--plot-1)', twoX: 'var(--plot-2)', blade: 'var(--plot-3)', ring: 'var(--plot-4)', noise: 'var(--text-muted)' };

export default function SourceSynthesisLab() {
  const [params, setParams] = useState(DEFAULT_SOURCES);
  const [hidden, setHidden] = useState(false);
  const [split, setSplit] = useState(false);
  const result = useMemo(() => synthesizeSources(params), [params]);
  const spectrumMax = params.sources.noise.enabled ? 3000 : Math.min(3000, Math.max(750, result.frequencies.blade * 1.25));
  const displayed = Math.floor(0.08 * SOURCE_FS) + 1;
  const times = useMemo(() => Array.from(result.t.slice(0, displayed), (v) => v * 1000), [result, displayed]);
  const microns = (x: Float64Array) => Array.from(x.slice(0, displayed), (v) => v * 1e6);
  const spectrum = useMemo(() => {
    const x: number[] = [], y: number[] = [];
    for (let i = 0; i < result.spectrum.frequency.length; i++) {
      const f = result.spectrum.frequency[i], a = result.spectrum.amplitude[i] * 1e6;
      if (f <= 3000 && a > 1e-4) { x.push(f); y.push(a); }
    }
    return [{ x, y, kind: 'bar' as const, barWidth: 1, name: '합 신호의 성분 크기', color: 'var(--plot-1)' }];
  }, [result]);
  const update = (id: SourceId, patch: { enabled?: boolean; amplitude?: number }) => setParams((p) => ({
    ...p, sources: { ...p.sources, [id]: { ...p.sources[id], ...patch } },
  }));

  return <LabFrame id="LAB-SRC-01" title="원인 합성: 파형 한 줄에 섞인 응답들"
    controls={<>
      <ParamToggle label="원인 가리기" checked={hidden} onChange={setHidden} hint="원인 설정·파형·수치를 숨깁니다. 합친 신호는 그대로입니다." />
      <button type="button" aria-pressed={split} onClick={() => setSplit((v) => !v)}>{split ? '스펙트럼 접기' : '나눠 보기'}</button>
      {!hidden && <>
        <ParamSlider label="회전수" value={params.shaftHz * 60} min={600} max={6000} step={60} unit="rpm" onChange={(rpm) => setParams((p) => ({ ...p, shaftHz: rpm / 60 }))} />
        <ParamSlider label="날개 수 N_b" value={params.blades} min={3} max={24} onChange={(blades) => setParams((p) => ({ ...p, blades }))} />
        {SOURCE_IDS.map((id) => <div key={id}>
          <ParamToggle label={LABEL[id]} checked={params.sources[id].enabled} onChange={(enabled) => update(id, { enabled })} />
          <ParamSlider label={id === 'noise' ? '잡음 크기 (표준편차)' : id === 'ring' ? '충격 울림 포락선 크기' : `${LABEL[id]} 진폭`}
            value={params.sources[id].amplitude * 1e6} min={0} max={id === 'noise' ? 20 : 80} step={1} unit="µm"
            hint={id === 'noise' ? '표준편차는 불규칙한 값이 얼마나 넓게 퍼지는지 나타내는 크기입니다.' : undefined}
            disabled={!params.sources[id].enabled} onChange={(v) => update(id, { amplitude: v * 1e-6 })} />
        </div>)}
        <button type="button" onClick={() => { setParams(DEFAULT_SOURCES); setSplit(false); }}>처음 값으로</button>
      </>}
    </>}
    formulas={!hidden && <>
      <Formula display tex={`f_r = ${texNumber(params.shaftHz * 60, 4)}/60 = ${texNumber(result.frequencies.oneX, 4)}\\,\\mathrm{Hz}`} />
      <Formula display tex={`f_{2X} = 2f_r = ${texNumber(result.frequencies.twoX, 4)}\\,\\mathrm{Hz},\\quad f_{BP} = ${params.blades}f_r = ${texNumber(result.frequencies.blade, 4)}\\,\\mathrm{Hz}`} />
      <Formula display tex="x(t)=x_{1X}(t)+x_{2X}(t)+x_{BP}(t)+x_{ring}(t)+n(t)" />
    </>}
    readouts={!hidden && <ReadoutTable rows={[
      { label: '1X', value: result.frequencies.oneX, unit: 'Hz' },
      { label: '2X', value: result.frequencies.twoX, unit: 'Hz' },
      { label: '날개 통과', value: result.frequencies.blade, unit: 'Hz' },
      { label: '구조 울림 (예시)', value: result.frequencies.ring, unit: 'Hz' },
    ]} />}
    tasks={hidden ? undefined : [
      { question: '원인을 가린 합 파형에서 성분이 몇 개인지 맞혀 보세요. 나눠 보기를 누르면 무엇이 더 보이나요?', answer: '처음 값에는 50·100·600 Hz의 정현파가 있습니다. 세 중심 주파수의 크기는 40·20·10 µm입니다. 주변의 작은 막대까지 별개 원인으로 세면 안 됩니다.' },
      { question: '가리기를 풀고 날개 응답만 꺼 보세요. 무엇이 사라지나요?', answer: '600 Hz의 잔물결과 그 주변 스펙트럼 막대가 사라집니다. 50·100 Hz는 남습니다.' },
      { question: '회전수를 3600 rpm으로 올리면 세 성분은 어디로 가나요?', answer: '60·120·720 Hz로 옮겨 갑니다. 이 랩은 진폭을 고정하므로 공진 통과 때의 증폭은 예측하지 않습니다.' },
      { question: '구조 울림과 잡음을 켜면 막대를 원인 개수로 셀 수 있을까요?', answer: '아니요. 되풀이된 충격 응답 하나도 여러 주파수 성분을 만들고, 잡음은 넓은 대역에 퍼집니다. 주파수 성분 수와 물리적 원인 수는 다릅니다.' },
    ]}
    footer={hidden ? <p>원인별 설정·파형·수치·해설을 가렸습니다. 합 파형은 바뀌지 않았습니다. ‘나눠 보기’로 주파수별 크기를 확인할 수 있지만 고장명이 정해지는 것은 아닙니다.</p>
      : <p>교육용 선형 합성입니다. 크기 조작은 센서 응답이지 힘·결함 심각도가 아닙니다. 앞 80 ms를 확대했고 스펙트럼은 1 s 신호로 계산합니다. 2X = 정렬 불량으로 단정하지 마세요. 구조 울림은 85 Hz·25 ms 감쇠·100 ms마다 충격이라는 고정 예시, 잡음은 시드 80입니다.</p>}
  >
    {!hidden && <>
      <h4>원인별 응답 — 같은 시간축</h4>
      {result.parts.filter((p) => p.enabled).map((part) => <div key={part.id}>
        <p>{LABEL[part.id]}</p>
        <Plot series={[{ x: times, y: microns(part.x), name: LABEL[part.id], color: COLOR[part.id] }]}
          x={{ label: '시간 [ms]', range: [0, 80] }} y={{ label: '변위 [µm]', range: [-100, 100] }} height={180} ariaLabel={`${LABEL[part.id]} 시간파형`} />
      </div>)}
    </>}
    <h4>센서에 찍히는 합친 파형</h4>
    <Plot series={[{ x: times, y: microns(result.x), name: '합친 응답', color: 'var(--text)' }]}
      x={{ label: '시간 [ms]', range: [0, 80] }} y={{ label: '변위 [µm]' }} height={300} ariaLabel="모든 응답을 더한 시간파형" />
    {split && <>
      <h4>나눠 보기 — 막대 스펙트럼 미리 보기</h4>
      <Plot series={spectrum} x={{ label: '주파수 [Hz]', range: [0, spectrumMax] }} y={{ label: '성분 진폭 [µm]' }} height={300} ariaLabel="합 신호에서 계산한 진폭 스펙트럼" />
      <p>가로는 주파수, 세로는 그 성분의 크기입니다. 막대는 원인 이름이 아닙니다. 계산하면서 중심 성분 주위에 작은 막대도 생깁니다. 방법과 눈금은 Part 1에서 다룹니다.</p>
    </>}
  </LabFrame>;
}
