"use client";

// Group D — Launch delay and pre-opening cost (SPEC.md §11.1 D).

import { FieldRenderer } from "../components/FieldRenderer";

export function GroupD() {
  return (
    <fieldset className="advanced-group">
      <legend>D. Launch delay and pre-opening cost</legend>
      <FieldRenderer path="advanced.D.civilWorkDurationMonths" />
      <FieldRenderer path="advanced.D.installationDurationMonths" />
      <FieldRenderer path="advanced.D.licensingApprovalDurationMonths" />
      <FieldRenderer path="advanced.D.trainingCommissioningDurationMonths" />
      <FieldRenderer path="advanced.D.preOpeningFixedCosts" />
      <FieldRenderer path="advanced.D.workingCapitalBufferAmount" />
    </fieldset>
  );
}
