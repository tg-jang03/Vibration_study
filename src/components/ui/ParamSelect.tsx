import { useId } from 'react';

export interface ParamOption<T extends string | number> {
  value: T;
  label: string;
}

interface ParamSelectProps<T extends string | number> {
  label: string;
  value: T;
  options: readonly ParamOption<T>[];
  hint?: string;
  disabled?: boolean;
  onChange: (value: T) => void;
}

/** 랩 공통 선택 상자 (윈도우 종류, LOR, F_max 같은 이산 선택) */
export default function ParamSelect<T extends string | number>({
  label,
  value,
  options,
  hint,
  disabled,
  onChange,
}: ParamSelectProps<T>) {
  const id = useId();
  const index = options.findIndex((o) => o.value === value);
  return (
    <div className="param param-select">
      <label htmlFor={id}>
        <span>{label}</span>
      </label>
      <select
        id={id}
        value={String(index)}
        disabled={disabled}
        onChange={(e) => {
          const option = options[Number(e.currentTarget.value)];
          if (option) onChange(option.value);
        }}
      >
        {options.map((o, i) => (
          <option key={String(o.value)} value={String(i)}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <small className="param-hint">{hint}</small>}
    </div>
  );
}
