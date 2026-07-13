"use client";

// Group B — Utilization ramp-up (SPEC.md §11.1 B). Collected for a future ramp-aware
// pipeline — see toAssessmentInputs.ts's header comment: the canonical pipeline
// currently assumes flat mature usage from day one, matching this project's existing
// pattern of collecting fields ahead of the formula that will consume them (e.g.
// inflationRate). Flagged in HANDOFF.md's Phase 6 entry, not silently incomplete.

import { RAMP_PERIODS } from "../forms/payerAndRampKeys";
import { FieldRenderer } from "../components/FieldRenderer";

export function GroupB() {
  return (
    <fieldset className="advanced-group">
      <legend>B. Utilization ramp-up</legend>
      {RAMP_PERIODS.map((ramp) => (
        <FieldRenderer key={ramp.suffix} path={`advanced.B.utilizationRampPct.${ramp.suffix}`} />
      ))}
      <FieldRenderer path="advanced.B.expectedMatureUtilization" />
    </fieldset>
  );
}
