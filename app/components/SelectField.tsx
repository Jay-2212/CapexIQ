"use client";

import { useFieldController, getFieldDefinition } from "../forms/useFieldController";
import { FieldShell } from "./FieldShell";

export function SelectField({ path }: { path: string }) {
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
      renderControl={({ id, describedBy }) => (
        <select
          id={id}
          className="field-shell__select"
          value={(field.value as string) ?? ""}
          aria-describedby={describedBy || undefined}
          aria-invalid={field.error !== null}
          onChange={(event) => field.setValue(event.target.value || null)}
        >
          <option value="" disabled>
            Select…
          </option>
          {(def.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    />
  );
}
