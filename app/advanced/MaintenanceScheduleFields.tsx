"use client";

// AMC/CMC cost by year — the one field whose length depends on another field's value
// (advanced.F.usefulLifeYears), so it uses the reducer's dedicated
// SET_MAINTENANCE_SCHEDULE_YEAR action rather than the generic dotted-path setter
// (wizard-state.md §5). Optional stepped-schedule override of
// basic.amcCmcCostPostWarranty — not yet consumed by the canonical pipeline (see
// toAssessmentInputs.ts), collected here for a future pass.

import { useWizard } from "../forms/WizardContext";

export function MaintenanceScheduleFields() {
  const { state, dispatch } = useWizard();
  const years = state.advanced.E.maintenanceCostByYearPct;

  if (years.length === 0) {
    return (
      <p className="advanced-group__hint">
        Set Useful life (Group F) to enter a year-by-year maintenance schedule.
      </p>
    );
  }

  return (
    <div className="maintenance-schedule">
      <p className="field-shell__label">AMC / CMC cost by year (% of purchase cost)</p>
      <div className="maintenance-schedule__grid">
        {years.map((value, index) => (
          <label key={index} className="maintenance-schedule__year">
            <span>Yr {index + 1}</span>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={value ?? ""}
              onChange={(event) => {
                const raw = event.target.value;
                dispatch({
                  type: "SET_MAINTENANCE_SCHEDULE_YEAR",
                  yearIndex: index,
                  value: raw === "" ? null : Number(raw),
                });
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
