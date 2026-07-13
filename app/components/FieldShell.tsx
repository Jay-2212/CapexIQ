"use client";

// Common chrome around every field control: label, the "Typical" tag (ux-product-spec
// §6), the wizard tooltip (§4.B), and the live error message (wizard-state.md §2 —
// shown immediately, no debounce, cleared the instant the value becomes valid).

import type { ReactNode } from "react";
import { WizardFieldTooltip } from "./WizardFieldTooltip";

export function FieldShell({
  path,
  label,
  required,
  isTypical,
  error,
  tooltipKey,
  unit,
  children,
  renderControl,
}: {
  path: string;
  label: string;
  required: boolean;
  isTypical: boolean;
  error: string | null;
  tooltipKey: string | null;
  unit?: string;
  children?: ReactNode;
  renderControl: (props: { id: string; describedBy: string }) => ReactNode;
}) {
  // The dotted field path IS the DOM id — StepNav's disabled-"Next" focus behavior
  // (audit F7) looks fields up by this exact path, so it must be predictable rather
  // than React's opaque useId() output.
  const fieldId = path;
  const errorId = `${fieldId}-error`;
  const describedBy = error ? errorId : "";

  return (
    <div className="field-shell" data-invalid={error !== null} data-field-path={path}>
      <div className="field-shell__label-row">
        <label htmlFor={fieldId} className="field-shell__label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
          {unit && <span className="field-shell__unit"> ({unit})</span>}
        </label>
        {isTypical && <span className="field-shell__typical-tag">Typical</span>}
      </div>
      {renderControl({ id: fieldId, describedBy })}
      {children}
      {error && (
        <p id={errorId} role="alert" className="field-shell__error">
          {error}
        </p>
      )}
      <WizardFieldTooltip tooltipKey={tooltipKey} />
    </div>
  );
}
