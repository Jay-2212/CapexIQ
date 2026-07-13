"use client";

import { useFieldController, getFieldDefinition } from "../forms/useFieldController";
import { FieldShell } from "./FieldShell";

export function NumberField({ path }: { path: string }) {
  const field = useFieldController(path);
  const def = getFieldDefinition(path);

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
        <input
          id={id}
          type="number"
          className="field-shell__input"
          value={field.value ?? ""}
          min={def.min}
          max={def.max}
          step={def.decimalPlaces ? 1 / 10 ** def.decimalPlaces : 1}
          aria-describedby={describedBy || undefined}
          aria-invalid={field.error !== null}
          onChange={(event) => {
            const raw = event.target.value;
            field.setValue(raw === "" ? null : Number(raw));
          }}
        />
      )}
    />
  );
}
