"use client";

// Paired slider + numeric input (every slider in this product has both — a slider
// alone isn't precise enough for a CFO-scrutinized figure). Drag timing per
// wizard-state.md §5: the visible value updates immediately every input event; the
// reducer dispatch (which drives the live preview recalculation) is debounced
// ~120ms during drag and flushed immediately on release or blur. The paired numeric
// input always dispatches immediately, no debounce, per §5's "plain typed-field
// rule." Simplification, noted for a future pass: keyboard arrow-key presses on the
// slider thumb currently share the same ~120ms debounce as pointer drag rather than
// their own zero-debounce path — a minor, barely perceptible delay, not a
// correctness issue (see HANDOFF.md's Phase 6 entry).

import { useEffect, useRef, useState } from "react";
import { useFieldController, getFieldDefinition } from "../forms/useFieldController";
import { FieldShell } from "./FieldShell";

const DRAG_DEBOUNCE_MS = 120;

export function SliderField({ path }: { path: string }) {
  const field = useFieldController(path);
  const def = getFieldDefinition(path);
  const [localValue, setLocalValue] = useState<number>(
    typeof field.value === "number" ? field.value : (def.min ?? 0)
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof field.value === "number") setLocalValue(field.value);
  }, [field.value]);

  const commit = (value: number, immediate: boolean) => {
    setLocalValue(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (immediate) {
      field.setValue(value);
    } else {
      debounceTimer.current = setTimeout(() => field.setValue(value), DRAG_DEBOUNCE_MS);
    }
  };

  const flush = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    field.setValue(localValue);
  };

  return (
    <FieldShell
      path={path}
      label={field.label}
      required={field.required}
      isTypical={field.isTypical}
      error={field.error}
      tooltipKey={field.tooltipKey}
      unit={def.unit}
      renderControl={({ id, describedBy }) => (
        <div className="slider-field">
          <input
            id={id}
            type="range"
            className="slider-field__range"
            min={def.min}
            max={def.max}
            step={def.sliderStep ?? 1}
            value={localValue}
            aria-describedby={describedBy || undefined}
            aria-invalid={field.error !== null}
            onInput={(event) => commit(Number(event.currentTarget.value), false)}
            onPointerUp={flush}
            onTouchEnd={flush}
            onBlur={flush}
          />
          <input
            type="number"
            className="slider-field__number"
            min={def.min}
            max={def.max}
            step={def.decimalPlaces ? 1 / 10 ** def.decimalPlaces : (def.sliderStep ?? 1)}
            value={localValue}
            aria-label={`${field.label}, exact value`}
            onChange={(event) => {
              const raw = event.target.value;
              const numeric = raw === "" ? (def.min ?? 0) : Number(raw);
              setLocalValue(numeric);
              field.setValue(numeric);
            }}
          />
        </div>
      )}
    />
  );
}
