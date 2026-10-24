import React from "react";
import { NumberInput } from "../components/NumberInput.js";
export function Num({
  label,
  value,
  min = 0,
  max,
  integer = false,
  change,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  integer?: boolean;
  change: (v: number) => void;
}) {
  return (
    <label className="gd-field">
      <span>{label}</span>
      <NumberInput
        label={label}
        value={Number(value.toPrecision(12))}
        min={min}
        max={max}
        onCommit={(n) => change(integer ? Math.round(n) : n)}
      />
    </label>
  );
}
export function Choice({
  label,
  value,
  options,
  change,
}: {
  label: string;
  value: string;
  options: [string, string][];
  change: (value: string) => void;
}) {
  return (
    <label className="gd-field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => change(e.target.value)}
      >
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
