"use client";

// One hook every field control (NumberField, SliderField, SelectField) builds on —
// CONVENTIONS.md §3's "no ad hoc validation logic duplicated inside a component."
// Wires a FieldDefinition.path to the reducer, computes the live (no-debounce)
// validation truth, and the untouched/edited "Typical" tag state (ux-product-spec.md
// §6).
//
// ISS-25: validation truth (whether the value is actually invalid) is always computed
// and always drives step-gating (wizardValidation.ts's isStepComplete/
// firstInvalidFieldOnStep read state directly, not through this hook, so gating is
// unaffected by anything below). What's gated here is *display* — a field's red error
// only surfaces once the user has touched that field (edited it) or attempted to
// advance past an incomplete step (ATTEMPT_STEP). A fresh, untouched page load never
// shows red. See wizard-state.md §2's "reveal" subsection.

import { useWizard } from "./WizardContext";
import { getFieldDefinition } from "./fieldSchema";
import { getFieldValue } from "./fieldPath";
import { isFieldRequired, stepForFieldPath, validateFieldValue } from "./wizardValidation";
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
  const rawError = validateFieldValue(def, value, state);
  const touched = state.touched[path] === true;
  const ownStep = stepForFieldPath(path);
  const attempted = ownStep !== null && state.attemptedSteps[ownStep] === true;
  const error = touched || attempted ? rawError : null;

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
