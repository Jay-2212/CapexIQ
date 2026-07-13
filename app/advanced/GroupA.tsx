"use client";

import { useId } from "react";
import { useWizard } from "../forms/WizardContext";
import { useFieldController } from "../forms/useFieldController";
import { PAYER_TYPES } from "../forms/payerAndRampKeys";
import { payerMixGroupError } from "../forms/wizardValidation";

function CompactNumber({ path, label }: { path: string; label: string }) {
  const field = useFieldController(path);
  return (
    <input
      type="number"
      aria-label={label}
      value={field.value ?? ""}
      min={0}
      className="payer-table__input"
      data-invalid={field.error !== null}
      onChange={(event) => field.setValue(event.target.value === "" ? null : Number(event.target.value))}
    />
  );
}

export function GroupA() {
  const { state } = useWizard();
  const groupErrorId = useId();
  // ISS-25: same reveal-gating as any other field — don't show the group-sum error
  // until the user has actually touched one of this group's own share sliders, or
  // attempted to advance past this step while it was incomplete.
  const groupTouched = PAYER_TYPES.some(
    (payer) => state.touched[`advanced.A.payerMixSharePct.${payer.suffix}`] === true
  );
  const groupAttempted = state.attemptedSteps.costs === true;
  const groupError =
    groupTouched || groupAttempted ? payerMixGroupError(state) : null;

  return (
    <fieldset className="advanced-group">
      <legend>Revenue realization and payer mix</legend>
      <div className="payer-table-wrap">
        <table className="payer-table">
          <thead><tr><th>Payer</th><th>Mix %</th><th>Tariff ₹</th><th>Realized %</th><th>Deduction %</th><th>Collection days</th></tr></thead>
          <tbody>
            {PAYER_TYPES.map((payer) => (
              <tr key={payer.suffix}>
                <th scope="row">{payer.label}</th>
                <td><CompactNumber path={`advanced.A.payerMixSharePct.${payer.suffix}`} label={`${payer.label} mix percentage`} /></td>
                <td><CompactNumber path={`advanced.A.billedTariffByPayerType.${payer.suffix}`} label={`${payer.label} billed tariff`} /></td>
                <td><CompactNumber path={`advanced.A.realizationPctByPayerType.${payer.suffix}`} label={`${payer.label} realization percentage`} /></td>
                <td><CompactNumber path={`advanced.A.claimDeductionPctByPayerType.${payer.suffix}`} label={`${payer.label} claim deduction percentage`} /></td>
                <td><CompactNumber path={`advanced.A.collectionDelayDaysByPayerType.${payer.suffix}`} label={`${payer.label} collection delay in days`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="payer-table__footer">
        <p>Use the share of patient volume, not revenue. The mix should total 100%.</p>
        {groupError && <p id={groupErrorId} role="alert" className="field-shell__error">{groupError}</p>}
      </div>
    </fieldset>
  );
}
