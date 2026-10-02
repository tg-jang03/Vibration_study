import { useId } from 'react';

interface ParamToggleProps {
  label: string;
  checked: boolean;
  hint?: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

/** 랩 공통 켜기/끄기 (AAF on/off, 윈도우 적용 유무, 표시 토글 등) */
export default function ParamToggle({ label, checked, hint, disabled, onChange }: ParamToggleProps) {
  const id = useId();
  return (
    <div className="param param-toggle">
      <label htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.currentTarget.checked)}
        />
        <span>{label}</span>
      </label>
      {hint && <small className="param-hint">{hint}</small>}
    </div>
  );
}
