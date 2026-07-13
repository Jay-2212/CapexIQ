"use client";

// Group F — Financial model assumptions (SPEC.md §11.1 F). taxAssumptions and
// scenarioAssumptions are reserved/structural (not real controls in v1 — see
// content/inputs-metadata.json's own notes) and intentionally not rendered here.

import { FieldRenderer } from "../components/FieldRenderer";

export function GroupF() {
  return (
    <fieldset className="advanced-group">
      <legend>F. Financial model assumptions</legend>
      <FieldRenderer path="advanced.F.discountRate" />
      <FieldRenderer path="advanced.F.targetIrr" />
      <FieldRenderer path="advanced.F.inflationRate" />
      <FieldRenderer path="advanced.F.usefulLifeYears" />
      <FieldRenderer path="advanced.F.salvageValuePercentage" />
      <FieldRenderer path="advanced.F.priceEscalationPct" />
      <FieldRenderer path="advanced.F.costEscalationPct" />
    </fieldset>
  );
}
