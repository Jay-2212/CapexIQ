"use client";

import { useFieldController, getFieldDefinition } from "../forms/useFieldController";
import { FieldShell } from "./FieldShell";

export function TextField({ path }: { path: string }) {
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
        <input
          id={id}
          type="text"
          className="field-shell__input"
          value={(field.value as string) ?? ""}
          maxLength={def.maxLength}
          aria-describedby={describedBy || undefined}
          aria-invalid={field.error !== null}
          onChange={(event) => field.setValue(event.target.value)}
        />
      )}
    />
  );
}
