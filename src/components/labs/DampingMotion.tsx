import { useEffect, useId, useMemo, useRef, useState } from 'react';
import ParamSlider from '../ui/ParamSlider';
import PlayControls from '../ui/PlayControls';
import ReadoutTable from '../ui/ReadoutTable';
import { usePlayClock } from '../ui/hooks';
import { formatNumber } from '../../lib/format';
import { dampedMotionAt, nextDampedPeak } from '../../lib/mck/dampedAnimation';
import type { SdofSystem } from '../../lib/mck/sdof';

const SPEEDS = [
  { label: '실제의 1/10', rate: .1 }, { label: '실제의 1/4', rate: .25 },
  { label: '실제의 1/2', rate: .5 }, { label: '실제 속도', rate: 1 },
];
const DURATION = 2;
const MAX_X0_MM = 20; // MCK-01처럼 고정 축척: 처음 변위 2배 → 그림의 움직이는 폭도 2배.

function springPath(x1: number, x2: number, y: number) {
  const lead = 16, span = x2 - x1 - 2 * lead;
  const points = [[x1, y], [x1 + lead, y], ...Array.from({ length: 18 }, (_, i) => [x1 + lead + (i + .5) / 18 * span, y + (i % 2 ? -14 : 14)]), [x2 - lead, y], [x2, y]];
  return points.map(([x, py], i) => `${i ? 'L' : 'M'}${x},${py}`).join(' ');
}

interface DampingMotionProps {
  system: SdofSystem;
  x0Mm: number;
  time: readonly number[];
  displacement: readonly number[];
  envelope: readonly number[];
  peaks: { t: number[]; x: number[] };
  yLimit: number;
  showEnvelope: boolean;
  showPeaks: boolean;
  /** 재생 속도 (랩 본체가 들고 있어 매개변수를 바꿔도 유지) */
  speed: number;
  onSpeed: (i: number) => void;
}

/** 공통 시계는 이 그림만 갱신한다. 랩 본체의 전체 파형 Plot은 재생 중 그대로 유지. */
export default function DampingMotion({ system, x0Mm, time, displacement, envelope, peaks, yLimit, showEnvelope, showPeaks, speed, onSpeed }: DampingMotionProps) {
  const panel = useRef<HTMLDivElement>(null);
  const arrowId = useId().replace(/:/g, '');
  const [offset, setOffset] = useState(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const clock = usePlayClock(SPEEDS[speed].rate, undefined, panel);
  const elapsed = seekTime ?? Math.min(DURATION, offset + clock.t);
  const current = dampedMotionAt(system, { x0: x0Mm / 1000 }, elapsed);
  const currentMm = current.x * 1000;
  const massX = 350 + currentMm * 58 / MAX_X0_MM, pistonX = massX - 187;
  // 감쇠력 화살표: 1 N = 60 px (기본값 최대 0.91 N), 길이는 90 px에서 자름
  const fc = current.dampingForce;
  const fcLen = Math.min(90, Math.abs(fc) * 60);
  const nextPeak = nextDampedPeak(system, elapsed, DURATION);
  useEffect(() => { if (elapsed >= DURATION && clock.playing) clock.pause(); }, [elapsed, clock.playing, clock.pause]);
  // 시계 훅의 RAF 정리 후 탐색 원점을 옮겨, 같은 프레임의 재생 tick이 탐색 시각에 더해지지 않게 한다.
  useEffect(() => {
    if (seekTime !== null && !clock.playing) { clock.reset(); setOffset(seekTime); setSeekTime(null); }
  }, [seekTime, clock.playing, clock.reset]);
  const seek = (t: number) => { clock.pause(); setSeekTime(t); };
  const toggle = () => { if (elapsed >= DURATION) { clock.reset(); setOffset(0); clock.play(); } else clock.toggle(); };
  const controls = { ...clock, toggle, reset: () => seek(0) };

  const X0 = 58, X1 = 498, Y0 = 28, Y1 = 202;
  const tx = (t: number) => X0 + t / DURATION * (X1 - X0);
  const xy = (x: number) => (Y0 + Y1) / 2 - x / yLimit * (Y1 - Y0) / 2;
  const paths = useMemo(() => {
    const points = (values: readonly number[]) => time.map((t, i) => `${i ? 'L' : 'M'}${tx(t).toFixed(2)},${xy(values[i]).toFixed(2)}`);
    return { response: points(displacement), upper: envelope.length ? points(envelope).join(' ') : '', lower: envelope.length ? points(envelope.map(x => -x)).join(' ') : '' };
  }, [time, displacement, envelope, yLimit]);
  const count = Math.max(1, Math.floor(elapsed / DURATION * (time.length - 1)) + 1);
  // 마지막 점은 격자 근사가 아닌 장치와 같은 시각의 해석해다.
  const shownPath = paths.response.slice(0, count).join(' ') + ` L${tx(elapsed)},${xy(currentMm)}`;

  return (
    <div ref={panel} className="anim-panel" data-damp-time={elapsed} data-damp-x={currentMm}>
      <PlayControls clock={controls} speeds={SPEEDS} speed={speed} onSpeed={onSpeed} status={`t = ${elapsed.toFixed(3)} s${elapsed >= DURATION ? ' · 2초 구간 끝' : ''}`}>
        <button type="button" className="lab-button" disabled={nextPeak === null} onClick={() => { if (nextPeak !== null) seek(nextPeak); }}>다음 양의 피크</button>
      </PlayControls>
      <div onPointerDownCapture={clock.pause} onKeyDownCapture={clock.pause}>
        <ParamSlider label="선택 시각 t" value={elapsed} min={0} max={DURATION} step={.001} unit="s" format={v => v.toFixed(3)} onChange={seek} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '.5rem' }}>
        <svg viewBox="0 0 520 252" role="img" aria-label="질량·스프링·댐퍼의 감쇠 자유진동. 오른쪽이 양의 변위" style={{ display: 'block', width: '100%', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
          <line x1={52} y1={35} x2={52} y2={180} stroke="var(--text-muted)" strokeWidth={4} />
          {Array.from({ length: 11 }, (_, i) => <line key={i} x1={30} y1={43 + i * 13} x2={52} y2={31 + i * 13} stroke="var(--text-muted)" />)}
          <text x={350} y={225} textAnchor="middle" fontSize={18} fill="var(--text-muted)">평형 x = 0</text>
          <path d={springPath(52, massX - 42, 88)} fill="none" stroke="var(--plot-1)" strokeWidth={3} />
          <text x={170} y={63} textAnchor="middle" fontSize={18} fill="var(--text-muted)">스프링 k</text>
          <line x1={52} y1={147} x2={88} y2={147} stroke="var(--plot-3)" strokeWidth={3} />
          <rect x={88} y={133} width={150} height={28} fill="none" stroke="var(--plot-3)" strokeWidth={2} />
          <line data-damp-piston="true" x1={pistonX} y1={136} x2={pistonX} y2={158} stroke="var(--plot-3)" strokeWidth={3} />
          <line x1={pistonX} y1={147} x2={massX - 42} y2={147} stroke="var(--plot-3)" strokeWidth={3} />
          <text x={163} y={190} textAnchor="middle" fontSize={18} fill="var(--text-muted)">댐퍼 c</text>
          <rect data-damp-mass="true" x={massX - 42} y={65} width={84} height={112} rx={7} fill="var(--accent-soft)" stroke="var(--plot-1)" strokeWidth={3} />
          <text x={massX} y={123} textAnchor="middle" fontSize={24} fontWeight={700} fill="var(--text)">m</text>
          <line x1={350} y1={28} x2={350} y2={205} stroke="var(--text-muted)" strokeDasharray="5 5" opacity={0.7} />
          <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--plot-3)" /></marker></defs>
          {fcLen > 2 && <><line data-damp-force="true" x1={massX} y1={48} x2={massX + Math.sign(fc) * fcLen} y2={48} stroke="var(--plot-3)" strokeWidth={3} markerEnd={`url(#${arrowId})`} /><text x={massX + Math.sign(fc) * fcLen / 2} y={42} textAnchor="middle" fontSize={15} fill="var(--plot-3)">감쇠력</text></>}
          <text x={505} y={20} textAnchor="end" fontSize={18} fill="var(--text)">x = {formatNumber(currentMm, 4)} mm</text>
          <text x={505} y={245} textAnchor="end" fontSize={15} fill="var(--text-muted)">+x →</text>
        </svg>
        <svg viewBox="0 0 520 252" role="img" aria-label="질량과 같은 시각에 그려지는 변위 파형과 현재 점" style={{ display: 'block', width: '100%' }}>
          <text x={278} y={18} textAnchor="middle" fontSize={18} fill="var(--text)">변위 x [mm] · 지금까지의 파형</text>
          {[0, .5, 1, 1.5, 2].map(t => <g key={t}><line x1={tx(t)} y1={Y0} x2={tx(t)} y2={Y1} stroke="var(--border)" /><text x={tx(t)} y={226} textAnchor="middle" fontSize={16} fill="var(--text-muted)">{t}</text></g>)}
          {[-yLimit, 0, yLimit].map(x => <g key={x}><line x1={X0} y1={xy(x)} x2={X1} y2={xy(x)} stroke="var(--border)" /><text x={X0 - 6} y={xy(x) + 4} textAnchor="end" fontSize={16} fill="var(--text-muted)">{formatNumber(x, 3)}</text></g>)}
          <text x={278} y={248} textAnchor="middle" fontSize={16} fill="var(--text-muted)">시간 t [s]</text>
          {showEnvelope && envelope.length > 0 && <><path d={paths.upper} fill="none" stroke="var(--text-muted)" strokeDasharray="5 4" /><path d={paths.lower} fill="none" stroke="var(--text-muted)" strokeDasharray="5 4" /></>}
          <path data-damp-trace="true" d={shownPath} fill="none" stroke="var(--plot-1)" strokeWidth={2.3} />
          {showPeaks && peaks.t.map((t, i) => t <= elapsed && <circle key={t} data-damp-peak="true" cx={tx(t)} cy={xy(peaks.x[i])} r={4} fill="var(--plot-2)" />)}
          <line x1={tx(elapsed)} y1={Y0} x2={tx(elapsed)} y2={Y1} stroke="var(--plot-2)" strokeDasharray="3 3" />
          <circle data-damp-point="true" cx={tx(elapsed)} cy={xy(currentMm)} r={5} fill="var(--plot-1)" />
        </svg>
      </div>
      <p className="anim-caption">질량과 댐퍼의 피스톤은 같은 변위로 움직입니다. 초록 화살표는 감쇠력 −cv입니다 — 늘 움직이는 방향의 반대이고, 피크(속도 0)에서 0, 평형을 지날 때(가장 빠를 때) 가장 큽니다. 장치 그림은 ±20 mm의 고정 축척이고, 파형의 세로축은 처음 변위·포락선에 맞춥니다. “다음 양의 피크”를 눌러 한 왕복 뒤의 감소를 비교하세요. 감쇠가 있는 계는 정확히 몇 번 만에 멈추기보다 점점 작아집니다. 2초 구간 끝에서는 재생만 멈춥니다.</p>
      <ReadoutTable caption="움직이는 장치의 현재 순간" rows={[
        { label: '현재 시각 t', value: elapsed, unit: 's', sig: 4 },
        { label: '현재 변위 x', value: currentMm, unit: 'mm', sig: 4 },
        { label: '현재 속도 v', value: current.v, unit: 'm/s', sig: 4 },
        { label: '감쇠력 −cv', value: current.dampingForce, unit: 'N', sig: 4 },
      ]} />
    </div>
  );
}
