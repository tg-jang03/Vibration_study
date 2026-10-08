import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * 콜백을 애니메이션 프레임당 최대 한 번, 마지막 값으로만 실행한다.
 * 슬라이더 드래그처럼 입력 이벤트가 화면 갱신보다 자주 오는 경우에 쓴다 (Roadmap §5-8).
 */
export function useRafCallback<T>(fn: (value: T) => void): (value: T) => void {
  const fnRef = useRef(fn);
  const frame = useRef<number | null>(null);
  const latest = useRef<T | undefined>(undefined);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return useCallback((value: T) => {
    latest.current = value;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      fnRef.current(latest.current as T);
    });
  }, []);
}

export interface PlayClock {
  /** 애니메이션 속 시각 [s] (신호의 시간). period가 있으면 0 ~ period를 되풀이한다 */
  t: number;
  playing: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** t = 0으로 (재생 상태는 그대로) */
  reset: () => void;
}

/**
 * 애니메이션 시계 (PageGuide §6-4, D-044). 첫 렌더는 t = 0·정지라 서버 렌더와 같다 (I-019).
 * 재생 중에는 requestAnimationFrame마다 t를 (지난 실제 시간 × rate)만큼 늘린다 — rate = 1/20이면 실제의 20배 느리게.
 * target 요소가 화면 밖으로 나가면 저절로 멈춘다 (한 페이지에 같은 랩이 여러 개일 때 헛돌지 않게).
 * 이 훅을 쓰는 컴포넌트만 매 프레임 다시 그려지므로, Plot이 있는 랩 본체가 아니라 그림 부분 컴포넌트 안에서 쓴다.
 */
export function usePlayClock(rate: number, period?: number, target?: RefObject<Element | null>): PlayClock {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rateRef = useRef(rate);
  const periodRef = useRef(period);

  useEffect(() => {
    rateRef.current = rate;
    periodRef.current = period;
  });

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      // 탭이 가려졌다 돌아오면 한 번에 크게 건너뛰지 않게 한 프레임을 0.1 s로 자른다
      const dt = last === null ? 0 : Math.min(0.1, (now - last) / 1000) * rateRef.current;
      last = now;
      if (dt > 0) {
        setT((prev) => {
          const next = prev + dt;
          const p = periodRef.current;
          return p && p > 0 ? next % p : next;
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    const el = target?.current;
    if (!playing || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [playing, target]);

  // 되풀이 길이가 줄어 지금 t가 범위를 벗어나면 안으로 접는다
  useEffect(() => {
    if (period && period > 0 && t >= period) setT(t % period);
  }, [period, t]);

  return {
    t,
    playing,
    play: useCallback(() => setPlaying(true), []),
    pause: useCallback(() => setPlaying(false), []),
    toggle: useCallback(() => setPlaying((p) => !p), []),
    reset: useCallback(() => setT(0), []),
  };
}
