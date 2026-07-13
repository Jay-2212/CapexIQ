"use client";

// The Advanced Mode panel — collapsed by default, attached to Step 3 (wizard-state.md
// §1.1/§1.2, Phase 4-F). Entered values persist across collapse/expand because they
// live in the same top-level reducer state as Basic values, not a second tree that
// gets torn down (§3) — this component only ever toggles visibility.

import { useId } from "react";
import { useWizard } from "../forms/WizardContext";
import { GroupA } from "./GroupA";
import { GroupB } from "./GroupB";
import { GroupC } from "./GroupC";
import { GroupD } from "./GroupD";
import { GroupE } from "./GroupE";
import { GroupF } from "./GroupF";

export function AdvancedPanel() {
  const { state, dispatch } = useWizard();
  const panelId = useId();

  return (
    <div className="advanced-panel">
      {/* Preview banner — content/field-explanations.md's exact copy, always visible
          above the toggle regardless of open/closed state. */}
      <p className="advanced-panel__banner">
        This first-pass view is based on billed revenue. Open Advanced Financial
        Assumptions to model payer mix &amp; realization, utilization ramp-up,
        financing/EMI, launch delay &amp; pre-opening cost, maintenance/lifecycle
        cost, and discount rate/depreciation/tax assumptions.
      </p>
      <button
        type="button"
        className="advanced-panel__toggle"
        aria-expanded={state.advancedOpen}
        aria-controls={panelId}
        onClick={() => dispatch({ type: "TOGGLE_ADVANCED" })}
      >
        {state.advancedOpen ? "Hide Advanced Mode" : "Open Advanced Mode"}
      </button>
      {state.advancedOpen && (
        <div id={panelId} className="advanced-panel__groups">
          <GroupA />
          <GroupB />
          <GroupC />
          <GroupD />
          <GroupE />
          <GroupF />
        </div>
      )}
    </div>
  );
}
