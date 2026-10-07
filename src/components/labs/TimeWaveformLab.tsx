import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import Formula from '../ui/Formula';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import { waveform, WAVE_PATTERNS, WAVE_LABELS, WAVE_CLUES, type WavePattern } from '../../lib/plots/waveform';

const QUIZ: WavePattern[] = ['clipped', 'am', 'impacts', 'beat', 'asymmetric', 'sine', 'truncated'];
const options = WAVE_PATTERNS.map(value => ({ value, label: WAVE_LABELS[value] }));

export default function TimeWaveformLab() {
  const [pattern, setPattern] = useState<WavePattern>('sine');
  const [rpm, setRpm] = useState(3000), [amp, setAmp] = useState(20);
  const [revs, setRevs] = useState(10), [noise, setNoise] = useState(0);
  const [quiz, setQuiz] = useState(false), [caseIndex, setCase] = useState(0);
  const [answer, setAnswer] = useState('unset'), [markers, setMarkers] = useState(true);
  const kind = quiz ? QUIZ[caseIndex] : pattern;
  const r = useMemo(() => waveform({ pattern: kind, rpm, amplitude: amp / 1e6, revolutions: revs, noise: noise / 1e6 }), [kind, rpm, amp, revs, noise]);
  const top = Math.max(...r.x.map(Math.abs)) * 1e6 * 1.1 || 1;
  const series: PlotSeries[] = [{ x: r.time.map(t => t * 1000), y: r.x.map(v => v * 1e6), name: quiz ? '문제 파형' : WAVE_LABELS[kind], color: 'var(--plot-1)' }];
  if (markers) {
    series.push({ x: r.keyphasor.map(t => 1000 * t), y: r.keyphasor.map(() => top), name: '키페이저 (한 바퀴)', mode: 'markers', color: 'var(--plot-3)' });
    if (!quiz && r.events.length) series.push({ x: r.events.map(t => 1000 * t), y: r.events.map(() => -top), name: '모델의 사건 시작', mode: 'markers', color: 'var(--plot-2)' });
  }
  return (
    <LabFrame id="LAB-TWF-01" title="시간파형: 패턴을 읽고 맞히기"
      controls={<>
        <ParamToggle label="패턴 맞히기 퀴즈" checked={quiz} onChange={v => { setQuiz(v); setAnswer('unset'); }} />
        {quiz ? <>
          <ParamSelect label="문제" value={caseIndex} options={QUIZ.map((_, i) => ({ value: i, label: `문제 ${i + 1}` }))} onChange={v => { setCase(v); setAnswer('unset'); }} />
          <ParamSelect label="어떤 모양인가요?" value={answer} options={[{ value: 'unset', label: '근거를 생각한 뒤 선택하세요' }, ...options]} onChange={setAnswer} />
        </> : <ParamSelect label="패턴" value={pattern} options={options} onChange={setPattern} />}
        <ParamSlider label="회전수" value={rpm} min={1000} max={6000} step={250} unit="rpm" onChange={setRpm} />
        <ParamSlider label="기준 진폭 A (Peak)" value={amp} min={5} max={50} step={5} unit="µm" onChange={setAmp} hint="합성 뒤 실제 Peak는 읽음값으로 확인" />
        <ParamSlider label="표시 바퀴 수" value={revs} min={2} max={20} step={1} onChange={setRevs} />
        <ParamSlider label="잡음 표준편차 σ" value={noise} min={0} max={5} step={0.5} unit="µm" onChange={setNoise} />
        <ParamToggle label="회전 기준 마커 표시" checked={markers} onChange={setMarkers} />
      </>}
      formulas={<Formula display tex={`T_r=\\frac{60}{N_{\\rm rpm}}=\\frac{60}{${rpm}}=${texNumber(1000 / r.fr, 4)}\\,\\mathrm{ms},\\quad \\mathrm{CF}=\\frac{x_{\\rm Peak}}{x_{\\rm RMS}}=${texNumber(r.features.crestFactor, 4)},\\quad x_{\\rm pp}=${texNumber(r.features.peakToPeak * 1e6, 3)}\\,\\mathrm{\\mu m}`} />}
      readouts={<ReadoutTable rows={[
        { label: '1X', value: r.fr, unit: 'Hz' }, { label: '한 바퀴', value: 1000 / r.fr, unit: 'ms' },
        { label: 'Pk-Pk', value: r.features.peakToPeak * 1e6, unit: 'µm' },
        { label: 'Peak (절댓값 최대)', value: Math.max(Math.abs(r.features.min), Math.abs(r.features.max)) * 1e6, unit: 'µm' },
        { label: 'RMS (DC 포함)', value: r.features.rms * 1e6, unit: 'µm' },
        { label: 'AC RMS (평균 제거)', value: r.features.acRms * 1e6, unit: 'µm' },
        { label: 'Crest factor (DC 포함)', value: r.features.crestFactor },
        { label: '평균', value: r.features.mean * 1e6, unit: 'µm' },
        { label: '0 기준 상하 Peak 비대칭', value: r.features.asymmetry },
        { label: '왜도 (평균 제거)', value: r.features.skewness },
        ...(!quiz && r.eventInterval !== null ? [{ label: '모델 사건 간격', value: r.eventInterval * 1000, unit: 'ms' }] : []),
      ]} />}
      tasks={[
        { question: '잡음 0, 3000 rpm, 3바퀴에서 반복 충격 울림을 고르세요. 한 바퀴에 울림이 몇 번 시작하나요?', answer: '20 ms마다 키페이저가 찍히고 그 사이에 울림이 세 번 시작합니다. 사건 간격은 6.667 ms입니다. 울림 속 여러 봉우리를 각각 사건으로 세지 마세요.' },
        { question: '잡음 0, A=20 µm에서 맥놀이와 AM을 10바퀴 비교한 뒤 2바퀴로 줄이세요. 짧은 화면이 숨기는 것은?', answer: '크기 변화 한 주기는 10바퀴입니다. 2바퀴는 그 일부만 보여 줍니다. 10바퀴에서 RMS는 맥놀이 10 µm, AM 15 µm이지만 2바퀴 읽음값은 이 기준과 달라집니다.' },
        { question: '한쪽 절단과 양쪽 클리핑 중 어느 것이 기계 결함인지 모양만 보고 확정할 수 있나요?', answer: '확정할 수 없습니다. 두 패턴은 제한된 모양을 흉내 낸 설명용 신호입니다. 센서·측정 체인의 선형 범위와 과부하를 확인하고 다른 채널·운전 조건·스펙트럼을 함께 봅니다.' },
      ]}
      footer={<p>변위로 그린 설명용 신호이며 실제 결함의 운동방정식은 아닙니다. 회전당 256점, 잡음 시드 6101. 마커는 한 바퀴 한 번이며 퀴즈에서는 모델 사건 표식을 숨깁니다. 비대칭 지표는 (위쪽 절댓값 Peak − 아래쪽 절댓값 Peak) / 두 Peak 합으로 DC 이동에도 변합니다. 왜도와 평균을 함께 보세요.</p>}
    >
      <Plot series={series} x={{ label: '시각 [ms]', range: [-0.02 * 1000 * revs / r.fr, 1000 * revs / r.fr] }} y={{ label: '변위 [µm]', range: [-top * 1.15, top * 1.15] }} height={300} ariaLabel="시간파형과 회전 기준 마커" />
      {quiz ? answer === 'unset' ? <p>주기·대칭·평탄부·울림 시작을 살펴보고 모양을 고르세요. 진단 원인을 맞히는 문제는 아닙니다.</p> : <p role="status"><strong>{answer === kind ? '맞았습니다' : '다시 살펴보세요'}</strong> — {WAVE_LABELS[kind]}: {WAVE_CLUES[kind]}</p> : <p>{WAVE_CLUES[kind]}</p>}
    </LabFrame>
  );
}