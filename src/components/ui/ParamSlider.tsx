import { useEffect, useId, useRef, useState } from 'react';
import { useRafCallback } from './hooks';
import { snapDragValue } from './sliderSnap';

interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** 표시 단위 (예: 'Hz') */
  unit?: string;
  /** 표시값 형식. 기본은 그대로 */
  format?: (value: number) => string;
  /** 짧은 도움말 (슬라이더 아래 작은 글씨) */
  hint?: string;
  disabled?: boolean;
  /** 칸이 촘촘해 끌 때 반올림 격자로 옮겨지는 슬라이더에서, 격자 밖이어도 끌어서 닿게 할 값 (예: 3570 rpm). sliderSnap.ts */
  marks?: readonly number[];
  onChange: (value: number) => void;
}

/**
 * 랩 공통 슬라이더.
 * 손잡이와 표시값은 즉시 움직이고, onChange(→ 계산·플롯)는 프레임당 한 번만 부른다.
 * 칸이 1 px보다 촘촘하면 끌 때만 반올림 격자(50 rpm 등)로 옮긴다 — 끌어서 3600 rpm에 멈출 수 있게. 키보드는 step 그대로.
 */
export default function ParamSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  format,
  hint,
  disabled,
  marks,
  onChange,
}: ParamSliderProps) {
  const id = useId();
  const [shown, setShown] = useState(value);
  const commit = useRafCallback(onChange);
  const dragging = useRef(false);

  // 바깥에서 값이 바뀌면(프리셋 등) 따라간다
  useEffect(() => setShown(value), [value]);

  return (
    <div className="param param-slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>
          {format ? format(shown) : shown}
          {unit ? ` ${unit}` : ''}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={shown}
        disabled={disabled}
        onPointerDown={() => {
          dragging.current = true;
          const stop = () => { dragging.current = false; };
          window.addEventListener('pointerup', stop, { once: true });
          window.addEventListener('pointercancel', stop, { once: true });
        }}
        onKeyDown={() => { dragging.current = false; }}
        onChange={(e) => {
          const input = e.currentTarget;
          let v = Number(input.value);
          // 트랙 길이 = 입력 폭 − 손잡이 폭(약 16 px)
          if (dragging.current) v = snapDragValue(v, { min, max, step, marks, trackPx: input.clientWidth - 16 });
          setShown(v);
          commit(v);
        }}
      />
      {hint && <small className="param-hint">{hint}</small>}
    </div>
  );
}
