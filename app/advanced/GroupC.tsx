"use client";

// Group C — Financing (SPEC.md §11.1 C). requiredIf fields (downPayment,
// loanInterestRate, loanTenureMonths, leaseRentalPerMonth, leaseTenureMonths) read
// acquisitionMode from /assess/investment's state regardless of which step set it
// (wizard-state.md §1.2's cross-step conditional requiredness) — useFieldController
// already resolves this via isFieldRequired(), so this component doesn't special-case
// it.

import { useWizard } from "../forms/WizardContext";
import { FieldRenderer } from "../components/FieldRenderer";

export function GroupC() {
  const { state } = useWizard();
  const mode = state.basic.acquisitionMode;

  return (
    <fieldset className="advanced-group">
      <legend>C. Financing</legend>
      {mode === "Cash" && (
        <p className="advanced-group__hint">
          Cash purchase — these fields only apply if you switch Acquisition mode to
          Loan or Lease on the Investment step.
        </p>
      )}
      {mode !== "Lease" && (
        <>
          <FieldRenderer path="advanced.C.downPayment" />
          <FieldRenderer path="advanced.C.loanInterestRate" />
          <FieldRenderer path="advanced.C.loanTenureMonths" />
          <FieldRenderer path="advanced.C.processingChargesPct" />
          <FieldRenderer path="advanced.C.emiStartMonth" />
          <FieldRenderer path="advanced.C.moratoriumPeriodMonths" />
        </>
      )}
      {mode === "Lease" && (
        <>
          <FieldRenderer path="advanced.C.leaseRentalPerMonth" />
          <FieldRenderer path="advanced.C.leaseTenureMonths" />
        </>
      )}
    </fieldset>
  );
}
