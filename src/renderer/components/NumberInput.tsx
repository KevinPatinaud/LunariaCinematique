import React, { useEffect, useState } from 'react';
import { parseNumericInput } from '../../shared/editing.js';
interface Props {
  value: number; min: number; max: number; step?: number; onCommit: (value: number) => void;
  label?: string;
}
/** Keep partial edits local. Empty strings, minus signs and French decimal commas are not zero. */
export function NumberInput({ value, min, max, onCommit, label }: Props) {
  const [text, setText] = useState(String(value)), [invalid, setInvalid] = useState(false);
  useEffect(() => { setText(String(value)); setInvalid(false); }, [value]);
  const commit = () => {
    const parsed = parseNumericInput(text, min, max);
    if (parsed === null) { setText(String(value)); setInvalid(false); return; }
    setText(String(parsed)); setInvalid(false); if (parsed !== value) onCommit(parsed);
  };
  return <input type="text" inputMode="decimal" aria-label={label} aria-invalid={invalid || undefined}
    title={`Entre ${min} et ${max}`} value={text} onChange={e => { setText(e.target.value); setInvalid(parseNumericInput(e.target.value, min, max) === null); }}
    onBlur={commit} onKeyDown={e => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); e.currentTarget.blur(); }
      if (e.key === 'Escape') { e.stopPropagation(); setText(String(value)); setInvalid(false); }
    }}/>
}
