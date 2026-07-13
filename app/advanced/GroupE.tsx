"use client";

// Group E — Maintenance and lifecycle cost (SPEC.md §11.1 E).

import { FieldRenderer } from "../components/FieldRenderer";
import { MaintenanceScheduleFields } from "./MaintenanceScheduleFields";

export function GroupE() {
  return (
    <fieldset className="advanced-group">
      <legend>E. Maintenance and lifecycle cost</legend>
      <FieldRenderer path="advanced.E.cmcYears" />
      <MaintenanceScheduleFields />
      <FieldRenderer path="advanced.E.maintenanceInflationPct" />
      <FieldRenderer path="advanced.E.majorReplacementCost" />
    </fieldset>
  );
}
