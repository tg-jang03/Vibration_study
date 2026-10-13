import { useMemo, useState } from 'react';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import ParamToggle from '../ui/ParamToggle';
import Plot, { type PlotSeries } from '../ui/Plot';
import Formula from '../ui/Formula';
import ReadoutTable from '../ui/ReadoutTable';
import { texNumber } from '../../lib/format';
import type { Lang } from '../../i18n';
import { k, makeT } from '../../i18n/lab';
import EN from '../../i18n/en/labs/TimeWaveformLab';
import { waveform, WAVE_PATTERNS, WAVE_LABELS, WAVE_CLUES, type WavePattern } from '../../lib/plots/waveform';

const QUIZ: WavePattern[] = ['clipped', 'am', 'impacts', 'beat', 'asymmetric', 'sine', 'truncated'];
const LABEL_KEY: Record<WavePattern, string> = {
  sine: k('정현파'), beat: k('맥놀이'), am: k('진폭 변조 (AM)'), impacts: k('반복 충격 울림'),
  truncated: k('한쪽 절단'), clipped: k('양쪽 클리핑'), asymmetric: k('위아래 비대칭'),
};
const CLUE_KEY: Record<WavePattern, string> = {
  sine: k('한 바퀴마다 같은 모양이 반복되고 위아래가 대칭입니다. 정현파라는 모양만으로 불평형을 확정하지는 않습니다.'),
  beat: k('가까운 두 성분(1X·1.1X)을 더했습니다. 크기가 10바퀴마다 커졌다 작아집니다. AM과 비슷한 모양이므로 성분 주파수도 함께 봅니다.'),
  am: k('1X 진폭이 0.1X 박자로 변합니다. 10바퀴를 봐야 변조 한 주기가 보입니다. 이 모델은 0.9X·1X·1.1X로 구성됩니다.'),
  impacts: k('한 바퀴에 세 번 울림이 시작됩니다. 울림 안의 여러 봉우리 대신 새로 시작하는 시각을 셉니다. 주황 점은 모델이 정한 사건 시각이며 자동 검출 결과가 아닙니다.'),
  truncated: k('아래쪽을 −0.25A에서 제한한 모양 예시입니다. 접촉으로 운동이 제한될 때 이런 절단을 의심하지만, 센서의 한쪽 포화도 같은 모양을 만들 수 있습니다.'),
  clipped: k('양쪽을 ±0.65A에서 제한했습니다. 센서·신호 조절기·ADC 과부하 여부와 입력 범위를 먼저 확인합니다. 양쪽 평탄부만으로 전기적 원인을 확정할 수는 없습니다.'),
  asymmetric: k('1X에 같은 위상의 2X를 0.35A만큼 더했습니다. 평균이 0이어도 위아래 Peak가 다릅니다. 비선형 접촉·풀림의 단서일 수 있지만 선형적인 성분 합성도 이런 모양을 만듭니다.'),
};

export default function TimeWaveformLab({ lang = 'ko' }: { lang?: Lang }) {
  const tr = makeT(lang, EN);
  const lab = (p: WavePattern) => (lang === 'en' ? tr(LABEL_KEY[p]) : WAVE_LABELS[p]);
  const clue = (p: WavePattern) => (lang === 'en' ? tr(CLUE_KEY[p]) : WAVE_CLUES[p]);
  const options = WAVE_PATTERNS.map(value => ({ value, label: lab(value) }));
  const [pattern, setPattern] = useState<WavePattern>('sine');
  const [rpm, setRpm] = useState(3000), [amp, setAmp] = useState(20);
  const [revs, setRevs] = useState(10), [noise, setNoise] = useState(0);
  const [quiz, setQuiz] = useState(false), [caseIndex, setCase] = useState(0);
  const [answer, setAnswer] = useState('unset'), [markers, setMarkers] = useState(true);
  const kind = quiz ? QUIZ[caseIndex] : pattern;
  const r = useMemo(() => waveform({ pattern: kind, rpm, amplitude: amp / 1e6, revolutions: revs, noise: noise / 1e6 }), [kind, rpm, amp, revs, noise]);
  const top = Math.max(...r.x.map(Math.abs)) * 1e6 * 1.1 || 1;
  const series: PlotSeries[] = [{ x: r.time.map(t => t * 1000), y: r.x.map(v => v * 1e6), name: quiz ? tr`문제 파형` : lab(kind), color: 'var(--plot-1)' }];
  if (markers) {
    series.push({ x: r.keyphasor.map(t => 1000 * t), y: r.keyphasor.map(() => top), name: tr`키페이저 (한 바퀴)`, mode: 'markers', color: 'var(--plot-3)' });
    if (!quiz && r.events.length) series.push({ x: r.events.map(t => 1000 * t), y: r.events.map(() => -top), name: tr`모델의 사건 시작`, mode: 'markers', color: 'var(--plot-2)' });
  }
  return (
    <LabFrame id="LAB-TWF-01" lang={lang} title={tr`시간파형: 패턴을 읽고 맞히기`}
      controls={<>
        <ParamToggle label={tr`패턴 맞히기 퀴즈`} checked={quiz} onChange={v => { setQuiz(v); setAnswer('unset'); }} />
        {quiz ? <>
          <ParamSelect label={tr`문제`} value={caseIndex} options={QUIZ.map((_, i) => ({ value: i, label: tr`문제 ${i + 1}` }))} onChange={v => { setCase(v); setAnswer('unset'); }} />
          <ParamSelect label={tr`어떤 모양인가요?`} value={answer} options={[{ value: 'unset', label: tr`근거를 생각한 뒤 선택하세요` }, ...options]} onChange={setAnswer} />
        </> : <ParamSelect label={tr`패턴`} value={pattern} options={options} onChange={setPattern} />}
        <ParamSlider label={tr`회전수`} value={rpm} min={1000} max={6000} step={250} unit="rpm" onChange={setRpm} />
        <ParamSlider label={tr`기준 진폭 A (Peak)`} value={amp} min={5} max={50} step={5} unit="µm" onChange={setAmp} hint={tr`합성 뒤 실제 Peak는 읽음값으로 확인`} />
        <ParamSlider label={tr`표시 바퀴 수`} value={revs} min={2} max={20} step={1} onChange={setRevs} />
        <ParamSlider label={tr`잡음 표준편차 σ`} value={noise} min={0} max={5} step={0.5} unit="µm" onChange={setNoise} />
        <ParamToggle label={tr`회전 기준 마커 표시`} checked={markers} onChange={setMarkers} />
      </>}
      formulas={<Formula display tex={`T_r=\\frac{60}{N_{\\rm rpm}}=\\frac{60}{${rpm}}=${texNumber(1000 / r.fr, 4)}\\,\\mathrm{ms},\\quad \\mathrm{CF}=\\frac{x_{\\rm Peak}}{x_{\\rm RMS}}=${texNumber(r.features.crestFactor, 4)},\\quad x_{\\rm pp}=${texNumber(r.features.peakToPeak * 1e6, 3)}\\,\\mathrm{\\mu m}`} />}
      readouts={<ReadoutTable rows={[
        { label: '1X', value: r.fr, unit: 'Hz' }, { label: tr`한 바퀴`, value: 1000 / r.fr, unit: 'ms' },
        { label: 'Pk-Pk', value: r.features.peakToPeak * 1e6, unit: 'µm' },
        { label: tr`Peak (절댓값 최대)`, value: Math.max(Math.abs(r.features.min), Math.abs(r.features.max)) * 1e6, unit: 'µm' },
        { label: tr`RMS (DC 포함)`, value: r.features.rms * 1e6, unit: 'µm' },
        { label: tr`AC RMS (평균 제거)`, value: r.features.acRms * 1e6, unit: 'µm' },
        { label: tr`Crest factor (DC 포함)`, value: r.features.crestFactor },
        { label: tr`평균`, value: r.features.mean * 1e6, unit: 'µm' },
        { label: tr`0 기준 상하 Peak 비대칭`, value: r.features.asymmetry },
        { label: tr`왜도 (평균 제거)`, value: r.features.skewness },
        ...(!quiz && r.eventInterval !== null ? [{ label: tr`모델 사건 간격`, value: r.eventInterval * 1000, unit: 'ms' }] : []),
      ]} />}
      tasks={[
        { question: tr`잡음 0, 3000 rpm, 3바퀴에서 반복 충격 울림을 고르세요. 한 바퀴에 울림이 몇 번 시작하나요?`, answer: tr`20 ms마다 키페이저가 찍히고 그 사이에 울림이 세 번 시작합니다. 사건 간격은 6.667 ms입니다. 울림 속 여러 봉우리를 각각 사건으로 세지 마세요.` },
        { question: tr`잡음 0, A=20 µm에서 맥놀이와 AM을 10바퀴 비교한 뒤 2바퀴로 줄이세요. 짧은 화면이 숨기는 것은?`, answer: tr`크기 변화 한 주기는 10바퀴입니다. 2바퀴는 그 일부만 보여 줍니다. 10바퀴에서 RMS는 맥놀이 10 µm, AM 15 µm이지만 2바퀴 읽음값은 이 기준과 달라집니다.` },
        { question: tr`한쪽 절단과 양쪽 클리핑 중 어느 것이 기계 결함인지 모양만 보고 확정할 수 있나요?`, answer: tr`확정할 수 없습니다. 두 패턴은 제한된 모양을 흉내 낸 설명용 신호입니다. 센서·측정 체인의 선형 범위와 과부하를 확인하고 다른 채널·운전 조건·스펙트럼을 함께 봅니다.` },
      ]}
      footer={<p>{tr`변위로 그린 설명용 신호이며 실제 결함의 운동방정식은 아닙니다. 회전당 256점, 잡음 시드 6101. 마커는 한 바퀴 한 번이며 퀴즈에서는 모델 사건 표식을 숨깁니다. 비대칭 지표는 (위쪽 절댓값 Peak − 아래쪽 절댓값 Peak) / 두 Peak 합으로 DC 이동에도 변합니다. 왜도와 평균을 함께 보세요.`}</p>}
    >
      <Plot series={series} x={{ label: tr`시각 [ms]`, range: [-0.02 * 1000 * revs / r.fr, 1000 * revs / r.fr] }} y={{ label: tr`변위 [µm]`, range: [-top * 1.15, top * 1.15] }} height={300} ariaLabel={tr`시간파형과 회전 기준 마커`} />
      {quiz ? answer === 'unset' ? <p>{tr`주기·대칭·평탄부·울림 시작을 살펴보고 모양을 고르세요. 진단 원인을 맞히는 문제는 아닙니다.`}</p> : <p role="status"><strong>{answer === kind ? tr`맞았습니다` : tr`다시 살펴보세요`}</strong> — {lab(kind)}: {clue(kind)}</p> : <p>{clue(kind)}</p>}
    </LabFrame>
  );
}