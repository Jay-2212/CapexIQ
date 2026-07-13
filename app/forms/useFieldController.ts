"use client";

// One hook every field control (NumberField, SliderField, SelectField) builds on —
// CONVENTIONS.md §3's "no ad hoc validation logic duplicated inside a component."
// Wires a FieldDefinition.path to the reducer, computes the live (no-debounce)
// validation error, and the untouched/edited "Typical" tag state (ux-product-spec.md
// §6).

import { useWizard } from "./WizardContext";
import { getFieldDefinition } from "./fieldSchema";
import { getFieldValue } from "./fieldPath";
import { isFieldRequired, validateFieldValue } from "./wizardValidation";
import type { FieldValue } from "./wizardTypes";

export interface FieldController {
  path: string;
  label: string;
  value: FieldValue;
  error: string | null;
  required: boolean;
  isTypical: boolean;
  tooltipKey: string | null;
  setValue: (value: FieldValue) => void;
}

export function useFieldController(path: string): FieldController {
  const { state, dispatch } = useWizard();
  const def = getFieldDefinition(path);
  const value = getFieldValue(state, path);
  const required = isFieldRequired(def, state);
  const error = validateFieldValue(def, value, state);
  const touched = state.touched[path] === true;

  return {
    path,
    label: def.label,
    value,
    error,
    required,
    isTypical: !touched && value !== null && value !== "",
    tooltipKey: def.tooltipKey,
    setValue: (nextValue: FieldValue) =>
      dispatch({ type: "SET_FIELD", path, value: nextValue }),
  };
}

export { getFieldDefinition };
