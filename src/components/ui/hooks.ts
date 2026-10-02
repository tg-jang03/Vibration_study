import { useCallback, useEffect, useRef } from 'react';

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
