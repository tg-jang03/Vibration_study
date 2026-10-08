import type { ReactNode } from 'react';
import type { PlayClock } from './hooks';

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

/** 움직이는 그림의 재생 막대 (D-044): 재생/멈춤 · 처음으로 · 재생 속도. 시계는 usePlayClock. */
export default function PlayControls({ clock, speeds, speed = 0, onSpeed, children, status }: PlayControlsProps) {
  return (
    <div className="anim-toolbar">
      <button className="lab-button anim-button" type="button" onClick={clock.toggle} aria-pressed={clock.playing}>
        {clock.playing ? (
          <svg {...ICON}><rect x="1.5" y="1" width="2.6" height="8" fill="currentColor" /><rect x="5.9" y="1" width="2.6" height="8" fill="currentColor" /></svg>
        ) : (
          <svg {...ICON}><path d="M2 1 L9 5 L2 9 Z" fill="currentColor" /></svg>
        )}
        {clock.playing ? '멈춤' : '재생'}
      </button>
      <button className="lab-button anim-button" type="button" onClick={clock.reset}>
        <svg {...ICON}><path d="M2.2 3.4 A3.6 3.6 0 1 1 1.6 6.4" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M0.6 1.2 L2.6 4.2 L4.6 1.9 Z" fill="currentColor" /></svg>
        처음으로
      </button>
      {speeds && speeds.length > 1 && (
        <label className="anim-speed">
          재생 속도
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
