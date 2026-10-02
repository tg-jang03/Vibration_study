import { useId } from 'react';

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
  onChange: (value: number) => void;
}

/** 랩 공통 슬라이더 (M1.3에서 다듬는다) */
export default function ParamSlider({ label, value, min, max, step = 1, unit, format, onChange }: ParamSliderProps) {
  const id = useId();
  return (
    <div className="param-slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>
          {format ? format(value) : value}
          {unit ? ` ${unit}` : ''}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </div>
  );
}
