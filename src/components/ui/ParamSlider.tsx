import { useEffect, useId, useState } from 'react';
import { useRafCallback } from './hooks';

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
  onChange: (value: number) => void;
}

/**
 * 랩 공통 슬라이더.
 * 손잡이와 표시값은 즉시 움직이고, onChange(→ 계산·플롯)는 프레임당 한 번만 부른다.
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
  onChange,
}: ParamSliderProps) {
  const id = useId();
  const [shown, setShown] = useState(value);
  const commit = useRafCallback(onChange);

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
        onChange={(e) => {
          const v = Number(e.currentTarget.value);
          setShown(v);
          commit(v);
        }}
      />
      {hint && <small className="param-hint">{hint}</small>}
    </div>
  );
}
