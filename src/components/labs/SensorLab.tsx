import { useMemo, useState } from 'react';
import Formula from '../ui/Formula';
import LabFrame from '../ui/LabFrame';
import ParamSelect from '../ui/ParamSelect';
import ParamSlider from '../ui/ParamSlider';
import Plot, { type PlotSeries } from '../ui/Plot';
import ReadoutTable from '../ui/ReadoutTable';
import { formatNumber, texNumber } from '../../lib/format';
import { flatBand, MOUNTS, sensorResponse, type MountKind } from '../../lib/sensor';

/**
 * LAB-SNS-01 센서 = 질량-스프링 계 (P3-1, Contents §5-1).
 * 가속도계(공진 아래 r ≪ 1)와 동전형 속도계(고유진동수 위 r ≫ 1)의 응답, 마운팅에 따른 설치 공진, 측정 스펙트럼의 왜곡.
 * 계산: src/lib/sensor.ts (lib/mck의 H(r)·r²H(r)). 본문 그림 3 ~ 6과 같은 모델.
 */

type Kind = 'accelerometer' | 'velocity';
type Mount = MountKind | 'custom';
const MOUNT_OPTIONS: { value: Mount; label: string }[] = [
  ...(Object.keys(MOUNTS) as MountKind[]).map((k) => ({ value: k, label: `${MOUNTS[k].label} — 예시 ${formatNumber(MOUNTS[k].fn / 1000, 3)} kHz` })),
  { value: 'custom', label: '직접 설정' },
];
const deg = (rad: number) => (rad * 180) / Math.PI;
const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);

export interface SensorLabProps {
  initialKind?: Kind;
  initialMount?: Mount;
}

export default function SensorLab({ initialKind = 'accelerometer', initialMount = 'stud' }: SensorLabProps) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [mount, setMount] = useState<Mount>(initialKind === 'accelerometer' ? initialMount : 'custom');
  const [accFn, setAccFn] = useState(initialMount !== 'custom' ? MOUNTS[initialMount].fn / 1000 : 25);
  const [velFn, setVelFn] = useState(10);
  const [zeta, setZeta] = useState(initialKind === 'velocity' ? 0.6 : initialMount !== 'custom' ? MOUNTS[initialMount].zeta : 0.02);
  const [testF, setTestF] = useState(initialKind === 'velocity' ? 5 : 5000);

  const acc = kind === 'accelerometer';
  const fn = acc ? accFn * 1000 : velFn;
  const chooseMount = (m: Mount) => {
    setMount(m);
    if (m !== 'custom') { setAccFn(MOUNTS[m].fn / 1000); setZeta(MOUNTS[m].zeta); }
  };
  const chooseKind = (k: Kind) => {
    setKind(k);
    if (k === 'velocity') { setZeta(0.6); setTestF(5); setMount('custom'); }
    else { chooseMount('stud'); setTestF(5000); }
  };

  const view = useMemo(() => {
    const [lo, hi] = acc ? [10, 50000] : [0.5, 2000];
    const n = 400;
    const f = Array.from({ length: n }, (_, i) => lo * (hi / lo) ** (i / (n - 1)));
    const res = f.map((ff) => sensorResponse(kind, ff, fn, zeta));
    const band = flatBand(kind, fn, zeta);
    // 측정 스펙트럼: 실제 크기 1인 성분들
    const lines = acc ? [500, 1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 15000] : [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    const read = lines.map((ff) => sensorResponse(kind, ff, fn, zeta).ratio);
    return { f, res, band, lines, read, lo, hi };
  }, [acc, kind, fn, zeta]);

  const at = sensorResponse(kind, testF, fn, zeta);
  const respSeries: PlotSeries[] = [
    { x: view.f, y: view.res.map((r) => Math.min(r.ratio, 10)), name: '읽은 값 ÷ 실제 값', color: 'var(--plot-1)', width: 2.2 },
    { x: [view.lo, view.hi], y: [1.1, 1.1], name: '±10 %', color: 'var(--text-muted)', dash: 'dash', width: 1 },
    { x: [view.lo, view.hi], y: [0.9, 0.9], name: '±10 %', color: 'var(--text-muted)', dash: 'dash', width: 1, hideInLegend: true },
    { x: [testF], y: [Math.min(at.ratio, 10)], name: `시험 주파수 ${formatNumber(testF, 4)} Hz`, mode: 'markers', color: 'var(--plot-2)', markerSize: 11 },
  ];
  const phaseSeries: PlotSeries[] = [
    { x: view.f, y: view.res.map((r) => clean(deg(r.phaseError))), name: acc ? '위상 지연 [°]' : '위상 차이 [°]', color: 'var(--plot-3)', width: 2.2 },
    { x: [testF], y: [clean(deg(at.phaseError))], name: '시험 주파수', mode: 'markers', color: 'var(--plot-2)', markerSize: 11 },
  ];
  const specSeries: PlotSeries[] = [
    { x: view.lines, y: view.lines.map(() => 1), name: '기계의 실제 크기', mode: 'markers', color: 'var(--text-muted)', markerSize: 9 },
    { x: view.lines, y: view.read.map((r) => Math.min(r, 6)), name: '센서가 읽은 크기', mode: 'lines+markers', color: 'var(--plot-4)', markerSize: 9 },
  ];

  return (
    <LabFrame id="LAB-SNS-01" title="센서 = 질량-스프링 계: 어디서 평탄한가"
      controls={<>
        <ParamSelect label="센서" value={kind} options={[{ value: 'accelerometer', label: '가속도계 (압전)' }, { value: 'velocity', label: '동전형 속도계' }]} onChange={chooseKind} />
        {acc && <ParamSelect label="마운팅 (설치 공진)" value={mount} options={MOUNT_OPTIONS} onChange={chooseMount} hint="설치 공진은 예시값입니다 (I-025)" />}
        {acc
          ? <ParamSlider label="가속도계 공진 (설치 상태 포함)" value={accFn} min={1} max={50} step={0.5} unit="kHz" onChange={(v) => { setAccFn(v); setMount('custom'); }} />
          : <ParamSlider label="속도계 고유진동수" value={velFn} min={4} max={20} step={0.5} unit="Hz" onChange={setVelFn} />}
        <ParamSlider label="감쇠비 ζ" value={zeta} min={0.01} max={0.7} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => { setZeta(v); if (acc) setMount('custom'); }} />
        <ParamSlider label="시험 주파수" value={testF} min={acc ? 100 : 1} max={acc ? 20000 : 500} step={acc ? 100 : 0.5} unit="Hz" format={(v) => (acc ? formatNumber(v, 4) : v.toFixed(1))} onChange={setTestF} />
      </>}
      formulas={<>
        <Formula display tex={'r = \\frac{f}{f_n} = \\frac{' + texNumber(testF, 4) + '}{' + texNumber(fn, 4) + '} = ' + texNumber(testF / fn, 3)} />
        {acc
          ? <Formula display tex={'\\frac{\\text{읽은 가속도}}{\\text{실제 가속도}} = H(r) = \\frac{1}{\\sqrt{(1-r^2)^2 + (2\\zeta r)^2}} = ' + texNumber(at.ratio, 4)} />
          : <Formula display tex={'\\frac{\\text{읽은 속도}}{\\text{실제 속도}} = r^2 H(r) = \\frac{r^2}{\\sqrt{(1-r^2)^2 + (2\\zeta r)^2}} = ' + texNumber(at.ratio, 4)} />}
        <p>{acc ? '가속도계는 공진보다 훨씬 낮은 곳(r ≪ 1)에서 1에 가깝습니다. 감쇠를 무시하면 ±10 % 상한은 r ≈ 0.30입니다.' : '속도계는 고유진동수보다 높은 곳(r ≫ 1)에서 1에 가깝습니다. 감쇠를 0.6 근처로 키우면 고유진동수 근처의 부풀림이 사라집니다.'}</p>
      </>}
      readouts={<ReadoutTable caption="읽음값" rows={[
        { label: '센서 고유진동수 (설치 공진)', value: fn, unit: 'Hz' },
        { label: acc ? '±10 % 평탄 대역의 위 끝 (0 Hz부터)' : '±10 % 평탄 대역의 아래 끝 (그 위로 평탄)', value: acc ? view.band.hi : view.band.lo, unit: 'Hz' },
        { label: '시험 주파수의 진폭비 (읽은 ÷ 실제)', value: at.ratio, theory: 1 },
        { label: acc ? '시험 주파수의 위상 지연' : '시험 주파수의 위상 차이', value: clean(deg(at.phaseError)), unit: '°' },
      ]} />}
      tasks={[
        { question: '공진 25 kHz(감쇠 0.02) 가속도계의 ±10 % 상한은? 감쇠를 0.01로 줄이면 달라지나요?',
          answer: '약 7.5 kHz(공진의 0.30배)입니다. 감쇠가 작을 때는 거의 그대로입니다 — 상한은 주로 공진 주파수가 정합니다.' },
        { question: '마운팅을 스터드 → 자석으로 바꾸고 시험 주파수를 5 kHz로 두면 몇 배로 읽나요?',
          answer: '설치 공진 예시 7 kHz에서 5 kHz는 r ≈ 0.71이라 약 2.0배로 읽힙니다. ±10 % 상한이 약 2.1 kHz로 내려가므로, 자석 마운트로는 수 kHz 성분의 크기를 믿기 어렵습니다.' },
        { question: '속도계(고유 10 Hz, 감쇠 0.6)로 5 Hz(300 rpm 기계의 1X)를 재면? 감쇠를 0.1로 낮추면 20 Hz는?',
          answer: '5 Hz는 실제의 약 26 %로 작게, 위상도 140° 넘게 어긋나게 읽힙니다. 감쇠 0.1이면 20 Hz는 고유진동수 근처의 부풀림 때문에 약 1.3배로 크게 읽힙니다. 저속 기계에는 가속도계나 비접촉 변위 센서가 맞습니다.' },
        { question: '속도계의 감쇠를 0.1 → 0.6 → 0.7로 바꾸면 ±10 % 아래 경계는 어떻게 움직이나요?',
          answer: '0.1에서는 약 33 Hz, 0.6에서 약 11 Hz로 내려갑니다. 0.7로 더 키우면 오히려 약 14 Hz로 올라갑니다 — 부풀림은 사라지지만 고유진동수 근처가 1보다 작아지기 때문입니다. 적당한 감쇠(0.6 안팎)가 가장 넓습니다.' },
      ]}
      footer={<p>센서는 통 안의 질량-스프링(기초가진 1자유도 계)으로 보고 계산했습니다 (P1-4의 진폭비 H(r)). 실제 센서에는 이 밖에도 전기적 필터·케이블·증폭기의 대역이 더해집니다 (P3-4).</p>}
    >
      <h4>센서의 응답 (읽은 값 ÷ 실제 값, 로그 주파수)</h4>
      <Plot series={respSeries} x={{ label: '주파수 [Hz]', log: true }} y={{ label: '진폭비', range: [0, 3] }} height={260} ariaLabel="센서의 진폭 응답" />
      <Plot series={phaseSeries} x={{ label: '주파수 [Hz]', log: true }} y={{ label: '[°]', range: acc ? [0, 180] : [-180, 0] }} height={200} ariaLabel="센서의 위상 응답" />
      <h4>기계의 실제 크기 1인 성분들을 이 센서로 재면</h4>
      <Plot series={specSeries} x={{ label: '주파수 [Hz]', log: true }} y={{ label: '읽은 크기', range: [0, 4] }} height={240} ariaLabel="실제 성분과 센서가 읽은 크기" />
    </LabFrame>
  );
}
