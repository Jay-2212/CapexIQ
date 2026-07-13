"use client";

// Group A — Revenue realization and payer mix (SPEC.md §11.1 A). One row per payer
// type; the group-sum-to-100 error is anchored once to the group heading and
// referenced by all 5 share sliders' aria-describedby (wizard-state.md §2, audit F8).

import { useId } from "react";
import { useWizard } from "../forms/WizardContext";
import { PAYER_TYPES } from "../forms/payerAndRampKeys";
import { payerMixGroupError } from "../forms/wizardValidation";
import { FieldRenderer } from "../components/FieldRenderer";

export function GroupA() {
  const { state } = useWizard();
  const groupErrorId = useId();
  const groupError = payerMixGroupError(state);

  return (
    <fieldset className="advanced-group">
      <legend>A. Revenue realization and payer mix</legend>
      {groupError && (
        <p id={groupErrorId} role="alert" className="field-shell__error">
          {groupError}
        </p>
      )}
      {PAYER_TYPES.map((payer) => (
        <div key={payer.suffix} className="payer-row">
          <h3 className="payer-row__label">{payer.label}</h3>
          <div aria-describedby={groupError ? groupErrorId : undefined}>
            <FieldRenderer path={`advanced.A.payerMixSharePct.${payer.suffix}`} />
          </div>
          <FieldRenderer path={`advanced.A.billedTariffByPayerType.${payer.suffix}`} />
          <FieldRenderer path={`advanced.A.realizationPctByPayerType.${payer.suffix}`} />
          <FieldRenderer path={`advanced.A.claimDeductionPctByPayerType.${payer.suffix}`} />
          <FieldRenderer path={`advanced.A.collectionDelayDaysByPayerType.${payer.suffix}`} />
        </div>
      ))}
    </fieldset>
  );
}
