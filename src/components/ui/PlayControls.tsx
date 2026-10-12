import type { ReactNode } from 'react';
import type { PlayClock } from './hooks';
import type { Lang } from '../../i18n';
import { UI } from '../../i18n/ui';
import { useUi } from './lang';

export interface PlaySpeed {
  label: string;
  /** 애니메이션 시간 / 실제 시간 (1/20 = 실제의 20배 느리게) */
  rate: number;
}

interface PlayControlsProps {
  clock: PlayClock;
  speeds?: readonly PlaySpeed[];
  speed?: number;
  onSpeed?: (index: number) => void;
  /** 재생 단추 옆에 둘 조작 (보기 방식 토글 등) */
  children?: ReactNode;
  /** 오른쪽 끝의 상태 글 (지금 시각 등) */
  status?: ReactNode;
}

const ICON = { width: 11, height: 11, viewBox: '0 0 10 10', 'aria-hidden': true } as const;

/** 재생 배율 이름: 1보다 작으면 "실제의 1/N", 1이면 "실제 속도", 크면 "실제의 N배" */
export function rateLabel(rate: number, lang: Lang = 'ko'): string {
  const t = UI[lang];
  const fmt = (v: number) => String(Number(v.toPrecision(3)));
  return Math.abs(rate - 1) < 1e-9 ? t.rateReal : rate < 1 ? t.rateSlower(fmt(1 / rate)) : t.rateFaster(fmt(rate));
}

/** 회전체 그림용 재생 속도: 화면에서 1초에 0.25 · 0.5 · 1바퀴 (fr = 실제 회전 주파수 [Hz]) */
export function turnSpeeds(fr: number, turns: readonly number[] = [0.25, 0.5, 1], lang: Lang = 'ko'): PlaySpeed[] {
  const names = UI[lang].speedNames;
  return turns.map((k, i) => ({ rate: k / fr, label: `${names[i] ?? ''} (${rateLabel(k / fr, lang)})` }));
}

/** 움직이는 그림의 재생 막대 (D-044): 재생/멈춤 · 처음으로 · 재생 속도. 시계는 usePlayClock. */
export default function PlayControls({ clock, speeds, speed = 0, onSpeed, children, status }: PlayControlsProps) {
  const t = useUi();
  return (
    <div className="anim-toolbar">
      <button className="lab-button anim-button" type="button" onClick={clock.toggle} aria-pressed={clock.playing}>
        {clock.playing ? (
          <svg {...ICON}><rect x="1.5" y="1" width="2.6" height="8" fill="currentColor" /><rect x="5.9" y="1" width="2.6" height="8" fill="currentColor" /></svg>
        ) : (
          <svg {...ICON}><path d="M2 1 L9 5 L2 9 Z" fill="currentColor" /></svg>
        )}
        {clock.playing ? t.pause : t.play}
      </button>
      <button className="lab-button anim-button" type="button" onClick={clock.reset}>
        <svg {...ICON}><path d="M2.2 3.4 A3.6 3.6 0 1 1 1.6 6.4" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M0.6 1.2 L2.6 4.2 L4.6 1.9 Z" fill="currentColor" /></svg>
        {t.restart}
      </button>
      {speeds && speeds.length > 1 && (
        <label className="anim-speed">
          {t.playSpeed}
          <select value={speed} onChange={(e) => onSpeed?.(Number(e.target.value))}>
            {speeds.map((s, i) => (
              <option key={s.label} value={i}>{s.label}</option>
            ))}
          </select>
        </label>
      )}
      {children}
      {status && <span className="anim-status">{status}</span>}
    </div>
  );
}
